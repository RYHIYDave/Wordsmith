// FLOOR 9'S FOG WOLVES (src/art/fog_wolves.ts; in the game through art/act1_figs/wolf.ts, WOLF_ON on with the descent), held to
// his art rulebook before he sees them, in every frame of every move, from in front and from behind:
//   - crisp pixels; its pink edge round what of it is solid while it lives (where its fog thins away, its edge goes
//     with it: his word, more fog than wolf), none dead; nothing cyan; every light the enemy's fire; its eyes burning
//     while it lives; nothing cut off;
//   - its size, his brief's (hip-high to the knight);
//   - FLOOR AND A GLIDE: nothing of it below the floor, its legs never on it (his pick, a ghostly glide: Movement 8, that
//     feet grip the floor, read as for a flier);
//   - THROUGH: no leg through another; JERK: nothing leaps from one frame to the next (its bite is quick, not a jump);
//     its stand and glide close their loops; JUMP: where one move hands over to another, the picture does not leap;
//   - ALIVE: never still; its growl and its glance;
//   - BLOW: its bite (his pick, a lunge out of the fog): crouched, its eyes flaring, held trembling (the warning); the
//     lunge, its jaws thrown wide, its head and jaws coming solid; the snap; back on its stand;
//   - struck; its death (his pick, it blows apart into fog, its eyes the last to go out); its loose fog; its pictures
//     as the game holds them.
//   run: tsx --test tests/fog_wolves.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { ACT1 } from '../src/game/act1';
// (the bestiary throws the art chat's switches for the descent's kinds with the descent's own: useAct1Figs)
import '../src/art/bestiary';
import { WOLF_BITE, WOLF_DIE, WOLF_HABITS, WOLF_ON, WOLF_REEL, WOLF_STAND, WOLF_WALK, makeWolfArt, wolfGrains, wolfLong, wolfPainted, wolfSolids } from '../src/art/fog_wolves';
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
type Frame = { name: string; move: string; t: number; alive: boolean; painted: () => Painted };
const frames: Frame[] = [];
const memo = (f: () => Painted): (() => Painted) => {
  let p: Painted | null = null;
  return () => (p ??= f());
};
// every frame the game would show of its stand (fifteen a second) and its glide (sixteen), and every third of its other
// moves at thirty a second (and their last), from in front and from behind
const MOVES = ['stand', 'walk', 'attack', 'reel', 'dying'];
const FPS: Record<string, number> = { stand: WOLF_STAND.fps, walk: WOLF_WALK.fps };
const LONG: [string, number, number][] = MOVES.map((m) => [m, wolfLong(m), FPS[m] ?? 30]);
for (const view of ['front', 'back'] as const) {
  for (const [move, long, fps] of LONG) {
    const n = Math.round(long * fps);
    const step = FPS[move] ? 1 : 3;
    for (let i = 0; i <= n; i += i + step > n && i !== n ? n - i : step) {
      if (FPS[move] && i === n) break;
      frames.push({ name: `${move} ${view} ${i}/${fps}`, move, t: i / fps, alive: move !== 'dying', painted: memo(() => wolfPainted(move, i / fps, view)) });
    }
  }
}
type Solid = { part: string; piece: string; shape: any };
const solids = (move: string, t: number, view: 'front' | 'back' = 'front'): Solid[] => wolfSolids(move, t, view) as Solid[];
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
/** The geometry of one moment, each number to a millionth (skins left out); `hung`: with what swings with how it has been moving (its haunch's frayed puffs and its tail). */
function geom(move: string, t: number, hung = true): string {
  const sol = solids(move, t).filter((x) => hung || !/^(fray|tail)\d/.test(x.piece));
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
const opaque = (p: Painted): number => {
  let n = 0;
  for (let i = 3; i < p.px.d.length; i += 4) if (p.px.d[i]) n++;
  return n;
};

// (IN THE GAME since the descent came in, 16 Oct 2026: through art/act1_figs/wolf.ts alone, its switch on with the
// descent's; until then a mock-up nothing of the game imported, its switch off)
test('in the game through art/act1_figs/wolf.ts alone, its switch on with the descent', () => {
  assert.equal(WOLF_ON.on, ACT1.on);
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev')) continue;
    const dir = f.split('/').slice(0, -1);
    for (const m of fs.readFileSync(`src/${f}`, 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const q of m[1].split('/')) if (q === '..') parts.pop(); else if (q !== '.') parts.push(q);
      if (parts.join('/') === 'art/fog_wolves') users.push(f);
    }
  }
  assert.equal(users.join(', '), 'art/act1_figs/wolf.ts', 'only its pictures for the game import the wolves');
});

