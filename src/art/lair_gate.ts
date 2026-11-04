// FLOOR 5, THE MINE THAT BECOMES HIS TEMPLE: THE FLESHMANCER'S OWN GATE, READY FOR THE GAME (the art chat, 2 Nov 2026). Behind
// the switch LAIR_GATE, off; nothing of the game imports it until the main chat puts it in (floor 5's boss doorway, with
// LAIR_TEMPLE on).
//
// His words of the bosses' gates: “Its own arch, and we’ll need new ones for the other new levels as well”. Drawn with the three
// looks of floor 5 (the same gate in all three, docs/mockups/floor5_look) and made ready in his pick of them, 2 Nov 2026: “A,
// through the threshold (Recommended)”.
//
// WHAT IS PAINTED HERE (a GateArt, art/gates.ts: all but the boss's pillar, arch and portcullis are floor 5's own, in look A's
// colours), an original design: the temple cut out of the mine, at its door.
//   THE PILLARS: BATTERED PYLONS of the temple's black worked stone, leaning in as they rise, a channel cut down each face, on a
//     plinth; their footprint the game's pillar.
//   THE ARCH: A LINTEL, one great slab (92 to 112), its band notched, ITS UNDERSIDE CUT INTO A ROW OF FANGS, long and short,
//     hanging over the way; over it the dressed stone gives out to THE MINE'S RAW ROCK, unhewn, rising to a ragged crest (198),
//     its top going back as thick as the pylons; and carved out of the rock THE SHRIEKING SKULL, the cult's mark, great (60
//     across, its middle at 148), its jaw dropped wide, the enemy's fire dull and low in its sockets and its mouth, in embers
//     (never in rings); `lit` (the drop down behind the hero, the fight on) its sockets and mouth ALIGHT, the enemy's pink
//     burning to gold, and it gives the enemy's light.
//   THE DROP at the back of the way: bars of black iron every twelve, straps across them riveted, their ends HOOKED toward the
//     middle like a jaw's teeth; drawn up (the game's raise of GATE_UP) its hooks hang at 72 (a hero is 56).
//   THE DROP'S FALL (Movement 9, his rule: “Like the wind up and wind down are big but the actual punch is lightning quick”):
//     held juddering at the top, down in two frames, a hard landing and a bounce (`LAIR_GATE_DROP`); THE SLAM, stones and grit
//     shaken off the rock over it, falling, and the mine's dust thrown off the floor both ways (`lairGateSlam`).
// Light from the upper left: the face along x lit, along y in shade; nothing glows cyan (the friend's); the skull's fire the
// enemy's, and the only pink.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { Flat, GATE_UP, PILLAR, SPAN, ARCH_WIDE, STRIP } from './gates';
import type { GateArt, Strip } from './gates';
import { lairGates, shriekAt } from './floor5';
import { GRAIN, hash } from './kit';
import { FLAME } from './mkit';
import { BONE, Deep, ROCK, gradeSprite, litTone, noLone, noise, rawRock } from './lair_temple';

/** THE SWITCH: off until the main chat puts it in, on his yes. */
export const LAIR_GATE = { on: false };

/** His gate's stone: the temple's, a tone lifted (the gate is the way on, and is seen from across the dark). */
const STONE = ['#0e0c13', '#1a1722', '#25212e', '#332e3e', '#4a4359'] as const;
const IRON = ['#09090b', '#18171b', '#262329', '#38333d', '#55505c'] as const;
const SEAM = '#07060a';
const BEYOND = '#050407';

// =================================================================================================
// MEASURES (picture pixels, two to a game pixel; u along the plane from the outer edge of the first pillar, v up)

/** The lintel: its underside over the way, its top; the fangs hanging from its underside, the longest; the arch's lowest point (the fangs' tips). */
export const LG_UNDER = 92;
export const LG_TOP = 112;
export const LG_FANG = 10;
export const LG_SPRING = LG_UNDER - LG_FANG;
/** The skull carved in the rock over it: its middle's height, its half width; the rock's crest at its highest. */
export const LG_SKULL = { z: 148, r: 30 };
export const LG_PEAK = 198;
/** How far up the drop is drawn when the gate is open (the game's raise of GATE_UP): its hooks under the fangs. */
export const LG_LIFT = 72;
/** The gate is as thick as its pillars: the rock's top runs back that far. */
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

