// THE EIGHT MELDS' RUNE STONES (render/melds8.ts), and their two words' stones as the game shows them, as raw pictures for
// tools/melds8_sheet.py. npx tsx tools/melds8_stones.ts <out.json>
// @ts-ignore - node typings are not part of this project
import { writeFileSync } from 'node:fs';
import { GLYPH, WORD_COLOR, WORD_GLOW } from '../src/art/icons';
import type { WordId } from '../src/game/types';
import { M8_COLOR, M8_GLYPH_IS, M8_IDS, M8_NAME, M8_OF, M8_RAMP, m8RunePx, stonePx } from '../src/render/melds8';
import { NEW_GLYPH, NEW_RAMP } from '../src/render/words3';

const newOnes = NEW_RAMP as Record<string, readonly string[]>;
const color = (w: string): string => (newOnes[w] ? newOnes[w][3] : WORD_COLOR[w as WordId]);
const glow = (w: string): string => (newOnes[w] ? newOnes[w][4] : WORD_GLOW[w as WordId]);
const glyph = (w: string): readonly string[] => (NEW_GLYPH as Record<string, readonly string[]>)[w] ?? GLYPH[w as WordId];
const pic = (p: { w: number; h: number; d: Uint8ClampedArray }) => ({ w: p.w, h: p.h, rgba: Array.from(p.d) });
const out = M8_IDS.map((id) => ({
  id,
  name: M8_NAME[id],
  is: M8_GLYPH_IS[id],
  color: M8_COLOR[id],
  ramp: M8_RAMP[id],
  stone: pic(m8RunePx(id, color)),
  parts: M8_OF[id].map((w) => ({ word: w, color: color(w), stone: pic(stonePx(glyph(w), color(w), glow(w))) })),
}));
// @ts-ignore
writeFileSync(process.argv[2], JSON.stringify(out));
console.log('stones', out.length);
