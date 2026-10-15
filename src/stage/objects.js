// The cast. Each factory builds one object from primitives and returns its moving parts.
import * as THREE from "three";
import { HEX, ORANGE, rrect, extrude, rbox, put, memo, G, doneTexture, stampTexture, cardTexture, letterTexture } from "./kit.js";

/** The gate: a thick rounded frame, a lit inner lip, two doors that slide shut and a lamp on top. */
export function makeGate(M) {
  const g = new THREE.Group();
  const ring = (o, i, ro, ri) => {
    const s = rrect(new THREE.Shape(), o, o, ro);
    s.holes.push(rrect(new THREE.Path(), i, i, ri));
    return s;
  };
  put(g, memo("gate:frame", () => extrude(ring(2.5, 1.6, 0.66, 0.36), 0.46, 0.12, 18)), M.ceramic);
  const lamp = new THREE.MeshBasicMaterial({ color: HEX.orange, toneMapped: false });
  // a lit lip around the opening, on the front face
  put(g, memo("gate:lip", () => extrude(ring(1.86, 1.62, 0.46, 0.37), 0.05, 0.012, 18)), lamp, 0, 0, 0.22);
  // two doors slide out of the frame to close the opening
  const doors = [-1, 1].map((sx) => {
    const d = new THREE.Group();
    d.position.set(sx * 0.81, 0, -0.04);
    g.add(d);
    put(d, rbox(0.81, 1.62, 0.07, 0.025), M.steel, -sx * 0.405, 0, 0);
    return d;
  });
  // lamp on a stem
  put(g, G(THREE.CylinderGeometry, 0.045, 0.06, 0.24, 16), M.steel, 0, 1.33, 0);
  const bulb = put(g, G(THREE.SphereGeometry, 0.17, 32, 16), lamp, 0, 1.55, 0);
  put(g, G(THREE.CylinderGeometry, 0.14, 0.14, 0.05, 32), M.ink, 0, 1.43, 0);
  return { group: g, doors, lamp, bulb, radius: 1.8 };
}

/** A speech bubble that says "done", with a stamp mark that can appear on it. */
export function makeBubble(M, font, shared) {
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  put(body, rbox(1.12, 0.62, 0.26, 0.2, 5), M.ceramic);
  const tail = put(body, G(THREE.ConeGeometry, 0.13, 0.3, 24), M.ceramic, -0.3, -0.38, 0);
  tail.rotation.z = Math.PI + 0.5;
  shared.done ||= doneTexture(font);
  shared.stamp ||= stampTexture(font);
  const done = new THREE.MeshBasicMaterial({ map: shared.done, transparent: true, depthWrite: false, toneMapped: false });
  put(body, G(THREE.PlaneGeometry, 0.94, 0.47), done, 0, 0, 0.132);
  const mark = new THREE.MeshBasicMaterial({ map: shared.stamp, transparent: true, depthWrite: false, toneMapped: false, opacity: 0 });
  const markMesh = put(body, G(THREE.PlaneGeometry, 1.0, 0.5), mark, 0.02, 0.0, 0.134);
  markMesh.renderOrder = 2;
  return { group: g, body, mark, done, radius: 0.7 };
}

/** A rubber stamp: orange knob, ink neck, graphite block, red pad facing -y. */
export function makeStamp(M) {
  const g = new THREE.Group();
  put(g, G(THREE.SphereGeometry, 0.2, 32, 16), M.orange, 0, 0.72, 0);
  put(g, G(THREE.CylinderGeometry, 0.08, 0.11, 0.42, 24), M.ink, 0, 0.42, 0);
  put(g, rbox(0.86, 0.22, 0.5, 0.06), M.graphite, 0, 0.12, 0);
  put(g, rbox(0.82, 0.06, 0.46, 0.02), M.rubber, 0, -0.02, 0);
  return { group: g, radius: 0.8 };
}

