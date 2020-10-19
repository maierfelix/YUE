import {IMaterialAttributeOptions, SHADER_ATTRIBUTE} from "../..";

export class Plane {

  public static get AttributeLayout(): IMaterialAttributeOptions[] {
    return [
      {name: "Position", id: 0, type: SHADER_ATTRIBUTE.FLOAT3, byteOffset: 0x0 * Float32Array.BYTES_PER_ELEMENT},
      {name: "Normal",   id: 1, type: SHADER_ATTRIBUTE.FLOAT3, byteOffset: 0x3 * Float32Array.BYTES_PER_ELEMENT},
      {name: "UV",       id: 2, type: SHADER_ATTRIBUTE.FLOAT2, byteOffset: 0x6 * Float32Array.BYTES_PER_ELEMENT},
    ];
  }

  public static get Attributes() {
    return new Float32Array([
      -1.0, 0.0, -1.0,  0.0, -1.0, 0.0,  1.0, 1.0,
       1.0, 0.0, -1.0,  0.0, -1.0, 0.0,  1.0, 0.0,
       1.0, 0.0,  1.0,  0.0, -1.0, 0.0,  0.0, 0.0,
      -1.0, 0.0,  1.0,  0.0, -1.0, 0.0,  0.0, 1.0
    ]);
  }

  public static get Indices() {
    return new Uint32Array([
      0, 1, 2,
      2, 3, 0
    ]);
  }

}
