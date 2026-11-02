// Pictures of THE CRIER'S MOVES DONE THE ACTION WAY, put together for the owner (the sheet, the film's frames): his trumpet swing,
// the shout off the walls, the scroll down a lane and his call of the crowd (art/crier_action.ts, CRIER_ACTION; what he sends out,
// art/crier_action_fx.ts), in a stand-in for the Crier's Square (setts of the city's grey-violet stone, a square 16 tiles each way
// walled by the houses of the Gate Ward, lanes running out of it between them), with the knight for size and the Hushed townsfolk
// (the game's own, art/hushed_moves.ts), each figure at its floor point and sorted by it, as the game sorts them. Made outside a
// browser (tools/crier_action_film.ts, tools/crier_action_sheet.ts). Nothing of the game imports it. THE SQUARE IS A STAND-IN: the
// game's own Crier's Square is the game's (art/gateward.ts).

import { Px } from '../engine/px';
import type { ActorArt } from '../art/actor_types';
import { CROWD_HIT, CROWD_LONG, PROCLAIM_HIT, PROCLAIM_LONG, SHOUT_HIT, SHOUT_LONG, SWING_LONG, makeCrierActionArt } from '../art/crier_action';
import { CALL, DECREE, comesOut, paintCall, paintDecree, paintShout, paintSwing, place, wallsOf } from '../art/crier_action_fx';
import type { At, Keep, Square } from '../art/crier_action_fx';
import { CRIER_MOB } from '../art/crier_moves';
import { HUSHED_BAKER, HUSHED_GOODWIFE, HUSHED_PORTER, makeHushedArt3 } from '../art/hushed_moves';
import { makeHeroArt3 } from '../art/heroes3';
import { hash } from '../art/kit';
import { onFloor } from './action_f1_scene';
import type { Stood } from './action_f1_scene';
import { frameAt } from './action_f3_scene';
import { frameOf, lay, shadow } from './king_scene';
import type { Laid } from './king_scene';

export type View = 'front' | 'back';
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (u: number): number => {
  const k = clamp01(u);
  return k * k * (3 - 2 * k);
};
/** How long he stands before each move begins (seconds). */
export const LEAD = 0.4;
/** THE SQUARE: 16 tiles each way, its middle the scene's. */
export const SQ: Square = { x0: -8, x1: 8, y0: -8, y1: 8 };
/** The mouths of the lanes out of it (where a lane runs out between the houses): which wall, and where along it (tiles). */
const MOUTHS: ReadonlyArray<{ wall: 'x0' | 'y0' | 'x1' | 'y1'; at: number; half: number }> = [
  { wall: 'x0', at: -2.5, half: 1.1 },
  { wall: 'y0', at: 2.5, half: 1.1 },
  { wall: 'x1', at: 3.5, half: 1.1 },
  { wall: 'y1', at: -3.5, half: 1.1 },
];
/** Where the Hush wells up as he calls the crowd: in the lanes' mouths and the doorways of the houses round the square. */
export const SPOTS: ReadonlyArray<readonly [number, number]> = [[-7.3, -2.5], [2.5, -7.3], [7.3, 3.5], [-3.5, 7.3], [-7.3, 4.6], [-4.8, -7.3], [5.6, -7.3], [7.3, -4.4]];

// ---------------------------------------------------------------------------------------------
// THE SQUARE (a stand-in)

