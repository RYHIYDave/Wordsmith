// (MOCK-UP, NOT IN THE GAME) A WORD CARVED IN A WALL: one of the power words cut into a room's back
// wall, as a landmark (the art rulebook, "Words in the world": "Some places have writing cut into
// them, rare enough to notice"; "Places": "Here and there a place has words carved into it: over a
// door, round a shrine, on a boss's gate. Never on every wall."). Drawn only with the switch of
// render/words_world.ts, `WORDS_LOOK`, on (and `carved` not 'off'); render.ts then stands it where a
// tapestry of the decorations would hang (game/decor.ts says where those go).
//
// Painted as a tapestry is (art/decor.ts, `makeTapestry`): FLAT IN THE PLANE OF THE WALL'S FACE, by
// (u, v) in picture pixels, u along the wall from the start of its first block and v up from the
// floor, and cut into strips a quarter of a tile wide (`Flat.strips`). The letters are the game's own
// (engine/font.ts, `glyphRows`), at the screen's grain, in a cut frame. A CUT IS DARK, AND THE STONE
// JUST UNDER IT CATCHES THE LIGHT: the light comes from the upper left, so the lower lip of each cut
// faces it (on the face in shade, a tone darker and with no lit lip). `glow`: the cuts are lit from
// inside in the word's colour, brighter at their middle.
import { glyphRows } from '../engine/font';
import { mix } from '../engine/px';
import { WORDS } from '../game/defs';
import type { WordId } from '../game/types';
import { TAPESTRY_WIDE } from './decor';
import { Flat } from './gates';
import type { Strip } from './gates';
import { VAULT } from './ground';
import type { Theme } from './ground';
import { WORD_COLOR } from './icons';

/** The words a wall may carry, short enough to be cut across two blocks in the game's normal letter. */
export const CARVED_WORDS: readonly WordId[] = (Object.keys(WORDS) as WordId[]).filter((w) => glyphRows(WORDS[w].name.toUpperCase(), 'normal', true)[0].length <= TAPESTRY_WIDE - 14);

/** Where the letters stand: the top row of them, picture pixels over the floor (the wall's solid part is 56). */
const LETTERS_TOP = 47;
/** The cut frame round them: how far out from the letters, in picture pixels. */
const FRAME_OUT = 4;

export function makeCarving(theme: Theme, alongX: boolean, w: WordId, glow: boolean): Strip[] {
  const rows = glyphRows(WORDS[w].name.toUpperCase(), 'normal', true);
  const tw = rows[0].length;
  const th = rows.length;
  const F = new Flat(0, TAPESTRY_WIDE, 62);
  const face = alongX ? theme.lit : theme.shade;
  const cut = face[0];
  const lip = alongX ? face[4] : null;
  const col = WORD_COLOR[w];
  const u0 = Math.round((TAPESTRY_WIDE - tw) / 2);
  // what is cut: the letters (the plane runs the other way on the screen on a wall along +y, so its
  // letters are laid from the plane's end: they read left to right on the screen on either wall)
  const cuts = new Set<number>();
  const key = (u: number, v: number): number => v * 256 + u;
  for (let r = 0; r < th; r++) {
    for (let c = 0; c < tw; c++) {
      if (rows[r][c] !== '#') continue;
      const u = alongX ? u0 + c : u0 + tw - 1 - c;
      cuts.add(key(u, LETTERS_TOP - r));
    }
  }
  // and a frame round them, a line one pixel wide with its corners cut off
  const fl = u0 - FRAME_OUT;
  const fr = u0 + tw - 1 + FRAME_OUT;
  const ft = LETTERS_TOP + FRAME_OUT;
  const fb = LETTERS_TOP - th + 1 - FRAME_OUT;
  for (let u = fl + 1; u < fr; u++) {
    cuts.add(key(u, ft));
    cuts.add(key(u, fb));
  }
  for (let v = fb + 1; v < ft; v++) {
    cuts.add(key(fl, v));
    cuts.add(key(fr, v));
  }
  for (const k of cuts) {
    const u = k % 256;
    const v = Math.floor(k / 256);
    if (glow) {
      // (lit from inside: brighter where the cut is deepest, between its two edges)
      const inner = cuts.has(key(u - 1, v)) && cuts.has(key(u + 1, v)) ? 0.25 : cuts.has(key(u, v - 1)) && cuts.has(key(u, v + 1)) ? 0.35 : 0.5;
      F.set(u, v, mix(col, cut, alongX ? inner : inner + 0.2));
    } else F.set(u, v, cut);
    // the stone just under a cut catches the light (on the lit face)
    if (lip && !cuts.has(key(u, v - 1))) F.set(u, v - 1, lip);
  }
  return F.strips(alongX);
}

/** The carvings, each painted once when it is first wanted. `variant` picks the word. */
export interface CarvingArt {
  carving(alongX: boolean, variant: number, glow: boolean): Strip[];
}

export function makeCarvingArt(theme: Theme = VAULT): CarvingArt {
  const kept = new Map<string, Strip[]>();
  return {
    carving: (alongX, variant, glow) => {
      const w = CARVED_WORDS[((variant % CARVED_WORDS.length) + CARVED_WORDS.length) % CARVED_WORDS.length];
      const k = `${alongX ? 1 : 0}:${w}:${glow ? 1 : 0}`;
      let s = kept.get(k);
      if (!s) kept.set(k, (s = makeCarving(theme, alongX, w, glow)));
      return s;
    },
  };
}
