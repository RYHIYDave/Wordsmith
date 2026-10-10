// THE STAIRWELL OPENS: the one moment that plays on every floor of the Crypt as the floor's boss dies
// and the way down opens (a mock-up for his yes; nothing of the game imports it).
//
// The owner's outline, 9 Oct 2026, 22:47 (in the main chat): "kill the warden and find a stairwell
// leading down.  At the bottom of the stairs is Crypt floor 2." The main chat built the stairwell in
// (art/crypt_ways.ts, makeStairwell) with a placeholder for its opening, the game's slam burst and a
// shake, and told him its real moment would be the art chat's, big and wild by his rule. His rule, his
// art rulebook's Animations 1 (10 Oct, 07:47): “Put in the ruleset that I want animations as big and
// wild and kinetic and weighty as possible.  I’d rather it be a notch too high than a notch too low.”
// And (07:53): “And I want all animations checked against this statement before I see them.”
//
// WHAT HAPPENS (frames at 30 a second; the numbers are the constants below):
//   THE SHOCK (frame SHOCK, a jolt): a crack bursts open at the middle of where the stairwell will be
//     and races out along the lines of the slabs to the opening's outline and round it, and round the
//     kerb's outline, dust spurting and grit hopping where it runs (the floor shudders: the screen's
//     to do, a tremor until the heave).
//   THE HEAVE (frame HEAVE, a jolt): the kerb shoves up out of the floor round three sides, past its
//     height and back, and every slab of the lid inside it jumps and drops back loose, dust blowing out
//     of every crack; the slabs rattle and sag.
//   THE SLABS GO, one after another down the line of the steps (from the top of the steps toward the
//     eye): each tips, its far end dropping into the dark, slips off and falls, slams onto the steps
//     (the deeper ones are jolts), and shoots on down them out of sight under the floor, chips and dust
//     flung up from each. On the deeper floors some of the lid is earth: it crumbles and pours down in
//     clods.
//   THE GREAT BURST (the last slab's slam, a jolt): a column of dust blows up out of the hole, higher
//     than the tallest hero three times over, a ring of it rolling out over the kerb across the floor,
//     chips and stones flung up high; the dust falls fast and thins away as clouds, the chips rain back
//     down into the hole; grit trickles off the kerb; and it is the stairwell, the steps going down into
//     the dark, the kerb round it (its last frame is makeStairwell's picture, to the pixel).
//
// HOW IT IS PAINTED. Everything is in the world and painted as the eye sees it: the stairwell at the
// kerb's height of each frame (a copy of makeStairwell's painter that takes the kerb's height and keeps,
// for each pixel, how high in the world the thing it shows is, so that what falls into the hole is
// hidden by what is nearer the eye: the kerb, the floor, the slabs still in place, the steps); the slabs
// as solid stones, a top, an underside and four sides, turned as they fall and lit as each face turns to
// the light (from the upper left); below the floor everything goes darker with depth in the five steps
// the stairwell's own depth is painted in. Before the heave nothing of the floor is painted (the game's
// own floor is all there is, under its cracks): the slabs and the kerb are painted from the frame they
// first move, a jolt, so that the floor never changes under the eye while it lies still.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { STAIR_KERB, STAIR_LONG, STAIR_WIDE, makeStairwell } from './crypt_ways';
import { DIRT, ROCK } from './crypt';
import { FLOOR_DUST, LIGHT_W } from './floor2';
import { DEEP, fastBlit } from './floorkit';
import type { Moment, Track } from './floorkit';
import type { Theme } from './ground';
import { GRAIN, hash, mix } from './kit';

type Way = 'x' | 'y';
type V3 = [number, number, number];

// =================================================================================================
// THE STAIRWELL AT ANY HEIGHT OF ITS KERB: makeStairwell's painter (art/crypt_ways.ts), the same pixel
// for pixel at the kerb's own height (tests/stairwell_open.test.ts holds it to it), with the kerb's
// height a number, and, for every pixel, the height in the world of what it shows.

/** The dark at the bottom of a pit, and the stairwell's measures (art/crypt_ways.ts, where they are its own). */
const PIT_DARK = '#04030a';
const KERB_H = 6;
const STEP = 0.25;
const DROP = 6;

/** How dark a thing is at a depth below the floor (picture pixels), in the stairwell's five flat steps toward the dark at the bottom; and how much of it shows. */
const DEPTHS: ReadonlyArray<readonly [number, number]> = [[7, 0.12], [15, 0.34], [24, 0.58], [34, 0.78], [Infinity, 0.93]];
function darkAt(depth: number): number {
  if (depth <= 0) return 0;
  for (const [d, k] of DEPTHS) if (depth < d) return k;
  return 0.93;
}
const DEEPENED = new Map<string, string>();
function deepen(c: string, depth: number): string {
  const k = darkAt(depth);
  if (!k) return c;
  const key = c + k;
  let out = DEEPENED.get(key);
  if (!out) DEEPENED.set(key, (out = mix(c, PIT_DARK, k)));
  return out;
}

/** Rough rock where a stone of the shaft's side has fallen out (art/crypt_ways.ts, roughAt). */
function roughAt(run: number, depth: number, face: readonly string[], rock: readonly string[], dirt: readonly string[]): string {
  const CELL = 6;
  const gx = run / CELL;
  const gy = depth / (CELL * 0.8);
  const cx = Math.floor(gx);
  const cy = Math.floor(gy);
  let best = 9;
  let second = 9;
  let ox = 0;
  let oy = 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const px = cx + dx + 0.15 + 0.7 * hash(cx + dx, cy + dy, 321);
      const py = cy + dy + 0.15 + 0.7 * hash(cx + dx, cy + dy, 322);
      const d = Math.hypot(gx - px, gy - py);
      if (d < best) {
        second = best;
        best = d;
        ox = gx - px;
        oy = gy - py;
      } else if (d < second) second = d;
    }
  }
  if (second - best < 0.13) return dirt[0];
  const k = -ox * 0.8 - oy * 0.9;
  if (k > 0.3) return mix(face[3], rock[3], 0.5);
  if (k < -0.3) return mix(face[0], rock[0], 0.5);
  return mix(face[2], rock[1], 0.55);
}

