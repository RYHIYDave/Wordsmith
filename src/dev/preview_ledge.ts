// Dev page: FLOOR 7, THE LEDGE ROAD, its ground painted by the game-ready painter (art/terrain.ts, the look
// art/ledge.ts) from a level's own tiles, with its sky behind (art/ledge.ts paintSky), for the owner to look
// at. Nothing of the game imports it.
//
// The tiles are laid here by hand. HIS TRAIL (the default): the trail along the mountain's face, cliff above
// and below, turning at the mountain's corner and going on up round its side, the view open off the side of the
// cliff (his words, 13 Oct, in art/ledge.ts; “You got it that’s perfect”, 21:03). THE FIRST TRY (`first`,
// `bend`): the planning mock-up's road, the mountain in front cut away, the sky past the far edge; kept to see
// what was shown. Rock tiles the mountain, pit tiles the drop. How the real Ledge Road is laid is the main
// chat's. The painter rounds and rags the trail's edges.
//
//   node tools/preview.mjs src/dev/preview_ledge.ts shots/ledge_trail.png 1014 468 shot
//     one phone screen (the game's 507 x 234 game pixels at 2 picture pixels each): the sky behind, the
//     ground over it, firs low on the mountainside, the knight on the trail and two of the cult further on
//   node tools/preview.mjs src/dev/preview_ledge.ts shots/ledge_trail_tiles.png 1014 468 tiles
//     the same with the tiles the game walks by drawn over it (white: whole, yellow: a half)
//   node tools/preview.mjs src/dev/preview_ledge.ts shots/ledge_trail_kinds.png 1014 468 kinds
//     what each pixel is (floor white, wall orange, top green, hanging face yellow, drop black; tiles as dots)
//   node tools/preview.mjs src/dev/preview_ledge.ts shots/ledge_ground.png 1014 468 first
//   node tools/preview.mjs src/dev/preview_ledge.ts shots/ledge_bend.png 1014 468 bend
//     the first try, as shown him
//   node tools/preview.mjs src/dev/preview_ledge.ts shots/ledge_close.png 1014 936 close
//     close-ups at four times
//   node tools/preview.mjs src/dev/preview_ledge.ts shots/ledge_sky.png 1024 400 sky
//     the whole sky round, half size, once across, with the seam where it comes round marked
//   node tools/preview.mjs src/dev/preview_ledge.ts shots/ledge_cost.png 600 200 cost
//     what painting it costs

import { makeDaggerCultistArt3 } from '../art/cultists';
import { quarryPieces } from '../art/floor6';
import { ledgePieces, railSpan } from '../art/floor7';
import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { SKY_WRAP, ledgeLook, paintSky } from '../art/ledge';
import { HHP, HWP, TK, clearOfFloor, fbm, paintTerrain, pictureOf, terrainOf, worldOf } from '../art/terrain';
import type { Terrain } from '../art/terrain';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { CUT_FAR, CUT_LEFT, CUT_NEAR, CUT_RIGHT, T_FLOOR, T_PIT, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import { THEME } from '../ui/ui';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'shot';
const PW = HASH === 'sky' ? 1024 : HASH === 'cost' ? 600 : 1014;
const PH = HASH === 'close' ? 936 : HASH === 'cost' ? 200 : HASH === 'sky' ? 400 : HASH === 'pieces' ? 2210 : 468;

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
const toPanel = (x: number, y: number): [number, number] => [OX + (x - D - (y - D)) * HWP, OY + (x - D + (y - D)) * HHP];
type Shape = (x: number, y: number) => boolean;

/** The road's middle down the panel at each column (the mock-up's): in from the left, past the knight, out on the outcrop, on to the right. */
const MID: [number, number][] = [[-80, 226], [150, 232], [330, 224], [507, 240], [650, 252], [800, 234], [950, 216], [1100, 206]];
const curveThrough = (pts: [number, number][]) => (px: number): number => {
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    if (px <= x1) {
      const t = (1 - Math.cos((Math.max(0, px - x0) / (x1 - x0)) * Math.PI)) / 2;
      return y0 + (y1 - y0) * t;
    }
  }
  return pts[pts.length - 1][1];
};
const mid = curveThrough(MID);
const outcrop = (px: number): number => 50 * Math.exp(-(((px - 700) / 60) ** 2));
const farEdge = (px: number): number => mid(px) - 27 - 5 * Math.sin(px / 37 + 0.3) - outcrop(px);
const nearEdge = (px: number): number => mid(px) + 27 + 6 * Math.sin(px / 53 + 1);
const LEDGE: Shape = (x, y) => {
  const [sx, sy] = toPanel(x, y);
  return sy > farEdge(sx) && sy < nearEdge(sx);
};
const BEYOND = (x: number, y: number): boolean => {
  const [sx, sy] = toPanel(x, y);
  return sy < (farEdge(sx) + nearEdge(sx)) / 2;
};

