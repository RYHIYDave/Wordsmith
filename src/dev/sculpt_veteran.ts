// THE VETERAN (the art chat, 2 Nov 2026). A MOCK-UP: STILL PICTURES FOR THE OWNER; NOTHING OF THE GAME IMPORTS IT
// (tests/veteran.test.ts).
//
// His pick, 2 Nov 2026, of the three better fighters: “7, the Veteran”. At 21:41: “I’d like a headband that flows out
// behind him”; told that with the eye patch and the grey beard a flowing headband would make him look like a famous game
// character, his pick to keep him original: “Blind scarred eye (Recommended)”. Of how he moves: “I don’t want anything
// reused from the original brawler, we need a totally new look.  Going to have to be heavy and weighty so you have time to
// react and input to the situation”.
//
// At 22:06: “I gotta say it, follow all the rules.  I want him to look and play like an action movie hero.  Muscly,
// Bouncing on his toes”.
//
// So he is BUILT FRESH, here, on his own proportions: nothing of the original Brawler (not his body, head, beard, fists,
// stance or clothes; nothing of src/dev/sculpt_classes.ts, the twenty looks or any brawler file). Only the shared tools
// every sculpted figure is drawn with: the sculptor (dev/sculpt.ts), the heroes' bones (art/skeleton.ts) and the colours'
// kit. An old fighter built like an action-movie hero (his own; no actor's likeness, no known hero's): heavily muscled
// and cut, a great chest and shoulders over a narrow waist, veins on his arms, scarred; up on his toes, bouncing; a grey
// crop, heavy grey brows, a grey walrus moustache and beard; his LEFT eye milky and blind, a scar running down through it; a long faded red
// headband knotted at the back, its two tails streaming out behind him, following how he moves; a worn leather vest open on
// a scarred chest; trousers hacked off at the knee, his right shin bound, his left bare and scarred; leather bracers,
// strapped knuckles, wrapped feet; BIG fists.

import type { Ramp } from '../art/kit';
import { CYAN } from '../art/kit';
import type { GameView } from '../art/skin';
import { about, add, buildOf, cross, dot, len, lerp3, mul, norm, solve, standing, sub, trunkOf } from '../art/skeleton';
import type { Bones, Build, Posed, Skeleton, V3 } from '../art/skeleton';
import { Sculpt, draw, onBall, onCone, primDist } from './sculpt';
import type { Cone, Drawn, Ell, Prim } from './sculpt';

// ---------------------------------------------------------------------------------------------
// His colours (none glows; nothing the enemy's pink or gold)

/** Skin: an old man's, weathered and tanned. */
export const VET_SKIN: Ramp = ['#341a22', '#663634', '#a0604a', '#cc8e68', '#ecbe96'];
/** Grey hair, brows, moustache and beard. */
export const VET_GREY: Ramp = ['#2a2834', '#4a4856', '#74727f', '#9e9ca8', '#c6c4cc'];
/** The headband: a red gone faded with years of sweat and sun. */
export const VET_BAND: Ramp = ['#3a1214', '#6a2220', '#9a3a2e', '#bc5844', '#d6806a'];
/** The vest: worn brown leather. */
export const VET_VEST: Ramp = ['#1e1210', '#3c2418', '#64402a', '#8c6040', '#ae8458'];
/** The bracers: a darker, oiled leather. */
const VET_BRACER: Ramp = ['#180e0e', '#301a16', '#523222', '#744e32', '#946a46'];
/** Straps over the knuckles and the belt: black-brown leather. */
const VET_STRAP: Ramp = ['#100a0c', '#241614', '#3e281e', '#5c3e2c', '#7a583e'];
/** Linen wraps, grey with use. */
const VET_LINEN: Ramp = ['#3a3440', '#625a64', '#948a8e', '#c2b8b2', '#e4dcd2'];
/** The trousers: faded slate cloth. */
const VET_CLOTH: Ramp = ['#1a1c2c', '#30364c', '#4e5670', '#727c96', '#9aa2b8'];
/** Dull iron: the belt's buckle. */
const VET_IRON: Ramp = ['#18181f', '#32323c', '#565662', '#848490', '#b2b2bc'];
/** Old scar tissue: paler than the skin round it. */
const SCAR = '#f2cdb0';
const SCAR_DK = '#b47a62';
/** The blind eye: milky, a dull grey-white (no glow). */
const MILK = '#d4d6de';
const MILK_DK = '#8c90a0';
const EYE = '#120a16';

const sh = (r: Ramp, k: number): string => r[Math.max(0, Math.min(4, k))];

// ---------------------------------------------------------------------------------------------
// His build: his own proportions

/** Floor to crown, standing straight. */
export const VET_TALL = 58;
/**
 * HIS BODY (his “I want him to look and play like an action movie hero.  Muscly”): an action hero's V, shoulders and chest
 * far over a man's, the waist drawn in narrow under them; arms and legs thick with muscle; his head big enough to read on a
 * phone.
 */
export const VET_BUILD: Build = buildOf(VET_TALL, 1.72, { shoulders: 1.4, chest: 1.36, depth: 1.12, waist: 0.84, hips: 0.94, legs: 0.94, arms: 1.06, limbs: 1.3, trunk: 1.08, pad: 1.1 });
/** His fists, how big (1: about four fifths of his head across). */
export const VET_FIST = { k: 1.4 };

// ---------------------------------------------------------------------------------------------
// His poses

export interface VetPose {
  id: string;
  /** In plain words, for the owner. */
  name: string;
  bones: Partial<Bones>;
  /**
   * WHERE THE HEADBAND'S TAILS GO (his “a headband that flows out behind him”): the way the air pushes them, against the
   * way his head is moving, and down: along his own forward, left and up (the figure's axes). They flow and follow.
   */
  trail: V3;
  /** How far the tails ripple across (lengths), and where along their wave they are. */
  ripple: number;
  phase: number;
  /** Off the floor (a leap): how high his feet are is the pose's own. */
  air?: boolean;
  /**
   * WHICH WAY EACH PALM FACES (his “Make sure his limbs all face the correct way”), along his own forward, left and up: a
   * hook's palm down, an uppercut's toward him. Not given: the palm faces in, toward his middle.
   */
  palmL?: V3;
  palmR?: V3;
}

/**
 * HIS STANCE, BOUNCING ON HIS TOES (his “Bouncing on his toes”): side-on, up on the balls of both feet, heels off the floor,
 * knees soft, fists up; chest out (an action hero's), a little rounded at the top of the back with age. Two moments of the
 * bounce: DOWN (sunk into his knees, heels nearer the floor) and UP (risen high on his toes, legs longer).
 */
const STANCE_BONES: Partial<Bones> = {
  yaw: -24, twist: 6, bend: 6, pitch: 0, hunch: 5, shrug: 0.2, faceTurn: -32, faceUp: 4,
  lfx: 6.4, lfy: 3.0, lft: 16, lk: 20,
  rfx: -6.0, rfy: -3.4, rft: -36, rk: -24,
  lhIn: 0, lhx: 10.5, lhy: 0.6, lhz: 3.8, le: 14,
  rhIn: 0, rhx: 7.0, rhy: 0.6, rhz: 3.2, re: 6,
};
/** The bounce, down: sunk into soft knees, still up on his toes. */
export const VET_STANCE: VetPose = {
  id: 'stance',
  name: 'his stance, bouncing: down',
  bones: { ...STANCE_BONES, pz: -5.6, bend: 8, lfp: 24, lfz: 2.25, rfp: 24, rfz: 2.25, lk: 26, rk: -30 },
  trail: [-0.85, 0.2, -0.45],
  ripple: 1.2,
  phase: 0.4,
};
/** The bounce, up: risen high on the balls of his feet, his fists a little higher, the tails dropping after him. */
export const VET_STANCE_UP: VetPose = {
  id: 'stanceUp',
  name: 'his stance, bouncing: up',
  bones: { ...STANCE_BONES, pz: 0.6, bend: 6, lfp: 46, lfz: 3.85, rfp: 46, rfz: 3.85, lk: 12, rk: -16 },
  trail: [-0.8, 0.2, -0.65],
  ripple: 1.4,
  phase: 1.6,
};

