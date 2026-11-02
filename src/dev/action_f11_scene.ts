// Pictures of FLOORS 11 TO 15'S MOBS' NEW MOVES, put together for the owner (the sheet, the film's frames): the Hushed watchman's chop and
// lantern throw (art/action_f11_watch.ts) on a stand-in for floor 11's streets; the reaper's harvest (art/action_f11_field.ts) on floor 13's
// fields; the orderly's mallet blow and gurney charge (art/action_f11_orderly.ts) on floor 14's ward; the Bookwarden's tome slam and book
// barrage (art/action_f11_warden.ts) on floor 15's library; with the knight, each figure at its floor point and sorted by it, as the game
// sorts them. Made outside a browser (tools/action_f11_film.ts, tools/action_f11_sheet.ts). Nothing of the game imports it. THE FLOORS ARE
// STAND-INS, in the floors' own colours: the game's own grounds are the game's.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import type { ActorArt, Clip } from '../art/actor_types';
import { hash } from '../art/kit';
import { makeHeroArt3 } from '../art/heroes3';
import { BITE_CANVAS, CHOP, CHOP_HIT, FLY_CANVAS, LOB, LOB_HIT, LANTERN_WATCHMAN, OIL_CANVAS, POOL, SHADOW_CANVAS, biteAt, bitePainted, lanternFlying, lanternShadow, lobArc, lobFly, makeLanternWatchArt, oilPainted } from '../art/action_f11_watch';
import { CHAFF_CANVAS, HARVEST, HARVEST_HIT, HARVEST_HITS, chaffPainted, harvestOn, hookAt, makeHarvestArt } from '../art/action_f11_field';
import { BLOW9, BLOW_HIT, CRASH_CANVAS, GURNEY, GURNEY_CANVAS, GURNEY_HIT, blowAt, crashPainted, gurneyGone, gurneyPainted, makeGurneyOrderlyArt } from '../art/action_f11_orderly';
import { BARRAGE, BARRAGE_DONE, BOOK_CANVAS, SLAM9, SLAM_HIT, bookAt, bookGoes, bookPainted, bookStreak, makeBarrageWardenArt, slamAt9 } from '../art/action_f11_warden';
import { lanePainted } from '../art/action_f6_golem';
import { markRing } from '../art/action_f6_fx';
import { skeletonAt } from '../art/new_mobs3';
import { compose, laid, onFloor } from './action_f1_scene';
import type { Stood } from './action_f1_scene';
import { frameAt } from './action_f3_scene';
import type { Laid } from './king_scene';

export type View = 'front' | 'back';
const smooth = (k: number): number => {
  const v = Math.max(0, Math.min(1, k));
  return v * v * (3 - 2 * v);
};
export const LEAD = 0.4;
export type Ground = 'street' | 'fields' | 'ward' | 'library';

// ---------------------------------------------------------------------------------------------
// THE STAND-IN FLOORS

