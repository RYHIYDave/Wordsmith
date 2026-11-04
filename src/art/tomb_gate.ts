// FLOOR 1, THE KING'S TOMB WITH DAYLIGHT: THE WARDEN'S OWN GATE, READY FOR THE GAME (the art chat, 2 Nov 2026). Behind the
// switch TOMB_GATE, off; nothing of the game imports it until the main chat puts it in (floor 1's boss doorway, with TOMB on).
//
// His words of the bosses' gates: “Its own arch, and we’ll need new ones for the other new levels as well”. Drawn with the three
// looks of floor 1 (the same gate in all three, docs/mockups/floor1_look) and made ready in his pick of them, 2 Nov 2026: “B,
// roots break in”.
//
// WHAT IS PAINTED HERE (a GateArt, art/gates.ts: all but the boss's pillar, arch and drop are floor 1's own, in look B's
// colours), an original design: the king's tomb's own door, locked by his jailer.
//   THE PILLARS: square, of the pale stone, FLUTED, on a base, a capital carved with leaves; to the way's spring (46); their
//     footprint the game's pillar.
//   THE ARCH: A ROUND-HEADED WAY (its crown at 86) under A RING OF VOUSSOIRS; the stone squared over it to A CORNICE (108 to
//     116) and A GABLE like a tomb's front, a hand's breadth thick, rising to 170, THE KING'S CROWN carved great in it; and on it
//     THE WARDEN'S IRON: A BAND riveted across under the cornice, CHAINS from rings on the spandrels to A GREAT LOCK hung over the
//     keystone (84 to 100), the enemy's fire dull and low in its keyhole, in embers (the only pink on the floor but the Warden);
//     SPIKES along the gable's raking edges; at its peak HIS HORNS in black iron (to 214), his helm's. Moss on it, a root down
//     its shoulder. `lit` (the drop down behind the hero, the fight on) the keyhole ALIGHT, pink at its rim burning to gold, and
//     then it gives the enemy's light.
//   THE DROP at the back of the way: square bars of black iron every twelve, pointed, straps across them riveted, as his
//     Lockdown's bars; drawn up (the game's raise of GATE_UP) its points hang at 70 under the way's head (a hero is 56).
//   THE DROP'S FALL (Movement 9, his rule: “Like the wind up and wind down are big but the actual punch is lightning quick”):
//     held juddering at the top, down in two frames, a hard landing and a bounce (`TOMB_GATE_DROP`); THE SLAM, grit and chips of
//     the pale stone shaken off the cornice and the gable, falling, and the tomb's dust thrown off the floor both ways
//     (`tombGateSlam`).
// Light from the upper left: the face along x lit, along y in shade; nothing glows cyan (the friend's); the lock's fire the
// enemy's, and the only pink.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { Flat, GATE_UP, PILLAR, SPAN, ARCH_WIDE, STRIP } from './gates';
import type { GateArt, Strip } from './gates';
import { wardenGates } from './floor1';
import { GRAIN, hash } from './kit';
import { FLAME } from './mkit';
import { Deep, IRON as IRON_B, MOSS, ROOT, STONE as STONE_B, crownPx, gradeSprite, litTone, mixC, noLone } from './tomb';

/** THE SWITCH: off until the main chat puts it in, on his yes. */
export const TOMB_GATE = { on: false };

/** His gate's stone: the tomb's, a tone lifted (the gate is the way on, and is seen from across the room), as the look had it. */
const STONE = [STONE_B[1], STONE_B[2], STONE_B[3], STONE_B[4], mixC(STONE_B[4], '#ffffff', 0.14)] as const;
/** The Warden's iron: black, its edge catching the light. */
const IRON = [IRON_B[0], IRON_B[1], IRON_B[2], IRON_B[4], mixC(IRON_B[4], STONE_B[4], 0.45)] as const;
const SEAM = '#0e0f0b';
const BEYOND = '#07060a';

// =================================================================================================
// MEASURES (picture pixels, two to a game pixel; u along the plane from the outer edge of the first pillar, v up)

