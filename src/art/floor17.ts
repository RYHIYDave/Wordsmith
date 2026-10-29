// FLOOR 17, THE MASQUE (THE BLACK ROOM): ITS OWN PIECES, themed after its boss, the Prince (a mock-up; nothing of the
// game imports it).
//
// His rule for a set of floors from the second on (10 Oct, 14:54): “Going forward, let’s do 25 that are the theme of the 5
// levels, then 25 for each boss.” This floor's boss is the Prince (his doc "Wordsmith Act 2, Part Two: The High City
// (Levels 16–20)", planned with him in the main chat; his "Yes, go (Recommended)"): "The Prince. His floor is the Black
// Room. A tall young man in a long velvet coat and a smiling gilt mask, with a rapier, dancing the whole fight." The
// level: "Into the palace, where the prince's masked ball has gone on for weeks."; its layout "indoors: a winding suite
// of seven great rooms, each in its own colour (blue, purple, green, orange, white, violet, and a black one lit red
// through its windows), with galleries, card rooms and servants' passages between."; its hazard "the great ebony clock in
// the black room. Every so often it chimes: every dancer stops dead and turns to look at you, then the music starts again
// and they all come at once."; its story "the prince opened the city to the Silent Order in return for his walls. He shut
// the poor out and kept dancing while the city below went quiet (as in "The Masque of the Red Death")."; its palette
// "Seven rooms of seven colours, candlelight, black velvet." The set's event: some enemies carry a royal's crest and drop
// royal playing cards (Princess, Prince, Queen, King): the card table nods to it.
//
// FROM THE TALE (Poe, "The Masque of the Red Death", 1842; only from it): "a gigantic clock of ebony. Its pendulum swung
// to and fro with a dull, heavy, monotonous clang", the "brazen lungs of the clock"; "a heavy tripod, bearing a brazier of
// fire" in the corridors, opposite each window; the black room "closely shrouded in black velvet tapestries", its panes
// "scarlet—a deep blood color"; "the profusion of golden ornaments that lay scattered to and fro or depended from the
// roof"; "there were musicians, there was Beauty, there was wine"; "arabesque figures with unsuited limbs and
// appointments"; the abbey's wall "had gates of iron. The courtiers, having entered, brought furnaces and massy hammers and
// welded the bolts." The prince's smiling gilt mask (his doc) is set about the palace as his mark: on the clock's arch, the
// great doors, the hanging sun. The royal crest is the house's own, the one the palace guard wears (art/palace_guard.ts:
// a white swan, its wings raised, its neck in its S), the same drawing.
//
// THE RULES THEY KEEP: as art/act2_kit.ts says (built in depth in floor 4's Scene, a step quieter than any word through
// art/act2_quiet.ts, seams of ink where one thing ends before another; real shapes, not balls and boxes). WHAT GIVES LIGHT:
// only honest flames, an honest orange (Colour 3): the braziers' fire, the candles of the candelabra, the chandelier and the
// sconces; and that same fire through the black room's scarlet panes (the curtained window); and the quest's own pale
// light. Nothing cyan, no pink: the wine a red past the enemy's pink (its hue 352 and on), the purple and violet short of it.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import type { Piece } from './floorkit';
import { flame } from './floorkit';
import { toneAt } from './floor4';
import type { Scene, V3 } from './floor4';
import { TOWARD } from './floor2';
import { CANDLE } from './floor11';
import { hash } from './kit';
import type { Ramp } from './kit';
import { COAL, EMBER } from './props';
import { BRASS, IRON, SOFT_ID, cylinder, done, frontPiece, lying, scene, turned } from './act2_kit';
import { bright } from './act2_quiet';
import { MQ_SCARLET, WIN } from './masque';

const fr = (t: number): number => t - Math.floor(t);
const AXES: readonly [V3, V3, V3] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const dot = (a: readonly number[], b: readonly number[]): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const depthOf = (w: V3): number => dot(w, TOWARD);

// =================================================================================================
// THE PALACE'S MATERIALS (each from its deep shade to its lit top)

/** Ebony, the clock's: near black, a cool sheen on its edges. */
export const EBONY: Ramp = ['#0b090d', '#17131c', '#241e2c', '#383044', '#5a5066'];
/** Gilt, dull candle gold (the frames, the mounts, the mask). */
export const GILT: Ramp = ['#3a2a16', '#5e4626', '#866a36', '#ac8e4c', '#ccb06a'];
/** The black velvet of the seventh room. */
export const VELVET: Ramp = ['#07060a', '#100e15', '#1a1720', '#26222d', '#36303e'];
/** A dark wine velvet (the couch). */
export const WINEVELVET: Ramp = ['#1c0c10', '#2e1419', '#421d22', '#58282c', '#6e3836'];
/** Cream silk (the chairs' seats, the cloth's damask). */
export const CREAM: Ramp = ['#5a5446', '#7e7662', '#a29880', '#c0b698', '#d8ceb0'];
/** White damask linen, the buffet's cloth. */
export const LINEN: Ramp = ['#5e5c56', '#84827a', '#a8a69c', '#c4c2b6', '#dad8cc'];
/** Silver, gone dull. */
export const SILVER: Ramp = ['#2a2a32', '#4a4a54', '#6e6e7a', '#9a9aa6', '#c6c6d0'];
/** Crystal, the chandelier's drops (a cool pale grey, never the hero's cyan). */
export const CRYSTAL: Ramp = ['#3e3c4a', '#686878', '#9898a8', '#c4c4d0', '#e8e8f0'];
/** Wax. */
export const WAX: Ramp = ['#6e6754', '#928a72', '#b2a98e', '#ccc3a6', '#e0d8bc'];
/** Wine, a dark red (its hue 352 to 358: past the enemy's pink; its darkest a purple too dark to be taken for it). */
export const WINE: Ramp = ['#1c0a12', '#30101e', '#48182a', '#6a2a32', '#8a3c42'];
/** Bottle glass, dark green. */
const BOTTLEG: Ramp = ['#0e1410', '#18221a', '#243226', '#344634', '#4a5e48'];
/** Baize, the card table's: a dull green. */
const BAIZE: Ramp = ['#121a14', '#1c2a1e', '#283a28', '#344a32', '#445c40'];
/** Parchment, the bargain's. */
const PARCH: Ramp = ['#5e5644', '#887b5c', '#aa9c78', '#c4b690', '#d8cca8'];
/** Spruce, a harpsichord's soundboard. */
const SPRUCE: Ramp = ['#4e4232', '#6e5e44', '#8e7a58', '#ac966c', '#c4ae82'];
/** Ivory, the keys and the dial's ring. */
const IVORY: Ramp = ['#6a6252', '#8e8670', '#b2a88e', '#cec4a8', '#e4dac0'];
/** The court's colours for its silks: the purple, the violet, the blue, the wine (the masks, the cards, the tapestry). */
const PURPLE: Ramp = ['#1e1224', '#30203a', '#463254', '#5e4870', '#7a648a'];
const VIOLET: Ramp = ['#16142a', '#242242', '#36345e', '#4c4a7a', '#686892'];
const INDIGO: Ramp = ['#10121e', '#1a1e30', '#262c44', '#363e5a', '#4c5472'];
/** Roast, pastry, fruit (the feast gone cold). */
const ROAST: Ramp = ['#2a160e', '#462618', '#663a22', '#84502e', '#a06a40'];
const PASTRY: Ramp = ['#4a3420', '#6e5030', '#927044', '#b08c58', '#c8a870'];
const APPLE: Ramp = ['#2e1216', '#4a1c1e', '#6a2a26', '#863a2e', '#a0503a'];
const PEAR: Ramp = ['#2e2e16', '#4a4a20', '#68662c', '#84823c', '#a09e52'];
const GRAPE: Ramp = ['#14101e', '#201a30', '#302848', '#423a5e', '#585074'];
/** Plaster painted white, the doors'. */
const PAINT: Ramp = ['#56544e', '#7a7870', '#9c9a90', '#bab8ac', '#d2d0c4'];
/** The deep dark of an opening. */
const HOLE = '#08070c';
/** Candle flames: an honest flame (floor 11's, left bright). The brazier's fire: EMBER and COAL (left bright). */
const FLAMES = CANDLE;
/** The fire through the scarlet panes: the ground's own (art/masque.ts, left bright there). */
const SCARLET: readonly string[] = MQ_SCARLET;
/** The quest's own pale light. */
const PALE: Ramp = ['#6e6858', '#9a927e', '#c4bca4', '#e2dac2', '#f4eedc'];
bright(PALE);
/** The light of the curtained window: the braziers' fire through the scarlet glass. */
export const RED_WINDOW_LIGHT = MQ_SCARLET[3];

// =================================================================================================
// HELPERS

type Facet = 'front' | 'back' | 'side' | 'top' | 'bottom';
/**
 * A BLOCK along the piece's own axes, its middle `c`, half-sizes `r`: `shade(facet, a, b, n)` its colour on each face seen,
 * (a, b) where on it in the piece's own measure: on the front and back (±y) across x and up z; on a side (±x) along y and
 * up z; on the top along x and y.
 */
