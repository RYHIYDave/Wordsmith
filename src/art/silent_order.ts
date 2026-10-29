// THE SILENT ORDER, THE HIGH CITY'S MEDIUM MOB (floors 17, 19 and 20; the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE
// GAME. Nothing of the game imports this file; `ORDER_ON` is off. Their moves are art/silent_order_moves.ts; what their
// blows leave in the world (the palm's grey wave, the knife in flight) art/silent_order_fx.ts.
//
// His doc's High City plan (approved by him): floor 17's enemies include "the Silent Order among the guests" (the
// prince's masked ball); floor 19's "the Silent Order's last" (the Keep); floor 20's "the Silent Order's last masks"
// (the Quiet Tower, the lair of the Moth, grey fog, no colour). Its story: "the prince opened the city to the Silent
// Order in return for his walls." Their brief, offered to him as a pop-up; his pick for how they move:
// “Still, then sudden (Recommended)”. The brief as offered: the cult that let the Hush in; black velvet hooded cloaks,
// the Order's blank white mask with no mouth; on 17 cloaked guests mingling at the ball, on 19 the Order's last, armed,
// cloaks over mail, on 20 only their masks, floating in the fog; the knight's size; utterly still, then a sudden rush
// close; the mouthless mask their mark; two attacks, a hushing palm that darkens your words and a thrown curved knife;
// dying, the mask cracks in two and the cloak falls empty to the floor; never gory, never a clown or a ghost; no sound
// at all, only cloth.
//
// ONE DESIGN, THREE DRESSINGS (`OrderWho`), on the same bones and the same moves:
//   THE GUEST (17): a hooded domino cloak of black velvet, lined dull grey, fastened at the throat with a silver clasp,
//     over court clothes: a black doublet buttoned in silver, a cascade of bone-white lace at the throat and the wrists,
//     black breeches, grey silk stockings, black buckled shoes; bone-white gloves; a grey sash, a curved knife in it.
//   THE ARMED LAST (19): heavier built; the same cloak over mail (a hauberk to the knee, mail sleeves), black leather
//     vambraces and boots, grey steel gauntlets; a broad belt of curved knives at the waist and a baldric of more across
//     the chest, their handles bone.
//   THE MASKS (20): only the mask, floating where a face would be, held up by a wisp of grey fog; below it the cloak's
//     ghost of a shape, barely there, drifting (grains: no edge of their own). Not a ghost: a mask held up by fog.
//   THE MASK (theirs, the Order's: as the black banners and the hooded lanterns of the Lower City have it, art/act2_set.ts):
//     a blank oval of bone white, sculpted (a brow, a ridge of nose, hollowed cheeks, a narrow chin), two almond eye holes,
//     NO MOUTH; in the dark of each eye hole, the dull pink of the Hush, the only colour on them; flaring brighter as they
//     wind up. As they die it cracks in two down the middle and the halves fall.
// Black, bone white and grey; the dull pink only in the eye holes, and the enemy's pink edge round them while they live.
// Nothing cyan.

import { INK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { skirtOf, wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, len, lerp3, mul, norm, sub } from './skeleton';
import type { Build, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const ORDER_ON = { on: false };

/** The three dressings: the guest at the ball (17), the armed last (19), the masks in the fog (20). */
export type OrderWho = 'guest' | 'armed' | 'mask';

const fr = (t: number): number => t - Math.floor(t);
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const D = Math.PI / 180;
const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);

// =============================================================================================
// THEIR COLOURS: black velvet, bone white, grey; the dull pink of the Hush only in the eye holes

/** Black velvet: near black, its soft sheen a cool grey where the light rolls over it. */
export const VELVET: Ramp = ['#08070c', '#110f18', '#24212f', '#3a3549', '#5a5470'];
/** The cloak's lining: a dull grey silk, seen where it turns or flies open. */
export const LINING: Ramp = ['#1c1b22', '#26252d', '#3f3d49', '#5a5763', '#77747f'];
/** The masks' (20) mask, to a face's: a little bigger, all there is of them. */
export const MASKS_SCALE = 1.25;
/** The Order's mask: bone white (the banners' and the lanterns' own, art/act2_set.ts). */
export const BONE: Ramp = ['#55514a', '#7a766e', '#bab4a6', '#d4cebe', '#ebe5d6'];
/** The guest's gloves and lace: a softer bone white. */
const LACE: Ramp = ['#4e4a46', '#6e6a64', '#aca69a', '#cac4b8', '#dfd9cc'];
/** The guest's doublet and breeches: black. */
const DOUBLET: Ramp = ['#15151b', '#1e1e25', '#36363f', '#4c4c57', '#64646f'];
/** Grey: silk stockings, the sash. */
const SILK: Ramp = ['#1d1c22', '#27262e', '#45444f', '#5e5d69', '#777682'];
const SHOE: Ramp = ['#07070a', '#0b0b0e', '#19191f', '#282830', '#3a3a45'];
/** Silver: buttons, the clasp, buckles. */
const SILVER: Ramp = ['#2c2c34', '#46464f', '#878793', '#b2b2be', '#d8d8e2'];
/** Mail, its links dithered. */
const MAIL: Ramp = ['#15161b', '#1f2127', '#41454e', '#636974', '#8a909b'];
/** Black leather: belts, vambraces, boots, sheaths. */
const LEATHER: Ramp = ['#0d0a09', '#15100e', '#2a201b', '#3c3028', '#4f4136'];
/** Grey steel: the armed last's gauntlets. */
const GAUNT: Ramp = ['#202128', '#2c2e36', '#555964', '#787d8a', '#9ca2ae'];
/** The curved knife: blackened steel, its edge ground bright. */
const BLADE: Ramp = ['#121218', '#1a1a22', '#30303a', '#45454f', '#5c5c68'];
const EDGE: Ramp = ['#3a3a44', '#585864', '#9e9eaa', '#c8c8d2', '#eaeaf2'];
/** The dark inside the hood and behind the mask's eyes. */
const HOLLOW = '#06050a';
const EYE_DARK = '#110e15';
/** The fog of the Quiet Tower (the masks'): greys, no colour. */
export const FOG = ['#3a3842', '#4c4a55', '#64616d', '#827f8b', '#a3a0ab', '#c6c3cc', '#e0dde4'] as const;

// =============================================================================================
// THE BODY: the knight's size (58)

/** The guest and the masks: slender, the knight's height. */
export const ORDER_BODY: Build = buildOf(58, 1.3, { shoulders: 0.98, chest: 0.95, depth: 0.96, waist: 0.9, hips: 0.95, limbs: 0.92 });
/** The armed last: the knight's height, heavier through the shoulders and chest. */
export const ORDER_ARMED_BODY: Build = buildOf(59, 1.3, { shoulders: 1.1, chest: 1.12, depth: 1.08, waist: 1.06, hips: 1.04, arms: 1.02, limbs: 1.04 });
export const bodyOf = (who: OrderWho): Build => (who === 'armed' ? ORDER_ARMED_BODY : ORDER_BODY);
/** Their picture: room for the knife raised high, the palm thrust out, the cloak flung, and the rush's streak behind. */
export const ORDER_CANVAS: MobCanvas = { w: 340, h: 260, ax: 176, ay: 200 };

// =============================================================================================
// THE CURVED KNIFE

/** The knife: its bone handle behind the fist, its curved blade before it (the figure's own lengths), how far the blade bows. */
export const KNIFE = { handle: 5.2, blade: 12.5, bow: 3.4 } as const;
/** The knife as it lies at a moment: the pommel, the guard, points along the blade's back from the guard to its point, and the way its edge faces. */
export function knifeOf(hand: V3, point: V3, across: V3, big = 1): { pommel: V3; guard: V3; spine: V3[]; edge: V3[]; tip: V3 } {
  const way = norm(point, [1, 0, 0]);
  const up = norm(sub(across, mul(way, dot(across, way))), [0, 0, 1]);
  const guard = add(hand, mul(way, 1.2 * big));
  const spine: V3[] = [];
  const edge: V3[] = [];
  const n = 8;
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    // (it bows up, its back a curve, its point swept up: a crescent)
    const bow = (KNIFE.bow * Math.sin(Math.PI * 0.9 * k) + 1.2 * k * k) * big;
    const w = 1.5 * (1 - 0.85 * k * k) * big;
    const p = add(guard, add(mul(way, KNIFE.blade * k * big), mul(up, bow)));
    spine.push(p);
    edge.push(add(p, mul(up, -w)));
  }
  return { pommel: add(hand, mul(way, -KNIFE.handle * big)), guard, spine, edge, tip: spine[n] };
}
/** A KNIFE SHEATHED at a belt or a sash: its bone handle up out of it (`up`), its sheath of black leather down along the body, bowed as the blade is (`out`: away from the body). */
export function sheathedKnife(put: Put, part: string, at: V3, up: V3, out: V3): void {
  const u = norm(up);
  const o = norm(sub(out, mul(u, dot(out, u))), [1, 0, 0]);
  const top = add(at, mul(u, KNIFE.handle));
  put(part, 'knives', { k: 'rod', a: at, b: top, ra: 0.8, rb: 0.72, ramp: BONE });
  put(part, 'knives', { k: 'ball', c: top, ax: sphere(1.0), skin: BONE });
  const tipA = add(at, add(mul(u, -KNIFE.blade * 0.5), mul(o, 1.2)));
  const tipB = add(at, add(mul(u, -KNIFE.blade * 0.95), mul(o, 2.6)));
  put(part, 'knives', { k: 'rod', a: add(at, mul(u, 0.4)), b: tipA, ra: 1.25, rb: 1.05, ramp: LEATHER });
  put(part, 'knives', { k: 'rod', a: tipA, b: tipB, ra: 1.05, rb: 0.45, ramp: LEATHER });
}
/** THE KNIFE in a fist (or lying, or flying): bone handle and pommel, a dark guard, the crescent blade with its bright edge; a pink glint along it in the warning. */
export function knifeBits(put: Put, part: string, piece: string, hand: V3, point: V3, across: V3, glint: number, big = 1): void {
  const k = knifeOf(hand, point, across, big);
  put(part, piece, { k: 'rod', a: k.pommel, b: add(hand, mul(norm(point), 0.9 * big)), ra: 0.85 * big, rb: 0.75 * big, ramp: BONE });
  put(part, piece, { k: 'ball', c: k.pommel, ax: sphere(1.05 * big), skin: BONE });
  put(part, piece, { k: 'ball', c: k.guard, ax: sphere(1.0 * big), skin: LEATHER });
  for (let i = 0; i + 1 < k.spine.length; i++) {
    const r = 0.95 * big * (1 - 0.6 * (i / (k.spine.length - 1)));
    put(part, piece, { k: 'rod', a: lerp3(k.spine[i], k.edge[i], 0.35), b: lerp3(k.spine[i + 1], k.edge[i + 1], 0.35), ra: r, rb: r * 0.86, ramp: BLADE });
    put(part, piece, { k: 'rod', a: k.edge[i], b: k.edge[i + 1], ra: 0.42 * big, rb: 0.36 * big, ramp: EDGE });
  }
  if (glint > 0.05) {
    put(part, 'glint', { k: 'glow', p: k.spine[5], c: FLAME[2], r: 5 + 6 * glint, a: 0.45 * glint });
    const tick = Math.floor(glint * 10);
    for (let i = 1; i < k.edge.length; i += 2) if ((i + tick) % 3 === 0) put(part, 'glint', { k: 'mote', p: add(k.edge[i], [0, 0, 0.6]), c: i % 2 ? FLAME[3] : FLAME[4], size: 1 });
  }
}

