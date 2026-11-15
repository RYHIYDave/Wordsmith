// Dev page: THE ISLE OF STONES (one of the eight towns he kept on 11 Nov 2026, to unlock or buy; his pick of which to draw first,
// 14 Nov 2026: “7 The Isle of Stones”), as the closer mock-up he locks it in from, as the Shaft's Rim was: the town at the game's
// own scale (a tile 32 x 16 game pixels, every game pixel two picture pixels), the game's own pictures for what the game has (the
// townsfolk, the smithy, the bazaar, the wordsmith's ring, the Lexicon, the stash, the waypoint, the braziers, the knight; and the
// Shaft's Rim's gate, record stone, trophies wall, torches and socket slab, drawn at the game's standard: art/shaft_props.ts),
// and painted here, as a mock-up, only what is new: the isle and its shore, the still sea, the northern lights (green and violet,
// never cyan) and their light on the water, the ring of standing stones, the way down into the sea, the portal's place.
// The sketch's line: “A small isle in a still sea under the northern lights, all of it inside a ring of standing stones: the
// wordsmith's own place.” (docs/mockups/endless_town/README.md, the ten). Nothing of the game imports it.
//   node tools/preview.mjs src/dev/preview_isle.ts docs/mockups/isle_of_stones/pictures/isle_whole.png 1200 700 whole
//   node tools/preview.mjs src/dev/preview_isle.ts docs/mockups/isle_of_stones/pictures/isle_view_1.png 1014 528 view:1
//   (view:2 the way down; view:3 the gate and the record)

