// THE MAGE'S AND THE RANGER'S MOVES TO SWAP, EACH ITS OWN ANIMATION (game/swap_moves.ts, behind SWAP_MOVES; his words in
// docs/mockups/swap_moves/README.md), on their bodies brought up (art/ranger_up_moves.ts, art/mage_up_moves.ts). His words,
// 13 Nov 2026, 10:20, shown Snipe on the Volley's kneel: “Why is snipe using the same bent knee animation as volley?  These are so
// half assed man.  Do it right so I don’t have to keep redoing these over and over and over again”. So none borrows another's:
//   SNIPE   his Shot's draw carried on past full to his cheek, the bow raised to his eye (the hold begun); held, the draw
//           deepening as it fills, then a tremor in it at its fullest (the hold); the loose with force, the string hand thrown back,
//           the bow kicking up, a hard step of recoil (let go);
//   SNARE   its loop whirled over his head in his string hand, the bow dropped low in the other with no arrow on it, then thrown
//           straight out at the mark;
//   RALLY   his call: the bow raised high overhead, his horn put to his lips with the other hand and blown, his head back;
//   BALL    a comet thrown overhand by her free hand, her hips all the way round and back: it leaves her hand;
//   SPEAR   the staff carried like a javelin beside her head, then driven forward with a lunge: the lance leaves its crystal.
import type { Move3 } from './moves3';
import type { Bones } from './skeleton';
import { MU_MOVES } from './mage_up_moves';
import { RU_BATTLE, RU_SHOT3, RU_SHOT_HIT } from './ranger_up_moves';

const FR = 1 / 30;
type P = Partial<Bones>;
const at = (move: Move3, t: number): P => {
  // (the pose a move has at a moment, from its own keys: the last key at or before it, with what is named after it)
  let pose: P = {};
  for (const k of move.motion.keys) if (k.at <= t + 1e-6) pose = { ...pose, ...(k.pose as P) };
  return pose;
};

// ---- the Ranger ------------------------------------------------------------------------------------------------------------

/** His Shot at full draw, and drawn on past it to his cheek, the bow lifted to his eye: Snipe's anchor. */
const DRAWN: P = at(RU_SHOT3, 0.233);
const ANCHOR: P = {
  ...DRAWN,
  rhx: (DRAWN.rhx ?? 11.7) - 4.5,
  rhz: (DRAWN.rhz ?? 3) + 4,
  lhx: (DRAWN.lhx ?? 20.4) + 1.2,
  lhz: (DRAWN.lhz ?? 4.5) + 3.5,
  draw: 1,
  faceUp: 3,
  bend: -4,
  pz: -6.6,
  twist: (DRAWN.twist ?? -40) - 4,
};

/** SNIPE, begun: his Shot's draw, carried on to the anchor. */
export const RU_SNIPE_START3: Move3 = {
  ...RU_SHOT3,
  name: 'Snipe: drawn',
  motion: { keys: [...RU_SHOT3.motion.keys.filter((k) => k.at <= 0.234), { at: 0.4, pose: ANCHOR, ease: 'out' }] },
};

/**
 * SNIPE, held: his draw deepening the whole time it fills (his words: “I want snipe to grow in power as you hold”): from the
 * anchor the string hand goes on back past his cheek, the bow bends further, his bow arm locks out and he settles lower and
 * leans back into it, over the draw's 1.5 s (game/swap_moves.ts SWAP_TUNE.snipe.full); then held at its fullest, a tremor in
 * the string hand and the bow (looped from 1.5 s).
 */
const DEEP: P = {
  ...ANCHOR,
  rhx: (ANCHOR.rhx ?? 7) - 5.5,
  rhz: (ANCHOR.rhz ?? 7) + 0.8,
  lhx: (ANCHOR.lhx ?? 21) + 1.6,
  lhz: (ANCHOR.lhz ?? 8) + 0.8,
  draw: 1.6,
  bend: -11,
  pz: -7.9,
  px: -1,
  twist: (ANCHOR.twist ?? -44) - 7,
  faceUp: 4,
};
export const RU_SNIPE_HOLD3: Move3 = {
  ...RU_SHOT3,
  name: 'Snipe: held',
  motion: {
    loop: 1.5,
    // (prop 8: his arrow filling with light as the draw fills, `pt` 0 to 1 over the 1.5 s, art/ranger_up.ts)
    keys: [
      { at: 0, pose: { ...ANCHOR, prop: 8, pt: 0 } },
      { at: 1.5, pose: { ...DEEP, prop: 8, pt: 1 }, ease: 'out' },
      { at: 1.6, pose: { ...DEEP, prop: 8, pt: 1, rhx: (DEEP.rhx ?? 4) - 0.5, lhz: (DEEP.lhz ?? 8) + 0.4 }, ease: 'io' },
      { at: 1.7, pose: { ...DEEP, prop: 8, pt: 1, rhz: (DEEP.rhz ?? 7) + 0.4, lhx: (DEEP.lhx ?? 22) - 0.4 }, ease: 'io' },
      { at: 1.8, pose: { ...DEEP, prop: 8, pt: 1, rhx: (DEEP.rhx ?? 4) + 0.4, lhz: (DEEP.lhz ?? 8) - 0.4 }, ease: 'io' },
      { at: 1.9, pose: { ...DEEP, prop: 8, pt: 1 }, ease: 'io' },
    ],
  },
};