// =============================================================================================
// THE MASK

/** Its shape on its own ball (`u`: forward, left, up, each -1 to 1): inside the mask's outline? (a broad brow, the cheekbones, tapering to a narrow chin) */
function inMask(u: V3): boolean {
  if (u[0] < 0.1) return false;
  return inOutline(u);
}
function inOutline(u: V3): boolean {
  const w = u[2] > 0.15 ? 1 : 1 - (0.15 - u[2]) * 0.46;
  return Math.abs(u[1]) <= w * Math.sqrt(Math.max(0, 1 - u[2] * u[2])) + 0.02;
}
/** Where the crack runs down it (across, at a height): a jagged line from the brow down to the chin. */
function crackAt(up: number): number {
  return 0.05 * Math.sin(up * 19) + 0.035 * Math.sign(Math.sin(up * 7.3)) * Math.abs(Math.sin(up * 7.3)) ** 0.5;
}
/** An eye hole: almond, its outer corner lifted. How far inside it (below 0 outside). */
function eyeHole(u: V3, shift: number): number {
  const a = Math.abs(u[1] - shift);
  if (a < 0.14 || a > 0.66) return -1;
  const k = (a - 0.4) / 0.26;
  const mid = 0.17 + 0.07 * k;
  const half = 0.14 * (1 - k * k);
  return half - Math.abs(u[2] - mid);
}
/** The mask's skin: bone white, sculpted by the light; the eye holes dark; no mouth. `half`: which side of the crack (0 whole). */
function maskSkin(crack: number, half: number, shift: number): Skin {
  return (u, tone) => {
    const c = crackAt(u[2]);
    // (from behind: the inside of the mask's shell, in its own shadow)
    if (u[0] < 0.1) {
      if (u[0] > -0.1 || !inOutline([-u[0], u[1], u[2]])) return null;
      if (half !== 0 && (u[1] - c) * half < 0) return null;
      return BONE[Math.max(1, Math.min(2, tone - 1))];
    }
    if (!inMask(u)) return null;
    // (the crack, from the brow down, as far as it has run)
    const run = 1 - 2.1 * crack;
    if (half !== 0 && (u[1] - c) * half < 0) return null;
    if (crack > 0 && u[2] > run && Math.abs(u[1] - c) < 0.05 + 0.07 * crack) return INK;
    if (eyeHole(u, shift) > 0) return EYE_DARK;
    // its sculpture: the brow's shadow over the eyes, the ridge of the nose, the cheeks hollowed under the cheekbones, the edge rolled
    let t = Math.min(4, tone + 1);
    if (Math.abs(u[1]) < 0.62 && u[2] > 0.27 && u[2] < 0.33) t = Math.max(1, t - 1);
    if (Math.abs(u[1]) < 0.06 && u[2] < 0.1 && u[2] > -0.34) t = Math.min(4, t + 1);
    if (Math.abs(u[1]) > 0.4 && Math.abs(u[1]) < 0.75 && u[2] < -0.12 && u[2] > -0.48) t = Math.max(1, t - 1);
    if (u[0] < 0.24) t = Math.max(1, t - 1);
    return BONE[t];
  };
}
/** Where the mask is on a head, and its three ways. */
export function maskOn(st: Stage, s: Skeleton, B: Build, scale = 1): { c: V3; ax: [V3, V3, V3]; ff: V3; fl: V3; fu: V3; eyes: V3[]; shift: number } {
  const [ff, fl, fu] = wornOn(st, s, 10);
  const hr: V3 = [B.headR[0] * scale, B.headR[1] * scale, B.headR[2] * scale];
  const c = add(s.head, add(mul(ff, hr[0] * 0.5), mul(fu, -0.3)));
  const ax: [V3, V3, V3] = [mul(ff, hr[0] * 0.9), mul(fl, hr[1] * 1.32), mul(fu, hr[2] * 1.24)];
  // (its eye holes drawn a little toward whoever looks, as the heroes' eyes are (art/skin.ts, eyesToward): seen three
  // quarters on, an eye hole the far side of the middle is lost at its edge)
  const cam = (Math.atan2(dot(st.eye, fl), dot(st.eye, ff)) * 180) / Math.PI;
  const front = clamp01((110 - Math.abs(cam)) / 40);
  const shift = Math.sin((Math.max(-40, Math.min(40, cam * 0.6)) * front * Math.PI) / 180) * 0.75;
  const eyes = [1, -1].map((k) => {
    const y = shift + k * 0.4;
    const z = 0.17 + 0.07 * 0;
    return add(c, add(mul(ax[0], Math.sqrt(Math.max(0.05, 1 - y * y - z * z)) * 0.98), add(mul(ax[1], y), mul(ax[2], z))));
  });
  return { c, ax, ff, fl, fu, eyes, shift };
}
/** THE MASK on a head: whole, or cracked (`crack` 0..1; past 0, in two halves, each a piece of its own to fall); the dull pink in its eye holes (`lit`), flaring (`flare`). */
function mask(put: Put, st: Stage, s: Skeleton, B: Build, crack: number, lit: number, flare: number, scale = 1): ReturnType<typeof maskOn> {
  const m = maskOn(st, s, B, scale);
  if (crack <= 0) put('mask', 'mask', { k: 'ball', c: m.c, ax: m.ax, skin: maskSkin(0, 0, m.shift) });
  else for (const half of [1, -1]) put(half > 0 ? 'maskL' : 'maskR', half > 0 ? 'maskL' : 'maskR', { k: 'ball', c: m.c, ax: m.ax, skin: maskSkin(crack, half, m.shift) });
  // the dull pink in the dark of each eye hole (guttering out as they die)
  if (lit > 0.3) {
    const part = crack <= 0 ? 'mask' : null;
    m.eyes.forEach((e, i) => {
      const c = flare > 0.5 ? FLAME[2] : FLAME[1];
      put(part ?? (i === 0 ? 'maskL' : 'maskR'), 'eyes', { k: 'dot', p: e, c, facing: m.ff, c2: flare > 0.5 ? FLAME[3] : FLAME[2] });
    });
    if (flare > 0.05) m.eyes.forEach((e) => put('glowing', 'eyes', { k: 'glow', p: e, c: FLAME[2], r: 3 + 4 * flare, a: 0.25 + 0.3 * flare }));
  }
  return m;
}

