"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plane = void 0;
class Plane {
    static getVertices() {
        return new Float32Array([
            -1.0, 0.0, -1.0,
            1.0, 0.0, -1.0,
            1.0, 0.0, 1.0,
            -1.0, 0.0, 1.0
        ]);
    }
    ;
    static getNormals() {
        return new Float32Array([
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0
        ]);
    }
    static getUVs() {
        return new Float32Array([
            1.0, 1.0,
            1.0, 0.0,
            0.0, 0.0,
            0.0, 1.0
        ]);
    }
    static getIndices() {
        return new Uint32Array([
            0, 1, 2,
            2, 3, 0
        ]);
    }
}
exports.Plane = Plane;
//# sourceMappingURL=Plane.js.map