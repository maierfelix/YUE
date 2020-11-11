import {vec3, quat, mat4} from "gl-matrix";
import {AABB, IAABBBounding} from "../AABB";
import {Renderer} from "../Renderer";
import {GetUniqueId} from "../utils";

export interface IContainerOptions {
  name?: string;
  translation?: vec3;
  rotation?: quat;
  scale?: vec3;
  pivot?: vec3;
  parent?: Container;
  visible?: boolean;
  transformAutoUpdate?: boolean;
}

export const CONTAINER_DEFAULT_OPTIONS: IContainerOptions = {
  name: null,
  translation: null,
  rotation: null,
  scale: null,
  pivot: null,
  parent: null,
  visible: true,
  transformAutoUpdate: true
};

export class Container {

  private _id: number = 0;
  private _name: string = null;

  private _parent: Container = null;

  private _pivot: vec3 = null;
  private _translation: vec3 = null;
  private _rotation: quat = null;
  private _scale: vec3 = null;

  private _modelMatrix: mat4 = null;
  private _modelInverseMatrix: mat4 = null;
  private _rotationMatrix: mat4 = null;

  private _children: Container[] = [];

  private _boundings: AABB = null;

  private _destroyedState: boolean = false;
  private _visibilityState: boolean = false;
  private _transformAutoUpdateState: boolean = false;

  /**
   * @param options - Create options
   */
  public constructor(options?: IContainerOptions) {
    // Normalize options
    options = Object.assign({}, CONTAINER_DEFAULT_OPTIONS, options);
    // Process options
    this._id = GetUniqueId();
    this.setName(options.name);
    this._parent = options.parent;
    this._translation = options.translation ? options.translation : vec3.create();
    this._rotation = options.rotation ? options.rotation : quat.create();
    this._scale = options.scale ? options.scale : vec3.fromValues(1, 1, 1);
    this._pivot = options.pivot;
    this._visibilityState = options.visible;
    this._transformAutoUpdateState = options.transformAutoUpdate;
    this._modelMatrix = mat4.create();
    this._modelInverseMatrix = mat4.create();
    this._rotationMatrix = mat4.create();
    this._boundings = new AABB();
    // Trigger an initial transform update right after creation
    if (this.doTransformAutoUpdate()) {
      this.updateTransform();
    }
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
   * The container's unique id
   */
  public getId(): number { return this._id; }

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
  }

