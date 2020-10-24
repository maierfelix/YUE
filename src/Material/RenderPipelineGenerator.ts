import {Material} from ".";

import {SHADER_ATTRIBUTE, SHADER_UNIFORM, SHADER_STAGE, SAMPLER_WRAP_MODE, SAMPLER_FILTER_MODE, TEXTURE_FORMAT, MATERIAL_CULL_MODE, MATERIAL_BLEND_MODE, MATERIAL_COLOR_WRITE} from "../constants";
import {Unreachable} from "../utils";
import {Sampler} from "../Sampler";
import {Texture} from "../Texture";

export function ToWGPUShaderStage(stages: SHADER_STAGE): GPUShaderStageFlags {
  let flags: GPUShaderStageFlags = 0;
  if (stages & SHADER_STAGE.VERTEX) {
    flags |= GPUShaderStage.VERTEX;
  }
  if (stages & SHADER_STAGE.FRAGMENT) {
    flags |= GPUShaderStage.FRAGMENT;
  }
  return flags;
}

export function ToWGPUColorWrite(colorWrite: MATERIAL_COLOR_WRITE): GPUColorWriteFlags {
  let flags: GPUColorWriteFlags = 0;
  if (colorWrite & MATERIAL_COLOR_WRITE.RED) {
    flags |= GPUColorWrite.RED;
    return flags;
  }
  if (colorWrite & MATERIAL_COLOR_WRITE.GREEN) {
    flags |= GPUColorWrite.GREEN;
  }
  if (colorWrite & MATERIAL_COLOR_WRITE.BLUE) {
    flags |= GPUColorWrite.BLUE;
  }
  if (colorWrite & MATERIAL_COLOR_WRITE.ALPHA) {
    flags |= GPUColorWrite.ALPHA;
  }
  if (colorWrite & MATERIAL_COLOR_WRITE.ALL) {
    flags |= GPUColorWrite.ALL;
  }
  return flags;
}

export function ToWGPUBindingType(uniformType: SHADER_UNIFORM): GPUBindingType {
  switch (uniformType) {
    case SHADER_UNIFORM.NONE:
      throw new Error(`'SHADER_UNIFORM.NONE' is not a valid binding type`);
    case SHADER_UNIFORM.UNIFORM_BUFFER:
      return "uniform-buffer";
    case SHADER_UNIFORM.STORAGE_BUFFER:
      return "storage-buffer";
    case SHADER_UNIFORM.STORAGE_BUFFER_READONLY:
      return "readonly-storage-buffer";
    case SHADER_UNIFORM.SAMPLER:
      return "sampler";
    case SHADER_UNIFORM.TEXTURE:
      return "sampled-texture";
    case SHADER_UNIFORM.STORAGE_TEXTURE:
      return "readonly-storage-texture";
  }
  Unreachable();
}

export function ToWGPUVertexFormat(attributeType: SHADER_ATTRIBUTE): GPUVertexFormat {
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
  }
  Unreachable();
}

export function ToWGPUAddressMode(wrappingMode: SAMPLER_WRAP_MODE): GPUAddressMode {
  switch (wrappingMode) {
    case SAMPLER_WRAP_MODE.NONE:
      throw new Error(`'SAMPLER_WRAP_MODE.NONE' is not a valid wrapping mode`);
    case SAMPLER_WRAP_MODE.CLAMP_TO_EDGE:
      return "clamp-to-edge";
    case SAMPLER_WRAP_MODE.REPEAT:
      return "repeat";
    case SAMPLER_WRAP_MODE.MIRROR_REPEAT:
      return "mirror-repeat";
  }
  Unreachable();
}

export function ToWGPUFilterMode(filterMode: SAMPLER_FILTER_MODE): GPUFilterMode {
  switch (filterMode) {
    case SAMPLER_FILTER_MODE.NONE:
      throw new Error(`'SAMPLER_FILTER_MODE.NONE' is not a valid filtering mode`);
    case SAMPLER_FILTER_MODE.NEAREST:
      return "nearest";
    case SAMPLER_FILTER_MODE.LINEAR:
      return "linear";
  }
  Unreachable();
}

