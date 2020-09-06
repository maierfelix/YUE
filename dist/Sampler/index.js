"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sampler = void 0;
const utils_1 = require("../utils");
const constants_1 = require("../constants");
;
;
const SAMPLER_DEFAULT_OPTIONS = {
    name: null,
    addressMode: {
        U: constants_1.SAMPLER_WRAP_MODE.REPEAT,
        V: constants_1.SAMPLER_WRAP_MODE.REPEAT,
        W: constants_1.SAMPLER_WRAP_MODE.REPEAT
    },
    filterMode: constants_1.SAMPLER_FILTER_MODE.LINEAR
};
class Sampler extends utils_1.EventEmitter {
    /**
     * @param options Create options
     */
    constructor(options) {
        super();
        // Normalize options
        options = Object.assign({}, SAMPLER_DEFAULT_OPTIONS, options);
        // Process options
        this.setName(options.name);
        this._addressMode = Object.assign({}, options.addressMode);
        this._filterMode = options.filterMode;
    }
    /**
     * The sampler name
     */
    getName() { return this._name; }
    /**
     * Update the sampler name
     * @param value
     */
    setName(value) { this._name = value; }
    /**
     * The sampler address mode
     */
    getAddressMode() { return Object.assign({}, this._addressMode); }
    /**
     * The sampler filter mode
     */
    getFilterMode() { return this._filterMode; }
    /**
     * Destroy this Object
     */
    destroy() {
        this._name = null;
        this._addressMode = null;
        this.emit("destroy");
    }
}
exports.Sampler = Sampler;
;
//# sourceMappingURL=index.js.map