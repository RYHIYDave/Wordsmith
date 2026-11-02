// THE HEADSMAN'S YARD: ITS OWN BOSS GATE (the art chat, 1 Nov 2026). Behind the switch YARD_GATE, off; nothing of the game
// imports it until the main chat puts it in (the yard's boss doorway, when YARD and YARD_GATE are on).
//
// Shown the yard in play with the Crypt's boss gate in its doorway, the owner, relayed by the main chat: “That boss gate
// isn’t going to cut it”; asked what should stand there instead: “Its own arch, and we’ll need new ones for the other new
// levels as well”. Read (the main chat's reading, which the art chat took): the yard's own gate, from the arch in the yard
// picture: the prison's dark stone, as high as the yard's wall, in the game's three-tile boss doorway, its portcullis
// dropping behind the hero as the fight begins.
//
// WHAT IS PAINTED HERE (a GateArt, art/gates.ts: all but the boss's pillar, arch and portcullis are floor 2's own):
//   THE PILLARS: square, rough-dressed prison stone in courses, a plinth and an impost, two iron bands round each, studded.
//   THE ARCH: a round arch of eleven heavy wedge stones, longer toward the crown, lined with an iron band and studs; the
//     whole face of the gate in the yard's rough stone up to the wall's height (150), its coping, the wall-walk over it and
//     the battlements on its far edge, as the yard's wall has; a tall KEYSTONE carrying THE HEADSMAN'S MARK, a block and his
//     axe cut in the stone and full of embers, alight (the enemy's pink burning to gold) once the gate has fallen.
//   THE PORTCULLIS: black iron, thick uprights each ending in a long spike, cross bars riveted, a heavy bottom rail.
//   THE SLAM: dust thrown off the floor both ways and sparks off the spikes, on a picture of its own, anchored at the
//     middle of the gate's foot (`yardGateSlam`); and the drop's timing, Movement 9 (`YARD_GATE_DROP`).
// Moonlit, as the yard: the light from the upper left, the face turned to screen-left lit, the one turned right in shade;
// seams the yard's deep indigo; nothing glows cyan (the friend's); the mark's fire is the enemy's.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { Flat, GATE_UP, PILLAR, SPAN, ARCH_WIDE, STRIP } from './gates';
import type { ArchShape, GateArt, Strip } from './gates';
import { headsmanGates } from './floor2';
import { GRAIN, hash } from './kit';
import { FLAME } from './mkit';
import { EMBER } from './props';

/** THE SWITCH: off until the main chat puts the gate in the yard's boss doorway, on his yes. */
export const YARD_GATE = { on: false };

// =================================================================================================
// MEASURES (picture pixels, two to a game pixel; u along the plane from the outer edge of the first pillar, v up)

/** The yard's wall is 150 high (art/yard.ts, YARD_WALL): the gate's face rises as high, its coping at the top. */
export const YARD_GATE_HIGH = 150;
/** The merlons of the battlements over it, on the far edge of the wall-walk, as the yard wall's. */
const MERLON = 24;
/** The wall is a tile thick: its walk on top runs a tile back. */
const WALK = 32;
/**
 * THE ARCH: it springs from the pillars at 64 (the Crypt's boss arch: 44), a half round over the three tiles (its crown 112
 * over the floor, the Crypt's 92); eleven wedge stones. The way through is the game's, three tiles between the pillars.
 */
export const YARD_ARCH: Readonly<ArchShape> = { spring: 64, rise: 48, ring: 24, stones: 11 };
/** How far up the portcullis is drawn when the gate is open (the game's raise of GATE_UP): its spikes under the crown. */
export const YARD_GATE_LIFT = 88;
/** The keystone: the angle it takes of the half round, and the height of its flat top. */
const KEY = 0.54;
const KEY_TOP = 150;

/** The yard's stone (art/yard.ts, STONE), seam to moonlit edge; and its iron. */
const STONE: readonly string[] = ['#0e0c24', '#1b1c36', '#262850', '#343867', '#566090'];
const IRON: readonly string[] = ['#0e0c24', '#1a1c32', '#282b46', '#393d5e', '#5c628a'];
const SEAM: string = STONE[0];
/** Dust off the cobbles, moonlit (the yard's cobbles, lifted). */
const DUST: readonly string[] = ['#363955', '#4a4f72', '#666c92', '#878daf'];

const MID = ARCH_WIDE / 2;
const VC = YARD_ARCH.spring;
const R_IN = SPAN / 2;
const clampK = (k: number): number => Math.max(0, Math.min(4, k));

/** The outer edge of the ring at an angle up from the springing (0) to the crown (pi / 2): longer stones toward the crown. */
const rOut = (th: number): number => R_IN + PILLAR + 12 * Math.sin(Math.max(0, Math.min(Math.PI, th)));

