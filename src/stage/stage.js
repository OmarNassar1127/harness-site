// Renderer, studio light, a fixed camera, and the placement of each 3D moment on screen.
import * as THREE from "three";
import { buildWorld } from "./world.js";
import { pose } from "./timeline.js";

const FOV = 30;
const CAM_Z = 14;
const PORTRAIT = 0.9; // width / height below which portrait frames and layouts apply

function studio(renderer) {
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.SphereGeometry(30, 32, 16), new THREE.MeshBasicMaterial({ color: 0xc4c1bb, side: THREE.BackSide })));
  const panel = (w, h, c, x, y, z) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    s.add(m);
  };
  panel(18, 10, 0xffffff, -6, 11, 10);
  panel(10, 8, 0xfff0e4, 13, 3, 6);
  panel(8, 14, 0xffd5c0, 0, 4, -14);
  panel(14, 4, 0xf4f4f2, 0, -12, 4);
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(s, 0.04, 0.1, 100, { size: 128 }).texture;
  pm.dispose();
  return tex;
}

export async function createStage(canvas, { font, fixedFrame = null, maxDpr = 2 } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: !!fixedFrame });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.environment = studio(renderer);
  await new Promise((r) => setTimeout(r, 0));
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2ca, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-4, 8, 7);
  scene.add(key);

  const world = await buildWorld({ font });
  scene.add(world.root);

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 80);
  camera.position.set(0, 0, CAM_Z);
  let width = 1;
  let height = 1;
  const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

  function setSize(w, h) {
    width = Math.max(1, Math.round(w));
    height = Math.max(1, Math.round(h));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  const portrait = () => width / height < PORTRAIT;
  const frameOf = (P, name) => fixedFrame || (portrait() ? P.frames[name].P : P.frames[name].L);

  /** World position that puts a moment of radius R at its screen frame. */
  function placer(P) {
    const fpx = height / 2 / tan;
    return (name) => {
      const fr = frameOf(P, name);
      const R = world.moments[name].radius;
      const d = (fpx * R) / ((fr.s * Math.min(width, height)) / 2);
      const nx = fr.x * 2 - 1;
      const ny = 1 - fr.y * 2;
      return new THREE.Vector3(nx * d * tan * camera.aspect, ny * d * tan, CAM_Z - d);
    };
  }

  const v = new THREE.Vector3();
  const toScreen = (p) => {
    v.copy(p).project(camera);
    return { x: ((v.x + 1) / 2) * width, y: ((1 - v.y) / 2) * height };
  };

  function renderPose(P, time = 0) {
    world.apply(P, { place: placer(P), time, portrait: portrait() });
    renderer.render(scene, camera);
    return P;
  }
  const render = (T, time = 0) => renderPose(pose(T), time);

  /** Screen positions of the label anchors above the six parts. */
  const anchors = () => world.anchors(portrait()).map((a) => ({ ...toScreen(a.point), below: a.below }));

  /** Screen boxes of the visible moments (their framing circles). */
  function bounds(P) {
    const boxes = [];
    for (const [name, m] of Object.entries(world.moments)) {
      if (!m.group.visible) continue;
      const fr = frameOf(P, name);
      const r = ((fr.s * Math.min(width, height)) / 2) * m.group.scale.x;
      boxes.push({ name, x0: fr.x * width - r, y0: fr.y * height - r, x1: fr.x * width + r, y1: fr.y * height + r });
    }
    return boxes;
  }

  // Compile every shader before the first frame, in parallel where the browser allows it.
  if (renderer.compileAsync) await renderer.compileAsync(scene, camera);
  renderPose(pose(0));

  return { renderer, setSize, render, renderPose, anchors, bounds, canvas };
}
