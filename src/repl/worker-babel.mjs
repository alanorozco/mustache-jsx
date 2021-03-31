import babelPluginJsxCleanup from "../babel-plugin-jsx-cleanup.mjs";
import importOnMessage from "./util/import-script-on-message.mjs";

const jsx = {
  pragma: "h",
  pragmaFrag: "Fragment",
};

importOnMessage(
  ["https://unpkg.com/@babel/standalone/babel.min.js"],
  (code, { transpile = false }) =>
    Babel.transform(code, {
      presets: [...(transpile ? [["react", jsx]] : [])],
      plugins: ["syntax-jsx", babelPluginJsxCleanup],
    }).code
);
