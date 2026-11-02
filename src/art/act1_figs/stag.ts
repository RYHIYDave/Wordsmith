// ACT 1: THE HOLLOW STAG, FLOOR 9'S BOSS: its pictures as the game holds a monster (art/act1_figs/types.ts). The
// art chat's (art/hollow_stag.ts, all of it with his yes as shown, 15 Oct by 13:13), through the maker it hands
// over, makeStagArt(): stand, walk (its stotting, painted for STAG_PACE), attack (the antler gore), reel, die (roots
// drag it down into the ground), and in clips.moves its charge, its roots and its bellow. (Its roots worming through
// the ground are a painter of their own, laid along their lines by render/act1_fx/stag.ts.)

import { STAG_ON, makeStagArt } from '../hollow_stag';
import { STAG_ACTION, makeStagActionArt } from '../stag_action';
import { CLUMP9_CANVAS, WALL, forgetClumps, wallClumpPainted } from '../stag_action_fx';
import { toSprite } from '../kit';
import type { Sprite } from '../../engine/px';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  // (and his fight done the action way, behind STAG_ACTION: art/stag_action.ts, his yes, 2 Nov 2026)
  make: () => (STAG_ACTION.on ? makeStagActionArt() : makeStagArt()),
  // (measured off its stand as tests/act1_stag.test.ts measures it: the top of it over its floor point; half its width at the body)
  size: { top: 52, half: 24 },
  heavy: true,
  switches: [STAG_ON],
};

// HIS WALL OF ROOTS (STAG_ACTION), as the game draws it: each of its ten kinds of clump at the moments the game shows (art/stag_action_fx.ts
// wallClumpPainted), painted ahead (art/films.ts things:stag) or, until they are, as each is first wanted (render/act1_fx/stag.ts):
// bursting up (thirty a second its first 0.3 s, ten a second to 1 s), standing, sinking (fifteen a second), splintered and growing
// back (ten a second); and the torn earth at its foot.
export const CLUMP9 = { rise: 16, stand: 16, sink: 17, sinkN: 11, broken: 28, brokenN: 24, n: 52 } as const;
/** Which of a clump's frames is seen: `s` seconds after it burst up, sinking `gone` seconds, splintered `broken` seconds since (-1 none). */
export function clump9Frame(s: number, gone = -1, broken = -1): number {
  if (s < 0) return -1;
  if (gone >= 0) return gone >= WALL.sink ? -1 : CLUMP9.sink + Math.min(CLUMP9.sinkN - 1, Math.floor(gone * 15));
  if (s < 0.3) return Math.floor(s * 30);
  if (s < 1.0) return 9 + Math.min(6, Math.floor((s - 0.3) * 10));
  if (broken >= 0 && broken < WALL.regrow) return CLUMP9.broken + Math.min(CLUMP9.brokenN - 1, Math.floor(broken * 10));
  return CLUMP9.stand;
}
/** Clump kind `kind`'s frame `i` ('floor': its torn earth, `i` not used). */
export function clump9Sprite(kind: number, i: number, layer: 'air' | 'floor'): Sprite {
  let s = 2;
  let gone = -1;
  let broken = -1;
  if (layer === 'air') {
    if (i < 9) s = (i + 0.5) / 30;
    else if (i < CLUMP9.stand) s = 0.3 + (i - 9 + 0.5) / 10;
    else if (i >= CLUMP9.broken) broken = (i - CLUMP9.broken + 0.5) / 10;
    else if (i >= CLUMP9.sink) gone = (i - CLUMP9.sink + 0.5) / 15;
  }
  return toSprite(wallClumpPainted(kind, s, layer, gone, broken), null, CLUMP9_CANVAS.ax, CLUMP9_CANVAS.ay);
}
/** HIS WALL, painted ahead (art/films.ts things:stag): `air:<kind>` each kind's frames, `floor:<kind>` its earth. */
export function stagThings(): Record<string, Sprite[]> {
  const out: Record<string, Sprite[]> = {};
  for (let kind = 0; kind < WALL.kinds; kind++) {
    out[`air:${kind}`] = Array.from({ length: CLUMP9.n }, (_, i) => clump9Sprite(kind, i, 'air'));
    out[`floor:${kind}`] = [clump9Sprite(kind, 0, 'floor')];
    // (the art keeps every moment it paints: let them go, the game has its own)
    forgetClumps();
  }
  return out;
}
