// Pictures of FLOORS 9 AND 10'S MOBS' NEW MOVES, put together for the owner (the sheet, the film's frames): the twisted deer's bramble
// charge and its gore, and the fog wolves' pack strike (art/action_f9_pinewood.ts), on a stand-in for floor 9's pinewood floor; the
// Drowned's bog retch and its frost grab (art/action_f9_fen.ts) on a stand-in for floor 10's fen; with the knight, each figure at its
// floor point and sorted by it, as the game sorts them. Made outside a browser (tools/action_f9_film.ts, tools/action_f9_sheet.ts).
// Nothing of the game imports it. THE FLOORS ARE STAND-INS, in the floors' own colours: the game's own grounds are the game's.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import type { ActorArt, Clip } from '../art/actor_types';
import { hash } from '../art/kit';
import { makeHeroArt3 } from '../art/heroes3';
import { CHARGE, CHARGE_HIT, CLUMP_CANVAS, GORE9, GORE_HIT, HEDGE_AT, HEDGE_GONE, LEAP, LEAP_HIT, PACK, chargeCarry, hedgeClumpPainted, leapCarry, makeBrambleDeerArt, makePackWolfArt } from '../art/action_f9_pinewood';
import { FROST, GRAB_HIT, RETCH, RETCH_HIT, RIME, RIME_CANVAS, SLICK, SLICK_CANVAS, gripFrom, gushPainted, makeFrostDrownedArt, rimePainted, slickPainted } from '../art/action_f9_fen';
import { lanePainted } from '../art/action_f6_golem';
import { markRing } from '../art/action_f6_fx';
import { compose, laid, onFloor } from './action_f1_scene';
import type { Stood } from './action_f1_scene';
import { frameAt } from './action_f3_scene';
import type { Laid } from './king_scene';

export type View = 'front' | 'back';
const smooth = (k: number): number => {
  const v = Math.max(0, Math.min(1, k));
  return v * v * (3 - 2 * v);
};

// ---------------------------------------------------------------------------------------------
// THE STAND-IN FLOORS

/** Floor 9, the pinewood: its earth and its needles, moss and grass in tufts (art/pinewood.ts C_EARTH, C_NEEDLE, C_MOSS, C_GRASS). */
const NEEDLE = ['#2a2017', '#3e3022', '#56432f', '#70583e', '#8c704d'];
const MOSSY = ['#2a3424', '#3a4a2e', '#4e6238'];
const GRASS = ['#40502c', '#536638', '#677a43'];
/** Floor 10, the fen: its sodden peat, its moss, puddles of its dark water (art/fen.ts C_PEAT, C_MOSS, C_FEN). */
const PEAT = ['#1c1712', '#272019', '#342a20', '#43372a', '#534634', '#655740'];
const FENMOSS = ['#222b1b', '#2e3a22', '#3c4b2b', '#4c5e35'];
const FENWATER = ['#16211b', '#1c2a22', '#23332a'];
export function standInFloor(which: 'pinewood' | 'fen', w: number, h: number, cx: number, cy: number): Px {
  const px = new Px(w, h);
  for (let Y = 0; Y < h; Y++) {
    for (let X = 0; X < w; X++) {
      const a = (X + 0.5 - cx) / 32;
      const b = (Y + 0.5 - cy) / 16;
      const x = (a + b) / 2;
      const y = (b - a) / 2;
      const n1 = Math.sin(x * 2.9 + Math.sin(y * 2.3) * 1.5) + Math.sin(y * 2.6 - x * 1.1 + 1.3) + 0.6 * (hash(Math.floor(x * 3), Math.floor(y * 3), which === 'pinewood' ? 6919 : 6917) - 0.5);
      const g = hash(X >> 1, Y >> 1, which === 'pinewood' ? 6901 : 6903);
      let c: string;
      if (which === 'pinewood') {
        // (needles in drifts over the earth; moss patches; a tuft of grass here and there; needles lying in short strokes)
        const stroke = hash((X + Y * 2) >> 2, Y >> 1, 6905) > 0.86;
        c = n1 > 0.9 ? MOSSY[g > 0.5 ? 2 : 1] : n1 < -1.1 ? NEEDLE[1] : NEEDLE[2];
        if (stroke) c = NEEDLE[g > 0.5 ? 3 : 1];
        if (g > 0.985) c = GRASS[(X + Y) % 3];
        if (hash(X >> 1, Y >> 1, 6907) > 0.993) c = NEEDLE[4];
      } else {
        // (sodden peat, moss over it, dark water lying in it)
        c = n1 > 1.05 ? FENMOSS[g > 0.5 ? 2 : 1] : n1 < -1.25 ? FENWATER[g > 0.6 ? 2 : 1] : PEAT[g > 0.7 ? 3 : 2];
        if (n1 < -1.25 && hash(X >> 2, Y >> 1, 6909) > 0.9) c = FENWATER[0];
        if (g > 0.99) c = PEAT[4];
        if (n1 > 1.05 && g < 0.05) c = FENMOSS[3];
      }
      px.set(X, Y, c);
    }
  }
  return px;
}

