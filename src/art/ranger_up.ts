// THE RANGER BROUGHT UP TO THE BRAWLER'S LEVEL (the art chat's helper, 6 Nov 2026; docs/mockups/ranger_up/README.md).
// A MOCK-UP BEHIND A SWITCH THAT IS OFF: `RANGER_UP`. Nothing of the game imports this file: the game's Ranger is exactly as
// he is (art/hero3_ranger.ts, his moves in art/moves3.ts).
//
// The owner, 6 Nov 2026, asked whether to bring the other heroes up to the Brawler's smoothness: “Like is yes I’d like
// everything brought up to the same 30 drawings a second for all the character models, but I’d also like the first three
// Warrior Ranger and mage updated to the level of the brawler in terms of the rules that we have set for the rest of the
// drawings I don’t want them to lose the aesthetic or the flavor that they currently have but I think like the shapes rule the
// action rule we kind of want all that updated to a certain level certain benchmark as the rest of the characters so that
// they’re all at the same level.”
// And before this one, 6 Nov 19:21: “Can you show me the ranger redone before you go too crazy with the drawings?”; then
// “Just a still of him”. So this is the first step: HIS LOOK, sculpted, shown in one still of his stance.
//
// THE SAME SCOUT, BETTER DRAWN: the Feather-cap Scout he picked (a wide soft teal cap with a long glowing feather in it, his
// face bare under it with a brown moustache, as he asked on 7 Oct: “10 for ranger but a brown mustache”; a pink neckerchief; a
// green jerkin laced up the front, its skirt cut into points; green sleeves, leather bracers and gloves; dark hose and tall
// soft boots with turned cuffs; a short teal cloak down his back; a quiver of glowing fletchings over it; his long indigo bow,
// its string the friend's cyan), on his own lean body (moves3.ts RANGER_BODY, its knee joint raised a little: ranger_up_moves.ts
// RU_BODY), in his own colours. What changes is how he is
// drawn: SCULPTED as the Warrior brought up and the Veteran are (dev/sculpt.ts: each solid melted into the next of its stuff,
// one body with a real outline, inked only where one stuff meets another or one part passes in front of another), in place of
// the old painter's balls and rods each on a sheet of its own and ringed in ink (art/hero3_ranger.ts).
//
// The feather in his cap is still the game's own (engine/tails.ts): each frame says where its quill is stuck in the cap and the
// game hangs and moves it, so it follows everything he does, in the world.
//
// HIS FIVE SIDES are the Warrior's (art/warrior_up.ts WuSide, WU_SPIN): in front and from behind as the game has always had a
// hero, side-on, toward the camera and away from it; mirrored, his eight facings (art/warrior_up_art.ts wuFacing).

import type { Light } from '../engine/px';
import type { TailRoot } from '../engine/tails';
import { BROWN, CYAN, INDIGO, INK, LEAF, MAIL, PINK, PLUM, SKIN4, TEAL, hash } from './kit';
import type { Painted, Ramp } from './kit';
import { ruOnBack } from './ranger_up_moves';
import { ARROW_LONG, BOW_BRACE, BOW_HALF, WILD } from './moves3';
import { SQ_BUNCH, SQ_FLICK, SQ_RUN, SQ_SIT, squirrel } from './hero_ranger';
import { squirrelOn } from './hero3_ranger';
import { P } from './palette';
import { CANVAS3, eyesToward, girdle, mid, stage } from './skin';
import type { Stage } from './skin';
import { add, cross, dot, heading, len, lerp3, mul, norm, sub, trunkOf } from './skeleton';
import type { Build, Posed, Skeleton, V3 } from './skeleton';
import { Sculpt, draw } from '../dev/sculpt';
import type { Drawn } from '../dev/sculpt';
import { WU_RIM, WU_SIDES, WU_SPIN, five, frame, turnedStage } from './warrior_up';
import type { WuSide } from './warrior_up';

/**
 * THE SWITCH: ON. Handed to the main chat with his yes (the art chat's post of 7 Nov 2026, 11:16: his legs mended, shown him,
 * “Yes thank you better”), switched on by the main chat at his word to it, 7 Nov, 11:27: “Ranger is sent to you”.
 */
export const RANGER_UP = { on: true };

/** His sides: the Warrior's five (art/warrior_up.ts). */
export type RuSide = WuSide;
export const RU_SIDES = WU_SIDES;

// ---------------------------------------------------------------------------------------------
// His colours: his own three tones of each (kit.ts, as art/hero3_ranger.ts paints him), with a tone between each two, so the
// sculpted surfaces turn smoothly in the light; his darkest and lightest exactly his.

export const RU_LEAF: Ramp = five(LEAF);
export const RU_TEAL: Ramp = five(TEAL);
export const RU_PLUM: Ramp = five(PLUM);
export const RU_HOSE: Ramp = five(MAIL);
export const RU_PINK: Ramp = five(PINK);
export const RU_BROWN: Ramp = five(BROWN);
export const RU_WOOD: Ramp = five(INDIGO);
export const RU_SKIN: Ramp = five([SKIN4[0], SKIN4[1], SKIN4[2], SKIN4[3], SKIN4[3]]);
/** His gloves and belt: his leather a step darker (the old painter's `dim(PLUM)`). */
export const RU_GLOVE: Ramp = [PLUM[0], PLUM[0], RU_PLUM[1], PLUM[2], RU_PLUM[3]];

const D = Math.PI / 180;
const FLOOR = { n: [0, 0, -1] as V3, o: 0 };
const FRAME = 1 / 30;
/** How far back his cap is pushed on his head (degrees), and how high it sits (a share of his head's half-height above its middle). */
const CAP_TIP = 16;
const CAP_COCK = 12;
const CAP_UP = 0.66;
/** His head: how much bigger than the build's, and how far up his neck it is set. */
const HEAD_K = 1.1;
const HEAD_UP = 0.6;
/** How high on the back of his head his cap's back edge sits (a length of him above the middle of his head, at its back). */
const CAP_NAPE = 2.4;

/** What a frame is painted in the light of. */
export interface RuAround {
  /** The figure a frame earlier, and a few frames earlier (cloth follows a few frames behind). */
  prev?: Skeleton | null;
  past?: Skeleton | null;
  /** Where the wind has got to, 0..1. */
  wind?: number;
  /** At a release (Movement 9): him the frame before, whose string and arrow are left as the after-image. */
  ghost?: { q: Posed; s: Skeleton };
}

/** What a sculpted frame of him is, for the checks: the drawing, and the solids by part. */
export interface RuFrame extends Painted {
  drawn: Drawn;
  sc: Sculpt;
  s: Skeleton;
  spin: number;
  /** Where on his canvas the floor point under him is (WU_SPIN's `ax`: 98 for the three sides that face left), and its height. */
  ax: number;
  ay: number;
  /** The material his bow's limbs are (in `drawn.stuff`); its string and the arrow on it are stuff 1000, the first part drawn
   * beside the sculpture. */
  bowMat: number;
}

/** `v` made square to the unit `w` (the way the foot points, square to the shin). */
const squareTo = (v: V3, w: V3): V3 => norm(sub(v, mul(w, dot(v, w))), [1, 0, 0]);
/** A point on a quadratic curve from `a` through the pull of `c` to `b`. */
const bez = (a: V3, c: V3, b: V3, k: number): V3 => add(add(mul(a, (1 - k) * (1 - k)), mul(c, 2 * k * (1 - k))), mul(b, k * k));