test('crisp: every pixel all there or not at all (but the pink edge); its pink edge round what of it is solid while it lives (where its fog thins away, its edge goes with it: his word, more fog than wolf; struck, it is torn open), none dead', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  const least: Record<string, number> = { stand: 50, walk: 50, attack: 50, reel: 15 };
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
    if (f.alive) assert.ok(rim > least[f.move], `${f.name}: its pink edge, ${rim} pixels`);
    else assert.ok(rim === 0, `${f.name}: a pink edge on it dead`);
  }
});

test('nothing cyan, every light the enemy\'s fire, its eyes burning while it lives (his pick, the one thing to know it by), and nothing of it cut off at its canvas\'s edge', () => {
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
    if (f.alive) {
      assert.ok(eyes >= 4, `${f.name}: its eyes, ${eyes} pixels`);
      assert.ok(lights.length > 0, `${f.name}: its eyes' light`);
    }
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

test('FLOOR, AND A GLIDE: nothing of it below the floor, and its legs never on it: they end in fog above it, in every frame of every move (his pick, “A ghostly glide”)', () => {
  for (const [move, long] of LONG) {
    let legs = Infinity;
    let low = Infinity;
    for (let i = 0; i <= Math.round(long * 30); i++) {
      for (const x of solids(move, i / 30)) {
        low = Math.min(low, bottomOf(x.shape));
        if (/^(upper|lower)\d$/.test(x.piece)) legs = Math.min(legs, bottomOf(x.shape));
      }
      for (const g of wolfGrains(move, i / 30)) assert.ok(g[2] >= 0.3, `${move}: a grain of its fog under the floor at ${(i / 30).toFixed(2)} s`);
    }
    assert.ok(low >= 4, `${move}: its lowest solid is ${low.toFixed(2)} up`);
    assert.ok(legs >= 4, `${move}: its legs' solid fog comes down to ${legs.toFixed(2)}`);
  }
});

test('THROUGH: no leg through another, in any frame of any move (its death aside: it has blown away)', () => {
  const legOf = (sol: Solid[], i: number): { a: number[]; b: number[]; r: number }[] =>
    sol.filter((x) => new RegExp(`^(upper|lower)${i}$`).test(x.piece)).map((x) => ({ a: x.shape.a, b: x.shape.b, r: Math.max(x.shape.ra, x.shape.rb) }));
  for (const [move, long] of LONG) {
    if (move === 'dying') continue;
    for (let i = 0; i <= Math.round(long * 30); i++) {
      const t = i / 30;
      const sol = solids(move, t);
      for (const [p, q] of [[0, 1], [2, 3], [0, 2], [1, 3]]) {
        for (const s1 of legOf(sol, p)) for (const s2 of legOf(sol, q)) assert.ok(segGap(s1.a, s1.b, s2.a, s2.b) > (s1.r + s2.r) * 0.85, `${move}: legs ${p} and ${q} through each other at ${t.toFixed(2)} s`);
      }
    }
  }
});

test('JERK: nothing leaps from one frame to the next in any move (Movement 5): its bite quick, the rest of it slow; its stand and glide close their loops', () => {
  // (how far a piece's middle may move in a thirtieth of a second, by move: its legs; its head; the rest of it. Its bite
  // is quick by its nature, on one continuous arc: the lunge (its legs flung out 10, its jaws snapping 12, its body 8))
  const limit: Record<string, [number, number, number]> = { stand: [1, 1.5, 1], walk: [2.5, 1.5, 2], attack: [11, 13, 9], reel: [3, 6, 4], dying: [1.5, 2, 1.5] };
  const leg = (p: string): boolean => /^(upper|lower)\d/.test(p);
  const crown = (p: string): boolean => /^(cranium|cheek|muzzle|nose|jaw|mouth|fang|lfang|ear|eye|socket)/.test(p);
  for (const [move, long] of LONG) {
    const [lg, cr, rs] = limit[move];
    const a = biggestStep(move, long, leg);
    const b = biggestStep(move, long, crown);
    const c = biggestStep(move, long, (p) => !leg(p) && !crown(p));
    assert.ok(a.d <= lg, `${move}: its leg's ${a.piece} moves ${a.d.toFixed(1)} in a thirtieth, at ${a.t.toFixed(3)} s`);
    assert.ok(b.d <= cr, `${move}: its head's ${b.piece} moves ${b.d.toFixed(1)} in a thirtieth, at ${b.t.toFixed(3)} s`);
    assert.ok(c.d <= rs, `${move}: its ${c.piece} moves ${c.d.toFixed(1)} in a thirtieth, at ${c.t.toFixed(3)} s`);
  }
  assert.equal(geom('stand', 0), geom('stand', WOLF_STAND.period), 'its stand\'s last moment is not its first');
  assert.equal(geom('walk', 0), geom('walk', WOLF_WALK.period), 'its glide\'s last moment is not its first');
});

/** Its points the eye goes by (its head, its nose, its chest and haunch, its tail, its legs' ends), where they are on the picture. */
const KEYS = ['cranium', 'nose', 'chest', 'haunch', 'tail2', 'lower0', 'lower1', 'lower2', 'lower3'];
function pointsOf(move: string, t: number, view: 'front' | 'back'): number[][] {
  const st = stage(view, 0, 0, { w: 2, h: 2 });
  const sol = solids(move, t, view);
  return KEYS.map((k) => {
    const x = sol.find((y) => y.piece === k)!;
    return st.at(x.shape.k === 'rod' ? x.shape.b : x.shape.c) as unknown as number[];
  });
}
const leap = (a: number[][], b: number[][]): number => a.reduce((s, p, i) => s + Math.hypot(p[0] - b[i][0], p[1] - b[i][1]), 0) / a.length / 2;

test('JUMP: where one move hands over to the next (its stand, from whatever frame it has come to, into each move and back; its glide, from any frame, back to its stand), the picture does not leap (Movement 5; the review\'s 3 game pixels)', () => {
  for (const view of ['front', 'back'] as const) {
    const stands = Array.from({ length: WOLF_STAND.frames }, (_, i) => pointsOf('stand', i / WOLF_STAND.fps, view));
    const rest = pointsOf('stand', 0, view);
    for (const move of MOVES) {
      if (move === 'stand') continue;
      const first = pointsOf(move, 0, view);
      for (let i = 0; i < stands.length; i++) assert.ok(leap(stands[i], first) <= 3, `${view}: its stand at ${(i / WOLF_STAND.fps).toFixed(2)} s into its ${move} leaps ${leap(stands[i], first).toFixed(2)}`);
      if (move !== 'dying' && move !== 'walk') assert.ok(leap(pointsOf(move, wolfLong(move), view), rest) <= 3, `${view}: its ${move}'s end back to its stand leaps`);
    }
    for (let i = 0; i < WOLF_WALK.frames; i++) {
      const w = pointsOf('walk', i / WOLF_WALK.fps, view);
      assert.ok(leap(w, rest) <= 3, `${view}: its glide at ${(i / WOLF_WALK.fps).toFixed(3)} s back to its stand leaps ${leap(w, rest).toFixed(2)}`);
    }
  }
});

test('ALIVE: never still from one frame to the next; it growls, its fangs bared, its ears flat; it glances aside (Movement 6)', () => {
  for (let i = 0; i < WOLF_STAND.frames; i++) assert.notEqual(geom('stand', i / WOLF_STAND.fps), geom('stand', (i + 1) / WOLF_STAND.fps), `frames ${i} and ${i + 1} are the same`);
  const mid = (WOLF_HABITS.growl[0] + WOLF_HABITS.growl[1]) / 2;
  assert.ok(solids('stand', mid).some((x) => /^l?fang/.test(x.piece)), 'its fangs bared as it growls');
  assert.ok(!solids('stand', 0.1).some((x) => /^l?fang/.test(x.piece)), 'its fangs hidden at rest');
  const nose = (t: number): number[] => pieceAt('stand', t, 'nose').c;
  const g = (WOLF_HABITS.glance[0] + WOLF_HABITS.glance[1]) / 2;
  assert.ok(Math.abs(nose(g)[1] - nose(WOLF_HABITS.glance[0])[1]) > 2, 'it glances aside');
});

test('BLOW: its bite (his pick, “A lunge out of the fog”): crouched, its eyes flaring, its fangs bared, held trembling (the warning); the lunge, its jaws thrown wide, its head and jaws coming solid; the snap, its jaws shut far before it; it tugs and falls back; back on its stand (Movement 3, Monsters 4)', () => {
  const B = WOLF_BITE;
  const head = (t: number): number[] => pieceAt('attack', t, 'cranium').c;
  const nose = (t: number): number[] => pieceAt('attack', t, 'nose').c;
  assert.ok(head(B.warn + 0.06)[2] < head(0)[2] - 1.5, `crouched, its head ${(head(0)[2] - head(B.warn + 0.06)[2]).toFixed(1)} lower`);
  assert.ok(head(B.warn + 0.06)[0] < head(0)[0] - 3, 'drawn back');
  assert.ok(solids('attack', B.warn + 0.06).some((x) => /^l?fang/.test(x.piece)), 'its fangs bared for the warning');
  let most = 0;
  for (let t = B.warn + 0.05; t < B.lunge; t += 1 / 30) most = Math.max(most, Math.hypot(...[0, 1, 2].map((k) => nose(t)[k] - nose(B.warn + 0.05)[k])));
  assert.ok(most > 0.2 && most < 3, `its warning held, trembling ${most.toFixed(2)}`);
  const jawOpen = (t: number): number => {
    const j = pieceAt('attack', t, 'jaw').b;
    const m = pieceAt('attack', t, 'muzzle').b;
    return Math.hypot(j[0] - m[0], j[1] - m[1], j[2] - m[2]);
  };
  const widest = Math.max(...[0.4, 0.42, 0.44, 0.46].map(jawOpen));
  assert.ok(widest > jawOpen(0) + 4, `its jaws thrown wide, ${widest.toFixed(1)} (shut ${jawOpen(0).toFixed(1)})`);
  assert.ok(jawOpen(B.hit) < widest - 3, `snapped shut at the blow, ${jawOpen(B.hit).toFixed(1)}`);
  assert.ok(Math.abs(nose(B.hit)[0] - B.reach) < 3, `its jaws shut ${nose(B.hit)[0].toFixed(1)} before it`);
  // (solid for the snap: more of it painted than at rest, fewer gaps through it)
  for (const view of ['front', 'back'] as const) assert.ok(opaque(wolfPainted('attack', B.hit, view)) > 1.15 * opaque(wolfPainted('stand', 0, view)), `${view}: not solid for the snap`);
  assert.ok(wolfGrains('attack', B.hit + 0.08).length > wolfGrains('attack', B.hit - 0.02).length + 8, 'fog bursts from its jaws as they snap');
  assert.equal(geom('attack', B.long, false), geom('stand', 0, false), 'back on its stand at its end');
});

test('struck: held as the blow lands, its fog blown open; knocked back, its head snapped round; wisps torn off it; back on its stand, whole again, by its end (Hits 3, 4)', () => {
  const R = WOLF_REEL;
  const frozen = geom('reel', 0);
  for (const t of [0.02, R.freeze - 0.005]) assert.equal(geom('reel', t), frozen, `moves during the freeze at ${t}`);
  for (const view of ['front', 'back'] as const) assert.ok(opaque(wolfPainted('reel', 0.02, view)) < 0.75 * opaque(wolfPainted('stand', 0, view)), `${view}: its fog not blown open`);
  assert.ok(pieceAt('reel', 0.2, 'haunch').c[0] < pieceAt('reel', 0, 'haunch').c[0] - 2, 'knocked back');
  const a = pieceAt('reel', 0, 'nose').c;
  const b = pieceAt('reel', 0.2, 'nose').c;
  assert.ok(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) > 4, 'its head snapped round');
  assert.ok(wolfGrains('reel', 0.15).length > wolfGrains('stand', 0).length + 10, 'wisps torn off it');
  assert.equal(geom('reel', R.long, false), geom('stand', 0, false), 'back on its stand at its end');
});

test('its death (his pick, “It blows apart into fog”): held as the blow lands; it bursts into wisps that drift and thin; its body gone; its eyes, left hanging, the last to go out; nothing left; still', () => {
  const Dd = WOLF_DIE;
  const frozen = geom('dying', 0);
  for (const t of [0.03, Dd.freeze - 0.005]) assert.equal(geom('dying', t), frozen, `moves in the blow's freeze at ${t}`);
  assert.ok(wolfGrains('dying', Dd.burst + 0.1).length > 150, 'it bursts into wisps');
  const INKISH = new Set(['#0e0c24', '#14121c', '#1e1c28', '#2a2836', '#3a3848', '#3a3846', '#5a5768'].map((c) => rgba(c).slice(0, 3).join(',')));
  for (const view of ['front', 'back'] as const) {
    // (its body gone, its outline and its dark heart with it; its eyes still burning, their light still on it)
    const p = wolfPainted('dying', (Dd.gone + Dd.out) / 2, view);
    let fire = 0;
    let body = 0;
    for (let i = 0; i < p.px.d.length; i += 4) {
      if (p.px.d[i + 3] === 0) continue;
      const c = `${p.px.d[i]},${p.px.d[i + 1]},${p.px.d[i + 2]}`;
      if (FIRE.has(c)) fire++;
      if (INKISH.has(c)) body++;
    }
    assert.ok(fire >= 2, `${view}: its eyes gone before the rest of it`);
    assert.equal(body, 0, `${view}: its body still there with its eyes`);
    assert.ok(p.lights.length > 0, `${view}: its eyes' light`);
    for (const t of [Dd.still, Dd.long]) {
      const q = wolfPainted('dying', t, view);
      assert.equal(opaque(q), 0, `${view}: something left of it at ${t} s`);
      assert.equal(q.lights.length, 0, `${view}: a light left at ${t} s`);
    }
  }
  assert.equal(wolfGrains('dying', Dd.still).length, 0, 'its fog still drifting at its end');
  const still = geom('dying', Dd.still);
  for (const t of [Dd.still + 0.05, Dd.long]) assert.equal(geom('dying', t), still, `something moves at ${t} s`);
});

test('its loose fog: wisps streaming off it and fog low round it, in every frame of its stand and glide; their loops close', () => {
  for (const [move, period, n, fps] of [['stand', WOLF_STAND.period, WOLF_STAND.frames, WOLF_STAND.fps], ['walk', WOLF_WALK.period, WOLF_WALK.frames, WOLF_WALK.fps]] as const) {
    for (let i = 0; i < n; i++) {
      const g = wolfGrains(move, i / fps);
      assert.ok(g.length > 120, `${move}: ${g.length} grains of its fog at frame ${i}`);
      assert.ok(g.filter((p) => p[2] < 3).length > 15, `${move}: its fog low on the ground round it`);
    }
    const r = (v: ReadonlyArray<readonly number[]>): string => JSON.stringify(v.map((p) => p.map((x) => Math.round(x * 1e4))));
    assert.equal(r(wolfGrains(move, 0)), r(wolfGrains(move, period)), `${move}: its loose fog's loop does not close`);
  }
  // (gliding, its fog is left behind it)
  const behind = (move: string): number => wolfGrains(move, 0.2).filter((p) => p[0] < -32).length;
  assert.ok(behind('walk') > behind('stand') + 15, 'its fog trailing behind it as it glides');
});

test('its pictures as the game holds them: standing fifteen a second, gliding sixteen; its bite, struck and its death at thirty', () => {
  const art = makeWolfArt() as any;
  for (const f of [art.front, art.back]) {
    assert.equal(f.idle.length, WOLF_STAND.frames);
    assert.equal(f.walk.length, WOLF_WALK.frames);
    assert.equal(f.idleFps, 15);
    assert.equal(f.walkFps, 16);
    assert.equal(f.attack.length, 3);
    assert.equal(f.clips.attack.hit, WOLF_BITE.hit);
    assert.equal(f.clips.attack.frames.length, Math.round(WOLF_BITE.long * 30) + 1);
    assert.equal(f.clips.die.frames.length, Math.round(WOLF_DIE.long * 30) + 1);
    assert.equal(f.clips.reel.frames.length, Math.round(WOLF_REEL.long * 30) + 1);
  }
});
