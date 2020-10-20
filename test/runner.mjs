import fs from "fs";
import prettier from "prettier";
import Writer from "../src/mustache-jsx.mjs";
import xmldom from "xmldom";

const base = "test";

export const cat = (f) => fs.readFileSync(f).toString();

export const convert = (template) =>
  prettier.format(
    new Writer().render(
      template,
      /* view */ undefined,
      /* partials */ undefined,
      /* tags */ undefined,
      xmldom
    ),
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
  let created = 0;
  for (const [name, input, expectedJsx] of all()) {
    if (create || !fs.existsSync(expectedJsx)) {
      fs.writeFileSync(expectedJsx, convert(cat(input)));
      console.log("created", expectedJsx);
      created++;
    }
  }
  console.warn(`  ${created} tests updated`);
}

if (process.argv.includes("--update")) {
  update(/* create */ true);
}
