// Fig 2: canaries, drawn as a punched-card reader with an interlock.
// The card is the instruction file; each hole is a fact a canary checks. Four pins hang from a
// press head. If every pin finds its hole the head bottoms out and the deploy bolt retracts.
// One missing hole stops the head on the card and the bolt stays in its keeper.
import * as k from "../vendor/anatomy/iso-kit.mjs";

export const WIDTH = 600;
export const HEIGHT = 400;
const AZIMUTH = 40;

export const PLATE = { x: -136, y: -60, w: 272, d: 120, r: 8 };
const PLATE_H = 11;
const FOOT_H = 5;

// Card guide rails, hopper (cards come out of it) and out box (accepted cards go in).
const RAILS = [-23, 19]; // plan y of each rail, depth 4
const RAIL_X = [-74, 74];
const RAIL_H = 3;
export const HOPPER = { x: -128, y: -31, w: 54, d: 62, r: 2.5 };
const HOPPER_H = 30;
export const HOPPER_FACE = HOPPER.x + HOPPER.w; // -74
export const OUTBOX = { x: 74, y: -31, w: 54, d: 62, r: 2.5 };
const OUTBOX_H = 22;

// The card: the instruction file. Facts are holes in one column.
export const CARD = { x: -24, y: -20, w: 48, d: 40, r: 1.5 };
const CARD_Z = RAIL_H;
const CARD_T = 1.4;
export const CARD_TOP = CARD_Z + CARD_T;
export const HOLES = [-12, -4, 4, 12]; // y of each fact, at card-local x = HOLE_X
export const HOLE_X = 8;
const HOLE_R = 1.9;
export const IN_HOPPER = HOPPER.x + 2 + 24; // card centre fully inside the hopper
export const IN_OUTBOX = OUTBOX.x + OUTBOX.w - 2 - 24;

// Press: two posts, a bridge, a head on ears around the posts, four pins under the head.
const POSTS = [-35, 35];
const POST_R = 2.8;
const POST_X = HOLE_X;
const BRIDGE_Z = 78;
const HEAD_H = 9;
const PIN_R = 1.15;
const PIN_LEN = 15;
export const TIP_REST = 18;
export const TIP_FULL = -6; // through the card and into the die below
export const TIP_BLOCKED = CARD_TOP;
const DIE = { x: HOLE_X - 7, y: -17, w: 14, d: 34, r: 1 };

// Interlock at the front: a bolt that slides out of its housing into a keeper.
const LOCK = { x: -4, y: 41, w: 28, d: 12, r: 1.5 };
const LOCK_H = 11;
export const BOLT_TRAVEL = 9;
const KEEPER = { x: LOCK.x + LOCK.w + 10, y: LOCK.y + 2, w: 10, d: 8, r: 1.2 };

export const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [POST_X, 0, BRIDGE_Z + 22], [POST_X, POSTS[0] - 4, BRIDGE_Z + 6], [POST_X, POSTS[1] + 4, BRIDGE_Z + 6]],
  WIDTH,
  HEIGHT,
  { pad: 26, azimuth: AZIMUTH },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const depth = ([x, y]) => k.depthOf([x, y, 0], P);
const byDepth = (points) => [...points].sort((a, b) => depth(a) - depth(b));

