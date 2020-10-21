import {vec3, quat, mat4} from "gl-matrix";
import {AABB, IAABBBounding} from "../AABB";
import {Renderer} from "../Renderer";

export interface IContainerOptions {
  name?: string;
  translation?: vec3;
  rotation?: quat;
  scale?: vec3;
  parent?: Container;
}

export const CONTAINER_DEFAULT_OPTIONS: IContainerOptions = {
  name: null,
  translation: null,
  rotation: null,
  scale: null,
  parent: null,
};

export class Container {

  private _name: string = null;
  private _parent: Container = null;
  private _translation: vec3 = null;
  private _rotation: quat = null;
  private _scale: vec3 = null;

  private _modelMatrix: mat4 = null;
  private _modelInverseMatrix: mat4 = null;
  private _rotationMatrix: mat4 = null;

  private _children: Container[] = [];

  private _boundings: AABB = null;

  private _destroyedState: boolean = false;

  /**
   * @param options - Create options
   */
  public constructor(options?: IContainerOptions) {
    // Normalize options
    options = Object.assign({}, CONTAINER_DEFAULT_OPTIONS, options);
    // Process options
    this.setName(options.name);
    this._parent = options.parent;
    this._translation = options.translation ? options.translation : vec3.create();
    this._rotation = options.rotation ? options.rotation : quat.create();
    this._scale = options.scale ? options.scale : vec3.fromValues(1, 1, 1);
    this._modelMatrix = mat4.create();
    this._modelInverseMatrix = mat4.create();
    this._rotationMatrix = mat4.create();
    this._boundings = new AABB();
    // Trigger an initial transform update right after creation
    this.updateTransform();
  }

  /**
   * The container name
   */
  public getName(): string { return this._name; }

  /**
   * Update the container name
   * @param value - The new container name
   */
  public setName(value: string): void { this._name = value; }

  /**
   * Returns the parent container
   */
  public getParent(): Container { return this._parent; }

  /**
   * Returns the top-level parent container
   */
  public getTopLevelParent(): Container {
    let current = this.getParent();
    while (current !== null) {
      if (current.getParent() === null) break;
      current = current.getParent();
    }
    return current;
  }

  /**
   * Update the parent container
   * @param parent - The new parent container
   */
  public setParent(value: Container): void {
    this._parent = value;
    this.updateTransform();
  }

  /**
   * The container's translation
   */
  public getTranslation(): vec3 { return this._translation; }

  /**
   * Update the container's translation
   * @param value - The new container translation
   */
  public setTranslation(value: vec3): void {
    this._translation = value;
    this.updateTransform();
  }

  /**
   * The container's rotation
   */
  public getRotation(): quat { return this._rotation; }

  /**
   * Update the container's rotation
   * @param value - The new container rotation
   */
  public setRotation(value: quat): void {
    this._rotation = value;
    this.updateTransform();
  }

  /**
   * The container's scale
   */
  public getScale(): vec3 { return this._scale; }

  /**
   * Update the container's scale
   * @param value - The new container scale
   */
  public setScale(value: vec3): void {
    this._scale = value;
    this.updateTransform();
  }

  /**
   * Translates this container
   * @param value - A vector to translate by
   */
  public translate(value: vec3): void {
    const translation = this._translation;
    translation[0] += value[0];
    translation[1] += value[1];
    translation[2] += value[2];
    this.updateTransform();
  }

  /**
   * Rotates this container
   * @param value - A vector to rotate by (in radians)
   */
  public rotate(value: vec3): void {
    const rotation = this._rotation;
    quat.rotateX(rotation, rotation, value[0]);
    quat.rotateY(rotation, rotation, value[1]);
    quat.rotateZ(rotation, rotation, value[2]);
    this.updateTransform();
  }

  /**
   * Scales this container
   * @param value - A vector to scale by
   */
  public scale(value: vec3): void {
    const scale = this._scale;
    scale[0] *= value[0];
    scale[1] *= value[1];
    scale[2] *= value[2];
    this.updateTransform();
  }

  /**
   * The model matrix of this container
   */
  public getModelMatrix(): mat4 { return this._modelMatrix; }

  /**
   * The model inverse matrix of this container
   */
  public getModelInverseMatrix(): mat4 { return this._modelInverseMatrix; }

  /**
   * The rotation matrix of this container
   */
  public getRotationMatrix(): mat4 { return this._rotationMatrix; }

  /**
   * The boundings of this container
   */
  public getBoundings(): AABB { return this._boundings; }

  /**
   * Indicates if the container is destroyed
   */
  public isDestroyed(): boolean { return this._destroyedState; }

  /**
   * Returns the children of this container
   */
  public getChildren(): Container[] {
    return this._children;
  }

  /**
   * Returns the child based on the provided index
   * @param index - The child index to query by
   */
  public getChildByIndex(index: number): Container {
    return this._children[index] || null;
  }

  /**
   * Returns the child based on the provided index
   * @param name - The child name to query by
   */
  public getChildByName(name: string): Container {
    const children = this._children;
    for (let ii = 0; ii < children.length; ++ii) {
      const child = children[ii];
      if (child.getName() === name) return child;
    }
    return null;
  }

