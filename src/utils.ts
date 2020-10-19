import EventEmitter from "eventemitter3";

export {EventEmitter};

let glslangModule: any = null;
/**
 * Load the glslang module
 */
export async function LoadGLSLang() {
  if (glslangModule !== null) return glslangModule;
  // Evil hack because webpack is a son of a bitch
  const module = await (window["eval"])(`import("https://unpkg.com/@webgpu/glslang@0.0.15/dist/web-devel/glslang.js")`);
  glslangModule = await module.default();
  return glslangModule;
}

/**
 * Compiles the provided GLSL code into SPIR-V
 * @param glsl - The GLSL string to compile
 * @param type - The shader type of the provided GLSL code
 */
export function CompileGLSL(glsl: string, type: string): Uint32Array {
  return glslangModule.compileGLSL(glsl, type);
}

/**
 * Fetches a text from the provided path
 * @param path - The path to fetch the text from
 */
export function FetchText(path: string): Promise<string> {
  return new Promise(resolve => {
    fetch(path).then(resp => resp.text().then(resolve));
  });
}

/**
 * Log to the console
 * @param args - The arguments to log
 */
export function Log(...args: any[]) {
  // eslint-disable-next-line no-console
  console.log(...args);
}

/**
 * Log a warning to the console
 * @param args - The arguments to log
 */
export function Warn(...args: any[]) {
  // eslint-disable-next-line no-console
  console.warn(...args);
}

/**
 * Log an error to the console
 * @param args - The arguments to log
 */
export function Error(...args: any[]) {
  // eslint-disable-next-line no-console
  console.error(...args);
}

/**
 * Throws an unrachable error
 */
export function Unreachable(): void {
  throw new ReferenceError(`Unreachable code hit`);
}

/**
 * Returns the hash of the provided string
 * @param str - The string to hash
 */
export function GetStringHash(str: string): number {
  let hash = 0;
  for (let ii = 0; ii < str.length; ++ii) {
    hash = ((hash << 5) - hash + str.charCodeAt(ii)) << 0;
  }
  return hash;
}

/**
 * Returns a high-resolution timestamp
 */
export function GetTimeStamp(): number {
  // node environment
  /*if (typeof process !== "undefined" && typeof window === "undefined") {
    return require("perf_hooks").performance.now();
  }*/
  // browser environment
  return (performance as any).now();
}

/**
 * Fixates a number at the provided range
 * @param value - The value to fixate
 * @param range - The range to fixate
 */
export function FixateToZero(value: number, range: number): number {
  if (value > 0 && value <= range) return 0.0;
  if (value < 0 && value >= -range) return 0.0;
  return value;
}

/**
 * Clamps a value between the provided min and max range
 * @param value - The value to clamp
 * @param min - The minimum range
 * @param max - The maximum range
 */
export function Clamp(value: number, min: number, max: number): number {
  return Math.max(Math.min(max, value), min);
}