/** Is a place in the way through (u, v in the plane): between the pillars, under the arch? */
export function yardInWay(u: number, v: number): boolean {
  if (u < PILLAR || u >= PILLAR + SPAN || v < 0) return false;
  return v < VC || Math.hypot(u + 0.5 - MID, v + 0.5 - VC) < R_IN;
}

/** Which way the light comes, along the plane: from its low end (a plane along +x) or its high end (along +y). */
interface Lit {
  low: boolean;
  /** The face itself: turned to screen-left and lit (along +x), or in shade. */
  face: number;
}
/** How much a surface whose outward normal is (nu, nv) in the plane (nu along u, nv up) faces the light: -1 to 1. */
function toLight(L: Lit, nu: number, nv: number): number {
  const sx = L.low ? nu : -nu;
  return (-sx + nv) * Math.SQRT1_2;
}

// =================================================================================================
// THE STONE

/**
 * THE PRISON'S ROUGH-DRESSED STONE in courses (16 high), each block 22 to 40 long, its face pitched (its upper-left
 * edges catching the moon, its lower-right in shade), chisel-marked; joints a deep indigo that wander a little.
 * Returns a tone 0 to 4 (or -1: a joint).
 */
function rough(u: number, v: number, L: Lit, seed: number): number {
  const CH = 16;
  const c = Math.floor(v / CH);
  const lv = v - c * CH;
  const off = Math.floor(hash(c, seed, 1) * 40);
  const len = 22 + Math.floor(hash(c, seed, 2) * 18);
  const b = Math.floor((u + off) / len);
  const lu = u + off - b * len;
  // (the joints wander: a bed joint a row up here and there, a head joint a pixel aside)
  const bed = CH - 1 - (hash(u >> 2, c, seed + 3) < 0.22 ? 1 : 0);
  if (lv >= bed) return -1;
  const head = hash(b, c, seed + 4) < 0.5 ? 0 : 1;
  if (lu === head || (lu === 1 - head && lv > 10 && hash(b, c, seed + 5) < 0.5)) return -1;
  let k = L.face;
  const tone = hash(b, c * 7 + seed, 6);
  if (tone < 0.14) k -= 1;
  else if (tone > 0.9) k += 1;
  // (pitched: its upper edge and the end toward the light lit, the lower edge and the far end in shade)
  const lightEnd = L.low ? lu <= head + 2 : lu >= len - 2;
  const darkEnd = L.low ? lu >= len - 2 : lu <= head + 2;
  if (lv <= 1) k += 1;
  else if (lv >= bed - 2) k -= 1;
  if (lightEnd && lv < bed - 2) k += 1;
  if (darkEnd) k -= 1;
  // (chisel marks: short strokes, darker, and a few struck bright)
  const ch = hash((u + (v & 1)) >> 1, v, seed + 7);
  if (ch < 0.07) k -= 1;
  else if (ch > 0.975 && lv > 2) k += 1;
  return clampK(k);
}

/** The voussoir an angle (from the low end, 0, to the high end, pi) falls in, and its two edges as angles. */
function voussoir(phi: number): { k: number; a0: number; a1: number } {
  const step = (Math.PI - KEY) / (YARD_ARCH.stones - 1);
  const half = (YARD_ARCH.stones - 1) / 2;
  const k0 = (Math.PI - KEY) / 2;
  if (phi < k0) {
    const k = Math.min(half - 1, Math.floor(phi / step));
    return { k, a0: k * step, a1: (k + 1) * step };
  }
  if (phi < k0 + KEY) return { k: half, a0: k0, a1: k0 + KEY };
  const k = Math.min(half - 1, Math.floor((phi - k0 - KEY) / step));
  return { k: half + 1 + k, a0: k0 + KEY + k * step, a1: k0 + KEY + (k + 1) * step };
}
/** The angle of a place round the arch's centre, from the low end (0) over the top to the high end (pi). */
const phiOf = (u: number, v: number): number => Math.PI - Math.atan2(v + 0.5 - VC, u + 0.5 - MID);

/** Is a place in the keystone: a wedge between two lines out of the centre, from the ring's inside to its flat top? */
function inKey(u: number, v: number): boolean {
  if (v < VC || v >= KEY_TOP) return false;
  const du = u + 0.5 - MID;
  const dv = v + 0.5 - VC;
  return Math.hypot(du, dv) >= R_IN && Math.abs(du) <= dv * Math.tan(KEY / 2);
}

// =================================================================================================
// THE HEADSMAN'S MARK: his block and his axe

/**
 * The mark, in its own measure: x across (to the screen's right whichever way the plane runs, so the axe's blade is always
 * on the left), y up from the foot of the keystone. 'block' | 'axe' | null.
 *   THE BLOCK: a squat slab, its top hollowed for the neck, its foot spread (y 0 to 6).
 *   THE AXE standing on it: a long haft (x 3 and 4); high on it the head, a tall blade to the left, its cutting edge a long
 *   curve, its back hollowed above and below the eye so the stone shows between blade and haft: the toe up, the beard down.
 */
