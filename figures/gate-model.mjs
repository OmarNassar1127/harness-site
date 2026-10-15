// Fig 1: the completion gate, drawn as an inspection gate on a rail bench.
// One module for geometry and motion: the Node build draws the static art with it,
// and the page's live script rebuilds the moving parts with the same functions.
import * as k from "../vendor/anatomy/iso-kit.mjs";

export const WIDTH = 600;
export const HEIGHT = 400;
export const AZIMUTH = 38;

// Base plate on four feet.
export const PLATE = { x: -158, y: -66, w: 316, d: 132, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;

// Track: two rails between the two lift pits.
export const RAILS = [-17, 12]; // plan y of each rail, depth 5
const RAIL_H = 3;
const RAIL_X = [-78.8, 78.8];

// Lift pits. FAR brings replies up from the agent; NEAR takes passed replies down to you.
export const PIT_FAR = { x: -140, y: -27, w: 58, d: 54, r: 2 };
export const PIT_NEAR = { x: 82, y: -27, w: 58, d: 54, r: 2 };
const RIM_W = 3.2;
const RIM_H = 1.4;
export const PIT_DEPTH = 34;
export const FAR_X = PIT_FAR.x + PIT_FAR.w / 2; // -111
export const NEAR_X = PIT_NEAR.x + PIT_NEAR.w / 2; // 111

// The reply: a carriage with a block on it. Each check is a pin in a socket on top.
export const CARRIAGE = { x: -26, y: -22, w: 52, d: 44, r: 3 };
const CAR_Z = 3;
const CAR_H = 5;
export const BLOCK = { x: -18, y: -15, w: 36, d: 30, r: 2 };
export const TOP = CAR_Z + CAR_H + 12; // 20, top of the reply block
export const PINS = [-10.5, -3.5, 3.5, 10.5]; // pin y positions, at x = 0 on the block
const PIN_R = 1.7;
const SOCKET_R = 2.4;
export const PIN_UP = 3.5;
const SOCKET_DEPTH = 9;

// The gate: two cheeks, a beam, a barrier that lifts into the beam, four feelers.
export const BX = 26.5; // barrier, x from BX to BX + 3
const CHEEK_X = -8;
const CHEEK_W = 44;
const CHEEK_H = 58;
export const CHEEK_FAR = { x: CHEEK_X, y: -40, w: CHEEK_W, d: 7, r: 1.5 };
export const CHEEK_NEAR = { x: CHEEK_X, y: 33, w: CHEEK_W, d: 7, r: 1.5 };
export const BEAM = { x: CHEEK_X - 2, y: -42, w: 26, d: 84, r: 2 };
const BEAM_Z = CHEEK_H;
export const BEAM_TOP = BEAM_Z + 8;
export const BARRIER = { x: BX, y: -33.5, w: 3, d: 67, r: 0.5 };
const BARRIER_Z = 3.5;
const BARRIER_H = 19;
export const BARRIER_LIFT = CHEEK_H - 1.5 - (BARRIER_Z + BARRIER_H); // rises in the cheek grooves to just under their tops
const BUSH_TOP = BEAM_TOP + 3.5;
const ROD_R = 1.05;
const CAP_R = 2.4;
const CAP_H = 4.5;
export const FEELER_LEN = 60; // tip to cap bottom
export const TIP_UP = 28;
export const TIP_ON_PIN = TOP + PIN_UP;
export const TIP_DEEP = TOP - SOCKET_DEPTH;

// Dial gauge on the near cheek: reads the deepest feeler drop.
export const DIAL = { u: 15, v: 22, r: 8.5 }; // face coordinates on the cheek's outer face
export const DIAL_SPAN = 1.5 * Math.PI; // a full drop of 19 units turns the needle 270 degrees
export const DROP_FULL = TIP_UP - TIP_DEEP;

export const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [0, 0, TIP_UP + FEELER_LEN + CAP_H], [BEAM.x, BEAM.y, BEAM_TOP], [BEAM.x + BEAM.w, BEAM.y + BEAM.d, BEAM_TOP]],
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

