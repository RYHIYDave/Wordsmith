// FLOOR 4, THE BURIED CHAPEL OF BONES: THE AMALGAMATION'S OWN GATE, READY FOR THE GAME (the art chat, 2 Nov 2026). Behind the
// switch CHAPEL_GATE, off; nothing of the game imports it until the main chat puts it in (floor 4's boss doorway, with CHAPEL on).
//
// His words of the bosses' gates: “Its own arch, and we’ll need new ones for the other new levels as well”. Drawn with the three
// looks of floor 4 (the same gate in all three, docs/mockups/floor4_look) and made ready in his pick of them, 2 Nov 2026, by
// 12:29: “A with B's break-in (Recommended)”.
//
// WHAT IS PAINTED HERE (a GateArt, art/gates.ts: all but the boss's pillar, arch and portcullis are floor 4's own, in look A's
// colours), an original design:
//   THE PILLARS: CLUSTERED, three round shafts on a moulded base and plinth, an annulet half way up, a capital with A SKULL
//     CARVED on each of its faces, up to the spring at 64.
//   THE ARCH: POINTED, over the three tiles of the way (its crown 123 over the floor), its ring SET WITH THE DEAD'S SKULLS, one to
//     each voussoir, upright; the face about it in ashlar to a cornice at 140; over it A GABLE to 192, its slopes coped with
//     long bones (knobs at their ends), a skull on its peak; in the gable a roundel with HIS MARK, THE MAW (floor 4's own: a
//     mouth roaring open, its corners cut square, three fangs of every size all hanging from the top), the enemy's fire dull and
//     lowest in it, in embers; `lit` (the gate down behind the hero, the fight on) the maw alight, the enemy's pink burning to
//     gold, and it gives the enemy's light. Through the way, the arch's underside.
//   THE DROP at the back of the arch: A GRILLE OF THE DEAD'S LONG BONES every twelve, bound with straps of riveted iron, their
//     ends cut to points; drawn up (the game's raise of GATE_UP) its points hang at 88.
//   THE DROP'S FALL (Movement 9, his rule: “Like the wind up and wind down are big but the actual punch is lightning quick”):
//     held juddering at the top, down in two frames, a hard landing and a bounce (`CHAPEL_GATE_DROP`); THE SLAM, bone dust
//     thrown off the flags both ways and chips of bone flying (`chapelGateSlam`).
// Light from the upper left: the face along x lit, along y in shade; nothing glows cyan (the friend's); the maw's fire the
// enemy's, and the only pink.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { Flat, GATE_UP, PILLAR, SPAN, ARCH_WIDE, STRIP } from './gates';
import type { GateArt, Strip } from './gates';
import { ossuaryGates } from './floor4';
import { GRAIN, hash } from './kit';
import { FLAME } from './mkit';
import { BONE, Deep, gradeSprite, litTone, noLone } from './chapel';

/** THE SWITCH: off until the main chat puts it in, on his yes. */
export const CHAPEL_GATE = { on: false };

/** His gate's stone: the chapel's, a tone lifted (the gate is the way on, and is seen from across the dark). */
const STONE = ['#16151b', '#27252e', '#37343f', '#4b4754', '#68636f'] as const;
const IRON = ['#0b0a0d', '#1b191f', '#2a272f', '#3d3943', '#5e5764'] as const;
const SEAM = '#0b0a0e';
const BEYOND = '#060508';

// =================================================================================================
// MEASURES (picture pixels, two to a game pixel; u along the plane from the outer edge of the first pillar, v up)

