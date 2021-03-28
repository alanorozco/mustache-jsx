import babelPluginJsxCleanup from "../babel-plugin-jsx-cleanup.mjs";
import { whenModule } from "./module.mjs";

const jsx = {
  pragma: "h",
  pragmaFrag: "Fragment",
};

function transformAsync(code, transpile) {
  return whenModule("babel").then(() => {
    const { Babel, babelPresetReact, babelPluginSyntaxJsx } = self.__babel;
    return Babel.transform(code, {
      presets: [...(transpile ? [[babelPresetReact, jsx]] : [])],
      plugins: [babelPluginSyntaxJsx, babelPluginJsxCleanup],
    }).code;
  });
}

function formatAsync(code, options) {
  return whenModule("prettier").then(() =>
    prettier.format(code, {
      ...options,
      plugins: prettierPlugins,
    })
  );
}

importScripts("prettier.js", "babel.js");

self.onmessage = (e) => {
  let { id, code, transpile = false, format = false } = e.data;

  let codePromise = transformAsync(code, transpile);

  if (format) {
    codePromise = codePromise.then((code) =>
      formatAsync(code, { parser: "babel" })
    );
  }

  codePromise.then((code) => {
    self.postMessage({ id, code });
  });
};