function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 20))) {
    out.push(S(k.cylinder(x, y, 6.5, -PLATE_H - FOOT_H, 1.5, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5, -PLATE_H - FOOT_H + 1.5, FOOT_H - 1.5, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.5), { tone: "mid", inner: L(k.sideSeam(PLATE, -PLATE_H / 2, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.1, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // Label plate with rule lines and the one engraved mark.
  const label = { x: -104, y: 38, w: 40, d: 14, r: 2 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 4), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(label, 1.5), 0.8, P), { tone: "faint" }));
  for (const [y, length] of [[45.5, 22], [48.5, 15]]) out.push(L(k.lineOnTop([label.x + 4, y], [label.x + 4 + length, y], 0.8, P), { tone: "lo", free: true }));
  out.push(k.faceTextSvg(k.topMatrix([label.x + 4, label.y + 4.6], 0.8, P, "x"), "CANARY", { size: 2.8, tone: "mid" }));
  out.push(D([at([label.x + label.w - 3, label.y + 3, 0.8]), at([label.x + label.w - 3, label.y + label.d - 3, 0.8])], { size: 0.45 }));
  return out.join("");
}

function hopper() {
  const out = [];
  const seam = L(k.sideSeam(HOPPER, HOPPER_H - 6, P, 3), { tone: "faint" });
  out.push(S(k.slabOf(HOPPER, 0, HOPPER_H, P, 3, 0.6), { tone: "mid", inner: seam }));
  // Lid with a knurled follower knob that holds the stack down.
  const lid = k.insetPlan(HOPPER, 4);
  out.push(L(k.planOutline(lid, HOPPER_H, P, 3), { tone: "lo" }));
  const knob = [HOPPER.x + HOPPER.w / 2 - 6, 0];
  out.push(S(k.cylinder(knob[0], knob[1], 3.4, HOPPER_H, 4, P, 24), { tone: "mid" }));
  out.push(L(k.knurl(knob[0], knob[1], 3.4, HOPPER_H + 0.5, HOPPER_H + 3.5, 18, P), { tone: "lo" }));
  out.push(D(k.corners(lid, 3).map(([x, y]) => at([x, y, HOPPER_H])), { size: 0.45 }));
  // The feed slot on the +x face, as a closed recess the card comes out of.
  const M = k.sideMatrix([HOPPER_FACE, HOPPER.y + HOPPER.d], HOPPER_H, P, "right");
  const v0 = HOPPER_H - CARD_TOP - 1.2;
  out.push(`<g transform="${M}"><rect class="slot" x="${HOPPER.d / 2 - 23}" y="${v0.toFixed(2)}" width="46" height="3.4" rx="0.8"/></g>`);
  // Vent slots on the +y face.
  const V = k.sideMatrix([HOPPER.x, HOPPER.y + HOPPER.d], HOPPER_H, P, "left");
  out.push(`<g transform="${V}">${[0, 1, 2, 3].map((i) => `<rect class="vent" x="${10 + i * 9}" y="6" width="5" height="1.6" rx="0.8"/>`).join("")}</g>`);
  return out.join("");
}

function outbox() {
  const out = [];
  out.push(S(k.slabOf(OUTBOX, 0, OUTBOX_H, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(OUTBOX, 6, P, 3), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(OUTBOX, 4), OUTBOX_H, P, 3), { tone: "lo" }));
  out.push(D(k.corners(k.insetPlan(OUTBOX, 4), 3).map(([x, y]) => at([x, y, OUTBOX_H])), { size: 0.45 }));
  // A tally of accepted cards on its +y face.
  const M = k.sideMatrix([OUTBOX.x, OUTBOX.y + OUTBOX.d], OUTBOX_H, P, "left");
  out.push(`<g transform="${M}"><rect class="dial-plate" x="${OUTBOX.w / 2 - 10}" y="5" width="20" height="6.4" rx="0.8"/><text data-part="accepted" class="tally-digits" x="${OUTBOX.w / 2}" y="9.95" text-anchor="middle">0000</text></g>`);
  return out.join("");
}

function rails() {
  const out = [];
  for (const y of RAILS) {
    out.push(S(k.slabOf({ x: RAIL_X[0], y, w: RAIL_X[1] - RAIL_X[0], d: 4, r: 0.6 }, 0, RAIL_H, P, 3, 0.3), { tone: "mid" }));
    out.push(D([RAIL_X[0] + 6, -40, 40, RAIL_X[1] - 6].map((x) => at([x, y + 2, RAIL_H])), { size: 0.4 }));
  }
  // The die under the read position, one hole per fact.
  out.push(S(k.slabOf(DIE, 0, CARD_Z - 0.2, P, 2, 0.3), { tone: "lo" }));
  out.push(L(HOLES.map((y) => k.ring(HOLE_X, y, HOLE_R + 0.2, CARD_Z - 0.2, P, 16)).join(""), { tone: "lo" }));
  return out.join("");
}

function lock(open = 0) {
  const out = [];
  out.push(S(k.slabOf(LOCK, 0, LOCK_H, P, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(LOCK, 3, P, 3), { tone: "faint" }) }));
  out.push(D(k.corners(LOCK, 2.6).map(([x, y]) => at([x, y, LOCK_H])), { size: 0.45 }));
  out.push(`<g data-part="bolt">${boltSvg(open)}</g>`);
  out.push(S(k.slabOf(KEEPER, 0, LOCK_H - 1, P, 2, 0.4), { tone: "mid" }));
  out.push(D([at([KEEPER.x + KEEPER.w / 2, KEEPER.y + 2, LOCK_H - 1]), at([KEEPER.x + KEEPER.w / 2, KEEPER.y + KEEPER.d - 2, LOCK_H - 1])], { size: 0.45 }));
  // Status window on the lock's +y face: filled while the bolt is in its keeper.
  const M = k.sideMatrix([LOCK.x, LOCK.y + LOCK.d], LOCK_H, P, "left");
  out.push(`<g transform="${M}"><rect class="flag-face" data-part="lock-window"${open ? "" : ' data-on=""'} x="4" y="2.2" width="14" height="3.4" rx="0.7"/></g>`);
  return out.join("");
}

/** The bolt, retracted by `open` (0 locked, 1 open). Only the part outside the housing is drawn. */
export function boltSvg(open = 0) {
  const x0 = LOCK.x + LOCK.w - 6 - BOLT_TRAVEL * open;
  const plan = { x: Math.max(x0, LOCK.x + LOCK.w), y: LOCK.y + 3.5, w: 0, d: 5, r: 0.2 };
  plan.w = x0 + 20 - plan.x;
  if (plan.w < 0.2) return "";
  return S(k.slabOf(plan, 3, 4.5, P, 2, 0.3), { tone: "hi", crease: "lo" });
}

// ---------------------------------------------------------------- moving parts

/** The card at plan x, with `facts` (array of booleans: punched or not). Everything behind the hopper face is not drawn. */
export function cardSvg(x, facts, { lit = -1 } = {}) {
  const x0 = Math.max(x + CARD.x, HOPPER_FACE);
  const x1 = x + CARD.x + CARD.w;
  if (x1 - x0 < 0.2) return "";
  const cut = x0 > x + CARD.x;
  const plan = { x: x0, y: CARD.y, w: x1 - x0, d: CARD.d, r: cut ? 0.2 : CARD.r };
  const out = [S(k.slabOf(plan, CARD_Z, CARD_T, P, 3, 0.3), { tone: "hi", crease: "lo" })];
  // Rule lines: the text of the instruction file.
  for (const [u, v, length] of [[-20, -16, 20], [-20, -11, 16], [-20, -6, 22], [-20, -1, 13], [-20, 4, 19], [-20, 9, 15], [-20, 14, 21]]) {
    const a = x + u;
    const b = Math.min(a + length, x + HOLE_X - 4);
    if (b > HOPPER_FACE + 0.5 && b - Math.max(a, HOPPER_FACE) > 1) out.push(L(k.lineOnTop([Math.max(a, HOPPER_FACE), v], [b, v], CARD_TOP, P), { tone: "lo", free: true }));
  }
  if (x + HOLE_X > HOPPER_FACE + HOLE_R) {
    HOLES.forEach((y, index) => {
      if (facts[index]) out.push(`<path class="card-hole" d="${k.ring(x + HOLE_X, y, HOLE_R, CARD_TOP, P, 18)}"/>`);
      else out.push(L(k.ring(x + HOLE_X, y, HOLE_R, CARD_TOP, P, 18), { tone: index === lit ? "lit" : "faint", dotted: index !== lit }));
    });
  }
  // Corner notch mark: which way round the card goes.
  if (x + CARD.x + CARD.w - 6 > HOPPER_FACE) out.push(L(k.lineOnTop([x + CARD.x + CARD.w - 6, CARD.y], [x + CARD.x + CARD.w, CARD.y + 6], CARD_TOP, P), { tone: "lo" }));
  return out.join("");
}

const headBottom = (tip) => tip + PIN_LEN;
/** Lower post segment (plate to the ear), drawn before the ear. */
export function postLower(y, tip) {
  return S(k.cylinder(POST_X, y, 5, 0, 3, P, 24, 0.3), { tone: "mid" }) + S(k.cylinder(POST_X, y, POST_R, 3, headBottom(tip) - 3, P, 22), { tone: "mid", crease: "none" });
}
export function postUpper(y, tip) {
  const top = headBottom(tip) + HEAD_H;
  return S(k.cylinder(POST_X, y, POST_R, top, BRIDGE_Z - top, P, 22), { tone: "mid", crease: "none" });
}
export function earSvg(y, tip) {
  const z = headBottom(tip);
  return S(k.cylinder(POST_X, y, 5.2, z, HEAD_H, P, 28, 0.4), { tone: "mid" }) + L(k.ring(POST_X, y, POST_R + 0.5, z + HEAD_H, P, 20), { tone: "lo" });
}
export function headSvg(tip, blocked) {
  const z = headBottom(tip);
  const plan = { x: POST_X - 6, y: POSTS[0] + 2.5, w: 12, d: POSTS[1] - POSTS[0] - 5, r: 1.5 };
  const out = [];
  // Pins first, far to near, so the head hides their tops; the one that hit the card is lit.
  const pins = HOLES.map((y, index) => ({ y, index })).sort((a, b) => depth([POST_X, a.y]) - depth([POST_X, b.y]));
  const tipShown = Math.max(tip, CARD_TOP);
  for (const { y, index } of pins) out.push(S(k.cylinder(POST_X, y, PIN_R, tipShown, z + 0.5 - tipShown, P, 14), { tone: "hi", crease: "none", lit: blocked === index }));
  out.push(S(k.slabOf(plan, z, HEAD_H, P, 3, 0.5), { tone: "hi", crease: "lo", inner: L(k.sideSeam(plan, z + 3, P, 3), { tone: "faint" }) }));
  out.push(D([-24, 24].map((y) => at([POST_X, y, z + HEAD_H])), { size: 0.45 }));
  out.push(L(HOLES.map((y) => k.ring(POST_X, y, PIN_R + 0.7, z + HEAD_H, P, 14)).join(""), { tone: "lo" }));
  return out.join("");
}

function bridge() {
  const plan = { x: POST_X - 7, y: POSTS[0] - 6, w: 14, d: POSTS[1] - POSTS[0] + 12, r: 2 };
  const out = [S(k.slabOf(plan, BRIDGE_Z, 7, P, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(plan, BRIDGE_Z + 2.4, P, 3), { tone: "faint" }) })];
  out.push(L(POSTS.map((y) => k.ring(POST_X, y, POST_R + 1.2, BRIDGE_Z + 7, P, 18)).join(""), { tone: "lo" }));
  out.push(D(POSTS.map((y) => at([POST_X, y, BRIDGE_Z + 7])), { size: 0.5 }));
  // Actuator on the bridge: a can with a cap and a fitting.
  out.push(S(k.cylinder(POST_X, 0, 7, BRIDGE_Z + 7, 1.6, P, 32), { tone: "mid" }));
  out.push(S(k.cylinder(POST_X, 0, 5.6, BRIDGE_Z + 8.6, 10, P, 32, 0.4), { tone: "mid", inner: L(k.sideArc(POST_X, 0, 5.6, BRIDGE_Z + 13, P, 24), { tone: "faint" }) }));
  out.push(S(k.cylinder(POST_X, 0, 2.2, BRIDGE_Z + 18.6, 2.4, P, 18), { tone: "mid" }));
  out.push(L(k.knurl(POST_X, 0, 2.2, BRIDGE_Z + 19, BRIDGE_Z + 20.6, 10, P), { tone: "lo" }));
  return out.join("");
}

