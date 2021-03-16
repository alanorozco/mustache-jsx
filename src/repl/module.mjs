const resolvers = {};
const promises = {};

function moduleReady(id) {
  if (id in resolvers) {
    resolvers[id]();
  }
}

self.__ = self.__ || [];
self.__.push = (id) => {
  Array.prototype.push.call(self.__, id);
  moduleReady(id);
};

for (const id of self.__) {
  moduleReady(id);
}

export function whenModule(id) {
  return (promises[id] =
    promises[id] ||
    (self.__.includes(id)
      ? Promise.resolve()
      : new Promise((resolver) => {
          resolvers[id] = resolver;
        })));
}