/** A canary: round body, head, ink beak and eyes, wings and tail. Colour shows its state. */
export function makeBird(M) {
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const feather = new THREE.MeshPhysicalMaterial({ color: HEX.unlit, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 });
  const torso = put(body, G(THREE.SphereGeometry, 0.25, 32, 20), feather, 0, 0, 0);
  torso.scale.set(0.95, 1.02, 0.92);
  const head = new THREE.Group();
  head.position.set(0, 0.3, 0.03);
  body.add(head);
  put(head, G(THREE.SphereGeometry, 0.17, 32, 20), feather);
  const crest = put(head, G(THREE.ConeGeometry, 0.05, 0.13, 16), feather, 0, 0.18, -0.02);
  crest.rotation.x = -0.5;
  const beakTop = put(head, G(THREE.ConeGeometry, 0.05, 0.12, 16), M.ink, 0, -0.01, 0.2);
  beakTop.rotation.x = Math.PI / 2;
  for (const sx of [-1, 1]) {
    put(head, G(THREE.SphereGeometry, 0.045, 16, 12), M.white, sx * 0.075, 0.04, 0.135);
    put(head, G(THREE.SphereGeometry, 0.026, 12, 8), M.ink, sx * 0.08, 0.04, 0.17);
  }
  const wings = [-1, 1].map((sx) => {
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.2, 0.06, -0.02);
    body.add(pivot);
    const w = put(pivot, G(THREE.SphereGeometry, 0.17, 24, 16), feather, sx * 0.04, -0.08, 0);
    w.scale.set(0.32, 0.85, 1);
    return pivot;
  });
  const tail = put(body, G(THREE.ConeGeometry, 0.09, 0.26, 16), feather, 0, -0.16, -0.24);
  tail.rotation.x = -2.2;
  for (const sx of [-1, 1]) put(g, G(THREE.CylinderGeometry, 0.014, 0.014, 0.12, 8), M.ink, sx * 0.07, -0.29, 0.02);
  return { group: g, body, head, wings, feather, radius: 0.5 };
}

/** A J-hook with a padlock hanging in it. */
export function makeHook(M) {
  const g = new THREE.Group();
  put(g, G(THREE.TorusGeometry, 0.14, 0.045, 16, 40), M.steel, 0, 1.0, 0);
  put(g, G(THREE.CylinderGeometry, 0.065, 0.065, 0.86, 24), M.steel, 0, 0.43, 0);
  const curve = put(g, G(THREE.TorusGeometry, 0.32, 0.068, 18, 48, Math.PI * 1.4), M.steel, 0.32, 0, 0);
  curve.rotation.z = Math.PI;
  const a = Math.PI * 2.4;
  put(g, G(THREE.SphereGeometry, 0.085, 20, 12), M.steel, 0.32 + 0.32 * Math.cos(a), 0.32 * Math.sin(a), 0);
  const lock = new THREE.Group();
  lock.position.set(0.32, -0.32, 0);
  g.add(lock);
  const shackle = put(lock, G(THREE.TorusGeometry, 0.17, 0.045, 16, 40, Math.PI), M.steel, 0, -0.17, 0);
  shackle.rotation.y = Math.PI / 2;
  put(lock, rbox(0.56, 0.46, 0.22, 0.09), M.orange, 0, -0.42, 0);
  put(lock, G(THREE.CylinderGeometry, 0.045, 0.045, 0.03, 20), M.ink, 0, -0.38, 0.11).rotation.x = Math.PI / 2;
  put(lock, rbox(0.03, 0.1, 0.03, 0.01), M.ink, 0, -0.45, 0.11);
  return { group: g, lock, radius: 0.95 };
}

/** A card-catalogue cabinet with four drawers that slide out, cards standing in them. */
export function makeDrawers(M) {
  const g = new THREE.Group();
  put(g, rbox(1.36, 1.04, 0.9, 0.1), M.ceramic);
  put(g, rbox(1.38, 0.08, 0.92, 0.03), M.orange, 0, 0.55, 0);
  const drawers = [];
  for (const [x, y] of [[-0.32, 0.24], [0.32, 0.24], [-0.32, -0.24], [0.32, -0.24]]) {
    put(g, G(THREE.PlaneGeometry, 0.54, 0.38), M.ink, x, y, 0.451);
    const d = new THREE.Group();
    d.position.set(x, y, 0);
    g.add(d);
    put(d, rbox(0.52, 0.34, 0.78, 0.03), M.paper, 0, -0.01, 0.06);
    put(d, rbox(0.58, 0.42, 0.07, 0.05), M.ceramic, 0, 0, 0.48);
    put(d, rbox(0.22, 0.05, 0.06, 0.02), M.steel, 0, -0.06, 0.53);
    put(d, rbox(0.18, 0.07, 0.015, 0.01), M.orange, 0, 0.08, 0.52);
    const cards = new THREE.Group();
    d.add(cards);
    for (let i = 0; i < 4; i++) {
      const c = put(cards, rbox(0.44, 0.3, 0.012, 0.01, 2), M.paper, 0, 0.04, -0.2 + i * 0.13);
      c.rotation.x = -0.12;
    }
    drawers.push({ d, cards });
  }
  return { group: g, drawers, radius: 1.0 };
}

