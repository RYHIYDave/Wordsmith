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
//   node tools/preview.mjs src/dev/preview_quarry.ts shots/quarry_dressed.png 1014 468 dressed
//     the phone screen with the Quarry's pieces (art/floor6.ts) set as the mock-up has them, the tops dressed
//   node tools/preview.mjs src/dev/preview_quarry.ts shots/quarry_pieces.png 1014 760 pieces
//     every piece so far, each on the Quarry's bed, at the game's size, with its name

import { makeDaggerCultistArt3 } from '../art/cultists';
import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { quarryPieces } from '../art/floor6';
import { QUARRY_LOOK } from '../art/quarry';
import { HHP, HWP, TK, clearOfFloor, fbm, paintTerrain, pictureOf, terrainOf, worldOf } from '../art/terrain';
import type { Terrain } from '../art/terrain';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { CUT_FAR, CUT_LEFT, CUT_NEAR, CUT_RIGHT, T_FLOOR, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import { THEME } from '../ui/ui';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'shot';
const PW = 1014;
const PH = HASH === 'close' ? 936 : HASH === 'cost' ? 200 : HASH === 'pieces' ? 960 : 468;

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
  drawAt(g, sp, sx, sy);
}
/** A sprite with its anchor at picture pixel (sx, sy) of the panel, at the panel's grain (two picture pixels to a game pixel). */
function drawAt(g: CanvasRenderingContext2D, sp: Sprite, sx: number, sy: number, alpha = 1): void {
  g.globalAlpha = alpha;
  g.drawImage(sp.img, Math.round(sx - sp.ax * 2), Math.round(sy - sp.ay * 2), sp.w * 2, sp.h * 2);
  g.globalAlpha = 1;
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

if (HASH === 'dressed') dressedShot();
else if (HASH === 'pieces') pieceSheet();

/** A piece by name and frame. */
function piece(name: string, frame = 0): Sprite {
  const pc = quarryPieces().find((q) => q.name === name);
  if (!pc || !pc.frames) throw new Error(`no piece ${name}`);
  return pc.frames[frame];
}

interface Stand {
  x: number;
  y: number;
  sp: Sprite;
  /** Drawn this many picture pixels up (it stands on a top). */
  lift?: number;
  /** A figure (the tall pieces are seen through while one is behind them). */
  figure?: boolean;
  tall?: boolean;
  shadow?: number;
}

/** THE QUARRY DRESSED: the pieces where the mock-up he said yes to has them, the tops dressed by its rule. */
function dressedShot(): void {
  const kinds = paintPanel(g, VX, VY, PW, PH);
  const stands: Stand[] = [];
  const onFloor = (px: number, py: number, name: string, frame = 0, tall = false): void => {
    const [x, y] = at(px, py);
    if (!T.ground(x, y)) console.warn('off the floor:', name, px, py);
    const pc = quarryPieces().find((q) => q.name === name);
    stands.push({ x, y, sp: piece(name, frame), tall, shadow: pc?.shadow });
  };
  // the rails along y through the passage to the other pit, over the whole floor tiles at the cart's column
  const [cx, cy] = at(700, 200);
  const tx = Math.floor(cx);
  const rail = piece('rails', 1);
  const whole = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < FLOOR.w && y < FLOOR.h && FLOOR.tiles[y * FLOOR.w + x] === T_FLOOR && !(FLOOR.cut && FLOOR.cut[y * FLOOR.w + x]);
  let y0 = Math.floor(cy);
  let y1 = Math.floor(cy);
  while (whole(tx, y0 - 1)) y0--;
  while (whole(tx, y1 + 1)) y1++;
  for (let ty = y0; ty <= y1; ty++) {
    const [sx, sy] = pictureOf(tx, ty);
    drawAt(g, ty === y0 ? piece('rails', 3) : rail, sx - VX, sy - VY);
  }
  stands.push({ x: tx + 0.5, y: Math.floor(cy) + 0.5, sp: piece('cart of rubble', 1), shadow: 0.42 });
  onFloor(420, 200, 'the great obelisk');
  onFloor(470, 232, 'splitting tools');
  onFloor(560, 300, 'the crane', 0, true);
  onFloor(300, 250, 'stacked blocks');
  onFloor(338, 268, 'cut block');
  onFloor(880, 170, 'block split from the bed');
  onFloor(640, 250, 'block marked to split');
  onFloor(255, 305, 'sledge on rollers');
  onFloor(610, 262, 'boulder', 1);
  onFloor(624, 272, 'boulder', 0);
  onFloor(380, 312, 'chippings', 1);
  onFloor(560, 168, 'chippings', 0);
  onFloor(470, 168, 'scaffolding', 0, true);
  // the tops, dressed: pines in groves, rocks, a stacked block, scaffolding; never over the floor
  const RISE = QUARRY_LOOK.rise;
  for (let gy = 4; gy < PH + 30; gy += 18) {
    for (let gx = 4; gx < PW; gx += 24) {
      const px = Math.round(gx + (hashOf(gx, gy, 1) - 0.5) * 18);
      const py = Math.round(gy + (hashOf(gx, gy, 2) - 0.5) * 12);
      const roll = hashOf(gx, gy, 3);
      const [wx, wy] = worldOf(VX + px, VY + py + RISE);
      const grove = fbm(wx * 0.35, wy * 0.35, 814);
      let sp: Sprite | null = null;
      let hw = 12;
      let h = 16;
      if (grove > 0.6 && roll < 0.4) {
        const k = hashOf(gx, gy, 4) < 0.33 ? 0 : hashOf(gx, gy, 4) < 0.7 ? 1 : 2;
        sp = piece('pine', k);
        hw = 30;
        h = sp.h * 2;
      } else if (roll < 0.045) {
        sp = piece('boulder', Math.floor(hashOf(gx, gy, 5) * 3));
        hw = 22;
        h = 30;
      } else if (roll < 0.05) {
        sp = piece('stacked blocks');
        hw = 34;
        h = 70;
      } else if (roll < 0.056) {
        sp = piece('scaffolding');
        hw = 40;
        h = 100;
      }
      if (!sp || !clearOfFloor(T, VX + px, VY + py, hw, h)) continue;
      stands.push({ x: wx, y: wy, sp, lift: RISE });
    }
  }
  for (const [x, y] of FOES) stands.push({ x, y, sp: cultist.front.idle[0], figure: true, shadow: 0.45 });
  stands.push({ x: HERO[0], y: HERO[1], sp: knight, figure: true, shadow: 0.5 });
  stands.sort((a, b) => a.x + a.y - (b.x + b.y));
  const figures = stands.filter((s) => s.figure);
  for (const s of stands) {
    const [sx0, sy0] = pictureOf(s.x, s.y);
    const sx = sx0 - VX;
    const sy = sy0 - VY - (s.lift ?? 0);
    if (s.shadow) {
      g.fillStyle = 'rgba(25, 18, 40, 0.32)';
      g.beginPath();
      g.ellipse(sx, sy, s.shadow * HWP * 1.1, s.shadow * HHP * 1.1, 0, 0, Math.PI * 2);
      g.fill();
    }
    // a tall thing seen through while someone stands behind it (the game's SEEN_THROUGH, 0.38)
    let alpha = 1;
    if (s.tall) {
      for (const f of figures) {
        if (f.x + f.y >= s.x + s.y) continue;
        const [fx, fy] = pictureOf(f.x, f.y);
        const ox = fx - VX;
        const oy = fy - VY;
        if (ox > sx - s.sp.ax * 2 && ox < sx - s.sp.ax * 2 + s.sp.w * 2 && oy < sy && oy > sy - s.sp.ay * 2) alpha = 0.38;
      }
    }
    drawAt(g, s.sp, sx, sy, alpha);
  }
  void kinds;
  nameAndMap(g, HERO);
  show(cvs);
}

/** Every piece so far, each on a patch of the bed, at the game's size, named. */
function pieceSheet(): void {
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, PW, PH);
  const all = quarryPieces().flatMap((pc) => (pc.frames ?? []).map((sp, i) => ({ name: (pc.frames!.length > 1 ? `${pc.name} ${i + 1}` : pc.name), sp, kind: pc.kind })));
  const COLS = 5;
  const CW = Math.floor(PW / COLS);
  const CH = 190;
  const bed = paintTerrain(T, VX + 300, VY + 240, CW - 6, CH - 22);
  const tmp = document.createElement('canvas');
  tmp.width = bed.w;
  tmp.height = bed.h;
  (tmp.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(bed.rgba, bed.w, bed.h), 0, 0);
  all.forEach((it, n) => {
    const ox = (n % COLS) * CW + 3;
    const oy = Math.floor(n / COLS) * CH + 2;
    g.drawImage(tmp, ox, oy + 18);
    const floorTile = it.kind === 'floor tile';
    const ax = ox + CW / 2;
    const ay = floorTile ? oy + 18 + (CH - 22) / 2 - 16 : oy + CH - 18;
    drawAt(g, it.sp, ax, ay);
    g.save();
    g.scale(2, 2);
    drawText(g, it.name, ox / 2 + 1, oy / 2 + 1, THEME.text, { shadow: P.ink });
    g.restore();
  });
  show(cvs);
}

function hashOf(x: number, y: number, k: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(k | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// (for the tests' eyes: what the panel shows where)
(window as unknown as { __quarry: unknown }).__quarry = { T, FLOOR, TK, worldOf };
