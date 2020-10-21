import {SHADER_ATTRIBUTE, SHADER_UNIFORM, MATERIAL_CULL_MODE, MATERIAL_BLEND_MODE, SHADER_STAGE, MATERIAL_COLOR_WRITE} from "../constants";
import {Shader} from "../";
import {RenderPipelineGenerator, IRenderPipeline, IBindGroupResource} from "./RenderPipelineGenerator";
import {Renderer, IUniformUpdateEntry} from "../Renderer";

export interface IMaterialUniformOptions {
  id: number;
  name: string;
  type: SHADER_UNIFORM;
  visibility?: SHADER_STAGE;
  isShared?: boolean;
  byteLength?: number;
}

export const MATERIAL_UNIFORM_DEFAULT_OPTIONS: IMaterialUniformOptions = {
  id: 0,
  name: null,
  type: SHADER_UNIFORM.NONE,
  visibility: SHADER_STAGE.NONE,
  isShared: false,
  byteLength: 0x0
};

export interface IMaterialAttributeOptions {
  id: number;
  name?: string;
  type: SHADER_ATTRIBUTE;
  byteOffset?: number;
}

const MATERIAL_ATTRIBUTE_DEFAULT_OPTIONS: IMaterialAttributeOptions = {
  id: 0,
  name: null,
  type: SHADER_ATTRIBUTE.NONE,
  byteOffset: -1
};

export interface IMaterialShaderOptions {
  shader: Shader;
  uniforms?: IMaterialUniformOptions[];
}

const MATERIAL_SHADER_DEFAULT_OPTIONS: IMaterialShaderOptions = {
  shader: null,
  uniforms: []
};

export interface IMaterialOptions {
  name?: string;
  attributes?: IMaterialAttributeOptions[];
  cullMode?: MATERIAL_CULL_MODE;
  blendMode?: MATERIAL_BLEND_MODE;
  colorWrite?: MATERIAL_COLOR_WRITE;
  vertexShader: IMaterialShaderOptions;
  fragmentShader: IMaterialShaderOptions;
}

const MATERIAL_DEFAULT_OPTIONS: IMaterialOptions = {
  name: null,
  attributes: null,
  cullMode: MATERIAL_CULL_MODE.BACK,
  blendMode: MATERIAL_BLEND_MODE.NONE,
  colorWrite: MATERIAL_COLOR_WRITE.ALL,
  vertexShader: null,
  fragmentShader: null
};

export class Material {

  private _name: string = null;
  private _attributes: IMaterialAttributeOptions[] = [];

  private _cullMode: MATERIAL_CULL_MODE = MATERIAL_CULL_MODE.NONE;
  private _blendMode: MATERIAL_BLEND_MODE = MATERIAL_BLEND_MODE.NONE;
  private _colorWrite: MATERIAL_COLOR_WRITE = MATERIAL_COLOR_WRITE.ALL;

  private _vertexShader: Shader = null;
  private _fragmentShader: Shader = null;

  private _uniforms: IMaterialUniformOptions[] = [];
  private _renderPipeline: IRenderPipeline = null;
  private _uniformUpdateQueue: IUniformUpdateEntry[] = [];
  private _sharedUniformResources: IBindGroupResource[] = [];

  private _attributeLayoutByteStride: number = 0;

  private _destroyedState: boolean = false;
  private _needsRebuildState: boolean = false;

  /**
   * @param options - Create options
   */
  public constructor(options?: IMaterialOptions) {
    // Normalize options
    options = Object.assign({}, MATERIAL_DEFAULT_OPTIONS, options);
    options.vertexShader = Object.assign({}, MATERIAL_SHADER_DEFAULT_OPTIONS, options.vertexShader);
    options.fragmentShader = Object.assign({}, MATERIAL_SHADER_DEFAULT_OPTIONS, options.fragmentShader);
    // Process options
    this.setName(options.name);
    this._attributes = options.attributes.map(attr =>
      Object.assign({}, MATERIAL_ATTRIBUTE_DEFAULT_OPTIONS, attr)
    );
    this._cullMode = options.cullMode;
    this._blendMode = options.blendMode;
    this._colorWrite = options.colorWrite;
    this._vertexShader = options.vertexShader.shader;
    this._fragmentShader = options.fragmentShader.shader;
    this._uniforms = this._generateUniforms(options);
    // Save the attribute layout bytestride
    this._attributeLayoutByteStride = (
      (RenderPipelineGenerator.generateVertexStateDescriptor(this) as any).vertexBuffers[0].arrayStride
    );
    // Make sure the attribute layout contains a position attribute
    if (!this._attributes.find(l => l.name === "Position")) {
      throw new ReferenceError(`Attribute layout for material must contain a 'Position' entry`);
    }
    // Trigger an initial build on creation
    this._triggerRebuild();
  }

