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
//   node tools/preview.mjs src/dev/preview_fen.ts shots/fen_pieces.png 1014 2870 pieces
//     every piece (art/floor10.ts), each on the fen's peat or in its water, at the game's size (twice it where it
//     fits), with its name
//   node tools/preview.mjs src/dev/preview_fen.ts shots/fen_dressed.png 1014 468 dressed
//     the phone screen dressed with the pieces where the mock-up has its things: the boardwalks on the water, dead
//     trees standing in it, reeds at the islands' edges, the ruin with the cult's three obelisks burning round the
//     Eye's pool, the cult chanting at them

import { makeDaggerCultistArt3 } from '../art/cultists';
import { fenLook } from '../art/fen';
import { WALK_FORMS, fenPieces } from '../art/floor10';
import type { WalkForm } from '../art/floor10';
import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { HHP, HWP, paintTerrain, pictureOf, terrainOf, worldOf } from '../art/terrain';
import type { Terrain } from '../art/terrain';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { CUT_FAR, CUT_LEFT, CUT_NEAR, CUT_RIGHT, T_FLOOR, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import { THEME } from '../ui/ui';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'shot';
const PW = 1014;
const PH = HASH === 'close' ? 936 : HASH === 'cost' ? 200 : HASH === 'pieces' ? 2870 : 468;

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


// ---------------------------------------------------------------------------------------------------
// THE PIECES (art/floor10.ts): a sheet of them

/** What of the pieces stands in the fen's water, not on its peat. */
const WET = new Set(['dead swamp tree', 'drowned stump', 'arching roots', 'sunken log', 'cattails', 'lily pads', 'a sunken rowboat', 'mossy stones', 'the boardwalk', 'a marker post', "the cult's raft", "a sunken statue's head", 'fallen column drums']);

/** A patch of the fen for a piece to stand on: its peat, or its water. */
function patch(w: number, h: number, wet: boolean): HTMLCanvasElement {
  const L = fenLook({});
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = 5200 + x;
      const py = 3600 + y;
      const [wx, wy] = worldOf(px, py);
      const c = wet ? L.top(wx, wy, px, py, 1, 0) : L.floor(wx, wy, px, py, 1);
      const o = (y * w + x) * 4;
      out[o] = c[0];
      out[o + 1] = c[1];
      out[o + 2] = c[2];
      out[o + 3] = 255;
    }
  }
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  (cv.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(out, w, h), 0, 0);
  return cv;
}

