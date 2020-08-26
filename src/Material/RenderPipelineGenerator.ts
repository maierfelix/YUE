import { Material } from ".";

import { SHADER_ATTRIBUTE, SHADER_UNIFORM, SHADER_STAGE } from "../constants";
import { IMaterialUniformOptions } from "..";
import { Warn } from "../utils";

function ToWGPUShaderStage(stages: SHADER_STAGE): GPUShaderStageFlags {
  let flags: GPUShaderStageFlags = 0;
  if (stages & SHADER_STAGE.VERTEX) {
    flags |= GPUShaderStage.VERTEX;
  }
  if (stages & SHADER_STAGE.FRAGMENT) {
    flags |= GPUShaderStage.FRAGMENT;
  }
  return flags;
};

function ToWGPUBindingType(uniformType: SHADER_UNIFORM): GPUBindingType {
  switch (uniformType) {
    case SHADER_UNIFORM.NONE:
      throw new Error(`'SHADER_UNIFORM.NONE' is not a valid binding type`);
    case SHADER_UNIFORM.UNIFORM_BUFFER:
      return "uniform-buffer";
    case SHADER_UNIFORM.STORAGE_BUFFER:
      return "storage-buffer";
    case SHADER_UNIFORM.STORAGE_BUFFER_READONLY:
      return "readonly-storage-buffer";
    case SHADER_UNIFORM.TEXTURE:
      return "sampled-texture";
    case SHADER_UNIFORM.STORAGE_TEXTURE:
      return "readonly-storage-texture";
  };
}

function ToWGPUVertexFormat(attributeType: SHADER_ATTRIBUTE): GPUVertexFormat {
  switch (attributeType) {
    case SHADER_ATTRIBUTE.NONE:
      throw new Error(`'SHADER_ATTRIBUTE.NONE' is not a valid attribute type`);
    case SHADER_ATTRIBUTE.UCHAR2:
      return "uchar2";
    case SHADER_ATTRIBUTE.UCHAR4:
      return "uchar4";
    case SHADER_ATTRIBUTE.CHAR2:
      return "char2";
    case SHADER_ATTRIBUTE.CHAR4:
      return "char4";
    case SHADER_ATTRIBUTE.UCHAR2_NORM:
      return "uchar2norm";
    case SHADER_ATTRIBUTE.UCHAR4_NORM:
      return "uchar4norm";
    case SHADER_ATTRIBUTE.CHAR2_NORM:
      return "char2norm";
    case SHADER_ATTRIBUTE.CHAR4_NORM:
      return "char4norm";
    case SHADER_ATTRIBUTE.USHORT2:
      return "ushort2";
    case SHADER_ATTRIBUTE.USHORT4:
      return "ushort4";
    case SHADER_ATTRIBUTE.SHORT2:
      return "short2";
    case SHADER_ATTRIBUTE.SHORT4:
      return "short4";
    case SHADER_ATTRIBUTE.USHORT2_NORM:
      return "ushort2norm";
    case SHADER_ATTRIBUTE.USHORT4_NORM:
      return "ushort4norm";
    case SHADER_ATTRIBUTE.SHORT2_NORM:
      return "short2norm";
    case SHADER_ATTRIBUTE.SHORT4_NORM:
      return "short4norm";
    case SHADER_ATTRIBUTE.HALF2:
      return "half2";
    case SHADER_ATTRIBUTE.HALF4:
      return "half4";
    case SHADER_ATTRIBUTE.FLOAT:
      return "float";
    case SHADER_ATTRIBUTE.FLOAT2:
      return "float2";
    case SHADER_ATTRIBUTE.FLOAT3:
      return "float3";
    case SHADER_ATTRIBUTE.FLOAT4:
      return "float4";
    case SHADER_ATTRIBUTE.UINT:
      return "uint";
    case SHADER_ATTRIBUTE.UINT2:
      return "uint2";
    case SHADER_ATTRIBUTE.UINT3:
      return "uint3";
    case SHADER_ATTRIBUTE.UINT4:
      return "uint4";
    case SHADER_ATTRIBUTE.INT:
      return "int";
    case SHADER_ATTRIBUTE.INT2:
      return "int2";
    case SHADER_ATTRIBUTE.INT3:
      return "int3";
    case SHADER_ATTRIBUTE.INT4:
      return "int4";
  };
};

