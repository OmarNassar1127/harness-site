// Shared materials, geometry helpers and painted textures for the objects.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const HEX = { orange: 0xf2541a, red: 0xe1261c, ink: 0x1c1c1b, ceramic: 0xf3f2ee, paper: 0xfbfaf6, steel: 0xc4c7cb, graphite: 0x2f2f33, unlit: 0xd5d3ce };
export const ORANGE = new THREE.Color(HEX.orange);
export const RED = new THREE.Color(HEX.red);
export const UNLIT = new THREE.Color(HEX.unlit);

export function materials() {
  return {
    ceramic: new THREE.MeshPhysicalMaterial({ color: HEX.ceramic, roughness: 0.3, clearcoat: 0.9, clearcoatRoughness: 0.12 }),
    paper: new THREE.MeshPhysicalMaterial({ color: HEX.paper, roughness: 0.72 }),
    steel: new THREE.MeshPhysicalMaterial({ color: HEX.steel, metalness: 0.9, roughness: 0.26 }),
    graphite: new THREE.MeshPhysicalMaterial({ color: HEX.graphite, metalness: 0.35, roughness: 0.34, clearcoat: 0.7, clearcoatRoughness: 0.1 }),
    ink: new THREE.MeshPhysicalMaterial({ color: HEX.ink, roughness: 0.38, clearcoat: 0.6 }),
    orange: new THREE.MeshPhysicalMaterial({ color: HEX.orange, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08 }),
    rubber: new THREE.MeshPhysicalMaterial({ color: HEX.red, roughness: 0.6 }),
    glow: new THREE.MeshBasicMaterial({ color: HEX.orange, toneMapped: false }),
    white: new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
  };
}

/** Rounded rectangle path centred on the origin, into a Shape or Path. */
export function rrect(target, w, h, r) {
  const x = -w / 2;
  const y = -h / 2;
  target.moveTo(x + r, y);
  target.lineTo(x + w - r, y);
  target.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  target.lineTo(x + w, y + h - r);
  target.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  target.lineTo(x + r, y + h);
  target.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  target.lineTo(x, y + r);
  target.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return target;
}

/** A shape extruded along z with soft bevels, centred on z = 0, smooth-shaded. */
export function extrude(shape, depth, bevel, curve = 14) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.001, depth - 2 * bevel),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: curve,
  });
  geo.translate(0, 0, -(depth - 2 * bevel) / 2);
  return toCreasedNormals(geo, Math.PI / 3);
}

// Geometry is cached by its arguments: the same part built twice shares one buffer.
const cache = new Map();
export function memo(key, make) {
  let g = cache.get(key);
  if (!g) cache.set(key, (g = make()));
  return g;
}
/** A cached three.js geometry: G(THREE.SphereGeometry, 0.2, 32, 16). Never mutate the result. */
export const G = (Ctor, ...args) => memo(`${Ctor.name}:${args.join(",")}`, () => new Ctor(...args));
export const rbox = (w, h, d, r = 0.04, seg = 3) => memo(`rb:${w}:${h}:${d}:${r}:${seg}`, () => new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2) * 0.999));

/** Add a mesh to a parent at a position; returns the mesh. */
export function put(parent, geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}

function canvasTexture(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

const check = (g, x, y, s, color, width) => {
  g.strokeStyle = color;
  g.lineWidth = width;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(x + s * 0.36, y + s * 0.36);
  g.lineTo(x + s, y - s * 0.42);
  g.stroke();
};

/** "done" with a tick, ink on transparent. */
export const doneTexture = (font) =>
  canvasTexture(512, 256, (g) => {
    check(g, 64, 132, 104, "#f2541a", 22);
    g.fillStyle = "#1c1c1b";
    g.font = `650 118px ${font}`;
    g.textBaseline = "middle";
    g.fillText("done", 198, 132);
  });

/** A red rubber-stamp mark. */
export const stampTexture = (font) =>
  canvasTexture(512, 256, (g, w, h) => {
    g.translate(w / 2, h / 2);
    g.rotate(-0.14);
    g.strokeStyle = "#e1261c";
    g.lineWidth = 14;
    g.beginPath();
    g.roundRect(-220, -78, 440, 156, 26);
    g.stroke();
    g.fillStyle = "#e1261c";
    g.font = `800 92px ${font}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("NO PROOF", 0, 6);
  });

/** An index card: four lines of facts, the third one torn out. */
export const cardTexture = () =>
  canvasTexture(512, 320, (g, w, h) => {
    g.fillStyle = "#fbfaf6";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#f2541a";
    g.fillRect(36, 40, 140, 16);
    g.fillStyle = "#c9c7c1";
    [96, 150, 258].forEach((y, i) => g.fillRect(36, y, [400, 330, 370][i], 12));
    g.strokeStyle = "#e1261c";
    g.lineWidth = 6;
    g.setLineDash([18, 14]);
    g.strokeRect(36, 192, 300, 40);
  });

/** A letter with three blank lines to fill in. */
export const letterTexture = () =>
  canvasTexture(512, 320, (g, w, h) => {
    g.fillStyle = "#fbfaf6";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#1c1c1b";
    [70, 150, 230].forEach((y) => {
      g.fillRect(40, y, 120, 14);
      g.fillStyle = "#d4d2cc";
      g.fillRect(180, y + 10, 290, 4);
      g.fillStyle = "#1c1c1b";
    });
    g.fillStyle = "#f2541a";
    g.fillRect(182, 236, 6, 30);
  });

/** Soft round shadow for under floating objects. */
export const blobTexture = () =>
  canvasTexture(128, 128, (g) => {
    const r = g.createRadialGradient(64, 64, 2, 64, 64, 62);
    r.addColorStop(0, "rgba(28,24,20,0.5)");
    r.addColorStop(1, "rgba(28,24,20,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
  });