/** The stairwell's picture with its kerb `h` picture pixels high, laid out as makeStairwell's (its anchor at (ox, oy)), and the height in the world of what each pixel shows (-Infinity: the dark). */
interface Well {
  p: Px;
  z: Float32Array;
  ox: number;
  oy: number;
}
function paintWell(theme: Theme, way: Way, h: number): Well {
  const LONG = STAIR_LONG;
  const WIDE = STAIR_WIDE;
  const K = STAIR_KERB;
  const x0 = way === 'x' ? 0 : -K;
  const y0 = way === 'x' ? -K : 0;
  const x1 = way === 'x' ? LONG + K : WIDE + K;
  const y1 = way === 'x' ? WIDE + K : LONG + K;
  const PAD = 4;
  const ox = Math.ceil(-(x0 - y1) * 32) + PAD;
  const oy = Math.ceil(-(x0 + y0) * 16 + KERB_H) + PAD;
  const W = Math.ceil((x1 - y0) * 32) + ox + PAD;
  const H = Math.ceil((x1 + y1) * 16) + oy + PAD;
  const p = new Px(W, H);
  const zs = new Float32Array(W * H).fill(-Infinity);
  const e = theme.earth;
  const broken = e?.broken ?? 0.07;
  const raw = e?.raw ?? 0;
  const rock = e?.rock;
  const dirt = e?.dirt;
  const tread = theme.slab;
  const faceOf = (axis: 'al' | 'ac') => ((axis === 'ac') === (way === 'x') ? theme.lit : theme.shade);
  const where = (al: number, ac: number): 0 | 1 | 2 => {
    if (al >= 0 && al < LONG && ac >= 0 && ac < WIDE) return 0;
    if (al >= 0 && al < LONG + K && ac >= -K && ac < WIDE + K) return 1;
    return 2;
  };
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const sx = (px + 0.5 - ox) / 32;
      const sk = (py + 0.5 - oy + h) / 16;
      const fx = (sk + sx) / 2;
      const fy = (sk - sx) / 2;
      let c: string | null = null;
      let hit = -Infinity;
      let met = false;
      let prev: 0 | 1 | 2 = 2;
      let prevAc = 0;
      let before = 0;
      for (let d = 0; d < 2.6; d += 1 / 128) {
        const x = fx - d;
        const y = fy - d;
        const z = h - 32 * d;
        const al = way === 'x' ? x : y;
        const ac = way === 'x' ? y : x;
        const here = where(al, ac);
        if (al < 0 && z < 0) {
          if (prev === 0 && ac >= 0 && ac < WIDE) {
            const f = faceOf('al');
            const depth = -z;
            const course = Math.floor(depth / 12);
            const run = ac * 32 + (course % 2) * 11;
            c = deepen(depth % 12 < 1 || run % 22 < 1 ? f[0] : f[2], depth);
          }
          hit = z;
          met = true;
          break;
        }
        if (here === 2) {
          if (z <= 0) {
            hit = 0;
            met = true;
            break;
          }
        } else if (here === 1) {
          if (z <= h && z > 0) {
            if (d === 0) {
              const run = al < 0 || al >= LONG ? ac : al;
              const slab = Math.floor((run + K) / 0.4);
              const joint = Math.abs((run + K) / 0.4 - Math.round((run + K) / 0.4)) < 0.035;
              const lip = (ac >= -0.03 && ac < 0) || (ac >= WIDE && ac < WIDE + 0.03 && al < LONG) || (al >= LONG && al < LONG + 0.03 && ac >= 0 && ac < WIDE);
              c = joint ? theme.mortar : lip ? mix(tread[3], '#ffffff', 0.15) : al < 0.03 || ac < -K + 0.03 ? mix(tread[3], '#ffffff', 0.08) : hash(slab, Math.floor(ac + 9), 301) < 0.3 ? tread[3] : tread[2];
              if (hash(slab, 3, 302) < broken * 1.5 && lip) c = theme.mortar;
            } else {
              const axis: 'al' | 'ac' = prev === 2 ? (prevAc >= WIDE + K ? 'ac' : 'al') : 'ac';
              const f = faceOf(axis);
              const v = h - z;
              c = v < 1 ? f[4] : v > h - 1.2 ? f[0] : f[2];
            }
            hit = z;
            met = true;
            break;
          }
          if (z <= 0) {
            const axis: 'al' | 'ac' = ac < 0 || ac >= WIDE ? 'ac' : 'al';
            const f = faceOf(axis);
            const depth = -z;
            const course = Math.floor(depth / 12);
            const run = (axis === 'ac' ? al : ac) * 32 + (course % 2) * 11;
            const stone = Math.floor(run / 22);
            let col = depth % 12 < 1 || run % 22 < 1 ? f[0] : hash(stone, course, 303) < 0.3 ? f[3] : f[2];
            if (rock && dirt && hash(stone, course, 305) < raw) col = roughAt(run, depth, f, rock, dirt);
            c = deepen(col, depth);
            hit = z;
            met = true;
            break;
          }
        } else if (z < 0) {
          const k = Math.floor(al / STEP) + 1;
          const top = -DROP * k;
          if (z <= top) {
            let col: string;
            if (before > k) {
              const f = faceOf('al');
              col = top - z > DROP - 1.2 ? f[0] : f[1];
            } else {
              const into = al - (k - 1) * STEP;
              const across = Math.floor(ac * 6);
              const chip = hash(k, across, 307) < broken * 1.5 && into > STEP * 0.7 && ac * 6 - across < 0.55;
              if (into > STEP - 0.035) col = chip ? theme.mortar : mix(tread[3], '#ffffff', 0.12);
              else if (chip && into > STEP * 0.8) col = theme.mortar;
              else if (into < 0.025) col = tread[0];
              else col = hash(k, Math.floor(ac * 3), 309) < 0.35 ? tread[3] : tread[2];
              if (hash(k, 7, 311) < broken * 2 && Math.abs(ac - 0.3 - 0.4 * hash(k, 8, 312) - (into / STEP - 0.5) * 0.25) < 0.02) col = theme.mortar;
            }
            c = deepen(col, -z);
            hit = z;
            met = true;
            break;
          }
          before = k;
        }
        prev = here;
        prevAc = ac;
      }
      if (c === null && !met) {
        const at = (py + 0.5 - oy) / 16;
        const ax = (at + sx) / 2;
        const ay = (at - sx) / 2;
        if (where(way === 'x' ? ax : ay, way === 'x' ? ay : ax) === 0) c = PIT_DARK;
      }
      if (c) p.set(px, py, c);
      zs[py * W + px] = met ? hit : -Infinity;
    }
  }
  return { p, z: zs, ox, oy };
}

// =================================================================================================
// THE LID: the slabs of the floor over the opening, four rows down the way the steps go, two across
// each; their edges are the cracks. On the deeper floors some of them are earth, as the floor round
// them is (his outline: "By floor 4 it’s about half dirt and rocks").

const ROWS = 4;
/** The crack between rows r-1 and r, where it crosses `ac` (tiles along the way down): jagged, straight between knots. */
function rowLine(r: number, ac: number): number {
  if (r <= 0) return 0;
  if (r >= ROWS) return STAIR_LONG;
  const s = ac / 0.17;
  const i = Math.floor(s);
  const t = s - i;
  const a = (hash(i, r, 501) - 0.5) * 0.16;
  const b = (hash(i + 1, r, 501) - 0.5) * 0.16;
  return (STAIR_LONG / ROWS) * r + a + (b - a) * t;
}
/** The crack that splits row r in two across, where it crosses `al` (tiles across). */
function splitLine(r: number, al: number): number {
  const s = al / 0.15;
  const i = Math.floor(s);
  const t = s - i;
  const a = (hash(i, r, 503) - 0.5) * 0.2;
  const b = (hash(i + 1, r, 503) - 0.5) * 0.2;
  return STAIR_WIDE * (0.45 + 0.12 * hash(r, 1, 504)) + a + (b - a) * t;
}
/** Which slab of the lid a point of the opening is in (row * 2 + side), or -1 outside it. */
function cellAt(al: number, ac: number): number {
  if (al < 0 || al >= STAIR_LONG || ac < 0 || ac >= STAIR_WIDE) return -1;
  let r = 0;
  while (r < ROWS - 1 && al >= rowLine(r + 1, ac)) r++;
  return r * 2 + (ac < splitLine(r, al) ? 0 : 1);
}
/**
 * THE CRACKS THAT BRANCH OFF from the middle, where the first one bursts, into the slabs (they are not
 * where the slabs part: lines across their tops, as a flagstone cracked across has, from the first frame
 * to the last they are seen): each a few straight runs, (along, across) in tiles.
 */
const BRANCHES: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = (() => {
  const m: [number, number] = [STAIR_LONG / 2, splitLine(1, STAIR_LONG / 2 - 0.01)];
  return [
    [m, [m[0] - 0.14, m[1] - 0.2], [m[0] - 0.22, m[1] - 0.33], [m[0] - 0.4, m[1] - 0.38]],
    [m, [m[0] + 0.18, m[1] + 0.12], [m[0] + 0.28, m[1] + 0.3], [m[0] + 0.46, m[1] + 0.36]],
    [m, [m[0] - 0.2, m[1] + 0.1], [m[0] - 0.3, m[1] + 0.26], [m[0] - 0.36, m[1] + 0.44]],
    [m, [m[0] + 0.15, m[1] - 0.16], [m[0] + 0.36, m[1] - 0.22], [m[0] + 0.48, m[1] - 0.36]],
  ];
})();
/** Is a point of the lid on one of those cracks (within `w` tiles)? */
function onBranch(al: number, ac: number, w: number): boolean {
  for (const b of BRANCHES) {
    for (let i = 0; i + 1 < b.length; i++) {
      const [a0, c0] = b[i];
      const [a1, c1] = b[i + 1];
      const da = a1 - a0;
      const dc = c1 - c0;
      const t = Math.max(0, Math.min(1, ((al - a0) * da + (ac - c0) * dc) / (da * da + dc * dc)));
      if (Math.hypot(al - a0 - t * da, ac - c0 - t * dc) < w) return true;
    }
  }
  return false;
}

/** Which of the lid's slabs are earth on a floor with `gone` of its flagstones gone. */
function earthCells(gone: number): Set<number> {
  const n = Math.round(gone * 8 * 1.1);
  return new Set([3, 4, 6, 1, 0, 7, 2, 5].slice(0, n));
}

// =================================================================================================
// THE TIMES (frames, at 30 a second)

/** The shock: the first crack. */
const SHOCK = 1;
/** The heave: the kerb shoves up and the lid jumps loose. */
const HEAVE = 9;
/** The kerb's height, frame by frame from the heave (then its own, 6, but a jump at the great burst). */
const KERB_RISE = [5, 7, 8, 7, 6, 6, 6];
/** The first slab tips, and the next row after it so many frames. */
const TIP0 = 13;
const ROW_GAP = 4;
/** Frames a slab tips before it slips; its fall (picture pixels a frame each frame); how fast it shoots on down the steps. */
const TIP_FOR = 4;
const G = 2.6;
const SLIDE_V = 0.06;
const SLIDE_A = 0.03;
const SLIDE_MAX = 0.2;
/** Picture pixels across the floor to a tile (as floor 2's moments: art/floor2.ts, KT). */
const KT = 40;
/** The slope of the steps' noses: picture pixels down for a tile along. */
const NOSE = (DROP / STEP) * 1;
/** A slab's thickness (picture pixels). */
const THICK = 6;

