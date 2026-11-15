// ENDLESS MODE'S PORTAL: THE LANDING OPENS, TO THE GAME'S STANDARD (the art chat, 12 Nov 2026; the queue's
// draw-endless-tablet-portal-final-boss). Behind ENDLESS_TABLET (art/endless_tablet.ts, off): nothing of the game imports this file.
//
// His pick, 12 Nov 2026, shown three takes painted over the Shaft's Rim: “B: The landing opens (Recommended)” (offered as: the
// landing splits in four as the tablet does, and its quarters draw back; under them a stair goes on down, lit cyan, the boss's glow
// far below). So: the landing at the tongue's end (art/shaft_rim.ts LANDING, TONGUE) keeps its ring of kerb and its eight posts;
// ITS FLOOR INSIDE THE RING SPLITS IN FOUR along the grid's two axes (the same lines as the tablet in the bench's socket), the seams
// burning the friend's cyan; the four quarters grind back under the ring, and where they were a round well goes down: A STAIR winds
// down its wall into the friend's light, and far below, at the bottom, the boss's pink burning to gold.
//
// WHAT IS HERE (picture pixels, two to a game pixel; both pictures laid with their anchor on the landing's middle, on its floor)
//   paintPortalFloor(f)   what lies flat: the landing's floor inside its ring, the quarters as far as they have drawn back, and the
//                         well seen through the opening. 96 x 64, the anchor (48, 26).
//   paintPortalRise(f)    what stands up out of it: the light, the sparks, the dust and chips, the motes rising. 120 x 240, the
//                         anchor (60, 214). Laid in depth at the landing's middle.
//   f: a frame at 30 a second. 0 ... PORTAL_OPEN_FRAMES - 1 the opening (the seams kindle, the light bursts through, the quarters
//   grind back, it settles); from PORTAL_OPEN_FRAMES on, it stands open (PORTAL_IDLE frames that go round). -1: shut, as the
//   ground has it (nothing laid). Their lights go with them.

import { Px, mix } from '../engine/px';
import type { Light } from '../engine/px';
import { GRAIN, SPARK } from './kit';
import { TONGUE } from './shaft_rim';

/** The opening, in frames at 30 a second: the seams kindle; the light bursts through; the quarters grind back; it settles. */
export const PORTAL_OPEN = { crack: 24, burst: 10, slide: 46, settle: 24 } as const;
export const PORTAL_OPEN_FRAMES = PORTAL_OPEN.crack + PORTAL_OPEN.burst + PORTAL_OPEN.slide + PORTAL_OPEN.settle;
/** Standing open: frames that go round. */
export const PORTAL_IDLE = 48;

/** The pictures' sizes and anchors (picture pixels). */
export const PORTAL_FLOOR = { w: 96, h: 64, ox: 48, oy: 26 } as const;
export const PORTAL_RISE = { w: 120, h: 240, ox: 60, oy: 214 } as const;

// The landing's stone, as the ground paints it (art/endless_splash.ts TOWN): its stone and its flags, dark to light; the night.
const STONE = ['#52444c', '#857567', '#958474', '#ae9a88'] as const;
const FLAGS = ['#554c55', '#62585e', '#7a6d6b'] as const;
const NIGHT = '#07060f';
const INKY = '#120e18';
/** The enemy's fire, pink burning to gold (art/mkit.ts FLAME): only far down, the boss's. */
const PINK = ['#7a1058', '#c0206a', '#ff4f8a', '#ffb070', '#fff0a0'] as const;

/** The floor inside the landing's ring (tiles): it splits in four and draws back under the ring. */
const INNER = TONGUE.r - 0.16;
/** The landing's slab: how thick (game pixels). */
const SLAB = 5;

