// THE START SCREEN MADE NEW: THE RING ON THE HILL (the art chat, 21 Oct 2026). A MOCK-UP BEHIND A SWITCH
// THAT IS OFF: TITLE_RING.on. With it off the start screen is as it has been (the picture behind TITLE_SMITH3).
//
// The owner to the art chat, 21 Oct 2026, 17:26 Pacific: “I’d like to scrap the title screen and start
// again.  I like the moving picture style, but I don’t like the current art.  Can you give me 10 low res
// options to choose from?  Doesn’t have to have a wordsmith in the picture, but I could, go in any
// direction with it.  They don’t need to be animated before I see them.” Shown the ten
// (src/dev/title_options.ts), asked which to paint full size and bring to life, by 17:50: “9”, THE RING
// ON THE HILL.
//
// THE PICTURE: night, a hill, and on its crown the wordsmith's ring of standing stones, a rune burning in
// each; off his slab in the middle a column of light goes up into the sky and breaks there into an
// aurora of the same light, letters drifting in it; the river of stars over it all. The wordsmith stands
// in the ring before the column, his staff in his hand, the light behind him. Far hills and mountains,
// mist in the valleys, a path of flags up the hill to the gap in the ring's front.
//
// THE WHOLE SCREEN, ON EVERY SCREEN (as the picture behind TITLE_SMITH3): painted once at RING_W x RING_H, bigger than
// any screen the game is laid out on; the screen shows the part that fits, its middle column the
// screen's, and the row RING_LIP (just under the ring's front stones) RING_LIFT above the bottom of the
// screen, where the buttons are. Above, the sky goes on; below, the hill.
//
// The light: the column, white at its heart. Everything near it is lit from it, cut into flat bands;
// what faces away from it is in the night's blue. What glows is his, so it is cyan.

import { hash2 } from '../engine/rng';

/** THE SWITCH: the start screen shows this picture only while it is on. Off until he has seen it move and said yes. */
export const TITLE_RING = { on: false };

/** The picture's size, in game pixels. */
export const RING_W = 640;
export const RING_H = 360;
const W = RING_W;
const H = RING_H;
const CX = 320;
/** The row put RING_LIFT above the bottom of the screen: just under the feet of the ring's front stones. */
export const RING_LIP = 312;
export const RING_LIFT = 30;
/** The row under which the name of the game is not put (the top of the column's brightest part). */
export const RING_HEAD = 150;

// ---------------------------------------------------------------------------------------------
// A small kit for painting at this size: colours as 0xRRGGBB numbers, no soft gradients (flat bands,
// and a 4 x 4 ordered dither where two bands meet).

type C = number;
type Pt = readonly [number, number];
const h = (s: string): C => parseInt(s.slice(1), 16);
const R = (c: C): number => (c >> 16) & 255;
const G = (c: C): number => (c >> 8) & 255;
const B = (c: C): number => c & 255;
const pack = (r: number, g: number, b: number): C =>
  (Math.max(0, Math.min(255, Math.round(r))) << 16) | (Math.max(0, Math.min(255, Math.round(g))) << 8) | Math.max(0, Math.min(255, Math.round(b)));
const mix = (a: C, b: C, t: number): C => pack(R(a) + (R(b) - R(a)) * t, G(a) + (G(b) - G(a)) * t, B(a) + (B(b) - B(a)) * t);
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const bay = (x: number, y: number): number => BAYER4[((y & 3) << 2) | (x & 3)];
const rnd = (x: number, y: number, seed = 0): number => hash2(x, y, seed);
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const band = (v: number, n: number): number => clamp01(Math.ceil(clamp01(v) * n - 1e-9) / n);
function noise1(x: number, seed = 0): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return rnd(i, 7, seed) * (1 - u) + rnd(i + 1, 7, seed) * u;
}
function noise2(x: number, y: number, seed = 0): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = rnd(i, j, seed);
  const b = rnd(i + 1, j, seed);
  const c = rnd(i, j + 1, seed);
  const d = rnd(i + 1, j + 1, seed);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
function fbm(x: number, y: number, seed = 0, oct = 3): number {
  let s = 0;
  let a = 0.5;
  let n = 0;
  for (let o = 0; o < oct; o++) {
    s += noise2(x, y, seed + o * 31) * a;
    n += a;
    x *= 2;
    y *= 2;
    a *= 0.5;
  }
  return s / n;
}

/** Runes, 3 wide and 5 tall ('x' lit), the wordsmith's letters (none of them a real letter). */
const RUNES: readonly string[][] = [
  ['x.x', 'xx.', 'x..', 'xx.', 'x.x'],
  ['.x.', 'x.x', '.x.', '.x.', '.x.'],
  ['xx.', 'x.x', 'xx.', 'x..', 'x..'],
  ['x.x', '.x.', 'x.x', '.x.', 'x.x'],
  ['.x.', '.xx', '.x.', 'xx.', '.x.'],
  ['x..', 'xx.', 'x.x', 'xx.', 'x..'],
  ['xxx', '.x.', 'x.x', '.x.', 'xxx'],
  ['..x', '.x.', 'xxx', '.x.', 'x..'],
];