// ---------------------------------------------------------------- static art

function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 22))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid", inner: L(k.sideSeam(PLATE, -PLATE_H / 2, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // Ruler strip along the track, ticks every 4 with a major every 5th.
  const strip = { x: -76, y: 44, w: 152, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }));
  // Label plate with three rule lines and an engraved mark.
  const label = { x: 94, y: 38, w: 44, d: 18, r: 2 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 4), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(label, 1.6), 0.8, P), { tone: "faint" }));
  for (const [y, length] of [[45, 26], [48.5, 18], [52, 22]]) out.push(L(k.lineOnTop([label.x + 5, y], [label.x + 5 + length, y], 0.8, P), { tone: "lo", free: true }));
  out.push(D([at([label.x + 3, label.y + 3, 0.8]), at([label.x + label.w - 3, label.y + label.d - 3, 0.8])], { size: 0.45 }));
  out.push(k.faceTextSvg(k.topMatrix([label.x + 5, label.y + 5.4], 0.8, P, "x"), "GATE", { size: 3.2, tone: "mid" }));
  return out.join("");
}

function rails() {
  const out = [];
  for (const y of RAILS) {
    out.push(S(k.slabOf({ x: RAIL_X[0], y, w: RAIL_X[1] - RAIL_X[0], d: 5, r: 0.8 }, 0, RAIL_H, P, 3, 0.4), { tone: "mid" }));
  }
  // Rail clamps on the outer side of each rail, each held by one screw.
  const clamps = [];
  for (let x = -70; x <= 70; x += 28) {
    clamps.push([x, RAILS[0] - 3.6, RAILS[0] - 3.6 + 1.8], [x, RAILS[1] + 5.6, RAILS[1] + 5.6 + 1.8]);
  }
  for (const [x, y] of byDepth(clamps.map(([x, y]) => [x, y]))) {
    out.push(S(k.slabOf({ x: x - 3, y, w: 6, d: 3.6, r: 0.6 }, 0, 2.2, P, 2), { tone: "mid", crease: "faint" }));
    out.push(D([at([x, y + 1.8, 2.2])], { size: 0.4 }));
  }
  return out.join("");
}

const holePath = (pit) => k.planOutline(pit, 0, P);

function pitHole(pit, id) {
  // The hole, its two far inner walls (the only ones the camera sees), and a clip for what is inside.
  const ring = k.ringOf(pit, 4);
  const [vx, vy] = k.towardViewer(P);
  const walls = [];
  for (let index = 0; index < ring.length; index++) {
    const a = ring[index];
    const b = ring[(index + 1) % ring.length];
    // Outward normal of this edge (ring runs counter-clockwise in plan): inner faces see the viewer when the outward normal points away.
    const nx = b[1] - a[1];
    const ny = -(b[0] - a[0]);
    if (nx * vx + ny * vy >= -1e-9) continue;
    const quad = [at([a[0], a[1], 0]), at([b[0], b[1], 0]), at([b[0], b[1], -PIT_DEPTH]), at([a[0], a[1], -PIT_DEPTH])];
    const facing = Math.abs(nx) > Math.abs(ny) ? "x" : "y";
    walls.push(`<path class="pit-wall" data-face="${facing}" d="${k.pathOf(quad, true)}"/>`);
  }
  return `<clipPath id="${id}"><path d="${holePath(pit)}"/></clipPath><g clip-path="url(#${id})"><path class="pit-floor" d="${holePath(pit)}"/>${walls.join("")}<g data-part="in-${id}">${platformSvg(pit, 0)}</g></g>`;
}

