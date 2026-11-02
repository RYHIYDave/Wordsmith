// Pictures of FLOORS 16 TO 19'S MOBS' NEW MOVES, put together for the owner (the sheet, the film's frames): the Hushed gardener's hedge cut
// and the groom's whistle and his horse (art/action_f16_gardener.ts, art/action_f16_groom.ts) and the palace guard's thrust and drill
// (art/action_f16_guard.ts) on a stand-in for the Swan Gardens; the masked dancers' partner throw (art/action_f16_dancer.ts) on a stand-in
// for the masque's ballroom; the king's knight's rallying banner (art/action_f16_knight.ts) on a stand-in for the King's hall; with the
// knight, each figure at its floor point and sorted by it, as the game sorts them. Made outside a browser (tools/action_f16_film.ts,
// tools/action_f16_sheet.ts). Nothing of the game imports it. THE FLOORS ARE STAND-INS, in the floors' own colours.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import type { ActorArt } from '../art/actor_types';
import { hash } from '../art/kit';
import { makeHeroArt3 } from '../art/heroes3';
import type { Mob } from '../art/new_mobs3';
import { canvasOf, paintMob, deathOfMob } from '../art/new_mobs3';
import { CLIP_CANVAS, HEDGE, HEDGE_GARDENER, HEDGE_HITS, HEDGE_HIT, clippingsPainted, hedgeOn, scissorAt } from '../art/action_f16_gardener';
import { shearsOf } from '../art/palace_hands';
import { HORSE_CANVAS, LOOSE, MIST_CANVAS, WHISTLE_GROOM, WHISTLE_HIT, horseFormed, horseGone, horsePainted, lineOf, mistPainted } from '../art/action_f16_groom';
import { DRILL, DRILL_HITS, DRILL_PARTISAN, DRILL_SWORD, THRUST9, THRUST9_HIT, driveAt, thrustReach } from '../art/action_f16_guard';
import { THROW, THROW_GENT, THROW_HIT, THROW_LADY, THROW_STRIKE, LANE_LONG, topGone } from '../art/action_f16_dancer';
import { BANNER, BANNER_AT, BANNER_HIT, BANNER_KNIGHT, CLEAVE_KNIGHT, RALLY_CANVAS, STANDING_CANVAS, bannerPainted, rallyPainted } from '../art/action_f16_knight';
import { SMASH_CANVAS, lanePainted, smashPainted } from '../art/action_f6_golem';
import { markRing } from '../art/action_f6_fx';
import { skeletonAt } from '../art/new_mobs3';
import { compose, laid, onFloor } from './action_f1_scene';
import type { Stood } from './action_f1_scene';
import { frameAt } from './action_f3_scene';
import { hallFloor } from './king_scene';
import type { Laid } from './king_scene';

export type View = 'front' | 'back';
const smooth = (k: number): number => {
  const v = Math.max(0, Math.min(1, k));
  return v * v * (3 - 2 * v);
};
export const LEAD = 0.4;
export type Ground = 'garden' | 'ballroom' | 'hall';
const TILE = 39.19183588453085;

// ---------------------------------------------------------------------------------------------
// THE STAND-IN FLOORS

