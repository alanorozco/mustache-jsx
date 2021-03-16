(() => {
  const section = (ref, cb) =>
    (Array.isArray(ref) ? ref : !!ref ? [ref] : []).map(cb);

  const inverted = (ref) => !ref || (Array.isArray(ref) && ref.length === 0);

  self._template = (view, __pragma, __pragmaFrag, html) => __out;
})();
