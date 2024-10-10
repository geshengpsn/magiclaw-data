<script setup lang="ts">

const props = defineProps({
    status: {
        type: Number,
        required: true,
    },
    id: {
        type: String,
        required: true,
    },
});

const ip = defineModel<String>({ required: true });

const connect = defineEmits(['connect']);

</script>

<template>
    <div class="flex space-x-4 items-center justify-between">
        <div class=" flex-1 flex items-center space-x-4">
            <span className="loading loading-spinner" v-if="props.status === 0"></span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                stroke="currentColor" class="size-6 text-green-400" v-else-if="props.status === 1">
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9.348 14.652a3.75 3.75 0 0 1 0-5.304m5.304 0a3.75 3.75 0 0 1 0 5.304m-7.425 2.121a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                stroke="currentColor" class="size-6 text-red-400" v-else>
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="m3 3 8.735 8.735m0 0a.374.374 0 1 1 .53.53m-.53-.53.53.53m0 0L21 21M14.652 9.348a3.75 3.75 0 0 1 0 5.304m2.121-7.425a6.75 6.75 0 0 1 0 9.546m2.121-11.667c3.808 3.807 3.808 9.98 0 13.788m-9.546-4.242a3.733 3.733 0 0 1-1.06-2.122m-1.061 4.243a6.75 6.75 0 0 1-1.625-6.929m-.496 9.05c-3.068-3.067-3.664-7.67-1.79-11.334M12 12h.008v.008H12V12Z" />
            </svg>
            <label class="input input-bordered flex items-center gap-2">
                {{ props.id }}
                <input type="text" class="grow" placeholder="192.168.x.x" v-model="ip" :disabled="props.status === 0" />
            </label>
        </div>

        <button :class="`btn ${props.status === 0 ? 'btn-disabled' : ''}`" @click="() => {
            connect('connect');
        }">
            connect
        </button>
    </div>
</template>

<style scoped></style>