function markAt(x: number, y: number): 'block' | 'axe' | null {
  if (y >= 0 && y <= 6) {
    const l = y <= 1 ? -10 : -9;
    const r = y <= 1 ? 9 : 8;
    if (x < l || x > r) return null;
    if (y >= 5 && x >= -5 - (y - 5) && x <= -2 + (y - 5)) return null;
    return 'block';
  }
  if (y < 8 || y > 31) return null;
  // the haft, and the eye of the head round it
  if (x >= 3 && x <= 4) return 'axe';
  if (x >= 5 && x <= 6 && y >= 21 && y <= 27) return 'axe';
  // the blade: from its long curved edge to its back
  if (y >= 12) {
    const edge = -8 + Math.round(3.6 * ((y - 22) / 10) ** 2);
    const BACK: Record<number, number> = { 31: -2, 30: -1, 29: 0, 28: 1, 20: 1, 19: 0, 18: -1, 17: -1, 16: -2, 15: -2, 14: -3, 13: -3, 12: -4 };
    const back = BACK[y] ?? 2;
    if (x >= edge && x <= back) return 'axe';
  }
  return null;
}
/** The mark's middle over the floor, and how big it is painted. */
const MARK_FOOT = 118;

/**
 * What is cut in the keystone at a place: the mark full of embers (`lit`: alight), its lip in shade above and lit below;
 * or null (the stone itself).
 */
function cutAt(u: number, v: number, L: Lit, lit: boolean): string | null {
  // (the mark is laid on the screen as it reads: the plane along +y runs to screen-left, so it is turned)
  const sx = L.low ? u - Math.floor(MID) : Math.floor(MID) - 1 - u;
  const y = v - MARK_FOOT;
  const m = markAt(sx, y);
  if (m) {
    // how deep in the cut: its edge, or further in
    let edge = 0;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) if (markAt(sx + dx, y + dy) !== m) edge++;
    let core = edge === 0;
    if (core) for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2]] as const) if (!markAt(sx + dx, y + dy)) core = false;
    if (lit) return edge > 0 ? FLAME[2] : core ? FLAME[4] : FLAME[3];
    return edge > 0 ? FLAME[0] : core ? FLAME[2] : FLAME[1];
  }
  // the lip of the cut: in shade above and to the light's side (the cut is sunk), the stone catching its fire when alight
  const above = markAt(sx, y - 1) || markAt(sx + 1, y - 1) || markAt(sx + 1, y);
  const below = markAt(sx, y + 1) || markAt(sx - 1, y + 1) || markAt(sx - 1, y);
  if (above || below) {
    if (lit) return above ? '#5a2a5a' : '#7a3a5e';
    return above ? STONE[3] : SEAM;
  }
  return null;
}

// =================================================================================================
// THE PILLAR

/**
 * A PILLAR OF THE YARD'S GATE: square, each of its faces PILLAR wide, as high as the arch springs from; rough-dressed
 * stone in four courses, its foot a plinth, its head an impost the arch springs from; two iron bands round it, studded;
 * (one picture for a gate either way: its lit face is the jamb in a wall along +y, its shaded one in a wall along +x). Anchored at its front corner, on the floor.
 */
export function makeYardPillar(high = YARD_ARCH.spring): Sprite {
  const HW = PILLAR;
  const p = new Px(HW * 2 + 8, high + 26);
  const cx = HW + 4;
  const base = high + 16;
  const BANDS = [18, 44];
  for (let dx = -HW; dx < HW; dx++) {
    const left = dx < 0;
    // (u along each face from its outer end; the left face is lit, the right in shade)
    const u = left ? dx + HW : HW - 1 - dx;
    const L: Lit = { low: true, face: left ? 2 : 1 };
    const drop = -HW / 2 + Math.floor((u - 1) / 2);
    for (let v = 0; v < high; v++) {
      let k: number;
      const lv = v % 16;
      if (v < 6) k = v === 5 ? L.face + 1 : L.face - 1;
      else if (v >= high - 5) k = v === high - 5 ? 0 : v === high - 1 ? L.face + 2 : L.face + 1;
      else if (lv === 15 || (lv === 0 && v > 0)) k = -1;
      else {
        k = rough(left ? 40 + u : 80 + u, v, L, left ? 411 : 412);
        if (k < 0) k = L.face - 1;
      }
      // (the corners: the one toward the light lit, the one at the back of the jamb a seam)
      if (dx === -HW && k >= 0 && v > 5) k = Math.min(4, k + 1);
      if (dx === -1 && k >= 0) k = Math.max(0, k - 1);
      let c = k < 0 ? SEAM : STONE[clampK(k)];
      // the iron bands, and their studs
      for (const b of BANDS) {
        if (v >= b && v < b + 4) {
          const row = v - b;
          c = row === 3 ? (left ? IRON[3] : IRON[2]) : row === 0 ? SEAM : left ? IRON[2] : IRON[1];
          const stud = (u + 2) % 6 === 0 && u > 1 && u < HW - 1;
          if (stud && row >= 1 && row <= 2) c = row === 2 ? (left ? IRON[4] : IRON[3]) : IRON[1];
        }
      }
      p.set(cx + dx, base + drop - v, c);
    }
  }
  return p.sprite(cx, base, GRAIN);
}

