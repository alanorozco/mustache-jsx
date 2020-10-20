const NOT_WHITESPACE = /[^\s]/;

export default function ({ types: t }) {
  function isJsxWhitespace(node) {
    return t.isJSXText(node) && !NOT_WHITESPACE.test(node.value);
  }

  return {
    name: "jsx-excess-fragment",
    visitor: {
      JSXFragment(path, state) {
        const { children } = path.node;
        let start = 0;
        while (start < children.length && isJsxWhitespace(children[start])) {
          start++;
        }
        let end = children.length - 1;
        while (end > start && isJsxWhitespace(children[end])) {
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
