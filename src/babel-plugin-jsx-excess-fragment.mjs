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
        const { arguments: args } = path.node;
        let i = 2;
        while (
          t.isStringLiteral(args[i]) &&
          /^[\s\t\n]*$/im.test(args[i].value)
        ) {
          i++;
        }
        if (i === args.length - 1) {
          path.replaceWith(args[i]);
        }
      },
    },
  };
}
