// Writes standalone preview pages of each figure in a resting pose, for capture.mjs and lines.mjs.
// Usage: node figures/preview.mjs [gate|canary]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../vendor/anatomy/iso-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "out");
mkdirSync(OUT, { recursive: true });
const css = readFileSync(join(HERE, "../src/figures.css"), "utf8");
const which = process.argv[2] || "all";

async function page(name, plate) {
  const html = k.pageHtml({ title: name, theme: "light", body: plate, width: 760 }).replace("</style>", `${css}</style>`);
  writeFileSync(join(OUT, `${name}.html`), html);
  console.log("wrote", join(OUT, `${name}.html`));
}

if (which === "all" || which === "gate") {
  const G = await import("./gate-model.mjs");
  const poses = {
    "gate-held": { slot: "track", x: 0, seated: [true, true, false, true], tips: [G.TIP_ON_PIN, G.TIP_ON_PIN, G.TIP_DEEP, G.TIP_ON_PIN], lit: 2 },
    "gate-pass": { slot: "beyond", x: 64, seated: [true, true, true, true], tips: G.PINS.map(() => G.TIP_UP), open: true, lit: -1 },
  };
  for (const [name, pose] of Object.entries(poses)) {
    await page(name, k.plateHtml({ fig: "Fig 1", title: "Completion gate", hint: "Tap to pull a check", readout: "3 of 4 checks · held", body: `<div class="iso-stage">${G.figure(pose)}</div>` }));
  }
}
if (which === "all" || which === "canary") {
  const C = await import("./canary-model.mjs").catch(() => null);
  if (C) await page("canary", k.plateHtml({ fig: "Fig 2", title: "Canary reader", hint: "Tap to edit the card", readout: "4 of 4 through", body: `<div class="iso-stage">${C.figure()}</div>` }));
}
