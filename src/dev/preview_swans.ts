// Dev page: FLOOR 16'S SWANS (art/garden_swans.ts), standing, from in front and from behind, beside the knight for size, on
// the gardens' lawn; and frames of a move. Nothing of the game imports it.
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_swans.ts shots/swans/swan_sheet.png 1100 520 "sheet"
//   ... "strip:<move>:<view>:<n>" (n frames of a move, across), "flock" (a flock at the game's size)
import type { Sprite } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { swanFrame, swanLong } from '../art/garden_swans';
import { paintSwanGardens, swanGardensTerrain } from '../art/swangardens';
import { pictureOf } from '../art/terrain';
import { T_FLOOR, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import type { GameView } from '../art/skin';

const [mode = 'sheet', a1 = 'walk', a2 = 'front', a3 = '8'] = decodeURIComponent(location.hash.slice(1)).split(':');
const cv = document.createElement('canvas');
cv.width = window.innerWidth;
cv.height = window.innerHeight;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;

// the gardens' lawn under them
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
/** A figure at (x, y) on the canvas (its feet), `k` times its picture size. */
function draw(s: Sprite, x: number, y: number, k: number): void {
  const d = s.density ?? 1;
  g.drawImage(s.img, Math.round(x - s.ax * d * k), Math.round(y - s.ay * d * k), s.w * d * k, s.h * d * k);
}
const hero = makeHeroArt3().of('warrior', { twoHanded: false });

if (mode === 'sheet') {
  // ITS SHEET: from in front and from behind beside the knight, three times as big; and at the game's size
  const K = 3;
  const L = lawn(Math.ceil(cv.width / K), Math.ceil(cv.height / K));
  g.drawImage(L, 0, 0, L.width * K, L.height * K);
  const y = cv.height - 70;
  draw(hero.front.idle[0], 120, y, K);
  draw(swanFrame('stand', 0, 'front'), 300, y, K);
  draw(swanFrame('stand', 0, 'back'), 520, y, K);
  draw(hero.back.idle[0], 680, y, K);
  // (at the game's size, a flock of them by the knight)
  draw(hero.front.idle[0], 860, y - 40, 1);
  for (const [dx, dy, v, t] of [[60, -10, 'front', 0.3], [90, 8, 'front', 1.1], [120, -24, 'back', 0.7], [150, 4, 'front', 1.9], [180, -12, 'front', 0.5]] as const) draw(swanFrame('stand', t, v as GameView), 860 + dx, y - 40 + dy, 1);
} else if (mode === 'big') {
  // (the swan alone, from in front and behind, six times as big, at a moment of a move)
  const K = 6;
  const L = lawn(Math.ceil(cv.width / K), Math.ceil(cv.height / K));
  g.drawImage(L, 0, 0, L.width * K, L.height * K);
  const t = Number(a2) || 0;
  draw(swanFrame(a1, t, 'front'), cv.width * 0.28, cv.height - 70, K);
  draw(swanFrame(a1, t, 'back'), cv.width * 0.72, cv.height - 70, K);
} else if (mode === 'strip') {
  const n = Number(a3);
  const K = 3;
  const L = lawn(Math.ceil(cv.width / K), Math.ceil(cv.height / K));
  g.drawImage(L, 0, 0, L.width * K, L.height * K);
  const long = swanLong(a1);
  for (let i = 0; i < n; i++) draw(swanFrame(a1, (i / Math.max(1, n - (a1 === 'walk' || a1 === 'stand' ? 0 : 1))) * long, a2 as GameView), 80 + i * ((cv.width - 120) / n), cv.height - 60, K);
}
(window as unknown as { __ready: boolean }).__ready = true;
