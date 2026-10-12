// Dev page: THE LEDGE ROAD (level 6 to 10's cliff path) AT THREE GRAINS, for the owner to choose
// how its edges are made. The same winding ledge, open sky beyond the drop, the mountain's face
// rising behind, the knight standing on it for scale:
//   1. today's tiles (32 by 16 game pixels), with the corner-cut halves the game already has;
//   2. quartered tiles (16 by 8), with their halves;
//   3. today's tiles, the edge painted rounded and ragged over them (the game still walks by the
//      tiles of 1; the painted edge strays from them by a few game pixels at most).
// A mock-up only: nothing of the game imports it.
//   node tools/preview.mjs src/dev/preview_cliff.ts previews/cliff_three_ways.png 1280 2900
import { spriteOf3 } from '../art/heroes3';
import { hash } from '../art/kit';
import { MOVES3 } from '../art/moves3';

const F = 2; // picture pixels per game pixel (the grain the game's new art is painted at)
const Z = 2; // screen pixels per picture pixel
const GW = 320;
const GH = 220;
const PW = GW * F;
const PH = GH * F;
const HWf = 16 * F;
const HHf = 8 * F;
const OX = 0;
const OY = 64;

const toWorld = (px: number, py: number): [number, number] => {
  const a = (px - OX) / HWf;
  const b = (py - OY) / HHf;
  return [(a + b) / 2, (b - a) / 2];
};
const toScreen = (x: number, y: number): [number, number] => [OX + (x - y) * HWf, OY + (x + y) * HHf];

// ---------------------------------------------------------------------------------------------
// Noise

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

// ---------------------------------------------------------------------------------------------
// The ledge, in world units (tiles): a band along x between the mountain (low y) and the drop (high y)

const yc = (x: number): number => 0.9 * Math.sin(0.32 * x + 0.4) + 0.55 * Math.sin(0.85 * x + 2.1);
const bump = (x: number, at: number, wide: number): number => Math.exp(-(((x - at) / wide) ** 2));
const back = (x: number): number => yc(x) - 1.85 - 0.35 * Math.sin(1.3 * x + 0.7) + 0.6 * bump(x, 13.5, 1.4);
const front = (x: number): number => yc(x) + 1.65 + 0.45 * Math.sin(0.6 * x + 1.0) + 1.5 * bump(x, 6.2, 1.25) - 0.75 * bump(x, 13.5, 1.4);
const inBand = (x: number, y: number): boolean => y > back(x) && y < front(x);
const backSide = (x: number, y: number): boolean => y < yc(x);

// ---------------------------------------------------------------------------------------------
// Tiles: each tile whole, empty, or one of the four halves a tile is cut into corner to corner

