"use client";

// The 3D yard, drawn with three.js. Beds, plants and shade-casting objects come from the garden plan;
// a directional light placed at the computed sun position casts real shadows. Click an item to select
// it, drag it to move it, or focus the view and use the arrow keys. Renders only when something changes.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createBlenderNav } from "@/frontend/planner/blenderNav";
import ViewControls from "@/frontend/planner/ViewControls";
import { snapToGrid } from "@/frontend/planner/model";
import { buildBuilding } from "@/frontend/planner/houseModel";
import { sunVector } from "@/frontend/planner/sun";

const PALETTES = {
  light: { sky: 0xe6eef0, lawn: 0x9dbf7e, outside: 0xc9d0bf, gridLine: 0x86a96b, soil: 0x6e4c30, wood: 0xa57a45, wall: 0xe0d6c6, roof: 0x8a4f3c, houseWall: 0xf3f1ec, houseRoof: 0x4a5059, trim: 0xfbfaf7, glass: 0x2b3a42, shutter: 0x8db4d9, door: 0x8fb8dc, brick: 0xa4513c, trunk: 0x6b4a33, leaf: 0x3f7134, hedge: 0x46733b, fence: 0x9c7c57, select: 0xf1c54b, path: 0xe0a21d, label: "#33402f" },
  dark: { sky: 0x101612, lawn: 0x3d5a35, outside: 0x1c241e, gridLine: 0x4d6b43, soil: 0x4a3322, wood: 0x7d5c37, wall: 0x9b9387, roof: 0x6a3d30, houseWall: 0xb9b6ae, houseRoof: 0x353a41, trim: 0xc9c7c1, glass: 0x162026, shutter: 0x5d7e9e, door: 0x6385a6, brick: 0x7a3d2e, trunk: 0x4f3826, leaf: 0x2f5a2a, hedge: 0x34582e, fence: 0x7a6146, select: 0xf0c85a, path: 0xe2b544, label: "#d8ddd4" },
};
const KIND_COLOR = { veg: 0x4f8f3a, herb: 0x7aa860, fruit: 0x3f7d3a, flower: 0x8f6fb0 };
const FRUIT_COLOR = { strawberry: 0xd23a33, tomato: 0xd8442f, pepper: 0xd8442f, blueberry: 0x4a5fa8, citrus: 0xf0a020, apple: 0xc8372d, persimmon: 0xe58a2a, watermelon: 0x2f7a3a, "winter-squash": 0xe08a2a };

function isDarkTheme() {
  const bg = getComputedStyle(document.body).backgroundColor.match(/\d+/g);
  if (!bg) return false;
  const [r, g, b] = bg.map(Number);
  return (r * 299 + g * 587 + b * 114) / 1000 < 100;
}

function disposeTree(object) {
  object.traverse((o) => {
    o.geometry?.dispose();
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    mats.forEach((m) => {
      m.map?.dispose();
      m.dispose();
    });
  });
}

function hashHue(id) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return (h / 997 - 0.5) * 0.08;
}

// Unit shapes for plants, scaled per instance. Origins sit at ground level.
function plantGeometry(habit) {
  switch (habit) {
    case "tall":
    case "clump":
      return new THREE.ConeGeometry(0.5, 1, 7).translate(0, 0.5, 0);
    case "vine":
    case "cane":
      return new THREE.CylinderGeometry(0.5, 0.5, 1, 7).translate(0, 0.5, 0);
    case "root":
      return new THREE.ConeGeometry(0.5, 1, 6).translate(0, 0.5, 0);
    default:
      return new THREE.SphereGeometry(0.5, 12, 8).translate(0, 0.5, 0);
  }
}

// [width, height] in feet of one plant's 3D shape.
function plantSize(crop) {
  const sp = crop.spacingIn / 12;
  const h = Math.min(crop.heightFt, 8);
  switch (crop.habit) {
    case "leafy": return [Math.min(sp * 0.9, 1.6), Math.min(h, 1.2)];
    case "root": return [Math.min(sp * 0.9, 0.5), Math.min(h, 0.9)];
    case "groundcover": return [Math.min(sp * 0.95, 2.5), Math.min(h, 0.5)];
    case "tall": return [Math.min(sp * 0.7, 1.4), h];
    case "clump": return [Math.min(sp * 0.7, 1), h];
    case "vine": return [0.35, h];
    case "cane": return [0.6, h];
    case "tree": return [Math.min(sp * 0.6, 8), Math.min(h, 12)];
    default: return [Math.min(sp * 0.85, Math.max(1, h * 0.8)), h];
  }
}

