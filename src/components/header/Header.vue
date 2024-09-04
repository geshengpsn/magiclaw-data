<script setup lang="ts">
import WsConnect from './WsConnect.vue';
import { use_iphone_ws, use_box_ws } from "../../lib/connection"
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

const iphone_ws = use_iphone_ws();
const box_ws = use_box_ws();
const { ip: iphone_ip, status: iphone_status } = storeToRefs(iphone_ws);
const { ip: box_ip, status: box_status } = storeToRefs(box_ws);
const show_connection = ref(false);

</script>

<template>
    <div class="m-4 p-2 rounded-xl bg-base-100 flex items-center">
        <button class="btn btn-ghost">MagiClaw</button>
        <div class="divider divider-horizontal"></div>
        <button class="btn btn-ghost" @click="show_connection=true">connection</button>
    </div>

    <div v-if="show_connection" class=" fixed top-0 left-0 w-screen h-screen flex justify-center">
        <div class="flex flex-col justify-center">
            <div class=" rounded-xl p-8 bg-base-100 space-y-8">
                <div class=" text-2xl">
                    Connection
                </div>
                <WsConnect id="iphone" :status="iphone_status" v-model="iphone_ip" @connect="() => {
                    iphone_ws.connect();
                }" />
                <WsConnect id="box" :status="box_status" v-model="box_ip" @connect="() => {
                    box_ws.connect();
                }" />
                <div class=" flex flex-row-reverse">
                    <button class=" btn btn-primary" @click="show_connection=false">
                        close
                    </button>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped></style>