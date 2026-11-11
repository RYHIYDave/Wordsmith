// Dev page: THE ENDLESS TOWN, THE SHAFT'S RIM (his pick of the ten, 11 Nov 2026), as the closer mock-up he locks it in from:
// the town at the game's own scale (a tile 32 x 16 game pixels, every game pixel two picture pixels), the game's own
// pictures for what the game has (the townsfolk, the smithy, the bazaar, the wordsmith's ring, the Lexicon, the stash, the
// waypoint, the braziers, the knight), and painted here, as a mock-up, only what is new: the rim's paving, the shaft and its
// stair, the kerb, the portal's tongue, the gate standing free, the record stone, the trophies wall, the torches.
// Nothing of the game imports it (tests/endless_town_options.test.ts).
//   node tools/preview.mjs src/dev/preview_shaft_rim.ts docs/mockups/endless_town/pictures/rim_whole.png 1200 700 whole
//   node tools/preview.mjs src/dev/preview_shaft_rim.ts docs/mockups/endless_town/pictures/rim_view_1.png 1014 528 view:1
//   (view:2 the brink; view:3 the gate)

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

// ---------------------------------------------------------------------------------------------------------------------------
// THE PLACE, in tiles: the rim's middle, the shaft's mouth, the town's edge, the cliff round it.

/** The middle of the shaft (tile units); its mouth's radius; the paved rim's outer edge; the cliff behind. */
export const RIM = { cx: 12, cy: 12, pit: 3.8, kerb: 0.3, town: 8, cliff: 9.6 };
const deg = (d: number): number => (d * Math.PI) / 180;
const polar = (a: number, r: number): [number, number] => [RIM.cx + Math.cos(deg(a)) * r, RIM.cy + Math.sin(deg(a)) * r];
const tileOf = (a: number, r: number): [number, number] => polar(a, r).map((v) => Math.floor(v)) as [number, number];

/** THE LAYOUT: each station's tile (its anchor tile, as the game's TOWN gives one). Angles: 0 is +x (down-right on the screen), -135 the back. */
export const LAYOUT = {
  gate: tileOf(-133, 6.9),
  record: tileOf(-158, 6.6),
  trophies: tileOf(-103, 6.9),
  way: tileOf(-80, 4.3),
  forge: tileOf(-28, 7.3),
  tentBack: tileOf(8, 6.3),
  wordsmith: tileOf(106, 5.5),
  lexicon: tileOf(142, 5.6),
  stash: tileOf(160, 6.6),
  stranger: tileOf(-178, 7.4),
  portal: polar(172, 1.75),
  braziers: [tileOf(-122, 7.7), tileOf(-145, 7.7), tileOf(-62, 7.5), tileOf(40, 7.4), tileOf(72, 7.4), tileOf(128, 7.6)],
};
/** Where the stair leaves the rim (the angle on the shaft's wall), the step that is the way down. */
const STAIR_AT = -86;

// ---------------------------------------------------------------------------------------------------------------------------
// THE PICTURE: GW x GH game pixels, each two by two picture pixels.

const GW = 820;
const GH = 470;
const OX = 410;
const OY = 248 - (RIM.cx + RIM.cy) * 8;
const at = (x: number, y: number, z = 0): [number, number] => [OX + (x - y) * 16, OY + (x + y) * 8 - z];
const [PCX, PCY] = at(RIM.cx, RIM.cy);

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
// THE RIM'S STONE: the town's stone at the top of the stair with no bottom (art/endless_stair.ts STONES, its last), a little
// violet in the night. The game's own things are painted in it (makeTownProps(theme)).

const STONE = ['#1c161e', '#3a3038', '#52444c', '#6e5e64', '#958474', '#ae9a88'];
const THEME: Theme = {
  id: 'shaftrim',
  mortar: STONE[0],
  slab: [STONE[1], STONE[2], STONE[3], STONE[4]],
  slabs: 1.6,
  cap: [STONE[0], STONE[3], STONE[4], STONE[4], STONE[5]],
  capLow: [STONE[0], STONE[2], STONE[3], STONE[3], STONE[4]],
  lit: [STONE[0], STONE[2], STONE[3], STONE[4], STONE[5]],
  shade: [STONE[0], STONE[1], STONE[2], STONE[3], STONE[4]],
} as Theme;
const S3 = (a: number, b: number, c: number): [RGB, RGB, RGB] => [rgb(STONE[a]), rgb(STONE[b]), rgb(STONE[c])];
const ROCK: [RGB, RGB, RGB] = [rgb('#16121a'), rgb('#241e28'), rgb('#342c36')];
/** Each floor's own stone, storey under storey down the shaft (as the splash has them): the town's, the prison's, the canyon's, the fen's, the High City's, the quarry's. */
const STOREYS = [['#52444c', '#958474'], ['#2c2a36', '#4e4a5a'], ['#6c463a', '#be8262'], ['#2e3a22', '#5a5661'], ['#64606c', '#c4bebc'], ['#4d465c', '#8a8094']].map((p) => p.map(rgb));
const NIGHT = rgb('#07060f');
const CY: RGB = rgb('#22d0e0');
const FIRE: RGB = rgb('#ff8a2a');

