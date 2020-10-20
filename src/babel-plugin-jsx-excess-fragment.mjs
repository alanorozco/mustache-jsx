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
        if (
          (t.isLogicalExpression(path.parent) ||
            t.isExpressionStatement(path.parent)) &&
          t.isJSXText(child)
        ) {
          path.replaceWith(t.StringLiteral(child.value));
          return;
        }
        if (t.isJSXExpressionContainer(child)) {
          path.replaceWith(child.expression);
          return;
        }
        path.replaceWith(child);
      },
    },
  };
}
