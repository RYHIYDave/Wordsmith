// ROUGH SKETCHES for the start screen, for the owner to choose a staging from.
//
// He was shown four stills of the wordsmith at his table (art/title_smith.ts) and said (5 Oct 2026,
// 19:03): "3 is the best but im still not sold", and then: "they can be lower quality to start
// with if that faster to push them out for review". So these are block-ins, at HALF the size of
// the screen (254 x 117, shown with every pixel doubled): flat shapes, the light, where things
// are. Nothing here is used by the game. The one he picks is painted properly afterwards.
//
// All of them keep what he liked in still 3: both hands planted, leaning in, the word the light
// under him. What changes is where we stand and what is round him:
//   desk    the librarian's staging: a heavy table with a front to it, racks of rune stones, a window
//   floor   a real look up from the floor: his fingers over the table's edge, the stones leaning in
//   forge   the forge fire behind him, warm at his back, the word cold under his face
//   close   only his face and his hands, lit from underneath

import { CYAN, INK } from '../art/kit';
import { EMBER } from '../art/props';
import { Px, rgba } from '../engine/px';

export const SKW = 254;
export const SKH = 117;
const W = SKW;
const H = SKH;
const CX = 127;

type Pt = readonly [number, number];
type Tones = readonly string[];

const NIGHT = '#05040f';
const WALL_T: Tones = ['#100e2c', '#17153c', '#1f1c4c', '#2a2866', '#3a3884'];
const SLAB_T: Tones = ['#0e0c26', '#161438', '#1f1d4e', '#2c2a6a', '#3e3c8a', '#5a58ac'];
const SKIN_T: Tones = ['#2a2056', '#40336f', '#5a4a8a', '#7868a6', '#9a8cc6', '#b8ace4', '#d8d0f8', '#dff6fc'];
const HAIR_T: Tones = ['#2c2460', '#3e3478', '#554a92', '#7468ae', '#9a8ecc', '#bcb2e6', '#dcd4f8', '#f0e8ff', '#e9fdff'];
const PELT_T: Tones = ['#24142f', '#371f45', '#4d2d5a', '#683f70', '#825a84', '#a0728e', '#be89a2'];
const CLOAK_T: Tones = ['#06202f', '#0a3044', '#0c4258', '#105a70', '#157a8c', '#28a0a8', '#3cc4c0'];
const MAIL_T: Tones = ['#161436', '#1b1840', '#201d4a', '#262255', '#2c2860', '#332f6c', '#3a3678', '#423e84', '#4a4690', '#57539c'];
const HIDE_T: Tones = ['#1f0e27', '#301637', '#44204a', '#592c54', '#6e3a5c', '#8b4d6b'];
const STEEL_T: Tones = ['#1e1a48', '#2e2a66', '#46408a', '#625cac', '#8a84d0', '#b4aeee', '#d6d0ff'];
const WOOD_T: Tones = ['#160c1e', '#22122a', '#321a38', '#44244a'];
const GLOW = CYAN[2];
const WHITE = '#ffffff';

/** The tones a figure is blocked in from. COLD is the game's own indigo and lilac; WARM is the library picture's: skin that is skin, oak, grey steel. */
interface Look {
  skin: Tones;
  hair: Tones;
  pelt: Tones;
  cloak: Tones;
  mail: Tones;
  hide: Tones;
  steel: Tones;
  ink: string;
}
const COLD: Look = { skin: SKIN_T, hair: HAIR_T, pelt: PELT_T, cloak: CLOAK_T, mail: MAIL_T, hide: HIDE_T, steel: STEEL_T, ink: INK };
const WARM: Look = {
  skin: ['#3a2224', '#5a3430', '#7a4a38', '#9a5c44', '#b07050', '#dc9c74', '#f4c8a0', '#e6fbff'],
  hair: ['#3a3040', '#4d4252', '#655868', '#857888', '#a89cab', '#cfc6d2', '#e9e4ee', '#ffffff', '#e9fdff'],
  pelt: ['#1c120e', '#2d1b12', '#4a2c1a', '#6e4526', '#96643a', '#c08a55', '#d8a878'],
  cloak: ['#06202a', '#0a3038', '#0e4650', '#146470', '#1c8690', '#30a8a8', '#58ccc4'],
  mail: ['#141a26', '#1c2432', '#26303f', '#2e3440', '#3a4558', '#4a5466', '#5e6a80', '#7a879c', '#98a6ba', '#b4c0d0'],
  hide: ['#1c120e', '#2d1b12', '#4a2c1a', '#6e4526', '#8a5830', '#a8703c'],
  steel: ['#1c2028', '#2e3440', '#4a5466', '#7a879c', '#b4c0d0', '#e6edf5', '#ffffff'],
  ink: '#120d18',
};
const OAK_T: Tones = ['#1c100a', '#2d1b12', '#4a2c1a', '#6e4526', '#96643a', '#c08a55'];
const EARTH_T: Tones = ['#160f12', '#221a1c', '#2b2020', '#3d2c28', '#544038'];

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const lay = (): Px => new Px(W, H);
/** A number from 0 to 1 that is always the same for the same two whole numbers. */
const rnd = (a: number, b: number): number => {
  const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/** Put a part on the picture with an ink line round it. */
function over(dst: Px, part: Px, line: string | null = INK): void {
  const a = part.d;
  const b = dst.d;
  const ink = line ? rgba(line) : null;
  const row = W * 4;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (a[i + 3] > 0) {
        b[i] = a[i];
        b[i + 1] = a[i + 1];
        b[i + 2] = a[i + 2];
        b[i + 3] = 255;
      } else if (ink && ((x > 0 && a[i - 1] > 0) || (x < W - 1 && a[i + 7] > 0) || (y > 0 && a[i + 3 - row] > 0) || (y < H - 1 && a[i + 3 + row] > 0))) {
        b[i] = ink[0];
        b[i + 1] = ink[1];
        b[i + 2] = ink[2];
        b[i + 3] = 255;
      }
    }
  }
}

function toward(d: Uint8ClampedArray, i: number, c: readonly number[], t: number): void {
  d[i] = Math.round(d[i] + (c[0] - d[i]) * t);
  d[i + 1] = Math.round(d[i + 1] + (c[1] - d[i + 1]) * t);
  d[i + 2] = Math.round(d[i + 2] + (c[2] - d[i + 2]) * t);
}

const far2 = (x: number, y: number, lx: number, ly: number): number => Math.hypot((x + 0.5 - lx) * 0.85, y + 0.5 - ly);
const band = (t: number, bands: number): number => Math.floor(clamp01(t) * bands + 0.5);

/** Sink the picture into the dark, more the further from the light; in flat bands. */
function gloom(p: Px, lx: number, ly: number, near: number, far: number, dark: string, max: number, bands = 10): void {
  const c = rgba(dark);
  for (let y = 0, i = 0; y < H; y++) {
    for (let x = 0; x < W; x++, i += 4) {
      if (p.d[i + 3] === 0) continue;
      const t = (band((far2(x, y, lx, ly) - near) / (far - near), bands) / bands) * max;
      if (t > 0) toward(p.d, i, c, t);
    }
  }
}

/** Light spilling from a point: what is near it is mixed toward its colour. */
function glow(p: Px, lx: number, ly: number, far: number, col: string, max: number, bands = 6): void {
  const c = rgba(col);
  for (let y = 0, i = 0; y < H; y++) {
    for (let x = 0; x < W; x++, i += 4) {
      if (p.d[i + 3] === 0) continue;
      const t = clamp01(1 - far2(x, y, lx, ly) / far);
      const q = band(t * t, bands);
      if (q > 0) toward(p.d, i, c, (q / bands) * max);
    }
  }
}

/** Shade a filled shape from tones that run dark to light: by how near the light each pixel is, and whatever else `extra` says. */
function shade(l: Px, tones: Tones, lx: number, ly: number, far: number, extra?: (x: number, y: number) => number): void {
  const n = tones.length;
  for (let y = 0, i = 3; y < H; y++) {
    for (let x = 0; x < W; x++, i += 4) {
      if (l.d[i] === 0) continue;
      const v = 1 - far2(x, y, lx, ly) / far + (extra ? extra(x, y) : 0);
      l.set(x, y, tones[Math.max(0, Math.min(n - 1, Math.floor(v * n)))]);
    }
  }
}

/** Light catching the edge of a shape that faces (dx, dy): a warm rim from a fire behind, say. */
function rim(l: Px, dx: number, dy: number, col: string, t: number, deep = 1): void {
  const c = rgba(col);
  const has = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) has[i] = l.d[i * 4 + 3] > 0 ? 1 : 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!has[y * W + x]) continue;
      for (let k = 1; k <= deep; k++) {
        const nx = x + dx * k;
        const ny = y + dy * k;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || !has[ny * W + nx]) {
          toward(l.d, (y * W + x) * 4, c, t * (1 - (k - 1) / (deep + 1)));
          break;
        }
      }
    }
  }
}

/** A limb: a thick line, of one width at each end. */
function limb(l: Px, a: Pt, b: Pt, r0: number, r1: number, c: string): void {
  const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]));
  for (let i = 0; i <= n; i++) {
    const t = n === 0 ? 0 : i / n;
    const r = r0 + (r1 - r0) * t;
    l.ellipse(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, r, r, c);
  }
}