// =================================================================================================
// THE ARCH AND THE FACE OF THE GATE

/**
 * THE YARD GATE'S FACE, from the outer edge of one pillar to the outer edge of the other, from the springing to the
 * battlements: its ring of eleven wedge stones lined with iron, the tall keystone with the mark (in embers, or `lit`
 * alight, and then it gives light), the rough stone about it to the wall's height, the coping, the walk a tile back and a
 * merlon over each of the doorway's three tiles; what is seen of the arch's underside through the way.
 */
export function makeYardArch(alongX: boolean, lit: boolean): Strip[] {
  const L: Lit = { low: alongX, face: alongX ? 2 : 1 };
  const side = alongX ? 1 : 2;
  const H = YARD_GATE_HIGH;
  const F = new Flat(0, ARCH_WIDE + WALK, H + WALK + MERLON + 6);
  const at = (u: number, v: number, c: string): void => F.set(u, v, c);
  const D = PILLAR;
  for (let v = YARD_ARCH.spring; v < H; v++) {
    for (let u = 0; u < ARCH_WIDE; u++) {
      const du = u + 0.5 - MID;
      const dv = v + 0.5 - VC;
      const r = Math.hypot(du, dv);
      if (yardInWay(u, v)) {
        // WHAT IS SEEN OF THE UNDERSIDE through the way: the ring's inside, set back to the slot (as far back as the pillars are thick)
        for (let s = 1; s <= D; s++) {
          const us = u - s;
          const vs = v - s;
          if (vs < YARD_ARCH.spring || yardInWay(us, vs)) continue;
          const ph = phiOf(us, vs);
          const vo = voussoir(ph);
          const jt = Math.min(ph - vo.a0, vo.a1 - ph) * R_IN < 0.7 && vo.a0 > 0 && vo.a1 < Math.PI;
          at(u, v, s <= 1 || jt ? SEAM : STONE[1]);
          break;
        }
        continue;
      }
      const ph = phiOf(u, v);
      const th = Math.min(ph, Math.PI - ph);
      const key = inKey(u, v);
      const ring = r >= R_IN && (r < rOut(th) || key);
      if (ring) {
        // THE IRON BAND lining the way, and a stud on each stone
        if (r < R_IN + 3) {
          const vo = voussoir(ph);
          const midA = (vo.a0 + vo.a1) / 2;
          const studHere = Math.abs(ph - midA) * R_IN < 1.1 && r >= R_IN + 1 && r < R_IN + 3;
          const facing = toLight(L, du / r, dv / r);
          let c = r < R_IN + 1 ? IRON[1] : r < R_IN + 2 ? IRON[2] : facing > -0.2 ? IRON[3] : IRON[2];
          if (studHere) c = r >= R_IN + 2 ? IRON[4] : IRON[3];
          at(u, v, c);
          continue;
        }
        if (r < R_IN + 4) {
          at(u, v, SEAM);
          continue;
        }
        if (key) {
          const cut = cutAt(u, v, L, lit);
          if (cut) {
            at(u, v, cut);
            continue;
          }
          // the keystone: proud of the ring, its sides and top edged
          const tk = Math.tan(KEY / 2);
          const fromL = du + dv * tk;
          const fromR = dv * tk - du;
          if (fromL < 1 || fromR < 1) {
            at(u, v, SEAM);
            continue;
          }
          let k = L.face + 1;
          const lightSide = L.low ? fromL < 2.5 : fromR < 2.5;
          const darkSide = L.low ? fromR < 2.5 : fromL < 2.5;
          if (v >= KEY_TOP - 2) k = L.face + 2;
          else if (lightSide) k += 1;
          else if (darkSide) k -= 1;
          if (hash((u >> 1) + 3, v, 433) < 0.06) k -= 1;
          at(u, v, STONE[clampK(k)]);
          continue;
        }
        // a wedge stone: its joints out of the centre; pitched, its edges toward the moon lit
        const vo = voussoir(ph);
        const ro = rOut(th);
        const toA0 = (ph - vo.a0) * r;
        const toA1 = (vo.a1 - ph) * r;
        const outer = ro - r;
        if ((toA0 < 0.8 && vo.a0 > 0) || (toA1 < 0.8 && vo.a1 < Math.PI) || outer < 1) {
          at(u, v, SEAM);
          continue;
        }
        // (heavier and a shade lighter than the wall about them, so the arch reads)
        let k = L.face + 1;
        const tone = hash(vo.k, 7, 421);
        if (tone < 0.3) k -= 1;
        // (the normal of the nearest edge: the inside toward the centre, the outside away, a joint along the arch)
        const sn = Math.sin(ph);
        const cs = Math.cos(ph);
        // (in the plane: the place is at (MID - r cos phi, VC + r sin phi); the way round, increasing phi, is (sin, cos))
        let n: [number, number] | null = null;
        if (r < R_IN + 6) n = [du / -r, dv / -r];
        else if (outer < 3) n = [du / r, dv / r];
        else if (toA0 < 3) n = [-sn, -cs];
        else if (toA1 < 3) n = [sn, cs];
        if (n) {
          const f = toLight(L, n[0], n[1]);
          if (f > 0.3) k += 1;
          else if (f < -0.3) k -= 1;
        }
        const chs = hash((u + (v & 1)) >> 1, v, 427);
        if (chs < 0.07) k -= 1;
        at(u, v, STONE[clampK(k)]);
        continue;
      }
      // THE FACE about it, to the wall's height; its coping on top
      if (v >= H - 6) {
        const cl = Math.floor((u + 6) / 30);
        const lu = (u + 6) % 30;
        if (v === H - 6) at(u, v, SEAM);
        else if (lu === 0) at(u, v, SEAM);
        else at(u, v, STONE[clampK(v === H - 1 ? L.face + 2 : v === H - 5 ? L.face - 1 : L.face + (hash(cl, 2, 441) > 0.6 ? 1 : 0))]);
        continue;
      }
      // THE QUOINS up both its edges, long and short in turn: the gate's frame, a shade lighter than the wall
      {
        const c = Math.floor(v / 16);
        const lv = v - c * 16;
        const qw = c % 2 === 0 ? 11 : 19;
        const lu = u < qw ? u : u >= ARCH_WIDE - qw ? ARCH_WIDE - 1 - u : -1;
        if (lu >= 0) {
          const inner = lu === qw - 1;
          if (lv === 15 || inner) {
            at(u, v, SEAM);
            continue;
          }
          // (pitched: the edge toward the light and the top lit, the far edge and the foot in shade)
          const lightEdge = L.low ? u === 0 || u === ARCH_WIDE - qw : u === ARCH_WIDE - 1 || u === qw - 2;
          const darkEdge = L.low ? u === qw - 2 || u === ARCH_WIDE - 1 : u === 0 || u === ARCH_WIDE - qw;
          let k = L.face + 1;
          if (hash(c, u < qw ? 1 : 2, 461) < 0.3) k -= 1;
          if (lv <= 1 || lightEdge) k += 1;
          else if (lv >= 13 || darkEdge) k -= 1;
          if (hash((u + (v & 1)) >> 1, v, 463) < 0.07) k -= 1;
          at(u, v, STONE[clampK(k)]);
          continue;
        }
      }
      // THE HOOD over the ring: a moulding that follows it round, its upper edge catching the moon, a seam either side
      {
        const out = r - rOut(th);
        if (r >= R_IN && out < 1.2) {
          at(u, v, SEAM);
          continue;
        }
        if (r >= R_IN && out < 4.2) {
          const f = toLight(L, du / r, dv / r);
          at(u, v, STONE[clampK(out >= 3.2 ? (f > 0.15 ? L.face + 2 : L.face + 1) : out < 2.2 ? L.face : L.face + 1)]);
          continue;
        }
        if (r >= R_IN && out < 5.2) {
          at(u, v, SEAM);
          continue;
        }
      }
      const k = rough(u, v, L, 431);
      at(u, v, k < 0 ? SEAM : STONE[k]);
    }
  }
  // THE WALK over it, a tile back: its flags (what faces up is lightest)
  for (let s = 0; s < WALK; s++) {
    for (let u = 0; u < ARCH_WIDE; u++) {
      const fa = Math.floor((u + (Math.floor(s / 11) % 2) * 8) / 16);
      const lu = (u + (Math.floor(s / 11) % 2) * 8) % 16;
      const ls = s % 11;
      let c: string = hash(fa, Math.floor(s / 11), 451) > 0.7 ? STONE[4] : STONE[3];
      if (lu === 0 || ls === 10) c = STONE[1];
      if (s === 0) c = STONE[4];
      at(u + s, H + s, c);
    }
  }
  // THE MERLONS on its far edge, one over each of the doorway's three tiles (where the yard wall's stand on each of its tiles)
  for (let t = 0; t < 3; t++) {
    const m0 = PILLAR + 32 * t + 8;
    const m1 = m0 + 16;
    const s0 = 22;
    // its front face
    for (let u = m0; u < m1; u++) {
      for (let v = H; v < H + MERLON; v++) {
        const lv = v - H;
        let k = L.face;
        if (lv === MERLON - 1) k = L.face + 2;
        else if (lv % 12 === 11) k = -1;
        else if (lv % 12 === 0) k = L.face + 1;
        if ((L.low ? u === m0 : u === m1 - 1) && k >= 0) k = Math.min(4, k + 1);
        if ((L.low ? u === m1 - 1 : u === m0) && k >= 0) k = Math.max(0, k - 1);
        at(u + s0, v + s0, k < 0 ? SEAM : STONE[clampK(k)]);
      }
    }
    // its top
    for (let s = s0; s < WALK; s++) for (let u = m0; u < m1; u++) at(u + s, H + MERLON + s, s === s0 ? STONE[4] : STONE[3]);
    // its end toward the plane's far end (in shade along +x, lit along +y)
    for (let s = s0; s < WALK; s++) {
      for (let v = H; v < H + MERLON; v++) {
        const lv = v - H;
        const k = lv === MERLON - 1 ? side + 1 : lv % 12 === 11 ? -1 : side;
        at(m1 + s, v + s, k < 0 ? SEAM : STONE[clampK(k)]);
      }
    }
  }
  const out = F.strips(alongX);
  if (lit) {
    // (alight, the mark gives light: on the strip with the middle of the keystone)
    const mid = Math.floor(MID);
    const s0 = Math.floor(mid / STRIP) * STRIP;
    const strip = out.find((q) => q.t === s0 / 32);
    if (strip) {
      const j = mid - s0;
      const vMark = MARK_FOOT + 15;
      strip.s.lights = [{ x: (alongX ? j : STRIP - 1 - j) / GRAIN, y: (F.anchorRow + Math.floor((j - 1) / 2) - vMark) / GRAIN, r: 24, color: FLAME[2], a: 0.32 }];
    }
  }
  return out;
}

