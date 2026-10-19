// FLOOR 11'S MUTE WATCH HOUNDS (src/art/hounds.ts). A MOCK-UP: NOT IN THE GAME, behind HOUNDS_ON, off. The owner's pick
// in the art chat, 18 Oct 2026: of floor 11's monsters, “Mute watch hounds”; and then, “Hey go without my say so.  If
// something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15”: so their brief is this
// chat's, sent him with their films. Held to his art rulebook before he sees it, in every frame of every move, from in
// front and from behind, as Act 1's four-legged kinds are (tests/twisted_deer.test.ts):
//   - the switch off, nothing of the game importing them;
//   - crisp pixels; the pink edge while it lives; nothing cyan; every light the enemy's; its eyes burning while it
//     lives; nothing cut off at its canvas's edge;
//   - its size: its back about the knight's hip (he is 58 tall);
//   - FLOOR: nothing of it below the floor;
//   - SLIDE: a foot that is down stays where it came down (loping, the floor going by under it at its pace);
//   - THROUGH: no leg through another;
//   - JERK: nothing leaps from one frame to the next; its stand and lope close their loops; JUMP: where one move hands
//     over to another, the picture does not leap;
//   - ALIVE: never still; its stand's habits;
//   - BLOW: its pounce crouched, held trembling (the warning), its forepaws slammed down before it and held a tenth,
//     pushed back off them; back on its stand;
//   - struck; its death (the gag slips off; one howl that makes no sound, the Hush pouring out of its open jaws; it
//     lies down on its side, its eyes out; still); the Hush seeping round the gag while it lives;
//   - its pictures as the game holds them.
//   run: tsx --test tests/hounds.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { HOUNDS_ON, HOUND_DIE, HOUND_FEET, HOUND_HABITS, HOUND_PACE, HOUND_POUNCE, HOUND_REEL, HOUND_STAND, HOUND_WALK, houndFeet, houndGrains, houndLong, houndPainted, houndSolids, makeHoundArt } from '../src/art/hounds';
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
// every frame the game would show of its stand (fifteen a second) and its lope (sixteen), and every third of its other
// moves at thirty a second (and their last), from in front and from behind
const MOVES = ['stand', 'walk', 'attack', 'reel', 'dying'];
const FPS: Record<string, number> = { stand: HOUND_STAND.fps, walk: HOUND_WALK.fps };
const LONG: [string, number, number][] = MOVES.map((m) => [m, houndLong(m), FPS[m] ?? 30]);
for (const view of ['front', 'back'] as const) {
  for (const [move, long, fps] of LONG) {
    const n = Math.round(long * fps);
    const step = FPS[move] ? 1 : 3;
    for (let i = 0; i <= n; i += i + step > n && i !== n ? n - i : step) {
      if (FPS[move] && i === n) break;
      frames.push({ name: `${move} ${view} ${i}/${fps}`, move, t: i / fps, alive: move !== 'dying', painted: memo(() => houndPainted(move, i / fps, view)) });
    }
  }
}
type Solid = { part: string; piece: string; shape: any };
const solids = (move: string, t: number, view: 'front' | 'back' = 'front'): Solid[] => houndSolids(move, t, view) as Solid[];
const pieceAt = (move: string, t: number, piece: string): any => solids(move, t).find((x) => x.piece === piece)?.shape;
function bottomOf(sh: any): number {
  if (sh.k === 'rod') return Math.min(sh.a[2] - sh.ra, sh.b[2] - sh.rb);
  if (sh.k === 'ball') return sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  if (sh.k === 'band') return sh.ring.c[2] - Math.hypot(sh.ring.u[2], sh.ring.v[2]);
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
  if (sh.k === 'band') return sh.ring.c;
  return sh.c;
}
/** The geometry of one moment, each number to a millionth (skins left out); `hung`: with what hangs and swings with how it has been moving. */
function geom(move: string, t: number, hung = true): string {
  const sol = solids(move, t).filter((x) => hung || !/^(tail|tag|gagends)/.test(x.piece));
  return JSON.stringify(sol, (k, v) => (k === 'skin' || k === 'ramp' ? undefined : typeof v === 'number' ? Math.round(v * 1e6) : v));
}
/** The largest move of any piece of it (by its middle) from one thirtieth of a second to the next, among those `which` picks (pieces of one name, by their order). */
function biggestStep(move: string, long: number, which: (piece: string) => boolean): { d: number; piece: string; t: number } {
  let best = { d: 0, piece: '', t: 0 };
  const n = Math.round(long * 30);
  const keyed = (sol: Solid[]): Map<string, Solid> => {
    const seen = new Map<string, number>();
    const m = new Map<string, Solid>();
    for (const x of sol) {
      const k = seen.get(x.piece) ?? 0;
      seen.set(x.piece, k + 1);
      m.set(`${x.piece}#${k}`, x);
    }
    return m;
  };
  for (let i = 0; i < n; i++) {
    const a = keyed(solids(move, i / 30));
    for (const [key, x] of keyed(solids(move, (i + 1) / 30))) {
      const before = a.get(key);
      if (!before || !which(x.piece)) continue;
      const p = centreOf(before.shape);
      const q = centreOf(x.shape);
      const d = Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]);
      if (d > best.d) best = { d, piece: key, t: (i + 1) / 30 };
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

test('the switch is off, and nothing of the game imports them', () => {
  assert.equal(HOUNDS_ON.on, false, 'HOUNDS_ON is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f === 'art/hounds.ts') continue;
    if (/from ['"][^'"]*\/hounds['"]/.test(fs.readFileSync(`src/${f}`, 'utf8'))) users.push(f);
  }
  assert.equal(users.join(' '), '', 'game files that import them');
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
    if (f.alive) assert.ok(rim > 100, `${f.name}: its pink edge, ${rim} pixels`);
    else assert.ok(rim === 0, `${f.name}: a pink edge on it dead`);
  }
});

