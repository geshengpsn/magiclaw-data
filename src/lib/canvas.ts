import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Renderer, setup_threejs } from "./setup_three";
import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";

class Canvas {
    renderer?: Renderer;
    cube?: Mesh;
    init(canvas: HTMLCanvasElement) {
        this.renderer = setup_threejs(canvas);
        new OrbitControls(this.renderer.camera, canvas);

        // add a cube
        const geometry = new BoxGeometry(0.1, 0.1, 0.1);
        const material = new MeshBasicMaterial({ color: 0x00ff00 });
        this.cube = new Mesh(geometry, material);
        this.renderer.scene.add(this.cube);
    }

    // recv_data(data) {

    // }
}
 
export const simcanvas = new Canvas();