// Dev page: FLOOR 15, THE GREAT LIBRARY, its ground painted by the game-ready painter (art/terrain.ts, the look
// art/library.ts) from a level's own tiles, for the owner to look at. Nothing of the game imports it.
//
// The tiles are laid here by hand, as the game's map-maker might lay a stretch of the library (how the real floor is
// laid is the main chat's): a long hall along x; off it to the north the stacks (rows of shelves a tile thick, narrow
// aisles between) and the Reading Room; to the south the scriptorium and more stacks; each through a doorway.
//
//   node tools/preview.mjs src/dev/preview_library.ts shots/lb_shot.png 1014 468 shot
//     one phone screen (the game's 507 x 234 game pixels at 2 picture pixels each), the knight and the Hush's people in
//     it, the dungeon's dark as the game lays it
//   node tools/preview.mjs src/dev/preview_library.ts shots/lb_bare.png 1014 468 bare
//     the same, no dark
//   node tools/preview.mjs src/dev/preview_library.ts shots/lb_stacks.png 1014 468 stacks
//     the stacks, down an aisle
//   node tools/preview.mjs src/dev/preview_library.ts shots/lb_reading.png 1014 468 reading
//     the Reading Room
//   node tools/preview.mjs src/dev/preview_library.ts shots/lb_scriptorium.png 1014 468 scriptorium
//     the scriptorium
//   node tools/preview.mjs src/dev/preview_library.ts shots/lb_whole.png 2000 1150 whole
//     the whole stretch at once, no dark
//   node tools/preview.mjs src/dev/preview_library.ts shots/lb_tiles.png 1014 468 tiles
//     the shot with the tiles the game walks by drawn over it
//   node tools/preview.mjs src/dev/preview_library.ts shots/lb_close.png 1014 664 close
//     close-ups at three times
//   node tools/preview.mjs src/dev/preview_library.ts shots/lb_cost.png 600 200 cost
//     what painting it costs, a piece of 256 x 256 picture pixels at a time