function GetShaderAttributeComponentCount(attributeType: SHADER_ATTRIBUTE): number {
  switch (attributeType) {
    case SHADER_ATTRIBUTE.NONE:
      throw new Error(`'SHADER_ATTRIBUTE.NONE' is not a valid attribute type`);
    case SHADER_ATTRIBUTE.FLOAT:
    case SHADER_ATTRIBUTE.UINT:
    case SHADER_ATTRIBUTE.INT:
      return 1;
    case SHADER_ATTRIBUTE.UCHAR2:
    case SHADER_ATTRIBUTE.CHAR2:
    case SHADER_ATTRIBUTE.UCHAR2_NORM:
    case SHADER_ATTRIBUTE.CHAR2_NORM:
    case SHADER_ATTRIBUTE.USHORT2:
    case SHADER_ATTRIBUTE.SHORT2:
    case SHADER_ATTRIBUTE.USHORT2_NORM:
    case SHADER_ATTRIBUTE.SHORT2_NORM:
    case SHADER_ATTRIBUTE.HALF2:
    case SHADER_ATTRIBUTE.FLOAT2:
    case SHADER_ATTRIBUTE.UINT2:
    case SHADER_ATTRIBUTE.INT2:
      return 2;
    case SHADER_ATTRIBUTE.FLOAT3:
    case SHADER_ATTRIBUTE.UINT3:
    case SHADER_ATTRIBUTE.INT3:
      return 3;
    case SHADER_ATTRIBUTE.UCHAR4:
    case SHADER_ATTRIBUTE.CHAR4:
    case SHADER_ATTRIBUTE.UCHAR4_NORM:
    case SHADER_ATTRIBUTE.CHAR4_NORM:
    case SHADER_ATTRIBUTE.USHORT4:
    case SHADER_ATTRIBUTE.SHORT4:
    case SHADER_ATTRIBUTE.USHORT4_NORM:
    case SHADER_ATTRIBUTE.SHORT4_NORM:
    case SHADER_ATTRIBUTE.HALF4:
    case SHADER_ATTRIBUTE.FLOAT4:
    case SHADER_ATTRIBUTE.UINT4:
    case SHADER_ATTRIBUTE.INT4:
      return 4;
  };
};

function GetShaderAttributeComponentSize(attributeType: SHADER_ATTRIBUTE): number {
  switch (attributeType) {
    case SHADER_ATTRIBUTE.NONE:
      throw new Error(`'SHADER_ATTRIBUTE.NONE' is not a valid attribute type`);
    case SHADER_ATTRIBUTE.UCHAR2:
    case SHADER_ATTRIBUTE.UCHAR4:
    case SHADER_ATTRIBUTE.CHAR2:
    case SHADER_ATTRIBUTE.CHAR4:
    case SHADER_ATTRIBUTE.UCHAR2_NORM:
    case SHADER_ATTRIBUTE.UCHAR4_NORM:
    case SHADER_ATTRIBUTE.CHAR2_NORM:
    case SHADER_ATTRIBUTE.CHAR4_NORM:
      return Uint8Array.BYTES_PER_ELEMENT;
    case SHADER_ATTRIBUTE.USHORT2:
    case SHADER_ATTRIBUTE.USHORT4:
    case SHADER_ATTRIBUTE.SHORT2:
    case SHADER_ATTRIBUTE.SHORT4:
    case SHADER_ATTRIBUTE.USHORT2_NORM:
    case SHADER_ATTRIBUTE.USHORT4_NORM:
    case SHADER_ATTRIBUTE.SHORT2_NORM:
    case SHADER_ATTRIBUTE.SHORT4_NORM:
    case SHADER_ATTRIBUTE.HALF2:
    case SHADER_ATTRIBUTE.HALF4:
      return Uint16Array.BYTES_PER_ELEMENT;
    case SHADER_ATTRIBUTE.FLOAT:
    case SHADER_ATTRIBUTE.FLOAT2:
    case SHADER_ATTRIBUTE.FLOAT3:
    case SHADER_ATTRIBUTE.FLOAT4:
      return Float32Array.BYTES_PER_ELEMENT;
    case SHADER_ATTRIBUTE.UINT:
    case SHADER_ATTRIBUTE.UINT2:
    case SHADER_ATTRIBUTE.UINT3:
    case SHADER_ATTRIBUTE.UINT4:
    case SHADER_ATTRIBUTE.INT:
    case SHADER_ATTRIBUTE.INT2:
    case SHADER_ATTRIBUTE.INT3:
    case SHADER_ATTRIBUTE.INT4:
      return Uint32Array.BYTES_PER_ELEMENT;
  };
};

