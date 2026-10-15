// FLOOR 9'S TWISTED DEER (src/art/twisted_deer.ts; a mock-up behind TWISTED_DEER_ON, off; nothing of the game imports
// it), held to his art rulebook before he sees it, in every frame of its stand from in front and from behind: crisp,
// its pink edge; nothing cyan, every light the enemy's fire; nothing cut off; its size, his brief's (pony-sized, its
// back about the knight's chest, its antlers to about his head); nothing below the floor; its feet grip (only its root
// leg lifts, and comes down on its spot); no leg through another; nothing leaps; its stand never still, closing its loop.
//   run: tsx --test tests/twisted_deer.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { DEER_FEET, DEER_HABITS, DEER_STAND, TWISTED_DEER_ON, deerFeet, deerPainted, deerSolids } from '../src/art/twisted_deer';
import { RIM_ALPHA } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { rgba } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; notEqual(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const FIRE = new Set(FLAME.map((c) => rgba(c).slice(0, 3).join(',')));
type Frame = { name: string; alive: boolean; painted: () => Painted };
const frames: Frame[] = [];
for (const view of ['front', 'back'] as const) {
  for (let i = 0; i < DEER_STAND.frames; i++) {
    let p: Painted | null = null;
    frames.push({ name: `stand ${view} ${i}/${DEER_STAND.fps}`, alive: true, painted: () => (p ??= deerPainted('stand', i / DEER_STAND.fps, view)) });
  }
}
type Solid = { part: string; piece: string; shape: any };
const solids = (move: string, t: number): Solid[] => deerSolids(move, t) as Solid[];
function bottomOf(sh: any): number {
  if (sh.k === 'rod') return Math.min(sh.a[2] - sh.ra, sh.b[2] - sh.rb);
  if (sh.k === 'ball') return sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  return Infinity;
}
function topOf(sh: any): number {
  if (sh.k === 'rod') return Math.max(sh.a[2] + sh.ra, sh.b[2] + sh.rb);
  if (sh.k === 'ball') return sh.c[2] + Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  return -Infinity;
}
function centreOf(sh: any): number[] {
  if (sh.k === 'rod') return [(sh.a[0] + sh.b[0]) / 2, (sh.a[1] + sh.b[1]) / 2, (sh.a[2] + sh.b[2]) / 2];
  if (sh.k === 'dot' || sh.k === 'glow') return sh.p;
  return sh.c;
}
function geom(move: string, t: number): string {
  return JSON.stringify(solids(move, t), (k, v) => (k === 'skin' || k === 'ramp' ? undefined : typeof v === 'number' ? Math.round(v * 1e6) : v));
}
function hue(r: number, g: number, b: number): [number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return [0, 0];
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  return [(h + 360) % 360, (max - min) / max];
}
function segGap(p1: number[], q1: number[], p2: number[], q2: number[]): number {
  let best = Infinity;
  for (let i = 0; i <= 20; i++) {
    const a = p1.map((v, k) => v + ((q1[k] - v) * i) / 20);
    for (let j = 0; j <= 20; j++) {
      const b = p2.map((v, k) => v + ((q2[k] - v) * j) / 20);
      best = Math.min(best, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]));
    }
  }
  return best;
}

test('the switch is off, and nothing of the game imports it', () => {
  assert.equal(TWISTED_DEER_ON.on, false);
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('twisted_deer.ts')) continue;
    assert.ok(!/from ['"][^'"]*\/twisted_deer['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the deer`);
  }
});

test('crisp: every pixel all there or not at all (but the pink edge); its pink edge round it while it lives', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  for (const f of frames) {
    const { px } = f.painted();
    let soft = 0;
    let rim = 0;
    for (let i = 0; i < px.d.length; i += 4) {
      const a = px.d[i + 3];
      if (a === 0 || a === 255) continue;
      if (a === RIM_ALPHA && px.d[i] === pr && px.d[i + 1] === pg && px.d[i + 2] === pb) rim++;
      else soft++;
    }
    assert.ok(soft === 0, `${f.name}: ${soft} soft pixels`);
    assert.ok(rim > 150, `${f.name}: its pink edge, ${rim} pixels`);
  }
});