function rimBars(pit, side) {
  // Four bars frame each hole. "far" draws the two behind the pit, "near" the two in front of it.
  const bars = {
    west: { x: pit.x - RIM_W, y: pit.y - RIM_W, w: RIM_W, d: pit.d + RIM_W * 2, r: 0.6 },
    east: { x: pit.x + pit.w, y: pit.y - RIM_W, w: RIM_W, d: pit.d + RIM_W * 2, r: 0.6 },
    north: { x: pit.x, y: pit.y - RIM_W, w: pit.w, d: RIM_W, r: 0.4 },
    south: { x: pit.x, y: pit.y + pit.d, w: pit.w, d: RIM_W, r: 0.4 },
  };
  const pick = side === "far" ? ["west", "north"] : ["south", "east"];
  return pick
    .map((name) => {
      const plan = bars[name];
      const screws = name === "west" || name === "east" ? [plan.y + 4, plan.y + plan.d - 4].map((y) => at([plan.x + RIM_W / 2, y, RIM_H])) : [];
      return S(k.slabOf(plan, 0, RIM_H, P, 2, 0.3), { tone: "mid" }) + (screws.length ? D(screws, { size: 0.4 }) : "");
    })
    .join("");
}

function cheek(plan, near, needle) {
  const out = [];
  const outerY = near ? plan.y + plan.d : plan.y;
  // Foot flange on the outer side, two screws.
  const foot = near ? { x: plan.x - 2, y: plan.y + plan.d - 1, w: plan.w + 4, d: 7, r: 1.2 } : { x: plan.x - 2, y: plan.y - 6, w: plan.w + 4, d: 7, r: 1.2 };
  const footSvg = S(k.slabOf(foot, 0, 3, P, 3, 0.4), { tone: "mid" }) + D([plan.x + 3, plan.x + plan.w - 3].map((x) => at([x, foot.y + foot.d / 2 + (near ? 1 : -1), 3])), { size: 0.45 });
  if (!near) out.push(footSvg);
  // The cheek itself, with a seam a third of the way up and the barrier groove on the inner face.
  const inner = [L(k.sideSeam(plan, 16, P, 3), { tone: "faint" })];
  if (!near) {
    const y = plan.y + plan.d;
    inner.push(L(k.segment([BX - 0.6, y, 0], [BX - 0.6, y, CHEEK_H], P) + k.segment([BX + 3.6, y, 0], [BX + 3.6, y, CHEEK_H], P), { tone: "lo" }));
  }
  out.push(S(k.slabOf(plan, 0, CHEEK_H, P, 3, 0.6), { tone: "mid", inner: inner.join("") }));
  if (near) out.push(dialFace(outerY, needle), footSvg);
  return out.join("");
}

function dialFace(y, needle) {
  // A gauge drawn in the plane of the near cheek's outer face. Face coordinates: u along +x from the cheek's start, v down from its top.
  const M = k.sideMatrix([CHEEK_X, y], CHEEK_H, P, "left");
  const { u, v, r } = DIAL;
  const ticks = [];
  for (let index = 0; index <= 20; index++) {
    const angle = -DIAL_SPAN / 2 + (index / 20) * DIAL_SPAN;
    const big = index % 5 === 0;
    const r0 = r - (big ? 2.4 : 1.3);
    const sx = Math.sin(angle);
    const sy = -Math.cos(angle);
    ticks.push(`M${(u + sx * r0).toFixed(2)} ${(v + sy * r0).toFixed(2)}L${(u + sx * (r - 0.3)).toFixed(2)} ${(v + sy * (r - 0.3)).toFixed(2)}`);
  }
  const plate = { u0: 4, v0: 41, u1: 40, v1: 51 };
  return `<g transform="${M}" class="dial">
<circle class="dial-bezel" cx="${u}" cy="${v}" r="${r + 1.6}"/>
<circle class="dial-face" cx="${u}" cy="${v}" r="${r}"/>
<path class="iso-line" data-tone="lo" d="${ticks.filter((_, i) => i % 5).join("")}"/>
<path class="iso-line" data-tone="mid" d="${ticks.filter((_, i) => i % 5 === 0).join("")}"/>
<g data-part="needle" transform="rotate(${((needle ?? -DIAL_SPAN / 2) * 180) / Math.PI} ${u} ${v})"><path class="iso-line" data-tone="lit" data-free="end" style="stroke-width:1" d="M${u} ${v + 2.2}L${u} ${v - r + 1.6}"/></g>
<circle class="dial-hub" cx="${u}" cy="${v}" r="1"/>
<rect class="dial-plate" x="${plate.u0}" y="${plate.v0}" width="${plate.u1 - plate.u0}" height="${plate.v1 - plate.v0}" rx="1"/>
<path class="iso-line" data-tone="lo" data-free="" d="M${plate.u0 + 3} ${plate.v0 + 3.3}h18M${plate.u0 + 3} ${plate.v0 + 6.6}h11"/>
<circle class="dial-screw" cx="${plate.u1 - 3}" cy="${plate.v0 + 5}" r=".5"/>
<circle class="dial-screw" cx="${CHEEK_W - 3}" cy="3" r=".5"/><circle class="dial-screw" cx="3" cy="3" r=".5"/>
</g>`;
}