/** A fang hanging from the lintel's underside at a place (du from the way's middle, v): its colour, or null. Long and short by turns. */
function fangAt(du: number, v: number): string | null {
  if (Math.abs(du) >= 48 || v >= LG_UNDER || v < LG_SPRING) return null;
  // (four each side of the middle, the same either side: long, short, long, short from the middle out)
  const i = Math.floor(Math.abs(du) / 12);
  const fx = (Math.abs(du) % 12 - 6) * Math.sign(du);
  const len = i % 2 ? LG_FANG * 0.6 : LG_FANG;
  const from = LG_UNDER - v;
  if (from > len) return null;
  const half = 4.6 * (1 - from / len) + 0.6;
  if (Math.abs(fx) >= half) return null;
  return fx < -half + 1.5 ? STONE[4] : fx < 0 ? STONE[3] : STONE[1];
}
/** Is a place in the way through (u, v in the plane): between the pillars, under the lintel and clear of its fangs? */
export function lairInWay(u: number, v: number): boolean {
  if (u < PILLAR || u >= PILLAR + SPAN || v < 0 || v >= LG_UNDER) return false;
  return fangAt(u + 0.5 - MID, v) === null;
}
/** The rock's crest over a place along the plane (du from its middle). */
function crestOf(du: number): number {
  // (ragged, but the same either side of its middle: the gate is one shape seen along x or along y)
  const a = Math.abs(du);
  return LG_TOP + 6 + (LG_PEAK - LG_TOP - 6) * Math.max(0, 1 - Math.pow(a / (MID + 4), 1.3)) + (noise(a / 5, 3, 51) - 0.5) * 18 + (hash(Math.floor(a / 9), 1, 53) > 0.7 ? 8 : 0);
}

// =================================================================================================
// THE GATE'S FACE