/** A small rune, three pixels wide and five tall. */
function rune(p: Px, k: number, x: number, y: number, c: string): void {
  const marks: ReadonlyArray<ReadonlyArray<Pt>> = [
    [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [0, 1], [2, 1]],
    [[1, 0], [0, 1], [2, 1], [1, 2], [1, 3], [1, 4]],
    [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 1], [2, 0], [1, 3], [2, 2]],
    [[2, 0], [1, 1], [0, 2], [1, 2], [2, 2], [1, 3], [0, 4]],
    [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [2, 1], [2, 3]],
  ];
  for (const [mx, my] of marks[((k % marks.length) + marks.length) % marks.length]) p.set(x + mx, y + my, c);
}

/** THE WORD: the bound rune that stands on his table, alight. `s`: its size. */
function word(p: Px, x: number, y: number, s: number): void {
  const strokes: ReadonlyArray<readonly [number, number, number, number]> = [
    [0, -3, 0, 3],
    [0, -3, -1, -2],
    [0, -3, 1, -2],
    [-1, -0.5, 0, -1.5],
    [0, -1.5, 1, -0.5],
    [1, -0.5, 0, 0.5],
    [0, 0.5, -1, -0.5],
    [-1, 1.7, 0, 0.7],
    [0, 0.7, 1, 1.7],
    [1, 1.7, 0, 2.7],
    [0, 2.7, -1, 1.7],
  ];
  const halo = lay();
  for (const [a, b, c, d] of strokes) {
    for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) halo.line(x + a * s + ox, y + b * s + oy, x + c * s + ox, y + d * s + oy, GLOW);
  }
  over(p, halo, null);
  for (const [a, b, c, d] of strokes) p.line(x + a * s, y + b * s, x + c * s, y + d * s, WHITE);
}

// ---------------------------------------------------------------------------------------------
// The room's furniture

/** A wall of dressed stone, in courses. */
function wall(p: Px, t: Tones = WALL_T): void {
  p.rect(0, 0, W, H, t[2]);
  for (let row = 0, y = 2; y < H; row++, y += 9) {
    p.hline(0, y, W, t[0]);
    for (let x = (row % 2) * 9 + 4; x < W; x += 18) {
      p.vline(x, y, 9, t[0]);
      if (rnd(x, row) < 0.4) p.hline(x + 1, y + 1, 12 + Math.floor(rnd(row, x) * 5), t[3]);
      if (rnd(x + 3, row) < 0.25) p.rect(x + 2, y + 2, 15, 6, t[1]);
    }
  }
}

/** A tall window with the night in it, and the moon. */
function nightWindow(p: Px, x: number, y: number, w: number, h: number): void {
  p.rect(x - 2, y - 2, w + 4, h + 4, WALL_T[4]);
  const sky = ['#12164a', '#1a2060', '#262e78', '#343e90', '#4650a8'];
  for (let j = 0; j < h; j++) p.hline(x, y + j, w, sky[Math.min(4, Math.floor((j / h) * 5))]);
  // an arched head: the corners go back to stone
  for (let j = 0; j < 5; j++) {
    const cut = [5, 3, 2, 1, 1][j];
    p.hline(x, y + j, cut, WALL_T[4]);
    p.hline(x + w - cut, y + j, cut, WALL_T[4]);
  }
  for (let k = 0; k < 7; k++) p.set(x + 2 + Math.floor(rnd(k, 5) * (w - 4)), y + 6 + Math.floor(rnd(k, 9) * (h * 0.6)), '#b8c8ff');
  p.ellipse(x + w * 0.62, y + h * 0.3, 4.5, 4.5, '#e9fdff');
  p.ellipse(x + w * 0.62 + 2, y + h * 0.3 - 1.5, 3.5, 3.5, sky[1]);
  // bars
  p.vline(x + Math.floor(w / 2), y, h, WALL_T[1]);
  for (let j = 12; j < h; j += 14) p.hline(x, y + j, w, WALL_T[1]);
  p.hline(x - 3, y + h + 2, w + 6, WALL_T[4]);
  p.hline(x - 3, y + h + 3, w + 6, WALL_T[1]);
}

/** A rack of rune stones: what the library's shelves of books were. */
function rack(p: Px, x: number, y: number, w: number, h: number, seed: number, warm = false): void {
  const wood = warm ? OAK_T : WOOD_T;
  p.rect(x - 2, y - 2, w + 4, h + 4, wood[2]);
  p.rect(x, y, w, h, warm ? '#0e0a0c' : '#0c0a22');
  const stones = warm ? ['#4d4252', '#655868', '#857888', '#6f584a', '#8c7460', '#a39a82', '#3a3040', '#7a879c', '#a82810', '#2e5a4a', '#b87a1c'] : ['#2a2e6e', '#3a4088', '#5660ac', '#2a2866', '#4d2d5a', '#3c3a86', '#683f70', '#1f4a6a'];
  for (let sy = y + 13, row = 0; sy <= y + h; sy += 14, row++) {
    let sx = x + 1;
    while (sx < x + w - 3) {
      const r = rnd(sx + seed * 31, row + seed);
      const tw = 3 + Math.floor(r * 3);
      const th = 7 + Math.floor(rnd(row + seed, sx) * 5);
      if (r > 0.12 && sx + tw <= x + w - 1) {
        const c = stones[Math.floor(rnd(sx, row + seed * 7) * stones.length)];
        p.rect(sx, sy - th, tw, th, c);
        p.vline(sx, sy - th, th, warm ? '#cfc6d2' : '#7e8ad0');
        if (rnd(sx + 1, row + seed) < 0.45) p.set(sx + 1, sy - th + 2 + Math.floor(rnd(sx, seed) * 3), GLOW);
      }
      sx += tw + 1;
    }
    p.rect(x - 2, sy, w + 4, 2, wood[3]);
    p.hline(x - 2, sy + 1, w + 4, wood[1]);
  }
}

/** Tools hung on the wall: tongs, a hammer, a chain. */
function hungTools(p: Px, x: number, y: number): void {
  const dk = STEEL_T[2];
  const lt = STEEL_T[4];
  p.hline(x - 2, y, 26, WOOD_T[3]);
  p.hline(x - 2, y + 1, 26, WOOD_T[1]);
  // tongs
  p.line(x + 2, y + 2, x + 1, y + 24, dk);
  p.line(x + 4, y + 2, x + 5, y + 24, dk);
  p.line(x + 1, y + 24, x + 3, y + 30, lt);
  p.line(x + 5, y + 24, x + 3, y + 30, lt);
  // a hammer, head down
  p.vline(x + 11, y + 2, 20, WOOD_T[3]);
  p.rect(x + 8, y + 20, 7, 5, dk);
  p.hline(x + 8, y + 20, 7, lt);
  // a chain
  for (let j = 2; j < 34; j += 3) p.rect(x + 19 + (j % 2), y + j, 2, 2, j % 2 ? dk : lt);
}

/** The forge table seen from about the height of its top: a thin strip of top, and a great front. */
function slab(p: Px, top: number, x0: number, x1: number, t: Tones = SLAB_T, iron: Tones = STEEL_T): void {
  p.rect(x0, top + 3, x1 - x0, H - top - 3, t[2]);
  // dressed blocks in the front
  for (let x = x0 + 22; x < x1 - 8; x += 38) p.vline(x, top + 16, H, t[1]);
  p.hline(x0, top + 16, x1 - x0, t[1]);
  p.hline(x0, top + 17, x1 - x0, t[3]);
  // the band of runes cut along the top of the front
  p.rect(x0, top + 5, x1 - x0, 9, t[1]);
  for (let x = x0 + 5, k = 0; x < x1 - 4; x += 9, k++) rune(p, k, x, top + 7, k % 4 === 1 ? GLOW : '#1898b4');
  // iron bands
  for (const bx of [x0 + 8, x1 - 12]) {
    p.rect(bx, top + 3, 4, H - top - 3, iron[1]);
    p.vline(bx, top + 3, H - top - 3, iron[3]);
    for (let y = top + 8; y < H; y += 10) p.set(bx + 2, y, iron[5]);
  }
  // the top: a lip that overhangs, lit along its edge
  p.rect(x0 - 3, top, x1 - x0 + 6, 3, t[4]);
  p.hline(x0 - 3, top, x1 - x0 + 6, t[5]);
  p.hline(x0 - 3, top + 3, x1 - x0 + 6, t[0]);
}

/** The pool of the word's light on the table's top. */
function pool(p: Px, x: number, top: number, half: number): void {
  for (let dx = -half; dx <= half; dx++) {
    const t = 1 - Math.abs(dx) / half;
    const c = t > 0.75 ? WHITE : t > 0.5 ? CYAN[3] : t > 0.25 ? GLOW : '#1898b4';
    if (t > 0.2 || (dx + half) % 3 !== 0) p.set(x + dx, top, c);
    if (t > 0.45) p.set(x + dx, top + 1, t > 0.7 ? CYAN[3] : GLOW);
  }
}

/** A hammer lying on the table. */
function lyingHammer(p: Px, x: number, y: number): void {
  p.hline(x, y, 16, WOOD_T[3]);
  p.hline(x, y + 1, 16, WOOD_T[1]);
  p.rect(x + 14, y - 3, 6, 6, STEEL_T[3]);
  p.hline(x + 14, y - 3, 6, STEEL_T[5]);
  p.vline(x + 14, y - 3, 6, STEEL_T[1]);
}

