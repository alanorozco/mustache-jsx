import Writer from "../mustache-jsx.mjs";
import babelPluginJsxExcessFragment from "../babel-plugin-jsx-excess-fragment.mjs";

CodeMirror.defineMode("mustache", function (config, parserConfig) {
  var mustacheOverlay = {
    token: function (stream, state) {
      var ch;
      if (stream.match("{{")) {
        while ((ch = stream.next()) != null)
          if (ch == "}" && stream.next() == "}") {
            stream.eat("}");
            return "mustache";
          }
      }
      while (stream.next() != null && !stream.match("{{", false)) {}
      return null;
    },
  };
  return CodeMirror.overlayMode(
    CodeMirror.getMode(config, parserConfig.backdrop || "text/html"),
    mustacheOverlay
  );
});

function upgradeTextarea(element, options) {
  const doc = CodeMirror.fromTextArea(element, options);
  return {
    get value() {
      return doc.getValue();
    },
    set value(value) {
      doc.setValue(value);
    },
    addEventListener: doc.on.bind(doc),
    removeEventListener: doc.off.bind(doc),
    classList: element.parentElement.classList,
  };
}

const jsx = {
  pragma: "h",
  pragmaFrag: "Fragment",
};

const prettierConfig = {
  parser: "babel",
  plugins: prettierPlugins,
  printWidth: 60,
};

const envelope = (out) =>
  `(() => {
  const section = (ref, cb) => (Array.isArray(ref) ?
    ref :
    (!!ref ? [ref] : [])
  ).map(cb);

  const inverted = ref => (!ref || (Array.isArray(ref) && ref.length === 0));

  self._template = (view, ${jsx.pragma}, ${jsx.pragmaFrag}, html) => (${out})
})()`;

const defaultWriter = new Writer();

const [template, output] = Array.from(
  document.querySelectorAll("textarea")
).map((element) =>
  upgradeTextarea(element, {
    readOnly: element.hasAttribute("readonly"),
    ...element.dataset,
  })
);

const isChecked = (name) => document.querySelector(`[name=${name}]`).checked;

function update() {
  const error = document.querySelector(".error");
  try {
    const transpile = isChecked("transpile");
    const cleanupFragments = isChecked("cleanup-fragments");
    const mangle = isChecked("mangle");

    const rendered = envelope(defaultWriter.render(template.value));

    let { code } = Babel.transform(rendered, {
      presets: [...(transpile ? [["react", jsx]] : [])],
      plugins: [
        "syntax-jsx",
        ...(cleanupFragments ? [babelPluginJsxExcessFragment] : []),
      ],
    });

    if (transpile && mangle) {
      code = Terser.minify(code).then(({ code }) => code);
    }

    Promise.resolve(code).then((code) => {
      output.value = prettier.format(code, prettierConfig);

      error.setAttribute("hidden", "");
      error.textContent = "";
    });
  } catch (e) {
    error.removeAttribute("hidden");
    error.textContent = e.message;
    console.error(e);
  }
}

template.value = DEFAULT_TEMPLATE;
template.addEventListener("keyup", update);

Array.from(document.querySelectorAll("[type=checkbox]")).forEach((e) =>
  e.addEventListener("change", update)
);

update();
