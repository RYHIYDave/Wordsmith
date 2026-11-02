// Pictures of FLOORS 6 TO 8'S MOBS' NEW MOVES, put together for the owner (the sheet, the film's frames): the Firepot Thrower's big
// lob and the Chanter's chain lightning (art/action_f6_cult.ts) on a stand-in for floor 6's quarry floor, the quarry golem's boulder
// roll and hammer (art/action_f6_golem.ts) on the same, the canyon scorpion's acid spit and snap and the dust devil's twister
// (art/action_f6_canyon.ts) on a stand-in for floor 8's canyon sand; with the knight, each figure at its floor point and sorted by it,
// as the game sorts them. Made outside a browser (tools/action_f6_film.ts, tools/action_f6_sheet.ts). Nothing of the game imports it.
// THE FLOORS ARE STAND-INS, in the floors' own colours: the game's own grounds are the game's.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import type { ActorArt, Clip } from '../art/actor_types';
import { hash } from '../art/kit';
import { TILE3 } from '../art/new_mobs3';
import { makeHeroArt3 } from '../art/heroes3';
import { BLAZE, CAST_HIT, CHAIN, FIRE_CANVAS, LOB_HIT, RING_CANVAS, blazeFly, blazePainted, castFrom, chainOf, layChainBolt, lobFrom, makeBlazeThrowerArt, makeFlyingPotArt, makeLightningChanterArt, potShadowPainted, ringPainted } from '../art/action_f6_cult';
import { BOULDER, BOULDER_R, HAMMER, HAMMER_HIT, ROLL_HIT, ROLL_ROUND, SMASH_CANVAS, boulderGone, boulderHop, lanePainted, makeBoulderGolemArt, smashPainted } from '../art/action_f6_golem';
import { GLOB_CANVAS, POOL_CANVAS, SPIT, SPIT_HIT, SNAP9, SWIRL_CANVAS, TW, TW_HIT, globAt, globShadowPainted, layTwisterBolts, makeSpitScorpionArt, makeTwisterDevilArt, poolPainted, spitFly, spitFrom, swirlPainted } from '../art/action_f6_canyon';
import { markRing } from '../art/action_f6_fx';
import { compose, laid, onFloor } from './action_f1_scene';
import type { Stood } from './action_f1_scene';
import { frameAt } from './action_f3_scene';
import { spriteLaid } from './king_scene';
import type { Laid } from './king_scene';

export type View = 'front' | 'back';
const smooth = (k: number): number => {
  const v = Math.max(0, Math.min(1, k));
  return v * v * (3 - 2 * v);
};

// ---------------------------------------------------------------------------------------------
// THE STAND-IN FLOORS

/** Floor 6, the quarry: its cut flags and its rock (the floor's own colours, art/floor6.ts FLAG and ROCK), chisel-scored, chips of stone and dust lying. */
const QUARRY = ['#4a4452', '#5f5868', '#716a7a', '#837c8a', '#948d99', '#a59eaa'];
/** Floor 8, the canyon: its red sand and rock (art/floor8.ts RROCK, RBAND), ripples of wind in the sand, pebbles. */
const CANYON = ['#5a3e34', '#6a4838', '#7a5240', '#8a5c48', '#97664f', '#a4725a'];
export function standInFloor(which: 'quarry' | 'canyon', w: number, h: number, cx: number, cy: number): Px {
  const px = new Px(w, h);
  const tone = which === 'quarry' ? QUARRY : CANYON;
  for (let Y = 0; Y < h; Y++) {
    for (let X = 0; X < w; X++) {
      const a = (X + 0.5 - cx) / 32;
      const b = (Y + 0.5 - cy) / 16;
      const x = (a + b) / 2;
      const y = (b - a) / 2;
      let t = 2;
      if (which === 'quarry') {
        const row = Math.floor(y / 1.5);
        const col = Math.floor((x + (row % 2) * 0.75) / 1.5);
        const fx = (x + (row % 2) * 0.75) / 1.5 - col;
        const fy = y / 1.5 - row;
        const seam = fx < 0.02 || fy < 0.03;
        t = 2 + (hash(col, row, 6601) > 0.6 ? 1 : 0);
        if (Math.abs((((x * 7 + y * 3) % 1) + 1) % 1 - 0.5) < 0.04 && hash(col, row, 6603) > 0.5) t--; // chisel scores
        if (hash(X >> 1, Y >> 1, 6605) > 0.985) t = 4; // chips
        if (seam) t = 1;
      } else {
        const ripple = Math.sin((x + y * 0.4) * 5 + Math.sin(y * 1.3) * 1.5);
        t = 2 + (ripple > 0.7 ? 1 : ripple < -0.8 ? -1 : 0);
        if (hash(X >> 1, Y >> 1, 6607) > 0.988) t = 0; // pebbles
        if (hash(X >> 1, Y >> 1, 6609) > 0.992) t = 5;
      }
      px.set(X, Y, tone[Math.max(0, Math.min(5, t))]);
    }
  }
  return px;
}

