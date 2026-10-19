// Dev page: FLOOR 13, THE MILLRACE, its ground painted by the game-ready painter (art/terrain.ts, the look
// art/millrace.ts) from a level's own tiles, for the owner to look at. Nothing of the game imports it.
//
// The tiles are laid here by hand, one phone screen of it: the river winding down across the fields from the upper
// left; the mill race cut off it upstream and running straight along to where the wheel will turn, and back into the
// river below the mill; the mill yard; the Order's cart track coming in from the left over a cart bridge to the yard;
// a footbridge over the race; the rough past the fields at the top and in a corner. How the real Millrace is laid is
// the main chat's. Each tile whole, a half, or not floor, whichever fits that shape best; the painter rounds and rags
// their edge.
//
//   node tools/preview.mjs src/dev/preview_millrace.ts shots/mr_ground.png 1014 468 shot
//   node tools/preview.mjs src/dev/preview_millrace.ts shots/mr_tiles.png 1014 468 tiles
//   node tools/preview.mjs src/dev/preview_millrace.ts shots/mr_close.png 1014 936 close
//   node tools/preview.mjs src/dev/preview_millrace.ts shots/mr_cost.png 1014 200 cost

import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { millraceLook } from '../art/millrace';
import { HHP, HWP, paintTerrain, pictureOf, terrainOf, vnoise } from '../art/terrain';
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
// The shapes, in panel pixels (1014 x 468, world (D, D) up at its middle-top)

const D = 10;
const OX = 1014 / 2;
const OY = 468 / 2 - 24 * HHP;
const at = (px: number, py: number): [number, number] => {
  const a = (px - OX) / HWP;
  const b = (py - OY) / HHP;
  return [(a + b) / 2 + D, (b - a) / 2 + D];
};
const toPanel = (x: number, y: number): [number, number] => [OX + (x - y) * HWP, OY + (x + y - 2 * D) * HHP];
type Shape = (x: number, y: number) => boolean;
const segDist = (x: number, y: number, ax: number, ay: number, bx: number, by: number): number => {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - ax - t * dx, y - ay - t * dy);
};
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
const curveDist = (P2: number[][], x: number, y: number): number => {
  let d = Infinity;
  for (let i = 0; i + 1 < P2.length; i++) d = Math.min(d, segDist(x, y, P2[i][0], P2[i][1], P2[i + 1][0], P2[i + 1][1]));
  return d;
};
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

