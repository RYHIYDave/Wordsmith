// A page that moves: the hall of the still renders, in real time, with the knight to walk about
// in it. For the owner to try on his phone, because nobody knows yet how fast real 3D runs there.
// (5 Oct 2026: "I think when I said 2D I really meant low-poly 3D for the look"; "I think steps
// are a must include"; "I need to be able to jump up and down ledges".)
//
// It is NOT the game: nothing here fights, and none of the game's rules run. It shows the look in
// motion (figures walking, wings beating, fires that flicker and throw moving shadows), a floor
// on two levels with steps between them, and a hop that takes the knight up and down the ledge.
//   node tools/build3d.mjs          builds dist/walk3d.html (double-click) and dist/walk3d_artifact.html (to publish)
//
// Drag anywhere to walk (or W A S D / the arrow keys). JUMP (or Space) hops the way the knight faces.

import { Painter } from '../gl/gl';
import type { Draw, Look, Part, PointLight } from '../gl/gl';
import { batJoints, batParts, cultistBuild, joints, knightBuild, skeletonBuild } from '../gl/figures';
import type { Build, Pose } from '../gl/figures';
import { fire } from '../gl/kit3';
import { hex } from '../gl/mesh';
import type { Mesh, RGB } from '../gl/mesh';
import { SCENES, TOMB, gameCam } from '../gl/scenes';
import { ident, mats, rotZ, scale, translate } from '../gl/vec';
import type { M4, V3 } from '../gl/vec';

declare const __BUILD__: string;

// ---------------------------------------------------------------------------------------------
// The page

const canvas = document.createElement('canvas');
canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;display:block;touch-action:none';
document.body.appendChild(canvas);
const note = document.createElement('div');
note.style.cssText = 'position:fixed;left:calc(10px + env(safe-area-inset-left,0px));top:calc(8px + env(safe-area-inset-top,0px));font:600 13px/1.35 system-ui,-apple-system,sans-serif;color:#d8fffa;text-shadow:0 1px 2px #000;pointer-events:none;white-space:pre';
document.body.appendChild(note);
const hint = document.createElement('div');
hint.style.cssText = 'position:fixed;left:0;right:0;bottom:calc(10px + env(safe-area-inset-bottom,0px));text-align:center;font:600 13px system-ui,-apple-system,sans-serif;color:#b8b4e0;text-shadow:0 1px 2px #000;pointer-events:none';
hint.textContent = 'A test of the look, not the game. Drag anywhere to walk. JUMP hops up or down a ledge.';
document.body.appendChild(hint);
const jump = document.createElement('button');
jump.textContent = 'JUMP';
jump.style.cssText = 'position:fixed;right:calc(18px + env(safe-area-inset-right,0px));bottom:calc(34px + env(safe-area-inset-bottom,0px));width:92px;height:92px;border-radius:50%;border:2px solid #5fe8f0;background:rgba(20,18,48,0.72);color:#d8fffa;font:700 17px system-ui,-apple-system,sans-serif;touch-action:none';
document.body.appendChild(jump);

let painter: Painter;
try {
  painter = new Painter(canvas, 2048, 1024);
} catch (e) {
  note.textContent = `This browser cannot draw 3D here.\n${String(e)}`;
  throw e;
}

// ---------------------------------------------------------------------------------------------
// The hall, and what moves in it

const UP = TOMB.up;
const hall = SCENES.tomb('bare', 1);
const hallPart = painter.keep(hall.mesh);

const kept = new Map<Mesh, Part>();
const partOf = (m: Mesh): Part => {
  let p = kept.get(m);
  if (!p) {
    p = painter.keep(m);
    kept.set(m, p);
  }
  return p;
};

/** The height of the floor at a place, or null where nobody can stand (a wall, the dark outside). */
function ground(x: number, y: number): number | null {
  if (x < 0.5 || y < 0.5 || x > 13.55 || y > 14.55) return null;
  if (x < 5) return UP;
  if (x < 7 && y >= 7 && y <= 10) return (UP * (7 - x)) / 2;
  return 0;
}