/** An alarm clock: two bells, a hammer, a face with ticks and three hands. */
export function makeClock(M) {
  const g = new THREE.Group();
  const body = put(g, G(THREE.CylinderGeometry, 0.6, 0.6, 0.34, 48), M.ceramic);
  body.rotation.x = Math.PI / 2;
  put(g, G(THREE.TorusGeometry, 0.6, 0.065, 16, 64), M.orange, 0, 0, 0.17);
  put(g, G(THREE.CircleGeometry, 0.54, 48), M.paper, 0, 0, 0.172);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const t = put(g, G(THREE.BoxGeometry, i % 3 ? 0.025 : 0.045, i % 3 ? 0.07 : 0.11, 0.01), M.ink, Math.sin(a) * 0.44, Math.cos(a) * 0.44, 0.176);
    t.rotation.z = -a;
  }
  const hand = (w, l, mat, z) => {
    const p = new THREE.Group();
    p.position.z = z;
    g.add(p);
    const geo = memo(`hand:${w}:${l}`, () => new THREE.BoxGeometry(w, l, 0.012).translate(0, l / 2 - 0.05, 0));
    put(p, geo, mat);
    return p;
  };
  const hour = hand(0.05, 0.28, M.ink, 0.182);
  const minute = hand(0.035, 0.4, M.ink, 0.19);
  const second = hand(0.014, 0.45, M.glow, 0.198);
  put(g, G(THREE.CylinderGeometry, 0.045, 0.045, 0.04, 20), M.orange, 0, 0, 0.2).rotation.x = Math.PI / 2;
  const bells = [-1, 1].map((sx) => {
    const b = new THREE.Group();
    b.position.set(sx * 0.36, 0.6, 0);
    b.rotation.z = -sx * 0.55;
    g.add(b);
    put(b, G(THREE.SphereGeometry, 0.21, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), M.steel);
    put(b, G(THREE.CylinderGeometry, 0.03, 0.03, 0.12, 12), M.steel, 0, -0.05, 0);
    return b;
  });
  const hammer = new THREE.Group();
  hammer.position.set(0, 0.62, 0);
  g.add(hammer);
  put(hammer, G(THREE.CylinderGeometry, 0.015, 0.015, 0.2, 8), M.steel, 0, 0.08, 0);
  put(hammer, G(THREE.SphereGeometry, 0.045, 16, 8), M.ink, 0, 0.19, 0);
  for (const sx of [-1, 1]) {
    const leg = put(g, G(THREE.CylinderGeometry, 0.035, 0.05, 0.22, 12), M.ink, sx * 0.36, -0.6, -0.02);
    leg.rotation.z = sx * 0.5;
  }
  return { group: g, hour, minute, second, bells, hammer, radius: 0.95 };
}

/** A phone with a notification card that lifts off the screen, two buttons on it. */
export function makePhone(M) {
  const g = new THREE.Group();
  put(g, rbox(1.0, 2.0, 0.12, 0.17, 6), M.graphite);
  put(g, rbox(0.9, 1.9, 0.02, 0.12, 4), M.ink, 0, 0, 0.055);
  put(g, rbox(0.26, 0.07, 0.02, 0.035), M.graphite, 0, 0.86, 0.068);
  for (const [y, w] of [[-0.42, 0.62], [-0.55, 0.48], [-0.68, 0.56]]) put(g, rbox(w, 0.05, 0.01, 0.02), M.graphite, -(0.62 - w) / 2, y, 0.068);
  const card = new THREE.Group();
  g.add(card);
  put(card, rbox(0.94, 0.5, 0.06, 0.1), M.ceramic);
  const icon = new THREE.MeshBasicMaterial({ color: HEX.orange, toneMapped: false });
  put(card, rbox(0.14, 0.14, 0.02, 0.04), icon, -0.32, 0.1, 0.035);
  put(card, rbox(0.42, 0.04, 0.01, 0.015), M.ink, 0.05, 0.13, 0.035);
  put(card, rbox(0.3, 0.035, 0.01, 0.015), M.graphite, -0.01, 0.06, 0.035);
  const yes = put(card, rbox(0.36, 0.12, 0.05, 0.06), M.orange, -0.2, -0.13, 0.04);
  put(card, rbox(0.36, 0.12, 0.05, 0.06), M.ceramic, 0.2, -0.13, 0.04);
  return { group: g, card, icon, yes, radius: 1.1 };
}

