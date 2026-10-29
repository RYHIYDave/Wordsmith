// Dev page: FLOOR 18, THE GLASS GALLERY: its pieces (art/floor18.ts, the Queen's), every picture of each at the game's size
// (or K times as big), on the gallery's own ground (art/glassgallery.ts): what stands on its marble, what hangs on a wall
// on that wall (the face turned to screen-left, then the face turned to screen-right), with its name. Nothing of the game
// imports it.
//   PREVIEW_TIMEOUT=400000 node tools/preview.mjs src/dev/preview_floor18.ts shots/glass/pieces.png 1600 1500 "all"
//   ... "range=A-B@K" (only pieces A to B, counted from 0, K times as big), "look=<name>@K" (one piece, K times as big),
//   "show" (each piece's pictures, twice as big)
import { glassGalleryPieces } from '../art/floor18';
import { glassGalleryTerrain, paintGlassGallery } from '../art/glassgallery';
import { pictureOf } from '../art/terrain';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { P } from '../art/palette';
import { T_FLOOR, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import { THEME } from '../ui/ui';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'all';
const Wt = 44;
const Ht = 44;
const tiles = new Uint8Array(Wt * Ht).fill(T_WALL);
for (let y = 6; y < 42; y++) for (let x = 6; x < 42; x++) tiles[y * Wt + x] = T_FLOOR;
const FLOOR = { depth: 18, seed: 18, w: Wt, h: Ht, tiles, cut: new Uint8Array(Wt * Ht), variant: new Uint8Array(Wt * Ht), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
const T = glassGalleryTerrain({ floor: FLOOR });

/** A patch of the ground `w` by `h` picture pixels round a point of the world; and where that point falls in it. */
function ground(w: number, h: number, at: readonly [number, number], dy: number): HTMLCanvasElement {
  const [cx, cy] = pictureOf(at[0], at[1]);
  const x0 = Math.round(cx - w / 2);
  const y0 = Math.round(cy - dy);
  const p = paintGlassGallery(T, x0, y0, w, h);
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

const pieces = glassGalleryPieces();
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
document.body.style.background = '#09080e';
document.body.appendChild(cvs);
const g = cvs.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.fillStyle = '#09080e';
g.fillRect(0, 0, cvs.width, cvs.height);
let x = 6;
let y = 6;
let rowH = 0;
for (const { p, i } of list) {
  // (what hangs on a wall: on the face turned to screen-left, at the foot of a wall along x; then the other)
  const pics: { sp: Sprite; at: readonly [number, number] }[] = [
    ...(p.frames ?? []).map((sp, f) => ({ sp, at: [16 + ((i * 3 + f) % 14), 24] as const })),
    ...(p.left ?? []).map((sp, f) => ({ sp, at: [12.5 + ((i + f) % 20), 6] as const })),
    ...(p.right ?? []).map((sp, f) => ({ sp, at: [6, 12.5 + ((i + f) % 20)] as const })),
  ];
  for (const { sp, at } of pics) {
    const d = sp.density ?? 1;
    const w = Math.max(150, sp.w * d * K + 20);
    const h = sp.h * d * K + 34;
    if (x + w > cvs.width) {
      x = 6;
      y += rowH + 6;
      rowH = 0;
    }
    const top = 24 + sp.ay * d * K;
    // (the ground at the game's size under the piece; K times as big, the piece alone on the dark)
    if (K === 1) g.drawImage(ground(w, h, at, top), x, y);
    drawSprite(g, sp, x + w / 2, y + top, K);
    g.save();
    g.scale(2, 2);
    drawText(g, `${i}: ${p.name}`.slice(0, Math.floor(w / 12)), (x + 3) / 2, (y + 3) / 2, THEME.text, { shadow: P.ink });
    g.restore();
    x += w + 6;
    rowH = Math.max(rowH, h);
  }
}
(window as unknown as { __ready: boolean }).__ready = true;
