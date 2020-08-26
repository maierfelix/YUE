import { EventEmitter } from "../utils";
import { Material } from "../Material";
import { vec3, quat, mat4 } from "gl-matrix";
import { Renderer } from "../Renderer";
import { IBindGroupResource, RenderPipelineGenerator } from "../Material/RenderPipelineGenerator";

interface IUniformUpdateEntry {
  id: number;
  data: any;
};

export interface IMeshOptions {
  name?: string;
  material: Material;
  translation?: vec3;
  rotation?: quat;
  scale?: vec3;
  indices?: ArrayBufferView;
  attributes?: ArrayBufferView;
};

const MESH_DEFAULT_OPTIONS: IMeshOptions = {
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
   * @param options Create options
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
   * @param value 
   */
  public setName(value: string): void { this._name = value; }

  /**
   * The mesh's assigned material
   */
  public getMaterial(): Material { return this._material; }
  /**
   * Update the mesh's material
   * @param value 
   */
  public setMaterial(value: Material): void {
    // In case a new material got assigned, trigger a full rebuild
    if (this.getMaterial() !== value) this.triggerRebuild();
    this._material = value;
  };

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
   * @param value 
   */
  public setTranslation(value: vec3): void { this._translation = value; }

  /**
   * The mesh's rotation
   */
  public getRotation(): quat { return this._rotation; }
  /**
   * Update the mesh's rotation
   * @param value 
   */
  public setRotation(value: quat): void { this._rotation = value; }

  /**
   * The mesh's scale
   */
  public getScale(): vec3 { return this._scale; }
  /**
   * Update the mesh's scale
   * @param value 
   */
  public setScale(value: vec3): void { this._scale = value; }

  /**
   * Determines if the mesh has to be rebuilt
   */
  private needsRebuild(): boolean {
    return this._needsRebuildState;
  }
  /**
   * Triggers a rebuild of the mesh
   */
  private triggerRebuild(): void {
    this._needsRebuildState = true;
  }
  /**
   * Disables the rebuild trigger
   */
  private resetRebuild(): void {
    this._needsRebuildState = false;
  }

  /**
   * Translates this mesh
   * @param value 
   */
  public translate(value: vec3): void {
    const translation = this._translation;
    translation[0] += value[0];
    translation[1] += value[1];
    translation[2] += value[2];
  }

  /**
   * Rotates this mesh
   * @param value 
   */
  public rotate(value: quat): void {
    const rotation = this._rotation;
    quat.rotateX(rotation, rotation, value[0] * Math.PI / 180);
    quat.rotateY(rotation, rotation, value[1] * Math.PI / 180);
    quat.rotateZ(rotation, rotation, value[2] * Math.PI / 180);
  }

  /**
   * Scales this mesh
   * @param value 
   */
  public scale(value: vec3): void {
    const scale = this._scale;
    scale[0] *= value[0];
    scale[1] *= value[1];
    scale[2] *= value[2];
  }

  /**
   * Allocate an index buffer and copy the indices data over
   * @param renderer 
   */
  public createIndexBuffer(renderer: Renderer): GPUBuffer {
    const device = renderer.getDevice();
    const data = this._indices;
    const out = device.createBuffer({
      size: data.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
    });
    // Enqueue copy operation
    renderer.enqueueBufferCopyOperation(out, data, 0x0, () => {
      // Free after the indices are uploaded to the GPU
      this._indices = null;
    });
    return out;
  }

  /**
   * Allocate an attribute buffer and copy the attribute data over
   * @param renderer 
   */
  public createAttributeBuffer(renderer: Renderer): GPUBuffer {
    const device = renderer.getDevice();
    const data = this._attributes;
    const out = device.createBuffer({
      size: data.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });
    // Enqueue copy operation
    renderer.enqueueBufferCopyOperation(out, data, 0x0, () => {
      // Free after the attributes are uploaded to the GPU
      this._attributes = null;
    });
    return out;
  }

  /**
   * Generates and returns a model matrix
   */
  public getModelMatrix(): mat4 {
    let mModel = this._modelMatrix;
    let mRotation = this._rotationMatrix;
    let translation = this._translation;
    let rotation = this._rotation;
    let scale = this._scale;
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
   * Returns the given uniform resource based on the provided id
   * @param id The id to lookup for
   */
  private getUniformResourceById(id: number): IBindGroupResource {
    let uniformResources = this._uniformResources;
    for (let ii = 0; ii < uniformResources.length; ++ii) {
      let resource = uniformResources[ii];
      if (resource !== null && resource.id === id) return resource;
    };
    return null;
  }

  /**
   * Add a new data update to the uniform update queue
   * @param id The uniform id
   * @param data The data to update with
   */
  public enqueueUniformUpdate(id: number, data: any): void {
    this._uniformUpdateQueue.push({ id, data });
  }

  /**
   * Updates a shader uniform
   * @param name The name of the shader uniform
   * @param data The data to update with
   */
  public setUniformData(name: string, data: any): void {
    let uniform = this.getMaterial().getUniformByName(name);
    if (uniform === null)
      throw new ReferenceError(`Failed to resolve material uniform for '${name}'`);
    if (uniform.isShared)
      throw new Error(`Uniform '${name}' is declared as shared and must be accessed through its material`);
    this.enqueueUniformUpdate(uniform.id, data);
  }

  /**
   * Build everything required to render this mesh
   * @param renderer 
   */
  public build(renderer: Renderer): void {
    // Abort if the mesh doesn't need a rebuild
    if (!this.needsRebuild()) return;
    const material = this.getMaterial();
    material.build(renderer);
    // Build bind group resources
    this._uniformResources = RenderPipelineGenerator.generateBindGroupResources(
      material, false, renderer.getDevice()
    );
    // Build bind group
    this._uniformBindGroup = RenderPipelineGenerator.generateBindGroup(
      material, this._uniformResources, renderer.getDevice()
    );
    // Build mesh buffers
    this._indexBuffer = this.createIndexBuffer(renderer);
    this._attributeBuffer = this.createAttributeBuffer(renderer);
    // Save index count
    this._indexCount = (this._indices as Uint32Array).length;
    // After the build we disable further builds
    this.resetRebuild();
    this.emit("build");
  }

  /**
   * Update this mesh
   * Used to e.g. process pending uniform resource updates
   * @param renderer 
   */
  public update(renderer: Renderer): void {
    // Update the assigned material
    this.getMaterial().update(renderer);
    // Process and dequeue the entries from the uniform update queue
    const uniformUpdateQueue = this._uniformUpdateQueue;
    for (let ii = 0; ii < uniformUpdateQueue.length; ++ii) {
      const {id, data} = uniformUpdateQueue[ii];
      const uniformResource = this.getUniformResourceById(id);
      const buffer = uniformResource.resource as GPUBuffer;
      // Enqueue copy operation
      renderer.enqueueBufferCopyOperation(buffer, data, 0x0, null);
      // Remove from queue after we processed it
      uniformUpdateQueue.splice(ii, 1);
    };
  }

  /**
   * Render this mesh
   * @param encoder 
   */
  public render(encoder: GPURenderPassEncoder): void {
    const material = this.getMaterial();
    const {pipeline} = material.getRenderPipeline();
    encoder.setPipeline(pipeline);
    encoder.setBindGroup(0, this._uniformBindGroup);
    encoder.setVertexBuffer(0, this._attributeBuffer);
    encoder.setIndexBuffer(this._indexBuffer);
    encoder.drawIndexed(this.getIndexCount(), 1, 0, 0, 0);
    this.emit("render");
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

};
