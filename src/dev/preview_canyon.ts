// Dev page: FLOOR 8, ECHO CANYON, its ground painted by the game-ready painter (art/terrain.ts, the look
// art/canyon.ts) from a level's own tiles, for the owner to look at. Nothing of the game imports it.
//
// The tiles are laid here by hand in the shape of the planning chat's Echo Canyon that he said yes to (12 Oct,
// by 20:35: "Yes, this is it (Recommended)"; src/dev/preview_act1.ts, hash `shot`): the canyon running up the
// screen at the top and the bottom and turning across it in the middle, where the near wall is cut away and
// its shadow lies on the sand. Each tile whole, a half, or rock, whichever fits that shape best, as the game's
// map-maker would lay them (how the real Echo Canyon is laid is the main chat's). The painter rounds and rags
// their edge.
//
//   node tools/preview.mjs src/dev/preview_canyon.ts shots/canyon_ground.png 1014 468 shot
//     one phone screen (the game's 507 x 234 game pixels at 2 picture pixels each), the knight and three of the
//     cult standing in it where the mock-up has them
//   node tools/preview.mjs src/dev/preview_canyon.ts shots/canyon_tiles.png 1014 468 tiles
//     the same with the tiles the game walks by drawn over it (white: whole, yellow: a half)
//   node tools/preview.mjs src/dev/preview_canyon.ts shots/canyon_kinds.png 1014 468 kinds
//     what each pixel is (floor white, far wall orange, top green, near top cut away dark green, near face blue)
//   node tools/preview.mjs src/dev/preview_canyon.ts shots/canyon_close.png 1014 936 close
//     close-ups at four times (a far wall's beds, the riverbed, the near face and its shadow, the mesa's rim)
//   node tools/preview.mjs src/dev/preview_canyon.ts shots/canyon_cost.png 1014 200 cost
//     what painting it costs, a piece of 256 x 256 picture pixels at a time
//   node tools/preview.mjs src/dev/preview_canyon.ts shots/canyon_dressed.png 1014 468 dressed
//     the phone screen with the canyon's pieces (art/floor8.ts) where the mock-up has them, the tops dressed
//   node tools/preview.mjs src/dev/preview_canyon.ts shots/canyon_pieces.png 1014 1610 pieces
//     every piece so far, each on the canyon's own ground, at the game's size, with its name

