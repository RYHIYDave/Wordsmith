// THE SKELETON ON THE HEROES' BONES: A MOCK-UP (the art chat, 8 Oct 2026). NOT IN THE GAME. The
// game's skeleton is the one painted in art/monster_bones.ts, as it was; this one is shown only
// where `SKELETON3.on` (art/bestiary.ts) is set, and the game never sets it.
//
// The owner, 4 Oct 2026, 16:25: "Also we need the dungeons and mobs brought up to the level of the
// character models". And 6 Oct, 00:31: "I want enemies to look natural. An undead skeleton is
// plodding and brittle." Version 14 brought the monsters up to the heroes as the heroes were
// painted then: flat layers moved by numbers on the screen, the corner view faked by sliding
// columns. The heroes have since moved onto bones (Version 16: art/skeleton.ts, skin.ts,
// moves3.ts) and the monsters have not. This is today's skeleton moved onto the same bones, to be
// set beside today's one.
//
//   THE HEROES' BONES AND THE HEROES' PAINTER, UNCHANGED. A body (a `Build`: the heroes' table of
//   a body's lengths, made gaunt and given a big skull), posed by keys on the heroes' numbers, its
//   elbows and knees finding themselves and its arms kept out of its ribs (`solve`); dressed in
//   rods and balls (skin.ts) lit by the heroes' one light in the heroes' flat tones, every pixel
//   as near the eye as its skin is; the indigo seam where one part ends in front of another; and
//   round it all the ENEMY'S PINK EDGE (the heroes' is cyan). The scrap of cloth at its hips is the
//   heroes' cloth (`skirtOf`, `cloth`), the sword is laid along its line as the knight's is.
//
//   THE SAME MONSTER AS TODAY'S: a big skull of pale lavender bone with a point of hot pink deep
//   in each socket, the jaw that hangs and clacks, a rib cage, a knob at every joint, three finger
//   bones on the hand that hangs, long feet, a scrap of teal cloth at the hips knotted at the back,
//   and the notched, rusted sword held low with its point to the floor (the owner, 6 Oct 2026,
//   00:31: "Skeleton looks better down"). Its sword is in its LEFT hand, so that it is on the side
//   it faces in both views, as today's is (the heroes carry theirs on the other side).
//
//   ITS OWN MOVES. No hero moves like the dead, so these are its own, written on the heroes' keys:
//     stand  it creaks: the skull settles a beat after the body, the jaw clacks twice, it sways.
//     plod   ONE LEG STEPS LONG AND THE WHOLE FRAME FALLS ONTO IT, THE KNEE LOCKED STRAIGHT; the
//            skull lolls over a beat late and the jaw is jolted open; the bones rattle on their
//            pins; then THE OTHER LEG IS DRAGGED, STIFF, swung out round the side from a hitched
//            hip because its knee will not bend, its toe scraping the floor; and the frame is
//            hauled up over it. One heavy footfall to a cycle, slower than today's.
//     chop   the arm creaks up and the sword is raised behind the skull, the frame leaning back
//            and the jaw wide (held, trembling: the player's warning); it comes down in front with
//            the whole frame thrown after it, the jaw snapping shut; it ends low.
//     die    the light flares in the sockets and goes out; the knees go and the frame drops; and
//            then IT COMES APART: the sword first, the jaw off the skull, then every bone (each
//            rib by itself) falls and turns IN THREE DIMENSIONS to lie on the floor, the skull
//            last, rolling toward the eye. A bone turned a few degrees is painted afresh at that
//            angle, so it stays a crisp bone (today's death can turn its pieces by quarter turns
//            only: art/death.ts).
//
// HOW IT IS BUILT. A frame is first a list of SOLIDS in the figure's own space (`Bit`: a rod, a
// ball, the sword, the cloth, a dot), each belonging to a PART (the painter's unit: the seam is
// drawn where one part ends in front of another) and to a PIECE (what falls as one thing when it
// dies). Standing, walking and striking, the list is made from the posed bones and painted. Dying,
// each piece is made from the bones as they were at the moment it let go, and moved and turned
// as one rigid thing from there to where it lies.
//
// What the numbers of a pose mean to this painter besides the bones (the mage's painter likewise
// reads `draw` as the burning of her crystal):
//   draw  the jaw forced open, 0 shut to 1 wide; and the light in the sockets burns up with it
//   pt    a rattle: the skull and the rib cage knocked that many pixels to the figure's left
//         (right, if negative) on their pins, as a jolt goes through it
//   out   the light going out of its sockets, 0 lit to 1 dark
//
// THE BONE ARCHER ON THE SAME BONES (the art chat, 8 Oct 2026, from 09:28: a mock-up, NOT IN THE
// GAME, behind `ARCHER3.on` in art/bestiary.ts, which is off). The owner, asked at 09:27 what the
// art chat should take up next, chose at 09:28 "Bone archer on bones (Recommended)" (offered to
// him as "He's a skeleton too. Same new bones, so he matches the new skeleton."). It is today's bone archer
// (art/monster_bones.ts, `makeArcherArt`) on the skeleton's body and painter, as today's archer is
// on today's skeleton's: THE SAME DEAD, DRESSED AND ARMED OTHERWISE (`DeadKit`). What it wears and
// carries is today's: a ragged red hood over the skull, its rim shading the brow so that the pink
// in the sockets burns out of the dark; a ragged red mantle on the shoulders; a quiver on its back,
// pink fletchings over its right shoulder; and a tall dark bow in its LEFT hand (the side it faces
// in both views, as today's and the ranger's are), an arrow on the string, pink fletching and a
// rusted head that turns to a spitting pink spark as the bow is drawn. No rag at its hips, as
// today's has none. For the archer the numbers above mean:
//   draw  how far the bow is drawn, 0 to 1; the light in the sockets burns up with it, and the
//         arrowhead turns to a spark (its jaw is the move's own: `SkMove.jaw`)
//   prop  where the string hand is: 0 off the string (the arrow sits on it), 1 on the string, the
//         arrow nocked under its fingers, 2 just let go (the string empty, the fingers open)
//   pt    the rattle, as the skeleton's; and, the moment the string is let go, how far it is
//         thrown forward of straight (`prop` 2)

import type { Light, Sprite } from '../engine/px';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { BONE, INDIGO, INK, PINK, PLUM, TEAL, dim, dir, lazyFrames, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { BLOOD, DEATH_FPS, ENEMY_RIM, FLAME, RUST, SOCKET } from './mkit';
import { CANVAS3, TIPPED, ball, cloth, eyesToward, girdle, laidAlong, mid, rod, skirtOf, stage, thread, wornOn } from './skin';
import type { ClothLook, GameView, Ring, Sheet, Skin, Stage } from './skin';
import { about, add, bonesAt, buildOf, cross, dot, elbowFor, heading, len, lerp3, mul, norm, solve, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Posed, Skeleton, Solid, V3 } from './skeleton';

// ---------------------------------------------------------------------------------------------
// The body

/**
 * THE SKELETON'S BODY: the heroes' table of lengths for a figure 46 picture pixels to the root of
 * the skull's crown before the skull is put on it, which puts the collar bone and the hips where
 * today's skeleton has them (39 and 24 pixels up), its shoulders broad for its height and its
 * ribs deep (a rib cage, not a waist); and a SKULL much bigger than a man's head, as today's is
 * (twelve pixels across on a figure fifty-two tall), sitting low on a short neck. Its arms and legs
 * are measured thin (`limbs`): what keeps a hand out of its ribs is bone, not a sleeve (`pad`).
 */
const GAUNT: Build = buildOf(46, 1, { shoulders: 1.4, chest: 1.05, depth: 1.0, waist: 0.75, hips: 1.0, legs: 0.9, trunk: 1.18, limbs: 0.5, pad: 0.25 });
export const SKELETON3_BODY: Build = { ...GAUNT, neck: 3.4, headUp: 4.4, headFwd: 0.6, headR: [5.4, 5.0, 5.2] };
const B = SKELETON3_BODY;

/** How thick each bone is (a radius, in the figure's own lengths): a shaft two picture pixels wide, a knob at a joint three or four. */
const R_THIGH: readonly [number, number] = [1.0, 0.85];
const R_SHIN: readonly [number, number] = [0.85, 0.72];
const R_UPPER: readonly [number, number] = [0.85, 0.75];
const R_FORE: readonly [number, number] = [0.75, 0.66];
const KNOB_KNEE = 1.45;
const KNOB_ELBOW = 1.3;
const KNOB_SHOULDER = 1.45;
const KNOB_ANKLE = 1.0;
const R_FOOT: readonly [number, number] = [0.95, 0.75];
const R_VERTEBRA = 1.12;
const R_RIB = 0.72;
const R_FINGER = 0.55;

/**
 * THE SKULL, measured from where the heroes' head is (`Skeleton.head`) along the face's own lines
 * (forward, up): a round CRANIUM, and under its front THE JAW, hinged at the back. Today's skull
 * is twelve pixels across and ten high, and its jaw three more.
 */
const CRANIUM = { at: [-0.4, 1.2] as const, r: [5.3, 5.1, 4.7] as const };
const JAW = { hinge: [-1.8, -2.0] as const, at: [1.4, -3.4] as const, r: [2.9, 3.5, 1.35] as const };
/** The dark inside the mouth, behind both rows of teeth: seen only when the jaw drops. */
const MOUTH = { at: [0.9, -2.3] as const, r: [2.0, 2.8, 1.05] as const };
/** The sockets: how high on the cranium (radians above its middle), how far either side of the middle of the face (degrees), how big; and the hole of the nose under them. */
const SOCKETS = { el: 0.3, apart: 29, r: 0.34, nose: 0.46, noseR: 0.15 };
/** How high on the cranium the upper teeth are (radians: below its middle), and how far round the face either way the rows of teeth go (degrees). */
const TEETH_EL = -0.62;
const TEETH_SPAN = 42;
/**
 * The crack in the crown: points on the cranium (along its forward, left, up), from the top down
 * the back, where the light falls on the skull seen from behind (as today's is).
 */
const CRACK: readonly V3[] = [[-0.12, 0.3, 1.0], [-0.3, 0.5, 0.92], [-0.5, 0.36, 0.8], [-0.62, 0.56, 0.62], [-0.78, 0.42, 0.44], [-0.86, 0.6, 0.24], [-0.94, 0.46, 0.04]];
/** How far the jaw drops open at `draw` 1, in degrees about its hinge. */
const GAPE = 34;
/** How far the skull is tipped back from the eye (the heroes' headgear is tipped TIPPED, 20 degrees: skin.ts). */
const SKULL_TIP = TIPPED + 6;

/** The sword: its blade's length (the figure's own lengths), and how far the blade starts beyond the hand. */
const BLADE3 = 22;

/** The colours: the dead's bone, its rag, its rusted sword (the same ramps as today's skeleton: art/kit.ts, art/mkit.ts). */
const BONE3: Ramp = BONE;
const RAG: Ramp = TEAL;

/**
 * THE ARCHER'S COLOURS, today's archer's (art/monster_bones.ts): its hood and mantle the red of
 * old blood; the bow and the quiver dark indigo wood, the quiver's rim plum; a pale string; arrows
 * with a plum shaft, pink fletching and a rusted head.
 */
const HOOD3: Ramp = BLOOD;
const WOOD3: Ramp = INDIGO;
/** The quiver: dark plum leather (today's is the bow's indigo; on the bones, from behind, a quiver as blue as the bow read as a second bow). */
const LEATHER3: Ramp = PLUM;
const STRING3 = BONE[2];
const SHAFT3 = PLUM[3];

/** What a dead one built on these bones wears and carries. */
export interface DeadKit {
  /** In its left hand: a sword, or a bow (with its string and an arrow; its right hand is the string hand). */
  carry: 'sword' | 'bow';
  /** The scrap of teal cloth at its hips. */
  rag: boolean;
  /** A hood over the skull and a mantle on the shoulders. */
  hood: boolean;
  /** A quiver on its back. */
  quiver: boolean;
}
/** The skeleton: a sword and a rag. */
export const SWORDSMAN: DeadKit = { carry: 'sword', rag: true, hood: false, quiver: false };
/** The bone archer: a bow, a hood and mantle, a quiver; no rag. */
export const BOWMAN: DeadKit = { carry: 'bow', rag: false, hood: true, quiver: true };

/**
 * THE BOW: how far each tip is from the grip, and how far the string stands off the grip when it
 * is not drawn (the ranger's are 0.31 and 0.09 of a body 57 tall: moves3.ts, BOW_HALF and
 * BOW_BRACE; today's archer's bow is taller than a man's waist to his crown, so this one is a
 * little longer than the ranger's for a body a little shorter). An arrow, nock to point.
 */
const BOW3_HALF = 20;
const BOW3_BRACE = 4.6;
const ARROW3 = 22;
/** How far back the string comes at full draw, at most: to the jaw (see `drawnBow`). */
const DRAW3 = 18;

/**
 * THE HOOD over the skull, measured on the cranium (`CRANIUM`) along the face's own lines: its
 * middle, how much bigger than the cranium it is, and THE OPENING it leaves for the face (a share of
 * each of its three lengths, as on a ball: in front of `front`, below `brow`), with the dark rim
 * round it.
 */
const HOOD = { at: [-0.9, 0.7] as const, more: [1.5, 1.35, 1.25] as const, front: 0.18, brow: 0.38, rim: 0.16 };

// ---------------------------------------------------------------------------------------------
// How it stands

/**
 * STANDING: hunched, the head hanging forward and lolling to one side, the knees not quite
 * straight; the sword hangs from the left hand beside the hip with its point toward the floor
 * ahead (today's `SWORD_LOW`); the right arm hangs loose.
 */
const HANG = -(B.upperArm + B.foreArm) * 0.95;
export const SKELETON3_REST: Bones = {
  ...standing(B),
  pz: -1.0, px: -0.4, yaw: -6, pitch: 3, roll: 2, twist: 4, bend: 11, side: -2,
  faceTurn: -2, faceUp: 1, faceTilt: 9,
  lfx: 1.6, lfy: 0.4, lft: 12, lk: 10, rfx: -1.4, rfy: -0.3, rft: -16, rk: -10,
  lhIn: 0, lhx: 2.6, lhy: 1.6, lhz: HANG + 0.6, le: -6,
  rhIn: 0, rhx: 0.8, rhy: -1.2, rhz: HANG - 0.2, re: 0,
  wAz: 12, wEl: -63, wRoll: 0,
  draw: 0.15, pt: 0, out: 0,
};

// ---------------------------------------------------------------------------------------------
// Solids, as a list

/** One solid of a frame. */
type Shape =
  | { k: 'rod'; a: V3; b: V3; ra: number; rb: number; ramp: Ramp; far?: boolean }
  | { k: 'ball'; c: V3; ax: readonly [V3, V3, V3]; skin: Skin; far?: boolean }
  /** The sword: its grip, and the way its blade points. */
  | { k: 'blade'; grip: V3; point: V3 }
  /** A single pixel ON a part that is already painted (the light in a socket), drawn only where the skin under it faces the eye. */
  | { k: 'dot'; p: V3; c: string; facing: V3 }
  /**
   * A ROW OF TEETH on a part that is already painted: points along it (and the way the skin faces
   * at each); drawn as a line across the picture, light and dark by turns column by column, as
   * today's skull has them, where the skin faces the eye.
   */
  | { k: 'teeth'; pts: V3[]; facing: V3[] }
  /** A CRACK on a part that is already painted: a dark line joining points on it, where the skin faces the eye. */
  | { k: 'crack'; pts: V3[]; facing: V3[] }
  /** The rag: rings of cloth (it does not turn as a rigid thing: see `ragRings`); `torn`, how much is torn off its hem across it (`tear`). */
  | { k: 'cloth'; rings: Ring[]; ramp: Ramp; look: ClothLook; torn?: ReadonlyArray<number> }
  /** The streak a fast blade leaves: a crescent along where its point has been, newest first. */
  | { k: 'streak'; trail: ReadonlyArray<readonly [V3, V3]> }
  /** A line a pixel thick from `a` to `b` (a bowstring, an arrow's shaft, a fletching), `lift` nearer the eye than the points are. */
  | { k: 'thread'; a: V3; b: V3; c: string; lift: number };

interface Bit {
  /** The part it is painted on (a seam where a nearer part ends in front of it). */
  part: string;
  /** What it falls with when the skeleton dies. */
  piece: string;
  shape: Shape;
}

/** A frame's bones and what moves with them. */
interface Moment {
  s: Skeleton;
  q: Posed;
  /** How far the body has come since a moment before (cloth hangs back by some of it). */
  come: V3;
  wind: number;
  /** Where the blade has been in the last thirtieth of a second, newest first (guard, point): a blur is drawn along it, if there is one. */
  trail: ReadonlyArray<readonly [V3, V3]>;
  /** The jaw, of one whose `draw` is its bow's (0 shut to 1 wide): the move's own (`SkMove.jaw`). */
  jaw?: number;
  /** The moment of the move it is (seconds), for what flickers frame by frame (a spark that spits). */
  at?: number;
}

const D = Math.PI / 180;

/** The pelvis as a solid (for the rag to hang from), the heroes' own measure of it. */
function pelvisSolid(s: Skeleton): Solid {
  return { c: add(s.pelvis, mul(s.hips[2], B.waist * 0.3)), r: s.hips, h: [B.pelvisDeep, B.pelvisHalf, B.waist * 0.9] };
}

/** A point given along a frame of three lines (forward, left, up). */
function at3(c: V3, r: readonly [V3, V3, V3], f: number, l: number, u: number): V3 {
  return add(c, add(mul(r[0], f), add(mul(r[1], l), mul(r[2], u))));
}

/** The ribs: [how far below the root of the neck, half their width, half their depth, how far their front ends are short of the breast bone (radians), how far the front is lower than the back]. */
const RIBS: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [1.7, 3.9, 2.8, 0.3, 1.0],
  [4.0, 4.8, 3.2, 0.34, 1.3],
  [6.3, 5.1, 3.4, 0.42, 1.5],
  [8.6, 4.9, 3.3, 0.6, 1.6],
  [10.8, 4.3, 3.0, 0.9, 1.5],
];
/** Segments to a rib, from its front end round to the spine. */
const RIB_STEPS = 6;

