export default function (scripts, callback) {
  let imported = false;

  self.onmessage = (e) => {
    if (!imported) {
      imported = true;
      importScripts(...scripts);
    }

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
