// Dev page: FLOOR 19, THE KEEP: its pieces (art/floor19.ts, the King's), every frame of each, at the game's size on the
// Keep's own ground (art/keep.ts), with its name; what hangs on a wall on both faces of a wall. Nothing of the game imports
// it.
//   PREVIEW_TIMEOUT=300000 node tools/preview.mjs src/dev/preview_floor19.ts shots/keep/pieces.png 1600 1800 "all"
//   ... "range=A-B@K" (only pieces A to B, counted from 0, K times as big), "look=<name>@K" (one piece), "show" (each
//   piece once, its first picture, twice as big)
import { keepPieces } from '../art/floor19';
import { keepTerrain, paintKeepGround } from '../art/keep';
import { pictureOf } from '../art/terrain';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { P } from '../art/palette';
import { THEME } from '../ui/ui';
import { KW, keepLevel } from './keep_level';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'all';
const { floor, zone } = keepLevel();
const T = keepTerrain(floor, { zone: (tx, ty) => zone[ty * KW + tx] });

/** A patch of the Keep's ground round tile (x, y), `w` by `h` picture pixels, and where that tile is on it. */
function ground(w: number, h: number, x: number, y: number, up: number): { c: HTMLCanvasElement; ax: number; ay: number } {
  const [cx, cy] = pictureOf(x, y);
  const x0 = Math.round(cx - w / 2);
  const y0 = Math.round(cy - h + up);
  const p = paintKeepGround(T, x0, y0, w, h);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  (c.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(p.rgba, w, h), 0, 0);
  return { c, ax: cx - x0, ay: cy - y0 };
}
function drawSprite(g: CanvasRenderingContext2D, sp: Sprite, x: number, y: number, k = 1): void {
  const d = sp.density ?? 1;
  g.drawImage(sp.img, Math.round(x - sp.ax * d * k), Math.round(y - sp.ay * d * k), sp.w * d * k, sp.h * d * k);
}

const pieces = keepPieces();
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
const place = (w: number, h: number): [number, number] => {
  if (x + w > cvs.width) {
    x = 6;
    y += rowH + 6;
    rowH = 0;
  }
  const at: [number, number] = [x, y];
  x += w + 6;
  rowH = Math.max(rowH, h);
  return at;
};
const label = (s: string, px: number, py: number, w: number): void => {
  g.save();
  g.scale(2, 2);
  drawText(g, s.slice(0, Math.floor(w / 12)), (px + 3) / 2, (py + 3) / 2, THEME.text, { shadow: P.ink });
  g.restore();
};
for (const { p } of list) {
  const frames: { sp: Sprite; face?: 'left' | 'right' }[] = [];
  for (const sp of p.frames ?? []) frames.push({ sp });
  for (const sp of p.left ?? []) frames.push({ sp, face: 'left' });
  for (const sp of p.right ?? []) frames.push({ sp, face: 'right' });
  for (const [f, { sp, face }] of frames.entries()) {
    if (HASH === 'show' && f > 0 && !(face === 'right' && f === (p.left ?? []).length)) continue;
    const d = sp.density ?? 1;
    const KK = HASH === 'show' && (p.name === "the king's great bed" || p.name === 'the throne on its dais') ? 1.5 : K;
    const w = Math.max(150, Math.round(sp.w * d * KK + 24));
    const h = Math.round(sp.h * d * KK + 40);
    const [px, py] = place(w, h);
    if (face) {
      // on a wall: the throne hall's far wall (its face to screen-left) or its left wall (to screen-right), at its foot
      const gr = face === 'left' ? ground(Math.ceil(w / KK), Math.ceil(h / KK), 20.5, 8, 40) : ground(Math.ceil(w / KK), Math.ceil(h / KK), 16, 12.5, 40);
      g.drawImage(gr.c, px, py, gr.c.width * KK, gr.c.height * KK);
      drawSprite(g, sp, px + gr.ax * KK, py + gr.ay * KK, KK);
    } else {
      const gr = ground(Math.ceil(w / KK), Math.ceil(h / KK), 22 + (f % 3), 14, Math.min(60, Math.round(h / KK / 3)));
      g.drawImage(gr.c, px, py, gr.c.width * KK, gr.c.height * KK);
      drawSprite(g, sp, px + gr.ax * KK, py + gr.ay * KK, KK);
    }
    label(`${p.name}${face ? ` (${face})` : ''}`, px, py, w);
  }
}
(window as unknown as { __ready: boolean }).__ready = true;
