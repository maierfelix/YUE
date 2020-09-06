/**
 * Supported shader stages
 */
export declare enum SHADER_STAGE {
    NONE = 0,
    VERTEX = 1,
    FRAGMENT = 2
}
/**
 * Supported shader vertex attributes
 */
export declare enum SHADER_ATTRIBUTE {
    NONE = 0,
    UCHAR2 = 1,
    UCHAR4 = 2,
    CHAR2 = 3,
    CHAR4 = 4,
    UCHAR2_NORM = 5,
    UCHAR4_NORM = 6,
    CHAR2_NORM = 7,
    CHAR4_NORM = 8,
    USHORT2 = 9,
    USHORT4 = 10,
    SHORT2 = 11,
    SHORT4 = 12,
    USHORT2_NORM = 13,
    USHORT4_NORM = 14,
    SHORT2_NORM = 15,
    SHORT4_NORM = 16,
    HALF2 = 17,
    HALF4 = 18,
    FLOAT = 19,
    FLOAT2 = 20,
    FLOAT3 = 21,
    FLOAT4 = 22,
    UINT = 23,
    UINT2 = 24,
    UINT3 = 25,
    UINT4 = 26,
    INT = 27,
    INT2 = 28,
    INT3 = 29,
    INT4 = 30
}
/**
 * Supported shader uniforms
 */
export declare enum SHADER_UNIFORM {
    NONE = 0,
    UNIFORM_BUFFER = 1,
    STORAGE_BUFFER = 2,
    STORAGE_BUFFER_READONLY = 3,
    SAMPLER = 4,
    TEXTURE = 5,
    STORAGE_TEXTURE = 6
}
/**
 * Supported culling modes
 */
export declare enum MATERIAL_CULL_MODE {
    NONE = 0,
    FRONT = 1,
    BACK = 2
}
/**
 * Supported blending modes
 */
export declare enum MATERIAL_BLEND_MODE {
    NONE = 0,
    PREMULTIPLY = 1
}
/**
 * Supported sampler filtering modes
 */
export declare enum SAMPLER_FILTER_MODE {
    NONE = 0,
    NEAREST = 1,
    LINEAR = 2
}
/**
 * Supported sampler wrapping modes
 */
export declare enum SAMPLER_WRAP_MODE {
    NONE = 0,
    CLAMP_TO_EDGE = 1,
    REPEAT = 2,
    MIRROR_REPEAT = 3
}
/**
 * Supported texture formats
 */
export declare enum TEXTURE_FORMAT {
    NONE = 0,
    R8_UNORM = 1,
    R8_SNORM = 2,
    R8_UINT = 3,
    R8_SINT = 4,
    R16_UINT = 5,
    R16_SINT = 6,
    R16_FLOAT = 7,
    RG8_UNORM = 8,
    RG8_SNORM = 9,
    RG8_UINT = 10,
    RG8_SINT = 11,
    R32_UINT = 12,
    R32_SINT = 13,
    R32_FLOAT = 14,
    RG16_UINT = 15,
    RG16_SINT = 16,
    RG16_FLOAT = 17,
    RGBA8_UNORM = 18,
    RGBA8_UNORM_SRGB = 19,
    RGBA8_SNORM = 20,
    RGBA8_UINT = 21,
    RGBA8_SINT = 22,
    BGRA8_UNORM = 23,
    BGRA8_UNORM_SRGB = 24,
    RG32_UINT = 25,
    RG32_SINT = 26,
    RG32_FLOAT = 27,
    RGBA16_UINT = 28,
    RGBA16_SINT = 29,
    RGBA16_FLOAT = 30,
    RGBA32_UINT = 31,
    RGBA32_SINT = 32,
    RGBA32_FLOAT = 33,
    BC1_RGBA_UNORM = 34,
    BC1_RGBA_UNORM_SRGB = 35,
    BC2_RGBA_UNORM = 36,
    BC2_RGBA_UNORM_SRGB = 37,
    BC3_RGBA_UNORM = 38,
    BC3_RGBA_UNORM_SRGB = 39,
    BC4_R_UNORM = 40,
    BC4_R_SNORM = 41,
    BC5_RG_UNORM = 42,
    BC5_RG_SNORM = 43,
    BC6H_RGB_UFLOAT = 44,
    BC6H_RGB_FLOAT = 45,
    BC7_RGBA_UNORM = 46,
    BC7_RGBA_UNORM_SRGB = 47
}
