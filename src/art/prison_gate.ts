// FLOOR 3, THE BLACK IRON PRISON: THE CHAINED ONE'S OWN GATE, READY FOR THE GAME (the art chat, 2 Nov 2026). Behind the switch
// PRISON_GATE, off; nothing of the game imports it until the main chat puts it in (floor 3's boss doorway, with PRISON on).
//
// His words of the bosses' gates: “Its own arch, and we’ll need new ones for the other new levels as well”. Drawn with the three
// looks of floor 3 (the same gate in all three) and his pick of them, 2 Nov 2026, by 07:52: “B, torchlit dark (Recommended)”.
//
// WHAT IS PAINTED HERE (a GateArt, art/gates.ts: all but the boss's pillar, arch and portcullis are floor 3's own):
//   THE PILLARS: square, clad in riveted black iron, a plinth and a capital, up to the spring at 64.
//   THE ARCH: iron voussoirs over the three tiles of the way (its crown 112 over the floor), a rivet in each; the face over
//     and about it plated in riveted iron up to a cornice at 150, a row of iron spikes along it, taller over the middle; on a
//     tall keystone HIS MARK, the iron face-cage he wore, cast in the plate, the enemy's embers behind its eye-slits (dull);
//     `lit` (once the gate has fallen) the cage alight, pink burning to gold, and it gives the enemy's light; two great rings
//     on the face's upper corners, a chain slung between them over the arch. Through the way, the arch's iron underside.
//   THE PORTCULLIS at the back of the arch: bars five wide every twelve, each to a spike, a heavy rail over the spikes, a
//     second higher; drawn up (the game's raise of GATE_UP) its spikes hang at 90 under the crown.
//   THE DROP (Movement 9, his rule: “Like the wind up and wind down are big but the actual punch is lightning quick”): held
//     juddering at the top, down in two frames, a hard landing and a bounce (`PRISON_GATE_DROP`); THE SLAM, soot thrown off
//     the floor both ways and sparks off the spikes (`prisonGateSlam`).
// Light from the upper left: the face along x lit, along y in shade; nothing glows cyan (the friend's); the mark's fire the
// enemy's; the sparks an honest orange.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { Flat, GATE_UP, PILLAR, SPAN, ARCH_WIDE, STRIP } from './gates';
import type { GateArt, Strip } from './gates';
import { chainedGates } from './floor3';
import { GRAIN, hash } from './kit';
import { FLAME } from './mkit';
import { EMBER } from './props';

/** His gate's black iron: the prison's, a tone lifted (the gate is the way on, and is seen from across the dark). */
const IRON = ['#0e0e12', '#222128', '#302e37', '#43404b', '#6a6473'] as const;

/** THE SWITCH: off until the main chat puts it in, on his yes. */
export const PRISON_GATE = { on: false };

// =================================================================================================
// MEASURES (picture pixels, two to a game pixel; u along the plane from the outer edge of the first pillar, v up)

/** Where the arch springs from the pillars, its inner and outer radius (the way: the game's three tiles), its crown. */
export const PG_SPRING = 64;
const R_IN = SPAN / 2;
const R_OUT = 66;
/** The face's cornice, and the spikes over it (the tallest over the middle). */
export const PG_FACE = 150;
const SPIKE_LOW = 12;
const SPIKE_HIGH = 18;
/** How far up the portcullis is drawn when the gate is open (the game's raise of GATE_UP): its spikes under the crown. */
export const PG_LIFT = 90;
/** The gate is as thick as its pillars: the cornice's top runs back that far. */
const DEEP = PILLAR;
/** His mark on the keystone: its middle over the spring. */
const MARK_UP = 58;

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
/** A face turned to screen-right, in shade (as art/floorkit.ts `shaded`). */
const shaded = (c: string): string => mixC(c, '#06051a', 0.32);
const SEAM = '#08080c';
const BEYOND = '#040406';
const FIRE = new Set<string>([...FLAME]);

/** Is a place in the way through (u, v in the plane): between the pillars, under the arch? */
export function prisonInWay(u: number, v: number): boolean {
  if (u < PILLAR || u >= PILLAR + SPAN || v < 0) return false;
  return v < PG_SPRING || Math.hypot(u + 0.5 - MID, v + 0.5 - PG_SPRING) < R_IN;
}

// =================================================================================================
// HIS MARK: the iron face-cage he wore, cast in the keystone's plate

