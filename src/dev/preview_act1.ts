// Dev page: ACT 1'S OTHER LEVELS, AS THE OWNER DESCRIBED THEM, for him to look at (12 Oct 2026).
// His words, 18:56: "How bout a mock up of what the other levels would look like?  I’d like the
// quarry and forest to be mostly open with minimal narrow paths between open areas.  The forest
// and the swamp don’t really have walls". Every edge is made his way of 18:33 (the edge painted
// round over today's tiles, which the game would still walk by):
//   6. the Quarry: open pits, short narrow cuts between them, sheer quarried walls;
//   8. Echo Canyon: the dry riverbed between red walls (the near wall cut away, as the game does);
//   9. the Pinewood: clearings and narrow paths, no walls: the trees are the edge;
//  10. the Sunken Fen: no walls: water, islands of mud, boardwalks and a ruin.
// Rough mock-up paint to show the shapes and the feel of each, not art for the game; the knight
// stands in each for scale. Nothing of the game imports it.
//   node tools/preview.mjs src/dev/preview_act1.ts previews/act1_levels.png 1280 800
// With the hash "see", the near walls drawn whole and see-through round whoever is behind them
// (his question of 19:17), beside the game's way today:
//   node tools/preview.mjs src/dev/preview_act1.ts previews/act1_see_through.png 1280 800 see
// With the hash "canyon", two ways to have Echo Canyon's walls on both sides with none in front
// (his word of 20:19), the canyon run up the screen, or across it with the near wall's shadow:
//   node tools/preview.mjs src/dev/preview_act1.ts previews/canyon_both_sides.png 1280 800 canyon
// With the hash "shot", the two together as one screen of the game on a phone held sideways,
// 507 by 234 game pixels at 2 picture pixels to one, to lay under the game's real HUD:
//   node tools/preview.mjs src/dev/preview_act1.ts shots/canyon_world.png 1014 468 shot
// With the hash "ledge", the Ledge Road the same way, for its sky (his word of 18:34: "We’ll have to
// work on the sky but the rock and the curves look good"):
//   node tools/preview.mjs src/dev/preview_act1.ts shots/ledge_world.png 1014 468 ledge
import { spriteOf3 } from '../art/heroes3';
import { hash } from '../art/kit';
import { MOVES3 } from '../art/moves3';
import { makeDaggerCultistArt3, makeMiniFleshmancerArt3 } from '../art/cultists';
import { drawText } from '../engine/font';
import { P, RARITY_COLOR } from '../art/palette';
import { THEME } from '../ui/ui';
import { drawPackMark } from '../render/pack_marks';

type RGB = [number, number, number];
const F = 2; // picture pixels per game pixel
const Z = 2; // screen pixels per picture pixel
/** "shot": one picture the size of the game's own screen on a phone held sideways (507 by 234 game pixels), to lay under the game's real HUD. */
const SHOT = decodeURIComponent(location.hash.slice(1)) === 'shot';
/** "ledge": the Ledge Road as one screen of the game, for its sky (his word of 18:34). */
/** "reveal": the same, at the place along it where the besieged town first comes into view. */
const REVEAL = decodeURIComponent(location.hash.slice(1)) === 'reveal';
const LEDGE = decodeURIComponent(location.hash.slice(1)) === 'ledge' || REVEAL;
/** "fen": the Sunken Fen as one screen of the game, at the Drowned Eye's pool. */
const FEN_SHOT = decodeURIComponent(location.hash.slice(1)) === 'fen';
/** "pine": the Pinewood as one screen of the game. */
const PINE_SHOT = decodeURIComponent(location.hash.slice(1)) === 'pine';
/** "quarry": the Quarry as one screen of the game. */
const QUARRY_SHOT = decodeURIComponent(location.hash.slice(1)) === 'quarry';
/** "hold": the Quarry's cult stronghold, at its door, as one screen of the game. */
const HOLD_SHOT = decodeURIComponent(location.hash.slice(1)) === 'hold';
const ONE_SCREEN = SHOT || LEDGE || FEN_SHOT || PINE_SHOT || QUARRY_SHOT || HOLD_SHOT;
const PW = ONE_SCREEN ? 1014 : 320 * F;
const PH = ONE_SCREEN ? 468 : 220 * F;
const HWf = 16 * F;
const HHf = 8 * F;
const OX = PW / 2;
const OY = PH / 2 - 24 * HHf; // world (12, 12) in the middle of the panel

const toWorld = (px: number, py: number): [number, number] => {
  const a = (px - OX) / HWf;
  const b = (py - OY) / HHf;
  return [(a + b) / 2, (b - a) / 2];
};
const toScreen = (x: number, y: number): [number, number] => [OX + (x - y) * HWf, OY + (x + y) * HHf];

/** A place given by where it is on the panel (picture pixels), as a world point: layouts are drawn on the screen so that each open area reads as one. */
const at = (px: number, py: number): [number, number] => toWorld(px, py);
const atAll = (pts: number[][]): number[][] => pts.map(([px, py]) => at(px, py));
/** An open area round a place on the panel, rx and ry in tiles (along x and along y). */
const area = (px: number, py: number, rx: number, ry: number, rot = 0): Shape => {
  const [x, y] = at(px, py);
  return ellipse(x, y, rx, ry, rot);
};

// ---------------------------------------------------------------------------------------------
// Noise and colour

const vn = (x: number, y: number, k: number): number => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const s = (t: number): number => t * t * (3 - 2 * t);
  const u = s(x - xi);
  const v = s(y - yi);
  const a = hash(xi, yi, k);
  const b = hash(xi + 1, yi, k);
  const c = hash(xi, yi + 1, k);
  const d = hash(xi + 1, yi + 1, k);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
const fbm = (x: number, y: number, k: number): number => 0.5 * vn(x, y, k) + 0.3 * vn(x * 2.1, y * 2.1, k + 1) + 0.2 * vn(x * 4.3, y * 4.3, k + 2);
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const bayer = (px: number, py: number): number => BAYER[(py & 3) * 4 + (px & 3)];
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const ramp = (...h: string[]): RGB[] => h.map(hex);
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const pick = (r: RGB[], t: number, px: number, py: number, dither = 0.6): RGB => {
  const i = Math.floor(t * r.length + (bayer(px, py) - 0.5) * dither);
  return r[Math.max(0, Math.min(r.length - 1, i))];
};
const rgb = (c: RGB, a = 1): string => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

// ---------------------------------------------------------------------------------------------
// Shapes, in world units (tiles)

type Shape = (x: number, y: number) => boolean;
const ellipse = (cx: number, cy: number, rx: number, ry: number, rot = 0): Shape => {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  return (x, y) => {
    const dx = x - cx;
    const dy = y - cy;
    const u = (dx * c + dy * s) / rx;
    const v = (-dx * s + dy * c) / ry;
    return u * u + v * v < 1;
  };
};
const segDist = (x: number, y: number, ax: number, ay: number, bx: number, by: number): number => {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - ax - t * dx, y - ay - t * dy);
};
const lineDist = (pts: number[][], x: number, y: number): number => {
  let d = Infinity;
  for (let i = 0; i + 1 < pts.length; i++) d = Math.min(d, segDist(x, y, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]));
  return d;
};
const path = (pts: number[][], w: number): Shape => (x, y) => lineDist(pts, x, y) < w / 2;
const rect = (x0: number, y0: number, x1: number, y1: number): Shape => (x, y) => x >= x0 && x < x1 && y >= y0 && y < y1;
const union = (...s: Shape[]): Shape => (x, y) => s.some((f) => f(x, y));

// Today's tiles: each whole, empty, or one of the four halves, whichever fits the shape best.
const enum Cut { None, Full, Left, Right, Top, Bottom }
const inCut = (c: Cut, u: number, v: number): boolean => {
  switch (c) {
    case Cut.Full: return true;
    case Cut.Left: return v > u;
    case Cut.Right: return u > v;
    case Cut.Top: return u + v < 1;
    case Cut.Bottom: return u + v > 1;
    default: return false;
  }
};
function onTiles(shape: Shape): Shape {
  const cache = new Map<number, Cut>();
  const N = 8;
  const options = [Cut.None, Cut.Full, Cut.Left, Cut.Right, Cut.Top, Cut.Bottom];
  const cutOf = (i: number, j: number): Cut => {
    const key = i * 1000 + j;
    const had = cache.get(key);
    if (had !== undefined) return had;
    const wrong = options.map(() => 0);
    for (let a = 0; a < N; a++) {
      for (let b = 0; b < N; b++) {
        const u = (a + 0.5) / N;
        const v = (b + 0.5) / N;
        const hit = shape(i + u, j + v);
        options.forEach((o, k) => {
          if (inCut(o, u, v) !== hit) wrong[k]++;
        });
      }
    }
    let c = Cut.None;
    let least = Infinity;
    options.forEach((o, k) => {
      if (wrong[k] < least - 0.5) {
        least = wrong[k];
        c = o;
      }
    });
    cache.set(key, c);
    return c;
  };
  return (x, y) => {
    const i = Math.floor(x);
    const j = Math.floor(y);
    return inCut(cutOf(i, j), x - i, y - j);
  };
}

/** The ground the hero walks on: today's tiles of the shape, the natural edge painted round over them; what is built (boards, paving) keeps its straight edge. */
interface Ground {
  walk: Shape;
  built: Shape;
  /** How far inside the rounded edge (0 at it, 1 well inside), for light and shade. */
  field: (x: number, y: number) => number;
  grad: (x: number, y: number) => [number, number];
}
const G = 16; // cells a tile
const EXT = 26; // tiles each way
function ground(natural: Shape, built: Shape = () => false, R = 0.5, k = 61): Ground {
  const tiles = onTiles(natural);
  const N = EXT * G;
  const raw = new Float32Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) raw[j * N + i] = tiles((i + 0.5) / G, (j + 0.5) / G) ? 1 : 0;
  const r = Math.round(R * G);
  const tmp = new Float32Array(N * N);
  const out = new Float32Array(N * N);
  for (let j = 0; j < N; j++) {
    let acc = 0;
    for (let i = -r; i < N + r; i++) {
      if (i + r < N && i + r >= 0) acc += raw[j * N + i + r];
      if (i - r - 1 >= 0 && i - r - 1 < N) acc -= raw[j * N + i - r - 1];
      if (i >= 0 && i < N) tmp[j * N + i] = acc / (2 * r + 1);
    }
  }
  for (let i = 0; i < N; i++) {
    let acc = 0;
    for (let j = -r; j < N + r; j++) {
      if (j + r < N && j + r >= 0) acc += tmp[(j + r) * N + i];
      if (j - r - 1 >= 0 && j - r - 1 < N) acc -= tmp[(j - r - 1) * N + i];
      if (j >= 0 && j < N) out[j * N + i] = acc / (2 * r + 1);
    }
  }
  const at = (x: number, y: number): number => {
    const i = Math.floor(x * G);
    const j = Math.floor(y * G);
    if (i < 0 || j < 0 || i >= N || j >= N) return 0;
    return out[j * N + i];
  };
  const edge = (x: number, y: number): number => 0.5 + 0.32 * (vn(x * 1.05, y * 1.05, k) - 0.5) + 0.06 * (vn(x * 6, y * 6, k + 2) - 0.5);
  return {
    walk: (x, y) => built(x, y) || at(x, y) > edge(x, y),
    built,
    field: (x, y) => Math.max(0, Math.min(1, (at(x, y) - edge(x, y)) * 2.5)),
    grad: (x, y) => [at(x + 0.12, y) - at(x - 0.12, y), at(x, y + 0.12) - at(x, y - 0.12)],
  };
}

/** Which way a face looks from how the ground lies round it: +1 to the lower left (lit), -1 to the lower right (dark), 0 at the eye. */
function shadeOf(gr: Ground, x: number, y: number): number {
  const [gx, gy] = gr.grad(x, y);
  const len = Math.hypot(gx, gy);
  if (len < 1e-6) return 0;
  return Math.max(-1, Math.min(1, (gy - gx) / len / Math.SQRT2 / 0.7));
}

// ---------------------------------------------------------------------------------------------
// Rock faces, as on the Ledge Road: layered, lit along each layer's top, cracked here and there

function strata(r: RGB[][], shade: number, v: number, px: number, k: number, H = 12, cracks = 0.3): RGB {
  const row = shade > 0.35 ? 0 : shade < -0.35 ? 2 : 1;
  const w = v + 8 * (vn(px / 46, 0, k) - 0.5) + 3 * (vn(px / 11, 1, k + 5) - 0.5);
  const j = Math.floor(w / H);
  const thick = 0.55 + 0.45 * hash(j, 7, k);
  const f = (w - j * H) / (H * thick);
  if (f > 1) return r[row][3];
  const span = 30 + Math.floor(hash(j, 0, k + 3) * 46);
  const uu = px + hash(j, 1, k + 4) * span;
  const fi = Math.floor(uu / span);
  const fpos = uu - fi * span;
  let i = 1 + (hash(j, fi, k + 2) > 0.55 ? 1 : 0);
  const top = f > 0.84;
  const bottom = f < 0.14;
  if (top) i = 0;
  else if (bottom) i = 3;
  const jag = 2.2 * (vn(v / 5, fi, k + 6) - 0.5);
  const fd = fpos - 3 - jag;
  if (hash(j, fi, k + 8) > 1 - cracks) {
    if (fd >= 0 && fd < 1.2) i = 3;
    else if (fd >= 1.2 && fd < 2.4 && !bottom) i = 0;
  }
  return r[row][i];
}

/** The quarry's walls: cut, not broken: benches where each lift of stone came off, and the marks of the drills down the face. */
function quarried(r: RGB[][], shade: number, v: number, px: number, k: number): RGB {
  const row = shade > 0.35 ? 0 : shade < -0.35 ? 2 : 1;
  const bench = 26;
  const j = Math.floor(v / bench);
  const f = (v - j * bench) / bench;
  let i = 1 + (hash(j, Math.floor((px + hash(j, 2, k) * 90) / 90), k) > 0.5 ? 1 : 0);
  if (f > 0.9) i = 0; // the bench's edge, in the light
  else if (f < 0.08) i = 3; // the shadow under the lift above
  const drill = (px + Math.floor(hash(j, 3, k) * 9)) % 9;
  if (drill === 0 && f > 0.2 && f < 0.85 && hash(j, Math.floor(px / 9), k + 1) > 0.25) i = Math.min(3, i + 1);
  if (hash(px, Math.floor(v), k + 9) > 0.975) i = Math.min(3, i + 1);
  return r[row][i];
}

// ---------------------------------------------------------------------------------------------
// A level

interface Prop {
  x: number;
  y: number;
  /** Draw it with its foot at screen (sx, sy). */
  draw: (g: CanvasRenderingContext2D, sx: number, sy: number) => void;
  /** Tall enough to hide the ground behind it: drawn see-through where it would. */
  tall?: boolean;
  /** Drawn see-through only while someone stands behind it (the tent's way), up to this many picture pixels tall. */
  seeFor?: number;
}
interface Level {
  title: string;
  note: string;
  gr: Ground;
  /** Height of what is not ground, in picture pixels: rock (+), or water (-), or 0. */
  outsideH: number;
  floor: (x: number, y: number, px: number, py: number) => RGB;
  /** The rock face at a height v over its foot, lit by shade (or a water's bank, v under the edge). */
  face: (shade: number, v: number, px: number, x: number, y: number) => RGB;
  /** What lies outside the ground: the top of the rock, the forest's floor, the water. */
  outside: (x: number, y: number, px: number, py: number) => RGB;
  lip?: RGB;
  props: Prop[];
  hero: [number, number];
  tint?: (c: RGB) => RGB;
  /** Drawn after the tint (fog, glows). */
  after?: (g: CanvasRenderingContext2D, kind: Uint8Array, top: number) => void;
}

const enum K { Floor = 1, Face = 2, Top = 3, Cut = 4, Water = 5, Bank = 6, Out = 7 }
/** How tall the near cliff's sheer face shows, in picture pixels, where it turns toward us (his word by 21:40). */
const NEAR_FACE = 40;

/** How a level is painted: the near walls left out (as the game does), or drawn whole and see-through round whoever stands behind them. */
interface Way {
  full?: boolean;
  /** The near wall's shadow across the ground, this many tiles deep (the wall stays cut away). */
  shadow?: number;
  /** Enemies standing in it, besides the knight. */
  foes?: [number, number][];
}
const cultist = makeDaggerCultistArt3();

function paintLevel(g: CanvasRenderingContext2D, top: number, L: Level, way: Way = {}): void {
  const img = g.createImageData(PW, PH);
  const d = img.data;
  // what stands in front of the ground (the near walls, drawn whole), on a layer of its own over the figures
  const occ = g.createImageData(PW, PH);
  const od = occ.data;
  const windows = [L.hero, ...(way.foes ?? [])].map(([x, y]) => {
    const [sx, sy] = toScreen(x, y);
    return [sx, sy - 15 * F] as [number, number];
  });
  const R = 26 * F;
  const seeThrough = (px: number, py: number): number => {
    let a = 1;
    for (const [sx, sy] of windows) {
      const dd = Math.hypot(px - sx, (py - sy) * 0.8);
      a = Math.min(a, dd < R * 0.62 ? 0.22 : dd > R ? 1 : 0.22 + (0.78 * (dd - R * 0.62)) / (R * 0.38));
    }
    return a;
  };
  const putOcc = (px: number, py: number, c: RGB, a: number): void => {
    const i = (py * PW + px) * 4;
    od[i] = c[0];
    od[i + 1] = c[1];
    od[i + 2] = c[2];
    od[i + 3] = Math.round(255 * a);
  };
  const kind = new Uint8Array(PW * PH);
  const depth = new Float32Array(PW * PH);
  const put = (px: number, py: number, c: RGB): void => {
    const i = (py * PW + px) * 4;
    d[i] = c[0];
    d[i + 1] = c[1];
    d[i + 2] = c[2];
    d[i + 3] = 255;
  };
  const W = L.gr.walk;
  const H = L.outsideH;
  for (let py = 0; py < PH; py++) {
    for (let px = 0; px < PW; px++) {
      const [x, y] = toWorld(px + 0.5, py + 0.5);
      depth[py * PW + px] = x + y;
      if (W(x, y)) {
        kind[py * PW + px] = K.Floor;
        put(px, py, L.floor(x, y, px, py));
        if (way.full && H > 0) {
          // does a wall nearer the eye stand over this bit of ground?
          for (let h = H; h >= 1; h--) {
            const [qx, qy] = toWorld(px + 0.5, py + 0.5 + h);
            if (!W(qx, qy)) {
              const c = h === H ? L.outside(qx, qy, px, py) : L.face(shadeOf(L.gr, qx, qy), h, px, qx, qy);
              putOcc(px, py, c, seeThrough(px, py));
              break;
            }
          }
        }
        continue;
      }
      if (H > 0) {
        // the rock: the ray from the eye meets the first of its top or its faces
        let hit = -1;
        for (let h = H; h >= 0; h--) {
          const [qx, qy] = toWorld(px + 0.5, py + 0.5 + h);
          if (!W(qx, qy)) {
            hit = h;
            break;
          }
        }
        if (hit === H) {
          const [qx, qy] = toWorld(px + 0.5, py + 0.5 + H);
          let cut = false;
          for (let k2 = 1; k2 <= (way.full ? 0 : H); k2 += 2) {
            const [fx, fy] = toWorld(px + 0.5, py + 0.5 - k2);
            if (W(fx, fy)) {
              cut = true;
              break;
            }
          }
          let c = L.outside(qx, qy, px, py);
          // (the near wall, cut away as the game cuts it: its cut face is drawn as a band under the edge, below)
          kind[py * PW + px] = cut ? K.Cut : K.Top;
          put(px, py, c);
        } else {
          const h = Math.max(0, hit);
          const [qx, qy] = toWorld(px + 0.5, py + 0.5 + h);
          kind[py * PW + px] = K.Face;
          put(px, py, L.face(shadeOf(L.gr, qx, qy), h, px, qx, qy));
        }
        continue;
      }
      if (H < 0) {
        // the water: its bank under the ground's near edge, else its face
        let bank = -1;
        for (let k2 = 1; k2 <= -H; k2++) {
          const [fx, fy] = toWorld(px + 0.5, py + 0.5 - k2);
          if (W(fx, fy)) {
            bank = k2;
            break;
          }
        }
        if (bank > 0) {
          const [fx, fy] = toWorld(px + 0.5, py + 0.5 - bank);
          kind[py * PW + px] = K.Bank;
          put(px, py, L.face(shadeOf(L.gr, fx, fy), bank, px, fx, fy));
        } else {
          kind[py * PW + px] = K.Water;
          put(px, py, L.outside(x, y, px, py));
        }
        continue;
      }
      kind[py * PW + px] = K.Out;
      put(px, py, L.outside(x, y, px, py));
    }
  }
  // the edges: a line of light where the ground ends toward the eye; shade at the foot of a face; a lit rim along a face's top
  const kindAt = (px: number, py: number): number => (px < 0 || py < 0 || px >= PW || py >= PH ? 0 : kind[py * PW + px]);
  const darken = (px: number, py: number, t: number): void => {
    const i = (py * PW + px) * 4;
    d[i] *= 1 - t;
    d[i + 1] *= 1 - t;
    d[i + 2] *= 1 - t;
  };
  /** Which way the floor's edge at (px, py) looks, out of the floor: an angle in degrees from the right, round through down (so 180 is straight left). */
  const edgeAngles = new Map<number, number>();
  const edgeAngle = (px: number, py: number): number => {
    const key = py * PW + px;
    const had = edgeAngles.get(key);
    if (had !== undefined) return had;
    let vx = 0;
    let vy = 0;
    for (let dy = -12; dy <= 12; dy++) {
      for (let dx = -12; dx <= 12; dx++) {
        if (kindAt(px + dx, py + dy) === K.Floor) {
          vx += dx;
          vy += dy;
        }
      }
    }
    const ang = vx === 0 && vy === 0 ? NaN : (Math.atan2(-vy, -vx) * 180) / Math.PI;
    edgeAngles.set(key, ang);
    return ang;
  };
  for (let py = 0; py < PH; py++) {
    for (let px = 0; px < PW; px++) {
      const k0 = kind[py * PW + px];
      if (k0 === K.Floor) {
        const below = kindAt(px, py + 1);
        const below2 = kindAt(px, py + 2);
        // (his words, 20:50: "The black line at the edge of the foreground cliff doesn’t give the
        // correct perspective"; 21:01: "You just need to get the black shadow on the south east facing
        // edges"; with a picture he painted, 21:25: "It shows the wall face as opposed to the top of
        // mesa.  Light wouldn’t hit the wall so it’s shadowed"; and by 21:40: "When the ridge line runs
        // back to the right any angle past straight down, you would see the sheer face of the cliff in
        // shadow.  So it’s not just a line on the ridge, it’s cliff face running vertically".)
        // So: where the near cliff's ridge, followed down the screen, slants back past straight down,
        // its side looks down and to the right, toward us and away from the light: its sheer face shows,
        // in shadow, hanging straight down from the ridge to the floor, NEAR_FACE picture pixels tall.
        // Elsewhere the floor runs to the near cliff's top with no line of its own.
        let under = false;
        for (let k2 = 1; k2 <= 3; k2++) if (kindAt(px, py + k2) === K.Cut) under = true;
        if (under) continue;
        if (L.lip && below !== K.Floor && below !== 0) put(px, py, L.lip);
        else if (L.lip && below2 !== K.Floor && below2 !== 0) put(px, py, mix(L.lip, [d[(py * PW + px) * 4], d[(py * PW + px) * 4 + 1], d[(py * PW + px) * 4 + 2]], 0.5));
        for (let k2 = 1; k2 <= 7; k2++) {
          if (kindAt(px, py - k2) === K.Face) {
            darken(px, py, k2 < 4 ? 0.38 : 0.22);
            break;
          }
        }
      } else if (k0 === K.Top && kindAt(px, py + 1) === K.Face) put(px, py, mix(L.outside(...toWorld(px, py + H), px, py), [255, 250, 240], 0.35));
      else if ((k0 === K.Top || k0 === K.Cut) && !way.full && H > 0) {
        // the near cliff's sheer face, where it shows: rising from the floor's edge, NEAR_FACE picture
        // pixels, on the cliff's side of it, so that the floor stays in sight; black in shadow, as it
        // looks down and to the right, away from the light
        let hit = 0;
        for (let d = 1; d <= NEAR_FACE; d++) {
          const kk = kindAt(px, py + d);
          if (kk === K.Floor) hit = d;
          if (kk !== K.Top && kk !== K.Cut) break;
        }
        if (hit) {
          const ang = edgeAngle(px, py + hit);
          if (ang < -90 || ang > 172) {
            const [qx, qy] = toWorld(px + 0.5, py + hit - 0.5);
            let c = mix(L.face(-1, hit, px, qx, qy), [22, 16, 32], 0.5);
            if (hit <= 2) c = mix(c, [16, 12, 24], 0.5); // its foot
            else if (hit >= NEAR_FACE) c = mix(L.outside(...toWorld(px, py + H), px, py), [255, 250, 240], 0.3); // its lit top edge
            put(px, py, c);
          }
        }
      }
    }
  }
  if (way.shadow && H > 0) {
    // the near wall's shadow, so that a wall is felt on that side though none is drawn
    for (let py = 0; py < PH; py++) {
      for (let px = 0; px < PW; px++) {
        if (kind[py * PW + px] !== K.Floor) continue;
        const [x, y] = toWorld(px + 0.5, py + 0.5);
        const reach = way.shadow * (0.75 + 0.5 * vn(x * 0.9 - y * 0.9, 0, 101));
        for (let t = 0.1; t <= reach; t += 0.1) {
          if (!W(x + t, y + t)) {
            darken(px, py, t > reach - 0.25 ? 0.22 : 0.36);
            break;
          }
        }
      }
    }
  }
  if (L.tint) {
    for (let i = 0; i < d.length; i += 4) {
      const c = L.tint([d[i], d[i + 1], d[i + 2]]);
      d[i] = c[0];
      d[i + 1] = c[1];
      d[i + 2] = c[2];
    }
  }
  g.putImageData(img, 0, top);
  // what stands: in order from the back, the tall ones see-through where they would hide the ground behind them
  const knight = spriteOf3(MOVES3.rear, 0, 'front');
  const stands: Prop[] = [...L.props, {
    x: L.hero[0],
    y: L.hero[1],
    draw: (gg, sx, sy) => {
      gg.fillStyle = 'rgba(25, 18, 40, 0.35)';
      gg.beginPath();
      gg.ellipse(sx, sy, 9 * F, 4 * F, 0, 0, Math.PI * 2);
      gg.fill();
      const dens = knight.density ?? 1;
      gg.drawImage(knight.img, sx - knight.ax * F, sy - knight.ay * F, (knight.img.width / dens) * F, (knight.img.height / dens) * F);
    },
  }];
  for (const [fx, fy] of way.foes ?? []) {
    stands.push({ x: fx, y: fy, draw: (gg, sx, sy) => {
      const sp = cultist.front.idle[0];
      gg.fillStyle = 'rgba(25, 18, 40, 0.35)';
      gg.beginPath();
      gg.ellipse(sx, sy, 8 * F, 3.5 * F, 0, 0, Math.PI * 2);
      gg.fill();
      const dens = sp.density ?? 1;
      gg.drawImage(sp.img, sx - sp.ax * F, sy - sp.ay * F, (sp.img.width / dens) * F, (sp.img.height / dens) * F);
    } });
  }
  stands.sort((a, b) => a.x + a.y - (b.x + b.y));
  g.save();
  g.beginPath();
  g.rect(0, top, PW, PH);
  g.clip();
  g.imageSmoothingEnabled = false;
  for (const s of stands) {
    const [sx, sy] = toScreen(s.x, s.y);
    let alpha = 1;
    if (s.tall) {
      // does it stand in front of ground the hero could be on?
      const me = s.x + s.y;
      let hidden = 0;
      for (let dy = -150; dy <= -8; dy += 4) {
        for (let dx = -24; dx <= 24; dx += 6) {
          const qx = Math.round(sx + dx);
          const qy = Math.round(sy + dy);
          if (qx < 0 || qy < 0 || qx >= PW || qy >= PH) continue;
          if (kind[qy * PW + qx] === K.Floor && depth[qy * PW + qx] < me - 0.4) hidden++;
        }
      }
      if (hidden > 10) alpha = 0.4;
    }
    if (s.seeFor) {
      const me = s.x + s.y;
      for (const [fx, fy] of [L.hero, ...(way.foes ?? [])]) {
        const [ox, oy] = toScreen(fx, fy);
        if (fx + fy < me && Math.abs(ox - sx) < (SHOT ? 46 : 34) && oy < sy + 4 && oy > sy - s.seeFor - 10) alpha = 0.38; // as the game: SEEN_THROUGH in render/render.ts
      }
    }
    g.globalAlpha = alpha;
    s.draw(g, sx, sy + top);
    g.globalAlpha = 1;
  }
  g.restore();
  if (way.full) {
    // the near walls' own line of light along their top edge, then the layer over the figures
    for (let py = 1; py < PH; py++) {
      for (let px = 0; px < PW; px++) {
        const i = (py * PW + px) * 4;
        const j = ((py - 1) * PW + px) * 4;
        if (od[i + 3] > 0 && od[j + 3] === 0) {
          od[i] = Math.min(255, od[i] + 60);
          od[i + 1] = Math.min(255, od[i + 1] + 55);
          od[i + 2] = Math.min(255, od[i + 2] + 45);
        }
      }
    }
    if (L.tint) {
      for (let i = 0; i < od.length; i += 4) {
        if (!od[i + 3]) continue;
        const c = L.tint([od[i], od[i + 1], od[i + 2]]);
        od[i] = c[0];
        od[i + 1] = c[1];
        od[i + 2] = c[2];
      }
    }
    const layer = document.createElement('canvas');
    layer.width = PW;
    layer.height = PH;
    (layer.getContext('2d') as CanvasRenderingContext2D).putImageData(occ, 0, 0);
    g.drawImage(layer, 0, top);
  }
  if (L.after) L.after(g, kind, top);
}

