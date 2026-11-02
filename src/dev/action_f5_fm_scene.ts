// Pictures of THE FLESHMANCER'S MOVES DONE THE ACTION WAY, put together for the owner (the sheet, the film's frames): his shards, his
// rings of hands, his fire sweep, raising the dead, his teleport (art/fleshmancer_action.ts, FLESH_ACTION; what he sends out,
// art/fleshmancer_action_fx.ts), and the mini fleshmancer's fire, in his lair (floor 1's stand-in floor of old stone flags, an arena
// about 17 by 20 tiles: dev/action_f1_scene.ts; his bone heaps, the game's skeleton's own bones), with the knight for size, each
// figure at its floor point and sorted by it, as the game sorts them; what stands up off the floor laid in among them by its own.
// Made outside a browser (tools/action_f5_fm_film.ts, tools/action_f5_fm_sheet.ts). Nothing of the game imports it.

import { Px } from '../engine/px';
import type { ActorArt } from '../art/actor_types';
import {
  FIRE_HIT, FIRE_LONG, FIRE_STOP, MINI_HIT, MINI_LONG, RAISE_HIT, RAISE_HOLD, RAISE_LONG, RING_HITS, RING_LONG, RISE_HIT, RISE_LONG, SHARD_DRAW, SHARD_HITS, SHARD_LONG, SINK_HIT, SINK_LONG,
  fleshmancerActionMob, fireWay as fireWayAt, makeFleshmancerActionArt, makeMiniActionArt, miniActionMob, miniHands,
} from '../art/fleshmancer_action';
import { FIRE, PIT, RINGS, RISE_MARK, SHARDS, paintFire, paintHeap, paintRingCracks, paintRiseMark, paintShards, paintSinkPit, raiseBurst, ringBurst, ringHands, shardAngles } from '../art/fleshmancer_action_fx';
import type { At, Keep } from '../art/fleshmancer_action_fx';
import { FLESHMANCER, FM_HAND_FPS, FM_HAND_FRAMES, FM_HAND_KINDS, makeRingHandArt, staffOf } from '../art/fleshmancer';
import { DIE3_TIME, STAND3, deathOf3, paintSkeleton3 } from '../art/monster_bones3';
import { CANVAS3 } from '../art/skin';
import { makeHeroArt3 } from '../art/heroes3';
import { hash } from '../art/kit';
import { paintViewOf, skeletonAt } from '../art/new_mobs3';
import { project } from '../art/skeleton';
import type { Sprite } from '../engine/px';
import { laid, onFloor } from './action_f1_scene';
import type { Stood } from './action_f1_scene';
import { frameAt } from './action_f3_scene';
import { frameOf, lay, shadow, spriteLaid } from './king_scene';
import type { Laid } from './king_scene';

export type View = 'front' | 'back';
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (u: number): number => {
  const k = clamp01(u);
  return k * k * (3 - 2 * k);
};
const f = (n: number): number => n / 30;
/** How long he stands before each move begins (seconds). */
export const LEAD = 0.4;

// ---------------------------------------------------------------------------------------------
// The figures

let FM: ActorArt | null = null;
let MINI: ActorArt | null = null;
let HERO: ActorArt | null = null;
let OLD: ActorArt | null = null;
const HANDS: Partial<Record<View, Sprite[][]>> = {};
/** Him as the game would hold him with FLESH_ACTION on; the mini fleshmancer the same; the knight; the hands of his rings (the game's own). */
export function figures(): { fm: ActorArt; mini: ActorArt; knight: ActorArt } {
  FM ??= makeFleshmancerActionArt();
  MINI ??= makeMiniActionArt();
  HERO ??= makeHeroArt3().of('warrior', { twoHanded: false }) as unknown as ActorArt;
  return { fm: FM, mini: MINI, knight: HERO };
}
/** The game's own Fleshmancer, as he is (for his old shards beside the new). */
export function oldFrame(move: string, t: number, view: View): Laid {
  void OLD;
  return frameOf(FLESHMANCER, move, t, view);
}
function handsOf(view: View): Sprite[][] {
  return (HANDS[view] ??= Array.from({ length: FM_HAND_KINDS }, (_, k) => makeRingHandArt(view, k)));
}
const BONES = new Map<string, Laid>();
/** One of the game's skeletons lying in a heap (`k` 1) or coming up out of it (`k` toward 0: its death played back), or standing (`k` < 0: its stand, `-k` seconds in). */
function boneLaid(k: number, view: View): Laid {
  const key = `${view}:${k < 0 ? `s${(Math.round(-k * 10) / 10) % 1.2}` : (Math.round(k * 30) / 30).toFixed(3)}`;
  let l = BONES.get(key);
  if (!l) {
    l = k < 0 ? laid(paintSkeleton3(STAND3, (Math.round(-k * 10) / 10) % 1.2, view), CANVAS3.ax, CANVAS3.ay) : laid(deathOf3(Math.round(k * 30) / 30, view), CANVAS3.ax, CANVAS3.ay);
    BONES.set(key, l);
  }
  return l;
}

