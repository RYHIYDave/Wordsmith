// ACT 2, THE HUSH: FLOOR 13: THE HUSHED WORKING THE FIELDS: their pictures as the game holds a monster (art/act1_figs/types.ts),
// the art chat's (art/fieldhands.ts, fieldhands_moves.ts; made on his word of 18 Oct, 21:24 Pacific, for floors 11 to 15),
// as handed over: makeFieldArt3(mob), on the heroes' bones as new_mobs3.ts builds its mobs (mobSet, front and back), its
// shuffle at its own pace: their stand (reaping at nothing), their shuffle (walk), the sickle slash (attack), struck (reel)
// and the Hush leaving them (die). TWO LOOKS, each fieldhand one of them (its rules give it its form: game/act1_rules/
// fieldhand.ts): the reaper (FIELD_REAPER, its own pictures) and the gleaner (FIELD_GLEANER, its other look, figure
// 'fieldhand:1'). Light: painted beside the game as the descent's small kinds are.

import { FIELDHANDS_ON } from '../fieldhands';
import { FIELD_GLEANER, FIELD_REAPER, makeFieldArt3 } from '../fieldhands_moves';
import { BOOM, BOOM_CATCH, BOOM_GLEANER, BOOM_HIT, BOOM_REAPER, CURVE_CANVAS, FIELD_HARVEST, SPIN_CANVAS, curvePainted, makeHarvestArt, sicklePainted } from '../action_f11_field';
import { toSprite } from '../kit';
import type { Sprite } from '../../engine/px';
import type { Act1Fig } from './types';

// (measured off their stand as tests/act2_fieldhand.test.ts measures it: the reaper's straw hat and the gleaner's bonnet
// stand a little over the knight's head, stooped as they are; half their width at the body)
const SIZE = { top: 29, half: 9 };

export const FIG: Act1Fig | null = {
  // (and the sickle boomerang, behind FIELD_HARVEST: art/action_f11_field.ts, his pick of 2 Nov 2026)
  make: () => (FIELD_HARVEST.on ? makeHarvestArt(BOOM_REAPER) : makeFieldArt3(FIELD_REAPER)),
  size: SIZE,
  switches: [FIELDHANDS_ON],
  looks: [{ make: () => (FIELD_HARVEST.on ? makeHarvestArt(BOOM_GLEANER) : makeFieldArt3(FIELD_GLEANER)), size: SIZE, switches: [FIELDHANDS_ON] }],
};

// THE SICKLE IN FLIGHT AND ITS CURVE (FIELD_HARVEST), as the game draws them: every throw the same, from in front or behind, so their
// frames are painted ahead (art/films.ts things:fieldhand), or, until they are, as each is first wanted: the sickle thirty a second
// from the throw to the catch; the curve laid out (CURVE_LAY of it) and gone behind the sickle as it flies (CURVE_GONE).
export const SICKLE_N = Math.round((BOOM_CATCH - BOOM_HIT) * 30);
export const CURVE_LAY = 8;
export const CURVE_GONE = 16;
export const sickleFrame = (t: number): number => (t <= BOOM_HIT || t >= BOOM_CATCH ? -1 : Math.min(SICKLE_N - 1, Math.floor((t - BOOM_HIT) * 30)));
export const sickleSprite = (i: number, view: 'front' | 'back'): Sprite => toSprite(sicklePainted(BOOM_HIT + (i + 0.5) / 30, view), null, SPIN_CANVAS.ax, SPIN_CANVAS.ay);
/** Which frame of the curve is seen `t` seconds into the throw (-1: none): laid out from BOOM.mark, gone behind the sickle. */
export function curveFrame(t: number): number {
  if (t < BOOM.mark || t >= BOOM_CATCH) return -1;
  if (t < BOOM_HIT) return Math.min(CURVE_LAY - 1, Math.floor(((t - BOOM.mark) / 0.24) * CURVE_LAY));
  return CURVE_LAY - 1 + Math.min(CURVE_GONE, Math.floor(((t - BOOM_HIT) / BOOM.fly) * CURVE_GONE));
}
export function curveSprite(i: number, view: 'front' | 'back'): Sprite {
  const k = i < CURVE_LAY ? (i + 1) / CURVE_LAY : 1;
  const gone = i < CURVE_LAY ? 0 : (i - CURVE_LAY + 1) / CURVE_GONE;
  return toSprite({ px: curvePainted(k, view, gone), lights: [] }, null, CURVE_CANVAS.ax, CURVE_CANVAS.ay);
}
/** THE SICKLE AND ITS CURVE, painted ahead: `sickle:<view>`, `curve:<view>`. */
export function fieldThings(): Record<string, Sprite[]> {
  const out: Record<string, Sprite[]> = {};
  for (const view of ['front', 'back'] as const) {
    out[`sickle:${view}`] = Array.from({ length: SICKLE_N }, (_, i) => sickleSprite(i, view));
    out[`curve:${view}`] = Array.from({ length: CURVE_LAY + CURVE_GONE }, (_, i) => curveSprite(i, view));
  }
  return out;
}
