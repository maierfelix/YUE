import { EventEmitter } from "../utils";
import { TEXTURE_FORMAT, TEXTURE_FILTER_MODE, TEXTURE_WRAP_MODE } from "../constants";

type TextureDataType = (
  ArrayBuffer |
  ArrayBufferView
);

export interface ITextureAdressModeOptions {
  U: TEXTURE_WRAP_MODE;
  V: TEXTURE_WRAP_MODE;
  W: TEXTURE_WRAP_MODE;
};

export interface ITextureOptions {
  name?: string;
  data: TextureDataType;
  width: number;
  height: number;
  format: TEXTURE_FORMAT;
  addressMode?: ITextureAdressModeOptions;
  filterMode?: TEXTURE_FILTER_MODE;
};

const TEXTURE_DEFAULT_OPTIONS: ITextureOptions = {
  name: null,
  data: null,
  width: 0,
  height: 0,
  format: TEXTURE_FORMAT.NONE,
  addressMode: {
    U: TEXTURE_WRAP_MODE.REPEAT,
    V: TEXTURE_WRAP_MODE.REPEAT,
    W: TEXTURE_WRAP_MODE.REPEAT
  },
  filterMode: TEXTURE_FILTER_MODE.LINEAR
};

export class Texture extends EventEmitter {

  private _name: string;
  private _data: TextureDataType;
  private _width: number;
  private _height: number;
  private _format: TEXTURE_FORMAT;
  private _addressMode: ITextureAdressModeOptions;
  private _filterMode: TEXTURE_FILTER_MODE;

  /**
   * @param options Create options
   */
  public constructor(options?: ITextureOptions) {
    super();
    // Normalize options
    options = Object.assign({}, TEXTURE_DEFAULT_OPTIONS, options);
    // Process options
    this.setName(options.name);
    this._data = options.data;
    this._width = options.width;
    this._height = options.height;
    this._format = options.format;
    this._addressMode = Object.assign({}, options.addressMode);
    this._filterMode = Object.assign({}, options.filterMode);
  }

  /**
   * The texture name
   */
  public getName(): string { return this._name; }
  /**
   * Update the texture name
   * @param value 
   */
  public setName(value: string): void { this._name = value; }

  /**
   * Destroy this Object
   */
  public destroy(): void {
    this._name = null;
    this._data = null;
    this._addressMode = null;
    this.emit("destroy");
  }

};
