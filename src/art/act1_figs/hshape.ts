// ACT 2, PART TWO, THE HIGH CITY: FLOOR 20, THE QUIET TOWER: THE HUSH IN ITS OWN SHAPES: their pictures as the game holds a monster
// (art/act1_figs/types.ts), the art chat's (art/hush_shapes.ts, hush_shapes_moves.ts; his pick “Drifting, then darting
// (Recommended)”, and his yes, “Yes, that's them (Recommended)”; docs/mockups/hush_shapes/README.md): makeHushShapeArt3(): its
// hovering (stand), its drift (walk), the grip (attack), the dart (clips.moves), struck, and its death, unravelling into wisps as
// the word it swallowed flies home. The knight's size.
import { HUSHSHAPES_ON } from '../hush_shapes';
import { makeHushShapeArt3 } from '../hush_shapes_moves';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: () => makeHushShapeArt3(),
  size: { top: 30, half: 10 },
  switches: [HUSHSHAPES_ON],
};