export interface IBindGroupResource {
  id: number;
  resource: GPUBuffer | GPUSampler | GPUTextureView;
};

export interface IRenderPipeline {
  pipeline: GPURenderPipeline;
  bindGroupLayout: GPUBindGroupLayout;
};

export class RenderPipelineGenerator {

  /**
   * Generates the vertex state descriptor for the passed material
   * @param material 
   */
  public static generateVertexStateDescriptor(material: Material): GPUVertexStateDescriptor {
    const attributes: GPUVertexAttributeDescriptor[] = [];
    let location = 0;
    let totalByteOffset = 0x0;
    for (const attribute of material.getAttributes()) {
      const {type, byteOffset} = attribute;
      // if no byte offset is defined, then use the calculated one
      const offset = (byteOffset === -1 ? totalByteOffset : byteOffset);
      attributes.push({
        shaderLocation: location,
        format: ToWGPUVertexFormat(type),
        offset: offset
      });
      const attribComponentCount = GetShaderAttributeComponentCount(type);
      const attribComponentSize = GetShaderAttributeComponentSize(type);
      totalByteOffset += attribComponentCount * attribComponentSize;
      location++;
    };
    const out: GPUVertexStateDescriptor = {
      indexFormat: "uint32", // TODO: do better
      vertexBuffers: [
        {
          arrayStride: totalByteOffset,
          stepMode: "vertex",
          attributes
        },
      ]
    };
    return out;
  }

  public static generateBindGroupLayoutEntry(bindingId: number, visibility: GPUShaderStageFlags, uniform: IMaterialUniformOptions): GPUBindGroupLayoutEntry {
    let {id, type} = uniform;
    const binding = (id === -1 ? bindingId : id);
    const out: GPUBindGroupLayoutEntry = {
      binding,
      visibility,
      type: ToWGPUBindingType(type)
    };
    return out;
  }

  public static generateBindGroupLayoutDescriptor(material: Material): GPUBindGroupLayoutDescriptor {
    const bindGroupEntries: GPUBindGroupLayoutEntry[] = [];
    let bindingId = 0;
    // Generate bindgroup layouts
    for (const uniform of material.getUniforms()) {
      const stage = ToWGPUShaderStage(uniform.visibility);
      bindGroupEntries.push(
        RenderPipelineGenerator.generateBindGroupLayoutEntry(bindingId, stage, uniform)
      );
      bindingId++;
    };
    const out: GPUBindGroupLayoutDescriptor = {
      entries: bindGroupEntries
    };
    return out;
  }