import { drawText, textWidth } from '../engine/font';
import { drawGlow, drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';
import type { Theme } from '../art/ground';
import { makeHeroArt3 } from '../art/heroes3';
import { makePropArt } from '../art/tiles';
import { makeTownProps } from '../art/town';
import { townSprite } from '../art/townscene';
import type { TownArt } from '../art/townscene';
import { makeTownsfolk } from '../art/townsfolk';
import { makeWaypointArt } from '../art/crypt_ways';
import { fbm } from './title_options_kit';
import { GRAIN } from '../art/kit';
import { TORCH_FRAMES, paintGate as gatePiece, paintRecord as recordPiece, paintSocketSlab, paintTorchFlame, paintTorchPost, paintTrophies as trophiesPiece } from '../art/shaft_props';
import type { Piece } from '../art/shaft_props';
import { stoneOf } from '../art/props';
import { ISLE_STONES, auroraNow, paintIsleAurora, paintIsleGround, paintStandingStone } from '../art/isle_of_stones';

// ---------------------------------------------------------------------------------------------------------------------------
// THE PLACE, in tiles: the isle's middle, its turf, its shore, the ring of standing stones.

export const ISLE = { cx: 12, cy: 12, turf: 7.1, shore: 8.1, ring: 7.25 };
const deg = (d: number): number => (d * Math.PI) / 180;
const polar = (a: number, r: number): [number, number] => [ISLE.cx + Math.cos(deg(a)) * r, ISLE.cy + Math.sin(deg(a)) * r];

/** THE LAYOUT (the sketch's, at the game's scale): each station's anchor tile. Angles: 0 is +x (down-right on the screen), -135 the back, 45 the front. */
export const LAYOUT = {
  gate: [13, 5] as [number, number],
  record: [8, 7] as [number, number],
  trophies: [4, 9] as [number, number],
  portal: polar(-135, 5.6),
  way: [16, 16] as [number, number],
  forge: [17, 9] as [number, number],
  tentBack: [6, 13] as [number, number],
  wordsmith: [12, 11] as [number, number],
  lexicon: [9, 16] as [number, number],
  stash: [13, 17] as [number, number],
  stranger: [18, 13] as [number, number],
  braziers: [[15, 12], [9, 12], [12, 8], [10, 18]] as [number, number][],
  torches: [[16.0, 6.6], [6.4, 9.0], [15.6, 18.4], [5.8, 15.6], [19.0, 15.6]] as [number, number][],
};
/** The ring of standing stones: each its angle, how tall (game pixels), its lean; a gap at the back for the portal, one at the front for the way down. */
export const STONES: readonly { a: number; hgt: number; w: number }[] = Array.from({ length: 18 }, (_, k) => {
  const a = -180 + k * (360 / 18) + 6;
  // (tall at the back, where they stand against the sea and the sky; low at the front, so that they hide no one)
  const back = 0.5 - 0.5 * Math.cos(deg(a - -135));
  return { a, hgt: Math.round(20 + 26 * back + ((k * 37) % 5) * 3), w: 0.55 + ((k * 13) % 3) * 0.08 };
}).filter((s) => {
  const off = (b: number): number => Math.abs(((s.a - b + 540) % 360) - 180);
  return off(-135) > 12 && off(45) > 10;
});

// ---------------------------------------------------------------------------------------------------------------------------
// THE PICTURE: GW x GH game pixels, each two by two picture pixels.

const GW = 980;
const GH = 560;
const OX = 490;
const OY = 312 - (ISLE.cx + ISLE.cy) * 8;
const at = (x: number, y: number, z = 0): [number, number] => [OX + (x - y) * 16, OY + (x + y) * 8 - z];
const [PCX, PCY] = at(ISLE.cx, ISLE.cy);
/** The horizon (game pixels from the top): the sea runs back to it; over it the sky and the northern lights. */
const HORIZON = 132;

type RGB = [number, number, number];
const rgb = (c: string): RGB => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const mixRGB = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const mul = (a: RGB, k: number): RGB => [a[0] * k, a[1] * k, a[2] * k];
const band = (v: number, n: number): number => Math.max(0, Math.min(1, Math.floor(v * n) / n));
function hash(x: number, y: number, k: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(k | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

class Buf {
  readonly d = new Uint8ClampedArray(GW * 2 * GH * 2 * 4);
  /** One game pixel (2 x 2). */
  set(x: number, y: number, c: RGB): void {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= GW || y >= GH) return;
    for (let j = 0; j < 2; j++)
      for (let i = 0; i < 2; i++) {
        const o = ((y * 2 + j) * GW * 2 + x * 2 + i) * 4;
        this.d[o] = c[0];
        this.d[o + 1] = c[1];
        this.d[o + 2] = c[2];
        this.d[o + 3] = 255;
      }
  }
  get(x: number, y: number): RGB {
    const o = ((Math.floor(y) * 2) * GW * 2 + Math.floor(x) * 2) * 4;
    return [this.d[o], this.d[o + 1], this.d[o + 2]];
  }
  add(x: number, y: number, c: RGB, a: number): void {
    if (x < 0 || y < 0 || x >= GW || y >= GH || a <= 0) return;
    const o = this.get(x, y);
    this.set(x, y, [o[0] + c[0] * a, o[1] + c[1] * a, o[2] + c[2] * a]);
  }
  over(x: number, y: number, c: RGB, a: number): void {
    if (x < 0 || y < 0 || x >= GW || y >= GH || a <= 0) return;
    this.set(x, y, mixRGB(this.get(x, y), c, Math.min(1, a)));
  }
  poly(pts: readonly [number, number][], c: RGB | ((x: number, y: number) => RGB | null)): void {
    let y0 = Infinity;
    let y1 = -Infinity;
    for (const [, y] of pts) {
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(GH - 1, Math.ceil(y1)); y++) {
      const yc = y + 0.5;
      const xs: number[] = [];
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i];
        const [bx, by] = pts[(i + 1) % pts.length];
        if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2)
        for (let x = Math.max(0, Math.round(xs[k])); x < Math.min(GW, Math.round(xs[k + 1])); x++) {
          const col = typeof c === 'function' ? c(x, y) : c;
          if (col) this.set(x, y, col);
        }
    }
  }
  ellipse(cx: number, cy: number, rx: number, ry: number, c: RGB | ((x: number, y: number, n: number) => RGB | null)): void {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const n = Math.hypot((x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry);
        if (n > 1) continue;
        const col = typeof c === 'function' ? c(x, y, n) : c;
        if (col) this.set(x, y, col);
      }
  }
  line(x0: number, y0: number, x1: number, y1: number, c: RGB): void {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) this.set(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), c);
  }
  /** A box on the tiles: (x, y) w along x, d along y, hgt high from z0; its top, its face to the left (+y) and to the right (+x). */
  box(x: number, y: number, w: number, d: number, hgt: number, r: readonly [RGB, RGB, RGB], z0 = 0): void {
    const a = at(x, y, z0 + hgt);
    const b = at(x + w, y, z0 + hgt);
    const c = at(x + w, y + d, z0 + hgt);
    const e = at(x, y + d, z0 + hgt);
    const c0 = at(x + w, y + d, z0);
    const e0 = at(x, y + d, z0);
    const b0 = at(x + w, y, z0);
    const tex = (base: RGB, k: number) => (px: number, py: number): RGB => ((py + Math.floor(px / 7) * 3) % 6 === 0 ? mul(base, 0.82) : hash(Math.floor(px / 5), Math.floor(py / 3), k) < 0.18 ? mul(base, 0.92) : base);
    this.poly([e, c, c0, e0], tex(r[1], 1));
    this.poly([c, b, b0, c0], tex(r[0], 2));
    this.poly([a, b, c, e], r[2]);
    this.line(e[0], e[1], c[0], c[1], mixRGB(r[2], [255, 255, 255], 0.18));
    this.line(c[0], c[1], b[0], b[1], mixRGB(r[2], [255, 255, 255], 0.1));
  }
  /** A picture at picture pixel (X, Y), laid over (its see-through left), or added at `add` of its strength. */
  canvasAt(cv: HTMLCanvasElement, X: number, Y: number, add = 0): void {
    const im = (cv.getContext('2d') as CanvasRenderingContext2D).getImageData(0, 0, cv.width, cv.height);
    const W2 = GW * 2;
    for (let j = 0; j < cv.height; j++)
      for (let i = 0; i < cv.width; i++) {
        const x = Math.round(X) + i;
        const y = Math.round(Y) + j;
        if (x < 0 || y < 0 || x >= W2 || y >= GH * 2) continue;
        const o = (j * cv.width + i) * 4;
        const a = im.data[o + 3];
        if (a === 0) continue;
        const q = (y * W2 + x) * 4;
        for (let c = 0; c < 3; c++) this.d[q + c] = add > 0 ? this.d[q + c] + im.data[o + c] * (a / 255) * add : a >= 128 ? im.data[o + c] : this.d[q + c];
        this.d[q + 3] = 255;
      }
  }
  /** One of the game's own pictures, its anchor at game pixel (gx, gy). */
  sprite(s: Sprite, gx: number, gy: number): void {
    const dens = s.density ?? 1;
    const k = 2 / dens;
    const im = pixOf(s);
    const X = (Math.round(gx) - s.ax) * 2;
    const Y = (Math.round(gy) - s.ay) * 2;
    const W2 = GW * 2;
    for (let y = Math.max(0, Math.floor(Y)); y < Math.min(GH * 2, Math.ceil(Y + im.height * k)); y++)
      for (let x = Math.max(0, Math.floor(X)); x < Math.min(W2, Math.ceil(X + im.width * k)); x++) {
        const i = Math.floor((x - X) / k);
        const j = Math.floor((y - Y) / k);
        if (i < 0 || j < 0 || i >= im.width || j >= im.height) continue;
        const o = (j * im.width + i) * 4;
        if (im.data[o + 3] < 128) continue;
        const q = (y * W2 + x) * 4;
        this.d[q] = im.data[o];
        this.d[q + 1] = im.data[o + 1];
        this.d[q + 2] = im.data[o + 2];
        this.d[q + 3] = 255;
      }
  }
  /** The soft shadow the game puts under what stands. */
  shadow(gx: number, gy: number, r: number): void {
    const w = r * 34;
    const hh = r * 17;
    for (let y = Math.floor(gy - hh); y <= gy + hh; y++)
      for (let x = Math.floor(gx - w); x <= gx + w; x++) {
        const n = Math.hypot((x + 0.5 - gx) / w, (y + 0.5 - gy) / hh);
        if (n < 1) this.over(x, y, [0, 0, 0], 0.45 * (n < 0.5 ? 1 : 1 - (n - 0.5) / 0.5));
      }
  }
}
const pixMemo = new Map<Sprite, ImageData>();
function pixOf(s: Sprite): ImageData {
  let d = pixMemo.get(s);
  if (!d) pixMemo.set(s, (d = (s.img.getContext('2d') as CanvasRenderingContext2D).getImageData(0, 0, s.img.width, s.img.height)));
  return d;
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE ISLE'S STONE: a cold grey-blue, a granite under the northern sky. The game's own things are painted in it (makeTownProps).

const STONE = ['#14161e', '#2a2e3a', '#3c4250', '#565e6e', '#7a8292', '#9ca2ae'];
const THEME: Theme = {
  id: 'isle',
  mortar: STONE[0],
  slab: [STONE[1], STONE[2], STONE[3], STONE[4]],
  slabs: 1.6,
  cap: [STONE[0], STONE[3], STONE[4], STONE[4], STONE[5]],
  capLow: [STONE[0], STONE[2], STONE[3], STONE[3], STONE[4]],
  lit: [STONE[0], STONE[2], STONE[3], STONE[4], STONE[5]],
  shade: [STONE[0], STONE[1], STONE[2], STONE[3], STONE[4]],
} as Theme;
const NIGHT = rgb('#05060e');
const FIRE: RGB = rgb('#ff8a2a');
/** The northern lights: green, a yellower green at their foot, violet up into the dark; never cyan. */
const AURORA = { green: rgb('#4ee070'), foot: rgb('#a8f070'), violet: rgb('#9a5cf0') };
const TURF = ['#121a14', '#1c2a1e', '#26382a', '#324632'].map(rgb);
const SHORE = ['#1a1a22', '#2c2c36', '#3e3e4a', '#56565e'].map(rgb);
const SEA = ['#04060c', '#070b14', '#0b111e', '#121a2a'].map(rgb);
const STANDING = ['#1a1c2e', '#2a2e48', '#3c4266', '#525a84'].map(rgb);

/** The coast: how far out the shore is at angle a (radians): a round, worn ragged. */
function coast(a: number): number {
  return ISLE.shore + 0.35 * Math.sin(3 * a + 1) + 0.22 * Math.sin(7 * a + 2) + 0.12 * Math.sin(13 * a);
}
/** The lights' curtains across the sky: at a column, how bright (0 ... 1), where their foot hangs and how tall they are (game
 * pixels); a second, fainter and higher, behind. */
function curtains(x: number): { k: number; foot: number; tall: number }[] {
  const k1 = Math.max(0, Math.min(1, 0.5 + 0.55 * Math.sin(x / 83 + 0.6) + 0.2 * Math.sin(x / 29 + 2)));
  const k2 = Math.max(0, Math.min(1, 0.35 + 0.5 * Math.sin(x / 61 + 3.1)));
  return [
    { k: k1, foot: HORIZON - 14 - 22 * Math.sin(x / 97 + 1.2) - 8 * Math.sin(x / 33 + 0.4), tall: 70 + 20 * Math.sin(x / 41) },
    { k: k2 * 0.6, foot: HORIZON - 46 - 16 * Math.sin(x / 71 + 2.5), tall: 56 + 14 * Math.sin(x / 37 + 1) },
  ];
}
/** How strongly the lights shine at a pixel of the sky (0 ... 1), and their colour there: a yellower green at the foot, green, then violet up into the dark; fine rays running up them. */
function auroraAt(x: number, y: number): { a: number; c: RGB } {
  let a = 0;
  let c = AURORA.green;
  for (const C of curtains(x)) {
    const u = (C.foot - y) / C.tall;
    if (u <= 0 || u >= 1 || C.k <= 0.05) continue;
    // (fine rays running up them, faint; brightest at the foot, fading softly up into the dark)
    const rays = 0.85 + 0.15 * Math.sin(x * 0.45 + 3 * Math.sin(x * 0.045));
    const e = C.k * rays * (u < 0.06 ? u / 0.06 : Math.pow(1 - (u - 0.06) / 0.94, 2.2));
    if (e > a) {
      a = e;
      c = u < 0.09 ? AURORA.foot : mixRGB(AURORA.green, AURORA.violet, Math.max(0, Math.min(1, (u - 0.3) / 0.55)));
    }
  }
  return { a, c };
}

function paintGround(B: Buf): void {
  for (let y = 0; y < GH; y++)
    for (let x = 0; x < GW; x++) {
      let c: RGB;
      if (y < HORIZON) {
        // THE SKY: night, a few stars, and the northern lights hanging over the sea in curtains
        c = mixRGB(rgb('#03040a'), rgb('#0a0c1a'), band(y / HORIZON, 4));
        if (hash(x, y, 31) < 0.004) c = rgb(hash(x, y, 32) < 0.5 ? '#c8cce0' : '#8a90b0');
        const A = auroraAt(x, y);
        // (in bands, a dither where two meet)
        const lv = A.a * 5 + (((x + y) & 1) ? 0.25 : -0.25);
        if (A.a > 0.02) c = mixRGB(c, A.c, Math.max(0, Math.min(5, Math.floor(lv))) * 0.12);
      } else {
        // THE SEA: still and black, the lights laid on it in long soft streaks, darker toward the eye
        const back = 1 - Math.min(1, (y - HORIZON) / 260);
        c = mixRGB(SEA[0], SEA[2], band(back * 0.9 + 0.1 * fbm(x / 40, y / 6, 13), 3));
        // (the lights' reflection: straight down from them on the still water, broken into long streaks by the slightest ripple;
        // the foot's green nearest the horizon, violet further out)
        const d = y - HORIZON;
        const K = curtains(x + Math.round(2 * Math.sin(y * 0.9)))[0].k;
        const ripple = (Math.floor(y / 2) + Math.floor((x + 7 * Math.sin(y * 0.3)) / 23)) % 3 === 0 ? 0.2 : 1;
        const ref = K * Math.max(0, 1 - d / 170) * ripple;
        if (ref > 0.1) c = mixRGB(c, mixRGB(AURORA.foot, AURORA.violet, Math.min(1, d / 120)), band(ref, 4) * 0.3);
        if ((y + Math.floor(x / 9)) % 7 === 0 && hash(Math.floor(x / 5), y, 33) < 0.4) c = mixRGB(c, SEA[3], 0.6);
      }
      // THE ISLE: turf in the middle, the shore round it
      const u2 = (x + 0.5 - OX) / 16;
      const v2 = (y + 0.5 - OY) / 8;
      const tx = (u2 + v2) / 2;
      const ty = (v2 - u2) / 2;
      const r = Math.hypot(tx - ISLE.cx, ty - ISLE.cy);
      const a = Math.atan2(ty - ISLE.cy, tx - ISLE.cx);
      const cr = coast(a);
      if (r <= cr) {
        const turfEdge = cr - (ISLE.shore - ISLE.turf) - 0.25 * fbm(tx * 1.3, ty * 1.3, 14);
        if (r <= turfEdge) {
          c = mixRGB(TURF[1], TURF[2], band(fbm(tx * 0.9, ty * 0.9, 15), 3));
          if (hash(Math.floor(x / 2), y, 16) < 0.06) c = TURF[3];
          if (hash(Math.floor(x / 3), Math.floor(y / 2), 17) < 0.04) c = TURF[0];
          // (worn paths: a ring round the wordsmith's stones, and out to the way down, the gate and the portal)
          const path = Math.abs(r - 3.6) < 0.35 || [45, -135, -95].some((b) => Math.abs(Math.atan2(Math.sin(a - deg(b)), Math.cos(a - deg(b)))) * r < 0.42 && r > 3.6);
          if (path) c = mixRGB(SHORE[2], TURF[1], 0.35 + 0.3 * band(fbm(tx * 3, ty * 3, 18), 2));
        } else {
          c = mixRGB(SHORE[1], SHORE[2], band(fbm(tx * 2, ty * 2, 19), 3));
          if (hash(Math.floor(x / 3), Math.floor(y / 2), 20) < 0.12) c = SHORE[3];
          if (hash(Math.floor(x / 2), y, 21) < 0.08) c = SHORE[0];
        }
      }
      B.set(x, y, c);
    }
  // (the isle's front edge: a low face of dark rock down to the water, the sea lapping pale along its foot)
  for (let x = 0; x < GW; x++) {
    let best = -1;
    for (let y = GH - 1; y >= HORIZON; y--) {
      const u2 = (x + 0.5 - OX) / 16;
      const v2 = (y + 0.5 - OY) / 8;
      const tx = (u2 + v2) / 2;
      const ty = (v2 - u2) / 2;
      if (Math.hypot(tx - ISLE.cx, ty - ISLE.cy) <= coast(Math.atan2(ty - ISLE.cy, tx - ISLE.cx))) {
        best = y;
        break;
      }
    }
    if (best < 0) continue;
    for (let k = 1; k <= 7; k++) B.set(x, best + k, mixRGB(SHORE[1], SHORE[0], k / 7));
    B.set(x, best + 8, (x + Math.floor(best / 3)) % 5 < 3 ? mixRGB(SEA[3], rgb('#8a90b0'), 0.35) : SEA[3]);
  }
}

// ---------------------------------------------------------------------------------------------------------------------------
// WHAT IS NEW, painted as a mock-up.

/** A standing stone: tall, a little tapered and leaning, lichen on its weather side, a rune of the order cut in its face, cyan. */
function paintStanding(B: Buf, s: { a: number; hgt: number; w: number }): void {
  const [x, y] = polar(s.a, ISLE.ring);
  const w = s.w;
  B.box(x - w / 2, y - 0.2, w, 0.4, s.hgt, [STANDING[1], STANDING[0], STANDING[3]]);
  // (its weathered top: a cap of paler stone, lichen in patches)
  const [tx0, ty0] = at(x - w / 2, y + 0.2, s.hgt);
  for (let k = 0; k < 9; k++) B.set(tx0 + 2 + ((k * 7) % Math.max(3, Math.round(w * 30))), ty0 + 3 + ((k * 5) % 14), rgb(k % 2 ? '#5a6a3a' : '#3e4a2c'));
  // (the rune of the order, cut in the face toward the middle: the friend's cyan, faint)
  const [rx, ry] = at(x, y + 0.2, s.hgt * 0.55);
  B.set(rx - 1, ry, rgb('#22d0e0'));
  B.set(rx - 1, ry - 1, rgb('#7fe8ff'));
  B.set(rx - 2, ry - 2, rgb('#22d0e0'));
  B.set(rx, ry - 2, rgb('#22d0e0'));
}
/** The portal's place: a round of flat stones in the gap at the back, ringed by low stones, kept clear. */
function paintPortal(B: Buf): void {
  const [lx, ly] = LAYOUT.portal;
  const [cx, cy] = at(lx, ly);
  B.ellipse(cx, cy, 1.1 * 22.6, 1.1 * 11.3, (px, py, n) => (n > 0.92 ? rgb(STONE[5]) : n > 0.85 ? rgb(STONE[1]) : Math.floor(n * 5) & 1 ? rgb(STONE[3]) : rgb(STONE[2])));
}
function portalPosts(B: Buf, near: boolean): void {
  const [lx, ly] = LAYOUT.portal;
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2 + 0.3;
    const px = lx + Math.cos(a) * 1.0;
    const py = ly + Math.sin(a) * 1.0;
    if ((Math.sin(a) + Math.cos(a) > 0) !== near) continue;
    B.box(px - 0.1, py - 0.1, 0.2, 0.2, 9, [STANDING[1], STANDING[0], STANDING[3]]);
  }
}
/** The way down: steps cut down from the shore into the sea, the water lit over the lowest. */
function paintStair(B: Buf): void {
  const [wx, wy] = LAYOUT.way;
  for (let k = 0; k < 5; k++) {
    const x = wx + 1.0 + k * 0.42;
    const y = wy + 1.0 + k * 0.42;
    B.box(x - 0.55, y - 0.2, 1.1, 0.42, 3, [rgb(STONE[2]), rgb(STONE[1]), rgb(STONE[4])], -k * 3);
  }
  const [sx, sy] = at(wx + 3.2, wy + 3.2, -14);
  for (let k = 0; k < 40; k++) B.add(sx - 20 + k, sy + ((k * 3) % 5) - 2, rgb('#1a6070'), 0.25);
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE SCENE

const hero = makeHeroArt3().of('warrior', { twoHanded: false, town: true });
const props = makePropArt();
const ART: TownArt = { town: makeTownProps(THEME), folk: makeTownsfolk() };
const WAY = makeWaypointArt(THEME);
const TIME = 1.35;
const T0 = TIME;
const RUNE_STONES: readonly (readonly [number, number])[] = [[-2, -1], [-1, -2], [1, -2], [-2, 1], [2, -1], [-1, 2]];
const spr = (p: Piece): Sprite => {
  const s = p.px.sprite(p.ox, p.oy, GRAIN);
  if (p.lights?.length) s.lights = p.lights;
  return s;
};
const SLAB_STONE = { stone: stoneOf(THEME), lit: THEME.lit, shade: THEME.shade };
interface Props3 { gate: Sprite; record: Sprite; trophies: Sprite; post: Sprite; flame: Sprite[]; slab: Sprite[] }
let PROPS3: Props3 | undefined;
const props3 = (): Props3 => (PROPS3 ??= {
  gate: spr(gatePiece()),
  record: spr(recordPiece(23, true)),
  trophies: spr(trophiesPiece([true, true, true, false])),
  post: spr(paintTorchPost()),
  flame: Array.from({ length: TORCH_FRAMES }, (_, f) => spr(paintTorchFlame(f))),
  slab: Array.from({ length: 8 }, (_, f) => spr(paintSocketSlab(SLAB_STONE, f))),
});

interface Put { d: number; f: () => void }
interface Lit { s?: Sprite; x: number; y: number; r?: number; c?: string; a?: number }
let GROUND: HTMLCanvasElement | null = null;

let STD: { ground: HTMLCanvasElement; aurora: HTMLCanvasElement; gx: number; gy: number; stones: Sprite[]; ms: number } | null = null;
/** STEP 2: the isle drawn at the game's standard (art/isle_of_stones.ts), made once. */
function standard(): NonNullable<typeof STD> {
  if (STD) return STD;
  const t0 = performance.now();
  const G = paintIsleGround();
  const A = paintIsleAurora();
  const stones = [0, 1, 2, 3].map((v) => spr(paintStandingStone(v)));
  return (STD = { ground: G.canvas, aurora: A.canvas, gx: G.gx, gy: G.gy, stones, ms: performance.now() - t0 });
}

export function scene(heroAt: [number, number] | null, t = 0, std = false): { cv: HTMLCanvasElement; labels: { x: number; y: number; text: string }[] } {
  const B = new Buf();
  const lights: Lit[] = [];
  const labels: { x: number; y: number; text: string }[] = [];
  const label = (x: number, y: number, z: number, text: string): void => {
    const [px, py] = at(x, y, z);
    labels.push({ x: px, y: py, text });
  };
  if (!GROUND) {
    const G = new Buf();
    paintGround(G);
    GROUND = document.createElement('canvas');
    GROUND.width = GW * 2;
    GROUND.height = GH * 2;
    (GROUND.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(G.d, GW * 2, GH * 2), 0, 0);
  }
  if (std) {
    const D = standard();
    B.canvasAt(D.ground, (OX + D.gx) * 2, (OY + D.gy) * 2);
    B.canvasAt(D.aurora, (OX + D.gx) * 2, (OY + D.gy) * 2, auroraNow(t));
  } else B.canvasAt(GROUND, 0, 0);
  // the lights on the sea and over the isle: a breath of the aurora's green and violet
  if (!std) {
    lights.push({ x: PCX - 160, y: HORIZON + 30, r: 220, c: '#4ee070', a: 0.08 });
    lights.push({ x: PCX + 180, y: HORIZON + 20, r: 200, c: '#9a5cf0', a: 0.08 });
  }
  // ---- what lies flat
  const c = (p: readonly [number, number]): [number, number] => [p[0] + 0.5, p[1] + 0.5];
  const flat = (kind: string, p: [number, number]): void => {
    const s = townSprite(ART, kind, 0, TIME);
    if (s) B.sprite(s, ...at(p[0], p[1]));
  };
  const [wx, wy] = LAYOUT.wordsmith;
  const [bx, by] = LAYOUT.tentBack;
  flat('rug', c([bx, by + 1]));
  flat('runeRing', c([wx, wy]));
  if (!std) {
    paintPortal(B);
    portalPosts(B, false);
  }
  label(LAYOUT.portal[0], LAYOUT.portal[1], 24, 'portal');

  // ---- what stands, nearest last
  const puts: Put[] = [];
  const put = (x: number, y: number, f: () => void): void => {
    puts.push({ d: x + y, f });
  };
  const P3 = props3();
  const stand = (kind: string, p: [number, number], variant = 0, shadow = 0.36): void => {
    const s = kind === 'runeSlab' ? P3.slab[Math.floor((T0 + t) * 8) % 8] : townSprite(ART, kind, variant, T0 + t + variant * 0.37);
    if (!s) return;
    put(p[0], p[1], () => {
      const [gx, gy] = at(p[0], p[1]);
      if (shadow) B.shadow(gx, gy, shadow);
      B.sprite(s, gx, gy);
      if (s.lights?.length) lights.push({ s, x: gx, y: gy });
    });
  };
  const [fx, fy] = LAYOUT.forge;
  stand('forge', c([fx, fy]), 0, 0.5);
  stand('rack', c([fx - 3, fy]), 0, 0.3);
  stand('trough', c([fx + 1, fy]));
  stand('anvil', c([fx - 1, fy + 2]));
  stand('armourer', c([fx - 1, fy + 1]));
  label(fx + 0.5, fy + 0.5, 70, 'smith');
  stand('tentBack', c([bx, by]), 0, 0);
  stand('mystic', c([bx, by + 1]));
  stand('tentTable', c([bx, by + 2]), 0, 0.3);
  label(bx + 0.5, by + 1, 70, 'bazaar');
  stand('wordsmith', c([wx, wy]));
  stand('runeSlab', c([wx, wy + 1]));
  RUNE_STONES.forEach(([dx, dy], i) => stand('runeStone', c([wx + dx, wy + dy]), i, 0.3));
  label(wx + 2.4, wy - 0.4, 40, 'wordsmith');
  label(wx + 1.6, wy + 2.4, 0, 'socket');
  stand('lexicon', c(LAYOUT.lexicon));
  label(LAYOUT.lexicon[0] + 0.5, LAYOUT.lexicon[1] + 0.5, 30, 'lexicon');
  stand('stash', c(LAYOUT.stash));
  label(LAYOUT.stash[0] + 0.5, LAYOUT.stash[1] + 0.5, 8, 'stash');
  stand('stranger', c(LAYOUT.stranger));
  label(LAYOUT.stranger[0] + 0.5, LAYOUT.stranger[1] + 0.5, 30, 'stranger');
  // the waypoint at the head of the steps down into the sea: the way down
  {
    const [x, y] = c(LAYOUT.way);
    const s = WAY.awake[Math.floor((T0 + t) * 8) % WAY.awake.length];
    put(x - 0.6, y - 0.6, () => {
      B.sprite(s, ...at(x, y));
      if (s.lights?.length) lights.push({ s, x: at(x, y)[0], y: at(x, y)[1] });
    });
    lights.push({ x: at(x, y)[0], y: at(x, y)[1] - 4, r: 40, c: '#22d0e0', a: 0.35 });
    if (!std) put(x + 1.4, y + 1.4, () => paintStair(B));
    label(x + 1.6, y + 1.6, 4, 'way down');
  }
  // the gate, the record, the trophies, the torches: the Shaft's Rim's, drawn at the game's standard (art/shaft_props.ts)
  for (const [kind, p, d, sh] of [['gate', LAYOUT.gate, [1.5, 0.76], 0.9], ['record', LAYOUT.record, [0.5, 0.63], 0.4], ['trophies', LAYOUT.trophies, [1.5, 0.7], 0.9]] as const) {
    const ax = kind === 'record' ? 0.5 : 1.5;
    put(p[0] + d[0], p[1] + d[1], () => {
      const [gx, gy] = at(p[0] + ax, p[1] + 0.5);
      const s = kind === 'gate' ? P3.gate : kind === 'record' ? P3.record : P3.trophies;
      B.shadow(gx, gy, sh);
      B.sprite(s, gx, gy);
      if (s.lights?.length) lights.push({ s, x: gx, y: gy });
    });
    label(p[0] + ax, p[1] + 0.4, kind === 'gate' ? 84 : kind === 'record' ? 60 : 46, kind);
  }
  for (const [x, y] of LAYOUT.torches) {
    put(x, y, () => {
      const [gx, gy] = at(x, y);
      B.shadow(gx, gy, 0.22);
      B.sprite(P3.post, gx, gy);
      const fl = P3.flame[(Math.floor(t * 30) + Math.round(x * 7 + y * 3)) % TORCH_FRAMES];
      B.sprite(fl, gx, gy);
      lights.push({ s: fl, x: gx, y: gy });
      lights.push({ x: gx, y: gy - 26, r: 60, c: '#ff8a2a', a: 0.22 });
    });
  }
  for (const t2 of LAYOUT.braziers) {
    const p = c(t2);
    put(p[0], p[1], () => {
      const s = props.brazier[1];
      const [gx, gy] = at(p[0], p[1]);
      B.shadow(gx, gy, 0.3);
      B.sprite(s, gx, gy);
      lights.push({ s, x: gx, y: gy });
      lights.push({ x: gx, y: gy - 20, r: 70, c: '#ff8a2a', a: 0.22 });
    });
  }
  // the ring of standing stones round the whole isle
  if (std) {
    const D = standard();
    for (const st of ISLE_STONES) {
      put(st.x, st.y + 0.2, () => {
        const [gx, gy] = at(st.x, st.y);
        const sp = D.stones[st.v];
        B.shadow(gx, gy, 0.3);
        B.sprite(sp, gx, gy);
        if (sp.lights?.length) lights.push({ s: sp, x: gx, y: gy });
      });
    }
  } else {
    for (const s of STONES) {
      const [x, y] = polar(s.a, ISLE.ring);
      put(x, y + 0.2, () => paintStanding(B, s));
    }
    put(LAYOUT.portal[0] + 1, LAYOUT.portal[1] + 1, () => portalPosts(B, true));
  }
  // the knight
  if (heroAt) {
    const s = hero.front.idle[0];
    put(heroAt[0], heroAt[1], () => {
      const [gx, gy] = at(heroAt[0], heroAt[1]);
      B.shadow(gx, gy, 0.36);
      B.sprite(s, gx, gy);
      if (s.lights?.length) lights.push({ s, x: gx, y: gy });
    });
  }
  puts.sort((a, b) => a.d - b.d).forEach((p) => p.f());

  // ---- the canvas, the lights added over it (as the game draws them)
  const cv = document.createElement('canvas');
  cv.width = GW * 2;
  cv.height = GH * 2;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.putImageData(new ImageData(B.d, GW * 2, GH * 2), 0, 0);
  g.imageSmoothingEnabled = false;
  g.setTransform(2, 0, 0, 2, 0, 0);
  for (const l of lights) {
    if (l.s) drawLights(g, l.s, Math.round(l.x), Math.round(l.y));
    else drawGlow(g, l.x, l.y, l.r ?? 40, l.c ?? '#ff8a2a', l.a ?? 0.3);
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  return { cv, labels };
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE PICTURES

export const VIEWS: readonly { hero: [number, number]; caption: string }[] = [
  { hero: [13.6, 14.6], caption: "At the wordsmith's bench" },
  { hero: [15.4, 17.6], caption: 'At the way down into the sea' },
  { hero: [11.2, 8.0], caption: 'At the gate and the record' },
];
const WHOLE = { x: 490 - 300, y: 30, w: 600, h: 430 };
const CAP = 90;

function main(): void {
  const mode0 = decodeURIComponent(location.hash.slice(1)) || 'whole';
  // (whole2, view2:n: STEP 2, drawn at the game's standard)
  const std = mode0.startsWith('whole2') || mode0.startsWith('view2');
  const mode = mode0.replace('whole2', 'whole').replace('view2', 'view');
  const out = document.createElement('canvas');
  document.body.style.margin = '0';
  document.body.style.background = '#05040f';
  document.body.appendChild(out);
  out.style.display = 'block';
  const g = (): CanvasRenderingContext2D => out.getContext('2d') as CanvasRenderingContext2D;
  if (mode === 'whole') {
    const { cv, labels } = scene(null, 2.0, std);
    if (std) labels.length = 0;
    out.width = WHOLE.w * 2;
    out.height = WHOLE.h * 2 + CAP;
    const G = g();
    G.imageSmoothingEnabled = false;
    G.fillStyle = '#05040f';
    G.fillRect(0, 0, out.width, out.height);
    G.drawImage(cv, WHOLE.x * 2, WHOLE.y * 2, WHOLE.w * 2, WHOLE.h * 2, 0, 0, WHOLE.w * 2, WHOLE.h * 2);
    const placed: [number, number, number][] = [];
    for (const l of labels) {
      const sc = 3;
      const w = textWidth(l.text) * sc;
      let x = Math.round((l.x - WHOLE.x) * 2 - w / 2);
      let y = Math.round((l.y - WHOLE.y) * 2 - 26);
      for (const dy of [0, -26, 26, -52, 52]) {
        if (!placed.some(([a, b, c]) => x < a + c + 8 && x + w + 8 > a && Math.abs(y + dy - b) < 26)) {
          y += dy;
          break;
        }
      }
      x = Math.max(4, Math.min(out.width - w - 4, x));
      placed.push([x, y, w]);
      G.fillStyle = 'rgba(6,5,16,0.75)';
      G.fillRect(x - 4, y - 3, w + 8, 27);
      drawText(G, l.text, x, y, '#f2ecd8', { scale: sc });
    }
    G.fillStyle = '#0d1030';
    G.fillRect(0, WHOLE.h * 2, out.width, CAP);
    drawText(G, std ? 'THE ISLE OF STONES, DRAWN' : 'THE ISLE OF STONES, WHOLE', 20, WHOLE.h * 2 + 22, '#e9ecff', { scale: 6 });
    if (STD) console.log(`the isle's ground, lights and stones painted in ${STD.ms.toFixed(0)} ms`);
  } else {
    const n = Math.max(1, Math.min(3, Number(mode.split(':')[1]) || 1));
    const v = VIEWS[n - 1];
    const { cv } = scene(v.hero, 2.0, std);
    const [hx, hy] = at(v.hero[0], v.hero[1]);
    const PW = 507;
    const PH = 234;
    out.width = PW * 2;
    out.height = PH * 2 + 60;
    const G = g();
    G.imageSmoothingEnabled = false;
    G.fillStyle = '#07060f';
    G.fillRect(0, 0, out.width, out.height);
    G.drawImage(cv, Math.round((PW / 2 - hx) * 2), Math.round((PH / 2 - (hy - 14)) * 2));
    G.fillStyle = '#0d1030';
    G.fillRect(0, PH * 2, out.width, 60);
    drawText(G, `${n}  ${v.caption.toUpperCase()}`, 16, PH * 2 + 14, '#e9ecff', { scale: 4 });
  }
  (window as unknown as { __ready: boolean }).__ready = true;
}
main();