/**
 * How much is torn off the rag's hem, in picture pixels, across it from the left of the picture to
 * the right: three tongues, and short at the sides so that the knees show (today's rag is torn
 * [6, 5, 2, 2, 4, 0, 0, 3, 1, 1, 5, 7] across its twelve columns).
 */
const TORN: readonly number[] = [7, 5, 3, 1, 1, 4, 1, 0, 0, 3, 1, 1, 5, 8];

/**
 * THE SKELETON AS SOLIDS, for one moment and one view (the view decides only which ribs are on
 * the near side of the cage and where the sockets are drawn, as the heroes' eyes are: skin.ts,
 * `eyesToward`). `bits` is in the figure's own space.
 */
function skeletonBits(st: Stage, m: Moment, kit: DeadKit = SWORDSMAN): { bits: Bit[]; lights: Light[] } {
  const { s, q } = m;
  const bowman = kit.carry === 'bow';
  /** The archer's string hand: 0 off the string, 1 on it, 2 just let go (see the head of this file). */
  const stringHand = bowman ? Math.round(q.prop) : 0;
  const bits: Bit[] = [];
  const put = (part: string, piece: string, shape: Shape): void => {
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  // (a rattle knocks the skull and the cage sideways on their pins)
  const knock = mul(cl, q.pt);

  // --- the legs: a thigh, a knob at the knee, a shin, a small knob at the ankle, a long foot ---
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    const leg = `leg${side}`;
    put(leg, `thigh${side}`, { k: 'rod', a: hip, b: knee, ra: R_THIGH[0], rb: R_THIGH[1], ramp: BONE3, far: true });
    put(leg, `thigh${side}`, { k: 'ball', c: knee, ax: sphere(KNOB_KNEE), skin: BONE3, far: true });
    put(leg, `shin${side}`, { k: 'rod', a: knee, b: ankle, ra: R_SHIN[0], rb: R_SHIN[1], ramp: BONE3, far: true });
    put(leg, `shin${side}`, { k: 'ball', c: ankle, ax: sphere(KNOB_ANKLE), skin: BONE3, far: true });
    // (the foot stands on the floor: its line is its own thickness above it)
    put(leg, `shin${side}`, { k: 'rod', a: add(heel, [0, 0, R_FOOT[0]]), b: add(toe, [0, 0, R_FOOT[1]]), ra: R_FOOT[0], rb: R_FOOT[1], ramp: BONE3, far: true });
  }

  // --- the pelvis: a flat bowl of bone with two dark holes in its front ---
  const [hf, hl, hu] = s.hips;
  const pc = add(s.pelvis, mul(hu, 0.9));
  put('pelvis', 'pelvis', {
    k: 'ball',
    c: pc,
    ax: [mul(hf, 3.1), mul(hl, 5.0), mul(hu, 2.2)],
    skin: (u, tone) => (u[0] > 0.42 && u[2] < 0.25 && Math.abs(u[1]) > 0.16 && Math.abs(u[1]) < 0.56 ? INK : BONE3[tone]),
  });

  // --- the spine: knobs of vertebrae from the pelvis up to the ribs, and on up behind them to the neck ---
  const back = (p: V3, k: number): V3 => add(p, mul(cf, -k));
  const lumbar: V3[] = [];
  const low = add(s.pelvis, mul(hu, 2.6));
  const top = back(s.ribs, 0.4);
  for (let i = 0; i < 4; i++) lumbar.push(lerp3(low, top, (i + 0.5) / 4));
  for (const p of lumbar) put('spine', 'spine', { k: 'ball', c: p, ax: sphere(R_VERTEBRA), skin: BONE3 });
  // (behind the ribs, it and the shoulder blades are painted only where the back is turned to
  // the eye: from in front the dark between the ribs is the dark, as today's skeleton has it)
  const fromBehind = dot(cf, st.eye) < 0.1;
  if (fromBehind) {
    // (one with the ribs, so that no seam is drawn where they cross: from behind they are one frame of bone, dark between)
    put('ribs', 'spine', { k: 'rod', a: add(back(s.ribs, 1.6), knock), b: add(back(s.neck, 1.3), knock), ra: 1.0, rb: 0.9, ramp: BONE3 });
    for (const sideSign of [1, -1] as const) {
      const c = add(add(add(s.neck, mul(cu, -3.6)), mul(cf, -2.3)), add(mul(cl, sideSign * 3.1), knock));
      put('blades', sideSign > 0 ? 'upperL' : 'upperR', { k: 'ball', c, ax: [mul(norm(add(cf, mul(cl, sideSign * 0.3))), 0.6), mul(cl, 2.0), mul(cu, 2.4)], skin: BONE3 });
    }
  }

  // --- the rib cage: ribs hung from the spine round to the breast bone, a breast bone, the collar bones ---
  const neckRoot = add(s.neck, knock);
  const eye = st.eye;
  for (let i = 0; i < RIBS.length; i++) {
    const [down, W, Dp, gap, slope] = RIBS[i];
    const c = add(add(neckRoot, mul(cu, -down)), mul(cf, Dp * 0.55));
    for (const sideSign of [1, -1] as const) {
      const piece = `rib${i}${sideSign > 0 ? 'L' : 'R'}`;
      let last: V3 | null = null;
      for (let k = 0; k <= RIB_STEPS; k++) {
        const th = gap + ((Math.PI - gap) * k) / RIB_STEPS;
        const p = add(add(add(c, mul(cf, Dp * Math.cos(th))), mul(cl, sideSign * W * Math.sin(th))), mul(cu, -slope * (1 + Math.cos(th)) * 0.5));
        if (last) {
          // (only the ribs on the near side of the cage are painted: between them is the dark,
          // and the spine behind them, as today's skeleton has it; the far ones would fill the
          // gaps and make a lattice of the chest)
          const midP = mid(last, p);
          const out = sub(midP, add(c, mul(cu, dot(sub(midP, c), cu))));
          if (dot(norm(out), eye) > -0.12) put('ribs', piece, { k: 'rod', a: last, b: p, ra: R_RIB, rb: R_RIB, ramp: BONE3 });
        }
        last = p;
      }
    }
  }
  const sternumTop = add(add(neckRoot, mul(cu, -1.0)), mul(cf, RIBS[0][2] * 1.5));
  const sternumLow = add(add(neckRoot, mul(cu, -RIBS[2][0] - 1.2)), mul(cf, RIBS[2][2] * 1.5));
  put('ribs', 'sternum', { k: 'rod', a: sternumTop, b: sternumLow, ra: 0.95, rb: 0.75, ramp: BONE3 });
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    put('ribs', `upper${side}`, { k: 'rod', a: sternumTop, b: add(sh, mul(cu, 0.3)), ra: 0.72, rb: 0.72, ramp: BONE3, far: true });
  }

  // --- the arms: a knob at the shoulder, the upper arm, a knob at the elbow, the forearm, and a
  // hand: closed on the sword's grip (the left), or three finger bones hanging (the right) ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const fore = norm(sub(hand, el), [0, 0, -1]);
    const wrist = add(hand, mul(fore, -1.1));
    put(`upper${side}`, `upper${side}`, { k: 'ball', c: sh, ax: sphere(KNOB_SHOULDER), skin: BONE3, far: true });
    put(`upper${side}`, `upper${side}`, { k: 'rod', a: sh, b: el, ra: R_UPPER[0], rb: R_UPPER[1], ramp: BONE3, far: true });
    put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(KNOB_ELBOW), skin: BONE3, far: true });
    put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: wrist, ra: R_FORE[0], rb: R_FORE[1], ramp: BONE3, far: true });
    if (side === 'L') {
      put('foreL', 'foreL', { k: 'ball', c: hand, ax: sphere(1.45), skin: BONE3, far: true });
    } else if (stringHand === 1) {
      // (the archer's string hand, closed on the string, the arrow's nock under its fingers)
      put('foreR', 'foreR', { k: 'ball', c: hand, ax: sphere(1.3), skin: BONE3, far: true });
    } else if (stringHand === 2) {
      // (just let go: the finger bones spring open, spread from the wrist)
      put('foreR', 'foreR', { k: 'ball', c: wrist, ax: sphere(1.0), skin: BONE3, far: true });
      const acrossH = norm(cross(fore, cu), cl);
      for (const k of [-1, 0, 1]) {
        const base = add(wrist, mul(acrossH, k * 0.75));
        const tip = add(add(base, mul(fore, 2.3)), mul(acrossH, k * 1.5));
        put('foreR', 'foreR', { k: 'rod', a: base, b: tip, ra: R_FINGER, rb: R_FINGER * 0.9, ramp: BONE3, far: true });
      }
    } else {
      put('foreR', 'foreR', { k: 'ball', c: wrist, ax: sphere(1.0), skin: BONE3, far: true });
      // (three finger bones, the way the forearm goes, a little apart and curling)
      const acrossH = norm(cross(fore, cu), cl);
      for (const k of [-1, 0, 1]) {
        const base = add(wrist, mul(acrossH, k * 0.75));
        const tip = add(add(base, mul(fore, 2.8 - Math.abs(k) * 0.5)), mul(cf, 0.4 + Math.abs(k) * 0.1));
        put('foreR', 'foreR', { k: 'rod', a: base, b: tip, ra: R_FINGER, rb: R_FINGER * 0.9, ramp: BONE3, far: true });
      }
    }
  }

  // --- the neck: two knobs of vertebrae under the skull ---
  const skullAt = add(s.head, knock);
  for (const k of [0.3, 0.75]) put('neck', 'neck', { k: 'ball', c: add(lerp3(s.neck, s.skull, k), mul(knock, k)), ax: sphere(1.05), skin: BONE3 });

  // --- the skull: a round cranium of bone with two sockets, the hole of the nose and a row of
  // teeth; under it the jaw, hinged at the back, which hangs a little open and drops wide; from
  // behind, a crack in the crown ---
  // (THE SKULL IS TIPPED BACK FROM THE EYE, as whatever the heroes wear on their heads is (skin.ts,
  // `wornOn`, TIPPED): the game looks down on its figures, and a face held level shows the eye
  // its crown and hides its teeth under it. It still turns and nods with the neck it is on.)
  const face = wornOn(st, s, SKULL_TIP);
  const [ff, fl, fu] = face;
  const ball3 = (c: V3, f: number, l: number, u: number): [V3, V3, V3] => {
    void c;
    return [mul(ff, f), mul(fl, l), mul(fu, u)];
  };
  const cran = at3(skullAt, face, CRANIUM.at[0], 0, CRANIUM.at[1]);
  const [Rf, Rl, Ru] = CRANIUM.r;
  // (the sockets, where on the cranium they are: turned toward whoever looks, as the heroes' eyes
  // are drawn (skin.ts, `eyesToward`), the bone of the nose between them; and, as the eye looks
  // down on the figure, set above the cranium's middle, so that they are seen in the middle of the face)
  const eyes = eyesToward(st, s);
  const midA = ((eyes[0] + eyes[1]) / 2) * D;
  const onCran = (az: number, el: number): V3 => norm([Math.cos(az) * Math.cos(el), Math.sin(az) * Math.cos(el), Math.sin(el)]);
  const sock = [onCran(midA - SOCKETS.apart * D, SOCKETS.el), onCran(midA + SOCKETS.apart * D, SOCKETS.el)];
  const nose = onCran(midA, SOCKETS.el - SOCKETS.nose);
  const cosSock = Math.cos(SOCKETS.r);
  const cosNose = Math.cos(SOCKETS.noseR);
  const cranSkin: Skin = (u, tone) => {
    for (const d of sock) if (u[0] * d[0] + u[1] * d[1] + u[2] * d[2] > cosSock) return INK;
    if (u[0] * nose[0] + u[1] * nose[1] + u[2] * nose[2] > cosNose && u[2] < nose[2] + 0.05) return INK;
    // (under a hood the face is in its shade, the brow most: the pink in the sockets burns out of the dark)
    return BONE3[kit.hood ? Math.max(0, tone - (u[2] > 0.1 ? 2 : 1)) : tone];
  };
  put('skull', 'skull', { k: 'ball', c: cran, ax: ball3(cran, Rf, Rl, Ru), skin: cranSkin });
  const onSkull = (d: V3, k = 0.94): V3 => add(cran, add(add(mul(ff, d[0] * Rf * k), mul(fl, d[1] * Rl * k)), mul(fu, d[2] * Ru * k)));
  const facingOf = (d: V3): V3 => norm(add(add(mul(ff, d[0] / Rf), mul(fl, d[1] / Rl)), mul(fu, d[2] / Ru)));
  // (the crack in its crown, as today's skull has: from the top down the back, this way and that)
  const crack = CRACK.map((d) => norm(d));
  put('skull', 'skull', { k: 'crack', pts: crack.map((d) => onSkull(d, 0.99)), facing: crack.map(facingOf) });
  // the light in each socket: a point of hot pink that burns up as the jaw is forced open, and goes out
  const burn = Math.max(0, Math.min(1, q.draw));
  const lit = 1 - Math.max(0, Math.min(1, q.out));
  const lights: Light[] = [];
  if (lit > 0.05) {
    for (const d of sock) {
      const p = onSkull(d, 0.97);
      const facing = facingOf(d);
      if (lit > 0.45) put('skull', 'skull', { k: 'dot', p, c: SOCKET, facing });
      if (dot(facing, eye) > 0.05) {
        const [x, y] = st.at(p);
        lights.push({ x, y, r: 4 + burn * 1.5, color: SOCKET, a: (0.4 + burn * 0.22) * lit });
      }
    }
  }
  /** A row of teeth across the front of whatever `at` says is under them, from `TEETH_SPAN` degrees one side of the middle of the face to as far the other. */
  const teeth = (at: (a: number) => V3, normal: (a: number) => V3, part: string): void => {
    const pts: V3[] = [];
    const facing: V3[] = [];
    for (let i = 0; i <= 24; i++) {
      const a = midA + (-TEETH_SPAN + (2 * TEETH_SPAN * i) / 24) * D;
      pts.push(at(a));
      facing.push(normal(a));
    }
    put(part, part, { k: 'teeth', pts, facing });
  };
  teeth((a) => onSkull(onCran(a, TEETH_EL), 0.98), (a) => facingOf(onCran(a, TEETH_EL)), 'skull');
  // (the dark inside the mouth, seen only when the jaw drops: behind the teeth)
  put('mouth', 'skull', { k: 'ball', c: at3(skullAt, face, MOUTH.at[0], 0, MOUTH.at[1]), ax: ball3(skullAt, MOUTH.r[0], MOUTH.r[1], MOUTH.r[2]), skin: () => INK });
  // the jaw: it turns down about its hinge at the back as it opens
  const hinge = at3(skullAt, face, JAW.hinge[0], 0, JAW.hinge[1]);
  const open = Math.max(0, Math.min(1.2, bowman ? (m.jaw ?? 0) : q.draw)) * GAPE;
  const jf = about(ff, fl, open);
  const ju = about(fu, fl, open);
  const jawC = add(hinge, add(mul(jf, JAW.at[0] - JAW.hinge[0]), mul(ju, JAW.at[1] - JAW.hinge[1])));
  put('jaw', 'jaw', { k: 'ball', c: jawC, ax: [mul(jf, JAW.r[0]), mul(fl, JAW.r[1]), mul(ju, JAW.r[2])], skin: BONE3 });
  teeth(
    (a) => add(jawC, add(add(mul(jf, Math.cos(a) * JAW.r[0] * 0.92), mul(fl, Math.sin(a) * JAW.r[1] * 0.92)), mul(ju, JAW.r[2] * 0.55))),
    (a) => norm(add(add(mul(jf, Math.cos(a)), mul(fl, Math.sin(a))), mul(ju, 0.4))),
    'jaw',
  );

  // --- the archer's hood over the skull: a hood of the red of old blood, a little bigger than the
  // cranium and turned with it, open in front from the brow down, its rim dark; inside it, round
  // the face, the dark; at the back it hangs down the nape. Torn in the crown, a seam down the back. ---
  if (kit.hood) {
    const hc = at3(cran, face, HOOD.at[0], 0, HOOD.at[1]);
    const hr: V3 = [Rf + HOOD.more[0], Rl + HOOD.more[1], Ru + HOOD.more[2]];
    const hoodSkin: Skin = (u, tone) => {
      if (u[0] > HOOD.front && u[2] < HOOD.brow) return null;
      if (u[0] > HOOD.front - HOOD.rim && u[2] < HOOD.brow + HOOD.rim) return HOOD3[0];
      // (the tear in its crown, toward the side the light comes from)
      if (Math.hypot(u[0] + 0.15, u[1] - 0.38, u[2] - 0.86) < 0.2) return INK;
      // (the seam down the back)
      if (u[0] < -0.35 && Math.abs(u[1]) < 0.06) return HOOD3[0];
      return HOOD3[tone];
    };
    put('hood', 'skull', { k: 'ball', c: hc, ax: ball3(hc, hr[0], hr[1], hr[2]), skin: hoodSkin });
    // (the dark inside it, seen round the face: the front half of a ball as big as the hood across
    // and set back in it, so that the face is in front of it and the hood's back is behind it)
    const ic = at3(cran, face, HOOD.at[0] - 1.4, 0, HOOD.at[1] - 0.2);
    put('hood', 'skull', { k: 'ball', c: ic, ax: ball3(ic, hr[0] - 1.0, hr[1] - 0.15, hr[2] - 0.3), skin: (u) => (u[0] < -0.05 ? null : INK) });
    // (and its back, hanging down the nape to the shoulders)
    const nape = add(lerp3(neckRoot, skullAt, 0.45), mul(ff, -(Rf * 0.55)));
    put('hood', 'skull', { k: 'ball', c: nape, ax: [mul(ff, 3.2), mul(fl, Rl + 0.4), mul(fu, 4.6)], skin: (u, tone) => (Math.abs(u[1]) < 0.06 && u[0] < -0.3 ? HOOD3[0] : HOOD3[tone]) });
  }

  // --- the rag at its hips: the heroes' cloth, hung from the pelvis, torn into tongues at its
  // hem and short at the sides so that the knees show (today's: art/monster_bones.ts); knotted at the back ---
  if (kit.rag) {
    const lag = mul(m.come, -0.8);
    const ps = pelvisSolid(s);
    const rings = skirtOf(s, B, { top: girdle(ps, -0.3, 0.6), drop: B.thigh * 0.78, wide: B.pelvisHalf + 1.1, deep: B.pelvisDeep + 0.9, lag, wind: m.wind, pad: 0.4 });
    put('rag', 'pelvis', { k: 'cloth', rings, ramp: RAG, look: { folds: [35, -40, 125, -130, 180], lift: 0.4 }, torn: TORN });
    put('knot', 'pelvis', { k: 'ball', c: at3(ps.c, s.hips, -(B.pelvisDeep + 1.1), 0.4, -0.6), ax: [mul(hf, 1.2), mul(hl, 1.5), mul(hu, 1.2)], skin: RAG });
  }

  // --- the archer's mantle: the same red, lying on its shoulders over the top of its ribs, torn
  // into tongues at its hem (today's: art/monster_bones.ts); it trails as it moves ---
  if (kit.hood) put('mantle', 'mantle', { k: 'cloth', rings: mantleOn(s, neckRoot, m), ramp: HOOD3, look: { folds: MANTLE_FOLDS, lift: 0.5 }, torn: MANTLE_TORN });

  // --- the archer's quiver, slung on its back: its mouth over the right shoulder, three arrows in
  // it fletched in pink; the strap across the ribs ---
  if (kit.quiver) {
    // (under the mantle: its mouth and the three pink fletchings stand up out of it behind the
    // right shoulder, and its foot shows below it on the bare back. Over the mantle it split the
    // mantle in two from behind.)
    const mouth = add(at3(s.ribs, s.chest, -(B.ribDeep + 0.7), -B.shoulderHalf * 0.6, B.chest + 3.2), knock);
    const foot = add(at3(s.ribs, s.chest, -(B.ribDeep + 0.5), B.shoulderHalf * 0.2, -4.0), knock);
    const up = norm(sub(mouth, foot));
    put('quiver', 'quiver', { k: 'rod', a: foot, b: mouth, ra: 1.05, rb: 1.25, ramp: LEATHER3 });
    put('quiver', 'quiver', { k: 'ball', c: mouth, ax: [mul(cf, 1.5), mul(cl, 1.5), mul(up, 0.45)], skin: (_u, tone) => LEATHER3[Math.min(4, tone + 1)] });
    // (three arrows standing out of its mouth, fanned a little, their fletchings pink: what shows of
    // the quiver over the shoulder from in front, as today's three pink fletchings do)
    for (const k of [-1, 0, 1]) {
      const from = add(mouth, add(mul(cl, k * 0.8), mul(cf, k === 0 ? 0.4 : -0.3)));
      const fan = norm(add(up, mul(cl, k * 0.28)));
      const mid3 = add(from, mul(fan, 1.6));
      const tip = add(from, mul(fan, 5.2 + (k === 0 ? 0.9 : 0)));
      put('fletch', 'quiver', { k: 'thread', a: from, b: mid3, c: SHAFT3, lift: 0.3 });
      put('fletch', 'quiver', { k: 'thread', a: mid3, b: tip, c: PINK[k === 0 ? 3 : 2], lift: 0.3 });
      put('fletch', 'quiver', { k: 'thread', a: add(mid3, mul(cf, 0.5)), b: add(tip, mul(cf, 0.5)), c: PINK[3], lift: 0.3 });
    }
  }

  if (!bowman) {
    // --- the sword, in the left hand; and the streak of a fast blade ---
    put('sword', 'sword', { k: 'blade', grip: s.handL, point: s.point });
    if (m.trail.length > 1) {
      const moved = len(sub(m.trail[0][1], m.trail[m.trail.length - 1][1]));
      if (moved > 9) put('streak', 'sword', { k: 'streak', trail: m.trail });
    }
  } else bowBits(st, m, stringHand, put, lights);
  return { bits, lights };
}