/** A few rune stones stacked on the table. */
function stack(p: Px, x: number, y: number): void {
  p.rect(x, y - 3, 12, 3, '#3a4088');
  p.hline(x, y - 3, 12, '#7e8ad0');
  p.rect(x + 1, y - 6, 10, 3, '#4d2d5a');
  p.hline(x + 1, y - 6, 10, '#a0728e');
  p.rect(x + 3, y - 9, 8, 3, '#2a2e6e');
  p.hline(x + 3, y - 9, 8, '#5660ac');
  p.set(x + 6, y - 8, GLOW);
}

// ---------------------------------------------------------------------------------------------
// The old skald, from in front: blocked in

interface Sk {
  cx: number;
  /** The line of his eyes. */
  ey: number;
  /** His size: 1 = a head eighteen pixels across. */
  u: number;
  /** Where the table's top is: he is cut off by it. */
  table: number;
  /** Where his hands are planted. */
  hands: readonly [Pt, Pt];
  /** Half the width of a hand. */
  hand: number;
  /** The light under him. */
  lx: number;
  ly: number;
  far: number;
}

interface Painted {
  /** His parts, in the order they are laid down. */
  parts: Px[];
  /** His hands: laid down after the table. */
  hands: Px[];
}

function skald(o: Sk, k: Look = COLD): Painted {
  const X = (k: number): number => o.cx + k * o.u;
  const Y = (k: number): number => o.ey + k * o.u;
  const u = o.u;
  const lit = (l: Px, t: Tones, extra?: (x: number, y: number) => number): void => shade(l, t, o.lx, o.ly, o.far, extra);
  const parts: Px[] = [];

  const cloak = lay();
  cloak.poly([[X(-30), Y(12)], [X(-44), o.table], [X(44), o.table], [X(30), Y(12)]], k.cloak[3]);
  lit(cloak, k.cloak, (x) => -0.25 + (Math.floor(x / (3 * u)) % 2) * 0.1);
  parts.push(cloak);

  const tunic = lay();
  tunic.poly([[X(-21), Y(14)], [X(-26), o.table], [X(26), o.table], [X(21), Y(14)]], k.mail[4]);
  lit(tunic, k.mail, (x, y) => -0.1 + ((x + y) % 2) * 0.06);
  parts.push(tunic);

  // arms: elbows out, the weight on the hands
  for (const s of [-1, 1] as const) {
    const hd = o.hands[s < 0 ? 0 : 1];
    const sh: Pt = [X(s * 27), Y(19)];
    const el: Pt = [hd[0] + s * 9 * u, (sh[1] + hd[1]) / 2 + 3 * u];
    const upper = lay();
    limb(upper, sh, el, 6.5 * u, 5.5 * u, k.mail[4]);
    lit(upper, k.mail, () => -0.05);
    parts.push(upper);
    const fore = lay();
    limb(fore, el, [hd[0], hd[1] - 2 * u], 5.2 * u, 4.2 * u, k.hide[3]);
    lit(fore, k.hide, (x, y) => (Math.floor((y + x * s * 0.5) / (2.5 * u)) % 2 ? 0.08 : -0.04));
    parts.push(fore);
  }

  const pelt = lay();
  pelt.poly(
    [
      [X(-37), Y(24)], [X(-34), Y(12)], [X(-19), Y(5)], [X(0), Y(8)], [X(19), Y(5)], [X(34), Y(12)], [X(37), Y(24)],
      [X(31), Y(28)], [X(25), Y(24)], [X(19), Y(29)], [X(13), Y(25)], [X(7), Y(30)], [X(0), Y(26)],
      [X(-7), Y(30)], [X(-13), Y(25)], [X(-19), Y(29)], [X(-25), Y(24)], [X(-31), Y(28)],
    ],
    k.pelt[3],
  );
  lit(pelt, k.pelt, (x, y) => (rnd(Math.floor(x / u), Math.floor(y / (2 * u))) - 0.5) * 0.3 + 0.08);
  parts.push(pelt);

  const hair = lay();
  hair.ellipse(X(0), Y(-5), 13 * u, 13 * u, k.hair[5]);
  for (const s of [-1, 1] as const) {
    hair.poly([[X(s * 12), Y(-8)], [X(s * 17), Y(8)], [X(s * 18), Y(25)], [X(s * 13), Y(29)], [X(s * 9), Y(26)], [X(s * 8), Y(2)]], k.hair[5]);
  }
  // (light from below: the crown of his head is in the dark, the ends of his hair are bright)
  lit(hair, k.hair, (x, y) => 0.12 - clamp01((Y(2) - y) / (22 * u)) * 0.5 + (Math.floor(x / u) % 3 === 0 ? -0.08 : 0));
  parts.push(hair);

  const face = lay();
  face.poly([[X(-9), Y(-8)], [X(9), Y(-8)], [X(10), Y(3)], [X(7), Y(9)], [X(-7), Y(9)], [X(-10), Y(3)]], k.skin[4]);
  // (the under side of everything is what is bright: cheeks, the tip of the nose; the brow is dark)
  lit(face, k.skin, (x, y) => 0.1 - clamp01((Y(3) - y) / (12 * u)) * 0.42 - (Math.abs(x - o.cx) / (10 * u)) * 0.12);
  // the hollows of his eyes
  for (const s of [-1, 1] as const) face.rect(X(s * 5 - 3), Y(-4), Math.ceil(6 * u), Math.ceil(3.2 * u), k.skin[1]);
  // his nose: a ridge in the dark, lit under the tip, and the shadow it throws UP his brow
  face.rect(X(-1.5), Y(-5), Math.ceil(3 * u), Math.ceil(7 * u), k.skin[3]);
  face.rect(X(-2.5), Y(1), Math.ceil(5 * u), Math.ceil(2 * u), k.skin[6]);
  face.hline(X(-2.5), Y(3) - 1, Math.ceil(5 * u), k.skin[7]);
  parts.push(face);

  const beard = lay();
  beard.poly([[X(-10), Y(2)], [X(-13), Y(12)], [X(-9), Y(24)], [X(0), Y(34)], [X(9), Y(24)], [X(13), Y(12)], [X(10), Y(2)], [X(5), Y(5)], [X(0), Y(4)], [X(-5), Y(5)]], k.hair[6]);
  lit(beard, k.hair, (x, y) => 0.14 - (Math.abs(x - o.cx) / (13 * u)) * 0.3 + (Math.floor((x - o.cx) / Math.max(1, u)) % 2 === 0 ? 0.05 : -0.05) - clamp01((Y(10) - y) / (10 * u)) * 0.1);
  // his moustache, and the dark of his mouth under it
  for (const s of [-1, 1] as const) beard.poly([[X(0), Y(3)], [X(s * 8), Y(5)], [X(s * 11.5), Y(12)], [X(s * 6), Y(8.5)], [X(0), Y(7)]], k.hair[8]);
  beard.rect(X(-2.5), Y(7), Math.ceil(5 * u), Math.max(1, Math.round(1.4 * u)), k.hair[1]);
  parts.push(beard);

  const band = lay();
  band.rect(X(-10.5), Y(-11.5), Math.ceil(21 * u), Math.ceil(3.4 * u), k.steel[3]);
  band.hline(X(-10.5), Y(-8.1) - 1, Math.ceil(21 * u), k.steel[5]);
  band.rect(X(-2.2), Y(-12.5), Math.ceil(4.4 * u), Math.ceil(5.4 * u), k.steel[5]);
  band.rect(X(-1.2), Y(-11.5), Math.ceil(2.4 * u), Math.ceil(3.4 * u), GLOW);
  band.set(X(-0.4), Y(-10.6), WHITE);
  parts.push(band);

  const eyes = lay();
  for (const s of [-1, 1] as const) {
    // brows drawn down toward the nose
    eyes.line(X(s * 8.5), Y(-6.2), X(s * 2), Y(-4), k.hair[7]);
    if (u >= 1.5) eyes.line(X(s * 8.5), Y(-6.2) + 1, X(s * 2), Y(-4) + 1, k.hair[5]);
    const ex = Math.round(X(s * 5 - 1.6));
    const ew = Math.max(2, Math.round(3.4 * u));
    const eh = Math.max(1, Math.round(1.5 * u));
    eyes.rect(ex, Math.round(Y(-2.8)), ew, eh, GLOW);
    eyes.rect(ex + (s < 0 ? ew - Math.ceil(ew / 2) : 0), Math.round(Y(-2.8)), Math.ceil(ew / 2), eh, CYAN[3]);
    eyes.set(ex + (s < 0 ? ew - 1 : 0), Math.round(Y(-2.8)), WHITE);
  }
  parts.push(eyes);

  // his hands: fingers spread on the stone, toward us
  const hands: Px[] = [];
  for (const s of [-1, 1] as const) {
    const [hx, hy] = o.hands[s < 0 ? 0 : 1];
    const r = o.hand;
    const hand = lay();
    hand.ellipse(hx, hy - r * 0.2, r, r * 0.55, k.skin[4]);
    hand.rect(hx - r, hy - r * 0.1, 2 * r, r * 0.75, k.skin[4]);
    // the thumb, toward the middle
    hand.ellipse(hx - s * r * 1.05, hy + r * 0.1, r * 0.4, r * 0.3, k.skin[4]);
    lit(hand, k.skin, (x, y) => 0.2 + (y - hy) * 0.04);
    for (let f = 1; f < 4; f++) hand.vline(Math.round(hx - r + (2 * r * f) / 4), Math.round(hy + r * 0.15), Math.ceil(r * 0.5), k.skin[1]);
    hand.hline(Math.round(hx - r + 1), Math.round(hy - r * 0.05), Math.round(2 * r - 2), k.skin[6]);
    hands.push(hand);
  }
  return { parts, hands };
}

