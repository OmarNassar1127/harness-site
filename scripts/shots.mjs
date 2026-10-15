// Screenshots of every scene at a phone and a desktop size.
// Usage: node scripts/shots.mjs <baseUrl> <outDir> [--lang en,nl] [--scenes hero,parts] [--sizes mobile,desktop] [--reduced]
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const opt = (name, def) => (args.includes(name) ? args[args.indexOf(name) + 1] : def);
const [base = "http://localhost:4173", out = "/tmp/hs-shots"] = args.filter((a) => !a.startsWith("--") && !args[args.indexOf(a) - 1]?.startsWith("--"));
const langs = opt("--lang", "en").split(",");
const sizes = opt("--sizes", "mobile,desktop").split(",");
const reduced = args.includes("--reduced");
const MOMENTS = { hero: ["hero", 0.04], catch: ["catch", 0.57], parts: ["parts", 0.56], replay: ["replay", 0.86], incidents: ["incidents", 0.72], price: ["price", 0.62], book: ["book", 0.75] };
const scenes = opt("--scenes", Object.keys(MOMENTS).join(",")).split(",");
const VIEWPORTS = { mobile: [{ width: 390, height: 844 }, 3, true], desktop: [{ width: 1440, height: 900 }, 2, false] };
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
for (const lang of langs) {
  for (const size of sizes) {
    const [viewport, scale, mobile] = VIEWPORTS[size];
    const page = await browser.newPage({ viewport, deviceScaleFactor: scale, isMobile: mobile, hasTouch: mobile, reducedMotion: reduced ? "reduce" : "no-preference" });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(base + (lang === "nl" ? "/nl/" : "/"), { waitUntil: "networkidle" });
    if (!reduced) {
      await page.mouse.wheel(0, 1);
      await page.waitForFunction(() => document.querySelector(".object")?.classList.contains("is-live"), null, { timeout: 15000 }).catch(() => errors.push("stage never went live"));
    }
    for (const name of scenes) {
      const [id, p] = MOMENTS[name];
      if (reduced) {
        await page.evaluate((id) => document.getElementById(id).scrollIntoView(), id);
      } else {
        await page.evaluate(([id, p]) => window.__story.scrollToT(window.__story.at(id, p)), [id, p]);
      }
      await page.waitForTimeout(1600);
      const report = await page.evaluate((id) => {
        const op = Number(getComputedStyle(document.querySelector("canvas.gl")).opacity);
        const boxes = op > 0.5 ? window.__story?.bounds?.() || [] : [];
        const scene = document.getElementById(id);
        const seen = (el) => {
          let o = 1;
          for (let n = el; n && n !== scene.parentElement; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
          return o > 0.5;
        };
        const rects = [...scene.querySelectorAll("h1, h2, .sub, .actions, .term, .scope, .xline, .card")].filter(seen).map((el) => ({ el: el.className || el.tagName, r: el.getBoundingClientRect() }));
        // the framing circle of a moment is larger than what is drawn, so allow some slack
        const hits = boxes.flatMap((b) => rects.filter(({ r }) => r.right > b.x0 + 40 && r.left < b.x1 - 40 && r.bottom > b.y0 + 40 && r.top < b.y1 - 40).map((h) => `${b.name}x${h.el}`));
        return { boxes: boxes.map((b) => [b.name, ...[b.x0, b.y0, b.x1, b.y1].map(Math.round)]), text: rects.map((x) => [x.el.slice(0, 10), Math.round(x.r.top), Math.round(x.r.bottom)]), hits };
      }, id);
      console.log(name, JSON.stringify(report));
      const file = `${out}/${lang}-${size}-${name}.png`;
      await page.screenshot({ path: file });
      console.log(file);
    }
    console.log(lang, size, errors.length ? "errors: " + errors.join(" | ") : "clean");
    await page.close();
  }
}
await browser.close();
