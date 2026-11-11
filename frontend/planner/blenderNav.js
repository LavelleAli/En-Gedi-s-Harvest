// Blender-style camera navigation for the garden planner's 3D view (used by GardenScene.js).
//
// Axes follow Blender: X (red) runs left to right across the plan, Y (green) runs from the bottom
// of the plan toward the top, and Z (blue) points up. three.js uses Y for up, so internally
//   Blender X = three.js +X,   Blender Y = three.js −Z,   Blender Z = three.js +Y.
//
// Mouse and trackpad
//   Middle-drag (or left-drag on empty ground)  orbit
//   Shift + middle-drag, Shift + left-drag, or right-drag  pan
//   Ctrl + middle-drag, scroll wheel, or pinch  zoom (toward the pointer)
//   Alt/Option + left-drag  orbit even when starting on a bed (the trackpad stand-in for middle-drag)
//   Shift + scroll  pan · Alt/Option + scroll  orbit (two-finger swipes on a trackpad)
// Keys (the number row works like Blender's numpad, for laptops)
//   1 front · 3 right · 7 top · Ctrl/Option + 1 or 3 for back or left (no view from under the ground)
//   5 switch perspective / orthographic
//   2 4 6 8 orbit 15° · Ctrl/Option + 2 4 6 8 pan · + / − zoom
//   Home (or H) frame the whole yard · . (or F) frame the selected item
// Views and framing glide over half a second (GSAP); any mouse, wheel or key move cancels the glide.
import * as THREE from "three";
import { gsap } from "gsap";

// Where the camera sits relative to what it looks at, for each named view (three.js axes).
export const VIEWS = {
  front: { dir: [0, 0, 1], label: "Front" }, // looking toward the top of the plan (Blender +Y)
  back: { dir: [0, 0, -1], label: "Back" },
  right: { dir: [1, 0, 0], label: "Right" },
  left: { dir: [-1, 0, 0], label: "Left" },
  top: { dir: [0, 1, 0], label: "Top" },
};

// Which named view (if any) a camera direction lines up with, within half a degree.
export function viewName(direction) {
  const d = new THREE.Vector3(...direction).normalize();
  for (const [name, v] of Object.entries(VIEWS)) {
    if (d.angleTo(new THREE.Vector3(...v.dir)) < THREE.MathUtils.degToRad(0.5)) return name;
  }
  return null;
}

// The label Blender shows in the corner: "Top Orthographic", "User Perspective", …
export function viewLabel(direction, orthographic) {
  const name = viewName(direction);
  return `${name ? VIEWS[name].label : "User"} ${orthographic ? "Orthographic" : "Perspective"}`;
}

// Orbit an offset (camera position minus target) by angles in radians, around the up axis
// (left/right) and across it (up/down). Stops just short of straight up so "up" stays defined.
export function orbitOffset(offset, dAzimuth, dPolar) {
  const s = new THREE.Spherical().setFromVector3(new THREE.Vector3(...offset));
  s.theta += dAzimuth;
  s.phi = THREE.MathUtils.clamp(s.phi + dPolar, 0.001, Math.PI / 2 - 0.02);
  const v = new THREE.Vector3().setFromSpherical(s);
  return [v.x, v.y, v.z];
}

// Blender's axes as three.js directions, with Blender's colors. Used by the corner gizmo.
export const AXES = [
  { axis: "X", dir: [1, 0, 0], color: "#e8384f", view: "right", opposite: "left" },
  { axis: "Y", dir: [0, 0, -1], color: "#6ba13a", view: "back", opposite: "front" },
  { axis: "Z", dir: [0, 1, 0], color: "#2f83e3", view: "top", opposite: null }, // no view from below ground
];