/** His shadow on what is behind him: the light is low and in front, so it is thrown up, bigger than he is. */
function thrown(p: Px, fig: Painted, lx: number, ly: number, grow: number, amount: number, below: number): void {
  const c = rgba(NIGHT);
  const mask = new Uint8Array(W * H);
  for (const part of fig.parts) for (let i = 0; i < W * H; i++) if (part.d[i * 4 + 3] > 0) mask[i] = 1;
  for (let y = 0; y < below; y++) {
    const fy = Math.round(ly + (y - ly) / grow);
    if (fy < 0 || fy >= H) continue;
    for (let x = 0; x < W; x++) {
      const fx = Math.round(lx + (x - lx) / grow);
      if (fx < 0 || fx >= W) continue;
      if (mask[fy * W + fx] === 1) toward(p.d, (y * W + x) * 4, c, amount);
    }
  }
}

// ---------------------------------------------------------------------------------------------
// 5  THE BIG DESK: the librarian's staging

function desk(): Px {
  const p = lay();
  const top = 78;
  const lx = CX;
  const ly = top - 8;
  wall(p);
  nightWindow(p, 10, 12, 20, 50);
  rack(p, 44, 8, 42, 68, 1);
  rack(p, 168, 8, 42, 68, 2);
  hungTools(p, 222, 14);
  const fig = skald({ cx: CX, ey: 38, u: 1, table: top, hands: [[92, top - 1], [162, top - 1]], hand: 7, lx, ly, far: 84 });
  glow(p, lx, ly, 86, GLOW, 0.22);
  gloom(p, lx, ly, 34, 150, NIGHT, 0.82);
  thrown(p, fig, lx, ly + 16, 1.55, 0.5, top);
  for (const part of fig.parts) over(p, part);
  const front = lay();
  slab(front, top, 28, 226);
  glow(front, lx, top, 70, GLOW, 0.3);
  gloom(front, lx, top, 50, 170, NIGHT, 0.75);
  over(p, front);
  pool(p, CX, top, 34);
  stack(p, 56, top);
  lyingHammer(p, 176, top - 2);
  for (const h of fig.hands) over(p, h);
  word(p, CX, top - 9, 2.2);
  return p;
}

// ---------------------------------------------------------------------------------------------
// 9  THE BIG DESK, WARM: the same staging in the colours of the library picture he likes (skin
// that is skin, oak, earth, a fire at one side), so that the word is the one cold light in a warm room

function deskWarm(): Px {
  const p = lay();
  const top = 78;
  const lx = CX;
  const ly = top - 8;
  const fx = 238;
  const fy = 62;
  wall(p, EARTH_T);
  nightWindow(p, 10, 12, 20, 50);
  rack(p, 44, 8, 42, 68, 1, true);
  rack(p, 162, 8, 40, 68, 2, true);
  // a hearth at the right hand, half off the picture
  const hearth = lay();
  hearth.rect(216, 34, 40, top - 34, '#2a0c10');
  hearth.ellipse(238, 36, 22, 16, '#2a0c10');
  for (let y = 18; y < top; y++) {
    for (let x = 214; x < W; x++) {
      if (!hearth.has(x, y)) continue;
      const t = clamp01((y - 20) / (top - 20));
      hearth.set(x, y, t > 0.86 ? EMBER[3] : t > 0.68 ? EMBER[2] : t > 0.5 ? EMBER[1] : t > 0.32 ? EMBER[0] : '#3a1010');
    }
  }
  over(p, hearth, '#0e0612');
  for (let k = 0; k < 5; k++) flame(p, 222 + k * 8, top - 1, 14 + rnd(k, 3) * 20, 3 + rnd(k, 8) * 2, k);
  for (let y = 22; y < top; y += 7) {
    p.rect(208, y, 7, 6, EARTH_T[4]);
    p.vline(214, y, 6, EMBER[1]);
  }
  const fig = skald({ cx: CX, ey: 38, u: 1, table: top, hands: [[92, top - 1], [162, top - 1]], hand: 7, lx, ly, far: 84 }, WARM);
  glow(p, fx, fy, 120, EMBER[2], 0.28);
  glow(p, lx, ly, 70, GLOW, 0.16);
  gloom(p, (lx + fx) / 2, ly, 60, 190, '#07050a', 0.8);
  thrown(p, fig, lx, ly + 16, 1.55, 0.45, top);
  for (const part of fig.parts) {
    rim(part, 1, 0, EMBER[2], 0.55);
    over(p, part, WARM.ink);
  }
  const front = lay();
  slab(front, top, 28, 226, OAK_T, WARM.steel);
  glow(front, lx, top, 60, GLOW, 0.22);
  glow(front, fx, top, 90, EMBER[1], 0.2);
  gloom(front, lx + 30, top, 60, 180, '#07050a', 0.7);
  over(p, front, WARM.ink);
  pool(p, CX, top, 34);
  stack(p, 56, top);
  lyingHammer(p, 176, top - 2);
  for (const h of fig.hands) {
    rim(h, 1, 0, EMBER[2], 0.4);
    over(p, h, WARM.ink);
  }
  word(p, CX, top - 9, 2.2);
  return p;
}

// ---------------------------------------------------------------------------------------------
// 7  AT THE FORGE: the fire behind him

/** A tongue of flame. */
function flame(p: Px, x: number, base: number, h: number, w: number, k: number): void {
  for (let j = 0; j < h; j++) {
    const t = j / h;
    const half = w * (1 - t) ** 0.8 * (0.8 + 0.2 * Math.sin(j * 0.9 + k));
    const sway = Math.sin(j * 0.35 + k * 2) * t * 3;
    for (let dx = -Math.ceil(half); dx <= Math.ceil(half); dx++) {
      if (Math.abs(dx) > half) continue;
      const core = 1 - Math.abs(dx) / (half + 0.01);
      const c = t < 0.25 && core > 0.5 ? EMBER[4] : core > 0.55 && t < 0.6 ? EMBER[3] : t < 0.75 ? EMBER[2] : EMBER[1];
      p.set(x + dx + sway, base - j, c);
    }
  }
}

function forge(): Px {
  const p = lay();
  const top = 78;
  const lx = CX;
  const ly = top - 8;
  wall(p, ['#1a0e26', '#24122e', '#2e1838', '#3c2044', '#4e2a50']);
  // the hearth: a great arch behind him, the fire in it
  const ax0 = 62;
  const ax1 = 192;
  const hearth = lay();
  hearth.rect(ax0, 30, ax1 - ax0, top - 30, '#2a0c10');
  hearth.ellipse(CX, 32, (ax1 - ax0) / 2, 26, '#2a0c10');
  for (let y = 6; y < top; y++) {
    for (let x = ax0; x < ax1; x++) {
      if (!hearth.has(x, y)) continue;
      const t = clamp01((y - 8) / (top - 8)) - Math.abs(x - CX) / 260;
      hearth.set(x, y, t > 0.9 ? EMBER[3] : t > 0.74 ? EMBER[2] : t > 0.56 ? EMBER[1] : t > 0.4 ? EMBER[0] : t > 0.24 ? '#5a1c1c' : '#2a0c10');
    }
  }
  over(p, hearth, '#0e0612');
  // the stones of the arch, lit on their inner edge
  for (let a = 0; a <= 16; a++) {
    const t = (a / 16) * Math.PI;
    const x = CX - Math.cos(t) * ((ax1 - ax0) / 2 + 4);
    const y = 32 - Math.sin(t) * 30;
    p.rect(x - 3, y - 3, 7, 6, a % 2 ? '#3c2044' : '#4e2a50');
    p.set(x - Math.cos(t) * -3, y + 3, EMBER[1]);
  }
  for (let y = 34; y < top; y += 7) {
    p.rect(ax0 - 8, y, 7, 6, '#3c2044');
    p.vline(ax0 - 2, y, 6, EMBER[1]);
    p.rect(ax1 + 1, y, 7, 6, '#3c2044');
    p.vline(ax1 + 1, y, 6, EMBER[1]);
  }
  // the fire itself
  for (let k = 0; k < 13; k++) flame(p, ax0 + 8 + k * 9.5, top - 1, 20 + rnd(k, 3) * 26, 4 + rnd(k, 8) * 3, k);
  hungTools(p, 16, 12);
  hungTools(p, 214, 12);
  // sparks
  for (let k = 0; k < 26; k++) p.set(ax0 + 6 + rnd(k, 1) * (ax1 - ax0 - 12), 8 + rnd(k, 2) * 50, rnd(k, 4) < 0.5 ? EMBER[3] : EMBER[2]);
  gloom(p, CX, 60, 60, 190, NIGHT, 0.8);
  const fig = skald({ cx: CX, ey: 38, u: 1, table: top, hands: [[92, top - 1], [162, top - 1]], hand: 7, lx, ly, far: 62 });
  fig.parts.forEach((part, i) => {
    // (the fire is behind him: he is dark against it, with its light along his edges. Not his
    // eyes or the stone on his brow: those are his own light, and stay the colour of the word)
    if (i < fig.parts.length - 2) {
      gloom(part, lx, ly, 10, 70, '#12081a', 0.5);
      rim(part, -1, 0, EMBER[2], 0.85);
      rim(part, 1, 0, EMBER[2], 0.85);
      rim(part, 0, -1, EMBER[3], 0.9);
    }
    over(p, part);
  });
  const front = lay();
  slab(front, top, 28, 226);
  glow(front, lx, top, 60, GLOW, 0.3);
  gloom(front, lx, top, 40, 160, NIGHT, 0.8);
  over(p, front);
  // an anvil on the table, dark against the fire
  const anvil = lay();
  anvil.rect(196, top - 12, 18, 5, STEEL_T[1]);
  anvil.poly([[214, top - 12], [222, top - 10], [214, top - 8]], STEEL_T[1]);
  anvil.rect(201, top - 7, 8, 4, STEEL_T[0]);
  anvil.rect(198, top - 3, 14, 3, STEEL_T[1]);
  rim(anvil, 0, -1, EMBER[2], 0.9);
  over(p, anvil);
  pool(p, CX, top, 34);
  lyingHammer(p, 40, top - 2);
  for (const h of fig.hands) {
    rim(h, 0, -1, EMBER[2], 0.5);
    over(p, h);
  }
  word(p, CX, top - 9, 2.2);
  return p;
}

