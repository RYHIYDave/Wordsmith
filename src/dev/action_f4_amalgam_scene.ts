// Pictures of THE OSSUARY AMALGAMATION'S MOVES DONE THE ACTION WAY, put together for the owner (the sheet, the film's frames): its
// swipe combo and the finisher's ring, the bone rain (close, and over the whole floor from above), the floor arms, the devour
// (art/amalgam_action.ts, AMALGAM_ACTION; on the floor, art/amalgam_action_fx.ts), in its ossuary (floor 1's stand-in floor of old
// stone flags, an arena about 17 by 20 tiles: dev/action_f1_scene.ts; over the whole floor, a stand-in wall of niches round its
// back), with the knight for size, each figure at its floor point and sorted by it, as the game sorts them. What the game draws in
// its own pixels (a warning circle, the cracks before the arms, the claws' gouges) is drawn by the game's own code through `PxCtx`,
// a stand-in for a canvas. Made outside a browser (tools/action_f4_amalgam_film.ts, tools/action_f4_amalgam_sheet.ts). Nothing of
// the game imports it.

import { Px } from '../engine/px';
import type { ActorArt } from '../art/actor_types';
import { ARMS_HIT, ARMS_LONG, DEVOUR_HITS, DEVOUR_LONG, DRAG, FINISHER_LATER, RAIN_HIT, RAIN_LONG, RAKE_FREEZE, SWIPE1_HITS, SWIPE1_LONG, SWIPE_HITS, SWIPE_LONG, makeAmalgamActionArt, makeAmalgamRound1Art } from '../art/amalgam_action';
import {
  ARMS, BIG_ARM_CANVAS, BIG_ARM_FRAMES, BIG_ARM_FPS, DROP_CANVAS, RAIN, RAIN_SKULL_CANVAS, SLAM_RING, dropAt, dropPainted, makeBigArmArt, makeRainSkullArt, rainDrops, rakeFloorPainted, slamRingCanvas, slamRingPainted,
} from '../art/amalgam_action_fx';
import { MITE, makeBoneMiteArt } from '../art/amalgam_mites';
import type { Clip } from '../art/actor_types';
import { ACT_CANVAS } from '../art/amalgam_action';
import type { Drop } from '../art/amalgam_action_fx';
import { AMALGAM } from '../art/bosses3';
import { drawArmCrack, drawClawRake, ARM_CRACK_WARN } from '../art/boss_shots';
import { hash } from '../art/kit';
import { makeHeroArt3 } from '../art/heroes3';
import { P } from '../art/palette';
import { compose, laid, onFloor } from './action_f1_scene';
import type { Stood } from './action_f1_scene';
import { PxCtx, frameAt } from './action_f3_scene';
import { spriteLaid } from './king_scene';
import type { Laid } from './king_scene';

export type View = 'front' | 'back';
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (u: number): number => {
  const k = clamp01(u);
  return k * k * (3 - 2 * k);
};

// ---------------------------------------------------------------------------------------------
// The figures, and where things are on the floor

