const NOT_WHITESPACE = /[^\s]/;

/**
 * Hoists single children in fragment to remove the latter when useless.
 *
 *   // from:
 *   <><div>hola</div></div>
 *
 *   // to:
 *   <div>hola</div>
 * @param babel
 */
export default function ({ types: t }) {
  function isJsxWhitespace(node) {
    return t.isJSXText(node) && !NOT_WHITESPACE.test(node.value);
  }

  function getSingleChild(path) {
    const { children } = path.node;
    const { length } = children;
    let start, end;
    for (
      start = 0;
      start < length && isJsxWhitespace(children[start]);
      start++
    );
    for (
      end = length - 1;
      end > start && isJsxWhitespace(children[end]);
      end--
    );
    if (start !== end) {
      return;
    }
    const child = children[start];
    if (!path.parent.type.startsWith("JSX")) {
      if (t.isJSXText(child)) {
        return t.StringLiteral(child.value);
      }
      if (t.isJSXExpressionContainer(child)) {
        return child.expression;
      }
    }
    return child;
  }

  return {
    name: "jsx-cleanup",
    visitor: {
      JSXFragment(path) {
        const child = getSingleChild(path);
        if (child) {
          path.replaceWith(child);
        }
      },
      TemplateLiteral(path) {
        // Useless template literal `${x}` to x
        if (
          path.node.quasis.length !== 2 ||
          path.node.expressions.length !== 1
        ) {
          return;
        }
        if (
          path.node.quasis[0].value.raw.length > 0 ||
          path.node.quasis[1].value.raw.length > 0
        ) {
          return;
        }
        path.replaceWith(path.node.expressions[0]);
      },
    },
  };
}
