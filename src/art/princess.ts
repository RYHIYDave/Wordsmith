// FLOOR 16'S BOSS, THE PRINCESS (THE SWAN PAVILION), ON THE HEROES' BONES. A MOCK-UP: NOT IN THE GAME. Nothing of the
// game imports this file; `PRINCESS_ON` is off. Her moves are art/princess_moves.ts; her steed art/spectral_steed.ts.
//
// His doc "Wordsmith Act 2, Part Two: The High City (Levels 16–20)": “Boss: The Princess. Her floor is the Swan
// Pavilion.” Her story from Andersen's “The Wild Swans” (1838): a princess who swore not to speak a word; “Her vow of
// silence let the Hush in”.
//
// HIS BRIEF (his art rulebook, "A new character", and sound rule 7), his answers, 28 Oct:
// - her look: “The shirt is dumb, but I like the nettle, viney vibe from the gardeners, and maybe a spectral”; and at
//   20:29, “I was gonna say a spectral steed from the guys with pitchforks to kinda tie it all together.  Maybe one of
//   her moves a spectral steed forms under her and she does like dressage jumps all over the arena that you have to
//   dodge”;
// - her size, “A head taller than the knight (Recommended)”; how she moves, “Glides without a sound (Recommended)”; her
//   mark, “Swans circling her”; her basic attack, “Nettle vine lash (Recommended)”; in place of the doc's Shirt, “Vine
//   snare (Recommended)”; her swans, “The garden's swans”; the steed, “It’s her ultimate ability so it can slot into
//   whatever that might have been.  I want it to last a while and you have to really dodge around a bit to not get
//   hit.”; her death, “Steed fades, vines wither (Recommended)”; never, “Not a child, not a corpse (Recommended)”; her
//   sound, “Silent, but vines and hooves (Recommended)”; and “And remember this is a boss so follow the rules and run the
//   checks”.
//
// HER LOOK: a pale young woman, grown, a head taller than the knight, slender; a court gown of royal violet faded toward
// the Hush's grey (a fitted bodice, long sleeves with long hanging over-sleeves, a full skirt to the floor with a short
// train), its hem and cuffs trimmed silver-white, the swans' own colour; the gardens' stinging nettles wound round her: a
// crown of nettle leaves on a thin silver circlet in her long dark hair, vines spiralling up her forearms, a vine
// knotted at her waist and others climbing her skirt from the hem; a long vine trailing from her right hand to the floor
// (her lash). Her eyes the cult's dull pink; her lips shut (she never makes a sound); the Hush curling off her in faint
// wisps. She glides: her feet never touch the floor under the gown (a flier, by his rule of 14 Oct). Nothing cyan; no
// nettle shirt anywhere.

