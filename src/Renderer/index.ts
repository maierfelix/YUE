import {AbstractRenderer, IRendererOptions} from "./AbstractRenderer";

import {Frame} from "../Frame";
import {AbstractCamera} from "../Camera";
import {IBindGroupResource, RenderPipelineGenerator, ToWGPUTextureFormat} from "../Material/RenderPipelineGenerator";
import {Buffer} from "../Buffer";
import {Sampler} from "../Sampler";
import {Texture} from "../Texture";
import {QueueCommander} from "../QueueCommander";

import {LoadGLSLang, GetTimeStamp} from "../utils";
import {TEXTURE_FORMAT} from "../constants";

export interface IUniformBindingEntry {
  id: number;
  data: any;
}

export class Renderer extends AbstractRenderer {

  private _device: GPUDevice = null;
  private _adapter: GPUAdapter = null;
  private _context: GPUCanvasContext = null;
  private _swapchain: GPUSwapChain = null;

  private _beginFrameTimestamp: number = 0;
  private _lastFrameTimestamp: number = 0;

  private _queueCommander: QueueCommander = null;

  private _swapchainTexture: Texture = null;
  private _swapchainFormat: TEXTURE_FORMAT = null;

  /**
   * @param options - Create options
   */
  public constructor(options?: IRendererOptions) {
    super(options);
  }

  /**
   * The WGPU device
   */
  public getDevice(): GPUDevice { return this._device; }

  /**
   * The WGPU adapter
   */
  public getAdapter(): GPUAdapter { return this._adapter; }

  /**
   * The WGPU canvas context
   */
  public getContext(): GPUCanvasContext { return this._context; }

  /**
   * The WGPU swapchain
   */
  public getSwapchain(): GPUSwapChain { return this._swapchain; }

  /**
   * The queue commander
   */
  public getQueueCommander(): QueueCommander { return this._queueCommander; }

  /**
   * The swapchain texture
   */
  public getSwapchainTexture(): Texture { return this._swapchainTexture; }

  /**
   * The texture format of the swapchain
   */
  public getSwapchainFormat(): TEXTURE_FORMAT { return this._swapchainFormat; }

  /**
   * Create the renderer
   */
  public async create(): Promise<Renderer> {
    await LoadGLSLang();
    this._adapter = await this._createAdapter();
    this._device = await this._createDevice();
    this._context = this._createContext();
    this._swapchainFormat = await this._resolveSwapchainFormat();
    this._swapchain = this._createSwapchain();
    this._swapchainTexture = new Texture({
      width: this.getWidth(),
      height: this.getHeight(),
      format: this.getSwapchainFormat()
    });
    this._queueCommander = new QueueCommander(this.getDevice());
    this._beginFrameTimestamp = GetTimeStamp();
    this._lastFrameTimestamp = GetTimeStamp();
    // Perform an initial resize
    this.resize(this.getCanvas().width, this.getCanvas().height);
    this._updateSwapchainTexture();
    return this;
  }

  /**
   * Resize the renderer
   * @param width - The destination width after resize
   * @param height - The destination height after resize
   */
  public resize(width: number, height: number) {
    // Make sure the render surface is at least 1x1
    width = Math.max(1, width);
    height = Math.max(1, height);
    super.resize(width, height);
  }

  /**
   * Render a frame
   * @param frame - The frame to render
   */
  public render(frame: Frame): void {
    const now = GetTimeStamp();
    const delta = (now - this._lastFrameTimestamp) / 1e3;
    const begin = this._beginFrameTimestamp;
    const time = (now - begin) / 1e3;
    this.emit("beforerender", {time, delta});
    // Make sure a frame object is provided
    if (!(frame instanceof Frame))
      throw new TypeError(`Unexpected type for argument 1 in 'render', expected instance of 'Frame'`);
    // The frame's camera determines the rendering surface size
    const camera = frame.getAttachedCamera();
    // If there is a camera attached then resize the renderer to match the camera size
    if (camera instanceof AbstractCamera) {
      if (
        (this.getWidth() !== camera.getWidth()) ||
        (this.getHeight() !== camera.getHeight()
      )) this.resize(camera.getWidth(), camera.getHeight());
    }
    // Make sure the renderer got created successfully
    if (!this.getAdapter() || !this.getDevice())
      throw new ReferenceError(`Method 'create' must be called on 'Renderer' before usage`);
    // Draw the frame
    frame.draw(this);
    this._lastFrameTimestamp = now;
    this.emit("afterrender", {time, delta});
  }

