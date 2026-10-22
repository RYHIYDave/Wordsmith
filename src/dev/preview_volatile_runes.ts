// Dev page: the five Volatile melds' rune stones and colours (render/volatile3.ts), each beside the two
// stones it is melded from, its name in its own colour, and its six tones, darkest to white-hot.
//   node tools/preview.mjs src/dev/preview_volatile_runes.ts shots/vrunes.png 1200 900

import { makeIconArt, WORD_COLOR } from '../art/icons';
import { drawSprite } from '../engine/px';
import { drawText, textWidth } from '../engine/font';
import { THEME } from '../ui/ui';
import { VMELD_GLYPH_IS, VMELD_IDS, VMELD_NAME, VMELD_OF, VMELD_RAMP, vmeldRune } from '../render/volatile3';
import type { WordId } from '../game/types';

const W = 340;
const ROW = 40;
const H = 26 + ROW * VMELD_IDS.length;
const S = 4;
const cv = document.createElement('canvas');
cv.width = W * S;
cv.height = H * S;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.style.background = '#000';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.scale(S, S);
g.fillStyle = THEME.bg;
g.fillRect(0, 0, W, H);

const art = makeIconArt();
const part = (w: string): string => WORD_COLOR[w as WordId];
drawText(g, 'THE VOLATILE MELDS', 8, 6, THEME.text, { shadow: THEME.ink });
drawText(g, 'their rune stones and colours', 8 + textWidth('THE VOLATILE MELDS') + 6, 6, THEME.dim);

VMELD_IDS.forEach((w, i) => {
  const y = 24 + i * ROW;
  const [a, b] = VMELD_OF[w];
  // the two stones it is made of, and the stone it makes, twice its size
  const big = (sp: ReturnType<typeof vmeldRune>, x: number, yy: number, k: number): void => {
    g.drawImage(sp.img, x, yy, sp.w * k, sp.h * k);
  };
  big(art.word[a as WordId], 6, y + 6, 1.5);
  drawText(g, '+', 26, y + 12, THEME.dim);
  big(art.word[b as WordId], 34, y + 6, 1.5);
  drawText(g, '=', 54, y + 12, THEME.dim);
  big(vmeldRune(w, part), 62, y, 2.5);
  const C = VMELD_RAMP[w];
  drawText(g, VMELD_NAME[w].toUpperCase(), 98, y + 3, C[3], { shadow: THEME.ink });
  drawText(g, `${a === 'fire' ? 'Flame' : a[0].toUpperCase() + a.slice(1)} + Volatile`, 98 + textWidth(VMELD_NAME[w].toUpperCase()) + 6, y + 3, THEME.dim);
  drawText(g, VMELD_GLYPH_IS[w], 98, y + 14, THEME.text);
  C.forEach((c, j) => {
    g.fillStyle = THEME.ink;
    g.fillRect(97 + j * 13, y + 25, 13, 9);
    g.fillStyle = c;
    g.fillRect(98 + j * 13, y + 26, 11, 7);
  });
  void drawSprite;
});

(window as unknown as { __ready: boolean }).__ready = true;
