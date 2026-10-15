// Live behaviour of Fig 1. Geometry comes from the same module the build uses.
import * as G from "../../figures/gate-model.mjs";

const { k, P } = G;
const D = G.PIT_DEPTH;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** Starting pose shared with the static markup: a reply held at the gate with check 3 missing. */
export const HELD_POSE = {
  slot: "track",
  x: 0,
  seated: [true, true, false, true],
  tips: [G.TIP_ON_PIN, G.TIP_ON_PIN, G.TIP_DEEP, G.TIP_ON_PIN],
  lit: 2,
  lamp: true,
};

export function mountGate(root, text) {
  const svg = root.querySelector("svg");
  const stage = root.querySelector(".iso-stage");
  const q = (sel) => svg.querySelector(sel);
  const slots = { far: q('[data-slot="far"]'), track: q('[data-slot="track"]'), beyond: q('[data-slot="beyond"]') };
  const inPit = { far: q('[data-part="in-pit-far"]'), near: q('[data-part="in-pit-near"]') };
  const liftEl = { far: q('[data-part="lift-far"]'), near: q('[data-part="lift-near"]') };
  const barrier = q('[data-part="barrier"]');
  const lower = {};
  const upper = {};
  q('[data-part="feelers-lower"]').querySelectorAll("[data-feeler]").forEach((el) => (lower[el.dataset.feeler] = el));
  q('[data-part="feelers-upper"]').querySelectorAll("[data-feeler]").forEach((el) => (upper[el.dataset.feeler] = el));
  const lamp = q('[data-part="lamp"]');
  const needle = q('[data-part="needle"]');
  const tally = q('[data-part="tally"]');
  const readout = root.querySelector("[data-readout]");
  const announce = root.querySelector("[data-announce]");
  const still = matchMedia("(prefers-reduced-motion: reduce)");

  // Replace whatever the static markup put in the slots with one live reply group.
  Object.values(slots).forEach((slot) => (slot.innerHTML = ""));
  const reply = document.createElementNS("http://www.w3.org/2000/svg", "g");

  const S = {
    phase: "read",
    clock: 0,
    n: 1,
    x: 0,
    dz: 0,
    on: null, // which lift carries the reply: "far", "near" or null
    lift: { far: 0, near: 0 },
    seated: [...HELD_POSE.seated],
    tips: [...HELD_POSE.tips],
    vel: [0, 0, 0, 0],
    target: [...HELD_POSE.tips],
    barrier: 0,
    lamp: true,
    shipped: 0,
    lit: 2,
    missing: 2,
    pulls: 0,
  };

  const seatedCount = () => S.seated.filter(Boolean).length;
  const firstMissing = () => S.seated.findIndex((v) => !v);

  // ------------------------------------------------------------ drawing, with caches
  const cache = new Map();
  const put = (el, key, html) => {
    if (cache.get(el) === key) return;
    cache.set(el, key);
    el.innerHTML = html;
  };

  function draw() {
    // The reply above the plate, in the slot where it sits in depth.
    const slot = S.on === "far" ? "far" : S.on === "near" || S.x > 34 ? "beyond" : "track";
    if (reply.parentNode !== slots[slot]) slots[slot].appendChild(reply);
    const key = `${S.dz.toFixed(2)}|${S.seated.join()}|${S.lit}`;
    put(reply, key, G.replySvg(0, S.dz, S.seated, { lit: S.lit }));
    reply.setAttribute("transform", k.translateAlong(P, [S.x, 0, 0]));

    // Each lift, and what is below the plate in its pit, fading into the dark as it goes down.
    for (const side of ["far", "near"]) {
      const pit = side === "far" ? G.PIT_FAR : G.PIT_NEAR;
      const z = S.lift[side];
      put(liftEl[side], z.toFixed(2), G.platformSvg(pit, z, { floor: true }));
      const carrying = S.on === side && S.dz < 0;
      const cx = side === "far" ? G.FAR_X : G.NEAR_X;
      put(inPit[side], `${z.toFixed(2)}|${carrying ? key : ""}`, G.platformSvg(pit, z) + (carrying ? `<g transform="${k.translateAlong(P, [cx, 0, 0])}">${G.replySvg(0, S.dz, S.seated, { floor: false })}</g>` : ""));
      inPit[side].style.opacity = String(clamp(1 + z / (D * 0.85), 0, 1).toFixed(3));
    }

    // Feelers: the visible rod stops at the block top when the tip is in an empty socket.
    G.PINS.forEach((y, i) => {
      const tip = S.tips[i];
      const shown = G.visibleTip(tip);
      put(lower[i], shown.toFixed(2), G.feelerLower(y, shown));
      put(upper[i], `${tip.toFixed(2)}|${S.lit === i}`, G.feelerUpper(y, tip, S.lit === i));
    });

    barrier.setAttribute("transform", S.barrier > 0.001 ? k.translateAlong(P, [0, 0, G.BARRIER_LIFT * S.barrier]) : "");
    if (S.lamp) lamp.setAttribute("data-on", "");
    else lamp.removeAttribute("data-on");
    const drop = G.TIP_UP - Math.min(...S.tips);
    const angle = (G.needleAngle(drop) * 180) / Math.PI;
    needle.setAttribute("transform", `rotate(${angle.toFixed(2)} ${G.DIAL.u} ${G.DIAL.v})`);
    tally.textContent = String(S.shipped).padStart(4, "0");
    const line = readoutOf();
    if (readout.textContent !== line) readout.textContent = line;
  }

  function readoutOf() {
    const n = seatedCount();
    switch (S.phase) {
      case "rise":
        return text.rising(n);
      case "toGate":
        return text.toGate(n);
      case "probe":
        return text.probing;
      case "read":
      case "release":
        return n === 4 ? text.passed : text.held(n);
      case "back":
      case "sinkBack":
        return text.sentBack(S.missing + 1);
      case "rework":
        return text.rework(S.missing + 1);
      case "open":
      case "forward":
        return text.open;
      case "ship":
        return text.shipped(S.shipped + 1);
      default:
        return "";
    }
  }

  // ------------------------------------------------------------ the tour
  const DUR = { rise: 1.4, toGate: 2.1, probe: 0.9, read: 1.4, release: 0.5, back: 1.9, sinkBack: 1.2, rework: 0.7, open: 0.7, forward: 2.1, ship: 1.3 };

  function enter(phase) {
    S.phase = phase;
    S.clock = 0;
    if (phase === "probe") S.target = S.seated.map((v) => G.restOf(v));
    if (phase === "read") {
      S.missing = firstMissing();
      S.lit = S.missing;
      if (S.missing >= 0) say(text.held(seatedCount()));
      else say(text.passed);
    }
    if (phase === "release") S.target = G.PINS.map(() => G.TIP_UP);
    if (phase === "back") {
      S.lamp = true;
      say(text.sentBack(S.missing + 1));
    }
    if (phase === "rework") {
      S.seated = S.seated.map(() => true);
      S.lit = -1;
      S.lamp = false;
    }
    if (phase === "open") S.lit = -1;
    if (phase === "ship") say(text.shipped(S.shipped + 1));
  }

  function next() {
    const missing = S.seated.some((v) => !v);
    const order = {
      rise: "toGate",
      toGate: "probe",
      probe: "read",
      read: "release",
      release: missing ? "back" : "open",
      back: "sinkBack",
      sinkBack: "rework",
      rework: "rise",
      open: "forward",
      forward: "ship",
      ship: "rise",
    };
    const after = order[S.phase];
    if (S.phase === "ship") {
      // The shipped reply is gone; a new one waits at the bottom of the far lift, one check short.
      S.shipped += 1;
      S.n += 1;
      const skip = Math.floor(Math.random() * 4);
      S.seated = G.PINS.map((_, i) => i !== skip);
      for (let pull = 0; pull < S.pulls && seatedCount() > 1; pull++) S.seated[S.seated.indexOf(true)] = false;
      S.pulls = 0;
      S.on = "far";
      S.x = G.FAR_X;
      S.dz = S.lift.far = -D;
    }
    enter(after);
  }

  function step(dt, calm) {
    S.clock += dt;
    const t = clamp(S.clock / DUR[S.phase], 0, 1);
    const e = ease(t);
    switch (S.phase) {
      case "rise":
        S.on = "far";
        S.x = G.FAR_X;
        S.lift.far = S.dz = lerp(-D, 0, e);
        S.lift.near = Math.max(S.lift.near, lerp(-D, 0, ease(clamp(S.clock / 1.2, 0, 1))));
        break;
      case "toGate":
        S.on = null;
        S.dz = 0;
        S.x = lerp(G.FAR_X, 0, e);
        break;
      case "probe":
        if (S.seated.some((v) => !v) && t > 0.45) {
          S.lamp = true;
          S.lit = firstMissing();
        }
        break;
      case "back":
        S.x = lerp(0, G.FAR_X, e);
        if (t > 0.6) S.lamp = false;
        break;
      case "sinkBack":
        S.on = "far";
        S.lift.far = S.dz = lerp(0, -D, e);
        break;
      case "open":
        S.barrier = e;
        break;
      case "forward":
        S.x = lerp(0, G.NEAR_X, e);
        S.lift.far = lerp(0, -D, ease(clamp(S.clock / 1.3, 0, 1)));
        if (S.x > G.BX + 34) S.barrier = Math.max(0, S.barrier - dt / 0.7);
        break;
      case "ship":
        S.on = "near";
        S.barrier = Math.max(0, S.barrier - dt / 0.7);
        S.lift.near = S.dz = lerp(0, -D, e);
        break;
    }
    // Feelers ride a slightly underdamped spring, so they settle on a pin with a small bounce.
    let moving = false;
    for (let i = 0; i < 4; i++) {
      if (calm) {
        S.tips[i] = S.target[i];
        S.vel[i] = 0;
        continue;
      }
      for (let sub = 0; sub < 4; sub++) {
        const h = dt / 4;
        S.vel[i] += ((S.target[i] - S.tips[i]) * 260 - S.vel[i] * 21) * h;
        S.tips[i] += S.vel[i] * h;
      }
      // A feeler cannot pass through a seated pin.
      if (S.seated[i] && S.on === null && Math.abs(S.x) < 0.5 && S.tips[i] < G.TIP_ON_PIN) {
        S.tips[i] = G.TIP_ON_PIN;
        S.vel[i] = Math.abs(S.vel[i]) * 0.25;
      }
      if (Math.abs(S.target[i] - S.tips[i]) > 0.01 || Math.abs(S.vel[i]) > 0.01) moving = true;
      else S.tips[i] = S.target[i];
    }
    if (t >= 1 && !(S.phase === "probe" && moving)) next();
  }

  // ------------------------------------------------------------ loop, visibility, input
  let frame = 0;
  let last = 0;
  let visible = false;
  let quietUntil = 0;
  const tick = (now) => {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    if (now >= quietUntil) step(dt, false);
    draw();
    frame = visible && !still.matches ? requestAnimationFrame(tick) : 0;
  };
  const run = () => {
    if (!frame && visible && !still.matches) {
      last = 0;
      frame = requestAnimationFrame(tick);
    }
  };
  new IntersectionObserver(
    (entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible) run();
    },
    { rootMargin: "120px 0px" },
  ).observe(stage);

  function say(line) {
    if (announce && document.activeElement === stage) announce.textContent = line;
  }

  // Reduced motion: two still poses, held and passed, and a tap switches between them.
  function stillPose(passed) {
    S.phase = "read";
    S.on = null;
    S.dz = 0;
    if (passed) {
      S.seated = [true, true, true, true];
      S.x = 64;
      S.tips = G.PINS.map(() => G.TIP_UP);
      S.barrier = 1;
      S.lamp = false;
      S.lit = -1;
      S.phase = "forward";
    } else {
      Object.assign(S, { x: 0, seated: [...HELD_POSE.seated], tips: [...HELD_POSE.tips], barrier: 0, lamp: true, lit: 2 });
    }
    S.target = [...S.tips];
    draw();
  }

  function pull() {
    if (still.matches) {
      stillPose(S.x === 0);
      say(readoutOf());
      return;
    }
    // Before the feelers come down, take a check out of the reply on its way. Later, it applies to the next one.
    if (["rise", "toGate"].includes(S.phase) && seatedCount() > 1) {
      const options = S.seated.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
      S.seated[options[Math.floor(Math.random() * options.length)]] = false;
      say(text.pulled(seatedCount()));
    } else {
      S.pulls = Math.min(3, S.pulls + 1);
      say(text.pulledNext);
    }
    run();
  }

  stage.addEventListener("click", pull);
  stage.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      pull();
    }
  });
  stage.addEventListener("focus", () => announce && (announce.textContent = readoutOf()));
  still.addEventListener?.("change", () => (still.matches ? stillPose(false) : run()));

  draw();
  if (still.matches) stillPose(false);
  // Hold the opening pose for a moment before the tour starts.
  quietUntil = performance.now() + 1400;
}