let AM: ActorArt | null = null;
let AM1: ActorArt | null = null;
let HERO: ActorArt | null = null;
let MITES: ActorArt | null = null;
/** The Amalgamation as the game would hold it with AMALGAM_ACTION on (and with the first round's rakes, for the picture of them beside the new); the knight; a bone mite. */
export function figures(): { am: ActorArt; am1: ActorArt; knight: ActorArt; mite: ActorArt } {
  AM ??= makeAmalgamActionArt(AMALGAM.pace);
  AM1 ??= makeAmalgamRound1Art(AMALGAM.pace);
  HERO ??= makeHeroArt3().of('warrior', { twoHanded: false }) as unknown as ActorArt;
  MITES ??= makeBoneMiteArt();
  return { am: AM, am1: AM1, knight: HERO, mite: MITES };
}
/** A frame of a figure's death (the game's own clip of it). */
function deathAt(art: ActorArt, view: View, t: number): Laid {
  const c = (view === 'front' ? art.front : art.back).clips?.die as Clip;
  return spriteLaid(c.frames[Math.max(0, Math.min(c.frames.length - 1, Math.floor(t * c.fps + 1e-6)))]);
}
/** The way a figure at `from` facing toward `to` (tiles) is seen: from in front if it faces down the screen; turned (mirrored) if it faces left. */
function facingOf(from: readonly [number, number], to: readonly [number, number]): { view: View; flip: boolean } {
  const dx = (to[0] - from[0]) - (to[1] - from[1]);
  const dy = (to[0] - from[0]) + (to[1] - from[1]);
  return { view: dy >= 0 ? 'front' : 'back', flip: dx < 0 };
}
/** The way it faces on the floor (tiles): from in front, down-right (+x); from behind, up-right (-y); and the way its left is. */
const ahead = (view: View): [number, number] => (view === 'front' ? [1, 0] : [0, -1]);
const leftOf = (view: View): [number, number] => (view === 'front' ? [0, -1] : [-1, 0]);
/** A floor point `fwd` tiles before a spot and `left` to its left, as it faces. */
export const before = (at: readonly [number, number], view: View, fwd: number, left = 0): [number, number] => {
  const [ax, ay] = ahead(view);
  const [lx, ly] = leftOf(view);
  return [at[0] + ax * fwd + lx * left, at[1] + ay * fwd + ly * left];
};
/** The floor point (tiles) where the game's own drawings put it: in the game's pixels. */
const gameAt = (cx: number, cy: number, k: number) => (x: number, y: number): readonly [number, number] => {
  const [X, Y] = onFloor(x, y, cx, cy, k);
  return [X / 2, Y / 2];
};
const standing = (at: [number, number], l: Laid, more: Partial<Stood> = {}): Stood => ({ at, l, ...more });
const airHalves = (C: [number, number], behind: Laid, ahead2: Laid): Stood[] => [standing([C[0], C[1] - 0.5], behind), standing([C[0], C[1] + 0.5], ahead2)];
function floorOf(base: Px): Px {
  const p = new Px(base.w, base.h);
  p.d.set(base.d);
  return p;
}
/** The knight at `K` (tiles), turned toward it at `B`, standing or running. */
function knightStood(knight: ActorArt, K: readonly [number, number], B: readonly [number, number], walking: boolean, t: number, cx: number, cy: number, k: number, act?: { move: 'attack' | 'reel'; at: number }): Stood {
  const [kx, ky] = onFloor(K[0], K[1], cx, cy, k);
  const [bx, by] = onFloor(B[0], B[1], cx, cy, k);
  const v: View = ky < by ? 'front' : 'back';
  return standing([kx, ky], act ? frameAt(knight, v, act.move, act.at) : frameAt(knight, v, walking ? 'walk' : 'stand', t), { flip: kx > bx, shadow: 9 });
}
/** THE GAME'S WARNING (render/render.ts, a 'warn' zone): its faint ground and its dotted edge, round a list of floor points (tiles). */
function warnZone(px: Px, pts: ReadonlyArray<readonly [number, number]>, k: number, kk: number, cx: number, cy: number): void {
  const g = new PxCtx(px, 2 * kk);
  const at = gameAt(cx, cy, kk);
  g.globalAlpha = 0.16 + 0.3 * k;
  g.fillStyle = P.bl3;
  g.beginPath();
  pts.forEach((p, i) => {
    const [x, y] = at(p[0], p[1]);
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  });
  g.fill();
  g.globalAlpha = 1;
  g.fillStyle = P.bl5;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const n = Math.max(2, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) * 11));
    for (let j = 0; j < n; j++) {
      const [x, y] = at(a[0] + ((b[0] - a[0]) * j) / n, a[1] + ((b[1] - a[1]) * j) / n);
      g.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
  }
}
/** A circle of floor points. */
const circle = (c: readonly [number, number], r: number, n = 40): [number, number][] => Array.from({ length: n }, (_, i) => [c[0] + Math.cos((i / n) * Math.PI * 2) * r, c[1] + Math.sin((i / n) * Math.PI * 2) * r] as [number, number]);
/** How much the floor shakes at `m` seconds (the game's shake as its weight lands): a few pixels, dying away. */
export function shakeOf(m: number, slams: ReadonlyArray<readonly [number, number]>): [number, number] {
  let a = 0;
  for (const [at, amount] of slams) {
    const s = m - at;
    if (s >= 0 && s < 0.4) a = Math.max(a, amount * (1 - s / 0.4));
  }
  const f = Math.floor(m * 30);
  return [Math.round((hash(f, 1, 1401) - 0.5) * 2 * a), Math.round((hash(f, 2, 1401) - 0.5) * 2 * a)];
}
/** Laid shifted (a frame shaken). */
function shaken(p: Px, d: [number, number]): Px {
  if (!d[0] && !d[1]) return p;
  const out = new Px(p.w, p.h);
  out.d.fill(0);
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
/** The ring where its weight lands (floor and air), its middle `SLAM_RING.ahead` tiles before it. */
function ringAt(B: [number, number], view: View, since: number, radius: number, cx: number, cy: number, k: number, seed: number): { floor: { at: [number, number]; l: Laid }; air: Stood[] } {
  const c = before(B, view, SLAM_RING.ahead);
  const C = onFloor(c[0], c[1], cx, cy, k);
  const RC = slamRingCanvas(radius);
  return {
    floor: { at: C, l: laid(slamRingPainted(since, 'floor', radius, 'all', seed), RC.ax, RC.ay) },
    air: airHalves(C, laid(slamRingPainted(since, 'air', radius, 'behind', seed), RC.ax, RC.ay), laid(slamRingPainted(since, 'air', radius, 'before', seed), RC.ax, RC.ay)),
  };
}

/** How long it stands before it begins (seconds). */
export const LEAD = 0.4;

// ---------------------------------------------------------------------------------------------
// THE SWIPE: the right, the left, the finisher and its ring; the knight giving ground, and out of the ring

const SWIPE_FROM = -1.8;
/** The knight's reel (seconds), as the game's clip of it. */
const REEL_LONG = 8 / 30;
/**
 * THE SWIPE (the second round): the right rake, the backhand, the finisher and its ring. The knight 2.7 tiles before it: the first
 * rake catches him (the freeze on the hit; he is struck and thrown back); he backs off out of its reach before the backhand, which
 * sweeps by just before him; out of the ring sideways as it rears. `round1`: it with the first round's rakes (for the picture of
 * them beside the new), the knight standing.
 */
export function swipeScene(view: View, t: number, base: Px, cx: number, cy: number, k = 1, round1 = false): Px {
  const { am, am1, knight } = figures();
  const m = t - LEAD;
  const B = before([0, 0], view, SWIPE_FROM);
  const long = round1 ? SWIPE1_LONG : SWIPE_LONG;
  const art = round1 ? am1 : am;
  const fig = m < 0 ? frameAt(art, view, 'stand', t) : m < long ? frameAt(art, view, 'attack', m) : frameAt(art, view, 'stand', m - long);
  const [h1, h2, h3] = round1 ? SWIPE1_HITS : SWIPE_HITS;
  const smooth2 = (a: number, d: number): number => smooth((m - a) / d);
  // (the knight: struck by the first and thrown back; backing off from the second; out of the ring sideways as it rears)
  const thrown = round1 ? 0 : 0.85 * smooth2(h1 + RAKE_FREEZE, 0.3);
  const backs = round1 ? 0 : 0.5 * smooth2(1.15, 0.35);
  const rear = (58 + FINISHER_LATER) / 30;
  const aside = round1 ? 0 : 2.6 * smooth2(rear + 0.05, 0.55);
  const K = before(B, view, 2.7 + thrown + backs + (round1 ? 0 : 0.6 * smooth2(rear + 0.05, 0.55)), view === 'front' ? aside : -aside);
  const struck = !round1 && m >= h1 && m < h1 + RAKE_FREEZE + REEL_LONG ? { move: 'reel' as const, at: Math.max(0, m - h1 - RAKE_FREEZE) } : undefined;
  const kWalk = !round1 && ((m > 1.15 && m < 1.5) || (m > rear + 0.05 && m < rear + 0.6));
  const px0 = floorOf(base);
  if (m >= rear && m < h3 && !round1) warnZone(px0, circle(before(B, view, SLAM_RING.ahead), SLAM_RING.finisher), (m - rear) / (h3 - rear), k, cx, cy);
  const at = onFloor(B[0], B[1], cx, cy, k);
  const ring = ringAt(B, view, m - h3, SLAM_RING.finisher, cx, cy, k, 61);
  // (the gouges its claws rip in the floor)
  const floor: { at: [number, number]; l: Laid }[] = [ring.floor];
  if (!round1) for (const [i, h] of [[0, h1], [1, h2]] as const) floor.push({ at, l: laid(rakeFloorPainted(m - h, i, view), ACT_CANVAS.ax, ACT_CANVAS.ay) });
  const stood: Stood[] = [standing(at, fig, { shadow: 30 }), knightStood(knight, K, B, kWalk, t, cx, cy, k, struck), ...ring.air];
  return shaken(compose(px0, floor, stood, k), shakeOf(m, [[h1, round1 ? 1 : 3], [h2, round1 ? 1 : 3.5], [h3, 4]]));
}
export const SWIPE_PASS = LEAD + SWIPE_LONG + 0.4;

// ---------------------------------------------------------------------------------------------
// THE BONE RAIN

/** The skulls of the rain over the arena, it at `boss`: worked out once for a place of it. */
const DROPS = new Map<string, Drop[]>();
export function dropsFor(boss: readonly [number, number]): Drop[] {
  const key = boss.join(',');
  if (!DROPS.has(key)) DROPS.set(key, rainDrops({ rx: 8.5, ry: 10 }, boss));
  return DROPS.get(key) as Drop[];
}
const SKULLS: Partial<Record<View, ReturnType<typeof makeRainSkullArt>>> = {};
function dropFloor(d: Drop, since: number): Px {
  return dropPainted(since, 'floor', d.seed).px;
}
/** The rain's skulls at `m` seconds of the move, laid on a scene: shadows and piles on the floor; skulls in the air and their bursts standing, sorted. */
function rainLaid(drops: ReadonlyArray<Drop>, m: number, view: View, cx: number, cy: number, k: number, keep: (d: Drop) => boolean = () => true): { floor: { at: [number, number]; l: Laid }[]; stood: Stood[] } {
  const floor: { at: [number, number]; l: Laid }[] = [];
  const stood: Stood[] = [];
  const set = (SKULLS[view] ??= makeRainSkullArt(view));
  const C = DROP_CANVAS;
  for (const d of drops) {
    if (!keep(d)) continue;
    const since = m - RAIN_HIT - d.land;
    if (since < -RAIN.fly || since > RAIN.mite.scuff) continue;
    const at = onFloor(d.at[0], d.at[1], cx, cy, k);
    floor.push({ at, l: laid(dropFloor(d, since), C.ax, C.ay) });
    if (since < 0) {
      const p = dropAt(d, 1 + since / RAIN.fly);
      const [x, y] = onFloor(p[0], p[1], cx, cy, k);
      const sp = spriteLaid(set[Math.floor((m * 2.2 + d.seed * 0.37) * 8) % 8]);
      // (in the air over its spot: sorted by the floor point under it, drawn up its height)
      stood.push(standing([x, y], { ...sp, ay: sp.ay + (p[2] * 2) }));
    } else if (since < 0.8) {
      stood.push(...airHalves(at, laid(dropPainted(since, 'air', d.seed, 'behind'), C.ax, C.ay), laid(dropPainted(since, 'air', d.seed, 'before'), C.ax, C.ay)));
    }
  }
  return { floor, stood };
}
void RAIN_SKULL_CANVAS;

/** THE BONE RAIN, CLOSE: it rears, roars, slams; the skulls come down round the knight, who steps into where the first burst. */
const RAIN_B: [number, number] = [-2.6, -1.6];
export function rainScene(view: View, t: number, base: Px, cx: number, cy: number, k = 1): Px {
  const { am, knight } = figures();
  const m = t - LEAD;
  const B: [number, number] = view === 'front' ? RAIN_B : [RAIN_B[1], -RAIN_B[0]];
  const drops = dropsFor(B);
  const fig = m < 0 ? frameAt(am, view, 'stand', t) : m < RAIN_LONG ? frameAt(am, view, 'rain', m) : frameAt(am, view, 'stand', m - RAIN_LONG);
  const sw = swarmFor(drops, B, before(B, view, 4.0, view === 'front' ? 0.6 : -0.6));
  const K = frameOfSwarm(sw.knight, m);
  void knight;
  const px0 = floorOf(base);
  const at = onFloor(B[0], B[1], cx, cy, k);
  const ring = ringAt(B, view, m - RAIN_HIT, SLAM_RING.rain, cx, cy, k, 63);
  const r = rainLaid(drops, m, view, cx, cy, k);
  const stood: Stood[] = [standing(at, fig, { shadow: 30 }), swarmKnight(K, m, t, cx, cy, k), ...ring.air, ...r.stood, ...frameOfSwarm(sw.mites, m).map((mt) => miteStood(mt, cx, cy, k))];
  return shaken(compose(px0, [ring.floor, ...r.floor], stood, k), shakeOf(m, [[RAIN_HIT, 5], ...drops.map((d) => [RAIN_HIT + d.land, 0.6] as const)]));
}
export const RAIN_PASS = LEAD + RAIN_HIT + RAIN.first + 2 * RAIN.gap + RAIN.ripple + RAIN.fly + 1.4;

/** A bone mite of the rain at a moment: where it is (tiles), what it is doing and since when, what it faces. */
interface MiteNow {
  p: [number, number];
  state: 'form' | 'run' | 'bite' | 'dead';
  since: number;
  face: [number, number];
}
/** The knight at a moment: where, running or not, swinging or not (and since when), what he faces. */
interface KnightNow {
  p: [number, number];
  running: boolean;
  swing: number | null;
  face: [number, number];
}
/** The knight's swing: when it lands (seconds into his attack), how far it reaches (tiles), how wide (to either side of where he faces, degrees), how long his attack is. */
const SWING = { hit: 0.133, reach: 1.45, wide: 80, long: 29 / 30 } as const;
/**
 * THE KNIGHT IN THE RAIN, AND ITS BONE MITES (worked out once for a place of it and where he starts), frame by frame: each skull
 * that bursts pulls together into a bone mite (RAIN.mite.at after it lands, MITE.form long), which skitters at him (MITE.pace),
 * keeping a little apart from the others, and bites when it is near (its bite, again and again). He runs from where a skull is
 * coming down on him within three quarters of a second (4.6 tiles a second) to the nearest spot none will come down on in the
 * next second and a quarter; else, with a mite near, he swings, and every mite within his swing as it lands bursts.
 */
const SWARMS = new Map<string, { knight: KnightNow[]; mites: MiteNow[][] }>();
function swarmFor(drops: ReadonlyArray<Drop>, boss: readonly [number, number], start: readonly [number, number], long = 12, mites = true): { knight: KnightNow[]; mites: MiteNow[][] } {
  const key = `${boss.join(',')}:${start.join(',')}:${mites}`;
  const had = SWARMS.get(key);
  if (had) return had;
  const knight: KnightNow[] = [];
  const out: MiteNow[][] = [];
  let p: [number, number] = [start[0], start[1]];
  let goal: [number, number] | null = null;
  let swing: { at0: number; target: [number, number]; done: boolean } | null = null;
  let face: [number, number] = [boss[0], boss[1]];
  const live: (MiteNow & { d: number })[] = [];
  const made = new Set<number>();
  const danger = (q: readonly [number, number], at: number, ahead2: number, more = 0.35): boolean =>
    drops.some((d) => {
      const land = RAIN_HIT + d.land;
      return land >= at && land <= at + ahead2 && Math.hypot(q[0] - d.at[0], q[1] - d.at[1]) < RAIN.r + more;
    });
  for (let f = 0; f <= 30 * long; f++) {
    const at = f / 30;
    // the mites pulling themselves together where the skulls burst
    if (mites) {
      for (const d of drops) {
        const from = RAIN_HIT + d.land + RAIN.mite.at;
        if (made.has(d.seed) || at < from) continue;
        made.add(d.seed);
        live.push({ d: d.seed, p: [d.at[0], d.at[1]], state: 'form', since: from, face: [p[0], p[1]] });
      }
    }
    // the knight: running from what is coming down on him; else swinging at what is near
    if (!goal && danger(p, at, 0.75)) {
      let best: [number, number] | null = null;
      let bd = Infinity;
      for (let r = 0.3; r <= 3.2; r += 0.15) {
        for (let a = 0; a < 24; a++) {
          const q: [number, number] = [p[0] + Math.cos((a / 24) * Math.PI * 2) * r, p[1] + Math.sin((a / 24) * Math.PI * 2) * r];
          if (Math.hypot(q[0] / 8.5, q[1] / 10) > 0.85 || Math.hypot(q[0] - boss[0], q[1] - boss[1]) < 2.2) continue;
          if (danger(q, at, 1.25, 0.45)) continue;
          if (r < bd) {
            bd = r;
            best = q;
          }
        }
        if (best) break;
      }
      goal = best;
      swing = null;
    }
    let running = false;
    if (goal) {
      const sp = 4.6 / 30;
      const dd = Math.hypot(goal[0] - p[0], goal[1] - p[1]);
      face = [goal[0], goal[1]];
      if (dd <= sp) {
        p = goal;
        goal = null;
      } else {
        p = [p[0] + ((goal[0] - p[0]) * sp) / dd, p[1] + ((goal[1] - p[1]) * sp) / dd];
        running = true;
      }
    }
    if (!running && swing && at - swing.at0 >= SWING.long) swing = null;
    if (!running && !swing) {
      let near: (typeof live)[number] | null = null;
      let nd = 1.3;
      for (const mt of live) {
        if (mt.state === 'dead') continue;
        const dd = Math.hypot(mt.p[0] - p[0], mt.p[1] - p[1]);
        if (dd < nd) {
          nd = dd;
          near = mt;
        }
      }
      if (near) swing = { at0: at, target: [near.p[0], near.p[1]], done: false };
    }
    if (swing) {
      face = swing.target;
      if (!swing.done && at - swing.at0 >= SWING.hit) {
        swing.done = true;
        const fa = Math.atan2(swing.target[1] - p[1], swing.target[0] - p[0]);
        for (const mt of live) {
          if (mt.state === 'dead') continue;
          const dd = Math.hypot(mt.p[0] - p[0], mt.p[1] - p[1]);
          let da = Math.abs(Math.atan2(mt.p[1] - p[1], mt.p[0] - p[0]) - fa);
          if (da > Math.PI) da = 2 * Math.PI - da;
          if (dd <= SWING.reach && da <= (SWING.wide * Math.PI) / 180) {
            mt.state = 'dead';
            mt.since = at;
          }
        }
      }
    } else if (!running) face = [boss[0], boss[1]];
    knight.push({ p: [p[0], p[1]], running, swing: swing ? swing.at0 : null, face: [face[0], face[1]] });
    // the mites: skittering at him, keeping apart; biting when near
    for (const mt of live) {
      if (mt.state === 'dead') continue;
      mt.face = [p[0], p[1]];
      const dd = Math.hypot(p[0] - mt.p[0], p[1] - mt.p[1]);
      if (mt.state === 'form' && at - mt.since >= MITE.form) {
        mt.state = 'run';
        mt.since = at;
      }
      if (mt.state === 'bite' && at - mt.since >= MITE.bite.long) {
        mt.state = dd <= 0.75 ? 'bite' : 'run';
        mt.since = at;
      }
      if (mt.state === 'run') {
        if (dd <= 0.62) {
          mt.state = 'bite';
          mt.since = at;
        } else {
          const sp = MITE.pace / 30;
          mt.p = [mt.p[0] + ((p[0] - mt.p[0]) * sp) / dd, mt.p[1] + ((p[1] - mt.p[1]) * sp) / dd];
        }
      }
    }
    // (keeping apart: never on top of one another, nor in it)
    for (const a of live) {
      if (a.state === 'dead' || a.state === 'form') continue;
      for (const b of live) {
        if (a === b || b.state === 'dead') continue;
        const dd = Math.hypot(a.p[0] - b.p[0], a.p[1] - b.p[1]);
        if (dd < 0.42 && dd > 1e-6) {
          const push = (0.42 - dd) / 2;
          a.p = [a.p[0] + ((a.p[0] - b.p[0]) / dd) * push, a.p[1] + ((a.p[1] - b.p[1]) / dd) * push];
        }
      }
      const db = Math.hypot(a.p[0] - boss[0], a.p[1] - boss[1]);
      if (db < 1.7) a.p = [boss[0] + ((a.p[0] - boss[0]) / db) * 1.7, boss[1] + ((a.p[1] - boss[1]) / db) * 1.7];
    }
    out.push(live.filter((mt) => mt.state !== 'dead' || at - mt.since < MITE.die).map((mt) => ({ p: [mt.p[0], mt.p[1]], state: mt.state, since: at - mt.since, face: [mt.face[0], mt.face[1]] })));
  }
  const res = { knight, mites: out };
  SWARMS.set(key, res);
  return res;
}
const frameOfSwarm = <T,>(list: T[], m: number): T => list[Math.max(0, Math.min(list.length - 1, Math.round(m * 30)))];
/** A bone mite as it stands in a scene. */
function miteStood(mt: MiteNow, cx: number, cy: number, k: number): Stood {
  const { mite } = figures();
  const { view, flip } = facingOf(mt.p, mt.face);
  const l = mt.state === 'form' ? frameAt(mite, view, 'form', mt.since) : mt.state === 'run' ? frameAt(mite, view, 'walk', mt.since) : mt.state === 'bite' ? frameAt(mite, view, 'attack', mt.since) : deathAt(mite, view, mt.since);
  return standing(onFloor(mt.p[0], mt.p[1], cx, cy, k), l, { flip, shadow: mt.state === 'dead' ? 0 : 5 });
}
/** The knight as he stands in the swarm: running, swinging, or standing. */
function swarmKnight(K: KnightNow, m: number, t: number, cx: number, cy: number, k: number): Stood {
  const { knight } = figures();
  return knightStood(knight, K.p, K.face, K.running, t, cx, cy, k, K.swing !== null ? { move: 'attack', at: m - K.swing } : undefined);
}

/** A stand-in for the ossuary's wall round the back of the arena: rough dark stone, rows of niches, a skull in each, its eyes the enemy's pink; the niches it sheds from emptying as their skulls leave. */
function ossuaryWall(px: Px, cx: number, cy: number, drops: ReadonlyArray<Drop>, m: number): void {
  const top = new Map<number, number>();
  for (let i = 0; i < 2000; i++) {
    const a = (i / 2000) * Math.PI * 2;
    const [X, Y] = onFloor(Math.cos(a) * 8.5, Math.sin(a) * 10, cx, cy, 1);
    const x = Math.round(X);
    if (Y < cy && (!top.has(x) || (top.get(x) as number) > Y)) top.set(x, Y);
  }
  const STONE = ['#141219', '#1b1823', '#221e2c', '#2a2536'];
  const gone = new Set<string>();
  for (const d of drops) {
    if (m < RAIN_HIT + d.leave) continue;
    const [X] = onFloor(d.from[0], d.from[1], cx, cy, 1);
    gone.add(`${Math.round(X / 22)}:${d.seed % 3}`);
  }
  for (const [x, y0] of top) {
    if (x < 0 || x >= px.w) continue;
    for (let h = 0; h < 120; h++) {
      const y = Math.round(y0) - h;
      if (y < 0 || y >= px.h) continue;
      const course = Math.floor(h / 9);
      const seam = h % 9 === 0 || (x + course * 11) % 23 === 0;
      px.set(x, y, seam ? '#0b0a11' : STONE[Math.min(3, Math.floor(hash(Math.floor((x + course * 11) / 23), course, 1403) * 3) + (h < 40 ? 1 : 0))]);
    }
    // niches: three rows, every 22 pixels along
    const col = Math.round(x / 22);
    const nx = x - col * 22;
    for (let row = 0; row < 3; row++) {
      const ny = Math.round(y0) - 26 - row * 30;
      if (Math.abs(nx) > 6) continue;
      for (let h = 0; h < 16; h++) {
        const y = ny - h;
        if (y < 0 || y >= px.h) continue;
        const arch = h > 11 && Math.abs(nx) > 6 - (h - 11) * 1.2;
        if (arch) continue;
        px.set(x, y, '#07060a');
      }
      // its skull, unless it has been shed
      if (gone.has(`${col}:${row}`)) continue;
      if (Math.abs(nx) <= 4) {
        for (let h = 1; h <= 7; h++) {
          const y = ny - h;
          const w = h > 5 ? 3 : 4;
          if (Math.abs(nx) > w) continue;
          const eye = (h === 4 || h === 5) && (nx === -2 || nx === 1);
          px.set(x, y, eye ? (hash(col, row, 1405) < 0.5 ? '#ff4f8a' : '#3a0c2a') : h === 1 ? '#4a4466' : nx < 0 ? '#8a82a8' : '#6a6488');
        }
      }
    }
  }
}

/** THE BONE RAIN OVER THE WHOLE FLOOR, SEEN FROM ABOVE (the game's own pixels: the arena whole), it seen from behind at its back; the knight dodging. */
export const ARENA_B: [number, number] = [-1.0, 4.6];
export function rainArena(t: number, base: Px, cx: number, cy: number): Px {
  const { am, knight } = figures();
  const view: View = 'back';
  const m = t - LEAD;
  const B = ARENA_B;
  const drops = dropsFor(B);
  const fig = m < 0 ? frameAt(am, view, 'stand', t) : m < RAIN_LONG ? frameAt(am, view, 'rain', m) : frameAt(am, view, 'stand', m - RAIN_LONG);
  const sw = swarmFor(drops, B, before(B, view, 3.0, -0.8));
  const K = frameOfSwarm(sw.knight, m);
  void knight;
  const px0 = floorOf(base);
  ossuaryWall(px0, cx, cy, drops, m);
  const at = onFloor(B[0], B[1], cx, cy, 1);
  const ring = ringAt(B, view, m - RAIN_HIT, SLAM_RING.rain, cx, cy, 1, 63);
  const r = rainLaid(drops, m, view, cx, cy, 1);
  const stood: Stood[] = [standing(at, fig, { shadow: 30 }), swarmKnight(K, m, t, cx, cy, 1), ...ring.air, ...r.stood, ...frameOfSwarm(sw.mites, m).map((mt) => miteStood(mt, cx, cy, 1))];
  return shaken(compose(px0, [ring.floor, ...r.floor], stood, 1), shakeOf(m, [[RAIN_HIT, 4]]));
}
export const ARENA_PASS = LEAD + RAIN_HIT + RAIN.first + 2 * RAIN.gap + RAIN.ripple + RAIN.fly + 3.6;

// ---------------------------------------------------------------------------------------------
// THE FLOOR ARMS: reared, held, slammed; the cracks glowing; the arms up under and round the knight, who runs out

const ARMS_FROM = -2.0;
/** Where the holes are: the first where the knight stands as it slams, the rest round it (tiles from there), and when each comes up (seconds after the slam). */
export function armHoles(K: readonly [number, number], away = 0): { at: [number, number]; up: number }[] {
  const out: { at: [number, number]; up: number }[] = [{ at: [K[0], K[1]], up: ARMS.first }];
  for (let i = 1; i < ARMS.n; i++) {
    // (round him, a gap left the way away from it: the way out, if he is quick)
    const a = away + ((i - 0.5) / (ARMS.n - 1)) * Math.PI * 2;
    const r = i % 2 ? ARMS.near + 0.4 : ARMS.far - 0.3;
    out.push({ at: [K[0] + Math.cos(a) * r, K[1] + Math.sin(a) * r], up: ARMS.first + ((ARMS.last - ARMS.first) * i) / (ARMS.n - 1) });
  }
  return out;
}
const ARMSETS: Partial<Record<View, ReturnType<typeof makeBigArmArt>>> = {};
export function armsScene(view: View, t: number, base: Px, cx: number, cy: number, k = 1): Px {
  const { am, knight } = figures();
  const m = t - LEAD;
  const B = before([0, 0], view, ARMS_FROM);
  const fig = m < 0 ? frameAt(am, view, 'stand', t) : m < ARMS_LONG ? frameAt(am, view, 'floorArms', m) : frameAt(am, view, 'stand', m - ARMS_LONG);
  const K0 = before(B, view, 4.0, view === 'front' ? -0.4 : 0.4);
  const out = before([0, 0], view, 1, 0.45);
  const away = Math.atan2(out[1], out[0]);
  const holes = armHoles(K0, away);
  // (the knight: still as it slams; as the crack opens under him he runs out between the arms, away from it, through the gap)
  const go = ARMS_HIT + ARMS.first - ARMS.warn + 0.08;
  const run = smooth((m - go) / 0.8);
  const K: [number, number] = [K0[0] + Math.cos(away) * 3.6 * run, K0[1] + Math.sin(away) * 3.6 * run];
  const px0 = floorOf(base);
  const at = onFloor(B[0], B[1], cx, cy, k);
  const ring = ringAt(B, view, m - ARMS_HIT, SLAM_RING.arms, cx, cy, k, 65);
  const g = new PxCtx(px0, 2 * k);
  const set = (ARMSETS[view] ??= makeBigArmArt(view));
  const stood: Stood[] = [standing(at, fig, { shadow: 30 }), knightStood(knight, K, B, m > go && m < go + 0.8, t, cx, cy, k), ...ring.air];
  for (const h of holes) {
    const s = m - ARMS_HIT - h.up;
    // (its crack, as the game draws it: its warning stretched to ours)
    drawArmCrack(g as unknown as CanvasRenderingContext2D, gameAt(cx, cy, k), h.at[0], h.at[1], s < 0 ? (s * ARM_CRACK_WARN) / ARMS.warn : s, BIG_ARM_FRAMES / BIG_ARM_FPS);
    if (s >= 0 && s < BIG_ARM_FRAMES / BIG_ARM_FPS) {
      const sp = spriteLaid(set[Math.min(BIG_ARM_FRAMES - 1, Math.floor(s * BIG_ARM_FPS))]);
      stood.push(standing(onFloor(h.at[0], h.at[1], cx, cy, k), sp));
    }
  }
  void BIG_ARM_CANVAS;
  return shaken(compose(px0, [ring.floor], stood, k), shakeOf(m, [[ARMS_HIT, 5], ...holes.map((h) => [ARMS_HIT + h.up, 1.5] as const)]));
}
export const ARMS_PASS = LEAD + ARMS_HIT + ARMS.last + BIG_ARM_FRAMES / BIG_ARM_FPS + 0.3;

// ---------------------------------------------------------------------------------------------
// DEVOUR: reared, the cone marked; the rake; the knight dragged in; the bite

const DEVOUR_FROM = -2.4;
/** The cone it drags from (tiles before it, to either side at its far end), and where its maw is (tiles before it). */
export const CONE = { reach: 4.2, wide: 2.0, near: 1.0, maw: 1.15, pull: 3.6 } as const;
export function devourScene(view: View, t: number, base: Px, cx: number, cy: number, k = 1): Px {
  const { am, knight } = figures();
  const m = t - LEAD;
  const B = before([0, 0], view, DEVOUR_FROM);
  const fig = m < 0 ? frameAt(am, view, 'stand', t) : m < DEVOUR_LONG ? frameAt(am, view, 'devour', m) : frameAt(am, view, 'stand', m - DEVOUR_LONG);
  // (the knight in the cone, 3.3 tiles off; dragged in from the rake to its maw at CONE.pull a second; bitten; thrown back)
  const k0 = 3.3;
  let kf = k0;
  if (m > DRAG[0]) kf = Math.max(1.95, k0 - CONE.pull * (m - DRAG[0]));
  if (m > DEVOUR_HITS[1]) kf = 1.95 + 1.3 * smooth((m - DEVOUR_HITS[1]) / 0.3);
  const K = before(B, view, kf, view === 'front' ? 0.3 : -0.3);
  const px0 = floorOf(base);
  const hit0 = DEVOUR_HITS[0];
  if (m >= 0.5 && m < DRAG[1]) {
    const pts: [number, number][] = [before(B, view, CONE.near, 0.7), before(B, view, CONE.reach, CONE.wide), before(B, view, CONE.reach + 0.25, 0), before(B, view, CONE.reach, -CONE.wide), before(B, view, CONE.near, -0.7)];
    warnZone(px0, pts, clamp01((m - 0.5) / (hit0 - 0.5)), k, cx, cy);
  }
  // (the gouges its claws tear in the floor as it drags: the game's own)
  if (m > hit0) {
    const fade = 1 - clamp01((m - DEVOUR_LONG) / 1.0);
    for (const side of [1, -1]) {
      const pts: [number, number][] = [];
      for (let s = hit0; s <= Math.min(m, DRAG[1]); s += 1 / 30) {
        const u = clamp01((s - hit0) / (DRAG[1] - hit0));
        pts.push(before(B, view, 2.35 - 0.95 * u, side * (0.95 - 0.45 * u)));
      }
      drawClawRake(new PxCtx(px0, 2 * k) as unknown as CanvasRenderingContext2D, gameAt(cx, cy, k), pts, fade);
    }
  }
  const at = onFloor(B[0], B[1], cx, cy, k);
  const stood: Stood[] = [standing(at, fig, { shadow: 30 }), knightStood(knight, K, B, false, t, cx, cy, k)];
  return shaken(compose(px0, [], stood, k), shakeOf(m, [[hit0, 2.5], [DEVOUR_HITS[1], 3.5]]));
}
export const DEVOUR_PASS = LEAD + DEVOUR_LONG + 0.4;

// ---------------------------------------------------------------------------------------------
// A BONE MITE, CLOSE: a skull of the rain comes down and bursts; its bones pull together; it skitters at the knight, crouches and
// bites; he swings, and it bursts into chips. `view`: it seen from in front (coming at you) or from behind (going at him).

/** Its moments (seconds into the scene): the skull lands; it pulls itself together; it is off; it bites; he swings. */
export const MITE_CLOSE = { land: 0.6, run: 1.9, swing: 2.45, long: 3.35 } as const;
export function miteScene(view: View, t: number, base: Px, cx: number, cy: number, k = 1): Px {
  const { knight, mite } = figures();
  const m = t;
  const dir = ahead(view);
  // (the knight a little to the side of where it stops, so that both are seen: its bite reaches him, 0.67 tiles off)
  const Kp: [number, number] = [0, 0];
  const E: [number, number] = [-0.3, 0.6];
  const S: [number, number] = [E[0] - dir[0] * MITE_CLOSE.run, E[1] - dir[1] * MITE_CLOSE.run];
  const L = MITE_CLOSE.land;
  const formAt = L + RAIN.mite.at;
  const runAt = formAt + MITE.form;
  const stopAt = runAt + MITE_CLOSE.run / MITE.pace;
  const biteHit = stopAt + MITE.bite.hit;
  const swingHit = MITE_CLOSE.swing + SWING.hit;
  // the skull coming down, its shadow, its burst
  const d: Drop = { at: S, wave: 0, leave: -RAIN.fly, land: 0, from: [S[0] - 4, S[1] - 4], seed: 7 };
  const since = m - L;
  const floor: { at: [number, number]; l: Laid }[] = [];
  const stood: Stood[] = [];
  const C = DROP_CANVAS;
  const sAt = onFloor(S[0], S[1], cx, cy, k);
  if (since >= -RAIN.fly && since <= RAIN.mite.scuff) floor.push({ at: sAt, l: laid(dropPainted(since, 'floor', d.seed), C.ax, C.ay) });
  if (since >= -RAIN.fly && since < 0) {
    const set = (SKULLS[view] ??= makeRainSkullArt(view));
    const p = dropAt(d, 1 + since / RAIN.fly);
    const [x, y] = onFloor(p[0], p[1], cx, cy, k);
    const sp = spriteLaid(set[Math.floor(m * 2.2 * 8) % 8]);
    stood.push(standing([x, y], { ...sp, ay: sp.ay + p[2] * 2 }));
  } else if (since >= 0 && since < 0.8) stood.push(...airHalves(sAt, laid(dropPainted(since, 'air', d.seed, 'behind'), C.ax, C.ay), laid(dropPainted(since, 'air', d.seed, 'before'), C.ax, C.ay)));
  // the mite
  if (m >= formAt) {
    let P: [number, number] = S;
    let l: Laid;
    if (m >= swingHit) {
      P = E;
      l = deathAt(mite, view, m - swingHit);
    } else if (m < runAt) l = frameAt(mite, view, 'form', m - formAt);
    else if (m < stopAt) {
      const u = (m - runAt) * MITE.pace;
      P = [S[0] + dir[0] * u, S[1] + dir[1] * u];
      l = frameAt(mite, view, 'walk', m - runAt);
    } else {
      P = E;
      l = frameAt(mite, view, 'attack', Math.min(m - stopAt, MITE.bite.long));
    }
    if (m < swingHit + MITE.die) stood.push(standing(onFloor(P[0], P[1], cx, cy, k), l, { shadow: m >= swingHit ? 0 : 5 }));
  }
  // the knight: bitten (he flinches), then he swings
  const act = m >= MITE_CLOSE.swing ? { move: 'attack' as const, at: m - MITE_CLOSE.swing } : m >= biteHit && m < biteHit + REEL_LONG ? { move: 'reel' as const, at: m - biteHit } : undefined;
  stood.push(knightStood(knight, Kp, E, false, t, cx, cy, k, act));
  return shaken(compose(floorOf(base), floor, stood, k), shakeOf(m, [[L, 1]]));
}