  /**
   * Add a new child to the container
   * @param child - The child to add
   */
  public addChild(child: Container): number {
    const childIndex = this._children.indexOf(child);
    if (childIndex === -1) {
      child.setParent(this);
      this._children.push(child);
      this.updateBoundings();
      return this._children.length - 1;
    }
    return -1;
  }

  /**
   * Add new children to the container
   * @param children - The children to add
   */
  public addChildren(children: Container[]): void {
    for (let ii = 0; ii < children.length; ++ii) {
      const child = children[ii];
      const childIndex = this._children.indexOf(child);
      if (childIndex === -1) {
        child.setParent(this);
        this._children.push(child);
      }
    }
    this.updateBoundings();
  }

  /**
   * Check if the container contains a child
   * @param child - The child to check
   */
  public hasChild(child: Container): boolean {
    const childIndex = this._children.indexOf(child);
    return childIndex !== -1;
  }

  /**
   * Remove a child from the container
   * @param child - The child to remove
   */
  public removeChild(child: Container): number {
    const childIndex = this._children.indexOf(child);
    if (childIndex !== -1) {
      const child = this._children[childIndex];
      child.setParent(null);
      this._children.splice(childIndex, 1);
      this.updateBoundings();
      return childIndex;
    }
    return -1;
  }

  /**
   * Build this container
   * This is an internal method
   * @param renderer - Renderer instance
   */
  public build(renderer: Renderer): void {
    // Abort if the container is destroyed
    if (this.isDestroyed()) return;
    const children = this.getChildren();
    for (let ii = 0; ii < children.length; ++ii) {
      const child = children[ii];
      child.build(renderer);
    }
  }

  /**
   * Update this container
   * This is an internal method
   * @param renderer - Renderer instance
   */
  public update(renderer: Renderer): void {
    // Abort if the container is destroyed
    if (this.isDestroyed()) return;
    this.updateTransform();
    const children = this.getChildren();
    for (let ii = 0; ii < children.length; ++ii) {
      const child = children[ii];
      child.update(renderer);
    }
  }

  /**
   * Render this container
   * This is an internal method
   * @param encoder - Encoder object to add commands to
   */
  public render(encoder: GPURenderPassEncoder): void {
    // Abort if the container is destroyed
    if (this.isDestroyed()) return;
    const children = this.getChildren();
    for (let ii = 0; ii < children.length; ++ii) {
      const child = children[ii];
      child.render(encoder);
    }
  }

  /**
   * Destroy this Object
   */
  public destroy(): void {
    this._destroyedState = true;
    this._name = null;
    this._parent = null;
    this._translation = null;
    this._rotation = null;
    this._scale = null;
    this._modelMatrix = null;
    this._modelInverseMatrix = null;
    this._rotationMatrix = null;
    // Destroy children
    const children = this.getChildren();
    for (let ii = 0; ii < children.length; ++ii) {
      const child = children[ii];
      child.destroy();
    }
    this._children = null;
    this._boundings = null;
  }

  /**
   * Update the transforms of this container
   */
  public updateTransform(): void {
    const parent = this.getParent();
    const mModel = this.getModelMatrix();
    const mModelInverse = this.getModelInverseMatrix();
    const mRotation = this.getRotationMatrix();
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
    // Apply parent transform
    if (parent !== null) {
      mat4.multiply(mModel, mModel, parent.getModelMatrix());
    }
    mat4.invert(mModelInverse, mModel);
    // Update the boundings of this container
    this.updateBoundings();
  }

  /**
   * Compute the boundings of this container
   */
  public computeBoundings(): IAABBBounding {
    const children = this.getChildren();
    // Loop through all children and get their boundings
    const min = vec3.fromValues(Infinity, Infinity, Infinity);
    const max = vec3.fromValues(-Infinity, -Infinity, -Infinity);
    for (let ii = 0; ii < children.length; ++ii) {
      const child = children[ii];
      const childBoundings = child.getBoundings();
      // Process min boundings
      {
        const [x, y, z] = childBoundings.getMin();
        if (x < min[0]) min[0] = x;
        if (y < min[1]) min[1] = y;
        if (z < min[2]) min[2] = z;
      }
      // Process max boundings
      {
        const [x, y, z] = childBoundings.getMax();
        if (x > max[0]) max[0] = x;
        if (y > max[1]) max[1] = y;
        if (z > max[2]) max[2] = z;
      }
    }
    return {min, max};
  }

  /**
   * Update the AABB of this container
   */
  public updateBoundings(): void {
    // Update the bounding of this container
    const boundings = this.getBoundings();
    const {min, max} = this.computeBoundings();
    // Only execute this when the boundings have actually changed
    if (!vec3.exactEquals(boundings.getMin(), min) || !vec3.exactEquals(boundings.getMax(), max)) {
      // Update boundings
      vec3.copy(boundings.getMin(), min);
      vec3.copy(boundings.getMax(), max);
      // Update the boundings of the top-level parent container
      const topLevel = this.getTopLevelParent();
      if (topLevel !== null) topLevel.updateBoundings();
    }
  }

}