/** Floor 11, the Gate Ward's streets: setts of the city's grey-violet stone (art/act2_kit.ts STONE), dark joints, a gutter. */
const SETT = ['#2a2532', '#363040', '#4f4652', '#6b5f63', '#887a75'];
/** Floor 13, the millrace's fields: bare earth and stubble of the corn gone over (art/millrace.ts MR_EARTH, MR_GOLD, MR_WEED). */
const EARTH = ['#3a2c22', '#523e2e', '#6c533c'];
const STUBBLE = ['#544727', '#6f5d31', '#8a743c', '#a48b47'];
const WEED = ['#2c3624', '#3c4a2c'];
/** Floor 14, the House of Quiet's ward: deal boards (art/housequiet.ts HQ_DEAL), sawdust. */
const DEAL = ['#2a2823', '#58544a', '#686456', '#77725f', '#8b8572'];
/** Floor 15, the Great Library: its dark boards and a carpet runner (art/library.ts LB_BOARD, LB_CARPET, LB_BORDER). */
const LBOARD = ['#1a130e', '#34261a', '#402f21', '#4b3828', '#5d4632'];
const CARPET = ['#1d2133', '#262b40', '#30364e'];
const BORDER = ['#6c5a34', '#87713f'];
export function standInFloor(which: Ground, w: number, h: number, cx: number, cy: number): Px {
  const px = new Px(w, h);
  for (let Y = 0; Y < h; Y++) {
    for (let X = 0; X < w; X++) {
      const a = (X + 0.5 - cx) / 32;
      const b = (Y + 0.5 - cy) / 16;
      const x = (a + b) / 2 + 40;
      const y = (b - a) / 2 + 40;
      const g = hash(X >> 1, Y >> 1, 7101);
      let c: string;
      if (which === 'street') {
        // (setts in courses along x, each course offset by half)
        const row = Math.floor(y * 3);
        const col = Math.floor(x * 2.4 + (row % 2) * 0.5);
        const fy = y * 3 - row;
        const fx = x * 2.4 + (row % 2) * 0.5 - col;
        const joint = fy < 0.09 || fx < 0.06;
        const tone = hash(col, row, 7103);
        c = joint ? SETT[0] : tone > 0.8 ? SETT[3] : tone > 0.35 ? SETT[2] : SETT[1];
        if (!joint && fy > 0.75 && fx > 0.3 && tone > 0.5) c = SETT[3];
        if (!joint && g > 0.985) c = SETT[4];
      } else if (which === 'fields') {
        // (earth in furrows along x, stubble in rows, weeds)
        const furrow = Math.sin(y * 9.5) > 0.55;
        c = furrow ? EARTH[0] : g > 0.6 ? EARTH[2] : EARTH[1];
        if (!furrow && hash(X >> 1, Y, 7105) > 0.82) c = STUBBLE[(X + Y) % 4];
        if (hash(X >> 2, Y >> 2, 7107) > 0.97) c = WEED[(X + Y) % 2];
      } else if (which === 'ward') {
        // (deal boards along x, their seams dark, a knot, sawdust)
        const plank = Math.floor(y * 3.2);
        const seam = y * 3.2 - plank < 0.08;
        const end = ((x + hash(plank, 1, 7109) * 3) % 3) < 0.04;
        const tone = hash(plank, Math.floor(x + hash(plank, 1, 7109) * 3), 7111);
        c = seam || end ? DEAL[0] : tone > 0.6 ? DEAL[3] : tone > 0.25 ? DEAL[2] : DEAL[1];
        if (!seam && hash(X, Y >> 1, 7113) > 0.93) c = tone > 0.5 ? DEAL[2] : DEAL[4];
      } else {
        // (dark boards, a carpet runner down the middle with its gilt border)
        const plank = Math.floor(x * 3.6);
        const seam = x * 3.6 - plank < 0.07;
        const tone = hash(plank, Math.floor(y * 0.7 + hash(plank, 2, 7115) * 4), 7117);
        c = seam ? LBOARD[0] : tone > 0.6 ? LBOARD[3] : tone > 0.3 ? LBOARD[2] : LBOARD[1];
        const across = Math.abs(((y - 40.5) % 9 + 9) % 9 - 4.5);
        if (across < 1.0) c = across > 0.88 ? BORDER[g > 0.5 ? 1 : 0] : g > 0.7 ? CARPET[2] : g > 0.2 ? CARPET[1] : CARPET[0];
      }
      px.set(X, Y, c);
    }
  }
  return px;
}

// ---------------------------------------------------------------------------------------------
// THE FIGURES

