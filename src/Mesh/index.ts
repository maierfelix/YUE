import {EventEmitter} from "../utils";
import {Material} from "../Material";
import {vec3, quat, mat4} from "gl-matrix";
import {Renderer, IUniformUpdateEntry} from "../Renderer";
import {IBindGroupResource, RenderPipelineGenerator} from "../Material/RenderPipelineGenerator";

export interface IMeshOptions {
  name?: string;
  material: Material;
  translation?: vec3;
  rotation?: quat;
  scale?: vec3;
  indices?: ArrayBufferView;
  attributes?: ArrayBufferView;
}

export const MESH_DEFAULT_OPTIONS: IMeshOptions = {
  name: null,
  material: null,
  translation: null,
  rotation: null,
  scale: null,
  indices: null,
  attributes: null
};

export class Mesh extends EventEmitter {

  private _name: string;
  private _material: Material;
  private _translation: vec3;
  private _rotation: quat;
  private _scale: vec3;
  private _indices: ArrayBufferView;
  private _attributes: ArrayBufferView;
  private _indexCount: number = 0;

  private _modelMatrix: mat4 = mat4.create();
  private _rotationMatrix: mat4 = mat4.create();

  private _uniformBindGroup: GPUBindGroup;
  private _uniformResources: IBindGroupResource[] = [];

  private _uniformUpdateQueue: IUniformUpdateEntry[] = [];

  private _indexBuffer: GPUBuffer = null;
  private _attributeBuffer: GPUBuffer = null;

  private _needsRebuildState: boolean;

  /**
   * @param options - Create options
   */
  public constructor(options?: IMeshOptions) {
    super();
    // Normalize options
    options = Object.assign({}, MESH_DEFAULT_OPTIONS, options);
    // Process options
    this.setName(options.name);
    this.setMaterial(options.material);
    this._translation = options.translation ? options.translation : vec3.create();
    this._rotation = options.rotation ? options.rotation : quat.create();
    this._scale = options.scale ? options.scale : vec3.fromValues(1, 1, 1);
    this._indices = options.indices;
    this._attributes = options.attributes;
  }

  /**
   * The mesh name
   */
  public getName(): string { return this._name; }

  /**
   * Update the mesh name
   * @param value - The new mesh name
   */
  public setName(value: string): void { this._name = value; }

  /**
   * The mesh's assigned material
   */
  public getMaterial(): Material { return this._material; }

  /**
   * Update the mesh's material
   * @param value - The new material
   */
  public setMaterial(value: Material): void {
    // In case a new material got assigned, trigger a full rebuild
    if (this.getMaterial() !== value) this._triggerRebuild();
    this._material = value;
  }

  /**
   * The mesh's count
   */
  public getIndexCount(): number { return this._indexCount; }

  /**
   * The mesh's translation
   */
  public getTranslation(): vec3 { return this._translation; }

  /**
   * Update the mesh's translation
   * @param value - The new mesh translation
   */
  public setTranslation(value: vec3): void { this._translation = value; }

  /**
   * The mesh's rotation
   */
  public getRotation(): quat { return this._rotation; }

  /**
   * Update the mesh's rotation
   * @param value - The new mesh rotation
   */
  public setRotation(value: quat): void { this._rotation = value; }

  /**
   * The mesh's scale
   */
  public getScale(): vec3 { return this._scale; }

  /**
   * Update the mesh's scale
   * @param value - The new mesh scale
   */
  public setScale(value: vec3): void { this._scale = value; }

  /**
   * Determines if the mesh has to be rebuilt
   */
  private _needsRebuild(): boolean {
    return this._needsRebuildState;
  }

  /**
   * Triggers a rebuild of the mesh
   */
  private _triggerRebuild(): void {
    this._needsRebuildState = true;
  }

  /**
   * Disables the rebuild trigger
   */
  private _resetRebuild(): void {
    this._needsRebuildState = false;
  }

  /**
   * Translates this mesh
   * @param value - A vector to translate by
   */
  public translate(value: vec3): void {
    const translation = this._translation;
    translation[0] += value[0];
    translation[1] += value[1];
    translation[2] += value[2];
  }

  /**
   * Rotates this mesh
   * @param value - A quaternion to rotate by
   */
  public rotate(value: quat): void {
    const rotation = this._rotation;
    quat.rotateX(rotation, rotation, value[0] * Math.PI / 180);
    quat.rotateY(rotation, rotation, value[1] * Math.PI / 180);
    quat.rotateZ(rotation, rotation, value[2] * Math.PI / 180);
  }