function blk(S: Scene, c: V3, r: V3, shade: (k: Facet, a: number, b: number, n: V3) => string | null, id: number): void {
  S.box(c, AXES, r, (f, u, v, n) => {
    if (f === 4 || f === 5) return shade(f === 4 ? 'top' : 'bottom', c[0] + (u * 2 - 1) * r[0], c[1] + (v * 2 - 1) * r[1], n);
    if (f === 2 || f === 3) return shade(f === 2 ? 'front' : 'back', c[0] + (v * 2 - 1) * r[0], c[2] + (u * 2 - 1) * r[2], n);
    return shade('side', c[1] + (u * 2 - 1) * r[1], c[2] + (v * 2 - 1) * r[2], n);
  }, id);
}
/** A plain block of one ramp, its top edge lit. */
function plain(S: Scene, c: V3, r: V3, R: Ramp, id: number, bias = 0): void {
  blk(S, c, r, (k, _a, b, n) => (k !== 'top' && b > c[2] + r[2] - 0.8 ? toneAt(n, R, bias + 0.5) : toneAt(n, R, bias)), id);
}
/** Lay a picture of its own into a scene: its pixel (0, 0) at (x0, y0), as near the eye as `depth`. */
function paste(S: Scene, p: Px, x0: number, y0: number, depth: number, id: number): void {
  for (let j = 0; j < p.h; j++) {
    for (let i = 0; i < p.w; i++) {
      const c = p.get(i, j);
      if (c) S.put(x0 + i, y0 + j, depth, c, id, 0);
    }
  }
}
/** A CANDLE at (x, y) standing on `z`: `h` tall, wax run down it; lit (an honest flame) or out (its wick black). */
function candle(S: Scene, x: number, y: number, z: number, h: number, lit: boolean, id: number, r = 0.8): void {
  cylinder(S, x, y, r, z, z + h, (n, a, zz) => toneAt(n, WAX, Math.cos(a * 3 + id) > 0.65 && zz < z + h - 0.8 ? 0.5 : 0), id, () => WAX[4]);
  if (lit) {
    // a flame: a drop, its root dull, its middle bright, its tip a point
    const [px, py] = S.at([x, y, z + h]);
    const X = Math.round(px);
    const Y = Math.round(py);
    const d = depthOf([x, y, z + h]) + 3;
    const drop: [number, number, number][] = [[0, -1, 2], [-1, -2, 3], [0, -2, 4], [-1, -3, 3], [0, -3, 4], [0, -4, 4], [-1, -4, 3], [0, -5, 3]];
    for (const [dx, dy, k] of drop) S.put(X + dx, Y + dy, d, FLAMES[k], 2000 + id);
  } else {
    S.rod([x, y, z + h], [x, y, z + h + 0.9], 0.2, 0.2, EBONY, id);
  }
}
/** FIRE: tongues of flame licking up from a bed at `c`, `n` of them, up to `h` tall, the bed `w` across; frame `f`. */
function fireIn(S: Scene, c: V3, n: number, h: number, w: number, f: number, id: number): void {
  const tongues: [number, number, number, number][] = [];
  for (let k = 0; k < n; k++) {
    const a = k * 2.4 + 0.6;
    const d = (w * ((k % 3) + 0.5)) / 4;
    const hh = h * (0.55 + 0.45 * fr(Math.sin(k * 12.9898 + f * 4.1) * 43758.5453));
    const lean = Math.round(2.5 * Math.sin(f * 1.7 + k * 2.1));
    tongues.push([c[0] + Math.cos(a) * d, c[1] + Math.sin(a) * d * 0.6, hh, lean]);
  }
  // far tongues first
  tongues.sort((p, q) => p[0] + p[1] - (q[0] + q[1]));
  for (const [x, y, hh, lean] of tongues) {
    const p = new Px(24, Math.ceil(hh) + 4);
    flame(p, 12, p.h - 1, Math.round(hh), Math.max(2, w * 0.18), lean);
    const [sx, sy] = S.at([x, y, c[2]]);
    paste(S, p, Math.round(sx) - 12, Math.round(sy) - p.h + 2, depthOf([x, y, c[2]]) + 8, id);
  }
}
/** A point turned `ang` about the upright through (0, 0). */
const spin = (p: readonly number[], ang: number): V3 => [p[0] * Math.cos(ang) - p[1] * Math.sin(ang), p[0] * Math.sin(ang) + p[1] * Math.cos(ang), p[2]];
/** A curve through `pts` (a smooth line, `n` points a span). */
function curve(pts: readonly V3[], n = 8): V3[] {
  const out: V3[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const t = k / n;
      out.push([0, 1, 2].map((j) => 0.5 * (2 * p1[j] + (p2[j] - p0[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t + (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * t * t * t)) as V3);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
/** A rod along a curve, `r0` thick at its start to `r1` at its end. */
function bent(S: Scene, pts: readonly V3[], r0: number, r1: number, R: Ramp, id: number, keep?: (w: V3) => boolean): void {
  const c = curve(pts);
  for (let i = 0; i + 1 < c.length; i++) {
    const t = i / (c.length - 1);
    S.rod(c[i], c[i + 1], r0 + (r1 - r0) * t, r0 + (r1 - r0) * (t + 1 / (c.length - 1)), R, id, keep);
  }
}
/**
 * THE PRINCE'S SMILING GILT MASK (his doc), small, as his mark set about the palace: a face of gilt, full, two eye-slits
 * curved up in a smile, a smiling mouth; `at` its middle, facing `F` (unit), its up `U` (unit, across F), `R` its height's half.
 */
function giltMask(S: Scene, at: V3, F: V3, R: number, id: number, U: V3 = [0, 0, 1]): void {
  const Sd: V3 = [U[1] * F[2] - U[2] * F[1], U[2] * F[0] - U[0] * F[2], U[0] * F[1] - U[1] * F[0]];
  S.egg(at, [F, Sd, U], [R * 0.45, R * 0.78, R], (n, w) => {
    const q = [w[0] - at[0], w[1] - at[1], w[2] - at[2]];
    const s = dot(q, Sd) / R;
    const u = dot(q, U) / R;
    const f = dot(q, F);
    if (f > 0) {
      // the eyes, slits curved up (smiling); the mouth, a wide smile
      for (const e of [-0.33, 0.33]) if (Math.abs(u - 0.2 + 0.9 * (s - e) ** 2) < 0.09 && Math.abs(s - e) < 0.22) return EBONY[0];
      if (Math.abs(u + 0.42 - 0.85 * s * s) < 0.08 && Math.abs(s) < 0.4) return EBONY[0];
    }
    return toneAt(n, GILT, 0.15);
  }, id);
}

// =================================================================================================
// 1. THE GREAT EBONY CLOCK

/**
 * THE GREAT EBONY CLOCK ("a gigantic clock of ebony"), three times the knight's height: a stepped plinth; the long trunk,
 * a glazed door in it and behind the glass its pendulum swinging, the weights hung beside; the hood, columns at its
 * corners, the dial under its arch (a brass plate, a ring of ivory, the hours in ebony, the hands near the hour), the
 * prince's smiling gilt mask in the arch; over all an open cupola of ebony and in it the bell, "the brazen lungs of the
 * clock", its hammer. Its front along +y (`k` 0) or +x (1). `swing`: the pendulum's angle (radians); `chime` 0 none, 1 the
 * hammer drawn back, 2 struck (the bell rings, the hands at the hour). 120 x 240 at (60, 214).
 */
function clockFrame(k: number, swing: number, chime: number): Sprite {
  const S = turned(scene(120, 240, 60, 214), k);
  clockIn(S, swing, chime);
  return done(S, 60, 214);
}
function clockIn(S: Scene, swing: number, chime: number): void {
  const E = EBONY;
  // THE PLINTH: a skirt, the plinth with a sunk panel and its brass edge, a moulding
  plain(S, [0, 0, 1.5], [14.5, 10.5, 1.5], E, 1, -0.1);
  blk(S, [0, 0, 10], [13, 9.4, 7], (k, a, b, n) => {
    if (k === 'top') return toneAt(n, E, 0.1);
    const across = k === 'side' ? a / 9.4 : a / 13;
    const up = (b - 10) / 7;
    if (Math.abs(across) < 0.72 && Math.abs(up) < 0.62) {
      if (Math.abs(Math.abs(across) - 0.72) < 0.07 || Math.abs(Math.abs(up) - 0.62) < 0.12) return toneAt(n, BRASS, -0.1);
      return toneAt(n, E, -0.15);
    }
    return toneAt(n, E, 0);
  }, 2);
  plain(S, [0, 0, 18], [14, 10, 1], E, 3, 0.2);
  // THE TRUNK: a long glazed door, its pendulum behind the glass
  const TZ0 = 19;
  const TZ1 = 101;
  const piv: [number, number] = [0, TZ1 - 4];
  const LEN = 40;
  const bob: [number, number] = [piv[0] + Math.sin(swing) * LEN, piv[1] - Math.cos(swing) * LEN];
  blk(S, [0, 0, (TZ0 + TZ1) / 2], [10, 7, (TZ1 - TZ0) / 2], (k, a, b, n) => {
    if (k === 'top') return toneAt(n, E, 0.1);
    if (k === 'side') {
      // a long narrow panel down its side
      if (Math.abs(a) < 4.2 && b > TZ0 + 6 && b < TZ1 - 6) return Math.abs(Math.abs(a) - 4.2) < 0.6 || b < TZ0 + 7 || b > TZ1 - 7 ? toneAt(n, E, 0.3) : toneAt(n, E, -0.1);
      return toneAt(n, E, 0);
    }
    // the door: its frame lit along the top and left, a fillet of brass; the glass
    const inDoor = Math.abs(a) < 9 && b > TZ0 + 5 && b < TZ1 - 3;
    if (!inDoor) return toneAt(n, E, 0);
    const inGlass = Math.abs(a) < 7.6 && b > TZ0 + 9 && b < TZ1 - 6;
    if (!inGlass) return Math.abs(Math.abs(a) - 8.2) < 0.6 || Math.abs(b - (TZ0 + 8.4)) < 0.6 || Math.abs(b - (TZ1 - 5.4)) < 0.6 ? toneAt(n, BRASS, 0) : toneAt(n, E, a < 0 ? 0.25 : 0);
    // behind the glass: the pendulum (its rod, its bob, lens-shaped), and the two weights on their lines
    const dx = a - piv[0];
    const dz = b - piv[1];
    const L = Math.max(0, Math.min(LEN, -(dx * Math.sin(swing) - dz * Math.cos(swing))));
    const rx = piv[0] + Math.sin(swing) * L;
    const rz = piv[1] - Math.cos(swing) * L;
    const bdx = a - bob[0];
    const bdz = b - bob[1];
    if ((bdx / 4.2) ** 2 + (bdz / 5) ** 2 < 1) return bdx + bdz * 0.4 < -1.2 ? BRASS[4] : bdx > 1.8 ? BRASS[2] : BRASS[3];
    if (Math.hypot(a - rx, b - rz) < 0.55) return BRASS[3];
    for (const wx of [-3.8, 3.8]) {
      const wz = wx < 0 ? TZ1 - 34 : TZ1 - 26;
      if (Math.abs(a - wx) < 1.4 && b > wz - 8 && b < wz) return a - wx < -0.4 ? BRASS[3] : BRASS[1];
      if (Math.abs(a - wx) < 0.3 && b >= wz) return BRASS[1];
    }
    // the glass: the dark of the case behind it, a long pale streak where it catches the light
    if (Math.abs(a + b * 0.35 - (TZ0 + 30) * 0.35 + 2) < 0.8) return toneAt(n, E, 0.6);
    return E[0];
  }, 4);
  plain(S, [0, 0, TZ1 + 1], [11.5, 8.2, 1.2], E, 5, 0.25);
  // THE HOOD: the dial under its arch, the prince's mask in the arch
  const HZ0 = TZ1 + 2;
  const HZ1 = HZ0 + 40;
  const dc: [number, number] = [0, HZ0 + 15];
  const hourA = chime === 2 ? 0 : -0.2;
  const minA = chime === 2 ? 0 : -0.52;
  blk(S, [0, 0, (HZ0 + HZ1) / 2], [12, 8.6, 20], (k, a, b, n) => {
    if (k === 'top') return toneAt(n, E, 0.1);
    if (k === 'side') return Math.abs(a) < 5 && b > HZ0 + 6 && b < HZ1 - 6 ? toneAt(n, E, -0.15) : toneAt(n, E, 0);
    const dx = a - dc[0];
    const dz = b - dc[1];
    const inSquare = Math.abs(dx) < 9 && dz > -9 && dz < 9;
    const inArch = dz >= 9 && Math.hypot(dx, dz - 9) < 9;
    if (!inSquare && !inArch) return Math.abs(dx) < 10.2 && dz > -10.2 && (dz < 9 || Math.hypot(dx, dz - 9) < 10.2) ? toneAt(n, GILT, 0.1) : toneAt(n, E, 0);
    if (inArch) {
      // the arch's plate, brass; the mask is built proud of it (below)
      return Math.hypot(dx, dz - 9) > 8 ? BRASS[1] : toneAt(n, BRASS, -0.1);
    }
    // the dial: the brass plate, its corners' spandrels; the ring of ivory, the hours; the hands
    const r = Math.hypot(dx, dz);
    if (r > 8.4) return fr((dx + dz) * 0.5) < 0.4 ? BRASS[4] : BRASS[2];
    if (r > 5.6) {
      const ang = Math.atan2(dx, dz);
      const tick = Math.abs(fr((ang / (Math.PI * 2)) * 12 + 0.5) - 0.5) < 0.07;
      if (tick && r > 6.2) return E[0];
      return r > 8 || r < 5.9 ? IVORY[1] : IVORY[3];
    }
    // the hands, ebony: the hour short and broad, the minute long
    const hand = (ang: number, len: number, w: number): boolean => {
      const ux = Math.sin(ang);
      const uz = Math.cos(ang);
      const t = dx * ux + dz * uz;
      const d = Math.abs(dx * uz - dz * ux);
      return t > -0.6 && t < len && d < w * (1 - (t / len) * 0.6);
    };
    if (hand(hourA, 4.4, 0.9) || hand(minA, 7.2, 0.6)) return E[0];
    if (r < 0.9) return BRASS[4];
    return r < 2 ? BRASS[1] : toneAt(n, BRASS, 0.2);
  }, 6);
  giltMask(S, [0, 9.1, HZ0 + 27], [0, 1, 0], 5.2, 7);
  // the hood's columns at its front corners, their capitals and bases of brass
  for (const x of [-11, 11]) {
    S.rod([x, 8.8, HZ0 + 2], [x, 8.8, HZ1 - 2], 1.5, 1.5, E, 8);
    S.egg([x, 8.8, HZ1 - 1.6], AXES, [2.2, 2.2, 1.4], (n) => toneAt(n, BRASS, 0.1), 8);
    S.egg([x, 8.8, HZ0 + 1.6], AXES, [2.2, 2.2, 1.4], (n) => toneAt(n, BRASS, 0), 8);
  }
  // its cornice, a broken pediment's two scrolls
  plain(S, [0, 0, HZ1 + 1.8], [13.6, 10, 1.8], E, 9, 0.3);
  blk(S, [0, 0, HZ1 + 4.2], [13, 9.4, 0.6], (_k, _a, _b, n) => toneAt(n, BRASS, 0.1), 10);
  for (const s of [-1, 1]) bent(S, [[s * 12.5, 9.4, HZ1 + 4], [s * 9, 9.4, HZ1 + 9], [s * 5, 9.4, HZ1 + 10], [s * 3.6, 9.4, HZ1 + 7.6]], 1.7, 1.2, E, 11);
  // THE CUPOLA, open, of ebony: four slender posts, a dome, a finial; THE BELL in it, and its hammer
  const CZ = HZ1 + 5;
  for (const [x, y] of [[-7.5, -5.5], [7.5, -5.5], [-7.5, 5.5], [7.5, 5.5]]) S.rod([x, y, CZ], [x, y, CZ + 20], 1.1, 1.1, E, 12);
  plain(S, [0, 0, CZ + 0.6], [9.6, 7.6, 0.6], E, 12, 0.2);
  S.egg([0, 0, CZ + 20], AXES, [10, 8, 10], (n) => toneAt(n, E, 0.15), 13, (w) => w[2] >= CZ + 20);
  S.rod([0, 0, CZ + 29], [0, 0, CZ + 36], 1.1, 0.6, BRASS, 14);
  S.egg([0, 0, CZ + 37.5], AXES, [1.6, 1.6, 2.2], (n) => toneAt(n, BRASS, 0.2), 14);
  // the bell: a crown, a waist, a flared lip
  const bellR = (z: number): number => {
    const t = (z - (CZ + 5)) / 12;
    return 2 + 3.8 * Math.sin(Math.min(1, t) * Math.PI * 0.5) ** 0.6 + (t > 0.7 ? (t - 0.7) * 6 : 0);
  };
  cylinder(S, 0, 0, (z) => bellR(CZ + 17 - (z - (CZ + 5))), CZ + 5, CZ + 17, (n) => toneAt(n, BRASS, chime === 2 ? 0.35 : 0.1), 15, () => BRASS[3]);
  // the hammer: on its arm from the post behind, drawn back or struck on the lip
  const head: V3 = chime === 1 ? [9, 2, CZ + 13] : chime === 2 ? [6.4, 1.6, CZ + 7] : [7.6, 1.8, CZ + 9];
  S.rod([7, -4, CZ + 4], head, 0.5, 0.5, IRON, 16);
  S.egg(head, AXES, [1.3, 1.3, 1.6], (n) => toneAt(n, IRON, 0.2), 16);
  if (chime === 2) {
    // THE CHIME: the bell rings; its note goes out of the cupola either side in three arcs of light on the brass
    const [cx, cy] = S.at([0, 0, CZ + 11]);
    for (const [R, k] of [[14, 4], [19, 3], [24, 3]] as const) {
      for (const side of [-1, 1]) {
        for (let i = -24; i <= 24; i++) {
          const a = (i / 24) * 0.55;
          const x = Math.round(cx + side * Math.cos(a) * R);
          const y = Math.round(cy + Math.sin(a) * R * 0.9);
          S.put(x, y, 1e5, BRASS[k], 17);
        }
      }
    }
  }
}

// =================================================================================================
// 2. A BRAZIER ON ITS TRIPOD

/**
 * A BRAZIER ON ITS TRIPOD ("a heavy tripod, bearing a brazier of fire"), the tale's light, standing in the corridors
 * opposite each window: three legs of iron, curved, on paws, tied by a ring; a deep bowl of iron, its rim of brass, a bed of
 * coals and the fire licking up out of it (four frames). An honest fire. 90 x 150 at (45, 126).
 */
function brazier(f: number): Sprite {
  const S = scene(90, 150, 45, 126);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 4;
    const P = (r: number, z: number): V3 => [Math.cos(a) * r, Math.sin(a) * r, z];
    bent(S, [P(7, 52), P(10, 40), P(10.5, 24), P(13, 6), P(14.5, 2)], 1.6, 1.3, IRON, 1);
    S.egg(P(15.5, 1.4), [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]], [2.6, 1.8, 1.4], (n) => toneAt(n, IRON, 0.1), 1);
    S.egg(P(10.4, 30), AXES, [1.5, 1.5, 1.5], (n) => toneAt(n, BRASS, 0.1), 2);
  }
  for (let i = 0; i < 24; i++) {
    const a0 = (i / 24) * Math.PI * 2;
    const a1 = ((i + 1) / 24) * Math.PI * 2;
    S.rod([Math.cos(a0) * 10.6, Math.sin(a0) * 10.6, 24], [Math.cos(a1) * 10.6, Math.sin(a1) * 10.6, 24], 0.6, 0.6, IRON, 3);
  }
  // the bowl: drawn in under, flaring to its rim
  cylinder(S, 0, 0, (z) => 6 + (z - 48) * 1.15, 48, 58, (n, a, z) => (z > 56.8 ? toneAt(n, BRASS, 0.2) : toneAt(n, IRON, Math.abs(Math.sin(a * 6)) < 0.15 ? 0.3 : 0)), 4, (_a, rr) => {
    if (rr > 0.92) return BRASS[3];
    // the coals: dark, glowing in their cracks
    const g = hash(Math.floor(rr * 9), Math.floor(_a * 5), 9171 + f);
    return g < 0.45 ? COAL[0] : g < 0.7 ? COAL[2] : g < 0.88 ? COAL[3] : EMBER[2];
  });
  fireIn(S, [0, 0, 58.5], 5, 26, 18, f, 5);
  // a spark or two flying up
  const sparks: [number, number, number][] = [[-5, 2, 92], [6, -1, 86], [-2, -4, 98], [4, 3, 95]];
  const [sx, sy, sz] = sparks[f % 4];
  const [px, py] = S.at([sx, sy, sz]);
  S.put(Math.round(px), Math.round(py), 1e5, EMBER[3], 6);
  return done(S, 45, 126, [{ at: [0, 0, 70], r: 44 + (f % 2) * 3, color: EMBER[2], a: 0.5 }]);
}

// =================================================================================================
// 3. A GILT CANDELABRUM, 4. A CRYSTAL CHANDELIER, 5. A GILT SCONCE

/**
 * A GILT CANDELABRUM, man-high, for the galleries and the card rooms (the doc's candlelight): three scrolled feet, a
 * baluster stem of gilt, six branches curving out and up in two tiers round a seventh candle; lit (an honest flame), or
 * half of it guttered out, the wax run down. 110 x 180 at (55, 160).
 */
function candelabrum(guttered: boolean): Sprite {
  const S = scene(110, 180, 55, 160);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    const P = (r: number, z: number): V3 => [Math.cos(a) * r, Math.sin(a) * r, z];
    bent(S, [P(1.5, 12), P(6, 8), P(10, 3), P(12.5, 1.2), P(13.5, 3), P(12.4, 4.2)], 1.7, 1, GILT, 1);
  }
  S.egg([0, 0, 11], AXES, [4.2, 4.2, 4.6], (n) => toneAt(n, GILT, 0), 2);
  // the baluster stem: a vase, knops, a long shaft
  cylinder(S, 0, 0, (z) => {
    if (z < 26) return 1.6 + 2.6 * Math.sin(((z - 14) / 12) * Math.PI) ** 1.5;
    if (z < 30) return 2.6;
    if (z < 50) return 1.4 + 0.5 * Math.sin(((z - 30) / 20) * Math.PI * 2) ** 2;
    return z < 54 ? 2.8 : 1.6;
  }, 14, 60, (n, a) => toneAt(n, GILT, Math.abs(Math.sin(a * 4)) < 0.2 ? 0.25 : 0), 3);
  // the arms spread across the eye's view (along x - y), an outer pair and an inner pair, curving out and up
  const across: V3 = [Math.SQRT1_2, -Math.SQRT1_2, 0];
  const cups: V3[] = [[0, 0, 80]];
  for (const [side, R, zt, z0] of [[-1, 17, 70, 56], [1, 17, 70, 56], [-1, 9, 75, 59], [1, 9, 75, 59]] as const) {
    const P = (r: number, z: number): V3 => [across[0] * side * r, across[1] * side * r, z];
    bent(S, [P(1.4, z0), P(R * 0.5, z0 - 4), P(R * 0.95, z0 - 1), P(R, zt - 5), P(R, zt)], 1, 0.9, GILT, 4);
    cups.push(P(R, zt));
  }
  cylinder(S, 0, 0, 1.4, 58, 78, (n) => toneAt(n, GILT, 0.1), 5);
  const out = new Set(guttered ? [1, 4] : []);
  cups.forEach((c, i) => {
    cylinder(S, c[0], c[1], (z) => 1.4 + (z - c[2]) * 0.6, c[2], c[2] + 1.8, (n) => toneAt(n, GILT, 0.2), 6 + i * 3);
    S.egg([c[0], c[1], c[2] + 0.2], AXES, [2.8, 2.8, 0.6], (n) => toneAt(n, GILT, 0.3), 6 + i * 3);
    candle(S, c[0], c[1], c[2] + 1.8, out.has(i) ? 4 : 10 + 2 * hash(i, 0, 9181), !out.has(i), 7 + i * 3, 1.1);
    if (out.has(i)) for (let k = 0; k < 3; k++) S.egg([c[0] + 1, c[1] + 0.9, c[2] + 1 - k * 1.6], AXES, [0.7, 0.7, 1.1], (n) => toneAt(n, WAX, 0.1), 8 + i * 3);
  });
  return done(S, 55, 160, [{ at: [0, 0, 80], r: guttered ? 40 : 56, color: FLAMES[3], a: 0.42 }]);
}

/**
 * A CRYSTAL CHANDELIER, hung from the roof on its chain (the galleries and card rooms): a gilt frame (a baluster stem, a
 * great ring with eight arms curving up to their candles, a small ring with four over it); crystal everywhere on it,
 * festoons of drops swagged from arm to arm, a long pendant drop under each arm, and a cascade of strands under the
 * whole gathered to a finial; lit (an honest flame, the drops catching it), or out. It hangs: nothing of it stands on the
 * floor. 220 x 270 at (110, 250).
 */
function chandelier(lit: boolean): Sprite {
  const S = scene(220, 270, 110, 250);
  const Z = 106;
  for (let i = 0; i < 18; i++) S.egg([0, 0, Z + 32 + i * 3.4], AXES, [0.9, 0.9, 1.6], (n) => toneAt(n, GILT, 0), 1);
  // the stem: a baluster of gilt, a bowl under it
  cylinder(S, 0, 0, (z) => 1.6 + 1.8 * Math.sin(((z - Z + 6) / 36) * Math.PI * 3) ** 2, Z - 6, Z + 30, (n) => toneAt(n, GILT, 0.15), 2);
  S.egg([0, 0, Z - 6], AXES, [6, 6, 4.6], (n) => toneAt(n, GILT, 0.1), 2, (w) => w[2] <= Z - 5);
  const drop = (x: number, y: number, z: number, L: number, k: number): void => {
    // a prism drop: long, cut in facets that catch the light
    S.egg([x, y, z - L / 2], AXES, [1.3, 1.3, L / 2], (n, w) => {
      const facet = fr(Math.atan2(n[1], n[0]) * 1.3 + w[2] * 0.4);
      if (lit && facet < 0.15 && n[2] > -0.3) return FLAMES[4];
      return toneAt(n, CRYSTAL, facet < 0.3 ? 0.6 : facet > 0.75 ? 0 : 0.3);
    }, SOFT_ID + k);
  };
  const bead = (p: V3, k: number): void => S.egg(p, AXES, [1, 1, 1], (n) => (lit && n[2] > 0.5 && n[0] < 0.2 ? CRYSTAL[4] : toneAt(n, CRYSTAL, 0.35)), SOFT_ID + k);
  // the arms: each an S of gilt, down and out from the stem's bowl and up to its candle
  const arms = (R: number, z: number, n: number, off: number, id: number): V3[] => {
    const tips: V3[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + off;
      const P = (r: number, zz: number): V3 => [Math.cos(a) * r, Math.sin(a) * r, zz];
      bent(S, [P(3, z + 2), P(R * 0.35, z - 3), P(R * 0.7, z - 4), P(R * 0.95, z - 1), P(R, z + 4)], 1.1, 0.8, GILT, id);
      tips.push(P(R, z + 4));
    }
    return tips;
  };
  const low = arms(26, Z - 2, 8, 0.2, 10);
  const high = arms(14, Z + 14, 4, 0.6, 20);
  let id = 30;
  for (const c of [...low, ...high]) {
    cylinder(S, c[0], c[1], (z) => 1.2 + (z - c[2]) * 0.6, c[2], c[2] + 1.8, (n) => toneAt(n, GILT, 0.2), id);
    S.egg([c[0], c[1], c[2] + 0.1], AXES, [2.6, 2.6, 0.6], (n) => toneAt(n, GILT, 0.3), id);
    candle(S, c[0], c[1], c[2] + 1.8, 7 + 2 * hash(id, 0, 9191), lit, id + 1, 1);
    id += 3;
  }
  // festoons of crystal swagged from arm to arm under the candles; a long drop from each arm's elbow
  for (let i = 0; i < 8; i++) {
    const a0 = (i / 8) * Math.PI * 2 + 0.2;
    const a1 = ((i + 1) / 8) * Math.PI * 2 + 0.2;
    for (let k = 1; k < 7; k++) {
      const t = k / 7;
      const a = a0 + (a1 - a0) * t;
      bead([Math.cos(a) * 24, Math.sin(a) * 24, Z - 2 - Math.sin(t * Math.PI) * 8], i);
    }
    drop(Math.cos(a0) * 18, Math.sin(a0) * 18, Z - 6, 9, 10 + i);
  }
  // the cascade under the bowl, strands of beads gathered to a long drop
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    for (let k = 0; k < 6; k++) {
      const t = k / 6;
      const r = 11 * (1 - t) ** 1.2 + 1.5;
      bead([Math.cos(a) * r, Math.sin(a) * r, Z - 9 - t * 18], 20 + i);
    }
  }
  drop(0, 0, Z - 27, 10, 30);
  return done(S, 110, 250, lit ? [{ at: [0, 0, Z + 8], r: 90, color: FLAMES[3], a: 0.45 }] : []);
}

/** A GILT SCONCE on the wall: a back plate of gilt, a cartouche with a shell over it, two arms scrolled out from it, a candle in each; lit (an honest flame) or out. */
function sconce(lit: boolean): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    const Z = 58;
    S.egg(w(0, 0.8, Z), [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [6, 1, 12], (n, p) => {
      const up = p[2] - Z;
      return Math.abs(up - 4) < 0.7 || Math.abs(up + 6) < 0.7 ? GILT[4] : toneAt(n, GILT, 0.1);
    }, 1);
    // the shell over it: ribs fanned
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * (0.12 + (i / 6) * 0.76);
      S.rod(w(0, 1.2, Z + 11), w(Math.cos(a) * 7, 1.4, Z + 11 + Math.sin(a) * 6), 0.9, 0.6, GILT, 2);
    }
    // two arms scrolled out from it, a candle in each
    for (const s of [-1, 1]) {
      bent(S, [w(s * 2, 1.6, Z - 7), w(s * 6, 5, Z - 12), w(s * 10, 10, Z - 8), w(s * 11, 13, Z - 2)], 1.1, 0.9, GILT, 3);
      const c = w(s * 11, 13, Z - 1.5);
      cylinder(S, c[0], c[1], (z) => 1.6 + (z - c[2]) * 0.6, c[2], c[2] + 2, (n) => toneAt(n, GILT, 0.2), 4);
      S.egg([c[0], c[1], c[2] + 0.2], AXES, [3, 3, 0.6], (n) => toneAt(n, GILT, 0.3), 4);
      candle(S, c[0], c[1], c[2] + 2, 11, lit, s < 0 ? 5 : 7, 1.2);
    }
  }, 90, 130, (_S, w) => (lit ? [{ at: w(0, 12, 70), r: 50, color: FLAMES[3], a: 0.42 }] : []), 30);
}

