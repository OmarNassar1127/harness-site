import "./styles.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SCENES, TOTAL, TERM, at, pose, sceneAt } from "./stage/timeline.js";

type Stage = Awaited<ReturnType<typeof import("./stage/stage.js").createStage>>;

const root = document.documentElement;

// ------------------------------------------------------------ copy email (phones without a mail app)
const status = document.querySelector<HTMLElement>("[data-copy-status]");
document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => {
  const label = button.querySelector("span");
  const original = label?.textContent ?? "";
  button.addEventListener("click", async () => {
    const value = button.dataset.copy ?? "";
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    if (label) label.textContent = button.dataset.copied ?? original;
    if (status) status.textContent = `${button.dataset.copied}: ${value}`;
    window.setTimeout(() => {
      if (label) label.textContent = original;
    }, 2200);
  });
});

if (root.classList.contains("motion")) startMotion();

function startMotion() {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const story = document.querySelector<HTMLElement>(".story")!;
  const object = document.querySelector<HTMLElement>(".object")!;
  const canvas = document.querySelector<HTMLCanvasElement>("canvas.gl")!;
  const scenes = new Map(SCENES.map((s) => [s.id, document.getElementById(s.id)!]));
  const $ = (id: string, sel: string) => [...scenes.get(id)!.querySelectorAll<HTMLElement>(sel)];
  const labels = $("parts", ".label");

  // ---------------------------------------------------------- the copy timeline, in story time (viewport heights)
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
  const span = (id: string, a: number, b: number) => [at(id, a), (b - a) * SCENES.find((s) => s.id === id)!.len] as const;
  const enter = (els: Element[], id: string, a: number, b: number, from: gsap.TweenVars = { y: 36 }) => {
    const [t, d] = span(id, a, b);
    tl.fromTo(els, { opacity: 0, ...from }, { opacity: 1, y: 0, scale: 1, duration: d }, t);
  };
  const leave = (els: Element[], id: string, a: number, b: number) => {
    const [t, d] = span(id, a, b);
    tl.to(els, { opacity: 0, y: -36, duration: d, ease: "power2.in" }, t);
  };

  // Kinetic headlines: words rise out of their masks one after another, and leave the same way.
  const wordsOf = (el: Element) => [...el.querySelectorAll(".wi")];
  const rise = (el: Element, id: string, a: number, b: number) => {
    const ws = wordsOf(el);
    const [t, d] = span(id, a, b);
    tl.fromTo(ws, { yPercent: 135, rotate: 2 }, { yPercent: 0, rotate: 0, duration: d * 0.6, stagger: (d * 0.4) / Math.max(1, ws.length - 1), ease: "power3.out" }, t);
  };
  const sink = (el: Element, id: string, a: number, b: number) => {
    const ws = wordsOf(el);
    const [t, d] = span(id, a, b);
    tl.to(ws, { yPercent: -135, rotate: -2, duration: d * 0.6, stagger: (d * 0.4) / Math.max(1, ws.length - 1), ease: "power2.in" }, t);
  };
  const title = (id: string) => scenes.get(id)!.querySelector('[data-a="title"]')!;

  sink(title("hero"), "hero", 0.5, 0.9);
  leave($("hero", '[data-a="sub"]'), "hero", 0.45, 0.8);

  // the catch headline lands like a stamp
  const stampWords = wordsOf(title("catch"));
  stampWords.forEach((w) => ((w.parentElement as HTMLElement).style.overflow = "visible"));
  {
    const [t, d] = span("catch", 0.08, 0.3);
    tl.fromTo(stampWords, { scale: 2.1, opacity: 0, rotate: -9 }, { scale: 1, opacity: 1, rotate: 0, duration: d * 0.45, stagger: (d * 0.55) / 3, ease: "back.out(2.4)" }, t);
  }
  enter($("catch", '[data-a="sub"]'), "catch", 0.16, 0.3);
  leave($("catch", '[data-a="sub"]'), "catch", 0.84, 0.94);
  {
    const [t, d] = span("catch", 0.86, 0.97);
    tl.to(stampWords, { opacity: 0, scale: 0.8, duration: d, stagger: d * 0.1, ease: "power2.in" }, t);
  }

  rise(title("parts"), "parts", 0.04, 0.2);
  enter($("parts", '[data-a="sub"]'), "parts", 0.36, 0.48);
  leave($("parts", '[data-a="sub"]'), "parts", 0.78, 0.9);
  sink(title("parts"), "parts", 0.84, 0.98);

  rise(title("replay"), "replay", 0.02, 0.14);
  enter($("replay", '[data-a="sub"]'), "replay", 0.06, 0.15);
  enter($("replay", '[data-a="term"]'), "replay", 0.08, 0.16, { y: 48 });
  $("replay", ".term-line").forEach((line, i) => {
    const [t, d] = span("replay", TERM[i].p, TERM[i].p + 0.035);
    tl.fromTo(line, { opacity: 0, clipPath: "inset(0 100% 0 0)" }, { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: d, ease: "none" }, t);
  });
  leave($("replay", '[data-a="sub"], [data-a="term"]'), "replay", 0.9, 0.99);
  sink(title("replay"), "replay", 0.9, 1);

  rise(title("incidents"), "incidents", 0.03, 0.15);
  $("incidents", ".card").forEach((card, i) => enter([card], "incidents", 0.14 + i * 0.1, 0.26 + i * 0.1, { y: 80, scale: 0.96 }));
  leave($("incidents", ".card"), "incidents", 0.88, 0.98);
  sink(title("incidents"), "incidents", 0.88, 0.99);

  // the price rolls in digit by digit
  {
    const ws = wordsOf(scenes.get("price")!.querySelector('[data-a="price"]')!);
    const [t, d] = span("price", 0.04, 0.3);
    tl.fromTo(ws, { yPercent: 160 }, { yPercent: 0, duration: d * 0.5, stagger: (d * 0.5) / ws.length, ease: "power4.out" }, t);
    const [t2, d2] = span("price", 0.88, 0.98);
    tl.to(ws, { yPercent: -160, duration: d2 * 0.6, stagger: (d2 * 0.4) / ws.length, ease: "power2.in" }, t2);
  }
  enter($("price", '[data-a="scope"]'), "price", 0.2, 0.22);
  $("price", ".scope li").forEach((li, i) => enter([li], "price", 0.22 + i * 0.07, 0.34 + i * 0.07, { y: 24 }));
  leave($("price", '[data-a="scope"]'), "price", 0.88, 0.98);

  rise(title("book"), "book", 0.03, 0.22);
  enter($("book", '.sub, .actions, .xline'), "book", 0.12, 0.34);
  tl.set({}, {}, TOTAL);
  // The words now sit hidden in their masks, so the headings themselves can show.
  gsap.set([...document.querySelectorAll('.scene:not(#hero) [data-a="title"], [data-a="price"]')], { opacity: 1 });

  const st = ScrollTrigger.create({ trigger: story, start: "top top", end: "bottom bottom", scrub: 0.55, animation: tl });
  const scrollToT = (T: number) => window.scrollTo({ top: st.start + ((st.end - st.start) * T) / TOTAL, behavior: "instant" as ScrollBehavior });
  const debug = { scrollToT, at, TOTAL, time: () => tl.time(), bounds: () => (stage ? stage.bounds(pose(tl.time())) : []) };
  (window as unknown as { __story: object }).__story = debug;

  // Keyboard users: focusing a control in a hidden scene scrolls to that scene.
  document.addEventListener("focusin", (event) => {
    const scene = (event.target as HTMLElement).closest<HTMLElement>(".scene");
    if (scene && !scene.classList.contains("is-active")) scrollToT(at(scene.id, 0.6));
  });

  // ---------------------------------------------------------- the object
  let stage: Stage | null = null;
  let booting = false;
  let lastT = -1;
  let dirty = true;
  let onScreen = true;
  let active = "";
  let floating = false; // the idle float starts with the first input, and runs at 30 fps
  let lastFrame = 0;

  const resize = () => {
    if (!stage) return;
    stage.setSize(canvas.clientWidth, canvas.clientHeight);
    // Keep the box and the envelope below their copy on short phone screens.
    for (const [id, moment] of [["price", "box"], ["book", "mail"]] as const) {
      const scene = document.getElementById(id);
      const copy = scene?.querySelector<HTMLElement>(".copy");
      if (!scene || !copy) continue;
      const bottom = copy.getBoundingClientRect().bottom - scene.getBoundingClientRect().top;
      stage.setTop(moment, (bottom + 12) / canvas.clientHeight);
    }
    // The six parts sit between the headline and the closing line; their labels need ~44px above each part.
    const parts = document.getElementById("parts");
    const head = parts?.querySelector<HTMLElement>(".copy-top");
    const foot = parts?.querySelector<HTMLElement>(".copy-bottom");
    if (parts && head && foot) {
      // Layout offsets, not client rects: the copy is mid-animation (translated) when this runs.
      const top = head.offsetTop + head.offsetHeight + 44;
      const bottom = foot.offsetTop - 8;
      stage.setTop("parts", top / canvas.clientHeight, bottom / canvas.clientHeight);
    }
    dirty = true;
  };
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver((entries) => {
    onScreen = entries[0].isIntersecting;
    dirty = true;
  }).observe(story);

  async function boot() {
    if (booting) return;
    booting = true;
    try {
      const { createStage } = await import("./stage/stage.js");
      await document.fonts.load('600 112px "Mona Sans"').catch(() => undefined);
      stage = await createStage(canvas, { font: '"Mona Sans", sans-serif' });
      dirty = true;
      resize();
      tick();
      object.classList.add("is-live");
    } catch {
      // No usable WebGL: the poster keeps standing in for the hero, the copy still scrolls.
      stage = null;
    }
  }
  // WebGL boots on the first sign of a person (pointer, touch, wheel, key, scroll). Until then the
  // pre-rendered still of the hero stands in, so first paint and reading never wait on three.js.
  const kick = () => {
    floating = true;
    boot();
  };
  for (const type of ["pointermove", "pointerdown", "touchstart", "wheel", "keydown", "scroll"]) window.addEventListener(type, kick, { once: true, passive: true });

  function tick() {
    const T = tl.time();
    const moved = T !== lastT || dirty;
    if (!moved && !(stage && floating)) return;
    if (moved) {
      lastT = T;
      dirty = false;
      const now = sceneAt(T).id;
      if (now !== active) {
        scenes.get(active)?.classList.remove("is-active");
        scenes.get(now)?.classList.add("is-active");
        active = now;
      }
    }
    if (!stage) return;
    const P = pose(T);
    canvas.style.opacity = String(P.canvasOpacity);
    if (P.canvasOpacity < 0.002 || !onScreen) return;
    const time = performance.now() / 1000;
    if (!moved && time - lastFrame < 1 / 30) return;
    lastFrame = time;
    stage.renderPose(P, floating ? time : 0);
    if (P.labels > 0.002) {
      const points = stage.anchors();
      labels.forEach((label, i) => {
        label.style.opacity = String(P.labels);
        label.style.transform = `translate3d(${points[i].x.toFixed(1)}px, ${points[i].y.toFixed(1)}px, 0) translate(-50%, ${points[i].below ? "0%" : "-100%"})`;
      });
    } else if (labels[0].style.opacity !== "0") labels.forEach((label) => (label.style.opacity = "0"));
  }
  gsap.ticker.add(tick);
}
