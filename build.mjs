import download from "download";
import esbuild from "esbuild";
import fs from "fs-extra";
import log from "fancy-log";
import meow from "meow";
import tempy from "tempy";
import { execSync } from "child_process";
import { red, cyan } from "kleur/colors";

const dist = "dist";

const envelope = (id, src) =>
  `${src}\n(self.__ = self.__ || []).push("${id}");`;

const nsPerSec = Math.pow(1000, 3);

function formatNanoSeconds(time) {
  const units = [
    ["ns", 1],
    ["μs", 1000],
    ["ms", 1000 * 1000],
    ["s", nsPerSec],
    ["m", 60 * nsPerSec],
  ];
  for (let i = units.length - 1; i >= 0; i--) {
    const [unit, size] = units[i];
    if (time >= size || i === 0) {
      return `${(time / size).toFixed(2)} ${unit}`;
    }
  }
}

async function step(pastSentence, activity) {
  const start = process.hrtime();
  const result = await activity();
  const [totalSeconds, totalNanoSecondsDiff] = process.hrtime(start);
  const totalNanoSeconds = totalSeconds * nsPerSec + totalNanoSecondsDiff;
  log(cyan(pastSentence), `(${formatNanoSeconds(totalNanoSeconds)})`);
  return result;
}

async function generateUnpkgBundles(flags) {
  const unpkgBundles = {
    "codemirror.css": [
      "codemirror/lib/codemirror.css",
      "codemirror/theme/paraiso-dark.css",
    ],
    "prettier.js": ["prettier/standalone.js", "prettier/parser-babel.js"],
    "babel.js": ["@babel/standalone/babel.min.js"],
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
        logLevel: "error",
        bundle: false,
        minify: flags.minify,
      });
    }
  });
}

async function copyAssets() {
  await step("copied assets", () =>
    execSync(`rsync -av --exclude=*.mjs src/repl/ ${dist}`)
  );
}

async function build(flags) {
  copyAssets();

  step("built unpkg bundles", () => generateUnpkgBundles(flags));

  await step("built", () =>
    esbuild.build({
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
          if (error) {
            log(red("error"));
          }
          if (result) {
            log(cyan("built"));
            copyAssets();
          }
        },
      },
    })
  );
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