// ---------------------------------------------------------------------------------------------------------------------------
// THE GROUND: the cliff round the back, the rough rock beyond the town, the paved rim, the kerb, the shaft.

/** For a column x, where a round wall of radius r (tiles) about the middle meets the ground, at its back (-1) or front (+1). */
function rimY(x: number, r: number, side: -1 | 1): number | null {
  const u = (x + 0.5 - PCX) / (16 * r);
  if (Math.abs(u) > Math.SQRT2) return null;
  return PCY + side * 8 * r * Math.SQRT2 * Math.sqrt(1 - (u * u) / 2);
}
const STOREY = 24;
const STAIR_DROP = 30 / Math.PI;
const PIT_DEEP = 84;

function paintGround(B: Buf): void {
  for (let y = 0; y < GH; y++)
    for (let x = 0; x < GW; x++) {
      const u = (x + 0.5 - OX) / 16;
      const v = (y + 0.5 - OY) / 8;
      const tx = (u + v) / 2;
      const ty = (v - u) / 2;
      const r = Math.hypot(tx - RIM.cx, ty - RIM.cy);
      const a = Math.atan2(ty - RIM.cy, tx - RIM.cx);
      let c: RGB;
      if (r <= RIM.pit) c = pitAt(x, y);
      else if (r <= RIM.pit + RIM.kerb) c = rgb(STONE[(Math.floor((a * 180) / Math.PI / 9) & 1) ? 4 : 3]);
      else if (r <= RIM.town) {
        // (the paving: rings of slabs round the mouth, each ring cut into more slabs the further out it lies)
        const ring = Math.floor((r - RIM.pit - RIM.kerb) / 0.95);
        const fr = (r - RIM.pit - RIM.kerb) / 0.95 - ring;
        const n = 18 + ring * 6;
        const sa = ((a / (Math.PI * 2)) * n + (ring & 1) * 0.5 + 100) % 1;
        const si = Math.floor(((a / (Math.PI * 2)) * n + (ring & 1) * 0.5 + 100));
        const k = hash(si, ring, 3);
        if (fr < 0.07 || sa < 0.05) c = rgb(STONE[0]);
        else c = rgb(STONE[k < 0.2 ? 1 : k > 0.86 ? 3 : 2]);
        if (fr > 0.85 && sa > 0.05) c = mixRGB(c, rgb(STONE[3]), 0.5);
        // (worn darker out toward the edge, where the light does not reach)
        c = mul(c, 0.95 - 0.25 * band((r - RIM.pit) / (RIM.town - RIM.pit), 4));
      } else {
        // (beyond the town: rough rock, and at the back the cliff of the great hollow the shaft is sunk in)
        c = mixRGB(ROCK[0], ROCK[1], band(fbm(tx * 0.8, ty * 0.8, 7), 3));
        if (r > RIM.cliff) c = NIGHT;
      }
      B.set(x, y, c);
    }
  // (the cliff: a round wall at RIM.cliff, its inner face seen at the back, courses of rough stone, darker as it rises)
  for (let x = 0; x < GW; x++) {
    const yb = rimY(x, RIM.cliff, -1);
    if (yb === null) continue;
    for (let y = Math.floor(yb - 150); y < yb; y++) {
      const hgt = yb - y;
      const course = Math.floor((hgt + Math.floor(x / 23) * 4) / 9);
      let c = mixRGB(ROCK[1], ROCK[2], band(fbm(x / 14, course, 9), 3));
      if ((hgt + Math.floor(x / 23) * 4) % 9 < 1) c = ROCK[0];
      if (hash(Math.floor(x / 11), course, 4) < 0.12) c = mul(c, 0.8);
      B.set(x, y, mixRGB(c, NIGHT, Math.min(1, band(hgt / 150, 5) * 1.1)));
    }
  }
  // (the kerb at the brink: a low lip, its face toward the shaft seen on the far side)
  for (let x = 0; x < GW; x++) {
    const yb = rimY(x, RIM.pit, -1);
    if (yb === null) continue;
    for (let k = 0; k < 3; k++) B.set(x, yb + k, mul(rgb(STONE[2]), 0.8 - k * 0.15));
  }
}

