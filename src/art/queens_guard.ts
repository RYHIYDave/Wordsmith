// FLOOR 18'S QUEEN'S GUARD (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the game imports this file;
// `QGUARD_ON` is off. Their moves are art/queens_guard_moves.ts; what their blows leave on the floor, art/queens_guard_fx.ts.
//
// His doc's floor 18, THE GLASS GALLERY: the queen's wing, long galleries of mirrors and a great glasshouse on the roof; its
// palette silver, cold blue glass and dark violet; from the Grimms' "Snow White" (1812), drawn only from the book. The
// floor's plan, his yes: “Enemies: ladies-in-waiting, the queen's guard, and your own reflections”.
//
// THE BRIEF AS OFFERED (his art rulebook, "A new character", and sound rule 7): the queen's guard, floor 18's medium mob;
// tall halberdiers in silvered armour, violet cloaks, helms crested with spikes of glass like the queen's crown, mirror-
// polished round shields; a head taller than the knight, fewer; their mark the mirror shields and the glass-spiked helms;
// two attacks, a long halberd chop down in front and a shield charge that flashes as it hits; their death, the shield
// cracks like glass, to one knee, the Hush leaves them in a grey breath; never floor 16's palace guard (no tabard, no
// swan), never undead; their sound steel and the ring of glass. HIS PICK for how they move: “Measured, then a sudden
// charge (Recommended)”.
//
// WHO THEY ARE: the queen's own halberdiers, their words stolen. Each a head taller than the knight, long in the leg, in
// full SILVERED PLATE (cool grey-silver, its lights lavender): a breastplate with a ridge down it, its fauld of lames,
// tassets over the thighs, great rounded pauldrons, couters and poleyns, greaves, sabatons and gauntlets; a short arming
// skirt of dark violet under the tassets; A VIOLET CLOAK from the shoulders to the calves, clasped at the pauldrons, edged
// in silver. A CLOSED HELM, its visor a sculpted beak with a slit across the eyes (the cult's dull pink in the dark behind
// it) and the Hush leaking out of it; round its crown A CIRCLET OF GLASS SPIKES like the queen's crown, the tallest at the
// brow. In the right hand A HALBERD: a staff lacquered near black-violet, bound in silver; a broad crescent axe, a hooked
// fluke behind it, a long top spike; a violet tassel. On the left forearm A ROUND MIRROR SHIELD: domed, silver-rimmed and
// studded, its face polished to a mirror that shows the gallery round it (dark violet above, a bright line of the far
// windows, the floor below, the glasshouse's light), the sheen sliding over it as it turns. Nothing cyan anywhere: the
// glass is lavender and cold blue (no hue between 160 and 205).

import { HUSH } from './crier';
import { BREATH_PALE, hushBreath, hushLeaves, lagOf } from './hushed';
import { INK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Stage } from './skin';
import { add, buildOf, cross, dot, heading, lerp3, mul, norm, sub } from './skeleton';
import type { Bones, Build, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const QGUARD_ON = { on: false };

const fr = (t: number): number => t - Math.floor(t);
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const D = Math.PI / 180;
const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);

// =============================================================================================
// THEIR COLOURS: silvered plate with lavender lights; dark violet cloth; lavender and cold blue glass

/** The plate: cool grey-silver, its lights lavender. */
export const SILVER: Ramp = ['#24223a', '#34324c', '#7d7c9e', '#b4b2d0', '#e6e3f6'];
/** The plate of an upright limb (a greave, a vambrace), lit a step brighter: the light from above barely reaches a rod that stands upright. */
const SILVER_UP: Ramp = [SILVER[1], SILVER[2], SILVER[2], SILVER[3], SILVER[4]];
/** Its edges and ridges, a step brighter. */
const EDGE: Ramp = ['#2e2c44', '#3e3c58', '#9896b8', '#cfcde6', '#f6f4fe'];
/** The cloak and the arming skirt: a dark royal violet. */
export const VIOLET: Ramp = ['#170d24', '#1d1130', '#3f2763', '#5a3a82', '#73509c'];
/** Under the plate, at the joints: a darker violet. */
const ARMING: Ramp = ['#130b1c', '#130b1c', '#2a1c3c', '#3d2a54', '#3d2a54'];
/** The halberd's staff: lacquered near black-violet. */
const LACQUER: Ramp = ['#100a16', '#140d1c', '#2a2036', '#41344f', '#5a4a6a'];
/** The glass of the crown's spikes: lavender and cold blue (hue 230 to 250: never the friend's cyan). */
export const GLASS: Ramp = ['#1d1b45', '#2c2c6c', '#6670d2', '#a9b1f6', '#f0f1ff'];
/** The shield's strapping and the gauntlets' palms. */
const LEATHER: Ramp = ['#140e14', '#140e14', '#30222c', '#46333e', '#46333e'];
/** THE MIRROR: what its face shows of the gallery round it, by the way it reflects (the glasshouse's light, the lit vault, the dark walls, the bright line of the far windows, the floor). */
export const MIRROR = { sun: '#ffffff', vault: '#c9cdf0', high: '#a2a8dc', wall: '#7076ac', line: '#eef0ff', floor: '#2c2e50', floor2: '#40437a' } as const;
/** The slant of the sheen across the mirror (a line of the gallery's windows it catches). */
const SHEEN: V3 = norm([0.5, -0.62, 0.3]);
/** The crack's colours as the shield breaks: a bright line with a dark split in it. */
const CRACK = { split: '#120e1c', lit: '#f1eefc' } as const;

// =============================================================================================
// THE BODY: a head taller than the knight (58), long in the leg, broad in the shoulder

export const QG_BODY: Build = buildOf(68, 1.26, { shoulders: 1.12, chest: 1.04, depth: 1.0, waist: 0.94, hips: 1.0, legs: 1.04, arms: 1.04, trunk: 1.0, limbs: 1.0 });
const GB = QG_BODY;
/** Their picture: room for the halberd raised high over them, chopped down far before them, and the shield charge's streaks behind them. */
export const QG_CANVAS: MobCanvas = { w: 470, h: 360, ax: 220, ay: 246 };

// =============================================================================================
// THE HALBERD

/**
 * Its length from the shoe of its butt to the point of its top spike; where its socket is; where its axe runs along it;
 * how far its edge stands out from the staff; where its fluke is.
 */
