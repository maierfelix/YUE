import { EventEmitter } from "../utils";
import { SAMPLER_FILTER_MODE, SAMPLER_WRAP_MODE } from "../constants";
export interface ISamplerAdressModeOptions {
    U: SAMPLER_WRAP_MODE;
    V: SAMPLER_WRAP_MODE;
    W: SAMPLER_WRAP_MODE;
}
export interface ISamplerOptions {
    name?: string;
    addressMode?: ISamplerAdressModeOptions;
    filterMode?: SAMPLER_FILTER_MODE;
}
export declare class Sampler extends EventEmitter {
    private _name;
    private _addressMode;
    private _filterMode;
    /**
     * @param options Create options
     */
    constructor(options?: ISamplerOptions);
    /**
     * The sampler name
     */
    getName(): string;
    /**
     * Update the sampler name
     * @param value
     */
    setName(value: string): void;
    /**
     * The sampler address mode
     */
    getAddressMode(): ISamplerAdressModeOptions;
    /**
     * The sampler filter mode
     */
    getFilterMode(): SAMPLER_FILTER_MODE;
    /**
     * Destroy this Object
     */
    destroy(): void;
}
