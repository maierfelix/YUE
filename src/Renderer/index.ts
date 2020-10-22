import {AbstractRenderer, IRendererOptions} from "./AbstractRenderer";

import {Frame} from "../Frame";
import {AbstractCamera} from "../Camera";
import {IBindGroupResource, RenderPipelineGenerator} from "../Material/RenderPipelineGenerator";
import {Sampler} from "../Sampler";
import {Texture} from "../Texture";
import {QueueCommander} from "../QueueCommander";

import {LoadGLSLang, GetTimeStamp} from "../utils";

export interface IUniformUpdateEntry {
  id: number;
  data: any;
}

export class Renderer extends AbstractRenderer {

  private _device: GPUDevice = null;
  private _adapter: GPUAdapter = null;
  private _context: GPUCanvasContext = null;
  private _swapchain: GPUSwapChain = null;
  private _depthAttachment: GPUTextureView = null;

  private _beginFrameTimestamp: number = 0;
  private _lastFrameTimestamp: number = 0;

  private _queueCommander: QueueCommander = null;

  /**
   * @param options - Create options
   */
  public constructor(options?: IRendererOptions) {
    super(options);
  }

  public getDevice(): GPUDevice { return this._device; }
  public getAdapter(): GPUAdapter { return this._adapter; }
  public getContext(): GPUCanvasContext { return this._context; }
  public getSwapchain(): GPUSwapChain { return this._swapchain; }
  public getDepthAttachment(): GPUTextureView { return this._depthAttachment; }
  public getQueueCommander(): QueueCommander { return this._queueCommander; }

  private _getBeginFrameTimestamp(): number { return this._beginFrameTimestamp; }
  private _setBeginFrameTimestamp(value: number): void { this._beginFrameTimestamp = value; }

  private _getLastFrameTimestamp(): number { return this._lastFrameTimestamp; }
  private _setLastFrameTimestamp(value: number): void { this._lastFrameTimestamp = value; }

  /**
   * Create the renderer
   */
  public async create(): Promise<Renderer> {
    await LoadGLSLang();
    this._adapter = await this._createAdapter();
    this._device = await this._createDevice();
    this._context = this._createContext();
    this._swapchain = this._createSwapchain();
    this._queueCommander = new QueueCommander(this.getDevice());
    this._setBeginFrameTimestamp(GetTimeStamp());
    this._setLastFrameTimestamp(GetTimeStamp());
    // Perform an initial resize
    this.resize(this.getCanvas().width, this.getCanvas().height);
    return this;
  }

  /**
   * Creates a WGPU adapter
   */
  private async _createAdapter(): Promise<GPUAdapter> {
    // Make sure WebGPU is available
    if (
      typeof GPU === "undefined" ||
      navigator.gpu === void 0 ||
      !(navigator.gpu instanceof GPU)
    ) throw new ReferenceError(`WebGPU is not available`);
    // Everything seems fine, request the GPUAdapter
    const adapter = await navigator.gpu.requestAdapter();
    // Make sure the adapter was created successfully
    if (!(adapter instanceof GPUAdapter))
      throw new ReferenceError(`Failed to request GPU adapter`);
    return adapter;
  }

