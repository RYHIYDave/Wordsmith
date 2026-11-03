// FLOOR 20, THE QUIET TOWER (the High City): THE PAINTING, A FIRST LOOK. A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His doc "Wordsmith Act 2, Part Two: The High City (Levels 16–20)" (approved by him: “Yes, go (Recommended)”), level 20,
// THE QUIET TOWER: "The lair floor that ends Act 2: the highest tower of the High City, where the last chapter was
// taken."; its layout "a climb up the tower's spiralling floors (a scriptorium, a bell-less belfry, rooms the fog has
// filled) to the open top under the sky."; its story "the torn-out last chapter lies open on the tower's top. It does not
// tell how the story ends. It is a name, and the thing it names is the Hush itself."; its boss the Moth, "Its floor is the
// Tower Top."; its palette "Grey fog, bone white, no colour at all."
//
// TWO PICTURES, each built true in depth (floor 4's Scene, the pieces' own builders from art/floor20.ts set in it):
// - THE TOWER TOP (`paintTowerTop`), the Moth's floor without the Moth: a round platform of pale flags laid in rings, a
//   crenellated parapet round it on a corbel table, the tower's outer wall falling away under it into the fog; the fog
//   sea far below, the tops of the High City's lesser spires and the palace's dome standing out of it, the grey sky over
//   it; in the middle on a dais of two steps the last chapter lying open on its lectern; the trapdoor the stair comes up
//   by, thrown open; the cold beacon; a merlon fallen inward from a gap in the parapet; a heap of torn pages; a wing the
//   Moth shed; a fallen mask; fog lying on the flags and pouring out through the embrasures and down the wall; the
//   Moth's grey dust drifting in the air.
// - THE SCRIPTORIUM (`paintScriptorium`), a floor inside the tower: a round room, its far wall standing (the near cut
//   away, as the game cuts near walls), three lancet windows with the fog's grey day in them, pigeonholes of blank
//   scrolls, the Moth's cocoon split and empty on the wall, a moth-eaten tapestry, the Order's banner gone grey; the
//   tower's stair winding up into the dark; copyists' desks in rows, their stools, presses of blank books against the
//   wall, a chest of blank quires; guttering candles, the one warm light; torn pages, dry ink, the Hush's dust; fog
//   seeping in at a window and lying along the wall's foot.
//
// His art rulebook kept: one camera, the game's (a tile 64 x 32 picture pixels, heights up in picture pixels); light from
// the upper left; three tones or so a material; no black outlines, the seams a deep indigo; strong values, the place a
// step quieter than the figures, every colour under the dullest word's (Colour 4); nothing cyan, no pink, nothing glowing
// but the candles' honest flame and the last chapter's own pale light (Colour 3); real shapes; crisp pixels.

import { Px } from '../engine/px';
import { Scene, toneAt } from '../art/floor4';
import type { V3 } from '../art/floor4';
import { quietHex } from '../art/act2_quiet';
import { SOFT_ID, turned } from '../art/act2_kit';
import { hash, limb } from '../art/kit';
import { fbm, vnoise } from '../art/terrain';
import type { RGB } from '../art/terrain';
import { BONE, TSTONE, bannerMake, beaconIn, candlesIn, chestIn, cocoonMake, deskIn, dustIn, hushDustIn, lecternIn, maskIn, merlonIn, pagesIn, pressIn, stairIn, stoolIn, tapestryMake, trapdoorIn, wingIn } from '../art/floor20';
import type { PieceLight } from '../art/floor20';
import { QT_DEEP, QT_FOG, QT_STONE, ashlar, courseFlags, fogOver, ringFlags } from '../art/quiettower';

export const W = 1200;
export const H = 840;

