// Screenshots of the built site. Usage: node scripts/shots.mjs <baseUrl> <outDir> [--full]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const [base = "http://127.0.0.1:4173", out = "/tmp/hs-shots/site", ...flags] = process.argv.slice(2);
const full = flags.includes("--full");
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const targets = [
  ["en", "/"],
  ["nl", "/nl/"],
];
const sizes = [
  ["mobile", { width: 390, height: 844 }, 3],
  ["desktop", { width: 1440, height: 900 }, 2],
];
for (const [lang, path] of targets) {
  for (const [name, viewport, scale] of sizes) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: scale, isMobile: name === "mobile", hasTouch: name === "mobile" });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    const file = `${out}/harness-site-${lang}-${name}.png`;
    await page.screenshot({ path: file, fullPage: full });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    console.log(file, "overflow-x:", overflow, errors.length ? "errors: " + errors.join(" | ") : "clean");
    await page.close();
  }
}
await browser.close();
