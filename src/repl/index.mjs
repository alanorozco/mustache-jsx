import DEFAULT_TEMPLATE from "./default/template.mustache";
import DEFAULT_DATA from "./default/data.json";
import Writer from "../mustache-jsx.mjs";
import babelPluginJsxCleanup from "../babel-plugin-jsx-cleanup.mjs";
import { whenModule } from "./module.mjs";
import { run } from "./run.mjs";

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
    refresh: doc.refresh.bind(doc),
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

const [template, output, dataInput] = Array.from(
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

function updateCode() {
  let code = defaultWriter.render(template.value);

  code = transformAsync(code, isChecked("transpile"));
  code = code.then((code) => formatAsync(code, { parser: "babel" }));

  return code.then((code) => {
    output.value = code;
  });
}

template.value = DEFAULT_TEMPLATE;
template.addEventListener("keyup", update);

function updateRunner() {
  const displayed = checkbox("run").checked;
  toggle(document.getElementById("run-panel"), displayed);
  if (!displayed) {
    return;
  }
  const showData = checkbox("show-data").checked;
  toggle(document.getElementById("run-data"), showData);
  if (showData) {
    dataInput.refresh();
  }
  const data = JSON.parse(dataInput.value);
  return transformAsync(
    defaultWriter.render(template.value),
    /* transpile */ true
  ).then((code) => {
    run(document.getElementById("run-eval"), code, data);
  });
}

dataInput.value = JSON.stringify(
  DEFAULT_DATA,
  /* replacer */ undefined,
  /* space */ 2
);
dataInput.addEventListener("keyup", update);

function toggle(element, visible) {
  if (visible) {
    element.removeAttribute("hidden");
  } else {
    element.setAttribute("hidden", "");
  }
}

function update() {
  try {
    Promise.all([updateCode(), updateRunner()]).then(
      () => showError(null),
      (e) => showError(e)
    );
  } catch (e) {
    showError(e);
  }
}

function showError(e) {
  const error = document.querySelector(".error");
  if (!e) {
    error.setAttribute("hidden", "");
    error.textContent = "";
    return;
  }
  error.removeAttribute("hidden");
  error.textContent = e.message;
  console.error(e);
}

Array.from(document.querySelectorAll("[type=checkbox]")).forEach((e) =>
  e.addEventListener("change", update)
);

update();
