// Dev page: FLOOR 17'S BOSS, THE PRINCE (art/prince.ts, art/prince_moves.ts, art/prince_fx.ts), standing, from in front and
// from behind, beside the knight for size, on a dark floor (the black room's own is another helper's: art of floor 17); a
// move at several moments; a move close up; what his moves leave on the floor. Nothing of the game imports it.
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_prince.ts shots/prince/sheet.png 1200 720 "sheet"
//   ... "grid:<move>:<t>,<t>,..." (a move at several moments, both ways round, twice as big)
//   ... "big:<move>:<t>" (front and behind, four times as big)
//   ... "fx:<dance|mask|chime>:<t>" (the ring of partners, a flung mask, a chime's ring)
import type { Sprite } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import type { Painted } from '../art/kit';
import { canvasOf, deathOfMob, paintMob } from '../art/new_mobs3';
import type { Mob } from '../art/new_mobs3';
import { PRINCE } from '../art/prince_moves';
import { CHIME_CANVAS, DANCE_CANVAS, MASK_CANVAS, chimePainted, dancePainted, maskPainted } from '../art/prince_fx';
import type { GameView } from '../art/skin';

const [mode = 'sheet', a1 = 'stand', a2 = '0'] = decodeURIComponent(location.hash.slice(1)).split(':');
const cv = document.createElement('canvas');
cv.width = window.innerWidth;
cv.height = window.innerHeight;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;

/** A dark floor of flags to stand him on (not the black room's own floor). */
function floor(K: number): void {
  g.fillStyle = '#140e16';
  g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = '#1c1420';
  for (let y = -2; y < cv.height / (16 * K) + 2; y++) for (let x = -2; x < cv.width / (32 * K) + 2; x++) {
    if ((x + y) % 2) continue;
    const cx = (x + (y % 2) * 0.5) * 32 * K;
    const cy = y * 8 * K;
    g.beginPath();
    g.moveTo(cx, cy - 8 * K);
    g.lineTo(cx + 16 * K, cy);
    g.lineTo(cx, cy + 8 * K);
    g.lineTo(cx - 16 * K, cy);
    g.fill();
  }
}
function draw(s: Sprite, x: number, y: number, k: number): void {
  const d = s.density ?? 1;
  g.drawImage(s.img, Math.round(x - s.ax * d * k), Math.round(y - s.ay * d * k), s.w * d * k, s.h * d * k);
}
const spOf = (mob: Mob, which: string, t: number, view: GameView): Sprite =>
  which === 'dying' ? toSprite(deathOfMob(mob, Math.min(1, t / mob.dieTime), view), null, canvasOf(mob).ax, canvasOf(mob).ay) : toSprite(paintMob(mob, which, t, view), mob.aura, canvasOf(mob).ax, canvasOf(mob).ay);
const fxSprite = (p: Painted, ax: number, ay: number): Sprite => toSprite(p, null, ax, ay);
const hero = makeHeroArt3().of('warrior', { twoHanded: false });

if (mode === 'sheet') {
  // THE SHEET: the Prince from in front and from behind beside the knight, three times as big
  const K = 3;
  floor(K);
  const y = cv.height - 60;
  draw(hero.front.idle[0], 150, y, K);
  draw(spOf(PRINCE, 'stand', 0, 'front'), 450, y, K);
  draw(spOf(PRINCE, 'stand', 0, 'back'), 790, y, K);
  draw(hero.back.idle[0], 1070, y, K);
} else if (mode === 'grid') {
  // A MOVE AT SEVERAL MOMENTS (`grid:<move>:<t>,<t>,...`), twice as big: from in front along the top, from behind below
  const K = 2;
  floor(K);
  const ts = a2.split(',').map(Number);
  const w = cv.width / ts.length;
  ts.forEach((t, i) => {
    for (const [row, view] of [[0, 'front'], [1, 'back']] as const) {
      const y = (cv.height / 2) * (row + 1) - 30;
      draw(spOf(PRINCE, a1, t, view), w * (i + 0.3), y, K);
      g.fillStyle = '#ffffff';
      g.font = '14px monospace';
      g.fillText(`${t.toFixed(3)} s`, w * i + 6, y + 18);
    }
  });
} else if (mode === 'big') {
  const K = 4;
  floor(K);
  const t = Number(a2) || 0;
  draw(spOf(PRINCE, a1, t, 'front'), cv.width * 0.25, cv.height - 70, K);
  draw(spOf(PRINCE, a1, t, 'back'), cv.width * 0.7, cv.height - 70, K);
} else if (mode === 'fx') {
  floor(1);
  const t = Number(a2) || 0;
  if (a1 === 'dance') draw(fxSprite(dancePainted(t, 'front'), DANCE_CANVAS.ax, DANCE_CANVAS.ay), cv.width / 2, cv.height / 2, 2);
  else if (a1 === 'mask') draw(fxSprite(maskPainted(t, 'front'), MASK_CANVAS.ax, MASK_CANVAS.ay), cv.width / 2, cv.height / 2, 6);
  else draw(fxSprite(chimePainted(t, 'front', 0, 0.4), CHIME_CANVAS.ax, CHIME_CANVAS.ay), cv.width / 2, cv.height / 2, 1);
}
(window as unknown as { __ready: boolean }).__ready = true;