// Where each axis tip lands on the gizmo, given the camera's rotation as [x, y, z, w]:
// sx/sy run from −1 to 1 (sy down), and depth > 0 means the tip points toward the viewer.
// Returned back to front, so drawing in order puts the nearest tips on top.
export function gizmoAxes(quaternion) {
  const inv = new THREE.Quaternion(...quaternion).invert();
  const tips = [];
  for (const a of AXES) {
    for (const sign of [1, -1]) {
      const v = new THREE.Vector3(...a.dir).multiplyScalar(sign).applyQuaternion(inv);
      tips.push({ key: `${sign < 0 ? "-" : ""}${a.axis}`, axis: a.axis, positive: sign > 0, color: a.color, view: sign > 0 ? a.view : a.opposite, sx: v.x, sy: -v.y, depth: v.z });
    }
  }
  return tips.sort((p, q) => p.depth - q.depth);
}

// A three.js position as Blender coordinates, in feet from the middle of the yard.
export const toBlender = ([x, y, z]) => ({ x, y: -z, z: y });

const KEY_VIEWS = { 1: ["front", "back"], 3: ["right", "left"], 7: ["top", "top"] };
const DEG15 = THREE.MathUtils.degToRad(15);

// Wires the navigation onto an OrbitControls instance. Returns the active camera getter and the
// actions the scene calls (views, framing, keys, resize). onChange runs after every camera move.
export function createBlenderNav({ canvas, controls, persp, ortho, render, getSpan, getSelected, onChange }) {
  let camera = persp;

  // Mouse buttons: middle orbits (Blender), right pans, left orbits on empty ground. OrbitControls
  // already pans when Shift/Ctrl/Meta is held with a rotate button. Ctrl + middle zooms.
  controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.ROTATE, RIGHT: THREE.MOUSE.PAN };
  controls.screenSpacePanning = true; // pan across the screen, like Blender
  controls.zoomToCursor = true;
  controls.minZoom = 0.05;
  controls.maxZoom = 40;
  const onDownCapture = (e) => {
    if (e.button === 1) controls.mouseButtons.MIDDLE = e.ctrlKey ? THREE.MOUSE.DOLLY : THREE.MOUSE.ROTATE;
    if (e.button === 1) e.preventDefault(); // stops the browser's middle-click autoscroll
  };
  canvas.addEventListener("pointerdown", onDownCapture, { capture: true });
  const onAuxClick = (e) => e.button === 1 && e.preventDefault();
  canvas.addEventListener("auxclick", onAuxClick);
  const onContextMenu = (e) => e.preventDefault(); // right-drag pans instead of opening a menu
  canvas.addEventListener("contextmenu", onContextMenu);

  // Shift + scroll pans and Alt/Option + scroll orbits; plain scroll and pinch stay zoom (OrbitControls).
  // Listening on the canvas's parent in the capture phase runs this before OrbitControls sees the event.
  const wheelHost = canvas.parentElement;
  const onWheel = (e) => {
    if (e.target !== canvas || (!e.shiftKey && !e.altKey) || e.ctrlKey) return;
    e.preventDefault();
    e.stopPropagation();
    const h = canvas.clientHeight || 1;
    // Some browsers turn Shift + wheel into a sideways scroll, so use whichever delta moved.
    const dx = e.deltaX;
    const dy = e.deltaY;
    if (e.shiftKey) nav.panScreen(dx / h, -dy / h);
    else nav.orbit((-2 * Math.PI * dx) / h, (-2 * Math.PI * dy) / h);
  };
  wheelHost?.addEventListener("wheel", onWheel, { capture: true, passive: false });

  const changed = () => {
    // Panning can't take the point you orbit around below the lawn (Blender would allow it, but in a
    // yard it only leaves you looking at the underside of the ground). Lift camera and target together.
    if (controls.target.y < 0) {
      camera.position.y -= controls.target.y;
      controls.target.y = 0;
    }
    render();
    onChange?.();
  };
  controls.addEventListener("change", changed);

  const offset = () => camera.position.clone().sub(controls.target);

  // The orthographic camera's frame matches what the perspective camera sees at the target.
  function syncOrtho(distance) {
    const h = 2 * distance * Math.tan(THREE.MathUtils.degToRad(persp.fov / 2));
    const w = h * persp.aspect;
    Object.assign(ortho, { left: -w / 2, right: w / 2, top: h / 2, bottom: -h / 2, zoom: 1 });
    ortho.updateProjectionMatrix();
  }

  function switchCamera(next) {
    if (next === camera) return;
    if (next === ortho) {
      syncOrtho(offset().length());
      ortho.position.copy(camera.position);
    } else {
      // Keep the same framing: pull the perspective camera back to match the orthographic zoom.
      const h = (ortho.top - ortho.bottom) / ortho.zoom;
      const dist = h / (2 * Math.tan(THREE.MathUtils.degToRad(persp.fov / 2)));
      persp.position.copy(controls.target).add(offset().setLength(dist));
    }
    next.quaternion.copy(camera.quaternion);
    camera = next;
    controls.object = camera;
    controls.update();
    changed();
  }

  // The glide in progress, if any. Starting to orbit, pan or zoom by hand stops it where it is.
  let glide = null;
  const stopGlide = () => {
    glide?.kill();
    glide = null;
  };
  controls.addEventListener("start", stopGlide);
  const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Look at `target` from direction `dir` (three.js axes) at `distance`. Glides there over 0.5s:
  // the point looked at moves in a straight line, the camera swings around it (so it never cuts
  // through the scene), and the distance or orthographic zoom eases in step.
  function place(target, dir, distance, { instant = false } = {}) {
    stopGlide();
    const endDir = new THREE.Vector3(...dir).normalize();
    // A view from straight above needs a tiny nudge so "up" (toward the top of the plan) is defined.
    if (dir[0] === 0 && dir[2] === 0) endDir.set(0, 1, 1e-4).normalize();
    const startTarget = controls.target.clone();
    const startDir = offset().normalize();
    const startDistance = distanceNow();
    // The turn from the start direction to the end one. Straight opposite views (front to back) turn
    // around the up axis, so the camera swings around the yard instead of under it.
    const turn = startDir.dot(endDir) < -0.999
      ? new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
      : new THREE.Quaternion().setFromUnitVectors(startDir, endDir);
    const step = new THREE.Quaternion();
    const apply = (t) => {
      controls.target.lerpVectors(startTarget, target, t);
      const d = THREE.MathUtils.lerp(startDistance, distance, t);
      const along = t >= 1 ? endDir : startDir.clone().applyQuaternion(step.identity().slerp(turn, t));
      camera.position.copy(controls.target).addScaledVector(along, d);
      if (camera === ortho) syncOrtho(d);
      controls.update();
      changed();
    };
    if (instant || reducedMotion()) return apply(1);
    const progress = { t: 0 };
    glide = gsap.to(progress, {
      t: 1,
      duration: 0.5,
      ease: "power2.inOut",
      onUpdate: () => apply(progress.t),
      onComplete: () => {
        apply(1);
        glide = null;
      },
    });
  }

  const distanceNow = () => (camera === ortho ? (ortho.top - ortho.bottom) / ortho.zoom / (2 * Math.tan(THREE.MathUtils.degToRad(persp.fov / 2))) : offset().length());

  const nav = {
    get camera() {
      return camera;
    },
    get orthographic() {
      return camera === ortho;
    },
    direction: () => offset().toArray(),

    // Named views switch to orthographic, as Blender does with Auto Perspective.
    // Options: target and distance to look from (default: where the view is now); instant to skip the glide.
    setView(name, { target, distance, instant } = {}) {
      stopGlide();
      if (name === "home") {
        const span = getSpan();
        if (camera !== persp) switchCamera(persp);
        place(new THREE.Vector3(), [0.12, 0.85, 1.25], span * 1.53, { instant });
        return;
      }
      switchCamera(ortho);
      place(target ? new THREE.Vector3(...target) : controls.target.clone(), VIEWS[name].dir, distance ?? distanceNow(), { instant });
    },
    toggleOrtho: () => {
      stopGlide();
      switchCamera(camera === ortho ? persp : ortho);
    },
    frameAll() {
      const span = getSpan();
      const dir = offset().normalize().toArray();
      place(new THREE.Vector3(), dir, span * 1.4);
    },
    frameSelected() {
      const item = getSelected();
      if (!item) return false;
      const dir = offset().normalize().toArray();
      place(new THREE.Vector3(...item.center), dir, Math.max(item.size * 2.5, 12));
      return true;
    },
    orbit(dAz, dPolar) {
      stopGlide();
      const [x, y, z] = orbitOffset(offset().toArray(), dAz, dPolar);
      camera.position.copy(controls.target).add(new THREE.Vector3(x, y, z));
      controls.update();
      changed();
    },
    // Pan by a share of the view's height (0.1 = a tenth of the screen), like dragging the scene.
    panScreen(fx, fy) {
      stopGlide();
      const visible = camera === ortho ? (ortho.top - ortho.bottom) / ortho.zoom : 2 * offset().length() * Math.tan(THREE.MathUtils.degToRad(persp.fov / 2));
      camera.updateMatrix();
      const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0).multiplyScalar(fx * visible);
      const up = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1).multiplyScalar(fy * visible);
      const move = right.add(up);
      camera.position.add(move);
      controls.target.add(move);
      controls.update();
      changed();
    },
    pan(dx, dy) {
      this.panScreen(dx * 0.1, dy * 0.1);
    },
    zoom(factor) {
      stopGlide();
      if (camera === ortho) {
        ortho.zoom = THREE.MathUtils.clamp(ortho.zoom * factor, controls.minZoom, controls.maxZoom);
        ortho.updateProjectionMatrix();
      } else {
        const len = THREE.MathUtils.clamp(offset().length() / factor, controls.minDistance, controls.maxDistance);
        camera.position.copy(controls.target).add(offset().setLength(len));
      }
      controls.update();
      changed();
    },

    // Keyboard shortcuts. Returns true when the key was a navigation key (so the scene ignores it).
    handleKey(e) {
      const digit = /^(?:Digit|Numpad)(\d)$/.exec(e.code)?.[1];
      // Ctrl (or Option on a Mac, where Ctrl/Cmd + number switch desktops or browser tabs).
      const ctrl = e.ctrlKey || e.metaKey || e.altKey;
      if (digit && KEY_VIEWS[digit]) {
        this.setView(KEY_VIEWS[digit][ctrl ? 1 : 0]);
      } else if (digit === "5") {
        this.toggleOrtho();
      } else if (digit && "2468".includes(digit)) {
        const dx = { 4: -1, 6: 1 }[digit] ?? 0;
        const dy = { 8: 1, 2: -1 }[digit] ?? 0;
        if (ctrl) this.pan(dx, dy);
        else this.orbit(-dx * DEG15, -dy * DEG15);
      } else if (e.key === "+" || e.key === "=" || e.code === "NumpadAdd") {
        this.zoom(1.2);
      } else if (e.key === "-" || e.code === "NumpadSubtract") {
        this.zoom(1 / 1.2);
      } else if (e.key === "Home" || e.key === "h" || e.key === "H") {
        this.frameAll();
      } else if (e.key === "." || e.code === "NumpadDecimal" || e.key === "f" || e.key === "F") {
        if (!this.frameSelected()) this.frameAll();
      } else {
        return false;
      }
      e.preventDefault();
      return true;
    },

    resize(w, h) {
      persp.aspect = w / h;
      persp.updateProjectionMatrix();
      if (camera === ortho) syncOrtho(distanceNow());
    },

    dispose() {
      canvas.removeEventListener("pointerdown", onDownCapture, { capture: true });
      canvas.removeEventListener("auxclick", onAuxClick);
      canvas.removeEventListener("contextmenu", onContextMenu);
      stopGlide();
      controls.removeEventListener("change", changed);
      controls.removeEventListener("start", stopGlide);
      wheelHost?.removeEventListener("wheel", onWheel, { capture: true });
    },
  };
  return nav;
}
