import {mat4, vec3} from "gl-matrix";

import {AbstractCamera, ICameraOptions} from "./AbstractCamera";

/// <reference path="normalized-interaction-events.d.ts" />
import * as InteractionEvents from "normalized-interaction-events";
/// <reference path="inertial-turntable-camera.d.ts" />
import * as IntertialTurntableCamera from "inertial-turntable-camera";

export class SphericalCamera extends AbstractCamera {

  private _instance: any = null;

  /**
   * @param options - Create options
   */
  public constructor(options?: ICameraOptions) {
    super(options);
    // Setup camera
    const instance = IntertialTurntableCamera.default({
      phi: 0.5,
      theta: 1,
      aspectRatio: this.getAspect(),
      distance: 2
    });
    // Update camera settings
    {
      instance.params.near = 0.01;
      instance.params.far = 8192.0;
      instance.params.panDecayTime = 50;
      instance.params.zoomDecayTime = 50;
      instance.params.rotationDecayTime = 50;
      instance.params.zoomAboutCursor = false;
      instance.params.rotateAboutCenter = true;
      const prevYRange = instance.params.distance * Math.tan(instance.params.fovY * 0.5);
      instance.params.fovY = 40 * Math.PI / 180.0;
      instance.params.distance = prevYRange / Math.tan(instance.params.fovY * 0.5);
    }
    this._instance = instance;
  }

  /**
   * The instance of the spherical camera
   */
  public getInstance(): any { return this._instance; }

  /**
   * Attaches controls to the provided element
   * @param element - HTML canvas element to listen for events
   */
  public attachControl(element: HTMLCanvasElement): void {
    InteractionEvents.default(element)
    // Listen for mouse wheel events
    .on("wheel", (e: any) => {
      this._instance.zoom(e.x, e.y, Math.exp(-e.dy * 0.5) - 1.0);
      e.originalEvent.preventDefault();
    })
    // Listen for mouse move events
    .on("mousemove", (e: any) => {
      if (!e.active) return;
      // Left mouse button pressed
      if (e.buttons === 2) {
        // Translate camera when shift is pressed
        if (e.mods.shift) {
          this._instance.pan(e.dx, e.dy);
        // Rotate camera
        } else {
          this._instance.rotate(-e.dx * Math.PI * 0.5, -e.dy * Math.PI * 0.5);
        }
      // Translate camera when middle mouse button is pressed
      } else if (e.buttons === 4) {
        this._instance.pan(e.dx, e.dy);
      }
      e.originalEvent.preventDefault();
    });
    // Resize camera based on the element's boundings
    {
      this.setWidth(element.width);
      this.setHeight(element.height);
    }
  }

  /**
   * Resize the camera
   * @param width - The new camera width
   * @param height - The new camera height
   */
  public resize(width: number, height: number): void {
    this._instance.resize(width / height);
    super.resize(width, height);
  }

  /**
   * Should be called every frame
   */
  public update(): void {
    this.getInstance().tick({
      near: this.getInstance().params.distance * 0.01,
      far: (this.getInstance().params.distance * 2) + 200
    });
    const mView = this._instance.state.view;
    const mProjection = this._instance.state.projection;
    this.updateTransforms(mView, mProjection);
    this.updateFrustum();
    this.emit("update");
  }

  /**
   * Destroy this Object
   */
  public destroy(): void {
    this._instance = null;
    super.destroy();
  }

  /**
   * Updates the internal transforms and matrices
   * @param mCameraView - The view matrix of the camera model
   * @param mCameraProjection - The projection matrix of the camera model
   */
  public updateTransforms(mCameraView: mat4, mCameraProjection: mat4): void {
    super.updateTransforms(mCameraView, mCameraProjection);
    // Translation vector
    const vTranslation = this._instance.state.eye;
    vec3.copy(this.getTranslation(), vTranslation);
  }

}