/**
 * How much is torn off the mantle's hem, in picture pixels, across it from the left of the
 * picture to the right (today's mantle is torn [3, 2, 3, 2, 2, 1, 2, 1, 0, 1, 0, 0, 1, 2, 1, 2, 3,
 * 2, 3, 4] across its twenty columns, facing you).
 */
const MANTLE_TORN: readonly number[] = [3, 1, 2, 0, 1, 3, 1, 0, 2, 0, 1, 3, 0, 1, 2, 1, 3, 1, 2, 4];

/**
 * THE MANTLE as rings: from round the root of the neck, out over the shoulders, down to its hem
 * over the top of the rib cage; the hem left behind by however far the figure has just moved, and
 * stirred by the wind.
 */
function mantleOn(s: Skeleton, neckRoot: V3, m: Moment): Ring[] {
  const [cf, cl, cu] = s.chest;
  const lag = mul(m.come, -0.7);
  const stir = Math.sin(m.wind * Math.PI * 2) * 0.4;
  const collar: Ring = { c: add(neckRoot, mul(cu, 0.4)), u: mul(cf, B.ribDeep * 0.75 + 0.7), v: mul(cl, B.shoulderHalf * 0.45 + 0.8) };
  // (deeper at the back than at the front, by as much again as it is set back: over the quiver on the back)
  const over: Ring = { c: add(neckRoot, add(mul(cu, -2.4), mul(cf, -MANTLE.back))), u: mul(cf, B.ribDeep + 1.5 + MANTLE.back), v: mul(cl, B.shoulderHalf + R_UPPER[0] + 1.5) };
  // (the hem is a ring tipped down at the back: short over the breast, long down the back, a cape)
  const hem: Ring = { c: add(add(add(neckRoot, mul(cu, -MANTLE.mid)), mul(cf, -0.9 - MANTLE.back + stir)), lag), u: add(mul(cf, B.ribDeep + 2.1 + MANTLE.back), mul(cu, MANTLE.tip)), v: mul(cl, B.shoulderHalf * MANTLE.narrow) };
  return [collar, over, hem];
}
/** The mantle's hem: how far below the root of the neck its middle is, and how much higher it is at the front than at the back (each as much again). */
const MANTLE = { mid: 5.4, tip: 1.2, back: 0.2, narrow: 1.12 };
/** Its folds (degrees round it from the front: see `ClothLook.folds`): none down the middle of the back, where they split it in two. */
const MANTLE_FOLDS: readonly number[] = [25, -25, 75, -75, 125, -125];

/**
 * THE BOW in the left hand: its two limbs bent from the grip to the tips (the ranger's bow, moves3.ts
 * and hero3_ranger.ts, in today's archer's dark wood), drawn back as the string comes; the string,
 * to the fingers of the string hand when they are on it; and the arrow on it, whose head turns to a
 * spark as the bow is drawn and spits at full draw. All of it falls as one thing when the archer dies.
 */
