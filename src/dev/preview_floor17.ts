// Dev page: FLOOR 17, THE MASQUE: its pieces (art/floor17.ts, the Prince's), every frame of each, at the game's size on the
// Masque's own floor (the violet room's marble; a wall piece on the violet room's wall, on both its faces), with its name.
// Nothing of the game imports it.
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_floor17.ts shots/masque/pieces.png 1600 1800 "all"
//   ... "range=A-B@K" (only pieces A to B, counted from 0, K times as big), "look=<name>@K" (one piece), "show" (each once, twice as big)
import { masquePieces } from '../art/floor17';
import { MQ_ZONE, masqueLook } from '../art/masque';
import { paintTerrain, pictureOf, terrainOf } from '../art/terrain';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { P } from '../art/palette';
import { T_FLOOR, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import { THEME } from '../ui/ui';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'all';
// a patch of floor: the violet room, its far walls along x at y = 2 and along y at x = 2
const Wt = 40;
const Ht = 40;
const tiles = new Uint8Array(Wt * Ht).fill(T_WALL);
for (let y = 2; y < 38; y++) for (let x = 2; x < 38; x++) tiles[y * Wt + x] = T_FLOOR;
const FLOOR = { depth: 17, seed: 17, w: Wt, h: Ht, tiles, cut: new Uint8Array(Wt * Ht), variant: new Uint8Array(Wt * Ht), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
const LAND = { floor: FLOOR, zone: () => MQ_ZONE.Violet };
const T = terrainOf(FLOOR, masqueLook(LAND));

/** A patch of the floor (or of a wall's foot, for a piece on the wall: `face` 0 the face turned to the screen's left, 1 to its right). */
function ground(w: number, h: number, seed: number, face = -1, footY = 0): HTMLCanvasElement {
  // (on the floor: well into the room; on a wall: its foot at the patch's footY)
  const [cx, cy] = face === 0 ? pictureOf(10 + (seed % 9) * 2.3, 2) : face === 1 ? pictureOf(2, 10 + (seed % 9) * 2.3) : pictureOf(14 + (seed % 14), 20);
  const x0 = Math.round(cx - w / 2);
  const y0 = face >= 0 ? Math.round(cy - footY) : Math.round(cy - h / 2);
  const p = paintTerrain(T, x0, y0, w, h);
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

function main(): void {
const pieces = masquePieces();
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
document.body.style.background = '#08070c';
document.body.appendChild(cvs);
const g = cvs.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.fillStyle = '#08070c';
g.fillRect(0, 0, cvs.width, cvs.height);
let x = 6;
let y = 6;
let rowH = 0;
for (const { p, i } of list) {
  const shots: { sp: Sprite; face: number; f: number }[] = [];
  (p.frames ?? []).forEach((sp, f) => shots.push({ sp, face: -1, f }));
  (p.left ?? []).forEach((sp, f) => shots.push({ sp, face: 0, f }));
  (p.right ?? []).forEach((sp, f) => shots.push({ sp, face: 1, f }));
  for (const { sp, face, f } of shots) {
    if (HASH === 'show' && (f > 0 || face === 1)) continue;
    const d = sp.density ?? 1;
    const w = Math.max(150, sp.w * d * K + 20);
    const h = sp.h * d * K + 34;
    if (x + w > cvs.width) {
      x = 6;
      y += rowH + 6;
      rowH = 0;
    }
    const footY = 24 + sp.ay * d * K;
    g.drawImage(ground(w, h, i * 3 + f, face, footY), x, y);
    drawSprite(g, sp, x + w / 2, y + footY, K);
    g.save();
    g.scale(2, 2);
    drawText(g, `${p.name}`.slice(0, Math.floor(w / 12)), (x + 3) / 2, (y + 3) / 2, THEME.text, { shadow: P.ink });
    g.restore();
    x += w + 6;
    rowH = Math.max(rowH, h);
  }
}
(window as unknown as { __ready: boolean }).__ready = true;
}
// (after the page has loaded: painting every piece takes a while)
setTimeout(main, 0);