// =================================================================================================
// THE PORTCULLIS

/** Where the portcullis's uprights stand, along the plane: eight, a little over a third of a tile apart. */
export const YARD_BARS = [15, 27, 39, 51, 63, 75, 87, 99];
/** How long the spike at each upright's foot is, and where the bottom rail and the cross bars are over it. */
const SPIKE = 14;
const RAIL = 14;
const CROSS = 19;

/** The game's raise (0 to GATE_UP) as how far this portcullis is drawn up (0 to YARD_GATE_LIFT), an even number. */
export function yardLift(raise: number): number {
  const r = Math.max(0, Math.min(GATE_UP, raise));
  return Math.round((r * YARD_GATE_LIFT) / GATE_UP / 2) * 2;
}

/**
 * THE PORTCULLIS of the yard's gate, `lift` picture pixels off the floor: black iron, eight thick uprights each ending in a
 * long spike, a heavy bottom rail over the spikes, cross bars every 19, a rivet at each crossing. It stands at the back of
 * the arch (the slot in the jambs), and what of it is not in the way through, or is behind the arch's thickness, is not there.
 */
export function makeYardPortcullis(alongX: boolean, lift: number): Strip[] {
  const L: Lit = { low: alongX, face: 2 };
  const top = YARD_ARCH.spring + YARD_ARCH.rise + 2;
  const F = new Flat(0, ARCH_WIDE, top);
  // (seen through the way: a place at the back of the arch is where a place of the face plane PILLAR further along and up is)
  const put = (u: number, v: number, c: string): void => {
    if (yardInWay(u, v) && yardInWay(u + PILLAR, v + PILLAR)) F.set(u, v, c);
  };
  const tall = top + 40;
  // the cross bars, and the bottom rail (heavier)
  const rows: [number, number][] = [[RAIL, 5]];
  for (let up = RAIL + CROSS; up <= tall; up += CROSS) rows.push([up, 4]);
  for (const [up, thick] of rows) {
    for (let u = PILLAR; u < PILLAR + SPAN; u++) {
      for (let q = 0; q < thick; q++) {
        const c = q === thick - 1 ? IRON[4] : q === 0 ? SEAM : q === 1 ? IRON[1] : IRON[2];
        put(u, up + lift + q, c);
      }
      put(u, up + lift - 1, SEAM);
    }
  }
  // the uprights, in front of the bars, each to a spike
  for (const b of YARD_BARS) {
    for (let up = 0; up <= tall; up++) {
      const v = up + lift;
      // (5 wide; down the spike it narrows to a point)
      const w = up >= SPIKE ? 5 : Math.max(1, Math.round(1 + (up / SPIKE) * 4));
      const x0 = b + Math.floor((5 - w) / 2);
      for (let i = 0; i < w; i++) {
        const u = x0 + i;
        // (screen-left edge lit: the low end along +x, the high end along +y)
        const fromLight = L.low ? i : w - 1 - i;
        let c: string = fromLight === 0 ? IRON[4] : fromLight === w - 1 ? SEAM : fromLight === 1 ? IRON[3] : IRON[2];
        if (w <= 2) c = up <= 2 ? IRON[4] : IRON[3];
        put(u, v, c);
      }
      // (a seam at its back edge where it lies on a bar)
      if (up >= SPIKE) put(L.low ? b + 5 : b - 1, v, SEAM);
    }
    // the rivets where it crosses a bar: a head, its glint toward the moon
    for (const [up, thick] of rows) {
      const v = up + lift + Math.floor(thick / 2);
      const gu = L.low ? b + 1 : b + 3;
      put(gu, v, IRON[4]);
      put(gu, v + 1, IRON[4]);
      put(L.low ? b + 2 : b + 2, v, IRON[3]);
      put(L.low ? b + 2 : b + 2, v - 1, IRON[1]);
    }
  }
  return F.strips(alongX);
}

