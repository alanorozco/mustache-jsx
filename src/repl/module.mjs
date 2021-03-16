const resolvers = {};
const promises = {};

self.__ = self.__ || [];
self.__.push = (id) => {
  if (id in resolvers) {
    resolvers[id]();
    delete resolvers[id];
  } else {
    promises[id] = Promise.resolve();
  }
};

for (const id of self.__) {
  self.__.push(id);
}

export function whenModule(id) {
  return (promises[id] =
    promises[id] ||
    new Promise((resolver) => {
      resolvers[id] = resolver;
    }));
}
