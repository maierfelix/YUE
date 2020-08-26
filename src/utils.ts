import EventEmitter from "eventemitter3";

import * as glslangModule from "@webgpu/glslang";

let glslangModuleCache: any = null;
export function CompileGLSL(glsl: string, type: string): Uint32Array {
  if (glslangModuleCache === null) glslangModuleCache = glslangModule.default();
  return glslangModuleCache.compileGLSL(glsl, type);
};

export { EventEmitter };

export function FixateToZero(value: number, range: number): number {
  if (value > 0 && value <= range) return 0.0;
  if (value < 0 && value >= -range) return 0.0;
  return value;
};

export function Clamp(value: number, min: number, max: number): number {
  return Math.max(Math.min(max, value), min);
};

export function FetchText(path: string): Promise<string> {
  return new Promise(resolve => {
    fetch(path).then(resp => resp.text().then(resolve));
  });
};

export function Log(...args: any[]) {
  console.log(...args);
};

export function Warn(...args: any[]) {
  console.warn(...args);
};

export function Error(...args: any[]) {
  console.error(...args);
};

export function GetStringHash(str: string): number {
  let hash = 0;
  for (let ii = 0; ii < str.length; ++ii) {
    hash = ((hash << 5) - hash + str.charCodeAt(ii)) << 0;
  };
  return hash;
};