let ART: { watch: ActorArt; field: ActorArt; orderly: ActorArt; warden: ActorArt; knight: ActorArt } | null = null;
export function figures(): NonNullable<typeof ART> {
  if (!ART) {
    const heroes = makeHeroArt3();
    ART = { watch: makeLanternWatchArt(), field: makeHarvestArt(), orderly: makeGurneyOrderlyArt(), warden: makeBarrageWardenArt(), knight: heroes.of('warrior', { twoHanded: false }) as unknown as ActorArt };
  }
  return ART;
}
/** The way a figure faces on the floor: from in front, down-right (+x); from behind, up-right (-y); and its right. */
const ahead = (view: View): [number, number] => (view === 'front' ? [1, 0] : [0, -1]);
const rightOf = (view: View): [number, number] => (view === 'front' ? [0, 1] : [1, 0]);
/** Where a place `along` tiles before a figure and `aside` to its right is, on the scene. */
const placer = (view: View, cx: number, cy: number) => (along: number, aside = 0): [number, number] => {
  const [fx, fy] = ahead(view);
  const [sx, sy] = rightOf(view);
  return onFloor(fx * along + sx * aside, fy * along + sy * aside, cx, cy);
};
const clipLong = (art: ActorArt, move: string): number => {
  const c = (move === 'attack' ? art.front.clips?.attack : art.front.clips?.moves?.[move]) as Clip;
  return (c.frames.length - 1) / c.fps;
};
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
const shifted = (ls: Light[], dx: number, dy: number): Light[] => ls.map((l) => ({ ...l, x: l.x + dx, y: l.y + dy }));
/** The knight, struck: jolted a moment. */
function jolted(l: Laid, since: number): Laid {
  if (since < 0 || since > 0.25) return l;
  const k = Math.sin((since / 0.25) * Math.PI);
  return { ...l, ax: l.ax + Math.round(3 * k), ay: l.ay - Math.round(2 * k) };
}
/** A knight walking from (a0, s0) to (a1, s1) between `t0` and `t1` (tiles along and aside of the figure's way). */
function walker(t: number, t0: number, t1: number, a0: number, s0: number, a1: number, s1: number): { a: number; s: number; moving: boolean } {
  const k = smooth((t - t0) / (t1 - t0));
  return { a: a0 + (a1 - a0) * k, s: s0 + (s1 - s0) * k, moving: t > t0 && t < t1 };
}
type Floor = { at: [number, number]; l: Laid }[];
/** Something painted on its own canvas, laid at `P` (its anchor there), as figure (`stood`, sorted with them) or on the floor. */
const put = (p: { px: Px }, C: { ax: number; ay: number }, P: [number, number], dy = 0): { at: [number, number]; l: Laid } => ({ at: [P[0], P[1] + dy], l: laid(p.px, C.ax, C.ay) });

// ---------------------------------------------------------------------------------------------
// FLOOR 11: THE WATCHMAN'S CHOP: the halberd over his head, held; it bites the floor and the floor splits on before him; the knight steps
// out of its way as it is held

const W_AT = -1.8;
export const CHOP_PASS = LEAD + CHOP.long + 0.9;
export function chopScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const { watch, knight } = figures();
  const at = placer(view, cx, cy);
  const hit = LEAD + CHOP_HIT;
  const [bx, by] = biteAt();
  const k = walker(t, LEAD + 0.35, LEAD + 0.8, bx + 0.6, 0.1, bx + 0.4, -1.5);
  const K = at(W_AT + k.a, k.s);
  const Wp = at(W_AT);
  const kv = kViewOf(view);
  const floor: Floor = [];
  const stood: Stood[] = [
    { at: Wp, l: doing(watch, view, 'attack', t, LEAD), shadow: 14 },
    { at: K, l: frameAt(knight, kv, k.moving ? 'walk' : 'stand', t), flip: K[0] > Wp[0], shadow: 9 },
  ];
  const lights: Light[] = [];
  if (t >= hit) {
    const [dx, dy] = ahead(view);
    const B = at(W_AT + bx, -by);
    const C = BITE_CANVAS;
    floor.push(put(bitePainted(t - hit, 'floor', dx, dy), C, B));
    stood.push(put(bitePainted(t - hit, 'air', dx, dy, 'behind'), C, B, -0.5));
    stood.push(put(bitePainted(t - hit, 'air', dx, dy, 'before'), C, B, 0.5));
    lights.push(...shifted(bitePainted(t - hit, 'air', dx, dy).lights, B[0] - C.ax, B[1] - C.ay));
  } else if (t > LEAD + CHOP.up - 0.1) {
    // (its reach marked as it is held over his head: where it will bite, and the way the floor will split)
    const mark = new Px(360, 240);
    markRing(mark, 180, 120, CHOP.r, smooth((t - LEAD - CHOP.up + 0.1) / 0.3), ['#7a1058', '#e0287a', '#3a0820']);
    floor.push({ at: at(W_AT + bx, -by), l: laid(mark, 180, 120) });
  }
  const px = compose(copy(base), floor, stood);
  layLights(px, lights);
  return px;
}

