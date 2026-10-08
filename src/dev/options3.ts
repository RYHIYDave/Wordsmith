// DESIGNS TO CHOOSE FROM, for the heroes painted over the bones (6 Oct 2026). NOT IN THE GAME.
//
// The owner, that night, 23:11: "i need 10 new mages.  i dont think im happy with her yet.  i like
// the faces being similar but i have plans for way more classes and they all cant have that face.
// and maybe 10 ranger faces.  and 10 full faced helmets for the warrior"; and at 23:17: "it can be
// lower quality and ill try and choose if that will speed up the painting".
//
// So these are SKETCHES. Each is painted for one pose (standing, facing the eye) and has been
// looked at only so: not from behind, and not in any move. They are made of the same solids as
// the heroes (art/skin.ts) on the same bones (art/skeleton.ts), so the one he picks is already
// most of the way to being a hero.
//
//   - TEN MAGES: whole figures, each a different woman (`MAGES`, `paintMageOption`).
//   - TEN RANGER FACES and TEN FULL-FACE HELMETS: heads only, painted on the ranger and the
//     knight as they are, in place of the head their own painters give them (`RANGER_HEADS`,
//     `KNIGHT_HELMS`: each is a `HeadPainter`, art/hero3_knight.ts).

import { BONE, CYAN, GLINT, INDIGO, INK, LEAF, MAIL, PINK, PLUM, ROBE, SKIN4, SPARK, STEEL, TEAL, dim } from '../art/kit';
import { RED } from '../art/hero_warrior';
import type { Painted, Ramp } from '../art/kit';
import { FRIEND_RIM } from '../art/hero3_knight';
import type { HeadCtx, HeadPainter } from '../art/hero3_knight';
import type { TailRoot } from '../engine/tails';
import { paintMove3 } from '../art/heroes3';
import type { Move3 } from '../art/moves3';
import { STAFF_DOWN, STAFF_UP } from '../art/moves3';
import { ball, band, cloth, faces, girdle, hidden, mid, off, rod, sided, skirtOf, stage, thread, tippedFrom, trunkBalls, wornOn } from '../art/skin';
import type { GameView, Ring, Sheet, Stage } from '../art/skin';
import { add, cross, dot, lerp3, mul, norm, sub, trunkOf } from '../art/skeleton';
import type { Build, Posed, Skeleton, Solid, V3 } from '../art/skeleton';

const D = Math.PI / 180;

// Colours the kit does not have, for telling one sketch from another. (What GLOWS on a hero is
// still cyan in every one of them.)
/** A blue so dark it is nearly the ink: a night robe, black hair. */
const NIGHT: Ramp = ['#15123a', '#15123a', '#2a2664', '#48448e', '#48448e'];
/** A dark red: hair, a sash. */
const WINE: Ramp = ['#4a0f30', '#4a0f30', '#9a1c48', '#d8486a', '#d8486a'];
/** Blonde hair (the owner, 6 Oct 2026, 23:42, of the mage in the pointed hat: "change the hair to blonde"): the game's own gold, its shadow a warm brown. */
const BLONDE: Ramp = ['#7a4828', '#7a4828', '#dca63c', '#ffe27a', '#ffe27a'];
/** Brown hair (the owner, 6 Oct 2026, 23:48, of the same mage: "nope, dark eyes and brown hair"): the game's wood. */
const BROWN: Ramp = ['#4a2c1a', '#4a2c1a', '#7e4f2c', '#b67e4a', '#b67e4a'];
/** White: hair gone white, a mask, a pale robe (the kit's bone). */
const WHITE: Ramp = BONE;

type R4 = readonly [string, string, string, string];
/** Skin in the light. */
const lit = (r: R4): Ramp => [r[0], r[1], r[2], r[3], r[3]];

/** What a sketch is painted with: the figure, where its parts go, and a few lines of it that every part needs. */
export interface C {
  st: Stage;
  s: Skeleton;
  q: Posed;
  B: Build;
  trunk: readonly [Solid, Solid, Solid];
  fromBehind: boolean;
  /** The head's own forward, left and up, and its three half-lengths. */
  hf: V3;
  hl: V3;
  hu: V3;
  R: V3;
  mine: (ramp: Ramp, p: V3) => Ramp;
}

export function ctxOf(st: Stage, s: Skeleton, q: Posed, B: Build): C {
  const [hf, hl, hu] = s.face;
  return { st, s, q, B, trunk: trunkOf(B, s), fromBehind: st.near(s.chest[0]) < 0, hf, hl, hu, R: B.headR, mine: (ramp, p) => sided(st, s, ramp, p) };
}

// ---------------------------------------------------------------------------------------------
// Parts

/** The legs: hose, and boots to the ankle or to the knee. The sheets they are on (for hiding under a long skirt). */
function legs(c: C, hose: Ramp, boot: Ramp, tall = false): Sheet[] {
  const { st, s, B, mine } = c;
  const [lH, lK, lA] = B.legR;
  const out: Sheet[] = [];
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    const thigh = st.part(mid(hip, knee));
    rod(thigh, st, hip, knee, lH, lK + 0.2, mine(hose, knee), { shade: 0.15 });
    const shin = st.part(mid(knee, ankle));
    const b = mine(boot, ankle);
    rod(shin, st, add(heel, [0, 0, 1.7]), add(toe, [0, 0, 1.3]), 1.9, 1.5, b, { shade: 0.15 });
    if (tall) {
      rod(shin, st, knee, ankle, lK + 0.55, lA + 0.6, b);
      const cuff = st.part(st.near(knee) + 0.2);
      ball(cuff, st, lerp3(knee, ankle, 0.08), [[lK + 0.9, 0, 0], [0, lK + 0.9, 0], [0, 0, 1.3]], b);
    } else {
      const top = lerp3(knee, ankle, 0.6);
      rod(shin, st, knee, top, lK + 0.2, lK, mine(hose, knee));
      rod(shin, st, top, ankle, lK + 0.4, lA + 0.6, b);
    }
    out.push(thigh, shin);
  }
  return out;
}

/** The trunk in one cloth: ribs, waist, the line of the shoulders, and her bust. `hips`: the pelvis too, in this (where no long skirt hides it). */
function bodice(c: C, ramp: Ramp, more = 0.6, hips: Ramp | null = null): Sheet {
  const { st, s, B, trunk } = c;
  const body = st.part(s.ribs);
  const balls = trunkBalls(trunk, more);
  ball(body, st, balls[0].c, balls[0].axes, ramp);
  ball(body, st, balls[1].c, balls[1].axes, ramp);
  if (hips) ball(body, st, balls[2].c, balls[2].axes, hips);
  rod(body, st, off(s.shoulderL, s.chest, 0, -0.8, 0.2), off(s.shoulderR, s.chest, 0, 0.8, 0.2), 2.1, 2.1, ramp);
  ball(body, st, off(trunk[0].c, s.chest, B.ribDeep * 0.5, 0, 0.4), [mul(s.chest[0], 2.5), mul(s.chest[1], B.ribHalf * 0.9), mul(s.chest[2], 2.4)], ramp);
  return body;
}

/** A line of light down the front of a bodice, neck to waist. */
function seam(c: C, body: Sheet, color: string): void {
  const { st, s, B } = c;
  if (c.fromBehind) return;
  const a = st.at(off(s.neck, s.chest, B.ribDeep + 0.4, 0, -2.5));
  const b = st.at(off(s.waist, s.hips, B.waistDeep + 0.6, 0, 1.5));
  const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1])));
  for (let i = 0; i <= n; i++) body.mark(a[0] + ((b[0] - a[0]) * i) / n - 0.5, a[1] + ((b[1] - a[1]) * i) / n - 0.5, color);
}

interface SkirtLook {
  /** How far below the pelvis its hem is; how much wider than the hips it is at the hem, across and front to back. */
  drop: number;
  wide: number;
  deep: number;
  hem?: Ramp;
  folds?: number[];
  ragged?: boolean;
  /** Open in front: only this much of the tube is there (degrees round from the front). */
  arc?: readonly [number, number];
}
function skirt(c: C, ramp: Ramp, o: SkirtLook): { sheet: Sheet; rings: Ring[] } {
  const { st, s, B, trunk } = c;
  const sheet = st.part(s.pelvis);
  const rings = skirtOf(s, B, { top: girdle(trunk[1], -0.15, 0.7), drop: o.drop, wide: B.pelvisHalf + o.wide, deep: B.pelvisDeep + o.deep });
  cloth(sheet, st, rings, ramp, { hem: o.hem, folds: o.folds ?? [0, 180], ragged: o.ragged, arc: o.arc });
  return { sheet, rings };
}

/** A belt or a sash at the waist, and its buckle. */
function belt(c: C, ramp: Ramp, buckle: Ramp | null = CYAN, rows = 2): void {
  const { st, s, trunk } = c;
  const sash = st.part(s.waist);
  const waist = girdle(trunk[1], -0.1, 1.0);
  band(sash, st, waist, ramp, rows);
  if (buckle && !c.fromBehind) {
    const at = add(waist.c, waist.u);
    const [bx, by] = st.at(at);
    for (let j = -1; j <= 0; j++) for (let i = -1; i <= 0; i++) sash.put(Math.round(bx) + i, Math.round(by) + j, i + j < -1 ? buckle[4] : buckle[2], st.near(at) + 0.6);
  }
}

interface ArmLook {
  upper: Ramp;
  fore: Ramp;
  hand: Ramp;
  /** The other hand, if it is not the same (a gauntlet on one). */
  handL?: Ramp;
  /** How much wider than the wrist the sleeve is where it ends (1.3: a belled sleeve; 0: a tight one). */
  bell?: number;
}
function arms(c: C, o: ArmLook): void {
  const { st, s, B, mine } = c;
  const [aS, aE, aW] = B.armR;
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const upper = st.part(mid(sh, el));
    rod(upper, st, sh, el, aS + 0.5, aE + 0.5, mine(o.upper, el));
    const fore = st.part(mid(el, hand, 0.6));
    const bell = o.bell ?? 1.3;
    rod(fore, st, el, lerp3(el, hand, bell > 0.5 ? 0.84 : 0.96), aE + 0.5, aW + 0.4 + bell, mine(o.fore, hand));
    const palm = st.part(st.near(hand) + 0.2);
    ball(palm, st, hand, [[aW + 0.6, 0, 0], [0, aW + 0.6, 0], [0, 0, aW + 0.6]], mine(side === 'L' && o.handL ? o.handL : o.hand, hand));
  }
}

/** A point on the skin of the head: `turn` degrees round from the nose (to her left if more than 0), `up` a share of its height from its middle. */
function onFace(c: C, turn: number, up: number, out = 0.97): V3 {
  const a = turn * D;
  return add(c.s.head, add(add(mul(c.hf, Math.cos(a) * c.R[0] * out), mul(c.hl, Math.sin(a) * c.R[1] * out)), mul(c.hu, up * c.R[2])));
}
/** One pixel drawn on the face there, if that side of the head is toward the eye. `dx`: a pixel or two across from it. */
function dotOn(c: C, sheet: Sheet, turn: number, up: number, color: string, dx = 0, dy = 0): void {
  if (!faces(c.st, c.s, turn)) return;
  const [x, y] = c.st.at(onFace(c, turn, up));
  sheet.mark(Math.round(x - 0.5) + dx, Math.round(y - 0.5) + dy, color);
}

