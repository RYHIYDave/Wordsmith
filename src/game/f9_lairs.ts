// FLOOR 9'S TWO SIDE AREAS, DRESSED FOR ITS SIDE BOSSES (docs/mockups/f9_side_bosses/README.md; their pieces art/f9_lairs.ts).
// His words, 13 Nov 2026: “I want them in the side areas, but I want the side areas stylized to them.  So like some trollish
// ramshackle barricades or whatever.  Some guardians milling around the entrance.  A misty glade for the wolf, moonlight beam coming
// down”. So, behind F9_LAIRS (off until his yes to the pictures):
//   THE LAIR, a troll chieftain's camp: grown to a boss's room (LAIR9) so the camp and its fight fit; its pack of guardians at its
//     way in (game/act1_layout.ts placePacks); barricades of sharpened logs either side of the way in, skull poles flanking it,
//     crooked palisade round the rest of its edge, the fire in its middle, lean-tos, gnawed bones, and the chieftain's seat at its
//     back, facing the way in;
//   THE SIDE AREA, the mist wolf's glade: the moonbeam coming down in its middle, a ring of standing stones round it, white dead
//     trees toward its edge, mist lying, moonflowers, a deer's bones.
// The floor's own things (its scenes, its things about) are not laid in either (game/act1_dress.ts).

import type { Blob, Lane } from './act1_layout';
import { blobDist } from './act1_layout';
import type { RNG } from '../engine/rng';

export const F9_LAIRS = { on: false };

/** The lair grown for the chieftain's camp (a boss's room, as the floor's boss's area: game/act1_layout.ts sizer). */
export const LAIR9 = { rx: 8, ry: 7, wob: 0.1 };

/** Is floor `depth` one whose side areas are dressed so? */
export const f9Lairs = (depth: number): boolean => F9_LAIRS.on && Math.floor(depth) === 9;

/**
 * WHERE AN AREA IS COME INTO: the way (a lane) whose end lies nearest its middle, and from that the unit way out of it toward the
 * way in (`ux`, `uy`) and how far its edge lies that way (`edge`, tiles).
 */
export function mouthOf(b: Blob, lanes: readonly Lane[]): { ux: number; uy: number; edge: number } {
  let best: { d: number; p: [number, number]; q: [number, number] } | null = null;
  for (const l of lanes) {
    if (l.pts.length < 2) continue;
    for (const [end, next] of [[0, 1], [l.pts.length - 1, l.pts.length - 2]] as const) {
      const p = l.pts[end];
      const d = Math.hypot(p[0] - b.x, p[1] - b.y);
      if (!best || d < best.d) best = { d, p, q: l.pts[next] };
    }
  }
  let ux = 1;
  let uy = 0;
  if (best) {
    // (the way's end is inside the area: toward the point before it is the way out)
    const far = best.d < 1.5 ? best.q : best.p;
    const dx = far[0] - b.x;
    const dy = far[1] - b.y;
    const len = Math.hypot(dx, dy) || 1;
    ux = dx / len;
    uy = dy / len;
  }
  return { ux, uy, edge: edgeAlong(b, ux, uy) };
}

/** How far from an area's middle its edge lies along (ux, uy), in tiles. */
export function edgeAlong(b: Blob, ux: number, uy: number): number {
  let t = 0;
  while (t < 30 && blobDist(b, b.x + ux * t, b.y + uy * t) < 1) t += 0.25;
  return t;
}

/** What game/act1_dress.ts lends the dresser: its tests and its hands. */
export interface LairHands {
  rng: RNG;
  free(x: number, y: number, ring: boolean): boolean;
  /** Whole floor with nothing laid on it (kept clear or not: for what is walked through, mist). */
  open(x: number, y: number): boolean;
  put(name: string, x: number, y: number, solid: boolean, variant?: number): void;
  /** A tile made solid and taken (the second tile of a piece two long, the rest of the seat). */
  block(x: number, y: number): void;
  keep(x: number, y: number): void;
}

/** A piece two tiles long laid at (x, y) along the grid axis nearest to (dx, dy): its frame 0 along x, 1 along y. */
function laidLong(h: LairHands, name: string, x: number, y: number, dx: number, dy: number): boolean {
  const alongY = Math.abs(dy) > Math.abs(dx);
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  const ox = alongY ? 0 : 1;
  const oy = alongY ? 1 : 0;
  if (!h.free(tx, ty, false) || !h.free(tx + ox, ty + oy, false)) return false;
  h.put(name, tx, ty, true, alongY ? 1 : 0);
  h.block(tx + ox, ty + oy);
  return true;
}

/** The first free tile near (x, y), a ring at a time out to `most` tiles. */
function freeNear(h: LairHands, x: number, y: number, ring: boolean, most = 2): [number, number] | null {
  for (let r = 0; r <= most; r++) {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      const tx = Math.floor(x) + dx;
      const ty = Math.floor(y) + dy;
      if (h.free(tx, ty, ring)) return [tx, ty];
    }
  }
  return null;
}

