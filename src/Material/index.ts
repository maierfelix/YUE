import {SHADER_ATTRIBUTE, SHADER_UNIFORM, MATERIAL_CULL_MODE, MATERIAL_BLEND_MODE, SHADER_STAGE, MATERIAL_DEPTH_COMPARISON_MODE, TEXTURE_FORMAT, MATERIAL_COLOR_MASK} from "../constants";
import {Shader} from "../";
import {RenderPipelineGenerator, IRenderPipeline, IBindGroupResource} from "./RenderPipelineGenerator";
import {Renderer, IUniformBindingEntry} from "../Renderer";
import {Buffer} from "../Buffer";
import {Texture} from "../Texture";
import {Sampler} from "../Sampler";

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

export const MATERIAL_ATTRIBUTE_DEFAULT_OPTIONS: IMaterialAttributeOptions = {
  id: 0,
  name: null,
  type: SHADER_ATTRIBUTE.NONE,
  byteOffset: -1
};

export interface IMaterialShaderOptions {
  shader: Shader;
  uniforms?: IMaterialUniformOptions[];
}

export const MATERIAL_SHADER_DEFAULT_OPTIONS: IMaterialShaderOptions = {
  shader: null,
  uniforms: []
};

export interface IMaterialOutputDepthOptions {
  format: TEXTURE_FORMAT;
  comparisonMode?: MATERIAL_DEPTH_COMPARISON_MODE;
}

export const MATERIAL_OUTPUT_DEPTH_DEFAULT_OPTIONS: IMaterialOutputDepthOptions = {
  format: TEXTURE_FORMAT.NONE,
  comparisonMode: MATERIAL_DEPTH_COMPARISON_MODE.LESS,
};

export interface IMaterialOutputColorOptions {
  format: TEXTURE_FORMAT;
  mask?: MATERIAL_COLOR_MASK;
  blendMode?: MATERIAL_BLEND_MODE;
}

export const MATERIAL_OUTPUT_COLOR_DEFAULT_OPTIONS: IMaterialOutputColorOptions = {
  format: TEXTURE_FORMAT.NONE,
  mask: MATERIAL_COLOR_MASK.ALL,
  blendMode: MATERIAL_BLEND_MODE.NONE,
};

export interface IMaterialOptions {
  name?: string;
  attributes?: IMaterialAttributeOptions[];
  cullMode?: MATERIAL_CULL_MODE;
  vertexShader: IMaterialShaderOptions;
  fragmentShader: IMaterialShaderOptions;
  depthOutput?: IMaterialOutputDepthOptions;
  colorOutputs: IMaterialOutputColorOptions[];
}

export const MATERIAL_DEFAULT_OPTIONS: IMaterialOptions = {
  name: null,
  attributes: null,
  cullMode: MATERIAL_CULL_MODE.NONE,
  vertexShader: null,
  fragmentShader: null,
  depthOutput: null,
  colorOutputs: null,
};

export class Material {

  private _name: string = null;
  private _attributes: IMaterialAttributeOptions[] = [];

  private _cullMode: MATERIAL_CULL_MODE = MATERIAL_CULL_MODE.NONE;

  private _vertexShader: Shader = null;
  private _fragmentShader: Shader = null;

  private _uniforms: IMaterialUniformOptions[] = [];
  private _renderPipeline: IRenderPipeline = null;

  private _bindGroupResources: IBindGroupResource[] = [];

  private _uniformBindingQueue: IUniformBindingEntry[] = [];
  private _uniformBindings: Map<string, (Buffer | Sampler | Texture)> = new Map();

  private _attributeLayoutByteStride: number = 0;

  private _destroyedState: boolean = false;
  private _needsRebuildState: boolean = false;

  private _depthOutput: IMaterialOutputDepthOptions = null;
  private _colorOutputs: IMaterialOutputColorOptions[] = [];

  private _rebuildCount: number = 0;

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
    this._vertexShader = options.vertexShader.shader;
    this._fragmentShader = options.fragmentShader.shader;
    this._depthOutput = options.depthOutput ? Object.assign({}, MATERIAL_OUTPUT_DEPTH_DEFAULT_OPTIONS, options.depthOutput) : null;
    this._colorOutputs = options.colorOutputs.map(c => Object.assign({}, MATERIAL_OUTPUT_COLOR_DEFAULT_OPTIONS, c));
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
   * Returns a binding resource based on the provided id
   * @param id - The id to query for
   */
  public getBindingResourceById(id: number): IBindGroupResource {
    const bindGroupResources = this._bindGroupResources;
    for (let ii = 0; ii < bindGroupResources.length; ++ii) {
      const resource = bindGroupResources[ii];
      if (resource !== null && resource.id === id) return resource;
    }
    return null;
  }

  /**
   * Bind a uniform
   * @param name - The name of the shader uniform
   * @param data - The data to bind
   */
  public bindUniform(name: string, data: (Buffer | Sampler | Texture)): void {
    // Abort if the material is destroyed
    if (this.isDestroyed()) return;
    const uniform = this.getUniformByName(name);
    if (uniform === null)
      throw new ReferenceError(`Failed to resolve material uniform for '${name}'`);
    if (!uniform.isShared)
      throw new Error(`Uniform '${name}' isn't declared as shared and must be accessed through its mesh`);
    if (data !== null)
      this._uniformBindingQueue.push({id: uniform.id, data});
    // Save uniform binding
    const bindings = this._uniformBindings;
    bindings.set(name, data);
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
   * The material vertex shader
   */
  public getVertexShader(): Shader { return this._vertexShader; }

  /**
   * The material fragment shader
   */
  public getFragmentShader(): Shader { return this._fragmentShader; }

  /**
   * The material depth output
   */
  public getDepthOutput(): IMaterialOutputDepthOptions { return this._depthOutput; }

  /**
   * The material color outputs
   */
  public getColorOutputs(): IMaterialOutputColorOptions[] { return this._colorOutputs; }

  /**
   * A counter indicating how many times the material got rebuilt
   */
  public getRebuildCount(): number { return this._rebuildCount; }

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
    const vertexShader = this.getVertexShader();
    const fragmentShader = this.getFragmentShader();
    // Create vertex shader if necessary
    if (vertexShader !== null && !vertexShader.getResource()) {
      vertexShader.create(renderer, RenderPipelineGenerator.generateShaderModuleDescriptor(vertexShader));
    }
    // Create fragment shader if necessary
    if (fragmentShader !== null && !fragmentShader.getResource()) {
      fragmentShader.create(renderer, RenderPipelineGenerator.generateShaderModuleDescriptor(fragmentShader));
    }
    // Generate a new pipeline
    this._renderPipeline = RenderPipelineGenerator.generateRenderPipeline(this, renderer.getDevice());
    // Build bind group resources
    this._bindGroupResources = RenderPipelineGenerator.generateBindGroupResources(
      this, true, renderer.getDevice()
    );
    this.update(renderer);
    // Increment rebuild counter
    this._rebuildCount++;
    // Disable further rebuilds
    this._resetRebuild();
  }

  /**
   * Update this material
   * @param renderer - Renderer instance
   */
  public update(renderer: Renderer) {
    // Abort if the material is destroyed
    if (this.isDestroyed()) return;
    renderer.processUniformBindingQueue(
      this._uniformBindingQueue,
      this._bindGroupResources
    );
    renderer.processUniformBindings(
      this._uniformBindings
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
    this._uniformBindingQueue = null;
    this._bindGroupResources = null;
    this._uniformBindings = null;
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