// =================================================================================================
// THE SLAM: dust off the floor both ways, sparks off the spikes

/** How many frames the slam's dust and sparks last (at 30 a second). */
export const SLAM_FRAMES = 16;
/**
 * THE DROP, Movement 9 (his rule, 24 Oct: “Like the wind up and wind down are big but the actual punch is lightning
 * quick”): the game's raise (0 to GATE_UP) frame by frame at 30 a second, from the moment the fight begins. A held judder at
 * the top (the chains slipping and catching: a third of a second), the drop in two frames, a hard landing (`YARD_SLAM_AT`:
 * the dust and sparks begin, the mark lights) and a bounce off the floor, then down for good.
 */
export const YARD_GATE_DROP: readonly number[] = [60, 60, 54, 60, 60, 56, 60, 50, 58, 60, 26, 0, 0, 8, 10, 4, 0, 2, 0];
export const YARD_SLAM_AT = 11;

/**
 * THE SLAM, frame `f` (0 to SLAM_FRAMES - 1, from the landing): dust thrown off the cobbles both ways from the gate's foot
 * and rolling out low, sparks struck off the spikes where they bite the floor (an honest orange: iron on stone). On its
 * own picture, anchored at the middle of the gate's foot on the floor (the middle of the doorway, at the back of the arch,
 * where the portcullis comes down: `at(1.5, PILLAR / 32)` in render.ts's measure), to be stood just in front of it.
 */
