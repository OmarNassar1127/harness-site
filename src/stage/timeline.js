// One timeline for the whole story, measured in viewport heights of scroll.
// The copy (GSAP, in main.ts) and the object (pose(), in stage.js) both read it,
// so text and 3D always agree. Plain JS so the Node build scripts can import it.

export const SCENES = [
  { id: "hero", len: 1.0 },
  { id: "catch", len: 1.8 },
  { id: "parts", len: 2.0 },
  { id: "replay", len: 2.0 },
  { id: "incidents", len: 1.6 },
  { id: "price", len: 1.2 },
  { id: "book", len: 0.8 },
];

export const START = {};
export const LEN = {};
let acc = 0;
for (const s of SCENES) {
  START[s.id] = acc;
  LEN[s.id] = s.len;
  acc += s.len;
}
export const TOTAL = Math.round(acc * 1000) / 1000;

/** Story time of local progress p (0..1) inside a scene. */
export const at = (id, p) => START[id] + p * LEN[id];

/** The scene a story time falls in, and the local progress inside it. */
export function sceneAt(T) {
  for (const s of SCENES) if (T < START[s.id] + s.len) return { id: s.id, p: (T - START[s.id]) / s.len };
  const last = SCENES[SCENES.length - 1];
  return { id: last.id, p: 1 };
}

// Terminal replay of the 2026-09-03 incident. p = local progress in "replay" when the line types out.
// Segments: [text, class]. led: which canary light the line switches on. Facts from the v1 postmortem only.
export const TERM = [
  { p: 0.14, seg: [["$ ", "prompt"], ["deploy", ""]] },
  { p: 0.2, seg: [["memory index: 1 line rewritten", "dim"]] },
  { p: 0.27, seg: [["context canaries", ""]] },
  { p: 0.33, led: 0, seg: [["  1  ", "dim"], ["pass", "ok"]] },
  { p: 0.38, led: 1, seg: [["  2  ", "dim"], ["pass", "ok"]] },
  { p: 0.43, led: 2, seg: [["  3  ", "dim"], ["pass", "ok"]] },
  { p: 0.5, led: 3, fail: true, seg: [["  4  ", "dim"], ["FAIL", "bad"], ["  hostname missing", "dim"]] },
  { p: 0.57, seg: [["context canaries 3/4", "bad"]] },
  { p: 0.63, alarm: true, seg: [["deploy refused", "bad"]] },
  { p: 0.72, seg: [["# fix the doc. never loosen the canary.", "note"]] },
];

const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Piecewise track: keys [[T, value], ...] sorted by T, eased between keys, held outside. */
function track(keys) {
  return (T) => {
    if (T <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1] = keys[i];
      if (T <= t1) {
        const [t0, v0] = keys[i - 1];
        const k = t1 === t0 ? 1 : easeInOut((T - t0) / (t1 - t0));
        return v0 + (v1 - v0) * k;
      }
    }
    return keys[keys.length - 1][1];
  };
}

/** A frame is where the object sits on screen: centre x, y (fractions) and size s (fraction of the short side). */
function frameTrack(keys) {
  const x = track(keys.map(([t, f]) => [t, f.x]));
  const y = track(keys.map(([t, f]) => [t, f.y]));
  const s = track(keys.map(([t, f]) => [t, f.s]));
  return (T) => ({ x: x(T), y: y(T), s: s(T) });
}

const termP = (pred) => TERM.find(pred).p;
const P_FAIL = termP((l) => l.fail);
const P_ALARM = termP((l) => l.alarm);
const ledP = [0, 1, 2, 3].map((k) => termP((l) => l.led === k));

const hold = (f) => frameTrack([[0, f], [1, f]]);
const on = (keys) => track(keys);

// Where each 3D moment sits on screen: landscape (L) and portrait (P) frames.
const FRAMES = {
  gate: {
    L: frameTrack([[0, { x: 0.6, y: 0.565, s: 0.66 }], [at("hero", 0.7), { x: 0.6, y: 0.565, s: 0.66 }], [at("catch", 0.2), { x: 0.71, y: 0.54, s: 0.98 }]]),
    P: frameTrack([[0, { x: 0.6, y: 0.555, s: 1.3 }], [at("hero", 0.7), { x: 0.6, y: 0.555, s: 1.3 }], [at("catch", 0.2), { x: 0.5, y: 0.6, s: 1.6 }]]),
  },
  parts: { L: hold({ x: 0.55, y: 0.57, s: 0.92 }), P: hold({ x: 0.5, y: 0.56, s: 1.5 }) },
  wire: { L: hold({ x: 0.27, y: 0.56, s: 0.8 }), P: hold({ x: 0.5, y: 0.42, s: 1.0 }) },
  box: { L: hold({ x: 0.5, y: 0.8, s: 0.54 }), P: hold({ x: 0.5, y: 0.71, s: 1.02 }) },
  mail: { L: hold({ x: 0.72, y: 0.55, s: 0.86 }), P: hold({ x: 0.5, y: 0.765, s: 1.05 }) },
};

