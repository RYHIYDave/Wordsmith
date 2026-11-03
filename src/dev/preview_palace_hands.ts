// Dev page: FLOOR 16'S HUSHED GARDENERS AND GROOMS (art/palace_hands.ts, art/palace_hands_moves.ts), standing, from in
// front and from behind, beside the knight for size, on the gardens' lawn; a crowd of them at the game's size; and a move
// close up. Nothing of the game imports it.
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_palace_hands.ts shots/hands/sheet.png 1300 380 "sheet"
//   ... "big:<gardener|groom>:<move>:<t>" (front and behind, four times as big)
import type { Sprite } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import { canvasOf, deathOfMob, paintMob } from '../art/new_mobs3';
import type { Mob } from '../art/new_mobs3';
import { PALACE_GARDENER, PALACE_GROOM } from '../art/palace_hands_moves';
import { paintSwanGardens, swanGardensTerrain } from '../art/swangardens';
import { pictureOf } from '../art/terrain';
import { T_FLOOR, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import type { GameView } from '../art/skin';

const [mode = 'sheet', a1 = 'gardener', a2 = 'stand', a3 = '0'] = decodeURIComponent(location.hash.slice(1)).split(':');
const cv = document.createElement('canvas');
cv.width = window.innerWidth;
cv.height = window.innerHeight;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;

const Wt = 40;
const tiles = new Uint8Array(Wt * Wt).fill(T_WALL);
for (let y = 2; y < 38; y++) for (let x = 2; x < 38; x++) tiles[y * Wt + x] = T_FLOOR;
const FLOOR = { depth: 16, seed: 16, w: Wt, h: Wt, tiles, cut: new Uint8Array(Wt * Wt), variant: new Uint8Array(Wt * Wt), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
const T = swanGardensTerrain(FLOOR, {});
const lawn = (w: number, h: number): HTMLCanvasElement => {
  const [cx, cy] = pictureOf(20, 20);
  const p = paintSwanGardens(T, Math.round(cx - w / 2), Math.round(cy - h / 2), w, h);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  (c.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(p.rgba, w, h), 0, 0);
  return c;
};
function draw(s: Sprite, x: number, y: number, k: number): void {
  const d = s.density ?? 1;
  g.drawImage(s.img, Math.round(x - s.ax * d * k), Math.round(y - s.ay * d * k), s.w * d * k, s.h * d * k);
}
const spOf = (mob: Mob, which: string, t: number, view: GameView): Sprite =>
  which === 'dying' ? toSprite(deathOfMob(mob, t / mob.dieTime, view), null, canvasOf(mob).ax, canvasOf(mob).ay) : toSprite(paintMob(mob, which, t, view), mob.aura, canvasOf(mob).ax, canvasOf(mob).ay);
const hero = makeHeroArt3().of('warrior', { twoHanded: false });

if (mode === 'sheet') {
  // THE SHEET: the gardener and the groom, from in front and from behind, beside the knight, three times as big; a crowd
  // of them at the game's size
  const K = 3;
  const L = lawn(Math.ceil(cv.width / K), Math.ceil(cv.height / K));
  g.drawImage(L, 0, 0, L.width * K, L.height * K);
  const y = cv.height - 40;
  draw(hero.front.idle[0], 90, y, K);
  draw(spOf(PALACE_GARDENER, 'stand', 0, 'front'), 250, y, K);
  draw(spOf(PALACE_GARDENER, 'stand', 0, 'back'), 400, y, K);
  draw(spOf(PALACE_GROOM, 'stand', 0, 'front'), 560, y, K);
  draw(spOf(PALACE_GROOM, 'stand', 0, 'back'), 710, y, K);
  draw(hero.back.idle[0], 860, y, K);
  // (at the game's size, a crowd of them rushing at the knight)
  const x0 = 1020;
  draw(hero.front.idle[0], x0, y - 60, 1);
  const crowd: [number, number, Mob, number][] = [[70, -16, PALACE_GARDENER, 0.1], [100, 6, PALACE_GROOM, 0.3], [130, -26, PALACE_GROOM, 0.5], [150, 0, PALACE_GARDENER, 0.2], [185, -14, PALACE_GARDENER, 0.6], [210, 10, PALACE_GROOM, 0.15]];
  for (const [dx, dy, mob, t] of crowd) draw(spOf(mob, 'walk', t, 'front'), x0 + dx, y - 60 + dy, 1);
} else if (mode === 'big') {
  const K = 4;
  const L = lawn(Math.ceil(cv.width / K), Math.ceil(cv.height / K));
  g.drawImage(L, 0, 0, L.width * K, L.height * K);
  const mob = a1 === 'groom' ? PALACE_GROOM : PALACE_GARDENER;
  const t = Number(a3) || 0;
  draw(spOf(mob, a2, t, 'front'), cv.width * 0.3, cv.height - 60, K);
  draw(spOf(mob, a2, t, 'back'), cv.width * 0.72, cv.height - 60, K);
}
(window as unknown as { __ready: boolean }).__ready = true;
