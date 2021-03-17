import DEFAULT_TEMPLATE from "./default.template.mustache";
import Writer from "../mustache-jsx.mjs";
import babelPluginJsxCleanup from "../babel-plugin-jsx-cleanup.mjs";
import { whenModule } from "./module.mjs";

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

const defaultWriter = new Writer();

const [template, output] = Array.from(
  document.querySelectorAll("textarea")
).map((element) =>
  upgradeTextarea(element, {
    readOnly: element.hasAttribute("readonly"),
    ...element.dataset,
  })
);

const checkbox = (name) => document.querySelector(`input[name=${name}]`);
const isChecked = (name) => checkbox(name).checked;

function transformAsync(code, transpile) {
  return whenModule("babel").then(
    () =>
      Babel.transform(code, {
        presets: [...(transpile ? [["react", jsx]] : [])],
        plugins: ["syntax-jsx", babelPluginJsxCleanup],
      }).code
  );
}

function formatAsync(code, options) {
  return whenModule("prettier").then(() =>
    prettier.format(code, {
      ...options,
      plugins: prettierPlugins,
    })
  );
}

function update() {
  try {
    let code = defaultWriter.render(template.value);

    code = transformAsync(code, isChecked("transpile"));
    code = code.then((code) => formatAsync(code, { parser: "babel" }));

    code.then((code) => {
      output.value = code;

      error.setAttribute("hidden", "");
      error.textContent = "";
    });
  } catch (e) {
    showError(e);
  }
}

function showError(e) {
  const error = document.querySelector(".error");
  error.removeAttribute("hidden");
  error.textContent = e.message;
  console.error(e);
}

template.value = DEFAULT_TEMPLATE;
template.addEventListener("keyup", update);

function onCheckboxChange({ currentTarget }) {
  // mangle requires transpile
  if (currentTarget.name === "mangle" && currentTarget.checked) {
    checkbox("transpile").checked = true;
  }
  if (currentTarget.name === "transpile" && !currentTarget.checked) {
    checkbox("mangle").checked = false;
  }
  update();
}

Array.from(document.querySelectorAll("[type=checkbox]")).forEach((e) =>
  e.addEventListener("change", onCheckboxChange)
);

update();
