import {
  h,
  render,
  Fragment,
} from "https://cdn.jsdelivr.net/npm/preact/dist/preact.mjs";

function html(str) {
  // TODO
  // return { dangerouslySetInnerHTML: { __html: str } };
}

function view(key) {
  for (let i = 1; i <= arguments.length; i++) {
    const scope = i === arguments.length ? this : arguments[1];
    if (key === null) {
      return scope;
    }
    if (scope.hasOwnProperty(key)) {
      return scope[key];
    }
  }
  // TODO: Confirm if this is correct for undefined keys (empty in JSX result)
  return false;
}

export function renderTemplate(template, data, container) {
  render(template(view.bind(data), h, Fragment, html), container);
}