// =============================================================================================
// THE HOOD AND THE CLOAK

/** The hood: deep, round the head, its mouth framing the mask, its peak falling back; the dark inside it. Empty, it is dark all the way in. */
function hood(put: Put, st: Stage, s: Skeleton, B: Build, lag: V3, empty: number): void {
  const [ff, fl, fu] = wornOn(st, s, 6);
  const hr = B.headR;
  const hc = add(s.head, add(mul(fu, 0.9), mul(ff, -1.1)));
  // the dark inside it, where a head is (or is not)
  put('head', 'hollow', { k: 'ball', c: add(s.head, mul(ff, -0.4)), ax: [mul(ff, hr[0] * 1.0), mul(fl, hr[1] * 1.05), mul(fu, hr[2] * 1.0)], skin: () => HOLLOW });
  put('hood', 'hood', {
    k: 'ball',
    c: hc,
    ax: [mul(ff, hr[0] * 1.52), mul(fl, hr[1] * 1.66), mul(fu, hr[2] * 1.4)],
    skin: (u, tone) => {
      // its mouth: open before the face; the velvet rolled at its edge catching the light, the lining a sliver inside it
      const open = u[0] > 0.36 && Math.abs(u[1]) < 0.8 - 0.14 * Math.max(0, u[2]) && u[2] < 0.64 - 0.05 * empty;
      if (open) return null;
      const rim = u[0] > 0.22 && Math.abs(u[1]) < 0.86 && u[2] < 0.72;
      if (rim) return u[0] > 0.29 ? LINING[Math.max(1, Math.min(3, tone))] : VELVET[Math.min(4, tone + 1)];
      return VELVET[tone];
    },
  });
  // its peak, falling back over the cloak
  const top = add(hc, add(mul(ff, -hr[0] * 1.1), mul(fu, hr[2] * 0.6)));
  const end = add(add(hc, add(mul(ff, -hr[0] * 1.9), mul(fu, -hr[2] * 0.5))), mul(lag, 0.5));
  put('hood', 'hood', { k: 'rod', a: top, b: end, ra: hr[1] * 0.85, rb: 0.9, ramp: VELVET });
}

/** A ring's edge as points (n of them), pushed out wherever an arm or a leg would come through it (`out`: points of them with how thick each is). */
function draped(r: Ring, n: number, out: ReadonlyArray<readonly [V3, number]>, band: number): Ring {
  const u = r.u;
  const v = r.v;
  const lu = len3(u) || 1;
  const lv = len3(v) || 1;
  const uh = mul(u, 1 / lu);
  const vh = mul(v, 1 / lv);
  const up = norm(cross(uh, vh), [0, 0, 1]);
  const base = r.pts && r.pts.length === n ? r.pts : null;
  const pts: V3[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const at = base ? base[i] : add(r.c, add(mul(u, Math.cos(a)), mul(v, Math.sin(a))));
    const d0 = sub(at, r.c);
    let rr = len3(d0);
    const dir = mul(d0, 1 / (rr || 1));
    for (const [q, th] of out) {
      const dq = sub(q, r.c);
      const h = dot(dq, up);
      if (Math.abs(h) > band) continue;
      const flat = sub(dq, mul(up, h));
      const fl = len3(flat);
      if (fl < 1e-3) continue;
      const cos = dot(flat, dir) / fl;
      if (cos < 0.55) continue;
      const need = (fl * cos + th + 1.0) * (1 - Math.abs(h) / band) + rr * (Math.abs(h) / band);
      const w = (cos - 0.55) / 0.45;
      if (need > rr) rr = rr + (need - rr) * Math.min(1, w * 1.6);
    }
    pts.push(add(r.c, mul(dir, rr)));
  }
  return { ...r, pts };
}

/** What a cloak goes round: its arms and legs, points with how thick (so that none of them comes through it). */
function limbsOf(s: Skeleton, B: Build): [V3, number][] {
  const out: [V3, number][] = [];
  const arm = B.armR[0] * 1.35;
  for (const [sh, el, ha] of [[s.shoulderL, s.elbowL, s.handL], [s.shoulderR, s.elbowR, s.handR]] as const) {
    for (let k = 1; k <= 4; k++) out.push([lerp3(sh, el, k / 4), arm]);
    for (let k = 1; k <= 4; k++) out.push([lerp3(el, ha, k / 4), arm * 0.9]);
  }
  return out;
}

