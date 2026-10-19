// FLOOR 12'S SMALL MOB, THE KING'S RATS (src/art/rats.ts). A MOCK-UP: NOT IN THE GAME, behind RATS_ON, off. Their
// brief is this chat's, on his word of 18 Oct (“Hey go without my say so.  If something is shit I’ll get it to it but
// you’re doing a great jobs. At least for 11-15”), sent him with their films. Held to his art rulebook before he sees
// them, in every frame of every move, from in front and from behind, as the hounds are (tests/hounds.test.ts):
//   - in the game through art/act1_figs/rat.ts alone (behind ACT2), its switch thrown with the acts' figures;
//   - crisp pixels; the pink edge while it lives; nothing cyan; every light the enemy's; its eyes burning while it
//     lives; nothing cut off at its canvas's edge;
//   - its size: small (the knight is 58 tall), about a tile long without its tail;
//   - FLOOR: nothing of it below the floor;
//   - SLIDE: a foot that is down stays where it came down (scurrying, the floor going by under it at its pace);
//   - JERK: nothing leaps from one frame to the next; its stand and scurry close their loops; JUMP: where one move
//     hands over to another, the picture does not leap;
//   - ALIVE: never still;
//   - THE LEAP AND BITE (crouched, its rump wiggling, the warning; off the floor, stretched out; the snap, held a
//     tenth; back where it was); LOOKING ROUND (up on its hind legs);
//   - its death (flipped onto its back, its legs up; the voice going out of it, pink going pale; still);
//   - its pictures as the game holds them.
//   run: tsx --test tests/rats.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { RATS_ON, RAT_BITE, RAT_DIE, RAT_LOOK, RAT_PACE, RAT_STAND, RAT_WALK, makeRatArt, ratGrains, ratLong, ratPainted, ratPose, ratSolids } from '../src/art/rats';
import { TILE3 } from '../src/art/new_mobs3';
import { FIG as FIG_RAT } from '../src/art/act1_figs/rat';
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
const MOVES = ['stand', 'walk', 'attack', 'reel', 'look', 'dying'];
const FPS: Record<string, number> = { stand: RAT_STAND.fps, walk: RAT_WALK.fps };
const LONG: [string, number, number][] = MOVES.map((m) => [m, ratLong(m), FPS[m] ?? 30]);
const LOOPS = new Set(['stand', 'walk']);
for (const view of ['front', 'back'] as const) {
  for (const [move, long, fps] of LONG) {
    const n = Math.round(long * fps);
    for (let i = 0; i <= n; i++) {
      if (LOOPS.has(move) && i === n) break;
      frames.push({ name: `${move} ${view} ${i}/${fps}`, move, t: i / fps, alive: move !== 'dying', painted: memo(() => ratPainted(move, i / fps, view)) });
    }
  }
}
type Solid = { part: string; piece: string; shape: any };
const solids = (move: string, t: number, view: 'front' | 'back' = 'front'): Solid[] => ratSolids(move, t, view) as Solid[];
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
  if (sh.k === 'dot' || sh.k === 'glow' || sh.k === 'mote') return sh.p;
  return sh.c;
}
function geom(move: string, t: number): string {
  const sol = solids(move, t).filter((x) => x.shape.k !== 'mote');
  return JSON.stringify(sol, (k, v) => (k === 'skin' || k === 'ramp' ? undefined : typeof v === 'number' ? Math.round(v * 1e6) : v));
}
/** The largest move of any solid's middle from one thirtieth of a second to the next (by part and piece and order). */
function biggestStep(move: string, long: number, which: (x: Solid) => boolean): { d: number; piece: string; t: number } {
  let best = { d: 0, piece: '', t: 0 };
  const n = Math.round(long * 30);
  const keyed = (sol: Solid[]): Map<string, Solid> => {
    const seen = new Map<string, number>();
    const m = new Map<string, Solid>();
    for (const x of sol) {
      const id = `${x.part}/${x.piece}`;
      const k = seen.get(id) ?? 0;
      seen.set(id, k + 1);
      m.set(`${id}#${k}`, x);
    }
    return m;
  };
  for (let i = 0; i < n; i++) {
    const a = keyed(solids(move, i / 30));
    for (const [key, x] of keyed(solids(move, (i + 1) / 30))) {
      const before = a.get(key);
      if (!before || !which(x) || x.shape.k === 'mote' || x.shape.k === 'glow') continue;
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

// (ACT 2, THE HUSH, IN THE GAME behind ACT2 (game/act1.ts, off): no longer a mock-up nothing imports. The game holds their
// pictures through art/act1_figs/rat.ts alone, and their switch is one the bestiary throws with the acts' figures, as the
// descent's are, art/bestiary.ts useAct1Figs.)
test('in the game through art/act1_figs/rat.ts alone, its switch thrown with the acts\' figures', () => {
  assert.ok(FIG_RAT !== null && (FIG_RAT.switches ?? []).includes(RATS_ON), 'its switch is one the bestiary throws');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f === 'art/rats.ts' || f === 'art/act1_figs/rat.ts') continue;
    if (/from ['"][^'"]*\/rats['"]/.test(fs.readFileSync(`src/${f}`, 'utf8'))) users.push(f);
  }
  assert.equal(users.join(' '), '', 'other game files that import it');
});

test('crisp: every pixel all there or not at all (but the pink edge); its pink edge round it while it lives', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  for (const f of frames) {
    const { px } = f.painted();
    let soft = 0;
    let rim = 0;
    let body = 0;
    for (let i = 0; i < px.d.length; i += 4) {
      const a = px.d[i + 3];
      if (a === 255) body++;
      if (a === 0 || a === 255) continue;
      if (a === RIM_ALPHA && px.d[i] === pr && px.d[i + 1] === pg && px.d[i + 2] === pb) rim++;
      else soft++;
    }
    assert.ok(soft === 0, `${f.name}: ${soft} soft pixels`);
    if (f.alive) assert.ok(body > 150 && rim > 40, `${f.name}: its pink edge, ${rim} pixels round ${body}`);
    if (!f.alive) assert.ok(rim === 0, `${f.name}: a pink edge on it dead`);
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
    if (f.alive) assert.ok(eyes > 0 || lights.length > 0, `${f.name}: its eyes`);
    for (const L of lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${f.name}: its light ${L.color}`);
    let cut = 0;
    for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    assert.ok(cut === 0, `${f.name}: ${cut} pixels on its canvas's edge`);
  }
});

test('its size: small, a third of the knight\'s height (he is 58 tall); about a tile long, nose to rump', () => {
  let top = 0;
  let front = -Infinity;
  let back = Infinity;
  for (const b of solids('stand', 0)) {
    top = Math.max(top, topOf(b.shape));
    if (b.part.startsWith('tail')) continue;
    const c = centreOf(b.shape);
    front = Math.max(front, c[0]);
    back = Math.min(back, c[0]);
  }
  assert.ok(top > 14 && top < 24, `its top ${top.toFixed(1)} up`);
  assert.ok(front - back > 0.6 * TILE3 && front - back < 1.2 * TILE3, `nose to rump ${((front - back) / TILE3).toFixed(2)} tiles`);
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
            what = `${x.part}/${x.piece} at ${(i / 30).toFixed(2)}`;
          }
        }
      }
      assert.ok(low >= -0.5, `${move} ${view}: its lowest point is ${low.toFixed(2)}, under the floor (${what})`);
    }
  }
});