  /**
   * Returns the children of this container
   */
  public getChildren(): Container[] {
    return this._children;
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
   * Indicates if the container gets rendered
   */
  public isVisible(): boolean { return this._visibilityState; }

  /**
   * Enables that the container should be rendered
   */
  public show(): void { this._visibilityState = true; }

  /**
   * Disables that the container should be rendered
   */
  public hide(): void { this._visibilityState = false; }

  /**
   * Indicates if the container is destroyed
   */
  public isDestroyed(): boolean { return this._destroyedState; }

  /**
   * Indicates if the transforms of the container should be updated automatically
   */
  public doTransformAutoUpdate(): boolean { return this._transformAutoUpdateState; }

  /**
   * Converts the provided vector from local-space into world-space
   * @param vec - The vector to convert
   */
  public localToWorld(vec: vec3): vec3 {
    return vec3.transformMat4(vec, vec, this.getModelMatrix());
  }

  /**
   * Converts the provided vector from world-space into local-space
   * @param vec - The vector to convert
   */
  public worldToLocal(vec: vec3): vec3 {
    return vec3.transformMat4(vec, vec, this.getModelInverseMatrix());
  }

  /**
   * The container's rotation pivot
   */
  public getPivot(): vec3 { return this._pivot; }

  /**
   * Update the container's rotation pivot
   * @param value - The new container pivot
   */
  public setPivot(value: vec3): void {
    if (this._pivot === null) {
      this._pivot = vec3.create();
    }
    // Pivot is updated
    if (value !== null) {
      vec3.copy(this._pivot, value);
    }
    // Pivot is destroyed
    else {
      this._pivot = null;
    }
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
    vec3.copy(this._translation, value);
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
    quat.copy(this._rotation, value);
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
    vec3.copy(this._scale, value);
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
  }

  /**
   * Translates this container on the X axis
   * @param value - The number to translate by
   */
  public translateX(value: number): void {
    this._translation[0] += value;
  }

  /**
   * Translates this container on the Y axis
   * @param value - The number to translate by
   */
  public translateY(value: number): void {
    this._translation[1] += value;
  }

  /**
   * Translates this container on the Z axis
   * @param value - The number to translate by
   */
  public translateZ(value: number): void {
    this._translation[2] += value;
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
  }

  /**
   * Rotates this container on the X axis
   * @param value - The value to rotate by (in radians)
   */
  public rotateX(value: number): void {
    quat.rotateX(this._rotation, this._rotation, value);
  }

  /**
   * Rotates this container on the Y axis
   * @param value - The value to rotate by (in radians)
   */
  public rotateY(value: number): void {
    quat.rotateY(this._rotation, this._rotation, value);
  }

  /**
   * Rotates this container on the Z axis
   * @param value - The value to rotate by (in radians)
   */
  public rotateZ(value: number): void {
    quat.rotateZ(this._rotation, this._rotation, value);
  }

  /**
   * Sets this container's rotation based on the provided axis and angle
   * @param axis - The rotation axis
   * @param angle - The rotation angle (in radians)
   */
  public rotateByAxisAngle(axis: vec3, angle: number): void {
    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm
    const rotation = this._rotation;
    const half = angle / 2;
    const s = Math.sin(half);
    rotation[0] = axis[0] * s;
    rotation[1] = axis[1] * s;
    rotation[2] = axis[2] * s;
    rotation[3] = Math.cos(half);
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
  }

  /**
   * Scales this container on the X axis
   * @param value - The value to scale by
   */
  public scaleX(value: number): void {
    this._scale[0] *= value;
  }

  /**
   * Scales this container on the Y axis
   * @param value - The value to scale by
   */
  public scaleY(value: number): void {
    this._scale[1] *= value;
  }

  /**
   * Scales this container on the Z axis
   * @param value - The value to scale by
   */
  public scaleZ(value: number): void {
    this._scale[2] *= value;
  }

  /**
   * Returns the child based on the provided id
   * @param id - The child id to query by
   */
  public getChildById(id: number): Container {
    const children = this._children;
    if (this.getId() === id) return this;
    for (let ii = 0; ii < children.length; ++ii) {
      const child = children[ii];
      const result = child.getChildById(id);
      if (result !== null) return child;
    }
    return null;
  }

  /**
   * Returns the child based on the provided name
   * @param name - The child name to query by
   */
  public getChildByName(name: string): Container {
    const children = this._children;
    if (this.getName() === name) return this;
    for (let ii = 0; ii < children.length; ++ii) {
      const child = children[ii];
      const result = child.getChildByName(name);
      if (result !== null) return child;
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
      return childIndex;
    }
    return -1;
  }

  /**
   * Update this container
   * This is an internal method
   * @param renderer - Renderer instance
   */
  public update(renderer: Renderer): void {
    // Abort if the container is destroyed
    if (this.isDestroyed()) return;
    if (this.doTransformAutoUpdate()) {
      this.updateTransform();
    }
    const children = this.getChildren();
    for (let ii = 0; ii < children.length; ++ii) {
      const child = children[ii];
      child.update(renderer);
    }
    if (this.doTransformAutoUpdate()) {
      this.updateBoundings();
    }
  }

  /**
   * Render this container
   * This is an internal method
   * @param encoder - Encoder object to add commands to
   */
  public render(encoder: GPURenderPassEncoder): void {
    // Abort if the container is destroyed or hidden
    if (this.isDestroyed() || !this.isVisible()) return;
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
    const pivot = this._pivot;
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
    // Apply rotation pivot
    if (pivot != null) {
      const px = pivot[0];
      const py = pivot[1];
      const pz = pivot[2];
      mModel[12] += px - (mModel[0] * px) - (mModel[4] * py) - (mModel[8] * pz);
      mModel[13] += py - (mModel[1] * px) - (mModel[5] * py) - (mModel[9] * pz);
      mModel[14] += pz - (mModel[2] * px) - (mModel[6] * py) - (mModel[10] * pz);
    }
    mat4.invert(mModelInverse, mModel);
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
    // Turn boundings into world-space
    const mModel = this.getModelMatrix();
    vec3.transformMat4(min, min, mModel);
    vec3.transformMat4(max, max, mModel);
    return {min, max};
  }

  /**
   * Update the boundings of this container
   */
  public updateBoundings(): void {
    // Update the boundings of this container
    const boundings = this.getBoundings();
    const {min, max} = this.computeBoundings();
    if (!vec3.exactEquals(boundings.getMin(), min) || !vec3.exactEquals(boundings.getMax(), max)) {
      // Update boundings
      vec3.copy(boundings.getMin(), min);
      vec3.copy(boundings.getMax(), max);
      // Update the boundings of the parent containers
      let current = this.getParent();
      while (current !== null) {
        current.updateBoundings();
        current = current.getParent();
      }
    }
  }

}
