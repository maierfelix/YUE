export class Plane {

  public static getVertices() {
    return new Float32Array([
      -1.0, 0.0, -1.0,
      1.0, 0.0, -1.0,
      1.0, 0.0,  1.0,
      -1.0, 0.0,  1.0
    ]);
  };

  public static getNormals() {
    return new Float32Array([
      0.0, -1.0, 0.0,
      0.0, -1.0, 0.0,
      0.0, -1.0, 0.0,
      0.0, -1.0, 0.0
    ]);
  }

  public static getUVs() {
    return new Float32Array([
      1.0, 1.0,
      1.0, 0.0,
      0.0, 0.0,
      0.0, 1.0
    ]);
  }

  public static getIndices() {
    return new Uint32Array([
      0, 1, 2,
      2, 3, 0
    ]);
  }

}
