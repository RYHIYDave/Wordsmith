// Dev page: FLOOR 10, THE SUNKEN FEN, its ground painted by the game-ready painter (art/terrain.ts, the look
// art/fen.ts) from a level's own tiles, for the owner to look at. Nothing of the game imports it.
//
// The tiles are laid here by hand in the shape of the planning chat's Sunken Fen that he said yes to (13 Oct, by
// 07:40: "Yes, this is it (Recommended)"; src/dev/preview_act1.ts, hash `fen`, on mockup/act1-levels): mud islands
// in the dark water, boardwalks between them, and the sunken ruin, a ring of old paving round the Eye's deep pool.
// Each tile whole, a half, or not floor, whichever fits that shape best, as the game's map-maker would lay them (how
// the real fen is laid is the main chat's). The painter rounds and rags their edge.
//
//   node tools/preview.mjs src/dev/preview_fen.ts shots/fen_ground.png 1014 468 shot
//     one phone screen (the game's 507 x 234 game pixels at 2 picture pixels each), the knight on an island, three
//     of the cult on the ruin where the mock-up has them
//   node tools/preview.mjs src/dev/preview_fen.ts shots/fen_tiles.png 1014 468 tiles
//     the same with the tiles the game walks by drawn over it (white: whole, yellow: a half)
//   node tools/preview.mjs src/dev/preview_fen.ts shots/fen_close.png 1014 936 close
//     close-ups at four times (an island, its edge and the shallows, the ruin and the pool, the open water and its mist)
//   node tools/preview.mjs src/dev/preview_fen.ts shots/fen_cost.png 1014 200 cost
//     what painting it costs, a piece of 256 x 256 picture pixels at a time

import { makeDaggerCultistArt3 } from '../art/cultists';
import { fenLook } from '../art/fen';
import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { HHP, HWP, paintTerrain, pictureOf, terrainOf } from '../art/terrain';
import type { Terrain } from '../art/terrain';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { CUT_FAR, CUT_LEFT, CUT_NEAR, CUT_RIGHT, T_FLOOR, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import { THEME } from '../ui/ui';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'shot';
const PW = 1014;
const PH = HASH === 'close' ? 936 : HASH === 'cost' ? 200 : 468;

// ---------------------------------------------------------------------------------------------------
// The mock-up's shapes, in the mock-up's own world (its panel 1014 x 468, world (12, 12) at its middle),
// moved D tiles along x and y so that the tiles start at 0.

const D = 10;
const OX = 1014 / 2;
const OY = 468 / 2 - 24 * HHP;
const at = (px: number, py: number): [number, number] => {
  const a = (px - OX) / HWP;
  const b = (py - OY) / HHP;
  return [(a + b) / 2 + D, (b - a) / 2 + D];
};
type Shape = (x: number, y: number) => boolean;
const ellipseDist = (cx: number, cy: number, rx: number, ry: number, rot = 0) => {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  return (x: number, y: number): number => {
    const u = ((x - cx) * c + (y - cy) * s) / rx;
    const v = (-(x - cx) * s + (y - cy) * c) / ry;
    return Math.hypot(u, v);
  };
};
const area = (px: number, py: number, rx: number, ry: number, rot = 0): Shape => {
  const [x, y] = at(px, py);
  const d = ellipseDist(x, y, rx, ry, rot);
  return (xx, yy) => d(xx, yy) < 1;
};
const segDist = (x: number, y: number, ax: number, ay: number, bx: number, by: number): number => {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - ax - t * dx, y - ay - t * dy);
};
const path = (pts: number[][], w: number): Shape => {
  const P2 = pts.map(([px, py]) => at(px, py));
  return (x, y) => {
    let d = Infinity;
    for (let i = 0; i + 1 < P2.length; i++) d = Math.min(d, segDist(x, y, P2[i][0], P2[i][1], P2[i + 1][0], P2[i + 1][1]));
    return d < w / 2;
  };
};
const union = (...s: Shape[]): Shape => (x, y) => s.some((f) => f(x, y));