/** An open box with a hinged lid and a ribbon bow. */
export function makeBox(M) {
  const g = new THREE.Group();
  const W = 1.9, D = 1.4, H = 0.8, T = 0.08;
  put(g, rbox(W, T, D, 0.03), M.ceramic, 0, 0, 0);
  put(g, rbox(W, H, T, 0.03), M.ceramic, 0, H / 2, D / 2 - T / 2);
  put(g, rbox(W, H, T, 0.03), M.ceramic, 0, H / 2, -D / 2 + T / 2);
  put(g, rbox(T, H, D, 0.03), M.ceramic, -W / 2 + T / 2, H / 2, 0);
  put(g, rbox(T, H, D, 0.03), M.ceramic, W / 2 - T / 2, H / 2, 0);
  put(g, rbox(0.2, H + 0.01, D + 0.01, 0.02), M.orange, 0, H / 2, 0);
  const hinge = new THREE.Group();
  hinge.position.set(0, H, -D / 2);
  g.add(hinge);
  const lid = new THREE.Group();
  lid.position.set(0, 0.06, D / 2 + 0.03);
  hinge.add(lid);
  put(lid, rbox(W + 0.08, 0.12, D + 0.08, 0.05), M.ceramic);
  put(lid, rbox(0.22, 0.13, D + 0.1, 0.02), M.orange);
  put(lid, rbox(W + 0.1, 0.13, 0.22, 0.02), M.orange);
  const bow = new THREE.Group();
  bow.position.y = 0.1;
  lid.add(bow);
  for (const sx of [-1, 1]) {
    const loop = put(bow, G(THREE.TorusGeometry, 0.2, 0.06, 14, 32), M.orange, sx * 0.2, 0.14, 0);
    loop.rotation.set(0, sx * 0.4, sx * 0.9);
    loop.scale.set(1, 0.7, 1);
  }
  put(bow, G(THREE.SphereGeometry, 0.1, 20, 12), M.orange, 0, 0.08, 0);
  return { group: g, hinge, bow, top: H, radius: 1.5 };
}

/** An envelope: back, a front pocket, a hinged flap with a seal, and a letter that slides out. */
export function makeEnvelope(M) {
  const g = new THREE.Group();
  const W = 2.1, H = 1.3;
  put(g, rbox(W, H, 0.04, 0.05), M.orange, 0, 0, -0.04);
  const letter = new THREE.Group();
  g.add(letter);
  put(letter, rbox(W - 0.24, H - 0.16, 0.02, 0.03), M.paper);
  const sheet = new THREE.MeshBasicMaterial({ map: letterTexture(), toneMapped: false });
  put(letter, G(THREE.PlaneGeometry, W - 0.3, H - 0.24), sheet, 0, 0, 0.012);
  const pocket = new THREE.Shape();
  pocket.moveTo(-W / 2, -H / 2);
  pocket.lineTo(W / 2, -H / 2);
  pocket.lineTo(W / 2, H / 2 - 0.05);
  pocket.lineTo(0, -0.02);
  pocket.lineTo(-W / 2, H / 2 - 0.05);
  pocket.closePath();
  put(g, memo("mail:pocket", () => extrude(pocket, 0.05, 0.016, 4)), M.ceramic, 0, 0, 0.045);
  // a postage stamp in the corner
  put(g, rbox(0.34, 0.4, 0.015, 0.02), M.paper, W / 2 - 0.3, -H / 2 + 0.32, 0.075);
  put(g, rbox(0.24, 0.3, 0.012, 0.015), M.orange, W / 2 - 0.3, -H / 2 + 0.32, 0.084);
  const flap = new THREE.Group();
  flap.position.set(0, H / 2, -0.02);
  g.add(flap);
  const tri = new THREE.Shape();
  tri.moveTo(-W / 2, 0);
  tri.lineTo(W / 2, 0);
  tri.lineTo(0, -H * 0.62);
  tri.closePath();
  put(flap, memo("mail:flap", () => extrude(tri, 0.035, 0.01, 4)), M.ceramic, 0, 0, 0.08);
  put(flap, G(THREE.CylinderGeometry, 0.16, 0.16, 0.05, 32), M.orange, 0, -H * 0.5, 0.12).rotation.x = Math.PI / 2;
  return { group: g, letter, flap, radius: 1.75 };
}

/** One index card, for the fact that falls out of memory. */
export function makeCard() {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ map: cardTexture(), toneMapped: false, side: THREE.DoubleSide });
  put(g, G(THREE.PlaneGeometry, 0.9, 0.56), mat);
  return { group: g, radius: 0.55 };
}

export { ORANGE };