function beam() {
  const out = [];
  const seam = L(k.sideSeam(BEAM, BEAM_Z + 4, P, 3), { tone: "faint" });
  out.push(S(k.slabOf(BEAM, BEAM_Z, BEAM_TOP - BEAM_Z, P, 3, 0.6), { tone: "mid", inner: seam }));
  // Mounting screws into the cheeks.
  const screws = [
    [BEAM.x + 5, CHEEK_FAR.y + 3.5],
    [BEAM.x + BEAM.w - 5, CHEEK_FAR.y + 3.5],
    [BEAM.x + 5, CHEEK_NEAR.y + 3.5],
    [BEAM.x + BEAM.w - 5, CHEEK_NEAR.y + 3.5],
  ];
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 1.6, BEAM_TOP, P, 14)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, BEAM_TOP])), { size: 0.45 }));
  return out.join("");
}

function bushings() {
  return PINS.map((y) => [0, y])
    .sort((a, b) => depth(a) - depth(b))
    .map(([x, y]) => S(k.cylinder(x, y, 2.7, BEAM_TOP, BUSH_TOP - BEAM_TOP, P, 24, 0.3), { tone: "mid" }) + L(k.ring(x, y, 1.5, BUSH_TOP, P, 16), { tone: "lo" }))
    .join("");
}

function lamp(on = false) {
  const [x, y] = [27, 36.5];
  const z = CHEEK_H;
  return [
    S(k.cylinder(x, y, 3.2, z, 1.4, P, 24), { tone: "mid" }),
    `<g class="lamp" data-part="lamp"${on ? " data-on" : ""}>${S(k.cylinder(x, y, 2.4, z + 1.4, 3.6, P, 24, 0.3), { tone: "hi" })}</g>`,
    S(k.cylinder(x, y, 2.8, z + 5, 0.9, P, 24), { tone: "mid" }),
    D([at([x, y, z + 5.9])], { size: 0.5, tone: "mid" }),
    D([at([20, 36.5, z]), at([20, -36.5, z]), at([33, -36.5, z])], { size: 0.45 }),
  ].join("");
}