function bowBits(st: Stage, m: Moment, hand: number, put: (part: string, piece: string, shape: Shape) => void, lights: Light[]): void {
  const { s, q } = m;
  const grip = s.handL;
  const p3 = s.point;
  const ac = s.across;
  // (only a string that is held is drawn: `draw` without the hand on it is the light flaring in the sockets as it dies)
  const draw = hand === 1 ? Math.max(0, Math.min(1.1, q.draw)) : 0;
  const tipOf = (side: 1 | -1): V3 => add(grip, add(mul(ac, side * BOW3_HALF * (1 - 0.1 * draw)), mul(p3, -(BOW3_BRACE + 2.4 * draw))));
  for (const side of [1, -1] as const) {
    const ctl = add(grip, add(mul(ac, side * BOW3_HALF * 0.72), mul(p3, 0.8)));
    const t = tipOf(side);
    let last: V3 = grip;
    for (let i = 1; i <= 7; i++) {
      const k = i / 7;
      const pt = add(add(mul(grip, (1 - k) * (1 - k)), mul(ctl, 2 * k * (1 - k))), mul(t, k * k));
      put('bow', 'bow', { k: 'rod', a: last, b: pt, ra: 1.55 - 0.65 * ((i - 1) / 7), rb: 1.55 - 0.65 * k, ramp: WOOD3 });
      last = pt;
    }
  }
  // the string: to the fingers that hold it, or straight; for the instant after it is let go, flung forward
  const top = tipOf(1);
  const bot = tipOf(-1);
  const rest = add(grip, mul(p3, -BOW3_BRACE));
  if (hand === 1) {
    put('string', 'bow', { k: 'thread', a: top, b: s.handR, c: STRING3, lift: 0.2 });
    put('string', 'bow', { k: 'thread', a: s.handR, b: bot, c: STRING3, lift: 0.2 });
  } else {
    const mid3 = hand === 2 ? add(rest, mul(p3, q.pt)) : rest;
    put('string', 'bow', { k: 'thread', a: top, b: mid3, c: STRING3, lift: 0.2 });
    put('string', 'bow', { k: 'thread', a: mid3, b: bot, c: STRING3, lift: 0.2 });
  }
  if (hand === 2) return;
  // the arrow: from its nock (under the fingers, or sitting on the string) along the way the bow points
  const nock = hand === 1 ? s.handR : rest;
  const head = add(nock, mul(p3, ARROW3));
  const fl = norm(cross(p3, ac), [0, 1, 0]);
  put('arrow', 'bow', { k: 'thread', a: add(nock, mul(p3, 1.2)), b: add(head, mul(p3, -1.6)), c: SHAFT3, lift: 0.35 });
  // (pink fletching, a feather either side of the shaft by the nock)
  for (const side of [1, -1]) put('arrow', 'bow', { k: 'thread', a: add(add(nock, mul(p3, 0.4)), mul(fl, side * 0.6)), b: add(add(nock, mul(p3, 3.4)), mul(fl, side * 0.3)), c: PINK[side > 0 ? 3 : 2], lift: 0.35 });
  // the head: rusted; drawn, it is a spark of the enemy's pink burning to gold, and at full draw it spits
  const hot = Math.max(0, Math.min(1, (draw - 0.25) / 0.6));
  const spits = draw >= 0.98 && Math.floor((m.at ?? 0) * 30 + 1e-6) % 2 === 1;
  const neck = add(head, mul(p3, -1.6));
  if (hot > 0.05) {
    put('arrow', 'bow', { k: 'thread', a: neck, b: add(head, mul(p3, -0.6)), c: SOCKET, lift: 0.4 });
    put('arrow', 'bow', { k: 'thread', a: add(head, mul(p3, -0.5)), b: head, c: FLAME[spits ? 4 : 3], lift: 0.4 });
    const [x, y] = st.at(head);
    lights.push({ x, y, r: 4 + hot * 5 + (spits ? 1.5 : 0), color: SOCKET, a: 0.25 + hot * 0.3 + (spits ? 0.1 : 0) });
  } else {
    put('arrow', 'bow', { k: 'thread', a: neck, b: head, c: RUST[2], lift: 0.4 });
    put('arrow', 'bow', { k: 'thread', a: add(head, mul(p3, -0.5)), b: head, c: RUST[3], lift: 0.45 });
  }
}

function sphere(r: number): [V3, V3, V3] {
  return [[r, 0, 0], [0, r, 0], [0, 0, r]];
}

// ---------------------------------------------------------------------------------------------
// Painting a list of solids

/** The notches in the blade (how far along it, as a share of its length, and which edge) and the specks of rust and bare metal on it: today's sword's (art/monster_bones.ts). */
const NOTCHES: ReadonlyArray<readonly [number, number]> = [[0.475, 1], [0.8, -1]];

/**
 * THE RUSTED SWORD, laid along its line as the knight's great sword is (`blade` in
 * art/hero_warrior.ts, then `laidAlong`): today's skeleton's sword (art/monster_bones.ts, `sword`)
 * drawn at the angle the eye sees it and as long as the eye sees it. (hx, hy) is the hand.
 */
function rustSword(p: Sheet, hx: number, hy: number, deg: number, len: number): void {
  const [dx, dy] = dir(deg);
  const litSide = 0.65 * dy - 0.75 * dx > 0 ? 1 : -1;
  const W = 2;
  const GRIP = 2;
  const tip = 4 + len;
  const reach = len + GRIP + 8;
  for (let y = Math.floor(hy - reach); y <= Math.ceil(hy + reach); y++) {
    for (let x = Math.floor(hx - reach); x <= Math.ceil(hx + reach); x++) {
      const rx = x + 0.5 - hx;
      const ry = y + 0.5 - hy;
      const u = rx * dx + ry * dy;
      const v = (-rx * dy + ry * dx) * litSide;
      let c: string | null = null;
      if (u >= 4 && u <= tip) {
        const half = u > tip - 4 ? (tip - u) * (W / 4) : W;
        if (Math.abs(v) <= half) c = v > 0 ? RUST[3] : RUST[2];
        for (const [k, side] of NOTCHES) if (Math.abs(u - (4 + k * len)) < 0.75 && v * side > W - 0.95) c = null;
      } else if (u >= 2.2 && u < 4 && Math.abs(v) <= W + 2.6) {
        c = v > 1 ? RUST[3] : v < -2.6 ? RUST[0] : RUST[2];
      } else if (u >= 2 - GRIP && u < 2.2 && Math.abs(v) <= 1.1) {
        c = RUST[0];
      } else if (u >= -GRIP - 0.2 && u < 2 - GRIP && Math.abs(v) <= 1.7) {
        c = v > 0.3 ? RUST[3] : RUST[2];
      }
      if (c) p.set(x, y, c);
    }
  }
  const speck = (k: number, v: number, c: string): void => {
    const u = 4 + k * len;
    if (u > tip - 1) return;
    const x = Math.floor(hx + dx * u - dy * v * litSide);
    const y = Math.floor(hy + dy * u + dx * v * litSide);
    if (p.has(x, y)) p.set(x, y, c);
  };
  for (const [k, v] of [[0.15, -1.2], [0.42, -0.7], [0.7, -1.2]] as const) speck(k, v, RUST[3]);
  for (const [k, v] of [[0.35, 1.2], [0.62, 0.7]] as const) speck(k, v, RUST[2]);
}

/** A ramp a step darker if what is painted with it is on the far side of the body from the eye (skin.ts, `sided`). */
function farSide(st: Stage, ref: V3, ramp: Ramp, p: V3): Ramp {
  return st.near(p) < st.near(ref) - 1.6 ? dim(ramp) : ramp;
}

/**
 * Paint solids on a stage, a part (a sheet of skin.ts) for each part named, in the order they are
 * first named. `ref`: the middle of the body, against which a far bone is a step darker.
 */
function paintBits(st: Stage, bits: ReadonlyArray<Bit>, ref: V3): void {
  const parts = new Map<string, Sheet>();
  const sheet = (b: Bit): Sheet => {
    let p = parts.get(b.part);
    if (!p) {
      const sh = b.shape;
      const where = sh.k === 'rod' || sh.k === 'thread' ? mid(sh.a, sh.b) : sh.k === 'ball' ? sh.c : sh.k === 'blade' ? sh.grip : sh.k === 'dot' ? sh.p : sh.k === 'teeth' || sh.k === 'crack' ? sh.pts[0] : sh.k === 'cloth' ? sh.rings[0].c : sh.trail[0][1];
      p = st.part(where);
      parts.set(b.part, p);
    }
    return p;
  };
  const dots: Bit[] = [];
  for (const b of bits) {
    const sh = b.shape;
    if (sh.k === 'dot' || sh.k === 'teeth' || sh.k === 'crack') {
      dots.push(b);
      continue;
    }
    const p = sheet(b);
    if (sh.k === 'rod') rod(p, st, sh.a, sh.b, sh.ra, sh.rb, sh.far ? farSide(st, ref, sh.ramp, mid(sh.a, sh.b)) : sh.ramp);
    else if (sh.k === 'ball') ball(p, st, sh.c, sh.ax, typeof sh.skin === 'function' || !sh.far ? sh.skin : farSide(st, ref, sh.skin, sh.c));
    else if (sh.k === 'cloth') {
      cloth(p, st, sh.rings, sh.ramp, sh.look);
      if (sh.torn) tear(p, sh.torn);
    }
    else if (sh.k === 'blade') {
      const [gx, gy] = st.at(sh.grip);
      const [px, py] = st.seen(sh.point);
      const seenLong = Math.hypot(px, py);
      const deg = (Math.atan2(-py, px) * 180) / Math.PI;
      rustSword(p, gx, gy, deg, Math.max(3, BLADE3 * seenLong - 2));
      laidAlong(p, st, add(sh.grip, mul(sh.point, -3)), add(sh.grip, mul(sh.point, BLADE3 + 3)), 0.3);
    } else if (sh.k === 'streak') streak(p, st, sh.trail);
    else if (sh.k === 'thread') thread(p, st, sh.a, sh.b, sh.c, sh.lift);
  }
  // (what is drawn ON a part: only where it is painted, and only where the skin faces the eye)
  for (const b of dots) {
    const sh = b.shape;
    const p = parts.get(b.part);
    if (!p) continue;
    if (sh.k === 'dot') {
      if (dot(norm(sh.facing), st.eye) < 0.12) continue;
      const [x, y] = st.at(sh.p);
      p.mark(Math.round(x - 0.5), Math.round(y - 0.5), sh.c);
    } else if (sh.k === 'teeth') {
      // (one pixel to a column, light and dark by turns from the row's left end)
      const row = new Map<number, number>();
      for (let i = 0; i < sh.pts.length; i++) {
        if (dot(norm(sh.facing[i]), st.eye) < 0.12) continue;
        const [x, y] = st.at(sh.pts[i]);
        const xi = Math.round(x - 0.5);
        if (!row.has(xi)) row.set(xi, Math.round(y - 0.5));
      }
      const x0 = Math.min(...row.keys());
      for (const [x, y] of row) p.mark(x, y, (x - x0) % 2 === 0 ? BONE3[3] : INK);
    } else if (sh.k === 'crack') {
      for (let i = 1; i < sh.pts.length; i++) {
        if (dot(norm(sh.facing[i - 1]), st.eye) < 0.1 || dot(norm(sh.facing[i]), st.eye) < 0.1) continue;
        const [xa, ya] = st.at(sh.pts[i - 1]);
        const [xb, yb] = st.at(sh.pts[i]);
        const n = Math.max(1, Math.ceil(Math.max(Math.abs(xb - xa), Math.abs(yb - ya))));
        for (let j = 0; j <= n; j++) p.mark(Math.round(xa + ((xb - xa) * j) / n - 0.5), Math.round(ya + ((yb - ya) * j) / n - 0.5), BONE3[0]);
      }
    }
  }
}

/**
 * A HEM TORN INTO TONGUES: from the foot of each column of a cloth that is painted by itself on
 * its part, `torn` (across it, left to right) pixels are taken away.
 */
function tear(p: Sheet, torn: ReadonlyArray<number>): void {
  let x0 = p.w;
  let x1 = -1;
  const lowest = new Int16Array(p.w).fill(-1);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      if (!p.has(x, y)) continue;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      lowest[x] = y;
    }
  }
  if (x1 < 0) return;
  for (let x = x0; x <= x1; x++) {
    const n = torn[Math.min(torn.length - 1, Math.floor(((x - x0 + 0.5) / (x1 - x0 + 1)) * torn.length))];
    for (let k = 0, y = lowest[x]; k < n && y >= 0 && p.has(x, y); k++, y--) {
      p.erase(x, y);
      p.z[y * p.w + x] = NaN;
    }
  }
}

/**
 * THE BLUR OF A FAST BLADE: a crescent along where its point has been in the last thirtieth of a
 * second, widest and brightest just behind the blade (the knight's streak, `paintKnight3`), in the
 * pale of bone where his is the cyan of his blade (cyan is a friend's: a skeleton's blur is
 * today's, `smear` in art/monster_bones.ts).
 */
function streak(p: Sheet, st: Stage, all: ReadonlyArray<readonly [V3, V3]>): void {
  // (the newest two thirds of it, and the outer part of the blade: a crescent by its point, as
  // today's is, not a fan the size of the figure)
  const newest = norm(sub(all[0][1], all[0][0]));
  let keep = 1;
  while (keep < all.length && dot(norm(sub(all[keep][1], all[keep][0])), newest) > Math.cos(100 * D)) keep++;
  const trail = all.slice(0, Math.max(2, keep));
  const n = trail.length;
  const inner = (e: readonly [V3, V3], age: number): V3 => mid(e[0], e[1], 0.56 + 0.36 * Math.pow(age, 0.7));
  for (let i = n - 1; i >= 1; i--) {
    const a = trail[i];
    const b = trail[i - 1];
    const age = (i - 0.5) / (n - 1);
    p.poly([inner(a, i / (n - 1)), a[1], b[1], inner(b, (i - 1) / (n - 1))].map((v) => st.at(v)), age < 0.4 ? BONE3[3] : BONE3[2]);
  }
  for (let i = 1; i < n; i++) {
    if (i / (n - 1) > 0.5) break;
    const [x0, y0] = st.at(trail[i - 1][1]);
    const [x1, y1] = st.at(trail[i][1]);
    p.line(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), BONE3[3]);
  }
}

// ---------------------------------------------------------------------------------------------
// The moves

/** A move of the skeleton: its keys on the bones, from its rest. */
export interface SkMove {
  name: string;
  motion: Motion;
  rest: Bones;
  /** From when to when (seconds) the blade goes fast enough to blur: the blow, and only the blow. */
  blur?: readonly [number, number];
  /** What it wears and carries (the skeleton's, if not given). */
  kit?: DeadKit;
  /** Its jaw (0 shut to 1 wide) at a moment of the move, for one whose `draw` is its bow's. */
  jaw?: (t: number) => number;
}

const FR = 1 / 30;

/** One whole pose, said as the numbers that differ from standing. */
type P = Partial<Bones>;

/**
 * STANDING: it creaks. Twelve tenths of a second round, as the game's standing loop is: it sways
 * a little on its pins and the skull settles over a beat after the body; the jaw clacks shut,
 * open, shut; the sword hand drifts.
 */
function creak(): Motion {
  const R = SKELETON3_REST;
  const k = (i: number): number => i / 10;
  return {
    loop: 0,
    keys: [
      { at: 0, pose: {} },
      { at: k(2), pose: { roll: R.roll + 1.5, side: R.side - 1, lhx: R.lhx + 0.3 }, ease: 'io' },
      { at: k(3), pose: { roll: R.roll + 1.5, side: R.side - 1, faceUp: R.faceUp - 3, faceTilt: R.faceTilt + 3, lhx: R.lhx + 0.4 }, ease: 'out' },
      { at: k(4), pose: { roll: R.roll + 1.2, side: R.side - 1, faceUp: R.faceUp - 3, faceTilt: R.faceTilt + 3, lhx: R.lhx + 0.4, draw: 0 }, ease: 'hold' },
      { at: k(5), pose: { roll: R.roll + 1.0, side: R.side - 1, faceUp: R.faceUp - 2, faceTilt: R.faceTilt + 3, lhx: R.lhx + 0.4, draw: 0.42 }, ease: 'hold' },
      { at: k(6), pose: { roll: R.roll + 0.6, side: R.side - 0.5, faceUp: R.faceUp - 2, faceTilt: R.faceTilt + 2, lhx: R.lhx + 0.3, draw: 0 }, ease: 'hold' },
      { at: k(8), pose: { roll: R.roll - 1.0, side: R.side + 0.5, faceUp: R.faceUp, faceTilt: R.faceTilt, lhx: R.lhx - 0.2, draw: 0.15 }, ease: 'io' },
      { at: k(9), pose: { roll: R.roll - 1.2, side: R.side + 0.6, faceUp: R.faceUp + 1.5, faceTilt: R.faceTilt - 2, lhx: R.lhx - 0.3 }, ease: 'out' },
      { at: k(12), pose: {}, ease: 'io' },
    ],
  };
}