/** Where the light comes from, and which way is toward the eye, in the world (x, y across the floor, z up). */
const LIGHT: V3 = (() => {
  const n = Math.hypot(LIGHT_W[0], LIGHT_W[1], LIGHT_W[2]);
  return [LIGHT_W[0] / n, LIGHT_W[1] / n, LIGHT_W[2] / n];
})();
const EYE: V3 = (() => {
  const n = Math.hypot(KT, KT, 32);
  return [KT / n, KT / n, 32 / n];
})();
const dot = (a: readonly number[], b: readonly number[]): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

// =================================================================================================
// A PIECE OF THE LID: a slab, or a lump of earth, as points of its faces at rest about the slab's hinge
// (the middle of its edge nearer the eye, along the way down), each with its face's way out and its
// colours; turned and moved frame by frame.

interface Piece {
  cell: number;
  /** The points: [al, ac, z] from the hinge (picture pixels: KT to a tile), the way out of its face, its colours (a ramp, an index into it, and how it is lit at rest). */
  pts: Float32Array;
  nrm: Float32Array;
  ramp: string[][];
  rampOf: Uint8Array;
  idx: Uint8Array;
  lit0: Float32Array;
  /** Its middle, from the hinge. */
  mid: V3;
}

/** The world's (x, y) from a point along the way down and across it. */
const toXY = (way: Way, al: number, ac: number): [number, number] => (way === 'x' ? [al, ac] : [ac, al]);

/**
 * THE LID'S PIECES: for each slab, its points (the top at the floor's level, its underside a slab's
 * thickness down, its sides round its edges), its hinge, and, for earth, the lumps it breaks into.
 */
function lidPieces(theme: Theme, way: Way): { pieces: Piece[]; hinge: [number, number][] } {
  const earth = earthCells(theme.earth?.gone ?? 0);
  const S = 96;
  const GAP = 0.022;
  const st = 1 / S;
  /** In the slab, clear of its cracks. */
  const inner = (cell: number, al: number, ac: number): boolean => cellAt(al, ac) === cell && cellAt(al - GAP, ac) === cell && cellAt(al + GAP, ac) === cell && cellAt(al, ac - GAP) === cell && cellAt(al, ac + GAP) === cell;
  const slab = theme.slab;
  const TOP = [theme.mortar, slab[0], slab[1], slab[2], slab[3], mix(slab[3], '#ffffff', 0.12)];
  const SIDE = [theme.shade[0], theme.shade[1], theme.shade[2], theme.lit[1], theme.lit[2], theme.lit[3]];
  const UNDER = [DIRT[0], theme.mortar, theme.shade[0], theme.shade[1]];
  const dirt = theme.earth?.dirt ?? DIRT;
  const rock = theme.earth?.rock ?? ROCK;
  const SOIL = [dirt[0], dirt[1], dirt[2], dirt[3], mix(dirt[3], rock[3], 0.5)];
  const STONE = [rock[0], rock[1], rock[2], rock[3], mix(rock[3], '#ffffff', 0.1)];
  const SOIL_SIDE = [dirt[0], dirt[0], dirt[1], dirt[1], dirt[2], dirt[2]];
  const ramps = [TOP, SIDE, UNDER, SOIL, STONE, SOIL_SIDE];
  const pieces: Piece[] = [];
  const hinge: [number, number][] = [];
  const lightOf = (n: V3): number => {
    const [x, y] = toXY(way, n[0], n[1]);
    return dot([x, y, n[2]], LIGHT);
  };
  for (let cell = 0; cell < ROWS * 2; cell++) {
    const r = cell >> 1;
    const isEarth = earth.has(cell);
    // its points on the grid, and its hinge
    const grid: [number, number][] = [];
    let alMax = -Infinity;
    let acSum = 0;
    let alMin = Infinity;
    let acMin = Infinity;
    let acMax = -Infinity;
    for (let al = st / 2; al < STAIR_LONG; al += st) {
      for (let ac = st / 2; ac < STAIR_WIDE; ac += st) {
        if (!inner(cell, al, ac)) continue;
        grid.push([al, ac]);
        alMax = Math.max(alMax, al);
        alMin = Math.min(alMin, al);
        acMin = Math.min(acMin, ac);
        acMax = Math.max(acMax, ac);
        acSum += ac;
      }
    }
    const ha = r === ROWS - 1 ? STAIR_LONG : alMax;
    const hc = acSum / grid.length;
    hinge.push([ha, hc]);
    const has = new Set(grid.map(([a, c]) => `${Math.round(a * S - 0.5)},${Math.round(c * S - 0.5)}`));
    const on = (a: number, c: number): boolean => has.has(`${Math.round(a * S - 0.5)},${Math.round(c * S - 0.5)}`);
    // (one piece each: earth crumbles as it goes, shedding clods: the moment's chips)
    const lumpOf = (_al: number, _ac: number): number => 0;
    const parts = 1;
    const bags = Array.from({ length: parts }, () => ({ p: [] as number[], n: [] as number[], ramp: [] as number[], idx: [] as number[], lit: [] as number[] }));
    const tone = hash(cell, 1, 511);
    const add = (al: number, ac: number, z: number, n: V3, ramp: number, idx: number): void => {
      const b = bags[lumpOf(al, ac)];
      b.p.push((al - ha) * KT, (ac - hc) * KT, z);
      b.n.push(n[0], n[1], n[2]);
      b.ramp.push(ramp);
      b.idx.push(idx);
      b.lit.push(lightOf(n));
    };
    for (const [al, ac] of grid) {
      // ITS TOP: as the floor's flagstones are, a lit lip along its two edges up the screen, a shaded one
      // along its two down it, one tone, a pit here and there (art/ground.ts, floorAt); or earth, in clods
      // with rocks in it
      if (isEarth) {
        const g = 4;
        const cu = Math.floor(al * g * 3);
        const cv = Math.floor(ac * g * 3);
        const lump = hash(cu, cv, 515);
        const isRock = hash(Math.floor(al * 7), Math.floor(ac * 7), 516) < 0.22 && hash(Math.floor(al * 7 + 0.5), Math.floor(ac * 7 + 0.5), 517) < 0.6;
        if (onBranch(al, ac, 0.014)) add(al, ac, 0, [0, 0, 1], 3, 0);
        else if (isRock) add(al, ac, 0, [0, 0, 1], 4, hash(Math.floor(al * 7), Math.floor(ac * 7), 518) < 0.4 ? 3 : 2);
        else add(al, ac, 0, [0, 0, 1], 3, lump > 0.86 ? 3 : lump < 0.1 ? 0 : hash(Math.floor(al * 3), Math.floor(ac * 3), 519) < 0.4 ? 2 : 1);
      } else {
        const up = !inner(cell, al - 0.045, ac) || !inner(cell, al, ac - 0.045);
        const down = !inner(cell, al + 0.035, ac) || !inner(cell, al, ac + 0.035);
        let idx = up ? 4 : down ? 1 : tone < 0.15 ? 2 : tone < 0.5 ? 3 : 4;
        // (the cracks that branched off the first one, across its top)
        if (onBranch(al, ac, 0.014)) idx = 0;
        if (!up && !down && hash(Math.round(al * 64), Math.round(ac * 64), 520 + cell) < 0.012) idx = 1;
        add(al, ac, 0, [0, 0, 1], 0, idx);
      }
      // ITS UNDERSIDE: rough, earth clinging to it
      add(al, ac, -THICK, [0, 0, -1], isEarth ? 3 : 2, hash(Math.floor(al * 20), Math.floor(ac * 20), 521) < 0.4 ? 0 : 1);
      // ITS SIDES, where its edge is (and, earth, round each lump)
      for (const [da, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const na = al + da * st;
        const nc = ac + dc * st;
        if (on(na, nc) && lumpOf(na, nc) === lumpOf(al, ac)) continue;
        for (let z = -0.25; z > -THICK; z -= 0.5) {
          const n: V3 = [da, dc, 0];
          const lit = lightOf(n);
          const base = Math.max(0, Math.min(5, Math.round(2.5 + 3 * lit)));
          add(al + da * st * 0.5, ac + dc * st * 0.5, z, n, isEarth ? 5 : 1, z > -1 ? Math.min(5, base + 1) : z < -THICK + 1 ? Math.max(0, base - 2) : base);
        }
      }
    }
    for (const b of bags) {
      if (!b.idx.length) continue;
      const n = b.idx.length;
      let mx = 0;
      let my = 0;
      let mz = 0;
      for (let i = 0; i < n; i++) {
        mx += b.p[i * 3];
        my += b.p[i * 3 + 1];
        mz += b.p[i * 3 + 2];
      }
      pieces.push({
        cell,
        pts: Float32Array.from(b.p),
        nrm: Float32Array.from(b.n),
        ramp: ramps,
        rampOf: Uint8Array.from(b.ramp),
        idx: Uint8Array.from(b.idx),
        lit0: Float32Array.from(b.lit),
        mid: [mx / n, my / n, mz / n],
      });
    }
  }
  return { pieces, hinge };
}

// =================================================================================================
// HOW EACH SLAB GOES: its pose frame by frame. Turned about its hinge: `pitch` about the line across
// the way down (more than 0: its far end down), `roll` about the line along it, `yaw` about the
// upright; the hinge where it is (al, ac in tiles, z in picture pixels).

interface Pose {
  al: number;
  ac: number;
  z: number;
  pitch: number;
  roll: number;
  yaw: number;
  /** Not there (before the heave, or gone down out of the picture). */
  off?: boolean;
}

/** When each slab tips: row by row down the way, the two of a row a frame apart, by turns which first. */
function tipOf(cell: number): number {
  const r = cell >> 1;
  const c = cell & 1;
  return TIP0 + ROW_GAP * r + (c === (r & 1) ? 0 : 1);
}

/** Where the hinge comes to rest on the steps' noses, how many frames its fall takes, and the frame it slams onto them. */
function landOf(cell: number, hinge: readonly [number, number]): { al: number; z: number; fall: number; at: number } {
  // (it falls forward, down into the hole under the slabs still in place, and lies on the steps there)
  const al = hinge[0] + 0.3;
  const z = -NOSE * al + THICK + 1;
  const fall = Math.max(2, Math.round(Math.sqrt((2 * (1.5 - z)) / G)));
  return { al, z, fall, at: tipOf(cell) + TIP_FOR + fall - 1 };
}

/** How far each slab tips before it slips: the first row hardly (the top of the steps holds its far end), the rest far over, but no steeper than the eye looks down (38 degrees): steeper, it would hang hidden under the slab beyond it. */
const TIP_TO = [0.2, 0.4, 0.42, 0.42];
/** Lying on the steps: as steep as their noses run. */
const LIE = -Math.atan(NOSE / KT);

function poseOf(cell: number, f: number, hinge: readonly [number, number]): Pose {
  const r = cell >> 1;
  const c = cell & 1;
  const [ha, hc] = hinge;
  const t0 = tipOf(cell);
  const land = landOf(cell, hinge);
  const sag = -1.5;
  const wob = (k: number, s: number): number => Math.sin(k * 2.1 + r * 1.7 + c * 2.9 + s);
  if (f < HEAVE) return { al: ha, ac: hc, z: 0, pitch: 0, roll: 0, yaw: 0, off: true };
  /** THE HEAVE: thrown up and dropped back loose (the kerb shoving up past it: KERB_RISE), then sagging, rattling. */
  const heaved = (g: number, rattle: number): number => {
    const k = g - HEAVE;
    return [4.5 + 0.5 * hash(cell, 1, 531), 6, 6, 4.5, 2.5, 0.5][k] ?? sag + rattle * 0.9 * wob(g, 0);
  };
  if (f < t0) return { al: ha, ac: hc, z: heaved(f, 1), pitch: 0.04 * wob(f, 1), roll: 0.052 * wob(f, 2), yaw: 0 };
  const rollTo = (c === 0 ? 1 : -1) * (0.1 + 0.08 * hash(cell, 2, 531));
  if (f < t0 + TIP_FOR) {
    // IT TIPS: its far end dropping, faster and faster, about its hinge
    const u = ((f - t0 + 1) / TIP_FOR) ** 2;
    return { al: ha, ac: hc, z: heaved(f, 0), pitch: TIP_TO[r] * u, roll: rollTo * u, yaw: 0 };
  }
  if (f <= land.at) {
    // IT SLIPS AND FALLS: its near end drops off its hinge, faster every frame, and it swings over to lie on the steps
    const u = ((f - (t0 + TIP_FOR) + 1) / land.fall) ** 2;
    const z0 = heaved(t0 + TIP_FOR - 1, 0);
    return { al: ha + (land.al - ha) * u, ac: hc, z: z0 + (land.z - z0) * u, pitch: TIP_TO[r] + (LIE - TIP_TO[r]) * u, roll: rollTo * (1 - 0.6 * u), yaw: 0.12 * (c ? 1 : -1) * u };
  }
  // IT SLAMS ONTO THE STEPS AND SHOOTS ON DOWN THEM, rocking as it goes over each nose
  const k = f - land.at;
  // (faster and faster, to the pace of a slab sliding down a flight of steps; gone when it is deep under the floor)
  const kMax = (SLIDE_MAX - SLIDE_V) / SLIDE_A;
  const s = k < kMax ? SLIDE_V * k + 0.5 * SLIDE_A * k * k : SLIDE_V * kMax + 0.5 * SLIDE_A * kMax * kMax + SLIDE_MAX * (k - kMax);
  const al = land.al + s;
  const z = -NOSE * al + THICK + 1 - Math.abs(Math.sin((Math.PI * al) / STEP)) * 1.2;
  const off = z < -75;
  return { al, ac: hc, z, pitch: LIE + 0.16 * Math.exp(-k / 2.5) * Math.cos(k * 1.9), roll: rollTo * 0.4 * Math.exp(-k / 4), yaw: 0.12 * (c ? 1 : -1), off };
}

/** A rotation (3 x 3, rows) from a pose's turns: yaw after pitch after roll. */
function turnOf(P: Pose): number[] {
  const [cr, sr] = [Math.cos(P.roll), Math.sin(P.roll)];
  const [cp, sp] = [Math.cos(P.pitch), Math.sin(P.pitch)];
  const [cy, sy] = [Math.cos(P.yaw), Math.sin(P.yaw)];
  // roll about al: (a, c, z) -> (a, c cr - z sr, c sr + z cr)
  const R1 = [1, 0, 0, 0, cr, -sr, 0, sr, cr];
  // pitch about ac (far end down): (a, c, z) -> (a cp - z sp, c, a sp + z cp)
  const R2 = [cp, 0, -sp, 0, 1, 0, sp, 0, cp];
  const R3 = [cy, -sy, 0, sy, cy, 0, 0, 0, 1];
  const mul = (A: number[], B: number[]): number[] => {
    const o = new Array<number>(9).fill(0);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) o[i * 3 + j] += A[i * 3 + k] * B[k * 3 + j];
    return o;
  };
  return mul(R3, mul(R2, R1));
}