/**
 * AS THE FIRST SHEET DREW THEM: each eye two dark pixels and no more, a mouth of one, hair of one
 * flat colour. (The owner asked for a mage "from the original drawing", so that way of drawing
 * is kept, to be set for a picture of it: `plainly`.)
 */
let PLAIN = false;
export function plainly(on: boolean): void {
  PLAIN = on;
}

/**
 * GLOWING EYES (the owner, 6 Oct 2026, 23:45, of the mage in the pointed hat: "gimme A with
 * glowing eyes"): the eyes the heroes have now, two points of light, in a face that is in shadow
 * so that they are seen to glow. Set for a picture of it: `glowing`.
 */
let GLOW = false;
export function glowing(on: boolean): void {
  GLOW = on;
}

/** A hat put on a sketch that has none of its own (the battle mage): the mage's wide brim of before, or the pointed one he chose. Set for a picture: `hatted`. */
let HAT: 'none' | 'brim' | 'point' = 'none';
export function hatted(which: 'none' | 'brim' | 'point'): void {
  HAT = which;
}

/** Two colours mixed: `k` of the second. */
function mix(a: string, b: string, k: number): string {
  const v = (h: string, n: number): number => parseInt(h.slice(1 + n * 2, 3 + n * 2), 16);
  const f = (n: number): string => Math.round(v(a, n) * (1 - k) + v(b, n) * k).toString(16).padStart(2, '0');
  return '#' + f(0) + f(1) + f(2);
}
/** The shine on hair of this colour. */
const shineOf = (ramp: Ramp): string => mix(ramp[3], '#ffffff', 0.55);

/**
 * HAIR ON SOMETHING ROUND (a head, a bun): its colour by the light; A BAND OF SHINE across it
 * where the light falls; and STRANDS, a step darker, every so often round it. (The owner, 6 Oct
 * 2026, 23:33, of the first sheet of mages: "can we do a little better on the faces?  theres
 * really no detail there.  or in the hair".) `f`, `l`, `up`: where on the ball, as a ball's
 * painter is told.
 */
function hairTone(ramp: Ramp, f: number, l: number, up: number, tone: number): string {
  if (PLAIN) return ramp[tone];
  const az = (Math.atan2(l, f) / D + 360) % 360;
  if (tone >= 3 && up > 0.4 && up < 0.7) return shineOf(ramp);
  // (on a head as small as the heroes' are now a strand is every other pixel, and reads as noise: only the shine is drawn there)
  if (HEAD_WIDE >= 3.8 && az % 30 < 7 && up < 0.4) return ramp[Math.max(0, tone - 1)];
  return ramp[tone];
}
/** Half the width of the head being painted (set by `head`): how much detail its hair can hold. */
let HEAD_WIDE = 0;
/** A ball's painter for a ball of hair. */
const hairBall = (ramp: Ramp) => (u: V3, tone: number): string => hairTone(ramp, u[0], u[1], u[2], tone);

/** A streak of shine down a hanging length of hair (a tail, a braid, a lock): along its lit side, from `a` to `b`. */
function streak(c: C, sheet: Sheet, a: V3, b: V3, ramp: Ramp, from = 0.15, to = 0.7): void {
  if (PLAIN) return;
  const [x0, y0] = c.st.at(a);
  const [x1, y1] = c.st.at(b);
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = Math.round(n * from); i <= n * to; i++) sheet.mark(x0 + ((x1 - x0) * i) / n - 1.2, y0 + ((y1 - y0) * i) / n - 0.5, shineOf(ramp));
}

interface HeadLook {
  skin?: R4;
  /** Where on the head there is hair (or a cowl): told how far toward the face, the left and the crown (-1..1 each). */
  hairAt?: (f: number, l: number, up: number) => boolean;
  hair?: Ramp;
  /** Anything else painted on the head's skin: a colour, or nothing for the skin itself. */
  paint?: (f: number, l: number, up: number, tone: number) => string | null | undefined;
  /** No eyes are drawn (the caller draws what is there instead: spectacles, a mask's slots). */
  blind?: boolean;
  /** The pupils: dark if not given. And the colour in the eye, where the head is big enough to show one: the heroes' cyan if not given. */
  pupil?: string;
  iris?: string;
  /** The line over each eye, a lash or a brow: the hair's dark tone if not given; null for none. */
  lash?: string | null;
  /** A touch of colour on the cheek. */
  blush?: boolean;
  /** A patch over the eye that is nearer, and its strap. */
  patch?: boolean;
  /** Paint under each eye: a stripe of this colour. */
  stripes?: string;
  eyeUp?: number;
  /** A mouth: this colour. */
  mouth?: string | null;
  /** Takes this much of the light off the face (under a brim, in a hood). */
  shade?: number;
  /** The head made this much bigger all round (a cowl, a mask worn over it). */
  more?: number;
  neck?: Ramp;
}
/**
 * Where the two eyes are, in degrees round the head from the nose. NOT EVENLY EITHER SIDE OF IT:
 * the eye looks at a figure from half way round to its right, so an eye 30 degrees to the left
 * of the nose is on the very edge of the head as it is seen, and a dark eye there is lost in the
 * line round the head. Both are drawn a little toward the eye, as a face turned three quarters
 * is drawn. (A sketch's cheat, for the one view it is painted for.)
 */
const EYES = [-54, -6];
/** The pixel a point on the face is painted at. */
function pixelOn(c: C, turn: number, up: number): [number, number] {
  const [x, y] = c.st.at(onFace(c, turn, up));
  return [Math.round(x - 0.5), Math.round(y - 0.5)];
}
/** Colour on a cheek: the skin, pinker. */
const BLUSH = '#e89ad0';
/**
 * A FACE, drawn on a head that is already painted. HOW MUCH OF ONE DEPENDS ON HOW BIG THE HEAD
 * IS. On the heroes' heads as they are (nine pixels wide: art/moves3.ts, HEAD_B) there is room
 * for this and no more: each eye a white and a pupil, two pixels by two (the pupil on the side
 * she looks toward), a lash over it; a touch of colour under the nearer eye; a mouth of one
 * pixel. A head a quarter bigger has room for eyes with a colour in them, a nose, and a mouth
 * two pixels wide; one half as big again, for eyes three pixels wide and brows over them.
 */
function features(c: C, sheet: Sheet, o: HeadLook): void {
  const up = o.eyeUp ?? 0.14;
  if (GLOW) {
    // (two points of light, as the heroes' eyes are now: no white, no lash, no mouth: the face is in shadow)
    if (!o.blind) for (const turn of EYES) dotOn(c, sheet, turn, up, GLINT);
    return;
  }
  const eyes = [pixelOn(c, EYES[0], up), pixelOn(c, EYES[1], up)];
  const lash = o.lash === undefined ? (o.hair ? o.hair[1] : INK) : o.lash;
  const size = c.R[1] < 3.8 ? 0 : c.R[1] < 4.5 ? 1 : 2;
  const iris = o.iris ?? CYAN[2];
  const skin = lit(o.skin ?? SKIN4);
  if (!o.blind) {
    for (const [x, y] of eyes) {
      if (o.patch && x === eyes[0][0]) {
        for (let j = -1; j <= 1; j++) for (let i = -1; i <= 0; i++) sheet.mark(x + i, y + j, INK);
        for (let k = 1; k <= 3; k++) sheet.mark(x + k, y - 1 - (k > 1 ? 1 : 0), INK);
        sheet.mark(x - 2, y - 1, INK);
        continue;
      }
      if (PLAIN) {
        // (AS THE FIRST SHEET DREW THEM, and as the owner chose for the mage: "yep a is good". Two dark pixels, one over the other.)
        sheet.mark(x, y, o.pupil ?? INK);
        sheet.mark(x, y + 1, o.pupil ?? INK);
        continue;
      }
      if (size === 0) {
        for (let j = 0; j <= 1; j++) {
          sheet.mark(x - 1, y + j, '#ffffff');
          sheet.mark(x, y + j, o.pupil ?? INK);
        }
        if (lash) for (let i = -1; i <= 0; i++) sheet.mark(x + i, y - 1, lash);
      } else if (size === 1) {
        sheet.mark(x - 1, y, '#ffffff');
        sheet.mark(x, y, o.pupil ?? INK);
        sheet.mark(x - 1, y + 1, '#ffffff');
        sheet.mark(x, y + 1, iris);
        if (lash) for (let i = -1; i <= 0; i++) sheet.mark(x + i, y - 1, lash);
      } else {
        for (let j = 0; j <= 1; j++) {
          sheet.mark(x - 1, y + j, '#ffffff');
          sheet.mark(x, y + j, j === 0 ? o.pupil ?? INK : iris);
          sheet.mark(x + 1, y + j, o.pupil ?? INK);
        }
        if (lash) {
          for (let i = -1; i <= 1; i++) sheet.mark(x + i, y - 1, INK);
          // (a brow over it, a pixel clear of the lash)
          for (let i = -1; i <= 1; i++) sheet.mark(x + i, y - 3, lash);
        }
      }
    }
  }
  const [nx, ny] = eyes[0];
  const [fx] = eyes[1];
  const mx = Math.round((nx + fx) / 2);
  if (o.stripes) for (const [x, y] of eyes) for (let i = -1; i <= 0; i++) sheet.mark(x + i, y + 2, o.stripes);
  if (PLAIN) {
    if (o.mouth) dotOn(c, sheet, -30, -0.52, o.mouth);
    return;
  }
  if (o.blush) {
    sheet.mark(nx - 1, ny + 2, BLUSH);
    if (size > 0) sheet.mark(nx - 2, ny + 2, BLUSH);
  }
  if (size > 0 && !o.blind) sheet.mark(mx + 1, ny + 2, skin[1]);
  if (o.mouth) {
    const y = ny + (size === 0 ? 2 : size === 1 ? 3 : 4);
    sheet.mark(mx, y, o.mouth);
    if (size > 0) sheet.mark(mx + 1, y, o.mouth);
  }
}
function head(c: C, o: HeadLook = {}): Sheet {
  const { st, s, hf, hl, hu, R } = c;
  HEAD_WIDE = R[1];
  const tones = o.skin ?? SKIN4;
  // (a face with glowing eyes is in shadow: every tone of its skin a step darker)
  const skin: Ramp = GLOW ? [tones[0], tones[0], tones[1], tones[2], tones[3]] : lit(tones);
  const sheet = st.part(st.near(s.head) + 0.3);
  rod(sheet, st, s.neck, s.skull, 1.7, 1.7, o.neck ?? skin);
  const k = 1 + (o.more ?? 0);
  ball(sheet, st, s.head, [mul(hf, R[0] * k), mul(hl, R[1] * k), mul(hu, R[2] * k)], (u, tone) => {
    const [f, l, up] = u;
    const p = o.paint ? o.paint(f, l, up, tone) : undefined;
    if (p !== undefined) return p;
    if (o.hairAt && o.hair && o.hairAt(f, l, up)) return hairTone(o.hair, f, l, up, tone);
    return skin[tone];
  }, GLOW ? 0.25 : o.shade ?? 0);
  features(c, sheet, o);
  return sheet;
}

