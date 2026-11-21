// THE ISLE OF STONES, ONE OF THE TOWNS TO UNLOCK OR BUY: ITS GROUND, ITS SKY AND ITS STONES, drawn to the game's standard (the
// queue's draw-eight-other-towns; his pick of which first, 14 Nov 2026: “7 The Isle of Stones”; shown the closer mock-up,
// docs/mockups/isle_of_stones/README.md, his word: “Actually redraw it, don’t just leave these mock up drawings”, read as: the
// layout stands, draw it all properly). Nothing of the game imports this file: how the towns are won and laid is the main chat's.
//
// WHAT IS HERE, painted as the Shaft's Rim's ground is (art/shaft_rim.ts): every picture pixel a line of sight, what it meets first
// found by its numbers; flat tones, a seam of one pixel, light in bands, a dither only where two bands meet; two picture pixels
// to a game pixel.
//   - THE GROUND, one picture: the night sky with its stars over the sea's horizon; the still black sea; THE ISLE, turf in its
//     middle, worn paths, a shore of grey stones round it, its front a low face of dark rock with the sea lapping pale at its foot;
//     the portal's round of flat stones at the back; THE STEPS cut down from the shore into the sea at the front, the lowest under
//     the water.
//   - THE NORTHERN LIGHTS, one picture the game adds over the ground, its strength breathing slowly (`auroraAt(t)`): curtains of
//     green, a yellower green at their foot, violet up into the dark (never the friend's cyan), and their light laid on the still
//     water in long streaks.
//   - THE STANDING STONES, pieces that stand (laid in depth with everything else): four of them, each its height, tapered, weathered,
//     lichen on them, a rune of the order cut in each face, faint, in the friend's cyan (his sketch's: it is the wordsmith's own place).
// The stations are the game's own pictures, and the Shaft's Rim's gate, record, trophies, torches and socket slab (art/shaft_props.ts).

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import { bay, hx, mixc, rnd } from './endless_splash';
import type { C } from './endless_splash';
import { Iso } from './isokit';
import { compose } from './kit';

// ---------------------------------------------------------------------------------------------------------------------------
// THE PLACE, in tiles (a tile 32 x 16 game pixels, as the game's).

export const ISLE_W = 24;
export const ISLE_H = 24;
/** The isle's middle; its turf's edge; its shore's; where the ring of standing stones stands. */
export const ISLE = { cx: 12, cy: 12, turf: 7.1, shore: 8.1, ring: 7.25 } as const;
const D2R = Math.PI / 180;
const TAU = Math.PI * 2;
const polar = (a: number, r: number): [number, number] => [ISLE.cx + Math.cos(a * D2R) * r, ISLE.cy + Math.sin(a * D2R) * r];

/** THE LAYOUT (the mock-up's, as he saw it): each station's anchor tile. */
export const ISLE_LAYOUT = {
  gate: [13, 5] as [number, number],
  record: [8, 7] as [number, number],
  trophies: [4, 9] as [number, number],
  portal: polar(-135, 5.6),
  way: [16, 16] as [number, number],
  forge: [17, 9] as [number, number],
  tentBack: [6, 13] as [number, number],
  wordsmith: [12, 11] as [number, number],
  lexicon: [9, 16] as [number, number],
  stash: [13, 17] as [number, number],
  stranger: [18, 13] as [number, number],
  braziers: [[15, 12], [9, 12], [12, 8], [10, 18]] as [number, number][],
  torches: [[16.0, 6.6], [6.4, 9.0], [15.6, 18.4], [5.8, 15.6], [19.0, 15.6]] as [number, number][],
};
/** The portal's round: its middle, its radius (tiles). */
export const PORTAL_ROUND = { at: ISLE_LAYOUT.portal, r: 1.1 } as const;

/** THE RING OF STANDING STONES: each its angle round the isle, which of the four stones it is (0 the lowest), its width; tall at the
 * back against the sea and the sky, low at the front so that they hide no one; a gap at the back for the portal, one at the front
 * for the way down. */
export const ISLE_STONES: readonly { a: number; v: number; x: number; y: number }[] = Array.from({ length: 18 }, (_, k) => {
  const a = -180 + k * 20 + 6;
  const back = 0.5 - 0.5 * Math.cos((a + 135) * D2R);
  const v = Math.max(0, Math.min(3, Math.round(back * 3 + ((k * 37) % 3) * 0.3 - 0.3)));
  const [x, y] = polar(a, ISLE.ring);
  return { a, v, x, y };
}).filter((s) => {
  const off = (b: number): number => Math.abs(((s.a - b + 540) % 360) - 180);
  return off(-135) > 12 && off(45) > 10;
});

