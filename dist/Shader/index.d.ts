import { EventEmitter } from "../utils";
import { SHADER_STAGE } from "../constants";
declare type ShaderCodeType = (Uint32Array | // SPIRV
string);
export interface IShaderOptions {
    name?: string;
    stage: SHADER_STAGE;
    code: ShaderCodeType;
}
export declare class Shader extends EventEmitter {
    private _name;
    private _stage;
    private _code;
    /**
     * @param options Create options
     */
    constructor(options?: IShaderOptions);
    /**
     * The shader name
     */
    getName(): string;
    /**
     * Update the shader name
     * @param value
     */
    setName(value: string): void;
    /**
     * Returns the shader's SPIRV code
     */
    getCode(): Uint32Array;
    /**
     * Returns the shader's stage
     */
    getStage(): SHADER_STAGE;
    /**
     * Destroy this Object
     */
    destroy(): void;
}
export {};
