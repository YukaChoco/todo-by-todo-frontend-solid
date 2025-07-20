declare module "three/examples/jsm/renderers/CSS3DRenderer.js" {
  import { Object3D, Camera, Scene } from "three";

  export class CSS3DObject extends Object3D {
    constructor(element: HTMLElement);
    element: HTMLElement;
  }

  export class CSS3DRenderer {
    domElement: HTMLElement;
    constructor();
    setSize(width: number, height: number): void;
    render(scene: Scene, camera: Camera): void;
  }
} 