import { HUSH } from './crier';
import { BREATH_PALE, lagOf } from './hushed';
import { INK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import { steedBits, steedGrains, thinSteed } from './spectral_steed';
import type { SteedPose } from './spectral_steed';
import type { Px } from '../engine/px';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const PRINCESS_ON = { on: false };

const fr = (t: number): number => t - Math.floor(t);
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

// =============================================================================================
// HER COLOURS: a royal gown faded toward grey; pale skin; dark hair; the gardens' nettles

/** The gown: a royal violet, faded by the Hush toward its grey. */
const GOWN: Ramp = ['#221a2c', '#382a46', '#544066', '#745a86', '#9a80a8'];
/** Its hem, its cuffs and its trim: silver-white, the swans' own. */
const ROSE: Ramp = ['#3a3640', '#5e5a64', '#8e8a92', '#bcb8bc', '#dedad8'];
/** Her skin, pale. */
const SKIN: Ramp = ['#6a5a5c', '#948282', '#b8a6a2', '#d4c2ba', '#e6d6ce'];
/** Her hair, dark, loose: a frame for her pale face. */
const HAIR: Ramp = ['#141012', '#221a1e', '#342830', '#4c3a42', '#644e54'];
const HAIR_DARK: Ramp = ['#0e0b0d', '#181216', '#261d22', '#382a30', '#4a3840'];
/** The nettles: the gardens' own (art/floor16.ts), their stems a dark wine, their stinging hairs pale. */
export const NETTLE: Ramp = ['#122014', '#1f361e', '#30552b', '#4a773a', '#72984f'];
const STEM: Ramp = ['#1e141a', '#2e1e28', '#3a2b37', '#4e3a48', '#5e4858'];
const HAIRS = '#b6b4a2';
/** The nettles withered as she falls (his pick, “Steed fades, vines wither (Recommended)”): brown, then grey. */
const NETTLE_DEAD: Ramp = ['#1e1814', '#30261e', '#46382a', '#5e4c38', '#76644c'];
const STEM_DEAD: Ramp = ['#1a1614', '#2a221e', '#3a302a', '#4a3e36', '#5a4c42'];
/** (how far her nettles have withered as this frame is painted, 0 green to 1 dead and fallen; and the leaves fallen from them) */
let WITHER = 0;
let FALLEN: [V3, string, number][] = [];
/** A thin silver circlet under the nettles: she is a princess. */
const SILVER: Ramp = ['#2a2a32', '#4a4a56', '#767682', '#a2a2ae', '#cacad4'];

// =============================================================================================
// HER BODY

/** A grown young woman, a head taller than the knight (58): slender, long in the limb. */
export const PRINCESS_BODY: Build = buildOf(66, 1.12, { shoulders: 0.84, chest: 0.86, depth: 0.86, waist: 0.7, hips: 0.96, legs: 1.04, arms: 0.92, trunk: 1.02, limbs: 0.76 });
const B = PRINCESS_BODY;
/** Her picture: room for her vine swept out its whole seven and a half tiles, and for her on her steed at the top of its leap. */
export const PR_CANVAS: MobCanvas = { w: 500, h: 500, ax: 130, ay: 305 };
/** How far above the floor she glides (her feet, under the gown). */
export const PR_HOVER = 2.2;

/** Her rest: upright, proud, her head a little bowed and tilted; her left hand lifted before her, its fingers loose; her right low at her side, the vine trailing from it. */
export const PRINCESS_REST: Bones = {
  ...standing(B),
  pz: PR_HOVER, pitch: -2, bend: -1, roll: 0, side: 0, faceUp: -4, faceTilt: 6, faceTurn: -10,
  lfx: 1.0, lfy: 0.8, lfz: PR_HOVER + 2.4, lfp: 10, lft: 8, lk: 8, rfx: -1.2, rfy: -0.8, rfz: PR_HOVER + 2.8, rfp: 14, rft: -8, rk: -8,
  lhIn: 1, lhx: 7.0, lhy: -1.0, lhz: -17, le: -14,
  rhIn: 1, rhx: 3.5, rhy: -4.5, rhz: -22, re: 12,
  out: 0,
} as Bones;

// =============================================================================================
// HER AS SOLIDS

/** A sleeve to the wrist, its cuff flared in rose; a slender pale hand, its fingers loose or closed on the vine; a vine spiralling up the forearm. */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', cu: V3, grip: number, t: number, sleeveM: Moment): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const [r0, r1, r2] = B.armR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  put(`arm${side}`, `arm${side}`, { k: 'ball', c: sh, ax: sphere(r0 * 1.2), skin: GOWN, far: true });
  put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.14, rb: r1 * 1.12, ramp: GOWN, far: true });
  put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.12), skin: GOWN, far: true });
  const wrist = add(hand, mul(fore, -1.1));
  put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: wrist, ra: r1 * 1.08, rb: r2 * 1.1, ramp: GOWN, far: true });
  // the cuff, a narrow band of rose
  put(`fore${side}`, `cuff${side}`, { k: 'rod', a: lerp3(el, wrist, 0.86), b: add(wrist, mul(fore, 0.2)), ra: r2 * 1.18, rb: r2 * 1.3, ramp: ROSE, far: true });
  // THE HANGING SLEEVE: from her forearm, long and wide, lined with rose, hanging down whatever her arm does and trailing
  // as she glides
  {
    const top = lerp3(el, wrist, 0.25);
    const lagS = lagOf(sleeveM, 1.4, 4);
    const sway = Math.sin(t * 1.5 + (side === 'L' ? 0 : 1.7)) * 0.6;
    const mid = add(top, [lagS[0] * 0.6 + sway * 0.3 - 0.4, lagS[1] * 0.6 + sway, -8]);
    const end = add(mid, [lagS[0] * 1.2 - 1.0, lagS[1] * 1.2 + sway * 0.5, -9]);
    // (wide in the middle, narrowing to a point: a dagged sleeve, not a sack)
    put(`fore${side}`, `sleeve${side}`, { k: 'rod', a: top, b: mid, ra: r1 * 1.25, rb: r1 * 1.7, ramp: GOWN, far: true });
    put(`fore${side}`, `sleeve${side}`, { k: 'rod', a: mid, b: end, ra: r1 * 1.7, rb: r1 * 0.35, ramp: GOWN, far: true });
  }
  // the hand, long-fingered
  const e1 = norm(sub(cu, mul(fore, dot(cu, fore))), [0, 0, 1]);
  const e2 = norm(cross(fore, e1), [0, 1, 0]);
  put(`hand${side}`, `hand${side}`, { k: 'ball', c: add(hand, mul(fore, 0.4)), ax: [mul(fore, 1.6), mul(e2, 1.3), mul(e1, 0.75)], skin: SKIN, far: true });
  for (let i = 0; i < 4; i++) {
    const spread = (i - 1.5) * 0.32;
    const base = add(hand, add(mul(fore, 1.3), mul(e2, spread * 0.8)));
    const mid = add(base, add(mul(fore, 1.5 * (1 - 0.45 * grip)), mul(e1, -0.6 - 0.5 * grip)));
    const tip = add(mid, add(mul(fore, 1.2 * (1 - 0.8 * grip)), mul(e1, -0.7 - 0.5 * grip)));
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: base, b: mid, ra: 0.42, rb: 0.36, ramp: SKIN, far: true });
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: mid, b: tip, ra: 0.36, rb: 0.26, ramp: SKIN, far: true });
  }
  // a nettle vine spiralling up the forearm from the wrist to the elbow, a leaf at each turn
  const ax1 = norm(cross(fore, e1), e2);
  const R = r1 * 1.15;
  let prev: V3 | null = null;
  for (let i = 0; i <= 10; i++) {
    const k = i / 10;
    const ang = k * Math.PI * 4 + (side === 'L' ? 0 : 1.3);
    const p = add(lerp3(wrist, el, k * 0.92), add(mul(e1, Math.cos(ang) * R), mul(ax1, Math.sin(ang) * R)));
    if (prev) put(`fore${side}`, `vine${side}`, { k: 'rod', a: prev, b: p, ra: 0.42, rb: 0.42, ramp: WITHER > 0.45 ? STEM_DEAD : STEM, far: true });
    if (i % 3 === 1) leaf(put, `fore${side}`, `leaf${side}`, p, add(mul(e1, Math.cos(ang)), mul(ax1, Math.sin(ang))), fore, 1.5, t, i + (side === 'L' ? 0 : 20));
    prev = p;
  }
}
/** A nettle leaf: a toothed, pointed oval of dark green out from `at` along `out`, its tip drooping along `down`; its stinging hairs pale. */
function leaf(put: Put, part: string, piece: string, at: V3, out: V3, down: V3, size: number, t: number, seed: number): void {
  // (withering: each leaf browns in its own time, and falls)
  const own = hash(seed, 3, 7502);
  const dead = clamp01(WITHER * 1.6 - own * 0.6);
  if (dead >= 1) {
    const fall = clamp01((WITHER * 1.6 - own * 0.6 - 1) * 2.5);
    const p = add(at, [Math.sin(seed) * 3 * fall, Math.cos(seed) * 3 * fall, -Math.max(0, at[2] - 0.6) * fall]);
    FALLEN.push([p, NETTLE_DEAD[(seed % 3) + 1], 2]);
    return;
  }
  const LEAF = dead > 0.5 ? NETTLE_DEAD : NETTLE;
  const o = norm(out, [0, 0, 1]);
  const d = norm(sub(down, mul(o, dot(down, o))), [0, 0, -1]);
  const flutter = 0.25 * Math.sin(t * 5 + seed);
  const along = norm(add(o, mul(d, 0.6 + flutter)));
  const c0 = add(at, mul(along, size * 0.9));
  const across = norm(cross(along, d), [1, 0, 0]);
  const ax: [V3, V3, V3] = [mul(along, size), mul(across, size * 0.55), mul(norm(cross(along, across), [0, 0, 1]), 0.35)];
  // (a leaf on a vine lying along the floor lies on the floor, not in it)
  const low = c0[2] - Math.hypot(ax[0][2], ax[1][2], ax[2][2]);
  const c: V3 = low < 0.2 ? [c0[0], c0[1], c0[2] + 0.2 - low] : c0;
  put(part, piece, {
    k: 'ball',
    c,
    ax,
    skin: (u, tone) => {
      // (its toothed edge, its pale veins)
      const r = Math.hypot(u[0], u[1]);
      if (r > 0.82 && hash(Math.round(Math.atan2(u[1], u[0]) * 4), seed, 7501) < 0.4) return null;
      if (Math.abs(u[1]) < 0.08 && u[0] > -0.6) return LEAF[Math.min(4, tone + 1)];
      return LEAF[Math.max(1, tone)];
    },
    far: true,
  });
}
/** A nettle vine through points, its leaves along it. */
function vine(put: Put, part: string, pts: ReadonlyArray<V3>, ra: number, t: number, seed: number, every = 3, leafK = 1): void {
  for (let i = 1; i < pts.length; i++) {
    put(part, 'vine', { k: 'rod', a: pts[i - 1], b: pts[i], ra: 1.25 * ra * (1 - 0.35 * (i / pts.length)) * (1 - 0.3 * WITHER), rb: 1.25 * ra * (1 - 0.35 * ((i + 1) / pts.length)) * (1 - 0.3 * WITHER), ramp: WITHER > 0.45 ? STEM_DEAD : STEM, far: true });
    if (i % every === 0) {
      const dir = norm(sub(pts[i], pts[i - 1]), [1, 0, 0]);
      const out = norm(cross(dir, i % 2 ? [0, 0, 1] : [0, 0, -1]), [0, 1, 0]);
      leaf(put, part, 'vineleaf', pts[i], out, [0, 0, -1], (2.3 - 0.5 * (i / pts.length)) * leafK, t, seed + i);
    }
  }
}

