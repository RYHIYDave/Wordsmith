// A place of the game in low-poly 3D: its floor, its walls, and what stands in it and never
// changes (pillars, bones, the dressing of its walls), built from the level the rules play on.
//
// It is built a piece at a time (CHUNK tiles square), each piece when the hero first comes near
// it, and each piece once: what has not been seen yet is not drawn (gl.ts, Look.seen), so nothing
// here depends on what has been explored.
//
// WALLS. In the pixel game a wall is drawn low wherever floor lies behind it, "so walls never
// hide the room they enclose" (game/level.ts). Here every wall stands as high as it can without
// hiding floor that lies behind it on the screen, up to WALL_MAX: so the two walls at the back of
// a room are real walls, taller than the hero, and the two at the front are a kerb the room is
// seen over (which is the rule above, and gives the same low walls).
//
// Everything is worked out in the GAME's axes (x runs down the screen to the right, y down to
// the left) and turned into the painter's at the end (its X is the game's y: gl/scenes.ts).

import type { Level } from '../game/state';
import { T_FLOOR, T_WALL } from '../game/types';
import { C, SCONCE_FLAME, bones, floor, gargoyle, hanging, moss, pillar, rubble, sconce, stone, wall } from './kit3';
import { Mesh, box, hex, rnd, tone } from './mesh';
import type { RGB } from './mesh';
import { mats, rotZ, scale, translate } from './vec';
import type { M4 } from './vec';

/** Tiles to a side of one piece of a place. */
export const CHUNK = 8;
/** The height of a wall that floor lies right behind: a kerb. */
export const KERB = 0.41;
/** No wall stands higher than this (a hero is about two tall). */
export const WALL_MAX = 2.6;
/** A wall may hide this many game pixels of the nearest floor behind it (the tip of one flagstone). */
const HIDE_PX = 8;
/** Game pixels a thing rises on the screen for each tile of height (the camera looks down at 30 degrees: 32 / sqrt 2 * cos 30). */
export const PX_HIGH = 19.6;

/** The game's (x, y, z) as the painter's: its X is the game's y. A mirror, so Mesh.add turns the triangles back. */
export const SWAP: M4 = (() => {
  const m = new Float32Array(16);
  m[1] = 1;
  m[4] = 1;
  m[10] = 1;
  m[15] = 1;
  return m;
})();

/** A fire that is drawn moving, and lights what is near it: where it burns (game axes), how big. */
export interface Flame {
  x: number;
  y: number;
  z: number;
  size: number;
  seed: number;
}

export interface Piece {
  /** In the painter's axes. */
  mesh: Mesh;
  /** The torches on its walls. */
  flames: Flame[];
}

/**
 * How high the wall on each tile stands (0 where there is none): as high as it can without
 * hiding floor behind it on the screen. A tile `a` back along x and `b` back along y is straight
 * behind when a = b and half a tile to one side when they differ by one; it begins 8(a + b)
 * pixels up the screen, less the half height of a flagstone.
 */
export function wallHeights(L: Level): Float32Array {
  const f = L.floor;
  const H = new Float32Array(f.w * f.h);
  const isFloor = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < f.w && y < f.h && f.tiles[y * f.w + x] === T_FLOOR;
  for (let y = 0; y < f.h; y++) {
    for (let x = 0; x < f.w; x++) {
      if (f.tiles[y * f.w + x] !== T_WALL) continue;
      let lim = WALL_MAX;
      for (let a = 0; a <= 6; a++) {
        for (let b = Math.max(0, a - 1); b <= Math.min(6, a + 1); b++) {
          if (a + b === 0 || !isFloor(x - a, y - b)) continue;
          lim = Math.min(lim, (8 * (a + b) - (a === b ? 16 : 8) + HIDE_PX) / PX_HIGH);
        }
      }
      H[y * f.w + x] = Math.max(KERB, lim);
    }
  }
  // One height to a straight run of wall of a kind (a real wall, or one a man can see over): the
  // lowest any of its stones may have. (Twice over, so that the two walls that meet at the back
  // corner of a room agree.) A kerb is a kerb; and where a low stretch interrupts a high wall,
  // the wall steps down to it and up again.
  const kind = (i: number): number => (H[i] <= KERB + 0.2 ? 0 : H[i] < 1.7 ? 1 : 2);
  for (let pass = 0; pass < 2; pass++) {
    for (const along of [true, false]) {
      const lines = along ? f.h : f.w;
      const long = along ? f.w : f.h;
      for (let line = 0; line < lines; line++) {
        const at = (j: number): number => (along ? line * f.w + j : j * f.w + line);
        let k = 0;
        while (k < long) {
          const what = kind(at(k));
          if (what === 0) {
            k++;
            continue;
          }
          let e = k;
          let low = WALL_MAX;
          while (e < long && kind(at(e)) === what) low = Math.min(low, H[at(e++)]);
          for (let j = k; j < e; j++) H[at(j)] = low;
          k = e;
        }
      }
    }
  }
  return H;
}

