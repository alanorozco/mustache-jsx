import { requestFromWorkerFactory } from "./util/worker.mjs";

const babelTransform = requestFromWorkerFactory("./worker-babel.js");
const prettierFormat = requestFromWorkerFactory("./worker-prettier.js");

export function transform(code, options = {}) {
  const { transpile = false, format = false } = options;
  code = babelTransform(code, { transpile });
  if (format) {
    return code.then((code) => prettierFormat(code, { parser: "babel" }));
  }
  return code;
}