/** A pixel inside the shaft's mouth: the shaft's far wall, `d` game pixels down from the brink. */
function pitAt(x: number, y: number): RGB {
  const R = RIM.pit;
  const u = (x + 0.5 - PCX) / (16 * R);
  const s = -Math.sqrt(Math.max(0, 1 - (u * u) / 2));
  const yb = PCY + 8 * R * Math.SQRT2 * s;
  const d = y + 0.5 - yb - 3;
  const th = Math.atan2(s, u / Math.SQRT2) - Math.PI / 4;
  const k = Math.floor(Math.max(0, d) / STOREY);
  const inK = Math.max(0, d) - k * STOREY;
  const [lo, hi] = STOREYS[k % STOREYS.length];
  // (lit from the upper left: the wall to the right of the far side takes it)
  const lit = 0.5 + 0.5 * Math.cos(th + Math.PI * 0.85);
  let c = mixRGB(lo, hi, 0.4 + 0.45 * band(lit, 3));
  const blocks = Math.floor(th * R * 3 + (Math.floor(inK / 6) & 1) * 0.5);
  if (inK % 6 < 1 || hash(blocks, Math.floor(d / 6), 5) < 0.06) c = mul(c, 0.7);
  if ((th * R * 3 + (Math.floor(inK / 6) & 1) * 0.5) % 1 < 0.08) c = mul(c, 0.75);
  if (inK < 2) c = mul(hi, 0.7);
  // (a doorway in every storey, each further round; a torch beside it)
  const door = deg(-150) + k * 2.2;
  const dd = Math.atan2(Math.sin(th - door), Math.cos(th - door));
  if (Math.abs(dd) < 0.21 && inK > 5) c = mixRGB(hi, rgb('#ffffff'), 0.1);
  if (Math.abs(dd) < 0.15 && inK > 7) c = rgb('#08070e');
  if (Math.abs(dd) < 0.16 && inK > 7 && k % STOREYS.length === 1 && (Math.floor((th * 60)) & 1)) c = rgb('#3a3644');
  if (Math.abs(dd - 0.3) < 0.03 && inK > 9 && inK < 12) c = FIRE;
  // THE STAIR: a flight along the wall from the brink at STAIR_AT, down and round, a storey and a half a turn
  const run = ((deg(STAIR_AT) - th) % (Math.PI * 2) + Math.PI * 4) % (Math.PI * 2);
  const ds = Math.floor(run / 0.2) * 0.2 * STAIR_DROP;
  const edge = run % 0.2 < 0.03;
  for (let n = 0; n < 4; n++) {
    const t = d - (ds + n * 60);
    if (t >= -2 && t < 2) c = edge ? mul(lo, 0.5) : mixRGB(rgb('#e8dcc8'), hi, 0.35);
    else if (t >= 2 && t < 5) c = mul(lo, 0.4);
  }
  // (deeper, darker; and far down the enemy's fire, dim)
  const fog = Math.min(1, Math.max(0, d) / PIT_DEEP);
  c = mixRGB(c, NIGHT, band(fog, 5));
  if (Math.abs(dd - 0.3) < 0.03 && inK > 9 && inK < 12) c = FIRE;
  return c;
}

/** The far fire, dim, only in the shaft and only far down it: the enemy's pink burning to gold. */
function pitFire(B: Buf): void {
  const R = RIM.pit;
  for (let y = 0; y < GH; y++)
    for (let x = 0; x < GW; x++) {
      const u = (x + 0.5 - PCX) / (16 * R);
      const fy = rimY(x, R, 1);
      const by = rimY(x, R, -1);
      if (fy === null || by === null || y < by || y > fy - 2) continue;
      const d = y - by;
      const a = Math.max(0, (d - 56) / 28) * Math.max(0, 1 - Math.abs(u) * 1.4);
      if (a <= 0) continue;
      B.add(x, y, a > 0.45 ? rgb('#ffb070') : rgb('#ff4f8a'), band(a, 3) * 0.5);
    }
}