/** The way: its half width, its spring, its rise (its crown at 86); the ring of voussoirs round it. */
export const TG_WAY = { half: SPAN / 2, spring: 46, rise: 40, ring: 12 };
/** The cornice, the gable's peak, the horns' tips. */
export const TG_CORNICE = { under: 108, top: 116 };
export const TG_PEAK = 170;
export const TG_HORNS = 214;
/** The crown in the gable: its middle's height, its half width. */
export const TG_CROWN = { z: 138, r: 21 };
/** The lock over the keystone: its body's foot and top, its half width; its keyhole's middle. */
export const TG_LOCK = { z0: 84, z1: 100, half: 9, hole: 93 };
/** The rings the chains hang from, on the spandrels over the pillars (from the way's middle, up). */
export const TG_RING = { a: 54, z: 64 };
/** How far up the drop is drawn when the gate is open (the game's raise of GATE_UP): its points at 70, peeking under the head of the way. */
export const TG_LIFT = 70;
const MID = ARCH_WIDE / 2;
/** The gable is a hand's breadth thick; the block of the arch under the cornice as thick as the pillars. */
const GABLE_DEEP = 6;

const clampK = (k: number): number => Math.max(0, Math.min(4, k));
const mod = (a: number, n: number): number => ((a % n) + n) % n;
const FIRE = new Set<string>([...FLAME]);
/** A face turned to screen-right, in shade (as art/floorkit.ts `shaded`); his fire is its own light. */
const shaded = (c: string): string => (FIRE.has(c) ? c : mixC(c, '#06051a', 0.32));

function inRound(du: number, up: number, half: number, spring: number, rise: number): boolean {
  if (Math.abs(du) >= half) return false;
  if (up < spring) return up >= 0;
  return (du / half) ** 2 + ((up - spring) / rise) ** 2 < 1;
}
/** Is a place in the way through (u, v in the plane): between the pillars, under the round head? */
export function tombInWay(u: number, v: number): boolean {
  if (u < PILLAR || u >= PILLAR + SPAN || v < 0) return false;
  return inRound(u + 0.5 - MID, v, TG_WAY.half, TG_WAY.spring, TG_WAY.rise);
}

// =================================================================================================
// THE GATE'S FACE

/** The ring of voussoirs round the way at a point (du from the way's middle, screen-relative: less than 0 toward the light). */
function ringAt(du: number, up: number): string | null {
  const { half, spring, rise, ring } = TG_WAY;
  const S = STONE;
  if (up < spring || inRound(du, up, half, spring, rise)) return null;
  if (!inRound(du, up, half + ring, spring, rise + ring)) return null;
  const ang = Math.atan2(up - spring, du * (rise / half));
  const n = 11;
  const idx = Math.floor((ang / Math.PI) * n + 0.5);
  const into = (ang / Math.PI) * n + 0.5 - idx;
  const key = idx === Math.floor(n / 2);
  if (!inRound(du, up + 1.2, half + ring - 1.2, spring, rise + ring - 1.2)) return SEAM;
  if (into < 0.07 && !key) return SEAM;
  const inner = !inRound(du, up - 1.5, half + 1.5, spring, rise + 1.5);
  if (inner && (du < 0 || up > spring + rise * 0.6)) return S[4];
  if (Math.abs(noiseAt(du / 6, up / 6) - 0.5) > 0.36 && du > -20 && du < 30) return MOSS[3];
  return S[idx % 2 ? 3 : 2];
}
/** A little smooth noise for the moss on the gate. */
function noiseAt(x: number, y: number): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  const h = (a: number, b: number): number => hash(a, b, 941);
  const a = h(i, j) + (h(i + 1, j) - h(i, j)) * fx;
  const b = h(i, j + 1) + (h(i + 1, j + 1) - h(i, j + 1)) * fx;
  return a + (b - a) * fy;
}
/** The chain from a ring to the lock at a point (a from the way's middle, up): 'lit' | 'dark' | null. Links of eight, flat and edge-on by turns, sagging. */
function chainAt(a: number, up: number): 'lit' | 'dark' | null {
  if (a <= 8 || a >= TG_RING.a) return null;
  const t = (a - 8) / (TG_RING.a - 8);
  const z = 90 + (TG_RING.z - 90) * t - 17 * Math.sin(Math.PI * t);
  const along = a - 8;
  const lk = Math.floor(along / 8);
  const f = mod(along, 8);
  const b = up - z;
  if (lk & 1) return Math.abs(b) < 1.6 && f > 0.4 && f < 7.6 ? (b > -0.4 ? 'lit' : 'dark') : null;
  const ring = Math.hypot((f - 4) / 4.2, b / 3.3);
  if (ring < 1 && ring > 0.38) return b > 0 || f < 3.5 ? 'lit' : 'dark';
  return null;
}
/** The top of a chain's links catching the light, every other pixel. */
const alightEdge = (a: number, v: number): boolean => (Math.floor(a) + v) % 3 === 0;
/** The keyhole of the great lock: is a point in it (du from the way's middle, up)? */
const inKeyhole = (du: number, up: number): boolean => Math.hypot(du, up - TG_LOCK.hole) < 2.2 || (Math.abs(du) < 1.2 && up >= TG_LOCK.hole - 6 && up < TG_LOCK.hole);

