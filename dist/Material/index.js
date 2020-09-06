"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Material = void 0;
const utils_1 = require("../utils");
const constants_1 = require("../constants");
const RenderPipelineGenerator_1 = require("./RenderPipelineGenerator");
;
const MATERIAL_UNIFORM_DEFAULT_OPTIONS = {
    id: 0,
    name: null,
    type: constants_1.SHADER_UNIFORM.NONE,
    visibility: constants_1.SHADER_STAGE.NONE,
    isShared: false,
    byteLength: 0x0
};
;
const MATERIAL_ATTRIBUTE_DEFAULT_OPTIONS = {
    id: 0,
    name: null,
    type: constants_1.SHADER_ATTRIBUTE.NONE,
    byteOffset: -1
};
;
const MATERIAL_SHADER_DEFAULT_OPTIONS = {
    shader: null,
    uniforms: null
};
;
const MATERIAL_DEFAULT_OPTIONS = {
    name: null,
    attributes: null,
    cullMode: constants_1.MATERIAL_CULL_MODE.NONE,
    blendMode: constants_1.MATERIAL_BLEND_MODE.NONE,
    vertexShader: null,
    fragmentShader: null
};
class Material extends utils_1.EventEmitter {
    /**
     * @param options Create options
     */
    constructor(options) {
        super();
        this._renderPipeline = null;
        this._uniformUpdateQueue = [];
        this._sharedUniformResources = [];
        // Normalize options
        options = Object.assign({}, MATERIAL_DEFAULT_OPTIONS, options);
        options.vertexShader = Object.assign({}, MATERIAL_SHADER_DEFAULT_OPTIONS, options.vertexShader);
        options.fragmentShader = Object.assign({}, MATERIAL_SHADER_DEFAULT_OPTIONS, options.fragmentShader);
        // Process options
        this.setName(options.name);
        this._attributes = options.attributes.map(attr => Object.assign({}, MATERIAL_ATTRIBUTE_DEFAULT_OPTIONS, attr));
        this._cullMode = options.cullMode;
        this._blendMode = options.blendMode;
        this._vertexShader = options.vertexShader.shader;
        this._fragmentShader = options.fragmentShader.shader;
        this._uniforms = this.generateUniforms(options);
        // Trigger an initial build on creation
        this.triggerRebuild();
    }
    /**
     * Generates unified uniforms and determines their visibilities
     * @param options
     */
    generateUniforms(options) {
        const out = [];
        const { vertexShader, fragmentShader } = options;
        let bindingId = 0;
        // Generate vertex shader uniforms
        for (const uniform of vertexShader.uniforms) {
            const normalized = Object.assign({}, MATERIAL_UNIFORM_DEFAULT_OPTIONS, uniform);
            // Make sure the visibility doesn't get modified from outside
            if (normalized.visibility !== constants_1.SHADER_STAGE.NONE)
                throw new Error(`Initial uniform visibility must be 'SHADER_STAGE.NONE'`);
            // Add the actual visibility
            normalized.visibility = constants_1.SHADER_STAGE.VERTEX;
            if (normalized.id !== -1)
                bindingId = normalized.id;
            normalized.id = bindingId;
            out.push(normalized);
            bindingId++;
        }
        ;
        // Generate fragment shader uniforms
        for (const uniform of fragmentShader.uniforms) {
            const normalized = Object.assign({}, MATERIAL_UNIFORM_DEFAULT_OPTIONS, uniform);
            // Make sure the visibility doesn't get modified from outside
            if (normalized.visibility !== constants_1.SHADER_STAGE.NONE)
                throw new Error(`Initial uniform visibility must be 'SHADER_STAGE.NONE'`);
            // Add the actual visibility
            normalized.visibility = constants_1.SHADER_STAGE.FRAGMENT;
            if (normalized.id !== -1)
                bindingId = normalized.id;
            normalized.id = bindingId;
            out.push(normalized);
            bindingId++;
        }
        ;
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
                const secondUniform = (duplicates[0] !== uniform ? duplicates[0] : duplicates[1]);
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
                uniform.visibility = constants_1.SHADER_STAGE.VERTEX | constants_1.SHADER_STAGE.FRAGMENT;
                // Remove second uniform
                out.splice(out.indexOf(secondUniform), 1);
            }
            // Something went seriously wrong
            else {
                throw new Error(`Uniform misusage for '${uniform.name}'`);
            }
        }
        ;
        return out;
    }
    ;
    /**
     * The material name
     */
    getName() { return this._name; }
    /**
     * Update the material name
     * @param value
     */
    setName(value) { this._name = value; }
    /**
     * The shader material uniforms
     */
    getUniforms() { return this._uniforms; }
    ;
    /**
     * Returns the given shader uniform based on the provided name
     * @param name The shader uniform name
     */
    getUniformByName(name) {
        const uniforms = this.getUniforms();
        for (let ii = 0; ii < uniforms.length; ++ii) {
            let uniform = uniforms[ii];
            if (uniform.name === name)
                return uniform;
        }
        ;
        return null;
    }
    /**
     * Returns the given uniform resource based on the provided id
     * @param id The id to lookup for
     */
    getSharedUniformResourceById(id) {
        let uniformResources = this._sharedUniformResources;
        for (let ii = 0; ii < uniformResources.length; ++ii) {
            let resource = uniformResources[ii];
            if (resource !== null && resource.id === id)
                return resource;
        }
        ;
        return null;
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
        let uniform = this.getUniformByName(name);
        if (uniform === null)
            throw new ReferenceError(`Failed to resolve material uniform for '${name}'`);
        if (!uniform.isShared)
            throw new Error(`Uniform '${name}' isn't declared as shared and must be accessed through its mesh`);
        this.enqueueUniformUpdate(uniform.id, data);
    }
    /**
     * The material attributes
     */
    getAttributes() { return this._attributes; }
    ;
    /**
     * The material culling mode
     */
    getCullMode() { return this._cullMode; }
    ;
    /**
     * The material blending mode
     */
    getBlendMode() { return this._blendMode; }
    ;
    /**
     * The material vertex shader
     */
    getVertexShader() { return this._vertexShader; }
    ;
    /**
     * The material fragment shader
     */
    getFragmentShader() { return this._fragmentShader; }
    ;
    /**
     * The material render pipeline
     */
    getRenderPipeline() { return this._renderPipeline; }
    ;
    /**
     * Determines if the material has to build a new pipeline
     */
    needsRebuild() {
        return this._needsRebuildState;
    }
    /**
     * Triggers a rebuild of the material's pipeline
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
     * Build and compile the material into a render pipeline
     * @param renderer
     */
    build(renderer) {
        // Abort if the material pipeline doesn't need a rebuild
        if (!this.needsRebuild())
            return;
        // Generate a new pipeline
        this._renderPipeline = RenderPipelineGenerator_1.RenderPipelineGenerator.generate(this, renderer.getDevice());
        // Build bind group resources
        this._sharedUniformResources = RenderPipelineGenerator_1.RenderPipelineGenerator.generateBindGroupResources(this, true, renderer.getDevice());
        this.update(renderer);
        // Disable further rebuilds
        this.resetRebuild();
        this.emit("build");
    }
    /**
     * Update this material
     * Used to e.g. process pending uniform resource updates
     * @param renderer
     */
    update(renderer) {
        renderer.processUniformUpdateQueue(this._uniformUpdateQueue, this._sharedUniformResources);
    }
    /**
     * Destroy this Object
     */
    destroy() {
        this._name = null;
        this._attributes = null;
        this._vertexShader = null;
        this._fragmentShader = null;
        this._uniforms = null;
        this._renderPipeline = null;
        this._uniformUpdateQueue = null;
        this._sharedUniformResources = null;
        this.emit("destroy");
    }
}
exports.Material = Material;
;
//# sourceMappingURL=index.js.map