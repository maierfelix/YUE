import {EventEmitter} from "../utils";
import {Scene, ISceneOptions} from "../Scene";

export interface IRendererOptions {
  canvas?: HTMLCanvasElement;
}

export const RENDERER_DEFAULT_OPTIONS: IRendererOptions = {
  canvas: null
};

const CANVAS_DEFAULT_WIDTH = 480;
const CANVAS_DEFAULT_HEIGHT = 320;

export abstract class AbstractRenderer extends EventEmitter {

  private _canvas: HTMLCanvasElement = null;

  /**
   * @param options - Create options
   */
  public constructor(options?: IRendererOptions) {
    super();
    // Normalize options
    options = Object.assign({}, RENDERER_DEFAULT_OPTIONS, options);
    // Process options
    this._canvas = options.canvas;
    // Create internal canvas
    if (!(this._canvas instanceof HTMLCanvasElement)) {
      this._canvas = document.createElement("canvas");
      this._canvas.width = CANVAS_DEFAULT_WIDTH;
      this._canvas.height = CANVAS_DEFAULT_HEIGHT;
    }
  }

  /**
   * The rendering surface to render into
   * TODO: allow other targets such as FBOs
   */
  public getCanvas(): HTMLCanvasElement { return this._canvas; }

  /**
   * The width of the rendering surface
   */
  public getWidth(): number { return this._canvas.width; }

  /**
   * The height of the rendering surface
   */
  public getHeight(): number { return this._canvas.height; }

  /**
   * Resize the rendering surface
   * @param width - The destination width after resize
   * @param height - The destination height after resize
   */
  public resize(width: number, height: number) {
    this._canvas.width = width;
    this._canvas.height = height;
    this.emit("resize");
  }

  /**
   * Render a scene, must be overridden
   */
  public abstract render(scene: Scene): void;

  /**
   * Create a new scene
   */
  public createScene(options?: ISceneOptions): Scene {
    options = Object.assign({renderer: this}, options);
    return new Scene(options);
  }

  /**
   * Destroy this Object
   */
  public destroy(): void {
    this._canvas = null;
    this.emit("destroy");
  }

}
