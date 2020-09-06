/// <reference types="@webgpu/types" />
export declare class QueueCommander {
    private _device;
    private _bufferDataToBufferTransfer;
    private _dataToBufferTransfers;
    private _dataToTextureTransfers;
    /**
     * @param device
     */
    constructor(device: GPUDevice);
    /**
     * The GPU device
     */
    private getDevice;
    /**
     * Create a new GPU buffer
     * @param size
     * @param usage
     */
    private createBuffer;
    /**
     * Transfer CPU data into a GPUBuffer
     * @param buffer The destination buffer to copy the data into
     * @param data The data to copy
     * @param byteOffset The starting byte offset into the destination buffer
     */
    transferDataToBuffer(buffer: GPUBuffer, data: ArrayBufferView, byteOffset?: number, callback?: Function): void;
    /**
     * Transfer CPU data into a GPUTexture
     * @param buffer The destination texture to copy the data into
     * @param data The data to copy
     */
    transferDataToTexture(texture: GPUTexture, data: ArrayBufferView, width?: number, height?: number, depth?: number, bytesPerRow?: number, callback?: Function): void;
    /**
     * Flush and execute all queued operations
     */
    flush(): Promise<void>;
    /**
     * Flush all data to buffer transfers
     */
    private flushDataToBufferTransfers;
    /**
     * Flush all data to texture transfers
     */
    private flushDataToTextureTransfers;
    /**
     * Destroy this Object
     */
    destroy(): void;
}