export function yardGateSlam(alongX: boolean, f: number): Sprite {
  const W = 280;
  const Hh = 180;
  const AX = W / 2;
  const AY = 104;
  const p = new Px(W, Hh);
  // (a place on the floor `a` along the gate from its middle, `q` out of it toward the eye (less than 0: behind), `h` up)
  const sc = (a: number, q: number, h: number): [number, number] => [Math.round(AX + (alongX ? a - q : q - a)), Math.round(AY + (a + q) / 2 - h)];
  const age = f / (SLAM_FRAMES - 1);
  // THE DUST: shot out flat along the floor both ways at the blow, then billowing up and rolling on, thinning as it goes
  const puffs: { a: number; q: number; h: number; rx: number; ry: number; k: number }[] = [];
  for (let i = 0; i < 26; i++) {
    const way = i % 2 === 0 ? -1 : 1;
    const a0 = -50 + hash(i, 1, 601) * 100;
    const t = Math.max(0, f + 1 - Math.floor(hash(i, 2, 602) * 2));
    const go = 1 - Math.pow(1 - Math.min(1, t / 11), 2.4);
    const out = way * (2 + (8 + hash(i, 3, 603) * 18) * go);
    const drift = (hash(i, 4, 604) - 0.5) * 10 * go;
    // (flat at first, then round and rising)
    const size = 3 + (5 + hash(i, 5, 605) * 7) * go;
    const rise = Math.min(1, t / 6);
    const rx = size * (1.6 - 0.35 * rise);
    const ry = size * (0.4 + 0.45 * rise);
    const h = ry + t * (0.25 + hash(i, 6, 606) * 0.75) * rise;
    puffs.push({ a: a0 + drift, q: out, h, rx, ry, k: i });
  }
  // (far ones first)
  puffs.sort((m, n) => m.a + m.q - (n.a + n.q));
  const thin = Math.max(0, (f - 3) / (SLAM_FRAMES - 3));
  for (const pf of puffs) {
    const [cx, cy] = sc(pf.a, pf.q, pf.h);
    const rx = Math.max(2, Math.round(pf.rx));
    const ry = Math.max(1, Math.round(pf.ry));
    for (let y = -ry - 2; y <= ry + 2; y++) {
      for (let x = -rx - 2; x <= rx + 2; x++) {
        const gx = (cx + x) >> 1;
        const gy = (cy + y) >> 1;
        // (a lumpy edge, crisp; billows on its top)
        const lump = (hash((cx + x) >> 2, (cy + y) >> 2, 611 + pf.k) - 0.5) * 0.3 + (hash(gx, gy, 612 + pf.k) - 0.5) * 0.16;
        const d = Math.hypot(x / rx, y / ry) + lump;
        if (d > 1) continue;
        // (its thin edge: every other game pixel, and more of it gone as it thins)
        if (d > 0.72 - thin * 0.3 && (gx + gy) % 2 === 0) continue;
        if (hash(gx, gy, 621 + f) < thin * (0.35 + d * 0.9)) continue;
        // (the moon on its upper left, its underside in shade)
        const lightUp = -y / ry - (x / rx) * 0.5;
        p.set(cx + x, cy + y, lightUp > 0.5 && d < 0.8 ? DUST[3] : lightUp < -0.4 ? DUST[1] : DUST[2]);
      }
    }
  }
  // (no grain of it alone)
  for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
    if (!p.has(x, y)) continue;
    let nb = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && p.has(x + dx, y + dy)) nb++;
    if (nb === 0) p.erase(x, y);
  }
  // THE BITE: where each spike strikes the floor, a flash and a little grit, the first frames
  for (const b of YARD_BARS) {
    const a = b + 2 - MID;
    if (f <= 1) {
      const [x, y] = sc(a, 0, 0);
      for (let i = -2; i <= 2; i++) p.set(x + i, y, f === 0 ? EMBER[4] : EMBER[3]);
      p.set(x, y - 1, EMBER[4]);
      p.set(x, y + 1, EMBER[2]);
      if (f === 0) {
        p.set(x - 1, y - 1, EMBER[3]);
        p.set(x + 1, y - 1, EMBER[3]);
      }
    }
  }
  // THE SPARKS: struck off the spikes, flying out both ways and falling, each a short streak of its path
  for (const b of YARD_BARS) {
    for (let n = 0; n < 3; n++) {
      const key = b * 7 + n;
      const life = 5 + Math.floor(hash(key, 1, 631) * 5);
      if (f > life) continue;
      const va = (hash(key, 2, 632) - 0.5) * 4.4;
      const vq = (hash(key, 3, 633) < 0.5 ? -1 : 1) * (1.2 + hash(key, 4, 634) * 1.8);
      const vh = 2.6 + hash(key, 5, 635) * 2.6;
      const pos = (t: number): [number, number] => sc(b + 2 - MID + va * t, vq * t, Math.max(0, vh * t - 0.42 * t * t));
      const [x1, y1] = pos(f + 1);
      const [x0, y0] = pos(Math.max(0, f - 0.2));
      const hot = f < life * 0.5;
      p.line(x0, y0, x1, y1, hot ? EMBER[3] : EMBER[2]);
      p.set(x1, y1, hot ? EMBER[4] : EMBER[3]);
      if (x0 === x1 && y0 === y1) p.set(x1, y1 + 1, EMBER[2]);
    }
  }
  const s = p.sprite(AX, AY, GRAIN);
  if (f < 6) s.lights = [{ x: AX / GRAIN, y: (AY - 6) / GRAIN, r: 34 - f * 3, color: EMBER[2], a: 0.3 - f * 0.04 }];
  return s;
}

