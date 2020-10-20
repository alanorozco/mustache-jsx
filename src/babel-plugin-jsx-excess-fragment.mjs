export default function (babel) {
  const { types: t } = babel;

  return {
    name: "jsx-excess-fragment",
    visitor: {
      JSXFragment(path, state) {
        const { children } = path.node;
        let start = 0,
          end;
        while (
          start < children.length &&
          t.isJSXText(children[start]) &&
          /^[\s\n]+$/im.test(children[start].value)
        ) {
          start++;
        }
        end = children.length - 1;
        while (
          end > start &&
          t.isJSXText(children[end]) &&
          /^[\s\n]+$/im.test(children[end].value)
        ) {
          end--;
        }
        if (start !== end) {
          return;
        }
        const child = children[start];
        if (t.isLogicalExpression(path.parent) && t.isJSXText(child)) {
          path.replaceWith(t.StringLiteral(child.value));
          return;
        }
        path.replaceWith(child);
      },
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
        if (args.length === 2) {
          path.replaceWith(t.BooleanLiteral(false));
          return;
        }
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