/** THE FEN'S SHAPE, the mock-up's `fenShotGround` as he said yes to it: its islands, the ruin's ring round the Eye's pool, its boardwalks. */
const POOL: [number, number] = [752, 262];
const [PCX, PCY] = at(POOL[0], POOL[1]);
const poolDist = ellipseDist(PCX, PCY, 1.95, 1.62);
const ring: Shape = (x, y) => ellipseDist(PCX, PCY, 3.5, 3.0)(x, y) < 1 && poolDist(x, y) >= 1;
const boards = union(
  path([[-40, 304], [150, 286], [300, 266], [440, 250]], 0.85),
  path([[560, 248], [640, 252]], 0.85),
  path([[470, 280], [400, 318], [320, 350]], 0.8),
  path([[860, 300], [920, 360]], 0.8),
);
const islands = union(area(500, 238, 1.7, 1.4, 0.2), area(250, 380, 2.2, 1.5, 0.5), area(940, 400, 1.7, 1.2, 0), area(590, 160, 1.0, 0.7, 0));
const FEN_SHAPE: Shape = (x, y) => islands(x, y) || ring(x, y) || boards(x, y);
const FEN_LOOK = fenLook({
  boards: (x, y) => boards(x, y) && !islands(x, y) && !ring(x, y),
  paved: ring,
  pool: (x, y) => poolDist(x, y) * 1.06,
});