// ---------------------------------------------------------------------------------------------
// Things that stand

const box = (w: number, dd: number, h: number, topC: RGB, leftC: RGB, rightC: RGB) => (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  // a block w tiles along x, dd along y, h picture pixels tall, its foot's middle at (sx, sy)
  const ax = (w / 2) * HWf;
  const ay = (w / 2) * HHf;
  const bx = (dd / 2) * HWf;
  const by = (dd / 2) * HHf;
  const P = (u: number, v: number, z: number): [number, number] => [sx + u * ax - v * bx, sy + u * ay + v * by - z];
  const poly = (pts: [number, number][], c: RGB): void => {
    g.fillStyle = rgb(c);
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath();
    g.fill();
  };
  poly([P(-1, 1, 0), P(1, 1, 0), P(1, 1, h), P(-1, 1, h)], leftC); // the face toward the lower left
  poly([P(1, -1, 0), P(1, 1, 0), P(1, 1, h), P(1, -1, h)], rightC); // the face toward the lower right
  poly([P(-1, -1, h), P(1, -1, h), P(1, 1, h), P(-1, 1, h)], topC);
};
const STONE_BLOCK = box(0.9, 0.9, 22, hex('#e2d8cc'), hex('#c8baac'), hex('#8f8290'));

function pine(size: number, k: number) {
  const dark = ramp('#1d3a2b', '#285035', '#336640', '#417d4c');
  return (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
    const h = (70 + 40 * size) * F * 0.5;
    const w = (20 + 12 * size) * F * 0.5;
    g.fillStyle = 'rgba(20,30,20,0.35)';
    g.beginPath();
    g.ellipse(sx, sy, w * 0.9, w * 0.45, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#4f3727';
    g.fillRect(sx - 2 * F, sy - h * 0.3, 4 * F, h * 0.3);
    const tiers = 4;
    for (let t = 0; t < tiers; t++) {
      const yb = sy - h * 0.18 - t * h * 0.2;
      const ww = w * (1 - t * 0.2);
      const yt = yb - h * 0.34;
      g.fillStyle = rgb(dark[0]);
      g.beginPath();
      g.moveTo(sx, yt);
      g.lineTo(sx + ww, yb);
      g.lineTo(sx - ww, yb);
      g.closePath();
      g.fill();
      g.fillStyle = rgb(dark[2 + (hash(t, k, 3) > 0.5 ? 1 : 0)]);
      g.beginPath();
      g.moveTo(sx, yt);
      g.lineTo(sx - ww * 0.15, yb - 2);
      g.lineTo(sx - ww, yb);
      g.closePath();
      g.fill();
      // the jagged hem of each tier
      g.fillStyle = rgb(dark[1]);
      for (let i = -3; i <= 3; i++) g.fillRect(sx + (i / 3.5) * ww - F, yb - F, 2 * F, F * (1 + (hash(i, t, k) * 2.5) | 0));
    }
  };
}

function deadTree(k: number) {
  return (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
    g.strokeStyle = '#2f2a27';
    g.lineCap = 'round';
    const h = (50 + 30 * hash(k, 1, 1)) * F * 0.5;
    g.lineWidth = 3 * F;
    g.beginPath();
    g.moveTo(sx, sy);
    g.lineTo(sx + 2 * F, sy - h);
    g.stroke();
    g.lineWidth = 1.5 * F;
    for (let b = 0; b < 4; b++) {
      const yb = sy - h * (0.45 + b * 0.15);
      const dir = b % 2 ? 1 : -1;
      g.beginPath();
      g.moveTo(sx + F, yb);
      g.lineTo(sx + dir * (8 + 6 * hash(b, k, 2)) * F, yb - (6 + 6 * hash(b, k, 3)) * F);
      g.stroke();
    }
  };
}

function reeds(k: number) {
  return (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
    for (let i = 0; i < 6; i++) {
      const x = sx + (hash(i, k, 1) - 0.5) * 14 * F;
      const h = (6 + 8 * hash(i, k, 2)) * F;
      g.fillStyle = hash(i, k, 3) > 0.5 ? '#8a9a52' : '#6d7d40';
      g.fillRect(x, sy - h, F, h);
      if (hash(i, k, 4) > 0.6) {
        g.fillStyle = '#6b4a2e';
        g.fillRect(x - F * 0.5, sy - h - 2 * F, 2 * F, 3 * F);
      }
    }
  };
}

function boulder(r: number, lit: string, mid: string, dark: string) {
  return (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
    const w = r * HWf;
    const h = r * HWf * 0.75;
    g.fillStyle = dark;
    g.beginPath();
    g.ellipse(sx, sy - h * 0.45, w, h * 0.6, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = mid;
    g.beginPath();
    g.ellipse(sx - w * 0.12, sy - h * 0.55, w * 0.82, h * 0.5, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = lit;
    g.beginPath();
    g.ellipse(sx - w * 0.32, sy - h * 0.72, w * 0.42, h * 0.24, 0, 0, Math.PI * 2);
    g.fill();
  };
}

// ---------------------------------------------------------------------------------------------
// 6. THE QUARRY

const Q_WALL = [ramp('#ebe1d4', '#d6c9ba', '#bcae9f', '#8f8279'), ramp('#c6baae', '#aea194', '#968a7f', '#706563'), ramp('#908598', '#7a7085', '#665d72', '#4b445a')];
const Q_FLOOR = ramp('#8e8580', '#a39a93', '#b6aca3', '#c9beb3', '#dbd0c4');
const Q_GRASS = ramp('#5b7a43', '#6f904c', '#87a95b');
const Q_TOPROCK = ramp('#8f8790', '#a59ca2', '#bab1b3');
const qRails = atAll([[0, 98], [90, 118], [165, 135], [250, 150], [320, 142], [395, 160], [475, 172], [560, 182]]);
const quarryShape = union(
  area(165, 135, 2.6, 2.2, 0.3),
  area(475, 168, 2.9, 2.3, -0.2),
  area(310, 345, 2.6, 2.2, 0.4),
  path(atAll([[230, 148], [300, 140], [345, 147], [410, 162]]), 1.15),
  path(atAll([[445, 238], [410, 282], [372, 305]]), 1.1),
  path(atAll([[100, 118], [0, 92]]), 1.2),
  path(atAll([[560, 178], [640, 186]]), 1.2),
  path(atAll([[300, 410], [292, 445]]), 1.2),
);
const quarry: Level = {
  title: '6. The Quarry',
  note: 'open pits, short narrow cuts between them, sheer quarried walls',
  gr: ground(quarryShape),
  outsideH: 100,
  floor: (x, y, px, py) => {
    let c = pick(Q_FLOOR, fbm(x * 2.3, y * 2.3, 11) * 1.1 - 0.05, px, py);
    if (hash(px >> 1, py >> 1, 13) > 0.94) c = Q_FLOOR[0]; // grit
    const dr = lineDist(qRails, x, y);
    if (Math.abs(dr - 0.2) < 0.045) c = hex('#6a6470'); // the rails
    else if (Math.abs(dr - 0.2) < 0.075 && hash(Math.floor(x * 30), Math.floor(y * 30), 3) > 0.2) c = hex('#a8a4b0');
    else if (dr < 0.3 && ((x * 3.3 + y * 0.6) % 1 + 1) % 1 < 0.22) c = hex('#6e5442'); // the sleepers
    return c;
  },
  face: (shade, v, px) => quarried(Q_WALL, shade, v, px, 71),
  outside: (x, y, px, py) => (fbm(x * 0.9, y * 0.9, 21) > 0.48 ? pick(Q_GRASS, fbm(x * 4, y * 4, 23), px, py) : pick(Q_TOPROCK, fbm(x * 3, y * 3, 25), px, py)),
  lip: hex('#efe6dc'),
  props: [
    { x: at(140, 112)[0], y: at(140, 112)[1], draw: STONE_BLOCK },
    { x: at(140, 128)[0], y: at(140, 128)[1], draw: STONE_BLOCK },
    { x: at(140, 120)[0], y: at(140, 120)[1], draw: (g, sx, sy) => STONE_BLOCK(g, sx, sy - 22) },
    { x: at(200, 160)[0], y: at(200, 160)[1], draw: STONE_BLOCK },
    { x: at(520, 150)[0], y: at(520, 150)[1], draw: box(3.0, 0.8, 20, hex('#d8cdbf'), hex('#bfb2a4'), hex('#8a7d8a')) }, // the obelisk, lying where it was cut
    { x: at(445, 166)[0], y: at(445, 166)[1], draw: box(0.9, 0.7, 18, hex('#7c5e46'), hex('#6a4f3b'), hex('#4a3729')) }, // a cart on the rails
    { x: at(300, 335)[0], y: at(300, 335)[1], draw: (g, sx, sy) => {
      // a wooden crane over the third pit, a block hanging from it
      g.fillStyle = '#5c4331';
      g.fillRect(sx - 30 * F, sy - 110 * F * 0.5, 3 * F, 55 * F);
      g.fillRect(sx + 26 * F, sy - 110 * F * 0.5 + 8 * F, 3 * F, 47 * F);
      g.fillStyle = '#7a5a42';
      g.fillRect(sx - 34 * F, sy - 58 * F, 68 * F, 4 * F);
      g.fillStyle = '#c9c0b0';
      g.fillRect(sx, sy - 54 * F, F, 26 * F);
      STONE_BLOCK(g, sx, sy - 6 * F);
    } },
    { x: at(520, 200)[0], y: at(520, 200)[1], draw: boulder(0.28, '#d6cbbd', '#b3a798', '#857a7d') },
    { x: at(532, 206)[0], y: at(532, 206)[1], draw: boulder(0.18, '#d6cbbd', '#b3a798', '#857a7d') },
    { x: at(255, 360)[0], y: at(255, 360)[1], draw: boulder(0.22, '#d6cbbd', '#b3a798', '#857a7d') },
    { x: at(350, 372)[0], y: at(350, 372)[1], draw: boulder(0.3, '#d6cbbd', '#b3a798', '#857a7d') },
  ],
  hero: at(460, 186) as [number, number],
  tint: (c) => [c[0] * 1.02, c[1] * 0.99, c[2] * 0.95],
};

// ---------------------------------------------------------------------------------------------
// 8. ECHO CANYON

const C_WALL = [ramp('#f2a670', '#da8855', '#bf6c43', '#8f4b35'), ramp('#d08256', '#b66b45', '#995739', '#6e3d2d'), ramp('#9b5b49', '#804b41', '#673d39', '#4b2d31')];
const C_SAND = ramp('#b47a50', '#c58a5a', '#d59c67', '#e2af7a', '#ecc290');
const C_TOP = ramp('#a95f3f', '#bd6f49', '#cf8156');
const cYc = (x: number): number => 12 + 0.9 * Math.sin(0.33 * x + 0.4) + 0.55 * Math.sin(0.85 * x + 2.1);
let canyonChannel = (x: number, y: number): number => Math.abs(y - cYc(x) - 0.3 * Math.sin(x * 0.9));
const canyonShape: Shape = (x, y) => {
  const half = 2.0 + 0.5 * Math.sin(0.5 * x + 1.2) + 1.0 * Math.exp(-(((x - 13.5) / 1.6) ** 2));
  return y > cYc(x) - half && y < cYc(x) + half * 0.9 && x > -4 && x < 30;
};
const canyon: Level = {
  title: '8. Echo Canyon',
  note: 'the dry riverbed between red walls; the near wall cut away',
  gr: ground(canyonShape),
  outsideH: 150,
  floor: (x, y, px, py) => {
    let c = pick(C_SAND, fbm(x * 1.6, y * 1.6, 31), px, py);
    // the dry channel down the middle: river-worn stones
    const ch = canyonChannel(x, y);
    if (ch < 0.55) {
      c = mix(c, hex('#a87a5e'), 0.35);
      const cs = 0.3;
      const i = Math.floor(x / cs);
      const j = Math.floor(y / cs);
      if (hash(i, j, 33) > 0.45) {
        const cx = (i + 0.5) * cs;
        const cy = (j + 0.5) * cs;
        const dd = Math.hypot(x - cx, (y - cy) * 1.2);
        if (dd < 0.11) c = dd < 0.05 && x < cx ? hex('#ecdcc6') : hex('#c7ad92');
      }
    }
    if (fbm(x * 7, y * 7, 35) > 0.72) c = mix(c, hex('#8f5f43'), 0.4); // cracked mud
    return c;
  },
  face: (shade, v, px) => strata(C_WALL, shade, v, px, 81, 14, 0.4),
  outside: (x, y, px, py) => {
    let c = pick(C_TOP, fbm(x * 1.4, y * 1.4, 41), px, py);
    if (fbm(x * 3.1, y * 3.1, 43) > 0.66) c = hash(px >> 1, py >> 1, 45) > 0.4 ? hex('#7d7a3b') : hex('#9a9548'); // scrub
    return c;
  },
  lip: hex('#f6d6aa'),
  props: [
    { x: 9.6, y: 12.9, draw: boulder(0.42, '#e8a777', '#c47a50', '#8c4d37') },
    { x: 10.2, y: 13.4, draw: boulder(0.22, '#e8a777', '#c47a50', '#8c4d37') },
    { x: 16.4, y: 11.2, draw: boulder(0.3, '#e8a777', '#c47a50', '#8c4d37') },
    { x: 13.6, y: 13.2, draw: (g, sx, sy) => {
      // a cult supply wagon, broken down, an obelisk still lashed to it
      box(1.6, 0.9, 12, hex('#7a5638'), hex('#6a4a31'), hex('#4b3424'))(g, sx, sy - 6 * F);
      g.fillStyle = '#3e2a1e';
      for (const [u, v] of [[-0.7, 0.45], [0.7, 0.45]] as const) {
        const [wx, wy] = [sx + (u - v) * HWf * 0.8, sy + (u + v) * HHf * 0.8];
        g.beginPath();
        g.ellipse(wx, wy - 5 * F, 5 * F, 6 * F, 0, 0, Math.PI * 2);
        g.fill();
      }
      box(1.5, 0.45, 9, hex('#d4c9bb'), hex('#bcae9f'), hex('#8a7d88'))(g, sx, sy - 18 * F);
    } },
    { x: 7.2, y: 12.6, draw: (g, sx, sy) => {
      g.fillStyle = '#e9e0d0';
      g.fillRect(sx - 6 * F, sy - 2 * F, 12 * F, 2 * F); // bleached bones
      g.fillRect(sx - 2 * F, sy - 5 * F, 3 * F, 3 * F);
    } },
  ],
  hero: [11.6, 12.2],
};

// ---------------------------------------------------------------------------------------------
// 9. THE PINEWOOD

const P_GRASS = ramp('#4c7638', '#5b8a40', '#6c9c48', '#80ae56', '#95c066');
const P_DIRT = ramp('#715339', '#846344', '#977450', '#a8865e');
const P_UNDER = ramp('#2b4428', '#34512d', '#3f5f33', '#4b6c39');
const P_WATER = ramp('#3a7686', '#4a8c9c', '#62a7b6', '#86c2cc');
const pStream = atAll([[0, 262], [120, 246], [260, 250], [400, 272], [520, 300], [640, 316]]);
const pPaths = [
  atAll([[235, 150], [290, 122], [350, 132], [412, 160]]),
  atAll([[452, 238], [425, 272], [380, 296], [352, 318]]),
  atAll([[95, 120], [40, 96], [0, 92]]),
  atAll([[565, 160], [600, 140], [640, 132]]),
  atAll([[300, 418], [286, 445]]),
];
const pineShape = union(
  area(165, 140, 2.7, 2.3, 0.3),
  area(482, 182, 3.0, 2.4, -0.2),
  area(305, 352, 2.6, 2.2, 0.4),
  ...pPaths.map((p) => path(p, 1.0)),
);
const bridgeAt = atAll([[430, 262], [410, 290]]);
const inStream = (x: number, y: number): boolean => lineDist(pStream, x, y) < 0.55;
const onBridge = (x: number, y: number): boolean => lineDist(bridgeAt, x, y) < 0.42;
const pineGround = ground((x, y) => pineShape(x, y) && !inStream(x, y), onBridge);
const pineProps: Prop[] = [];
for (let j = 0; j < 26 * 2; j++) {
  for (let i = 0; i < 26 * 2; i++) {
    const x = (i + 0.2 + 0.6 * hash(i, j, 91)) * 0.5;
    const y = (j + 0.2 + 0.6 * hash(i, j, 92)) * 0.5;
    if (hash(i, j, 93) > 0.55) continue;
    let clear = true;
    for (const [dx, dy] of [[0, 0], [0.45, 0], [-0.45, 0], [0, 0.45], [0, -0.45]]) if (pineGround.walk(x + dx, y + dy) || inStream(x + dx, y + dy)) clear = false;
    if (!clear) continue;
    const [sx, sy] = toScreen(x, y);
    if (sx < -60 || sx > PW + 60 || sy < -10 || sy > PH + 200) continue;
    pineProps.push({ x, y, tall: true, draw: pine(hash(i, j, 94), i * 31 + j) });
  }
}
pineProps.push({ x: at(520, 210)[0], y: at(520, 210)[1], draw: boulder(0.25, '#a7a7a0', '#868780', '#5c5f5a') });
pineProps.push({ x: at(150, 160)[0], y: at(150, 160)[1], draw: (g, sx, sy) => {
  // a hunter's old fire pit
  g.fillStyle = '#5c5f5a';
  for (let i = 0; i < 8; i++) g.fillRect(sx + Math.cos(i * 0.8) * 9 * F - F, sy + Math.sin(i * 0.8) * 4.5 * F - F, 3 * F, 2 * F);
  g.fillStyle = '#2a2420';
  g.fillRect(sx - 4 * F, sy - F, 8 * F, 2 * F);
} });
const pinewood: Level = {
  title: '9. The Pinewood',
  note: 'clearings and narrow paths, no walls: the trees are the edge',
  gr: pineGround,
  outsideH: 0,
  floor: (x, y, px, py) => {
    if (onBridge(x, y)) {
      const along = ((x * 0.3 + y * 2.0) % 1 + 1) % 1;
      return along < 0.12 ? hex('#4a3322') : pick(P_DIRT, 0.5 + 0.4 * fbm(x * 6, y * 2, 77), px, py);
    }
    const onPath = pPaths.some((p) => lineDist(p, x, y) < 0.38);
    if (onPath) return pick(P_DIRT, fbm(x * 3, y * 3, 51), px, py);
    let c = pick(P_GRASS, fbm(x * 1.8, y * 1.8, 53) * 0.8 + pineGround.field(x, y) * 0.3, px, py);
    if (hash(px >> 1, py >> 1, 55) > 0.97) c = hex('#e8dd8a'); // flowers
    return c;
  },
  face: () => P_UNDER[0],
  outside: (x, y, px, py) => {
    if (inStream(x, y)) {
      const t = fbm(x * 2.5 + y * 0.5, y * 1.2, 61);
      let c = pick(P_WATER, t, px, py);
      if (lineDist(pStream, x, y) > 0.46) c = hex('#c9e4e6'); // foam along the banks
      return c;
    }
    let c = pick(P_UNDER, fbm(x * 2, y * 2, 63), px, py);
    if (hash(px >> 1, py >> 1, 65) > 0.93) c = hex('#6b5536'); // needles
    return c;
  },
  props: pineProps,
  hero: at(470, 196) as [number, number],
  tint: (c) => [Math.min(255, c[0] * 1.06), c[1] * 1.0, c[2] * 0.86],
  after: (g, _kind, top) => {
    // drifting fog low in the trees
    for (let n = 0; n < 6; n++) {
      const x = hash(n, 1, 71) * PW;
      const y = top + PH * (0.3 + 0.6 * hash(n, 2, 71));
      const grd = g.createRadialGradient(x, y, 4, x, y, 60 + 40 * hash(n, 3, 71));
      grd.addColorStop(0, 'rgba(235,240,230,0.16)');
      grd.addColorStop(1, 'rgba(235,240,230,0)');
      g.fillStyle = grd;
      g.fillRect(x - 130, y - 130, 260, 260);
    }
  },
};

// ---------------------------------------------------------------------------------------------
// 10. THE SUNKEN FEN

const F_MUD = ramp('#463f2c', '#544c35', '#615941', '#6f674c');
const F_GRASS = ramp('#566a37', '#677d41', '#7a904b');
const F_WATER = ramp('#1c3532', '#223f3a', '#284a43', '#30584d');
const F_PLANK = ramp('#674b35', '#7a5b3e', '#8d6c48', '#a07d55');
const F_STONE = ramp('#5f5a6a', '#736d7e', '#878192', '#9b96a4');
const fMagic = [[21, 9.5], [17.6, 10.6], [14.6, 12.0], [11.2, 13.4], [5, 15.5]];
const fBoards = union(rect(9.4, 9.0, 13.2, 9.9), rect(12.4, 9.0, 13.2, 10.9), rect(11.0, 14.4, 11.9, 16.2), rect(11.0, 14.4, 13.4, 15.3), rect(16.6, 12.2, 22, 13.1));
const fRuin = rect(13.0, 10.8, 16.6, 14.4);
const fenGround = ground(union(ellipse(7.4, 9.0, 2.5, 1.9, 0.5), ellipse(10.6, 17.8, 2.3, 1.8, 0.2), ellipse(18.6, 16.4, 1.4, 1.0, 0)), union(fBoards, fRuin));
const fen: Level = {
  title: '10. The Sunken Fen',
  note: 'no walls: water, islands of mud, boardwalks and a ruin',
  gr: fenGround,
  outsideH: -6,
  floor: (x, y, px, py) => {
    if (fRuin(x, y)) {
      // old paving, sunk and cracked, with moss in the joints
      const u = x * 1.6;
      const v = y * 1.6;
      const joint = Math.min(((u % 1) + 1) % 1, ((v % 1) + 1) % 1) < 0.07;
      if (joint) return fbm(x * 3, y * 3, 81) > 0.45 ? hex('#4d6a3a') : F_STONE[0];
      return pick(F_STONE, 0.3 + 0.6 * hash(Math.floor(u), Math.floor(v), 83), px, py, 0.3);
    }
    if (fBoards(x, y)) {
      const alongX = fBoards(x, y) && (rect(9.4, 9.0, 13.2, 9.9)(x, y) || rect(11.0, 14.4, 13.4, 15.3)(x, y) || rect(16.6, 12.2, 22, 13.1)(x, y));
      const t = alongX ? x : y;
      const plank = Math.floor(t * 3.2);
      if (((t * 3.2) % 1 + 1) % 1 < 0.14) return hex('#3a2a1f');
      return pick(F_PLANK, 0.25 + 0.6 * hash(plank, 1, 85), px, py, 0.3);
    }
    let c = pick(F_MUD, fbm(x * 2.2, y * 2.2, 87), px, py);
    if (fbm(x * 1.3, y * 1.3, 89) > 0.5) c = pick(F_GRASS, fbm(x * 5, y * 5, 91), px, py);
    return c;
  },
  face: (_shade, v, px, x, y) => (fBoards(x, y) || fRuin(x, y) ? (px % 18 < 3 ? hex('#2e221a') : hex(fRuin(x, y) ? '#4a4556' : '#4b3626')) : v < 2 ? hex('#3a3426') : hex('#2b281e')),
  outside: (x, y, px, py) => {
    let c = pick(F_WATER, fbm(x * 1.2, y * 1.2, 93), px, py);
    // ripples, the sky caught in them, lily pads and scum
    if (Math.abs(((fbm(x * 0.8, y * 0.8, 95) * 9) % 1) - 0.5) < 0.05) c = hex('#3f6a5c');
    const lp = fbm(x * 2.4, y * 2.4, 97);
    if (lp > 0.68) c = hash(px >> 2, py >> 2, 99) > 0.25 ? hex('#4c7238') : hex('#6c9548');
    else if (lp > 0.62) c = hex('#35574a');
    // the line of the Eye's magic, out across the water toward the town
    const dm = lineDist(fMagic, x, y);
    if (dm < 0.05) c = hex('#ffd0f4');
    else if (dm < 0.12) c = hex('#ff5fd2');
    return c;
  },
  lip: hex('#8f8462'),
  props: [
    { x: 6.4, y: 8.2, tall: true, draw: deadTree(1) },
    { x: 9.6, y: 18.6, tall: true, draw: deadTree(2) },
    { x: 19.0, y: 16.0, tall: true, draw: deadTree(3) },
    { x: 5.6, y: 10.4, draw: reeds(1) },
    { x: 8.9, y: 10.6, draw: reeds(2) },
    { x: 12.2, y: 19.4, draw: reeds(3) },
    { x: 9.0, y: 16.4, draw: reeds(4) },
    { x: 17.4, y: 17.2, draw: reeds(5) },
    { x: 13.4, y: 11.2, draw: box(0.5, 0.5, 46, hex('#9b96a4'), hex('#878192'), hex('#5f5a6a')) },
    { x: 16.2, y: 11.2, draw: box(0.5, 0.5, 24, hex('#9b96a4'), hex('#878192'), hex('#5f5a6a')) },
    { x: 13.4, y: 14.0, draw: box(0.5, 0.5, 32, hex('#9b96a4'), hex('#878192'), hex('#5f5a6a')) },
    { x: 16.2, y: 14.0, draw: box(0.5, 0.5, 52, hex('#9b96a4'), hex('#878192'), hex('#5f5a6a')) },
    { x: 14.8, y: 12.6, draw: (g, sx, sy) => {
      // the obelisk the cult raised in the ruin, its runes burning with the Eye's light
      box(0.6, 0.6, 70, hex('#5a5466'), hex('#4a4556'), hex('#34303f'))(g, sx, sy);
      g.fillStyle = '#ff5fd2';
      for (let i = 0; i < 5; i++) g.fillRect(sx - 6 * F, sy - (14 + i * 11) * F * 0.5 - 8, 3 * F, 2 * F);
    } },
  ],
  hero: [14.0, 13.6],
  tint: (c) => [c[0] * 0.74, c[1] * 0.72, c[2] * 0.88],
  after: (g, _kind, top) => {
    // the Eye's glow on the water, and the mist
    const glows: [number, number, number][] = [...fMagic.map(([x, y]) => [x, y, 40] as [number, number, number]), [14.8, 12.6, 90]];
    for (const [x, y, r] of glows) {
      const [sx, sy] = toScreen(x, y);
      const grd = g.createRadialGradient(sx, top + sy, 2, sx, top + sy, r);
      grd.addColorStop(0, 'rgba(255,95,210,0.32)');
      grd.addColorStop(1, 'rgba(255,95,210,0)');
      g.fillStyle = grd;
      g.fillRect(sx - r, top + sy - r, 2 * r, 2 * r);
    }
    for (let n = 0; n < 12; n++) {
      const x = hash(n, 1, 73) * PW;
      const y = top + PH * hash(n, 2, 73);
      const grd = g.createRadialGradient(x, y, 4, x, y, 60 + 60 * hash(n, 3, 73));
      grd.addColorStop(0, 'rgba(190,210,200,0.22)');
      grd.addColorStop(1, 'rgba(190,210,200,0)');
      g.fillStyle = grd;
      g.fillRect(x - 130, y - 130, 260, 260);
    }
  },
};

// ---------------------------------------------------------------------------------------------
// The page

const canyonFoe: [number, number] = [14.8, cYc(14.8) + 1.0];
const quarryFoe = at(300, 372) as [number, number];
const HASH = decodeURIComponent(location.hash.slice(1));
const SEE = HASH === 'see';
const BOTH = HASH === 'canyon';

/** A canyon that runs up the screen, toward the eye: its two walls stand to the left and the right, and none in front. */
const upMid = (sy: number): number => 320 + 120 * Math.sin(sy / 70 + 0.2) + 24 * Math.sin(sy / 29 + 1.3);
const upHalf = (sy: number): number => 66 + 14 * Math.sin(sy / 57 + 0.5) + 30 * Math.exp(-(((sy - 250) / 55) ** 2));
const upShape: Shape = (x, y) => {
  const [sx, sy] = toScreen(x, y);
  return Math.abs(sx - upMid(sy)) < upHalf(sy);
};
const upChannel = (x: number, y: number): number => {
  const [sx, sy] = toScreen(x, y);
  return Math.abs(sx - upMid(sy) - 10 * Math.sin(sy / 20)) / HWf;
};

/** A spire of rock standing out of the near wall, see-through when someone is behind it. */
const spire = (h: number, k: number) => (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  const tiers: [number, number][] = [[1.0, h * 0.45], [0.72, h * 0.32], [0.45, h * 0.23]];
  let z = 0;
  tiers.forEach(([w, th], i) => {
    const lit = C_WALL[0][1 + ((i + k) % 2)];
    box(w, w, th, C_TOP[2], lit, C_WALL[2][1 + ((i + k) % 2)])(g, sx + (hash(i, k, 7) - 0.5) * 6 * F, sy - z);
    z += th;
  });
};
/** A hoodoo: a round column of banded rock with a harder cap, painted pixel by pixel, lit from the left. */
const hoodoo = (h: number, R: number, k: number) => {
  const W = 2 * R + 10;
  const Hc = h + R + 12;
  const cx = R + 5;
  const cy = Hc - R * 0.5 - 4;
  let img: HTMLCanvasElement | null = null;
  const r = (v: number): number => {
    const t = Math.max(0, Math.min(1, v / h));
    if (t > 0.86) return R * (0.74 + 0.04 * Math.sin(v / 3 + k));
    const neck = 1 - 0.42 * t - 0.12 * Math.exp(-(((t - 0.8) / 0.06) ** 2));
    const ledge = 1 + 0.1 * Math.exp(-(((t - 0.38) / 0.035) ** 2)) + 0.08 * Math.exp(-(((t - 0.62) / 0.03) ** 2));
    return R * neck * ledge * (1 + 0.06 * Math.sin(v / 11 + k * 3) + 0.035 * Math.sin(v / 4.3 + k));
  };
  const paint = (): HTMLCanvasElement => {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = Hc;
    const cg = c.getContext('2d') as CanvasRenderingContext2D;
    const id = cg.createImageData(W, Hc);
    const d = id.data;
    const rh = r(h);
    for (let y = 0; y < Hc; y++) {
      for (let x = 0; x < W; x++) {
        const u = x - cx + 0.5;
        const v0 = cy - y;
        const rv = r(Math.max(0, v0));
        let col: RGB | null = null;
        if (Math.abs(u) <= rv) {
          const v = v0 + 0.5 * Math.sqrt(rv * rv - u * u);
          const nx = u / rv;
          if (v >= 0 && v <= h) {
            const cap = v > h * 0.86;
            const shade = 0.2 - 0.95 * nx;
            col = cap ? C_WALL[shade > 0.35 ? 1 : shade < -0.35 ? 2 : 1][shade > 0.35 ? 1 : 2] : strata(C_WALL, shade, v, u * 1.6 + 60 + k * 40, 90 + k, 10, 0.25);
            col = mix(col, [40, 18, 20], Math.max(0, nx) * 0.22);
            if (u < -rv + 1.6) col = mix(col, [255, 214, 170], 0.35); // the lit edge
            if (!cap && v > h * 0.82) col = mix(col, [50, 22, 24], 0.45); // shade under the cap
            if (v < 6) col = mix(col, [70, 34, 28], 0.3 * (1 - v / 6)); // where it meets the sand
          }
        }
        const dy = y - (cy - h);
        if (!col && (u / rh) ** 2 + (dy / (rh / 2)) ** 2 <= 1) {
          col = pick(C_TOP, fbm(x * 0.2, y * 0.2, 60 + k), x, y);
          if ((u / rh) ** 2 + ((dy + 1.5) / (rh / 2)) ** 2 > 1) col = mix(col, [255, 220, 180], 0.3);
        }
        if (!col) continue;
        const i = (y * W + x) * 4;
        d[i] = col[0];
        d[i + 1] = col[1];
        d[i + 2] = col[2];
        d[i + 3] = 255;
      }
    }
    cg.putImageData(id, 0, 0);
    return c;
  };
  return (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
    img ??= paint();
    g.fillStyle = 'rgba(45, 16, 12, 0.32)';
    g.beginPath();
    g.ellipse(sx + R * 0.7, sy + 3, R * 1.5, R * 0.55, 0, 0, Math.PI * 2);
    g.fill();
    g.drawImage(img, Math.round(sx - cx), Math.round(sy - cy));
  };
};
// ---------------------------------------------------------------------------------------------
// THE SHOT: Echo Canyon both ways at once, as the game would show it

const shotLine = atAll([[300, -80], [330, 30], [365, 120], [425, 186], [507, 236], [598, 266], [668, 300], [712, 380], [736, 540]]);
const shotGround = ground(union(path(shotLine, 3.7), area(560, 250, 1.6, 1.2, 0.3)));
const lineAt = (x: number, y: number): number => lineDist(shotLine, x, y);
const SHOT_H = 150;
const shotLevel: Level = {
  ...canyon,
  title: '',
  note: '',
  gr: shotGround,
  outsideH: SHOT_H,
  floor: (x, y, px, py) => {
    let c = pick(C_SAND, fbm(x * 1.6, y * 1.6, 31), px, py);
    // ripples the wind has left in the sand
    const rip = Math.sin(x * 5.2 + y * 1.6 + 3 * fbm(x * 0.7, y * 0.7, 201));
    if (rip > 0.93) c = mix(c, hex('#f3cf9c'), 0.5);
    else if (rip < -0.95) c = mix(c, hex('#a96f47'), 0.35);
    const dl = lineAt(x, y);
    // the cult's wheel ruts, down the middle of the road
    if (Math.abs(dl - 0.55) < 0.06 || Math.abs(dl - 0.05) < 0.04) c = mix(c, hex('#8f5a3c'), 0.45);
    // river-worn stones, off to one side of the ruts
    if (dl > 0.8 && dl < 1.35) {
      const cs = 0.3;
      const i = Math.floor(x / cs);
      const j = Math.floor(y / cs);
      if (hash(i, j, 33) > 0.55) {
        const cx = (i + 0.5) * cs;
        const cy = (j + 0.5) * cs;
        const dd = Math.hypot(x - cx, (y - cy) * 1.2);
        if (dd < 0.1) c = dd < 0.045 && x < cx ? hex('#f0e2cd') : hex('#c9ae93');
      }
    }
    if (fbm(x * 7, y * 7, 35) > 0.74) c = mix(c, hex('#8f5f43'), 0.35); // cracked mud
    return c;
  },
  face: (shade, v, px) => {
    let c = strata(C_WALL, shade, v, px, 81, 14, 0.4);
    const col = Math.floor(px / 3);
    // desert varnish, streaked down the face from its top
    if (hash(col, 0, 211) > 0.8 && v > SHOT_H * (0.3 + 0.5 * hash(col, 1, 211))) c = mix(c, [70, 34, 34], 0.32);
    if (v > SHOT_H - 6) c = mix(c, [60, 28, 30], 0.4); // the shadow under the lip of the top
    return c;
  },
  outside: (x, y, px, py) => {
    let c = pick(C_TOP, fbm(x * 1.4, y * 1.4, 41), px, py);
    // the hard pale caprock: a rim of it along the cliff's edge, and slabs of it out across the top
    const rimW = 2.2 + 0.3 * vn(x * 1.3, y * 1.3, 49) - lineAt(x, y);
    const slabW = fbm(x * 0.55, y * 0.55, 48) - 0.6;
    const on = Math.max(rimW, slabW * 3);
    if (on > 0) {
      c = pick(ramp('#c98b63', '#d69b70', '#e2ab7f'), 0.2 + 0.7 * fbm(x * 2.4, y * 2.4, 46), px, py);
      if (Math.abs(fbm(x * 2.2, y * 2.2, 42) - 0.5) < 0.014 || Math.abs(fbm(x * 1.1 + 7, y * 1.1, 42) - 0.5) < 0.01) c = hex('#8e5039'); // its cracks
      else if (on < 0.06) c = mix(c, hex('#7e3f2c'), 0.45); // its worn edge
      return c;
    }
    if (fbm(x * 3.1, y * 3.1, 43) > 0.68) c = hash(px >> 1, py >> 1, 45) > 0.4 ? hex('#7d7a3b') : hex('#9a9548'); // scrub
    if (Math.abs(fbm(x * 0.9, y * 0.9, 47) - 0.5) < 0.008) c = hex('#7e3f2c'); // cracks in the mesa
    if (hash(px >> 1, py >> 1, 44) > 0.985) c = hash(px >> 1, py >> 1, 43) > 0.5 ? hex('#e9b88f') : hex('#6e3a2a'); // pebbles
    return c;
  },
  props: [],
  hero: at(507, 246) as [number, number],
  tint: (c) => [Math.min(255, c[0] * 1.04), c[1] * 0.99, c[2] * 0.9],
};
const pt = (px: number, py: number): { x: number; y: number } => {
  const [x, y] = at(px, py);
  return { x, y };
};
const shrub = (k: number) => (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  g.strokeStyle = hash(k, 1, 5) > 0.5 ? '#7d6a3e' : '#94804a';
  g.lineWidth = F;
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (hash(i, k, 2) - 0.5) * 2.2;
    const r = (5 + 5 * hash(i, k, 3)) * F;
    g.beginPath();
    g.moveTo(sx, sy);
    g.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r * 0.7);
    g.stroke();
  }
};
const banner = (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  // a cult banner staked in the sand: violet cloth, the cult's pink mark
  g.fillStyle = '#3e2a1e';
  g.fillRect(sx - F, sy - 46 * F, 2 * F, 46 * F);
  g.fillStyle = '#4a2a63';
  g.fillRect(sx + F, sy - 44 * F, 14 * F, 22 * F);
  g.fillStyle = '#3a2050';
  g.fillRect(sx + F, sy - 24 * F, 14 * F, 3 * F);
  g.fillStyle = '#ff5fd2';
  g.fillRect(sx + 6 * F, sy - 38 * F, 4 * F, 10 * F);
  g.fillRect(sx + 4 * F, sy - 34 * F, 8 * F, 2 * F);
};
const sprite = (sp: { img: HTMLCanvasElement; ax: number; ay: number; density?: number }) => (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  g.fillStyle = 'rgba(25, 18, 40, 0.35)';
  g.beginPath();
  g.ellipse(sx, sy, 8 * F, 3.5 * F, 0, 0, Math.PI * 2);
  g.fill();
  const dens = sp.density ?? 1;
  g.drawImage(sp.img, sx - sp.ax * F, sy - sp.ay * F, (sp.img.width / dens) * F, (sp.img.height / dens) * F);
};
const miniFm = makeMiniFleshmancerArt3();

// ---- THE CLIFF TOPS, DRESSED. His word at 20:35: "If we really decorate the tops of the cliffs it will
// look really good". High desert up there: junipers, sage, yucca, dead trees, boulders, small hoodoos,
// cairns and a bleached skull; and the cult's lookout on the far top (a tent, a pink watchfire, a
// banner, a hoist that lets its crates down the cliff to the road). Nothing up there may stand over the
// canyon's floor, so the hero and every warning stay in sight.
const SK = { Floor: 1, Top: 2, Face: 3 } as const;
const shotKind = (px: number, py: number): number => {
  const [x, y] = toWorld(px + 0.5, py + 0.5);
  if (shotGround.walk(x, y)) return SK.Floor;
  const [qx, qy] = toWorld(px + 0.5, py + 0.5 + SHOT_H);
  return shotGround.walk(qx, qy) ? SK.Face : SK.Top;
};
const groundShadow = (g: CanvasRenderingContext2D, sx: number, sy: number, rx: number, ry: number): void => {
  g.fillStyle = 'rgba(60, 20, 14, 0.3)';
  g.beginPath();
  g.ellipse(sx + rx * 0.35, sy + 1, rx, ry, 0, 0, Math.PI * 2);
  g.fill();
};
const blob = (g: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, c: string): void => {
  g.fillStyle = c;
  g.beginPath();
  g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  g.fill();
};
/** A twisted juniper: a gnarled grey trunk and clumps of dark blue-green, lit from the upper left. */
const juniper = (k: number, s: number) => (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  groundShadow(g, sx + 6 * F * s, sy, 13 * F * s, 4 * F * s);
  g.strokeStyle = '#5b4438';
  g.lineCap = 'round';
  g.lineWidth = 2.6 * F * s;
  const tx = sx + (hash(k, 2, 9) - 0.5) * 8 * F * s;
  const ty = sy - 11 * F * s;
  g.beginPath();
  g.moveTo(sx, sy);
  g.quadraticCurveTo(sx + (hash(k, 1, 9) - 0.5) * 10 * F * s, sy - 6 * F * s, tx, ty);
  g.stroke();
  const n = 3 + Math.floor(hash(k, 3, 9) * 3);
  const clumps: [number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    clumps.push([tx + (hash(i, k, 11) - 0.5) * 22 * F * s, ty - (3 + 11 * hash(i, k, 12)) * F * s, (4.5 + 3 * hash(i, k, 13)) * F * s]);
  }
  g.lineWidth = 1.3 * F * s;
  for (const [cx, cy] of clumps) {
    g.beginPath();
    g.moveTo(tx, ty);
    g.lineTo(cx, cy + 2 * F * s);
    g.stroke();
  }
  clumps.sort((a, b) => a[1] - b[1]);
  for (const [cx, cy, r] of clumps) blob(g, cx, cy, r, r * 0.72, '#2d4636');
  for (const [cx, cy, r] of clumps) blob(g, cx - r * 0.18, cy - r * 0.16, r * 0.78, r * 0.55, '#456447');
  for (const [cx, cy, r] of clumps) blob(g, cx - r * 0.4, cy - r * 0.34, r * 0.38, r * 0.26, '#6c8d5e');
  g.fillStyle = '#9bb3c4'; // the berries, a dusty blue
  for (let i = 0; i < 6; i++) {
    const [cx, cy, r] = clumps[i % clumps.length];
    g.fillRect(Math.round(cx + (hash(i, k, 14) - 0.5) * r), Math.round(cy + (hash(i, k, 15) - 0.5) * r * 0.6), F, F);
  }
};
/** A clump of sagebrush: low grey-green domes. */
const sage = (k: number, s: number) => (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  groundShadow(g, sx + 2 * F * s, sy, 9 * F * s, 3 * F * s);
  const n = 2 + Math.floor(hash(k, 1, 21) * 3);
  for (let i = 0; i < n; i++) {
    const cx = sx + (i - (n - 1) / 2) * 5 * F * s + (hash(i, k, 22) - 0.5) * 3 * F;
    const r = (3 + 2.5 * hash(i, k, 23)) * F * s;
    blob(g, cx, sy - r * 0.6, r, r * 0.75, '#6a7552');
    blob(g, cx - r * 0.2, sy - r * 0.75, r * 0.75, r * 0.5, '#8d9a6e');
    blob(g, cx - r * 0.4, sy - r * 0.95, r * 0.35, r * 0.24, '#b6c096');
  }
};
/** A yucca: a rosette of spikes, sometimes with a tall stalk of cream flowers. */
const yucca = (k: number, s: number) => (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  groundShadow(g, sx + 3 * F * s, sy, 8 * F * s, 3 * F * s);
  g.lineCap = 'round';
  g.lineWidth = 1.1 * F;
  for (let i = 0; i < 13; i++) {
    const a = -Math.PI / 2 + (i / 12 - 0.5) * 2.6 + (hash(i, k, 31) - 0.5) * 0.3;
    const len = (6 + 6 * hash(i, k, 32)) * F * s;
    g.strokeStyle = hash(i, k, 33) > 0.45 ? '#6f8c4b' : '#9ab567';
    g.beginPath();
    g.moveTo(sx, sy - 2 * F);
    g.lineTo(sx + Math.cos(a) * len, sy - 2 * F + Math.sin(a) * len * 0.9);
    g.stroke();
  }
  if (hash(k, 4, 31) > 0.45) {
    g.strokeStyle = '#7c6a46';
    g.lineWidth = 1.2 * F;
    g.beginPath();
    g.moveTo(sx, sy - 6 * F);
    g.lineTo(sx + F, sy - 30 * F * s);
    g.stroke();
    for (let i = 0; i < 7; i++) blob(g, sx + F + (hash(i, k, 34) - 0.5) * 5 * F, sy - (22 + 9 * hash(i, k, 35)) * F * s, 1.6 * F, 1.3 * F, i % 3 ? '#efe4bd' : '#cbbd8f');
  }
};
/** A cairn: flat stones stacked by someone who came this way before. */
const cairn = (k: number) => (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  groundShadow(g, sx + 3 * F, sy, 9 * F, 3 * F);
  let y = sy;
  for (let i = 0; i < 5; i++) {
    const w = (8 - i * 1.3) * F;
    const h = (2.6 + hash(i, k, 41)) * F;
    const x = sx + (hash(i, k, 42) - 0.5) * 2 * F;
    blob(g, x, y - h * 0.5, w, h * 0.7, '#7e6a5e');
    blob(g, x - w * 0.15, y - h * 0.7, w * 0.8, h * 0.45, '#ab9584');
    blob(g, x - w * 0.4, y - h * 0.85, w * 0.3, h * 0.2, '#d6c3ae');
    y -= h * 1.1;
  }
};
/** A bleached skull of some great horned beast, half in the dust. */
const skull = (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  groundShadow(g, sx + 2 * F, sy, 8 * F, 2.5 * F);
  g.strokeStyle = '#e8dfcc';
  g.lineWidth = 1.6 * F;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(sx - 3 * F, sy - 5 * F);
  g.quadraticCurveTo(sx - 10 * F, sy - 6 * F, sx - 11 * F, sy - 11 * F);
  g.moveTo(sx + 3 * F, sy - 5 * F);
  g.quadraticCurveTo(sx + 10 * F, sy - 6 * F, sx + 11 * F, sy - 11 * F);
  g.stroke();
  blob(g, sx, sy - 4 * F, 4 * F, 3 * F, '#efe8d8');
  blob(g, sx, sy - F, 2.4 * F, 2.2 * F, '#e1d6c1');
  g.fillStyle = '#4a3530';
  g.fillRect(sx - 3 * F, sy - 5 * F, 2 * F, 2 * F);
  g.fillRect(sx + F, sy - 5 * F, 2 * F, 2 * F);
};
/** The cult's watchfire: a ring of stones, its fire burning the cult's pink. */
const watchfire = (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  const glow = g.createRadialGradient(sx, sy, 2 * F, sx, sy, 20 * F);
  glow.addColorStop(0, 'rgba(255, 95, 210, 0.34)');
  glow.addColorStop(1, 'rgba(255, 95, 210, 0)');
  g.fillStyle = glow;
  g.beginPath();
  g.ellipse(sx, sy, 20 * F, 10 * F, 0, 0, Math.PI * 2);
  g.fill();
  blob(g, sx, sy, 9 * F, 4.5 * F, '#2a1824');
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const x = sx + Math.cos(a) * 9 * F;
    const y = sy + Math.sin(a) * 4.5 * F;
    blob(g, x, y - F, 2.6 * F, 1.8 * F, '#6e5650');
    blob(g, x - 0.6 * F, y - 1.6 * F, 1.4 * F, F, '#a58c80');
  }
  const flame = (h: number, w: number, dx: number, c: string): void => {
    g.fillStyle = c;
    g.beginPath();
    g.moveTo(sx + dx - w, sy - F);
    g.quadraticCurveTo(sx + dx - w * 0.8, sy - h * 0.5, sx + dx + w * 0.2, sy - h);
    g.quadraticCurveTo(sx + dx + w * 0.7, sy - h * 0.45, sx + dx + w, sy - F);
    g.closePath();
    g.fill();
  };
  flame(20 * F, 6 * F, 0, '#c2318f');
  flame(15 * F, 4.5 * F, -2 * F, '#ff5fd2');
  flame(9 * F, 2.6 * F, -F, '#ffc2ef');
  for (let i = 0; i < 4; i++) blob(g, sx + (i - 1) * 3 * F + 2 * F, sy - (26 + i * 9) * F, (3 + i) * F, (2.2 + i * 0.6) * F, `rgba(120, 100, 120, ${0.32 - i * 0.06})`);
};
/** A cult tent, its cloth the cult's violet, the pink mark on its flap. */
const cultTent = (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  groundShadow(g, sx + 10 * F, sy, 24 * F, 7 * F);
  const L = (dx: number, dy: number): [number, number] => [sx + dx * F, sy + dy * F];
  const poly = (pts: [number, number][], c: string): void => {
    g.fillStyle = c;
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath();
    g.fill();
  };
  // the ridge runs from front-left to back-right; the near end is a triangle, the long side a slope
  poly([L(-16, 0), L(0, -26), L(22, -37), L(22, -11), L(6, -3)], '#3a2150'); // the side in shade
  poly([L(0, -26), L(22, -37), L(30, -14), L(10, -3)], '#2e1a40');
  poly([L(-16, 0), L(0, -26), L(12, 0)], '#5b3780'); // the near end, lit
  poly([L(-6, 0), L(0, -14), L(5, 0)], '#1c1022'); // its door
  g.fillStyle = '#ff5fd2';
  g.fillRect(sx - 9 * F, sy - 13 * F, 2 * F, 5 * F);
  g.fillRect(sx - 10 * F, sy - 11 * F, 4 * F, F);
  g.strokeStyle = '#6b4b33';
  g.lineWidth = 1.4 * F;
  g.beginPath();
  g.moveTo(sx, sy - 26 * F);
  g.lineTo(sx, sy - 31 * F);
  g.stroke();
};
/** The cult's hoist at the top of the far cliff, a crate let down on its rope to the road below. */
const hoist = (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  groundShadow(g, sx + 4 * F, sy, 14 * F, 4 * F);
  g.strokeStyle = '#6b4b33';
  g.lineCap = 'round';
  g.lineWidth = 2.2 * F;
  g.beginPath();
  g.moveTo(sx - 9 * F, sy + F);
  g.lineTo(sx, sy - 30 * F);
  g.lineTo(sx + 9 * F, sy - F);
  g.moveTo(sx - 5 * F, sy - 12 * F);
  g.lineTo(sx + 5 * F, sy - 12 * F);
  g.stroke();
  // the arm out over the edge, toward the road
  const ax = sx - 20 * F;
  const ay = sy - 24 * F;
  g.lineWidth = 2.6 * F;
  g.strokeStyle = '#7d5a3e';
  g.beginPath();
  g.moveTo(sx + 4 * F, sy - 32 * F);
  g.lineTo(ax, ay);
  g.stroke();
  blob(g, ax, ay + F, 2.6 * F, 2.6 * F, '#3b2a22');
  blob(g, ax, ay + F, 1.2 * F, 1.2 * F, '#a08060');
  const drop = ay + 2 * F + SHOT_H * 0.62;
  g.fillStyle = '#d8c7a2';
  g.fillRect(ax - F * 0.5, ay + 2 * F, F, drop - ay - 2 * F);
  box(0.42, 0.42, 13, hex('#9a7550'), hex('#866444'), hex('#5e4430'))(g, ax, drop + 14);
};
/** One thing on the top: its foot at the screen point (px, py), raised to the top's height. */
const onTop = (px: number, py: number, draw: (g: CanvasRenderingContext2D, sx: number, sy: number) => void): Prop => {
  const [x, y] = toWorld(px, py + SHOT_H);
  return { x, y, draw: (g, sx, sy) => draw(g, sx, sy - SHOT_H) };
};
/** Is the screen box over the foot (px, py) all top or cliff face, none of the canyon's floor? */
const clearOfFloor = (px: number, py: number, hw: number, h: number): boolean => {
  for (let yy = py + 4; yy >= py - h; yy -= 3) {
    for (let xx = px - hw; xx <= px + hw; xx += 3) {
      if (xx < 0 || yy < 0 || xx >= PW || yy >= PH) continue;
      if (shotKind(xx, yy) === SK.Floor) return false;
    }
  }
  return shotKind(px, py) === SK.Top && shotKind(px - 8, py + 2) === SK.Top && shotKind(px + 8, py + 2) === SK.Top;
};
const topDecor = (): Prop[] => {
  const out: Prop[] = [];
  const taken: [number, number][] = [];
  const room = (px: number, py: number, r: number): boolean => taken.every(([tx, ty]) => Math.hypot(px - tx, (py - ty) * 1.6) > r);
  // the cult's lookout on the far top: tent, fire, banner, crates, and the hoist at the edge
  const camp: [number, number, (g: CanvasRenderingContext2D, sx: number, sy: number) => void, number][] = [
    [742, 70, cultTent, 40],
    [690, 92, watchfire, 30],
    [785, 104, banner, 18],
    [650, 70, box(0.45, 0.45, 12, hex('#9a7550'), hex('#866444'), hex('#5e4430')), 14],
    [664, 62, box(0.38, 0.38, 10, hex('#9a7550'), hex('#866444'), hex('#5e4430')), 12],
  ];
  for (const [px, py, draw, r] of camp) {
    if (shotKind(px, py) !== SK.Top) console.warn('camp piece off the top', px, py);
    out.push(onTop(px, py, draw));
    taken.push([px, py]);
    void r;
  }
  // the hoist: at the top of the far cliff, over the road by the wagon
  for (let py = 0; py < PH - 1; py++) {
    if (shotKind(612, py) === SK.Top && shotKind(612, py + 1) === SK.Face) {
      out.push(onTop(612, py - 5, hoist));
      taken.push([612, py - 5]);
      break;
    }
  }
  // the rest scattered, in groves and bare patches, a few of each rare thing
  const caps = { skull: 1, cairn: 3, dead: 4, hoodoo: 4 };
  let n = 0;
  for (let gy = 8; gy < PH + 20; gy += 19) {
    for (let gx = 6; gx < PW; gx += 25) {
      n++;
      const px = Math.round(gx + (hash(gx, gy, 51) - 0.5) * 20);
      const py = Math.round(gy + (hash(gx, gy, 52) - 0.5) * 14);
      const [wx0, wy0] = toWorld(px, py + SHOT_H);
      const grove = fbm(wx0 * 0.35, wy0 * 0.35, 53);
      const roll = hash(gx, gy, 54);
      let draw: ((g: CanvasRenderingContext2D, sx: number, sy: number) => void) | null = null;
      let hw = 10;
      let h = 16;
      let r = 30;
      let cap: keyof typeof caps | null = null;
      if (grove > 0.64 && roll < 0.45) {
        const s = 0.75 + 0.4 * hash(gx, gy, 55);
        draw = juniper(n, s);
        hw = 26 * s;
        h = 42 * s;
        r = 40;
      } else if (roll < 0.13) {
        draw = sage(n, 0.8 + 0.5 * hash(gx, gy, 56));
      } else if (roll < 0.18) {
        draw = yucca(n, 0.9 + 0.3 * hash(gx, gy, 57));
        h = 32;
      } else if (roll < 0.24) {
        draw = boulder(0.2 + 0.22 * hash(gx, gy, 58), '#e8a777', '#c47a50', '#8c4d37');
        hw = 16;
      } else if (roll < 0.27 && grove < 0.5) {
        draw = deadTree(n);
        hw = 20;
        h = 44;
        r = 40;
        cap = 'dead';
      } else if (roll < 0.3) {
        const hh = 36 + 30 * hash(gx, gy, 59);
        const R = 8 + 5 * hash(gx, gy, 60);
        draw = hoodoo(hh, R, n);
        hw = R + 4;
        h = hh + R;
        r = 40;
        cap = 'hoodoo';
      } else if (roll < 0.315) {
        draw = cairn(n);
        h = 18;
        cap = 'cairn';
      } else if (roll < 0.325) {
        draw = skull;
        cap = 'skull';
      } else if (roll < 0.4) {
        draw = shrub(n);
        r = 22;
      }
      if (!draw || (cap && caps[cap] <= 0) || !room(px, py, r) || !clearOfFloor(px, py, hw, h)) continue;
      if (cap) caps[cap]--;
      out.push(onTop(px, py, draw));
      taken.push([px, py]);
    }
  }
  return out;
};
shotLevel.props = [
  { ...pt(560, 262), draw: canyon.props[3].draw }, // the broken wagon
  { ...pt(600, 300), draw: box(0.45, 0.45, 12, hex('#9a7550'), hex('#866444'), hex('#5e4430')) }, // spilled crates
  { ...pt(622, 292), draw: box(0.4, 0.4, 10, hex('#9a7550'), hex('#866444'), hex('#5e4430')) },
  { ...pt(445, 214), draw: banner },
  { ...pt(420, 150), draw: boulder(0.36, '#e8a777', '#c47a50', '#8c4d37') },
  { ...pt(690, 352), draw: boulder(0.3, '#e8a777', '#c47a50', '#8c4d37') },
  { ...pt(470, 268), draw: (g, sx, sy) => {
    g.fillStyle = '#ece3d3';
    g.fillRect(sx - 6 * F, sy - 2 * F, 12 * F, 2 * F);
    g.fillRect(sx - 2 * F, sy - 5 * F, 3 * F, 3 * F);
  } },
  { ...pt(340, 70), draw: shrub(1) },
  { ...pt(395, 110), draw: shrub(2) },
  { ...pt(650, 330), draw: shrub(3) },
  { ...pt(745, 470), draw: shrub(4) },
  // the near wall's spires, see-through only while someone is behind
  { ...pt(470, 330), seeFor: 150, draw: hoodoo(150, 26, 1) },
  { ...pt(345, 250), seeFor: 120, draw: hoodoo(120, 21, 2) },
  // the mini fleshmancer, leading the cultists up the road
  { ...pt(372, 112), draw: sprite(miniFm.front.idle[0]) },
  ...topDecor(),
];
const shotFoes: [number, number][] = [at(398, 160) as [number, number], at(620, 330 - 40) as [number, number]];

