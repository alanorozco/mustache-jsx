import babelPluginJsxCleanup from "../babel-plugin-jsx-cleanup.mjs";

importScripts(
  "https://unpkg.com/prettier/standalone.js",
  "https://unpkg.com/prettier/parser-babel.js",
  "https://unpkg.com/@babel/standalone/babel.min.js"
);

const jsx = {
  pragma: "h",
  pragmaFrag: "Fragment",
};

function transformBabel(code, transpile) {
  return Babel.transform(code, {
    presets: [...(transpile ? [["react", jsx]] : [])],
    plugins: ["syntax-jsx", babelPluginJsxCleanup],
  }).code;
}

function formatPrettier(code, options) {
  return prettier.format(code, {
    ...options,
    plugins: prettierPlugins,
  });
}

self.onmessage = (e) => {
  let { id, code, transpile = false, format = false } = e.data;

  code = transformBabel(code, transpile);

  if (format) {
    code = formatPrettier(code, { parser: "babel" });
  }

  self.postMessage({ id, code });
};