export const QG_HALBERD = { long: 100, socket: 66, bladeLo: 67, bladeHi: 86, out: 13, fluke: 79, spike: 86 } as const;
/** Where the right hand holds it, from the butt: `draw` 0 down by the butt (to chop at full reach), 1 high up its staff (to carry it). */
export const QG_HOLD = (draw: number): number => 7 + 48 * clamp01(draw);
/** The halberd at a moment: its butt, the way it runs (butt to point), the way its axe stands out, a place this far along it, its point, the middle of its edge. */
export function halberdOf(s: Skeleton, q: { draw: number }): { butt: V3; way: V3; across: V3; at: (k: number) => V3; tip: V3; edge: V3 } {
  const way = s.point;
  const across = norm(sub(s.across, mul(way, dot(s.across, way))), [0, 1, 0]);
  const butt = add(s.handR, mul(way, -QG_HOLD(q.draw)));
  const at = (k: number): V3 => add(butt, mul(way, k));
  const H = QG_HALBERD;
  return { butt, way, across, at, tip: at(H.long), edge: add(at((H.bladeLo + H.bladeHi) / 2), mul(across, H.out)) };
}
/** The halberd in the right hand at `hand` (from their place on the floor), pointing `way`, its axe standing out along `across`, held `draw` of the way up. */
export function halberdGrip(hand: V3, way: V3, across: V3, draw: number): Partial<Bones> {
  const w = norm(way);
  const deg = 180 / Math.PI;
  const wAz = Math.atan2(w[1], w[0]) * deg;
  const wEl = Math.asin(Math.max(-1, Math.min(1, w[2]))) * deg;
  // (the roll about its line that stands its axe out along `across`, measured as the skeleton measures it)
  let flat = sub([0, 0, 1], mul(w, w[2]));
  if (Math.hypot(...flat) < 1e-3) flat = [-1, 0, 0];
  flat = norm(flat);
  const ac = norm(sub(across, mul(w, dot(across, w))), flat);
  const wRoll = Math.atan2(dot(cross(flat, ac), w), dot(flat, ac)) * deg;
  return { rhIn: 2, rhx: hand[0], rhy: hand[1], rhz: hand[2], wAz, wEl, wRoll, draw };
}
/** The halberd stood on its butt at their right side, the right hand round it at `z`, leaning `lean` degrees forward, its axe to the front. */
export function halberdPlanted(hand: [number, number], z: number, lean: number): Partial<Bones> {
  const el = (90 - lean) * D;
  const way: V3 = [Math.cos(el), 0, Math.sin(el)];
  // (so far up it that its shoe just rests on the floor: the shoe is 1.1 thick)
  const hold = (z - 1.15) / way[2];
  return halberdGrip([hand[0], hand[1], z], way, [1, 0, 0], (hold - 7) / 48);
}
/** THE HALBERD: the lacquered staff bound in silver; its shoe; the socket and langets; the crescent axe, its edge ground bright; the hooked fluke behind; the long top spike; a violet tassel; a pink glint along the edge in the warning. */
function halberd(put: Put, s: Skeleton, q: { draw: number }, lag: V3, glint: number, t: number): void {
  const h = halberdOf(s, q);
  const { at, across, way } = h;
  const H = QG_HALBERD;
  put('staff', 'halberd', { k: 'rod', a: at(1.4), b: at(H.socket), ra: 1.0, rb: 0.92, ramp: LACQUER });
  put('staff', 'halberd', { k: 'rod', a: at(0), b: at(2.6), ra: 1.15, rb: 1.08, ramp: SILVER });
  for (const k of [22, 44]) put('staff', 'halberd', { k: 'rod', a: at(k - 0.9), b: at(k + 0.9), ra: 1.22, rb: 1.22, ramp: EDGE });
  // the socket and its langets, up past the axe
  put('socket', 'halberd', { k: 'rod', a: at(H.socket - 3.5), b: at(H.bladeHi + 0.5), ra: 1.3, rb: 1.05, ramp: SILVER });
  // THE AXE: a broad crescent, narrow at its neck on the staff, flaring to its curved edge; its horns reaching past the neck
  const mid = (H.bladeLo + H.bladeHi) / 2;
  const half = (H.bladeHi - H.bladeLo) / 2 + 2.2;
  put('axe', 'halberd', {
    k: 'panel',
    c: add(at(mid), mul(across, H.out / 2 + 0.4)),
    u: mul(across, H.out / 2 + 0.4),
    v: mul(way, half),
    skin: (a0, b0, front, tone0) => {
      const tone = Math.max(2, Math.min(4, tone0 + (front ? 0 : -1)));
      const a = a0 / (H.out / 2 + 0.4);
      const b = b0 / half;
      const out = (a + 1) / 2;
      // (its neck narrow on the staff, its horns flaring to the full height at the edge, the edge itself curved)
      const tall = 0.34 + 0.66 * out ** 1.2;
      if (Math.abs(b) > tall) return null;
      const edgeAt = 1 - 0.42 * b * b;
      if (a > edgeAt) return null;
      // (the hollow of the crescent's back, cut out of it near the staff: its two horns sweep back toward the staff)
      const hollow = Math.hypot((out - 0.05) / 0.42, b / 0.62);
      if (hollow < 1 && Math.abs(b) > 0.2) return null;
      if (a > edgeAt - 0.2) return EDGE[Math.min(4, tone + 1)];
      // (a ridge along it where it was forged, and a hole pierced through it in a quatrefoil: the queen's work)
      if (Math.hypot((out - 0.48) * 2.6, b * 2.1) < 0.36) return Math.hypot((out - 0.48) * 2.6, b * 2.1) < 0.2 ? INK : SILVER[Math.max(1, tone - 1)];
      return SILVER[tone];
    },
  });
  // THE FLUKE: a hooked spike out behind the axe, curving down toward the butt
  const f0 = add(at(H.fluke), mul(across, -0.9));
  const f1 = add(at(H.fluke - 0.6), mul(across, -4.6));
  const f2 = add(at(H.fluke - 3.4), mul(across, -8.2));
  put('fluke', 'halberd', { k: 'rod', a: f0, b: f1, ra: 1.05, rb: 0.75, ramp: SILVER });
  put('fluke', 'halberd', { k: 'rod', a: f1, b: f2, ra: 0.75, rb: 0.2, ramp: EDGE });
  // THE TOP SPIKE: long and square, ground to a point
  put('spike', 'halberd', { k: 'rod', a: at(H.spike - 1), b: at(H.long), ra: 1.15, rb: 0.18, ramp: EDGE });
  // THE TASSEL under the socket: violet, a silver cord, hanging and streaming back
  const tie = at(H.socket - 4);
  const side = norm(cross(way, across), [0, 0, 1]);
  put('tassel', 'halberd', { k: 'ball', c: tie, ax: sphere(1.3), skin: SILVER });
  for (const k of [-1, 0, 1]) {
    const end = add(tie, add([0, 0, -6.5], add(mul(lag, 1.6), add(mul(side, k * 0.7), mul(across, k * 0.6)))));
    put('tassel', 'halberd', { k: 'rod', a: tie, b: end, ra: 0.7, rb: 0.5, ramp: k === 0 ? EDGE : VIOLET });
  }
  if (glint > 0.05) {
    put('glint', 'halberd', { k: 'glow', p: h.edge, c: FLAME[1], r: 7 + 7 * glint, a: 0.5 * glint });
    // (the pink running along the edge by turns, the warning)
    for (let i = 0; i < 5; i++) {
      const k = (i + 0.5) / 5;
      const p = add(at(H.bladeLo - 1 + (H.bladeHi - H.bladeLo + 2) * k), mul(across, H.out * (0.92 - 0.12 * (2 * k - 1) ** 2)));
      if (hash(i, Math.floor(t * 15), 8101) < 0.6) put('glint', 'halberd', { k: 'mote', p, c: i % 2 ? FLAME[2] : FLAME[3], size: 1 });
    }
  }
}

