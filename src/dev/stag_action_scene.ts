// Pictures of THE HOLLOW STAG DONE THE ACTION WAY, put together for the owner (the sheet, the film's frames): his great bounds round the
// clearing, standing to stare, his gore and his charge by Movement 9, and the wood closing in at 3/4, 1/2 and 1/4 of his life
// (art/stag_action.ts, STAG_ACTION; the clearing's wall and the marks, art/stag_action_fx.ts), on a stand-in for floor 9's pinewood
// floor (his arena an ellipse 17 by 20 tiles, the wood's dark beyond it), with the knight for size, each figure at its floor point and
// sorted by it, as the game sorts them. Made outside a browser (tools/stag_action_film.ts, tools/stag_action_sheet.ts). Nothing of the
// game imports it. THE FLOOR IS A STAND-IN, in the pinewood's own colours: the game's own ground is the game's.

import { Px } from '../engine/px';
import type { ActorArt } from '../art/actor_types';
import { makeHeroArt3 } from '../art/heroes3';
import { hash } from '../art/kit';
import { CHARGE9, CHARGE9_CARRIED, CHARGE9_HIT, CLOSE, CLOSE_HIT, GORE9, GORE9_HIT, LONG9, STARE, STOT9, charge9Carry, makeStagActionArt, stareCarry } from '../art/stag_action';
import { CLEARING, CLUMP9_CANVAS, WALL, outOf, paintEdgeMark, paintGoreMark, thrownIn, wallAt, wallClumpPainted, wallUp } from '../art/stag_action_fx';
import type { At } from '../art/stag_action_fx';
import { lanePainted } from '../art/action_f6_golem';
import { laid, onFloor } from './action_f1_scene';
import { frameAt } from './action_f3_scene';
import { lay, shadow } from './king_scene';
import type { Laid } from './king_scene';

export type View = 'front' | 'back';
type P2 = [number, number];
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (k: number): number => {
  const v = clamp01(k);
  return v * v * (3 - 2 * v);
};
const TAU = Math.PI * 2;
const BOUND = STOT9.bound;
/** His tiles a bound. */
export const BOUND_LONG = STOT9.pace * BOUND;
const HALF_DOWN = STOT9.down / 2;

// ---------------------------------------------------------------------------------------------
// THE FLOOR: the pinewood's earth and needles, moss and grass in tufts (art/pinewood.ts's colours); the wood's shadow beyond the
// clearing's edge, darker beyond the arena's own edge

const NEEDLE = ['#2a2017', '#3e3022', '#56432f', '#70583e', '#8c704d'];
const MOSSY = ['#2a3424', '#3a4a2e', '#4e6238'];
const GRASS = ['#40502c', '#536638', '#677a43'];
const SHADE = ['#120e0c', '#1a1510', '#221b14', '#2a2219'];
const DEEP = ['#08070a', '#0c0a0c', '#100d0e'];
const FLOORS = new Map<string, Px>();
/** The floor, `w` by `h` picture pixels, the clearing's middle at (cx, cy), the clearing `k` of the arena across. */
export function clearingFloor(w: number, h: number, cx: number, cy: number, k: number): Px {
  const key = `${w}x${h}@${cx},${cy}:${k}`;
  const had = FLOORS.get(key);
  if (had) return had;
  const px = new Px(w, h);
  for (let Y = 0; Y < h; Y++) {
    for (let X = 0; X < w; X++) {
      const a = (X + 0.5 - cx) / 32;
      const b = (Y + 0.5 - cy) / 16;
      const x = (a + b) / 2;
      const y = (b - a) / 2;
      const n1 = Math.sin(x * 2.9 + Math.sin(y * 2.3) * 1.5) + Math.sin(y * 2.6 - x * 1.1 + 1.3) + 0.6 * (hash(Math.floor(x * 3), Math.floor(y * 3), 6919) - 0.5);
      const g = hash(X >> 1, Y >> 1, 6901);
      const out = outOf(x, y, 1);
      const outK = outOf(x, y, k);
      let c: string;
      if (out > 1.0) c = DEEP[g > 0.7 ? 2 : g > 0.3 ? 1 : 0];
      else if (outK > 1.0) c = SHADE[n1 > 0.9 ? 3 : g > 0.6 ? 2 : 1];
      else {
        const stroke = hash((X + Y * 2) >> 2, Y >> 1, 6905) > 0.86;
        c = n1 > 0.9 ? MOSSY[g > 0.5 ? 2 : 1] : n1 < -1.1 ? NEEDLE[1] : NEEDLE[2];
        if (stroke) c = NEEDLE[g > 0.5 ? 3 : 1];
        if (g > 0.985) c = GRASS[(X + Y) % 3];
        if (hash(X >> 1, Y >> 1, 6907) > 0.993) c = NEEDLE[4];
        if (outK > 0.9 && g < (outK - 0.9) * 4) c = SHADE[3];
      }
      px.set(X, Y, c);
    }
  }
  FLOORS.set(key, px);
  return px;
}

// ---------------------------------------------------------------------------------------------
// THE FIGURES

