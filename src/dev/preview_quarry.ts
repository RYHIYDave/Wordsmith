// Dev page: FLOOR 6, THE QUARRY, its ground painted by the game-ready painter (art/terrain.ts, the look
// art/quarry.ts) from a level's own tiles, for the owner to look at. Nothing of the game imports it.
//
// The tiles are laid here by hand in the shape of the planning chat's Quarry that he said yes to (13
// Oct, by 08:48: "Yes, this is it (Recommended)"; src/dev/preview_act1.ts, hash `quarry`): one great pit
// floor with the next opening broadly off it, narrow cuts out to the next terraces. Each tile whole, a
// half, or rock, whichever fits that shape best, as the game's map-maker would lay them (how the real
// Quarry is laid is the main chat's). The painter rounds and rags their edge.
//
//   node tools/preview.mjs src/dev/preview_quarry.ts shots/quarry_ground.png 1014 468 shot
//     one phone screen (the game's 507 x 234 game pixels at 2 picture pixels each), the knight and the
//     cult's overseers standing in it as the mock-up has them
//   node tools/preview.mjs src/dev/preview_quarry.ts shots/quarry_tiles.png 1014 468 tiles
//     the same with the tiles the game walks by drawn over it (white: whole, yellow: a half)
//   node tools/preview.mjs src/dev/preview_quarry.ts shots/quarry_close.png 1014 936 close
//     close-ups at four times (a far wall's benches, the bed, a cut's near face, the rim)
//   node tools/preview.mjs src/dev/preview_quarry.ts shots/quarry_cost.png 600 200 cost
//     what painting it costs, a piece of 256 x 256 picture pixels at a time

