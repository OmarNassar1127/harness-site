// Renders public/og-agents-en.png and og-agents-nl.png from the built /agents/ hero (answer card shown).
// Usage: build, start `npx vite preview --port 4179`, then: node scripts/og-agents.mjs http://localhost:4179
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { webkit } from "playwright";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = process.argv[2] || "http://localhost:4179";
const browser = await webkit.launch();
for (const [lang, path] of [["en", "/agents/"], ["nl", "/nl/agents/"]]) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: ".nav-wrap { display: none } .ag-hero-stage { padding-top: 40px !important; padding-bottom: 40px !important }" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(ROOT, `public/og-agents-${lang}.png`) });
  await page.close();
}
await browser.close();
console.log("og: public/og-agents-en.png, public/og-agents-nl.png");