/** Where the arch springs from the pillars; its two arcs' radius and their centres either side of the middle; its ring of skulls. */
export const CG_SPRING = 64;
export const CG_R = 60;
const CG_C = 12;
const RING = 14;
/** The cornice; the gable's peak. */
export const CG_CORNICE = 140;
export const CG_PEAK = 192;
/** His mark, the maw, in the gable: its roundel's middle over the floor, and its radius. */
export const MAW_Z = 164;
const MAW_R = 15;
/** How far up the drop is drawn when the gate is open (the game's raise of GATE_UP): its points under the crown. */
export const CG_LIFT = 88;
/** The gate is as thick as its pillars: the gable's coping runs back that far. */
const DEEP = PILLAR;
const MID = ARCH_WIDE / 2;

const clampK = (k: number): number => Math.max(0, Math.min(4, k));
function hexOf(c: string): [number, number, number] {
  const n = parseInt(c.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mixC(a: string, b: string, k: number): string {
  const [r0, g0, b0] = hexOf(a);
  const [r1, g1, b1] = hexOf(b);
  const f = (v: number): string => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${f(r0 + (r1 - r0) * k)}${f(g0 + (g1 - g0) * k)}${f(b0 + (b1 - b0) * k)}`;
}
const FIRE = new Set<string>([...FLAME]);
/** A face turned to screen-right, in shade (as art/floorkit.ts `shaded`); his fire is its own light. */
const shaded = (c: string): string => (FIRE.has(c) ? c : mixC(c, '#06051a', 0.32));

/** A skull seen face on, 8 x 8 (as the chapel's): its dome lit from the upper left. */
const SKULL = ['..3443..', '.344443.', '34444332', '31144112', '31143112', '33331322', '.233332.', '..2.2.2.'];
function skullPx(i: number, j: number, down = 0): string | null {
  if (j < 0 || j >= 8 || i < 0 || i >= 8) return null;
  const ch = SKULL[j][i];
  if (ch === '.') return null;
  if (ch === '1') return SEAM;
  return BONE[clampK(Number(ch) - down + 1)];
}

const inPointed = (du: number, dz: number, R: number): boolean => dz > 0 && Math.hypot(du - CG_C, dz) < R && Math.hypot(du + CG_C, dz) < R;
/** Is a place in the way through (u, v in the plane): between the pillars, under the pointed arch? */
export function chapelInWay(u: number, v: number): boolean {
  if (u < PILLAR || u >= PILLAR + SPAN || v < 0) return false;
  const du = u + 0.5 - MID;
  const dz = v + 0.5 - CG_SPRING;
  return dz <= 0 || inPointed(du, dz, CG_R);
}
/** The gable's top at a place along the plane. */
const gableTop = (u: number): number => CG_CORNICE + 6 + (CG_PEAK - CG_CORNICE - 6) * (1 - Math.abs(u + 0.5 - MID) / MID);

// =================================================================================================
// HIS MARK: THE MAW in its roundel

/** The maw at (du across from the roundel's middle, dz up from it): a colour; `lit` alight. */
function mawAt(du: number, dz: number, rr: number, lit: boolean): string {
  const S = STONE;
  // the roundel's ring: lit on its upper left
  if (rr > 12.5) return du - dz < 0 ? S[4] : S[1];
  if (rr > 11.5) return SEAM;
  // the mouth, roaring open: a little wider than tall, its corners cut square
  const ax = Math.abs(du);
  const top = 5.5 - (ax > 5 ? 1 : 0);
  const bot = -6 + (ax > 6 ? 1 : 0);
  const inMouth = ax < 7.5 && dz < top && dz > bot && !(ax > 6 && (dz > top - 1.2 || dz < bot + 1.2));
  if (inMouth) {
    // THREE FANGS of every size, all hanging from the top: long at the left, short in the middle, middling at the right
    for (const [fx, len] of [[-4, 7.5], [0.5, 3.5], [4.5, 5.5]] as const) {
      const fromTop = top - dz;
      if (fromTop < len) {
        const half = 1.4 * (1 - fromTop / len) + 0.35;
        if (Math.abs(du - fx) < half) return du < fx ? BONE[4] : BONE[2];
      }
    }
    const ember = hash(Math.floor(du + 20), Math.floor(dz + 20), 977);
    if (lit) {
      // ALIGHT: the enemy's fire filling it, pink at its rim burning to gold at its heart (in tongues, never in rings)
      const heat = 1 - Math.hypot(du / 7.5, (dz - bot) / (top - bot + 2)) + (ember - 0.5) * 0.3;
      return heat > 0.62 ? FLAME[4] : heat > 0.42 ? FLAME[3] : heat > 0.2 ? FLAME[2] : FLAME[1];
    }
    // in embers: the enemy's fire, dull, lowest in it
    if (dz < bot + 2.2) return ember < 0.75 ? FLAME[1] : FLAME[0];
    if (dz < bot + 4.2) return ember < 0.45 ? FLAME[0] : BEYOND;
    return BEYOND;
  }
  if (ax < 9 && dz < top + 1.5 && dz > bot - 1.5) return dz > 0 ? S[1] : S[4];
  return S[2];
}

// =================================================================================================
// THE GATE'S FACE

/** The gate's face at a point (u from the outer edge of the pillar toward the light, v over the floor), from the springing up; null where nothing is. */
function faceAt(u: number, v: number, lit: boolean): string | null {
  const S = STONE;
  const du = u + 0.5 - MID;
  const dz = v + 0.5 - CG_SPRING;
  if (chapelInWay(u, v)) return null;
  // THE GABLE and the skull on its peak
  const gTop = gableTop(u);
  if (v >= CG_CORNICE + 6 && v > gTop) {
    const sk = skullPx(Math.floor(du + 4), Math.floor(CG_PEAK + 8 - v), 0);
    if (sk && v > CG_PEAK - 4) return sk;
    return null;
  }
  if (v >= CG_CORNICE + 6) {
    // its coping of long bones laid along its slopes: a knob at each end, shafts between
    if (gTop - v < 5) {
      const along = Math.abs(du) + v * 0.5;
      const knob = ((Math.floor(along / 9) % 2) + 2) % 2 === 0 && along % 9 < 3;
      const t = gTop - v;
      if (knob) return BONE[t < 1 ? 4 : t < 3 ? 3 : 2];
      return t < 1 ? BONE[3] : t < 2 ? BONE[2] : t < 4 ? BONE[1] : SEAM;
    }
    // THE ROUNDEL with the maw
    const rr = Math.hypot(du, v + 0.5 - MAW_Z);
    if (rr < MAW_R) return mawAt(du, v + 0.5 - MAW_Z, rr, lit);
    // the gable's face: small courses
    return (v + 400) % 9 === 8 || (u + Math.floor(v / 9) * 7 + 400) % 17 === 0 ? SEAM : S[(Math.floor(u / 17) + Math.floor(v / 9)) % 4 === 0 ? 2 : 3];
  }
  // THE CORNICE across the top of the face
  if (v >= CG_CORNICE) return v === CG_CORNICE + 5 ? S[4] : v >= CG_CORNICE + 3 ? S[3] : v === CG_CORNICE ? SEAM : S[1];
  // THE RING of the pointed arch, set with skulls, one to each voussoir, upright
  if (dz > -1 && inPointed(du, dz + 0.01, CG_R + RING) && Math.abs(du) < 48 + RING) {
    const left = du < 0;
    const cx = left ? CG_C : -CG_C;
    const rho = Math.hypot(du - cx, Math.max(0, dz));
    if (rho < CG_R + 1.5) return S[4];
    if (rho > CG_R + RING - 1.5) return rho > CG_R + RING - 0.5 ? SEAM : S[3];
    if (Math.abs(du) < 4) return Math.abs(du) > 3 ? SEAM : S[3];
    const ang = Math.atan2(Math.max(0, dz), left ? du - cx : -(du - cx));
    const arc = (Math.PI - ang) * (CG_R + RING / 2);
    const k = Math.round((arc - 7) / 12);
    const a0 = 7 + 12 * k;
    const ca = Math.PI - a0 / (CG_R + RING / 2);
    const sx = cx + (left ? 1 : -1) * Math.cos(ca) * (CG_R + RING / 2);
    const sz = Math.sin(ca) * (CG_R + RING / 2);
    const sk = skullPx(Math.floor(du - sx + 4), Math.floor(sz + 4 - dz), 0);
    if (sk && a0 > 3) return sk;
    const into = arc - (a0 - 6);
    if (into < 1 || into > 11.6) return SEAM;
    return S[k % 2 ? 2 : 3];
  }
  // THE FACE about the arch: ashlar in courses, its joints' upper and left edges lit
  if (u === 0) return S[4];
  if (u === ARCH_WIDE - 1) return S[0];
  const row = Math.floor(v / 12);
  const lv = v % 12;
  const off = row % 2 ? 0 : 14;
  const lu = (u + off + 400) % 28;
  if (lv === 11 || lu === 0) return SEAM;
  if (lv === 10 || lu === 1) return S[4];
  return (Math.floor((u + off + 400) / 28) + row) % 3 === 0 ? S[2] : S[3];
}

// =================================================================================================
// THE PILLAR: clustered

/**
 * A PILLAR OF HIS GATE: three round shafts clustered (one at its front corner, one along each face) on a moulded base and a
 * square plinth, an annulet half way up, a square capital with a skull carved on each face, up to the spring. Its footprint the
 * game's pillar (PILLAR each way, behind its front corner); one picture for a gate either way. Anchored at its front corner on
 * the floor.
 */
export function makeChapelPillar(high = CG_SPRING): Sprite {
  const W = 40;
  const H = high + 30;
  const AX = 20;
  const AY = high + 20;
  const p = new Px(W, H);
  const D = new Deep(p, AX, AY);
  const P = PILLAR / 32;
  const shafts: [number, number, number][] = [[-0.115, -0.115, 0.1], [-0.29, -0.085, 0.075], [-0.085, -0.29, 0.075]];
  const inShaft = (x: number, y: number, grow: number): [number, number, number] | null => {
    for (const s of shafts) if (Math.hypot(x - s[0], y - s[1]) < s[2] + grow) return s;
    return null;
  };
  const CAP = high - 10;
  D.march({
    box: { x0: -P, y0: -P, z0: 0, x1: 0, y1: 0, z1: high },
    inside: (x, y, z) => {
      if (z < 7) return true;
      if (z < 10) return x < -0.02 && y < -0.02;
      if (z >= CAP) return x < -0.005 && y < -0.005;
      if (z >= 33 && z < 36) return inShaft(x, y, 0.025) !== null || (x < -0.07 && y < -0.07 && x > -0.33 && y > -0.33);
      return inShaft(x, y, 0) !== null || (x < -0.12 && y < -0.12 && x > -0.33 && y > -0.33);
    },
    shade: (x, y, z, face) => {
      // the plinth, the moulding, the capital: flat faces; a mould's top lit
      if (z < 10 || z >= CAP) {
        if (z >= CAP) {
          if (z >= high - 2) return STONE[4];
          if (z < CAP + 1) return STONE[0];
          // A SKULL carved on each face of the capital
          const j = Math.floor(high - 2 - z) - 0;
          if (face === 'y' || (face !== 'x' && y > -0.02)) {
            const sk = skullPx(Math.floor((x + P) * 32) - 2, j - 0, 0);
            if (sk) return sk;
            return STONE[3];
          }
          const sk = skullPx(Math.floor(-y * 32) - 2, j, 1);
          if (sk) return mixC(sk, '#06051a', 0.25);
          return STONE[1];
        }
        if (z >= 6 && z < 7) return STONE[4];
        if (z >= 9) return STONE[4];
        return STONE[face === 'z' ? 4 : face === 'y' ? 3 : face === 'x' ? 1 : 2];
      }
      const s = inShaft(x, y, 0.03);
      if (s) {
        const nx = x - s[0];
        const ny = y - s[1];
        const k = litTone(nx, ny, 0);
        if (z >= 33 && z < 36) return z >= 35 ? STONE[4] : STONE[clampK(k)];
        return STONE[clampK(k)];
      }
      return STONE[face === 'y' ? 2 : 0];
    },
  }, 0.004);
  noLone(p);
  return p.sprite(AX, AY, GRAIN);
}

// =================================================================================================
// THE ARCH AND THE FACE

/**
 * HIS GATE'S FACE, from the outer edge of one pillar to the outer edge of the other, from the springing to the skull on the
 * gable's peak: the pointed arch and its ring of skulls, the ashlar face, the cornice, the gable coped with bones (its top a
 * pillar's thickness back), the roundel and his maw (in embers, or `lit` alight, and then it gives light); through the way the
 * arch's underside.
 */
export function makeChapelArch(alongX: boolean, lit: boolean): Strip[] {
  const F = new Flat(0, ARCH_WIDE + 16, CG_PEAK + 12 + DEEP);
  // (the face's pattern laid with its light from the screen's left: along y the plane runs the other way)
  const at = (u: number): number => (alongX ? u : ARCH_WIDE - 1 - u);
  const tone = (c: string): string => (alongX ? c : shaded(c));
  // THE GABLE'S COPING, its top a pillar's thickness back (painted first: the face over it)
  for (let u = 0; u < ARCH_WIDE; u++) {
    const g = Math.floor(gableTop(at(u)));
    for (let s = 1; s <= DEEP; s++) {
      // (the long bones laid along the slope, seen from above: lit at the front, darker going back, a joint between each)
      const joint = (u + 400) % 18 === 0;
      F.set(u + s, g + s - 1, tone(joint ? BONE[0] : s === 1 ? BONE[4] : s <= 4 ? BONE[3] : s < DEEP ? BONE[2] : BONE[1]));
    }
  }
  for (let v = CG_SPRING; v < F.high; v++) {
    for (let u = 0; u < ARCH_WIDE; u++) {
      if (chapelInWay(u, v)) {
        // THE UNDERSIDE through the way: the ring's inside, set back to the slot (as far back as the pillars are thick)
        for (let s = 1; s <= DEEP; s++) {
          const us = u - s;
          const vs = v - s;
          if (vs < CG_SPRING || chapelInWay(us, vs)) continue;
          F.set(u, v, s <= 1 || s % 6 === 0 ? SEAM : shaded(STONE[1]));
          break;
        }
        continue;
      }
      // (the skull on the gable's peak the same on the screen either way: it is upright, and lit from the screen's left)
      const c = faceAt(v > CG_PEAK - 4 && v > gableTop(u) ? u : at(u), v, lit);
      if (c === null) continue;
      F.set(u, v, tone(c));
    }
  }
  const out = F.strips(alongX);
  if (lit) {
    // (alight, the maw gives the enemy's light: on the strip with the middle of the roundel)
    const mid = Math.floor(MID);
    const s0 = Math.floor(mid / STRIP) * STRIP;
    const strip = out.find((q) => q.t === s0 / 32);
    if (strip) {
      const j = mid - s0;
      strip.s.lights = [{ x: (alongX ? j : STRIP - 1 - j) / GRAIN, y: (F.anchorRow + Math.floor((j - 1) / 2) - MAW_Z) / GRAIN, r: 26, color: FLAME[2], a: 0.34 }];
    }
  }
  return out;
}

// =================================================================================================
// THE DROP: a grille of the dead's long bones bound with iron

/** Where its bones stand along the plane (their middles): eight, every twelve. */
export const CG_BONES = [18, 30, 42, 54, 66, 78, 90, 102];
/** How long each bone's point is. */
const POINT = 10;

/** The game's raise (0 to GATE_UP) as how far this drop is drawn up (0 to CG_LIFT), an even number. */
export function chapelLift(raise: number): number {
  const r = Math.max(0, Math.min(GATE_UP, raise));
  return Math.round((r * CG_LIFT) / GATE_UP / 2) * 2;
}

/**
 * HIS GATE'S DROP, `lift` picture pixels off the floor: the dead's long bones every twelve, five across, a knob where each
 * passes a strap, their ends cut to points; bound with straps of riveted iron; at the back of the arch, and what of it is not
 * in the way, or is behind the arch's thickness, is not there.
 */
export function makeChapelDrop(alongX: boolean, lift: number): Strip[] {
  const top = CG_SPRING + CG_R + 2;
  const F = new Flat(0, ARCH_WIDE, top);
  const put = (u: number, v: number, c: string): void => {
    if (chapelInWay(u, v) && chapelInWay(u + PILLAR, v + PILLAR)) F.set(u, v, alongX ? c : shaded(c));
  };
  const tall = top + 40;
  const straps: [number, number][] = [];
  for (let h = 16; h <= tall; h += 24) straps.push([h, 4]);
  // the bones
  for (const b of CG_BONES) {
    for (let h = 0; h <= tall; h++) {
      const knob = straps.some(([h0, th]) => (h >= h0 - 3 && h < h0) || (h >= h0 + th && h < h0 + th + 3));
      const half = h < POINT ? 2.5 * (h / POINT) + 0.3 : knob ? 3.5 : 2.5;
      for (let du = -4; du <= 4; du++) {
        if (Math.abs(du) > half) continue;
        const side = alongX ? du : -du;
        put(b + du, h + lift, h < 1 ? BONE[2] : side <= -2 ? BONE[4] : side < 0 ? BONE[3] : side < 2 ? BONE[2] : BONE[1]);
      }
      if (h >= POINT && Math.abs(half - 2.5) < 0.1) put(alongX ? b + 3 : b - 3, h + lift, SEAM);
    }
  }
  // the straps across them, riveted where they cross a bone
  for (const [h0, thick] of straps) {
    for (let u = PILLAR; u < PILLAR + SPAN; u++) {
      for (let q = 0; q < thick; q++) {
        const rivet = CG_BONES.some((b) => b === u) && q === Math.floor(thick / 2);
        put(u, h0 + q + lift, rivet ? BONE[4] : q === thick - 1 ? IRON[4] : q === 0 ? IRON[0] : IRON[3]);
      }
    }
  }
  return F.strips(alongX);
}

// =================================================================================================
// THE DROP'S FALL AND THE SLAM

/** How many frames the slam's dust and chips last (at 30 a second). */
export const CG_SLAM_FRAMES = 16;
/**
 * THE DROP, Movement 9: the game's raise (0 to GATE_UP) frame by frame at 30 a second from the moment the fight begins. Held at
 * the top, juddering, its chains slipping and catching (a third of a second); down in two frames; a hard landing
 * (`CHAPEL_SLAM_AT`: the dust and chips begin, the maw lights) and a bounce off the floor, then down for good.
 */
export const CHAPEL_GATE_DROP: readonly number[] = [60, 60, 56, 60, 60, 54, 60, 58, 52, 60, 24, 0, 0, 6, 8, 2, 0, 0];
export const CHAPEL_SLAM_AT = 11;

/** Bone dust off the flags, its belly to its lit top. */
const DUST_UP = ['#2c2724', '#3e3631', '#544a41', '#6c5f52'] as const;

/**
 * THE SLAM, frame `f` (0 to CG_SLAM_FRAMES - 1, from the landing): bone dust thrown off the flags both ways from the gate's foot
 * and rolling out low, thinning; chips of bone struck off the points flying out and falling. Anchored at the middle of the gate's
 * foot on the floor (the middle of the doorway at the back of the arch: `at(1.5, PILLAR / 32)` in render.ts's measure), to be
 * stood just in front of it.
 */
export function chapelGateSlam(alongX: boolean, f: number): Sprite {
  const W = 280;
  const Hh = 180;
  const AX = W / 2;
  const AY = 104;
  const p = new Px(W, Hh);
  const sc = (a: number, q: number, h: number): [number, number] => [Math.round(AX + (alongX ? a - q : q - a)), Math.round(AY + (a + q) / 2 - h)];
  const puffs: { a: number; q: number; h: number; rx: number; ry: number; k: number }[] = [];
  for (let i = 0; i < 24; i++) {
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
    puffs.push({ a: a0 + drift, q: out, h, rx, ry, k: i });
  }
  puffs.sort((m, n) => m.a + m.q - (n.a + n.q));
  const thin = Math.max(0, (f - 3) / (CG_SLAM_FRAMES - 3));
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
  for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
    if (!p.has(x, y)) continue;
    let nb = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && p.has(x + dx, y + dy)) nb++;
    if (nb === 0) p.erase(x, y);
  }
  // THE CHIPS: bone struck off the points, flying out both ways and falling, each a little shard two pixels long
  for (const b of CG_BONES) {
    for (let n = 0; n < 3; n++) {
      const key = b * 7 + n;
      const life = 6 + Math.floor(hash(key, 1, 771) * 6);
      if (f > life) continue;
      const va = (hash(key, 2, 772) - 0.5) * 4.4;
      const vq = (hash(key, 3, 773) < 0.5 ? -1 : 1) * (1.2 + hash(key, 4, 774) * 1.8);
      const vh = 2.4 + hash(key, 5, 775) * 2.4;
      const [x1, y1] = sc(b - MID + va * (f + 1), vq * (f + 1), Math.max(0, vh * (f + 1) - 0.42 * (f + 1) * (f + 1)));
      const tilt = (key + f) % 2;
      p.set(x1, y1, BONE[4]).set(x1 + 1, y1 + tilt, BONE[3]).set(x1, y1 + 1, BONE[1]);
    }
  }
  return p.sprite(AX, AY, GRAIN);
}

/** The drop, frame by frame at 30 a second (`frame` from the moment the fight begins): the game's raise, the slam's frame (-1: none yet, or over), and whether the maw is alight. */
export function chapelGateDropAt(frame: number): { raise: number; slam: number; lit: boolean } {
  const i = Math.max(0, Math.floor(frame));
  const raise = CHAPEL_GATE_DROP[Math.min(i, CHAPEL_GATE_DROP.length - 1)];
  const s = i - CHAPEL_SLAM_AT;
  return { raise, slam: s >= 0 && s < CG_SLAM_FRAMES ? s : -1, lit: s >= 0 };
}

// =================================================================================================

let made: GateArt | null = null;
/**
 * FLOOR 4'S DOORS AND GATES WITH HIS OWN (a GateArt, as art/gates.ts's): the boss's pillar, arch and drop his gate's (above);
 * everything else floor 4's own (art/floor4.ts, ossuaryGates), in look A's colours: its doors, its plain gates, its levers, its
 * seals.
 */
export function makeChapelGateArt(): GateArt {
  if (made) return made;
  const base = ossuaryGates();
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
      return pillar ?? (pillar = makeChapelPillar());
    },
    arch(alongX, boss, lit) {
      if (!boss) return kept(`arch${alongX}${lit}`, () => g(base.arch(alongX, false, lit)));
      return kept(`boss arch${alongX}${lit}`, () => makeChapelArch(alongX, lit));
    },
    portcullis(alongX, boss, raise) {
      if (!boss) return kept(`gate${alongX}${raise}`, () => g(base.portcullis(alongX, false, raise)));
      const lift = chapelLift(raise);
      return kept(`drop${alongX}${lift}`, () => makeChapelDrop(alongX, lift));
    },
  };
  return made;
}