test('nothing cyan, every light the enemy\'s fire, its eyes burning, and nothing of it cut off at its canvas\'s edge', () => {
  for (const f of frames) {
    const { px, lights } = f.painted();
    let eyes = 0;
    for (let i = 0; i < px.d.length; i += 4) {
      if (px.d[i + 3] === 0) continue;
      const [h, sat] = hue(px.d[i], px.d[i + 1], px.d[i + 2]);
      assert.ok(!(sat > 0.4 && Math.max(px.d[i], px.d[i + 1], px.d[i + 2]) > 140 && h >= 165 && h <= 205), `${f.name}: cyan`);
      if (FIRE.has(`${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`)) eyes++;
    }
    assert.ok(eyes > 0, `${f.name}: its eyes`);
    for (const L of lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${f.name}: its light ${L.color}`);
    let cut = 0;
    for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    assert.ok(cut === 0, `${f.name}: ${cut} pixels on its canvas's edge`);
  }
});

test('its size, his brief\'s (“Pony-sized, dangerous in a pack”): its back about the knight\'s chest, its antlers up to about his head (he is 58 tall)', () => {
  let back = 0;
  let antlers = 0;
  for (const b of solids('stand', 0)) {
    if (/^(body|haunch)$/.test(b.part)) back = Math.max(back, topOf(b.shape));
    if (/^antler/.test(b.part)) antlers = Math.max(antlers, topOf(b.shape));
  }
  assert.ok(back > 34 && back < 44, `its back ${back.toFixed(1)} up`);
  assert.ok(antlers > 54 && antlers < 74, `its antlers ${antlers.toFixed(1)} up`);
});

test('FLOOR: nothing of it below the floor, in any frame', () => {
  let low = Infinity;
  for (let i = 0; i <= Math.round(DEER_STAND.period * 30); i++) for (const x of solids('stand', i / 30)) low = Math.min(low, bottomOf(x.shape));
  assert.ok(low >= -0.5, `its lowest point is ${low.toFixed(2)}, under the floor`);
});

test('SLIDE: its feet stay where they stand; only its root leg lifts, and it comes down on the spot it left (Movement 8)', () => {
  const dt = 1 / 600;
  let lifted = 0;
  for (let t = 0; t < DEER_STAND.period; t += dt) {
    const feet = deerFeet('stand', t);
    for (const i of [0, 1, 3]) assert.equal(JSON.stringify(feet[i]), JSON.stringify(DEER_FEET[i]), `foot ${i} moves at ${t.toFixed(3)} s`);
    const f = feet[2];
    if (f[2] < 1e-6) assert.ok(Math.hypot(f[0] - DEER_FEET[2][0], f[1] - DEER_FEET[2][1]) < 1e-6, `its root leg is down off its spot at ${t.toFixed(3)} s`);
    else lifted++;
  }
  assert.ok(lifted * dt > 0.15, `its root leg lifted ${(lifted * dt).toFixed(2)} s`);
});

test('THROUGH: no leg through another, in any frame', () => {
  const legOf = (sol: Solid[], i: number): { a: number[]; b: number[]; r: number }[] =>
    sol.filter((x) => x.part === `leg${i}` && x.shape.k === 'rod' && !/^(wrap|rtoe|rshank)/.test(x.piece)).map((x) => ({ a: x.shape.a, b: x.shape.b, r: Math.max(x.shape.ra, x.shape.rb) }));
  for (let i = 0; i < 60; i++) {
    const t = (i / 60) * DEER_STAND.period;
    const sol = solids('stand', t);
    for (const [p, q] of [[0, 1], [2, 3], [0, 2], [1, 3]]) {
      for (const s1 of legOf(sol, p)) for (const s2 of legOf(sol, q)) assert.ok(segGap(s1.a, s1.b, s2.a, s2.b) > (s1.r + s2.r) * 0.85, `legs ${p} and ${q} through each other at ${t.toFixed(2)} s`);
    }
  }
});

test('JERK and ALIVE: never still from one frame to the next, nothing leaps (its head\'s snaps quick, the rest slow), its loop closes (Movement 5, 6)', () => {
  for (let i = 0; i < DEER_STAND.frames; i++) assert.notEqual(geom('stand', i / DEER_STAND.fps), geom('stand', (i + 1) / DEER_STAND.fps), `frames ${i} and ${i + 1} are the same`);
  assert.equal(geom('stand', 0), geom('stand', DEER_STAND.period), 'its loop does not close');
  const crown = (p: string): boolean => /^(beam|fork|thorn|fthorn|burr|cranium|muzzle|nose|jaw|ear|eye)/.test(p);
  let head = 0;
  let rest = 0;
  for (let i = 0; i < Math.round(DEER_STAND.period * 30); i++) {
    const a = new Map(solids('stand', i / 30).map((x) => [x.piece, x] as [string, Solid]));
    for (const x of solids('stand', (i + 1) / 30)) {
      const b = a.get(x.piece);
      if (!b) continue;
      const p = centreOf(b.shape);
      const q = centreOf(x.shape);
      const d = Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]);
      if (crown(x.piece)) head = Math.max(head, d);
      else rest = Math.max(rest, d);
    }
  }
  // (its head wrenched round in a few hundredths of a second: its antlers' tips 9 a thirtieth at the most; the rest of it 3)
  assert.ok(head <= 10, `its head moves ${head.toFixed(1)} in a thirtieth`);
  assert.ok(rest <= 4, `the rest of it moves ${rest.toFixed(1)} in a thirtieth`);
  void DEER_HABITS;
});
