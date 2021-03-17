import download from "download";
import esbuild from "esbuild";
import { execSync } from "child_process";
import fs from "fs-extra";
import meow from "meow";
import tempy from "tempy";

const dist = "dist";

const envelope = (id, src) =>
  `${src}\n(self.__ = self.__ || []).push("${id}");`;

async function generateUnpkgBundles(flags) {
  const unpkgBundles = {
    "codemirror.css": [
      "codemirror/lib/codemirror.css",
      "codemirror/theme/paraiso-dark.css",
    ],
    "prettier.js": ["prettier/standalone.js", "prettier/parser-babel.js"],
    "babel.js": ["@babel/standalone/babel.min.js"],
    "terser.js": ["terser/dist/bundle.min.js"],
  };
  await tempy.directory.task(async (dir) => {
    for (const [filename, srcs] of Object.entries(unpkgBundles)) {
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
      const outfile = `${dist}/${filename}`;

      fs.writeFileSync(infile, content);

      await esbuild.build({
        entryPoints: [infile],
        outfile,
        bundle: false,
        minify: flags.minify,
      });
    }
  });
}

const copyAssets = () =>
  execSync(`rsync -av --exclude=*.mjs src/repl/ ${dist}`);

async function build(flags) {
  copyAssets();

  await generateUnpkgBundles(flags);

  await esbuild.build({
    entryPoints: ["src/repl/index.mjs"],
    outfile: `${dist}/index.js`,
    bundle: true,
    minify: flags.minify,
    loader: {
      ".template.mustache": "text",
      ".template.js": "text",
    },
    watch: flags.watch && {
      onRebuild(error, result) {
        copyAssets();
      },
    },
  });
}

const { flags } = meow(
  `
  Usage:
    npm run build -- [--watch] [--minify]
`,
  {
    flags: {
      minify: { type: "boolean" },
      watch: { type: "boolean" },
    },
  }
);

build(flags);