// A tally counter that counts shipped replies, its digits in a window on its front face.
export const TALLY = { x: 96, y: -60, w: 30, d: 15, r: 2 };
const TALLY_H = 13;
function tally() {
  const out = [];
  out.push(S(k.slabOf(TALLY, 0, 1.4, P, 3, 0.3), { tone: "mid" }));
  const body = k.insetPlan(TALLY, 1.5);
  out.push(S(k.slabOf(body, 1.4, TALLY_H - 1.4, P, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(body, 9.5, P, 3), { tone: "faint" }) }));
  // Reset knob on top, knurled.
  const knob = [body.x + body.w - 6, body.y + body.d / 2];
  out.push(S(k.cylinder(knob[0], knob[1], 2.6, TALLY_H, 3, P, 20), { tone: "mid" }));
  out.push(L(k.knurl(knob[0], knob[1], 2.6, TALLY_H + 0.4, TALLY_H + 2.6, 14, P), { tone: "lo" }));
  out.push(D([at([body.x + 3, body.y + 3, TALLY_H]), at([body.x + 3, body.y + body.d - 3, TALLY_H])], { size: 0.4 }));
  // Window on the +y face: face coordinates u along +x from the body's start, v down from the top.
  const y = body.y + body.d;
  const M = k.sideMatrix([body.x, y], TALLY_H, P, "left");
  out.push(`<g transform="${M}"><rect class="dial-plate" x="4.5" y="3" width="18" height="6.4" rx="0.8"/><text data-part="tally" class="tally-digits" x="13.5" y="7.95" text-anchor="middle">0000</text></g>`);
  return out.join("");
}

// Spare pins in a tray: the checks the agent adds when a reply is sent back.
const TRAY = { x: -132, y: -60, w: 40, d: 18, r: 2 };
function tray() {
  const out = [S(k.slabOf(TRAY, 0, 3, P, 3, 0.4), { tone: "mid" })];
  out.push(L(k.planOutline(k.insetPlan(TRAY, 2), 3, P, 3), { tone: "faint" }));
  const spots = [];
  for (let col = 0; col < 6; col++) for (let row = 0; row < 2; row++) spots.push([TRAY.x + 7 + col * 5.2, TRAY.y + 6 + row * 6, (col * 2 + row) % 5 !== 3]);
  for (const [x, y, full] of spots.sort((a, b) => depth(a) - depth(b))) {
    out.push(L(k.ring(x, y, 1.6, 3, P, 14), { tone: "lo" }));
    if (full) out.push(S(k.cylinder(x, y, 1.15, 3, 3.2, P, 14), { tone: "hi", crease: "lo" }));
  }
  return out.join("");
}

// ---------------------------------------------------------------- moving parts

const clipZ = (z, h) => {
  const z0 = Math.max(z, 0);
  const z1 = z + h;
  return z1 - z0 > 0.05 ? [z0, z1 - z0] : null;
};

/** The reply on its carriage, at plan position x and lift height dz, with `seated` pins (array of booleans).
 *  `floor` clips everything below z = 0, for the copy that stands above the plate. */
