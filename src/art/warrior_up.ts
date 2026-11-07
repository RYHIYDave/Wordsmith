// THE WARRIOR BROUGHT UP TO THE BRAWLER'S LEVEL (the art chat's helper, 6 Nov 2026; docs/mockups/warrior_up/README.md).
// A MOCK-UP BEHIND A SWITCH THAT IS OFF: `WARRIOR_UP`. With it off, art/heroes3.ts paints the knight exactly as before (every
// frame the same, by hash: tests/warrior_up.test.ts); nothing of the game reaches this file but through that switch.
//
// The owner, 6 Nov 2026, asked whether to bring the other heroes up to the Brawler's smoothness: “Like is yes I’d like
// everything brought up to the same 30 drawings a second for all the character models, but I’d also like the first three
// Warrior Ranger and mage updated to the level of the brawler in terms of the rules that we have set for the rest of the
// drawings I don’t want them to lose the aesthetic or the flavor that they currently have but I think like the shapes rule the
// action rule we kind of want all that updated to a certain level certain benchmark as the rest of the characters so that
// they’re all at the same level.”
//
// THE SAME MAN, BETTER DRAWN: the Scarf Knight he picked (his pig-faced helm, a round steel skull with its snouted visor, a mail coif, a
// red tabard over mail, its skirt cut into points, a dark red scarf whose two ends fly, layered steel pauldrons, couters,
// vambraces, plum gloves and belt with its cyan buckle, knee cops, greaves and pointed steel shoes, the great sword whose
// blade glows the friend's cyan), on his own broad body (moves3.ts KNIGHT_BODY), in his own colours. What changes is how he
// is drawn: SCULPTED as the Veteran is (dev/sculpt.ts: each solid melted into the next of its stuff, one body with a real
// outline, inked only where one stuff meets another or one part passes in front of another), in place of the old painter's
// balls and rods each on a sheet of its own and ringed in ink (art/hero3_knight.ts). And how he moves (art/warrior_up_moves.ts).
//
// His scarf's two ends are still the game's own (engine/tails.ts): each frame says where they are fixed and the game hangs and
// moves them, so they follow everything he does, in the world, and never repeat. His tabard's skirt follows a few frames
// behind his hips (`Around.past`), its points swinging out on a strike and trailing in a dive.
//
// HIS HELM, 6 Nov 2026, as he asked, seeing him brought up: “All of it is good, I just wish the helmet looked a little better.
// I really like the look of his old pig helmet but it looks old.  And the visor slit never really pops.” So his old pig-faced
// helm is back (a round skull; the visor a snout jutting forward like a pig's face), forged: a crisp ridge down the snout,
// rivets at the visor's pivots, rows of breathing holes, and the slit cut dark across the top of the snout, its upper lip lit
// and its lower edge in shadow, so that it reads at the game's size from every side that shows his face.
//
// HIS EIGHT SIDES (`WuSide`), each him truly turned before the game's camera, 45 degrees apart: as he said yes to drawing him
// from eight sides, and then, asked whether some were only mirrored, “Paint all 8 (Recommended)”: every facing true, his
// sword in his right hand whichever way he faces (art/warrior_up_art.ts wuFacing).

import type { Light } from '../engine/px';
import type { TailRoot } from '../engine/tails';
import { blade, bladeLights, KNIGHT_LOOK } from './hero_warrior';
import { BLADE, CYAN, GLINT, INK, MAIL, PLUM, STEEL, hash } from './kit';
import type { Painted, Ramp } from './kit';
import { GREAT_BLADE } from './moves3';
import { CANVAS3, eyesToward, girdle, laidAlong, mid, stage } from './skin';
import type { GameView, Stage } from './skin';
import { onBack } from './carried';
import { add, cross, dot, len, lerp3, mul, norm, sub, trunkOf } from './skeleton';
import type { Build, Posed, Skeleton, V3 } from './skeleton';
import { Sculpt, draw } from '../dev/sculpt';
import type { Drawn } from '../dev/sculpt';

/** THE SWITCH: off. On, the game's knight is this one (art/heroes3.ts, `makeHeroArt3`). The main chat's to turn on, on his yes to the pictures. */
export const WARRIOR_UP = { on: false };

/** The edge of light round what is the player's (as art/hero3_knight.ts FRIEND_RIM). */
export const WU_RIM = '#22d0e0';

// ---------------------------------------------------------------------------------------------
// His colours: his own three tones of each (kit.ts, hero_warrior.ts), with a tone between each two, so the sculpted surfaces
// turn smoothly in the light; his darkest and lightest exactly his. Nothing glows but the blade and the buckle's cyan.

export function between(a: string, b: string): string {
  const v = (h: string, i: number): number => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const f = (i: number): string => Math.round((v(a, i) + v(b, i)) / 2).toString(16).padStart(2, '0');
  return '#' + f(0) + f(1) + f(2);
}
/** A five-tone ramp from one of his three-tone ramps (dark, dark, mid, light, light): dark, between, mid, between, light. */
export function five(r: Ramp): Ramp {
  return [r[0], between(r[1], r[2]), r[2], between(r[2], r[3]), r[4]];
}
export const WU_STEEL: Ramp = five(STEEL);
export const WU_MAIL: Ramp = five(MAIL);
export const WU_PLUM: Ramp = five(PLUM);
export const WU_RED: Ramp = five(KNIGHT_LOOK.tabard);
export const WU_SCARF: Ramp = five(KNIGHT_LOOK.scarf);

