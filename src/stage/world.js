// Five 3D moments, each its own composition floating in space. apply() poses them for story time T.
import * as THREE from "three";
import { materials, ORANGE, RED, UNLIT } from "./kit.js";
import { makeGate, makeBubble, makeStamp, makeBird, makeHook, makeDrawers, makeClock, makePhone, makeBox, makeEnvelope, makeCard } from "./objects.js";

const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const backOut = (k) => {
  const c = 1.6;
  return k <= 0 ? 0 : 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2);
};
const bump = (k) => Math.sin(Math.PI * clamp(k));

// Hand the main thread back between pieces of work, so the boot never becomes one long task.
const pause = () => new Promise((r) => ("scheduler" in globalThis && globalThis.scheduler.yield ? globalThis.scheduler.yield().then(r) : setTimeout(r, 0)));

export async function buildWorld({ font }) {
  const M = materials();
  const shared = {};
  const root = new THREE.Group();
  const moments = {};
  const floor = new THREE.ShadowMaterial({ opacity: 0.17, depthWrite: false });
  const moment = (name, radius, floorY = -0.95) => {
    // floorY null = no floor: the moment floats, and an edge-on floor would read as a grey smear
    const g = new THREE.Group();
    root.add(g);
    moments[name] = { group: g, radius };
    if (floorY === null) return g;
    // a floor that shows only the soft shadow of what floats above it
    const catcher = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2.6, radius * 2.6), floor);
    catcher.rotation.x = -Math.PI / 2;
    catcher.position.y = radius * floorY;
    catcher.receiveShadow = true;
    catcher.userData.catcher = true;
    g.add(catcher);
    return g;
  };

  // ------------------------------------------------ gate: replies stream in, one gets caught and stamped
  const G = moment("gate", 2.6, -0.78);
  const gate = makeGate(M);
  G.add(gate.group);
  await pause();
  const path = new THREE.CatmullRomCurve3(
    [[-5.8, -1.75, 2.2], [-4.2, -1.2, 1.6], [-2.5, -0.55, 1.1], [-1.0, -0.12, 0.8], [0, 0, 0.45]].map((p) => new THREE.Vector3(...p)),
  );
  const bubbles = [0, 1, 2, 3, 4].map(() => {
    const b = makeBubble(M, font, shared);
    G.add(b.group);
    return b;
  });
  const QUEUE = [0.94, 0.66, 0.42, 0.2, 0.02];
  await pause();
  const stamp = makeStamp(M);
  G.add(stamp.group);

  await pause();
  // ------------------------------------------------ the six parts, clustered, then spread out with labels
  const X = moment("parts", 3.2, null);
  const trio = new THREE.Group();
  const trioBirds = [-0.42, 0, 0.42].map((x) => {
    const b = makeBird(M);
    b.group.position.set(x, x === 0 ? 0.12 : 0, x === 0 ? 0.1 : 0);
    b.feather.color.copy(ORANGE);
    trio.add(b.group);
    return b;
  });
  const partMakers = [
    () => ({ obj: makeGate(M), r: 1.8 }),
    () => ({ obj: { group: trio, radius: 0.75 }, r: 0.75 }),
    () => ({ obj: makeHook(M), r: 0.95 }),
    () => ({ obj: makeDrawers(M), r: 1.0 }),
    () => ({ obj: makeClock(M), r: 0.95 }),
    () => ({ obj: makePhone(M), r: 1.1 }),
  ];
  const parts = [];
  for (const [i, make] of partMakers.entries()) {
    const p = make();
    const holder = new THREE.Group();
    holder.add(p.obj.group);
    X.add(holder);
    parts.push({ ...p, holder, scale: 1 / p.r, i });
    await pause();
  }
  const LAYOUT = {
    L: [[-2.35, 0.95], [0, 1.0], [2.35, 0.95], [-2.35, -1.05], [0, -1.0], [2.35, -1.05]],
    P: [[-1.0, 2.2], [1.0, 2.2], [-1.0, 0], [1.0, 0], [-1.0, -2.2], [1.0, -2.2]],
  };
  const CLUSTER = [[-0.3, 0.25, 0.2], [0.3, 0.3, -0.1], [0.25, -0.2, 0.3], [-0.25, -0.25, -0.2], [0, 0.05, 0.45], [0.05, -0.05, -0.4]];

  await pause();
  // ------------------------------------------------ four canaries on a wire, and the fact that fell out of memory
  const R = moment("wire", 2.3, -0.5);
  const wireCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(-2.1, 0.05, 0), new THREE.Vector3(0, -0.14, 0), new THREE.Vector3(2.1, 0.05, 0)]);
  R.add(new THREE.Mesh(new THREE.TubeGeometry(wireCurve, 64, 0.022, 10, false), M.ink));
  for (const x of [-2.1, 2.1]) {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), M.orange);
    cap.position.set(x, 0.05, 0);
    R.add(cap);
  }
  const BIRD_X = [-1.35, -0.45, 0.45, 1.35];
  const wireY = (x) => wireCurve.getPoint((x + 2.1) / 4.2).y;
  const birds = BIRD_X.map((x) => {
    const b = makeBird(M);
    b.group.position.set(x, wireY(x) + 0.33, 0);
    R.add(b.group);
    return b;
  });
  const card = makeCard();
  R.add(card.group);

  await pause();
  // ------------------------------------------------ the box: the six parts drop in, the lid closes, a bow on top
  const B = moment("box", 1.7, -0.33);
  const box = makeBox(M);
  box.group.position.y = -0.55;
  B.add(box.group);
  const minis = [makeGate(M), makeClock(M), makeHook(M), makeDrawers(M), makePhone(M), makeBird(M)].map((o, i) => {
    if (i === 5) o.feather.color.copy(ORANGE);
    const s = [0.22, 0.3, 0.3, 0.3, 0.26, 0.55][i];
    o.group.scale.setScalar(s);
    B.add(o.group);
    return o;
  });
  const SLOTS = [[-0.5, 0.1, -0.25], [0.48, 0.12, -0.28], [0, 0.18, -0.3], [-0.45, 0.06, 0.28], [0.45, 0.1, 0.25], [0.02, 0.08, 0.22]];

  await pause();
  // ------------------------------------------------ the envelope
  const E = moment("mail", 1.85, -0.62);
  const mail = makeEnvelope(M);
  E.add(mail.group);

  const tmp = new THREE.Vector3();
  const col = new THREE.Color();

  /** Pose everything. place(name) returns the world position for a moment's frame; time drives the idle float. */
  function apply(P, { place, time = 0, portrait = false }) {
    const float = (i, a = 0.05) => Math.sin(time * 1.1 + i * 1.7) * a;
    const T = P.T;

    // gate moment
    const gs = backOut(P.gOn);
    G.visible = gs > 0.001;
    if (G.visible) {
      G.position.copy(place("gate"));
      G.scale.setScalar(gs);
      G.rotation.set(P.gPitch, P.gYaw + float(0, 0.03), float(1, 0.015));
      gate.doors.forEach((d) => (d.scale.x = Math.max(0.001, P.shut)));
      col.copy(ORANGE).lerp(RED, P.alarm);
      gate.lamp.color.copy(col);
      gate.bulb.scale.setScalar(1 + 0.25 * P.alarm);
      bubbles.forEach((b, i) => {
        let u;
        let s = 1;
        let spin = 0;
        if (i === 0) {
          u = P.leadU - P.leadBack * 0.92;
          s = (1 + 0.25 * P.qOut) * (1 - P.leadBack * 0.55);
          spin = P.leadBack * TAU * 0.75;
        } else {
          u = QUEUE[i] + P.flow * 0.14 - P.qOut * 0.5;
          s = 1 - P.qOut;
        }
        b.group.visible = s > 0.01 && u > 0;
        if (!b.group.visible) return;
        path.getPoint(clamp(u, 0, 1), tmp);
        b.group.position.copy(tmp);
        b.group.position.y += float(i + 2, 0.06) * (1 - P.alarm);
        b.group.scale.setScalar(s);
        b.group.rotation.set(0.08 * Math.sin(i * 2.1 + T), 0.35 * (1 - u) + Math.sin(i + T) * 0.05, -0.06 + spin);
        b.mark.opacity = i === 0 ? P.mark : 0;
        b.done.opacity = i === 0 ? 1 - 0.8 * P.mark : 1;
        b.body.scale.z = i === 0 ? 1 - 0.3 * bump((P.stampK - 0.85) / 0.15) : 1;
      });
      const k = P.stampK;
      stamp.group.visible = k > 0.001;
      stamp.group.position.set(lerp(4.6, 0, k), lerp(0.6, 0, k), lerp(2.4, 0.62, k));
      stamp.group.rotation.set(lerp(0.9, Math.PI / 2, k), lerp(-0.9, 0, k), lerp(-0.9, 0, k));
    }

    // parts moment
    const xs = backOut(P.xOn);
    X.visible = xs > 0.001;
    if (X.visible) {
      X.position.copy(place("parts"));
      X.scale.setScalar(xs);
      X.rotation.set(0.05, P.xSpin, 0);
      const layout = portrait ? LAYOUT.P : LAYOUT.L;
      const e = P.explode;
      parts.forEach((p) => {
        const [lx, ly] = layout[p.i];
        const [cx, cy, cz] = CLUSTER[p.i];
        p.holder.position.set(lerp(cx, lx, e), lerp(cy, ly, e) + float(p.i, 0.07) * e, lerp(cz, 0, e));
        p.holder.scale.setScalar(p.scale * (portrait ? 0.72 : 0.88) * lerp(0.62, 1, e));
        p.holder.rotation.set(float(p.i + 3, 0.06), lerp(TAU * 0.5 + p.i, 0, e) - P.xSpin * 0.6 + float(p.i, 0.12), float(p.i + 1, 0.04));
      });
      const [pGate, , pHook, pDrawers, pClock, pPhone] = parts.map((p) => p.obj);
      pGate.doors.forEach((d) => (d.scale.x = 0.001));
      pDrawers.drawers.forEach((d, i) => {
        const o = clamp(P.drawers * 1.6 - i * 0.2);
        d.d.position.z = o * 0.5;
        d.cards.position.y = o * 0.12;
      });
      pHook.lock.rotation.z = Math.sin(T * 7) * 0.25 * e;
      pClock.minute.rotation.z = -T * 2.2;
      pClock.hour.rotation.z = -T * 0.2;
      pClock.second.rotation.z = -T * 9;
      pClock.hammer.rotation.z = Math.sin(T * 40) * 0.4 * bump((e - 0.5) * 2) * 0.5;
      pPhone.card.position.z = 0.07 + 0.3 * e;
      pPhone.card.position.y = 0.25 * e;
      trioBirds.forEach((b, i) => (b.body.position.y = Math.abs(Math.sin(T * 5 + i * 1.3)) * 0.06 * e));
    }

    // canaries on the wire
    const ws = backOut(P.wOn);
    R.visible = ws > 0.001;
    if (R.visible) {
      R.position.copy(place("wire"));
      R.scale.setScalar(ws);
      R.rotation.set(0.06, -0.18 + float(5, 0.03), 0);
      birds.forEach((b, i) => {
        const lit = P.birdOn[i];
        const red = i === 3 ? P.birdRed : 0;
        col.copy(UNLIT).lerp(ORANGE, lit).lerp(RED, red);
        b.feather.color.copy(col);
        const hop = P.birdHop[i];
        b.body.position.y = hop * 0.18 + float(i + 7, 0.015);
        b.wings.forEach((w, s) => (w.rotation.z = (s ? -1 : 1) * (0.9 * hop + 0.25 * red * Math.abs(Math.sin(T * 30)))));
        b.body.scale.setScalar(1 + 0.12 * red);
        b.body.rotation.z = red * Math.sin(T * 45) * 0.12;
        b.head.rotation.y = i < 3 ? P.look * (0.35 + 0.15 * i) : red * Math.sin(T * 30) * 0.3;
        b.head.rotation.x = -0.1 * hop;
      });
      const c = P.card;
      card.group.visible = c > 0.001;
      card.group.position.set(lerp(0.9, 0.3, c), lerp(2.8, -1.05, c), lerp(0.4, 0.5, c));
      card.group.rotation.set(lerp(-1.2, -0.25, c), lerp(1.4, -0.2, c), lerp(0.9, 0.12, c) + float(9, 0.03));
    }

    // the box
    const bs = backOut(P.bOn);
    B.visible = bs > 0.001;
    if (B.visible) {
      B.position.copy(place("box"));
      B.scale.setScalar(bs);
      B.rotation.set(0.32, -0.5 + (T - 8.6) * 0.25 + float(11, 0.04), 0);
      minis.forEach((m, i) => {
        const d = P.drops[i];
        const [sx, sy, sz] = SLOTS[i];
        m.group.visible = d > 0.001;
        const fall = 1 - Math.pow(1 - d, 2);
        m.group.position.set(lerp(sx * 2.2, sx, fall), lerp(3.2 + i * 0.25, sy, fall) - 0.55, lerp(sz, sz, fall));
        m.group.rotation.set((1 - d) * 2.4, (1 - d) * 3 + i, (1 - d) * 1.5);
      });
      box.hinge.rotation.x = lerp(-1.95, 0, P.lid);
      box.bow.scale.setScalar(Math.max(0.001, backOut(P.bow)));
    }

    // the envelope
    const es = backOut(P.eOn);
    E.visible = es > 0.001;
    if (E.visible) {
      E.position.copy(place("mail"));
      E.position.y += (1 - P.eOn) * -1.5;
      E.scale.setScalar(es);
      E.rotation.set(-0.12 + float(13, 0.03), -0.35 + (1 - P.eOn) * 1.2 + float(12, 0.05), 0.04);
      mail.flap.rotation.x = -P.flap * (Math.PI + 0.32);
      mail.letter.position.y = P.letter * 0.78;
    }
  }

  /** World anchors for the labels: above the parts in the top row(s), below those in the bottom row. */
  function anchors(portrait) {
    return parts.map((p) => {
      const below = !portrait && p.i >= 3;
      p.holder.updateWorldMatrix(true, false);
      const v = new THREE.Vector3(0, below ? -p.r - 0.18 : p.r + 0.18, 0);
      return { point: p.holder.localToWorld(v), below };
    });
  }

  return { root, moments, apply, anchors };
}