const enum Cut { None, Full, Left, Right, Top, Bottom }
const inCut = (c: Cut, u: number, v: number): boolean => {
  switch (c) {
    case Cut.Full: return true;
    case Cut.Left: return v > u; // the half to the left on the screen (corner to corner, top to bottom)
    case Cut.Right: return u > v;
    case Cut.Top: return u + v < 1; // the half above (corner to corner, left to right)
    case Cut.Bottom: return u + v > 1;
    default: return false;
  }
};
function tileMap(s: number): (x: number, y: number) => boolean {
  const cache = new Map<string, Cut>();
  const N = 8;
  const cutOf = (i: number, j: number): Cut => {
    const key = `${i},${j}`;
    const had = cache.get(key);
    if (had !== undefined) return had;
    // the shape (empty, whole, or one of the four halves) that gets the most of the tile right
    const options = [Cut.None, Cut.Full, Cut.Left, Cut.Right, Cut.Top, Cut.Bottom];
    const wrong = options.map(() => 0);
    for (let a = 0; a < N; a++) {
      for (let b = 0; b < N; b++) {
        const u = (a + 0.5) / N;
        const v = (b + 0.5) / N;
        const hit = inBand((i + u) * s, (j + v) * s);
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
  return (x: number, y: number): boolean => {
    const i = Math.floor(x / s);
    const j = Math.floor(y / s);
    return inCut(cutOf(i, j), x / s - i, y / s - j);
  };
}

// ---------------------------------------------------------------------------------------------
// Colours

const hex = (h: string): [number, number, number] => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const PATH = ['#4f4552', '#62576a', '#77697b', '#8c7e8d', '#a395a1'].map(hex);
const GRASS = ['#4f6b3e', '#66854a', '#7fa05a', '#9cbb6c'].map(hex);
const PEBBLE = ['#5a5060', '#9b8f9c', '#c3b8c2'].map(hex);
const LIP = hex('#d9cfd6');
// rock: lit faces (toward the lower left), flat ones (straight at the eye), dark ones (lower right)
const ROCK = [
  ['#e2d4c8', '#c7b6aa', '#ab9b95', '#7f7080'],
  ['#ab9da5', '#928592', '#7b6f80', '#5a5067'],
  ['#736a85', '#5e5672', '#4b4460', '#36304a'],
].map((r) => r.map(hex));
const SKY_TOP = hex('#3f86e0');
const SKY_LOW = hex('#bfe0ff');
const CLOUD = ['#ffffff', '#e6f0fb', '#c9dbf1'].map(hex);
const FAR = ['#9fbfe6', '#88aedd'].map(hex);

const mix = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

function sky(px: number, py: number, panelTop: number): [number, number, number] {
  const t = Math.min(1, Math.max(0, (py - panelTop) / PH));
  // banded, dithered, as pixel art would have it
  const steps = 7;
  const q = Math.floor(t * steps + bayer(px, py) * 0.999);
  let c = mix(SKY_TOP, SKY_LOW, Math.min(1, q / steps));
  // far peaks, low on the left (the valley's other side, far off)
  const ridge = PH * 0.78 - 60 * fbm(px / 90, 0, 41) - 40 * Math.max(0, Math.sin(px / 70));
  if (py > ridge) c = py > ridge + 6 + 30 * vn(px / 40, 1, 43) ? FAR[1] : FAR[0];
  // clouds
  const cl = fbm(px / 70, py / 26, 51) + 0.25 * (vn(px / 16, py / 9, 55) - 0.5);
  if (cl > 0.62) c = cl > 0.7 ? (fbm(px / 70, (py - 6) / 26, 51) > 0.66 ? CLOUD[0] : CLOUD[1]) : CLOUD[2];
  return c;
}

function pathColour(wx: number, wy: number, px: number, py: number): [number, number, number] {
  const n = fbm(wx * 2.4, wy * 2.4, 11);
  let i = Math.floor((n - 0.25) * 9 + bayer(px, py) * 0.6);
  i = Math.max(0, Math.min(PATH.length - 1, i));
  let c = PATH[i];
  const g = fbm(wx * 1.1 + 3, wy * 1.1, 21);
  const edge = Math.min(wy - back(wx), front(wx) - wy);
  if (g > 0.64 || (edge < 0.45 && g > 0.5)) {
    const k = Math.floor(fbm(wx * 6, wy * 6, 25) * 4.5 + bayer(px, py) * 0.5);
    c = GRASS[Math.max(0, Math.min(3, k))];
  }
  // pebbles on a jittered grid
  const cs = 0.42;
  const ci = Math.floor(wx / cs);
  const cj = Math.floor(wy / cs);
  for (let a = -1; a <= 1; a++) {
    for (let b = -1; b <= 1; b++) {
      const i2 = ci + a;
      const j2 = cj + b;
      if (hash(i2, j2, 31) > 0.45) continue;
      const cx = (i2 + hash(i2, j2, 32)) * cs;
      const cy = (j2 + hash(i2, j2, 33)) * cs;
      const r = 0.05 + 0.07 * hash(i2, j2, 34);
      const [sx, sy] = toScreen(cx, cy);
      const dx = (px - sx) / (r * HWf * 1.6);
      const dy = (py - sy) / (r * HHf * 1.6 * 1.3);
      const d = dx * dx + dy * dy;
      if (d < 1) {
        c = dy < -0.35 && dx < 0.3 ? PEBBLE[2] : d > 0.55 && dy > 0 ? PEBBLE[0] : PEBBLE[1];
      }
    }
  }
  return c;
}

function rockColour(shade: number, v: number, px: number, k: number, vUp: boolean): [number, number, number] {
  // shade: +1 lit, 0 flat, -1 dark; v: picture pixels from the edge it hangs from or stands on.
  // The face is layered rock: bands of uneven height, a little wavy, each lit along its top and
  // shadowed along its bottom, broken here and there by a crack, lit on its right-hand side.
  const row = shade > 0.35 ? 0 : shade < -0.35 ? 2 : 1;
  const w = v + 8 * (vn(px / 46, 0, k) - 0.5) + 3 * (vn(px / 11, 1, k + 5) - 0.5);
  const H = 12;
  const j = Math.floor(w / H);
  const thick = 0.55 + 0.45 * hash(j, 7, k); // some layers thinner than others
  const f = (w - j * H) / (H * thick);
  if (f > 1) return ROCK[row][3]; // the gap under a thin layer
  const span = 30 + Math.floor(hash(j, 0, k + 3) * 46);
  const uu = px + hash(j, 1, k + 4) * span;
  const fi = Math.floor(uu / span);
  const fpos = uu - fi * span;
  let i = 1 + (hash(j, fi, k + 2) > 0.55 ? 1 : 0);
  const top = vUp ? f > 0.84 : f < 0.14;
  const bottom = vUp ? f < 0.14 : f > 0.84;
  if (top) i = 0;
  else if (bottom) i = 3;
  const jag = 2.2 * (vn(v / 5, fi, k + 6) - 0.5);
  const fd = fpos - 3 - jag;
  if (hash(j, fi, k + 8) > 0.3) {
    if (fd >= 0 && fd < 1.2) i = 3;
    else if (fd >= 1.2 && fd < 2.4 && !bottom) i = 0;
  }
  const speck = hash(px, Math.floor(v), k + 9);
  if (speck > 0.975) i = Math.min(3, i + 1);
  return ROCK[row][i];
}

// ---------------------------------------------------------------------------------------------
// One panel

type Mask = Uint8Array;

function maskOf(member: (x: number, y: number) => boolean): Mask {
  const m = new Uint8Array(PW * PH);
  for (let py = 0; py < PH; py++) {
    for (let px = 0; px < PW; px++) {
      const [wx, wy] = toWorld(px + 0.5, py + 0.5);
      m[py * PW + px] = member(wx, wy) ? 1 : 0;
    }
  }
  return m;
}

/** Today's tiles with their corners and stair-steps rounded and roughened, as paint over the grid. */
function rounded(m: Mask, R: number): { paint: Mask; smooth: Mask } {
  const tmp = new Float32Array(PW * PH);
  const out = new Float32Array(PW * PH);
  for (let py = 0; py < PH; py++) {
    let acc = 0;
    for (let px = -R; px < PW + R; px++) {
      const add = px + R < PW && px + R >= 0 ? m[py * PW + px + R] : 0;
      const sub = px - R - 1 >= 0 && px - R - 1 < PW ? m[py * PW + px - R - 1] : 0;
      acc += add - sub;
      if (px >= 0 && px < PW) tmp[py * PW + px] = acc / (2 * R + 1);
    }
  }
  const Ry = Math.round(R * 0.7);
  for (let px = 0; px < PW; px++) {
    let acc = 0;
    for (let py = -Ry; py < PH + Ry; py++) {
      const add = py + Ry < PH && py + Ry >= 0 ? tmp[(py + Ry) * PW + px] : 0;
      const sub = py - Ry - 1 >= 0 && py - Ry - 1 < PH ? tmp[(py - Ry - 1) * PW + px] : 0;
      acc += add - sub;
      if (py >= 0 && py < PH) out[py * PW + px] = acc / (2 * Ry + 1);
    }
  }
  // the edge: rounded, then bitten and bulged in places (slow noise), and a little rough (fast noise);
  // which way a face looks is read from the rounded edge alone, so the rock's light does not flicker
  const paint = new Uint8Array(PW * PH);
  const smooth = new Uint8Array(PW * PH);
  for (let py = 0; py < PH; py++) {
    for (let px = 0; px < PW; px++) {
      const f = out[py * PW + px];
      const t = 0.5 + 0.32 * (vn(px / 30, py / 16, 61) - 0.5) + 0.06 * (vn(px / 5, py / 3, 63) - 0.5);
      paint[py * PW + px] = f > t ? 1 : 0;
      smooth[py * PW + px] = f > 0.5 + 0.32 * (vn(px / 30, py / 16, 61) - 0.5) ? 1 : 0;
    }
  }
  return { paint, smooth };
}

/** Which way a bit of edge faces, from the floor round it: +1 to the lower left (lit), -1 to the lower right (dark), 0 straight at the eye. */
function facing(m: Mask, px: number, py: number): number {
  let gx = 0;
  let gy = 0;
  const W = 9;
  for (let dy = -W; dy <= W; dy++) {
    for (let dx = -W; dx <= W; dx++) {
      const x = px + dx;
      const y = py + dy;
      if (x < 0 || y < 0 || x >= PW || y >= PH) continue;
      if (m[y * PW + x]) {
        gx += dx;
        gy += dy;
      }
    }
  }
  if (gy < 0) {
    gx = -gx;
    gy = -gy;
  }
  const len = Math.hypot(gx, gy) || 1;
  return Math.max(-1, Math.min(1, (-gx / len) / 0.447));
}

const WALL_UP = 124;
/** How far a face is lost in the haze at a distance v from its edge: 0 none, 1 gone; in four dithered steps, from `len` - 60 to `len` + 40. */
const haze = (v: number, len: number, px: number, py: number): number => {
  const t = (v - (len - 60)) / 100;
  if (t <= 0) return 0;
  return Math.min(1, Math.floor(t * 4 + bayer(px, py)) / 4);
}; // the mountain's face over the ledge, in picture pixels, before it is lost in haze
const DROP = 150; // the cliff under the ledge, in picture pixels, before it is lost in haze

function paintPanel(g: CanvasRenderingContext2D, top: number, m: Mask, lightBy: Mask = m): void {
  const img = g.createImageData(PW, PH);
  const d = img.data;
  const put = (px: number, py: number, c: [number, number, number]): void => {
    const i = (py * PW + px) * 4;
    d[i] = c[0];
    d[i + 1] = c[1];
    d[i + 2] = c[2];
    d[i + 3] = 255;
  };
  for (let py = 0; py < PH; py++) for (let px = 0; px < PW; px++) put(px, py, sky(px, py + top, top));
  for (let px = 0; px < PW; px++) {
    // the runs of ledge down this column, farthest first
    const runs: [number, number][] = [];
    let s = -1;
    for (let py = 0; py <= PH; py++) {
      const on = py < PH && m[py * PW + px] === 1;
      if (on && s < 0) s = py;
      if (!on && s >= 0) {
        runs.push([s, py]);
        s = -1;
      }
    }
    for (const [a, b] of runs) {
      const above = toWorld(px + 0.5, a - 1.5);
      const below = toWorld(px + 0.5, b + 1.5);
      const wall = a > 0 && backSide(above[0], above[1]);
      const drop = b < PH && !backSide(below[0], below[1]);
      if (wall) {
        const shade = facing(lightBy, px, a);
        for (let v = 1; v <= WALL_UP + 60; v++) {
          const py = a - v;
          if (py < 0) break;
          const q = haze(v, WALL_UP, px, py);
          if (q >= 1) continue;
          let c = rockColour(shade, v, px, 71, true);
          if (q > 0) c = mix(c, sky(px, py + top, top), q);
          put(px, py, c);
        }
      }
      for (let py = a; py < b; py++) {
        const [wx, wy] = toWorld(px + 0.5, py + 0.5);
        let c = pathColour(wx, wy, px, py);
        if (wall && py - a < 7) c = mix(c, [40, 34, 56], py - a < 3 ? 0.45 : 0.28); // the face's shadow at its foot
        if (drop && b - py <= 2) c = LIP; // the edge catches the light
        put(px, py, c);
      }
      if (drop) {
        const shade = facing(lightBy, px, b - 1);
        for (let v = 0; v < DROP + 40; v++) {
          const py = b + v;
          if (py >= PH || m[py * PW + px]) break;
          const q = haze(v, DROP, px, py);
          if (q >= 1) continue;
          let c = rockColour(shade, v, px, 81, false);
          if (v < 3) c = ROCK[2][3]; // the shadow under the lip
          if (q > 0) c = mix(c, sky(px, py + top, top), q);
          put(px, py, c);
        }
      }
    }
  }
  g.putImageData(img, 0, top);
}

// ---------------------------------------------------------------------------------------------
// The page

const HEAD = 70;
const TITLE = 96;
const cv = document.createElement('canvas');
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.style.background = '#14122a';
cv.style.position = 'static';
cv.style.display = 'block';
const FW = PW;
const FH = TITLE / Z + 3 * (HEAD / Z + PH);
cv.width = FW;
cv.height = FH;
const fine = cv.getContext('2d') as CanvasRenderingContext2D;
fine.fillStyle = '#14122a';
fine.fillRect(0, 0, FW, FH);

const today = tileMap(1);
const quarter = tileMap(0.5);
const mToday = maskOf(today);
const mQuarter = maskOf(quarter);
const mRound = rounded(mToday, 18);

const panels: { mask: Mask; light?: Mask; title: string; note: string; tile: number }[] = [
  { mask: mToday, title: '1. Today\'s tiles', note: '32 x 16, with the halves the game can already cut', tile: 1 },
  { mask: mQuarter, title: '2. Quartered tiles', note: '16 x 8, with halves: four times as many tiles', tile: 0.5 },
  { mask: mRound.paint, light: mRound.smooth, title: '3. Today\'s tiles, the edge painted round', note: 'walks by the tiles of 1; only the paint is rounded', tile: 1 },
];

const knight = spriteOf3(MOVES3.rear, 0, 'front');
const tops: number[] = [];
panels.forEach((p, k) => {
  const top = TITLE / Z + k * (HEAD / Z + PH) + HEAD / Z;
  tops.push(top);
  paintPanel(fine, top, p.mask, p.light);
  // the knight, on the ledge, with the soft shadow the game lays under a figure
  const [hx, hy] = toScreen(9.4, yc(9.4) + 0.2);
  fine.fillStyle = 'rgba(30, 22, 48, 0.35)';
  fine.beginPath();
  fine.ellipse(hx, top + hy, 9 * F, 4 * F, 0, 0, Math.PI * 2);
  fine.fill();
  const dens = knight.density ?? 1;
  fine.imageSmoothingEnabled = false;
  fine.drawImage(knight.img, hx - knight.ax * F, top + hy - knight.ay * F, (knight.img.width / dens) * F, (knight.img.height / dens) * F);
});

// scale up for the eye and write the words
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
g.fillText('The Ledge Road, three ways', 28, 62);
panels.forEach((p, k) => {
  const y = (tops[k] - HEAD / Z) * Z;
  g.fillStyle = '#e9ecff';
  g.font = '600 30px system-ui, sans-serif';
  g.fillText(p.title, 28, y + 34);
  g.fillStyle = '#a3abd8';
  g.font = '400 22px system-ui, sans-serif';
  g.fillText(p.note, 28, y + 62);
  // one tile, drawn at its size, beside the words
  const w = 32 * F * Z * p.tile;
  const h = 16 * F * Z * p.tile;
  const cx = FW * Z - 40 - w / 2;
  const cy = y + 36;
  g.strokeStyle = '#28dcf0';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(cx, cy - h / 2);
  g.lineTo(cx + w / 2, cy);
  g.lineTo(cx, cy + h / 2);
  g.lineTo(cx - w / 2, cy);
  g.closePath();
  g.stroke();
  g.fillStyle = '#a3abd8';
  g.font = '400 20px system-ui, sans-serif';
  g.textAlign = 'right';
  g.fillText('one tile', cx - w / 2 - 10, cy + 7);
  g.textAlign = 'left';
});
document.body.style.width = `${out.width}px`;
document.body.appendChild(out);
(window as unknown as { __ready: boolean }).__ready = true;
