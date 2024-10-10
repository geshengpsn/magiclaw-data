class IphoneView {
    canvas?: HTMLCanvasElement
    ctx: CanvasRenderingContext2D | null = null
    video_url?: string;
    video_html?: HTMLVideoElement;
    decoder?: VideoDecoder;
    init(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.ctx = this.canvas?.getContext("2d");
        this.canvas.style.width = "640px";
        this.canvas.style.height = "480px";
        this.canvas.width = this.canvas.clientWidth * window.devicePixelRatio;
        this.canvas.height = this.canvas.clientHeight * window.devicePixelRatio;
    }

    draw(img: Blob) {
        const url = URL.createObjectURL(img);
        const image = new Image();
        image.src = url;
        image.onload = () => {
            if (this.ctx) {
                this.ctx.drawImage(image, 0, 0, 640, 480);
                URL.revokeObjectURL(url);
            }
        }
    }

    load_video(rgb: Blob) {
        this.release_video()
        this.video_url = URL.createObjectURL(rgb);
        this.video_html = document.createElement("video");
        this.video_html.src = this.video_url;
        this.video_html.addEventListener('seeked', ()=>{
            this.ctx?.drawImage(this.video_html!, 0, 0, 640, 480);
        });
    }

    release_video() {
        if (this.video_url) {
            URL.revokeObjectURL(this.video_url);
            this.video_url = undefined
        }
    }

    draw_from_video(time: number) {
        if (this.video_url && this.video_html) {
            this.video_html.currentTime = time;
            // console.log(this.video_html.currentTime);
            // this.ctx?.drawImage(this.video_html, 0, 0, 640, 480);
        }
    }
}

export const iphone_view = new IphoneView();