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
  element.replaceChild(iframe, element.firstElementChild);
}
