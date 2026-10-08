// MOVES OF THE SKELETON (begun 6 Oct 2026): what a real person's body does in each of the heroes'
// moves, worked out on the bones (src/art/skeleton.ts) before any hero is painted over them. The
// owner: "research how an actual person would move and look doing it and apply that to the
// animations"; "Or just create a wire frame and we can use that to make animations". What was
// read up on is in docs/NEXT_VERSION.md, "BODIES AND HEADS THAT MOVE".
//
// Each move keeps the game's own timing: its blow lands (`hit`) when the rules say it does.

import { holdOnBack } from './carried';
import { add, bonesAt, buildOf, dot, elbowFor, heading, len, mul, solve, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion } from './skeleton';

/** The usual body: 57 picture pixels tall, built like a grown person. What a weapon's length is a share of, and what the moves were first written on. */
export const BODY: Build = buildOf(57);

/**
 * EACH HERO HAS A BODY OF THEIR OWN (the owner, 6 Oct 2026, of the three painted over the usual
 * body: "The skeleton gives them shape, but not proportion. They lost all girth, especially the
 * warrior. He needs broader shoulders. Work on all three. And make the mage female. The skeletons
 * can be tweeked as well to make them shorter or taller or broader"). Each has the head he chose
 * that evening ("B": about a third bigger than life).
 *   - THE KNIGHT: the tallest and by far the broadest. Shoulders more than a quarter wider than
 *     the usual, a deep chest, a thick waist, heavy arms and legs: a man who carries mail and a
 *     great sword all day. His arms are a little longer (both hands must meet on a hilt across
 *     that chest).
 *   - THE RANGER: LITHE (the owner, 20:01 that evening, of a first one made sturdier than the
 *     usual: "ranger is too sturdy. he needs to be lithe and graceful"). As tall as the usual and
 *     longer in the leg, narrow in the hips and the waist, his shoulders no wider than the usual,
 *     his arms and legs slight.
 *   - THE MAGE: a woman, the shortest of the three: narrower shoulders, a small waist, hips wider
 *     than her waist, slighter arms and legs.
 */
export const HEAD_B = 1.3;
export const KNIGHT_BODY: Build = buildOf(58, HEAD_B, { shoulders: 1.27, chest: 1.3, waist: 1.25, hips: 1.14, depth: 1.16, arms: 1.05, limbs: 1.28, pad: 1.4 });
export const RANGER_BODY: Build = buildOf(57, HEAD_B, { shoulders: 0.98, chest: 0.9, waist: 0.82, hips: 0.88, legs: 1.04, trunk: 0.96, limbs: 0.82, pad: 0.9 });
export const MAGE_BODY: Build = buildOf(54.5, HEAD_B, { shoulders: 0.9, chest: 0.94, waist: 0.86, hips: 1.1, limbs: 0.9, skirt: [2.4, 2.2] });

/** What is in the hands: it decides what the wire figure is drawn holding. */
export type Held = 'bow' | 'greatsword' | 'sword' | 'staff' | 'none';

export interface Move3 {
  /** What it is called on a picture. */
  name: string;
  held: Held;
  /** Whose body makes it. */
  build: Build;
  /** The pose the hero stands in with that weapon: every key starts from it. */
  rest: Bones;
  motion: Motion;
  /** What the moment of `hit` is, said on a picture ("the moment the arrows go"). */
  at?: string;
  /** The game itself lifts the figure through the air for the first `until` seconds of it, `high` picture pixels at the top (a leap). */
  arc?: { until: number; high: number };
  /** For a move in which a weapon is drawn: the moment, in seconds from its start, at which the hero stands ready with it (the stance is then held a while). */
  ready?: number;
}

const FR = 1 / 30;

// ---------------------------------------------------------------------------------------------
// Running

/** How someone runs. */
export interface Gait {
  /** How far ahead of the hips a foot comes down, and how far behind them it leaves the floor. */
  reach: number;
  push: number;
  /** How high the foot is carried on its way forward. */
  kick: number;
  /** How far the body is tipped into it: the pelvis, and the spine on top of that. */
  lean: number;
  hunch: number;
  /** How low the runner sits, and how far they rise and fall at each step. */
  sink: number;
  bob: number;
  /** How far the hips swing round with the legs, and the chest against them (1 = as far the other way). */
  hips: number;
  counter: number;
  /** Which way the hips and the chest are turned on the whole (someone carrying a long sword at one hip runs a little side-on). */
  yaw: number;
  twist: number;
  /** How the head is carried: degrees above level the face looks (if not given, 2 below: a runner watches the ground a little way ahead). */
  look?: number;
  /**
   * The arms, for a place in the stride: `swing` is +1 when the right arm is furthest forward (the
   * left foot has just come down) and -1 when the left is; `step` goes from 0 to 1 twice a stride.
   */
  arms: (swing: number, step: number) => Partial<Bones>;
}

/** Two steps of a run (the left foot comes down at the start, the right half way), which then goes round. It takes `period` seconds. */
export function run(g: Gait, period = 0.5, n = 16): Motion {
  const STANCE = 0.36;
  const foot = (phase: number): { x: number; z: number; pitch: number } => {
    const ph = ((phase % 1) + 1) % 1;
    if (ph < STANCE) {
      // on the floor: it goes back under the body at the body's own speed, comes down a little heel first, and leaves off the toes
      const u = ph / STANCE;
      const pitch = u < 0.25 ? -8 * (1 - u / 0.25) : 38 * ((u - 0.25) / 0.75) ** 2;
      return { x: g.reach - (g.reach + g.push) * u, z: pitch > 0 ? onToes(pitch) : 0, pitch };
    }
    // in the air: the heel is flung up behind, the knee comes through, the foot reaches and is set down
    const v = (ph - STANCE) / (1 - STANCE);
    const go = v * v * (3 - 2 * v);
    const pitch = v < 0.25 ? 38 + 24 * (v / 0.25) : Math.max(-8, 62 - 70 * ((v - 0.25) / 0.6));
    return { x: -g.push + (g.reach + g.push) * go, z: g.kick * Math.sin(Math.PI * v ** 0.75) + (1 - v) * onToes(38) * (v < 0.3 ? 1 : 0), pitch };
  };
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const ph = i / n;
    const turn = Math.cos(ph * Math.PI * 2);
    const l = foot(ph);
    const r = foot(ph + 0.5);
    const step = (ph * 2) % 1;
    keys.push({
      at: ph * period,
      ease: 'lin',
      pose: {
        pz: -g.sink - g.bob * Math.cos((2 * ph - STANCE) * Math.PI * 2),
        yaw: g.yaw - g.hips * turn, pitch: g.lean, roll: 2 * Math.cos((ph - STANCE / 2) * Math.PI * 2),
        twist: g.twist + (1 + g.counter) * g.hips * turn, bend: g.hunch + 1.2 * Math.cos(ph * Math.PI * 4), side: 0,
        faceTurn: 0, faceUp: g.look ?? -2,
        lfx: l.x, lfy: -1.2, lfz: l.z, lfp: l.pitch, lft: 2, lk: 2,
        rfx: r.x, rfy: 1.2, rfz: r.z, rfp: r.pitch, rft: -2, rk: -2,
        ...g.arms(turn, step),
      },
    });
  }
  return { keys, loop: 0 };
}

/** Both arms going as a runner's do: bent, each forward as the other leg is. `far` is how big the swing is. */
export function pump(swing: number, far = 1): Partial<Bones> {
  const at = (k: number): [number, number, number] => [-4.5 + 12.5 * k * far, 0, -12 + 5.5 * k];
  const r = at((1 + swing) / 2);
  const l = at((1 - swing) / 2);
  return { rhIn: 0, rhx: r[0], rhy: 1.5, rhz: r[2], lhIn: 0, lhx: l[0], lhy: -1.5, lhz: l[2], le: 0, re: 0 };
}

// ---------------------------------------------------------------------------------------------
// The archer

/** How long a bow is from its grip to each tip, and how far its string stands off the grip when it is not drawn. */
export const BOW_HALF = 0.31 * BODY.tall;
export const BOW_BRACE = 0.09 * BODY.tall;

/**
 * READY: how the ranger stands in the middle of anything he does (a little side-on, the weight on
 * the back foot, the bow hanging in his left hand). Every key of a move starts from this: what a
 * key does not name is as it is here. (It is not how he stands when left standing: see ARCHER.)
 */
const HANG = standing(RANGER_BODY).rhz;
const READY: Partial<Bones> = {
  pz: -0.7, px: -0.6, py: 0, yaw: -16, roll: 2, twist: -6, side: -3, bend: 1,
  lfx: 3.2, lfy: 0.4, lfz: 0, lfp: 0, lft: 2, lk: 2, rfx: -1.2, rfy: 0, rfz: 0, rfp: 0, rft: -22, rk: -14,
  lhIn: 0, lhx: 4.5, lhy: 2, lhz: -19, le: 8, wAz: 0, wEl: -8, wRoll: 0,
  rhIn: 0, rhx: 1.2, rhy: -1, rhz: HANG, re: 0,
  faceTurn: 0, faceUp: 0, faceTilt: 0,
};

/**
 * LEFT STANDING, HE IS LITHE AND AT HIS EASE (the owner, 6 Oct 2026, 20:01: "ranger is too
 * sturdy. he needs to be lithe and graceful"; and of the heroes, that morning, "a roguish
 * charm"). All his weight is on his right leg, that hip out and high; his left leg is free, the
 * knee bent and turned out, the foot set down ahead and to the side on its toe; his shoulders tip
 * the other way from his hips, as a dancer's do: a long S from his head to his standing foot. The bow is
 * carried lightly in front of him in the left hand, upright and a little laid over, where it can
 * be seen; the back of his right hand is on his hip, the elbow out; his chin is up and he looks
 * a little to his right, over the hand that draws.
 */
const ARCHER: Bones = {
  ...standing(RANGER_BODY),
  pz: -0.4, px: -0.2, py: -1.5, yaw: -14, roll: -5, twist: -6, side: 7, bend: -1,
  lfx: 4.8, lfy: 2.4, lfz: onToes(34), lfp: 34, lft: 20, lk: 24,
  rfx: -0.8, rfy: 0.5, rft: -14, rk: -8,
  lhIn: 0, lhx: 7, lhy: 3.4, lhz: -14.6, le: 12, wAz: 12, wEl: 10, wRoll: 10,
  rhIn: 0, rhx: 1.2, rhy: 1.8, rhz: -13.6, re: -52,
  faceTurn: -16, faceUp: 5, faceTilt: 4,
};
/** The whole of him READY: what a move's keys are measured from. */
const STANCE: Bones = { ...ARCHER, ...READY };
/** A move whose keys start from READY (all but those that are the easy stance itself: the first and the last of it). */
function ready(m: Motion, from: Partial<Bones> = READY): Motion {
  return { ...m, keys: m.keys.map((k) => (Object.keys(k.pose).length === 0 ? k : { ...k, pose: { ...from, ...k.pose } })) };
}

/**
 * The two hands of an archer whose body is posed as `body`, aiming `el` degrees above level with
 * the string pulled `pull` of the way (0 = on the string, undrawn; 1 = full draw).
 *
 * AT FULL DRAW THE STRING HAND IS AT THE JAW (the anchor: under the chin, at the corner of the
 * mouth), and it is the FACE that decides where that is. The arrow lies from there along the aim,
 * and the bow hand is on that line at arm's length from its shoulder. So the arms are found from
 * the body, as an archer's are: the shoulders, arms and bow keep their T, and it is tipping the
 * body that raises the arrow ("bend at the waist"; the mistake is to stand erect and only raise
 * the bow arm).
 */
function drawn(body: Partial<Bones>, el: number, pull: number, rest: Bones = STANCE): Partial<Bones> {
  const q: Bones = { ...rest, ...body };
  const s = solve(RANGER_BODY, q);
  const aim = heading(0, el);
  const R = RANGER_BODY.headR;
  const anchor = add(s.head, add(mul(s.face[0], R[0] * 0.78), add(mul(s.face[1], -R[1] * 0.3), mul(s.face[2], -R[2] * 0.72))));
  // the bow hand: on the arrow's line, at nearly the arm's whole length from its shoulder
  const armLen = (RANGER_BODY.upperArm + RANGER_BODY.foreArm) * 0.975;
  const from = sub(anchor, s.shoulderL);
  const along = dot(aim, from);
  const disc = along * along - dot(from, from) + armLen * armLen;
  const grip = disc >= 0 ? add(anchor, mul(aim, -along + Math.sqrt(disc))) : add(s.shoulderL, mul(aim, armLen));
  const full = len(sub(grip, anchor));
  const string = add(grip, mul(aim, -(BOW_BRACE + (full - BOW_BRACE) * pull)));
  const l = sub(grip, s.shoulderL);
  const r = sub(string, s.shoulderR);
  const hands: Partial<Bones> = { ...body, lhIn: 1, lhx: l[0], lhy: l[1], lhz: l[2], rhIn: 1, rhx: r[0], rhy: r[1], rhz: r[2], wAz: 0, wEl: el, draw: pull };
  // the drawing elbow: AT FULL DRAW behind the arrow and in line with it, a little high (never
  // hanging under the hand). With the hand only just on the string, the arm out long in front of
  // him, it is out to his own side and low, and it comes up behind the arrow as he pulls.
  const slack = 1 - pull;
  const re = elbowFor(RANGER_BODY, { ...q, ...hands }, false, add(add(mul(aim, -(0.3 + 0.7 * pull)), [0, 0, 0.3 * pull - 0.6 * slack]), mul(s.chest[1], -0.7 * slack)), rest.re);
  // the bow arm's elbow turns out, away from the string's path
  const le = elbowFor(RANGER_BODY, { ...q, ...hands }, true, add(mul(s.chest[0], 1), [0, 0, -0.4]), rest.le);
  return { ...hands, re, le };
}

