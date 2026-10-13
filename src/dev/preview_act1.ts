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
import { spriteOf3 } from '../art/heroes3';
import { hash } from '../art/kit';
import { MOVES3 } from '../art/moves3';
import { makeDaggerCultistArt3, makeMiniFleshmancerArt3 } from '../art/cultists';
import { drawText } from '../engine/font';
import { P } from '../art/palette';
import { THEME } from '../ui/ui';

type RGB = [number, number, number];
const F = 2; // picture pixels per game pixel
const Z = 2; // screen pixels per picture pixel
/** "shot": one picture the size of the game's own screen on a phone held sideways (507 by 234 game pixels), to lay under the game's real HUD. */
const SHOT = decodeURIComponent(location.hash.slice(1)) === 'shot';
const PW = SHOT ? 1014 : 320 * F;
const PH = SHOT ? 468 : 220 * F;
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
  for (let py = 0; py < PH; py++) {
    for (let px = 0; px < PW; px++) {
      const k0 = kind[py * PW + px];
      if (k0 === K.Floor) {
        const below = kindAt(px, py + 1);
        const below2 = kindAt(px, py + 2);
        if (L.lip && below !== K.Floor && below !== 0) put(px, py, L.lip);
        else if (L.lip && below2 !== K.Floor && below2 !== 0) put(px, py, mix(L.lip, [d[(py * PW + px) * 4], d[(py * PW + px) * 4 + 1], d[(py * PW + px) * 4 + 2]], 0.5));
        for (let k2 = 1; k2 <= 7; k2++) {
          if (kindAt(px, py - k2) === K.Face) {
            darken(px, py, k2 < 4 ? 0.38 : 0.22);
            break;
          }
        }
      } else if (k0 === K.Top && kindAt(px, py + 1) === K.Face) put(px, py, mix(L.outside(...toWorld(px, py + H), px, py), [255, 250, 240], 0.35));
      else if (k0 === K.Cut) {
        // the near wall, cut away: its cut face a band of dark rock under the ground's edge, as the game's walls toward the eye are left out
        for (let k2 = 1; k2 <= 8; k2++) {
          if (kindAt(px, py - k2) === K.Floor) {
            put(px, py, k2 <= 1 ? [24, 18, 34] : k2 >= 7 ? mix(L.outside(...toWorld(px, py + H), px, py), [30, 22, 40], 0.5) : [44, 36, 56]);
            break;
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