/** The keystone at (du across from the middle, toward the screen's left lit; dz over the spring), with the mark: a tone 0..4 of the iron, or a fire's colour. */
function keystone(du: number, dz: number, lit: boolean): number | string {
  if (Math.abs(du) >= 9) return du < 0 ? 4 : 0;
  const ex = du / 7;
  const ez = (dz - MARK_UP) / 11;
  const e = Math.hypot(ex, ez);
  if (e < 1) {
    // its rim
    if (e > 0.8) return ex < 0 ? 4 : 1;
    // the eyes: two slits, the enemy's embers behind them (dull, the gate not yet fallen; alight once it has)
    const eye = Math.abs(dz - (MARK_UP + 3)) <= 1 && Math.abs(Math.abs(du) - 3) <= 1.5;
    if (eye) return lit ? FLAME[4] : Math.abs(dz - (MARK_UP + 3)) < 0.6 ? FLAME[1] : FLAME[0];
    // the bars of the cage over it: three uprights and one across the mouth
    if (Math.abs(du) % 4 < 1.2 || Math.abs(dz - (MARK_UP - 4)) < 1) return Math.abs(du) % 4 < 0.6 ? 3 : 2;
    // behind the bars: the dark of a face; alight, the enemy's fire
    if (lit) return e < 0.45 ? FLAME[3] : e < 0.65 ? FLAME[2] : FLAME[1];
    return -1;
  }
  // a rivet at each corner of the plate
  if ((Math.abs(dz - 22) <= 1 || Math.abs(dz - 82) <= 1) && Math.abs(Math.abs(du) - 5) <= 1) return 4;
  return du < -6 ? 3 : 2;
}

/**
 * THE GATE'S FACE at a point (u from the outer edge of the pillar toward the light, v over the floor), from the springing up:
 * the arch's voussoirs, the keystone and the mark, the plated face, the cornice, the spikes; null where there is nothing (the
 * way through, over the spikes). A tone 0..4 of the iron, -1 the dark, or a fire's colour.
 */
function faceAt(u: number, v: number, lit: boolean): number | string | null {
  const du = u + 0.5 - MID;
  const dz = v + 0.5 - PG_SPRING;
  const r = Math.hypot(du, Math.max(0, dz));
  if (Math.abs(du) < R_IN && (dz <= 0 || r < R_IN)) return null;
  // THE SPIKES along the top, over the cornice
  if (v >= PG_FACE + 8) {
    // (one every twelve, set out from the middle so that the row is the same both ways)
    const s = (((u + 0.5 - MID) % 12) + 12) % 12;
    const tall = Math.abs(du) < 8 ? SPIKE_HIGH : SPIKE_LOW;
    const h = v - PG_FACE - 8;
    const half = 2.5 * (1 - h / tall);
    if (h < tall && Math.abs(s - 6) <= half) return s < 6 ? 3 : 1;
    return null;
  }
  // THE CORNICE, projecting: a lit top edge, a dark underside
  if (v >= PG_FACE) return v >= PG_FACE + 6 ? 4 : v >= PG_FACE + 3 ? 3 : v === PG_FACE ? 0 : 1;
  // THE ARCH: iron voussoirs between R_IN and R_OUT, a seam between each, a rivet in each; the keystone tall
  const ang = Math.atan2(Math.max(0, dz), -du); // 0 at the end toward the light, PI at the other
  if (dz > -1 && r < R_OUT) {
    const seg = Math.floor((ang / Math.PI) * 9);
    const into = (ang / Math.PI) * 9 - seg;
    if (seg === 4) return keystone(du, dz, lit);
    if (into < 0.06 || r < R_IN + 1.2) return r < R_IN + 1.2 ? 4 : 0;
    if (Math.abs(into - 0.5) < 0.09 && Math.abs(r - (R_IN + R_OUT) / 2) < 1.2) return 4;
    if (into < 0.14) return 3;
    return r > R_OUT - 2 ? 0 : r > R_OUT - 4 ? 3 : seg % 2 ? 1 : 2;
  }
  if (Math.abs(du) < 10 && dz > 0 && dz < PG_FACE - PG_SPRING) return keystone(du, dz, lit);
  // THE FACE over and about the arch: plates of iron in courses, riveted along their seams, lit toward the light
  const row = Math.floor(v / 20);
  const lv = v % 20;
  const off = row % 2 ? 0 : 15;
  const lu = (u + off + 400) % 30;
  if (u === 0) return 4;
  if (u === ARCH_WIDE - 1) return 0;
  if (lv === 19 || lu === 0) return -1;
  if ((lv === 2 || lv === 16) && lu % 6 === 3) return 4;
  if (lv === 18 || lu === 1) return 3;
  if (lv === 17) return 2;
  return (Math.floor((u + off + 400) / 30) + row) % 3 === 0 ? 2 : 1;
}