/** What stands in the way, as circles on the floor: [x, y, radius]. */
const BLOCKS: ReadonlyArray<readonly [number, number, number]> = [
  [9, 3, 0.5], [12.4, 3, 0.5], [12.4, 12, 0.5], [TOMB.braziers[0][0], TOMB.braziers[0][1], 0.42], [TOMB.braziers[1][0], TOMB.braziers[1][1], 0.42],
  [13.1, 1.0, 0.5], [5.7, 0.9, 0.3], [6.4, 0.75, 0.3], [5.75, 1.75, 0.33], [2.3, 3.7, 0.72], [2.3, 4.5, 0.72], [2.3, 5.3, 0.72], [9.5, 0.86, 0.62],
  [11.2, 13.3, 0.4], [12.6, 13.9, 0.4], [0.9, 13.9, 0.3], [1.5, 14.3, 0.3],
];

const blocked = (x: number, y: number, r: number): boolean => BLOCKS.some((b) => Math.hypot(x - b[0], y - b[1]) < b[2] + r);

interface Walker {
  build: Build;
  x: number;
  y: number;
  z: number;
  /** Which way it faces, in degrees, and the way it is turning to. */
  turn: number;
  want: number;
  /** How far it has walked (its stride follows from this), and how fast it is going just now (0..1 of its pace). */
  gone: number;
  pace: number;
  size: number;
  base: Pose;
  /** Where it walks to and fro between, if it does. */
  beat?: { a: readonly [number, number]; b: readonly [number, number]; to: 0 | 1; speed: number; wait: number };
}

const SIZE = 1.22;
const hero: Walker & { hop: { t: number; x0: number; y0: number; z0: number; x1: number; y1: number; z1: number } | null } = {
  build: knightBuild(), x: 9.3, y: 8.5, z: 0, turn: -70, want: -70, gone: 0, pace: 0, size: SIZE,
  base: { armR: [16, 52, 28], plantR: true, armL: [30, 22, 62] }, hop: null,
};
const skeleton = skeletonBuild();
const walkers: Walker[] = [
  { build: skeleton, x: 11.3, y: 5.6, z: 0, turn: 0, want: 0, gone: 0, pace: 0, size: SIZE, base: { armR: [44, 22, 52], wristR: -112 }, beat: { a: [11.3, 5.6], b: [11.3, 9.4], to: 1, speed: 1.3, wait: 0 } },
  { build: skeleton, x: 10.2, y: 13.2, z: 0, turn: 0, want: 0, gone: 1.7, pace: 0, size: SIZE, base: { armR: [44, 22, 52], wristR: -112 }, beat: { a: [10.2, 13.3], b: [10.2, 10.4], to: 1, speed: 1.1, wait: 1.5 } },
  { build: skeletonBuild(hex('#b02a4a'), 'bow'), x: 12.7, y: 5.3, z: 0, turn: 64, want: 64, gone: 0, pace: 0, size: SIZE, base: { armL: [16, 36, 12], plantL: true, armR: [30, 10, 80] } },
  { build: cultistBuild(), x: 3.9, y: 7.6, z: UP, turn: 0, want: 0, gone: 0, pace: 0, size: SIZE, base: { armR: [84, 30, 44], plantR: true }, beat: { a: [3.9, 7.4], b: [3.9, 11.6], to: 1, speed: 0.8, wait: 0.5 } },
];
const batSolids = batParts();
const flame = fire(0.24, 0.62, 3);

/** The pose of something on two legs, `gone` tiles into its walk, at `pace` of its full stride. */
function stride(w: Walker, t: number): Pose {
  const phase = (w.gone / w.size) * 4.4;
  const s = Math.sin(phase) * w.pace;
  const c = Math.cos(phase);
  const breath = Math.sin(t * 2.1 + w.x);
  const b = w.base;
  const swing = (a: readonly [number, number, number] | undefined, dir: number, held: boolean): [number, number, number] =>
    a ? [a[0] + dir * s * (held ? 7 : 16) + breath * 1.2, a[1], a[2]] : [dir * s * 28, 9, 12 + 12 * w.pace];
  return {
    ...b,
    lean: (b.lean ?? 0) + 5 * w.pace + breath * 0.8,
    twist: (b.twist ?? 0) + s * 5,
    headYaw: -s * 4,
    legR: [30 * s, 38 * Math.max(0, c) * w.pace],
    legL: [-30 * s, 38 * Math.max(0, -c) * w.pace],
    armR: swing(b.armR, -1, !!b.plantR || b.wristR !== undefined),
    armL: swing(b.armL, 1, !!b.plantL),
    lift: 0.025 * Math.abs(c) * w.pace,
  };
}