/** THE GATE'S FACE at a point (u from the outer edge of the pillar toward the light, v over the floor), from the spring up; null where nothing is. */
function faceAt(u: number, v: number, lit: boolean): string | null {
  const S = STONE;
  const I = IRON;
  const du = u + 0.5 - MID;
  const a = Math.abs(du);
  if (a > MID) return null;
  // THE LOCK, hung over the keystone from the band: its shackle, its body, its keyhole (in embers; alight once the fight is on)
  if (a <= TG_LOCK.half && v >= TG_LOCK.z0 && v < TG_LOCK.z1) {
    const e = Math.min(TG_LOCK.half - a, v - TG_LOCK.z0, TG_LOCK.z1 - 1 - v);
    if (e < 1) return du < 0 || v === TG_LOCK.z1 - 1 ? I[4] : I[0];
    if (inKeyhole(du, v)) {
      if (lit) return Math.hypot(du, v - TG_LOCK.hole) < 1.2 || (Math.abs(du) < 0.6 && v < TG_LOCK.hole) ? FLAME[4] : v < TG_LOCK.hole - 3 ? FLAME[3] : FLAME[2];
      return v < TG_LOCK.hole - 3 ? FLAME[1] : FLAME[0];
    }
    // (alight, the iron round the keyhole catches its fire)
    if (lit && Math.hypot(du, v - TG_LOCK.hole + 2) < 4.6) return FLAME[1];
    if (Math.hypot(du, v - (TG_LOCK.hole - 1)) < 4.2) return I[1];
    if (a > TG_LOCK.half - 3 && a < TG_LOCK.half - 1.5 && (v < TG_LOCK.z0 + 2.5 || v > TG_LOCK.z1 - 3.5)) return I[4];
    return du < -2 ? I[3] : I[2];
  }
  if (v >= TG_LOCK.z1 && v < TG_LOCK.z1 + 7 && a >= 4 && a < 7) return du < 0 ? I[3] : I[1];
  if (v >= TG_LOCK.z1 + 5 && v < TG_LOCK.z1 + 8 && a < 7) return I[3];
  // THE CHAINS from the rings to the lock's sides, sagging; the rings
  const ch = chainAt(a, v);
  if (ch) return ch === 'lit' ? (alightEdge(a, v) ? mixC(I[4], STONE[4], 0.5) : I[4]) : I[2];
  const rr = Math.hypot(a - TG_RING.a, v - TG_RING.z);
  if (rr < 3.4 && rr > 1.6) return v > TG_RING.z ? I[3] : I[1];
  // THE WAY, under the ring
  if (v < TG_WAY.spring || inRound(du, v, TG_WAY.half, TG_WAY.spring, TG_WAY.rise)) return null;
  // THE RING of voussoirs, the stone squared round it (spandrels), THE IRON BAND across under the cornice
  if (v < TG_CORNICE.under) {
    if (v >= TG_CORNICE.under - 8) {
      if (v === TG_CORNICE.under - 1 || v === TG_CORNICE.under - 8) return I[v === TG_CORNICE.under - 1 ? 3 : 0];
      if (mod(du + 300, 10) < 1.5 && v === TG_CORNICE.under - 5) return I[4];
      return I[2];
    }
    const rc = ringAt(du, v);
    if (rc) return rc;
    if (u < 1) return S[4];
    if (u >= ARCH_WIDE - 1) return S[1];
    if (mod(v - TG_WAY.spring, 14) === 13) return SEAM;
    // (a root come down over its shoulder from the vault, moss round it)
    const rx = 14 + Math.sin(v * 0.12) * 3 - (v - TG_WAY.spring) * 0.05;
    const re = Math.abs(u - rx);
    if (re < 4.2 - (TG_CORNICE.under - v) * 0.03) return re > 3 ? ROOT[0] : u < rx - 1 ? ROOT[4] : ROOT[2];
    if (re < 7 && noiseAt(u / 3, v / 3) > 0.5) return MOSS[2];
    return S[2];
  }
  // THE CORNICE: a moulding lit along its top
  if (v < TG_CORNICE.top) {
    if (v === TG_CORNICE.top - 1) return S[4];
    if (v === TG_CORNICE.under) return SEAM;
    if (v === TG_CORNICE.under + 2) return S[1];
    if (v === TG_CORNICE.top - 2 && noiseAt(du / 5, 3) > 0.62) return MOSS[3];
    return Math.floor(du / 4) & 1 && v < TG_CORNICE.under + 4 ? S[2] : S[3];
  }
  // THE GABLE: rising to its peak, its edges raking; the crown carved in it
  const slope = (TG_PEAK - TG_CORNICE.top) / (MID - 2);
  const edge = TG_PEAK - a * slope;
  if (v < edge) {
    const fromEdge = edge - v;
    if (fromEdge < 2) return du < 0 ? S[4] : S[3];
    if (fromEdge < 6) return fromEdge < 3 ? SEAM : du < 0 ? S[3] : S[2];
    if (fromEdge < 7) return SEAM;
    const cr = crownPx(du, v - TG_CROWN.z, TG_CROWN.r);
    if (cr === 'gold') {
      const rim = crownPx(du - 1.5, v - TG_CROWN.z + 1.5, TG_CROWN.r) === null;
      const rimLo = crownPx(du + 1.5, v - TG_CROWN.z - 1.5, TG_CROWN.r) === null;
      if (rim) return S[4];
      if (rimLo) return S[1];
      return S[3];
    }
    if (crownPx(du, v - TG_CROWN.z, TG_CROWN.r + 2)) return S[0];
    if (v < TG_CORNICE.top + 5 && noiseAt(du / 4, v / 3) > 0.56) return MOSS[2];
    return fromEdge < 8 ? S[1] : S[2];
  }
  // the spikes along the raking edges, every ten, leaning up and out
  const along = a / 10;
  const k = Math.round(along);
  if (a > 3 && a < MID - 4 && Math.abs(along - k) < 0.18 * Math.max(0, 1 - (v - edge) / 9) && v - edge < 9) return du < 0 ? I[3] : I[1];
  // HIS HORNS at the peak, in black iron: two horns curving up and out from a boss
  if (v >= TG_PEAK - 4 && v < TG_HORNS) {
    const h = v - (TG_PEAK - 4);
    if (h < 10 && a < 9 - h * 0.4) return h > 8.5 || (du < 0 && a > 7.5 - h * 0.4) ? I[4] : du < 0 ? I[3] : I[2];
    const t = h / (TG_HORNS - TG_PEAK + 4);
    const cx = 6 + 22 * Math.sin(t * 1.9) - 6 * t * t;
    const w = 5.2 * (1 - t) + 0.7;
    if (Math.abs(a - cx) < w) return a - cx > w - 1.4 || (t > 0.8 && a - cx > w - 2) ? I[4] : du < 0 ? I[3] : I[2];
  }
  return null;
}
/** Is a point of the face part of the block of stone over the way (the ring, the spandrels, the band, the cornice), as thick as the pillars? */
function inBlock(u: number, v: number): boolean {
  const du = u + 0.5 - MID;
  if (u < 0 || u >= ARCH_WIDE || v < TG_WAY.spring || v >= TG_CORNICE.top) return false;
  return !inRound(du, v, TG_WAY.half, TG_WAY.spring, TG_WAY.rise);
}
/** Is a point of the face part of the gable (a hand's breadth thick)? */
function inGable(u: number, v: number): boolean {
  const du = u + 0.5 - MID;
  if (u < 0 || u >= ARCH_WIDE || v < TG_CORNICE.top) return false;
  return v < TG_PEAK - Math.abs(du) * ((TG_PEAK - TG_CORNICE.top) / (MID - 2));
}

