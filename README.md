# mustache-jsx

[Turn mustache templates into JSX output functions.](https://mustache-jsx.netlify.app/)

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