const turnTo = (dx: number, dy: number): number => (Math.atan2(-dx, dy) * 180) / Math.PI;
function ease(w: Walker, dt: number): void {
  let d = ((w.want - w.turn + 540) % 360) - 180;
  const step = 620 * dt;
  d = Math.max(-step, Math.min(step, d));
  w.turn += d;
}

// ---------------------------------------------------------------------------------------------
// The player's hands

const keys = new Set<string>();
window.addEventListener('keydown', (e) => {
  keys.add(e.code);
  if (e.code === 'Space') {
    e.preventDefault();
    wantHop = true;
  }
});
window.addEventListener('keyup', (e) => keys.delete(e.code));
let stick: { id: number; x0: number; y0: number; x: number; y: number } | null = null;
let wantHop = false;
canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  try {
    canvas.setPointerCapture(e.pointerId);
  } catch {
    /* not fatal */
  }
  if (!stick) stick = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY };
  else wantHop = true;
});
canvas.addEventListener('pointermove', (e) => {
  if (stick && e.pointerId === stick.id) {
    stick.x = e.clientX;
    stick.y = e.clientY;
  }
});
const lift = (e: PointerEvent): void => {
  if (stick && e.pointerId === stick.id) stick = null;
};
canvas.addEventListener('pointerup', lift);
canvas.addEventListener('pointercancel', lift);
jump.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  wantHop = true;
});
for (const name of ['touchstart', 'touchmove', 'touchend', 'gesturestart', 'dblclick', 'contextmenu']) document.addEventListener(name, (e) => e.preventDefault(), { passive: false });

/** Which way the player is pushing, as a direction on the floor (painter's axes), 0..1 long. */
function push(): [number, number] {
  let sx = 0;
  let sy = 0;
  if (stick) {
    sx = stick.x - stick.x0;
    sy = stick.y - stick.y0;
    const l = Math.hypot(sx, sy);
    if (l < 10) return [0, 0];
    const k = Math.min(1, l / 46) / l;
    sx *= k;
    sy *= k;
  } else {
    if (keys.has('KeyA') || keys.has('ArrowLeft')) sx -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) sx += 1;
    if (keys.has('KeyW') || keys.has('ArrowUp')) sy -= 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) sy += 1;
    const l = Math.hypot(sx, sy);
    if (l === 0) return [0, 0];
    sx /= l;
    sy /= l;
  }
  // (right on the screen is -X +Y; down the screen is +X +Y, and counts double: the floor is seen from above)
  const wx = -sx + 2 * sy;
  const wy = sx + 2 * sy;
  const l = Math.hypot(wx, wy);
  const amount = Math.hypot(sx, sy);
  return [(wx / l) * amount, (wy / l) * amount];
}

// ---------------------------------------------------------------------------------------------
// A frame