/** Lay the tiles of a shape: each whole, one of the four halves, or not floor, whichever is least wrong. */
function layTiles(shape: Shape, w: number, h: number): Floor {
  const tiles = new Uint8Array(w * h).fill(T_WALL);
  const cut = new Uint8Array(w * h);
  const options: [number, (u: number, v: number) => boolean][] = [
    [-1, () => false],
    [0, () => true],
    [CUT_RIGHT, (u, v) => v > u],
    [CUT_LEFT, (u, v) => u > v],
    [CUT_NEAR, (u, v) => u + v < 1],
    [CUT_FAR, (u, v) => u + v > 1],
  ];
  const N = 8;
  for (let ty = 0; ty < h; ty++) {
    for (let tx = 0; tx < w; tx++) {
      let best = 0;
      let least = Infinity;
      options.forEach(([, inside], k) => {
        let wrong = 0;
        for (let a = 0; a < N; a++) {
          for (let b = 0; b < N; b++) {
            const u = (a + 0.5) / N;
            const v = (b + 0.5) / N;
            if (inside(u, v) !== shape(tx + u, ty + v)) wrong++;
          }
        }
        if (wrong < least - 0.5) {
          least = wrong;
          best = k;
        }
      });
      const c = options[best][0];
      if (c >= 0) {
        tiles[ty * w + tx] = T_FLOOR;
        cut[ty * w + tx] = c;
      }
    }
  }
  return { depth: 10, seed: 10, w, h, tiles, cut, variant: new Uint8Array(w * h), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
}

export const FEN_FLOOR = layTiles(FEN_SHAPE, 56, 56);
const T: Terrain = terrainOf(FEN_FLOOR, FEN_LOOK);
const VX = -OX;
const VY = -OY + 2 * D * HHP;

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

const knight = spriteOf3(MOVES3.rear, 0, 'front');
const cultist = makeDaggerCultistArt3();
function drawAt(g: CanvasRenderingContext2D, sp: Sprite, sx: number, sy: number): void {
  g.drawImage(sp.img, Math.round(sx - sp.ax * 2), Math.round(sy - sp.ay * 2), sp.w * 2, sp.h * 2);
}
function standAt(g: CanvasRenderingContext2D, sp: Sprite, x: number, y: number, r: number, dx = 0, dy = 0): void {
  const [sx0, sy0] = pictureOf(x, y);
  const sx = sx0 - VX - dx;
  const sy = sy0 - VY - dy;
  g.fillStyle = 'rgba(25, 18, 40, 0.35)';
  g.beginPath();
  g.ellipse(sx, sy, r * 2, r * 0.9, 0, 0, Math.PI * 2);
  g.fill();
  drawAt(g, sp, sx, sy);
}
function nameAndMap(g: CanvasRenderingContext2D, hero: [number, number]): void {
  g.save();
  g.scale(2, 2);
  drawText(g, 'The Sunken Fen', 4, 3, THEME.text, { shadow: P.ink });
  g.restore();
  const [mx, my, mw, mh] = [437 * 2 + 3, 4 * 2 + 3, 66 * 2 - 6, 46 * 2 - 6];
  g.fillStyle = '#100e22';
  g.fillRect(mx, my, mw, mh);
  const k = 0.11;
  for (let yy = 0; yy < mh; yy += 2) {
    for (let xx = 0; xx < mw; xx += 2) {
      const a = (xx - mw / 2) / (HWP * k);
      const b = (yy - mh / 2) / (HHP * k);
      const tx = Math.floor(hero[0] + (a + b) / 2);
      const ty = Math.floor(hero[1] + (b - a) / 2);
      if (tx >= 0 && ty >= 0 && tx < FEN_FLOOR.w && ty < FEN_FLOOR.h && FEN_FLOOR.tiles[ty * FEN_FLOOR.w + tx] === T_FLOOR) {
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
function label(g: CanvasRenderingContext2D, text: string, x: number, y: number): void {
  g.save();
  g.scale(2, 2);
  drawText(g, text, Math.round(x / 2), Math.round(y / 2), THEME.text, { shadow: P.ink });
  g.restore();
}

const cvs = document.createElement('canvas');
cvs.width = PW;
cvs.height = PH;
cvs.style.display = 'block';
const g = cvs.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;

/** Where the mock-up has the knight, and the cult chanting on the ruin. */
const HERO = at(507, 236);
const FOES = [at(648, 250), at(718, 304), at(832, 242)];

if (HASH === 'shot' || HASH === 'tiles') {
  paintPanel(g, VX, VY, PW, PH);
  if (HASH === 'tiles') {
    for (let ty = 0; ty < FEN_FLOOR.h; ty++) {
      for (let tx = 0; tx < FEN_FLOOR.w; tx++) {
        if (FEN_FLOOR.tiles[ty * FEN_FLOOR.w + tx] !== T_FLOOR) continue;
        const half = (FEN_FLOOR.cut?.[ty * FEN_FLOOR.w + tx] ?? 0) !== 0;
        const [cx, cy] = pictureOf(tx + 0.5, ty + 0.5);
        const sx = cx - VX;
        const sy = cy - VY;
        g.strokeStyle = half ? 'rgba(255, 220, 90, 0.8)' : 'rgba(255, 255, 255, 0.45)';
        g.beginPath();
        g.moveTo(sx, sy - HHP);
        g.lineTo(sx + HWP, sy);
        g.lineTo(sx, sy + HHP);
        g.lineTo(sx - HWP, sy);
        g.closePath();
        g.stroke();
      }
    }
  }
  standAt(g, knight, HERO[0], HERO[1], 13);
  for (const f of FOES) standAt(g, cultist.front.idle[0], f[0], f[1], 12);
  nameAndMap(g, HERO);
  show(cvs);
} else if (HASH === 'close') {
  // four close-ups at four times, each a patch of the panel 250 x 110 picture pixels
  const spots: [string, number, number][] = [
    ['an island: peat, moss, puddles, sedge, roots', 250, 380],
    ['its edge, the shallows, reeds standing in them', 560, 175],
    ['the ruin\'s old paving, and the Eye\'s pool', 740, 240],
    ['the open water: duckweed, lily pads, scum, mist', 140, 180],
  ];
  const tmp = document.createElement('canvas');
  tmp.width = 250;
  tmp.height = 110;
  const tg = tmp.getContext('2d') as CanvasRenderingContext2D;
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, PW, PH);
  spots.forEach(([name, cx, cy], i) => {
    const p = paintTerrain(T, VX + cx - 125, VY + cy - 55, 250, 110);
    tg.putImageData(new ImageData(p.rgba, 250, 110), 0, 0);
    const ox = (i % 2) * 507 + 3;
    const oy = Math.floor(i / 2) * 468 + 30;
    g.drawImage(tmp, 0, 0, 125, 110, ox, oy, 500, 440);
    label(g, name, ox + 4, oy - 26);
  });
  show(cvs);
} else if (HASH === 'cost') {
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, PW, PH);
  const times: number[] = [];
  for (let i = 0; i < 8; i++) {
    const t0 = performance.now();
    paintTerrain(T, VX + (i % 4) * 256, VY + Math.floor(i / 4) * 212, 256, 256);
    times.push(performance.now() - t0);
  }
  label(g, `a piece of 256 x 256 picture pixels: ${Math.min(...times).toFixed(0)} to ${Math.max(...times).toFixed(0)} ms`, 10, 20);
  show(cvs);
}