test('SLIDE: a foot that is down stays where it came down, in every move; scurrying, the floor goes by under it at its pace', () => {
  const dt = 1 / 600;
  const feetAt = (move: string, t: number): number[][] => ratPose(move, t).feet as unknown as number[][];
  const V = RAT_PACE * TILE3;
  let down = 0;
  for (let t = 0; t < RAT_WALK.period * 2; t += dt) {
    const a = feetAt('walk', t);
    const b = feetAt('walk', t + dt);
    a.forEach((p, i) => {
      const q = b[i];
      if (p[2] < 1e-6 && q[2] < 1e-6) {
        down++;
        assert.ok(Math.abs(q[0] - p[0] + V * dt) < 1e-6 && Math.abs(q[1] - p[1]) < 1e-9, `scurrying: foot ${i} slips at ${t.toFixed(4)} s`);
      }
    });
  }
  assert.ok(down > 100, 'its feet down scurrying');
  for (const move of ['stand', 'attack', 'reel', 'look', 'dying']) {
    for (let t = 0; t + dt < ratLong(move); t += dt) {
      const a = feetAt(move, t);
      const b = feetAt(move, t + dt);
      a.forEach((p, i) => {
        const q = b[i];
        if (p[2] < 1e-6 && q[2] < 1e-6) assert.ok(Math.abs(q[0] - p[0]) + Math.abs(q[1] - p[1]) < 1e-6, `${move}: foot ${i} slides at ${t.toFixed(4)} s`);
      });
    }
  }
});