test('nothing cyan, every light the enemy\'s, its eyes burning while it lives, and nothing of it cut off at its canvas\'s edge', () => {
  for (const f of frames) {
    const { px, lights } = f.painted();
    let eyes = 0;
    for (let i = 0; i < px.d.length; i += 4) {
      if (px.d[i + 3] === 0) continue;
      const [h, sat] = hue(px.d[i], px.d[i + 1], px.d[i + 2]);
      assert.ok(!(sat > 0.4 && Math.max(px.d[i], px.d[i + 1], px.d[i + 2]) > 140 && h >= 165 && h <= 205), `${f.name}: cyan`);
      if (FIRE.has(`${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`)) eyes++;
    }
    // (its eyes, or the light of them where they are turned from you)
    if (f.alive) assert.ok(eyes > 0 || lights.length > 0, `${f.name}: its eyes`);
    for (const L of lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${f.name}: its light ${L.color}`);
    let cut = 0;
    for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    assert.ok(cut === 0, `${f.name}: ${cut} pixels on its canvas's edge`);
  }
});

test('its size: its back about the knight\'s hip (he is 58 tall), its head higher', () => {
  let back = 0;
  let head = 0;
  for (const b of solids('stand', 0)) {
    if (/^(body|haunch)$/.test(b.part)) back = Math.max(back, topOf(b.shape));
    if (b.part === 'head') head = Math.max(head, topOf(b.shape));
  }
  assert.ok(back > 26 && back < 34, `its back ${back.toFixed(1)} up`);
  assert.ok(head > back + 3 && head < 46, `its head ${head.toFixed(1)} up`);
});

test('FLOOR: nothing of it below the floor, in any frame of any move, its death too, from in front or behind', () => {
  for (const view of ['front', 'back'] as const) {
    for (const [move, long] of LONG) {
      let low = Infinity;
      let what = '';
      for (let i = 0; i <= Math.round(long * 30); i++) {
        for (const x of solids(move, i / 30, view)) {
          const b = bottomOf(x.shape);
          if (b < low) {
            low = b;
            what = `${x.piece} at ${(i / 30).toFixed(2)}`;
          }
        }
      }
      assert.ok(low >= -0.5, `${move} ${view}: its lowest point is ${low.toFixed(2)}, under the floor (${what})`);
    }
  }
});

test('SLIDE: standing, its feet stay where they stand; loping, a foot down stays on its spot while the floor goes by under it at its pace; in every other move a foot down stays where it is', () => {
  const dt = 1 / 600;
  for (let t = 0; t < HOUND_STAND.period; t += dt) {
    const feet = houndFeet('stand', t);
    for (let i = 0; i < 4; i++) assert.equal(JSON.stringify(feet[i]), JSON.stringify(HOUND_FEET[i]), `foot ${i} moves at ${t.toFixed(3)} s`);
  }
  const V = HOUND_PACE * TILE3;
  for (let t = 0; t < HOUND_WALK.period * 2; t += dt) {
    const a = houndFeet('walk', t);
    const b = houndFeet('walk', t + dt);
    for (let i = 0; i < 4; i++) if (a[i][2] < 1e-6 && b[i][2] < 1e-6) assert.ok(Math.abs(b[i][0] - a[i][0] + V * dt) < 1e-6 && Math.abs(b[i][1] - a[i][1]) < 1e-9, `loping: foot ${i} slips at ${t.toFixed(4)} s`);
  }
  for (const move of ['attack', 'reel', 'dying']) {
    for (let t = 0; t + dt < houndLong(move); t += dt) {
      const a = houndFeet(move, t);
      const b = houndFeet(move, t + dt);
      for (let i = 0; i < 4; i++) if (a[i][2] < 1e-6 && b[i][2] < 1e-6) assert.ok(Math.abs(b[i][0] - a[i][0]) + Math.abs(b[i][1] - a[i][1]) < 1e-6, `${move}: foot ${i} slides at ${t.toFixed(4)} s`);
    }
  }
  // (its pounce: its hind feet never move; its forefeet back on their spots at its end)
  for (let t = 0; t < houndLong('attack'); t += dt) for (const i of [2, 3]) assert.equal(JSON.stringify(houndFeet('attack', t)[i]), JSON.stringify(HOUND_FEET[i]), `pouncing: hind foot ${i} moves at ${t.toFixed(3)}`);
  for (const i of [0, 1]) assert.equal(JSON.stringify(houndFeet('attack', houndLong('attack'))[i]), JSON.stringify(HOUND_FEET[i]), `forefoot ${i} not back on its spot`);
});

test('THROUGH: no leg passes through another, in any frame of any move (its death aside, as it folds and lies)', () => {
  const legOf = (sol: Solid[], i: number): { a: number[]; b: number[]; r: number }[] =>
    sol.filter((x) => x.part === `leg${i}` && x.shape.k === 'rod').map((x) => ({ a: x.shape.a, b: x.shape.b, r: Math.max(x.shape.ra, x.shape.rb) }));
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

test('JERK: nothing leaps from one frame to the next in any move: its blow quick, the rest of it slow; its stand and lope close their loops', () => {
  // (how far a piece's middle may move in a thirtieth of a second, by move: its legs; its head; the rest of it. Its
  // lope is fast (2.4 tiles a second: its feet swing forward through the air at twice that); its pounce's spring and
  // slam quick by its nature, on one continuous arc: its head swung up as it springs, 10 in a thirtieth, its body 8)
  const limit: Record<string, [number, number, number]> = { stand: [0.5, 4, 2], walk: [12, 6, 4], attack: [9, 12, 8], reel: [3, 8, 4], dying: [6, 9, 8] };
  const leg = (p: string): boolean => /^(upper|fore|thigh|shank|joint|pastern|paw)/.test(p);
  const head = (p: string): boolean => /^(cranium|brow|muzzle|nose|jaw|mouth|fang|eye|ear|gag|neck|collar|stud|tag)/.test(p);
  for (const [move, long] of LONG) {
    const [lg, hd, rs] = limit[move];
    const a = biggestStep(move, long, leg);
    const b = biggestStep(move, long, head);
    const c = biggestStep(move, long, (p) => !leg(p) && !head(p) && !/^eyeglow/.test(p));
    assert.ok(a.d <= lg, `${move}: its leg's ${a.piece} moves ${a.d.toFixed(1)} in a thirtieth, at ${a.t.toFixed(3)} s`);
    assert.ok(b.d <= hd, `${move}: its head's ${b.piece} moves ${b.d.toFixed(1)} in a thirtieth, at ${b.t.toFixed(3)} s`);
    assert.ok(c.d <= rs, `${move}: its ${c.piece} moves ${c.d.toFixed(1)} in a thirtieth, at ${c.t.toFixed(3)} s`);
  }
  assert.equal(geom('stand', 0), geom('stand', HOUND_STAND.period), 'its stand\'s last moment is not its first');
  assert.equal(geom('walk', 0), geom('walk', HOUND_WALK.period), 'its lope\'s last moment is not its first');
});

/** Its points the eye goes by (its paws, its head, its chest and haunch), where they are on the picture. */
const KEYS = ['paw0', 'paw1', 'paw2', 'paw3', 'cranium', 'chest', 'haunch', 'nose'];
function pointsOf(move: string, t: number, view: 'front' | 'back'): number[][] {
  const st = stage(view, 0, 0, { w: 2, h: 2 });
  const sol = solids(move, t, view);
  return KEYS.map((k) => {
    const x = sol.find((y) => y.piece === k)!;
    return st.at(x.shape.k === 'rod' ? x.shape.b : x.shape.c) as unknown as number[];
  });
}
const leap = (a: number[][], b: number[][]): number => a.reduce((s, p, i) => s + Math.hypot(p[0] - b[i][0], p[1] - b[i][1]), 0) / a.length / 2;

test('JUMP: where one move hands over to the next (its stand, from whatever frame it has come to, into each move and back), the picture does not leap (the review\'s 3 game pixels)', () => {
  for (const view of ['front', 'back'] as const) {
    const stands = Array.from({ length: HOUND_STAND.frames }, (_, i) => pointsOf('stand', i / HOUND_STAND.fps, view));
    const rest = pointsOf('stand', 0, view);
    for (const move of MOVES) {
      if (move === 'stand') continue;
      const first = pointsOf(move, 0, view);
      for (let i = 0; i < stands.length; i++) assert.ok(leap(stands[i], first) <= 3, `${view}: its stand at ${(i / HOUND_STAND.fps).toFixed(2)} s into its ${move} leaps ${leap(stands[i], first).toFixed(2)}`);
      if (move !== 'dying' && move !== 'walk') assert.ok(leap(pointsOf(move, houndLong(move), view), rest) <= 3, `${view}: its ${move}'s end back to its stand leaps`);
    }
    for (let i = 0; i < HOUND_WALK.frames; i++) {
      const w = pointsOf('walk', i / HOUND_WALK.fps, view);
      assert.ok(leap(w, rest) <= 3, `${view}: its lope at ${(i / HOUND_WALK.fps).toFixed(3)} s back to its stand leaps ${leap(w, rest).toFixed(2)}`);
    }
  }
});

test('ALIVE: never still from one frame to the next; its head turned to look, its ears pricked, a shake of its head at the gag', () => {
  for (let i = 0; i < HOUND_STAND.frames; i++) assert.notEqual(geom('stand', i / HOUND_STAND.fps), geom('stand', (i + 1) / HOUND_STAND.fps), `frames ${i} and ${i + 1} are the same`);
  const nose = (t: number): number[] => pieceAt('stand', t, 'nose').c;
  const look = (HOUND_HABITS.look[0] + HOUND_HABITS.look[1]) / 2;
  assert.ok(Math.hypot(...[0, 1, 2].map((k) => nose(look)[k] - nose(0)[k])) > 3, 'its head turned to look');
  const shake = HOUND_HABITS.shake[0] + 0.12;
  let most = 0;
  for (let t = HOUND_HABITS.shake[0]; t < HOUND_HABITS.shake[1]; t += 1 / 30) most = Math.max(most, Math.hypot(...[0, 1, 2].map((k) => nose(t)[k] - nose(shake)[k])));
  assert.ok(most > 1.5, `its head shaken, ${most.toFixed(2)}`);
});

test('BLOW: its pounce: crouched, held trembling (the warning); its forepaws slammed down before it, held a tenth; pushed back off them; back on its stand', () => {
  const P = HOUND_POUNCE;
  const chest = (t: number): number[] => pieceAt('attack', t, 'chest').c;
  assert.ok(chest(0.3)[2] < chest(0)[2] - 3, `crouched ${(chest(0)[2] - chest(0.3)[2]).toFixed(1)}`);
  let most = 0;
  for (let t = P.warn + 0.05; t < P.spring; t += 1 / 30) most = Math.max(most, Math.hypot(...[0, 1, 2].map((k) => chest(t)[k] - chest(P.warn + 0.05)[k])));
  assert.ok(most > 0.2 && most < 3, `its warning held, trembling ${most.toFixed(2)}`);
  for (const i of [0, 1]) {
    const f = houndFeet('attack', P.hit);
    assert.ok(f[i][2] < 1e-6 && f[i][0] > HOUND_FEET[i][0] + P.reach - 0.5, `forepaw ${i} slammed down ${f[i][0].toFixed(1)} on`);
  }
  for (const t of [(P.spring + P.hit) / 2]) for (const i of [0, 1]) assert.ok(houndFeet('attack', t)[i][2] > 3, `forepaw ${i} in the air at ${t.toFixed(2)}`);
  const held = geom('attack', P.hit, false);
  for (const t of [P.hit + 0.03, P.hit + P.freeze - 0.005]) assert.equal(geom('attack', t, false), held, `the pounce moves in its freeze at ${t.toFixed(3)} s`);
  assert.ok(chest(P.hit)[0] > chest(0.4)[0] + 8, `it springs ${(chest(P.hit)[0] - chest(0.4)[0]).toFixed(1)}`);
  assert.equal(geom('attack', P.long, false), geom('stand', 0, false), 'back on its stand at its end');
});

test('struck: held as the blow lands; knocked back, its head snapped round; the Hush coughed out round the gag; back on its stand by its end', () => {
  const R = HOUND_REEL;
  const frozen = geom('reel', 0, false);
  for (const t of [0.02, R.freeze - 0.005]) assert.equal(geom('reel', t, false), frozen, `moves during the freeze at ${t}`);
  assert.ok(pieceAt('reel', 0.2, 'haunch').c[0] < pieceAt('reel', 0, 'haunch').c[0] - 1.5, 'knocked back');
  const a = pieceAt('reel', 0, 'cranium').c;
  const b = pieceAt('reel', 0.2, 'cranium').c;
  assert.ok(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) > 3, 'its head snapped round');
  assert.ok(houndGrains('reel', 0.2).length > houndGrains('stand', 0).length, 'the Hush coughed out');
  assert.equal(geom('reel', R.long, false), geom('stand', 0, false), 'back on its stand at its end');
});

test('its death: the gag slips off and lies on the floor; one howl that makes no sound, its jaws open, the Hush pouring out; its eyes out; it lies down on its side; still', () => {
  const Dd = HOUND_DIE;
  const frozen = geom('dying', 0);
  for (const t of [0.03, Dd.freeze - 0.005]) assert.equal(geom('dying', t), frozen, `moves in the blow's freeze at ${t}`);
  // (the gag on its muzzle, then off it and lying on the floor)
  const gagAt = (t: number): number[] => centreOf(pieceAt('dying', t, 'gag'));
  const nose = (t: number): number[] => pieceAt('dying', t, 'nose').c;
  assert.ok(Math.hypot(...[0, 1, 2].map((k) => gagAt(0)[k] - nose(0)[k])) < 8, 'the gag on its muzzle');
  assert.ok(gagAt(Dd.long)[2] < 3 && Math.hypot(...[0, 1, 2].map((k) => gagAt(Dd.long)[k] - nose(Dd.long)[k])) > 8, 'the gag lying on the floor, off its muzzle');
  // (its howl: its head thrown back, its jaws open, the Hush pouring out of them)
  const howl = (Dd.howl[0] + Dd.howl[1]) / 2;
  assert.ok(nose(howl)[2] > nose(0)[2] + 5, `its head thrown back ${(nose(howl)[2] - nose(0)[2]).toFixed(1)}`);
  assert.ok(solids('dying', howl).some((x) => x.piece === 'mouth'), 'its jaws open');
  let great = 0;
  for (let t = Dd.howl[0]; t < Dd.howl[1] + 0.4; t += 0.05) great = Math.max(great, houndGrains('dying', t).length);
  let seep = 0;
  for (let t = 0; t < HOUND_STAND.period; t += 0.1) seep = Math.max(seep, houndGrains('stand', t).length);
  assert.ok(seep > 0 && great > 1.8 * seep, `the Hush: ${great} motes as it leaves, ${seep} seeping while it stands`);
  assert.equal(houndGrains('dying', Dd.long).length, 0, 'the Hush still pouring out at its end');
  // (its eyes out; lying down on its side, low; still)
  assert.equal(houndPainted('dying', Dd.howl[0] + 0.35, 'front').lights.length, 0, 'its eyes are out');
  const high = Math.max(...solids('dying', Dd.long).filter((x) => /^(body|haunch)$/.test(x.part)).map((x) => topOf(x.shape)));
  const stood = Math.max(...solids('stand', 0).filter((x) => /^(body|haunch)$/.test(x.part)).map((x) => topOf(x.shape)));
  assert.ok(high < stood * 0.6, `lying down: its body ${high.toFixed(1)} high, ${stood.toFixed(1)} standing`);
  const still = geom('dying', Dd.still);
  for (const t of [Dd.still + 0.1, Dd.long]) assert.equal(geom('dying', t), still, `something moves at ${t} s`);
});

test('the Hush seeps round the gag in every living frame, and only grey: nothing cyan in it', () => {
  for (const [move, long, fps] of LONG) {
    if (move === 'dying') continue;
    for (let i = 0; i < Math.round(long * fps); i++) {
      const g = houndGrains(move, i / fps);
      assert.ok(g.length > 0, `${move} @${(i / fps).toFixed(2)}: no breath`);
      for (const [, c] of g) {
        const [r, gg, b] = rgba(c);
        const [h, sat] = hue(r, gg, b);
        assert.ok(!(sat > 0.4 && h >= 165 && h <= 205), `${move}: the Hush in ${c}`);
      }
    }
  }
});

test('its pictures as the game holds them: standing fifteen a second, loping sixteen; its pounce, struck and its death at thirty', () => {
  const art = makeHoundArt() as any;
  for (const f of [art.front, art.back]) {
    assert.equal(f.idle.length, HOUND_STAND.frames);
    assert.equal(f.walk.length, HOUND_WALK.frames);
    assert.equal(f.idleFps, 15);
    assert.equal(f.walkFps, 16);
    assert.equal(f.attack.length, 3);
    assert.equal(f.clips.attack.hit, HOUND_POUNCE.hit);
    assert.equal(f.clips.attack.frames.length, Math.round(HOUND_POUNCE.long * 30) + 1);
    assert.equal(f.clips.die.frames.length, Math.round(HOUND_DIE.long * 30) + 1);
    assert.equal(f.clips.reel.frames.length, Math.round(HOUND_REEL.long * 30) + 1);
  }
});
