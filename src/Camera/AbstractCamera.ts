import {mat4} from "gl-matrix";

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

  private _width: number;
  private _height: number;

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
   * Returns the camera view-projection matrix, must be overridden
   */
  public abstract getViewProjectionMatrix(): mat4;

  /**
   * Should be called every frame, must be overridden
   */
  public abstract update(): void;

  /**
   * Destroy this Object
   */
  public destroy(): void {
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
    this.emit("resize");
  }

}