/** THE CLOAK's shape at a moment: its rings from the throat down to the hem by the floor, going round the arms and the legs; its hem left behind by how they move (`sway`) and stirred (`wind`). */
export function cloakRings(s: Skeleton, B: Build, sway: V3, wind: number): Ring[] {
  const [cf, cl, cu] = s.chest;
  const be = s.belly;
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.7));
  const sw = (k: number): V3 => mul(sway, k);
  const top: Ring[] = [
    { c: add(add(s.neck, mul(cu, -0.6)), sw(0.05)), u: mul(cf, B.ribDeep * 0.7 + 1.8), v: mul(cl, B.shoulderHalf * 0.62 + 1.6) },
    { c: add(add(s.neck, mul(cu, -B.shoulderDrop - 2.4)), sw(0.1)), u: mul(cf, B.ribDeep + 2.4), v: mul(cl, B.shoulderHalf + 3.2) },
    { c: add(lerp3(s.ribs, s.neck, 0.35), sw(0.18)), u: mul(cf, B.ribDeep + 3.0), v: mul(cl, B.ribHalf + 3.8) },
  ];
  const skirt = skirtOf(s, B, {
    top: { c: add(waistC, sw(0.28)), u: mul(be[0], B.waistDeep + 3.4), v: mul(be[1], B.waistHalf + 4.4) },
    drop: Math.max(4, s.pelvis[2] - 2.6),
    wide: B.pelvisHalf + 10.5,
    deep: B.pelvisDeep + 8.5,
    lag: sw(1.0),
    wind,
    // (going fast, the back of it streams out flat behind them)
    gale: Math.max(0, Math.min(1.8, (-sway[0] - 4) / 7)),
    pad: 1.6,
  });
  // (its back hem flapping up with each stride as they run: `sway`'s third)
  const flap = sway[2];
  if (flap !== 0 && skirt.length) {
    const hem = skirt[skirt.length - 1];
    const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
    if (hem.pts) hem.pts = hem.pts.map((p) => {
      const rear = Math.max(0, -dot(norm(sub(p, hem.c)), f));
      return [p[0] - flap * 0.6 * rear, p[1], p[2] + flap * rear * rear] as V3;
    });
  }
  const limbs = limbsOf(s, B);
  const n = 28;
  return [...top, ...skirt].map((r, i) => draped(r, n, i < 4 ? limbs : [], 5));
}
/** The arc of a ring the cloak is (degrees round from its front): open before them. */
export const CLOAK_ARC: readonly [number, number] = [68, 292];

/** THE CLOAK AND ITS MANTLE: the cloak hanging from the shoulders to the floor, open before them, its grey lining where it turns; the mantle over the shoulders; a silver clasp at the throat; its front edges piped grey. */
function cloak(put: Put, s: Skeleton, B: Build, rings: Ring[]): void {
  put('cloak', 'cloak', { k: 'cloth', rings: rings.slice(1), ramp: VELVET, look: { arc: CLOAK_ARC, folds: [82, 100, 118, 138, 158, 180, 202, 222, 242, 260, 278], lift: 0.02, lining: 0.05, hem: LINING } });
  // the mantle: round the shoulders, closed before the throat
  const [cf, cl, cu] = s.chest;
  const mant: Ring[] = [
    rings[0],
    { c: add(s.neck, mul(cu, -B.shoulderDrop - 3.8)), u: mul(cf, B.ribDeep + 2.8), v: mul(cl, B.shoulderHalf + 3.4), pts: rings[1].pts?.map((p) => add(p, mul(cu, -1.4))) },
  ];
  put('mantle', 'cloak', { k: 'cloth', rings: mant, ramp: VELVET, look: { folds: [30, -30, 150, -150], lift: 0.2 } });
  // its front edges, piped grey, down from the mantle to the hem
  for (const deg of [CLOAK_ARC[0] + 1, CLOAK_ARC[1] - 1]) {
    const a = deg * D;
    for (let i = 1; i + 1 < rings.length; i++) {
      const at = (r: Ring): V3 => {
        if (r.pts) {
          const k = Math.round((a / (Math.PI * 2)) * r.pts.length) % r.pts.length;
          return r.pts[k];
        }
        return add(r.c, add(mul(r.u, Math.cos(a)), mul(r.v, Math.sin(a))));
      };
      put('cloak', 'piping', { k: 'rod', a: at(rings[i]), b: at(rings[i + 1]), ra: 0.6, rb: 0.6, ramp: SILK });
    }
  }
  // the clasp at the throat: a silver boss, the blank mask on it
  const clasp = add(add(s.neck, mul(cu, -2.2)), mul(cf, B.ribDeep * 0.7 + 2.4));
  put('mantle', 'clasp', { k: 'ball', c: clasp, ax: [mul(cf, 0.8), mul(cl, 1.5), mul(cu, 1.7)], skin: (u, tone) => (u[0] > 0.6 && Math.abs(u[1]) > 0.2 && Math.abs(u[1]) < 0.55 && u[2] > 0 && u[2] < 0.35 ? SILVER[1] : SILVER[Math.max(2, tone)]) });
}

/** THE EMPTY CLOAK FALLING (as they die): its rings as they were when it emptied, each dropping to the floor and spreading into a heap of velvet (`k`: seconds since it emptied). */
export function heapRings(was: Ring[], k: number): Ring[] {
  const G = 420;
  const n = was.length;
  const c0 = was[n - 1].c;
  return was.map((r, i) => {
    // (the higher it was, the longer it falls; where it comes to lie: the hem on the floor, the rest crumpled in a mound
    // on it, each a little off the last, smaller toward its top)
    const f = n > 1 ? 1 - i / (n - 1) : 0;
    const restZ = 0.8 + 8.5 * Math.pow(f, 0.7);
    const fall = Math.max(0, r.c[2] - restZ);
    const T = Math.sqrt((2 * Math.max(0.5, fall)) / G);
    const e = clamp01(k / T);
    const g = e * e;
    const settle = k > T ? Math.exp(-(k - T) * 8) * Math.sin((k - T) * 24) * 0.06 : 0;
    const size = f < 0.12 ? 1.06 : 0.92 - 0.42 * f;
    const spread = 1 + (size - 1) * g + settle;
    const to: V3 = [c0[0] + Math.sin(i * 2.3) * 3.0 * f + 2.2 * f, c0[1] + Math.cos(i * 1.7) * 2.6 * f, restZ];
    const c: V3 = [r.c[0] + (to[0] - r.c[0]) * g, r.c[1] + (to[1] - r.c[1]) * g, r.c[2] + (restZ - r.c[2]) * g];
    const flatU: V3 = [r.u[0], r.u[1], r.u[2] * (1 - g)];
    const flatV: V3 = [r.v[0], r.v[1], r.v[2] * (1 - g)];
    const pts = r.pts?.map((p) => {
      const d = sub(p, r.c);
      const a = Math.atan2(d[1], d[0]);
      // (crumpled: lobes and folds round it, not a smooth ring)
      const lumpy = 1 + g * (0.16 * Math.sin(a * 3 + i * 1.7) + 0.1 * Math.sin(a * 5 + i * 0.9));
      return add(c, [d[0] * spread * lumpy, d[1] * spread * lumpy, d[2] * (1 - g) + 0.9 * g * Math.sin(a * 4 + i)]) as V3;
    });
    return { c, u: mul(flatU, spread), v: mul(flatV, spread), pts };
  });
}

// =============================================================================================
// HANDS, ARMS, LEGS, BODIES