// =================================================================================================
// THE PILLAR: square, fluted, of the pale stone

/** The pillar's height: to the way's spring; its base, its capital. */
const COLUMN = { top: TG_WAY.spring, base: 10, capital: 6 };

/**
 * A PILLAR OF HIS GATE: square, of the tomb's pale stone, its faces fluted (two flutes each), on a base, a capital band carved with
 * leaves; moss at its foot. Its footprint the game's pillar (PILLAR each way, behind its front corner); one picture for a gate
 * either way. Anchored at its front corner on the floor.
 */
export function makeTombPillar(): Sprite {
  const high = COLUMN.top;
  const W = 40;
  const H = high + 30;
  const AX = 20;
  const AY = high + 20;
  const p = new Px(W, H);
  const D = new Deep(p, AX, AY);
  const P = PILLAR / 32;
  const c = -P / 2;
  D.march({
    box: { x0: -P, y0: -P, z0: 0, x1: 0, y1: 0, z1: high },
    inside: (x, y, z) => Math.abs(x - c) < P / 2 && Math.abs(y - c) < P / 2 && z < high,
    shade: (x, y, z, face) => {
      const S = STONE;
      if (face === 'z' || z >= high - 1) return S[4];
      const nx = face === 'x' ? 1 : 0;
      const ny = face === 'y' ? 1 : 0;
      let k = litTone(nx, ny, 0.2);
      if (z < COLUMN.base) {
        if (z >= COLUMN.base - 1) return S[4];
        if (z < 6 && hash(Math.floor((x + y) * 40), Math.floor(z / 2), 961) < 0.5) return MOSS[clampK(k + 1)];
        return S[clampK(k - 1)];
      }
      if (z >= high - COLUMN.capital) {
        if (z < high - COLUMN.capital + 1) return SEAM;
        // (the capital: a band of little leaves, lit along their tops)
        const across = face === 'y' ? x : y;
        return mod(Math.floor(across * 32) + Math.floor(z), 4) < 2 ? S[clampK(k + 1)] : S[clampK(k)];
      }
      // two flutes down each face, their lit edge toward the light
      const across = (face === 'y' ? x - c : y - c) * 32;
      const fl = Math.abs(Math.abs(across) - 2.4);
      if (fl < 0.7) k -= 1;
      else if (fl < 1.4 && across < 0) k += 1;
      if (Math.abs(across) > 5.2) k += across < 0 ? 1 : -1;
      return S[clampK(k)];
    },
  }, 0.004);
  noLone(p);
  return p.sprite(AX, AY, GRAIN);
}

