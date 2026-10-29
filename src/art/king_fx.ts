// FLOOR 19'S BOSS, THE KING: WHAT HIS BLOWS LEAVE ACROSS THE HALL, AND THE CLOCKWORK SONGBIRD (the art chat, 29 Oct
// 2026). A MOCK-UP: NOT IN THE GAME, behind KING_ON (art/king.ts, off). His moves are art/king_moves.ts; each of these
// begins as his blow lands (its `hit`), where the game puts it. His pick: “Slow and heavy, huge reach (Recommended)”, so
// every one of them reaches across the hall (a boss arena is about 17 by 20 tiles): his rulebook's Movement 9 and his
// “And bigger AOE to compensate for the extra time the player gets to evade”.
//
//   THE SWEEP'S WAVE: as his blade sweeps round, the wind and grit off its edge roll out from it across the floor, a great
//     crescent the width of the wedge he swept (from behind his right round to his left), out to KG_REACH.sweep tiles in
//     half a second, its front a bright edge, dust and chips churned up behind it.
//   THE DECREE: rows of his knights, grey-blue fog in old armour, rise out of the floor at the far side of the hall and
//     march across it in lines, shield to shield, spears levelled, each line with gaps in it to slip through.
//   THE CROWN'S SHOCKWAVE: where he lands, the stones crack out from under him and a ring rolls out across the whole
//     hall, the flags heaving up along it and settling, dust rising behind it, its edge ringing pale.
//   THE CURTAINS: the faces of his deeds (from the book: some ugly, others gentle and lovely) look out of the hangings
//     through his warning; then stream out of them at you in long lines, grey masks trailing fog.
//   THE CLOCKWORK SONGBIRD (his death): a small jewelled bird of gold and silver lies broken on the floor, its spring
//     sprung; it winds itself up, rights itself, and sings.
// Nothing here glows cyan; the old gold never glows; the pink is the enemy's own, a glint here and there.

import { Px } from '../engine/px';
import { INK, hash } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { TILE3, paintBits, sphere } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import { GOLD, SAPPHIRE } from './king';
import { stage } from './skin';
import type { GameView, Stage } from './skin';
import { add, buildOf, cross, lerp3, mul, norm, solve, standing, sub } from './skeleton';
import type { Posed, V3 } from './skeleton';

const TAU = Math.PI * 2;
const D = Math.PI / 180;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const fr = (t: number): number => t - Math.floor(t);
const lay = (px: Px, x: number, y: number, c: string, size = 1): void => {
  const xi = Math.round(x - size / 2);
  const yi = Math.round(y - size / 2);
  for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, c);
};

/** HOW FAR HIS BLOWS REACH (tiles from him): the sweep's wave, the Crown's ring, the faces' streams; the Decree's lines are the hall's whole width. */
export const KG_REACH = { sweep: 10, crown: 10, decreeHalf: 9.5, curtains: 13 } as const;

/** The hall-sized picture these are painted on, his floor point at its middle (picture pixels): room for ten tiles all round him. */
export const FX_CANVAS = { w: 1000, h: 580, ax: 500, ay: 320 } as const;
const stageOf = (view: GameView): Stage => stage(view === 'back' ? 'rear' : view, FX_CANVAS.ax, FX_CANVAS.ay, FX_CANVAS);

// =============================================================================================
// THE SWEEP'S WAVE

/** Its times (seconds from the blow landing): out to its reach; gone. And the wedge it covers (degrees round from his front, to his left). */
export const SWEEP_FX = { out: 0.5, long: 0.7, from: -165, to: 70, deep: 1.3 * TILE3 } as const;
const STEEL_W = ['#5c5874', '#8a86a2', '#c2bfd2', '#eceaf2'];
const GRIT = ['#2c2a38', '#45424f', '#646070'];
/** THE WAVE `t` seconds after the sweep lands, seen from in front or from behind (its first moments start at the blade's own reach). */
export function sweepPainted(t: number, view: GameView = 'front'): Painted {
  const st = stageOf(view);
  const px = new Px(FX_CANVAS.w, FX_CANVAS.h);
  if (t < 0 || t > SWEEP_FX.long) return { px, lights: [] };
  const R0 = 2.4 * TILE3;
  const R1 = KG_REACH.sweep * TILE3;
  const k = smooth(0, SWEEP_FX.out, t) * 0.85 + 0.15 * clamp01(t / SWEEP_FX.out);
  const front = R0 + (R1 - R0) * k;
  const fade = 1 - smooth(SWEEP_FX.out - 0.12, SWEEP_FX.long, t);
  const deep = SWEEP_FX.deep * (0.8 + 0.9 * k);
  const a0 = SWEEP_FX.from * D;
  const a1 = SWEEP_FX.to * D;
  const steps = Math.ceil(((a1 - a0) * front) / 1.1);
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    // (thinner toward its two ends, where it began and where it ends)
    const end = Math.min(1, Math.min(i, steps - i) / (steps * 0.07));
    const streak = Math.floor(i / 2) % 5;
    for (let r = front - deep * end; r <= front + 0.5; r += 1.0) {
      const u = (front - r) / Math.max(1, deep);
      const h = hash(i, Math.round(r * 2), 7801);
      let c: string | null = null;
      let z = 0.6;
      if (u < 0.05) c = h < fade * 1.2 ? STEEL_W[3] : null;
      else if (u < 0.1) c = h < fade ? STEEL_W[2] : null;
      else if (u < 0.42) {
        // (the wind off his blade: a pale blade of air, streaked along the way it goes)
        const dens = (streak === 0 ? 0.95 : streak === 2 ? 0.7 : 0.38) * (1 - u) * fade * end;
        if (h < dens) c = streak === 0 ? STEEL_W[2] : STEEL_W[1];
        z = 0.6 + 4 * (0.42 - u);
      } else {
        // (the grit and dust it drags up behind it, rising)
        const dens = 0.5 * (1 - u) * fade * end;
        if (h < dens) c = h < dens * 0.4 ? STEEL_W[0] : GRIT[(i + Math.round(r)) % 3];
        z = 0.6 + 12 * (u - 0.42) * hash(i, 3, 7802);
      }
      if (!c) continue;
      const [x, y] = st.at([ca * r, sa * r, z]);
      lay(px, x, y, c, 1);
    }
    // (chips of stone flung up out of its path, and pink sparks struck off the stones here and there along its front)
    if (i % 4 === 0 && hash(i, 5, 7803) < 0.8 * fade * end) {
      const r = front - deep * (0.1 + 0.7 * hash(i, 6, 7803));
      const z = 3 + 16 * hash(i, 7, 7803) * (1 - k * 0.4);
      const [x, y] = st.at([ca * r, sa * r, z]);
      lay(px, x, y, hash(i, 8, 7803) < 0.18 ? FLAME[3] : GRIT[i % 3], hash(i, 9, 7803) < 0.35 ? 3 : 2);
    }
  }
  return { px, lights: [] };
}

