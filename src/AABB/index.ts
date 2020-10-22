import {vec3} from "gl-matrix";

export interface IAABBBounding {
  min: vec3;
  max: vec3;
}

export interface IAABBOptions {
  
}

export const AABB_DEFAULT_OPTIONS: IAABBOptions = {

};

export class AABB {

  private _min: vec3 = null;
  private _max: vec3 = null;

  /**
   * @param options - Create options
   */
  public constructor(options?: IAABBOptions) {
    // Normalize options
    options = Object.assign({}, AABB_DEFAULT_OPTIONS, options);
    // Process options
    this._min = vec3.create();
    this._max = vec3.create();
  }

  /**
   * The minimum size of the AABB
   */
  public getMin(): vec3 { return this._min; }

  /**
   * The maximum size of the AABB
   */
  public getMax(): vec3 { return this._max; }

  /**
   * The center of the AABB
   */
  public getCenter(): vec3 {
    const out = vec3.create();
    vec3.add(out, this.getMin(), this.getMax());
    vec3.scale(out, out, 0.5);
    return out;
  }

  /**
   * The size of the AABB
   */
  public getSize(): vec3 {
    const out = vec3.create();
    vec3.subtract(out, this.getMax(), this.getMin());
    return out;
  }

  /**
   * Indicates if this and the provided AABB are intersecting
   * @param aabb - The AABB to check
   */
  public intersectsAABB(aabb: AABB): boolean {
    const min = aabb.getMin();
    const max = aabb.getMax();
    return !(
      max[0] < this._min[0] || min[0] > this._max[0] ||
      max[1] < this._min[1] || min[1] > this._max[1] ||
      max[2] < this._min[2] || min[2] > this._max[2]
    );
  }

  /**
   * Indicates if this AABB contains the provided AABB
   * @param aabb - The AABB to check
   */
  public containsAABB(aabb: AABB): boolean {
    const min = aabb.getMin();
    const max = aabb.getMax();
    return (
      this._min[0] <= min[0] && max[0] <= this._max[0] &&
      this._min[1] <= min[1] && max[1] <= this._max[1] &&
      this._min[2] <= min[2] && max[2] <= this._max[2]
    );
  }

  /**
   * Indicates if this AABB contains the provided point
   * @param pt - The point to check
   */
  public containsPoint(pt: vec3): boolean {
    return !(
      pt[0] < this._min[0] || pt[0] > this._max[0] ||
      pt[1] < this._min[1] || pt[1] > this._max[1] ||
      pt[2] < this._min[2] || pt[2] > this._max[2]
    );
  }

}