/** The gate's face at a point (u from the outer edge of the pillar toward the light, v over the floor), from the fangs' tips up; null where nothing is. */
function faceAt(u: number, v: number, lit: boolean): string | null {
  const S = STONE;
  const du = u + 0.5 - MID;
  const a = Math.abs(du);
  if (v < LG_UNDER) return fangAt(du, v);
  // THE LINTEL: a single great slab over the pylons, its band notched
  if (v < LG_TOP) {
    if (u < 0 || u >= ARCH_WIDE) return null;
    if (v === LG_TOP - 1) return S[4];
    if (v === LG_UNDER) return SEAM;
    if (u === 0) return S[4];
    if (u === ARCH_WIDE - 1) return S[0];
    if (v === LG_TOP - 3 || v === LG_UNDER + 3) return S[1];
    if (v > LG_UNDER + 3 && v < LG_TOP - 3 && Math.abs((((du + 400) % 10) + 10) % 10 - 5) < 1) return S[1];
    return S[3];
  }
  // OVER IT: THE RAW ROCK, its outline ragged, rising to a crest over the middle; THE SKULL carved out of it
  const crest = crestOf(du);
  if (v > crest || a > MID - 1) return null;
  const R = ROCK;
  const j = v + 0.5 - LG_SKULL.z;
  const m = shriekAt(du / LG_SKULL.r, j / LG_SKULL.r);
  if (m === 'dark') {
    const inMouth = j < -0.24 * LG_SKULL.r;
    const ember = hash(Math.floor(du + 60), Math.floor(v), 977);
    if (lit) {
      // ALIGHT: the enemy's fire filling its sockets and its mouth, pink at their rims burning to gold at their hearts (in tongues)
      const mid = inMouth ? -0.6 * LG_SKULL.r : 0.2 * LG_SKULL.r;
      const half = inMouth ? 0.38 * LG_SKULL.r : 0.16 * LG_SKULL.r;
      const heat = 1 - Math.abs(j - mid) / (half + 4) - (inMouth ? Math.abs(du) / 14 : Math.abs(Math.abs(du) - 9) / 10) + (ember - 0.5) * 0.3;
      return heat > 0.62 ? FLAME[4] : heat > 0.4 ? FLAME[3] : heat > 0.18 ? FLAME[2] : FLAME[1];
    }
    // in embers: the enemy's fire, dull and low in its sockets and its mouth (never in rings)
    const lowIn = inMouth ? j < -0.84 * LG_SKULL.r : j < 0.2 * LG_SKULL.r - 2;
    if (lowIn) return ember < 0.6 ? FLAME[1] : FLAME[0];
    if (inMouth && j < -0.7 * LG_SKULL.r) return ember < 0.35 ? FLAME[0] : BEYOND;
    return BEYOND;
  }
  if (m === 'bone') {
    // carved bone-pale out of the black rock: relief lit toward the upper left
    const B = BONE;
    if (!shriekAt((du - 1.5) / LG_SKULL.r, (j + 1.5) / LG_SKULL.r)) return B[3];
    if (!shriekAt((du + 1.5) / LG_SKULL.r, (j - 1.5) / LG_SKULL.r)) return B[0];
    if (Math.abs(noise(du / 5, j / 5, 61) - 0.5) < 0.03) return B[0];
    return a < LG_SKULL.r * 0.3 && j > 0 ? B[2] : B[1];
  }
  // round the skull, the rock cut back, dark
  if (shriekAt(du / (LG_SKULL.r + 4), j / (LG_SKULL.r + 4))) return SEAM;
  if (v > crest - 2) return R[4];
  // where the dressed stone gives out to the rock over the lintel: a ragged course or two of it
  if (v < LG_TOP + 6 + (hash(Math.floor(du / 7), 2, 55) - 0.5) * 6) return (u + Math.floor(v / 6) * 5) % 13 === 0 || v % 6 === 5 ? SEAM : S[2];
  return rawRock(Math.floor(du + 300), v, 53);
}

// =================================================================================================
// THE PILLAR: a battered pylon

/** The pylon's top (where the lintel rests), how far its faces lean in by its top (tiles), its plinth. */
const PYLON = { top: LG_UNDER, lean: 0.075, plinth: 10 };

/**
 * A PILLAR OF HIS GATE: a battered pylon of the black worked stone, its faces leaning in as they rise, a channel cut down each,
 * in courses, on a plinth. Its footprint the game's pillar (PILLAR each way, behind its front corner); one picture for a gate
 * either way. Anchored at its front corner on the floor.
 */
export function makeLairPillar(): Sprite {
  const high = PYLON.top;
  const W = 40;
  const H = high + 30;
  const AX = 20;
  const AY = high + 20;
  const p = new Px(W, H);
  const D = new Deep(p, AX, AY);
  const P = PILLAR / 32;
  const c = -P / 2;
  const half = (z: number): number => (z < PYLON.plinth ? P / 2 : P / 2 - 0.02 - PYLON.lean * ((z - PYLON.plinth) / (high - PYLON.plinth)));
  D.march({
    box: { x0: -P, y0: -P, z0: 0, x1: 0, y1: 0, z1: high },
    inside: (x, y, z) => Math.abs(x - c) < half(z) && Math.abs(y - c) < half(z),
    shade: (x, y, z, face) => {
      if (z < PYLON.plinth) {
        if (z >= PYLON.plinth - 1) return STONE[4];
        return STONE[face === 'z' ? 4 : face === 'y' ? 3 : face === 'x' ? 1 : 2];
      }
      if (face === 'z' || z >= high - 1) return STONE[4];
      // (its faces lean back: their normals tip up a little)
      const ny = face === 'y' ? 1 : 0;
      const nx = face === 'x' ? 1 : 0;
      let k = litTone(nx, ny, 0.25);
      // courses every eighteen, a channel cut down the middle of each face, its edge toward the light lit
      if ((Math.floor(z) - PYLON.plinth) % 18 === 17) return SEAM;
      const across = face === 'y' ? x - c : y - c;
      if (Math.abs(across) < 0.03) k -= 2;
      else if (Math.abs(across + 0.045) < 0.016) k += 1;
      const h = half(z);
      if (face === 'y' && x > c + h - 0.02) k += 1;
      return STONE[clampK(k)];
    },
  }, 0.004);
  noLone(p);
  return p.sprite(AX, AY, GRAIN);
}

