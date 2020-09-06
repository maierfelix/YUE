/// <reference types="@webgpu/types" />
import { Material } from ".";
import { Sampler } from "../Sampler";
import { Texture } from "../Texture";
export interface IBindGroupResource {
    id: number;
    resource: GPUBuffer | GPUSampler | GPUTextureView;
}
export interface IRenderPipeline {
    pipeline: GPURenderPipeline;
    bindGroupLayout: GPUBindGroupLayout;
}
export declare class RenderPipelineGenerator {
    /**
     * Generates the descriptor to construct a new GPUSampler
     * @param sampler
     */
    static GenerateSamplerDescriptor(sampler: Sampler): GPUSamplerDescriptor;
    /**
     * Generates the descriptor to constructor a new GPUTexture
     * @param texture
     */
    static GenerateTextureDescriptor(texture: Texture): GPUTextureDescriptor;
    /**
     * Generates the vertex state descriptor for the passed material
     * @param material
     */
    static generateVertexStateDescriptor(material: Material): GPUVertexStateDescriptor;
    static generateBindGroupLayoutDescriptor(material: Material): GPUBindGroupLayoutDescriptor;
    static generateBindGroupResources(material: Material, filterShared: boolean, device: GPUDevice): IBindGroupResource[];
    static generateBindGroup(material: Material, resources: IBindGroupResource[], device: GPUDevice): GPUBindGroup;
    static generate(material: Material, device: GPUDevice): IRenderPipeline;
}