/**
 * The same archer the moment the string has gone: the string hand flies straight back along the
 * arrow's line (`back`), the bow hand is pushed along it (`kick`), and the bow rocks forward in
 * the hand (`rock` degrees). The face does not move: an archer looks at the mark until the arrow
 * is in it.
 */
function loosed(body: Partial<Bones>, el: number, back: number, kick: number, rock: number): Partial<Bones> {
  const d = drawn(body, el, 1);
  const aim = heading(0, el);
  return {
    ...d,
    lhx: (d.lhx ?? 0) + aim[0] * kick, lhz: (d.lhz ?? 0) + aim[2] * kick,
    // (and it sinks as it goes, to rest by the neck under the brim of his cap: flying on level it ended up behind the cap, a hand growing out of his hat)
    rhx: (d.rhx ?? 0) - aim[0] * back, rhy: (d.rhy ?? 0) - 1.5, rhz: (d.rhz ?? 0) - aim[2] * back - back * 0.75,
    wEl: el - rock, draw: 0,
  };
}

/** Down on the right knee, the left foot planted a long step ahead: the legs of it. */
const KNEEL: Partial<Bones> = { lfx: 16.4, lfy: -0.7, lfz: 0, lfp: 0, lft: 0, rfx: -15.3, rfy: 0.7, rfz: 3.3, rfp: 40, rft: -4, lk: 3, rk: 0 };

/**
 * VOLLEY. The owner, 6 Oct 2026: "i love the knee pose for volley but he should lean back and
 * look up".
 *
 * The eyes go first: he is looking at the sky he will shoot into before the bow is up. He drops
 * onto the right knee, the left foot going a long step ahead, turning side-on to the mark as he
 * goes down (the hips half way, the chest the rest); the bow comes up and the string comes back
 * as one pull. Then the lean: the hips push forward over the planted foot and the whole upper
 * body tips back from them, shoulders, arms and bow kept as one T, the string hand at the jaw and
 * the face along the arrow. The arrows go on the seventh frame (the rules'): the string hand
 * flies back past the ear, the bow rocks forward in the hand, the chest opens. He stays so,
 * watching them go, then comes forward off the lean and up.
 */
function volley(): Motion {
  const down: Partial<Bones> = { ...KNEEL, pz: -14.5 };
  const full: Partial<Bones> = { ...down, px: 2.5, yaw: -50, pitch: -10, twist: -38, bend: -30, faceUp: 50 };
  const keys: Key3[] = [
    { at: 0, pose: {} },
    // the eyes are up already; the body crouches forward as the knee starts down and the front foot goes out
    { at: 2 * FR, pose: drawn({ pz: -8.5, px: 1, yaw: -36, pitch: 5, twist: -20, bend: 7, faceUp: 28, lfx: 10, lfz: 2.6, lfp: -12, lft: 0, rfx: -8, rfz: 1.4, rfp: 28, rk: 0, lk: 3 }, 26, 0.25), ease: 'in' },
    // the knee lands: the weight of him goes down into it
    { at: 3 * FR, pose: drawn({ ...down, pz: -15.6, px: 1.6, yaw: -47, pitch: -2, twist: -32, bend: -6, faceUp: 40 }, 38, 0.6), ease: 'out' },
    // the lean: hips forward, the T tipped back, the face along the arrow
    { at: 5 * FR, pose: drawn(full, 50, 1), ease: 'out' },
    { at: 6 * FR, pose: drawn({ ...full, bend: -31 }, 50, 1), ease: 'lin' },
    // loosed
    // loosed (prop 4: a fan of arrows is seen going; `pt` is how far gone)
    { at: 7 * FR, pose: { ...loosed({ ...full, bend: -33, twist: -45 }, 50, 3.4, 1.4, 16), prop: 4, pt: 0 }, ease: 'lin' },
    { at: 9 * FR, pose: { ...loosed({ ...full, bend: -31, twist: -43, faceUp: 52 }, 50, 3.8, 0.8, 11), prop: 4, pt: 1 }, ease: 'lin' },
    // watching them go, he comes forward off the lean
    { at: 13 * FR, pose: { ...down, px: 1.5, yaw: -40, pitch: -3, twist: -22, bend: -8, faceUp: 30, lhIn: 0, lhx: 9, lhy: 4, lhz: -8, rhIn: 0, rhx: 3, rhy: -1, rhz: -17, wEl: 8, pt: 1 } },
    { at: 17 * FR, pose: {}, ease: 'io' },
  ];
  return { keys, hit: 6 * FR };
}

export const VOLLEY3: Move3 = { name: 'Volley', held: 'bow', build: RANGER_BODY, rest: ARCHER, motion: ready(volley()), at: 'the moment the arrows go' };

/**
 * SHOT. An archer's shot, all of it: the front foot goes toward the mark and the body turns
 * side-on to it as the bow comes up; the draw is one pull to the jaw, the chest opening, the
 * weight settling back against it; the face has been on the mark since before the bow moved. The
 * arrow goes on the sixth frame (the rules'). The string hand flies back past the ear, the bow
 * rocks forward, the chest opens further; he holds that, watching it fly; then the bow comes
 * down and he stands easy. (The arrow is simply on the string when he draws: no reaching for the
 * quiver, by the owner's word.)
 */
function shot(): Motion {
  const feet: Partial<Bones> = { lfx: 8.5, lfy: 0.4, lft: 0, lk: 2, rfx: -3, rft: -50, rk: -30 };
  const set: Partial<Bones> = { ...feet, px: 2, pz: -1.8, yaw: -48, pitch: -3, twist: -40, bend: -4, faceUp: 2 };
  const gone = loosed({ ...set, pitch: 0, twist: -47 }, 3, 3.8, 0.8, 10);
  return {
    hit: 5 * FR,
    keys: [
      { at: 0, pose: {} },
      { at: 2 * FR, pose: drawn({ px: 1, pz: -1.2, yaw: -38, twist: -28, bend: 2, lfx: 6, lfz: 1.6, lft: 0, lk: 2, rfx: -2, rft: -40, rk: -24 }, 2, 0.4), ease: 'out' },
      { at: 4 * FR, pose: drawn(set, 3, 1), ease: 'out' },
      { at: 5 * FR, pose: drawn({ ...set, twist: -42 }, 3, 1), ease: 'lin' },
      // (prop 3: the arrow is seen going; `pt` is how far gone)
      { at: 6 * FR, pose: { ...loosed({ ...set, pitch: 0, bend: -1, twist: -50 }, 3, 3.4, 1.4, 14), prop: 3, pt: 0 }, ease: 'lin' },
      { at: 8 * FR, pose: { ...gone, prop: 3, pt: 1 }, ease: 'lin' },
      // (he holds it a moment, watching the arrow; then the bow comes down and he stands easy
      // again. HE DOES NOT REACH FOR THE NEXT ARROW: the owner, 6 Oct 2026, 21:06, of the hand
      // going back over the shoulder to the quiver: "i think just pulling the string back and
      // having the arrow appear is totally fine")
      { at: 10 * FR, pose: { ...gone, pt: 1 }, ease: 'out' },
      { at: 15 * FR, pose: {}, ease: 'io' },
    ],
  };
}
export const SHOT3: Move3 = { name: 'Shot', held: 'bow', build: RANGER_BODY, rest: ARCHER, motion: ready(shot()), at: 'the moment the arrow goes' };

/**
 * HOW THE RANGER RUNS: low and light, well forward over his feet, a long quick stride. The bow
 * is carried level at his left side and that arm hardly swings; the right arm goes as a runner's
 * does; his chest turns against his hips at every step, and his head does not turn at all.
 */
const RANGER_GAIT: Gait = {
  // HE RUNS A LITTLE BENT OVER, LOW, HIS HEAD UP (the owner, 6 Oct 2026, 21:31: "can we get the
  // ranger running slightly bent over.  not much, but like he's hunting in the woods trying to
  // keep a low profile"): tipped further into it and folded a little at the waist, deeper in
  // his knees and rising less at each step, his face up and watching ahead, his arm not pumping
  // as a sprinter's does. (He was at lean 15, hunch 6, sink 3, bob 1.2, his face 2 below level.)
  reach: 11, push: 14.5, kick: 10, lean: 22, hunch: 12, sink: 4.6, bob: 0.9, hips: 9, counter: 0.85, yaw: 0, twist: 0, look: 5,
  arms: (swing) => {
    // THE BOW HAND is where it was, measured on his chest ("i like where the bow is at tho").
    const bow: Partial<Bones> = { lhIn: 0, lhx: 2 + (-4.5 + 12.5 * ((1 - swing) / 2) * 0.7) * 0.35, lhy: 1.5, lhz: -13.5, le: 0, wAz: 90, wEl: -12, wRoll: 90 + swing * 8 };
    // HIS OTHER ARM HANGS LOOSE AND SWINGS LOW BY HIS HIP, nearly straight, under its shoulder
    // as a weight does however far he leans: measured from the shoulder on the FIGURE's own
    // forward and up, not the chest's. It was bent square and pumping as the bow arm is held,
    // which on a runner bent over put its elbow up behind him like a wing (the owner, 6 Oct 2026,
    // 21:35, of this run: "the left arm is a little wonky again. i see it matches the bow arm
    // but im not digging it.  i like where the bow is at tho").
    const k = (1 + swing) / 2;
    return { ...bow, rhIn: 1, rhx: -4 + 11.5 * k, rhy: -0.5, rhz: -20.5 + 5 * k, re: 0 };
  },
};
export const RANGER_RUN3: Move3 = { name: 'The ranger runs', held: 'bow', build: RANGER_BODY, rest: ARCHER, motion: ready(run(RANGER_GAIT)) };

/**
 * THE ROLL: the ranger's way out of trouble, and it is a real one. Forward and down onto his
 * hands, over his rounded back in a ball with his chin on his chest (the head goes round with
 * him: it is the one time it does not look where he is going), and up off a knee. The game
 * carries him along the floor while he does it; `long` is how many seconds it gives him.
 */
function roll(long: number): Motion {
  const hipH = RANGER_BODY.ankle + RANGER_BODY.shank + RANGER_BODY.thigh;
  /**
   * Tucked in a ball that has turned `theta` degrees forward: where that puts everything. The
   * ball is him folded at the hips, thighs to his chest and heels to his seat, his back rounded
   * and his chin down; it rolls on the floor, so its middle stays at its own radius above it.
   */
  const ball = (theta: number): Partial<Bones> => {
    const a = (theta * Math.PI) / 180;
    // (a point given along his own forward and his own up, as he has turned)
    const at = (f: number, u: number): [number, number] => [Math.cos(a) * f + Math.sin(a) * u, -Math.sin(a) * f + Math.cos(a) * u];
    const R = 13.5;
    const [hx, hz] = at(-4.5, -7.5);
    const [fx, fz] = at(5, -7);
    const [kx, kz] = at(11.5, 2.5);
    const pelvisZ = R + hz;
    return {
      px: hx, pz: pelvisZ - hipH, pitch: theta, yaw: 0, twist: 0, bend: 78, faceTurn: 0, faceUp: -theta - 108,
      lfx: hx + fx, lfy: -1, lfz: pelvisZ + fz - RANGER_BODY.ankle, lfp: theta + 30, lk: 0, lkUp: 55 - theta,
      rfx: hx + fx, rfy: 1, rfz: pelvisZ + fz - RANGER_BODY.ankle, rfp: theta + 30, rk: 0, rkUp: 55 - theta,
      // (his hands are round his knees; the bow is across him, a spoke through the ball)
      lhIn: 2, lhx: hx + kx, lhy: 4, lhz: pelvisZ + kz, rhIn: 2, rhx: hx + kx, rhy: -4, rhz: pelvisZ + kz, wAz: 90, wEl: 0, wRoll: 90 - theta,
    };
  };
  const keys: Key3[] = [
    { at: 0, pose: { px: 2, pz: -8, pitch: 22, bend: 26, faceUp: -12, lfx: 5, rfx: -3, rhIn: 0, rhx: 9, rhy: 2, rhz: -12 } },
    { at: 0.16 * long, pose: { px: 5, pz: -16.5, pitch: 62, bend: 48, faceUp: -75, lfx: 4, rfx: -2, rfp: 30, rfz: onToes(30), rhIn: 2, rhx: 15, rhy: -4, rhz: 1.5 }, ease: 'in' },
  ];
  const N = 8;
  for (let i = 0; i <= N; i++) keys.push({ at: (0.18 + 0.62 * (i / N)) * long, pose: ball(80 + (300 * i) / N), ease: i === 0 ? 'hold' : 'lin' });
  keys.push({ at: 0.82 * long, pose: { ...KNEEL, lfx: 10, rfx: -13, px: 1, pz: -14.5, pitch: 14, bend: 22, faceUp: -6 }, ease: 'hold' });
  keys.push({ at: long, pose: { px: 1, pz: -4.5, pitch: 8, bend: 8, lfx: 5, rfx: -4, rfp: 18, rfz: onToes(18) }, ease: 'out' });
  return { keys };
}
export const ROLL3: Move3 = { name: "The ranger's roll", held: 'bow', build: RANGER_BODY, rest: ARCHER, motion: ready(roll(0.4)) };

