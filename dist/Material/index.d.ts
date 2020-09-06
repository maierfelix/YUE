import { EventEmitter } from "../utils";
import { SHADER_ATTRIBUTE, SHADER_UNIFORM, MATERIAL_CULL_MODE, MATERIAL_BLEND_MODE, SHADER_STAGE } from "../constants";
import { Shader } from "../";
import { IRenderPipeline, IBindGroupResource } from "./RenderPipelineGenerator";
import { Renderer } from "../Renderer";
export interface IMaterialUniformOptions {
    id: number;
    name: string;
    type: SHADER_UNIFORM;
    visibility?: SHADER_STAGE;
    isShared?: boolean;
    byteLength?: number;
}
export interface IMaterialAttributeOptions {
    id: number;
    name: string;
    type: SHADER_ATTRIBUTE;
    byteOffset?: number;
}
export interface IMaterialShaderOptions {
    shader: Shader;
    uniforms?: IMaterialUniformOptions[];
}
export interface IMaterialOptions {
    name?: string;
    attributes?: IMaterialAttributeOptions[];
    cullMode?: MATERIAL_CULL_MODE;
    blendMode?: MATERIAL_BLEND_MODE;
    vertexShader: IMaterialShaderOptions;
    fragmentShader: IMaterialShaderOptions;
}
export declare class Material extends EventEmitter {
    private _name;
    private _attributes;
    private _cullMode;
    private _blendMode;
    private _vertexShader;
    private _fragmentShader;
    private _uniforms;
    private _renderPipeline;
    private _uniformUpdateQueue;
    private _sharedUniformResources;
    private _needsRebuildState;
    /**
     * @param options Create options
     */
    constructor(options?: IMaterialOptions);
    /**
     * Generates unified uniforms and determines their visibilities
     * @param options
     */
    private generateUniforms;
    /**
     * The material name
     */
    getName(): string;
    /**
     * Update the material name
     * @param value
     */
    setName(value: string): void;
    /**
     * The shader material uniforms
     */
    getUniforms(): IMaterialUniformOptions[];
    /**
     * Returns the given shader uniform based on the provided name
     * @param name The shader uniform name
     */
    getUniformByName(name: string): IMaterialUniformOptions;
    /**
     * Returns the given uniform resource based on the provided id
     * @param id The id to lookup for
     */
    getSharedUniformResourceById(id: number): IBindGroupResource;
    /**
     * Add a new data update to the uniform update queue
     * @param id The uniform id
     * @param data The data to update with
     */
    enqueueUniformUpdate(id: number, data: any): void;
    /**
     * Updates a shader uniform
     * @param name The name of the shader uniform
     * @param data The data to update with
     */
    updateUniform(name: string, data: any): void;
    /**
     * The material attributes
     */
    getAttributes(): IMaterialAttributeOptions[];
    /**
     * The material culling mode
     */
    getCullMode(): MATERIAL_CULL_MODE;
    /**
     * The material blending mode
     */
    getBlendMode(): MATERIAL_BLEND_MODE;
    /**
     * The material vertex shader
     */
    getVertexShader(): Shader;
    /**
     * The material fragment shader
     */
    getFragmentShader(): Shader;
    /**
     * The material render pipeline
     */
    getRenderPipeline(): IRenderPipeline;
    /**
     * Determines if the material has to build a new pipeline
     */
    private needsRebuild;
    /**
     * Triggers a rebuild of the material's pipeline
     */
    private triggerRebuild;
    /**
     * Disables the rebuild trigger
     */
    private resetRebuild;
    /**
     * Build and compile the material into a render pipeline
     * @param renderer
     */
    build(renderer: Renderer): void;
    /**
     * Update this material
     * Used to e.g. process pending uniform resource updates
     * @param renderer
     */
    update(renderer: Renderer): void;
    /**
     * Destroy this Object
     */
    destroy(): void;
}
