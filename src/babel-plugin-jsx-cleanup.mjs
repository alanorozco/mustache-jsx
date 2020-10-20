const NOT_WHITESPACE = /[^\s]/;

/**
 * @param babel
 */
export default function ({ types: t }) {
  function isJsxWhitespace(node) {
    return t.isJSXText(node) && !NOT_WHITESPACE.test(node.value);
  }

  function getSingleFragmentChild(path) {
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
        // Hoists single children in fragment to remove the latter when useless.
        //   <><div>hola</div></div>
        //   // to:
        //   <div>hola</div>
        const child = getSingleFragmentChild(path);
        if (child) {
          path.replaceWith(child);
        }
      },
      TemplateLiteral(path) {
        // Useless template literal `${x}` to x
        if (
          path.node.quasis.length === 2 &&
          path.node.expressions.length === 1 &&
          path.node.quasis[0].value.raw.length === 0 &&
          path.node.quasis[1].value.raw.length === 0
        ) {
          path.replaceWith(path.node.expressions[0]);
          return;
        }

        // Attribute values should be strings.
        // Handle interpolation so that section expressions are strings.
        if (!path.findParent((p) => t.isJSXAttribute(p))) {
          return;
        }
        for (let i = 0; i < path.node.expressions.length; i++) {
          const expression = path.node.expressions[i];

          // inverted(a) && b
          // // to
          // inverted(a) ? b : ''
          if (
            t.isLogicalExpression(expression) &&
            t.isCallExpression(expression.left)
          ) {
            if (t.isIdentifier(expression.left.callee, { name: "inverted" })) {
              path.node.expressions[i] = t.ConditionalExpression(
                expression.left,
                expression.right,
                t.StringLiteral("")
              );
            }
          }
          // section(a, b)
          // // to
          // section(a, b).join('')
          else if (
            t.isCallExpression(expression) &&
            t.isIdentifier(expression.callee, { name: "section" })
          ) {
            path.node.expressions[i] = t.CallExpression(
              t.MemberExpression(expression, t.Identifier("join")),
              [t.StringLiteral("")]
            );
          }
        }
      },
    },
  };
}
