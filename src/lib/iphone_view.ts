class IphoneView {
    canvas?: HTMLCanvasElement
    ctx: CanvasRenderingContext2D | null = null
    init(canvas: HTMLCanvasElement) {
        console.log("init");
        this.canvas = canvas
        this.ctx = this.canvas?.getContext("2d");
        this.canvas.style.width = "640px";
        this.canvas.style.height = "480px";
        this.canvas.width = this.canvas.clientWidth * window.devicePixelRatio;
        this.canvas.height = this.canvas.clientHeight * window.devicePixelRatio;
    }

    draw(img: Blob) {
        const url = URL.createObjectURL(img);
        // console.log(this.ctx)
        const image = new Image();
        image.src = url;
        image.onload = () => {
            if (this.ctx) {
                this.ctx.drawImage(image, 0, 0, 640, 480);
                URL.revokeObjectURL(url);
            }
        };

    }
}

export const iphone_view = new IphoneView();