import {TEXTURE_FORMAT} from "../constants";
import {Renderer} from "../Renderer";

export interface ITextureOptions {
  name?: string;
  data?: ArrayBufferView;
  width: number;
  height: number;
  depth?: number;
  bytesPerRow?: number;
  isRenderable?: boolean;
  format: TEXTURE_FORMAT;
}

export const TEXTURE_DEFAULT_OPTIONS: ITextureOptions = {
  name: null,
  data: null,
  width: 0,
  height: 0,
  depth: 1,
  bytesPerRow: 0,
  isRenderable: false,
  format: TEXTURE_FORMAT.NONE
};

export class Texture {

  private _name: string = null;
  private _data: ArrayBufferView = null;
  private _width: number = 0;
  private _height: number = 0;
  private _depth: number = 0;
  private _bytesPerRow: number = 0;
  private _format: TEXTURE_FORMAT = TEXTURE_FORMAT.NONE;
  private _isRenderable: boolean = false;

  private _resource: GPUTexture = null;
  private _resourceView: GPUTextureView = null;

  /**
   * @param options - Create options
   */
  public constructor(options?: ITextureOptions) {
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
    this._isRenderable = options.isRenderable;
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
   * The texture bytes per row
   */
  public getBytesPerRow(): TEXTURE_FORMAT { return this._bytesPerRow; }

  /**
   * The texture format
   */
  public getFormat(): TEXTURE_FORMAT { return this._format; }

  /**
   * Indicates if this texture is renderable
   */
  public isRenderable(): boolean { return this._isRenderable; }

  /**
   * The GPU texture resource
   */
  public getResource(): GPUTexture { return this._resource; }

  /**
   * The GPU texture view resource
   */
  public getResourceView(): GPUTextureView { return this._resourceView; }

  /**
   * Create the GPU resource of the sampler
   * @param renderer - Renderer instance
   * @param descriptor - The descriptor used to create the texture
   */
  public create(renderer: Renderer, descriptor: GPUTextureDescriptor): void {
    const device = renderer.getDevice();
    // Reserve GPUTexture in case it doesn't exist yet
    if (this._resource === null) {
      const texture = device.createTexture(descriptor);
      this._resource = texture;
      this._resourceView = texture.createView();
      // Data was provided for the texture that needs to be copied
      if (this.getData() !== null) {
        const imageData = this.getData();
        const width = this.getWidth();
        const height = this.getHeight();
        const depth = this.getDepth();
        const bytesPerRow = this.getBytesPerRow();
        const resource = this.getResource();
        renderer.getQueueCommander().transferDataToTexture(resource, imageData, width, height, depth, bytesPerRow, null);
      }
    }
  }

  /**
   * Update this texture
   */
  public update(_renderer: Renderer): void {
    
  }

  /**
   * Destroy this Object
   */
  public destroy(): void {
    this._name = null;
    this._data = null;
    this._resource = null;
    this._resourceView = null;
  }

}
