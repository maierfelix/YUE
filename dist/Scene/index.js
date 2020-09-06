"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scene = void 0;
const utils_1 = require("../utils");
const Camera_1 = require("../Camera");
;
const SCENE_DEFAULT_OPTIONS = {
    name: null,
    camera: null,
    clearColor: [0, 0, 0, 1.0]
};
class Scene extends utils_1.EventEmitter {
    /**
     * @param options Create options
     */
    constructor(options) {
        super();
        this._children = [];
        // Normalize options
        options = Object.assign({}, SCENE_DEFAULT_OPTIONS, options);
        // Process options
        this.setName(options.name);
        this._camera = options.camera;
        this._clearColor = options.clearColor;
    }
    /**
     * The shader name
     */
    getName() { return this._name; }
    /**
     * Update the shader name
     * @param value
     */
    setName(value) { this._name = value; }
    /**
     * The scene's attached camera
     */
    getAttachedCamera() { return this._camera; }
    /**
     * Attaches a camera which is used to render this scene
     * @param camera The camera to use in this scene
     */
    attachCamera(camera) {
        this._camera = camera;
    }
    /**
     * Add a child to the scene
     * @param mesh
     */
    addChild(mesh) {
        if (this._children.indexOf(mesh) === -1) {
            this._children.push(mesh);
        }
        else {
            utils_1.Warn(`Child`, mesh, `is already registered`);
        }
    }
    /**
     * Remove a child from the scene
     * @param mesh
     */
    removeChild(mesh) {
        const childIndex = this._children.indexOf(mesh);
        if (childIndex !== -1) {
            this._children.splice(childIndex, 1);
        }
        else {
            utils_1.Warn(`Child`, mesh, `is already registered`);
        }
    }
    /**
     * Update the scenes children
     */
    async update(renderer) {
        const children = this._children;
        // First rebuild childs if necessary
        for (let ii = 0; ii < children.length; ++ii) {
            const child = children[ii];
            child.build(renderer);
            child.update(renderer);
        }
        ;
        // Flush the renderer (E.g. flushes buffer copy queue)
        await renderer.flush();
        this.emit("update");
    }
    /**
     * Render the scenes children
     */
    render(renderer) {
        const children = this._children;
        const device = renderer.getDevice();
        const camera = this.getAttachedCamera();
        const backBufferView = renderer.getSwapchain().getCurrentTexture().createView();
        // No camera attached, abort
        if (!(camera instanceof Camera_1.AbstractCamera)) {
            return;
        }
        camera.update();
        // Initial clear
        {
            const [r, g, b, a] = this._clearColor;
            const commandEncoder = device.createCommandEncoder({});
            const renderPass = commandEncoder.beginRenderPass({
                colorAttachments: [{
                        attachment: backBufferView,
                        loadValue: { r, g, b, a },
                        storeOp: "store"
                    }],
                depthStencilAttachment: {
                    attachment: renderer.getDepthAttachment(),
                    depthLoadValue: 1.0,
                    depthStoreOp: "store",
                    stencilLoadValue: 0,
                    stencilStoreOp: "store"
                }
            });
            renderPass.endPass();
            device.defaultQueue.submit([commandEncoder.finish()]);
        }
        // Render each child
        const commandEncoder = device.createCommandEncoder({});
        for (let ii = 0; ii < children.length; ++ii) {
            const renderPass = commandEncoder.beginRenderPass({
                colorAttachments: [{
                        attachment: backBufferView,
                        loadValue: "load",
                        storeOp: "store"
                    }],
                depthStencilAttachment: {
                    attachment: renderer.getDepthAttachment(),
                    depthLoadValue: "load",
                    depthStoreOp: "store",
                    stencilLoadValue: 0,
                    stencilStoreOp: "store"
                }
            });
            const child = children[ii];
            child.render(renderPass);
            renderPass.endPass();
        }
        ;
        device.defaultQueue.submit([commandEncoder.finish()]);
        this.emit("render");
    }
    /**
     * Destroy this Object
     */
    destroy() {
        this._name = null;
        this._camera = null;
        this._children = null;
        this.emit("destroy");
    }
}
exports.Scene = Scene;
;
//# sourceMappingURL=index.js.map