/** A tone of the iron, or a fire's colour, or the dark, as the face has it: in shade along y. */
function colourOf(t: number | string, alongX: boolean): string {
  if (typeof t === 'string') return t;
  const c = t < 0 ? SEAM : IRON[clampK(t)];
  return alongX ? c : shaded(c);
}

// =================================================================================================
// THE PILLAR

/**
 * A PILLAR OF HIS GATE: square, each face PILLAR wide, up to the spring; clad in riveted black iron, a plinth at its foot, a
 * capital the arch springs from; its corner toward the light lit (one picture for a gate either way: its lit face is the
 * jamb in a wall along +y, its shaded one in a wall along +x). Anchored at its front corner, on the floor.
 */
export function makePrisonPillar(high = PG_SPRING): Sprite {
  const HW = PILLAR;
  const p = new Px(HW * 2 + 8, high + 26);
  const cx = HW + 4;
  const base = high + 16;
  for (let dx = -HW; dx < HW; dx++) {
    const left = dx < 0;
    const pu = left ? dx + HW : HW - 1 - dx;
    const drop = -HW / 2 + Math.floor((pu - 1) / 2);
    for (let v = 0; v < high; v++) {
      let k: number;
      if (v < 8) k = v === 7 ? 4 : v === 0 ? 0 : pu === 0 && left ? 3 : 2;
      else if (v >= high - 6) k = v === high - 6 ? 0 : v >= high - 2 ? 4 : 3;
      else if (pu === 0 || pu === PILLAR - 1) k = left && pu === 0 ? 4 : 0;
      else if ((pu === 3 || pu === 8) && v % 12 === 6) k = 4;
      else if (v % 24 === 0) k = 0;
      else if (v % 24 === 1) k = 3;
      else k = pu < 3 ? 2 : 1;
      // (the corner toward the light lit; the back of the jamb a seam)
      if (dx === -1 && k > 0) k -= 1;
      const c = IRON[clampK(k)];
      p.set(cx + dx, base + drop - v, left ? c : shaded(c));
    }
  }
  return p.sprite(cx, base, GRAIN);
}

// =================================================================================================
// THE ARCH AND THE FACE

/** The two great rings on the face's upper corners (u, v), and the chain slung between them. */
const RINGS: [number, number][] = [[7, 132], [ARCH_WIDE - 8, 132]];

/**
 * HIS GATE'S FACE, from the outer edge of one pillar to the outer edge of the other, from the springing to the spikes: the
 * arch, the keystone and his mark (in embers, or `lit` alight, and then it gives light), the plated face, the cornice and its
 * top a pillar's thickness back, the spikes, the two rings and their chain; through the way the arch's iron underside.
 */
