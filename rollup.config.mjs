import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

export default [
    {
        input: "./src/index.ts",
        output: [
            {
                file: "./dist/esm/index.js",
                format: "esm",
            },
        ],
        plugins: [
            resolve(),
            commonjs(),
            typescript({
                tsconfig: "./tsconfig.json",
                declaration: true,
                declarationDir: "./dist/esm",
            }),

        ],
    },
    {
        input: "./dist/esm/index.d.ts",
        output: [{ file: "./dist/index.d.ts", format: "esm" }],
        plugins: [dts()],
    },

];