const pick = (tones: readonly RGB[], a: number, b: number, c = 0): RGB => tones[Math.floor(rnd(a, b, c) * tones.length) % tones.length];

/** Props that are part of the place: they never change, so they are built into its pieces. */
export const FIXED: readonly string[] = ['pillar', 'bones', 'rubble'];

/** One piece of a place: the tiles from (cx, cy) * CHUNK, CHUNK each way. `H`: wallHeights(L). */
export function buildPiece(L: Level, H: Float32Array, cx: number, cy: number): Piece {
  const f = L.floor;
  const m = new Mesh();
  const flames: Flame[] = [];
  const x0 = cx * CHUNK;
  const y0 = cy * CHUNK;
  const x1 = Math.min(f.w, x0 + CHUNK);
  const y1 = Math.min(f.h, y0 + CHUNK);
  const inside = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < f.w && y < f.h;
  const isFloor = (x: number, y: number): boolean => inside(x, y) && f.tiles[y * f.w + x] === T_FLOOR;
  const high = (x: number, y: number): number => (inside(x, y) ? H[y * f.w + x] : 0);
  const seed = (f.seed % 9973) + 1;

  // ---- the floor: flagstones, and the dark bed seen between them
  const stood = new Set<number>();
  for (const p of L.props) if (p.solid || p.kind === 'portal' || p.kind === 'body') stood.add(p.ty * f.w + p.tx);
  let any = false;
  for (let y = y0; y < y1 && !any; y++) for (let x = x0; x < x1; x++) if (f.tiles[y * f.w + x] !== 0) any = true;
  if (!any) return { mesh: m, flames };
  m.add(floor(x0, y0, x1, y1, { skip: (x, y) => !isFloor(x, y), seed, cracked: 0.07, gone: 0.022, bare: true, whole: (x, y) => stood.has(y * f.w + x) }));
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      if (!isFloor(x, y)) continue;
      m.quad([x, y, -0.07], [x + 1, y, -0.07], [x + 1, y + 1, -0.07], [x, y + 1, -0.07], C.gap);
    }
  }

  // ---- the walls: a kerb, or a body with a coping stone on it
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const h = high(x, y);
      if (h <= 0) continue;
      if (h <= KERB + 0.2) {
        const col = tone(pick(C.wall, x, y, seed + 40), 0.72);
        m.add(stone(x + 0.012, y + 0.012, -0.05, x + 0.988, y + 0.988, h + (rnd(x, y, seed + 41) - 0.5) * 0.05, 0.06, { side: tone(col, 0.92), top: tone(col, 0.74) }));
        continue;
      }
      const col = pick(C.dressed, x, y, seed + 42);
      // (the coping stands a little forward of a face that is seen)
      const fx = high(x + 1, y) < h - 0.01 ? 0.08 : -0.012;
      const fy = high(x, y + 1) < h - 0.01 ? 0.08 : -0.012;
      m.add(stone(x + 0.012, y + 0.012, h, x + 1 + fx, y + 1 + fy, h + 0.16, 0.04, { side: tone(col, 0.8), top: tone(col, 0.55) }));
      m.add(box(x + 0.03, y + 0.03, 0, x + 0.97, y + 0.97, h, { side: C.gap }));
    }
  }

  // ---- their faces: coursed stone wherever a wall stands over what is in front of it, in runs
  // `toY`: the faces that look down the screen to the left (along the game's +y); otherwise to the right (+x).
  const faces = (toY: boolean): void => {
    const lines = toY ? [y0, y1] : [x0, x1];
    const span = toY ? [x0, x1] : [y0, y1];
    const tile = (line: number, k: number): [number, number] => (toY ? [k, line] : [line, k]);
    const shows = (line: number, k: number): number => {
      const [x, y] = tile(line, k);
      const h = high(x, y);
      if (h <= KERB + 0.2) return 0;
      return (toY ? high(x, y + 1) : high(x + 1, y)) < h - 0.01 ? h : 0;
    };
    for (let line = lines[0]; line < lines[1]; line++) {
      let k = span[0];
      while (k < span[1]) {
        const h = shows(line, k);
        if (h === 0) {
          k++;
          continue;
        }
        let e = k + 1;
        while (e < span[1] && shows(line, e) === h) e++;
        const long = e - k;
        // (where the run is put: its face on the line between its tiles and the ones in front)
        const put: M4 = toY ? translate(k, line + 1, 0) : mats(translate(line + 1, e, 0), rotZ(-90));
        const ws = (line * 131 + k * 17 + (toY ? 1 : 2) * 7919 + seed) % 100000;
        m.add(wall(long, { high: h, thick: 0.25, plain: true, seed: ws }), put);
        // ---- what is on it: piers, hangings, torches, a beast's head, moss at its foot
        // (`u`: how far along the run, in its own measure; a +x run is laid from its far end back)
        for (let j = 0; j < long; j++) {
          const along = toY ? k + j : e - 1 - j;
          const [tx, ty] = tile(line, along);
          const front = toY ? isFloor(tx, ty + 1) : isFloor(tx + 1, ty);
          if (!front) continue;
          const u = j + 0.5;
          // a pier on every fourth joint between tiles, where the wall goes on, the same, to either side of it
          const joint = along + 1;
          if (joint % 4 === 0 && shows(line, along + 1) === h && (toY ? isFloor(tx + 1, ty + 1) : isFloor(tx + 1, ty + 1))) {
            const pu = toY ? j + 1 : j;
            const pc = pick(C.dressed, line, joint, seed + 50);
            m.add(stone(pu - 0.36, 0, 0, pu + 0.36, 0.28, h + 0.03, 0.05, { side: tone(pc, 0.92), top: tone(pc, 0.6) }), put);
            m.add(stone(pu - 0.45, 0, h - 0.34, pu + 0.45, 0.37, h + 0.1, 0.05, { side: pc, top: tone(pc, 0.6) }), put);
            m.add(stone(pu - 0.45, 0, 0, pu + 0.45, 0.37, 0.2, 0.05, { side: tone(pc, 0.85), top: tone(pc, 0.7) }), put);
          }
          const r = rnd(tx, ty, seed + (toY ? 61 : 62));
          // (nothing hangs where a pier may stand)
          const edge = joint % 4 === 0 || along % 4 === 0;
          if (!edge && r < 0.11 && h >= 1.9) {
            const red = rnd(tx, ty, seed + 63) < 0.6;
            const longH = Math.min(1.7, h - 0.75);
            m.add(hanging(0.74, longH, red ? C.crimson : C.tealDark, red ? C.crimsonDark : hex('#0a4450'), red ? C.goldLight : C.sparkWhite, 0.3 + rnd(tx, ty, seed + 64) * 0.5, (tx * 7 + ty * 13) % 50), mats(put, translate(u, 0.07, h - 0.22)));
          } else if (!edge && r < 0.19) {
            const sz = Math.min(1.55, h - 0.5);
            m.add(sconce((tx * 5 + ty * 3) % 40, false), mats(put, translate(u, 0.03, sz)));
            // (where its flame burns, in the game's axes: the run's own y is the game's y for a +y face and its x for a +x one)
            const fl: [number, number] = toY ? [k + u, line + 1 + 0.03 + SCONCE_FLAME[1]] : [line + 1 + 0.03 + SCONCE_FLAME[1], e - u];
            flames.push({ x: fl[0], y: fl[1], z: sz + SCONCE_FLAME[2], size: 0.4, seed: (tx * 31 + ty * 17) % 97 });
          } else if (!edge && r < 0.205 && h >= 1.9) {
            m.add(gargoyle(false, (tx + ty) % 9), mats(put, translate(u, 0.02, h - 0.62), scale(1.15)));
          }
          if (rnd(tx, ty, seed + 65) < 0.13) m.add(moss(0.3, 5, (tx * 3 + ty) % 60), mats(put, translate(u, 0.2, 0.0)));
        }
        k = e;
      }
    }
  };
  faces(true);
  faces(false);

  // ---- what stands in the place and never changes
  for (const p of L.props) {
    if (p.tx < x0 || p.tx >= x1 || p.ty < y0 || p.ty >= y1) continue;
    if (p.kind === 'pillar') {
      const broken = rnd(p.tx, p.ty, seed + 70) < 0.22 ? 0.8 + rnd(p.tx, p.ty, seed + 71) * 0.7 : 0;
      m.add(pillar(2.5, broken, (p.tx * 7 + p.ty) % 30), translate(p.x, p.y, 0));
      if (broken) m.add(rubble(0.55, 6, (p.tx + p.ty * 5) % 40), translate(p.x + 0.3, p.y + 0.35, 0));
    } else if (p.kind === 'bones') m.add(bones(p.variant + 1), mats(translate(p.x, p.y, 0), rotZ(p.variant * 37)));
    else if (p.kind === 'rubble') m.add(rubble(0.4, 7, p.variant + 1), translate(p.x, p.y, 0));
  }

  const out = new Mesh();
  out.add(m, SWAP);
  return { mesh: out, flames };
}
