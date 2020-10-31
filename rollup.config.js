import clear from "rollup-plugin-clear";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
//import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.ts",
  output: [
    {
      name: "yue",
      file: "dist/index.esm.js",
      format: "esm",
      plugins: []
    },
    {
      name: "yue",
      file: "dist/index.js",
      format: "cjs",
      plugins: []
    },
    /*{
      name: "yue",
      file: "dist/index.min.js",
      format: "cjs",
      plugins: [
        terser()
      ]
    },*/
  ],
  plugins: [
    clear({
      targets: ["dist"]
    }),
    typescript({
      rollupCommonJSResolveHack: true,
      clean: true,
      tsconfig: "./tsconfig.json",
      module: "esnext"
    }),
    commonjs({
      include: [
        "node_modules/**"
      ],
      sourceMap: false,
      transformMixedEsModules: true
    }),
    resolve({
      jsnext: true,
      browser: true
    })
  ]
}