/**
 * HIM, SCULPTED, at a pose (`s` solved from `q` on his build), seen from one of his sides. Returns the painting, its lights and
 * where the feather's quill is stuck in his cap (the game moves the feather).
 */
export function paintRangerUp(s: Skeleton, q: Posed, side: RuSide, B: Build, around: RuAround = {}, rim: string | null = WU_RIM): RuFrame {
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
  const [aS, aE, aW] = B.armR;
  const [lH, lK, lA] = B.legR;

  // ---- materials ----
  const hose = sc.mat({ ramp: RU_HOSE, crease: 0.3, paint: (h) => dim(h, h.p, RU_HOSE) });
  const boot = sc.mat({ ramp: RU_PLUM, crease: 0.4, paint: (h) => {
    const tg = h.prim.tag ?? '';
    const t = farOf(h.p) ? h.tone - 1 : h.tone;
    // (the turned cuff: the boot's leather turned inside out, a tone lighter, its fold lit along the top)
    if (tg === 'cuff') return RU_PLUM[Math.max(1, Math.min(4, t + 1))];
    // (soft leather: a crease here and there across the shaft where it wrinkles at the ankle)
    if (tg === 'shaft' && hash(h.x, Math.floor(h.y / 3), 5) < 0.12) return RU_PLUM[Math.max(0, t - 1)];
    return RU_PLUM[Math.max(0, Math.min(4, t))];
  } });
  // (the strap of the quiver across his chest, from his right shoulder to his left hip, painted where it lies on him)
  const strapA = add(ribs.c, add(mul(cf, ribs.h[0] * 0.55), add(mul(cl, -B.shoulderHalf * 0.62), mul(cu, ribs.h[2] * 0.95))));
  const strapB = add(pel.c, add(mul(hf, pel.h[0] * 0.95), add(mul(hl, pel.h[1] * 0.8), mul(hu, pel.h[2] * 0.5))));
  const strapD = norm(sub(strapB, strapA));
  const strapN = norm(cross(strapD, cf), cl);
  const strapL = len(sub(strapB, strapA));
  /** How far across the strap a point of his front is (NaN off it): -1 its lower edge to 1 its upper. */
  const onStrap = (p: V3): number => {
    const v = sub(p, strapA);
    const along = dot(v, strapD);
    if (along < -0.6 || along > strapL + 0.6) return NaN;
    if (dot(sub(p, ribs.c), cf) < -0.4 && dot(sub(p, pel.c), hf) < -0.4) return NaN;
    const k = dot(v, strapN) / 1.15;
    return Math.abs(k) <= 1 ? k : NaN;
  };
  const leaf = sc.mat({ ramp: RU_LEAF, crease: 0.36, paint: (h) => {
    const tg = h.prim.tag ?? '';
    const t = farOf(h.p) ? h.tone - 1 : h.tone;
    if (tg === 'ribs' || tg === 'belly' || tg === 'pelvis' || tg === 'chest') {
      const k = onStrap(h.p);
      if (k === k) return k > 0.45 ? RU_PLUM[Math.min(4, Math.max(2, t + 1))] : k < -0.55 ? RU_PLUM[0] : RU_PLUM[Math.max(1, Math.min(3, t))];
      // (the jerkin laced up the front: a dark seam down the middle of him and the laces across it)
      const v = sub(h.p, ribs.c);
      const across = dot(v, cl);
      const fwd = dot(v, cf);
      const up = dot(v, cu);
      if (fwd > 0 && up > -ribs.h[2] * 1.6 && up < ribs.h[2] * 0.9) {
        if (Math.abs(across) < 0.38) return RU_LEAF[0];
        if (Math.abs(across) < 1.25 && ((Math.floor((up + 40) / 1.9) % 2 === 0 && Math.abs(across) > 0.3))) return RU_GLOVE[2];
      }
    }
    // (the skirt, below the belt, hangs a tone darker than the chest; its leaf-cut points darker again at their tips)
    if (tg === 'point') return RU_LEAF[Math.max(0, Math.min(3, t - 1))];
    if (tg === 'panel' || tg === 'skirt') return RU_LEAF[Math.max(0, Math.min(3, t - 1))];
    // (his jerkin as bright as it always was: its lit side a step lighter, so the lime of it reads)
    return RU_LEAF[Math.max(0, Math.min(4, t >= 2 ? t + 1 : t))];
  } });
  const glove = sc.mat({ ramp: RU_GLOVE, crease: 0.35, paint: (h) => dim(h, h.p, RU_GLOVE) });
  const bracer = sc.mat({ ramp: RU_PLUM, crease: 0.35, paint: (h) => {
    const t = farOf(h.p) ? h.tone - 1 : h.tone;
    // (laced up the inside: a few dark stitches across)
    if (h.prim.tag === 'bracer' && hash(h.x, h.y, 11) < 0.1) return RU_PLUM[Math.max(0, t - 2)];
    return RU_PLUM[Math.max(0, Math.min(4, t))];
  } });
  // (the neckerchief bright, as his always was: the warm thing under his face)
  const pink = sc.mat({ ramp: RU_PINK, crease: 0.4, paint: (h) => RU_PINK[Math.min(4, Math.max(1, h.tone + 1))] });
  // (THE CLOAK: its outside teal, its lining, seen where it turns from him, a tone darker)
  const spineA = s.neck;
  const spineB = s.pelvis;
  const spineD = norm(sub(spineA, spineB));
  const outFromSpine = (p: V3): V3 => {
    const v = sub(p, spineB);
    return sub(v, mul(spineD, dot(v, spineD)));
  };
  const hoodAt: { c: V3; f: V3; l: V3; u: V3 } = { c: [0, 0, 0], f: [1, 0, 0], l: [0, 1, 0], u: [0, 0, 1] };
  const capAt: { n: V3 | null; o: number } = { n: null, o: 0 };
  /** How far a point of the cloak stands out in its fold (-1 the deepest hollow, 1 the highest ridge), set as the cloak is laid. */
  let cloakFold: (p: V3) => number = () => 0;
  const teal = sc.mat({ ramp: RU_TEAL, crease: 0.42, paint: (h) => {
    const tg = h.prim.tag ?? '';
    const t = farOf(h.p) ? h.tone - 1 : h.tone;
    if (tg === 'cloak' && dot(h.n, outFromSpine(h.p)) < 0) return RU_TEAL[Math.max(0, Math.min(2, t - 1))];
    // (its folds read as folds whatever the light: the hollow of each a tone darker, the ridge of each, where the light is on
    // it, a tone lighter; strongest at the hem, where they are deepest, gathered to nothing at his shoulders)
    if (tg === 'cloak') {
      const k = cloakFold(h.p);
      if (k < -0.32) return RU_TEAL[Math.max(0, Math.min(3, t - 1))];
      if (k > 0.55 && t >= 2) return RU_TEAL[Math.min(4, t + 1)];
      return RU_TEAL[Math.max(0, Math.min(4, t))];
    }
    // (the back edge of his cap, where it sits on his head above his hair: a dark line)
    if (h.prim.piece === 'cap' && capAt.n && dot(h.p, capAt.n) > capAt.o - 0.7) return RU_TEAL[1];
    // (his hood: a tone lighter than the cloak it lies on, so it stands off it)
    if (tg === 'hoodPoint') return RU_TEAL[Math.max(1, Math.min(4, t + 1))];
    // (the hood's open mouth, round his neck: dark inside, its lip lit)
    if (tg === 'hood') {
      const v = sub(h.p, hoodAt.c);
      const up = dot(v, hoodAt.u) / 2.8;
      const fw = dot(v, hoodAt.f) / 2.5;
      if (up > 0.3 && fw > -0.6) return up > 0.72 ? RU_TEAL[Math.min(4, t + 1)] : RU_TEAL[0];
      return RU_TEAL[Math.max(1, Math.min(4, t + 1))];
    }
    if (tg === 'band') return RU_TEAL[Math.max(0, Math.min(2, t - 1))];
    // (his cap as bright a teal as it always was: lifted a step where the light is on it)
    if (h.prim.piece === 'cap') return RU_TEAL[Math.max(0, Math.min(4, t >= 2 ? t + 1 : t))];
    return RU_TEAL[Math.max(0, Math.min(4, t))];
  } });
  // (HIS FACE lifted a tone, as a hero's face is, so that it reads at the game's size though it is turned from the light)
  const skin = sc.mat({ ramp: RU_SKIN, crease: 0.18, paint: (h) => (h.prim.piece === 'head' ? RU_SKIN[Math.min(4, Math.max(1, h.tone + 1))] : null) });
  const hair = sc.mat({ ramp: RU_BROWN, meld: true, paint: (h) => {
    const tg = h.prim.tag ?? '';
    // (his moustache reads at a glance: lifted a tone, its lower edge dark, a hair darker here and there)
    if (tg === 'tash') return (h.x + Math.floor(h.y / 2)) % 4 === 0 ? RU_BROWN[Math.max(1, h.tone)] : RU_BROWN[Math.max(2, Math.min(4, h.tone + 1))];
    if (tg === 'brow') return RU_BROWN[Math.max(0, h.tone - 1)];
    return null;
  } });
  const wood = sc.mat({ ramp: RU_WOOD, crease: 0.3, paint: (h) => {
    const t = h.tone;
    // (the grain of the wood: a lit line along each limb)
    if (h.prim.tag === 'nock') return RU_TEAL[Math.min(4, t + 1)];
    return RU_WOOD[Math.max(0, Math.min(4, t))];
  } });
  // (the quiver: stitched leather, a darker seam running down it, its rim rolled and lit)
  const quivAt: { a: V3; b: V3 } = { a: [0, 0, 0], b: [0, 0, 1] };
  const quiv = sc.mat({ ramp: RU_PLUM, crease: 0.4, paint: (h) => {
    if (h.prim.tag === 'rim') return RU_PLUM[Math.min(4, h.tone + 1)];
    const ax0 = sub(quivAt.b, quivAt.a);
    const k = dot(sub(h.p, quivAt.a), ax0) / (dot(ax0, ax0) || 1);
    // (two stitched bands round it)
    if (Math.abs(k - 0.33) < 0.035 || Math.abs(k - 0.7) < 0.035) return RU_PLUM[Math.max(0, h.tone - 2)];
    return farOf(h.p) ? RU_PLUM[Math.max(0, h.tone - 1)] : null;
  } });
  // (the arrows in it: light wood, as the game's flying arrow; their fletchings glow the friend's cyan, as his always did)
  const shaftM = sc.mat({ ramp: ['#5a3a20', '#7a5230', '#a06c3c', '#c08a55', '#dcae7a'] });
  const fletch = sc.mat({ ramp: [CYAN[0], CYAN[0], CYAN[2], CYAN[3], CYAN[4]], crease: 0.2 });

  // ---- THE LEGS: dark hose; tall soft boots with a turned cuff below the knee ----
  for (const sd of ['L', 'R'] as const) {
    const hip = sd === 'L' ? s.hipL : s.hipR;
    const knee = sd === 'L' ? s.kneeL : s.kneeR;
    const ankle = sd === 'L' ? s.ankleL : s.ankleR;
    const heel = sd === 'L' ? s.heelL : s.heelR;
    const toe = sd === 'L' ? s.toeL : s.toeR;
    const leg = `leg${sd}`;
    const td = norm(sub(knee, hip));
    const tf = squareTo(sub(toe, heel), td);
    sc.cone(hose, leg, hip, knee, lH + 0.05, lK + 0.15, 1.4, { tag: 'thigh' });
    // (the great muscle of the thigh, a lean archer's)
    sc.ell(hose, leg, add(lerp3(hip, knee, 0.4), mul(tf, 0.6)), [mul(td, B.thigh * 0.3), mul(tf, lH * 0.66), mul(norm(cross(td, tf)), lH * 0.74)], 1.2, { tag: 'quad' });
    const sd2 = norm(sub(ankle, knee));
    const sf = squareTo(sub(toe, heel), sd2);
    const top = lerp3(knee, ankle, 0.22);
    sc.cone(hose, `shin${sd}`, knee, top, lK + 0.1, lK, 0.8, { tag: 'shin' });
    // the boot: soft leather from the cuff to the ankle, the calf's swell inside it
    sc.cone(boot, `boot${sd}`, top, ankle, lK + 0.45, lA + 0.6, 1.0, { tag: 'shaft' });
    sc.ell(boot, `boot${sd}`, add(lerp3(top, ankle, 0.3), mul(sf, -0.6)), [mul(sd2, B.shank * 0.2), mul(sf, lK * 0.66), mul(norm(cross(sd2, sf)), lK * 0.74)], 1.0, { tag: 'shaft' });
    // the turned cuff: a fold of the leather round the top, wider than the shaft, its lip out
    const across = norm(cross(sd2, sf));
    sc.ell(boot, `cuff${sd}`, add(top, mul(sd2, 0.5)), [mul(sf, lK + 0.75), mul(across, lK + 0.7), mul(sd2, 1.1)], 0.3, { tag: 'cuff' });
    // the foot: a soft round-toed boot flat on the floor (never in it)
    const fd = norm(sub(toe, heel));
    const fu0 = norm(cross(cross(fd, [0, 0, 1]), fd), [0, 0, 1]);
    const up = dot(fu0, [0, 0, 1]) < 0 ? mul(fu0, -1) : fu0;
    sc.cone(boot, `boot${sd}`, add(heel, mul(up, 1.7)), add(toe, mul(up, 1.3)), 1.95, 1.5, 0.9, { tag: 'foot', cuts: [FLOOR] });
    sc.ell(boot, `boot${sd}`, add(lerp3(heel, toe, 0.35), mul(up, 2.2)), [mul(fd, B.ball * 0.5), mul(norm(cross(up, fd)), 2.0), mul(up, 1.7)], 0.9, { tag: 'foot', cuts: [FLOOR] });
    sc.cone(boot, `boot${sd}`, ankle, add(lerp3(heel, toe, 0.3), mul(up, 1.8)), lA + 0.55, 1.7, 0.9, { tag: 'foot', cuts: [FLOOR] });
  }

  // ---- THE TRUNK: the jerkin, one body: an archer's chest and shoulders drawn in to a lean waist ----
  // (its top cut level a little above the root of his neck, so his chest never rises over his chin: the slope of his
  // shoulders runs up into the neck under the neckerchief)
  const neckCut = [{ n: cu, o: dot(cu, s.neck) + 0.2 }];
  sc.ell(leaf, 'trunk', ribs.c, [mul(ribs.r[0], ribs.h[0] + 0.8), mul(ribs.r[1], ribs.h[1] + 0.8), mul(ribs.r[2], ribs.h[2] + 0.3)], 2.4, { tag: 'ribs', cuts: neckCut });
  // (the breadth of him across the top of the chest, out to the shoulders)
  sc.ell(leaf, 'trunk', add(ribs.c, mul(cu, ribs.h[2] * 0.3)), [mul(cf, ribs.h[0] * 0.9), mul(cl, B.shoulderHalf * 0.9), mul(cu, ribs.h[2] * 0.45)], 2.2, { tag: 'chest', cuts: neckCut });
  for (const sh of [s.shoulderL, s.shoulderR]) sc.cone(leaf, 'trunk', add(s.neck, mul(cu, -0.6)), sh, 2.6, 2.1, 1.6, { tag: 'chest' });
  sc.ell(leaf, 'trunk', belly.c, [mul(belly.r[0], belly.h[0] + 0.8), mul(belly.r[1], belly.h[1] + 0.8), mul(belly.r[2], belly.h[2] * 1.05)], 2.2, { tag: 'belly' });
  sc.ell(leaf, 'trunk', pel.c, [mul(pel.r[0], pel.h[0] + 1.0), mul(pel.r[1], pel.h[1] + 1.0), mul(pel.r[2], pel.h[2] * 0.95)], 2.0, { tag: 'pelvis' });

  // ---- THE SKIRT OF THE JERKIN, to the middle of his thighs, its hem cut into points as it always was: closed at the hips,
  // split below into panels that hang plumb and are pushed out only where a thigh comes against them; left behind by how far
  // his hips have come over the last few frames (it follows) ----
  const waistRing = girdle(pel, 0.55, 1.4);
  const PANELS = [0, 36, 72, 108, 144, 180, -144, -108, -72, -36];
  const hipMid = mid(s.hipL, s.hipR);
  sc.ell(leaf, 'skirt', add(hipMid, mul(hu, -0.6)), [mul(hf, B.pelvisDeep + 1.8), mul(hl, B.pelvisHalf + 1.9), mul(hu, 3.2)], 1.6, { tag: 'skirt' });
  const hem = Math.max(3.5, hipMid[2] - B.thigh * 0.24);
  for (const at of PANELS) {
    const a = at * D;
    const outH = norm(add(mul(hf, Math.cos(a)), mul(hl, Math.sin(a))));
    const outFlat = norm([outH[0], outH[1], 0], [1, 0, 0]);
    const top = add(waistRing.c, add(mul(norm(waistRing.u), Math.cos(a) * len(waistRing.u)), mul(norm(waistRing.v), Math.sin(a) * len(waistRing.v))));
    const base = Math.hypot(len(waistRing.u) * Math.cos(a), len(waistRing.v) * Math.sin(a)) + 0.7;
    let out = base;
    let rest = -Infinity;
    const centre: V3 = [hipMid[0], hipMid[1], 0];
    for (const [hip, knee] of [[s.hipL, s.kneeL], [s.hipR, s.kneeR]] as const) {
      for (const k of [0.2, 0.32, 0.44]) {
        const pt = lerp3(hip, knee, k);
        if (pt[2] < hem - 3) continue;
        const rel: V3 = [pt[0] - centre[0], pt[1] - centre[1], 0];
        const radial = dot(rel, outFlat);
        const acr = Math.abs(dot(rel, [-outFlat[1], outFlat[0], 0]));
        if (acr < 3.2 + lK && radial + lK + 0.9 > out) {
          out = radial + lK + 0.9;
          rest = Math.max(rest, pt[2]);
        }
      }
    }
    // (a panel a thigh has pushed far out rests on the thigh, as cloth does over a knee raised in front: its hem rides up)
    const lowZ = out > base + 2 ? Math.max(hem, rest - lK * 0.3) : hem;
    const flutter = Math.sin((wind + at / 360) * Math.PI * 2) * 0.45;
    let low: V3 = add([centre[0] + outFlat[0] * out, centre[1] + outFlat[1] * out, lowZ], add(lagC, mul(outFlat, flutter)));
    const tilt = Math.max(0, Math.min(1, (1 - Math.max(0, hu[2]) - 0.12) / 0.3));
    if (tilt > 0) {
      const sa = Math.sin(a);
      const knee = Math.abs(sa) < 0.3 ? mid(s.kneeL, s.kneeR) : sa > 0 ? s.kneeL : s.kneeR;
      const hip = Math.abs(sa) < 0.3 ? hipMid : sa > 0 ? s.hipL : s.hipR;
      low = lerp3(low, add(lerp3(hip, knee, 0.75), mul(outH, lK + 1.4)), tilt);
    }
    const lowC: V3 = [low[0], low[1], Math.max(2.2, low[2])];
    const along = sub(lowC, top);
    const L = len(along);
    const [dn, outP, acr] = frame(along, outFlat);
    const w = 2.2;
    sc.box(leaf, 'skirt', lerp3(top, lowC, 0.5), [mul(outP, 0.5), mul(acr, w), mul(dn, L / 2)], 0.45, 1.2, { tag: 'panel' });
    // its point: a leaf-cut point, each a little longer or shorter than the next
    const tip = add(lowC, mul(dn, 1.6 + 0.8 * (((at / 36) % 2 + 2) % 2) + 0.4 * Math.sin((at + wind * 360) * D)));
    sc.tri(leaf, 'skirt', add(lowC, mul(acr, w)), add(lowC, mul(acr, -w)), [tip[0], tip[1], Math.max(0.6, tip[2])], 0.45, 0.8, { tag: 'point' });
  }
  // the belt over the jerkin at his waist, its cyan buckle in front
  const belt = girdle(pel, 0.62, 1.15);
  sc.ell(glove, 'belt', belt.c, [mul(hf, len(belt.u) + 0.9), mul(hl, len(belt.v) + 0.9), mul(hu, 1.15)], 0.4, { tag: 'belt' });
  const buckle = add(belt.c, mul(norm(belt.u), len(belt.u) + 1.9));
  sc.mark(buckle, CYAN[4], 1, 1, 0, 0, 2.5);
  sc.mark(buckle, CYAN[2], 1, 1, 1, 0, 2.5);
  sc.mark(buckle, CYAN[2], 1, 1, 0, 1, 2.5);
  sc.mark(buckle, CYAN[3], 1, 1, 1, 1, 2.5);

  // ---- THE ARMS: green sleeves to the elbow, leather bracers, gloves ----
  for (const sd of ['L', 'R'] as const) {
    const sh = sd === 'L' ? s.shoulderL : s.shoulderR;
    const el = sd === 'L' ? s.elbowL : s.elbowR;
    const hand = sd === 'L' ? s.handL : s.handR;
    const outSide = mul(cl, sd === 'L' ? 1 : -1);
    const arm = `arm${sd}`;
    sc.cone(leaf, arm, sh, el, aS + 0.35, aE + 0.35, 1.2, { tag: 'sleeve' });
    // (the shoulder of the jerkin, rounded over the point of the shoulder, running into the sleeve)
    sc.ell(leaf, arm, add(sh, add(mul(outSide, 0.3), mul(cu, 0.5))), [mul(cf, aS + 0.7), mul(outSide, aS + 0.8), mul(cu, aS + 0.4)], 1.2, { tag: 'sleeve' });
    const fd = norm(sub(hand, el), cf);
    const wrist = lerp3(el, hand, 0.82);
    // the bracer: leather from below the elbow to the wrist, flaring a little at the elbow
    sc.cone(bracer, `fore${sd}`, add(el, mul(fd, 0.9)), wrist, aE + 0.55, aW + 0.5, 0.7, { tag: 'bracer' });
    // the glove: a fist, its cuff
    sc.cone(glove, `hand${sd}`, wrist, add(wrist, mul(fd, 1.2)), aW + 0.6, aW + 0.55, 0.6, { tag: 'cuff' });
    const [ha, hb, hc] = frame(fd, cl);
    sc.ell(glove, `hand${sd}`, add(hand, mul(fd, 0.2)), [mul(ha, aW + 0.65), mul(hb, aW + 0.8), mul(hc, aW + 0.7)], 0.8, { tag: 'fist' });
  }

  // ---- THE NECKERCHIEF: pink, wound round his neck, its point hanging on his chest and its knot at the side ----
  sc.ell(pink, 'kerchief', add(s.neck, add(mul(cf, 0.5), mul(cu, -1.1))), [mul(cf, 3.3), mul(cl, 4.4), mul(cu, 1.7)], 1.2, { tag: 'wrap' });
  {
    const front = add(ribs.c, add(mul(cf, ribs.h[0] + 0.9), mul(cu, ribs.h[2] * 0.62)));
    const a = add(front, add(mul(cl, 3.1), mul(cu, 2.0)));
    const b = add(front, add(mul(cl, -3.1), mul(cu, 2.0)));
    const tip = add(ribs.c, add(mul(cf, ribs.h[0] + 1.2), mul(cu, ribs.h[2] * 0.12)));
    sc.tri(pink, 'kerchief', a, b, add(tip, mul(cl, 0.5)), 0.6, 0.9, { tag: 'point' });
    sc.ell(pink, 'kerchief', add(front, add(mul(cl, -1.9), mul(cu, 1.4))), [mul(cf, 1.0), mul(cl, 1.2), mul(cu, 1.0)], 0.5, { tag: 'knot' });
  }

  // ---- THE CLOAK, REAL CLOTH (the coordinator, 7 Nov 2026: from behind it read as a striped block): one sheet of teal cloth
  // hung from his shoulders (it lies over their tops, his arms coming out from under its front edges) down his back to his hips,
  // falling a little wider than his back (an A, as cloth falls), in FOLDS that are gathered at his shoulders and open out as they
  // fall, each breaking the hem where it ends (a ridge hangs lower, a hollow higher); its lining a tone darker where it turns from
  // him; its hem left behind by how far his hips have come over the last three frames (it follows) and stirred by the wind.
  // Where an elbow is drawn back close behind him it goes round it, as the old cloak did. Over it at the neck, HIS HOOD, down:
  // a cowl of the same cloth heaped behind his neck, its open mouth dark, its point falling between his shoulder blades. ----
  const cloakTop = { z: 0 };
  {
    const f = norm([cf[0], cf[1], 0], [1, 0, 0]);
    const l = norm([cl[0], cl[1], 0], [0, 1, 0]);
    const full = B.shoulderHalf + aS + 0.9;
    let deep = B.ribDeep + 2.2;
    const reach: [number, number] = [full, full];
    for (const el of [s.elbowL, s.elbowR]) {
      const d = sub(el, s.ribs);
      const back = -dot(d, f);
      const sideK = dot(d, l);
      const out = Math.abs(sideK);
      if (back + aE < 0.5) continue;
      const inside = out - aE - 0.8;
      if (inside >= B.shoulderHalf * 0.7) reach[sideK >= 0 ? 0 : 1] = Math.min(reach[sideK >= 0 ? 0 : 1], inside);
      else deep = Math.max(deep, (back + aE + 1.1) / Math.sqrt(Math.max(0.2, 1 - (out / full) ** 2)));
    }
    const fly = 1.0 + Math.sin(wind * Math.PI * 2) * 0.9;
    const lean = (reach[0] - reach[1]) / 2;
    const wide = (reach[0] + reach[1]) / 2;
    /** A point of the cloak: on a ring round `c`, `deg` round from his front (180 straight behind him), `u` deep and `v` wide,
     * along `ff` and `ll` (his chest's own, where it lies on him; level, where it hangs). */
    const ringAt = (c: V3, u: number, v: number, deg: number, ff: V3 = f, ll: V3 = l): V3 => add(c, add(mul(ff, Math.cos(deg * D) * u), mul(ll, Math.sin(deg * D) * v)));
    // (the four rings it hangs through: round the root of his neck on his shoulders and across his shoulder blades, where it
    // lies on him and goes as his chest goes; at his waist and its hem, where it hangs)
    const c0 = add(s.neck, mul(cu, 0.6));
    const c1 = add(lerp3(s.neck, s.ribs, 0.55), mul(l, lean * 0.3));
    cloakTop.z = c0[2];
    const c2 = add(add(mid(s.waist, s.ribs), mul(f, -0.6)), add(mul(l, lean), mul(lagC, 0.4)));
    const c3 = add([s.pelvis[0], s.pelvis[1], Math.max(3, s.pelvis[2] - B.thigh * 0.2)], add(mul(f, -0.8 - fly), add(mul(l, lean), lagC)));
    // (its folds, round it from his left side to his right: how far each stands out at the hem; gathered to nothing at his
    // shoulders, opening out as they fall; four deep folds and the hollows between, none quite the same)
    const COLS = [92, 110, 127, 143, 158, 172, 186, 201, 216, 232, 249, 268];
    const FOLD = [0, 1.0, -0.6, 1.4, -0.45, 0.9, -0.7, 1.3, -0.5, 1.15, -0.25, 0];
    const ROWS = [
      { c: c0, u: B.ribDeep + 1.1, v: B.shoulderHalf * 0.8 + aS + 0.3, k: 0, on: true },
      { c: c1, u: B.ribDeep + 1.7, v: B.shoulderHalf + aS + 0.6, k: 0.3, on: true },
      { c: c2, u: deep, v: wide + 0.3, k: 0.75, on: false },
      { c: c3, u: deep + 0.5, v: wide + 1.3, k: 1.25, on: false },
    ];
    const grid: V3[][] = ROWS.map((r, ri) => COLS.map((deg, ci) => {
      const fold = FOLD[ci] * r.k * 1.5;
      const sway = ri === 3 ? Math.sin((wind + ci / COLS.length) * Math.PI * 2) * 0.4 : 0;
      // (out along the way that point faces from the middle of him, by its fold)
      const p = ringAt(r.c, r.u + fold, r.v + fold * 0.6 + sway, deg, r.on ? cf : f, r.on ? cl : l);
      // (at the hem, a ridge hangs a little lower than a hollow: the hem breaks where each fold ends)
      return ri === 3 ? add(p, [0, 0, -Math.max(0, FOLD[ci]) * 0.9 + Math.max(0, -FOLD[ci]) * 0.5]) : p;
    }));
    cloakFold = (p: V3): number => {
      const v = sub(p, s.pelvis);
      const deg = ((Math.atan2(dot(v, l), dot(v, f)) / D) + 360) % 360;
      // (how far down the cloak: 0 at its top, 1 at its hem)
      const down = Math.max(0, Math.min(1, (c0[2] - p[2]) / Math.max(1, c0[2] - c3[2])));
      let i = 0;
      while (i + 1 < COLS.length - 1 && COLS[i + 1] < deg) i++;
      const k = Math.max(0, Math.min(1, (deg - COLS[i]) / (COLS[i + 1] - COLS[i])));
      const fold = FOLD[i] + (FOLD[i + 1] - FOLD[i]) * k;
      return (fold / 1.4) * Math.min(1, down * 1.6);
    };
    for (let ri = 0; ri + 1 < grid.length; ri++) for (let ci = 0; ci + 1 < COLS.length; ci++) {
      const a = grid[ri][ci];
      const b = grid[ri][ci + 1];
      const c = grid[ri + 1][ci];
      const d = grid[ri + 1][ci + 1];
      sc.tri(teal, 'cloak', a, b, d, 0.42, 0.9, { tag: 'cloak' });
      sc.tri(teal, 'cloak', a, d, c, 0.42, 0.9, { tag: 'cloak' });
    }
    // HIS HOOD, down: heaped behind his neck on the cloak's top, its mouth open upward round his neck (dark inside), its point
    // falling a little way down between his shoulder blades
    const hoodC = add(s.neck, add(mul(cf, -(B.ribDeep + 2.0)), mul(cu, -0.4)));
    sc.ell(teal, 'hood', hoodC, [mul(cf, 2.4), mul(cl, 5.2), mul(cu, 2.6)], 0.6, { tag: 'hood' });
    // (its point: a V of the cloth lying down his back over the cloak, to between his shoulder blades)
    const hp = add(hoodC, add(mul(cf, -1.4), mul(cu, -1.2)));
    sc.tri(teal, 'hood', add(hp, mul(cl, 3.6)), add(hp, mul(cl, -3.6)), add(hp, add(mul(cu, -6.4), mul(cf, -0.9))), 0.55, 0.9, { tag: 'hoodPoint' });
    hoodAt.c = hoodC;
    hoodAt.f = cf;
    hoodAt.l = cl;
    hoodAt.u = cu;
    // ---- THE QUIVER, slung on his back outside the cloak, its mouth above his right shoulder: a tube of stitched leather, a
    // rolled rim at its mouth, a cap at its foot; three arrows in it, their shafts and their fletchings, which glow ----
    const q0 = add(s.ribs, add(mul(cf, -B.ribDeep - 3.6), add(mul(cl, -B.shoulderHalf * 1.1), mul(cu, B.chest - 1.8))));
    const q1 = add(s.ribs, add(mul(cf, -B.ribDeep - 3.6), add(mul(cl, B.shoulderHalf * 0.35), mul(cu, -6.0))));
    sc.cone(quiv, 'quiver', q1, q0, 1.45, 2.1, 0.6, { tag: 'quiver' });
    const qd = norm(sub(q0, q1));
    const qs = norm(cross(qd, cf), cl);
    const qo = norm(cross(qd, qs));
    quivAt.a = q1;
    quivAt.b = q0;
    sc.ell(quiv, 'quiver', q0, [mul(qd, 0.7), mul(qs, 2.45), mul(qo, 2.45)], 0.2, { tag: 'rim' });
    sc.ell(quiv, 'quiver', q1, [mul(qd, 0.6), mul(qs, 1.7), mul(qo, 1.7)], 0.2, { tag: 'rim' });
    // (five arrows fanned in its mouth, their fletchings out over his right shoulder: from behind, the first thing of him seen)
    for (const [k, longer] of [[-1.3, 0.2], [-0.6, 0.9], [0, 0.4], [0.7, 1.1], [1.35, 0]] as const) {
      const base = add(q0, add(mul(qs, k * 0.8), mul(qd, -0.4)));
      const tip = add(base, add(mul(qs, k * 0.9), add(mul(qo, 0.3 * Math.abs(k)), mul(qd, 5.4 + longer))));
      sc.cone(shaftM, 'arrows', base, tip, 0.3, 0.28, 0.1, { tag: 'shaft' });
      // (its fletching: two vanes, each a little blade of feather, from the nock down a little over half the way out)
      const v0 = lerp3(base, tip, 0.42);
      const along = norm(sub(tip, base));
      const flat = norm(cross(along, qo), qs);
      for (const sg of [1, -1]) {
        const side = add(mul(flat, sg * 1.3), mul(qo, sg * 0.4));
        sc.tri(fletch, 'arrows', v0, add(tip, mul(along, -0.2)), add(lerp3(v0, tip, 0.3), side), 0.3, 0.1, { tag: 'vane' });
      }
    }
  }
  // (the hood's mouth: dark where it opens upward round his neck)
  void cloakTop;

  // ---- THE HEAD: his own bare face in the light, a lean jaw, a straight nose, a brown moustache; brown hair behind; the cap
  // over it all. The eyes, the brows and the moustache are drawn where the game has always put a face's middle (two thirds of
  // the way toward whoever looks: skin.ts eyesToward), so both eyes are seen ----
  const [ff, fl, fu] = s.face;
  // (his head a touch bigger than the build's and set a little up on his neck, as a hero's is drawn, so his face reads at the
  // game's size)
  const R: V3 = [B.headR[0] * HEAD_K, B.headR[1] * HEAD_K, B.headR[2] * HEAD_K];
  const HC = add(s.head, mul(fu, HEAD_UP));
  sc.cone(skin, 'neck', s.neck, add(HC, mul(fu, -R[2] * 0.55)), 1.95, 1.85, 1.0, { tag: 'neck' });
  sc.ell(skin, 'head', add(HC, add(mul(ff, -R[0] * 0.1), mul(fu, R[2] * 0.08))), [mul(ff, R[0] * 0.9), mul(fl, R[1] * 0.92), mul(fu, R[2] * 0.8)], 1.2, { tag: 'skull' });
  const eyes = eyesToward(st0, s);
  const midTurn = ((eyes[0] + eyes[1]) / 2) * D;
  const F = norm(add(mul(ff, Math.cos(midTurn)), mul(fl, Math.sin(midTurn))));
  const Lf = norm(cross(fu, F));
  /** A point of his face: `f` forward, `l` to his left, `u` up, each a share of his head's own half-size. */
  const at = (f: number, l: number, u: number): V3 => add(HC, add(mul(F, f * R[0]), add(mul(Lf, l * R[1]), mul(fu, u * R[2]))));
  // (a lean jaw and a straight nose: one skin with the skull)
  sc.box(skin, 'head', at(0.28, 0, -0.44), [mul(F, R[0] * 0.58), mul(Lf, R[1] * 0.7), mul(fu, R[2] * 0.36)], 1.5, 1.6, { tag: 'jaw' });
  sc.cone(skin, 'head', at(0.82, 0, 0.06), at(1.06, 0, -0.18), 0.55, 0.75, 0.7, { tag: 'nose' });
  // brown hair at the back of his head, under the cap
  sc.ell(hair, 'head', add(HC, add(mul(ff, -R[0] * 0.1), mul(fu, R[2] * 0.08))), [mul(ff, R[0] * 0.9 + 0.45), mul(fl, R[1] * 0.92 + 0.45), mul(fu, R[2] * 0.8 + 0.45)], 0.5, { tag: 'hair', cuts: [{ n: F, o: dot(F, HC) - R[0] * 0.2 }] });
  // THE MOUSTACHE, the thing of his face that reads first: brown, full and broad across his lip, its ends drooping past the
  // corners of his mouth; lit along its top, dark along its foot
  sc.ell(hair, 'head', at(1.0, 0, -0.36), [mul(F, 0.85), mul(Lf, R[1] * 0.56), mul(fu, 0.95)], 0.4, { tag: 'tash' });
  for (const k of [1, -1]) sc.cone(hair, 'head', at(0.96, k * 0.36, -0.42), at(0.84, k * 0.7, -0.7), 0.85, 0.6, 0.3, { tag: 'tash' });
  // HIS EYES: dark, two pixels tall, a dark brow over each, on the lit skin under the brim
  for (const k of [1, -1]) {
    const p = at(0.84, k * 0.36, 0.06);
    if (dot(sub(p, HC), eye) <= 0.4) continue;
    sc.mark(p, INK, 1, 2, 0, 0, 4, skin);
    sc.mark(p, RU_BROWN[0], 1, 1, 0, -1, 4, skin);
  }

  // ---- THE CAP: wide and soft, teal; its crown slumped to his right and behind; a darker band round it; the quill of the
  // feather stuck in the band at the back (the game moves the feather). A soft cap slumps: on a head thrown back it stays level
  // and hangs on the back of the head, as cloth does (the owner, 6 Oct 2026, 21:04: "something strange going on with the
  // ranger's hat") ----
  const slump = Math.max(0, Math.min(1, (Math.acos(Math.max(-1, Math.min(1, fu[2]))) / D - 12) / 38));
  const wu0 = norm(add(mul(fu, 1 - 0.65 * slump), [0, 0, 0.65 * slump]), fu);
  const wf0 = norm(sub(ff, mul(wu0, dot(ff, wu0))), ff);
  // (worn pushed back on his head, as a scout wears it, its brim up off his brow so his face is seen)
  const TIP = CAP_TIP * D;
  const wu1 = norm(sub(mul(wu0, Math.cos(TIP)), mul(wf0, Math.sin(TIP))));
  const wf = norm(add(mul(wf0, Math.cos(TIP)), mul(wu0, Math.sin(TIP))));
  const wl1 = cross(wu1, wf);
  // (and cocked a little over to his left, its right side up off his cheek)
  const COCK = CAP_COCK * D;
  const wu = norm(add(mul(wu1, Math.cos(COCK)), mul(wl1, Math.sin(COCK))));
  const wl = cross(wu, wf);
  const capC = add(add(HC, mul(fu, R[2] * (CAP_UP - 0.1 * slump))), mul(wf0, -R[0] * (0.16 + 0.25 * slump)));
  // (its back sits up on the back of his head, above his hair: seen from behind, his brown hair and his neck show under it, not a
  // ball of teal. A cut that leaves the front of the cap as it was)
  const capBack = norm(sub(mul(fu, -1), mul(wf0, 0.25)));
  const capCut = [{ n: capBack, o: dot(capBack, add(HC, mul(fu, CAP_NAPE))) }];
  capAt.n = capBack;
  capAt.o = capCut[0].o;
  // (the cap itself: a wide soft puff of cloth, broader than his head every way, flat on top)
  sc.ell(teal, 'cap', capC, [mul(wf, R[0] * (1.46 - 0.22 * slump)), mul(wl, R[1] * (1.9 - 0.4 * slump)), mul(wu, R[2] * 0.54)], 1.4, { tag: 'crown', cuts: capCut });
  // (its slump: the soft cloth fallen over to his right and a little behind, hanging down past the band)
  sc.ell(teal, 'cap', add(capC, add(mul(wf, -R[0] * 0.55), add(mul(wl, -R[1] * 0.95), mul(wu, -R[2] * 0.18)))), [mul(wf, R[0] * 0.95), mul(wl, R[1] * 0.95), mul(wu, R[2] * 0.58)], 1.8, { tag: 'crown', cuts: capCut });
  // (the band round its foot, where it sits on his head: a tone darker)
  sc.ell(teal, 'cap', add(capC, mul(wu, -R[2] * 0.3)), [mul(wf, R[0] * 1.18), mul(wl, R[1] * 1.42), mul(wu, R[2] * 0.16)], 0.3, { tag: 'band', cuts: capCut });
  const quillAt = add(capC, add(mul(wf, -R[0] * 0.15), add(mul(wl, -R[1] * 0.5), mul(wu, R[2] * 0.5))));

  // ---- THE BOW, in his left hand: two limbs of indigo wood curving back from a leather grip, each tip curled forward
  // (a recurve), light nocks; its string the friend's cyan, to his fingers when it is drawn; the arrow on it ----
  const away = q.stow > 0.5;
  const carried = away ? ruOnBack(s) : { grip: s.handL, point: s.point, across: s.across };
  const grip = carried.grip;
  const p3 = carried.point;
  const ac = carried.across;
  const tipOf = (sgn: 1 | -1): V3 => add(grip, add(mul(ac, sgn * BOW_HALF * (1 - 0.13 * q.draw)), mul(p3, -(BOW_BRACE + 0.05 * B.tall * q.draw))));
  const nocks: V3[] = [];
  for (const sgn of [1, -1] as const) {
    const ctl = add(grip, add(mul(ac, sgn * BOW_HALF * 0.72), mul(p3, 0.6)));
    const t = tipOf(sgn);
    let last: V3 = add(grip, mul(ac, sgn * 1.4));
    const N = 7;
    for (let i = 1; i <= N; i++) {
      const k = i / N;
      const pt = bez(grip, ctl, t, k);
      sc.cone(wood, 'bow', last, pt, 1.35 - 0.62 * ((i - 1) / N), 1.35 - 0.62 * k, 0.6, { tag: 'limb' });
      last = pt;
    }
    // (the recurve: the tip curled forward, toward where the arrow points)
    const curl = add(t, add(mul(ac, sgn * 1.1), mul(p3, 1.5)));
    sc.cone(wood, 'bow', t, curl, 0.73, 0.55, 0.5, { tag: 'limb' });
    sc.ell(wood, 'bow', curl, [mul(ac, 0.6), mul(p3, 0.6), mul(norm(cross(ac, p3)), 0.6)], 0.2, { tag: 'nock' });
    nocks.push(curl);
  }
  // (the grip, wrapped in leather)
  sc.cone(glove, 'bowgrip', add(grip, mul(ac, 2.0)), add(grip, mul(ac, -2.0)), 1.5, 1.5, 0.3, { tag: 'grip' });

  // ---- what is drawn of the old kind: the string and the arrow on it (as the game draws its arrow in flight), the glint at
  // full draw ----
  const lights: Light[] = [];
  const strung = !away && q.draw >= 0.2;
  const extras = (raw: Stage): void => {
    const st = turnedStage(raw, spin);
    // (the string and the arrow: the first part drawn here, stuff 1000 in the drawing: art/ranger_up_review.ts counts them)
    const line = st.part(grip);
    const thread = (a: V3, b: V3, c: string, lift = 0.3, on = line, every = 1): void => {
      const [x0, y0] = st.at(a);
      const [x1, y1] = st.at(b);
      const za = st.near(a) + lift;
      const zb = st.near(b) + lift;
      const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
      for (let i = 0; i <= n; i++) {
        if (every > 1 && i % every === every - 1) continue;
        const k = i / n;
        on.put(Math.round(x0 + (x1 - x0) * k - 0.5), Math.round(y0 + (y1 - y0) * k - 0.5), c, za + (zb - za) * k);
      }
    };
    /**
     * AN ARROW, as the game draws its own in flight (render/render.ts: a shaft of light wood a game pixel thick and a pale steel
     * head), so that the one on his string and the one that flies are the same arrow; its head drawn to a point, two small cyan
     * vanes at its nock as the fletchings in his quiver have. `tone`: its colours (the arrow's own, or an after-image's).
     */
    const arrowAt = (from: V3, to: V3, on = line, tone: { shaft: string; head: string; tip: string; vane: string; vane2: string } = { shaft: P.wd5, head: P.sl5, tip: '#ffffff', vane: CYAN[2], vane2: CYAN[3] }, every = 1): void => {
      const [x0, y0] = st.at(from);
      const [x1, y1] = st.at(to);
      const za = st.near(from) + 0.4;
      const zb = st.near(to) + 0.4;
      const L = Math.hypot(x1 - x0, y1 - y0) || 1;
      const ux = (x1 - x0) / L;
      const uy = (y1 - y0) / L;
      const n = Math.max(1, Math.ceil(L));
      for (let i = 0; i <= n - 3; i++) {
        if (every > 1 && i % every === every - 1) continue;
        const k = i / n;
        const x = Math.round(x0 + (x1 - x0) * k - 1);
        const y = Math.round(y0 + (y1 - y0) * k - 1);
        for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) on.put(x + dx, y + dy, tone.shaft, za + (zb - za) * k);
      }
      for (let i = 0; i < 5; i++) {
        const cx = x1 - ux * (4 - i);
        const cy = y1 - uy * (4 - i);
        const half = i < 2 ? 1.6 : i < 4 ? 1.0 : 0.4;
        for (let w = -half; w <= half + 1e-6; w += 0.5) on.put(Math.round(cx - uy * w - 0.5), Math.round(cy + ux * w - 0.5), i === 4 || Math.abs(w) < 0.5 ? tone.tip : tone.head, zb + 0.1);
      }
      for (const k of [2, 3, 4]) {
        for (const sg of [1, -1]) {
          const cx = x0 + ux * k;
          const cy = y0 + uy * k;
          on.put(Math.round(cx - uy * sg * (1 + (k - 2) * 0.5) - 0.5), Math.round(cy + ux * sg * (1 + (k - 2) * 0.5) - 0.5), k === 4 ? tone.vane2 : tone.vane, za + 0.2);
        }
      }
      return void L;
    };
    if (strung) {
      thread(nocks[0], s.handR, CYAN[3]);
      thread(s.handR, nocks[1], CYAN[3]);
      const point = add(s.handR, mul(p3, ARROW_LONG * B.tall));
      arrowAt(s.handR, point);
      if (WILD.on && q.draw >= 0.85) {
        const PALE = '#e6eef8';
        const [x1, y1] = st.at(point);
        const x = Math.round(x1 - 0.5);
        const y = Math.round(y1 - 0.5);
        const k = Math.min(1, (q.draw - 0.85) / 0.15);
        const ray = 2 + Math.round(4 * k);
        for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) st.over.set(x + i, y + j, i === 0 || j === 0 ? '#ffffff' : PALE);
        for (let d = 2; d <= ray; d++) {
          const c = d <= ray - 2 ? '#ffffff' : PALE;
          st.over.set(x + d, y, c).set(x - d, y, c).set(x, y + d, c).set(x, y - d, c);
        }
        lights.push({ x: x1, y: y1, r: 10 + 8 * k, color: PALE, a: 0.45 + 0.3 * k });
      }
    } else thread(nocks[0], nocks[1], CYAN[3]);
    // THE RELEASE'S AFTER-IMAGE (Movement 9): the string where it was the frame before, drawn back to his cheek, and the arrow
    // where it lay on it and where it was half way to the bow as it went: ghosts of the real string and arrow, in fading tones,
    // broken, under the snapped string; never a bar of their own
    const g = around.ghost;
    if (!away && g && g.q.draw >= 0.5) {
      const ghost = st.part(st.near(grip) - 0.6);
      const gp = g.s.point;
      const gg = g.s.handL;
      const gac = g.s.across;
      const gTip = (sgn: 1 | -1): V3 => add(add(gg, add(mul(gac, sgn * BOW_HALF * (1 - 0.13 * g.q.draw)), mul(gp, -(BOW_BRACE + 0.05 * B.tall * g.q.draw)))), add(mul(gac, sgn * 1.1), mul(gp, 1.5)));
      thread(gTip(1), g.s.handR, CYAN[2], -0.6, ghost, 3);
      thread(g.s.handR, gTip(-1), CYAN[2], -0.6, ghost, 3);
      const long = ARROW_LONG * B.tall;
      const ghostTone = { shaft: '#a06c3c', head: '#9aa2b8', tip: '#c4cad8', vane: CYAN[1], vane2: CYAN[2] };
      const fainter = { shaft: '#6e4a2a', head: '#6e7690', tip: '#9aa2b8', vane: CYAN[0], vane2: CYAN[1] };
      arrowAt(g.s.handR, add(g.s.handR, mul(gp, long)), ghost, fainter, 3);
      arrowAt(add(g.s.handR, mul(gp, long * 0.55)), add(g.s.handR, mul(gp, long * 1.55)), ghost, ghostTone, 4);
    }
    // what he does when left standing: the squirrel on his shoulders (prop 1), or an arrow held before his eye (prop 2)
    if (q.prop === 1) {
      const sq = squirrelOn(s, B, q.pt);
      if (sq) {
        const layer = st.part(st.near(sq.at) + 1.5);
        const [x, y] = st.at(sq.at);
        const rows = sq.doing === 'run' ? (sq.step % 2 === 0 ? SQ_RUN : SQ_BUNCH) : Math.floor(q.pt * 90) % 5 === 1 ? SQ_FLICK : SQ_SIT;
        squirrel(layer, x, y, st.seen(s.chest[0])[0] * sq.looks >= 0 ? 1 : -1, rows);
      }
    }
    if (q.prop === 2) {
      const d = heading(q.pAz, q.pEl);
      const from = add(s.handR, mul(d, -4));
      const to = add(s.handR, mul(d, 13));
      arrowAt(from, to);
      if (q.pt > 0 && q.pt < 1) {
        const [gx, gy] = st.at(lerp3(from, to, q.pt));
        st.over.set(Math.round(gx), Math.round(gy), '#ffffff').set(Math.round(gx) + 1, Math.round(gy), '#ffffff');
        lights.push({ x: gx, y: gy, r: 6, color: CYAN[3], a: 0.5 });
      }
    }
  };
  let tails: TailRoot[] = [];
  const drawn = draw(sc, view, ax, CANVAS3.ay, CANVAS3, (raw) => {
    extras(raw);
    const st = turnedStage(raw, spin);
    const [qx, qy] = st.at(quillAt);
    tails = [{ id: 'r-feather', x: qx, y: qy, over: true }];
  }, rim);
  return { px: drawn.px, lights, tails, drawn, sc, s, spin, ax, ay: CANVAS3.ay, bowMat: wood };
}