function h3(x: number, y: number, k: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(k | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const bay = (x: number, y: number): number => BAYER4[((y & 3) << 2) | (x & 3)];
/** Light in bands (n of them), the dither only where two meet: from c0 at 0 to c1 at 1. */
function band(c0: string, c1: string, t: number, x: number, y: number, n = 4): string {
  const v = Math.max(0, Math.min(1, t)) * n;
  const i = Math.floor(v);
  const f = v - i;
  // (flat within a band; a dither only in the narrow seam where it meets the next)
  const up = Math.abs(f - 0.5) < 0.12 ? bay(x, y) < (f - 0.38) / 0.24 : f >= 0.5;
  const k = (i + (up ? 1 : 0)) / n;
  return k <= 0 ? c0 : k >= 1 ? c1 : mix(c0, c1, k);
}
const ease = (t: number): number => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

/** Where the opening is at frame f: how far the seams have kindled (0 ... 1), the burst's strength, how far the quarters have drawn back (tiles), the light's strength, and the time it has stood open. */
export function portalAt(f: number): { crack: number; burst: number; back: number; light: number; open: number } {
  if (f < 0) return { crack: 0, burst: 0, back: 0, light: 0, open: -1 };
  const { crack, burst, slide, settle } = PORTAL_OPEN;
  if (f < crack) return { crack: f / crack, burst: 0, back: 0, light: 0.15 * (f / crack), open: -1 };
  f -= crack;
  if (f < burst) return { crack: 1, burst: 1 - f / burst / 2, back: 0.04 * (f / burst), light: 0.5 + 0.5 * (f / burst), open: -1 };
  f -= burst;
  if (f < slide) {
    const t = f / slide;
    // (it grinds: slow to start, a lurch, then it runs and slows into its slot)
    const g = ease(t) + 0.03 * Math.sin(t * Math.PI * 3) * (1 - t);
    return { crack: 1, burst: 0.5 * (1 - t), back: 0.04 + g * (INNER + 0.04), light: 1, open: -1 };
  }
  f -= slide;
  if (f < settle) return { crack: 1, burst: 0, back: INNER + 0.08, light: 1 - 0.45 * ease(f / settle), open: -1 };
  f -= settle;
  return { crack: 1, burst: 0, back: INNER + 0.08, light: 0.55, open: f };
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE FLOOR AND THE WELL, by lines of sight. A game pixel (dx, dy) from the landing's middle on its floor, down d game pixels, is the
// point u, v (tiles from its middle, along the grid's x and y): u - v = dx / 16, u + v = (dy - d) / 8 (+ d where it stands up).

/** Quarter k (0 the back, 1 the right, 2 the near, 3 the left: the tablet's order) of the landing's floor: which way it lies. */
const QSIGN = [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const;

// THE WELL, A PICTORIAL CHEAT AS THE SHAFT'S OWN (art/shaft_rim.ts pitAt): seen from the rim, storey under storey are rings, each
// lower one smaller and lower down the screen, closing toward a point near the near lip; so a few turns of the stair are seen
// before the light takes it. A point of the wall is (z, phi): z storeys down, phi round the ring on the screen (0 to the right,
// -90 the far side's middle). The ring of depth z is an ellipse WRX * p by WRY * p, p = WQ^z, its middle WK * WRY * (1 - p) under
// the opening's.
const WRX = INNER * 16 * Math.SQRT2;
const WRY = WRX / 2;
const WQ = 0.6;
const WK = 0.8;
/** Which ring a game pixel (dx, dy from the opening's middle) lies on: depth z (storeys), angle phi; null outside the opening. */
function wellAt(dx: number, dy: number): { z: number; phi: number; p: number } | null {
  const a = dx / WRX;
  const b = (dy - WK * WRY) / WRY;
  const A = 1 - WK * WK;
  const p = (2 * WK * b + Math.sqrt(4 * WK * WK * b * b + 4 * A * (a * a + b * b))) / (2 * A);
  if (!(p > 0) || p > 1) return null;
  return { z: Math.log(p) / Math.log(WQ), phi: Math.atan2((dy - WK * WRY * (1 - p)) / (WRY * p), dx / (WRX * p)), p };
}
/** The stair: treads to a turn, a turn going down one storey; how far each reaches in from the wall (a fraction of its ring). */
const W_TREADS = 20;
const W_REACH = 0.62;
const W_DA = (Math.PI * 2) / W_TREADS;
/** It leaves the floor at the back on the left (where the tongue comes in) and winds down rightward round the far side; round the
 * near side it is under the lip, not seen, and comes round again lower down. */
const W_PHI0 = -Math.PI * 0.86;
/** The bottom, where the light has all: how deep (storeys). */
const W_BOTTOM = 3.3;
/** Tread i: its angles (a0 its upper end, a1 its leading edge, where it drops) and its top's depth (storeys). */
const wTread = (i: number): { a0: number; a1: number; z: number } => ({ a0: W_PHI0 + i * W_DA, a1: W_PHI0 + (i + 1) * W_DA, z: 0.16 + ((i + 1) / W_TREADS) });
/** The tread a game pixel lies on the top of (or the nose of), the shallowest; null if none. */
function wTreadAt(dx: number, dy: number, zWall: number): { i: number; z: number; nose: boolean; rr: number; edge: boolean } | null {
  for (let i = 0; i < W_TREADS * 4; i++) {
    const t = wTread(i);
    if (t.z >= zWall || t.z > W_BOTTOM) return null;
    const p = WQ ** t.z;
    const ex = dx / (WRX * p);
    const ey = (dy - WK * WRY * (1 - p)) / (WRY * p);
    const rr = Math.hypot(ex, ey);
    if (rr > 1 || rr < W_REACH - 0.08) continue;
    const ang = Math.atan2(ey, ex);
    // (round the near side the stair is under the lip: not drawn)
    if (Math.sin(ang) > 0.25) continue;
    // (is ang between a0 and a1, round and round)
    const turn = Math.PI * 2;
    const x = (((ang - t.a0) % turn) + turn) % turn;
    if (x > W_DA) continue;
    return { i, z: t.z, nose: rr < W_REACH, rr, edge: x > W_DA * 0.84 };
  }
  return null;
}
/** The friend's light from below on something z storeys down: dark under the floor; deeper, the stone takes the cyan light, more
 * the deeper, in bands. `lift` for what faces up into it more (a tread's nose). */
const WELL_LIT = '#86d8d2';
function wellLight(c: string, z: number, px: number, py: number, lift = 0): string {
  const dark = Math.max(0, 1 - z * 1.5) * 0.85;
  const base = band(c, NIGHT, dark, px, py, 3);
  const L = Math.max(0, Math.min(1, (z - 0.45) / (W_BOTTOM - 0.7) + lift));
  return L <= 0 ? base : band(base, WELL_LIT, L * 0.55, px, py, 3);
}
/** The wall of the well at (z, phi): dressed blocks in courses, their joints dark, lit from below. */
function wWallAt(z: number, phi: number, px: number, py: number): string {
  if (z < 0.14) return INKY; // (the landing's slab, cut through: its inner face, in shadow)
  const course = Math.floor(z / 0.26);
  const fz = z / 0.26 - course;
  const pos = (phi / (Math.PI * 2) + 2) * 12 + (course % 2) * 0.5;
  const fa = pos - Math.floor(pos);
  let c: string = h3(Math.floor(pos), course, 81) > 0.6 ? STONE[1] : STONE[0];
  // (the joints, a line of dark, only where the ring is big enough for a block to be seen)
  const ring = WQ ** z;
  if (ring > 0.42 && (fz < 0.1 || fa < 0.05)) c = INKY;
  // (what of the wall looks toward the eye, the far side, takes the light; the sides turn from it)
  return wellLight(c, z, px, py, Math.sin(phi) < -0.4 ? 0.06 : 0);
}

/** The flags of the landing's floor at a point (tiles from its middle, in that quarter's own place): as the ground lays them. */
function floorAt(u: number, v: number, px: number, py: number): string {
  const d = Math.hypot(u, v);
  const a = Math.atan2(v, u);
  if (d < 0.36) return Math.abs(d - 0.36) < 0.03 ? mix(FLAGS[0], NIGHT, 0.4) : groundLit(FLAGS[2], px, py);
  const seg = Math.floor((a / (Math.PI * 2) + 1) * 8);
  const fa = (a / (Math.PI * 2) + 1) * 8 - seg;
  if (fa < 0.04 || Math.abs(d - 0.36) < 0.03) return mix(FLAGS[0], NIGHT, 0.4);
  return groundLit(FLAGS[1 + (h3(seg, 5, 71) > 0.6 ? 1 : 0)], px, py);
}
/** As the ground lights the landing (art/shaft_rim.ts lit(c, 0.85)): in bands toward the night, dithered where they meet. */
function groundLit(c: string, px: number, py: number): string {
  const t = (3 + (bay(px, py) < 0.4 ? 1 : 0)) / 4;
  return t >= 1 ? c : mix(NIGHT, c, 0.18 + 0.82 * t);
}

/** The landing's floor inside its ring, and the well through the opening, at frame f. */
export function paintPortalFloor(f: number): { px: Px; ox: number; oy: number; lights: Light[] } {
  const P = PORTAL_FLOOR;
  const p = new Px(P.w, P.h);
  const st = portalAt(f);
  const lights: Light[] = [];
  if (f < 0) return { px: p, ox: P.ox, oy: P.oy, lights };
  const pulse = st.open >= 0 ? 0.5 + 0.5 * Math.sin((st.open / PORTAL_IDLE) * Math.PI * 2) : 1;
  for (let y = 0; y < P.h; y++) for (let x = 0; x < P.w; x++) {
    const dx = (x + 0.5 - P.ox) / GRAIN;
    const dy = (y + 0.5 - P.oy) / GRAIN;
    // (on the floor first: is this inside the ring at all?)
    const u0 = (dx / 16 + dy / 8) / 2;
    const v0 = (dy / 8 - dx / 16) / 2;
    if (Math.hypot(u0, v0) >= INNER) continue; // (the ring and past it: the ground's own)
    let col: string | null = null;
    // a quarter of the floor, where it has drawn back to (a slab SLAB game pixels thick; under the ring it is hidden): its top, or
    // its cut side seen as it draws back
    for (let d = 0; d <= SLAB && !col; d += 0.5) {
      const u = (dx / 16 + (dy - d) / 8) / 2;
      const v = ((dy - d) / 8 - dx / 16) / 2;
      if (Math.hypot(u, v) >= INNER) break;
      for (let k = 0; k < 4 && !col; k++) {
        const [sx, sy] = QSIGN[k];
        const o = st.back / Math.SQRT2;
        const lu = u - sx * o;
        const lv = v - sy * o;
        if (!(lu * sx > 0 && lv * sy > 0 && Math.hypot(lu, lv) < INNER)) continue;
        if (d === 0) {
          // its top: the flags, its cut edges burning as the seams kindle (the burning runs out along them from the middle)
          const edge = Math.min(Math.abs(lu), Math.abs(lv));
          const along = Math.hypot(lu, lv);
          const reach = st.crack * INNER;
          if (st.crack > 0 && edge < 0.05 && along < reach + 0.05) col = st.burst > 0.6 || (st.back < 0.1 && along < reach - 0.25) ? SPARK[4] : SPARK[3];
          else if (st.crack > 0 && edge < 0.1 && along < reach) col = mix(floorAt(lu, lv, x, y), SPARK[2], 0.55);
          else col = floorAt(lu, lv, x, y);
          if (st.back > 0.08 && edge < 0.07) col = mix(col, SPARK[2], 0.5 * st.light);
        } else {
          col = band(STONE[2], STONE[0], d / SLAB, x, y, 2);
          if (st.back > 0.05) col = band(col, SPARK[2], st.light * 0.55 * (d / SLAB), x, y, 3);
        }
      }
    }
    if (!col && st.back < 0.02) col = st.crack > 0 ? SPARK[3] : mix(FLAGS[0], NIGHT, 0.4); // (the seams, not yet open)
    if (!col) {
      // THE WELL: its wall, the stair round it, and the bottom where the light has all
      const w = wellAt(dx, dy);
      if (w) {
        const tr = wTreadAt(dx, dy, w.z);
        if (tr) col = tr.nose ? wellLight(STONE[3], tr.z, x, y, 0.25) : tr.edge ? wellLight(INKY, tr.z, x, y, 0) : wellLight(tr.rr > 0.92 ? STONE[1] : STONE[2], tr.z, x, y, 0.1);
        else if (w.z < W_BOTTOM) col = wWallAt(w.z, w.phi, x, y);
        else {
          // THE BOTTOM: the friend's light, and in its middle, far down, the boss's pink burning to gold, breathing
          const bp = WQ ** W_BOTTOM;
          const ex = dx / (WRX * bp);
          const ey = (dy - WK * WRY * (1 - bp)) / (WRY * bp);
          const pr = Math.hypot(ex, ey);
          const heart = 0.42 + 0.12 * pulse;
          col = pr < heart * 0.4 ? PINK[4] : pr < heart * 0.7 ? PINK[3] : pr < heart ? PINK[2] : pr < heart * 1.35 ? band(PINK[1], SPARK[2], 0.5, x, y, 2) : pr < 0.85 ? SPARK[3] : SPARK[4];
        }
      } else col = INKY;
    }
    if (col) p.set(x, y, col);
  }
  if (st.light > 0) {
    lights.push({ x: P.ox / GRAIN, y: P.oy / GRAIN, r: 18 + 22 * st.light + (f % 2), color: SPARK[2], a: 0.25 + 0.35 * st.light });
    if (st.back > 0.4) lights.push({ x: P.ox / GRAIN, y: (P.oy + 2) / GRAIN, r: 8 + 2 * pulse, color: PINK[2], a: 0.12 + 0.08 * pulse });
  }
  return { px: p, ox: P.ox, oy: P.oy, lights };
}

// ---------------------------------------------------------------------------------------------------------------------------
// WHAT RISES OUT OF IT

/** The light, the sparks, the dust and chips, the motes, at frame f. */
export function paintPortalRise(f: number): { px: Px; ox: number; oy: number; lights: Light[] } {
  const P = PORTAL_RISE;
  const p = new Px(P.w, P.h);
  const lights: Light[] = [];
  if (f < 0) return { px: p, ox: P.ox, oy: P.oy, lights };
  const st = portalAt(f);
  const cx = P.ox;
  const cy = P.oy;
  // the screen point of a floor point (tiles from the middle) at a height z (game pixels), in this picture
  const scr = (u: number, v: number, z: number): [number, number] => [Math.round(cx + (u - v) * 32), Math.round(cy + (u + v) * 16 - z * GRAIN)];
  // THE SEAMS KINDLING: sparks spat up out of the two lines as the burning runs out along them, and a shiver of grit on the floor
  if (st.crack > 0 && st.crack < 1) {
    for (let j = 0; j < 14; j++) {
      const t = (f + j * 3) % 9;
      const along = (h3(j, 1, 91) * 2 - 1) * st.crack * INNER;
      const axis = j % 2;
      const [x0, y0] = scr(axis ? along : 0, axis ? 0 : along, 0);
      p.set(x0 + Math.round((h3(j, 2, 93) - 0.5) * 4), y0 - t * 2 - Math.round(h3(j, f, 95) * 2), t < 3 ? SPARK[4] : t < 6 ? SPARK[3] : SPARK[2]);
    }
  }
  // THE BURST: light shot up through the seams, two walls of rays standing on the cross, and a blaze at the middle
  if (st.burst > 0) {
    const tall = 40 + 120 * st.burst;
    for (let s = -INNER; s <= INNER; s += 0.035) {
      for (const axis of [0, 1]) {
        const [x0, y0] = scr(axis ? s : 0, axis ? 0 : s, 0);
        const ray = h3(Math.round(s * 40), axis, 97 + (f >> 1)) ;
        if (ray < 0.45) continue;
        const h = tall * (0.4 + 0.6 * ray) * (1 - Math.abs(s) / INNER * 0.5);
        for (let z = 0; z < h; z += 1) {
          const y = y0 - Math.round(z);
          if (y < 0) break;
          const fade = z / h;
          if (fade > 0.75 && bay(x0, y) < (fade - 0.75) * 4) continue;
          if (!p.has(x0, y)) p.set(x0, y, fade < 0.3 && ray > 0.8 ? SPARK[4] : SPARK[3]);
        }
      }
    }
  }
  // THE COLUMN: once it opens, the friend's light stands up out of the well, as broad as the opening; at its height in the
  // grinding, a blaze; then it falls back to a breathing glow over the well
  if (st.back > 0.06 && st.open < 0) {
    const open = Math.min(1, st.back / INNER);
    const half = open * INNER * 32 * 0.92;
    const tall = (st.open >= 0 ? 34 + 6 * Math.sin((st.open / PORTAL_IDLE) * Math.PI * 4) : 50 + 150 * st.light * (st.burst > 0 ? 1 : 0.85));
    for (let x = Math.round(cx - half); x <= Math.round(cx + half); x++) {
      const e = Math.abs(x + 0.5 - cx) / Math.max(1, half);
      const h = tall * Math.sqrt(Math.max(0, 1 - e * e)) * (0.8 + 0.2 * h3(x, f >> 2, 99));
      const foot = cy + Math.round(Math.sqrt(Math.max(0, 1 - e * e)) * open * INNER * 16 * 0.85);
      for (let z = 0; z < h; z++) {
        const y = foot - z;
        if (y < 0) break;
        const fade = z / h;
        // (banded: a white heart, the cyan, its edge broken up into streaks rising)
        const streak = h3(x, Math.floor((y + f * 3) / 5), 101) > 0.5;
        if (e > 0.62 && !streak) continue;
        if (fade > 0.55 && bay(x, y) < (fade - 0.55) * 2.2) continue;
        p.set(x, y, e < 0.22 && fade < 0.6 && st.open < 0 ? SPARK[4] : e < 0.6 ? SPARK[3] : SPARK[2]);
      }
    }
  }
  // THE GRINDING: dust puffed out where each quarter goes under the ring, and chips of stone flung
  const slideF = f - PORTAL_OPEN.crack - PORTAL_OPEN.burst;
  if (slideF >= 0 && slideF < PORTAL_OPEN.slide + 10) {
    for (let k = 0; k < 4; k++) {
      const [sx, sy] = [[-1, -1], [1, -1], [1, 1], [-1, 1]][k];
      for (let j = 0; j < 7; j++) {
        const born = (j * 6 + k * 2) % (PORTAL_OPEN.slide - 4);
        const t = slideF - born;
        if (t < 0 || t > 14) continue;
        const a = Math.atan2(sy, sx) + (h3(j, k, 103) - 0.5) * 1.4;
        const r = INNER + 0.05 + t * 0.018;
        const [x, y] = scr(Math.cos(a) * r, Math.sin(a) * r, 2 + t * 0.9);
        const dust = t < 5 ? STONE[3] : t < 10 ? STONE[2] : STONE[1];
        p.set(x, y, dust).set(x + 1, y, dust);
        if (t < 9) p.set(x, y - 1, dust);
        // (a chip flung up and out, falling)
        if (j % 3 === 0) {
          const [qx, qy] = scr(Math.cos(a) * (r + t * 0.03), Math.sin(a) * (r + t * 0.03), 4 + t * 2.2 - t * t * 0.16);
          p.set(qx, qy, STONE[1]);
        }
      }
    }
  }
  // STANDING OPEN: motes of the friend's light rising out of the well, slowly, each its own way, blinking out
  if (st.back > 0.3) {
    const n = 16;
    for (let j = 0; j < n; j++) {
      const life = 40;
      const t = ((f + j * 7) % life) / life;
      const a = h3(j, 7, 105) * Math.PI * 2;
      const r = h3(j, 9, 107) * INNER * 0.85;
      const [x0, y0] = scr(Math.cos(a) * r, Math.sin(a) * r, 0);
      const x = x0 + Math.round(Math.sin(t * 6 + j) * 2);
      const y = y0 - Math.round(t * 70);
      if (t > 0.8 && bay(x, y) < (t - 0.8) * 5) continue;
      p.set(x, y, t < 0.3 ? SPARK[4] : SPARK[3]);
    }
  }
  if (st.burst > 0 || st.back > 0.06) {
    lights.push({ x: cx / GRAIN, y: (cy - 30) / GRAIN, r: 26 + 30 * st.light + (f % 2) * 2, color: SPARK[2], a: 0.18 + 0.32 * st.light });
  }
  return { px: p, ox: P.ox, oy: P.oy, lights };
}
