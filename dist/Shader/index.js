"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shader = void 0;
const utils_1 = require("../utils");
const constants_1 = require("../constants");
;
const SHADER_DEFAULT_OPTIONS = {
    name: null,
    stage: constants_1.SHADER_STAGE.NONE,
    code: null
};
function ToShaderStageString(stage) {
    switch (stage) {
        case constants_1.SHADER_STAGE.NONE:
            throw new Error(`'SHADER_STAGE.NONE' is not a valid shader stage`);
        case constants_1.SHADER_STAGE.VERTEX:
            return "vertex";
        case constants_1.SHADER_STAGE.FRAGMENT:
            return "fragment";
    }
    ;
}
;
class Shader extends utils_1.EventEmitter {
    /**
     * @param options Create options
     */
    constructor(options) {
        super();
        // Normalize options
        options = Object.assign({}, SHADER_DEFAULT_OPTIONS, options);
        // Process options
        this.setName(options.name);
        this._stage = options.stage;
        // In case GLSL was passed, compile it into SPIRV
        if (typeof options.code === "string") {
            this._code = utils_1.CompileGLSL(options.code, ToShaderStageString(options.stage));
        }
        else {
            this._code = options.code;
        }
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
     * Returns the shader's SPIRV code
     */
    getCode() { return this._code; }
    /**
     * Returns the shader's stage
     */
    getStage() { return this._stage; }
    /**
     * Destroy this Object
     */
    destroy() {
        this._name = null;
        this._code = null;
        this.emit("destroy");
    }
}
exports.Shader = Shader;
;
//# sourceMappingURL=index.js.map