// =============================================================================================
// THE ROUND MIRROR SHIELD, strapped to the left forearm

/** Its radius, how deep its dome is, how far out from the forearm its face stands. */
export const QG_SHIELD = { r: 10, deep: 3.0, out: 3.2 } as const;
/** What the painter is told of them at a moment, by their moves (art/queens_guard_moves.ts). */
export interface QGuardSay {
  /** Whether the halberd has fallen from their hand. */
  dropped: (m: Moment) => boolean;
  /** How far the shield is cracked (0 whole to 1 shattered). */
  cracked: (m: Moment) => number;
  /** THE SMEAR OF A LIGHTNING STRIKE (his Movement 9): after-images of what strikes, each a line of points, the oldest first. */
  smear?: (m: Moment) => V3[][] | null;
  /** What is laid after their edge in a move: the flash of the shield as it hits, the glass falling from it as it breaks. */
  more?: (m: Moment) => [V3, string, number][];
  /** How hard the mirror flashes, 0 to 1 (the shield charge's hit). */
  flash?: (m: Moment) => number;
  /** What the warning's pink glint is on: the halberd's edge (the chop), or the mirror (the shield charge). */
  glintOn?: (m: Moment) => 'halberd' | 'shield';
}
/**
 * The shield at a moment: its middle, the way its face looks (square to the forearm it is strapped to, toward `pAz`, `pEl`
 * of the pose as near as that allows), its across and up, and points round its rim.
 */
export function shieldOf(s: Skeleton, q: { pAz: number; pEl: number }): { c: V3; n: V3; up: V3; across: V3; rim: V3[] } {
  const fore = norm(sub(s.handL, s.elbowL), [1, 0, 0]);
  const want = heading(q.pAz, q.pEl);
  let n = sub(want, mul(fore, dot(want, fore)));
  if (len3(n) < 0.2) n = cross(fore, [0, 0, 1]);
  n = norm(n, [1, 0, 0]);
  // (its up: along the forearm, so that the strapping runs across the arm)
  const up = fore;
  const across = norm(cross(up, n), [0, 1, 0]);
  const c = add(lerp3(s.elbowL, s.handL, 0.6), mul(n, QG_SHIELD.out));
  const rim: V3[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    rim.push(add(c, add(mul(across, Math.cos(a) * QG_SHIELD.r), mul(up, Math.sin(a) * QG_SHIELD.r))));
  }
  return { c, n, up, across, rim };
}
/** The lines of the crack across the shield's face (in its own across and up, from -1 to 1), as far as it has run (`k`). */
function crackLines(k: number): [number, number, number, number][] {
  const out: [number, number, number, number][] = [];
  if (k <= 0) return out;
  // (from where the blow fell, a little above and to one side of its middle, out to the rim in seven jagged arms, each forking)
  const o: [number, number] = [0.18, 0.22];
  for (let i = 0; i < 7; i++) {
    const a0 = (i / 7) * Math.PI * 2 + 0.4 * hash(i, 1, 8131);
    let p: [number, number] = o;
    const steps = 5;
    for (let j = 1; j <= steps; j++) {
      const reach = (j / steps) * 1.15;
      if (reach > k * 1.6) break;
      const a = a0 + 0.45 * (hash(i, j, 8132) - 0.5);
      const q: [number, number] = [o[0] + Math.cos(a) * reach, o[1] + Math.sin(a) * reach];
      out.push([p[0], p[1], q[0], q[1]]);
      if (j === 2 || j === 4) {
        const b = a + (hash(i, j + 9, 8133) < 0.5 ? -0.7 : 0.7);
        out.push([q[0], q[1], q[0] + Math.cos(b) * 0.3, q[1] + Math.sin(b) * 0.3]);
      }
      p = q;
    }
  }
  // (and a ring of it round where the blow fell)
  if (k > 0.35) {
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const b = ((i + 1) / 9) * Math.PI * 2;
      const r = 0.32 + 0.05 * hash(i, 3, 8134);
      out.push([o[0] + Math.cos(a) * r, o[1] + Math.sin(a) * r, o[0] + Math.cos(b) * r, o[1] + Math.sin(b) * r]);
    }
  }
  return out;
}
/** How near a point is to the nearest crack line (in the shield's own units), or Infinity. */
function nearCrack(lines: ReadonlyArray<[number, number, number, number]>, x: number, y: number): number {
  let best = Infinity;
  for (const [x0, y0, x1, y1] of lines) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const L2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / L2));
    best = Math.min(best, Math.hypot(x - (x0 + dx * t), y - (y0 + dy * t)));
  }
  return best;
}
/**
 * THE MIRROR SHIELD: a dome of polished silver, its rim and studs; its face a mirror, showing what it reflects from where
 * the eye stands (the glasshouse's light over it, the lit vault, the gallery's dark walls, the bright line of the far
 * windows, the floor), so that its sheen slides as it turns; its back, leather straps on dark silver. Cracked as they die;
 * a pink glint wheeling over its face in the warning; and white as it flashes.
 */