/** How far round the head a place is from the nose, in degrees (0..360: 90 her left ear, 270 her right). */
const roundFrom = (f: number, l: number): number => (Math.atan2(l, f) / D + 360) % 360;
/** A FRINGE: hair that comes down over the brow in locks, cut to two lengths turn about. */
const fringe = (f: number, l: number, up: number): boolean => (PLAIN ? up > 0.62 : up > 0.34 + (Math.floor(roundFrom(f, l) / 26) % 2 === 0 ? 0.14 : 0));
/** Hair that covers the back of the head, its sides and its top, with a parting of skin at the brow. */
const hairline = (f: number, l: number, up: number): boolean => f < 0.08 || Math.abs(l) > 0.88 || fringe(f, l, up);
/** ... drawn back off the face: the top and the back only. */
const drawnBack = (f: number, l: number, up: number): boolean => f < -0.05 || up > 0.7 || (Math.abs(l) > 0.92 && up > -0.1);

/** LONG LOOSE HAIR: it hangs from the head down the back, as wide as the shoulders at its end. What is seen of it from in front, either side of the neck, is its underside. */
function curtain(c: C, ramp: Ramp, drop: number, wide: number): void {
  const { st, s, B, hf, hl, hu, R } = c;
  const [cf, cl] = s.chest;
  // (it begins INSIDE the head, under the head's own hair: a ring of it as big as the head lay in the head's skin, and the two were painted through each other)
  const top: Ring = { c: add(s.head, mul(hu, R[2] * 0.3)), u: mul(hf, R[0] * 0.86), v: mul(hl, R[1] * 0.9) };
  const neck: Ring = { c: add(s.neck, [0, 0, 0.6]), u: mul(cf, R[0] * 1.25), v: mul(cl, R[1] * 1.5) };
  const low: Ring = { c: add(add(s.neck, mul(cf, -1.2)), [0, 0, -drop]), u: mul(cf, B.ribDeep + 1.7), v: mul(cl, wide) };
  cloth(st.part(st.near(s.neck) - 0.3), st, [top, neck, low], ramp, { arc: [68, 292], lining: 0.2, folds: PLAIN ? [180, 130, -130] : [180, 155, -155, 130, -130, 105, -105, 82, -82] });
}
/** A lock of hair in front of each shoulder (or of one: 1 her left, -1 her right). */
function locks(c: C, ramp: Ramp, len = 3.8, which: ReadonlyArray<number> = [1, -1], thick = 1.5, fwd = 0.15): void {
  const { st, s, B, hf, hl, hu, R, mine } = c;
  for (const side of which) {
    // (`fwd`: how far toward the face it leaves the head. Less than nothing, and it is behind the ear and falls over the shoulder's top: clear of her eyes.)
    const a = add(add(s.head, mul(hl, side * R[1] * 0.92)), add(mul(hf, R[0] * fwd), mul(hu, -R[2] * 0.3)));
    const b = off(side > 0 ? s.shoulderL : s.shoulderR, s.chest, B.ribDeep * (fwd < 0 ? 0.15 : 0.6), -side * (fwd < 0 ? 0.6 : 2.2), -len);
    const lock = st.part(mid(a, b));
    rod(lock, st, a, b, thick, thick * 0.7, mine(ramp, b));
    if (side < 0) streak(c, lock, a, b, ramp, 0.2, 0.6);
  }
}
/**
 * TRESSES: long hair brought forward over each shoulder and down the front, from BEHIND THE EARS,
 * so that it frames the face and covers none of it (the owner, 6 Oct 2026, 23:41, of the mage in
 * the pointed hat: "move the hair so i see both eyes"). `len`: how far below the root of the neck
 * they end. `out`: how far off the chest they lie (over whatever is worn on the shoulders).
 */
function tresses(c: C, ramp: Ramp, len: number, out = 2.6, thick = 1.4): void {
  const { st, s, B, hf, hl, hu, R, mine } = c;
  for (const side of [1, -1]) {
    const p0 = add(add(s.head, mul(hl, side * R[1] * 0.97)), add(mul(hf, -R[0] * 0.25), mul(hu, -R[2] * 0.15)));
    const p1 = off(s.neck, s.chest, B.ribDeep * 0.9 + out * 0.5, side * B.shoulderHalf * 0.66, -1.6);
    // (it swells a little over the breast and draws in to its end: hair, not a plank)
    const pm = off(s.neck, s.chest, B.ribDeep + out + 0.5, side * B.ribHalf * 0.98, -len * 0.5);
    const p2 = off(s.neck, s.chest, B.ribDeep + out - 0.4, side * B.ribHalf * 0.72, -len);
    const part = st.part(mid(p1, p2));
    const col = mine(ramp, p2);
    rod(part, st, p0, p1, thick * 0.9, thick, col);
    rod(part, st, p1, pm, thick, thick * 0.92, col);
    rod(part, st, pm, p2, thick * 0.92, thick * 0.35, col);
    if (side < 0) streak(c, part, p1, pm, ramp, 0.1, 0.9);
  }
}
/** A rope of hair down the back. */
function rope(c: C, ramp: Ramp, len = 8.5): void {
  const { st, s, B, R } = c;
  const nape = off(s.head, s.face, -R[0] * 0.7, 0, -R[2] * 0.25);
  const back = off(s.neck, s.chest, -B.ribDeep - 1.5, 0, -4.2);
  const end = add(add(back, [0, 0, -len]), mul(s.chest[0], -1.2));
  const part = st.part(back);
  rod(part, st, nape, back, 3.1, 2.5, ramp);
  rod(part, st, back, end, 2.3, 1.1, ramp);
  streak(c, part, back, end, ramp);
}
/** A knot of hair on the crown, toward the back. */
function bun(c: C, ramp: Ramp, r = 2.5): V3 {
  const { st, s, hf, hu, R } = c;
  const at = add(s.head, add(mul(hu, R[2] * 0.98), mul(hf, -R[0] * 0.5)));
  ball(st.part(st.near(at) + 0.2), st, at, [mul(hf, r), mul(c.hl, r), mul(hu, r * 0.9)], hairBall(ramp));
  return at;
}
/** A tail of hair tied high on the back of the head: up and out, then down. */
function pony(c: C, ramp: Ramp, len = 10): void {
  const { st, s, hf, hu, R } = c;
  const a = add(s.head, add(mul(hu, R[2] * 0.8), mul(hf, -R[0] * 0.6)));
  const b = add(a, add(mul(hu, 2.6), mul(hf, -2.8)));
  const e = add(add(b, [0, 0, -len]), mul(hf, -2.2));
  const part = st.part(b);
  rod(part, st, a, b, 1.9, 2.1, ramp);
  rod(part, st, b, lerp3(b, e, 0.55), 2.1, 1.7, ramp);
  rod(part, st, lerp3(b, e, 0.55), e, 1.7, 0.7, ramp);
  streak(c, part, b, e, ramp, 0.1, 0.6);
  ball(st.part(st.near(a) + 0.4), st, lerp3(a, b, 0.45), [mul(hf, 1.5), mul(c.hl, 1.5), mul(hu, 1.0)], CYAN);
}
/** A braid in front of a shoulder, tied at its end. */
function braid(c: C, ramp: Ramp, side: number, len = 9): void {
  const { st, s, B, hf, hl, hu, R, mine } = c;
  // (it leaves her head BEHIND THE EAR, so that it is not across her eye: he asked that of the mage's hair, "move the hair so i see both eyes")
  const a = add(add(s.head, mul(hl, side * R[1] * 0.97)), add(mul(hf, -R[0] * 0.3), mul(hu, -R[2] * 0.2)));
  const b = off(side > 0 ? s.shoulderL : s.shoulderR, s.chest, B.ribDeep * 0.9, -side * 2.4, -len);
  const part = st.part(mid(a, b));
  rod(part, st, a, b, 1.6, 1.3, mine(ramp, b));
  // (its plaits: a darker pixel every third one down it)
  const [x0, y0] = st.at(a);
  const [x1, y1] = st.at(b);
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
  for (let i = 3; i < n - 1; i += 3) part.mark(x0 + ((x1 - x0) * i) / n - 0.5, y0 + ((y1 - y0) * i) / n - 0.5, ramp[1]);
  const tie = st.part(st.near(b) + 0.3);
  ball(tie, st, b, [[1.5, 0, 0], [0, 1.5, 0], [0, 0, 1.0]], CYAN);
}

/** The lines of something worn on a head: tipped from the eye by `deg` (art/skin.ts, TIPPED). */
function worn(c: C, deg: number): readonly [V3, V3, V3] {
  const U = tippedFrom(c.st, c.hu, deg);
  const F = norm(sub(c.hf, mul(U, dot(c.hf, U))), c.hf);
  return [F, cross(U, F), U];
}

/** A WIDE-BRIMMED HAT: a plate and a low round crown, a band of light round it. */
function brimHat(c: C, ramp: Ramp, o: { wide: number; tip: number; crown?: number }): { C0: V3; F: V3; L: V3; U: V3 } {
  const { st, s, hu, R, B } = c;
  const [F, L, U] = worn(c, o.tip);
  const hat = st.part(st.near(s.head) + 0.8);
  const C0 = add(s.head, mul(hu, R[2] * 0.82));
  const wide = o.wide * B.tall;
  ball(hat, st, C0, [mul(F, wide), mul(L, wide), mul(U, 1.0)], ramp);
  const crown: Ring = { c: add(C0, mul(U, 0.9)), u: mul(F, R[0] * 1.42), v: mul(L, R[1] * 1.62) };
  ball(hat, st, add(C0, mul(U, R[2] * 0.45)), [crown.u, crown.v, mul(U, R[2] * (o.crown ?? 1.0))], ramp);
  band(hat, st, crown, CYAN, 2, 0.5);
  return { C0, F, L, U };
}

