"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mesh = void 0;
const utils_1 = require("../utils");
const gl_matrix_1 = require("gl-matrix");
const RenderPipelineGenerator_1 = require("../Material/RenderPipelineGenerator");
;
const MESH_DEFAULT_OPTIONS = {
    name: null,
    material: null,
    translation: null,
    rotation: null,
    scale: null,
    indices: null,
    attributes: null
};
class Mesh extends utils_1.EventEmitter {
    /**
     * @param options Create options
     */
    constructor(options) {
        super();
        this._indexCount = 0;
        this._modelMatrix = gl_matrix_1.mat4.create();
        this._rotationMatrix = gl_matrix_1.mat4.create();
        this._uniformResources = [];
        this._uniformUpdateQueue = [];
        this._indexBuffer = null;
        this._attributeBuffer = null;
        // Normalize options
        options = Object.assign({}, MESH_DEFAULT_OPTIONS, options);
        // Process options
        this.setName(options.name);
        this.setMaterial(options.material);
        this._translation = options.translation ? options.translation : gl_matrix_1.vec3.create();
        this._rotation = options.rotation ? options.rotation : gl_matrix_1.quat.create();
        this._scale = options.scale ? options.scale : gl_matrix_1.vec3.fromValues(1, 1, 1);
        this._indices = options.indices;
        this._attributes = options.attributes;
    }
    /**
     * The mesh name
     */
    getName() { return this._name; }
    /**
     * Update the mesh name
     * @param value
     */
    setName(value) { this._name = value; }
    /**
     * The mesh's assigned material
     */
    getMaterial() { return this._material; }
    /**
     * Update the mesh's material
     * @param value
     */
    setMaterial(value) {
        // In case a new material got assigned, trigger a full rebuild
        if (this.getMaterial() !== value)
            this.triggerRebuild();
        this._material = value;
    }
    ;
    /**
     * The mesh's count
     */
    getIndexCount() { return this._indexCount; }
    /**
     * The mesh's translation
     */
    getTranslation() { return this._translation; }
    /**
     * Update the mesh's translation
     * @param value
     */
    setTranslation(value) { this._translation = value; }
    /**
     * The mesh's rotation
     */
    getRotation() { return this._rotation; }
    /**
     * Update the mesh's rotation
     * @param value
     */
    setRotation(value) { this._rotation = value; }
    /**
     * The mesh's scale
     */
    getScale() { return this._scale; }
    /**
     * Update the mesh's scale
     * @param value
     */
    setScale(value) { this._scale = value; }
    /**
     * Determines if the mesh has to be rebuilt
     */
    needsRebuild() {
        return this._needsRebuildState;
    }
    /**
     * Triggers a rebuild of the mesh
     */
    triggerRebuild() {
        this._needsRebuildState = true;
    }
    /**
     * Disables the rebuild trigger
     */
    resetRebuild() {
        this._needsRebuildState = false;
    }
    /**
     * Translates this mesh
     * @param value
     */
    translate(value) {
        const translation = this._translation;
        translation[0] += value[0];
        translation[1] += value[1];
        translation[2] += value[2];
    }
    /**
     * Rotates this mesh
     * @param value
     */
    rotate(value) {
        const rotation = this._rotation;
        gl_matrix_1.quat.rotateX(rotation, rotation, value[0] * Math.PI / 180);
        gl_matrix_1.quat.rotateY(rotation, rotation, value[1] * Math.PI / 180);
        gl_matrix_1.quat.rotateZ(rotation, rotation, value[2] * Math.PI / 180);
    }
    /**
     * Scales this mesh
     * @param value
     */
    scale(value) {
        const scale = this._scale;
        scale[0] *= value[0];
        scale[1] *= value[1];
        scale[2] *= value[2];
    }
    /**
     * Generates and returns a model matrix
     */
    getModelMatrix() {
        let mModel = this._modelMatrix;
        let mRotation = this._rotationMatrix;
        let translation = this._translation;
        let rotation = this._rotation;
        let scale = this._scale;
        gl_matrix_1.mat4.identity(mModel);
        gl_matrix_1.mat4.identity(mRotation);
        // translation
        gl_matrix_1.mat4.translate(mModel, mModel, translation);
        // rotation
        gl_matrix_1.quat.normalize(rotation, rotation);
        gl_matrix_1.mat4.fromQuat(mRotation, rotation);
        gl_matrix_1.mat4.multiply(mModel, mModel, mRotation);
        // scale
        gl_matrix_1.mat4.scale(mModel, mModel, scale);
        // TODO: apply parent transforms?
        return mModel;
    }
    /**
     * Add a new data update to the uniform update queue
     * @param id The uniform id
     * @param data The data to update with
     */
    enqueueUniformUpdate(id, data) {
        this._uniformUpdateQueue.push({ id, data });
    }
    /**
     * Updates a shader uniform
     * @param name The name of the shader uniform
     * @param data The data to update with
     */
    updateUniform(name, data) {
        let uniform = this.getMaterial().getUniformByName(name);
        if (uniform === null)
            throw new ReferenceError(`Failed to resolve material uniform for '${name}'`);
        if (uniform.isShared)
            throw new Error(`Uniform '${name}' is declared as shared and must be accessed through its material`);
        this.enqueueUniformUpdate(uniform.id, data);
    }
    /**
     * Update the mesh indices
     * @param data The index data to update with
     */
    updateIndices(data) {
        this._indices = data;
    }
    /**
     * Update the mesh attributes
     * @param data The attribute data to update with
     */
    updateAttributes(data) {
        this._attributes = data;
    }
    /**
     * Build everything required to render this mesh
     * @param renderer
     */
    build(renderer) {
        // Abort if the mesh doesn't need a rebuild
        if (!this.needsRebuild())
            return;
        const material = this.getMaterial();
        material.build(renderer);
        // Build bind group resources
        this._uniformResources = RenderPipelineGenerator_1.RenderPipelineGenerator.generateBindGroupResources(material, false, renderer.getDevice());
        this.update(renderer);
        // Build bind group
        this._uniformBindGroup = RenderPipelineGenerator_1.RenderPipelineGenerator.generateBindGroup(material, this._uniformResources, renderer.getDevice());
        // Build mesh buffers
        if (this._indices !== null) {
            this._indexCount = this._indices.length;
            this._indexBuffer = renderer.getDevice().createBuffer({
                size: this._indices.byteLength,
                usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
            });
        }
        if (this._attributes) {
            this._attributeBuffer = renderer.getDevice().createBuffer({
                size: this._attributes.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
            });
        }
        // After the build we disable further builds
        this.resetRebuild();
        this.emit("build");
    }
    /**
     * Update this mesh
     * Used to e.g. process pending uniform resource updates
     * @param renderer
     */
    update(renderer) {
        // Update the assigned material
        this.getMaterial().update(renderer);
        renderer.processUniformUpdateQueue(this._uniformUpdateQueue, this._uniformResources);
        // Enqueue copy operation
        if (this._indices !== null) {
            // Create index buffer if necessary
            if (this._indexBuffer === null) {
                this._indexBuffer = renderer.getDevice().createBuffer({
                    size: this._indices.byteLength,
                    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
                });
            }
            this._indexCount = this._indices.length;
            renderer.getQueueCommander().transferDataToBuffer(this._indexBuffer, this._indices, 0x0);
            this._indices = null;
        }
        // Enqueue copy operation
        if (this._attributes !== null) {
            // Create attribute buffer if necessary
            if (this._attributeBuffer === null) {
                this._attributeBuffer = renderer.getDevice().createBuffer({
                    size: this._attributes.byteLength,
                    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
                });
            }
            renderer.getQueueCommander().transferDataToBuffer(this._attributeBuffer, this._attributes, 0x0);
            this._attributes = null;
        }
    }
    /**
     * Render this mesh
     * @param encoder
     */
    render(encoder) {
        const material = this.getMaterial();
        // make sure the material's render pipeline is ready
        if (material.getRenderPipeline() !== null) {
            const { pipeline } = material.getRenderPipeline();
            encoder.setPipeline(pipeline);
            encoder.setBindGroup(0, this._uniformBindGroup);
            encoder.setVertexBuffer(0, this._attributeBuffer);
            encoder.setIndexBuffer(this._indexBuffer);
            encoder.drawIndexed(this.getIndexCount(), 1, 0, 0, 0);
        }
        this.emit("render");
    }
    /**
     * Destroy this Object
     */
    destroy() {
        this._name = null;
        this._material = null;
        this._translation = null;
        this._rotation = null;
        this._scale = null;
        this._indices = null;
        this._attributes = null;
        this._modelMatrix = null;
        this._rotationMatrix = null;
        this._uniformBindGroup = null;
        this._uniformResources = null;
        this._uniformUpdateQueue = null;
        this._indexBuffer = null;
        this._attributeBuffer = null;
        this.emit("destroy");
    }
}
exports.Mesh = Mesh;
;
//# sourceMappingURL=index.js.map