// ---------------------------------------------------------------------------------------------
// 8  CLOSE: his face and his hands

function close(): Px {
  const p = lay();
  const top = 99;
  const lx = CX;
  const ly = top - 6;
  wall(p);
  gloom(p, lx, ly, 20, 120, NIGHT, 0.92);
  const fig = skald({ cx: CX, ey: 37, u: 2, table: top, hands: [[58, top - 2], [196, top - 2]], hand: 14, lx, ly, far: 118 });
  thrown(p, fig, lx, ly + 20, 1.3, 0.6, top);
  for (const part of fig.parts) over(p, part);
  const front = lay();
  front.rect(0, top, W, H - top, SLAB_T[2]);
  front.hline(0, top, W, SLAB_T[5]);
  front.hline(0, top + 1, W, SLAB_T[4]);
  for (let x = 4, k = 0; x < W; x += 11, k++) rune(front, k, x, top + 4, k % 3 === 1 ? GLOW : '#1898b4');
  glow(front, lx, top, 80, GLOW, 0.35);
  gloom(front, lx, top, 60, 170, NIGHT, 0.7);
  over(p, front, null);
  pool(p, CX, top, 46);
  for (const h of fig.hands) over(p, h);
  word(p, CX, top - 12, 3.4);
  // (the top of the picture is where the name of the game goes: his crown is in the dark there)
  return p;
}

/** The forge's arch as it is seen from the floor: its sides lean in with everything else, and the fire fills it. */
function hearthAbove(p: Px, up: (x: number, y: number) => number, lip: number): void {
  const hearth = lay();
  const topY = 16;
  hearth.poly([[up(26, lip), lip], [up(228, lip), lip], [up(228, topY), topY], [up(26, topY), topY]], '#2a0c10');
  hearth.ellipse(CX, topY, (up(228, topY) - up(26, topY)) / 2, 13, '#2a0c10');
  for (let y = 0; y < lip; y++) {
    for (let x = 0; x < W; x++) {
      if (!hearth.has(x, y)) continue;
      const t = clamp01((y - 4) / (lip - 4)) - Math.abs(x - CX) / 420;
      hearth.set(x, y, t > 0.88 ? EMBER[3] : t > 0.72 ? EMBER[2] : t > 0.54 ? EMBER[1] : t > 0.38 ? EMBER[0] : t > 0.22 ? '#5a1c1c' : '#2a0c10');
    }
  }
  over(p, hearth, '#0e0612');
  for (let y = topY + 4; y < lip; y += 7) {
    for (const side of [26, 228]) {
      const x = Math.round(up(side, y));
      p.rect(side === 26 ? x - 7 : x + 1, y, 7, 6, EARTH_T[4]);
      p.vline(side === 26 ? x - 1 : x + 1, y, 6, EMBER[1]);
    }
  }
  for (let f = 0; f < 17; f++) flame(p, up(26, lip) + 8 + f * 9.6, lip - 2, 18 + rnd(f, 3) * 28, 4 + rnd(f, 8) * 3, f);
  for (let f = 0; f < 22; f++) p.set(up(30, 30) + rnd(f, 1) * 170, 6 + rnd(f, 2) * 50, rnd(f, 4) < 0.5 ? EMBER[3] : EMBER[2]);
}

// ---------------------------------------------------------------------------------------------
// 6  FROM THE FLOOR: a real look up. Everything upright leans in toward a point far overhead.

/** What can be changed about the look up from the floor (sketch 6 is all of them left alone). */
interface FloorOpt {
  /** The forge blazing behind him, in the warm colours (sketch 10). */
  fire?: boolean;
  /** How big he is: 1 = sketch 6. */
  size?: number;
  /** The row of the table's edge. */
  lip?: number;
  /** His head brought down toward us and so bigger: 0 = as in sketch 6, 1 = right over the edge. */
  leanIn?: number;
  /** His fingers curled over the edge and down its front, instead of fists resting on it. */
  fingers?: boolean;
  /** His stave in one hand, running up out of the picture, a rune alight in its ring. */
  stave?: boolean;
  /** The word held up over the table, all of it in view. */
  wordUp?: boolean;
  /** A great round window behind him with the night and the moon in it. (Tried, and muddled behind the name of the game: not on a sheet.) */
  moon?: boolean;
  /** A brazier burning at either hand, seen from under its bowl: two warm lights in the cold. */
  braziers?: boolean;
  // (19:43: "and maybe some other luminescent options")
  /** Every rune cut in the stones and along the table is alight. */
  runesAlight?: boolean;
  /** A lantern of the word's own light hung on a chain at either hand. */
  lanterns?: boolean;
  /** Runes rise off the word all round him. */
  rising?: boolean;
  /** A shaft of moonlight comes down across him from high on one side. */
  moonbeam?: boolean;
  /** The light of the word runs out through the stone in veins: down the front of the table, up the standing stones. */
  veins?: boolean;
}

