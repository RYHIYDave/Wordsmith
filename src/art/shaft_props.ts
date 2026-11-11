// THE ENDLESS TOWN, THE SHAFT'S RIM: THE THINGS THAT STAND ON IT (the art chat, 11 Nov 2026, step 4). Behind the same switch as its
// ground, ENDLESS_TOWN in art/shaft_rim.ts (off): nothing of the game imports this file (tests/shaft_rim.test.ts holds that).
//
// His yes on the pit, the stair and the ground, by 13:06: “Yes, draw the rest (Recommended)” (offered as: next, the gate, the record
// stone, the trophies wall, the socket in the bench and the torches, then a film of the town alive). The words and the layout:
// docs/mockups/endless_town/README.md, “Step 4”.
//
// WHAT IS HERE, each painted as the town's own things are (art/town.ts: built on the grid with art/isokit.ts, two picture pixels to a
// game pixel, the dark seam round each, light from the upper left: a side that looks down the screen to the left is lit, one that
// looks to the right is in shade), each a picture with its anchor (the middle of its foot) and the tiles it stands on:
//   THE GATE        an arch standing free at the back of the rim, older than the town, of the shaft's own top stone (the town's
//                   stone of the splash, art/endless_splash.ts TOWN): big weathered blocks, a ring of wedge stones, a keystone, a
//                   broken cap; its doorway opens on the dark. On its lintel THREE ROUND SOCKETS, empty and dim, where the game
//                   shows the three words set on the next dungeon (`GATE_SOCKETS`).
//   THE RECORD      a tall standing slab, one stone, notched for each endless level he has reached: tally cuts in rows, four
//                   upright and the fifth across them, ten to a row; the newest may glow the friend's cyan (`RECORD_NOTCHES`).
//   THE TROPHIES    a low wall with four mounts, an iron bracket and a plate each; filled, the trophy of that boss hung on it (the
//                   bosses of floors 5, 10, 15 and 20: the Fleshmancer's skull on his staff's stub, the Swamp Colossus's eye on its
//                   tongue's stump, the Censor's mask on his fan of black pages, the Moth's wings pinned open). Dead: none glows.
//   THE SOCKET      the wordsmith's slab (the game's own, art/town.ts makeRuneSlab) with a round hollow cut in four in its top in
//                   place of the great rune, empty: the tablet is set in it later (`BENCH_SOCKET`).
//   THE TORCHES     four tall posts, each an iron cup and a flame (12 frames at 30 a second), and a warm pool on the paving.
//
// The pictures are made of plain numbers (`Px`), so the tests read them without a browser; `rimProps()` turns them into the
// game's Sprites.

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { Iso } from './isokit';
import { GRAIN, INK, SPARK, TEAL, compose } from './kit';
import { IRON } from './mkit';
import { EMBER, tongue } from './props';
import { RIM_LAYOUT } from './shaft_rim';

// ---------------------------------------------------------------------------------------------------------------------------
// THE STONE: the shaft's top stone (the splash's town storey), its shade from the rim's night. Dark to light.

const S = ['#141018', '#241c26', '#352b34', '#463a40', '#584a4c', '#6a5a58', '#7e6c64', '#958474'] as const;
const DARK = '#07060f';
const VOID = ['#07060f', '#0b0916', '#100d1e'] as const;