function shield(put: Put, st: Stage, s: Skeleton, q: { pAz: number; pEl: number }, crack: number, glint: number, flash: number): void {
  const sh = shieldOf(s, q);
  const R = QG_SHIELD.r;
  const lines = crackLines(crack);
  const eye = st.eye;
  // (the light from the glasshouse over the gallery: high, and from the upper left as the eye sees it)
  const sun = norm([-0.35, 0.55, 1]);
  const axes: readonly [V3, V3, V3] = [mul(sh.n, QG_SHIELD.deep), mul(sh.across, R), mul(sh.up, R)];
  put('shield', 'shield', {
    k: 'ball',
    c: add(sh.c, mul(sh.n, -0.4)),
    ax: axes,
    skin: (u, tone) => {
      const rr = Math.hypot(u[1], u[2]);
      if (u[0] < 0) {
        // (its back: dark silver, two leather straps across the forearm)
        if (Math.abs(u[2] - 0.25) < 0.1 || Math.abs(u[2] + 0.25) < 0.1) return LEATHER[Math.max(1, tone)];
        return rr > 0.9 ? SILVER[Math.max(1, tone)] : SILVER[Math.max(0, Math.min(2, tone - 1))];
      }
      // its rim, and the studs round it
      if (rr > 0.86) {
        const a = Math.atan2(u[2], u[1]);
        const stud = Math.abs(fr((a / (Math.PI * 2)) * 12 + 0.5) - 0.5) < 0.12 && rr > 0.9 && rr < 0.97;
        return stud ? EDGE[Math.min(4, tone + 1)] : EDGE[Math.max(1, Math.min(3, tone))];
      }
      if (rr > 0.82) return SILVER[1];
      if (flash > 0.02 && hash(Math.round(u[1] * 9), Math.round(u[2] * 9), 8121) < flash * 1.3) return flash > 0.5 ? '#ffffff' : MIRROR.sun;
      // the crack: a dark split with a bright lip, and what it splits a step askew
      if (lines.length) {
        const d = nearCrack(lines, u[1], u[2]);
        if (d < 0.035) return CRACK.split;
        if (d < 0.075) return CRACK.lit;
      }
      // THE MIRROR: the way the eye's line comes off it, and what lies that way (a bright vault above the line of the far
      // windows, the dark floor below it: as a polished dome shows a room, its line across its middle)
      const nn = norm(add(add(mul(sh.n, u[0] / QG_SHIELD.deep), mul(sh.across, u[1] / R)), mul(sh.up, u[2] / R)));
      const r = sub(mul(nn, 2 * dot(nn, eye)), eye);
      // (askew where it is cracked: each shard reflects a little apart)
      const tilt = lines.length ? (hash(Math.floor((u[1] + 1) * 3), Math.floor((u[2] + 1) * 3), 8122) - 0.5) * 0.5 * crack : 0;
      const h = r[2] + tilt + 0.24;
      if (dot(r, sun) > 0.95) return MIRROR.sun;
      // (a pink glint wheeling over it in the warning)
      if (glint > 0.05) {
        const g = norm([Math.cos(glint * 9), Math.sin(glint * 9), 0.4]);
        if (dot(r, g) > 0.9) return FLAME[2];
        if (dot(r, g) > 0.84) return FLAME[1];
      }
      // (a streak of sheen slanting across it)
      if (Math.abs(dot(r, SHEEN)) < 0.035) return MIRROR.line;
      if (h > 0.3) return MIRROR.vault;
      if (h > 0.1) return MIRROR.high;
      if (h > 0.0) return MIRROR.wall;
      if (h > -0.07) return MIRROR.line;
      if (h > -0.2) return MIRROR.floor2;
      return MIRROR.floor;
    },
  });
  // its boss of the strapping, a small silver dome at the middle of its back
  put('shield', 'shield', { k: 'ball', c: add(sh.c, mul(sh.n, -QG_SHIELD.deep * 0.75)), ax: [mul(sh.n, 1.0), mul(sh.across, 2.2), mul(sh.up, 3.4)], skin: (u, tone) => (u[0] > 0 ? null : LEATHER[Math.max(1, tone)]) });
  if (glint > 0.05) put('glint', 'shield', { k: 'glow', p: add(sh.c, mul(sh.n, 2)), c: FLAME[1], r: 8 + 8 * glint, a: 0.45 * glint });
  if (flash > 0.02) put('glint', 'shield', { k: 'glow', p: add(sh.c, mul(sh.n, 3)), c: '#ece8ff', r: 22 + 40 * flash, a: 0.55 * flash });
}

// =============================================================================================
// THEM AS SOLIDS

