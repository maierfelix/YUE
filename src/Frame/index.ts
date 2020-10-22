import {Container} from "../Container";
import {Renderer} from "../Renderer";
import {AbstractCamera} from "../Camera";

export interface IFrameOptions {
  name?: string;
  camera?: AbstractCamera;
  clearColor?: ClearColorType;
}

export const FRAME_DEFAULT_OPTIONS: IFrameOptions = {
  name: null,
  camera: null,
  clearColor: [0, 0, 0, 1.0]
};

type ClearColorType = [number, number, number, number];

export class Frame extends Container {

  private _camera: AbstractCamera = null;

  private _clearColor: ClearColorType = null;

  /**
   * @param options - Create options
   */
  public constructor(options?: IFrameOptions) {
    super(options);
    // Normalize options
    options = Object.assign({}, FRAME_DEFAULT_OPTIONS, options);
    // Process options
    this.setName(options.name);
    this._camera = options.camera;
    this._clearColor = options.clearColor;
  }

  /**
   * The frame's attached camera
   */
  public getAttachedCamera(): AbstractCamera { return this._camera; }

  /**
   * Attaches a camera which is used to render this frame
   * @param camera - The camera to attach
   */
  public attachCamera(camera: AbstractCamera): void {
    this._camera = camera;
  }

  /**
   * Update the frame children
   */
  public async update(renderer: Renderer): Promise<void> {
    const children = this.getChildren();
    // First rebuild childs if necessary
    for (let ii = 0; ii < children.length; ++ii) {
      const child = children[ii];
      child.build(renderer);
      child.update(renderer);
    }
    super.update(renderer);
    // Flush the renderer (E.g. flushes buffer copy queue)
    await renderer.flush();
  }

  /**
   * Draw the frame
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
