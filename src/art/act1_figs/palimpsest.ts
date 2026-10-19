// ACT 2, THE HUSH: FLOOR 13'S BOSS: THE PALIMPSEST: its pictures as the game holds a monster (art/act1_figs/types.ts).
//
// The art chat's (art/palimpsest.ts, palimpsest_moves.ts; made on his word of 18 Oct, 21:24 Pacific, for floors 11 to 15),
// as handed over: makePalimpsestArt(), on the heroes' bones (mobSet, front and back), its walk at its own pace: its stand
// (hunched, heaving), its lumber (walk), the pulp-fist slam (attack), Paper Cuts, Loose Leaves and Rewrite (its moves
// `cuts`, `leaves`, `rewrite`), struck (reel) and its death (die).
//
// MORE TORN AS ITS LIFE RUNS DOWN. His doc: "Every hit peels pages off and shows older writing underneath." The art paints
// it at any wear (art/palimpsest_moves.ts WEAR, "the game's to set by its life"), but a figure's frames are painted once,
// ahead of need, by the painter beside the game (render/painter.ts): so it is held as THREE LOOKS, each every one of its
// pictures painted at a wear of its own: whole (its own pictures), half worn (its look 'palimpsest:1') and worn (its look
// 'palimpsest:2': half its pages gone, the old writing and the burning words showing all over). Its rules show it more
// worn as its life runs down, and never back (game/act1_rules/palimpsest.ts: Monster.form); the looks are STAGES
// (`staged`): as it fights, the next is painted ahead, and those it has gone past are let go of (render/render.ts), so
// that no more than two of them are held at once. Each is painted from the art's own Palimpsest, its painter told the
// wear as each frame is painted (WEAR.now, put back after): the art is not repainted.

import { PALIMPSEST_ON } from '../palimpsest';
import { PALIMPSEST, WEAR, makePalimpsestArt } from '../palimpsest_moves';
import type { Mob } from '../new_mobs3';
import type { Act1Fig } from './types';

/** How worn each of its looks is painted (art WEAR.now): whole, half worn, worn (game/act1_rules/palimpsest.ts PA.wear.looks). */
export const PA_LOOKS = [0, 0.5, 1] as const;

/** The art's Palimpsest painted `wear` worn: its painter told the wear for each frame as it is painted; a name of its own (the painting keeps what it was as it died by its name: art/new_mobs3.ts). */
export function wornPalimpsest(wear: number): Mob {
  if (!wear) return PALIMPSEST;
  const bits = PALIMPSEST.bits;
  return {
    ...PALIMPSEST,
    id: `${PALIMPSEST.id}-worn-${wear}`,
    bits(st, m) {
      const was = WEAR.now;
      WEAR.now = wear;
      try {
        return bits(st, m);
      } finally {
        WEAR.now = was;
      }
    },
  };
}

// (measured off its stand as tests/act2_palimpsest.test.ts measures it: over its floor point its hunched back and the
// head sunk into it, its crest standing off its back, 55 game pixels; half its width at the body, its fists by its knees,
// its picture reaching 22 to either side)
const SIZE = { top: 55, half: 21 };

const look = (wear: number): Act1Fig => ({ make: () => makePalimpsestArt(wornPalimpsest(wear)), size: SIZE, heavy: true, switches: [PALIMPSEST_ON] });

export const FIG: Act1Fig | null = {
  make: () => makePalimpsestArt(wornPalimpsest(PA_LOOKS[0])),
  size: SIZE,
  heavy: true,
  switches: [PALIMPSEST_ON],
  looks: [look(PA_LOOKS[1]), look(PA_LOOKS[2])],
  staged: true,
};
