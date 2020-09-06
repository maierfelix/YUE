import { mat4 } from "gl-matrix";
import { EventEmitter } from "../utils";
export interface ICameraOptions {
    width?: number;
    height?: number;
}
export declare abstract class AbstractCamera extends EventEmitter {
    private _width;
    private _height;
    /**
     * @param options Create options
     */
    constructor(options?: ICameraOptions);
    /**
     * The camera width
     */
    getWidth(): number;
    /**
     * Update the camera width
     * @param value
     */
    setWidth(value: number): void;
    /**
     * The camera height
     */
    getHeight(): number;
    /**
     * Update the camera height
     * @param value
     */
    setHeight(value: number): void;
    /**
     * The aspect size of the rendering surface
     */
    getAspect(): number;
    /**
     * Returns the camera view-projection matrix, must be overridden
     */
    abstract getViewProjectionMatrix(): mat4;
    /**
     * Should be called every frame, must be overridden
     */
    abstract update(): void;
    /**
     * Destroy this Object
     */
    destroy(): void;
    /**
     * Resize the camera
     * @param width The destination width after resize
     * @param height The destination height after resize
     */
    resize(width: number, height: number): void;
}