const TOWARD: V3 = [0.61, 0.61, 0.5];
const dot = (a: readonly number[], b: readonly number[]): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const LIGHT: V3 = (() => {
  const v = [-0.55, 0.45, 0.7];
  const n = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / n, v[1] / n, v[2] / n];
})();
const hexRGB = (c: string): RGB => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const rgbHex = (c: readonly number[]): string => '#' + [0, 1, 2].map((i) => Math.max(0, Math.min(255, Math.round(c[i]))).toString(16).padStart(2, '0')).join('');
const mixc = (a: readonly number[], b: readonly number[], t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const cl01 = (v: number): number => Math.max(0, Math.min(1, v));
const mod = (a: number, m: number): number => ((a % m) + m) % m;
/** Above a threshold, with a checkered pixel or two where it is near it (crisp, never a smear). */
function over(t: number, thr: number, px: number, py: number, band = 0.02): boolean {
  if (t > thr + band) return true;
  if (t < thr - band) return false;
  return (t - thr + band) / (2 * band) > [[0.125, 0.625], [0.875, 0.375]][py & 1][px & 1];
}

/** The id the floor is painted with: soft, so no seam is drawn round what stands on it (as the game draws pieces over its ground). */
const FLOOR_ID = SOFT_ID + 1;

/**
 * A SCENE MOVED: what a piece builds in it at its own (0, 0, 0) is built in the big scene at `d`, its ids `base` on (so
 * that two pieces side by side are seamed apart); what the piece is handed back (a point of the world in its shades and
 * keeps) is in its own frame, as when it is built alone.
 */
function moved(S: Scene, d: readonly number[], base: number): Scene {
  const T = Object.create(S) as Scene;
  const mv = (p: readonly number[]): V3 => [p[0] + d[0], p[1] + d[1], p[2] + d[2]];
  const back = (w: readonly number[]): V3 => [w[0] - d[0], w[1] - d[1], w[2] - d[2]];
  const idOf = (id: number): number => id + base;
  const dd = dot(d, TOWARD);
  T.at = (w) => S.at(mv(w));
  T.put = (x, y, depth, c, id, h = 0) => S.put(x, y, depth + dd, c, idOf(id), h + d[2]);
  T.egg = (c, A, r, shade, id, keep) => S.egg(mv(c), A, r, (n, w) => shade(n, back(w)), idOf(id), keep ? (w) => keep(back(w)) : undefined);
  T.ball = (c, r, ramp, id, keep, bias) => S.ball(mv(c), r, ramp, idOf(id), keep ? (w) => keep(back(w)) : undefined, bias);
  T.quad = (q, shade, id) => S.quad([mv(q[0]), mv(q[1]), mv(q[2]), mv(q[3])], (u, v, w) => shade(u, v, back(w)), idOf(id));
  T.box = (c, A, r, shade, id) => S.box(mv(c), A, r, shade, idOf(id));
  // (a rod as the Scene draws one, on a small picture of its own round it: the Scene's own takes one as big as the whole painting)
  T.rod = (a0, b0, r0, r1, ramp, id, keep) => {
    const a = mv(a0);
    const b = mv(b0);
    const [x0, y0] = S.at(a);
    const [x1, y1] = S.at(b);
    if (![x0, y0, x1, y1].every(Number.isFinite)) return;
    const m = Math.ceil(Math.max(r0, r1) * 1.1) + 3;
    const ox = Math.floor(Math.min(x0, x1)) - m;
    const oy = Math.floor(Math.min(y0, y1)) - m;
    const tmp = new Px(Math.ceil(Math.abs(x1 - x0)) + 2 * m + 2, Math.ceil(Math.abs(y1 - y0)) + 2 * m + 2);
    limb(tmp, x0 - ox, y0 - oy, x1 - ox, y1 - oy, r0 * 1.1, r1 * 1.1, ramp);
    const d0 = dot(a, TOWARD) + (r0 + r1) / 2;
    const d1 = dot(b, TOWARD) + (r0 + r1) / 2;
    const L2 = (x1 - x0) ** 2 + (y1 - y0) ** 2 || 1;
    for (let y = 0; y < tmp.h; y++) {
      for (let x = 0; x < tmp.w; x++) {
        const c = tmp.get(x, y);
        if (!c) continue;
        const X = x + ox;
        const Y = y + oy;
        const t = Math.max(0, Math.min(1, ((X + 0.5 - x0) * (x1 - x0) + (Y + 0.5 - y0) * (y1 - y0)) / L2));
        const w: V3 = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
        if (w[2] < -0.3 || (keep && !keep(back(w)))) continue;
        S.put(X, Y, d0 + (d1 - d0) * t, c, idOf(id), w[2]);
      }
    }
  };
  return T;
}

/** Paint a floor at height `z` over the whole picture: `f(x, y, px, py)` its colour at the world's (x, y) in tiles (null: none there). */
function floorAt(S: Scene, z: number, f: (x: number, y: number, px: number, py: number) => string | null, id = FLOOR_ID): void {
  for (let py = 0; py < S.p.h; py++) {
    for (let px = 0; px < S.p.w; px++) {
      const r = S.ray(px, py);
      const t = z / 0.8;
      const w: V3 = [r[0] + t, r[1] + t, z];
      const c = f(w[0] / 40, w[1] / 40, px, py);
      if (c) S.put(px, py, dot(w, TOWARD), c, id, z);
    }
  }
}

/** A row of QT_STONE for a face turned `n` (lit to the lower left, at the eye, in shade). */
const rowFor = (n: readonly number[]): number => {
  const l = dot(n, LIGHT);
  return l > 0.2 ? 0 : l > -0.3 ? 1 : 2;
};

/** Every colour a step quieter than any word (art/act2_quiet.ts), what glows aside. */
function quieten(p: Px): void {
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    const c = p.get(x, y);
    if (c) p.set(x, y, quietHex(c));
  }
}

/** THE MOTH'S GREY DUST drifting in the air: specks, a little lighter than what they float over (darker over what is pale). */
function motes(p: Px, n: number, seed: number, keep: (x: number, y: number) => boolean = () => true): void {
  for (let k = 0; k < n; k++) {
    const x = Math.floor(hash(k, 1, seed) * (p.w - 4)) & ~1;
    const y = Math.floor(hash(k, 2, seed) * (p.h - 4)) & ~1;
    if (!keep(x, y)) continue;
    const c = p.get(x, y);
    if (!c) continue;
    const [r, g, b] = hexRGB(c);
    const lum = 0.3 * r + 0.59 * g + 0.11 * b;
    const big = hash(k, 3, seed) < 0.25;
    const col = lum > 120 ? '#4d4d53' : lum > 70 ? '#9c9c9e' : '#7a7a7e';
    p.rect(x, y, 2, 2, col);
    if (big) p.rect(x + 2, y, 2, 2, col);
  }
}

// =================================================================================================
// THE TOWER TOP

/** The platform's radius (Scene units, 40 to a tile: 7.5 tiles) to the parapet's inner face; its outer face; the tower's wall under it. */
const RP = 300;
const RO = 322;
const RW = 316;
/** How far the platform stands over the scene's floor (the outer wall shows under it); the parapet's sill and merlons. */
const LIFT = 250;
const SILL = 27;
const MERL = 44;
/** The platform's middle on the picture. */
const TCX = 600;
const TCY = 418;
/** The horizon of the fog sea. */
const HORIZON = 104;
/** The merlons round the parapet, and which one is fallen. */
const NMERL = 23;
const FALLEN = 18;