// ---------------------------------------------------------------------------------------------------------------------------
// WHAT IS NEW, painted as a mock-up.

/** The portal's place: a tongue of stone out from the brink over the drop, ending in a round landing kept clear. */
function paintPortal(B: Buf): void {
  const [lx, ly] = LAYOUT.portal;
  const [ex, ey] = polar(170, RIM.pit + 0.2);
  const nx = -(ey - ly);
  const ny = ex - lx;
  const nl = Math.hypot(nx, ny);
  const w = 0.45;
  const q = (x: number, y: number, z: number): [number, number] => at(x, y, z);
  const pts: [number, number, number][] = [[lx + (nx / nl) * w, ly + (ny / nl) * w, 0], [ex + (nx / nl) * w, ey + (ny / nl) * w, 0], [ex - (nx / nl) * w, ey - (ny / nl) * w, 0], [lx - (nx / nl) * w, ly - (ny / nl) * w, 0]];
  // (its underside, then its top)
  B.poly(pts.map(([x, y]) => q(x, y, -8)), mul(rgb(STONE[1]), 0.8));
  const [cx, cy] = at(lx, ly);
  B.ellipse(cx, cy + 6, 1.0 * 22.6, 1.0 * 11.3, mul(rgb(STONE[1]), 0.8));
  B.poly(pts.map(([x, y]) => q(x, y, 0)), (px, py) => ((px + py) % 9 === 0 ? rgb(STONE[2]) : rgb(STONE[4])));
  B.ellipse(cx, cy, 1.0 * 22.6, 1.0 * 11.3, (px, py, n) => (n > 0.9 ? rgb(STONE[5]) : n > 0.82 ? rgb(STONE[1]) : (Math.floor(n * 4) & 1 ? rgb(STONE[4]) : rgb(STONE[3]))));
}
function portalPosts(B: Buf, near: boolean): void {
  const [lx, ly] = LAYOUT.portal;
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + 0.2;
    const px = lx + Math.cos(a) * 0.9;
    const py = ly + Math.sin(a) * 0.9;
    if ((Math.sin(a) + Math.cos(a) > 0) !== near) continue;
    B.box(px - 0.08, py - 0.08, 0.16, 0.16, 7, S3(1, 2, 4));
  }
}

/** The gate, standing free at the back, facing the shaft; on its lintel the three sockets for the next dungeon's words. */
function paintGate(B: Buf): void {
  const [x, y] = LAYOUT.gate;
  const L = S3(1, 3, 4);
  B.box(x, y, 0.6, 0.6, 54, L);
  B.box(x + 2.6, y, 0.6, 0.6, 54, L);
  B.box(x - 0.1, y - 0.05, 3.4, 0.7, 12, S3(1, 3, 5), 54);
  const p = [at(x + 0.6, y + 0.6, 0), at(x + 2.6, y + 0.6, 0), at(x + 2.6, y + 0.6, 54), at(x + 0.6, y + 0.6, 54)];
  B.poly(p, (px, py) => mixRGB(rgb('#0a0814'), rgb('#141026'), band((py - p[2][1]) / 54, 3)));
  for (let k = 0; k < 3; k++) {
    const [sx, sy] = at(x + 1.05 + k * 0.55, y + 0.65, 60);
    B.ellipse(sx, sy, 3.5, 3.5, (px, py, n) => (n > 0.7 ? rgb(STONE[1]) : rgb('#0d4e5c')));
  }
}