// ---------------------------------------------------------------------------------------------
// THE FIGURES

let ART: { pots: ActorArt; chanter: ActorArt; golem: ActorArt; scorpion: ActorArt; devil: ActorArt; knight: ActorArt; mage: ActorArt; ranger: ActorArt } | null = null;
export function figures(): NonNullable<typeof ART> {
  if (!ART) {
    const heroes = makeHeroArt3();
    ART = {
      pots: makeBlazeThrowerArt(),
      chanter: makeLightningChanterArt(),
      golem: makeBoulderGolemArt(),
      scorpion: makeSpitScorpionArt(),
      devil: makeTwisterDevilArt(),
      knight: heroes.of('warrior', { twoHanded: false }) as unknown as ActorArt,
      mage: heroes.of('mage', { twoHanded: false }) as unknown as ActorArt,
      ranger: heroes.of('ranger', { twoHanded: false }) as unknown as ActorArt,
    };
  }
  return ART;
}
/** The way a figure faces on the floor: from in front, down-right (+x); from behind, up-right (-y); and its side (its right). */
const ahead = (view: View): [number, number] => (view === 'front' ? [1, 0] : [0, -1]);
const rightOf = (view: View): [number, number] => (view === 'front' ? [0, 1] : [1, 0]);
const placer = (view: View, cx: number, cy: number) => (along: number, aside = 0): [number, number] => {
  const [fx, fy] = ahead(view);
  const [sx, sy] = rightOf(view);
  return onFloor(fx * along + sx * aside, fy * along + sy * aside, cx, cy);
};
const clipLong = (art: ActorArt, move: string): number => {
  const c = (move === 'attack' ? art.front.clips?.attack : art.front.clips?.moves?.[move]) as Clip;
  return (c.frames.length - 1) / c.fps;
};
/** A figure doing a move from `start`, standing before and after it. */
function doing(art: ActorArt, view: View, move: string, t: number, start: number): Laid {
  const m = t - start;
  const long = clipLong(art, move);
  if (m >= 0 && m <= long) return frameAt(art, view, move, m);
  return frameAt(art, view, 'stand', m < 0 ? t : m - long);
}
/** The knight: standing, or running (as he goes from `a` to `b` aside between `t0` and `t1`); facing the foe. */
function knightAt(view: View, t: number, t0: number, t1: number, a: number, b: number): { aside: number; l: Laid } {
  const { knight } = figures();
  const u = smooth((t - t0) / (t1 - t0));
  const moving = t > t0 && t < t1;
  const kView: View = view === 'front' ? 'back' : 'front';
  return { aside: a + (b - a) * u, l: frameAt(knight, kView, moving ? 'walk' : 'stand', t) };
}
const copy = (base: Px): Px => {
  const p = new Px(base.w, base.h);
  p.d.set(base.d);
  return p;
};
const layLights = (px: Px, lights: Light[]): void => {
  // (a light's glow, laid as the game would: a soft lift of the pixels under it, in whole steps, toward its colour)
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

// ---------------------------------------------------------------------------------------------
// THE FIREPOT THROWER'S BIG LOB: whirled, held, slung high; its shadow on the floor; the whoosh; the floor burning; the knight gets out

export const LEAD = 0.4;
const T_AT = -2.6;
const TK_AT = 2.6;
export function lobTimes(): { start: number; loose: number; land: number; d: number } {
  const start = LEAD;
  const d = TK_AT - T_AT;
  const loose = start + LOB_HIT;
  return { start, loose, land: loose + blazeFly(d), d };
}
export const LOB_PASS = ((): number => lobTimes().land + 1.6)();
export function lobScene(view: View, t: number, base: Px, cx: number, cy: number, dodge = true): Px {
  const { pots } = figures();
  const { start, loose, land, d } = lobTimes();
  const at = placer(view, cx, cy);
  const kn = knightAt(view, t, loose + 0.15, loose + 0.7, 0, dodge ? -2.4 : 0);
  const T = at(T_AT);
  const K = at(TK_AT, kn.aside);
  const L = at(TK_AT);
  const floor: { at: [number, number]; l: Laid }[] = [];
  const stood: Stood[] = [
    { at: T, l: doing(pots, view, 'attack', t, start), shadow: 10 },
    { at: K, l: kn.l, flip: K[0] > T[0], shadow: 9 },
  ];
  const C = FIRE_CANVAS;
  const since = t - land;
  const lights: Light[] = [];
  if (t >= loose && t < land) {
    const u = (t - loose) / (land - loose);
    // (the reach of its burst marked where it will come down, filling as it comes)
    const mark = new Px(C.w, C.h);
    markRing(mark, C.ax, C.ay, BLAZE.r, u);
    floor.push({ at: L, l: laid(mark, C.ax, C.ay) });
    const [fx, fy] = [lobFrom()[0] / TILE3, lobFrom()[1] / TILE3];
    const along = fx + (d - fx) * u;
    const P = at(T_AT + along, -fy * (1 - u));
    floor.push({ at: P, l: laid(potShadowPainted(u), 30, 15) });
    const z0 = lobFrom()[2];
    const up = z0 * (1 - u) + 3 * u + 8 * (46 + 5 * d) * u * (1 - u);
    const fr = makeFlyingPotArt(view).frames;
    const sp = fr[Math.floor((t - loose) * 8 * BLAZE.spin) % fr.length];
    const l = spriteLaid(sp);
    stood.push({ at: [P[0], P[1] + 60], l: { ...l, ay: l.ay + 60 + up } });
  }
  if (since >= 0) {
    const fl = blazePainted(since, 'floor');
    floor.push({ at: L, l: laid(fl, C.ax, C.ay) });
    lights.push(...fl.lights.map((x) => ({ ...x, x: x.x - C.ax + L[0], y: x.y - C.ay + L[1] })));
    stood.push({ at: [L[0], L[1] - 0.5], l: laid(blazePainted(since, 'air', 'behind'), C.ax, C.ay) });
    stood.push({ at: [L[0], L[1] + 0.5], l: laid(blazePainted(since, 'air', 'before'), C.ax, C.ay) });
    const air = blazePainted(since, 'air');
    lights.push(...air.lights.map((x) => ({ ...x, x: x.x - C.ax + L[0], y: x.y - C.ay + L[1] })));
  }
  const px = compose(copy(base), floor, stood);
  layLights(px, lights);
  return px;
}

// ---------------------------------------------------------------------------------------------
// THE CHANTER'S CHAIN LIGHTNING: the book up, crackling; the ring under the knight; the strike; the jumps to two near him

const C_AT = -2.6;
const CK_AT = 1.8;
/** The two stand-ins near the knight (the game's mage and ranger: the knight fights alone, so these stand for anyone near him). */
const NEAR: ReadonlyArray<readonly [number, number]> = [[0.7, 1.7], [2.0, -0.2]];
export function chainTimes(): { start: number; aim: number; strike: number } {
  return { start: LEAD, aim: LEAD + CHAIN.aim, strike: LEAD + CAST_HIT };
}
export const CHAIN_PASS = ((): number => chainTimes().strike + 0.9)();
export function chainScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const { chanter, knight, mage, ranger } = figures();
  const { start, strike } = chainTimes();
  const at = placer(view, cx, cy);
  const Ch = at(C_AT);
  const who: [number, number][] = [[CK_AT, 0], [CK_AT + NEAR[0][0], NEAR[0][1]], [CK_AT + NEAR[1][0], NEAR[1][1]]];
  const kView: View = view === 'front' ? 'back' : 'front';
  const struckAt = (i: number): number => strike + i * CHAIN.every;
  // (each, struck, jolted a little back: the game's own struck clip for a hero is the rules'; here a jolt)
  const jolt = (i: number): number => {
    const s = t - struckAt(i);
    return s >= 0 && s < 0.25 ? 3 * Math.sin((s / 0.25) * Math.PI) : 0;
  };
  const arts = [knight, mage, ranger];
  const pts = who.map(([a, s]) => at(a, s));
  const stood: Stood[] = [{ at: Ch, l: doing(chanter, view, 'attack', t, start), shadow: 10 }];
  pts.forEach((p, i) => {
    const l = frameAt(arts[i], kView, 'stand', t + i * 0.3);
    stood.push({ at: p, l: { ...l, ax: l.ax + jolt(i) * (view === 'front' ? 1 : 1), ay: l.ay }, flip: p[0] > Ch[0], shadow: 9 });
  });
  const floor: { at: [number, number]; l: Laid }[] = [{ at: pts[0], l: laid(ringPainted(t - strike), RING_CANVAS.ax, RING_CANVAS.ay) }];
  const px = compose(copy(base), floor, stood);
  const lights: Light[] = [];
  // the lightning: from its book to the knight, then on through the chain
  const order = chainOf(who, 0);
  const [bx, by, bz] = castFrom();
  const [fx, fy] = ahead(view);
  const [sx, sy] = rightOf(view);
  const B = onFloor(fx * (C_AT + bx / TILE3) + sx * (-by / TILE3), fy * (C_AT + bx / TILE3) + sy * (-by / TILE3), cx, cy);
  const chest = 38;
  lights.push(...layChainBolt(px, B[0], B[1] - bz, pts[0][0], pts[0][1] - chest, t - strike, 1));
  for (let j = 1; j < order.length; j++) {
    const a = pts[order[j - 1]];
    const b = pts[order[j]];
    lights.push(...layChainBolt(px, a[0], a[1] - chest, b[0], b[1] - chest, t - struckAt(j), 1 + j));
  }
  layLights(px, lights);
  return px;
}