/** THE RIVER, winding down from the upper left. */
const RIVER_PTS = [[60, -40], [150, 80], [260, 190], [400, 262], [560, 300], [720, 330], [880, 380], [1060, 450]];
const RIVER_LINE = smooth(RIVER_PTS);
const river = gridOf((x, y) => curveDist(RIVER_LINE, x, y) / (0.9 + 0.3 * vnoise(x * 0.35, y * 0.35, 741)));
const RIVER_HALF = 0.62;
/** THE MILL RACE: off the river upstream, straight along to the wheel, and the tailrace back into the river below the mill. */
const RACE_PTS = [[170, 96], [300, 112], [460, 128], [640, 150], [760, 176]];
const TAIL_PTS = [[800, 200], [790, 260], [770, 330]];
const RACE_LINE = RACE_PTS.map(([px, py]) => at(px, py));
const TAIL_LINE = TAIL_PTS.map(([px, py]) => at(px, py));
const race = gridOf((x, y) => Math.min(curveDist(RACE_LINE, x, y), curveDist(TAIL_LINE, x, y)));
const RACE_HALF = 0.34;
/** Which way it runs: along its nearest leg, toward the wheel and on down the tailrace. */
function raceFlow(x: number, y: number): [number, number] {
  let best: [number, number] = [1, 0];
  let bd = Infinity;
  for (const L of [RACE_LINE, TAIL_LINE]) {
    for (let i = 0; i + 1 < L.length; i++) {
      const d = segDist(x, y, L[i][0], L[i][1], L[i + 1][0], L[i + 1][1]);
      if (d < bd) {
        bd = d;
        const dx = L[i + 1][0] - L[i][0];
        const dy = L[i + 1][1] - L[i][1];
        const l = Math.hypot(dx, dy) || 1;
        best = [dx / l, dy / l];
      }
    }
  }
  return best;
}
/** The mill: where it will stand (a piece), and its yard round it. */
const MILL = at(830, 170);
const yard = (x: number, y: number): boolean => {
  const [sx, sy] = toPanel(x, y);
  const u = (sx - 880) / 110;
  const v = (sy - 190) / 56;
  return u * u + v * v < 1 + 0.5 * (vnoise(x * 1.5, y * 1.5, 751) - 0.5);
};
/** THE CART TRACK, in from the left, over the cart bridge, up to the yard. */
const TRACK_PTS = [[-20, 360], [180, 340], [340, 300], [430, 262], [520, 220], [640, 200], [800, 210]];
const TRACK_LINE = smooth(TRACK_PTS);
const track = gridOf((x, y) => curveDist(TRACK_LINE, x, y));
/** A bridge across water at a point of the panel, along a way (panel pixels). */
function span(px: number, py: number, dx: number, dy: number, half: number, wide: number): Shape {
  const a = at(px - dx * half, py - dy * half);
  const b = at(px + dx * half, py + dy * half);
  return (x, y) => segDist(x, y, a[0], a[1], b[0], b[1]) < wide / 2;
}
const BRIDGES = [span(418, 268, 0.62, -0.78, 46, 1.3), span(560, 140, 0.15, 0.99, 30, 0.8)];
const onBridge = (x: number, y: number): boolean => BRIDGES.some((b) => b(x, y));
/** The rough, past the fields: across the top, and in the corner at the lower left. */
const farEdge = (sx: number): number => 46 + 20 * Math.sin(sx / 110 + 0.4) + 14 * (vnoise(sx / 60, 0, 761) - 0.5) * 2;
const corner = (x: number, y: number): boolean => {
  const [sx, sy] = toPanel(x, y);
  const u = (sx - 90) / 170;
  const v = (sy - 470) / 90;
  return u * u + v * v < 1;
};
const SHAPE: Shape = (x, y) => {
  if (onBridge(x, y)) return true;
  if (river(x, y) < RIVER_HALF || race(x, y) < RACE_HALF + 0.1) return false;
  if (corner(x, y)) return false;
  const [sx, sy] = toPanel(x, y);
  return sy > farEdge(sx);
};
const LOOK = millraceLook({ river, race, raceFlow, track, yard });

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
        for (let a = 0; a < N; a++) for (let b = 0; b < N; b++) {
          const u = (a + 0.5) / N;
          const v = (b + 0.5) / N;
          if (inside(u, v) !== shape(tx + u, ty + v)) wrong++;
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
  return { depth: 13, seed: 13, w, h, tiles, cut, variant: new Uint8Array(w * h), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
}

export const MR_FLOOR = layTiles(SHAPE, 56, 56);
const T: Terrain = terrainOf(MR_FLOOR, LOOK);
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
function standAt(g: CanvasRenderingContext2D, sp: Sprite, x: number, y: number, r: number): void {
  const [sx0, sy0] = pictureOf(x, y);
  const sx = sx0 - VX;
  const sy = sy0 - VY;
  g.fillStyle = 'rgba(25, 18, 40, 0.35)';
  g.beginPath();
  g.ellipse(sx, sy, r * 2, r * 0.9, 0, 0, Math.PI * 2);
  g.fill();
  g.drawImage(sp.img, Math.round(sx - sp.ax * 2), Math.round(sy - sp.ay * 2), sp.w * 2, sp.h * 2);
}
function title(g: CanvasRenderingContext2D, s: string): void {
  g.save();
  g.scale(2, 2);
  drawText(g, s, 4, 3, THEME.text, { shadow: P.ink });
  g.restore();
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
const HERO = at(420, 340);
void MILL;

if (HASH === 'shot' || HASH === 'tiles') {
  paintPanel(g, VX, VY, PW, PH);
  if (HASH === 'tiles') {
    g.lineWidth = 1;
    for (let ty = 0; ty < MR_FLOOR.h; ty++) {
      for (let tx = 0; tx < MR_FLOOR.w; tx++) {
        const i = ty * MR_FLOOR.w + tx;
        if (MR_FLOOR.tiles[i] !== T_FLOOR) continue;
        const c = MR_FLOOR.cut ? MR_FLOOR.cut[i] : 0;
        const pts: [number, number][] = [[tx, ty], [tx + 1, ty], [tx + 1, ty + 1], [tx, ty + 1]];
        const cornerAt = (k: number): [number, number] => {
          const [sx, sy] = pictureOf(pts[k][0], pts[k][1]);
          return [sx - VX + 0.5, sy - VY + 0.5];
        };
        const keep = c === CUT_FAR ? [1, 2, 3] : c === CUT_NEAR ? [0, 1, 3] : c === CUT_LEFT ? [0, 1, 2] : c === CUT_RIGHT ? [0, 2, 3] : [0, 1, 2, 3];
        g.strokeStyle = c ? 'rgba(255, 220, 90, 0.75)' : 'rgba(255, 255, 255, 0.45)';
        g.beginPath();
        keep.forEach((k, n) => {
          const [sx, sy] = cornerAt(k);
          if (n) g.lineTo(sx, sy);
          else g.moveTo(sx, sy);
        });
        g.closePath();
        g.stroke();
      }
    }
  }
  standAt(g, knight, HERO[0], HERO[1], 9);
  title(g, 'The Millrace');
  show(cvs);
} else if (HASH === 'close') {
  const spots: [string, number, number][] = [
    ['The fields: the corn gone over, weeds, flowers, stubble', 300, 400],
    ['The river, its bank, the cart bridge\'s crossing', 470, 270],
    ['The mill race and its kerbs; the footbridge', 600, 150],
    ['The cart track; the mill yard; the rough', 760, 120],
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
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, PW, PH);
  title(g, `The Millrace: a piece of 256 x 256 picture pixels in ${Math.min(...runs).toFixed(0)} to ${Math.max(...runs).toFixed(0)} ms`);
  show(cvs);
}
