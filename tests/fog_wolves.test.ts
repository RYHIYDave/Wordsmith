// FLOOR 9'S FOG WOLVES (src/art/fog_wolves.ts; a mock-up behind WOLF_ON, off; nothing of the game imports it), held to
// his art rulebook before he sees them, in every frame of its stand from in front and from behind: crisp, its pink
// edge; nothing cyan, every light the enemy's fire, its eyes burning; nothing cut off; its size, his brief's (hip-high
// to the knight); nothing below the floor, and its legs never on it (his pick, a ghostly glide: it hangs in its own
// fog); no leg through another; nothing leaps; its stand never still, closing its loop; its loose fog streaming off it
// and lying low round it, coming and going with its loop.
//   run: tsx --test tests/fog_wolves.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { WOLF_HABITS, WOLF_ON, WOLF_STAND, makeWolfArt, wolfGrains, wolfPainted, wolfSolids } from '../src/art/fog_wolves';
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
type Frame = { name: string; painted: () => Painted };
const frames: Frame[] = [];
for (const view of ['front', 'back'] as const) {
  for (let i = 0; i < WOLF_STAND.frames; i++) {
    let p: Painted | null = null;
    frames.push({ name: `stand ${view} ${i}/${WOLF_STAND.fps}`, painted: () => (p ??= wolfPainted('stand', i / WOLF_STAND.fps, view)) });
  }
}
type Solid = { part: string; piece: string; shape: any };
const solids = (move: string, t: number, view: 'front' | 'back' = 'front'): Solid[] => wolfSolids(move, t, view) as Solid[];
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
  assert.equal(WOLF_ON.on, false);
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('fog_wolves.ts')) continue;
    assert.ok(!/from ['"][^'"]*\/fog_wolves['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the wolves`);
  }
});

test('crisp: every pixel all there or not at all (but the pink edge); its pink edge round it', () => {
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
    assert.ok(rim > 100, `${f.name}: its pink edge, ${rim} pixels`);
  }
});