/** Floor 16, the Swan Gardens: a mown lawn in stripes, a gravel walk (art/swangardens.ts's greens and its pale gravel). */
const LAWN = ['#1f3220', '#27402a', '#2f4c30', '#3a5a38', '#4a6c44'];
const GRAVEL = ['#4a4640', '#5e5850', '#746c60', '#8a8274'];
/** Floor 17, the masque's ballroom: the blue room's floor, polished boards of a dark blue-black, a pale inlaid border. */
const BOARD = ['#141a2c', '#1a2238', '#202a44', '#283452'];
const INLAY = ['#6a6a7e', '#8a8aa0'];
export function standInFloor(which: Ground, w: number, h: number, cx: number, cy: number): Px {
  if (which === 'hall') return hallFloor(w, h, cx, cy, false);
  const px = new Px(w, h);
  for (let Y = 0; Y < h; Y++) {
    for (let X = 0; X < w; X++) {
      const a = (X + 0.5 - cx) / 32;
      const b = (Y + 0.5 - cy) / 16;
      const x = (a + b) / 2 + 40;
      const y = (b - a) / 2 + 40;
      const g = hash(X >> 1, Y >> 1, 8101);
      let c: string;
      if (which === 'garden') {
        // (the lawn mown in stripes along x; a gravel walk across it along y)
        const stripe = Math.floor(y * 0.9) % 2;
        c = stripe ? (g > 0.7 ? LAWN[3] : LAWN[2]) : g > 0.7 ? LAWN[2] : LAWN[1];
        if (hash(X, Y, 8103) > 0.93) c = LAWN[stripe ? 4 : 3];
        const walk = Math.abs(((x - 37.3) % 14 + 14) % 14 - 7);
        if (walk < 0.55) c = walk > 0.48 ? LAWN[0] : GRAVEL[Math.floor(hash(X, Y >> 1, 8105) * 4)];
      } else {
        // (polished boards along x, their seams dark, a sheen; an inlaid border of pale wood)
        const plank = Math.floor(y * 2.6);
        const seam = y * 2.6 - plank < 0.07;
        const tone = hash(plank, Math.floor(x * 0.5 + hash(plank, 1, 8107) * 4), 8109);
        c = seam ? BOARD[0] : tone > 0.6 ? BOARD[3] : tone > 0.3 ? BOARD[2] : BOARD[1];
        const inlay = Math.abs(((x - 38.5) % 8 + 8) % 8 - 4);
        if (inlay < 0.12) c = INLAY[g > 0.5 ? 1 : 0];
      }
      px.set(X, Y, c);
    }
  }
  return px;
}

// ---------------------------------------------------------------------------------------------
// THE FIGURES

