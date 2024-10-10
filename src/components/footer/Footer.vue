<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { use_records } from '../../lib/records';
import { storeToRefs } from 'pinia';
import MidChat from '../mid_chat/MidChat.vue';
import { iphone_view } from '../../lib/iphone_view';
import { mode } from '../../lib/mode';
import { simcanvas } from '../../lib/canvas';

const playing = ref(false);
const time = ref(0);
const frame = computed({
    get: () => {
        let frame = current_record.value?.get_frame_from_time(time.value / 1000);
        if (frame !== undefined) {
            let frame_time = current_record.value?.get_frame_time(frame);
            if (frame_time !== undefined) {
                iphone_view.draw_from_video(frame_time);
                if (simcanvas.cube && current_record.value?.pose) {
                    let m = current_record.value?.pose[frame].data;
                    m.decompose(simcanvas.cube.position, simcanvas.cube.quaternion, simcanvas.cube.scale);
                }
            }
                
        }
        return frame
    },
    set: (val) => {
        playing.value = false;
        if (current_record.value !== undefined && frame.value !== undefined && val !== undefined) {
            let t = current_record.value.get_frame_time(val);
            if (t !== undefined) {
                time.value = t * 1000;
            }
        }
    }
});

watch(time, async () => {
    if (current_record.value?.max_time) {
        if (current_record.value.max_time < time.value / 1000 && playing.value) {
            playing.value = false;
            time.value = current_record.value.max_time * 1000;
        }
    }
})

onMounted(() => {
    let last = Date.now();
    function animate() {
        let now = Date.now();
        let delta = now - last;
        if (playing.value) {
            time.value += delta;
        }
        last = now;
        requestAnimationFrame(animate);
    }
    animate();
});

const handle_goto_start = () => {
    playing.value = false;
    time.value = 0;
}

const handle_goto_prev_frame = () => {
    playing.value = false;
    if (current_record.value !== undefined && frame.value !== undefined) {
        let t = current_record.value.get_frame_time(frame.value - 1);
        if (t !== undefined) {
            time.value = t * 1000;
        }
    }
}

const handle_goto_next_frame = () => {
    playing.value = false;
    if (current_record.value !== undefined && frame.value !== undefined) {
        let t = current_record.value.get_frame_time(frame.value + 1);
        if (t !== undefined) {
            time.value = t * 1000;
        }
    }
}

const handle_goto_end = () => {
    playing.value = false;
    if (current_record.value?.max_time) {
        time.value = current_record.value?.max_time * 1000;
    }
}

const recordsStore = use_records();
const { records, current_id } = storeToRefs(recordsStore);

const current_record = computed(() => {
    return records.value.find((r) => r.uuid == current_id.value);
});

const current_clip_id = ref("");
const current_clip = computed(() => {
    if (current_record.value)
        return current_record.value?.clips.find((c) => c.uuid == current_clip_id.value);
})

const current_clip_description = computed({
    get: () => current_clip.value?.description,
    set: (value) => {
        let clip = records.value.find((r) => r.uuid == current_id.value)?.clips.find((c) => c.uuid == current_clip_id.value);
        if (clip && value) {
            clip.description = value;
        }
    }
});

const current_clip_start = computed({
    get: () => current_clip.value?.start,
    set: (value) => {
        let clip = records.value.find((r) => r.uuid == current_id.value)?.clips.find((c) => c.uuid == current_clip_id.value);
        if (clip && value) {
            clip.start = value;
        }
    }
});

const current_clip_end = computed({
    get: () => current_clip.value?.end,
    set: (value) => {
        let clip = records.value.find((r) => r.uuid == current_id.value)?.clips.find((c) => c.uuid == current_clip_id.value);
        if (clip && value) {
            clip.end = value;
        }
    }
});

const record_description = computed({
    get: () => current_record.value?.description,
    set: (value) => {
        let record = records.value.find((r) => r.uuid == current_id.value);
        if (record && value) {
            record.description = value;
        }
    }
});

const show_clips = ref(false);

const handle_add_clip = () => {
    current_record.value?.add_clip(0, 100, "a new clip");
}

const handle_open_clip = (uuid: string) => {
    current_clip_id.value = uuid;
    show_clips.value = false;
}

const handle_delete_clip = (uuid: string) => {
    let number = current_record.value?.clips.findIndex((c) => c.uuid == uuid);
    if (number !== undefined) {
        current_record.value?.clips.splice(number, 1);
    }
}

const handle_save = () => {
    if (current_record.value) {
        current_record.value.save();
    }
}

