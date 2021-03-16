import download from "download";
import esbuild from "esbuild";
import fs from "fs-extra";
import tempy from "tempy";

const bundles = {
  "codemirror.css": [
    "codemirror/lib/codemirror.css",
    "codemirror/theme/paraiso-dark.css",
  ],
  "prettier.js": ["prettier/standalone.js", "prettier/parser-babel.js"],
  "babel.js": ["@babel/standalone/babel.min.js"],
  "terser.js": ["terser/dist/bundle.min.js"],
};

const envelope = (id, src) =>
  `${src}\n(self.__ = self.__ || []).push("${id}");`;

tempy.directory.task(async (dir) => {
  for (const [filename, srcs] of Object.entries(bundles)) {
    const [id, type] = filename.split(".");

    let content = (
      await Promise.all(
        srcs.map(async (src) => {
          const url = `https://unpkg.com/${src}`;
          try {
            return await download(url);
          } catch (e) {
            e.message = `[${url}]: ${e.message}`;
            throw e;
          }
        })
      )
    ).join("\n");

    if (type === "js") {
      content = envelope(id, content);
    }

    const infile = `${dir}/${filename}`;
    const outfile = `dist/${filename}`;

    fs.writeFileSync(infile, content);

    await esbuild.build({
      entryPoints: [infile],
      outfile,
      bundle: false,
      minify: true,
    });
  }
});