export function replySvg(x, dz, seated, { floor = true, lit = -1 } = {}) {
  const out = [];
  const lift = (z, h) => (floor ? clipZ(z + dz, h) : [z + dz, h]);
  const shift = (plan) => ({ ...plan, x: plan.x + x });
  const car = lift(CAR_Z, CAR_H);
  if (car) {
    out.push(`<path class="iso-halo" d="${k.haloOf(k.insetPlan(shift(CARRIAGE), 3), car[0], 0.1, P)}" style="filter:blur(4px)"/>`);
    const seam = car[0] <= CAR_Z + dz + 0.01 && car[1] > 2.4 ? L(k.sideSeam(shift(CARRIAGE), CAR_Z + dz + 2.2, P, 5), { tone: "faint" }) : "";
    out.push(S(k.slabOf(shift(CARRIAGE), car[0], car[1], P, 5, 0.6), { tone: "mid", inner: seam }));
    if (car[0] + car[1] >= CAR_Z + CAR_H + dz - 0.01) {
      out.push(D([-20, -10, 10, 20].map((u) => at([x + u, CARRIAGE.y + CARRIAGE.d - 2.4, CAR_Z + CAR_H + dz])), { size: 0.4, tone: "lo" }));
    }
  }
  // Four corner bushings on the carriage.
  const bush = lift(CAR_Z + CAR_H, 3);
  if (bush) {
    const spots = [[-25, -21], [19, -21], [-25, 16], [19, 16]].map(([u, v]) => [x + u, v]);
    for (const [u, v] of byDepth(spots)) out.push(S(k.slabOf({ x: u, y: v, w: 6, d: 5, r: 1 }, bush[0], bush[1], P, 2), { tone: "mid", crease: "faint" }));
  }
  const block = lift(CAR_Z + CAR_H, 12);
  if (block) {
    const whole = block[0] <= CAR_Z + CAR_H + dz + 0.01;
    const seam = whole ? L(k.sideSeam(shift(BLOCK), CAR_Z + CAR_H + dz + 3, P, 3), { tone: "faint" }) : "";
    out.push(S(k.slabOf(shift(BLOCK), block[0], block[1], P, 3, 0.5), { tone: "hi", crease: "lo", inner: seam }));
    const top = TOP + dz;
    if (top > 0) {
      // Rule lines: the reply's text, left and right of the check row.
      for (const [u, v, length] of [[-15, -9, 10], [-15, -3, 7], [-15, 3, 9], [-15, 9, 5], [6, -9, 9], [6, -3, 10], [6, 3, 6], [6, 9, 8]]) {
        out.push(L(k.lineOnTop([x + u, v], [x + u + length, v], top, P), { tone: "lo", free: true }));
      }
      // Sockets and pins.
      PINS.forEach((y) => out.push(L(k.ring(x, y, SOCKET_R, top, P, 20), { tone: "lo" })));
      PINS.forEach((y, index) => {
        if (seated[index]) {
          out.push(S(k.cylinder(x, y, PIN_R, top, PIN_UP, P, 18), { tone: "hi", crease: "lo" }));
          out.push(L(k.ring(x, y, 0.7, top + PIN_UP, P, 10), { tone: "mid" }));
        } else {
          out.push(`<path class="socket-void${index === lit ? " is-lit" : ""}" d="${k.ring(x, y, SOCKET_R - 0.35, top, P, 20)}"/>`);
        }
      });
    }
  }
  return out.join("");
}

/** The lift platform of a pit, its top at height dz (0 is flush with the plate). */
export function platformSvg(pit, dz, { floor = false } = {}) {
  const plan = k.insetPlan(pit, 1.6);
  const out = [];
  const slab = floor ? clipZ(dz - 4, 4) : [dz - 4, 4];
  if (slab) out.push(S(k.slabOf(plan, slab[0], slab[1], P, 3, 0.3), { tone: "mid" }));
  const stubs = floor ? clipZ(dz, RAIL_H) : [dz, RAIL_H];
  if (stubs) {
    for (const y of RAILS) out.push(S(k.slabOf({ x: plan.x + 2, y, w: plan.w - 4, d: 5, r: 0.8 }, stubs[0], stubs[1], P, 3, 0.3), { tone: "mid" }));
  }
  return out.join("");
}

/** One feeler with its tip at height tip (lower rod, then the part above the bushing and its cap). */
export function feelerLower(y, tip) {
  return S(k.cylinder(0, y, ROD_R, tip, BEAM_Z - tip, P, 14), { tone: "hi", crease: "none" });
}
export function feelerUpper(y, tip, lit) {
  const capZ = tip + FEELER_LEN;
  return (
    S(k.cylinder(0, y, ROD_R, BUSH_TOP, Math.max(0.05, capZ - BUSH_TOP), P, 14), { tone: "hi", crease: "none", lit }) +
    S(k.cylinder(0, y, CAP_R, capZ, CAP_H, P, 22, 0.3), { tone: "hi", crease: "lo", lit }) +
    L(k.knurl(0, y, CAP_R, capZ + 0.6, capZ + CAP_H - 0.6, 16, P), { tone: "lo" })
  );
}

/** Where a feeler rests when it comes down on a reply whose pin is seated or not. */
export const restOf = (seated) => (seated ? TIP_ON_PIN : TIP_DEEP);
/** The visible part of a feeler that went into an empty socket stops at the block top. */
export const visibleTip = (tip) => Math.max(tip, TOP);