export const RANGER_REEL3: Move3 = { name: 'The ranger is struck hard', held: 'bow', build: RANGER_BODY, rest: ARCHER, motion: ready(reel(STANCE)) };
export const RANGER_LURCH3: Move3 = { name: 'The ranger is struck from behind', held: 'bow', build: RANGER_BODY, rest: ARCHER, motion: ready(lurch(STANCE)) };

/**
 * THE RANGER'S FALL. The blow throws him back; a step back to keep his feet, the bow drooping; a
 * knee gives and he is down on it (the knee he looses a Volley from); the bow goes to the floor
 * before him, his hand still on it; his head goes down over it, and the light goes out of him.
 * He is left on one knee with his bow lying in front of him.
 */
function rangerFall(): Motion {
  const down: Partial<Bones> = {
    px: -6, pz: -15, yaw: -10, pitch: 6, twist: -4, bend: 12,
    lfx: 5, lfy: 0.5, lfz: 0, lft: 4, lk: 4, rfx: -18, rfy: 0.5, rfz: 3.3, rfp: 40, rft: -6, rk: -4,
  };
  const laid: Partial<Bones> = { lhIn: 2, lhx: 11, lhy: 5, lhz: 1.6, wAz: 0, wEl: 0, wRoll: 90 };
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 2 * FR, pose: { px: -3.5, pz: -2.5, pitch: -6, bend: -14, faceUp: -8, rfx: -6, rfz: 1.2, rfp: 12 }, ease: 'out' },
      { at: 8 * FR, pose: { px: -5, pz: -2, pitch: -2, bend: -3, faceUp: 10, lfx: 0, lfz: 1.2, rfx: -8, lhz: -20, wEl: -30 }, ease: 'io' },
      { at: 14 * FR, pose: { px: -5.5, pz: -6.5, pitch: 3, bend: 6, faceUp: 2, lfx: 2, rfx: -10, rfp: 16, rfz: onToes(16), lhz: -20, wEl: -45 }, ease: 'io' },
      // (down on the knee: slowly, and then all at once; and the weight of him landing)
      { at: 20 * FR, pose: { ...down, faceUp: -6, lhz: -19, wEl: -60, out: 0.2 }, ease: 'in' },
      { at: 22 * FR, pose: { ...down, pz: -16.3, bend: 18, faceUp: -14, out: 0.3 }, ease: 'lin' },
      { at: 26 * FR, pose: { ...down, bend: 14, faceUp: -18, ...laid, out: 0.45 }, ease: 'out' },
      { at: 46 * FR, pose: { ...down, pitch: 9, bend: 24, faceUp: -52, ...laid, out: 1 }, ease: 'io' },
    ],
  };
}
export const RANGER_FALL3: Move3 = { name: "The ranger's fall", held: 'bow', build: RANGER_BODY, rest: ARCHER, motion: ready(rangerFall()) };

/**
 * LEFT STANDING, the ranger has two things he does. A squirrel comes out from under his cloak
 * onto his right shoulder, runs round behind his neck to the left one, sits, comes back across
 * his chest and goes under the cloak again: and HIS HEAD FOLLOWS IT, shoulder to shoulder and down
 * (`prop` 1; `pt` is how far round it has run). Or he draws an arrow, holds it level before his
 * eye and sights along it, head laid over a little, and puts it back (`prop` 2).
 */
function squirrel(): Motion {
  const on: Partial<Bones> = { prop: 1 };
  return {
    keys: [
      { at: 0, pose: { ...on } },
      { at: 0.45, pose: { ...on, pt: 0.13, faceTurn: -62, faceUp: -12, twist: ARCHER.twist - 8, side: ARCHER.side - 3 } },
      { at: 0.75, pose: { ...on, pt: 0.21, faceTurn: -66, faceUp: -10, twist: ARCHER.twist - 8, side: ARCHER.side - 3 }, ease: 'lin' },
      { at: 1.3, pose: { ...on, pt: 0.37, faceTurn: 58, faceUp: -10, twist: ARCHER.twist + 8, side: ARCHER.side + 3 }, ease: 'io' },
      { at: 1.95, pose: { ...on, pt: 0.56, faceTurn: 60, faceUp: -14, faceTilt: -6, twist: ARCHER.twist + 8, side: ARCHER.side + 3 }, ease: 'lin' },
      { at: 2.35, pose: { ...on, pt: 0.67, faceTurn: 6, faceUp: -42, bend: ARCHER.bend - 2 }, ease: 'io' },
      { at: 2.8, pose: { ...on, pt: 0.8, faceTurn: -58, faceUp: -14, twist: ARCHER.twist - 6 }, ease: 'io' },
      { at: 3.1, pose: { ...on, pt: 0.89, faceTurn: -50, faceUp: -22 }, ease: 'lin' },
      { at: 3.5, pose: { ...on, pt: 1 }, ease: 'io' },
      { at: 3.6, pose: { pt: 1 } },
    ],
  };
}
function sighting(): Motion {
  const quiver: Partial<Bones> = { rhIn: 0, rhx: -3.5, rhy: 2, rhz: 4.5 };
  const reach2 = { ...quiver, re: elbowFor(RANGER_BODY, { ...ARCHER, ...quiver }, false, [0.6, -0.3, 1], ARCHER.re) };
  const eye: Partial<Bones> = { rhIn: 0, rhx: 11.5, rhy: 3.2, rhz: 6.2, re: 30, prop: 2, pAz: 4, pEl: 2, faceTilt: 9, faceTurn: -4, faceUp: 0, twist: ARCHER.twist - 4 };
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.4, pose: { ...reach2, faceTurn: -18, faceUp: 4 } },
      { at: 0.55, pose: { ...reach2, prop: 2, pAz: -170, pEl: 80 }, ease: 'hold' },
      { at: 1.05, pose: { ...eye } },
      { at: 2.25, pose: { ...eye, pt: 1, bend: ARCHER.bend + 2 }, ease: 'lin' },
      { at: 2.5, pose: { ...eye, pt: 1 } },
      { at: 2.95, pose: { ...reach2, prop: 2, pt: 1, pAz: -170, pEl: 80, faceTurn: -14 } },
      { at: 3.1, pose: { ...reach2 }, ease: 'hold' },
      { at: 3.6, pose: {} },
    ],
  };
}
export const SQUIRREL3: Move3 = { name: 'The ranger and his squirrel', held: 'bow', build: RANGER_BODY, rest: ARCHER, motion: squirrel() };
export const SIGHTING3: Move3 = { name: 'The ranger sights along an arrow', held: 'bow', build: RANGER_BODY, rest: ARCHER, motion: sighting() };

// ---------------------------------------------------------------------------------------------
// The knight with the great sword

/** A great sword: its grip below the right hand, and its blade beyond the guard. */
export const GREAT_GRIP = 0.15 * BODY.tall;
export const GREAT_BLADE = 0.6 * BODY.tall;

/**
 * THE REAR STANCE. The owner, 6 Oct 2026, with a sheet of five two-handed stances: "This is how
 * I'd like the two handed sword to look in the characters hands"; "Rear stance is what I'm
 * referring to" (the picture is docs/ref/two_handed_stances_from_owner_2026-10-06.jpg). It is the
 * fencing masters' tail guard: the left foot and the left shoulder toward the enemy, both hands
 * low by the right hip, and the blade trailing behind with its point down near the floor, where
 * the enemy cannot judge its length. The face is on the enemy over the leading shoulder. Every
 * cut from here comes forward and up with the whole body turning into it.
 */
const REAR: Bones = {
  ...standing(KNIGHT_BODY),
  // (on a chest as broad as his the left arm cannot come across to a hilt held back at the hip
  // unless the shoulders turn to it: the chest is turned well round to the sword, and the hilt is
  // at the front of the hip, a hand's breadth out from it)
  px: 0, pz: -3.6, yaw: -40, pitch: 4, twist: -30, bend: 6,
  lfx: 10.5, lfy: 0.5, lft: 4, lk: 4,
  rfx: -9, rfy: -1.5, rft: -55, rk: -40, rfp: 0,
  rhIn: 2, rhx: -2.5, rhy: -11.5, rhz: 25,
  lhIn: 3, lhx: -5.2, lhy: 0, lhz: 0,
  wAz: -162, wEl: -40, wRoll: 0, le: 10, re: 6,
};

/** Standing in it: he breathes, and the point stirs. */
function rearStance(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 1.0, pose: { pz: -4.3, bend: 7.5, wEl: -38, rhz: 24.1 } },
      { at: 2.0, pose: {} },
    ],
    loop: 0,
  };
}

export const REAR3: Move3 = { name: 'Great sword: the rear stance', held: 'greatsword', build: KNIGHT_BODY, rest: REAR, motion: rearStance() };

/**
 * STRIKE with the great sword, from the rear stance: a rising cut.
 *
 * The stance is the wind-up: the hips are already turned away and the blade is already behind.
 * What was read up on (docs/NEXT_VERSION.md): a swing is built from the ground up, hips first,
 * then the trunk, then the arms, then the blade, each part later and faster than the one before;
 * a cut's step "lands just as the long-point is reached"; the body is upright or tilted forward
 * into the cut, never hunched; and the eyes stay on the enemy, so the chest turns under a head
 * that does not.
 *   the coil    he sinks onto the back leg and the point drops (two frames)
 *   the body    the front foot goes out and the hips drive forward and round; the chest is still
 *               turned away and the blade still behind: he is stretched like a bow
 *   the cut     the foot lands as the blade comes round his right side and up through whatever
 *               is in front of him, the back leg driving, its heel off the floor (the fifth
 *               frame, the rules' own)
 *   through     the blade runs on up to his left, the chest turning after it
 *   the hold    he stays low under it for a tenth of a second
 *   and back    the blade is let run on over and round behind him, into the stance again.
 * (It is how anyone swings a long thing in both hands from the right: a batter, a woodsman. The
 * front foot strides, the back foot turns on its ball, and the arms come last.)
 */
function strike(): Motion {
  const hilt = (x: number, y: number, z: number): Partial<Bones> => ({ rhIn: 0, rhx: x, rhy: y, rhz: z });
  // (struck: the front foot a stride further out and flat, the back foot turned on its ball with the heel up, that leg long behind him)
  const struck: Partial<Bones> = { px: 10.5, lfx: 19.5, lfy: 0.5, lfz: 0, lft: 2, lk: 2, rfx: -6.5, rfy: -1, rfz: 2.6, rfp: 36, rft: -8, rk: -6 };
  return {
    hit: 4 * FR,
    keys: [
      { at: 0, pose: {} },
      { at: 2 * FR, pose: { px: -1.5, pz: -5, yaw: -48, twist: -36, bend: 8, rhz: 23.5, wAz: -168, wEl: -47 }, ease: 'out' },
      // (his hips have gone round and his shoulders have not: the hilt is still at his hip, carried forward with it)
      { at: 3 * FR, pose: { px: 4.5, pz: -4.8, yaw: -12, pitch: 6, twist: -56, bend: 10, lfx: 16, lfz: 2.4, lfp: -14, lft: 2, rfp: 14, rfz: 0.9, rk: -22, rhIn: 2, rhx: 2.5, rhy: -11.5, rhz: 24.5, wAz: -124, wEl: -24 }, ease: 'in' },
      { at: 4 * FR, pose: { ...struck, pz: -5.6, yaw: 26, pitch: 9, twist: 12, bend: 11, faceUp: -4, ...hilt(15, 7.5, -5), wAz: 8, wEl: 12 }, ease: 'in' },
      { at: 5 * FR, pose: { ...struck, pz: -6.2, yaw: 30, pitch: 8, twist: 26, bend: 8, faceUp: -2, ...hilt(10.5, 11, 3.5), wAz: 50, wEl: 52 }, ease: 'out' },
      { at: 8 * FR, pose: { ...struck, pz: -5.7, yaw: 29, pitch: 7, twist: 22, bend: 7, ...hilt(9.5, 11.5, 4.5), wAz: 64, wEl: 58 }, ease: 'out' },
      // (the blade goes on round the same way, over and behind him: 198 is where the stance has it)
      { at: 13 * FR, pose: { wAz: 198 }, ease: 'io' },
    ],
  };
}

