import {Container, IContainerOptions} from "../Container";
import {Renderer} from "../Renderer";
import {AbstractCamera} from "../Camera";
import {Texture} from "../Texture";
import {RenderPipelineGenerator} from "../Material/RenderPipelineGenerator";
import {FRAME_COMMAND} from "../constants";

export interface IFrameAttachment {
  attachment: Texture;
  clearColor?: ClearColorType;
  readCommand?: FRAME_COMMAND;
  writeCommand?: FRAME_COMMAND;
}

export const FRAME_ATTACHMENT_DEFAULT_OPTIONS: IFrameAttachment = {
  attachment: null,
  clearColor: null,
  readCommand: FRAME_COMMAND.READ,
  writeCommand: FRAME_COMMAND.WRITE,
};

export interface IFrameOptions extends IContainerOptions {
  name?: string;
  camera?: AbstractCamera;
  clearColor?: ClearColorType;
  depthAttachment?: IFrameAttachment;
  colorAttachments?: IFrameAttachment[];
}

export const FRAME_DEFAULT_OPTIONS: IFrameOptions = {
  name: null,
  camera: null,
  clearColor: [0, 0, 0, 0],
  depthAttachment: null,
  colorAttachments: null
};

type ClearColorType = [number, number, number, number];

export class Frame extends Container {

  private _camera: AbstractCamera = null;

  private _clearColor: ClearColorType = null;

  private _depthAttachment: IFrameAttachment = null;
  private _colorAttachments: IFrameAttachment[] = [];

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
    this._depthAttachment = options.depthAttachment ? Object.assign({}, FRAME_ATTACHMENT_DEFAULT_OPTIONS, options.depthAttachment) : null;
    this._colorAttachments = options.colorAttachments.map(a => Object.assign({}, FRAME_ATTACHMENT_DEFAULT_OPTIONS, a));
  }

  /**
   * The frame's attached camera
   */
  public getAttachedCamera(): AbstractCamera { return this._camera; }

  /**
   * The clear color of the frame
   */
  public getClearColor(): ClearColorType { return this._clearColor; }

  /**
   * The depth attachment output of the frame
   */
  public getDepthAttachment(): IFrameAttachment { return this._depthAttachment; }

  /**
   * The color attachment output of the frame
   */
  public getColorAttachments(): IFrameAttachment[] { return this._colorAttachments; }

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
    //const backBufferView = renderer.getSwapchain().getCurrentTexture().createView();
    // Create depth texture if necessary
    const depthFrameAttachment = this.getDepthAttachment();
    if (depthFrameAttachment !== null) {
      const depthAttachment = depthFrameAttachment.attachment;
      if (depthAttachment !== null && !depthAttachment.getResource()) {
        if (!depthAttachment.isRenderable) {
          throw new Error(`Depth attachment texture must have property 'isRenderable' enabled`);
        }
        const descriptor = RenderPipelineGenerator.GenerateTextureDescriptor(depthAttachment);
        depthAttachment.create(renderer, descriptor);
      }
    }
    // Create color attachments textures if necessary
    const colorFrameAttachments = this.getColorAttachments();
    for (const colorFrameAttachment of colorFrameAttachments) {
      const colorAttachment = colorFrameAttachment.attachment;
      if (colorAttachment !== null && !colorAttachment.getResource()) {
        if (!colorAttachment.isRenderable) {
          throw new Error(`Color attachment texture must have property 'isRenderable' enabled`);
        }
        const descriptor = RenderPipelineGenerator.GenerateTextureDescriptor(colorAttachment);
        colorAttachment.create(renderer, descriptor);
      }
    }
    // Update camera is there is one attached
    if (camera instanceof AbstractCamera) {
      camera.update();
    }
    // Render each child
    const commandEncoder = device.createCommandEncoder({});
    for (let ii = 0; ii < children.length; ++ii) {
      const renderPassDescriptor = RenderPipelineGenerator.generateRenderPassDescriptor(
        depthFrameAttachment,
        colorFrameAttachments
      );
      //(renderPassDescriptor.colorAttachments as any)[0].attachment = backBufferView;
      const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);
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