/** A POINTED HAT: a brim, and a tall cone whose tip has fallen over backward. */
function pointHat(c: C, ramp: Ramp, o: { wide: number; tall: number; bend: number; tip?: number }): void {
  const { st, s, hu, R, B } = c;
  const [F, L, U] = worn(c, o.tip ?? 22);
  const hat = st.part(st.near(s.head) + 0.8);
  const C0 = add(s.head, mul(hu, R[2] * 0.82));
  const wide = o.wide * B.tall;
  ball(hat, st, C0, [mul(F, wide), mul(L, wide), mul(U, 1.0)], ramp);
  const base: Ring = { c: add(C0, mul(U, 0.9)), u: mul(F, R[0] * 1.36), v: mul(L, R[1] * 1.56) };
  const waist: Ring = { c: add(C0, add(mul(U, o.tall * 0.5), mul(F, -o.bend * 0.2))), u: mul(F, R[0] * 0.8), v: mul(L, R[1] * 0.9) };
  const neck: Ring = { c: add(C0, add(mul(U, o.tall * 0.82), mul(F, -o.bend * 0.55))), u: mul(F, R[0] * 0.42), v: mul(L, R[1] * 0.46) };
  const tip: Ring = { c: add(C0, add(mul(U, o.tall * 0.92), mul(F, -o.bend * 1.25))), u: mul(F, 0.4), v: mul(L, 0.4) };
  cloth(hat, st, [tip, neck, waist, base], ramp, { lift: 0.35 });
  band(hat, st, base, CYAN, 2, 0.5);
}

/**
 * A HOOD: a shell round the head, bigger than it and further back, open where the face is; and
 * the dark inside it, behind the face. `size`: 1 a deep hood, less a close cowl.
 */
function hood(c: C, ramp: Ramp, size = 1, peak = 0): void {
  const { st, s, hf, hl, hu, R } = c;
  const hc = add(s.head, add(mul(hf, -R[0] * 0.3 * size), mul(hu, R[2] * 0.1)));
  const axes: readonly [V3, V3, V3] = [mul(hf, R[0] * (1.12 + 0.36 * size)), mul(hl, R[1] * (1.2 + 0.32 * size)), mul(hu, R[2] * (1.12 + 0.28 * size))];
  const inside = st.part(st.near(s.head) - 0.6);
  ball(inside, st, hc, [mul(axes[0], 0.94), mul(axes[1], 0.94), mul(axes[2], 0.94)], [INK, INK, INK, ramp[0], ramp[0]]);
  // (it is the back of the hood, seen through its opening: behind the face, whatever its own skin says)
  inside.z.fill(NaN);
  const shell = st.part(st.near(s.head) + 0.7);
  ball(shell, st, hc, axes, (u, tone) => {
    const [f, l, up] = u;
    if (f > 0.16 && (l * l) / 0.8 + ((up + 0.1) * (up + 0.1)) / 0.66 < 1) return null;
    return ramp[tone];
  });
  if (peak > 0) {
    // (its point, hanging down behind)
    const a = add(hc, add(mul(hf, -axes[0][0] * 0 - R[0] * 1.1), mul(hu, R[2] * 0.9)));
    const b = add(a, add(mul(hf, -peak * 0.6), [0, 0, -peak]));
    rod(st.part(a), st, a, b, 2.0, 0.6, ramp);
  }
}

/** Cloth over both shoulders, all the way round: a capelet, a shawl. It hangs `drop` below the root of the neck and stands `out` beyond the shoulders there. */
function mantle(c: C, ramp: Ramp, o: { drop: number; out?: number; hem?: Ramp; ragged?: boolean; folds?: number[] }): void {
  const { st, s, B } = c;
  const [cf, cl, cu] = s.chest;
  const aS = B.armR[0];
  const out = o.out ?? 0;
  const top: Ring = { c: add(s.neck, mul(cu, 0.4)), u: mul(cf, B.ribDeep * 0.85), v: mul(cl, 2.7) };
  const shoulders: Ring = { c: add(s.neck, mul(cu, -1.3)), u: mul(cf, B.ribDeep + 1.5), v: mul(cl, B.shoulderHalf + aS + 0.7) };
  const hem: Ring = { c: add(s.neck, mul(cu, -o.drop)), u: mul(cf, B.ribDeep + 1.7 + out), v: mul(cl, B.shoulderHalf + aS + 1.0 + out) };
  cloth(st.part(st.near(s.neck) + 0.1), st, [top, shoulders, hem], ramp, { hem: o.hem, ragged: o.ragged, folds: o.folds ?? [35, -35, 150, -150] });
}

/** A collar that stands up behind the head, from shoulder to shoulder. */
function collar(c: C, ramp: Ramp, high: number, wide: number): void {
  const { st, s, B } = c;
  const [cf, cl, cu] = s.chest;
  const low: Ring = { c: add(s.neck, mul(cu, -0.8)), u: mul(cf, B.ribDeep + 0.9), v: mul(cl, B.shoulderHalf * 0.8) };
  const top: Ring = { c: add(add(s.neck, mul(cu, high)), mul(cf, -0.8)), u: mul(cf, B.ribDeep + 2.4), v: mul(cl, wide) };
  cloth(st.part(st.near(s.neck) - 0.4), st, [top, low], ramp, { arc: [72, 288], lining: 0.18 });
}

/** A cloak down the back, from the shoulders to `floor` above the ground. */
function cloak(c: C, ramp: Ramp, floor: number, wide: number): void {
  const { st, s, B } = c;
  const f = norm([s.chest[0][0], s.chest[0][1], 0], [1, 0, 0]);
  const l = norm([s.chest[1][0], s.chest[1][1], 0], [0, 1, 0]);
  const full = B.shoulderHalf + B.armR[0] + 0.9;
  const top: Ring = { c: add(s.neck, mul(s.chest[2], 0.2)), u: mul(f, B.ribDeep + 1.6), v: mul(l, full) };
  const middle: Ring = { c: add(mid(s.waist, s.ribs), mul(f, -0.9)), u: mul(f, B.ribDeep + 2.8), v: mul(l, full + 0.8) };
  const low: V3 = [s.pelvis[0] - f[0] * 2.4, s.pelvis[1] - f[1] * 2.4, floor];
  const hem: Ring = { c: low, u: mul(f, B.pelvisDeep + 3.6), v: mul(l, wide) };
  cloth(st.part(mid(s.ribs, low)), st, [top, middle, hem], ramp, { folds: [180, 140, -140, 112, -112], arc: [98, 262], lining: 0.35 });
}

/** A bag (or a book) on her left hip, outside the skirt, and its strap across her. */
function satchel(c: C, body: Sheet, bookLike = false): void {
  const { st, s, B, trunk, fromBehind } = c;
  const bag = off(s.hipL, s.hips, 2.6, B.pelvisHalf * 0.55 + 5.4, -3.2);
  const layer = st.part(st.near(bag) + 1.5);
  if (bookLike) {
    ball(layer, st, bag, [mul(s.hips[0], 3.4), mul(s.hips[1], 1.5), [0, 0, 4.2]], PLUM);
    const [bx, by] = st.at(bag);
    for (let j = -3; j <= 3; j++) layer.mark(Math.round(bx) + 3, Math.round(by) + j, WHITE[3]);
    layer.mark(Math.round(bx), Math.round(by), CYAN[3]);
    layer.mark(Math.round(bx) - 1, Math.round(by), CYAN[2]);
  } else {
    ball(layer, st, bag, [mul(s.hips[0], 3.9), mul(s.hips[1], 2.7), [0, 0, 3.7]], PLUM);
    const [bx, by] = st.at(add(bag, [0, 0, 1.2]));
    for (let i = -2; i <= 1; i++) layer.mark(Math.round(bx) + i, Math.round(by), PLUM[3]);
    layer.mark(Math.round(bx), Math.round(by) + 2, CYAN[3]);
  }
  const top = off(s.shoulderR, s.chest, 0, 2.4, 1.2);
  const mids = fromBehind ? off(trunk[0].c, s.chest, -B.ribDeep - 0.6, 0, 0) : off(trunk[0].c, s.chest, B.ribDeep + 0.6, 0, 0);
  for (const [a, b] of [[top, mids], [mids, add(bag, [0, 0, 3])]] as [V3, V3][]) {
    const [x0, y0] = st.at(a);
    const [x1, y1] = st.at(b);
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (let i = 0; i <= n; i++) {
      const x = Math.round(x0 + ((x1 - x0) * i) / n - 0.5);
      const y = Math.round(y0 + ((y1 - y0) * i) / n - 0.5);
      body.mark(x, y, PLUM[1]);
      body.mark(x + 1, y, PLUM[2]);
    }
  }
}

// ---------------------------------------------------------------------------------------------
// The staff, and what is at its head

/** A cut crystal: `half` wide and `long` long (each a half-length, in picture pixels), long the way `dir` points on the screen. */
function gem(c: C, at: V3, half = 3.2, long = 6.4, dir: V3 | null = null): void {
  const { st, s } = c;
  const [tx, ty] = st.at(at);
  const d = st.seen(dir ?? s.point);
  const ul = Math.hypot(d[0], d[1]) || 1;
  const ux = d[0] / ul;
  const uy = d[1] / ul;
  const sheet = st.part(st.near(at) + 0.6);
  for (let y = Math.floor(ty - long - 2); y <= Math.ceil(ty + long + 2); y++) {
    for (let x = Math.floor(tx - long - 2); x <= Math.ceil(tx + long + 2); x++) {
      const dx = x + 0.5 - tx;
      const dy = y + 0.5 - ty;
      const a = -dx * uy + dy * ux;
      const b = dx * ux + dy * uy;
      if (Math.abs(a) / half + Math.abs(b) / long > 1) continue;
      sheet.put(x, y, dx < 0 ? (dy < 0 ? '#ffffff' : SPARK[3]) : dy < 0 ? SPARK[3] : SPARK[2], st.near(at) + 0.6);
    }
  }
}
/** A ball of light. */
function orb(c: C, at: V3, r: number): void {
  ball(c.st.part(c.st.near(at) + 0.6), c.st, at, [[r, 0, 0], [0, r, 0], [0, 0, r]], (u, tone) => (tone >= 3 ? '#ffffff' : tone === 2 ? SPARK[3] : SPARK[2]));
}

export type StaffHead = 'fork' | 'crescent' | 'ring' | 'eye' | 'orb' | 'crook' | 'star' | 'cluster' | 'spear';