let HERO: ActorArt | null = null;
const hero = (): ActorArt => (HERO ??= makeHeroArt3().of('warrior', { twoHanded: false }) as unknown as ActorArt);
/** A frame of one of them, painted at the moment (its floor point its anchor). */
export function frame(mob: Mob, move: string, t: number, view: View): Laid {
  const can = canvasOf(mob);
  return laid(move === 'dying' ? deathOfMob(mob, t / mob.dieTime, view) : paintMob(mob, move, t, view), can.ax, can.ay);
}
const longOf = (mob: Mob, move: string): number => {
  const mv = move === 'attack' ? mob.attack : mob.more?.[move];
  const k = mv?.motion.keys ?? [];
  return k.length ? k[k.length - 1].at : 0;
};
/** One doing a move from `start`, standing before and after it. */
function doing(mob: Mob, view: View, move: string, t: number, start: number): Laid {
  const m = t - start;
  const long = longOf(mob, move);
  if (m >= 0 && m <= long) return frame(mob, move, m, view);
  return frame(mob, 'stand', ((m < 0 ? t : m - long) % 2.4 + 2.4) % 2.4, view);
}
const ahead = (view: View): [number, number] => (view === 'front' ? [1, 0] : [0, -1]);
const rightOf = (view: View): [number, number] => (view === 'front' ? [0, 1] : [1, 0]);
/** Where a place `along` tiles before a figure and `aside` to its right is, on the scene. */
const placer = (view: View, cx: number, cy: number) => (along: number, aside = 0): [number, number] => {
  const [fx, fy] = ahead(view);
  const [sx, sy] = rightOf(view);
  return onFloor(fx * along + sx * aside, fy * along + sy * aside, cx, cy);
};
/** The floor's way (tiles) of a way before a figure and to its right. */
const wayOf = (view: View, along: number, aside: number): [number, number] => {
  const [fx, fy] = ahead(view);
  const [sx, sy] = rightOf(view);
  return [fx * along + sx * aside, fy * along + sy * aside];
};
const kViewOf = (view: View): View => (view === 'front' ? 'back' : 'front');
const copy = (base: Px): Px => {
  const p = new Px(base.w, base.h);
  p.d.set(base.d);
  return p;
};
const layLights = (px: Px, lights: Light[]): void => {
  for (const l of lights) {
    const [lr, lg, lb] = [parseInt(l.color.slice(1, 3), 16), parseInt(l.color.slice(3, 5), 16), parseInt(l.color.slice(5, 7), 16)];
    const r = Math.round(l.r);
    for (let y = Math.max(0, Math.round(l.y - r)); y < Math.min(px.h, Math.round(l.y + r)); y++) {
      for (let x = Math.max(0, Math.round(l.x - r)); x < Math.min(px.w, Math.round(l.x + r)); x++) {
        const d = Math.hypot(x - l.x, (y - l.y) * 1.3) / r;
        if (d >= 1) continue;
        const k = (Math.round((1 - d) * (l.a ?? 0) * 4) / 4) * 0.6;
        if (k <= 0) continue;
        const i = (y * px.w + x) * 4;
        px.d[i] = Math.min(255, px.d[i] + (lr - px.d[i] * 0.3) * k * 0.5);
        px.d[i + 1] = Math.min(255, px.d[i + 1] + (lg - px.d[i + 1] * 0.3) * k * 0.5);
        px.d[i + 2] = Math.min(255, px.d[i + 2] + (lb - px.d[i + 2] * 0.3) * k * 0.5);
      }
    }
  }
};
const shifted = (ls: Light[], dx: number, dy: number): Light[] => ls.map((l) => ({ ...l, x: l.x + dx, y: l.y + dy }));
/** The knight, struck: jolted a moment. */
function jolted(l: Laid, since: number): Laid {
  if (since < 0 || since > 0.25) return l;
  const k = Math.sin((since / 0.25) * Math.PI);
  return { ...l, ax: l.ax + Math.round(3 * k), ay: l.ay - Math.round(2 * k) };
}
type Floor = { at: [number, number]; l: Laid }[];
const put = (p: { px: Px }, C: { ax: number; ay: number }, P: [number, number], dy = 0): { at: [number, number]; l: Laid } => ({ at: [P[0], P[1] + dy], l: laid(p.px, C.ax, C.ay) });
const MARK = ['#7a1058', '#e0287a', '#3a0820'] as const;
function ringMark(r: number, k: number, spin = 0): Laid {
  const w = Math.ceil(r * 70 + 40);
  const mark = new Px(w * 2, w);
  markRing(mark, w, Math.round(w / 2), r, k, MARK, spin);
  return laid(mark, w, Math.round(w / 2));
}
/** A lane marked from `P` along the floor's way (dx, dy), `long` tiles, `half` to either side, `k` of it laid. */
function laneMark(P: [number, number], dx: number, dy: number, k: number, gone: number, long: number, half: number): { at: [number, number]; l: Laid } {
  // (lanePainted begins its marks 0.8 tiles from its anchor: anchored that far back)
  const l = lanePainted(dx, dy, k, gone + 0.8, long + 0.8, half);
  const A: [number, number] = [P[0] - 32 * (dx - dy) * 0.8, P[1] - 16 * (dx + dy) * 0.8];
  return { at: A, l: laid(l.px, l.ax, l.ay) };
}
/** The knight walking from (a0, s0) to (a1, s1) between `t0` and `t1`. */
function walker(t: number, t0: number, t1: number, a0: number, s0: number, a1: number, s1: number): { a: number; s: number; moving: boolean } {
  const k = smooth((t - t0) / (t1 - t0));
  return { a: a0 + (a1 - a0) * k, s: s0 + (s1 - s0) * k, moving: t > t0 && t < t1 };
}

// ---------------------------------------------------------------------------------------------
// FLOOR 16: THE GARDENER'S HEDGE CUT: three snips stepping in, the last a leap; the blades scissored into the lawn

