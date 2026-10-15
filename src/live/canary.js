// Live behaviour of Fig 2. Geometry comes from the same module the build uses.
import * as C from "../../figures/canary-model.mjs";

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export function mountCanary(root, text) {
  const svg = root.querySelector("svg");
  const stage = root.querySelector(".iso-stage");
  const q = (sel) => svg.querySelector(sel);
  const el = {
    card: q('[data-slot="card"]'),
    head: q('[data-part="head"]'),
    rod: q('[data-part="rod"]'),
    farLower: q('[data-part="post-far-lower"]'),
    farUpper: q('[data-part="post-far-upper"]'),
    farEar: q('[data-part="ear-far"]'),
    nearLower: q('[data-part="post-near-lower"]'),
    nearUpper: q('[data-part="post-near-upper"]'),
    nearEar: q('[data-part="ear-near"]'),
    bolt: q('[data-part="bolt"]'),
    window: q('[data-part="lock-window"]'),
    accepted: q('[data-part="accepted"]'),
  };
  const readout = root.querySelector("[data-readout]");
  const announce = root.querySelector("[data-announce]");
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const [FAR, NEAR] = C.POSTS;

  const S = { phase: "read", clock: 0, x: 0, facts: [...C.REST_POSE.facts], tip: C.TIP_BLOCKED, from: C.TIP_BLOCKED, open: 0, accepted: 0, edits: 0 };
  const count = () => S.facts.filter(Boolean).length;
  const blocked = () => S.facts.findIndex((v) => !v);

  const cache = new Map();
  const put = (node, key, html) => {
    if (cache.get(node) === key) return;
    cache.set(node, key);
    node.innerHTML = html;
  };

  function draw() {
    const lit = S.phase === "read" || (S.phase === "press" && S.tip <= C.TIP_BLOCKED + 0.01) ? blocked() : -1;
    put(el.card, `${S.x.toFixed(2)}|${S.facts.join()}|${lit}`, C.cardSvg(S.x, S.facts, { lit }));
    const tip = S.tip.toFixed(2);
    put(el.head, `${tip}|${lit}`, C.headSvg(S.tip, lit));
    put(el.rod, tip, C.rodSvg(S.tip));
    put(el.farLower, tip, C.postLower(FAR, S.tip));
    put(el.farUpper, tip, C.postUpper(FAR, S.tip));
    put(el.farEar, tip, C.earSvg(FAR, S.tip));
    put(el.nearLower, tip, C.postLower(NEAR, S.tip));
    put(el.nearUpper, tip, C.postUpper(NEAR, S.tip));
    put(el.nearEar, tip, C.earSvg(NEAR, S.tip));
    put(el.bolt, S.open.toFixed(3), C.boltSvg(S.open));
    if (S.open > 0.5) el.window.removeAttribute("data-on");
    else el.window.setAttribute("data-on", "");
    el.accepted.textContent = String(S.accepted).padStart(4, "0");
    const line = performance.now() < flashUntil ? flashText : readoutOf();
    if (readout.textContent !== line) readout.textContent = line;
  }

  function readoutOf() {
    switch (S.phase) {
      case "feed":
        return text.feeding(count());
      case "press":
        return text.reading;
      case "read":
      case "lift":
        return count() === 4 ? text.pass : text.fail(count());
      case "eject":
        return text.accepted(S.accepted + 1);
      case "retract":
        return text.back;
      default:
        return "";
    }
  }

  const DUR = { feed: 1.8, press: 0.8, read: 1.7, lift: 0.6, eject: 1.6, retract: 1.6 };
  function enter(phase) {
    S.phase = phase;
    S.clock = 0;
    S.from = S.tip;
    if (phase === "read") say(count() === 4 ? text.pass : text.fail(count()));
  }
  function next() {
    const pass = count() === 4;
    if (S.phase === "feed") return enter("press");
    if (S.phase === "press") return enter("read");
    if (S.phase === "read") return enter("lift");
    if (S.phase === "lift") return enter(pass ? "eject" : "retract");
    if (S.phase === "eject") {
      // An edit to the instruction file drops one fact from the next card.
      S.accepted += 1;
      S.facts = [true, true, true, true];
      S.facts[Math.floor(Math.random() * 4)] = false;
    } else if (S.phase === "retract") {
      // The file and the canary are fixed together: the next card carries every fact again.
      S.facts = [true, true, true, true];
    }
    for (let i = 0; i < S.edits && count() > 1; i++) S.facts[S.facts.indexOf(true)] = false;
    S.edits = 0;
    S.x = C.IN_HOPPER;
    enter("feed");
  }

  function step(dt) {
    S.clock += dt;
    const t = clamp(S.clock / DUR[S.phase], 0, 1);
    const e = ease(t);
    if (S.phase === "feed") S.x = lerp(C.IN_HOPPER, 0, e);
    if (S.phase === "press") {
      const target = count() === 4 ? C.TIP_FULL : C.TIP_BLOCKED;
      S.tip = lerp(S.from, target, e);
      if (count() === 4) S.open = clamp((S.tip - (C.TIP_BLOCKED - 2)) / (C.TIP_FULL - (C.TIP_BLOCKED - 2)), 0, 1);
    }
    if (S.phase === "lift") {
      S.tip = lerp(S.from, C.TIP_REST, e);
      S.open = Math.max(0, S.open - dt / 0.35);
    }
    if (S.phase === "eject") S.x = lerp(0, C.IN_OUTBOX, e);
    if (S.phase === "retract") S.x = lerp(0, C.IN_HOPPER, e);
    if (t >= 1) next();
  }

  let frame = 0;
  let last = 0;
  let visible = false;
  let quietUntil = performance.now() + 1600;
  const tick = (now) => {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    if (now >= quietUntil) step(dt);
    draw();
    frame = visible && !still.matches && !paused ? requestAnimationFrame(tick) : 0;
  };
  const run = () => {
    if (!frame && visible && !still.matches && !paused) {
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

  let flashText = "";
  let flashUntil = 0;
  function flash(line) {
    flashText = line;
    flashUntil = performance.now() + 1800;
    draw();
  }

  function say(line) {
    if (announce && document.activeElement === stage) announce.textContent = line;
  }

  function stillPose(pass) {
    S.phase = "read";
    S.x = 0;
    S.facts = pass ? [true, true, true, true] : [...C.REST_POSE.facts];
    S.tip = pass ? C.TIP_FULL : C.TIP_BLOCKED;
    S.open = pass ? 1 : 0;
    draw();
  }

  function edit() {
    if (still.matches) {
      stillPose(count() !== 4);
      say(readoutOf());
      return;
    }
    if (S.phase === "feed" && count() > 1) {
      const options = S.facts.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
      S.facts[options[Math.floor(Math.random() * options.length)]] = false;
      flash(text.feeding(count()));
      say(text.feeding(count()));
    } else {
      S.edits = Math.min(3, S.edits + 1);
      flash(text.edited);
      say(text.edited);
    }
    run();
  }

  // The stage is a native button, so Enter and Space arrive here as clicks.
  stage.addEventListener("click", () => {
    if (paused) setPaused(false);
    edit();
  });

  // Motion that runs longer than five seconds next to other content gets a pause control.
  const pauseButton = root.querySelector("[data-pause]");
  let paused = false;
  function setPaused(value) {
    paused = value;
    pauseButton.setAttribute("aria-pressed", String(paused));
    pauseButton.textContent = paused ? pauseButton.dataset.labelPlay : pauseButton.dataset.labelPause;
    if (!paused) run();
  }
  pauseButton?.addEventListener("click", () => setPaused(!paused));
  stage.addEventListener("focus", () => announce && (announce.textContent = readoutOf()));
  still.addEventListener?.("change", () => (still.matches ? stillPose(false) : run()));

  draw();
  if (still.matches) stillPose(false);
}
