import importOnMessage from "./util/import-script-on-message.mjs";

importOnMessage(
  [
    "https://unpkg.com/prettier/standalone.js",
    "https://unpkg.com/prettier/parser-babel.js",
  ],
  (code, options) =>
    prettier.format(code, {
      ...options,
      plugins: prettierPlugins,
    })
);