/** THE SPIRES of the High City standing out of the fog sea, and the palace's dome (picture pixels: x, the foot's y, height, half-width, roof kind). */
const SPIRES: readonly (readonly [number, number, number, number, number])[] = [
  [70, 300, 150, 11, 0],
  [150, 236, 96, 8, 1],
  [1080, 280, 170, 12, 0],
  [1150, 210, 92, 7, 0],
  [990, 170, 64, 6, 1],
  [250, 160, 52, 5, 0],
  [390, 136, 34, 4, 0],
  [820, 138, 38, 4, 1],
  [700, 126, 26, 3, 0],
  [40, 560, 190, 14, 1],
  [1170, 560, 210, 15, 0],
];
const DOME = { x: 300, y: 196, r: 34 };

/** The fog's height at the picture's (px, py) over the horizon: rolling heaps, wide and low, smaller toward the horizon. */
function fogHeight(px: number, d: number): number {
  const k = 0.18 + d / 430;
  const X = (px - 600) / (130 * k) + 40;
  const Y = 8 * Math.log(1 + d / 40);
  return fbm(X, Y, 6511) + 0.22 * (vnoise(X * 3.1, Y * 3.1, 6512) - 0.5);
}
/**
 * THE FOG SEA far below, seen from above: heaps of fog rolling to the horizon, lit on their slopes that face the upper
 * left, in shade on the others, brighter where they stand highest; the dark between them where the deep shows; small and
 * hazy toward the horizon. With `rMin` (picture rows), only where a heap stands high enough to lie before the tower's foot.
 */
function fogRows(px: number, py: number, rMin = 0): RGB | null {
  const d = py - HORIZON;
  const h = fogHeight(px, d);
  if (rMin && h < 0.56) return null;
  const e = 1.5;
  const lit = (fogHeight(px + e, d) - fogHeight(px - e, d)) * 0.8 + (fogHeight(px, d + e) - fogHeight(px, d - e)) * 1.4;
  const k = 0.18 + d / 430;
  const v = (h - 0.36) * 4 + lit * 9 / Math.max(0.3, k);
  let t: number;
  if (h < 0.31) t = -1;
  else t = over(v, 1.7, px, py, 0.12) ? 4 : over(v, 0.9, px, py, 0.12) ? 3 : over(v, 0.2, px, py, 0.12) ? 2 : over(v, -0.4, px, py, 0.12) ? 1 : 0;
  let c = t < 0 ? mixc(QT_FOG[0], QT_DEEP, 0.3) : QT_FOG[t];
  // (hazy toward the horizon)
  if (d < 150) {
    const haze = 0.7 * (1 - d / 150);
    if (over(haze, 0.45, px, py, 0.08)) c = QT_FOG[3];
    else c = mixc(c, QT_FOG[3], haze);
  }
  if (d > 420) c = mixc(c, QT_FOG[0], cl01((d - 420) / 320) * 0.3);
  return c;
}
function fogTops(px: number, py: number): RGB {
  return fogRows(px, py) ?? QT_FOG[3];
}

/** THE BACKDROP: the grey sky over the horizon; the fog sea under it, its banks drawn out wide, the far ones small and pale; the spires and the dome out of it. */
export function backdrop(px: number, py: number): RGB {
  let c: RGB;
  if (py < HORIZON) {
    // the sky: grey, darker up, long streaks of cloud
    const t = py / HORIZON;
    const s = fbm(px / 220, py / 18, 6501) + 0.15 * (vnoise(px / 50, py / 6, 6502) - 0.5);
    const k = t > 0.75 ? 3 : t > 0.45 ? 2 : 1;
    const kk = over(s, 0.62, px, py, 0.02) ? Math.min(4, k + 1) : over(s, 0.36, px, py, 0.02) ? k : Math.max(0, k - 1);
    c = QT_FOG[kk];
  } else c = fogTops(px, py);
  // THE PALACE'S DOME, far off to the left: its drum, the dome, a lantern
  {
    const dx = px - DOME.x;
    const up = DOME.y - py;
    const drum = Math.abs(dx) < DOME.r * 0.8 && up >= 0 && up < 16;
    const dome = up >= 16 && (dx / DOME.r) ** 2 + ((up - 16) / (DOME.r * 0.9)) ** 2 < 1;
    const lant = Math.abs(dx) < 4 && up >= 16 + DOME.r * 0.9 - 2 && up < 16 + DOME.r * 0.9 + 10;
    if (drum || dome || lant) {
      const lit = dx < -DOME.r * 0.3;
      const ribs = dome && Math.abs(mod(Math.asin(cl01(Math.abs(dx) / DOME.r)) * 6, 1) - 0.5) < 0.08;
      const sil = hexRGB(lit ? '#62656b' : ribs ? '#3e4148' : '#4c4f56');
      const lost = cl01(1 - up / 12) + 0.15 * (vnoise(px / 6, py / 3, 6521) - 0.5);
      c = over(lost, 0.6, px, py, 0.05) ? c : over(lost, 0.3, px, py, 0.05) ? mixc(sil, c, 0.5) : sil;
    }
  }
  // THE SPIRES: a shaft, lit on its left, a slit window, a conical or a stepped roof; lost in the fog at the foot; the far ones paler
  for (const [x, y, h, hw, kind] of SPIRES) {
    const dx = px - x;
    const up = y - py;
    if (up < 0 || up > h + hw * 3.6 + 8 || Math.abs(dx) > hw + 4) continue;
    const far = cl01((300 - y) / 200);
    let tone = -1;
    const roof = h;
    if (up < roof && Math.abs(dx) <= hw) {
      tone = dx < -hw + Math.max(2, hw * 0.35) ? 2 : dx > hw - Math.max(2, hw * 0.3) ? 0 : 1;
      if (Math.abs(dx) < Math.max(1, hw * 0.12) && up > roof - hw * 3 && up < roof - hw * 1.6) tone = 0;
      if (hw > 6 && mod(up, 16) < 1) tone = Math.max(0, tone - 1);
      // a gallery round its top
      if (up > roof - 5 && up < roof - 1 && Math.abs(dx) <= hw + 2) tone = 2;
    } else if (kind === 0 && up >= roof && Math.abs(dx) <= hw + 2 - (up - roof) / 3.4) tone = dx < 0 ? 2 : 0;
    else if (kind === 1 && up >= roof && up < roof + hw * 1.6 && Math.abs(dx) <= hw - 1 - (up - roof) * 0.4) tone = dx < 0 ? 2 : 0;
    else if (up >= roof - 5 && up < roof - 1 && Math.abs(dx) <= hw + 2) tone = 2;
    if (tone < 0) continue;
    const sil = mixc(hexRGB(['#23252b', '#32353c', '#4a4d54'][tone]), QT_FOG[3], far * 0.55);
    const lost = cl01(1 - up / 40) + 0.2 * (vnoise(px / 8, py / 4, 6531 + x) - 0.5);
    c = over(lost, 0.6, px, py, 0.04) ? c : over(lost, 0.3, px, py, 0.04) ? mixc(sil, c, 0.5) : sil;
  }
  return c;
}