const G_AT = -2.0;
export const HEDGE_PASS = LEAD + HEDGE.long + 0.6;
export function hedgeScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const at = placer(view, cx, cy);
  const m = t - LEAD;
  const [sx, sy] = scissorAt();
  // the knight backs off from each snip, and is caught at the edge of the leap's burst
  const back = m < 0.5 ? 0 : m < 0.75 ? smooth((m - 0.5) / 0.25) * 0.5 : m < 1.0 ? 0.5 : m < 1.3 ? 0.5 + smooth((m - 1.0) / 0.3) * 0.5 : 1.0;
  const moving = (m > 0.5 && m < 0.75) || (m > 1.0 && m < 1.3);
  const K = at(G_AT + 2.0 + back, 0.2);
  const F = at(G_AT);
  const kv = kViewOf(view);
  let kl = frameAt(hero(), kv, moving ? 'walk' : 'stand', t);
  kl = jolted(kl, m - HEDGE_HIT);
  const done = m > HEDGE.long;
  const stood: Stood[] = [
    { at: done ? at(G_AT + HEDGE.travel) : F, l: doing(HEDGE_GARDENER, view, 'attack', t, LEAD), shadow: 0 },
    { at: K, l: kl, flip: K[0] > F[0], shadow: 9 },
  ];
  const floor: Floor = [];
  const on = m >= 0 && m <= HEDGE.long ? hedgeOn(m) : m > HEDGE.long ? HEDGE.travel : 0;
  floor.push({ at: at(G_AT + on), l: laid(shadowOf(11), 14, 7) });
  const lights: Light[] = [];
  // (the leap's reach marked as he crouches with the shears over his hat)
  if (m > HEDGE.crouch - 0.2 && m < HEDGE_HIT) floor.push({ at: at(G_AT + sx, -sy), l: ringMark(HEDGE.r, smooth((m - HEDGE.crouch + 0.2) / 0.3), t * 0.4) });
  // a spray of cut grass where each snip shuts, and the burst where the blades go in
  for (const [i, h] of HEDGE_HITS.entries()) {
    if (m < h) continue;
    const big = i === 2 ? 1 : 0.4;
    const P = i === 2 ? at(G_AT + sx, -sy) : ((): [number, number] => {
      const k = shearsOf(skeletonAt(HEDGE_GARDENER, 'attack', h));
      return at(G_AT + k.mid[0] / TILE, -k.mid[1] / TILE);
    })();
    const C = CLIP_CANVAS;
    if (i === 2) floor.push(put(clippingsPainted(m - h, 'floor', 'all', big), C, P));
    stood.push(put(clippingsPainted(m - h, 'air', 'behind', big), C, P, -0.5));
    stood.push(put(clippingsPainted(m - h, 'air', 'before', big), C, P, 0.5));
    lights.push(...shifted(clippingsPainted(m - h, 'air', 'all', big).lights, P[0] - C.ax, P[1] - C.ay));
  }
  const px = compose(copy(base), floor, stood);
  layLights(px, lights);
  return px;
}
function shadowOf(r: number): Px {
  const p = new Px(28, 14);
  for (let j = -6; j <= 6; j++) for (let i = -13; i <= 13; i++) if ((i / r) ** 2 + (j / (r * 0.42)) ** 2 <= 1 && ((i + j) & 1) === 0) p.set(14 + i, 7 + j, '#0a080e');
  return p;
}

// ---------------------------------------------------------------------------------------------
// THE GROOM'S WHISTLE AND THE HORSE: the whistle held, the line marked; the horse out of the mist behind him, down the line, gone