// =============================================================================================
// THE CROWN'S SHOCKWAVE

export const CROWN_FX = { out: 0.8, long: 1.6, cracks: 2.6 * TILE3 } as const;
const STONE_UP = ['#262a3e', '#3a4058', '#565e7a', '#7a82a0'];
/** THE RING `t` seconds after he lands, round the floor point under him. */
export function crownPainted(t: number, view: GameView = 'front'): Painted {
  const st = stageOf(view);
  const px = new Px(FX_CANVAS.w, FX_CANVAS.h);
  if (t < 0 || t > CROWN_FX.long) return { px, lights: [] };
  const R1 = KG_REACH.crown * TILE3;
  const k = smooth(0, CROWN_FX.out, t) * 0.8 + 0.2 * clamp01(t / CROWN_FX.out);
  const front = 0.8 * TILE3 + (R1 - 0.8 * TILE3) * k;
  const fade = 1 - smooth(CROWN_FX.out, CROWN_FX.long, t);
  // THE CRACKS out from under him, ragged and forking, fading last
  const cf = 1 - smooth(CROWN_FX.long - 0.5, CROWN_FX.long, t);
  for (let j = 0; j < 14; j++) {
    let a = (j / 14) * TAU + hash(j, 1, 7811);
    let r = 5;
    const long = CROWN_FX.cracks * (0.55 + 0.6 * hash(j, 2, 7811)) * smooth(0, 0.1, t);
    while (r < long) {
      const [x, y] = st.at([Math.cos(a) * r, Math.sin(a) * r, 0.3]);
      if (hash(j, Math.round(r), 7812) < cf) {
        lay(px, x, y, INK, r < long * 0.45 ? 2 : 1);
        if (r < long * 0.5) lay(px, x + 1, y - 1, STONE_UP[2], 1);
      }
      a += (hash(j, Math.round(r), 7813) - 0.5) * 0.1;
      r += 1;
    }
  }
  const band = (0.9 + 0.7 * k) * TILE3;
  const steps = Math.ceil((TAU * front) / 1.1);
  // THE DUST WALL behind the heave, rising and thinning
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * TAU;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    for (let r = Math.max(4, front - band); r <= front - 0.15 * band; r += 1.4) {
      const u = (front - r) / band;
      const h = hash(i, Math.round(r * 3), 7814);
      if (h > (1 - u) * 0.6 * fade) continue;
      const z = 0.6 + 20 * (1 - u) * u * 4 * hash(i, 4, 7816) * (1 - k * 0.3);
      const [x, y] = st.at([ca * r, sa * r, z]);
      lay(px, x, y, u < 0.35 ? '#9a96b0' : u < 0.65 ? '#6e6a80' : '#4a4658', 1);
    }
  }
  // THE HEAVE: flags tipped up along the front in slabs (lit tops, dark faces), and its edge ringing pale ahead of it
  const slabs = Math.ceil((TAU * front) / 7);
  for (let i = 0; i < slabs; i++) {
    const a = ((i + 0.5 * hash(i, 1, 7815)) / slabs) * TAU;
    if (hash(i, 2, 7815) > 0.85 * fade + 0.1) continue;
    const r = front - 2 - 3 * hash(i, 3, 7815);
    const lift = (2.5 + 3.5 * hash(i, 4, 7815)) * fade;
    const w = 2.6 + 1.6 * hash(i, 5, 7815);
    const c: V3 = [Math.cos(a) * r, Math.sin(a) * r, 0];
    const tng: V3 = [-Math.sin(a), Math.cos(a), 0];
    const [x0, y0] = st.at(add(c, mul(tng, -w)));
    const [x1, y1] = st.at(add(c, mul(tng, w)));
    const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (let e = 0; e <= n; e++) {
      const x = x0 + ((x1 - x0) * e) / n;
      const y = y0 + ((y1 - y0) * e) / n;
      lay(px, x, y - lift, STONE_UP[3], 1);
      for (let dy = 1; dy <= Math.round(lift); dy++) lay(px, x, y - lift + dy, dy === 1 ? STONE_UP[2] : STONE_UP[1], 1);
      lay(px, x, y + 1, STONE_UP[0], 1);
    }
  }
  const edge = Math.ceil((TAU * (front + 3)) / 1.0);
  for (let i = 0; i < edge; i++) {
    const a = (i / edge) * TAU;
    for (const [dr, c, keep] of [[2, '#eceaf4', 1], [3, '#c4c0d6', 0.9], [8, '#8e8aa6', 0.55]] as const) {
      if (hash(i, dr, 7817) > fade * keep) continue;
      const [x, y] = st.at([Math.cos(a) * (front + dr), Math.sin(a) * (front + dr), 0.5]);
      lay(px, x, y, c, 1);
    }
  }
  return { px, lights: [] };
}