/** THE TROLLS' CAMP in the lair `b`, come into along `m`. */
export function dressTrollCamp(h: LairHands, b: Blob, m: { ux: number; uy: number; edge: number }): void {
  const { ux, uy } = m;
  const sx = -uy;
  const sy = ux;
  const at = (k: number, side: number): [number, number] => [b.x + ux * m.edge * k + sx * side, b.y + uy * m.edge * k + sy * side];
  // (the way in kept open between the barricades, from its mouth to the fire)
  for (let k = 0.2; k <= 1.05; k += 0.1) for (const side of [-1, 0, 1]) h.keep(...at(k, side).map(Math.floor) as [number, number]);
  // THE BARRICADES either side of the way in, square across it; skull poles flanking it just inside
  for (const side of [-1, 1]) {
    // (two runs of it each side, out to the edge, so the way in is the one gap in it)
    for (const off of [3, 5.2]) {
      // (on the ring 0.85 of the way to the edge, `off` to the side of the way in)
      const k0 = Math.sqrt(Math.max(0, (0.85 * m.edge) ** 2 - off * off)) / m.edge;
      for (const k of [k0, k0 - 0.08, k0 + 0.06, k0 - 0.16]) {
        const [x, y] = at(k, side * off);
        if (laidLong(h, "the trolls' barricade", x, y, sx, sy)) break;
      }
    }
    const pole = freeNear(h, ...at(0.6, side * 2.2), false, 1);
    if (pole) h.put('a skull pole', pole[0], pole[1], true, side > 0 ? 0 : 1);
  }
  // THE CHIEFTAIN'S SEAT at its back, facing the way in (two tiles each way)
  const back = edgeAlong(b, -ux, -uy);
  for (const k of [0.62, 0.55, 0.7, 0.48]) {
    const x = Math.floor(b.x - ux * back * k);
    const y = Math.floor(b.y - uy * back * k);
    if ([[0, 0], [1, 0], [0, 1], [1, 1]].every(([dx, dy]) => h.free(x + dx, y + dy, false))) {
      h.put("the chieftain's seat", x, y, true);
      h.block(x + 1, y);
      h.block(x, y + 1);
      h.block(x + 1, y + 1);
      break;
    }
  }
  // THE FIRE in its middle
  const fire = freeNear(h, b.x, b.y, true, 2);
  if (fire) h.put("the trolls' fire", fire[0], fire[1], true, h.rng.int(0, 3));
  // THE PALISADE round the rest of its edge, along it
  const a0 = Math.atan2(uy, ux);
  for (let deg = 62; deg <= 298; deg += 34) {
    const a = a0 + (deg * Math.PI) / 180;
    const cx = Math.cos(a);
    const cy = Math.sin(a);
    const e = edgeAlong(b, cx, cy);
    for (const k of [0.84, 0.78, 0.9]) {
      if (laidLong(h, "the trolls' palisade", b.x + cx * e * k, b.y + cy * e * k, -cy, cx)) break;
    }
  }
  // LEAN-TOS to either side, gnawed bones about
  for (const side of [-1, 1]) {
    const a = a0 + side * 1.75;
    const e = edgeAlong(b, Math.cos(a), Math.sin(a));
    const t = freeNear(h, b.x + Math.cos(a) * e * 0.58, b.y + Math.sin(a) * e * 0.58, true, 1);
    if (t) h.put("a troll's lean-to", t[0], t[1], true, side > 0 ? 0 : 1);
  }
  for (let k = 0, tries = 0; k < 4 && tries < 40; tries++) {
    const a = h.rng.range(0, Math.PI * 2);
    const d = h.rng.range(0.25, 0.7);
    const x = Math.floor(b.x + Math.cos(a) * b.rx * d);
    const y = Math.floor(b.y + Math.sin(a) * b.ry * d);
    if (!h.free(x, y, false)) continue;
    h.put('gnawed bones', x, y, false, h.rng.int(0, 1));
    k++;
  }
}

/** THE MISTY GLADE in the side area `b`, come into along `m`. */
export function dressMistGlade(h: LairHands, b: Blob, m: { ux: number; uy: number; edge: number }): void {
  const a0 = Math.atan2(m.uy, m.ux);
  // THE MOONBEAM in its middle (in no one's way)
  const mid = freeNear(h, b.x, b.y, false, 2) ?? [Math.floor(b.x), Math.floor(b.y)];
  h.put('the moonbeam', mid[0], mid[1], false, h.rng.int(0, 3));
  // A RING OF STANDING STONES round it, open toward the way in
  for (let k = 0; k < 6; k++) {
    const a = a0 + ((k + 0.5) / 6) * Math.PI * 2;
    if (Math.abs(Math.atan2(Math.sin(a - a0), Math.cos(a - a0))) < 0.6) continue;
    const e = edgeAlong(b, Math.cos(a), Math.sin(a));
    const t = freeNear(h, b.x + Math.cos(a) * e * 0.5, b.y + Math.sin(a) * e * 0.5, true, 1);
    if (t) h.put('a standing stone, clawed', t[0], t[1], true, k % 2);
  }
  // WHITE DEAD TREES toward its edge
  for (let k = 0; k < 3; k++) {
    const a = a0 + Math.PI * (0.55 + k * 0.45) + h.rng.range(-0.2, 0.2);
    const e = edgeAlong(b, Math.cos(a), Math.sin(a));
    const t = freeNear(h, b.x + Math.cos(a) * e * 0.8, b.y + Math.sin(a) * e * 0.8, true, 1);
    if (t) h.put('a white dead tree', t[0], t[1], true, k % 2);
  }
  // MIST LYING, MOONFLOWERS, A DEER'S BONES
  const lay = (name: string, n: number, lo: number, hi: number, frames: number, through = false): void => {
    for (let k = 0, tries = 0; k < n && tries < 60; tries++) {
      const a = h.rng.range(0, Math.PI * 2);
      const d = h.rng.range(lo, hi);
      const x = Math.floor(b.x + Math.cos(a) * b.rx * d);
      const y = Math.floor(b.y + Math.sin(a) * b.ry * d);
      if (!(through ? h.open(x, y) : h.free(x, y, false))) continue;
      h.put(name, x, y, false, h.rng.int(0, frames - 1));
      k++;
    }
  };
  lay('mist, lying', 14, 0.1, 0.92, 2, true);
  lay('moonflowers', 5, 0.2, 0.6, 2);
  lay("a deer's bones, picked clean", 1, 0.3, 0.6, 1);
}