/** How a hand is held: closed round something (1) or open; its fingers bent up off the forearm at the wrist (`lift`, 0 straight on, 1 square up: a palm thrust out); spread; the forefinger alone straight (`point`). */
export interface HandHold {
  curl: number;
  lift?: number;
  spread?: number;
  point?: boolean;
  /** The way the fingers point, and the way the palm faces (the figure's own axes), if the hand is held so (a palm thrust out, fingers up). */
  fingers?: V3;
  face?: V3;
}
/** A HAND: the palm and four fingers and a thumb, as `hold` says, in `ramp` (a glove, a gauntlet). */
function handBits(put: Put, side: 'L' | 'R', s: Skeleton, hold: HandHold, ramp: Ramp, cuff: Ramp | null): void {
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const cu = s.chest[2];
  const fore = norm(sub(hand, el), [0, 0, -1]);
  // the back of the hand faces up the arm's own up; bent up at the wrist by `lift`
  const e1 = norm(sub(cu, mul(fore, dot(cu, fore))), [0, 0, 1]);
  const lift = clamp01(hold.lift ?? 0);
  const dir = hold.fingers ? norm(add(mul(norm(hold.fingers), 0.85), mul(fore, 0.15)), fore) : norm(add(mul(fore, 1 - lift), mul(e1, lift * 1.1)), fore);
  const face0 = hold.face ? norm(hold.face) : norm(sub(mul(fore, lift), mul(e1, 1 - lift)), [0, 0, -1]);
  const palmN = norm(sub(face0, mul(dir, dot(face0, dir))), norm(cross(dir, [0, 1, 0]), [0, 0, -1]));
  const across = norm(cross(dir, palmN), [0, 1, 0]);
  const sgn = side === 'L' ? 1 : -1;
  const wrist = add(hand, mul(fore, -1.0));
  if (cuff) put(`hand${side}`, `cuff${side}`, { k: 'rod', a: add(wrist, mul(fore, -1.6)), b: add(wrist, mul(fore, 0.3)), ra: 1.9, rb: 1.6, ramp: cuff });
  put(`hand${side}`, `hand${side}`, { k: 'ball', c: add(hand, mul(dir, 0.6)), ax: [mul(dir, 1.9), mul(across, 1.75), mul(palmN, 0.95)], skin: ramp, far: true });
  const curl = clamp01(hold.curl);
  const spread = hold.spread ?? 0.4;
  for (let i = 0; i < 4; i++) {
    const c = hold.point && i === (side === 'L' ? 0 : 3) ? 0 : curl;
    const fan = (i - 1.5) * 0.5 * spread;
    const fd = norm(add(dir, mul(across, fan * sgn * -1)), dir);
    const base = add(hand, add(mul(dir, 1.8), mul(across, (i - 1.5) * 0.78 * -sgn)));
    const mid = add(base, add(mul(fd, 1.6 * (1 - 0.45 * c)), mul(palmN, 1.1 * c)));
    const tip = add(mid, add(mul(fd, 1.2 * (1 - 0.85 * c)), mul(palmN, 1.3 * c)));
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: base, b: mid, ra: 0.55, rb: 0.5, ramp, far: true });
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: mid, b: tip, ra: 0.5, rb: 0.4, ramp, far: true });
  }
  // the thumb, from the heel of the hand toward the palm's side
  const tb = add(hand, add(mul(dir, 0.4), mul(across, 1.5 * sgn)));
  const tt = add(tb, add(mul(dir, 1.6 + 0.6 * spread), add(mul(across, (0.9 + spread) * sgn * (1 - curl)), mul(palmN, 1.2 * curl))));
  put(`hand${side}`, `finger${side}`, { k: 'rod', a: tb, b: tt, ra: 0.6, rb: 0.45, ramp, far: true });
}
/** A ball along a limb from `a` to `b`, `r` round, its round made about the limb's own line (never folding flat): a sleeve, a puffed thigh. */
function sleeve(put: Put, part: string, piece: string, a: V3, b: V3, r: number, along: number, s: Skeleton, skin: Skin): void {
  const ax = norm(sub(b, a), [0, 0, -1]);
  const ref = Math.abs(dot(ax, s.chest[0])) > 0.7 ? s.chest[2] : s.chest[0];
  const e1 = norm(cross(ax, ref), s.chest[1]);
  const e2 = norm(cross(e1, ax), s.chest[0]);
  put(part, piece, { k: 'ball', c: lerp3(a, b, 0.5), ax: [mul(ax, (len3(sub(b, a)) / 2) * along), mul(e1, r), mul(e2, r)], skin, far: true });
}
/** Mail: its links, dithered, lit as the steel is. */
const MAIL_SKIN: Skin = (_u, tone, x, y) => MAIL[(x + y * 2) % 3 === 0 ? Math.max(1, tone - 1) : (x * 3 + y) % 4 === 0 ? Math.min(4, tone + 1) : tone];
/** Lace: ruffled, scalloped. */
const LACE_SKIN: Skin = (u, tone) => LACE[Math.sin(u[2] * 14 + Math.atan2(u[1], u[0]) * 3) > 0.35 ? Math.max(1, tone - 1) : Math.min(4, tone + (u[0] > 0.5 ? 1 : 0))];

/** AN ARM: the guest's black velvet sleeve, a lace cuff, a bone-white glove; the armed last's mail to the elbow, a black leather vambrace, a grey steel gauntlet. */
function arm(put: Put, who: OrderWho, s: Skeleton, B: Build, side: 'L' | 'R', hold: HandHold): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const [r0, r1, r2] = B.armR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  const wrist = add(hand, mul(fore, -1.2));
  if (who === 'guest') {
    sleeve(put, `arm${side}`, `arm${side}`, sh, el, r0 * 1.42, 1.0, s, DOUBLET);
    put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.25, rb: r1 * 1.2, ramp: DOUBLET, far: true });
    put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.2), skin: DOUBLET, far: true });
    put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: wrist, ra: r1 * 1.15, rb: r2 * 1.2, ramp: DOUBLET, far: true });
    sleeve(put, `fore${side}`, `lace${side}`, add(wrist, mul(fore, -1.4)), add(wrist, mul(fore, 0.6)), r2 * 2.1, 1.1, s, LACE_SKIN);
    handBits(put, side, s, hold, LACE, null);
  } else {
    sleeve(put, `arm${side}`, `arm${side}`, sh, el, r0 * 1.38, 1.05, s, MAIL_SKIN);
    put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.3), skin: MAIL_SKIN, far: true });
    put(`fore${side}`, `fore${side}`, { k: 'rod', a: lerp3(el, wrist, 0.15), b: wrist, ra: r1 * 1.32, rb: r2 * 1.4, ramp: LEATHER, far: true });
    handBits(put, side, s, hold, GAUNT, GAUNT);
  }
}
/** A LEG: the guest's black breeches to the knee, grey silk stockings, black buckled shoes; the armed last's black leather hose and boots. */
function leg(put: Put, who: OrderWho, s: Skeleton, B: Build, side: 'L' | 'R'): void {
  const hip = side === 'L' ? s.hipL : s.hipR;
  const knee = side === 'L' ? s.kneeL : s.kneeR;
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const [rH, rK, rA] = B.legR;
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
  const up3 = norm(cross(fwd, side3), [0, 0, 1]);
  if (who === 'guest') {
    put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.12, rb: rK * 1.12, ramp: DOUBLET, far: true });
    sleeve(put, `leg${side}`, `breech${side}`, hip, lerp3(hip, knee, 1.05), rH * 1.3, 0.62, s, DOUBLET);
    put(`shin${side}`, `shin${side}`, { k: 'rod', a: knee, b: ankle, ra: rK * 1.02, rb: rA * 1.0, ramp: SILK, far: true });
    put(`foot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.52), mul(up3, 1.3)), ax: [mul(fwd, 4.4), mul(side3, 1.8), mul(up3, 1.4)], skin: SHOE, far: true });
    put(`foot${side}`, `buckle${side}`, { k: 'dot', p: add(lerp3(heel, toe, 0.62), mul(up3, 2.6)), c: SILVER[3], facing: up3 });
  } else {
    put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.15, rb: rK * 1.15, ramp: LEATHER, far: true });
    put(`shin${side}`, `shin${side}`, { k: 'rod', a: knee, b: ankle, ra: rK * 1.32, rb: rA * 1.3, ramp: LEATHER, far: true });
    const sh = norm(sub(ankle, knee), [0, 0, -1]);
    put(`shin${side}`, `bootTop${side}`, { k: 'rod', a: add(knee, mul(sh, 0.4)), b: add(knee, mul(sh, 2.4)), ra: rK * 1.55, rb: rK * 1.45, ramp: LEATHER, far: true });
    put(`foot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.5), mul(up3, 1.6)), ax: [mul(fwd, 4.9), mul(side3, 2.2), mul(up3, 1.8)], skin: LEATHER, far: true });
  }
}

