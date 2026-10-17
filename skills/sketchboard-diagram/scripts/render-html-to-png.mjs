#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const args = process.argv.slice(2);

function usage() {
  console.error("Usage: node scripts/render-html-to-png.mjs <input.html> <output.png> [--width <page-width>] [--height <page-height>] [--skip-geometry-validation]");
  process.exit(1);
}

if (args.length < 2) usage();

const input = resolve(args[0]);
const output = resolve(args[1]);
let width;
let height;
let widthProvided = false;
let heightProvided = false;
let validateGeometry = true;

for (let i = 2; i < args.length; i += 1) {
  if (args[i] === "--width") {
    width = Number(args[i + 1]);
    widthProvided = true;
    i += 1;
  } else if (args[i] === "--height") {
    height = Number(args[i + 1]);
    heightProvided = true;
    i += 1;
  } else if (args[i] === "--skip-geometry-validation") {
    validateGeometry = false;
  } else {
    usage();
  }
}

if (!existsSync(input)) {
  console.error(`Input not found: ${input}`);
  process.exit(1);
}

function pageDimensionValues(html, property) {
  const pageBlocks = [...html.matchAll(/\.page\s*\{([^}]*)\}/g)];
  return pageBlocks
    .flatMap((match) => [...match[1].matchAll(new RegExp(`\\b${property}\\s*:\\s*(\\d+)px\\b`, "g"))])
    .map((match) => Number(match[1]));
}

const source = readFileSync(input, "utf8");
const sourceWidths = pageDimensionValues(source, "width");
const sourceHeights = pageDimensionValues(source, "height");

if (new Set(sourceWidths).size > 1 || new Set(sourceHeights).size > 1) {
  console.error("The source contains competing .page dimensions. Keep one final width and height declaration, then re-anchor the layout before rendering.");
  process.exit(1);
}

const sourceWidth = sourceWidths.at(-1);
const sourceHeight = sourceHeights.at(-1);

if (widthProvided && sourceWidth && width !== sourceWidth) {
  console.error(`Renderer width ${width}px does not match the final .page width ${sourceWidth}px. Update the layout or use --width ${sourceWidth}.`);
  process.exit(1);
}

if (heightProvided && sourceHeight && height !== sourceHeight) {
  console.error(`Renderer height ${height}px does not match the final .page height ${sourceHeight}px. Update the layout or use --height ${sourceHeight}.`);
  process.exit(1);
}

width ??= sourceWidth ?? 1500;
height ??= sourceHeight ?? 900;

function which(command) {
  const result = spawnSync("sh", ["-lc", `command -v ${command}`], { encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : "";
}

const chromeCandidates = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  which("google-chrome"),
  which("chromium"),
  which("chromium-browser"),
].filter(Boolean);

const chrome = chromeCandidates.find((candidate) => existsSync(candidate));

if (!chrome) {
  console.error("Chrome/Chromium not found. Set CHROME_PATH=/path/to/chrome and retry.");
  process.exit(1);
}

if (validateGeometry) {
  const validator = fileURLToPath(new URL("./validate-html-geometry.mjs", import.meta.url));
  const geometry = spawnSync(process.execPath, [validator, input], { stdio: "inherit" });
  if (geometry.status !== 0) {
    process.exit(geometry.status ?? 1);
  }
}

mkdirSync(dirname(output), { recursive: true });

console.error(`Rendering ${input} at ${width}x${height}${sourceWidth && sourceHeight ? " (from final .page dimensions)" : " (fallback canvas)"}.`);

const result = spawnSync(chrome, [
  "--headless",
  "--disable-gpu",
  "--hide-scrollbars",
  `--screenshot=${output}`,
  `--window-size=${width},${height}`,
  pathToFileURL(input).href,
], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);
