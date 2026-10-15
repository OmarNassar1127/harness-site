// Renders the keyframe stills of the harness module into public/keyframes/ (WebP, 640 and 1200 px),
// plus meta.json with the exploded-view label positions. Needs Google Chrome.
// Usage: node scripts/keyframes.mjs
process.env.NODE_ENV = "development";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { chromium } from "playwright";
import { STILLS } from "../src/stage/timeline.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public/keyframes");
mkdirSync(OUT, { recursive: true });

const server = await createServer({ root: ROOT, configFile: join(ROOT, "vite.config.ts"), server: { port: 5199, strictPort: true }, logLevel: "error" });
await server.listen();
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1200, height: 1200 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const meta = {};
for (const [name, T] of Object.entries(STILLS)) {
  for (const size of [1200, 640]) {
    await page.goto(`http://localhost:5199/tools/still.html?t=${T}&w=${size}&h=${size}`, { waitUntil: "networkidle" });
    const { url, anchors } = await page.evaluate(() => window.__still);
    const buf = Buffer.from(url.split(",")[1], "base64");
    writeFileSync(join(OUT, `${name}-${size}.webp`), buf);
    if (size === 1200) meta[name] = anchors.map((a) => ({ x: Math.round(a.x * 1000) / 1000, y: Math.round(a.y * 1000) / 1000, below: a.below }));
    console.log(`${name}-${size}.webp`, Math.round(buf.length / 1024) + " KB");
  }
}
writeFileSync(join(OUT, "meta.json"), JSON.stringify({ parts: meta.parts }, null, 2) + "\n");
await browser.close();
await server.close();
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
}
