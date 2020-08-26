import { mat4 } from "gl-matrix";

import { AbstractCamera, ICameraOptions } from "./AbstractCamera";

const InteractionEvents = require("normalized-interaction-events");
const IntertialTurntableCamera = require("inertial-turntable-camera");

export class SphericalCamera extends AbstractCamera {

  private _instance: any;
  private _viewProjectionMatrix: mat4;

  /**
   * @param options Create options
   */
  public constructor(options?: ICameraOptions) {
    super(options);
    // Setup camera
    const instance = IntertialTurntableCamera({
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
    this._viewProjectionMatrix = mat4.create();
  }

  private getInstance(): any { return this._instance; }

  /**
   * Multiplies the camera's view and projection matrix
   */
  private updateTransformMatrix(): void {
    const mView = this.getInstance().state.view;
    const mProjection = this.getInstance().state.projection;
    const mViewProjection = this.getViewProjectionMatrix();
    mat4.multiply(mViewProjection, mProjection, mView);
  }

  /**
   * Returns the view-projection matrix of the camera
   */
  public getViewProjectionMatrix(): mat4 { return this._viewProjectionMatrix; }

  /**
   * Attaches controls to the provided element
   * @param element HTML canvas element to listen for events
   */
  public attachControl(element: HTMLCanvasElement): void {
    InteractionEvents(element)
    // Listen for mouse wheel events
    .on("wheel", (e:any) => {
      this.getInstance().zoom(e.x, e.y, Math.exp(-e.dy * 0.5) - 1.0);
      e.originalEvent.preventDefault();
    })
    // Listen for mouse move events
    .on("mousemove", (e:any) => {
      if (!e.active) return;
      // Left mouse button pressed
      if (e.buttons === 1) {
        // Translate camera when shift is pressed
        if (e.mods.shift) {
          this.getInstance().pan(e.dx, e.dy);
        // Rotate camera
        } else {
          this.getInstance().rotate(-e.dx * Math.PI * 0.5, -e.dy * Math.PI * 0.5);
        }
      // Translate camera when middle mouse button is pressed
      } else if (e.buttons === 4) {
        this.getInstance().pan(e.dx, e.dy);
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
   * @param width 
   * @param height 
   */
  public resize(width: number, height: number): void {
    this.getInstance().resize(width / height);
    super.resize(width, height);
  }

  /**
   * Should be called every frame
   */
  public update(): void {
    this.getInstance().tick({
      near: this.getInstance().params.distance * 0.01,
      far: this.getInstance().params.distance * 2 + 200
    });
    this.updateTransformMatrix();
    this.emit("update");
  }

};