/** Is the merlon at angle `a` (radians) standing (not an embrasure, not the fallen one)? Its index, or -1. */
function merlonAt(a: number): number {
  const t = mod(a / (Math.PI * 2), 1) * NMERL;
  const i = Math.floor(t);
  return t - i < 0.62 ? i : -1;
}

export interface Painting {
  p: Px;
  /** Where the hero stands, on the picture (his feet). */
  hero: [number, number];
  /** The lights of what is in it, on the picture. */
  lights: { x: number; y: number; r: number; a: number; color: string }[];
}

/** THE TOWER TOP: the painting. */
export function paintTowerTop(): Painting {
  const p = new Px(W, H);
  const S = new Scene(p, TCX, TCY + LIFT);
  // THE BACKDROP, behind all (no depth)
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) p.set(px, py, rgbHex(backdrop(px, py)));
  const bd = (w: readonly number[]): RGB => {
    const [x, y] = S.at(w);
    return backdrop(Math.round(x), Math.round(y));
  };
  // THE TOWER'S OUTER WALL, falling away under the corbel table into the fog
  const NS = 240;
  const P = (a: number, r: number, z: number): V3 => [Math.cos(a) * r, Math.sin(a) * r, z];
  for (let i = 0; i < NS; i++) {
    const a0 = (i / NS) * Math.PI * 2;
    const a1 = ((i + 1) / NS) * Math.PI * 2;
    const am = (a0 + a1) / 2;
    const n: V3 = [Math.cos(am), Math.sin(am), 0];
    if (dot(n, TOWARD) <= 0) continue;
    const row = rowFor(n);
    S.quad([P(a0, RW, 0), P(a1, RW, 0), P(a1, RW, LIFT - 16), P(a0, RW, LIFT - 16)], (u, v, w) => {
      const z = w[2];
      const along = (a0 + (a1 - a0) * u) * RW * 0.8;
      let c = ashlar(z, along, row, 14);
      // a string course
      if (Math.abs(z - (LIFT - 70)) < 3) c = QT_STONE[row][z > LIFT - 69 ? 0 : 3];
      // an arrow slit here and there
      const slot = mod(along, 150);
      if (Math.abs(slot - 75) < 2 && Math.abs(z - (LIFT - 110)) < 14 && Math.floor(along / 150) % 2 === 0) c = QT_DEEP;
      void v;
      // lost in the fog as it goes down
      const t = cl01((LIFT - 40 - z) / 100);
      if (t > 0) {
        const f = bd(w);
        const [px, py] = S.at(w);
        const k = t + 0.2 * (vnoise(px / 16, py / 6, 6541) - 0.5);
        if (over(k, 0.7, Math.round(px), Math.round(py), 0.03)) return rgbHex(f);
        if (over(k, 0.35, Math.round(px), Math.round(py), 0.03)) return rgbHex(mixc(c, f, 0.55));
        return rgbHex(mixc(c, f, 0.25 * t));
      }
      return rgbHex(c);
    }, 1);
  }
  // THE CORBEL TABLE: brackets stepping out from the wall to carry the parapet, the dark between them
  const NC = 64;
  for (let i = 0; i < NC; i++) {
    const a = (i / NC) * Math.PI * 2;
    const n: V3 = [Math.cos(a), Math.sin(a), 0];
    if (dot(n, TOWARD) <= -0.2) continue;
    const t: V3 = [-Math.sin(a), Math.cos(a), 0];
    for (const [r0, z0, z1, hw] of [[RW + 1.5, LIFT - 16, LIFT - 9, 5], [RW + 3, LIFT - 9, LIFT - 3, 6.5]] as const) {
      S.box(P(a, r0, (z0 + z1) / 2), [n, t, [0, 0, 1]], [r0 - RW + 1, hw, (z1 - z0) / 2], (f, _u, vv, nn) => (f === 4 ? rgbHex(QT_STONE[0][0]) : rgbHex(QT_STONE[rowFor(nn)][vv > 0.85 ? 0 : 1])), 2);
    }
  }
  // the shadowed band between the corbels, under the parapet
  for (let i = 0; i < NS; i++) {
    const a0 = (i / NS) * Math.PI * 2;
    const a1 = ((i + 1) / NS) * Math.PI * 2;
    const n: V3 = [Math.cos((a0 + a1) / 2), Math.sin((a0 + a1) / 2), 0];
    if (dot(n, TOWARD) <= 0) continue;
    S.quad([P(a0, RW + 0.5, LIFT - 16), P(a1, RW + 0.5, LIFT - 16), P(a1, RW + 0.5, LIFT), P(a0, RW + 0.5, LIFT)], () => rgbHex(mixc(QT_STONE[2][3], QT_DEEP, 0.4)), 3);
  }
  // THE PARAPET: its base course and wall to the sill all round; the merlons over it; inner and outer faces, cheeks, tops
  for (let i = 0; i < NS; i++) {
    const a0 = (i / NS) * Math.PI * 2;
    const a1 = ((i + 1) / NS) * Math.PI * 2;
    const am = (a0 + a1) / 2;
    const out: V3 = [Math.cos(am), Math.sin(am), 0];
    const inn: V3 = [-out[0], -out[1], 0];
    const m = merlonAt(am);
    const standing = m >= 0 && m !== FALLEN;
    const top = standing ? LIFT + MERL : LIFT + SILL;
    const along = am * RP * 0.8;
    const face = (n: V3) => (_u: number, _v: number, w: V3): string => {
      const z = w[2] - LIFT;
      const row = rowFor(n);
      if (z > top - LIFT - 2) return rgbHex(QT_STONE[row][0]);
      // the base course, a step out
      if (z < 5) return rgbHex(z > 3.5 ? QT_STONE[row][0] : QT_STONE[Math.min(2, row + 1)][2]);
      return rgbHex(ashlar(z, along + (n === out ? 37 : 0), row, 9));
    };
    if (dot(inn, TOWARD) > 0) S.quad([P(a0, RP, LIFT), P(a1, RP, LIFT), P(a1, RP, top), P(a0, RP, top)], face(inn), 4);
    if (dot(out, TOWARD) > 0) S.quad([P(a0, RO, LIFT - 3), P(a1, RO, LIFT - 3), P(a1, RO, top), P(a0, RO, top)], face(out), 5);
    // its top: a merlon's coping bone white, its lit arris; an embrasure's sill a step down; the gap's broken top rough
    S.quad([P(a0, RP, top), P(a1, RP, top), P(a1, RO, top), P(a0, RO, top)], (_u, v) => {
      if (m === FALLEN) return hash(i, Math.floor(v * 4), 6551) < 0.4 ? rgbHex(QT_STONE[1][2]) : rgbHex(QT_STONE[0][2]);
      if (standing) return v < 0.18 ? rgbHex(BONE_RGB[2]) : v > 0.85 ? rgbHex(QT_STONE[1][1]) : rgbHex(BONE_RGB[1]);
      return v < 0.2 ? rgbHex(BONE_RGB[1]) : rgbHex(BONE_RGB[0]);
    }, 6);
  }
  // the merlons' cheeks (their sides at each embrasure)
  for (let k = 0; k < NMERL; k++) {
    if (k === FALLEN) continue;
    for (const e of [0, 0.62]) {
      const a = ((k + e) / NMERL) * Math.PI * 2;
      const tn: V3 = [-Math.sin(a) * (e ? 1 : -1), Math.cos(a) * (e ? 1 : -1), 0];
      if (dot(tn, TOWARD) <= 0) continue;
      const row = rowFor(tn);
      S.quad([P(a, RP, LIFT + SILL), P(a, RO, LIFT + SILL), P(a, RO, LIFT + MERL), P(a, RP, LIFT + MERL)], (_u, v) => rgbHex(v > 0.9 ? QT_STONE[row][0] : QT_STONE[row][1]), 7);
    }
  }
  // THE PLATFORM: flags in rings; dust drifted to the parapet's foot; fog lying, thicker toward it; a page or two; the wing
  floorAt(S, LIFT, (x, y, px, py) => {
    const r = Math.hypot(x, y) * 40;
    if (r > RP + 1) return null;
    const wall = (RP - r) / 40;
    let c: RGB = ringFlags(x, y, 0, 0, px, py);
    // (the dais's own stone under it is the dais)
    // the Moth's dust, drifted toward the parapet and round the dais
    const drift = fbm(x * 0.7 + 3, y * 0.7, 6561) + 0.4 * cl01(1 - wall / 1.3) + 0.25 * cl01(1 - Math.abs(r - 75) / 30);
    if (over(drift, 0.8, px, py, 0.015)) {
      const g = hash(px >> 1, py, 6562);
      c = hexRGB(g < 0.1 ? '#8f8f92' : g < 0.35 ? '#6d6d71' : drift > 0.9 ? '#3a3a40' : '#56565c');
    }
    // fog lying on the flags
    c = fogOver(c, x, y, px, py, 0.08 + 0.75 * cl01(1 - wall / 1.8));
    // the soft shade at the parapet's foot
    if (wall < 0.12) c = mixc(c, QT_DEEP, 0.35);
    return rgbHex(c);
  });
  // THE DAIS: two octagonal steps of the tower's stone, their arrises bone white
  const dais = moved(S, [0, 0, LIFT], 9000);
  daisIn(dais);
  // THE PIECES, each at its place (tiles), built in the big scene
  const lights: Painting['lights'] = [];
  const put = (build: (M: Scene) => PieceLight[] | void, x: number, y: number, z: number, base: number, k = 0): void => {
    const M0 = moved(S, [x * 40, y * 40, LIFT + z], base * 100);
    const M = k ? turned(M0, k) : M0;
    const ls = build(M) || [];
    for (const L of ls) {
      const [lx, ly] = S.at([x * 40 + L.at[0], y * 40 + L.at[1], LIFT + z + L.at[2]]);
      lights.push({ x: lx, y: ly, r: L.r * 2, a: L.a ?? 0.4, color: L.color });
    }
  };
  put((M) => lecternIn(M), 0, 0, 10, 10);
  put((M) => trapdoorIn(M, true), 4.4, 3.2, 0, 11);
  put((M) => beaconIn(M), -5.4, -1.4, 0, 12);
  put((M) => merlonIn(M), 2.0, -5.9, 0, 13);
  put((M) => pagesIn(M, false), -3.2, 1.9, 0, 14);
  put((M) => pagesIn(M, true), -1.6, 3.6, 0, 15);
  put((M) => maskIn(M), 1.6, 2.2, 0, 16);
  put((M) => dustIn(M), -4.8, 3.9, 0, 17);
  put((M) => hushDustIn(M, 1), 5.4, -3.6, 0, 18);
  put((M) => wingIn(M), 4.2, -1.1, 0, 19);
  // THE SEAMS between things, and every colour a step quieter than any word
  S.seams();
  quieten(p);
  // THE FOG pouring out through the near embrasures and down the wall; the fog sea's near banks lying over the tower's foot
  fogFalls(S, p);
  for (let py = 600; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const i = py * W + px;
      if (S.id[i] < 0 || S.hz[i] > LIFT - 70) continue;
      const c = fogRows(px, py, 1);
      if (c) p.set(px, py, quietHex(rgbHex(c)));
    }
  }
  // THE MOTH'S DUST in the air, more of it about the lectern
  motes(p, 700, 6571, (x, y) => Math.hypot((x - TCX) / 470, (y - TCY + 60) / 300) < 1);
  motes(p, 220, 6572, (x, y) => Math.hypot(x - TCX, (y - TCY) * 2) < 240);
  const heroW: V3 = [2.4 * 40, 2.9 * 40, LIFT];
  const [hx, hy] = S.at(heroW);
  return { p, hero: [Math.round(hx), Math.round(hy)], lights };
}
const BONE_RGB = ['#bcb5a5', '#d4cdbd', '#e4ded0'].map(hexRGB);