  public static generateBindGroupResources(material: Material, filterShared: boolean, device: GPUDevice): IBindGroupResource[] {
    const uniforms = material.getUniforms();
    const out: IBindGroupResource[] = [];
    for (const shaderUniform of uniforms) {
      const {id, type, isShared, byteLength} = shaderUniform;
      if (isShared !== filterShared) {
        out.push(material.getSharedUniformResourceById(id));
        continue;
      }
      switch (type) {
        case SHADER_UNIFORM.UNIFORM_BUFFER: {
          const buffer = device.createBuffer({
            size: byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
          });
          out.push({ id, resource: buffer });
        } break;
        case SHADER_UNIFORM.STORAGE_BUFFER:
        case SHADER_UNIFORM.STORAGE_BUFFER_READONLY: {
          const buffer = device.createBuffer({
            size: byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
          });
          out.push({ id, resource: buffer });
        } break;
        case SHADER_UNIFORM.TEXTURE:
        case SHADER_UNIFORM.STORAGE_TEXTURE: {
          Warn("TODO");
        } break;
      };
    };
    return out;
  }

  public static generateBindGroup(material: Material, resources: IBindGroupResource[], device: GPUDevice): GPUBindGroup {
    const bindGroupEntries: GPUBindGroupEntry[] = [];
    const uniforms = material.getUniforms();
    for (let ii = 0; ii < uniforms.length; ++ii) {
      const {name, id, type, isShared} = uniforms[ii];
      let bindGroupResource = null;
      // If the uniform is shared, pick its resource from the material
      if (isShared) bindGroupResource = material.getSharedUniformResourceById(id);
      // If uniform isn't shared, pick the resource from the mesh
      else bindGroupResource = resources[ii];
      const {resource} = bindGroupResource;
      switch (type) {
        case SHADER_UNIFORM.UNIFORM_BUFFER:
        case SHADER_UNIFORM.STORAGE_BUFFER:
        case SHADER_UNIFORM.STORAGE_BUFFER_READONLY: {
          bindGroupEntries.push({
            binding: id,
            resource: { buffer: resource as GPUBuffer }
          });
        } break;
        case SHADER_UNIFORM.TEXTURE:
        case SHADER_UNIFORM.STORAGE_TEXTURE: {
          Warn("TODO");
        } break;
      };
    };
    const {bindGroupLayout} = material.getRenderPipeline();
    const out = device.createBindGroup({
      layout: bindGroupLayout,
      entries: bindGroupEntries
    });
    return out;
  }

  public static generate(material: Material, device: GPUDevice): IRenderPipeline {
    const vertexStateDescriptor = RenderPipelineGenerator.generateVertexStateDescriptor(material);
    const vertexStageDescriptor: GPUProgrammableStageDescriptor = {
      module: device.createShaderModule({
        code: material.getVertexShader().getCode()
      }),
      entryPoint: "main"
    };
    const fragmentShaderModule = device.createShaderModule({
      code: material.getFragmentShader().getCode()
    });
    const fragmentStageDescriptor: GPUProgrammableStageDescriptor = {
      module: fragmentShaderModule,
      entryPoint: "main"
    };
    // TODO: allow non-depth writing
    const depthStencilStateDescriptor: GPUDepthStencilStateDescriptor = {
      depthWriteEnabled: true,
      depthCompare: "less",
      format: "depth24plus-stencil8"
    };
    const rasterizationStateDescriptor: GPURasterizationStateDescriptor = {
      cullMode: "none"
    };
    // TODO: allow to render into FBOs
    const colorStatesDescriptor: GPUColorStateDescriptor[] = [{
      format: "bgra8unorm"
    }];
    const bindGroupLayout = device.createBindGroupLayout(
      RenderPipelineGenerator.generateBindGroupLayoutDescriptor(material)
    );
    const layout = device.createPipelineLayout({
      bindGroupLayouts: [ bindGroupLayout ]
    });
    const renderPipelineDescriptor: GPURenderPipelineDescriptor = {
      layout,
      vertexStage: vertexStageDescriptor,
      fragmentStage: fragmentStageDescriptor,
      primitiveTopology: "triangle-list",
      depthStencilState: depthStencilStateDescriptor,
      vertexState: vertexStateDescriptor,
      rasterizationState: rasterizationStateDescriptor,
      colorStates: colorStatesDescriptor
    };
    const pipeline = device.createRenderPipeline(renderPipelineDescriptor);
    return { pipeline, bindGroupLayout };
  }

};