export interface VetMove {
  id: string;
  /** Its name, and how it is put in (plain words). */
  name: string;
  input: string;
  /** What he does, a line for the owner. */
  line: string;
  windup: VetPose;
  strike: VetPose;
  /**
   * THE STRIKE'S AFTER-IMAGE (Movement 9: the strike lightning quick, smeared): which part of him travels, and how far its
   * path bows out on the way from the wind-up to the strike (his own forward, left, up): a hook comes ROUND, an uppercut UP.
   */
  smear: { joint: 'handR' | 'ankleR' | 'ankleL' | 'kneeR' | 'pelvis'; bulge: V3; spin?: number };
}

const pose = (id: string, name: string, bones: Partial<Bones>, trail: V3, ripple: number, phase: number, air = false): VetPose => ({ id, name, bones, trail, ripple, phase, air });

/**
 * HIS FIVE KEY POSES, each as its big held wind-up and its strike (his “Going to have to be heavy and weighty so you have
 * time to react and input to the situation”). Punches and kicks only (his “If there’s going to be skins, then we want to
 * just keep it clean”).
 */
export const VET_MOVES: VetMove[] = [
  {
    id: 'punch',
    name: 'The punch: a hook',
    input: 'tap',
    line: 'Wind-up: his whole trunk wound right round away from them, his weight back, his right elbow drawn back and up, his left hand out to measure. Strike: the hips and shoulders whip round through, the elbow high and bent, the fist swung round in a flat arc, his back heel spun up off the floor.',
    windup: pose('punchW', 'the wind-up', {
      px: -2.4, pz: -5.0, yaw: -42, twist: -44, bend: 10, pitch: -5, hunch: 6, shrug: 0.25, faceTurn: -10, faceUp: 3,
      lfx: 7.6, lfy: 3.0, lft: 14, lk: 20, lfp: 24, lfz: 2.3,
      rfx: -6.2, rfy: -3.8, rft: -44, rk: -32, rfp: 16, rfz: 1.2,
      lhIn: 1, lhx: 12.5, lhy: 0.5, lhz: 0.5, le: 12,
      rhIn: 0, rhx: -3.0, rhy: -7.5, rhz: 1.0, re: -64,
    }, [-0.3, 0.6, -0.75], 1.1, 1.8),
    strike: pose('punchS', 'the strike', {
      px: 2.6, pz: -4.4, yaw: 10, twist: 48, bend: 12, pitch: 6, hunch: 4, shrug: 0.2, faceTurn: -12, faceUp: 0,
      lfx: 8.2, lfy: 3.0, lft: 10, lk: 18, lfp: 14, lfz: 1.2,
      rfx: -6.2, rfy: -3.4, rft: 24, rk: 6, rfp: 44, rfz: 3.1,
      lhIn: 0, lhx: 4.0, lhy: 1.0, lhz: -3.0, le: 4,
      rhIn: 1, rhx: 12.0, rhy: 9.0, rhz: 2.0, re: -70,
    }, [-0.65, -0.7, -0.15], 0.6, 0.9),
    smear: { joint: 'handR', bulge: [-1, -11, 1] },
  },
  {
    id: 'kick',
    name: 'The kick: a round kick with the shin',
    input: 'hold',
    line: 'A switch kick. Wind-up: up on the ball of his back foot, his front knee hauled up high and cocked, fists up, eyes on them. Strike: the hips turn right over, the leg whips round flat at rib height and lands with the SHIN; the support foot pivots on its ball, heel turned toward them; his kicking arm swung down and back, the other fist up at his face.',
    windup: pose('kickW', 'the wind-up', {
      px: -1.0, pz: -1.4, yaw: -14, twist: 10, bend: 6, pitch: -8, hunch: 4, shrug: 0.25, faceTurn: -20, faceUp: 2,
      lfx: 3.2, lfy: 2.4, lfz: 17, lft: 30, lk: 20, lkUp: 46, lfp: 56,
      rfx: -1.8, rfy: -2.6, rft: -46, rk: -26, rfp: 20, rfz: 1.6,
      lhIn: 0, lhx: 8.6, lhy: 0.6, lhz: 2.6, le: 16,
      rhIn: 0, rhx: 7.0, rhy: 0.6, rhz: 3.0, re: 10,
    }, [-0.7, 0.3, -0.6], 1.0, 2.6),
    strike: pose('kickS', 'the strike', {
      px: -1.6, pz: -1.2, yaw: -74, twist: 24, bend: -4, pitch: -16, roll: 10, hunch: 4, shrug: 0.2, faceTurn: -4, faceUp: 4,
      lfx: 25.5, lfy: -3.0, lfz: 31, lft: 0, lk: -10, lkUp: 70, lfp: 30,
      rfx: -1.0, rfy: -2.4, rft: -150, rk: -40, rfp: 22, rfz: 1.7,
      lhIn: 1, lhx: -9, lhy: 8, lhz: -11, le: -10,
      rhIn: 0, rhx: 5.6, rhy: 0.6, rhz: 5.4, re: 10,
    }, [-0.55, 0.75, 0.15], 1.2, 0.2),
    smear: { joint: 'ankleL', bulge: [2, 12, 1] },
  },
  {
    id: 'jump',
    name: 'The jump (the dodge)',
    input: 'swipe',
    line: 'Wind-up: he sinks deep into his knees, arms swung back, gathering all that weight. Strike: up and out of the way, knees tucked under him, fists up.',
    windup: pose('jumpW', 'the wind-up', {
      pz: -10, yaw: -14, bend: 28, pitch: 10, hunch: 16, shrug: 0.3, faceTurn: -14, faceUp: 14,
      lfx: 3.6, lfy: 3.2, lft: 14, lk: 30, rfx: -3.6, rfy: -3.2, rft: -24, rk: -30, rfp: 10,
      lhIn: 1, lhx: -9, lhy: 7, lhz: -12, le: -10,
      rhIn: 1, rhx: -9, rhy: -7, rhz: -12, re: -10,
    }, [-0.9, 0.2, 0.3], 1.6, 3.0),
    strike: pose('jumpS', 'the leap', {
      pz: 17, yaw: -18, bend: 10, pitch: -4, hunch: 10, shrug: 0.2, faceTurn: -14, faceUp: 6,
      lfx: 3.5, lfy: 2.6, lfz: 25, lft: 10, lk: 8, lkUp: 26, lfp: 30,
      rfx: -2.6, rfy: -2.8, rfz: 21, rft: -20, rk: -16, rkUp: 10, rfp: 40,
      lhIn: 0, lhx: 8.5, lhy: 1.0, lhz: 5.0, le: 14,
      rhIn: 0, rhx: 6.5, rhy: 0.5, rhz: 4.5, re: 8,
    }, [-0.5, 0.05, -1], 0.9, 1.1, true),
    smear: { joint: 'pelvis', bulge: [-2, 0, 2] },
  },
  {
    id: 'uppercut',
    name: 'The flying uppercut',
    input: 'swipe, then tap',
    line: 'His jump punch. Wind-up: dropped right down low and coiled, his right shoulder dipped, the fist hanging by his knee. Strike: he drives up off the floor behind it, the fist rising up past his face and over his head, his knee up, his whole body stretched.',
    windup: pose('upW', 'the wind-up', {
      px: -0.8, pz: -12, yaw: -14, twist: -30, bend: 32, pitch: 8, hunch: 16, shrug: 0.4, faceTurn: -10, faceUp: 18, side: 6,
      lfx: 4.6, lfy: 3.4, lft: 16, lk: 30, rfx: -4.0, rfy: -3.8, rft: -30, rk: -34, rfp: 14,
      lhIn: 0, lhx: 8.6, lhy: 0.4, lhz: 4.2, le: 16,
      rhIn: 1, rhx: 5, rhy: -5, rhz: -21, re: -6,
    }, [-0.92, -0.25, 0.22], 1.6, 2.2),
    strike: pose('upS', 'the strike', {
      px: 2.0, pz: 18, yaw: 4, twist: 26, bend: -6, pitch: -6, hunch: 6, shrug: 0, faceTurn: -14, faceUp: 32, side: -8,
      lfx: 7.0, lfy: 2.6, lfz: 33, lft: 10, lk: 0, lkUp: 34, lfp: 30,
      rfx: -3.5, rfy: -3.0, rfz: 16, rft: -20, rk: -10, rkUp: -10, rfp: 46,
      lhIn: 1, lhx: -6, lhy: 8, lhz: -12, le: -16,
      rhIn: 1, rhx: 6.5, rhy: 0.5, rhz: 22.5, re: 14,
    }, [-0.4, 0.15, -1], 0.6, 0.6, true),
    smear: { joint: 'handR', bulge: [9, 0, -4] },
  },
  {
    id: 'jumpkick',
    name: 'The jump kick: a spinning jump kick',
    input: 'swipe, then hold',
    line: 'Wind-up: sunk low on the balls of his feet, his shoulders wound the other way round, coiled to spring. Strike: off the floor into a full turn in the air, his back coming round to them, the leg whipping round flat at head height, the other tucked under him; the headband tails spiralling round with him.',
    windup: pose('jkW', 'the wind-up', {
      px: 0.6, pz: -9.5, yaw: -16, twist: -30, bend: 20, pitch: 10, hunch: 6, shrug: 0.3, faceTurn: -14, faceUp: 14,
      lfx: 5.0, lfy: 3.0, lft: 20, lk: 28, lfp: 28, lfz: 1.9,
      rfx: -5.0, rfy: -3.4, rft: -24, rk: -28, rfp: 36, rfz: 2.4,
      lhIn: 0, lhx: 8.6, lhy: 1.0, lhz: 2.6, le: 14,
      rhIn: 1, rhx: -7, rhy: -9, rhz: -3, re: -10,
    }, [-0.9, 0.2, 0.3], 1.5, 2.9),
    strike: pose('jkS', 'the strike', {
      px: 1.0, pz: 14, yaw: 120, twist: 10, bend: -4, pitch: -12, roll: -10, hunch: 4, shrug: 0.2, faceTurn: 0, faceUp: 4,
      lfx: -3.0, lfy: 5.0, lfz: 26, lft: 110, lk: 100, lkUp: -30, lfp: 40,
      rfx: 23, rfy: 2.0, rfz: 51, rft: 30, rk: 60, rkUp: 70, rfp: 30,
      lhIn: 1, lhx: 4, lhy: 9, lhz: 4, le: -20,
      rhIn: 1, rhx: -6, rhy: -10, rhz: -6, re: -10,
    }, [-0.45, 0.35, 0.8], 1.9, 0.3, true),
    smear: { joint: 'ankleR', bulge: [0, 0, 0], spin: 300 },
  },
  {
    id: 'knee',
    name: 'The flying knee',
    input: 'after two punches: swipe, then hold',
    line: 'When the jump kick comes after two punches. Wind-up: he lunges in low, leaning hard over his front foot, his back knee drawn back, both hands reaching for them. Strike: he leaps in off the floor and drives that knee up into their chest or face, both hands out to grab, the other leg trailing.',
    windup: pose('kneeW', 'the wind-up', {
      px: 2.0, pz: -8.5, yaw: -18, twist: 4, bend: 20, pitch: 16, hunch: 6, shrug: 0.3, faceTurn: -14, faceUp: 16,
      lfx: 8.5, lfy: 3.0, lft: 12, lk: 26, lfp: 16, lfz: 1.2,
      rfx: -9.5, rfy: -3.4, rft: -20, rk: -14, rfp: 52, rfz: 4.0,
      lhIn: 1, lhx: 12, lhy: 4, lhz: 2, le: 10,
      rhIn: 1, rhx: 12, rhy: -2, rhz: 3, re: 10,
    }, [-0.85, 0.2, 0.4], 1.4, 2.0),
    strike: pose('kneeS', 'the strike', {
      px: 3.0, pz: 13, yaw: -16, twist: -8, bend: -6, pitch: -12, hunch: 4, shrug: 0.2, faceTurn: -12, faceUp: 4,
      lfx: -7.5, lfy: 2.4, lfz: 16, lft: 10, lk: -10, lkUp: -30, lfp: 56,
      rfx: 4.5, rfy: -2.8, rfz: 33, rft: -10, rk: -6, rkUp: 64, rfp: 46,
      lhIn: 1, lhx: 15, lhy: 4.5, lhz: 6, le: 4,
      rhIn: 1, rhx: 15, rhy: -1.5, rhz: 7, re: 4,
    }, [-1, 0.1, -0.3], 0.7, 0.8, true),
    smear: { joint: 'kneeR', bulge: [2, 0, -5] },
  },
];

