// Dev-only: every letter of both fonts, large, as the game's screen draws them (two picture pixels
// to a game pixel), for whoever is drawing or mending a glyph.
//   node tools/preview.mjs src/dev/preview_glyphs.ts shots/glyphs.png 1920 1000
//   node tools/preview.mjs src/dev/preview_glyphs.ts shots/glyphs_small.png 1920 700 small
// Each picture pixel is shown six screen pixels wide (eight with `small`, which shows only the
// small font).

import { drawText } from '../engine/font';
import { THEME } from '../ui/ui';
import { ready } from './sheet';

const onlySmall = location.hash === '#small';
const ZOOM = onlySmall ? 8 : 6;
const RES = 2;
const W = onlySmall ? 118 : 158;
const H = onlySmall ? 44 : 82;

const cv = document.createElement('canvas');
cv.width = W * RES;
cv.height = H * RES;
cv.style.width = `${W * RES * ZOOM}px`;
cv.style.height = `${H * RES * ZOOM}px`;
cv.style.imageRendering = 'pixelated';
cv.style.position = 'static';
document.body.style.margin = '0';
document.body.appendChild(cv);

const g = cv.getContext('2d')!;
g.setTransform(RES, 0, 0, RES, 0, 0);
g.imageSmoothingEnabled = false;
g.fillStyle = THEME.bg;
g.fillRect(0, 0, W, H);

let y = 2;
if (!onlySmall) {
  for (const line of ['ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz', '0123456789 !"#$%&\'()*+,-./', ':;<=>?@[\\]^_`{|}~… Wordsmith']) {
    drawText(g, line, 2, y, THEME.text);
    y += 10;
  }
  drawText(g, 'Flame Shot of Leeching', 2, y, THEME.accent, { shadow: THEME.ink });
  y += 11;
}
for (const line of ['ABCDEFGHIJKLMNOPQRSTUVWXYZ', '0123456789 +-%.,:!?/\'()x…', ';"=*<>[]#_ YOUR WORDS LV 10', 'DAMAGE 4-6, 1.74 A SECOND 0O 8B 5S']) {
  drawText(g, line, 2, y, THEME.text, { font: 'small' });
  y += 7;
}
drawText(g, 'IN FRONT   BEHIND   TAP HOLD SWIPE', 2, y, THEME.dim, { font: 'small', shadow: THEME.ink });

ready();