// ---------------------------------------------------------------------------------------------
// THE FIGURES

let ART: { deer: ActorArt; wolf: ActorArt; drowned: ActorArt; knight: ActorArt } | null = null;
export function figures(): NonNullable<typeof ART> {
  if (!ART) {
    const heroes = makeHeroArt3();
    ART = { deer: makeBrambleDeerArt(), wolf: makePackWolfArt(), drowned: makeFrostDrownedArt(), knight: heroes.of('warrior', { twoHanded: false }) as unknown as ActorArt };
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
/** The knight, struck: jolted a moment (the game's own struck clip for a hero is the game's; here a jolt and a flash of the enemy's pink round him). */
function jolted(l: Laid, since: number): Laid {
  if (since < 0 || since > 0.25) return l;
  const k = Math.sin((since / 0.25) * Math.PI);
  return { ...l, ax: l.ax + Math.round(3 * k), ay: l.ay - Math.round(2 * k) };
}

export const LEAD = 0.4;

// ---------------------------------------------------------------------------------------------
// THE DEER'S BRAMBLE CHARGE: the lane marked; antlers down, stamping, held; it bursts off and gallops down the lane; the hedge of
// thorns bursts up behind it; the knight gets out of the lane, and cannot get back across

const D_AT = -3.6;
const DK_AT = 1.0;
export function chargeTimes(): { start: number; aim: number; off: number; stop: number } {
  return { start: LEAD, aim: LEAD + CHARGE.aim, off: LEAD + CHARGE_HIT, stop: LEAD + CHARGE.until };
}
export const CHARGE_PASS = ((): number => chargeTimes().stop + 1.6)();
export function chargeScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const { deer, knight } = figures();
  const { start, aim, off } = chargeTimes();
  const m = t - start;
  const at = placer(view, cx, cy);
  // the knight: out of the lane as it is marked; then, the hedge up, he makes for it, and is stopped by it
  const out = smooth((t - aim - 0.2) / 0.5);
  const back = smooth((t - off - 1.0) / 0.5);
  const aside = -1.9 * out + 1.0 * back;
  const moving = (t > aim + 0.2 && t < aim + 0.7) || (t > off + 1.0 && t < off + 1.5);
  const kv = kViewOf(view);
  const K = at(DK_AT, aside);
  const D = at(D_AT + (m > 0 ? chargeCarry(m) : 0));
  const floor: { at: [number, number]; l: Laid }[] = [];
  const stood: Stood[] = [
    { at: D, l: doing(deer, view, 'charge', t, start), shadow: 16 },
    { at: K, l: frameAt(knight, kv, moving ? 'walk' : 'stand', t), flip: K[0] > D[0], shadow: 9 },
  ];
  const [fx, fy] = ahead(view);
  if (t >= aim && m < CHARGE.until + 0.2) {
    const lane = lanePainted(fx, fy, smooth((t - aim) / 0.25), m > 0 ? chargeCarry(m) + 0.8 : 0, CHARGE.lane, CHARGE.half);
    floor.push({ at: at(D_AT), l: laid(lane.px, lane.ax, lane.ay) });
  }
  // the hedge, clump by clump, each at its own place along the path, sorted with the figures
  const C = CLUMP_CANVAS;
  if (m > 0 && m < HEDGE_GONE + 0.3) {
    for (const d of HEDGE_AT) {
      const P = at(D_AT + d);
      floor.push({ at: P, l: laid(hedgeClumpPainted(d, m, view, 'floor'), C.ax, C.ay) });
      stood.push({ at: [P[0], P[1] + 0.25], l: laid(hedgeClumpPainted(d, m, view, 'air'), C.ax, C.ay) });
    }
  }
  return compose(copy(base), floor, stood);
}
/** The hedge withering, the knight beside it (seconds of the charge's own scene). */
export const WITHER_FROM = LEAD + HEDGE_GONE - 1.1;

/** THE GORE: the knight just out of its reach. */
export const GORE_PASS = LEAD + GORE9.long + 0.35;
export function goreScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const { deer, knight } = figures();
  const at = placer(view, cx, cy);
  const G = at(-1.3);
  const K = at(-1.3 + GORE9.reach + 0.9, 0.7);
  const kv = kViewOf(view);
  return compose(copy(base), [], [
    { at: G, l: doing(deer, view, 'attack', t, LEAD), shadow: 16 },
    { at: K, l: frameAt(knight, kv, 'stand', t), flip: K[0] > G[0], shadow: 9 },
  ]);
}