let ART: { stag: ActorArt; knight: ActorArt } | null = null;
export function figures(): { stag: ActorArt; knight: ActorArt } {
  if (!ART) ART = { stag: makeStagActionArt(), knight: makeHeroArt3().of('warrior', { twoHanded: false }) as unknown as ActorArt };
  return ART;
}
/** How a figure is drawn facing a way on the floor (dx, dy): from in front if it faces down the picture, from behind if up it; flipped if it faces to the picture's left. */
export function drawnAs(dx: number, dy: number): { view: View; flip: boolean } {
  return { view: dx + dy >= 0 ? 'front' : 'back', flip: dx - dy < 0 };
}

// ---------------------------------------------------------------------------------------------
// HIS WAY ROUND THE CLEARING: bound after bound, each `BOUND_LONG` tiles, turning only as he lands

/** A run of bounds: where he lands at the middle of each landing, and the way he goes from it. */
export interface Run {
  pts: P2[];
  dirs: number[];
}
/**
 * HIS BOUNDS ROUND THE CLEARING (`k` of the arena across), from `from` going `h0` (radians on the floor), `n` of them: round the
 * clearing the way he is going, swinging in and out from its middle to near its edge (exploring), jinking one way and the other as he
 * lands, now and then cutting sharply across; never out past `margin` tiles inside its edge; homing on `to` (if given) over the last
 * few. The game's to play; this is how the pictures have him go, and the main chat's model.
 */
export function boundRun(from: P2, h0: number, n: number, k: number, seed: number, to?: P2): Run {
  const pts: P2[] = [from];
  const dirs: number[] = [];
  let h = h0;
  let side = 1;
  const margin = 1.3;
  const inside = (p: P2): boolean => {
    const r = Math.hypot(p[0], p[1]);
    const d = outOf(p[0], p[1], k);
    return d < 1 && (r === 0 || r * (1 / d - 1) >= margin);
  };
  let spin = 0;
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    // (round the clearing: the way along its edge he is going, swung in or out toward a ring that changes bound by bound)
    const ang = Math.atan2(p[1] / CLEARING.ry, p[0] / CLEARING.rx);
    if (i === 0) spin = Math.sin(h - Math.atan2(p[1], p[0])) >= 0 ? 1 : -1;
    const tan = Math.atan2(CLEARING.ry * Math.cos(ang) * spin, -CLEARING.rx * Math.sin(ang) * spin);
    const want = 0.45 + 0.35 * hash(i, 1, seed);
    const inOut = (outOf(p[0], p[1], k) - want) * 1.6;
    let goal = tan + spin * inOut;
    if (to && i >= n - 3) goal = Math.atan2(to[1] - p[1], to[0] - p[0]);
    // (a sharp cut across now and then; else a jink one way, then the other)
    const cut = !to && hash(i, 2, seed) > 0.82 ? spin * (1.1 + 0.6 * hash(i, 3, seed)) : 0;
    side = -side;
    const jink = side * (0.18 + 0.3 * hash(i, 4, seed));
    let d = goal + cut + jink - h;
    d = ((d + Math.PI) % TAU + TAU) % TAU - Math.PI;
    let next = h + Math.max(-2.2, Math.min(2.2, d));
    for (const turn of [0, 0.4, -0.4, 0.8, -0.8, 1.2, -1.2, 1.6, -1.6, 2.0, -2.0, 2.6, -2.6, Math.PI]) {
      const q: P2 = [p[0] + Math.cos(next + turn) * BOUND_LONG, p[1] + Math.sin(next + turn) * BOUND_LONG];
      if (inside(q)) {
        next += turn;
        break;
      }
    }
    h = next;
    dirs.push(h);
    pts.push([p[0] + Math.cos(h) * BOUND_LONG, p[1] + Math.sin(h) * BOUND_LONG]);
  }
  return { pts, dirs };
}

/** What he is doing at a moment: where (floor tiles), which way (radians), his move and how far into it. */
interface Doing {
  at: P2;
  h: number;
  move: string;
  m: number;
}
/** One of his acts in a scripted fight. */
type Act =
  | { kind: 'bounds'; t0: number; run: Run }
  | { kind: 'stare'; t0: number; at: P2; h: number }
  | { kind: 'attack' | 'close' | 'stand'; t0: number; at: P2; h: number; long?: number }
  | { kind: 'charge'; t0: number; at: P2; h: number };
const actLong = (a: Act): number =>
  a.kind === 'bounds' ? a.run.dirs.length * BOUND - HALF_DOWN : a.kind === 'stare' ? STARE.long : a.kind === 'stand' ? (a.long ?? 1) : LONG9[a.kind];