/** THE DAIS the lectern stands on: two octagonal steps. */
function daisIn(S: Scene): void {
  const step = (r: number, z0: number, z1: number, id: number): void => {
    for (let k = 0; k < 8; k++) {
      const a0 = Math.PI / 8 + (k / 8) * Math.PI * 2;
      const a1 = a0 + Math.PI / 4;
      const am = (a0 + a1) / 2;
      const n: V3 = [Math.cos(am), Math.sin(am), 0];
      const P = (a: number, zz: number): V3 => [Math.cos(a) * r, Math.sin(a) * r, zz];
      S.quad([P(a0, z0), P(a1, z0), P(a1, z1), P(a0, z1)], (u, v) => (v < 0.2 ? rgbHex(BONE_RGB[1]) : Math.abs(u - 0.5) < 0.012 ? TSTONE[0] : toneAt(n, TSTONE, 0)), id);
      S.quad([[0, 0, z1], P(a0, z1), P(a1, z1), P(a1, z1)], (_u, v) => (v > 0.94 ? rgbHex(BONE_RGB[2]) : hash(k, Math.floor(v * 5), 6581) < 0.3 ? BONE[1] : BONE[2]), id);
    }
  };
  step(64, 0, 5, 1);
  step(46, 5, 10, 2);
}