// ---------------------------------------------------------------------------------------------
// THE FOG WOLVES' PACK STRIKE: four of them glide in to a ring round the knight; one after another, going round, each crouches,
// holds, and leaps clean through where he stands, snapping, a beat apart; each lands on the ring across from where it was

/** The four of the pack: where each starts on the ring (a way on the floor from the knight), the way it leaps, and how it is drawn (from in front or behind, flipped). */
const PACK4: ReadonlyArray<{ from: [number, number]; view: View; flip: boolean }> = [
  { from: [1, 0], view: 'back', flip: true }, // (leaping the floor's -x: up-left)
  { from: [0, 1], view: 'back', flip: false }, // (leaping -y: up-right)
  { from: [-1, 0], view: 'front', flip: false }, // (leaping +x: down-right)
  { from: [0, -1], view: 'front', flip: true }, // (leaping +y: down-left)
];
export function packTimes(order: number[] = [0, 1, 2, 3]): { gathered: number; at: number[]; done: number } {
  const gathered = LEAD + PACK.gather;
  const at = [0, 0, 0, 0];
  order.forEach((w, i) => (at[w] = gathered + 0.15 + i * PACK.beat));
  return { gathered, at, done: Math.max(...at) + LEAP.long };
}
export const PACK_PASS = ((): number => packTimes().done + 0.3)();
/** Where wolf `w` is at `t` (tiles from the knight, on the floor), which way it faces, and what it is doing. */
export function wolfAt(w: number, t: number, order?: number[]): { x: number; y: number; move: string; since: number } {
  const P = PACK4[w];
  const { at } = packTimes(order);
  const r0 = 4.6;
  if (t < LEAD + PACK.gather) {
    // (gliding in to the ring, from further out, staggered round it)
    const u = smooth((t - LEAD * 0.2 - w * 0.08) / (PACK.gather + LEAD * 0.8 - w * 0.08));
    const r = r0 + (PACK.ring - r0) * u;
    const swing = 0.5 * (1 - u) * (w % 2 ? 1 : -1);
    const c = Math.cos(swing);
    const s = Math.sin(swing);
    return { x: (P.from[0] * c - P.from[1] * s) * r, y: (P.from[0] * s + P.from[1] * c) * r, move: u < 0.97 ? 'walk' : 'stand', since: t };
  }
  const m = t - at[w];
  const c = m < 0 ? 0 : leapCarry(Math.min(m, LEAP.long));
  const r = PACK.ring - c;
  return { x: P.from[0] * r, y: P.from[1] * r, move: m >= 0 && m <= LEAP.long ? 'attack' : 'stand', since: m };
}
export function packScene(view: View, t: number, base: Px, cx: number, cy: number, order?: number[]): Px {
  const { wolf, knight } = figures();
  const { at, gathered } = packTimes(order);
  const kv: View = view;
  const stood: Stood[] = [];
  const floor: { at: [number, number]; l: Laid }[] = [];
  // the ring they spread in, marked as they hold it
  if (t > gathered - 0.3 && t < Math.max(...at) + LEAP_HIT) {
    const C = { w: 420, h: 240, ax: 210, ay: 120 };
    const mark = new Px(C.w, C.h);
    markRing(mark, C.ax, C.ay, PACK.ring, smooth((t - gathered + 0.3) / 0.3), ['#7a1058', '#e0287a', '#3a0820'], t * 0.15);
    floor.push({ at: onFloor(0, 0, cx, cy), l: laid(mark, C.ax, C.ay) });
  }
  for (let w = 0; w < 4; w++) {
    const s = wolfAt(w, t, order);
    const P = PACK4[w];
    const l = s.move === 'attack' ? frameAt(wolf, P.view, 'attack', s.since) : frameAt(wolf, P.view, s.move, t + w * 0.37);
    stood.push({ at: onFloor(s.x, s.y, cx, cy), l, flip: P.flip, shadow: 8 });
  }
  // the knight in the middle: jolted as each snaps past him
  let kl = frameAt(knight, kv, 'stand', t);
  for (const a of at) kl = jolted(kl, t - a - LEAP_HIT);
  stood.push({ at: onFloor(0, 0, cx, cy), l: kl, shadow: 9 });
  return compose(copy(base), floor, stood);
}
/**
 * THE PACK STRIKE FROM ABOVE: a plan of the floor, looked straight down on: the knight in the middle, the ring, the four wolves
 * (their fog grey, their eyes the enemy's pink and gold), each leap a streak across the ring through him as it is made.
 */