export function barrierSvg() {
  // A window frame: bottom rail, two stiles, two bars, top rail. It blocks the carriage and lets you see the reply through it.
  const parts = [];
  const rail = (z, h) => S(k.slabOf({ ...BARRIER }, z, h, P, 2, 0.3), { tone: "hi", crease: "lo" });
  const post = (y, d) => ({ y, svg: S(k.slabOf({ x: BX, y, w: 3, d, r: 0.5 }, BARRIER_Z + 5.5, BARRIER_H - 9, P, 2), { tone: "hi", crease: "lo" }) });
  parts.push(rail(BARRIER_Z, 5.5));
  const posts = [post(-33.5, 5.5), post(-18.5, 2), post(16.5, 2), post(28, 5.5)].sort((a, b) => depth([BX, a.y]) - depth([BX, b.y]));
  posts.forEach((item) => parts.push(item.svg));
  parts.push(rail(BARRIER_Z + BARRIER_H - 3.5, 3.5));
  parts.push(D([-26, -6, 6, 26].map((y) => at([BX + 3, y, BARRIER_Z + 2.75])), { size: 0.45, tone: "mid" }));
  return parts.join("");
}

export const needleAngle = (drop) => -DIAL_SPAN / 2 + Math.max(0, Math.min(1, drop / DROP_FULL)) * DIAL_SPAN;

// ---------------------------------------------------------------- the whole figure

export const LABEL =
  "An inspection gate on a rail bench. A reply rides up from a lift at the back, carrying one pin for each check it has passed. At the gate four feelers drop onto the pins. If every pin is seated, the barrier lifts and the reply rolls forward to the lift at the front. If a pin is missing, its feeler drops into the empty socket, the lamp lights, and the reply is sent back.";

/** Static SVG with empty slots the live script fills. `pose` draws a still frame for the static page. */
export function figure(pose) {
  const reply = (where) => (pose && pose.slot === where ? replySvg(pose.x, 0, pose.seated, { lit: pose.lit }) : "");
  const tips = pose ? pose.tips : PINS.map(() => TIP_UP);
  const feelers = PINS.map((y, index) => ({ y, index })).sort((a, b) => depth([0, a.y]) - depth([0, b.y]));
  const body = [
    base(),
    tally(),
    tray(),
    rails(),
    pitHole(PIT_FAR, "pit-far"),
    pitHole(PIT_NEAR, "pit-near"),
    rimBars(PIT_FAR, "far"),
    rimBars(PIT_NEAR, "far"),
    `<g data-part="lift-far">${platformSvg(PIT_FAR, 0, { floor: true })}</g>`,
    `<g data-part="lift-near">${platformSvg(PIT_NEAR, 0, { floor: true })}</g>`,
    `<g data-slot="far">${reply("far")}</g>`,
    rimBars(PIT_FAR, "near"),
    cheek(CHEEK_FAR, false),
    `<g data-slot="track">${reply("track")}</g>`,
    `<g data-part="barrier"${pose && pose.open ? ` transform="${k.translateAlong(P, [0, 0, BARRIER_LIFT])}"` : ""}>${barrierSvg()}</g>`,
    `<g data-slot="beyond">${reply("beyond")}</g>`,
    `<g data-part="feelers-lower">${feelers.map(({ y, index }) => `<g data-feeler="${index}">${feelerLower(y, visibleTip(tips[index]))}</g>`).join("")}</g>`,
    cheek(CHEEK_NEAR, true, pose ? needleAngle(TIP_UP - Math.min(...tips)) : undefined),
    beam(),
    bushings(),
    `<g data-part="feelers-upper">${feelers.map(({ y, index }) => `<g data-feeler="${index}">${feelerUpper(y, tips[index], pose ? pose.lit === index : false)}</g>`).join("")}</g>`,
    lamp(pose ? pose.lamp : false),
    rimBars(PIT_NEAR, "near"),
  ];
  return k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body });
}

export { k };
