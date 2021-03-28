const worker = new Worker("/worker.js");

let id = 0;
const resolvers = {};

export function transform(code, options = {}) {
  return new Promise((resolve) => {
    resolvers[id] = resolve;
    worker.postMessage({ ...options, code, id });
    id++;
  });
}

worker.addEventListener("message", ({ data }) => {
  const { id, code } = data;
  if (resolvers[id]) {
    resolvers[id](code);
  }
});