const W_AT = -3.2;
const WK_AT = 3.6;
export function whistleTimes(): { hit: number; gone: number } {
  return { hit: LEAD + WHISTLE_HIT, gone: LEAD + WHISTLE_HIT + LOOSE.lane / LOOSE.pace };
}
export const WHISTLE_PASS = whistleTimes().gone + 0.5;
/** `struck`: the knight stands where he is and the horse runs him down; else he gets out of the line as it is marked. */
export function whistleScene(view: View, t: number, base: Px, cx: number, cy: number, struck = true): Px {
  const at = placer(view, cx, cy);
  const { hit } = whistleTimes();
  const m = t - LEAD;
  // (the line through where he stood as the whistle began)
  const L = lineOf(WK_AT - W_AT, 0);
  const k = struck ? walker(t, 99, 100, WK_AT, 0, WK_AT, 0) : walker(t, LEAD + 0.4, LEAD + 0.85, WK_AT, 0, WK_AT + 0.2, 2.4);
  const K = at(k.a, k.s);
  const Gp = at(W_AT);
  const kv = kViewOf(view);
  let kl = frameAt(hero(), kv, k.moving ? 'walk' : 'stand', k.moving ? t * 1.6 : t);
  const tHorse = t - hit;
  // (where it is: tiles before the groom and to his left, down the line)
  const hAt = (u: number): [number, number] => [L.x0 + L.dx * horseGone(u), L.y0 + L.dy * horseGone(u)];
  if (struck) {
    const reach = (WK_AT - W_AT - L.x0) / L.dx / LOOSE.pace;
    kl = jolted(kl, tHorse - reach);
  }
  const stood: Stood[] = [
    { at: Gp, l: doing(WHISTLE_GROOM, view, 'attack', t, LEAD), shadow: 10 },
    { at: K, l: kl, flip: K[0] > Gp[0], shadow: 9 },
  ];
  const floor: Floor = [];
  const lights: Light[] = [];
  const S = at(W_AT + L.x0, -L.y0);
  const [ddx, ddy] = wayOf(view, L.dx, -L.dy);
  if (m > LOOSE.aim - 0.05 && tHorse < LOOSE.lane / LOOSE.pace + 0.2) floor.push(laneMark(S, ddx, ddy, smooth((m - LOOSE.aim + 0.05) / 0.3), tHorse > 0 ? horseGone(tHorse) : 0, LOOSE.lane, LOOSE.half));
  if (tHorse >= 0 && tHorse <= LOOSE.lane / LOOSE.pace) {
    const [hx, hy] = hAt(tHorse);
    const H = at(W_AT + hx, -hy);
    const pic = horsePainted(tHorse, view, horseFormed(tHorse));
    // (it faces down the line: drawn turned the way it goes)
    const flip = view === 'front' ? ddy > ddx * 0.6 && false : false;
    stood.push({ at: H, l: laid(pic.px, HORSE_CANVAS.ax, HORSE_CANVAS.ay), flip, shadow: 0 });
    floor.push({ at: H, l: laid(shadowOf(13), 14, 7) });
    lights.push(...shifted(pic.lights, H[0] - HORSE_CANVAS.ax, H[1] - HORSE_CANVAS.ay));
  }
  // the mist it bursts out of, and that it goes into
  if (tHorse >= 0 && tHorse < 0.9) stood.push(put(mistPainted(tHorse), MIST_CANVAS, S, 0.2));
  const endT = (LOOSE.lane - LOOSE.fade * 0.6) / LOOSE.pace;
  if (tHorse >= endT && tHorse < endT + 0.9) {
    const [ex, ey] = hAt(endT);
    stood.push(put(mistPainted(tHorse - endT), MIST_CANVAS, at(W_AT + ex, -ey), 0.2));
  }
  const px = compose(copy(base), floor, stood);
  layLights(px, lights);
  return px;
}

// ---------------------------------------------------------------------------------------------
// THE PALACE GUARD'S THRUST, BY MOVEMENT 9: the line marked as it is drawn back and held; the lunge

const T_AT = -1.6;
export const THRUST_PASS = LEAD + THRUST9.long + 0.4;
export function thrustScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const at = placer(view, cx, cy);
  const m = t - LEAD;
  const mob = DRILL_PARTISAN;
  const [rx] = thrustReach(mob);
  const K = at(T_AT + rx + 0.3, 0.1);
  const Gp = at(T_AT);
  const kv = kViewOf(view);
  const kl = jolted(frameAt(hero(), kv, 'stand', t), m - THRUST9_HIT);
  const stood: Stood[] = [
    { at: Gp, l: doing(mob, view, 'attack', t, LEAD), shadow: 13 },
    { at: K, l: kl, flip: K[0] > Gp[0], shadow: 9 },
  ];
  const floor: Floor = [];
  const [dx, dy] = ahead(view);
  if (m > 0.15 && m < THRUST9_HIT + 0.1) floor.push(laneMark(at(T_AT + 0.2), dx, dy, smooth((m - 0.15) / 0.3), 0, rx + THRUST9.more - 0.2, THRUST9.half));
  return compose(copy(base), floor, stood);
}

// ---------------------------------------------------------------------------------------------
// THE DRILL: the chop's strip, the spin's ring, the drive's shockwave, each marked as it is held

