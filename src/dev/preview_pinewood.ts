// Dev page: FLOOR 9, THE PINEWOOD, its ground painted by the game-ready painter (art/terrain.ts, the look
// art/pinewood.ts) from a level's own tiles, for the owner to look at. Nothing of the game imports it.
//
// The tiles are laid here by hand in the shape of the planning chat's Pinewood that he said yes to (13 Oct,
// by 08:23: "Yes, this is it (Recommended)"; src/dev/preview_act1.ts, hash `pine`, on mockup/act1-levels): a
// great open meadow running back to the wood's far edge, the river winding down across it from the upper left,
// three little footbridges where the trails cross it, groves standing in it, the swamp's sickness creeping in at
// the right. Each tile whole, a half, or not floor, whichever fits that shape best, as the game's map-maker would
// lay them (how the real Pinewood is laid is the main chat's). The painter rounds and rags their edge.
//
//   node tools/preview.mjs src/dev/preview_pinewood.ts shots/pine_ground.png 1014 468 shot
//     one phone screen (the game's 507 x 234 game pixels at 2 picture pixels each), the knight and two of the
//     cult standing in it where the mock-up has them
//   node tools/preview.mjs src/dev/preview_pinewood.ts shots/pine_tiles.png 1014 468 tiles
//     the same with the tiles the game walks by drawn over it (white: whole, yellow: a half)
//   node tools/preview.mjs src/dev/preview_pinewood.ts shots/pine_close.png 1014 936 close
//     close-ups at four times (the meadow, the river and a bank, the wood's edge and its floor, the sickness)
//   node tools/preview.mjs src/dev/preview_pinewood.ts shots/pine_cost.png 1014 200 cost
//     what painting it costs, a piece of 256 x 256 picture pixels at a time

import { makeDaggerCultistArt3 } from '../art/cultists';
import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { pinewoodLook } from '../art/pinewood';
import { HHP, HWP, TK, paintTerrain, pictureOf, terrainOf, vnoise } from '../art/terrain';
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