/** Where an act leaves him, and the way he faces. */
function actEnd(a: Act): { at: P2; h: number } {
  if (a.kind === 'bounds') {
    const n = a.run.dirs.length;
    const h = a.run.dirs[n - 1];
    const p = a.run.pts[n];
    // (it ends as he lands, half a landing before its middle)
    return { at: [p[0] - Math.cos(h) * STOT9.pace * HALF_DOWN, p[1] - Math.sin(h) * STOT9.pace * HALF_DOWN], h };
  }
  if (a.kind === 'stare') return { at: [a.at[0] + Math.cos(a.h) * stareCarry(STARE.long), a.at[1] + Math.sin(a.h) * stareCarry(STARE.long)], h: a.h };
  if (a.kind === 'charge') return { at: [a.at[0] + Math.cos(a.h) * CHARGE9_CARRIED, a.at[1] + Math.sin(a.h) * CHARGE9_CARRIED], h: a.h };
  return { at: a.at, h: a.h };
}
function doingIn(a: Act, t: number): Doing {
  const m = t - a.t0;
  if (a.kind === 'bounds') {
    const i = Math.max(0, Math.min(a.run.dirs.length - 1, Math.floor(m / BOUND)));
    const h = a.run.dirs[i];
    const p = a.run.pts[i];
    const s = m - i * BOUND;
    return { at: [p[0] + Math.cos(h) * STOT9.pace * s, p[1] + Math.sin(h) * STOT9.pace * s], h, move: 'walk', m };
  }
  if (a.kind === 'stare') return { at: [a.at[0] + Math.cos(a.h) * stareCarry(m), a.at[1] + Math.sin(a.h) * stareCarry(m)], h: a.h, move: 'stare', m };
  if (a.kind === 'charge') return { at: [a.at[0] + Math.cos(a.h) * charge9Carry(m), a.at[1] + Math.sin(a.h) * charge9Carry(m)], h: a.h, move: 'charge', m };
  return { at: a.at, h: a.h, move: a.kind, m };
}

// ---------------------------------------------------------------------------------------------
// THE WHOLE CLEARING FROM ABOVE: the fight's shape