/** A picture being painted: opaque, or (`clear`) a see-through sheet to lay over one. */
class Paint {
  readonly d = new Int32Array(W * H);
  /** For a see-through sheet: how much of each pixel there is, 0 to 255 (an opaque picture keeps it at 255). */
  readonly a = new Uint8Array(W * H);
  /** A see-through sheet's light that falls where it has nothing goes here instead (a sheet of light, to be added). */
  readonly spill: Paint | null;
  constructor(clear = false, spill: Paint | null = null) {
    if (!clear) this.a.fill(255);
    this.spill = spill;
  }
  set(x: number, y: number, c: C): void {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    this.d[y * W + x] = c;
    this.a[y * W + x] = 255;
  }
  get(x: number, y: number): C {
    x = Math.max(0, Math.min(W - 1, Math.floor(x)));
    y = Math.max(0, Math.min(H - 1, Math.floor(y)));
    return this.d[y * W + x];
  }
  over(x: number, y: number, c: C, k: number): void {
    if (k <= 0) return;
    if (k >= 1) return this.set(x, y, c);
    this.set(x, y, mix(this.get(x, y), c, k));
  }
  /** Light added: c times k. */
  add(x: number, y: number, c: C, k: number): void {
    if (k <= 0) return;
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = y * W + x;
    if (!this.a[i]) {
      this.spill?.add(x, y, c, k);
      return;
    }
    const o = this.d[i];
    this.d[i] = pack(R(o) + R(c) * k, G(o) + G(c) * k, B(o) + B(c) * k);
  }
  dot(x: number, y: number, c: C, f: number): void {
    if (bay(x, y) < f) this.set(x, y, c);
  }
  rect(x0: number, y0: number, w: number, hh: number, c: C): void {
    for (let y = Math.floor(y0); y < Math.floor(y0 + hh); y++) for (let x = Math.floor(x0); x < Math.floor(x0 + w); x++) this.set(x, y, c);
  }
  line(x0: number, y0: number, x1: number, y1: number, c: C): void {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) this.set(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), c);
  }
  poly(pts: readonly Pt[], c: C | ((x: number, y: number) => C | -1)): void {
    let y0 = Infinity;
    let y1 = -Infinity;
    for (const [, y] of pts) {
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(H - 1, Math.ceil(y1)); y++) {
      const yc = y + 0.5;
      const xs: number[] = [];
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i];
        const [bx, by] = pts[(i + 1) % pts.length];
        if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        for (let x = Math.max(0, Math.round(xs[k])); x < Math.min(W, Math.round(xs[k + 1])); x++) {
          const col = typeof c === 'function' ? c(x, y) : c;
          if (col >= 0) this.set(x, y, col);
        }
      }
    }
  }
  ellipse(cx: number, cy: number, rx: number, ry: number, c: C | ((x: number, y: number, n: number) => C | -1)): void {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const n = Math.hypot((x + 0.5 - cx) / Math.max(rx, 0.5), (y + 0.5 - cy) / Math.max(ry, 0.5));
        if (n > 1) continue;
        const col = typeof c === 'function' ? c(x, y, n) : c;
        if (col >= 0) this.set(x, y, col);
      }
    }
  }
  /** Light round a point, in `bands` flat rings, added. */
  glow(cx: number, cy: number, rx: number, ry: number, c: C, k: number, bands = 4): void {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const n = Math.hypot((x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry);
        if (n >= 1) continue;
        const b = band(1 - n, bands);
        this.add(x, y, c, k * b * b);
      }
    }
  }
  rune(x: number, y: number, i: number, c: C, big = 1): void {
    const r = RUNES[((i % RUNES.length) + RUNES.length) % RUNES.length];
    r.forEach((row, j) => {
      for (let k = 0; k < 3; k++) if (row[k] === 'x') this.rect(x + k * big, y + j * big, big, big, c);
    });
  }
  /** Onto a canvas the picture's size. */
  canvas(into?: HTMLCanvasElement): HTMLCanvasElement {
    const cv = into ?? document.createElement('canvas');
    cv.width = W;
    cv.height = H;
    const g = cv.getContext('2d') as CanvasRenderingContext2D;
    const im = g.createImageData(W, H);
    for (let i = 0; i < W * H; i++) {
      const c = this.d[i];
      im.data[i * 4] = R(c);
      im.data[i * 4 + 1] = G(c);
      im.data[i * 4 + 2] = B(c);
      im.data[i * 4 + 3] = this.a[i];
    }
    g.putImageData(im, 0, 0);
    return cv;
  }
}

// ---------------------------------------------------------------------------------------------
// Colours

const WHITE = 0xffffff;
/** His light, from its white heart out (the word's, as the picture behind TITLE_SMITH3 has it). */
const CY_HI = h('#b8fff8');
const CY = h('#22d0e0');
const CY_MID = h('#1898b4');
const CY_LO = h('#0c6a80');
const TEAL = h('#157a8c');
/** The sky, from its top to the hills. */
const SKY = ['#04051a', '#060a24', '#09102e', '#0c1636', '#111e40', '#17264a'].map(h);
/** The standing stones: as the old ring's (MENHIR, behind TITLE_SMITH3), dark to light. */
const STONE = ['#11122e', '#191a44', '#262a62', '#3a4088', '#5660ac', '#7e8ad0', '#a8b4e8'].map(h);
/** The hill's grass at night, dark to light. */
const GRASS = ['#070b16', '#0b111f', '#10182a', '#162236', '#1e2e44', '#2a3e56'].map(h);
/** His cowl and mantle, his robe, his skin, his beard (as the picture behind TITLE_SMITH3 has them). */
const MANTLE = ['#041824', '#08283a', '#0c3a4e', '#11566a', '#16707e', '#1d8a92', '#2aa4a6', '#46c2bc'].map(h);
const ROBE = ['#0c0a26', '#120f32', '#1a1642', '#221d54', '#2c2870', '#38338a'].map(h);
const SKIN = ['#2a2056', '#40336f', '#5a4a8a', '#7868a6', '#9a8cc6', '#b8ace4'].map(h);
const BEARD = ['#3e3478', '#554a92', '#7468ae', '#9a8ecc', '#bcb2e6', '#dcd4f8', '#f0e8ff'].map(h);
const WOOD = ['#1e120c', '#2d1b12', '#4a2c1a', '#6e4526'].map(h);

// ---------------------------------------------------------------------------------------------
// Where things are

/** The slab in the ring's middle, where the column stands. */
const SLAB_X = CX;
const SLAB_Y = 262;
/** The ring: its middle, and how far out its stones stand across and (seen from above a little) down. */
const RING_RX = 172;
const RING_RY = 44;
/** Ten stones, a gap at the front where the path comes in. */
const STONES = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2;
  const near = (Math.sin(a) + 1) / 2;
  return {
    i,
    a,
    x: SLAB_X + Math.cos(a) * RING_RX,
    y: SLAB_Y + Math.sin(a) * RING_RY,
    /** Nearer stones a little bigger. */
    s: 0.82 + near * 0.26,
    ht: 40 + Math.round(rnd(i, 1, 5) * 14),
    w: 15 + Math.round(rnd(i, 2, 5) * 5),
    lean: (rnd(i, 3, 5) - 0.5) * 5,
  };
});
/** The wordsmith: where his feet are (in the ring, before the column and a little to its left). */
const SMITH_X = 298;
const SMITH_Y = 294;
/** The column of light: its width at its foot, and the row where it breaks into the sky's light. */
const COL_W = 7;
const COL_TOP = 132;

/** How much of the column's light reaches a point on the ground or a face turned to it (0 to 1, in bands). */
function colLight(x: number, y: number): number {
  const d = Math.hypot((x - SLAB_X) / 1.0, (y - SLAB_Y) * 2.4);
  return band(clamp01(1 - d / 250), 7);
}

// ---------------------------------------------------------------------------------------------
// The sky

/** The stars: where each is, how bright (k), its number. Thicker in the river. */
const STARS = (() => {
  const out: { x: number; y: number; k: number; i: number }[] = [];
  for (let i = 0; i < 900; i++) {
    const x = Math.floor(rnd(i, 1, 41) * W);
    const y = Math.floor(rnd(i, 2, 41) * 236);
    const inRiver = Math.abs(y - (190 - x * 0.34)) < 40;
    if (!inRiver && rnd(i, 3, 41) < 0.45) continue;
    out.push({ x, y, k: rnd(i, 4, 41), i });
  }
  return out;
})();
/** How bright star i is at time t (0.2 to 1; 0.75 as the still picture has them all). */
const twinkle = (i: number, t: number): number => 0.6 + 0.4 * Math.sin(t * (1.3 + rnd(i, 5, 41) * 2) + i);

