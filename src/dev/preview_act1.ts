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
import { spriteOf3 } from '../art/heroes3';
import { hash } from '../art/kit';
import { MOVES3 } from '../art/moves3';
import { makeDaggerCultistArt3 } from '../art/cultists';

type RGB = [number, number, number];
const F = 2; // picture pixels per game pixel
const Z = 2; // screen pixels per picture pixel
const PW = 320 * F;
const PH = 220 * F;
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
    const ch = Math.abs(y - cYc(x) - 0.3 * Math.sin(x * 0.9));
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

const SEE = decodeURIComponent(location.hash.slice(1)) === 'see';
const canyonFoe: [number, number] = [14.8, cYc(14.8) + 1.0];
const quarryFoe = at(300, 372) as [number, number];
const LEVELS: { L: Level; way?: Way }[] = SEE
  ? [
    { L: { ...canyon, title: 'Echo Canyon, as the game does it today', note: 'the near wall left out: everything on the ground in view' }, way: { foes: [canyonFoe] } },
    { L: { ...canyon, title: 'Echo Canyon, the near wall drawn', note: 'see-through round the knight and the cultist, like the tent' }, way: { full: true, foes: [canyonFoe] } },
    { L: { ...quarry, title: 'The Quarry, the near walls drawn', note: 'the same: see-through round whoever is behind a wall' }, way: { full: true, foes: [quarryFoe] } },
  ]
  : [quarry, canyon, pinewood, fen].map((L) => ({ L }));
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
g.fillText(SEE ? 'Walls you can see through' : 'Act 1: the other levels', 28, 62);
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