// =================================================================================================
// THE ARCH: the ring, the band, the cornice, the gable and the crown; his iron on it

/** HIS GATE'S FACE from the outer edge of one pillar to the outer edge of the other, from the spring to his horns, and what is seen of its thickness: the lock in embers, or `lit` alight (and then it gives light). */
export function makeTombArch(alongX: boolean, lit: boolean): Strip[] {
  const F = new Flat(0, ARCH_WIDE + 16, TG_HORNS + 18 + PILLAR);
  // (the face's pattern laid with its light from the screen's left: along y the plane runs the other way)
  const at = (u: number): number => (alongX ? u : ARCH_WIDE - 1 - u);
  const tone = (c: string): string => (alongX ? c : shaded(c));
  for (let v = TG_WAY.spring - 4; v < F.high; v++) {
    for (let u = 0; u < F.u1; u++) {
      const c = u < ARCH_WIDE ? faceAt(at(u), v, lit) : null;
      if (c !== null) {
        F.set(u, v, tone(c));
        continue;
      }
      // what is seen of its thickness: the block's underside where the way's head turns toward the eye, its end over the far
      // pillar; the gable's raking top going back a hand's breadth
      for (let s = 1; s <= PILLAR; s++) {
        const pu = u - s;
        const pv = v - s;
        const block = inBlock(at(pu), pv) && pu >= 0 && pu < ARCH_WIDE;
        const gable = s <= GABLE_DEEP && inGable(at(pu), pv) && pu >= 0 && pu < ARCH_WIDE;
        if (!block && !gable) continue;
        const under = u < ARCH_WIDE && v < TG_CORNICE.under && inRound(at(u) + 0.5 - MID, v, TG_WAY.half, TG_WAY.spring, TG_WAY.rise);
        const side = !alongX;
        let c2: string;
        if (gable && !block) c2 = s === 1 ? STONE[3] : STONE[2];
        else if (under) c2 = s <= 1 ? STONE[0] : mixC(STONE[1], STONE[0], 0.35);
        else c2 = u === ARCH_WIDE ? STONE[3] : mod(v - u, 14) === 0 ? SEAM : STONE[1];
        F.set(u, v, side ? c2 : shaded(c2));
        break;
      }
    }
  }
  const out = F.strips(alongX);
  if (lit) {
    // (alight, the lock gives the enemy's light: on the strip with the middle of its keyhole)
    const mid = Math.floor(MID);
    const s0 = Math.floor(mid / STRIP) * STRIP;
    const strip = out.find((q) => q.t === s0 / 32);
    if (strip) {
      const j = mid - s0;
      strip.s.lights = [{ x: (alongX ? j : STRIP - 1 - j) / GRAIN, y: (F.anchorRow + Math.floor((j - 1) / 2) - TG_LOCK.hole) / GRAIN, r: 26, color: FLAME[2], a: 0.34 }];
    }
  }
  return out;
}