/** The sky: its night, the river of stars, the stars (twinkling at time t if `live`, else as the still picture has them), the moon. */
function paintSky(p: Paint, t: number, live = true): void {
  for (let y = 0; y < 250; y++) {
    const s = (y / 250) * (SKY.length - 1);
    const i = Math.min(SKY.length - 2, Math.floor(s));
    const f = s - i;
    for (let x = 0; x < W; x++) p.set(x, y, bay(x, y) < f ? SKY[i + 1] : SKY[i]);
  }
  // THE RIVER OF STARS, across from low on the left to high on the right
  for (let y = 0; y < 220; y++) {
    for (let x = 0; x < W; x++) {
      const mid = 190 - x * 0.34;
      const d = Math.abs(y - mid) / 46;
      if (d >= 1) continue;
      const v = fbm(x * 0.018, y * 0.03, 21, 4);
      const k = clamp01((v - 0.4 - d * 0.25) * 2.4);
      if (bay(x, y) < k * 0.45) p.set(x, y, k > 0.6 ? h('#2c3a72') : h('#1e2a5c'));
    }
  }
  // stars, thicker in the river
  for (const { x, y, k, i } of STARS) {
    const tw = live ? twinkle(i, t) : 0.75;
    if (k > 0.985) {
      p.add(x, y, WHITE, 0.95 * tw);
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) p.add(x + dx, y + dy, h('#8a96d8'), 0.55 * tw);
      if (tw > 0.8) for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2]] as const) p.add(x + dx, y + dy, h('#5a64a8'), 0.4);
    } else if (k > 0.85) p.add(x, y, h('#d8e0ff'), 0.75 * tw);
    else p.add(x, y, h('#7e88c8'), 0.45 * tw);
  }
  // a thin old moon, high on the left: the night's own light, from the upper left as the game's is
  p.ellipse(92, 40, 10, 10, h('#e8ecff'));
  p.ellipse(96, 37, 9, 9, (x, y) => (Math.hypot(x + 0.5 - 92, y + 0.5 - 40) < 10 ? SKY[0] : -1));
  p.glow(92, 40, 30, 30, h('#2a3470'), 0.5, 3);
}

/** THE AURORA: his light, broken out of the top of the column into curtains across the sky. Two curtains: the far one high, the near one low and bright. */
const CURTAINS = [
  { lowest: 108, len: 58, seed: 51, k0: 0.65, drift: 0.05 },
  { lowest: 172, len: 76, seed: 52, k0: 1.0, drift: 0.035 },
] as const;
type Curtain = (typeof CURTAINS)[number];
/** A curtain at column x and time t: the row of its lower hem, how tall it is there, and how strong (0 to 1). */
function curtainAt(c: Curtain, x: number, t: number): { bottom: number; tall: number; strong: number } {
  const ph = rnd(c.seed, 1, 3) * 6.28;
  const near = clamp01(1 - Math.abs(x - CX) / 340);
  // the hem: long smooth waves, lifted where the column feeds it
  const bottom = c.lowest - 16 * Math.sin(x * 0.011 + ph + t * c.drift) - 7 * Math.sin(x * 0.029 + ph * 2 - t * c.drift * 1.7) - near * near * 22;
  const tall = c.len * (0.7 + 0.3 * Math.sin(x * 0.017 + ph * 3)) + near * 24;
  // folds, brighter where the curtain turns toward us; rays running up it
  const fold = 0.5 + 0.5 * Math.sin(x * 0.021 + ph + t * c.drift * 2.3);
  const ray = 0.55 + 0.45 * noise1(x * 0.22 + t * c.drift * 5, c.seed + 3);
  return { bottom, tall, strong: c.k0 * (0.3 + 0.7 * fold) * ray * (0.5 + 0.5 * near) };
}
/** The light of a curtain `up` of the way up it (0 at its hem), as strong as `strong`: its colour, and how much of it. */
function curtainLight(strong: number, up: number): [C, number] {
  const b = band(strong * Math.pow(1 - up, 1.4), 5);
  if (b <= 0) return [0, 0];
  return [b > 0.75 ? CY_HI : b > 0.55 ? CY : b > 0.35 ? CY_MID : b > 0.15 ? TEAL : CY_LO, 0.14 + b * 0.42];
}
/** Letters drifting up in the aurora, at time t: where each is and how much of the light it has. */
function auroraLetters(t: number): { x: number; y: number; i: number; k: number }[] {
  return Array.from({ length: 26 }, (_, i) => {
    const x = Math.floor(30 + rnd(i, 1, 57) * 580);
    const y = Math.floor(180 - ((rnd(i, 2, 57) * 120 + t * (3 + rnd(i, 3, 57) * 4)) % 130));
    return { x, y, i, k: 0.3 + clamp01(1 - Math.abs(x - CX) / 330) * 0.35 };
  });
}
function paintAurora(p: Paint, t: number): void {
  for (const c of CURTAINS) {
    for (let x = 0; x < W; x++) {
      const { bottom, tall, strong } = curtainAt(c, x, t);
      for (let y = Math.floor(bottom - tall); y <= Math.floor(bottom); y++) {
        const [col, k] = curtainLight(strong, Math.min(1, Math.max(0, (bottom - y) / tall)));
        if (k > 0) p.add(x, y, col, k);
      }
      if (strong > 0.3) p.add(x, Math.floor(bottom) + 1, CY_HI, strong * 0.3);
    }
  }
  for (const { x, y, i, k } of auroraLetters(t)) runeLight(p, x, y, i, CY, k);
}
/** A rune of light, added. */
function runeLight(p: Paint, x: number, y: number, i: number, c: C, k: number, big = 1): void {
  const r = RUNES[((i % RUNES.length) + RUNES.length) % RUNES.length];
  r.forEach((row, j) => {
    for (let q = 0; q < 3; q++) if (row[q] === 'x') for (let a = 0; a < big; a++) for (let b = 0; b < big; b++) p.add(x + q * big + a, y + j * big + b, c, k);
  });
}

// ---------------------------------------------------------------------------------------------
// The land

/** The row of the top of the land at column x, for each of the far mountains, the far hills, the near hills. */
function ridge(x: number, base: number, amp: number, freq: number, seed: number): number {
  return base - amp * (noise1(x * freq, seed) * 0.62 + noise1(x * freq * 2.4, seed + 5) * 0.26 + noise1(x * freq * 6, seed + 9) * 0.12);
}
/** The near hill: its crown under the ring. */
function hillTop(x: number): number {
  return 208 + Math.pow(Math.abs(x - CX) / 330, 1.8) * 120 + (noise1(x * 0.05, 71) - 0.5) * 3;
}