const SETT = ['#2a2532', '#363040', '#4f4652', '#6b5f63', '#887a75'];
const WALL = ['#1b1622', '#2a2230', '#3a3040', '#4a3e4e', '#5a4c5a'];
const ROOF = ['#140f18', '#1e1622', '#2a1e2c'];
const DARK = '#08070c';
const mouthAt = (wall: string, along: number): boolean => MOUTHS.some((m) => m.wall === wall && Math.abs(along - m.at) < m.half);
/** THE SQUARE'S FLOOR AND ITS WALLS: setts inside, the lanes' setts running out of the mouths; the houses' fronts along its two far sides, their copings along its near two (cut away, so that the square is seen), `k` scene pixels to a picture pixel. */
export function squareFloor(w: number, h: number, cx: number, cy: number, k = 1): Px {
  const px = new Px(w, h);
  for (let Y = 0; Y < h; Y++) {
    for (let X = 0; X < w; X++) {
      const a = (X + 0.5 - cx) / (32 * k);
      const b = (Y + 0.5 - cy) / (16 * k);
      const x = (a + b) / 2;
      const y = (b - a) / 2;
      const inside = x >= SQ.x0 && x <= SQ.x1 && y >= SQ.y0 && y <= SQ.y1;
      const lane = (x < SQ.x0 && mouthAt('x0', y)) || (y < SQ.y0 && mouthAt('y0', x)) || (x > SQ.x1 && mouthAt('x1', y)) || (y > SQ.y1 && mouthAt('y1', x));
      if (!inside && !lane) {
        px.set(X, Y, hash(X >> 2, Y >> 2, 7201) > 0.9 ? ROOF[1] : DARK);
        continue;
      }
      const X2 = x + 40;
      const Y2 = y + 40;
      const row = Math.floor(Y2 * 3);
      const col = Math.floor(X2 * 2.4 + (row % 2) * 0.5);
      const fy = Y2 * 3 - row;
      const fx = X2 * 2.4 + (row % 2) * 0.5 - col;
      const joint = fy < 0.09 || fx < 0.06;
      const tone = hash(col, row, 7203);
      let c = joint ? SETT[0] : tone > 0.8 ? SETT[3] : tone > 0.35 ? SETT[2] : SETT[1];
      if (!joint && fy > 0.75 && fx > 0.3 && tone > 0.5) c = SETT[3];
      // (darker out in the lanes, and in toward the walls' feet)
      const out = Math.max(SQ.x0 - x, x - SQ.x1, SQ.y0 - y, y - SQ.y1, 0);
      if (out > 0.4 || (inside && Math.min(x - SQ.x0, y - SQ.y0) < 0.35)) c = joint ? DARK : SETT[Math.max(0, SETT.indexOf(c) - 1)];
      if (out > 2.5) c = DARK;
      px.set(X, Y, c);
    }
  }
  // THE HOUSES' FRONTS along the two far sides: plastered stone, a dark door here and there, shuttered windows, the eaves; the
  // lanes' mouths open between them
  const face = (x0: number, y0: number, x1: number, y1: number, wall: 'x0' | 'y0', tall: number): void => {
    const L = Math.hypot(x1 - x0, y1 - y0);
    for (let d = 0; d <= L; d += 1 / (40 * k)) {
      const u = d / L;
      const x = x0 + (x1 - x0) * u;
      const y = y0 + (y1 - y0) * u;
      const along = wall === 'x0' ? y : x;
      if (mouthAt(wall, along)) continue;
      const [X, Y] = onFloor(x, y, cx, cy, k);
      const house = Math.floor((along + 40) / 3.2);
      const fx = ((along + 40) / 3.2) % 1;
      const H = tall * k * (0.85 + 0.3 * hash(house, 1, 7205));
      for (let z = 0; z < H; z++) {
        const zz = z / (k * 16);
        let c = WALL[1 + Math.floor(hash(house, 2, 7205) * 2)];
        if (fx < 0.03) c = WALL[0];
        if (z < 3 * k) c = WALL[0];
        // (a door: dark, arched)
        const door = Math.abs(fx - 0.5) < 0.13 && zz < 2.2 && hash(house, 3, 7205) > 0.45;
        if (door) c = Math.abs(fx - 0.5) > 0.11 || zz > 2.0 ? WALL[3] : DARK;
        // (windows up the front, shuttered, dull)
        const win = zz > 2.6 && zz < 3.6 && (Math.abs(fx - 0.25) < 0.07 || Math.abs(fx - 0.75) < 0.07);
        if (win) c = hash(house, Math.round(fx * 4), 7207) > 0.7 ? '#4a3a2a' : ROOF[0];
        if (z > H - 4 * k) c = ROOF[2];
        // (lit from the upper left: the far-left front a step lighter)
        if (wall === 'x0' && !door && !win && z < H - 4 * k && fx > 0.03) c = WALL[Math.min(4, WALL.indexOf(c) + 1)] ?? c;
        const py = Math.round(Y - z);
        if (py >= 0 && py < h && X >= 0 && X < w) px.set(Math.round(X), py, c);
      }
    }
  };
  face(SQ.x0, SQ.y1, SQ.x0, SQ.y0, 'x0', 64);
  face(SQ.x0, SQ.y0, SQ.x1, SQ.y0, 'y0', 64);
  // THE COPINGS along the near two sides (the houses cut away)
  const coping = (x0: number, y0: number, x1: number, y1: number, wall: 'x1' | 'y1'): void => {
    const L = Math.hypot(x1 - x0, y1 - y0);
    for (let d = 0; d <= L; d += 1 / (40 * k)) {
      const u = d / L;
      const x = x0 + (x1 - x0) * u;
      const y = y0 + (y1 - y0) * u;
      if (mouthAt(wall, wall === 'x1' ? y : x)) continue;
      const [X, Y] = onFloor(x, y, cx, cy, k);
      for (let z = 0; z < 7 * k; z++) {
        const py = Math.round(Y - z);
        if (py >= 0 && py < h && X >= 0 && X < w) px.set(Math.round(X), py, z < 2 * k ? WALL[0] : z > 5 * k ? WALL[4] : WALL[2]);
      }
    }
  };
  coping(SQ.x1, SQ.y0, SQ.x1, SQ.y1, 'x1');
  coping(SQ.x0, SQ.y1, SQ.x1, SQ.y1, 'y1');
  return px;
}