test('nothing cyan, every light the enemy\'s fire, its eyes burning (his pick, the one thing to know it by), and nothing of it cut off at its canvas\'s edge', () => {
  for (const f of frames) {
    const { px, lights } = f.painted();
    let eyes = 0;
    for (let i = 0; i < px.d.length; i += 4) {
      if (px.d[i + 3] === 0) continue;
      const [h, sat] = hue(px.d[i], px.d[i + 1], px.d[i + 2]);
      assert.ok(!(sat > 0.4 && Math.max(px.d[i], px.d[i + 1], px.d[i + 2]) > 140 && h >= 165 && h <= 205), `${f.name}: cyan`);
      if (FIRE.has(`${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`)) eyes++;
    }
    // (an eye of its own at least two pixels by two: a burning point, not a speck)
    assert.ok(eyes >= 4, `${f.name}: its eyes, ${eyes} pixels`);
    assert.ok(lights.length > 0, `${f.name}: its eyes' light`);
    for (const L of lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${f.name}: its light ${L.color}`);
    let cut = 0;
    for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    assert.ok(cut === 0, `${f.name}: ${cut} pixels on its canvas's edge`);
  }
});

test('its size, his brief\'s (“Lean, hip-high to the knight”): the top of its back about his hip (he is 58 tall), its ears not above his chest; lean, not a beast', () => {
  let back = 0;
  let top = 0;
  let wide = 0;
  for (const b of solids('stand', 0)) {
    if (/^(chest|ruff|waist|haunch)$/.test(b.piece)) back = Math.max(back, topOf(b.shape));
    top = Math.max(top, topOf(b.shape));
    if (b.shape.k === 'ball' && /^(chest|waist|haunch)$/.test(b.piece)) wide = Math.max(wide, 2 * Math.hypot(...(b.shape.ax[1] as number[])));
  }
  assert.ok(back > 27 && back < 34, `its back ${back.toFixed(1)} up`);
  assert.ok(top < 40, `its top ${top.toFixed(1)} up`);
  assert.ok(wide < 12, `its body ${wide.toFixed(1)} wide`);
});

test('FLOOR, AND A GLIDE: nothing of it below the floor, and its legs never on it: they end in fog above it, in every frame (his pick, “A ghostly glide”)', () => {
  let low = Infinity;
  let legs = Infinity;
  for (let i = 0; i <= Math.round(WOLF_STAND.period * 30); i++) {
    for (const x of solids('stand', i / 30)) {
      low = Math.min(low, bottomOf(x.shape));
      if (/^(upper|lower)\d$/.test(x.piece)) legs = Math.min(legs, bottomOf(x.shape));
    }
    for (const g of wolfGrains('stand', i / 30)) assert.ok(g[2] >= 0.3, `a grain of its fog under the floor at ${(i / 30).toFixed(2)} s`);
  }
  assert.ok(low >= 4, `its lowest solid is ${low.toFixed(2)} up`);
  assert.ok(legs >= 4, `its legs' solid fog comes down to ${legs.toFixed(2)}`);
});

test('THROUGH: no leg through another, in any frame', () => {
  const legOf = (sol: Solid[], i: number): { a: number[]; b: number[]; r: number }[] =>
    sol.filter((x) => new RegExp(`^(upper|lower)${i}$`).test(x.piece)).map((x) => ({ a: x.shape.a, b: x.shape.b, r: Math.max(x.shape.ra, x.shape.rb) }));
  for (let i = 0; i < 72; i++) {
    const t = (i / 72) * WOLF_STAND.period;
    const sol = solids('stand', t);
    for (const [p, q] of [[0, 1], [2, 3], [0, 2], [1, 3]]) {
      for (const s1 of legOf(sol, p)) for (const s2 of legOf(sol, q)) assert.ok(segGap(s1.a, s1.b, s2.a, s2.b) > (s1.r + s2.r) * 0.85, `legs ${p} and ${q} through each other at ${t.toFixed(2)} s`);
    }
  }
});

test('JERK and ALIVE: never still from one frame to the next, nothing leaps, its loop closes; it growls, its fangs bared, its ears flat; it glances aside (Movement 5, 6)', () => {
  for (let i = 0; i < WOLF_STAND.frames; i++) assert.notEqual(geom('stand', i / WOLF_STAND.fps), geom('stand', (i + 1) / WOLF_STAND.fps), `frames ${i} and ${i + 1} are the same`);
  assert.equal(geom('stand', 0), geom('stand', WOLF_STAND.period), 'its loop does not close');
  let most = 0;
  for (let i = 0; i < Math.round(WOLF_STAND.period * 30); i++) {
    const a = new Map(solids('stand', i / 30).map((x) => [x.piece, x] as [string, Solid]));
    for (const x of solids('stand', (i + 1) / 30)) {
      const b = a.get(x.piece);
      if (!b) continue;
      const p = centreOf(b.shape);
      const q = centreOf(x.shape);
      most = Math.max(most, Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]));
    }
  }
  assert.ok(most <= 2.5, `something of it moves ${most.toFixed(2)} in a thirtieth`);
  const mid = (WOLF_HABITS.growl[0] + WOLF_HABITS.growl[1]) / 2;
  assert.ok(solids('stand', mid).some((x) => /^l?fang/.test(x.piece)), 'its fangs bared as it growls');
  assert.ok(!solids('stand', 0.1).some((x) => /^l?fang/.test(x.piece)), 'its fangs hidden at rest');
  const nose = (t: number): number[] => solids('stand', t).find((x) => x.piece === 'nose')!.shape.c;
  const g = (WOLF_HABITS.glance[0] + WOLF_HABITS.glance[1]) / 2;
  assert.ok(Math.abs(nose(g)[1] - nose(WOLF_HABITS.glance[0])[1]) > 2, 'it glances aside');
});

test('its loose fog: wisps streaming off it and fog low round it, in every frame; its loop closes', () => {
  for (let i = 0; i < WOLF_STAND.frames; i++) {
    const g = wolfGrains('stand', i / WOLF_STAND.fps);
    assert.ok(g.length > 120, `${g.length} grains of its fog at frame ${i}`);
    assert.ok(g.filter((p) => p[2] < 3).length > 15, 'its fog low on the ground round it');
  }
  const r = (v: ReadonlyArray<readonly number[]>): string => JSON.stringify(v.map((p) => p.map((x) => Math.round(x * 1e4))));
  assert.equal(r(wolfGrains('stand', 0)), r(wolfGrains('stand', WOLF_STAND.period)), 'its loose fog\'s loop does not close');
});

test('its pictures as the game holds them: standing fifteen a second', () => {
  const art = makeWolfArt() as any;
  for (const f of [art.front, art.back]) {
    assert.equal(f.idle.length, WOLF_STAND.frames);
    assert.equal(f.idleFps, 15);
  }
});