function paintLand(p: Paint): void {
  // far mountains: a dark range, irregular, snow only on its highest peaks, a lit edge on the slopes
  // turned to the upper left
  const ridged = (v: number): number => 1 - Math.abs(v * 2 - 1);
  const peakLine = (x: number): number => 214 - 26 * noise1(x * 0.007, 60) - 20 * Math.pow(ridged(noise1(x * 0.021, 61)), 2) - 7 * ridged(noise1(x * 0.07, 62));
  let lowest = 0;
  for (let x = 0; x < W; x++) lowest = Math.max(lowest, 0);
  void lowest;
  for (let x = 0; x < W; x++) {
    const top = peakLine(x);
    const slope = peakLine(x + 2) - peakLine(x - 2);
    const litFace = slope > 0.6;
    const snowTo = top < 186 ? top + (186 - top) * 0.45 + noise1(x * 0.4, 63) * 2 : top;
    for (let y = Math.floor(top); y < 250; y++) {
      let c: C = h('#141b38');
      if (y < snowTo) c = litFace ? h('#5a76a4') : h('#2e3e66');
      else if (litFace && y < top + 3) c = h('#253158');
      p.set(x, y, c);
    }
  }
  // mist along their feet
  for (let y = 200; y < 226; y++) for (let x = 0; x < W; x++) if (bay(x, y) < 0.3 * (1 - Math.abs(y - 213) / 13) * (0.6 + 0.4 * noise1(x * 0.03, 64))) p.set(x, y, h('#2a3a66'));
  // the far hills, a line of pines on them
  for (let x = 0; x < W; x++) {
    const top = ridge(x, 230, 20, 0.02, 65);
    for (let y = Math.floor(top); y < H; y++) p.set(x, y, y < top + 1 ? h('#1e2a4a') : h('#0f1630'));
    if (noise1(x * 0.04, 66) > 0.55 && x % 5 === 0) {
      const tall = 6 + Math.floor(rnd(x, 1, 67) * 7);
      for (let k = 0; k < tall; k++) {
        const w = Math.floor((k / tall) * 3);
        for (let dx = -w; dx <= w; dx++) p.set(x + dx, top - tall + k, h('#0c1228'));
      }
    }
  }
  for (let y = 226; y < 246; y++) for (let x = 0; x < W; x++) if (bay(x, y) < 0.22 * (1 - Math.abs(y - 236) / 10) * (0.5 + 0.5 * noise1(x * 0.025, 68))) p.set(x, y, h('#26345e'));
  // THE NEAR HILL, lit round the ring by the column
  for (let x = 0; x < W; x++) {
    const top = hillTop(x);
    for (let y = Math.floor(top); y < H; y++) {
      const l = colLight(x, y);
      const tuft = rnd(x, Math.floor(y / 3), 73) > 0.86 && y % 3 !== 2;
      let c = GRASS[1 + Math.round(l * 3) + (tuft ? 1 : 0)];
      if (y < top + 1) c = GRASS[Math.min(5, 3 + Math.round(l * 2))];
      p.set(x, y, c);
      if (l > 0) p.add(x, y, CY_LO, l * 0.35);
    }
    // grass standing up off the crown, dark against the sky
    if (rnd(x, 2, 74) > 0.55) {
      const tall = 1 + Math.floor(rnd(x, 3, 74) * 4);
      for (let k = 1; k <= tall; k++) p.set(x + (k > 2 ? (rnd(x, 4, 74) > 0.5 ? 1 : -1) : 0), top - k, GRASS[2]);
    }
  }
  // the path of flags up the hill to the ring's gap
  for (let k = 0; k < 14; k++) {
    const y = 312 + k * 4 + k * k * 0.2;
    const x = CX + Math.sin(k * 0.55) * 10 + (k > 6 ? (k - 6) * -3 : 0);
    const w = 7 + k * 1.2;
    const l = colLight(x, y);
    p.ellipse(x, y, w, 1.6 + k * 0.12, (px, py, n) => (n > 0.8 ? STONE[1] : mix(STONE[2], STONE[4], l)));
  }
}

// ---------------------------------------------------------------------------------------------
// The ring

type Stone = (typeof STONES)[number];
/** A stone's shadow, cast away from the column across the lit ground. */
function paintStoneShadow(p: Paint, st: Stone): void {
  const { x, y, s, a } = st;
  const w = Math.round(st.w * s);
  const cosA = Math.cos(a);
  const len = 70 * s;
  const sx = cosA;
  const sy = Math.sin(a);
  const half = (w / 2) * Math.max(0.4, Math.abs(sy));
  p.poly([
    [x - half, y],
    [x + half, y],
    [x + sx * len + half * 1.3, y + sy * len * 0.55 + 1],
    [x + sx * len - half * 1.3, y + sy * len * 0.55 + 1],
  ], (px, py) => (py > hillTop(px) + 1 ? mix(p.get(px, py), GRASS[0], 0.55) : -1));
}
/** Where a stone's rune is (its top left corner). */
function stoneRune(st: Stone): Pt {
  return [Math.round(st.x + st.lean * st.s * 0.4 - 3), Math.round(st.y - Math.round(st.ht * st.s) * 0.64)];
}
/** A standing stone: a rough block, its face toward the column lit, a rune burning in it (as dim as it gets: its pulse is laid over it). */
function paintStone(p: Paint, st: Stone): void {
  const { x, y, s, a } = st;
  const w = Math.round(st.w * s);
  const ht = Math.round(st.ht * s);
  const lean = st.lean * s;
  const behind = Math.sin(a) < -0.05;
  const cosA = Math.cos(a);
  // the block
  const pts: Pt[] = [
    [x - w / 2, y],
    [x - w * 0.44 + lean, y - ht + 5],
    [x - w * 0.24 + lean, y - ht],
    [x + w * 0.22 + lean, y - ht - 1 - rnd(st.i, 4, 5) * 3],
    [x + w * 0.44 + lean, y - ht + 6],
    [x + w / 2, y],
  ];
  const streak = (px: number): boolean => rnd(Math.floor(px), st.i, 81) > 0.82;
  const front = (px: number, py: number): C => {
    let v = behind ? 3 + Math.round(colLight(px, y) * 2.2) : 1 + (Math.abs(cosA) > 0.6 ? 1 : 0);
    if (streak(px) && py > y - ht + 6) v -= 1;
    if (noise2(px * 0.12, py * 0.08, 80 + st.i) > 0.66) v += 1;
    return STONE[Math.max(0, Math.min(6, v))];
  };
  p.poly(pts, front);
  // the side of it turned to the column, where it shows
  const sideW = Math.round(Math.abs(cosA) * w * 0.4);
  if (sideW > 1 && Math.abs(Math.sin(a)) < 0.98) {
    const lit = (px: number, py: number): C => STONE[Math.min(6, 4 + (colLight(px, y) > 0.45 ? 1 : 0) + (noise2(px * 0.2, py * 0.1, 90 + st.i) > 0.7 ? 1 : 0))];
    if (cosA > 0) p.poly([[x - w / 2 - sideW, y - 2], [x - w * 0.44 + lean - sideW, y - ht + 7], [x - w * 0.44 + lean, y - ht + 5], [x - w / 2, y]], lit);
    else p.poly([[x + w / 2, y], [x + w * 0.44 + lean, y - ht + 6], [x + w * 0.44 + lean + sideW, y - ht + 8], [x + w / 2 + sideW, y - 2]], lit);
  }
  // its top, catching the sky; a crack or two
  for (let k = 2; k < 4; k++) p.line(pts[k][0], pts[k][1], pts[k + 1 > 4 ? 4 : k + 1][0], pts[k + 1 > 4 ? 4 : k + 1][1], STONE[behind ? 6 : 3]);
  p.line(pts[1][0], pts[1][1], pts[2][0], pts[2][1], STONE[behind ? 5 : 3]);
  const cx0 = x + (rnd(st.i, 6, 5) - 0.5) * w * 0.5;
  p.line(cx0, y - ht * 0.9, cx0 + 2, y - ht * 0.7, STONE[behind ? 2 : 0]);
  p.line(cx0 + 2, y - ht * 0.7, cx0 + 1, y - ht * 0.55, STONE[behind ? 2 : 0]);
  // the stones before the column: its light runs round their edges
  if (!behind) {
    const e = cosA > 0 ? [pts[0], pts[1], pts[2]] : [pts[5], pts[4], pts[3]];
    p.line(e[0][0] + (cosA > 0 ? 0 : -1), e[0][1], e[1][0] + (cosA > 0 ? 0 : -1), e[1][1], CY);
    p.line(e[1][0] + (cosA > 0 ? 0 : -1), e[1][1], e[2][0], e[2][1], CY_HI);
  }
  // its rune, burning
  const [rx, ry] = stoneRune(st);
  p.glow(rx + 3, ry + 5, 13, 13, CY, 0.2, 3);
  p.rune(rx - 1, ry + 1, st.i + 2, STONE[0], 2);
  p.rune(rx, ry, st.i + 2, CY, 2);
  // its foot in the grass
  for (let k = 0; k < w; k += 2) p.set(x - w / 2 + k + 1, y - 1 - (rnd(k, st.i, 6) > 0.5 ? 1 : 0), GRASS[3]);
}