const nearAt = (x: number): [number, number] => {
  const half = 2.0 + 0.5 * Math.sin(0.5 * x + 1.2) + 1.0 * Math.exp(-(((x - 13.5) / 1.6) ** 2));
  return [x, cYc(x) + half * 0.9 + 0.75];
};
const LEVELS: { L: Level; way?: Way }[] = BOTH
  ? [
    { L: { ...canyon, gr: ground(upShape), floor: (x, y, px, py) => {
      const keep = canyonChannel;
      canyonChannel = upChannel;
      const c = canyon.floor(x, y, px, py);
      canyonChannel = keep;
      return c;
    }, title: 'A. Run the canyon up the screen', note: 'a wall on both sides, left and right; none in front', props: [
      { x: at(300, 120)[0], y: at(300, 120)[1], draw: boulder(0.4, '#e8a777', '#c47a50', '#8c4d37') },
      { x: at(360, 300)[0], y: at(360, 300)[1], draw: canyon.props[3].draw },
      { x: at(255, 360)[0], y: at(255, 360)[1], draw: boulder(0.25, '#e8a777', '#c47a50', '#8c4d37') },
    ], hero: at(300, 250) as [number, number] }, way: { foes: [at(340, 140) as [number, number]] } },
    { L: { ...canyon, title: 'B. Across the screen, the near wall felt', note: 'cut away as now, but its shadow lies across the floor, and a few spires stand out of it', props: [
      ...canyon.props,
      { x: nearAt(8.6)[0], y: nearAt(8.6)[1], seeFor: 150, draw: spire(150, 1) },
      { x: nearAt(15.6)[0], y: nearAt(15.6)[1], seeFor: 130, draw: spire(130, 2) },
    ] }, way: { shadow: 1.6, foes: [canyonFoe] } },
  ]
  : SEE
  ? [
    { L: { ...canyon, title: 'Echo Canyon, as the game does it today', note: 'the near wall left out: everything on the ground in view' }, way: { foes: [canyonFoe] } },
    { L: { ...canyon, title: 'Echo Canyon, the near wall drawn', note: 'see-through round the knight and the cultist, like the tent' }, way: { full: true, foes: [canyonFoe] } },
    { L: { ...quarry, title: 'The Quarry, the near walls drawn', note: 'the same: see-through round whoever is behind a wall' }, way: { full: true, foes: [quarryFoe] } },
  ]
  : [quarry, canyon, pinewood, fen].map((L) => ({ L }));
