// Renders the Open Graph images (one per language) and the favicon set with headless Chrome.
// Usage: node scripts/og.mjs   (writes into public/)
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import en from "../content/en.mjs";
import nl from "../content/nl.mjs";
import * as k from "../vendor/anatomy/iso-kit.mjs";
import * as G from "../figures/gate-model.mjs";
import { HELD_POSE } from "../src/live/gate.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUB = join(ROOT, "public");
const font = (file) => `data:font/woff2;base64,${readFileSync(join(PUB, "fonts", file)).toString("base64")}`;
const figureCss = readFileSync(join(ROOT, "src/figures.css"), "utf8");

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" rx="14" fill="#0f0f0e"/>
<rect x="10" y="12" width="44" height="8" rx="2" fill="#fbfbfa"/>
<rect x="14" y="20" width="8" height="32" rx="1.5" fill="#fbfbfa"/>
<rect x="42" y="20" width="8" height="32" rx="1.5" fill="#fbfbfa"/>
<rect x="22" y="36" width="20" height="7" rx="1.5" fill="#f2541a"/>
</svg>
`;

function ogHtml(t) {
  const [line1, lead, em] = t.hero.title;
  const svg = G.figure(HELD_POSE);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Newsreader;src:url(${font("newsreader-500.woff2")});font-weight:500}
@font-face{font-family:Newsreader;src:url(${font("newsreader-500-italic.woff2")});font-weight:500;font-style:italic}
@font-face{font-family:"Mona Sans";src:url(${font("mona-sans.woff2")});font-weight:200 900}
${k.ISO_CSS}${figureCss}
*{box-sizing:border-box;margin:0}
html,body{width:1200px;height:630px;background:#f4f4f2;overflow:hidden}
body{font-family:"Mona Sans",sans-serif;color:#4a4a47;position:relative}
.copy{position:absolute;left:72px;top:64px;width:600px}
.eyebrow{font:500 22px ui-monospace,Menlo,monospace;color:#c2410c;letter-spacing:.01em}
h1{font-family:Newsreader,serif;font-weight:500;color:#0f0f0e;font-size:74px;line-height:1.02;letter-spacing:-.02em;margin-top:26px}
h1 em{font-style:italic;color:#f2541a}
.foot{position:absolute;left:72px;bottom:58px;display:flex;align-items:center;gap:18px;font-size:25px;color:#0f0f0e;font-weight:600}
.pill{background:#f2541a;color:#0f0f0e;border-radius:999px;padding:12px 24px;font-size:24px}
.url{font:500 20px ui-monospace,Menlo,monospace;color:#6f6f6a}
.fig{position:absolute;right:-70px;top:40px;width:640px}
.fig .iso-svg{width:640px}
</style></head><body class="iso" data-theme="light">
<div class="copy"><p class="eyebrow">${t.hero.eyebrow}</p><h1>${line1}<br>${lead} <em>${em}</em></h1></div>
<div class="foot"><span class="pill">${t.price.from} ${t.price.amount}</span><span>Omar Nassar</span><span class="url">harness.omardev.xyz${t.path === "/" ? "" : "/nl"}</span></div>
<div class="fig">${svg}</div>
</body></html>`;
}

const browser = await chromium.launch({ channel: "chrome" });
for (const t of [en, nl]) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(ogHtml(t), { waitUntil: "load" });
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
