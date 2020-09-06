"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Texture = void 0;
const utils_1 = require("../utils");
const constants_1 = require("../constants");
;
const TEXTURE_DEFAULT_OPTIONS = {
    name: null,
    data: null,
    width: 0,
    height: 0,
    depth: 1,
    bytesPerRow: 0,
    format: constants_1.TEXTURE_FORMAT.NONE
};
class Texture extends utils_1.EventEmitter {
    /**
     * @param options Create options
     */
    constructor(options) {
        super();
        // Normalize options
        options = Object.assign({}, TEXTURE_DEFAULT_OPTIONS, options);
        // Process options
        this.setName(options.name);
        this._data = options.data;
        this._width = options.width;
        this._height = options.height;
        this._depth = options.depth;
        this._bytesPerRow = options.bytesPerRow;
        this._format = options.format;
    }
    /**
     * The texture name
     */
    getName() { return this._name; }
    /**
     * Update the texture name
     * @param value
     */
    setName(value) { this._name = value; }
    /**
     * The texture data
     */
    getData() { return this._data; }
    /**
     * The texture width
     */
    getWidth() { return this._width; }
    /**
     * The texture height
     */
    getHeight() { return this._height; }
    /**
     * The texture depth
     */
    getDepth() { return this._depth; }
    /**
     * The texture format
     */
    getFormat() { return this._format; }
    /**
     * The texture bytes per row
     */
    getBytesPerRow() { return this._bytesPerRow; }
    /**
     * Destroy this Object
     */
    destroy() {
        this._name = null;
        this._data = null;
        this.emit("destroy");
    }
}
exports.Texture = Texture;
;
//# sourceMappingURL=index.js.map