// The harness module, modelled from primitives: six rounded-square layers, a lamp ring,
// shutters over the gate, canary lights, hook latches, memory plates, a jobs dial and a phone screen.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const W = 2.4; // footprint
const R = 0.5; // corner radius
const BEV = 0.034;
const SEAM = 0.014;
export const GAP = 0.62; // extra spacing per layer when exploded

export const ORANGE = new THREE.Color(0xf2541a);
export const RED = new THREE.Color(0xe1261c);
const LED_OFF = new THREE.Color(0x2c2c2f);

function rrect(target, w, d, r) {
  const x = -w / 2;
  const y = -d / 2;
  target.moveTo(x + r, y);
  target.lineTo(x + w - r, y);
  target.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  target.lineTo(x + w, y + d - r);
  target.absarc(x + w - r, y + d - r, r, 0, Math.PI / 2, false);
  target.lineTo(x + r, y + d);
  target.absarc(x + r, y + d - r, r, Math.PI / 2, Math.PI, false);
  target.lineTo(x, y + r);
  target.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return target;
}

/** A rounded slab lying flat, from y = 0 to y = h, optionally with a rounded-square hole through it. */
function slab(w, d, h, r, bevel = BEV, hole = null, curve = 18) {
  const shape = rrect(new THREE.Shape(), w - 2 * bevel, d - 2 * bevel, Math.max(0.002, r - bevel));
  if (hole) shape.holes.push(rrect(new THREE.Path(), hole.w + 2 * bevel, hole.d + 2 * bevel, hole.r + bevel));
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.001, h - 2 * bevel),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: curve,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, bevel, 0);
  return toCreasedNormals(geo, Math.PI / 3);
}

function decalTexture(text, font) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const g = c.getContext("2d");
  g.clearRect(0, 0, 512, 256);
  // check mark
  g.strokeStyle = "#f2541a";
  g.lineWidth = 22;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.beginPath();
  g.moveTo(70, 132);
  g.lineTo(112, 172);
  g.lineTo(184, 92);
  g.stroke();
  g.fillStyle = "#0f0f0e";
  g.font = `600 112px ${font}`;
  g.textBaseline = "middle";
  g.fillText(text, 216, 136);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  g.filter = "blur(16px)";
  g.fillStyle = "rgba(20,18,16,0.85)";
  const s = 112;
  g.beginPath();
  g.roundRect(128 - s / 2, 128 - s / 2, s, s, 26);
  g.fill();
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