/** Frames of its walk, and how fast they are shown: eight, at twelve a second (today's skeleton walks eight at sixteen). */
export const PLOD_FRAMES = 8;
export const PLOD_FPS = 12;

/**
 * THE PLOD (see the head of this file). Eight poses, a heavy footfall in the first. The right leg
 * is the one that steps; the left is the one that is dragged. (Its speed over the ground is a
 * rule and is not touched: the feet travel as far as they can, and slide the rest, as every
 * walker's in the game does.)
 */
function plod(): Motion {
  const R = SKELETON3_REST;
  const L = B.upperArm + B.foreArm;
  /** A hand that dangles from its shoulder: `x` forward of it, `y` out from it (the figure's own lines). */
  const dangle = (x: number, y: number): [number, number, number] => [x, y, -Math.sqrt(Math.max(1, (L * 0.965) ** 2 - x * x - y * y))];
  //                0      1      2      3      4      5      6      7
  const RFX = [6.4, 4.8, 3.0, 1.0, -1.2, -3.8, 0.8, 4.8];
  const RFZ = [0, 0, 0, 0, 0.4, 1.7, 3.6, 1.4];
  const RFP = [-6, 0, 0, 0, 8, 32, 12, -4];
  const LFX = [-3.0, -4.6, -3.0, 0.2, 3.6, 1.6, -0.6, -2.2];
  const LFY = [0, 0.6, 2.4, 3.6, 1.0, 0.4, 0.2, 0];
  const LFZ = [1.0, 1.3, 1.1, 1.0, 0, 0, 0.2, 0.6];
  const LFP = [22, 34, 30, 16, 0, 0, 4, 12];
  const PZ = [-3.2, -4.2, -2.8, -1.0, -2.0, -1.2, -0.6, -2.0];
  const PITCH = [10, 12, 10, 6, 8, 6, 9, 12];
  const BEND = [15, 21, 18, 11, 14, 11, 13, 16];
  const ROLL = [-4, -6, 1, 6, 2, -1, -2, -3];
  const YAW = [9, 8, 4, -2, -6, -6, 0, 6];
  const FACEUP = [-4, -18, -16, -8, -6, -12, -9, -5];
  const TILT = [6, 18, 16, 9, 5, 11, 13, 9];
  const JAW = [0.1, 0.7, 0.42, 0.1, 0.36, 0.12, 0.05, 0.05];
  const RATTLE = [0, 1.0, -0.8, 0.3, 0.7, -0.5, 0, 0];
  const RHX = [-3.5, -5.5, -4.5, -1.5, 2.0, 4.0, 3.5, 0.5];
  const LHX = [2.6, 3.4, 2.8, 1.4, -0.4, -1.2, -0.6, 1.2];
  const WEL = [-57, -54, -59, -64, -66, -64, -62, -60];
  const keys: Key3[] = [];
  for (let i = 0; i <= PLOD_FRAMES; i++) {
    const j = i % PLOD_FRAMES;
    const [rx, ry, rz] = dangle(RHX[j], -1.4);
    const [lx, ly, lz] = dangle(LHX[j], 1.8);
    const pose: P = {
      px: -0.4, pz: PZ[j], pitch: PITCH[j], bend: BEND[j], roll: ROLL[j], yaw: YAW[j], twist: -YAW[j] * 0.6 + 4, side: -ROLL[j] * 0.5,
      faceUp: FACEUP[j], faceTilt: TILT[j], faceTurn: -2 - YAW[j] * 0.3,
      rfx: RFX[j], rfy: -0.2, rfz: RFZ[j], rfp: RFP[j], rft: -12, rk: -6,
      lfx: LFX[j], lfy: LFY[j], lfz: LFZ[j], lfp: LFP[j], lft: 8 + LFY[j] * 4, lk: 18 + LFY[j] * 6,
      rhIn: 1, rhx: rx, rhy: ry - B.shoulderHalf * 0, rhz: rz, re: 0,
      lhIn: 1, lhx: lx, lhy: ly, lhz: lz, le: -4,
      wAz: 12 + LHX[j] * 2, wEl: WEL[j],
      draw: JAW[j], pt: RATTLE[j],
    };
    keys.push({ at: i / PLOD_FPS, pose, ease: 'lin' });
  }
  return { keys, loop: 0 };
}

/**
 * The moment its blow lands, in seconds from the start of the chop: the skeleton's `windup` in
 * game/defs.ts (MONSTERS); after it the game gives a monster TUNE.monsterRecover (0.3 s) before
 * it does anything else, so the chop is over 0.3 s after the blow (art/mkit.ts, `strike`).
 */
export const CHOP_HIT = 0.4;
const CHOP_AFTER = 0.3;

/**
 * THE CHOP (see the head of this file). Raised by half the wind-up and HELD, trembling, to the
 * blow at the wind-up's end; the blow on the twelfth frame; over at the twenty-first.
 */
function chop(): Motion {
  const R = SKELETON3_REST;
  // wound up: the sword hand above and behind its shoulder, the blade pointing back over the
  // skull; the frame leans back with the left shoulder drawn back; the other arm flung out in
  // front; the skull thrown back and the jaw wide
  const wound: P = {
    px: -1.4, pz: -1.8, yaw: 10, pitch: -7, roll: 1, twist: 24, bend: -14, side: 3,
    faceUp: 16, faceTilt: 4, faceTurn: -4,
    lfx: -3.0, lfy: 0.6, lft: 4, lk: 8, rfx: 4.0, rfy: -0.4, rft: -10, rk: -6,
    // (the hand up beside the skull, on its own side; the blade back over the skull, behind it,
    // pointing back and across: seen from where the game looks, up and back, as today's is)
    lhIn: 1, lhx: 0, lhy: 4.5, lhz: 8.5, le: 20,
    rhIn: 1, rhx: 12, rhy: -6, rhz: -2, re: 0,
    wAz: 205, wEl: 45, draw: 1,
  };
  const shake = (dx: number, dz: number, more: P = {}): P => ({ ...wound, lhx: (wound.lhx ?? 0) + dx, lhz: (wound.lhz ?? 0) + dz, ...more });
  // the blow: down in front, the whole frame thrown after it, a step in with the left foot
  const blow: P = {
    px: 5.0, pz: -3.8, yaw: -12, pitch: 15, roll: -2, twist: -18, bend: 22, side: 0,
    faceUp: -18, faceTilt: 8, faceTurn: 0,
    lfx: 8.0, lfy: 0.8, lfz: 0, lfp: 0, lft: 6, lk: 6, rfx: -3.8, rfy: -0.4, rfz: 0.9, rfp: 26, rft: -12, rk: -8,
    lhIn: 1, lhx: 13, lhy: -1, lhz: -7.5, le: 0,
    rhIn: 1, rhx: -6, rhy: -4, rhz: -12.5, re: 0,
    wAz: -4, wEl: -28, draw: 0,
  };
  const after: P = { ...blow, px: 3.6, pz: -3.9, pitch: 15, bend: 23, faceUp: -24, faceTilt: 12, lhx: 9.5, lhz: -13, wEl: -56, draw: 0.32, pt: 0.6 };
  return {
    hit: CHOP_HIT,
    keys: [
      { at: 0, pose: {} },
      // (the arm creaks up: past the hip, then up the side, then over)
      { at: 3 * FR, pose: { pz: R.pz - 0.6, yaw: 5, twist: 12, bend: 2, faceUp: 4, lhIn: 1, lhx: -5, lhy: 3.5, lhz: -6, le: 10, wAz: 175, wEl: -20, draw: 0.5 }, ease: 'out' },
      { at: 6 * FR, pose: wound, ease: 'out' },
      // (held, the sword trembling a pixel to and fro in the bony hand)
      { at: 7 * FR, pose: shake(0.5, 0.3), ease: 'hold' },
      { at: 8 * FR, pose: shake(-0.3, 0, { pt: 0.4 }), ease: 'hold' },
      { at: 9 * FR, pose: shake(0.5, 0.4), ease: 'hold' },
      { at: 10 * FR, pose: shake(-0.4, 0.1, { pt: -0.4 }), ease: 'hold' },
      { at: 11 * FR, pose: shake(0.2, 0.5, { faceUp: 14 }), ease: 'hold' },
      { at: CHOP_HIT, pose: blow, ease: 'in' },
      { at: CHOP_HIT + 3 * FR, pose: after, ease: 'out' },
      { at: CHOP_HIT + CHOP_AFTER, pose: {}, ease: 'io' },
    ],
  };
}

export const STAND3: SkMove = { name: 'The skeleton stands', motion: creak(), rest: SKELETON3_REST };
export const PLOD3: SkMove = { name: 'The skeleton plods', motion: plod(), rest: SKELETON3_REST };
export const CHOP3: SkMove = { name: 'The skeleton chops', motion: chop(), rest: SKELETON3_REST, blur: [CHOP_HIT, CHOP_HIT] };

/** When a move ends, and when its loop begins (if it goes round). */
function spanOf(m: SkMove): { end: number; from: number | undefined } {
  const keys = m.motion.keys;
  return { end: keys.length ? keys[keys.length - 1].at : 0, from: m.motion.loop };
}

/** The moment `t` of a move, folded into its loop if it goes round. */
function folded(m: SkMove, t: number): number {
  const { end, from } = spanOf(m);
  if (from === undefined) return Math.max(0, Math.min(end, t));
  const long = end - from;
  if (long <= 1e-6) return from;
  const k = ((t - from) % long + long) % long;
  return from + k;
}

/** The bones at a moment of a move. */
function posedAt(m: SkMove, t: number): Posed {
  return bonesAt(m.motion.keys, m.rest, folded(m, t));
}

/** Where the wind has got to (the rag stirs in it): once round in twelve tenths of a second. */
function windOf(t: number): number {
  return ((t / 1.2) % 1 + 1) % 1;
}

/** What a frame of a move is painted from: the bones now, a moment before, and where the blade has just been. */
function momentOf(m: SkMove, t: number): Moment {
  const q = posedAt(m, t);
  const s = solve(B, q);
  const before = solve(B, posedAt(m, t - FR));
  const trail: [V3, V3][] = [];
  for (let i = 0; i <= 8; i++) {
    const sk = i === 0 ? s : solve(B, posedAt(m, t - (FR * i) / 8));
    trail.push([add(sk.handL, mul(sk.point, 4)), add(sk.handL, mul(sk.point, 4 + BLADE3))]);
  }
  // (a move that is played once has no "moment before" its start)
  const loops = m.motion.loop !== undefined;
  const come = loops || t >= FR ? sub(s.pelvis, before.pelvis) : ([0, 0, 0] as V3);
  const blurs = m.blur !== undefined && t >= m.blur[0] - 1e-6 && t <= m.blur[1] + 1e-6;
  const out: Moment = { s, q, come, wind: windOf(t), trail: blurs ? trail : [trail[0]] };
  if (m.jaw) out.jaw = m.jaw(t);
  if (m.kit && m.kit.carry === 'bow') out.at = t;
  return out;
}

/** The crisp edge of light round it while it lives: the enemy's pink. */
const RIM = ENEMY_RIM;

/** ONE FRAME OF A MOVE, seen from in front or from behind: as the game would show it. */
export function paintSkeleton3(m: SkMove, t: number, view: GameView, rim: string | null = RIM): Painted {
  const st = stage(view);
  const mo = momentOf(m, t);
  const { bits, lights } = skeletonBits(st, mo, m.kit);
  paintBits(st, bits, mo.s.pelvis);
  return { px: st.whole(rim), lights };
}

// ---------------------------------------------------------------------------------------------
// Its death: it comes apart

/** How long it takes to fall apart, in seconds (today's skeleton: 0.8; the brute 1.05). */
export const DIE3_TIME = 1.0;

/**
 * THE BONES AS THEY GIVE WAY, up to the moment each piece lets go: a jolt (the skull thrown back,
 * the jaw wide, the light in the sockets flaring), then the knees go and the frame drops, folding
 * forward, the skull hanging, as the light goes out.
 */
function giving(): Motion {
  const R = SKELETON3_REST;
  const limp: P = { lhIn: 0, lhx: 1.5, lhy: 2.4, lhz: HANG + 1.2, le: 0, rhIn: 0, rhx: 1.0, rhy: -2.2, rhz: HANG + 0.6, re: 0 };
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.05, pose: { px: R.px - 1.4, pz: R.pz - 0.4, pitch: -3, bend: -5, faceUp: 10, faceTilt: 4, draw: 1, pt: 0.8 }, ease: 'out' },
      { at: 0.13, pose: { ...limp, px: -1.6, pz: -5.5, pitch: 6, bend: 12, faceUp: -12, faceTilt: 18, draw: 0.55, out: 0.4, lfx: 2.4, rfx: -1.0, lk: 14, rk: -12, pt: -0.6 }, ease: 'in' },
      { at: 0.25, pose: { ...limp, px: -0.6, pz: -12.5, pitch: 16, bend: 26, faceUp: -30, faceTilt: 26, draw: 0.3, out: 0.85, lfx: 3.4, rfx: -0.6, lk: 22, rk: -20 }, ease: 'in' },
      { at: 0.4, pose: { ...limp, px: -0.4, pz: -14.2, pitch: 18, bend: 30, faceUp: -36, faceTilt: 30, draw: 0.25, out: 1, lfx: 3.6, rfx: -0.4, lk: 24, rk: -22 }, ease: 'out' },
    ],
  };
}
const GIVING = giving();

/**
 * Each piece: when it lets go (seconds from the blow), and where it comes to lie: on the floor,
 * `to` (forward, to the left) from where the figure stood, turned `spin` degrees about the
 * upright from the way it fell, and laid down by its long line (`lay: 'axis'`: a bone, the
 * sword) or by keeping its flat side down (`'flat'`: a rib, the jaw, the pelvis), or on its side
 * (`'side'`: the skull). `hop`: how high it bounces when it lands.
 */
