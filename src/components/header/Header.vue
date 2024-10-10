<script setup lang="ts">
import WsConnect from './WsConnect.vue';
import MidChat from '../mid_chat/MidChat.vue';
import { use_iphone_ws, use_box_ws } from "../../lib/connection"
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { Record, use_records } from '../../lib/records';
import { mode } from '../../lib/mode';

const recordsStore = use_records();
const { records: records, current_id } = storeToRefs(recordsStore);

const iphone_ws = use_iphone_ws();
const box_ws = use_box_ws();

const { ip: iphone_ip, status: iphone_status } = storeToRefs(iphone_ws);
const { ip: box_ip, status: box_status } = storeToRefs(box_ws);

const show_connection = ref(false);
const load_data = ref(false);

const handle_open_file = () => {
    showOpenFilePicker({
        types: [{
            description: 'MagiClaw Record Files',
            accept: {
                'blob/magiclaw': ['.magiclaw']
            }
        }]
    }).then((file) => {
        let record = new Record(file[0]);
        record.decompress().then(() => {
            records.value.push(record);
        }).catch((err) => {
            console.error(err);
        });
    });
}

const handle_open_record = (uuid: string) => {
    current_id.value = uuid;
    load_data.value = false;
}

</script>

<template>
    <div class="m-4 p-2 rounded-xl bg-base-100 flex items-center space-x-2">
        <button class="btn btn-ghost">MagiClaw</button>
        <div class="divider divider-horizontal"></div>
        <select className="select select-primary w-full max-w-xs" v-model="mode">
            <option disabled selected>Mode</option>
            <option>Teleoperate</option>
            <option>Editing</option>
        </select>
        <button v-if="mode==='Teleoperate'" class="btn btn-ghost" @click="show_connection = true">connection</button>
        <button v-if="mode==='Editing'" class="btn btn-ghost" @click="load_data = true">load data</button>
    </div>

    <MidChat :show="show_connection" title="Connection" @update:show="show_connection = false">
        <WsConnect id="iphone" :status="iphone_status" v-model="iphone_ip" @connect="() => {
            iphone_ws.connect();
        }" />
        <WsConnect id="box" :status="box_status" v-model="box_ip" @connect="() => {
            box_ws.connect();
        }" />
    </MidChat>

    <MidChat :show="load_data" title="Data" @update:show="load_data = false">
        <button class=" btn btn-primary btn-lg btn-block" @click="handle_open_file">
            load data from this computer
        </button>
        <div class="overflow-x-auto">
            <table class="table table-lg">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Name</th>
                        <!-- <th>RGB Size</th> -->
                        <!-- <th>Depth Size</th> -->
                        <th>Pose</th>
                        <th>Left Finger Force</th>
                        <th>Right Finger Force</th>
                        <th>Angle</th>
                        <th>Clips</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="r in records" key={record.uuid} class="hover cursor-pointer"
                        @click="handle_open_record(r.uuid)">
                        <th>
                            <div className="badge badge-primary">{{ r.badge }}</div>
                        </th>
                        <td>{{ r?.file.name }}</td>
                        <!-- <td>{{(recordref?.rgb.size / 1000000).toFixed(1)}}MB</td> -->
                        <!-- <td>{{(recordref?.depth.length * 256 * 192 * 2 / 1000000).toFixed(1)}} MB</td> -->
                        <td>{{ r?.pose?.length }}</td>
                        <td>{{ r?.l_force?.length }}</td>
                        <td>{{ r?.r_force?.length }}</td>
                        <td>{{ r?.angle?.length }}</td>
                        <td>{{ r?.clips.length }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </MidChat>
</template>

<style scoped></style>