/** A smooth curve through the mock-up's points (a Catmull-Rom spline), in this page's world, many points along it. */
function smooth(pts: number[][]): number[][] {
  const W = pts.map(([px, py]) => at(px, py));
  const out: number[][] = [];
  for (let i = 0; i + 1 < W.length; i++) {
    const p0 = W[Math.max(0, i - 1)];
    const p1 = W[i];
    const p2 = W[i + 1];
    const p3 = W[Math.min(W.length - 1, i + 2)];
    for (let k = 0; k < 12; k++) {
      const t = k / 12;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number): number => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(W[W.length - 1]);
  return out;
}
/** How far a place is from a curve (in this page's world), in tiles. */
const curveDist = (P2: number[][], x: number, y: number): number => {
  let d = Infinity;
  for (let i = 0; i + 1 < P2.length; i++) d = Math.min(d, segDist(x, y, P2[i][0], P2[i][1], P2[i + 1][0], P2[i + 1][1]));
  return d;
};
const lineDist = (pts: number[][], x: number, y: number): number => curveDist(pts.map(([px, py]) => at(px, py)), x, y);
/** Where a place in this page's world is on the mock-up's panel. */
const toPanel = (x: number, y: number): [number, number] => [OX + (x - y) * HWP, OY + (x + y - 2 * D) * HHP];

/** THE PINEWOOD'S SHAPE, the mock-up's `pineShotGround` as he said yes to it: the river's line, the wood's far edge, its groves, its three footbridges, its trails. */
const PINE_RIVER = [[110, -30], [170, 70], [250, 150], [330, 236], [420, 318], [560, 368], [710, 398], [880, 470]];
const RIVER_HALF = 0.55;
/** A field over the world worked out once, eight cells to a tile, read back smoothly (as the game would hold one). */
function gridOf(f: (x: number, y: number) => number, n = 56, G = 8): (x: number, y: number) => number {
  const N = n * G + 1;
  const v = new Float32Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) v[j * N + i] = f(i / G, j / G);
  return (x, y) => {
    const gx = Math.max(0, Math.min(N - 1.001, x * G));
    const gy = Math.max(0, Math.min(N - 1.001, y * G));
    const i = Math.floor(gx);
    const j = Math.floor(gy);
    const u = gx - i;
    const w = gy - j;
    const a = v[j * N + i];
    const b = v[j * N + i + 1];
    const c = v[(j + 1) * N + i];
    const d = v[(j + 1) * N + i + 1];
    return a + (b - a) * u + (c - a) * w + (a - b - c + d) * u * w;
  };
}
const RIVER_LINE = smooth(PINE_RIVER);
/** Its distance, its width wandering (a wider pool here, a narrower run there). */
const river = gridOf((x, y) => curveDist(RIVER_LINE, x, y) / (0.85 + 0.35 * vnoise(x * 0.35, y * 0.35, 741)));
const farEdge = (sx: number): number => 70 + 26 * Math.sin(sx / 120 + 0.6) + 18 * (vnoise(sx / 60, 0, 701) - 0.5) * 2 - 30 * Math.exp(-(((sx - 690) / 70) ** 2));
const GROVES: [number, number, number, number][] = [[150, 360, 1.5, 1.0], [880, 330, 1.7, 1.2], [600, 120, 0.9, 0.6], [80, 180, 0.8, 0.6], [960, 160, 1.0, 0.7]];
const inGrove = (x: number, y: number): boolean => GROVES.some(([px, py, rx, ry]) => area(px, py, rx, ry)(x, y));
/** A little footbridge across the river at a point of the panel, square to the water there. */
function bridge(px: number, py: number): Shape {
  let best = 0;
  let bd = Infinity;
  for (let i = 0; i + 1 < PINE_RIVER.length; i++) {
    const [ax, ay] = PINE_RIVER[i];
    const [bx, by] = PINE_RIVER[i + 1];
    const d = Math.hypot((ax + bx) / 2 - px, (ay + by) / 2 - py);
    if (d < bd) {
      bd = d;
      best = i;
    }
  }
  const [ax, ay] = PINE_RIVER[best];
  const [bx, by] = PINE_RIVER[best + 1];
  const len = Math.hypot(bx - ax, by - ay);
  const nx = -(by - ay) / len;
  const ny = (bx - ax) / len;
  return path([[px - 30 * nx, py - 30 * ny], [px + 30 * nx, py + 30 * ny]], 0.75);
}
const BRIDGES = [[212, 112], [376, 278], [640, 384]].map(([px, py]) => bridge(px, py));
const onBridge = (x: number, y: number): boolean => BRIDGES.some((b) => b(x, y));
const TRAILS = [
  [[40, 40], [212, 112], [380, 196], [507, 240], [700, 246], [880, 236], [1060, 206]],
  [[376, 278], [300, 360], [200, 450]],
  [[640, 384], [610, 300], [507, 240]],
];
const TRAIL_LINES = TRAILS.map(smooth);
const trail = gridOf((x, y) => Math.min(...TRAIL_LINES.map((t) => curveDist(t, x, y))) * 0.8);
/** The swamp's sickness, creeping in from the right of the panel (the east). */
const sick = (x: number, y: number): number => Math.max(0, Math.min(1, (toPanel(x, y)[0] - 720) / 300));
const PINE_SHAPE: Shape = (x, y) => {
  if (onBridge(x, y)) return true;
  if (river(x, y) < RIVER_HALF || inGrove(x, y)) return false;
  const [sx, sy] = toPanel(x, y);
  return sy > farEdge(sx);
};
const PINE_LOOK = pinewoodLook({ river, trail, sick });

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
  return { depth: 9, seed: 9, w, h, tiles, cut, variant: new Uint8Array(w * h), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
}

export const PINE_FLOOR = layTiles(PINE_SHAPE, 56, 56);
const T: Terrain = terrainOf(PINE_FLOOR, PINE_LOOK);
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
  drawText(g, 'The Pinewood', 4, 3, THEME.text, { shadow: P.ink });
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
      if (tx >= 0 && ty >= 0 && tx < PINE_FLOOR.w && ty < PINE_FLOOR.h && PINE_FLOOR.tiles[ty * PINE_FLOOR.w + tx] === T_FLOOR) {
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

/** Where the mock-up has the knight, and the cult's patrol out of the camp. */
const HERO = at(507, 240);
const FOES = [at(772, 112), at(816, 104)];

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
    for (let ty = 0; ty < PINE_FLOOR.h; ty++) {
      for (let tx = 0; tx < PINE_FLOOR.w; tx++) {
        const i = ty * PINE_FLOOR.w + tx;
        if (PINE_FLOOR.tiles[i] !== T_FLOOR) continue;
        const c = PINE_FLOOR.cut ? PINE_FLOOR.cut[i] : 0;
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
    ['The meadow: grass, tufts, flowers, a trail', 470, 200],
    ['The river, a bank, a bridge\'s crossing', 380, 290],
    ['The wood\'s edge and its floor: needles, moss, ferns', 120, 380],
    ['Toward the swamp: the sickness in the ground', 930, 260],
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
  terrainOf(PINE_FLOOR, PINE_LOOK);
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