/** The trunk's rings (a doublet, a hauberk): from below the hips to the throat. */
function trunkRings(s: Skeleton, B: Build, pad: number, hemDrop: number): Ring[] {
  const [cf, cl, cu] = s.chest;
  const be = s.belly;
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  return [
    { c: add(s.pelvis, mul(s.hips[2], -hemDrop)), u: mul(s.hips[0], B.pelvisDeep + 1.6 + pad), v: mul(s.hips[1], B.pelvisHalf + 1.9 + pad) },
    { c: waistC, u: mul(be[0], B.waistDeep + 1.2 + pad), v: mul(be[1], B.waistHalf + 1.2 + pad) },
    { c: s.ribs, u: mul(cf, B.ribDeep + 1.3 + pad), v: mul(cl, B.ribHalf + 1.4 + pad) },
    { c: lerp3(s.ribs, s.neck, 0.72), u: mul(cf, B.ribDeep + 0.9 + pad), v: mul(cl, B.shoulderHalf + 0.4 + pad) },
    { c: add(s.neck, mul(cu, -0.6)), u: mul(cf, 3.2 + pad * 0.5), v: mul(cl, 3.8 + pad * 0.5) },
  ];
}
/** A ring round the waist, `out` beyond the trunk. */
function waistRing(s: Skeleton, B: Build, out: number): Ring {
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.5));
  return { c: waistC, u: mul(s.belly[0], B.waistDeep + out), v: mul(s.belly[1], B.waistHalf + out) };
}
/** A point on a ring, `deg` round from its front. */
const onRing = (r: Ring, deg: number, out = 0): V3 => {
  const a = deg * D;
  return add(r.c, add(mul(r.u, Math.cos(a) * (1 + out / (len3(r.u) || 1))), mul(r.v, Math.sin(a) * (1 + out / (len3(r.v) || 1)))));
};

/** THE GUEST'S COURT CLOTHES: the black doublet buttoned in silver, the lace at the throat, the grey sash and the knife in it (unless it is in the hand). */
function courtClothes(put: Put, s: Skeleton, B: Build, sheathed: boolean): void {
  const [cf, cl, cu] = s.chest;
  put('body', 'doublet', { k: 'cloth', rings: trunkRings(s, B, 0.3, 4.0), ramp: DOUBLET, look: { folds: [0, 35, -35, 80, -80, 140, -140], lift: 0.04 } });
  // silver buttons down its front
  for (let i = 0; i < 6; i++) {
    const p = add(lerp3(lerp3(s.ribs, s.neck, 0.6), add(s.pelvis, mul(s.hips[2], B.waist * 0.6)), i / 5), mul(lerp3(cf, s.belly[0], i / 5), B.ribDeep + 1.9 - 0.2 * i));
    put('body', 'buttons', { k: 'dot', p, c: i % 2 ? SILVER[3] : SILVER[4], facing: cf });
  }
  // the lace at the throat: a cascade of ruffles down the breast
  for (let i = 0; i < 3; i++) {
    const c = add(add(s.neck, mul(cu, -2.2 - 2.4 * i)), mul(cf, B.ribDeep * 0.55 + 2.0 + 0.5 * i));
    put('lace', 'lace', { k: 'ball', c, ax: [mul(cf, 1.3), mul(cl, 2.4 - 0.35 * i), mul(cu, 1.6)], skin: LACE_SKIN });
  }
  // the grey sash at the waist, its knot and ends at the left hip, the knife thrust through it
  const w = waistRing(s, B, 1.8);
  put('body', 'sash', { k: 'band', ring: w, ramp: SILK, rows: 2 });
  const knot = onRing(w, 60, 0.6);
  put('body', 'sash', { k: 'ball', c: knot, ax: sphere(1.4), skin: SILK });
  for (const k of [0, 1]) put('body', 'sash', { k: 'rod', a: knot, b: add(knot, add([0, 0, -6 - 2 * k], mul(s.hips[0], 0.8 * k))), ra: 0.8, rb: 0.6, ramp: SILK });
  if (sheathed) {
    const at = onRing(w, 38, 1.4);
    sheathedKnife(put, 'sheathed', at, norm(add(mul(cl, -0.35), [0, 0, 1])), sub(at, w.c));
  }
}
/** THE ARMED LAST'S MAIL AND KNIVES: the hauberk to the knee, the broad belt of curved knives at the waist, the baldric of more across the chest (each still sheathed but the one in the hand). */
function mailAndKnives(put: Put, s: Skeleton, B: Build, drawn: boolean): void {
  const [cf, cl, cu] = s.chest;
  // the hauberk: links over the trunk, and its skirt to the knee round the legs
  const rings = trunkRings(s, B, 0.7, 2.0);
  for (let i = 0; i + 1 < rings.length; i++) {
    const a = rings[i];
    const b = rings[i + 1];
    put('body', 'mail', { k: 'ball', c: lerp3(a.c, b.c, 0.5), ax: [lerp3(a.u, b.u, 0.5), lerp3(a.v, b.v, 0.5), mul(sub(b.c, a.c), 0.62)], skin: MAIL_SKIN });
  }
  const skirt = skirtOf(s, B, { top: rings[0], drop: B.thigh * 0.95, wide: B.pelvisHalf + 2.6, deep: B.pelvisDeep + 2.4, pad: 1.0 });
  put('body', 'mail', { k: 'cloth', rings: skirt, ramp: MAIL, look: { folds: [0, 45, -45, 100, -100, 160, -160], lift: 0.05 } });
  // the broad belt, and the knives in it round the front
  const w = waistRing(s, B, 2.4);
  put('body', 'belt', { k: 'band', ring: w, ramp: LEATHER, rows: 3 });
  put('body', 'belt', { k: 'ball', c: onRing(w, 0, 0.4), ax: [mul(s.belly[0], 0.7), mul(s.belly[1], 1.6), mul(s.belly[2], 1.4)], skin: SILVER });
  for (const [deg, i] of [[34, 0], [58, 1], [-40, 2]] as const) {
    if (drawn && i === 1) continue;
    const at = onRing(w, deg, 1.2);
    const out = norm(sub(at, w.c));
    sheathedKnife(put, 'belt', at, norm(add(mul(out, 0.3), [0, 0, 1])), out);
  }
  // the baldric over the right shoulder and across the breast to the left hip, three more knives on it
  const from = add(add(s.shoulderR, mul(cu, 1.4)), mul(cf, 1.6));
  const to = onRing(w, 75, 0.8);
  const n = 7;
  let prev = from;
  for (let i = 1; i <= n; i++) {
    const k = i / n;
    const p0 = lerp3(from, to, k);
    // (round the front of the chest, not through it)
    const over = add(p0, mul(cf, (B.ribDeep + 2.0) * Math.sin(Math.PI * k) * 0.9));
    put('body', 'baldric', { k: 'rod', a: prev, b: over, ra: 1.2, rb: 1.2, ramp: LEATHER });
    // (three bone handles, up out of it, their blades sheathed flat along it)
    if (i === 2 || i === 3 || i === 4) {
      const h0 = add(over, mul(cf, 1.0));
      const up = norm(add(mul(cl, 0.55), [0, 0, 0.85]));
      put('baldric', 'knives', { k: 'rod', a: h0, b: add(h0, mul(up, 4.6)), ra: 0.8, rb: 0.7, ramp: BONE });
      put('baldric', 'knives', { k: 'ball', c: add(h0, mul(up, 4.6)), ax: sphere(0.95), skin: BONE });
    }
    prev = over;
  }
}