// =============================================================================================
// THE DECREE: his knights of fog, marching

/** A knight of his, knight-sized: plate, a great helm, a kite shield, a spear. */
const KN_BODY = buildOf(60, 1.25, { shoulders: 1.12, chest: 1.05, depth: 1.05, waist: 0.95, hips: 1.0, arms: 1.0, limbs: 1.15, pad: 2 });
const KN_CANVAS = { w: 120, h: 130, ax: 52, ay: 108 } as const;
/** Their fog: grey-blue, cold (hue about 225: well clear of the friend's cyan). */
const GHOST: Ramp = ['#161a2a', '#262e46', '#3e4866', '#5e6a8c', '#8a96b8'];
const GHOST_PALE = '#b2bad2';
/** The Decree's times and measures: how many lines; how far apart; the gap's width; their pace (tiles a second); each line rising, marching across, and fading. */
export const DECREE_FX = { lines: 3, apart: 3.2, every: 1.25, pace: 2.4, rise: 0.5, fade: 0.5, from: -9, to: 10, march: { frames: 12, fps: 20 } } as const;
/** Where each line's gaps are (tiles across the hall, from his left), each gap two knights wide. */
export const DECREE_GAPS: ReadonlyArray<ReadonlyArray<number>> = [[-5, 3.75], [-1.25, 6.25], [-7.5, 1.25]];
/** A line of knights at a moment: where each one is (tiles: x forward from him, y to his left), and how far risen (0 under the floor, 1 up) and faded (1 whole). */
export interface DecreeAt {
  /** Where the lines rise (tiles before him: less than nothing, behind him), and where they fade; how far either side of him they reach. */
  from?: number;
  to?: number;
  half?: number;
}
export function decreeKnights(t: number, o: DecreeAt = {}): { x: number; y: number; up: number; whole: number; step: number }[] {
  const out: { x: number; y: number; up: number; whole: number; step: number }[] = [];
  const W = o.half ?? KG_REACH.decreeHalf;
  const from = o.from ?? DECREE_FX.from;
  const to = o.to ?? DECREE_FX.to;
  for (let l = 0; l < DECREE_FX.lines; l++) {
    const t0 = l * (DECREE_FX.apart / DECREE_FX.pace);
    const tt = t - t0;
    if (tt < 0) continue;
    const x = from + DECREE_FX.pace * Math.max(0, tt - DECREE_FX.rise * 0.5);
    const long = (to - from) / DECREE_FX.pace;
    if (tt > long + DECREE_FX.fade) continue;
    const up = smooth(0, DECREE_FX.rise, tt);
    const whole = 1 - smooth(long, long + DECREE_FX.fade, tt);
    for (let y = -W; y <= W + 1e-6; y += DECREE_FX.every) {
      if (DECREE_GAPS[l % DECREE_GAPS.length].some((g) => Math.abs(y - g) < DECREE_FX.every * 0.9)) continue;
      out.push({ x, y, up, whole, step: tt * DECREE_FX.march.fps + (y * 3.1) % 1 });
    }
  }
  return out;
}