// ---------------------------------------------------------------------------------------------
// THE LANTERN THROW: swung back high, held, flaring; lobbed high at the knight; its shadow; the smash; the burning oil spreading; the
// knight gets out from under it and the oil burns where he stood

const L_AT = -2.6;
const LK_AT = 4.8;
export const LOB_PASS = LEAD + LOB_HIT + lobFly(LK_AT) + 2.6;
export function lobTimes(): { start: number; hit: number; lands: number; d: number } {
  const d = LK_AT;
  return { start: LEAD, hit: LEAD + LOB_HIT, lands: LEAD + LOB_HIT + lobFly(d), d };
}
export function lobScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const { watch, knight } = figures();
  const at = placer(view, cx, cy);
  const { hit, lands, d } = lobTimes();
  // the knight: sees it coming and runs out from under it; then turns back to it, and stands off the fire
  const k = walker(t, hit + 0.12, hit + 0.55, LK_AT, 0, LK_AT + 0.3, -2.2);
  const K = at(L_AT + k.a, k.s);
  const Wp = at(L_AT);
  const kv = kViewOf(view);
  const floor: Floor = [];
  const stood: Stood[] = [
    { at: Wp, l: doing(watch, view, 'lantern', t, LEAD), shadow: 14 },
    { at: K, l: frameAt(knight, kv, k.moving ? 'walk' : 'stand', k.moving ? t * 1.6 : t), flip: K[0] > Wp[0], shadow: 9 },
  ];
  const lights: Light[] = [];
  const Tp = at(L_AT + d);
  if (t >= hit && t < lands) {
    // in flight: high over the floor, its shadow under it, where it will come down marked
    const u = (t - hit) / (lands - hit);
    const s = skeletonAt(LANTERN_WATCHMAN, 'lantern', LOB_HIT);
    const h0 = s.handL;
    const fa = h0[0] / 39.19;
    const fl = h0[1] / 39.19;
    const F = at(L_AT + fa, -fl);
    const fx = F[0] + (Tp[0] - F[0]) * u;
    const fy = F[1] + (Tp[1] - F[1]) * u;
    const z = (h0[2] - 10) * (1 - u) + lobArc(d) * Math.sin(Math.PI * u);
    floor.push({ at: [fx, fy], l: laid(lanternShadow(u), SHADOW_CANVAS.ax, SHADOW_CANVAS.ay) });
    const mark = new Px(360, 240);
    markRing(mark, 180, 120, POOL.burst, smooth(u / 0.4), ['#7a1058', '#e0287a', '#3a0820'], t * 0.5);
    floor.push({ at: Tp, l: laid(mark, 180, 120) });
    const fly = lanternFlying(t - hit);
    stood.push({ at: [fx, fy + 0.4], l: { px: fly.px, ax: FLY_CANVAS.ax, ay: FLY_CANVAS.ay + Math.round(z) } });
    lights.push(...shifted(fly.lights, fx - FLY_CANVAS.ax, fy - z - FLY_CANVAS.ay));
  }
  if (t >= lands) {
    const C = OIL_CANVAS;
    floor.push(put(oilPainted(t - lands, 'floor'), C, Tp));
    stood.push(put(oilPainted(t - lands, 'air', 'behind'), C, Tp, -0.5));
    stood.push(put(oilPainted(t - lands, 'air', 'before'), C, Tp, 0.5));
    lights.push(...shifted(oilPainted(t - lands, 'floor').lights, Tp[0] - C.ax, Tp[1] - C.ay));
    lights.push(...shifted(oilPainted(t - lands, 'air').lights, Tp[0] - C.ax, Tp[1] - C.ay));
  }
  const px = compose(copy(base), floor, stood);
  layLights(px, lights);
  return px;
}
/** The oil burning on, the knight standing off it (seconds of the throw's own scene). */
export const BURN_FROM = ((): number => lobTimes().lands + POOL.burn - 1.6)();

// ---------------------------------------------------------------------------------------------
// FLOOR 13: THE REAPER'S HARVEST: three cuts, stepping in with each; the leap and the hook; the chaff; the knight backing off