/** The slab in the middle, low and dressed, the column standing up off it. */
function paintSlab(p: Paint): void {
  p.poly([[SLAB_X - 24, SLAB_Y - 2], [SLAB_X + 24, SLAB_Y - 2], [SLAB_X + 20, SLAB_Y - 8], [SLAB_X - 20, SLAB_Y - 8]], STONE[6]);
  p.poly([[SLAB_X - 24, SLAB_Y - 2], [SLAB_X + 24, SLAB_Y - 2], [SLAB_X + 24, SLAB_Y + 4], [SLAB_X - 24, SLAB_Y + 4]], (x) => (x < SLAB_X - 6 ? STONE[3] : STONE[2]));
  // the ring of runes on its top
  for (let k = 0; k < 9; k++) p.set(SLAB_X - 16 + k * 4, SLAB_Y - 5, CY_HI);
}

/** Letters climbing the column at time t: the row of each. */
const columnLetters = (t: number): number[] => Array.from({ length: 6 }, (_, i) => Math.floor(SLAB_Y - 26 - ((i * 22 + t * 18) % 132)));
function paintColumnLetters(p: Paint, t: number): void {
  columnLetters(t).forEach((y, i) => p.rune(SLAB_X - 3, y, i * 3 + 1, CY_LO, 2));
}

/** THE COLUMN: up off the slab, white at its heart, breaking into the sky's light at its top; light added to what is there. */
function paintColumn(p: Paint): void {
  for (let y = 0; y < SLAB_Y - 4; y++) {
    // full up to COL_TOP; above it, fading in bands as it spreads into the aurora
    const k = y >= COL_TOP ? 1 : band((y - 30) / (COL_TOP - 30), 5);
    if (k <= 0) continue;
    const w = COL_W + (SLAB_Y - y) * 0.008;
    for (let x = Math.floor(SLAB_X - w * 3); x <= Math.ceil(SLAB_X + w * 3); x++) {
      const d = Math.abs(x + 0.5 - SLAB_X) / w;
      if (d < 0.35) p.add(x, y, WHITE, 0.85 * k);
      else if (d < 0.7) p.add(x, y, CY_HI, 0.7 * k);
      else if (d < 1) p.add(x, y, CY, 0.6 * k);
      else if (d < 1.8) p.add(x, y, CY_MID, 0.32 * k);
      else if (d < 3) p.add(x, y, CY_LO, 0.22 * k);
    }
  }
  // its foot: a burst of light on the slab, and on everything round it
  p.glow(SLAB_X, SLAB_Y - 6, 34, 12, CY_HI, 0.55, 4);
  p.glow(SLAB_X, SLAB_Y - 4, 200, 42, CY, 0.32, 6);
}

// ---------------------------------------------------------------------------------------------
// The wordsmith, small, the light behind him

/** His shadow, thrown toward us down the hill. */
function paintSmithShadow(p: Paint): void {
  const K = 1.3;
  p.poly([[SMITH_X - 9 * K, SMITH_Y], [SMITH_X + 9 * K, SMITH_Y], [SMITH_X + 18 * K, SMITH_Y + 30 * K], [SMITH_X - 8 * K, SMITH_Y + 32 * K]], (x, y) => mix(p.get(x, y), GRASS[0], 0.55));
}
/** Where his staff's stone and his eyes are (their middles). */
const STAFF_STONE: Pt = [Math.round(SMITH_X - 15 * 1.3 + 56 * 1.3 * 0.04) + 5, Math.floor(SMITH_Y - 56 * 1.3) - 1];
const EYES: Pt = [SMITH_X, SMITH_Y - 39 * 1.3];

