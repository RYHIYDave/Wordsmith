// Dev page: FLOOR 16, THE SWAN GARDENS: its pieces (art/floor16.ts, the Princess's), every frame of each, at the game's
// size on the gardens' own lawn, with its name. Nothing of the game imports it.
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_floor16.ts shots/swans/pieces.png 1600 1500 "all"
//   ... "range=A-B" (only pieces A to B, counted from 0), "look=<name>@K" (one piece, K times as big)
import { swanGardensPieces } from '../art/floor16';
import { lakeWater, swanGardensTerrain, paintSwanGardens } from '../art/swangardens';
import { pictureOf } from '../art/terrain';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { P } from '../art/palette';
import { T_FLOOR, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import { THEME } from '../ui/ui';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'all';
const Wt = 40;
const Ht = 40;
const tiles = new Uint8Array(Wt * Ht).fill(T_WALL);
for (let y = 2; y < 38; y++) for (let x = 2; x < 38; x++) tiles[y * Wt + x] = T_FLOOR;
const FLOOR = { depth: 16, seed: 16, w: Wt, h: Ht, tiles, cut: new Uint8Array(Wt * Ht), variant: new Uint8Array(Wt * Ht), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
// (a lake across the patch's near rows, for what stands in the water)
const T = swanGardensTerrain(FLOOR, { lake: (_tx, ty) => ty >= 38 });

function ground(w: number, h: number, seed: number, water = false): HTMLCanvasElement {
  const [cx, cy] = pictureOf(12 + (seed % 14), 18);
  const x0 = Math.round(cx - w / 2);
  const y0 = Math.round(cy - h / 2);
  const p = paintSwanGardens(T, x0, y0, w, h);
  if (water) {
    // (what stands in the lake, shown on its water)
    for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
      const col = lakeWater(x0 + c, y0 + r);
      const i = (r * w + c) * 4;
      p.rgba[i] = col[0];
      p.rgba[i + 1] = col[1];
      p.rgba[i + 2] = col[2];
    }
  }
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  (c.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(p.rgba, w, h), 0, 0);
  return c;
}
function drawSprite(g: CanvasRenderingContext2D, sp: Sprite, x: number, y: number, k = 1): void {
  const d = sp.density ?? 1;
  g.drawImage(sp.img, Math.round(x - sp.ax * d * k), Math.round(y - sp.ay * d * k), sp.w * d * k, sp.h * d * k);
}

const pieces = swanGardensPieces();
let list = pieces.map((p, i) => ({ p, i }));
let K = 1;
if (HASH.startsWith('range=')) {
  const [rg, k] = HASH.slice(6).split('@');
  const [a, b] = rg.split('-').map(Number);
  list = list.filter(({ i }) => i >= a && i <= b);
  K = Number(k) || 1;
} else if (HASH === 'show') {
  K = 2;
} else if (HASH.startsWith('look=')) {
  const [name, k] = HASH.slice(5).split('@');
  list = list.filter(({ p }) => p.name === name);
  K = Number(k) || 2;
}
const cvs = document.createElement('canvas');
cvs.width = window.innerWidth;
cvs.height = window.innerHeight;
cvs.style.display = 'block';
document.body.style.margin = '0';
document.body.style.background = '#07080d';
document.body.appendChild(cvs);
const g = cvs.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.fillStyle = '#07080d';
g.fillRect(0, 0, cvs.width, cvs.height);
let x = 6;
let y = 6;
let rowH = 0;
for (const { p, i } of list) {
  for (const [f, sp] of (p.frames ?? []).entries()) {
    // (to show him: each piece once, its first picture; the pavilion at its own size, the rest twice as big)
    if (HASH === 'show' && f > 0) continue;
    const KK = K;
    if (HASH === 'show') K = p.name === 'the Swan Pavilion on its island' ? 1 : 2;
    const d = sp.density ?? 1;
    const w = Math.max(150, sp.w * d * K + 20);
    const h = sp.h * d * K + 34;
    if (x + w > cvs.width) {
      x = 6;
      y += rowH + 6;
      rowH = 0;
    }
    g.drawImage(ground(w, h, i * 3 + f, p.name === 'the Swan Pavilion on its island'), x, y);
    drawSprite(g, sp, x + w / 2, y + 24 + sp.ay * d * K, K);
    g.save();
    g.scale(2, 2);
    drawText(g, `${p.name}`.slice(0, Math.floor(w / 12)), (x + 3) / 2, (y + 3) / 2, THEME.text, { shadow: P.ink });
    g.restore();
    x += w + 6;
    rowH = Math.max(rowH, h);
    K = KK;
  }
}
(window as unknown as { __ready: boolean }).__ready = true;
