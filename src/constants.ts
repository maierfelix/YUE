/**
 * Supported shader stages
 */
export enum SHADER_STAGE {
  NONE = 0,
  VERTEX = 1 << 0,
  FRAGMENT = 1 << 1
};

/**
 * Supported shader vertex attributes
 */
export enum SHADER_ATTRIBUTE {
  NONE,
  UCHAR2,
  UCHAR4,
  CHAR2,
  CHAR4,
  UCHAR2_NORM,
  UCHAR4_NORM,
  CHAR2_NORM,
  CHAR4_NORM,
  USHORT2,
  USHORT4,
  SHORT2,
  SHORT4,
  USHORT2_NORM,
  USHORT4_NORM,
  SHORT2_NORM,
  SHORT4_NORM,
  HALF2,
  HALF4,
  FLOAT,
  FLOAT2,
  FLOAT3,
  FLOAT4,
  UINT,
  UINT2,
  UINT3,
  UINT4,
  INT,
  INT2,
  INT3,
  INT4
};

/**
 * Supported shader uniforms
 */
export enum SHADER_UNIFORM {
  NONE,
  UNIFORM_BUFFER,
  STORAGE_BUFFER,
  STORAGE_BUFFER_READONLY,
  SAMPLER,
  TEXTURE,
  STORAGE_TEXTURE
};

/**
 * Supported culling modes
 */
export enum MATERIAL_CULL_MODE {
  NONE,
  FRONT,
  BACK
};

/**
 * Supported blending modes
 */
export enum MATERIAL_BLEND_MODE {
  NONE,
  PREMULTIPLY
};

/**
 * Supported sampler filtering modes
 */
export enum SAMPLER_FILTER_MODE {
  NONE,
  NEAREST,
  LINEAR
};

/**
 * Supported sampler wrapping modes
 */
export enum SAMPLER_WRAP_MODE {
  NONE,
  CLAMP_TO_EDGE,
  REPEAT,
  MIRROR_REPEAT
};

/**
 * Supported texture formats
 */
export enum TEXTURE_FORMAT {
  NONE,
  // 8-bit formats
  R8_UNORM,
  R8_SNORM,
  R8_UINT,
  R8_SINT,
  // 16-bit formats
  R16_UINT,
  R16_SINT,
  R16_FLOAT,
  RG8_UNORM,
  RG8_SNORM,
  RG8_UINT,
  RG8_SINT,
  // 32-bit formats
  R32_UINT,
  R32_SINT,
  R32_FLOAT,
  RG16_UINT,
  RG16_SINT,
  RG16_FLOAT,
  RGBA8_UNORM,
  RGBA8_UNORM_SRGB,
  RGBA8_SNORM,
  RGBA8_UINT,
  RGBA8_SINT,
  BGRA8_UNORM,
  BGRA8_UNORM_SRGB,
  // 64-bit formats
  RG32_UINT,
  RG32_SINT,
  RG32_FLOAT,
  RGBA16_UINT,
  RGBA16_SINT,
  RGBA16_FLOAT,
  // 128-bit formats
  RGBA32_UINT,
  RGBA32_SINT,
  RGBA32_FLOAT,
  // BC compressed formats
  BC1_RGBA_UNORM,
  BC1_RGBA_UNORM_SRGB,
  BC2_RGBA_UNORM,
  BC2_RGBA_UNORM_SRGB,
  BC3_RGBA_UNORM,
  BC3_RGBA_UNORM_SRGB,
  BC4_R_UNORM,
  BC4_R_SNORM,
  BC5_RG_UNORM,
  BC5_RG_SNORM,
  BC6H_RGB_UFLOAT,
  BC6H_RGB_FLOAT,
  BC7_RGBA_UNORM,
  BC7_RGBA_UNORM_SRGB
};
