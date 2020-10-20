const NOT_WHITESPACE = /[^\s]/;

export default function ({ types: t }) {
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
          !NOT_WHITESPACE.test(children[start].value)
        ) {
          start++;
        }
        end = children.length - 1;
        while (
          end > start &&
          t.isJSXText(children[end]) &&
          !NOT_WHITESPACE.test(children[end].value)
        ) {
          end--;
        }
        if (start !== end) {
          return;
        }
        let child = children[start];
        if (!path.parent.type.startsWith("JSX")) {
          if (t.isJSXText(child)) {
            child = t.StringLiteral(child.value);
          }
          if (t.isJSXExpressionContainer(child)) {
            child = child.expression;
          }
        }
        path.replaceWith(child);
      },
    },
  };
}