/** A plated arm: a great rounded pauldron over the shoulder in two lames; the rerebrace; the couter at the elbow, its wing out; the vambrace; a gauntlet, its cuff flared, its fingers in lames closed round what it holds. */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', cu: V3, curl: number): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const [r0, r1, r2] = GB.armR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  const upper = norm(sub(el, sh), [0, 0, -1]);
  // (the arming sleeve showing at the joints)
  put(`arm${side}`, `sleeve${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.02, rb: r1 * 1.0, ramp: ARMING, far: true });
  put(`arm${side}`, `rerebrace${side}`, { k: 'rod', a: lerp3(sh, el, 0.2), b: lerp3(sh, el, 0.86), ra: r0 * 1.2, rb: r1 * 1.22, ramp: SILVER_UP, far: true });
  // THE PAULDRON: a great cup over the shoulder, its ridge, its lower lame flaring out over the arm
  const lat = norm(sub(sh, lerp3(s.shoulderL, s.shoulderR, 0.5)), [0, side === 'L' ? 1 : -1, 0]);
  const ref = Math.abs(dot(upper, s.chest[0])) > 0.7 ? s.chest[2] : s.chest[0];
  const a1 = norm(cross(upper, ref), s.chest[1]);
  const a2 = norm(cross(a1, upper), s.chest[0]);
  put(`arm${side}`, `pauldron${side}`, {
    k: 'ball',
    c: add(add(sh, mul(cu, 1.3)), mul(lat, 0.8)),
    ax: [mul(s.chest[0], r0 * 1.95), mul(lat, r0 * 1.85), mul(cu, r0 * 1.45)],
    skin: (u, tone) => {
      if (u[2] < -0.42) return null;
      // (its ridge from front to back over the top, and its lip)
      if (Math.abs(u[1]) < 0.09 && u[2] > 0.3) return EDGE[Math.min(4, tone + 1)];
      if (u[2] < -0.3) return EDGE[Math.max(1, tone)];
      // (its lames: lines round it, each lame a step darker at its lower edge)
      if (Math.abs(fr((u[2] + 1) * 2.2) - 0.08) < 0.08 && u[2] < 0.5) return SILVER[Math.max(1, tone - 2)];
      return SILVER[tone];
    },
    far: true,
  });
  put(`arm${side}`, `pauldron${side}`, {
    k: 'ball',
    c: lerp3(sh, el, 0.3),
    ax: [mul(upper, r0 * 1.3), mul(a1, r0 * 1.62), mul(a2, r0 * 1.62)],
    skin: (u, tone) => (u[0] > 0.55 ? null : Math.abs(u[0] - 0.05) < 0.12 ? SILVER[Math.max(1, tone - 1)] : SILVER[tone]),
    far: true,
  });
  // the couter at the elbow, its fan out to the side
  put(`fore${side}`, `couter${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.35), skin: (_u, tone) => EDGE[Math.max(1, Math.min(3, tone))], far: true });
  const wrist = add(hand, mul(fore, -1.3));
  put(`fore${side}`, `vambrace${side}`, { k: 'rod', a: el, b: lerp3(el, wrist, 0.72), ra: r1 * 1.18, rb: r2 * 1.2, ramp: SILVER_UP, far: true });
  put(`fore${side}`, `cuff${side}`, { k: 'rod', a: lerp3(el, wrist, 0.66), b: wrist, ra: r1 * 1.4, rb: r2 * 1.16, ramp: EDGE, far: true });
  const e1 = norm(sub(cu, mul(fore, dot(cu, fore))), [0, 0, 1]);
  const e2 = norm(cross(fore, e1), [0, 1, 0]);
  put(`hand${side}`, `hand${side}`, { k: 'ball', c: add(hand, mul(fore, 0.4)), ax: [mul(fore, 2.0), mul(e2, 1.8), mul(e1, 1.2)], skin: SILVER, far: true });
  for (let i = 0; i < 4; i++) {
    const spread = (i - 1.5) * 0.38;
    const base = add(hand, add(mul(fore, 1.6), mul(e2, spread * 0.9)));
    const mid = add(base, add(mul(fore, 1.4 * (1 - 0.4 * curl)), mul(e1, -1.1 * curl)));
    const tip = add(mid, add(mul(fore, 1.0 * (1 - 0.8 * curl)), mul(e1, -1.4 * curl)));
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: base, b: mid, ra: 0.62, rb: 0.54, ramp: SILVER, far: true });
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: mid, b: tip, ra: 0.54, rb: 0.4, ramp: SILVER, far: true });
  }
}
/** A plated leg: the cuisse over the thigh; the poleyn at the knee, its wing out; the greave; the sabaton of lames. */
function leg(put: Put, s: Skeleton, side: 'L' | 'R'): void {
  const hip = side === 'L' ? s.hipL : s.hipR;
  const knee = side === 'L' ? s.kneeL : s.kneeR;
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const [rH, rK, rA] = GB.legR;
  const thigh = norm(sub(knee, hip), [0, 0, -1]);
  const before = norm(cross(thigh, s.hips[1]), s.hips[0]);
  put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.06, rb: rK * 1.0, ramp: ARMING, far: true });
  put(`leg${side}`, `cuisse${side}`, { k: 'rod', a: lerp3(hip, knee, 0.3), b: lerp3(hip, knee, 0.92), ra: rH * 1.12, rb: rK * 1.16, ramp: SILVER_UP, far: true });
  // the poleyn: a cup over the knee, standing a little proud of it before
  put(`leg${side}`, `poleyn${side}`, { k: 'ball', c: add(knee, mul(before, 0.8)), ax: sphere(rK * 1.16), skin: (u, tone) => (Math.abs(u[2] + 0.2) < 0.12 ? SILVER[Math.max(1, tone - 1)] : SILVER[Math.max(1, Math.min(4, tone + (u[2] > 0.5 ? 1 : 0)))]), far: true });
  const shin = norm(sub(ankle, knee), [0, 0, -1]);
  put(`shin${side}`, `greave${side}`, { k: 'rod', a: add(knee, mul(shin, 1.8)), b: ankle, ra: rK * 1.2, rb: rA * 1.3, ramp: SILVER_UP, far: true });
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
  const up3 = norm(cross(fwd, side3), [0, 0, 1]);
  put(`foot${side}`, `foot${side}`, {
    k: 'ball',
    c: add(lerp3(heel, toe, 0.5), mul(up3, 1.8)),
    ax: [mul(fwd, 5.4), mul(side3, 2.3), mul(up3, 1.9)],
    skin: (u, tone) => SILVER[Math.abs(fr((u[0] + 1) * 2.6) - 0.5) < 0.08 && u[0] > 0 ? Math.max(1, tone - 1) : tone],
    far: true,
  });
}