// ---------------------------------------------------------------------------------------------
// Where things are, and laying a scene

/** The way he faces on the floor seen `view` (radians on the floor's own axes): from in front, down the picture (+x); from behind, up it (-y). */
export const aimOf = (view: View): number => (view === 'front' ? 0 : -Math.PI / 2);
/** A floor point `fwd` tiles before a spot and `left` to its left, as he faces seen `view`. */
export const before = (at: readonly [number, number], view: View, fwd: number, left = 0): [number, number] => {
  const a = aimOf(view);
  return [at[0] + Math.cos(a) * fwd + Math.cos(a - Math.PI / 2) * left, at[1] + Math.sin(a) * fwd + Math.sin(a - Math.PI / 2) * left];
};
/** The picture of a scene whose arena's middle is at (cx, cy): a floor point and a height to a point of it. */
const atOf = (cx: number, cy: number): At => (x, y, z = 0) => {
  const [X, Y] = onFloor(x, y, cx, cy, 1);
  return [X, Y - z];
};
/** Where the skull's jaws are on the picture, `t` seconds into one of his moves, him at `B` seen `view` (flipped if he is). */
function mouthOf(move: string, t: number, view: View, B: readonly [number, number], cx: number, cy: number, flip = false): [number, number] {
  const mob = fleshmancerActionMob();
  const p = project(staffOf(skeletonAt(mob, move, t)).skull, paintViewOf(mob, view));
  const [bx, by] = onFloor(B[0], B[1], cx, cy, 1);
  return [bx + (flip ? -p[0] : p[0]), by + p[1] + 6];
}
/** Where the fire between the mini fleshmancer's claws is on the picture. */
function miniMouthOf(t: number, view: View, B: readonly [number, number], cx: number, cy: number): [number, number] {
  const mob = miniActionMob();
  const p = project(miniHands(skeletonAt(mob, 'attack', t)), paintViewOf(mob, view));
  const [bx, by] = onFloor(B[0], B[1], cx, cy, 1);
  return [bx + p[0], by + p[1]];
}
/** The knight at `K` (tiles), turned toward `B`: standing, running, struck. */
function knightAt(K: readonly [number, number], B: readonly [number, number], t: number, cx: number, cy: number, act: 'stand' | 'walk' | { reel: number } = 'stand'): Stood {
  const { knight } = figures();
  const [kx, ky] = onFloor(K[0], K[1], cx, cy, 1);
  const [bx, by] = onFloor(B[0], B[1], cx, cy, 1);
  const v: View = ky < by ? 'front' : 'back';
  const l = typeof act === 'object' ? frameAt(knight, v, 'reel', act.reel) : frameAt(knight, v, act, t);
  return { at: [kx, ky], l, flip: kx > bx, shadow: 9 };
}
/** Him at `B`, a frame of `move` (`m` seconds in: before it, his stand; after it, his stand again). */
function himAt(art: ActorArt, B: readonly [number, number], view: View, move: string, m: number, long: number, cx: number, cy: number, flip = false): Stood {
  const l = m < 0 ? frameAt(art, view, 'stand', m + 10) : m < long ? frameAt(art, view, move, m) : frameAt(art, view, 'stand', m - long);
  return { at: onFloor(B[0], B[1], cx, cy, 1), l, flip, shadow: 12 };
}
/** LAY A SCENE: the floor and what lies on it; the figures' shadows; then the figures from the top of the picture down, what stands up off the floor laid in among them by its own floor point. */
function scene(base: Px, floor: (p: Px) => void, figs: Stood[], air: (p: Px, keep: Keep) => void, shake: readonly [number, number] = [0, 0]): Px {
  const p = new Px(base.w, base.h);
  p.d.set(base.d);
  floor(p);
  for (const s of figs) if (s.shadow) shadow(p, s.at[0], s.at[1], s.shadow, 1);
  const sorted = [...figs].sort((a, b) => a.at[1] - b.at[1]);
  let from = -Infinity;
  for (const s of sorted) {
    const y0 = from;
    air(p, (y) => y >= y0 && y < s.at[1]);
    lay(p, s.l, s.at[0], s.at[1], 1, undefined, s.flip);
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
  return [Math.round((hash(fr, 1, 1501) - 0.5) * 2 * a), Math.round((hash(fr, 2, 1501) - 0.5) * 2 * a)];
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
/** The hands of his rings at a moment (`m` seconds into his rings), round `B`, as figures. */
function handsStood(m: number, B: readonly [number, number], view: View, cx: number, cy: number, aim: number): Stood[] {
  const out: Stood[] = [];
  const arts = handsOf(view);
  RINGS.radii.forEach((r, i) => {
    const fr = Math.floor((m - ringBurst(i)) * FM_HAND_FPS + 1e-6);
    if (fr < 0 || fr >= FM_HAND_FRAMES) return;
    for (const { j, a } of ringHands(i).hands) {
      const k = (j * 7 + i) % FM_HAND_KINDS;
      // (each to its own beat, a little: never one hand over and over)
      const fj = Math.max(0, Math.min(FM_HAND_FRAMES - 1, fr - (hash(j, i, 1502) > 0.6 ? 1 : 0)));
      const at = onFloor(B[0] + Math.cos(aim + a) * r, B[1] + Math.sin(aim + a) * r, cx, cy, 1);
      out.push({ at, l: spriteLaid(arts[k][fj]), flip: hash(j, i, 1503) > 0.5 });
    }
  });
  return out;
}
/** A bone heap of his lair at `H`: the game's skeletons' bones lying in a heap. */
function heapStood(H: readonly [number, number], cx: number, cy: number, shake: number, t: number, i: number): Stood[] {
  const out: Stood[] = [];
  for (const [dx, dy, k] of [[-0.3, -0.22, 0], [0.28, -0.26, 1], [-0.08, 0.3, 1], [0.34, 0.2, 0]] as const) {
    const [x, y] = onFloor(H[0] + dx, H[1] + dy, cx, cy, 1);
    const j = Math.round(Math.sin(t * 47 + dx * 9 + i) * 1.5 * shake);
    out.push({ at: [x + j, y], l: boneLaid(1, k ? 'front' : 'back'), flip: k === 1 });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// THE SHARDS: the knight 4.2 tiles before him; in a gap of the first fan as it flies; stepping into where it went as the second
// comes into its gaps

const SHARD_K = 4.2;
export function shardsScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const { fm } = figures();
  const m = t - LEAD;
  const B: [number, number] = [0, 0];
  const aim = aimOf(view);
  const at = atOf(cx, cy);
  // (the knight: in the first fan's gap by its hit; back where the first fan's middle shard went by the second's)
  const gap = (SHARDS.apart / 2) * (Math.PI / 180);
  const side = gap * smooth((m - f(12)) / 0.3) - gap * smooth((m - f(38)) / 0.3);
  const K = before(B, view, SHARD_K * Math.cos(side), SHARD_K * Math.sin(side));
  const moving = (m > f(12) && m < f(21)) || (m > f(38) && m < f(47));
  const figs = [himAt(fm, B, view, 'attack', m, SHARD_LONG, cx, cy), knightAt(K, B, t, cx, cy, moving ? 'walk' : 'stand')];
  const sh = (m >= 0 && m < SHARD_LONG) || m >= SHARD_LONG ? m : -1;
  return scene(base, (p) => paintShards(p, at, sh, B, aim, 'floor'), figs, (p, keep) => paintShards(p, at, sh, B, aim, 'air', keep), shakeOf(m, [[SHARD_HITS[0], 2], [SHARD_HITS[1], 2.5]]));
}
export const SHARDS_PASS = LEAD + SHARD_LONG + 0.15;

// ---------------------------------------------------------------------------------------------
// THE RINGS: the knight 2.0 tiles off, between the first rings; stepping in among the first ring's sinking hands as the second come

export function ringsScene(view: View, t: number, base: Px, cx: number, cy: number, K0 = 2.0, K1 = 1.4): Px {
  const { fm } = figures();
  const m = t - LEAD;
  const B: [number, number] = [0, 0];
  const aim = aimOf(view);
  const at = atOf(cx, cy);
  const kd = K0 + (K1 - K0) * smooth((m - (RING_HITS[0] + 0.45)) / 0.3);
  // (off to his side, so that he is not hidden behind him from behind)
  const side = view === 'front' ? 0.35 : -1.0;
  const K = before(B, view, kd * Math.cos(side), kd * Math.sin(side));
  const moving = m > RING_HITS[0] + 0.45 && m < RING_HITS[0] + 0.75;
  const figs = [himAt(fm, B, view, 'rings', m, RING_LONG, cx, cy), knightAt(K, B, t, cx, cy, moving ? 'walk' : 'stand'), ...handsStood(m, B, view, cx, cy, aim)];
  return scene(base, (p) => paintRingCracks(p, at, m, B, aim), figs, () => {}, shakeOf(m, [[RING_HITS[0], 5], [RING_HITS[1], 4]]));
}
export const RINGS_PASS = LEAD + RING_LONG - 0.2;

// ---------------------------------------------------------------------------------------------
// THE FIRE: the knight 3 tiles off between two lanes; the whip comes round and catches him; he holds between the lanes as they burn

export function fireScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const { fm } = figures();
  const m = t - LEAD;
  const B: [number, number] = [0, 0];
  const aim = aimOf(view);
  const at = atOf(cx, cy);
  // (between the lanes either side of the way he faces: the fourth and fifth of them, at 0.8 and 1.5 radians off his right)
  const K = before(B, view, 3.2 * Math.cos(-0.12), 3.2 * Math.sin(-0.12));
  // (the whip's moment at him: its way at -0.12 radians)
  let struck = -1;
  for (let i = 0; i < 60; i++) {
    const tt = FIRE_HIT + (i / 60) * (FIRE_STOP - FIRE_HIT);
    const w = fireWayAt(tt);
    if (w !== null && w >= -0.12) {
      struck = tt;
      break;
    }
  }
  const act = struck > 0 && m >= struck && m < struck + 8 / 30 ? { reel: m - struck } : 'stand';
  const mouth = m >= FIRE_HIT && m <= FIRE_STOP ? mouthOf('fire', m, view, B, cx, cy) : null;
  const figs = [himAt(fm, B, view, 'fire', m, FIRE_LONG, cx, cy), knightAt(K, B, t, cx, cy, act)];
  return scene(base, (p) => paintFire(p, at, m, B, aim, null, 'floor'), figs, (p, keep) => paintFire(p, at, m, B, aim, mouth, 'air', false, keep), shakeOf(m, [[FIRE_HIT, 3]]));
}
export const FIRE_PASS = LEAD + FIRE_LONG + 0.3;

// ---------------------------------------------------------------------------------------------
// RAISE THE DEAD: four heaps round him; each one's dead bursts up out of it and comes at the knight

/** Where the heaps of his lair are (tiles from him), seen from in front; from behind, turned with him. */
const HEAPS: ReadonlyArray<readonly [number, number]> = [[3.2, -2.6], [3.6, 1.9], [-1.8, 3.2], [-3.0, -0.8]];
export const heapsOf = (view: View, B: readonly [number, number] = [0, 0]): [number, number][] => HEAPS.map(([x, y]) => (view === 'front' ? [B[0] + x, B[1] + y] : [B[0] + y, B[1] - x]) as [number, number]);
export function raiseScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const { fm } = figures();
  const m = t - LEAD;
  const B: [number, number] = [0, 0];
  const at = atOf(cx, cy);
  const K = before(B, view, 4.0, -0.6);
  const heaps = heapsOf(view, B);
  const figs: Stood[] = [himAt(fm, B, view, 'raise', m, RAISE_LONG, cx, cy), knightAt(K, B, t, cx, cy)];
  heaps.forEach((H, i) => {
    const since = m - raiseBurst(i);
    const shakeK = since < 0 ? smooth((m - RAISE_HOLD[0] + 0.2) / 0.4) : 0;
    figs.push(...heapStood(H, cx, cy, shakeK, t, i));
    if (since >= 0) {
      // (burst up out of it: its death played back in three frames, thrown up and landing; then it stands, and comes on)
      const [hx, hy] = onFloor(H[0], H[1], cx, cy, 1);
      const [kx, ky] = onFloor(K[0], K[1], cx, cy, 1);
      const v: View = hy < ky ? 'front' : 'back';
      const up = since < 0.1 ? 1 - since / 0.1 : -(since - 0.1);
      const lift = since < 0.3 ? Math.round(18 * Math.sin((Math.PI * since) / 0.3)) : 0;
      figs.push({ at: [hx, hy + 2], l: { ...boneLaid(up, v), ay: boneLaid(up, v).ay + lift }, flip: kx < hx, shadow: 8 });
    }
  });
  return scene(base, (p) => heaps.forEach((H, i) => paintHeap(p, at, m, H, i, 'floor')), figs, (p, keep) => heaps.forEach((H, i) => {
    const [, y] = at(H[0], H[1]);
    if (keep(y)) paintHeap(p, at, m, H, i, 'air');
  }), shakeOf(m, [[RAISE_HIT, 3]]));
}
export const RAISE_PASS = LEAD + RAISE_LONG - 0.2;

// ---------------------------------------------------------------------------------------------
// THE TELEPORT: yanked down where he is; nowhere a moment; the mark where he will rise, near the knight, who backs out of it; he
// erupts out of it

/** The rules' pause between his two pits (seconds: game/bosses.ts FLESH_BLINK.pause). */
export const PAUSE = 0.4;
/** How far the place he rises is from where he went (tiles), seen from in front: to the knight's side. */
const RISE_AT: readonly [number, number] = [2.6, 1.4];
export function teleportScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const { fm } = figures();
  const m = t - LEAD;
  const B0: [number, number] = [-1.4, -0.4];
  const B1: [number, number] = view === 'front' ? [B0[0] + RISE_AT[0], B0[1] + RISE_AT[1]] : [B0[0] + RISE_AT[1], B0[1] - RISE_AT[0]];
  const at = atOf(cx, cy);
  const r0 = SINK_LONG + PAUSE;
  const erupt = r0 + RISE_HIT;
  // (the knight: near where he will rise; backing out of its ring as it is marked)
  const K0 = before(B1, view, 1.4, 0.5);
  const K1 = before(B1, view, RISE_MARK.r + 0.7, 0.9);
  const k = smooth((m - (erupt - RISE_MARK.warn + 0.25)) / 0.45);
  const K: [number, number] = [K0[0] + (K1[0] - K0[0]) * k, K0[1] + (K1[1] - K0[1]) * k];
  const moving = k > 0.02 && k < 0.98;
  const figs: Stood[] = [knightAt(K, m < r0 ? B0 : B1, t, cx, cy, moving ? 'walk' : 'stand')];
  if (m < SINK_LONG) figs.push(himAt(fm, B0, view, 'sink', m, SINK_LONG, cx, cy));
  else if (m >= r0) figs.push(himAt(fm, B1, view, 'rise', m - r0, RISE_LONG, cx, cy));
  return scene(base, (p) => {
    if (m >= 0 && m < SINK_LONG) paintSinkPit(p, at, m, B0);
    paintRiseMark(p, at, m - erupt, B1, 'floor');
  }, figs, (p, keep) => {
    const [, y] = at(B1[0], B1[1]);
    if (keep(y)) paintRiseMark(p, at, m - erupt, B1, 'air');
  }, shakeOf(m, [[SINK_HIT, 2], [erupt, 5]]));
}
export const TELEPORT_PASS = LEAD + SINK_LONG + PAUSE + RISE_LONG + 0.1;
export const TELEPORT_ERUPT = LEAD + SINK_LONG + PAUSE + RISE_HIT;