/**
 * THE FOG POURING OUT through the near embrasures and down the tower's wall: a few broad, slow falls, each a body of fog
 * lumped and lit on its left, in shade on its right, spreading as it goes down and thinning to a veil (the stone seen
 * through it) before the fog sea takes it.
 */
function fogFalls(S: Scene, p: Px): void {
  const FOG = QT_FOG.map((c) => quietHex(rgbHex(c)));
  for (let k = 0; k < NMERL; k++) {
    if (hash(k, 7, 6591) > 0.5) continue;
    const a = ((k + 0.81) / NMERL) * Math.PI * 2;
    const nn: V3 = [Math.cos(a), Math.sin(a), 0];
    if (dot(nn, TOWARD) < 0.15) continue;
    const [sx, sy] = S.at([Math.cos(a) * RO, Math.sin(a) * RO, LIFT + SILL + 1]);
    const len = 120 + hash(k, 2, 6591) * 50;
    const lean = (nn[0] - nn[1]) * 0.2;
    for (let dy = -2; dy < len; dy++) {
      const y = Math.round(sy + dy);
      if (y < 0 || y >= p.h) continue;
      const t = Math.max(0, dy) / len;
      const half = 13 + 34 * Math.pow(t, 0.8);
      const cx = sx + lean * dy;
      for (let dx = -Math.ceil(half) - 6; dx <= Math.ceil(half) + 6; dx++) {
        const x = Math.round(cx + dx);
        if (x < 0 || x >= p.w) continue;
        const e = 1 - Math.abs(dx) / half;
        const lump = vnoise(x / 9, y / 8 - k * 5, 6592 + k) - 0.5;
        const body = e + 0.5 * lump - 1.25 * t * t;
        if (body < 0.08) continue;
        // the veil: a checker of it, thinner as it goes
        if (body < 0.3 && ((x + y) & 1) === 1) continue;
        if (body < 0.18 && (x & 1) === 1) continue;
        const lit = dx < -half * 0.35 + 6 * lump;
        const shade = dx > half * 0.4 + 6 * lump;
        p.set(x, y, lit ? FOG[4] : shade ? FOG[2] : FOG[3]);
      }
    }
  }
}