/** The drop, frame by frame at 30 a second (`frame` from the moment the fight begins): the game's raise, and the slam's frame (-1: none yet, or over). */
export function yardGateDropAt(frame: number): { raise: number; slam: number; lit: boolean } {
  const i = Math.max(0, Math.floor(frame));
  const raise = YARD_GATE_DROP[Math.min(i, YARD_GATE_DROP.length - 1)];
  const s = i - YARD_SLAM_AT;
  return { raise, slam: s >= 0 && s < SLAM_FRAMES ? s : -1, lit: s >= 0 };
}

// =================================================================================================

let made: GateArt | null = null;
/**
 * THE YARD'S DOORS AND GATES (a GateArt, as art/gates.ts's): the boss's pillar, arch and portcullis its own (above);
 * everything else floor 2's (art/floor2.ts, headsmanGates): its doors of black oak, its plain gates, its levers, its seals.
 */
export function makeYardGateArt(): GateArt {
  if (made) return made;
  const base = headsmanGates();
  let pillar: Sprite | null = null;
  const arches = new Map<number, Strip[]>();
  const gates = new Map<number, Strip[]>();
  made = {
    post: base.post,
    lintel: (alongX) => base.lintel(alongX),
    leaf: (ex, ey) => base.leaf(ex, ey),
    lever: (pulled) => base.lever(pulled),
    seal: (ex, ey, word, lit) => base.seal(ex, ey, word, lit),
    pillar(boss) {
      if (!boss) return base.pillar(false);
      return pillar ?? (pillar = makeYardPillar());
    },
    arch(alongX, boss, lit) {
      if (!boss) return base.arch(alongX, false, lit);
      const key = (alongX ? 2 : 0) + (lit ? 1 : 0);
      let s = arches.get(key);
      if (!s) arches.set(key, (s = makeYardArch(alongX, lit)));
      return s;
    },
    portcullis(alongX, boss, raise) {
      if (!boss) return base.portcullis(alongX, false, raise);
      const lift = yardLift(raise);
      const key = lift * 2 + (alongX ? 1 : 0);
      let s = gates.get(key);
      if (!s) gates.set(key, (s = makeYardPortcullis(alongX, lift)));
      return s;
    },
  };
  return made;
}
