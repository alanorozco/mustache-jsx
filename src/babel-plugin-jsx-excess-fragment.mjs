export default function (babel) {
  const { types: t } = babel;

  return {
    name: "jsx-excess-fragment",
    visitor: {
      CallExpression(path, state) {
        if (
          !t.isIdentifier(path.node.callee, {
            name: state.opts.pragma,
          })
        ) {
          return;
        }
        if (
          !t.isIdentifier(path.node.arguments[0], {
            name: state.opts.pragmaFrag,
          })
        ) {
          return;
        }
        const args = path.node.arguments.slice(2);
        while (t.isStringLiteral(args[0]) && /^[\s\S\t\n]*$/.test(args[0])) {
          args.shift();
        }
        if (args.length !== 1) {
          return;
        }
        path.replaceWith(args[0]);
      },
    },
  };
}