const D = Math.PI / 180;
/** The helm: how much bigger than his head, front to back, side to side and in height (his own: hero3_knight.ts HELM). */
const HELM: V3 = [1.18, 1.26, 1.12];
const FLOOR = { n: [0, 0, -1] as V3, o: 0 };

/**
 * HIS EIGHT SIDES (Heroes 7, “Truly turned, eight ways”; his picks of 6 Nov 2026, “Yes, 8 sides now (Recommended)” and “Paint all
 * 8 (Recommended)”): him truly turned before the game's own camera, 45 degrees apart, none of them a mirror, so that his great
 * sword is in his right hand and his scarf where it is on him whichever way he faces. By the way he faces on the screen:
 *   front    down and to the right (as the game has always drawn a hero in front)
 *   toward   straight down the screen, at the camera (him turned 45 degrees to his right)
 *   frontL   down and to the left (90 to his right)
 *   sideL    side-on, straight to the left (135 to his right)
 *   backL    up and to the left, seen from behind (turned right round)
 *   away     straight up the screen, away from the camera (135 to his left)
 *   back     up and to the right, seen from behind (90 to his left: truly, his sword in his right hand; the game's own view from
 *            behind is a mirror of this, his sword in his left)
 *   side     side-on, straight to the right (45 to his left)
 */
export type WuSide = 'front' | 'toward' | 'frontL' | 'sideL' | 'backL' | 'away' | 'back' | 'side';
export const WU_SIDES: readonly WuSide[] = ['front', 'toward', 'frontL', 'sideL', 'backL', 'away', 'back', 'side'];
/**
 * How far each side turns him to his left (degrees), under the game's camera (from in front, always: no side is a mirror); and
 * where on his canvas the floor point under him is laid (`ax`): the game's hero canvas puts it a little left of the middle,
 * leaving more room before a hero who faces right; a side that faces left has it as far the other way, so that his Lunge and his
 * Whirlwind have room before him (each picture is cut to the box round him: the game sees no difference but his anchor).
 */
/** (a side facing left: the floor point under him 98 across his canvas, where facing right it is 84: his Lunge reaches 90 before
 * him, its blade's glow a little more) */
const LEFT_AX = 98;
export const WU_SPIN: Readonly<Record<WuSide, { spin: number; camera: GameView; ax: number }>> = {
  front: { spin: 0, camera: 'front', ax: CANVAS3.ax },
  toward: { spin: -45, camera: 'front', ax: CANVAS3.ax },
  frontL: { spin: -90, camera: 'front', ax: LEFT_AX },
  sideL: { spin: -135, camera: 'front', ax: LEFT_AX },
  backL: { spin: 180, camera: 'front', ax: LEFT_AX },
  away: { spin: 135, camera: 'front', ax: CANVAS3.ax },
  back: { spin: 90, camera: 'front', ax: CANVAS3.ax },
  side: { spin: 45, camera: 'front', ax: CANVAS3.ax },
};
/** A direction or point of him turned `deg` to his left about the floor point under him. */
export function spun(p: V3, deg: number): V3 {
  if (!deg) return p;
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const sn = Math.sin(a);
  return [p[0] * c - p[1] * sn, p[0] * sn + p[1] * c, p[2]];
}
/** A stage that takes points of him as he is built and sees them as he is turned (for what is drawn of the old kind with him). */
export function turnedStage(st: Stage, deg: number): Stage {
  if (!deg) return st;
  const R = (p: V3): V3 => spun(p, deg);
  return {
    view: st.view,
    under: st.under,
    over: st.over,
    whole: st.whole,
    back: st.back,
    eye: spun(st.eye, -deg),
    at: (p) => st.at(R(p)),
    near: (p) => st.near(R(p)),
    seen: (v) => st.seen(R(v)),
    part: (where) => st.part(where === undefined || typeof where === 'number' ? where : R(where)),
  };
}

/** What a frame is painted in the light of. */
export interface WuAround {
  /** The figure a frame earlier, and a few frames earlier (cloth follows a few frames behind). */
  prev?: Skeleton | null;
  past?: Skeleton | null;
  /** Where the blade has just been, newest first: its guard and its point (its smear, Movement 9). */
  trail?: ReadonlyArray<readonly [V3, V3]>;
  /** How strongly the strike is smeared now (0 none; 1 the strike itself: after-images and the crescent). */
  smear?: number;
  /** Where the wind has got to, 0..1. */
  wind?: number;
}

/** What a sculpted frame of him is, for the checks: the drawing, and the solids by part. */
export interface WuFrame extends Painted {
  drawn: Drawn;
  sc: Sculpt;
  s: Skeleton;
  /** How far he was turned for the side he was seen from (degrees to his left). */
  spin: number;
  /** Where on his canvas the floor point under him is (WU_SPIN's `ax`, and the game's own height). */
  ax: number;
  ay: number;
}

