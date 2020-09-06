"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderPipelineGenerator = void 0;
const constants_1 = require("../constants");
const utils_1 = require("../utils");
function ToWGPUShaderStage(stages) {
    let flags = 0;
    if (stages & constants_1.SHADER_STAGE.VERTEX) {
        flags |= GPUShaderStage.VERTEX;
    }
    if (stages & constants_1.SHADER_STAGE.FRAGMENT) {
        flags |= GPUShaderStage.FRAGMENT;
    }
    return flags;
}
;
function ToWGPUBindingType(uniformType) {
    switch (uniformType) {
        case constants_1.SHADER_UNIFORM.NONE:
            throw new Error(`'SHADER_UNIFORM.NONE' is not a valid binding type`);
        case constants_1.SHADER_UNIFORM.UNIFORM_BUFFER:
            return "uniform-buffer";
        case constants_1.SHADER_UNIFORM.STORAGE_BUFFER:
            return "storage-buffer";
        case constants_1.SHADER_UNIFORM.STORAGE_BUFFER_READONLY:
            return "readonly-storage-buffer";
        case constants_1.SHADER_UNIFORM.SAMPLER:
            return "sampler";
        case constants_1.SHADER_UNIFORM.TEXTURE:
            return "sampled-texture";
        case constants_1.SHADER_UNIFORM.STORAGE_TEXTURE:
            return "readonly-storage-texture";
    }
    ;
    utils_1.Unreachable();
}
function ToWGPUVertexFormat(attributeType) {
    switch (attributeType) {
        case constants_1.SHADER_ATTRIBUTE.NONE:
            throw new Error(`'SHADER_ATTRIBUTE.NONE' is not a valid attribute type`);
        case constants_1.SHADER_ATTRIBUTE.UCHAR2:
            return "uchar2";
        case constants_1.SHADER_ATTRIBUTE.UCHAR4:
            return "uchar4";
        case constants_1.SHADER_ATTRIBUTE.CHAR2:
            return "char2";
        case constants_1.SHADER_ATTRIBUTE.CHAR4:
            return "char4";
        case constants_1.SHADER_ATTRIBUTE.UCHAR2_NORM:
            return "uchar2norm";
        case constants_1.SHADER_ATTRIBUTE.UCHAR4_NORM:
            return "uchar4norm";
        case constants_1.SHADER_ATTRIBUTE.CHAR2_NORM:
            return "char2norm";
        case constants_1.SHADER_ATTRIBUTE.CHAR4_NORM:
            return "char4norm";
        case constants_1.SHADER_ATTRIBUTE.USHORT2:
            return "ushort2";
        case constants_1.SHADER_ATTRIBUTE.USHORT4:
            return "ushort4";
        case constants_1.SHADER_ATTRIBUTE.SHORT2:
            return "short2";
        case constants_1.SHADER_ATTRIBUTE.SHORT4:
            return "short4";
        case constants_1.SHADER_ATTRIBUTE.USHORT2_NORM:
            return "ushort2norm";
        case constants_1.SHADER_ATTRIBUTE.USHORT4_NORM:
            return "ushort4norm";
        case constants_1.SHADER_ATTRIBUTE.SHORT2_NORM:
            return "short2norm";
        case constants_1.SHADER_ATTRIBUTE.SHORT4_NORM:
            return "short4norm";
        case constants_1.SHADER_ATTRIBUTE.HALF2:
            return "half2";
        case constants_1.SHADER_ATTRIBUTE.HALF4:
            return "half4";
        case constants_1.SHADER_ATTRIBUTE.FLOAT:
            return "float";
        case constants_1.SHADER_ATTRIBUTE.FLOAT2:
            return "float2";
        case constants_1.SHADER_ATTRIBUTE.FLOAT3:
            return "float3";
        case constants_1.SHADER_ATTRIBUTE.FLOAT4:
            return "float4";
        case constants_1.SHADER_ATTRIBUTE.UINT:
            return "uint";
        case constants_1.SHADER_ATTRIBUTE.UINT2:
            return "uint2";
        case constants_1.SHADER_ATTRIBUTE.UINT3:
            return "uint3";
        case constants_1.SHADER_ATTRIBUTE.UINT4:
            return "uint4";
        case constants_1.SHADER_ATTRIBUTE.INT:
            return "int";
        case constants_1.SHADER_ATTRIBUTE.INT2:
            return "int2";
        case constants_1.SHADER_ATTRIBUTE.INT3:
            return "int3";
        case constants_1.SHADER_ATTRIBUTE.INT4:
            return "int4";
    }
    ;
    utils_1.Unreachable();
}
;
function ToWGPUAddressMode(wrappingMode) {
    switch (wrappingMode) {
        case constants_1.SAMPLER_WRAP_MODE.NONE:
            throw new Error(`'SAMPLER_WRAP_MODE.NONE' is not a valid wrapping mode`);
        case constants_1.SAMPLER_WRAP_MODE.CLAMP_TO_EDGE:
            return "clamp-to-edge";
        case constants_1.SAMPLER_WRAP_MODE.REPEAT:
            return "repeat";
        case constants_1.SAMPLER_WRAP_MODE.MIRROR_REPEAT:
            return "mirror-repeat";
    }
    ;
    utils_1.Unreachable();
}
;
function ToWGPUFilterMode(filterMode) {
    switch (filterMode) {
        case constants_1.SAMPLER_FILTER_MODE.NONE:
            throw new Error(`'SAMPLER_FILTER_MODE.NONE' is not a valid filtering mode`);
        case constants_1.SAMPLER_FILTER_MODE.NEAREST:
            return "nearest";
        case constants_1.SAMPLER_FILTER_MODE.LINEAR:
            return "linear";
    }
    ;
    utils_1.Unreachable();
}
;
function ToWGPUTextureFormat(textureFormat) {
    switch (textureFormat) {
        case constants_1.TEXTURE_FORMAT.NONE:
            throw new Error(`'TEXTURE_FORMAT.NONE' is not a valid texture format`);
        case constants_1.TEXTURE_FORMAT.R8_UNORM:
            return "r8unorm";
        case constants_1.TEXTURE_FORMAT.R8_SNORM:
            return "r8snorm";
        case constants_1.TEXTURE_FORMAT.R8_UINT:
            return "r8uint";
        case constants_1.TEXTURE_FORMAT.R8_SINT:
            return "r8sint";
        case constants_1.TEXTURE_FORMAT.R16_UINT:
            return "r16uint";
        case constants_1.TEXTURE_FORMAT.R16_SINT:
            return "r16sint";
        case constants_1.TEXTURE_FORMAT.R16_FLOAT:
            return "r16float";
        case constants_1.TEXTURE_FORMAT.RG8_UNORM:
            return "rg8unorm";
        case constants_1.TEXTURE_FORMAT.RG8_SNORM:
            return "rg8snorm";
        case constants_1.TEXTURE_FORMAT.RG8_UINT:
            return "rg8uint";
        case constants_1.TEXTURE_FORMAT.RG8_SINT:
            return "rg8sint";
        case constants_1.TEXTURE_FORMAT.R32_UINT:
            return "r32uint";
        case constants_1.TEXTURE_FORMAT.R32_SINT:
            return "r32sint";
        case constants_1.TEXTURE_FORMAT.R32_FLOAT:
            return "r32float";
        case constants_1.TEXTURE_FORMAT.RG16_UINT:
            return "rg16uint";
        case constants_1.TEXTURE_FORMAT.RG16_SINT:
            return "rg16sint";
        case constants_1.TEXTURE_FORMAT.RG16_FLOAT:
            return "rg16float";
        case constants_1.TEXTURE_FORMAT.RGBA8_UNORM:
            return "rgba8unorm";
        case constants_1.TEXTURE_FORMAT.RGBA8_UNORM_SRGB:
            return "rgba8unorm-srgb";
        case constants_1.TEXTURE_FORMAT.RGBA8_SNORM:
            return "rgba8snorm";
        case constants_1.TEXTURE_FORMAT.RGBA8_UINT:
            return "rgba8uint";
        case constants_1.TEXTURE_FORMAT.RGBA8_SINT:
            return "rgba8sint";
        case constants_1.TEXTURE_FORMAT.BGRA8_UNORM:
            return "bgra8unorm";
        case constants_1.TEXTURE_FORMAT.BGRA8_UNORM_SRGB:
            return "bgra8unorm-srgb";
        case constants_1.TEXTURE_FORMAT.RG32_UINT:
            return "rg32uint";
        case constants_1.TEXTURE_FORMAT.RG32_SINT:
            return "rg32sint";
        case constants_1.TEXTURE_FORMAT.RG32_FLOAT:
            return "rg32float";
        case constants_1.TEXTURE_FORMAT.RGBA16_UINT:
            return "rgba16uint";
        case constants_1.TEXTURE_FORMAT.RGBA16_SINT:
            return "rgba16sint";
        case constants_1.TEXTURE_FORMAT.RGBA16_FLOAT:
            return "rgba16float";
        case constants_1.TEXTURE_FORMAT.RGBA32_UINT:
            return "rgba32uint";
        case constants_1.TEXTURE_FORMAT.RGBA32_SINT:
            return "rgba32sint";
        case constants_1.TEXTURE_FORMAT.RGBA32_FLOAT:
            return "rgba32float";
        case constants_1.TEXTURE_FORMAT.BC1_RGBA_UNORM:
            return "bc1-rgba-unorm";
        case constants_1.TEXTURE_FORMAT.BC1_RGBA_UNORM_SRGB:
            return "bc1-rgba-unorm-srgb";
        case constants_1.TEXTURE_FORMAT.BC2_RGBA_UNORM:
            return "bc2-rgba-unorm";
        case constants_1.TEXTURE_FORMAT.BC2_RGBA_UNORM_SRGB:
            return "bc2-rgba-unorm-srgb";
        case constants_1.TEXTURE_FORMAT.BC3_RGBA_UNORM:
            return "bc3-rgba-unorm";
        case constants_1.TEXTURE_FORMAT.BC3_RGBA_UNORM_SRGB:
            return "bc3-rgba-unorm-srgb";
        case constants_1.TEXTURE_FORMAT.BC4_R_UNORM:
            return "bc4-r-unorm";
        case constants_1.TEXTURE_FORMAT.BC4_R_SNORM:
            return "bc4-r-snorm";
        case constants_1.TEXTURE_FORMAT.BC5_RG_UNORM:
            return "bc5-rg-unorm";
        case constants_1.TEXTURE_FORMAT.BC5_RG_SNORM:
            return "bc5-rg-snorm";
        case constants_1.TEXTURE_FORMAT.BC6H_RGB_UFLOAT:
            return "bc6h-rgb-ufloat";
        case constants_1.TEXTURE_FORMAT.BC6H_RGB_FLOAT:
            return "bc6h-rgb-sfloat";
        case constants_1.TEXTURE_FORMAT.BC7_RGBA_UNORM:
            return "bc7-rgba-unorm";
        case constants_1.TEXTURE_FORMAT.BC7_RGBA_UNORM_SRGB:
            return "bc7-rgba-unorm-srgb";
    }
    ;
    utils_1.Unreachable();
}
;
function GetShaderAttributeComponentCount(attributeType) {
    switch (attributeType) {
        case constants_1.SHADER_ATTRIBUTE.NONE:
            throw new Error(`'SHADER_ATTRIBUTE.NONE' is not a valid attribute type`);
        case constants_1.SHADER_ATTRIBUTE.FLOAT:
        case constants_1.SHADER_ATTRIBUTE.UINT:
        case constants_1.SHADER_ATTRIBUTE.INT:
            return 1;
        case constants_1.SHADER_ATTRIBUTE.UCHAR2:
        case constants_1.SHADER_ATTRIBUTE.CHAR2:
        case constants_1.SHADER_ATTRIBUTE.UCHAR2_NORM:
        case constants_1.SHADER_ATTRIBUTE.CHAR2_NORM:
        case constants_1.SHADER_ATTRIBUTE.USHORT2:
        case constants_1.SHADER_ATTRIBUTE.SHORT2:
        case constants_1.SHADER_ATTRIBUTE.USHORT2_NORM:
        case constants_1.SHADER_ATTRIBUTE.SHORT2_NORM:
        case constants_1.SHADER_ATTRIBUTE.HALF2:
        case constants_1.SHADER_ATTRIBUTE.FLOAT2:
        case constants_1.SHADER_ATTRIBUTE.UINT2:
        case constants_1.SHADER_ATTRIBUTE.INT2:
            return 2;
        case constants_1.SHADER_ATTRIBUTE.FLOAT3:
        case constants_1.SHADER_ATTRIBUTE.UINT3:
        case constants_1.SHADER_ATTRIBUTE.INT3:
            return 3;
        case constants_1.SHADER_ATTRIBUTE.UCHAR4:
        case constants_1.SHADER_ATTRIBUTE.CHAR4:
        case constants_1.SHADER_ATTRIBUTE.UCHAR4_NORM:
        case constants_1.SHADER_ATTRIBUTE.CHAR4_NORM:
        case constants_1.SHADER_ATTRIBUTE.USHORT4:
        case constants_1.SHADER_ATTRIBUTE.SHORT4:
        case constants_1.SHADER_ATTRIBUTE.USHORT4_NORM:
        case constants_1.SHADER_ATTRIBUTE.SHORT4_NORM:
        case constants_1.SHADER_ATTRIBUTE.HALF4:
        case constants_1.SHADER_ATTRIBUTE.FLOAT4:
        case constants_1.SHADER_ATTRIBUTE.UINT4:
        case constants_1.SHADER_ATTRIBUTE.INT4:
            return 4;
    }
    ;
    utils_1.Unreachable();
}
;
function GetShaderAttributeComponentSize(attributeType) {
    switch (attributeType) {
        case constants_1.SHADER_ATTRIBUTE.NONE:
            throw new Error(`'SHADER_ATTRIBUTE.NONE' is not a valid attribute type`);
        case constants_1.SHADER_ATTRIBUTE.UCHAR2:
        case constants_1.SHADER_ATTRIBUTE.UCHAR4:
        case constants_1.SHADER_ATTRIBUTE.CHAR2:
        case constants_1.SHADER_ATTRIBUTE.CHAR4:
        case constants_1.SHADER_ATTRIBUTE.UCHAR2_NORM:
        case constants_1.SHADER_ATTRIBUTE.UCHAR4_NORM:
        case constants_1.SHADER_ATTRIBUTE.CHAR2_NORM:
        case constants_1.SHADER_ATTRIBUTE.CHAR4_NORM:
            return Uint8Array.BYTES_PER_ELEMENT;
        case constants_1.SHADER_ATTRIBUTE.USHORT2:
        case constants_1.SHADER_ATTRIBUTE.USHORT4:
        case constants_1.SHADER_ATTRIBUTE.SHORT2:
        case constants_1.SHADER_ATTRIBUTE.SHORT4:
        case constants_1.SHADER_ATTRIBUTE.USHORT2_NORM:
        case constants_1.SHADER_ATTRIBUTE.USHORT4_NORM:
        case constants_1.SHADER_ATTRIBUTE.SHORT2_NORM:
        case constants_1.SHADER_ATTRIBUTE.SHORT4_NORM:
        case constants_1.SHADER_ATTRIBUTE.HALF2:
        case constants_1.SHADER_ATTRIBUTE.HALF4:
            return Uint16Array.BYTES_PER_ELEMENT;
        case constants_1.SHADER_ATTRIBUTE.FLOAT:
        case constants_1.SHADER_ATTRIBUTE.FLOAT2:
        case constants_1.SHADER_ATTRIBUTE.FLOAT3:
        case constants_1.SHADER_ATTRIBUTE.FLOAT4:
            return Float32Array.BYTES_PER_ELEMENT;
        case constants_1.SHADER_ATTRIBUTE.UINT:
        case constants_1.SHADER_ATTRIBUTE.UINT2:
        case constants_1.SHADER_ATTRIBUTE.UINT3:
        case constants_1.SHADER_ATTRIBUTE.UINT4:
        case constants_1.SHADER_ATTRIBUTE.INT:
        case constants_1.SHADER_ATTRIBUTE.INT2:
        case constants_1.SHADER_ATTRIBUTE.INT3:
        case constants_1.SHADER_ATTRIBUTE.INT4:
            return Uint32Array.BYTES_PER_ELEMENT;
    }
    ;
    utils_1.Unreachable();
}
;
;
;
class RenderPipelineGenerator {
    /**
     * Generates the descriptor to construct a new GPUSampler
     * @param sampler
     */
    static GenerateSamplerDescriptor(sampler) {
        const addressMode = sampler.getAddressMode();
        const out = {
            magFilter: ToWGPUFilterMode(sampler.getFilterMode()),
            minFilter: ToWGPUFilterMode(sampler.getFilterMode()),
            addressModeU: ToWGPUAddressMode(addressMode.U),
            addressModeV: ToWGPUAddressMode(addressMode.V),
            addressModeW: ToWGPUAddressMode(addressMode.W)
        };
        return out;
    }
    /**
     * Generates the descriptor to constructor a new GPUTexture
     * @param texture
     */
    static GenerateTextureDescriptor(texture) {
        // TODO: add other texture dimensions etc.
        const out = {
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
     * @param material
     */
    static generateVertexStateDescriptor(material) {
        const attributes = [];
        let totalByteOffset = 0x0;
        let locationId = 0;
        // Generate vertex attributes
        for (const attribute of material.getAttributes()) {
            const { id, type, byteOffset } = attribute;
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
        ;
        const out = {
            indexFormat: "uint32",
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
    static generateBindGroupLayoutDescriptor(material) {
        const bindGroupEntries = [];
        let bindingId = 0;
        // Generate bindgroup layouts
        for (const uniform of material.getUniforms()) {
            const { id, type } = uniform;
            const stage = ToWGPUShaderStage(uniform.visibility);
            const bindGroupEntry = {
                binding: (id === -1 ? bindingId : id),
                visibility: stage,
                type: ToWGPUBindingType(type)
            };
            bindGroupEntries.push(bindGroupEntry);
            bindingId++;
        }
        ;
        const out = {
            entries: bindGroupEntries
        };
        return out;
    }
    static generateBindGroupResources(material, filterShared, device) {
        const uniforms = material.getUniforms();
        const out = [];
        for (const shaderUniform of uniforms) {
            const { id, type, isShared, byteLength } = shaderUniform;
            if (isShared !== filterShared) {
                out.push(material.getSharedUniformResourceById(id));
                continue;
            }
            switch (type) {
                case constants_1.SHADER_UNIFORM.UNIFORM_BUFFER:
                    {
                        const buffer = device.createBuffer({
                            size: byteLength,
                            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
                        });
                        out.push({ id, resource: buffer });
                    }
                    break;
                case constants_1.SHADER_UNIFORM.STORAGE_BUFFER:
                case constants_1.SHADER_UNIFORM.STORAGE_BUFFER_READONLY:
                    {
                        const buffer = device.createBuffer({
                            size: byteLength,
                            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
                        });
                        out.push({ id, resource: buffer });
                    }
                    break;
                case constants_1.SHADER_UNIFORM.SAMPLER:
                    {
                        out.push({ id, resource: null });
                    }
                    break;
                case constants_1.SHADER_UNIFORM.TEXTURE:
                    {
                        out.push({ id, resource: null });
                    }
                    break;
                case constants_1.SHADER_UNIFORM.STORAGE_TEXTURE:
                    {
                        out.push({ id, resource: null });
                    }
                    break;
            }
            ;
        }
        ;
        return out;
    }
    static generateBindGroup(material, resources, device) {
        const bindGroupEntries = [];
        const uniforms = material.getUniforms();
        for (let ii = 0; ii < uniforms.length; ++ii) {
            const { name, id, type, isShared } = uniforms[ii];
            let bindGroupResource = null;
            // If the uniform is shared, pick its resource from the material
            if (isShared)
                bindGroupResource = material.getSharedUniformResourceById(id);
            // If uniform isn't shared, pick the resource from the mesh
            else
                bindGroupResource = resources[ii];
            const { resource } = bindGroupResource;
            switch (type) {
                case constants_1.SHADER_UNIFORM.UNIFORM_BUFFER:
                case constants_1.SHADER_UNIFORM.STORAGE_BUFFER:
                case constants_1.SHADER_UNIFORM.STORAGE_BUFFER_READONLY:
                    {
                        bindGroupEntries.push({
                            binding: id,
                            resource: { buffer: resource }
                        });
                    }
                    break;
                case constants_1.SHADER_UNIFORM.SAMPLER:
                    {
                        if (resource === null)
                            throw new ReferenceError(`No sampler bound`);
                        bindGroupEntries.push({
                            binding: id,
                            resource: resource
                        });
                    }
                    break;
                case constants_1.SHADER_UNIFORM.TEXTURE:
                case constants_1.SHADER_UNIFORM.STORAGE_TEXTURE:
                    {
                        if (resource === null)
                            throw new ReferenceError(`No texture bound`);
                        bindGroupEntries.push({
                            binding: id,
                            resource: resource
                        });
                    }
                    break;
            }
            ;
        }
        ;
        const { bindGroupLayout } = material.getRenderPipeline();
        const out = device.createBindGroup({
            layout: bindGroupLayout,
            entries: bindGroupEntries
        });
        return out;
    }
    static generate(material, device) {
        const vertexStateDescriptor = RenderPipelineGenerator.generateVertexStateDescriptor(material);
        const vertexStageDescriptor = {
            module: device.createShaderModule({
                code: material.getVertexShader().getCode()
            }),
            entryPoint: "main"
        };
        const fragmentShaderModule = device.createShaderModule({
            code: material.getFragmentShader().getCode()
        });
        const fragmentStageDescriptor = {
            module: fragmentShaderModule,
            entryPoint: "main"
        };
        // TODO: allow non-depth writing
        const depthStencilStateDescriptor = {
            depthWriteEnabled: true,
            depthCompare: "less",
            format: "depth24plus-stencil8"
        };
        const rasterizationStateDescriptor = {
            cullMode: "none"
        };
        // TODO: allow to render into FBOs
        const colorStatesDescriptor = [{
                format: "bgra8unorm"
            }];
        const bindGroupLayout = device.createBindGroupLayout(RenderPipelineGenerator.generateBindGroupLayoutDescriptor(material));
        const layout = device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
        });
        const renderPipelineDescriptor = {
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
}
exports.RenderPipelineGenerator = RenderPipelineGenerator;
;
//# sourceMappingURL=RenderPipelineGenerator.js.map