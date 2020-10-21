import {Container} from "../Container";
import {Renderer} from "../Renderer";
import {AbstractCamera} from "../Camera";

export interface ISceneOptions {
  name?: string;
  camera?: AbstractCamera;
  clearColor?: ClearColorType;
}

export const SCENE_DEFAULT_OPTIONS: ISceneOptions = {
  name: null,
  camera: null,
  clearColor: [0, 0, 0, 1.0]
};

type ClearColorType = [number, number, number, number];

export class Scene extends Container {

  private _clearColor: ClearColorType = null;

  private _camera: AbstractCamera = null;

  /**
   * @param options - Create options
   */
  public constructor(options?: ISceneOptions) {
    super(options);
    // Normalize options
    options = Object.assign({}, SCENE_DEFAULT_OPTIONS, options);
    // Process options
    this.setName(options.name);
    this._camera = options.camera;
    this._clearColor = options.clearColor;
  }

  /**
   * The scene's attached camera
   */
  public getAttachedCamera(): AbstractCamera { return this._camera; }

  /**
   * Attaches a camera which is used to render this scene
   * @param camera - The camera to attach
   */
  public attachCamera(camera: AbstractCamera): void {
    this._camera = camera;
  }

  /**
   * Update the scenes children
   */
  public async update(renderer: Renderer): Promise<void> {
    const children = this.getChildren();
    // First rebuild childs if necessary
    for (let ii = 0; ii < children.length; ++ii) {
      const child = children[ii];
      child.build(renderer);
      child.update(renderer);
    }
    // Flush the renderer (E.g. flushes buffer copy queue)
    await renderer.flush();
  }

  /**
   * Draw the scene
   */
  public draw(renderer: Renderer): void {
    const children = this.getChildren();
    const device = renderer.getDevice();
    const camera = this.getAttachedCamera();
    const backBufferView = renderer.getSwapchain().getCurrentTexture().createView();
    // No camera attached, abort
    if (!(camera instanceof AbstractCamera)) return;
    camera.update();
    // Initial clear
    {
      const [r, g, b, a] = this._clearColor;
      const commandEncoder = device.createCommandEncoder({});
      const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
          attachment: backBufferView,
          loadValue: {r, g, b, a},
          storeOp: "store"
        }],
        depthStencilAttachment: {
          attachment: renderer.getDepthAttachment(),
          depthLoadValue: 1.0,
          depthStoreOp: "store",
          stencilLoadValue: 0,
          stencilStoreOp: "store"
        }
      });
      renderPass.endPass();
      device.defaultQueue.submit([commandEncoder.finish()]);
    }
    // Render each child
    const commandEncoder = device.createCommandEncoder({});
    for (let ii = 0; ii < children.length; ++ii) {
      const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
          attachment: backBufferView,
          loadValue: "load",
          storeOp: "store"
        }],
        depthStencilAttachment: {
          attachment: renderer.getDepthAttachment(),
          depthLoadValue: "load",
          depthStoreOp: "store",
          stencilLoadValue: 0,
          stencilStoreOp: "store"
        }
      });
      const child = children[ii];
      child.render(renderPass);
      renderPass.endPass();
    }
    device.defaultQueue.submit([commandEncoder.finish()]);
  }

  /**
   * Destroy this Object
   */
  public destroy(): void {
    super.destroy();
    this._camera = null;
    this._clearColor = null;
  }

}
