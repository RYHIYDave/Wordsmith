// FLOOR 9'S BOSS, THE HOLLOW STAG (src/art/hollow_stag.ts; in the game through art/act1_figs/stag.ts and what its
// roots draw, render/act1_fx/stag.ts, its switch STAG_ON on with the descent), held to his art rulebook before he sees it, as a boss (How art is made 7: the whole review, in every
// frame, from in front and from behind). Its four legs and its antlers are not on the heroes' bones, so the review
// (art/boss_checks.ts, made for figures on them) is written out here for it, rule by rule:
//   - crisp pixels; its pink edge while it lives; nothing cyan; every light the enemy's fire; nothing cut off;
//   - its size, his brief's (elk-sized: its shoulder over the knight's head, its antlers towering);
//   - FLOOR: nothing of it below the floor (its death aside: the floor swallows it, and nothing of it is seen below);
//   - SLIDE: a hoof that is down stays where it came down (walking and running, the floor going by under it counted);
//   - THROUGH: no leg through another;
//   - JERK: nothing leaps from one frame to the next (its blows are quick, not jumps); its stand and walk close their
//     loops; JUMP: where one move hands over to another, the picture does not leap;
//   - BLOW: every blow wound up, held (the warning, a pose) and followed through; the heavy ones held a tenth;
//   - ALIVE: never still; it breathes (its ribs heave) and its weight shifts; loose things follow its moving;
//   - its eye: in its open ribs from either side, burning gold, looking at you, and it blinks;
//   - its death as his pick asks; its roots' bursts; its pictures as the game holds them.
//   run: tsx --test tests/hollow_stag.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { FIG } from '../src/art/act1_figs/stag';
import { useAct1Figs } from '../src/art/bestiary';
import { ROOT_CANVAS, ROOT_SNAKE, ROOT_STRETCH, STAG_BOUNDS, STAG_BELLOW, STAG_CHARGE, STAG_DIE, STAG_FEET, STAG_GORE, STAG_HABITS, STAG_ON, STAG_PACE, STAG_REEL, STAG_ROOTS, STAG_STAND, STAG_WALK, makeStagArt, rootSnakePainted, stagChipCount, stagFeet, stagLid, stagLong, stagPainted, stagSolids } from '../src/art/hollow_stag';
import { TILE3 } from '../src/art/new_mobs3';
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
// every frame the game would show of its stand (fifteen a second) and its walk (sixteen), and every third of its other
// moves at thirty a second (and their last), from in front and from behind
const MOVES = ['stand', 'walk', 'attack', 'charge', 'roots', 'bellow', 'reel', 'dying'];
const FPS: Record<string, number> = { stand: STAG_STAND.fps, walk: STAG_WALK.fps };
const LONG: [string, number, number][] = MOVES.map((m) => [m, stagLong(m), FPS[m] ?? 30]);
for (const view of ['front', 'back'] as const) {
  for (const [move, long, fps] of LONG) {
    const n = Math.round(long * fps);
    const step = FPS[move] ? 1 : 3;
    for (let i = 0; i <= n; i += i + step > n && i !== n ? n - i : step) {
      if (FPS[move] && i === n) break;
      frames.push({ name: `${move} ${view} ${i}/${fps}`, alive: move !== 'dying', painted: memo(() => stagPainted(move, i / fps, view)) });
    }
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
/** The geometry of one moment, each number to a millionth (skins left out); `hung`: with what hangs from it (its mane, tatters, hanging roots and moss, which swing with how it has been moving, so that its first and last moments of a move are its own). */
function geom(move: string, t: number, hung = true): string {
  const sol = solids(move, t).filter((x) => hung || !/^(mane|ruff|tatter|roots|moss)/.test(x.part));
  return JSON.stringify(sol, (k, v) => (k === 'skin' || k === 'ramp' ? undefined : typeof v === 'number' ? Math.round(v * 1e6) : v));
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

test('it is in the game through art/act1_figs/stag.ts (and its roots through render/act1_fx/stag.ts) alone, and its switch goes on with the descent', () => {
  const users: string[] = [];
  for (const f0 of fs.readdirSync('src', { recursive: true })) {
    const f = f0.split('\\').join('/');
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('hollow_stag.ts')) continue;
    if (/from ['"][^'"]*\/hollow_stag['"]/.test(fs.readFileSync(`src/${f}`, 'utf8'))) users.push(f);
  }
  assert.equal(users.sort().join(', '), 'art/act1_figs/stag.ts, render/act1_fx/stag.ts', 'only its figure and what its roots draw import it');
  assert.ok(FIG !== null && (FIG.switches ?? []).includes(STAG_ON), 'its figure holds its switch');
  useAct1Figs(true);
  assert.equal(STAG_ON.on, true, 'on with the descent');
  useAct1Figs(false);
  assert.equal(STAG_ON.on, false, 'and off without it');
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

test('FLOOR: nothing of it sinks into the floor, in any frame of any move but its death, from in front or behind', () => {
  for (const view of ['front', 'back'] as const) {
    for (const [move, long] of LONG) {
      if (move === 'dying') continue;
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

test('THROUGH: no leg passes through another, in any frame of any move (Heroes 6, for every boss)', () => {
  const legOf = (sol: Solid[], i: number): { a: number[]; b: number[]; r: number }[] =>
    sol.filter((x) => x.part === `leg${i}` && x.shape.k === 'rod' && !/^wrap/.test(x.piece)).map((x) => ({ a: x.shape.a, b: x.shape.b, r: Math.max(x.shape.ra, x.shape.rb) }));
  for (const [move, long] of LONG) {
    if (move === 'dying') continue;
    for (let i = 0; i <= Math.round(long * 30); i++) {
      const t = i / 30;
      const sol = solids(move, t);
      for (const [p, q] of [[0, 1], [2, 3], [0, 2], [1, 3]]) {
        for (const s1 of legOf(sol, p)) for (const s2 of legOf(sol, q)) {
          const gap = segGap(s1.a, s1.b, s2.a, s2.b);
          assert.ok(gap > (s1.r + s2.r) * 0.85, `${move}: legs ${p} and ${q} pass through each other at ${t.toFixed(2)} s (${gap.toFixed(2)} apart)`);
        }
      }
    }
  }
});

test('JERK: nothing leaps from one frame to the next in any move (Movement 5): its blows quick, the rest of it slow; its stand and walk close their loops', () => {
  // (picture pixels a piece's middle may move in a thirtieth of a second, by move: its legs; its head and antlers,
  // whose far tips swing widest; the rest of it. Its blows are quick by their nature: the gore's hook up through you,
  // harder on his word (its antlers' far tips 24 in its last frame); its stotting's bounds (its body 12, its antlers 18), the gallop's legs and the crash (17, 19), the slam as it comes down off its rearing
  // (its antlers' tips 34 in its last frame), the flinch's snap (18), each on one continuous arc: the blow's own punch)
  const limit: Record<string, [number, number, number]> = { stand: [11, 9, 3.2], walk: [12, 19, 13], attack: [8, 26, 10], charge: [19, 21, 7], roots: [15, 36, 16], bellow: [2, 19, 4], reel: [3, 19, 6], dying: [5, 12, 10] };
  const leg = (p: string): boolean => /^(hoof|pastern|fet|cannon|knob|fore|arm|wrap|thigh|shank)\d/.test(p);
  const crown = (p: string): boolean => /^(beam|tine|burr|moss|ear|cranium|muzzle|jaw|mouth|socket|poll|nostril)/.test(p);
  for (const [move, long] of LONG) {
    const [lg, cr, rs] = limit[move];
    const a = biggestStep(move, long, leg);
    const b = biggestStep(move, long, crown);
    const c = biggestStep(move, long, (p) => !leg(p) && !crown(p));
    assert.ok(a.d <= lg, `${move}: its leg's ${a.piece} moves ${a.d.toFixed(1)} in a thirtieth, at ${a.t.toFixed(3)} s`);
    assert.ok(b.d <= cr, `${move}: its head's ${b.piece} moves ${b.d.toFixed(1)} in a thirtieth, at ${b.t.toFixed(3)} s`);
    assert.ok(c.d <= rs, `${move}: its ${c.piece} moves ${c.d.toFixed(1)} in a thirtieth, at ${c.t.toFixed(3)} s`);
  }
  assert.equal(geom('stand', 0), geom('stand', STAG_STAND.period), 'its stand\'s last moment is not its first');
  assert.equal(geom('walk', 0), geom('walk', STAG_WALK.period), 'its walk\'s last moment is not its first');
});

/** Its points the eye goes by (its hoofs, knees and hocks, its head, its antlers' tips, its eye, its shoulders and haunch), where they are on the picture. */
const KEYS = ['hoof0', 'hoof1', 'hoof2', 'hoof3', 'knob0', 'knob1', 'knob2', 'knob3', 'cranium', 'shoulder', 'haunch', 'eye', 'beam1_5', 'beam-1_5'];
function pointsOf(move: string, t: number, view: 'front' | 'back'): number[][] {
  const st = stage(view, 0, 0, { w: 2, h: 2 });
  const sol = solids(move, t, view);
  return KEYS.map((k) => {
    const x = sol.find((y) => y.piece === k)!;
    return st.at(x.shape.k === 'rod' ? x.shape.b : x.shape.c) as unknown as number[];
  });
}
/** How far the picture leaps from one moment to another: the mean of its points, in game pixels. */
const leap = (a: number[][], b: number[][]): number => a.reduce((s, p, i) => s + Math.hypot(p[0] - b[i][0], p[1] - b[i][1]), 0) / a.length / 2;

test('JUMP: where one move hands over to the next (its stand, from whatever frame it has come to, into each move and back; into its stotting and out of it as it lands), the picture does not leap (Movement 5; the review\'s 3 game pixels)', () => {
  for (const view of ['front', 'back'] as const) {
    const stands = Array.from({ length: STAG_STAND.frames }, (_, i) => pointsOf('stand', i / STAG_STAND.fps, view));
    const rest = pointsOf('stand', 0, view);
    for (const move of MOVES) {
      if (move === 'stand') continue;
      const first = pointsOf(move, 0, view);
      for (let i = 0; i < stands.length; i++) assert.ok(leap(stands[i], first) <= 3, `${view}: its stand at ${(i / STAG_STAND.fps).toFixed(2)} s into its ${move} leaps ${leap(stands[i], first).toFixed(2)}`);
      if (move !== 'dying' && move !== 'walk') assert.ok(leap(pointsOf(move, stagLong(move), view), rest) <= 3, `${view}: its ${move}'s end back to its stand leaps`);
    }
    // (stotting, it can stop only landed, never in the air: the game ends its bounding as its hoofs come down)
    for (let i = 0; i < STAG_WALK.frames; i++) {
      const t = i / STAG_WALK.fps;
      if (!stagFeet('walk', t).every((f) => f[2] < 1e-6)) continue;
      const w = pointsOf('walk', t, view);
      assert.ok(leap(w, rest) <= 3, `${view}: its walk at ${t.toFixed(3)} s back to its stand leaps ${leap(w, rest).toFixed(2)}`);
    }
  }
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

test('SLIDE in its moves: stotting and running, a hoof down stays on its spot while the floor goes by under it at its pace; in every other move a hoof down stays where it is (Movement 8)', () => {
  const dt = 1 / 600;
  const V = STAG_PACE * TILE3;
  // (stotting: all four hoofs land together and leave together; landed, they stay on their spots as the floor goes by)
  for (let t = 0; t < STAG_WALK.period * 2; t += dt) {
    const a = stagFeet('walk', t);
    const b = stagFeet('walk', t + dt);
    const down = a.filter((f) => f[2] < 1e-6).length;
    assert.ok(down === 0 || down === 4, `stotting, ${down} hoofs down at ${t.toFixed(4)} s`);
    for (let i = 0; i < 4; i++) if (a[i][2] < 1e-6 && b[i][2] < 1e-6) assert.ok(Math.abs(b[i][0] - a[i][0] + V * dt) < 1e-6 && Math.abs(b[i][1] - a[i][1]) < 1e-9, `walk: hoof ${i} slips at ${t.toFixed(4)} s`);
  }
  for (const l of STAG_BOUNDS.land) {
    assert.ok(stagFeet('walk', l + 0.01).every((f) => f[2] < 1e-6), `landed at ${l} s`);
    assert.ok(stagFeet('walk', l + STAG_BOUNDS.down + 0.1).every((f) => f[2] > 5), `bounding up after ${l} s`);
  }
  const C = STAG_CHARGE;
  const Vc = C.pace * TILE3;
  for (let t = 0; t + dt < C.long; t += dt) {
    const a = stagFeet('charge', t);
    const b = stagFeet('charge', t + dt);
    const going = Vc * Math.max(0, Math.min(t + dt, C.crash) - Math.max(t, C.run));
    for (let i = 0; i < 4; i++) if (a[i][2] < 1e-6 && b[i][2] < 1e-6) assert.ok(Math.abs(b[i][0] - a[i][0] + going) < 1e-6 && Math.abs(b[i][1] - a[i][1]) < 1e-9, `charge: hoof ${i} slips at ${t.toFixed(4)} s`);
  }
  for (const move of ['attack', 'roots', 'bellow', 'reel', 'dying']) {
    for (let t = 0; t + dt < stagLong(move); t += dt) {
      const a = stagFeet(move, t);
      const b = stagFeet(move, t + dt);
      for (let i = 0; i < 4; i++) {
        const down = move === 'dying' ? true : a[i][2] < 1e-6 && b[i][2] < 1e-6;
        if (down) assert.ok(Math.abs(b[i][0] - a[i][0]) + Math.abs(b[i][1] - a[i][1]) < 1e-6, `${move}: hoof ${i} slides at ${t.toFixed(4)} s`);
      }
    }
    for (let i = 0; i < 4; i++) assert.equal(JSON.stringify(stagFeet(move, stagLong(move) - 1e-6).map((f) => f.slice(0, 2).map((v) => Math.round(v * 1e4)))[i]), JSON.stringify(STAG_FEET[i].slice(0, 2).map((v) => Math.round(v * 1e4))), `${move}: hoof ${i} ends off its spot`);
  }
});

test('BLOW: its antler gore: its head lowered, its antlers aimed and held trembling (the warning), the hook up through you held a tenth, and on up after it (Movement 3, 7, Monsters 4)', () => {
  const G = STAG_GORE;
  const tip = (t: number): number[] => pieceAt('attack', t, 'beam1_5').b;
  const head = (t: number): number[] => pieceAt('attack', t, 'cranium').c;
  assert.ok(head(0.45)[2] < head(0)[2] - 10, `its head lowered ${(head(0)[2] - head(0.45)[2]).toFixed(1)} for the warning`);
  assert.ok(Math.hypot(...[0, 1, 2].map((k) => tip(0.42)[k] - tip(0.6)[k])) < 4, 'and held there');
  const held = geom('attack', G.hit);
  for (const t of [G.hit + 0.03, G.hit + G.freeze - 0.005]) assert.equal(geom('attack', t), held, `the gore moves in its freeze at ${t.toFixed(3)} s`);
  const nose = (t: number): number[] => pieceAt('attack', t, 'muzzle').b;
  assert.ok(nose(1.1)[2] > nose(G.hit)[2] + 4, `its head goes on up after the blow, ${(nose(1.1)[2] - nose(G.hit)[2]).toFixed(1)}`);
  assert.ok(Math.max(tip(G.hit)[0], pieceAt('attack', G.hit, 'beam-1_5').b[0]) > G.reach - 30, 'its antlers sweep far before it');
});

test('BLOW: its charge: its head lowered and held, pawing (the warning); it runs; the crash held a tenth; splinters fly; and it is back on its stand at its end', () => {
  const C = STAG_CHARGE;
  const head = (t: number): number[] => pieceAt('charge', t, 'cranium').c;
  assert.ok(head(0.5)[2] < head(0)[2] - 8, 'its head lowered in the warning');
  const held = geom('charge', C.crash);
  for (const t of [C.crash + 0.04, C.crash + C.freeze - 0.005]) assert.equal(geom('charge', t), held, `the crash moves in its freeze at ${t.toFixed(3)} s`);
  assert.ok(stagChipCount('charge', C.crash + C.freeze + 0.15) > 40, 'splinters fly from the crash');
  assert.equal(geom('charge', C.long, false), geom('stand', 0, false), 'back on its stand at its end');
});

test('BLOW: its roots: reared up on its hind legs, its forefeet off the floor and held (the warning); the slam, its forefeet down on their spots, held a tenth; and back on its stand', () => {
  const R = STAG_ROOTS;
  const head = (t: number): number[] => pieceAt('roots', t, 'cranium').c;
  assert.ok(head(0.7)[2] > head(0)[2] + 25, `reared up, its head ${(head(0.7)[2] - head(0)[2]).toFixed(1)} higher`);
  for (const t of [0.6, 0.7, 0.8]) assert.ok(stagFeet('roots', t).slice(0, 2).every((f) => f[2] > 8), `its forefeet up at ${t} s`);
  assert.ok(stagFeet('roots', R.slam).slice(0, 2).every((f) => f[2] < 1e-6), 'its forefeet down at the slam');
  const held = geom('roots', R.slam);
  for (const t of [R.slam + 0.04, R.slam + R.freeze - 0.005]) assert.equal(geom('roots', t), held, `the slam moves in its freeze at ${t.toFixed(3)} s`);
  assert.equal(geom('roots', R.long, false), geom('stand', 0, false), 'back on its stand at its end');
});

test('BLOW: its bellow: its head thrown up (the warning), its jaw wide through the bellow, fog rolling from it; and back on its stand', () => {
  const B = STAG_BELLOW;
  const muzzle = (t: number): number[] => pieceAt('bellow', t, 'muzzle').b;
  assert.ok(muzzle(B.roar)[2] > muzzle(0)[2] + 10, 'its head thrown up');
  const jawOpen = (t: number): number => {
    const j = pieceAt('bellow', t, 'jaw');
    const m = pieceAt('bellow', t, 'muzzle');
    return Math.hypot(j.b[0] - m.b[0], j.b[1] - m.b[1], j.b[2] - m.b[2]);
  };
  assert.ok(jawOpen(1.2) > jawOpen(0) + 5, `its jaw wide ${jawOpen(1.2).toFixed(1)} (shut ${jawOpen(0).toFixed(1)})`);
  assert.ok(stagChipCount('bellow', 1.3) > 60, 'fog rolling from it');
  assert.equal(geom('bellow', B.long, false), geom('stand', 0, false), 'back on its stand at its end');
});

test('struck: held as the blow lands; its head thrown back; its eye flinching; bone, moss and hide flying off it; back on its stand by its end (Hits 3, 4)', () => {
  const R = STAG_REEL;
  const frozen = geom('reel', 0);
  for (const t of [0.02, R.freeze - 0.005]) assert.equal(geom('reel', t), frozen, `moves during the freeze at ${t}`);
  assert.ok(pieceAt('reel', 0.2, 'cranium').c[0] < pieceAt('reel', 0, 'cranium').c[0] - 3, 'its head thrown back');
  assert.ok(stagLid('reel', 0.2) > 0.4, 'its eye flinches');
  assert.ok(stagChipCount('reel', 0.2) > 6, 'what flies off it');
  assert.equal(geom('reel', R.long, false), geom('stand', 0, false), 'back on its stand at its end');
});

test('its death (his pick, “Roots drag it down into the ground”): roots up round it; dragged under, the floor swallowing it, nothing of it seen below the floor; its eye shut and out; at its end only its antlers stand up out of the heaved earth; still', () => {
  const Dd = STAG_DIE;
  const frozen = geom('dying', 0);
  for (const t of [0.03, Dd.freeze - 0.005]) assert.equal(geom('dying', t), frozen, `moves in the blow's freeze at ${t}`);
  assert.ok(solids('dying', 0.7).some((x) => /^rootleg/.test(x.part)), 'roots climb its legs');
  assert.ok(pieceAt('dying', Dd.under, 'shoulder').c[2] < -10, 'dragged under');
  const colours = (t: number): Set<string> => {
    const { px } = stagPainted('dying', t, 'front');
    const out = new Set<string>();
    for (let i = 0; i < px.d.length; i += 4) if (px.d[i + 3] === 255) out.add(`${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`);
    return out;
  };
  const end = colours(Dd.long);
  const has = (c: string): boolean => end.has(rgba(c).slice(0, 3).join(','));
  assert.ok(['#7c6a6c', '#ae9c94', '#d8cabc'].some(has), 'its antlers stand out of the earth at its end');
  assert.ok(!['#241a22', '#362832', '#4a3844'].some(has), 'none of its hoofs is seen');
  assert.ok(![FLAME[3], FLAME[4]].some(has), 'its eye is gone');
  assert.equal(stagPainted('dying', Dd.out + 0.05, 'front').lights.length, 0, 'its eye is out');
  const still = geom('dying', Dd.still);
  for (const t of [Dd.still + 0.1, Dd.long]) assert.equal(geom('dying', t), still, `something moves at ${t} s`);
  // (the floor swallows it: what of its solids is below the floor is not painted; its hoofs are deep under by its end)
  assert.ok(stagFeet('dying', Dd.long).every((f) => f[2] < -40), 'its hoofs deep under');
});

test('what its moves throw off comes and goes: gone by the end of every move', () => {
  for (const move of ['attack', 'charge', 'roots', 'bellow', 'reel', 'dying']) assert.equal(stagChipCount(move, stagLong(move)), 0, `${move}: something thrown off at its end`);
  assert.ok(stagChipCount('attack', 0.8) > 10, 'the gore rakes the earth');
  assert.ok(stagChipCount('roots', STAG_ROOTS.slam + 0.2) > 10, 'the slam bursts the earth');
  assert.ok(stagChipCount('dying', 0.5) > 6, 'the roots burst the earth as it dies');
  for (const t of [0.05, 0.47]) assert.ok(stagChipCount('walk', t) > 6, `stotting, dust as it lands, at ${t}`);
  for (const t of [0.3, 0.7]) assert.equal(stagChipCount('walk', t), 0, `stotting, something thrown off at ${t}`);
});

test('its roots worming through the ground (his words): a crack glowing before its head (the warning), the root arching up out of the ground and back down, hump after hump, a furrow behind it; crisp, its pink edge, nothing cyan, every light the enemy\'s fire, nothing cut off; stretches laid end to end one root; gone after', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  const R = ROOT_SNAKE;
  const passes = (R.body + ROOT_STRETCH) / R.speed;
  for (const view of ['front', 'back'] as const) {
    for (const along of [0, 35, -60, 90]) {
      let rooted = 0;
      for (let t = -0.3; t <= passes + 0.6; t += 1 / 30) {
        const { px, lights } = rootSnakePainted(t, view, along, 3);
        let rim = 0;
        for (let i = 0; i < px.d.length; i += 4) {
          const a = px.d[i + 3];
          if (a === 0) continue;
          if (a === RIM_ALPHA && px.d[i] === pr && px.d[i + 1] === pg && px.d[i + 2] === pb) rim++;
          else assert.equal(a, 255, `${view} ${along} ${t.toFixed(2)}: a soft pixel`);
          const [h, sat] = hue(px.d[i], px.d[i + 1], px.d[i + 2]);
          assert.ok(!(sat > 0.4 && Math.max(px.d[i], px.d[i + 1], px.d[i + 2]) > 140 && h >= 165 && h <= 205), `${view} ${t.toFixed(2)}: cyan`);
        }
        if (rim > 20) rooted++;
        for (const L of lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `its light ${L.color}`);
        for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) assert.equal(px.d[(y * px.w + x) * 4 + 3], 0, `${view} ${along} ${t.toFixed(2)}: cut off`);
        for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) assert.equal(px.d[(y * px.w + x) * 4 + 3], 0, `${view} ${along} ${t.toFixed(2)}: cut off`);
        if (t < -0.04 && t > -R.crack / R.speed + 0.04) assert.ok(lights.length > 0, `${view} ${along} ${t.toFixed(2)}: its crack glows before its head`);
      }
      assert.ok(rooted > 4, `${view} ${along}: its root is seen arching out of the ground (${rooted} frames)`);
      assert.equal(rootSnakePainted(passes + 0.6, view, along, 3).px.d.some((v: number, i: number) => i % 4 === 3 && v > 0), false, 'gone after');
    }
  }
  // (laid end to end, each hump of the root is drawn by one stretch: the stretch its middle is in)
  const humps = (t: number): number => {
    let n = 0;
    for (const k of [-1, 0, 1]) {
      const { px } = rootSnakePainted(t + (k * ROOT_STRETCH) / R.speed, 'front', 0, 3);
      for (let i = 3; i < px.d.length; i += 4) if (px.d[i] === RIM_ALPHA) n++;
    }
    return n;
  };
  assert.ok(humps(0.25) > 0, 'its root is drawn along the stretches');
});

test('its pictures as the game holds them: standing fifteen a second, walking sixteen; its gore, charge, roots and bellow, struck and its death at thirty', () => {
  const art = makeStagArt() as any;
  const f = art.front;
  assert.equal(f.idle.length, STAG_STAND.frames);
  assert.equal(f.walk.length, STAG_WALK.frames);
  assert.equal(f.idleFps, 15);
  assert.equal(f.walkFps, 16);
  assert.equal(f.attack.length, 3);
  assert.equal(f.clips.attack.hit, STAG_GORE.hit);
  assert.equal(f.clips.moves.charge.hit, STAG_CHARGE.crash);
  assert.equal(f.clips.moves.roots.hit, STAG_ROOTS.slam);
  assert.equal(f.clips.moves.bellow.frames.length, Math.round(STAG_BELLOW.long * 30) + 1);
  assert.equal(f.clips.die.frames.length, Math.round(STAG_DIE.long * 30) + 1);
  assert.equal(f.clips.reel.frames.length, Math.round(STAG_REEL.long * 30) + 1);
});