// =============================================================================================
// WHAT A MOMENT SAYS OF THEM (art/silent_order_moves.ts says it)

export interface OrderSay {
  /** How far the cloak is left behind or flung on by how they move: its hem's offset along the floor (figure's own lengths), and (its third) how far its back hem flaps up. */
  sway: (m: Moment) => V3;
  /** How each hand is held. */
  hands: (m: Moment) => readonly [HandHold, HandHold];
  /** Whether the knife is in the right hand, and how bright the glint on it is. */
  knife: (m: Moment) => boolean;
  /** How bright the dull pink in the eye holes burns (0 dull, 1 flaring). */
  flare: (m: Moment) => number;
  /** As they die: how far the mask has cracked (0..1); seconds since the body went out of the cloak (below 0: not yet); the cloak's rings as it emptied. */
  crack: (m: Moment) => number;
  emptied: (m: Moment) => number;
  emptyCloak: (st: Stage) => Ring[] | null;
  /** The after-images of a lightning strike, as lines (or none). */
  smear: (m: Moment) => V3[][] | null;
  /** What else is laid after their edge (grains: grey gathering in a palm, a burst, a puff). */
  more: (m: Moment) => [V3, string, number][];
  /** The masks' fog arms: how much of each is formed (0 none, 1 whole). */
  fogArms: (m: Moment) => readonly [number, number];
}

const GRAINS = new WeakMap<Moment, [V3, string, number][]>();
/** The smear's after-images: the oldest a dim grey, the newest near white. */
export const SMEAR = ['#4a4754', '#8f8b9a', '#d6d2de'] as const;

/** THE ORDER AS SOLIDS, at a moment. */
function orderBits(who: OrderWho, st: Stage, m: Moment, say: OrderSay): Bit[] {
  const { s, q } = m;
  const B = bodyOf(who);
  const bits: Bit[] = [];
  const grains: [V3, string, number][] = [];
  GRAINS.set(m, grains);
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const lit = 1 - clamp01(q.out);
  const sway = say.sway(m);
  const wind = m.wind;
  const crack = m.dying ? clamp01(say.crack(m)) : 0;
  const emptied = m.dying ? say.emptied(m) : -1;
  const [hl, hr] = say.hands(m);
  const knifeIn = say.knife(m);
  const glint = clamp01(m.glint);
  if (who !== 'mask') {
    if (emptied < 0) {
      // A FIGURE IN ITS CLOAK
      for (const side of ['L', 'R'] as const) leg(put, who, s, B, side);
      if (who === 'guest') courtClothes(put, s, B, !knifeIn);
      else mailAndKnives(put, s, B, knifeIn);
      arm(put, who, s, B, 'L', hl);
      arm(put, who, s, B, 'R', hr);
      const rings = cloakRings(s, B, sway, wind);
      cloak(put, s, B, rings);
      put('neck', 'neck', { k: 'rod', a: add(s.neck, mul(s.chest[2], -1.0)), b: lerp3(s.neck, s.head, 0.5), ra: 2.4, rb: 2.2, ramp: VELVET });
      hood(put, st, s, B, sway, 0);
      mask(put, st, s, B, crack, lit, say.flare(m));
      if (knifeIn) knifeBits(put, 'knife', 'knife', s.handR, s.point, s.across, glint);
    } else {
      // THE CLOAK FALLS EMPTY: the rings it had as it emptied, dropping to the floor and spreading; the hood collapsing onto it; the belt of knives with it
      // (the mask's halves, fallen from it: the painter of a death lays them where they fall, Mob.fall)
      mask(put, st, s, B, 1, 0, 0);
      const was = say.emptyCloak(st);
      if (was) {
        const heap = heapRings(was, emptied);
        put('cloak', 'cloak', { k: 'cloth', rings: heap.slice(1), ramp: VELVET, look: { arc: CLOAK_ARC, folds: [95, 130, 165, 200, 235, 265], lift: 0.12, lining: 0.05 } });
        put('mantle', 'cloak', { k: 'cloth', rings: [heap[0], heap[1]], ramp: VELVET, look: { folds: [30, -30, 150, -150], lift: 0.2 } });
        // the empty hood, fallen on top of it, its mouth dark
        const top = heap[0];
        const hz = Math.max(top.c[2] + 1.2, 3.2);
        const hc: V3 = [top.c[0] + 2.2 * clamp01(emptied * 3), top.c[1], hz];
        const sq = clamp01(emptied * 2.2);
        put('hood', 'hood', { k: 'ball', c: hc, ax: [[B.headR[0] * 1.4, 0, 0], [0, B.headR[1] * 1.5, 0], [0, 0, B.headR[2] * (1.3 - 0.75 * sq)]], skin: (u, tone) => (u[0] > 0.5 && Math.abs(u[1]) < 0.6 && u[2] > -0.4 + 0.5 * sq ? HOLLOW : VELVET[tone]) });
        // the belt of knives lying on it
        if (who === 'armed') {
          const wr = heap[Math.min(heap.length - 1, 3)];
          put('belt', 'belt', { k: 'band', ring: { c: add(wr.c, [0, 0, 0.6]), u: wr.u, v: wr.v }, ramp: LEATHER, rows: 2 });
        }
      }
    }
  } else {
    // THE MASKS: only the mask, held up by fog; the knife, real, in a fog hand
    // (theirs a little bigger than a face: the last of the masks, all there is of them)
    if (emptied < 0 || crack < 1) mask(put, st, s, B, crack, lit, say.flare(m), MASKS_SCALE);
    else mask(put, st, s, B, crack, 0, 0, MASKS_SCALE);
    if (knifeIn && emptied < 0) knifeBits(put, 'knife', 'knife', s.handR, s.point, s.across, glint);
    fog(grains, st, s, B, m, sway, say.fogArms(m), emptied);
  }
  // THE SMEAR of a lightning strike, or of the rush: after-images, the oldest thinned to every other point (laid after their
  // edge, as grains: no pink edge round a blur)
  const sm = say.smear(m);
  if (sm) {
    sm.forEach((line, j) => {
      const k = j / Math.max(1, sm.length - 1);
      for (let i = 1; i < line.length; i++) {
        const [x0, y0] = st.at(line[i - 1]);
        const [x1, y1] = st.at(line[i]);
        const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
        for (let e = 0; e < n; e++) {
          if (k < 0.5 && (e + i) % 2) continue;
          grains.push([lerp3(line[i - 1], line[i], e / n), k > 0.7 ? SMEAR[2] : k > 0.35 ? SMEAR[1] : SMEAR[0], k > 0.7 ? 2 : 1]);
        }
      }
    });
  }
  grains.push(...say.more(m));
  return bits;
}

/**
 * THE MASKS' FOG: a wisp of grey where a face and a hood would be, holding the mask up, densest round it; a neck of it
 * under the mask; below, the cloak's ghost of a shape, barely there: grey grains drifting on its surface, thinning to
 * nothing toward the floor, a little brighter along its edges; an arm of it thickening as it strikes or throws; as they
 * die, all of it scattering and gone.
 */
