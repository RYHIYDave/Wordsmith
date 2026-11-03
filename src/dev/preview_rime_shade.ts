// Dev page: FLOOR 20'S RIME SHADE (art/rime_shade.ts, art/rime_shade_moves.ts, art/rime_shade_fx.ts), standing, from in
// front and from behind, beside the knight for size, on a quiet grey floor (dev/hush_floor.ts); a move close up; its breath's
// line of rime at a moment, the knight on it. Nothing of the game imports it.
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_rime_shade.ts shots/rime/sheet.png 1200 400 "sheet"
//   ... "big:<move>:<t>" (front and behind, four times as big), "line:<t>" (`t` seconds into its breath, the line and the
//   knight frozen where it reaches him, twice as big)
// (the film and the pictures for the owner are made without a browser: tools/rime_shade_pics.ts)
import type { Px, Sprite } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import { canvasOf, deathOfMob, paintMob } from '../art/new_mobs3';
import type { Mob } from '../art/new_mobs3';
import { RIME_SHADE, RS_BREATH } from '../art/rime_shade_moves';
import { FROZEN_CANVAS, FX_CANVAS, frozenPainted, fxAt, linePainted, markPainted, reachesAt } from '../art/rime_shade_fx';
import type { GameView } from '../art/skin';
import { towerFloor } from './hush_floor';

const [mode = 'sheet', a1 = 'stand', a2 = '0'] = decodeURIComponent(location.hash.slice(1)).split(':');
const cv = document.createElement('canvas');
cv.width = window.innerWidth;
cv.height = window.innerHeight;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;

function floor(k: number): void {
  const w = Math.ceil(cv.width / k);
  const h = Math.ceil(cv.height / k);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const data = new Uint8ClampedArray(w * h * 4);
  data.set(towerFloor(w, h, 7, 3));
  (c.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(data, w, h), 0, 0);
  g.drawImage(c, 0, 0, w * k, h * k);
}
function draw(s: Sprite, x: number, y: number, k: number, flip = false): void {
  const d = s.density ?? 1;
  g.save();
  g.translate(Math.round(x), 0);
  if (flip) g.scale(-1, 1);
  g.drawImage(s.img, Math.round(-s.ax * d * k), Math.round(y - s.ay * d * k), s.w * d * k, s.h * d * k);
  g.restore();
}
/** A picture of the fx (its anchor at `ax`, `ay`) laid with its anchor at (`x`, `y`), `k` times as big. */
function lay(px: Px, ax: number, ay: number, x: number, y: number, k: number): void {
  draw(toSprite({ px, lights: [] }, null, ax, ay), x, y, k);
}
const MOB: Mob = RIME_SHADE;
const spOf = (which: string, t: number, view: GameView): Sprite =>
  which === 'dying' ? toSprite(deathOfMob(MOB, t / MOB.dieTime, view), null, canvasOf(MOB).ax, canvasOf(MOB).ay) : toSprite(paintMob(MOB, which, t, view), MOB.aura, canvasOf(MOB).ax, canvasOf(MOB).ay);
const hero = makeHeroArt3().of('warrior', { twoHanded: false });

if (mode === 'sheet') {
  const K = 3;
  floor(K);
  const y = cv.height - 40;
  draw(hero.front.idle[0], 110, y, K);
  draw(spOf('stand', 0, 'front'), 360, y, K);
  draw(spOf('stand', 0, 'back'), 640, y, K);
  draw(hero.back.idle[0], 880, y, K);
} else if (mode === 'big') {
  const K = 4;
  floor(K);
  const t = Number(a2);
  draw(spOf(a1, t, 'front'), cv.width * 0.3, cv.height - 40, K);
  draw(spOf(a1, t, 'back'), cv.width * 0.7, cv.height - 40, K);
} else if (mode === 'line') {
  const K = 2;
  floor(K);
  const t = Number(a1);
  const since = t - RS_BREATH.hit;
  const [sx, sy] = [180, 220];
  const kd = 3.3;
  const fz = since - (reachesAt(kd) as number);
  lay(markPainted(t, 'front'), FX_CANVAS.ax, FX_CANVAS.ay, sx, sy, K);
  lay(linePainted(since, 'front', 'floor').px, FX_CANVAS.ax, FX_CANVAS.ay, sx, sy, K);
  draw(spOf(t <= RS_BREATH.long ? 'attack' : 'stand', t <= RS_BREATH.long ? t : 0, 'front'), sx, sy, K);
  lay(linePainted(since, 'front', 'air', 'behind', kd).px, FX_CANVAS.ax, FX_CANVAS.ay, sx, sy, K);
  const [kx, ky] = fxAt('front', kd, 0, 0, 0, 0);
  lay(frozenPainted(fz, 'front', 'far').px, FROZEN_CANVAS.ax, FROZEN_CANVAS.ay, sx + kx * K, sy + ky * K, K);
  draw(hero.back.idle[0], sx + kx * K, sy + ky * K, K, true);
  lay(frozenPainted(fz, 'front', 'near').px, FROZEN_CANVAS.ax, FROZEN_CANVAS.ay, sx + kx * K, sy + ky * K, K);
  lay(linePainted(since, 'front', 'air', 'before', kd).px, FX_CANVAS.ax, FX_CANVAS.ay, sx, sy, K);
}