// =================================================================================================
// WHAT FLIES: chips and stones flung up (a block of a colour or two and, flying fast, a streak behind
// it), grit, and the dust. Chips and grit are not followed by the checks, as floor 2's grit is not:
// each comes down where it went up from, into a crack or into the hole, out of sight.

interface Chip {
  f0: number;
  /** From (tiles across the floor, picture pixels up), how fast (tiles, picture pixels a frame), how hard it falls. */
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  g: number;
  size: number;
  /** Its lit top and left, its body, its shaded foot. */
  tones: readonly [string, string, string];
}
const chipAt = (c: Chip, f: number): V3 => {
  const k = f - c.f0;
  return [c.x + c.vx * k, c.y + c.vy * k, c.z + c.vz * k - 0.5 * c.g * k * k];
};

/** A cloud of dust: born on frame `f0` at (x, y) tiles and z, blown up `vz` and out (vx, vy) a frame, slowed by the air and falling fast after; its size and its life. */
interface Cloud {
  f0: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  r0: number;
  big: number;
  life: number;
  fall: number;
  seed: number;
}
function cloudAt(d: Cloud, f: number): { x: number; y: number; z: number; r: number; age: number } | null {
  const k = f - d.f0;
  if (k < 0 || k >= d.life) return null;
  const drag = (1 - 0.74 ** k) / 0.26;
  const z = d.z + d.vz * drag - 0.5 * d.fall * k * k;
  const r = (d.r0 + d.big * (1 - Math.exp(-k / 3))) * (1 - (k / d.life) ** 2);
  return { x: d.x + d.vx * drag, y: d.y + d.vy * drag, z: Math.max(z, 1 + r * 0.3), r, age: k / d.life };
}

/** How dark a piece of the lid is at a depth: as deep things are, but not for sagging a pixel or two (it is still at the floor's level). */
const lidDark = (depth: number): number => darkAt(depth - 2.5);

/**
 * A BILLOW OF DUST, `r` high and 1.3 times as wide, its rim ragged (different for each `seed`): lit on
 * its upper left, in shade on its lower right, so that a cloud of them has a body (floorkit's
 * dustCloud, with a third tone). `tones`: its shade, its body, its light.
 */