export function packAbove(t: number, w: number, h: number, order?: number[]): Px {
  const px = new Px(w, h);
  const T = 46;
  const cx = w / 2;
  const cy = h / 2;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const g = hash(x >> 1, y >> 1, 6911);
    const n = Math.sin(x * 0.11 + Math.sin(y * 0.09) * 1.6) + Math.sin(y * 0.1 - x * 0.05) + 0.8 * (hash(x >> 3, y >> 3, 6915) - 0.5);
    px.set(x, y, n > 1.25 ? MOSSY[1] : g > 0.9 ? NEEDLE[3] : g < 0.08 ? NEEDLE[1] : NEEDLE[2]);
  }
  const dot = (x: number, y: number, c: string): void => {
    const X = Math.round(x);
    const Y = Math.round(y);
    if (X >= 0 && Y >= 0 && X < w && Y < h) px.set(X, Y, c);
  };
  const disc = (x: number, y: number, r: number, c: string): void => {
    for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r + 0.5) dot(x + i, y + j, c);
  };
  const { at, gathered } = packTimes(order);
  // (the ring: dashed, the enemy's pink)
  if (t > gathered - 0.3) for (let i = 0; i < 200; i++) if (i % 5 < 3) {
    const a = (i / 200) * Math.PI * 2;
    disc(cx + Math.cos(a) * PACK.ring * T, cy + Math.sin(a) * PACK.ring * T, 1, i % 5 === 1 ? '#ff7aa8' : '#e0287a');
  }
  // (each leap's streak: its fog drawn out along the way it went, fading after)
  for (let wi = 0; wi < 4; wi++) {
    const m = t - at[wi] - LEAP_HIT + 2 / 30;
    if (m < 0 || m > 0.6) continue;
    const P = PACK4[wi];
    const k = 1 - m / 0.6;
    const c0 = Math.min(LEAP.leap, leapCarry(at[wi] + m - at[wi] + LEAP_HIT - 2 / 30));
    for (let s = 0; s <= c0 * T; s += 1) {
      const r = PACK.ring * T - s;
      const x = cx + P.from[0] * r;
      const y = cy + P.from[1] * r;
      for (let q = -9; q <= 9; q++) {
        if (hash(s, q, 6913) > k * (1 - Math.abs(q) / 10)) continue;
        dot(x + P.from[1] * q, y + P.from[0] * q, Math.abs(q) < 2 ? '#dcd8e2' : '#a6a2b0');
      }
      if (s % 2 === 0) {
        dot(x + P.from[1] * 3, y + P.from[0] * 3, '#ffb070');
        dot(x - P.from[1] * 3, y - P.from[0] * 3, '#ff4f8a');
      }
    }
  }
  // (the knight, from above: his shoulders and his helm, steel; his shield)
  disc(cx, cy, 15, '#2a2a34');
  disc(cx, cy, 14, '#b03a3a');
  disc(cx, cy, 8, '#8a8c98');
  disc(cx - 1, cy - 1, 5, '#c0c2cc');
  disc(cx - 2, cy - 2, 2, '#e6e8ee');
  disc(cx + 13, cy + 6, 6, '#6a4a30');
  // (the wolves, from above: a long body of fog, its head, its tail, its eyes burning)
  for (let wi = 0; wi < 4; wi++) {
    const s = wolfAt(wi, t, order);
    const P = PACK4[wi];
    const fx = -P.from[0];
    const fy = -P.from[1];
    const x = cx + s.x * T;
    const y = cy + s.y * T;
    for (let q = -26; q <= 22; q++) {
      const wd = q > 16 ? 5 : q > 9 ? 8 : q > -10 ? 11 : q > -18 ? 6 : 3;
      for (let j = -wd; j <= wd; j++) {
        if (Math.abs(j) === wd && hash(q, j + wi * 9, Math.floor(t * 8)) > 0.6) continue;
        dot(x + fx * q - fy * j, y + fy * q + fx * j, Math.abs(j) === wd || q === -26 || q === 22 ? '#3a3846' : Math.abs(j) > wd - 3 ? '#7e7a8a' : j < 0 ? '#cac6d0' : '#a6a2b0');
      }
    }
    for (const sd of [-3, 3]) for (const e of [0, 1]) {
      disc(x + fx * (20 - e) - fy * sd, y + fy * (20 - e) + fx * sd, 1, e ? '#ff4f8a' : '#ffd36a');
    }
  }
  return px;
}