export function makePrisonArch(alongX: boolean, lit: boolean): Strip[] {
  // (as wide as a whole number of strips: art/gates.ts Flat cuts it into strips eight across)
  const F = new Flat(0, ARCH_WIDE + 16, PG_FACE + DEEP + SPIKE_HIGH + 12);
  // (the face's pattern laid with its light from the screen's left: along y the plane runs the other way)
  const at = (u: number): number => (alongX ? u : ARCH_WIDE - 1 - u);
  // THE CORNICE'S TOP, a pillar's thickness back, and the spikes standing on its front edge (painted first: the face over them)
  for (let s = 1; s <= DEEP; s++) {
    for (let u = 0; u < ARCH_WIDE; u++) F.set(u + s, PG_FACE + 6 + s, colourOf(s === 1 ? 4 : s === DEEP ? 1 : (u + s) % 30 === 0 ? -1 : 3, true));
  }
  for (let v = PG_SPRING; v < F.high; v++) {
    for (let u = 0; u < ARCH_WIDE; u++) {
      if (prisonInWay(u, v)) {
        // THE UNDERSIDE through the way: the ring's inside, set back to the slot (as far back as the pillars are thick)
        for (let s = 1; s <= DEEP; s++) {
          const us = u - s;
          const vs = v - s;
          if (vs < PG_SPRING || prisonInWay(us, vs)) continue;
          F.set(u, v, s <= 1 || s % 6 === 0 ? SEAM : colourOf(1, false));
          break;
        }
        continue;
      }
      const t = faceAt(at(u), v, lit);
      if (t === null) continue;
      F.set(u, v, colourOf(t, alongX));
    }
  }
  // THE TWO GREAT RINGS, and the chain slung between them over the arch
  const chain = (u: number, v: number, k: number): void => F.set(u, v, colourOf(k, alongX));
  const n = 40;
  const [a, b] = RINGS;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    // (from either ring alike, so that the chain is the same both ways)
    const uu = Math.round(a[0] + (b[0] - a[0]) * Math.min(t, 1 - t));
    const u = t <= 0.5 ? uu : ARCH_WIDE - 1 - uu;
    const v = Math.round(a[1] - 6 - 30 * 4 * t * (1 - t));
    // (links by turns seen flat and edge on: a ring 4 high, a bar)
    if (i % 2 === 0) {
      for (let dv = -2; dv <= 2; dv++) {
        chain(u - 2, v + dv, 3);
        chain(u + 2, v + dv, 1);
      }
      chain(u - 1, v + 2, 3);
      chain(u, v + 2, 2);
      chain(u + 1, v + 2, 2);
      chain(u - 1, v - 2, 3);
      chain(u, v - 2, 3);
      chain(u + 1, v - 2, 2);
    } else {
      for (let du = -2; du <= 2; du++) {
        chain(u + du, v, 3);
        chain(u + du, v - 1, 1);
      }
    }
  }
  for (const [ru, rv] of RINGS) {
    // the staple's plate, and the ring hanging from it
    for (let du = -3; du <= 3; du++) for (let dv = -1; dv <= 3; dv++) chain(ru + du, rv + dv, Math.abs(du) === 3 || dv === 3 ? 0 : du < 0 === alongX ? 3 : 2);
    for (let q = 0; q < 48; q++) {
      const th = (q / 48) * Math.PI * 2;
      const u = Math.round(ru + Math.cos(th) * 5);
      const v = Math.round(rv - 6 + Math.sin(th) * 6);
      chain(u, v, Math.cos(th) < 0 === alongX ? 4 : 1);
    }
  }
  const out = F.strips(alongX);
  if (lit) {
    // (alight, the mark gives the enemy's light: on the strip with the middle of the keystone)
    const mid = Math.floor(MID);
    const s0 = Math.floor(mid / STRIP) * STRIP;
    const strip = out.find((q) => q.t === s0 / 32);
    if (strip) {
      const j = mid - s0;
      const vMark = PG_SPRING + MARK_UP;
      strip.s.lights = [{ x: (alongX ? j : STRIP - 1 - j) / GRAIN, y: (F.anchorRow + Math.floor((j - 1) / 2) - vMark) / GRAIN, r: 24, color: FLAME[2], a: 0.32 }];
    }
  }
  return out;
}

// =================================================================================================
// THE PORTCULLIS

/** Where its bars stand along the plane (their middles): eight, every twelve. */
export const PG_BARS = [18, 30, 42, 54, 66, 78, 90, 102];
const SPIKE = 14;

/** The game's raise (0 to GATE_UP) as how far this portcullis is drawn up (0 to PG_LIFT), an even number. */
export function prisonLift(raise: number): number {
  const r = Math.max(0, Math.min(GATE_UP, raise));
  return Math.round((r * PG_LIFT) / GATE_UP / 2) * 2;
}

/**
 * HIS GATE'S PORTCULLIS, `lift` picture pixels off the floor: black iron bars five wide every twelve, each to a spike, a heavy
 * rail over the spikes and a second higher; at the back of the arch, and what of it is not in the way, or is behind the
 * arch's thickness, is not there.
 */
