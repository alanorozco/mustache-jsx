import fs from "fs";
import Writer from "./src/mustache-jsx.mjs";
import test from "ava";
import prettier from "prettier";

const base = "test";

const cat = (f) => fs.readFileSync(f).toString();

const convert = (template) =>
  prettier.format(new Writer().render(template), { parser: "babel" });

function* all() {
  for (const dir of fs.readdirSync(base)) {
    const input = `${base}/${dir}/input.mustache`;
    const expectedJsx = `${base}/${dir}/output.jsx`;

    if (fs.existsSync(input)) {
      yield [dir, input, expectedJsx];
    }
  }
}

let created = 0;
for (const [name, input, expectedJsx] of all()) {
  if (!fs.existsSync(expectedJsx)) {
    fs.writeFileSync(expectedJsx, convert(cat(input)));
    console.log("created", expectedJsx);
    created++;
  }
}

console.warn(`  ${created} tests updated`);

for (const [name, input, expectedJsx] of all()) {
  test(name, async (t) => {
    const outputJsx = convert(cat(input));
    t.is(outputJsx, cat(expectedJsx));
  });
}