// ---------------------------------------------------------------------------------------------
// THE FIGURES

let ART: { crier: ActorArt; knight: ActorArt; hushed: ActorArt[] } | null = null;
export function figures(): NonNullable<typeof ART> {
  ART ??= { crier: makeCrierActionArt(), knight: makeHeroArt3().of('warrior', { twoHanded: false }) as unknown as ActorArt, hushed: [HUSHED_PORTER, HUSHED_GOODWIFE, HUSHED_BAKER].map((m) => makeHushedArt3(m)) };
  return ART;
}
/** The game's own Crier, as he is (his old cone beside the new shout). */
export function oldFrame(move: string, t: number, view: View): Laid {
  return frameOf(CRIER_MOB, move, t, view);
}
/** The way he faces on the floor seen `view` (radians on the floor's own axes): from in front, down the picture (+x); from behind, up it (-y). */
export const aimOf = (view: View): number => (view === 'front' ? 0 : -Math.PI / 2);
const atOf = (cx: number, cy: number): At => (x, y, z = 0) => {
  const [X, Y] = onFloor(x, y, cx, cy, 1);
  return [X, Y - z];
};
/** A figure at floor point P facing the floor way (dx, dy): its view and whether it is flipped (as the game shows them). */
function facingOf(dx: number, dy: number): { v: View; flip: boolean } {
  const sx = dx - dy;
  const sy = dx + dy;
  return { v: sy > 0 ? 'front' : 'back', flip: sx < 0 };
}
/** The knight at K, looking toward T: standing, running (toward `T` the way he runs), struck. */
function knightAt(K: readonly [number, number], T: readonly [number, number], t: number, cx: number, cy: number, act: 'stand' | 'walk' | { reel: number } = 'stand'): Stood {
  const { knight } = figures();
  const { v, flip } = facingOf(T[0] - K[0], T[1] - K[1]);
  const l = typeof act === 'object' ? frameAt(knight, v, 'reel', act.reel) : frameAt(knight, v, act, t);
  return { at: onFloor(K[0], K[1], cx, cy, 1), l, flip, shadow: 9 };
}
/** Him at B, a frame of `move` (`m` seconds in: before it, his stand; after it, his stand again). */
function himAt(B: readonly [number, number], view: View, move: string, m: number, long: number, cx: number, cy: number): Stood {
  const { crier } = figures();
  const l = m < 0 ? frameAt(crier, view, 'stand', m + 10) : m < long ? frameAt(crier, view, move, m) : frameAt(crier, view, 'stand', m - long);
  return { at: onFloor(B[0], B[1], cx, cy, 1), l, flip: false, shadow: 14 };
}
/** LAY A SCENE: the floor and what lies on it; the figures' shadows; then the figures from the top of the picture down, what stands up off the floor laid in among them by its own floor point. */
function scene(base: Px, floor: (p: Px) => void, figs: Stood[], air: (p: Px, keep: Keep) => void = () => {}, shake: readonly [number, number] = [0, 0]): Px {
  const p = new Px(base.w, base.h);
  p.d.set(base.d);
  floor(p);
  for (const s of figs) if (s.shadow) shadow(p, s.at[0], s.at[1], s.shadow, 1);
  const sorted = [...figs].sort((a, b) => a.at[1] - b.at[1]);
  let from = -Infinity;
  for (const s of sorted) {
    const y0 = from;
    air(p, (y) => y >= y0 && y < s.at[1]);
    lay(p, s.l, s.at[0], s.at[1], 1, (s as Stood & { clip?: (X: number, Y: number) => boolean }).clip, s.flip);
    from = s.at[1];
  }
  const y1 = from;
  air(p, (y) => y >= y1);
  return shaken(p, shake);
}
/** The floor shaking at `m` seconds (the game's shake as a blow lands): a few pixels, dying away. */
export function shakeOf(m: number, hits: ReadonlyArray<readonly [number, number]>): [number, number] {
  let a = 0;
  for (const [at, amount] of hits) {
    const s = m - at;
    if (s >= 0 && s < 0.35) a = Math.max(a, amount * (1 - s / 0.35));
  }
  const fr = Math.floor(m * 30);
  return [Math.round((hash(fr, 1, 7211) - 0.5) * 2 * a), Math.round((hash(fr, 2, 7211) - 0.5) * 2 * a)];
}
function shaken(p: Px, d: readonly [number, number]): Px {
  if (!d[0] && !d[1]) return p;
  const out = new Px(p.w, p.h);
  for (let y = 0; y < p.h; y++) {
    const sy = Math.min(p.h - 1, Math.max(0, y - d[1]));
    for (let x = 0; x < p.w; x++) {
      const sx = Math.min(p.w - 1, Math.max(0, x - d[0]));
      const i = (sy * p.w + sx) * 4;
      out.d.set(p.d.subarray(i, i + 4), (y * p.w + x) * 4);
    }
  }
  return out;
}
/** A path of floor points (tiles) walked from moment to moment: where on it at `m`, and whether moving. */
function along(path: ReadonlyArray<readonly [number, number, number]>, m: number): { at: [number, number]; moving: boolean; to: [number, number] } {
  if (m <= path[0][0]) return { at: [path[0][1], path[0][2]], moving: false, to: [path[1][1], path[1][2]] };
  for (let i = 1; i < path.length; i++) {
    const [t1, x1, y1] = path[i];
    const [t0, x0, y0] = path[i - 1];
    if (m <= t1) {
      const u = smooth((m - t0) / Math.max(1e-6, t1 - t0));
      const moving = (x1 !== x0 || y1 !== y0) && u > 0.02 && u < 0.98;
      return { at: [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u], moving, to: [x1, y1] };
    }
  }
  const last = path[path.length - 1];
  return { at: [last[1], last[2]], moving: false, to: [last[1], last[2]] };
}