  /**
   * Creates a WGPU device
   */
  private async _createDevice(): Promise<GPUDevice> {
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
      this._onDeviceError(error);
    });
    return device;
  }

  /**
   * Creates a WGPU context
   */
  private _createContext(): GPUCanvasContext {
    const context = this.getCanvas().getContext("gpupresent");
    // Make sure the context was created successfully
    if (!(context instanceof GPUCanvasContext))
      throw new ReferenceError(`Failed to retrieve GPU context`);
    return context;
  }

  /**
   * Creates a WGPU swapchain
   */
  private _createSwapchain(): GPUSwapChain {
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
   * Resize the rendering surface and depth texture
   * @param width - The destination width after resize
   * @param height - The destination height after resize
   */
  public resize(width: number, height: number) {
    // Make sure render surface is at least 1x1
    if (width === 0) width = 1;
    if (height === 0) height = 1;
    super.resize(width, height);
    // resize depth attachment
    const depthAttachment = this.getDevice().createTexture({
      size: {width: width, height: height, depth: 1},
      format: "depth32float",
      usage: GPUTextureUsage.OUTPUT_ATTACHMENT
    }).createView();
    this._depthAttachment = depthAttachment;
  }

  /**
   * Called in case of an device error
   * @param error - The error message
   */
  private _onDeviceError(error: Event): void {
    this.emit("deviceerror", error);
  }

  /**
   * Render a frame
   * @param frame - The frame to render
   */
  public async render(frame: Frame): Promise<void> {
    const now = GetTimeStamp();
    const delta = (now - this._getLastFrameTimestamp()) / 1e3;
    const begin = this._getBeginFrameTimestamp();
    const time = (now - begin) / 1e3;
    this.emit("beforerender", {time, delta});
    // Make sure a frame object is provided
    if (!(frame instanceof Frame))
      throw TypeError(`Unexpected type for argument 1 in 'render', expected instance of 'Frame'`);
    // The frame's camera determines the rendering surface size
    const camera = frame.getAttachedCamera();
    // Make sure the frame has a valid camera attached
    if (!(camera instanceof AbstractCamera))
      throw ReferenceError(`Frame requires an attached camera`);
    if (
      (this.getWidth() !== camera.getWidth()) ||
      (this.getHeight() !== camera.getHeight()
    )) this.resize(camera.getWidth(), camera.getHeight());
    // Make sure the renderer got created successfully
    if (!this.getAdapter() || !this.getDevice())
      throw new ReferenceError(`Method 'create' must be called on 'Renderer' before usage`);
    // Update the frame
    await frame.update(this);
    // Draw the frame
    frame.draw(this);
    this._setLastFrameTimestamp(now);
    this.emit("afterrender", {time, delta});
  }

  /**
   * Flushes all pending operations such as buffer copies
   */
  public async flush(): Promise<void> {
    await this.getQueueCommander().flush();
  }

  /**
   * 
   * @param queue - The uniform queue to process
   * @param resources - The bound uniform resources
   */
  public processUniformUpdateQueue(queue: IUniformUpdateEntry[], uniformResources: IBindGroupResource[]): void {
    const device = this.getDevice();
    // Samplers and Texture updates can trigger a rebuild
    // Process and dequeue the entries from the uniform update queue
    for (let ii = 0; ii < queue.length; ++ii) {
      const {id, data} = queue[ii];
      const uniformResource = uniformResources.find(
        resource => resource ? resource.id === id : false
      );
      if (uniformResource === null)
        throw new ReferenceError(`Failed to resolve uniform resource for uniform '${id}'`);
      const {resource} = uniformResource;
      // Enqueue buffer copy operation
      if (resource instanceof GPUBuffer) {
        this.getQueueCommander().transferDataToBuffer(
          resource, data, 0x0, null
        );
      }
      // Bind sampler
      else if (data instanceof Sampler) {
        const samplerDescriptor = RenderPipelineGenerator.GenerateSamplerDescriptor(data);
        // Reserve GPUSampler in case it doesn't exist yet
        if (!uniformResource.resource) {
          const instance = device.createSampler(samplerDescriptor);
          uniformResource.resource = instance;
        }
      }
      // Bind texture
      else if (data instanceof Texture) {
        const textureDescriptor = RenderPipelineGenerator.GenerateTextureDescriptor(data);
        // Reserve GPUTexture in case it doesn't exist yet
        if (!uniformResource.resource) {
          const texture = device.createTexture(textureDescriptor);
          uniformResource.resource = texture.createView();
          // Hack to save reference to texture, beautify this
          (uniformResource.resource as any).texture = texture;
        }
        const width = data.getWidth();
        const height = data.getHeight();
        const depth = data.getDepth();
        const imageData = data.getData() as Uint8Array;
        const bytesPerRow = data.getBytesPerRow();
        this.getQueueCommander().transferDataToTexture(
          (uniformResource.resource as any).texture, imageData, width, height, depth, bytesPerRow, null
        );
      }
      else {
        throw new TypeError(`Unexpected type '${typeof data}'`);
      }
      // Remove queue item
      queue.splice(ii--, 1);
    }
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
    super.destroy();
  }

}
