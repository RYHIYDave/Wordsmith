// Dev page: FLOOR 11, THE GATE WARD: its pieces (art/floor11.ts, the Crier's) and the set's (art/act2_set.ts,
// the Hush's), each at the game's size on the Gate Ward's own ground, with its name. Nothing of the game
// imports it.
//
//   node tools/preview.mjs src/dev/preview_floor11.ts shots/f11_pieces.png 1014 1100 pieces
//     every piece and every frame of it, a wall piece on a house front of the ground's
//   node tools/preview.mjs src/dev/preview_floor11.ts shots/f11_one.png 600 400 one=<name>
//     one piece, three times as big

import { hushSetPieces } from '../art/act2_set';
import { gateWardPieces } from '../art/floor11';
import type { Piece } from '../art/floorkit';
import { GW_ZONE, gateWardLook, gateWardPaintFloor } from '../art/gateward';
import { P } from '../art/palette';
import { paintTerrain, pictureOf, terrainOf } from '../art/terrain';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { T_FLOOR, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import { THEME } from '../ui/ui';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'pieces';

// a patch of the Gate Ward to stand them on: one long lane, a house front along its far side
const W = 40;
const H = 40;
const tiles = new Uint8Array(W * H).fill(T_WALL);
for (let y = 10; y < 34; y++) for (let x = 2; x < 38; x++) tiles[y * W + x] = T_FLOOR;
const FLOOR = { depth: 11, seed: 11, w: W, h: H, tiles, cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
const LAND = { floor: FLOOR, zone: () => GW_ZONE.Street };
const T = terrainOf(gateWardPaintFloor(LAND, 'open'), gateWardLook(LAND, 'open'));

/** A panel of the ground: the setts, under the middle of the lane; or a house front, its foot at the panel's foot. */
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

const ALL: [string, Piece][] = [...gateWardPieces().map((p) => ['floor 11', p] as [string, Piece]), ...hushSetPieces().map((p) => ['the set', p] as [string, Piece])];

if (HASH === 'pieces') {
  cvs.width = 1014;
  // lay them out in rows: each piece a cell as wide as its frames need
  const cells: { piece: Piece; who: string; w: number; h: number }[] = ALL.map(([who, piece]) => {
    const frames = piece.frames ?? piece.left ?? [];
    const wall = !!piece.left;
    const fw = Math.max(...frames.map((f) => f.w * (f.density ?? 1)));
    const fh = Math.max(...frames.map((f) => f.h * (f.density ?? 1)));
    const n = wall ? frames.length * 2 : frames.length;
    return { piece, who, w: Math.max(150, Math.min(1000, n * (fw + 6) + 10)), h: fh + 34 };
  });
  const rows: { y: number; h: number; items: (typeof cells)[number][] }[] = [];
  let x = 0;
  let row: (typeof cells)[number][] = [];
  for (const c of cells) {
    if (x + c.w > 1014 && row.length) {
      rows.push({ y: 0, h: Math.max(...row.map((r) => r.h)), items: row });
      row = [];
      x = 0;
    }
    row.push(c);
    x += c.w + 6;
  }
  if (row.length) rows.push({ y: 0, h: Math.max(...row.map((r) => r.h)), items: row });
  let y = 4;
  for (const r of rows) {
    r.y = y;
    y += r.h + 8;
  }
  cvs.height = y;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, cvs.width, cvs.height);
  let seed = 0;
  for (const r of rows) {
    let cx = 0;
    for (const c of r.items) {
      const wall = !!c.piece.left;
      const frames = wall ? [...c.piece.left!, ...c.piece.right!] : c.piece.frames!;
      const bg = ground(c.w, r.h - 20, wall, seed++);
      g.drawImage(bg, cx, r.y + 20);
      const step = (c.w - 10) / frames.length;
      frames.forEach((f, k) => {
        const fx = cx + 5 + step * (k + 0.5);
        const fy = wall ? r.y + r.h - 14 : r.y + r.h - 12;
        if (!wall && c.piece.shadow) shadowAt(g, fx, fy, c.piece.shadow);
        drawSprite(g, f, fx, fy);
      });
      g.save();
      g.scale(2, 2);
      drawText(g, `${c.piece.name} (${c.who}: ${c.piece.kind})`, (cx + 3) / 2, (r.y + 4) / 2, THEME.text, { shadow: P.ink });
      g.restore();
      cx += c.w + 6;
    }
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
