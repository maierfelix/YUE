"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetStringHash = exports.Unreachable = exports.Error = exports.Warn = exports.Log = exports.FetchText = exports.Clamp = exports.FixateToZero = exports.EventEmitter = exports.CompileGLSL = void 0;
const eventemitter3_1 = __importDefault(require("eventemitter3"));
exports.EventEmitter = eventemitter3_1.default;
const glslangModule = __importStar(require("@webgpu/glslang"));
let glslangModuleCache = null;
function CompileGLSL(glsl, type) {
    if (glslangModuleCache === null)
        glslangModuleCache = glslangModule.default();
    return glslangModuleCache.compileGLSL(glsl, type);
}
exports.CompileGLSL = CompileGLSL;
;
function FixateToZero(value, range) {
    if (value > 0 && value <= range)
        return 0.0;
    if (value < 0 && value >= -range)
        return 0.0;
    return value;
}
exports.FixateToZero = FixateToZero;
;
function Clamp(value, min, max) {
    return Math.max(Math.min(max, value), min);
}
exports.Clamp = Clamp;
;
function FetchText(path) {
    return new Promise(resolve => {
        fetch(path).then(resp => resp.text().then(resolve));
    });
}
exports.FetchText = FetchText;
;
function Log(...args) {
    console.log(...args);
}
exports.Log = Log;
;
function Warn(...args) {
    console.warn(...args);
}
exports.Warn = Warn;
;
function Error(...args) {
    console.error(...args);
}
exports.Error = Error;
;
function Unreachable() {
    throw new ReferenceError(`Unreachable code hit`);
}
exports.Unreachable = Unreachable;
;
function GetStringHash(str) {
    let hash = 0;
    for (let ii = 0; ii < str.length; ++ii) {
        hash = ((hash << 5) - hash + str.charCodeAt(ii)) << 0;
    }
    ;
    return hash;
}
exports.GetStringHash = GetStringHash;
;
//# sourceMappingURL=utils.js.map