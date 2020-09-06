"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractCamera = void 0;
const utils_1 = require("../utils");
;
const CAMERA_DEFAULT_OPTIONS = {
    width: 0,
    height: 0
};
class AbstractCamera extends utils_1.EventEmitter {
    /**
     * @param options Create options
     */
    constructor(options) {
        super();
        // Normalize options
        options = Object.assign({}, CAMERA_DEFAULT_OPTIONS, options);
        // Process options
        this._width = options.width;
        this._height = options.height;
    }
    /**
     * The camera width
     */
    getWidth() { return this._width; }
    /**
     * Update the camera width
     * @param value
     */
    setWidth(value) { this._width = value; }
    /**
     * The camera height
     */
    getHeight() { return this._height; }
    /**
     * Update the camera height
     * @param value
     */
    setHeight(value) { this._height = value; }
    /**
     * The aspect size of the rendering surface
     */
    getAspect() { return this.getWidth() / this.getHeight(); }
    /**
     * Destroy this Object
     */
    destroy() {
        this.emit("destroy");
    }
    /**
     * Resize the camera
     * @param width The destination width after resize
     * @param height The destination height after resize
     */
    resize(width, height) {
        this._width = width;
        this._height = height;
        this.emit("resize");
    }
}
exports.AbstractCamera = AbstractCamera;
;
//# sourceMappingURL=AbstractCamera.js.map