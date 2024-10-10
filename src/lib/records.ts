import JSZip from 'jszip';
import { defineStore } from 'pinia';
import { Matrix4 } from "three";
import { v4 as uuidv4 } from 'uuid';
import { ref, watch } from 'vue';
import { iphone_view } from './iphone_view';


export interface DataFrame<Data> {
    data: Data;
    time: number;
}

function stringToData<Data>(text: string, callback: (raw: string[]) => Data): DataFrame<Data>[] {
    let lines = text.split("\n");
    lines.splice(0, 1);
    let time_line: DataFrame<Data>[] = [];
    for (const line of lines) {
        let [time, ...rest] = line.split(",");
        let t = parseFloat(time);
        if (isNaN(t)) {
            continue
        }
        time_line.push({
            data: callback(rest),
            time: t
        });
    }
    return time_line;
}

export class Clip {
    start: number;
    end: number;
    description: string;
    readonly uuid: string;
    constructor(start: number, end: number, description: string) {
        this.start = start;
        this.end = end;
        this.description = description;
        this.uuid = uuidv4();
    }

    get badge() {
        return this.uuid.slice(0, 6);
    }
}

export class Record {
    readonly uuid: string = uuidv4();
    file: FileSystemFileHandle;
    zip?: JSZip;
    angle?: DataFrame<number>[];
    r_force?: DataFrame<number[]>[];
    l_force?: DataFrame<number[]>[];
    pose?: DataFrame<Matrix4>[];
    depth?: Uint16Array[];
    depth_files: { file: ArrayBuffer, time: number }[] = [];
    rgb?: Blob;
    audio?: Blob;
    description: string = "";
    metadata: {
        clips: Clip[];
    } = {
            clips: []
        };
    clips: Clip[] = [];

    constructor(zipfile: FileSystemFileHandle) {
        this.file = zipfile;
    }

    async decompress() {
        let file = await this.file.getFile();
        let zip = await JSZip.loadAsync(file);
        this.zip = zip;

        let prefix = this.file.name.split(".")[0] + "/";
        // console.log(prefix);
        this.rgb = await zip.file(prefix + "RGB.mp4")?.async("blob");

        // const config = {
        //     codec: "vp8",
        //     codedWidth: 640,
        //     codedHeight: 480,
        // };

        // const { supported } = await VideoDecoder.isConfigSupported(config);
        // if (supported) {
        //     const decoder = new VideoDecoder({
        //         output: (frame) => {
        //             console.log(frame);
        //         },
        //         error: (e) => {
        //             console.log(e.message);
        //         },
        //     });
        //     decoder.configure(config);
        //     let video_buffer = await zip.file(prefix + "_RGB.mp4")?.async("arraybuffer");
        //     if (video_buffer)
        //         decoder.decode(new EncodedVideoChunk({ type: "key", data: video_buffer, timestamp: 0 }));
        // } else {
        //     // Try another config.
        // }



        let f = zip.file(prefix + "L_ForceData.csv");
        if (f) this.l_force = stringToData(await f.async("text"), (raw) => raw.map((v) => parseFloat(v)));

        f = zip.file(prefix + "R_ForceData.csv");
        if (f) this.r_force = stringToData(await f.async("text"), (raw) => raw.map((v) => parseFloat(v)));

        f = zip.file(prefix + "AngleData.csv");
        if (f) this.angle = stringToData(await f.async("text"), (raw) => parseFloat(raw[0]));

        f = zip.file(prefix + "PoseData.csv");
        if (f) this.pose = stringToData(await f.async("text"), (raw) => new Matrix4().fromArray(raw.map((v) => parseFloat(v))));

        let dir = zip.folder(prefix + "Depth");
        if (dir) {
            
            // sort files by time
            let files: { file: ArrayBuffer, time: number }[] = [];
            dir.forEach(async (path, f) => {
                let end = path.split("_")[1];
                let time = parseFloat(end.slice(0, -4));
                files.push({ file: await f.async("arraybuffer"), time: time });
            })
            files.sort((a, b) => {
                return a.time - b.time;
            });
            this.depth_files = files;
            let depth: Uint16Array[] = [];
            for (let i = 0; i < this.depth_files.length; i++) {
                let data = new Uint16Array(this.depth_files[i].file);
                depth.push(data);
            }
            this.depth = depth;
        }

        f = zip.file(prefix + "metadata.json");
        if (f) {
            let metadata = JSON.parse(await f.async("text"));
            this.metadata = metadata;

            // load clips
            if (metadata.clips) {
                this.clips = metadata.clips.map((c: { start: number, end: number, description: string }) => {
                    return new Clip(c.start, c.end, c.description);
                })
            }
        }

        f = zip.file(prefix + "Audio.m4a");
        if (f) {
            this.audio = await f.async("blob");
        }
    }