/** A knight's march, frame `j` of 12: legs striding, his shield before him, his spear levelled over its rim. */
function knightPose(j: number): Posed {
  const a = (j / DECREE_FX.march.frames) * TAU;
  const R = standing(KN_BODY);
  const sw = Math.sin(a);
  return {
    ...R,
    pz: -1.2 - 1.2 * Math.cos(2 * a), pitch: 6, bend: 4, yaw: 2 * sw, twist: -3 * sw, roll: 1.5 * sw,
    faceUp: 0,
    lfx: 7 * sw, lfz: Math.max(0, -Math.cos(a)) * 4, rfx: -7 * sw, rfz: Math.max(0, Math.cos(a)) * 4, lk: 6, rk: -6,
    // (the shield's grip before his chest; the spear in his right hand at his hip, levelled forward and a little up)
    lhIn: 1, lhx: 14, lhy: -4, lhz: -20, le: -30,
    rhIn: 1, rhx: 8, rhy: -1, rhz: -24, re: 20,
    wAz: 2, wEl: 6, wRoll: 0,
  } as Posed;
}
const KN_CACHE = new Map<string, Px>();
/** A knight of his, frame `j` of its march, seen from in front or behind (its back pictures turned as the camera truly sees them). */
export function knightPainted(j: number, view: GameView): Px {
  const key = `${j}:${view}`;
  const have = KN_CACHE.get(key);
  if (have) return have;
  const st = stage(view === 'back' ? 'rear' : view, KN_CANVAS.ax, KN_CANVAS.ay, KN_CANVAS);
  const s = solve(KN_BODY, knightPose(j));
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const B = KN_BODY;
  const [cf, cl, cu] = s.chest;
  // legs (fading into fog below the knee: what is below is thinned after)
  for (const [hip, knee, ankle] of [[s.hipL, s.kneeL, s.ankleL], [s.hipR, s.kneeR, s.ankleR]] as const) {
    put('legs', 'legs', { k: 'rod', a: hip, b: knee, ra: B.legR[0] * 1.15, rb: B.legR[1] * 1.15, ramp: GHOST });
    put('legs', 'legs', { k: 'rod', a: knee, b: ankle, ra: B.legR[1] * 1.15, rb: B.legR[2] * 1.2, ramp: GHOST });
  }
  // the breastplate and the fauld
  put('body', 'body', {
    k: 'cloth', ramp: GHOST, look: { folds: [0], lift: 0.04 },
    rings: [
      { c: add(s.pelvis, mul(s.hips[2], -2)), u: mul(s.hips[0], B.pelvisDeep + 3.6), v: mul(s.hips[1], B.pelvisHalf + 3.4) },
      { c: s.waist, u: mul(s.belly[0], B.waistDeep + 2.4), v: mul(s.belly[1], B.waistHalf + 2.4) },
      { c: s.ribs, u: mul(cf, B.ribDeep + 2.6), v: mul(cl, B.ribHalf + 2.4) },
      { c: lerp3(s.ribs, s.neck, 0.7), u: mul(cf, B.ribDeep + 1.4), v: mul(cl, B.shoulderHalf + 0.6) },
    ],
  });
  // arms, pauldrons
  for (const [sh, el, hd, side] of [[s.shoulderL, s.elbowL, s.handL, 1], [s.shoulderR, s.elbowR, s.handR, -1]] as const) {
    put('arms', 'arms', { k: 'ball', c: add(sh, mul(cu, 1.2)), ax: [mul(cf, 4.2), mul(cl, 4.4), mul(cu, 3.2)], skin: GHOST });
    put('arms', 'arms', { k: 'rod', a: sh, b: el, ra: 3.0, rb: 2.6, ramp: GHOST });
    put('arms', 'arms', { k: 'rod', a: el, b: hd, ra: 2.6, rb: 2.3, ramp: GHOST });
    put('arms', 'arms', { k: 'ball', c: hd, ax: sphere(2.4), skin: GHOST });
    void side;
  }
  // the great helm, its slit, the dull pink behind it
  const [ff, fl, fu] = s.face;
  const hc = s.head;
  put('helm', 'helm', {
    k: 'ball', c: hc, ax: [mul(ff, B.headR[0] * 1.05), mul(fl, B.headR[1] * 1.08), mul(fu, B.headR[2] * 1.12)],
    skin: (u, tone) => (u[0] > 0.45 && Math.abs(u[2] - 0.12) < 0.1 && Math.abs(u[1]) < 0.7 ? INK : u[2] > 0.82 ? GHOST[Math.min(4, tone + 1)] : GHOST[tone]),
  });
  for (const k of [-1, 1]) put('helm', 'eyes', { k: 'dot', p: add(hc, add(mul(ff, B.headR[0] * 1.02), add(mul(fl, k * B.headR[1] * 0.32), mul(fu, B.headR[2] * 0.13)))), c: FLAME[1], facing: ff });
  // the kite shield before him, his crown on it faded grey
  const n = norm(add(cf, mul(cl, 0.15)));
  const up = norm(sub(cu, mul(n, 0.2)));
  const across = norm(cross(up, n));
  const sc = add(s.handL, mul(n, 2.2));
  put('shield', 'shield', {
    k: 'panel', c: add(sc, mul(up, -2)), u: mul(across, 7.5), v: mul(up, 12),
    skin: (a, b, frontF, tone) => {
      const y = b / 12;
      const x = Math.abs(a) / 7.5;
      const w = y > 0.3 ? 1 : Math.max(0, (y + 1) / 1.3) ** 0.8;
      if (x > w || y > 1) return null;
      if (!frontF) return GHOST[1];
      if (x > w - 0.14 || y > 0.88) return GHOST[4];
      // (a crown on it, faded)
      if (y > 0.05 && y < 0.5 && x < 0.45 && (y < 0.22 || (fr(a * 0.45 + 0.5) < 0.3 && y < 0.5))) return GHOST[4];
      return GHOST[Math.max(1, Math.min(3, tone))];
    },
  });
  // the spear: a long shaft levelled over the shield's rim, its leaf-shaped head
  const way = s.point;
  const butt = add(s.handR, mul(way, -14));
  const head = add(s.handR, mul(way, 40));
  put('spear', 'spear', { k: 'rod', a: butt, b: head, ra: 0.9, rb: 0.8, ramp: GHOST });
  put('spear', 'spear', { k: 'rod', a: head, b: add(head, mul(way, 7)), ra: 1.8, rb: 0.2, ramp: [GHOST[2], GHOST[2], GHOST[3], GHOST_PALE, GHOST_PALE] });
  paintBits(st, bits, s.pelvis);
  const px = st.whole(ENEMY_RIM);
  // (below the knees it thins to fog: every pixel there thinned the more the lower it is)
  const kneeY = Math.min(st.at(s.kneeL)[1], st.at(s.kneeR)[1]);
  const footY = KN_CANVAS.ay;
  for (let y = Math.floor(kneeY); y < px.h; y++) {
    const k = clamp01((y - kneeY) / Math.max(1, footY - kneeY));
    for (let x = 0; x < px.w; x++) {
      if (!px.has(x, y)) continue;
      if (hash(x, y, 7821 + j) < k * 0.95) px.erase(x, y);
      else if (hash(x, y, 7822) < k) px.set(x, y, GHOST[2]);
    }
  }
  KN_CACHE.set(key, px);
  return px;
}

