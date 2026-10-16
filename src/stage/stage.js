// Renderer, studio light, a fixed camera, and the placement of each 3D moment on screen.
import * as THREE from "three";
import { buildWorld } from "./world.js";
import { pose } from "./timeline.js";

const FOV = 30;
const CAM_Z = 14;
const PORTRAIT = 0.9; // width / height below which portrait frames and layouts apply

// A studio for reflections: a mid-grey room with bright HDR softboxes, so glossy white
// surfaces show their form (dark falloff, crisp highlights) instead of reading flat.
function studio(renderer) {
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.SphereGeometry(30, 32, 16), new THREE.MeshBasicMaterial({ color: 0x7a7672, side: THREE.BackSide })));
  const panel = (w, h, c, k, x, y, z) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    s.add(m);
  };
  panel(16, 9, 0xffffff, 3.2, -7, 12, 9); // key softbox, top left
  panel(9, 12, 0xfff1e6, 1.7, 14, 3, 6); // warm fill, right
  panel(20, 3, 0xffffff, 2.4, 0, 6, -14); // rim strip behind
  panel(18, 6, 0xeeeae4, 0.9, 0, -13, 5); // floor bounce
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(s, 0.03, 0.1, 100, { size: 128 }).texture;
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
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  const scene = new THREE.Scene();
  scene.environment = studio(renderer);
  await new Promise((r) => setTimeout(r, 0));
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2ca, 0.35));
  // The key light casts soft shadows onto a floor under whichever moment is on screen.
  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.castShadow = true;
  key.shadow.mapSize.set(512, 512);
  key.shadow.radius = 22;
  key.shadow.blurSamples = 20;
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.02;
  scene.add(key, key.target);
  const LIGHT_DIR = new THREE.Vector3(-0.38, 1, 0.42).normalize();

  const world = await buildWorld({ font });
  scene.add(world.root);
  world.root.traverse((o) => {
    if (o.isMesh && !o.userData.catcher) o.castShadow = !o.material.transparent;
  });

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
  // On portrait screens a moment can sit under its scene's copy: tops[name] is the copy's
  // bottom edge as a fraction of the height. The moment then shrinks and drops to fit below it.
  // bottoms[name] does the same for copy below the moment (its top edge as a fraction).
  const tops = {};
  const bottoms = {};
  const setTop = (name, top, bottom = 0.97) => ((tops[name] = top), (bottoms[name] = bottom));
  const fit = (fr, name) => {
    const top = tops[name];
    if (top == null) return fr;
    const bottom = bottoms[name];
    const min = Math.min(width, height);
    const room = Math.max(0.2, bottom - top) * height; // px between the copy above and below
    const s = Math.min(fr.s, room / min);
    const half = (s * min) / 2 / height;
    return { ...fr, s, y: Math.min(Math.max(fr.y, top + half), bottom - half) };
  };
  const frameOf = (P, name) => fixedFrame || (portrait() ? fit(P.frames[name].P, name) : P.frames[name].L);

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

  /** Aim the shadow camera at the biggest visible moment. */
  function aimLight() {
    let best = null;
    for (const m of Object.values(world.moments)) if (m.group.visible && (!best || m.group.scale.x > best.group.scale.x)) best = m;
    if (!best) return;
    const r = best.radius * best.group.scale.x * 1.5;
    key.target.position.copy(best.group.position);
    key.position.copy(best.group.position).addScaledVector(LIGHT_DIR, r * 4);
    const cam = key.shadow.camera;
    cam.left = cam.bottom = -r;
    cam.right = cam.top = r;
    cam.near = 0.1;
    cam.far = r * 8;
    cam.updateProjectionMatrix();
  }

  function renderPose(P, time = 0) {
    world.apply(P, { place: placer(P), time, portrait: portrait() });
    aimLight();
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

  return { renderer, setSize, setTop, render, renderPose, anchors, bounds, canvas };
}