  /**
   * Flushes all pending operations such as buffer copies
   */
  public flush(): void {
    this.getQueueCommander().flush();
  }

  /**
   * Process a uniform binding queue
   * @param queue - The uniform bindings to process
   * @param resources - The bound uniform resources
   */
  public processUniformBindingQueue(queue: IUniformBindingEntry[], uniformResources: IBindGroupResource[]): void {
    //const queueCommander = this.getQueueCommander();
    // Process and dequeue the entries from the uniform update queue
    for (let ii = 0; ii < queue.length; ++ii) {
      const {id, data} = queue[ii];
      const uniformResource = uniformResources.find(
        resource => resource ? resource.id === id : false
      );
      if (uniformResource === null) {
        throw new ReferenceError(`Failed to resolve uniform resource for uniform '${id}'`);
      }
      // Bind buffer
      if (data instanceof Buffer) {
        // Create the underlying GPU resource if necessary
        if (!data.getResource()) {
          const descriptor = RenderPipelineGenerator.GenerateBufferDescriptor(data);
          data.create(this, descriptor);
        }
        uniformResource.resource = data.getResource();
      }
      // Bind sampler
      else if (data instanceof Sampler) {
        // Create the underlying GPU resource if necessary
        if (!data.getResource()) {
          const descriptor = RenderPipelineGenerator.GenerateSamplerDescriptor(data);
          data.create(this, descriptor);
        }
        uniformResource.resource = data.getResource();
      }
      // Bind texture
      else if (data instanceof Texture) {
        // Create the underlying GPU resource if necessary
        if (!data.getResource()) {
          const descriptor = RenderPipelineGenerator.GenerateTextureDescriptor(data);
          data.create(this, descriptor);
        }
        uniformResource.resource = data.getResourceView();
      }
      else {
        throw new TypeError(`Unexpected type '${typeof data}'`);
      }
      // Remove queue item
      queue.splice(ii--, 1);
    }
  }

  /**
   * Process uniform bindings
   * @param resources - The uniform bindings to process
   */
  public processUniformBindings(bindings: Map<string, (Buffer | Sampler | Texture)>): void {
    const entries = bindings.entries();
    for (const [_key, binding] of entries) {
      if (binding instanceof Buffer) {
        binding.update(this);
      }
      else if (binding instanceof Sampler) {
        binding.update(this);
      }
      else if (binding instanceof Texture) {
        binding.update(this);
      }
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
    super.destroy();
  }

  /**
   * Resolves the texture format of the swapchain
   */
  private async _resolveSwapchainFormat(): Promise<TEXTURE_FORMAT> {
    const device = this.getDevice();
    const context = this.getContext();
    const swapchainFormat = await context.getSwapChainPreferredFormat(device);
    const start = TEXTURE_FORMAT.NONE + 1;
    const end = Object.keys(TEXTURE_FORMAT).length;
    for (let ii = start; ii < end; ++ii) {
      const format = ToWGPUTextureFormat(ii);
      if (format === swapchainFormat) return ii;
    }
    return TEXTURE_FORMAT.NONE;
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
      format: ToWGPUTextureFormat(this.getSwapchainFormat()),
      usage: GPUTextureUsage.OUTPUT_ATTACHMENT
    });
    // Make sure the swapchain was configured successfully
    if (!(swapchain instanceof GPUSwapChain))
      throw new ReferenceError(`Failed to configure GPU swapchain`);
    return swapchain;
  }

  /**
   * Called in case of an device error
   * @param error - The error message
   */
  private _onDeviceError(error: Event): void {
    this.emit("deviceerror", error);
  }

  /**
   * Update the swapchain texture
   */
  private _updateSwapchainTexture(): void {
    const canvas = this.getCanvas();
    const swapchain = this.getSwapchain();
    const swapchainTexture = swapchain.getCurrentTexture();
    const swapchainTextureView = swapchainTexture.createView();
    // Update texture resources with new swapchain resources
    (this._swapchainTexture as any)._resource = swapchainTexture;
    (this._swapchainTexture as any)._resourceView = swapchainTextureView;
    // Update swapchain texture dimension
    (this._swapchainTexture as any)._width = canvas.clientWidth;
    (this._swapchainTexture as any)._height = canvas.clientHeight;
  }

}