</script>

<template>
    <div v-if="current_record && mode==='Editing'" class="w-screen">
        <div class="max-w-screen-2xl m-auto">
            <div class="m-4 p-4 rounded-xl bg-base-100 space-y-4">
                <div class="flex items-center">
                    <div>
                        <div> 
                            <button class="btn btn-sm btn-ghost" @click="handle_goto_start">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M21 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061A1.125 1.125 0 0 1 21 8.689v8.122ZM11.25 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061a1.125 1.125 0 0 1 1.683.977v8.122Z" />
                                </svg>
                            </button>

                            <button class="btn btn-sm btn-ghost" @click="handle_goto_prev_frame">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M15.75 19.5 8.25 12l7.5-7.5" />
                                </svg>
                            </button>

                            <button class="btn btn-sm btn-ghost" @click="playing = !playing">
                                <svg v-if="playing" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                                </svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                                </svg>
                            </button>

                            <button class="btn btn-sm btn-ghost" @click="handle_goto_next_frame">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>

                            <button class="btn btn-sm btn-ghost" @click="handle_goto_end">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
                                </svg>
                            </button>
                        </div>
                        <div class=" font-mono text-center mt-4">
                            {{ (time / 1000).toFixed(3) }}s / {{ current_record.max_time?.toFixed(3) }}s
                        </div>
                        <div class=" font-mono text-center mt-4">
                            {{ frame }} / {{ current_record.max_frame }}
                        </div>
                    </div>

                    <div class="flex-1 mx-4">
                        <div v-if="current_clip" class=" flex space-x-4 justify-between items-center">
                            <div class="badge badge-primary font-mono font-bold"> {{ current_clip?.badge }}</div>
                            <label className="form-control w-full max-w-xs">
                                <div className="label">
                                    <span className="label-text">Clip Description</span>
                                </div>
                                <input type="text" className="input input-bordered input-sm w-full max-w-xs"
                                    v-model="current_clip_description" />
                            </label>

                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text">Start</span>
                                </div>
                                <input type="number" className="input input-bordered input-sm w-32"
                                    v-model="current_clip_start" />
                            </label>

                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text">End</span>
                                </div>
                                <input type="number" className="input input-bordered input-sm w-32"
                                    v-model="current_clip_end" />
                            </label>
                        </div>
                        <div v-if="current_clip" class="mt-4">
                            <input type="range" min="0" :max="current_record.max_frame" class="range"
                                v-model="current_clip_start" />
                            <input type="range" min="0" :max="current_record.max_frame" class="range"
                                v-model="current_clip_end" />
                        </div>
                        <div class="">
                            <input type="range" min="0" :max="current_record.max_frame" class="range" v-model="frame" />
                        </div>
                    </div>

                    <div class="space-y-4 text-center">
                        <div class="badge badge-primary font-mono font-bold">
                            <div>{{ current_record?.badge }}</div>
                        </div>
                        <div>
                            <button class="btn w-20" @click="show_clips = true">
                                Clips
                            </button>
                        </div>
                    </div>

                    <div class="ml-4">
                        <label class="form-control">
                            <div class="label">
                                <span class="label-text">Record Description</span>
                            </div>
                            <textarea class="textarea textarea-bordered h-24 resize-none"
                                v-model="record_description"></textarea>
                        </label>
                    </div>
                    <button class="ml-4 btn btn-primary" @click="handle_save()">
                        save
                    </button>
                </div>
            </div>
        </div>
    </div>
    <MidChat :title="`Clips(${current_record?.clips.length})`" :show="show_clips" @update:show="show_clips = false">
        <div class="overflow-x-auto max-h-96 h-96">
            <table class="table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Description</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Open</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="c in current_record?.clips">
                        <th>
                            <div class="badge badge-primary font-mono font-bold">
                                {{ c?.badge }}
                            </div>
                        </th>
                        <td>
                            <input type="text" className="input input-bordered input-sm w-full max-w-xs"
                                v-model="c.description" />
                        </td>
                        <td>{{ c.start }}</td>
                        <td>{{ c.end }}</td>
                        <td>
                            <button class="btn" @click="handle_open_clip(c.uuid)">
                                open
                            </button>
                        </td>
                        <td>
                            <button class="btn btn-circle btn-xs" @click="handle_delete_clip(c.uuid)">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke-width="1.5" stroke="currentColor" class="size-6 text-red-400">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <button class="btn btn-primary btn-block" @click="handle_add_clip">Add Clip</button>
    </MidChat>
</template>

<style scoped></style>