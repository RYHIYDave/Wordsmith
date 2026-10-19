// Dev page: FLOOR 12, THE UNDERCITY: its pieces (art/floor12.ts, the Rat King's), each at the game's size on the
// Undercity's own ground, with its name. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_floor12.ts shots/f12_pieces.png 1014 1100 pieces
//     every piece and every frame of it, a wall piece on a tunnel's wall
//   node tools/preview.mjs src/dev/preview_floor12.ts shots/f12_some.png 1014 1100 range=0-8
//     only those pieces (counted from 0)
//   node tools/preview.mjs src/dev/preview_floor12.ts shots/f12_look.png 1014 700 look=<name>@2
//     every frame of one piece, twice as big

import { undercityPieces } from '../art/floor12';
import type { Piece } from '../art/floorkit';
import { UC_ZONE, undercityLook } from '../art/undercity';
import { P } from '../art/palette';
import { paintTerrain, pictureOf, terrainOf } from '../art/terrain';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { T_FLOOR, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import { THEME } from '../ui/ui';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'pieces';

// a patch of the Undercity to stand them on: one wide walkway, a wall along its far side
const W = 40;
const H = 40;
const tiles = new Uint8Array(W * H).fill(T_WALL);
for (let y = 10; y < 34; y++) for (let x = 2; x < 38; x++) tiles[y * W + x] = T_FLOOR;
const FLOOR = { depth: 12, seed: 12, w: W, h: H, tiles, cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
const LAND = { floor: FLOOR, zone: () => UC_ZONE.Walk, water: () => false };
const T = terrainOf(FLOOR, undercityLook(LAND));

/** A panel of the ground: the flags, under the middle of the walkway; or the wall, its foot at the panel's foot. */
function ground(w: number, h: number, front: boolean, seed: number): HTMLCanvasElement {
  // a house front: the lane's far side (y = 10), its foot at world (x, 10)
  const [cx, cy] = front ? pictureOf(8 + (seed % 20), 10) : pictureOf(14 + (seed % 12), 24);
  const x0 = Math.round(cx - w / 2);
  const y0 = Math.round(cy - h + (front ? 14 : h / 2 + 8));
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
function shadowAt(g: CanvasRenderingContext2D, x: number, y: number, s: number, k = 1): void {
  g.fillStyle = 'rgba(14, 10, 24, 0.4)';
  g.beginPath();
  g.ellipse(x, y, 30 * s * k, 13 * s * k, 0, 0, Math.PI * 2);
  g.fill();
}

const cvs = document.createElement('canvas');
const g = cvs.getContext('2d') as CanvasRenderingContext2D;

function show(): void {
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

const ALL: [string, Piece][] = undercityPieces().map((p) => ['floor 12', p] as [string, Piece]);
// `range=a-b`: only the pieces a to b
const RANGE = HASH.startsWith('range=') ? HASH.slice(6).split('-').map(Number) : null;
const LIST = RANGE ? ALL.slice(RANGE[0], RANGE[1]) : ALL;

if (HASH === 'pieces' || RANGE) {
  // each piece: its name, then every frame in a cell of the frame's own whole size, on the ground (a wall piece
  // on a house front), at the game's size; the rows wrap
  cvs.width = 1014;
  type Cell = { f: Sprite; wall: boolean; shadow?: number; x: number; y: number; w: number; h: number };
  const cells: Cell[] = [];
  const labels: { text: string; x: number; y: number }[] = [];
  let x = 0;
  let y = 4;
  let rowH = 0;
  const newRow = (): void => {
    x = 0;
    y += rowH + 6;
    rowH = 0;
  };
  for (const [who, piece] of LIST) {
    const wall = !!piece.left;
    const frames = wall ? [...piece.left!, ...piece.right!] : piece.frames!;
    const ws = frames.map((f) => f.w * (f.density ?? 1));
    const need = Math.min(1014, ws.reduce((a, b) => a + b + 4, 0));
    const text = `${piece.name} (${who}: ${piece.kind})`;
    const tw = text.length * 10 + 8;
    if (x > 0 && x + Math.max(need, tw) > 1014) newRow();
    labels.push({ text, x, y });
    const top = y + 18;
    let fx = x;
    let fy = top;
    let rh = 0;
    let right = x;
    for (const f of frames) {
      const w = f.w * (f.density ?? 1);
      const h = f.h * (f.density ?? 1);
      if (fx + w > 1014 && fx > x) {
        fx = x;
        fy += rh + 4;
        rh = 0;
      }
      cells.push({ f, wall, shadow: piece.shadow, x: fx, y: fy, w, h });
      fx += w + 4;
      right = Math.max(right, fx);
      rh = Math.max(rh, h);
    }
    const wrapped = fy > top;
    x = Math.max(right, x + tw) + 8;
    rowH = Math.max(rowH, fy + rh - y);
    if (wrapped || x > 1014 - 150) newRow();
  }
  if (x > 0) newRow();
  cvs.height = y;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, cvs.width, cvs.height);
  cells.forEach((c, k) => {
    g.drawImage(ground(c.w, c.h, c.wall, k), c.x, c.y);
    const d = c.f.density ?? 1;
    if (!c.wall && c.shadow) shadowAt(g, c.x + c.f.ax * d, c.y + c.f.ay * d, c.shadow);
    g.drawImage(c.f.img, c.x, c.y, c.w, c.h);
  });
  g.save();
  g.scale(2, 2);
  for (const l of labels) drawText(g, l.text, (l.x + 2) / 2, (l.y + 2) / 2, THEME.text, { shadow: P.ink });
  g.restore();
  show();
} else if (HASH.startsWith('look=')) {
  // `look=<name>[@k]`: every frame of one piece, each in a cell of its own whole size, `k` times (2 if not said), on the ground
  const [name, ks] = HASH.slice(5).split('@');
  const K = Number(ks || 2);
  const found = ALL.find(([, p]) => p.name === name);
  cvs.width = 1014;
  g.imageSmoothingEnabled = false;
  if (found) {
    const piece = found[1];
    const wall = !!piece.left;
    const frames = wall ? [...piece.left!, ...piece.right!] : piece.frames!;
    const cells = frames.map((f) => ({ f, w: f.w * (f.density ?? 1) * K, h: f.h * (f.density ?? 1) * K }));
    let x = 0;
    let y = 24;
    let rowH = 0;
    const at: [number, number][] = [];
    for (const c of cells) {
      if (x + c.w > 1014 && x > 0) {
        x = 0;
        y += rowH + 6;
        rowH = 0;
      }
      at.push([x, y]);
      x += c.w + 6;
      rowH = Math.max(rowH, c.h);
    }
    cvs.height = y + rowH + 4;
    g.fillStyle = '#0d1030';
    g.fillRect(0, 0, cvs.width, cvs.height);
    cells.forEach((c, k) => {
      const [cx, cy] = at[k];
      const d = c.f.density ?? 1;
      const bg = ground(Math.ceil(c.w / K), Math.ceil(c.h / K), wall, 5 + k);
      g.drawImage(bg, cx, cy, Math.ceil(c.w / K) * K, Math.ceil(c.h / K) * K);
      const ax = cx + c.f.ax * d * K;
      const ay = cy + c.f.ay * d * K;
      if (!wall && piece.shadow) shadowAt(g, ax, ay, piece.shadow, K / 1);
      g.drawImage(c.f.img, cx, cy, c.w, c.h);
    });
    g.save();
    g.scale(2, 2);
    drawText(g, `${piece.name} (${found[0]}: ${piece.kind}), ${K} times`, 2, 2, THEME.text, { shadow: P.ink });
    g.restore();
  }
  show();
} else if (HASH.startsWith('one=')) {
  const name = HASH.slice(4);
  const found = ALL.find(([, p]) => p.name === name);
  cvs.width = 600;
  cvs.height = 400;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, 600, 400);
  if (found) {
    const piece = found[1];
    const wall = !!piece.left;
    const frames = wall ? [...piece.left!, ...piece.right!] : piece.frames!;
    const bg = ground(200, 133, wall, 3);
    g.drawImage(bg, 0, 0, 600, 400);
    const step = 600 / frames.length;
    frames.forEach((f, k) => {
      const fx = step * (k + 0.5);
      const fy = wall ? 400 - 42 : 360;
      if (!wall && piece.shadow) shadowAt(g, fx, fy, piece.shadow, 3);
      drawSprite(g, f, fx, fy, 3 / Math.max(1, frames.length > 2 ? 2 : 1));
    });
  }
  show();
}
