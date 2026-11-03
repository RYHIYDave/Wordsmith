// ACT 2, THE HUSH: FLOOR 14: THE ORDERLIES: their pictures as the game holds a monster (art/act1_figs/types.ts), from the art chat's
// (art/orderlies.ts, orderlies_moves.ts, orderly_shots.ts): makeOrderlyArt3(), on the heroes' bones (mobSet, from in front and
// from behind, its trudge at its own pace): their stand, their trudge (walk), the mallet blow (attack), struck (reel) and their
// death, a felled tree (die).

import { ORDERLIES_ON } from '../orderlies';
import { makeOrderlyArt3 } from '../orderlies_moves';
import { GURNEY, GURNEY_CANVAS, ORDERLY_GURNEY, gurneyPainted, makeGurneyOrderlyArt } from '../action_f11_orderly';
import { toSprite } from '../kit';
import type { Sprite } from '../../engine/px';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  // (and the mallet by Movement 9 and the gurney charge, behind ORDERLY_GURNEY: art/action_f11_orderly.ts, his yes, 2 Nov 2026)
  make: () => (ORDERLY_GURNEY.on ? makeGurneyOrderlyArt() : makeOrderlyArt3()),
  // (measured off their stand as tests/act2_orderly.test.ts measures it: the top of the cap over the floor point, half their width at the body)
  size: { top: 32, half: 12 },
  switches: [ORDERLIES_ON],
};

// THE GURNEY (ORDERLY_GURNEY), as the game draws it: the same every time, from in front or behind, so its frames are painted ahead
// (art/films.ts things:orderly), or, until they are, as each is first wanted: standing (frame 0), careering on thirty a second from the
// slam (GURNEY_ROLL of them), and crashed fifteen a second (GURNEY_WRECK of them).
export const GURNEY_ROLL = 40;
export const GURNEY_WRECK = Math.ceil(GURNEY.lies * 15);
/** Which of its frames: `t` seconds after the slam (before: standing), `crash` seconds after it crashed (or -1). */
export function gurneyFrame(t: number, crash: number): number {
  if (crash >= 0) return 1 + GURNEY_ROLL + Math.min(GURNEY_WRECK - 1, Math.floor(crash * 15));
  if (t <= 0) return 0;
  return 1 + Math.min(GURNEY_ROLL - 1, Math.floor(t * 30));
}
export function gurneySprite(i: number, view: 'front' | 'back'): Sprite {
  const t = i === 0 ? 0 : i <= GURNEY_ROLL ? (i - 1 + 0.5) / 30 : 0.5;
  const crash = i > GURNEY_ROLL ? (i - 1 - GURNEY_ROLL + 0.5) / 15 : -1;
  return toSprite(gurneyPainted(t, view, crash), null, GURNEY_CANVAS.ax, GURNEY_CANVAS.ay);
}
/** THE GURNEY, painted ahead: `gurney:<view>` its frames. */
export function orderlyThings(): Record<string, Sprite[]> {
  const out: Record<string, Sprite[]> = {};
  for (const view of ['front', 'back'] as const) out[`gurney:${view}`] = Array.from({ length: 1 + GURNEY_ROLL + GURNEY_WRECK }, (_, i) => gurneySprite(i, view));
  return out;
}
