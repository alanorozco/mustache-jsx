import { respondOnMessage } from "./util/worker.mjs";

importScripts("https://unpkg.com/prettier/standalone.js");
importScripts("https://unpkg.com/prettier/parser-babel.js");

respondOnMessage((code, options) =>
  prettier.format(code, {
    ...options,
    plugins: prettierPlugins,
  })
);