const D_AT = -1.2;
export const DRILL_PASS = LEAD + DRILL.long + 0.5;
export function drillScene(view: View, t: number, base: Px, cx: number, cy: number, mob: Mob = view === 'front' ? DRILL_PARTISAN : DRILL_SWORD): Px {
  const at = placer(view, cx, cy);
  const m = t - LEAD;
  const [dx0, dy0] = driveAt(mob);
  // the knight: out of the chop's strip and the spin's ring, he steps in after the spin, and the shockwave throws him
  const k = walker(t, LEAD + DRILL_HITS[1] + 0.2, LEAD + DRILL_HITS[1] + 0.7, 3.4, 0.4, 2.6, 0.9);
  const K = at(D_AT + k.a, k.s);
  const Gp = at(D_AT);
  const kv = kViewOf(view);
  const kl = jolted(frameAt(hero(), kv, k.moving ? 'walk' : 'stand', k.moving ? t * 1.6 : t), m - DRILL_HITS[2]);
  const stood: Stood[] = [
    { at: Gp, l: doing(mob, view, 'drill', t, LEAD), shadow: 13 },
    { at: K, l: kl, flip: K[0] > Gp[0], shadow: 9 },
  ];
  const floor: Floor = [];
  const lights: Light[] = [];
  const [dx, dy] = ahead(view);
  // (each blow's reach marked as it is held: the chop's strip; the spin's ring all round him; the drive's)
  if (m > DRILL.up - 0.15 && m < DRILL_HITS[0] + 0.05) floor.push(laneMark(at(D_AT + 0.2), dx, dy, smooth((m - DRILL.up + 0.15) / 0.3), 0, DRILL.chop.fwd[1] - 0.2, DRILL.chop.half));
  if (m > DRILL.wound - 0.15 && m < DRILL_HITS[1] + 0.05) floor.push({ at: Gp, l: ringMark(DRILL.spin, smooth((m - DRILL.wound + 0.15) / 0.3), t * 0.6) });
  const D = at(D_AT + dx0, -dy0);
  if (m > DRILL.raised - 0.2 && m < DRILL_HITS[2]) floor.push({ at: D, l: ringMark(DRILL.wave, smooth((m - DRILL.raised + 0.2) / 0.3), t * 0.6) });
  if (m >= DRILL_HITS[2]) {
    const u = m - DRILL_HITS[2];
    const C = SMASH_CANVAS;
    floor.push(put(smashPainted(u, 'floor', DRILL.wave, true), C, D));
    stood.push(put(smashPainted(u, 'air', DRILL.wave, true, 'behind'), C, D, -0.5));
    stood.push(put(smashPainted(u, 'air', DRILL.wave, true, 'before'), C, D, 0.5));
    lights.push(...shifted(smashPainted(u, 'air', DRILL.wave, true).lights, D[0] - C.ax, D[1] - C.ay));
  }
  const px = compose(copy(base), floor, stood);
  layLights(px, lights);
  return px;
}

// ---------------------------------------------------------------------------------------------
// FLOOR 17: THE PARTNER THROW: the pair whirl round, the lane marked from her place; she is flung spinning down it

const P_AT = -3.4;
export function throwTimes(): { rel: number; stops: number } {
  return { rel: LEAD + THROW_STRIKE[0], stops: LEAD + THROW_STRIKE[0] + THROW.stop };
}
export const THROW_PASS = LEAD + THROW.lady + 0.4;
/** `struck`: the knight stands on the lane and she spins into him; else he steps off it as it is marked. */
export function throwScene(view: View, t: number, base: Px, cx: number, cy: number, struck = true): Px {
  const at = placer(view, cx, cy);
  const m = t - LEAD;
  const { rel } = throwTimes();
  const KA = 4.0;
  const k = struck ? walker(t, 99, 100, KA, THROW.r, KA, THROW.r) : walker(t, LEAD + 0.5, LEAD + 0.95, KA, THROW.r, KA + 0.2, THROW.r + 2.2);
  const K = at(P_AT + k.a, k.s);
  const Gp = at(P_AT);
  // her floor point: at his right as they begin; carried down the lane from the fling
  const run = t >= rel ? topGone(t - rel) : 0;
  const Lp = at(P_AT + run, THROW.r);
  const kv = kViewOf(view);
  let kl = frameAt(hero(), kv, k.moving ? 'walk' : 'stand', k.moving ? t * 1.6 : t);
  if (struck) {
    // (when she reaches him)
    let reach = 0;
    for (let u = 0; u < THROW.stop; u += 1 / 60) if (topGone(u) >= KA - 0.6) {
      reach = u;
      break;
    }
    kl = jolted(kl, t - rel - reach);
  }
  // (she is laid at her floor point, but sorted where her middle truly is as she is swung round him)
  const ladyL = doing(THROW_LADY, view, 'attack', t, LEAD);
  const sk = m >= 0 && m <= THROW.lady ? skeletonAt(THROW_LADY, 'attack', m) : null;
  const [ox, oy] = sk ? [sk.pelvis[0] / TILE, sk.pelvis[1] / TILE] : [0, 0];
  const trueAt = at(P_AT + run + ox, THROW.r - oy);
  const stood: Stood[] = [
    { at: Gp, l: doing(THROW_GENT, view, 'attack', t, LEAD), shadow: 10 },
    { at: trueAt, l: { px: ladyL.px, ax: ladyL.ax + Math.round(trueAt[0] - Lp[0]), ay: ladyL.ay + Math.round(trueAt[1] - Lp[1]) }, shadow: 0 },
    { at: K, l: kl, flip: K[0] > Gp[0], shadow: 9 },
  ];
  const floor: Floor = [{ at: trueAt, l: laid(shadowOf(10), 14, 7) }];
  const [dx, dy] = ahead(view);
  if (m > THROW.take - 0.05 && t < rel + THROW.stop + 0.3) floor.push(laneMark(at(P_AT, THROW.r), dx, dy, smooth((m - THROW.take + 0.05) / 0.35), run, LANE_LONG, THROW.half));
  return compose(copy(base), floor, stood);
}