/** PROPOSED, KEPT AT HIS WORD: the record stone, a tall stone with a notch cut for every endless level reached (seven shown). */
function paintRecord(B: Buf): void {
  const [x, y] = LAYOUT.record;
  B.box(x + 0.15, y + 0.15, 0.7, 0.7, 64, S3(1, 3, 4));
  B.box(x + 0.05, y + 0.05, 0.9, 0.9, 6, S3(1, 2, 3));
  for (let k = 0; k < 12; k++) {
    const [nx, ny] = at(x + 0.5, y + 0.85, 10 + k * 4.4);
    B.line(nx - 6, ny - 3, nx + 1, ny + 1, k < 7 ? rgb('#e8dcc4') : mul(rgb(STONE[3]), 0.7));
  }
}
/** PROPOSED, KEPT AT HIS WORD: the trophies wall, four mounts, one for each boss whose tablet quarter he holds (two shown). */
function paintTrophies(B: Buf): void {
  const [x, y] = LAYOUT.trophies;
  B.box(x - 0.2, y, 3.0, 0.5, 30, S3(1, 3, 4));
  for (let k = 0; k < 4; k++) {
    const [mx, my] = at(x + 0.2 + k * 0.7, y + 0.5, 17);
    B.ellipse(mx, my, 6, 6, (px, py, n) => (n > 0.8 ? rgb('#3a2418') : rgb('#5a3a26')));
    if (k < 2) {
      // (a boss's head, small, as a mount: a skull and horn, bone and dark)
      B.ellipse(mx, my - 1, 3.5, 3.5, rgb('#d8ccb4'));
      B.set(mx - 1, my - 1, rgb('#141018'));
      B.set(mx + 1, my - 1, rgb('#141018'));
      B.line(mx + 3, my - 3, mx + 5, my - 7, rgb('#b8a88c'));
      B.line(mx - 3, my - 3, mx - 5, my - 7, rgb('#b8a88c'));
    } else B.ellipse(mx, my, 2, 2, rgb('#1a120c'));
  }
}
/** A torch on a post: wood, iron cup, an honest flame; its light is added after. */
function paintTorch(B: Buf, x: number, y: number): [number, number] {
  const [px, py] = at(x, y);
  for (let k = 0; k < 26; k++) B.set(px, py - k, rgb(k < 24 ? '#4a3026' : '#2a2a30'));
  for (let k = 0; k < 26; k++) B.set(px + 1, py - k, rgb('#2e1c16'));
  B.set(px, py - 27, FIRE);
  B.set(px + 1, py - 27, FIRE);
  B.set(px, py - 28, rgb('#ffd070'));
  B.set(px + 1, py - 29, FIRE);
  return [px, py - 28];
}
/** THE TABLET'S SOCKET in the wordsmith's bench: a round hollow cut in four, empty, on the slab's top. */
function paintSocket(B: Buf, gx: number, gy: number): void {
  B.ellipse(gx, gy, 6.5, 3.4, (x, y, n) => (n > 0.8 ? rgb(STONE[5]) : rgb('#0c0a14')));
  B.line(gx - 5, gy, gx + 5, gy, rgb(STONE[2]));
  B.line(gx, gy - 2, gx, gy + 2, rgb(STONE[2]));
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE SCENE

const hero = makeHeroArt3().of('warrior', { twoHanded: false, town: true });
const props = makePropArt();
const ART: TownArt = { town: makeTownProps(THEME), folk: makeTownsfolk() };
const WAY = makeWaypointArt(THEME);
const TIME = 1.35;

/** The ring's six stones round the wordsmith, as the game's TOWN has them; the slab one tile toward the eye of him. */
const RUNE_STONES: readonly (readonly [number, number])[] = [[-2, -1], [-1, -2], [1, -2], [-2, 1], [2, -1], [-1, 2]];

interface Put { d: number; f: () => void }
interface Lit { s?: Sprite; x: number; y: number; r?: number; c?: string; a?: number }

export function scene(heroAt: [number, number] | null): { cv: HTMLCanvasElement; labels: { x: number; y: number; text: string }[] } {
  const B = new Buf();
  const lights: Lit[] = [];
  const labels: { x: number; y: number; text: string }[] = [];
  const label = (x: number, y: number, z: number, text: string): void => {
    const [px, py] = at(x, y, z);
    labels.push({ x: px, y: py, text });
  };
  paintGround(B);
  pitFire(B);
  // ---- what lies flat: the bazaar's rug, the ring of runes, the portal's tongue (out over the drop)
  const c = (t: readonly [number, number]): [number, number] => [t[0] + 0.5, t[1] + 0.5];
  const flat = (kind: string, p: [number, number]): void => {
    const s = townSprite(ART, kind, 0, TIME);
    if (s) B.sprite(s, ...at(p[0], p[1]));
  };
  const [wx, wy] = LAYOUT.wordsmith;
  const [bx, by] = LAYOUT.tentBack;
  flat('rug', c([bx, by + 1]));
  flat('runeRing', c([wx, wy]));
  paintPortal(B);
  portalPosts(B, false);

  // ---- what stands, nearest last
  const puts: Put[] = [];
  const put = (x: number, y: number, f: () => void): void => {
    puts.push({ d: x + y, f });
  };
  const stand = (kind: string, p: [number, number], variant = 0, shadow = 0.36): void => {
    const s = townSprite(ART, kind, variant, TIME + variant * 0.37);
    if (!s) return;
    put(p[0], p[1], () => {
      const [gx, gy] = at(p[0], p[1]);
      if (shadow) B.shadow(gx, gy, shadow);
      B.sprite(s, gx, gy);
      if (s.lights?.length) lights.push({ s, x: gx, y: gy });
      if (kind === 'runeSlab') paintSocket(B, gx, gy - 9);
    });
  };
  // the smithy (as the game's TOWN lays it: the rack three tiles along from the forge, the trough beside, the anvil and the armourer before it)
  const [fx, fy] = LAYOUT.forge;
  stand('forge', c([fx, fy]), 0, 0.5);
  stand('rack', c([fx - 3, fy]), 0, 0.3);
  stand('trough', c([fx + 1, fy]));
  stand('anvil', c([fx - 1, fy + 2]));
  stand('armourer', c([fx - 1, fy + 1]));
  label(fx - 0.5, fy + 0.5, 64, 'smith');
  // the bazaar
  stand('tentBack', c([bx, by]), 0, 0);
  stand('mystic', c([bx, by + 1]));
  stand('tentTable', c([bx, by + 2]), 0, 0.3);
  label(bx + 0.5, by + 1, 70, 'bazaar');
  // the wordsmith's ring, the bench with the socket
  stand('wordsmith', c([wx, wy]));
  stand('runeSlab', c([wx, wy + 1]));
  RUNE_STONES.forEach(([dx, dy], i) => stand('runeStone', c([wx + dx, wy + dy]), i, 0.3));
  label(wx + 0.5, wy + 0.5, 62, 'wordsmith');
  label(wx + 1.6, wy + 2.4, 0, 'socket');
  // the Lexicon, the stash, the stranger
  stand('lexicon', c(LAYOUT.lexicon));
  label(LAYOUT.lexicon[0] + 0.5, LAYOUT.lexicon[1] + 0.5, 50, 'lexicon');
  stand('stash', c(LAYOUT.stash));
  label(LAYOUT.stash[0] + 0.5, LAYOUT.stash[1] + 0.5, 22, 'stash');
  stand('stranger', c(LAYOUT.stranger));
  label(LAYOUT.stranger[0] + 0.5, LAYOUT.stranger[1] + 0.5, 50, 'stranger');
  // the waypoint at the stair's head: the way down
  {
    const [x, y] = c(LAYOUT.way);
    const s = WAY.awake[0];
    put(x - 0.6, y - 0.6, () => {
      B.sprite(s, ...at(x, y));
      if (s.lights?.length) lights.push({ s, x: at(x, y)[0], y: at(x, y)[1] });
    });
    lights.push({ x: at(x, y)[0], y: at(x, y)[1] - 4, r: 40, c: '#22d0e0', a: 0.35 });
    label(x, y, 30, 'way down');
  }
  // the gate, the record, the trophies (new)
  put(LAYOUT.gate[0] + 1.6, LAYOUT.gate[1] + 0.6, () => paintGate(B));
  label(LAYOUT.gate[0] + 1.6, LAYOUT.gate[1] + 0.3, 80, 'gate');
  put(LAYOUT.record[0] + 0.5, LAYOUT.record[1] + 0.5, () => paintRecord(B));
  label(LAYOUT.record[0] + 0.5, LAYOUT.record[1] + 0.5, 82, 'record');
  put(LAYOUT.trophies[0] + 1.3, LAYOUT.trophies[1] + 0.5, () => paintTrophies(B));
  label(LAYOUT.trophies[0] + 1.3, LAYOUT.trophies[1] + 0.25, 46, 'trophies');
  label(LAYOUT.portal[0], LAYOUT.portal[1], 22, 'portal');
  // the braziers (the game's own), torches on posts by the stations that have no fire of their own (new)
  for (const t of LAYOUT.braziers) {
    const p = c(t);
    put(p[0], p[1], () => {
      const s = props.brazier[1];
      const [gx, gy] = at(p[0], p[1]);
      B.shadow(gx, gy, 0.3);
      B.sprite(s, gx, gy);
      lights.push({ s, x: gx, y: gy });
      lights.push({ x: gx, y: gy - 20, r: 70, c: '#ff8a2a', a: 0.22 });
    });
  }
  for (const [x, y] of [[LAYOUT.stash[0] + 1.6, LAYOUT.stash[1] + 0.2], [LAYOUT.lexicon[0] - 0.4, LAYOUT.lexicon[1] + 1.6], [LAYOUT.tentBack[0] - 1.3, LAYOUT.tentBack[1] - 1.0], [LAYOUT.record[0] + 1.6, LAYOUT.record[1] + 1.4]] as const) {
    put(x, y, () => {
      const [lx, ly] = paintTorch(B, x, y);
      lights.push({ x: lx, y: ly, r: 56, c: '#ff8a2a', a: 0.3 });
    });
  }
  // the kerb's posts round the brink, but where the stair leaves it and where the tongue goes out
  for (let k = 0; k < 24; k++) {
    const a = k * 15 + 7.5;
    const off = (b: number): number => Math.abs(((a - b + 540) % 360) - 180);
    if (off(STAIR_AT) < 12 || off(170) < 14) continue;
    const [x, y] = polar(a, RIM.pit + 0.15);
    put(x, y, () => B.box(x - 0.09, y - 0.09, 0.18, 0.18, 8, S3(1, 3, 5)));
  }
  put(LAYOUT.portal[0] + 0.9, LAYOUT.portal[1] + 0.9, () => portalPosts(B, true));
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

/** Where the knight stands in each view, and its caption. */
export const VIEWS: readonly { hero: [number, number]; caption: string }[] = [
  { hero: [LAYOUT.wordsmith[0] - 1.3, LAYOUT.wordsmith[1] - 1.6], caption: "At the wordsmith's bench" },
  { hero: [polar(-18, RIM.pit + 0.9)[0], polar(-18, RIM.pit + 0.9)[1]], caption: 'At the brink, looking down' },
  { hero: [LAYOUT.gate[0] + 1.8, LAYOUT.gate[1] + 2.4], caption: 'At the gate and the record' },
];
const WHOLE = { x: 410 - 300, y: 62, w: 600, h: 312 };
const CAP = 90;

function main(): void {
  const mode = decodeURIComponent(location.hash.slice(1));
  const out = document.createElement('canvas');
  document.body.style.margin = '0';
  document.body.style.background = '#05040f';
  document.body.appendChild(out);
  out.style.display = 'block';
  if (mode === 'whole') {
    const { cv, labels } = scene(null);
    out.width = WHOLE.w * 2;
    out.height = WHOLE.h * 2 + CAP;
    const g = out.getContext('2d') as CanvasRenderingContext2D;
    g.imageSmoothingEnabled = false;
    g.fillStyle = '#05040f';
    g.fillRect(0, 0, out.width, out.height);
    g.drawImage(cv, WHOLE.x * 2, WHOLE.y * 2, WHOLE.w * 2, WHOLE.h * 2, 0, 0, WHOLE.w * 2, WHOLE.h * 2);
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
      g.fillStyle = 'rgba(6,5,16,0.75)';
      g.fillRect(x - 4, y - 3, w + 8, 27);
      drawText(g, l.text, x, y, '#f2ecd8', { scale: sc });
    }
    g.fillStyle = '#0d1030';
    g.fillRect(0, WHOLE.h * 2, out.width, CAP);
    drawText(g, "THE SHAFT'S RIM, WHOLE", 20, WHOLE.h * 2 + 22, '#e9ecff', { scale: 6 });
  } else {
    const n = Math.max(1, Math.min(3, Number(mode.split(':')[1]) || 1));
    const v = VIEWS[n - 1];
    const { cv } = scene(v.hero);
    const [hx, hy] = at(v.hero[0], v.hero[1]);
    const PW = 507;
    const PH = 234;
    out.width = PW * 2;
    out.height = PH * 2 + 60;
    const g = out.getContext('2d') as CanvasRenderingContext2D;
    g.imageSmoothingEnabled = false;
    g.fillStyle = '#07060f';
    g.fillRect(0, 0, out.width, out.height);
    g.drawImage(cv, Math.round((PW / 2 - hx) * 2), Math.round((PH / 2 - (hy - 14)) * 2));
    g.fillStyle = '#0d1030';
    g.fillRect(0, PH * 2, out.width, 60);
    drawText(g, `${n}  ${v.caption.toUpperCase()}`, 16, PH * 2 + 14, '#e9ecff', { scale: 4 });
  }
  (window as unknown as { __ready: boolean }).__ready = true;
}
main();