test('JERK: nothing leaps from one frame to the next in any move; its stand and scurry close their loops', () => {
  // (how far a solid's middle may move in a thirtieth of a second, by move: its feet and legs; the rest of it. Its
  // scurry patters fast; its leap is a leap, as fast as the King's rats' surge (tests/rat_king.test.ts, 14); flipping over
  // dead, it is thrown over)
  const limit: Record<string, [number, number]> = { stand: [1.5, 2.8], walk: [12.5, 5], attack: [14, 14], reel: [5, 6.3], look: [9, 7], dying: [14, 12.5] };
  const leg = (x: Solid): boolean => /^(foreleg|hindleg|paw)$/.test(x.piece);
  for (const [move, long] of LONG) {
    const [lg, rs] = limit[move];
    const a = biggestStep(move, long, leg);
    const c = biggestStep(move, long, (x) => !leg(x));
    assert.ok(a.d <= lg, `${move}: its ${a.piece} moves ${a.d.toFixed(1)} in a thirtieth, at ${a.t.toFixed(3)} s`);
    assert.ok(c.d <= rs, `${move}: its ${c.piece} moves ${c.d.toFixed(1)} in a thirtieth, at ${c.t.toFixed(3)} s`);
  }
  assert.equal(geom('stand', 0), geom('stand', RAT_STAND.period), 'its stand\'s last moment is not its first');
  assert.equal(geom('walk', 0), geom('walk', RAT_WALK.period), 'its scurry\'s last moment is not its first');
});

/** Where the eye goes on it (its head and rump), on the picture. */
function pointsOf(move: string, t: number, view: 'front' | 'back'): number[][] {
  const st = stage(view, 0, 0, { w: 2, h: 2 });
  return solids(move, t, view).filter((x) => /^(head|rump)$/.test(x.piece)).map((x) => st.at(x.shape.c) as unknown as number[]);
}
const leap = (a: number[][], b: number[][]): number => (a.length === b.length ? a.reduce((s, p, i) => s + Math.hypot(p[0] - b[i][0], p[1] - b[i][1]), 0) / a.length / 2 : Infinity);

test('JUMP: where one move hands over to the next (its stand, from whatever frame it has come to, into each move and back), the picture does not leap (the review\'s 3 game pixels)', () => {
  for (const view of ['front', 'back'] as const) {
    const stands = Array.from({ length: RAT_STAND.frames }, (_, i) => pointsOf('stand', i / RAT_STAND.fps, view));
    const rest = pointsOf('stand', 0, view);
    for (const move of MOVES) {
      if (move === 'stand') continue;
      const first = pointsOf(move, 0, view);
      for (let i = 0; i < stands.length; i++) assert.ok(leap(stands[i], first) <= 3, `${view}: its stand at ${(i / RAT_STAND.fps).toFixed(2)} s into its ${move} leaps ${leap(stands[i], first).toFixed(2)}`);
      if (move !== 'dying' && move !== 'walk') assert.ok(leap(pointsOf(move, ratLong(move), view), rest) <= 3, `${view}: its ${move}'s end back to its stand leaps ${leap(pointsOf(move, ratLong(move), view), rest).toFixed(2)}`);
    }
    for (let i = 0; i < RAT_WALK.frames; i++) assert.ok(leap(pointsOf('walk', i / RAT_WALK.fps, view), rest) <= 3, `${view}: its scurry at ${(i / RAT_WALK.fps).toFixed(3)} s back to its stand leaps`);
  }
});

test('ALIVE: never still from one frame to the next', () => {
  for (let i = 0; i < RAT_STAND.frames; i++) assert.notEqual(geom('stand', i / RAT_STAND.fps), geom('stand', (i + 1) / RAT_STAND.fps), `frames ${i} and ${i + 1} are the same`);
});