export function ToWGPUCullMode(cullMode: MATERIAL_CULL_MODE): GPUCullMode {
  switch (cullMode) {
    case MATERIAL_CULL_MODE.NONE:
      return "none";
    case MATERIAL_CULL_MODE.FRONT:
      return "front";
    case MATERIAL_CULL_MODE.BACK:
      return "back";
  }
  Unreachable();
}

export function ToWGPUTextureFormat(textureFormat: TEXTURE_FORMAT): GPUTextureFormat {
  switch (textureFormat) {
    case TEXTURE_FORMAT.NONE:
      throw new Error(`'TEXTURE_FORMAT.NONE' is not a valid texture format`);
    case TEXTURE_FORMAT.R8_UNORM:
      return "r8unorm";
    case TEXTURE_FORMAT.R8_SNORM:
      return "r8snorm";
    case TEXTURE_FORMAT.R8_UINT:
      return "r8uint";
    case TEXTURE_FORMAT.R8_SINT:
      return "r8sint";
    case TEXTURE_FORMAT.R16_UINT:
      return "r16uint";
    case TEXTURE_FORMAT.R16_SINT:
      return "r16sint";
    case TEXTURE_FORMAT.R16_FLOAT:
      return "r16float";
    case TEXTURE_FORMAT.RG8_UNORM:
      return "rg8unorm";
    case TEXTURE_FORMAT.RG8_SNORM:
      return "rg8snorm";
    case TEXTURE_FORMAT.RG8_UINT:
      return "rg8uint";
    case TEXTURE_FORMAT.RG8_SINT:
      return "rg8sint";
    case TEXTURE_FORMAT.R32_UINT:
      return "r32uint";
    case TEXTURE_FORMAT.R32_SINT:
      return "r32sint";
    case TEXTURE_FORMAT.R32_FLOAT:
      return "r32float";
    case TEXTURE_FORMAT.RG16_UINT:
      return "rg16uint";
    case TEXTURE_FORMAT.RG16_SINT:
      return "rg16sint";
    case TEXTURE_FORMAT.RG16_FLOAT:
      return "rg16float";
    case TEXTURE_FORMAT.RGBA8_UNORM:
      return "rgba8unorm";
    case TEXTURE_FORMAT.RGBA8_UNORM_SRGB:
      return "rgba8unorm-srgb";
    case TEXTURE_FORMAT.RGBA8_SNORM:
      return "rgba8snorm";
    case TEXTURE_FORMAT.RGBA8_UINT:
      return "rgba8uint";
    case TEXTURE_FORMAT.RGBA8_SINT:
      return "rgba8sint";
    case TEXTURE_FORMAT.BGRA8_UNORM:
      return "bgra8unorm";
    case TEXTURE_FORMAT.BGRA8_UNORM_SRGB:
      return "bgra8unorm-srgb";
    case TEXTURE_FORMAT.RG32_UINT:
      return "rg32uint";
    case TEXTURE_FORMAT.RG32_SINT:
      return "rg32sint";
    case TEXTURE_FORMAT.RG32_FLOAT:
      return "rg32float";
    case TEXTURE_FORMAT.RGBA16_UINT:
      return "rgba16uint";
    case TEXTURE_FORMAT.RGBA16_SINT:
      return "rgba16sint";
    case TEXTURE_FORMAT.RGBA16_FLOAT:
      return "rgba16float";
    case TEXTURE_FORMAT.RGBA32_UINT:
      return "rgba32uint";
    case TEXTURE_FORMAT.RGBA32_SINT:
      return "rgba32sint";
    case TEXTURE_FORMAT.RGBA32_FLOAT:
      return "rgba32float";
    case TEXTURE_FORMAT.BC1_RGBA_UNORM:
      return "bc1-rgba-unorm";
    case TEXTURE_FORMAT.BC1_RGBA_UNORM_SRGB:
      return "bc1-rgba-unorm-srgb";
    case TEXTURE_FORMAT.BC2_RGBA_UNORM:
      return "bc2-rgba-unorm";
    case TEXTURE_FORMAT.BC2_RGBA_UNORM_SRGB:
      return "bc2-rgba-unorm-srgb";
    case TEXTURE_FORMAT.BC3_RGBA_UNORM:
      return "bc3-rgba-unorm";
    case TEXTURE_FORMAT.BC3_RGBA_UNORM_SRGB:
      return "bc3-rgba-unorm-srgb";
    case TEXTURE_FORMAT.BC4_R_UNORM:
      return "bc4-r-unorm";
    case TEXTURE_FORMAT.BC4_R_SNORM:
      return "bc4-r-snorm";
    case TEXTURE_FORMAT.BC5_RG_UNORM:
      return "bc5-rg-unorm";
    case TEXTURE_FORMAT.BC5_RG_SNORM:
      return "bc5-rg-snorm";
    case TEXTURE_FORMAT.BC6H_RGB_UFLOAT:
      return "bc6h-rgb-ufloat";
    case TEXTURE_FORMAT.BC6H_RGB_FLOAT:
      return "bc6h-rgb-sfloat";
    case TEXTURE_FORMAT.BC7_RGBA_UNORM:
      return "bc7-rgba-unorm";
    case TEXTURE_FORMAT.BC7_RGBA_UNORM_SRGB:
      return "bc7-rgba-unorm-srgb";
    case TEXTURE_FORMAT.DEPTH24_PLUS:
      return "depth24plus";
    case TEXTURE_FORMAT.DEPTH32_FLOAT:
      return "depth32float";
  }
  Unreachable();
}

