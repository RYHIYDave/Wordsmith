// FLOOR 15'S BOSS, THE CENSOR, MADE AGAIN: HIS MOVES (art/censor2_sculpt.ts is his body; art/censor2_art.ts his pictures). His fight
// is as he set it (game/act1_rules/censor.ts: one phase, his ink filling the floor; his word of 24 Oct 2026), its beats the rules'
// own (CENSOR): what is new is how he does each, his whole body in it (his words of 14 Nov 2026 on the floor 9 bosses: “I need the
// animation of the actual attacker to be more interesting”; of the bosses of 5, 15 and 20: “i just want the fights to be up to par as a
// lynchpin of the 5 levels”). Each a calligrapher's stroke: slow to rise, held, then all at once (Movement 9), and followed through.
//
//   THE SLASH (his `attack`): he turns away, the great brush heaved up over his right shoulder in both hands, his ruff of pages
//     spreading; held, straining; then ONE STROKE, down and across before him from his right to his left, his body thrown after it,
//     the ink flung off its point in a great black crescent; followed through low at his left, dripping; and up again.
//   STRIKE-THROUGH: side-on, the brush levelled at you and drawn back like a lance, his body coiled back; held; then THE THRUST,
//     his whole body flung down the line after it, the line of ink run out from its point; he holds there, and glides back.
//   REDACTION: he RISES off the floor, his hem spreading, the brush raised high over his head in both hands, his head thrown back;
//     held at the top; then down with him, THE BRUSH DRIVEN POINT FIRST INTO THE FLOOR before him, his hem slapping down round him;
//     held there; and he rises out of it.
//   THE HUSH: he gathers himself in, his ruff folding shut, his head bowed, A FINGER RAISED TO THE INK BAR OF HIS MOUTH; the
//     words that circle him drawn in to it; then flung open, arms wide, head back, the ruff bursting open: the silence let go.
//   STRUCK: jolted back, the mask turned away.
//   HIS DEATH: the brush slips from his fingers and falls; his mask cracks, light through the cracks; he arches back, rising on
//     tiptoe, the words of the city bursting out of him (his pictures'); and his robe falls in, empty, onto the ink pooled under it.
//   HIS STAND: still as a pillar, breathing; his ruff stirring; the brush resting low, dripping. HIS GLIDE: no step (no feet), a
//     slow sway and rise and fall, his hem dragging behind.

import type { CensorPose } from './censor2_sculpt';
import { CENSOR_STAND } from './censor2_sculpt';
import { posed } from './f9_bosses_moves';
import type { Beat, Key, MoveInfo } from './f9_bosses_moves';
import type { V3 } from './skeleton';

export type CensorMove = 'slash' | 'strike' | 'redact' | 'hush';

/**
 * His moves' times (the rules' own: game/act1_rules/censor.ts CENSOR): how long, each blow's landing (a freeze and the screen's kick,
 * his rulebook's Movement 7), and when each is struck, from and to (its smear and after-images).
 */
export const CENSOR2_MOVES: Record<CensorMove, MoveInfo> = {
  slash: { long: 1.8, beats: [{ at: 24 / 30, freeze: 0.1, shake: 5, ring: 0.3 }], strikes: [[0.72, 0.84]] },
  strike: { long: 2.2, beats: [{ at: 27 / 30, freeze: 0.1, shake: 6, ring: 0.3 }], strikes: [[0.82, 0.9]] },
  redact: { long: 2.6, beats: [{ at: 1.0, freeze: 0.14, shake: 9, ring: 0.5 }], strikes: [[0.9, 1.0]] },
  hush: { long: 2.6, beats: [{ at: 1.06, freeze: 0.08, shake: 4, ring: 0.6 }], strikes: [[1.0, 1.08]] },
};

/** The stand all his moves begin from and end at. */
const S: CensorPose = { ...CENSOR_STAND };
/** A tremble, `a` of his lengths, for a held pose straining. */
const shiver = (t: number, a: number): V3 => [Math.sin(t * 97) * a, Math.sin(t * 131) * a * 0.6, Math.sin(t * 113) * a * 0.4];

// THE SLASH
const SLASH: Key<CensorPose>[] = [
  [0, {}],
  // (turned away, the brush heaved up over his right shoulder in both hands; his ruff spreading)
  [0.34, { twist: -30, lean: -10, headTurn: 22, handR: [-6, -26, 102], twoHand: 0.32, brushAt: [-34, -40, 196], grip: 0.3, ruff: 0.9, flare: 0.2, hip: [-4, 0, 2], swing: [2, 2, 0] }, 'out'],
  [0.64, { twist: -34, lean: -14, handR: [-10, -26, 106], brushAt: [-44, -36, 196], ruff: 1, hip: [-6, 0, 3] }, 'lin'],
  // (ONE STROKE: down and across before him, his body thrown after it)
  [0.74, { twist: -6, lean: 8, handR: [28, -30, 88], brushAt: [120, -60, 120], headTurn: 10 }, 'in'],
  [0.8, { twist: 16, lean: 16, headUp: -10, headTurn: -10, handR: [40, 4, 46], brushAt: [150, 50, -6], hip: [10, 0, -3], flare: 0.5, ruff: 0.55, swing: [-8, -6, 0] }, 'lin'],
  [0.9, { twist: 24, lean: 20, headUp: -12, handR: [26, 30, 36], brushAt: [70, 130, -6], hip: [12, 4, -3], ruff: 0.5, swing: [-10, -10, 0] }, 'out'],
  // (held through, dripping; then up again)
  [1.3, { twist: 22, lean: 16, headUp: -8, handR: [24, 30, 38], brushAt: [64, 132, -4], hip: [10, 4, -2], swing: [-3, -3, 0], flare: 0.2, ruff: 0.45 }],
  [1.8, { ...S }],
];