/** THE DECREE `t` seconds after his sword lands: every line of his knights where it is, risen and faded as far as it is (`thin`: every pixel of a knight kept as far as it is whole). */
export function decreePainted(t: number, view: GameView = 'front', o: DecreeAt = {}, part: 'all' | 'behind' | 'before' = 'all'): Painted {
  const st = stageOf(view);
  const px = new Px(FX_CANVAS.w, FX_CANVAS.h);
  // (those behind him, or before him, for a picture that lays him between them)
  const ks = decreeKnights(t, o).map((k) => ({ ...k, near: st.near([k.x * TILE3, k.y * TILE3, 0]) })).filter((k) => part === 'all' || (part === 'behind') === k.near < 0).sort((a, b) => a.near - b.near);
  for (const k of ks) {
    const [x, y] = st.at([k.x * TILE3, k.y * TILE3, 0]);
    const spr = knightPainted(Math.floor(k.step) % DECREE_FX.march.frames, view);
    const sink = (1 - k.up) * 34;
    const vis = Math.min(k.up, k.whole);
    for (let j = 0; j < spr.h; j++) {
      const Y = Math.round(y - KN_CANVAS.ay + j + sink);
      // (rising out of the floor: nothing of it below its floor point shows)
      if (Y >= FX_CANVAS.h || Y < 0 || (k.up < 1 && Y > y + 2)) continue;
      for (let i = 0; i < spr.w; i++) {
        const si = (j * spr.w + i) * 4;
        if (!spr.d[si + 3]) continue;
        const X = Math.round(x - KN_CANVAS.ax + i);
        if (X < 0 || X >= FX_CANVAS.w) continue;
        if (vis < 1 && hash(X, Y, 7823) > vis) continue;
        const di = (Y * FX_CANVAS.w + X) * 4;
        px.d[di] = spr.d[si];
        px.d[di + 1] = spr.d[si + 1];
        px.d[di + 2] = spr.d[si + 2];
        px.d[di + 3] = spr.d[si + 3];
      }
    }
    // (fog boiling off the floor where they rise, and trailing at their feet)
    for (let i = 0; i < (k.up < 1 ? 14 : 5); i++) {
      const life = fr(t * 1.6 + i / 14 + k.y * 0.37);
      const p: V3 = [k.x * TILE3 - life * 6 + (hash(i, Math.round(k.y * 4), 7824) - 0.5) * 12, k.y * TILE3 + (hash(i, Math.round(k.y * 4), 7825) - 0.5) * 14, 1 + life * (k.up < 1 ? 18 : 6)];
      const [fx, fy] = st.at(p);
      if (hash(i, Math.round(t * 30), 7826) < vis + 0.2) lay(px, fx, fy, life < 0.4 ? GHOST_PALE : GHOST[3], life < 0.3 ? 2 : 1);
    }
  }
  return { px, lights: [] };
}

// =============================================================================================
// THE CURTAINS: the faces of his deeds

/** The faces' times and measures: peering out of the hangings through his warning (`peer`, seconds before his hand is flung); then each stream lets one go every `every` s for `long` s, each flying at `pace` tiles a second at the height of a man's chest. Where the hangings are (tiles from him) and where they fly at (his own front: the game's, at you). */
export const CURTAINS_FX = { peer: 0.6, every: 0.09, long: 1.5, pace: 11, z: 28, from: [[-8, -6.5], [-9, 0], [-8, 6.5]] as const, at: [6, 0] as const, size: 10.5 } as const;
/** Each face that has been let go, `t` seconds after his hand is flung (the game's to aim at you: `at`): where it is (own lengths), which face, and how far through its flight. */
export function curtainFaces(t: number, at: readonly [number, number] = CURTAINS_FX.at, from: ReadonlyArray<readonly [number, number]> = CURTAINS_FX.from): { p: V3; kind: number; k: number; way: V3 }[] {
  const out: { p: V3; kind: number; k: number; way: V3 }[] = [];
  from.forEach(([fx, fy], si) => {
    const a: V3 = [fx * TILE3, fy * TILE3, CURTAINS_FX.z + 14];
    const b: V3 = [at[0] * TILE3, at[1] * TILE3, CURTAINS_FX.z];
    const dir = norm(sub(b, a));
    const flight = (KG_REACH.curtains * TILE3 + Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.6) / (CURTAINS_FX.pace * TILE3);
    for (let i = 0; i * CURTAINS_FX.every < CURTAINS_FX.long; i++) {
      const tt = t - i * CURTAINS_FX.every - si * 0.04;
      if (tt < 0 || tt > flight) continue;
      const d = CURTAINS_FX.pace * TILE3 * tt;
      const side = norm(cross([0, 0, 1], dir), [0, 1, 0]);
      const weave = Math.sin(tt * 9 + i * 1.3 + si) * 6;
      const p = add(add(a, mul(dir, d)), add(mul(side, weave), [0, 0, -Math.min(14, d * 0.12) + Math.sin(tt * 7 + i) * 2]));
      out.push({ p, kind: (i * 3 + si) % 4, k: tt / flight, way: dir });
    }
  });
  return out;
}
const FACE_CANVAS = { w: 44, h: 46, ax: 22, ay: 23 } as const;
const FACE_GREY: Ramp = ['#2a2836', '#46425a', '#68647e', '#8c88a2', '#aca8c0'];
const FACE_CACHE = new Map<string, Px>();
/**
 * A FACE OF HIS DEEDS (`kind`): 0 and 1 gentle and lovely (serene, eyes closed, a faint smile), 2 and 3 ugly (brows
 * knotted, eyes hollow, the mouth dragged open); a grey mask with a fog hood round it. Turned toward `view`'s eye.
 */
