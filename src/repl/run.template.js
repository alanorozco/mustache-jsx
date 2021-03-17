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

const section = (ref, cb) =>
  (Array.isArray(ref) ? (ref.length > 0 ? ref : []) : ref ? [ref] : []).map(cb);

const inverted = (ref) => !ref || (Array.isArray(ref) && ref.length === 0);

const template = (view, h, Fragment, html) => __template;
render(template(view.bind(__data), h, Fragment, html), document.body);