export function makePrisonPortcullis(alongX: boolean, lift: number): Strip[] {
  const top = PG_SPRING + R_IN + 2;
  const F = new Flat(0, ARCH_WIDE, top);
  const put = (u: number, v: number, k: number): void => {
    if (prisonInWay(u, v) && prisonInWay(u + PILLAR, v + PILLAR)) F.set(u, v, colourOf(k, alongX));
  };
  const tall = top + 40;
  // the rails: the heavy one over the spikes, one higher, and every 24 above
  const rails: [number, number][] = [[14, 6], [34, 3]];
  for (let r = 58; r <= tall; r += 24) rails.push([r, 3]);
  for (const [h0, thick] of rails) {
    for (let u = PILLAR; u < PILLAR + SPAN; u++) {
      for (let q = 0; q < thick; q++) put(u, h0 + q + lift, q === thick - 1 ? 3 : q === 0 ? 0 : 1);
    }
  }
  // the bars, each to a spike; lit on the side toward the light
  for (const b of PG_BARS) {
    for (let h = 0; h <= tall; h++) {
      const half = h < SPIKE ? 2.5 * (h / SPIKE) : 2.5;
      for (let du = -3; du <= 3; du++) {
        if (Math.abs(du) > half) continue;
        const side = alongX ? du : -du;
        put(b + du, h + lift, h < 2 ? 4 : side < -1 ? 4 : side < 0 ? 3 : side > 1 ? 0 : 2);
      }
      if (h >= SPIKE) put(alongX ? b + 3 : b - 3, h + lift, -1);
    }
    // a rivet where it crosses each rail
    for (const [h0, thick] of rails) put(alongX ? b - 1 : b + 1, h0 + lift + Math.floor(thick / 2), 4);
  }
  return F.strips(alongX);
}

// =================================================================================================
// THE DROP AND THE SLAM

/** How many frames the slam's soot and sparks last (at 30 a second). */
export const PG_SLAM_FRAMES = 16;
/**
 * THE DROP, Movement 9: the game's raise (0 to GATE_UP) frame by frame at 30 a second from the moment the fight begins. Held at
 * the top, juddering, the chains slipping and catching (a third of a second); down in two frames; a hard landing
 * (`PRISON_SLAM_AT`: the soot and sparks begin, the mark lights) and a bounce off the floor, then down for good.
 */
export const PRISON_GATE_DROP: readonly number[] = [60, 60, 56, 60, 60, 54, 60, 58, 52, 60, 24, 0, 0, 6, 8, 2, 0, 0];
export const PRISON_SLAM_AT = 11;

/** Soot off the flags, firelit: charcoal, its lit tops warm. */
const SOOT_DUST = ['#1c1a20', '#2c2830', '#3e3640', '#5a4840'] as const;

/**
 * THE SLAM, frame `f` (0 to PG_SLAM_FRAMES - 1, from the landing): soot thrown off the flags both ways from the gate's foot and
 * rolling out low, sparks struck off the spikes where they bite (an honest orange: iron on stone). Anchored at the middle of
 * the gate's foot on the floor (the middle of the doorway at the back of the arch: `at(1.5, PILLAR / 32)` in render.ts's
 * measure), to be stood just in front of it.
 */