// ---------------------------------------------------------------------------------------------
// THE LEDGE ROAD'S SKY. His word of 18:34: "We’ll have to work on the sky but the rock and the curves
// look good". The rock, the path and the round edge are the Ledge Road mock-up's (mockup/ledge-road,
// his yes). The sky, his way (his answer of 20:56, to a first go that looked down off the ledge
// into clouds): "I was thinking more like if we use the same perspective as the canyon, the rear wall
// is gone and that where you see the sky". So the mountain is on the near side, cut away as the
// canyon's near cliff is; behind the road there is no wall: past its far edge the ground drops away
// and you look out over the drop at the sky, the far ranges, the clouds below the ledge and the
// valley far off. The black shadow only on edges that face south-east (his word of 21:01). In the
// game the sky would be a layer of its own, sliding slower than the ground, so it feels far away.

const L_PATH = ramp('#4f4552', '#62576a', '#77697b', '#8c7e8d', '#a395a1');
const L_GRASS = ramp('#4f6b3e', '#66854a', '#7fa05a', '#9cbb6c');
const L_PEBBLE = ramp('#5a5060', '#9b8f9c', '#c3b8c2');
const L_LIP = hex('#d9cfd6');
const L_SLOPE = ramp('#4a4256', '#574e63', '#655b70', '#73697d');
/** The road's middle down the screen at each column: in from the left, past the knight, out on the outcrop, on to the right. */
const L_PTS: [number, number][] = [[-80, 226], [150, 232], [330, 224], [507, 240], [650, 252], [800, 234], [950, 216], [1100, 206]];
const ledgeMid = (px: number): number => {
  for (let i = 0; i + 1 < L_PTS.length; i++) {
    const [x0, y0] = L_PTS[i];
    const [x1, y1] = L_PTS[i + 1];
    if (px <= x1) {
      const t = (1 - Math.cos((Math.max(0, px - x0) / (x1 - x0)) * Math.PI)) / 2;
      return y0 + (y1 - y0) * t;
    }
  }
  return L_PTS[L_PTS.length - 1][1];
};
/** The outcrop, jutting out over the drop. */
const outcrop = (px: number): number => 50 * Math.exp(-(((px - 700) / 60) ** 2));
const ledgeFar = (px: number): number => ledgeMid(px) - 27 - 5 * Math.sin(px / 37 + 0.3) - outcrop(px);
const ledgeNear = (px: number): number => ledgeMid(px) + 27 + 6 * Math.sin(px / 53 + 1);
const ledgeShape: Shape = (x, y) => {
  const [sx, sy] = toScreen(x, y);
  return sy > ledgeFar(sx) && sy < ledgeNear(sx);
};
const ledgeGround = ground(ledgeShape);
const LW = ledgeGround.walk;
/** How high the mountain's slope in front stands over the road, in picture pixels (for the order things are drawn in). */
const L_NEAR_H = 150;

// --- the view past the far edge
const SKY = ramp('#3d80dc', '#4f8de2', '#64a0e8', '#7cb2ec', '#98c4f0', '#b6d7f5', '#d2e7f9');
const HORIZON = 132;
const HAZE = hex('#c9e0f6');
const CLOUD = ramp('#9fb1da', '#bccbe9', '#d7e3f4', '#eef4fc', '#ffffff');
const FIELDS = ramp('#7a9358', '#8ea563', '#a8ad6e', '#b39f68', '#8b7b5a');
/** A ridge line down the screen at each column: the far range, and a nearer one. */
const farRange = (px: number): number => HORIZON - 14 - 26 * fbm(px / 70, 0, 351) - 24 * Math.exp(-(((px - 300) / 40) ** 2)) - 14 * Math.exp(-(((px - 820) / 30) ** 2));
const nearRange = (px: number): number => HORIZON + 4 - 18 * fbm(px / 50, 3, 355) - 16 * Math.exp(-(((px - 560) / 55) ** 2));
/** The land far off below the ranges, its fields crowding together toward the horizon. */
function landFar(px: number, py: number): RGB {
  const depth = Math.max(0.05, (py - HORIZON) / 120); // 0 at the horizon, 1 near the ledge
  const v = 1 / depth; // rows crowd together as they go off
  const u = px / (18 + 30 * depth);
  const ci = Math.floor(u);
  const cj = Math.floor(v * 1.6);
  let c = FIELDS[Math.floor(hash(ci, cj, 371) * FIELDS.length)];
  if (fbm(px / 90, v * 2, 373) > 0.56) c = hex('#3e5b3c'); // woods
  const river = Math.abs(px - (420 + 120 * Math.sin(v * 0.9) + 30 * Math.sin(v * 2.3)));
  if (river < 1 + 4 * depth) c = hex('#cfe9f5');
  return c;
}
/** The view at a pixel past the far edge: sky, far ranges, the land far off in the haze. */
function viewAt(px: number, py: number): RGB {
  let c = pick(SKY, py / (HORIZON + 10), px, py, 0.9);
  const fr = farRange(px);
  const nr = nearRange(px);
  if (py > fr) {
    const lit = farRange(px - 3) > farRange(px + 3);
    c = lit ? hex('#b9c8e8') : hex('#9fb0da');
    if (py < fr + 8 + 6 * vn(px / 9, 0, 353) && fr < HORIZON - 22) c = lit ? hex('#f3f7fd') : hex('#cdd8ef');
    c = mix(c, HAZE, 0.35);
  }
  if (py > nr) {
    const lit = nearRange(px - 3) > nearRange(px + 3);
    c = lit ? hex('#94a9d2') : hex('#7b90c2');
    if (py < nr + 5 && nr < HORIZON - 8) c = lit ? hex('#e9f0fb') : hex('#bccbe6');
    c = mix(c, HAZE, 0.22);
  }
  if (py > HORIZON + 4 && py > nr + 6) c = mix(landFar(px, py), HAZE, Math.floor((0.62 + (bayer(px, py) - 0.5) * 0.12) * 8) / 8);
  return c;
}
interface Puff { x: number; y: number; r: number; far: boolean }
/** Heaps of round puffs: the high clouds in the sky, and the clouds below the ledge seen from above. */
function heaps(spots: [number, number, number, boolean][], k0: number): Puff[] {
  const out: Puff[] = [];
  spots.forEach(([cx, cy, size, far], k) => {
    const n = 9 + Math.floor(hash(k, k0, 401) * 7);
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const spread = 1 - 0.55 * t;
      out.push({
        x: cx + (hash(i, k + k0, 402) - 0.5) * size * 2.4 * spread,
        y: cy + (hash(i, k + k0, 403) - 0.5) * size * 0.6 * spread - t * size * 0.35,
        r: size * (0.42 + 0.3 * hash(i, k + k0, 404)) * (1 - 0.45 * t),
        far,
      });
    }
  });
  out.sort((p1, p2) => (p1.far === p2.far ? p1.y + p1.r * 0.3 - (p2.y + p2.r * 0.3) : p1.far ? -1 : 1));
  return out;
}
/** Paint puffs into a sheet of their own, lit from the top left; a flat floor to each heap if `base` is given. */
function paintPuffs(puffs: Puff[], col: Uint8ClampedArray, on: Uint8Array, base?: (p: Puff) => number): void {
  const L = [-0.5, -0.42, 0.76];
  for (const p of puffs) {
    const ry = p.r * 0.66;
    const floorY = base ? base(p) : Infinity;
    for (let py = Math.max(0, Math.floor(p.y - ry - 3)); py <= Math.min(PH - 1, Math.ceil(p.y + ry + 3)); py++) {
      if (py > floorY) continue;
      for (let px = Math.max(0, Math.floor(p.x - p.r - 3)); px <= Math.min(PW - 1, Math.ceil(p.x + p.r + 3)); px++) {
        const dx = (px - p.x) / p.r;
        const dy = (py - p.y) / ry;
        const d2 = dx * dx + dy * dy + 0.14 * (vn(px / 4, py / 3, 431) - 0.5);
        if (d2 > 1) continue;
        const nz = Math.sqrt(Math.max(0, 1 - Math.min(1, dx * dx + dy * dy)));
        const lam = dx * L[0] + dy * L[1] + nz * L[2];
        let i = Math.floor((lam * 0.8 + 0.4 + (bayer(px, py) - 0.5) * 0.16) * 5);
        i = Math.max(0, Math.min(4, i));
        if (py > floorY - 3) i = Math.min(i, 1); // the flat grey underside
        let c = CLOUD[i];
        if (p.far) c = mix(c, HAZE, 0.5);
        const o = (py * PW + px) * 3;
        col[o] = c[0];
        col[o + 1] = c[1];
        col[o + 2] = c[2];
        on[py * PW + px] = 1;
      }
    }
  }
}
/** The mountain's slope in front of the road (cut away, as the canyon's near cliff is): rock, scree and alpine grass. */
function slopeAt(x: number, y: number, px: number, py: number): RGB {
  let c = pick(L_SLOPE, fbm(x * 1.7, y * 1.7, 381), px, py);
  if (fbm(x * 0.8 + 5, y * 0.8, 383) > 0.42) c = pick(L_GRASS, fbm(x * 5, y * 5, 385) * 0.8, px, py);
  if (Math.abs(fbm(x * 1.3, y * 1.3, 387) - 0.5) < 0.012) c = hex('#3f374c'); // cracks in the rock
  if (hash(px >> 1, py >> 1, 389) > 0.986) c = [hex('#f4e27c'), hex('#ea92b6'), hex('#ffffff'), hex('#c3b8c2')][Math.floor(hash(px >> 1, py >> 1, 390) * 4)];
  return c;
}