// =================================================================================================
// 6. BLACK VELVET AT A WINDOW LIT RED, 7. A TAPESTRY, 8. A PIER GLASS

/** Half the width of a Gothic window's glass `v` up (as the ground's, art/masque.ts): -1 over its point. */
function glassHalf(v: number): number {
  if (v < WIN.spring) return WIN.hw;
  const dv = v - WIN.spring;
  if (dv >= WIN.r) return -1;
  return -(WIN.r - WIN.hw) + Math.sqrt(WIN.r * WIN.r - dv * dv);
}

/**
 * BLACK VELVET AT A WINDOW LIT RED (the black room's): a tall, narrow Gothic window in its surround of stone, its panes
 * scarlet, "a deep blood color", the brazier's fire behind them (an honest fire through red glass, its light red on what is
 * near); black velvet curtains hung from a pelmet over it, drawn back either side to tie-backs of gilt cord, falling in
 * heavy folds to pool on the floor, the red catching the edges of their folds near the glass.
 */
function velvetWindow(): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    const B = 0.3;
    // the window's surround and its glass, flat in the wall
    S.quad([w(-WIN.hw - 4, B, WIN.sill - 4), w(WIN.hw + 4, B, WIN.sill - 4), w(WIN.hw + 4, B, WIN.apex + 5), w(-WIN.hw - 4, B, WIN.apex + 5)], (u, v) => {
      const a = -WIN.hw - 4 + u * (2 * WIN.hw + 8);
      const z = WIN.sill - 4 + v * (WIN.apex + 9 - WIN.sill);
      const hw = glassHalf(z);
      const inGlass = z >= WIN.sill && hw >= 0 && Math.abs(a) < hw;
      if (inGlass) {
        const dv = z - WIN.sill;
        const du = Math.round(a);
        if (((du + Math.round(dv) + 60) % 6 === 0) || ((du - Math.round(dv) + 60) % 6 === 0)) return SCARLET[0];
        const heat = 1 - Math.hypot(a / 6, (dv - 18) / 14);
        if (heat > 0.6) return EMBER[3];
        return heat > 0.15 ? SCARLET[4] : heat > -0.5 ? SCARLET[3] : z > WIN.spring + 4 ? SCARLET[1] : SCARLET[2];
      }
      const hwo = z < WIN.sill ? WIN.hw + 3 : glassHalf(z - 3) >= 0 ? glassHalf(z - 3) + 3 : -1;
      if (hwo < 0 || Math.abs(a) > hwo) return null;
      if (z < WIN.sill) return z > WIN.sill - 2 ? '#958c82' : '#5e5856';
      return a < 0 ? '#958c82' : '#5e5856';
    }, 1);
    // the curtains: folds whose depth out of the wall rises and falls across them, gathered at the tie-back and pooled at the foot
    const TOP = WIN.apex + 12;
    const TIE = 44;
    const curtain = (side: number, id: number): void => {
      const N = 14;
      const Z = [0, 6, 16, 28, TIE - 4, TIE, TIE + 6, 62, 80, 96, TOP];
      // how far from the window's middle the curtain's inner edge is, and how wide it is, at a height: hung full from the
      // pelmet, gathered narrow at the tie-back, flaring out below it to the floor
      const KEY: [number, number, number][] = [[0, WIN.hw + 5, 19], [TIE, WIN.hw + 10, 7], [TIE + 6, WIN.hw + 10, 7], [TOP, WIN.hw + 1, 21]];
      const at = (z: number, k: 1 | 2): number => {
        for (let q = 0; q + 1 < KEY.length; q++) {
          if (z <= KEY[q + 1][0]) {
            const t = (z - KEY[q][0]) / Math.max(1e-6, KEY[q + 1][0] - KEY[q][0]);
            return KEY[q][k] + (KEY[q + 1][k] - KEY[q][k]) * t;
          }
        }
        return KEY[KEY.length - 1][k];
      };
      const inner = (z: number): number => at(z, 1);
      const width = (z: number): number => at(z, 2);
      for (let i = 0; i < N; i++) {
        for (let j = 0; j + 1 < Z.length; j++) {
          const pt = (ii: number, z: number): V3 => {
            const t = ii / N;
            const a = side * (inner(z) + t * width(z));
            const b = 2.4 + 2.2 * Math.abs(Math.sin(t * Math.PI * 3.5 + (z < TIE ? 0 : 0.5))) + (z < 4 ? (4 - z) * 0.6 : 0);
            return w(a, b, z);
          };
          const za = Z[j];
          const zb = Z[j + 1];
          S.quad([pt(i, za), pt(i + 1, za), pt(i + 1, zb), pt(i, zb)], (_u, vv) => {
            // the fold's turn to the light: its slope across
            const t = (i + 0.5) / N;
            const slope = Math.cos(t * Math.PI * 3.5 + (za < TIE ? 0 : 0.5)) * Math.sign(Math.sin(t * Math.PI * 3.5 + (za < TIE ? 0 : 0.5)));
            const k = slope * -side > 0.45 ? 3 : slope * -side > -0.2 ? 2 : slope * -side > -0.7 ? 1 : 0;
            // the red of the window on the folds' edges nearest it
            if (i < 3 && k >= 2 && za > 10) return k === 3 ? '#5a2422' : '#3a1a1c';
            void vv;
            return VELVET[k];
          }, id + i);
        }
      }
      // the tie-back, a gilt cord and its tassel
      const tc = w(side * (WIN.hw + 13), 6, TIE + 3);
      S.rod(w(side * (WIN.hw + 6), 5.5, TIE + 3), w(side * (WIN.hw + 22), 3, TIE + 4), 0.8, 0.8, GILT, id + 40);
      S.egg([tc[0], tc[1], tc[2] - 4], AXES, [1.3, 1.3, 2.6], (n) => toneAt(n, GILT, 0.1), id + 41);
    };
    curtain(-1, 10);
    curtain(1, 60);
    // the pelmet over it: velvet, its edge scalloped, a fringe of gilt
    S.quad([w(-34, 6, TOP - 6), w(34, 6, TOP - 6), w(34, 6, TOP + 6), w(-34, 6, TOP + 6)], (u, v) => {
      const a = -34 + u * 68;
      const z = TOP - 6 + v * 12;
      const sc = TOP - 4 + 2.6 * Math.abs(Math.sin((a / 68) * Math.PI * 5));
      if (z < sc - 1) return null;
      if (z < sc + 0.6) return GILT[3];
      return z > TOP + 4.6 ? GILT[2] : VELVET[2];
    }, 120);
  }, 120, 170, (_S, w) => [{ at: w(0, 6, 46), r: 52, color: RED_WINDOW_LIGHT, a: 0.38 }], 30);
}

/** A DANCER woven in the tapestry: (a, z) in its own measure from its feet's middle; a gown or a coat, arms up; its mask. */
function wovenDancer(a: number, z: number, gown: boolean, flip: number): number {
  // 0 nothing; 1 the gown or coat; 2 the face; 3 the mask; 4 hair
  const x = a * flip;
  if (z > 22 && z < 27 && Math.abs(x - 0.4) < 2.2) {
    if (Math.abs(z - 24.6) < 0.9) return 3;
    return z > 26 ? 4 : 2;
  }
  // the arms raised, reaching across
  if (z > 17 && z < 20 && x > 0 && x < 7 - (z - 17) * 0.4) return 1;
  if (z > 14 && z < 22) return Math.abs(x) < 2.4 - (z - 14) * 0.05 ? 1 : 0;
  if (gown) return z >= 0 && z <= 14 && Math.abs(x) < 2.2 + (14 - z) * 0.32 ? 1 : 0;
  // a coat and legs
  if (z > 7 && z <= 14) return Math.abs(x) < 2.4 + (14 - z) * 0.12 ? 1 : 0;
  return z >= 0 && Math.abs(Math.abs(x) - 1.1 - (7 - z) * 0.1) < 0.7 ? 1 : 0;
}
/**
 * A TAPESTRY OF THE MASQUE: hung from a gilt rod on the wall, woven with the tale's "arabesque figures": masked dancers in
 * a ring, hand to hand, wine and gilt on a deep indigo field scrolled with leaves; a border of wine dotted with gilt; a
 * fringe. Whole; or torn, a long rent up from its foot and a strip of it hanging loose.
 */
