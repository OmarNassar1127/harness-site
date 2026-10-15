// Full-page slices for review. Usage: node scripts/slices.mjs <url> <out-prefix> <width> <height>
import { chromium } from "playwright";
const [url, prefix, w = "1440", h = "900"] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chrome" });
const width = Number(w), height = Number(h);
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: width < 600 ? 2 : 1, isMobile: width < 600, hasTouch: width < 600 });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
const total = await page.evaluate(() => document.documentElement.scrollHeight);
let i = 0;
for (let y = 0; y < total; y += height) {
  await page.screenshot({ path: `${prefix}-${i}.png`, clip: { x: 0, y, width, height: Math.min(height, total - y) }, fullPage: true });
  i++;
}
console.log("slices", i, "height", total);
await browser.close();