/** NETTLE VINES ON THEIR OWN (her snare's, art/princess_fx.ts): each through its points, its leaves along it, withered `wither` of the way. */
export function nettleBits(vines: ReadonlyArray<{ pts: ReadonlyArray<V3>; ra: number; seed: number }>, t: number, wither: number): { bits: Bit[]; fallen: [V3, string, number][] } {
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const was = WITHER;
  WITHER = clamp01(wither);
  FALLEN = [];
  vines.forEach((v, i) => vine(put, `snare${i}`, v.pts, v.ra, t, v.seed, 1, 1.5));
  const fallen = FALLEN;
  WITHER = was;
  FALLEN = [];
  return { bits, fallen };
}
/** THE GOWN: the bodice from the shoulders (a square neckline, the skin of her throat above it) to the waist; the skirt from the waist to the floor, full, a short train behind; it drifts back as she glides. */
function gownRings(s: Skeleton, m: Moment, seated: number): { bodice: Ring[]; skirt: Ring[]; hemC: V3; f: V3; l: V3 } {
  const [cf, cl] = s.chest;
  const ph = m.wind * Math.PI * 2;
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const lag = lagOf(m, 1.6, 7);
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.62));
  const be = s.belly;
  const footMid = lerp3(lerp3(s.heelL, s.toeL, 0.5), lerp3(s.heelR, s.toeR, 0.5), 0.5);
  const kneeMid = lerp3(s.kneeL, s.kneeR, 0.5);
  // (to the floor as she glides; to her feet, seated on her steed)
  const hemZ = Math.max(0.9, Math.min(s.toeL[2], s.toeR[2], s.heelL[2], s.heelR[2]) - 0.6);
  // (on her knees, her skirt pooled round her on the floor, round her knees and not off behind her at her feet)
  const knelt = seated ? 0 : clamp01((14 - kneeMid[2]) / 10);
  const under: V3 = lerp3(footMid, [kneeMid[0] * 0.5 + s.pelvis[0] * 0.5, kneeMid[1] * 0.5 + s.pelvis[1] * 0.5, 0], knelt);
  const hemC: V3 = [under[0] + lag[0] * 1.2 - 1.0, under[1] + lag[1] * 1.2, hemZ];
  // (seated on her steed, her skirt falls from her knees down its flank, narrower)
  const hemDeep = B.pelvisDeep + 7.5 - 4.5 * seated + 3.5 * knelt;
  const hemWide = B.pelvisHalf + 7.0 - 4.0 * seated + 3.0 * knelt;
  const hemPts: V3[] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const rear = Math.max(0, -Math.cos(a));
    // (the train: the back of the hem drawn out behind her)
    const p = add(hemC, add(mul(f, Math.cos(a) * (hemDeep + rear * rear * 6.5)), mul(l, Math.sin(a) * hemWide)));
    hemPts.push(add(p, add([0, 0, Math.max(0, Math.sin(ph * 2 + a * 3) * 0.35) + rear * 0.1], mul(lag, rear * 0.8))));
  }
  const bodice: Ring[] = [
    { c: s.ribs, u: mul(cf, B.ribDeep + 1.2), v: mul(cl, B.ribHalf + 1.2) },
    { c: lerp3(waistC, s.ribs, 0.5), u: mul(be[0], B.waistDeep + 1.4), v: mul(be[1], B.waistHalf + 1.3) },
    { c: waistC, u: mul(be[0], B.waistDeep + 1.2), v: mul(be[1], B.waistHalf + 1.1) },
  ].reverse();
  // (the neckline: the bodice's top ring, square across the breast)
  bodice.push({ c: lerp3(s.ribs, s.neck, 0.42), u: mul(cf, B.ribDeep + 0.9), v: mul(cl, B.shoulderHalf * 0.86) });
  const skirt: Ring[] = [
    { c: hemC, u: mul(f, hemDeep), v: mul(l, hemWide), pts: hemPts },
    { c: [kneeMid[0] * 0.55 + hemC[0] * 0.45 + lag[0] * 0.4, kneeMid[1] * 0.55 + hemC[1] * 0.45 + lag[1] * 0.4, Math.max(hemZ + 3, kneeMid[2] - 2)], u: mul(f, B.pelvisDeep + 5.2), v: mul(l, B.pelvisHalf + 4.6) },
    { c: [s.pelvis[0], s.pelvis[1], s.pelvis[2] - 1.0], u: mul(f, B.pelvisDeep + 2.8), v: mul(l, B.pelvisHalf + 2.6) },
    { c: waistC, u: mul(be[0], B.waistDeep + 1.3), v: mul(be[1], B.waistHalf + 1.2) },
  ];
  return { bodice, skirt, hemC, f, l };
}