interface Fall {
  from: number;
  to: readonly [number, number];
  spin: number;
  lay: 'axis' | 'flat' | 'side';
  hop?: number;
  /** Roll toward the eye: the skull. */
  toEye?: number;
}
const FALLS: Readonly<Record<string, Fall>> = {
  sword: { from: 0.06, to: [10, 9], spin: 25, lay: 'axis', hop: 2 },
  jaw: { from: 0.1, to: [11, -6], spin: 50, lay: 'flat', hop: 1.5 },
  foreR: { from: 0.17, to: [5, -13], spin: -35, lay: 'axis', hop: 1 },
  foreL: { from: 0.19, to: [7, 12], spin: 40, lay: 'axis' },
  upperR: { from: 0.21, to: [-2, -12], spin: 55, lay: 'axis' },
  upperL: { from: 0.22, to: [0, 13], spin: -45, lay: 'axis', hop: 1 },
  sternum: { from: 0.24, to: [6, 3], spin: 75, lay: 'axis' },
  rib0L: { from: 0.24, to: [3, 7], spin: 30, lay: 'flat', hop: 1 },
  rib1L: { from: 0.25, to: [-2, 9.5], spin: -25, lay: 'flat' },
  rib2L: { from: 0.27, to: [-7, 7], spin: 45, lay: 'flat', hop: 1.2 },
  rib3L: { from: 0.26, to: [3, 12], spin: -60, lay: 'flat' },
  rib4L: { from: 0.28, to: [-5, 12], spin: 20, lay: 'flat', hop: 0.8 },
  rib0R: { from: 0.25, to: [4, -7], spin: -35, lay: 'flat' },
  rib1R: { from: 0.24, to: [-2, -9], spin: 30, lay: 'flat', hop: 1.2 },
  rib2R: { from: 0.26, to: [-7, -7], spin: -50, lay: 'flat' },
  rib3R: { from: 0.27, to: [2, -12], spin: 55, lay: 'flat', hop: 1 },
  rib4R: { from: 0.28, to: [-6, -12], spin: -20, lay: 'flat' },
  thighL: { from: 0.26, to: [-8, 5], spin: 35, lay: 'axis' },
  thighR: { from: 0.27, to: [-9, -5], spin: -30, lay: 'axis' },
  shinL: { from: 0.28, to: [-3, 10], spin: -25, lay: 'axis' },
  shinR: { from: 0.28, to: [-4, -11], spin: 35, lay: 'axis' },
  spine: { from: 0.29, to: [-3, 1], spin: 20, lay: 'axis' },
  pelvis: { from: 0.3, to: [-2, 0], spin: 0, lay: 'flat' },
  neck: { from: 0.32, to: [5, -3], spin: 65, lay: 'axis' },
  skull: { from: 0.36, to: [3, -9], spin: 0, lay: 'side', hop: 1.6, toEye: 6 },
};
/** How hard things fall, in the figure's own lengths a second each second (a figure 52 tall is about a man's height: a little harder than the earth's, so that it clatters down). */
const G = 400;

/** A rotation, as a function of a direction. */
type Turn = (v: V3) => V3;
const noTurn: Turn = (v) => v;

/** The turn that takes direction `a` onto `b` (both units), by the short way, `k` of the way. */
function turnOnto(a: V3, b: V3, k = 1): Turn {
  const ax = cross(a, b);
  const sn = len(ax);
  const cs = Math.max(-1, Math.min(1, dot(a, b)));
  const ang = (Math.atan2(sn, cs) / D) * k;
  if (sn < 1e-6) {
    if (cs > 0) return noTurn;
    // (opposite: any axis square to it)
    const other = norm(cross(a, Math.abs(a[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]));
    return (v) => about(v, other, 180 * k);
  }
  const axis = mul(ax, 1 / sn);
  return (v) => about(v, axis, ang);
}

/** Every point and direction of a solid, moved by a rigid motion: points turned about `c0` and carried to `c1`. */
function moved(sh: Shape, turn: Turn, c0: V3, c1: V3): Shape {
  const P = (p: V3): V3 => add(c1, turn(sub(p, c0)));
  switch (sh.k) {
    case 'rod':
      return { ...sh, a: P(sh.a), b: P(sh.b) };
    case 'ball':
      return { ...sh, c: P(sh.c), ax: [turn(sh.ax[0]), turn(sh.ax[1]), turn(sh.ax[2])] };
    case 'blade':
      return { ...sh, grip: P(sh.grip), point: turn(sh.point) };
    case 'dot':
      return { ...sh, p: P(sh.p), facing: turn(sh.facing) };
    case 'teeth':
    case 'crack':
      return { ...sh, pts: sh.pts.map(P), facing: sh.facing.map(turn) };
    case 'thread':
      return { ...sh, a: P(sh.a), b: P(sh.b) };
    default:
      return sh;
  }
}

/** The points of a solid (for its middle, and for how low it reaches), and how far below each the solid goes. */
function extent(sh: Shape): [V3, number][] {
  switch (sh.k) {
    case 'rod':
      return [[sh.a, sh.ra], [sh.b, sh.rb]];
    case 'ball': {
      const dz = Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
      return [[sh.c, dz]];
    }
    case 'blade':
      return [[sh.grip, 1], [add(sh.grip, mul(sh.point, BLADE3 + 4)), 0.5]];
    case 'thread':
      return [[sh.a, 0.3], [sh.b, 0.3]];
    default:
      return [];
  }
}

/** The main line of a piece (its longest stretch, from end to end) and the up of its flat side. */
function linesOf(bits: ReadonlyArray<Bit>, s: Skeleton, piece: string, face: readonly [V3, V3, V3]): { axis: V3; up: V3; side: V3 } {
  if (piece === 'skull' || piece === 'jaw') return { axis: face[0], up: face[2], side: face[1] };
  // (a bow lies flat: the flat of it, in which its limbs and string are, down on the floor)
  if (piece === 'bow') return { axis: s.across, up: norm(cross(s.point, s.across), [0, 0, 1]), side: s.point };
  if (piece === 'pelvis') return { axis: s.hips[0], up: s.hips[2], side: s.hips[1] };
  if (piece.startsWith('rib') || piece === 'sternum') return { axis: s.chest[1], up: s.chest[2], side: s.chest[0] };
  let a: V3 = [0, 0, 1];
  let best = -1;
  const pts: V3[] = [];
  for (const b of bits) for (const [p] of extent(b.shape)) pts.push(p);
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = len(sub(pts[i], pts[j]));
      if (d > best) {
        best = d;
        a = sub(pts[j], pts[i]);
      }
    }
  }
  const axis = norm(a, [0, 0, 1]);
  return { axis, up: [0, 0, 1], side: norm(cross([0, 0, 1], axis), [0, 1, 0]) };
}

/** The middle of a piece's solids. */
function middleOf(bits: ReadonlyArray<Bit>): V3 {
  let sum: V3 = [0, 0, 0];
  let n = 0;
  for (const b of bits) {
    for (const [p] of extent(b.shape)) {
      sum = add(sum, p);
      n++;
    }
  }
  return n ? mul(sum, 1 / n) : [0, 0, 0];
}

const easeIO = (k: number): number => {
  const v = Math.max(0, Math.min(1, k));
  return v * v * (3 - 2 * v);
};

/**
 * THE SKELETON `k` OF THE WAY THROUGH ITS DEATH (0: as it stood when the blow fell; 1: the heap
 * of its bones, lying where they will lie), seen from in front or from behind.
 */
export function deathOf3(k: number, view: GameView, u: Undoing = SWORD_UNDOING): Painted {
  const st = stage(view);
  const t = Math.max(0, Math.min(1, k)) * DIE3_TIME;
  const FALLS_ = u.falls;
  // the bones now, for whatever has not let go yet
  const now = dyingAt(u, t);
  const live = skeletonBits(st, now, u.kit);
  const gone = (piece: string): boolean => {
    const f = FALLS_[piece];
    return f !== undefined && t >= f.from;
  };
  const bits: Bit[] = [];
  for (const b of live.bits) if (b.shape.k !== 'cloth' && !gone(b.piece)) bits.push(b);
  // (the middle of the heap, against which a far bone is a step darker: where the pelvis is)
  let ref: V3 = now.s.pelvis;
  /** Where the breast bone has come to, once it has let go: the mantle comes down onto it. */
  let breast: V3 | null = null;
  for (const piece of Object.keys(FALLS_)) {
    const f = FALLS_[piece];
    if (t < f.from) continue;
    const l = letGo(st, view, u, piece, f);
    const tau = t - f.from;
    // (it falls as a thing falls, slowly at first and then faster; it bounces; across the floor it slows as it lands)
    const p = Math.min(1, tau / l.fallT);
    let z = l.c0[2] + (l.rest[2] - l.c0[2]) * p * p;
    if (tau > l.fallT && tau < l.fallT + l.bounceT) z = l.rest[2] + l.hop * Math.sin((Math.PI * (tau - l.fallT)) / l.bounceT);
    const across = 1 - (1 - Math.min(1, tau / (l.fallT + l.bounceT * 0.5))) ** 2;
    const c1: V3 = [l.c0[0] + (l.rest[0] - l.c0[0]) * across, l.c0[1] + (l.rest[1] - l.c0[1]) * across, z];
    // (it turns as it falls, and has turned all the way by the time it has come to rest)
    const turn = l.turn(easeIO(tau / (l.fallT + l.bounceT * 0.6)));
    for (const b of l.was) bits.push({ part: `p_${piece}`, piece, shape: moved(b.shape, turn, l.c0, c1) });
    if (piece === 'pelvis') ref = c1;
    if (piece === 'sternum') breast = c1;
  }
  // the rag: it hangs from the pelvis while the pelvis stands, and comes down with it; once the
  // pelvis lies, it lies round it on the floor, torn hem and all
  if (u.kit.rag) {
    if (!gone('pelvis')) {
      for (const b of live.bits) if (b.shape.k === 'cloth' && b.part === 'rag') bits.push(b);
    } else {
      const rings = ragRings(dyingAt(u, FALLS_.pelvis.from).s, ref, t - FALLS_.pelvis.from);
      bits.push({ part: 'rag', piece: 'pelvis', shape: { k: 'cloth', rings, ramp: RAG, look: { folds: [35, -40, 125, -130, 180], flat: rings[0].c[2] < 2.5 }, torn: TORN.map((n) => Math.round(n * 0.5)) } });
    }
  }
  // the mantle: on the shoulders while the rib cage stands; then it comes down, and lies spread
  // over the bones where the breast bone came to rest, torn hem and all
  if (u.kit.hood) {
    if (!gone('sternum') || !breast) {
      for (const b of live.bits) if (b.shape.k === 'cloth' && b.part === 'mantle') bits.push(b);
    } else {
      const rings = mantleDown(dyingAt(u, FALLS_.sternum.from).s, breast, t - FALLS_.sternum.from);
      bits.push({ part: 'mantle', piece: 'mantle', shape: { k: 'cloth', rings, ramp: HOOD3, look: { folds: MANTLE_FOLDS, flat: rings[0].c[2] < 2.5 }, torn: MANTLE_TORN.map((n) => Math.round(n * 0.6)) } });
    }
  }
  paintBits(st, bits, ref);
  // the light in the sockets flares, and is out by the time the skull lets go
  return { px: st.whole(null), lights: gone('skull') ? [] : live.lights };
}

/**
 * HOW ONE OF THE DEAD COMES APART: what it wears and carries, how each piece falls, and how its
 * bones give way up to the moment each piece lets go.
 */
export interface Undoing {
  kit: DeadKit;
  falls: Readonly<Record<string, Fall>>;
  dying: SkMove;
}

/** The dying skeleton's bones as they give way. */
const DYING: SkMove = { name: 'The skeleton gives way', motion: GIVING, rest: SKELETON3_REST };
const SWORD_UNDOING: Undoing = { kit: SWORDSMAN, falls: FALLS, dying: DYING };

/** One of the dead at a moment of its death, up to the moment each piece lets go (it has no blur of a blade: it has let go of it). */
function dyingAt(u: Undoing, t: number): Moment {
  const q = posedAt(u.dying, t);
  const out: Moment = { s: solve(B, q), q, come: [0, 0, 0], wind: windOf(t), trail: [] };
  if (u.dying.jaw) out.jaw = u.dying.jaw(t);
  if (u.kit.carry === 'bow') out.at = t;
  return out;
}

/**
 * THE MANTLE, COMING DOWN: from the shoulders it falls onto the bones (`at`: where the breast bone
 * came to rest), and lies spread over them on the floor. `since`: how long since the breast bone let go.
 */
