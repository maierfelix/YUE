import { EventEmitter } from "../utils";
import { TEXTURE_FORMAT } from "../constants";
export interface ITextureOptions {
    name?: string;
    data?: ArrayBufferView;
    width: number;
    height: number;
    depth?: number;
    bytesPerRow: number;
    format: TEXTURE_FORMAT;
}
export declare class Texture extends EventEmitter {
    private _name;
    private _data;
    private _width;
    private _height;
    private _depth;
    private _bytesPerRow;
    private _format;
    /**
     * @param options Create options
     */
    constructor(options?: ITextureOptions);
    /**
     * The texture name
     */
    getName(): string;
    /**
     * Update the texture name
     * @param value
     */
    setName(value: string): void;
    /**
     * The texture data
     */
    getData(): ArrayBufferView;
    /**
     * The texture width
     */
    getWidth(): number;
    /**
     * The texture height
     */
    getHeight(): number;
    /**
     * The texture depth
     */
    getDepth(): number;
    /**
     * The texture format
     */
    getFormat(): TEXTURE_FORMAT;
    /**
     * The texture bytes per row
     */
    getBytesPerRow(): TEXTURE_FORMAT;
    /**
     * Destroy this Object
     */
    destroy(): void;
}