// ---------------------------------------------------------------------------------------------
// THE SWING: the knight 3.6 tiles before him; he steps back out of the sweeps, and back out of the finisher's ring

export function swingScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const m = t - LEAD;
  const B: [number, number] = [0, 0];
  const aim = aimOf(view);
  const at = atOf(cx, cy);
  const side = view === 'front' ? -0.5 : -1.2;
  const path: [number, number, number][] = [[0, 3.4, side], [0.35, 3.4, side], [0.62, 3.9, side], [1.5, 3.9, side], [1.62, 3.9, side], [2.2, 3.9, side], [2.75, 5.8, side - 0.4]];
  const k = along(path, m);
  const K = place(B, aim, k.at[0], k.at[1]);
  const figs = [himAt(B, view, 'attack', m, SWING_LONG, cx, cy), knightAt(K, k.moving ? place(B, aim, k.to[0] + 1, k.to[1]) : B, t, cx, cy, k.moving ? 'walk' : 'stand')];
  return scene(base, (p) => paintSwing(p, at, m, B, aim), figs, () => {}, shakeOf(m, [[0.667, 2], [1.667, 2], [2.867, 5]]));
}
export const SWING_PASS = LEAD + SWING_LONG - 0.1;

// ---------------------------------------------------------------------------------------------
// THE SHOUT OFF THE WALLS: him 3 tiles behind the square's middle, facing its far wall; the knight before him runs round him to the
// one spot behind him as the floor is marked, and the shout, its echoes, go over and round him