/** SNIPE, let go: the loose from his fullest draw, with force: the string hand thrown back past his ear, the bow kicking up, a hard step of recoil, and back to his guard. */
export const RU_SNIPE_LOOSE3: Move3 = {
  ...RU_SHOT3,
  name: 'Snipe: loosed',
  motion: {
    hit: FR,
    keys: [
      { at: 0, pose: DEEP },
      // (with force: the string hand thrown far back past his ear, the bow kicking up, a hard step back)
      { at: FR, pose: { ...at(RU_SHOT3, RU_SHOT_HIT), rhx: -7, rhz: (ANCHOR.rhz ?? 7) + 3, re: -20, lhz: (ANCHOR.lhz ?? 8) + 3, wEl: 18, draw: 0, pz: -5.8, bend: -9, px: -2.6, twist: (ANCHOR.twist ?? -44) - 8 } },
      { at: 3 * FR, pose: { ...at(RU_SHOT3, RU_SHOT_HIT), rhx: -6, rhz: (ANCHOR.rhz ?? 7) + 2, lhz: (ANCHOR.lhz ?? 8) + 2, wEl: 10, draw: 0, pz: -6, bend: -7, px: -2.4 }, ease: 'out' },
      { at: 7 * FR, pose: { ...at(RU_SHOT3, 0.467), lhz: (ANCHOR.lhz ?? 8), px: -1.6, bend: -4 }, ease: 'io' },
      { at: 10 * FR, pose: { ...at(RU_SHOT3, 0.6), px: -0.6 }, ease: 'io' },
      { at: 18 * FR, pose: {}, ease: 'io' },
    ],
  },
};

/**
 * SNARE: its loop whirled over his head in his string hand, the bow dropped low in the other with no arrow on it; then thrown,
 * his arm coming down and out straight at the mark as he turns into it. The snare goes at 0.24 s (game/defs.ts windup).
 */
export const RU_SNARE3: Move3 = {
  ...RU_SHOT3,
  name: 'Snare: whirled and thrown',
  motion: {
    hit: 0.24,
    keys: [
      { at: 0, pose: {} },
      { at: 0.07, pose: { prop: 6, pt: 0, draw: 0, rhIn: 1, rhx: 3, rhy: -4, rhz: 17, re: -25, lhIn: 1, lhx: 12, lhy: 1, lhz: -10, le: 20, wEl: -60, twist: -2, bend: 2, pz: -5.6, faceUp: 6 }, ease: 'out' },
      { at: 0.18, pose: { prop: 6, pt: 0.9, draw: 0, rhIn: 1, rhx: -1, rhy: -3, rhz: 22, re: -10, lhIn: 1, lhx: 12, lhy: 1, lhz: -10, le: 20, wEl: -60, twist: 8, yaw: -20, bend: -2, pz: -5.2, faceUp: 6 }, ease: 'io' },
      { at: 0.24, pose: { prop: 0, pt: 0, draw: 0, rhIn: 1, rhx: 21, rhy: -1, rhz: 3, re: 0, lhIn: 1, lhx: 6, lhy: 4, lhz: -11, le: 20, wEl: -60, twist: -30, yaw: -42, bend: 9, pz: -6.2, lfx: 3, faceUp: 3 }, ease: 'in' },
      { at: 0.34, pose: { draw: 0, rhIn: 1, rhx: 19, rhy: -1, rhz: 0, re: -4, lhIn: 1, lhx: 6, lhy: 4, lhz: -11, le: 20, wEl: -60, twist: -28, yaw: -42, bend: 10, pz: -6.3, lfx: 3 }, ease: 'out' },
      { at: 0.54, pose: {}, ease: 'io' },
    ],
  },
};

/** RALLY: his call, the bow raised high overhead in one hand, his horn put to his lips with the other and blown, his head back. It goes at 0.3 s. */
export const RU_RALLY3: Move3 = {
  ...RU_SHOT3,
  name: 'Rally: the call',
  motion: {
    hit: 0.3,
    keys: [
      { at: 0, pose: {} },
      { at: 0.15, pose: { prop: 7, pt: 0, draw: 0, lhx: 10, lhy: 2, lhz: 12, le: 40, wEl: 30, rhIn: 0, rhx: 4, rhy: 1, rhz: 3, re: -70, bend: -2, faceUp: 6, pz: -6 }, ease: 'out' },
      { at: 0.3, pose: { prop: 7, pt: 0, draw: 0, lhx: 6, lhy: 4, lhz: 24, le: 10, wEl: 80, rhIn: 0, rhx: 3.5, rhy: 3.5, rhz: 7, re: -85, bend: -10, faceUp: 18, pz: -5.6, twist: -14 }, ease: 'out' },
      { at: 0.42, pose: { prop: 7, pt: 0, draw: 0, lhx: 6, lhy: 4, lhz: 25, le: 10, wEl: 82, rhIn: 0, rhx: 3.5, rhy: 3.5, rhz: 7.4, re: -85, bend: -11, faceUp: 20, pz: -5.6, twist: -14 }, ease: 'io' },
      { at: 0.6, pose: {}, ease: 'io' },
    ],
  },
};

