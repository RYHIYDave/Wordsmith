// Dev page: FLOOR 19'S KING'S KNIGHTS (art/kings_knights.ts, art/kings_knights_moves.ts, art/kings_knights_fx.ts),
// standing, from in front and from behind, beside the knight for size, on cold stone flags (not the Keep's own ground,
// which is not made yet); two of them at the game's size, one walking at the knight; and a move close up. Nothing of the
// game imports it.
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_kings_knights.ts shots/knights/sheet.png 1200 600 "sheet"
//   ... "big:<move>:<t>" (front and behind, four times as big), "grid:<move>:<t>,<t>,..." (a move at several moments,
//   both ways round, twice as big)
// The film is tools/kings_knights_film.ts (run in node: it paints its frames without a browser).
import type { Sprite } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import { canvasOf, deathOfMob, paintMob } from '../art/new_mobs3';
import type { Mob } from '../art/new_mobs3';
import { KINGS_KNIGHT } from '../art/kings_knights_moves';
import type { GameView } from '../art/skin';
import { keepFloor } from './kings_knights_floor';

const [mode = 'sheet', a1 = 'stand', a2 = '0'] = decodeURIComponent(location.hash.slice(1)).split(':');
const cv = document.createElement('canvas');
cv.width = window.innerWidth;
cv.height = window.innerHeight;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;

/** The flags, `w` by `h` picture pixels, laid `K` times as big over the whole page. */
function floor(K: number): void {
  const w = Math.ceil(cv.width / K);
  const h = Math.ceil(cv.height / K);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  (c.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(keepFloor(w, h, Math.round(w / 2) + 16, -8), w, h), 0, 0);
  g.drawImage(c, 0, 0, w * K, h * K);
}
function draw(s: Sprite, x: number, y: number, k: number): void {
  const d = s.density ?? 1;
  g.drawImage(s.img, Math.round(x - s.ax * d * k), Math.round(y - s.ay * d * k), s.w * d * k, s.h * d * k);
}
const spOf = (mob: Mob, which: string, t: number, view: GameView): Sprite =>
  which === 'dying' ? toSprite(deathOfMob(mob, t / mob.dieTime, view), null, canvasOf(mob).ax, canvasOf(mob).ay) : toSprite(paintMob(mob, which, t, view), mob.aura, canvasOf(mob).ax, canvasOf(mob).ay);
const hero = makeHeroArt3().of('warrior', { twoHanded: false });
const K_ = KINGS_KNIGHT;

if (mode === 'sheet') {
  // THE SHEET: the king's knight from in front and from behind beside the knight, three times as big; and at the game's
  // size, two of them (one walking, one standing guard) and the knight
  const K = 3;
  floor(K);
  const y = cv.height - 140;
  draw(hero.front.idle[0], 110, y, K);
  draw(spOf(K_, 'stand', 0, 'front'), 370, y, K);
  draw(spOf(K_, 'stand', 0, 'back'), 660, y, K);
  draw(hero.back.idle[0], 890, y, K);
  const x0 = 1040;
  const y0 = cv.height - 70;
  draw(hero.front.idle[0], x0 + 110, y0 + 30, 1);
  draw(spOf(K_, 'walk', 0.2, 'front'), x0 - 20, y0 - 10, 1);
  draw(spOf(K_, 'stand', 0.6, 'front'), x0 + 60, y0 - 70, 1);
} else if (mode === 'grid') {
  const K = 2;
  floor(K);
  const ts = a2.split(',').map(Number);
  const w = cv.width / ts.length;
  ts.forEach((t, i) => {
    for (const [row, view] of [[0, 'front'], [1, 'back']] as const) {
      const yy = (cv.height / 2) * (row + 1) - 30;
      draw(spOf(K_, a1, t, view), w * (i + 0.5), yy, K);
      g.fillStyle = '#ffffff';
      g.font = '14px monospace';
      g.fillText(`${t.toFixed(3)} s`, w * i + 6, yy + 20);
    }
  });
} else if (mode === 'big') {
  const K = 4;
  floor(K);
  const t = Number(a2) || 0;
  draw(spOf(K_, a1, t, 'front'), cv.width * 0.3, cv.height - 70, K);
  draw(spOf(K_, a1, t, 'back'), cv.width * 0.72, cv.height - 70, K);
}
(window as unknown as { __ready: boolean }).__ready = true;