// ---------------------------------------------------------------------------------------------
// THE MINI FLESHMANCER'S FIRE: the knight 2.2 tiles before him

export function miniScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const { mini } = figures();
  const m = t - LEAD;
  const B: [number, number] = [0, 0];
  const aim = aimOf(view);
  const at = atOf(cx, cy);
  const K = view === 'front' ? before(B, view, 2.3, 1.2) : before(B, view, 2.4, 0.1);
  const mouth = m >= MINI_HIT ? miniMouthOf(m, view, B, cx, cy) : null;
  const figs = [himAt(mini, B, view, 'attack', m, MINI_LONG, cx, cy), knightAt(K, B, t, cx, cy)];
  return scene(base, (p) => paintFire(p, at, m, B, aim, null, 'floor', true), figs, (p, keep) => paintFire(p, at, m, B, aim, mouth, 'air', true, keep), shakeOf(m, [[MINI_HIT, 1.5]]));
}
export const MINI_PASS = LEAD + MINI_LONG + 0.4;

// ---------------------------------------------------------------------------------------------
// OVER THE WHOLE LAIR, FROM ABOVE (the game's own pixels: the arena whole), him seen from behind, the knight dodging

/** THE RINGS OVER THE WHOLE LAIR: the knight 3.2 tiles off between the third and fourth rings: out through the second's gap after the first slam? No: he stands between, then steps out across the third ring's sinking hands as the fourth bursts. */
export function ringsArena(t: number, base: Px, cx: number, cy: number): Px {
  const { fm } = figures();
  const m = t - LEAD;
  const B: [number, number] = [0, 0];
  const view: View = 'back';
  const aim = aimOf(view);
  const at = atOf(cx, cy);
  // (between ring 2, 3.8, and ring 3, 5.0: safe at the first slam; then across into ring 2's band, its hands sinking, as ring 3 comes)
  const kd = 4.4 + (3.75 - 4.4) * smooth((m - (RING_HITS[0] + 0.42)) / 0.32);
  const K = before(B, view, kd * Math.cos(0.35), kd * Math.sin(0.35));
  const moving = m > RING_HITS[0] + 0.42 && m < RING_HITS[0] + 0.74;
  const heaps = heapsOf('front', B);
  const figs = [himAt(fm, B, view, 'rings', m, RING_LONG, cx, cy), knightAt(K, B, t, cx, cy, moving ? 'walk' : 'stand'), ...handsStood(m, B, view, cx, cy, aim), ...heaps.flatMap((H, i) => heapStood(H, cx, cy, 0, t, i))];
  return scene(base, (p) => paintRingCracks(p, at, m, B, aim), figs, () => {}, shakeOf(m, [[RING_HITS[0], 5], [RING_HITS[1], 4]]));
}
export const RINGS_ARENA_PASS = LEAD + RING_LONG - 0.4;
/** THE FIRE OVER THE WHOLE LAIR: the knight dashes in under him during the hold, the whip goes round over him, and he holds there in close while the lanes burn out round him. */
export function fireArena(t: number, base: Px, cx: number, cy: number): Px {
  const { fm } = figures();
  const m = t - LEAD;
  const B: [number, number] = [0, 0];
  const view: View = 'back';
  const aim = aimOf(view);
  const at = atOf(cx, cy);
  const kd = 4.6 + (0.75 - 4.6) * smooth((m - f(10)) / 0.55);
  const K = before(B, view, kd * Math.cos(0.5), kd * Math.sin(0.5));
  const moving = m > f(10) && m < f(10) + 0.55;
  const mouth = m >= FIRE_HIT && m <= FIRE_STOP ? mouthOf('fire', m, view, B, cx, cy) : null;
  const heaps = heapsOf('front', B);
  const figs = [himAt(fm, B, view, 'fire', m, FIRE_LONG, cx, cy), knightAt(K, B, t, cx, cy, moving ? 'walk' : 'stand'), ...heaps.flatMap((H, i) => heapStood(H, cx, cy, 0, t, i))];
  return scene(base, (p) => paintFire(p, at, m, B, aim, null, 'floor'), figs, (p, keep) => paintFire(p, at, m, B, aim, mouth, 'air', false, keep), shakeOf(m, [[FIRE_HIT, 3]]));
}
export const FIRE_ARENA_PASS = LEAD + FIRE_LONG + 1.0;
void FIRE;
void PIT;
void shardAngles;
void SHARD_DRAW;
void DIE3_TIME;