  /**
   * The material name
   */
  public getName(): string { return this._name; }
  /**
   * Update the material name
   * @param value - The new material name
   */
  public setName(value: string): void { this._name = value; }

  /**
   * The shader material uniforms
   */
  public getUniforms(): IMaterialUniformOptions[] { return this._uniforms; }

  /**
   * Returns the given shader uniform based on the provided name
   * @param name - The shader uniform name
   */
  public getUniformByName(name: string): IMaterialUniformOptions {
    const uniforms = this.getUniforms();
    for (let ii = 0; ii < uniforms.length; ++ii) {
      const uniform = uniforms[ii];
      if (uniform.name === name) return uniform;
    }
    return null;
  }

  /**
   * Returns the given uniform resource based on the provided id
   * @param id - The id to lookup for
   */
  public getSharedUniformResourceById(id: number): IBindGroupResource {
    const uniformResources = this._sharedUniformResources;
    for (let ii = 0; ii < uniformResources.length; ++ii) {
      const resource = uniformResources[ii];
      if (resource !== null && resource.id === id) return resource;
    }
    return null;
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
    // Abort if the material is destroyed
    if (this.isDestroyed()) return;
    const uniform = this.getUniformByName(name);
    if (uniform === null)
      throw new ReferenceError(`Failed to resolve material uniform for '${name}'`);
    if (!uniform.isShared)
      throw new Error(`Uniform '${name}' isn't declared as shared and must be accessed through its mesh`);
    if (data !== null)
      this.enqueueUniformUpdate(uniform.id, data);
  }

  /**
   * The material attributes
   */
  public getAttributes(): IMaterialAttributeOptions[] { return this._attributes; }

  /**
   * The material culling mode
   */
  public getCullMode(): MATERIAL_CULL_MODE { return this._cullMode; }

  /**
   * The material blending mode
   */
  public getBlendMode(): MATERIAL_BLEND_MODE { return this._blendMode; }

  /**
   * The material color write
   */
  public getColorWrite(): MATERIAL_COLOR_WRITE { return this._colorWrite; }

  /**
   * The material vertex shader
   */
  public getVertexShader(): Shader { return this._vertexShader; }

  /**
   * The material fragment shader
   */
  public getFragmentShader(): Shader { return this._fragmentShader; }

  /**
   * The material render pipeline
   */
  public getRenderPipeline(): IRenderPipeline { return this._renderPipeline; }

  /**
   * The byte stride of the attribute layout
   */
  public getAttributeLayoutByteStride(): number { return this._attributeLayoutByteStride; }

  /**
   * Indicates if the material is destroyed
   */
  public isDestroyed(): boolean { return this._destroyedState; }

  /**
   * Build and compile the material into a render pipeline
   * @param renderer - Renderer instance
   */
  public build(renderer: Renderer): void {
    // Abort if the material is destroyed
    if (this.isDestroyed()) return;
    // Abort if the material pipeline doesn't need a rebuild
    if (!this._needsRebuild()) return;
    // Generate a new pipeline
    this._renderPipeline = RenderPipelineGenerator.generate(this, renderer.getDevice());
    // Build bind group resources
    this._sharedUniformResources = RenderPipelineGenerator.generateBindGroupResources(
      this, true, renderer.getDevice()
    );
    this.update(renderer);
    // Disable further rebuilds
    this._resetRebuild();
  }