test('THE LEAP AND BITE: crouched, its rump wiggling, its mouth wide (the warning); off the floor and stretched out; it snaps, held a tenth; back where it was', () => {
  const B = RAT_BITE;
  const P = (t: number): any => ratPose('attack', t);
  // (the warning: crouched lower than it stands, its body swinging side to side, its jaws wide)
  assert.ok(P(B.warn[0] + 0.05).c[2] < P(0).c[2] - 0.2, 'crouched');
  let most = 0;
  for (let t = B.warn[0] + 0.03; t < B.spring; t += 1 / 30) most = Math.max(most, Math.abs(P(t).f[1]));
  assert.ok(most > 0.1, `its rump wiggling ${most.toFixed(2)}`);
  assert.ok(P(B.warn[0] + 0.05).gape > 0.8, 'its jaws wide');
  // (the leap: every foot off the floor, its forepaws out ahead and hind legs back, its body high)
  const mid = (B.spring + B.hit) / 2;
  const air = P(mid);
  assert.ok(air.feet.every((p: readonly number[]) => p[2] > 1), 'all four feet off the floor');
  assert.ok(air.feet[0][0] - air.feet[2][0] > P(0).feet[0][0] - P(0).feet[2][0] + 6, 'stretched out');
  assert.ok(air.c[2] > P(0).c[2] + 8, `off the floor ${(air.c[2] - P(0).c[2]).toFixed(1)}`);
  // (the snap: landed, its reach on, its jaws shut, held a tenth)
  assert.ok(P(B.hit).c[0] > P(0).c[0] + B.reach - 1 && P(B.hit).gape < 0.2, 'landed on, its jaws shut');
  const held = geom('attack', B.hit);
  for (const t of [B.hit + 0.03, B.hit + B.freeze - 0.005]) assert.equal(geom('attack', t), held, `the bite moves in its freeze at ${t.toFixed(3)} s`);
  assert.ok(Math.abs(P(B.long).c[0] - P(0).c[0]) < 0.01, 'back where it was');
});

test('LOOKING ROUND: up on its hind legs, its forepaws off the floor, and down again', () => {
  const up = ratPose('look', RAT_LOOK.long / 2);
  assert.ok(up.f[2] > 0.75, `up on its hind legs (its body ${Math.round((Math.asin(up.f[2]) * 180) / Math.PI)} degrees up)`);
  assert.ok(up.feet[0][2] > 6 && up.feet[1][2] > 6, 'its forepaws drawn up');
  assert.ok(ratPose('look', RAT_LOOK.long).f[2] < 0, 'down again');
});

test('ITS DEATH: flipped onto its back, its legs up; the voice going out of it, pink going pale; still', () => {
  const Dd = RAT_DIE;
  const end = ratPose('dying', Dd.long);
  assert.ok(end.u[2] < -0.8, 'on its back');
  assert.ok(end.feet.every((p: readonly number[]) => p[2] > end.c[2]), 'its legs up');
  assert.ok(end.eyes === 0, 'its eyes out');
  let pink = 0;
  let pale = 0;
  let most = 0;
  for (let t = Dd.voice[0]; t < Dd.voice[1]; t += 0.02) {
    const g = ratGrains('dying', t);
    most = Math.max(most, g.length);
    for (const [, c] of g) {
      const [r, gg, b] = rgba(c);
      if (FIRE.has(`${r},${gg},${b}`)) pink++;
      else if (hue(r, gg, b)[1] < 0.25 && r > 150) pale++;
    }
  }
  assert.ok(most > 10, `the voice going out: ${most} at most`);
  assert.ok(pink > 20 && pale > 20, `pink (${pink}) going pale (${pale})`);
  const still = geom('dying', Dd.still);
  for (const t of [Dd.still + 0.1, Dd.long]) assert.equal(geom('dying', t), still, `something moves at ${t} s`);
});

test('its pictures as the game holds them: standing fifteen a second, scurrying twenty-four; its bite, struck, looking round and its death at thirty', () => {
  const art = makeRatArt() as any;
  for (const f of [art.front, art.back]) {
    assert.equal(f.idle.length, RAT_STAND.frames);
    assert.equal(f.walk.length, RAT_WALK.frames);
    assert.equal(f.idleFps, RAT_STAND.fps);
    assert.equal(f.walkFps, RAT_WALK.fps);
    assert.equal(f.attack.length, 3);
    assert.equal(f.clips.attack.hit, RAT_BITE.hit);
    assert.equal(f.clips.attack.frames.length, Math.round(RAT_BITE.long * 30) + 1);
    assert.equal(f.clips.die.frames.length, Math.round(RAT_DIE.long * 30) + 1);
    assert.equal(f.clips.moves.look.frames.length, Math.round(RAT_LOOK.long * 30) + 1);
  }
});
