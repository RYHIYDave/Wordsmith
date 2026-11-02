// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16: THE HUSHED GROOMS: their pictures as the game holds a monster (art/act1_figs/types.ts),
// the art chat's (art/palace_hands.ts, palace_hands_moves.ts; his yes, 28 Oct 2026), as handed over: makePalaceArt3(PALACE_GROOM),
// on the heroes' bones (mobSet, front and back), their rush at its own pace: their stand (leaning on his fork), the rush (walk), the
// fork jab (attack), struck (reel) and the Hush leaving them (die). The gardeners are a kind of their own (art/act1_figs/gardener.ts).

import { PALACE_HANDS_ON } from '../palace_hands';
import { PALACE_GROOM, makePalaceArt3 } from '../palace_hands_moves';
import { GROOM_HORSE, HORSE_CANVAS, LOOSE, MIST_CANVAS, horsePainted, makeWhistleArt, mistPainted } from '../action_f16_groom';
import { toSprite } from '../kit';
import type { Sprite } from '../../engine/px';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  // (and his whistle in place of the jab, behind GROOM_HORSE: art/action_f16_groom.ts, his pick of 31 Oct 2026)
  make: () => (GROOM_HORSE.on ? makeWhistleArt() : makePalaceArt3(PALACE_GROOM)),
  // (measured off their stand as tests/act2_palace_hands.test.ts measures it: the knight's height, the fork stood beside him)
  size: { top: 28, half: 9 },
  switches: [PALACE_HANDS_ON],
};

// THE HORSE AND ITS MIST (GROOM_HORSE), as the game draws them: the same every time, so painted ahead (art/films.ts things:groom), or,
// until they are, as each is first wanted: the horse thirty a second down its whole line, from in front and from behind (turned over
// as it gallops to the left); the mist it bursts out of and goes into, thirty a second.
export const HORSE_N = Math.ceil((LOOSE.lane / LOOSE.pace) * 30) + 1;
export const MIST_N = 27;
export const horseSprite = (i: number, view: 'front' | 'back'): Sprite => toSprite(horsePainted(i / 30, view), null, HORSE_CANVAS.ax, HORSE_CANVAS.ay);
export const mistSprite = (i: number): Sprite => toSprite(mistPainted(i / 30), null, MIST_CANVAS.ax, MIST_CANVAS.ay);
/** THE HORSE AND ITS MIST, painted ahead: `horse:<view>` and `mist`, their frames. */
export function groomThings(): Record<string, Sprite[]> {
  const out: Record<string, Sprite[]> = {};
  for (const view of ['front', 'back'] as const) out[`horse:${view}`] = Array.from({ length: HORSE_N }, (_, i) => horseSprite(i, view));
  out.mist = Array.from({ length: MIST_N }, (_, i) => mistSprite(i));
  return out;
}
