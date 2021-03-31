import babelPluginJsxCleanup from "../babel-plugin-jsx-cleanup.mjs";
import { respondOnMessage } from "./util/worker.mjs";

importScripts("https://unpkg.com/@babel/standalone/babel.min.js");

const jsx = {
  pragma: "h",
  pragmaFrag: "Fragment",
};

respondOnMessage(
  (code, { transpile = false }) =>
    Babel.transform(code, {
      presets: [...(transpile ? [["react", jsx]] : [])],
      plugins: ["syntax-jsx", babelPluginJsxCleanup],
    }).code
);