// =================================================================================================
// THE ARCH: the lintel and its fangs, the rock and the skull

/** HIS GATE'S FACE from the outer edge of one pillar to the outer edge of the other, from the fangs' tips to the rock's crest (its top going back as thick as the pylons): the skull in embers, or `lit` alight (and then it gives light). */
export function makeLairArch(alongX: boolean, lit: boolean): Strip[] {
  const F = new Flat(0, ARCH_WIDE + 16, LG_PEAK + 18 + DEEP);
  // (the face's pattern laid with its light from the screen's left: along y the plane runs the other way)
  const at = (u: number): number => (alongX ? u : ARCH_WIDE - 1 - u);
  const tone = (c: string): string => (alongX ? c : shaded(c));
  // THE ROCK'S TOP, going back as thick as the pylons (painted first: the face over it)
  for (let u = 1; u < ARCH_WIDE - 1; u++) {
    const du = at(u) + 0.5 - MID;
    if (Math.abs(du) > MID - 1) continue;
    const g = Math.floor(crestOf(du));
    // (only its lip: further back it is lost against the dark)
    for (let s = 1; s <= 2; s++) F.set(u + s, g + s - 1, tone(s === 1 ? ROCK[4] : ROCK[2]));
  }
  for (let v = LG_SPRING; v < F.high; v++) {
    for (let u = 0; u < ARCH_WIDE; u++) {
      const c = faceAt(at(u), v, lit);
      if (c === null) continue;
      F.set(u, v, tone(c));
    }
  }
  const out = F.strips(alongX);
  if (lit) {
    // (alight, the skull gives the enemy's light: on the strip with the middle of its mouth)
    const mid = Math.floor(MID);
    const s0 = Math.floor(mid / STRIP) * STRIP;
    const strip = out.find((q) => q.t === s0 / 32);
    if (strip) {
      const j = mid - s0;
      strip.s.lights = [{ x: (alongX ? j : STRIP - 1 - j) / GRAIN, y: (F.anchorRow + Math.floor((j - 1) / 2) - (LG_SKULL.z - 10)) / GRAIN, r: 30, color: FLAME[2], a: 0.36 }];
    }
  }
  return out;
}

// =================================================================================================
// THE DROP: bars of black iron, their ends hooked like a jaw's teeth

/** Where its bars stand along the plane (their middles): eight, every twelve. */
export const LG_BARS = [18, 30, 42, 54, 66, 78, 90, 102];
/** How long each bar's hook is. */
const HOOK = 6;

/** The game's raise (0 to GATE_UP) as how far this drop is drawn up (0 to LG_LIFT), an even number. */
export function lairLift(raise: number): number {
  const r = Math.max(0, Math.min(GATE_UP, raise));
  return Math.round((r * LG_LIFT) / GATE_UP / 2) * 2;
}

/**
 * HIS GATE'S DROP, `lift` picture pixels off the floor: bars of black iron every twelve, their ends hooked toward the way's middle
 * like a jaw's teeth; straps across them, riveted; at the back of the way, and what of it is not in the way, or is behind the
 * gate's thickness, is not there.
 */