  /**
   * Update this material
   * Used to e.g. process pending uniform resource updates
   * @param renderer - Renderer instance
   */
  public update(renderer: Renderer) {
    // Abort if the material is destroyed
    if (this.isDestroyed()) return;
    renderer.processUniformUpdateQueue(
      this._uniformUpdateQueue,
      this._sharedUniformResources
    );
  }

  /**
   * Destroy this Object
   */
  public destroy(): void {
    this._destroyedState = true;
    this._name = null;
    this._attributes = null;
    this._vertexShader = null;
    this._fragmentShader = null;
    this._uniforms = null;
    this._renderPipeline = null;
    this._uniformUpdateQueue = null;
    this._sharedUniformResources = null;
  }

  /**
   * Generates unified uniforms and determines their visibilities
   * @param options - The material options
   */
  private _generateUniforms(options: IMaterialOptions): IMaterialUniformOptions[] {
    const out: IMaterialUniformOptions[] = [];
    const {vertexShader, fragmentShader} = options;
    let bindingId = 0;
    // Generate vertex shader uniforms
    for (const uniform of vertexShader.uniforms) {
      const normalized = Object.assign({}, MATERIAL_UNIFORM_DEFAULT_OPTIONS, uniform);
      // Make sure the visibility doesn't get modified from outside
      if (normalized.visibility !== SHADER_STAGE.NONE)
        throw new Error(`Initial uniform visibility must be 'SHADER_STAGE.NONE'`);
      // Add the actual visibility
      normalized.visibility = SHADER_STAGE.VERTEX;
      if (normalized.id !== -1) bindingId = normalized.id;
      normalized.id = bindingId;
      out.push(normalized);
      bindingId++;
    }
    // Generate fragment shader uniforms
    for (const uniform of fragmentShader.uniforms) {
      const normalized = Object.assign({}, MATERIAL_UNIFORM_DEFAULT_OPTIONS, uniform);
      // Make sure the visibility doesn't get modified from outside
      if (normalized.visibility !== SHADER_STAGE.NONE)
        throw new Error(`Initial uniform visibility must be 'SHADER_STAGE.NONE'`);
      // Add the actual visibility
      normalized.visibility = SHADER_STAGE.FRAGMENT;
      if (normalized.id !== -1) bindingId = normalized.id;
      normalized.id = bindingId;
      out.push(normalized);
      bindingId++;
    }
    // Uniforms can be duplicated across stages, try to fixup these
    for (const uniform of out) {
      const duplicates = out.filter(v => v.name === uniform.name);
      // No duplicates found
      if (duplicates.length === 1) {
        // Nothing to do
      }
      // Found 2 uniforms with the same name found, try to solve this
      else if (duplicates.length === 2) {
        // Filter out second uniform
        const secondUniform = (
          duplicates[0] !== uniform ? duplicates[0] : duplicates[1]
        );
        // Make sure the ids are identical
        if (uniform.id !== secondUniform.id)
        throw new Error(`Ids of multi-uniforms '${uniform.name}' are not identical`);
        // Make sure the shared states are identical
        else if (uniform.isShared !== secondUniform.isShared)
          throw new Error(`Invalid visibility state for uniform '${uniform.name}'`);
        // Make sure the visibilities are not identical
        else if (uniform.visibility === secondUniform.visibility)
          throw new Error(`Duplicated uniform '${uniform.name}'`);
        // Make sure the types are identical
        else if (uniform.type !== secondUniform.type)
          throw new Error(`Types of multi-uniforms '${uniform.name}' are not identical`);
        // Make sure the bytelengths are identical
        else if (uniform.byteLength !== secondUniform.byteLength)
          throw new Error(`Sizes of multi-uniforms '${uniform.name}' are not identical`);
        // Make uniform visible to both stages
        uniform.visibility = SHADER_STAGE.VERTEX | SHADER_STAGE.FRAGMENT;
        // Remove second uniform
        out.splice(out.indexOf(secondUniform), 1);
      }
      // Something went seriously wrong
      else {
        throw new Error(`Uniform misusage for '${uniform.name}'`);
      }
    }
    return out;
  }

  /**
   * Determines if the material has to build a new pipeline
   */
  private _needsRebuild(): boolean {
    return this._needsRebuildState;
  }
  /**
   * Triggers a rebuild of the material's pipeline
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
