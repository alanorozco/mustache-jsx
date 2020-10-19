import test from "ava";
import { cat, convert, all, update } from "./test/runner.mjs";

update();

for (const [name, input, expectedJsx] of all()) {
  test(name, async (t) => {
    const outputJsx = convert(cat(input));
    t.is(outputJsx, cat(expectedJsx));
  });
}