// ---------------------------------------------------------------------------------------------
// FLOOR 19: THE RALLYING BANNER: drawn off his back, held aloft, driven into the floor; its shockwave; its gold reach; cut down

const B_AT = -2.0;
export const BANNER_STANDS = LEAD + BANNER_HIT;
/** The banner's own times in the scene: when the knight strikes it, and cuts it down (`cutAt` < 0: never, in this pass). */
export function bannerScene(view: View, t: number, base: Px, cx: number, cy: number, cutAt = -1): Px {
  const at = placer(view, cx, cy);
  const m = t - LEAD;
  const Kp = at(B_AT);
  const Bp = at(B_AT + BANNER_AT[0], -BANNER_AT[1]);
  // the knight: out beyond the shockwave as it is planted; then in to the banner and cutting it down
  const cutting = cutAt > 0;
  const k = cutting ? walker(t, cutAt - 1.1, cutAt - 0.45, 3.4, -0.6, B_AT + BANNER_AT[0] + 0.75, -BANNER_AT[1] + 0.35) : walker(t, 99, 100, 2.6, -0.4, 2.6, -0.4);
  const K = at(k.a, k.s);
  const kv = kViewOf(view);
  let kl: Laid;
  const swing = t - (cutAt - 0.4);
  if (cutting && swing >= 0 && swing < 0.9) {
    const set = (kv === 'front' ? hero().front : hero().back).clips?.attack;
    kl = set ? frameAt(hero(), kv, 'attack', Math.min(swing, (set.frames.length - 1) / set.fps)) : frameAt(hero(), kv, 'stand', t);
  } else kl = frameAt(hero(), kv, k.moving ? 'walk' : 'stand', k.moving ? t * 1.6 : t);
  if (!cutting) kl = jolted(kl, m - BANNER_HIT);
  const stood: Stood[] = [
    // (after it, the knight without his banner: it stands in the floor)
    { at: Kp, l: m > longOf(BANNER_KNIGHT, 'banner') ? frame(CLEAVE_KNIGHT, 'stand', ((m - longOf(BANNER_KNIGHT, 'banner')) % 3.2), view) : doing(BANNER_KNIGHT, view, 'banner', t, LEAD), shadow: 0 },
    { at: K, l: kl, flip: K[0] > Kp[0], shadow: 9 },
  ];
  const floor: Floor = [];
  const lights: Light[] = [];
  floor.push({ at: Kp, l: laid(shadowOf(13), 14, 7) });
  if (m >= BANNER_HIT) {
    const u = m - BANNER_HIT;
    const cutU = cutting ? t - cutAt : -1;
    const C = RALLY_CANVAS;
    const fl = rallyPainted(u, 'floor', cutU);
    floor.push(put(fl, C, Bp));
    lights.push(...shifted(fl.lights, Bp[0] - C.ax, Bp[1] - C.ay));
    const air = rallyPainted(u, 'air', cutU);
    stood.push(put(air, C, Bp, 0.6));
    lights.push(...shifted(air.lights, Bp[0] - C.ax, Bp[1] - C.ay));
    const struck = cutting && t > cutAt - 0.3 && t < cutAt ? t - (cutAt - 0.3) : -1;
    if (!(cutting && cutU > 1.6)) {
      const pic = bannerPainted(u, view, struck, cutU);
      stood.push({ at: [Bp[0], Bp[1] + 0.3], l: laid(pic.px, STANDING_CANVAS.ax, STANDING_CANVAS.ay) });
      lights.push(...shifted(pic.lights, Bp[0] - STANDING_CANVAS.ax, Bp[1] - STANDING_CANVAS.ay));
    }
  }
  const px = compose(copy(base), floor, stood);
  layLights(px, lights);
  return px;
}
void BANNER;