function mantleDown(s: Skeleton, at: V3, since: number): Ring[] {
  const f = norm([s.chest[0][0], s.chest[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const fall = Math.min(1, since / 0.24);
  const z0 = s.neck[2] - 2.4;
  const z = z0 + (0.9 - z0) * fall * fall;
  const top: Ring = { c: [at[0], at[1], z + 1.0 + 1.6 * (1 - fall)], u: mul(f, (B.ribDeep * 0.75 + 0.7) * (1 + 0.6 * fall)), v: mul(l, (B.shoulderHalf * 0.45 + 0.8) * (1 + 0.5 * fall)) };
  const hem: Ring = { c: [at[0] - 0.6 * fall, at[1], Math.max(0.4, z - 4.8 * (1 - fall))], u: mul(f, B.ribDeep + 2.1 + 2.6 * fall), v: mul(l, B.shoulderHalf + 2.0 + 1.4 * fall) };
  return [top, hem];
}

/** A piece as it was at the moment it let go, and how it comes to lie: worked out once for each view. */
interface LetGo {
  was: Bit[];
  /** Its middle when it let go, and where its middle comes to rest. */
  c0: V3;
  rest: V3;
  /** How it is turned `k` of the way from as it was to as it lies. */
  turn: (k: number) => Turn;
  fallT: number;
  bounceT: number;
  hop: number;
}
const LET_GO = new Map<Undoing, Map<GameView, Map<string, LetGo>>>();

function letGo(st: Stage, view: GameView, u: Undoing, piece: string, f: Fall): LetGo {
  let byView = LET_GO.get(u);
  if (!byView) LET_GO.set(u, (byView = new Map()));
  let of = byView.get(view);
  if (!of) byView.set(view, (of = new Map()));
  const have = of.get(piece);
  if (have) return have;
  const then = dyingAt(u, f.from);
  // (no light is left in a skull that has let go; and the rag is not a rigid thing: see ragRings)
  const was = skeletonBits(st, then, u.kit).bits.filter((b) => b.piece === piece && b.shape.k !== 'cloth' && !(b.shape.k === 'dot' && b.shape.c === SOCKET));
  const c0 = middleOf(was);
  const lines = linesOf(was, then.s, piece, wornOn(st, then.s, SKULL_TIP));
  const Z: V3 = [0, 0, 1];
  // how it lies: turned so that its long line is level (or its flat side down, or onto its side), then spun about the upright
  let lay: (k: number) => Turn;
  if (f.lay === 'axis') {
    const flat = norm([lines.axis[0], lines.axis[1], 0], norm([c0[0], c0[1], 0], [1, 0, 0]));
    lay = (k) => turnOnto(lines.axis, flat, k);
  } else if (f.lay === 'flat') lay = (k) => turnOnto(lines.up, Z, k);
  else {
    // the skull: onto its side, its face turned toward the eye (and a little aside)
    const first = turnOnto(lines.side, Z);
    const faceNow = first(lines.axis);
    const toward = norm([st.eye[0], st.eye[1], 0], [1, 0, 0]);
    const second = turnOnto(norm([faceNow[0], faceNow[1], 0], [1, 0, 0]), norm(add(toward, [0.3 * toward[1], -0.3 * toward[0], 0]), toward));
    const whole: Turn = (v) => second(first(v));
    lay = (k) => slerpTurn(whole, k);
  }
  const turn = (k: number): Turn => {
    const t1 = lay(k);
    return (v) => about(t1(v), Z, f.spin * k);
  };
  // where it comes to lie: its lowest point on the floor, at `to` from where the figure stood (the skull: rolled toward the eye)
  const full = turn(1);
  let lowest = Infinity;
  for (const b of was) for (const [p, r] of extent(moved(b.shape, full, c0, [0, 0, 0]))) lowest = Math.min(lowest, p[2] - r);
  const eyeFlat = norm([st.eye[0], st.eye[1], 0], [1, 0, 0]);
  const rest: V3 = [f.to[0] + (f.toEye ?? 0) * eyeFlat[0], f.to[1] + (f.toEye ?? 0) * eyeFlat[1], -lowest + 0.35];
  // how long it takes to fall that far (as a thing falls), and to bounce
  const fallT = Math.sqrt((2 * Math.max(0.5, c0[2] - rest[2])) / G);
  const hop = f.hop ?? 0.6;
  const l: LetGo = { was, c0, rest, turn, fallT, bounceT: Math.sqrt((2 * hop) / G) * 2, hop };
  of.set(piece, l);
  return l;
}

/** A turn `k` of the way: the same axis and a share of the angle (found from where it takes two directions). */
function slerpTurn(full: Turn, k: number): Turn {
  // the axis and angle of a rotation, from where it takes the three lines of space
  const ex = full([1, 0, 0]);
  const ey = full([0, 1, 0]);
  const ez = full([0, 0, 1]);
  const tr = ex[0] + ey[1] + ez[2];
  const ang = Math.acos(Math.max(-1, Math.min(1, (tr - 1) / 2)));
  if (ang < 1e-5) return noTurn;
  let axis: V3 = [ey[2] - ez[1], ez[0] - ex[2], ex[1] - ey[0]];
  if (len(axis) < 1e-5) {
    // (half a turn: the axis is the line the turn leaves where it is)
    const xx = Math.sqrt(Math.max(0, (ex[0] + 1) / 2));
    const yy = Math.sqrt(Math.max(0, (ey[1] + 1) / 2));
    const zz = Math.sqrt(Math.max(0, (ez[2] + 1) / 2));
    axis = [xx, yy * Math.sign(ex[1] || 1), zz * Math.sign(ex[2] || 1)];
  }
  const a = norm(axis);
  return (v) => about(v, a, (ang / D) * k);
}

/**
 * THE RAG, COMING DOWN: it goes with the pelvis (`at`, its middle), hanging from it as it falls,
 * and once it lies it is DRAPED OVER IT on the floor, its torn hem spread round it (what lies under
 * its edge is under the cloth). `since`: how long since the pelvis let go.
 */
function ragRings(s: Skeleton, at: V3, since: number): Ring[] {
  const wide = B.pelvisHalf + 1.5;
  const deep = B.pelvisDeep + 1.2;
  const long = B.thigh * 0.86;
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  // (over the top of the pelvis, and down from there to the floor: as the pelvis comes down, what
  // hung below it comes to lie on the floor round it)
  const top = at[2] + 2.0;
  const hemZ = Math.max(0.4, top - long);
  const spread = Math.min(1, Math.max(0, (long - (top - 0.4)) / long));
  const settle = Math.min(1, since * 5);
  const topRing: Ring = { c: [at[0], at[1], top], u: mul(f, deep * (1 - 0.35 * spread)), v: mul(l, wide * (1 - 0.35 * spread)) };
  const hem: Ring = { c: [at[0] + 0.8 * settle, at[1], hemZ], u: mul(f, deep + 0.6 + 2.6 * spread), v: mul(l, wide + 0.6 + 2.2 * spread) };
  return [topRing, hem];
}

// ---------------------------------------------------------------------------------------------
// As the game holds it

/** The pool of light behind it, on the bones' canvas (art/mkit.ts, MENACE, moved to this canvas). */
const MENACE3: Light = { x: CANVAS3.ax - 2, y: CANVAS3.ay - 28, r: 40, color: '#ff3a78', a: 0.13 };

/** Frames a second of the standing loop, and how many frames it has (the game's own). */
const STAND_FRAMES = 12;
const STAND_FPS = 10;
const CHOP_FPS = 30;

/** A frame of a move as the game holds it: cut down to the figure, with its lights and its pool of light. */
function spriteOf(m: SkMove, t: number, view: GameView): Sprite {
  return toSprite(paintSkeleton3(m, t, view), MENACE3, CANVAS3.ax, CANVAS3.ay);
}

function animSet3(view: GameView): AnimSet {
  const idle = lazyFrames(STAND_FRAMES, (i) => spriteOf(STAND3, i / STAND_FPS, view));
  const walk = lazyFrames(PLOD_FRAMES, (i) => spriteOf(PLOD3, i / PLOD_FPS, view));
  const n = Math.round((CHOP_HIT + CHOP_AFTER) * CHOP_FPS) + 1;
  const attack: Clip = { frames: lazyFrames(n, (i) => spriteOf(CHOP3, i / CHOP_FPS, view)), fps: CHOP_FPS, hit: CHOP_HIT };
  const pick = (seconds: number): number => Math.max(0, Math.min(n - 1, Math.round(seconds * CHOP_FPS)));
  const picks = [pick(CHOP_HIT * 0.7), pick(CHOP_HIT + 0.035), pick(((n - 1) / CHOP_FPS + CHOP_HIT) / 2)];
  const dieN = Math.round(DIE3_TIME * DEATH_FPS) + 1;
  // (a dying thing has no pool of light behind it, and no edge of light round it)
  const die: Clip = { frames: lazyFrames(dieN, (i) => toSprite(deathOf3(i / (dieN - 1), view), null, CANVAS3.ax, CANVAS3.ay)), fps: DEATH_FPS };
  return { idle, walk, attack: lazyFrames(3, (i) => attack.frames[picks[i]]), idleFps: STAND_FPS, walkFps: PLOD_FPS, clips: { attack, die } };
}

/** THE SKELETON ON THE BONES, in the shape the game holds a monster's pictures in (art/actor_types.ts). */
export function makeSkeletonArt3(): ActorArt {
  return { front: animSet3('front'), back: animSet3('back') };
}

// =============================================================================================
// THE BONE ARCHER (see the head of this file): the skeleton's body and painter, today's archer's
// hood, mantle, quiver and bow, and moves of its own written on the same keys.

/**
 * HOW THE ARCHER STANDS: the skeleton's hunch, a little straighter (it is lighter on its feet, as
 * today's is), turned a little to its right so that the bow hand is forward; the skull up and
 * looking ahead, lolling a little.
 */
const ARCHER3_BASE: Bones = {
  ...standing(B),
  pz: -0.8, px: -0.3, yaw: -10, pitch: 2, roll: 2, twist: -2, bend: 7, side: -2,
  faceTurn: 6, faceUp: 0, faceTilt: 6,
  lfx: 2.0, lfy: 0.6, lft: 10, lk: 8, rfx: -1.6, rfy: -0.4, rft: -18, rk: -10,
  le: -4, re: 8,
  draw: 0, pt: 0, out: 0, prop: 1,
};

/**
 * WHERE THE BOW IS WHEN NOTHING IS GOING ON: low in front of the left hip, out from the body so
 * that the whole of it shows, an arrow on the string pointing at the floor ahead (WEAPONS REST
 * LOW: the art rulebook; today's archer holds it so). The bow hand from its shoulder, along the
 * chest's own forward, left and up; the way the arrow points; how far the bow is rolled about it.
 */
const LOW_GRIP: V3 = [4, 6, -14];
const LOW_AZ = 20;
const LOW_EL = -30;
const LOW_ROLL = -30;

/**
 * THE BOW HELD LOW, AN ARROW ON THE STRING UNDER THE FINGERS OF THE RIGHT HAND, for a pose of the
 * body (`body`, over the archer's stance): the bow hand at `grip` (as LOW_GRIP), the arrow pointing
 * `az`, `el`, the bow rolled `roll`. Both hands are given from their shoulders along the FIGURE's
 * own lines (`HandIn` 1), so that the string hand is on the string however the body is turned.
 */
function lowBow(body: P, grip: V3 = LOW_GRIP, az = LOW_AZ, el = LOW_EL, roll = LOW_ROLL): P {
  const q: Bones = { ...ARCHER3_BASE, ...body };
  const s = solve(B, { ...q, lhIn: 0, lhx: grip[0], lhy: grip[1], lhz: grip[2] });
  const g = s.handL;
  const nock = add(g, mul(heading(az, el), -BOW3_BRACE));
  const l = sub(g, s.shoulderL);
  const r = sub(nock, s.shoulderR);
  return { ...body, lhIn: 1, lhx: l[0], lhy: l[1], lhz: l[2], rhIn: 1, rhx: r[0], rhy: r[1], rhz: r[2], wAz: az, wEl: el, wRoll: roll, draw: 0, prop: 1 };
}

/**
 * THE BOW DRAWN: the arrow along `el` degrees above level, toward the mark straight ahead, the
 * string `pull` of the way back (1: full draw). As the ranger draws (moves3.ts, `drawn`): AT FULL
 * DRAW THE STRING HAND IS AT THE JAW, on the side of it toward the string, and the bow hand is on
 * the arrow's line from there at nearly the arm's whole length from its shoulder; the drawing
 * elbow is behind the arrow and in line with it, the bow arm's elbow turned out from the string.
 */
function drawnBow(body: P, el: number, pull: number): P {
  const q: Bones = { ...ARCHER3_BASE, ...body };
  const s = solve(B, q);
  const aim = heading(0, el);
  const [ff, fl, fu] = s.face;
  // (under the corner of the jaw: a skull's jaw is big, and a hand at its cheek, seen from where the
  // game looks, put the forearm across the hood)
  const anchor = add(s.head, add(mul(ff, 0.4), add(mul(fl, -3.0), mul(fu, -5.0))));
  const armLen = (B.upperArm + B.foreArm) * 0.975;
  const from = sub(anchor, s.shoulderL);
  const along = dot(aim, from);
  const disc = along * along - dot(from, from) + armLen * armLen;
  const grip = disc >= 0 ? add(anchor, mul(aim, -along + Math.sqrt(disc))) : add(s.shoulderL, mul(aim, armLen));
  const full = len(sub(grip, anchor));
  const string = add(grip, mul(aim, -(BOW3_BRACE + (full - BOW3_BRACE) * Math.min(1, pull) + (pull - Math.min(1, pull)) * 4)));
  const l = sub(grip, s.shoulderL);
  const r = sub(string, s.shoulderR);
  const hands: P = { ...body, lhIn: 1, lhx: l[0], lhy: l[1], lhz: l[2], rhIn: 1, rhx: r[0], rhy: r[1], rhz: r[2], wAz: 0, wEl: el, wRoll: 0, draw: pull, prop: 1 };
  const slack = 1 - Math.min(1, pull);
  const re = elbowFor(B, { ...q, ...hands }, false, add(add(mul(aim, -(0.3 + 0.7 * (1 - slack))), [0, 0, -0.35 * (1 - slack) - 0.6 * slack]), mul(s.chest[1], -0.7 * slack)), ARCHER3_BASE.re);
  const le = elbowFor(B, { ...q, ...hands }, true, add(mul(s.chest[0], 1), [0, 0, -0.4]), ARCHER3_BASE.le);
  return { ...hands, re, le };
}

/**
 * THE MOMENT THE STRING GOES: the string hand flies straight back along the arrow's line and down
 * past the skull (`back`), the bow hand is pushed on along it (`kick`), and the bow rocks forward
 * in the hand (`rock` degrees). The string is empty and the fingers open (`prop` 2).
 */
function loosedBow(body: P, el: number, back: number, kick: number, rock: number): P {
  const d = drawnBow(body, el, 1);
  const aim = heading(0, el);
  return {
    ...d,
    lhx: (d.lhx ?? 0) + aim[0] * kick, lhz: (d.lhz ?? 0) + aim[2] * kick,
    rhx: (d.rhx ?? 0) - aim[0] * back, rhy: (d.rhy ?? 0) - 1.6, rhz: (d.rhz ?? 0) - aim[2] * back - back * 1.1,
    wEl: el - rock, draw: 0, prop: 2,
  };
}

export const ARCHER3_REST: Bones = { ...ARCHER3_BASE, ...lowBow({}) };

/**
 * STANDING, IT LISTENS. Twelve tenths of a second round, as the game's standing loop is: it sways
 * a little on its pins; the skull turns slowly away to its right, as if at a sound, holds there
 * while the jaw clacks, and comes back a beat after the body; the bow rocks in the hand.
 */
function listen(): Motion {
  const R = ARCHER3_BASE;
  const k = (i: number): number => i / 10;
  return {
    loop: 0,
    keys: [
      { at: 0, pose: {} },
      { at: k(2), pose: lowBow({ roll: R.roll + 1.2, side: R.side - 1, faceTurn: -8, faceUp: 2 }, [LOW_GRIP[0] + 0.3, LOW_GRIP[1], LOW_GRIP[2] + 0.2]), ease: 'io' },
      { at: k(4), pose: lowBow({ roll: R.roll + 1.5, side: R.side - 1, faceTurn: -30, faceUp: 4, faceTilt: R.faceTilt - 3 }, [LOW_GRIP[0] + 0.4, LOW_GRIP[1], LOW_GRIP[2] + 0.4], LOW_AZ, LOW_EL + 2), ease: 'out' },
      { at: k(6), pose: lowBow({ roll: R.roll + 1.0, side: R.side - 0.5, faceTurn: -28, faceUp: 3, faceTilt: R.faceTilt - 1 }, [LOW_GRIP[0] + 0.4, LOW_GRIP[1], LOW_GRIP[2] + 0.3], LOW_AZ, LOW_EL + 2), ease: 'io' },
      { at: k(8), pose: lowBow({ roll: R.roll - 0.8, side: R.side + 0.5, faceTurn: 0, faceUp: 0, faceTilt: R.faceTilt + 3 }, [LOW_GRIP[0] - 0.2, LOW_GRIP[1], LOW_GRIP[2]]), ease: 'io' },
      { at: k(9), pose: lowBow({ roll: R.roll - 1.0, side: R.side + 0.6, faceTurn: 9, faceUp: -2, faceTilt: R.faceTilt + 1 }, [LOW_GRIP[0] - 0.3, LOW_GRIP[1], LOW_GRIP[2] - 0.2]), ease: 'out' },
      { at: k(12), pose: {}, ease: 'io' },
    ],
  };
}
/** Its jaw, standing: hanging a little open; shut, open, shut while it listens. */
function listenJaw(t: number): number {
  const i = Math.floor((((t % 1.2) + 1.2) % 1.2) * 10 + 1e-6);
  return i === 5 ? 0 : i === 6 ? 0.45 : i === 7 ? 0 : 0.18;
}

/**
 * ITS WALK: THE SKELETON'S PLOD, LESS OF IT (today's archer: "lighter on its feet, and carries a
 * bow it must not jolt: the same lurch, less of it"). The same feet, a long step it falls onto and
 * a stiff leg dragged after, at the same pace (eight poses at twelve a second); the body drops and
 * tips less, the skull lolls less; both hands stay on the bow, carried low.
 */
function stalk(): Motion {
  //                0      1      2      3      4      5      6      7
  const RFX = [6.4, 4.8, 3.0, 1.0, -1.2, -3.8, 0.8, 4.8];
  const RFZ = [0, 0, 0, 0, 0.4, 1.7, 3.6, 1.4];
  const RFP = [-6, 0, 0, 0, 8, 32, 12, -4];
  const LFX = [-3.0, -4.6, -3.0, 0.2, 3.6, 1.6, -0.6, -2.2];
  const LFY = [0, 0.6, 2.4, 3.6, 1.0, 0.4, 0.2, 0];
  const LFZ = [1.0, 1.3, 1.1, 1.0, 0, 0, 0.2, 0.6];
  const LFP = [22, 34, 30, 16, 0, 0, 4, 12];
  const PZ = [-2.2, -2.9, -2.0, -0.9, -1.5, -1.0, -0.7, -1.5];
  const PITCH = [6, 7, 6, 4, 5, 4, 5, 7];
  const BEND = [9, 12, 11, 7, 9, 7, 8, 10];
  const ROLL = [-2.4, -3.6, 0.6, 3.6, 1.2, -0.6, -1.2, -1.8];
  const YAW = [-5, -6, -8, -12, -14, -14, -10, -7];
  const FACEUP = [-2, -9, -8, -4, -3, -6, -5, -3];
  const TILT = [5, 11, 10, 7, 5, 8, 9, 7];
  const RATTLE = [0, 0.6, -0.5, 0.2, 0.4, -0.3, 0, 0];
  const BOB = [0, 0.4, 0.3, 0, -0.2, -0.3, -0.1, 0];
  const keys: Key3[] = [];
  for (let i = 0; i <= PLOD_FRAMES; i++) {
    const j = i % PLOD_FRAMES;
    const body: P = {
      px: -0.3, pz: PZ[j], pitch: PITCH[j], bend: BEND[j], roll: ROLL[j], yaw: YAW[j], twist: -2 - (YAW[j] + 10) * 0.5, side: -ROLL[j] * 0.5,
      faceUp: FACEUP[j], faceTilt: TILT[j], faceTurn: 4 - (YAW[j] + 10) * 0.4,
      rfx: RFX[j], rfy: -0.2, rfz: RFZ[j], rfp: RFP[j], rft: -12, rk: -6,
      lfx: LFX[j], lfy: LFY[j], lfz: LFZ[j], lfp: LFP[j], lft: 8 + LFY[j] * 4, lk: 18 + LFY[j] * 6,
      pt: RATTLE[j],
    };
    keys.push({ at: i / PLOD_FPS, pose: lowBow(body, [LOW_GRIP[0] - 0.5, LOW_GRIP[1], LOW_GRIP[2] + 1 + BOB[j]], LOW_AZ, LOW_EL + 4), ease: 'lin' });
  }
  return { keys, loop: 0 };
}
/** Its jaw as it walks: jolted open as it falls onto its step. */
function stalkJaw(t: number): number {
  const JAW = [0.12, 0.5, 0.32, 0.14, 0.28, 0.14, 0.08, 0.08];
  return JAW[Math.floor((((t * PLOD_FPS) % PLOD_FRAMES) + PLOD_FRAMES) % PLOD_FRAMES + 1e-6) % PLOD_FRAMES];
}

/**
 * THE MOMENT THE ARROW GOES, from the start of the shot: the archer's wind-up in game/defs.ts
 * (MONSTERS: 0.55 s) put on the nearest frame at thirty a second, as every monster's blow is
 * (art/mkit.ts, `onGrid`): the seventeenth. The game plays a wind-up by how much of it is done
 * (render/figure.ts, `attackFrame`), so the arrow still goes when the rules say. After it the game
 * gives a monster 0.3 s (TUNE.monsterRecover) before it does anything else.
 */
export const SHOT3_HIT = Math.round(0.55 * 30) / 30;
const SHOT3_AFTER = 0.3;

/** How the archer stands to shoot: the front foot toward the mark, the body side-on to it, its chest and ribs to the eye. */
const SET: P = { px: 0.8, pz: -1.4, yaw: -38, pitch: -2, roll: 0, twist: -34, bend: 3, side: 1, faceTurn: 0, faceUp: 0, faceTilt: 3, lfx: 5.2, lfy: 0.8, lfz: 0, lft: 6, lk: 6, rfx: -3.0, rfy: -0.6, rfz: 0, rft: -40, rk: -24 };
const SHOT_EL = -3;

/**
 * THE SHOT. The skull turns to the mark; the bow comes up as the body turns side-on to it, and the
 * string comes back to the jaw in one pull, the jaw clenched, the light in the sockets burning up
 * and the arrowhead turning to a spark; drawn by half the wind-up and HELD, the bony arms
 * trembling and the spark spitting (the player's warning: THE WARNING IS A POSE). On the
 * seventeenth frame the string goes: the hand flies back past the skull, the bow kicks on and rocks
 * forward, the string flung and quivering, the arrow gone (the game's own arrow flies from here),
 * the jaw dropping open. It watches it go; then the hand comes back to the string, on which a
 * fresh arrow is (the owner, of the ranger, 6 Oct 2026, 21:06: "i think just pulling the string
 * back and having the arrow appear is totally fine"), and the bow comes down.
 */
function loose(): Motion {
  const H = SHOT3_HIT;
  const hold = (n: number, twist: number, side: number, el: number, pull: number): Key3 => ({ at: n * FR, pose: drawnBow({ ...SET, twist: (SET.twist ?? 0) + twist, side: (SET.side ?? 0) + side }, SHOT_EL + el, pull), ease: 'hold' });
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      { at: 3 * FR, pose: drawnBow({ px: 0.3, pz: -1.0, yaw: -24, twist: -18, bend: 5, faceTurn: 0, lfx: 3.6, lft: 8, rfx: -2.4, rft: -30, rk: -18 }, SHOT_EL - 14, 0.1), ease: 'out' },
      { at: 8 * FR, pose: drawnBow(SET, SHOT_EL, 1), ease: 'out' },
      hold(10, -1, 0, 0.6, 1.0),
      hold(11, -1.5, 0.6, -0.4, 1.02),
      hold(12, -1, 0, 0.5, 1.03),
      hold(13, -2, 0.6, -0.5, 1.04),
      hold(14, -1.5, 0, 0.4, 1.05),
      hold(15, -2.5, 0.6, -0.3, 1.06),
      hold(16, -2, 0, 0.3, 1.06),
      { at: H, pose: { ...loosedBow({ ...SET, twist: (SET.twist ?? 0) - 6, bend: 1 }, SHOT_EL, 3.6, 1.6, 12), pt: 3 }, ease: 'hold' },
      { at: H + 2 * FR, pose: { ...loosedBow({ ...SET, twist: (SET.twist ?? 0) - 7, bend: 0 }, SHOT_EL, 4.2, 1.0, 8), pt: -1 }, ease: 'out' },
      { at: H + 4 * FR, pose: { ...loosedBow({ ...SET, twist: (SET.twist ?? 0) - 6 }, SHOT_EL, 4.0, 0.8, 6), pt: 0 }, ease: 'lin' },
      { at: H + 0.2, pose: lowBow({ px: 0.3, pz: -1.0, yaw: -22, twist: -14, bend: 5, lfx: 3.2, lft: 8, rfx: -2.2, rft: -28, rk: -16 }, [LOW_GRIP[0] + 2.5, LOW_GRIP[1] - 1, LOW_GRIP[2] + 4], LOW_AZ, LOW_EL + 18, LOW_ROLL - 10), ease: 'io' },
      { at: H + SHOT3_AFTER, pose: {}, ease: 'io' },
    ],
  };
}
/** Its jaw as it shoots: clenched as it draws, dropping open as the string goes. */
function looseJaw(t: number): number {
  const H = SHOT3_HIT;
  if (t < 3 * FR) return 0.18 * (1 - t / (3 * FR));
  if (t < H - 1e-6) return 0;
  if (t < H + 3 * FR) return 0.6;
  if (t < H + 0.2) return 0.35;
  return 0.18 + (0.35 - 0.18) * Math.max(0, 1 - (t - H - 0.2) / 0.1);
}

export const ASTAND3: SkMove = { name: 'The bone archer stands', motion: listen(), rest: ARCHER3_REST, kit: BOWMAN, jaw: listenJaw };
export const AWALK3: SkMove = { name: 'The bone archer walks', motion: stalk(), rest: ARCHER3_REST, kit: BOWMAN, jaw: stalkJaw };
export const ASHOT3: SkMove = { name: 'The bone archer shoots', motion: loose(), rest: ARCHER3_REST, kit: BOWMAN, jaw: looseJaw };

/**
 * ITS DEATH: AS THE SKELETON'S. A jolt (the skull thrown back, the light in the sockets flaring,
 * the string hand thrown off the string), the bow dropping first; the knees go and the frame drops;
 * then it comes apart, every bone by itself; the quiver comes off its back, the mantle comes down
 * over the bones, and the skull goes last WITH THE HOOD STILL ON IT, rolling toward the eye (today's
 * archer's: "its red hood on the heap").
 */
function archerGiving(): Motion {
  const R = ARCHER3_REST;
  const limp: P = { lhIn: 0, lhx: 1.5, lhy: 2.4, lhz: HANG + 1.2, le: 0, rhIn: 0, rhx: 1.0, rhy: -2.2, rhz: HANG + 0.6, re: 0, prop: 0 };
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.05, pose: { px: R.px - 1.4, pz: R.pz - 0.4, pitch: -3, bend: -5, faceUp: 10, faceTilt: 4, draw: 1, pt: 0.8, rhIn: 1, rhx: R.rhx - 2, rhy: R.rhy - 3, rhz: R.rhz + 2, prop: 0 }, ease: 'out' },
      { at: 0.13, pose: { ...limp, px: -1.6, pz: -5.5, pitch: 6, bend: 12, faceUp: -12, faceTilt: 18, draw: 0.55, out: 0.4, lfx: 2.4, rfx: -1.0, lk: 14, rk: -12, pt: -0.6 }, ease: 'in' },
      { at: 0.25, pose: { ...limp, px: -0.6, pz: -12.5, pitch: 16, bend: 26, faceUp: -30, faceTilt: 26, draw: 0.3, out: 0.85, lfx: 3.4, rfx: -0.6, lk: 22, rk: -20 }, ease: 'in' },
      { at: 0.4, pose: { ...limp, px: -0.4, pz: -14.2, pitch: 18, bend: 30, faceUp: -36, faceTilt: 30, draw: 0.25, out: 1, lfx: 3.6, rfx: -0.4, lk: 24, rk: -22 }, ease: 'out' },
    ],
  };
}
/** Its jaw as it dies: thrown wide, then hanging. */
function dyingJaw(t: number): number {
  return t < 0.05 ? t / 0.05 : t < 0.13 ? 1 - ((t - 0.05) / 0.08) * 0.45 : 0.55;
}

