interface IDataToBufferTransfer {
  buffer: GPUBuffer;
  data: ArrayBufferView;
  offset: number;
  callback: Function;
};

interface IDataToTextureTransfer {
  texture: GPUTexture;
  data: ArrayBufferView;
  width: number;
  height: number;
  depth: number;
  bytesPerRow: number;
  callback: Function;
};

const SRC_COPY_BUFFER_SIZE = 2 ** 18;

export class QueueCommander {

  private _device: GPUDevice = null;

  private _bufferDataToBufferTransfer: GPUBuffer = null;

  private _dataToBufferTransfers: IDataToBufferTransfer[] = [];
  private _dataToTextureTransfers: IDataToTextureTransfer[] = [];

  /**
   * @param device 
   */
  public constructor(device: GPUDevice) {
    this._device = device;
    this._bufferDataToBufferTransfer = this.createBuffer(
      SRC_COPY_BUFFER_SIZE,
      GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE
    );
  }

  /**
   * The GPU device
   */
  private getDevice(): GPUDevice { return this._device; }

  /**
   * Create a new GPU buffer
   * @param size 
   * @param usage 
   */
  private createBuffer(size: number, usage: GPUBufferUsageFlags): GPUBuffer {
    const buffer = this.getDevice().createBuffer({
      size: size,
      usage: usage,
      mappedAtCreation: false
    });
    return buffer;
  }

  /**
   * Transfer CPU data into a GPUBuffer
   * @param buffer The destination buffer to copy the data into
   * @param data The data to copy
   * @param byteOffset The starting byte offset into the destination buffer
   */
  public transferDataToBuffer(
    buffer: GPUBuffer,
    data: ArrayBufferView,
    byteOffset: number = 0x0,
    callback: Function = null
  ): void {
    this._dataToBufferTransfers.push({
      buffer, data, offset: byteOffset, callback
    });
  }

  /**
   * Transfer CPU data into a GPUTexture
   * @param buffer The destination texture to copy the data into
   * @param data The data to copy
   */
  public transferDataToTexture(
    texture: GPUTexture,
    data: ArrayBufferView,
    width: number = 0,
    height: number = 0,
    depth: number = 0,
    bytesPerRow: number = 0,
    callback: Function = null
  ): void {
    this._dataToTextureTransfers.push({
      texture, data, width, height, depth, bytesPerRow, callback
    });
  }

  /**
   * Flush and execute all queued operations
   */
  public async flush(): Promise<void> {
    await this.flushDataToBufferTransfers();
    await this.flushDataToTextureTransfers();
  }

  /**
   * Flush all data to buffer transfers
   */
  private async flushDataToBufferTransfers(): Promise<void> {
    const device = this.getDevice();
    const queue = device.defaultQueue;

    const dataToBufferTransfers = this._dataToBufferTransfers;
    // Abort here if there's nothing to do
    if (!dataToBufferTransfers.length) return;

    // Buffer for CPU -> GPU copy operations
    const srcCopyBuffer = this._bufferDataToBufferTransfer;
    // Map buffer to be CPU writeable
    await srcCopyBuffer.mapAsync(GPUMapMode.WRITE, 0x0, SRC_COPY_BUFFER_SIZE);
    // Create array view into mapped buffer
    const srcCopyData = new Uint8Array(srcCopyBuffer.getMappedRange(0x0, SRC_COPY_BUFFER_SIZE));

    // Buffer copies which are too large to be chunked together
    const rawQueueBufferCopies: IDataToBufferTransfer[] = [];

    // Record enqueued operations
    const commandEncoder = device.createCommandEncoder({});
    // Record buffer copy operations
    {
      let byteOffset = 0x0;
      for (let ii = 0; ii < dataToBufferTransfers.length; ++ii) {
        const {buffer, data, offset} = dataToBufferTransfers[ii];
        const dataBytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        // Need resize
        if (byteOffset + dataBytes.byteLength > srcCopyData.byteLength) {
          //throw new RangeError(`Copy buffer is not large enough to hold data`);
          rawQueueBufferCopies.push(dataToBufferTransfers[ii]);
          // Don't forget to remove transfer item
          dataToBufferTransfers.splice(ii--, 1);
          continue;
        }
        // copy into CPU mapped buffer
        srcCopyData.set(dataBytes, byteOffset);
        // record CPU -> GPU copy operation
        commandEncoder.copyBufferToBuffer(
          srcCopyBuffer, byteOffset, buffer, offset, dataBytes.byteLength
        );
        byteOffset += dataBytes.byteLength;
        // Remove transfer item
        dataToBufferTransfers.splice(ii--, 1);
      };
    }
    // Unmap buffer
    srcCopyBuffer.unmap();
    // Execute recorded commands
    queue.submit([commandEncoder.finish()]);

    // Flush large buffers
    for (let ii = 0; ii < rawQueueBufferCopies.length; ++ii) {
      const {buffer, data, offset} = rawQueueBufferCopies[ii];
      // CPU -> GPU copy
      queue.writeBuffer(buffer, offset, data);
      // Remove transfer item
      rawQueueBufferCopies.splice(ii--, 1);
    };

    // Trigger callbacks if necessary
    for (const {callback} of dataToBufferTransfers) {
      if (callback instanceof Function) callback();
    };
  }

  /**
   * Flush all data to texture transfers
   */
  private async flushDataToTextureTransfers(): Promise<void> {
    const device = this.getDevice();
    const queue = device.defaultQueue;

    const dataToTextureTransfers = this._dataToTextureTransfers;
    // Abort here if there's nothing to do
    if (!dataToTextureTransfers.length) return;

    // Transfer data to textures
    for (let ii = 0; ii < dataToTextureTransfers.length; ++ii) {
      const {texture, data, bytesPerRow, width, height, depth} = dataToTextureTransfers[ii];
      // CPU -> GPU copy
      queue.writeTexture(
        { texture, origin: { x: 0, y: 0, z: 0 } },
        data,
        { offset: 0x0, bytesPerRow, rowsPerImage: 0 },
        { width, height, depth }
      );
      // Remove transfer item
      dataToTextureTransfers.splice(ii--, 1);
    };

    // Trigger callbacks if necessary
    for (const {callback} of dataToTextureTransfers) {
      if (callback instanceof Function) callback();
    };
  }

  /**
   * Destroy this Object
   */
  public destroy(): void {
    this._device = null;
    this._bufferDataToBufferTransfer = null;
    this._dataToBufferTransfers = null;
    this._dataToTextureTransfers = null;
  }

};
