/// <reference types="@webgpu/types" />
import { EventEmitter } from "../utils";
import { Material } from "../Material";
import { vec3, quat, mat4 } from "gl-matrix";
import { Renderer } from "../Renderer";
export interface IMeshOptions {
    name?: string;
    material: Material;
    translation?: vec3;
    rotation?: quat;
    scale?: vec3;
    indices?: ArrayBufferView;
    attributes?: ArrayBufferView;
}
export declare class Mesh extends EventEmitter {
    private _name;
    private _material;
    private _translation;
    private _rotation;
    private _scale;
    private _indices;
    private _attributes;
    private _indexCount;
    private _modelMatrix;
    private _rotationMatrix;
    private _uniformBindGroup;
    private _uniformResources;
    private _uniformUpdateQueue;
    private _indexBuffer;
    private _attributeBuffer;
    private _needsRebuildState;
    /**
     * @param options Create options
     */
    constructor(options?: IMeshOptions);
    /**
     * The mesh name
     */
    getName(): string;
    /**
     * Update the mesh name
     * @param value
     */
    setName(value: string): void;
    /**
     * The mesh's assigned material
     */
    getMaterial(): Material;
    /**
     * Update the mesh's material
     * @param value
     */
    setMaterial(value: Material): void;
    /**
     * The mesh's count
     */
    getIndexCount(): number;
    /**
     * The mesh's translation
     */
    getTranslation(): vec3;
    /**
     * Update the mesh's translation
     * @param value
     */
    setTranslation(value: vec3): void;
    /**
     * The mesh's rotation
     */
    getRotation(): quat;
    /**
     * Update the mesh's rotation
     * @param value
     */
    setRotation(value: quat): void;
    /**
     * The mesh's scale
     */
    getScale(): vec3;
    /**
     * Update the mesh's scale
     * @param value
     */
    setScale(value: vec3): void;
    /**
     * Determines if the mesh has to be rebuilt
     */
    private needsRebuild;
    /**
     * Triggers a rebuild of the mesh
     */
    private triggerRebuild;
    /**
     * Disables the rebuild trigger
     */
    private resetRebuild;
    /**
     * Translates this mesh
     * @param value
     */
    translate(value: vec3): void;
    /**
     * Rotates this mesh
     * @param value
     */
    rotate(value: quat): void;
    /**
     * Scales this mesh
     * @param value
     */
    scale(value: vec3): void;
    /**
     * Generates and returns a model matrix
     */
    getModelMatrix(): mat4;
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
     * Update the mesh indices
     * @param data The index data to update with
     */
    updateIndices(data: ArrayBufferView): void;
    /**
     * Update the mesh attributes
     * @param data The attribute data to update with
     */
    updateAttributes(data: ArrayBufferView): void;
    /**
     * Build everything required to render this mesh
     * @param renderer
     */
    build(renderer: Renderer): void;
    /**
     * Update this mesh
     * Used to e.g. process pending uniform resource updates
     * @param renderer
     */
    update(renderer: Renderer): void;
    /**
     * Render this mesh
     * @param encoder
     */
    render(encoder: GPURenderPassEncoder): void;
    /**
     * Destroy this Object
     */
    destroy(): void;
}