export function makeLairDrop(alongX: boolean, lift: number): Strip[] {
  const top = LG_UNDER + 2;
  const F = new Flat(0, ARCH_WIDE, top);
  const put = (u: number, v: number, c: string): void => {
    if (lairInWay(u, v) && lairInWay(u + PILLAR, v + PILLAR)) F.set(u, v, alongX ? c : shaded(c));
  };
  const tall = top + 40;
  const straps: number[] = [];
  for (let h = HOOK; h <= tall; h += 24) straps.push(h);
  for (const b of LG_BARS) {
    const dir = b < MID ? 1 : -1;
    for (let h = 0; h <= tall; h++) {
      // (the hook: bent toward the middle, thinning to its point)
      const hook = h < HOOK ? dir * (HOOK - h) * 0.75 : 0;
      const half = h < 2 ? 0.6 : 1.6;
      for (let du = -6; du <= 6; du++) {
        const x = du - hook;
        if (Math.abs(x) > half) continue;
        const side = alongX ? x : -x;
        put(b + du, h + lift, h < 1 ? IRON[2] : side < -0.6 ? IRON[4] : side < 0.6 ? IRON[2] : IRON[1]);
      }
    }
  }
  for (const h0 of straps) {
    for (let u = PILLAR; u < PILLAR + SPAN; u++) {
      for (let q = 0; q < 3; q++) {
        const rivet = LG_BARS.includes(u) && q === 1;
        put(u, h0 + q + lift, rivet ? IRON[4] : q === 2 ? IRON[3] : q === 0 ? IRON[0] : IRON[2]);
      }
    }
  }
  return F.strips(alongX);
}

// =================================================================================================
// THE DROP'S FALL AND THE SLAM

/** How many frames the slam's stones, grit and dust last (at 30 a second). */
export const LG_SLAM_FRAMES = 16;
/**
 * THE DROP, Movement 9: the game's raise (0 to GATE_UP) frame by frame at 30 a second from the moment the fight begins. Held at
 * the top, juddering, its chains slipping and catching (a third of a second); down in two frames; a hard landing
 * (`LAIR_SLAM_AT`: the stones and dust begin, the skull lights) and a bounce off the floor, then down for good.
 */
export const LAIR_GATE_DROP: readonly number[] = [60, 60, 56, 60, 60, 54, 60, 58, 52, 60, 24, 0, 0, 6, 8, 2, 0, 0];
export const LAIR_SLAM_AT = 11;

/** The mine's dust off the floor, its belly to its lit top. */
const DUST_UP = ['#2a211b', '#3b2f26', '#504134', '#675442'] as const;

/**
 * THE SLAM, frame `f` (0 to LG_SLAM_FRAMES - 1, from the landing): stones and grit shaken off the rock over the lintel, falling
 * before the gate and striking the floor; the mine's dust thrown off the floor both ways from the gate's foot and rolling out low,
 * thinning. Anchored at the middle of the gate's foot on the floor (the middle of the doorway at the back of the way: `at(1.5,
 * PILLAR / 32)` in render.ts's measure), to be stood just in front of it.
 */
export function lairGateSlam(alongX: boolean, f: number): Sprite {
  const W = 280;
  const Hh = 240;
  const AX = W / 2;
  const AY = 200;
  const p = new Px(W, Hh);
  const sc = (a: number, q: number, h: number): [number, number] => [Math.round(AX + (alongX ? a - q : q - a)), Math.round(AY + (a + q) / 2 - h)];
  // THE DUST, off the floor both ways
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
  const thin = Math.max(0, (f - 3) / (LG_SLAM_FRAMES - 3));
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
  // THE STONES AND GRIT off the rock over the lintel: falling (from rest, a little out from the face), striking the floor, lying
  for (let i = 0; i < 26; i++) {
    const big = i < 9;
    const a = (hash(i, 1, 781) - 0.5) * 96;
    const q0 = 13 + hash(i, 2, 782) * 4;
    const h0 = LG_TOP + 4 + hash(i, 3, 783) * (LG_PEAK - LG_TOP - 30);
    const start = Math.floor(hash(i, 4, 784) * 5);
    const t = f - start;
    if (t < 0) continue;
    const g = 2.4;
    let h = h0 - 0.5 * g * t * t;
    let q = q0 + t * (0.4 + hash(i, 5, 785) * 0.5);
    if (h < 0) {
      // (struck the floor: a hop, then it lies)
      const tLand = Math.sqrt((2 * h0) / g);
      const after = t - tLand;
      h = Math.max(0, (big ? 3 : 1.5) * after - 0.6 * after * after);
      q = q0 + tLand * (0.4 + hash(i, 5, 785) * 0.5) + Math.min(after, 4) * 0.8;
      if (!big && after > 3) continue;
    }
    const [x, y] = sc(a, q, h);
    if (big) {
      p.set(x, y - 1, ROCK[4]).set(x + 1, y - 1, ROCK[3]).set(x, y, ROCK[3]).set(x + 1, y, ROCK[2]).set(x + 2, y, ROCK[1]).set(x - 1, y, ROCK[3]);
      p.set(x, y + 1, ROCK[1]).set(x + 1, y + 1, SEAM);
    } else {
      p.set(x, y, ROCK[3]).set(x, y + 1, ROCK[1]);
    }
  }
  return p.sprite(AX, AY, GRAIN);
}