// ---------------------------------------------------------------------------------------------
// THE DROWNED'S BOG RETCH: risen, heaving, the cone marked; it retches; the gush comes down over the cone; the slick lies; the knight
// is caught at its edge and wades out, slowed

const R_AT = -1.6;
const RK_AT = 1.3;
export function retchTimes(): { start: number; hit: number; lands: number } {
  const start = LEAD;
  return { start, hit: start + RETCH_HIT, lands: start + RETCH_HIT + SLICK.lands };
}
export const RETCH_PASS = ((): number => retchTimes().lands + 2.2)();
export function retchScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const { drowned, knight } = figures();
  const { start, hit, lands } = retchTimes();
  const at = placer(view, cx, cy);
  // (struck as it lands; then he wades out, slowed to half his pace in it)
  const wade = Math.max(0, Math.min(1, (t - lands - 0.3) / 1.6));
  const aside = -2.3 * wade;
  const moving = wade > 0 && wade < 1;
  const kv = kViewOf(view);
  const K = at(RK_AT, aside);
  const Dr = at(R_AT);
  const C = SLICK_CANVAS;
  const floor: { at: [number, number]; l: Laid }[] = [{ at: Dr, l: laid(slickPainted(t - hit, view), C.ax, C.ay) }];
  let kl = frameAt(knight, kv, moving ? 'walk' : 'stand', moving ? (t - lands) * 0.5 : t);
  kl = jolted(kl, t - lands);
  const stood: Stood[] = [
    { at: Dr, l: doing(drowned, view, 'retch', t, start), shadow: 12 },
    { at: K, l: kl, flip: K[0] > Dr[0], shadow: 9 },
  ];
  if (t >= hit) {
    stood.push({ at: [Dr[0], Dr[1] - 0.5], l: laid(gushPainted(t - hit, view, 'behind'), C.ax, C.ay) });
    stood.push({ at: [Dr[0], Dr[1] + 0.5], l: laid(gushPainted(t - hit, view, 'before'), C.ax, C.ay) });
  }
  const px = compose(copy(base), floor, stood);
  // (wading in it: the bog splashing round his legs)
  if (t > lands && wade < 1) {
    for (let i = 0; i < 10; i++) {
      const a = hash(i, Math.floor(t * 12), 6921) * Math.PI * 2;
      const r = 6 + 6 * hash(i, Math.floor(t * 12), 6923);
      const x = Math.round(K[0] + Math.cos(a) * r);
      const y = Math.round(K[1] + Math.sin(a) * r * 0.45 - 2 * hash(i, 3, 6925));
      if (x > 0 && y > 0 && x < px.w && y < px.h) px.set(x, y, i % 3 ? '#262016' : '#585034');
    }
  }
  void start;
  return px;
}