function addPlants(group, bed, crops, palette) {
  if (!crops.length) return;
  const top = bed.type === "raised" ? bed.h : 0.08;
  const alongX = bed.w >= bed.d;
  const stripLen = (alongX ? bed.w : bed.d) / crops.length;
  crops.forEach((crop, i) => {
    let sp = Math.max(0.3, crop.spacingIn / 12);
    const spanA = stripLen;
    const spanB = alongX ? bed.d : bed.w;
    let ca = Math.max(1, Math.floor(spanA / sp));
    let cb = Math.max(1, Math.floor(spanB / sp));
    while (ca * cb > 72) {
      sp *= 1.25;
      ca = Math.max(1, Math.floor(spanA / sp));
      cb = Math.max(1, Math.floor(spanB / sp));
    }
    const [size, height] = plantSize(crop);
    const color = new THREE.Color(KIND_COLOR[crop.kind] || KIND_COLOR.veg).offsetHSL(hashHue(crop.id), 0, 0);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
    const mesh = new THREE.InstancedMesh(plantGeometry(crop.habit), mat, ca * cb);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const m = new THREE.Matrix4();
    let n = 0;
    const startA = -((alongX ? bed.w : bed.d) / 2) + i * stripLen;
    for (let a = 0; a < ca; a++) {
      for (let b = 0; b < cb; b++) {
        const pa = startA + (a + 0.5) * (spanA / ca);
        const pb = -spanB / 2 + (b + 0.5) * (spanB / cb);
        const [px, pz] = alongX ? [pa, pb] : [pb, pa];
        const flat = crop.habit === "leafy" || crop.habit === "groundcover";
        m.compose(new THREE.Vector3(px, top, pz), new THREE.Quaternion(), new THREE.Vector3(size, flat ? height : height, size));
        mesh.setMatrixAt(n++, m);
      }
    }
    group.add(mesh);
    const fruit = FRUIT_COLOR[crop.id];
    if (fruit && n) {
      const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 6, 4), new THREE.MeshStandardMaterial({ color: fruit }), n);
      const p = new THREE.Vector3();
      for (let k = 0; k < n; k++) {
        mesh.getMatrixAt(k, m);
        p.setFromMatrixPosition(m);
        m.makeTranslation(p.x + size * 0.25, top + height * 0.55, p.z + size * 0.2);
        dots.setMatrixAt(k, m);
      }
      group.add(dots);
    }
  });
}

function buildBed(bed, cropsById, palette) {
  const group = new THREE.Group();
  const soil = new THREE.MeshStandardMaterial({ color: palette.soil, roughness: 1 });
  if (bed.type === "raised") {
    const wood = new THREE.MeshStandardMaterial({ color: palette.wood, roughness: 0.9 });
    const t = 0.17;
    const h = Math.max(0.3, bed.h);
    const sides = [
      [bed.w, h, t, 0, -bed.d / 2 + t / 2],
      [bed.w, h, t, 0, bed.d / 2 - t / 2],
      [t, h, bed.d - 2 * t, -bed.w / 2 + t / 2, 0],
      [t, h, bed.d - 2 * t, bed.w / 2 - t / 2, 0],
    ];
    for (const [w, hh, d, x, z] of sides) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(w, hh, d), wood);
      side.position.set(x, hh / 2, z);
      side.castShadow = true;
      side.receiveShadow = true;
      group.add(side);
    }
    const fill = new THREE.Mesh(new THREE.BoxGeometry(bed.w - 2 * t, h - 0.08, bed.d - 2 * t), soil);
    fill.position.y = (h - 0.08) / 2;
    fill.receiveShadow = true;
    group.add(fill);
  } else {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(bed.w, 0.08, bed.d), soil);
    slab.position.y = 0.04;
    slab.receiveShadow = true;
    group.add(slab);
  }
  addPlants(group, bed, bed.crops.map((id) => cropsById[id]).filter(Boolean), palette);
  return group;
}