/** He stands before the column, facing us, his staff in his right hand (on our left); the light comes from behind him, so he is dark, its edge running round him, his eyes burning. `stir` (-1 to 1) moves his mantle's ends and the hem of his robe; `eye` (0 to 1) how bright his eyes burn. */
function paintSmith(p: Paint, stir: number, eye: number): void {
  const fx = SMITH_X;
  const fy = SMITH_Y;
  const K = 1.3;
  const q = (dx: number, dy: number): Pt => [fx + dx * K, fy + dy * K];
  const Q = (pts: readonly (readonly [number, number])[]): Pt[] => pts.map(([dx, dy]) => q(dx, dy));
  const mine = new Set<C>();
  const own = (c: C): C => {
    mine.add(c);
    return c;
  };
  // the staff, planted, its crook and its stone
  const [sx0, sy0] = q(-15, 1);
  const [, syTop] = q(-15, -56);
  for (let y = Math.floor(syTop); y <= sy0; y++) {
    const x = Math.round(sx0 + (sy0 - y) * 0.04);
    p.set(x, y, own(WOOD[2]));
    p.set(x + 1, y, own(WOOD[1]));
  }
  const [tx, ty] = [Math.round(sx0 + (sy0 - syTop) * 0.04), Math.floor(syTop)];
  p.line(tx + 1, ty, tx + 5, ty - 5, own(WOOD[3]));
  p.line(tx + 5, ty - 5, tx + 9, ty - 2, own(WOOD[2]));
  p.line(tx + 9, ty - 2, tx + 9, ty + 1, own(WOOD[2]));
  p.rect(tx + 4, ty - 3, 3, 4, CY_HI);
  p.glow(tx + 5, ty - 1, 12, 12, CY, 0.5, 3);
  // the robe, to the ground, its hem stirring
  const hem = stir * 1.5;
  p.poly(Q([[-9, -30], [9, -30], [12 + hem, 0], [-12 + hem, 0]]), (x, y) => own(x > fx + 5 * K + (y - fy + 30 * K) * 0.1 ? ROBE[3] : y > fy - 3 ? ROBE[0] : ROBE[1]));
  // its folds
  for (const dx of [-5, 4]) p.line(...q(dx, -24), ...q(dx * 1.3 + hem, -1), own(ROBE[0]));
  // runes burning down the front of it
  for (let k = 0; k < 4; k++) {
    const [rx, ry] = q(-1.2, -25 + k * 6.4);
    p.rune(Math.round(rx), Math.round(ry), k + 4, k % 2 ? CY_MID : CY);
  }
  // the mantle over his shoulders, its ends hanging, stirring
  p.poly(Q([[-12, -26], [-10, -34], [10, -34], [12, -26], [9, -13 + stir], [5, -23], [-5, -23], [-9, -13 - stir]]), (x, y) => own(x > fx + 5 * K ? MANTLE[4] : y < fy - 30 * K ? MANTLE[3] : MANTLE[2]));
  // its edge, pricked with light
  for (const [dx, dy] of [[-11, -25], [-10, -20], [-9, -15], [9, -15], [10, -20], [11, -25]] as const) p.set(...q(dx, dy), CY);
  // his beard, long and white, its locks
  p.poly(Q([[-5, -36], [5, -36], [4.5, -27], [1.5, -17], [0, -20], [-1.5, -18], [-4, -26]]), (x, y) => own(x > fx + 2 * K ? BEARD[5] : (Math.floor(x) + Math.floor(y)) % 3 === 0 ? BEARD[2] : BEARD[3]));
  // his face in the cowl's shadow, his brows heavy and white, his eyes burning
  p.poly(Q([[-4.5, -41.5], [4.5, -41.5], [4.5, -36], [-4.5, -36]]), (x) => own(x > fx + 2 * K ? SKIN[3] : SKIN[1]));
  p.poly(Q([[-5, -41.5], [5, -41.5], [5, -40.2], [-5, -40.2]]), own(BEARD[4]));
  p.poly(Q([[-5, -37.5], [5, -37.5], [5, -36], [-5, -36]]), own(BEARD[4]));
  const [ex, ey] = q(0, -39);
  const glint = eye > 0.5 ? CY_HI : CY;
  p.rect(Math.round(ex - 4), Math.round(ey), 2, 1, glint);
  p.rect(Math.round(ex + 2), Math.round(ey), 2, 1, glint);
  p.glow(ex, ey, 9, 5, CY, 0.22 + eye * 0.25, 2);
  // the cowl, up over his head, open over his face
  p.poly(Q([[-8, -32], [-8, -42], [-4, -47.5], [1, -49.5], [6, -46], [8, -40], [8, -32], [5, -35], [5, -42.2], [-5, -42.2], [-5, -35]]), (x, y) => own(x > fx + 4 * K ? MANTLE[5] : y < fy - 44 * K ? MANTLE[3] : MANTLE[2]));
  for (const [dx, dy] of [[-5.5, -43], [-1, -45.5], [3, -44.5], [5.5, -40], [5.5, -36]] as const) p.set(...q(dx, dy), CY);
  // his hand on the staff
  const [hx, hy] = q(-14.5, -25);
  p.rect(Math.round(hx) - 2, Math.round(hy), 5, 5, own(SKIN[2]));
  p.rect(Math.round(hx) + 2, Math.round(hy), 1, 5, own(SKIN[4]));
  p.set(Math.round(hx), Math.round(hy) + 2, CY);
  // the light behind him, running round his edge on the column's side (our right) and over his head
  const [x0] = q(-16, 0);
  const [x1] = q(14, 0);
  for (let y = Math.floor(q(0, -50)[1]); y <= fy; y++) {
    let last = -1;
    for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) if (mine.has(p.get(x, y))) last = x;
    if (last > 0) p.set(last + 1, y, y < fy - 30 * K ? CY_HI : CY);
  }
  for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) {
    for (let y = Math.floor(q(0, -52)[1]); y <= fy; y++) {
      if (mine.has(p.get(x, y))) {
        p.set(x, y - 1, CY_MID);
        break;
      }
    }
  }
}

// ---------------------------------------------------------------------------------------------
// The whole of it

/** Motes of his light drifting up off the hill round the ring. */
function paintMotes(p: Paint, t: number): void {
  for (let i = 0; i < 40; i++) {
    const x0 = SLAB_X + (rnd(i, 1, 97) - 0.5) * 360;
    const life = (rnd(i, 2, 97) + t * (0.06 + rnd(i, 3, 97) * 0.05)) % 1;
    const x = x0 + Math.sin(t * 0.8 + i) * 4;
    const y = hillTop(x0) + 4 - life * 90;
    const k = Math.sin(life * Math.PI);
    p.add(x, y, CY_HI, 0.7 * k);
    p.add(x, y + 1, CY, 0.35 * k);
  }
}

// THE PICTURE'S LIFE, as numbers of time: each stone's rune swells in turn, a wave going round the ring;
// his eyes and his staff's stone brighten and dim; his mantle and hem stir (three ways); the stars
// twinkle; the aurora drifts and ripples; letters climb the column and drift up in the aurora; motes
// of his light rise off the hill.
const pulseOf = (i: number, t: number): number => clamp01(0.5 + 0.5 * Math.sin(t * 1.6 - i * 0.63));
const eyeOf = (t: number): number => clamp01(0.5 + 0.5 * Math.sin(t * 0.9));
const staffOf = (t: number): number => clamp01(0.5 + 0.5 * Math.sin(t * 1.1 + 1));
const stirOf = (t: number): -1 | 0 | 1 => Math.round(Math.sin(t * 1.3)) as -1 | 0 | 1;
const BACK = STONES.filter((s) => Math.sin(s.a) <= 0).sort((a, b) => a.y - b.y);
const FRONT = STONES.filter((s) => Math.sin(s.a) > 0).sort((a, b) => a.y - b.y);