// ---- the Mage --------------------------------------------------------------------------------------------------------------

const MU = MU_MOVES as unknown as Record<string, Move3>;

/**
 * BALL, A COMET THROWN: her own throw, nothing like the Wave's swing over or the Spear's drive. Her free hand lets go of the
 * staff, her hips come all the way round so that hand goes back high behind her hat, the staff kept low in the other; then she
 * turns back hard and throws overhand with a step, the arm coming through long and down across her: the comet leaves her hand
 * at 0.18 s. The hand follows through, and comes back to the staff.
 */
export const MU_BALL3: Move3 = {
  ...MU.wave,
  name: 'Ball: thrown',
  motion: {
    hit: 0.18,
    keys: [
      { at: 0, pose: {} },
      // (the comet comes into her open hand as it goes back, prop 6, and grows there; it leaves it at 0.18)
      { at: 0.1, pose: { lhIn: 0, lhx: -7, lhy: 6, lhz: 13, le: -55, rhIn: 0, rhx: 1, rhy: -2, rhz: -15, wAz: 180, wEl: 196, yaw: 16, twist: 22, bend: -7, pitch: 0, px: -2.2, pz: -2.4, faceTurn: -14, faceUp: 3, draw: 1.6, gale: 0.3, prop: 6, pt: 0.75 }, ease: 'out' },
      { at: 0.14, pose: { lhIn: 0, lhx: 2, lhy: 4, lhz: 16, le: -30, rhIn: 0, rhx: 2, rhy: -2, rhz: -15, wAz: 180, wEl: 196, yaw: -8, twist: 0, bend: 0, px: 0, pz: -2.8, draw: 2, gale: 0.6, prop: 6, pt: 1 }, ease: 'in' },
      { at: 0.18, pose: { lhIn: 0, lhx: 20, lhy: 0, lhz: 6, le: 0, rhIn: 0, rhx: 2, rhy: -2, rhz: -15, wAz: 180, wEl: 196, yaw: -42, twist: -26, bend: 11, pitch: 6, px: 2.6, pz: -3.9, lfx: 9, faceTurn: 0, faceUp: 0, draw: 2.3, gale: 1.2, prop: 0, pt: 0 }, ease: 'in' },
      { at: 0.27, pose: { lhIn: 0, lhx: 13, lhy: -5, lhz: -7, le: -18, rhIn: 0, rhx: 2, rhy: -2, rhz: -15, wAz: 180, wEl: 196, yaw: -44, twist: -28, bend: 13, pitch: 7, px: 2.4, pz: -4.1, lfx: 9, draw: 1.6, gale: 0.9 }, ease: 'out' },
      { at: 0.5, pose: {}, ease: 'io' },
    ],
  },
};

/**
 * SPEAR, A LANCE HURLED: the staff carried in one hand like a javelin, drawn back level beside her head with the crystal pointing
 * at the mark and her free arm reaching out at it; then driven forward with a long lunge: the lance leaves the crystal at 0.2 s.
 */
export const MU_SPEAR3: Move3 = {
  ...MU.wave,
  name: 'Spear: hurled',
  motion: {
    hit: 0.2,
    keys: [
      { at: 0, pose: {} },
      { at: 0.13, pose: { rhIn: 0, rhx: -8, rhy: -5, rhz: 7, re: 0, wAz: 180, wEl: 168, lhIn: 0, lhx: 15, lhy: 2, lhz: 3, le: 0, yaw: -46, twist: -24, bend: -6, pitch: -2, px: -2.6, pz: -2, faceTurn: 0, faceUp: 1, draw: 1.8, gale: 0.3 }, ease: 'out' },
      { at: 0.2, pose: { rhIn: 0, rhx: 17, rhy: -2, rhz: 1, re: 0, wAz: 180, wEl: 178, lhIn: 0, lhx: -5, lhy: 7, lhz: -9, le: -35, yaw: -26, twist: 12, bend: 12, pitch: 7, px: 3.2, pz: -4.6, lfx: 10, draw: 2.4, gale: 1.4 }, ease: 'in' },
      { at: 0.3, pose: { rhIn: 0, rhx: 16, rhy: -2, rhz: 0, re: 0, wAz: 180, wEl: 180, lhIn: 0, lhx: -5, lhy: 7, lhz: -10, le: -35, yaw: -24, twist: 14, bend: 13, pitch: 8, px: 3, pz: -4.8, lfx: 10, draw: 1.8, gale: 1 }, ease: 'out' },
      { at: 0.52, pose: {}, ease: 'io' },
    ],
  },
};

/** Every one of them, by the name the figure's clips are kept under (render/figure.ts, clips.moves). */
export const SWAP_MOVE_CLIPS = { snare: RU_SNARE3, rally: RU_RALLY3, ball: MU_BALL3, spear: MU_SPEAR3 } as const;
export { RU_BATTLE };
