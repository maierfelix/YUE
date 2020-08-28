import { EventEmitter } from "../utils";
import { SAMPLER_FILTER_MODE, SAMPLER_WRAP_MODE } from "../constants";

export interface ISamplerAdressModeOptions {
  U: SAMPLER_WRAP_MODE;
  V: SAMPLER_WRAP_MODE;
  W: SAMPLER_WRAP_MODE;
};

export interface ISamplerOptions {
  name?: string;
  addressMode?: ISamplerAdressModeOptions;
  filterMode?: SAMPLER_FILTER_MODE;
};

const SAMPLER_DEFAULT_OPTIONS: ISamplerOptions = {
  name: null,
  addressMode: {
    U: SAMPLER_WRAP_MODE.REPEAT,
    V: SAMPLER_WRAP_MODE.REPEAT,
    W: SAMPLER_WRAP_MODE.REPEAT
  },
  filterMode: SAMPLER_FILTER_MODE.LINEAR
};

export class Sampler extends EventEmitter {

  private _name: string;
  private _addressMode: ISamplerAdressModeOptions;
  private _filterMode: SAMPLER_FILTER_MODE;

  /**
   * @param options Create options
   */
  public constructor(options?: ISamplerOptions) {
    super();
    // Normalize options
    options = Object.assign({}, SAMPLER_DEFAULT_OPTIONS, options);
    // Process options
    this.setName(options.name);
    this._addressMode = Object.assign({}, options.addressMode);
    this._filterMode = options.filterMode;
  }

  /**
   * The sampler name
   */
  public getName(): string { return this._name; }
  /**
   * Update the sampler name
   * @param value 
   */
  public setName(value: string): void { this._name = value; }

  /**
   * The sampler address mode
   */
  public getAddressMode(): ISamplerAdressModeOptions { return Object.assign({}, this._addressMode); }

  /**
   * The sampler filter mode
   */
  public getFilterMode(): SAMPLER_FILTER_MODE { return this._filterMode; }

  /**
   * Destroy this Object
   */
  public destroy(): void {
    this._name = null;
    this._addressMode = null;
    this.emit("destroy");
  }

};