/**
 * ANOTHER STRETCH, for the hanging face: the same road where it crosses a neck of rock, the mountain in
 * front falling away in a gully, so that the drop shows below the road there too, the cliff's face hanging
 * under its near edge.
 */
const gully = (sx: number, sy: number): boolean => Math.abs(sx - 560) < 80 + Math.max(0, sy - nearEdge(sx)) * 0.55;
const NECK_BEYOND = (x: number, y: number): boolean => {
  const [sx, sy] = toPanel(x, y);
  return sy < (farEdge(sx) + nearEdge(sx)) / 2 || gully(sx, sy);
};

/**
 * HIS LEDGE ROAD (13 Oct, asked “Is this the Ledge Road's ground and sky?”): “My vision was it looks like your
 * on a cliff side trail with cliff on top and bottom.  When you make a northwest turn, the sky would open up,
 * it’s like your going around the mountain.  If that makes sense.” Read as, and told him so: along the trail
 * the mountain rises in a cliff above it (up the screen) and falls away in a cliff below it, toward the eye,
 * the valley far below in the haze; where the trail turns northwest (up-left on the screen) going round the
 * mountain, the wall above falls back past the turn and the sky opens up beyond it. So the trail comes in from
 * the right, past the knight, and turns up-left round the mountain's shoulder; the mountain (rock tiles) on
 * its upper side as far as the shoulder, the drop (pit tiles) below it and past the shoulder.
 */
// His word on that (asked “Is this the cliff-side trail you pictured?”): “Uh kind of but I’d like the road to
// kinda wrap around the mountain not just float off into space”; and asked what should change: “Mountain looks
// like a mountain”, and “The mountain side goes all the way to the ground you would never see the ground under
// the cliff.  Only off the side of cliff as you round the mountain.” Read as, and told him so: the trail stays
// against the mountain all the way round the turn; above the wall the mountain rises in rocky slopes to snowy
// heights; under the trail the cliff goes all the way down; the view opens only off the side of the cliff,
// where the trail rounds the mountain. So the trail comes in from the right along the mountain's face, turns at
// its corner and goes on up the screen round its side, off the top; the mountain on its right hand all the
// way (above it, then to its right), the drop on its left (below it, then beyond it to the left).
const TRAIL_PTS: [number, number][] = [[2200, 262], [1120, 262], [900, 270], [720, 262], [560, 268], [450, 250], [372, 210], [318, 150], [288, 70], [276, -20], [272, -140], [270, -900]];
/** The trail's middle, a smooth line through those points (Catmull-Rom), a few pixels a step. */
const TRAIL_SCREEN: [number, number][] = [];
for (let i = 0; i + 1 < TRAIL_PTS.length; i++) {
  const p0 = TRAIL_PTS[Math.max(0, i - 1)];
  const p1 = TRAIL_PTS[i];
  const p2 = TRAIL_PTS[i + 1];
  const p3 = TRAIL_PTS[Math.min(TRAIL_PTS.length - 1, i + 2)];
  const steps = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 10));
  for (let k = 0; k < steps; k++) {
    const t = k / steps;
    const t2 = t * t;
    const t3 = t2 * t;
    const f = (a: number, b: number, c: number, d: number): number => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
    TRAIL_SCREEN.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
  }
}
TRAIL_SCREEN.push(TRAIL_PTS[TRAIL_PTS.length - 1]);
const TRAIL_LINE: [number, number][] = TRAIL_SCREEN.map(([sx, sy]) => at(sx, sy));
/** The nearest point of the trail's middle to world (x, y): how far (tiles), and on which hand (walking from its right-hand end): the mountain's (true) or the drop's. */
function nearTrail(x: number, y: number): [number, boolean] {
  let best = Infinity;
  let mountain = false;
  for (let i = 0; i + 1 < TRAIL_LINE.length; i++) {
    const [ax, ay] = TRAIL_LINE[i];
    const [bx, by] = TRAIL_LINE[i + 1];
    // (a segment is at most a few tiles long: skip those plainly further than the best so far)
    if (Math.abs(x - ax) + Math.abs(y - ay) > best * 1.5 + 4) continue;
    const dx = bx - ax;
    const dy = by - ay;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
    const d = Math.hypot(x - ax - t * dx, y - ay - t * dy);
    if (d < best) {
      best = d;
      // on the screen, walking along it: the right hand is the mountain's (y runs down the screen)
      const [sax, say] = TRAIL_SCREEN[i];
      const [sbx, sby] = TRAIL_SCREEN[i + 1];
      const [spx, spy] = toPanel(x, y);
      mountain = (sbx - sax) * (spy - say) - (sby - say) * (spx - sax) > 0;
    }
  }
  return [best, mountain];
}
const TRAIL: Shape = (x, y) => nearTrail(x, y)[0] < 1.3 + 0.18 * Math.sin((x - y) / 2.7) + 0.12 * Math.sin((x + y) / 1.9);
const BELOW_TRAIL = (x: number, y: number): boolean => !nearTrail(x, y)[1];