function floor(o: FloorOpt = {}): Px {
  const fire = o.fire === true;
  const k = fire ? WARM : COLD;
  const size = o.size ?? 1;
  const lip = o.lip ?? 80;
  const leanIn = o.leanIn ?? 0;
  const p = lay();
  const VX = CX;
  const VY = -150;
  /** Where a point at (x, y) on an upright that stands at x on the floor line is seen. */
  const up = (x: number, y: number): number => VX + (x - VX) * ((y - VY) / (H - VY));
  /** His own measure: across from his middle line, and rows as they were in sketch 6 (whose table edge was row 80). */
  const X = (dx: number): number => CX + dx * size;
  const Y = (y: number): number => lip - (80 - y) * size;
  /** His head's: it comes down and grows as he leans in. */
  const hs = size * (1 + 0.45 * leanIn);
  const headY = Y(22) + leanIn * 13 * size;
  const HX = (dx: number): number => CX + dx * hs;
  const HY = (y: number): number => headY + (y - 22) * hs;
  const lx = CX;
  const ly = lip - 12;
  // the vault overhead: dark, its ribs running up to the crown
  const wt = fire ? EARTH_T : WALL_T;
  p.rect(0, 0, W, H, wt[1]);
  for (let rib = -6; rib <= 6; rib++) {
    if (rib === 0) continue;
    const x0 = CX + rib * 34;
    for (let y = 0; y < lip; y++) {
      const t = 1 - y / lip;
      const x = Math.round(CX + (x0 - CX) * (1 - t * t * 0.85));
      p.set(x, y, wt[3]);
      p.set(x + (rib < 0 ? 1 : -1), y, wt[0]);
    }
  }
  for (const ry of [10, 24, 42, 62]) {
    for (let x = 0; x < W; x++) {
      const y = Math.round(ry - Math.cos(((x - CX) / CX) * 1.3) * (ry * 0.5 + 6) + ry * 0.5);
      p.set(x, y, wt[0]);
    }
  }
  if (fire) hearthAbove(p, up, lip);
  if (o.moon) {
    // a great round window high in the wall behind him: the night, the moon, and stone tracery
    const win = lay();
    const wy = 30;
    const wr = 44;
    win.ellipse(CX, wy, wr + 4, (wr + 4) * 0.9, WALL_T[4]);
    const sky = ['#101444', '#182060', '#243080', '#34449c', '#4a5cb8'];
    for (let y = wy - wr; y < wy + wr; y++) {
      for (let x = CX - wr; x < CX + wr; x++) {
        const d = Math.hypot(x + 0.5 - CX, (y + 0.5 - wy) / 0.9);
        if (d < wr) win.set(x, y, sky[Math.min(4, Math.floor(((y - (wy - wr)) / (2 * wr)) * 5))]);
      }
    }
    // the moon, off to one side so that his head does not hide it
    win.ellipse(CX - 22, wy - 8, 11, 11, '#e9fdff');
    win.ellipse(CX - 25, wy - 11, 3, 2.5, '#b8c8f0');
    win.ellipse(CX - 18, wy - 4, 2, 2, '#b8c8f0');
    for (let s = 0; s < 9; s++) win.set(CX + 6 + Math.floor(rnd(s, 2) * 34), wy - 30 + Math.floor(rnd(s, 7) * 40), '#d8e4ff');
    // tracery: spokes and a ring
    for (let a = 0; a < 8; a++) {
      const t = (a / 8) * Math.PI * 2 + 0.2;
      win.line(CX, wy, CX + Math.cos(t) * wr, wy + Math.sin(t) * wr * 0.9, WALL_T[1]);
    }
    for (let a = 0; a < 80; a++) {
      const t = (a / 80) * Math.PI * 2;
      win.set(CX + Math.cos(t) * wr * 0.55, wy + Math.sin(t) * wr * 0.5, WALL_T[1]);
    }
    over(p, win, WALL_T[0]);
  }
  // the standing stones, leaning in over us
  const stone = (x0: number, x1: number, seed: number): void => {
    const l = lay();
    l.poly([[x0, H], [x1, H], [up(x1, -6), -6], [up(x0, -6), -6]], '#3a4088');
    const tone = fire ? ['#a89cab', '#857888', '#655868', '#3a3040'] : ['#7e8ad0', '#5660ac', '#3a4088', '#262a62'];
    const lightSide = x0 < CX ? 1 : -1;
    for (let y = 0; y < H; y++) {
      const a = Math.min(up(x0, y), up(x1, y));
      const b = Math.max(up(x0, y), up(x1, y));
      for (let x = Math.floor(a); x <= Math.ceil(b); x++) {
        if (!l.has(x, y)) continue;
        const t = (x - a) / Math.max(1, b - a);
        const v = lightSide > 0 ? t : 1 - t;
        l.set(x, y, v > 0.82 ? tone[0] : v > 0.55 ? tone[1] : v > 0.25 ? tone[2] : tone[3]);
      }
    }
    const lit: Pt[] = [];
    for (let r = 0; r < (o.runesAlight ? 7 : 4); r++) {
      const y = o.runesAlight ? 6 + r * 14 : 14 + r * 20;
      const rx = Math.round((up(x0, y) + up(x1, y)) / 2) - 1;
      if (o.runesAlight) {
        for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) rune(l, seed + r, rx + ox, y + oy, GLOW);
        rune(l, seed + r, rx, y, WHITE);
        lit.push([rx + 1, y + 2]);
      } else rune(l, seed + r, rx, y, r % 2 ? GLOW : '#1898b4');
    }
    if (fire) rim(l, lightSide, 0, EMBER[2], 0.6, 2);
    over(p, l, k.ink);
    for (const [gx, gy] of lit) glowSoft.push([gx, gy]);
  };
  /** Small lights whose glow is laid on once everything behind him is down. */
  const glowSoft: Pt[] = [];
  stone(-6, 26, 0);
  stone(228, 260, 3);
  // (with the forge behind him the two inner stones would stand in front of its arch: they are left out)
  if (!fire) {
    stone(40, 60, 1);
    stone(194, 214, 2);
  }
  gloom(p, lx, ly, fire ? 60 : 30, fire ? 190 : o.moon ? 190 : 150, fire ? '#07050a' : NIGHT, fire ? 0.78 : o.moon ? 0.7 : 0.86);
  if (!fire) glow(p, lx, ly - 10, 70, GLOW, 0.2);
  /** Where the two braziers' bowls are. */
  const bowls: Pt[] = o.braziers ? [[Math.round(up(CX - 96, 40)), 40], [Math.round(up(CX + 96, 40)), 40]] : [];
  for (const [bx, by] of bowls) glow(p, bx, by - 6, 52, EMBER[2], 0.42);
  for (const [gx, gy] of glowSoft) glow(p, gx, gy, 11, GLOW, 0.5);
  /** Where the two lanterns hang. */
  const lamps: Pt[] = o.lanterns ? [[Math.round(up(CX - 92, 36)), 36], [Math.round(up(CX + 92, 36)), 36]] : [];
  for (const [bx, by] of lamps) glow(p, bx, by, 50, GLOW, 0.5);
  // the moon: a shaft of its light from high on our left, down across him to the table
  const inBeam = (x: number, y: number): boolean => {
    const t = y / lip;
    const a = 34 + t * 62;
    const b = 78 + t * 96;
    return x >= a && x <= b;
  };
  if (o.moonbeam) {
    const c = rgba('#c8d8ff');
    for (let y = 0; y < lip - 4; y++) {
      for (let x = 0; x < W; x++) {
        if (!inBeam(x, y)) continue;
        toward(p.d, (y * W + x) * 4, c, (x + y) % 2 === 0 ? 0.3 : 0.16);
      }
    }
  }

  // --- him, foreshortened: what is low on him is near and big, his head is far up and small ---
  const lit = (l: Px, t: Tones, extra?: (x: number, y: number) => number): void => shade(l, t, lx, ly, 74 * size, extra);
  const parts: Px[] = [];
  const cloak = lay();
  cloak.poly([[X(-52), lip], [X(-30), Y(30)], [X(30), Y(30)], [X(52), lip]], k.cloak[3]);
  lit(cloak, k.cloak, (x) => -0.3 + (Math.floor(x / 4) % 2) * 0.08);
  parts.push(cloak);
  const chest = lay();
  chest.poly([[X(-36), lip], [X(-24), Y(34)], [X(24), Y(34)], [X(36), lip]], k.mail[4]);
  lit(chest, k.mail, (x, y) => -0.05 + ((x + y) % 2) * 0.06);
  parts.push(chest);
  // the stave: in his right hand (our left), up past his shoulder and out of the picture, leaning in with the stones
  const staveFoot = 34;
  if (o.stave) {
    const stave = lay();
    for (let y = 12; y < lip + 2; y++) {
      const x = Math.round(up(staveFoot, y));
      stave.set(x - 1, y, k.hide[5]);
      stave.set(x, y, k.hide[4]);
      stave.set(x + 1, y, k.hide[2]);
      if (y % 9 === 4) stave.set(x, y, GLOW);
    }
    const rx = Math.round(up(staveFoot, 8));
    stave.ellipse(rx + 0.5, 8, 7, 7, k.steel[4]);
    stave.ellipse(rx + 0.5, 8, 4.5, 4.5, '#0c0a22');
    over(p, stave, k.ink);
    rune(p, 1, rx - 1, 6, WHITE);
    glow(p, rx + 0.5, 8, 18, GLOW, 0.5);
  }
  // arms coming down at us to the edge of the table
  const hands: readonly Pt[] = [[o.stave ? Math.round(up(staveFoot, lip - 16)) : X(-46), o.stave ? lip - 16 : lip - 2], [X(46), lip - 2]];
  for (const s of [-1, 1] as const) {
    const hd = hands[s < 0 ? 0 : 1];
    const sh: Pt = [X(s * 27), Y(38)];
    // (the arm that holds the stave is out to the side, its elbow lower)
    const el: Pt = o.stave && s < 0 ? [X(-44), Y(58)] : [X(s * 50), Y(54)];
    const upper = lay();
    limb(upper, sh, el, 6 * size, 7 * size, k.mail[4]);
    lit(upper, k.mail, () => -0.08);
    parts.push(upper);
    const fore = lay();
    limb(fore, el, o.stave && s < 0 ? [hd[0] + 6, hd[1]] : [hd[0], hd[1] - 4 * size], 7 * size, o.stave && s < 0 ? 6 : 8.5 * size, k.hide[3]);
    lit(fore, k.hide, (x, y) => (Math.floor((y + x * s * 0.6) / 3) % 2 ? 0.1 : -0.02));
    parts.push(fore);
  }
  const pelt = lay();
  pelt.poly(
    (
      [
        [-33, 44], [-30, 34], [-16, 27], [0, 29], [16, 27], [30, 34], [33, 44],
        [27, 47], [21, 43], [15, 48], [9, 44], [3, 49], [-3, 49], [-9, 44], [-15, 48], [-21, 43], [-27, 47],
      ] as const
    ).map(([dx, y]): Pt => [X(dx), Y(y)]),
    k.pelt[3],
  );
  lit(pelt, k.pelt, (x, y) => (rnd(x, Math.floor(y / 2)) - 0.5) * 0.3 + (y - Y(36)) * 0.02);
  parts.push(pelt);
  // his head, far up: we see under his chin, under his nose, under his brow
  const hair = lay();
  hair.ellipse(HX(0), HY(22), 10.5 * hs, 8 * hs, k.hair[4]);
  for (const s of [-1, 1] as const) hair.poly([[HX(s * 9), HY(20)], [HX(s * 13), HY(32)], [HX(s * 15), HY(44)], [HX(s * 10), HY(46)], [HX(s * 7), HY(30)]], k.hair[5]);
  lit(hair, k.hair, (x, y) => -0.08 + (y - HY(22)) * 0.018 + (x % 3 === 0 ? -0.06 : 0));
  parts.push(hair);
  const face = lay();
  face.poly([[HX(-7), HY(17)], [HX(7), HY(17)], [HX(8), HY(25)], [HX(6), HY(29)], [HX(-6), HY(29)], [HX(-8), HY(25)]], k.skin[4]);
  lit(face, k.skin, (x, y) => 0.02 + (y - HY(24)) * 0.03);
  const px1 = Math.max(1, Math.round(hs));
  face.rect(HX(-6), HY(20), 5 * hs, 2 * hs, k.skin[1]);
  face.rect(HX(1), HY(20), 5 * hs, 2 * hs, k.skin[1]);
  // (the under side of his nose: two nostrils)
  face.rect(HX(-2), HY(23), 4 * hs, 3 * hs, k.skin[6]);
  face.rect(HX(-2), HY(25), px1, px1, k.skin[1]);
  face.rect(HX(1), HY(25), px1, px1, k.skin[1]);
  parts.push(face);
  // his beard hangs down at us: the nearest thing of his head, and the brightest
  const beard = lay();
  beard.poly([[HX(-8), HY(25)], [HX(-13), HY(38)], [HX(-10), HY(54)], [HX(0), HY(64)], [HX(10), HY(54)], [HX(13), HY(38)], [HX(8), HY(25)], [HX(3), HY(27)], [HX(-3), HY(27)]], k.hair[6]);
  lit(beard, k.hair, (x, y) => 0.1 - (Math.abs(x - CX) / (13 * hs)) * 0.3 + (y - HY(30)) * 0.012 + ((x - CX) % 2 === 0 ? 0.05 : -0.05));
  for (const s of [-1, 1] as const) beard.poly([[HX(0), HY(26)], [HX(s * 7), HY(27)], [HX(s * 11), HY(35)], [HX(s * 5), HY(31)], [HX(0), HY(29)]], k.hair[8]);
  beard.rect(HX(-2), HY(29), 4 * hs, px1, k.hair[1]);
  parts.push(beard);
  const band = lay();
  band.rect(HX(-8), HY(15), 16 * hs, 2 * hs, k.steel[3]);
  band.hline(HX(-8), HY(16) + px1 - 1, 16 * hs, k.steel[5]);
  band.rect(HX(-2), HY(14), 4 * hs, 4 * hs, GLOW);
  band.rect(HX(-1), HY(15), px1, px1, WHITE);
  parts.push(band);
  const eyes = lay();
  for (const s of [-1, 1] as const) {
    eyes.line(HX(s * 7), HY(19), HX(s * 2), HY(20), k.hair[7]);
    if (hs >= 1.3) eyes.line(HX(s * 7), HY(19) + 1, HX(s * 2), HY(20) + 1, k.hair[6]);
    eyes.rect(HX(s < 0 ? -5 : 2), HY(21), 3 * hs, px1, GLOW);
    eyes.rect(HX(s < 0 ? -3 : 2), HY(21), px1, px1, WHITE);
  }
  parts.push(eyes);
  if (!fire) thrown(p, { parts, hands: [] }, lx, ly + 30, 1.5, o.moon ? 0.25 : 0.45, lip);
  parts.forEach((part, i) => {
    // (with the fire behind him he is dark against it, its light along his edges; his eyes and
    // the stone on his brow keep the colour of the word)
    if (fire && i < parts.length - 2) {
      gloom(part, lx, ly, 14, 76, '#12081a', 0.45);
      rim(part, -1, 0, EMBER[2], 0.85);
      rim(part, 1, 0, EMBER[2], 0.85);
      rim(part, 0, -1, EMBER[3], 0.9);
    }
    // (the moon behind him: a thin cold edge along the top of everything)
    if (o.moon && i < parts.length - 2) rim(part, 0, -1, '#c8d8ff', 0.75);
    // (the braziers: their warmth along his two sides)
    if (o.braziers && i < parts.length - 2) {
      rim(part, -1, 0, EMBER[2], 0.5);
      rim(part, 1, 0, EMBER[2], 0.5);
    }
    // (runes alight, or lanterns: the word's own colour along his two sides)
    if ((o.runesAlight || o.lanterns) && i < parts.length - 2) {
      rim(part, -1, 0, CYAN[3], o.lanterns ? 0.6 : 0.45);
      rim(part, 1, 0, CYAN[3], o.lanterns ? 0.6 : 0.45);
    }
    // (the moon: pale along his left side and the top of him, and wherever the shaft falls on him)
    if (o.moonbeam && i < parts.length - 2) {
      rim(part, -1, 0, '#dce6ff', 0.75);
      rim(part, 0, -1, '#dce6ff', 0.5);
      const c = rgba('#c8d8ff');
      for (let y = 0; y < lip; y++) for (let x = 0; x < W; x++) if (part.d[(y * W + x) * 4 + 3] > 0 && inBeam(x, y)) toward(part.d, (y * W + x) * 4, c, (x + y) % 2 === 0 ? 0.26 : 0.12);
    }
    over(p, part, k.ink);
  });
  // the lanterns themselves: a chain that leans in with everything else, an iron cage, the light in it
  lamps.forEach(([bx, by], n) => {
    const foot = n === 0 ? CX - 92 : CX + 92;
    for (let y = 0; y < by - 7; y++) if (y % 3 !== 2) p.set(Math.round(up(foot, y)), y, y % 3 ? '#3a3478' : '#7a74c8');
    const cage = lay();
    cage.rect(bx - 4, by - 7, 9, 2, '#1c1630');
    cage.rect(bx - 5, by + 6, 11, 2, '#1c1630');
    cage.rect(bx - 2, by - 9, 5, 2, '#1c1630');
    for (const dx of [-4, 0, 4]) cage.vline(bx + dx, by - 5, 11, '#1c1630');
    over(p, cage, null);
    p.rect(bx - 3, by - 4, 3, 9, CYAN[3]).rect(bx + 1, by - 4, 3, 9, CYAN[3]);
    p.rect(bx - 2, by - 2, 2, 5, WHITE).rect(bx + 1, by - 2, 2, 5, WHITE);
  });
  // the braziers themselves: a post that leans in with everything else, the under side of the bowl, the fire over its rim
  bowls.forEach(([bx, by], n) => {
    const foot = n === 0 ? CX - 96 : CX + 96;
    const iron = lay();
    for (let y = by; y < lip + 6; y++) {
      const x = Math.round(up(foot, y));
      iron.set(x, y, '#1c1630');
      iron.set(x + (n === 0 ? 1 : -1), y, '#3a2c44');
    }
    iron.ellipse(bx + 0.5, by, 10, 3.5, '#1c1630');
    iron.poly([[bx - 9, by], [bx + 10, by], [bx + 4, by + 6], [bx - 3, by + 6]], '#1c1630');
    over(p, iron, k.ink);
    for (let x = bx - 8; x <= bx + 9; x++) p.set(x, by - 3, x % 3 === 0 ? EMBER[3] : EMBER[1]);
    for (let f = 0; f < 4; f++) flame(p, bx - 5 + f * 3.6, by - 3, 9 + rnd(f, n + 5) * 10, 2.5 + rnd(f, n) * 1.5, f + n * 3);
  });

  // --- the table: its edge over our heads. We see the FRONT of it, and nothing of its top ---
  const front = lay();
  const tt = fire ? OAK_T : SLAB_T;
  front.poly([[up(34, lip), lip], [up(220, lip), lip], [228, H], [26, H]], tt[2]);
  for (let x = 60; x < 220; x += 40) {
    for (let y = lip + 9; y < H; y++) front.set(up(x, y), y, tt[1]);
  }
  front.hline(Math.round(up(34, lip + 9)), lip + 9, Math.round(up(220, lip + 9) - up(34, lip + 9)), tt[1]);
  front.hline(Math.round(up(34, lip + 10)), lip + 10, Math.round(up(220, lip + 10) - up(34, lip + 10)), tt[3]);
  for (let x = 44, r = 0; x < 214; x += 10, r++) {
    const rx = Math.round(up(x, lip + 3));
    if (o.runesAlight) for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) rune(front, r, rx + ox, lip + 3 + oy, GLOW);
    rune(front, r, rx, lip + 3, o.runesAlight ? WHITE : r % 4 === 1 ? GLOW : '#1898b4');
  }
  gloom(front, lx, lip, 50, 160, fire ? '#07050a' : NIGHT, 0.8);
  over(p, front, k.ink);
  // the under side of the lip that juts out toward us, and the light that spills over it
  const edge = lay();
  edge.rect(Math.round(up(30, lip)), lip - 3, Math.round(up(224, lip) - up(30, lip)), 4, tt[0]);
  over(p, edge, null);
  for (let x = Math.round(up(30, lip)); x < up(224, lip); x++) {
    const t = 1 - Math.abs(x - CX) / 100;
    p.set(x, lip - 4, t > 0.72 ? WHITE : t > 0.45 ? CYAN[3] : t > 0.2 ? GLOW : '#1898b4');
    if (t > 0.6) p.set(x, lip - 5, CYAN[3]);
  }
  // the word: only its top shows over the edge, and its light fans up his chest and beard; or it
  // is held up over the table, all of it in view
  const wy = o.wordUp ? lip - 22 * size : lip - 10;
  const fan = lay();
  for (let y = Math.round(wy - 26); y < lip - 4; y++) {
    const half = (lip - 4 - y) * 0.55 + 3;
    for (let x = Math.round(CX - half); x <= CX + half; x++) if ((x + y) % 2 === 0 && rnd(x, y) < 0.5 * (1 - (lip - 4 - y) / (lip - 4 - wy + 28))) fan.set(x, y, GLOW);
  }
  over(p, fan, null);
  if (o.wordUp) glow(p, CX, wy, 20, GLOW, 0.5);
  word(p, CX, wy, o.wordUp ? 2.6 : 2);
  if (o.veins) {
    // the light of the word runs out through the stone: down the front of the table from under
    // the word, and up the middle of each standing stone, with a short twig here and there
    const tone = (t: number): string => (t < 0.3 ? WHITE : t < 0.65 ? CYAN[3] : GLOW);
    for (let n = 0; n < 5; n++) {
      const slope = (n - 2) * 0.62;
      for (let i = 0; i < 24; i++) {
        const x = Math.round(CX + (n - 2) * 13 + slope * i + Math.sin(i * 0.9 + n * 2) * 1.2);
        const y = lip + 1 + i;
        p.set(x, y, tone(i / 24));
        if (i % 7 === 4) for (let j = 1; j <= 3; j++) p.set(x + (n % 2 ? j : -j), y + j, GLOW);
      }
    }
    for (const sx of [10, 50, 204, 244]) {
      for (let y = lip + 24; y > 4; y--) {
        const x = Math.round(up(sx, y) + Math.sin(y * 0.55 + sx) * 1.4);
        const t = (lip + 24 - y) / (lip + 20);
        p.set(x, y, tone(t));
        if (t < 0.4) p.set(x + 1, y, GLOW);
        if (y % 11 === 3) for (let j = 1; j <= 4; j++) p.set(x + (sx < CX ? j : -j), y - j, GLOW);
        if (y % 13 === 8) for (let j = 1; j <= 3; j++) p.set(x - (sx < CX ? j : -j), y - j, '#1898b4');
      }
    }
    glow(p, CX, lip + 8, 46, GLOW, 0.2);
  }
  if (o.rising) {
    // runes rise off the word all round him: bright where they leave it, fainter as they climb and spread
    for (let n = 0; n < 34; n++) {
      const u = rnd(n, 61) ** 1.3;
      const y = Math.round(lip - 14 - u * 78);
      const x = Math.round(CX + (rnd(n, 67) - 0.5) * 2 * (8 + u * 92));
      const c = u < 0.25 ? WHITE : u < 0.55 ? CYAN[3] : u < 0.8 ? GLOW : '#1898b4';
      if (u < 0.3) for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) rune(p, n, x + ox, y + oy, GLOW);
      rune(p, n, x, y, c);
    }
  }
  if (o.moonbeam) for (let n = 0; n < 26; n++) {
    const y = Math.floor(rnd(n, 71) * (lip - 8));
    const t = y / lip;
    p.set(Math.round(34 + t * 62 + rnd(n, 73) * (44 + t * 34)), y, '#f0f4ff');
  }
  // his hands on the edge: the nearest things in the picture
  for (const s of [-1, 1] as const) {
    const [hx, hy] = hands[s < 0 ? 0 : 1];
    const hand = lay();
    const r = size;
    if (o.stave && s < 0) {
      // (the hand that holds the stave: four fingers wrapped round it, one over another)
      hand.rect(hx - 5, hy - 7, 11, 14, k.skin[4]);
      hand.ellipse(hx + 0.5, hy - 7, 5.5, 2.5, k.skin[4]);
      hand.ellipse(hx + 0.5, hy + 7, 5.5, 2.5, k.skin[4]);
      shade(hand, k.skin, lx, ly, 90, (x) => 0.25 - (hx + 5 - x) * 0.03);
      for (let f = 1; f < 4; f++) hand.hline(hx - 5, Math.round(hy - 7 + f * 3.6), 11, k.skin[0]);
      over(p, hand, k.ink);
      continue;
    }
    const long = o.fingers ? 9 : 0;
    hand.ellipse(hx, hy - 4 * r, 11 * r, 5 * r, k.skin[3]);
    for (let f = 0; f < 4; f++) {
      const fx = hx - 9 * r + f * 6 * r;
      const len = (10 + (f === 1 || f === 2 ? 2 : 0) + long) * r;
      hand.rect(fx, hy - 4 * r, 5 * r, len, k.skin[4]);
      hand.ellipse(fx + 2.5 * r, hy - 4 * r + len, 2.5 * r, 2 * r, k.skin[4]);
    }
    hand.ellipse(hx - s * 13 * r, hy - 2 * r, 4 * r, 3.5 * r, k.skin[3]);
    // (the light is behind them: bright along their tops, dark at their tips)
    shade(hand, k.skin, hx, hy - 12, 26 * r + long, (x, y) => (y < hy - 5 * r ? 0.25 : 0) - 0.1);
    for (let f = 1; f < 4; f++) hand.vline(Math.round(hx - 9 * r + f * 6 * r - 1), Math.round(hy - 2 * r), Math.round((12 + long) * r), k.skin[0]);
    if (o.fingers) {
      // the knuckles where they bend over the edge, and a nail on each
      for (let f = 0; f < 4; f++) {
        const fx = Math.round(hx - 9 * r + f * 6 * r);
        hand.hline(fx + 1, Math.round(hy - 2 * r), Math.round(3 * r), k.skin[6]);
        hand.rect(fx + 1, Math.round(hy - 4 * r + (8 + (f === 1 || f === 2 ? 2 : 0) + long) * r), Math.round(3 * r), 2, k.skin[5]);
      }
    }
    if (fire) rim(hand, 0, -1, EMBER[2], 0.6);
    over(p, hand, k.ink);
  }
  return p;
}