function buildObstacle(o, palette) {
  const group = new THREE.Group();
  const mesh = (geo, color, y) => {
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.9 }));
    m.position.y = y;
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
    return m;
  };
  if (o.kind === "house" || o.kind === "shed") {
    group.add(buildBuilding(o, palette)); // houseModel.js
  } else if (o.kind === "tree") {
    const canopyR = Math.min(Math.max(o.w, o.d) / 2, o.h / 2);
    const trunkH = o.h - canopyR;
    mesh(new THREE.CylinderGeometry(0.35, 0.55, trunkH, 8), palette.trunk, trunkH / 2);
    mesh(new THREE.SphereGeometry(canopyR, 18, 12), palette.leaf, o.h - canopyR);
  } else {
    mesh(new THREE.BoxGeometry(o.w, o.h, o.d), o.kind === "hedge" ? palette.hedge : palette.fence, o.h / 2);
  }
  return group;
}

function textSprite(text, color) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.font = "bold 44px Archivo, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text, 32, 34);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthWrite: false }));
  sprite.scale.set(3, 3, 1);
  return sprite;
}

// Sun-hours colors: deep shade (blue) through part shade (teal) and part sun (yellow) to full sun (orange).
const HEAT_STOPS = [
  [0, [46, 64, 120]],
  [2, [40, 130, 140]],
  [4, [230, 200, 70]],
  [6, [240, 140, 40]],
  [9, [214, 80, 40]],
];
function heatColor(hours) {
  for (let i = 1; i < HEAT_STOPS.length; i++) {
    const [h1, c1] = HEAT_STOPS[i];
    const [h0, c0] = HEAT_STOPS[i - 1];
    if (hours <= h1) {
      const t = (hours - h0) / (h1 - h0);
      return c0.map((v, k) => Math.round(v + (c1[k] - v) * t));
    }
  }
  return HEAT_STOPS[HEAT_STOPS.length - 1][1];
}

