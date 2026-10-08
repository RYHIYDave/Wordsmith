// THE WALLS' LOOK (art/ground.ts, WallLook): the two rules of the look in which a wall is its
// faces alone. They are kept apart from the painting so that the unit tests ask the very rules
// the renderer goes by: tests/walls.test.ts walks every face that would be painted, point by
// point, and finds no floor under the solid part of any of them.
//
// The geometry behind both (engine/iso.ts): a tile's diamond is 32 by 16 pixels on the screen, and
// a tile straight behind another lies 16 pixels up the screen.
import type { WallLook } from '../art/ground';
import { doorLine, doorPiers } from '../game/doors';
import { CUT_FAR, CUT_LEFT, CUT_RIGHT, T_FLOOR, T_PIT, T_WALL } from '../game/types';
import type { DoorSpot, Floor } from '../game/types';

/**
 * WHICH WALLS ARE LEFT OUT (1 in the grid): every wall that, standing whole, would hide floor
 * behind it. For each wall tile, and for each tile that carries the flat wall of a corner cut
 * across the screen (a floor tile cut CUT_FAR: the wall stands over its far half).
 *
 * Without `faces` a wall is a BLOCK `tall` pixels high with a top: it hides part of the floor tile
 * that lies a tiles and b tiles behind it straight behind (a = b) if it is taller than 16 (a - 1),
 * and one apart (|a - b| = 1) if taller than 8 (a + b) - 8; further to the side, never.
 *
 * With `faces` a wall has no top, and the part of it that fades out at its top hides nothing: a
 * face's SOLID part, `tall - fade` pixels high, hides the floor tile a and b behind its block
 * straight behind if solid > 16 a, and one apart if solid > 16 times the lesser of a and b. The
 * flat wall across a cut tile stands half a tile further back (16 a - 8 straight behind), and the
 * tile right behind it is its own back, which does not count.
 *
 * (One kind of wall stands though it hides floor: the stone beside a door in a back wall. See the
 * end of the function.)
 */
export function wallsAway(f: Floor, look: WallLook): Uint8Array {
  const out = new Uint8Array(f.w * f.h);
  const isFloor = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < f.w && y < f.h && (f.tiles[y * f.w + x] === T_FLOOR || f.tiles[y * f.w + x] === T_PIT);
  const reach = Math.ceil(look.tall / 16) + 1;
  const faces = look.faces;
  const solid = look.tall - (faces ? look.fade : 0);
  for (let y = 0; y < f.h; y++) {
    for (let x = 0; x < f.w; x++) {
      const i = y * f.w + x;
      const flat = f.tiles[i] === T_FLOOR && f.cut !== undefined && f.cut[i] === CUT_FAR;
      if (f.tiles[i] !== T_WALL && !flat) continue;
      let hides = false;
      for (let b = 0; b <= reach && !hides; b++) {
        for (let a = 0; a <= reach && !hides; a++) {
          if (a + b === 0 || Math.abs(a - b) > 1 || (flat && a + b <= 2)) continue;
          const need = !faces ? (a === b ? 16 * (a - 1) : 8 * (a + b) - 8) : a === b ? 16 * a - (flat ? 8 : 0) : 16 * Math.min(a, b);
          hides = solid > need && isFloor(x - a, y - b);
        }
      }
      if (hides) out[i] = 1;
    }
  }
  // DOORS (game/doors.ts): of the stone on either side of a door, the one a back wall runs on into
  // (the first of the doorway's three tiles) STANDS WHATEVER IT HIDES, so that the wall reaches the
  // door's frame. The other one, and both on a side toward the eye, go by the rule above: each has
  // floor right beside it or behind it, and is left out.
  for (const d of f.doors ?? []) if (d.kind === 'door' && !d.near) out[doorPiers(f, d)[0]] = 0;
  // (MOCK-UP: a hole knocked in a wall, shown in a wall that is WHOLE: the two blocks after it stand too)
  if (HOLE_LOOK.whole) for (const d of f.doors ?? []) if (d.kind === 'hole') for (const i of holeNotch(f, d)) out[i] = 0;
  return out;
}

