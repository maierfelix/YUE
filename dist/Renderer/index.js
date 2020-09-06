"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Renderer = void 0;
const AbstractRenderer_1 = require("./AbstractRenderer");
const perf_hooks_1 = require("perf_hooks");
const Scene_1 = require("../Scene");
const Camera_1 = require("../Camera");
const RenderPipelineGenerator_1 = require("../Material/RenderPipelineGenerator");
const Sampler_1 = require("../Sampler");
const Texture_1 = require("../Texture");
const QueueCommander_1 = require("../QueueCommander");
;
class Renderer extends AbstractRenderer_1.AbstractRenderer {
    /**
     * @param options Create options
     */
    constructor(options) {
        super(options);
        this._device = null;
        this._adapter = null;
        this._context = null;
        this._swapchain = null;
        this._depthAttachment = null;
        this._queueCommander = null;
    }
    getDevice() { return this._device; }
    getAdapter() { return this._adapter; }
    getContext() { return this._context; }
    getSwapchain() { return this._swapchain; }
    getDepthAttachment() { return this._depthAttachment; }
    getQueueCommander() { return this._queueCommander; }
    getBeginFrameTimestamp() { return this._beginFrameTimestamp; }
    setBeginFrameTimestamp(value) { this._beginFrameTimestamp = value; }
    getLastFrameTimestamp() { return this._lastFrameTimestamp; }
    setLastFrameTimestamp(value) { this._lastFrameTimestamp = value; }
    async create() {
        this._adapter = await this.createAdapter();
        this._device = await this.createDevice();
        this._context = this.createContext();
        this._swapchain = this.createSwapchain();
        this._queueCommander = new QueueCommander_1.QueueCommander(this.getDevice());
        this.setBeginFrameTimestamp(perf_hooks_1.performance.now());
        this.setLastFrameTimestamp(perf_hooks_1.performance.now());
        // Perform an initial resize
        this.resize(this.getCanvas().width, this.getCanvas().height);
        return this;
    }
    async createAdapter() {
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
    async createDevice() {
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
    createContext() {
        const context = this.getCanvas().getContext("gpupresent");
        // Make sure the context was created successfully
        if (!(context instanceof GPUCanvasContext))
            throw new ReferenceError(`Failed to retrieve GPU context`);
        return context;
    }
    createSwapchain() {
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
     * @param width The destination width after resize
     * @param height The destination height after resize
     */
    resize(width, height) {
        // Make sure render surface is at least 1x1
        if (width === 0)
            width = 1;
        if (height === 0)
            height = 1;
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
    onDeviceError(error) {
        this.emit("deviceerror", error);
    }
    /**
     * Render the scene
     * @param camera The camera to be used to render the scene
     */
    async render(scene) {
        const now = perf_hooks_1.performance.now();
        const delta = (now - this.getLastFrameTimestamp()) / 1e3;
        const begin = this.getBeginFrameTimestamp();
        const time = (now - begin) / 1e3;
        this.emit("beforerender", { time, delta });
        // Make sure a scene object is provided
        if (!(scene instanceof Scene_1.Scene))
            throw TypeError(`Unexpected type for argument 1 in 'render', expected instance of 'AbstractCamera'`);
        // The scene's camera determines the rendering surface size
        const camera = scene.getAttachedCamera();
        // Make sure the scene has a valid camera attached
        if (!(camera instanceof Camera_1.AbstractCamera))
            throw ReferenceError(`Scene requires an attached camera`);
        if ((this.getWidth() !== camera.getWidth()) ||
            (this.getHeight() !== camera.getHeight()))
            this.resize(camera.getWidth(), camera.getHeight());
        // Make sure the renderer got created successfully
        if (!this.getAdapter() || !this.getDevice())
            throw new ReferenceError(`Method 'create' must be called on 'Renderer' before usage`);
        // Take the scene's combined camera matrix
        const matrix = camera.getViewProjectionMatrix();
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
    async flush() {
        await this.getQueueCommander().flush();
    }
    /**
     *
     * @param queue The uniform queue to process
     * @param resources The bound uniform resources
     */
    processUniformUpdateQueue(queue, uniformResources) {
        const device = this.getDevice();
        // Samplers and Texture updates can trigger a rebuild
        // Process and dequeue the entries from the uniform update queue
        for (let ii = 0; ii < queue.length; ++ii) {
            const { id, data } = queue[ii];
            const uniformResource = uniformResources.find(resource => resource ? resource.id === id : false);
            if (uniformResource === null)
                throw new ReferenceError(`Failed to resolve uniform resource for uniform '${id}'`);
            const { resource } = uniformResource;
            // Enqueue buffer copy operation
            if (resource instanceof GPUBuffer) {
                this.getQueueCommander().transferDataToBuffer(resource, data, 0x0, null);
            }
            // Bind sampler
            else if (data instanceof Sampler_1.Sampler) {
                const samplerDescriptor = RenderPipelineGenerator_1.RenderPipelineGenerator.GenerateSamplerDescriptor(data);
                const instance = device.createSampler(samplerDescriptor);
                if (!uniformResource.resource)
                    uniformResource.resource = instance;
            }
            // Bind texture
            else if (data instanceof Texture_1.Texture) {
                const textureDescriptor = RenderPipelineGenerator_1.RenderPipelineGenerator.GenerateTextureDescriptor(data);
                if (!uniformResource.resource) {
                    let texture = device.createTexture(textureDescriptor);
                    uniformResource.resource = texture.createView();
                    // Hack to save reference to texture, beautify this
                    uniformResource.resource.texture = texture;
                }
                const width = data.getWidth();
                const height = data.getHeight();
                const depth = data.getDepth();
                const imageData = data.getData();
                const bytesPerRow = data.getBytesPerRow();
                this.getQueueCommander().transferDataToTexture(uniformResource.resource.texture, imageData, width, height, depth, bytesPerRow, null);
            }
            else {
                throw new TypeError(`Unexpected type '${typeof data}'`);
            }
            // Remove queue item
            queue.splice(ii--, 1);
        }
        ;
    }
    /**
     * Destroy this Object
     */
    destroy() {
        this._device = null;
        this._adapter = null;
        this._context = null;
        this._swapchain = null;
        this._depthAttachment = null;
        super.destroy();
    }
}
exports.Renderer = Renderer;
;
//# sourceMappingURL=index.js.map