function staff(c: C, kind: StaffHead, wood: Ramp = INDIGO, metal: Ramp = STEEL): void {
  const { st, s } = c;
  const p3 = s.point;
  // (what is at its head is turned to the eye: a ring seen edge on is a line)
  const side = norm(cross(p3, st.eye), s.across);
  const foot = add(s.handR, mul(p3, -STAFF_DOWN));
  const top = add(s.handR, mul(p3, STAFF_UP));
  const neck = add(s.handR, mul(p3, STAFF_UP - 5.5));
  const pole = st.part(mid(foot, top, 0.55));
  /** Rods along an arc about `o`: from `a0` to `a1` degrees, 0 being down the staff and 90 out to the side. */
  const arc = (o: V3, r: number, a0: number, a1: number, thick: (k: number) => number, ramp: Ramp, n = 12): V3 => {
    let last: V3 | null = null;
    for (let i = 0; i <= n; i++) {
      const k = i / n;
      const a = (a0 + (a1 - a0) * k) * D;
      const p = add(o, add(mul(p3, -Math.cos(a) * r), mul(side, Math.sin(a) * r)));
      if (last) rod(pole, st, last, p, thick((i - 1) / n), thick(k), ramp);
      last = p;
    }
    return last as V3;
  };
  switch (kind) {
    case 'fork': {
      rod(pole, st, foot, neck, 1.05, 1.05, wood);
      for (const k of [-1, 1]) {
        const out = add(neck, add(mul(p3, 3.2), mul(s.across, k * 2.6)));
        rod(pole, st, neck, out, 0.9, 0.8, wood);
        rod(pole, st, out, add(out, mul(p3, 2.4)), 0.8, 0.6, wood);
      }
      gem(c, top);
      break;
    }
    case 'crescent': {
      rod(pole, st, foot, add(top, mul(p3, -4.6)), 1.05, 1.05, wood);
      arc(top, 4.6, -138, 138, (k) => 1.35 - 1.0 * Math.abs(2 * k - 1), metal, 14);
      gem(c, add(top, mul(p3, 0.6)), 1.9, 3.2);
      break;
    }
    case 'ring':
    case 'eye': {
      rod(pole, st, foot, add(top, mul(p3, -4.2)), 1.05, 1.05, wood);
      arc(top, 4.2, 0, 360, () => 0.85, metal, 16);
      if (kind === 'eye') gem(c, top, 1.5, 3.9);
      else gem(c, top, 2.0, 2.6);
      break;
    }
    case 'orb': {
      const at = add(top, mul(p3, -1));
      rod(pole, st, foot, add(at, mul(p3, -3.2)), 1.05, 1.05, wood);
      for (const k of [-1, 1]) rod(pole, st, add(at, mul(p3, -3.6)), add(at, add(mul(p3, -0.6), mul(side, k * 3.3))), 0.9, 0.6, metal);
      orb(c, at, 3.3);
      break;
    }
    case 'crook': {
      rod(pole, st, foot, neck, 1.05, 1.05, wood);
      // (the curl: up from the pole's end, over, and down again inside itself; it curls AWAY from her head, which is beside it)
      const o = add(neck, mul(side, -3.3));
      const end = arc(o, 3.3, 90, 335, (k) => 1.05 - 0.45 * k, wood, 12);
      const hang = add(end, [0, 0, -3.4]);
      thread(pole, st, end, hang, CYAN[2], 0.4);
      gem(c, add(hang, [0, 0, -1.6]), 1.9, 2.8, [0, 0, 1]);
      break;
    }
    case 'star': {
      rod(pole, st, foot, add(top, mul(p3, -5)), 1.05, 1.05, wood);
      gem(c, top, 2.0, 7.0);
      gem(c, top, 2.0, 5.2, side);
      break;
    }
    case 'cluster': {
      rod(pole, st, foot, add(neck, mul(p3, 1.5)), 1.05, 1.05, wood);
      for (const k of [-1, 1]) gem(c, add(top, add(mul(p3, -2.6), mul(side, k * 3.1))), 1.9, 4.2, add(p3, mul(side, k * 0.55)));
      gem(c, add(top, mul(p3, 0.4)), 2.7, 6.6);
      break;
    }
    case 'spear': {
      rod(pole, st, foot, neck, 1.05, 1.05, wood);
      rod(pole, st, add(neck, mul(side, -3)), add(neck, mul(side, 3)), 0.9, 0.9, metal);
      gem(c, add(top, mul(p3, 1.2)), 2.3, 8.4);
      break;
    }
  }
}

// ---------------------------------------------------------------------------------------------
// TEN MAGES

export interface MageOption {
  name: string;
  paint: (c: C) => void;
}

/** A long skirt to just off the floor, and the legs hidden in it. */
function longSkirt(c: C, ramp: Ramp, wide: number, deep: number, hem: Ramp = CYAN, hose: Ramp = MAIL, boot: Ramp = PLUM): Ring[] {
  const { B } = c;
  const under = legs(c, hose, boot);
  const hipH = B.ankle + B.shank + B.thigh;
  const sk = skirt(c, ramp, { drop: hipH - 2.4, wide, deep, hem });
  hidden(under, sk.sheet);
  return sk.rings;
}

