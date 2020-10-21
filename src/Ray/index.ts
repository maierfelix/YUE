import {vec2, vec3, vec4} from "gl-matrix";
import {AABB} from "../AABB";
import {AbstractCamera} from "../Camera";

export enum TRIANGLE_FACING {
  BACK,
  FRONT
}

export interface IRayTriangleIntersection {
  facing: TRIANGLE_FACING;
  intersection: vec3;
}

export interface IAABBIntersection {
  t: number;
}

export interface IRayOptions {
  camera: AbstractCamera;
  origin?: vec3;
  direction?: vec3;
}

export const RAY_DEFAULT_OPTIONS: IRayOptions = {
  camera: null,
  origin: null,
  direction: null,
};

export class Ray {

  private _origin: vec3 = null;
  private _direction: vec3 = null;

  private _camera: AbstractCamera = null;

  /**
   * @param options - Create options
   */
  public constructor(options: IRayOptions) {
    // Normalize options
    options = Object.assign({}, RAY_DEFAULT_OPTIONS, options);
    this._origin = options.origin ? options.origin : vec3.create();
    this._direction = options.direction ? options.direction : vec3.create();
    this._camera = options.camera;
  }

  /**
   * The ray origin
   */
  public getOrigin(): vec3 { return this._origin; }

  /**
   * The ray direction
   */
  public getDirection(): vec3 { return this._direction; }

  /**
   * Create a world-space ray based on the provided mouse position
   * @param x - The mouse X coordinate
   * @param y - The mouse Y coordinate
   */
  public fromMousePosition(x: number, y: number): Ray {
    const camera = this._camera;
    const deviceCoords = this._getDeviceCoords(x, y);
    const clipCoords = this._getClipCoords(deviceCoords);
    const cameraCoords = this._getCameraCoords(clipCoords);
    const direction = this._getRayCoords(cameraCoords);
    const origin = camera.getTranslation();
    this._origin = vec3.copy(vec3.create(), origin);
    this._direction = direction;
    return this;
  }

  /**
   * Creates a ray in world-space based on the camera center
   * @param x - The mouse X coordinate in screen-space
   * @param y - The mouse Y coordinate in screen-space
   */
  public fromCameraCenter(): Ray {
    const camera = this._camera;
    return this.fromMousePosition(
      camera.getWidth() * 0.5,
      camera.getHeight() * 0.5
    );
  }

  /**
   * Converts screen-space coordinates into device-space coordinates
   * @param x - The X coordinate in screen-space
   * @param y - The Y coordinate in screen-space
   */
  private _getDeviceCoords(x: number, y: number): vec2 {
    const out = vec2.create();
    const camera = this._camera;
    const rx = ((2.0 * x) / camera.getWidth()) - 1.0;
    const ry = ((2.0 * y) / camera.getHeight()) - 1.0;
    vec2.set(out, rx, ry);
    return out;
  }

  /**
   * Converts device-space coordinates into clip-space coordinates
   * @param pt - The 2d vector to convert into clip-space
   */
  private _getClipCoords(pt: vec2): vec4 {
    const out = vec4.create();
    vec4.set(out, pt[0], -pt[1], -1.0, 1.0);
    return out;
  }

  /**
   * Converts clip-space coordinates into camera-space coordinates
   * @param pt - The 4d clip-space vector to convert into camera-space
   */
  private _getCameraCoords(pt: vec4): vec4 {
    const out = vec4.create();
    const camera = this._camera;
    const eyeCoords = vec4.create();
    vec4.transformMat4(eyeCoords, pt, camera.getProjectionInverseMatrix());
    vec4.set(out, eyeCoords[0], eyeCoords[1], -1.0, 0.0);
    return out;
  }

  /**
   * Converts camera-space coordinates into a direction
   * @param pt - The 4d camera-space vector to convert into a direction
   */
  private _getRayCoords(pt: vec4): vec3 {
    const out = vec3.create();
    const camera = this._camera;
    const worldCoords = vec4.create();
    vec4.transformMat4(worldCoords, pt, camera.getViewInverseMatrix());
    vec3.set(out, worldCoords[0], worldCoords[1], worldCoords[2]);
    vec3.normalize(out, out);
    return out;
  }

  /**
   * Returns a ray-triangle intersection point
   * @param v0 - Triangle vertex 0
   * @param v1 - Triangle vertex 1
   * @param v2 - Triangle vertex 2
   */
  public intersectsTriangle(v0: vec3, v1: vec3, v2: vec3): IRayTriangleIntersection {
    const origin = this.getOrigin();
    const direction = this.getDirection();

    const e1 = vec3.sub(vec3.create(), v1, v0);
    const e2 = vec3.sub(vec3.create(), v2, v0);
    const r = vec3.cross(vec3.create(), direction, e2);

    const s = vec3.sub(vec3.create(), origin, v0);
    const a = vec3.dot(e1, r);
    const q = vec3.cross(vec3.create(), s, e1);

    const u = vec3.dot(s, r);
    const v = vec3.dot(direction, q);

    // Front-facing
    if (a > 0.000001) {
      if (u < 0.0 || u > a) return null;
      if (v < 0.0 || u + v > a) return null;
    }
    // Back-facing
    else if (a < -0.000001) {
      if (u > 0.0 || u < a) return null;
      if (v > 0.0 || u + v < a) return null;
    }
    // Parallel
    else {
      return null;
    }

    const intersection = vec3.create();
    vec3.scaleAndAdd(intersection, origin, direction, vec3.dot(e2, q) / a);
    const isFrontFacing = a > 0.000001;
    const facing = (
      isFrontFacing ?
      TRIANGLE_FACING.FRONT :
      TRIANGLE_FACING.BACK
    );

    return {facing, intersection};
  }

  /**
   * Returns T of a ray-aabb intersection
   * @param aabb - The AABB to check the intersection with
   */
  public intersectsAABB(aabb: AABB): IAABBIntersection {
    const min = aabb.getMin();
    const max = aabb.getMax();
    const origin = this.getOrigin();
    const direction = this.getDirection();
    const t1 = (min[0] - origin[0]) / direction[0];
    const t2 = (max[0] - origin[0]) / direction[0];
    const t3 = (min[1] - origin[1]) / direction[1];
    const t4 = (max[1] - origin[1]) / direction[1];
    const t5 = (min[2] - origin[2]) / direction[2];
    const t6 = (max[2] - origin[2]) / direction[2];
    const t7 = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
    const t8 = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));
    if (t8 < 0 || t7 > t8) return null;
    return {t: t7};
  }

}