export function GetShaderAttributeComponentCount(attributeType: SHADER_ATTRIBUTE): number {
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
  }
  Unreachable();
}

export function GetShaderAttributeComponentSize(attributeType: SHADER_ATTRIBUTE): number {
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
  }
  Unreachable();
}

export interface IBindGroupResource {
  id: number;
  resource: GPUBuffer | GPUSampler | GPUTextureView;
}

export interface IRenderPipeline {
  pipeline: GPURenderPipeline;
  bindGroupLayout: GPUBindGroupLayout;
}

export class RenderPipelineGenerator {

  /**
   * Generates the descriptor to construct a new GPUSampler
   * @param sampler - Sampler object
   */
  public static GenerateSamplerDescriptor(sampler: Sampler): GPUSamplerDescriptor {
    const addressMode = sampler.getAddressMode();
    const out: GPUSamplerDescriptor = {
      magFilter: ToWGPUFilterMode(sampler.getFilterMode()),
      minFilter: ToWGPUFilterMode(sampler.getFilterMode()),
      addressModeU: ToWGPUAddressMode(addressMode.U),
      addressModeV: ToWGPUAddressMode(addressMode.V),
      addressModeW: ToWGPUAddressMode(addressMode.W)
    };
    return out;
  }

  /**
   * Generates a GPUColorStateDescriptor based on the provided blend mode
   * @param material - Material object
   */
  public static GenerateColorStateDescriptor(material: Material): GPUColorStateDescriptor[] {
    const blendMode = material.getBlendMode();
    const colorWrite = material.getColorWrite();
    const out: GPUColorStateDescriptor = {
      format: "bgra8unorm",
      colorBlend: {srcFactor: "one", dstFactor: "zero", operation: "add"},
      alphaBlend: {srcFactor: "one", dstFactor: "zero", operation: "add"},
      writeMask: ToWGPUColorWrite(colorWrite)
    };
    switch (blendMode) {
      case MATERIAL_BLEND_MODE.NONE: {
        // Nothing to do
      } break;
      case MATERIAL_BLEND_MODE.PREMULTIPLY: {
        out.colorBlend = {srcFactor: "src-alpha", dstFactor: "one-minus-src-alpha", operation: "add"};
        out.alphaBlend = {srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add"};
      } break;
    }
    return [out];
  }

  /**
   * Generates the descriptor to constructor a new GPUTexture
   * @param texture - Texture object
   */
  public static GenerateTextureDescriptor(texture: Texture): GPUTextureDescriptor {
    // TODO: add other texture dimensions etc.
    const out: GPUTextureDescriptor = {
      size: {
        width: texture.getWidth(),
        height: texture.getHeight(),
        depth: texture.getDepth()
      },
      mipLevelCount: 1,
      sampleCount: 1,
      dimension: "2d",
      format: ToWGPUTextureFormat(texture.getFormat()),
      usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.SAMPLED
    };
    return out;
  }

  /**
   * Generates the vertex state descriptor for the passed material
   * @param material - Material object
   */
  public static generateVertexStateDescriptor(material: Material): GPUVertexStateDescriptor {
    const attributes: GPUVertexAttributeDescriptor[] = [];
    let totalByteOffset = 0x0;
    let locationId = 0;
    // Generate vertex attributes
    for (const attribute of material.getAttributes()) {
      const {id, type, byteOffset} = attribute;
      // if no byte offset is defined then use the calculated one
      const offset = (byteOffset === -1 ? totalByteOffset : byteOffset);
      attributes.push({
        shaderLocation: (id === -1 ? locationId : id),
        format: ToWGPUVertexFormat(type),
        offset: offset
      });
      const attribComponentCount = GetShaderAttributeComponentCount(type);
      const attribComponentSize = GetShaderAttributeComponentSize(type);
      totalByteOffset += attribComponentCount * attribComponentSize;
      locationId++;
    }
    const out: GPUVertexStateDescriptor = {
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

  public static generateBindGroupLayoutDescriptor(material: Material): GPUBindGroupLayoutDescriptor {
    const bindGroupEntries: GPUBindGroupLayoutEntry[] = [];
    let bindingId = 0;
    // Generate bindgroup layouts
    for (const uniform of material.getUniforms()) {
      const {id, type} = uniform;
      const stage = ToWGPUShaderStage(uniform.visibility);
      const bindGroupEntry: GPUBindGroupLayoutEntry = {
        binding: (id === -1 ? bindingId : id),
        visibility: stage,
        type: ToWGPUBindingType(type)
      };
      bindGroupEntries.push(bindGroupEntry);
      bindingId++;
    }
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
          out.push({id, resource: buffer});
        } break;
        case SHADER_UNIFORM.STORAGE_BUFFER:
        case SHADER_UNIFORM.STORAGE_BUFFER_READONLY: {
          const buffer = device.createBuffer({
            size: byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
          });
          out.push({id, resource: buffer});
        } break;
        case SHADER_UNIFORM.SAMPLER: {
          out.push({id, resource: null});
        } break;
        case SHADER_UNIFORM.TEXTURE: {
          out.push({id, resource: null});
        } break;
        case SHADER_UNIFORM.STORAGE_TEXTURE: {
          out.push({id, resource: null});
        } break;
      }
    }
    return out;
  }

