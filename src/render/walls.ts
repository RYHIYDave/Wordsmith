// THE WALLS' LOOK (art/ground.ts, WallLook): the two rules of the look in which a wall is its
// faces alone. They are kept apart from the painting so that the unit tests ask the very rules
// the renderer goes by: tests/walls.test.ts walks every face that would be painted, point by
// point, and finds no floor under the solid part of any of them.
//
// The geometry behind both (engine/iso.ts): a tile's diamond is 32 by 16 pixels on the screen, and
// a tile straight behind another lies 16 pixels up the screen.
import type { WallLook } from '../art/ground';
import { doorPiers, doorTiles, isLeaf } from '../game/doors';
import { CUT_FAR, CUT_LEFT, CUT_RIGHT, T_FLOOR, T_PIT, T_VOID, T_WALL } from '../game/types';
import type { Floor } from '../game/types';

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
  return out;
}

/**
 * THE WALL BESIDE A DOOR, A MOCK-UP BEHIND A SWITCH THAT IS OFF (the owner, 18 Oct 2026, 08:27: "I’d like
 * you to look at levels 1-5 and add the wall sections that are missing on the sides of any door.  I feel
 * like you leave out any wall sections that would hide the player but I don’t like how it looks.  Figure
 * out how to fade them or whatever so it doesn’t hide the player, but I don’t like the gaps missing in the
 * walls"). On: the walls left out beside a door stand, and are seen through while someone is behind them.
 */
// (ON, Version 23.7: his yes to the planning chat, 18 Oct 2026, 08:46 Pacific, “Yes”, to the pictures; and to putting it in, to the
// main chat, 21 Oct 2026, “Yes, put it in (Recommended)”. `near` stays off: that side has no wall by his 18.4 look)
export const DOOR_WALLS = { on: true, near: false };

/**
 * (THE WALL BESIDE A DOOR) Of the walls left out (`away`), those that stand again: beside every door
 * or gate in a BACK wall, along the line of that wall, from the doorway outward on either side, as
 * long as the wall runs on left out (four tiles at most a side). A door's own stone on either side
 * (its pier) is the first of them. Doors on a side toward the eye are not touched: that whole side
 * has no wall (the game's look since 18.4), and a stub of wall beside a door there would stand alone.
 * Each one stands as a whole wall does (its faces turned to floor, `wallFaces`), and the renderer
 * sees it through while the hero or a monster in sight is behind it.
 */
export function doorWallsBack(f: Floor, away: Uint8Array): Uint8Array {
  const out = new Uint8Array(f.w * f.h);
  for (const d of f.doors ?? []) {
    const tiles = doorTiles(f, d);
    // (`near`, for pictures: on a side toward the eye, a door's own two stones and no more)
    if (d.near) {
      if (DOOR_WALLS.near && isLeaf(d.kind)) for (const i of [tiles[0], tiles[2]]) if (f.tiles[i] === T_WALL && away[i]) out[i] = 1;
      continue;
    }
    const step = d.alongX ? 1 : f.w;
    const leaf = isLeaf(d.kind);
    // (a door's piers are its first and last tile; a gate's three tiles are all walked: begin past them)
    for (const [from, dir] of [
      [leaf ? tiles[2] : tiles[2] + step, step],
      [leaf ? tiles[0] : tiles[0] - step, -step],
    ]) {
      let i = from;
      for (let n = 0; n < 4; n++, i += dir) {
        const x = i % f.w;
        const y = (i - x) / f.w;
        if (i < 0 || i >= f.w * f.h || (d.alongX ? y !== (tiles[0] - (tiles[0] % f.w)) / f.w : x !== tiles[0] % f.w)) break;
        if (f.tiles[i] !== T_WALL || !away[i]) break;
        out[i] = 1;
      }
    }
  }
  return out;
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
  return out;
}

/**
 * EVERY WALL STANDING, SEEN THROUGH WIDE ROUND WHOEVER IS BEHIND IT. His words, 2 Nov 2026, 18:17: “We really need to figure out how we are going to do walls that block character view and
 * apply it to every level.  Cause I hate that some wall sections are still missing from the early floors”; asked whether to use
 * floors 11 to 15's way (the wall whole, a window round the hero), his answer: “I don’t really like the window, it’s too small.  But
 * I also really didn’t like the old way we did level 6 where you actually couldn’t see a thing if you weren’t in an open square”;
 * and “This release (Recommended)”. READ AS (told him so): on floors 1 to 5 no wall is left out (the walls toward the eye, between
 * the rooms, across the corners); every wall between the eye and the hero fades to faint across a wide stretch round him, whole
 * tiles of wall at a time (as the walls beside a door do), and round a monster in sight; floors 6 to 10 stay as open as they are.
 *   across: how far to either side of the hero (game pixels) the walls in front of him fade, wholly within `across * 0.6` and
 *     less to its edge; faint: how much of a wall is left there; secs: how long it takes to fade, and to come back.
 */
// (ON: shown pictures of floors 1 to 5 from the game as now and with every wall standing (walls_every_floor), and asked to switch it
// on, his answer, 2 Nov 2026, 18:38: “I’m going to go with this for now, but I’m not sure how I feel about it.  I’ll test in game and
// see”. Read as: on, in this release; he plays it and says.)
export const WHOLE_WALLS = { on: true, across: 96, faint: 0.2, secs: 0.2 };

/**
 * (WHOLE_WALLS) THE FACES OF A WALL BLOCK THAT ARE PAINTED when every wall stands: those with floor before them (`wallFaces`), and
 * those turned to the eye with nothing before them, where the wall bounds floor (the outside of a wall toward the eye: the room's
 * floor is behind it). A face with another wall before it is never seen.
 */
export function wholeFaces(f: Floor, idx: number): number {
  let out = wallFaces(f, idx);
  const tx = idx % f.w;
  const ty = (idx - tx) / f.w;
  const tile = (x: number, y: number): number => (x < 0 || y < 0 || x >= f.w || y >= f.h ? T_VOID : f.tiles[y * f.w + x]);
  let bounds = false;
  for (let dy = -1; dy <= 1 && !bounds; dy++) for (let dx = -1; dx <= 1 && !bounds; dx++) bounds = tile(tx + dx, ty + dy) === T_FLOOR || tile(tx + dx, ty + dy) === T_PIT;
  if (!bounds) return out;
  if (!(out & FACE_LEFT) && tile(tx, ty + 1) === T_VOID) out |= FACE_LEFT;
  if (!(out & FACE_RIGHT) && tile(tx + 1, ty) === T_VOID) out |= FACE_RIGHT;
  return out;
}

