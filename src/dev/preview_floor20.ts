// Dev page: FLOOR 20, THE QUIET TOWER: its pieces (art/floor20.ts, the Moth's), every picture of each, at the game's size
// on the tower's own ground (what hangs on a wall on a far wall of it, on both faces), with its name. Nothing of the game
// imports it.
//   PREVIEW_TIMEOUT=300000 node tools/preview.mjs src/dev/preview_floor20.ts shots/tower/pieces.png 1600 1500 "all"
//   ... "show" (each piece once, twice as big), "range=A-B@K" (only pieces A to B, counted from 0, K times as big),
//   "look=<name>@K" (one piece, K times as big)
import { quietTowerPieces } from '../art/floor20';
import { paintQuietTower, quietTowerTerrain, towerTopTerrain } from '../art/quiettower';
import { pictureOf } from '../art/terrain';
import type { Terrain } from '../art/terrain';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { P } from '../art/palette';
import { THEME } from '../ui/ui';
import { IN_ROOMS, insideFloor, insideLand, topFloor, topLand } from './tower_level';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'all';
const INSIDE = quietTowerTerrain(insideFloor(), insideLand());
const TOP = towerTopTerrain(topFloor(), topLand());
/** What stands on the top (the Moth's floor's own), shown on its flags; the rest on the inside's. */
const ON_TOP = new Set(['the last chapter on its lectern', 'a fallen merlon', 'the cold beacon', 'the trapdoor to the top']);

/** A patch of ground `w` by `h` round the world's (x, y), raised `up` (to show a far wall's face behind a wall piece). */
function ground(T: Terrain, x: number, y: number, w: number, h: number, footY: number): HTMLCanvasElement {
  const [cx, cy] = pictureOf(x, y);
  const x0 = Math.round(cx - w / 2);
  const y0 = Math.round(cy - footY);
  const p = paintQuietTower(T, x0, y0, w, h);
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

const pieces = quietTowerPieces();
let list = pieces.map((p, i) => ({ p, i }));
let K = 1;
if (HASH.startsWith('range=')) {
  const [rg, k] = HASH.slice(6).split('@');
  const [a, b] = rg.split('-').map(Number);
  list = list.filter(({ i }) => i >= a && i <= b);
  K = Number(k) || 1;
} else if (HASH === 'show') K = 2;
else if (HASH.startsWith('look=')) {
  const [name, k] = HASH.slice(5).split('@');
  list = list.filter(({ p }) => p.name === name);
  K = Number(k) || 2;
}
const cvs = document.createElement('canvas');
cvs.width = window.innerWidth;
cvs.height = window.innerHeight;
cvs.style.display = 'block';
document.body.style.margin = '0';
document.body.style.background = '#07080c';
document.body.appendChild(cvs);
const g = cvs.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.fillStyle = '#07080c';
g.fillRect(0, 0, cvs.width, cvs.height);
let x = 6;
let y = 6;
let rowH = 0;
const scr = IN_ROOMS[0][0];
for (const { p } of list) {
  // (its pictures: standing or lying ones; a wall piece's on the face turned to the screen's left, then to its right)
  const pics: { sp: Sprite; on?: 'left' | 'right' }[] = [...(p.frames ?? []).map((sp) => ({ sp })), ...(p.left ?? []).map((sp) => ({ sp, on: 'left' as const })), ...(p.right ?? []).map((sp) => ({ sp, on: 'right' as const }))];
  pics.forEach(({ sp, on }, f) => {
    if (HASH === 'show' && f > 0) return;
    const d = sp.density ?? 1;
    const w = Math.max(150, sp.w * d * K + 20);
    const h = sp.h * d * K + 34;
    if (x + w > cvs.width) {
      x = 6;
      y += rowH + 6;
      rowH = 0;
    }
    const foot = 24 + sp.ay * d * K;
    if (K === 1) {
      // on the ground: a wall piece at a room's far wall (its north wall for the left face, its west for the right)
      const T = ON_TOP.has(p.name) ? TOP : INSIDE;
      const [gx, gy] = on === 'left' ? [scr[0] + 6.2, scr[1]] : on === 'right' ? [scr[0], scr[1] + 5.2] : ON_TOP.has(p.name) ? [15.5, 17.5] : [scr[0] + 6.5, scr[1] + 6.5];
      g.drawImage(ground(T, gx, gy, w, h, foot), x, y);
    } else {
      g.fillStyle = '#2a2b32';
      g.fillRect(x, y, w, h);
    }
    drawSprite(g, sp, x + w / 2, y + foot, K);
    g.save();
    g.scale(2, 2);
    drawText(g, `${p.name}`.slice(0, Math.floor(w / 12)), (x + 3) / 2, (y + 3) / 2, THEME.text, { shadow: P.ink });
    g.restore();
    x += w + 6;
    rowH = Math.max(rowH, h);
  });
}
(window as unknown as { __ready: boolean }).__ready = true;