/** HER HEAD: a pale face, fine-boned; the cult's dull pink in her eyes; her lips shut; her hair loose and long down her back; a crown of nettles on a thin silver circlet. Returns her face's ways. */
function head(put: Put, st: Stage, s: Skeleton, lit: number, lag: V3, t: number): { ff: V3; fl: V3; fu: V3; hc: V3 } {
  const [ff, fl, fu] = wornOn(st, s, 8);
  const hr: V3 = [B.headR[0] * 1.0, B.headR[1] * 1.04, B.headR[2] * 1.0];
  const hc = add(s.head, mul(fu, -0.2));
  const skin: Skin = (u, tone) => {
    const fwd = u[0];
    const side = Math.abs(u[1]);
    // her lips, shut: a short dark line, a touch of rose
    if (fwd > 0.82 && side < 0.2 && u[2] < -0.42 && u[2] > -0.5) return ROSE[Math.max(1, tone - 1)];
    // the hollow of her cheeks
    if (fwd > 0.45 && fwd < 0.75 && side > 0.45 && side < 0.7 && u[2] < -0.12 && u[2] > -0.5) return SKIN[Math.max(0, tone - 1)];
    if (fwd > 0.9 && side < 0.12 && u[2] > -0.3 && u[2] < 0.05) return SKIN[Math.min(4, tone + 1)];
    // her hair over her brow and round the back and sides
    if (fwd < -0.05 || u[2] > 0.55) return HAIR[tone];
    if (side > 0.84 && u[2] > -0.2) return HAIR[tone];
    return SKIN[tone];
  };
  put('head', 'head', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin });
  for (const k of [-1, 1]) {
    const a = add(hc, add(mul(ff, hr[0] * 0.88), add(mul(fl, k * hr[1] * 0.14), mul(fu, hr[2] * 0.3))));
    const b = add(hc, add(mul(ff, hr[0] * 0.72), add(mul(fl, k * hr[1] * 0.58), mul(fu, hr[2] * 0.28))));
    put('head', 'brows', { k: 'rod', a, b, ra: 0.45, rb: 0.38, ramp: HAIR });
  }
  for (const k of [-1, 1]) {
    const e = add(hc, add(mul(ff, hr[0] * 0.93), add(mul(fl, k * hr[1] * 0.34), mul(fu, hr[2] * 0.1))));
    put('head', 'eyes', { k: 'dot', p: e, c: lit > 0.4 ? FLAME[1] : '#3a2a30', facing: ff, c2: lit > 0.4 ? FLAME[2] : '#2a1e24' });
  }
  // HER HAIR: loose, long, down her back to her waist, parted and falling past her ears; it streams back as she glides
  const crown = add(hc, mul(fu, hr[2] * 0.55));
  const nape = add(hc, add(mul(ff, -hr[0] * 0.75), mul(fu, -hr[2] * 0.3)));
  const down: V3 = [0, 0, -1];
  for (let j = -3; j <= 3; j++) {
    const at = add(nape, mul(fl, j * hr[1] * 0.26));
    const pts: V3[] = [add(crown, mul(fl, j * hr[1] * 0.24)), at];
    const long = 5 - Math.abs(j) * 0.35;
    for (let i = 1; i <= 5; i++) {
      const k = i / 5;
      const wave = Math.sin(k * 7 + j * 1.3 + t * 1.2) * 0.45 * k;
      const sway = Math.sin(t * 1.6 + j + k * 2) * 0.5 * k;
      pts.push(add(at, add(mul(down, long * i), add(mul(ff, -1.3 * k - 0.6), add(mul(lag, 1.4 * k), mul(fl, j * 0.42 * k + sway + wave))))));
    }
    for (let i = 1; i < pts.length; i++) put('head', 'hair', { k: 'rod', a: pts[i - 1], b: pts[i], ra: 1.05 - 0.08 * i, rb: 0.98 - 0.08 * i, ramp: j % 2 ? HAIR_DARK : HAIR });
  }
  // two locks before her shoulders, over the gown
  for (const k of [-1, 1]) {
    const top = add(hc, add(mul(fl, k * hr[1] * 0.9), add(mul(ff, -hr[0] * 0.45), mul(fu, -hr[2] * 0.15))));
    const mid = add(top, add([0, 0, -6], add(mul(ff, 0.6), mul(lag, 0.6))));
    const end = add(mid, add([0, 0, -6], add(mul(ff, 0.9), mul(lag, 1.0))));
    put('head', 'locks', { k: 'rod', a: top, b: mid, ra: 1.0, rb: 0.9, ramp: HAIR });
    put('head', 'locks', { k: 'rod', a: mid, b: end, ra: 0.9, rb: 0.5, ramp: HAIR });
  }
  // THE NETTLE CROWN: a thin silver circlet round her brow, nettle leaves standing up off it all round
  const ring: Ring = { c: add(hc, mul(fu, hr[2] * 0.42)), u: mul(ff, hr[0] * 1.02), v: mul(fl, hr[1] * 1.02) };
  put('head', 'crown', { k: 'band', ring, ramp: SILVER, rows: 1 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const p = add(ring.c, add(mul(ring.u, Math.cos(a)), mul(ring.v, Math.sin(a))));
    const out = norm(add(add(mul(ff, Math.cos(a) * 0.3), mul(fl, Math.sin(a) * 0.3)), fu));
    leaf(put, 'head', 'crownleaf', p, out, mul(fu, -1), 1.35 + (i % 2) * 0.45, t, 40 + i);
  }
  return { ff, fl, fu, hc };
}

