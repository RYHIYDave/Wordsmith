// FLOOR 9'S TWISTED DEER (src/art/twisted_deer.ts; in the game through art/act1_figs/deer.ts, TWISTED_DEER_ON on with
// the descent), held to his art rulebook before he sees it, in every frame of every move, from in front and from behind:
//   - crisp pixels; its pink edge while it lives; nothing cyan; every light the enemy's fire; its eyes burning;
//     nothing cut off at its canvas's edge;
//   - its size, his brief's (pony-sized: its back about the knight's chest, its antlers to about his head);
//   - FLOOR: nothing of it below the floor (its stomp's thorny roots aside: they burst up out of the ground, and what of
//     them is still under it the floor swallows);
//   - SLIDE: a foot that is down stays where it came down (limping, the floor going by under it at its pace);
//   - THROUGH: no leg through another;
//   - JERK: nothing leaps from one frame to the next (its blows are quick, not jumps); its stand and limp close their
//     loops; JUMP: where one move hands over to another, the picture does not leap;
//   - BLOW: every blow wound up, held (the warning, a pose) and followed through; its gore and its stomp held a tenth;
//   - ALIVE: never still; its stand's habits;
//   - struck; its death as his pick asks ("It splits apart into roots and bark"); what its moves throw off comes and
//     goes; its pictures as the game holds them.
//   run: tsx --test tests/twisted_deer.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { ACT1 } from '../src/game/act1';
// (the bestiary throws the art chat's switches for the descent's kinds with the descent's own: useAct1Figs)
import '../src/art/bestiary';
import { DEER_DIE, DEER_FEET, DEER_GORE, DEER_HABITS, DEER_PACE, DEER_REEL, DEER_STAND, DEER_STOMP, DEER_WALK, TWISTED_DEER_ON, deerChipCount, deerFeet, deerLong, deerPainted, deerSolids, makeDeerArt } from '../src/art/twisted_deer';
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
type Frame = { name: string; move: string; t: number; alive: boolean; painted: () => Painted };
const frames: Frame[] = [];
const memo = (f: () => Painted): (() => Painted) => {
  let p: Painted | null = null;
  return () => (p ??= f());
};
// every frame the game would show of its stand (fifteen a second) and its limp (sixteen), and every third of its other
// moves at thirty a second (and their last), from in front and from behind
const MOVES = ['stand', 'walk', 'attack', 'stomp', 'reel', 'dying'];
const FPS: Record<string, number> = { stand: DEER_STAND.fps, walk: DEER_WALK.fps };
const LONG: [string, number, number][] = MOVES.map((m) => [m, deerLong(m), FPS[m] ?? 30]);
for (const view of ['front', 'back'] as const) {
  for (const [move, long, fps] of LONG) {
    const n = Math.round(long * fps);
    const step = FPS[move] ? 1 : 3;
    for (let i = 0; i <= n; i += i + step > n && i !== n ? n - i : step) {
      if (FPS[move] && i === n) break;
      frames.push({ name: `${move} ${view} ${i}/${fps}`, move, t: i / fps, alive: move !== 'dying', painted: memo(() => deerPainted(move, i / fps, view)) });
    }
  }
}
type Solid = { part: string; piece: string; shape: any };
const solids = (move: string, t: number, view: 'front' | 'back' = 'front'): Solid[] => deerSolids(move, t, view) as Solid[];
const pieceAt = (move: string, t: number, piece: string): any => solids(move, t).find((x) => x.piece === piece)?.shape;
const spike = (x: Solid): boolean => /^spike/.test(x.part);
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
/** The geometry of one moment, each number to a millionth (skins left out); `hung`: with the roots grown up out of its back, which sway with how it has been moving. */
function geom(move: string, t: number, hung = true): string {
  const sol = solids(move, t).filter((x) => hung || !/^backroot/.test(x.part));
  return JSON.stringify(sol, (k, v) => (k === 'skin' || k === 'ramp' ? undefined : typeof v === 'number' ? Math.round(v * 1e6) : v));
}
/** The largest move of any piece of it (by its middle; its stomp's thorny roots aside) from one thirtieth of a second to the next, among those `which` picks. */
function biggestStep(move: string, long: number, which: (piece: string) => boolean): { d: number; piece: string; t: number } {
  let best = { d: 0, piece: '', t: 0 };
  const n = Math.round(long * 30);
  for (let i = 0; i < n; i++) {
    const a = new Map<string, Solid>(solids(move, i / 30).map((x) => [x.piece, x] as [string, Solid]));
    for (const x of solids(move, (i + 1) / 30)) {
      const before = a.get(x.piece);
      if (!before || spike(x) || !which(x.piece)) continue;
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
  for (let i = 0; i <= 20; i++) {
    const a = p1.map((v, k) => v + ((q1[k] - v) * i) / 20);
    for (let j = 0; j <= 20; j++) {
      const b = p2.map((v, k) => v + ((q2[k] - v) * j) / 20);
      best = Math.min(best, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]));
    }
  }
  return best;
}

