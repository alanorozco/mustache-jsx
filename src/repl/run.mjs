import scriptTemplate from "./run.template.js";
import { replaceDoubleUnderscore } from "./replace.mjs";

const srcDocTemplate = `
  <body style="background: white">
    <script type="module">
      __script
    </script>
  </body>
`;

export function run(element, template, data) {
  const script = replaceDoubleUnderscore(scriptTemplate, {
    template,
    data: JSON.stringify(data),
  });
  const srcdoc = replaceDoubleUnderscore(srcDocTemplate, {
    script,
  });
  const iframe = document.createElement("iframe");

  iframe.srcdoc = srcdoc;
  iframe.classList.add("offscreen");

  const onLoad = () => {
    const { firstElementChild } = element;
    if (firstElementChild && firstElementChild !== iframe) {
      element.removeChild(firstElementChild);
    }
    iframe.classList.remove("offscreen");
    iframe.removeEventListener("load", onLoad);
  };

  iframe.addEventListener("load", onLoad);

  element.appendChild(iframe);
}
