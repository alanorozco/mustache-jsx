let id = 0;
const resolvers = {};

function resultFromWorker(script) {
  const worker = new Worker(script);

  worker.addEventListener("message", ({ data }) => {
    const { id, code } = data;
    if (resolvers[id]) {
      resolvers[id](code);
    }
  });

  return (code, options = {}) =>
    new Promise((resolve) => {
      resolvers[id] = resolve;
      worker.postMessage({ ...options, code, id });
      id++;
    });
}

const babelTransform = resultFromWorker("./worker-babel.js");
const prettierFormat = resultFromWorker("./worker-prettier.js");

export function transform(code, options = {}) {
  const { transpile = false, format = false } = options;
  code = babelTransform(code, { transpile });
  if (format) {
    return code.then((code) => prettierFormat(code, { parser: "babel" }));
  }
  return code;
}