// =================================================================================================
// THE DROP: square bars of black iron, pointed, as his Lockdown's

/** Where its bars stand along the plane (their middles): eight, every twelve. */
export const TG_BARS = [18, 30, 42, 54, 66, 78, 90, 102];
/** How long each bar's point is. */
const POINT = 5;

/** The game's raise (0 to GATE_UP) as how far this drop is drawn up (0 to TG_LIFT), an even number. */
export function tombLift(raise: number): number {
  const r = Math.max(0, Math.min(GATE_UP, raise));
  return Math.round((r * TG_LIFT) / GATE_UP / 2) * 2;
}

/**
 * HIS GATE'S DROP, `lift` picture pixels off the floor: square bars of black iron every twelve, each to a point; straps across them,
 * riveted; at the back of the way, and what of it is not in the way, or is behind the gate's thickness, is not there.
 */
export function makeTombDrop(alongX: boolean, lift: number): Strip[] {
  const top = TG_WAY.spring + TG_WAY.rise + 2;
  const F = new Flat(0, ARCH_WIDE, top);
  const put = (u: number, v: number, c: string): void => {
    if (tombInWay(u, v) && tombInWay(u + PILLAR, v + PILLAR)) F.set(u, v, alongX ? c : shaded(c));
  };
  const tall = top + 40;
  for (const b of TG_BARS) {
    for (let h = 0; h <= tall; h++) {
      const half = h < POINT ? 0.4 + (h / POINT) * 1.4 : 1.8;
      for (let du = -3; du <= 3; du++) {
        if (Math.abs(du) > half) continue;
        const side = alongX ? du : -du;
        put(b + du, h + lift, h < 1 ? IRON[2] : side < -0.6 ? IRON[4] : side < 0.6 ? IRON[2] : IRON[1]);
      }
    }
  }
  for (let h0 = POINT + 4; h0 <= tall; h0 += 22) {
    for (let u = PILLAR; u < PILLAR + SPAN; u++) {
      for (let q = 0; q < 3; q++) {
        const rivet = TG_BARS.includes(u) && q === 1;
        put(u, h0 + q + lift, rivet ? IRON[4] : q === 2 ? IRON[3] : q === 0 ? IRON[0] : IRON[2]);
      }
    }
  }
  return F.strips(alongX);
}

// =================================================================================================
// THE DROP'S FALL AND THE SLAM

/** How many frames the slam's chips, grit and dust last (at 30 a second). */
export const TG_SLAM_FRAMES = 16;
/**
 * THE DROP, Movement 9: the game's raise (0 to GATE_UP) frame by frame at 30 a second from the moment the fight begins. Held at
 * the top, juddering, its chains slipping and catching (a third of a second); down in two frames; a hard landing
 * (`TOMB_SLAM_AT`: the chips and dust begin, the lock lights) and a bounce off the floor, then down for good.
 */
