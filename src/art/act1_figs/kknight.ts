// ACT 2, PART TWO, THE HIGH CITY: FLOOR 19, THE KEEP: THE KING'S KNIGHTS: their pictures as the game holds a monster
// (art/act1_figs/types.ts), the art chat's (art/kings_knights.ts, kings_knights_moves.ts; his “Really big”, and “Yes, that's
// them (Recommended)”; docs/mockups/kings_knights/README.md): makeKnightArt3(): his stand (the greatsword planted), his walk
// (slow and heavy), setting off and stopping, the sweep (attack), the cleave (clips.moves), struck, his death. Twice the
// knight's height. Heavy: made for his floor.
import { KNIGHTS_ON } from '../kings_knights';
import { makeKnightArt3 } from '../kings_knights_moves';
import type { Act1Fig } from './types';
import { KNIGHT_BANNER, STANDING_CANVAS, bannerPainted, makeBannerKnightArt, makeCleaveKnightArt } from '../action_f16_knight';
import { toSprite } from '../kit';
import type { Sprite } from '../../engine/px';

// (THE RALLYING BANNER, behind KNIGHT_BANNER: art/action_f16_knight.ts, his pick of 31 Oct 2026: the knight with his banner furled on his
// back in every move, his cleave his blow, the banner move (form 0); after it, his look without it (form 1))
const AFTER: readonly Act1Fig[] = [{ make: () => makeCleaveKnightArt(), size: { top: 62, half: 14 }, heavy: true, switches: [KNIGHTS_ON] }];
export const FIG: Act1Fig | null = {
  make: () => (KNIGHT_BANNER.on ? makeBannerKnightArt() : makeKnightArt3()),
  size: { top: 62, half: 14 },
  heavy: true,
  switches: [KNIGHTS_ON],
  get looks() {
    return KNIGHT_BANNER.on ? AFTER : undefined;
  },
};

// THE BANNER STANDING (KNIGHT_BANNER), as the game draws it: its cloth stirring round a loop of BANNER_LOOP seconds, twelve a second,
// from in front and from behind (turned over as the knight who planted it was), painted ahead (art/films.ts things:kknight), or, until
// it is, as each is first wanted.
export const BANNER_LOOP = (2 * Math.PI) / 3.1;
export const BANNER_N = Math.round(BANNER_LOOP * 12);
export const bannerSprite = (i: number, view: 'front' | 'back'): Sprite => toSprite(bannerPainted(0.2 + (i / BANNER_N) * BANNER_LOOP, view), null, STANDING_CANVAS.ax, STANDING_CANVAS.ay);
/** THE BANNER STANDING, painted ahead: `banner:<view>`, its frames round its loop. */
export function kknightThings(): Record<string, Sprite[]> {
  const out: Record<string, Sprite[]> = {};
  for (const view of ['front', 'back'] as const) out[`banner:${view}`] = Array.from({ length: BANNER_N }, (_, i) => bannerSprite(i, view));
  return out;
}
