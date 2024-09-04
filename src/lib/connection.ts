import { Ref, ref } from "vue"
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
            // this first 64 bytes are the matrix
            const m = msg.data.slice(0, 64);
            const img = msg.data.slice(64);
            iphone_view.draw(img);
            m.arrayBuffer().then((buf) => {
                let m = new Matrix4().fromArray(new Float32Array(buf));
                if (simcanvas.cube)
                    m.decompose(simcanvas.cube.position, simcanvas.cube.quaternion, simcanvas.cube.scale);
                // console.log(simcanvas.cube?.position);
            });
            // the rest is the image
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

export class Connection {
    ip: Ref<string> = ref("192.168.0.1")
    port: Ref<number> = ref(8080)
    ws?: WebSocket
    status = ref(-1);
    type: Ref<string>
    constructor(type: string) {
        this.type = ref(type);
    }

    connect() {
        this.ws = new WebSocket(`ws://${this.ip.value}:${this.port.value}`);

        this.ws.onopen = () => {
            this.status.value = this.ws?.readyState || -1;
            console.log("connected to iphone");
        };

        this.ws.onclose = () => {
            this.status.value = this.ws?.readyState || -1;
            console.log("disconnected from iphone");
        };

        this.ws.onerror = (err) => {
            this.status.value = this.ws?.readyState || -1;
            console.error(err);
        };

        this.ws.onmessage = (msg) => {
            this.status.value = this.ws?.readyState || -1;
            console.log(msg.data);
        };
    }
}

// const iphone_ws: WebSocket | null = null;
// const box_ws: WebSocket | null = null;

// const iphone_status = ref(-1);
// const box_status = ref(-1);

export const iphone_connection = new Connection("iphone");
export const box_connection = new Connection("box");