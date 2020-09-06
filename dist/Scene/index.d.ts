import { EventEmitter } from "../utils";
import { Mesh } from "../Mesh";
import { Renderer } from "../Renderer";
import { AbstractCamera } from "../Camera";
export interface ISceneOptions {
    name?: string;
    camera?: AbstractCamera;
    clearColor?: ClearColorType;
}
declare type ClearColorType = [number, number, number, number];
export declare class Scene extends EventEmitter {
    private _name;
    private _clearColor;
    private _camera;
    private _children;
    /**
     * @param options Create options
     */
    constructor(options?: ISceneOptions);
    /**
     * The shader name
     */
    getName(): string;
    /**
     * Update the shader name
     * @param value
     */
    setName(value: string): void;
    /**
     * The scene's attached camera
     */
    getAttachedCamera(): AbstractCamera;
    /**
     * Attaches a camera which is used to render this scene
     * @param camera The camera to use in this scene
     */
    attachCamera(camera: AbstractCamera): void;
    /**
     * Add a child to the scene
     * @param mesh
     */
    addChild(mesh: Mesh): void;
    /**
     * Remove a child from the scene
     * @param mesh
     */
    removeChild(mesh: Mesh): void;
    /**
     * Update the scenes children
     */
    update(renderer: Renderer): Promise<void>;
    /**
     * Render the scenes children
     */
    render(renderer: Renderer): void;
    /**
     * Destroy this Object
     */
    destroy(): void;
}
export {};