export const STRIKE3: Move3 = { name: 'Strike, great sword', held: 'greatsword', build: KNIGHT_BODY, rest: REAR, motion: strike(), at: 'the moment it lands' };

/**
 * STRIKE, THE SECOND SWING: A DOWNWARD SLASH (the owner, 7 Oct 2026, 23:18: "If the player taps
 * again quickly, then the second animation, [a] downward slash, plays"). From the rear stance the
 * hilt goes up over his right shoulder, the blade standing up behind him (as at the top of a slam,
 * lower and quicker); then he steps in and the blade comes OVER and down across the front of him,
 * through whatever is there at the height of a chest (the fourth frame, the rules' own, as the
 * strike's is), and on down to low on his left; he stays low under it a moment, and it is carried
 * round his right side, low, into the stance again (as the slam's is).
 */
function slash(): Motion {
  // (wAz -165: behind him and to his right; going OVER, past straight up, it comes down in front of him a little to his left)
  const top: Partial<Bones> = { pz: -2.5, yaw: -20, twist: -12, pitch: 0, bend: 0, faceUp: -8, rhIn: 0, rhx: 2, rhy: 2, rhz: 16, wAz: -165, wEl: 62 };
  // (struck: the front foot a stride further out, the back foot on its ball, as in the strike)
  const struck: Partial<Bones> = { px: 9, lfx: 18.5, lfy: 0.5, lfz: 0, lft: 2, lk: 2, rfx: -7, rfy: -1, rfz: 2.2, rfp: 30, rft: -8, rk: -6 };
  // (down: the blade has come over and across, 205 degrees up from pointing behind him is 25 below level in front, to his left)
  const low: Partial<Bones> = { ...struck, pz: -6.5, yaw: 18, pitch: 8, twist: 14, bend: 16, faceUp: -20, rhIn: 2, rhx: 17, rhy: 4, rhz: 22, wAz: -165, wEl: 205 };
  return {
    hit: 4 * FR,
    keys: [
      { at: 0, pose: {} },
      { at: 2 * FR, pose: top, ease: 'out' },
      { at: 3 * FR, pose: { ...top, ...struck, px: 4, lfx: 14, lfz: 2.5, pz: -3.5, rhx: 8, rhy: 3, rhz: 14, wEl: 110 }, ease: 'in' },
      // (the blow: the blade nearly level in front of him at the height of a chest, going down)
      { at: 4 * FR, pose: { ...struck, pz: -5, yaw: 10, pitch: 6, twist: 8, bend: 10, faceUp: -10, rhIn: 0, rhx: 14, rhy: 6, rhz: -2, wAz: -165, wEl: 168 }, ease: 'in' },
      { at: 6 * FR, pose: low, ease: 'out' },
      // (he stays low under it a moment; then it is carried round his right side, low, into the stance again)
      { at: 8 * FR, pose: { ...low, pz: -6.4, pitch: 8, bend: 14 }, ease: 'out', as: { wAz: 15, wEl: -25 } },
      // (round his right side, low: the hands out in front of him as it goes, the blade trailing)
      { at: 10 * FR, pose: { ...struck, px: 6, pz: -6, yaw: -15, pitch: 8, twist: -15, bend: 14, faceUp: -12, rhIn: 2, rhx: 13, rhy: 0, rhz: 22, wAz: -60, wEl: -35 }, ease: 'io' },
      { at: 13 * FR, pose: {}, ease: 'io' },
    ],
  };
}

export const SLASH3: Move3 = { name: 'Strike, the second swing: a downward slash', held: 'greatsword', build: KNIGHT_BODY, rest: REAR, motion: slash(), at: 'the moment it lands' };

/** A foot standing on its toes: the heel up by `deg`, the ball still on the floor (the ankle is that much higher). */
function onToes(deg: number): number {
  const a = (deg * Math.PI) / 180;
  return BODY.ball * Math.sin(a) + KNIGHT_BODY.ankle * Math.cos(a) - KNIGHT_BODY.ankle;
}

/**
 * SLAM with the great sword: everything he has, from overhead into the floor.
 *
 * It is how a maul is swung (docs/NEXT_VERSION.md): "Abruptly raise the maul overhead, extending
 * arms high, straightening back and knees, and rising up on toes"; then "Bend at the waist and
 * bend your knees to involve all of your body in the swing"; and "DO NOT allow your vision to
 * wander from the striking point". So at the top his back is arched and his chin is DOWN, eyes on
 * the spot; and coming down he folds at the waist and the knees, a stride forward, the blade
 * coming over to bury its point in the floor ahead of him. It lands on the eighth frame.
 */
function slam(): Motion {
  const up = onToes(28);
  const top: Partial<Bones> = { pz: 2.3, yaw: -8, twist: -2, pitch: -3, bend: -9, faceUp: -18, lfp: 28, lfz: up, rfp: 28, rfz: up, rhIn: 0, rhx: 1.5, rhy: 6.3, rhz: 18, wAz: 180, wEl: 64 };
  // (down: a stride ahead and deep, folded at the waist; the hands are where the buried point puts them)
  const low: Partial<Bones> = {
    px: 11, pz: -8.6, yaw: 6, pitch: 14, twist: 2, bend: 28, faceUp: -45,
    lfx: 21, lfy: 0.5, lfz: 0, lfp: 0, lft: 2, lk: 2, rfx: -9.5, rfy: -1, rfp: 38, rfz: onToes(38), rft: -10, rk: -4,
    // (the blade has come OVER: 214 degrees up from pointing behind him is 34 below level in front)
    rhIn: 2, rhx: 27, rhy: -1, rhz: 19.3, wAz: 180, wEl: 214,
  };
  return {
    hit: 7 * FR,
    keys: [
      { at: 0, pose: {} },
      // (the hilt comes up in front of his chest, a forearm's length out from it, on its way overhead)
      { at: 3 * FR, pose: { pz: -1.5, yaw: -24, twist: -8, bend: 2, rhIn: 0, rhx: 7.5, rhy: 3, rhz: -3, wAz: -176, wEl: 18 }, ease: 'out' },
      { at: 5 * FR, pose: top, ease: 'out' },
      // (he tips forward off his toes, the front foot already going out: the fall has begun)
      { at: 6 * FR, pose: { ...top, px: 3.5, pz: 1.5, pitch: 3, bend: -3, lfx: 14.5, lfz: 3.5, lfp: 6, rfp: 34, rfz: onToes(34), rhx: 3, wEl: 80 }, ease: 'lin' },
      { at: 7 * FR, pose: low, ease: 'in' },
      // (the weight of him goes on down a moment after the blade has stopped)
      { at: 9 * FR, pose: { ...low, pz: -10, bend: 30 }, ease: 'out' },
      // (and it is drawn out of the floor and ROUND HIS RIGHT SIDE, low, back into the stance. It
      // had gone up and over, the way it came: upright in front of his face on the way, and so
      // far round that his left hand could not stay on it.)
      { at: 12 * FR, pose: { ...low, pz: -8.2, pitch: 12, bend: 23, faceUp: -38 }, ease: 'out', as: { wAz: 0, wEl: -34 } },
      { at: 18 * FR, pose: {}, ease: 'io' },
    ],
  };
}

export const SLAM3: Move3 = { name: 'Slam, great sword', held: 'greatsword', build: KNIGHT_BODY, rest: REAR, motion: slam(), at: 'the moment it lands' };

/**
 * WHIRLWIND with the great sword, for as long as it is held: he goes round, and the blade with
 * him. The bones can do what the paintings could not: this IS a turn, all the way round, seen
 * from one place (until now the game showed a still figure in each of his four views by turns).
 * He sits into his knees and leans back from the blade against the pull of it, arms long, the
 * blade level; his head goes round ahead of his body, as a turning dancer's does, finding the
 * front again before the shoulders get there. Once round in eight frames.
 */
function whirl(): Motion {
  const keys: Key3[] = [];
  const N = 8;
  for (let i = 0; i <= N; i++) {
    const k = i / N;
    // (he begins where the Strike leaves the blade: in front of him, going to his left)
    const yaw = 20 + 360 * k;
    const blade = yaw + 14;
    const away = ((blade + 180) * Math.PI) / 180;
    const lean = 13;
    const foot = (off: number, out: number): [number, number] => {
      const a = ((yaw + off) * Math.PI) / 180;
      return [Math.cos(a) * out, Math.sin(a) * out];
    };
    const [lx, ly] = foot(55, 7.5);
    const [rx2, ry2] = foot(-125, 7.5);
    const dip = Math.cos(k * Math.PI * 4);
    keys.push({
      at: i * FR,
      ease: 'lin',
      pose: {
        px: -Math.cos(away) * -1.5, py: -Math.sin(away) * -1.5, pz: -6 + dip * 0.7,
        yaw, twist: 6, pitch: lean * Math.cos(away), roll: -lean * Math.sin(away), bend: 0,
        faceTurn: yaw + 34, faceUp: -3,
        lfx: lx, lfy: ly - KNIGHT_BODY.stance, lfz: 0.6, lfp: 14, lft: yaw + 50, lk: yaw + 40,
        rfx: rx2, rfy: ry2 + KNIGHT_BODY.stance, rfz: 0.6, rfp: 14, rft: yaw - 40, rk: yaw - 40,
        rhIn: 0, rhx: 16.5, rhy: 6.3, rhz: -3.5, wAz: blade, wEl: -3, le: 0, re: 0,
      },
    });
  }
  return { keys, loop: 0 };
}

export const WHIRL3: Move3 = { name: 'Whirlwind, great sword', held: 'greatsword', build: KNIGHT_BODY, rest: REAR, motion: whirl() };

/**
 * LEAP with the great sword, and coming down. The game carries him through the air; this is what
 * his body does in it. He is deep in his knees as it begins and drives up off both legs, long
 * from toes to fingertips; at the top his knees are drawn up under him and the sword is high
 * behind his head, his back arched and his eyes already on where he will land; coming down his
 * legs reach for the floor and the sword comes over. Then the landing (its own piece, played if
 * he is left standing where he lands): the knees take it, deep, the blade's point buried ahead of
 * him; a beat held there; and the blade is drawn out and round his right side into the stance.
 * `long`: how many seconds the game gives the leap (the keys of it are set by its share).
 */
function leap(long: number): Key3[] {
  const k = (share: number): number => share * long;
  return [
    { at: 0, pose: { px: 1, pz: -8.5, yaw: -30, pitch: 12, twist: -30, bend: 12, lfx: 6, rfx: -4, rft: -20, rk: -12, wEl: -52, rhz: 21.5 } },
    { at: k(0.14), pose: { px: 2, pz: 2.2, yaw: -10, pitch: 6, twist: -4, bend: -5, lfx: 2, lfz: 1.5, lfp: 46, rfx: -5, rfz: 2.5, rfp: 50, rft: -10, rk: -6, rhIn: 0, rhx: 3, rhy: 4, rhz: -3, wAz: 180, wEl: 4 }, ease: 'out' },
    { at: k(0.48), pose: { pz: 0, yaw: -4, pitch: 2, twist: 0, bend: -13, faceUp: -30, lfx: 7, lfz: 12, lfp: 20, lk: 8, rfx: -1, rfz: 15, rfp: 30, rft: -6, rk: -8, rhIn: 0, rhx: 0.5, rhy: 6.3, rhz: 17, wAz: 180, wEl: 42 }, ease: 'out' },
    { at: k(0.82), pose: { pz: 0.5, yaw: 2, pitch: 9, twist: 2, bend: 6, faceUp: -36, lfx: 10, lfz: 4, lfp: -8, lk: 4, rfx: -5, rfz: 6, rfp: 24, rft: -8, rk: -6, rhIn: 0, rhx: 7, rhy: 6.3, rhz: 13, wAz: 180, wEl: 122 }, ease: 'in' },
    { at: k(1), pose: { px: 4, pz: -4.5, yaw: 4, pitch: 12, twist: 2, bend: 18, faceUp: -40, lfx: 14, lfz: 0, lk: 3, rfx: -7, rfz: onToes(26), rfp: 26, rft: -10, rk: -5, rhIn: 0, rhx: 13, rhy: 6.3, rhz: -4, wAz: 180, wEl: 196 }, ease: 'lin' },
  ];
}
function land(from: Partial<Bones>): Key3[] {
  const low: Partial<Bones> = {
    px: 6, pz: -10.5, yaw: 6, pitch: 15, twist: 2, bend: 30, faceUp: -45,
    lfx: 14, lfz: 0, lk: 3, rfx: -7, rfz: onToes(40), rfp: 40, rft: -10, rk: -5,
    rhIn: 2, rhx: 22, rhy: -1, rhz: 17.5, wAz: 180, wEl: 210,
  };
  return [
    { at: 0, pose: from },
    { at: 1 * FR, pose: low, ease: 'lin' },
    { at: 3 * FR, pose: { ...low, pz: -11.6, bend: 33 }, ease: 'out' },
    // (and the blade comes out of the floor and round his right side, low, into the stance: as the Slam's does)
    { at: 6 * FR, pose: { ...low, pz: -9.6, bend: 26, pitch: 13, faceUp: -30 }, ease: 'out', as: { wAz: 0, wEl: -30 } },
    { at: 12 * FR, pose: {}, ease: 'io' },
  ];
}
/** (for a picture: the leap and its landing as one, the leap taking half a second) */
function leapAndLand(): Motion {
  const up = leap(0.5);
  const down = land(up[up.length - 1].pose);
  return { keys: [...up, ...down.slice(1).map((key) => ({ ...key, at: key.at + 0.5 }))], hit: 0.5 };
}