function tapestry(torn: boolean): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    const A0 = -20;
    const A1 = 20;
    const Z0 = 34;
    const Z1 = 100;
    const fold = (a: number): number => 1.2 + 0.7 * Math.sin(a * 0.42);
    const rent = (a: number, z: number): boolean => torn && Math.abs(a - 7 - (z - Z0) * 0.12) < 0.9 && z < Z0 + 34;
    const N = 20;
    for (let i = 0; i < N; i++) {
      const a0 = A0 + ((A1 - A0) * i) / N;
      const a1 = A0 + ((A1 - A0) * (i + 1)) / N;
      // (torn: the strip right of the rent hangs lower, sagging away)
      const drop = (a: number): number => (torn && a > 8 ? 3 : 0);
      S.quad([w(a0, fold(a0), Z0 - drop(a0)), w(a1, fold(a1), Z0 - drop(a1)), w(a1, fold(a1), Z1), w(a0, fold(a0), Z1)], (u, v) => {
        const a = a0 + (a1 - a0) * u;
        const z = Z0 - drop(a) + v * (Z1 - Z0 + drop(a));
        const zz = z + drop(a);
        if (rent(a, zz)) return null;
        const lit = Math.cos(a * 0.42) > 0.3 ? 1 : Math.cos(a * 0.42) < -0.5 ? -1 : 0;
        // the fringe and the border
        if (zz < Z0 + 3) return (Math.round(a * 2) & 1) === 0 ? (zz < Z0 + 1.2 ? null : GILT[2]) : GILT[lit > 0 ? 3 : 1];
        const bd = Math.min(a - A0, A1 - a, zz - Z0 - 3, Z1 - zz);
        if (bd < 3.2) return bd < 0.8 ? GILT[2] : (Math.round(a + zz) % 4 === 0 ? GILT[3] : WINE[lit > 0 ? 3 : 2]);
        // the dancers
        const figs: [number, number, boolean, number, Ramp][] = [[-9, Z0 + 12, true, 1, WINE], [0, Z0 + 14, false, -1, GILT], [9, Z0 + 12, true, -1, PURPLE]];
        for (const [fa, fz, gown, flip, R] of figs) {
          const k = wovenDancer(a - fa, zz - fz, gown, flip);
          if (k === 1) return R[lit > 0 ? 3 : 2];
          if (k === 2) return IVORY[2];
          if (k === 3) return GILT[4];
          if (k === 4) return EBONY[2];
        }
        // the field, scrolled with leaves
        const sc = Math.abs(Math.sin(a * 0.6 + Math.sin(zz * 0.25) * 1.6));
        if (sc < 0.12 && Math.round(zz) % 3 !== 0) return INDIGO[lit > 0 ? 4 : 3];
        return INDIGO[lit > 0 ? 2 : lit < 0 ? 1 : 2];
      }, 1 + i);
    }
    // the rod and its finials
    S.rod(w(A0 - 4, 2, Z1 + 2), w(A1 + 4, 2, Z1 + 2), 1, 1, GILT, 40);
    for (const s of [-1, 1]) S.egg(w(s * (A1 + 5), 2, Z1 + 2), AXES, [1.6, 1.6, 1.6], (n) => toneAt(n, GILT, 0.2), 41);
    if (torn) {
      // a loose strip hanging from the rent
      S.quad([w(7.5, 3.4, Z0 + 18), w(9.5, 3.8, Z0 + 18), w(10.6, 4.2, Z0 - 6), w(8.6, 3.8, Z0 - 5)], (u) => (u < 0.4 ? WINE[2] : INDIGO[2]), 42);
    }
  }, 90, 160, undefined, 30);
}

/**
 * A PIER GLASS, ITS GLASS GONE: a tall frame of carved gilt between the windows, its cresting a shell and scrolls with the
 * prince's smiling mask; the glass gone out of it, a shard or two still in its rebate catching the light, the backboards
 * dark behind.
 */
function pierGlass(): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    const HW = 11;
    const Z0 = 24;
    const Z1 = 96;
    S.quad([w(-HW, 0.5, Z0), w(HW, 0.5, Z0), w(HW, 0.5, Z1), w(-HW, 0.5, Z1)], (u, v) => {
      const a = -HW + u * 2 * HW;
      const z = Z0 + v * (Z1 - Z0);
      const e = Math.min(HW - Math.abs(a), z - Z0, Z1 - z);
      if (e < 3.4) {
        if (e < 0.8) return GILT[1];
        // carved: beads along it, lit along its top and left
        if (e > 1.6 && e < 2.6 && fr((a + z) * 0.4) < 0.4) return GILT[4];
        return (a < 0 && HW - Math.abs(a) < 3.4) || Z1 - z < 3.4 ? GILT[3] : GILT[2];
      }
      // the rebate's edge, where a shard of the glass is left
      const shard = (z - Z0 < 9 && a > 2 && z - Z0 < 9 - (a - 2) * 1.2) || (Z1 - z < 7 && a < -4 && Z1 - z < 7 - (-4 - a) * 0.9);
      if (shard) return fr((a - z) * 0.3) < 0.25 ? CRYSTAL[4] : CRYSTAL[2];
      if (e < 4.4) return '#14100e';
      // the backboards behind, dark, their joints
      return Math.round(a + 50) % 6 === 0 ? '#100c0b' : '#2a1f19';
    }, 1);
    // the cresting: scrolls out either side, a shell, the prince's mask
    for (const s of [-1, 1]) bent(S, [w(s * (HW - 1), 1.2, Z1 + 1), w(s * (HW + 3), 1.4, Z1 + 5), w(s * 7, 1.4, Z1 + 9), w(s * 4, 1.3, Z1 + 8)], 1.2, 0.8, GILT, 2);
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * (0.1 + (i / 8) * 0.8);
      S.rod(w(0, 1.4, Z1 + 3), w(Math.cos(a) * 6.5, 1.6, Z1 + 3 + Math.sin(a) * 7), 0.8, 0.6, GILT, 3);
    }
    const o = w(0, 0, 0);
    const out = w(0, 1, 0);
    giltMask(S, w(0, 2.6, Z1 + 6), [out[0] - o[0], out[1] - o[1], out[2] - o[2]], 3.4, 4);
    // the apron below: a scroll and a drop
    bent(S, [w(-6, 1.2, Z0 - 1), w(-2, 1.4, Z0 - 5), w(2, 1.4, Z0 - 5), w(6, 1.2, Z0 - 1)], 1, 1, GILT, 5);
  }, 80, 150, undefined, 30);
}

// =================================================================================================
// 9. GILT ORNAMENTS HANGING FROM THE ROOF, 21. SCATTERED

/** A flat ornament's plane: `X` across it, `Y` up it, `N` the way it faces (units). */
interface Plane { X: V3; Y: V3; N: V3 }
const inPlane = (c: V3, P: Plane, a: number, b: number): V3 => [c[0] + P.X[0] * a + P.Y[0] * b, c[1] + P.X[1] * a + P.Y[1] * b, c[2] + P.X[2] * a + P.Y[2] * b];
/** Hanging, facing `F` (level): across it level, up it upright. */
const hung = (F: V3): Plane => ({ X: [-F[1], F[0], 0], Y: [0, 0, 1], N: F });
/** Lying on the floor, face up, turned `ang`. */
const flatOn = (ang: number): Plane => ({ X: [Math.cos(ang), Math.sin(ang), 0], Y: [-Math.sin(ang), Math.cos(ang), 0], N: [0, 0, 1] });
/** A SUNBURST of gilt, flat: a face in its middle (the prince's smiling mask), its rays long and short about it. */
function sunburst(S: Scene, c: V3, P: Plane, R: number, id: number): void {
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const L = i % 2 ? R * 0.72 : R;
    const mid = inPlane(c, P, Math.cos(a + 0.12) * L * 0.5, Math.sin(a + 0.12) * L * 0.5);
    S.rod(c, mid, R * 0.13, R * 0.1, GILT, id);
    S.rod(mid, inPlane(c, P, Math.cos(a) * L, Math.sin(a) * L), R * 0.1, 0.25, GILT, id);
  }
  giltMask(S, [c[0] + P.N[0] * 0.6, c[1] + P.N[1] * 0.6, c[2] + P.N[2] * 0.6], P.N, R * 0.38, id + 1, P.Y);
}
/** A STAR of gilt, six-pointed, flat. */
function star(S: Scene, c: V3, P: Plane, R: number, id: number): void {
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 2;
    S.rod(c, inPlane(c, P, Math.cos(a) * R, Math.sin(a) * R), R * 0.26, 0.3, GILT, id);
  }
  S.egg(c, [P.N, P.X, P.Y], [R * 0.2, R * 0.3, R * 0.3], (n) => toneAt(n, GILT, 0.3), id);
}
/** A CRESCENT of gilt, flat, its horns up. */
function crescent(S: Scene, c: V3, P: Plane, R: number, id: number): void {
  const pts: V3[] = [];
  for (let i = 0; i <= 12; i++) {
    const a = Math.PI * (1.02 + (i / 12) * 0.96);
    pts.push(inPlane(c, P, Math.cos(a) * R, Math.sin(a) * R + R * 0.45));
  }
  for (let i = 0; i + 1 < pts.length; i++) {
    const t0 = i / (pts.length - 1);
    const t1 = (i + 1) / (pts.length - 1);
    S.rod(pts[i], pts[i + 1], R * 0.3 * Math.sin(Math.PI * t0) + 0.3, R * 0.3 * Math.sin(Math.PI * t1) + 0.3, GILT, id);
  }
}
/**
 * GILT ORNAMENTS HANGING FROM THE ROOF (the tale's "golden ornaments that... depended from the roof"): a sun with the
 * prince's smiling face, a crescent and a star of gilt, each on its long chain down out of the dark, at their own heights;
 * turned a little this way and that (two frames). They hang: nothing of them stands on the floor. 130 x 260 at (65, 240).
 */
function hangingOrnaments(f: number): Sprite {
  const S = scene(130, 260, 65, 240);
  const turn = f ? 0.45 : 0;
  const things: [V3, (S: Scene, c: V3, P: Plane, R: number, id: number) => void, number][] = [
    [[0, 0, 96], sunburst, 11],
    [[-12, 12, 78], crescent, 7],
    [[13, -11, 112], star, 6],
  ];
  things.forEach(([c, make, R], i) => {
    for (let k = 0; k < 24; k++) {
      const z = c[2] + R + 2 + k * 3.2;
      if (z > 228) break;
      S.egg([c[0], c[1], z], AXES, [0.6, 0.6, 1.3], (n) => toneAt(n, GILT, 0), 10 + i);
    }
    const a = 0.785 + turn * (i % 2 ? -1 : 1);
    make(S, c, hung([Math.cos(a), Math.sin(a), 0]), R, 20 + i * 4);
  });
  return done(S, 65, 240);
}
/** GILT ORNAMENTS, SCATTERED (the tale's "golden ornaments that lay scattered to and fro"): a star and a crescent fallen with a length of their chain, gilt beads, a tassel. On the floor. 90 x 56 at (45, 32). */
function scatteredOrnaments(): Sprite {
  const S = scene(100, 60, 50, 34);
  star(S, [-10, 2, 1.4], flatOn(0.4), 5, 1);
  crescent(S, [8, -6, 1.4], flatOn(-0.3), 5, 2);
  // a length of its chain, gilt beads strung, a tassel
  for (let i = 0; i < 7; i++) S.egg([-4 + i * 2, -1 + Math.sin(i * 0.9) * 1.5, 0.7], AXES, [0.8, 0.6, 0.6], (n) => toneAt(n, GILT, 0), 3);
  for (let i = 0; i < 9; i++) S.egg([-18 + i * 2.2, 10 + Math.sin(i) * 2, 0.8], AXES, [0.9, 0.9, 0.8], (n) => toneAt(n, GILT, 0.1), 4);
  S.egg([20, 8, 1.6], AXES, [1.6, 1.4, 1.5], (n) => toneAt(n, GILT, 0.2), 5);
  for (let i = 0; i < 5; i++) S.rod([20 + i * 0.5, 8.5, 1.5], [23 + i * 0.8, 12 + i * 0.3, 0.4], 0.4, 0.3, GILT, 6);
  return done(S, 50, 34);
}

// =================================================================================================
// 10. A GILT CHAIR, 11. A FAINTING COUCH, 12. A CARD TABLE, 13. ROYAL CARDS

/** Where a point of a chair turned to face the room (along (1, 1)) is: its own front along +y. */
const R45 = (p: readonly number[]): V3 => spin(p, -Math.PI / 4);
/** A ring of gilt rods round an ellipse in a plane (its middle, its axes, its half-sizes). */
function giltRing(S: Scene, c: V3, A: V3, B: V3, ra: number, rb: number, th: number, id: number): void {
  const P = (t: number): V3 => [c[0] + A[0] * Math.cos(t) * ra + B[0] * Math.sin(t) * rb, c[1] + A[1] * Math.cos(t) * ra + B[1] * Math.sin(t) * rb, c[2] + A[2] * Math.cos(t) * ra + B[2] * Math.sin(t) * rb];
  for (let i = 0; i < 24; i++) S.rod(P((i / 24) * Math.PI * 2), P(((i + 1) / 24) * Math.PI * 2), th, th, GILT, id);
}
/**
 * A GILT CHAIR, a ballroom's: four cabriole legs of gilt, a seat upholstered in cream silk on a gilt rail, an oval back (a
 * frame of gilt round a panel of the silk) on two stiles, a carved crest over it; turned to look out into the room (toward
 * the eye). Broken: smashed, its seat down on the floor askew, its back lying flat beside it, two legs flung off. 80 x 100 at (40, 82).
 */
function giltChair(broken: boolean): Sprite {
  const S = scene(80, 100, 40, 82);
  const X = R45([1, 0, 0]);
  const Y = R45([0, 1, 0]);
  const Z: V3 = [0, 0, 1];
  const leg = (x: number, y: number, z0: number, id: number): void => bent(S, [[x, y, z0], [x * 1.05, y * 1.05, z0 - 6], [x * 0.92, y * 0.92, z0 - 12], [x * 1.12, y * 1.12, 0.8]].map(R45), 1.2, 0.8, GILT, id);
  const seat = (c: V3, A: V3, B: V3, N: V3, id: number): void => {
    S.egg(c, [A, B, N], [9.4, 8.6, 2.2], (n) => toneAt(n, CREAM, 0.15), id);
    giltRing(S, [c[0] - N[0] * 1.2, c[1] - N[1] * 1.2, c[2] - N[2] * 1.2], A, B, 9.6, 8.8, 0.9, id + 1);
  };
  const back = (c: V3, A: V3, B: V3, N: V3, id: number): void => {
    S.egg(c, [N, A, B], [0.8, 6.4, 7.6], (n) => toneAt(n, CREAM, 0.2), id);
    giltRing(S, c, A, B, 7, 8.2, 1, id + 1);
  };
  if (!broken) {
    for (const [x, y] of [[-7, -6], [7, -6], [-7.5, 6.5], [7.5, 6.5]]) leg(x, y, 18, 1);
    for (const x of [-6.4, 6.4]) S.rod(R45([x, -6.6, 19]), R45([x * 0.7, -7.6, 28.5]), 1, 0.9, GILT, 3);
    back(R45([0, -7.8, 36]), X, Z, Y, 4);
    seat(R45([0, 0.5, 20]), X, Y, Z, 6);
    for (const s of [-1, 1]) bent(S, [R45([0, -7.9, 44.6]), R45([s * 2.4, -7.9, 47]), R45([s * 4.6, -7.9, 45.4]), R45([s * 3.8, -7.9, 44])], 0.8, 0.6, GILT, 8);
    S.egg(R45([0, -7.9, 45.8]), AXES, [1.4, 1, 1.5], (n) => toneAt(n, GILT, 0.3), 8);
  } else {
    // its seat down on the floor, askew, two legs still under it splayed; its back flat beside it; two legs flung off
    const tilt: V3 = R45([0.3, 0, 0.95]);
    seat(R45([2, 4, 4]), X, Y, tilt, 6);
    for (const [x, y] of [[-6, 9], [8, 8]]) bent(S, [R45([x, y, 2.5]), R45([x * 1.3, y * 1.1, 1.2])], 1.1, 0.8, GILT, 1);
    back(R45([-8, -10, 1.6]), X, Y, Z, 4);
    S.rod(R45([10, -8, 0.9]), R45([18, -2, 0.9]), 1.1, 0.8, GILT, 9);
    S.rod(R45([-16, 6, 0.9]), R45([-12, 14, 0.9]), 1.1, 0.8, GILT, 10);
  }
  return done(S, 40, 82);
}

