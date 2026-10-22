// Dev page: Binding's rune stone and colours (render/binding3.ts), beside the other Control words' stones,
// its name in its colour, its six tones, and a stretch of its band of script (its own, and a monster's).
//   node tools/preview.mjs src/dev/preview_binding_rune.ts shots/brune.png 1200 520

import { drawText, textWidth } from '../engine/font';
import { THEME } from '../ui/ui';
import { BIND_ENEMY, BIND_GLYPH_IS, BIND_RAMP, bindRune } from '../render/binding3';
import { hash2 } from '../engine/rng';

const W = 300;
const H = 130;
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

const big = (img: HTMLCanvasElement, w: number, h: number, x: number, y: number, k: number): void => g.drawImage(img, x, y, w * k, h * k);
drawText(g, 'BINDING', 8, 6, BIND_RAMP[3], { shadow: THEME.ink });
drawText(g, 'Control: holds, snares, roots', 8 + textWidth('BINDING') + 6, 6, THEME.dim);
const stone = bindRune();
big(stone.img, stone.w, stone.h, 8, 20, 3);
drawText(g, BIND_GLYPH_IS, 50, 24, THEME.text);
BIND_RAMP.forEach((c, j) => {
  g.fillStyle = THEME.ink;
  g.fillRect(49 + j * 13, 36, 13, 9);
  g.fillStyle = c;
  g.fillRect(50 + j * 13, 37, 11, 7);
});
/** A stretch of band, as the game draws it (render/binding3.ts bandAlong), at four times its size. */
function band(y: number, C: readonly string[], label: string): void {
  drawText(g, label, 8, y - 2, THEME.dim);
  const cv2 = document.createElement('canvas');
  cv2.width = 94;
  cv2.height = 8;
  const g2 = cv2.getContext('2d') as CanvasRenderingContext2D;
  const x0 = 1;
  const len = 92;
  {
  const g = g2;
  const GL = [['X.X', 'XXX'], ['XX.', '.XX'], ['X..', 'XXX'], ['.X.', 'X.X'], ['XXX', 'X..'], ['X.X', '.X.'], ['XX.', 'X.X'], ['.XX', 'XX.']];
  for (let k = 0; k < len; k++) {
    const x = x0 + k;
    const yy = 3;
    g.fillStyle = C[2];
    g.fillRect(x, yy - 1, 1, 1);
    g.fillStyle = C[0];
    g.fillRect(x, yy, 1, 2);
    g.fillStyle = C[1];
    g.fillRect(x, yy + 2, 1, 1);
    const ch = Math.floor(k / 4);
    const col = k % 4;
    const word = hash2(Math.floor(ch / 5), 3, 9);
    const gap = hash2(ch, 5, 11) < 0.18 || (ch % 5 === 4 && word > 0.4);
    if (col < 3 && !gap) {
      const gl = GL[Math.floor(hash2(ch, 1, 13) * GL.length)];
      g.fillStyle = hash2(ch, 2, 17) > 0.7 ? C[5] : C[4];
      if (gl[0][col] === 'X') g.fillRect(x, yy, 1, 1);
      if (gl[1][col] === 'X') g.fillRect(x, yy + 1, 1, 1);
    }
  }
  }
  g.drawImage(cv2, 8, y + 4, 94 * 3, 8 * 3);
}
band(64, BIND_RAMP, 'its band of script (three times its size)');
band(96, BIND_ENEMY, "a monster's, binding the hero (the enemy's pink and gold)");

(window as unknown as { __ready: boolean }).__ready = true;