  public static generateBindGroup(material: Material, resources: IBindGroupResource[], device: GPUDevice): GPUBindGroup {
    const bindGroupEntries: GPUBindGroupEntry[] = [];
    const uniforms = material.getUniforms();
    for (let ii = 0; ii < uniforms.length; ++ii) {
      const {id, type, isShared} = uniforms[ii];
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
            resource: {buffer: resource as GPUBuffer}
          });
        } break;
        case SHADER_UNIFORM.SAMPLER: {
          if (resource === null)
            throw new ReferenceError(`No sampler bound`);
          bindGroupEntries.push({
            binding: id,
            resource: resource as GPUSampler
          });
        } break;
        case SHADER_UNIFORM.TEXTURE:
        case SHADER_UNIFORM.STORAGE_TEXTURE: {
          if (resource === null)
            throw new ReferenceError(`No texture bound`);
          bindGroupEntries.push({
            binding: id,
            resource: resource as GPUTextureView
          });
        } break;
      }
    }
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
      format: "depth32float"
    };
    const rasterizationStateDescriptor: GPURasterizationStateDescriptor = {
      cullMode: ToWGPUCullMode(material.getCullMode())
    };
    // TODO: allow to render into FBOs
    const colorStatesDescriptor: GPUColorStateDescriptor[] = (
      RenderPipelineGenerator.GenerateColorStateDescriptor(material)
    );
    const bindGroupLayout = device.createBindGroupLayout(
      RenderPipelineGenerator.generateBindGroupLayoutDescriptor(material)
    );
    const layout = device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout]
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
    return {pipeline, bindGroupLayout};
  }

}