export const LEAP3: Move3 = { name: 'Leap, great sword', held: 'greatsword', build: KNIGHT_BODY, rest: REAR, motion: leapAndLand(), at: 'he lands', arc: { until: 0.5, high: 48 } };

/**
 * HOW THE KNIGHT RUNS with the great sword: driving forward under the weight of his mail, a
 * little side-on with both hands on the hilt at his right hip and the blade trailing behind him
 * (the rear stance, carried). His hips swing with his legs and his chest hardly turns against
 * them (his arms are not free to); the blade rides up and down behind him at every step; his
 * head stays level.
 */
const KNIGHT_GAIT: Gait = {
  reach: 9, push: 12, kick: 8.5, lean: 11, hunch: 5, sink: 2.4, bob: 1.5, hips: 9, counter: -0.55, yaw: -16, twist: -10,
  // (the hilt is carried before his right hip, where both his arms come to it across that chest)
  arms: (swing, step) => ({ rhIn: 0, rhx: 6.2 + swing * 1.2, rhy: 3.5, rhz: -12.1, lhIn: 3, lhx: -5.2, lhy: 0, lhz: 0, wAz: -160 + swing * 5, wEl: -31 + 5 * Math.cos(step * Math.PI * 2), le: 10, re: 6 }),
};
export const KNIGHT_RUN3: Move3 = { name: 'The knight runs, great sword', held: 'greatsword', build: KNIGHT_BODY, rest: REAR, motion: run(KNIGHT_GAIT) };

/**
 * STRUCK HARD: a blow that rocks him. From in front: the chest goes back first and the head
 * after it, late (a head is heavy and a neck is not stiff), a foot goes back to catch him, and he
 * comes forward into his stance again. From behind: thrown forward over his front foot, the head
 * left behind for a moment and then nodding down, and back. A quarter of a second.
 */
function reel(from: Bones): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 2 * FR, pose: { px: from.px - 3.5, pz: from.pz - 1, pitch: from.pitch - 7, bend: from.bend - 16, faceUp: -10, rfx: from.rfx - 4, rfz: 1.2, rfp: 12 }, ease: 'out' },
      { at: 4 * FR, pose: { px: from.px - 4.2, pz: from.pz - 2.2, pitch: from.pitch - 4, bend: from.bend - 8, faceUp: 14, rfx: from.rfx - 5 }, ease: 'io' },
      { at: 7 * FR, pose: {}, ease: 'io' },
    ],
  };
}
function lurch(from: Bones): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      // (a hand that is kept somewhere on the floor's own measure, a hilt at the hip, goes forward with him)
      { at: 2 * FR, pose: { px: from.px + 4, pz: from.pz - 1.5, pitch: from.pitch + 9, bend: from.bend + 16, faceUp: 14, lfx: from.lfx + 3, lfz: 1.5, ...(from.rhIn === 2 ? { rhx: from.rhx + 5 } : {}) }, ease: 'out' },
      { at: 4 * FR, pose: { px: from.px + 5, pz: from.pz - 3, pitch: from.pitch + 6, bend: from.bend + 10, faceUp: -16, lfx: from.lfx + 5.5, ...(from.rhIn === 2 ? { rhx: from.rhx + 6 } : {}) }, ease: 'io' },
      { at: 7 * FR, pose: {}, ease: 'io' },
    ],
  };
}
export const KNIGHT_REEL3: Move3 = { name: 'The knight is struck hard', held: 'greatsword', build: KNIGHT_BODY, rest: REAR, motion: reel(REAR) };
export const KNIGHT_LURCH3: Move3 = { name: 'The knight is struck from behind', held: 'greatsword', build: KNIGHT_BODY, rest: REAR, motion: lurch(REAR) };

/**
 * THE KNIGHT'S FALL, when his life runs out (the owner, 6 Oct 2026: heroes are to be "Proud and
 * daring"; "I want things to have weight"). The blow throws him back and he gives ground, two
 * steps, to keep his feet. The sword comes round and is set point down on the floor before him:
 * he holds himself up on it, both hands on the hilt, his head still up. Then his knees go, slowly
 * and then all at once, and he comes down hard on one of them, the weight of him pressing him
 * lower for a moment; his head drops; and the light goes out of the blade. He is left kneeling
 * behind his sword: he does not lie down.
 */
function knightFall(): Motion {
  // (the sword stood point down a pace in front of him: the hands where that puts them)
  const planted: Partial<Bones> = { rhIn: 2, rhx: 4.5, rhy: -1, rhz: GREAT_BLADE + 1.2, lhIn: 3, lhx: -5.2, lhy: 0, lhz: 0, wAz: 0, wEl: -90, wRoll: 0 };
  const stood: Partial<Bones> = { px: -7, pz: -1.5, yaw: -8, pitch: 6, twist: 0, bend: 8, lfx: -1, lfy: 1, lft: 8, lk: 6, rfx: -11, rfy: 0, rft: -24, rk: -14, ...planted };
  const down: Partial<Bones> = {
    px: -7.5, pz: -15.2, yaw: -6, pitch: 5, twist: 0, bend: 14,
    lfx: 3.5, lfy: 1, lfz: 0, lft: 6, lk: 6, rfx: -19.5, rfy: 0.5, rfz: 3.3, rfp: 40, rft: -6, rk: -4,
    // (the sword still stands on its point: his hands are where they were on it, which is now before his face)
    rhIn: 2, rhx: 4.5, rhy: -1, rhz: GREAT_BLADE + 1.2, lhIn: 3, lhx: -5.2, lhy: 0, lhz: 0, wAz: 0, wEl: -90,
  };
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 2 * FR, pose: { px: -3.5, pz: -3.5, pitch: -6, bend: -14, faceUp: -8, rfx: -13, rfz: 1.2, rfp: 12 }, ease: 'out' },
      { at: 8 * FR, pose: { px: -6, pz: -2.5, yaw: -24, pitch: -2, twist: -6, bend: -2, faceUp: 10, lfx: 1, lfz: 1.5, rfx: -12, rhIn: 0, rhx: 2, rhy: 3, rhz: -12, wAz: -90, wEl: -60 }, ease: 'io' },
      { at: 14 * FR, pose: { ...stood, faceUp: 4 }, ease: 'io' },
      { at: 21 * FR, pose: { ...stood, pz: -3.2, bend: 11, faceUp: 0, faceTurn: -12, out: 0.2 }, ease: 'io' },
      // (his knees go: slowly, and then all at once; and the weight of him landing presses him lower still for a moment)
      // HIS HEAD COMES DOWN BEHIND HIS HANDS, NOT INTO THEM (7 Oct 2026: the owner, of the helm with
      // a visor he had just chosen, "be sure to run the clipping tests for new models"; the test,
      // tools/audit_worn3.ts, found the helm and its visor 5 deep in his own hands at the end of
      // this, and the picture showed a kneeling man with no head). He is drawn back a little from
      // the sword as his knees go, his arms out to it, and his head hangs between them, turned a
      // little aside: it bows less far than it did (26 degrees where it was 48).
      { at: 27 * FR, pose: { ...down, px: -13, pz: -16.4, bend: 14, faceUp: -2, faceTurn: -28, out: 0.45 }, ease: 'in' },
      { at: 29 * FR, pose: { ...down, px: -13.5, pz: -16.8, bend: 17, faceUp: -6, faceTurn: -28, out: 0.5 }, ease: 'lin' },
      { at: 33 * FR, pose: { ...down, px: -13.5, bend: 13, faceUp: -14, faceTurn: -26, out: 0.6 }, ease: 'out' },
      { at: 46 * FR, pose: { ...down, px: -13.5, bend: 16, faceUp: -24, faceTurn: -24, out: 1 }, ease: 'io' },
    ],
  };
}
export const KNIGHT_FALL3: Move3 = { name: "The knight's fall", held: 'greatsword', build: KNIGHT_BODY, rest: REAR, motion: knightFall() };

// ---------------------------------------------------------------------------------------------
// The mage

/** A mage's staff: how far its crystal is above the hand that carries it, and its foot below. */
export const STAFF_UP = 0.6 * BODY.tall;
export const STAFF_DOWN = 0.54 * BODY.tall;

/**
 * Standing: tall and easy, the staff stood upright on the floor beside the right foot, the hand
 * on it at the height of the chest. (Straight up is written as 90 degrees above "behind": then a
 * staff that is swung over forward and one that is lifted back have the same way to come home.)
 */
const MAGE: Bones = {
  ...standing(MAGE_BODY),
  // (her weight on her left leg and that hip out, the right foot a little forward and turned out)
  pz: -0.4, py: 0.7, yaw: -10, roll: -3, twist: -4, side: 4, bend: -2,
  lfx: -0.8, lft: 6, lk: 4, rfx: 2.6, rfy: -0.6, rft: -24, rk: -16,
  // (the staff stands well out to her right, where it is clear of her whichever way she is seen;
  // her left hand rests on the satchel at her hip, the elbow out; her chin is up)
  rhIn: 2, rhx: -0.6, rhy: -12.6, rhz: STAFF_DOWN, wAz: 180, wEl: 90, re: 10,
  lhIn: 0, lhx: 1.6, lhy: 2.6, lhz: -14.6, le: -26,
  faceTurn: -10, faceUp: 4,
};
/**
 * A pose part of the way from one key's to the next, as the move itself would have it there: for
 * a key put in between the two that takes a hand round by another way (an arc, not a straight
 * line through a shoulder).
 */
function partWay(rest: Bones, a: Partial<Bones>, b: Partial<Bones>, k: number): Bones {
  const { from: _from, to: _to, mixK: _mixK, lh2: _lh2, rh2: _rh2, ...mixed } = bonesAt([{ at: 0, pose: a }, { at: 1, pose: b, ease: 'lin' }], rest, k);
  return mixed;
}

/** The other hand on the staff, a forearm's length below the one that carries it. */
const BOTH: Partial<Bones> = { lhIn: 3, lhx: -8, lhy: 0, lhz: 0, le: 0 };

/**
 * WAVE, the staff's quick attack: the rules call it a swing ("Swing the staff: a wide wave of
 * force"), and it is swung with the whole body. The staff goes up and back at her right as she
 * coils onto the back foot, her other hand out ahead of her; then the weight goes forward and
 * the hips round, the chest after them, and the staff comes OVER and down through the air in
 * front (the wave leaves on the sixth frame, the rules' own); it is held low for a moment; and it
 * is stood upright again. The eyes are on where the wave is going from first to last.
 */
function wave(): Motion {
  // SHE IS SEEN ALL THROUGH IT, as in the Orb (the owner, 6 Oct 2026, 21:04, of a film of this:
  // "very obscured by the hat and the robe"). It was swung with both hands from over her
  // shoulder, bent double into a long lunge: both sleeves were across her face as she wound up,
  // and as it landed she was a mound of coat with a hat on it. Now it is swung with ONE hand,
  // at her right side: up and back, over, and down in front of her; her other hand goes out
  // ahead of her as she winds up and is thrown back as the staff comes over; she stays on her
  // feet, upright, a short step forward, her head up and her eyes on where the wave is going.
  const hands = (x: number, y: number, z: number, lx: number, ly: number, lz: number, le = -8): Partial<Bones> => ({ rhIn: 0, rhx: x, rhy: y, rhz: z, lhIn: 0, lhx: lx, lhy: ly, lhz: lz, le });
  const fwd: Partial<Bones> = { px: 3, lfx: 7, lfy: 0.5, lft: 2, lk: 2, rfx: -4, rfp: 22, rfz: onToes(22), rft: -12, rk: -8 };
  const back: Partial<Bones> = { px: -2.2, pz: -1.8, yaw: -32, twist: -22, bend: -4, lfz: 0.8, ...hands(-3.5, -6, 7, 9, 1.5, -2), wAz: 168, wEl: 38, draw: 1.8 };
  const down: Partial<Bones> = { ...fwd, pz: -2.6, yaw: 12, pitch: 3, twist: 14, bend: 8, faceUp: 0, ...hands(11, -5, -7, -3, 7, -9, -30), wAz: 172, wEl: 170, draw: 2.2 };
  const held: Partial<Bones> = { ...fwd, pz: -2.8, yaw: 14, pitch: 3, twist: 17, bend: 9, faceUp: 0, ...hands(10.5, -5, -9.5, -3, 7.5, -10, -30), wAz: 172, wEl: 188, draw: 1.2 };
  return {
    hit: 5 * FR,
    keys: [
      { at: 0, pose: {} },
      // (`draw`, for a mage: how hot the crystal burns, 0 at rest, 1 gathering, 2 let go)
      { at: 2 * FR, pose: { px: -1.4, pz: -1.2, yaw: -24, twist: -14, bend: -3, ...hands(-1, -5.5, 5.5, 8, 2, -3.5), wAz: 170, wEl: 56, draw: 1.2 }, ease: 'out' },
      { at: 4 * FR, pose: back, ease: 'out' },
      // (THE STAFF COMES OVER: her hand goes up and round in an arc, as a swing's does)
      { at: 4.5 * FR, pose: { ...partWay(MAGE, back, down, 0.25), ...hands(3, -6.5, 9, 6, 4, -5) }, ease: 'in' },
      { at: 5 * FR, pose: down, ease: 'lin' },
      { at: 6 * FR, pose: { ...down, pz: -3.2, yaw: 15, twist: 19, bend: 10, ...hands(11, -5, -10, -3.5, 7.5, -10, -30), wEl: 192, draw: 2 }, ease: 'lin' },
      { at: 9 * FR, pose: held, ease: 'out' },
      // (she straightens, and the staff is stood upright beside her again)
      { at: 12 * FR, pose: { ...partWay(MAGE, held, {}, 0.5), ...hands(6, -6, -10, 3, 4.5, -12.5, -20) }, ease: 'in' },
      { at: 15 * FR, pose: {}, ease: 'out' },
    ],
  };
}
export const WAVE3: Move3 = { name: 'Wave', held: 'staff', build: MAGE_BODY, rest: MAGE, motion: wave(), at: 'the moment the wave goes' };