/** The Hush curling off her in faint wisps, laid after her edge (Mob.grains). */
const WISPS = new WeakMap<Moment, [V3, string, number][]>();
function wisps(out: [V3, string, number][], s: Skeleton, t: number, n: number, seed: number): void {
  for (let i = 0; i < n; i++) {
    const life = fr(t * 0.35 + i / n + 0.21 * hash(i, seed, 7511));
    const a = hash(i, seed, 7512) * Math.PI * 2;
    const r = 6 + 9 * hash(i, seed, 7513);
    const from: V3 = [s.pelvis[0] + Math.cos(a) * r, s.pelvis[1] + Math.sin(a) * r, 2 + 30 * hash(i, seed, 7514)];
    const p = add(from, [Math.sin(life * 4 + i) * 1.6, Math.cos(life * 3 + i) * 1.6, life * 16]);
    if (life > 0.8) continue;
    out.push([p, life < 0.25 ? BREATH_PALE : life < 0.55 ? HUSH[4] : HUSH[3], life < 0.4 ? 2 : 1]);
  }
}

/** What a moment of a move says of her over and above the bones. */
export interface PrincessSay {
  /** The vine in her right hand, laid along these points from the hand (its lash; or trailing to the floor). */
  vine?: (m: Moment) => V3[] | null;
  /** Her steed under her (her ultimate), as it is now (null: none). */
  steed?: (m: Moment) => SteedPose | null;
  /** How far her nettles have withered (her death: 0 green, 1 dead and fallen). */
  wither?: (m: Moment) => number;
  /** THE SMEAR OF A LIGHTNING STRIKE (his Movement 9): after-images of what strikes along the way it has just come, each a line of points, the oldest first. */
  smear?: (m: Moment) => V3[][] | null;
  /** Grains of her own move laid after her edge (the fog bursting from the steed's hooves, the vines' thorns glinting). */
  more?: (m: Moment) => [V3, string, number][];
  /** Whether she is seated on her steed (her skirt falls down its flank, narrower). */
  seated?: (m: Moment) => boolean;
}
/** The trailing vine at rest: from her right hand down to the floor and along it behind her, coiling. */
export function restVine(s: Skeleton, m: Moment): V3[] {
  const hand = s.handR;
  const lag = lagOf(m, 1.6, 7);
  const pts: V3[] = [hand];
  const side = norm(sub(s.handR, s.pelvis), [0, -1, 0]);
  const out: V3 = norm([side[0], side[1], 0], [0, -1, 0]);
  for (let i = 1; i <= 12; i++) {
    const k = i / 12;
    const z = Math.max(0.8, hand[2] * (1 - k * 1.6));
    const sway = Math.sin(m.t * 1.4 + k * 5) * 1.4 * k;
    pts.push(add(hand, [out[0] * 6 * k - 10 * Math.max(0, k - 0.55) + lag[0] * 2 * k + sway * out[1], out[1] * 6 * k + lag[1] * 2 * k - sway * out[0], z - hand[2]]));
  }
  return pts;
}
function princessBits(st: Stage, m: Moment, say: PrincessSay): Bit[] {
  const { s, q } = m;
  const bits: Bit[] = [];
  const grains: [V3, string, number][] = [];
  WISPS.set(m, grains);
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  WITHER = clamp01(say.wither?.(m) ?? 0);
  FALLEN = [];
  // HER STEED, under her (its parts its own, named `steed...`)
  const P = say.steed?.(m) ?? null;
  if (P && P.formed > 0.01) {
    const seat = s.pelvis;
    const near = st.near(add(seat, [0, -3, 0])) > st.near(add(seat, [0, 3, 0])) ? -1 : 1;
    steedBits(P, put, near);
    grains.push(...steedGrains(P, m.t, [-1, 0, 0]).filter((g) => g[0][2] > 0 && hash(Math.round(g[0][0] * 7), Math.round(g[0][2] * 7), 7521) < P.formed));
  }
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const lag = lagOf(m, 1.6, 7);
  const t = m.t;
  // (her feet, under the gown, never seen: small slippers in case a step shows)
  for (const side of ['L', 'R'] as const) {
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    put(`foot${side}`, `foot${side}`, { k: 'rod', a: add(heel, [0, 0, 1.0]), b: add(toe, [0, 0, 0.8]), ra: 1.1, rb: 0.9, ramp: GOWN, far: true });
  }
  // THE GOWN
  const g = gownRings(s, m, say.seated?.(m) ? 1 : 0);
  put('skirt', 'skirt', { k: 'cloth', rings: g.skirt, ramp: GOWN, look: { folds: [15, -15, 45, -45, 80, -80, 120, -120, 160, -160, 180], lift: 0.06, hem: ROSE, ragged: true } });
  // a tangle of nettle vines along the hem, all round
  {
    const h = g.skirt[0];
    const pts: V3[] = [];
    for (let i = 0; i <= 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const p = h.pts ? h.pts[Math.round((i / 18) * h.pts.length) % h.pts.length] : add(h.c, add(mul(h.u, Math.cos(a)), mul(h.v, Math.sin(a))));
      pts.push(add(p, [0, 0, 1.4 + 0.9 * Math.sin(a * 3 + 1)]));
    }
    vine(put, 'skirt', pts, 0.75, t, 130, 2);
  }
  put('body', 'bodice', { k: 'cloth', rings: g.bodice, ramp: GOWN, look: { folds: [0, 40, -40], lift: 0.03 } });
  // her throat and shoulders above the neckline
  put('neck', 'neck', { k: 'rod', a: add(lerp3(s.ribs, s.neck, 0.4), mul(cu, 0.4)), b: lerp3(s.neck, s.head, 0.55), ra: 2.0, rb: 1.6, ramp: SKIN });
  put('neck', 'collar', { k: 'ball', c: add(lerp3(s.ribs, s.neck, 0.62), mul(cf, 0.6)), ax: [mul(cf, B.ribDeep * 0.75), mul(cl, B.shoulderHalf * 0.8), mul(cu, 2.2)], skin: SKIN });
  // a vine knotted round her waist, its ends hanging down the front of the skirt
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.62));
  put('body', 'girdle', { k: 'band', ring: { c: waistC, u: mul(s.belly[0], B.waistDeep + 1.6), v: mul(s.belly[1], B.waistHalf + 1.5) }, ramp: WITHER > 0.45 ? STEM_DEAD : STEM, rows: 1 });
  const knot = add(add(waistC, mul(s.belly[0], B.waistDeep + 1.8)), mul(s.belly[1], 1.5));
  const hang: V3[] = [knot];
  for (let i = 1; i <= 6; i++) {
    const p = add(knot, [lag[0] * 0.5 * i / 6 + 0.6 * i * s.hips[0][0], lag[1] * 0.5 * i / 6 + 0.6 * i * s.hips[0][1], -3.2 * i]);
    // (on her knees, its ends lie on the floor before her)
    hang.push(p[2] < 1.4 ? [p[0] + (1.4 - p[2]) * 0.6 * s.hips[0][0], p[1] + (1.4 - p[2]) * 0.6 * s.hips[0][1], 1.4] : p);
  }
  vine(put, 'skirt', hang, 0.5, t, 60, 2);
  // vines climbing the skirt from the hem, round its front and sides
  for (const [a0, seed, turn] of [[20, 70, 60], [-60, 80, -50], [150, 90, 40], [80, 95, -40], [-140, 99, 50]] as const) {
    const pts: V3[] = [];
    for (let i = 0; i <= 8; i++) {
      const k = i / 8;
      const a = (a0 + turn * k) * (Math.PI / 180);
      // (from the hem up the skirt, on its outside)
      const r0 = g.skirt[0];
      const r1 = g.skirt[1];
      const c = lerp3(r0.c, r1.c, k);
      const u = lerp3(r0.u, r1.u, k);
      const v = lerp3(r0.v, r1.v, k);
      pts.push(add(c, add(mul(u, Math.cos(a) * 1.05), add(mul(v, Math.sin(a) * 1.05), [0, 0, 0.6]))));
    }
    vine(put, 'skirt', pts, 0.7, t, seed, 2);
  }
  // a vine wound across her breast from her left shoulder to her right hip, and over her right shoulder
  {
    const a0 = add(add(lerp3(s.ribs, s.neck, 0.7), mul(cl, B.shoulderHalf * 0.7)), mul(cf, B.ribDeep * 0.4));
    const pts: V3[] = [];
    for (let i = 0; i <= 8; i++) {
      const k = i / 8;
      const c = lerp3(lerp3(s.ribs, s.neck, 0.7), waistC, k);
      const side = 0.8 - 1.6 * k;
      pts.push(add(add(c, mul(cl, side * (B.ribHalf + 0.6))), mul(i < 7 ? cf : s.belly[0], (i < 5 ? B.ribDeep : B.waistDeep) + 1.5)));
    }
    void a0;
    vine(put, 'body', pts, 0.6, t, 110, 2);
  }
  // THE ARMS: the left hand loose, the right closed on the vine
  arm(put, s, 'L', cu, 0.3, t, m);
  arm(put, s, 'R', cu, 1, t, m);
  const hd = head(put, st, s, lit, lag, t);
  // THE VINE in her right hand: its lash, or trailing to the floor
  const v = say.vine?.(m) ?? restVine(s, m);
  if (v && v.length > 1) {
    // (swept out its whole length, thicker, and leafed all along it)
    let long = 0;
    for (let i = 1; i < v.length; i++) long += Math.hypot(v[i][0] - v[i - 1][0], v[i][1] - v[i - 1][1], v[i][2] - v[i - 1][2]);
    const k = clamp01((long - 40) / 120);
    vine(put, 'lash', v, 0.9 + 0.5 * k, t, 100, k > 0.5 ? 1 : 2, 1 + 0.4 * k);
  }
  // THE SMEAR of a lightning strike: its after-images, pale, the oldest thinned to every other point
  const sm = say.smear?.(m);
  if (sm) {
    sm.forEach((line, j) => {
      const k = j / Math.max(1, sm.length - 1);
      for (let i = 1; i < line.length; i++) {
        const [x0, y0] = st.at(line[i - 1]);
        const [x1, y1] = st.at(line[i]);
        const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
        for (let e = 0; e < n; e++) {
          if (k < 0.5 && (e + i) % 2) continue;
          put('smear', 'smear', { k: 'mote', p: lerp3(line[i - 1], line[i], e / n), c: k > 0.7 ? SMEAR[2] : k > 0.35 ? SMEAR[1] : SMEAR[0], size: k > 0.7 ? 2 : 1 });
        }
      }
    });
  }
  grains.push(...FALLEN, ...(say.more?.(m) ?? []));
  void hd;
  void wisps;
  return bits;
}
/** The smear's after-images: the oldest a dull violet, the newest near white with the thorns' pink in it. */
const SMEAR = ['#8a7aa4', '#cdbfdc', '#f4e8f0'];
/** HER STEED THINNED TO MIST (Mob.finish): more fog than horse below, gaps through it you see the floor by; formed and fading. */
export function princessFinish(say: PrincessSay): (px: Px, st: Stage, m: Moment, partAt: (k: number) => string | null) => void {
  return (px, st, m, partAt) => {
    const P = say.steed?.(m) ?? null;
    if (P) thinSteed(px, st, P, (k) => {
      const part = partAt(k);
      return part === null ? null : part.startsWith('steed');
    });
  };
}