// =================================================================================================
// THE SCRIPTORIUM

/** The room's radius (Scene units: 6.25 tiles) to its wall's face; the wall's thickness; how tall it stands; where it begins to fade. */
const RR = 290;
const WALL_T = 34;
const RISE = 150;
const FADE_AT = 96;
/** The room's middle on the picture. */
const SCX = 600;
const SCY = 470;
/** The windows round the far wall (angles, radians), and what hangs on the wall between (angles). */
const WINDOWS = [-3.0, -2.2, -1.45];
const PIGEONHOLES = -2.6;
/** The way from angle `b` to angle `a`, the short way round (radians). */
const turn = (a: number, b: number): number => Math.atan2(Math.sin(a - b), Math.cos(a - b));

/** THE SCRIPTORIUM: the painting. */
export function paintScriptorium(): Painting {
  const p = new Px(W, H);
  const S = new Scene(p, SCX, SCY);
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) p.set(px, py, rgbHex(QT_DEEP));
  const P = (a: number, r: number, z: number): V3 => [Math.cos(a) * r, Math.sin(a) * r, z];
  // THE FAR WALL: ashlar on the round, its plinth; three lancet windows, the fog's grey day in them; pigeonholes of blank scrolls between; fading into the dark above
  const NS = 220;
  for (let i = 0; i < NS; i++) {
    const a0 = (i / NS) * Math.PI * 2;
    const a1 = ((i + 1) / NS) * Math.PI * 2;
    const am = (a0 + a1) / 2;
    const inn: V3 = [-Math.cos(am), -Math.sin(am), 0];
    if (dot(inn, TOWARD) <= 0) continue;
    const l0 = dot(inn, LIGHT);
    S.quad([P(a0, RR, 0), P(a1, RR, 0), P(a1, RR, RISE), P(a0, RR, RISE)], (u, _v, w) => {
      const z = w[2];
      const a = a0 + (a1 - a0) * u;
      // (the round wall turning from the light: its rows of tone change with a pixel or two checkered, never a hard stripe)
      const [qx, qy] = S.at(w);
      const X = Math.round(qx);
      const Y = Math.round(qy);
      const row = over(l0, 0.2, X, Y, 0.05) ? 0 : over(l0, -0.3, X, Y, 0.05) ? 1 : 2;
      const along = a * RR * 0.8;
      let c: RGB;
      if (z < 9) c = z >= 7 ? QT_STONE[row][0] : z < 2 ? QT_STONE[row][3] : ashlar(z + 40, along, Math.min(2, row + 1), 9);
      else c = ashlar(z - 9, along, row);
      // a window?
      for (const wa of WINDOWS) {
        const du = turn(a, wa) * RR * 0.8;
        const win = lancetAt(du, z, row, X, Y);
        if (win) c = win;
      }
      // pigeonholes between the first two windows
      const pa = turn(a, PIGEONHOLES) * RR * 0.8;
      if (Math.abs(pa) < 30 && z > 22 && z < 22 + 6 * 9) {
        const cu = mod(pa + 30, 10);
        const cv = mod(z - 22, 9);
        if (cu < 2 || cv < 2) c = cu < 1 || cv < 1 ? QT_STONE[row][0] : QT_STONE[row][3];
        else {
          const has = hash(Math.floor((pa + 30) / 10), Math.floor((z - 22) / 9), 6601) < 0.68;
          const ddu = cu - 6;
          const ddv = cv - 5.5;
          c = has && ddu * ddu + ddv * ddv <= 8 ? (ddu * ddu + ddv * ddv <= 1.5 ? hexRGB('#9f9a8e') : ddu + ddv < 0 ? hexRGB('#c6c0b2') : hexRGB('#9f9a8e')) : cv > 6 ? QT_STONE[2][3] : QT_STONE[2][2];
        }
      }
      // fading into the dark above
      if (z > FADE_AT) c = mixc(c, QT_DEEP, 0.25 + 0.72 * cl01((z - FADE_AT) / (RISE - FADE_AT)));
      return rgbHex(c);
    }, 1);
  }
  // THE NEAR WALL, cut away as the game cuts it: its top lying round the floor's near edge, a lit arris, the dark
  floorAt(S, 0, (x, y) => {
    const r = Math.hypot(x, y) * 40;
    if (r < RR || r > RR + WALL_T) return null;
    const out: V3 = [x, y, 0];
    if (dot(out, TOWARD) < 0) return null;
    return r < RR + 2.5 ? rgbHex(QT_STONE[1][2]) : r < RR + 4.5 ? rgbHex(QT_STONE[1][3]) : rgbHex(QT_DEEP);
  }, SOFT_ID + 2);
  // THE FLOOR: flags in courses, the copyists' dry ink, pages, dust, fog in from the windows along the wall's foot
  floorAt(S, 0, (x, y, px, py) => {
    const r = Math.hypot(x, y) * 40;
    if (r > RR) return null;
    const wall = (RR - r) / 40;
    let c = courseFlags(x, y, px, py);
    // the dry ink, spattered and spilled under the desks
    if (hash(px, py, 6611) < 0.006 + 0.05 * cl01(vnoise(x * 0.8, y * 0.8, 6612) - 0.62)) c = hexRGB('#100e14');
    const drift = fbm(x * 0.7 + 3, y * 0.7, 6613) + 0.4 * cl01(1 - wall / 1.0);
    if (over(drift, 0.8, px, py, 0.015)) {
      const g = hash(px >> 1, py, 6614);
      c = hexRGB(g < 0.08 ? '#76767a' : g < 0.3 ? '#5b5b60' : drift > 0.86 ? '#2f2f35' : '#45454b');
    }
    // the fog, seeping in at the middle window and lying along the wall's foot
    const a = Math.atan2(y, x);
    const fromWin = Math.abs(turn(a, WINDOWS[1])) * r / 40;
    const fog = 0.85 * cl01(1 - wall / 1.6) * cl01(1 - fromWin / 3.5) + 0.35 * cl01(1 - wall / 0.9);
    c = fogOver(c, x, y, px, py, fog);
    if (wall < 0.15) c = mixc(c, QT_DEEP, 0.35);
    return rgbHex(c);
  });
  // THE PIECES
  const lights: Painting['lights'] = [];
  const put = (build: (M: Scene) => PieceLight[] | void, x: number, y: number, base: number, k = 0): void => {
    const M0 = moved(S, [x * 40, y * 40, 0], base * 100);
    const M = k ? turned(M0, k) : M0;
    const ls = build(M) || [];
    for (const L of ls) {
      const [lx, ly] = S.at([x * 40 + L.at[0], y * 40 + L.at[1], L.at[2]]);
      lights.push({ x: lx, y: ly, r: L.r * 2, a: L.a ?? 0.4, color: L.color });
    }
  };
  // on the wall: the cocoon, the tapestry, the Order's banner gone grey (each at its angle on the round, a little out from it)
  const onWall = (make: (M: Scene, w: (a: number, b: number, z: number) => V3) => void, ang: number, base: number): void => {
    const M = moved(S, [0, 0, 0], base * 100);
    const B: V3 = [Math.cos(ang) * RR, Math.sin(ang) * RR, 0];
    const T: V3 = [Math.sin(ang), -Math.cos(ang), 0];
    const N: V3 = [-Math.cos(ang), -Math.sin(ang), 0];
    make(M, (a, b, z) => [B[0] + T[0] * a + N[0] * b, B[1] + T[1] * a + N[1] * b, z]);
  };
  onWall(tapestryMake, -3.3, 20);
  onWall(cocoonMake, -1.83, 21);
  onWall(bannerMake, -1.1, 22);
  const polar = (a: number, r: number): [number, number] => [Math.cos(a) * r, Math.sin(a) * r];
  put((M) => stairIn(M), ...polar(-0.62, 5.5), 23);
  // presses of blank books against the wall, a chest of quires under the pigeonholes
  put((M) => pressIn(M), ...polar(-3.62, 6.5), 40, 1);
  put((M) => chestIn(M, false), ...polar(-2.47, 6.4), 42);
  // the desks in rows, their slopes to the windows' light; stools at them
  put((M) => deskIn(M), -2.4, -2.2, 30, 0);
  put((M) => deskIn(M), 0.9, -3.4, 31, 0);
  put((M) => deskIn(M), -3.4, 0.6, 32, 1);
  put((M) => deskIn(M), 0.4, -0.2, 33, 0);
  put((M) => stoolIn(M, false), -2.3, -1.1, 34);
  put((M) => stoolIn(M, false), 1.0, -2.3, 35);
  put((M) => stoolIn(M, true), 1.1, 1.3, 36);
  put((M) => stoolIn(M, false), -2.3, 0.7, 37);
  // the candles, burning on by the near desk: the one warm light
  put((M) => candlesIn(M, 0), 2.1, -0.4, 43);
  // torn pages, a mask dropped, dust, the Hush's dust lying by the way in
  put((M) => pagesIn(M, false), -4.3, 2.4, 44);
  put((M) => pagesIn(M, true), 2.8, 2.4, 45);
  put((M) => maskIn(M), -1.0, 2.6, 46);
  put((M) => dustIn(M), 4.6, 1.2, 47);
  put((M) => hushDustIn(M, 0), 1.6, 4.9, 48);
  S.seams();
  quieten(p);
  motes(p, 420, 6621, (x, y) => Math.hypot((x - SCX) / 330, (y - SCY + 40) / 230) < 1);
  const [hx, hy] = S.at([-0.6 * 40, 3.6 * 40, 0]);
  return { p, hero: [Math.round(hx), Math.round(hy)], lights };
}