// STRIKE-THROUGH
const STRIKE: Key<CensorPose>[] = [
  [0, {}],
  // (side-on, the brush levelled at you and drawn back like a lance, his body coiled back)
  [0.26, { twist: -34, lean: -10, headTurn: 30, handR: [-22, -12, 70], twoHand: 0.5, brushAt: [150, -10, 66], grip: 0.12, hip: [-10, 0, 1], ruff: 1, flare: 0.15, swing: [3, 0, 0] }, 'out'],
  [0.78, { twist: -38, lean: -14, handR: [-28, -12, 72], brushAt: [150, -10, 66], hip: [-16, 0, 2] }, 'lin'],
  // (THE THRUST: his whole body flung down the line after the brush)
  [0.84, { twist: -16, lean: 14, handR: [10, -10, 66], brushAt: [180, -8, 56], hip: [4, 0, 0] }, 'in'],
  [0.9, { twist: -8, lean: 22, headUp: -12, headTurn: 8, handR: [38, -8, 60], brushAt: [200, -6, 44], hip: [22, 0, -2], flare: 0.45, ruff: 0.6, swing: [-14, 0, 0] }, 'lin'],
  // (he holds there, the line running out; then glides back)
  [1.4, { twist: -10, lean: 18, headUp: -10, handR: [36, -8, 60], brushAt: [200, -6, 46], hip: [20, 0, -2], swing: [-4, 0, 0], flare: 0.2, ruff: 0.5 }],
  [2.2, { ...S }],
];

// REDACTION
const REDACT: Key<CensorPose>[] = [
  [0, {}],
  // (he RISES, his hem spreading, the brush raised high over his head in both hands, his head thrown back)
  [0.45, { hip: [-2, 0, 18], flare: 0.8, ruff: 1, lean: -14, headUp: 18, handR: [2, -12, 128], twoHand: 0.34, brushAt: [16, -8, 240], grip: 0.36, swing: [0, 0, -4] }, 'out'],
  [0.86, { hip: [-4, 0, 26], flare: 1, lean: -20, headUp: 26, handR: [-2, -12, 136], brushAt: [6, -8, 250], swing: [0, 0, -6] }, 'lin'],
  // (down with him, the brush driven point first into the floor before him; his hem slapping down round him)
  [0.94, { hip: [4, 0, 12], lean: 14, headUp: 0, handR: [24, -8, 96], brushAt: [76, -6, 40] }, 'in'],
  [1.0, { hip: [10, 0, -2], flare: 0.7, lean: 26, headUp: -18, ruff: 0.7, handR: [40, -6, 50], brushAt: [100, -4, 0], swing: [0, 0, 6] }, 'lin'],
  // (held there, his weight on it; then he rises out of it)
  [1.5, { hip: [10, 0, -3], lean: 28, headUp: -18, handR: [40, -6, 48], brushAt: [100, -4, -2], flare: 0.4, swing: [0, 0, 0] }],
  [2.0, { hip: [4, 0, 6], lean: 10, headUp: 0, handR: [20, -20, 70], brushAt: [44, -28, -6], twoHand: 0, flare: 0.2, ruff: 0.5 }],
  [2.6, { ...S }],
];

// THE HUSH
const HUSH: Key<CensorPose>[] = [
  [0, {}],
  // (gathered in: ruff folding shut, head bowed, a finger raised to the ink bar of his mouth)
  [0.3, { ruff: 0, headUp: -16, lean: 10, handL: [16, 4, 94], finger: 1, flare: 0, hip: [0, 0, -2] }, 'out'],
  [1.0, { ruff: 0, headUp: -20, lean: 14, handL: [17, 3, 94], hip: [0, 0, -3] }, 'lin'],
  // (flung open: arms wide, head back, the ruff bursting open: the silence let go)
  [1.06, { ruff: 1, headUp: 30, lean: -16, handL: [12, 54, 92], finger: 0, handR: [10, -48, 84], brushAt: [20, -116, 44], hip: [0, 0, 10], flare: 1, swing: [0, 0, -6] }, 'lin'],
  [1.6, { ruff: 1, headUp: 22, lean: -10, handL: [12, 50, 86], handR: [10, -46, 80], brushAt: [22, -112, 40], hip: [0, 0, 8], flare: 0.5, swing: [0, 0, 0] }, 'out'],
  [2.6, { ...S }],
];

