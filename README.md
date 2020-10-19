# mustache-jsx

[Turn mustache templates into JSX output functions.](https://mustache-jsx.netlify.app/)

## Development

### local

Runs a watch build and dev server with REPL on [`localhost:5000`](http://localhost:5000).

```
npm run serve
```

### test

Runs all tests in `test/*/input.mustache`. Output file `test/*/output.jsx` is generated in directories that don't have it.

```
npm test
```

To update every `*.jsx` output file:

```
npm run test:update
```

### dist

Builds into `dist/`

```
npm run dist
```

## Helpers

Other than JSX pragmas (`createElement`, `Fragment`), runnable templates expect a set of helper functions in scope:

### `view(key, ...scope)`

```ts
view(key: string | null, ...scope: Object[]): any
```

Resolves a value from the view like mustache would:

- `key` may be null if referencing the full scope (like `{{.}}`)
- `...scope` is a sequence of object scopes, in order of lookup priority. The root object is used as fallback when `key` is not found in the scope (if there's no scope, it will use the root object).

### `section(value, callback)`

```ts
section(
  value: any,
  callback: (item: any, index: number) => Renderable
): Renderable[]
```

A section, like `{{#section}}`. Returns a list of `Renderables`.

- If `value` is an array, `callback()` loops over it.
- If `value` is a single value, the callback is applied on it.
- If `value` is falsy, or an empty array, the callback is not applied.

### `inverted(value)`

```ts
inverted(value: any): boolean
```

Inversion of `value`: `true` if falsy or an empty array, like inverted mustache sections as `{{^falsy}}`:

```jsx
inverted([]) && "the list is empty";
```

### `html(str)`

```ts
html(str: string | null): Renderable
```

Takes an unescaped value (like `{{& myHtml}}`) and renders it onto the DOM.
