// Responsive check of the built site in headless Chrome.
// Asserts, for both languages at 360, 390, 768, 1024 and 1440 px:
//   - no horizontal scroll (document.scrollingElement.scrollWidth <= innerWidth),
//   - every visible tap target (links, buttons, focusable figures) is at least 44 x 44 px,
//   - no console errors or failed requests,
//   - each figure's drawing renders at a legible scale (px on screen per world unit of the model).
// Usage: node scripts/check.mjs [baseUrl] [--shots dir]
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const base = args.find((a) => a.startsWith("http")) || "http://localhost:4173";
const shotDir = args.includes("--shots") ? args[args.indexOf("--shots") + 1] : null;
// --inject "<css>" adds a stylesheet before measuring, to prove the checks fail when they should.
const inject = args.includes("--inject") ? args[args.indexOf("--inject") + 1] : null;
if (shotDir) mkdirSync(shotDir, { recursive: true });
const WIDTHS = [360, 390, 768, 1024, 1440];
const PAGES = [["en", "/"], ["nl", "/nl/"]];
// World-unit scale of each figure's projection, so the check can turn rendered size into px per unit.
const UNITS = { gate: 600, canary: 600 };

const browser = await chromium.launch({ channel: "chrome" });
let failures = 0;
const fail = (line) => {
  failures++;
  console.log("  FAIL " + line);
};

for (const [lang, path] of PAGES) {
  for (const width of WIDTHS) {
    const mobile = width < 640;
    const page = await browser.newPage({ viewport: { width, height: mobile ? 800 : 900 }, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("requestfailed", (r) => errors.push("request failed " + r.url()));
    page.on("response", (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
    await page.goto(base + path, { waitUntil: "networkidle" });
    if (inject) await page.addStyleTag({ content: inject });
    await page.waitForTimeout(400);
    const result = await page.evaluate((units) => {
      const se = document.scrollingElement;
      const overflow = { scrollWidth: se.scrollWidth, innerWidth: window.innerWidth };
      const wide = [...document.querySelectorAll("body *")]
        .filter((el) => !el.closest("svg") && !el.closest(".iso-stage"))
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 0 && r.right > window.innerWidth + 0.5)
        .slice(0, 5)
        .map(({ el, r }) => `${el.tagName.toLowerCase()}.${el.className} right=${Math.round(r.right)}`);
      const targets = [...document.querySelectorAll('a[href], button, [role="button"], [tabindex="0"]')]
        .filter((el) => {
          const style = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          if (style.visibility === "hidden" || style.display === "none" || r.width === 0 || r.height === 0) return false;
          if (el.classList.contains("skip")) return false; // only on screen while focused
          return true;
        })
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { label: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40), w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 };
        });
      const small = targets.filter((t) => t.w < 44 || t.h < 44);
      const figures = [...document.querySelectorAll("[data-figure]")].map((fig) => {
        const svg = fig.querySelector(".iso-svg");
        const stage = fig.querySelector(".iso-stage");
        const r = svg.getBoundingClientRect();
        const vb = svg.viewBox.baseVal;
        return { id: fig.dataset.figure, svgWidth: Math.round(r.width), stageWidth: Math.round(stage.getBoundingClientRect().width), pxPerViewBox: r.width / vb.width, units: units[fig.dataset.figure] };
      });
      return { overflow, wide, targets: targets.length, small, figures };
    }, UNITS);

    console.log(`${lang} ${width}px: scrollWidth ${result.overflow.scrollWidth} / innerWidth ${result.overflow.innerWidth}, ${result.targets} tap targets`);
    // On a phone, overflowing content widens the layout viewport itself, so innerWidth must also equal the device width.
    if (result.overflow.innerWidth !== width) fail(`layout viewport is ${result.overflow.innerWidth}px on a ${width}px screen (content wider than the screen)`);
    if (result.overflow.scrollWidth > result.overflow.innerWidth) fail(`horizontal scroll at ${width}px (${result.overflow.scrollWidth} > ${result.overflow.innerWidth}) ${result.wide.join("; ")}`);
    for (const t of result.small) fail(`tap target ${t.w}x${t.h} "${t.label}"`);
    for (const f of result.figures) {
      console.log(`  figure ${f.id}: svg ${f.svgWidth}px in a ${f.stageWidth}px stage, ${f.pxPerViewBox.toFixed(2)} px per viewBox unit`);
      if (f.pxPerViewBox < 0.68) fail(`figure ${f.id} renders at ${f.pxPerViewBox.toFixed(2)} px per viewBox unit (< 0.68)`);
    }
    for (const e of errors) fail(`console/network: ${e}`);
    if (shotDir) {
      await page.screenshot({ path: `${shotDir}/${lang}-${width}.png` });
      for (const f of result.figures) {
        const el = await page.$(`[data-figure="${f.id}"]`);
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(250);
        await el.screenshot({ path: `${shotDir}/${lang}-${width}-${f.id}.png` });
      }
    }
    await page.close();
  }
}
await browser.close();
console.log(failures ? `${failures} failure(s)` : "all checks passed");
process.exitCode = failures ? 1 : 0;