const WARM: RGB = [3.0, 1.35, 0.42];
const camAt: [number, number, number] = [hero.x, hero.y, 0.55];
// (#q=0 in the page's address holds the detail where it is: for looking at one level of it)
const held = /q=(\d)/.exec(location.hash);
let quality = held ? Number(held[1]) : 0;
let dpr = 1;
function fit(): void {
  const want = [Math.min(2, window.devicePixelRatio || 1), Math.min(1.5, window.devicePixelRatio || 1), 1][Math.min(2, quality)];
  dpr = want;
  const w = Math.max(1, Math.round(window.innerWidth * dpr));
  const h = Math.max(1, Math.round(window.innerHeight * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}
window.addEventListener('resize', fit);
fit();

let last = performance.now();
let shown = 0;
let frames = 0;
let slow = 0;
let fps = 0;
let worst = 0;
let cost = 0;
const started = performance.now();

function update(dt: number, t: number): void {
  // ---- the knight
  if (hero.hop) {
    const h = hero.hop;
    h.t += dt / 0.46;
    const u = Math.min(1, h.t);
    hero.x = h.x0 + (h.x1 - h.x0) * u;
    hero.y = h.y0 + (h.y1 - h.y0) * u;
    hero.z = h.z0 + (h.z1 - h.z0) * u + Math.sin(Math.PI * u) * 0.95;
    hero.pace = 0;
    if (u >= 1) {
      hero.z = h.z1;
      hero.hop = null;
    }
  } else {
    const [px, py] = push();
    const amount = Math.hypot(px, py);
    if (amount > 0.05) {
      hero.want = turnTo(px, py);
      const speed = 3.5 * amount;
      // (each axis by itself, so that the knight slides along a wall or a ledge instead of stopping at it)
      for (const [dx, dy] of [[px * speed * dt, 0], [0, py * speed * dt]] as const) {
        const nx = hero.x + dx;
        const ny = hero.y + dy;
        const g = ground(nx, ny);
        if (g === null || Math.abs(g - hero.z) > 0.17 || blocked(nx, ny, 0.3)) continue;
        hero.x = nx;
        hero.y = ny;
        hero.z = g;
        hero.gone += Math.hypot(dx, dy);
      }
      hero.pace = Math.min(1, hero.pace + dt * 7);
    } else hero.pace = Math.max(0, hero.pace - dt * 6);
    if (wantHop) {
      // a hop the way the knight faces: as far as there is somewhere to land, ledge or no ledge
      const a = (hero.turn * Math.PI) / 180;
      const fx = -Math.sin(a);
      const fy = Math.cos(a);
      for (const far of [2.5, 2.0, 1.5, 1.0]) {
        const x1 = hero.x + fx * far;
        const y1 = hero.y + fy * far;
        const g = ground(x1, y1);
        if (g === null || blocked(x1, y1, 0.3)) continue;
        hero.hop = { t: 0, x0: hero.x, y0: hero.y, z0: hero.z, x1, y1, z1: g };
        break;
      }
    }
  }
  wantHop = false;
  ease(hero, dt);

  // ---- the others: to and fro on their beats; whoever the knight comes near stops and turns to look
  for (const w of walkers) {
    const near = Math.hypot(hero.x - w.x, hero.y - w.y) < 3.2 && Math.abs(hero.z - w.z) < 0.5;
    const b = w.beat;
    let moving = false;
    if (near) w.want = turnTo(hero.x - w.x, hero.y - w.y);
    else if (b) {
      if (b.wait > 0) b.wait -= dt;
      else {
        const goal = b.to === 1 ? b.b : b.a;
        const dx = goal[0] - w.x;
        const dy = goal[1] - w.y;
        const d = Math.hypot(dx, dy);
        if (d < 0.08) {
          b.to = b.to === 1 ? 0 : 1;
          b.wait = 1.2;
        } else {
          w.want = turnTo(dx, dy);
          const step = Math.min(d, b.speed * dt);
          w.x += (dx / d) * step;
          w.y += (dy / d) * step;
          w.gone += step;
          moving = true;
        }
      }
    }
    w.pace = moving ? Math.min(1, w.pace + dt * 5) : Math.max(0, w.pace - dt * 5);
    ease(w, dt);
  }
  // the camera follows, a little behind
  const k = 1 - Math.exp(-dt * 7);
  camAt[0] += (hero.x - camAt[0]) * k;
  camAt[1] += (hero.y - camAt[1]) * k;
  camAt[2] += (0.55 + Math.min(hero.z, UP) * 0.7 - camAt[2]) * k;
  void t;
}

function draws(t: number): { list: Draw[]; lights: PointLight[]; fireAt: V3; fireK: number } {
  const list: Draw[] = [{ part: hallPart, m: ident() }];
  const put = (w: Walker): void => {
    const world = mats(translate(w.x, w.y, w.z), rotZ(w.turn), scale(w.size));
    for (const j of joints(w.build, stride(w, t))) list.push({ part: partOf(j.mesh), m: mats(world, j.m) });
  };
  put(hero);
  for (const w of walkers) put(w);
  // the bat goes round over the lower floor, rising and falling, its wings beating
  const a = t * 0.9;
  const bx = 9.6 + Math.cos(a) * 2.7;
  const by = 8.0 + Math.sin(a) * 3.3;
  const bz = 1.9 + Math.sin(t * 1.7) * 0.25;
  const bw: M4 = mats(translate(bx, by, bz), rotZ(turnTo(-Math.sin(a) * 2.7, Math.cos(a) * 3.3)), scale(SIZE));
  for (const j of batJoints(batSolids, Math.sin(t * 13))) list.push({ part: partOf(j.mesh), m: mats(bw, j.m) });
  // the two fires: each leans and swells by its own clock. The one nearer the knight throws the shadows; the other only lights.
  const lights: PointLight[] = [...hall.lights];
  const flicker = TOMB.braziers.map((_, i) => 0.86 + 0.1 * Math.sin(t * 11 + i * 2.1) + 0.06 * Math.sin(t * 17.3 + i * 4.4));
  const dist = TOMB.braziers.map(([fx, fy]) => Math.hypot(hero.x - fx, hero.y - fy));
  const nearest = dist[0] <= dist[1] ? 0 : 1;
  TOMB.braziers.forEach(([fx, fy], i) => {
    const f1 = Math.sin(t * 11 + i * 2.1);
    const f2 = Math.sin(t * 17.3 + i * 4.4);
    list.push({ part: partOf(flame), m: mats(translate(fx, fy, 0.88), rotZ(t * 50 + i * 90), scale(1 + 0.07 * f2, 1 + 0.07 * f1, 1 + 0.16 * f1 + 0.06 * f2)) });
    if (i !== nearest) lights.push({ at: [fx, fy, 1.28], color: [WARM[0] * 0.85 * flicker[i], WARM[1] * 0.85 * flicker[i], WARM[2] * 0.85 * flicker[i]], reach: 6.5 });
  });
  const fireAt: V3 = [TOMB.braziers[nearest][0], TOMB.braziers[nearest][1], 1.28];
  const fireK = flicker[nearest];
  // the knight's blade lights what is near it
  const ha = (hero.turn * Math.PI) / 180;
  lights.push({ at: [hero.x + Math.cos(ha) * 0.5, hero.y + Math.sin(ha) * 0.5, hero.z + 1.25], color: [0.3, 1.15, 1.3], reach: 3.2 });
  return { list, lights, fireAt, fireK };
}

function frame(now: number): void {
  const now0 = performance.now();
  const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
  const real = now - last;
  last = now;
  const t = (now - started) / 1000;
  update(dt, t);
  const aspect = canvas.width / canvas.height;
  // (a phone held sideways sees what the game's own picture shows; one held upright, enough of the hall to walk in)
  const half = Math.max(5.2, Math.min(9, 6.4 / aspect));
  const d = draws(t);
  const look: Look = {
    ...hall,
    cam: gameCam([camAt[0], camAt[1], camAt[2]], half),
    lights: d.lights.slice(-16),
    fire: { at: d.fireAt, toward: [hero.x, hero.y, hero.z + 0.3], color: [WARM[0] * d.fireK, WARM[1] * d.fireK, WARM[2] * d.fireK], reach: 9.5 },
    mist: { color: [0.004, 0.003, 0.014], at: [7.5, 7.5, 0], near: 12, far: 18 },
  };
  painter.paint(look, d.list);
  // (what the frame cost this page to work out and hand to the card: not what the card then took to draw it)
  cost = cost * 0.9 + (performance.now() - now0) * 0.1;

  // ---- how it is going: said on the page, and acted on (a slow phone gets a coarser picture)
  frames++;
  worst = Math.max(worst, real);
  if (real > 26) slow++;
  if (now - shown > 1000) {
    fps = Math.round((frames * 1000) / (now - shown));
    if (!held && t > 3 && slow > frames * 0.4 && quality < 3) {
      quality++;
      fit();
      if (quality === 2) painter.shadows(1024, 512);
      if (quality === 3) painter.shadows(512, 256);
    }
    note.textContent = `Wordsmith 3D test  ${__BUILD__}\n${fps} frames a second (slowest ${Math.round(worst)} ms)\n${canvas.width} x ${canvas.height}, detail ${4 - quality} of 4, ${Math.round(painter.drawn)} triangles`;
    shown = now;
    frames = 0;
    slow = 0;
    worst = 0;
  }
  requestAnimationFrame(frame);
}

(window as unknown as Record<string, unknown>).__walk = { hero, walkers, painter, quality: () => quality, fps: () => fps, cost: () => cost, hop: () => { wantHop = true; }, keys };
(window as unknown as { __ready: boolean }).__ready = true;
requestAnimationFrame(frame);
