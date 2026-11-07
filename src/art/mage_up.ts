// THE MAGE BROUGHT UP TO THE BRAWLER'S LEVEL (the art chat's helper, 7 Nov 2026; docs/mockups/mage_up/README.md).
// A MOCK-UP BEHIND A SWITCH THAT IS OFF: `MAGE_UP`. Nothing of the game imports this file: the game's Mage is exactly as she is
// (art/hero3_mage.ts, her moves in art/moves3.ts).
//
// The owner, 6 Nov 2026, asked whether to bring the other heroes up to the Brawler's smoothness: “Like is yes I’d like
// everything brought up to the same 30 drawings a second for all the character models, but I’d also like the first three
// Warrior Ranger and mage updated to the level of the brawler in terms of the rules that we have set for the rest of the
// drawings I don’t want them to lose the aesthetic or the flavor that they currently have but I think like the shapes rule the
// action rule we kind of want all that updated to a certain level certain benchmark as the rest of the characters so that
// they’re all at the same level.”
// And of the Ranger, 6 Nov 19:21: “Can you show me the ranger redone before you go too crazy with the drawings?”; then “Just a
// still of him”. The Mage the same: this is the first step, HER LOOK, sculpted, shown in stills.
//
// THE SAME BATTLE MAGE, BETTER DRAWN: the one he picked and the game has had since Version 16.0 (art/hero3_mage.ts, its `battle`
// look, which the game paints: the owner, 7 Oct 2026, 00:24, “its going to be the battle mage i can already tell”). Her tall
// pointed purple hat, its tip fallen over backward, its wide brim and the band of light round it; her face bare and in the
// light, her eyes dark; her pink hair in two braids brought forward from behind her ears over her shoulders (their ends the
// game's own, engine/tails.ts); a ragged teal cape over her shoulders; a purple bodice closed down the front on a line of light;
// a short purple robe to above the knee with its hem of light; a broad brown belt with its cyan buckle and a pouch at her right
// hip; steel on her forearms, plum gloves; dark hose and tall plum boots to the knee with a turned cuff; her staff of indigo
// wood with a long crystal at its head over a cross-bar of steel. On her own body (moves3.ts MAGE_BODY: the shortest of the
// three, narrow in the shoulder, a small waist, hips wider than it), in her own colours. Every glow on her the friend's cyan.
//
// What changes is how she is drawn: SCULPTED as the Warrior and the Ranger brought up and the Veteran are (dev/sculpt.ts: each
// solid melted into the next of its stuff, one body with a real outline, inked only where one stuff meets another or one part
// passes in front of another), in place of the old painter's balls and rods each on a sheet of its own and ringed in ink.
// Where a loved piece read old it is that same piece made new: her hat a felt cone that truly bends over at its tip, its brim a
// soft wide felt plate; her braids plaited; her cape cloth with folds and a ragged hem; her robe cloth that hangs from her hips
// and breaks into folds at its hem; the cross-bar of her staff curved up into two horns that cradle the crystal (the crescent
// of her first sketch, kept in the battle mage's steel); the crystal itself cut, with facets and an edge.
//
// HER EIGHT SIDES are the Warrior's (art/warrior_up.ts WuSide, WU_SPIN): every one truly painted, none mirrored, her staff in
// her right hand and her pouch at her right hip whichever way she faces (art/warrior_up_art.ts wuFacing).

import type { Light } from '../engine/px';
import type { TailRoot } from '../engine/tails';
import { book, bookShut, mageLight } from './hero_mage';
import { BROWN, CYAN, INDIGO, INK, MAIL, PINK, PLUM, ROBE, SPARK, STEEL, TEAL, hash } from './kit';
import type { Painted, Ramp } from './kit';
import { STAFF_DOWN, STAFF_UP, WILD } from './moves3';
import { CANVAS3, eyesToward, girdle, mid, stage, tippedFrom } from './skin';
import type { Stage } from './skin';
import { add, cross, dot, len, lerp3, mul, norm, sub, trunkOf } from './skeleton';
import type { Build, Posed, Skeleton, V3 } from './skeleton';
import { Sculpt, draw } from '../dev/sculpt';
import type { Drawn } from '../dev/sculpt';
import { WU_RIM, WU_SIDES, WU_SPIN, five, frame, turnedStage } from './warrior_up';
import type { WuSide } from './warrior_up';

/** THE SWITCH: off. The main chat's to turn on, on his yes to the pictures (and once her moves are brought up as well). */
export const MAGE_UP = { on: false };

/** Her sides: the Warrior's eight (art/warrior_up.ts). */
export type MuSide = WuSide;
export const MU_SIDES = WU_SIDES;

// ---------------------------------------------------------------------------------------------
// Her colours: her own three tones of each (kit.ts, as art/hero3_mage.ts paints her), with a tone between each two, so the
// sculpted surfaces turn smoothly in the light; her darkest and lightest exactly hers.

export const MU_ROBE: Ramp = five(ROBE);
export const MU_TEAL: Ramp = five(TEAL);
export const MU_PINK: Ramp = five(PINK);
export const MU_PLUM: Ramp = five(PLUM);
export const MU_HOSE: Ramp = five(MAIL);
export const MU_BROWN: Ramp = five(BROWN);
export const MU_STEEL: Ramp = five(STEEL);
export const MU_WOOD: Ramp = five(INDIGO);
/** Her skin: warm and lit, the Tinkerer's own (dev/sculpt_tinkerer.ts SKIN_F), as the sculpted heroes' faces are (the art chat,
 * 7 Nov: her face in the game's cool grey read as a mask at six times). */
export const MU_SKIN: Ramp = ['#42203a', '#7a4658', '#bc7c7c', '#e8b09c', '#ffdcc4'];
/** The warmth on her cheeks, and her mouth. */
const BLUSH = '#ec9a92';
const LIPS = '#b85a68';
export const MU_CYAN: Ramp = five(CYAN);
/** Her gloves: her plum a step darker. */
export const MU_GLOVE: Ramp = [PLUM[0], PLUM[0], MU_PLUM[1], PLUM[2], MU_PLUM[3]];

const D = Math.PI / 180;
const FLOOR = { n: [0, 0, -1] as V3, o: 0 };
/** Her head: how much bigger than the build's, and how far up her neck it is set (as the Ranger's: her face reads). */
const HEAD_K = 1.22;
const HEAD_UP = 0.6;
/** THE HAT: its brim's reach from the middle (a share of her height), the height of its cone, how far back its tip has fallen. */
export const MU_BRIM = 0.18;
export const MU_POINT = 15.5;
export const MU_BENT = 5.2;
/** How far the brim is tipped from the eye (degrees): the game looks down on her, and a level brim would hide her eyes. */
const BRIM_TIP = 18;
/** How far below the root of her neck her cape hangs. */
export const MU_CAPE = 5.0;
/** How far below the middle of her hips the hem of her robe hangs (a share of her thigh): above the knee. */
export const MU_HEM = 0.66;

/** What a frame is painted in the light of. */
export interface MuAround {
  /** The figure a frame earlier, and a few frames earlier (cloth follows a few frames behind). */
  prev?: Skeleton | null;
  past?: Skeleton | null;
  /** Where the wind has got to, 0..1. */
  wind?: number;
}

/** What a sculpted frame of her is, for the checks: the drawing, and the solids by part. */
export interface MuFrame extends Painted {
  drawn: Drawn;
  sc: Sculpt;
  s: Skeleton;
  spin: number;
  /** Where on her canvas the floor point under her is (WU_SPIN's `ax`: 98 for the three sides that face left), and its height. */
  ax: number;
  ay: number;
  /** The materials her staff's wood and its steel are (in `drawn.stuff`); its crystal is stuff 1000, the first part drawn beside
   * the sculpture. */
  staffMats: number[];
  /** Her robe's hem and her near boot's cuff, on the picture (for the legs panel: the knee the eye sees). */
  seen: { hemZ: number; cuffZ: number };
}