/** HER STAND: 2.8 s round. Hovering, never still: she rises and sinks a little on the air, her gown stirring; she turns her head slowly, her left hand drifting as if it felt for something; the vine in her right hand swaying. */
export const PR_STAND_LONG = 2.8;
export function princessStand(): Motion {
  const R = PRINCESS_REST;
  const T = PR_STAND_LONG;
  const keys: Key3[] = [];
  const N = 28;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const a = (t / T) * Math.PI * 2;
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + 1.0 * Math.sin(a),
        py: 0.8 * Math.sin(a + 0.6),
        roll: R.roll + 1.6 * Math.sin(a + 0.6),
        side: R.side + 1.2 * Math.sin(a + 0.6),
        bend: R.bend - 1.6 * Math.sin(a),
        faceTurn: R.faceTurn + 10 * Math.sin(a + 0.4),
        faceTilt: R.faceTilt + 4 * Math.sin(a * 2),
        lhx: R.lhx + 1.2 * Math.sin(a + 0.8), lhy: R.lhy + 0.8 * Math.sin(a + 1.4), lhz: R.lhz + 1.0 * Math.sin(a + 0.8),
        rhz: R.rhz + 0.6 * Math.sin(a),
        lfz: R.lfz + 1.0 * Math.sin(a), rfz: R.rfz + 1.0 * Math.sin(a),
      },
    });
  }
  return { loop: 0, keys };
}

/** HER AS THE PAINTER TAKES HER. */
export function princessPainter(say: PrincessSay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]>; finish: ReturnType<typeof princessFinish> } {
  return { bits: (st, m) => princessBits(st, m, say), grains: (_st, m) => WISPS.get(m) ?? [], finish: princessFinish(say) };
}
void INK;