// ---------------------------------------------------------------------------------------------
// THE QUARRY GOLEM'S BOULDER ROLL: torn up, held overhead (the lane marked), bowled; it rolls, bounces, smashes; the knight gets out

const G_AT = -3.2;
const GK_AT = 1.8;
export function rollTimes(): { start: number; aim: number; loose: number; smash: number } {
  const start = LEAD;
  const loose = start + ROLL_HIT;
  return { start, aim: start + BOULDER.aim, loose, smash: loose + (BOULDER.long - BOULDER.from) / BOULDER.pace };
}
export const ROLL_PASS = ((): number => rollTimes().smash + 1.2)();
export function rollScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const { golem } = figures();
  const { start, aim, loose, smash } = rollTimes();
  const at = placer(view, cx, cy);
  const kn = knightAt(view, t, aim + 0.3, aim + 0.85, 0, -2.3);
  const G = at(G_AT);
  const K = at(GK_AT, kn.aside);
  const floor: { at: [number, number]; l: Laid }[] = [];
  const stood: Stood[] = [
    { at: G, l: doing(golem, view, 'throw', t, start), shadow: 26 },
    { at: K, l: kn.l, flip: K[0] > G[0], shadow: 9 },
  ];
  const [fx, fy] = ahead(view);
  if (t >= aim && t < smash + 0.2) {
    const gone = t > loose ? BOULDER.from + boulderGone(t - loose) : 0;
    const lane = lanePainted(fx, fy, smooth((t - aim) / 0.25), gone);
    floor.push({ at: G, l: laid(lane.px, lane.ax, lane.ay) });
  }
  if (t >= loose && t < smash) {
    const d = boulderGone(t - loose);
    const P = at(G_AT + BOULDER.from + d);
    const sh = new Px(80, 40);
    for (let j = -8; j <= 8; j++) for (let i = -20; i <= 20; i++) if ((i / 20) ** 2 + (j / 8) ** 2 < 1 && (i + j) % 2 === 0) sh.set(40 + i, 20 + j, '#0e0c24');
    floor.push({ at: P, l: laid(sh, 40, 20) });
    const fr = (view === 'front' ? golem.front : golem.back).clips?.moves?.rolling as Clip;
    const sp = fr.frames[Math.floor(((t - loose) / ROLL_ROUND) * fr.frames.length) % fr.frames.length];
    const l = spriteLaid(sp);
    const up = BOULDER_R + boulderHop(d) * 2;
    stood.push({ at: [P[0], P[1] + 1], l: { ...l, ay: l.ay + up } });
  }
  const S = at(G_AT + BOULDER.long);
  const lights: Light[] = [];
  if (t >= smash) {
    const since = t - smash;
    const C = SMASH_CANVAS;
    floor.push({ at: S, l: laid(smashPainted(since, 'floor', BOULDER.r), C.ax, C.ay) });
    stood.push({ at: [S[0], S[1] - 0.5], l: laid(smashPainted(since, 'air', BOULDER.r, false, 'behind'), C.ax, C.ay) });
    stood.push({ at: [S[0], S[1] + 0.5], l: laid(smashPainted(since, 'air', BOULDER.r, false, 'before'), C.ax, C.ay) });
    lights.push(...smashPainted(since, 'air', BOULDER.r).lights.map((x) => ({ ...x, x: x.x - C.ax + S[0], y: x.y - C.ay + S[1] })));
  }
  const px = compose(copy(base), floor, stood);
  layLights(px, lights);
  return px;
}
/** THE HAMMER: the knight a step out of its reach, then back. */
export const HAMMER_PASS = LEAD + HAMMER.long + 0.5;
export function hammerScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const { golem, knight } = figures();
  const at = placer(view, cx, cy);
  const G = at(-1.2);
  const hit = LEAD + HAMMER_HIT;
  const kView: View = view === 'front' ? 'back' : 'front';
  const back = smooth((t - LEAD - 0.5) / 0.35) * 0.9;
  const K = at(-1.2 + HAMMER.at + HAMMER.r + 0.3 + back, 0.6);
  const floor: { at: [number, number]; l: Laid }[] = [];
  const stood: Stood[] = [
    { at: G, l: doing(golem, view, 'attack', t, LEAD), shadow: 26 },
    { at: K, l: frameAt(knight, kView, t > LEAD + 0.5 && t < LEAD + 0.85 ? 'walk' : 'stand', t), flip: K[0] > G[0], shadow: 9 },
  ];
  const Q = at(-1.2 + HAMMER.at);
  const C = SMASH_CANVAS;
  if (t >= hit) {
    floor.push({ at: Q, l: laid(smashPainted(t - hit, 'floor', HAMMER.r, true), C.ax, C.ay) });
    stood.push({ at: [Q[0], Q[1] + 0.5], l: laid(smashPainted(t - hit, 'air', HAMMER.r, true, 'before'), C.ax, C.ay) });
  } else if (t > LEAD + 0.45) {
    // (its reach marked as it holds its fists up: the game's red circle, in the enemy's pink here)
    const mark = new Px(C.w, C.h);
    markRing(mark, C.ax, C.ay, HAMMER.r, smooth((t - LEAD - 0.45) / 0.3));
    floor.push({ at: Q, l: laid(mark, C.ax, C.ay) });
  }
  return compose(copy(base), floor, stood);
}