import { cultBanner, pinkBrazier } from '../art/act1_cult';
import { makeDaggerCultistArt3 } from '../art/cultists';
import { canyonPieces } from '../art/floor8';
import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { CANYON_LOOK } from '../art/canyon';
import { HHP, HWP, TK, clearOfFloor, fbm, paintTerrain, pictureOf, terrainOf, worldOf } from '../art/terrain';
import type { Terrain } from '../art/terrain';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { CUT_FAR, CUT_LEFT, CUT_NEAR, CUT_RIGHT, T_FLOOR, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import { THEME } from '../ui/ui';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'shot';
const PW = 1014;
const PH = HASH === 'close' ? 936 : HASH === 'cost' ? 200 : HASH === 'pieces' ? 1610 : 468;

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

/** ECHO CANYON'S SHAPE: the mock-up's `shotGround`, as he said yes to it (its road's line, 3.7 tiles wide, and the bay at the turn). */
const CANYON_SHAPE = union(
  path([[300, -80], [330, 30], [365, 120], [425, 186], [507, 236], [598, 266], [668, 300], [712, 380], [736, 540]], 3.7),
  area(560, 250, 1.6, 1.2, 0.3),
);

/** Lay the tiles of a shape: each whole, one of the four halves, or rock, whichever is least wrong. */
function layTiles(shape: Shape, w: number, h: number): Floor {
  const tiles = new Uint8Array(w * h).fill(T_WALL);
  const cut = new Uint8Array(w * h);
  // the floor half of each cut, as the game names the WALL half
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
  return { depth: 8, seed: 8, w, h, tiles, cut, variant: new Uint8Array(w * h), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
}

export const CANYON_FLOOR = layTiles(CANYON_SHAPE, 48, 48);
const T: Terrain = terrainOf(CANYON_FLOOR, CANYON_LOOK);
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
      g.putImageData(new ImageData(p.rgba, pw, ph), px, py);
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
  drawText(g, 'Echo Canyon', 4, 3, THEME.text, { shadow: P.ink });
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
      if (tx >= 0 && ty >= 0 && tx < CANYON_FLOOR.w && ty < CANYON_FLOOR.h && CANYON_FLOOR.tiles[ty * CANYON_FLOOR.w + tx] === T_FLOOR) {
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

/** Where the mock-up has the knight, and the cult coming down the road toward him. */
const HERO = at(507, 246);
const FOES = [at(372, 92), at(402, 150), at(622, 262)];

if (HASH === 'shot' || HASH === 'tiles' || HASH === 'kinds') {
  const kinds = paintPanel(g, VX, VY, PW, PH);
  if (HASH === 'kinds') {
    const img = g.getImageData(0, 0, PW, PH);
    const KC: Record<number, [number, number, number]> = {
      [TK.Floor]: [235, 235, 235],
      [TK.Face]: [230, 140, 60],
      [TK.Top]: [70, 150, 70],
      [TK.Cut]: [30, 80, 40],
      [TK.Near]: [60, 90, 200],
    };
    for (let i = 0; i < kinds.length; i++) {
      const c = KC[kinds[i]] ?? [0, 0, 0];
      img.data.set([c[0], c[1], c[2], 255], i * 4);
    }
    g.putImageData(img, 0, 0);
  }
  if (HASH === 'tiles' || HASH === 'kinds') {
    // the tiles the game walks by, over the ground
    g.lineWidth = 1;
    for (let ty = 0; ty < CANYON_FLOOR.h; ty++) {
      for (let tx = 0; tx < CANYON_FLOOR.w; tx++) {
        const i = ty * CANYON_FLOOR.w + tx;
        if (CANYON_FLOOR.tiles[i] !== T_FLOOR) continue;
        const c = CANYON_FLOOR.cut ? CANYON_FLOOR.cut[i] : 0;
        const pts: [number, number][] = [[tx, ty], [tx + 1, ty], [tx + 1, ty + 1], [tx, ty + 1]];
        const corner = (k: number): [number, number] => {
          const [sx, sy] = pictureOf(pts[k][0], pts[k][1]);
          return [sx - VX + 0.5, sy - VY + 0.5];
        };
        const keep = c === CUT_FAR ? [1, 2, 3] : c === CUT_NEAR ? [0, 1, 3] : c === CUT_LEFT ? [0, 1, 2] : c === CUT_RIGHT ? [0, 2, 3] : [0, 1, 2, 3];
        g.strokeStyle = c ? 'rgba(255, 220, 90, 0.75)' : HASH === 'kinds' ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.45)';
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
  if (HASH !== 'kinds') {
    for (const [x, y] of FOES) standAt(g, cultist.front.idle[0], x, y, 8);
    standAt(g, knight, HERO[0], HERO[1], 9);
  }
  nameAndMap(g, HERO);
  show(cvs);
} else if (HASH === 'close') {
  // four close-ups, each a piece of the panel at four times, with what it is
  const spots: [string, number, number][] = [
    ['A far wall: its beds, ledges, joints, varnish', 690, 140],
    ['The riverbed: sand, ripples, stones, mud', 700, 400],
    ['Where it turns: the near face, its shadow', 330, 150],
    ['The mesa: its rim of caprock, earth, scrub', 150, 330],
  ];
  const tmp = document.createElement('canvas');
  const S = 4;
  const cw = Math.floor(PW / 2 / S);
  const ch = Math.floor((PH / 2 - 24) / S);
  tmp.width = cw;
  tmp.height = ch;
  const tg = tmp.getContext('2d') as CanvasRenderingContext2D;
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, PW, PH);
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
  const runs: number[] = [];
  for (let k = 0; k < 8; k++) {
    const a = performance.now();
    paintTerrain(T, VX + (k % 4) * 256, VY + Math.floor(k / 4) * 256, 256, 256);
    runs.push(performance.now() - a);
  }
  const b = performance.now();
  terrainOf(CANYON_FLOOR, CANYON_LOOK);
  const fieldMs = performance.now() - b;
  runs.sort((x, y) => x - y);
  const line = `field ${fieldMs.toFixed(0)} ms; a piece of 256 x 256: ${runs.map((r) => r.toFixed(0)).join(', ')} ms`;
  console.log(line);
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, PW, PH);
  g.save();
  g.scale(2, 2);
  drawText(g, line, 4, 4, THEME.text, { shadow: P.ink });
  g.restore();
  show(cvs);
}

// ---------------------------------------------------------------------------------------------------
// THE PIECES (art/floor8.ts): a sheet of them, and the screen dressed with them

function pc(name: string, frame = 0): Sprite {
  const q = canyonPieces().find((x) => x.name === name);
  if (!q || !q.frames) throw new Error(`no piece ${name}`);
  return q.frames[Math.min(frame, q.frames.length - 1)];
}
const shadowOf = (name: string): number | undefined => canyonPieces().find((x) => x.name === name)?.shadow;

function hashOf(x: number, y: number, k: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(k | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** A patch of the canyon's own ground for a piece to stand on: the riverbed, or a wall rising from it. */
function patch(w: number, h: number, wall: boolean, foot = 40): HTMLCanvasElement {
  const L = CANYON_LOOK;
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = 5200 + x;
      const py = 3600 + y;
      const [wx, wy] = worldOf(px, py);
      const up = h - foot - y;
      const c = wall && up > 0 ? L.face(0.6, up, px, py, wx, wy) : L.floor(wx, wy, px, py, 1);
      const t = wall && up <= 0 && up > -7 ? (up > -4 ? L.foot[0] : L.foot[1]) : 0;
      const o = (y * w + x) * 4;
      out[o] = c[0] * (1 - t);
      out[o + 1] = c[1] * (1 - t);
      out[o + 2] = c[2] * (1 - t);
      out[o + 3] = 255;
    }
  }
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  (cv.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(out, w, h), 0, 0);
  return cv;
}

/** Every piece of Echo Canyon's so far, at the game's size, each on its ground, named: what stands on the wall against a piece of the wall. */
function pieceSheet(): void {
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, PW, PH);
  const all = canyonPieces().flatMap((q) => (q.frames ?? []).map((sp, i) => ({ name: q.frames!.length > 1 ? `${q.name} ${i + 1}` : q.name, sp, kind: q.kind })));
  const COLS = 4;
  const CW = Math.floor(PW / COLS);
  const CH = 230;
  const road = patch(CW - 6, CH - 22, false);
  const wall = patch(CW - 6, CH - 22, true, 30);
  all.forEach((it, n) => {
    const ox = (n % COLS) * CW + 3;
    const oy = Math.floor(n / COLS) * CH + 2;
    const onWall = it.kind === 'on the wall';
    g.save();
    g.beginPath();
    g.rect(ox, oy + 18, CW - 6, CH - 22);
    g.clip();
    g.drawImage(onWall ? wall : road, ox, oy + 18);
    const floorTile = it.kind === 'floor tile' || it.kind === 'trap';
    const ax = ox + CW / 2;
    // at twice the game's size where it fits, else at the game's
    const K = it.sp.h * 4 <= CH - 34 && it.sp.w * 4 <= CW - 10 ? 2 : 1;
    const ay = floorTile ? oy + 18 + (CH - 22) / 2 - 16 * K : onWall ? oy + CH - 4 - 30 + 2 : oy + CH - 40;
    g.drawImage(it.sp.img, Math.round(ax - it.sp.ax * 2 * K), Math.round(ay - it.sp.ay * 2 * K), it.sp.w * 2 * K, it.sp.h * 2 * K);
    g.restore();
    g.save();
    g.beginPath();
    g.rect(ox, oy, CW - 6, 18);
    g.clip();
    g.scale(2, 2);
    drawText(g, it.name, ox / 2 + 1, oy / 2 + 1, THEME.text, { shadow: P.ink });
    g.restore();
  });
  show(cvs);
}

/** Where the far wall's foot is down the panel's column `px`: the first floor pixel under a run of at least `tall` face pixels (or -1). */
function wallFoot(kinds: Uint8Array, px: number, tall = 60): number {
  let run = 0;
  for (let py = 0; py < PH; py++) {
    const k = kinds[py * PW + px];
    if (k === TK.Face) run++;
    else if (k === TK.Floor && run >= tall) return py;
    else run = 0;
  }
  return -1;
}

interface Stand { x: number; y: number; sp: Sprite; lift?: number; shadow?: number; figure?: boolean; tall?: boolean }

/** The tops dressed, by the rule he said yes to: junipers in groves with bare ground between, sage, yucca, a few dead trees, boulders, small hoodoos; never over the road. */
function dressTops(stands: Stand[]): void {
  const RISE = CANYON_LOOK.rise;
  for (let gy = -40; gy < PH + 60; gy += 17) {
    for (let gx = 4; gx < PW; gx += 21) {
      const px = Math.round(gx + (hashOf(gx, gy, 1) - 0.5) * 16);
      const py = Math.round(gy + (hashOf(gx, gy, 2) - 0.5) * 12);
      const roll = hashOf(gx, gy, 3);
      const [wx, wy] = worldOf(VX + px, VY + py + RISE);
      if (T.ground(wx, wy)) continue;
      const grove = fbm(wx * 0.32, wy * 0.32, 714);
      let sp: Sprite | null = null;
      let hw = 12;
      let h = 16;
      let tall = false;
      if (grove > 0.63 && roll < 0.16) {
        const k = hashOf(gx, gy, 4) < 0.35 ? 0 : hashOf(gx, gy, 4) < 0.75 ? 1 : 2;
        sp = pc('juniper', k);
        hw = 28;
        h = sp.h * 2;
        tall = true;
      } else if (roll < 0.06) {
        sp = pc('sagebrush', hashOf(gx, gy, 5) < 0.5 ? 0 : 1);
        hw = 18;
        h = 24;
      } else if (roll < 0.085) {
        sp = pc('yucca', hashOf(gx, gy, 6) < 0.6 ? 0 : 1);
        hw = 16;
        h = sp.h * 2;
      } else if (roll < 0.095) {
        sp = pc('red boulder', Math.floor(hashOf(gx, gy, 7) * 3));
        hw = 24;
        h = 34;
      } else if (roll < 0.1) {
        sp = pc('dead juniper');
        hw = 30;
        h = 90;
        tall = true;
      } else if (roll < 0.104) {
        sp = pc('hoodoo', 0);
        hw = 24;
        h = 100;
        tall = true;
      }
      if (!sp || !clearOfFloor(T, VX + px, VY + py, hw, h)) continue;
      stands.push({ x: wx, y: wy, sp, lift: RISE, tall });
    }
  }
}

/** ECHO CANYON DRESSED: the pieces where the mock-up he said yes to has them, the tops dressed by its rule. */
function dressedShot(): void {
  const kinds = paintPanel(g, VX, VY, PW, PH);
  const stands: Stand[] = [];
  // the cult's wheel ruts down the road, a floor tile along it, first, on the ground
  const line = [[300, -80], [330, 30], [365, 120], [425, 186], [507, 236], [598, 266], [668, 300], [712, 380], [736, 540]].map(([a, b]) => at(a, b));
  for (let ty = 0; ty < CANYON_FLOOR.h; ty++) {
    for (let tx = 0; tx < CANYON_FLOOR.w; tx++) {
      if (CANYON_FLOOR.tiles[ty * CANYON_FLOOR.w + tx] !== T_FLOOR || (CANYON_FLOOR.cut && CANYON_FLOOR.cut[ty * CANYON_FLOOR.w + tx])) continue;
      let best = Infinity;
      let alongY = false;
      for (let i = 0; i + 1 < line.length; i++) {
        const [ax, ay] = line[i];
        const [bx, by] = line[i + 1];
        const dx = bx - ax;
        const dy = by - ay;
        const t = Math.max(0, Math.min(1, ((tx + 0.5 - ax) * dx + (ty + 0.5 - ay) * dy) / (dx * dx + dy * dy)));
        const d = Math.hypot(tx + 0.5 - ax - t * dx, ty + 0.5 - ay - t * dy);
        if (d < best) {
          best = d;
          alongY = Math.abs(dy) > Math.abs(dx);
        }
      }
      if (best > 0.55) continue;
      const [sx, sy] = pictureOf(tx, ty);
      drawAt(g, pc('wheel ruts', alongY ? 1 : 0), sx - VX, sy - VY);
    }
  }
  const onFloor = (px: number, py: number, name: string, frame = 0, tall = false): void => {
    const [x, y] = at(px, py);
    if (!T.ground(x, y)) console.warn('off the floor:', name, px, py);
    stands.push({ x, y, sp: pc(name, frame), shadow: shadowOf(name), tall });
  };
  const againstWall = (px: number, name: string): void => {
    const py = wallFoot(kinds, px);
    if (py < 0) return console.warn('no wall at', px);
    const [x, y] = worldOf(VX + px, VY + py + 2);
    stands.push({ x, y, sp: pc(name), shadow: shadowOf(name) });
  };
  const onTop = (px: number, py: number, sp: Sprite, shadow?: number): void => {
    const [x, y] = worldOf(VX + px, VY + py + CANYON_LOOK.rise);
    if (T.ground(x, y)) console.warn('on the floor, not a top:', px, py);
    stands.push({ x, y, sp, lift: CANYON_LOOK.rise, shadow });
  };
  // the hoodoos standing out of the near wall where the canyon turns (the mock-up's two), seen through
  onFloor(345, 250, 'hoodoo', 1, true);
  onFloor(452, 314, 'hoodoo', 2, true);
  // the cult's broken-down wagon and its spilt stores, on the road by the knight
  onFloor(586, 246, "the cult's wagon, broken down");
  onFloor(640, 292, 'crate of stores', 0);
  onFloor(474, 196, 'sacks of meal', 0);
  onFloor(684, 330, 'crate of stores', 1);
  onFloor(392, 150, 'sagebrush', 0);
  onFloor(705, 410, 'a steer\'s skull');
  stands.push({ x: at(445, 172)[0], y: at(445, 172)[1], sp: cultBanner(0), shadow: 0.2 });
  // the cult's lookout on the far top, its fire burning the cult's pink, its hoist letting crates down the wall
  onTop(736, 50, pc("the cult's lookout tent"), 0.9);
  onTop(674, 68, pinkBrazier(1), 0.3);
  onTop(800, 64, cultBanner(2), 0.2);
  againstWall(700, "the cult's hoist");
  for (const [x, y] of FOES) stands.push({ x, y, sp: cultist.front.idle[0], figure: true, shadow: 0.45 });
  stands.push({ x: HERO[0], y: HERO[1], sp: knight, figure: true, shadow: 0.5 });
  dressTops(stands);
  stands.sort((a, b) => a.x + a.y - (b.x + b.y));
  const figures = stands.filter((st) => st.figure);
  for (const st of stands) {
    const [sx0, sy0] = pictureOf(st.x, st.y);
    const sx = sx0 - VX;
    const sy = sy0 - VY - (st.lift ?? 0);
    if (st.shadow) {
      g.fillStyle = 'rgba(25, 18, 40, 0.32)';
      g.beginPath();
      g.ellipse(sx, sy, st.shadow * HWP * 1.1, st.shadow * HHP * 1.1, 0, 0, Math.PI * 2);
      g.fill();
    }
    // a tall thing seen through while someone stands behind it (the game's SEEN_THROUGH, 0.38)
    let alpha = 1;
    if (st.tall) {
      // (where the figure's picture and its own overlap)
      const l = sx - st.sp.ax * 2;
      const t = sy - st.sp.ay * 2;
      for (const f of figures) {
        if (f.x + f.y >= st.x + st.y) continue;
        const [fx, fy] = pictureOf(f.x, f.y);
        const fl = fx - VX - f.sp.ax * 2;
        const ft = fy - VY - f.sp.ay * 2;
        if (fl < l + st.sp.w * 2 && fl + f.sp.w * 2 > l && ft < t + st.sp.h * 2 && ft + f.sp.h * 2 > t) alpha = 0.38;
      }
    }
    drawAt(g, st.sp, sx, sy, alpha);
  }
  nameAndMap(g, HERO);
  show(cvs);
}

if (HASH === 'pieces') pieceSheet();
else if (HASH === 'dressed') dressedShot();
