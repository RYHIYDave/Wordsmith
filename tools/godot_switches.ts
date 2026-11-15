// THE GODOT PORT: the switches the game puts on as it starts (src/main.ts, at the foot: "A SWITCH PUT ON HERE IS PUT ON IN THE
// FLOORS' MONSTERS' BAKE TOO"), put on here the same way, so that what the export tools make is the game as it is played: the
// new enemy moves; the first five floors' new looks (floor 1 THE KING'S TOMB, the town THE CASTLE'S HALL, ...); the High City.
// Each tools/godot_*.ts calls this before it makes a Game or paints a picture.
import { ENEMY_MOVES, useEnemyMoves } from '../src/game/enemy_moves';
import { FLOOR_LOOKS, useFloorLooks } from '../src/game/floor_looks';
import { ALL_OF_IT, useAllOfIt } from '../src/game/all_of_it';
// (his three new words' own colours and runes: below)
import { GLYPH, WORD_COLOR, WORD_GLOW } from '../src/art/icons';
import { WORD_HUE } from '../src/render/fx';
import { W10_GLYPH, W10_RAMP, W10_WORDS, WORDS10_LOOK } from '../src/render/words10';

export function gameSwitches(): void {
  useEnemyMoves(ENEMY_MOVES.on);
  useFloorLooks(FLOOR_LOOKS.on);
  useAllOfIt(ALL_OF_IT.on);
  // LASTING'S, FLEETING'S AND VAST'S OWN COLOURS AND RUNES, the art chat's (render/words10.ts W10_RAMP, W10_GLYPH), in place of
  // the placeholders in art/icons.ts and render/fx.ts, as the game puts them as it starts (src/main.ts: `useWordArt(art.icons,
  // W10_RAMP, W10_GLYPH, W10_WORDS)` and WORD_HUE). useWordArt's own lines, less its painting of the stones: each tool's
  // makeIconArt paints them afterwards, from these. (The seven's, W7, which main.ts puts the same way, are words the Godot version
  // has not yet.)
  if (WORDS10_LOOK.on) {
    for (const w of W10_WORDS) {
      WORD_COLOR[w] = W10_RAMP[w][3];
      WORD_GLOW[w] = W10_RAMP[w][4];
      GLYPH[w] = W10_GLYPH[w];
      WORD_HUE[w] = W10_RAMP[w][3];
    }
  }
}