// ---------------------------------------------------------------------------------------------
// THE DROWNED'S FROST GRAB: arms up, frost on its hands, held; it clutches; the rime spreads, the ice shoots up round his feet: frozen
// a moment; the ice shatters and he steps back

const G_AT = -0.9;
export function grabTimes(): { start: number; hit: number; free: number } {
  return { start: LEAD, hit: LEAD + GRAB_HIT, free: LEAD + GRAB_HIT + FROST.hold };
}
export const GRAB_PASS = ((): number => grabTimes().free + 1.2)();
export function grabScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const { drowned, knight } = figures();
  const { start, hit, free } = grabTimes();
  const at = placer(view, cx, cy);
  const gx = G_AT + gripFrom() + 0.15;
  const back = smooth((t - free - 0.05) / 0.5);
  const kv = kViewOf(view);
  const K = at(gx + 1.1 * back);
  const Q = at(gx);
  const Dr = at(G_AT);
  const C = RIME_CANVAS;
  const frozen = t >= hit && t < free;
  // (frozen: held as he was the moment it closed on him, rimed)
  let kl = frameAt(knight, kv, t > free && back < 1 ? 'walk' : 'stand', frozen ? hit : t);
  kl = jolted(kl, t - hit);
  if (frozen) {
    const p = new Px(kl.px.w, kl.px.h);
    p.d.set(kl.px.d);
    // (rime over him, from his feet up: his colours whitened toward the frost's, in whole steps)
    const up = Math.min(1, (t - hit) / 0.15);
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const i = (y * p.w + x) * 4;
      if (p.d[i + 3] !== 255) continue;
      const fromFeet = (kl.ay - y) / 60;
      if (fromFeet > up * 0.7 || hash(x, y, 6931) > 0.75 - fromFeet) continue;
      const v = (p.d[i] + p.d[i + 1] + p.d[i + 2]) / 3;
      const c = v > 140 ? RIME[4] : v > 90 ? RIME[3] : v > 50 ? RIME[2] : RIME[1];
      p.d.set([parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16), 255], i);
    }
    kl = { ...kl, px: p };
  }
  const floor: { at: [number, number]; l: Laid }[] = [];
  const stood: Stood[] = [
    { at: Dr, l: doing(drowned, view, 'attack', t, start), shadow: 12 },
    { at: K, l: kl, flip: K[0] > Dr[0], shadow: 9 },
  ];
  const lights: Light[] = [];
  if (t >= hit) {
    floor.push({ at: Q, l: laid(rimePainted(t - hit, 'floor'), C.ax, C.ay) });
    stood.push({ at: [Q[0], Q[1] - 0.5], l: laid(rimePainted(t - hit, 'air', 'behind'), C.ax, C.ay) });
    stood.push({ at: [Q[0], Q[1] + 0.5], l: laid(rimePainted(t - hit, 'air', 'before'), C.ax, C.ay) });
    lights.push(...rimePainted(t - hit, 'air').lights.map((l) => ({ ...l, x: l.x - C.ax + Q[0], y: l.y - C.ay + Q[1] })));
  }
  const px = compose(copy(base), floor, stood);
  layLights(px, lights);
  return px;
}
void RETCH;
void GORE_HIT;
