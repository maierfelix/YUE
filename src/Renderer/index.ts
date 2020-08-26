import { mat4 } from "gl-matrix";

import { AbstractRenderer, IRendererOptions } from "./AbstractRenderer";

import { performance } from "perf_hooks";
import { Scene } from "../Scene";
import { AbstractCamera } from "../Camera";

interface IBufferCopyOperation {
  buffer: GPUBuffer;
  data: ArrayBufferView;
  offset: number;
  callback: Function;
};

const SRC_COPY_BUFFER_SIZE = 2 ** 16;

export class Renderer extends AbstractRenderer {

  private _device: GPUDevice;
  private _adapter: GPUAdapter;
  private _context: GPUCanvasContext;
  private _swapchain: GPUSwapChain;
  private _depthAttachment: GPUTextureView = null;

  private _beginFrameTimestamp: number;
  private _lastFrameTimestamp: number;

  private _copyBuffer: GPUBuffer = null;

  private _bufferCopyOperations: IBufferCopyOperation[] = [];

  /**
   * @param options Create options
   */
  public constructor(options?: IRendererOptions) {
    super(options);
  }

  public getDevice(): GPUDevice { return this._device; }
  public getAdapter(): GPUAdapter { return this._adapter; }
  public getContext(): GPUCanvasContext { return this._context; }
  public getSwapchain(): GPUSwapChain { return this._swapchain; }
  public getDepthAttachment(): GPUTextureView { return this._depthAttachment; }

  private getBeginFrameTimestamp(): number { return this._beginFrameTimestamp; }
  private setBeginFrameTimestamp(value: number): void { this._beginFrameTimestamp = value; }

  private getLastFrameTimestamp(): number { return this._lastFrameTimestamp; }
  private setLastFrameTimestamp(value: number): void { this._lastFrameTimestamp = value; }

  private getCopyBuffer(): GPUBuffer { return this._copyBuffer; }

  private getBufferCopyOperations(): IBufferCopyOperation[] { return this._bufferCopyOperations; }

  public async create(): Promise<Renderer> {
    this._adapter = await this.createAdapter();
    this._device = await this.createDevice();
    this._context = this.createContext();
    this._swapchain = this.createSwapchain();
    this._copyBuffer = await this.createCopyBuffer();
    this.setBeginFrameTimestamp(performance.now());
    this.setLastFrameTimestamp(performance.now());
    // Perform an initial resize
    this.resize(this.getCanvas().width, this.getCanvas().height);
    return this;
  }

  private async createAdapter(): Promise<GPUAdapter> {
    // Make sure WebGPU is available
    if (!(navigator.gpu instanceof GPU))
      throw new ReferenceError(`WebGPU is not available`);
    // Everything seems fine, request the GPUAdapter
    const adapter = await navigator.gpu.requestAdapter();
    // Make sure the adapter was created successfully
    if (!(adapter instanceof GPUAdapter))
      throw new ReferenceError(`Failed to request GPU adapter`);
    return adapter;
  }

  private async createDevice(): Promise<GPUDevice> {
    // Make sure the required extensions are available
    if (!this.getAdapter().extensions.includes("texture-compression-bc"))
      throw new ReferenceError(`Required extension 'texture-compression-bc' is unavailable`);
    // Everything seems fine, create the GPUDevice including the required extensions
    const device = await this.getAdapter().requestDevice({
      extensions: ["texture-compression-bc"]
    });
    // Make sure the device was created successfully
    if (!(device instanceof GPUDevice))
      throw new ReferenceError(`Failed to create GPU device`);
    device.addEventListener("uncapturederror", (error) => {
      this.onDeviceError(error);
    });
    return device;
  }

  private createContext(): GPUCanvasContext {
    const context = this.getCanvas().getContext("gpupresent");
    // Make sure the context was created successfully
    if (!(context instanceof GPUCanvasContext))
      throw new ReferenceError(`Failed to retrieve GPU context`);
    return context;
  }

  private createSwapchain(): GPUSwapChain {
    const swapchain = this.getContext().configureSwapChain({
      device: this.getDevice(),
      format: "bgra8unorm",
      usage: GPUTextureUsage.OUTPUT_ATTACHMENT
    });
    // Make sure the swapchain was configured successfully
    if (!(swapchain instanceof GPUSwapChain))
      throw new ReferenceError(`Failed to configure GPU swapchain`);
    return swapchain;
  }

  /**
   * Create buffer for chunked CPU -> GPU data copies
   */
  private async createCopyBuffer(): Promise<GPUBuffer> {
    const buffer = this.getDevice().createBuffer({
      size: SRC_COPY_BUFFER_SIZE,
      usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE,
      mappedAtCreation: false
    });
    return buffer;
  }