/** THE BREASTPLATE AND BACKPLATE, from the fauld up under the arms: polished, a ridge down the front. */
function cuirassRings(s: Skeleton): Ring[] {
  const [cf, cl] = s.chest;
  const be = s.belly;
  const waistC = add(s.pelvis, mul(s.hips[2], GB.waist * 0.5));
  return [
    { c: add(s.pelvis, mul(s.hips[2], GB.waist * 0.12)), u: mul(s.hips[0], GB.pelvisDeep + 2.4), v: mul(s.hips[1], GB.pelvisHalf + 2.4) },
    { c: waistC, u: mul(be[0], GB.waistDeep + 2.6), v: mul(be[1], GB.waistHalf + 2.4) },
    { c: lerp3(waistC, s.ribs, 0.55), u: mul(be[0], GB.waistDeep + 3.4), v: mul(be[1], GB.waistHalf + 2.8) },
    { c: s.ribs, u: mul(cf, GB.ribDeep + 3.1), v: mul(cl, GB.ribHalf + 2.6) },
    { c: lerp3(s.ribs, s.neck, 0.64), u: mul(cf, GB.ribDeep + 2.0), v: mul(cl, GB.shoulderHalf + 0.6) },
    { c: add(s.neck, mul(s.chest[2], -0.8)), u: mul(cf, 4.2), v: mul(cl, 5.0) },
  ];
}
/** A ring round both thighs `down` of the way from the hips to the knees (the arming skirt's hem), hanging back as they go. */
function thighRing(s: Skeleton, down: number, pad: number, lag: V3): Ring {
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const a = lerp3(s.hipL, s.kneeL, down);
  const b = lerp3(s.hipR, s.kneeR, down);
  const c = lerp3(a, b, 0.5);
  const spanF = Math.abs(dot(sub(a, b), f));
  const spanL = Math.abs(dot(sub(a, b), l));
  const rT = GB.legR[0] * 1.3;
  return { c: add(c, mul(lag, 0.7)), u: mul(f, Math.max(GB.pelvisDeep + 2.6, spanF / 2 + rT + 1.4) + pad), v: mul(l, Math.max(GB.pelvisHalf + 2.4, spanL / 2 + rT + 1.2) + pad) };
}

/**
 * THE CLOAK: dark violet from the shoulders down the back to the calves, clasped at the pauldrons, edged in silver; left
 * behind as they go, streaming in the charge (`flare`), stirring as they stand; draped over them as they sink down.
 */
function cloak(put: Put, s: Skeleton, lag: V3, wind: number, flare: number): void {
  const [cf, cl, cu] = s.chest;
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const top: Ring = { c: add(add(s.neck, mul(cu, -1.2)), mul(cf, -0.8)), u: mul(cf, GB.ribDeep + 2.6), v: mul(cl, GB.shoulderHalf + 3.8) };
  const midC = add(add(lerp3(s.waist, s.ribs, 0.35), mul(f, -1.0)), mul(lag, 0.5));
  const midR: Ring = { c: midC, u: mul(f, GB.ribDeep + 3.8 + 1.5 * flare), v: mul(l, GB.ribHalf + 5.6) };
  // (its hem: on down the line from the shoulders through the hips, to the calves; never into the floor)
  const down = norm(sub(s.pelvis, s.neck), [0, 0, -1]);
  const drop = GB.thigh + 6;
  const h0 = add(s.pelvis, mul(down, drop));
  const hz = Math.max(3.2, h0[2]) + 6 * flare;
  const hc: V3 = [h0[0] - 2.6 * f[0] + lag[0] * 2.4 - 9 * flare * f[0], h0[1] - 2.6 * f[1] + lag[1] * 2.4 - 9 * flare * f[1], hz];
  const wide = (GB.ribHalf + 7.0) * (1 + 0.2 * flare);
  const deep = (GB.ribDeep + 4.2) * (1 + 0.3 * flare);
  const pts: V3[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const rear = Math.max(0, -Math.cos(a));
    const p0 = add(hc, add(mul(f, Math.cos(a) * deep), mul(l, Math.sin(a) * wide)));
    const ripple = Math.sin(wind * Math.PI * 2 + a * 2) * (0.6 + 1.8 * flare);
    pts.push(add(p0, add(mul(f, -rear * (1.2 + 3 * flare)), [0, 0, Math.max(-p0[2] + 2.4, ripple + rear * 0.8)])));
  }
  const hem: Ring = { c: hc, u: mul(f, deep), v: mul(l, wide), pts };
  put('cloak', 'cloak', { k: 'cloth', rings: [top, midR, hem], ramp: VIOLET, look: { arc: [58, 302], folds: [110, 145, 180, 215, 250], lift: 0.1, hem: EDGE, lining: 0.35 } });
  // the clasps at the front of each pauldron, and the silver chain between them across the gorget
  for (const k of [1, -1]) {
    const at = add(add(s.neck, mul(cl, k * (GB.shoulderHalf - 0.5))), add(mul(cf, GB.ribDeep * 0.5), mul(cu, -1.2)));
    put('clasp', 'clasp', { k: 'ball', c: at, ax: sphere(1.25), skin: EDGE });
  }
}

/**
 * THE HEAD IN ITS CLOSED HELM: a rounded skull of silver plate; its visor a sculpted beak with a ridge down it and a slit
 * across the eyes, the cult's dull pink behind it; breaths pierced on the cheek; the gorget at the throat; and round its
 * crown, on a silver circlet, THE GLASS SPIKES, the tallest at the brow, like the queen's crown. Returns where the Hush
 * leaks out of the slit, and the face's ways.
 */