export const MAGES: MageOption[] = [
  {
    name: 'Wide brim, face shown',
    paint: (c) => {
      longSkirt(c, ROBE, 5.8, 4.8);
      const body = bodice(c, ROBE);
      seam(c, body, CYAN[2]);
      belt(c, PLUM);
      satchel(c, body);
      curtain(c, PLUM, 13, c.B.shoulderHalf + 1.2);
      arms(c, { upper: ROBE, fore: ROBE, hand: lit(SKIN4) });
      // (the scarf: round her neck, under her chin)
      const [cf, cl] = c.s.chest;
      ball(c.st.part(c.st.near(c.s.neck) + 0.5), c.st, add(lerp3(c.s.neck, c.s.head, 0.12), mul(cf, 0.4)), [mul(cf, 3.5), mul(cl, 4.4), mul(c.hu, 1.9)], TEAL);
      head(c, { hairAt: hairline, hair: PLUM, mouth: PINK[2], blush: true });
      locks(c, PLUM);
      const h = brimHat(c, ROBE, { wide: 0.235, tip: 32 });
      // (the feather in its band: a sweep of light, up and back)
      const q0 = add(add(h.C0, mul(h.U, c.R[2] * 0.5)), add(mul(h.F, -c.R[0] * 0.3), mul(h.L, c.R[1] * 1.3)));
      const q1 = add(q0, add(mul(h.U, 9), add(mul(h.F, -2.5), mul(h.L, 4.5))));
      const q2 = add(q1, add(mul(h.U, 3.5), add(mul(h.F, -6.5), mul(h.L, 3.5))));
      const plume = c.st.part(c.st.near(q1) + 1);
      rod(plume, c.st, q0, q1, 0.9, 1.5, CYAN);
      rod(plume, c.st, q1, q2, 1.5, 0.6, CYAN);
      staff(c, 'fork');
    },
  },
  {
    name: 'Pointed hat, brown hair',
    paint: (c) => {
      longSkirt(c, ROBE, 6.6, 5.4, CYAN, MAIL, NIGHT);
      bodice(c, NIGHT);
      belt(c, PLUM);
      curtain(c, BROWN, 6, c.B.shoulderHalf + 0.6);
      arms(c, { upper: NIGHT, fore: ROBE, hand: lit(SKIN4) });
      mantle(c, NIGHT, { drop: 5.2, hem: CYAN });
      // (no hair on her temples: the eye that is nearer her hair has skin beside it, and is seen)
      head(c, { hairAt: (f, l, up) => f < 0.0 || fringe(f, l, up), hair: BROWN, mouth: PINK[2], blush: true, iris: BROWN[0] });
      tresses(c, BROWN, 12.5);
      pointHat(c, ROBE, { wide: 0.19, tall: 15, bend: 4.5 });
      staff(c, 'crescent');
    },
  },
  {
    name: 'Deep hood and cloak',
    paint: (c) => {
      cloak(c, INDIGO, 2.5, c.B.pelvisHalf + 6.5);
      longSkirt(c, ROBE, 4.4, 3.8);
      const body = bodice(c, ROBE);
      seam(c, body, CYAN[2]);
      belt(c, PLUM);
      arms(c, { upper: ROBE, fore: ROBE, hand: lit(SKIN4) });
      mantle(c, INDIGO, { drop: 4.6, folds: [150, -150] });
      head(c, { mouth: PINK[2], shade: 0.12, blush: true, lash: WINE[1] });
      locks(c, WINE, 5.5, [1, -1], 1.3);
      hood(c, INDIGO, 1, 0);
      // (the clasp at her throat)
      const clasp = c.st.at(off(c.s.neck, c.s.chest, c.B.ribDeep + 1.4, 0, -1.6));
      c.st.over.set(Math.round(clasp[0]), Math.round(clasp[1]), CYAN[3]);
      staff(c, 'crook');
    },
  },
  {
    name: 'Circlet, high collar, red tail',
    paint: (c) => {
      collar(c, INDIGO, 8.5, c.B.shoulderHalf + 2.6);
      longSkirt(c, ROBE, 5.0, 4.2);
      const body = bodice(c, ROBE);
      seam(c, body, CYAN[2]);
      belt(c, WINE);
      arms(c, { upper: ROBE, fore: PLUM, hand: PLUM, bell: 0.2 });
      // (the points of her shoulders)
      for (const sh of [c.s.shoulderL, c.s.shoulderR]) ball(c.st.part(c.st.near(sh) + 0.5), c.st, add(sh, [0, 0, 0.9]), [mul(c.s.chest[0], 3.2), mul(c.s.chest[1], 3.4), mul(c.s.chest[2], 2.3)], c.mine(INDIGO, sh));
      const hd = head(c, { hairAt: drawnBack, hair: WINE, mouth: PINK[2], blush: true });
      for (let turn = -75; turn <= 75; turn += 7) dotOn(c, hd, turn, 0.5, turn === -5 ? '#ffffff' : CYAN[2]);
      pony(c, WINE, 12);
      staff(c, 'ring');
    },
  },
  {
    name: 'Scholar: spectacles and a bun',
    paint: (c) => {
      longSkirt(c, ROBE, 5.2, 4.4);
      const body = bodice(c, ROBE);
      belt(c, PLUM);
      satchel(c, body, true);
      arms(c, { upper: ROBE, fore: ROBE, hand: lit(SKIN4) });
      mantle(c, TEAL, { drop: 5.6, hem: CYAN });
      const hd = head(c, { hairAt: drawnBack, hair: PLUM, blind: true, mouth: PLUM[2] });
      // (her spectacles: two round panes of light, and the bridge between them)
      for (const turn of EYES) {
        dotOn(c, hd, turn, 0.14, '#ffffff');
        dotOn(c, hd, turn, 0.14, CYAN[2], 0, 1);
      }
      dotOn(c, hd, (EYES[0] + EYES[1]) / 2, 0.16, INK);
      const knot = bun(c, PLUM, 2.6);
      // (a quill through it)
      thread(c.st.part(c.st.near(knot) + 1), c.st, add(knot, add(mul(c.hl, 3.6), [0, 0, 2.6])), add(knot, add(mul(c.hl, -3.4), [0, 0, -1.6])), '#ffffff', 0.5);
      staff(c, 'orb');
    },
  },
  {
    name: 'Seer: bound eyes, a halo',
    paint: (c) => {
      longSkirt(c, WHITE, 4.6, 3.9, CYAN);
      bodice(c, WHITE);
      belt(c, ROBE, CYAN, 3);
      // (the end of her sash, hanging down her front)
      {
        const a = off(c.s.waist, c.s.hips, c.B.waistDeep + 1.4, -1.2, 0);
        rod(c.st.part(c.st.near(a) + 0.4), c.st, a, add(a, [0.6, 0, -11]), 1.5, 1.2, ROBE);
      }
      curtain(c, NIGHT, 20, c.B.shoulderHalf + 1.0);
      arms(c, { upper: WHITE, fore: WHITE, hand: lit(SKIN4) });
      head(c, {
        hairAt: hairline,
        hair: NIGHT,
        blind: true,
        mouth: PINK[2],
        paint: (f, l, up, tone) => (f > -0.1 && up > -0.12 && up < 0.3 ? ROBE[Math.max(1, tone)] : undefined),
      });
      locks(c, NIGHT, 8);
      // (the one eye she sees with, on the cloth)
      const eye = c.st.at(onFace(c, 0, 0.1, 1.0));
      c.st.over.set(Math.round(eye[0] - 0.5), Math.round(eye[1] - 0.5), GLINT);
      // (the halo: a ring of light behind her head)
      const [hx, hy] = c.st.at(add(c.s.head, mul(c.hu, c.R[2] * 0.25)));
      for (let i = 0; i < 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        c.st.under.set(Math.round(hx + Math.cos(a) * 9.5), Math.round(hy + Math.sin(a) * 9.5), i % 9 === 0 ? '#ffffff' : CYAN[2]);
      }
      staff(c, 'star', INDIGO);
    },
  },
  {
    name: 'Jacket, trousers and a half cape',
    paint: (c) => {
      const { B } = c;
      const hipH = B.ankle + B.shank + B.thigh;
      cloak(c, TEAL, hipH * 0.42, B.pelvisHalf + 4.6);
      legs(c, MAIL, PLUM, true);
      // (the jacket's skirt: a short one, to the top of the thigh)
      skirt(c, ROBE, { drop: B.thigh * 0.3, wide: 2.6, deep: 2.4, hem: CYAN, folds: [0, 180] });
      const body = bodice(c, ROBE, 0.6, MAIL);
      seam(c, body, CYAN[2]);
      belt(c, PLUM);
      arms(c, { upper: ROBE, fore: PLUM, hand: PLUM, handL: CYAN, bell: 0.3 });
      // (a bob: hair to the jaw all round, a fringe over the brow)
      const { st, s, hf, hl, hu, R } = c;
      ball(st.part(st.near(s.head) - 0.2), st, add(s.head, add(mul(hf, -R[0] * 0.3), mul(hu, -R[2] * 0.18))), [mul(hf, R[0] * 1.0), mul(hl, R[1] * 1.32), mul(hu, R[2] * 0.98)], hairBall(TEAL));
      head(c, { hairAt: (f, l, up) => f < 0.02 || Math.abs(l) > 0.86 || fringe(f, l, up), hair: TEAL, mouth: PINK[2], blush: true });
      staff(c, 'cluster');
    },
  },
  {
    name: 'White mask and cowl',
    paint: (c) => {
      longSkirt(c, NIGHT, 5.0, 4.2, CYAN, MAIL, NIGHT);
      const body = bodice(c, NIGHT);
      seam(c, body, CYAN[2]);
      belt(c, ROBE);
      arms(c, { upper: NIGHT, fore: NIGHT, hand: ROBE });
      mantle(c, ROBE, { drop: 6.6, hem: CYAN, out: 0.6 });
      // (the mask: the whole face, white and smooth, two dark slots for her eyes, a mark of light on its brow)
      const hd = head(c, { blind: true, paint: (f, l, up, tone) => (f > -0.22 ? WHITE[Math.max(2, tone)] : NIGHT[tone]), neck: NIGHT, more: 0.06 });
      for (const turn of EYES) {
        dotOn(c, hd, turn, 0.16, INK);
        dotOn(c, hd, turn, 0.16, INK, 1, 0);
      }
      dotOn(c, hd, -4, 0.55, CYAN[2]);
      dotOn(c, hd, -4, 0.55, CYAN[2], 0, -1);
      hood(c, NIGHT, 0.3);
      staff(c, 'eye');
    },
  },
  {
    name: 'Battle mage: braids, short robe',
    paint: (c) => {
      const { B } = c;
      legs(c, MAIL, PLUM, true);
      skirt(c, ROBE, { drop: B.thigh * 0.72, wide: 3.6, deep: 3.2, hem: CYAN, folds: [0, 180, 90, -90] });
      const body = bodice(c, ROBE, 0.6, MAIL);
      seam(c, body, CYAN[2]);
      // (A BELT THAT IS SEEN: brown leather, broad, a buckle of light. The owner, 7 Oct 2026, 00:11: "and a belt". The first one was plum on purple, and lost.)
      belt(c, HAT === 'none' ? PLUM : BROWN, CYAN, HAT === 'none' ? 3 : 4);
      // (a pouch on the belt)
      {
        const at = off(c.s.hipR, c.s.hips, 1.4, -c.B.pelvisHalf * 0.5 - 3.6, 1.6);
        ball(c.st.part(c.st.near(at) + 1.2), c.st, at, [[2.2, 0, 0], [0, 1.8, 0], [0, 0, 2.2]], PLUM);
      }
      arms(c, { upper: ROBE, fore: STEEL, hand: PLUM, bell: 0.35 });
      mantle(c, TEAL, { drop: 4.4, ragged: true });
      const hd = head(c, { hairAt: HAT === 'none' ? hairline : (f, l, up) => f < 0.0 || fringe(f, l, up), hair: PINK, mouth: PINK[1], blush: true });
      if (HAT === 'none') band(hd, c.st, { c: add(c.s.head, mul(c.hu, c.R[2] * 0.48)), u: mul(c.hf, c.R[0] * 0.9), v: mul(c.hl, c.R[1] * 0.9) }, CYAN, 1, 0.3);
      braid(c, PINK, 1);
      braid(c, PINK, -1);
      // (THE SAME WOMAN IN ONE OF THE MAGE'S HATS: the owner, 7 Oct 2026, 00:10: "can i see the battle mage with the original hat?")
      if (HAT === 'brim') {
        // (the hat the mage had until the night of 6 Oct: its brim as wide as it was, 0.268 of her height, tipped as it was, and the feather in its band)
        const h = brimHat(c, ROBE, { wide: 0.268, tip: 20 });
        const q0 = add(add(h.C0, mul(h.U, c.R[2] * 0.5)), add(mul(h.F, -c.R[0] * 0.3), mul(h.L, c.R[1] * 1.3)));
        const q1 = add(q0, add(mul(h.U, 9), add(mul(h.F, -2.5), mul(h.L, 4.5))));
        const q2 = add(q1, add(mul(h.U, 3.5), add(mul(h.F, -6.5), mul(h.L, 3.5))));
        const plume = c.st.part(c.st.near(q1) + 1);
        rod(plume, c.st, q0, q1, 0.9, 1.5, CYAN);
        rod(plume, c.st, q1, q2, 1.5, 0.6, CYAN);
      }
      if (HAT === 'point') pointHat(c, ROBE, { wide: 0.19, tall: 15, bend: 4.5 });
      staff(c, 'spear');
    },
  },
  {
    name: 'Elder: white bun, a shawl',
    paint: (c) => {
      longSkirt(c, INDIGO, 5.4, 4.6);
      bodice(c, INDIGO);
      belt(c, PLUM, null);
      arms(c, { upper: INDIGO, fore: INDIGO, hand: lit(SKIN4) });
      mantle(c, PLUM, { drop: 8.4, ragged: true, out: 0.8, folds: [20, -20, 150, -150, 90, -90] });
      const hd = head(c, { hairAt: drawnBack, hair: WHITE, mouth: PLUM[2] });
      // (white brows)
      for (const turn of EYES) dotOn(c, hd, turn, 0.14, WHITE[4], 0, -1);
      bun(c, WHITE, 2.7);
      staff(c, 'crook', PLUM);
    },
  },
];

/** One of the ten mages, standing as the figure given stands. */
export function paintMageOption(k: number, s: Skeleton, q: Posed, view: GameView, B: Build): Painted {
  const st = stage(view);
  MAGES[k].paint(ctxOf(st, s, q, B));
  return { px: st.whole(FRIEND_RIM), lights: [], tails: [] };
}

// ---------------------------------------------------------------------------------------------
// HEADS: ten faces for the ranger, ten full-face helmets for the knight

export interface HeadOption {
  name: string;
  paint: HeadPainter;
}

/** The ranger's own cap (art/hero3_ranger.ts: wide and soft, low at the back), and where its feather is fixed. `lift`: sat this much higher on his head, to show more of his face. */
function rangerCap(c: C, ramp: Ramp = TEAL, lift = 0): TailRoot {
  const { st, s, hu, R } = c;
  const cap = st.part(st.near(s.head) + 0.7);
  const [wf0, , wu0] = wornOn(st, s);
  const slump = Math.max(0, Math.min(1, (Math.acos(Math.max(-1, Math.min(1, hu[2]))) / D - 12) / 38));
  const wu = norm(add(mul(wu0, 1 - 0.65 * slump), [0, 0, 0.65 * slump]), wu0);
  const wf = norm(sub(wf0, mul(wu, dot(wf0, wu))), wf0);
  const wl = cross(wu, wf);
  const capC = add(add(s.head, mul(hu, R[2] * (0.74 + lift - 0.12 * slump))), mul(wf, -R[0] * (0.1 + 0.25 * slump)));
  ball(cap, st, capC, [mul(wf, R[0] * (1.42 - 0.22 * slump)), mul(wl, R[1] * (1.8 - 0.4 * slump)), mul(wu, R[2] * 0.56)], ramp);
  ball(cap, st, add(add(capC, add(mul(wf, -R[0] * 0.85), mul(wl, -R[1] * 1.1))), [0, 0, -1.6]), [mul(wf, R[0] * 0.95), mul(wl, R[1] * 1.05), [0, 0, R[2] * 0.62]], ramp);
  band(cap, st, { c: add(capC, mul(wu, -R[2] * 0.26)), u: mul(wf, R[0] * 1.33), v: mul(wl, R[1] * 1.7) }, dim(ramp), 1, 0.2);
  const quill = st.at(add(capC, add(add(mul(wf, -R[0] * 0.15), mul(wl, -R[1] * 0.5)), mul(wu, R[2] * 0.55))));
  return { id: 'r-feather', x: quill[0], y: quill[1], over: true };
}
/** Where a feather is fixed on a head with no cap: at its side toward the eye, `up` a share of its height from its middle. */
function quillAt(c: C, up = 0.55, back = 0.2): TailRoot {
  const { st, s, hf, hl, hu, R } = c;
  const [x, y] = st.at(add(s.head, add(add(mul(hl, -R[1] * 0.9), mul(hu, R[2] * up)), mul(hf, -R[0] * back))));
  return { id: 'r-feather', x, y, over: true };
}
/** His hair as it is: dark, on the back of his head. */
const HIS_HAIR = dim(PLUM);
const backOnly = (f: number): boolean => f < -0.2;
/** A darker tone of skin, for a jaw that has not been shaved. */
const stubble = (tone: number): string => lit(SKIN4)[Math.max(0, tone - 1)];
const headCtx = (h: HeadCtx): C => ctxOf(h.st, h.s, h.q, h.B);

