// Responsive check of the built site in headless Chrome.
// Asserts, for both languages at 360, 390, 768, 1024 and 1440 px:
//   - no horizontal scroll (document.scrollingElement.scrollWidth <= innerWidth),
//   - every visible tap target (links, buttons, focusable figures) is at least 44 x 44 px,
//   - no console errors or failed requests,
//   - the WebGL stage goes live (motion mode) and the canvas is not blank.
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
    await page.mouse.wheel(0, 1);
    const live = await page.waitForFunction(() => document.querySelector(".object")?.classList.contains("is-live"), null, { timeout: 15000 }).then(() => true, () => false);
    await page.waitForTimeout(400);
    const result = await page.evaluate(() => {
      const se = document.scrollingElement;
      const overflow = { scrollWidth: se.scrollWidth, innerWidth: window.innerWidth };
      const wide = [...document.querySelectorAll("body *")]
        .filter((el) => !el.closest(".object"))
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
      return { overflow, wide, targets: targets.length, small };
    });
    // Blank-canvas check: hide the copy and the poster, screenshot, count pixels that differ from the page colour.
    const hide = await page.addStyleTag({ content: ".scene, .nav-wrap, .poster { visibility: hidden !important; }" });
    const shot = await page.screenshot({ type: "png" });
    await hide.evaluate((el) => el.remove());
    result.inked = await page.evaluate(async (src) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const g = c.getContext("2d");
      g.drawImage(img, 0, 0, 64, 64);
      const d = g.getImageData(0, 0, 64, 64).data;
      let n = 0;
      for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - 244) + Math.abs(d[i + 1] - 244) + Math.abs(d[i + 2] - 242) > 30) n++;
      return n;
    }, "data:image/png;base64," + shot.toString("base64"));

    console.log(`${lang} ${width}px: scrollWidth ${result.overflow.scrollWidth} / innerWidth ${result.overflow.innerWidth}, ${result.targets} tap targets`);
    // On a phone, overflowing content widens the layout viewport itself, so innerWidth must also equal the device width.
    if (result.overflow.innerWidth !== width) fail(`layout viewport is ${result.overflow.innerWidth}px on a ${width}px screen (content wider than the screen)`);
    if (result.overflow.scrollWidth > result.overflow.innerWidth) fail(`horizontal scroll at ${width}px (${result.overflow.scrollWidth} > ${result.overflow.innerWidth}) ${result.wide.join("; ")}`);
    for (const t of result.small) fail(`tap target ${t.w}x${t.h} "${t.label}"`);
    if (!live) fail("the WebGL stage never went live");
    else if (result.inked < 20) fail(`the canvas looks blank (${result.inked} of 4096 sampled pixels drawn)`);
    for (const e of errors) fail(`console/network: ${e}`);
    if (shotDir) await page.screenshot({ path: `${shotDir}/${lang}-${width}.png` });
    await page.close();
  }
}
await browser.close();
console.log(failures ? `${failures} failure(s)` : "all checks passed");
process.exitCode = failures ? 1 : 0;
