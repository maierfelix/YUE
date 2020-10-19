import {vec3, quat, mat4} from "gl-matrix";
import {Renderer} from "../Renderer";
import {Warn} from "../utils";

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
   * Update the parent container
   * @param parent - The new parent container
   */
  public setParent(value: Container): void { this._parent = value; }

  /**
   * The container's translation
   */
  public getTranslation(): vec3 { return this._translation; }

  /**
   * Update the container's translation
   * @param value - The new container translation
   */
  public setTranslation(value: vec3): void { this._translation = value; }

  /**
   * The container's rotation
   */
  public getRotation(): quat { return this._rotation; }

  /**
   * Update the container's rotation
   * @param value - The new container rotation
   */
  public setRotation(value: quat): void { this._rotation = value; }

  /**
   * The container's scale
   */
  public getScale(): vec3 { return this._scale; }

  /**
   * Update the container's scale
   * @param value - The new container scale
   */
  public setScale(value: vec3): void { this._scale = value; }

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
   * Rotates this container
   * @param value - A vector to rotate by
   */
  public rotate(value: vec3): void {
    const rotation = this._rotation;
    quat.rotateX(rotation, rotation, value[0] * Math.PI / 180);
    quat.rotateY(rotation, rotation, value[1] * Math.PI / 180);
    quat.rotateZ(rotation, rotation, value[2] * Math.PI / 180);
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
      return this._children.length - 1;
    }
    return -1;
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
   * Build this container
   * @param renderer - Renderer instance
   */
  public build(renderer: Renderer): void {
    const children = this.getChildren();
    for (let ii = 0; ii < children.length; ++ii) {
      const child = children[ii];
      child.build(renderer);
    }
  }

  /**
   * Update this container
   * @param renderer - Renderer instance
   */
  public update(renderer: Renderer): void {
    this.updateTransform();
    const children = this.getChildren();
    for (let ii = 0; ii < children.length; ++ii) {
      const child = children[ii];
      child.update(renderer);
    }
  }

  /**
   * Render this container
   * @param encoder - Encoder object to add commands to
   */
  public render(encoder: GPURenderPassEncoder): void {
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
    this._name = null;
    this._translation = null;
    this._rotation = null;
    this._scale = null;
    this._modelMatrix = null;
    this._rotationMatrix = null;
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
  }

}
