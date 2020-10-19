import Writer from "./mustache-jsx.mjs";
import babelPluginJsxExcessFragment from "./babel-plugin-jsx-excess-fragment.mjs";

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
  `
    const section = (ref, cb) => (Array.isArray(ref) ?
      (ref.length > 0 ? ref : []) :
      (ref ? [ref] : [])
    ).map(cb);

    const inverted = ref => (!ref || (Array.isArray(ref) && ref.length === 0));

    self._template = (view, ${jsx.pragma}, ${jsx.pragmaFrag}, html) => (${out})
    `;

const defaultWriter = new Writer();

const [template, output] = document.querySelectorAll("textarea");

const leaveExcessFragments = () =>
  document.querySelector("[name=excess-fragment]").checked;

const toMustacheXhtml = (html) => {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const serialized = new XMLSerializer().serializeToString(parsed);
  return (
    /<body>([\s\S]*)<\/body>/im
      .exec(serialized)[1]
      // ugly and probably unsafe
      .replace(/="{{([^"]*)}}"/gim, (_, content) => `={{${content}}}`)
  );
};

function update() {
  try {
    const rendered = envelope(
      defaultWriter.render(toMustacheXhtml(template.value))
    );
    const code =
      document.querySelector("select").value === "javascript"
        ? Babel.transform(rendered, {
            presets: ["es2016", ["react", jsx]],
            plugins: leaveExcessFragments()
              ? null
              : [[babelPluginJsxExcessFragment, jsx]],
          }).code
        : rendered;
    output.classList.remove("error");
    output.textContent = prettier.format(code, prettierConfig);
  } catch (e) {
    output.classList.add("error");
    output.textContent = e.message;
    console.error(e);
  }
}

template.value = DEFAULT_TEMPLATE;

template.addEventListener("keyup", update);
document
  .querySelector("select")
  .addEventListener("change", ({ currentTarget }) => {
    update();
    Array.from(document.querySelectorAll("[data-only]")).forEach((element) => {
      if (currentTarget.value !== element.dataset.only) {
        element.setAttribute("hidden", "");
      } else {
        element.removeAttribute("hidden");
      }
    });
  });
Array.from(document.querySelectorAll("[type=checkbox]")).forEach((e) =>
  e.addEventListener("change", update)
);

update();