export const TOMB_GATE_DROP: readonly number[] = [60, 60, 56, 60, 60, 54, 60, 58, 52, 60, 26, 0, 0, 6, 8, 2, 0, 0];
export const TOMB_SLAM_AT = 11;

/** The tomb's pale dust off the floor, its belly to its lit top. */
const DUST_UP = ['#262821', '#353830', '#474a3e', '#5a5e4f'] as const;

/**
 * THE SLAM, frame `f` (0 to TG_SLAM_FRAMES - 1, from the landing): grit and chips of the pale stone and moss shaken off the
 * cornice and the gable, falling before the gate and striking the floor; the tomb's dust thrown off the floor both ways from the
 * gate's foot and rolling out low, thinning. Anchored at the middle of the gate's foot on the floor (the middle of the doorway at
 * the back of the way: `at(1.5, PILLAR / 32)` in render.ts's measure), to be stood just in front of it.
 */
export function tombGateSlam(alongX: boolean, f: number): Sprite {
  const W = 280;
  const Hh = 240;
  const AX = W / 2;
  const AY = 200;
  const p = new Px(W, Hh);
  const sc = (a: number, q: number, h: number): [number, number] => [Math.round(AX + (alongX ? a - q : q - a)), Math.round(AY + (a + q) / 2 - h)];
  const puffs: { a: number; q: number; h: number; rx: number; ry: number; k: number }[] = [];
  for (let i = 0; i < 22; i++) {
    const way = i % 2 === 0 ? -1 : 1;
    const a0 = -50 + hash(i, 1, 741) * 100;
    const t = Math.max(0, f + 1 - Math.floor(hash(i, 2, 742) * 2));
    const go = 1 - Math.pow(1 - Math.min(1, t / 11), 2.4);
    const out = way * (2 + (8 + hash(i, 3, 743) * 16) * go);
    const drift = (hash(i, 4, 744) - 0.5) * 10 * go;
    const size = 3 + (4 + hash(i, 5, 745) * 6) * go;
    const rise = Math.min(1, t / 6);
    const rx = size * (1.6 - 0.35 * rise);
    const ry = size * (0.4 + 0.45 * rise);
    const h = ry + t * (0.25 + hash(i, 6, 746) * 0.6) * rise;
    puffs.push({ a: a0 + drift, q: out + 14, h, rx, ry, k: i });
  }
  puffs.sort((m, n) => m.a + m.q - (n.a + n.q));
  const thin = Math.max(0, (f - 3) / (TG_SLAM_FRAMES - 3));
  for (const pf of puffs) {
    const [cx, cy] = sc(pf.a, pf.q, pf.h);
    const rx = Math.max(2, Math.round(pf.rx));
    const ry = Math.max(1, Math.round(pf.ry));
    for (let y = -ry - 2; y <= ry + 2; y++) {
      for (let x = -rx - 2; x <= rx + 2; x++) {
        const gx = (cx + x) >> 1;
        const gy = (cy + y) >> 1;
        const lump = (hash((cx + x) >> 2, (cy + y) >> 2, 751 + pf.k) - 0.5) * 0.3 + (hash(gx, gy, 752 + pf.k) - 0.5) * 0.16;
        const d = Math.hypot(x / rx, y / ry) + lump;
        if (d > 1) continue;
        if (d > 0.72 - thin * 0.3 && (gx + gy) % 2 === 0) continue;
        if (hash(gx, gy, 761 + f) < thin * (0.35 + d * 0.9)) continue;
        const lightUp = -y / ry - (x / rx) * 0.5;
        p.set(cx + x, cy + y, lightUp > 0.5 && d < 0.8 ? DUST_UP[3] : lightUp < -0.4 ? DUST_UP[1] : DUST_UP[2]);
      }
    }
  }
  noLone(p);
  // THE CHIPS AND GRIT off the cornice and the gable: falling (from rest, a little out from the face), striking the floor, lying
  for (let i = 0; i < 26; i++) {
    const big = i < 9;
    const a = (hash(i, 1, 781) - 0.5) * 96;
    const q0 = 13 + hash(i, 2, 782) * 4;
    const h0 = TG_CORNICE.under + hash(i, 3, 783) * (TG_PEAK - TG_CORNICE.under - 20);
    const start = Math.floor(hash(i, 4, 784) * 5);
    const t = f - start;
    if (t < 0) continue;
    const g = 2.4;
    let h = h0 - 0.5 * g * t * t;
    let q = q0 + t * (0.4 + hash(i, 5, 785) * 0.5);
    if (h < 0) {
      const tLand = Math.sqrt((2 * h0) / g);
      const after = t - tLand;
      h = Math.max(0, (big ? 3 : 1.5) * after - 0.6 * after * after);
      q = q0 + tLand * (0.4 + hash(i, 5, 785) * 0.5) + Math.min(after, 4) * 0.8;
      if (!big && after > 3) continue;
    }
    const [x, y] = sc(a, q, h);
    const moss = hash(i, 6, 786) < 0.3;
    if (big) {
      const L = moss ? MOSS[3] : STONE[4];
      p.set(x, y - 1, L).set(x + 1, y - 1, STONE[3]).set(x, y, STONE[3]).set(x + 1, y, STONE[2]).set(x + 2, y, STONE[1]).set(x - 1, y, STONE[3]);
      p.set(x, y + 1, STONE[1]).set(x + 1, y + 1, SEAM);
    } else {
      p.set(x, y, moss ? MOSS[3] : STONE[3]).set(x, y + 1, STONE[1]);
    }
  }
  return p.sprite(AX, AY, GRAIN);
}