/** `v` made square to the unit `w`. */
const squareTo = (v: V3, w: V3): V3 => norm(sub(v, mul(w, dot(v, w))), [1, 0, 0]);
/** A point on a quadratic curve from `a` through the pull of `c` to `b`. */
const bez = (a: V3, c: V3, b: V3, k: number): V3 => add(add(mul(a, (1 - k) * (1 - k)), mul(c, 2 * k * (1 - k))), mul(b, k * k));
/** The point of the segment a..b nearest to p. */
const nearestOn = (p: V3, a: V3, b: V3): V3 => {
  const ab = sub(b, a);
  const k = Math.max(0, Math.min(1, dot(sub(p, a), ab) / (dot(ab, ab) || 1)));
  return add(a, mul(ab, k));
};

/**
 * HER, SCULPTED, at a pose (`s` solved from `q` on her build), seen from one of her sides. Returns the painting, its lights,
 * where her braids are fixed (the game moves them) and where her crystal burns.
 */
export function paintMageUp(s: Skeleton, q: Posed, side: MuSide, B: Build, around: MuAround = {}, rim: string | null = WU_RIM): MuFrame {
  const { spin, camera: view, ax } = WU_SPIN[side];
  const sc = new Sculpt();
  sc.spin = spin;
  const trunk = trunkOf(B, s);
  const [ribs, belly, pel] = trunk;
  const [cf, cl, cu] = s.chest;
  const [hf, hl, hu] = s.hips;
  const st0 = turnedStage(stage(view, ax), spin);
  const eye: V3 = st0.eye;
  const farOf = (p: V3): boolean => dot(sub(p, s.pelvis), eye) < -2.4;
  const dim = (h: { tone: number }, p: V3, r: Ramp): string | null => (farOf(p) ? r[Math.max(0, h.tone - 1)] : null);
  const wind = around.wind ?? 0;
  const lagFrom = around.past ?? around.prev ?? null;
  const lag: V3 = lagFrom ? mul(sub(s.pelvis, lagFrom.pelvis), -0.6) : [0, 0, 0];
  const lagC: V3 = len(lag) > 6 ? mul(lag, 6 / len(lag)) : lag;
  const gale = Math.max(0, q.gale);
  const [aS, aE, aW] = B.armR;
  const [lH, lK, lA] = B.legR;

  // ---- materials ----
  const hose = sc.mat({ ramp: MU_HOSE, crease: 0.3, paint: (h) => dim(h, h.p, MU_HOSE) });
  const boot = sc.mat({ ramp: MU_PLUM, crease: 0.4, paint: (h) => {
    const tg = h.prim.tag ?? '';
    const t = farOf(h.p) ? h.tone - 1 : h.tone;
    // (the turned cuff: the leather turned down, a tone lighter, its fold lit along the top)
    if (tg === 'cuff') return MU_PLUM[Math.max(1, Math.min(4, t + 1))];
    // (soft leather: a crease here and there across the shaft where it wrinkles at the ankle)
    if (tg === 'shaft' && hash(h.x, Math.floor(h.y / 3), 5) < 0.12) return MU_PLUM[Math.max(0, t - 1)];
    return MU_PLUM[Math.max(0, Math.min(4, t))];
  } });
  /** How far a point of the cloth stands out in its fold (-1 the deepest hollow, 1 the highest ridge), set as the cloth is laid. */
  let skirtFold: (p: V3) => number = () => 0;
  let capeFold: (p: V3) => number = () => 0;
  const robe = sc.mat({ ramp: MU_ROBE, crease: 0.36, paint: (h) => {
    const tg = h.prim.tag ?? '';
    const t = farOf(h.p) ? h.tone - 1 : h.tone;
    // HER HEM OF LIGHT: the last of her robe, the friend's cyan, brighter where the light is on it
    if (tg === 'hem') return t >= 3 ? CYAN[3] : t >= 1 ? CYAN[2] : CYAN[0];
    if (tg === 'skirt') {
      const k = skirtFold(h.p);
      if (k < -0.32) return MU_ROBE[Math.max(0, Math.min(3, t - 1))];
      if (k > 0.55 && t >= 2) return MU_ROBE[Math.min(4, t + 1)];
      return MU_ROBE[Math.max(0, Math.min(4, t))];
    }
    if (tg === 'ribs' || tg === 'chest' || tg === 'belly' || tg === 'bust') {
      // THE LINE IT CLOSES ON, glowing, down the front of her bodice, from her collar to her belt
      const v = sub(h.p, ribs.c);
      const across = dot(v, cl);
      const fwd = dot(v, cf);
      if (fwd > 0 && Math.abs(across) < 0.42) return t >= 2 ? CYAN[3] : CYAN[2];
      // (and its seams: a darker line down each side of her bodice, under the arm)
      if (Math.abs(fwd) < 0.45 && Math.abs(across) > ribs.h[1] * 0.6) return MU_ROBE[Math.max(0, t - 1)];
    }
    // (the sleeve's cuff, where the steel begins: a tone darker, a turned edge)
    if (tg === 'cuffS') return MU_ROBE[Math.max(0, Math.min(3, t - 1))];
    return MU_ROBE[Math.max(0, Math.min(4, t))];
  } });
  const teal = sc.mat({ ramp: MU_TEAL, crease: 0.42, paint: (h) => {
    const tg = h.prim.tag ?? '';
    const t = farOf(h.p) ? h.tone - 1 : h.tone;
    if (tg === 'cape') {
      // (its folds read as folds whatever the light; its lining, where it turns from her, a tone darker)
      const k = capeFold(h.p);
      if (k < -0.32) return MU_TEAL[Math.max(0, Math.min(3, t - 1))];
      if (k > 0.55 && t >= 2) return MU_TEAL[Math.min(4, t + 1)];
    }
    if (tg === 'rag') return MU_TEAL[Math.max(0, Math.min(3, t - 1))];
    return MU_TEAL[Math.max(0, Math.min(4, t))];
  } });
  const belt = sc.mat({ ramp: MU_BROWN, crease: 0.35, paint: (h) => {
    const t = farOf(h.p) ? h.tone - 1 : h.tone;
    // (stitched along both edges)
    if (h.prim.tag === 'belt' && (h.x + h.y) % 3 === 0 && hash(h.x, h.y, 21) < 0.3) return MU_BROWN[Math.max(0, t - 1)];
    return MU_BROWN[Math.max(0, Math.min(4, t))];
  } });
  const pouch = sc.mat({ ramp: MU_PLUM, crease: 0.4, paint: (h) => (h.prim.tag === 'flap' ? MU_PLUM[Math.max(0, Math.min(4, h.tone + 1))] : dim(h, h.p, MU_PLUM)) });
  const steel = sc.mat({ ramp: MU_STEEL, crease: 0.4, paint: (h) => {
    const t = farOf(h.p) ? h.tone - 1 : h.tone;
    // (a vambrace's lit ridge down its outside, and its rolled edges)
    if (h.prim.tag === 'ridge') return MU_STEEL[Math.min(4, Math.max(2, t + 1))];
    if (h.prim.tag === 'roll') return MU_STEEL[Math.max(0, t - 1)];
    return MU_STEEL[Math.max(0, Math.min(4, t))];
  } });
  const silver = sc.mat({ ramp: MU_STEEL, crease: 0.3, paint: (h) => MU_STEEL[Math.max(1, Math.min(4, h.tone + (h.prim.tag === 'horn' ? 1 : 0)))] });
  const glove = sc.mat({ ramp: MU_GLOVE, crease: 0.35, paint: (h) => dim(h, h.p, MU_GLOVE) });
  // (where the brim of her hat is, for its shadow on her face and hair; and her face's own frame, for its shading: set as they are
  // laid, read as the figure is drawn)
  const brimAt: { c: V3; u: V3 } = { c: [0, 0, 1e3], u: [0, 0, 1] };
  const faceAt: { c: V3; f: V3; l: V3; u: V3; r: V3 } = { c: [0, 0, 0], f: [1, 0, 0], l: [0, 1, 0], u: [0, 0, 1], r: [1, 1, 1] };
  /** How far below the brim a point is (a length of her: less than 0 above it). */
  const underBrim = (p: V3): number => dot(sub(brimAt.c, p), brimAt.u);
  // HER FACE, WARM AND LIT: lifted a tone, as a hero's face is, so that it reads at the game's size; the brim's soft shadow across
  // her brow (a band, dithered at its foot); the shadowed side of her nose and the hollow under it; warmth on her cheeks. Her neck
  // a tone down, and darker at her nape under her hair.
  const skin = sc.mat({ ramp: MU_SKIN, crease: 0.2, paint: (h) => {
    const tg = h.prim.tag ?? '';
    if (h.prim.piece === 'neck') {
      const t = Math.max(0, Math.min(3, h.tone));
      return underBrim(h.p) < 4.2 ? MU_SKIN[Math.max(0, t - 1)] : MU_SKIN[t];
    }
    if (h.prim.piece !== 'head') return null;
    let t = Math.min(4, Math.max(2, h.tone + 1));
    const d = underBrim(h.p);
    if (d > -0.2 && (d < 1.1 || (d < 1.7 && (h.x + h.y) % 2 === 0))) t = Math.max(1, t - 1);
    if (tg === 'nose' && h.tone <= 2) t = Math.max(1, t - 1);
    const v = sub(h.p, faceAt.c);
    const fw = dot(v, faceAt.f) / faceAt.r[0];
    const lat = Math.abs(dot(v, faceAt.l)) / faceAt.r[1];
    const up = dot(v, faceAt.u) / faceAt.r[2];
    // (under her nose, the hollow above her lip)
    if (fw > 0.75 && lat < 0.16 && up < -0.2 && up > -0.36) t = Math.max(1, t - 1);
    // (her cheeks, a pixel or two under her eyes, never beside them)
    if (fw > 0.45 && lat > 0.4 && lat < 0.74 && up < -0.42 && up > -0.64 && t >= 3) return BLUSH;
    return MU_SKIN[t];
  } });
  // (her hair: pink, as it always was)
  const headAt: { c: V3; f: V3; l: V3; u: V3; r: V3 } = { c: [0, 0, 0], f: [1, 0, 0], l: [0, 1, 0], u: [0, 0, 1], r: [1, 1, 1] };
  /** Where the plaits begin behind her ears, in her head's own frame (a share of its half-sizes): out to each side, and down. */
  const ROOT_OUT = 0.78;
  const ROOT_DOWN = -0.55;
  const hair = sc.mat({ ramp: MU_PINK, crease: 0.3, meld: true, paint: (h) => {
    const tg = h.prim.tag ?? '';
    let t = farOf(h.p) ? h.tone - 1 : h.tone;
    // (the brim's shadow on her hair, just under it)
    if (underBrim(h.p) > -0.2 && underBrim(h.p) < 1.3) t = Math.max(0, t - 1);
    if (tg === 'plait') {
      // HER PLAITS, WOVEN: each crossing a lobe of hair laid slantwise over the last, lit on its crown, dark in the seam where it
      // goes under the next
      const p = h.prim;
      if (p.k === 'ell') {
        const a = p.axes[0];
        const along = dot(sub(h.p, p.c), a) / (dot(a, a) || 1);
        if (Math.abs(along) > 0.62) return MU_PINK[Math.max(0, t - 1)];
        if (Math.abs(along) < 0.3) return MU_PINK[Math.max(2, Math.min(4, t + 1))];
      }
      return MU_PINK[Math.max(1, Math.min(4, t))];
    }
    if (tg === 'hair' || tg === 'gather') {
      // ON HER HEAD: parted down the back; the hair drawn from the parting out and down to her plaits behind her ears, in
      // strands (a dark one, a mid one, a lit one in turn, each running from the parting to the plait); a sheen across the
      // round of her head where the light is on it
      const v = sub(h.p, headAt.c);
      const across = dot(v, headAt.l) / headAt.r[1];
      const back = -dot(v, headAt.f) / headAt.r[0];
      const up = dot(v, headAt.u) / headAt.r[2];
      if (back > 0.05 && up > ROOT_DOWN) {
        // (the parting: dark, the hair either side of it drawn up from it and catching the light)
        if (Math.abs(across) < 0.2) return MU_PINK[0];
        if (Math.abs(across) < 0.36) return MU_PINK[Math.min(4, t + 2)];
      }
      const a = Math.abs(across) / ROOT_OUT;
      if (back > -0.2 && a < 0.97) {
        const u0 = ROOT_DOWN + (up - ROOT_DOWN) / (1 - a);
        const strand = ((Math.floor(u0 * 4) % 3) + 3) % 3;
        // (strong enough to read on her shadowed side as on her lit one: a dark strand, a mid one, a lit one)
        if (strand === 0) return MU_PINK[Math.max(0, t - 1)];
        if (u0 > 0.35 && u0 < 0.75) return MU_PINK[Math.min(4, t + 2)];
        if (strand === 2) return MU_PINK[Math.min(4, t + 1)];
      }
    }
    return MU_PINK[Math.max(0, Math.min(4, t))];
  } });
  const hatM = sc.mat({ ramp: MU_ROBE, crease: 0.45, paint: (h) => {
    const tg = h.prim.tag ?? '';
    const t = h.tone;
    // HER HAT'S BAND OF LIGHT, the friend's cyan, round the foot of its cone
    if (tg === 'band') return t >= 3 ? CYAN[4] : t >= 2 ? CYAN[3] : CYAN[2];
    // (the brim's edge, a turned felt edge lit along its top; the shadow of the cone where it meets the brim)
    if (tg === 'brimEdge') return MU_ROBE[Math.max(1, Math.min(4, t + 1))];
    // (the crease where the cone bends over: the felt folded on itself, dark in the fold)
    if (tg === 'crease') return MU_ROBE[Math.max(0, t - 1)];
    // (felt: the lit side of the cone a step lighter, so the purple of it reads)
    if (tg === 'cone' && t >= 2) return MU_ROBE[Math.min(4, t + 1)];
    return MU_ROBE[Math.max(0, Math.min(4, t))];
  } });
  const wood = sc.mat({ ramp: MU_WOOD, crease: 0.3, paint: (h) => {
    const t = h.tone;
    // (the grain of the wood: a lit line down it here and there; a leather wrap where her hand holds it)
    if (h.prim.tag === 'wrap') return (h.y + h.x) % 2 === 0 ? MU_BROWN[Math.max(0, Math.min(3, t))] : MU_BROWN[Math.max(0, t - 1)];
    if (h.prim.tag === 'knot') return MU_WOOD[Math.max(0, t - 1)];
    return MU_WOOD[Math.max(0, Math.min(4, t))];
  } });

  // ---- THE LEGS: dark hose; tall soft plum boots to the knee with a turned cuff ----
  let cuffZ = 0;
  const nearLeg = st0.near(s.kneeL) >= st0.near(s.kneeR) ? 'L' : 'R';
  for (const sd of ['L', 'R'] as const) {
    const hip = sd === 'L' ? s.hipL : s.hipR;
    const knee = sd === 'L' ? s.kneeL : s.kneeR;
    const ankle = sd === 'L' ? s.ankleL : s.ankleR;
    const heel = sd === 'L' ? s.heelL : s.heelR;
    const toe = sd === 'L' ? s.toeL : s.toeR;
    const leg = `leg${sd}`;
    const td = norm(sub(knee, hip));
    const tf = squareTo(sub(toe, heel), td);
    sc.cone(hose, leg, hip, knee, lH + 0.1, lK + 0.12, 1.4, { tag: 'thigh' });
    sc.ell(hose, leg, add(lerp3(hip, knee, 0.42), mul(tf, 0.4)), [mul(td, B.thigh * 0.3), mul(tf, lH * 0.66), mul(norm(cross(td, tf)), lH * 0.72)], 1.2, { tag: 'quad' });
    const sd2 = norm(sub(ankle, knee));
    const sf = squareTo(sub(toe, heel), sd2);
    // the boot: from just below the knee to the ankle, the calf's swell inside it; its cuff turned down at the knee
    const top = lerp3(knee, ankle, 0.06);
    sc.cone(hose, `knee${sd}`, knee, top, lK + 0.12, lK + 0.1, 0.8, { tag: 'knee' });
    sc.cone(boot, `boot${sd}`, top, ankle, lK + 0.42, lA + 0.55, 1.0, { tag: 'shaft' });
    sc.ell(boot, `boot${sd}`, add(lerp3(top, ankle, 0.3), mul(sf, -0.55)), [mul(sd2, B.shank * 0.22), mul(sf, lK * 0.7), mul(norm(cross(sd2, sf)), lK * 0.74)], 1.0, { tag: 'shaft' });
    const across = norm(cross(sd2, sf));
    const cuffAt = add(top, mul(sd2, 0.9));
    sc.ell(boot, `cuff${sd}`, cuffAt, [mul(sf, lK + 0.8), mul(across, lK + 0.75), mul(sd2, 1.15)], 0.3, { tag: 'cuff' });
    if (sd === nearLeg) cuffZ = top[2];
    // the foot: a soft pointed boot flat on the floor (never in it)
    const fd = norm(sub(toe, heel));
    const fu0 = norm(cross(cross(fd, [0, 0, 1]), fd), [0, 0, 1]);
    const up = dot(fu0, [0, 0, 1]) < 0 ? mul(fu0, -1) : fu0;
    sc.cone(boot, `boot${sd}`, add(heel, mul(up, 1.6)), add(toe, mul(up, 1.1)), 1.8, 1.15, 0.9, { tag: 'foot', cuts: [FLOOR] });
    sc.ell(boot, `boot${sd}`, add(lerp3(heel, toe, 0.35), mul(up, 2.0)), [mul(fd, B.ball * 0.5), mul(norm(cross(up, fd)), 1.8), mul(up, 1.6)], 0.9, { tag: 'foot', cuts: [FLOOR] });
    sc.cone(boot, `boot${sd}`, ankle, add(lerp3(heel, toe, 0.3), mul(up, 1.7)), lA + 0.5, 1.6, 0.9, { tag: 'foot', cuts: [FLOOR] });
  }

  // ---- THE BODICE: one body of her purple: a woman's chest drawn in to a small waist, out again over her hips ----
  const neckCut = [{ n: cu, o: dot(cu, s.neck) + 0.2 }];
  sc.ell(robe, 'trunk', ribs.c, [mul(ribs.r[0], ribs.h[0] + 0.6), mul(ribs.r[1], ribs.h[1] + 0.5), mul(ribs.r[2], ribs.h[2] + 0.2)], 2.2, { tag: 'ribs', cuts: neckCut });
  sc.ell(robe, 'trunk', add(ribs.c, mul(cu, ribs.h[2] * 0.3)), [mul(cf, ribs.h[0] * 0.85), mul(cl, B.shoulderHalf * 0.9), mul(cu, ribs.h[2] * 0.45)], 2.0, { tag: 'chest', cuts: neckCut });
  for (const sh of [s.shoulderL, s.shoulderR]) sc.cone(robe, 'trunk', add(s.neck, mul(cu, -0.6)), sh, 2.2, 1.9, 1.5, { tag: 'chest' });
  // (her bust, soft, under the bodice)
  sc.ell(robe, 'trunk', add(ribs.c, add(mul(cf, ribs.h[0] * 0.55), mul(cu, -ribs.h[2] * 0.05))), [mul(cf, ribs.h[0] * 0.75), mul(cl, ribs.h[1] * 0.92), mul(cu, ribs.h[2] * 0.42)], 1.6, { tag: 'bust' });
  sc.ell(robe, 'trunk', belly.c, [mul(belly.r[0], belly.h[0] + 0.5), mul(belly.r[1], belly.h[1] + 0.4), mul(belly.r[2], belly.h[2] * 1.0)], 2.0, { tag: 'belly' });
  sc.ell(robe, 'trunk', pel.c, [mul(pel.r[0], pel.h[0] + 0.9), mul(pel.r[1], pel.h[1] + 0.9), mul(pel.r[2], pel.h[2] * 0.95)], 2.0, { tag: 'pelvis' });

  // ---- HER ROBE BELOW THE BELT, short, to above the knee: one sheet of her purple hung from her hips (it lies on them and goes
  // as they go), falling a little wider than them, in FOLDS gathered at the belt that open out as they fall and break the hem
  // where they end, its last band her hem of light. It hangs plumb from the hips down, wide enough to clear both thighs wherever
  // they are (a thigh that comes against it pushes it out, and the hem round about it goes with it, as cloth does), left behind
  // by how far her hips have come over the last few frames (it follows) and stirred by the wind ----
  const hipMid = mid(s.hipL, s.hipR);
  const hemZ = Math.max(3.2, hipMid[2] - B.thigh * MU_HEM);
  {
    const f = norm([hf[0], hf[1], 0], [1, 0, 0]);
    const l = norm([hl[0], hl[1], 0], [0, 1, 0]);
    const COLS = 20;
    const angs = Array.from({ length: COLS }, (_, i) => (i * 360) / COLS);
    const FOLD = [0.2, 1.0, -0.6, 1.3, -0.5, 0.9, -0.7, 1.2, -0.45, 1.1, -0.3, 1.25, -0.6, 0.95, -0.5, 1.3, -0.65, 1.0, -0.4, 0.8];
    const waistRing = girdle(pel, 0.62, 1.15);
    const hipRing = girdle(pel, -0.1, 1.5);
    const centre: V3 = [hipMid[0], hipMid[1], 0];
    // (how far out each column's hem must come to clear the thighs)
    const need = angs.map((deg) => {
      const a = deg * D;
      const outFlat = norm(add(mul(f, Math.cos(a)), mul(l, Math.sin(a))), f);
      let out = Math.hypot((B.pelvisDeep + 2.0) * Math.cos(a), (B.pelvisHalf + 2.4) * Math.sin(a));
      for (const [hip, knee] of [[s.hipL, s.kneeL], [s.hipR, s.kneeR]] as const) {
        for (const k of [0.25, 0.45, 0.65, 0.85]) {
          const pt = lerp3(hip, knee, k);
          if (pt[2] < hemZ - 1.5) continue;
          const rel: V3 = [pt[0] - centre[0], pt[1] - centre[1], 0];
          const radial = dot(rel, outFlat);
          const acr = Math.abs(dot(rel, [-outFlat[1], outFlat[0], 0]));
          if (acr < 2.6 + lH) out = Math.max(out, radial + lH + 1.0 - acr * 0.12);
        }
      }
      return out;
    });
    // (cloth: each column eased toward its neighbours, so the hem drapes between them and never spikes)
    const hemR = need.map((n, i) => Math.max(n, 0.5 * n + 0.25 * need[(i + COLS - 1) % COLS] + 0.25 * need[(i + 1) % COLS]));
    const grid: V3[][] = [[], [], [], []];
    for (let i = 0; i < COLS; i++) {
      const a = angs[i] * D;
      const ring = (r: { c: V3; u: V3; v: V3 }, more = 0): V3 => add(r.c, add(mul(norm(r.u), Math.cos(a) * (len(r.u) + more)), mul(norm(r.v), Math.sin(a) * (len(r.v) + more))));
      const outFlat = norm(add(mul(f, Math.cos(a)), mul(l, Math.sin(a))), f);
      const fold = FOLD[i];
      const flutter = Math.sin((wind + i / COLS) * Math.PI * 2) * 0.35;
      const r = hemR[i] + fold * 0.75 + flutter;
      // (a ridge hangs a little lower than a hollow: the hem breaks where each fold ends)
      const drop = -Math.max(0, fold) * 0.55 + Math.max(0, -fold) * 0.35;
      const hem: V3 = add([centre[0] + outFlat[0] * r, centre[1] + outFlat[1] * r, hemZ + drop], add(lagC, mul(outFlat, gale * 0.4 * Math.max(0, -Math.cos(a)))));
      const band: V3 = add(hem, [0, 0, 0.85]);
      grid[0].push(ring(waistRing, 0.2));
      grid[1].push(lerp3(ring(hipRing, 0.4 + Math.max(0, fold) * 0.25), band, 0.18));
      grid[2].push(band);
      grid[3].push(hem);
    }
    skirtFold = (p: V3): number => {
      const v = sub(p, s.pelvis);
      const deg = (((Math.atan2(dot(v, l), dot(v, f)) / D) % 360) + 360) % 360;
      const i = Math.floor(deg / (360 / COLS)) % COLS;
      const k = deg / (360 / COLS) - Math.floor(deg / (360 / COLS));
      const fold = FOLD[i] + (FOLD[(i + 1) % COLS] - FOLD[i]) * k;
      const down = Math.max(0, Math.min(1, (waistRing.c[2] - p[2]) / Math.max(1, waistRing.c[2] - hemZ)));
      return (fold / 1.3) * Math.min(1, down * 1.5);
    };
    for (let ri = 0; ri + 1 < grid.length; ri++) for (let ci = 0; ci < COLS; ci++) {
      const cj = (ci + 1) % COLS;
      const a = grid[ri][ci];
      const b = grid[ri][cj];
      const c = grid[ri + 1][ci];
      const d = grid[ri + 1][cj];
      const tag = ri === 2 ? 'hem' : 'skirt';
      sc.tri(robe, 'skirt', a, b, d, 0.42, 0.9, { tag });
      sc.tri(robe, 'skirt', a, d, c, 0.42, 0.9, { tag });
    }
  }

  // ---- THE BELT: broad brown leather at her waist, its cyan buckle in front; a pouch at her right hip ----
  const beltRing = girdle(pel, 0.75, 1.25);
  sc.ell(belt, 'belt', beltRing.c, [mul(hf, len(beltRing.u) + 0.75), mul(hl, len(beltRing.v) + 0.75), mul(hu, 1.45)], 0.4, { tag: 'belt' });
  const buckle = add(beltRing.c, mul(norm(beltRing.u), len(beltRing.u) + 1.7));
  sc.mark(buckle, CYAN[4], 1, 1, 0, 0, 2.5);
  sc.mark(buckle, CYAN[2], 1, 1, 1, 0, 2.5);
  sc.mark(buckle, CYAN[2], 1, 1, 0, 1, 2.5);
  sc.mark(buckle, CYAN[3], 1, 1, 1, 1, 2.5);
  {
    const at = add(beltRing.c, add(mul(hf, 0.9), add(mul(hl, -(len(beltRing.v) + 1.6)), mul(hu, -2.0))));
    sc.box(pouch, 'pouch', at, [mul(hf, 1.9), mul(hl, 1.2), mul(hu, 2.0)], 0.9, 0.4, { tag: 'pouch' });
    // (its flap, folded over the top)
    sc.box(pouch, 'pouch', add(at, add(mul(hu, 1.3), mul(hl, -0.35))), [mul(hf, 2.05), mul(hl, 0.55), mul(hu, 1.0)], 0.4, 0.2, { tag: 'flap' });
    sc.mark(add(at, add(mul(hu, 0.5), mul(hl, -1.3))), MU_STEEL[4], 1, 1, 0, 0, 2.0);
  }

  // ---- THE ARMS: purple sleeves to below the elbow; steel on her forearms; plum gloves ----
  for (const sd of ['L', 'R'] as const) {
    const sh = sd === 'L' ? s.shoulderL : s.shoulderR;
    const el = sd === 'L' ? s.elbowL : s.elbowR;
    const hand = sd === 'L' ? s.handL : s.handR;
    const outSide = mul(cl, sd === 'L' ? 1 : -1);
    const arm = `arm${sd}`;
    sc.cone(robe, arm, sh, el, aS + 0.3, aE + 0.35, 1.2, { tag: 'sleeve' });
    sc.ell(robe, arm, add(sh, mul(outSide, 0.2)), [mul(cf, aS + 0.35), mul(outSide, aS + 0.4), mul(cu, aS + 0.1)], 1.2, { tag: 'sleeve' });
    const fd = norm(sub(hand, el), cf);
    const wrist = lerp3(el, hand, 0.84);
    // (the sleeve's end, turned back just past the elbow)
    sc.ell(robe, `fore${sd}`, add(el, mul(fd, 0.9)), [mul(fd, 1.0), ...frame(fd, cl).slice(1).map((v) => mul(v, aE + 0.75))] as unknown as [V3, V3, V3], 0.4, { tag: 'cuffS' });
    // the vambrace: steel from below the elbow to the wrist, flaring a little at the elbow, a lit ridge down its outside
    sc.cone(steel, `fore${sd}`, add(el, mul(fd, 1.7)), wrist, aE + 0.55, aW + 0.5, 0.6, { tag: 'vamb' });
    const [, fb, fc] = frame(fd, cl);
    const ridgeOut = norm(add(mul(fb, sd === 'L' ? 1 : -1), mul(fc, 0.4)));
    sc.cone(steel, `fore${sd}`, add(add(el, mul(fd, 2.0)), mul(ridgeOut, aE + 0.25)), add(wrist, mul(ridgeOut, aW + 0.2)), 0.42, 0.36, 0.3, { tag: 'ridge' });
    sc.ell(steel, `fore${sd}`, wrist, [mul(fd, 0.5), mul(fb, aW + 0.75), mul(fc, aW + 0.75)], 0.2, { tag: 'roll' });
    // the glove: a fist
    const [ha, hb, hc] = frame(fd, cl);
    sc.ell(glove, `hand${sd}`, add(hand, mul(fd, 0.1)), [mul(ha, aW + 0.55), mul(hb, aW + 0.7), mul(hc, aW + 0.6)], 0.7, { tag: 'fist' });
  }

  // ---- THE CAPE, RAGGED TEAL CLOTH over her shoulders: one sheet from the root of her neck, over the points of her shoulders
  // and round her back, to the middle of her upper arms, open down the front from a clasp at her throat (so her bodice and its
  // line of light show under it); in folds gathered at her neck that open out as they fall; its hem cut into ragged points, none
  // the same, each falling a little lower than the cloth it is cut from. Her arms come out from under it; an arm raised lifts the
  // cloth over it. Left behind by how far she has come, stirred by the wind, thrown back by a blast in her face ----
  {
    const COLS = 16;
    /** Where it opens in front: its two front edges this many degrees either side of her middle. */
    const OPEN = 34;
    const step = (360 - 2 * OPEN) / (COLS - 1);
    const angs = Array.from({ length: COLS }, (_, i) => OPEN + i * step);
    const FOLD = [0, -0.6, 1.1, -0.7, 1.3, -0.5, 1.0, -0.8, 1.4, -0.6, 1.2, -0.75, 1.1, -0.55, 0.9, 0];
    const RAG = [1.2, 2.6, 1.2, 3.2, 0.8, 2.4, 1.5, 3.4, 1.0, 2.9, 1.3, 2.5, 0.8, 3.0, 1.1, 1.6];
    const c0 = add(s.neck, mul(cu, 0.5));
    const c1 = add(s.neck, mul(cu, -0.9));
    const sway = add(add(mul(lagC, 0.45), mul(cl, Math.sin((wind + 0.1) * Math.PI * 2) * 0.3)), mul(cf, -gale * 1.7));
    const c2 = add(add(s.neck, mul(cu, -MU_CAPE)), sway);
    const r0: [number, number] = [B.ribDeep * 0.8 + 0.5, 3.0];
    const r1: [number, number] = [B.ribDeep + 1.4, B.shoulderHalf + aS + 0.85];
    const r2: [number, number] = [B.ribDeep + 2.0, B.shoulderHalf + aS + 1.3];
    const at = (c: V3, r: [number, number], deg: number, more: number): V3 => add(c, add(mul(cf, Math.cos(deg * D) * (r[0] + more)), mul(cl, Math.sin(deg * D) * (r[1] + more))));
    /** A point of the cloth kept outside the upper arms (and the shoulders under them), lifted over an arm that is raised. */
    const clear = (p: V3, room: number): V3 => {
      let out = p;
      for (const [sh, el] of [[s.shoulderL, s.elbowL], [s.shoulderR, s.elbowR]] as const) {
        const c = nearestOn(out, sh, el);
        const d = sub(out, c);
        const dd = len(d);
        const want = aS + room;
        if (dd < want) out = add(c, mul(dd > 1e-3 ? mul(d, 1 / dd) : cu, want));
      }
      return out;
    };
    const grid: V3[][] = [[], [], []];
    for (let i = 0; i < COLS; i++) {
      const deg = angs[i];
      const fold = FOLD[i];
      // (its front edges fall a little in toward her middle, as an open cape's do)
      const edge = i === 0 || i === COLS - 1 ? 0.6 : 0;
      // (its collar falls away at the back, so her nape and the start of her plaits are seen under her hair)
      grid[0].push(add(at(c0, r0, deg, 0.3 * Math.max(0, -Math.cos(deg * D))), mul(cu, -1.7 * Math.max(0, -Math.cos(deg * D)) ** 1.5)));
      grid[1].push(clear(at(c1, r1, deg, fold * 0.15 - edge * 0.3), 0.6));
      // (it hangs longer down her back than over her arms)
      const longer = 1.9 * Math.max(0, -Math.cos(deg * D));
      grid[2].push(clear(add(at(c2, r2, deg + (i === 0 ? -6 : i === COLS - 1 ? 6 : 0), fold * 0.7 - edge), [0, 0, -longer]), 0.75));
    }
    capeFold = (p: V3): number => {
      const v = sub(p, s.neck);
      const deg = (((Math.atan2(dot(v, cl), dot(v, cf)) / D) % 360) + 360) % 360;
      const x = Math.max(0, Math.min(COLS - 1.001, (deg - OPEN) / step));
      const i = Math.floor(x);
      const fold = FOLD[i] + (FOLD[i + 1] - FOLD[i]) * (x - i);
      const down = Math.max(0, Math.min(1, (c0[2] - p[2]) / Math.max(1, c0[2] - c2[2])));
      return (fold / 1.2) * Math.min(1, down * 1.6);
    };
    for (let ri = 0; ri + 1 < grid.length; ri++) for (let ci = 0; ci + 1 < COLS; ci++) {
      const cj = ci + 1;
      sc.tri(teal, 'cape', grid[ri][ci], grid[ri][cj], grid[ri + 1][cj], 0.4, 0.9, { tag: 'cape' });
      sc.tri(teal, 'cape', grid[ri][ci], grid[ri + 1][cj], grid[ri + 1][ci], 0.4, 0.9, { tag: 'cape' });
    }
    // (its ragged hem: a point of the cloth hanging from each stretch of it, each its own length)
    for (let ci = 0; ci + 1 < COLS; ci++) {
      const a = grid[2][ci];
      const b = grid[2][ci + 1];
      const m = mid(a, b);
      const outward = norm(sub([m[0], m[1], 0], [s.neck[0], s.neck[1], 0]), cf);
      const tip = clear(add(m, add([0, 0, -RAG[ci] - 0.4 * Math.sin((wind + ci / COLS) * Math.PI * 2)], mul(outward, 0.35 + RAG[ci] * 0.12))), 0.8);
      sc.tri(teal, 'cape', lerp3(a, m, 0.1), lerp3(b, m, 0.1), tip, 0.38, 0.6, { tag: 'rag' });
    }
    // the clasp at her throat that holds its two front corners: a cord of the cloth across, a boss of steel on it
    const ca = grid[0][0];
    const cb = grid[0][COLS - 1];
    sc.cone(teal, 'cape', ca, cb, 0.45, 0.45, 0.3, { tag: 'rag' });
    sc.ell(silver, 'clasp', add(mid(ca, cb), mul(cf, 0.3)), [mul(cf, 0.7), mul(cl, 1.0), mul(cu, 0.9)], 0.2, { tag: 'horn' });
  }

  // ---- THE HEAD: her face bare and in the light, a small chin, a short straight nose; pink hair over the back and crown of her
  // head and down behind her ears into her braids; dark eyes. Drawn where the game has always put a face's middle (two thirds of
  // the way toward whoever looks: skin.ts eyesToward), so both eyes are seen ----
  const [ff, fl, fu] = s.face;
  const R: V3 = [B.headR[0] * HEAD_K, B.headR[1] * HEAD_K, B.headR[2] * HEAD_K];
  const HC = add(s.head, mul(fu, HEAD_UP));
  headAt.c = HC;
  headAt.f = ff;
  headAt.l = fl;
  headAt.u = fu;
  headAt.r = R;
  sc.cone(skin, 'neck', s.neck, add(HC, mul(fu, -R[2] * 0.55)), 1.55, 1.5, 1.0, { tag: 'neck' });
  sc.ell(skin, 'head', add(HC, add(mul(ff, -R[0] * 0.08), mul(fu, R[2] * 0.06))), [mul(ff, R[0] * 0.9), mul(fl, R[1] * 0.92), mul(fu, R[2] * 0.82)], 1.2, { tag: 'skull' });
  const eyes = eyesToward(st0, s);
  const midTurn = ((eyes[0] + eyes[1]) / 2) * D;
  const F = norm(add(mul(ff, Math.cos(midTurn)), mul(fl, Math.sin(midTurn))));
  const Lf = norm(cross(fu, F));
  const atF = (f: number, l: number, u: number): V3 => add(HC, add(mul(F, f * R[0]), add(mul(Lf, l * R[1]), mul(fu, u * R[2]))));
  faceAt.c = HC;
  faceAt.f = F;
  faceAt.l = Lf;
  faceAt.u = fu;
  faceAt.r = R;
  // (a small soft chin and cheeks, one skin with the skull; a short straight nose)
  sc.ell(skin, 'head', atF(0.3, 0, -0.42), [mul(F, R[0] * 0.55), mul(Lf, R[1] * 0.62), mul(fu, R[2] * 0.42)], 1.5, { tag: 'jaw' });
  sc.cone(skin, 'head', atF(0.84, 0, 0.0), atF(1.0, 0, -0.18), 0.42, 0.55, 0.6, { tag: 'nose' });
  // her hair over the back and crown of her head, its edge back off her brow and behind her ears, and cut off at her nape (her
  // neck shows under it, between her plaits); gathered behind each ear where her plaits begin
  const hairCut = norm(add(ff, mul(fu, -0.35)));
  const nape = [{ n: hairCut, o: dot(hairCut, HC) - R[0] * 0.22 }, { n: mul(fu, -1), o: -dot(fu, add(HC, mul(fu, -R[2] * 0.5))) }];
  sc.ell(hair, 'head', add(HC, add(mul(ff, -R[0] * 0.12), mul(fu, R[2] * 0.1))), [mul(ff, R[0] * 0.92 + 0.5), mul(fl, R[1] * 0.94 + 0.5), mul(fu, R[2] * 0.84 + 0.5)], 0.5, { tag: 'hair', cuts: nape });
  // HER EYES: dark, two pixels tall, a dark brow over each, on the lit skin under the brim; and her mouth, a touch of rose
  for (const k of [1, -1]) {
    const p = atF(0.86, k * 0.36, 0.02);
    if (dot(sub(p, HC), eye) <= 0.4) continue;
    sc.mark(p, INK, 1, 2, 0, 0, 4, skin);
    // (her brow, dark pink, a pixel above, and a lash at the eye's outer corner)
    sc.mark(p, MU_PINK[0], 1, 1, 0, -2, 4, skin);
    const outer = atF(0.86, k * 0.62, 0.1);
    if (dot(sub(outer, HC), eye) > 0.4) sc.mark(outer, INK, 1, 1, 0, 0, 4, skin);
  }
  {
    const p = atF(0.92, 0, -0.5);
    if (dot(sub(p, HC), eye) > 0.6) sc.mark(p, LIPS, 1, 1, 0, 0, 4, skin);
  }

  // ---- HER BRAIDS: from behind each ear, plaited, forward over her collar bone; from there the game hangs the rest of each
  // (engine/tails.ts), so it really moves ----
  const tailsAt: { id: string; p: V3 }[] = [];
  for (const sg of [-1, 1]) {
    const p0 = add(add(HC, mul(fl, sg * R[1] * ROOT_OUT)), add(mul(ff, -R[0] * 0.5), mul(fu, R[2] * ROOT_DOWN)));
    // (the hair gathered into it behind her ear: one with the hair of her head)
    sc.ell(hair, 'head', add(p0, add(mul(fu, R[2] * 0.22), mul(ff, -R[0] * 0.12))), [mul(ff, 1.4), mul(fl, 1.2), mul(fu, 1.6)], 0.6, { tag: 'gather' });
    const p1 = add(s.neck, add(mul(cf, B.ribDeep * 0.9 + 1.5), add(mul(cl, sg * B.shoulderHalf * 0.78), mul(cu, -2.2))));
    // (it comes down behind the ear and round the side of her neck, over the front of her shoulder: a curve, not a rod)
    const pull = add(mid(p0, p1), add(mul(cl, sg * 1.3), add(mul(cf, -0.5), mul(cu, -0.6))));
    // (woven: each crossing a lobe laid slantwise, the next slanting the other way, each a little over the last)
    const N = 6;
    for (let i = 0; i < N; i++) {
      const k = (i + 0.5) / N;
      const c = bez(p0, pull, p1, k);
      const dir = norm(sub(bez(p0, pull, p1, Math.min(1, k + 0.1)), bez(p0, pull, p1, Math.max(0, k - 0.1))));
      const [a1, a2, a3] = frame(dir, cf);
      const sl = (i % 2 === 0 ? 1 : -1) * 34 * D;
      const along = add(mul(a1, Math.cos(sl)), mul(a2, Math.sin(sl)));
      const over = add(mul(a2, Math.cos(sl)), mul(a1, -Math.sin(sl)));
      const wob = (i % 2 === 0 ? 1 : -1) * 0.35;
      const w = 1.3 - 0.06 * i;
      sc.ell(hair, `braid${sg}`, add(c, mul(a2, wob)), [mul(along, 1.15), mul(over, w), mul(a3, w * 0.92)], 0.25, { tag: 'plait' });
    }
    tailsAt.push({ id: sg < 0 ? 'm-braid-a' : 'm-braid-b', p: add(p1, [0, 0, -0.6]) });
  }

  // ---- THE HAT: a wide brim of soft felt, tipped from the eye; a tall cone whose tip has fallen over backward, creased where
  // it bends; the band of light round its foot. The tip is left behind a little by movement and nods in the wind ----
  {
    const U = tippedFrom(st0, fu, BRIM_TIP);
    const Fh = norm(sub(ff, mul(U, dot(ff, U))), ff);
    const Lh = cross(U, Fh);
    const C0 = add(HC, mul(fu, R[2] * 1.08));
    brimAt.c = C0;
    brimAt.u = U;
    const wide = MU_BRIM * B.tall;
    // the brim: a felt plate, its edge a little thicker, drooping a little at the sides
    const SEG = 20;
    const rim0: V3[] = [];
    const rim1: V3[] = [];
    for (let i = 0; i < SEG; i++) {
      const a = (i / SEG) * Math.PI * 2;
      const dir = add(mul(Fh, Math.cos(a)), mul(Lh, Math.sin(a)));
      const droop = -0.7 * Math.abs(Math.sin(a)) - 0.25 * Math.sin(a * 3 + 0.5);
      rim0.push(add(C0, mul(dir, R[0] * 1.25)));
      rim1.push(add(add(C0, mul(dir, wide)), mul(U, droop)));
    }
    for (let i = 0; i < SEG; i++) {
      const j = (i + 1) % SEG;
      sc.tri(hatM, 'hat', rim0[i], rim1[i], rim1[j], 0.45, 0.5, { tag: 'brim' });
      sc.tri(hatM, 'hat', rim0[i], rim1[j], rim0[j], 0.45, 0.5, { tag: 'brim' });
      sc.cone(hatM, 'hat', rim1[i], rim1[j], 0.62, 0.62, 0.4, { tag: 'brimEdge' });
    }
    sc.ell(hatM, 'hat', C0, [mul(Fh, R[0] * 1.3), mul(Lh, R[1] * 1.45), mul(U, 0.7)], 0.6, { tag: 'brim' });
    // the cone: up from the brim, its tip fallen over backward and a little to her left; left behind and nodding
    const nod = add(add(mul(lagC, 0.5), mul(Lh, Math.sin(wind * Math.PI * 2) * 0.4)), mul(Fh, -gale * 2.2));
    const base = add(C0, mul(U, 0.5));
    const bendAt = add(add(C0, mul(U, MU_POINT * 0.66)), add(mul(Fh, -MU_BENT * 0.18), mul(nod, 0.4)));
    const tip = add(add(C0, add(mul(U, MU_POINT * 0.8), add(mul(Fh, -MU_BENT * 1.3), mul(Lh, 0.8)))), nod);
    const N = 9;
    let last = base;
    let lastR = R[1] * 1.28;
    for (let i = 1; i <= N; i++) {
      const k = i / N;
      // (up to the bend nearly straight, tapering; past it, falling over)
      const p = k <= 0.7 ? lerp3(base, bendAt, k / 0.7) : bez(bendAt, add(bendAt, mul(U, 1.6)), tip, (k - 0.7) / 0.3);
      const r = Math.max(0.35, R[1] * 1.28 * (1 - k) ** 0.9 + 0.3);
      sc.cone(hatM, 'hat', last, p, lastR, r, 1.2, { tag: k > 0.62 && k < 0.82 ? 'crease' : 'cone' });
      last = p;
      lastR = r;
    }
    // the band of light round its foot
    sc.ell(hatM, 'hat', add(base, mul(U, 0.5)), [mul(Fh, R[0] * 1.24), mul(Lh, R[1] * 1.36), mul(U, 0.55)], 0.2, { tag: 'band' });
  }

  // ---- HER STAFF, in her right hand: a pole of indigo wood, wrapped in leather where she holds it; at its head a cross-bar of
  // steel curving up into two horns (the crescent of her first sketch) that cradle a long cut crystal ----
  const p3 = s.point;
  const side3 = norm(cross(p3, eye), s.across);
  const foot = add(s.handR, mul(p3, -STAFF_DOWN));
  const tip3 = add(s.handR, mul(p3, STAFF_UP));
  const bar = add(tip3, mul(p3, -5.4));
  sc.cone(wood, 'staff', foot, bar, 0.95, 1.12, 0.4, { tag: 'pole' });
  // (a knot in the wood here and there, and the leather wrap round her grip)
  for (const k of [0.22, 0.61]) sc.ell(wood, 'staff', lerp3(foot, bar, k), [mul(p3, 0.9), mul(side3, 1.35), mul(norm(cross(p3, side3)), 1.35)], 0.4, { tag: 'knot' });
  sc.cone(wood, 'staff', add(s.handR, mul(p3, -3.2)), add(s.handR, mul(p3, 3.2)), 1.25, 1.25, 0.2, { tag: 'wrap' });
  {
    const out3 = norm(cross(p3, side3));
    // the cross-bar, and its horns curving up round the crystal
    for (const sg of [1, -1]) {
      let lastP = bar;
      const N = 5;
      for (let i = 1; i <= N; i++) {
        const k = i / N;
        const a = k * 1.25;
        const pt = add(bar, add(mul(side3, sg * 3.3 * Math.sin(a)), mul(p3, 3.3 * (1 - Math.cos(a)) * 1.3)));
        sc.cone(silver, 'staffhead', lastP, pt, 0.85 - 0.35 * (k - 1 / N), 0.85 - 0.35 * k, 0.4, { tag: k > 0.6 ? 'horn' : 'bar' });
        lastP = pt;
      }
    }
    sc.ell(silver, 'staffhead', bar, [mul(p3, 1.0), mul(side3, 1.5), mul(out3, 1.3)], 0.4, { tag: 'bar' });
  }

  // ---- what is drawn of the old kind: her crystal and its light; what she holds when left standing; the ring the staff throws ----
  const lights: Light[] = [];
  let tails: TailRoot[] = [];
  let charge = { x: 0, y: 0, heat: 0 };
  const extras = (raw: Stage): void => {
    const st = turnedStage(raw, spin);
    // HER CRYSTAL: a long stone, cut, held in the horns, as near the eye as the staff's head is; it swells and whitens as it
    // burns. Its facets: the lit one nearly white, the far one her cyan, a ridge of white down it, its edge a dark cyan line.
    // (the crystal is the first part drawn here, stuff 1000 in the drawing)
    const gem3 = add(tip3, mul(p3, 1.2));
    const [tx, ty] = st.at(gem3);
    const seen3 = st.seen(p3);
    const ul = Math.hypot(seen3[0], seen3[1]) || 1;
    const ux = seen3[0] / ul;
    const uy = seen3[1] / ul;
    const burn = Math.max(1 + q.draw, gale > 0.6 ? 3 : 1);
    const gem = st.part(st.near(gem3) + 0.6);
    const half = 2.3 + 0.4 * Math.min(2, burn - 1);
    // (as long as the stone is, seen: a crystal that points at the eye is seen from its point, short, and hides no more of the
    // pole than it should)
    const long = (14.5 + 1.2 * Math.min(2, burn - 1)) * Math.max(0.4, Math.min(1, ul));
    const z = st.near(gem3) + 0.6;
    // (a hexagonal stone: pointed at the top, a shorter point at its foot; `b` along it from its middle, `a` across)
    const inside = (a: number, b: number, grow = 0): boolean => {
      const top = long * 0.62 + grow;
      const low = -long * 0.38 - grow;
      if (b > top || b < low) return false;
      const w = half + grow;
      const cap = b > long * 0.18 ? w * (top - b) / (top - long * 0.18) : b < -long * 0.18 ? w * (b - low) / (-long * 0.18 - low) : w;
      return Math.abs(a) <= cap;
    };
    const hot = burn >= 2.6;
    for (let y = Math.floor(ty - long - 3); y <= Math.ceil(ty + long + 3); y++) {
      for (let x = Math.floor(tx - long - 3); x <= Math.ceil(tx + long + 3); x++) {
        const dx = x + 0.5 - tx;
        const dy = y + 0.5 - ty;
        const a = -dx * uy + dy * ux;
        const b = dx * ux + dy * uy;
        if (!inside(a, b, 0.9)) continue;
        // (its edge: a dark cyan line round it, so it reads as a stone, not a blot of light)
        if (!inside(a, b)) {
          gem.put(x, y, hot ? CYAN[2] : CYAN[0], z);
          continue;
        }
        // (which facet: the light comes from the upper left)
        const litSide = a * (ux < 0 ? 1 : -1) * Math.sign(uy || 1) < 0;
        let c: string;
        if (Math.abs(a) < 0.55) c = '#ffffff';
        else if (b > long * 0.18) c = litSide ? '#ffffff' : SPARK[3];
        else if (b < -long * 0.18) c = litSide ? SPARK[2] : CYAN[0];
        else c = litSide ? SPARK[3] : SPARK[2];
        if (hot && c !== CYAN[0]) c = Math.abs(a) < half * 0.6 ? '#ffffff' : SPARK[3];
        gem.put(x, y, c, z);
      }
    }
    if (burn >= 1.5) {
      const rays = Math.max(1, Math.min(6, Math.round((burn - 1) * 3)));
      for (let k = 2; k <= rays + 4; k++) {
        const c = k <= rays ? '#ffffff' : SPARK[2];
        for (const [rx, ry] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
          const far = (rx !== 0 ? 3 : 9) + k;
          if (k > rays + (rx !== 0 ? 2 : 0)) continue;
          st.over.set(Math.round(tx - 0.5 + rx * far), Math.round(ty - 0.5 + ry * far), c);
        }
      }
    }
    const heat = Math.max(0, burn - 1);
    if (WILD.on) {
      const k = Math.max(0, Math.min(1, (heat - 1.2) / 1.8));
      const sm = k * k * (3 - 2 * k);
      lights.push({ x: tx, y: ty, r: 24 + 24 * sm + 3 * hash(Math.round(tx), Math.round(ty), Math.round(heat * 40)), color: SPARK[3], a: 0.44 + 0.28 * sm });
    } else lights.push({ x: tx, y: ty, r: 21 + Math.min(2, heat) * 6.5, color: SPARK[3], a: 0.38 + Math.min(2, heat) * 0.185 });
    charge = { x: tx, y: ty, heat };
    // the staff brought down on the floor (prop 5; `pt` 1 in the frame it strikes, 0 when the ring has gone)
    if (q.prop === 5 && q.pt > 0.02) {
      const k = Math.min(1, q.pt);
      const r = 4.5 + (1 - k) * 15;
      for (let i = 0; i < 30; i++) {
        if (k < 0.6 && i % 2 === 0) continue;
        const a = (i / 30) * Math.PI * 2;
        const [x, y] = st.at([foot[0] + Math.cos(a) * r, foot[1] + Math.sin(a) * r, 0]);
        st.over.set(Math.round(x), Math.round(y), k > 0.5 ? '#ffffff' : SPARK[3]);
        if (k > 0.75) st.over.set(Math.round(x), Math.round(y) - 1, SPARK[3]);
      }
      const [fx, fy] = st.at([foot[0], foot[1], 0]);
      lights.push({ x: fx, y: fy, r: 12 + (1 - k) * 8, color: SPARK[3], a: 0.55 * k });
    }
    // what she does when left standing: a mage light over her open hand (prop 1), or a book (prop 2)
    if (q.prop === 1) {
      const [lx, ly] = st.at(s.handL);
      mageLight(st.over, lx, ly, q.pt, lights);
    }
    if (q.prop === 2) {
      const [lx, ly] = st.at(s.handL);
      const layer = st.part(st.near(s.handL) + 2.5);
      if (s.handL[2] < s.waist[2] + 2) bookShut(layer, lx, ly - 1);
      else book(layer, st.over, lx + 1, ly - 2, q.pt > 0.12 && q.pt < 0.88 ? ((q.pt - 0.12) / 0.76) % 1 : 0, lights);
    }
    // her braids: where the game hangs the rest of each ('a' always the one over her right shoulder)
    tails = tailsAt.map((t) => {
      const [x, y] = st.at(t.p);
      // (hung over her where its root is in front of her chest, as seen; behind her otherwise)
      return { id: t.id, x, y, over: st.near(t.p) > st.near(s.ribs) + 0.8, blast: gale > 0.02 ? gale * 1.4 : 0 };
    });
  };
  const drawn = draw(sc, view, ax, CANVAS3.ay, CANVAS3, extras, rim);
  return { px: drawn.px, lights, tails, charge, drawn, sc, s, spin, ax, ay: CANVAS3.ay, staffMats: [wood, silver], seen: { hemZ, cuffZ } };
}