const H_AT = -2.2;
export const HARVEST_PASS = LEAD + HARVEST.long + 0.7;
export function harvestScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const { field, knight } = figures();
  const at = placer(view, cx, cy);
  const [hx, hy] = hookAt();
  // the knight backs off before each cut, and is just out of the hook's chaff
  const m = t - LEAD;
  const back = m < 0.5 ? 0 : m < 0.75 ? smooth((m - 0.5) / 0.25) * 0.5 : m < 1.0 ? 0.5 : m < 1.3 ? 0.5 + smooth((m - 1.0) / 0.3) * 0.6 : m < 1.7 ? 1.1 : 1.1 + smooth((m - 1.7) / 0.25) * 0.5;
  const moving = (m > 0.5 && m < 0.75) || (m > 1.0 && m < 1.3) || (m > 1.7 && m < 1.95);
  const K = at(H_AT + 1.75 + back, 0.15);
  const F = at(H_AT);
  const kv = kViewOf(view);
  const floor: Floor = [];
  let kl = frameAt(knight, kv, moving ? 'walk' : 'stand', t);
  kl = jolted(kl, t - LEAD - HARVEST_HITS[0]);
  const stood: Stood[] = [
    { at: F, l: doing(field, view, 'attack', t, LEAD), shadow: 0 },
    { at: K, l: kl, flip: K[0] > F[0], shadow: 9 },
  ];
  // (its shadow goes on with it, under its pelvis)
  const on = m >= 0 && m <= HARVEST.long ? harvestOn(m) : m > HARVEST.long ? HARVEST.travel : 0;
  stood[0].at = F;
  const S = at(H_AT + on);
  floor.push({ at: S, l: laid(shadowOf(11), 14, 7) });
  const lights: Light[] = [];
  const hit = LEAD + HARVEST_HIT;
  if (t >= hit) {
    const C = CHAFF_CANVAS;
    const P = at(H_AT + hx, -hy);
    floor.push(put(chaffPainted(t - hit, 'floor'), C, P));
    stood.push(put(chaffPainted(t - hit, 'air', 'behind'), C, P, -0.5));
    stood.push(put(chaffPainted(t - hit, 'air', 'before'), C, P, 0.5));
    lights.push(...shifted(chaffPainted(t - hit, 'air').lights, P[0] - C.ax, P[1] - C.ay));
  }
  const px = compose(copy(base), floor, stood);
  layLights(px, lights);
  return px;
}
/** A soft round shadow on its own little canvas (`r` across). */
function shadowOf(r: number): Px {
  const p = new Px(28, 14);
  for (let j = -6; j <= 6; j++) for (let i = -13; i <= 13; i++) if ((i / r) ** 2 + (j / (r * 0.42)) ** 2 <= 1 && ((i + j) & 1) === 0) p.set(14 + i, 7 + j, '#0a080e');
  return p;
}

// ---------------------------------------------------------------------------------------------
// FLOOR 14: THE ORDERLY'S MALLET BLOW: raised, held, in the floor; the knight just out of its ring

const O_AT = -1.6;
export const BLOW_PASS = LEAD + BLOW9.long + 0.5;
export function blowScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const { orderly, knight } = figures();
  const at = placer(view, cx, cy);
  const [bx, by] = blowAt();
  const K = at(O_AT + bx + BLOW9.r + 0.35, 0.5);
  const Op = at(O_AT);
  const kv = kViewOf(view);
  const floor: Floor = [];
  if (t > LEAD + BLOW9.raised - 0.1 && t < LEAD + BLOW_HIT + 0.4) {
    const mark = new Px(360, 240);
    const k = t < LEAD + BLOW_HIT ? smooth((t - LEAD - BLOW9.raised + 0.1) / 0.3) : 1 - (t - LEAD - BLOW_HIT) / 0.4;
    markRing(mark, 180, 120, BLOW9.r, k, ['#7a1058', '#e0287a', '#3a0820']);
    floor.push({ at: at(O_AT + bx, -by), l: laid(mark, 180, 120) });
  }
  return compose(copy(base), floor, [
    { at: Op, l: doing(orderly, view, 'attack', t, LEAD), shadow: 14 },
    { at: K, l: frameAt(knight, kv, 'stand', t), flip: K[0] > Op[0], shadow: 9 },
  ]);
}

// ---------------------------------------------------------------------------------------------
// THE GURNEY CHARGE: the gurney before him; the lane marked; the mallet swung back, held; slammed into the gurney's end; it careers
// down the lane and crashes: on the knight (who did not get out of it), or at its end (who did)