  /**
   * Resize the rendering surface and depth texture
   * @param width The destination width after resize
   * @param height The destination height after resize
   */
  public resize(width: number, height: number) {
    // Make sure render surface is at least 1x1
    if (width === 0) width = 1;
    if (height === 0) height = 1;
    super.resize(width, height);
    // resize depth attachment
    let depthAttachment = this.getDevice().createTexture({
      size: { width: width, height: height, depth: 1 },
      format: "depth24plus-stencil8",
      usage: GPUTextureUsage.OUTPUT_ATTACHMENT
    }).createView();
    this._depthAttachment = depthAttachment;
  }

  /**
   * Called in case of an device error
   * @param error The error message
   */
  private onDeviceError(error: Event): void {
    this.emit("deviceerror", error);
  }

  /**
   * Render the scene
   * @param camera The camera to be used to render the scene
   */
  public async render(scene: Scene): Promise<void> {
    const now = performance.now();
    const delta = (now - this.getLastFrameTimestamp()) / 1e3;
    const begin = this.getBeginFrameTimestamp();
    const time = (now - begin) / 1e3;
    this.emit("beforerender", { time, delta });
    // Make sure a scene object is provided
    if (!(scene instanceof Scene))
      throw TypeError(`Unexpected type for argument 1 in 'render', expected instance of 'AbstractCamera'`);
    // The scene's camera determines the rendering surface size
    const camera = scene.getAttachedCamera();
    // Make sure the scene has a valid camera attached
    if (!(camera instanceof AbstractCamera))
      throw ReferenceError(`Scene requires an attached camera`);
    if (
      (this.getWidth() !== camera.getWidth()) ||
      (this.getHeight() !== camera.getHeight()
    )) this.resize(camera.getWidth(), camera.getHeight());
    // Make sure the renderer got created successfully
    if (!this.getAdapter() || !this.getDevice())
      throw new ReferenceError(`Method 'create' must be called on 'Renderer' before usage`);
    // Take the scene's combined camera matrix
    const matrix: mat4 = camera.getViewProjectionMatrix();
    // Update the scene
    await scene.update(this);
    // Render the scene
    scene.render(this);
    this.setLastFrameTimestamp(now);
    this.emit("afterrender", { time, delta });
  }

  /**
   * Flushes all pending operations such as buffer copies
   */
  public async flush(): Promise<void> {
    const device = this.getDevice();
    const queue = device.defaultQueue;
    const bufferCopyOperations = this.getBufferCopyOperations();
    // Abort here if there's nothing to do
    if (!bufferCopyOperations.length) return;

    // Buffer for CPU -> GPU copy operations
    const srcCopyBuffer = this.getCopyBuffer();
    // Map buffer to be CPU writeable
    await srcCopyBuffer.mapAsync(GPUMapMode.WRITE, 0x0, SRC_COPY_BUFFER_SIZE);
    // Create array view into mapped buffer
    const srcCopyData = new Uint8Array(srcCopyBuffer.getMappedRange(0x0, SRC_COPY_BUFFER_SIZE));

    // Record enqueued operations
    const commandEncoder = device.createCommandEncoder({});
    // Record buffer copy operations
    {
      let byteOffset = 0x0;
      for (const {buffer, data, offset} of bufferCopyOperations) {
        // Need resize
        if (byteOffset + data.byteLength > srcCopyData.byteLength) {
          // TODO: Use queue writeBuffer for large copy data
          throw new Error(`Copy buffer is not large enough to hold data`);
        }
        // copy into CPU mapped buffer
        srcCopyData.set(new Uint8Array(data.buffer), byteOffset);
        // record CPU -> GPU copy operation
        commandEncoder.copyBufferToBuffer(
          srcCopyBuffer, byteOffset, buffer, offset, data.byteLength
        );
        byteOffset += data.byteLength;
      };
    }
    // Unmap buffer
    srcCopyBuffer.unmap();
    // Execute recorded commands
    queue.submit([commandEncoder.finish()]);
    // Trigger callbacks if necessary
    for (const {callback} of bufferCopyOperations) {
      if (callback instanceof Function) callback();
    };
    // Free after we performed the operations
    bufferCopyOperations.length = 0;
  }

  /**
   * Enqueue a new buffer copy operation to perform
   * @param buffer The buffer to copy the data into
   * @param data The data to copy
   * @param byteOffset The starting byte offset into the buffer
   */
  public enqueueBufferCopyOperation(
    buffer: GPUBuffer,
    data: ArrayBufferView,
    byteOffset: number = 0x0,
    callback: Function = null
  ): void {
    this.getBufferCopyOperations().push({ buffer, data, offset: byteOffset, callback });
  }

  /**
   * Destroy this Object
   */
  public destroy(): void {
    this._device = null;
    this._adapter = null;
    this._context = null;
    this._swapchain = null;
    this._depthAttachment = null;
    this._copyBuffer = null;
    this._bufferCopyOperations = null;
    super.destroy();
  }

};