/** The drop, frame by frame at 30 a second (`frame` from the moment the fight begins): the game's raise, the slam's frame (-1: none yet, or over), and whether the skull is alight. */
export function lairGateDropAt(frame: number): { raise: number; slam: number; lit: boolean } {
  const i = Math.max(0, Math.floor(frame));
  const raise = LAIR_GATE_DROP[Math.min(i, LAIR_GATE_DROP.length - 1)];
  const s = i - LAIR_SLAM_AT;
  return { raise, slam: s >= 0 && s < LG_SLAM_FRAMES ? s : -1, lit: s >= 0 };
}

// =================================================================================================

let made: GateArt | null = null;
/** Its pictures let go (its floor left: render.ts forgetLooks; his “it’s crashing every couple of levels”), made again if wanted. */
export function forgetMade(): void {
  made = null;
}
/**
 * FLOOR 5'S DOORS AND GATES WITH HIS OWN (a GateArt, as art/gates.ts's): the boss's pillar, arch and drop his gate's (above);
 * everything else floor 5's own (art/floor5.ts, lairGates), in look A's colours: its doors of lashed logs and their frames, its
 * levers and seals, the mine's (warmed); its plain gates of the cult's stone, the temple's (cooled).
 */
export function makeLairGateArt(): GateArt {
  if (made) return made;
  const base = lairGates();
  const g = (list: Strip[], part: 'mine' | 'temple'): Strip[] => list.map((q) => ({ s: gradeSprite(q.s, part), t: q.t }));
  const memo = new Map<string, Strip[]>();
  const kept = (key: string, make: () => Strip[]): Strip[] => {
    let s = memo.get(key);
    if (!s) memo.set(key, (s = make()));
    return s;
  };
  let pillar: Sprite | null = null;
  made = {
    post: gradeSprite(base.post, 'mine'),
    lintel: (alongX) => kept(`lintel${alongX}`, () => g(base.lintel(alongX), 'mine')),
    leaf: (ex, ey) => gradeSprite(base.leaf(ex, ey), 'mine'),
    lever: (pulled) => gradeSprite(base.lever(pulled), 'mine'),
    seal: (ex, ey, word, lit) => gradeSprite(base.seal(ex, ey, word, lit), 'mine'),
    pillar(boss) {
      if (!boss) return gradeSprite(base.pillar(false), 'temple');
      return pillar ?? (pillar = makeLairPillar());
    },
    arch(alongX, boss, lit) {
      if (!boss) return kept(`arch${alongX}${lit}`, () => g(base.arch(alongX, false, lit), 'temple'));
      return kept(`boss arch${alongX}${lit}`, () => makeLairArch(alongX, lit));
    },
    portcullis(alongX, boss, raise) {
      if (!boss) return kept(`gate${alongX}${raise}`, () => g(base.portcullis(alongX, false, raise), 'temple'));
      const lift = lairLift(raise);
      return kept(`drop${alongX}${lift}`, () => makeLairDrop(alongX, lift));
    },
  };
  return made;
}