// ---------------------------------------------------------------------------------------------
// FLOOR 19: THE BANNER'S REACH FROM HIGHER UP (2 Nov, his pick “About twice, 7 tiles (Recommended)”): the king's knight plants it
// among his fellows; most of the fight is inside its gold ring; the hero, at its edge, steps back out of it and pulls one of them out

/** His fellows round him (tiles before the banner knight and to his right), king's knights, inside its reach. */
const FELLOWS: ReadonlyArray<readonly [number, number]> = [[3.4, 2.2], [-1.2, -3.0], [1.4, 4.4]];
export const RALLY_WIDE_PASS = LEAD + BANNER_HIT + 4.6;
export function bannerWideScene(t: number, base: Px, cx: number, cy: number): Px {
  const view: View = 'front';
  const at = placer(view, cx, cy);
  const m = t - LEAD;
  const Kp = at(B_AT);
  const BA: [number, number] = [B_AT + BANNER_AT[0], -BANNER_AT[1]];
  const Bp = at(BA[0], BA[1]);
  // the hero: inside the ring near its edge; after the plant he steps back out past it, and the nearest of them follows him out
  const h = walker(m, BANNER_HIT + 1.0, BANNER_HIT + 2.0, BA[0] + 5.4, BA[1] - 1.2, BA[0] + 8.4, BA[1] - 1.6);
  const H = at(h.a, h.s);
  const kv = kViewOf(view);
  const stood: Stood[] = [
    { at: Kp, l: m > longOf(BANNER_KNIGHT, 'banner') ? frame(CLEAVE_KNIGHT, 'stand', (m - longOf(BANNER_KNIGHT, 'banner')) % 3.2, view) : doing(BANNER_KNIGHT, view, 'banner', t, LEAD), shadow: 0 },
    { at: H, l: frameAt(hero(), kv, h.moving ? 'walk' : 'stand', h.moving ? t * 1.6 : t), flip: false, shadow: 9 },
  ];
  const floor: Floor = [{ at: Kp, l: laid(shadowOf(13), 14, 7) }];
  FELLOWS.forEach(([a, s], i) => {
    const out = i === 0 ? walker(m, BANNER_HIT + 1.4, BANNER_HIT + 3.0, a, s, BA[0] + 7.6, BA[1] - 0.4) : walker(m, 99, 100, a, s, a, s);
    const P = at(out.a, out.s);
    stood.push({ at: P, l: frame(CLEAVE_KNIGHT, out.moving ? 'walk' : 'stand', ((t + i * 0.7) % (out.moving ? 1.2 : 3.2)), view), flip: P[0] > H[0] ? true : false, shadow: 0 });
    floor.push({ at: P, l: laid(shadowOf(13), 14, 7) });
  });
  const lights: Light[] = [];
  if (m >= BANNER_HIT) {
    const u = m - BANNER_HIT;
    const C = RALLY_CANVAS;
    const fl = rallyPainted(u, 'floor');
    floor.push(put(fl, C, Bp));
    lights.push(...shifted(fl.lights, Bp[0] - C.ax, Bp[1] - C.ay));
    const air = rallyPainted(u, 'air');
    stood.push(put(air, C, Bp, 0.6));
    const pic = bannerPainted(u, view);
    stood.push({ at: [Bp[0], Bp[1] + 0.3], l: laid(pic.px, STANDING_CANVAS.ax, STANDING_CANVAS.ay) });
    lights.push(...shifted(pic.lights, Bp[0] - STANDING_CANVAS.ax, Bp[1] - STANDING_CANVAS.ay));
  }
  const px = compose(copy(base), floor, stood);
  layLights(px, lights);
  return px;
}