const G_AT = -4.4;
export function gurneyTimes(): { start: number; aim: number; hit: number } {
  return { start: LEAD, aim: LEAD + GURNEY.aim, hit: LEAD + GURNEY_HIT };
}
/** The pass: the knight in the lane, struck (`dodge` false), or out of it as it goes by, and it crashes at the lane's end. */
export function gurneyPass(dodge: boolean): number {
  const run = dodge ? GURNEY.lane - GURNEY.at - GURNEY.long / 2 : 5.4 - GURNEY.at - GURNEY.long / 2;
  let s = 0;
  while (gurneyGone(s) < run) s += 0.01;
  return LEAD + GURNEY_HIT + s + 1.3;
}
export function gurneyScene(view: View, t: number, base: Px, cx: number, cy: number, dodge = false): Px {
  const { orderly, knight } = figures();
  const at = placer(view, cx, cy);
  const { aim, hit } = gurneyTimes();
  const KA = 5.8;
  const k = dodge ? walker(t, aim + 0.25, aim + 0.75, KA, 0, KA - 0.2, -1.9) : { a: KA, s: 0, moving: false };
  // (where it crashes: on the knight, or at the lane's end)
  const run = dodge ? GURNEY.lane - GURNEY.at - GURNEY.long / 2 : KA - 0.35 - GURNEY.at - GURNEY.long / 2;
  let crashAt = 0;
  while (gurneyGone(crashAt) < run) crashAt += 0.005;
  const s = t - hit;
  const gone = Math.min(run, gurneyGone(Math.min(s, crashAt)));
  const crashed = s >= crashAt ? s - crashAt : -1;
  const K = at(G_AT + k.a, k.s);
  const Op = at(G_AT);
  const kv = kViewOf(view);
  const floor: Floor = [];
  const [dx, dy] = ahead(view);
  if (t >= aim && (crashed < 0 || crashed < 0.3)) {
    const lane = lanePainted(dx, dy, smooth((t - aim) / 0.25), s > 0 ? GURNEY.at + gone - GURNEY.long / 2 : 0, GURNEY.lane, GURNEY.half);
    floor.push({ at: Op, l: laid(lane.px, lane.ax, lane.ay) });
  }
  let kl = frameAt(knight, kv, k.moving ? 'walk' : 'stand', k.moving ? t * 1.6 : t);
  if (!dodge && crashed >= 0) kl = jolted(kl, crashed);
  const G = at(G_AT + GURNEY.at + gone);
  const gp = gurneyPainted(Math.max(0, s), view === 'front' ? 'front' : 'rear', crashed);
  const stood: Stood[] = [
    { at: Op, l: doing(orderly, view, 'gurney', t, LEAD), shadow: 14 },
    { at: K, l: kl, flip: K[0] > Op[0], shadow: 9 },
    { at: [G[0], G[1] - (dodge || crashed < 0 ? 0 : 3)], l: laid(gp.px, GURNEY_CANVAS.ax, GURNEY_CANVAS.ay), shadow: 18 },
  ];
  const lights: Light[] = [];
  if (crashed >= 0) {
    const C = CRASH_CANVAS;
    const P = at(G_AT + GURNEY.at + gone + GURNEY.long / 2);
    floor.push(put(crashPainted(crashed, 'floor'), C, P));
    stood.push(put(crashPainted(crashed, 'air', 'behind'), C, P, -0.5));
    stood.push(put(crashPainted(crashed, 'air', 'before'), C, P, 0.5));
    lights.push(...shifted(crashPainted(crashed, 'air').lights, P[0] - C.ax, P[1] - C.ay));
  }
  const px = compose(copy(base), floor, stood);
  layLights(px, lights);
  return px;
}

// ---------------------------------------------------------------------------------------------
// FLOOR 15: THE BOOKWARDEN'S TOME SLAM: whirled, held; in two frames over and flat on the floor; the knight just out of its dust