/** The picture at time `t` (seconds), whole, pixel by pixel (the game lays it up out of layers instead: makeRingTitle). */
export function paintRing(t = 0): Paint {
  const p = new Paint();
  paintSky(p, t);
  paintAurora(p, t);
  paintLand(p);
  for (const st of STONES) paintStoneShadow(p, st);
  paintSmithShadow(p);
  const lit = (st: Stone): void => {
    const k = pulseOf(st.i, t);
    const [rx, ry] = stoneRune(st);
    p.glow(rx + 3, ry + 5, 13, 13, CY, k * 0.32, 3);
    if (k > 0.6) p.rune(rx, ry, st.i + 2, CY_HI, 2);
  };
  for (const st of BACK) {
    paintStone(p, st);
    lit(st);
  }
  paintSlab(p);
  paintColumn(p);
  paintColumnLetters(p, t);
  paintSmith(p, stirOf(t), 0);
  p.glow(EYES[0], EYES[1], 9, 5, CY, eyeOf(t) * 0.25, 2);
  p.glow(STAFF_STONE[0], STAFF_STONE[1], 12, 12, CY, staffOf(t) * 0.35, 3);
  for (const st of FRONT) {
    paintStone(p, st);
    lit(st);
  }
  paintMotes(p, t);
  return p;
}

/** The start screen's picture as the screen holds one (ui/panels.ts SmithPicture). */
export interface RingTitle {
  w: number;
  h: number;
  lip: number;
  lift: number;
  headTop: number;
  still: HTMLCanvasElement;
  /** The picture at time `t` (seconds), whole, on a sheet as big as it (the same sheet each call). */
  life(t: number): HTMLCanvasElement;
  /** A flash over the whole picture at time `t` (the surge): its colour and how strong (0, none). */
  flash(t: number): readonly [string, number];
}

// THE SURGE, the picture's big moment: every SURGE_EVERY seconds (the first SURGE_FIRST in) a burst of
// light runs up the column (SURGE_UP s) and breaks into the aurora, which flares outward from the middle
// across the sky; at its foot a ring of light runs out across the hill (SURGE_RING_FOR s); every rune in
// the ring and his eyes flare and die back; his mantle is blown back; a faint flash of his light.
export const SURGE_FIRST = 3;
export const SURGE_EVERY = 8;
const SURGE_UP = 0.55;
const SURGE_SKY_FOR = 2.2;
const SURGE_RING_FOR = 1.3;
/** How far into a surge time t is (seconds; below 0 before the first). */
const surgePhase = (t: number): number => (t < SURGE_FIRST ? -1 : (t - SURGE_FIRST) % SURGE_EVERY);
/** How much the surge brightens the aurora at column x, sp into it: a wave running out from the middle. */
function surgeSky(sp: number, x: number): number {
  if (sp < SURGE_UP || sp >= SURGE_SKY_FOR) return 0;
  const d = sp - SURGE_UP;
  return 1.4 * Math.exp(-Math.pow((Math.abs(x - CX) - 480 * d) / 90, 2)) * Math.exp(-d * 0.9);
}
/** How strongly the runes and his eyes flare, sp into a surge (0 to 1). */
const surgeFlare = (sp: number): number => (sp < 0 || sp > 2 ? 0 : sp < 0.05 ? sp / 0.05 : Math.exp(-(sp - 0.05) * 2.2));

const css = (c: C, k = 1): string => `rgb(${Math.round(R(c) * k)},${Math.round(G(c) * k)},${Math.round(B(c) * k)})`;

/** A ring of light on black, to be added where it is wanted (as Paint.glow), r across. */
function glowSprite(rx: number, ry: number, c: C, k: number, bands: number): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = rx * 2 + 1;
  cv.height = ry * 2 + 1;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  for (let y = 0; y <= ry * 2; y++) {
    for (let x = 0; x <= rx * 2; x++) {
      const n = Math.hypot((x + 0.5 - rx - 0.5) / rx, (y + 0.5 - ry - 0.5) / ry);
      if (n >= 1) continue;
      const b = band(1 - n, bands);
      g.fillStyle = css(c, k * b * b);
      g.fillRect(x, y, 1, 1);
    }
  }
  return cv;
}

/**
 * The picture, laid up for the start screen out of layers painted once, and its life laid over them
 * each time it is asked for. What changes is drawn with the canvas's own tools: the aurora a column of
 * pixels at a time, stretched from strips painted once (crisp: never smoothed); light added where light is.
 */