// ---------------------------------------------------------------------------------------------
// The figure

/** The eye of the game's camera, as the figure is built (before it is truly turned): toward which way it is seen. */
function eyeFor(turn: number): V3 {
  const e: V3 = norm([0.612, -0.612, 0.5]);
  const a = (-turn * Math.PI) / 180;
  return [e[0] * Math.cos(a) - e[1] * Math.sin(a), e[0] * Math.sin(a) + e[1] * Math.cos(a), e[2]];
}

/** A plane cut: keep only what lies where dot(p, n) <= o. */
type Cut = { n: V3; o: number };
const keepBelow = (n: V3, through: V3): Cut => ({ n, o: dot(n, through) });
/** Nothing below the floor: what reaches it is cut off flat there (a foot pressed on it). */
const FLOOR_CUT: Cut = { n: [0, 0, -1], o: 0 };

export interface VetFigure {
  sc: Sculpt;
  s: Skeleton;
  /** The tails' centre lines (for the tests: they stream, they never pass through him). */
  tails: V3[][];
}

/** THE VETERAN, sculpted in a pose; `turn`: truly turned, degrees to his left (90 from behind; 45 from his right side). */
export function sculptVeteran(p: VetPose, turn = 0): VetFigure {
  const B = VET_BUILD;
  const q: Posed = { ...standing(B), ...p.bones } as Posed;
  const s = solve(B, q);
  const sc = new Sculpt();
  sc.spin = turn;
  const [f, l, u] = s.upper;
  const [ribs, belly, pel] = trunkOf(B, s);
  const [rf, rl, ru] = ribs.r;
  const eye = eyeFor(turn);
  /** Is a point on the far side of him from the eye (painted a step darker, as the heroes' far limbs are)? */
  const far = (pt: V3): boolean => dot(sub(pt, s.pelvis), eye) < -2.2;
  const farArm = (piece: string): boolean => (piece === 'armL' ? far(s.elbowL) : piece === 'armR' ? far(s.elbowR) : piece === 'legL' ? far(s.kneeL) : piece === 'legR' ? far(s.kneeR) : false);

  // THE HEAD'S OWN MEASURE: forward, to his left and up, each a share of the head's half-lengths
  const [hf, hl, hu] = s.face;
  const R = B.headR;
  const at = (fw: number, lf: number, up: number): V3 => add(s.head, add(mul(hf, R[0] * fw), add(mul(hl, R[1] * lf), mul(hu, R[2] * up))));
  const onHead = (pt: V3): V3 => {
    const v = sub(pt, s.head);
    return [dot(v, hf) / R[0], dot(v, hl) / R[1], dot(v, hu) / R[2]];
  };
  /** Where on his chest a point is: along his left, up, and forward of the ribs' middle. */
  const onChest = (pt: V3): V3 => {
    const v = sub(pt, ribs.c);
    return [dot(v, rl), dot(v, ru), dot(v, rf)];
  };

  // ---- SKIN ----
  const skin = sc.mat({
    ramp: VET_SKIN,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      const dk = farArm(h.prim.piece) ? 1 : 0;
      if (h.prim.piece === 'head') {
        const [fw, lf, up] = onHead(h.p);
        // the hollows under his cheekbones and the deep set of his eyes
        if (tg === 'nose' && h.tone >= 2) return sh(VET_SKIN, h.tone + 1);
        // (his face is turned from the light, but it must read: lifted a tone, as the heroes' faces are)
        if (tg !== 'neck' && fw > 0.38 && up < 0.32 && up > -0.8) return sh(VET_SKIN, Math.max(2, h.tone + 1) - (Math.abs(lf) > 0.62 ? 1 : 0));
        if (tg === 'ear' && Math.abs(up + 0.05) < 0.2) return sh(VET_SKIN, 1);
        return null;
      }
      // OLD SCARS ACROSS HIS CHEST AND BELLY: pale, raised, each with its shadow
      if (h.prim.piece === 'torso') {
        const [a, b, c] = onChest(h.p);
        if (c > ribs.h[0] * 0.25) {
          const s1 = b - (0.55 * a + 2.4);
          if (a > -6.5 && a < 2.5 && Math.abs(s1) < 0.42) return SCAR;
          if (a > -6.5 && a < 2.5 && s1 > -0.95 && s1 < -0.42) return SCAR_DK;
          const s2 = b - (-1.1 * a - 6.8);
          if (a > -1 && a < 4.8 && Math.abs(s2) < 0.45) return SCAR;
        }
        // THE CUTS OF HIS MUSCLES, so they read: the groove down between his breast muscles, the foot of each, and the
        // belly's six blocks, the light on each
        if (c > ribs.h[0] * 0.3 && Math.abs(a) < 0.45 && b > -1.5 && b < ribs.h[2] * 0.8) return sh(VET_SKIN, h.tone - 1);
        if (tg === 'pec') {
          const pb = onBall(h.prim as Ell, h.p);
          if (pb[2] < -0.68 && pb[0] > 0.15) return sh(VET_SKIN, h.tone - 1 - dk);
        }
        if (tg === 'abs') {
          const ab = onBall(h.prim as Ell, h.p);
          if (ab[0] > 0.2) {
            if (Math.abs(ab[1]) < 0.1) return sh(VET_SKIN, h.tone - 1);
            if (Math.abs(ab[1]) < 0.75 && (Math.abs(ab[2] - 0.3) < 0.07 || Math.abs(ab[2] + 0.18) < 0.07 || Math.abs(ab[2] + 0.62) < 0.06)) return sh(VET_SKIN, h.tone - 1);
          }
        }
        if (tg === 'oblique' && (h.x + 2 * h.y) % 4 === 0) return sh(VET_SKIN, h.tone - 1);
        // (the front of his chest and belly lifted a tone, as his face is, so the muscles read though he is turned from the light)
        if (c > ribs.h[0] * 0.2 && !dk) return sh(VET_SKIN, Math.max(2, h.tone + 1));
      }
      // VEINS on his forearms and over his biceps: a dark line that wanders, a lit pixel on its crest
      if (h.prim.piece.startsWith('arm') && (tg === 'fore' || tg === 'foreBulge' || tg === 'bicep')) {
        const along = tg === 'fore' ? onCone(h.prim as Cone, h.p, u) : null;
        const ob = tg !== 'fore' ? onBall(h.prim as Ell, h.p) : null;
        const t = along ? along.t : ((ob as V3)[0] + 1) / 2;
        const ar = along ? along.around : Math.atan2((ob as V3)[2], (ob as V3)[1]);
        const vein = ar - (0.5 + 0.35 * Math.sin(t * 9.0));
        if (t > 0.08 && t < 0.92 && Math.abs(vein) < 0.12) return sh(VET_SKIN, h.tone - 1 - dk);
        if (t > 0.08 && t < 0.92 && vein > 0.12 && vein < 0.3 && h.tone >= 2) return sh(VET_SKIN, h.tone + 1 - dk);
      }
      // his left shin, bare, scarred across
      if (h.prim.piece === 'legL' && (tg === 'shin' || tg === 'calf')) {
        const kneeA = s.kneeL;
        const ank = s.ankleL;
        const dd = norm(sub(ank, kneeA));
        const t = dot(sub(h.p, kneeA), dd) / Math.max(1, len(sub(ank, kneeA)));
        if (Math.abs(t - 0.38) < 0.03 || Math.abs(t - 0.62 + (h.x % 3) * 0.01) < 0.025) return SCAR;
      }
      return dk ? sh(VET_SKIN, h.tone - 1) : null;
    },
  });

  // THE TRUNK: an action hero's V: a great broad chest, the lats flaring under the arms, the waist drawn in narrow, the
  // belly cut in six; the top of the back a little rounded (an old man's). Each muscle its own shape, each melted only a
  // little into the next so the cuts between them read.
  const trunkPrims: Prim[] = [];
  const T0 = sc.prims.length;
  sc.ell(skin, 'torso', ribs.c, [mul(rf, ribs.h[0] * 0.95), mul(rl, ribs.h[1] * 0.98), mul(ru, ribs.h[2] * 1.0)], 2.2, { tag: 'ribs' });
  sc.ell(skin, 'torso', add(ribs.c, mul(ru, ribs.h[2] * 0.42)), [mul(rf, ribs.h[0] * 0.86), mul(rl, ribs.h[1] * 1.1), mul(ru, ribs.h[2] * 0.55)], 2.2, { tag: 'ribs' });
  if ((p.bones.hunch ?? 0) >= 8) {
    const hc = add(s.back, add(mul(u, B.chest * 0.26), mul(f, -ribs.h[0] * 0.3)));
    sc.ell(skin, 'torso', hc, [mul(f, ribs.h[0] * 0.7), mul(l, ribs.h[1] * 0.85), mul(u, B.chest * 0.36)], 2.2, { tag: 'hump' });
  }
  sc.ell(skin, 'torso', add(belly.c, mul(belly.r[0], 0.2)), [mul(belly.r[0], belly.h[0] * 0.95), mul(belly.r[1], belly.h[1] * 0.95), mul(belly.r[2], belly.h[2] * 1.05)], 2.2, { tag: 'belly' });
  // the belly's muscles: a flat block of six down his front
  sc.ell(skin, 'torso', add(belly.c, add(mul(belly.r[0], belly.h[0] * 0.55), mul(belly.r[2], 0.9))), [mul(belly.r[0], 1.7), mul(belly.r[1], belly.h[1] * 0.66), mul(belly.r[2], belly.h[2] * 1.1)], 1.1, { tag: 'abs' });
  for (const side of [1, -1]) {
    // the obliques, either side above the hips
    sc.ell(skin, 'torso', add(belly.c, add(mul(belly.r[1], side * belly.h[1] * 0.8), mul(belly.r[2], -0.6))), [mul(belly.r[0], 2.2), mul(belly.r[1], 1.5), mul(belly.r[2], 3.0)], 1.4, { tag: 'oblique' });
  }
  // the yoke and the great traps, from his neck out to his shoulders
  sc.ell(skin, 'torso', add(s.neck, add(mul(u, -2.5), mul(f, -0.8))), [mul(f, ribs.h[0] * 0.7), mul(l, B.shoulderHalf * 0.86), mul(u, 3.0)], 2.2, { tag: 'yoke' });
  for (const side of [1, -1]) {
    const shd = side > 0 ? s.shoulderL : s.shoulderR;
    sc.cone(skin, 'torso', add(s.neck, add(mul(u, 0.4), mul(f, -1.0))), add(shd, add(mul(u, 0.9), mul(f, -0.6))), 2.5, 1.8, 1.8, { tag: 'trap' });
    // the breast muscles: big, square, high on his chest
    const pc = add(ribs.c, add(mul(rf, ribs.h[0] * 0.62), add(mul(rl, side * ribs.h[1] * 0.44), mul(ru, ribs.h[2] * 0.4))));
    sc.ell(skin, 'torso', pc, [mul(rf, 2.7), mul(rl, 4.1), mul(ru, 2.9)], 1.0, { tag: 'pec' });
    // the lats, flaring out under his arms
    const lat = add(ribs.c, add(mul(rf, -ribs.h[0] * 0.2), add(mul(rl, side * ribs.h[1] * 0.86), mul(ru, -ribs.h[2] * 0.12))));
    sc.ell(skin, 'torso', lat, [mul(rf, 3.0), mul(rl, 2.4), mul(ru, 4.8)], 1.6, { tag: 'lat' });
  }
  trunkPrims.push(...sc.prims.slice(T0));
  // the neck: thick as a post
  sc.cone(skin, 'head', add(s.neck, mul(u, -1.6)), s.skull, 3.0, 2.6, 1.6, { tag: 'neck' });

  // THE ARMS: shoulders like cannonballs, a peaked biceps, a horseshoe of triceps, forearms thick and veined
  for (const side of ['L', 'R'] as const) {
    const shd = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const ha = side === 'L' ? s.handL : s.handR;
    const piece = `arm${side}`;
    const out = mul(l, side === 'L' ? 1 : -1);
    const ud = norm(sub(el, shd));
    const uo = norm(sub(out, mul(ud, dot(out, ud))), f);
    // (the front of the upper arm: the way he faces, made square to the arm; up, if the arm points ahead; and square to its
    // outside too, so that the muscles on it are never flattened to nothing when the arm points straight out to his side)
    const ufr0 = norm(sub(f, mul(ud, dot(f, ud))), u);
    const ufr = norm(sub(ufr0, mul(uo, dot(ufr0, uo))), norm(cross(ud, uo)));
    // (the shoulder's own three ways, square to each other: the way he faces, out, and up)
    const dOut = norm(sub(uo, mul(f, dot(uo, f))), out);
    const dUp = norm(cross(f, dOut), u);
    sc.ell(skin, piece, add(shd, add(mul(u, -0.2), mul(uo, 1.2))), [mul(f, 3.6), mul(dOut, 3.3), mul(dot(dUp, u) < 0 ? mul(dUp, -1) : dUp, 3.4)], 1.2, { tag: 'delt' });
    sc.cone(skin, piece, shd, el, 3.1, 2.3, 1.4, { tag: 'upper' });
    sc.ell(skin, piece, add(lerp3(shd, el, 0.54), mul(ufr, 1.25)), [mul(ud, 3.5), mul(uo, 2.5), mul(ufr, 2.5)], 0.9, { tag: 'bicep' });
    sc.ell(skin, piece, add(lerp3(shd, el, 0.42), mul(ufr, -1.0)), [mul(ud, 3.8), mul(uo, 2.4), mul(ufr, 2.3)], 0.9, { tag: 'tricep' });
    const wrist = lerp3(el, ha, 0.8);
    sc.cone(skin, piece, el, wrist, 2.8, 1.9, 1.2, { tag: 'fore' });
    const fd = norm(sub(ha, el));
    const fo = norm(sub(out, mul(fd, dot(out, fd))), f);
    sc.ell(skin, piece, add(lerp3(el, ha, 0.25), mul(fo, 0.6)), [mul(fd, 3.2), mul(fo, 2.6), mul(norm(cross(fd, fo)), 2.4)], 1.0, { tag: 'foreBulge' });
  }

  // THE LEGS: thighs cut in their muscles, calves flexed hard (he is up on his toes)
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const piece = `leg${side}`;
    const [lH, lK, lA] = B.legR;
    sc.cone(skin, piece, hip, knee, lH * 1.08, lK * 1.02, 1.5, { tag: 'thigh' });
    const td = norm(sub(knee, hip));
    const to = norm(sub(f, mul(td, dot(f, td))), [1, 0, 0]);
    sc.ell(skin, piece, add(lerp3(hip, knee, 0.42), mul(to, 1.2)), [mul(td, 4.8), mul(to, 2.8), mul(norm(cross(td, to)), 3.0)], 1.2, { tag: 'quad' });
    sc.cone(skin, piece, knee, ankle, lK * 0.98, lA * 0.95, 1.2, { tag: 'shin' });
    const sd = norm(sub(ankle, knee));
    const so = norm(sub(f, mul(sd, dot(f, sd))), [1, 0, 0]);
    sc.ell(skin, piece, add(lerp3(knee, ankle, 0.3), mul(so, -1.2)), [mul(sd, 3.6), mul(so, 2.4), mul(norm(cross(sd, so)), 2.3)], 1.1, { tag: 'calf' });
  }

  // THE FEET: bare and broad. Up on his toes the foot tips from its heel to its ball while the toes lie flat on the floor;
  // set on the floor (never in it) unless he is in the air
  const feet: { side: 'L' | 'R'; c: V3; fd: V3; fs: V3; up: V3; half: number }[] = [];
  for (const side of ['L', 'R'] as const) {
    const heel = side === 'L' ? s.heelL : s.heelR;
    const ball = side === 'L' ? s.toeL : s.toeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const fd = norm(sub(ball, heel));
    const fs = norm(cross([0, 0, 1], fd), [0, 1, 0]);
    let up = norm(cross(fd, fs));
    if (up[2] < 0) up = mul(up, -1);
    const half = len(sub(ball, heel)) * 0.5;
    const fh = norm([fd[0], fd[1], 0], fd);
    let c = add(lerp3(heel, ball, 0.5), mul(up, 0.9));
    // (the toes: flat on the floor ahead of the ball when he stands; in the air they point as the foot does)
    const toeDir = p.air ? fd : fh;
    let tc = add(ball, add(mul(toeDir, 1.1), [0, 0, p.air ? 0.5 : 0.8]));
    const low = Math.min(c[2] - Math.abs(fd[2]) * (half + 0.3) - Math.abs(fs[2]) * 1.7 - Math.abs(up[2]) * 1.05, tc[2] - 0.8);
    if (low < 0) {
      c = add(c, [0, 0, -low]);
      tc = add(tc, [0, 0, -low]);
    }
    const piece = `leg${side}`;
    sc.box(skin, piece, c, [mul(fd, half + 0.3), mul(fs, 1.7), mul(up, 1.05)], 0.9, 1.2, { tag: 'foot', cuts: [FLOOR_CUT] });
    sc.ell(skin, piece, tc, [mul(toeDir, 1.5), mul(fs, 1.75), [0, 0, 0.8]], 0.8, { tag: 'toes', cuts: [FLOOR_CUT] });
    sc.cone(skin, piece, ankle, add(c, mul(fd, -half * 0.3)), B.legR[2] * 0.95, 1.6, 1.0, { tag: 'instep', cuts: [FLOOR_CUT] });
    feet.push({ side, c, fd, fs, up, half });
  }

  // ---- THE HEAD: his own; a big square skull, a jaw like a block, a brow that juts, a nose broken flat ----
  sc.ell(skin, 'head', at(-0.14, 0, 0.06), [mul(hf, R[0] * 0.86), mul(hl, R[1] * 0.94), mul(hu, R[2] * 0.8)], 1.2, { tag: 'skull' });
  sc.box(skin, 'head', at(0.26, 0, -0.44), [mul(hf, R[0] * 0.64), mul(hl, R[1] * 0.78), mul(hu, R[2] * 0.42)], 1.6, 1.6, { tag: 'jaw' });
  sc.ell(skin, 'head', at(0.68, 0, 0.24), [mul(hf, R[0] * 0.34), mul(hl, R[1] * 0.86), mul(hu, R[2] * 0.2)], 0.9, { tag: 'brow' });
  for (const side of [1, -1]) sc.ell(skin, 'head', at(0.6, side * 0.5, -0.1), [mul(hf, 1.1), mul(hl, 1.2), mul(hu, 0.9)], 0.8, { tag: 'cheek' });
  sc.cone(skin, 'head', at(0.84, 0.02, 0.12), at(1.06, -0.08, -0.16), 0.75, 1.0, 0.6, { tag: 'nose' });
  sc.ell(skin, 'head', at(1.06, -0.06, -0.2), [mul(hf, 0.8), mul(hl, 1.05), mul(hu, 0.75)], 0.5, { tag: 'nose' });
  // his ears: the right one thickened (an old fighter's), the left plain
  sc.ell(skin, 'head', at(-0.12, 0.92, -0.04), [mul(hf, 0.75), mul(hl, 0.38), mul(hu, 1.05)], 0.4, { tag: 'ear' });
  sc.ell(skin, 'head', at(-0.12, -0.96, -0.02), [mul(hf, 1.0), mul(hl, 0.62), mul(hu, 1.2)], 0.4, { tag: 'ear' });

  // ---- GREY: the crop, the brows, the walrus moustache and the beard ----
  const greyHead = sc.mat({
    ramp: VET_GREY,
    meld: true,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      const [fw, lf] = onHead(h.p);
      void fw;
      // (the scar runs down through his left brow: a notch of bare scar in it)
      if (tg === 'brow' && lf > 0.33 && lf < 0.5) return SCAR;
      if (tg === 'crop') return (h.x * 2 + h.y) % 5 === 0 ? sh(VET_GREY, h.tone - 1) : null;
      // (grey whiskers read light against his tan and the brown vest: lifted, a strand darker here and there)
      const lit = Math.max(2, h.tone + 1);
      if (tg === 'tash' || tg === 'beard' || tg === 'jowl') return (h.x + Math.floor(h.y / 2)) % 3 === 0 ? sh(VET_GREY, lit - 1) : sh(VET_GREY, lit);
      if (tg === 'brow') return sh(VET_GREY, lit);
      return null;
    },
  });
  const skullC = at(-0.14, 0, 0.06);
  // a short grey crop, its line high on his brow and back over his temples
  {
    const m = norm(sub(hu, mul(hf, 0.55)));
    sc.ell(greyHead, 'head', skullC, [mul(hf, R[0] * 0.86 + 0.4), mul(hl, R[1] * 0.94 + 0.4), mul(hu, R[2] * 0.8 + 0.45)], 0.5, { cuts: [{ n: mul(m, -1), o: -dot(m, s.head) - -0.02 * R[2] }], tag: 'crop' });
  }
  // the brows: heavy, grey, drawn down hard over his eyes
  for (const side of [1, -1]) {
    sc.cone(greyHead, 'head', at(0.92, side * 0.12, 0.27), at(0.8, side * 0.7, 0.21), 0.62, 0.5, 0.3, { tag: 'brow' });
  }
  // the walrus moustache, heavy, hanging over his mouth and down past its corners
  sc.ell(greyHead, 'head', at(1.02, -0.02, -0.42), [mul(hf, 0.7), mul(hl, R[1] * 0.36), mul(hu, 0.75)], 0.4, { tag: 'tash' });
  for (const side of [1, -1]) {
    sc.cone(greyHead, 'head', at(1.0, side * 0.26, -0.46), at(0.92, side * 0.5, -0.98), 0.8, 0.5, 0.3, { tag: 'tash' });
  }
  // the beard, short and full, along his jaw and round his chin
  sc.ell(greyHead, 'head', at(0.5, 0, -0.95), [mul(hf, R[0] * 0.46), mul(hl, R[1] * 0.6), mul(hu, R[2] * 0.28)], 0.8, { tag: 'beard' });
  for (const side of [1, -1]) sc.cone(greyHead, 'head', at(0.0, side * 0.84, -0.5), at(0.42, side * 0.6, -0.9), 0.5, 0.8, 0.6, { tag: 'jowl' });

  // ---- HIS FACE: the good eye dark under its brow; the LEFT eye milky and blind, the scar running down through it ----
  for (const side of [1, -1]) sc.mark(at(0.82, side * 0.38, 0.1), sh(VET_SKIN, 0), 2, 1, side > 0 ? 0 : -1);
  sc.mark(at(0.86, -0.36, 0.02), EYE);
  sc.mark(at(0.86, 0.36, 0.02), MILK, 2, 1, 0);
  sc.mark(at(0.86, 0.36, 0.02), MILK_DK, 1, 1, 1);
  for (let i = 0; i < 6; i++) {
    const up = 0.48 - i * 0.2;
    if (Math.abs(up - 0.02) < 0.08) continue;
    // (a pale line with a darker edge beside it, so it reads on his weathered face)
    sc.mark(at(0.8 + (up < 0 ? 0.04 : 0), 0.4 - i * 0.012, up), SCAR_DK, 1, 1, 1);
    sc.mark(at(0.8 + (up < 0 ? 0.04 : 0), 0.4 - i * 0.012, up), SCAR);
  }
  // his mouth, a hard dark line under the moustache
  sc.mark(at(0.98, 0, -0.66), sh(VET_SKIN, 0), 2, 1, -1);

  // ---- THE HEADBAND: long, faded red, knotted at the back, its tails streaming out behind him ----
  const bandM = sc.mat({
    ramp: VET_BAND,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      if (tg === 'band') return (h.x * 2 + h.y) % 7 === 0 ? sh(VET_BAND, h.tone - 1) : null;
      if (tg === 'fray') return sh(VET_BAND, h.tone - 1);
      return null;
    },
  });
  {
    const lvl = (k: number): V3 => norm(sub(hu, mul(hf, 0.16 * k)));
    const m = lvl(1);
    // (between two slanting lines round his head: over his brow in front, lower behind)
    const lo = 0.3;
    const hi = 0.58;
    sc.ell(bandM, 'band', skullC, [mul(hf, R[0] * 0.86 + 0.85), mul(hl, R[1] * 0.94 + 0.85), mul(hu, R[2] * 0.8 + 0.85)], 0.4, {
      cuts: [{ n: mul(m, -1), o: -dot(m, s.head) - lo * R[2] }, { n: m, o: dot(m, s.head) + hi * R[2] }],
      tag: 'band',
    });
  }
  const knot = at(-1.06, -0.12, 0.36);
  sc.ell(bandM, 'band', knot, [mul(hf, 1.1), mul(hl, 1.3), mul(hu, 1.1)], 0.4, { tag: 'knot' });

  // ---- THE VEST: worn leather, open down his front, over the yoke and round his back ----
  const T = add(s.neck, add(mul(rf, ribs.h[0] * 0.55), mul(ru, -0.8)));
  const gap0 = 4.4;
  const slope = 0.8;
  const panelCut = (side: number): Cut => {
    const m = add(mul(rl, side), mul(ru, slope));
    const M = len(m);
    return { n: mul(m, -1 / M), o: (-gap0 - dot(T, m)) / M };
  };
  const hemZ = add(belly.c, mul(belly.r[2], -belly.h[2] * 0.35));
  const hemCut = keepBelow(mul(belly.r[2], -1), hemZ);
  const backCut = keepBelow(rf, add(ribs.c, mul(rf, ribs.h[0] * 0.1)));
  const vestCuts = [panelCut(1), panelCut(-1)];
  const vestM = sc.mat({
    ramp: VET_VEST,
    paint: (h) => {
      // the rolled edge down each side of the opening, stitched
      for (const c of vestCuts) {
        const dpl = c.o - dot(h.p, c.n);
        if (dpl >= 0 && dpl < 0.9) return h.y % 2 === 0 ? sh(VET_VEST, h.tone + 1) : sh(VET_VEST, h.tone);
      }
      const [a, b, cc] = onChest(h.p);
      // a patch sewn on his back, its stitches round it
      if (cc < -ribs.h[0] * 0.3 && a > -3 && a < 1.5 && b > -1.5 && b < 2.5) {
        const edgeP = a < -2.4 || a > 0.9 || b < -0.9 || b > 1.9;
        return edgeP && (h.x + h.y) % 2 === 0 ? sh(VET_LINEN, 3) : sh(VET_VEST, h.tone - 1);
      }
      // scuffed and worn
      if ((h.x * 5 + h.y * 3) % 11 === 0) return sh(VET_VEST, h.tone + 1);
      if ((h.x * 3 + h.y * 7) % 13 === 0) return sh(VET_VEST, h.tone - 1);
      return far(h.p) ? sh(VET_VEST, h.tone - 1) : null;
    },
  });
  const pad = 0.6;
  /** The vest laid over his trunk: every muscle of it again, `pad` bigger, kept under `cuts` (it hangs over his chest's shapes). */
  const vestShells = (cuts: Cut[]): void => {
    const all = [...cuts, hemCut];
    for (const pr of trunkPrims) {
      if (pr.k === 'ell') {
        const ax = pr.axes.map((a) => mul(a, (len(a) + pad) / Math.max(1e-6, len(a)))) as unknown as readonly [V3, V3, V3];
        sc.ell(vestM, 'torso', pr.c, ax, Math.max(1.6, pr.blend), { cuts: all, tag: 'vest' });
      } else if (pr.k === 'cone') {
        sc.cone(vestM, 'torso', pr.a, pr.b, pr.ra + pad, pr.rb + pad, Math.max(1.6, pr.blend), { cuts: all, tag: 'vest' });
      }
    }
  };
  vestShells([panelCut(1)]);
  vestShells([panelCut(-1)]);
  vestShells([backCut]);

  // ---- TROUSERS hacked off below the knee, the hem ragged; a broad old belt ----
  const clothM = sc.mat({
    ramp: VET_CLOTH,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      if (tg === 'tatter') return sh(VET_CLOTH, h.tone - 1);
      if (h.prim.k === 'cone' && tg === 'leg') {
        const { t, around } = onCone(h.prim as Cone, h.p, f);
        if (t > 0.9 && (h.x * 3 + h.y) % 3 !== 0) return sh(VET_CLOTH, h.tone - 1);
        const c = Math.sin(around * 3 + t * 2.6);
        if (c > 0.82) return sh(VET_CLOTH, h.tone - 1);
        if (c < -0.88) return sh(VET_CLOTH, h.tone + 1);
      }
      if ((h.x * 7 + h.y * 3) % 17 === 0) return sh(VET_CLOTH, h.tone - 1);
      return farArm(h.prim.piece) ? sh(VET_CLOTH, h.tone - 1) : null;
    },
  });
  sc.ell(clothM, 'hips', pel.c, [mul(pel.r[0], pel.h[0] + 0.9), mul(pel.r[1], pel.h[1] + 0.8), mul(pel.r[2], pel.h[2] + 0.5)], 1.6, { tag: 'seat' });
  sc.ell(clothM, 'hips', add(belly.c, mul(belly.r[2], -belly.h[2] * 0.55)), [mul(belly.r[0], belly.h[0] * 0.95 + 0.6), mul(belly.r[1], belly.h[1] * 0.95 + 0.6), mul(belly.r[2], belly.h[2] * 0.5)], 1.2, { tag: 'seat' });
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const [lH, lK] = B.legR;
    const top = add(hip, mul(s.hips[2], 1.0));
    const hem = lerp3(knee, ankle, 0.14);
    const d = norm(sub(ankle, knee));
    // (cut off flat at the hem: the cloth stops there, it does not round off down his shin)
    sc.cone(clothM, `leg${side}`, top, add(hem, mul(d, 2)), lH * 1.08 + 0.8, lK * 1.06 + 1.1, 1.4, { tag: 'leg', cuts: [keepBelow(d, hem)] });
    // the ragged ends where he cut them: tatters hanging off the hem
    const a1 = norm(sub(f, mul(d, dot(f, d))), [1, 0, 0]);
    const a2 = norm(cross(d, a1));
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2 + (side === 'L' ? 0.3 : 0.9);
      const rr = lK * 1.06 + 0.9;
      const root = add(hem, add(mul(a1, Math.cos(ang) * rr), mul(a2, Math.sin(ang) * rr)));
      const drop = 1.6 + ((i * 7 + (side === 'L' ? 1 : 4)) % 4) * 0.55;
      sc.cone(clothM, `leg${side}`, root, add(root, add(mul(d, drop), mul(norm(sub(root, hem)), 0.2))), 0.75, 0.35, 0.5, { tag: 'tatter' });
    }
  }
  const beltM = sc.mat({ ramp: VET_STRAP, paint: (h) => (h.prim.tag === 'belt' && (h.x * 3 + h.y) % 9 === 0 ? sh(VET_STRAP, h.tone + 1) : null) });
  const beltC = add(belly.c, mul(belly.r[2], -belly.h[2] * 0.5));
  sc.ell(beltM, 'hips', beltC, [mul(belly.r[0], belly.h[0] * 0.95 + 1.1), mul(belly.r[1], belly.h[1] * 0.95 + 1.0), mul(belly.r[2], 1.4)], 0.4, { tag: 'belt' });
  const ironM = sc.mat({ ramp: VET_IRON });
  sc.box(ironM, 'hips', add(beltC, add(mul(belly.r[0], belly.h[0] * 0.95 + 1.8), mul(belly.r[1], -0.6))), [mul(belly.r[0], 0.5), mul(belly.r[1], 1.5), mul(belly.r[2], 1.5)], 0.4, 0.2, { tag: 'buckle' });

  // ---- LINEN: his right shin bound; both feet wrapped round the arch, toes and heels bare ----
  const linenM = sc.mat({
    ramp: VET_LINEN,
    paint: (h) => {
      if (h.prim.k === 'cone') {
        const { t, around } = onCone(h.prim as Cone, h.p, f);
        if (Math.floor(t * (h.prim.tag === 'binding' ? 7 : 3) + around / 1.7) % 2 === 0) return sh(VET_LINEN, h.tone - 1);
      } else if ((h.x + h.y) % 3 === 0) return sh(VET_LINEN, h.tone - 1);
      return farArm(h.prim.piece) ? sh(VET_LINEN, h.tone - 1) : null;
    },
  });
  {
    const knee = s.kneeR;
    const ankle = s.ankleR;
    const [, lK, lA] = B.legR;
    const dd = norm(sub(ankle, knee));
    sc.cone(linenM, 'legR', lerp3(knee, ankle, 0.22), lerp3(knee, ankle, 0.97), lK * 0.98 + 0.55, lA * 0.98 + 0.6, 0.5, { tag: 'binding', cuts: [keepBelow(mul(dd, -1), lerp3(knee, ankle, 0.3)), FLOOR_CUT] });
  }
  for (const ft of feet) {
    const ankle = ft.side === 'L' ? s.ankleL : s.ankleR;
    const piece = `leg${ft.side}`;
    sc.box(linenM, piece, add(ft.c, mul(ft.fd, -0.2)), [mul(ft.fd, ft.half * 0.32), mul(ft.fs, 1.95), mul(ft.up, 1.3)], 0.9, 0.3, { tag: 'footwrap', cuts: [FLOOR_CUT] });
    sc.cone(linenM, piece, add(ankle, [0, 0, 1.0]), add(ankle, [0, 0, -0.2]), B.legR[2] + 0.4, B.legR[2] + 0.4, 0.3, { tag: 'anklewrap', cuts: [FLOOR_CUT] });
  }

  // ---- HIS FISTS: BIG; leather bracers on his forearms, his knuckles strapped ----
  const F = VET_FIST.k;
  const fistInfo: { side: 'L' | 'R'; d: V3; top: V3; inw: V3 }[] = [];
  for (const side of ['L', 'R'] as const) {
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const ha = side === 'L' ? s.handL : s.handR;
    const d = norm(sub(ha, el));
    const inw0 = (side === 'L' ? p.palmL : p.palmR) ?? mul(l, side === 'L' ? -1 : 1);
    const inw = norm(sub(inw0, mul(d, dot(inw0, d))), u);
    // (the thumb's side of the fist: up, when the palm faces in and the knuckles forward)
    const top = side === 'R' ? norm(cross(d, inw)) : norm(cross(inw, d));
    fistInfo.push({ side, d, top, inw });
  }
  const fistM = sc.mat({
    ramp: VET_SKIN,
    paint: (h) => {
      const fi = fistInfo.find((x) => `arm${x.side}` === h.prim.piece);
      const dk = farArm(h.prim.piece) ? 1 : 0;
      if (fi && h.prim.tag === 'fingers') {
        // the grooves between his curled fingers
        const ha = fi.side === 'L' ? s.handL : s.handR;
        const k = dot(sub(h.p, ha), fi.top) / F;
        if (Math.abs(((k + 3) % 1.45) - 0.72) < 0.18) return sh(VET_SKIN, h.tone - 1 - dk);
      }
      if (h.prim.tag === 'knuckle' && h.tone >= 3) return sh(VET_SKIN, 4);
      return dk ? sh(VET_SKIN, h.tone - 1) : null;
    },
  });
  const strapM = sc.mat({ ramp: VET_STRAP, paint: (h) => (farArm(h.prim.piece) ? sh(VET_STRAP, h.tone - 1) : null) });
  const bracerM = sc.mat({
    ramp: VET_BRACER,
    paint: (h) => {
      if (h.prim.k === 'cone') {
        const { t, around } = onCone(h.prim as Cone, h.p, u);
        // laced up its inside; a stitched rim at each end
        if (t < 0.1 || t > 0.9) return sh(VET_BRACER, h.tone - 1);
        if (Math.abs(around - Math.PI * 0.5) < 0.4 && h.y % 2 === 0) return sh(VET_LINEN, Math.min(3, h.tone + 1));
        if ((h.x * 5 + h.y * 3) % 11 === 0) return sh(VET_BRACER, h.tone + 1);
      }
      return farArm(h.prim.piece) ? sh(VET_BRACER, h.tone - 1) : null;
    },
  });
  for (const fi of fistInfo) {
    const { side, d, top, inw } = fi;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const ha = side === 'L' ? s.handL : s.handR;
    const piece = `arm${side}`;
    // the bracer, from below the elbow to the wrist
    sc.cone(bracerM, piece, lerp3(el, ha, 0.24), lerp3(el, ha, 0.86), 2.85, 2.2, 0.4, { tag: 'bracer', cuts: [keepBelow(mul(d, -1), lerp3(el, ha, 0.3)), keepBelow(d, lerp3(el, ha, 0.8))] });
    // the wrist into the hand
    sc.cone(fistM, piece, lerp3(el, ha, 0.82), add(ha, mul(d, 0.6 * F)), 1.95, 2.2 * F, 0.9, { tag: 'wrist' });
    // the fist: a heavy block of a hand, the fingers rolled under, the knuckles a ridge, the thumb locked over them
    sc.box(fistM, piece, add(ha, mul(d, 1.5 * F)), [mul(d, 2.0 * F), mul(top, 2.65 * F), mul(inw, 2.05 * F)], 1.25 * F, 1.0, { tag: 'fist' });
    sc.cone(fistM, piece, add(ha, add(mul(d, 2.7 * F), add(mul(inw, 0.75 * F), mul(top, 1.9 * F)))), add(ha, add(mul(d, 2.7 * F), add(mul(inw, 0.75 * F), mul(top, -2.0 * F)))), 1.25 * F, 1.15 * F, 0.6, { tag: 'fingers' });
    for (let i = 0; i < 4; i++) {
      const k = 1.9 - i * 1.3;
      sc.ell(fistM, piece, add(ha, add(mul(d, 3.3 * F), add(mul(inw, -0.55 * F), mul(top, k * F)))), [mul(d, 0.7 * F), mul(top, 0.72 * F), mul(inw, 0.85 * F)], 0.45, { tag: 'knuckle' });
    }
    sc.cone(fistM, piece, add(ha, add(mul(d, 0.9 * F), add(mul(top, 2.4 * F), mul(inw, 0.6 * F)))), add(ha, add(mul(d, 2.9 * F), add(mul(top, 1.5 * F), mul(inw, 1.75 * F)))), 0.95 * F, 0.85 * F, 0.5, { tag: 'thumb' });
    // the strap: round the knuckles, across the back of the hand, round the wrist
    sc.box(strapM, piece, add(ha, add(mul(d, 1.95 * F), mul(inw, -0.1 * F))), [mul(d, 0.42 * F), mul(top, 2.78 * F), mul(inw, 2.22 * F)], 0.4 * F, 0.15, { tag: 'strap' });
    sc.cone(strapM, piece, add(ha, add(mul(d, 0.0), add(mul(inw, -2.0 * F), mul(top, -1.6 * F)))), add(ha, add(mul(d, 2.2 * F), add(mul(inw, -2.15 * F), mul(top, 1.5 * F)))), 0.5, 0.5, 0.15, { tag: 'strap' });
    sc.cone(strapM, piece, add(ha, mul(d, -0.3 * F)), add(ha, mul(d, 0.5 * F)), 2.3 * F, 2.35 * F, 0.15, { tag: 'strap' });
  }

  // ---- THE TAILS: streaming out behind him, rippling, never through him ----
  const solids: Prim[] = sc.prims.filter((pr) => !pr.carve);
  const clear = (pt: V3, want: number): V3 => {
    let out = pt;
    for (let pass = 0; pass < 5; pass++) {
      let d = Infinity;
      for (const pr of solids) d = Math.min(d, primDist(pr, out));
      if (d >= want) break;
      const E = 0.3;
      const g = (dx: number, dy: number, dz: number): number => {
        let m = Infinity;
        for (const pr of solids) m = Math.min(m, primDist(pr, [out[0] + dx, out[1] + dy, out[2] + dz]));
        return m;
      };
      const n = norm([g(E, 0, 0) - g(-E, 0, 0), g(0, E, 0) - g(0, -E, 0), g(0, 0, E) - g(0, 0, -E)], [0, 0, 1]);
      out = add(out, mul(n, want - d + 0.05));
    }
    return out;
  };
  const trail0 = norm(p.trail);
  const lines: V3[][] = [];
  const tailOf = (which: number): void => {
    const L = which === 0 ? 25 : 19.5;
    const N = which === 0 ? 13 : 11;
    const seg = L / N;
    const phase = p.phase + which * 1.7;
    const trail = norm(add(trail0, add(mul(hl, which === 0 ? 0.18 : -0.22), [0, 0, which === 0 ? 0 : -0.12])));
    let dir = norm(add(mul(hf, -1), add(mul(hu, -0.25), mul(trail, 0.6))));
    const start = add(knot, add(mul(hl, which === 0 ? 0.55 : -0.55), mul(hf, -0.6)));
    const centre: V3[] = [start];
    const dirs: V3[] = [dir];
    let pt = start;
    for (let i = 0; i < N; i++) {
      const k = Math.min(1, 0.3 + i * 0.1);
      dir = norm(lerp3(dir, trail, k * 0.55));
      pt = add(pt, mul(dir, seg));
      centre.push(pt);
      dirs.push(dir);
    }
    // the ripple across, growing toward the free end; then kept clear of him
    const ripple: V3[] = centre.map((c, i) => {
      const across = norm(cross(dirs[i], eye), hl);
      const amp = p.ripple * Math.min(1, i / (N * 0.5));
      const wave = Math.sin(phase + i * 0.78) - Math.sin(phase);
      return i === 0 ? c : clear(add(c, mul(across, amp * wave)), 1.1);
    });
    lines.push(ripple);
    const piece = which === 0 ? 'tailA' : 'tailB';
    for (let i = 0; i < N; i++) {
      const a = ripple[i];
      const b = ripple[i + 1];
      const dd = norm(sub(b, a));
      const across = norm(cross(dd, eye), hl);
      const tw = (k: number): V3 => about(across, dd, 38 * Math.sin(phase * 0.8 + k * 0.55));
      const hw = (k: number): number => 1.2 - (k / N) * 0.42;
      const wa = mul(tw(i), hw(i));
      const wb = mul(tw(i + 1), hw(i + 1));
      const tag = i >= N - 1 ? 'fray' : 'tail';
      sc.tri(bandM, piece, add(a, wa), sub(a, wa), add(b, wb), 0.42, 0.35, { tag });
      sc.tri(bandM, piece, sub(a, wa), sub(b, wb), add(b, wb), 0.42, 0.35, { tag });
    }
    // the frayed end: two short threads off it
    const e = ripple[N];
    const ed = norm(sub(ripple[N], ripple[N - 1]));
    const ac = norm(cross(ed, eye), hl);
    for (const k of [0.55, -0.5]) sc.cone(bandM, piece, add(e, mul(ac, k * 0.6)), add(e, add(mul(ed, 1.4), mul(ac, k * 1.1))), 0.35, 0.28, 0.2, { tag: 'fray' });
  };
  tailOf(1);
  tailOf(0);

  return { sc, s, tails: lines };
}

/** The canvas he is painted on: room above for his leaps and his uppercut, and either side for the tails and kicks. */
export const VET_CANVAS = { w: 220, h: 196, ax: 110, ay: 160 };

/** THE VETERAN, painted: in a view (the game's from in front, as it is for every truly turned picture), with the friend's crisp cyan edge. */
export function paintVeteran(p: VetPose, turn = 0, view: GameView = 'front'): Drawn & { fig: VetFigure } {
  const fig = sculptVeteran(p, turn);
  const d = draw(fig.sc, view, VET_CANVAS.ax, VET_CANVAS.ay, VET_CANVAS, undefined, CYAN[2]);
  return { ...d, fig };
}

/** Every pose of his, in order: the stance, then each move's wind-up and strike. */
export const VET_ALL: VetPose[] = [VET_STANCE, VET_STANCE_UP, ...VET_MOVES.flatMap((m) => [m.windup, m.strike])];