import { makeDaggerCultistArt3 } from '../art/cultists';
import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { QUARRY_LOOK } from '../art/quarry';
import { HHP, HWP, TK, paintTerrain, pictureOf, terrainOf, worldOf } from '../art/terrain';
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
/** The world place under a pixel of the mock-up's panel, in this page's world. */
const at = (px: number, py: number): [number, number] => {
  const a = (px - OX) / HWP;
  const b = (py - OY) / HHP;
  return [(a + b) / 2 + D, (b - a) / 2 + D];
};
type Shape = (x: number, y: number) => boolean;
const ellipse = (cx: number, cy: number, rx: number, ry: number, rot = 0): Shape => {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  return (x, y) => {
    const u = ((x - cx) * c + (y - cy) * s) / rx;
    const v = (-(x - cx) * s + (y - cy) * c) / ry;
    return u * u + v * v < 1;
  };
};
const area = (px: number, py: number, rx: number, ry: number, rot = 0): Shape => {
  const [x, y] = at(px, py);
  return ellipse(x, y, rx, ry, rot);
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

/** THE QUARRY'S SHAPE: the mock-up's qShotGround, as he said yes to it. */
const QUARRY_SHAPE = union(
  area(480, 290, 6.8, 5.4, 0.2),
  area(860, 150, 3.7, 2.7, -0.2),
  path([[560, 230], [680, 196], [800, 166]], 2.6),
  path([[300, 330], [220, 382], [150, 440], [110, 480]], 1.05),
  path([[340, 170], [270, 120], [210, 70], [180, 20]], 1.0),
);

/** Lay the tiles of a shape: each whole, one of the four halves, or rock, whichever is least wrong. */
function layTiles(shape: Shape, w: number, h: number): Floor {
  const tiles = new Uint8Array(w * h).fill(T_WALL);
  const cut = new Uint8Array(w * h);
  // the floor half of each cut, as the game names the WALL half
  const options: [number, (u: number, v: number) => boolean][] = [
    [-1, () => false],
    [0, () => true],
    [CUT_RIGHT, (u, v) => v > u], // floor to the left: the wall is the right half
    [CUT_LEFT, (u, v) => u > v],
    [CUT_NEAR, (u, v) => u + v < 1], // floor up the screen: the wall is the near half
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
  return { depth: 6, seed: 6, w, h, tiles, cut, variant: new Uint8Array(w * h), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
}

const FLOOR = layTiles(QUARRY_SHAPE, 48, 48);
const T: Terrain = terrainOf(FLOOR, QUARRY_LOOK);
/** Where this page's panel lies in the world's picture: the mock-up's panel, moved D tiles. */
const VX = -OX;
const VY = -OY + 2 * D * HHP;

/** Paint the world's picture under the panel, in pieces of `piece` pixels (so that the seams are checked too). */
function paintPanel(g: CanvasRenderingContext2D, x0: number, y0: number, w: number, h: number, piece = 256): Uint8Array {
  const kinds = new Uint8Array(w * h);
  for (let py = 0; py < h; py += piece) {
    for (let px = 0; px < w; px += piece) {
      const pw = Math.min(piece, w - px);
      const ph = Math.min(piece, h - py);
      const p = paintTerrain(T, x0 + px, y0 + py, pw, ph);
      const img = new ImageData(p.rgba, pw, ph);
      g.putImageData(img, px, py);
      for (let r = 0; r < ph; r++) kinds.set(p.kind.subarray(r * pw, r * pw + pw), (py + r) * w + px);
    }
  }
  return kinds;
}

// ---------------------------------------------------------------------------------------------------
// The figures, as the game draws them, each with its soft shadow

const knight = spriteOf3(MOVES3.rear, 0, 'front');
const cultist = makeDaggerCultistArt3();
function standAt(g: CanvasRenderingContext2D, sp: Sprite, x: number, y: number, r: number): void {
  const [sx0, sy0] = pictureOf(x, y);
  const sx = sx0 - VX;
  const sy = sy0 - VY;
  g.fillStyle = 'rgba(25, 18, 40, 0.35)';
  g.beginPath();
  g.ellipse(sx, sy, r * 2, r * 0.9, 0, 0, Math.PI * 2);
  g.fill();
  const dens = sp.density ?? 1;
  g.drawImage(sp.img, sx - (sp.ax * 2) / dens, sy - (sp.ay * 2) / dens, (sp.img.width / dens) * 2, (sp.img.height / dens) * 2);
}

function nameAndMap(g: CanvasRenderingContext2D, hero: [number, number]): void {
  g.save();
  g.scale(2, 2);
  drawText(g, 'The Quarry', 4, 3, THEME.text, { shadow: P.ink });
  g.restore();
  const [mx, my, mw, mh] = [437 * 2 + 3, 4 * 2 + 3, 66 * 2 - 6, 46 * 2 - 6];
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
      if (tx >= 0 && ty >= 0 && tx < FLOOR.w && ty < FLOOR.h && FLOOR.tiles[ty * FLOOR.w + tx] === T_FLOOR) {
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

const cvs = document.createElement('canvas');
cvs.width = PW;
cvs.height = PH;
cvs.style.display = 'block';
const g = cvs.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;

const HERO = at(507, 240);
const FOES = [at(470, 296), at(860, 158), at(805, 186)];

if (HASH === 'shot' || HASH === 'tiles') {
  paintPanel(g, VX, VY, PW, PH);
  if (HASH === 'tiles') {
    // the tiles the game walks by, over the ground
    g.lineWidth = 1;
    for (let ty = 0; ty < FLOOR.h; ty++) {
      for (let tx = 0; tx < FLOOR.w; tx++) {
        const i = ty * FLOOR.w + tx;
        if (FLOOR.tiles[i] !== T_FLOOR) continue;
        const c = FLOOR.cut ? FLOOR.cut[i] : 0;
        const pts: [number, number][] = [[tx, ty], [tx + 1, ty], [tx + 1, ty + 1], [tx, ty + 1]];
        const corner = (k: number): [number, number] => {
          const [sx, sy] = pictureOf(pts[k][0], pts[k][1]);
          return [sx - VX + 0.5, sy - VY + 0.5];
        };
        // the floor half of a cut tile: its three corners
        const keep = c === CUT_FAR ? [1, 2, 3] : c === CUT_NEAR ? [0, 1, 3] : c === CUT_LEFT ? [0, 1, 2] : c === CUT_RIGHT ? [0, 2, 3] : [0, 1, 2, 3];
        g.strokeStyle = c ? 'rgba(255, 220, 90, 0.75)' : 'rgba(255, 255, 255, 0.45)';
        g.beginPath();
        keep.forEach((k, n) => {
          const [sx, sy] = corner(k);
          if (n) g.lineTo(sx, sy);
          else g.moveTo(sx, sy);
        });
        g.closePath();
        g.stroke();
      }
    }
  }
  for (const [x, y] of FOES) standAt(g, cultist.front.idle[0], x, y, 8);
  standAt(g, knight, HERO[0], HERO[1], 9);
  nameAndMap(g, HERO);
  show(cvs);
} else if (HASH === 'close') {
  // four close-ups, each a piece of the panel at four times, with what it is
  const spots: [string, number, number][] = [
    ['A far wall: benches, joints, drill marks, stains', 600, 90],
    ['The bed: slabs, a lifted slab, pick scars, dust, chips', 430, 300],
    ['A narrow cut: the near cliff\'s face in shadow', 175, 380],
    ['The caprock rim, the grass and rock of the tops', 470, 30],
  ];
  const tmp = document.createElement('canvas');
  const S = 4;
  const cw = Math.floor(PW / 2 / S);
  const ch = Math.floor((PH / 2 - 24) / S);
  tmp.width = cw;
  tmp.height = ch;
  const tg = tmp.getContext('2d') as CanvasRenderingContext2D;
  spots.forEach(([label, px, py], n) => {
    const p = paintTerrain(T, VX + px - (cw >> 1), VY + py - (ch >> 1), cw, ch);
    tg.putImageData(new ImageData(p.rgba, cw, ch), 0, 0);
    const ox = (n % 2) * (PW / 2);
    const oy = Math.floor(n / 2) * (PH / 2) + 24;
    g.drawImage(tmp, ox, oy, cw * S, ch * S);
    g.save();
    g.scale(2, 2);
    drawText(g, label, ox / 2 + 3, (oy - 22) / 2 + 2, THEME.text, { shadow: P.ink });
    g.restore();
  });
  show(cvs);
} else if (HASH === 'cost') {
  const t0 = performance.now();
  const t1 = performance.now();
  const field = t1 - t0;
  const runs: number[] = [];
  for (let k = 0; k < 8; k++) {
    const a = performance.now();
    paintTerrain(T, VX + (k % 4) * 256, VY + Math.floor(k / 4) * 256, 256, 256);
    runs.push(performance.now() - a);
  }
  const b = performance.now();
  terrainOf(FLOOR, QUARRY_LOOK);
  const fieldMs = performance.now() - b;
  runs.sort((x, y) => x - y);
  const line = `field ${fieldMs.toFixed(0)} ms; a piece of 256 x 256: ${runs.map((r) => r.toFixed(0)).join(', ')} ms`;
  console.log(line, field);
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, PW, PH);
  g.save();
  g.scale(2, 2);
  drawText(g, line, 4, 4, THEME.text, { shadow: P.ink });
  g.restore();
  show(cvs);
}

// (for the tests' eyes: what the panel shows where)
(window as unknown as { __quarry: unknown }).__quarry = { T, FLOOR, TK, worldOf };