export function prisonGateSlam(alongX: boolean, f: number): Sprite {
  const W = 280;
  const Hh = 180;
  const AX = W / 2;
  const AY = 104;
  const p = new Px(W, Hh);
  const sc = (a: number, q: number, h: number): [number, number] => [Math.round(AX + (alongX ? a - q : q - a)), Math.round(AY + (a + q) / 2 - h)];
  // THE SOOT: shot out flat along the floor both ways at the blow, then billowing and rolling on, thinning as it goes
  const puffs: { a: number; q: number; h: number; rx: number; ry: number; k: number }[] = [];
  for (let i = 0; i < 24; i++) {
    const way = i % 2 === 0 ? -1 : 1;
    const a0 = -50 + hash(i, 1, 701) * 100;
    const t = Math.max(0, f + 1 - Math.floor(hash(i, 2, 702) * 2));
    const go = 1 - Math.pow(1 - Math.min(1, t / 11), 2.4);
    const out = way * (2 + (8 + hash(i, 3, 703) * 16) * go);
    const drift = (hash(i, 4, 704) - 0.5) * 10 * go;
    const size = 3 + (4 + hash(i, 5, 705) * 6) * go;
    const rise = Math.min(1, t / 6);
    const rx = size * (1.6 - 0.35 * rise);
    const ry = size * (0.4 + 0.45 * rise);
    const h = ry + t * (0.25 + hash(i, 6, 706) * 0.6) * rise;
    puffs.push({ a: a0 + drift, q: out, h, rx, ry, k: i });
  }
  puffs.sort((m, n) => m.a + m.q - (n.a + n.q));
  const thin = Math.max(0, (f - 3) / (PG_SLAM_FRAMES - 3));
  for (const pf of puffs) {
    const [cx, cy] = sc(pf.a, pf.q, pf.h);
    const rx = Math.max(2, Math.round(pf.rx));
    const ry = Math.max(1, Math.round(pf.ry));
    for (let y = -ry - 2; y <= ry + 2; y++) {
      for (let x = -rx - 2; x <= rx + 2; x++) {
        const gx = (cx + x) >> 1;
        const gy = (cy + y) >> 1;
        const lump = (hash((cx + x) >> 2, (cy + y) >> 2, 711 + pf.k) - 0.5) * 0.3 + (hash(gx, gy, 712 + pf.k) - 0.5) * 0.16;
        const d = Math.hypot(x / rx, y / ry) + lump;
        if (d > 1) continue;
        if (d > 0.72 - thin * 0.3 && (gx + gy) % 2 === 0) continue;
        if (hash(gx, gy, 721 + f) < thin * (0.35 + d * 0.9)) continue;
        const lightUp = -y / ry - (x / rx) * 0.5;
        p.set(cx + x, cy + y, lightUp > 0.5 && d < 0.8 ? SOOT_DUST[3] : lightUp < -0.4 ? SOOT_DUST[1] : SOOT_DUST[2]);
      }
    }
  }
  for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
    if (!p.has(x, y)) continue;
    let nb = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && p.has(x + dx, y + dy)) nb++;
    if (nb === 0) p.erase(x, y);
  }
  // THE BITE: where each spike strikes the floor, a flash, the first frames
  for (const b of PG_BARS) {
    const a = b - MID;
    if (f <= 1) {
      const [x, y] = sc(a, 0, 0);
      for (let i = -2; i <= 2; i++) p.set(x + i, y, f === 0 ? EMBER[4] : EMBER[3]);
      p.set(x, y - 1, EMBER[4]);
      p.set(x, y + 1, EMBER[2]);
    }
  }
  // THE SPARKS: struck off the spikes, flying out both ways and falling, each a short streak of its path
  for (const b of PG_BARS) {
    for (let n = 0; n < 3; n++) {
      const key = b * 7 + n;
      const life = 5 + Math.floor(hash(key, 1, 731) * 5);
      if (f > life) continue;
      const va = (hash(key, 2, 732) - 0.5) * 4.4;
      const vq = (hash(key, 3, 733) < 0.5 ? -1 : 1) * (1.2 + hash(key, 4, 734) * 1.8);
      const vh = 2.6 + hash(key, 5, 735) * 2.6;
      const pos = (t: number): [number, number] => sc(b - MID + va * t, vq * t, Math.max(0, vh * t - 0.42 * t * t));
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
export function prisonGateDropAt(frame: number): { raise: number; slam: number; lit: boolean } {
  const i = Math.max(0, Math.floor(frame));
  const raise = PRISON_GATE_DROP[Math.min(i, PRISON_GATE_DROP.length - 1)];
  const s = i - PRISON_SLAM_AT;
  return { raise, slam: s >= 0 && s < PG_SLAM_FRAMES ? s : -1, lit: s >= 0 };
}

// =================================================================================================

let made: GateArt | null = null;
/** Its pictures let go (its floor left: render.ts forgetLooks; his “it’s crashing every couple of levels”), made again if wanted. */
export function forgetMade(): void {
  made = null;
}
/**
 * FLOOR 3'S DOORS AND GATES WITH HIS OWN (a GateArt, as art/gates.ts's): the boss's pillar, arch and portcullis his gate's
 * (above); everything else floor 3's own (art/floor3.ts, chainedGates): its cell doors, its plain gates, its levers, its seals.
 */
export function makePrisonGateArt(): GateArt {
  if (made) return made;
  const base = chainedGates();
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
      return pillar ?? (pillar = makePrisonPillar());
    },
    arch(alongX, boss, lit) {
      if (!boss) return base.arch(alongX, false, lit);
      const key = (alongX ? 2 : 0) + (lit ? 1 : 0);
      let s = arches.get(key);
      if (!s) arches.set(key, (s = makePrisonArch(alongX, lit)));
      return s;
    },
    portcullis(alongX, boss, raise) {
      if (!boss) return base.portcullis(alongX, false, raise);
      const lift = prisonLift(raise);
      const key = lift * 2 + (alongX ? 1 : 0);
      let s = gates.get(key);
      if (!s) gates.set(key, (s = makePrisonPortcullis(alongX, lift)));
      return s;
    },
  };
  return made;
}
void BEYOND;
void FIRE;