/** The drop, frame by frame at 30 a second (`frame` from the moment the fight begins): the game's raise, the slam's frame (-1: none yet, or over), and whether the lock is alight. */
export function tombGateDropAt(frame: number): { raise: number; slam: number; lit: boolean } {
  const i = Math.max(0, Math.floor(frame));
  const raise = TOMB_GATE_DROP[Math.min(i, TOMB_GATE_DROP.length - 1)];
  const s = i - TOMB_SLAM_AT;
  return { raise, slam: s >= 0 && s < TG_SLAM_FRAMES ? s : -1, lit: s >= 0 };
}

// =================================================================================================

let made: GateArt | null = null;
/** Its pictures let go (its floor left: render.ts forgetLooks; his “it’s crashing every couple of levels”), made again if wanted. */
export function forgetMade(): void {
  made = null;
}
/**
 * FLOOR 1'S DOORS AND GATES WITH HIS OWN (a GateArt, as art/gates.ts's): the boss's pillar, arch and drop his gate's (above);
 * everything else floor 1's own (art/floor1.ts, wardenGates: its doors of old timber bound in iron, its plain gates with the
 * king's crown over them, its levers and seals), in look B's colours. The town's stairs stand in a plain gate's arch.
 */
export function makeTombGateArt(): GateArt {
  if (made) return made;
  const base = wardenGates();
  const g = (list: Strip[]): Strip[] => list.map((q) => ({ s: gradeSprite(q.s), t: q.t }));
  const memo = new Map<string, Strip[]>();
  const kept = (key: string, make: () => Strip[]): Strip[] => {
    let s = memo.get(key);
    if (!s) memo.set(key, (s = make()));
    return s;
  };
  let pillar: Sprite | null = null;
  made = {
    post: gradeSprite(base.post),
    lintel: (alongX) => kept(`lintel${alongX}`, () => g(base.lintel(alongX))),
    leaf: (ex, ey) => gradeSprite(base.leaf(ex, ey)),
    lever: (pulled) => gradeSprite(base.lever(pulled)),
    seal: (ex, ey, word, lit) => gradeSprite(base.seal(ex, ey, word, lit)),
    pillar(boss) {
      if (!boss) return gradeSprite(base.pillar(false));
      return pillar ?? (pillar = makeTombPillar());
    },
    arch(alongX, boss, lit) {
      if (!boss) return kept(`arch${alongX}${lit}`, () => g(base.arch(alongX, false, lit)));
      return kept(`boss arch${alongX}${lit}`, () => makeTombArch(alongX, lit));
    },
    portcullis(alongX, boss, raise) {
      if (!boss) return kept(`gate${alongX}${raise}`, () => g(base.portcullis(alongX, false, raise)));
      const lift = tombLift(raise);
      return kept(`drop${alongX}${lift}`, () => makeTombDrop(alongX, lift));
    },
  };
  return made;
}
void BEYOND;
void ROOT;