const B_AT = -1.8;
export const SLAM_PASS = LEAD + SLAM9.long + 0.5;
export function slamScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const { warden, knight } = figures();
  const at = placer(view, cx, cy);
  const [sx, sy] = slamAt9();
  const K = at(B_AT + sx + SLAM9.reach * SLAM9.along + 0.5, -sy + 0.6);
  const Bp = at(B_AT);
  const kv = kViewOf(view);
  const floor: Floor = [];
  if (t > LEAD + 0.3 && t < LEAD + SLAM_HIT + 0.4) {
    const mark = new Px(360, 240);
    const k = t < LEAD + SLAM_HIT ? smooth((t - LEAD - 0.3) / 0.3) : 1 - (t - LEAD - SLAM_HIT) / 0.4;
    markRing(mark, 180, 120, SLAM9.reach * SLAM9.along, k, ['#7a1058', '#e0287a', '#3a0820']);
    floor.push({ at: at(B_AT + sx, -sy), l: laid(mark, 180, 120) });
  }
  return compose(copy(base), floor, [
    { at: Bp, l: doing(warden, view, 'attack', t, LEAD), shadow: 15 },
    { at: K, l: frameAt(knight, kv, 'stand', t), flip: K[0] > Bp[0], shadow: 9 },
  ]);
}

// ---------------------------------------------------------------------------------------------
// THE BOOK BARRAGE: the books rise and wheel round him, held; his hand thrust out; the books flung at the knight one after another, each
// at where he is as it goes; he runs across the stream, and they pass behind him and skid and lie

const BB_AT = -3.0;
const BK_AT = 3.0;
export const BARRAGE_PASS = LEAD + BARRAGE_DONE - 0.4;
/** The knight, running across the stream (tiles along the Bookwarden's way, and to his right). */
function barrageKnight(t: number): { a: number; s: number; moving: boolean } {
  return walker(t, LEAD + 0.95, LEAD + 1.75, BK_AT, -1.6, BK_AT, 1.9);
}
export function barrageScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const { warden, knight } = figures();
  const at = placer(view, cx, cy);
  const m = t - LEAD;
  const k = barrageKnight(t);
  const K = at(BB_AT + k.a, k.s);
  const Bp = at(BB_AT);
  const kv = kViewOf(view);
  const stood: Stood[] = [
    { at: Bp, l: doing(warden, view, 'barrage', t, LEAD), shadow: 15 },
    { at: K, l: frameAt(knight, kv, k.moving ? 'walk' : 'stand', k.moving ? t * 1.6 : t), flip: K[0] > Bp[0], shadow: 9 },
  ];
  // (where the knight is at a moment, in the Bookwarden's own way: tiles before him and to his left)
  const aim = (when: number): [number, number] => {
    const kk = barrageKnight(LEAD + when);
    return [kk.a, -kk.s];
  };
  const floor: Floor = [];
  const extra: { x: number; y: number; dx: number; dy: number; seed: number }[] = [];
  if (m > 0 && m < BARRAGE_DONE) {
    for (let i = 0; i < BARRAGE.n; i++) {
      const b = bookAt(i, m, aim);
      const lying = b.lying && m - bookGoes(i) > BARRAGE.far / BARRAGE.pace + 0.3 + BARRAGE.lies;
      if (lying) continue;
      const P = at(BB_AT + b.x, -b.y);
      const glint = m > BARRAGE.up && !b.flying && !b.lying ? 1 : 0;
      const pic = bookPainted(b.spin, b.cover, b.lying, glint);
      stood.push({ at: [P[0], P[1] + 0.3], l: { px: pic, ax: BOOK_CANVAS.ax, ay: BOOK_CANVAS.ay + Math.round(b.z) } });
      floor.push({ at: P, l: laid(shadowOf(5 + Math.min(4, b.z / 12)), 14, 7) });
      if (b.flying) {
        const b2 = bookAt(i, m - 1 / 30, (w) => aim(w));
        const P2 = at(BB_AT + b2.x, -b2.y);
        extra.push({ x: P[0], y: P[1] - b.z, dx: P[0] - P2[0], dy: P[1] - b.z - (P2[1] - b2.z), seed: i });
      }
    }
  }
  const px = compose(copy(base), floor, stood);
  for (const e of extra) bookStreak(px, e.x, e.y, e.dx * 1.6, e.dy * 1.6, e.seed);
  // (the knight struck by any that reach him: none, if he runs)
  return px;
}
void CHOP;
void LOB;