const KEYS: Record<CensorMove, Key<CensorPose>[]> = { slash: SLASH, strike: STRIKE, redact: REDACT, hush: HUSH };

/** HIM, `t` seconds into `move`: his pose, a held pose trembling. */
export function censorPose(move: CensorMove, t: number): CensorPose {
  const p = posed<CensorPose>(S, KEYS[move], t);
  const held = move === 'slash' ? t > 0.4 && t < 0.66 : move === 'strike' ? t > 0.3 && t < 0.8 : move === 'redact' ? t > 0.5 && t < 0.88 : t > 0.35 && t < 1.0;
  if (!held) return p;
  const s = shiver(t, move === 'redact' ? 0.8 : 0.5);
  return { ...p, handR: [p.handR[0] + s[0], p.handR[1] + s[1], p.handR[2] + s[2]], hip: [p.hip[0] + s[0] * 0.3, p.hip[1], p.hip[2] + s[2] * 0.3] };
}

/** What the game plays of him, as moving pictures: his stand (`idle` frames at `fps`), his glide, struck, his death. */
export const CENSOR2_PLAY = {
  idle: { frames: 12, fps: 6 },
  walk: { frames: 12, fps: 8 },
  reel: 0.3,
  dies: 3.0,
};

/** HIS STAND, `t` seconds in (a loop of two seconds): breathing, his ruff stirring, hovering a hair's breadth, the brush dripping. */
export function censorStill(t: number): CensorPose {
  const a = (t / 2) * Math.PI * 2;
  return { ...S, breath: 0.5 + 0.5 * Math.sin(a), ruff: 0.35 + 0.08 * Math.sin(a + 1), hip: [0, 0, 0.8 * Math.sin(a)], handR: [S.handR[0], S.handR[1], S.handR[2] + 0.6 * Math.sin(a)], swing: [0, 0, 0] };
}

/** HIS GLIDE, `t` seconds in (a loop of 12 frames at 8 a second): no step; a slow sway and rise and fall, his hem dragging behind. */
export function censorWalk(t: number): CensorPose {
  const a = (t / 1.5) * Math.PI * 2;
  return {
    ...S,
    lean: 7 + 1.5 * Math.sin(a * 2),
    twist: 5 * Math.sin(a),
    hip: [0, 1.4 * Math.sin(a), 1.4 + 1.2 * Math.sin(a * 2)],
    swing: [-6 - 1.5 * Math.sin(a * 2), -2 * Math.sin(a), 0],
    flare: 0.12,
    ruff: 0.4,
    handR: [S.handR[0] - 2, S.handR[1], S.handR[2] + 1.2 * Math.sin(a * 2)],
    brushAt: [S.brushAt[0] - 14, S.brushAt[1], S.brushAt[2] + 4],
    handL: [S.handL[0] - 2 + 2 * Math.sin(a), S.handL[1], S.handL[2]],
  };
}

/** STRUCK, `t` seconds in: jolted back, the mask turned away; and back. */
export function censorReel(t: number): CensorPose {
  const k = Math.sin(Math.min(1, t / CENSOR2_PLAY.reel) * Math.PI);
  return { ...S, lean: -12 * k, headUp: 10 * k, headTurn: 18 * k, hip: [-4 * k, 0, 0], swing: [5 * k, 0, 0], ruff: 0.35 + 0.3 * k };
}

const DIES: Key<CensorPose>[] = [
  [0, {}],
  // (the brush slips from his fingers; his mask cracks)
  [0.35, { handR: [16, -30, 50], brushAt: [40, -40, -6], lean: -6, headUp: 10, crack: 0.3, dropped: 0 }],
  [0.75, { handR: [18, -32, 44], crack: 0.5, ruff: 0.8, dropped: 1 }, 'in'],
  // (he arches back, rising on tiptoe, arms flung out; the words of the city burst out of him)
  [1.2, { hip: [-4, 0, 14], lean: -26, headUp: 40, handL: [4, 52, 96], handR: [4, -52, 96], crack: 1, ruff: 1, flare: 0.9 }, 'out'],
  [1.7, { hip: [-4, 0, 16], lean: -28, headUp: 44, crack: 1, ruff: 1, flare: 1, rimless: true }],
  // (and his robe falls in, empty, onto the ink pooled under it)
  [2.4, { hip: [-2, 0, 0], lean: 0, headUp: 0, handL: [6, 24, 20], handR: [6, -24, 20], slump: 1, ruff: 0, flare: 1.4, rimless: true }, 'in'],
  [3.0, { slump: 1, flare: 1.5, rimless: true }],
];

/** HIS DEATH, `t` seconds in. The brush, once it has fallen from his hand, lies on the floor (his pictures paint it there). */
export function censorDie(t: number): CensorPose {
  return posed<CensorPose>(S, DIES, t);
}

/** The beat a move's blow lands at. */
export function beatOf(move: CensorMove): Beat {
  return CENSOR2_MOVES[move].beats[0];
}