/**
 * A FAINTING COUCH: a long seat of dark wine velvet, buttoned, on short gilt legs; one end raised in a scroll for the
 * head, a low back along half of it, its frame carved and gilt. Its length along x (`k` 0) or y (1). 150 x 110 at (75, 76).
 */
function couch(k: number): Sprite {
  const S = turned(scene(150, 110, 75, 76), k);
  for (const [x, y] of [[-24, -7], [24, -7], [-24, 8], [24, 8]]) bent(S, [[x, y, 8], [x * 1.04, y * 1.08, 4], [x * 1.02, y * 1.12, 0.6]], 1.1, 0.8, GILT, 1);
  // the frame: a gilt rail round the seat
  S.egg([0, 0.5, 9], AXES, [27, 10, 1.6], (n) => toneAt(n, GILT, 0.1), 2);
  // the seat: velvet, buttoned in rows
  S.egg([0, 0.5, 13], AXES, [26, 9.4, 4], (n, w) => {
    const bx = fr(w[0] / 6);
    const by = fr(w[1] / 5);
    if (n[2] > 0.6 && Math.abs(bx - 0.5) < 0.1 && Math.abs(by - 0.5) < 0.14) return WINEVELVET[0];
    return toneAt(n, WINEVELVET, 0);
  }, 3);
  // the raised end: a scroll of velvet
  S.egg([-23, 0.5, 21], [[0.94, 0, 0.34], [0, 1, 0], [-0.34, 0, 0.94]], [5, 9.6, 10], (n) => toneAt(n, WINEVELVET, 0.05), 4);
  S.rod([-28, -9, 26], [-28, 10, 26], 3.2, 3.2, WINEVELVET, 5);
  for (const y of [-9.8, 10.2]) S.egg([-28, y, 26], [[0, 1, 0], [1, 0, 0], [0, 0, 1]], [0.8, 3.4, 3.4], (n) => toneAt(n, GILT, 0.2), 6);
  // the low back along its far side, half its length, its top rail gilt
  S.egg([-6, -8.4, 20], AXES, [16, 2.2, 6.5], (n, w) => (w[2] > 25.4 ? toneAt(n, GILT, 0.2) : toneAt(n, WINEVELVET, 0)), 7);
  // a cushion, and a dropped mask on it
  S.egg([10, 1, 18.5], [[0.8, 0.6, 0], [-0.6, 0.8, 0], [0, 0, 1]], [5, 4, 2], (n) => toneAt(n, GILT, -0.1), 8);
  return done(S, 75, 76);
}

/** A ROYAL CARD's face at (u, v) on it (0..1 across, 0..1 up): cream, a gilt edge, the royal's figure in the royal's colour under a crown of gilt. `who` 0 the Princess (violet), 1 the Prince (wine), 2 the Queen (indigo), 3 the King (gilt). */
function cardFace(who: number, u: number, v: number): string {
  const ROBE = [VIOLET, WINE, INDIGO, GILT][who];
  if (u < 0.08 || u > 0.92 || v < 0.06 || v > 0.94) return PARCH[4];
  if (u < 0.16 || u > 0.84 || v < 0.12 || v > 0.88) return GILT[3];
  // the crown, its points
  if (v > 0.68 && v < 0.8 && Math.abs(u - 0.5) < 0.2) return v > 0.74 && fr(u * 10) < 0.5 ? PARCH[4] : GILT[3];
  // the face
  if (v > 0.56 && v <= 0.68 && Math.abs(u - 0.5) < 0.12) return IVORY[3];
  // the robe
  if (v > 0.18 && v <= 0.56 && Math.abs(u - 0.5) < 0.14 + (0.56 - v) * 0.4) return ROBE[3];
  return PARCH[4];
}
/** A card's back: wine, a lattice of gilt. */
function cardBack(u: number, v: number): string {
  if (u < 0.08 || u > 0.92 || v < 0.06 || v > 0.94) return PARCH[3];
  return fr((u + v) * 5) < 0.15 || fr((u - v) * 5) < 0.15 ? GILT[2] : WINE[3];
}
/** A card lying at `c` on a surface at height z, turned `ang`, face up (`who`) or down (-1). */
function cardIn(S: Scene, c: V3, ang: number, who: number, id: number, tilt = 0): void {
  const w = 3.4;
  const h = 5;
  const P = (a: number, b: number): V3 => [c[0] + Math.cos(ang) * a - Math.sin(ang) * b, c[1] + Math.sin(ang) * a + Math.cos(ang) * b, c[2] + b * tilt];
  S.quad([P(-w, -h), P(w, -h), P(w, h), P(-w, h)], (u, v) => (who < 0 ? cardBack(u, v) : cardFace(who, u, v)), id);
}
/**
 * A CARD TABLE WITH ROYAL CARDS (the set's royal cards: the Princess, the Prince, the Queen and the King): a square table of
 * gilt on cabriole legs, its top of green baize inside a gilt edge; on it the four royal cards fanned face up, the pack and
 * a few cards face down, counters of gilt; unlit candle-stubs at two corners. Broken: overturned onto its side, the cards
 * flung out over the floor. 110 x 100 at (55, 74).
 */
function cardTable(over: boolean): Sprite {
  const S = scene(120, 100, 60, 74);
  if (!over) {
    for (const [x, y] of [[-12, -12], [12, -12], [-12, 12], [12, 12]]) bent(S, [[x, y, 22], [x * 1.08, y * 1.08, 15], [x * 0.95, y * 0.95, 7], [x * 1.12, y * 1.12, 0.8]], 1.1, 0.7, GILT, 1);
    blk(S, [0, 0, 23], [14.5, 14.5, 1.6], (k, a, b, n) => {
      if (k !== 'top') return toneAt(n, GILT, b > 24 ? 0.4 : 0);
      return Math.max(Math.abs(a), Math.abs(b)) > 12.6 ? toneAt(n, GILT, 0.2) : toneAt(n, BAIZE, hash(Math.floor(a * 2), Math.floor(b * 2), 9201) < 0.2 ? -0.2 : 0);
    }, 2);
    [0, 1, 2, 3].forEach((who, i) => cardIn(S, [-3 + i * 2.6, 2 - Math.abs(i - 1.5) * 0.8, 24.7 + i * 0.05], -0.5 + i * 0.32, who, 3 + i));
    for (let i = 0; i < 5; i++) cardIn(S, [8, -7, 24.7 + i * 0.4], 0.3, -1, 10);
    cardIn(S, [-8, -6, 24.7], 1.2, -1, 11);
    for (const [x, y] of [[-6, 8], [-4.6, 9.6], [6, 7]]) cylinder(S, x, y, 1.4, 24.6, 25.4, (n) => toneAt(n, GILT, 0.2), 12, () => GILT[3]);
    for (const [x, y] of [[-12, -12], [12, 12]]) {
      cylinder(S, x, y, 1.6, 24.6, 26.4, (n) => toneAt(n, SILVER, 0.1), 13, () => SILVER[3]);
      candle(S, x, y, 26.4, 2.4, false, 14);
    }
  } else {
    // on its side, its top turned to the eye, two legs out toward the far side
    blk(S, [0, -6, 15], [14.5, 1.6, 14.5], (k, a, b, n) => (k === 'front' ? (Math.max(Math.abs(a), Math.abs(b - 15)) > 12.6 ? toneAt(n, GILT, 0.2) : toneAt(n, BAIZE, 0)) : toneAt(n, GILT, 0.1)), 2);
    for (const [x, z] of [[-12, 3], [12, 3], [-12, 27], [12, 27]]) bent(S, [[x, -7.6, z], [x * 1.08, -14, z * 1.02], [x, -20, z * 0.98]], 1.1, 0.7, GILT, 1);
    const flung: [number, number, number, number][] = [[-14, 10, 0.4, 0], [-6, 16, 1.2, 1], [4, 13, -0.6, 2], [14, 9, 0.9, 3], [-2, 21, 2.1, -1], [10, 19, 0.2, -1], [-12, 20, -0.8, -1], [20, 15, 1.6, -1]];
    flung.forEach(([x, y, a, who], i) => cardIn(S, [x, y, 0.3], a, who, 3 + i));
  }
  return done(S, 60, 74);
}
/** ROYAL CARDS, SCATTERED: the four royals face up among others face down, flung over the floor. On the floor. 90 x 50 at (45, 26). */
function scatteredCards(): Sprite {
  const S = scene(100, 56, 50, 30);
  const flung: [number, number, number, number][] = [[-16, 4, 0.3, 0], [-6, -6, 1.1, 1], [5, 3, -0.5, 2], [16, -4, 0.8, 3], [-9, 12, 2.0, -1], [9, 12, 0.1, -1], [0, -14, -0.9, -1], [22, 8, 1.5, -1], [-22, -6, 0.6, -1]];
  flung.forEach(([x, y, a, who], i) => cardIn(S, [x, y, 0.3 + i * 0.05], a, who, 1 + i));
  return done(S, 50, 30);
}

// =================================================================================================
// 14. A BUFFET OF A FEAST GONE COLD

/** A goblet of silver standing at `c` (its foot), `h` tall; `full` wine in it. */
function goblet(S: Scene, c: V3, h: number, id: number, full = false): void {
  cylinder(S, c[0], c[1], (z) => 1.6 - (z - c[2]) * 0.5, c[2], c[2] + 0.8, (n) => toneAt(n, SILVER, 0.1), id);
  S.rod([c[0], c[1], c[2] + 0.6], [c[0], c[1], c[2] + h * 0.5], 0.35, 0.35, SILVER, id);
  cylinder(S, c[0], c[1], (z) => 0.6 + 1.3 * Math.sin(((z - c[2] - h * 0.5) / (h * 0.5)) * Math.PI * 0.5), c[2] + h * 0.5, c[2] + h, (n) => toneAt(n, SILVER, 0.15), id, (_a, rr) => (rr > 0.8 ? SILVER[3] : full ? WINE[2] : SILVER[0]));
}
/**
 * A BUFFET OF A FEAST GONE COLD: a long table under a cloth of white damask falling to the floor in folds, on it the
 * ball's supper left to go cold: a roast half carved on a charger of silver, a tazza of fruit tipped over and the fruit
 * rolled out, a pie with a wedge cut from it, a tiered cake slumped, a ewer and goblets of silver (one knocked over, its
 * wine soaked into the cloth), two candlesticks burnt down to the socket. Its length along x (`k` 0) or y (1). 190 x 140 at (95, 96).
 */
function buffet(k: number): Sprite {
  const S = turned(scene(190, 140, 95, 96), k);
  const LX = 38;
  const LY = 12;
  const TOPZ = 26;
  // the cloth's fall: strips down the front and the ends, folds deepening as they fall, its hem uneven
  const drapeFront = (side: number, id: number): void => {
    const N = 48;
    for (let i = 0; i < N; i++) {
      const x0 = -LX - 1 + ((2 * LX + 2) * i) / N;
      const x1 = -LX - 1 + ((2 * LX + 2) * (i + 1)) / N;
      const out = (x: number, z: number): number => side * (LY + 1 + ((TOPZ - z) / TOPZ) * 1.4 * Math.sin(x * 0.42));
      const hem = (x: number): number => 3 + 1.2 * Math.sin(x * 0.42 + 1);
      S.quad([[x0, out(x0, hem(x0)), hem(x0)], [x1, out(x1, hem(x1)), hem(x1)], [x1, out(x1, TOPZ), TOPZ], [x0, out(x0, TOPZ), TOPZ]], (_u, v) => {
        const xm = (x0 + x1) / 2;
        const slope = Math.cos(xm * 0.42) * side;
        const t = (1 - v) * 1.4 * slope;
        if (v < 0.08) return LINEN[1];
        // a band of damask along the hem
        if (v > 0.1 && v < 0.2 && fr(xm * 0.3) < 0.5) return LINEN[t > 0.3 ? 4 : 2];
        return LINEN[t > 0.5 ? 4 : t > -0.2 ? 3 : t > -0.8 ? 2 : 1];
      }, id + i);
    }
  };
  drapeFront(1, 1);
  for (const sx of [-1, 1]) {
    const N = 12;
    for (let i = 0; i < N; i++) {
      const y0 = -LY - 1 + ((2 * LY + 2) * i) / N;
      const y1 = -LY - 1 + ((2 * LY + 2) * (i + 1)) / N;
      const out = (y: number, z: number): number => sx * (LX + 1 + ((TOPZ - z) / TOPZ) * 1.2 * Math.sin(y * 0.5));
      S.quad([[out(y0, 3), y0, 3], [out(y1, 3), y1, 3], [out(y1, TOPZ), y1, TOPZ], [out(y0, TOPZ), y0, TOPZ]], (_u, v) => {
        const ym = (y0 + y1) / 2;
        const t = (1 - v) * Math.cos(ym * 0.5);
        return v < 0.08 ? LINEN[0] : LINEN[t > 0.4 ? 3 : t > -0.4 ? 2 : 1];
      }, 60 + i);
    }
  }
  // the top: the cloth laid over it, its damask faint, the wine soaked into it
  S.quad([[-LX - 1, -LY - 1, TOPZ], [LX + 1, -LY - 1, TOPZ], [LX + 1, LY + 1, TOPZ], [-LX - 1, LY + 1, TOPZ]], (u, v) => {
    const x = -LX - 1 + u * (2 * LX + 2);
    const y = -LY - 1 + v * (2 * LY + 2);
    if (Math.hypot((x - 24) / 6, (y - 4) / 3.4) < 1 + 0.2 * Math.sin(x * 2 + y)) return WINE[2];
    if (v > 0.96) return LINEN[4];
    return fr(x * 0.15 + y * 0.15) < 0.1 || fr(x * 0.15 - y * 0.15) < 0.1 ? LINEN[2] : LINEN[3];
  }, 80);
  const Z = TOPZ + 0.2;
  // the roast, half carved, on its charger
  cylinder(S, 0, 0, 9.5, Z, Z + 1.2, (n) => toneAt(n, SILVER, 0.1), 90, (_a, rr) => (rr > 0.85 ? SILVER[4] : SILVER[2]));
  S.egg([0, -1, Z + 5], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [7, 5, 4.2], (n, w) => (w[0] > 3 && n[0] > 0.3 ? PASTRY[3] : toneAt(n, ROAST, 0.05)), 91);
  for (const s of [-1, 1]) S.rod([-4, s * 3, Z + 6], [-8, s * 4.6, Z + 9.6], 1.4, 0.8, ROAST, 92);
  // the tazza of fruit, tipped over, the fruit rolled out over the cloth
  S.rod([-20, 2, Z + 1], [-24, -2, Z + 3], 0.8, 0.8, SILVER, 100);
  S.egg([-17, 4.5, Z + 2.5], [[0.6, 0.6, 0.5], [-0.7, 0.7, 0], [-0.35, -0.35, 0.87]], [6, 6, 1.2], (n) => toneAt(n, SILVER, 0.1), 101);
  const fruit: [number, number, Ramp, number][] = [[-12, 6, APPLE, 2.2], [-14, 9, PEAR, 2.1], [-9, 8.5, APPLE, 2], [-6, 3, PEAR, 2.2], [-19, 9, APPLE, 2.1]];
  fruit.forEach(([x, y, R, r], i) => S.egg([x, y, Z + r], AXES, [r, r, r * (R === PEAR ? 1.3 : 0.95)], (n) => toneAt(n, R, 0), 102 + i));
  for (let i = 0; i < 9; i++) S.egg([-15 + (i % 3) * 1.4, 11 + Math.floor(i / 3) * 0.9, Z + 1 + (i % 2) * 0.6], AXES, [0.9, 0.9, 0.9], (n) => toneAt(n, GRAPE, 0.1), 110);
  // the pie, a wedge cut from it
  cylinder(S, 17, -2, 5.6, Z, Z + 3.4, (n, a) => (Math.sin(a * 2 - 1.2) > 0.85 ? null : toneAt(n, PASTRY, 0)), 120, (a, rr) => {
    const ang = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    if (ang > 0.2 && ang < 1.1) return rr < 0.95 ? ROAST[2] : PASTRY[1];
    return fr(rr * 4 + a * 0.6) < 0.2 ? PASTRY[2] : PASTRY[3];
  });
  // the cake, three tiers slumped, its icing run
  for (const [r, z0, z1] of [[6, Z, Z + 4], [4.4, Z + 4, Z + 7.5], [2.8, Z + 7.5, Z + 10.5]] as const) {
    cylinder(S, -31, -3, (z) => r + (z - z0 < 1 ? 0.4 : 0) + 0.3 * Math.sin(z * 2), z0, z1, (n, a, z) => (Math.sin(a * 5) > 0.7 && z > z1 - 2 ? CREAM[4] : toneAt(n, CREAM, 0.1)), 130, () => CREAM[4]);
  }
  // the ewer and the goblets, one knocked over
  cylinder(S, 29, -5, (z) => {
    const t = (z - Z) / 14;
    return t < 0.1 ? 2.2 : t < 0.6 ? 2.4 + 1.6 * Math.sin(((t - 0.1) / 0.5) * Math.PI) : 1.4 + 1.2 * (t - 0.6);
  }, Z, Z + 14, (n) => toneAt(n, SILVER, 0.15), 140, () => SILVER[1]);
  bent(S, [[30.5, -8, Z + 12], [31.5, -10.5, Z + 10], [31.5, -10, Z + 5], [30, -8, Z + 4]], 0.5, 0.5, SILVER, 141);
  S.rod([27.6, -3.6, Z + 13], [25.6, -1.6, Z + 15], 0.7, 0.3, SILVER, 142);
  goblet(S, [33, 1, Z], 6, 143, true);
  goblet(S, [21, -7, Z], 6, 144);
  // (the one knocked over, lying in its stain)
  S.rod([21, 3.4, Z + 1.2], [26, 4.4, Z + 1.4], 0.4, 0.4, SILVER, 145);
  S.egg([27.4, 4.6, Z + 1.6], [[0.98, 0.2, 0], [-0.2, 0.98, 0], [0, 0, 1]], [2, 1.5, 1.5], (n) => toneAt(n, SILVER, 0.1), 145);
  // two candlesticks, burnt down to the socket
  for (const x of [-9, 9]) {
    cylinder(S, x, -8, (z) => (z - Z < 1 ? 2.2 : 0.9 + 0.5 * Math.sin((z - Z) * 0.8)), Z, Z + 9, (n) => toneAt(n, SILVER, 0.1), 150);
    cylinder(S, x, -8, 1.6, Z + 9, Z + 10, (n) => toneAt(n, SILVER, 0.2), 151, () => WAX[2]);
    for (let i = 0; i < 3; i++) S.egg([x + 1.2, -7, Z + 8.6 - i * 1.4], AXES, [0.5, 0.5, 0.9], (n) => toneAt(n, WAX, 0), 152);
  }
  return done(S, 95, 96);
}