/** How each piece of the archer falls: the skeleton's, the bow first in place of the sword, and its quiver. */
const BOW_FALLS: Readonly<Record<string, Fall>> = {
  bow: { from: 0.05, to: [10, 11], spin: 30, lay: 'flat', hop: 1.5 },
  ...Object.fromEntries(Object.entries(FALLS).filter(([k]) => k !== 'sword' && k !== 'skull')),
  quiver: { from: 0.23, to: [-11, -4], spin: -40, lay: 'axis', hop: 1.2 },
  skull: { ...FALLS.skull, from: 0.38 },
};

const ARCHER_DYING: SkMove = { name: 'The bone archer gives way', motion: archerGiving(), rest: ARCHER3_REST, kit: BOWMAN, jaw: dyingJaw };
export const ARCHER_UNDOING: Undoing = { kit: BOWMAN, falls: BOW_FALLS, dying: ARCHER_DYING };

function archerSet3(view: GameView): AnimSet {
  const idle = lazyFrames(STAND_FRAMES, (i) => spriteOf(ASTAND3, i / STAND_FPS, view));
  const walk = lazyFrames(PLOD_FRAMES, (i) => spriteOf(AWALK3, i / PLOD_FPS, view));
  const n = Math.round((SHOT3_HIT + SHOT3_AFTER) * CHOP_FPS) + 1;
  const attack: Clip = { frames: lazyFrames(n, (i) => spriteOf(ASHOT3, i / CHOP_FPS, view)), fps: CHOP_FPS, hit: SHOT3_HIT };
  const pick = (seconds: number): number => Math.max(0, Math.min(n - 1, Math.round(seconds * CHOP_FPS)));
  const picks = [pick(SHOT3_HIT * 0.7), pick(SHOT3_HIT + 0.035), pick(((n - 1) / CHOP_FPS + SHOT3_HIT) / 2)];
  const dieN = Math.round(DIE3_TIME * DEATH_FPS) + 1;
  // (a dying thing has no pool of light behind it, and no edge of light round it)
  const die: Clip = { frames: lazyFrames(dieN, (i) => toSprite(deathOf3(i / (dieN - 1), view, ARCHER_UNDOING), null, CANVAS3.ax, CANVAS3.ay)), fps: DEATH_FPS };
  return { idle, walk, attack: lazyFrames(3, (i) => attack.frames[picks[i]]), idleFps: STAND_FPS, walkFps: PLOD_FPS, clips: { attack, die } };
}

/** THE BONE ARCHER ON THE BONES, in the shape the game holds a monster's pictures in (art/actor_types.ts). */
export function makeArcherArt3(): ActorArt {
  return { front: archerSet3('front'), back: archerSet3('back') };
}

/** FOR PICTURES ONLY (src/dev/preview_archer3.ts): the archer standing still, the bow held as given (see `lowBow`), to compare ways of holding it. */
export function archerHolding(grip: V3, az: number, el: number, roll: number, body: Partial<Bones> = {}): SkMove {
  const rest: Bones = { ...ARCHER3_BASE, ...body, ...lowBow(body, grip, az, el, roll) };
  return { name: 'The bone archer holds its bow', motion: { keys: [{ at: 0, pose: {} }] }, rest, kit: BOWMAN, jaw: () => 0.18 };
}
