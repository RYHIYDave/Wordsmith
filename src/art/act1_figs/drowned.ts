// ACT 1: THE DROWNED (FLOOR 10): its pictures as the game holds a monster (art/act1_figs/types.ts): the art chat's
// (art/drowned.ts, his yes to each), as handed over: makeDrownedArt3(), built on the bones as new_mobs3.ts builds its
// mobs (mobSet, front and back), its walk at its own pace: its stand, its shamble (walk), its grab (attack), rising out
// of the water (clips.moves.rise), struck (reel) and its death.

import { DROWNED_ON, makeDrownedArt3 } from '../drowned';
import { DROWNED_RETCH, SLICK, SLICK_CANVAS, makeFrostDrownedArt, slickPainted } from '../action_f9_fen';
import { toSprite } from '../kit';
import type { Sprite } from '../../engine/px';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  // (and its bog retch and frost grab, behind DROWNED_RETCH: art/action_f9_fen.ts, his yes, 2 Nov 2026)
  make: () => (DROWNED_RETCH.on ? makeFrostDrownedArt() : makeDrownedArt3()),
  // (measured off its stand as tests/act1_drowned.test.ts measures it)
  size: { top: 28, half: 9 },
  switches: [DROWNED_ON],
};

// ITS SLICK (DROWNED_RETCH), as the game draws it: every slick is the same at the same moment of it, from in front or behind, so its
// frames are painted ahead (art/films.ts things:drowned), SLICK_FPS a second from its mark to its last, or, until they are, as each
// is first wanted (render/act1_fx/drowned.ts). Its clock: seconds from the retch (from -SLICK_MARK, the cone marked).
export const SLICK_FPS = 10;
export const SLICK_MARK = 0.54;
export const SLICK_N = Math.ceil((SLICK_MARK + SLICK.lands + SLICK.stays) * SLICK_FPS) + 1;
/** Which frame of the slick is seen `t` seconds from the retch (-1: none). */
export function slickFrame(t: number): number {
  const i = Math.floor((t + SLICK_MARK) * SLICK_FPS);
  return i < 0 || i >= SLICK_N ? -1 : i;
}
/** The slick's frame `i` from in front or behind (its anchor the Drowned's floor point). */
export function slickSprite(i: number, view: 'front' | 'back'): Sprite {
  return toSprite(slickPainted(i / SLICK_FPS - SLICK_MARK, view), null, SLICK_CANVAS.ax, SLICK_CANVAS.ay);
}
/** ITS SLICK, painted ahead (art/films.ts things:drowned): `slick:<view>` its frames. */
export function drownedThings(): Record<string, Sprite[]> {
  const out: Record<string, Sprite[]> = {};
  for (const view of ['front', 'back'] as const) out[`slick:${view}`] = Array.from({ length: SLICK_N }, (_, i) => slickSprite(i, view));
  return out;
}
