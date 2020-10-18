import {EventEmitter} from "../utils";
import {TEXTURE_FORMAT} from "../constants";

export interface ITextureOptions {
  name?: string;
  data?: ArrayBufferView;
  width: number;
  height: number;
  depth?: number;
  bytesPerRow: number;
  format: TEXTURE_FORMAT;
}

export const TEXTURE_DEFAULT_OPTIONS: ITextureOptions = {
  name: null,
  data: null,
  width: 0,
  height: 0,
  depth: 1,
  bytesPerRow: 0,
  format: TEXTURE_FORMAT.NONE
};

export class Texture extends EventEmitter {

  private _name: string;
  private _data: ArrayBufferView;
  private _width: number;
  private _height: number;
  private _depth: number;
  private _bytesPerRow: number;
  private _format: TEXTURE_FORMAT;

  /**
   * @param options - Create options
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
    this._depth = options.depth;
    this._bytesPerRow = options.bytesPerRow;
    this._format = options.format;
  }

  /**
   * The texture name
   */
  public getName(): string { return this._name; }
  /**
   * Update the texture name
   * @param value - The new texture name
   */
  public setName(value: string): void { this._name = value; }

  /**
   * The texture data
   */
  public getData(): ArrayBufferView { return this._data; }

  /**
   * The texture width
   */
  public getWidth(): number { return this._width; }

  /**
   * The texture height
   */
  public getHeight(): number { return this._height; }

  /**
   * The texture depth
   */
  public getDepth(): number { return this._depth; }

  /**
   * The texture format
   */
  public getFormat(): TEXTURE_FORMAT { return this._format; }

  /**
   * The texture bytes per row
   */
  public getBytesPerRow(): TEXTURE_FORMAT { return this._bytesPerRow; }

  /**
   * Destroy this Object
   */
  public destroy(): void {
    this._name = null;
    this._data = null;
    this.emit("destroy");
  }

}