function billow(p: Px, x: number, y: number, r: number, tones: readonly [string, string, string], seed: number): void {
  const k = 0.32 * r;
  for (let yy = Math.floor(y - r); yy <= y + r; yy++) {
    for (let xx = Math.floor(x - r * 1.3); xx <= x + r * 1.3; xx++) {
      const dx = (xx + 0.5 - x) / 1.3;
      const dy = yy + 0.5 - y;
      const q = (dx * dx + dy * dy) / (r * r);
      // (its rim ragged in lumps of two pixels, not in single specks)
      if (q > 1 || (q > 0.62 && hash(Math.floor(xx / 2), Math.floor(yy / 2), 150 + seed) < 0.28 + (q - 0.62) * 1.6)) continue;
      // (a crescent of light round its upper left, of shade round its lower right: where a circle as big, moved the other way, does not reach)
      const lit = (dx - k) ** 2 + (dy - k) ** 2 > r * r;
      const dark = (dx + k) ** 2 + (dy + k) ** 2 > r * r;
      p.set(xx, yy, lit ? tones[2] : dark ? tones[0] : tones[1]);
    }
  }
}

// =================================================================================================
// THE MOMENT

const cache = new Map<string, Moment>();

/**
 * THE STAIRWELL OPENS, in the stone and earth of `theme` (one of CRYPT_FLOORS), its steps going down
 * toward +x (`way` 'x') or +y ('y'). Anchored as makeStairwell's picture is (the corner of the opening
 * up the screen); its frames are bigger than it (the dust goes up high and out wide) and each is cut to
 * what is painted in it: line them up by the anchor. `before`: none (nothing of it is there before it
 * plays; the floor is the game's own); `after`: makeStairwell's picture, its last frame to the pixel.
 */
export function stairwellOpens(theme: Theme, way: Way): Moment {
  const key = `${theme.id}:${way}`;
  const made = cache.get(key);
  if (made) return made;
  const m = makeMoment(theme, way);
  cache.set(key, m);
  return m;
}

