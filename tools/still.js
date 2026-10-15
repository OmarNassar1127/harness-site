// Renders one still of the harness module for the keyframe and Open Graph scripts.
// Query: ?t=<story time>&w=<px>&h=<px>&frame=center|live&bg=1
import { createStage } from "../src/stage/stage.js";

const q = new URLSearchParams(location.search);
const T = Number(q.get("t") || 0);
const w = Number(q.get("w") || 1200);
const h = Number(q.get("h") || w);
const centred = (q.get("frame") || "center") === "center";
const canvas = document.getElementById("c");
canvas.style.width = w + "px";
canvas.style.height = h + "px";

window.__still = (async () => {
  await document.fonts.load('600 112px "Mona Sans"');
  const stage = await createStage(canvas, { font: '"Mona Sans", sans-serif', fixedFrame: centred ? { x: 0.5, y: 0.5, s: 0.94 } : null, maxDpr: 1 });
  stage.setSize(w, h);
  stage.render(T);
  const anchors = stage.anchors().map((a) => ({ x: a.x / w, y: a.y / h, below: a.below }));
  const type = q.get("type") || "image/webp";
  return { url: canvas.toDataURL(type, 0.86), anchors };
})();