  /**
   * Scales this mesh
   * @param value - A vector to scale by
   */
  public scale(value: vec3): void {
    const scale = this._scale;
    scale[0] *= value[0];
    scale[1] *= value[1];
    scale[2] *= value[2];
  }

  /**
   * Generates and returns a model matrix
   */
  public getModelMatrix(): mat4 {
    const mModel = this._modelMatrix;
    const mRotation = this._rotationMatrix;
    const translation = this._translation;
    const rotation = this._rotation;
    const scale = this._scale;
    mat4.identity(mModel);
    mat4.identity(mRotation);
    // translation
    mat4.translate(mModel, mModel, translation);
    // rotation
    quat.normalize(rotation, rotation);
    mat4.fromQuat(mRotation, rotation);
    mat4.multiply(mModel, mModel, mRotation);
    // scale
    mat4.scale(
      mModel,
      mModel,
      scale
    );
    // TODO: apply parent transforms?
    return mModel;
  }

  /**
   * Add a new data update to the uniform update queue
   * @param id - The uniform id
   * @param data - The data to update with
   */
  public enqueueUniformUpdate(id: number, data: any): void {
    this._uniformUpdateQueue.push({id, data});
  }

  /**
   * Updates a shader uniform
   * @param name - The name of the shader uniform
   * @param data - The data to update with
   */
  public updateUniform(name: string, data: any): void {
    const uniform = this.getMaterial().getUniformByName(name);
    if (uniform === null)
      throw new ReferenceError(`Failed to resolve material uniform for '${name}'`);
    if (uniform.isShared)
      throw new Error(`Uniform '${name}' is declared as shared and must be accessed through its material`);
    this.enqueueUniformUpdate(uniform.id, data);
  }

  /**
   * Update the mesh indices
   * @param data - The index data to update with
   */
  public updateIndices(data: ArrayBufferView): void {
    this._indices = data;
  }

  /**
   * Update the mesh attributes
   * @param data - The attribute data to update with
   */
  public updateAttributes(data: ArrayBufferView): void {
    this._attributes = data;
  }

  /**
   * Build everything required to render this mesh
   * @param renderer - Renderer instance
   */
  public build(renderer: Renderer): void {
    // Abort if the mesh doesn't need a rebuild
    if (!this._needsRebuild()) return;
    const material = this.getMaterial();
    material.build(renderer);
    // Build bind group resources
    this._uniformResources = RenderPipelineGenerator.generateBindGroupResources(
      material, false, renderer.getDevice()
    );
    this.update(renderer);
    // Build bind group
    this._uniformBindGroup = RenderPipelineGenerator.generateBindGroup(
      material, this._uniformResources, renderer.getDevice()
    );
    // Build mesh buffers
    if (this._indices !== null) {
      this._indexCount = (this._indices as Uint32Array).length;
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
    this._resetRebuild();
    this.emit("build");
  }

  /**
   * Update this mesh
   * Used to e.g. process pending uniform resource updates
   * @param renderer - Renderer instance
   */
  public update(renderer: Renderer): void {
    // Update the assigned material
    this.getMaterial().update(renderer);
    renderer.processUniformUpdateQueue(
      this._uniformUpdateQueue,
      this._uniformResources
    );
    // Enqueue copy operation
    if (this._indices !== null) {
      // Create index buffer if necessary
      if (this._indexBuffer === null) {
        this._indexBuffer = renderer.getDevice().createBuffer({
          size: this._indices.byteLength,
          usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        });
      }
      this._indexCount = (this._indices as Uint32Array).length;
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
   * @param encoder - Encoder object to add commands to
   */
  public render(encoder: GPURenderPassEncoder): void {
    const material = this.getMaterial();
    this.emit("beforerender");
    // make sure the material's render pipeline is ready
    if (material.getRenderPipeline() !== null) {
      const {pipeline} = material.getRenderPipeline();
      encoder.setPipeline(pipeline);
      encoder.setBindGroup(0, this._uniformBindGroup);
      encoder.setVertexBuffer(0, this._attributeBuffer);
      encoder.setIndexBuffer(this._indexBuffer, "uint32", 0x0, this.getIndexCount() * Uint32Array.BYTES_PER_ELEMENT);
      encoder.drawIndexed(this.getIndexCount(), 1, 0, 0, 0);
    }
    this.emit("afterrender");
  }

  /**
   * Destroy this Object
   */
  public destroy(): void {
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
