/// <reference types="@webgpu/types" />
import { AbstractRenderer, IRendererOptions } from "./AbstractRenderer";
import { Scene } from "../Scene";
import { IBindGroupResource } from "../Material/RenderPipelineGenerator";
import { QueueCommander } from "../QueueCommander";
export interface IUniformUpdateEntry {
    id: number;
    data: any;
}
export declare class Renderer extends AbstractRenderer {
    private _device;
    private _adapter;
    private _context;
    private _swapchain;
    private _depthAttachment;
    private _beginFrameTimestamp;
    private _lastFrameTimestamp;
    private _queueCommander;
    /**
     * @param options Create options
     */
    constructor(options?: IRendererOptions);
    getDevice(): GPUDevice;
    getAdapter(): GPUAdapter;
    getContext(): GPUCanvasContext;
    getSwapchain(): GPUSwapChain;
    getDepthAttachment(): GPUTextureView;
    getQueueCommander(): QueueCommander;
    private getBeginFrameTimestamp;
    private setBeginFrameTimestamp;
    private getLastFrameTimestamp;
    private setLastFrameTimestamp;
    create(): Promise<Renderer>;
    private createAdapter;
    private createDevice;
    private createContext;
    private createSwapchain;
    /**
     * Resize the rendering surface and depth texture
     * @param width The destination width after resize
     * @param height The destination height after resize
     */
    resize(width: number, height: number): void;
    /**
     * Called in case of an device error
     * @param error The error message
     */
    private onDeviceError;
    /**
     * Render the scene
     * @param camera The camera to be used to render the scene
     */
    render(scene: Scene): Promise<void>;
    /**
     * Flushes all pending operations such as buffer copies
     */
    flush(): Promise<void>;
    /**
     *
     * @param queue The uniform queue to process
     * @param resources The bound uniform resources
     */
    processUniformUpdateQueue(queue: IUniformUpdateEntry[], uniformResources: IBindGroupResource[]): void;
    /**
     * Destroy this Object
     */
    destroy(): void;
}
