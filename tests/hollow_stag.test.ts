// FLOOR 9'S BOSS, THE HOLLOW STAG (src/art/hollow_stag.ts; a mock-up behind STAG_ON, off; nothing of the game
// imports it), held to his art rulebook before he sees it, as a boss (How art is made 7: the whole review, in every
// frame, from in front and from behind). Its four legs and its antlers are not on the heroes' bones, so the review
// (art/boss_checks.ts, made for figures on them) is written out here for it, rule by rule:
//   - crisp pixels; its pink edge while it lives; nothing cyan; every light the enemy's fire; nothing cut off;
//   - its size, his brief's (elk-sized: its shoulder over the knight's head, its antlers towering);
//   - FLOOR: nothing of it below the floor; SLIDE: a hoof that is down stays where it came down;
//   - THROUGH: no leg through another;
//   - JERK: nothing leaps from one frame to the next (a struck hoof and a tossed head are quick, not jumps); its
//     stand's loop closes;
//   - ALIVE: never still; it breathes (its ribs heave) and its weight shifts; loose things follow its moving;
//   - its eye: in its open ribs from either side, burning gold, looking at you, and it blinks.
//   run: tsx --test tests/hollow_stag.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { STAG_FEET, STAG_HABITS, STAG_ON, STAG_STAND, stagChipCount, stagFeet, stagLid, stagPainted, stagSolids } from '../src/art/hollow_stag';
import { RIM_ALPHA } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { stage } from '../src/art/skin';
import { rgba } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; notEqual(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const FIRE = new Set(FLAME.map((c) => rgba(c).slice(0, 3).join(',')));
type Frame = { name: string; alive: boolean; painted: () => Painted };
const frames: Frame[] = [];
const memo = (f: () => Painted): (() => Painted) => {
  let p: Painted | null = null;
  return () => (p ??= f());
};
// every frame the game would show of its stand (fifteen a second), from in front and from behind
const LONG: [string, number, number][] = [['stand', STAG_STAND.period, STAG_STAND.fps]];
for (const view of ['front', 'back'] as const) {
  for (const [move, long, fps] of LONG) {
    const n = Math.round(long * fps);
    for (let i = 0; i < n; i++) frames.push({ name: `${move} ${view} ${i}/${fps}`, alive: move !== 'dying', painted: memo(() => stagPainted(move, i / fps, view)) });
  }
}
type Solid = { part: string; piece: string; shape: any };
const solids = (move: string, t: number, view: 'front' | 'back' = 'front'): Solid[] => stagSolids(move, t, view) as Solid[];
const pieceAt = (move: string, t: number, piece: string): any => solids(move, t).find((x) => x.piece === piece)?.shape;
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
/** The geometry of one moment, each number to a millionth (skins left out). */
function geom(move: string, t: number): string {
  return JSON.stringify(solids(move, t), (k, v) => (k === 'skin' || k === 'ramp' ? undefined : typeof v === 'number' ? Math.round(v * 1e6) : v));
}
/** The largest move of any piece (by its middle) from one thirtieth of a second to the next, among those `which` picks. */
function biggestStep(move: string, long: number, which: (piece: string) => boolean): { d: number; piece: string; t: number } {
  let best = { d: 0, piece: '', t: 0 };
  const n = Math.round(long * 30);
  for (let i = 0; i < n; i++) {
    const a = new Map<string, Solid>(solids(move, i / 30).map((x) => [x.piece, x] as [string, Solid]));
    for (const x of solids(move, (i + 1) / 30)) {
      const before = a.get(x.piece);
      if (!before || !which(x.piece)) continue;
      const p = centreOf(before.shape);
      const q = centreOf(x.shape);
      const d = Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]);
      if (d > best.d) best = { d, piece: x.piece, t: (i + 1) / 30 };
    }
  }
  return best;
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
/** The shortest way between two segments. */
function segGap(p1: number[], q1: number[], p2: number[], q2: number[]): number {
  let best = Infinity;
  for (let i = 0; i <= 24; i++) {
    const a = p1.map((v, k) => v + ((q1[k] - v) * i) / 24);
    for (let j = 0; j <= 24; j++) {
      const b = p2.map((v, k) => v + ((q2[k] - v) * j) / 24);
      best = Math.min(best, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]));
    }
  }
  return best;
}

test('the switch is off, and nothing of the game imports it', () => {
  assert.equal(STAG_ON.on, false);
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('hollow_stag.ts')) continue;
    assert.ok(!/from ['"][^'"]*\/hollow_stag['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the Stag`);
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
    if (f.alive) assert.ok(rim > 300, `${f.name}: its pink edge, ${rim} pixels`);
    else assert.ok(rim === 0, `${f.name}: an edge as it dies`);
  }
});

