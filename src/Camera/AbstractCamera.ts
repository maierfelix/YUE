import {mat4, vec2, vec3} from "gl-matrix";

import {EventEmitter} from "../utils";

export interface ICameraOptions {
  width?: number;
  height?: number;
}

export const CAMERA_DEFAULT_OPTIONS: ICameraOptions = {
  width: 0,
  height: 0
};

export abstract class AbstractCamera extends EventEmitter {

  private _width: number = 0;
  private _height: number = 0;

  private _translation: vec3 = null;

  private _viewMatrix: mat4 = null;
  private _projectionMatrix: mat4 = null;
  private _viewInverseMatrix: mat4 = null;
  private _projectionInverseMatrix: mat4 = null;
  private _viewProjectionMatrix: mat4 = null;
  private _viewProjectionInverseMatrix: mat4 = null;

  /**
   * @param options - Create options
   */
  public constructor(options?: ICameraOptions) {
    super();
    // Normalize options
    options = Object.assign({}, CAMERA_DEFAULT_OPTIONS, options);
    // Process options
    this._width = options.width;
    this._height = options.height;
    this._translation = vec3.create();
    this._viewMatrix = mat4.create();
    this._projectionMatrix = mat4.create();
    this._viewInverseMatrix = mat4.create();
    this._projectionInverseMatrix = mat4.create();
    this._viewProjectionMatrix = mat4.create();
    this._viewProjectionInverseMatrix = mat4.create();
  }

  /**
   * The camera width
   */
  public getWidth(): number { return this._width; }
  /**
   * Update the camera width
   * @param value - The new camera width 
   */
  public setWidth(value: number): void { this._width = value; }

  /**
   * The camera height
   */
  public getHeight(): number { return this._height; }

  /**
   * Update the camera height
   * @param value - The new camera height
   */
  public setHeight(value: number): void { this._height = value; }

  /**
   * The aspect size of the rendering surface
   */
  public getAspect(): number { return this.getWidth() / this.getHeight(); }

  /**
   * Returns the translation of the camera
   */
  public getTranslation(): vec3 { return this._translation; }

  /**
   * Returns the view matrix of the camera
   */
  public getViewMatrix(): mat4 { return this._viewMatrix; }

  /**
   * Returns the projection matrix of the camera
   */
  public getProjectionMatrix(): mat4 { return this._projectionMatrix; }

  /**
   * Returns the view inverse matrix of the camera
   */
  public getViewInverseMatrix(): mat4 { return this._viewInverseMatrix; }

  /**
   * Returns the projection inverse matrix of the camera
   */
  public getProjectionInverseMatrix(): mat4 { return this._projectionInverseMatrix; }

  /**
   * Returns the view-projection matrix of the camera
   */
  public getViewProjectionMatrix(): mat4 { return this._viewProjectionMatrix; }

  /**
   * Returns the view-projection inverse matrix of the camera
   */
  public getViewProjectionInverseMatrix(): mat4 { return this._viewProjectionInverseMatrix; }

  /**
   * Should be called every frame, must be overridden
   */
  public abstract update(): void;

  /**
   * Updates the internal transforms and matrices
   * @param mCameraView - The view matrix of the camera model
   * @param mCameraProjection - The projection matrix of the camera model
   */
  public updateTransforms(mCameraView: mat4, mCameraProjection: mat4): void {
    const mView = this.getViewMatrix();
    const mProjection = this.getProjectionMatrix();
    const mViewInverse = this.getViewInverseMatrix();
    const mProjectionInverse = this.getProjectionInverseMatrix();
    const mViewProjection = this.getViewProjectionMatrix();
    const mViewProjectionInverse = this.getViewProjectionInverseMatrix();
    // Update matrices
    mat4.copy(mView, mCameraView);
    mat4.copy(mProjection, mCameraProjection);
    mat4.multiply(mViewProjection, mCameraProjection, mCameraView);
    // Update inverse matrices
    mat4.invert(mViewInverse, mCameraView);
    mat4.invert(mProjectionInverse, mCameraProjection);
    mat4.invert(mViewProjectionInverse, mViewProjection);
  }

  /**
   * Destroy this Object
   */
  public destroy(): void {
    this._viewMatrix = null;
    this._projectionMatrix = null;
    this._viewProjectionMatrix = null;
    this._viewProjectionInverseMatrix = null;
    this.emit("destroy");
  }

  /**
   * Resize the camera
   * @param width - The destination width after resize
   * @param height - The destination height after resize
   */
  public resize(width: number, height: number) {
    this._width = width;
    this._height = height;
    this.emit("resize", width, height);
  }

  /**
   * Converts the provided point from screen space into world space
   * @param pt - A point in screen space
   */
  public screenToWorldPoint(pt: vec3): vec3 {
    const out = vec3.create();
    const x = (2.0 * pt[0] / this.getWidth()) - 1.0;
    const y = (this.getHeight() - (2.0 * pt[1])) / this.getHeight();
    const z = (2.0 * pt[2]) - 1.0;
    vec3.set(out, x, y, z);
    vec3.transformMat4(out, out, this.getViewProjectionInverseMatrix());
    return out;
  }

  /**
   * Converts the provided point from world space into screen space
   * @param pt - A point in world space
   */
  public worldToScreenPoint(pt: vec3): vec2 {
    const out = vec2.create();
    const v = vec3.copy(vec3.create(), pt);
    vec3.transformMat4(v, v, this.getViewProjectionMatrix());
    out[0] = Math.round(((v[0] + 1.0) * 0.5) * this.getWidth());
    out[1] = Math.round(((1.0 - v[1]) * 0.5) * this.getHeight());
    return out;
  }

  /**
   * The distance between the provided point and the camera
   * @param pt - A point in world space
   */
  public getDistanceToPoint(pt: vec3): number {
    return vec3.squaredDistance(this.getTranslation(), pt);
  }

}
