import babel from "@babel/core";
import babelPluginJsxCleanup from "../src/babel-plugin-jsx-cleanup.mjs";
import fs from "fs";
import prettier from "prettier";
import Writer from "../src/mustache-jsx.mjs";
import xmldom from "xmldom";

const base = "test";

export const cat = (f) => fs.readFileSync(f).toString();

export const convert = (template) =>
  prettier.format(
    babel.transformSync(
      new Writer().render(
        template,
        /* view */ undefined,
        /* partials */ undefined,
        /* tags */ undefined,
        xmldom
      ),
      {
        plugins: ["@babel/plugin-syntax-jsx", babelPluginJsxCleanup],
      }
    ).code,
    { parser: "babel" }
  );

export function* all() {
  for (const dir of fs.readdirSync(base)) {
    const input = `${base}/${dir}/input.mustache`;
    const expectedJsx = `${base}/${dir}/output.jsx`;

    if (fs.existsSync(input)) {
      yield [dir, input, expectedJsx];
    }
  }
}

export function update(create = false) {
  let wrote = 0;
  for (const [name, input, expectedJsx] of all()) {
    const exists = fs.existsSync(expectedJsx);
    if (create || !exists) {
      const write = convert(cat(input));
      if (!exists || cat(expectedJsx) !== write) {
        fs.writeFileSync(expectedJsx, write);
        console.log("wrote", expectedJsx);
        wrote++;
      }
    }
  }
  console.warn(`  ${wrote} tests updated`);
}

if (process.argv.includes("--update")) {
  update(/* create */ true);
}