const fr = (v: V3, w: V3, k: number): V3 => norm(sub(v, mul(w, dot(v, w) * k)), [1, 0, 0]);
/** Three lines square to each other: `a`, then `b` made square to it, then the third. (A ball's axes must be square to each other.) */
export function frame(a: V3, b: V3): [V3, V3, V3] {
  const x = norm(a, [1, 0, 0]);
  let y = sub(b, mul(x, dot(b, x)));
  if (len(y) < 1e-4) y = Math.abs(x[2]) < 0.9 ? cross([0, 0, 1], x) : cross([0, 1, 0], x);
  const yy = norm(y);
  return [x, yy, norm(cross(x, yy))];
}

/**
 * HIM, SCULPTED, at a pose (`s` solved from `q` on his build), seen in one of the game's views. Returns the painting, its
 * lights (the blade's) and where the scarf's two ends are fixed (the game moves them).
 */
export function paintWarriorUp(s: Skeleton, q: Posed, side: WuSide, B: Build, around: WuAround = {}, rim: string | null = WU_RIM): WuFrame {
  const { spin, camera: view } = WU_SPIN[side];
  const sc = new Sculpt();
  sc.spin = spin;
  const [ribs, belly, pel] = trunkOf(B, s);
  const [cf, cl, cu] = s.chest;
  const [hf, hl, hu] = s.hips;
  // (the game's camera for this view, only for its sums: the way to the eye, how near a point is. Its sheets are not used: the
  // sculptor's own stage paints the frame)
  const st0 = turnedStage(stage(view, WU_SPIN[side].ax), spin);
  const eye: V3 = st0.eye;
  const farOf = (p: V3): boolean => dot(sub(p, s.pelvis), eye) < -2.4;
  const dim = (h: { tone: number }, p: V3, r: Ramp): string | null => (farOf(p) ? r[Math.max(0, h.tone - 1)] : null);

  // ---- materials ----
  const steel = sc.mat({ ramp: WU_STEEL, crease: 0.4, paint: (h) => {
    const tg = h.prim.tag ?? '';
    // (a lame's rolled edge: a lit line along it)
    if (tg === 'lame' && h.tone >= 2 && hash(h.x, h.y, 3) < 0.15) return WU_STEEL[4];
    return dim(h, h.p, WU_STEEL);
  } });
  const mail = sc.mat({ ramp: WU_MAIL, crease: 0.3, paint: (h) => {
    // MAIL: rows of rings, each a lit pixel over a dark one, staggered row by row
    const row = Math.floor(h.p[2] * 0.9);
    const k = (h.x + (row % 2 ? 1 : 0)) % 2 === 0 && (h.y % 2 === 0);
    const t = farOf(h.p) ? h.tone - 1 : h.tone;
    return WU_MAIL[Math.max(0, Math.min(4, k ? t + 1 : t))];
  } });
  const red = sc.mat({ ramp: WU_RED, crease: 0.36, paint: (h) => {
    const tg = h.prim.tag ?? '';
    // (the tabard's hem: a darker stitched band along its foot)
    if (tg === 'panel' || tg === 'point') {
      const t = farOf(h.p) ? h.tone - 1 : h.tone;
      return WU_RED[Math.max(0, Math.min(4, t))];
    }
    return dim(h, h.p, WU_RED);
  } });
  const plum = sc.mat({ ramp: WU_PLUM, paint: (h) => dim(h, h.p, WU_PLUM) });
  const wine = sc.mat({ ramp: WU_SCARF, crease: 0.42 });

  // ---- THE LEGS: mail over the thigh, the knee cop and its fan, the greave over shin and calf, a pointed steel shoe ----
  const [lH, lK, lA] = B.legR;
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    const leg = `leg${side}`;
    const td = norm(sub(knee, hip));
    const tf = fr(sub(toe, heel), td, 1);
    // the thigh in mail, the great muscle swelling it a little in front
    sc.cone(mail, leg, hip, knee, lH + 0.1, lK + 0.4, 1.4, { tag: 'thigh' });
    sc.ell(mail, leg, add(lerp3(hip, knee, 0.42), mul(tf, 0.7)), [mul(td, B.thigh * 0.3), mul(tf, lH * 0.72), mul(norm(cross(td, tf)), lH * 0.8)], 1.2, { tag: 'quad' });
    // the greave: steel from below the knee to the ankle, the calf's swell behind it
    const sd = norm(sub(ankle, knee));
    const sf = fr(sub(toe, heel), sd, 1);
    sc.cone(steel, `shin${side}`, add(knee, mul(sd, 1.0)), ankle, lK + 0.5, lA + 0.6, 1.0, { tag: 'greave' });
    sc.ell(steel, `shin${side}`, add(lerp3(knee, ankle, 0.32), mul(sf, -0.7)), [mul(sd, B.shank * 0.24), mul(sf, lK * 0.72), mul(norm(cross(sd, sf)), lK * 0.8)], 1.0, { tag: 'greave' });
    // the knee cop: a domed plate over the knee, a small fan of steel on its outside
    sc.ell(steel, `knee${side}`, add(knee, mul(sf, 0.5)), [mul(sf, lK * 0.85), mul(norm(cross(sd, sf)), lK + 0.7), mul(sd, lK + 0.7)], 0.3, { tag: 'lame' });
    const out = norm(cross(sd, sf));
    const o2 = mul(out, side === 'L' ? 1 : -1);
    sc.ell(steel, `knee${side}`, add(knee, mul(o2, lK * 0.7)), [mul(o2, 0.6), mul(sf, lK * 0.7), mul(sd, lK * 0.85)], 0.2, { tag: 'lame' });
    // the shoe: steel lames over the foot, drawn to a point at the toe, flat on the floor (never in it)
    const fd = norm(sub(toe, heel));
    const fu = norm(cross(cross(fd, [0, 0, 1]), fd), [0, 0, 1]);
    const up = dot(fu, [0, 0, 1]) < 0 ? mul(fu, -1) : fu;
    sc.cone(steel, `foot${side}`, add(heel, mul(up, 1.8)), add(toe, mul(up, 1.25)), 2.2, 1.35, 0.8, { tag: 'shoe', cuts: [FLOOR] });
    sc.ell(steel, `foot${side}`, add(lerp3(heel, toe, 0.38), mul(up, 2.5)), [mul(fd, B.ball * 0.55), mul(norm(cross(up, fd)), 2.2), mul(up, 1.8)], 0.9, { tag: 'lame', cuts: [FLOOR] });
    sc.cone(steel, `foot${side}`, add(toe, mul(up, 1.1)), add(toe, add(mul(fd, 2.4), mul(up, 0.7))), 1.1, 0.35, 0.6, { tag: 'shoe', cuts: [FLOOR] });
  }

  // ---- THE TRUNK: the tabard over the mail, one body: a deep broad chest drawn in to a thick waist, the pelvis under it ----
  sc.ell(red, 'trunk', ribs.c, [mul(ribs.r[0], ribs.h[0] + 0.9), mul(ribs.r[1], ribs.h[1] + 0.9), mul(ribs.r[2], ribs.h[2] + 0.4)], 2.6, { tag: 'ribs' });
  // (the breadth of him high on his chest, out to the shoulders)
  sc.ell(red, 'trunk', add(ribs.c, mul(cu, ribs.h[2] * 0.45)), [mul(cf, ribs.h[0] * 0.92), mul(cl, B.shoulderHalf * 0.95), mul(cu, ribs.h[2] * 0.5)], 2.4, { tag: 'ribs' });
  sc.ell(red, 'trunk', belly.c, [mul(belly.r[0], belly.h[0] + 0.9), mul(belly.r[1], belly.h[1] + 0.9), mul(belly.r[2], belly.h[2] * 1.05)], 2.4, { tag: 'belly' });
  sc.ell(red, 'trunk', pel.c, [mul(pel.r[0], pel.h[0] + 1.2), mul(pel.r[1], pel.h[1] + 1.2), mul(pel.r[2], pel.h[2] * 0.95)], 2.2, { tag: 'pelvis' });

  // ---- THE SKIRT OF THE TABARD: closed at the hips, split below into six panels that hang over his thighs wherever they go,
  // each cut into a point; left behind by how far his hips have come over the last few frames (it follows) ----
  const lagFrom = around.past ?? around.prev ?? null;
  const lag: V3 = lagFrom ? mul(sub(s.pelvis, lagFrom.pelvis), -0.55) : [0, 0, 0];
  const lagFlat: V3 = [lag[0], lag[1], Math.max(-1.5, Math.min(1.5, lag[2]))];
  const lagLen = len(lagFlat);
  const lagC: V3 = lagLen > 7 ? mul(lagFlat, 7 / lagLen) : lagFlat;
  const waistRing = girdle(trunkOf(B, s)[2], 0.55, 1.6);
  const wind = around.wind ?? 0;
  // (eight panels round him, front and back hanging between his legs, the rest round the sides: each hangs PLUMB from the
  // belt to the knee and flares out, pushed out only where a thigh comes against it, so the skirt reads as a skirt, split, and
  // never as trousers; and it is left behind by how far his hips have come over the last few frames)
  const PANELS = [0, 45, 90, 135, 180, -135, -90, -45];
  // (closed at the hips: a ring of cloth from the belt to below the seat, round both hip joints)
  const hipMid = mid(s.hipL, s.hipR);
  sc.ell(red, 'skirt', add(hipMid, mul(hu, -1.4)), [mul(hf, B.pelvisDeep + 2.6), mul(hl, B.pelvisHalf + 2.9), mul(hu, 4.2)], 1.6, { tag: 'skirt' });
  const hem = Math.max(3.5, hipMid[2] - B.thigh * 0.64);
  for (const at of PANELS) {
    const a = at * D;
    const outH = norm(add(mul(hf, Math.cos(a)), mul(hl, Math.sin(a))));
    const outFlat = norm([outH[0], outH[1], 0], [1, 0, 0]);
    const top = add(waistRing.c, add(mul(norm(waistRing.u), Math.cos(a) * len(waistRing.u)), mul(norm(waistRing.v), Math.sin(a) * len(waistRing.v))));
    // how far out it hangs at the hem: as wide as the hips and a flare, or further where a knee or thigh comes against it
    let out = Math.hypot(len(waistRing.u) * Math.cos(a), len(waistRing.v) * Math.sin(a)) + 1.6;
    const centre: V3 = [hipMid[0], hipMid[1], 0];
    for (const [hip, knee] of [[s.hipL, s.kneeL], [s.hipR, s.kneeR]] as const) {
      for (const k of [0.55, 0.8, 1.0]) {
        const pt = lerp3(hip, knee, k);
        if (pt[2] < hem - 3) continue;
        // (how far out along this panel's way the thigh's skin reaches, if it is in front of the panel's face)
        const rel: V3 = [pt[0] - centre[0], pt[1] - centre[1], 0];
        const radial = dot(rel, outFlat);
        const across = Math.abs(dot(rel, [-outFlat[1], outFlat[0], 0]));
        if (across < 4.8 + lK) out = Math.max(out, radial + lK + 1.9);
      }
    }
    const flutter = Math.sin((wind + at / 360) * Math.PI * 2) * 0.5;
    let low: V3 = add([centre[0] + outFlat[0] * out, centre[1] + outFlat[1] * out, hem], add(lagC, mul(outFlat, flutter)));
    // (with his hips tipped far over, in a dive or a lunge, the panels lie along his thighs rather than hang plumb from them)
    const tilt = Math.max(0, Math.min(1, (1 - Math.max(0, hu[2]) - 0.12) / 0.3));
    if (tilt > 0) {
      const sa = Math.sin(a);
      const knee = Math.abs(sa) < 0.3 ? mid(s.kneeL, s.kneeR) : sa > 0 ? s.kneeL : s.kneeR;
      const hip = Math.abs(sa) < 0.3 ? hipMid : sa > 0 ? s.hipL : s.hipR;
      const onThigh = add(lerp3(hip, knee, 0.85), mul(outH, lK + 1.6));
      low = lerp3(low, onThigh, tilt);
    }
    const lowC: V3 = [low[0], low[1], Math.max(2.2, low[2])];
    const along = sub(lowC, top);
    const L = len(along);
    const [dn, outP, acr] = frame(along, outFlat);
    const wTop = 2.6;
    const wLow = 2.9;
    const c = lerp3(top, lowC, 0.5);
    sc.box(red, 'skirt', c, [mul(outP, 0.55), mul(acr, (wTop + wLow) / 2), mul(dn, L / 2)], 0.5, 1.3, { tag: 'panel' });
    // its point, the hem cut into points as his always was
    const tip = add(lowC, mul(dn, 2.4 + 0.7 * Math.sin((at + wind * 360) * D)));
    sc.tri(red, 'skirt', add(lowC, mul(acr, wLow)), add(lowC, mul(acr, -wLow)), [tip[0], tip[1], Math.max(0.6, tip[2])], 0.5, 0.9, { tag: 'point' });
  }
  // the belt over the tabard at his waist, its buckle in front
  sc.ell(plum, 'belt', waistRing.c, [mul(hf, len(waistRing.u) + 0.5), mul(hl, len(waistRing.v) + 0.5), mul(hu, 1.25)], 0.4, { tag: 'belt' });
  const buckle = add(waistRing.c, mul(norm(waistRing.u), len(waistRing.u) + 1.6));
  sc.mark(buckle, CYAN[4], 1, 1, 0, 0, 2.5);
  sc.mark(buckle, CYAN[3], 1, 1, -1, 0, 2.5);
  sc.mark(buckle, CYAN[2], 1, 1, 1, 0, 2.5);
  sc.mark(buckle, CYAN[3], 1, 1, 0, -1, 2.5);
  sc.mark(buckle, CYAN[2], 1, 1, 0, 1, 2.5);

  // ---- THE ARMS: mail to the elbow under a layered pauldron, a couter, a steel vambrace, a plum glove ----
  const [aS, aE, aW] = B.armR;
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const outSide = mul(cl, side === 'L' ? 1 : -1);
    const arm = `arm${side}`;
    sc.cone(mail, arm, sh, el, aS + 0.2, aE + 0.3, 1.2, { tag: 'upper' });
    const fd = norm(sub(hand, el), cf);
    const wrist = lerp3(el, hand, 0.8);
    sc.cone(steel, `fore${side}`, add(el, mul(fd, 0.6)), wrist, aE + 0.5, aW + 0.65, 0.9, { tag: 'vambrace' });
    // the couter: a cup over the point of the elbow
    const ud = norm(sub(el, sh), [0, 0, -1]);
    const [back, cs, ct] = frame(sub(ud, fd), outSide);
    sc.ell(steel, `fore${side}`, add(el, mul(back, 0.5)), [mul(back, aE + 0.6), mul(cs, aE + 0.7), mul(ct, aE + 0.6)], 0.3, { tag: 'lame' });
    // the glove: a fist round the grip, its flared cuff
    sc.cone(plum, `hand${side}`, wrist, add(wrist, mul(fd, 1.4)), aW + 0.95, aW + 0.7, 0.6, { tag: 'cuff' });
    const [ha, hb, hc] = frame(fd, cl);
    sc.ell(plum, `hand${side}`, add(hand, mul(fd, 0.2)), [mul(ha, aW + 0.8), mul(hb, aW + 1.0), mul(hc, aW + 0.8)], 0.9, { tag: 'fist' });
    // THE PAULDRON: a dome of steel over the point of the shoulder, wider than the arm, and a second lame under its rim
    const cap = add(sh, add(mul(outSide, 0.4), mul(cu, 1.1)));
    sc.ell(steel, `pauld${side}`, cap, [mul(cf, aS + 1.2), mul(outSide, aS + 1.25), mul(cu, aS + 0.1)], 0.25, { tag: 'cap' });
    const ud2 = norm(sub(el, sh), [0, 0, -1]);
    const [pa, pb, pc] = frame(ud2, outSide);
    sc.ell(steel, `pauld${side}b`, add(sh, add(mul(outSide, 1.2), mul(ud2, 1.9))), [mul(pa, 1.3), mul(pb, aS + 0.5), mul(pc, aS + 0.6)], 0.2, { tag: 'lame' });
  }

  // ---- THE SCARF wound round his neck, thick, over the top of the tabard; its knot behind (the game moves its two ends) ----
  sc.ell(wine, 'scarf', add(s.neck, add(mul(cf, 0.9), mul(cu, -0.3))), [mul(cf, 5.0), mul(cl, 6.3), mul(cu, 2.6)], 1.4, { tag: 'wrap' });
  sc.ell(wine, 'scarf', add(s.neck, add(mul(cf, 1.5), mul(cu, 1.4))), [mul(cf, 4.0), mul(cl, 4.8), mul(cu, 1.9)], 1.2, { tag: 'wrap' });
  // (its folds hanging over the top of his chest in front)
  sc.ell(wine, 'scarf', add(s.neck, add(mul(cf, 4.2), mul(cu, -2.6))), [mul(cf, 1.6), mul(cl, 3.4), mul(cu, 2.4)], 1.0, { tag: 'wrap' });
  const knotAt = add(s.neck, add(mul(cf, -4.2), mul(cu, 1.2)));
  sc.ell(wine, 'scarf', knotAt, [mul(cf, 1.6), mul(cl, 2.0), mul(cu, 1.6)], 0.8, { tag: 'knot' });

  // ---- THE HEAD: THE PIG-FACED HELM, his own as the game has always had it (his words, 6 Nov 2026: “I really like the look of
  // his old pig helmet but it looks old.  And the visor slit never really pops.”), forged anew: the mail coif at his neck; a
  // rounded skull of steel, drawn up a little to the back of the crown; out from where his face is, THE SNOUT, the visor
  // jutting forward and a little down like a pig's face, a crisp ridge down its top; a rivet at each pivot of the visor, at his
  // temples; rows of holes he breathes through on its cheeks; and THE EYE SLIT across the top of the snout where it meets the
  // skull: deep and dark, its upper lip lit bright and its lower edge in shadow, so it reads at a glance (no glow in it: the
  // faint cyan point of his eyes he has always had) ----
  const [ff, fl, fu] = s.face;
  const R = B.headR;
  sc.cone(mail, 'coif', s.neck, add(s.skull, mul(fu, -0.6)), 2.7, 2.6, 1.0, { tag: 'coif' });
  const helmC = add(s.head, mul(fu, R[2] * 0.06));
  sc.ell(steel, 'helm', helmC, [mul(ff, R[0] * HELM[0]), mul(fl, R[1] * HELM[1]), mul(fu, R[2] * HELM[2])], 1.0, { tag: 'skull' });
  // (the skull full and round at the back, as his old pig helm's is: no point to its crown, from any side)
  sc.ell(steel, 'helm', add(helmC, add(mul(fu, R[2] * 0.15), mul(ff, -R[0] * 0.35))), [mul(ff, R[0] * 0.9), mul(fl, R[1] * 1.0), mul(fu, R[2] * 0.95)], 1.2, { tag: 'skull' });
  // (its rim flaring a little over the mail at the back and the sides)
  sc.ell(steel, 'helm', add(s.head, add(mul(fu, -R[2] * 0.62), mul(ff, -R[0] * 0.18))), [mul(ff, R[0] * 1.08), mul(fl, R[1] * 1.22), mul(fu, R[2] * 0.36)], 0.8, { tag: 'skull' });
  const eyes = eyesToward(st0, s);
  const midTurn = ((eyes[0] + eyes[1]) / 2) * D;
  const outF = add(mul(ff, Math.cos(midTurn)), mul(fl, Math.sin(midTurn)));
  // THE SNOUT: from the whole of his face, jutting forward and a little down to a blunt point
  const root = add(s.head, add(mul(outF, R[0] * 0.5), mul(fu, -R[2] * 0.2)));
  const point = add(s.head, add(mul(outF, R[0] * 2.65), mul(fu, -R[2] * 0.6)));
  const RA = 3.4;
  const RB = 1.05;
  // (a plate of its own over his face: barely melted into the skull, so the seam round it shows where it stands proud)
  sc.cone(steel, 'visor', root, point, RA, RB, 0.15, { tag: 'visor' });
  // (its crisp ridge down the top, from the slit to the point)
  const snoutUp = norm(sub(fu, mul(norm(sub(point, root)), dot(fu, norm(sub(point, root))))), fu);
  sc.cone(steel, 'visor', add(root, mul(snoutUp, RA * 0.82)), add(point, mul(snoutUp, RB * 0.75)), 0.75, 0.35, 0.35, { tag: 'snoutRidge' });
  /** A point on the helm's skull: degrees round from where his face is drawn, a share of his head's height above its middle. */
  const onHelm = (az: number, upK: number): V3 => add(s.head, add(add(mul(ff, Math.cos(az * D) * R[0] * HELM[0]), mul(fl, Math.sin(az * D) * R[1] * HELM[1])), mul(fu, upK * R[2])));
  /** A point on the snout's skin: `u` along it from root to point, `round` degrees round it from its top toward his left. */
  const snoutAxis = norm(sub(point, root));
  const snoutLeft = norm(cross(snoutUp, snoutAxis), fl);
  const onSnout = (u: number, round: number): V3 => {
    const r = RA + (RB - RA) * u;
    const a = round * D;
    return add(lerp3(root, point, u), add(mul(snoutUp, Math.cos(a) * r), mul(snoutLeft, -Math.sin(a) * r)));
  };
  // THE EYE SLIT, painted on the steel where it crosses the snout's top and the front of the skull: dark, lit above, shaded below
  const SLIT = 0.2;
  const facesAt = (p: V3): boolean => dot(sub(p, s.head), eye) > 0;
  const slitOf = (p: V3): number => {
    // (how far above the slit's middle a point of the helm is, in shares of his head's height; NaN where the slit does not run)
    const v = sub(p, s.head);
    const f = dot(v, outF);
    const l = dot(v, norm(sub(fl, mul(outF, dot(fl, outF))), fl));
    if (f < R[0] * 0.25 || Math.abs(Math.atan2(l, f)) > 66 * D) return NaN;
    return dot(v, fu) / R[2] - SLIT;
  };
  const helmPaint = sc.mats[steel].paint;
  sc.mats[steel].paint = (h) => {
    const piece = h.prim.piece;
    if (piece === 'helm' || piece === 'visor') {
      const up = slitOf(h.p);
      if (up === up) {
        if (Math.abs(up) < 0.13) return INK;
        if (up >= 0.13 && up < 0.3) return WU_STEEL[4];
        if (up <= -0.13 && up > -0.27) return WU_STEEL[1];
      }
      // (the ridge down the snout: its crest lit, its flanks a step darker)
      if (h.prim.tag === 'snoutRidge') return h.tone >= 2 ? WU_STEEL[4] : WU_STEEL[Math.max(1, h.tone)];
      // (the snout lifted a tone, as a hero's face is, so that his pig's face reads though it is turned from the light)
      if (h.prim.tag === 'visor') return WU_STEEL[Math.min(4, Math.max(1, h.tone + 1))];
    }
    return helmPaint ? helmPaint(h) : null;
  };
  // the faint cyan point of his eyes in the slit (as he has always had), the rivets at the visor's pivots, the breathing holes
  for (const turn of eyes) {
    if (!facesAt(onHelm(turn, SLIT))) continue;
    sc.mark(add(s.head, add(mul(add(mul(ff, Math.cos(turn * D)), mul(fl, Math.sin(turn * D))), R[0] * 1.32), mul(fu, R[2] * SLIT))), GLINT, 1, 1, 0, 0, 3.5);
  }
  for (const az of [midTurn / D - 92, midTurn / D + 92]) {
    const pv = onHelm(az, SLIT - 0.08);
    if (!facesAt(pv)) continue;
    sc.mark(pv, WU_STEEL[4], 1, 1, 0, 0, 2.5, steel);
    sc.mark(pv, INK, 1, 1, 1, 1, 2.5, steel);
  }
  for (const [u0, rounds] of [[0.34, [62, 80, 98]], [0.5, [66, 86, 104]], [0.64, [72, 94]]] as const) {
    for (const rd of rounds) for (const sgn of [1, -1]) {
      const hp = onSnout(u0, rd * sgn);
      if (facesAt(hp)) sc.mark(hp, INK, 1, 1, 0, 0, 1.6, steel);
    }
  }
  const knot = add(s.neck, add(mul(cf, -4.2), mul(cu, 1.2)));

  // ---- what is drawn of the old kind: the great sword (its glow), its smear, the slots and breaths ----
  const away = q.stow > 0.5;
  const lights: Light[] = [];
  let tails: TailRoot[] = [];
  const extras = (raw: Stage): void => {
    // (what is drawn of the old kind is laid as he is turned for this side)
    const st = turnedStage(raw, spin);
    const carried = away ? onBack(B, s, 'sword') : { grip: s.handR, point: s.point };
    const guard3 = add(carried.grip, mul(carried.point, 1.3));
    const tip3 = add(guard3, mul(carried.point, GREAT_BLADE));
    const sword = st.part(mid(guard3, tip3, 0.4));
    const [gx, gy] = st.at(carried.grip);
    const [px, py] = st.seen(carried.point);
    const seenLong = Math.hypot(px, py);
    const deg = (Math.atan2(-py, px) * 180) / Math.PI;
    const lenB = Math.max(2, GREAT_BLADE * seenLong - 2.7);
    const smear = around.smear ?? 0;
    const trail = around.trail;
    if (!away && trail && trail.length > 1 && smear > 0) {
      const moved = Math.hypot(...sub(trail[0][1], trail[trail.length - 1][1]));
      if (moved > 8) {
        // THE SMEAR (Movement 9): a crescent of the blade's light along the path of its point, widest and brightest just behind
        // the blade, thinning and breaking up toward its oldest end; and AFTER-IMAGES of the blade along it, under him
        const n = trail.length;
        const fan = st.part(st.near(mid(guard3, tip3, 0.4)) - 0.4);
        const inner = (e: readonly [V3, V3], age: number): V3 => mid(e[0], e[1], 0.35 + 0.6 * Math.pow(age, 0.7));
        for (let i = n - 1; i >= 1; i--) {
          const a = trail[i];
          const b = trail[i - 1];
          const age = (i - 0.5) / (n - 1);
          fan.poly([inner(a, i / (n - 1)), a[1], b[1], inner(b, (i - 1) / (n - 1))].map((p) => st.at(p)), age < 0.3 ? BLADE[3] : age < 0.62 ? BLADE[2] : BLADE[1]);
        }
        for (let i = 1; i < n; i++) {
          const age = i / (n - 1);
          if (age > 0.7) break;
          const [x0, y0] = st.at(trail[i - 1][1]);
          const [x1, y1] = st.at(trail[i][1]);
          fan.line(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), age < 0.35 ? BLADE[4] : BLADE[3]);
        }
        const old = st.at(trail[n - 1][1]);
        const now = st.at(trail[0][1]);
        const far = Math.hypot(old[0] - now[0], old[1] - now[1]) || 1;
        for (let y = 0; y < fan.h; y++) for (let x = 0; x < fan.w; x++) {
          if (!fan.has(x, y)) continue;
          const k = 1 - Math.hypot(x - old[0], y - old[1]) / far;
          if (k > 0.45 && hash(x, y, 7) < (k - 0.45) * 1.6) fan.erase(x, y);
        }
        // THE AFTER-IMAGES: GHOSTS OF THE BLADE ITSELF, a third and two thirds of the way back along the swing, each the blade's own
        // shape (its two edges and its point, a lit line down its middle) in a fading copy of its light, laid ON the arc it has
        // just swept (from the arc's inner edge at that moment out to the point, as the arc is), painted on the arc's own sheet so
        // the two are one motion. Never a bar of its own: nothing of them lies off the arc.
        for (const k of [0.34, 0.67]) {
          const i = Math.min(n - 1, Math.max(1, Math.round(k * (n - 1))));
          const age = i / (n - 1);
          const e = trail[i];
          const [x0, y0] = st.at(inner(e, age));
          const [x1, y1] = st.at(e[1]);
          const L = Math.hypot(x1 - x0, y1 - y0);
          if (L < 6) continue;
          const dx = (x1 - x0) / L;
          const dy = (y1 - y0) / L;
          const w = k < 0.5 ? 2.2 : 1.7;
          const tipBack = Math.min(L * 0.3, 4);
          const body = k < 0.5 ? BLADE[3] : BLADE[2];
          const core = k < 0.5 ? BLADE[4] : BLADE[3];
          fan.poly([
            [x0 - dy * w, y0 + dx * w],
            [x1 - dx * tipBack - dy * w, y1 - dy * tipBack + dx * w],
            [x1, y1],
            [x1 - dx * tipBack + dy * w, y1 - dy * tipBack - dx * w],
            [x0 + dy * w, y0 - dx * w],
          ], body);
          fan.line(Math.round(x0 + dx), Math.round(y0 + dy), Math.round(x1 - dx * (tipBack + 1)), Math.round(y1 - dy * (tipBack + 1)), core);
        }
        const [lx, ly] = st.at(mid(trail[1][0], trail[1][1], 0.8));
        lights.push({ x: lx, y: ly, r: 15, color: BLADE[3], a: 0.34 });
      }
    }
    blade(sword, gx, gy, deg, lenB, 2.6, Math.max(2, 9 * seenLong), 4);
    laidAlong(sword, st, add(carried.grip, mul(carried.point, -9)), tip3, 0.4);
    const cf0 = s.chest[0];
    if (!(away && st.near(cf0) > 0)) for (const l of bladeLights(gx, gy, deg, lenB)) lights.push(l);
    // (the strap the sword hangs from on his back, across his chest from his right shoulder to his left hip)
    if (away && st.near(cf0) > 0) {
      const a = add(s.shoulderR, add(mul(cf, B.ribDeep * 0.8 + 1.4), mul(cl, 3.4)));
      const b = add(s.waist, add(mul(hf, B.pelvisDeep * 0.9 + 1.4), mul(hl, B.pelvisHalf * 0.9)));
      const strap = st.part(mid(a, b));
      const [x0, y0] = st.at(a);
      const [x1, y1] = st.at(b);
      const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
      for (let i = 0; i <= n; i++) {
        const x = Math.round(x0 + ((x1 - x0) * i) / n - 0.5);
        const y = Math.round(y0 + ((y1 - y0) * i) / n - 0.5);
        strap.set(x, y, WU_PLUM[1]);
        strap.set(x + 1, y, WU_PLUM[3]);
        strap.set(x + 1, y + 1, WU_PLUM[2]);
      }
      laidAlong(strap, st, a, b, 0.6);
    }
    const [tx, ty] = st.at(knot);
    const behind = st.near(knot) < st.near(s.neck);
    tails = [
      { id: 'w-scarf-b', x: tx, y: ty + 0.5, over: !behind },
      { id: 'w-scarf-a', x: tx, y: ty - 1, over: !behind },
    ];
  };
  const drawn = draw(sc, view, WU_SPIN[side].ax, CANVAS3.ay, CANVAS3, extras, rim);
  return { px: drawn.px, lights, tails, drawn, sc, s, spin, ax: WU_SPIN[side].ax, ay: CANVAS3.ay };
}