export function buildModel({ tileText = "done", font = '"Mona Sans", sans-serif' } = {}) {
  const M = {
    ceramic: new THREE.MeshPhysicalMaterial({ color: 0xf7f7f4, roughness: 0.34, metalness: 0, clearcoat: 0.8, clearcoatRoughness: 0.18 }),
    plate: new THREE.MeshPhysicalMaterial({ color: 0xf2f1ec, roughness: 0.42, metalness: 0, clearcoat: 0.4, clearcoatRoughness: 0.3 }),
    alu: new THREE.MeshPhysicalMaterial({ color: 0xdcdde0, roughness: 0.4, metalness: 1 }),
    aluDark: new THREE.MeshPhysicalMaterial({ color: 0x9c9ea2, roughness: 0.42, metalness: 1 }),
    graphite: new THREE.MeshPhysicalMaterial({ color: 0x6a6b70, roughness: 0.44, metalness: 0.85 }),
    base: new THREE.MeshPhysicalMaterial({ color: 0x3a3a3e, roughness: 0.4, metalness: 0.8 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x0d0d10, roughness: 0.05, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.03 }),
    // Lights are unlit and skip tone mapping, so they show the exact brand orange.
    lamp: new THREE.MeshBasicMaterial({ color: ORANGE.clone(), toneMapped: false }),
    intake: new THREE.MeshBasicMaterial({ color: ORANGE.clone(), toneMapped: false }),
    hand: new THREE.MeshBasicMaterial({ color: ORANGE.clone(), toneMapped: false }),
    notify: new THREE.MeshBasicMaterial({ color: ORANGE.clone(), toneMapped: false }),
    ink: new THREE.MeshStandardMaterial({ color: 0x1a0a04, roughness: 0.5 }),
    screenLine: new THREE.MeshStandardMaterial({ color: 0x2a2a2e, emissive: new THREE.Color(0x5a5a60), emissiveIntensity: 0.6, roughness: 0.5 }),
  };

  const root = new THREE.Group();
  const layers = [];
  // Layer order top to bottom: gate, canaries, hooks, memory, jobs, phone. Heights:
  const H = { gate: 0.3, ring: 0.065, canaries: 0.22, hooks: 0.2, memory: 5 * 0.046 + 4 * 0.0135, jobs: 0.2, phone: 0.26 };

  // ---------- phone control (base)
  const phone = new THREE.Group();
  phone.add(new THREE.Mesh(slab(W, W, H.phone, R), M.base));
  const screen = new THREE.Mesh(slab(1.12, 1.96, 0.024, 0.2, 0.008), M.glass);
  screen.position.y = H.phone - 0.004;
  phone.add(screen);
  const note = new THREE.Mesh(slab(0.88, 0.3, 0.016, 0.1, 0.005), M.notify);
  note.position.set(0, H.phone + 0.016, -0.52);
  phone.add(note);
  for (const [z, w] of [[-0.56, 0.5], [-0.47, 0.34]]) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(w, 0.006, 0.034), M.ink);
    line.position.set(0.07 + (w - 0.5) / 2, H.phone + 0.034, z);
    phone.add(line);
  }
  const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.008, 24), M.ink);
  dot.position.set(-0.31, H.phone + 0.034, -0.52);
  phone.add(dot);
  for (const [z, w] of [[-0.12, 0.8], [0.02, 0.62], [0.16, 0.72]]) {
    const row = new THREE.Mesh(new THREE.BoxGeometry(w, 0.004, 0.05), M.screenLine);
    row.position.set(-(0.8 - w) / 2, H.phone + 0.022, z);
    phone.add(row);
  }

  // ---------- scheduled jobs
  const jobs = new THREE.Group();
  jobs.add(new THREE.Mesh(slab(W, W, H.jobs, R), M.alu));
  const tickGeo = new THREE.BoxGeometry(0.036, 0.014, 0.14);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const tick = new THREE.Mesh(tickGeo, i % 3 === 0 ? M.graphite : M.aluDark);
    tick.position.set(Math.sin(a) * 0.74, H.jobs + 0.004, Math.cos(a) * 0.74);
    tick.rotation.y = a;
    if (i % 3 === 0) tick.scale.set(1.4, 1, 1.25);
    jobs.add(tick);
  }
  const handGeo = new THREE.BoxGeometry(0.044, 0.016, 0.6);
  handGeo.translate(0, 0, -0.28);
  const hand = new THREE.Mesh(handGeo, M.hand);
  hand.position.y = H.jobs + 0.012;
  jobs.add(hand);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.04, 32), M.alu);
  hub.position.y = H.jobs + 0.02;
  jobs.add(hub);

  // ---------- memory: five thin plates
  const memory = new THREE.Group();
  const plateGeo = slab(W, W, 0.046, R, 0.012);
  const plates = [];
  for (let i = 0; i < 5; i++) {
    const p = new THREE.Mesh(plateGeo, M.plate);
    p.position.y = i * (0.046 + 0.0135);
    memory.add(p);
    plates.push(p);
  }
  // an inner core between the plates, so the gaps read as seams and not as holes
  const core = new THREE.Mesh(slab(W - 0.08, W - 0.08, H.memory - 0.02, R - 0.04, 0.01), M.base);
  core.position.y = 0.01;
  memory.add(core);

  // ---------- hooks: graphite slab with a latch on each side
  const hooks = new THREE.Group();
  hooks.add(new THREE.Mesh(slab(W, W, H.hooks, R), M.graphite));
  const latchGeo = new THREE.TorusGeometry(0.12, 0.026, 12, 32, Math.PI);
  const footGeo = new RoundedBoxGeometry(0.34, 0.075, 0.05, 2, 0.02);
  for (let side = 0; side < 4; side++) {
    const g = new THREE.Group();
    const latch = new THREE.Mesh(latchGeo, M.alu);
    latch.position.set(0, H.hooks - 0.02, W / 2 + 0.03);
    const foot = new THREE.Mesh(footGeo, M.alu);
    foot.position.set(0, H.hooks - 0.06, W / 2 + 0.018);
    g.add(latch, foot);
    g.rotation.y = (side * Math.PI) / 2;
    hooks.add(g);
  }

  // ---------- canaries: aluminium slab with four lights on the front
  const canaries = new THREE.Group();
  canaries.add(new THREE.Mesh(slab(W, W, H.canaries, R), M.alu));
  const leds = [];
  const ledGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.024, 32);
  ledGeo.rotateX(Math.PI / 2);
  const bezelGeo = new THREE.CylinderGeometry(0.072, 0.072, 0.012, 32);
  bezelGeo.rotateX(Math.PI / 2);
  [-0.45, -0.15, 0.15, 0.45].forEach((x) => {
    const bezel = new THREE.Mesh(bezelGeo, M.base);
    bezel.position.set(x, H.canaries / 2, W / 2 + 0.002);
    const mat = new THREE.MeshBasicMaterial({ color: ORANGE.clone(), toneMapped: false });
    const led = new THREE.Mesh(ledGeo, mat);
    led.position.set(x, H.canaries / 2, W / 2 + 0.008);
    canaries.add(bezel, led);
    leds.push(mat);
  });

  // ---------- gate: ceramic slab with an aperture, two shutters, a glowing intake and the lamp ring under it
  const gate = new THREE.Group();
  const AP = 1.16;
  const ring = new THREE.Mesh(slab(W - 0.012, W - 0.012, H.ring, R - 0.006, 0.01), M.lamp);
  gate.add(ring);
  const gateBody = new THREE.Mesh(slab(W, W, H.gate, R, BEV, { w: AP, d: AP, r: 0.26 }, 22), M.ceramic);
  gateBody.position.y = H.ring + SEAM * 0.5;
  gate.add(gateBody);
  const intakeShape = rrect(new THREE.Shape(), AP + 0.02, AP + 0.02, 0.27);
  const intake = new THREE.Mesh(new THREE.ShapeGeometry(intakeShape, 16), M.intake);
  intake.rotation.x = -Math.PI / 2;
  intake.position.y = H.ring + SEAM * 0.5 + 0.02;
  gate.add(intake);
  // a lit outline around the aperture, so the gate's state reads from above as well
  const halo = rrect(new THREE.Shape(), AP + 0.2, AP + 0.2, 0.36);
  halo.holes.push(rrect(new THREE.Path(), AP + 0.12, AP + 0.12, 0.32));
  const haloMesh = new THREE.Mesh(new THREE.ShapeGeometry(halo, 20), M.lamp);
  haloMesh.rotation.x = -Math.PI / 2;
  haloMesh.position.y = H.ring + SEAM * 0.5 + H.gate + 0.0015;
  gate.add(haloMesh);
  const bladeGeo = new RoundedBoxGeometry(0.6, 0.04, AP + 0.04, 2, 0.016);
  const bladeL = new THREE.Mesh(bladeGeo, M.alu);
  const bladeR = new THREE.Mesh(bladeGeo, M.alu);
  const gateTop = H.ring + SEAM * 0.5 + H.gate;
  bladeL.position.y = bladeR.position.y = gateTop - 0.06;
  gate.add(bladeL, bladeR);

  // reply tile with "done"
  const token = new THREE.Group();
  const tileMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.2, transparent: true });
  const tile = new THREE.Mesh(new RoundedBoxGeometry(1.02, 0.13, 0.56, 3, 0.05), tileMat);
  tile.position.y = 0.065;
  const decalMat = new THREE.MeshBasicMaterial({ map: decalTexture(tileText, font), transparent: true, depthWrite: false, toneMapped: false });
  const decal = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.44), decalMat);
  decal.rotation.x = -Math.PI / 2;
  decal.position.y = 0.132;
  token.add(tile, decal);
  gate.add(token);

  // stack the layers, bottom to top
  const order = [
    ["phone", phone, H.phone],
    ["jobs", jobs, H.jobs],
    ["memory", memory, H.memory],
    ["hooks", hooks, H.hooks],
    ["canaries", canaries, H.canaries],
    ["gate", gate, H.ring + SEAM * 0.5 + H.gate],
  ];
  let y = 0;
  for (const [name, group, h] of order) {
    group.position.y = y;
    layers.push({ name, group, baseY: y, h });
    root.add(group);
    y += h + SEAM;
  }
  layers.reverse(); // index 0 = gate (top), 5 = phone (base)
  const height = y - SEAM;

  // soft contact shadow
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(5.2, 5.2),
    new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: 0.62, toneMapped: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.002;
  shadow.renderOrder = -1;
  root.add(shadow);

  const tmp = new THREE.Color();
  function apply(P) {
    root.rotation.y = P.rotY;
    layers.forEach((L, i) => {
      L.group.position.y = L.baseY + P.explode * GAP * (5 - i);
      L.group.rotation.y = P.explode * (2.5 - i) * 0.045;
    });
    plates.forEach((p, i) => (p.position.y = i * (0.046 + 0.0135) + P.explode * i * 0.07));
    core.visible = P.explode < 0.05;
    const open = 0.88;
    const closed = 0.296;
    const bx = open + (closed - open) * P.shutter;
    bladeL.position.x = -bx;
    bladeR.position.x = bx;
    tmp.copy(ORANGE).lerp(RED, P.alarm);
    M.lamp.color.copy(tmp);
    M.intake.color.copy(tmp);
    leds.forEach((mat, k) => {
      tmp.copy(ORANGE).lerp(RED, P.ledRed[k]);
      mat.color.copy(LED_OFF).lerp(tmp, P.ledOn[k]);
    });
    hand.rotation.y = -P.dial;
    token.visible = P.tokenOpacity > 0.002;
    token.position.y = gateTop + P.tokenY;
    tileMat.opacity = P.tokenOpacity;
    decalMat.opacity = P.tokenOpacity;
    shadow.material.opacity = 0.62 * (1 - 0.35 * P.explode);
  }

  /** Centre height of each layer in world units at the current explode. */
  function layerCentres(P) {
    return layers.map((L, i) => L.baseY + P.explode * GAP * (5 - i) + L.h / 2);
  }

  return { root, apply, layerCentres, height, layers };
}
