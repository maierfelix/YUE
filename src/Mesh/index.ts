import {Material} from "../Material";
import {vec3, quat} from "gl-matrix";
import {Renderer, IUniformUpdateEntry} from "../Renderer";
import {GetShaderAttributeComponentSize, IBindGroupResource, RenderPipelineGenerator} from "../Material/RenderPipelineGenerator";
import {IRayTriangleIntersection, Ray, TRIANGLE_FACING} from "../Ray";
import {Container} from "../Container";

export * from "./StaticMesh";

export interface IMeshOptions {
  name?: string;
  material: Material;
  translation?: vec3;
  rotation?: quat;
  scale?: vec3;
  indices?: ArrayBufferView;
  attributes?: ArrayBufferView;
  freeAfterUpload?: boolean;
}

export const MESH_DEFAULT_OPTIONS: IMeshOptions = {
  name: null,
  material: null,
  translation: null,
  rotation: null,
  scale: null,
  indices: null,
  attributes: null,
  freeAfterUpload: false,
};

export class Mesh extends Container {

  private _material: Material = null;
  private _indices: ArrayBufferView = null;
  private _attributes: ArrayBufferView = null;
  private _indexCount: number = 0;

  private _uniformBindGroup: GPUBindGroup = null;
  private _uniformResources: IBindGroupResource[] = [];

  private _uniformUpdateQueue: IUniformUpdateEntry[] = [];

  private _indexBuffer: GPUBuffer = null;
  private _attributeBuffer: GPUBuffer = null;

  private _freeAfterUpload: boolean = false;
  private _needsRebuildState: boolean = false;

  /**
   * @param options - Create options
   */
  public constructor(options?: IMeshOptions) {
    super(options);
    // Normalize options
    options = Object.assign({}, MESH_DEFAULT_OPTIONS, options);
    // Process options
    this.setName(options.name);
    this.setMaterial(options.material);
    this._indices = options.indices;
    this._attributes = options.attributes;
    this._freeAfterUpload = options.freeAfterUpload;
  }

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
   * Returns the intersection point in world-space between the mesh and the provided ray
   * @param ray - The ray to intersection with
   */
  public intersectRay(ray: Ray): IRayTriangleIntersection {
    // Abort if the mesh is destroyed
    if (this.isDestroyed()) return;
    // In case the mesh data gets freed after upload, we no longer can do this
    if (this._freeAfterUpload) return null;
    const indices = this._indices as Uint32Array;
    const attributes = this._attributes as Float32Array;
    const material = this.getMaterial();
    const attributeLayout = material.getAttributes();
    const mModel = this.getModelMatrix();
    //const mModelInverse = this.getModelInverseMatrix();
    const v0 = vec3.create();
    const v1 = vec3.create();
    const v2 = vec3.create();
    const positionLayout = attributeLayout.find(l => l.name === "Position");
    const positionByteOffset = positionLayout.byteOffset;
    const attributeView = new DataView(attributes.buffer, attributes.byteOffset, attributes.byteLength);
    const attributeComponentSize = GetShaderAttributeComponentSize(positionLayout.type);
    const attributeByteStride = material.getAttributeLayoutByteStride();
    let backfaceIntersection: IRayTriangleIntersection = null;
    for (let ii = 0; ii < indices.length / 3; ++ii) {
      const i0 = positionByteOffset + (((indices[(ii * 3) + 0])) * attributeByteStride);
      const i1 = positionByteOffset + (((indices[(ii * 3) + 1])) * attributeByteStride);
      const i2 = positionByteOffset + (((indices[(ii * 3) + 2])) * attributeByteStride);
      // Vertex 0
      v0[0] = attributeView.getFloat32(i0 + (attributeComponentSize * 0), true);
      v0[1] = attributeView.getFloat32(i0 + (attributeComponentSize * 1), true);
      v0[2] = attributeView.getFloat32(i0 + (attributeComponentSize * 2), true);
      // Vertex 1
      v1[0] = attributeView.getFloat32(i1 + (attributeComponentSize * 0), true);
      v1[1] = attributeView.getFloat32(i1 + (attributeComponentSize * 1), true);
      v1[2] = attributeView.getFloat32(i1 + (attributeComponentSize * 2), true);
      // Vertex 2
      v2[0] = attributeView.getFloat32(i2 + (attributeComponentSize * 0), true);
      v2[1] = attributeView.getFloat32(i2 + (attributeComponentSize * 1), true);
      v2[2] = attributeView.getFloat32(i2 + (attributeComponentSize * 2), true);
      // Turn vertices into world space
      vec3.transformMat4(v0, v0, mModel);
      vec3.transformMat4(v1, v1, mModel);
      vec3.transformMat4(v2, v2, mModel);
      // Perform ray-triangle intersection (in world-space)
      const intersection = ray.intersectTriangle(v0, v1, v2);
      if (intersection !== null) {
        // We got a backface intersection, but we prefer front face intersections
        // Cache the backface intersection and continue until we get a front-face intersection
        if (intersection.facing === TRIANGLE_FACING.BACK) {
          backfaceIntersection = intersection;
        }
        // Found a front face intersection, we can abort now
        else {
          return intersection;
        }
      }
    }
    // We return here in case no intersection OR a back-face intersection happened
    return backfaceIntersection;
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
    // Abort if the mesh is destroyed
    if (this.isDestroyed()) return;
    const uniform = this.getMaterial().getUniformByName(name);
    if (uniform === null)
      throw new ReferenceError(`Failed to resolve material uniform for '${name}'`);
    if (uniform.isShared)
      throw new Error(`Uniform '${name}' is declared as shared and must be accessed through its material`);
    if (data !== null)
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
   * This is an internal method
   * @param renderer - Renderer instance
   */
  public build(renderer: Renderer): void {
    super.build(renderer);
    // Abort if the mesh is destroyed
    if (this.isDestroyed()) return;
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
  }

  /**
   * Update this mesh
   * This is an internal method
   * Used to e.g. process pending uniform resource updates
   * @param renderer - Renderer instance
   */
  public update(renderer: Renderer): void {
    super.update(renderer);
    // Abort if the mesh is destroyed
    if (this.isDestroyed()) return;
    // Update the assigned material
    this.getMaterial()?.update(renderer);
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
      if (this._freeAfterUpload) this._indices = null;
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
      if (this._freeAfterUpload) this._attributes = null;
    }
  }

  /**
   * Render this mesh
   * This is an internal method
   * @param encoder - Encoder object to add commands to
   */
  public render(encoder: GPURenderPassEncoder): void {
    super.render(encoder);
    // Abort if the mesh is destroyed
    if (this.isDestroyed()) return;
    const material = this.getMaterial();
    // make sure the material's render pipeline is ready
    if (material?.getRenderPipeline() !== null) {
      const {pipeline} = material.getRenderPipeline();
      encoder.setPipeline(pipeline);
      encoder.setBindGroup(0, this._uniformBindGroup);
      encoder.setVertexBuffer(0, this._attributeBuffer);
      encoder.setIndexBuffer(this._indexBuffer, "uint32", 0x0, this.getIndexCount() * Uint32Array.BYTES_PER_ELEMENT);
      encoder.drawIndexed(this.getIndexCount(), 1, 0, 0, 0);
    }
  }

  /**
   * Destroy this Object
   */
  public destroy(): void {
    super.destroy();
    this._material = null;
    this._indices = null;
    this._attributes = null;
    this._uniformBindGroup = null;
    this._uniformResources = null;
    this._uniformUpdateQueue = null;
    this._indexBuffer = null;
    this._attributeBuffer = null;
  }

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

}
