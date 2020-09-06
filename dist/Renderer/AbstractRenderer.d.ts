import { EventEmitter } from "../utils";
import { Scene, ISceneOptions } from "../Scene";
export interface IRendererOptions {
    canvas?: HTMLCanvasElement;
}
export declare abstract class AbstractRenderer extends EventEmitter {
    private _canvas;
    /**
     * @param options Create options
     */
    constructor(options?: IRendererOptions);
    /**
     * The rendering surface to render into
     * TODO: allow other targets such as FBOs
     */
    getCanvas(): HTMLCanvasElement;
    /**
     * The width of the rendering surface
     */
    getWidth(): number;
    /**
     * The height of the rendering surface
     */
    getHeight(): number;
    /**
     * Resize the rendering surface
     * @param width The destination width after resize
     * @param height The destination height after resize
     */
    resize(width: number, height: number): void;
    /**
     * Render a scene, must be overridden
     */
    abstract render(scene: Scene): void;
    /**
     * Create a new scene
     */
    createScene(options?: ISceneOptions): Scene;
    /**
     * Destroy this Object
     */
    destroy(): void;
}