const NO_WEBGL = "Your browser couldn't start 3D graphics (WebGL). You can still plan with the panel and the report below.";
function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function GardenScene({ garden, cropsById, sun, path, heat, selectedId, onSelect, onMove, onDelete, view, viewTick, snapStep, gridSize, label }) {
  const mountRef = useRef(null);
  const stateRef = useRef(null);
  const propsRef = useRef({});
  // This component only renders in the browser (loaded with ssr: false), so the check can run here.
  const [error, setError] = useState(() => (webglAvailable() ? "" : NO_WEBGL));
  const [themeKey, setThemeKey] = useState(0);
  // Shared with the overlay (ViewControls): the camera navigation, and who to tell when the view moves.
  // (A ref, not state: the scene fills in hub.nav after it sets up.)
  const hubRef = useRef({ nav: null, listeners: new Set() });
  // Event handlers set up once read the latest props through this ref.
  useLayoutEffect(() => {
    propsRef.current = { garden, onSelect, onMove, onDelete, selectedId, snapStep, gridSize };
  });

  // One-time setup: renderer, camera, controls, lights, pointer and keyboard handling.
  useEffect(() => {
    const mount = mountRef.current;
    if (error) return undefined;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      queueMicrotask(() => setError(NO_WEBGL)); // the context can still fail after the check above
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const canvas = renderer.domElement;
    canvas.tabIndex = 0;
    canvas.className = "scene-canvas";
    canvas.setAttribute("role", "application");
    mount.appendChild(canvas);

    const scene = new THREE.Scene();
    const persp = new THREE.PerspectiveCamera(45, 1, 0.5, 2000);
    const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 5000);
    const controls = new OrbitControls(persp, canvas);
    controls.maxPolarAngle = Math.PI / 2; // down to ground level, for Blender's front and side views
    controls.minDistance = 8;
    controls.maxDistance = 600;
    const hemi = new THREE.HemisphereLight(0xffffff, 0x445533, 0.9);
    const sunLight = new THREE.DirectionalLight(0xfff2d6, 2.2);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.bias = -0.0005;
    scene.add(hemi, sunLight, sunLight.target);

    const world = new THREE.Group(); // ground, grid, compass: rebuilt when the yard changes
    const content = new THREE.Group(); // beds and obstacles: rebuilt when the plan changes
    const overlay = new THREE.Group(); // sun path, sun disc, heat map
    scene.add(world, content, overlay);
    const selection = new THREE.BoxHelper(undefined, 0xf1c54b);
    selection.visible = false;
    scene.add(selection);

    let frame = 0;
    const render = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        renderer.render(scene, nav.camera);
      });
    };

    // Blender-style navigation (blenderNav.js): mouse buttons, number-key views, perspective and
    // orthographic cameras, framing. nav.camera is whichever camera is in use.
    const hub = hubRef.current;
    const nav = createBlenderNav({
      canvas,
      controls,
      persp,
      ortho,
      render,
      getSpan: () => Math.max(propsRef.current.garden.yard.w, propsRef.current.garden.yard.d),
      getSelected: () => {
        const { garden: g, selectedId: id } = propsRef.current;
        const item = id && [...g.beds, ...g.obstacles].find((i) => i.id === id);
        if (!item) return null;
        return { center: [item.x - g.yard.w / 2, 0, item.z - g.yard.d / 2], size: Math.max(item.w, item.d) };
      },
      onChange: () => hub.listeners.forEach((f) => f()),
    });
    hub.nav = nav;

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      nav.resize(w, h);
      render();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // Pointer: click to select, drag a selected item to move it.
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    let drag = null;
    let down = null;
    const toPointer = (e) => {
      const r = canvas.getBoundingClientRect();
      pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(pointer, nav.camera);
    };
    const pickId = () => {
      const hit = raycaster.intersectObjects(content.children, true)[0];
      let o = hit?.object;
      while (o && !o.userData.pickId) o = o.parent;
      return o ? o : null;
    };
    const onPointerDown = (e) => {
      toPointer(e);
      down = { x: e.clientX, y: e.clientY, button: e.button };
      // Only a plain left press picks up a bed. Middle/right buttons, and Alt/Option or Shift with the
      // left button, always move the view instead (Blender's emulated 3-button mouse).
      const navOnly = e.button !== 0 || e.altKey || e.shiftKey || e.ctrlKey || e.metaKey;
      const target = navOnly ? null : pickId();
      if (target) {
        const p = new THREE.Vector3();
        raycaster.ray.intersectPlane(ground, p);
        const { garden: g } = propsRef.current;
        const item = [...g.beds, ...g.obstacles].find((i) => i.id === target.userData.pickId);
        drag = { group: target, item, offset: target.position.clone().sub(p), moved: false, at: null, step: 0 };
        controls.enabled = false;
        canvas.setPointerCapture(e.pointerId);
      }
    };
    const onPointerMove = (e) => {
      if (!drag) return;
      toPointer(e);
      const p = new THREE.Vector3();
      if (!raycaster.ray.intersectPlane(ground, p)) return;
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 4) drag.moved = true;
      if (!drag.moved) return;
      // Snap while dragging, so the item jumps from grid line to grid line. Holding Ctrl does the
      // opposite of the Snap to grid switch, as in Blender.
      const { garden: g, snapStep: on, gridSize: size } = propsRef.current;
      drag.step = e.ctrlKey ? (on ? 0 : size) : on;
      const raw = { ...drag.item, x: p.x + drag.offset.x + g.yard.w / 2, z: p.z + drag.offset.z + g.yard.d / 2 };
      const at = snapToGrid(raw, g.yard, drag.step);
      drag.at = at;
      drag.group.position.set(at.x - g.yard.w / 2, drag.group.position.y, at.z - g.yard.d / 2);
      selection.setFromObject(drag.group);
      render();
    };
    const onPointerUp = (e) => {
      const { garden: g, onSelect: select, onMove: move } = propsRef.current;
      if (drag) {
        const id = drag.group.userData.pickId;
        if (drag.moved && drag.at) move(id, drag.at.x, drag.at.z, drag.step);
        else select(id);
        drag = null;
        controls.enabled = true;
        canvas.releasePointerCapture?.(e.pointerId);
      } else if (down && down.button === 0 && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 4) {
        select(null);
      }
      down = null;
    };
    const onKeyDown = (e) => {
      if (nav.handleKey(e)) return;
      const { garden: g, selectedId: id, onMove: move, onDelete: del, onSelect: select, snapStep: grid } = propsRef.current;
      if (!id) return;
      const item = [...g.beds, ...g.obstacles].find((i) => i.id === id);
      if (!item) return;
      // One grid square per press (1 ft with snapping off); Shift moves five.
      const step = (grid || 1) * (e.shiftKey ? 5 : 1);
      const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (moves[e.key]) {
        e.preventDefault();
        move(id, item.x + moves[e.key][0], item.z + moves[e.key][1], grid);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        del(id);
      } else if (e.key === "Escape") {
        select(null);
      }
    };
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("keydown", onKeyDown);

    // Follow the site's light/dark theme.
    const onTheme = () => setThemeKey((k) => k + 1);
    const mo = new MutationObserver(onTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", onTheme);

    stateRef.current = { renderer, scene, nav, controls, sunLight, hemi, world, content, overlay, selection, render, canvas };
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      mo.disconnect();
      mq.removeEventListener("change", onTheme);
      nav.dispose();
      hub.nav = null;
      controls.dispose();
      [world, content, overlay].forEach(disposeTree);
      renderer.dispose();
      canvas.remove();
      stateRef.current = null;
    };
  }, [error]);

  const yardW = garden.yard.w;
  const yardD = garden.yard.d;
  const north = garden.yard.north;

  // Ground, grid and compass.
  useEffect(() => {
    const s = stateRef.current;
    if (!s) return;
    const palette = PALETTES[isDarkTheme() ? "dark" : "light"];
    s.scene.background = new THREE.Color(palette.sky);
    disposeTree(s.world);
    s.world.clear();
    const span = Math.max(yardW, yardD);
    const outside = new THREE.Mesh(new THREE.PlaneGeometry(span * 4, span * 4), new THREE.MeshStandardMaterial({ color: palette.outside, roughness: 1 }));
    outside.rotation.x = -Math.PI / 2;
    outside.position.y = -0.02;
    outside.receiveShadow = true;
    const lawn = new THREE.Mesh(new THREE.PlaneGeometry(yardW, yardD), new THREE.MeshStandardMaterial({ color: palette.lawn, roughness: 1 }));
    lawn.rotation.x = -Math.PI / 2;
    lawn.receiveShadow = true;
    // Grid lines from the yard's top-left corner: every 5 ft, plus fainter lines at the snap size
    // (skipped when there'd be too many to see, such as 0.5 ft on a big yard).
    const gridLines = (step, opacity) => {
      const geo = [];
      for (let x = 0; x <= yardW + 1e-6; x += step) geo.push(x - yardW / 2, 0.01, -yardD / 2, x - yardW / 2, 0.01, yardD / 2);
      for (let z = 0; z <= yardD + 1e-6; z += step) geo.push(-yardW / 2, 0.01, z - yardD / 2, yardW / 2, 0.01, z - yardD / 2);
      return new THREE.LineSegments(
        new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(geo, 3)),
        new THREE.LineBasicMaterial({ color: palette.gridLine, transparent: true, opacity }),
      );
    };
    const grid = gridLines(5, 0.55);
    if (snapStep && snapStep < 5 && Math.max(yardW, yardD) / snapStep <= 240) s.world.add(gridLines(snapStep, 0.22));
    // Blender's floor axes through the middle of the yard: X in red, Y in green.
    const axisLine = (color, a, b) =>
      new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]), new THREE.LineBasicMaterial({ color }));
    const reach = span / 2 + 3;
    s.world.add(outside, lawn, grid, axisLine(0xe8384f, [-reach, 0.02, 0], [reach, 0.02, 0]), axisLine(0x6ba13a, [0, 0.02, reach], [0, 0.02, -reach]));
    // Compass letters around the yard; true north is the plan's top turned by the yard's bearing.
    const r = span / 2 + 5;
    [["N", 0], ["E", 90], ["S", 180], ["W", 270]].forEach(([letter, bearing]) => {
      const a = ((bearing - north) * Math.PI) / 180;
      const sprite = textSprite(letter, letter === "N" ? "#c0453a" : palette.label);
      sprite.position.set(Math.sin(a) * r, 1.5, -Math.cos(a) * r);
      s.world.add(sprite);
    });
    s.render();
  }, [yardW, yardD, north, themeKey, snapStep]);

  // Beds and obstacles.
  useEffect(() => {
    const s = stateRef.current;
    if (!s) return;
    const palette = PALETTES[isDarkTheme() ? "dark" : "light"];
    disposeTree(s.content);
    s.content.clear();
    const items = [
      ...garden.obstacles.map((o) => [o, buildObstacle(o, palette)]),
      ...garden.beds.map((b) => [b, buildBed(b, cropsById, palette)]),
    ];
    let selected = null;
    for (const [item, group] of items) {
      group.position.set(item.x - garden.yard.w / 2, 0, item.z - garden.yard.d / 2);
      group.userData.pickId = item.id;
      s.content.add(group);
      if (item.id === selectedId) selected = group;
    }
    s.selection.material.color.set(palette.select);
    if (selected) s.selection.setFromObject(selected);
    s.selection.visible = !!selected;
    s.render();
  }, [garden, cropsById, selectedId, themeKey]);

  // Sun light, sun disc and the day's sun path.
  useEffect(() => {
    const s = stateRef.current;
    if (!s) return;
    const palette = PALETTES[isDarkTheme() ? "dark" : "light"];
    disposeTree(s.overlay);
    s.overlay.clear();
    const span = Math.max(yardW, yardD);
    const dome = span * 1.15;
    const toWorld = (alt, az) => {
      const v = sunVector(alt, az, north);
      return new THREE.Vector3(v.x * dome, v.y * dome, v.z * dome);
    };
    if (path.length > 1) {
      const pts = path.map((p) => toWorld(p.altitude, p.azimuth));
      s.overlay.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: palette.path, dashSize: 1.5, gapSize: 1 })).computeLineDistances());
    }
    const up = sun.altitude > 0;
    if (up) {
      const disc = new THREE.Mesh(new THREE.SphereGeometry(Math.max(0.8, span * 0.018), 16, 12), new THREE.MeshBasicMaterial({ color: 0xffd34d }));
      disc.position.copy(toWorld(sun.altitude, sun.azimuth));
      s.overlay.add(disc);
    }
    const dir = sunVector(Math.max(sun.altitude, 2), sun.azimuth, north);
    s.sunLight.position.set(dir.x * span * 1.5, dir.y * span * 1.5, dir.z * span * 1.5);
    s.sunLight.target.position.set(0, 0, 0);
    s.sunLight.intensity = up ? 2.4 * Math.min(1, Math.max(0.25, Math.sin((sun.altitude * Math.PI) / 180) * 1.6)) : 0;
    s.hemi.intensity = up ? 0.9 : 0.35;
    const cam = s.sunLight.shadow.camera;
    const reach = span * 0.9;
    Object.assign(cam, { left: -reach, right: reach, top: reach, bottom: -reach, near: 1, far: span * 4 });
    cam.updateProjectionMatrix();

    if (heat) {
      const { cols, rows, hours } = heat;
      const data = new Uint8Array(cols * rows * 4);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const [cr, cg, cb] = heatColor(hours[r * cols + c]);
          const i = ((rows - 1 - r) * cols + c) * 4;
          data.set([cr, cg, cb, 190], i);
        }
      }
      const tex = new THREE.DataTexture(data, cols, rows, THREE.RGBAFormat);
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(yardW, yardD), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = 0.03;
      s.overlay.add(plane);
    }
    s.render();
  }, [sun, path, heat, yardW, yardD, north, themeKey]);

  // The toolbar's 3D / Top buttons (and a resized yard) reset the view. Top looks straight down in
  // orthographic, like Blender's numpad 7; 3D is the starting perspective view.
  // The first view is set instantly; later changes glide there.
  const firstView = useRef(true);
  useEffect(() => {
    const s = stateRef.current;
    if (!s) return;
    const instant = firstView.current;
    firstView.current = false;
    if (view === "top") s.nav.setView("top", { target: [0, 0, 0], distance: Math.max(yardW, yardD) * 1.4, instant });
    else s.nav.setView("home", { instant });
  }, [view, viewTick, yardW, yardD]);

  // Keep the canvas's accessible name current.
  useEffect(() => {
    stateRef.current?.canvas.setAttribute("aria-label", label);
  }, [label]);

  return (
    <div className="scene" ref={mountRef}>
      {error ? <p className="scene-error">{error}</p> : <ViewControls hubRef={hubRef} />}
    </div>
  );
}