function head(put: Put, st: Stage, s: Skeleton, lit: number): { slit: V3; ff: V3; fl: V3; fu: V3 } {
  const [ff, fl, fu] = wornOn(st, s, 8);
  const hr: V3 = [GB.headR[0] * 1.1, GB.headR[1] * 1.12, GB.headR[2] * 1.08];
  const hc = add(s.head, mul(fu, 0.2));
  const SLIT = 0.1;
  put('helm', 'helm', {
    k: 'ball',
    c: hc,
    ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])],
    skin: (u, tone) => {
      // (the seam where the visor meets the skull, round the face; the gorget's lip at its foot)
      if (u[0] > 0.1 && u[0] < 0.3 && u[2] > -0.6 && u[2] < 0.5) return SILVER[Math.max(1, tone - 1)];
      if (u[2] < -0.84) return SILVER[Math.max(1, tone - 1)];
      // (a ridge over the crown)
      if (Math.abs(u[1]) < 0.07 && u[2] > 0.35) return EDGE[Math.min(4, tone + 1)];
      return SILVER[tone];
    },
  });
  // THE VISOR: a beak standing out before the face, a ridge down its middle, the slit across, breaths below
  const vc = add(hc, add(mul(ff, hr[0] * 0.42), mul(fu, -hr[2] * 0.1)));
  const vr: V3 = [hr[0] * 0.78, hr[1] * 0.86, hr[2] * 0.74];
  put('helm', 'visor', {
    k: 'ball',
    c: vc,
    ax: [mul(ff, vr[0]), mul(fl, vr[1]), mul(fu, vr[2])],
    skin: (u, tone) => {
      if (u[0] < 0.05) return null;
      if (Math.abs(u[2] - SLIT * 1.6) < 0.17 && Math.abs(u[1]) < 0.76) return INK;
      // (the brow over the slit, a bright lip)
      if (Math.abs(u[2] - SLIT * 1.6 - 0.24) < 0.08 && Math.abs(u[1]) < 0.8) return EDGE[Math.min(4, tone + 1)];
      if (Math.abs(u[1]) < 0.08 && u[2] < SLIT * 1.6 - 0.1) return EDGE[Math.min(4, tone + 1)];
      if (u[1] < -0.2 && u[1] > -0.62 && u[2] < -0.12 && u[2] > -0.6 && hash(Math.round(u[1] * 12), Math.round(u[2] * 12), 8141) < 0.4) return INK;
      return SILVER[tone];
    },
  });
  // the eyes: the cult's dull pink in the dark of the slit (going out as the Hush leaves them)
  for (const k of [-1, 1]) {
    const e = add(vc, add(mul(ff, vr[0] * 0.96), add(mul(fl, k * vr[1] * 0.32), mul(fu, vr[2] * SLIT * 1.6))));
    put('helm', 'eyes', { k: 'dot', p: e, c: lit > 0.4 ? FLAME[1] : '#2a1e24', facing: ff, c2: lit > 0.4 ? FLAME[2] : '#2a1e24' });
  }
  // THE CIRCLET round the crown, and its GLASS SPIKES
  const cc = add(hc, mul(fu, hr[2] * 0.42));
  const cr: [number, number] = [hr[0] * 0.98, hr[1] * 0.98];
  put('helm', 'circlet', { k: 'band', ring: { c: cc, u: mul(ff, cr[0]), v: mul(fl, cr[1]) }, ramp: VIOLET, rows: 2 });
  for (const [deg, tall] of QG_SPIKES) {
    const a = deg * D;
    const out = norm(add(mul(ff, Math.cos(a)), mul(fl, Math.sin(a))));
    const base = add(cc, add(mul(ff, Math.cos(a) * cr[0] * 0.92), mul(fl, Math.sin(a) * cr[1] * 0.92)));
    const tip = add(base, add(mul(fu, tall), mul(out, tall * 0.22)));
    put('crown', 'spike', { k: 'rod', a: add(base, mul(fu, -0.6)), b: tip, ra: 1.25 + tall * 0.03, rb: 0.16, ramp: GLASS });
    // (a bright edge of light down its lit side, as glass catches it)
    const lip = add(mul(fl, 0.45), mul(ff, -0.15));
    put('crown', 'spike', { k: 'rod', a: add(add(base, mul(fu, 1.0)), lip), b: add(lerp3(base, tip, 0.8), mul(lip, 0.4)), ra: 0.32, rb: 0.12, ramp: [GLASS[3], GLASS[3], GLASS[4], GLASS[4], GLASS[4]] });
  }
  const slit = add(vc, add(mul(ff, vr[0] * 1.02), mul(fu, vr[2] * SLIT * 1.6)));
  return { slit, ff, fl, fu };
}
/** The crown's spikes round the helm: each at this many degrees round from the brow (to the left), this tall. */
export const QG_SPIKES: ReadonlyArray<readonly [number, number]> = [[0, 16], [-40, 12.5], [40, 12.5], [-82, 10], [82, 10], [-126, 8.5], [126, 8.5], [180, 8]];

/** The Hush leaking out of them at each moment, laid after their edge (Mob.grains). */
const GRAINS = new WeakMap<Moment, [V3, string, number][]>();
/** THE HUSH SEEPING OUT OF THE VISOR'S SLIT: short grey wisps pushed out at either end of it, curling up past the helm; more and further as they wind up a blow (`hard`, 0 to 1). */
function slitSeep(put: Put, at: V3, out: V3, ff: V3, t: number, seed: number, hard: number): void {
  const N = Math.round(7 + 6 * hard);
  for (let i = 0; i < N; i++) {
    const life = fr(t * (0.8 + 0.5 * hard) + i / N + 0.17 * hash(i, seed, 2321));
    if (life > 0.55 + 0.4 * hard) continue;
    const curl = life * 5 + seed;
    const p = add(at, add(mul(out, (0.6 + life * (2.6 + 2.4 * hard)) * (0.8 + 0.4 * hash(i, seed, 2322))), add(mul(ff, 0.6 + Math.sin(curl) * (0.4 + life * 1.4)), [0, 0, life * (6 + 6 * hard)])));
    const c = life < 0.2 ? BREATH_PALE : life < 0.45 ? HUSH[4] : HUSH[3];
    put('hush', 'hush', { k: 'mote', p, c, size: life < 0.3 ? 3 : 2 });
  }
}
/** The smear's after-images: the oldest a dull violet, the newest silver-white. */
export const QG_SMEAR = ['#6e6c9a', '#c2c2e4', '#f4f4ff'] as const;