export const RANGER_HEADS: HeadOption[] = [
  {
    name: 'Bare face',
    paint: (h) => {
      const c = headCtx(h);
      head(c, { hairAt: backOnly, hair: HIS_HAIR, eyeUp: 0.12 });
      return [rangerCap(c, TEAL, 0.08)];
    },
  },
  {
    name: 'Bearded',
    paint: (h) => {
      const c = headCtx(h);
      const hd = head(c, { hairAt: backOnly, hair: HIS_HAIR, eyeUp: 0.14, paint: (f, l, up, tone) => (up < -0.2 && f > -0.35 ? HIS_HAIR[Math.max(1, tone)] : undefined) });
      dotOn(c, hd, -30, -0.12, HIS_HAIR[2]);
      dotOn(c, hd, -30, -0.12, HIS_HAIR[2], 1, 0);
      return [rangerCap(c, TEAL, 0.08)];
    },
  },
  {
    name: 'Hood up',
    paint: (h) => {
      const c = headCtx(h);
      head(c, { eyeUp: 0.12, shade: 0.08 });
      hood(c, TEAL, 0.85);
      return [quillAt(c, 0.75, 0.5)];
    },
  },
  {
    name: 'Elf: long fair hair, pointed ears',
    paint: (h) => {
      const c = headCtx(h);
      const { st, s, hf, hl, hu, R, B, mine } = c;
      curtain(c, BLONDE, 12, B.shoulderHalf + 0.6);
      const hd = head(c, { hairAt: drawnBack, hair: BLONDE, eyeUp: 0.12 });
      // (the ear toward the eye: a point of skin out past his hair, up and back)
      const a = add(s.head, add(mul(hl, -R[1] * 0.9), mul(hu, R[2] * 0.0)));
      const b = add(a, add(mul(hl, -3.4), add(mul(hu, 3.2), mul(hf, -2.2))));
      rod(st.part(st.near(a) + 0.4), st, a, b, 1.3, 0.3, mine(lit(SKIN4), b));
      // (a band of leaves round his brow)
      for (let turn = -100; turn <= 20; turn += 8) dotOn(c, hd, turn, 0.5, LEAF[3]);
      return [quillAt(c, 0.5, 0.6)];
    },
  },
  {
    name: 'War paint',
    paint: (h) => {
      const c = headCtx(h);
      // (a band of paint across his face, under his eyes and over his nose)
      head(c, { hairAt: backOnly, hair: HIS_HAIR, eyeUp: 0.16, paint: (f, l, up, tone) => (f > -0.15 && up > -0.3 && up < -0.04 ? PINK[Math.max(2, tone)] : undefined) });
      return [rangerCap(c, TEAL, 0.12)];
    },
  },
  {
    name: 'Bandana, unshaven',
    paint: (h) => {
      const c = headCtx(h);
      const { st, s, hf, hl, hu, R } = c;
      head(c, {
        hairAt: (f, l, up) => f < -0.3 && up < 0.3,
        hair: HIS_HAIR,
        eyeUp: 0.1,
        paint: (f, l, up, tone) => (up > 0.3 ? PINK[tone] : up < -0.3 && f > -0.2 ? stubble(tone) : undefined),
      });
      // (its knot, and the two ends of it, at the back of his head)
      const k = add(s.head, add(mul(hf, -R[0] * 0.98), mul(hu, R[2] * 0.3)));
      const part = st.part(st.near(k) + 0.2);
      ball(part, st, k, [[1.5, 0, 0], [0, 1.5, 0], [0, 0, 1.5]], PINK);
      rod(part, st, k, add(k, add(mul(hf, -2.6), [0, 0, -4.2])), 1.1, 0.5, PINK);
      rod(part, st, k, add(k, add(mul(hf, -1.2), add(mul(hl, -2.2), [0, 0, -5]))), 1.1, 0.5, PINK);
      return [quillAt(c, 0.45, 0.35)];
    },
  },
  {
    name: 'Goggles',
    paint: (h) => {
      const c = headCtx(h);
      const hd = head(c, { hairAt: backOnly, hair: HIS_HAIR, blind: true, paint: (f, l, up) => (f > -0.5 && up > 0.06 && up < 0.24 ? INK : undefined) });
      for (const turn of EYES) {
        for (let j = 0; j <= 1; j++) for (let i = 0; i <= 1; i++) dotOn(c, hd, turn, 0.2, i + j === 0 ? '#ffffff' : i + j === 1 ? CYAN[3] : CYAN[2], i, j);
      }
      return [rangerCap(c, TEAL, 0.1)];
    },
  },
  {
    name: 'Eye patch',
    paint: (h) => {
      const c = headCtx(h);
      head(c, { hairAt: backOnly, hair: HIS_HAIR, eyeUp: 0.14, patch: true, paint: (f, l, up, tone) => (up < -0.32 && f > -0.2 ? stubble(tone) : undefined) });
      return [rangerCap(c, TEAL, 0.12)];
    },
  },
  {
    name: 'Fox mask',
    paint: (h) => {
      const c = headCtx(h);
      const { st, s, hf, hl, hu, R } = c;
      const hd = head(c, { hairAt: (f, l, up) => f < 0.05 || up > 0.6, hair: HIS_HAIR, blind: true, paint: (f, l, up, tone) => (f > 0.0 && up > -0.22 && up < 0.62 ? WHITE[Math.max(2, tone)] : undefined) });
      for (const turn of EYES) {
        dotOn(c, hd, turn, 0.16, INK);
        dotOn(c, hd, turn, 0.16, INK, 1, 0);
        dotOn(c, hd, turn, 0.16, PINK[2], 0, 2);
      }
      // (its ears: two points of white over the brow, pink inside)
      for (const side of [1, -1]) {
        const a = add(s.head, add(add(mul(hl, side * R[1] * 0.62), mul(hu, R[2] * 0.72)), mul(hf, R[0] * 0.25)));
        const b = add(a, add(mul(hu, 3.6), mul(hl, side * 1.2)));
        const ear = st.part(st.near(a) + 0.6);
        rod(ear, st, a, b, 1.5, 0.3, WHITE);
        const [x, y] = st.at(add(a, mul(hu, 0.9)));
        ear.mark(x - 0.5, y - 0.5, PINK[2]);
      }
      return [quillAt(c, 0.2, 0.9)];
    },
  },
  {
    name: 'Old scout: white moustache',
    paint: (h) => {
      const c = headCtx(h);
      const hd = head(c, { hairAt: backOnly, hair: WHITE, eyeUp: 0.14, paint: (f, l, up) => (f > 0.15 && up < -0.14 && up > -0.46 ? WHITE[3] : undefined) });
      for (const turn of EYES) dotOn(c, hd, turn, 0.14, WHITE[4], 0, -1);
      return [rangerCap(c, TEAL, 0.08)];
    },
  },
];
// --- the knight's helms: steel all over his head, and his eyes a glow in it ---

/** A point on a helm's shell: `az` degrees round from the nose (to his left if more than 0), `up` a share of the head's height above its middle, on a shell `kf` and `kl` times the head from front to back and from side to side. */
function shell(c: C, az: number, up: number, kf: number, kl: number): V3 {
  const a = az * D;
  return add(c.s.head, add(add(mul(c.hf, Math.cos(a) * c.R[0] * kf), mul(c.hl, Math.sin(a) * c.R[1] * kl)), mul(c.hu, up * c.R[2])));
}
/** One pixel drawn on a helm there (and others beside it), if that side of it is toward the eye. */
function spot(c: C, sheet: Sheet, az: number, up: number, k: readonly [number, number], color: string, dx = 0, dy = 0): void {
  if (!faces(c.st, c.s, az)) return;
  const [x, y] = c.st.at(shell(c, az, up, k[0], k[1]));
  sheet.mark(Math.round(x - 0.5) + dx, Math.round(y - 0.5) + dy, color);
}
/** A line drawn on a helm's shell, from one place on it to another: a slit, a seam, a bar. */
function etch(c: C, sheet: Sheet, from: readonly [number, number], to: readonly [number, number], k: readonly [number, number], color: string, dy = 0): void {
  const n = 28;
  for (let i = 0; i <= n; i++) spot(c, sheet, from[0] + ((to[0] - from[0]) * i) / n, from[1] + ((to[1] - from[1]) * i) / n, k, color, 0, dy);
}
/** His eyes in a helm: two points of light, where the slit is. */
function glints(c: C, sheet: Sheet, up: number, k: readonly [number, number]): void {
  for (const az of EYES) spot(c, sheet, az, up, k, GLINT);
}
/** The mail at his neck, under any helm. */
function coif(c: C): void {
  rod(c.st.part(c.st.near(c.s.head) + 0.3), c.st, c.s.neck, c.s.skull, 2.3, 2.3, MAIL, { links: true });
}
/** A ROUND HELM: a shell of steel over the whole head. `paint`: what is cut in it or laid on it, by where on the shell (as a ball's painter is told). */
function roundHelm(c: C, k: readonly [number, number, number], paint?: (f: number, l: number, up: number, tone: number) => string | undefined, ramp: Ramp = STEEL): Sheet {
  const { st, s, hf, hl, hu, R } = c;
  const helm = st.part(st.near(s.head) + 0.6);
  ball(helm, st, add(s.head, mul(hu, R[2] * 0.05)), [mul(hf, R[0] * k[0]), mul(hl, R[1] * k[1]), mul(hu, R[2] * k[2])], (u, tone) => {
    const p = paint ? paint(u[0], u[1], u[2], tone) : undefined;
    return p === undefined ? ramp[tone] : p;
  });
  return helm;
}
/** A HELM WITH STRAIGHT SIDES: rings of steel one over another (each: how high on the head, how big, how far forward), and a plate closing its top. */
function wallHelm(c: C, k: readonly [number, number], rings: ReadonlyArray<readonly [up: number, size: number, fwd?: number]>, ramp: Ramp = STEEL): Sheet {
  const { st, s, hf, hl, hu, R } = c;
  const helm = st.part(st.near(s.head) + 0.6);
  const ring = (up: number, size: number, fwd = 0): Ring => ({ c: add(s.head, add(mul(hu, R[2] * up), mul(hf, R[0] * fwd))), u: mul(hf, R[0] * k[0] * size), v: mul(hl, R[1] * k[1] * size) });
  cloth(helm, st, rings.map(([up, size, fwd]) => ring(up, size, fwd)), ramp, { lift: 0.05 });
  const [up, size, fwd] = rings[0];
  const top = ring(up, size, fwd);
  ball(helm, st, top.c, [top.u, top.v, mul(hu, 0.7)], ramp);
  return helm;
}
/** How far round the head a place is from the middle of the face as the eye sees it (which is not the nose: see EYES), in degrees. */
const fromFace = (f: number, l: number): number => {
  const d = Math.atan2(l, f) / D - (EYES[0] + EYES[1]) / 2;
  return ((d + 540) % 360) - 180;
};
const HELM: readonly [number, number] = [1.2, 1.28];

