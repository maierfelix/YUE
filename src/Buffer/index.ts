import {BUFFER_FORMAT} from "../constants";
import {Renderer} from "../Renderer";

export interface IBufferOptions {
  name?: string;
  format: BUFFER_FORMAT;
  byteLength: number;
}

export const BUFFER_DEFAULT_OPTIONS: IBufferOptions = {
  name: null,
  format: BUFFER_FORMAT.NONE,
  byteLength: 0,
};

export interface IBufferUpdate {
  offset: number;
  data: ArrayBufferView;
}

export class Buffer {

  private _name: string = null;
  private _format: BUFFER_FORMAT = BUFFER_FORMAT.NONE;
  private _byteLength: number = 0;

  private _updateQueue: IBufferUpdate[] = [];

  private _resource: GPUBuffer = null;

  /**
   * @param options - Create options
   */
  public constructor(options?: IBufferOptions) {
    // Normalize options
    options = Object.assign({}, BUFFER_DEFAULT_OPTIONS, options);
    // Process options
    this.setName(options.name);
    this._format = options.format;
    this._byteLength = options.byteLength;
  }

  /**
   * The buffer name
   */
  public getName(): string { return this._name; }

  /**
   * Update the buffer name
   * @param value - The new buffer name
   */
  public setName(value: string): void { this._name = value; }

  /**
   * The buffer format
   */
  public getFormat(): BUFFER_FORMAT { return this._format; }

  /**
   * The byte length of the buffer
   */
  public getByteLength(): number { return this._byteLength; }

  /**
   * The GPU buffer resource
   */
  public getResource(): GPUBuffer { return this._resource; }

  /**
   * Create the GPU resource of the buffer
   * @param renderer - Renderer instance
   * @param descriptor - The descriptor used to create the buffer
   */
  public create(renderer: Renderer, descriptor: GPUBufferDescriptor): void {
    if (this._resource === null) {
      const device = renderer.getDevice();
      const instance = device.createBuffer(descriptor);
      this._resource = instance;
    }
  }

  /**
   * Uploads the provided data to the GPU resource
   * @param data - The data to copy over
   * @param startByteOffset - The starting byte offset into the GPU resource
   */
  public setSubData(data: any, startByteOffset: number = 0x0): void {
    // Do some quick validations
    if (!(ArrayBuffer.isView(data))) {
      throw new TypeError(`Parameter 'data' must be an ArrayBufferView`);
    }
    if (startByteOffset < 0) {
      throw new RangeError(`Parameter 'startByteOffset' must be a positive number`);
    }
    if (startByteOffset + data.byteLength > this.getByteLength()) {
      throw new RangeError(`Data copy overflows the byte length of the buffer`);
    }
    // Enqueue data copy
    this._updateQueue.push({offset: startByteOffset, data});
  }

  /**
   * Update this buffer
   */
  public update(renderer: Renderer): void {
    const queue = renderer.getDevice().defaultQueue;
    const updateQueue = this._updateQueue;
    const resource = this.getResource();
    if (resource !== null) {
      for (let ii = 0; ii < updateQueue.length; ++ii) {
        const {offset, data} = updateQueue[ii];
        queue.writeBuffer(resource, offset, data);
        updateQueue.splice(ii--, 1);
      }
    }
  }

  /**
   * Destroy this Object
   */
  public destroy(): void {
    this._name = null;
    this._resource = null;
  }

}