/** Where he stands for the shout, seen `view` (tiles: in the square), and the knight's way round to the one spot. */
export function shoutPlaces(view: View): { B: [number, number]; path: [number, number, number][] } {
  const aim = aimOf(view);
  const B: [number, number] = view === 'front' ? [-3, 0] : [0, 3];
  const P = (m: number, fwd: number, left: number): [number, number, number] => {
    const q = place(B, aim, fwd, left);
    return [m, q[0], q[1]];
  };
  return { B, path: [P(0, 4.2, -0.6), P(0.55, 4.2, -0.6), P(1.15, 1.2, -2.4), P(1.75, -2.2, -2.1), P(2.3, -3.3, -0.2)] };
}
export function shoutScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const m = t - LEAD;
  const aim = aimOf(view);
  const at = atOf(cx, cy);
  const { B, path } = shoutPlaces(view);
  const k = along(path, m);
  const figs = [himAt(B, view, 'shout', m, SHOUT_LONG, cx, cy), knightAt(k.at, k.moving ? k.to : B, t, cx, cy, k.moving ? 'walk' : 'stand')];
  return scene(base, (p) => paintShout(p, at, m, B, aim, SQ), figs, () => {}, shakeOf(m, [[SHOUT_HIT, 3]]));
}
export const SHOUT_PASS = LEAD + SHOUT_LONG + 0.1;
/** OVER THE WHOLE SQUARE FROM ABOVE: him from behind; the knight finding the one spot. */
export const shoutArena = (t: number, base: Px, cx: number, cy: number): Px => shoutScene('back', t, base, cx, cy);
export const SHOUT_ARENA_PASS = LEAD + SHOUT_HIT + 1.6;

// ---------------------------------------------------------------------------------------------
// THE SCROLL DOWN A LANE: the knight in the lane steps out of it while it is held; it burns on beside him

