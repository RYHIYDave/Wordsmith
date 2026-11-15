// THE GODOT PORT: WORDMELDING'S STONES (the meld's port, 15 Nov 2026). The game, as it starts, gives the melded words their own
// colours and runes in place of art/icons.ts's placeholders (src/main.ts: MELD3, the ten, render/melds3.ts; VOLATILE3, Volatile's
// five; MELDS8_LOOK, the eight across the groups, render/melds8.ts), in that order. The tools that write the words' rune stones and
// colours for the Godot version (tools/godot_loot.ts, tools/godot_hud.ts) do the same here, so that each melded word's stone is the
// one the game shows. (The ranked words' stones are their words', with their rank along the foot: art/icons.ts as it is.)
import { useMeldArt } from '../src/art/icons';
import type { IconArt } from '../src/art/icons';
import { MELD3, MELD_GLYPH, MELD_RAMP } from '../src/render/melds3';
import { VOLATILE3 } from '../src/render/volatile3';
import { M8_GLYPH, M8_RAMP, MELDS8_LOOK } from '../src/render/melds8';
import { MELDS8 } from '../src/game/melds8';
import { MELD8_IDS, VOLT_MELD_IDS } from '../src/game/types';
import type { MeldId } from '../src/game/types';

export function useMeldLooks(icons: IconArt): void {
  if (MELD3.on) useMeldArt(icons, MELD_RAMP, MELD_GLYPH);
  if (VOLATILE3.on) useMeldArt(icons, MELD_RAMP, MELD_GLYPH, VOLT_MELD_IDS);
  if (MELDS8.on && MELDS8_LOOK.on) useMeldArt(icons, M8_RAMP as unknown as Record<MeldId, readonly string[]>, M8_GLYPH as unknown as Record<MeldId, readonly string[]>, MELD8_IDS);
}