/** A LANCET WINDOW on the round wall, `du` across from its middle (picture pixels), at `z`: its dressed surround, the splayed reveal, the fog's grey day in it; null off it. */
function lancetAt(du: number, z: number, row: number, px: number, py: number): RGB | null {
  const HW = 12;
  const SILLZ = 30;
  const SP = 70;
  const HEAD = 96;
  const inside = (d: number, zz: number, m: number): boolean => zz >= SILLZ - m && Math.abs(d) < (HW + m) * (zz < SP ? 1 : Math.pow(Math.max(0, 1 - (zz - SP) / (HEAD + m * 1.3 - SP)), 0.62));
  if (!inside(du, z, 5)) return null;
  const S = QT_STONE[row];
  if (!inside(du, z, 0)) {
    if (z < SILLZ) return z > SILLZ - 2 ? BONE_RGB[0] : S[3];
    return du < 0 ? S[0] : S[3];
  }
  // the reveal, splayed: its left side catching the light, its right in shade
  if (du < -HW * 0.55) return S[1];
  if (du > HW * 0.6) return S[3];
  // the day: the fog's grey, paler up, a mullion's shadow
  const f = fbm(px / 9, py / 14, 6631) + 0.3 * ((z - SILLZ) / (HEAD - SILLZ));
  return QT_FOG[f > 0.72 ? 4 : f > 0.5 ? 3 : 2];
}
