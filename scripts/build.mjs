import log from "fancy-log";
import esbuild from "esbuild";
import meow from "meow";
import { execSync } from "child_process";
import { red, cyan } from "kleur/colors";

const dist = "dist";

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

async function copyAssets() {
  await step("copied assets", () =>
    execSync(`rsync -av --exclude=*.mjs src/repl/ ${dist}`)
  );
}

async function build(flags) {
  copyAssets();

  await step("built", () =>
    esbuild.build({
      entryPoints: [
        "src/repl/index.mjs",
        "src/repl/worker-babel.mjs",
        "src/repl/worker-prettier.mjs",
      ],
      outdir: dist,
      bundle: true,
      minify: flags.minify,
      loader: {
        ".mustache": "text",
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