function fog(out: [V3, string, number][], st: Stage, s: Skeleton, B: Build, m: Moment, sway: V3, arms: readonly [number, number], emptied: number): void {
  const t = m.t;
  const tick = Math.floor(t * 7);
  const scatter = emptied >= 0 ? emptied : -1;
  const mid: V3 = [s.pelvis[0], s.pelvis[1], s.pelvis[2] + 10];
  const blow = (p: V3, i: number): V3 | null => {
    if (scatter < 0) return p;
    // (as they die: flung out from the middle of them, rising, thinning, gone)
    const d = norm(sub(p, mid), [1, 0, 0]);
    const k = scatter;
    if (hash(i, 77, 9013) < k * 1.5) return null;
    return add(p, add(mul(d, 34 * Math.sqrt(k) * (0.6 + 0.6 * hash(i, 78, 9013))), [0, 0, 8 * k]));
  };
  // (the fog is behind the mask: none of it laid over its face)
  const mk = maskOn(st, s, B, MASKS_SCALE);
  const [mx, my] = st.at(mk.c);
  const sa = st.seen(mk.ax[1]);
  const sb = st.seen(mk.ax[2]);
  const mr = Math.max(Math.hypot(sa[0], sa[1]), Math.hypot(sb[0], sb[1])) + 1.5;
  const mz = st.near(mk.c);
  const lay = (p0: V3, i: number, c: string, size: number): void => {
    const p = blow(p0, i);
    if (!p || p[2] <= 0.3) return;
    if (scatter < 0) {
      const [x, y] = st.at(p);
      if (Math.hypot(x - mx, y - my) < mr && st.near(p) < mz + 2) return;
    }
    out.push([p, c, size]);
  };
  const flick = (i: number, p: number): boolean => hash(i, tick + (i % 5), 9012) < p;
  // round the mask: the hood's shape in fog, densest at the mask's edge
  const [ff, fl, fu] = wornOn(st, s, 6);
  const hr: V3 = [B.headR[0] * 1.15, B.headR[1] * 1.15, B.headR[2] * 1.15];
  const hc = add(s.head, add(mul(fu, 0.9), mul(ff, -1.1)));
  let idx = 0;
  for (let i = 0; i < 170; i++) {
    idx++;
    const a = hash(i, 1, 9011) * Math.PI * 2;
    const e = (hash(i, 2, 9011) - 0.4) * Math.PI * 0.95;
    const r = 0.8 + 0.45 * hash(i, 3, 9011) + 0.06 * Math.sin(t * 2.4 + i);
    const u: V3 = [Math.cos(a) * Math.cos(e), Math.sin(a) * Math.cos(e), Math.sin(e)];
    if (u[0] > 0.4 && Math.abs(u[1]) < 0.7 && u[2] < 0.55) continue;
    if (!flick(idx, 0.75 - 0.4 * (r - 0.8))) continue;
    const p = add(hc, add(mul(ff, u[0] * hr[0] * 1.5 * r), add(mul(fl, u[1] * hr[1] * 1.65 * r), mul(fu, u[2] * hr[2] * 1.4 * r + 0.5 * Math.sin(t * 2 + i)))));
    lay(p, idx, r < 0.95 ? FOG[4] : r < 1.1 ? FOG[3] : FOG[2], r < 0.95 && i % 2 === 0 ? 2 : 1);
  }
  // the neck of it, under the mask, down into the shoulders
  for (let i = 0; i < 40; i++) {
    idx++;
    const k = hash(i, 4, 9011);
    const p = add(lerp3(add(s.head, mul(fu, -hr[2] * 0.6)), s.ribs, k), [(hash(i, 5, 9011) - 0.5) * 6, (hash(i, 6, 9011) - 0.5) * 7, 0.4 * Math.sin(t * 3 + i)]);
    if (!flick(idx, 0.55 - 0.3 * k)) continue;
    lay(p, idx, k < 0.4 ? FOG[2] : FOG[1], k < 0.3 && i % 2 === 0 ? 2 : 1);
  }
  // a wisp curling up off the top of the hood
  for (let i = 0; i < 12; i++) {
    idx++;
    const life = fr(t * 0.55 + i / 12);
    const p = add(hc, add(mul(fu, hr[2] * 1.3 + life * 10), add(mul(fl, Math.sin(life * 5 + i) * (1 + life * 3)), mul(ff, -1.8 - life * 3))));
    lay(p, idx, life < 0.4 ? FOG[3] : FOG[1], life < 0.5 ? 2 : 1);
  }
  // the cloak's ghost: grains over its surface between its rings, fewer and dimmer toward the floor; brighter at its edges
  const rings = cloakRings(s, B, sway, m.wind);
  const nr = rings.length;
  for (let r = 0; r + 1 < nr; r++) {
    const A = rings[r].pts ?? [];
    const Bp = rings[r + 1].pts ?? [];
    const n = Math.min(A.length, Bp.length);
    const low = (r + 0.5) / (nr - 1);
    for (let j = 0; j < n; j++) {
      const deg = (j / n) * 360;
      const inArc = deg >= CLOAK_ARC[0] && deg <= CLOAK_ARC[1];
      for (let h = 0; h < 3; h++) {
        idx++;
        const p0 = lerp3(A[j], Bp[j], (h + hash(idx, 7, 9014)) / 3);
        // (how edge-on to the eye the cloak is there: its outline)
        const out3 = norm(sub(p0, lerp3(rings[r].c, rings[r + 1].c, (h + 0.5) / 3)), [1, 0, 0]);
        const edgeOn = 1 - Math.abs(st.near(out3) - st.near([0, 0, 0]));
        const dens = (inArc ? 0.3 : 0.08) * (1 - 0.85 * low) + (edgeOn > 0.8 ? 0.3 * (1 - low) : 0);
        if (!flick(idx, dens)) continue;
        const p = add(p0, [0.7 * Math.sin(t * 1.9 + j + h), 0.7 * Math.cos(t * 1.6 + j), 1.0 * Math.sin(t * 1.2 + j + r)]);
        lay(p, idx, edgeOn > 0.8 && low < 0.6 ? FOG[3] : low < 0.4 ? FOG[2] : FOG[1], 1);
      }
    }
  }
  // its arms, thickening into fog arms as they strike or throw: a grey arm and a pale palm
  for (const [side, k] of [['L', arms[0]], ['R', arms[1]]] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const ha = side === 'L' ? s.handL : s.handR;
    const n = 34;
    for (let i = 0; i < n; i++) {
      idx++;
      const u = i / (n - 1);
      const p = u < 0.45 ? lerp3(sh, el, u / 0.45) : lerp3(el, ha, (u - 0.45) / 0.55);
      const dens = 0.15 + 0.85 * k * (0.5 + 0.5 * u);
      if (!flick(idx, dens)) continue;
      const w = 1.0 + 1.6 * (1 - u) * (1 - k * 0.5);
      const j: V3 = [(hash(idx, 1, 9016) - 0.5) * 2 * w, (hash(idx, 2, 9016) - 0.5) * 2 * w, (hash(idx, 3, 9016) - 0.5) * 2 * w];
      lay(add(p, j), idx, k > 0.6 && u > 0.7 ? FOG[5] : k > 0.3 ? FOG[4] : FOG[2], k > 0.4 ? 2 : 1);
    }
    if (k > 0.2) {
      // the palm of fog: a pale smudge of it
      for (let i = 0; i < 22; i++) {
        idx++;
        const a = (i / 22) * Math.PI * 2;
        const rr = 1.0 + 1.8 * hash(idx, 4, 9016);
        const p = add(ha, [Math.cos(a) * rr * 0.6, Math.sin(a) * rr, Math.sin(a * 2) * rr * 0.9 + 0.8]);
        if (!flick(idx, k)) continue;
        lay(p, idx, i % 3 ? FOG[5] : FOG[6], 2);
      }
    }
  }
}

/** THE ORDER AS THE PAINTER TAKES THEM. */
export function orderPainter(who: OrderWho, say: OrderSay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return { bits: (st, m) => orderBits(who, st, m, say), grains: (_st, m) => GRAINS.get(m) ?? [] };
}