// =================================================================================================
// 15. A HARPSICHORD, 16. A VIOL AND ITS STAND

/** A harpsichord's case seen from above: is (x, y) inside it? (its keyboard's end at -x, its spine along -y, its bentside curving to its tail at +x) */
function inCase(x: number, y: number): boolean {
  if (x < -34 || x > 34 || y < -15 || y > 15) return false;
  // the bentside: from (34, -10) bowing out toward +y to (-18, 15); then straight to the cheek
  if (x < -18) return true;
  const t = (34 - x) / 52;
  const edge = -10 + 25 * Math.sin(t * Math.PI * 0.5) ** 1.4;
  return y < edge;
}
/** Where the bentside is at `x`. */
const bentY = (x: number): number => (x < -18 ? 15 : -10 + 25 * Math.sin(((34 - x) / 52) * Math.PI * 0.5) ** 1.4);
/**
 * A HARPSICHORD for the ball's musicians: its long case, the shape a harpsichord's is (straight down its spine, the
 * bentside curving in to the tail), lacquered black and banded in gilt, on a stand of six turned legs; its lid raised
 * on a stick, the inside of it painted with a garden under a pale sky in a gilt border; the soundboard, its rose; two
 * keyboards, their naturals black and their sharps white; music on its desk. Its length along x (`k` 0) or y (1). 150 x 140 at (75, 104).
 */
function harpsichord(k: number): Sprite {
  const S = turned(scene(150, 140, 75, 104), k);
  const Z0 = 24;
  const Z1 = 33;
  // the stand: six turned legs, stretchers
  for (const [x, y] of [[-31, -12], [-31, 12], [0, -12], [0, 9], [30, -12], [30, -8]]) {
    cylinder(S, x, y, (z) => 1 + 0.7 * Math.sin((z / Z0) * Math.PI * 3) ** 2, 0, Z0, (n) => toneAt(n, EBONY, 0.2), 1);
  }
  S.rod([-31, 12, 4], [0, 9, 4], 0.6, 0.6, EBONY, 2);
  S.rod([0, 9, 4], [30, -8, 4], 0.6, 0.6, EBONY, 2);
  // the case's walls, all round its outline, lacquered black, a band of gilt at its rim
  const outline: [number, number][] = [[-34, -15], [34, -15], [34, -10]];
  for (let i = 1; i <= 20; i++) {
    const x = 34 - (52 * i) / 20;
    outline.push([x, bentY(x)]);
  }
  outline.push([-34, 15]);
  for (let i = 0; i < outline.length; i++) {
    const [ax, ay] = outline[i];
    const [bx, by] = outline[(i + 1) % outline.length];
    if (ax === bx && ay === by) continue;
    S.quad([[ax, ay, Z0], [bx, by, Z0], [bx, by, Z1], [ax, ay, Z1]], (_u, v, w) => {
      if (v > 0.84) return GILT[3];
      if (v < 0.12) return GILT[1];
      // lit as it faces
      const nx = by - ay;
      const ny = -(bx - ax);
      const L = Math.hypot(nx, ny) || 1;
      void w;
      return toneAt([nx / L, ny / L, 0], EBONY, 0.1);
    }, 3 + i);
  }
  // the soundboard: spruce, its rose of gilt, painted flowers
  S.quad([[-34, -15, Z1 - 3], [34, -15, Z1 - 3], [34, 15, Z1 - 3], [-34, 15, Z1 - 3]], (u, v) => {
    const x = -34 + u * 68;
    const y = -15 + v * 30;
    if (!inCase(x - 0.6, y + 0.6) || x < -26) return null;
    const r = Math.hypot(x - 6, y + 2);
    if (r < 3.4 && r > 2.2) return GILT[3];
    if (hash(Math.floor(x), Math.floor(y), 9211) < 0.04) return fr(x * 0.37) < 0.5 ? WINE[3] : BAIZE[3];
    return fr(y * 0.5) < 0.1 ? SPRUCE[1] : SPRUCE[2];
  }, 30);
  // the keyboards: two, stepped, naturals black, sharps white
  for (const [x0, z] of [[-34, Z1 - 4], [-30, Z1 - 2.5]] as const) {
    S.quad([[x0, -13, z], [x0 + 4, -13, z], [x0 + 4, 13, z], [x0, 13, z]], (u, v) => {
      const key = Math.floor(v * 26 * 1.0);
      const sharp = u > 0.45 && [1, 3, 6, 8, 10].includes(key % 12) && fr(v * 26) > 0.25;
      if (sharp) return IVORY[4];
      return fr(v * 26) < 0.14 ? EBONY[0] : EBONY[3];
    }, 31);
  }
  S.box([-24, 0, Z1 + 3], [[0.85, 0, 0.53], [0, 1, 0], [-0.53, 0, 0.85]], [0.4, 8, 3.4], (_f, u, v) => (v > 0.1 && v < 0.9 && u > 0.1 && u < 0.9 ? (fr(u * 6) < 0.15 ? EBONY[2] : PARCH[4]) : EBONY[2]), 32);
  // the lid, raised on its stick, hinged along the spine: its inside painted
  const TH = 1.15;
  const lid = (x: number, d: number): V3 => [x, -15 + d * Math.cos(TH), Z1 + d * Math.sin(TH)];
  S.quad([lid(-34, 0), lid(34, 0), lid(34, 30), lid(-34, 30)], (u, v) => {
    const x = -34 + u * 68;
    const d = v * 30;
    if (!inCase(x, d - 15)) return null;
    if (!inCase(x - 2, d - 13) || d < 2) return GILT[2];
    // a garden under a pale sky: the sky, a line of trees, a lawn
    const h = d / 30;
    if (h > 0.55) return fr(x * 0.2 + h * 3) < 0.2 ? IVORY[3] : IVORY[2];
    if (h > 0.36) return Math.sin(x * 0.7) * 0.06 + 0.45 < h ? IVORY[2] : BAIZE[2];
    return BAIZE[3];
  }, 40);
  S.rod([10, 8, Z1], lid(10, 26), 0.5, 0.5, EBONY, 41);
  return done(S, 75, 104);
}

/** A VIOL's body outline: (s across, t up its length from its foot), inside? Sloping shoulders, a waist, the C-holes. */
function violBody(s: number, t: number): number {
  // 0 outside, 1 the belly, 2 a sound hole, 3 the edge
  if (t < 0 || t > 30) return 0;
  const half = t < 12 ? 7.5 * Math.sin(Math.min(1, (t + 2) / 6) * Math.PI * 0.5) : t < 17 ? 7.5 - (t - 12) * 0.45 : 5.25 - (t - 17) * 0.13 - (t > 24 ? (t - 24) * 0.35 : 0);
  if (Math.abs(s) > half) return 0;
  if (Math.abs(s) > half - 0.7) return 3;
  if (Math.abs(Math.abs(s) - 3.2 - 0.5 * Math.sin((t - 13) * 0.6)) < 0.45 && t > 10 && t < 17) return 2;
  return 1;
}
/** A VIOL laid along `L` (up its length) and `X` (across), its belly facing `N`, its foot at `foot`. */
function viol(S: Scene, foot: V3, L: V3, X: V3, N: V3, id: number): void {
  const P = (s: number, t: number, b: number): V3 => [foot[0] + X[0] * s + L[0] * t + N[0] * b, foot[1] + X[1] * s + L[1] * t + N[1] * b, foot[2] + X[2] * s + L[2] * t + N[2] * b];
  // the back, the ribs (the back seen past the belly), the belly
  S.quad([P(-8, 0, -2.2), P(8, 0, -2.2), P(8, 30, -2.2), P(-8, 30, -2.2)], (u, v) => (violBody(-8 + u * 16, v * 30) ? WALNUTV[1] : null), id);
  S.quad([P(-8, 0, 0), P(8, 0, 0), P(8, 30, 0), P(-8, 30, 0)], (u, v) => {
    const k = violBody(-8 + u * 16, v * 30);
    if (!k) return null;
    if (k === 2) return EBONY[0];
    if (k === 3) return WALNUTV[3];
    const s = -8 + u * 16;
    return s < -2 ? WALNUTV[4] : s > 3 ? WALNUTV[2] : WALNUTV[3];
  }, id + 1);
  // the neck, the pegbox, its carved head; the fingerboard; the strings; the tailpiece
  S.rod(P(0, 29, 0.6), P(0, 50, 0.4), 1.2, 1, WALNUTV, id + 2);
  S.rod(P(0, 31, 1.2), P(0, 49, 1.2), 0.9, 0.7, EBONY, id + 3);
  S.egg(P(0, 53, 0.4), [L, X, N], [3, 1.4, 1.6], (n) => toneAt(n, WALNUTV, 0.1), id + 4);
  S.rod(P(0, 4, 0.8), P(0, 9, 0.9), 1.1, 0.7, EBONY, id + 5);
  for (const s of [-0.8, 0, 0.8]) S.rod(P(s * 1.2, 9, 1.1), P(s * 0.5, 49, 1.4), 0.15, 0.15, IVORY, id + 6);
}
/** Walnut for the viol (warm, its belly lit). */
const WALNUTV: Ramp = ['#1c120c', '#3a2416', '#5a3a20', '#7a522c', '#98683a'];
/**
 * A VIOL AND ITS STAND, the musicians': a music stand of gilt (three feet, its stem, a lyre for the music, a sheet on it)
 * and a bass viol leaning on it, its bow hung beside; knocked over, the stand down, the viol on its back, the music
 * scattered. 100 x 120 at (50, 100).
 */
function violStand(down: boolean): Sprite {
  const S = scene(100, 120, 50, 100);
  if (!down) {
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.4;
      bent(S, [[5, -2, 8], [5 + Math.cos(a) * 5, -2 + Math.sin(a) * 5, 2], [5 + Math.cos(a) * 9, -2 + Math.sin(a) * 9, 0.8]], 0.8, 0.6, GILT, 1);
    }
    S.rod([5, -2, 7], [5, -2, 44], 0.7, 0.6, GILT, 2);
    // the lyre and its sheet
    const C: V3 = [5, -1, 50];
    S.box(C, [[1, 0, 0], [0, 0.42, 0.91], [0, -0.91, 0.42]], [8, 0.4, 6], (_f, u, v) => (u > 0.08 && u < 0.92 && v > 0.08 && v < 0.92 ? (fr(v * 7) < 0.12 ? EBONY[2] : PARCH[4]) : GILT[3]), 3);
    for (const s of [-1, 1]) bent(S, [[5 + s * 2, -1.6, 44], [5 + s * 7, -1.4, 46], [5 + s * 8.4, -0.6, 52]], 0.6, 0.5, GILT, 4);
    viol(S, [-6, 5, 0.5], [0.1, -0.36, 0.93], [0.99, 0, -0.1], [0, 0.93, 0.36], 10);
    S.rod([12, 2, 2], [16, -4, 30], 0.35, 0.3, WALNUTV, 20);
  } else {
    S.rod([-18, 10, 0.8], [18, -2, 0.8], 0.7, 0.6, GILT, 2);
    S.box([22, -4, 1.2], [[0.95, -0.3, 0], [0.3, 0.95, 0], [0, 0, 1]], [8, 6, 0.4], (_f, u, v) => (u > 0.08 && u < 0.92 && v > 0.08 && v < 0.92 ? (fr(v * 7) < 0.12 ? EBONY[2] : PARCH[4]) : GILT[3]), 3);
    viol(S, [-20, -8, 2.4], [0.88, 0.47, 0], [-0.47, 0.88, 0], [0, 0, 1], 10);
    S.rod([-14, 14, 0.6], [14, 18, 0.6], 0.35, 0.3, WALNUTV, 20);
    for (const [x, y, a] of [[-4, 16, 0.4], [6, 10, -0.6]] as const) {
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      S.quad([[x - 4 * ca + 3 * sa, y - 4 * sa - 3 * ca, 0.4], [x + 4 * ca + 3 * sa, y + 4 * sa - 3 * ca, 0.4], [x + 4 * ca - 3 * sa, y + 4 * sa + 3 * ca, 0.4], [x - 4 * ca - 3 * sa, y - 4 * sa + 3 * ca, 0.4]], (_u, v) => (fr(v * 7) < 0.12 ? EBONY[2] : PARCH[4]), 21);
    }
  }
  return done(S, 50, 100);
}