export const KNIGHT_HELMS: HeadOption[] = [
  {
    name: 'Great helm: flat top, a cross',
    paint: (h) => {
      const c = headCtx(h);
      coif(c);
      const helm = wallHelm(c, HELM, [[1.0, 1.0], [-0.95, 1.0]]);
      const mid = (EYES[0] + EYES[1]) / 2;
      etch(c, helm, [mid, 0.95], [mid, -0.9], HELM, STEEL[4]);
      etch(c, helm, [-125, 0.2], [60, 0.2], HELM, INK);
      glints(c, helm, 0.2, HELM);
      for (const [az, up] of [[-70, -0.25], [-58, -0.45], [-82, -0.45], [-70, -0.65]] as const) spot(c, helm, az, up, HELM, INK);
    },
  },
  {
    name: 'Sugarloaf: a rounded point',
    paint: (h) => {
      const c = headCtx(h);
      coif(c);
      const helm = wallHelm(c, HELM, [[1.75, 0.12], [1.35, 0.6], [0.8, 0.96], [-0.95, 1.0]]);
      etch(c, helm, [-125, 0.22], [60, 0.22], HELM, INK);
      glints(c, helm, 0.22, HELM);
      etch(c, helm, [-125, 0.5], [60, 0.5], HELM, STEEL[4]);
      for (const az of [-80, -66, -52]) for (const up of [-0.2, -0.5]) spot(c, helm, az, up, HELM, INK);
    },
  },
  {
    name: 'Barbute: a T cut in it',
    paint: (h) => {
      const c = headCtx(h);
      coif(c);
      const helm = roundHelm(c, [1.2, 1.28, 1.14], (f, l, up) => {
        const d = fromFace(f, l);
        if (f > -0.2 && ((Math.abs(d) < 50 && up > 0.04 && up < 0.3) || (Math.abs(d) < 13 && up <= 0.04 && up > -0.8))) return INK;
        return undefined;
      });
      glints(c, helm, 0.16, HELM);
    },
  },
  {
    name: 'Pig-face: a pointed visor',
    paint: (h) => {
      const c = headCtx(h);
      const { st, s, hf, hu, R } = c;
      coif(c);
      const helm = roundHelm(c, [1.18, 1.26, 1.12]);
      // (the visor: a cone of steel out from his face, and a little down)
      const mid = ((EYES[0] + EYES[1]) / 2) * D;
      const out = add(mul(hf, Math.cos(mid)), mul(c.hl, Math.sin(mid)));
      const a = add(s.head, add(mul(out, R[0] * 0.55), mul(hu, -R[2] * 0.22)));
      const b = add(s.head, add(mul(out, R[0] * 2.25), mul(hu, -R[2] * 0.5)));
      const snout = st.part(st.near(b) + 0.4);
      rod(snout, st, a, b, 3.5, 0.7, STEEL);
      // (the two slots he sees through, over it; and the holes he breathes through, in it)
      etch(c, helm, [EYES[0] - 22, 0.36], [EYES[0] + 14, 0.36], HELM, INK);
      etch(c, helm, [EYES[1] - 14, 0.36], [EYES[1] + 22, 0.36], HELM, INK);
      glints(c, helm, 0.36, HELM);
      const [x, y] = st.at(add(a, mul(sub(b, a), 0.45)));
      for (const [dx, dy] of [[0, 0], [-2, 1], [2, 0], [0, 2]] as const) snout.mark(x + dx - 0.5, y + dy - 0.5, INK);
    },
  },
  {
    name: 'Frog-mouth: a jutting jaw',
    paint: (h) => {
      const c = headCtx(h);
      coif(c);
      const helm = wallHelm(c, HELM, [[1.0, 0.82, -0.18], [0.34, 0.98, -0.1], [0.14, 1.12, 0.22], [-0.95, 0.94, 0.1]]);
      etch(c, helm, [-125, 0.3], [60, 0.3], [HELM[0] * 1.02, HELM[1] * 1.02], INK);
      glints(c, helm, 0.3, [HELM[0] * 1.02, HELM[1] * 1.02]);
      etch(c, helm, [-125, 0.1], [60, 0.1], [HELM[0] * 1.2, HELM[1] * 1.14], STEEL[4]);
    },
  },
  {
    name: 'Horned great helm',
    paint: (h) => {
      const c = headCtx(h);
      const { st, hf, hl, hu } = c;
      coif(c);
      const helm = wallHelm(c, HELM, [[1.0, 0.94], [-0.95, 1.0]]);
      etch(c, helm, [-125, 0.2], [60, 0.2], HELM, INK);
      glints(c, helm, 0.2, HELM);
      etch(c, helm, [-125, 0.62], [60, 0.62], HELM, STEEL[4]);
      for (const side of [1, -1]) {
        const p0 = shell(c, side * 92, 0.5, HELM[0], HELM[1]);
        const p1 = add(p0, add(mul(hl, side * 3.6), mul(hu, 1.6)));
        const p2 = add(p1, add(mul(hl, side * 1.2), add(mul(hu, 4.8), mul(hf, 0.8))));
        const horn = st.part(st.near(p1) + 0.3);
        rod(horn, st, p0, p1, 1.7, 1.4, BONE);
        rod(horn, st, p1, p2, 1.4, 0.3, BONE);
      }
    },
  },
  {
    name: 'Winged helm',
    paint: (h) => {
      const c = headCtx(h);
      const { st, hf, hl, hu } = c;
      coif(c);
      const helm = roundHelm(c, [1.2, 1.28, 1.12]);
      etch(c, helm, [-125, 0.2], [60, 0.2], HELM, INK);
      glints(c, helm, 0.2, HELM);
      const mid = (EYES[0] + EYES[1]) / 2;
      etch(c, helm, [mid, 0.2], [mid, -0.85], HELM, INK);
      // (a wing at each temple: three feathers, up and back)
      for (const side of [1, -1]) {
        const p0 = shell(c, side * 96, 0.42, HELM[0], HELM[1]);
        for (const [back, up, len] of [[0.5, 6.6, 1], [2.6, 5.2, 0.92], [4.4, 3.2, 0.82]] as const) {
          const p1 = add(p0, mul(add(add(mul(hf, -back), mul(hu, up)), mul(hl, side * 1.6)), len));
          const wing = st.part(st.near(p1) + 0.3);
          rod(wing, st, p0, p1, 1.3, 0.4, WHITE);
          const [x, y] = st.at(p1);
          st.over.set(Math.round(x - 0.5), Math.round(y - 0.5), CYAN[2]);
        }
      }
    },
  },
  {
    name: 'Crested helm: a red comb',
    paint: (h) => {
      const c = headCtx(h);
      const { st, s, hf, hl, hu, R } = c;
      coif(c);
      const helm = roundHelm(c, [1.2, 1.28, 1.14], (f, l, up) => {
        const d = fromFace(f, l);
        // (two eyes cut in it, and a slot down from between them: its cheeks come round to his mouth)
        if (f > -0.2 && ((Math.abs(Math.abs(d) - 26) < 16 && up > 0.04 && up < 0.3) || (Math.abs(d) < 8 && up < 0.3 && up > -0.8))) return INK;
        return undefined;
      });
      glints(c, helm, 0.16, HELM);
      // (the comb: a fin of red over the crown from brow to nape, and its tail down behind)
      const top = add(s.head, add(mul(hu, R[2] * 1.3), mul(hf, -R[0] * 0.15)));
      ball(st.part(st.near(top) + 0.5), st, top, [mul(hf, R[0] * 1.5), mul(hl, 1.0), mul(hu, R[2] * 0.78)], RED);
      const nape = add(s.head, add(mul(hf, -R[0] * 1.5), mul(hu, R[2] * 0.9)));
      rod(st.part(st.near(nape)), st, nape, add(nape, add(mul(hf, -1.5), [0, 0, -7])), 1.5, 0.6, RED);
    },
  },
  {
    name: 'Pointed helm, a face plate',
    paint: (h) => {
      const c = headCtx(h);
      const { st, s, hu, R } = c;
      coif(c);
      // (his helm as it is, a cone drawn up to a point; and under it, where his face was, a plate of steel with two holes)
      const plate = roundHelm(c, [1.14, 1.2, 1.02], (f, l, up) => {
        const d = fromFace(f, l);
        if (f > -0.2 && Math.abs(Math.abs(d) - 26) < 14 && up > -0.3 && up < 0.0) return INK;
        return undefined;
      });
      glints(c, plate, -0.14, [1.14, 1.2]);
      for (const az of [-44, -30, -16]) spot(c, plate, az, -0.6, [1.14, 1.2], INK);
      const helm = st.part(st.near(s.head) + 0.7);
      const [wf, wl, wu] = wornOn(st, s);
      const brow = add(s.head, mul(hu, R[2] * 0.32));
      const rim: Ring = { c: brow, u: mul(wf, R[0] * 1.3), v: mul(wl, R[1] * 1.45) };
      const peak = add(add(brow, mul(wu, R[2] * 2.25)), mul(wf, -R[0] * 0.15));
      cloth(helm, st, [{ c: peak, u: mul(wf, 0.45), v: mul(wl, 0.45) }, rim], STEEL, { lift: 0.55 });
      ball(helm, st, brow, [rim.u, rim.v, mul(wu, 0.7)], STEEL, 0.3);
      band(helm, st, rim, CYAN, 2, 0.5);
    },
  },
  {
    name: 'Barred visor, crowned',
    paint: (h) => {
      const c = headCtx(h);
      const { st, hu } = c;
      coif(c);
      const helm = roundHelm(c, [1.2, 1.28, 1.14], (f, l, up, tone) => {
        const d = fromFace(f, l);
        // (the visor: bars of steel down over his face, the dark between them)
        if (f > -0.2 && Math.abs(d) < 56 && up > -0.7 && up < 0.34) return Math.floor((d + 56) / 10) % 2 === 0 ? INK : STEEL[Math.max(2, tone)];
        return undefined;
      });
      glints(c, helm, 0.14, HELM);
      // (the crown: a band round the helm, and points standing on it)
      etch(c, helm, [-150, 0.62], [80, 0.62], [1.1, 1.16], CYAN[2]);
      for (const az of [-140, -95, -50, -5, 40]) {
        const p0 = shell(c, az, 0.7, 1.0, 1.06);
        const p1 = add(p0, mul(hu, 3.4));
        rod(st.part(st.near(p0) + 0.5), st, p0, p1, 0.9, 0.3, STEEL);
      }
    },
  },
];

/** The ranger or the knight at the first moment of a move, facing the eye, with one of the heads above in place of his own. */
export function paintHeadOption(move: Move3, k: number, who: 'knight' | 'ranger'): Painted {
  return paintMove3(move, 0, 'front', { head: (who === 'knight' ? KNIGHT_HELMS : RANGER_HEADS)[k].paint });
}

// (kept for the sheets that follow)
export const _kit = { LEAF, dim, GLINT };