/** The knight's way: where he is at moments (tiles), walking between. */
type Way = ReadonlyArray<readonly [number, number, number]>;
function knightOn(way: Way, t: number): { at: P2; moving: boolean } {
  if (t <= way[0][0]) return { at: [way[0][1], way[0][2]], moving: false };
  for (let i = 1; i < way.length; i++) {
    const [t1, x1, y1] = way[i];
    const [t0, x0, y0] = way[i - 1];
    if (t <= t1) {
      const u = smooth((t - t0) / (t1 - t0));
      const moving = Math.hypot(x1 - x0, y1 - y0) > 0.05 && u > 0.02 && u < 0.98;
      return { at: [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u], moving };
    }
  }
  const l = way[way.length - 1];
  return { at: [l[1], l[2]], moving: false };
}
interface Fight {
  acts: Act[];
  closes: { t0: number; k: number; from: number; at: P2 }[];
  knight: Way;
  /** When the knight is struck and thrown (seconds), and from where to where. */
  thrown: { t: number; from: P2; to: P2 }[];
  crash: { t: number; at: P2; k: number } | null;
  long: number;
  /** His life at the moments the wood closes in (for the bar). */
  life: (t: number) => number;
}
let FIGHT: Fight | null = null;
/** THE FIGHT'S SHAPE, scripted for the pictures (the game's to play). */
export function fight(): Fight {
  if (FIGHT) return FIGHT;
  const acts: Act[] = [];
  const closes: Fight['closes'] = [];
  let t = 0.2;
  let at: P2 = [-5.2, -4.6];
  let h = 0.2;
  const push = (a: Act): void => {
    acts.push(a);
    t = a.t0 + actLong(a);
    const e = actEnd(a);
    at = e.at;
    h = e.h;
  };
  const bounds = (n: number, k: number, seed: number, to?: P2): void => push({ kind: 'bounds', t0: t, run: boundRun(at, h, n, k, seed, to) });
  const toward = (p: P2): number => Math.atan2(p[1] - at[1], p[0] - at[0]);
  const close = (k: number): void => {
    closes.push({ t0: t, k, from: Math.atan2(at[1] / CLEARING.ry, at[0] / CLEARING.rx), at });
    push({ kind: 'close', t0: t, at, h });
  };
  // 1. round the whole clearing, and a stare at him
  bounds(8, 1, 11, [-0.8, -1.2]);
  push({ kind: 'stare', t0: t, at, h });
  const stare1 = acts[acts.length - 1];
  // 2. THE WOOD CLOSES IN, at 3/4 of his life: to 0.8
  close(0.8);
  const c1 = closes[0];
  // 3. bounding round the smaller clearing, then his gore at the knight
  bounds(5, 0.8, 23, [2.0, 1.6]);
  const goreAt = at;
  const goreH = toward([2.6, 3.2]);
  push({ kind: 'attack', t0: t, at, h: goreH });
  const gore = acts[acts.length - 1];
  // 4. THE WOOD CLOSES IN, at half his life: to 0.6
  close(0.6);
  const c2 = closes[1];
  // 5. bounds to the end of the clearing, and his charge down its length into the wall
  bounds(3, 0.6, 37, [0, -3.6]);
  // (down the clearing's length, the way that brings his antlers to the wall as he ends his run)
  const want = CHARGE9_CARRIED + 1.5;
  let chargeH = Math.PI / 2;
  let best = Infinity;
  for (let a = Math.PI / 2 - 1.2; a <= Math.PI / 2 + 1.2; a += 0.01) {
    const d = Math.abs(edgeDist(at, a, 0.6) - want);
    if (d < best) {
      best = d;
      chargeH = a;
    }
  }
  push({ kind: 'stand', t0: t, at, h: chargeH, long: 0.15 });
  const chargeFrom = at;
  push({ kind: 'charge', t0: t, at, h: chargeH });
  const charge = acts[acts.length - 1];
  // 6. back toward the middle, and THE WOOD CLOSES IN, at a quarter of his life: to 0.4; the knight caught by it, and thrown in
  bounds(2, 0.6, 41, [0.2, 0.0]);
  close(0.4);
  const c3 = closes[2];
  // 7. bounding in what is left, and staring
  bounds(4, 0.4, 53);
  push({ kind: 'stare', t0: t, at, h });
  const long = t + 0.3;
  // THE KNIGHT: watching from near the middle; as the first edge is marked he is near it, and gets in; he steps in to the gore's
  // reach and back out of it as it is held; he stands in the charge's lane and steps out of it; the last wall catches him
  const [gx, gy] = goreAt;
  const gk: P2 = [gx + Math.cos(goreH) * 2.2, gy + Math.sin(goreH) * 2.2];
  const gk2: P2 = [gx + Math.cos(goreH) * 3.6 + Math.cos(goreH + 1.2) * 0.4, gy + Math.sin(goreH) * 3.6 + Math.sin(goreH + 1.2) * 0.4];
  const laneK: P2 = [chargeFrom[0] + Math.cos(chargeH) * 4.2, chargeFrom[1] + Math.sin(chargeH) * 4.2];
  const caught: P2 = [2.7, 2.6];
  const throwTo = thrownIn(caught[0], caught[1], 0.4) ?? caught;
  const knight: Way = [
    [0, 4.6, 2.6],
    [stare1.t0, 4.6, 2.6],
    [c1.t0 + 0.35, 4.9, 3.4],
    [c1.t0 + 1.1, 3.4, 2.2],
    [gore.t0 - 1.2, 3.0, 2.0],
    [gore.t0 + 0.05, gk[0], gk[1]],
    [gore.t0 + 0.3, gk[0], gk[1]],
    [gore.t0 + 0.75, gk2[0], gk2[1]],
    [c2.t0 + 0.6, gk2[0], gk2[1]],
    [charge.t0 - 1.6, laneK[0], laneK[1]],
    [charge.t0 + CHARGE9.aim + 0.25, laneK[0], laneK[1]],
    [charge.t0 + CHARGE9.aim + 0.8, laneK[0] + 1.9, laneK[1] - 0.15],
    [c3.t0 - 0.6, caught[0], caught[1]],
    [c3.t0 + CLOSE_HIT, caught[0], caught[1]],
    [c3.t0 + CLOSE_HIT + 0.25, throwTo[0], throwTo[1]],
    [long, throwTo[0], throwTo[1]],
  ];
  const crashT = charge.t0 + CHARGE9.crash;
  const toWall = edgeDist(chargeFrom, chargeH, 0.6);
  const crashAt: P2 = [chargeFrom[0] + Math.cos(chargeH) * toWall, chargeFrom[1] + Math.sin(chargeH) * toWall];
  const lifeKeys: [number, number][] = [[0, 1], [c1.t0, 0.75], [c2.t0, 0.5], [c3.t0, 0.25], [long, 0.18]];
  const life = (tt: number): number => {
    for (let i = 1; i < lifeKeys.length; i++) if (tt <= lifeKeys[i][0]) return lifeKeys[i - 1][1] + (lifeKeys[i][1] - lifeKeys[i - 1][1]) * clamp01((tt - lifeKeys[i - 1][0]) / (lifeKeys[i][0] - lifeKeys[i - 1][0]));
    return lifeKeys[lifeKeys.length - 1][1];
  };
  FIGHT = { acts, closes, knight, thrown: [{ t: c3.t0 + CLOSE_HIT, from: caught, to: throwTo }], crash: { t: crashT, at: crashAt, k: 0.6 }, long, life };
  return FIGHT;
}
/** How far from `p` along the way `h` the clearing's edge is (at `k` across). */
function edgeDist(p: P2, h: number, k: number): number {
  let lo = 0;
  let hi = 30;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (outOf(p[0] + Math.cos(h) * m, p[1] + Math.sin(h) * m, k) < 1) lo = m;
    else hi = m;
  }
  return lo;
}
/** What he is doing at `t` seconds of the fight. */
export function stagIn(t: number): Doing {
  const F = fight();
  let a = F.acts[0];
  for (const b of F.acts) if (b.t0 <= t + 1e-9) a = b;
  if (t < a.t0) return { at: (a as { at?: P2 }).at ?? (a.kind === 'bounds' ? a.run.pts[0] : [0, 0]), h: a.kind === 'bounds' ? a.run.dirs[0] : (a as { h: number }).h, move: 'walk', m: 0 };
  return doingIn(a, t);
}
/** Which of the fight's acts are what (for the film's captions): their starts. */
export function fightMoments(): { closes: number[]; gore: number; charge: number; long: number; miss: number } {
  const F = fight();
  const ch = F.acts.find((a) => a.kind === 'charge') as Act & { at: P2; h: number };
  return { closes: F.closes.map((c) => c.t0), gore: (F.acts.find((a) => a.kind === 'attack') as Act).t0, charge: ch.t0, long: F.long, miss: edgeDist(ch.at, ch.h, 0.6) - CHARGE9_CARRIED };
}
/** The clearing (`k` across) and its wall at `t`: each ring's clumps with how long since they burst up, sank, or were splintered. */
function wallsAt(t: number): { k: number; rings: { k: number; s: (c: { a: number; x: number; y: number }) => number; gone: number; broken: (c: { x: number; y: number }) => number }[] } {
  const F = fight();
  let k = 1;
  const rings: ReturnType<typeof wallsAt>['rings'] = [{ k: 1, s: () => 5, gone: -1, broken: () => -1 }];
  F.closes.forEach((c, i) => {
    const R = c.t0 + CLOSE_HIT;
    if (t >= R) k = c.k;
    const next = F.closes[i + 1];
    const gone = next && t >= next.t0 + CLOSE_HIT + 0.3 ? t - (next.t0 + CLOSE_HIT + 0.3) : -1;
    if (gone > WALL.sink * 2) return;
    const crash = F.crash && F.crash.k === c.k ? F.crash : null;
    rings.push({
      k: c.k,
      s: (cl) => t - R - wallUp(cl.a, c.from),
      gone,
      broken: (cl) => (crash && t >= crash.t && Math.hypot(cl.x - crash.at[0], cl.y - crash.at[1]) < 1.3 ? t - crash.t : -1),
    });
  });
  return { k, rings };
}
const WALLS = new Map<number, ReturnType<typeof wallAt>>();
const wallOf = (k: number): ReturnType<typeof wallAt> => {
  let w = WALLS.get(k);
  if (!w) WALLS.set(k, (w = wallAt(k)));
  return w;
};
/** A frame shaken by a blow (a few pixels, dying away). */
function shaken(p: Px, d: P2): Px {
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
const shakeAt = (t: number, hits: ReadonlyArray<readonly [number, number]>): P2 => {
  let a = 0;
  for (const [at, amount] of hits) {
    const s = t - at;
    if (s >= 0 && s < 0.35) a = Math.max(a, amount * (1 - s / 0.35));
  }
  if (a < 0.5) return [0, 0];
  const f = Math.floor(t * 30);
  return [Math.round(a * (hash(f, 1, 977) - 0.5) * 2), Math.round(a * (hash(f, 2, 977) - 0.5) * 2)];
};
interface Standing {
  at: P2;
  l: Laid;
  flip?: boolean;
  shadow?: number;
}
/** Lay a scene: the floor, what is painted on it, the shadows, then what stands, from the top of the picture down. */
function layScene(base: Px, floor: (p: Px) => void, flat: { at: P2; l: Laid }[], stood: Standing[]): Px {
  const px = new Px(base.w, base.h);
  px.d.set(base.d);
  for (const f of flat) lay(px, f.l, f.at[0], f.at[1]);
  floor(px);
  for (const s of stood) if (s.shadow) shadow(px, s.at[0], s.at[1], s.shadow, 1);
  for (const s of [...stood].sort((a, b) => a.at[1] - b.at[1])) lay(px, s.l, s.at[0], s.at[1], 1, undefined, s.flip);
  return px;
}
/** The wall's clumps as they stand at `t` (and the ruts at their feet), on a scene whose clearing's middle is at (cx, cy). */
function wallStood(t: number, cx: number, cy: number, keep: (x: number, y: number) => boolean = () => true): { flat: { at: P2; l: Laid }[]; stood: Standing[] } {
  const C = CLUMP9_CANVAS;
  const flat: { at: P2; l: Laid }[] = [];
  const stood: Standing[] = [];
  for (const ring of wallsAt(t).rings) {
    for (const c of wallOf(ring.k)) {
      if (!keep(c.x, c.y)) continue;
      const s = ring.s(c);
      if (s < 0) continue;
      const P = onFloor(c.x, c.y, cx, cy);
      const br = ring.broken(c);
      if (ring.k < 1) flat.push({ at: P, l: laid(wallClumpPainted(c.kind, s, 'floor', ring.gone), C.ax, C.ay) });
      if (ring.gone < WALL.sink) stood.push({ at: P, l: laid(wallClumpPainted(c.kind, s, 'air', ring.gone, br), C.ax, C.ay) });
    }
  }
  return { flat, stood };
}
/** His life, as a bar over the picture (his name's place in the game is the game's): the enemy's pink, marked at 3/4, 1/2 and 1/4. */
function lifeBar(px: Px, life: number, x0: number, y0: number, w: number): void {
  for (let y = 0; y < 12; y++) for (let x = 0; x < w; x++) {
    const edge = y === 0 || y === 11 || x === 0 || x === w - 1;
    const fill = x < w * life;
    const notch = CLOSE.at.some((a) => Math.abs(x - Math.round(w * a)) < 1);
    px.set(x0 + x, y0 + y, edge ? '#0a0810' : notch ? '#f0e8d0' : fill ? (y < 4 ? '#ff7aa8' : '#e0287a') : '#2a1626');
  }
}
/** THE WHOLE CLEARING FROM ABOVE, `t` seconds into the fight: the game's own picture pixels, the clearing's middle at (cx, cy). */
export function arenaScene(t: number, w: number, h: number, cx: number, cy: number, opts: { bar?: boolean; path?: readonly [number, number] } = {}): Px {
  const F = fight();
  const { stag, knight } = figures();
  const walls = wallsAt(t);
  const base = clearingFloor(w, h, cx, cy, walls.k);
  const at: At = (x, y, z = 0) => {
    const [X, Y] = onFloor(x, y, cx, cy);
    return [X, Y - z];
  };
  const D = stagIn(t);
  const { view, flip } = drawnAs(Math.cos(D.h), Math.sin(D.h));
  const sl = D.move === 'stand' ? frameAt(stag, view, 'stand', t) : D.move === 'walk' ? frameAt(stag, view, 'walk', D.m) : frameAt(stag, view, D.move, D.m);
  const S = onFloor(D.at[0], D.at[1], cx, cy);
  const K = knightOn(F.knight, t);
  let kp = K.at;
  for (const th of F.thrown) if (t >= th.t && t < th.t + 0.25) kp = [th.from[0] + (th.to[0] - th.from[0]) * smooth((t - th.t) / 0.25), th.from[1] + (th.to[1] - th.from[1]) * smooth((t - th.t) / 0.25)];
  const KP = onFloor(kp[0], kp[1], cx, cy);
  const kv: View = KP[1] < S[1] ? 'front' : 'back';
  let kl = frameAt(knight, kv, K.moving ? 'walk' : 'stand', t);
  for (const th of F.thrown) {
    const s = t - th.t;
    if (s >= 0 && s < 0.35) kl = { ...kl, ay: kl.ay + Math.round(6 * Math.sin((s / 0.35) * Math.PI)) };
  }
  const ws = wallStood(t, cx, cy);
  const stood: Standing[] = [{ at: S, l: sl, flip, shadow: 16 }, { at: KP, l: kl, flip: KP[0] > S[0], shadow: 9 }, ...ws.stood];
  const flat = [...ws.flat];
  // his charge's lane
  for (const a of F.acts) {
    if (a.kind !== 'charge') continue;
    const m = t - a.t0;
    if (m < CHARGE9.aim || m > CHARGE9.crash + 0.2) continue;
    const lane = lanePainted(Math.cos(a.h), Math.sin(a.h), smooth((m - CHARGE9.aim) / 0.25), m > CHARGE9_HIT ? charge9Carry(m) + 0.8 : 0, CHARGE9.lane, CHARGE9.half);
    flat.push({ at: onFloor(a.at[0], a.at[1], cx, cy), l: laid(lane.px, lane.ax, lane.ay) });
  }
  const px = layScene(base, (p) => {
    for (const c of F.closes) paintEdgeMark(p, at, c.k, t - c.t0, c.from);
    for (const a of F.acts) if (a.kind === 'attack') paintGoreMark(p, at, t - a.t0, a.at, a.h);
    if (opts.path) drawPath(p, at, opts.path[0], opts.path[1]);
  }, flat, stood);
  if (opts.bar !== false) lifeBar(px, F.life(t), w - 330, 18, 300);
  const hits: [number, number][] = [];
  for (const c of F.closes) hits.push([c.t0 + CLOSE_HIT, 4]);
  for (const a of F.acts) if (a.kind === 'attack') hits.push([a.t0 + GORE9_HIT, 2]);
  if (F.crash) hits.push([F.crash.t, 5]);
  return shaken(px, shakeAt(t, hits));
}
/** His bounds as a path on the floor: a line of dots along each, a mark where each lands, those from `a` to `b` seconds (the sheet's). */
function drawPath(px: Px, at: At, a0: number, b0: number): void {
  const F = fight();
  const dot = (x: number, y: number, c: string): void => {
    const X = Math.round(x);
    const Y = Math.round(y);
    if (X >= 1 && Y >= 1 && X < px.w - 1 && Y < px.h - 1) px.set(X, Y, c);
  };
  for (const a of F.acts) {
    if (a.kind !== 'bounds' || a.t0 > b0 || a.t0 + actLong(a) < a0) continue;
    a.run.pts.forEach((p, i) => {
      if (i > 0) {
        const q = a.run.pts[i - 1];
        for (let u = 0; u <= 1; u += 0.02) {
          // (an arc: the bound in the air, its shadow's way on the floor dotted)
          if (Math.round(u * 50) % 2) continue;
          const [x, y] = at(q[0] + (p[0] - q[0]) * u, q[1] + (p[1] - q[1]) * u, 30 * 4 * u * (1 - u));
          dot(x, y, '#ffd36a');
          dot(x + 1, y, '#ffd36a');
          dot(x, y + 1, '#e0a040');
          dot(x + 1, y + 1, '#a06020');
        }
      }
      const [x, y] = at(p[0], p[1]);
      for (let j = -5; j <= 5; j++) {
        dot(x + j, y, '#ff7aa8');
        dot(x + j, y + 1, '#e0287a');
        dot(x, y + j / 2, '#ff7aa8');
        dot(x + 1, y + j / 2, '#e0287a');
      }
    });
  }
}

// ---------------------------------------------------------------------------------------------
// CLOSE: each move with the knight, from in front and from behind

export const LEAD = 0.4;
/** A floor point `fwd` tiles before him and `aside` to his right, him at the middle, facing as drawn `view`. */
const ahead = (view: View): P2 => (view === 'front' ? [1, 0] : [0, -1]);
const rightOf = (view: View): P2 => (view === 'front' ? [0, 1] : [1, 0]);
const placer = (view: View) => (fwd: number, aside = 0): P2 => {
  const [fx, fy] = ahead(view);
  const [sx, sy] = rightOf(view);
  return [fx * fwd + sx * aside, fy * fwd + sy * aside];
};
const kViewOf = (view: View): View => (view === 'front' ? 'back' : 'front');
function stagDoing(view: View, move: string, t: number, start: number): Laid {
  const { stag } = figures();
  const m = t - start;
  const long = LONG9[move as keyof typeof LONG9];
  if (m >= 0 && m <= long) return frameAt(stag, view, move, m);
  return frameAt(stag, view, 'stand', m < 0 ? t : m - long);
}
const floorAt = (cx: number, cy: number): At => (x, y, z = 0) => {
  const [X, Y] = onFloor(x, y, cx, cy);
  return [X, Y - z];
};

/** THE GORE: the knight walks in to his reach as his head goes down, and steps back out of the sweep while it is held. */
export const GORE_PASS = LEAD + GORE9.long + 0.3;
export function goreScene(view: View, t: number, w: number, h: number, cx: number, cy: number): Px {
  const { knight } = figures();
  const base = clearingFloor(w, h, cx, cy, 1);
  const P = placer(view);
  const m = t - LEAD;
  const back = smooth((m - 0.3) / 0.4);
  const K = P(2.0 + 1.9 * back, 0.7);
  const moving = m > 0.3 && m < 0.7;
  const S = onFloor(0, 0, cx, cy);
  const KP = onFloor(K[0], K[1], cx, cy);
  const aim = view === 'front' ? 0 : -Math.PI / 2;
  const px = layScene(base, (p) => paintGoreMark(p, floorAt(cx, cy), m, [0, 0], aim), [], [
    { at: S, l: stagDoing(view, 'attack', t, LEAD), shadow: 16 },
    { at: KP, l: frameAt(knight, kViewOf(view), moving ? 'walk' : 'stand', t), flip: KP[0] > S[0], shadow: 9 },
  ]);
  return shaken(px, shakeAt(m, [[GORE9_HIT, 2]]));
}

/** THE CHARGE: the lane marked through the knight; he steps out of it; the Stag bursts off, gallops down it and crashes into the wall at its end, splintering it. */
export const CHARGE_PASS = LEAD + CHARGE9.long + 0.2;
const C_FROM = -4.2;
export function chargeScene(view: View, t: number, w: number, h: number, cx: number, cy: number): Px {
  const { knight } = figures();
  const base = clearingFloor(w, h, cx, cy, 1);
  const P = placer(view);
  const m = t - LEAD;
  const [fx, fy] = ahead(view);
  const out = smooth((m - CHARGE9.aim - 0.25) / 0.5);
  const K = P(C_FROM + 4.6, -2.5 * out);
  const moving = m > CHARGE9.aim + 0.25 && m < CHARGE9.aim + 0.75;
  const D = P(C_FROM + (m > 0 ? charge9Carry(m) : 0));
  const S = onFloor(D[0], D[1], cx, cy);
  const KP = onFloor(K[0], K[1], cx, cy);
  // (a stretch of the wall across the lane's end, where his antlers meet it)
  const C = CLUMP9_CANVAS;
  const wallX = C_FROM + CHARGE9_CARRIED + 1.6;
  const crashT = CHARGE9.crash;
  const flat: { at: P2; l: Laid }[] = [];
  const stood: Standing[] = [
    { at: S, l: stagDoing(view, 'charge', t, LEAD), shadow: 16 },
    { at: KP, l: frameAt(knight, kViewOf(view), moving ? 'walk' : 'stand', t), flip: KP[0] > S[0], shadow: 9 },
  ];
  for (let j = -4; j <= 4; j++) {
    const q = P(wallX + 0.25 * Math.abs(j) * 0.4, j * WALL.step);
    const QP = onFloor(q[0], q[1], cx, cy);
    const br = m >= crashT && Math.abs(j) <= 1 ? m - crashT : -1;
    const kind = (j + 40) % WALL.kinds;
    flat.push({ at: QP, l: laid(wallClumpPainted(kind, 5, 'floor'), C.ax, C.ay) });
    stood.push({ at: QP, l: laid(wallClumpPainted(kind, 5, 'air', -1, br), C.ax, C.ay) });
  }
  if (m >= CHARGE9.aim && m < CHARGE9.crash + 0.2) {
    const lane = lanePainted(fx, fy, smooth((m - CHARGE9.aim) / 0.25), m > CHARGE9_HIT ? charge9Carry(m) + 0.8 : 0, CHARGE9.lane, CHARGE9.half);
    const L = P(C_FROM);
    flat.unshift({ at: onFloor(L[0], L[1], cx, cy), l: laid(lane.px, lane.ax, lane.ay) });
  }
  const px = layScene(base, () => {}, flat, stood);
  return shaken(px, shakeAt(m, [[crashT, 5]]));
}

/** THE WOOD CLOSES IN, close: the Stag in the middle of what is left of the clearing (the last stage, 0.4 across), the knight inside it; the edge marked; the wall bursting up all round. */
export const CLOSE_PASS = LEAD + CLOSE.long + 0.2;
export function closeScene(view: View, t: number, w: number, h: number, cx: number, cy: number, k = 0.4): Px {
  const { knight } = figures();
  const m = t - LEAD;
  const was = k === 0.4 ? 0.6 : k === 0.6 ? 0.8 : 1;
  const base = clearingFloor(w, h, cx, cy, m >= CLOSE_HIT ? k : was);
  const P = placer(view);
  const K = P(1.5, 0.9);
  const S = onFloor(0, 0, cx, cy);
  const KP = onFloor(K[0], K[1], cx, cy);
  const C = CLUMP9_CANVAS;
  const from = view === 'front' ? 0 : -Math.PI / 2;
  const flat: { at: P2; l: Laid }[] = [];
  const stood: Standing[] = [
    { at: S, l: stagDoing(view, 'close', t, LEAD), shadow: 16 },
    { at: KP, l: frameAt(knight, kViewOf(view), 'stand', t), flip: KP[0] > S[0], shadow: 9 },
  ];
  for (const [ring, s0, gone] of [[was, 5, m >= CLOSE_HIT + 0.3 ? m - CLOSE_HIT - 0.3 : -1], [k, -1, -1]] as const) {
    for (const c of wallOf(ring)) {
      const s = ring === k ? m - CLOSE_HIT - wallUp(c.a, Math.atan2(Math.sin(from) / CLEARING.ry, Math.cos(from) / CLEARING.rx)) : s0;
      if (s < 0 || gone >= WALL.sink) continue;
      const QP = onFloor(c.x, c.y, cx, cy);
      if (QP[0] < -60 || QP[0] > w + 60 || QP[1] < -20 || QP[1] > h + 130) continue;
      if (ring === k) flat.push({ at: QP, l: laid(wallClumpPainted(c.kind, s, 'floor'), C.ax, C.ay) });
      stood.push({ at: QP, l: laid(wallClumpPainted(c.kind, s, 'air', gone), C.ax, C.ay) });
    }
  }
  const px = layScene(base, (p) => paintEdgeMark(p, floorAt(cx, cy), k, m, Math.atan2(Math.sin(from) / CLEARING.ry, Math.cos(from) / CLEARING.rx)), flat, stood);
  return shaken(px, shakeAt(m, [[CLOSE_HIT, 4]]));
}

/** HIS BOUNDS, close: three great bounds across the floor, a heavy landing, and he stands to stare at the knight. */
export const BOUND_N = 2;
export const BOUND_PASS = LEAD + BOUND_N * BOUND - HALF_DOWN + STARE.long + 0.1;
export function boundScene(view: View, t: number, w: number, h: number, cx: number, cy: number): Px {
  const { knight } = figures();
  const base = clearingFloor(w, h, cx, cy, 1);
  const P = placer(view);
  const m = t - LEAD;
  const run = BOUND_N * BOUND - HALF_DOWN;
  const from = -3.4;
  const d = m < 0 ? 0 : m < run ? STOT9.pace * m : STOT9.pace * run + stareCarry(m - run);
  const D = P(from + d);
  const S = onFloor(D[0], D[1], cx, cy);
  const K = P(from + STOT9.pace * run + 2.6, -1.3);
  const KP = onFloor(K[0], K[1], cx, cy);
  const { stag } = figures();
  const sl = m < 0 ? frameAt(stag, view, 'walk', 0) : m < run ? frameAt(stag, view, 'walk', m) : m - run < STARE.long ? frameAt(stag, view, 'stare', m - run) : frameAt(stag, view, 'stand', m - run - STARE.long);
  const px = layScene(base, () => {}, [], [
    { at: S, l: sl, shadow: 16 },
    { at: KP, l: frameAt(knight, kViewOf(view), 'stand', t), flip: KP[0] > S[0], shadow: 9 },
  ]);
  return shaken(px, shakeAt(m, [[run + 0.02, 2]]));
}
void hash;
void TAU;
