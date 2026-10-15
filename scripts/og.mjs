// Renders the Open Graph images (one per language) from the hero render of the 3D stage, and the favicon set.
// Usage: node scripts/og.mjs   (writes into public/, needs Google Chrome)
process.env.NODE_ENV = "development";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { chromium } from "playwright";
import en from "../content/en.mjs";
import nl from "../content/nl.mjs";
import { STILLS } from "../src/stage/timeline.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUB = join(ROOT, "public");
const font = (file) => `data:font/woff2;base64,${readFileSync(join(PUB, "fonts", file)).toString("base64")}`;

// The mark: the gate from the page, as a flat icon.
const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" rx="14" fill="#0f0f0e"/>
<rect x="13" y="16" width="38" height="38" rx="11" fill="#f3f2ee"/>
<rect x="22" y="25" width="20" height="20" rx="5" fill="#f2541a"/>
<rect x="25" y="28" width="14" height="14" rx="3.5" fill="#0f0f0e"/>
<circle cx="32" cy="10.5" r="3.6" fill="#f2541a"/>
</svg>
`;

function ogHtml(t, render) {
  const [line1, lead, em] = t.hero.title;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Newsreader;src:url(${font("newsreader-500.woff2")});font-weight:500}
@font-face{font-family:Newsreader;src:url(${font("newsreader-500-italic.woff2")});font-weight:500;font-style:italic}
@font-face{font-family:"Mona Sans";src:url(${font("mona-sans.woff2")});font-weight:200 900}
*{box-sizing:border-box;margin:0}
html,body{width:1200px;height:630px;background:#f4f4f2;overflow:hidden}
body{font-family:"Mona Sans",sans-serif;color:#4a4a47;position:relative}
.copy{position:absolute;left:72px;top:74px;width:610px}
h1{font-family:Newsreader,serif;font-weight:500;color:#0f0f0e;font-size:68px;line-height:1.02;letter-spacing:-.028em;text-wrap:balance}
h1 em{font-style:italic;color:#f2541a}
h1 .l{display:block;text-wrap:balance}
.foot{position:absolute;left:72px;bottom:62px;display:flex;align-items:center;gap:18px;font-size:25px;color:#0f0f0e;font-weight:600}
.pill{background:#f2541a;color:#0f0f0e;border-radius:999px;padding:12px 24px;font-size:24px}
.url{font:500 20px ui-monospace,Menlo,monospace;color:#6f6f6a}
.fig{position:absolute;right:-30px;top:-10px;width:650px;height:650px;-webkit-mask-image:linear-gradient(to right,transparent 2%,#000 16%);mask-image:linear-gradient(to right,transparent 2%,#000 16%)}
</style></head><body>
<div class="copy"><h1><span class="l">${line1}</span><span class="l">${lead} <em>${em}</em></span></h1></div>
<div class="foot"><span class="pill">${t.price.from} ${t.price.amount}</span><span>Omar Nassar</span><span class="url">harness.omardev.xyz${t.path === "/" ? "" : "/nl"}</span></div>
<img class="fig" src="${render}">
</body></html>`;
}

const server = await createServer({ root: ROOT, configFile: join(ROOT, "vite.config.ts"), server: { port: 5198, strictPort: true }, logLevel: "error" });
await server.listen();
const browser = await chromium.launch({ channel: "chrome" });
const still = await browser.newPage({ viewport: { width: 1300, height: 1300 } });
await still.goto(`http://localhost:5198/tools/still.html?t=${STILLS.hero}&w=1300&h=1300&type=image/png`, { waitUntil: "networkidle" });
const render = (await still.evaluate(() => window.__still)).url;
await still.close();
await server.close();
for (const t of [en, nl]) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(ogHtml(t, render), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  await page.screenshot({ path: join(PUB, `og-${t.lang}.png`) });
  console.log("wrote", `public/og-${t.lang}.png`);
  await page.close();
}

writeFileSync(join(PUB, "favicon.svg"), ICON);
const pngs = {};
for (const size of [16, 32, 180, 192, 512]) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  const icon = size === 180 ? ICON.replace('rx="14"', 'rx="0"') : ICON;
  await page.setContent(`<html><body style="margin:0;background:transparent">${icon.replace("<svg ", `<svg width="${size}" height="${size}" style="display:block" `)}</body></html>`);
  pngs[size] = await page.screenshot({ omitBackground: true });
  await page.close();
}
await browser.close();
writeFileSync(join(PUB, "apple-touch-icon.png"), pngs[180]);
writeFileSync(join(PUB, "icon-192.png"), pngs[192]);
writeFileSync(join(PUB, "icon-512.png"), pngs[512]);

// favicon.ico holding 16 and 32 px PNGs.
const images = [pngs[16], pngs[32]];
const header = Buffer.alloc(6 + 16 * images.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = header.length;
images.forEach((png, index) => {
  const size = index === 0 ? 16 : 32;
  const at = 6 + index * 16;
  header.writeUInt8(size, at);
  header.writeUInt8(size, at + 1);
  header.writeUInt8(0, at + 2);
  header.writeUInt8(0, at + 3);
  header.writeUInt16LE(1, at + 4);
  header.writeUInt16LE(32, at + 6);
  header.writeUInt32LE(png.length, at + 8);
  header.writeUInt32LE(offset, at + 12);
  offset += png.length;
});
writeFileSync(join(PUB, "favicon.ico"), Buffer.concat([header, ...images]));
writeFileSync(
  join(PUB, "site.webmanifest"),
  JSON.stringify(
    {
      name: "Omar Nassar, Claude Code harness setup",
      short_name: "Harness",
      start_url: "/",
      display: "browser",
      background_color: "#f4f4f2",
      theme_color: "#f4f4f2",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    null,
    2,
  ) + "\n",
);
console.log("wrote favicon.svg, favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png, site.webmanifest");