/** The lights a piece gives (the cult's fire), laid over the picture as the game lays them. */
function glow(g: CanvasRenderingContext2D, sp: Sprite, sx: number, sy: number, K = 1): void {
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (const L of sp.lights ?? []) {
    const x = sx + (L.x - sp.ax) * 2 * K;
    const y = sy + (L.y - sp.ay) * 2 * K;
    const r = L.r * 2 * K;
    const n = parseInt(L.color.slice(1), 16);
    const rgba = (a: number): string => `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
    const gr = g.createRadialGradient(x, y, 1, x, y, r);
    gr.addColorStop(0, rgba((L.a ?? 0.5) * 0.55));
    gr.addColorStop(1, rgba(0));
    g.fillStyle = gr;
    g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  g.restore();
}

const WALK_NAMES: Record<WalkForm, string> = { x: 'along x', y: 'along y', upper: 'upper half', lower: 'lower half', left: 'left half', right: 'right half' };

/** Every piece of the fen's, at the game's size (twice it where it fits), each on its ground, named. */
function pieceSheet(): void {
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, PW, PH);
  const all = fenPieces().flatMap((q) =>
    (q.frames ?? []).map((sp, i) => ({
      name: q.name === 'the boardwalk' ? `the boardwalk, ${WALK_NAMES[WALK_FORMS[i]]}` : q.frames!.length > 1 ? `${q.name} ${i + 1}` : q.name,
      sp,
      kind: q.kind,
      shadow: q.shadow,
      wet: WET.has(q.name),
    })),
  );
  const COLS = 4;
  const CW = Math.floor(PW / COLS);
  const CH = 260;
  const peat = patch(CW - 6, CH - 22, false);
  const water = patch(CW - 6, CH - 22, true);
  all.forEach((it, n) => {
    const ox = (n % COLS) * CW + 3;
    const oy = Math.floor(n / COLS) * CH + 2;
    g.save();
    g.beginPath();
    g.rect(ox, oy + 18, CW - 6, CH - 22);
    g.clip();
    g.drawImage(it.wet ? water : peat, ox, oy + 18);
    const floorTile = it.kind === 'floor tile' || it.kind === 'trap';
    const ax = ox + CW / 2;
    const K = it.sp.h * 4 <= CH - 34 && it.sp.w * 4 <= CW - 10 ? 2 : 1;
    const ay = floorTile ? oy + 18 + (CH - 22) / 2 - 16 * K : oy + CH - 30;
    if (it.shadow) {
      g.fillStyle = 'rgba(25, 18, 40, 0.32)';
      g.beginPath();
      g.ellipse(ax, ay, it.shadow * HWP * 1.1 * K, it.shadow * HHP * 1.1 * K, 0, 0, Math.PI * 2);
      g.fill();
    }
    g.drawImage(it.sp.img, Math.round(ax - it.sp.ax * 2 * K), Math.round(ay - it.sp.ay * 2 * K), it.sp.w * 2 * K, it.sp.h * 2 * K);
    glow(g, it.sp, ax, ay, K);
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


// ---------------------------------------------------------------------------------------------------
// THE FEN DRESSED: its pieces where the mock-up he said yes to has its things

let PIECES: ReturnType<typeof fenPieces> | null = null;
const pieces = (): ReturnType<typeof fenPieces> => (PIECES ??= fenPieces());
function pc(name: string, frame = 0): Sprite {
  const q = pieces().find((x) => x.name === name);
  if (!q || !q.frames) throw new Error(`no piece ${name}`);
  return q.frames[Math.min(frame, q.frames.length - 1)];
}
const shadowOf = (name: string): number | undefined => pieces().find((x) => x.name === name)?.shadow;
interface Stand { x: number; y: number; sp: Sprite; shadow?: number; figure?: boolean; tall?: boolean }
function hashOf(x: number, y: number, k: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(k | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
/** How far a place is from the nearest of the fen's ground (islands, ruin, boardwalks), in tiles, out to 3. */
function shore(x: number, y: number): number {
  if (FEN_SHAPE(x, y)) return 0;
  let best = 3;
  for (let a = 0; a < 16; a++) {
    for (let r = 0.25; r < best; r += 0.25) {
      if (FEN_SHAPE(x + Math.cos((a / 16) * Math.PI * 2) * r, y + Math.sin((a / 16) * Math.PI * 2) * r)) {
        best = r;
        break;
      }
    }
  }
  return best;
}

/** How a walkable tile of the boardwalk lies: whole along x or y, or the half the level keeps. */
function walkFormOf(tx: number, ty: number): WalkForm | null {
  const i = ty * FEN_FLOOR.w + tx;
  if (FEN_FLOOR.tiles[i] !== T_FLOOR) return null;
  const c = FEN_FLOOR.cut?.[i] ?? 0;
  const form: WalkForm =
    c === CUT_NEAR ? 'upper' : c === CUT_FAR ? 'lower' : c === CUT_RIGHT ? 'left' : c === CUT_LEFT ? 'right' :
      boards(tx - 0.5, ty + 0.5) || boards(tx + 1.5, ty + 0.5) ? 'x' : 'y';
  // the middle of the half it keeps, on the boards and not on an island or the ruin
  const [u, v] = { x: [0.5, 0.5], y: [0.5, 0.5], upper: [0.3, 0.3], lower: [0.7, 0.7], left: [0.3, 0.7], right: [0.7, 0.3] }[form];
  const [x, y] = [tx + u, ty + v];
  if (!boards(x, y) || islands(x, y) || ring(x, y)) return null;
  return form;
}

function dressedShot(): void {
  paintPanel(g, VX, VY, PW, PH);
  const stands: Stand[] = [];
  // the boardwalks, floor tiles, first, on the water: every walkable tile of them
  for (let ty = 0; ty < FEN_FLOOR.h; ty++) {
    for (let tx = 0; tx < FEN_FLOOR.w; tx++) {
      const form = walkFormOf(tx, ty);
      if (!form) continue;
      const [sx, sy] = pictureOf(tx, ty);
      drawAt(g, pc('the boardwalk', WALK_FORMS.indexOf(form)), sx - VX, sy - VY);
    }
  }
  const put = (px: number, py: number, name: string, frame = 0, tall = false): void => {
    const [x, y] = at(px, py);
    stands.push({ x, y, sp: pc(name, frame), shadow: shadowOf(name), tall });
  };
  const putAt = (x: number, y: number, name: string, frame = 0, tall = false): void => {
    stands.push({ x, y, sp: pc(name, frame), shadow: shadowOf(name), tall });
  };
  // the open water: dead trees standing in it, stumps and roots, lily pads, stones; reeds in the shallows
  for (let gy = -80; gy < PH + 80; gy += 26) {
    for (let gx = -20; gx < PW + 30; gx += 30) {
      const px = Math.round(gx + (hashOf(gx, gy, 1) - 0.5) * 26);
      const py = Math.round(gy + (hashOf(gx, gy, 2) - 0.5) * 18);
      const [x, y] = at(px, py);
      const d = shore(x, y);
      const roll = hashOf(gx, gy, 3);
      if (d === 0) continue;
      if (d < 0.8) {
        if (roll < 0.3) putAt(x, y, 'cattails', roll < 0.15 ? 0 : 1);
        continue;
      }
      if (d < 1.5) continue;
      if (roll < 0.045) putAt(x, y, 'dead swamp tree', roll < 0.02 ? 0 : 1, true);
      else if (roll < 0.17) putAt(x, y, 'lily pads');
      else if (roll < 0.19) putAt(x, y, 'drowned stump');
      else if (roll < 0.21) putAt(x, y, 'mossy stones');
      else if (roll < 0.225) putAt(x, y, 'arching roots');
    }
  }
  // the fen's own, on the islands and in the water by them
  put(150, 220, 'sunken log');
  put(330, 210, 'a sunken rowboat');
  put(612, 132, 'dead swamp tree', 1, true);
  put(470, 205, 'sedge tussock');
  put(536, 262, 'pale toadstools');
  put(212, 372, "a drowned beast's ribs");
  put(292, 400, 'sedge tussock', 1);
  put(270, 352, "the drowned pilgrim's tablet");
  put(960, 392, 'pale toadstools');
  put(912, 410, 'eyespawn eggs');
  put(408, 268, 'a marker post');
  put(110, 316, 'a marker post');
  // the cult at its work: its raft moored by the boardwalk, its stores, a cage of its offerings
  put(372, 300, "the cult's raft");
  put(232, 268, "the cult's supply crates");
  put(586, 168, 'a cage of offerings');
  // the drowned ruin: its broken column and drums, the statue's head in the water, its stair down into it
  put(650, 196, 'a broken column', 0, true);
  put(902, 268, 'fallen column drums');
  put(690, 118, "a sunken statue's head");
  put(820, 328, 'a broken stair');
  // the Eye's: its eggs by the pool, its reach broken up through the paving
  put(790, 222, 'eyespawn eggs');
  put(866, 300, "the Eye's reach");
  // THE CULT'S THREE OBELISKS on the ring round the Eye's pool, burning, the cult chanting at them
  // (each behind one of the cult chanting, so that none hides them)
  for (const a of [-1.26, 2.9, -2.36]) {
    const x = PCX + Math.cos(a) * 2.7;
    const y = PCY + Math.sin(a) * 2.45;
    stands.push({ x, y, sp: pc("the cult's obelisk", 1), shadow: shadowOf("the cult's obelisk"), tall: true });
  }
  for (const [x, y] of FOES) stands.push({ x, y, sp: cultist.front.idle[0], figure: true, shadow: 0.45 });
  stands.push({ x: HERO[0], y: HERO[1], sp: knight, figure: true, shadow: 0.5 });
  stands.sort((a, b) => a.x + a.y - (b.x + b.y));
  const figures = stands.filter((st) => st.figure);
  for (const st of stands) {
    const [sx0, sy0] = pictureOf(st.x, st.y);
    const sx = sx0 - VX;
    const sy = sy0 - VY;
    if (st.shadow) {
      g.fillStyle = 'rgba(25, 18, 40, 0.32)';
      g.beginPath();
      g.ellipse(sx, sy, st.shadow * HWP * 1.1, st.shadow * HHP * 1.1, 0, 0, Math.PI * 2);
      g.fill();
    }
    // a tall thing seen through while someone stands behind it (the game's SEEN_THROUGH, 0.38)
    let alpha = 1;
    if (st.tall) {
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
    g.globalAlpha = alpha;
    drawAt(g, st.sp, sx, sy);
    g.globalAlpha = 1;
  }
  for (const st of stands) {
    const [sx0, sy0] = pictureOf(st.x, st.y);
    glow(g, st.sp, sx0 - VX, sy0 - VY);
  }
  nameAndMap(g, HERO);
  show(cvs);
}

if (HASH === 'pieces') pieceSheet();
else if (HASH === 'dressed') dressedShot();