export function facePainted(kind: number, view: GameView): Px {
  const key = `${kind}:${view}`;
  const have = FACE_CACHE.get(key);
  if (have) return have;
  const st = stage(view === 'back' ? 'rear' : view, FACE_CANVAS.ax, FACE_CANVAS.ay, FACE_CANVAS);
  const ff = st.eye;
  const fu0: V3 = [0, 0, 1];
  const fu = norm(sub(fu0, mul(ff, ff[2])));
  const fl = cross(fu, ff);
  const gentle = kind < 2;
  const S = CURTAINS_FX.size;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  put('face', 'face', {
    k: 'ball', c: [0, 0, 0], ax: [mul(ff, S * 0.6), mul(fl, S * 0.64), mul(fu, S * 1.05)],
    skin: (u, tone) => {
      const side = Math.abs(u[1]);
      if (u[0] < 0.15) return FACE_GREY[Math.max(0, tone - 2)];
      // (a long face, narrowing to the chin)
      if (u[2] < -0.55 && side > 0.62 - 0.5 * (-u[2] - 0.55)) return null;
      // the brow, a ridge over the eyes
      if (u[2] > 0.2 && u[2] < 0.3 && side < 0.62) return FACE_GREY[Math.max(0, tone - 1)];
      // the cheekbones and the fallen cheeks under them
      if (side > 0.38 && u[2] < 0.0 && u[2] > -0.4) return FACE_GREY[Math.max(0, tone - 1)];
      // the long nose
      if (u[0] > 0.86 && side < 0.11 && u[2] > -0.3 && u[2] < 0.18) return FACE_GREY[Math.min(4, tone + 1)];
      if (gentle) {
        // eyes shut: a long downward curve each; a small mouth, shut, turned up a little at its ends
        if (side > 0.14 && side < 0.52 && Math.abs(u[2] - 0.08 + 2.2 * (side - 0.33) ** 2) < 0.045) return FACE_GREY[0];
        if (side < 0.26 && Math.abs(u[2] + 0.5 - 0.6 * side * side) < 0.04) return FACE_GREY[0];
        return FACE_GREY[Math.min(4, tone + (kind === 1 ? 1 : 0))];
      }
      // ugly: brows knotted down to the nose, hollow eyes, the mouth dragged open and down
      if (side < 0.5 && Math.abs(u[2] - 0.3 + 0.32 * side) < 0.05) return FACE_GREY[0];
      if (side > 0.12 && side < 0.5 && u[2] > -0.08 && u[2] < 0.18 + 0.12 * (0.5 - side)) return '#0c0a14';
      if (side < 0.2 + 0.08 * (kind - 2) && u[2] < -0.32 && u[2] > -0.82) return '#0c0a14';
      return FACE_GREY[tone];
    },
  });
  if (!gentle) for (const k of [-1, 1]) put('face', 'eyes', { k: 'dot', p: add(mul(ff, S * 0.54), add(mul(fl, k * S * 0.21), mul(fu, S * 0.05))), c: FLAME[1], facing: ff });
  // the hood of fog round it, ragged at its foot, over its brow
  put('hood', 'hood', {
    k: 'ball', c: add(mul(ff, -2.4), mul(fu, 1.2)), ax: [mul(ff, S * 0.72), mul(fl, S * 0.86), mul(fu, S * 1.12)],
    skin: (u, tone) => (u[0] > 0.25 && !(u[2] > 0.5 && u[0] > 0.25) ? null : u[2] < -0.6 && hash(Math.round(u[1] * 8), Math.round(u[2] * 8), 7835) < 0.5 ? null : GHOST[Math.max(0, tone - 1)]),
  });
  paintBits(st, bits, [0, 0, 0]);
  const px = st.whole(ENEMY_RIM);
  FACE_CACHE.set(key, px);
  return px;
}
/** THE CURTAINS `t` seconds after his hand is flung (less than nothing: the faces peering out of the hangings through his warning). */
export function curtainsPainted(t: number, view: GameView = 'front', at: readonly [number, number] = CURTAINS_FX.at, from: ReadonlyArray<readonly [number, number]> = CURTAINS_FX.from): Painted {
  const st = stageOf(view);
  const px = new Px(FX_CANVAS.w, FX_CANVAS.h);
  const stamp = (spr: Px, x: number, y: number, keep: number, seed: number): void => {
    for (let j = 0; j < spr.h; j++) {
      for (let i = 0; i < spr.w; i++) {
        const si = (j * spr.w + i) * 4;
        if (!spr.d[si + 3]) continue;
        const X = Math.round(x - FACE_CANVAS.ax + i);
        const Y = Math.round(y - FACE_CANVAS.ay + j);
        if (X < 0 || Y < 0 || X >= px.w || Y >= px.h) continue;
        if (keep < 1 && hash(X + seed, Y, 7831) > keep) continue;
        const di = (Y * px.w + X) * 4;
        px.d.set(spr.d.subarray(si, si + 4), di);
      }
    }
  };
  // (peering out of the hangings through his warning: faces coming up out of the folds, one after another)
  if (t < 0.4) {
    from.forEach(([fx, fy], si) => {
      for (let i = 0; i < 4; i++) {
        // (each looks out of the folds in its own moment through the warning, and is gone as the streams go)
        const come = -CURTAINS_FX.peer + CURTAINS_FX.peer * 0.8 * hash(i, si, 7832);
        if (t < come || t > 0.06 + 0.25 * hash(i, si, 7836)) continue;
        const p: V3 = [fx * TILE3 - 2, (fy + (i - 1.5) * 0.7) * TILE3, CURTAINS_FX.z + 22 + 12 * Math.sin(i * 2.3 + si)];
        const [x, y] = st.at(p);
        stamp(facePainted((i + si) % 4, view), x, y, 1, i * 7 + si);
      }
    });
  }
  // (the streams: back to front, each trailing a tail of fog behind it, thick at the face and thinning)
  const fs = curtainFaces(t, at, from).map((f) => ({ ...f, near: st.near(f.p) })).sort((a, b) => a.near - b.near);
  for (const f of fs) {
    const seed = Math.round(f.k * 1000);
    for (let i = 1; i <= 16; i++) {
      const back = i * 2.6;
      const w = Math.max(0.8, 7.5 - i * 0.42);
      for (let j = 0; j < 6; j++) {
        if (hash(i, j + seed, 7833) > 0.85 - i * 0.035) continue;
        const side = (hash(i, j, 7834) - 0.5) * 2 * w;
        const q = add(f.p, add(mul(f.way, -back), [-f.way[1] * side, f.way[0] * side, Math.sin(i * 0.8 + f.k * 30 + j) * w * 0.6]));
        const [x, y] = st.at(q);
        lay(px, x, y, i < 4 ? '#b6b2ca' : i < 8 ? '#8a86a4' : i < 12 ? GHOST[3] : GHOST[2], i < 5 ? 2 : 1);
      }
    }
    const [x, y] = st.at(f.p);
    stamp(facePainted(f.kind, view), x, y, 1 - smooth(0.85, 1, f.k), 0);
  }
  return { px, lights: [] };
}