// =================================================================================================
// 17. A FOLDING SCREEN OF ARABESQUES, 18. A FOOTMAN'S TRAY

/** An ARABESQUE painted on a leaf at (a across 0..1, z up 0..1): scrolling leaves of gilt on wine, and on `figure` a masked dancer. */
function arabesque(a: number, z: number, figure: boolean, shade: number): string {
  const W2 = shade > 0.2 ? 3 : shade < -0.3 ? 1 : 2;
  if (figure) {
    const k = wovenDancer((a - 0.5) * 22, (z - 0.18) * 48, a > 0.3 && a < 0.7 && figure, 1);
    if (k === 1) return PURPLE[W2 + 1];
    if (k === 2) return IVORY[W2 + 1];
    if (k === 3) return GILT[4];
    if (k === 4) return EBONY[2];
  }
  const sc = Math.abs(Math.sin(a * 9 + Math.sin(z * 14) * 1.8));
  if (sc < 0.14) return GILT[W2 + 1];
  if (Math.abs(Math.sin(z * 31 + a * 4)) < 0.1 && sc < 0.5) return GILT[W2];
  return WINE[W2];
}
/**
 * A FOLDING SCREEN OF ARABESQUES: four tall leaves standing in a zig-zag, each a frame of gilt with a shaped top round a
 * panel painted with the tale's arabesques (scrolling leaves of gilt on wine, a masked dancer in the middle leaves), on
 * little scrolled feet; knocked flat, its leaves folded together on the floor. 120 x 120 at (60, 96).
 */
function screen(down: boolean): Sprite {
  const S = scene(120, 120, 60, 96);
  const P: [number, number][] = [[-30, -2], [-15, 6], [0, -2], [15, 6], [30, -2]];
  const H = 60;
  if (!down) {
    for (let i = 0; i < 4; i++) {
      const [ax, ay] = P[i];
      const [bx, by] = P[i + 1];
      const nx = -(by - ay);
      const ny = bx - ax;
      const L = Math.hypot(nx, ny);
      const n: V3 = [nx / L, ny / L, 0];
      const lit = dot(n, [-0.55, 0.45, 0.7]);
      const top = (u: number): number => H + 4 * Math.sin(Math.PI * u);
      S.quad([[ax, ay, 3], [bx, by, 3], [bx, by, top(1)], [ax, ay, top(0)]], (u, v, w) => {
        const z = w[2];
        const tz = top(u);
        if (z > tz) return null;
        const e = Math.min(u * 15, (1 - u) * 15, z - 3, tz - z);
        if (e < 1.6) return toneAt(n, GILT, e < 0.6 ? -0.4 : 0.2);
        return arabesque(u, (z - 3) / (tz - 3), i === 1 || i === 2, lit);
      }, 1 + i);
      for (const [x, y] of [[ax + (bx - ax) * 0.1, ay + (by - ay) * 0.1], [ax + (bx - ax) * 0.9, ay + (by - ay) * 0.9]]) bent(S, [[x, y, 3.2], [x + n[0] * 2, y + n[1] * 2, 1.4], [x + n[0] * 3, y + n[1] * 3, 0.6]], 0.7, 0.5, GILT, 10);
    }
  } else {
    // folded together and fallen flat, the top leaf's arabesque up
    for (let i = 3; i >= 0; i--) {
      const z = 0.8 + i * 1.1;
      const off = i * 1.6;
      S.quad([[-28 + off, -8 + off * 0.6, z], [-12 + off, -8 + off * 0.6, z], [-12 + off, 16 + off * 0.6, z], [-28 + off, 16 + off * 0.6, z]], (u, v) => {
        const e = Math.min(u * 15, (1 - u) * 15, v * 24, (1 - v) * 24);
        if (e < 1.4) return GILT[i === 3 ? 3 : 1];
        return i === 3 ? arabesque(u, v, true, 0.3) : WINE[1];
      }, 1 + i);
    }
  }
  return done(S, 60, 96);
}

/**
 * A FOOTMAN'S TRAY: a salver of silver on its folding stand of crossed legs and straps, set with a decanter of wine and its
 * goblets and a folded napkin; dropped, the salver on the floor, the glasses broken, the wine run out over the boards.
 * 90 x 100 at (45, 80).
 */
function footmansTray(dropped: boolean): Sprite {
  const S = scene(90, 100, 45, 80);
  if (!dropped) {
    for (const s of [-1, 1]) {
      S.rod([-8, s * 7, 0.6], [8, s * 6, 29], 0.8, 0.8, WALNUTV, 1);
      S.rod([8, s * 7, 0.6], [-8, s * 6, 29], 0.8, 0.8, WALNUTV, 1);
    }
    for (const x of [-8, 8]) S.quad([[x, -6, 29.6], [x, 6, 29.6], [x, 6, 27.4], [x, -6, 27.4]], () => WINEVELVET[2], 2);
    cylinder(S, 0, 0, 11, 29.8, 31, (n) => toneAt(n, SILVER, 0.1), 3, (_a, rr) => (rr > 0.9 ? SILVER[4] : rr > 0.84 ? SILVER[1] : SILVER[3]));
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * Math.PI * 2;
      S.rod([Math.cos(a) * 10.6, Math.sin(a) * 10.6, 31], [Math.cos(a) * 10.6, Math.sin(a) * 10.6, 32.4], 0.25, 0.25, SILVER, 4);
    }
    // the decanter: a round belly, a long neck, a stopper; the wine dark in it
    cylinder(S, -2, -2, (z) => {
      const t = (z - 31) / 15;
      return t < 0.5 ? 1.4 + 2.6 * Math.sin((t / 0.5) * Math.PI * 0.5 + 0.3) : 0.9 + (t > 0.94 ? 0.6 : 0);
    }, 31, 46, (n, _a, z) => (z < 37 ? toneAt(n, WINE, 0.2) : toneAt(n, CRYSTAL, 0)), 5, () => CRYSTAL[3]);
    S.egg([-2, -2, 47], AXES, [1, 1, 1.4], (n) => toneAt(n, CRYSTAL, 0.2), 5);
    goblet(S, [5, -3, 31], 6, 6, true);
    goblet(S, [3, 5, 31], 6, 7);
    goblet(S, [-6, 5, 31], 6, 8);
    S.egg([7, 4, 32], AXES, [3, 2.2, 1.2], (n) => toneAt(n, LINEN, 0.1), 9);
  } else {
    S.egg([0, 0, 1.2], [[0.97, 0.26, 0], [-0.2, 0.75, 0.62], [0.12, -0.6, 0.79]], [11, 11, 0.8], (n) => toneAt(n, SILVER, 0.1), 3);
    S.egg([9, 10, 0.3], [[0.9, 0.44, 0], [-0.44, 0.9, 0], [0, 0, 1]], [9, 5, 0.3], (_n, w) => (fr(w[0] * 0.3 - w[1] * 0.2) < 0.08 ? WINE[3] : WINE[1]), 4);
    S.rod([4, 9, 1.4], [10, 12, 1.4], 1.4, 1.2, CRYSTAL, 5);
    for (let i = 0; i < 10; i++) {
      const a = i * 2.4;
      const d = 6 + i * 1.3;
      const x = 2 + Math.cos(a) * d;
      const y = 6 + Math.sin(a) * d * 0.6;
      S.quad([[x, y, 0.4], [x + 1.4, y + 0.4, 0.4], [x + 1, y + 1.6, 0.4], [x - 0.2, y + 1, 0.4]], () => (i % 3 ? CRYSTAL[3] : CRYSTAL[4]), 6);
    }
    for (const s of [-1, 1]) S.rod([-18, -6 + s * 6, 0.8], [-2, -16 + s * 6, 0.8], 0.8, 0.8, WALNUTV, 7);
    goblet(S, [-10, 8, 0], 6, 8);
  }
  return done(S, 45, 80);
}

// =================================================================================================
// 19. MASKS DROPPED ON THE FLOOR, 20. WINE SPILLED

/** A MASK lying face up at `c`, turned `ang`: its shell (`R` its colour; half a face or whole), its eyes cut through; a plume or ribbons. */
function lyingMask(S: Scene, c: V3, ang: number, R: Ramp, id: number, plume = false, ribbons = false, trim = false): void {
  // lying face up, tipped a little toward the eye where it rests on its ribbons and its plume
  const tipT = 0.5;
  const X: V3 = [Math.cos(ang), Math.sin(ang), 0];
  const Y0: V3 = [-Math.sin(ang), Math.cos(ang), 0];
  const N: V3 = [Y0[0] * -Math.sin(tipT) * -1 * 0 + 0.3 * Math.SQRT1_2, 0.3 * Math.SQRT1_2, Math.cos(tipT)];
  const nl = Math.hypot(N[0], N[1], N[2]);
  const Nn: V3 = [N[0] / nl, N[1] / nl, N[2] / nl];
  // its up across the face, at right angles to its facing
  const Y: V3 = [Nn[1] * X[2] - Nn[2] * X[1], Nn[2] * X[0] - Nn[0] * X[2], Nn[0] * X[1] - Nn[1] * X[0]];
  const hw = 8.4;
  const hh = 5;
  S.egg(c, [Nn, X, Y], [2.8, hw, hh], (n, w) => {
    const q = [w[0] - c[0], w[1] - c[1], w[2] - c[2]];
    const s = dot(q, X) / hw;
    const u = dot(q, Y) / hh;
    // the eyes, almond-shaped holes, dark; its lower edge dipped over the nose
    for (const e of [-0.4, 0.4]) if (((s - e) / 0.27) ** 2 + ((u - 0.08) / (0.26 - Math.abs(s - e) * 0.3)) ** 2 < 1) return EBONY[0];
    if (u < -0.6 && Math.abs(s) < 0.16) return null;
    if (trim && Math.hypot(s, u * 0.9) > 0.84) return GILT[3];
    return toneAt(n, R, 0.2);
  }, id, (w) => dot([w[0] - c[0], w[1] - c[1], w[2] - c[2]], Nn) >= 0);
  if (plume) {
    // a short fan of feathers off its side
    for (let i = 0; i < 3; i++) {
      const base: V3 = [c[0] + X[0] * hw * 0.85, c[1] + X[1] * hw * 0.85, c[2] + 1.2];
      const a = ang - 0.5 + i * 0.5;
      const mid: V3 = [base[0] + Math.cos(a) * 4.5, base[1] + Math.sin(a) * 4.5, c[2] + 1.6 + i * 0.4];
      S.egg(mid, [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]], [5, 2, 0.8], (n, w) => (fr((w[0] - w[1]) * 0.9) < 0.22 ? toneAt(n, i === 1 ? CREAM : PURPLE, -0.3) : toneAt(n, i === 1 ? CREAM : PURPLE, 0.25)), id + 1 + i);
    }
  }
  if (ribbons) {
    for (const s of [-1, 1]) bent(S, [[c[0] + X[0] * s * hw, c[1] + X[1] * s * hw, c[2] + 0.5], [c[0] + X[0] * s * (hw + 5) + Y0[0] * -4, c[1] + X[1] * s * (hw + 5) + Y0[1] * -4, c[2] + 0.5], [c[0] + X[0] * s * (hw + 6) + Y0[0] * -10, c[1] + X[1] * s * (hw + 6) + Y0[1] * -10, c[2] + 0.5]], 0.6, 0.45, trim ? GILT : R, id + 6);
  }
}
/**
 * MASKS DROPPED ON THE FLOOR, half-masks of the ball: one of gilt with a plume, one white trimmed in gilt, a black velvet
 * domino and a violet one, their ribbons trailing; their eyes dark. On the floor. 140 x 90 at (70, 46).
 */
function droppedMasks(): Sprite {
  const S = scene(140, 90, 70, 46);
  lyingMask(S, [-24, -2, 2.2], 0.2, GILT, 1, true);
  lyingMask(S, [8, -18, 2.2], -0.4, IVORY, 10, false, false, true);
  lyingMask(S, [24, 6, 2.2], 0.6, VELVET, 20, false, false, true);
  lyingMask(S, [-6, 20, 2.2], -0.2, VIOLET, 30);
  return done(S, 70, 46);
}
/** WINE SPILLED: a goblet of silver knocked onto its side, the wine run out of its mouth in a dark pool and its drops. On the floor. 100 x 56 at (50, 30). */
function wineSpilled(): Sprite {
  const S = scene(100, 60, 50, 32);
  // the goblet on its side: its foot, its stem, its bowl widening to its mouth, the mouth toward the pool
  const ax: V3 = [0.9, 0.44, 0];
  const side: V3 = [-0.44, 0.9, 0];
  const at = (t: number): V3 => [-12 + ax[0] * t, -5 + ax[1] * t, 3.6];
  S.egg(at(-11), [ax, side, [0, 0, 1]], [0.9, 3.6, 3.6], (n) => toneAt(n, SILVER, 0.35), 1);
  S.rod(at(-11), at(-4), 0.8, 0.8, SILVER, 2);
  S.rod(at(-4), at(4.6), 0.9, 3.3, SILVER, 4);
  S.egg(at(4.8), [ax, side, [0, 0, 1]], [0.3, 3.2, 3.2], (n) => (n[0] > 0 ? WINE[1] : SILVER[4]), 5);
  // the pool, run out of it, a sheen on it; drops
  S.egg([2, 2, 0.3], [[0.9, 0.44, 0], [-0.44, 0.9, 0], [0, 0, 1]], [11, 6, 0.3], (_n, w) => {
    const d = Math.hypot((w[0] - 2) / 11, (w[1] - 2) / 6) + 0.12 * Math.sin(Math.atan2(w[1] - 2, w[0] - 2) * 5);
    if (d > 1) return null;
    if (d > 0.86) return WINE[0];
    return fr(w[0] * 0.25 - w[1] * 0.15) < 0.07 ? WINE[3] : WINE[1];
  }, 6);
  for (let i = 0; i < 4; i++) S.egg([14 + i * 3, 8 + i * 1.6, 0.3], AXES, [1 - i * 0.15, 0.7, 0.3], () => WINE[1], 7);
  return done(S, 50, 32);
}

// =================================================================================================
// 22. THE ROYAL CREST IN THE FLOOR

/**
 * THE ROYAL CREST (the house's own, as the palace guard wears it, art/palace_guard.ts: an original mark): a white swan, its
 * wings raised, its neck in its S, its head turned to its left; `a` across and `b` up, -1 to 1. Inside it: true.
 */
function swanCrest(a: number, b: number): boolean {
  const e = (x: number, y: number, cx: number, cy: number, rx: number, ry: number): boolean => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
  if (e(a, b, 0.12, -0.5, 0.62, 0.26)) return true;
  if (e(a, b, 0.68, -0.32, 0.16, 0.12)) return true;
  if (b > -0.5 && e(a, b, 0.28, -0.12, 0.42, 0.42)) {
    const notch = b > 0.12 && Math.abs(((a - 0.28) * 4 + 8) % 1 - 0.5) < 0.12;
    if (!notch) return true;
  }
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const x = -0.36 - 0.16 * Math.sin(Math.PI * 1.6 * t) + 0.06 * t;
    const y = -0.38 + 0.98 * t;
    if (Math.hypot(a - x, b - y) < 0.1 - 0.02 * t) return true;
  }
  if (e(a, b, -0.28, 0.62, 0.14, 0.11)) return true;
  if (b < 0.64 && b > 0.52 && a < -0.38 && a > -0.62 + (0.64 - b) * 0.6) return true;
  return false;
}
/**
 * THE ROYAL CREST IN THE FLOOR (a floor tile): an octagon of black marble let into the floor in a band of gilt, the royal
 * swan inlaid in it in white marble, wings raised. Laid flat on a tile: 70 x 40 at (35, 20).
 */
