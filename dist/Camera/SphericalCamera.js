"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SphericalCamera = void 0;
const gl_matrix_1 = require("gl-matrix");
const AbstractCamera_1 = require("./AbstractCamera");
const InteractionEvents = require("normalized-interaction-events");
const IntertialTurntableCamera = require("inertial-turntable-camera");
class SphericalCamera extends AbstractCamera_1.AbstractCamera {
    /**
     * @param options Create options
     */
    constructor(options) {
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
        this._translation = gl_matrix_1.vec3.create();
        this._viewProjectionMatrix = gl_matrix_1.mat4.create();
    }
    getInstance() { return this._instance; }
    /**
     * Updates and caches the transforms
     */
    updateTransforms() {
        // View-Projection matrix
        const mView = this.getInstance().state.view;
        const mProjection = this.getInstance().state.projection;
        const mViewProjection = this.getViewProjectionMatrix();
        gl_matrix_1.mat4.multiply(mViewProjection, mProjection, mView);
        // Translation vector
        const vTranslation = this.getInstance().state.eye;
        gl_matrix_1.vec3.copy(this._translation, vTranslation);
    }
    /**
     * Returns the translation of the camera
     */
    getTranslation() { return this._translation; }
    /**
     * Returns the view-projection matrix of the camera
     */
    getViewProjectionMatrix() { return this._viewProjectionMatrix; }
    /**
     * Attaches controls to the provided element
     * @param element HTML canvas element to listen for events
     */
    attachControl(element) {
        InteractionEvents(element)
            // Listen for mouse wheel events
            .on("wheel", (e) => {
            this.getInstance().zoom(e.x, e.y, Math.exp(-e.dy * 0.5) - 1.0);
            e.originalEvent.preventDefault();
        })
            // Listen for mouse move events
            .on("mousemove", (e) => {
            if (!e.active)
                return;
            // Left mouse button pressed
            if (e.buttons === 1) {
                // Translate camera when shift is pressed
                if (e.mods.shift) {
                    this.getInstance().pan(e.dx, e.dy);
                    // Rotate camera
                }
                else {
                    this.getInstance().rotate(-e.dx * Math.PI * 0.5, -e.dy * Math.PI * 0.5);
                }
                // Translate camera when middle mouse button is pressed
            }
            else if (e.buttons === 4) {
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
    resize(width, height) {
        this.getInstance().resize(width / height);
        super.resize(width, height);
    }
    /**
     * Should be called every frame
     */
    update() {
        this.getInstance().tick({
            near: this.getInstance().params.distance * 0.01,
            far: this.getInstance().params.distance * 2 + 200
        });
        this.updateTransforms();
        this.emit("update");
    }
    /**
     * Destroy this Object
     */
    destroy() {
        this._instance = null;
        this._viewProjectionMatrix = null;
        super.destroy();
    }
}
exports.SphericalCamera = SphericalCamera;
;
//# sourceMappingURL=SphericalCamera.js.map