/** Lay the tiles of a shape: each whole, one of the four halves, or not floor, whichever is least wrong; not floor, the drop where `beyond` says. */
function layTiles(shape: Shape, beyond: (x: number, y: number) => boolean, w: number, h: number): Floor {
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
      const there: boolean[] = [];
      for (let a = 0; a < N; a++) for (let b = 0; b < N; b++) there.push(shape(tx + (a + 0.5) / N, ty + (b + 0.5) / N));
      if (there.every((v) => !v)) {
        if (beyond(tx + 0.5, ty + 0.5)) tiles[ty * w + tx] = T_PIT;
        continue;
      }
      options.forEach(([, inside], k) => {
        let wrong = 0;
        for (let a = 0; a < N; a++) {
          for (let b = 0; b < N; b++) {
            const u = (a + 0.5) / N;
            const v = (b + 0.5) / N;
            if (inside(u, v) !== there[a * N + b]) wrong++;
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
      } else if (beyond(tx + 0.5, ty + 0.5)) tiles[ty * w + tx] = T_PIT;
    }
  }
  return { depth: 7, seed: 7, w, h, tiles, cut, variant: new Uint8Array(w * h), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
}

const IS_BEND = HASH === 'bend';
/** The first try (the planning mock-up's road, the mountain in front): `first`, `bend`. His trail: the rest. */
const IS_FIRST = HASH === 'first' || IS_BEND;
const beyondHere = IS_BEND ? NECK_BEYOND : IS_FIRST ? BEYOND : BELOW_TRAIL;
const FLOOR = layTiles(IS_FIRST ? LEDGE : TRAIL, beyondHere, 48, 48);
/** The drop, as the level says it: its pit tiles, and past the floor's edge, where the layout says. */
const OUTSIDE = new Map<number, boolean>();
const dropTile = (tx: number, ty: number): boolean => {
  if (tx >= 0 && ty >= 0 && tx < FLOOR.w && ty < FLOOR.h) return FLOOR.tiles[ty * FLOOR.w + tx] === T_PIT;
  // (past the laid tiles, asked once a tile: as the game would look up a tile)
  const key = (ty + 1000) * 4000 + tx + 1000;
  let d = OUTSIDE.get(key);
  if (d === undefined) {
    d = beyondHere(tx + 0.5, ty + 0.5);
    OUTSIDE.set(key, d);
  }
  return d;
};
const LOOK = ledgeLook(dropTile);
const T: Terrain = terrainOf(FLOOR, LOOK);
/** Where this page's panel lies in the world's picture: the mock-up's panel, moved D tiles. */
const VX = -OX;
const VY = -OY + 2 * D * HHP;
/** Where the sky's horizon sits on the panel (the mock-up's, for the first try; lower for his trail, so that the sky shows past the turn), and so the sky's own y at the panel's top. */
const HORIZON = IS_FIRST ? 132 : 232;

/** Paint the world's picture under the panel, in pieces of `piece` pixels (so that the seams are checked too), over the sky. */
function paintPanel(g: CanvasRenderingContext2D, x0: number, y0: number, w: number, h: number, piece = 256, sky = true): Uint8Array {
  const kinds = new Uint8Array(w * h);
  const out = new Uint8ClampedArray(w * h * 4);
  const skyPx = sky ? paintSky(Math.round(x0 * 0.5), -HORIZON, w, h) : null;
  for (let py = 0; py < h; py += piece) {
    for (let px = 0; px < w; px += piece) {
      const pw = Math.min(piece, w - px);
      const ph = Math.min(piece, h - py);
      const p = paintTerrain(T, x0 + px, y0 + py, pw, ph);
      for (let r = 0; r < ph; r++) {
        kinds.set(p.kind.subarray(r * pw, r * pw + pw), (py + r) * w + px);
        for (let c = 0; c < pw; c++) {
          const s = (r * pw + c) * 4;
          const o = ((py + r) * w + px + c) * 4;
          const clear = p.rgba[s + 3] === 0;
          for (let k = 0; k < 4; k++) out[o + k] = clear && skyPx ? skyPx[o + k] : p.rgba[s + k];
        }
      }
    }
  }
  g.putImageData(new ImageData(out, w, h), 0, 0);
  return kinds;
}

// ---------------------------------------------------------------------------------------------------
// The figures and the firs, as the game draws them

const knight = spriteOf3(MOVES3.rear, 0, 'front');
const cultist = makeDaggerCultistArt3();
/** A sprite with its anchor at picture pixel (sx, sy) of the panel, at the panel's grain (two picture pixels to a game pixel). */
function drawAt(g: CanvasRenderingContext2D, sp: Sprite, sx: number, sy: number, alpha = 1): void {
  g.globalAlpha = alpha;
  g.drawImage(sp.img, Math.round(sx - sp.ax * 2), Math.round(sy - sp.ay * 2), sp.w * 2, sp.h * 2);
  g.globalAlpha = 1;
}
function piece(name: string, frame = 0): Sprite {
  const pc = quarryPieces().find((q) => q.name === name);
  if (!pc || !pc.frames) throw new Error(`no piece ${name}`);
  return pc.frames[Math.min(frame, pc.frames.length - 1)];
}
interface Stand { x: number; y: number; sp: Sprite; lift?: number; shadow?: number; figure?: boolean }

function nameAndMap(g: CanvasRenderingContext2D, hero: [number, number]): void {
  g.save();
  g.scale(2, 2);
  drawText(g, 'The Ledge Road', 4, 3, THEME.text, { shadow: P.ink });
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

function hashOf(x: number, y: number, k: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(k | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** The slope in front, dressed: firs in groves with open meadow between, a few boulders; never over the road. */
function dressSlope(stands: Stand[]): void {
  const RISE = LOOK.rise;
  for (let gy = 4; gy < PH + 60; gy += 18) {
    for (let gx = 4; gx < PW; gx += 24) {
      const px = Math.round(gx + (hashOf(gx, gy, 1) - 0.5) * 18);
      const py = Math.round(gy + (hashOf(gx, gy, 2) - 0.5) * 12);
      const roll = hashOf(gx, gy, 3);
      const [wx, wy] = worldOf(VX + px, VY + py + RISE);
      // on the mountain's side only (not out over the drop), and low on its slopes (no trees up in the snow)
      if (T.ground(wx, wy) || T.drop(wx, wy)) continue;
      if (T.climbAt && T.climbAt(wx, wy) > 0.22) continue;
      const grove = fbm(wx * 0.3, wy * 0.3, 714);
      let sp: Sprite | null = null;
      let hw = 12;
      let h = 16;
      if (grove > 0.56 && roll < 0.42) {
        const k = hashOf(gx, gy, 4) < 0.33 ? 0 : hashOf(gx, gy, 4) < 0.7 ? 1 : 2;
        sp = piece('pine', k);
        hw = 30;
        h = sp.h * 2;
      } else if (roll < 0.04) {
        sp = piece('boulder', Math.floor(hashOf(gx, gy, 5) * 3));
        hw = 22;
        h = 30;
      }
      if (!sp || !clearOfFloor(T, VX + px, VY + py, hw, h)) continue;
      stands.push({ x: wx, y: wy, sp, lift: RISE });
    }
  }
}

function drawStands(g: CanvasRenderingContext2D, stands: Stand[]): void {
  stands.sort((a, b) => a.x + a.y - (b.x + b.y));
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
    drawAt(g, s.sp, sx, sy);
  }
}

function tileLines(g: CanvasRenderingContext2D): void {
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

const cvs = document.createElement('canvas');
cvs.width = PW;
cvs.height = PH;
cvs.style.display = 'block';
const g = cvs.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;

if (HASH === 'pieces') pieceSheet();
else if (HASH === 'dressed') dressedShot();
else if (HASH === 'shot' || HASH === 'tiles' || HASH === 'bend' || HASH === 'first') {
  paintPanel(g, VX, VY, PW, PH);
  if (HASH === 'tiles') tileLines(g);
  const stands: Stand[] = [];
  dressSlope(stands);
  const hero = IS_FIRST ? at(507, 244) : at(520, 270);
  stands.push({ x: hero[0], y: hero[1], sp: knight, figure: true, shadow: 0.5 });
  for (const [px, py] of IS_FIRST ? [[670, 236], [728, 226]] : [[790, 268], [860, 276]]) {
    const [x, y] = at(px, py);
    if (!T.ground(x, y)) console.warn('the cult off the road', px, py);
    stands.push({ x, y, sp: cultist.front.idle[0], figure: true, shadow: 0.45 });
  }
  drawStands(g, stands);
  nameAndMap(g, hero);
  show(cvs);
} else if (HASH === 'kinds') {
  // what each pixel is, by colour; the tiles' kinds as dots at their middles (pit red, wall grey, floor white)
  const kinds = paintPanel(g, VX, VY, PW, PH, 256, false);
  const KC = ['#000000', '#ffffff', '#ff8800', '#55aa55', '#2266ff', '#aa00aa', '#000000', '#ffee00'];
  const img = g.getImageData(0, 0, PW, PH);
  for (let i = 0; i < kinds.length; i++) {
    const c = KC[kinds[i]];
    img.data[i * 4] = parseInt(c.slice(1, 3), 16);
    img.data[i * 4 + 1] = parseInt(c.slice(3, 5), 16);
    img.data[i * 4 + 2] = parseInt(c.slice(5, 7), 16);
    img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  for (let ty = 0; ty < FLOOR.h; ty++) for (let tx = 0; tx < FLOOR.w; tx++) {
    const [sx, sy] = pictureOf(tx + 0.5, ty + 0.5);
    const t = FLOOR.tiles[ty * FLOOR.w + tx];
    g.fillStyle = t === T_PIT ? '#ff0000' : t === T_FLOOR ? '#888888' : '#444444';
    g.fillRect(sx - VX - 2, sy - VY - 2, 4, 4);
  }
  show(cvs);
} else if (HASH === 'close') {
  const spots: [string, number, number][] = [
    ['The road: packed earth, gravel, slabs of the rock', 300, 236],
    ['Its far edge over the drop: the lip, the sky beyond', 470, 200],
    ['The slope in front, cut away: meadow, stones, flowers', 300, 330],
    ['The sky: the far ranges, the land below, the clouds', 820, 120],
  ];
  const full = document.createElement('canvas');
  full.width = 1014;
  full.height = 468;
  const fg = full.getContext('2d') as CanvasRenderingContext2D;
  paintPanel(fg, VX, VY, 1014, 468);
  const S = 4;
  const cw = Math.floor(PW / 2 / S);
  const ch = Math.floor((PH / 2 - 24) / S);
  spots.forEach(([label, px, py], n) => {
    const ox = (n % 2) * (PW / 2);
    const oy = Math.floor(n / 2) * (PH / 2) + 24;
    g.drawImage(full, px - (cw >> 1), py - (ch >> 1), cw, ch, ox, oy, cw * S, ch * S);
    g.save();
    g.scale(2, 2);
    drawText(g, label, ox / 2 + 3, (oy - 22) / 2 + 2, THEME.text, { shadow: P.ink });
    g.restore();
  });
  show(cvs);
} else if (HASH === 'sky') {
  // the whole sky round at half size: two strips of 1024 one under the other, then the seam where it comes round
  const half = (x0: number, y: number): void => {
    const w = 1024;
    const h = 180;
    const px = paintSky(x0, -150, w * 2, h * 2);
    const tmp = document.createElement('canvas');
    tmp.width = w * 2;
    tmp.height = h * 2;
    (tmp.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(px, w * 2, h * 2), 0, 0);
    g.drawImage(tmp, 0, y, w, h);
  };
  half(0, 0);
  half(SKY_WRAP / 2 + SKY_WRAP / 2 - 1024, 200);
  g.fillStyle = '#28dcf0';
  g.fillRect(511, 380, 2, 20);
  show(cvs);
} else if (HASH === 'cost') {
  const runs: number[] = [];
  for (let k = 0; k < 8; k++) {
    const a = performance.now();
    paintTerrain(T, VX + (k % 4) * 256, VY + Math.floor(k / 4) * 256, 256, 256);
    runs.push(performance.now() - a);
  }
  const b = performance.now();
  terrainOf(FLOOR, LOOK);
  const fieldMs = performance.now() - b;
  const c = performance.now();
  paintSky(0, -132, SKY_WRAP, 468);
  const skyMs = performance.now() - c;
  runs.sort((x, y) => x - y);
  const line = `field ${fieldMs.toFixed(0)} ms; a piece of 256 x 256: ${runs.map((r) => r.toFixed(0)).join(', ')} ms; the sky round (${SKY_WRAP} x 468): ${skyMs.toFixed(0)} ms`;
  console.log(line);
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, PW, PH);
  g.save();
  g.scale(2, 2);
  drawText(g, line, 4, 4, THEME.text, { shadow: P.ink });
  g.restore();
  show(cvs);
}

/** A patch of the trail's own ground, w by h picture pixels, plain (no edges): its road, or with `wall` the mountain's wall over a strip of road at its foot (its foot `foot` pixels up from the bottom). */
function patch(w: number, h: number, wall: boolean, foot = 44): HTMLCanvasElement {
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = 4000 + x;
      const py = 3000 + y;
      const [wx, wy] = worldOf(px, py);
      const up = h - foot - y;
      const c = wall && up > 0 ? LOOK.face(0, up, px, py, wx, wy) : LOOK.floor(wx, wy, px, py, 1);
      const t = wall && up <= 0 && up > -7 ? (up > -4 ? LOOK.foot[0] : LOOK.foot[1]) : 0;
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

/** Every piece of the Ledge Road's so far, at twice the game's size, each on its ground, named: what stands on the wall against a piece of the wall. */
function pieceSheet(): void {
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, PW, PH);
  const all = ledgePieces().flatMap((pc) => (pc.frames ?? []).map((sp, i) => ({ name: pc.frames!.length > 1 ? `${pc.name} ${i + 1}` : pc.name, sp, kind: pc.kind })));
  const COLS = 4;
  const CW = Math.floor(PW / COLS);
  const CH = 220;
  const K = 2;
  const road = patch(Math.ceil((CW - 6) / K), Math.ceil((CH - 22) / K), false);
  const wall = patch(Math.ceil((CW - 6) / K), Math.ceil((CH - 22) / K), true, 24);
  all.forEach((it, n) => {
    const ox = (n % COLS) * CW + 3;
    const oy = Math.floor(n / COLS) * CH + 2;
    const onWall = it.kind === 'on the wall';
    g.save();
    g.beginPath();
    g.rect(ox, oy + 18, CW - 6, CH - 22);
    g.clip();
    g.drawImage(onWall ? wall : road, ox, oy + 18, (onWall ? wall : road).width * K, (onWall ? wall : road).height * K);
    const floorTile = it.kind === 'floor tile' || it.kind === 'trap';
    const ax = ox + CW / 2;
    const ay = floorTile ? oy + 18 + (CH - 22) / 2 - 32 : onWall ? oy + CH - 4 - 24 * K + 4 : oy + CH - 26;
    g.drawImage(it.sp.img, Math.round(ax - it.sp.ax * 2 * K), Math.round(ay - it.sp.ay * 2 * K), it.sp.w * 2 * K, it.sp.h * 2 * K);
    g.restore();
    g.save();
    g.scale(2, 2);
    drawText(g, it.name, ox / 2 + 1, oy / 2 + 1, THEME.text, { shadow: P.ink });
    g.restore();
  });
  show(cvs);
}

/** Where the wall's foot is down the panel's column `px`: the first floor pixel under a run of at least `tall` wall pixels (or -1). */
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

/** THE TRAIL DRESSED with its pieces so far, as the game might lay them: the rope rail along the drop, the carrion and the flock's leavings, the cult's perch and standard, things against the wall. */
function dressedShot(): void {
  const kinds = paintPanel(g, VX, VY, PW, PH);
  const stands: Stand[] = [];
  const pc = (name: string, frame = 0): Sprite => {
    const q = ledgePieces().find((x) => x.name === name);
    if (!q || !q.frames) throw new Error(`no piece ${name}`);
    return q.frames[frame];
  };
  const shadowOf = (name: string): number | undefined => ledgePieces().find((x) => x.name === name)?.shadow;
  const onTrail = (px: number, py: number, name: string, frame = 0): void => {
    const [x, y] = at(px, py);
    if (!T.ground(x, y)) console.warn('off the trail:', name, px, py);
    stands.push({ x, y, sp: pc(name, frame), shadow: shadowOf(name) });
  };
  const againstWall = (px: number, name: string): void => {
    const py = wallFoot(kinds, px);
    if (py < 0) return console.warn('no wall at', px);
    const [x, y] = worldOf(VX + px, VY + py + 2);
    stands.push({ x, y, sp: pc(name), shadow: shadowOf(name) });
  };
  // the rope rail along the drop: posts along the trail's lower edge, a span between each two
  const posts: [number, number][] = [];
  for (let px = 600; px <= PW - 12; px += 52) {
    let py = PH - 1;
    while (py > 0 && kinds[py * PW + px] !== TK.Floor) py--;
    const [x, y] = worldOf(VX + px, VY + py - 5);
    posts.push([x, y]);
  }
  posts.forEach(([x, y], i) => {
    const broken = i === 4;
    stands.push({ x, y, sp: pc(broken ? 'rope rail, broken' : 'rope rail'), shadow: 0.12 });
    const nx = posts[i + 1];
    if (nx && !broken && i !== 3) stands.push({ x, y, sp: railSpan((nx[0] - x) * 40, (nx[1] - y) * 40) });
  });
  // floor tiles first, on the trail's ground: the crumbling ledge in its warning, cracks across the trail
  const tileAt = (px: number, py: number, name: string, frame: number): void => {
    const [x, y] = at(px, py);
    const [sx, sy] = pictureOf(Math.floor(x), Math.floor(y));
    drawAt(g, pc(name, frame), sx - VX, sy - VY);
  };
  tileAt(452, 262, 'the crumbling ledge', 1);
  tileAt(612, 272, 'cracks across the trail', 0);
  againstWall(560, 'icicles in the wall');
  againstWall(650, 'iron rings in the wall');
  againstWall(930, 'a nest in the wall');
  onTrail(598, 238, 'snow drift', 0);
  onTrail(684, 264, "the cult's barricade", 1);
  onTrail(724, 240, 'water jar');
  onTrail(746, 247, "basket of the flock's feathers");
  onTrail(930, 256, 'a pack mule, picked clean');
  onTrail(845, 248, "the cult's perch");
  onTrail(890, 286, 'bones and feathers', 1);
  onTrail(566, 286, 'a dead vulture');
  onTrail(398, 240, 'a perching rock');
  onTrail(338, 166, 'cairn');
  onTrail(312, 120, 'rockfall');
  onTrail(372, 196, "the cult's feather standard");
  onTrail(296, 64, "the cult's cage for the flock");
  stands.push({ x: at(520, 270)[0], y: at(520, 270)[1], sp: knight, figure: true, shadow: 0.5 });
  for (const [px, py] of [[760, 270], [800, 262]]) {
    const [x, y] = at(px, py);
    stands.push({ x, y, sp: cultist.front.idle[0], figure: true, shadow: 0.45 });
  }
  dressSlope(stands);
  drawStands(g, stands);
  nameAndMap(g, at(520, 270));
  show(cvs);
}

// (for the tests' eyes)
(window as unknown as { __ledge: unknown }).__ledge = { T, FLOOR, TK };