function guardBits(st: Stage, m: Moment, say: QGuardSay): Bit[] {
  const { s, q } = m;
  const bits: Bit[] = [];
  const grains: [V3, string, number][] = [];
  GRAINS.set(m, grains);
  const put: Put = (part, piece, shape) => {
    if (shape.k === 'mote' && (part === 'hush' || part === 'glint')) {
      grains.push([shape.p, shape.c, shape.size]);
      return;
    }
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const lag = lagOf(m, 1.5, 3.2);
  // (how hard they are going: the charge streams the cloak)
  const speed = len3(m.come) * 30;
  const flare = clamp01((speed - 60) / 140);
  const seed = 31;
  const held = !say.dropped(m);
  for (const side of ['L', 'R'] as const) leg(put, s, side);
  // THE ARMING SKIRT of dark violet, pleated, to the middle of the thighs
  const skirt: Ring[] = [
    thighRing(s, 0.68, 0.9, lag),
    { c: add(add(s.pelvis, mul(s.hips[2], -1.4)), mul(lag, 0.4)), u: mul(s.hips[0], GB.pelvisDeep + 2.3), v: mul(s.hips[1], GB.pelvisHalf + 2.2) },
    { c: add(s.pelvis, mul(s.hips[2], GB.waist * 0.3)), u: mul(s.hips[0], GB.pelvisDeep + 1.9), v: mul(s.hips[1], GB.pelvisHalf + 1.9) },
  ];
  put('skirt', 'skirt', { k: 'cloth', rings: skirt, ramp: VIOLET, look: { folds: [0, 25, -25, 50, -50, 75, -75, 105, -105, 135, -135, 160, -160], lift: 0.08, hem: EDGE } });
  // THE CUIRASS of silvered plate, its ridge down the front; the fauld of lames over the hips
  put('body', 'cuirass', { k: 'cloth', rings: cuirassRings(s), ramp: SILVER, look: { folds: [0], lift: 0.03 } });
  const fauld = (k: number): Ring => ({ c: add(s.pelvis, mul(s.hips[2], GB.waist * 0.12 - k * 2.3)), u: mul(s.hips[0], GB.pelvisDeep + 2.6 + k * 0.35), v: mul(s.hips[1], GB.pelvisHalf + 2.6 + k * 0.35) });
  put('body', 'fauld', { k: 'band', ring: fauld(0), ramp: EDGE, rows: 1 });
  put('body', 'fauld', { k: 'band', ring: fauld(1), ramp: SILVER, rows: 2 });
  // THE TASSETS: plates of lames hung from the fauld over the front of each thigh
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const thigh = norm(sub(knee, hip), [0, 0, -1]);
    const before = norm(cross(thigh, s.hips[1]), s.hips[0]);
    const lat = norm(cross(before, thigh), s.hips[1]);
    const rH = GB.legR[0];
    const top = add(lerp3(hip, knee, 0.0), mul(before, rH * 1.3 + 1.6));
    const low = add(lerp3(hip, knee, 0.46), mul(before, rH * 1.25 + 1.8));
    put(`leg${side}`, `tasset${side}`, { k: 'panel', c: lerp3(top, low, 0.5), u: mul(lat, rH * 1.32), v: mul(sub(low, top), -0.5), skin: (a, b, front, tone) => (front ? (Math.abs(a) > rH * 1.32 - 0.6 ? EDGE[Math.max(2, tone)] : SILVER[fr((b + 10) / 2.6) < 0.2 ? Math.max(1, tone - 1) : Math.max(2, tone)]) : SILVER[1]) });
  }
  // the belt: a silver chain of plaques at the waist
  const waistC = add(s.pelvis, mul(s.hips[2], GB.waist * 0.48));
  put('body', 'belt', { k: 'band', ring: { c: waistC, u: mul(s.belly[0], GB.waistDeep + 2.8), v: mul(s.belly[1], GB.waistHalf + 2.6) }, ramp: EDGE, rows: 1 });
  // the gorget
  put('neck', 'gorget', { k: 'band', ring: { c: add(s.neck, mul(cu, -0.4)), u: mul(cf, 4.4), v: mul(cl, 5.0) }, ramp: SILVER, rows: 2 });
  put('neck', 'neck', { k: 'rod', a: add(s.neck, mul(cu, -1.5)), b: lerp3(s.neck, s.head, 0.5), ra: 3.0, rb: 2.8, ramp: SILVER });
  // THE CLOAK
  cloak(put, s, lag, m.wind, flare);
  // the arms: the right fist closed round the halberd; the left in the shield's grip, or on the staff too
  arm(put, s, 'L', cu, held ? 1 : 0.5);
  arm(put, s, 'R', cu, held ? 1 : 0.45);
  const hd = head(put, st, s, lit);
  const glint = held ? clamp01(m.glint) : 0;
  const onShield = say.glintOn?.(m) === 'shield';
  halberd(put, s, q, lag, onShield ? 0 : glint, m.t);
  shield(put, st, s, q, say.cracked(m), onShield ? glint : 0, say.flash?.(m) ?? 0);
  // THE HUSH LEAKING OUT OF THE SLIT; as they die it pours out of it in one great breath
  if (!m.dying || m.t < QG_EXHALE[0]) {
    const hard = clamp01(m.glint);
    hushBreath(put, add(hd.slit, mul(hd.ff, 0.6)), hd.ff, hd.fl, m.t, 0.35 + 0.5 * hard, seed);
    slitSeep(put, add(hd.slit, mul(hd.fl, 2.4)), hd.fl, hd.ff, m.t, seed, hard);
    slitSeep(put, add(hd.slit, mul(hd.fl, -2.4)), mul(hd.fl, -1), hd.ff, m.t + 0.41, seed + 5, hard);
  } else {
    hushBreath(put, hd.slit, hd.ff, hd.fl, m.t, Math.max(0, 2.2 * (1 - clamp01((m.t - QG_EXHALE[0] - 0.1) / 1.1))), seed);
  }
  if (m.dying) hushLeaves(put, hd.slit, hd.ff, hd.fl, m.t, seed, QG_EXHALE[0], QG_EXHALE[1]);
  // THE SMEAR of a lightning strike: its after-images, the oldest thinned to every other point
  const sm = say.smear?.(m);
  if (sm) {
    sm.forEach((line, j) => {
      const k = j / Math.max(1, sm.length - 1);
      for (let i = 1; i < line.length; i++) {
        const [x0, y0] = st.at(line[i - 1]);
        const [x1, y1] = st.at(line[i]);
        const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
        for (let e = 0; e < n; e++) {
          if (k < 0.5 && (e + i) % 2) continue;
          bits.push({ part: 'smear', piece: 'smear', shape: { k: 'mote', p: lerp3(line[i - 1], line[i], e / n), c: k > 0.7 ? QG_SMEAR[2] : k > 0.35 ? QG_SMEAR[1] : QG_SMEAR[0], size: k > 0.7 ? 2 : 1 } });
        }
      }
    });
  }
  grains.push(...(say.more?.(m) ?? []));
  return bits;
}
/** When the Hush pours out of them as they die (seconds into it). */
export const QG_EXHALE: readonly [number, number] = [1.0, 2.5];

/** THE QUEEN'S GUARD AS THE PAINTER TAKES THEM. */
export function qguardPainter(say: QGuardSay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return { bits: (st, m) => guardBits(st, m, say), grains: (_st, m) => GRAINS.get(m) ?? [] };
}