export function makeRingTitle(): RingTitle {
  // THE LAYERS, back to front
  const sky = new Paint();
  paintSky(sky, 0, false);
  const lightA = new Paint();
  const frontA = new Paint(true, lightA);
  paintLand(frontA);
  for (const st of STONES) paintStoneShadow(frontA, st);
  paintSmithShadow(frontA);
  for (const st of BACK) paintStone(frontA, st);
  paintSlab(frontA);
  const column = new Paint();
  paintColumn(column);
  const lightB = new Paint();
  const frontB = ([-1, 0, 1] as const).map((stir, k) => {
    const fb = new Paint(true, k === 1 ? lightB : new Paint());
    paintSmith(fb, stir, 0);
    for (const st of FRONT) paintStone(fb, st);
    return fb.canvas();
  });
  const skyCv = sky.canvas();
  const lightACv = lightA.canvas();
  const frontACv = frontA.canvas();
  const columnCv = column.canvas();
  const lightBCv = lightB.canvas();
  // THE AURORA'S STRIPS: one column of pixels for each of NS strengths, from its top (row 0) to its hem
  const NS = 16;
  const SH = 48;
  const strips = document.createElement('canvas');
  strips.width = NS;
  strips.height = SH + 1;
  {
    const g = strips.getContext('2d') as CanvasRenderingContext2D;
    g.fillStyle = '#000';
    g.fillRect(0, 0, NS, SH + 1);
    for (let k = 0; k < NS; k++) {
      const strong = (k + 0.5) / NS;
      for (let r = 0; r < SH; r++) {
        const [c, a] = curtainLight(strong, 1 - r / (SH - 1));
        if (a <= 0) continue;
        g.fillStyle = css(c, a);
        g.fillRect(k, r, 1, 1);
      }
      if (strong > 0.3) {
        g.fillStyle = css(CY_HI, strong * 0.3);
        g.fillRect(k, SH, 1, 1);
      }
    }
  }
  const runeGlow = glowSprite(13, 13, CY, 0.32, 3);
  const surgeBlob = glowSprite(20, 22, CY_HI, 1, 4);
  const eyeGlow = glowSprite(9, 5, CY, 0.25, 2);
  const staffGlow = glowSprite(12, 12, CY, 0.35, 3);
  const sheet = document.createElement('canvas');
  sheet.width = W;
  sheet.height = H;
  const g = sheet.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const runeRects = (x: number, y: number, i: number, big: number): void => {
    const r = RUNES[((i % RUNES.length) + RUNES.length) % RUNES.length];
    r.forEach((row, j) => {
      for (let q = 0; q < 3; q++) if (row[q] === 'x') g.fillRect(x + q * big, y + j * big, big, big);
    });
  };
  // THE SKY AND ITS AURORA change slowly: laid up afresh twelve times a second (every frame while the
  // surge runs through it), and kept
  const skyNow = document.createElement('canvas');
  skyNow.width = W;
  skyNow.height = H;
  const sg = skyNow.getContext('2d') as CanvasRenderingContext2D;
  sg.imageSmoothingEnabled = false;
  let skyKey = NaN;
  const layUpSky = (t: number, sp: number): void => {
    sg.globalCompositeOperation = 'source-over';
    sg.drawImage(skyCv, 0, 0);
    // light, added: the stars twinkling, the aurora, its letters
    sg.globalCompositeOperation = 'lighter';
    for (const { x, y, k, i } of STARS) {
      if (k <= 0.85) continue;
      const more = twinkle(i, t) - 0.75;
      if (more <= 0) continue;
      sg.fillStyle = css(k > 0.985 ? WHITE : h('#d8e0ff'), more * 1.6);
      sg.fillRect(x, y, 1, 1);
    }
    for (const c of CURTAINS) {
      for (let x = 0; x < W; x++) {
        const { bottom, tall, strong } = curtainAt(c, x, t);
        const boost = surgeSky(sp, x);
        const k = Math.max(0, Math.min(NS - 1, Math.floor(Math.min(1, strong * (1 + boost) + boost * 0.25) * NS)));
        const y0 = Math.floor(bottom - tall);
        sg.drawImage(strips, k, 0, 1, SH + 1, x, y0, 1, Math.floor(bottom) + 2 - y0);
      }
    }
    for (const { x, y, i, k } of auroraLetters(t)) {
      sg.fillStyle = css(CY, Math.min(1, k * (1 + surgeSky(sp, x))));
      const r = RUNES[((i % RUNES.length) + RUNES.length) % RUNES.length];
      r.forEach((row, j) => {
        for (let q = 0; q < 3; q++) if (row[q] === 'x') sg.fillRect(x + q, y + j, 1, 1);
      });
    }
    sg.drawImage(lightACv, 0, 0);
  };
  const life = (t: number): HTMLCanvasElement => {
    const sp = surgePhase(t);
    const key = sp >= 0 && sp < SURGE_SKY_FOR ? t : Math.floor(t * 12);
    if (key !== skyKey) {
      layUpSky(sp >= 0 && sp < SURGE_SKY_FOR ? t : key / 12, sp);
      skyKey = key;
    }
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;
    g.drawImage(skyNow, 0, 0);
    // the land, the back stones, the slab
    g.globalCompositeOperation = 'source-over';
    g.drawImage(frontACv, 0, 0);
    // the column's light, and the letters climbing it
    g.globalCompositeOperation = 'lighter';
    g.drawImage(columnCv, 0, 0);
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = css(CY_LO);
    columnLetters(t).forEach((y, i) => runeRects(SLAB_X - 3, y, i * 3 + 1, 2));
    // THE SURGE: a burst of light up the column, a ring of it out across the ground
    const flare = surgeFlare(sp);
    if (sp >= 0 && sp < SURGE_UP) {
      const y = Math.round(SLAB_Y - 12 - (SLAB_Y - 60) * (sp / SURGE_UP));
      g.globalCompositeOperation = 'lighter';
      g.drawImage(surgeBlob, SLAB_X - Math.floor(surgeBlob.width / 2), y - Math.floor(surgeBlob.height / 2));
      g.globalCompositeOperation = 'source-over';
    }
    if (sp >= 0 && sp < SURGE_RING_FOR) {
      const u = sp / SURGE_RING_FOR;
      const rx = 24 + 460 * u;
      const ry = rx * (RING_RY / RING_RX);
      g.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 3; k++) {
        g.fillStyle = css(k === 1 ? CY_HI : CY, (1 - u) * (k === 1 ? 0.7 : 0.4));
        const steps = Math.ceil(rx * 2);
        for (let q = 0; q < steps; q++) {
          const a = (q / steps) * Math.PI * 2;
          const x = Math.round(SLAB_X + Math.cos(a) * (rx + k - 1));
          const y = Math.round(SLAB_Y + Math.sin(a) * (ry + (k - 1) * 0.5));
          if (y > hillTop(x) + 1) g.fillRect(x, y, 1, 1);
        }
      }
      g.globalCompositeOperation = 'source-over';
    }
    // the back stones' runes swelling
    const swell = (st: Stone): void => {
      const k = Math.max(pulseOf(st.i, t), flare);
      const [rx, ry] = stoneRune(st);
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = k;
      g.drawImage(runeGlow, rx + 3 - 13, ry + 5 - 13);
      g.globalAlpha = 1;
      g.globalCompositeOperation = 'source-over';
      if (k > 0.6) {
        g.fillStyle = css(CY_HI);
        runeRects(rx, ry, st.i + 2, 2);
      }
    };
    for (const st of BACK) swell(st);
    // him, and the stones before him
    g.drawImage(frontB[(flare > 0.3 ? 1 : stirOf(t)) + 1], 0, 0);
    g.globalCompositeOperation = 'lighter';
    g.drawImage(lightBCv, 0, 0);
    g.globalAlpha = Math.max(eyeOf(t), flare);
    g.drawImage(eyeGlow, Math.round(EYES[0]) - 9, Math.round(EYES[1]) - 5);
    g.globalAlpha = Math.max(staffOf(t), flare);
    g.drawImage(staffGlow, STAFF_STONE[0] - 12, STAFF_STONE[1] - 12);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    for (const st of FRONT) swell(st);
    // motes rising off the hill
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 40; i++) {
      const x0 = SLAB_X + (rnd(i, 1, 97) - 0.5) * 360;
      const age = (rnd(i, 2, 97) + t * (0.06 + rnd(i, 3, 97) * 0.05)) % 1;
      const x = Math.floor(x0 + Math.sin(t * 0.8 + i) * 4);
      const y = Math.floor(hillTop(x0) + 4 - age * 90);
      const k = Math.sin(age * Math.PI);
      g.fillStyle = css(CY_HI, 0.7 * k);
      g.fillRect(x, y, 1, 1);
      g.fillStyle = css(CY, 0.35 * k);
      g.fillRect(x, y + 1, 1, 1);
    }
    g.globalCompositeOperation = 'source-over';
    return sheet;
  };
  const still = document.createElement('canvas');
  still.width = W;
  still.height = H;
  (still.getContext('2d') as CanvasRenderingContext2D).drawImage(life(0), 0, 0);
  const flash = (t: number): readonly [string, number] => {
    const d = surgePhase(t) - SURGE_UP;
    return d < 0 || d > 0.4 ? ['', 0] : [css(CY_HI), 0.14 * Math.exp(-d * 8)];
  };
  return { w: W, h: H, lip: RING_LIP, lift: RING_LIFT, headTop: RING_HEAD, still, life, flash };
}
