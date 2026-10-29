// Dev page: FLOOR 16'S BOSS, THE PRINCESS (art/princess.ts, art/princess_moves.ts), standing, from in front and from
// behind, beside the knight for size, on the gardens' lawn, her swans circling her; and a move close up. Nothing of the
// game imports it.
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_princess.ts shots/princess/sheet.png 1500 600 "sheet"
//   ... "ride:leap:30" (on her steed, mid-leap), "side" (the steed side on, to judge its shape)
//   ... "big:<move>:<t>" (front and behind, four times as big)
import type { Sprite } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import { canvasOf, deathOfMob, paintMob } from '../art/new_mobs3';
import type { Mob } from '../art/new_mobs3';
import { PRINCESS } from '../art/princess_moves';
import { RIDE_CANVAS, ridePainted } from '../art/princess_ride';
import { STEED_LEAP, STEED_STAND } from '../art/spectral_steed';
import { swanFrame } from '../art/garden_swans';
import { paintSwanGardens, swanGardensTerrain } from '../art/swangardens';
import { pictureOf } from '../art/terrain';
import { T_FLOOR, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
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

/** Her swans circling her: `n` of them round a ring `r` across, `h` up, `turn` of the way round; each drawn as the game would (facing its way round), the far ones before her, the near ones after. */
function swans(x: number, y: number, k: number, n: number, r: number, h: number, turn: number, nearOnes: boolean, view: 'front' | 'back'): void {
  for (let i = 0; i < n; i++) {
    const a = (i / n + turn) * Math.PI * 2;
    const p = [r * Math.cos(a), r * Math.sin(a), h + 6 * Math.sin(a * 2 + i)];
    const near = view === 'front' ? p[0] - p[1] : -(p[0] - p[1]);
    if (near > 0 !== nearOnes) continue;
    // (its way round, counter-clockwise, and how it looks from here)
    const d = [-Math.sin(a), Math.cos(a)];
    const sgn = view === 'front' ? 1 : -1;
    const sx = 0.82 * (d[0] + d[1]) * sgn;
    const sy = 0.41 * (d[0] - d[1]) * sgn;
    const sp = swanFrame('fly', (i * 0.17) % 0.6, sy > 0 ? 'front' : 'back');
    const X = x + (0.82 * (p[0] + p[1]) * sgn) * k;
    const Y = y + (0.41 * (p[0] - p[1]) * sgn - p[2]) * k;
    const d2 = sp.density ?? 1;
    g.save();
    if (sx < 0) {
      g.translate(Math.round(X), 0);
      g.scale(-1, 1);
      g.drawImage(sp.img, Math.round(-sp.ax * d2 * k), Math.round(Y - sp.ay * d2 * k), sp.w * d2 * k, sp.h * d2 * k);
    } else g.drawImage(sp.img, Math.round(X - sp.ax * d2 * k), Math.round(Y - sp.ay * d2 * k), sp.w * d2 * k, sp.h * d2 * k);
    g.restore();
  }
}
const rideSprite = (P: typeof STEED_LEAP, t: number, view: 'front' | 'back'): Sprite => toSprite(ridePainted(P, t, view), null, RIDE_CANVAS.ax, RIDE_CANVAS.ay);
if (mode === 'sheet') {
  // THE SHEET: the Princess from in front and from behind beside the knight, three times as big; and at the game's
  // size, her swans circling her (her mark)
  const K = 3;
  const L = lawn(Math.ceil(cv.width / K), Math.ceil(cv.height / K));
  g.drawImage(L, 0, 0, L.width * K, L.height * K);
  const y = cv.height - 40;
  draw(hero.front.idle[0], 100, y, K);
  draw(spOf(PRINCESS, 'stand', 0, 'front'), 330, y, K);
  draw(spOf(PRINCESS, 'stand', 0, 'back'), 590, y, K);
  draw(hero.back.idle[0], 800, y, K);
  for (const [x, yy, k] of [[1260, y - 30, 2]] as const) {
    draw(hero.front.idle[0], x - 230, yy, k);
    swans(x, yy, k, 3, 50, 66, 0, false, 'front');
    draw(spOf(PRINCESS, 'stand', 0, 'front'), x, yy, k);
    swans(x, yy, k, 3, 50, 66, 0, true, 'front');
  }
} else if (mode === 'ride') {
  // HER ULTIMATE: on her spectral steed (mid-leap, or standing), from in front and from behind, three times as big, its
  // shadow on the lawn; and at the game's size
  const K = 3;
  const L = lawn(Math.ceil(cv.width / K), Math.ceil(cv.height / K));
  g.drawImage(L, 0, 0, L.width * K, L.height * K);
  const y = cv.height - 40;
  const P = { ...(a1 === 'stand' ? STEED_STAND : STEED_LEAP), yaw: Number(a2) || 0 };
  const shadow = (x: number, yy: number, k: number): void => {
    g.save();
    g.fillStyle = 'rgba(10,14,12,0.38)';
    g.beginPath();
    g.ellipse(x, yy, 34 * k, 15 * k, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  };
  draw(hero.front.idle[0], 80, y, K);
  for (const [x, view] of [[430, 'front'], [900, 'back']] as const) {
    shadow(x, y, K);
    draw(rideSprite(view === 'back' ? { ...P, yaw: -P.yaw } : P, 0.3, view), x, y, K);
  }
  draw(hero.front.idle[0], 1120, y - 60, 1);
  shadow(1210, y - 50, 1);
  draw(rideSprite(P, 0.3, 'front'), 1210, y - 50, 1);
} else if (mode === 'side') {
  // the steed side on, to judge its shape (not a game view)
  const K = 3;
  const L = lawn(Math.ceil(cv.width / K), Math.ceil(cv.height / K));
  g.drawImage(L, 0, 0, L.width * K, L.height * K);
  const y = cv.height - 40;
  for (const [x, P] of [[340, STEED_STAND], [900, STEED_LEAP]] as const) draw(rideSprite({ ...P, yaw: -135 }, 0.3, 'front'), x, y, K);
} else if (mode === 'big') {
  const K = 4;
  const L = lawn(Math.ceil(cv.width / K), Math.ceil(cv.height / K));
  g.drawImage(L, 0, 0, L.width * K, L.height * K);
  const t = Number(a2) || 0;
  draw(spOf(PRINCESS, a1, t, 'front'), cv.width * 0.3, cv.height - 70, K);
  draw(spOf(PRINCESS, a1, t, 'back'), cv.width * 0.72, cv.height - 70, K);
}
(window as unknown as { __ready: boolean }).__ready = true;
