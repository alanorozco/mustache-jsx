let id = 0;
const resolvers = {};

export function requestFromWorkerFactory(script) {
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

export function respondOnMessage(callback) {
  self.onmessage = (e) => {
    const { id, code, ...options } = e.data;
    const result = callback(code, options);

    if (result) {
      self.postMessage({
        id,
        code: result,
      });
    }
  };
}
