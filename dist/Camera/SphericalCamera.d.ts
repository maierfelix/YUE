import { mat4, vec3 } from "gl-matrix";
import { AbstractCamera, ICameraOptions } from "./AbstractCamera";
export declare class SphericalCamera extends AbstractCamera {
    private _instance;
    private _translation;
    private _viewProjectionMatrix;
    /**
     * @param options Create options
     */
    constructor(options?: ICameraOptions);
    private getInstance;
    /**
     * Updates and caches the transforms
     */
    private updateTransforms;
    /**
     * Returns the translation of the camera
     */
    getTranslation(): vec3;
    /**
     * Returns the view-projection matrix of the camera
     */
    getViewProjectionMatrix(): mat4;
    /**
     * Attaches controls to the provided element
     * @param element HTML canvas element to listen for events
     */
    attachControl(element: HTMLCanvasElement): void;
    /**
     * Resize the camera
     * @param width
     * @param height
     */
    resize(width: number, height: number): void;
    /**
     * Should be called every frame
     */
    update(): void;
    /**
     * Destroy this Object
     */
    destroy(): void;
}