export function decreePlaces(view: View): { B: [number, number]; to: number } {
  const B: [number, number] = view === 'front' ? [-5, 0] : [0, 5];
  return { B, to: wallsOf(SQ, B, aimOf(view)).far - 0.3 };
}
export function decreeScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const m = t - LEAD;
  const aim = aimOf(view);
  const at = atOf(cx, cy);
  const { B, to } = decreePlaces(view);
  const path: [number, number, number][] = [[0, 4.8, 0.3], [0.75, 4.8, 0.3], [1.25, 5.0, -3.3], [3.0, 5.0, -3.3], [3.8, 7.0, -3.5]];
  const k = along(path, m);
  const K = place(B, aim, k.at[0], k.at[1]);
  const T = k.moving ? place(B, aim, k.to[0], k.to[1]) : B;
  const figs = [himAt(B, view, 'proclaim', m, PROCLAIM_LONG, cx, cy), knightAt(K, T, t, cx, cy, k.moving ? 'walk' : 'stand')];
  return scene(base, (p) => paintDecree(p, at, m, B, aim, to, [0.9, 70], 'floor'), figs, (p, keep) => paintDecree(p, at, m, B, aim, to, [0.9, 70], 'air', keep), shakeOf(m, [[PROCLAIM_HIT + DECREE.lands, 3]]));
}
export const DECREE_PASS = LEAD + PROCLAIM_HIT + 2.2;
export const decreeArena = (t: number, base: Px, cx: number, cy: number): Px => decreeScene('back', t, base, cx, cy);
export const DECREE_ARENA_PASS = LEAD + PROCLAIM_HIT + 3.4;

// ---------------------------------------------------------------------------------------------
// HE CALLS THE CROWD: the Hush wells up in the lanes' mouths and doorways round the square; the Hushed pour in, at the knight

export function crowdScene(view: View, t: number, base: Px, cx: number, cy: number, B: readonly [number, number] = [0, 0], K0?: readonly [number, number]): Px {
  const m = t - LEAD;
  const { hushed } = figures();
  const at = atOf(cx, cy);
  const K = K0 ?? place(B, aimOf(view), 3.6, -0.8);
  const figs: Stood[] = [himAt(B, view, 'crowd', m, CROWD_LONG, cx, cy), knightAt(K, B, t, cx, cy)];
  const s = m - CROWD_HIT;
  SPOTS.forEach((S, i) => {
    for (let j = 0; j < CALL.each; j++) {
      const since = s - comesOut(i, j);
      if (since < 0) continue;
      const rise = clamp01(since / CALL.out);
      // (up out of the pool, then shuffling in at the knight, each a little off the others' line)
      const go = Math.max(0, since - CALL.out);
      const off = (j - 0.5) * 0.9 + (hash(i, j, 7221) - 0.5) * 0.5;
      const dx = K[0] - S[0];
      const dy = K[1] - S[1];
      const d = Math.hypot(dx, dy) || 1;
      const walked = Math.min(d - 1.2, go * 1.1);
      const P: [number, number] = [S[0] + (dx / d) * walked - (dy / d) * off * clamp01(go), S[1] + (dy / d) * walked + (dx / d) * off * clamp01(go)];
      const { v, flip } = facingOf(dx, dy);
      const art = hushed[(i + j) % hushed.length];
      const l = go > 0 && walked < d - 1.25 ? frameAt(art, v, 'walk', go + i * 0.3) : frameAt(art, v, 'stand', since + i);
      const [X, Y] = onFloor(P[0], P[1], cx, cy, 1);
      const sink = Math.round((1 - smooth(rise)) * 62);
      figs.push({ at: [X, Y], l: { ...l, ay: l.ay - sink }, flip, shadow: rise > 0.6 ? 7 : 0, clip: (_x: number, py: number) => py <= Y } as Stood);
    }
  });
  return scene(base, (p) => paintCall(p, at, m, B, SPOTS, (x, y) => x >= SQ.x0 && x <= SQ.x1 && y >= SQ.y0 && y <= SQ.y1), figs, () => {}, shakeOf(m, [[CROWD_HIT, 2]]));
}
export const CROWD_PASS = LEAD + CROWD_LONG + 0.2;
export const crowdArena = (t: number, base: Px, cx: number, cy: number): Px => crowdScene('back', t, base, cx, cy, [0, 2.2], [0.8, -1.6]);
export const CROWD_ARENA_PASS = LEAD + CROWD_HIT + 2.6;