/** The coast: how far out the shore is at angle a (radians): a round, worn ragged. */
export function coast(a: number): number {
  return ISLE.shore + 0.35 * Math.sin(3 * a + 1) + 0.22 * Math.sin(7 * a + 2) + 0.12 * Math.sin(13 * a);
}
/** Whether a body may stand at tile (x, y): on the isle, held off the shore's edge. */
export function onIsle(x: number, y: number, r = 0.3): boolean {
  const a = Math.atan2(y - ISLE.cy, x - ISLE.cx);
  return Math.hypot(x - ISLE.cx, y - ISLE.cy) <= coast(a) - 0.5 - r;
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE COLOURS: night; the isle's grey-blue granite; the turf; the sea; the lights (green and violet, never cyan).

const NIGHT = hx('#05060e');
const SKY = ['#020309', '#05060f', '#080a18', '#0b0e20'].map(hx);
const TURF = ['#0e1610', '#16221a', '#1e3022', '#283e2c', '#34502f'].map(hx);
const PATH = ['#1c1e22', '#2a2c30', '#383a3c'].map(hx);
const PEBBLE = ['#16161e', '#24242e', '#34343f', '#484854', '#5e5e6a'].map(hx);
const FACE = ['#0c0c12', '#15151d', '#1e1e28', '#282834'].map(hx);
const SEA = ['#03050b', '#060912', '#090e1a', '#0e1626', '#152034'].map(hx);
const FOAM = hx('#7a82a0');
const SLAB = ['#1a1c26', '#2a2e3a', '#3c4250', '#565e6e', '#7a8292'].map(hx);
/** The northern lights: their foot's yellower green, their green, their violet. */
export const AURORA = { foot: hx('#b8f07a'), green: hx('#4ee070'), violet: hx('#9a5cf0') } as const;
const STAR = [hx('#8a90b0'), hx('#c8cce0')];

/** Light by bands, the dither only where two bands meet (the Rim's). */
function lit(c: C, k: number, x: number, y: number, floor = 0.18): C {
  const v = Math.max(0, Math.min(1, k)) * 4;
  const i = Math.floor(v);
  const f = v - i;
  const t = (i + (bay(x, y) < f ? 1 : 0)) / 4;
  return t >= 1 ? c : mixc(NIGHT, c, floor + (1 - floor) * t);
}
/** Value noise, smooth, 0 ... 1. */
function vn(x: number, y: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const s = (t: number): number => t * t * (3 - 2 * t);
  const a = rnd(xi, yi, seed);
  const b = rnd(xi + 1, yi, seed);
  const c = rnd(xi, yi + 1, seed);
  const d = rnd(xi + 1, yi + 1, seed);
  return a + (b - a) * s(fx) + (c - a) * s(fy) + (a - b - c + d) * s(fx) * s(fy);
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE GROUND'S PICTURE: (GROUND.w x GROUND.h) game pixels, tile (0, 0) at game pixel (0, 0); the horizon's height in it.

export const ISLE_GROUND = { gx: -420, gy: -120, w: 840, h: 500 } as const;
const MID_Y = (ISLE.cx + ISLE.cy) * 8;
/** The horizon (game pixels, tile (0, 0) at 0): the sea runs back to it, the sky over it. */
export const HORIZON_G = 46;

/** Where a game pixel of the ground lies on the floor (tiles). */
const tileAt = (gx: number, gy: number): [number, number] => {
  const U = gx / 16;
  const S0 = (gy - MID_Y) / 8;
  return [ISLE.cx + (S0 + U) / 2, ISLE.cy + (S0 - U) / 2];
};

/** How far down the isle's front face runs to the water, and how deep under it the eye still sees (game pixels). */
export const WATER = 10.5;
const UNDER = 12;

/** THE STEPS cut down from the shore into the sea at the front, out along the way down: square slabs set corner to the eye, each
 * lower and further out than the last, so that each shows its lit face and its shaded one (as the mock-up's did): how many, how far
 * each is out from the one before (tiles, along the way), how far each drops (game pixels), each slab's half side (tiles). The first
 * cut into the shore, the third just over the water, the last three under it. */
export const STEPS = { n: 6, run: 0.5, drop: 3, half: 0.5 } as const;
const WAY_C: [number, number] = [ISLE_LAYOUT.way[0] + 0.5, ISLE_LAYOUT.way[1] + 0.5];
const WAY_A = Math.atan2(WAY_C[1] - ISLE.cy, WAY_C[0] - ISLE.cx);
/** How far out along the way the cut begins (tiles from the way's middle): a tile inside the shore's edge. */
const CUT_AT = coast(WAY_A) - Math.hypot(WAY_C[0] - ISLE.cx, WAY_C[1] - ISLE.cy) - 1.0;
/** Each step's middle (tiles). */
const STEP_C: [number, number][] = Array.from({ length: STEPS.n }, (_, k) => {
  const al = CUT_AT + STEPS.half * Math.SQRT2 + k * STEPS.run;
  return [WAY_C[0] + al / Math.SQRT2, WAY_C[1] + al / Math.SQRT2];
});
/** Which step stands at tile (x, y) (1 the highest), or 0. */
function stepOf(x: number, y: number): number {
  for (let k = 0; k < STEPS.n; k++) if (Math.abs(x - STEP_C[k][0]) <= STEPS.half && Math.abs(y - STEP_C[k][1]) <= STEPS.half) return k + 1;
  return 0;
}
/** Whether the isle's rock stands at tile (x, y) (its top at height 0): within the coast, not where the steps are cut. */
function isIsle(x: number, y: number): boolean {
  if (Math.hypot(x - ISLE.cx, y - ISLE.cy) > coast(Math.atan2(y - ISLE.cy, x - ISLE.cx))) return false;
  return stepOf(x, y) === 0;
}
/** The height of the top of what stands at tile (x, y) (game pixels; the isle's top 0), and what it is. */
function solidAt(x: number, y: number): { top: number; what: 'isle' | 'step' | 'none'; k: number } {
  if (isIsle(x, y)) return { top: 0, what: 'isle', k: 0 };
  const k = stepOf(x, y);
  if (k) return { top: -STEPS.drop * k, what: 'step', k };
  return { top: -Infinity, what: 'none', k: 0 };
}

/** THE TURF at tile (x, y): short grass in clumps, three tones, tufts standing up in the light; the worn paths of earth and grit. */
function turfAt(x: number, y: number, px: number, py: number, r: number, a: number): C {
  const fade = 0.95 - 0.5 * (r / ISLE.turf) ** 1.6;
  // (the paths: a ring round the wordsmith's stones, and out from it to the way down, the gate and the portal's round)
  const toward = (b: number): number => Math.abs(Math.atan2(Math.sin(a - b * D2R), Math.cos(a - b * D2R))) * r;
  const wob = (vn(x * 2.2, y * 2.2, 41) - 0.5) * 0.24;
  const pd = Math.min(Math.abs(r - 3.6 + wob), r > 3.6 ? Math.min(toward(45), toward(-135), toward(-95)) + wob * 0.6 : 9);
  const w = 0.3 + 0.08 * vn(x * 4, y * 4, 47);
  if (pd < w) {
    // (earth worn bare, grit in it; the turf ragged at its edges)
    if (pd > w - 0.07 && rnd(px >> 1, py >> 1, 48) > 0.5) return lit(TURF[1], fade, px, py);
    const k = rnd(px >> 1, py, 42);
    const c = PATH[k > 0.93 ? 2 : k < 0.18 ? 0 : 1];
    return lit(c, fade + 0.05, px, py);
  }
  // (a small stone sunk in the turf now and then: round, its top lit)
  const sx = x * 2.6;
  const sy = y * 2.6;
  const ix = Math.floor(sx);
  const iy = Math.floor(sy);
  if (rnd(ix, iy, 46) > 0.9) {
    const d = Math.hypot(sx - ix - 0.5, (sy - iy - 0.5) * 1.0);
    if (d < 0.14) return lit(PEBBLE[sy - iy < 0.47 ? 4 : 2], fade + 0.1, px, py);
  }
  // (the turf: clumps of three tones; a tuft: a lit pixel over a darker one)
  const clump = vn(x * 2.4, y * 2.4, 44) + (vn(x * 7, y * 7, 49) - 0.5) * 0.25;
  let tone = clump < 0.38 ? 1 : clump > 0.66 ? 3 : 2;
  const cx = px >> 2;
  const cy = py >> 2;
  if (rnd(cx, cy, 45) > 0.55) {
    const bx = (cx << 2) + Math.floor(rnd(cx, cy, 50) * 3);
    const by = (cy << 2) + 1;
    if (px === bx && py === by) tone = Math.min(4, tone + 1);
    else if (px === bx && py === by + 1) tone = Math.max(0, tone - 1);
  }
  return lit(TURF[tone], fade, px, py);
}

/** THE SHORE at tile (x, y): grey stones packed together, each round, its top lit, a seam of dark between; wet toward the water. */
function shoreAt(x: number, y: number, px: number, py: number, depth: number): C {
  const sx = x * 4.2;
  const sy = y * 4.2;
  const ix = Math.floor(sx + vn(sx, sy, 51) * 0.6);
  const iy = Math.floor(sy + vn(sx + 7, sy, 52) * 0.6);
  let best = 9;
  let k = 0;
  let oy = 0;
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      const cx = ix + dx + rnd(ix + dx, iy + dy, 53);
      const cy = iy + dy + rnd(ix + dx, iy + dy, 54);
      const d = Math.hypot(sx - cx, sy - cy);
      if (d < best) {
        best = d;
        k = rnd(ix + dx, iy + dy, 55);
        oy = (sx - cx) + (sy - cy);
      }
    }
  if (best > 0.6) return lit(PEBBLE[0], 0.6, px, py);
  const tone = 1 + (k < 0.35 ? 0 : k > 0.8 ? 2 : 1);
  // (lit on its upper side, in shade on its lower)
  const up = oy < -0.12 && best < 0.42 ? 1 : oy > 0.3 ? -1 : 0;
  return lit(PEBBLE[Math.max(0, Math.min(4, tone + up))], (0.88 - 0.38 * depth) * (0.9 + 0.1 * k), px, py);
}

/** THE PORTAL'S ROUND: flat stones, a ring of them round one in the middle, a kerb round all, kept clear. */
function portalAt(x: number, y: number, px: number, py: number): C | null {
  const [lx, ly] = PORTAL_ROUND.at;
  const d = Math.hypot(x - lx, y - ly);
  if (d > PORTAL_ROUND.r) return null;
  const seam = mixc(SLAB[0], NIGHT, 0.4);
  if (d > PORTAL_ROUND.r - 0.14) return lit(d > PORTAL_ROUND.r - 0.04 ? seam : SLAB[3], 0.85, px, py);
  const a = Math.atan2(y - ly, x - lx);
  const ring = d < 0.4 ? 0 : 1;
  const seg = ring === 0 ? 0 : Math.floor((a / TAU + 1) * 9);
  const fa = (a / TAU + 1) * 9 - seg;
  if ((ring === 1 && fa < 0.05) || Math.abs(d - 0.4) < 0.035) return lit(seam, 0.85, px, py);
  const worn = rnd(px >> 1, py >> 1, 62) > 0.9 ? 1 : 0;
  return lit(SLAB[(ring === 0 ? 3 : 1 + (rnd(seg, 5, 61) > 0.6 ? 1 : 0)) + worn], 0.85, px, py);
}

/** THE SKY at game pixel (gx, gy): night deepening upward, a few stars. */
function skyAt(gx: number, gy: number, px: number, py: number): C {
  const up = Math.max(0, Math.min(1, (HORIZON_G - gy) / 130));
  const t = Math.floor(up * 4 + (bay(px, py) - 0.5) * 0.95);
  let c = SKY[Math.max(0, Math.min(3, 3 - t))];
  const s = rnd(Math.floor(gx), Math.floor(gy), 71);
  if (s > 0.996 && HORIZON_G - gy > 4) c = STAR[s > 0.9986 ? 1 : 0];
  return c;
}
/** The water's ripples at a picture row: thin dashes of a row's own length and offset, never on a grid; how far out (game pixels
 * from the horizon) sets how long and how many. True on a ripple's dash. */
function rippleAt(gx: number, py: number, d: number, seed: number, much: number): boolean {
  if (py % 2) return false;
  const L = (3 + rnd(py, 0, seed) * 7) * (1 + d / 70);
  const o = rnd(py, 1, seed + 1) * 80;
  const i = Math.floor((gx + o) / L);
  return rnd(i, py, seed + 2) < much;
}
/** THE SEA at game pixel (gx, gy): still and black, lighter back toward the horizon, its slightest ripples a pale dash now and then. */
function seaAt(gx: number, gy: number, px: number, py: number): C {
  const d = gy - HORIZON_G;
  const back = Math.max(0, 1 - d / 260);
  const tone = 1 + Math.max(0, Math.min(2, Math.floor(back * 2.7 + (bay(px, py) - 0.5) * 0.6)));
  if (d < 1.5) return SEA[4];
  if (rippleAt(gx, py, d, 72, 0.1 + 0.12 * back)) return SEA[Math.min(4, tone + 1)];
  return SEA[tone];
}

/** THE ISLE'S FRONT FACE at depth `dd` under its top (game pixels), the coast's angle there `a`: dark rock in strata, lit where it
 * faces left, its lip catching the light; cut stone where it is the back of the cut for the steps. */
function faceAt(gx: number, dd: number, a: number, cut: number | null, px: number, py: number): C {
  if (cut !== null) return lit(dd < 0.6 ? SLAB[3] : (rnd(Math.floor(gx), Math.floor(dd / 3), 85) > 0.8 ? SLAB[0] : SLAB[1]), cut - dd * 0.03, px, py);
  const k = 0.62 + 0.22 * (Math.sin(a) - Math.cos(a)) / Math.SQRT2;
  if (dd < 0.6) return lit(PEBBLE[2], k + 0.1, px, py);
  const st = Math.floor((dd + 2.2 * vn(gx / 9, 0, 82)) / 3.2);
  let c = FACE[[2, 1, 2, 0, 1][st % 5]];
  // (cracks running down it)
  if (rnd(Math.floor(gx + 1.5 * vn(dd / 3, gx / 5, 84)), st, 83) > 0.88) c = FACE[0];
  return lit(c, k - dd * 0.025, px, py);
}

/** What the eye meets first at picture pixel (px, py) of the ground's picture, and whether it sees the open water there (for the
 * northern lights' reflection). Numbers only. */
function groundHit(px: number, py: number): { c: C; water: boolean } {
  const gx = ISLE_GROUND.gx + (px + 0.5) / 2;
  const gy = ISLE_GROUND.gy + (py + 0.5) / 2;
  if (gy < HORIZON_G) return { c: skyAt(gx, gy, px, py), water: false };
  // (far from the isle: the open sea)
  const [mx, my] = tileAt(gx, gy - (WATER + UNDER) / 2);
  if (Math.hypot(mx - ISLE.cx, my - ISLE.cy) > 12) return { c: seaAt(gx, gy, px, py), water: true };
  // (THE LINE OF SIGHT, down into the picture half a game pixel at a time: higher things nearer the eye)
  let wet = false;
  for (let dz = 0; dz <= WATER + UNDER; dz += 0.5) {
    const z = -dz;
    const [x, y] = tileAt(gx, gy - dz);
    if (z < -WATER && !wet) wet = true;
    const S0 = solidAt(x, y);
    if (z > S0.top) continue;
    let c: C;
    const onTop = S0.top - z < 0.5;
    if (S0.what === 'isle' && onTop) {
      // THE ISLE'S TOP
      const r = Math.hypot(x - ISLE.cx, y - ISLE.cy);
      const a = Math.atan2(y - ISLE.cy, x - ISLE.cx);
      const p = portalAt(x, y, px, py);
      if (p !== null) return { c: p, water: false };
      const cr = coast(a);
      const turfEdge = cr - (ISLE.shore - ISLE.turf) - 0.28 * vn(x * 1.3, y * 1.3, 81);
      if (r <= turfEdge) return { c: turfAt(x, y, px, py, r, a), water: false };
      return { c: shoreAt(x, y, px, py, (r - turfEdge) / Math.max(0.2, cr - turfEdge)), water: false };
    }
    // (which face the line of sight came in through: the one looking right (along x), in shade, or the one looking left, lit)
    const right = solidAt(x + 0.035, y).top < z;
    if (S0.what === 'isle') {
      const nearCut = stepOf(x + 0.3, y + 0.3) > 0 || stepOf(x + 0.15, y) > 0 || stepOf(x, y + 0.15) > 0;
      c = faceAt(gx, S0.top - z, Math.atan2(y - ISLE.cy, x - ISLE.cx), nearCut ? (right ? 0.45 : 0.8) : null, px, py);
    } else {
      // THE STEPS: a tread (worn slab, its near edges lit, a dark seam where the step above stands on it) or a riser
      const [cx, cy] = STEP_C[S0.k - 1];
      const fx = cx + STEPS.half - x;
      const fy = cy + STEPS.half - y;
      const low = 0.92 - S0.k * 0.05;
      const sl = (z + WATER) < 2.2 ? 0.25 : 0;
      if (onTop) {
        let t: C;
        if (Math.min(fx, fy) < 0.05) t = SLAB[4];
        else if (S0.k > 1 && stepOf(x - 0.05, y - 0.05) === S0.k - 1) t = SLAB[0];
        else t = SLAB[rnd(Math.floor(x * 7), Math.floor(y * 7), 63 + S0.k) > 0.55 ? 3 : 2];
        c = lit(t, low, px, py);
      } else {
        const dd = S0.top - z;
        c = lit(dd < 0.6 ? SLAB[right ? 2 : 4] : SLAB[right ? 0 : 2], (right ? 0.6 : 0.9) - dd * 0.04, px, py);
      }
      // (wet and green where the sea washes it)
      if (sl) c = mixc(c, hx('#1e2a22'), 0.4);
    }
    // (at the waterline: foam, broken; under it: the water over it, darker the deeper, its ripples on top)
    if (!onTop && z >= -WATER - 0.5 && z <= -WATER + 1) return { c: rnd(Math.floor(gx / 2), Math.floor(py / 2), 86) > 0.35 ? FOAM : mixc(FOAM, SEA[3], 0.5), water: false };
    if (wet) {
      const deep = Math.min(1, (-WATER - z) / UNDER);
      const w = mixc(c, SEA[2], 0.42 + 0.45 * deep);
      return { c: rippleAt(gx, py, gy - HORIZON_G, 72, 0.18) ? mixc(w, SEA[4], 0.6) : w, water: true };
    }
    return { c, water: false };
  }
  return { c: seaAt(gx, gy, px, py), water: true };
}
/** The colour of the ground at picture pixel (px, py) of its picture (numbers only: also for the tests). */
export function isleGroundAt(px: number, py: number): C {
  return groundHit(px, py).c;
}

export interface IsleGround {
  canvas: HTMLCanvasElement;
  gx: number;
  gy: number;
  ms: number;
}
function paintWhole(at: (px: number, py: number) => C | null, w: number, h: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d') as CanvasRenderingContext2D;
  const im = g.createImageData(w, h);
  for (let py = 0; py < h; py++)
    for (let px = 0; px < w; px++) {
      const c = at(px, py);
      if (c === null) continue;
      const o = (py * w + px) * 4;
      im.data[o] = (c >> 16) & 255;
      im.data[o + 1] = (c >> 8) & 255;
      im.data[o + 2] = c & 255;
      im.data[o + 3] = 255;
    }
  g.putImageData(im, 0, 0);
  return canvas;
}
/** Where the open water is seen (1), kept from the ground's painting for the lights' reflection. */
let OPEN: Uint8Array | null = null;
/** Paint the ground once. */
export function paintIsleGround(): IsleGround {
  const t0 = performance.now();
  const W = ISLE_GROUND.w * 2;
  const open = new Uint8Array(W * ISLE_GROUND.h * 2);
  const canvas = paintWhole((px, py) => {
    const h = groundHit(px, py);
    if (h.water) open[py * W + px] = 1;
    return h.c;
  }, W, ISLE_GROUND.h * 2);
  OPEN = open;
  return { canvas, gx: ISLE_GROUND.gx, gy: ISLE_GROUND.gy, ms: performance.now() - t0 };
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE NORTHERN LIGHTS: one picture added over the ground (its colours are light), its strength breathing.

/** The curtains at a column (game pixels): how bright, where their foot hangs, how tall; a second, fainter and higher, behind. */
function curtains(gx: number): { k: number; foot: number; tall: number }[] {
  const k1 = Math.max(0, Math.min(1, 0.5 + 0.55 * Math.sin(gx / 83 + 0.6) + 0.2 * Math.sin(gx / 29 + 2)));
  const k2 = Math.max(0, Math.min(1, 0.35 + 0.5 * Math.sin(gx / 61 + 3.1)));
  return [
    { k: k1, foot: HORIZON_G - 30 - 18 * Math.sin(gx / 97 + 1.2) - 7 * Math.sin(gx / 33 + 0.4), tall: 70 + 18 * Math.sin(gx / 41) },
    { k: k2 * 0.6, foot: HORIZON_G - 58 - 14 * Math.sin(gx / 71 + 2.5), tall: 54 + 14 * Math.sin(gx / 37 + 1) },
  ];
}
/** How strongly the lights shine at a game pixel of the sky (0 ... 1), and their colour there. */
export function auroraLight(gx: number, gy: number): { a: number; c: C } {
  let a = 0;
  let c: C = AURORA.green;
  for (const K of curtains(gx)) {
    if (K.k <= 0.05) continue;
    // (each ray hangs to its own length, so that their foot is ragged, never a hill's line)
    const foot = K.foot + 8 * vn(gx / 2.2, 3, 78) - 4;
    const u = (foot - gy) / K.tall;
    if (u <= 0 || u >= 1) continue;
    // (fine rays running up them, faint; brightest a little over the foot, fading softly up into the dark)
    const rays = 0.8 + 0.2 * Math.sin(gx * 0.45 + 3 * Math.sin(gx * 0.045));
    const e = K.k * rays * (u < 0.1 ? 0.2 + 0.8 * (u / 0.1) : (1 - (u - 0.1) / 0.9) ** 2.2);
    if (e > a) {
      a = e;
      c = u < 0.12 ? AURORA.foot : mixc(AURORA.green, AURORA.violet, Math.max(0, Math.min(1, (u - 0.3) / 0.55)));
    }
  }
  return { a, c };
}
/** The lights' picture at picture pixel (px, py) of the ground's frame: the curtains in the sky, in bands; and on the open water,
 * their light in broken dashes straight down from them, the foot's green nearest the horizon, violet further out, fading toward the
 * eye; a faint sheen under them. Null: nothing. (The water's mask comes from the ground's painting.) */
export function auroraAt(px: number, py: number): C | null {
  const gx = ISLE_GROUND.gx + (px + 0.5) / 2;
  const gy = ISLE_GROUND.gy + (py + 0.5) / 2;
  if (gy < HORIZON_G) {
    const A = auroraLight(gx, gy);
    const lv = Math.floor(A.a * 5 + (bay(px, py) - 0.5) * 0.8);
    if (lv <= 0) return null;
    return mixc(0, A.c, Math.min(5, lv) * 0.13);
  }
  if (OPEN && !OPEN[py * ISLE_GROUND.w * 2 + px]) return null;
  const d = gy - HORIZON_G;
  const K = curtains(gx)[0].k * 0.85 + curtains(gx)[1].k * 0.15;
  const fade = Math.max(0, 1 - d / 210);
  if (fade <= 0 || K <= 0.05) return null;
  const col = mixc(AURORA.foot, AURORA.violet, Math.min(1, d / 140));
  if (rippleAt(gx, py, d * 0.6, 76, K * fade * 0.8)) return mixc(0, col, 0.12 + 0.3 * fade);
  const lv = Math.floor(K * fade * 2.4 + (bay(px, py) - 0.5) * 0.9);
  return lv > 0 ? mixc(0, col, lv * 0.045) : null;
}
/** Paint the lights once (added over the ground: black is nothing). After the ground, whose water they lie on. */
export function paintIsleAurora(): IsleGround {
  if (!OPEN) paintIsleGround();
  const t0 = performance.now();
  const canvas = paintWhole(auroraAt, ISLE_GROUND.w * 2, ISLE_GROUND.h * 2);
  return { canvas, gx: ISLE_GROUND.gx, gy: ISLE_GROUND.gy, ms: performance.now() - t0 };
}
/** How strongly the lights shine at time t (seconds): a slow breath, an 11 s round. */
export const auroraNow = (t: number): number => 0.72 + 0.28 * Math.sin((t / 11) * TAU) ** 2;

// ---------------------------------------------------------------------------------------------------------------------------
// THE STANDING STONES: pieces that stand, four of them.

export interface Piece {
  px: Px;
  /** Its anchor in the picture (picture pixels): the middle of its foot. */
  ox: number;
  oy: number;
  lights?: Light[];
}
const S = ['#101220', '#1a1c2e', '#24283e', '#2e3450', '#3c4266', '#4e5680', '#646e98', '#8088ac'];
const LICHEN = ['#2c3424', '#3c4830', '#55603c'];
const RUNE = ['#13606e', '#22d0e0', '#7fe8ff'];
/** Each stone: how tall (picture pixels), how long its lit face and its shaded one at its foot (tiles), how much it narrows to its
 * top, how it leans (tiles at its top, along x and y). */
export const STANDING = [
  { tall: 46, w: 0.54, d: 0.34, top: 0.74, lean: [0.03, -0.02] },
  { tall: 66, w: 0.58, d: 0.36, top: 0.7, lean: [-0.03, 0.02] },
  { tall: 88, w: 0.62, d: 0.38, top: 0.66, lean: [0.04, 0.0] },
  { tall: 108, w: 0.66, d: 0.4, top: 0.62, lean: [-0.02, -0.03] },
] as const;
/** THE RUNES OF THE ORDER cut in the stones (3 x 4 cells each), one for each stone. */
const STONE_RUNES = [['X.X', '.X.', 'X.X', '.X.'], ['XXX', 'X..', 'XX.', 'X..'], ['.X.', 'XXX', '.X.', 'X.X'], ['X..', 'XX.', 'X.X', 'XXX']];

/** Standing stone `v` (0 the lowest ... 3 the tallest): one slab of granite, narrowing as it rises and leaning a little; its face to
 * the left lit in bands, the other in shade, its top the palest; grit in it, cracks down it, lichen in patches, moss at its foot;
 * its edges bitten by the weather; the rune of the order cut in its lit face, faint, in the friend's cyan. */
export function paintStandingStone(v: number): Piece {
  const L = STANDING[Math.max(0, Math.min(3, v))];
  const seed = 900 + v * 17;
  const half = (L.w + L.d) / 2;
  const W = Math.ceil((L.w + L.d) * 32) + 10;
  const ox = Math.round(W / 2);
  const oy = L.tall + Math.ceil(half * 16) + 8;
  const H = oy + Math.ceil(half * 16) + 4;
  const p = new Px(W, H);
  const iso = new Iso(p, ox, oy);
  const [lx, ly] = L.lean;
  const tp = L.top;
  const wl = L.w * 32;
  // (a tone by bands, the dither only where two meet; grit: a pixel a tone off here and there)
  const tone = (k: number, x: number, y: number, lo: number, hi: number): string => {
    const v2 = lo + Math.max(0, Math.min(1, k)) * (hi - lo);
    let i = Math.floor(v2 + (bay(x, y) - 0.5) * 0.6);
    const g = rnd(x, y, seed);
    if (g > 0.94) i++;
    else if (g < 0.05) i--;
    return S[Math.max(0, Math.min(7, i))];
  };
  // (lichen in patches, high on it, more on the shaded side; moss at its foot)
  const lichen = (u: number, t: number, more: number): string | null => {
    const n = vn(u / 3.2, (1 - t) * L.tall / 3.2, seed + 3);
    if (t > 0.3 && n > 0.78 - more) return LICHEN[n > 0.87 - more ? 2 : n > 0.82 - more ? 1 : 0];
    if (t < 0.07 + 0.05 * vn(u / 2, 0, seed + 4)) return rnd(Math.round(u), Math.round(t * L.tall), seed + 9) > 0.5 ? '#26301e' : '#1e2618';
    return null;
  };
  // (two cracks down its lit face from its top, one down its shaded face)
  const crackAt = (u: number, t: number, wide: number, n: number): number => {
    for (let c = 0; c < n; c++) {
      const s0 = 0.25 + 0.5 * rnd(c, v, seed + 5);
      const t0 = 0.35 + 0.35 * rnd(c, v, seed + 6);
      if (t < t0) continue;
      const cu = (s0 + 0.06 * Math.sin(t * 9 + c * 2) + 0.03 * Math.sin(t * 23 + c)) * wide;
      const du = u - cu;
      if (Math.abs(du) < 0.6) return 1;
      if (du > 0.6 && du < 1.6) return 2;
    }
    return 0;
  };
  // the rune's cells on its lit face (picture pixels along the face from its left, down from its top)
  const rune = STONE_RUNES[v % STONE_RUNES.length];
  const rt = 0.62;
  const rw = wl * (1 - (1 - tp) * rt);
  const ru0 = Math.round(rw * 0.5 - 4);
  const rv0 = Math.round((1 - rt) * L.tall - 5);
  const runeAt = (u: number, vv: number): number => {
    const i = Math.floor((u - ru0) / 3);
    const j = Math.floor((vv - rv0) / 3);
    if (i < 0 || i > 2 || j < 0 || j > 3 || rune[j][i] !== 'X') return 0;
    const fu = (u - ru0) - i * 3;
    const fv = (vv - rv0) - j * 3;
    if (fu >= 2 || fv >= 2) return 0;
    return fu < 1 && fv < 1 ? 2 : 1;
  };

  // ITS LIT FACE (looking left): lit in bands, brighter higher, its edge toward the eye catching the light
  iso.slopeLeft(-L.w / 2, L.w / 2, L.d / 2, 0, lx - (L.w / 2) * tp, lx + (L.w / 2) * tp, ly + (L.d / 2) * tp, L.tall, (t, sAlong) => {
    const wide = wl * (1 - (1 - tp) * t);
    const u = sAlong * wide;
    const vv = (1 - t) * L.tall;
    const r = runeAt(u, vv);
    if (r) return r === 2 ? RUNE[1] : RUNE[0];
    const cr = crackAt(u, t, wide, 2);
    if (cr === 1) return S[1];
    const li = lichen(u, t, 0);
    if (li) return li;
    const k = 0.25 + 0.6 * t + (sAlong > 0.93 ? 0.25 : 0) + (cr === 2 ? 0.2 : 0);
    return tone(k, Math.round(u), Math.round(vv), 3, 6.4);
  });
  // ITS SHADED FACE (looking right)
  iso.slopeRight(L.w / 2, -L.d / 2, L.d / 2, 0, lx + (L.w / 2) * tp, ly - (L.d / 2) * tp, ly + (L.d / 2) * tp, L.tall, (t, sAlong) => {
    const wide = L.d * 32 * (1 - (1 - tp) * t);
    const u = sAlong * wide;
    const vv = (1 - t) * L.tall;
    if (crackAt(u, t, wide, 1) === 1) return S[0];
    const li = lichen(u + 40, t, 0.05);
    if (li) return li;
    return tone(0.2 + 0.5 * t - (sAlong < 0.08 ? -0.2 : 0), Math.round(u) + 50, Math.round(vv), 1.2, 3.6);
  });
  // ITS TOP, the palest, weathered
  iso.top(lx - (L.w / 2) * tp, ly - (L.d / 2) * tp, lx + (L.w / 2) * tp, ly + (L.d / 2) * tp, L.tall, (u, t) => {
    if (vn(u * 4, t * 4, seed + 7) > 0.74) return LICHEN[1];
    return u + t < 0.7 ? S[7] : S[6];
  });
  // ITS EDGES BITTEN BY THE WEATHER: twice, a pixel on its edge taken where the weather's noise says, the more the higher; a corner
  // (two sides open) taken more often; never its foot
  const footY = (x: number): number => oy + 16 * half - Math.abs(x - (ox + (L.w / 2 - L.d / 2) * 32)) * 0.5;
  for (let pass = 0; pass < 2; pass++) {
    const gone: [number, number][] = [];
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        if (!p.has(x, y)) continue;
        if (y > footY(x) - 5) continue;
        const open = (p.has(x - 1, y) ? 0 : 1) + (p.has(x + 1, y) ? 0 : 1) + (p.has(x, y - 1) ? 0 : 1) + (p.has(x, y + 1) ? 0 : 1);
        if (!open) continue;
        const high = 1 - (y - (oy - L.tall)) / L.tall;
        const n = vn(x / 2.6, y / 2.6, seed + 8 + pass);
        if (n > 0.66 - 0.18 * high - (open > 1 ? 0.25 : 0)) gone.push([x, y]);
      }
    for (const [x, y] of gone) p.erase(x, y);
  }
  // the rune's faint light
  const sh = 1 - (1 - tp) * rt;
  const rs = (ru0 + 4) / (wl * sh);
  const [rx, ry] = iso.at(lx * rt - (L.w / 2) * sh + rs * L.w * sh, ly * rt + (L.d / 2) * sh, L.tall * rt);
  const lights: Light[] = [{ x: rx / 2, y: (ry + 1) / 2, r: 5, color: '#22d0e0', a: 0.28 }];
  return { px: compose(null, [p]), ox, oy, lights };
}