function crestInFloor(): Sprite {
  return lying(70, 40, 35, 20, (u, v) => {
    const m = Math.max(Math.abs(u), Math.abs(v));
    const o = Math.abs(u) + Math.abs(v);
    if (m > 0.44 || o > 0.64) return null;
    if (m > 0.4 || o > 0.6) return m > 0.42 || o > 0.62 ? GILT[1] : GILT[3];
    // the swan, upright as the eye has it
    const a = (u - v) / 0.62;
    const b = -(u + v) / 0.62;
    if (swanCrest(a, b)) return swanCrest(a + 0.06, b - 0.06) ? IVORY[4] : IVORY[2];
    return hash(Math.floor(u * 40), Math.floor(v * 40), 9221) < 0.06 ? EBONY[3] : EBONY[1];
  });
}

// =================================================================================================
// 23. THE GREAT DOORS, 24. THE IRON GATES, THEIR BOLTS WELDED

/**
 * THE GREAT DOORS of the suite: a pair of tall doors, white, their panels framed in gilt, gilt handles, under an
 * architrave and an overdoor of gilt scrolls with the prince's smiling mask at its heart. Shut, or swung open on the dark.
 */
function greatDoors(open: boolean): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    const HW = 21;
    const HT = 84;
    // the architrave
    for (const s of [-1, 1]) S.quad([w(s * HW, 1.6, 0), w(s * (HW + 4), 1.6, 0), w(s * (HW + 4), 1.6, HT + 4), w(s * HW, 1.6, HT + 4)], (u, v) => (u < 0.2 || u > 0.8 ? GILT[s < 0 ? 3 : 2] : v * HT > HT - 3 ? GILT[2] : PAINT[s < 0 ? 3 : 2]), 1);
    S.quad([w(-HW - 4, 1.6, HT), w(HW + 4, 1.6, HT), w(HW + 4, 1.6, HT + 6), w(-HW - 4, 1.6, HT + 6)], (_u, v) => (v < 0.2 || v > 0.8 ? GILT[3] : PAINT[3]), 2);
    // the dark beyond
    S.quad([w(-HW, 0.2, 0), w(HW, 0.2, 0), w(HW, 0.2, HT), w(-HW, 0.2, HT)], () => HOLE, 3);
    // the overdoor: scrolls of gilt, the mask
    for (const s of [-1, 1]) bent(S, [w(s * (HW + 2), 2.2, HT + 6), w(s * 14, 2.4, HT + 12), w(s * 6, 2.4, HT + 14), w(s * 4, 2.4, HT + 10)], 1.6, 1.1, GILT, 4);
    const o = w(0, 0, 0);
    const out = w(0, 1, 0);
    giltMask(S, w(0, 4, HT + 13), [out[0] - o[0], out[1] - o[1], out[2] - o[2]], 4.6, 5);
    const leaf = (side: number, id: number): void => {
      const hinge = side * HW;
      const ang = open ? 1.3 : 0;
      const P = (a: number, z: number): V3 => w(hinge + (a - hinge) * Math.cos(ang), 0.8 + Math.abs(a - hinge) * Math.sin(ang), z);
      const a0 = side < 0 ? -HW : 0;
      const a1 = side < 0 ? 0 : HW;
      S.quad([P(a0, 0), P(a1, 0), P(a1, HT), P(a0, HT)], (u, v) => {
        const a = (u * (a1 - a0)) / HW;
        const z = v * HT;
        // a tall panel over a short one, each framed in gilt
        const inPanel = (z0: number, z1: number): number => {
          const e = Math.min(a - 0.16, 0.84 - a, (z - z0) / HW, (z1 - z) / HW);
          return e;
        };
        const e = Math.max(inPanel(8, 26), inPanel(32, HT - 6));
        if (e > 0 && e < 0.07) return GILT[open ? 2 : 3];
        if (e >= 0.07) return PAINT[open ? 1 : 2];
        return PAINT[open ? 2 : 3];
      }, id);
      // its handle, a gilt scroll
      bent(S, [P(side * 3.5, 40), P(side * 3, 43), P(side * 3.5, 46)], 0.7, 0.6, GILT, id + 1);
    };
    leaf(-1, 10);
    leaf(1, 20);
  }, 130, 140, undefined, 22);
}

/**
 * THE IRON GATES, THEIR BOLTS WELDED (the tale's: "This wall had gates of iron. The courtiers, having entered, brought
 * furnaces and massy hammers and welded the bolts."): two tall leaves of wrought iron between piers of stone, spear-headed
 * bars, a band of scrolls; a great bar across them through staples and two bolts shot into the piers, all of it fused
 * where the hammers welded it, the lumps of iron black and burnt. Shut; or forced open, the bar sheared and hanging, the
 * welds broken. Looking along +y (`k` 0) or +x (1). 170 x 180 at (85, 140).
 */
function ironGates(open: boolean, k: number): Sprite {
  const S = turned(scene(170, 180, 85, 140), k);
  const HW = 30;
  const HT = 74;
  const STONE: Ramp = ['#2e2a30', '#5e5856', '#7a736c', '#958c82', '#b2a898'];
  for (const s of [-1, 1]) {
    plain(S, [s * (HW + 5), 0, HT / 2 + 4], [5, 5, HT / 2 + 4], STONE, 1);
    plain(S, [s * (HW + 5), 0, HT + 9], [6, 6, 1.4], STONE, 1, 0.2);
    S.egg([s * (HW + 5), 0, HT + 14], AXES, [3.4, 3.4, 4.4], (n) => toneAt(n, GILT, 0.1), 2);
  }
  const ang = open ? 1.2 : 0;
  const weld = (c: V3, r: number, id: number): void => {
    // a lump of iron fused by the hammers: knobbed, black, burnt
    for (let i = 0; i < 4; i++) S.egg([c[0] + Math.cos(i * 2.3) * r * 0.5, c[1] + 0.6, c[2] + Math.sin(i * 2.3) * r * 0.5], AXES, [r * 0.7, r * 0.6, r * 0.6], (n) => toneAt(n, ['#0c0a0e', '#16121a', '#262028', '#38302e', '#4a3e36'], 0), id);
  };
  for (const side of [-1, 1]) {
    const hinge = side * HW;
    const P = (a: number, z: number): V3 => [hinge + (a - hinge) * Math.cos(ang), -Math.abs(a - hinge) * Math.sin(ang), z];
    const a0 = side < 0 ? -HW : 0;
    const a1 = side < 0 ? 0 : HW;
    S.rod(P(a0, 3), P(a1, 3), 1, 1, IRON, 10);
    S.rod(P(a0, HT - 14), P(a1, HT - 14), 1, 1, IRON, 10);
    S.rod(P(a0, HT - 4), P(a1, HT - 4), 0.9, 0.9, IRON, 10);
    for (let i = 0; i <= 7; i++) {
      const a = a0 + ((a1 - a0) * i) / 7;
      const top = HT + (side < 0 ? (a - a0) / HW : (a1 - a) / HW) * 8;
      S.rod(P(a, 1), P(a, top), 0.7, 0.7, IRON, 11);
      S.rod(P(a, top), P(a, top + 4), 1.1, 0.1, IRON, 11);
    }
    // the scrolls between the upper rails
    for (let i = 0; i < 4; i++) {
      const am = a0 + ((a1 - a0) * (i + 0.5)) / 4;
      for (let q = 0; q < 12; q++) {
        const t = (q / 12) * Math.PI * 2;
        S.egg(P(am + Math.cos(t) * 2.6 * (1 - q / 18), HT - 9 + Math.sin(t) * 3.4 * (1 - q / 18)), AXES, [0.45, 0.45, 0.45], (n) => toneAt(n, IRON, 0.1), 12);
      }
    }
    // the staple on the leaf for the bar
    S.rod(P(side * 4, 34), P(side * 4, 42), 1.2, 1.2, IRON, 13);
  }
  if (!open) {
    // THE BAR across both leaves through the staples, and the bolts shot into the piers; welded
    S.rod([-HW - 6, 2.4, 38], [HW + 6, 2.4, 38], 1.8, 1.8, IRON, 20);
    for (const s of [-1, 1]) {
      weld([s * 4, 2.6, 38], 3, 21);
      weld([s * (HW + 1), 2.6, 38], 3.4, 22);
    }
    weld([0, 2.6, 38], 2.6, 23);
  } else {
    // the bar sheared, hanging from one staple; the broken welds
    S.rod([-HW, 2.4, 38], [-HW + 6, 4, 22], 1.8, 1.8, IRON, 20);
    weld([-HW - 1, 2.6, 38], 3.2, 22);
    weld([HW + 1, 2.6, 38], 2.4, 22);
  }
  return done(S, 85, 140);
}

// =================================================================================================
// 25. THE PRINCE'S BARGAIN WITH THE ORDER (the quest)

/**
 * THE PRINCE'S BARGAIN WITH THE ORDER (the quest; his doc: "the prince opened the city to the Silent Order in return for
 * his walls"): on a little gilt table of one stem and three feet, a salver, and on it the bargain, written out on
 * parchment and sealed twice, in the prince's gilt (the royal swan) and in the Order's black wax, blank, as their masks
 * are; a quill. Its own pale light. 70 x 90 at (35, 74).
 */
function bargain(): Sprite {
  const S = scene(70, 90, 35, 74);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.6;
    bent(S, [[0, 0, 6], [Math.cos(a) * 5, Math.sin(a) * 5, 2.6], [Math.cos(a) * 8, Math.sin(a) * 8, 0.7]], 0.8, 0.6, GILT, 1);
  }
  cylinder(S, 0, 0, (z) => 1 + 0.6 * Math.sin(z * 0.5) ** 2, 4, 26, (n) => toneAt(n, GILT, 0.1), 2);
  cylinder(S, 0, 0, 9, 26, 27.4, (n) => toneAt(n, GILT, 0.15), 3, (_a, rr) => (rr > 0.9 ? GILT[4] : GILT[2]));
  // the parchment, its two seals
  const Q: [V3, V3, V3, V3] = [[-6, -5, 27.6], [6, -5, 27.6], [6, 5.4, 28.4], [-6, 5.4, 28.4]];
  S.quad(Q, (u, v) => {
    if (u < 0.06 || u > 0.94 || v < 0.05 || v > 0.95) return PARCH[2];
    if (Math.hypot(u - 0.3, v - 0.16) < 0.09) return GILT[3];
    if (Math.hypot(u - 0.7, v - 0.16) < 0.09) return EBONY[1];
    const line = Math.floor(v * 9);
    if (fr(v * 9) > 0.35 && fr(v * 9) < 0.7 && line > 2 && u > 0.12 && u < 0.88 - 0.2 * hash(line, 0, 9231) && hash(Math.floor(u * 20), line, 9232) < 0.7) return EBONY[2];
    return PARCH[4];
  }, 4);
  S.rod([4, 4, 28.6], [12, 9, 34], 0.4, 0.15, IVORY, 5);
  return done(S, 35, 74, [{ at: [0, 0, 32], r: 30, color: '#e8e2d2', a: 0.3 }]);
}

// =================================================================================================
// THE SET

/** The pendulum's swing in its four frames (radians): out to one side, through the middle, out to the other, back. */
export const CLOCK_SWING = [0.18, 0, -0.18, 0] as const;
/**
 * THE CLOCK'S FRAMES, for each way it may stand: its pendulum (CLOCK_SWING, four frames, played over and over at its own
 * slow beat); then its chime (two frames: the hammer drawn back, the bell struck), which the game plays when it chimes (his
 * doc: "Every so often it chimes: every dancer stops dead and turns to look at you"). Frames 0 to 5 its front along +y, 6
 * to 11 along +x.
 */
export const CLOCK_FRAMES = { swing: [0, 1, 2, 3], chime: [4, 5], perFacing: 6 } as const;

let made: Piece[] | null = null;
/** THE MASQUE'S OWN PIECES, the Prince's twenty-five, made the first time they are asked for and kept. */
export function masquePieces(): Piece[] {
  if (made) return made;
  const clock = (k: number): Sprite[] => [...CLOCK_SWING.map((s) => clockFrame(k, s, 0)), clockFrame(k, CLOCK_SWING[0], 1), clockFrame(k, CLOCK_SWING[0], 2)];
  const both = (ss: { left: Sprite; right: Sprite }[]): { left: Sprite[]; right: Sprite[] } => ({ left: ss.map((s) => s.left), right: ss.map((s) => s.right) });
  made = [
    // (frames: its pendulum, four; its chime, two; then the same looking along +x)
    { name: 'the great ebony clock', kind: 'obstacle', frames: [...clock(0), ...clock(1)], shadow: 0.7 },
    // (frames: its fire, four)
    { name: 'a brazier on its tripod', kind: 'obstacle', frames: [0, 1, 2, 3].map(brazier), shadow: 0.45 },
    // (frames: lit, half guttered out)
    { name: 'a gilt candelabrum', kind: 'obstacle', frames: [candelabrum(false), candelabrum(true)], shadow: 0.35 },
    // (it hangs over the floor: frames lit, out)
    { name: 'a crystal chandelier', kind: 'obstacle', frames: [chandelier(true), chandelier(false)], shadow: 0 },
    { name: 'a gilt sconce', kind: 'on the wall', ...both([sconce(true), sconce(false)]) },
    { name: 'black velvet at a window lit red', kind: 'on the wall', ...both([velvetWindow()]) },
    { name: 'a tapestry of the masque', kind: 'on the wall', ...both([tapestry(false), tapestry(true)]) },
    { name: 'a pier glass, its glass gone', kind: 'on the wall', ...both([pierGlass()]) },
    // (they hang: frames turned one way, the other)
    { name: 'gilt ornaments hanging from the roof', kind: 'obstacle', frames: [hangingOrnaments(0), hangingOrnaments(1)], shadow: 0 },
    { name: 'a gilt chair', kind: 'breakable', frames: [giltChair(false), giltChair(true)], shadow: 0.3 },
    // (frames: its length along x, along y)
    { name: 'a fainting couch', kind: 'obstacle', frames: [couch(0), couch(1)], shadow: 0.7 },
    { name: 'a card table with royal cards', kind: 'breakable', frames: [cardTable(false), cardTable(true)], shadow: 0.5 },
    { name: 'royal cards, scattered', kind: 'on the floor', frames: [scatteredCards()] },
    // (frames: its length along x, along y)
    { name: 'a buffet of a feast gone cold', kind: 'obstacle', frames: [buffet(0), buffet(1)], shadow: 1.1 },
    { name: 'a harpsichord', kind: 'obstacle', frames: [harpsichord(0), harpsichord(1)], shadow: 0.9 },
    { name: 'a viol and its stand', kind: 'breakable', frames: [violStand(false), violStand(true)], shadow: 0.35 },
    { name: 'a folding screen of arabesques', kind: 'breakable', frames: [screen(false), screen(true)], shadow: 0.6 },
    { name: "a footman's tray", kind: 'breakable', frames: [footmansTray(false), footmansTray(true)], shadow: 0.35 },
    { name: 'masks dropped on the floor', kind: 'on the floor', frames: [droppedMasks()] },
    { name: 'wine spilled', kind: 'on the floor', frames: [wineSpilled()] },
    { name: 'gilt ornaments, scattered', kind: 'on the floor', frames: [scatteredOrnaments()] },
    { name: 'the royal crest in the floor', kind: 'floor tile', frames: [crestInFloor()] },
    // (frames: shut, open)
    { name: 'the great doors', kind: 'door', ...both([greatDoors(false), greatDoors(true)]) },
    // (frames: shut and open looking along +y, shut and open along +x)
    { name: 'the iron gates, their bolts welded', kind: 'gate', frames: [0, 1].flatMap((k) => [ironGates(false, k), ironGates(true, k)]), shadow: 0.9 },
    { name: "the prince's bargain with the Order", kind: 'quest', frames: [bargain()], shadow: 0.3 },
  ];
  return made;
}
