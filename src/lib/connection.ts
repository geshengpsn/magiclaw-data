import { ref } from "vue"
import { defineStore } from 'pinia'
import { Matrix4 } from "three"
import { simcanvas } from "./canvas"
import { iphone_view } from "./iphone_view"

export const use_iphone_ws = defineStore("iphone_ws", () => {
    const status = ref(-1)
    const ip = ref('192.168.5.12')
    const ws = ref<WebSocket | null>(null)
    function connect() {
        ws.value = new WebSocket(`ws://${ip.value}:8080`)
        ws.value.onopen = () => {
            status.value = ws.value?.readyState || -1
            console.log('connected')
        }
        ws.value.onclose = () => {
            status.value = ws.value?.readyState || -1
            console.log('disconnected')
        }
        ws.value.onerror = (err) => {
            status.value = ws.value?.readyState || -1
            console.error(err)
        }
        ws.value.addEventListener("message", (msg: MessageEvent<Blob>) => {
            status.value = ws.value?.readyState || -1
            const m = msg.data.slice(0, 64);
            const img = msg.data.slice(64);
            iphone_view.draw(img);
            m.arrayBuffer().then((buf) => {
                let m = new Matrix4().fromArray(new Float32Array(buf));
                if (simcanvas.cube)
                    m.decompose(simcanvas.cube.position, simcanvas.cube.quaternion, simcanvas.cube.scale);
            });
        })
    }

    return { ip, status, connect }
})

export const use_box_ws = defineStore("box_ws", () => {
    const status = ref(-1)
    const ip = ref('192.168.5.12')
    const ws = ref<WebSocket | null>(null)
    function connect() {
        ws.value = new WebSocket(`ws://${ip.value}:8080`)
        ws.value.onopen = () => {
            status.value = ws.value?.readyState || -1
            console.log('connected')
        }
        ws.value.onclose = () => {
            status.value = ws.value?.readyState || -1
            console.log('disconnected')
        }
        ws.value.onerror = (err) => {
            status.value = ws.value?.readyState || -1
            console.error(err)
        }
        ws.value.addEventListener("message", () => {
            status.value = ws.value?.readyState || -1
        })
    }

    return { ip, status, connect }
})