function makeMoment(theme: Theme, way: Way): Moment {
  const final = makeStairwell(theme, way);
  const wells = new Map<number, Well>();
  const wellAt = (h: number): Well => {
    let w = wells.get(h);
    if (!w) wells.set(h, (w = paintWell(theme, way, h)));
    return w;
  };
  const W0 = wellAt(KERB_H);
  const BW = W0.p.w;
  const BH = W0.p.h;
  // the frame: the stairwell's picture with room round it for the dust
  const PADX = 140;
  const PADT = 300;
  const PADB = 70;
  const FW = BW + 2 * PADX;
  const FH = BH + PADT + PADB;
  const AX = W0.ox + PADX;
  const AY = W0.oy + PADT;
  /** A point of the world (x, y tiles, z picture pixels) on the frame. */
  const scr = (x: number, y: number, z: number): [number, number] => [AX + (x - y) * 32, AY + (x + y) * 16 - z];
  /** A point of the stairwell's ground (along the way down, across it) as x and y. */
  const XY = (al: number, ac: number): [number, number] => toXY(way, al, ac);

  const { pieces, hinge } = lidPieces(theme, way);
  /** How much of each piece shows lying in its place: the pixels of its top (what its `shown` is measured against). */
  const lying = pieces.map((p) => {
    const px = new Set<number>();
    for (let i = 0; i < p.idx.length; i++) {
      if (p.nrm[i * 3 + 2] < 0.9) continue;
      const [x, y] = toXY(way, hinge[p.cell][0] + p.pts[i * 3] / KT, hinge[p.cell][1] + p.pts[i * 3 + 1] / KT);
      px.add(Math.floor(AY + (x + y) * 16) * FW + Math.floor(AX + (x - y) * 32));
    }
    return px.size;
  });
  const lands = Array.from({ length: ROWS * 2 }, (_, c) => landOf(c, hinge[c]));
  // the great burst: the last slab's slam
  const great = Math.max(...lands.map((l) => l.at));
  const kerbOf = (f: number): number => (f < HEAVE ? 0 : f - HEAVE < KERB_RISE.length ? KERB_RISE[f - HEAVE] : f === great || f === great + 1 ? [8, 7][f - great] : KERB_H);
  const earth = earthCells(theme.earth?.gone ?? 0);
  const gone = theme.earth?.gone ?? 0;
  // THE DUST of this floor: the floor's dust (floor 2's), the more earth the more of a plum
  const EARTHY = ['#3a2e44', '#4a3c54', '#5c4c66'];
  const DUST = FLOOR_DUST.map((c, i) => mix(c, EARTHY[i], Math.min(0.8, gone * 1.7)));
  /** Its shade; a billow rising (shade, body, light), and falling and thinning, a tone down. */
  const DUSK = mix(DUST[0], '#07050a', 0.35);
  const RISING: readonly [string, string, string] = [DUST[0], DUST[1], DUST[2]];
  const LATE: readonly [string, string, string] = [DUSK, DUST[0], DUST[1]];
  const dirt = theme.earth?.dirt ?? DIRT;
  const rock = theme.earth?.rock ?? ROCK;
  const CHIP_STONE: readonly [string, string, string] = [mix(theme.slab[3], '#ffffff', 0.1), theme.slab[2], theme.slab[0]];
  /** A stone's chunk: its lit edge catching the light. */
  const STONE_CHUNK: readonly [string, string, string] = [mix(theme.slab[3], '#ffffff', 0.22), theme.slab[3], theme.slab[0]];
  const CHIP_EARTH: readonly [string, string, string] = [mix(dirt[3], '#ffffff', 0.12), dirt[3], dirt[0]];
  const CHIP_ROCK: readonly [string, string, string] = [mix(rock[3], '#ffffff', 0.15), rock[3], rock[0]];
  const K = STAIR_KERB;
  const L = STAIR_LONG;
  const Wd = STAIR_WIDE;

  // ----- THE CRACKS: the lines of the lid and round the kerb, each opening from one end at a pace
  interface Crack { pts: [number, number][]; f0: number; v: number; burst: number; spurts: boolean }
  const cracks: Crack[] = [];
  /** A crack along a line `at(t)` for t 0..1 (along, across), `len` tiles long, opening from frame f0 at v tiles a frame. */
  const crack = (at: (t: number) => [number, number], len: number, f0: number, v: number, burst = 0, spurts = false): void => {
    const n = Math.max(2, Math.ceil(len * 40));
    cracks.push({ pts: Array.from({ length: n + 1 }, (_, i) => at(i / n)), f0, v, burst, spurts });
  };
  // (from the middle: the second row's split and the line between the second and third rows)
  const mA = L / 2;
  const mC = splitLine(1, mA - 0.01);
  // (bursting open at once a fifth of a tile each way from the middle on the shock)
  crack((t) => [rowLine(2, mC * (1 - t)), mC * (1 - t)], mC, SHOCK, 0.16, 0.25, true);
  crack((t) => [rowLine(2, mC + (Wd - mC) * t), mC + (Wd - mC) * t], Wd - mC, SHOCK, 0.16, 0.25, true);
  crack((t) => [mA - (mA - 0.6) * t, splitLine(1, mA - (mA - 0.6) * t)], 0.6, SHOCK, 0.18, 0.25, true);
  crack((t) => [mA + 0.6 * t, splitLine(2, mA + 0.6 * t)], 0.6, SHOCK, 0.18, 0.25, true);
  // (the cracks that branch off the middle into the slabs: art/stairwell_open.ts, BRANCHES)
  for (const br of BRANCHES) {
    const lens = br.slice(1).map((q, i) => Math.hypot(q[0] - br[i][0], q[1] - br[i][1]));
    const len = lens.reduce((u, v) => u + v, 0);
    crack((t) => {
      let d = t * len;
      for (let i = 0; i < lens.length; i++) {
        if (d <= lens[i] || i === lens.length - 1) {
          const k = Math.min(1, d / lens[i]);
          return [br[i][0] + (br[i + 1][0] - br[i][0]) * k, br[i][1] + (br[i + 1][1] - br[i][1]) * k];
        }
        d -= lens[i];
      }
      return br[br.length - 1] as [number, number];
    }, len, SHOCK + 2, 0.14);
  }
  // (the other two lines across, from where the splits meet them; the splits of the end rows)
  for (const r of [1, 3]) {
    const a = r === 1 ? 0.6 : 1.8;
    const c0 = splitLine(r === 1 ? 1 : 2, a);
    crack((t) => [rowLine(r, c0 * (1 - t)), c0 * (1 - t)], c0, SHOCK + 3, 0.3);
    crack((t) => [rowLine(r, c0 + (Wd - c0) * t), c0 + (Wd - c0) * t], Wd - c0, SHOCK + 3, 0.3);
  }
  crack((t) => [0.6 * (1 - t), splitLine(0, 0.6 * (1 - t))], 0.6, SHOCK + 4, 0.3);
  crack((t) => [1.8 + 0.6 * t, splitLine(3, 1.8 + 0.6 * t)], 0.6, SHOCK + 4, 0.3);
  // (the opening's outline: its long sides from where the middle line meets them, both ways; its ends from the corners)
  for (const ac of [0.012, Wd - 0.012]) {
    crack((t) => [mA * (1 - t), ac], mA, SHOCK + 3, 0.42);
    crack((t) => [mA + (L - mA) * t, ac], L - mA, SHOCK + 3, 0.42);
  }
  crack((t) => [0.012, Wd * t], Wd, SHOCK + 6, 0.5);
  crack((t) => [L - 0.012, Wd * (1 - t)], Wd, SHOCK + 6, 0.5);
  // (the kerb's outline round its three sides, and its two ends at the top of the steps)
  for (const ac of [-K + 0.012, Wd + K - 0.012]) {
    crack((t) => [mA * (1 - t), ac], mA, SHOCK + 4, 0.45, 0, true);
    crack((t) => [mA + (L + K - mA) * t, ac], L + K - mA, SHOCK + 4, 0.45, 0, true);
  }
  crack((t) => [L + K - 0.012, -K + (Wd + 2 * K) * t], Wd + 2 * K, SHOCK + 6, 0.6);
  crack((t) => [0.012, -K * t], K, SHOCK + 6, 0.2);
  crack((t) => [0.012, Wd + K * t], K, SHOCK + 6, 0.2);
  /** How much of a crack is open on frame f: its points up to there. */
  const openOf = (c: Crack, f: number): number => Math.min(c.pts.length - 1, Math.floor((c.burst + (f - c.f0 + 1) * c.v) * 40));
  const frontOf = (c: Crack, f: number): [number, number] | null => {
    if (f < c.f0) return null;
    const i = openOf(c, f);
    const iPrev = f > c.f0 ? openOf(c, f - 1) : -1;
    return i > iPrev ? c.pts[i] : null;
  };

  // ----- THE DUST AND WHAT FLIES
  const clouds: Cloud[] = [];
  const chips: Chip[] = [];
  let seed = 0;
  const h = (i: number, j: number, s: number): number => hash(i, j, s);
  /** A billow of dust and, round it, `n - 1` smaller ones going with it, so that it reads as a cloud and never as a spot. */
  const puff = (d: Omit<Cloud, 'seed'>, n = 3): void => {
    const R = d.r0 + d.big;
    for (let j = 0; j < n; j++) {
      const a = (j / n) * Math.PI * 2 + hash(seed, j, 539) * 2;
      const off = j ? ((0.5 + 0.4 * hash(seed, j, 538)) * R) / 32 : 0;
      clouds.push({
        ...d,
        x: d.x + Math.cos(a) * off,
        y: d.y + Math.sin(a) * off,
        z: d.z + (j ? (hash(seed, j, 537) - 0.3) * R * 0.5 : 0),
        r0: d.r0 * (j ? 0.8 : 1),
        big: d.big * (j ? 0.55 + 0.25 * hash(seed, j, 536) : 1),
        life: d.life - (j ? Math.floor(3 * hash(seed, j, 535)) : 0),
        seed: seed++,
      });
    }
  };
  // THE CRACKS RUN: a spurt of dust and a hop of grit where each runs (every other frame), the grit back into its crack
  for (let f = SHOCK; f < HEAVE; f++) {
    cracks.forEach((c, ci) => {
      const p = frontOf(c, f);
      if (!p || (f + ci) % 2) return;
      const [x, y] = XY(p[0], p[1]);
      if (c.spurts && (f + ci) % 4 === 0) puff({ f0: f, x, y, z: 1, vx: 0, vy: 0, vz: 1.8 + 1.4 * h(f, ci, 542), r0: 2.4, big: 2.8 + 1.6 * h(ci, f, 543), life: 8, fall: 0.06 }, 2);
      chips.push({ f0: f, x, y, z: 0.5, vx: 0, vy: 0, vz: 3.5 + 2 * h(ci, f, 544), g: 1, size: 2, tones: CHIP_STONE });
    });
  }
  // THE SHOCK: a spurt of dust and grit out of the middle, where the first crack bursts open
  {
    const [x, y] = XY(mA, mC);
    puff({ f0: SHOCK, x, y, z: 1, vx: 0, vy: 0, vz: 2.5, r0: 3.5, big: 4, life: 9, fall: 0.06 }, 3);
    for (let i = 0; i < 4; i++) chips.push({ f0: SHOCK, x: x + (h(i, 1, 541) - 0.5) * 0.15, y: y + (h(i, 2, 541) - 0.5) * 0.15, z: 0.5, vx: 0, vy: 0, vz: 3.5 + 2.5 * h(i, 3, 541), g: 1, size: 2, tones: CHIP_STONE });
  }
  // THE HEAVE: dust blown out low from under the kerb as it shoves up, more at its corners; grit thrown up off it and out of the lid's cracks
  {
    const along: [number, number, number, number][] = [
      // [al, ac, out along, out across]
      [0.05, -K, -0.6, -0.8], [0.7, -K, 0, -1], [1.5, -K, 0.2, -1], [L + K, -K, 0.7, -0.7], [L + K, Wd / 2, 1, 0],
      [L + K, Wd + K, 0.7, 0.7], [1.8, Wd + K, 0.1, 1], [1.0, Wd + K, 0, 1], [0.3, Wd + K, -0.3, 1], [0.05, Wd + K, -0.6, 0.8],
    ];
    along.forEach(([al, ac, oa, oc], i) => {
      const [x, y] = XY(al, ac);
      const [vx, vy] = XY(oa * 0.12, oc * 0.12);
      puff({ f0: HEAVE + (i % 2), x, y, z: 3, vx, vy, vz: 2 + 2 * h(i, 1, 545), r0: 5, big: 6.5 + 3 * h(i, 2, 545), life: 12 + Math.floor(3 * h(i, 3, 545)), fall: 0.05 }, 3);
    });
    // (and jets of it bursting straight up out of the lid's cracks, three billows each, one on another)
    for (let i = 0; i < 5; i++) {
      const al = rowLine(1 + (i % 3), 0.2 + 0.9 * h(i, 8, 546));
      const [x, y] = XY(al, 0.15 + 0.95 * h(i, 9, 546));
      for (let j = 0; j < 3; j++) puff({ f0: HEAVE + j, x, y, z: 2, vx: 0, vy: 0, vz: 6 + 3 * h(i, j, 547), r0: 2.4, big: 3 + 1.5 * j, life: 11 - j, fall: 0.35 }, 1);
    }
    for (let i = 0; i < 16; i++) {
      const [x, y] = XY(0.1 + 2.3 * h(i, 5, 546), -0.05 + 1.35 * h(i, 6, 546));
      chips.push({ f0: HEAVE, x, y, z: 3, vx: 0, vy: 0, vz: 4.5 + 3 * h(i, 7, 546), g: 1.1, size: 2, tones: CHIP_STONE });
    }
  }
  // EACH SLAB: grit pouring off its far end as it tips; at its slam dust blown up out of the hole and chips flung (more, the deeper it falls)
  for (let cell = 0; cell < ROWS * 2; cell++) {
    const r = cell >> 1;
    const ld = lands[cell];
    const isEarth = earth.has(cell);
    const tones = isEarth ? CHIP_EARTH : CHIP_STONE;
    for (let i = 0; i < 4; i++) {
      const [x, y] = XY(Math.max(0.05, hinge[cell][0] - 0.55), 0.1 + 1.05 * h(cell, i, 547));
      chips.push({ f0: tipOf(cell) + 1 + (i % 3), x, y, z: -1, vx: 0, vy: 0, vz: 0, g: 1.2, size: 2, tones });
    }
    // (earth crumbles as it goes: clods and stones shed off it, tumbling into the hole after it)
    if (isEarth) {
      for (let i = 0; i < 10; i++) {
        const al = hinge[cell][0] - 0.08 - 0.5 * h(cell, i, 557);
        const [x, y] = XY(al, (cell & 1 ? 0.65 : 0.1) + 0.5 * h(i, cell, 558));
        chips.push({ f0: tipOf(cell) + 1 + (i % 5), x, y, z: -1 - 3 * h(i, cell, 559), vx: 0, vy: 0, vz: 1 + 2 * h(cell, i, 560), g: 1.3, size: 2 + (i % 3 === 0 ? 1 : 0), tones: i % 3 === 0 ? CHIP_ROCK : CHIP_EARTH });
      }
    }
    // (up out of what is open of the hole, from where it fell back toward the top of the steps)
    const n = r === 0 ? 4 : 4 + 4 * r;
    for (let i = 0; i < n; i++) {
      const al = Math.max(0.12, Math.min(hinge[cell][0] - 0.15, hinge[cell][0] - 0.2 - 0.6 * h(cell, i, 548)));
      const [x, y] = XY(al, 0.12 + 1.0 * h(i, cell, 549));
      // (each deeper slam a bigger column of its own, building to the great burst)
      puff({ f0: ld.at + (i % 3), x, y, z: 1, vx: 0, vy: 0, vz: 5 + r * 6 + 6 * h(i, cell, 550), r0: 3, big: 4 + r * 3 + 3 * h(i, cell, 551), life: 15 + r * 3, fall: 0.5 }, 2);
    }
    for (let i = 0; i < 4 + 3 * r; i++) {
      const al = Math.max(0.15, hinge[cell][0] - 0.25 - 0.4 * h(cell, i, 552));
      const ac = 0.2 + 0.85 * h(i, cell, 553);
      const [x, y] = XY(al, ac);
      const vz = 6 + r * 2 + 4 * h(i, cell, 554);
      const T = (2 * vz) / 1.3;
      // (and back down into the hole: across it from where it went up)
      const [tx, ty] = XY(Math.max(0.2, Math.min(hinge[cell][0] - 0.2, al + (h(cell, i, 555) - 0.5) * 0.6)), Wd - ac + (h(cell, i, 556) - 0.5) * 0.3);
      chips.push({ f0: ld.at, x, y, z: 1, vx: (tx - x) / T, vy: (ty - y) / T, vz, g: 1.3, size: r >= 2 && i < 2 ? 4 : 2 + (i % 2), tones: isEarth ? (i % 2 ? CHIP_ROCK : CHIP_EARTH) : CHIP_STONE });
    }
  }
  // THE GREAT BURST: a column of dust blown up out of the whole hole, high, spreading out as it goes; a
  // ring of it rolling out over the kerb across the floor; chips and stones flung up high, across the
  // hole and back down into it
  const [cx, cy] = XY(L / 2, Wd / 2);
  for (let i = 0; i < 56; i++) {
    const al = 0.12 + (L - 0.24) * h(i, 1, 561);
    const ac = 0.1 + (Wd - 0.2) * h(i, 2, 561);
    const [x, y] = XY(al, ac);
    const up = h(i, 3, 561) ** 0.6;
    // (the higher it goes, the wider it spreads: it mushrooms out at the top)
    const spread = 0.05 + 0.12 * up;
    puff({ f0: great + (i % 3), x, y, z: 2, vx: (x - cx) * spread + (h(i, 4, 561) - 0.5) * 0.06, vy: (y - cy) * spread + (h(i, 5, 561) - 0.5) * 0.06, vz: 10 + 46 * up, r0: 4 + 2 * h(i, 6, 561), big: 7 + 13 * up + 3 * h(i, 7, 561), life: 22 + Math.floor(6 * h(i, 8, 561)), fall: 0.85 }, 1);
  }
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 + (h(i, 1, 562) - 0.5) * 0.5;
    const ra = Math.cos(a);
    const rc = Math.sin(a);
    // (from the kerb, round the hole, out over the floor)
    const reach = Math.min((L / 2 + K) / (Math.abs(ra) + 1e-6), (Wd / 2 + K) / (Math.abs(rc) + 1e-6));
    const [x, y] = XY(L / 2 + ra * reach, Wd / 2 + rc * reach);
    const [vx, vy] = XY(ra * (0.14 + 0.12 * h(i, 2, 562)), rc * (0.14 + 0.12 * h(i, 3, 562)));
    puff({ f0: great + (i % 2), x, y, z: 4, vx, vy, vz: 1.5 + 1.5 * h(i, 4, 562), r0: 5, big: 6 + 5 * h(i, 5, 562), life: 16 + Math.floor(6 * h(i, 6, 562)), fall: 0.03 }, 2);
  }
  for (let i = 0; i < 30; i++) {
    const stone = i < 9;
    const al = 0.3 + (L - 0.6) * h(i, 1, 563);
    const ac = 0.2 + (Wd - 0.4) * h(i, 2, 563);
    const [x, y] = XY(al, ac);
    // (some flung high, some low and long across the hole: each comes back down into it)
    const low = i % 3 === 1;
    const vz = stone ? 8 + 4.5 * h(i, 3, 563) : low ? 6 + 3 * h(i, 3, 563) : 10 + 8 * h(i, 3, 563);
    const T = (2 * vz) / 1.3;
    const far = low ? (al < L / 2 ? L - 0.35 : 0.3) : L - al + (h(i, 4, 563) - 0.5) * 0.8;
    const [tx, ty] = XY(Math.max(0.25, Math.min(L - 0.35, far)), Math.max(0.15, Math.min(Wd - 0.3, Wd - ac + (h(i, 5, 563) - 0.5) * 0.4)));
    const earthy = earth.size > 0 && h(i, 6, 563) < earth.size / 8;
    chips.push({ f0: great + Math.floor(h(i, 7, 563) * 6), x, y, z: 2, vx: (tx - x) / T, vy: (ty - y) / T, vz, g: 1.3, size: stone ? 5 + (i % 2) : 3, tones: stone ? (earthy ? CHIP_ROCK : STONE_CHUNK) : earthy ? (i % 2 ? CHIP_EARTH : CHIP_ROCK) : CHIP_STONE });
  }

  // ----- THE FRAMES
  const tracks: Track[] = [];
  const pieceTrack = pieces.map((p, i) => {
    const t: Track = { name: `${earth.has(p.cell) ? 'a slab of earth' : 'a slab'} (${i + 1}, row ${(p.cell >> 1) + 1})`, at: [] };
    tracks.push(t);
    return t;
  });
  const kerbTrack: Track = { name: 'the kerb', at: [] };
  tracks.push(kerbTrack);

  const grit: Chip[] = [];
  const paintFrame = (f: number, record: boolean): Px => {
    const out = new Px(FW, FH);
    const zb = new Float32Array(FW * FH).fill(0);
    const owner = new Int16Array(FW * FH).fill(-1);
    const kh = kerbOf(f);
    const lidUp = f >= HEAVE;
    // THE STAIRWELL at the kerb's height (from the heave on): what is under the lid, the kerb
    if (lidUp) {
      const w = wellAt(kh);
      fastBlit(out, w.p, PADX, PADT);
      for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) zb[(y + PADT) * FW + x + PADX] = w.z[y * BW + x];
    }
    /** Put a point of the world on the frame if nothing nearer the eye is there; darkened by its depth (`dark`). Its height is taken as on the ray through the pixel's middle: the eye's ray climbs 132 for every 100 down the screen. */
    const put = (sx: number, sy: number, z: number, c: string, who: number, dark: number): boolean => {
      const X = Math.floor(sx);
      const Y = Math.floor(sy);
      if (X < 0 || Y < 0 || X >= FW || Y >= FH) return false;
      const i = Y * FW + X;
      const zz = z + ((sy - (Y + 0.5)) * 100) / 132;
      if (zz <= zb[i]) return false;
      zb[i] = zz;
      owner[i] = who;
      out.set(X, Y, dark ? mix(c, PIT_DARK, dark) : c);
      return true;
    };
    // THE PIECES OF THE LID
    const sizes: number[] = [];
    const mids: ([number, number] | null)[] = [];
    pieces.forEach((p, pi) => {
      const P = poseOf(p.cell, f, hinge[p.cell]);
      if (P.off) {
        sizes.push(0);
        mids.push(null);
        return;
      }
      const d = { da: 0, dc: 0, dz: 0 };
      const R = turnOf(P);
      let x0 = Infinity;
      let x1 = -Infinity;
      let y0 = Infinity;
      let y1 = -Infinity;
      const n = p.idx.length;
      for (let i = 0; i < n; i++) {
        const a = p.pts[i * 3];
        const c = p.pts[i * 3 + 1];
        const z = p.pts[i * 3 + 2];
        const na = p.nrm[i * 3];
        const nc = p.nrm[i * 3 + 1];
        const nz = p.nrm[i * 3 + 2];
        const wa = R[0] * na + R[1] * nc + R[2] * nz;
        const wc = R[3] * na + R[4] * nc + R[5] * nz;
        const wz = R[6] * na + R[7] * nc + R[8] * nz;
        const [nx, ny] = toXY(way, wa, wc);
        // (only the faces turned toward the eye)
        if (nx * EYE[0] + ny * EYE[1] + wz * EYE[2] <= 0.02) continue;
        const A = P.al + d.da + (R[0] * a + R[1] * c + R[2] * z) / KT;
        const C = P.ac + d.dc + (R[3] * a + R[4] * c + R[5] * z) / KT;
        const Z = P.z + d.dz + R[6] * a + R[7] * c + R[8] * z;
        const [x, y] = toXY(way, A, C);
        const ramp = p.ramp[p.rampOf[i]];
        // (lit as its face turns to the light, from the upper left)
        const lit = nx * LIGHT[0] + ny * LIGHT[1] + wz * LIGHT[2];
        const k = Math.max(0, Math.min(ramp.length - 1, p.idx[i] + Math.round(3 * (lit - p.lit0[i]))));
        const [sx, sy] = scr(x, y, Z);
        put(sx, sy, Z, ramp[k], pi, lidDark(-Z));
        x0 = Math.min(x0, sx);
        x1 = Math.max(x1, sx);
        y0 = Math.min(y0, sy);
        y1 = Math.max(y1, sy);
      }
      sizes.push(Math.max(x1 - x0, y1 - y0));
      const A = P.al + d.da + (R[0] * p.mid[0] + R[1] * p.mid[1] + R[2] * p.mid[2]) / KT;
      const C = P.ac + d.dc + (R[3] * p.mid[0] + R[4] * p.mid[1] + R[5] * p.mid[2]) / KT;
      const Z = P.z + d.dz + R[6] * p.mid[0] + R[7] * p.mid[1] + R[8] * p.mid[2];
      const [mx, my] = toXY(way, A, C);
      mids.push(scr(mx, my, Z));
    });
    // THE CRACKS, over the floor as it lies (before the heave): a dark line, its foot a joint's dark
    if (!lidUp) {
      for (const c of cracks) {
        if (f < c.f0) continue;
        const n = openOf(c, f);
        for (let i = 0; i < n; i++) {
          const [a0, c0] = c.pts[i];
          const [a1, c1] = c.pts[i + 1];
          // (a crack wanders: a pixel up or down here and there)
          const j0 = Math.round((hash(Math.floor(i / 3), c.f0 * 7 + Math.round(a0 * 9), 581) - 0.5) * 1.6);
          const [x0, y0] = scr(...XY(a0, c0), 0);
          const [x1, y1] = scr(...XY(a1, c1), 0);
          out.line(Math.floor(x0), Math.floor(y0) + j0, Math.floor(x1), Math.floor(y1) + j0, DEEP);
          out.line(Math.floor(x0), Math.floor(y0) + j0 + 1, Math.floor(x1), Math.floor(y1) + j0 + 1, theme.mortar);
        }
      }
    }
    // WHAT FLIES: chips and stones, streaked when fast; the grit
    const fly = (c: Chip): void => {
      const k = f - c.f0;
      if (k < 0) return;
      const [x, y, z] = chipAt(c, f);
      if (z < -150) return;
      const [sx, sy] = scr(x, y, z);
      if (k > 0) {
        const [px_, py_, pz] = chipAt(c, f - 1);
        const [qx, qy] = scr(px_, py_, pz);
        const sp = Math.hypot(sx - qx, sy - qy);
        // (a short streak behind it, flying fast: a pixel wide, the way it came)
        if (sp > 3) {
          const len = Math.min(sp - 1, 4);
          const ux = (qx - sx) / sp;
          const uy = (qy - sy) / sp;
          const ox = c.size / 2 - 0.5;
          for (let s = 1; s <= len; s++) {
            const wz = z + ((pz - z) * s) / sp;
            put(sx + ox + ux * (s + c.size / 2), sy + ox + uy * (s + c.size / 2), wz, c.tones[2], -2, darkAt(-wz));
          }
        }
      }
      for (let dy = 0; dy < c.size; dy++) {
        for (let dx = 0; dx < c.size; dx++) {
          const wz = z + (c.size - dy) * 0.3;
          put(sx + dx, sy + dy, wz, dy === 0 || dx === 0 ? c.tones[0] : dx + dy >= 2 * c.size - 3 ? c.tones[2] : c.tones[1], -2, darkAt(-wz));
        }
      }
    };
    // (what is down in the hole first: the dust over the hole is in front of it)
    chips.forEach((c) => f >= c.f0 && chipAt(c, f)[2] <= 0 && fly(c));
    grit.forEach(fly);
    // THE DUST, over all: older and farther first; rising, the floor's dust lit on its upper left; falling and thinning, a tone down
    const live = clouds
      .map((d) => ({ d, s: cloudAt(d, f) }))
      .filter((q) => q.s !== null && q.s.r >= 1.5)
      .sort((a, b) => a.d.f0 - b.d.f0 || a.s!.x + a.s!.y - (b.s!.x + b.s!.y));
    for (const { d, s } of live) {
      const [sx, sy] = scr(s!.x, s!.y, s!.z);
      billow(out, sx, sy, s!.r, s!.age > 0.55 ? LATE : RISING, d.seed);
    }
    // (a cloud's rim is ragged, but never a lone speck of dust: his note on the rats, "Animations need run the checks")
    if (live.length) {
      const dusty = new Set([...DUST, DUSK].map((c) => c.toLowerCase()));
      const lone: number[] = [];
      for (let y = 0; y < FH; y++) {
        for (let x = 0; x < FW; x++) {
          if (!out.has(x, y)) continue;
          let n = 0;
          for (let dy = -1; dy <= 1 && !n; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && out.has(x + dx, y + dy)) n++;
          if (!n && dusty.has(out.get(x, y)!)) lone.push(x, y);
        }
      }
      for (let i = 0; i < lone.length; i += 2) out.erase(lone[i], lone[i + 1]);
    }
    // (what flies above the floor, over the dust: chips and stones flung out of it)
    chips.forEach((c) => f >= c.f0 && chipAt(c, f)[2] > 0 && fly(c));
    if (record) {
      // (how much of each piece shows: what of it is not hidden, the less the deeper and darker it is)
      const seen = new Array<number>(pieces.length).fill(0);
      for (let i = 0; i < owner.length; i++) if (owner[i] >= 0) seen[owner[i]] += 1 - lidDark(-zb[i]);
      pieces.forEach((_p, pi) => {
        const m = mids[pi];
        if (!m) {
          pieceTrack[pi].at.push(null);
          return;
        }
        pieceTrack[pi].at.push({ x: m[0] - AX, y: m[1] - AY, shown: Math.min(1, seen[pi] / lying[pi]), size: Math.max(8, sizes[pi]) });
      });
      kerbTrack.at.push(f < HEAVE ? null : { x: 0, y: -kh, shown: 1, size: 8 });
    }
    return out;
  };

  // HOW LONG: until every slab is gone down out of sight, every chip and stone into the hole, every cloud thinned away
  let last = great + 1;
  for (let f = great; f < great + 120; f++) {
    const busy = clouds.some((d) => (cloudAt(d, f)?.r ?? 0) >= 1.5) || chips.some((c) => f >= c.f0 && chipAt(c, f)[2] > -40);
    if (busy) last = f + 1;
  }
  const N = last + 3;
  // GRIT trickling off the kerb's inner edge on the far side, near the steps' foot, where the near kerb hides it as it falls: one grain every other frame, to the end
  for (let i = 0; i < 9; i++) {
    const [x, y] = XY(1.3 + 0.95 * hash(i, 1, 591), 0.03);
    grit.push({ f0: N - 2 - 2 * i - (i % 2), x, y, z: 0, vx: 0, vy: 0, vz: 0, g: 0.8, size: 2, tones: CHIP_STONE });
  }
  const frames: Sprite[] = [];
  const cut = (p: Px): Sprite => {
    const bb = p.bounds(GRAIN);
    if (!bb) return new Px(GRAIN, GRAIN).sprite(AX % GRAIN, AY % GRAIN, GRAIN);
    const q = new Px(bb.w, bb.h);
    fastBlit(q, p, -bb.x, -bb.y);
    return q.sprite(AX - bb.x, AY - bb.y, GRAIN);
  };
  for (let f = 0; f < N - 1; f++) frames.push(cut(paintFrame(f, true)));
  // the last: the stairwell at rest (makeStairwell's own picture, to the pixel: tests/stairwell_open.test.ts)
  const lastPx = new Px(FW, FH);
  fastBlit(lastPx, wellAt(KERB_H).p, PADX, PADT);
  paintFrame(N - 1, true);
  frames.push(cut(lastPx));
  // THE JOLTS: the shock, the heave, the slams of the slabs that fall deep (the second and third rows' first), the great burst
  const jolts = [SHOCK, HEAVE, Math.min(lands[2].at, lands[3].at), Math.min(lands[4].at, lands[5].at), great];
  return { name: 'the stairwell opens', frames, fps: 30, before: null, after: [final], tracks, jolts: [...new Set(jolts)].sort((a, b) => a - b), holds: [] };
}