export interface Sketch {
  n: number;
  key: string;
  name: string;
  note: string;
  paint(): Px;
}

export const SKETCHES: Sketch[] = [
  { n: 5, key: 'desk', name: 'The big desk', note: 'Staged like the librarian: a heavy forge table, his racks of rune stones, a window. He is smaller, the room is bigger.', paint: desk },
  { n: 6, key: 'floor', name: 'From the floor', note: 'A real look up. His fingers come over the table edge, the stones lean in overhead.', paint: () => floor() },
  { n: 7, key: 'forge', name: 'At the forge', note: 'The forge fire burns behind him, warm at his back. The word lights his face cold from below.', paint: forge },
  { n: 8, key: 'close', name: 'Close', note: 'Only his face and his hands, lit from underneath.', paint: close },
  { n: 9, key: 'deskWarm', name: 'The big desk, warm', note: 'Sketch 5 again in the colours of the library picture: oak, earth, real skin, a fire to one side. The word is the one cold light in a warm room.', paint: deskWarm },
  { n: 10, key: 'floorForge', name: 'From the floor, at the forge', note: 'Sketch 6 with the fire of 7: looking up at him with the forge blazing behind.', paint: () => floor({ fire: true }) },
  { n: 11, key: 'floorNear', name: 'Closer', note: 'Sketch 6 with him a size bigger: more of him, less of the room.', paint: () => floor({ size: 1.15, lip: 88 }) },
  { n: 12, key: 'floorLean', name: 'Leaning over you', note: 'His fingers curl over the edge and down its front, and his head comes down toward you, bigger.', paint: () => floor({ fingers: true, leanIn: 1 }) },
  { n: 13, key: 'floorStave', name: 'Stave and word', note: 'His stave in one hand, running up out of sight with a rune alight in its ring. The word held up over the table where you can see all of it.', paint: () => floor({ stave: true, wordUp: true }) },
  { n: 14, key: 'floorFires', name: 'Braziers lit', note: 'Sketch 6 with a brazier burning at either hand, seen from under its bowl: two warm lights, and their warmth along his arms.', paint: () => floor({ braziers: true }) },
  { n: 15, key: 'floorFar', name: 'Further back', note: 'Sketch 6 from a step further off: more of the stones and the dark overhead, less of him.', paint: () => floor({ size: 0.86, lip: 78 }) },
  // (19:43: "give me more of the 12 lean with braziers and no braziers")
  { n: 16, key: 'lean', name: 'The lean, as it was', note: 'Sketch 12 again, for comparing.', paint: () => floor({ fingers: true, leanIn: 1 }) },
  { n: 17, key: 'leanFires', name: 'The lean, braziers lit', note: 'The same with a brazier at either hand.', paint: () => floor({ fingers: true, leanIn: 1, braziers: true }) },
  { n: 18, key: 'leanFar', name: 'Further over you', note: 'He leans further: his face is bigger again and lower, right over the edge.', paint: () => floor({ fingers: true, leanIn: 1.5 }) },
  { n: 19, key: 'leanFarFires', name: 'Further over you, braziers lit', note: 'The same with the braziers.', paint: () => floor({ fingers: true, leanIn: 1.5, braziers: true }) },
  { n: 20, key: 'leanNear', name: 'The lean, closer in', note: 'The lean of 12 with all of him a size bigger.', paint: () => floor({ fingers: true, leanIn: 1, size: 1.15, lip: 88 }) },
  { n: 21, key: 'leanNearFires', name: 'The lean, closer in, braziers lit', note: 'The same with the braziers.', paint: () => floor({ fingers: true, leanIn: 1, size: 1.15, lip: 88, braziers: true }) },
  // (19:43: "and maybe some other luminescent options": each is the lean of 12 with one other thing that glows)
  { n: 22, key: 'glowRunes', name: 'Every rune alight', note: 'All the runes cut in the stones and along the table burn, and their light is along his arms.', paint: () => floor({ fingers: true, leanIn: 1, runesAlight: true }) },
  { n: 23, key: 'glowLamps', name: 'Rune lanterns', note: 'A lantern of the same cold light hangs on a chain at either hand.', paint: () => floor({ fingers: true, leanIn: 1, lanterns: true }) },
  { n: 24, key: 'glowRising', name: 'Runes rising', note: 'Runes lift off the word and drift up all round him.', paint: () => floor({ fingers: true, leanIn: 1, rising: true }) },
  { n: 25, key: 'glowMoon', name: 'Moonlight', note: 'A shaft of moonlight comes down across him from high on one side.', paint: () => floor({ fingers: true, leanIn: 1, moonbeam: true }) },
  { n: 26, key: 'glowVeins', name: 'Veins of light', note: 'The light of the word runs out through the stone: down the front of the table and up the standing stones.', paint: () => floor({ fingers: true, leanIn: 1, veins: true }) },
];