const T_ = {
  // gate moment: hero and the catch
  gOn: on([[at("parts", 0.03), 1], [at("parts", 0.15), 0]]),
  gYaw: track([[0, -0.5], [at("hero", 1), -0.3], [at("catch", 0.2), -0.12], [at("catch", 1), -0.05], [at("parts", 0.15), 1.4]]),
  gPitch: track([[0, 0.06], [at("hero", 1), 0.02], [at("catch", 0.2), -0.5], [at("catch", 0.88), -0.5], [at("catch", 1), -0.15]]),
  flow: track([[0, 0], [at("hero", 1), 0.4]]),
  qOut: track([[at("catch", 0), 0], [at("catch", 0.2), 1]]),
  leadU: track([[0, 0.93], [at("hero", 1), 0.93], [at("catch", 0.12), 0.72], [at("catch", 0.3), 0.98], [at("catch", 0.34), 0.91]]),
  leadBack: track([[at("catch", 0.6), 0], [at("catch", 0.85), 1]]),
  shut: track([[at("catch", 0.25), 0], [at("catch", 0.32), 1], [at("catch", 0.88), 1], [at("catch", 0.97), 0]]),
  alarm: track([[at("catch", 0.31), 0], [at("catch", 0.35), 1], [at("catch", 0.88), 1], [at("catch", 0.97), 0]]),
  stampK: track([[at("catch", 0.34), 0], [at("catch", 0.45), 1], [at("catch", 0.5), 1], [at("catch", 0.62), 0]]),
  mark: track([[at("catch", 0.45), 0], [at("catch", 0.47), 1]]),
  // the six parts
  xOn: on([[at("parts", 0.02), 0], [at("parts", 0.14), 1], [at("parts", 0.9), 1], [at("parts", 1), 0]]),
  explode: track([[at("parts", 0.12), 0], [at("parts", 0.36), 1], [at("parts", 0.74), 1], [at("parts", 0.9), 0]]),
  labels: track([[at("parts", 0.34), 0], [at("parts", 0.42), 1], [at("parts", 0.7), 1], [at("parts", 0.76), 0]]),
  xSpin: track([[at("parts", 0), -0.25], [at("parts", 1), 0.25]]),
  drawers: track([[at("parts", 0.4), 0], [at("parts", 0.55), 1], [at("parts", 0.68), 1], [at("parts", 0.8), 0]]),
  // canaries on a wire, in step with the replay
  wOn: on([[at("replay", 0), 0], [at("replay", 0.12), 1], [at("incidents", 0), 1], [at("incidents", 0.1), 0]]),
  card: track([[at("replay", 0.14), 0], [at("replay", 0.34), 1]]),
  birdOn: ledP.map((p) => track([[at("replay", p), 0], [at("replay", p + 0.02), 1]])),
  birdHop: ledP.map((p) => track([[at("replay", p), 0], [at("replay", p + 0.025), 1], [at("replay", p + 0.06), 0]])),
  birdRed: track([[at("replay", P_FAIL), 0], [at("replay", P_FAIL + 0.02), 1]]),
  look: track([[at("replay", P_ALARM), 0], [at("replay", P_ALARM + 0.04), 1]]),
  // the box the scope ships in
  bOn: on([[at("price", 0), 0], [at("price", 0.12), 1], [at("book", 0), 1], [at("book", 0.1), 0]]),
  drops: [0, 1, 2, 3, 4, 5].map((i) => track([[at("price", 0.12 + i * 0.055), 0], [at("price", 0.26 + i * 0.055), 1]])),
  lid: track([[at("price", 0.5), 0], [at("price", 0.64), 1]]),
  bow: track([[at("price", 0.62), 0], [at("price", 0.74), 1]]),
  // the envelope
  eOn: on([[at("book", 0), 0], [at("book", 0.16), 1]]),
  flap: track([[at("book", 0.16), 0], [at("book", 0.4), 1]]),
  letter: track([[at("book", 0.34), 0], [at("book", 0.62), 1]]),
  canvasOpacity: track([[at("incidents", 0.06), 1], [at("incidents", 0.14), 0], [at("incidents", 0.92), 0], [at("price", 0.02), 1]]),
};

/** Everything the 3D world needs at story time T. */
export function pose(T) {
  const P = { T, frames: {} };
  for (const [name, f] of Object.entries(FRAMES)) P.frames[name] = { L: f.L(T), P: f.P(T) };
  for (const [name, f] of Object.entries(T_)) P[name] = Array.isArray(f) ? f.map((g) => g(T)) : f(T);
  return P;
}

/** Story times of the keyframe stills (static mode, poster, Open Graph). */
export const STILLS = {
  hero: 0,
  catch: at("catch", 0.62),
  parts: at("parts", 0.56),
  replay: at("replay", 0.86),
  price: at("price", 0.42),
  book: at("book", 0.8),
};