function h3(x: number, y: number, k: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(k | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/**
 * Dressed blocks laid in courses on a face: `u` along it (picture pixels), `z` up from the ground. `lit`: the face that looks to
 * the left (in the light), else the one in shade. Each block its own length and tone; a seam of one pixel; its top edge catches
 * the light; now and then a chip or a stain run down from a joint.
 */
function ashlar(u: number, z: number, lit: boolean, seed: number, course = 13, long = 22): string {
  const row = Math.floor(z / course);
  const fz = z - row * course;
  const off = h3(row, seed, 3) * long;
  const len = (b: number): number => long * (0.7 + 0.6 * h3(b, row, seed + 5));
  // (walk along the course to the block u falls in: each its own length)
  let start = -off;
  let b = 0;
  while (start + len(b) <= u) {
    start += len(b);
    b++;
  }
  const fu = u - start;
  const T = lit ? [S[3], S[4], S[5], S[6]] : [S[1], S[2], S[3], S[4]];
  if (fz >= course - 1 || fu < 1) return T[0];
  const k = h3(b, row, seed + 7);
  let tone = k < 0.3 ? 1 : k > 0.82 ? 3 : 2;
  // (the top edge of a block, under the seam, catches the light; its foot is a step darker)
  if (fz >= course - 2 && tone < 3) tone++;
  else if (fz < 1 && tone > 1) tone--;
  // (weather: a stain run down from some joints)
  if (h3(b, row, seed + 11) > 0.72 && fu > 3 && fu < 5 && fz < course - 3) tone = Math.max(1, tone - 1);
  if (h3(Math.floor(u), Math.floor(z), seed + 13) > 0.985) tone = Math.max(1, tone - 1);
  return T[tone];
}

const top3 = (u: number, v: number, edge = 0.08): string => (u < edge || v < edge * 2 ? S[7] : u > 1 - edge || v > 1 - edge * 2 ? S[5] : S[6]);

export interface Piece {
  px: Px;
  /** Its anchor in the picture (picture pixels): the middle of its foot. */
  ox: number;
  oy: number;
  lights?: Light[];
}
const sprite = (p: Piece): Sprite => {
  const s = p.px.sprite(p.ox, p.oy, GRAIN);
  if (p.lights?.length) s.lights = p.lights;
  return s;
};

// ---------------------------------------------------------------------------------------------------------------------------
// THE GATE: standing free, its length along x (it looks down the screen to the left, across the whole town toward the pit).

/** Its half length and half depth (tiles); the plinth's height; the springing of its arch, the arch's half span and rise (picture pixels on its face); the lintel's top; the cap. */
const G = { a: 1.45, b: 0.26, plinth: 8, spring: 70, half: 30, rise: 34, ring: 10, top: 134, cap: 8 } as const;
/** Its face: how many picture pixels along it. */
const G_FACE = Math.round(2 * G.a * 32);
const G_MID = G_FACE / 2;
/** The three word sockets on the lintel: their middles along the face, their height, their radius (picture pixels). */
const SOCK = { us: [G_MID - 22, G_MID, G_MID + 22], z: 120, r: 6 } as const;

/** Is (u, z) on the gate's face inside its doorway (the arch's opening)? */
function inDoor(u: number, z: number): boolean {
  const du = u + 0.5 - G_MID;
  if (z < G.plinth) return false;
  if (z < G.spring) return Math.abs(du) < G.half;
  return (du / G.half) ** 2 + ((z - G.spring) / G.rise) ** 2 < 1;
}

export function paintGate(): Piece {
  const W = 124;
  const H = 210;
  const ox = 62;
  const oy = 182;
  const p = new Px(W, H);
  const iso = new Iso(p, ox, oy);
  const { a, b } = G;
  // THE PLINTH: one long step of the same stone, worn
  iso.box(-a - 0.1, -b - 0.1, a + 0.1, b + 0.1, 0, G.plinth, {
    top: (u, v) => (h3(Math.floor(u * 40), Math.floor(v * 6), 1) > 0.9 ? S[5] : v > 0.85 ? S[7] : S[6]),
    left: (u, v, _w, h) => (v === 0 ? S[7] : v >= h - 1 ? S[2] : ashlar(u, G.plinth - v, true, 2, 99, 30)),
    right: (u, v, _w, h) => (v === 0 ? S[5] : v >= h - 1 ? S[1] : S[3]),
  });
  // THE DARK in the doorway: a plane of night halfway through it, nothing seen in it
  iso.left(-a, a, 0, G.plinth, G.top, (u, v) => {
    const z = G.top - v;
    if (!inDoor(u, z)) return null;
    const du = Math.abs(u + 0.5 - G_MID);
    return du > G.half - 3 || z > G.spring + G.rise * 0.86 ? VOID[2] : z < G.plinth + 3 ? VOID[1] : VOID[0];
  });
  // THE LEFT JAMB'S INNER SIDE, seen through the doorway (it looks to the right: in shade)
  const xL = -a + (G_MID - G.half) / 32;
  iso.right(xL, 0, b, G.plinth, G.spring, (u, v) => (v < 1 ? S[2] : ashlar(u + 7, G.spring - v, false, 9)));
  // THE FACE: courses of big blocks; round the doorway a ring of wedge stones and a keystone; the three sockets on the lintel
  iso.left(-a, a, b, G.plinth, G.top, (u, v, _w, _h, X, Y) => {
    const z = G.top - v;
    const du = u + 0.5 - G_MID;
    if (inDoor(u, z)) {
      // (the arch's underside, where neither the dark nor the jamb is: the stone's thickness in shade; the floor under it shows)
      if (p.has(X, Y)) return null;
      return z > G.plinth + 6 ? S[1] : null;
    }
    // the word sockets
    for (const su of SOCK.us) {
      const d = Math.hypot(u + 0.5 - su, z - SOCK.z);
      if (d < SOCK.r + 2.2) {
        if (d < SOCK.r - 1.6) return INK;
        if (d < SOCK.r - 0.5) return z > SOCK.z ? TEAL[0] : '#0a2a3a';
        if (d < SOCK.r + 1) return (u + 0.5 - su) - (z - SOCK.z) < 0 ? S[7] : S[4];
        return S[3];
      }
    }
    // the ring of wedge stones round the arch
    if (z >= G.spring - 2) {
      const ru = du / G.half;
      const rz = (z - G.spring) / G.rise;
      const r = Math.hypot(ru, rz);
      const out = 1 + G.ring / G.half;
      if (r < out) {
        const ang = Math.atan2(rz, ru);
        const n = 11;
        const k = (ang / Math.PI) * n;
        const key = Math.abs(k - n / 2) < 0.75;
        if (!key && Math.abs(k - Math.round(k)) * (Math.PI / n) * G.half * r < 0.6) return S[3];
        if (r > out - 0.05) return S[3];
        if (key) return r < 1.06 ? S[5] : S[7];
        return r < 1.06 ? S[6] : h3(Math.floor(k), 0, 21) > 0.5 ? S[5] : S[6];
      }
    }
    // the lintel's course over the ring: one long dressed stone, its edges lit
    if (z >= G.spring + G.rise + G.ring - 1) {
      if (z >= G.top - 2) return S[7];
      if (z < G.spring + G.rise + G.ring) return S[3];
      return u < 2 || u > G_FACE - 3 ? S[3] : (Math.floor(u / 31) !== Math.floor((u - 1) / 31) && u > 1 ? S[3] : h3(Math.floor(u / 31), 1, 23) > 0.5 ? S[5] : S[6]);
    }
    // a crack down the left pillar, old
    if (Math.abs(u - (8 + Math.round(Math.sin(z * 0.21) * 1.5))) < 0.6 && z > 30 && z < 66) return S[2];
    return ashlar(u, z - G.plinth, true, 5);
  });
  // ITS END: the right pillar's side (in shade)
  iso.right(a, -b, b, G.plinth, G.top, (u, v) => {
    const z = G.top - v;
    return z >= G.top - 2 ? S[4] : ashlar(u + 11, z - G.plinth, false, 5);
  });
  // ITS TOP, under the cap
  iso.top(-a, -b, a, b, G.top, () => S[5]);
  // THE CAP: five long stones, each its own height; the last broken off, lower, its break rough
  const caps = [[-a - 0.06, -0.92, 0], [-0.92, -0.32, 1], [-0.32, 0.3, -1], [0.3, 0.88, 1], [0.88, a + 0.06, -4]] as const;
  for (const [x0, x1, dz] of caps) {
    const z1 = G.top + G.cap + dz;
    const broken = dz < -2;
    iso.box(x0, -b - 0.05, x1, b + 0.05, G.top, z1, {
      top: (u, v) => (broken && h3(Math.floor(u * 9), Math.floor(v * 4), 31) > 0.55 ? S[4] : top3(u, v)),
      left: (u, v, w, h) => (v === 0 ? S[7] : v >= h - 1 ? S[3] : broken && u > w - 4 && v < 3 ? null : u < 1 ? S[4] : S[5]),
      right: (_u, v, _w, h) => (v === 0 ? S[5] : v >= h - 1 ? S[1] : S[3]),
    });
  }
  return { px: compose(null, [p]), ox, oy };
}

/** Where the three word sockets are, in game pixels from the gate's anchor (their middles), and their radius. */
export const GATE_SOCKETS: { x: number; y: number; r: number }[] = (() => {
  const out: { x: number; y: number; r: number }[] = [];
  for (const su of SOCK.us) {
    // (the face's column su: x along the face; its top edge at z = G.top sits on the face's line)
    const x = -G.a + su / 32;
    const sx = (x - G.b) * 32;
    const sy = (x + G.b) * 16 - SOCK.z;
    out.push({ x: sx / GRAIN, y: sy / GRAIN, r: SOCK.r / GRAIN });
  }
  return out;
})();

// ---------------------------------------------------------------------------------------------------------------------------
// THE RECORD STONE: one tall slab, its broad side looking down the screen to the left; tally cuts in rows on it.

const R = { a: 0.44, b: 0.13, plinth: 7, h: 112 } as const;
/** The stone's top along it (t from -1 at its left end to 1 at its right): a shoulder, leaning a little. */
const recTop = (t: number): number => R.h - 4 + 11 * Math.sqrt(Math.max(0, 1 - ((t + 0.2) / 1.2) ** 2)) - (t > 0.55 ? (t - 0.55) * 14 : 0);
/** How many notches it has room for: seven rows of ten. */
export const RECORD_ROOM = 70;
const NOTCH_TOP = 100;
const NOTCH_ROW = 9;
const NOTCH_LEN = 6;
/** Notch i on the face: its column (picture pixels along the face), the height of its top, and whether it is the fifth (across). */
function notchOnFace(i: number): { u: number; z: number; slash: boolean } {
  const row = Math.floor(i / 10);
  const g = Math.floor((i % 10) / 5);
  const k = i % 5;
  const u0 = 2 + g * 13;
  return { u: k < 4 ? u0 + k * 3 + 1 : u0, z: NOTCH_TOP - row * NOTCH_ROW, slash: k === 4 };
}

/** The record stone with `n` notches cut; the last of them glowing the friend's cyan when `newest`. */
export function paintRecord(n: number, newest = false): Piece {
  const W = 52;
  const H = 156;
  const ox = 26;
  const oy = 140;
  const p = new Px(W, H);
  const iso = new Iso(p, ox, oy);
  const face = Math.round(2 * R.a * 32);
  // ITS FOOT: rough stones set round it in the rock
  iso.box(-R.a - 0.08, -R.b - 0.1, R.a + 0.08, R.b + 0.1, 0, R.plinth, {
    top: (u, v) => (h3(Math.floor(u * 10), Math.floor(v * 3), 41) > 0.6 ? S[5] : S[4]),
    left: (u, v, _w, h) => (v === 0 ? S[6] : v >= h - 1 ? S[1] : h3(Math.floor(u / 6), 0, 42) > 0.5 ? S[3] : S[4]),
    right: (_u, v, _w, h) => (v === 0 ? S[4] : v >= h - 1 ? S[1] : S[2]),
  });
  // THE SLAB, slice by slice along it (nearest last), each its own height: so its shoulder is a real shape
  for (let c = 0; c < face; c++) {
    const x0 = -R.a + c / 32;
    const x1 = x0 + 1 / 32;
    const t = ((c + 0.5) / face) * 2 - 1;
    const zt = Math.round(recTop(t));
    iso.box(x0, -R.b, x1, R.b, R.plinth, zt, {
      top: () => (c < 2 ? S[7] : S[6]),
      left: (_u, v) => {
        const z = zt - v;
        if (v === 0) return S[7];
        // (lit down its left edge; weathered streaks down from its top; a band of lichen-dark low down)
        if (c < 2) return S[7];
        if (c > face - 3) return S[4];
        if (h3(c >> 1, 0, 51) > 0.8 && zt - z < 18 + h3(c, 1, 52) * 20) return S[4];
        if (z < R.plinth + 12 && h3(c >> 2, Math.floor(z / 4), 53) > 0.75) return S[4];
        return h3(Math.floor(c / 9), Math.floor(z / 26), 54) > 0.7 ? S[6] : S[5];
      },
      // (between two slices the step is the top's own tone, so the shoulder is one smooth stone; the last is its end, in shade)
      right: (_u, v) => (c < face - 1 ? (c < 2 ? S[7] : S[6]) : v === 0 ? S[5] : S[3]),
    });
  }
  // THE NOTCHES: each a cut one pixel wide, dark, its far wall catching the light; the newest the friend's cyan
  const lights: Light[] = [];
  const at = (u: number, z: number): [number, number] => {
    const [x, y] = iso.at(-R.a + (u + 0.5) / 32, R.b, z);
    return [Math.round(x - 0.5), Math.round(y - 0.5)];
  };
  for (let i = 0; i < Math.min(n, RECORD_ROOM); i++) {
    const q = notchOnFace(i);
    const glow = newest && i === n - 1;
    const cut = glow ? SPARK[3] : S[1];
    const wall = glow ? SPARK[2] : S[7];
    if (!q.slash) {
      const [x, y] = at(q.u, q.z);
      for (let k = 0; k < NOTCH_LEN; k++) {
        p.set(x, y + k, cut);
        p.set(x + 1, y + k, wall);
      }
      if (glow) lights.push({ x: x / GRAIN, y: (y + 3) / GRAIN, r: 9, color: SPARK[2], a: 0.45 });
    } else {
      const [x0, y0] = at(q.u - 1, q.z - NOTCH_LEN - 1);
      const [x1, y1] = at(q.u + 10, q.z + 2);
      p.line(x0, y0 + 1, x1, y1 + 1, wall);
      p.line(x0, y0, x1, y1, cut);
      if (glow) lights.push({ x: (x0 + x1) / 2 / GRAIN, y: (y0 + y1) / 2 / GRAIN, r: 10, color: SPARK[2], a: 0.45 });
    }
  }
  return { px: compose(null, [p]), ox, oy, lights };
}

/** Where each notch is, in game pixels from the record's anchor (an upright: its top; the fifth: its two ends), for the first RECORD_ROOM. */
export const RECORD_NOTCHES: { i: number; x: number; y: number; x1?: number; y1?: number; slash: boolean }[] = Array.from({ length: RECORD_ROOM }, (_, i) => {
  const q = notchOnFace(i);
  const on = (u: number, z: number): [number, number] => {
    const x = -R.a + (u + 0.5) / 32;
    return [((x - R.b) * 32) / GRAIN, ((x + R.b) * 16 - z) / GRAIN];
  };
  if (!q.slash) {
    const [x, y] = on(q.u, q.z);
    return { i, x, y, slash: false };
  }
  const [x, y] = on(q.u - 1, q.z - NOTCH_LEN - 1);
  const [x1, y1] = on(q.u + 10, q.z + 2);
  return { i, x, y, x1, y1, slash: true };
});

// ---------------------------------------------------------------------------------------------------------------------------
// THE TROPHIES WALL: a low wall along x, four mounts on its lit side.

const T = { a: 1.45, b: 0.2, plinth: 6, h: 50, cap: 6 } as const;
const T_FACE = Math.round(2 * T.a * 32);
/** The four mounts: their middles along the face, and the height of their plates' middle (picture pixels). */
const MOUNT = { us: [12, 35, 58, 81], z: 30 } as const;
/** The bosses whose tablet quarters he holds in endless, in order: floor 5, 10, 15 and 20 (game/bosses.ts bossKind, game/act1.ts ACT1_FLOORS). */
export const TROPHY_BOSSES = [
  { floor: 5, kind: 'fleshmancer', name: 'the Fleshmancer' },
  { floor: 10, kind: 'eye', name: 'the Swamp Colossus' },
  { floor: 15, kind: 'censor', name: 'the Censor' },
  { floor: 20, kind: 'moth', name: 'the Moth' },
] as const;

/** The wall alone, its mounts empty (each an iron bracket and a plate). */
export function paintTrophyWall(): Piece {
  const W = 124;
  const H = 120;
  const ox = 62;
  const oy = 100;
  const p = new Px(W, H);
  const iso = new Iso(p, ox, oy);
  iso.box(-T.a - 0.07, -T.b - 0.07, T.a + 0.07, T.b + 0.07, 0, T.plinth, {
    top: (u) => (u < 0.02 ? S[7] : S[6]),
    left: (u, v, _w, h) => (v === 0 ? S[7] : v >= h - 1 ? S[2] : ashlar(u, T.plinth - v, true, 61, 99, 26)),
    right: (_u, v, _w, h) => (v === 0 ? S[5] : v >= h - 1 ? S[1] : S[3]),
  });
  iso.left(-T.a, T.a, T.b, T.plinth, T.h, (u, v) => {
    const z = T.h - v;
    // the plates: oak boards in an iron rim, each set into the wall, two rivets
    for (const mu of MOUNT.us) {
      const du = u + 0.5 - mu;
      const dz = z - MOUNT.z;
      const half = 6 - Math.max(0, -dz - 3) * 0.7;
      if (Math.abs(du) < half && dz > -9 && dz < 8) {
        const rim = Math.abs(du) > half - 1.2 || dz > 6.5 || dz < -7.6;
        if (rim) return dz > 6.5 || du < 0 ? IRON[3] : IRON[1];
        if (Math.abs(du + 2.5) < 1 && (dz === 4 || dz === -5)) return IRON[3];
        if (Math.abs(du - 2.5) < 1 && (dz === 4 || dz === -5)) return IRON[3];
        return dz > 4 ? IRON[2] : '#26244a';
      }
    }
    return ashlar(u, z - T.plinth, true, 63, 9, 15);
  });
  iso.right(T.a, -T.b, T.b, T.plinth, T.h, (u, v) => ashlar(u + 5, T.h - v - T.plinth, false, 63, 9, 15));
  iso.top(-T.a, -T.b, T.a, T.b, T.h, () => S[5]);
  // the cap: four stones, a little proud of the wall
  const caps = [[-T.a - 0.05, -0.7], [-0.7, 0.05], [0.05, 0.78], [0.78, T.a + 0.05]] as const;
  caps.forEach(([x0, x1], k) => {
    const z1 = T.h + T.cap - (k === 2 ? 1 : 0);
    iso.box(x0, -T.b - 0.05, x1, T.b + 0.05, T.h, z1, {
      top: (u, v) => top3(u, v, 0.05),
      left: (u, v, _w, h) => (v === 0 ? S[7] : v >= h - 1 ? S[3] : u < 1 ? S[4] : S[5]),
      right: (_u, v, _w, h) => (v === 0 ? S[5] : v >= h - 1 ? S[1] : S[3]),
    });
  });
  // THE BRACKETS: an iron arm out of the wall over each plate, turned up at its end into a hook
  for (const tip of mountTips(iso)) {
    const [x, y] = tip;
    // (its foot plate on the wall, the arm out and down to the hook, a strut under it back to the wall)
    p.set(x + 5, y - 4, IRON[3]).set(x + 5, y - 3, IRON[2]).set(x + 5, y - 2, IRON[1]);
    p.set(x + 4, y - 3, IRON[3]).set(x + 3, y - 2, IRON[3]).set(x + 2, y - 2, IRON[3]).set(x + 1, y - 1, IRON[3]).set(x, y, IRON[3]);
    p.set(x + 4, y - 1, IRON[1]).set(x + 3, y, IRON[1]).set(x + 2, y, IRON[1]).set(x + 1, y, IRON[2]);
    p.set(x - 1, y, IRON[2]).set(x - 1, y - 1, IRON[3]).set(x - 1, y - 2, IRON[3]);
  }
  return { px: compose(null, [p]), ox, oy };
}
/** The tips of the four brackets in the wall's picture (picture pixels): an arm a few pixels out from the face above each plate. */
function mountTips(iso: Iso): [number, number][] {
  return MOUNT.us.map((mu) => {
    const [x, y] = iso.at(-T.a + mu / 32, T.b + 0.12, MOUNT.z + 11);
    return [Math.round(x), Math.round(y)];
  });
}

// The trophies: each painted upright, hung from its bracket's hook (its top middle at the tip), 24 x 30 picture pixels at most.
// Original to this game, each made from the boss's own look and colours so that the player knows it at once; dead, so dull.

type Ramp4 = readonly [string, string, string, string];
const STAFF_BONE: Ramp4 = ['#3e2c2c', '#9a7c62', '#d6bc94', '#efdcb8'];
const FM_ROBE: Ramp4 = ['#170a1b', '#3a1440', '#6e2660', '#8a3a74'];
const CO_SCLERA: Ramp4 = ['#4a3e30', '#76664e', '#a08c6a', '#c4b08a'];
const CO_TONGUE: Ramp4 = ['#170e0f', '#2f1d1f', '#4a3031', '#6a4846'];
const CO_VEIN = '#4e0e14';
const DEAD_IRIS: Ramp4 = ['#2a2416', '#4a4026', '#6a5a30', '#7e6c3c'];
const MASK: Ramp4 = ['#5e5a62', '#9a96a0', '#c4bfc8', '#e8e4ec'];
const PAGES: Ramp4 = ['#08070b', '#1c1a22', '#2c2a33', '#706c78'];
const BAMBOO: Ramp4 = ['#5a564c', '#8a8270', '#aaa290', '#ccc4b0'];
const BRISTLE: Ramp4 = ['#050408', '#141218', '#262230', '#3c3648'];
const WING: Ramp4 = ['#161517', '#3a383c', '#545156', '#736f74'];
const WING_H: Ramp4 = ['#1a191b', '#424043', '#5d5a5e', '#7f7b7f'];
const MBONE: Ramp4 = ['#45403a', '#958c7e', '#c1b8a7', '#e3dccd'];
const FUR: Ramp4 = ['#100e12', '#35313a', '#524d55', '#77717a'];

/** Trophy k (0: floor 5 ... 3: floor 20), its hook at (12, 2) of a 24 x 30 picture. */
export function paintTrophy(k: number): Piece {
  const p = new Px(24, 30);
  const cx = 12;
  const ell = (x0: number, y0: number, rx: number, ry: number, f: (dx: number, dy: number, d: number) => string | null): void => {
    for (let y = Math.floor(y0 - ry); y <= Math.ceil(y0 + ry); y++)
      for (let x = Math.floor(x0 - rx); x <= Math.ceil(x0 + rx); x++) {
        const dx = (x + 0.5 - x0) / rx;
        const dy = (y + 0.5 - y0) / ry;
        const d = Math.hypot(dx, dy);
        if (d <= 1) {
          const c = f(dx, dy, d);
          if (c) p.set(x, y, c);
        }
      }
  };
  // (a cord from the hook, of the boss's own: a thong of hide)
  if (k === 0) {
    // THE FLESHMANCER: the burning skull of his staff, burnt out: fused bone, the sockets black; on the stub of his staff of
    // fused bones; a rag of his plum robe tied under it
    p.vline(cx, 1, 3, IRON[1]);
    // the rag, hanging behind the stub
    p.poly([[cx - 5, 18], [cx + 5, 18], [cx + 6, 27], [cx + 3, 25], [cx + 1, 29], [cx - 2, 26], [cx - 5, 28]], FM_ROBE[1]);
    p.poly([[cx - 4, 18], [cx - 1, 18], [cx - 2, 26], [cx - 4, 27]], FM_ROBE[2]);
    // the stub: three bones fused, knuckled
    for (let y = 15; y < 27; y++) {
      p.set(cx - 1, y, STAFF_BONE[2]).set(cx, y, y % 4 === 0 ? STAFF_BONE[3] : STAFF_BONE[1]).set(cx + 1, y, STAFF_BONE[0]);
    }
    // the skull: a dome, the brow, the cheeks drawn in, the jaw gone
    ell(cx, 9, 6.2, 6, (dx, dy) => (dy > 0.55 && Math.abs(dx) > 0.55 ? null : dx < -0.35 && dy < 0.1 ? STAFF_BONE[3] : dx > 0.45 ? STAFF_BONE[1] : STAFF_BONE[2]));
    p.rect(cx - 3, 14, 7, 2, STAFF_BONE[2]).set(cx + 3, 15, STAFF_BONE[1]);
    // the sockets, black, the nose's hollow, the teeth
    p.rect(cx - 4, 9, 3, 3, INK).rect(cx + 1, 9, 3, 3, INK).set(cx - 4, 9, STAFF_BONE[2]).set(cx + 3, 9, STAFF_BONE[1]);
    p.set(cx, 12, INK).set(cx - 1, 13, INK);
    for (let x = cx - 3; x <= cx + 3; x += 2) p.set(x, 15, STAFF_BONE[0]);
    // a crack across the dome, and the soot where it burned
    p.set(cx + 1, 4, STAFF_BONE[0]).set(cx + 2, 5, STAFF_BONE[0]).set(cx + 2, 6, STAFF_BONE[0]).set(cx + 3, 7, STAFF_BONE[0]);
    p.set(cx - 2, 4, STAFF_BONE[1]).set(cx - 1, 3, STAFF_BONE[1]);
  } else if (k === 1) {
    // THE SWAMP COLOSSUS: the eye at the end of its tongue, put out: the white gone yellow, veined, the gold of its iris dead to a dull
    // brown, the slit shut to a line; the tongue's stump under it, in its sections, curling
    p.vline(cx, 1, 2, IRON[1]);
    for (let s = 0; s < 4; s++) {
      const y0 = 16 + s * 3;
      const x0 = cx + Math.round(Math.sin(s * 0.9) * 2.5) - (s === 3 ? 2 : 0);
      const w = 4 - s * 0.6;
      ell(x0, y0 + 1, w, 1.9, (dx, dy) => (dy < -0.4 ? CO_TONGUE[3] : dx > 0.4 ? CO_TONGUE[1] : CO_TONGUE[2]));
      p.set(Math.round(x0 - w + 0.5), y0 + 2, CO_TONGUE[0]);
    }
    // a drip of the swamp's slime, dried
    p.set(cx + 3, 21, CO_TONGUE[3]).set(cx + 3, 22, CO_TONGUE[2]);
    ell(cx, 10, 7.4, 7.2, (dx, dy, d) => {
      if (d > 0.88) return dx + dy > 0.2 ? CO_SCLERA[0] : CO_SCLERA[1];
      // the iris, dead, and its slit
      const di = Math.hypot(dx - 0.08, dy + 0.02);
      if (di < 0.5) {
        if (Math.abs(dx - 0.08) < 0.09 && Math.abs(dy) < 0.42) return INK;
        return di > 0.4 ? DEAD_IRIS[0] : dx + dy < -0.2 ? DEAD_IRIS[3] : di < 0.25 ? DEAD_IRIS[1] : DEAD_IRIS[2];
      }
      return dx < -0.25 && dy < -0.15 ? CO_SCLERA[3] : dx + dy > 0.5 ? CO_SCLERA[1] : CO_SCLERA[2];
    });
    // its veins, dark, from the rim in toward the iris
    const veins: [number, number][][] = [[[cx - 6, 7], [cx - 5, 8], [cx - 4, 8], [cx - 4, 9]], [[cx + 5, 14], [cx + 4, 13], [cx + 4, 12]], [[cx - 2, 16], [cx - 2, 15], [cx - 3, 14]], [[cx + 6, 6], [cx + 5, 7]]];
    for (const v of veins) for (const [x, y] of v) p.set(x, y, CO_VEIN);
  } else if (k === 2) {
    // THE CENSOR: his blank white mask, cracked across, on the fan of black pages that stood behind his head; his brush across behind
    p.vline(cx, 1, 2, IRON[1]);
    // the brush, across behind it all
    p.line(cx - 10, 26, cx + 9, 4, BAMBOO[1]);
    p.line(cx - 9, 26, cx + 10, 4, BAMBOO[3]);
    p.line(cx - 10, 27, cx - 7, 23, BRISTLE[1]);
    p.set(cx - 11, 28, BRISTLE[0]).set(cx - 10, 28, BRISTLE[2]).set(cx - 9, 27, BRISTLE[3]);
    // the pages, fanned out from behind the mask, each edged grey
    for (let i = 0; i < 9; i++) {
      const ang = Math.PI * (1.05 + (i / 8) * 0.9);
      const len = 11 + (i % 2);
      for (let r = 4; r < len; r++) {
        for (const w of [-0.12, 0, 0.12]) {
          const x = Math.round(cx + Math.cos(ang + w * (8 / r)) * r);
          const y = Math.round(13 + Math.sin(ang + w * (8 / r)) * r * 0.9);
          p.set(x, y, r >= len - 1 ? PAGES[3] : w === 0.12 ? PAGES[0] : i % 2 ? PAGES[1] : PAGES[2]);
        }
      }
    }
    // the mask: a long oval, blank, two slits, no mouth
    ell(cx, 14, 4.8, 6.6, (dx, dy, d) => (d > 0.84 ? MASK[0] : dx < -0.3 && dy < 0 ? MASK[3] : dx > 0.45 || dy > 0.6 ? MASK[1] : MASK[2]));
    p.hline(cx - 3, 12, 2, INK).hline(cx + 1, 12, 2, INK);
    // the crack, right across it
    p.set(cx - 4, 15, MASK[0]).set(cx - 3, 15, MASK[0]).set(cx - 2, 16, MASK[0]).set(cx - 1, 16, MASK[0]).set(cx, 15, MASK[0]).set(cx + 1, 16, MASK[0]).set(cx + 2, 17, MASK[0]).set(cx + 3, 17, MASK[0]);
  } else {
    // THE MOTH: its wings pinned open, ash and smoke, the eye on each forewing shut for good (a lid of bone, a dark line); the furred
    // body between them, its feathered feelers
    p.vline(cx, 1, 2, IRON[3]);
    const wing = (side: 1 | -1): void => {
      // the forewing: up and out, its tip pointed; the hindwing under it, rounder
      p.poly([[cx + side * 1, 9], [cx + side * 11, 5], [cx + side * 12, 7], [cx + side * 9, 15], [cx + side * 1, 15]].map(([x, y]) => [side < 0 ? x + 1 : x, y] as [number, number]), WING[1]);
      p.poly([[cx + side * 1, 15], [cx + side * 8, 15], [cx + side * 9, 20], [cx + side * 5, 24], [cx + side * 1, 20]].map(([x, y]) => [side < 0 ? x + 1 : x, y] as [number, number]), WING_H[1]);
      // its edges: the fore lit along the top, the fringe bone grey
      p.line(cx + side * 2 + (side < 0 ? 1 : 0), 8, cx + side * 11 + (side < 0 ? 1 : 0), 5, side < 0 ? WING[3] : WING[2]);
      p.line(cx + side * 9 + (side < 0 ? 1 : 0), 20, cx + side * 5 + (side < 0 ? 1 : 0), 24, MBONE[1]);
      p.line(cx + side * 3 + (side < 0 ? 1 : 0), 12, cx + side * 9 + (side < 0 ? 1 : 0), 8, WING[0]);
      // the eye, shut: a ring of bone, the lid's line across
      const ex = cx + side * 6 + (side < 0 ? 1 : 0);
      ell(ex, 11, 2.6, 2.2, (dx, dy, d) => (d > 0.66 ? MBONE[2] : dy < -0.1 ? MBONE[1] : WING[0]));
      p.hline(ex - 1, 11, 3, INK);
      p.set(ex - 2, 12, MBONE[3]);
    };
    wing(-1);
    wing(1);
    // the body: furred, banded
    for (let y = 6; y < 23; y++) {
      const w = y < 9 ? 1 : y > 18 ? 1 : 2;
      for (let x = cx - w; x <= cx + w - 1; x++) p.set(x, y, x < cx - 1 ? FUR[3] : y % 3 === 0 ? FUR[1] : FUR[2]);
    }
    // the feelers, feathered
    p.line(cx - 1, 6, cx - 5, 1, MBONE[1]).line(cx, 6, cx + 4, 1, MBONE[1]);
    p.set(cx - 4, 3, MBONE[2]).set(cx + 3, 3, MBONE[2]).set(cx - 6, 2, MBONE[2]).set(cx + 5, 2, MBONE[2]);
    // the pin through it
    p.set(cx, 13, IRON[3]).set(cx - 1, 13, IRON[2]);
  }
  return { px: compose(null, [p]), ox: cx, oy: 2 };
}

/** Where each mount's hook is, in game pixels from the wall's anchor: the trophy's top middle (its anchor) hangs there. */
export const TROPHY_MOUNTS: { k: number; x: number; y: number }[] = MOUNT.us.map((mu, k) => {
  const x = -T.a + mu / 32;
  const y = T.b + 0.12;
  return { k, x: Math.round((x - y) * 32) / GRAIN, y: Math.round((x + y) * 16 - (MOUNT.z + 11)) / GRAIN };
});

/** The wall with its mounts, each filled or empty as `held` says (one picture: the game paints it again when one changes). */
export function paintTrophies(held: readonly boolean[]): Piece {
  const wall = paintTrophyWall();
  const out = wall.px.clone();
  held.forEach((on, k) => {
    if (!on) return;
    const t = paintTrophy(k);
    const m = TROPHY_MOUNTS[k];
    out.blit(t.px, Math.round(wall.ox + m.x * GRAIN - t.ox), Math.round(wall.oy + m.y * GRAIN - t.oy));
  });
  return { px: out, ox: wall.ox, oy: wall.oy };
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE WORDSMITH'S SLAB WITH THE TABLET'S SOCKET: the game's own slab (art/town.ts makeRuneSlab, its feet, its runes along its
// front, the word that lifts off it, eight frames), the great rune in its top given way to a round hollow cut in four.

/** The slab's stone (a theme's, as the game's: art/props.ts stoneOf). */
export interface SlabStone {
  stone: readonly string[];
  lit: readonly string[];
  shade: readonly string[];
}
const RUNES4: ReadonlyArray<ReadonlyArray<string>> = [
  ['..#..', '.###.', '#.#.#', '..#..', '..#..', '..#..', '.#.#.', '#...#', '.....'],
  ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#', '#....', '#....'],
  ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#....', '#...#', '.###.'],
  ['#.#.#', '#.#.#', '.###.', '..#..', '..#..', '.###.', '#.#.#', '#...#', '.....'],
  ['..#..', '..#..', '#####', '..#..', '.#.#.', '#...#', '#...#', '.#.#.', '..#..'],
  ['#####', '....#', '...#.', '.###.', '...#.', '....#', '....#', '#...#', '.###.'],
];
function rune(p: Px, k: number, x: number, y: number, color: string, tall = 9): void {
  const rows = RUNES4[((k % RUNES4.length) + RUNES4.length) % RUNES4.length];
  for (let j = 0; j < Math.min(tall, rows.length); j++) for (let i = 0; i < 5; i++) if (rows[j][i] === '#') p.set(x + i, y + j, color);
}
const plain = (body: string, hi: string, lo: string) => (_u: number, v: number, _w: number, h: number): string => (v === 0 ? hi : v >= h - 1 ? lo : body);

/** The socket: its radius (tiles), its depth (picture pixels). */
const SOCKET = { r: 0.24, deep: 3 } as const;

export function paintSocketSlab(st: SlabStone, frame: number): Piece {
  const W = 68;
  const H = 76;
  const ox = 34;
  const oy = 58;
  const stone = st.stone;
  const slab = new Px(W, H);
  const over = new Px(W, H);
  const iso = new Iso(slab, ox, oy);
  const A = 0.6;
  const B = 0.3;
  const FEET = 13;
  const TOP = 22;
  const litSide = plain(st.lit[2], st.lit[4], st.lit[1]);
  const shadeSide = plain(st.shade[2], st.shade[4], st.shade[1]);
  for (const x of [-A + 0.08, A - 0.3]) iso.box(x, -B + 0.05, x + 0.22, B - 0.05, 0, FEET, { top: () => stone[2], left: litSide, right: shadeSide });
  const lit1 = frame % 4;
  const front = new Px(40, TOP - FEET);
  const glowing = new Px(40, TOP - FEET);
  for (let i = 0; i < 4; i++) rune(front, i, 3 + i * 9, 1, i === lit1 ? SPARK[3] : TEAL[2], 7);
  rune(glowing, lit1, 3 + lit1 * 9, 1, SPARK[3], 7);
  // ITS TOP, with the socket: a round hollow, its far wall seen (lit where it looks down to the left), its floor dark, cut in four
  // by two ribs; its near lip catching the light
  const R0 = SOCKET.r;
  const sh = SOCKET.deep / 32;
  iso.box(-A, -B, A, B, FEET, TOP, {
    top: (u, v) => {
      const x = -A + u * 2 * A;
      const y = -B + v * 2 * B;
      const d = Math.hypot(x, y) / R0;
      if (d > 1.16) return u < 0.05 || v < 0.07 || u > 0.95 || v > 0.93 ? stone[3] : stone[4];
      if (d > 1) return x + y > 0 ? stone[4] : stone[3];
      // (the floor, seen where the hollow's own wall does not hide it)
      const fx = x - sh;
      const fy = y - sh;
      if (Math.hypot(fx, fy) < R0) {
        if (Math.abs(fx) < 0.035 || Math.abs(fy) < 0.035) return stone[2];
        return Math.hypot(fx, fy) > R0 * 0.82 && fx + fy < 0 ? INK : stone[0];
      }
      // (the far wall: the part that looks down to the left is lit)
      return y < x ? stone[3] : stone[2];
    },
    left: (u, v, w, h) => front.get(u, v) ?? litSide(u, v, w, h),
    right: shadeSide,
  });
  new Iso(over, ox, oy).left(-A, A, B, FEET, TOP, (u, v) => glowing.get(u, v));
  const [mx, my] = iso.at(0, 0, TOP);
  const mid = [Math.round(mx), Math.round(my)];
  // the word that lifts off it, as the game's: forms (frames 0-1), rises (2-5), thins away (6-7)
  const f = frame % 8;
  if (f >= 1) {
    const rise = f <= 1 ? 0 : (f - 1) * 4;
    const tone = f <= 4 ? SPARK[4] : f === 5 ? SPARK[3] : f === 6 ? SPARK[2] : SPARK[0];
    const gy = mid[1] - 16 - rise;
    if (gy >= 0) {
      rune(over, 3 + Math.floor(frame / 8), mid[0] - 2, gy, tone);
      if (f <= 5) over.set(mid[0] - 5, gy + 9, SPARK[3]).set(mid[0] + 5, gy + 7, SPARK[3]);
    }
  }
  return { px: compose(null, [slab], over), ox, oy, lights: [{ x: mid[0] / GRAIN, y: (mid[1] - 2) / GRAIN, r: 13 + (frame % 2), color: SPARK[2], a: 0.32 }] };
}
/** The socket in the slab's top: its middle in game pixels from the slab's anchor; its radius in tiles; on the screen, its half breadth and half height, and its depth (game pixels). */
export const BENCH_SOCKET = { x: 0, y: -11, r: SOCKET.r, rx: (SOCKET.r * 32 * Math.SQRT2) / GRAIN, ry: (SOCKET.r * 16 * Math.SQRT2) / GRAIN, deep: SOCKET.deep / GRAIN } as const;

// ---------------------------------------------------------------------------------------------------------------------------
// THE TORCHES ON POSTS: a squared post of plum wood on a foot of stone, iron bands, an iron cup at its head; the flame its own
// pictures, 12 frames at 30 a second, the game's fire (art/props.ts tongue, EMBER).

const P = { foot: 6, post: 74, cup: 80 } as const;
/** The post's wood: the game's plum, aged dark. */
const WOOD = ['#1e1022', '#2e1a32', '#432842', '#5a3652'] as const;
export function paintTorchPost(): Piece {
  const W = 26;
  const H = 104;
  const ox = 13;
  const oy = 96;
  const p = new Px(W, H);
  const iso = new Iso(p, ox, oy);
  iso.box(-0.15, -0.15, 0.15, 0.15, 0, P.foot, { top: () => S[6], left: plain(S[5], S[7], S[3]), right: plain(S[3], S[4], S[1]) });
  const band = (z: number): boolean => (z > 18 && z < 22) || (z > 62 && z < 66);
  iso.box(-0.06, -0.06, 0.06, 0.06, P.foot, P.post, {
    top: () => WOOD[3],
    left: (u, v) => (band(P.post - v) ? IRON[3] : u === 0 ? WOOD[3] : h3(u, (P.post - v) >> 3, 71) > 0.8 ? WOOD[1] : WOOD[2]),
    right: (_u, v) => (band(P.post - v) ? IRON[2] : WOOD[1]),
  });
  // the cup: an iron bowl, widening up, its rim lit, three prongs
  const [cx, cy] = iso.at(0, 0, P.post);
  for (let k = 0; k < 7; k++) {
    const hw = 2 + k * 0.55;
    const y = Math.round(cy) - k;
    for (let x = Math.round(cx - hw); x < Math.round(cx + hw); x++) p.set(x, y, k === 6 ? IRON[3] : x < cx - hw * 0.3 ? IRON[3] : IRON[2]);
  }
  for (const dx of [-6, 0, 5]) p.set(Math.round(cx) + dx, Math.round(cy) - 7, IRON[3]).set(Math.round(cx) + dx, Math.round(cy) - 8, IRON[2]);
  return { px: compose(null, [p]), ox, oy };
}
export const TORCH_FRAMES = 12;
/** The flame, frame f of 12 (30 a second): its anchor the post's (the middle of its foot), so laid at the same point. */
export function paintTorchFlame(f: number): Piece {
  const W = 26;
  const H = 104;
  const ox = 13;
  const oy = 96;
  const p = new Px(W, H);
  const ph = (f / TORCH_FRAMES) * Math.PI * 2;
  const base = oy - P.post - 6;
  const cx = ox;
  // (one tall tongue and two small ones, each its own height and lean, round and round; a spark now and then)
  tongue(p, cx + Math.round(Math.sin(ph) * 0.6), base, 17 + Math.round(2 * Math.sin(ph * 2) + (f % 3 === 0 ? 1 : 0)), 4.6, 2.2 * Math.sin(ph + 0.6), EMBER);
  tongue(p, cx - 3, base + 1, 8 + Math.round(2 * Math.cos(ph * 2)), 2.2, -1.5 + Math.sin(ph), EMBER);
  tongue(p, cx + 3, base + 1, 7 + Math.round(2 * Math.sin(ph * 2 + 1.3)), 2.1, 1.4 + Math.cos(ph), EMBER);
  if (f % 4 === 1) p.set(cx + 2 + (f % 3), base - 22 - (f % 5), EMBER[3]);
  const out = new Px(W, H);
  out.blit(p, 0, 0);
  return {
    px: out,
    ox,
    oy,
    lights: [
      { x: cx / GRAIN, y: (base - 8) / GRAIN, r: 22 + (f % 3), color: EMBER[2], a: 0.5 },
      // (the warm pool on the paving round its foot)
      { x: cx / GRAIN, y: (oy - 2) / GRAIN, r: 46 + (f % 2) * 2, color: EMBER[2], a: 0.24 },
    ],
  };
}

// ---------------------------------------------------------------------------------------------------------------------------
// WHERE EACH STANDS (tiles on the rim's grid, art/shaft_rim.ts rimPlace): its station's tile (as he locked it in), the point of the
// floor its anchor is laid on, and the tiles it blocks. The torches: the mock-up's places he saw (preview_shaft_rim.ts, step 2).

export interface RimPiece {
  kind: 'gate' | 'record' | 'trophies' | 'torch';
  /** Its station's tile, as locked in. */
  tile: [number, number];
  /** Where its anchor lies on the floor (tiles: its picture is drawn with its anchor at this point). */
  at: [number, number];
  /** The tiles it stands on: not walkable. */
  blocks: [number, number][];
  /** For laying it in depth with the rest: the point of the floor that is its nearest (tiles; nearer is bigger x + y). */
  depth: [number, number];
}

export function rimPieces(): RimPiece[] {
  const L = RIM_LAYOUT;
  const [gx, gy] = L.gate;
  const [rx, ry] = L.record;
  const [tx, ty] = L.trophies;
  return [
    { kind: 'gate', tile: [gx, gy], at: [gx + 1.5, gy + 0.5], blocks: [[gx, gy], [gx + 1, gy], [gx + 2, gy]], depth: [gx + 1.5, gy + 0.76] },
    { kind: 'record', tile: [rx, ry], at: [rx + 0.5, ry + 0.5], blocks: [[rx, ry]], depth: [rx + 0.5, ry + 0.63] },
    { kind: 'trophies', tile: [tx, ty], at: [tx + 1.5, ty + 0.5], blocks: [[tx, ty], [tx + 1, ty], [tx + 2, ty]], depth: [tx + 1.5, ty + 0.7] },
    ...L.torches.map(([x, y]) => ({ kind: 'torch' as const, tile: [Math.floor(x), Math.floor(y)] as [number, number], at: [x, y] as [number, number], blocks: [[Math.floor(x), Math.floor(y)]] as [number, number][], depth: [x, y] as [number, number] })),
  ];
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE SPRITES, for the game (made once, as the town loads).

export interface RimProps {
  gate: Sprite;
  /** The record with n notches (the newest glowing if asked): painted again when a notch is cut. */
  record: (n: number, newest?: boolean) => Sprite;
  /** The trophies wall, each mount filled or empty. */
  trophies: (held: readonly boolean[]) => Sprite;
  /** The wordsmith's slab with the socket, eight frames as the game's. */
  socketSlab: Sprite[];
  torchPost: Sprite;
  /** The flame, 12 frames at 30 a second. */
  torchFlame: Sprite[];
  /** How long they took to paint, ms. */
  ms: number;
}
export function rimProps(st: SlabStone): RimProps {
  const t0 = performance.now();
  const out: RimProps = {
    gate: sprite(paintGate()),
    record: (n, newest = false) => sprite(paintRecord(n, newest)),
    trophies: (held) => sprite(paintTrophies(held)),
    socketSlab: Array.from({ length: 8 }, (_, f) => sprite(paintSocketSlab(st, f))),
    torchPost: sprite(paintTorchPost()),
    torchFlame: Array.from({ length: TORCH_FRAMES }, (_, f) => sprite(paintTorchFlame(f))),
    ms: 0,
  };
  out.ms = performance.now() - t0;
  return out;
}
export { DARK as RIM_DARK };