test('nothing cyan, every light the enemy\'s fire, and nothing of it cut off at its canvas\'s edge', () => {
  for (const f of frames) {
    const { px, lights } = f.painted();
    for (let i = 0; i < px.d.length; i += 4) {
      if (px.d[i + 3] === 0) continue;
      const [h, sat] = hue(px.d[i], px.d[i + 1], px.d[i + 2]);
      assert.ok(!(sat > 0.4 && Math.max(px.d[i], px.d[i + 1], px.d[i + 2]) > 140 && h >= 165 && h <= 205), `${f.name}: cyan`);
    }
    for (const L of lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${f.name}: its light ${L.color}`);
    let cut = 0;
    for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    assert.ok(cut === 0, `${f.name}: ${cut} pixels on its canvas's edge`);
  }
});

test('its size, his brief\'s (“Huge: elk-sized, antlers towering”): its shoulder over the knight\'s head (he is 58 tall), its antlers twice his height', () => {
  let withers = 0;
  let antlers = 0;
  for (const b of solids('stand', 0)) {
    if (/^(shoulder|mantle)$/.test(b.part)) withers = Math.max(withers, topOf(b.shape));
    if (/^antler/.test(b.part)) antlers = Math.max(antlers, topOf(b.shape));
  }
  assert.ok(withers > 62 && withers < 76, `its withers ${withers.toFixed(1)} up`);
  assert.ok(antlers > 116, `its antlers ${antlers.toFixed(1)} up`);
});

test('FLOOR: nothing of it sinks into the floor, in any frame, from in front or behind', () => {
  for (const view of ['front', 'back'] as const) {
    for (const [move, long] of LONG) {
      let low = Infinity;
      for (let i = 0; i <= Math.round(long * 30); i++) for (const x of solids(move, i / 30, view)) low = Math.min(low, bottomOf(x.shape));
      assert.ok(low >= -0.5, `${move} ${view}: its lowest point is ${low.toFixed(2)}, under the floor`);
    }
  }
});

test('SLIDE: its hoofs stay where they stand; only its right forefoot moves, lifted, and it comes down on the spot it left (Movement 8)', () => {
  const dt = 1 / 600;
  let lifted = 0;
  for (let t = 0; t < STAG_STAND.period; t += dt) {
    const feet = stagFeet('stand', t);
    for (let i = 1; i < 4; i++) assert.equal(JSON.stringify(feet[i]), JSON.stringify(STAG_FEET[i]), `hoof ${i} moves at ${t.toFixed(3)} s`);
    const f = feet[0];
    if (f[2] < 1e-6) assert.ok(Math.hypot(f[0] - STAG_FEET[0][0], f[1] - STAG_FEET[0][1]) < 1e-6, `its right forefoot is down off its spot at ${t.toFixed(3)} s`);
    else lifted++;
  }
  assert.ok(lifted * dt > 0.4, `its right forefoot is lifted ${(lifted * dt).toFixed(2)} s of the stand`);
  for (const at of STAG_HABITS.stamps) assert.ok(stagFeet('stand', at)[0][2] < 1e-6 && stagFeet('stand', at - 0.06)[0][2] > 1, `it stamps at ${at} s`);
});

test('THROUGH: no leg passes through another, in any frame (Heroes 6, for every boss)', () => {
  const legOf = (sol: Solid[], i: number): { a: number[]; b: number[]; r: number }[] =>
    sol.filter((x) => x.part === `leg${i}` && x.shape.k === 'rod' && !/^wrap/.test(x.piece)).map((x) => ({ a: x.shape.a, b: x.shape.b, r: Math.max(x.shape.ra, x.shape.rb) }));
  for (let i = 0; i < 72; i++) {
    const t = (i / 72) * STAG_STAND.period;
    const sol = solids('stand', t);
    for (const [p, q] of [[0, 1], [2, 3], [0, 2], [1, 3]]) {
      for (const s1 of legOf(sol, p)) for (const s2 of legOf(sol, q)) {
        const gap = segGap(s1.a, s1.b, s2.a, s2.b);
        assert.ok(gap > (s1.r + s2.r) * 0.85, `legs ${p} and ${q} pass through each other at ${t.toFixed(2)} s (${gap.toFixed(2)} apart)`);
      }
    }
  }
});

test('JERK: nothing leaps from one frame to the next; a struck hoof and a tossed head are quick, the rest of it slow (Movement 5); its loop closes', () => {
  // (its hoof as it strikes the floor comes down fast, 10 picture pixels in its last thirtieth of a second, and its
  // lower leg with it; its antlers' tips, far out from its neck, swing as it tosses its head and snorts, up to about 9; its body only shifts and breathes)
  const hoof = (p: string): boolean => /^(hoof|pastern|fet|cannon|knob|fore|arm|wrap)0/.test(p) || /^wrap0_/.test(p);
  const crown = (p: string): boolean => /^(beam|tine|burr|moss|ear|cranium|muzzle|jaw|socket|poll)/.test(p);
  const strike = biggestStep('stand', STAG_STAND.period, hoof);
  assert.ok(strike.d <= 11, `its striking foreleg: ${strike.piece} moves ${strike.d.toFixed(1)} in a thirtieth, at ${strike.t.toFixed(3)} s`);
  const head = biggestStep('stand', STAG_STAND.period, crown);
  assert.ok(head.d <= 9, `its head: ${head.piece} moves ${head.d.toFixed(1)} in a thirtieth, at ${head.t.toFixed(3)} s`);
  const rest = biggestStep('stand', STAG_STAND.period, (p) => !hoof(p) && !crown(p));
  assert.ok(rest.d <= 3.2, `the rest of it: ${rest.piece} moves ${rest.d.toFixed(1)} in a thirtieth, at ${rest.t.toFixed(3)} s`);
  assert.equal(geom('stand', 0), geom('stand', STAG_STAND.period), 'its stand\'s last moment is not its first');
});

test('ALIVE: never still from one frame to the next; it breathes, its ribs heaving; its weight shifts; what hangs from it follows its moving (Movement 4, 6)', () => {
  for (let i = 0; i < STAG_STAND.frames; i++) assert.notEqual(geom('stand', i / STAG_STAND.fps), geom('stand', (i + 1) / STAG_STAND.fps), `frames ${i} and ${i + 1} are the same`);
  const ribs = (t: number): number => Math.hypot(...(pieceAt('stand', t, 'hollow').ax[1] as number[]));
  let lo = Infinity;
  let hi = -Infinity;
  const side: number[] = [];
  for (let i = 0; i < 48; i++) {
    const t = (i / 48) * STAG_STAND.period;
    lo = Math.min(lo, ribs(t));
    hi = Math.max(hi, ribs(t));
    side.push(pieceAt('stand', t, 'haunch').c[1]);
  }
  assert.ok(hi - lo > 0.6, `its ribs heave ${(hi - lo).toFixed(2)}`);
  assert.ok(Math.max(...side) - Math.min(...side) > 1.5, `its hips sway ${(Math.max(...side) - Math.min(...side)).toFixed(2)} side to side`);
  // (as it stamps, its body jolts down; the tatters hanging from it are flung, their tips moving off from under their roots)
  const tatter = (t: number): number => {
    const top = pieceAt('stand', t, 'tatter-1_01').a;
    const tip = pieceAt('stand', t, 'tatter-1_04').b;
    return Math.hypot(tip[0] - top[0], tip[1] - top[1]);
  };
  let swing = 0;
  for (let t = 0; t < STAG_STAND.period; t += 0.05) swing = Math.max(swing, tatter(t));
  assert.ok(swing > 0.8, `its tatters swing ${swing.toFixed(2)} off true`);
});

test('its eye: in its open ribs from either side, burning gold, looking at you; it glances off and back, and it blinks', () => {
  for (const view of ['front', 'back'] as const) {
    const gold = (t: number): number => {
      const { px } = stagPainted('stand', t, view);
      let n = 0;
      const want = new Set([FLAME[3], FLAME[4]].map((c) => rgba(c).slice(0, 3).join(',')));
      for (let i = 0; i < px.d.length; i += 4) if (px.d[i + 3] === 255 && want.has(`${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`)) n++;
      return n;
    };
    const open = gold(0);
    assert.ok(open > 60, `${view}: ${open} pixels of its gold eye to see`);
    const mid = (STAG_HABITS.blink[0] + STAG_HABITS.blink[1]) / 2;
    assert.ok(gold(mid) < open * 0.15, `${view}: its eye shut, still ${gold(mid)} of gold`);
    // (it looks at you: the way its iris faces is the way to whoever looks)
    const eye = solids('stand', 0, view).find((x) => x.piece === 'eye')!.shape;
    const g = eye.ax[0].map((v: number) => v / Math.hypot(...(eye.ax[0] as number[])));
    const e = stage(view, 0, 0, { w: 2, h: 2 }).eye;
    assert.ok(g[0] * e[0] + g[1] * e[1] + g[2] * e[2] > 0.999, `${view}: its eye looks off you`);
  }
  assert.equal(stagLid('stand', 0.5), 0, 'its eye is open before it blinks');
  assert.ok(stagLid('stand', (STAG_HABITS.blink[0] + STAG_HABITS.blink[1]) / 2) > 0.95, 'and shut as it blinks');
});

test('what its stand throws off comes and goes: clods as it stamps, fog as it snorts, gone before its loop comes round', () => {
  for (const at of STAG_HABITS.stamps) assert.ok(stagChipCount('stand', at + 0.08) > 6, `clods as it stamps at ${at} s`);
  assert.ok(stagChipCount('stand', STAG_HABITS.snort + 0.12) > 15, 'fog as it snorts');
  for (const t of [0, 0.3, 0.8, STAG_STAND.period - 0.02]) assert.equal(stagChipCount('stand', t), 0, `something thrown off at ${t} s`);
});