// --- THE REVEAL. The doc's Ledge Road: "From the open cliff, the player sees the town far below under
// a sickly dome of magic. Siege camps ring the town, and a dark glow hangs over the swamp beyond", and its
// Sunken Fen: "Lines of magic run from the swamp to the dome over the town". What the siege magic looks
// like is an open question in his doc; shown here as the dome the doc proposes, the finale being built on
// it (it flickers as the obelisks fall and shatters as the Drowned Eye dies). Its glow is the cult's
// pink: pink and gold glows are the enemy's.
const TOWN: [number, number] = [320, 172];
const SWAMP: [number, number] = [118, 146];
let VISTA: ImageData | null = null;
function paintVista(): ImageData {
  const c = document.createElement('canvas');
  c.width = PW;
  c.height = PH;
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  const [tx, ty] = TOWN;
  const [sx, sy] = SWAMP;
  // the swamp, far off: murky, a dark violet glow hanging over it
  const sg = g.createRadialGradient(sx, sy - 4, 2, sx, sy - 4, 70);
  sg.addColorStop(0, 'rgba(120, 40, 120, 0.55)');
  sg.addColorStop(1, 'rgba(120, 40, 120, 0)');
  g.fillStyle = sg;
  g.beginPath();
  g.ellipse(sx, sy - 4, 70, 28, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = 'rgba(46, 58, 50, 0.85)';
  for (let i = 0; i < 12; i++) {
    g.beginPath();
    g.ellipse(sx - 50 + i * 9, sy + (hash(i, 0, 501) - 0.5) * 4, 8 + 5 * hash(i, 1, 501), 3 + 2 * hash(i, 2, 501), 0, 0, Math.PI * 2);
    g.fill();
  }
  // the camps ringing the town: tents in the cult's violet, their fires
  for (let i = 0; i < 34; i++) {
    const a = (i / 34) * Math.PI * 2 + (hash(i, 0, 503) - 0.5) * 0.2;
    const r = 1 + 0.12 * (hash(i, 1, 503) - 0.5);
    const x = tx + Math.cos(a) * 96 * r;
    const y = ty + Math.sin(a) * 28 * r;
    g.fillStyle = 'rgba(74, 42, 99, 0.9)';
    g.beginPath();
    g.moveTo(x - 3.5, y + 1.5);
    g.lineTo(x, y - 3.5);
    g.lineTo(x + 3.5, y + 1.5);
    g.closePath();
    g.fill();
    if (hash(i, 2, 503) > 0.45) {
      g.fillStyle = 'rgba(255, 179, 71, 0.95)';
      g.fillRect(Math.round(x + 4), Math.round(y), 2, 2);
    }
  }
  // the town: its wall, roofs, a keep, the smoke of what burns inside
  g.strokeStyle = 'rgba(196, 188, 176, 0.95)';
  g.lineWidth = 3;
  g.beginPath();
  g.ellipse(tx, ty, 60, 17, 0, 0, Math.PI * 2);
  g.stroke();
  for (let i = 0; i < 90; i++) {
    const a = hash(i, 0, 505) * Math.PI * 2;
    const r = Math.sqrt(hash(i, 1, 505)) * 0.9;
    const x = tx + Math.cos(a) * 56 * r;
    const y = ty + Math.sin(a) * 14 * r;
    g.fillStyle = ['#9c4f3a', '#7e4636', '#b8835a', '#8a5a44'][Math.floor(hash(i, 2, 505) * 4)];
    g.fillRect(Math.round(x - 2), Math.round(y - 2), 4 + Math.round(hash(i, 3, 505) * 3), 3);
  }
  g.fillStyle = '#cfc8bd';
  g.fillRect(tx - 5, ty - 20, 10, 19);
  g.fillStyle = '#6e4a3a';
  g.beginPath();
  g.moveTo(tx - 6, ty - 20);
  g.lineTo(tx, ty - 31);
  g.lineTo(tx + 6, ty - 20);
  g.closePath();
  g.fill();
  for (let i = 0; i < 3; i++) {
    const x0 = tx - 32 + i * 28;
    for (let k = 0; k < 7; k++) {
      g.fillStyle = `rgba(90, 84, 96, ${0.45 - k * 0.06})`;
      g.beginPath();
      g.ellipse(x0 + k * 4, ty - 6 - k * 8, 3.5 + k * 1.3, 2.8 + k * 0.9, 0, 0, Math.PI * 2);
      g.fill();
    }
  }
  // all that far off, in the air's blue
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = 'rgba(201, 224, 246, 0.32)';
  g.fillRect(0, 0, PW, PH);
  g.globalCompositeOperation = 'source-over';
  // the lines of magic from the swamp to the dome
  for (let i = 0; i < 3; i++) {
    const bend = -26 - i * 9;
    for (const [w, a] of [[3, 0.22], [1, 0.85]] as const) {
      g.strokeStyle = `rgba(255, 95, 210, ${a})`;
      g.lineWidth = w;
      g.beginPath();
      g.moveTo(sx + 6 - i * 6, sy - 3);
      g.quadraticCurveTo((sx + tx) / 2, sy + bend, tx - 52 + i * 30, ty - 46 + i * 6);
      g.stroke();
    }
  }
  // the dome: the sickly pink of the cult's magic, its rim bright, cracks of its power across it
  const rx = 80;
  const ry = 64;
  const dg = g.createRadialGradient(tx - 20, ty - 34, 6, tx, ty - 12, rx);
  dg.addColorStop(0, 'rgba(255, 150, 230, 0.12)');
  dg.addColorStop(0.75, 'rgba(230, 80, 200, 0.22)');
  dg.addColorStop(1, 'rgba(200, 60, 180, 0.42)');
  g.fillStyle = dg;
  g.beginPath();
  g.ellipse(tx, ty + 2, rx, ry, 0, Math.PI, 0);
  g.ellipse(tx, ty + 2, rx, 22, 0, 0, Math.PI);
  g.fill();
  g.strokeStyle = 'rgba(255, 120, 220, 0.9)';
  g.lineWidth = 2;
  g.beginPath();
  g.ellipse(tx, ty + 2, rx, ry, 0, Math.PI, 0);
  g.stroke();
  g.strokeStyle = 'rgba(255, 210, 245, 0.75)';
  g.lineWidth = 1.5;
  g.beginPath();
  g.ellipse(tx, ty + 2, rx - 9, ry - 9, 0, Math.PI * 1.15, Math.PI * 1.45);
  g.stroke();
  g.strokeStyle = 'rgba(255, 160, 235, 0.6)';
  for (let i = 0; i < 4; i++) {
    let x = tx - 50 + i * 28;
    let y = ty - 32 - 12 * hash(i, 0, 507);
    g.beginPath();
    g.moveTo(x, y);
    for (let k = 0; k < 4; k++) {
      x += 5 + 6 * hash(i, k, 508);
      y += (hash(i, k, 509) - 0.5) * 12;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  return g.getImageData(0, 0, PW, PH);
}

/** The Ledge Road as one screen of the game. */
function paintLedge(g: CanvasRenderingContext2D): Uint8Array {
  const img = g.createImageData(PW, PH);
  const d = img.data;
  const put = (px: number, py: number, c: RGB): void => {
    const i = (py * PW + px) * 4;
    d[i] = c[0];
    d[i + 1] = c[1];
    d[i + 2] = c[2];
    d[i + 3] = 255;
  };
  const walk = new Uint8Array(PW * PH);
  for (let py = 0; py < PH; py++) {
    for (let px = 0; px < PW; px++) {
      const [x, y] = toWorld(px + 0.5, py + 0.5);
      walk[py * PW + px] = LW(x, y) ? 1 : 0;
    }
  }
  const walkAt = (px: number, py: number): boolean => px >= 0 && py >= 0 && px < PW && py < PH && walk[py * PW + px] === 1;
  // the road down each column, as one band
  const bandA = new Int32Array(PW).fill(-1);
  const bandB = new Int32Array(PW).fill(-1);
  for (let px = 0; px < PW; px++) {
    let run = 0;
    for (let py = 0; py < PH; py++) {
      if (walk[py * PW + px]) {
        run++;
        if (run === 3 && bandA[px] < 0) bandA[px] = py - 2;
        if (run >= 3) bandB[px] = py + 1;
      } else run = 0;
    }
  }
  // the clouds: high ones in the sky (flat-bottomed), and a bank below the ledge, seen from above, just past the far edge
  const col = new Uint8ClampedArray(PW * PH * 3);
  const on = new Uint8Array(PW * PH);
  const high: [number, number, number, boolean][] = [[120, 38, 30, false], [430, 22, 22, true], [690, 56, 34, false], [930, 30, 20, true], [270, 82, 16, true], [820, 96, 14, true]];
  paintPuffs(heaps(high, 0), col, on, (p) => high.reduce((best, [hx, hy, hs]) => (Math.abs(p.x - hx) < hs * 1.6 ? Math.min(best, hy + hs * 0.18) : best), Infinity));
  const below: [number, number, number, boolean][] = [];
  for (let i = 0, px = -40; px < PW + 60; px += 60 + 40 * hash(i, 0, 440), i++) {
    const far = ledgeFar(Math.max(0, Math.min(PW - 1, px)));
    if (REVEAL && px > TOWN[0] - 140 && px < TOWN[0] + 140) continue; // a clear gap in the clouds where the town is
    below.push([px, far - 14 - 26 * hash(i, 1, 440), 22 + 18 * hash(i, 2, 440), hash(i, 3, 440) > 0.6]);
  }
  for (let i = 0; i < 7; i++) {
    const px = hash(i, 0, 445) * PW;
    if (REVEAL && px > TOWN[0] - 140 && px < TOWN[0] + 140) continue;
    below.push([px, HORIZON + 18 + 30 * hash(i, 1, 445), 12 + 10 * hash(i, 2, 445), true]);
  }
  paintPuffs(heaps(below, 50), col, on);
  // what each pixel is: 0 the view, 1 the road, 2 the slope in front
  const kind = new Uint8Array(PW * PH);
  for (let px = 0; px < PW; px++) {
    const a = bandA[px];
    const b = bandB[px];
    for (let py = 0; py < PH; py++) {
      if (a >= 0 && py >= a && py < b) kind[py * PW + px] = 1;
      else if (a >= 0 && py >= b) kind[py * PW + px] = 2;
    }
  }
  /** Which way the road's edge at (px, py) looks, out of the road: degrees from the right, round through down (180 is straight left). */
  const edgeAngle = (px: number, py: number): number => {
    let vx = 0;
    let vy = 0;
    for (let dy = -12; dy <= 12; dy++) {
      for (let dx = -12; dx <= 12; dx++) {
        if (walkAt(px + dx, py + dy)) {
          vx += dx;
          vy += dy;
        }
      }
    }
    return vx === 0 && vy === 0 ? NaN : (Math.atan2(-vy, -vx) * 180) / Math.PI;
  };
  for (let py = 0; py < PH; py++) {
    for (let px = 0; px < PW; px++) {
      const k = kind[py * PW + px];
      if (k === 0) {
        // the view, with the clouds over it
        if (on[py * PW + px]) {
          const o = (py * PW + px) * 3;
          put(px, py, [col[o], col[o + 1], col[o + 2]]);
        } else {
          let c = viewAt(px, py);
          if (VISTA) {
            // the reveal: the town, its siege and the magic over it, laid over the view
            const o = (py * PW + px) * 4;
            const a = VISTA.data[o + 3] / 255;
            if (a > 0) c = mix(c, [VISTA.data[o], VISTA.data[o + 1], VISTA.data[o + 2]], a);
          }
          put(px, py, c);
        }
        continue;
      }
      if (k === 1) {
        const a = bandA[px];
        const [x, y] = toWorld(px + 0.5, py + 0.5);
        let c = pick(L_PATH, fbm(x * 2.4, y * 2.4, 11) * 1.1 - 0.1, px, py);
        const gfield = fbm(x * 1.1 + 3, y * 1.1, 21);
        const inner = ledgeGround.field(x, y);
        if (gfield > 0.62 || (inner < 0.5 && gfield > 0.48)) c = pick(L_GRASS, fbm(x * 6, y * 6, 25), px, py);
        // pebbles
        const cs = 0.42;
        const ci = Math.floor(x / cs);
        const cj = Math.floor(y / cs);
        if (hash(ci, cj, 31) < 0.4) {
          const cx = (ci + 0.2 + 0.6 * hash(ci, cj, 32)) * cs;
          const cy = (cj + 0.2 + 0.6 * hash(ci, cj, 33)) * cs;
          const r = 0.05 + 0.06 * hash(ci, cj, 34);
          const [qx, qy] = toScreen(cx, cy);
          const dx = (px - qx) / (r * HWf * 1.6);
          const dy = (py - qy) / (r * HHf * 2.1);
          const dd = dx * dx + dy * dy;
          if (dd < 1) c = dy < -0.35 && dx < 0.3 ? L_PEBBLE[2] : dd > 0.55 && dy > 0 ? L_PEBBLE[0] : L_PEBBLE[1];
        }
        if ((c === L_GRASS[1] || c === L_GRASS[2]) && hash(px >> 1, py >> 1, 37) > 0.975) c = [hex('#f4e27c'), hex('#ea92b6'), hex('#ffffff'), hex('#a8bcff')][Math.floor(hash(px >> 1, py >> 1, 38) * 4)];
        // the far edge, where the ground drops away, catches the light
        if (py - a < 2) c = L_LIP;
        else if (py - a < 3) c = mix(c, L_LIP, 0.5);
        put(px, py, c);
        continue;
      }
      // the slope in front, raised over the road; the black shadow under the road's edge only where it faces south-east
      const b = bandB[px];
      const [x, y] = toWorld(px + 0.5, py + 0.5 + L_NEAR_H);
      let c = slopeAt(x, y, px, py);
      // where the road's near edge runs up and down the screen the slope's side shows, its wall, facing
      // right, away from the light: black in shadow (his picture of 21:24); elsewhere only its top shows
      let best = 99;
      let bx = 0;
      let by = 0;
      for (let dy = -8; dy <= 8; dy++) {
        for (let dx = -8; dx <= 8; dx++) {
          if (!walkAt(px + dx, py + dy)) continue;
          const dd = Math.hypot(dx, dy);
          if (dd < best) {
            best = dd;
            bx = px + dx;
            by = py + dy;
          }
        }
      }
      if (best <= 7.5 && Math.abs(edgeAngle(bx, by)) > 163) c = best <= 2.5 ? [24, 18, 34] : [40, 32, 52];
      put(px, py, c);
    }
  }
  // the slope's shadow on the road at its foot, so the slope is felt as standing over it
  for (let px = 0; px < PW; px++) {
    const b = bandB[px];
    if (b < 0) continue;
    for (let py = b - 1; py >= Math.max(0, b - 22); py--) {
      if (kind[py * PW + px] !== 1) break;
      const t = (b - py) / 22;
      const k = t < 0.5 + 0.3 * (vn(px / 30, 0, 391) - 0.5) ? 0.3 : 0.16;
      const i = (py * PW + px) * 4;
      d[i] *= 1 - k;
      d[i + 1] *= 1 - k;
      d[i + 2] *= 1 - k;
    }
  }
  g.putImageData(img, 0, 0);
  return walk;
}

/** A vulture gliding far under the ledge, seen from above: broad wings, fingered tips, a pale ruff. */
const vulture = (span: number, tilt: number, k: number) => (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  g.save();
  g.translate(sx, sy);
  g.rotate(tilt);
  const w = span / 2;
  g.fillStyle = 'rgba(40, 60, 100, 0.22)'; // its shadow on the cloud below
  g.beginPath();
  g.ellipse(18, 22, w * 0.9, w * 0.18, 0, 0, Math.PI * 2);
  g.fill();
  const wing = (dir: number, c: string, s: number): void => {
    g.fillStyle = c;
    g.beginPath();
    g.moveTo(0, -w * 0.06);
    g.quadraticCurveTo(dir * w * 0.5, -w * 0.2 * s, dir * w, -w * 0.06);
    // the fingered tips
    for (let f = 0; f < 4; f++) g.lineTo(dir * (w - f * w * 0.07), w * (0.04 + 0.05 * f) + (f % 2 ? w * 0.02 : 0));
    g.quadraticCurveTo(dir * w * 0.45, w * 0.2, 0, w * 0.12);
    g.closePath();
    g.fill();
  };
  wing(-1, '#3d2f2b', 1);
  wing(1, '#3d2f2b', 1);
  g.fillStyle = '#5c4a40';
  g.fillRect(-w * 0.55, -w * 0.05, w * 0.3, Math.max(1, w * 0.06));
  g.fillRect(w * 0.25, -w * 0.05, w * 0.3, Math.max(1, w * 0.06));
  g.fillStyle = '#2c2220';
  g.beginPath();
  g.ellipse(0, w * 0.05, w * 0.1, w * 0.26, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#e8dccb'; // the ruff
  g.fillRect(-w * 0.06, -w * 0.22, w * 0.12, w * 0.08);
  g.fillStyle = '#b48a7a'; // the bare head
  g.fillRect(-w * 0.04, -w * 0.3, w * 0.08, w * 0.08);
  void k;
  g.restore();
};
/** A rope rail along the edge: stakes and a sagging rope, the road's own. */
const railPost = (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  g.fillStyle = '#4e3a2c';
  g.fillRect(sx - F, sy - 14 * F, 2 * F, 14 * F);
  g.fillStyle = '#7a5d45';
  g.fillRect(sx - F, sy - 14 * F, F, 14 * F);
};
const tuft = (k: number) => (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  for (let i = 0; i < 9; i++) {
    const x = sx + (hash(i, k, 61) - 0.5) * 10 * F;
    const h = (3 + 5 * hash(i, k, 62)) * F;
    g.fillStyle = ['#4f6b3e', '#66854a', '#7fa05a', '#9cbb6c'][Math.floor(hash(i, k, 63) * 4)];
    g.fillRect(x, sy - h, F, h);
  }
};
const greyBoulder = (r: number) => boulder(r, '#d6cbc6', '#a99ca4', '#6e6378');

function ledgeProps(): Prop[] {
  const onL = (px: number, py: number, draw: Prop['draw']): Prop => {
    const [x, y] = toWorld(px, py);
    if (!LW(x, y)) console.warn('ledge prop off the ledge', px, py);
    return { x, y, draw };
  };
  /** A thing on the slope in front, drawn at the slope's height; never where it would stand over the road. */
  const onSlope = (px: number, py: number, draw: Prop['draw'], hw: number, h: number): Prop | null => {
    for (let yy = py + 2; yy >= py - h; yy -= 3) {
      for (let xx = px - hw; xx <= px + hw; xx += 3) {
        const [wx, wy] = toWorld(xx, yy);
        if (LW(wx, wy) || yy < ledgeNear(xx) + 4) return null;
      }
    }
    const [x, y] = toWorld(px, py + L_NEAR_H);
    return { x, y, draw: (g, sx, sy) => draw(g, sx, sy - L_NEAR_H) };
  };
  const out: Prop[] = [
    onL(230, 228, greyBoulder(0.3)),
    onL(250, 236, greyBoulder(0.18)),
    onL(612, 262, greyBoulder(0.22)),
    onL(80, 240, tuft(1)),
    onL(560, 266, tuft(3)),
    onL(870, 238, tuft(4)),
    // the cult's lookouts on the outcrop, their banner at its tip
    onL(700, 212, banner),
    onL(745, 232, box(0.45, 0.45, 12, hex('#9a7550'), hex('#866444'), hex('#5e4430'))),
  ];
  // the rope rail along the far edge past the knight, over the drop
  for (let px = 380; px <= 560; px += 45) out.push(onL(px, Math.round(ledgeFar(px)) + 7, railPost));
  // the slope in front: firs, boulders, tufts, a dead tree, in groves with bare rock between
  let n = 0;
  for (let gy = 300; gy < PH + 30; gy += 22) {
    for (let gx = 10; gx < PW; gx += 30) {
      n++;
      const px = Math.round(gx + (hash(gx, gy, 451) - 0.5) * 22);
      const py = Math.round(gy + (hash(gx, gy, 452) - 0.5) * 14);
      const grove = fbm(px / 160, py / 90, 453);
      const roll = hash(gx, gy, 454);
      let p: Prop | null = null;
      if (grove > 0.58 && roll < 0.55) p = onSlope(px, py, pine(0.6 + 0.6 * hash(gx, gy, 455), n), 26, 70);
      else if (roll < 0.12) p = onSlope(px, py, greyBoulder(0.18 + 0.2 * hash(gx, gy, 456)), 14, 14);
      else if (roll < 0.24) p = onSlope(px, py, tuft(n), 10, 10);
      if (p) out.push(p);
    }
  }
  return out;
}

/** The two things of the HUD that are the place's own: its name and its map. */
function placeHud(g: CanvasRenderingContext2D, name: string, walkAt: Shape, hero: [number, number]): void {
  const vg = g.createRadialGradient(PW / 2, PH / 2, PH * 0.45, PW / 2, PH / 2, PW * 0.62);
  vg.addColorStop(0, 'rgba(20,16,36,0)');
  vg.addColorStop(1, 'rgba(20,16,36,0.28)');
  g.fillStyle = vg;
  g.fillRect(0, 0, PW, PH);
  g.save();
  g.scale(2, 2);
  drawText(g, name, 4, 3, THEME.text, { shadow: P.ink });
  g.restore();
  const [mx, my, mw, mh] = [437 * 2 + 3, 4 * 2 + 3, 66 * 2 - 6, 46 * 2 - 6];
  g.fillStyle = '#100e22';
  g.fillRect(mx, my, mw, mh);
  const k = 0.11;
  for (let yy = 0; yy < mh; yy += 2) {
    for (let xx = 0; xx < mw; xx += 2) {
      const a = (xx - mw / 2) / (HWf * k);
      const b = (yy - mh / 2) / (HHf * k);
      if (walkAt(hero[0] + (a + b) / 2, hero[1] + (b - a) / 2)) {
        g.fillStyle = '#5b55c7';
        g.fillRect(mx + xx, my + yy, 2, 2);
      }
    }
  }
  g.fillStyle = '#28dcf0';
  g.fillRect(mx + mw / 2 - 2, my + mh / 2 - 2, 4, 4);
}

function showAlone(cvs: HTMLCanvasElement): never {
  for (const el of [document.documentElement, document.body]) {
    el.style.height = 'auto';
    el.style.overflow = 'visible';
  }
  document.body.style.margin = '0';
  document.body.style.width = `${PW}px`;
  cvs.style.position = 'static';
  cvs.style.display = 'block';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
  throw new Error('shot painted'); // the rest of the page is the other sheets
}

// ---------------------------------------------------------------------------------------------
// THE SUNKEN FEN, AT THE DROWNED EYE'S POOL, as one screen of the game. His "Yep" (13 Oct, 06:48) to
// painting the Sunken Fen the same way, from the swamp's end of the lines of magic, where the Drowned
// Eye waits. As the doc has it: ancient ruins half-drowned in the mire, linked by boardwalks; the
// town's lights across the water the whole way; the quarry's obelisks standing round the arena with
// cultists chanting at them; the horror under the water. No walls (his word of 18:56). As the Ledge
// Road is seen, the far side opens: past the fen, across open water, the town under its dome, the
// lines of magic running to it from the obelisks. Pink and gold glows are the enemy's.

const FHZ = 98; // the horizon, down the screen
const TOWN_F: [number, number] = [262, 96];
const POOL: [number, number] = [752, 262];
const fenShoreTop = (px: number): number => FHZ - 5 - 5 * fbm(px / 40, 0, 611) - 9 * Math.exp(-(((px - TOWN_F[0]) / 80) ** 2));
const FEN_SKY = ramp('#24223a', '#2e2c48', '#3b3a56', '#4c4c62', '#5f6466', '#737d6c');
function fenSky(px: number, py: number): RGB {
  let c = pick(FEN_SKY, py / FHZ, px, py, 0.9);
  const cd = fbm(px / 150, py / 20, 613) + 0.1 * (vn(px / 30, py / 9, 615) - 0.5);
  if (cd > 0.57) c = cd > 0.65 ? hex('#4a4862') : hex('#3e3c56');
  // the dome's light, low in the sky over the town
  const dg = Math.max(0, 1 - Math.hypot((px - TOWN_F[0]) / 150, (py - FHZ) / 70));
  if (dg > 0) c = mix(c, hex('#a0428c'), Math.floor((dg * 0.45 + (bayer(px, py) - 0.5) * 0.1) * 6) / 6);
  return c;
}
/** The fen's water: open lake toward the horizon, its own murk nearer; the Eye in its pool. */
function fenWater(x: number, y: number, px: number, py: number): RGB {
  // the Drowned Eye's pool (his pick, "More of the Eye"): the eye risen close under the surface, pale
  // and veined, its iris burning gold, the water rippling over it
  const pdx = (px - POOL[0]) / 62;
  const pdy = (py - POOL[1]) / 41;
  const pd = Math.hypot(pdx, pdy);
  if (pd < 1.1) {
    let c = mix(hex('#0b1615'), hex('#16302b'), Math.max(0, pd - 0.75) * 2);
    const eb = Math.hypot(pdx / 0.92, pdy / 0.8);
    if (eb < 1) {
      // the eyeball, its curve shaded, red veins running in to the iris
      c = mix(hex('#8c8a5c'), hex('#3b4630'), Math.min(1, eb * eb * 1.1));
      const ang = Math.atan2(pdy, pdx);
      const vein = Math.abs(Math.sin(ang * 7 + 2.5 * fbm(px / 9, py / 9, 631) * 3));
      if (vein < 0.09 && eb > 0.45) c = mix(c, hex('#7a2a2c'), 0.6);
      const iris = Math.hypot(pdx * 1.05, pdy * 1.25);
      if (iris < 0.5) {
        c = iris > 0.44 ? hex('#5a3a12') : mix(hex('#f0c040'), hex('#a06a14'), iris / 0.44);
        if (Math.abs(((iris * 22) % 1) - 0.5) < 0.12 && iris > 0.18) c = mix(c, hex('#ffe08a'), 0.35); // its rays
        if (Math.abs(pdx) < 0.055 + 0.05 * (1 - Math.abs(pdy) / 0.4) && Math.abs(pdy) < 0.4) c = hex('#050404'); // the slit
      }
      if (eb > 0.55 && eb < 0.62 && pdy < 0 && pdx < 0) c = mix(c, hex('#e9edd0'), 0.5); // the wet light on it
    }
    // the water over it, rippling
    if (Math.abs(((pd * 9 - fbm(px / 20, py / 20, 633)) % 1) - 0.5) < 0.06) c = mix(c, hex('#9fc7b8'), 0.25);
    return mix(c, hex('#1d3a33'), 0.18);
  }
  let c = pick(F_WATER, fbm(x * 1.2, y * 1.2, 93), px, py);
  const open = Math.max(0, 1 - (py - FHZ) / 110);
  // the dome on the water: a few broken streaks of its light, under it
  if (py < FHZ + 46 && py % 3 === 0 && Math.abs(px - TOWN_F[0] - 6 * Math.sin(py * 1.7)) < 60 - (py - FHZ) * 1.1 && hash(px >> 3, py, 617) > 0.62) c = mix(c, hex('#d04ab0'), 0.38 * open);
  if (open < 0.6) {
    // ripples, lily pads and scum
    if (Math.abs(((fbm(x * 0.8, y * 0.8, 95) * 9) % 1) - 0.5) < 0.05) c = hex('#3f6a5c');
    const lp = fbm(x * 2.4, y * 2.4, 97);
    if (lp > 0.68) c = hash(px >> 2, py >> 2, 99) > 0.25 ? hex('#4c7238') : hex('#6c9548');
    else if (lp > 0.62) c = hex('#35574a');
  }
  {
    // its arms, reaching out under the water past the ruin
    const ax = px - POOL[0];
    const ay = (py - POOL[1]) * 1.5;
    const r = Math.hypot(ax, ay);
    if (r > 50 && r < 330) {
      const th = Math.atan2(ay, ax);
      for (let k = 0; k < 6; k++) {
        const a0 = (k / 6) * Math.PI * 2 + 0.4;
        const want = a0 + 0.9 * Math.sin(r / 60 + k) + (r - 50) / 260;
        let dth = th - want;
        dth = Math.atan2(Math.sin(dth), Math.cos(dth));
        const w = (30 * (1 - (r - 50) / 300)) / r;
        if (Math.abs(dth) < w) {
          c = mix(c, hex('#040b0a'), 0.8 * (1 - (r - 50) / 360));
          if (Math.abs(dth) < w * 0.3 && hash(Math.floor(r / 9), k, 635) > 0.5) c = mix(c, hex('#2c4a40'), 0.4); // the suckers
          break;
        }
      }
    }
  } // 1 at the horizon, 0 well out in the fen
  if (open > 0) c = mix(c, hex('#4d5266'), Math.floor((open * 0.85 + (bayer(px, py) - 0.5) * 0.12) * 6) / 6);
  // the dome on the water, broken into streaks
  return c;
}
let FEN_VISTA: ImageData | null = null;
/** The town far across the water, under its dome, its lights; the siege camps' fires along the far shore. */
function paintFenVista(): ImageData {
  const c = document.createElement('canvas');
  c.width = PW;
  c.height = PH;
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  const [tx, ty] = TOWN_F;
  for (let i = 0; i < 30; i++) {
    const x = tx - 150 + 300 * hash(i, 0, 621);
    if (Math.abs(x - tx) < 44) continue;
    g.fillStyle = 'rgba(255, 179, 71, 0.9)';
    g.fillRect(Math.round(x), Math.round(ty - 3 - 3 * hash(i, 1, 621)), 1, 1);
  }
  g.fillStyle = '#3a3a44';
  g.beginPath();
  g.ellipse(tx, ty - 4, 38, 7, 0, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#8c8790';
  g.lineWidth = 2;
  g.beginPath();
  g.ellipse(tx, ty - 4, 38, 7, 0, Math.PI, 0);
  g.stroke();
  for (let i = 0; i < 46; i++) {
    const a = hash(i, 0, 623) * Math.PI * 2;
    const r = Math.sqrt(hash(i, 1, 623)) * 0.9;
    const x = tx + Math.cos(a) * 34 * r;
    const y = ty - 6 + Math.sin(a) * 5 * r;
    g.fillStyle = ['#5a3a34', '#4a3430', '#6a4a3c'][Math.floor(hash(i, 2, 623) * 3)];
    g.fillRect(Math.round(x - 2), Math.round(y - 2), 3, 2);
    if (hash(i, 3, 623) > 0.6) {
      g.fillStyle = '#ffd27a'; // its windows, lit
      g.fillRect(Math.round(x), Math.round(y - 1), 1, 1);
    }
  }
  g.fillStyle = '#6a6470';
  g.fillRect(tx - 4, ty - 22, 8, 15);
  g.fillStyle = '#3e3038';
  g.beginPath();
  g.moveTo(tx - 5, ty - 22);
  g.lineTo(tx, ty - 31);
  g.lineTo(tx + 5, ty - 22);
  g.closePath();
  g.fill();
  g.fillStyle = '#ffd27a';
  g.fillRect(tx - 1, ty - 17, 2, 2);
  const rx = 70;
  const ry = 58;
  const dg = g.createRadialGradient(tx - 18, ty - 30, 6, tx, ty - 10, rx);
  dg.addColorStop(0, 'rgba(255, 150, 230, 0.14)');
  dg.addColorStop(0.75, 'rgba(230, 80, 200, 0.26)');
  dg.addColorStop(1, 'rgba(210, 70, 190, 0.5)');
  g.fillStyle = dg;
  g.beginPath();
  g.ellipse(tx, ty, rx, ry, 0, Math.PI, 0);
  g.closePath();
  g.fill();
  g.strokeStyle = 'rgba(255, 130, 225, 0.95)';
  g.lineWidth = 2;
  g.beginPath();
  g.ellipse(tx, ty, rx, ry, 0, Math.PI, 0);
  g.stroke();
  g.strokeStyle = 'rgba(255, 215, 245, 0.75)';
  g.lineWidth = 1.5;
  g.beginPath();
  g.ellipse(tx, ty, rx - 8, ry - 8, 0, Math.PI * 1.15, Math.PI * 1.45);
  g.stroke();
  return g.getImageData(0, 0, PW, PH);
}
const ring = (x: number, y: number): boolean => area(POOL[0], POOL[1], 3.5, 3.0, 0)(x, y) && !area(POOL[0], POOL[1], 1.95, 1.62, 0)(x, y);
const fBoardsShot = union(
  path(atAll([[-40, 304], [150, 286], [300, 266], [440, 250]]), 0.85),
  path(atAll([[560, 248], [640, 252]]), 0.85),
  path(atAll([[470, 280], [400, 318], [320, 350]]), 0.8),
  path(atAll([[860, 300], [920, 360]]), 0.8),
);
const fenShotGround = ground(union(
  area(500, 238, 1.7, 1.4, 0.2),
  area(250, 380, 2.2, 1.5, 0.5),
  area(940, 400, 1.7, 1.2, 0),
  area(590, 160, 1.0, 0.7, 0),
  ring,
), fBoardsShot);
const FW_GROUND = fenShotGround.walk;
const fenObelisk = (k: number) => (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  // a quarry obelisk the cult hauled down here, its runes burning with the Eye's pink
  box(0.55, 0.55, 92, hex('#7a7486'), hex('#625c70'), hex('#423d50'))(g, sx, sy);
  g.fillStyle = '#ff5fd2';
  for (let i = 0; i < 6; i++) g.fillRect(Math.round(sx - 7 - (i % 2) * 2), Math.round(sy - 16 - i * 13), 4, 3);
  g.fillStyle = '#ffd0f4';
  g.fillRect(Math.round(sx - 2), Math.round(sy - 100 - 2 * k), 4, 4);
};
/** One of the Eye's arms, curled up out of the water, ripples round it. */
const fenArm = (k: number) => (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  g.strokeStyle = 'rgba(160, 200, 190, 0.45)';
  g.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    g.beginPath();
    g.ellipse(sx, sy, 12 * i + 6, 4 * i + 3, 0, 0, Math.PI * 2);
    g.stroke();
  }
  // the arm: thick at the water, curling over at its tip
  const pts: [number, number][] = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const curl = t * t * 3.4;
    pts.push([sx + Math.sin(curl) * 34 * t * (k ? -1 : 1), sy - 118 * t + (1 - Math.cos(curl)) * 30 * t]);
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const t = i / 20;
    const w = 20 * (1 - t) + 3;
    g.strokeStyle = '#26332c';
    g.lineWidth = w;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(pts[i][0], pts[i][1]);
    g.lineTo(pts[i + 1][0], pts[i + 1][1]);
    g.stroke();
    g.strokeStyle = '#3d5246';
    g.lineWidth = w * 0.45;
    g.beginPath();
    g.moveTo(pts[i][0] - w * 0.2, pts[i][1]);
    g.lineTo(pts[i + 1][0] - w * 0.2, pts[i + 1][1]);
    g.stroke();
    if (i % 3 === 1) {
      g.fillStyle = '#b8a77a'; // its suckers, pale
      g.fillRect(Math.round(pts[i][0] + w * 0.25), Math.round(pts[i][1]), 2, 2);
    }
  }
};
const fenObelisks: [number, number][] = [[648, 222], [858, 238], [688, 308]];
const fenShot: Level = {
  ...fen,
  title: '',
  note: '',
  gr: fenShotGround,
  floor: (x, y, px, py) => {
    if (fBoardsShot(x, y)) {
      const t = (x - y) * 3.2;
      if (((t % 1) + 1) % 1 < 0.14) return hex('#3a2a1f');
      return pick(F_PLANK, 0.25 + 0.6 * hash(Math.floor(t), 1, 85), px, py, 0.3);
    }
    if (ring(x, y)) {
      // old paving, sunk and cracked, moss in the joints
      const u = x * 1.6;
      const v = y * 1.6;
      const joint = Math.min(((u % 1) + 1) % 1, ((v % 1) + 1) % 1) < 0.07;
      if (joint) return fbm(x * 3, y * 3, 81) > 0.45 ? hex('#4d6a3a') : F_STONE[0];
      return pick(F_STONE, 0.3 + 0.6 * hash(Math.floor(u), Math.floor(v), 83), px, py, 0.3);
    }
    let c = pick(F_MUD, fbm(x * 2.2, y * 2.2, 87), px, py);
    if (fbm(x * 1.3, y * 1.3, 89) > 0.5) c = pick(F_GRASS, fbm(x * 5, y * 5, 91), px, py);
    return c;
  },
  face: (_shade, v, px, x, y) => (fBoardsShot(x, y) ? (px % 18 < 3 ? hex('#2e221a') : hex('#4b3626')) : ring(x, y) ? hex(v < 2 ? '#5a5466' : '#3e3a4a') : v < 2 ? hex('#3a3426') : hex('#2b281e')),
  outside: (x, y, px, py) => {
    let c: RGB;
    if (py < fenShoreTop(px)) c = fenSky(px, py);
    else if (py < FHZ) c = mix(hex('#262b27'), hex('#4c4a5c'), 0.3 + 0.2 * fbm(px / 20, 0, 619)); // the far shore
    else c = fenWater(x, y, px, py);
    if (FEN_VISTA) {
      const o = (py * PW + px) * 4;
      const a = FEN_VISTA.data[o + 3] / 255;
      if (a > 0) c = mix(c, [FEN_VISTA.data[o], FEN_VISTA.data[o + 1], FEN_VISTA.data[o + 2]], a);
    }
    return c;
  },
  props: [],
  hero: at(507, 236) as [number, number],
  tint: (c) => [c[0] * 0.82, c[1] * 0.8, c[2] * 0.9],
  after: (g, _kind, top) => {
    // the obelisks' light on the water and the Eye's under it
    for (const [px, py] of fenObelisks) {
      const grd = g.createRadialGradient(px, top + py - 40, 2, px, top + py - 40, 70);
      grd.addColorStop(0, 'rgba(255,95,210,0.28)');
      grd.addColorStop(1, 'rgba(255,95,210,0)');
      g.fillStyle = grd;
      g.fillRect(px - 70, top + py - 110, 140, 140);
    }
    const eg = g.createRadialGradient(POOL[0], top + POOL[1], 4, POOL[0], top + POOL[1], 80);
    eg.addColorStop(0, 'rgba(240,195,80,0.34)');
    eg.addColorStop(1, 'rgba(240,195,80,0)');
    g.fillStyle = eg;
    g.fillRect(POOL[0] - 80, top + POOL[1] - 80, 160, 160);
    // the lines of magic, from each obelisk's tip, up and away over the water to the dome
    for (const [k, [px, py]] of fenObelisks.entries()) {
      const x0 = px;
      const y0 = py - 102 - 2 * k;
      const x1 = TOWN_F[0] + 40 - k * 26;
      const y1 = TOWN_F[1] - 50 + k * 8;
      for (const [w, a] of [[5, 0.16], [2.5, 0.35], [1, 0.95]] as const) {
        g.strokeStyle = `rgba(255, ${a > 0.5 ? 170 : 95}, 225, ${a})`;
        g.lineWidth = w;
        g.beginPath();
        g.moveTo(x0, top + y0);
        g.quadraticCurveTo((x0 + x1) / 2, top + Math.min(y0, y1) - 60 - 10 * k, x1, top + y1);
        g.stroke();
      }
    }
    // mist, low over the water
    for (let n = 0; n < 14; n++) {
      const x = hash(n, 1, 73) * PW;
      const y = top + FHZ + (PH - FHZ) * hash(n, 2, 73);
      const r = 50 + 60 * hash(n, 3, 73);
      const grd = g.createRadialGradient(x, y, 4, x, y, r);
      grd.addColorStop(0, 'rgba(170,190,180,0.2)');
      grd.addColorStop(1, 'rgba(170,190,180,0)');
      g.fillStyle = grd;
      g.beginPath();
      g.ellipse(x, y, r * 1.8, r * 0.6, 0, 0, Math.PI * 2);
      g.fill();
    }
  },
};
// ---------------------------------------------------------------------------------------------
// THE PINEWOOD as one screen of the game. His "Let’s see it" (13 Oct, 08:18), and at 08:19: "I’d like
// the forest to be very open.  Really big open areas that cross the river on little bridges". So: big
// open meadows among the pines, the river (out of the canyon) winding through them, little footbridges
// where the trails cross it; the trees in groves and along the far edge, never a wall; darker and more
// twisted toward the swamp, east (the doc: "The trees get more twisted the closer the player gets to the
// swamp"); the cult's siege camp glimpsed through the trees, a patrol out of it; a hunter's old cabin.

const PINE_RIVER: number[][] = [[110, -30], [170, 70], [250, 150], [330, 236], [420, 318], [560, 368], [710, 398], [880, 470]];
const pineRiverW = atAll(PINE_RIVER);
const pineTop = (px: number): number => 70 + 26 * Math.sin(px / 120 + 0.6) + 18 * fbm(px / 60, 0, 701) - 30 * Math.exp(-(((px - 690) / 70) ** 2));
const pineGroves: [number, number, number, number][] = [[150, 360, 1.5, 1.0], [880, 330, 1.7, 1.2], [600, 120, 0.9, 0.6], [80, 180, 0.8, 0.6], [960, 160, 1.0, 0.7]];
const inPineRiver = (x: number, y: number): boolean => lineDist(pineRiverW, x, y) < 0.55;
const inGrove = (x: number, y: number): boolean => pineGroves.some(([px, py, rx, ry]) => area(px, py, rx, ry, 0)(x, y));
/** A little footbridge across the river at a screen point, square to the water there. */
function pineBridge(px: number, py: number): Shape {
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
  return path(atAll([[px - 30 * nx, py - 30 * ny], [px + 30 * nx, py + 30 * ny]]), 0.75);
}
const PINE_BRIDGES = [[212, 112], [376, 278], [640, 384]].map(([px, py]) => pineBridge(px, py));
const onPineBridge = (x: number, y: number): boolean => PINE_BRIDGES.some((b) => b(x, y));
const pineShotGround = ground((x, y) => {
  if (inPineRiver(x, y) || inGrove(x, y)) return false;
  const [sx, sy] = toScreen(x, y);
  return sy > pineTop(sx);
}, onPineBridge);
const PW_GROUND = pineShotGround.walk;
const PINE_TRAILS = [
  atAll([[40, 40], [212, 112], [380, 196], [507, 240], [700, 246], [880, 236], [1060, 206]]),
  atAll([[376, 278], [300, 360], [200, 450]]),
  atAll([[640, 384], [610, 300], [507, 240]]),
];
/** A pine gone wrong near the swamp: its trunk bent, its needles dark and thin, a violet sickness in them. */
function twistedPine(size: number, k: number) {
  const dark = ramp('#262c2c', '#2e3536', '#3a3a48', '#4a4360');
  return (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
    const h = (70 + 40 * size) * F * 0.5;
    const w = (18 + 10 * size) * F * 0.5;
    const lean = (hash(k, 1, 711) - 0.5) * 28;
    g.fillStyle = 'rgba(20,24,30,0.35)';
    g.beginPath();
    g.ellipse(sx, sy, w * 0.9, w * 0.45, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#3a2f34';
    g.lineWidth = 4 * F * 0.5 + 2;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(sx, sy);
    g.quadraticCurveTo(sx - lean, sy - h * 0.4, sx + lean * 0.6, sy - h * 0.75);
    g.stroke();
    for (let t = 0; t < 4; t++) {
      const yb = sy - h * 0.25 - t * h * 0.19;
      const cx = sx + lean * (t / 4) * 0.8 - lean * 0.3;
      const ww = w * (1 - t * 0.22) * (0.8 + 0.4 * hash(t, k, 713));
      const yt = yb - h * 0.3;
      g.fillStyle = rgb(dark[0]);
      g.beginPath();
      g.moveTo(cx + (hash(t, k, 715) - 0.5) * 8, yt);
      g.lineTo(cx + ww, yb + (hash(t, k, 717) - 0.5) * 6);
      g.lineTo(cx - ww, yb);
      g.closePath();
      g.fill();
      g.fillStyle = rgb(dark[2 + (hash(t, k, 719) > 0.5 ? 1 : 0)]);
      g.beginPath();
      g.moveTo(cx, yt);
      g.lineTo(cx - ww * 0.15, yb - 2);
      g.lineTo(cx - ww, yb);
      g.closePath();
      g.fill();
    }
  };
}
/** A hunter's old cabin: logs, a mossy roof, its door hanging open. */
const cabin = (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  const L = (dx: number, dy: number): [number, number] => [sx + dx * F, sy + dy * F];
  const poly = (pts: [number, number][], c: string): void => {
    g.fillStyle = c;
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath();
    g.fill();
  };
  g.fillStyle = 'rgba(20,30,20,0.35)';
  g.beginPath();
  g.ellipse(sx + 6 * F, sy, 34 * F, 12 * F, 0, 0, Math.PI * 2);
  g.fill();
  // walls of logs: the face toward the lower left lit, toward the lower right in shade
  poly([L(-28, -2), L(0, 12), L(0, -12), L(-28, -26)], '#8a6844');
  poly([L(0, 12), L(26, -1), L(26, -25), L(0, -12)], '#5e4630');
  g.fillStyle = 'rgba(40,26,16,0.6)';
  for (let i = 0; i < 6; i++) {
    const y = -4 - i * 4;
    g.fillRect(sx - 28 * F, sy + (y + 0.5) * F - (14 - i) * 0, 28 * F, F * 0.6);
  }
  poly([L(-16, 6), L(-8, 10), L(-8, -4), L(-16, -8)], '#2a1c14'); // the door, open
  poly([L(-6, 0), L(-1, 2), L(-1, -6), L(-6, -8)], '#e8c27a'); // a window, the light gone from it
  poly([L(-6, 0), L(-1, 2), L(-1, -6), L(-6, -8)], 'rgba(30,30,40,0.7)');
  // the roof, moss on it
  poly([L(-32, -24), L(-1, -42), L(-1, -12 - 2), L(-32, 4 - 30)], '#5b6a3c');
  poly([L(-1, -42), L(30, -27), L(30, -24 + 0), L(-1, -12 - 2)], '#45512f');
  poly([L(-32, -24), L(-1, -42), L(30, -27), L(-1, -12 - 2)], '#6a7a44');
  g.fillStyle = '#7f924f';
  for (let i = 0; i < 9; i++) g.fillRect(sx + (-26 + i * 6) * F, sy + (-32 + Math.abs(i - 4) * 2) * F, 3 * F, 2 * F);
};
const campfire = (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  const glow = g.createRadialGradient(sx, sy, 2, sx, sy, 40);
  glow.addColorStop(0, 'rgba(255,170,80,0.5)');
  glow.addColorStop(1, 'rgba(255,170,80,0)');
  g.fillStyle = glow;
  g.fillRect(sx - 40, sy - 40, 80, 80);
  g.fillStyle = '#ffb347';
  g.beginPath();
  g.moveTo(sx - 6, sy);
  g.quadraticCurveTo(sx - 4, sy - 10, sx, sy - 18);
  g.quadraticCurveTo(sx + 4, sy - 8, sx + 6, sy);
  g.closePath();
  g.fill();
  g.fillStyle = '#ffe2a0';
  g.fillRect(sx - 2, sy - 8, 4, 6);
};
const fern = (k: number) => (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  g.strokeStyle = hash(k, 0, 721) > 0.5 ? '#4f7a36' : '#3f6a2e';
  g.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * 0.45;
    g.beginPath();
    g.moveTo(sx, sy);
    g.quadraticCurveTo(sx + Math.cos(a) * 10, sy + Math.sin(a) * 12, sx + Math.cos(a) * 18, sy + Math.sin(a) * 9 + 4);
    g.stroke();
  }
};
const mushrooms = (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  for (let i = 0; i < 3; i++) {
    const x = sx + (i - 1) * 6;
    g.fillStyle = '#e9e1cf';
    g.fillRect(x - 1, sy - 5, 2, 5);
    g.fillStyle = i === 1 ? '#c8443a' : '#b23a32';
    g.beginPath();
    g.ellipse(x, sy - 6, 4, 2.5, 0, Math.PI, 0);
    g.fill();
    g.fillStyle = '#fff4e0';
    g.fillRect(x - 1, sy - 8, 1, 1);
  }
};
const fallenLog = (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  g.fillStyle = 'rgba(20,30,20,0.35)';
  g.beginPath();
  g.ellipse(sx + 4, sy + 2, 40, 9, -0.35, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#5a4230';
  g.lineWidth = 12;
  g.lineCap = 'butt';
  g.beginPath();
  g.moveTo(sx - 34, sy + 10);
  g.lineTo(sx + 34, sy - 14);
  g.stroke();
  g.strokeStyle = '#7a5c40';
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(sx - 34, sy + 6);
  g.lineTo(sx + 34, sy - 18);
  g.stroke();
  g.fillStyle = '#b08a5e';
  g.beginPath();
  g.ellipse(sx + 34, sy - 14, 4, 6, -0.35, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#6f8f3e';
  for (let i = 0; i < 5; i++) g.fillRect(sx - 26 + i * 12, sy + 2 - i * 4.5, 6, 3);
};
const pineShot: Level = {
  ...pinewood,
  title: '',
  note: '',
  gr: pineShotGround,
  floor: (x, y, px, py) => {
    if (onPineBridge(x, y)) {
      // a little footbridge: planks across, a rail along each side
      const along = (((x + y) * 3.2) % 1 + 1) % 1;
      return along < 0.14 ? hex('#4a3322') : pick(P_DIRT, 0.55 + 0.35 * fbm(x * 6, y * 2, 77), px, py);
    }
    const [sx] = toScreen(x, y);
    const east = Math.max(0, Math.min(1, (sx - 640) / 360));
    const onTrail = PINE_TRAILS.some((t) => lineDist(t, x, y) < 0.2 + 0.07 * vn(x * 2, y * 2, 723));
    let c = onTrail ? pick(P_DIRT, fbm(x * 3, y * 3, 51), px, py) : pick(P_GRASS, fbm(x * 1.8, y * 1.8, 53) * 0.8 + pineShotGround.field(x, y) * 0.3, px, py);
    if (!onTrail && fbm(x * 0.9 + 4, y * 0.9, 725) > 0.66) c = pick(ramp('#7a5a36', '#8a6a42', '#9a7a4e'), fbm(x * 4, y * 4, 727), px, py); // needles
    if (!onTrail && hash(px >> 1, py >> 1, 55) > 0.975) c = [hex('#e8dd8a'), hex('#f2f0e8'), hex('#c9a3e0')][Math.floor(hash(px >> 1, py >> 1, 57) * 3)]; // flowers
    if (east > 0) c = mix(c, hex('#4a4058'), east * 0.32); // the swamp's sickness, creeping in from the east
    return c;
  },
  outside: (x, y, px, py) => {
    if (inPineRiver(x, y)) {
      const t = fbm(x * 2.5 + y * 0.5, y * 1.2, 61);
      let c = pick(P_WATER, t, px, py);
      const d = lineDist(pineRiverW, x, y);
      if (d > 0.47) c = hex('#c9e4e6'); // foam along the banks
      else if (d > 0.4) c = hex('#5c6b4a'); // its bank
      if (Math.abs(((fbm(x * 0.9, y * 0.9, 729) * 7) % 1) - 0.5) < 0.04) c = mix(c, hex('#d9f0f2'), 0.5);
      return c;
    }
    let c = pick(P_UNDER, fbm(x * 2, y * 2, 63), px, py);
    if (hash(px >> 1, py >> 1, 65) > 0.93) c = hex('#6b5536'); // needles
    const [sx] = toScreen(x, y);
    const east = Math.max(0, Math.min(1, (sx - 640) / 360));
    if (east > 0) c = mix(c, hex('#2c2838'), east * 0.4);
    return c;
  },
  props: [],
  hero: at(507, 240) as [number, number],
  after: (g, _kind, top) => {
    // light coming down through the trees from the upper left, in long shafts
    g.save();
    g.globalCompositeOperation = 'lighter';
    for (let n = 0; n < 5; n++) {
      const x0 = 80 + n * 210 + 60 * hash(n, 0, 731);
      const grd = g.createLinearGradient(x0, top, x0 + 160, top + PH);
      grd.addColorStop(0, 'rgba(255,240,190,0.10)');
      grd.addColorStop(1, 'rgba(255,240,190,0)');
      g.fillStyle = grd;
      g.beginPath();
      g.moveTo(x0, top);
      g.lineTo(x0 + 46, top);
      g.lineTo(x0 + 46 + 220, top + PH);
      g.lineTo(x0 + 220, top + PH);
      g.closePath();
      g.fill();
    }
    g.restore();
    // fog, low through the trees, thicker toward the swamp
    for (let n = 0; n < 16; n++) {
      const x = hash(n, 1, 733) * PW;
      const y = top + 40 + (PH - 40) * hash(n, 2, 733);
      const r = 50 + 60 * hash(n, 3, 733);
      const east = Math.max(0, Math.min(1, (x - 500) / 500));
      const grd = g.createRadialGradient(x, y, 4, x, y, r);
      grd.addColorStop(0, `rgba(225,232,226,${0.12 + 0.12 * east})`);
      grd.addColorStop(1, 'rgba(225,232,226,0)');
      g.fillStyle = grd;
      g.beginPath();
      g.ellipse(x, y, r * 1.8, r * 0.6, 0, 0, Math.PI * 2);
      g.fill();
    }
  },
};
// ---------------------------------------------------------------------------------------------
// THE QUARRY as one screen of the game. His "Yes" (13 Oct, 08:28) to painting it the same way. His word
// of 18:56 (12 Oct): "I’d like the quarry and forest to be mostly open with minimal narrow paths between
// open areas". The doc: terraces stepping down the mountain, with cranes, chains and minecart rails; the
// cult's captives cutting giant obelisks; overseers. His rules since: the near cliff cut away with its
// sheer face in shadow only where its ridge slants back past straight down; the tops dressed.

const QH = 110;
const Q_RAILS_SHOT = atAll([[150, 318], [330, 286], [470, 262], [600, 222], [700, 192], [800, 166], [920, 140], [1060, 120]]);
const qShotGround = ground(union(
  area(480, 290, 6.8, 5.4, 0.2),
  area(860, 150, 3.7, 2.7, -0.2),
  path(atAll([[560, 230], [680, 196], [800, 166]]), 2.6),
  path(atAll([[300, 330], [220, 382], [150, 440], [110, 480]]), 1.05),
  path(atAll([[340, 170], [270, 120], [210, 70], [180, 20]]), 1.0),
));
const QW = qShotGround.walk;
const qKind = (px: number, py: number): number => {
  const [x, y] = toWorld(px + 0.5, py + 0.5);
  if (QW(x, y)) return SK.Floor;
  const [qx, qy] = toWorld(px + 0.5, py + 0.5 + QH);
  return QW(qx, qy) ? SK.Face : SK.Top;
};
const qOnTop = (px: number, py: number, draw: Prop['draw']): Prop => {
  const [x, y] = toWorld(px, py + QH);
  return { x, y, draw: (g, sx, sy) => draw(g, sx, sy - QH) };
};
const qClear = (px: number, py: number, hw: number, h: number): boolean => {
  for (let yy = py + 4; yy >= py - h; yy -= 3) {
    for (let xx = px - hw; xx <= px + hw; xx += 3) {
      if (xx < 0 || yy < 0 || xx >= PW || yy >= PH) continue;
      if (qKind(xx, yy) === SK.Floor) return false;
    }
  }
  return qKind(px, py) === SK.Top && qKind(px - 8, py + 2) === SK.Top && qKind(px + 8, py + 2) === SK.Top;
};
const greyRock = (r: number) => boulder(r, '#d6cbc0', '#aea194', '#706563');
/** A wooden crane over the pit, a block of stone hanging from its chain. */
const qCrane = (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  g.fillStyle = 'rgba(40,36,44,0.3)';
  g.beginPath();
  g.ellipse(sx + 10, sy + 2, 30, 9, 0, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#5c4331';
  g.lineWidth = 6;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(sx - 12, sy);
  g.lineTo(sx, sy - 120);
  g.lineTo(sx + 12, sy);
  g.moveTo(sx - 7, sy - 46);
  g.lineTo(sx + 7, sy - 46);
  g.stroke();
  g.strokeStyle = '#7a5a42';
  g.lineWidth = 7;
  g.beginPath();
  g.moveTo(sx - 20, sy - 112);
  g.lineTo(sx + 96, sy - 140);
  g.stroke();
  // the chain, link by link, and the block on it
  g.fillStyle = '#4a4650';
  for (let y = sy - 134; y < sy - 92; y += 5) g.fillRect(sx + 88, y, 3, 3);
  STONE_BLOCK(g, sx + 90, sy - 50);
  g.strokeStyle = '#4a4650';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(sx + 89, sy - 94);
  g.lineTo(sx + 66, sy - 82);
  g.moveTo(sx + 89, sy - 94);
  g.lineTo(sx + 112, sy - 82);
  g.stroke();
  g.fillStyle = 'rgba(40,36,44,0.3)'; // its shadow on the floor
  g.beginPath();
  g.ellipse(sx + 96, sy + 6, 26, 9, 0, 0, Math.PI * 2);
  g.fill();
};
/** The giant obelisk the captives are cutting, lying where it was split from the rock, chisels and wedges by it. */
const qObelisk = (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  box(3.4, 0.85, 26, hex('#e6dccf'), hex('#cbbfb1'), hex('#8f8290'))(g, sx, sy);
  g.fillStyle = 'rgba(80,70,80,0.55)';
  for (let i = 0; i < 14; i++) g.fillRect(Math.round(sx - 40 + i * 9), Math.round(sy - 22 - i * 4.5), 2, 6); // the chisel marks
  g.fillStyle = '#ff5fd2'; // the cult's mark, cut in and painted
  g.fillRect(Math.round(sx + 6), Math.round(sy - 50), 4, 10);
  g.fillRect(Math.round(sx + 2), Math.round(sy - 46), 12, 3);
  g.fillStyle = '#6b6470';
  for (let i = 0; i < 3; i++) g.fillRect(Math.round(sx - 70 + i * 10), Math.round(sy + 22 - i * 3), 8, 3); // wedges and a hammer
  g.fillStyle = '#7a5a42';
  g.fillRect(Math.round(sx - 40), Math.round(sy + 24), 14, 3);
};
const qCart = (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  box(0.75, 0.55, 16, hex('#7c5e46'), hex('#6a4f3b'), hex('#4a3729'))(g, sx, sy);
  g.fillStyle = '#2a2420';
  g.beginPath();
  g.ellipse(sx - 14, sy + 4, 5, 5, 0, 0, Math.PI * 2);
  g.ellipse(sx + 12, sy + 8, 5, 5, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#b6aca3';
  for (let i = 0; i < 4; i++) g.fillRect(Math.round(sx - 10 + i * 6), Math.round(sy - 24 - (i % 2) * 3), 6, 4); // rubble in it
};
const qScaffold = (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
  g.strokeStyle = '#6b4f38';
  g.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    g.beginPath();
    g.moveTo(sx - 20 + i * 20, sy);
    g.lineTo(sx - 20 + i * 20, sy - 44);
    g.stroke();
  }
  g.lineWidth = 4;
  for (const y of [-14, -30, -44]) {
    g.beginPath();
    g.moveTo(sx - 24, sy + y);
    g.lineTo(sx + 24, sy + y);
    g.stroke();
  }
};
const quarryShot: Level = {
  ...quarry,
  title: '',
  note: '',
  gr: qShotGround,
  outsideH: QH,
  floor: (x, y, px, py) => {
    let c = pick(Q_FLOOR, fbm(x * 2.3, y * 2.3, 11) * 1.1 - 0.05, px, py);
    if (hash(px >> 1, py >> 1, 13) > 0.94) c = Q_FLOOR[0]; // grit
    if (fbm(x * 0.9, y * 0.9, 801) > 0.62) c = mix(c, hex('#e9e1d6'), 0.35); // the white dust of the cutting
    const dr = lineDist(Q_RAILS_SHOT, x, y);
    if (Math.abs(dr - 0.2) < 0.045) c = hex('#6a6470'); // the rails
    else if (Math.abs(dr - 0.2) < 0.075 && hash(Math.floor(x * 30), Math.floor(y * 30), 3) > 0.2) c = hex('#a8a4b0');
    else if (dr < 0.3 && ((x * 3.3 + y * 0.6) % 1 + 1) % 1 < 0.22) c = hex('#6e5442'); // the sleepers
    return c;
  },
  outside: (x, y, px, py) => {
    let c = fbm(x * 0.9, y * 0.9, 21) > 0.46 ? pick(Q_GRASS, fbm(x * 4, y * 4, 23), px, py) : pick(Q_TOPROCK, fbm(x * 3, y * 3, 25), px, py);
    if (hash(px >> 1, py >> 1, 803) > 0.985) c = [hex('#e8dd8a'), hex('#f2f0e8')][Math.floor(hash(px >> 1, py >> 1, 805) * 2)]; // mountain flowers
    return c;
  },
  props: [],
  hero: at(507, 240) as [number, number],
  tint: (c) => [c[0] * 1.0, c[1] * 1.0, Math.min(255, c[2] * 1.03)],
  after: (g, _kind, top) => {
    // the dust of the cutting, hanging in the air
    for (let n = 0; n < 10; n++) {
      const x = hash(n, 1, 807) * PW;
      const y = top + PH * hash(n, 2, 807);
      const r = 50 + 50 * hash(n, 3, 807);
      const grd = g.createRadialGradient(x, y, 4, x, y, r);
      grd.addColorStop(0, 'rgba(240,236,228,0.14)');
      grd.addColorStop(1, 'rgba(240,236,228,0)');
      g.fillStyle = grd;
      g.beginPath();
      g.ellipse(x, y, r * 1.6, r * 0.7, 0, 0, Math.PI * 2);
      g.fill();
    }
  },
};
if (QUARRY_SHOT) {
  const onQ = (px: number, py: number, draw: Prop['draw']): Prop => {
    const [x, y] = at(px, py);
    if (!QW(x, y)) console.warn('quarry prop off the floor', px, py);
    return { x, y, draw };
  };
  const props: Prop[] = [
    onQ(420, 200, qObelisk),
    onQ(560, 300, qCrane),
    onQ(690, 196, qCart),
    onQ(300, 250, STONE_BLOCK),
    onQ(300, 250, (g, sx, sy) => STONE_BLOCK(g, sx, sy - 22)),
    onQ(330, 262, STONE_BLOCK),
    onQ(880, 170, STONE_BLOCK),
    onQ(610, 260, greyRock(0.24)),
    onQ(622, 268, greyRock(0.15)),
    onQ(380, 300, greyRock(0.2)),
    onQ(800, 130, greyRock(0.26)),
  ];
  // the tops, dressed: pines, rocks, stacked blocks, scaffolding, the cult's banner; never over the floor
  let n = 0;
  let banners = 0;
  for (let gy = 6; gy < PH + 20; gy += 20) {
    for (let gx = 6; gx < PW; gx += 26) {
      n++;
      const px = Math.round(gx + (hash(gx, gy, 811) - 0.5) * 20);
      const py = Math.round(gy + (hash(gx, gy, 812) - 0.5) * 14);
      const roll = hash(gx, gy, 813);
      const [wx0, wy0] = toWorld(px, py + QH);
      const grove = fbm(wx0 * 0.35, wy0 * 0.35, 814);
      let draw: Prop['draw'] | null = null;
      let hw = 12;
      let h = 16;
      if (grove > 0.64 && roll < 0.45) {
        draw = pine(0.4 + 0.5 * hash(gx, gy, 815), n);
        hw = 22;
        h = 64;
      } else if (roll < 0.12) draw = greyRock(0.16 + 0.18 * hash(gx, gy, 816));
      else if (roll < 0.2) draw = tuft(n);
      else if (roll < 0.21) {
        draw = STONE_BLOCK;
        hw = 30;
        h = 30;
      } else if (roll < 0.225) {
        draw = qScaffold;
        hw = 26;
        h = 48;
      } else if (roll < 0.235 && banners < 2) {
        draw = banner;
        hw = 18;
        h = 50;
      }
      if (!draw || !qClear(px, py, hw, h)) continue;
      if (draw === banner) banners++;
      props.push(qOnTop(px, py, draw));
    }
  }
  quarryShot.props = props;
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = PH;
  const qg = cvs.getContext('2d') as CanvasRenderingContext2D;
  qg.imageSmoothingEnabled = false;
  // the cult's overseers, in both pits
  paintLevel(qg, 0, quarryShot, { shadow: 1.3, foes: [at(470, 296), at(860, 158), at(805, 186)] as [number, number][] });
  placeHud(qg, 'The Quarry', QW, quarryShot.hero);
  showAlone(cvs);
}

// ---------------------------------------------------------------------------------------------
// A CULT STRONGHOLD, AT ITS DOOR, as one screen of the game. His question (13 Oct, 09:27): "How about a
// cultist stronghold?" His plan (12 Oct, 17:21), as the doc has it: on every level from 6 to 10, off the
// main path, always one and never more than two; a couple of rare mobs guard the door; it opens only
// for a word given to it, up to three, each used up, each past the first making the mobs inside harder
// and the rewards richer; the last room drops runedust. The Quarry's, as the doc proposes: an overseers'
// redoubt cut into an old terrace. So: its gate set into the terrace's face between two towers of the
// quarry's own stone, the cult's keep behind; the cult's violet banners and braziers of its pink fire;
// the door sealed with the cult's mark in pink; over the arch, three empty sockets where words go; two
// guards, rare, drawn as the game draws a yellow pack's
// leader (the gold ring of letters at its feet, its name in yellow).

const HOLD_H = 150;
const [HXD, HY0] = at(660, 238); // the door's foot, its middle
const holdCourt: Shape = (x, y) => x > HXD - 3.3 && x < HXD + 3.3 && y >= HY0 && y < HY0 + 3.4;
const holdOpen = area(480, 336, 6.2, 4.0, 0.25);
const holdRoad = path(atAll([[-20, 350], [200, 410], [470, 362], [780, 394], [1040, 342]]), 3.2);
const holdEast = area(890, 326, 3.0, 2.4, -0.2);
const holdFore = union(area(690, 336, 3.0, 2.0, -0.2), area(780, 318, 2.4, 1.8, -0.2));
const holdGround = ground((x, y) => {
  if (y < HY0 + 0.7 && x > HXD - 4.1 && x < HXD + 4.1) return false; // the terrace the redoubt is cut into
  return holdOpen(x, y) || holdRoad(x, y) || holdEast(x, y) || holdFore(x, y);
}, holdCourt);
const HW_ = holdGround.walk;
const hKind = (px: number, py: number): number => {
  const [x, y] = toWorld(px + 0.5, py + 0.5);
  if (HW_(x, y)) return SK.Floor;
  const [qx, qy] = toWorld(px + 0.5, py + 0.5 + HOLD_H);
  return HW_(qx, qy) ? SK.Face : SK.Top;
};
const FLAG = ramp('#8a8290', '#9c94a1', '#aea6b1', '#bfb7c0');
const holdShot: Level = {
  ...quarry,
  title: '',
  note: '',
  gr: holdGround,
  outsideH: HOLD_H,
  floor: (x, y, px, py) => {
    if (holdCourt(x, y)) {
      // the forecourt: big flagstones of the quarry's stone, laid in rows; worn pale down the middle to the door
      const fx = x - HXD;
      const fy = y - HY0;
      const row = Math.floor(fy / 0.8);
      const sx = fx + (row % 2) * 0.45 + 3;
      const col = Math.floor(sx / 0.9);
      const ux = sx - col * 0.9;
      const vy = fy - row * 0.8;
      let c = pick(FLAG, 0.25 + 0.5 * hash(col, row, 901) + 0.4 * (fbm(x * 3, y * 3, 903) - 0.5), px, py);
      if (Math.abs(fx) < 0.75) c = mix(c, hex('#d6ced3'), 0.16 * (1 - Math.abs(fx) / 0.75));
      if (ux < 0.05 || vy < 0.06) c = hex('#5c5565'); // the joints
      else if (ux < 0.1 || vy < 0.11) c = mix(c, hex('#d9d1d8'), 0.22); // each stone's worn edge, catching the light
      if (Math.abs(fbm(x * 2.6, y * 2.6, 905) - 0.5) < 0.01) c = hex('#655e6e'); // cracks
      return c;
    }
    let c = pick(Q_FLOOR, fbm(x * 2.3, y * 2.3, 11) * 1.1 - 0.05, px, py);
    if (hash(px >> 1, py >> 1, 13) > 0.94) c = Q_FLOOR[0]; // grit
    if (fbm(x * 0.9, y * 0.9, 801) > 0.62) c = mix(c, hex('#e9e1d6'), 0.35); // the white dust of the cutting
    return c;
  },
  outside: (x, y, px, py) => {
    let c = fbm(x * 0.9, y * 0.9, 21) > 0.46 ? pick(Q_GRASS, fbm(x * 4, y * 4, 23), px, py) : pick(Q_TOPROCK, fbm(x * 3, y * 3, 25), px, py);
    if (hash(px >> 1, py >> 1, 803) > 0.985) c = [hex('#e8dd8a'), hex('#f2f0e8')][Math.floor(hash(px >> 1, py >> 1, 805) * 2)]; // mountain flowers
    return c;
  },
  props: [],
  hero: at(482, 292) as [number, number],
  tint: (c) => [c[0] * 1.0, c[1] * 0.99, Math.min(255, c[2] * 1.03)],
};

if (HOLD_SHOT) {
  const [DX, DY] = toScreen(HXD, HY0);
  /** A point of the redoubt: u tiles along the terrace (x), v tiles out from its face (y), z picture pixels up. */
  const PP = (u: number, v: number, z: number): [number, number] => [DX + (u - v) * HWf, DY + (u + v) * HHf - z];
  const poly = (g: CanvasRenderingContext2D, pts: [number, number][], c: string): void => {
    g.fillStyle = c;
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath();
    g.fill();
  };
  /** A piece of a face looking out of the terrace (toward the lower left), u0 to u1 along it, z0 to z1 up, v out. */
  const front = (g: CanvasRenderingContext2D, u0: number, u1: number, v: number, z0: number, z1: number, c: string): void =>
    poly(g, [PP(u0, v, z0), PP(u1, v, z0), PP(u1, v, z1), PP(u0, v, z1)], c);
  /** A piece of a face looking along the terrace (toward the lower right), v0 to v1 out, at u. */
  const side = (g: CanvasRenderingContext2D, u: number, v0: number, v1: number, z0: number, z1: number, c: string): void =>
    poly(g, [PP(u, v0, z0), PP(u, v1, z0), PP(u, v1, z1), PP(u, v0, z1)], c);
  const line = (g: CanvasRenderingContext2D, a: [number, number], b: [number, number], c: string, w = F): void => {
    g.strokeStyle = c;
    g.lineWidth = w;
    g.beginPath();
    g.moveTo(a[0], a[1]);
    g.lineTo(b[0], b[1]);
    g.stroke();
  };
  const glow = (g: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, a: number): void => {
    const gr = g.createRadialGradient(x, y, 1, x, y, rx);
    gr.addColorStop(0, `rgba(255, 95, 210, ${a})`);
    gr.addColorStop(1, 'rgba(255, 95, 210, 0)');
    g.fillStyle = gr;
    g.save();
    g.translate(x, y);
    g.scale(1, ry / rx);
    g.translate(-x, -y);
    g.beginPath();
    g.arc(x, y, rx, 0, Math.PI * 2);
    g.fill();
    g.restore();
  };
  const glow2 = (g: CanvasRenderingContext2D, x: number, y: number, r: number, c: string): void => {
    const gr = g.createRadialGradient(x, y, 1, x, y, r);
    gr.addColorStop(0, c);
    gr.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = gr;
    g.fillRect(x - r, y - r, 2 * r, 2 * r);
  };
  /** The cult's mark (as on its banners), h pixels tall, standing on the face at (u, v, z): pink, burning. */
  const cultMark = (g: CanvasRenderingContext2D, u: number, v: number, z: number, h: number, burning: boolean): void => {
    const s = h / 10;
    const draw = (c: string, grow: number): void => {
      front(g, u - 0.07 * s - grow, u + 0.07 * s + grow, v, z - grow * 16, z + h + grow * 16, c);
      front(g, u - 0.22 * s - grow, u + 0.22 * s + grow, v, z + h * 0.55 - grow * 16, z + h * 0.55 + 2.4 * s + grow * 16, c);
    };
    if (burning) {
      g.save();
      g.shadowColor = 'rgba(255, 95, 210, 0.95)';
      g.shadowBlur = 14;
      draw('#ff5fd2', 0.03);
      g.restore();
      draw('#ffc2ef', 0);
    } else draw('#ff5fd2', 0);
  };

  // ---- the keep behind, on the terrace's top
  const KEEP = box(2.6, 1.4, 34, hex('#9a92a0'), hex('#837a8c'), hex('#564e60'));
  const keepAt = PP(0.3, -1.1, HOLD_H);
  // ---- the towers
  const TOWER_H = 176;
  const TW = 0.7; // half its width along the terrace
  const tower = (g: CanvasRenderingContext2D, uc: number): void => {
    const v0 = -0.6;
    const v1 = 0.8;
    // its shadow on the floor, thrown away from the light (from the upper left), along the terrace
    poly(g, [PP(uc + TW, 0, 0), PP(uc + TW + 1.5, 0, 0), PP(uc + TW + 1.5, v1 - 0.1, 0), PP(uc + TW, v1, 0)], 'rgba(34, 24, 46, 0.26)');
    // its faces: the front lit, the side in shadow (its back half in the terrace, seen only over it);
    // courses of the quarry's big blocks
    const TOPZ = HOLD_H + 6;
    front(g, uc - TW, uc + TW, v1, 0, TOWER_H, '#958b9b');
    side(g, uc + TW, v1, 0, 0, TOWER_H, '#5f5769');
    side(g, uc + TW, 0, v0, TOPZ, TOWER_H, '#5f5769');
    for (let z = 18; z < TOWER_H; z += 18) {
      line(g, PP(uc - TW, v1, z), PP(uc + TW, v1, z), '#6f6678', F);
      line(g, PP(uc + TW, v1, z), PP(uc + TW, z > TOPZ ? v0 : 0, z), '#463f50', F);
      line(g, PP(uc - TW, v1, z + F), PP(uc + TW, v1, z + F), '#aaa1ae', 1);
      const j = Math.floor(z / 18);
      for (let k = 0; k < 3; k++) {
        const u = uc - TW + ((k + (j % 2) * 0.5 + 0.25) / 2.5) * (2 * TW);
        if (u > uc - TW + 0.08 && u < uc + TW - 0.08) line(g, PP(u, v1, z - 18), PP(u, v1, z), '#6f6678', F);
      }
    }
    // a band of carved stone round it, high up
    front(g, uc - TW, uc + TW, v1, 136, 142, '#7b7284');
    side(g, uc + TW, v1, 0, 136, 142, '#4a4354');
    // arrow slits, lit from within by the cult's fire
    for (const zz of [150, 76]) {
      front(g, uc - 0.05, uc + 0.05, v1, zz, zz + 20, '#1a1220');
      front(g, uc - 0.015, uc + 0.015, v1, zz + 4, zz + 16, '#c2318f');
    }
    side(g, uc + TW, 0.32, 0.4, 150, 170, '#130d18');
    // its top, and the merlons round it
    poly(g, [PP(uc - TW, v0, TOWER_H), PP(uc + TW, v0, TOWER_H), PP(uc + TW, v1, TOWER_H), PP(uc - TW, v1, TOWER_H)], '#b3aab6');
    const merlon = box(0.24, 0.24, 14, hex('#c2b9c4'), hex('#9b91a1'), hex('#665e70'));
    const spots: [number, number][] = [];
    for (let i = 0; i < 4; i++) {
      const u = uc - TW + 0.12 + (i / 3) * (2 * TW - 0.24);
      spots.push([u, v0 + 0.12], [u, v1 - 0.12]);
    }
    for (let i = 1; i < 4; i++) {
      const v = v0 + 0.12 + (i / 4) * (v1 - v0 - 0.24);
      spots.push([uc - TW + 0.12, v], [uc + TW - 0.12, v]);
    }
    spots.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
    for (const [u, v] of spots) {
      const [mx, my] = PP(u, v, TOWER_H);
      merlon(g, mx, my);
    }
    // the cult's banner down its front: violet, swallow-tailed, the pink mark on it
    const bv = v1 + 0.02;
    line(g, PP(uc - 0.38, bv, 132), PP(uc + 0.38, bv, 132), '#2a1d16', 2 * F);
    poly(g, [PP(uc - 0.3, bv, 130), PP(uc + 0.3, bv, 130), PP(uc + 0.3, bv, 44), PP(uc, bv, 58), PP(uc - 0.3, bv, 44)], '#4a2a63');
    poly(g, [PP(uc + 0.19, bv, 130), PP(uc + 0.3, bv, 130), PP(uc + 0.3, bv, 44), PP(uc + 0.19, bv, 51)], '#3a2050');
    cultMark(g, uc, bv, 82, 30, false);
  };
  // ---- the gate: an arch cut in the terrace, its door set back in it
  const GW = 0.85;
  const GZ = 60;
  const RISE = 34;
  const arch = (w: number, v: number, z0: number, rise: number): [number, number][] => {
    const pts: [number, number][] = [PP(-w, v, 0), PP(-w, v, z0)];
    for (let k = 0; k <= 24; k++) {
      const u = -w + (2 * w * k) / 24;
      pts.push(PP(u, v, z0 + rise * Math.sqrt(Math.max(0, 1 - (u / w) ** 2))));
    }
    pts.push(PP(w, v, z0), PP(w, v, 0));
    return pts;
  };
  const archZ = (u: number, w: number, z0: number, rise: number): number => z0 + rise * Math.sqrt(Math.max(0, 1 - (u / w) ** 2));
  const DEEP = 0.32; // how far the door is set back

  const facade = (g: CanvasRenderingContext2D): void => {
    // the keep, behind
    KEEP(g, keepAt[0], keepAt[1]);
    {
      // its lit windows and its flag
      const [kx, ky] = keepAt;
      for (const [ox, oy] of [[-16, -22], [8, -12]]) {
        g.fillStyle = '#1a1220';
        g.fillRect(kx + ox, ky + oy - 12, 3, 12);
        g.fillStyle = '#c2318f';
        g.fillRect(kx + ox + 1, ky + oy - 9, 1, 6);
      }
      g.fillStyle = '#2a1d16';
      g.fillRect(kx + 30, ky - 80, 3, 50);
      poly(g, [[kx + 33, ky - 78], [kx + 62, ky - 72], [kx + 52, ky - 64], [kx + 62, ky - 56], [kx + 33, ky - 60]], '#4a2a63');
      g.fillStyle = '#ff5fd2';
      g.fillRect(kx + 41, ky - 74, 3, 10);
      g.fillRect(kx + 38, ky - 70, 9, 2);
    }
    // the dressed face of the terrace: the quarry's stone, cut in big blocks, laid in courses
    for (let z = 0, j = 0; z < HOLD_H; z += 16, j++) {
      const zt = Math.min(HOLD_H, z + 16);
      for (let u = -3.3 - (j % 2) * 0.31; u < 3.3; u += 0.62) {
        const a = Math.max(-3.3, u);
        const b = Math.min(3.3, u + 0.62);
        const shade = ['#82788a', '#8a8092', '#91889a', '#7a7183'][Math.floor(hash(Math.round(u * 10), j, 911) * 4)];
        front(g, a, b, 0, z, zt, shade);
        front(g, a, b, 0, zt - F, zt, '#a39aa8');
        line(g, PP(a, 0, z), PP(a, 0, zt), '#5a5264', F);
      }
      line(g, PP(-3.3, 0, z), PP(3.3, 0, z), '#5a5264', F);
    }
    // weathering: dark streaks down from the top
    for (let i = 0; i < 9; i++) {
      const u = -2.8 + 5.6 * hash(i, 1, 913);
      const len = 30 + 60 * hash(i, 2, 913);
      front(g, u, u + 0.05 + 0.08 * hash(i, 3, 913), 0, HOLD_H - len, HOLD_H, 'rgba(50, 40, 60, 0.22)');
    }
    // the parapet along its top, and its merlons
    front(g, -3.3, 3.3, 0, HOLD_H, HOLD_H + 6, '#8f8597');
    poly(g, [PP(-3.3, -0.3, HOLD_H + 6), PP(3.3, -0.3, HOLD_H + 6), PP(3.3, 0, HOLD_H + 6), PP(-3.3, 0, HOLD_H + 6)], '#b1a8b4');
    const merlon = box(0.28, 0.26, 13, hex('#c2b9c4'), hex('#9b91a1'), hex('#665e70'));
    for (let u = -3.15; u < 3.3; u += 0.5) {
      const [mx, my] = PP(u + 0.14, -0.13, HOLD_H + 6);
      merlon(g, mx, my);
    }
    // over the arch, a band of the cult's script cut into the stone
    {
      const FZ0 = GZ + RISE + 17;
      front(g, -1.15, 1.15, 0, FZ0, FZ0 + 14, '#a79eab');
      front(g, -1.1, 1.1, 0, FZ0 + 2, FZ0 + 12, '#776e80');
      for (let i = 0; i < 16; i++) {
        const u = -1.0 + i * 0.133;
        const k = hash(i, 1, 935);
        front(g, u, u + 0.04, 0, FZ0 + 4, FZ0 + 10, '#4a4254');
        if (k > 0.4) front(g, u, u + 0.09, 0, FZ0 + (k > 0.7 ? 9 : 4), FZ0 + (k > 0.7 ? 10 : 5), '#4a4254');
      }
    }
    // the arch: its jambs and its ring of wedge stones, paler than the wall
    poly(g, arch(GW + 0.24, 0, GZ, RISE + 12), '#aaa1ae');
    for (let z = 0; z < GZ; z += 16) {
      line(g, PP(-GW - 0.24, 0, z), PP(-GW, 0, z), '#6d6476', F);
      line(g, PP(GW, 0, z), PP(GW + 0.24, 0, z), '#6d6476', F);
    }
    for (let k = 1; k < 11; k++) {
      const a = Math.PI - (k / 11) * Math.PI;
      const ui = Math.cos(a) * GW;
      const uo = Math.cos(a) * (GW + 0.24);
      line(g, PP(ui, 0, archZ(ui, GW, GZ, RISE)), PP(uo, 0, archZ(uo, GW + 0.24, GZ, RISE + 12)), '#6d6476', F);
    }
    // the keystone, bigger
    {
      const z = GZ + RISE;
      front(g, -0.12, 0.12, 0, z - 4, z + 14, '#c0b7c2');
      front(g, -0.12, 0.12, 0, z + 12, z + 14, '#d6ced8');
    }
    // the opening: dark; its left side and its floor seen, the door set back in it
    poly(g, arch(GW, 0, GZ, RISE), '#130e19');
    poly(g, [PP(-GW, 0, 0), PP(-GW, -DEEP, 0), PP(-GW, -DEEP, GZ), PP(-GW, 0, GZ)], '#4c4456');
    poly(g, [PP(-GW, 0, 0), PP(GW, 0, 0), PP(GW, -DEEP, 0), PP(-GW, -DEEP, 0)], '#6c6475');
    // the door: two leaves of dark wood bound in iron, sealed with the cult's mark burning across them
    poly(g, arch(GW - 0.02, -DEEP, GZ, RISE), '#35272b');
    for (let u = -GW + 0.16; u < GW - 0.05; u += 0.16) line(g, PP(u, -DEEP, 0), PP(u, -DEEP, archZ(u, GW, GZ, RISE) - 1), '#241a1e', F);
    for (const z of [16, 42, 68]) {
      const w = z > GZ ? GW * Math.sqrt(Math.max(0, 1 - ((z - GZ) / RISE) ** 2)) - 0.04 : GW - 0.04;
      front(g, -w, w, -DEEP, z, z + 5, '#4b4453');
      g.fillStyle = '#9a92a3';
      for (let u = -w + 0.08; u < w; u += 0.2) {
        const [sx, sy] = PP(u, -DEEP, z + 3);
        g.fillRect(Math.round(sx), Math.round(sy), F, F);
      }
    }
    // the seal: the mark across both leaves, and its light running down the seam between them
    g.save();
    g.shadowColor = 'rgba(255, 95, 210, 0.9)';
    g.shadowBlur = 10;
    line(g, PP(0, -DEEP, 2), PP(0, -DEEP, GZ + RISE - 2), '#ff5fd2', F);
    g.restore();
    cultMark(g, 0, -DEEP, 18, 52, true);
    // the seal's light on the floor in front of the door
    {
      const [gx, gy] = PP(0, 0.6, 0);
      glow(g, gx, gy, 70, 26, 0.2);
    }
    // the dust and grit gathered at the foot of the terrace
    for (let i = 0; i < 40; i++) {
      const u = -3.3 + 6.6 * hash(i, 5, 917);
      if (Math.abs(u) < GW + 0.3) continue;
      const [sx, sy] = PP(u, 0.06 + 0.12 * hash(i, 6, 917), 0);
      g.fillStyle = hash(i, 7, 917) > 0.5 ? '#c9bfb6' : '#8e8580';
      g.fillRect(Math.round(sx), Math.round(sy - F), 2 * F, F);
    }
  };
  /** Fire as tongues licking up, leaning and of different heights: the cult's pink, its heart near white. */
  const tongues = (g: CanvasRenderingContext2D, bx: number, by: number, h: number, w: number): void => {
    const set: [number, number, number, number][] = [[-0.55, 0.62, -0.25, 0.42], [0.45, 0.72, 0.3, 0.4], [-0.05, 1.0, 0.12, 0.5], [0.15, 0.45, 0.5, 0.3], [-0.35, 0.38, -0.6, 0.28]];
    const draw = (scale: number, c: string): void => {
      g.fillStyle = c;
      for (const [dx, hh0, lean0, ww0] of set) {
        const x = bx + dx * w * scale;
        const hh = hh0 * h * scale;
        const ww = ww0 * w * scale;
        const lean = lean0 * w;
        g.beginPath();
        g.moveTo(x - ww, by);
        g.bezierCurveTo(x - ww * 1.2, by - hh * 0.45, x + lean - ww * 0.4, by - hh * 0.72, x + lean, by - hh);
        g.bezierCurveTo(x + lean + ww * 0.15, by - hh * 0.62, x + ww * 1.2, by - hh * 0.4, x + ww, by);
        g.closePath();
        g.fill();
      }
    };
    g.save();
    g.shadowColor = 'rgba(255, 95, 210, 0.85)';
    g.shadowBlur = 14;
    draw(1, '#c2318f');
    g.restore();
    draw(0.74, '#ff5fd2');
    draw(0.42, '#ffd6f4');
    g.fillStyle = '#ff9fe6'; // embers
    for (let i = 0; i < 5; i++) g.fillRect(Math.round(bx + (hash(i, 1, 931) - 0.5) * w * 2.4), Math.round(by - h * (1.05 + 0.6 * hash(i, 2, 931))), F, F);
  };
  /** A brazier on three iron legs, burning the cult's pink. */
  const brazier = (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
    glow(g, sx, sy, 46, 18, 0.26);
    glow(g, sx, sy - 40, 40, 40, 0.16);
    g.fillStyle = 'rgba(25, 18, 40, 0.3)';
    g.beginPath();
    g.ellipse(sx + 4, sy + 1, 14, 5, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#2c2530';
    g.lineWidth = 2 * F;
    g.beginPath();
    g.moveTo(sx - 10, sy);
    g.lineTo(sx - 4, sy - 22);
    g.moveTo(sx + 10, sy + 2);
    g.lineTo(sx + 4, sy - 22);
    g.moveTo(sx + 1, sy - 4);
    g.lineTo(sx, sy - 22);
    g.stroke();
    blob(g, sx, sy - 26, 13, 6, '#3d3542');
    blob(g, sx, sy - 28, 12, 4, '#6b6274');
    blob(g, sx, sy - 28, 10, 3, '#2a1824');
    tongues(g, sx, sy - 28, 30, 9);
  };
  /**
   * The altar before the door, where a word is given: a block of the quarry's stone, the cult's; on its top
   * three hollows the shape of a rune stone, empty, in the game's own look for a place that will take a
   * word (the dark of a slot, its rim in the accent at rest); a groove from each to the door's foot.
   */
  const ALTAR = box(1.3, 0.64, 24, hex('#bdb4bf'), hex('#9a90a0'), hex('#625a6c'));
  const altar = (g: CanvasRenderingContext2D, sx: number, sy: number): void => {
    // the grooves cut in the flagstones, from the altar to the door
    for (const du of [-0.3, 0, 0.3]) {
      line(g, PP(du - 0.1, 1.15, 0), PP(du * 0.4, 0.02, 0), '#5c5565', 2 * F);
      line(g, PP(du - 0.1, 1.15, 0), PP(du * 0.4, 0.02, 0), '#3f3948', F);
    }
    g.fillStyle = 'rgba(25, 18, 40, 0.3)';
    g.beginPath();
    g.ellipse(sx + 10, sy + 2, 30, 9, 0, 0, Math.PI * 2);
    g.fill();
    ALTAR(g, sx, sy);
    // its top's lip, and the three hollows in it
    const T = (u: number, v: number): [number, number] => [sx + (u - v) * HWf, sy + (u + v) * HHf - 24];
    for (const du of [-0.38, 0, 0.38]) {
      const quad = (a: number, b: number, c: number, d: number, col: string): void => poly(g, [T(du - a, -c), T(du + b, -c), T(du + b, d), T(du - a, d)], col);
      quad(0.15, 0.15, 0.2, 0.2, '#22a8c0');
      quad(0.12, 0.12, 0.17, 0.17, '#0e0c24');
      quad(0.12, -0.08, 0.17, 0.17, '#1a1838'); // its far wall, seen
      const [cx, cy] = T(du, 0);
      glow2(g, cx, cy, 14, 'rgba(34, 168, 192, 0.2)');
    }
  };
  const guardA = [HXD - 1.9, HY0 + 1.7] as [number, number];
  const guardB = [HXD + 3.1, HY0 + 2.3] as [number, number];
  const ringAt = (g: CanvasRenderingContext2D, x: number, y: number, words: ('fire' | 'heavy')[]): void => {
    g.save();
    g.scale(F, F);
    drawPackMark(g, (wx, wy) => {
      const [sx, sy] = toScreen(wx, wy);
      return [sx / F, sy / F];
    }, x, y, 0.34, { rarity: 'leader', words }, 0.8);
    g.restore();
  };
  const props: Prop[] = [
    // the redoubt itself, drawn from behind everything that stands in front of it
    { x: HXD - 3.2, y: HY0 - 0.2, draw: (g) => facade(g) },
    { x: HXD - 2.55, y: HY0 + 0.05, draw: (g) => tower(g, -2.55) },
    { x: HXD + 2.55, y: HY0 + 0.05, draw: (g) => tower(g, 2.55) },
    { x: HXD - 0.1, y: HY0 + 1.45, draw: altar },
    { x: HXD - 1.12, y: HY0 + 0.35, draw: brazier },
    { x: HXD + 1.12, y: HY0 + 0.35, draw: brazier },
    // the guards: rare, each with a yellow pack leader's ring at its feet
    { x: guardA[0] - 0.02, y: guardA[1] - 0.02, draw: (g) => ringAt(g, guardA[0], guardA[1], ['fire']) },
    { x: guardB[0] - 0.02, y: guardB[1] - 0.02, draw: (g) => ringAt(g, guardB[0], guardB[1], ['heavy']) },
    { x: guardA[0], y: guardA[1], draw: sprite(miniFm.front.idle[0]) },
    { x: guardB[0], y: guardB[1], draw: sprite(cultist.front.idle[0]) },
    // the quarry's own things on the floor
    { x: at(300, 300)[0], y: at(300, 300)[1], draw: STONE_BLOCK },
    { x: at(300, 300)[0], y: at(300, 300)[1], draw: (g, sx, sy) => STONE_BLOCK(g, sx, sy - 22) },
    { x: at(332, 314)[0], y: at(332, 314)[1], draw: STONE_BLOCK },
    { x: at(870, 330)[0], y: at(870, 330)[1], draw: qCart },
    { x: at(640, 372)[0], y: at(640, 372)[1], draw: greyRock(0.2) },
    { x: at(654, 380)[0], y: at(654, 380)[1], draw: greyRock(0.13) },
    { x: at(205, 392)[0], y: at(205, 392)[1], draw: greyRock(0.24) },
  ];
  for (const pr of props.slice(10)) if (!HW_(pr.x, pr.y)) console.warn('hold prop off the floor', toScreen(pr.x, pr.y));
  // the tops, dressed as the Quarry's: pines, rocks, tufts, a stacked block; never over the floor, nor over the redoubt
  const hClear = (px: number, py: number, hw: number, h: number): boolean => {
    if (px > 510 - hw && px < 830 + hw && py < 320) return false;
    for (let yy = py + 4; yy >= py - h; yy -= 3) {
      for (let xx = px - hw; xx <= px + hw; xx += 3) {
        if (xx < 0 || yy < 0 || xx >= PW || yy >= PH) continue;
        if (hKind(xx, yy) === SK.Floor) return false;
      }
    }
    return hKind(px, py) === SK.Top && hKind(px - 8, py + 2) === SK.Top && hKind(px + 8, py + 2) === SK.Top;
  };
  const onHoldTop = (px: number, py: number, draw: Prop['draw']): Prop => {
    const [x, y] = toWorld(px, py + HOLD_H);
    return { x, y, draw: (g, sx, sy) => draw(g, sx, sy - HOLD_H) };
  };
  let n = 0;
  for (let gy = 6; gy < PH + 20; gy += 20) {
    for (let gx = 6; gx < PW; gx += 26) {
      n++;
      const px = Math.round(gx + (hash(gx, gy, 921) - 0.5) * 20);
      const py = Math.round(gy + (hash(gx, gy, 922) - 0.5) * 14);
      const roll = hash(gx, gy, 923);
      const [wx0, wy0] = toWorld(px, py + HOLD_H);
      const grove = fbm(wx0 * 0.35, wy0 * 0.35, 924);
      let draw: Prop['draw'] | null = null;
      let hw = 12;
      let h = 16;
      if (grove > 0.6 && roll < 0.5) {
        draw = pine(0.4 + 0.5 * hash(gx, gy, 925), n);
        hw = 22;
        h = 64;
      } else if (roll < 0.12) draw = greyRock(0.16 + 0.18 * hash(gx, gy, 926));
      else if (roll < 0.2) draw = tuft(n);
      else if (roll < 0.21) {
        draw = STONE_BLOCK;
        hw = 30;
        h = 30;
      }
      if (!draw || !hClear(px, py, hw, h)) continue;
      props.push(onHoldTop(px, py, draw));
    }
  }
  holdShot.props = props;
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = PH;
  const hg = cvs.getContext('2d') as CanvasRenderingContext2D;
  hg.imageSmoothingEnabled = false;
  paintLevel(hg, 0, holdShot, { shadow: 1.3 });
  // the guards' life and names over them, as the game writes a yellow pack's leader's: in yellow
  hg.save();
  hg.scale(F, F);
  for (const [[gx, gy], name, top] of [[guardA, 'Flame Mini Fleshmancer', 30], [guardB, 'Heavy Dagger Cultist', 28]] as [[number, number], string, number][]) {
    const [sx0, sy0] = toScreen(gx, gy);
    const sx = Math.round(sx0 / F);
    const sy = Math.round(sy0 / F) - top - 5;
    const w = 24;
    hg.fillStyle = P.ink;
    hg.fillRect(sx - w / 2 - 1, sy - 1, w + 2, 4);
    hg.fillStyle = P.bl1;
    hg.fillRect(sx - w / 2, sy, w, 2);
    hg.fillStyle = P.fr4;
    hg.fillRect(sx - w / 2, sy, w, 2);
    drawText(hg, name, sx, sy - 8, RARITY_COLOR[2], { align: 'center', font: 'small', shadow: P.ink });
  }
  hg.restore();
  placeHud(hg, 'The Quarry', HW_, holdShot.hero);
  showAlone(cvs);
}

if (PINE_SHOT) {
  const onPine = (px: number, py: number, draw: Prop['draw'], extra: Partial<Prop> = {}): Prop => {
    const [x, y] = at(px, py);
    return { x, y, draw, ...extra };
  };
  const props: Prop[] = [];
  // the trees: thick along the far edge, in groves out in the open; darker and twisted toward the swamp
  for (let gy = -60; gy < PH + 60; gy += 22) {
    for (let gx = -40; gx < PW + 40; gx += 26) {
      const px = gx + (hash(gx, gy, 741) - 0.5) * 22;
      const py = gy + (hash(gx, gy, 742) - 0.5) * 16;
      const [x, y] = at(px, py);
      if (inPineRiver(x, y)) continue;
      let clear = true;
      for (const [dx, dy] of [[0, 0], [0.35, 0], [-0.35, 0], [0, 0.35], [0, -0.35]]) if (PW_GROUND(x + dx, y + dy) || inPineRiver(x + dx, y + dy)) clear = false;
      if (!clear || hash(gx, gy, 743) > 0.8) continue;
      const east = Math.max(0, Math.min(1, (px - 640) / 360));
      const size = hash(gx, gy, 744);
      const k = gx * 31 + gy;
      const draw = hash(gx, gy, 745) < east * 0.85 ? (hash(gx, gy, 746) > 0.8 ? deadTree(k) : twistedPine(size, k)) : pine(size, k);
      props.push(onPine(px, py, draw, { seeFor: 110 }));
    }
  }
  props.push(
    onPine(170, 250, cabin),
    onPine(560, 318, fallenLog),
    onPine(470, 300, fern(1)),
    onPine(300, 200, fern(2)),
    onPine(820, 260, fern(3)),
    onPine(120, 300, fern(4)),
    onPine(585, 300, mushrooms),
    onPine(260, 300, boulder(0.26, '#a7a7a0', '#868780', '#5c5f5a')),
    onPine(760, 300, boulder(0.3, '#a7a7a0', '#868780', '#5c5f5a')),
    // the cult's siege camp, glimpsed through the trees
    onPine(700, 42, cultTent),
    onPine(650, 56, campfire),
    onPine(748, 64, banner),
  );
  pineShot.props = props;
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = PH;
  const pg = cvs.getContext('2d') as CanvasRenderingContext2D;
  pg.imageSmoothingEnabled = false;
  // a patrol out of the camp
  paintLevel(pg, 0, pineShot, { foes: [at(770, 132), at(812, 122)] as [number, number][] });
  placeHud(pg, 'The Pinewood', PW_GROUND, pineShot.hero);
  showAlone(cvs);
}

if (FEN_SHOT) {
  FEN_VISTA = paintFenVista();
  const onFen = (px: number, py: number, draw: Prop['draw'], extra: Partial<Prop> = {}): Prop => {
    const [x, y] = at(px, py);
    if (!FW_GROUND(x, y)) console.warn('fen prop off the ground', px, py);
    return { x, y, draw, ...extra };
  };
  fenShot.props = [
    ...fenObelisks.map(([px, py], k) => onFen(px, py, fenObelisk(k), { seeFor: 110 })),
    onFen(700, 214, box(0.4, 0.4, 34, hex('#9b96a4'), hex('#878192'), hex('#5f5a6a'))),
    onFen(806, 318, box(0.4, 0.4, 22, hex('#9b96a4'), hex('#878192'), hex('#5f5a6a'))),
    onFen(842, 296, box(0.45, 0.45, 12, hex('#878192'), hex('#736d7e'), hex('#5f5a6a'))),
    onFen(236, 372, deadTree(1)),
    onFen(960, 392, deadTree(2)),
    { ...((): { x: number; y: number } => { const [x, y] = at(560, 330); return { x, y }; })(), draw: fenArm(0) },
    { ...((): { x: number; y: number } => { const [x, y] = at(905, 196); return { x, y }; })(), draw: fenArm(1) },
    onFen(596, 158, deadTree(3)),
    onFen(300, 392, reeds(1)),
    onFen(214, 396, reeds(2)),
    onFen(470, 222, reeds(3)),
    onFen(910, 410, reeds(4)),
    onFen(574, 166, reeds(5)),
  ];
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = PH;
  const fg = cvs.getContext('2d') as CanvasRenderingContext2D;
  fg.imageSmoothingEnabled = false;
  // the cultists, chanting at the obelisks
  const chant: [number, number][] = [at(646, 262), at(830, 264), at(712, 330)] as [number, number][];
  paintLevel(fg, 0, fenShot, { foes: chant });
  placeHud(fg, 'The Sunken Fen', FW_GROUND, fenShot.hero);
  showAlone(cvs);
}

if (LEDGE) {
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = PH;
  const lg = cvs.getContext('2d') as CanvasRenderingContext2D;
  lg.imageSmoothingEnabled = false;
  if (REVEAL) VISTA = paintVista();
  paintLedge(lg);
  // vultures, circling out over the drop
  vulture(26 * F, 0.3, 1)(lg, REVEAL ? 520 : 300, REVEAL ? 112 : 120);
  vulture(18 * F, -0.5, 2)(lg, 600, 96);
  vulture(12 * F, 0.2, 3)(lg, 860, 150);
  // what stands, from the back
  const hero = at(507, 244) as [number, number];
  const knight = spriteOf3(MOVES3.rear, 0, 'front');
  const figure = (sp: { img: HTMLCanvasElement; ax: number; ay: number; density?: number }) => (gg: CanvasRenderingContext2D, sx: number, sy: number): void => {
    gg.fillStyle = 'rgba(25, 18, 40, 0.35)';
    gg.beginPath();
    gg.ellipse(sx, sy, 8.5 * F, 3.8 * F, 0, 0, Math.PI * 2);
    gg.fill();
    const dens = sp.density ?? 1;
    gg.drawImage(sp.img, sx - sp.ax * F, sy - sp.ay * F, (sp.img.width / dens) * F, (sp.img.height / dens) * F);
  };
  const stands: Prop[] = [
    ...ledgeProps(),
    { x: hero[0], y: hero[1], draw: figure(knight) },
    { ...pt(670, 236), draw: figure(cultist.front.idle[0]) },
    { ...pt(728, 226), draw: figure(cultist.front.idle[0]) },
  ];
  stands.sort((p1, p2) => p1.x + p1.y - (p2.x + p2.y));
  // the rope between the rail's stakes, sagging; drawn first, as it is behind everything on the road
  lg.strokeStyle = '#cdb88f';
  lg.lineWidth = F;
  lg.beginPath();
  for (let px = 380; px < 560; px += 45) {
    const y0 = Math.round(ledgeFar(px)) + 7 - 12 * F;
    const y1 = Math.round(ledgeFar(px + 45)) + 7 - 12 * F;
    lg.moveTo(px, y0);
    lg.quadraticCurveTo(px + 22, (y0 + y1) / 2 + 7, px + 45, y1);
  }
  lg.stroke();
  for (const st of stands) {
    const [sx, sy] = toScreen(st.x, st.y);
    st.draw(lg, sx, sy);
  }
  placeHud(lg, 'The Ledge Road', LW, hero);
  showAlone(cvs);
}

if (SHOT) {
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = PH;
  cvs.style.position = 'static';
  cvs.style.display = 'block';
  const sg = cvs.getContext('2d') as CanvasRenderingContext2D;
  sg.imageSmoothingEnabled = false;
  paintLevel(sg, 0, shotLevel, { shadow: 1.5, foes: shotFoes });
  // a soft vignette, as the game lays one
  const vg = sg.createRadialGradient(PW / 2, PH / 2, PH * 0.45, PW / 2, PH / 2, PW * 0.62);
  vg.addColorStop(0, 'rgba(30,14,10,0)');
  vg.addColorStop(1, 'rgba(30,14,10,0.32)');
  sg.fillStyle = vg;
  sg.fillRect(0, 0, PW, PH);
  // the HUD's two things that must be this place's own: its name, and its map
  sg.save();
  sg.scale(2, 2);
  drawText(sg, 'Echo Canyon', 4, 3, THEME.text, { shadow: P.ink });
  sg.restore();
  const [mx, my, mw, mh] = [437 * 2 + 3, 4 * 2 + 3, 66 * 2 - 6, 46 * 2 - 6];
  sg.fillStyle = '#100e22';
  sg.fillRect(mx, my, mw, mh);
  const [hx0, hy0] = shotLevel.hero;
  const k = 0.11;
  for (let yy = 0; yy < mh; yy += 2) {
    for (let xx = 0; xx < mw; xx += 2) {
      const a = (xx - mw / 2) / (HWf * k);
      const b = (yy - mh / 2) / (HHf * k);
      const wxx = hx0 + (a + b) / 2;
      const wyy = hy0 + (b - a) / 2;
      if (shotGround.walk(wxx, wyy)) {
        sg.fillStyle = '#5b55c7';
        sg.fillRect(mx + xx, my + yy, 2, 2);
      }
    }
  }
  sg.fillStyle = '#28dcf0';
  sg.fillRect(mx + mw / 2 - 2, my + mh / 2 - 2, 4, 4);
  for (const el of [document.documentElement, document.body]) {
    el.style.height = 'auto';
    el.style.overflow = 'visible';
  }
  document.body.style.margin = '0';
  document.body.style.width = `${PW}px`;
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
  throw new Error('shot painted'); // the rest of the page is the other sheets
}
const HEAD = 70;
const TITLE = 96;
const FW = PW;
const FH = TITLE / Z + LEVELS.length * (HEAD / Z + PH);
const cv = document.createElement('canvas');
cv.width = FW;
cv.height = FH;
const fine = cv.getContext('2d') as CanvasRenderingContext2D;
fine.fillStyle = '#14122a';
fine.fillRect(0, 0, FW, FH);
const tops: number[] = [];
LEVELS.forEach(({ L, way }, k) => {
  const top = TITLE / Z + k * (HEAD / Z + PH) + HEAD / Z;
  tops.push(top);
  paintLevel(fine, top, L, way);
});

const out = document.createElement('canvas');
out.width = FW * Z;
out.height = FH * Z;
out.style.position = 'static';
out.style.display = 'block';
const g = out.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.drawImage(cv, 0, 0, FW * Z, FH * Z);
g.fillStyle = '#e9ecff';
g.font = '600 40px system-ui, sans-serif';
g.fillText(BOTH ? 'Echo Canyon: walls on both sides' : SEE ? 'Walls you can see through' : 'Act 1: the other levels', 28, 62);
LEVELS.forEach(({ L }, k) => {
  const y = (tops[k] - HEAD / Z) * Z;
  g.fillStyle = '#e9ecff';
  g.font = '600 30px system-ui, sans-serif';
  g.fillText(L.title, 28, y + 34);
  g.fillStyle = '#a3abd8';
  g.font = '400 22px system-ui, sans-serif';
  g.fillText(L.note, 28, y + 62);
});
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.style.background = '#14122a';
document.body.style.width = `${out.width}px`;
document.body.appendChild(out);
(window as unknown as { __ready: boolean }).__ready = true;