/**
 * ORB, the staff's slow attack. The owner: "Slam the staff down on the ground and a little pulse
 * aura goes out around the character then the orb appears where you tapped". The staff goes
 * straight up at her right as she rises onto her toes, her free hand going up and out the other
 * side; a beat at the top; and it is driven onto the floor, her knees giving and her free hand
 * thrust down at the spot (the ninth frame, the rules' own). That is held, and she rises.
 */
function orb(): Motion {
  const up = onToes(24);
  // SHE IS SEEN ALL THROUGH IT (the owner, 6 Oct 2026, 21:04: "the orb animation for the mage is
  // very obscured by the hat and the robe"). The staff is lifted and driven down AT HER RIGHT,
  // where it stands (far enough out that it is beside her face from either side she is seen
  // from), not up the middle of her where it and both sleeves were across her face; her head
  // stays up (her eyes go down to the spot, her hat does not tip over her); and she sinks at the
  // knees a little as it lands, she does not fold into a crouch that the coat makes a mound of.
  // IT IS DONE WITH ONE HAND. Her left arm cannot reach a staff that far out to her right (the
  // body brought it back in front of her to let both hands hold it): it goes out to her left
  // at the height of her shoulder as the staff rises (below her brim, where it is seen), open-
  // handed, and thrusts down at the floor ahead as the staff lands.
  const lift: Partial<Bones> = { pz: -0.4, yaw: -8, twist: -4, faceUp: 0, rhIn: 0, rhx: 3, rhy: -6, rhz: -1, wAz: 180, wEl: 92, lhIn: 0, lhx: 3, lhy: 4.5, lhz: -8, le: -20 };
  const top: Partial<Bones> = {
    pz: 1.9, yaw: -10, twist: -6, pitch: -2, bend: -5, faceUp: -2, lfp: 24, lfz: up, rfp: 24, rfz: up,
    rhIn: 0, rhx: 2.5, rhy: -6.5, rhz: 9.5, wAz: 180, wEl: 94, lhIn: 0, lhx: 4.5, lhy: 11, lhz: 1.5, le: 10,
  };
  const low: Partial<Bones> = {
    px: 1.5, pz: -3.6, yaw: -10, twist: -8, pitch: 4, bend: 9, faceUp: -3,
    lfx: 4.5, lfy: 1.5, lft: 12, lk: 12, rfx: -3, rfy: -1.5, rft: -26, rk: -22,
    rhIn: 2, rhx: 4.5, rhy: -15.5, rhz: STAFF_DOWN, wAz: 180, wEl: 90, lhIn: 0, lhx: 7.5, lhy: 3.5, lhz: -9, le: -12,
  };
  return {
    hit: 8 * FR,
    keys: [
      { at: 0, pose: {} },
      // (the crystal gathers as it rises; prop 5 is the ring of light that runs out along the floor from where it strikes, `pt` 1 as it lands)
      { at: 3 * FR, pose: { ...lift, draw: 1 }, ease: 'out' },
      { at: 6 * FR, pose: { ...top, draw: 1.8 }, ease: 'out' },
      { at: 7 * FR, pose: { ...top, rhz: 10.2, lhz: 2.4, bend: -6, draw: 2 }, ease: 'lin' },
      { at: 8 * FR, pose: { ...low, prop: 5, pt: 1, draw: 2.4 }, ease: 'in' },
      { at: 10 * FR, pose: { ...low, pz: -4.6, bend: 11, lhz: -10, prop: 5, pt: 0.35, draw: 2 }, ease: 'out' },
      { at: 13 * FR, pose: { ...low, pz: -3, bend: 7, faceUp: -1, lhx: 6, lhz: -10.5, draw: 1.2 }, ease: 'out' },
      { at: 20 * FR, pose: {}, ease: 'io' },
    ],
  };
}
export const ORB3: Move3 = { name: 'Orb', held: 'staff', build: MAGE_BODY, rest: MAGE, motion: orb(), at: 'the moment it lands' };

/**
 * BEAM, held. The owner: "the mage fires his beam and it blows his cloak back". The staff is
 * levelled, both hands on it, the back hand at the hip and the front hand well forward; the blast
 * arrives and drives the mage back a step; and then the mage stands BRACED against it for as long
 * as it burns, as anyone stands who holds something that pushes back (a hose, a pole in a
 * current): a wide stance, the front knee bent and the back leg long, the whole body leaning into
 * it, chin down and eyes along the staff. It shakes in the hands. Let go, the push is gone and
 * the mage comes forward off the lean before standing up.
 */
const BRACED: Partial<Bones> = {
  px: -2.5, pz: -4.6, yaw: -30, pitch: 12, twist: -8, bend: 8, faceUp: -3,
  lfx: 8.5, lfy: 0.5, lft: 0, lk: 2, rfx: -11.5, rfy: -1, rft: -50, rk: -36,
  rhIn: 0, rhx: 2, rhy: 0.5, rhz: -15, lhIn: 3, lhx: 11.5, lhy: 0, lhz: 0, wAz: 180, wEl: 180, gale: 1, draw: 2,
};
function beam(): Motion {
  return {
    loop: 4 * FR,
    keys: [
      { at: 0, pose: { ...BRACED, px: 3, pz: -3.4, pitch: 9, gale: 0.3 } },
      { at: 2 * FR, pose: { ...BRACED, px: -3.6, pz: -3.6, pitch: 3, bend: 2, gale: 1.25 }, ease: 'out' },
      { at: 4 * FR, pose: { ...BRACED }, ease: 'io' },
      { at: 7 * FR, pose: { ...BRACED, pitch: 13.5, rhz: -15.7, wEl: 181.5, gale: 1.15 }, ease: 'lin' },
      { at: 10 * FR, pose: { ...BRACED }, ease: 'lin' },
      { at: 13 * FR, pose: { ...BRACED, pz: -5.4, rhz: -14.4, wEl: 178.6, gale: 0.9 }, ease: 'lin' },
      { at: 16 * FR, pose: { ...BRACED }, ease: 'lin' },
    ],
  };
}
function beamLetGo(): Motion {
  return {
    keys: [
      { at: 0, pose: { ...BRACED } },
      { at: 2 * FR, pose: { ...BRACED, px: 0.5, pz: -4, pitch: 15, bend: 11, gale: 0.15 }, ease: 'out' },
      { at: 4 * FR, pose: { px: 0.5, pz: -1.5, yaw: -16, pitch: 4, bend: 2, rhIn: 0, rhx: 4, rhy: 1, rhz: -10, wAz: 180, wEl: 120 }, ease: 'io' },
      { at: 7 * FR, pose: {}, ease: 'io' },
    ],
  };
}
export const BEAM3: Move3 = { name: 'Beam, held', held: 'staff', build: MAGE_BODY, rest: MAGE, motion: beam() };
export const BEAM_END3: Move3 = { name: 'Beam, let go', held: 'staff', build: MAGE_BODY, rest: MAGE, motion: beamLetGo() };

/**
 * HOW THE MAGE RUNS: hardly a run. Short quick steps, upright, the staff carried a little forward
 * of upright in the right hand, the other arm going with the stride, the head quite still.
 */
const MAGE_GAIT: Gait = {
  reach: 7.5, push: 9.5, kick: 6, lean: 5, hunch: 2, sink: 1.6, bob: 0.9, hips: 6, counter: 0.5, yaw: -4, twist: 0,
  arms: (swing, step) => {
    const p = pump(swing, 0.6);
    // (the staff is out to her right, clear of her face whichever way she is seen, not in front of
    // her; nearly upright, its foot a little out from her, so that it does not go into her coat)
    return { lhIn: 0, lhx: p.lhx, lhy: p.lhy, lhz: p.lhz, rhIn: 0, rhx: 2.5, rhy: -8.5, rhz: -8 + 0.7 * Math.cos(step * Math.PI * 2), re: -20, wAz: 194, wEl: 98 + swing * 3, gale: 0.32 };
  },
};
export const MAGE_RUN3: Move3 = { name: 'The mage runs', held: 'staff', build: MAGE_BODY, rest: MAGE, motion: run(MAGE_GAIT) };
export const MAGE_REEL3: Move3 = { name: 'The mage is struck hard', held: 'staff', build: MAGE_BODY, rest: MAGE, motion: reel(MAGE) };
export const MAGE_LURCH3: Move3 = { name: 'The mage is struck from behind', held: 'staff', build: MAGE_BODY, rest: MAGE, motion: lurch(MAGE) };

/**
 * THE MAGE'S FALL. The blow throws them back; a step back to keep their feet; the other hand
 * goes to the staff, which stands upright where they stand and is all that holds them up; and
 * they slide down it to their knees, slowly and then all at once. The head goes down against the
 * staff, and the light goes out of the crystal. They are left on their knees, holding on to a
 * dead staff.
 */
function mageFall(): Motion {
  // (the staff stands a pace in front of them, clear of the brim of a hat: it was at their toes, and through the hat)
  const staff: Partial<Bones> = { rhIn: 2, rhx: 6.5, rhy: -1.5, rhz: STAFF_DOWN + 6, lhIn: 3, lhx: -7, lhy: 0, lhz: 0, wAz: 180, wEl: 90 };
  const stood: Partial<Bones> = { px: -6.5, pz: -1.5, yaw: -4, twist: 0, pitch: 5, bend: 8, lfx: -2.5, rfx: -9.5, rft: -12, rk: -8, ...staff };
  const knees: Partial<Bones> = {
    px: -6.5, pz: -15.6, yaw: -4, twist: 0, pitch: 4, bend: 12,
    lfx: -19, lfy: -0.5, lfz: 3.3, lfp: 40, lft: 3, lk: 3, rfx: -19.5, rfy: 0.5, rfz: 3.3, rfp: 40, rft: -3, rk: -3,
    ...staff, rhz: STAFF_DOWN - 6,
  };
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 2 * FR, pose: { px: -3.5, pz: -2.5, pitch: -6, bend: -14, faceUp: -8, rfx: -5.5, rfz: 1.2, rfp: 12, rhIn: 0, rhx: 5, rhy: -1, rhz: -9, wEl: 100 }, ease: 'out' },
      { at: 8 * FR, pose: { px: -5.5, pz: -2, pitch: -2, bend: -3, faceUp: 10, lfx: -1.5, lfz: 1.2, rfx: -8.5, rhIn: 0, rhx: 6, rhy: 2, rhz: -8, wEl: 94 }, ease: 'io' },
      { at: 14 * FR, pose: { ...stood, faceUp: 4 }, ease: 'io' },
      { at: 21 * FR, pose: { ...stood, pz: -3.4, bend: 11, rhz: STAFF_DOWN + 4, out: 0.2 }, ease: 'io' },
      // (down the staff to their knees: slowly, and then all at once)
      // THE STAFF STANDS IN FRONT OF HER HAT, NOT THROUGH IT (7 Oct 2026: tools/audit_worn3.ts found
      // the staff 4 deep in the point of her hat and 2 in its brim as her head went down against
      // it). She is on her knees a little further back from it, holding it at arm's length, and
      // her head hangs between her arms: the brim of her hat is short of the staff.
      { at: 28 * FR, pose: { ...knees, px: -7.5, pz: -16.6, bend: 15, faceUp: -10, out: 0.45 }, ease: 'in' },
      { at: 32 * FR, pose: { ...knees, px: -9.5, bend: 12, faceUp: -18, out: 0.6 }, ease: 'out' },
      { at: 46 * FR, pose: { ...knees, px: -12, pitch: 5, bend: 13, faceUp: -28, rhz: STAFF_DOWN - 9, out: 1 }, ease: 'io' },
    ],
  };
}
export const MAGE_FALL3: Move3 = { name: "The mage's fall", held: 'staff', build: MAGE_BODY, rest: MAGE, motion: mageFall() };