    get create_time() {
        return new Date(`${this.file.name.slice(0, 4)}/${this.file.name.slice(4, 6)}/${this.file.name.slice(6, 8)} ${this.file.name.slice(9, 11)}:${this.file.name.slice(11, 13)}:${this.file.name.slice(13, 15)}`);
    }

    add_clip(start: number, end: number, description: string) {
        this.clips.push(new Clip(start, end, description));
    }

    get badge() {
        return this.uuid.slice(0, 6);
    }

    get_frame_time(frame: number) {
        if (this.pose) {
            let pose = this.pose[frame]
            if (pose)
                return pose.time
        }
    }

    get_frame_from_time(time: number) {
        let interval = this.frame_interval;

        if (interval && this.pose) {
            let frame = Math.floor(time / interval);
            if (frame == this.max_frame) {
                frame -= 2;
            }
            // estimate frame big
            while (true) {
                let prev_pose = this.pose[frame];
                let next_pose = this.pose[frame + 1];
                if (prev_pose && next_pose === undefined) {
                    return this.max_frame
                }
                if (prev_pose && next_pose) {
                    let prev = prev_pose.time;
                    let next = next_pose.time;
                    if (prev <= time && (time < next || next === undefined)) {
                        return frame
                    } else if (next <= time) {
                        frame += 1;
                        continue
                    } else if (time < prev) {
                        frame -= 1;
                        continue
                    }
                } else {
                    return this.max_frame
                }

            }
        }
    }

    get max_frame() {
        if (this.pose) {
            return this.pose.length - 1
        }
    }

    get max_time() {
        if (this.pose) {
            let pose = this.pose[this.pose.length - 1]
            if (pose)
                return pose.time
        }
    }

    get frame_interval() {
        if (this.pose) {
            let pose0 = this.pose[0]
            let pose1 = this.pose[1]
            if (pose1 && pose1)
                return pose1.time - pose0.time
        }
    }

    save() {
        this.metadata.clips = this.clips;
        let metadata = JSON.stringify(this.metadata);

        let zip = new JSZip();
        let prefix = this.file.name.split(".")[0] + "/";
        zip.file(prefix + "metadata.json", metadata);
        zip.file(prefix + "RGB.mp4", this.rgb);
        if (this.audio) {
            zip.file(prefix + "Audio.m4a", this.audio);
        }
        if (this.pose) {
            let pose = this.pose.map((p) => {
                return p.time + "," + p.data.toArray().join(",") + "\n";
            });
            zip.file(prefix + "PoseData.csv", "time," + pose.join(""));
        }
        if (this.angle) {
            let angle = this.angle.map((p) => {
                return p.time + "," + p.data + "\n";
            });
            zip.file(prefix + "AngleData.csv", "time," + angle.join(""));
        }
        if (this.r_force) {
            let r_force = this.r_force.map((p) => {
                return p.time + "," + p.data.join(",") + "\n";
            });
            zip.file(prefix + "R_ForceData.csv", "time," + r_force.join(""));
        }
        if (this.l_force) {
            let l_force = this.l_force.map((p) => {
                return p.time + "," + p.data.join(",") + "\n";
            });
            zip.file(prefix + "L_ForceData.csv", "time," + l_force.join(""));
        }
        if (this.depth) {
            let dir = zip.folder(prefix + "Depth");
            if (dir) {
                for (let i = 0; i < this.depth_files.length; i++) {
                    dir.file(`depth_${this.depth_files[i].time}.bin`, this.depth_files[i].file);
                }
            }
        }
        zip.generateAsync({ type: "blob" }).then((blob) => {
            // download blob
            let a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = this.file.name.split(".")[0] + "_m.magiclaw";
            a.click();
        });
    }
}

export const use_records = defineStore("record", () => {
    const records = ref<Record[]>([])
    const current_id = ref("");
    watch(current_id, () => {
        let r = records.value.find((r) => r.uuid == current_id.value);
        if (r && r.rgb) {
            iphone_view.load_video(r.rgb)
        }
    })
    return { records, current_id }
})