/**
 * (MOCK-UP, NOT IN THE GAME) HOW THE WALL BESIDE A HOLE KNOCKED IN IT IS SHOWN. `whole` false: the
 * two blocks after the hole, which would hide the way through, are left out, as beside every
 * doorway in a back wall (a dark notch). `whole` true: they stand, so that the hole is a hole in a
 * wall that goes on to either side of it, and are SEEN THROUGH while the hero is in the way behind
 * them (render.ts).
 */
export const HOLE_LOOK = { whole: false };
/** (MOCK-UP) The two wall blocks after a hole's tile along its wall. */
export function holeNotch(f: Floor, d: DoorSpot): number[] {
  const line = doorLine(d);
  return [2, 3].map((k) => (d.alongX ? line * f.w + d.a + k : (d.a + k) * f.w + line));
}
/** (MOCK-UP) The tiles of the way through a hole: its own, and the two behind it. */
export function holeWay(f: Floor, d: DoorSpot): number[] {
  const line = doorLine(d);
  return [0, 1, 2].map((k) => (d.alongX ? (line + d.out * k) * f.w + d.a + 1 : (d.a + 1) * f.w + line + d.out * k));
}

/** The face of a wall block that is turned to screen-left (it hangs from the block's lower-left edge), and the one turned to screen-right. */
export const FACE_LEFT = 1;
export const FACE_RIGHT = 2;

/**
 * WHICH FACES OF A WHOLE WALL BLOCK ARE PAINTED (with `faces`): a wall is the upright planes
 * behind the far edges of floor, and nothing else. The face turned to screen-left is painted if
 * floor (or a pit) lies before it, at (x, y + 1); the one turned to screen-right, if it lies at
 * (x + 1, y). A tile cut corner to corner counts only if its FLOOR half is the one along that
 * edge: a tile whose far half is wall, or whose half to that side is, turns wall to the block.
 * Returns FACE_LEFT, FACE_RIGHT, both added, or 0.
 */
export function wallFaces(f: Floor, idx: number): number {
  const tx = idx % f.w;
  const ty = (idx - tx) / f.w;
  const cutAt = (j: number): number => (f.cut ? f.cut[j] : 0);
  const open = (j: number, shut: number): boolean => f.tiles[j] === T_PIT || (f.tiles[j] === T_FLOOR && cutAt(j) !== CUT_FAR && cutAt(j) !== shut);
  let out = 0;
  if (ty + 1 < f.h && open(idx + f.w, CUT_RIGHT)) out += FACE_LEFT;
  if (tx + 1 < f.w && open(idx + 1, CUT_LEFT)) out += FACE_RIGHT;
  const hole = holeSides(f);
  return hole === null ? out : out & ~(hole.get(idx) ?? 0);
}

/**
 * (MOCK-UP, NOT IN THE GAME) THE SIDE OF THE STONE A HOLE IS KNOCKED BESIDE, turned into the hole,
 * IS NOT PAINTED. The wall that runs on ends at the hole, and its side, a whole tile deep, would
 * fill the hole as seen from the room: the hole would show a face of stone and not the dark. The
 * hole's own piece (art/gates.ts, `makeBreach`) paints a band of that thickness instead. Of each
 * stone beside a hole: the face not to paint (null: the level has no hole).
 */
const holeSidesOf = new WeakMap<Floor, Map<number, number>>();
function holeSides(f: Floor): Map<number, number> | null {
  if (!f.doors || !f.doors.some((d) => d.kind === 'hole')) return null;
  let m = holeSidesOf.get(f);
  if (!m) {
    m = new Map<number, number>();
    for (const d of f.doors) {
      if (d.kind !== 'hole') continue;
      // (the first of the doorway's three tiles: the stone the wall runs on in, beside the hole's tile)
      const line = doorLine(d);
      const near = d.alongX ? line * f.w + d.a : d.a * f.w + line;
      m.set(near, (m.get(near) ?? 0) | (d.alongX ? FACE_RIGHT : FACE_LEFT));
    }
    holeSidesOf.set(f, m);
  }
  return m;
}