/**
 * LEFT STANDING, the mage has two things they do. A snap of the fingers, and a mage light pops
 * on over the open hand: the mage watches it turn, and snaps it out (`prop` 1; `pt` is how long
 * it has burned). Or a small book comes out of the satchel: a page is read, head down over it, a
 * page is turned, and it is put away (`prop` 2; `pt` is how far through the reading).
 */
function mageLight(): Motion {
  const held: Partial<Bones> = { lhIn: 0, lhx: 9.5, lhy: 3.5, lhz: -5, le: 24, prop: 1, faceTurn: 26, faceUp: -18, twist: MAGE.twist + 6 };
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.4, pose: { ...held } },
      { at: 1.6, pose: { ...held, pt: 0.45, faceUp: -10, lhz: -3.5 }, ease: 'io' },
      { at: 3.1, pose: { ...held, pt: 1 }, ease: 'io' },
      { at: 3.6, pose: {} },
    ],
  };
}
function reading(): Motion {
  // (the book is held up to her, her head only a little bowed: bowed over it, her wide hat hid all of her)
  const read: Partial<Bones> = { lhIn: 0, lhx: 8.5, lhy: 5.5, lhz: -1.5, le: 30, prop: 2, faceTurn: 14, faceUp: -14, bend: MAGE.bend + 3 };
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.2, pose: { prop: 2, lhIn: 0, lhx: 2, lhy: 3, lhz: -17, faceTurn: 30, faceUp: -14 }, ease: 'hold' },
      { at: 0.65, pose: { ...read } },
      { at: 0.8, pose: { ...read, pt: 0.12 } },
      { at: 2.75, pose: { ...read, pt: 0.88, faceTurn: 8 }, ease: 'lin' },
      { at: 2.9, pose: { ...read, pt: 1, faceUp: -12 } },
      { at: 3.4, pose: { prop: 2, pt: 1, lhIn: 0, lhx: 2, lhy: 3, lhz: -17, faceTurn: 30, faceUp: -14 } },
      { at: 3.6, pose: {}, ease: 'hold' },
    ],
  };
}
export const MAGE_LIGHT3: Move3 = { name: 'The mage and a mage light', held: 'staff', build: MAGE_BODY, rest: MAGE, motion: mageLight() };
export const READING3: Move3 = { name: 'The mage reads', held: 'staff', build: MAGE_BODY, rest: MAGE, motion: reading() };

/** Standing: they breathe. Twelve tenths of a second round, as the game's standing loop is. */
function breathing(from: Bones, more: Partial<Bones> = {}): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.6, pose: { pz: from.pz - 0.5, bend: from.bend + 1.5, ...more } },
      { at: 1.2, pose: {} },
    ],
    loop: 0,
  };
}
export const MAGE_STAND3: Move3 = { name: 'The mage, standing', held: 'staff', build: MAGE_BODY, rest: MAGE, motion: breathing(MAGE) };
export const RANGER_STAND3: Move3 = { name: 'The ranger, standing', held: 'bow', build: RANGER_BODY, rest: ARCHER, motion: breathing(ARCHER, { lhz: ARCHER.lhz - 0.4 }) };

// ---------------------------------------------------------------------------------------------
// IN TOWN: THEIR WEAPONS ON THEIR BACKS
//
// The owner, 6 Oct 2026, 21:33: "id like a town sprite for everyone where their weapons are on
// their backs?  this would also go in the class selection screen"; "except maybe the mage as
// her using he staff as a walking stick kinda works both ways". So the knight and the ranger
// have a second way of standing and of running, with empty hands (`stow`: carried.ts says where
// the sword and the bow are then); the mage is as she is everywhere, her staff in her hand.

/**
 * THE KNIGHT IN TOWN: square to whoever he is talking to, at his ease and still the biggest man
 * in the street. His feet are apart, his weight a little more on his left; his arms hang heavy,
 * a little out from him as the arms of a man that broad do, his hands loosely closed; his head
 * is up. The great sword is on his back, its hilt over his right shoulder.
 */
const KNIGHT_TOWN: Bones = {
  ...standing(KNIGHT_BODY),
  stow: 1,
  pz: -0.5, py: 0.6, yaw: -10, roll: -1.5, twist: -4, side: 2, bend: -1,
  lfx: 1.4, lfy: 1.4, lft: 12, lk: 10,
  rfx: -1.0, rfy: -1.8, rft: -20, rk: -16,
  rhIn: 0, rhx: 9.6, rhy: 12.5, rhz: -10.5, re: 0,
  lhIn: 0, lhx: 11.4, lhy: -11.5, lhz: -8.6, le: 0,
  faceTurn: -4, faceUp: 3,
};
export const KNIGHT_TOWN3: Move3 = { name: 'The knight in town', held: 'greatsword', build: KNIGHT_BODY, rest: KNIGHT_TOWN, motion: breathing(KNIGHT_TOWN) };

/**
 * THE RANGER IN TOWN: as he stands anywhere (ARCHER: his weight on one leg, a long S from his
 * head to his standing foot, the back of his right hand on his hip), with his bow across his
 * back and the hand that carried it hanging loose at his side.
 */
const RANGER_TOWN: Bones = {
  ...ARCHER,
  stow: 1,
  lhIn: 0, lhx: 2.2, lhy: 1.8, lhz: HANG + 1.4, le: -6, wAz: 0, wEl: 0, wRoll: 0,
};
export const RANGER_TOWN3: Move3 = { name: 'The ranger in town', held: 'bow', build: RANGER_BODY, rest: RANGER_TOWN, motion: breathing(RANGER_TOWN) };

/**
 * AN ARM WITH NOTHING IN ITS HAND, AS IT GOES WHEN ITS OWNER RUNS: it hangs loose and swings low
 * under its shoulder, nearly straight when it is back and bending a little as it comes forward.
 * Where the hand is for `k` (0 = furthest back, 1 = furthest forward): forward of the shoulder,
 * and above it (so, below), on the FIGURE's own lines (hand space 1). `lift` is how much it rises
 * as it comes forward, as a share of the arm's length. (Bent square and pumping, as a sprinter's
 * is, an arm seen from where the game looks has its elbow standing out behind like a wing: the
 * owner, 6 Oct 2026, 21:35, of the ranger's run, "the left arm is a little wonky again".)
 */
function loose(b: Build, k: number, lift = 0.23): readonly [number, number] {
  const L = b.upperArm + b.foreArm;
  return [L * (-0.19 + 0.54 * k), L * (-0.95 + lift * k)];
}
/** Both arms going so, each forward as the other leg is. `out` is how far out from under the shoulder each hand is carried. */
function looseArms(b: Build, swing: number, out: number, lift = 0.23): Partial<Bones> {
  const r = loose(b, (1 + swing) / 2, lift);
  const l = loose(b, (1 - swing) / 2, lift);
  return { rhIn: 1, rhx: r[0], rhy: -out, rhz: r[1], re: 0, lhIn: 1, lhx: l[0], lhy: out, lhz: l[1], le: 0 };
}

/**
 * HOW THE KNIGHT RUNS IN TOWN: square to the way he goes (he has no sword at his hip to run
 * side-on round), upright, heavy, his arms swinging loose and his chest turning against his
 * hips as a man's does whose hands are empty. The sword rides on his back.
 */
const KNIGHT_TOWN_GAIT: Gait = {
  reach: 9, push: 12, kick: 8, lean: 9, hunch: 4, sink: 2.2, bob: 1.5, hips: 8, counter: 0.6, yaw: 0, twist: 0,
  arms: (swing) => looseArms(KNIGHT_BODY, swing, 1.8),
};
export const KNIGHT_TOWN_RUN3: Move3 = { name: 'The knight runs in town', held: 'greatsword', build: KNIGHT_BODY, rest: KNIGHT_TOWN, motion: ready(run(KNIGHT_TOWN_GAIT), { py: 0, stow: 1 }) };

/** HOW THE RANGER RUNS IN TOWN: upright and light (he is not hunting anything here), both arms swinging loose, the bow on his back. */
const RANGER_TOWN_GAIT: Gait = {
  reach: 11, push: 14.5, kick: 10.5, lean: 13, hunch: 5, sink: 3, bob: 1.2, hips: 10, counter: 0.85, yaw: 0, twist: 0,
  arms: (swing) => looseArms(RANGER_BODY, swing, 0.5, 0.3),
};
export const RANGER_TOWN_RUN3: Move3 = { name: 'The ranger runs in town', held: 'bow', build: RANGER_BODY, rest: RANGER_TOWN, motion: ready(run(RANGER_TOWN_GAIT), { ...READY, stow: 1 }) };

// ---------------------------------------------------------------------------------------------
// THEY DRAW THEIR WEAPONS (the owner, 6 Oct 2026, 21:34: "then you can add as another idle
// animation them drawing their weapons and getting into their battle stance"). A thing each does
// when left standing in town: the weapon comes off the back, they stand a while as they stand
// in a fight, and it is put away again.

/**
 * THE KNIGHT DRAWS: he unfolds his arms, his right hand goes up over its shoulder to the hilt,
 * and the great sword comes off his back: its point swings out behind him and UP as the hilt
 * comes forward over his shoulder, until the blade stands over him with both his hands on the
 * hilt at his right shoulder (the high guard: the one moment the whole blade is seen from in
 * front). From there it falls back behind him as he sinks into his own guard, the hilt down at
 * his right hip and the blade trailing: the rear stance (REAR). He stands in it and breathes;
 * then it goes back the way it came, and he folds his arms.
 */
function knightDraws(): Motion {
  const T = KNIGHT_TOWN;
  // (his chest turns a little to the right as that hand goes back over the shoulder)
  const turned = { yaw: -14, pitch: 2, roll: 0, twist: -11, bend: 2, side: -3 };
  const hanging: Partial<Bones> = { lhIn: 0, lhx: 3, lhy: 3, lhz: -20.5, le: -8 };
  const face: Partial<Bones> = { faceTurn: 0, faceUp: 2 };
  const reach: Partial<Bones> = { ...turned, ...face, pz: -1, ...hanging, lhx: 6, lhz: -17, rhIn: 0, rhx: 6.5, rhy: -1, rhz: 0.5, re: -30 };
  // (the hand on the hilt where it lies on his back; an elbow up and forward and out, as an arm goes over a shoulder)
  const taken: Partial<Bones> = { ...turned, ...face, pz: -1.4, ...hanging, ...holdOnBack(KNIGHT_BODY, 'sword', false, { ...T, ...turned }) };
  taken.re = elbowFor(KNIGHT_BODY, { ...T, ...taken }, false, [0.45, -0.5, 0.75]);
  // (lifted off: the hilt above and in front of the shoulder, the blade hanging behind it, its point already going back)
  const lifted: Partial<Bones> = {
    yaw: -20, pitch: 2, roll: 0, twist: -14, bend: 2, side: -2, ...face, pz: -1.8, px: -0.5,
    rfx: -4.5, rfy: -1.6, rfz: 1.2, rfp: 8, rft: -36, rk: -26,
    ...hanging, lhx: 7, lhy: 0, lhz: -15, rhIn: 0, rhx: 4.5, rhy: 0.5, rhz: 10, wAz: 190, wEl: -58, wRoll: 0,
  };
  lifted.re = elbowFor(KNIGHT_BODY, { ...T, ...lifted }, false, [0.6, -0.6, 0.3]);
  // (THE HIGH GUARD: both hands on the hilt at the right shoulder, the blade standing up and a
  // little back; his right foot has gone back and he is turned side-on behind his left shoulder)
  const high: Partial<Bones> = {
    px: -0.5, pz: -2.4, yaw: -34, pitch: 1, roll: 0, twist: -22, bend: 0, side: 0, faceTurn: 0, faceUp: 4,
    lfx: 6, lfy: 0.8, lft: 6, lk: 6, rfx: -8.5, rfy: -1.5, rft: -52, rk: -38,
    rhIn: 0, rhx: 7.5, rhy: 4, rhz: -4.5, re: 0, lhIn: 3, lhx: -5.2, lhy: 0, lhz: 0, le: 10, wAz: 180, wEl: 72, wRoll: 0,
  };
  const guard: Partial<Bones> = { ...REAR, wAz: 198 };
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 6 * FR, pose: reach, ease: 'io' },
      { at: 11 * FR, pose: { ...taken, stow: 0 }, ease: 'io' },
      { at: 15 * FR, pose: { ...lifted, stow: 0 }, ease: 'in' },
      { at: 20 * FR, pose: { ...high, stow: 0 }, ease: 'out' },
      { at: 24 * FR, pose: { ...high, stow: 0, pz: -2.0, wEl: 76, rhz: -4.0 }, ease: 'io' },
      { at: 31 * FR, pose: guard, ease: 'io', as: { wAz: -162 } },
      { at: 46 * FR, pose: { ...REAR, pz: -4.3, bend: 7.5, wEl: -38, rhz: 24.1 }, ease: 'io' },
      { at: 60 * FR, pose: { ...REAR }, ease: 'io', as: { wAz: 198 } },
      { at: 67 * FR, pose: { ...high, stow: 0 }, ease: 'io' },
      { at: 72 * FR, pose: { ...lifted, stow: 0 }, ease: 'io' },
      // (it is on his back again from here: the hand is where the hilt is, and lets go)
      { at: 77 * FR, pose: { ...taken, stow: 1 }, ease: 'io' },
      { at: 82 * FR, pose: reach, ease: 'io' },
      { at: 91 * FR, pose: {}, ease: 'io' },
    ],
  };
}
export const KNIGHT_DRAW3: Move3 = { name: 'The knight draws his sword', held: 'greatsword', build: KNIGHT_BODY, rest: KNIGHT_TOWN, motion: knightDraws(), ready: 31 * FR };