// ---------------------------------------------------------------------------------------------
// THE SCORPION'S ACID SPIT: cocked, dripping, held; spat high; the pool where the knight stood; the knight gets out

const S_AT = -2.2;
const SK_AT = 2.2;
export function spitTimes(): { start: number; spat: number; land: number; d: number } {
  const start = LEAD;
  const d = SK_AT - S_AT;
  const spat = start + SPIT_HIT;
  return { start, spat, land: spat + spitFly(d), d };
}
export const SPIT_PASS = ((): number => spitTimes().land + 2.0)();
export function spitScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const { scorpion } = figures();
  const { start, spat, land, d } = spitTimes();
  const at = placer(view, cx, cy);
  const kn = knightAt(view, t, spat + 0.12, spat + 0.6, 0, 2.2);
  const S = at(S_AT);
  const K = at(SK_AT, kn.aside);
  const L = at(SK_AT);
  const floor: { at: [number, number]; l: Laid }[] = [];
  const stood: Stood[] = [
    { at: S, l: doing(scorpion, view, 'spit', t, start), shadow: 14 },
    { at: K, l: kn.l, flip: K[0] > S[0], shadow: 9 },
  ];
  const C = POOL_CANVAS;
  const fly = land - spat;
  if (t >= spat) {
    floor.push({ at: L, l: laid(poolPainted(t - land, 'floor', 'all', SPIT.pool, fly), C.ax, C.ay) });
    stood.push({ at: [L[0], L[1] - 0.5], l: laid(poolPainted(t - land, 'air', 'behind'), C.ax, C.ay) });
    stood.push({ at: [L[0], L[1] + 0.5], l: laid(poolPainted(t - land, 'air', 'before'), C.ax, C.ay) });
  }
  if (t >= spat && t < land) {
    const u = (t - spat) / fly;
    const [along, z] = globAt(u, d);
    const P = at(S_AT + along, -(spitFrom()[1] / TILE3) * (1 - u));
    floor.push({ at: P, l: laid(globShadowPainted(u), 25, 13) });
    const fr = (view === 'front' ? scorpion.front : scorpion.back).clips?.moves?.glob as Clip;
    const l = spriteLaid(fr.frames[Math.floor((t - spat) * 18) % fr.frames.length]);
    stood.push({ at: [P[0], P[1] + 60], l: { ...l, ay: l.ay + 60 + z * 2 } });
  }
  void GLOB_CANVAS;
  return compose(copy(base), floor, stood);
}
/** THE SNAP: the knight a little out of its reach. */
export const SNAP_PASS = LEAD + SNAP9.long + 0.3;
export function snapScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const { scorpion, knight } = figures();
  const at = placer(view, cx, cy);
  const S = at(-1.0);
  const K = at(-1.0 + SNAP9.fwd[1] + 0.35, 0.3);
  const kView: View = view === 'front' ? 'back' : 'front';
  return compose(copy(base), [], [
    { at: S, l: doing(scorpion, view, 'attack', t, LEAD), shadow: 14 },
    { at: K, l: frameAt(knight, kView, 'stand', t), flip: K[0] > S[0], shadow: 9 },
  ]);
}

