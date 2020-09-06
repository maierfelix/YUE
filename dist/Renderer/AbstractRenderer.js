"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractRenderer = void 0;
const utils_1 = require("../utils");
const Scene_1 = require("../Scene");
;
const RENDERER_DEFAULT_OPTIONS = {
    canvas: null
};
const CANVAS_DEFAULT_WIDTH = 480;
const CANVAS_DEFAULT_HEIGHT = 320;
class AbstractRenderer extends utils_1.EventEmitter {
    /**
     * @param options Create options
     */
    constructor(options) {
        super();
        // Normalize options
        options = Object.assign({}, RENDERER_DEFAULT_OPTIONS, options);
        // Process options
        this._canvas = options.canvas;
        // Create internal canvas
        if (!(this._canvas instanceof HTMLCanvasElement)) {
            this._canvas = document.createElement("canvas");
            this._canvas.width = CANVAS_DEFAULT_WIDTH;
            this._canvas.height = CANVAS_DEFAULT_HEIGHT;
        }
    }
    /**
     * The rendering surface to render into
     * TODO: allow other targets such as FBOs
     */
    getCanvas() { return this._canvas; }
    /**
     * The width of the rendering surface
     */
    getWidth() { return this._canvas.width; }
    /**
     * The height of the rendering surface
     */
    getHeight() { return this._canvas.height; }
    /**
     * Resize the rendering surface
     * @param width The destination width after resize
     * @param height The destination height after resize
     */
    resize(width, height) {
        this._canvas.width = width;
        this._canvas.height = height;
        this.emit("resize");
    }
    /**
     * Create a new scene
     */
    createScene(options) {
        options = Object.assign({ renderer: this }, options);
        return new Scene_1.Scene(options);
    }
    /**
     * Destroy this Object
     */
    destroy() {
        this._canvas = null;
        this.emit("destroy");
    }
}
exports.AbstractRenderer = AbstractRenderer;
;
//# sourceMappingURL=AbstractRenderer.js.map