// ACT 1: THE CARRION QUEEN, FLOOR 7'S BOSS: her pictures as the game holds a monster (art/act1_figs/types.ts).
//
// THE NEW QUEEN ONLY (art/carrion_queen2.ts and carrion_queen2_moves.ts, behind QUEEN2_ON): the owner had her made
// again from nothing on 16 Oct ("I need the carrion queen completely redone"), and the art chat's post of 16 Oct,
// 11:32 hands her over with his yes to her look and every move: "SHE REPLACES THE OLD QUEEN: do not bring
// src/art/carrion_queen.ts (CARRION_QUEEN_ON) into the game". makeQueen2Art() as handed over: her stand, her hop,
// her talon rake (`attack`), her wing gust, her dive and her call (`gust`, `dive`, `call`), struck (`reel`).
//
// HER DEATH, OFF THE EDGE, as the post asks: "she staggers back about 1.3 tiles behind where she stood and GOES
// OVER at Q2_DIE.over 0.85 s, BACKWARD ... Draw the eyrie's near rock over what of her has gone below the edge (the
// films do it with a stand-in edge 1.7 tiles behind where she stood)". Her death's frames, the art's as they are, are
// here among her moves as `fall`; her effects play them where she went over (render/act1_fx/queen.ts), with the
// eyrie's rock as the ground shows it laid over what of her has gone below the edge. Her `die` clip, which the game
// would play where she fell and then leave lying as her body, is empty: nothing of her lies on the eyrie after, for
// she has gone down the drop.

import { Q2_CANVAS, Q2_SCALE, QUEEN2_ON } from '../carrion_queen2';
import { Q2_DIE, makeQueen2Art } from '../carrion_queen2_moves';
import { TILE3 } from '../new_mobs3';
import type { Act1Fig } from './types';

/** How far behind where she stood the eyrie's edge is in her death's films: 60 of her lengths, as built, times her scale (src/dev/preview_queen2.ts EDGE); in tiles. */
export const Q2_EDGE = (60 * Q2_SCALE) / TILE3;

/**
 * Whether a point of her picture from in front (picture pixels on her canvas, Q2_CANVAS) is on this side of the edge,
 * where her death's films lay the near rock over her: the edge runs along her left and right `Q2_EDGE` tiles behind
 * her floor point (behind her, from in front, is up the screen and to the left: a tile along the floor's x is 32
 * picture pixels across and 16 down).
 */
export function nearRock(x: number, y: number): boolean {
  const ex = Q2_CANVAS.ax - Q2_EDGE * 32;
  const ey = Q2_CANVAS.ay - Q2_EDGE * 16;
  // (the edge's way along the floor's y: 32 picture pixels to the left, 16 down, a tile)
  const side = (px: number, py: number): number => (px - ex) * 16 - (py - ey) * -32;
  return Math.sign(side(x, y)) === Math.sign(side(Q2_CANVAS.ax, Q2_CANVAS.ay));
}

/** The same, for a point `dx`, `dy` picture pixels from her floor point in her picture from in front. */
export function nearRockFrom(dx: number, dy: number): boolean {
  return nearRock(Q2_CANVAS.ax + dx, Q2_CANVAS.ay + dy);
}
/** When she goes over the edge in her death (Q2_DIE.over), and how long it is. */
export const Q2_FALL = { over: Q2_DIE.over, long: Q2_DIE.long } as const;

export const FIG: Act1Fig | null = {
  make: () => {
    const art = makeQueen2Art();
    for (const view of ['front', 'back'] as const) {
      const clips = art[view].clips ?? {};
      const moves = { ...(clips.moves ?? {}) };
      // (her death, for her effects to play: render/act1_fx/queen.ts)
      if (clips.die) moves.fall = clips.die;
      clips.die = { frames: [], fps: clips.die?.fps ?? 20 };
      // (her flinch among her moves too, the same frames, so that it is painted ahead with them: the game and its
      // painter paint a figure's stand, walk, attacks, moves and death ahead of need, not its `reel`, art/bestiary.ts)
      if (clips.reel) moves.reel = clips.reel;
      clips.moves = moves;
      art[view].clips = clips;
    }
    return art;
  },
  // (measured off her stand as the others are, tests/act1_queen.test.ts: over her floor point her hunched back is 74
  // high, her neck snaking up and forward of it; half her width at the body, in her mantle)
  size: { top: 78, half: 45 },
  heavy: true,
  switches: [QUEEN2_ON],
};
