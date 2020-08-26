import { EventEmitter, Warn } from "../utils";
import { Mesh } from "../Mesh";
import { Renderer } from "../Renderer";
import { AbstractCamera } from "../Camera";

export interface ISceneOptions {
  name?: string;
  camera?: AbstractCamera;
};

const SCENE_DEFAULT_OPTIONS: ISceneOptions = {
  name: null,
  camera: null
};

export class Scene extends EventEmitter {

  private _name: string;

  private _camera: AbstractCamera;
  private _children: Mesh[] = [];

  /**
   * @param options Create options
   */
  public constructor(options?: ISceneOptions) {
    super();
    // Normalize options
    options = Object.assign({}, SCENE_DEFAULT_OPTIONS, options);
    // Process options
    this.setName(options.name);
    this._camera = options.camera;
  }

  /**
   * The shader name
   */
  public getName(): string { return this._name; }
  /**
   * Update the shader name
   * @param value 
   */
  public setName(value: string): void { this._name = value; }

  /**
   * The scene's attached camera
   */
  public getAttachedCamera(): AbstractCamera { return this._camera; }
  /**
   * Attaches a camera which is used to render this scene
   * @param camera The camera to use in this scene
   */
  public attachCamera(camera: AbstractCamera): void {
    this._camera = camera;
  }

  /**
   * Add a child to the scene
   * @param mesh 
   */
  public addChild(mesh: Mesh): void {
    if (this._children.indexOf(mesh) === -1) {
      this._children.push(mesh);
    } else {
      Warn(`Child`, mesh, `is already registered`);
    }
  }

  /**
   * Remove a child from the scene
   * @param mesh 
   */
  public removeChild(mesh: Mesh): void {
    const childIndex = this._children.indexOf(mesh);
    if (childIndex !== -1) {
      this._children.splice(childIndex, 1);
    } else {
      Warn(`Child`, mesh, `is already registered`);
    }
  }

  /**
   * Update the scenes children
   */
  public async update(renderer: Renderer): Promise<void> {
    const children = this._children;
    // First rebuild childs if necessary
    for (let ii = 0; ii < children.length; ++ii) {
      const child = children[ii];
      child.build(renderer);
      child.update(renderer);
    };
    // Flush the renderer (E.g. flushes buffer copy queue)
    await renderer.flush();
    this.emit("update");
  }

  /**
   * Render the scenes children
   */
  public render(renderer: Renderer): void {
    const children = this._children;

    const device = renderer.getDevice();
    const camera = this.getAttachedCamera();
    const backBufferView = renderer.getSwapchain().getCurrentTexture().createView();

    // No camera attached, abort
    if (!(camera instanceof AbstractCamera)) {
      return;
    }

    camera.update();

    // Initial clear
    {
      const commandEncoder = device.createCommandEncoder({});
      const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
          attachment: backBufferView,
          loadValue: { r: 0.75, g: 0.75, b: 0.75, a: 1.0 },
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
      device.defaultQueue.submit([ commandEncoder.finish() ]);
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
    };

    device.defaultQueue.submit([ commandEncoder.finish() ]);

    this.emit("render");
  }

  /**
   * Destroy this Object
   */
  public destroy(): void {
    this._name = null;
    this._camera = null;
    this._children = null;
    this.emit("destroy");
  }

};