import { HUSHED_PORTER, makeHushedArt3 } from '../art/hushed_moves';
import { makeScribeArt3 } from '../art/scribes_moves';
import { LB_ZONE, greatLibraryLook } from '../art/library';
import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { HHP, HWP, paintTerrain, pictureOf, terrainOf } from '../art/terrain';
import type { Terrain } from '../art/terrain';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { T_FLOOR, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import { THEME } from '../ui/ui';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'shot';
const PW = HASH === 'cost' ? 600 : HASH === 'whole' ? 2000 : 1014;
const PH = HASH === 'close' ? 664 : HASH === 'cost' ? 200 : HASH === 'whole' ? 1150 : 468;

// ---------------------------------------------------------------------------------------------------
// THE STRETCH OF THE GREAT LIBRARY, in tiles

const W = 64;
const H = 52;
type Rect = [number, number, number, number]; // x0, y0, x1, y1 (x1, y1 not in it)
const inR = (r: Rect, x: number, y: number): boolean => x >= r[0] && x < r[2] && y >= r[1] && y < r[3];

/** The rooms and the hall, each with its kind; the doorways between them (the hall's marble); the stacks' rows of shelves (walls). */
const ROOMS: [Rect, number][] = [
  [[2, 26, 60, 31], LB_ZONE.Hall],
  [[4, 8, 26, 24], LB_ZONE.Stacks],
  [[30, 4, 56, 24], LB_ZONE.Reading],
  [[6, 33, 22, 46], LB_ZONE.Scriptorium],
  [[26, 33, 50, 44], LB_ZONE.Stacks],
];
const DOORS: Rect[] = [
  [13, 24, 15, 26],
  [41, 24, 45, 26],
  [12, 31, 14, 33],
  [36, 31, 38, 33],
];
/** The stacks' shelves, free-standing rows a tile thick, the aisles between them two tiles across. */
const SHELVES: Rect[] = [
  [6, 11, 24, 12],
  [6, 14, 24, 15],
  [6, 17, 11, 18],
  [13, 17, 24, 18],
  [6, 20, 24, 21],
  [28, 36, 48, 37],
  [28, 39, 36, 40],
  [38, 39, 48, 40],
];

const tiles = new Uint8Array(W * H).fill(T_WALL);
const zone = new Uint8Array(W * H).fill(LB_ZONE.Hall);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    for (const [r, z] of ROOMS) {
      if (inR(r, x, y)) {
        tiles[i] = T_FLOOR;
        zone[i] = z;
      }
    }
    if (DOORS.some((r) => inR(r, x, y))) {
      tiles[i] = T_FLOOR;
      zone[i] = LB_ZONE.Hall;
    }
    if (SHELVES.some((r) => inR(r, x, y))) tiles[i] = T_WALL;
  }
}
const FLOOR = { depth: 15, seed: 15, w: W, h: H, tiles, cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
const LAND = { floor: FLOOR, zone: (tx: number, ty: number) => zone[ty * W + tx] };
const LOOK = greatLibraryLook(LAND);
const T: Terrain = terrainOf(FLOOR, LOOK);

// the camera: whoever it follows in the middle of the screen
const HERO: [number, number] = [21.0, 28.4];
let VX = 0;
let VY = 0;
function camOn(x: number, y: number): void {
  const [cx, cy] = pictureOf(x, y);
  VX = Math.round(cx - PW / 2);
  VY = Math.round(cy - (PH * 250) / 468);
}
camOn(HERO[0], HERO[1]);

/** Paint the world's picture under the panel, in pieces of `piece` pixels (so that the seams are checked too). */
function paintPanel(g: CanvasRenderingContext2D, x0: number, y0: number, w: number, h: number, piece = 256): void {
  for (let py = 0; py < h; py += piece) {
    for (let px = 0; px < w; px += piece) {
      const pw = Math.min(piece, w - px);
      const ph = Math.min(piece, h - py);
      const p = paintTerrain(T, x0 + px, y0 + py, pw, ph);
      g.putImageData(new ImageData(p.rgba, pw, ph), px, py);
    }
  }
}

// ---------------------------------------------------------------------------------------------------
// The figures, as the game draws them, each with its soft shadow

const knight = spriteOf3(MOVES3.rear, 0, 'front');
const porter = makeHushedArt3(HUSHED_PORTER).front.idle[0];
const scribe = makeScribeArt3().front.idle[0];
function drawAt(g: CanvasRenderingContext2D, sp: Sprite, sx: number, sy: number): void {
  g.drawImage(sp.img, Math.round(sx - sp.ax * 2), Math.round(sy - sp.ay * 2), sp.w * 2, sp.h * 2);
}
function standAt(g: CanvasRenderingContext2D, sp: Sprite, x: number, y: number, r: number): void {
  const [sx0, sy0] = pictureOf(x, y);
  const sx = sx0 - VX;
  const sy = sy0 - VY;
  g.fillStyle = 'rgba(8, 6, 16, 0.45)';
  g.beginPath();
  g.ellipse(sx, sy, r * 2, r * 0.9, 0, 0, Math.PI * 2);
  g.fill();
  drawAt(g, sp, sx, sy);
}

/**
 * THE DUNGEON'S DARK as the game lays it (render.ts: FAR_DARK 0.88 over all, the hero's wide gentle pool and his
 * bright one taken out of it, the vignette), at two picture pixels to a game pixel.
 */
function dark(g: CanvasRenderingContext2D, hero: [number, number]): void {
  const c = document.createElement('canvas');
  c.width = PW;
  c.height = PH;
  const d = c.getContext('2d') as CanvasRenderingContext2D;
  d.fillStyle = 'rgba(6,4,14,0.88)';
  d.fillRect(0, 0, PW, PH);
  d.globalCompositeOperation = 'destination-out';
  const [hx0, hy0] = pictureOf(hero[0], hero[1]);
  const hx = hx0 - VX;
  const hy = hy0 - VY - 16;
  const spot = (r: number, strength: number): void => {
    d.save();
    d.translate(hx, hy);
    d.scale(1, 0.62);
    const grd = d.createRadialGradient(0, 0, 0, 0, 0, r);
    grd.addColorStop(0, `rgba(0,0,0,${strength})`);
    grd.addColorStop(0.5, `rgba(0,0,0,${0.7 * strength})`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    d.fillStyle = grd;
    d.fillRect(-r, -r, 2 * r, 2 * r);
    d.restore();
  };
  spot(380 * 2, 0.36);
  spot(165 * 2, 1);
  g.drawImage(c, 0, 0);
  const grd = g.createRadialGradient(PW / 2, PH / 2, 0.5 * Math.hypot(PW, PH) / 2 / Math.SQRT2, PW / 2, PH / 2, Math.hypot(PW, PH) / 2);
  grd.addColorStop(0, 'rgba(6,4,14,0)');
  grd.addColorStop(1, 'rgba(6,4,14,0.62)');
  g.fillStyle = grd;
  g.fillRect(0, 0, PW, PH);
}

function nameAndMap(g: CanvasRenderingContext2D, hero: [number, number] = HERO): void {
  g.save();
  g.scale(2, 2);
  drawText(g, 'The Great Library', 4, 3, THEME.text, { shadow: P.ink });
  g.restore();
  const [mx, my, mw, mh] = [PW - 137, 4 * 2 + 3, 66 * 2 - 6, 46 * 2 - 6];
  g.fillStyle = '#100e22';
  g.fillRect(mx, my, mw, mh);
  const k = 0.11;
  for (let yy = 0; yy < mh; yy += 2) {
    for (let xx = 0; xx < mw; xx += 2) {
      const a = (xx - mw / 2) / (HWP * k);
      const b = (yy - mh / 2) / (HHP * k);
      const x = hero[0] + (a + b) / 2;
      const y = hero[1] + (b - a) / 2;
      const tx = Math.floor(x);
      const ty = Math.floor(y);
      if (tx >= 0 && ty >= 0 && tx < W && ty < H && tiles[ty * W + tx] === T_FLOOR) {
        g.fillStyle = '#5b55c7';
        g.fillRect(mx + xx, my + yy, 2, 2);
      }
    }
  }
  g.fillStyle = '#28dcf0';
  g.fillRect(mx + mw / 2 - 2, my + mh / 2 - 2, 4, 4);
}

function show(cvs: HTMLCanvasElement): void {
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

function drawTiles(g: CanvasRenderingContext2D): void {
  g.lineWidth = 1;
  const COL = ['rgba(255, 255, 255, 0.4)', 'rgba(255, 220, 90, 0.6)', 'rgba(140, 255, 140, 0.6)', 'rgba(255, 140, 90, 0.6)'];
  for (let ty = 0; ty < H; ty++) {
    for (let tx = 0; tx < W; tx++) {
      const i = ty * W + tx;
      if (tiles[i] !== T_FLOOR) continue;
      const pts: [number, number][] = [[tx, ty], [tx + 1, ty], [tx + 1, ty + 1], [tx, ty + 1]];
      g.strokeStyle = COL[zone[i]];
      g.beginPath();
      pts.forEach(([x, y], n) => {
        const [sx, sy] = pictureOf(x, y);
        if (n) g.lineTo(sx - VX + 0.5, sy - VY + 0.5);
        else g.moveTo(sx - VX + 0.5, sy - VY + 0.5);
      });
      g.closePath();
      g.stroke();
    }
  }
}

const cvs = document.createElement('canvas');
cvs.width = PW;
cvs.height = PH;
cvs.style.display = 'block';
const g = cvs.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;

/** Who stands about: the hero in the hall; the Hushed in a doorway and down the hall; a scribe of the Order. */
const FOES: [Sprite, number, number, number][] = [
  [porter, 14.2, 24.8, 8],
  [porter, 27.0, 28.6, 8],
  [scribe, 31.4, 27.6, 8],
];

function drawScene(g: CanvasRenderingContext2D, hero: [number, number], cam: [number, number], opts: { dark?: boolean; tiles?: boolean }): void {
  camOn(cam[0], cam[1]);
  paintPanel(g, VX, VY, PW, PH);
  if (opts.tiles) drawTiles(g);
  const figs: [Sprite, number, number, number][] = [...FOES, [knight, hero[0], hero[1], 9]];
  figs.sort((a, b) => a[1] + a[2] - (b[1] + b[2]));
  for (const [sp, x, y, r] of figs) standAt(g, sp, x, y, r);
  if (opts.dark) dark(g, hero);
  nameAndMap(g, hero);
}

if (HASH === 'shot' || HASH === 'bare' || HASH === 'tiles') {
  drawScene(g, HERO, HERO, { dark: HASH === 'shot', tiles: HASH === 'tiles' });
  show(cvs);
} else if (HASH === 'stacks') {
  const hero: [number, number] = [14.0, 16.0];
  drawScene(g, hero, [14.5, 15.5], { dark: true });
  show(cvs);
} else if (HASH === 'reading') {
  const hero: [number, number] = [43.0, 19.0];
  drawScene(g, hero, [43.0, 14.5], { dark: true });
  show(cvs);
} else if (HASH === 'scriptorium') {
  const hero: [number, number] = [13.0, 37.0];
  drawScene(g, hero, [13.5, 39.5], { dark: true });
  show(cvs);
} else if (HASH === 'whole') {
  drawScene(g, HERO, [30, 26], {});
  show(cvs);
} else if (HASH === 'close') {
  camOn(HERO[0], HERO[1]);
  // (each close-up's middle, in the world; a wall's raised as it stands)
  const at = (x: number, y: number, up = 0): [number, number] => {
    const [sx, sy] = pictureOf(x, y);
    return [sx - VX - 55, sy - VY - up - 50];
  };
  const spots: [string, number, number][] = [
    ['The stacks', ...at(16.0, 13.0)],
    ['The hall\'s marble', ...at(24.0, 28.5)],
    ['The Reading Room\'s parquet', ...at(32.0, 12.0)],
    ['The great carpet', ...at(44.0, 15.0)],
    ['The scriptorium', ...at(14.0, 40.0)],
    ['A far wall', ...at(19.0, 26.0, 45)],
  ];
  const SC = 3;
  const cw = 330;
  const ch = 300;
  spots.forEach(([name, sx, sy], n) => {
    const cx = (n % 3) * (cw + 8);
    const cy = Math.floor(n / 3) * (ch + 30) + 24;
    const w = Math.floor(cw / SC);
    const h = Math.floor(ch / SC);
    const p = paintTerrain(T, VX + sx, VY + sy, w, h);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    (c.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(p.rgba, w, h), 0, 0);
    g.drawImage(c, cx, cy, w * SC, h * SC);
    g.save();
    g.scale(2, 2);
    drawText(g, name, cx / 2, (cy - 20) / 2, THEME.text, { shadow: P.ink });
    g.restore();
  });
  show(cvs);
} else if (HASH === 'cost') {
  const N = 6;
  const t0 = performance.now();
  for (let k = 0; k < N; k++) paintTerrain(T, VX + k * 256, VY, 256, 256);
  const ms = (performance.now() - t0) / N;
  const t1 = performance.now();
  terrainOf(FLOOR, greatLibraryLook(LAND));
  const fieldMs = performance.now() - t1;
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, PW, PH);
  g.save();
  g.scale(2, 2);
  drawText(g, `a piece 256 x 256: ${ms.toFixed(1)} ms`, 6, 6, THEME.text, { shadow: P.ink });
  drawText(g, `the field, a floor ${W} x ${H}: ${fieldMs.toFixed(1)} ms`, 6, 20, THEME.text, { shadow: P.ink });
  g.restore();
  show(cvs);
}