// ---------------------------------------------------------------------------------------------
// THE DUST DEVIL'S TWISTER: spun up, held; bursts up; wanders at the knight, dragging him, throwing lightning; collapses

const D_AT = -1.6;
const DK_AT = 1.4;
export const TWISTER_PASS = LEAD + TW.long + 0.3;
export function twisterScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const { devil, knight } = figures();
  const at = placer(view, cx, cy);
  const m = t - LEAD;
  // (the game carries it as it wanders: at TW.pace toward the knight, weaving, while it is the twister)
  const wander = m < TW_HIT ? 0 : Math.min(m, TW.until) - TW_HIT;
  const dAlong = D_AT + TW.pace * wander * 0.55;
  const dAside = 0.6 * Math.sin(wander * 2.2) * Math.min(1, wander);
  // the knight: dragged in a little as it bursts up, then runs out, off to his side and back
  const pull = smooth((m - TW_HIT - 0.1) / 0.5) * 0.45 - smooth((m - TW_HIT - 0.7) / 0.6) * 0.45;
  const kn = knightAt(view, t, LEAD + TW_HIT + 0.7, LEAD + TW_HIT + 1.6, 0, -2.6);
  const D = at(dAlong, dAside);
  const K = at(DK_AT - pull, kn.aside);
  const floor: { at: [number, number]; l: Laid }[] = [];
  if (m > 0) floor.push({ at: D, l: laid(swirlPainted(m), SWIRL_CANVAS.ax, SWIRL_CANVAS.ay) });
  const px = compose(copy(base), floor, [
    { at: D, l: doing(devil, view, 'attack', t, LEAD), shadow: 7 },
    { at: K, l: kn.l, flip: K[0] > D[0], shadow: 9 },
  ]);
  const lights = layTwisterBolts(px, D[0], D[1], m, 1, 0);
  layLights(px, lights);
  return px;
}
