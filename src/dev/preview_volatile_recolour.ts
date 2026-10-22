// Dev page: Shatter's and Chain Reaction's new colours (render/volatile3.ts, 21 Oct 2026), once the
// city's four words were in the game: each one's stone and name as they were and as they are now, beside
// the city's word it had come too near (Pulling, Splitting), with its six tones; and Chain Reaction's
// beside the enemy's pink, to tell them apart.
//   node tools/preview.mjs src/dev/preview_volatile_recolour.ts previews/volatile/recolour.png 1360 760

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { drawText, textWidth } from '../engine/font';
import { P } from '../art/palette';
import { WORD_COLOR } from '../art/icons';
import { THEME } from '../ui/ui';
import { NEW_GLYPH, NEW_RAMP } from '../render/words3';
import type { NewWord } from '../render/words3';
import { VMELD_COLOR, VMELD_GLOW, VMELD_NAME, VMELD_RAMP, vmeldRune } from '../render/volatile3';
import type { VMeldId } from '../render/volatile3';
import type { WordId } from '../game/types';

const W = 440;
const H = 200;
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

const part = (w: string): string => WORD_COLOR[w as WordId];
const OLD: Record<'shatter' | 'chainreaction', readonly string[]> = {
  shatter: ['#0e1030', '#242a6a', '#4448b0', '#7c7cf0', '#c8ccff', '#ffffff'],
  chainreaction: ['#1c0e30', '#40206a', '#8050c8', '#e8b8ff', '#fffad8', '#ffffff'],
};
/** Its stone in the colours it had: the colour and glow set back a moment, cut, and put back. */
function oldRune(w: 'shatter' | 'chainreaction'): Sprite {
  const c = VMELD_COLOR[w];
  const gl = VMELD_GLOW[w];
  VMELD_COLOR[w] = OLD[w][3];
  VMELD_GLOW[w] = OLD[w][4];
  const sp = vmeldRune(w, part);
  VMELD_COLOR[w] = c;
  VMELD_GLOW[w] = gl;
  return sp;
}
/** The city's word's stone, cut as the game cuts the new words' (a 12 by 12 stone, its 7 by 7 rune). */
function wordRune(w: NewWord): Sprite {
  const rows = ['............', '..11111111..', '.1222222223.', '.1222222223.', '.1222222223.', '.1222222223.', '.1222222223.', '.1222222223.', '.1222222223.', '.1222222223.', '..33333333..', '............'];
  const p = new Px(12, 12);
  const tone: Record<string, string> = { '1': P.st6, '2': P.st5, '3': P.st3 };
  rows.forEach((row, y) => [...row].forEach((ch, x) => tone[ch] && p.set(x, y, tone[ch])));
  const gl = NEW_GLYPH[w];
  const on = (gx: number, gy: number): boolean => gy >= 0 && gy < 7 && gx >= 0 && gx < 7 && gl[gy].charAt(gx) !== '.';
  for (let gy = 0; gy < 7; gy++) for (let gx = 0; gx < 7; gx++) {
    if (!on(gx, gy)) continue;
    if (!on(gx, gy - 1)) p.set(3 + gx, 2 + gy, P.st3);
    if (!on(gx - 1, gy)) p.set(2 + gx, 3 + gy, P.st3);
  }
  for (let gy = 0; gy < 7; gy++) for (let gx = 0; gx < 7; gx++) if (on(gx, gy)) p.set(3 + gx, 3 + gy, gl[gy].charAt(gx) === 'o' ? NEW_RAMP[w][4] : NEW_RAMP[w][3]);
  return p.outline(P.ink).sprite(6, 10);
}
const big = (sp: Sprite, x: number, y: number, k: number): void => g.drawImage(sp.img, x, y, sp.w * k, sp.h * k);
const tones = (C: readonly string[], x: number, y: number): void => C.forEach((c, j) => {
  g.fillStyle = THEME.ink;
  g.fillRect(x + j * 9, y, 9, 7);
  g.fillStyle = c;
  g.fillRect(x + 1 + j * 9, y + 1, 7, 5);
});

drawText(g, 'TWO NEW COLOURS', 8, 6, THEME.text, { shadow: THEME.ink });
drawText(g, "now that the city's words are in the game", 8 + textWidth('TWO NEW COLOURS') + 6, 6, THEME.dim);
drawText(g, 'WAS', 8, 22, THEME.dim);
drawText(g, 'NOW', 152, 22, THEME.text);
drawText(g, 'THE WORD IT WAS TOO NEAR', 296, 22, THEME.dim);

const rows: [VMeldId & ('shatter' | 'chainreaction'), NewWord, string][] = [
  ['shatter', 'pulling', 'sapphire ice'],
  ['chainreaction', 'splitting', 'magenta lightning'],
];
rows.forEach(([w, near, is], i) => {
  const y = 34 + i * 66;
  const name = VMELD_NAME[w].toUpperCase();
  // was
  big(oldRune(w), 8, y, 3);
  drawText(g, name, 46, y + 4, OLD[w][3], { shadow: THEME.ink });
  tones(OLD[w], 46, y + 16);
  // now
  big(vmeldRune(w, part), 152, y, 3);
  drawText(g, name, 190, y + 4, VMELD_RAMP[w][3], { shadow: THEME.ink });
  drawText(g, is, 190, y + 16, THEME.text);
  tones(VMELD_RAMP[w], 190, y + 28);
  // the city's word it was too near
  big(wordRune(near), 296, y, 3);
  drawText(g, near.toUpperCase(), 334, y + 4, NEW_RAMP[near][3], { shadow: THEME.ink });
  tones(NEW_RAMP[near], 334, y + 16);
});
// the enemy's pink beside Chain Reaction's new colour
const ey = 34 + 2 * 66;
drawText(g, "THE ENEMY'S PINK", 8, ey, THEME.dim);
for (const [j, c] of ['#7a1058', '#c0206a', '#ff4f8a', '#ffb070', '#fff0a0'].entries()) {
  g.fillStyle = THEME.ink;
  g.fillRect(8 + j * 9, ey + 12, 9, 7);
  g.fillStyle = c;
  g.fillRect(9 + j * 9, ey + 13, 7, 5);
}
drawText(g, 'CHAIN REACTION NOW', 152, ey, THEME.dim);
tones(VMELD_RAMP.chainreaction, 152, ey + 12);

(window as unknown as { __ready: boolean }).__ready = true;
