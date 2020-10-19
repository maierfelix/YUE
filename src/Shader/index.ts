import {CompileGLSL, EventEmitter} from "../utils";
import {SHADER_STAGE} from "../constants";

type ShaderCodeType = (
  Uint32Array | // SPIRV
  string        // GLSL
);

export interface IShaderOptions {
  name?: string;
  stage: SHADER_STAGE;
  code: ShaderCodeType;
}

export const SHADER_DEFAULT_OPTIONS: IShaderOptions = {
  name: null,
  stage: SHADER_STAGE.NONE,
  code: null
};

function ToShaderStageString(stage: SHADER_STAGE): string {
  switch (stage) {
    case SHADER_STAGE.NONE:
      throw new Error(`'SHADER_STAGE.NONE' is not a valid shader stage`);
    case SHADER_STAGE.VERTEX:
      return "vertex";
    case SHADER_STAGE.FRAGMENT:
      return "fragment";
  }
}

export class Shader extends EventEmitter {

  private _name: string = null;
  private _stage: SHADER_STAGE = SHADER_STAGE.NONE;
  private _code: ShaderCodeType = null;

  /**
   * @param options - Create options
   */
  public constructor(options?: IShaderOptions) {
    super();
    // Normalize options
    options = Object.assign({}, SHADER_DEFAULT_OPTIONS, options);
    // Process options
    this.setName(options.name);
    this._stage = options.stage;
    // In case GLSL was passed, compile it into SPIRV
    if (typeof options.code === "string") {
      this._code = CompileGLSL(options.code, ToShaderStageString(options.stage));
    } else {
      this._code = options.code;
    }
  }

  /**
   * The shader name
   */
  public getName(): string { return this._name; }

  /**
   * Update the shader name
   * @param value - The new shader name
   */
  public setName(value: string): void { this._name = value; }

  /**
   * Returns the shader's GLSL or SPIRV code
   */
  public getCode(): ShaderCodeType { return this._code; }

  /**
   * Returns the shader's stage
   */
  public getStage(): SHADER_STAGE { return this._stage; }

  /**
   * Destroy this Object
   */
  public destroy(): void {
    this._name = null;
    this._code = null;
    this.emit("destroy");
  }

}