/**
 * THE RANGER UNSLINGS HIS BOW: his left hand goes up over its shoulder to the grip between his
 * shoulder blades, and the bow comes up over the shoulder and down in front of him, turning
 * upright as it comes. He sets himself side-on and DRAWS IT TO HIS JAW, an arrow on the string
 * (it is simply there, as in the Shot), and holds the aim a moment; then lets the string down
 * and stands as he stands in a dungeon (ARCHER), the bow carried in front of him and the back of
 * his other hand on his hip. Then it goes over his shoulder again.
 */
function rangerDraws(): Motion {
  const T = RANGER_TOWN;
  const onHip: Partial<Bones> = { rhIn: 0, rhx: T.rhx, rhy: T.rhy, rhz: T.rhz, re: T.re };
  // (his chest turns a little to the left as that hand goes back over the shoulder, and he stands up off his hip)
  const turned = { yaw: -10, pitch: 1, roll: -2, twist: 4, bend: 1, side: 3 };
  // (the hand goes up past his ear and OVER the shoulder: straight from his side to his back it would go through him)
  const reach: Partial<Bones> = { ...turned, ...onHip, lhIn: 0, lhx: 1, lhy: -1.5, lhz: 6.5, faceTurn: -6, faceUp: 3, faceTilt: 2 };
  reach.le = elbowFor(RANGER_BODY, { ...T, ...reach }, true, [0.7, 0.5, 0.2]);
  const taken: Partial<Bones> = { ...turned, ...onHip, ...holdOnBack(RANGER_BODY, 'bow', true, { ...T, ...turned }), faceTurn: -4, faceUp: 3, faceTilt: 0 };
  taken.le = elbowFor(RANGER_BODY, { ...T, ...taken }, true, [0.45, 0.5, 0.75]);
  // (over the shoulder: the grip above and in front of it, the bow half turned to the front)
  const over: Partial<Bones> = { yaw: -16, pitch: 0, roll: -2, twist: -6, bend: 0, side: 2, ...onHip, lhIn: 0, lhx: 5.5, lhy: 2.5, lhz: 7, wAz: -42, wEl: 22, wRoll: 4, faceTurn: -2, faceUp: 2, faceTilt: 0 };
  over.le = elbowFor(RANGER_BODY, { ...T, ...over }, true, [0.5, 0.7, -0.2]);
  // (set to shoot: side-on, the left foot out)
  const feet: Partial<Bones> = { lfx: 8.5, lfy: 0.4, lfz: 0, lfp: 0, lft: 0, lk: 2, rfx: -3, rfy: 0, rft: -50, rk: -30 };
  const set: Partial<Bones> = { ...feet, px: 1.5, py: 0, pz: -1.8, yaw: -46, pitch: -2, roll: 0, twist: -38, bend: -3, side: 0, faceTurn: 0, faceUp: 2, faceTilt: 0 };
  // (the string is a third drawn as the bow comes up, and let down no further than that: an
  // arm cannot reach the string of a bow held out at the other arm's length)
  const up = drawn({ ...set, pz: -1.2, yaw: -36, twist: -26, bend: 1, lfx: 6.5 }, 0, 0.35, T);
  const aimed = drawn(set, 2, 1, T);
  const eased = drawn({ ...set, pz: -1.2, twist: -32 }, -4, 0.35, T);
  const atEase: Partial<Bones> = { ...ARCHER };
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 5 * FR, pose: reach, ease: 'io' },
      { at: 10 * FR, pose: { ...taken, stow: 0 }, ease: 'io' },
      { at: 14 * FR, pose: { ...over, stow: 0 }, ease: 'in' },
      { at: 19 * FR, pose: { ...up, stow: 0 }, ease: 'out' },
      { at: 24 * FR, pose: { ...aimed, stow: 0 }, ease: 'out' },
      { at: 34 * FR, pose: { ...drawn({ ...set, twist: -40 }, 3, 1, T), stow: 0 }, ease: 'io' },
      { at: 39 * FR, pose: { ...eased, stow: 0 }, ease: 'io' },
      { at: 45 * FR, pose: atEase, ease: 'io' },
      { at: 55 * FR, pose: { ...ARCHER, pz: ARCHER.pz - 0.5, bend: ARCHER.bend + 1.5, lhz: ARCHER.lhz - 0.4 }, ease: 'io' },
      { at: 64 * FR, pose: atEase, ease: 'io' },
      { at: 70 * FR, pose: { ...over, stow: 0 }, ease: 'io' },
      // (it is on his back again from here)
      { at: 75 * FR, pose: { ...taken, stow: 1 }, ease: 'io' },
      { at: 80 * FR, pose: reach, ease: 'io' },
      { at: 87 * FR, pose: {}, ease: 'io' },
    ],
  };
}
export const RANGER_DRAW3: Move3 = { name: 'The ranger unslings his bow', held: 'bow', build: RANGER_BODY, rest: RANGER_TOWN, motion: rangerDraws(), ready: 24 * FR };

/**
 * THE MAGE MAKES READY. Her staff is in her hand already (it is her walking stick, in town and
 * out of it), so there is nothing for her to draw: she lifts it off the ground, swings its head
 * down and forward past her right side, and LEVELS IT AT WHAT IS COMING, low at her right hip
 * with both hands on it as she holds it for the Beam, a foot forward and her knees giving, its
 * crystal waking and burning. She holds that a while; then the light goes down and the staff is
 * stood on the ground again. (Low and at her side, her head up: the owner, 6 Oct 2026, 21:04,
 * of moves made with the staff up in front of her, "very obscured by the hat and the robe".)
 */
function mageReadies(): Motion {
  const lift: Partial<Bones> = { pz: -0.6, yaw: -12, twist: -5, faceUp: 2, rhIn: 0, rhx: 3, rhy: -6, rhz: -2, wAz: 180, wEl: 94, lhIn: 0, lhx: 3.5, lhy: 4, lhz: -10, le: -20 };
  // (its head comes down OUTSIDE her, tipped out to her right as well as forward: straight forward it would cross her face)
  const over: Partial<Bones> = {
    px: 0, pz: -1.8, yaw: -20, twist: -6, pitch: 2, bend: 2, faceUp: 1, lfx: 3.5, lfz: 1.4, lfp: 6, rfx: -3.5, rft: -34, rk: -24,
    rhIn: 0, rhx: 3.5, rhy: -5, rhz: -9, wAz: 140, wEl: 128, lhIn: 0, lhx: 7, lhy: 0, lhz: -11, le: -10,
  };
  const guard: Partial<Bones> = {
    px: 0, pz: -3.2, yaw: -30, pitch: 5, roll: 0, twist: -8, bend: 4, side: 0, faceTurn: 0, faceUp: 0,
    lfx: 7, lfy: 0.5, lfz: 0, lfp: 0, lft: 0, lk: 2, rfx: -7.5, rfy: -1, rft: -46, rk: -32,
    rhIn: 0, rhx: 2, rhy: 0.5, rhz: -15, re: 0, lhIn: 3, lhx: 11.5, lhy: 0, lhz: 0, le: 0, wAz: 180, wEl: 166,
  };
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 5 * FR, pose: { ...lift, draw: 0.5 }, ease: 'io' },
      { at: 9 * FR, pose: { ...over, draw: 1 }, ease: 'in' },
      { at: 13 * FR, pose: { ...guard, draw: 1.8, gale: 0.3 }, ease: 'out' },
      { at: 17 * FR, pose: { ...guard, pz: -3.6, wEl: 168, draw: 1.5, gale: 0.16 }, ease: 'io' },
      { at: 30 * FR, pose: { ...guard, pz: -2.9, wEl: 164.5, rhz: -14.6, draw: 1.25, gale: 0.08 }, ease: 'io' },
      { at: 43 * FR, pose: { ...guard, pz: -3.5, wEl: 167, draw: 1.5, gale: 0.12 }, ease: 'io' },
      { at: 48 * FR, pose: { ...over, draw: 0.8 }, ease: 'io' },
      { at: 53 * FR, pose: { ...lift, draw: 0.3 }, ease: 'io' },
      { at: 60 * FR, pose: {}, ease: 'io' },
    ],
  };
}
export const MAGE_READY3: Move3 = { name: 'The mage makes ready', held: 'staff', build: MAGE_BODY, rest: MAGE, motion: mageReadies(), ready: 13 * FR };

// ---------------------------------------------------------------------------------------------
// WHAT THEY DO TO PASS THE TIME IN TOWN THAT IS NOT DRAWING A WEAPON. The owner, 6 Oct 2026,
// 22:58: "lets not have the battle stance be an idle animation during the character select
// screen.  that way its something different when you select them". So a hero on a class card
// passes the time with these, and the weapon comes out only when they are picked.

/**
 * THE KNIGHT LOOKS ABOUT HIM: arms folded still, his head goes round to his right and his chest
 * a little after it, he looks a while; then round to his left, further, over that shoulder; and
 * to the front again, with a small lift of his chin as he settles.
 */
function knightLooks(): Motion {
  const T = KNIGHT_TOWN;
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.5, pose: { faceTurn: -44, faceUp: 1, twist: T.twist - 7, side: T.side - 1 }, ease: 'io' },
      { at: 1.25, pose: { faceTurn: -48, faceUp: -3, twist: T.twist - 8, side: T.side - 1, bend: T.bend + 1.5, pz: T.pz - 0.5 }, ease: 'io' },
      { at: 1.9, pose: { faceTurn: 38, faceUp: 2, twist: T.twist + 8, side: T.side + 2 }, ease: 'io' },
      { at: 2.7, pose: { faceTurn: 46, faceUp: 0, twist: T.twist + 10, side: T.side + 2, bend: T.bend + 1.5, pz: T.pz - 0.5 }, ease: 'io' },
      { at: 3.25, pose: { faceTurn: T.faceTurn, faceUp: T.faceUp + 5, bend: T.bend - 1 }, ease: 'io' },
      { at: 3.6, pose: {}, ease: 'io' },
    ],
  };
}
export const KNIGHT_LOOKS3: Move3 = { name: 'The knight looks about him', held: 'greatsword', build: KNIGHT_BODY, rest: KNIGHT_TOWN, motion: knightLooks() };
/** The ranger's two (his squirrel; an arrow held before his eye) as he does them in town, the bow on his back: neither needs it in his hand. */
export const RANGER_TOWN_SQUIRREL3: Move3 = { ...SQUIRREL3, name: 'The ranger and his squirrel, in town', rest: RANGER_TOWN };
export const RANGER_TOWN_SIGHTING3: Move3 = { ...SIGHTING3, name: 'The ranger sights along an arrow, in town', rest: RANGER_TOWN };

/** Every move there is on the bones so far, by a short name. */
export const MOVES3: Record<string, Move3> = {
  ktown: KNIGHT_TOWN3, rtown: RANGER_TOWN3, ktownrun: KNIGHT_TOWN_RUN3, rtownrun: RANGER_TOWN_RUN3, kdraw: KNIGHT_DRAW3, rdraw: RANGER_DRAW3, mready: MAGE_READY3,
  klook: KNIGHT_LOOKS3, tsquirrel: RANGER_TOWN_SQUIRREL3, tsighting: RANGER_TOWN_SIGHTING3,
  rstand: RANGER_STAND3, volley: VOLLEY3, shot: SHOT3, rrun: RANGER_RUN3, roll: ROLL3, rreel: RANGER_REEL3, rlurch: RANGER_LURCH3, rfall: RANGER_FALL3, squirrel: SQUIRREL3, sighting: SIGHTING3,
  mstand: MAGE_STAND3, wave: WAVE3, orb: ORB3, beam: BEAM3, beamend: BEAM_END3, mrun: MAGE_RUN3, mreel: MAGE_REEL3, mlurch: MAGE_LURCH3, mfall: MAGE_FALL3, mlight: MAGE_LIGHT3, reading: READING3,
  rear: REAR3, strike: STRIKE3, kslash: SLASH3, slam: SLAM3, whirl: WHIRL3, leap: LEAP3, krun: KNIGHT_RUN3, kreel: KNIGHT_REEL3, klurch: KNIGHT_LURCH3, kfall: KNIGHT_FALL3,
};