/** The push rod from the actuator down to the head, through the bridge. */
export function rodSvg(tip) {
  const top = headBottom(tip) + HEAD_H;
  return S(k.cylinder(POST_X, 0, 1.7, top, BRIDGE_Z - top, P, 16), { tone: "hi", crease: "none" });
}


export const LABEL =
  "A punched-card reader. A card slides out of a hopper onto rails; four pins on a press head come down over its column of holes. When every hole is there, the head bottoms out and a bolt at the front slides out of its keeper. When a hole is missing, that pin stops on the card, the head cannot reach the bottom, and the bolt stays locked.";

export const REST_POSE = { x: 0, facts: [true, false, true, true], tip: TIP_BLOCKED, open: 0, blocked: 1 };

export function figure(pose = REST_POSE) {
  const tip = pose.tip;
  const body = [
    base(),
    hopper(),
    rails(),
    `<g data-part="post-far-lower">${postLower(POSTS[0], tip)}</g>`,
    `<g data-slot="card">${cardSvg(pose.x, pose.facts, { lit: pose.blocked })}</g>`,
    `<g data-part="ear-far">${earSvg(POSTS[0], tip)}</g>`,
    `<g data-part="post-far-upper">${postUpper(POSTS[0], tip)}</g>`,
    `<g data-part="head">${headSvg(tip, pose.blocked)}</g>`,
    `<g data-part="rod">${rodSvg(tip)}</g>`,
    `<g data-part="post-near-lower">${postLower(POSTS[1], tip)}</g>`,
    `<g data-part="ear-near">${earSvg(POSTS[1], tip)}</g>`,
    `<g data-part="post-near-upper">${postUpper(POSTS[1], tip)}</g>`,
    bridge(),
    outbox(),
    lock(pose.open),
  ];
  return k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body });
}

export { k, POSTS };