// (IN THE GAME since the descent came in, 16 Oct 2026: through art/act1_figs/deer.ts alone, its switch on with the
// descent's; until then a mock-up nothing of the game imported, its switch off)
test('in the game through art/act1_figs/deer.ts alone, its switch on with the descent', () => {
  assert.equal(TWISTED_DEER_ON.on, ACT1.on);
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev')) continue;
    const dir = f.split('/').slice(0, -1);
    for (const m of fs.readFileSync(`src/${f}`, 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const q of m[1].split('/')) if (q === '..') parts.pop(); else if (q !== '.') parts.push(q);
      if (parts.join('/') === 'art/twisted_deer') users.push(f);
    }
  }
  assert.equal(users.join(', '), 'art/act1_figs/deer.ts', 'only its pictures for the game import the deer');
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
    if (f.alive) assert.ok(rim > 150, `${f.name}: its pink edge, ${rim} pixels`);
    else assert.ok(rim === 0, `${f.name}: a pink edge on it dead`);
  }
});

test('nothing cyan, every light the enemy\'s fire, its eyes burning while it lives, and nothing of it cut off at its canvas\'s edge', () => {
  for (const f of frames) {
    const { px, lights } = f.painted();
    let eyes = 0;
    for (let i = 0; i < px.d.length; i += 4) {
      if (px.d[i + 3] === 0) continue;
      const [h, sat] = hue(px.d[i], px.d[i + 1], px.d[i + 2]);
      assert.ok(!(sat > 0.4 && Math.max(px.d[i], px.d[i + 1], px.d[i + 2]) > 140 && h >= 165 && h <= 205), `${f.name}: cyan`);
      if (FIRE.has(`${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`)) eyes++;
    }
    if (f.alive) assert.ok(eyes > 0, `${f.name}: its eyes`);
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

test('FLOOR: nothing of it below the floor, in any frame of any move, its death too, from in front or behind (its stomp\'s thorny roots come up out of the ground: the floor swallows what of them is under it)', () => {
  for (const view of ['front', 'back'] as const) {
    for (const [move, long] of LONG) {
      let low = Infinity;
      for (let i = 0; i <= Math.round(long * 30); i++) for (const x of solids(move, i / 30, view)) if (!spike(x)) low = Math.min(low, bottomOf(x.shape));
      assert.ok(low >= -0.5, `${move} ${view}: its lowest point is ${low.toFixed(2)}, under the floor`);
    }
  }
});

test('the floor swallows its thorny roots: as they sink back, no pixel of them painted where they are under the ground', () => {
  // (as they sink, its throw of earth landed and gone: under each thorny root that stands clear before it, toward you,
  // where nothing else is painted, the picture is empty where the root goes on down under the floor)
  const t = DEER_STOMP.hit + DEER_STOMP.freeze + 0.5;
  assert.equal(deerChipCount('stomp', t), 0, 'its earth still flying');
  const { px } = deerPainted('stomp', t, 'front');
  const st = stage('front', 130, 186, { w: px.w, h: px.h });
  const sol = solids('stomp', t);
  // (what of it is before a place, toward you, and near it across the picture, might be painted over it)
  const body = sol.filter((x) => !spike(x)).map((x) => centreOf(x.shape));
  const before = (c: number[], p: number[], wide: number): boolean => p[0] - p[1] > c[0] - c[1] && Math.abs(p[0] + p[1] - c[0] - c[1]) < wide;
  const bases = sol.filter((x) => /^spikebase/.test(x.piece)).map((x) => x.shape.c as number[]);
  let clear = 0;
  let under = 0;
  for (const c of bases) {
    if (body.some((p) => before(c, p, 16))) continue;
    // (and no other thorny root before it, toward you, where it might stand in front of the place looked at)
    if (bases.some((o) => o !== c && before(c, o, 14))) continue;
    clear++;
    // (its own root runs on down under the floor from its foot; below the broken earth, nothing)
    const low = Math.min(...sol.filter((x) => x.part === `spike${bases.indexOf(c)}` && x.shape.k === 'rod').map((x) => Math.min(x.shape.a[2], x.shape.b[2])));
    assert.ok(low < -6, `its root ${bases.indexOf(c)} is only ${low.toFixed(1)} under the ground`);
    for (const d of [5, 8, 11]) {
      const [sx, sy] = st.at([c[0], c[1], -d]) as unknown as number[];
      const xx = Math.round(sx);
      const yy = Math.round(sy);
      if (px.d[(yy * px.w + xx) * 4 + 3] > 0) under++;
    }
  }
  assert.ok(clear >= 2, `${clear} thorny roots stand clear before it`);
  assert.equal(under, 0, `${under} pixels of its thorny roots painted under the floor`);
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

test('SLIDE in its moves: limping, a foot down stays on its spot while the floor goes by under it at its pace, its root leg down only a moment; in every other move a foot down stays where it is (Movement 8)', () => {
  const dt = 1 / 600;
  const V = DEER_PACE * TILE3;
  const down = [0, 0, 0, 0];
  for (let t = 0; t < DEER_WALK.period * 2; t += dt) {
    const a = deerFeet('walk', t);
    const b = deerFeet('walk', t + dt);
    for (let i = 0; i < 4; i++) {
      if (a[i][2] < 1e-6) down[i] += dt;
      if (a[i][2] < 1e-6 && b[i][2] < 1e-6) assert.ok(Math.abs(b[i][0] - a[i][0] + V * dt) < 1e-6 && Math.abs(b[i][1] - a[i][1]) < 1e-9, `limping: foot ${i} slips at ${t.toFixed(4)} s`);
    }
  }
  // (the hitch: its root leg bears it a moment, its sound legs twice as long)
  assert.ok(down[2] < 0.65 * Math.min(down[0], down[1], down[3]), `its root leg is down ${(down[2] / 2).toFixed(2)} s a round, its others ${(down[0] / 2).toFixed(2)}`);
  for (const move of ['attack', 'stomp', 'reel', 'dying']) {
    for (let t = 0; t + dt < deerLong(move); t += dt) {
      const a = deerFeet(move, t);
      const b = deerFeet(move, t + dt);
      for (let i = 0; i < 4; i++) {
        if (a[i][2] < 1e-6 && b[i][2] < 1e-6) assert.ok(Math.abs(b[i][0] - a[i][0]) + Math.abs(b[i][1] - a[i][1]) < 1e-6, `${move}: foot ${i} slides at ${t.toFixed(4)} s`);
        if (move !== 'stomp' || i > 1) assert.equal(JSON.stringify(a[i]), JSON.stringify(DEER_FEET[i]), `${move}: foot ${i} moves at ${t.toFixed(4)} s`);
      }
    }
  }
});

test('THROUGH: no leg passes through another, in any frame of any move (its death aside: it has come apart)', () => {
  const legOf = (sol: Solid[], i: number): { a: number[]; b: number[]; r: number }[] =>
    sol.filter((x) => x.part === `leg${i}` && x.shape.k === 'rod' && !/^(wrap|rtoe|rshank)/.test(x.piece)).map((x) => ({ a: x.shape.a, b: x.shape.b, r: Math.max(x.shape.ra, x.shape.rb) }));
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

test('JERK: nothing leaps from one frame to the next in any move (Movement 5): its blows quick, the rest of it slow; its stand and limp close their loops', () => {
  // (how far a piece's middle may move in a thirtieth of a second, by move: its legs; its head and antlers, whose far
  // tips swing widest; the rest of it. Its blows are quick by their nature, each on one continuous arc: the gore's lunge
  // (its antlers' tips 13 in a thirtieth, its neck 7, its forelegs 6), the slam down off its rearing (its antlers' tips 28, its neck 14, its forelegs
  // 13, in its last frame before the freeze), the flinch's snap (10); and its head, jerky and wrong (his pick), wrenched
  // round as it stands (its antlers' tips 6) and jerked down as it drops onto its root leg limping (8))
  const limit: Record<string, [number, number, number]> = { stand: [3.5, 7, 2], walk: [8, 9, 4], attack: [6, 14, 8], stomp: [13, 29, 14], reel: [2, 11, 4], dying: [5, 10, 6] };
  const leg = (p: string): boolean => /^(hoof|pastern|fet|cannon|knob|fore|arm|wrap|thigh|shank|r(thigh|knot|shank|hock|cannon|toe))/.test(p);
  const crown = (p: string): boolean => /^(beam|fork|thorn|fthorn|burr|cranium|muzzle|nose|jaw|ear|eye)/.test(p);
  for (const [move, long] of LONG) {
    const [lg, cr, rs] = limit[move];
    const a = biggestStep(move, long, leg);
    const b = biggestStep(move, long, crown);
    const c = biggestStep(move, long, (p) => !leg(p) && !crown(p));
    assert.ok(a.d <= lg, `${move}: its leg's ${a.piece} moves ${a.d.toFixed(1)} in a thirtieth, at ${a.t.toFixed(3)} s`);
    assert.ok(b.d <= cr, `${move}: its head's ${b.piece} moves ${b.d.toFixed(1)} in a thirtieth, at ${b.t.toFixed(3)} s`);
    assert.ok(c.d <= rs, `${move}: its ${c.piece} moves ${c.d.toFixed(1)} in a thirtieth, at ${c.t.toFixed(3)} s`);
  }
  assert.equal(geom('stand', 0), geom('stand', DEER_STAND.period), 'its stand\'s last moment is not its first');
  assert.equal(geom('walk', 0), geom('walk', DEER_WALK.period), 'its limp\'s last moment is not its first');
});

/** Its points the eye goes by (its hoofs and knees, its root leg's hock and foot, its head, its chest and haunch, its antlers' tips), where they are on the picture. */
const KEYS = ['hoof0', 'hoof1', 'rhock', 'rcannon', 'hoof3', 'knob0', 'knob1', 'knob3', 'cranium', 'chest', 'haunch', 'beam1_5', 'beam-1_4'];
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

test('JUMP: where one move hands over to the next (its stand, from whatever frame it has come to, into each move and back), the picture does not leap (Movement 5; the review\'s 3 game pixels)', () => {
  for (const view of ['front', 'back'] as const) {
    const stands = Array.from({ length: DEER_STAND.frames }, (_, i) => pointsOf('stand', i / DEER_STAND.fps, view));
    const rest = pointsOf('stand', 0, view);
    for (const move of MOVES) {
      if (move === 'stand') continue;
      const first = pointsOf(move, 0, view);
      for (let i = 0; i < stands.length; i++) assert.ok(leap(stands[i], first) <= 3, `${view}: its stand at ${(i / DEER_STAND.fps).toFixed(2)} s into its ${move} leaps ${leap(stands[i], first).toFixed(2)}`);
      if (move !== 'dying' && move !== 'walk') assert.ok(leap(pointsOf(move, deerLong(move), view), rest) <= 3, `${view}: its ${move}'s end back to its stand leaps`);
    }
    // (its limp stops at any frame: no frame of it leaps back to its stand)
    for (let i = 0; i < DEER_WALK.frames; i++) {
      const w = pointsOf('walk', i / DEER_WALK.fps, view);
      assert.ok(leap(w, rest) <= 3, `${view}: its limp at ${(i / DEER_WALK.fps).toFixed(3)} s back to its stand leaps ${leap(w, rest).toFixed(2)}`);
    }
  }
});

test('ALIVE: never still from one frame to the next; its head wrenched round, its root leg lifted, a shudder (Movement 6)', () => {
  for (let i = 0; i < DEER_STAND.frames; i++) assert.notEqual(geom('stand', i / DEER_STAND.fps), geom('stand', (i + 1) / DEER_STAND.fps), `frames ${i} and ${i + 1} are the same`);
  for (const at of DEER_HABITS.snaps) {
    const a = pieceAt('stand', at - 0.02, 'nose').c;
    const b = pieceAt('stand', at + 0.12, 'nose').c;
    assert.ok(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) > 2.5, `its head wrenched round at ${at} s, its nose ${Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]).toFixed(2)}`);
  }
  assert.ok(deerFeet('stand', (DEER_HABITS.lift[0] + DEER_HABITS.lift[1]) / 2)[2][2] > 1, 'its root leg lifted');
});

test('BLOW: its antler gore: its head lowered, its antlers aimed and held trembling (the warning); the lunge, its antlers sweeping out before it, held a tenth; its head flung up after; back on its stand (Movement 3, 7, Monsters 4)', () => {
  const G = DEER_GORE;
  const head = (t: number): number[] => pieceAt('attack', t, 'cranium').c;
  const tip = (t: number): number[] => pieceAt('attack', t, 'beam1_5').b;
  assert.ok(head(0.38)[2] < head(0)[2] - 6, `its head lowered ${(head(0)[2] - head(0.38)[2]).toFixed(1)} for the warning`);
  // (held: its antlers' tip trembling, never still, but staying where it is)
  let most = 0;
  for (let t = G.warn + 0.06; t < 0.44; t += 1 / 30) most = Math.max(most, Math.hypot(...[0, 1, 2].map((k) => tip(t)[k] - tip(G.warn + 0.06)[k])));
  assert.ok(most > 0.2 && most < 4, `its warning held, its antlers trembling ${most.toFixed(2)}`);
  const held = geom('attack', G.hit);
  for (const t of [G.hit + 0.03, G.hit + G.freeze - 0.005]) assert.equal(geom('attack', t), held, `the gore moves in its freeze at ${t.toFixed(3)} s`);
  assert.ok(head(G.hit)[0] > head(0.4)[0] + 8, `it lunges ${(head(G.hit)[0] - head(0.4)[0]).toFixed(1)}`);
  const reach = Math.max(...solids('attack', G.hit).filter((x) => /^antler/.test(x.part)).map((x) => centreOf(x.shape)[0]));
  assert.ok(reach > G.reach - 12, `its antlers sweep out ${reach.toFixed(1)} before it`);
  const nose = (t: number): number[] => pieceAt('attack', t, 'nose').c;
  assert.ok(nose(G.hit + G.freeze + 0.17)[2] > nose(G.hit)[2] + 4, `its head flung up after the blow, ${(nose(G.hit + G.freeze + 0.17)[2] - nose(G.hit)[2]).toFixed(1)}`);
  assert.equal(geom('attack', G.long, false), geom('stand', 0, false), 'back on its stand at its end');
});

test('BLOW: its rearing stomp: reared up on its hind legs, its forefeet off the floor and held, pawing (the warning); the slam, its forefeet down on their spots, held a tenth; thorny roots bursting up out of the ground round it, and sinking back; back on its stand (his pick, “Thorns burst from the ground”)', () => {
  const S = DEER_STOMP;
  const head = (t: number): number[] => pieceAt('stomp', t, 'cranium').c;
  assert.ok(head(0.5)[2] > head(0)[2] + 15, `reared up, its head ${(head(0.5)[2] - head(0)[2]).toFixed(1)} higher`);
  for (const t of [0.4, 0.5, 0.6]) assert.ok(deerFeet('stomp', t).slice(0, 2).every((f) => f[2] > 6), `its forefeet up at ${t} s`);
  // (pawing the air: its forefeet never still while it is held up)
  const f0 = (t: number): readonly number[] => deerFeet('stomp', t)[0];
  assert.ok(Math.hypot(...[0, 1, 2].map((k) => f0(0.45)[k] - f0(0.52)[k])) > 0.5, 'its forefeet paw the air');
  for (const f of deerFeet('stomp', S.hit).slice(0, 2)) assert.ok(f[2] < 1e-6, 'its forefeet down at the slam');
  for (const i of [0, 1]) assert.ok(Math.hypot(deerFeet('stomp', S.hit)[i][0] - DEER_FEET[i][0], deerFeet('stomp', S.hit)[i][1] - DEER_FEET[i][1]) < 1e-6, `its forefoot ${i} down on its spot`);
  const held = geom('stomp', S.hit);
  for (const t of [S.hit + 0.04, S.hit + S.freeze - 0.005]) assert.equal(geom('stomp', t), held, `the slam moves in its freeze at ${t.toFixed(3)} s`);
  // (the thorny roots: none before the slam; up out of the ground after it, nine round it, out to its reach; gone by its end)
  const spikes = (t: number): Solid[] => solids('stomp', t).filter(spike);
  assert.equal(spikes(S.hit - 0.05).length, 0, 'thorns before the slam');
  const up = S.hit + S.freeze + 0.2;
  const tips = new Map<string, number>();
  for (const x of spikes(up)) tips.set(x.part, Math.max(tips.get(x.part) ?? -Infinity, topOf(x.shape)));
  assert.equal(tips.size, 9, `${tips.size} thorny roots`);
  for (const [p, z] of tips) assert.ok(z > 15, `${p} up ${z.toFixed(1)} out of the ground`);
  const far = Math.max(...spikes(up).filter((x) => /^spikebase/.test(x.piece)).map((x) => Math.hypot(x.shape.c[0], x.shape.c[1])));
  assert.ok(far > S.reach * 0.9, `out to ${far.toFixed(1)} round it`);
  // (each comes up out of the ground: lower a moment after it bursts than when it is all the way up)
  const tipOf = (t: number): number => Math.max(...spikes(t).filter((x) => x.part === 'spike0').map((x) => topOf(x.shape)));
  assert.ok(tipOf(S.hit + S.freeze + 0.06) < tipOf(up), 'it rises out of the ground');
  assert.equal(spikes(S.long).length, 0, 'thorns at its end');
  assert.equal(geom('stomp', S.long, false), geom('stand', 0, false), 'back on its stand at its end');
});

test('struck: held as the blow lands; knocked back, its head snapped round; bark, splinters and moss flying off it; back on its stand by its end (Hits 3, 4)', () => {
  const R = DEER_REEL;
  const frozen = geom('reel', 0);
  for (const t of [0.02, R.freeze - 0.005]) assert.equal(geom('reel', t), frozen, `moves during the freeze at ${t}`);
  assert.ok(pieceAt('reel', 0.2, 'haunch').c[0] < pieceAt('reel', 0, 'haunch').c[0] - 2, 'knocked back');
  const a = pieceAt('reel', 0, 'cranium').c;
  const b = pieceAt('reel', 0.2, 'cranium').c;
  assert.ok(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) > 4, 'its head snapped round');
  assert.ok(deerChipCount('reel', 0.2) > 6, 'what flies off it');
  assert.equal(geom('reel', R.long, false), geom('stand', 0, false), 'back on its stand at its end');
});

test('its death (his pick, “It splits apart into roots and bark”): held as the blow lands; it convulses; it splits apart, its pieces falling away from one another; its eyes out; at its end its pieces lying on the floor; still', () => {
  const Dd = DEER_DIE;
  const frozen = geom('dying', 0);
  for (const t of [0.03, Dd.freeze - 0.005]) assert.equal(geom('dying', t), frozen, `moves in the blow's freeze at ${t}`);
  // (its pieces: each part of it, its head with its muzzle)
  const pieces = (t: number): Map<string, number[]> => {
    const m = new Map<string, number[][]>();
    for (const x of solids('dying', t)) {
      if (x.shape.k === 'glow') continue;
      const g = x.part === 'muzzle' ? 'head' : x.part;
      if (!m.has(g)) m.set(g, []);
      m.get(g)!.push(centreOf(x.shape));
    }
    return new Map([...m].map(([g, ps]) => [g, [0, 1, 2].map((k) => ps.reduce((s, p) => s + p[k], 0) / ps.length)]));
  };
  const at = pieces(Dd.split);
  const end = pieces(Dd.long);
  assert.ok(at.size >= 10, `it splits into ${at.size} pieces`);
  // (apart: its pieces further from one another, and from where they were)
  const spread = (m: Map<string, number[]>): number => {
    const ps = [...m.values()];
    let s = 0;
    for (const p of ps) for (const q of ps) s += Math.hypot(p[0] - q[0], p[1] - q[1]);
    return s / (ps.length * ps.length);
  };
  assert.ok(spread(end) > spread(at) + 3, `its pieces fall apart, ${spread(at).toFixed(1)} to ${spread(end).toFixed(1)}`);
  let moved = 0;
  for (const [g, p] of at) moved += Math.hypot(...[0, 1, 2].map((k) => p[k] - end.get(g)![k])) > 6 ? 1 : 0;
  assert.ok(moved >= at.size - 1, `${moved} of its ${at.size} pieces fall`);
  // (lying on the floor: each piece's lowest point on it)
  const lows = new Map<string, number>();
  for (const x of solids('dying', Dd.long)) {
    const g = x.part === 'muzzle' ? 'head' : x.part;
    lows.set(g, Math.min(lows.get(g) ?? Infinity, bottomOf(x.shape)));
  }
  for (const [g, z] of lows) assert.ok(z > -0.5 && z < 1.5, `its ${g} lies ${z.toFixed(2)} off the floor`);
  // (its eyes out: no light, and no fire colour left in it)
  assert.equal(deerPainted('dying', Dd.split + 0.15, 'front').lights.length, 0, 'its eyes are out');
  const { px } = deerPainted('dying', Dd.long, 'front');
  let fire = 0;
  for (let i = 0; i < px.d.length; i += 4) if (px.d[i + 3] === 255 && [FLAME[3], FLAME[4]].some((c) => rgba(c).slice(0, 3).join(',') === `${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`)) fire++;
  assert.equal(fire, 0, 'its eyes burn on');
  const still = geom('dying', Dd.still);
  for (const t of [Dd.still + 0.1, Dd.long]) assert.equal(geom('dying', t), still, `something moves at ${t} s`);
});

test('what its moves throw off comes and goes: gone by the end of every move', () => {
  for (const move of ['attack', 'stomp', 'reel', 'dying']) assert.equal(deerChipCount(move, deerLong(move)), 0, `${move}: something thrown off at its end`);
  assert.ok(deerChipCount('attack', DEER_GORE.hit + DEER_GORE.freeze + 0.05) > 8, 'the gore rakes the earth');
  assert.equal(deerChipCount('attack', DEER_GORE.hit), deerChipCount('attack', DEER_GORE.hit + DEER_GORE.freeze - 0.005), 'the earth it rakes held in the freeze too');
  assert.ok(deerChipCount('stomp', DEER_STOMP.hit + DEER_STOMP.freeze + 0.1) > 40, 'the slam and the thorny roots burst the earth');
  assert.ok(deerChipCount('reel', 0.2) > 6, 'struck, bark and splinters fly');
  assert.ok(deerChipCount('dying', DEER_DIE.split + 0.1) > 15, 'it splits, bark and splinters flying');
  let puff = 0;
  for (let t = 0; t < DEER_WALK.period; t += 1 / 60) puff = Math.max(puff, deerChipCount('walk', t));
  assert.ok(puff > 2, 'limping, its root foot drags up the forest floor');
  for (const t of [0, 0.5, 1.0, 1.5]) assert.equal(deerChipCount('stand', t), 0, `standing, something thrown off at ${t}`);
});

test('its pictures as the game holds them: standing fifteen a second, limping sixteen; its gore, its stomp, struck and its death at thirty', () => {
  const art = makeDeerArt() as any;
  for (const f of [art.front, art.back]) {
    assert.equal(f.idle.length, DEER_STAND.frames);
    assert.equal(f.walk.length, DEER_WALK.frames);
    assert.equal(f.idleFps, 15);
    assert.equal(f.walkFps, 16);
    assert.equal(f.attack.length, 3);
    assert.equal(f.clips.attack.hit, DEER_GORE.hit);
    assert.equal(f.clips.attack.frames.length, Math.round(DEER_GORE.long * 30) + 1);
    assert.equal(f.clips.moves.stomp.hit, DEER_STOMP.hit);
    assert.equal(f.clips.moves.stomp.frames.length, Math.round(DEER_STOMP.long * 30) + 1);
    assert.equal(f.clips.die.frames.length, Math.round(DEER_DIE.long * 30) + 1);
    assert.equal(f.clips.reel.frames.length, Math.round(DEER_REEL.long * 30) + 1);
  }
});