// =============================================================================================
// THE CLOCKWORK SONGBIRD

/** Its own little picture; and its three: lying broken; winding itself up (`wind` s); singing (going round every `song` s). */
export const BIRD_CANVAS = { w: 96, h: 84, ax: 46, ay: 62 } as const;
/** How big it is: a little bigger than a real one, so that it reads (its body about a sixth of the knight's height long). */
const BS = 1.5;
export const BIRD = { wind: 1.8, song: 1.2 } as const;
export type BirdState = 'broken' | 'winding' | 'singing';
const SILVER: Ramp = ['#3a3c4a', '#626474', '#8e90a2', '#bcbecc', '#e2e4ec'];
const RUBY = '#b02436';
const DIAMOND = '#f4f4fa';
/** Its pose: how far over on its side (1 lying), its head up (degrees), its beak open (0 to 1), its wings out (0 to 1), its tail fanned, its key turned (degrees), its spring sprung out of it (0 to 1). */
interface BirdPose {
  over: number;
  head: number;
  beak: number;
  wings: number;
  tail: number;
  key: number;
  spring: number;
  hop: number;
  throat: number;
}
function birdPose(state: BirdState, t: number): BirdPose {
  if (state === 'broken') return { over: 1, head: -20, beak: 0.3, wings: 0.5, tail: 0.2, key: 30, spring: 1, hop: 0, throat: 0 };
  if (state === 'winding') {
    const k = clamp01(t / BIRD.wind);
    // (its key turns by itself, in jerks; it shudders; the spring coils back in; it rights itself with a hop)
    const turn = 360 * 2.2 * (k + 0.06 * Math.sin(k * 40));
    const right = smooth(0.45, 0.75, k);
    const shake = Math.sin(t * 50) * (1 - right) * 0.06 * (k > 0.1 ? 1 : 0);
    return { over: clamp01(1 - right + shake), head: -20 + 40 * smooth(0.7, 1, k), beak: 0.3 * (1 - k), wings: 0.5 * (1 - right) + 0.3 * smooth(0.75, 0.9, k) * (1 - smooth(0.9, 1, k)), tail: 0.2 + 0.4 * smooth(0.8, 1, k), key: turn, spring: 1 - smooth(0.1, 0.5, k), hop: 3 * Math.sin(Math.PI * smooth(0.6, 0.85, k)), throat: 0 };
  }
  const a = (t / BIRD.song) * TAU;
  return { over: 0, head: 22 + 6 * Math.sin(a), beak: 0.5 + 0.5 * Math.sin(a * 3), wings: 0.35 + 0.25 * Math.sin(a * 2), tail: 0.6 + 0.2 * Math.sin(a * 2 + 1), key: 720 + (t * 40) % 360, spring: 0, hop: 0.6 * Math.max(0, Math.sin(a * 2)), throat: 0.5 + 0.5 * Math.sin(a * 3) };
}
/** THE SONGBIRD in one of its three, `t` seconds in, seen from in front or behind: gold and silver, set with rubies, sapphires and diamonds. */
export function birdPainted(state: BirdState, t: number, view: GameView = 'front'): Painted {
  const st = stage(view === 'back' ? 'rear' : view, BIRD_CANVAS.ax, BIRD_CANVAS.ay, BIRD_CANVAS);
  const P = birdPose(state, t);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const K = BS;
  // its own ways: forward, left, up; laid over on its right side as far as `over`
  const roll = -82 * P.over * D;
  const f: V3 = [1, 0, 0];
  const l: V3 = [0, Math.cos(roll), Math.sin(roll)];
  const u: V3 = [0, -Math.sin(roll), Math.cos(roll)];
  const at = (x: number, y: number, z: number): V3 => mul(add([0, 0, 3.0 * (1 - P.over) + 2.6 * P.over + P.hop], add(mul(f, x), add(mul(l, y), mul(u, z)))), K);
  // its legs and its feet gripping the stones (tucked under it as it lies)
  if (P.over < 0.5) {
    for (const k of [-1, 1]) {
      const foot: V3 = mul([0.9, k * 1.1, 0.25 + P.hop], K);
      put('legs', 'legs', { k: 'rod', a: at(0.3, k * 1.0, 1.2), b: foot, ra: 0.5, rb: 0.45, ramp: GOLD });
      for (const d of [-25, 0, 25]) put('legs', 'legs', { k: 'rod', a: foot, b: add(foot, mul([Math.cos(d * D), Math.sin(d * D), 0], 2.2 * K)), ra: 0.4, rb: 0.3, ramp: GOLD });
    }
  }
  // its body: a plump breast of gold, set with rubies and sapphires, its back plated
  const body = at(0, 0, 3.6);
  put('body', 'body', {
    k: 'ball', c: body, ax: [mul(f, 3.9 * K), mul(l, 2.7 * K), mul(u, (3.0 + 0.3 * P.throat) * K)],
    skin: (q, tone) => {
      if (q[0] > 0.35 && q[2] < 0.3 && hash(Math.round(q[1] * 5), Math.round(q[2] * 5), 7841) < 0.32) return hash(Math.round(q[1] * 5), Math.round(q[2] * 5), 7842) < 0.5 ? RUBY : SAPPHIRE[3];
      if (q[2] > 0.2 && Math.abs(fr(q[0] * 2.5 + q[2]) - 0.5) < 0.1) return GOLD[Math.max(1, tone - 1)];
      return GOLD[Math.min(4, tone + 1)];
    },
  });
  // its head: silver, a diamond eye either side, a long fine gold beak that opens as it sings
  const ha = P.head * D;
  const hu = norm(add(mul(f, Math.sin(ha) * -0.2), mul(u, 1)));
  const hf = norm(add(mul(f, Math.cos(ha)), mul(u, Math.sin(ha))));
  const hd = at(3.6, 0, 6.0);
  put('head', 'head', { k: 'ball', c: hd, ax: [mul(hf, 2.3 * K), mul(l, 2.0 * K), mul(hu, 2.2 * K)], skin: (q, tone) => (q[2] < -0.3 && q[0] > 0 ? SILVER[Math.min(4, tone + 1)] : SILVER[tone]) });
  put('head', 'head', { k: 'rod', a: lerp3(body, hd, 0.4), b: hd, ra: 1.8 * K, rb: 1.5 * K, ramp: SILVER });
  const tip = add(hd, mul(hf, 5.2 * K));
  const open = 0.15 + 1.1 * P.beak;
  put('head', 'beak', { k: 'rod', a: add(hd, add(mul(hf, 1.9 * K), mul(hu, 0.3 * K))), b: add(tip, mul(hu, open * 0.6 * K)), ra: 0.6 * K, rb: 0.15 * K, ramp: GOLD });
  put('head', 'beak', { k: 'rod', a: add(hd, add(mul(hf, 1.9 * K), mul(hu, -0.3 * K))), b: add(tip, mul(hu, -open * 0.5 * K)), ra: 0.5 * K, rb: 0.15 * K, ramp: GOLD });
  for (const k of [-1, 1]) put('head', 'eye', { k: 'dot', p: add(hd, add(mul(hf, 1.1 * K), add(mul(l, k * 1.85 * K), mul(hu, 0.5 * K)))), c: DIAMOND, facing: mul(l, k) });
  // its wings: silver feathers edged in gold, folded along its sides or half spread
  for (const k of [-1, 1]) {
    const root = at(0.6, k * 2.3, 4.6);
    const out = norm(add(mul(f, -0.75), add(mul(l, k * (0.25 + 0.9 * P.wings)), mul(u, 0.15 + 0.6 * P.wings))));
    put('wings', 'wings', {
      k: 'panel', c: add(root, mul(out, 3.4 * K)), u: mul(out, 3.8 * K), v: mul(norm(cross(out, mul(l, k))), 2.0 * K),
      skin: (a, b, front, tone) => {
        const x = (a / K + 3.8) / 7.6;
        const y = b / (2.0 * K);
        if (Math.abs(y) > 1 - 0.55 * x * x || (x > 0.55 && fr(x * 6) < 0.25 && y < -0.2)) return null;
        if (fr(x * 4) < 0.14) return GOLD[3];
        return SILVER[Math.max(1, Math.min(4, front ? tone : tone - 1))];
      },
    });
  }
  // its tail: long gold and silver feathers, fanned
  for (let i = -2; i <= 2; i++) {
    const a = i * (7 + 12 * P.tail) * D;
    const dir = norm(add(mul(f, -Math.cos(a)), add(mul(l, Math.sin(a)), mul(u, 0.35))));
    const root = at(-3.0, 0, 3.8);
    put('tail', 'tail', { k: 'rod', a: root, b: add(root, mul(dir, 6.6 * K)), ra: 0.6 * K, rb: 0.95 * K, ramp: i % 2 ? GOLD : SILVER });
  }
  // its winding key in its back, turning
  const kb = at(-0.6, 0, 6.2);
  const kt = add(kb, mul(u, 2.4 * K));
  put('key', 'key', { k: 'rod', a: kb, b: kt, ra: 0.45 * K, rb: 0.45 * K, ramp: SILVER });
  const ka = P.key * D;
  const kw = add(mul(f, Math.cos(ka)), mul(l, Math.sin(ka)));
  for (const k of [-1, 1]) put('key', 'key', { k: 'ball', c: add(kt, add(mul(kw, k * 1.2 * K), mul(u, 0.5 * K))), ax: [mul(kw, 1.0 * K), mul(norm(cross(u, kw)), 0.35 * K), mul(u, 0.85 * K)], skin: GOLD });
  // its spring, sprung out of its breast as it lies broken (a coil of silver wire), coiling back in as it winds
  if (P.spring > 0.02) {
    const base = at(2.0, -1.4, 2.4);
    let prev: V3 | null = null;
    for (let i = 0; i <= 24; i++) {
      const k = i / 24;
      const a = k * TAU * 3.5;
      const p = add(base, mul(add(mul(f, 4.5 * k * P.spring), add(mul(l, (-1.2 - 2.6 * k * P.spring) + Math.cos(a) * 1.0), mul(u, Math.sin(a) * 1.0))), K));
      if (prev) put('spring', 'spring', { k: 'rod', a: prev, b: p, ra: 0.32, rb: 0.32, ramp: SILVER });
      prev = p;
    }
  }
  paintBits(st, bits, body);
  const px = st.whole(null);
  // ITS SONG: little notes of silver going up from its open beak and drifting away (grains: no glow)
  if (state === 'singing') {
    for (let i = 0; i < 12; i++) {
      const life = fr((t / BIRD.song) * 1.5 + i / 12);
      const p = add(tip, [life * 8 + Math.sin(life * 9 + i) * 3, Math.cos(life * 7 + i) * 4, 2 + life * 24]);
      const [x, y] = st.at(p);
      if (life < 0.85) lay(px, x, y, life < 0.3 ? DIAMOND : life < 0.6 ? SILVER[3] : SILVER[2], i % 3 === 0 && life < 0.5 ? 2 : 1);
    }
  }
  return { px, lights: [] };
}
