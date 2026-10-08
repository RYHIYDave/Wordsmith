// (MOCK-UP, NOT IN THE GAME) DECORATIONS: where the map-maker puts them, and the one switch that
// all of it is behind.
//
// The owner, 5 Oct 2026, 12:43: "I'd like the layout as whole to be less uniform. The floors and
// walls just need more variation. And more doodads around like molted tapestries or gargoyle heads
// or missing broken floors tiles. That kind of thing. I know it's a tomb but I'd like it to look
// more alive if that makes sense". 12:44: "And everything looks too flat". (He was told then that
// "molted" was read as moth-eaten.) And 7 Oct, 11:32, before the walls were redone: "...I'd like a
// solution before we decorate the dungeon so we have a better idea of what we can and can't fit on
// the walls". The walls are settled since Version 18.4: a wall is its faces alone, 40 game pixels
// high, its top 12 fading out, so 28 solid game pixels of a room's back walls (a hero is about 28
// tall) are there for what hangs on them; and only a room's back walls are drawn.
//
// EVERYTHING OF IT IS BEHIND ONE SWITCH, `DECOR.on`, AND IT IS OFF. With it off the map-maker lays
// no decoration, the renderer draws none and no shadow at the foot of a standing thing, and every
// dungeon is what it was (tests/decor.test.ts holds that). It is a mock-up, to make pictures of for
// the owner: nothing that changes how the game looks goes in before he has seen it and said yes.
//
// WHAT THERE IS (the pictures: art/decor.ts; how they are drawn: render/render.ts):
//   - A TATTERED TAPESTRY on a room's back wall: moth-eaten cloth with a ragged hem and a faded
//     design, hung from an iron rod, flat in the wall's plane.
//   - A GARGOYLE'S HEAD jutting out of a room's back wall, high up: a stone grotesque built as a
//     lit solid by the heroes' own painter (art/skin.ts).
//   - A BROKEN FLAGSTONE in a room's floor: CRACKED across, a piece of it sunk; or GONE, the dark
//     under it showing. Loose bits about it.
//   - A SOFT DARK SHADOW AT THE FOOT OF EVERY STANDING THING (a brazier, a barrel, an urn, a chest,
//     a pillar), as the hero and the monsters have (the owner's rule of 6 Oct 2026: "a soft,
//     semi-transparent black oval/circle on the floor directly beneath the Player and the Monsters
//     to anchor them into the 3D space"): `footShadow`.
//   - (and if `near` is set as well) A FIGURE STANDING BETWEEN A FIRE AND THE EYE IS DRAWN A STEP
//     DARKER: we see the side of it the fire does not light (a cue Graveyard Keeper uses): `nearSide`.
//
// WHERE THEY GO. A room's two BACK walls are the only walls drawn (render/walls.ts): the row of
// wall at y = room.y - 1, whose face looks to +y (up the screen to the right of the room's top
// corner), and the column at x = room.x - 1, whose face looks to +x. A piece hangs on a block of one
// of them whose face to the room is painted and is not left out, with such a block on either side
// of it; NOT BY A DOORWAY OR A DOOR (the wall runs on unbroken for two blocks either side of it, and
// none of those is the stone beside a door); NOT BY A FIRE (no brazier on the floor before it, nor
// beside that, nor one row out); with nothing standing right before it, and no pillar near. The
// floor pieces are whole flagstones of the room's own level floor, clear of the walls, of whatever
// stands or lies there, and of where the hero comes in and the boss waits. AT MOST TWO ON THE WALLS
// AND TWO ON THE FLOOR OF A ROOM, THREE IN ALL, and some rooms have none: livelier, not cluttered.
// They are laid last (after the doors), BY DICE OF THEIR OWN: a dungeon with them is the dungeon it
// was, but for them.

import { VAULT, WALL_LOOK } from '../art/ground';
import type { RNG } from '../engine/rng';
import { FACE_LEFT, FACE_RIGHT, wallFaces, wallsAway } from '../render/walls';
import { doorTiles } from './doors';
import { SOLID_PROPS, T_FLOOR, T_WALL } from './types';
import type { DecorKind, DecorSpot, Floor, Room } from './types';

/**
 * THE SWITCH. `on`: the map-maker lays decorations and the renderer draws them, and a soft shadow
 * at the foot of every standing thing. OFF IN THE GAME: a mock-up, until the owner has seen its
 * pictures and said yes. `near` (only with `on`): a figure between a fire and the eye is drawn a
 * step darker; shown to him as a picture of its own.
 */
export const DECOR = { on: false, near: false };

/** The most pieces a room has on its walls, on its floor, and in all. */
export const WALL_MOST = 2;
export const FLOOR_MOST = 2;
export const ROOM_MOST = 3;
/** Pieces in one room are at least this far apart, in tiles (between the middles of the blocks they hang on, or of the flagstones). */
export const APART = 3;
/** How many flagstones lie along the side of a tile (the theme's: art/ground.ts). */
export const SLABS = VAULT.slabs;

/** A place a wall piece could hang: its first block, the way its face looks, the floor before that block, and how many blocks it hangs over. */
interface WallPlace {
  bx: number;
  by: number;
  alongX: boolean;
  fx: number;
  fy: number;
  wide: number;
}

/**
 * LAY THE DECORATIONS OF A LEVEL (the map-maker's last step, if `DECOR.on`). Room by room, in the
 * order of the rooms, by the dice it is given (none of the map-maker's own). Changes nothing of the
 * level: what it returns is all there is of them.
 */
export function layDecor(f: Floor, rng: RNG): DecorSpot[] {
  const W = f.w;
  const H = f.h;
  const at = (x: number, y: number): number => (x >= 0 && y >= 0 && x < W && y < H ? y * W + x : -1);
  const cutAt = (i: number): number => (f.cut ? f.cut[i] : 0);
  /** Whole floor of the room's own height: not cut, not raised, not sunken, not a flight of stairs. */
  const level = (x: number, y: number): boolean => {
    const i = at(x, y);
    return i >= 0 && f.tiles[i] === T_FLOOR && cutAt(i) === 0 && (!f.height || f.height[i] === 0) && (!f.stair || f.stair[i] === 0);
  };
  const away = wallsAway(f, WALL_LOOK);
  // what stands and lies on the floor
  const taken = new Uint8Array(W * H);
  const solid = new Uint8Array(W * H);
  const fire = new Uint8Array(W * H);
  const pillar = new Uint8Array(W * H);
  for (const p of f.props) {
    const i = at(p.x, p.y);
    if (i < 0) continue;
    taken[i] = 1;
    if (SOLID_PROPS.includes(p.kind)) solid[i] = 1;
    if (p.kind === 'brazier') fire[i] = 1;
    if (p.kind === 'pillar') pillar[i] = 1;
  }
  // the tiles of every door and gate: the stone beside a door, and the doorway
  const doorStone = new Uint8Array(W * H);
  for (const d of f.doors ?? []) for (const i of doorTiles(f, d)) doorStone[i] = 1;
  // EVERY WAY IN OR OUT OF A ROOM, on any of its sides: floor in the ring of wall round it, and every door's and gate's tiles
  const opening = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) if (doorStone[i] === 1) opening[i] = 1;
  for (const r of f.rooms) {
    for (let x = r.x - 1; x <= r.x + r.w; x++) {
      for (let y = r.y - 1; y <= r.y + r.h; y++) {
        if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) continue;
        const i = at(x, y);
        if (i >= 0 && f.tiles[i] === T_FLOOR) opening[i] = 1;
      }
    }
  }
  const near = (grid: Uint8Array, x: number, y: number, r: number): boolean => {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (grid[at(x + dx, y + dy)] === 1) return true;
    return false;
  };
  /** A block of a back wall whose face to the room (`alongX`: the one that looks to +y) is painted, stands, and is no door's. */
  const face = (x: number, y: number, alongX: boolean): boolean => {
    const i = at(x, y);
    return i >= 0 && f.tiles[i] === T_WALL && cutAt(i) === 0 && away[i] === 0 && doorStone[i] === 0 && (wallFaces(f, i) & (alongX ? FACE_LEFT : FACE_RIGHT)) !== 0;
  };
  /** The places a piece `wide` blocks wide could hang in a room: on blocks of its back walls whose faces are painted, and those either side of them; the wall unbroken two blocks further each way; level floor before them all; nothing standing right before it, no fire near, no pillar near. */
  const wallPlaces = (r: Room, wide: number): WallPlace[] => {
    const out: WallPlace[] = [];
    const consider = (bx: number, by: number, alongX: boolean, fx: number, fy: number): void => {
      const sx = alongX ? 1 : 0;
      const sy = alongX ? 0 : 1;
      // the blocks it hangs on, and one on either side of them along the wall
      for (let k = -1; k <= wide; k++) if (!face(bx + k * sx, by + k * sy, alongX)) return;
      // no opening in the wall and no door's stone within two blocks of it
      for (const k of [-2, wide + 1]) {
        const i = at(bx + k * sx, by + k * sy);
        if (i < 0 || f.tiles[i] !== T_WALL || doorStone[i] === 1) return;
      }
      // the floor before them, the room's own and level
      for (let k = -1; k <= wide; k++) if (!level(fx + k * sx, fy + k * sy)) return;
      // nothing standing right before it; no fire before it or beside that, nor a row out; no pillar
      // near; no way in or out of the room, a door or a gate, within two tiles, on any side of the room
      for (let k = 0; k < wide; k++) {
        const x = fx + k * sx;
        const y = fy + k * sy;
        if (solid[at(x, y)] === 1 || near(fire, x, y, 1) || near(pillar, x, y, 3) || near(opening, x, y, 2)) return;
      }
      out.push({ bx, by, alongX, fx, fy, wide });
    };
    // (its blocks, and the one either side of them, all over the room's own floor: not at the room's corners)
    for (let x = r.x + 1; x + wide < r.x + r.w; x++) consider(x, r.y - 1, true, x, r.y);
    for (let y = r.y + 1; y + wide < r.y + r.h; y++) consider(r.x - 1, y, false, r.x, y);
    return out;
  };
  const startX = Math.floor(f.start.x);
  const startY = Math.floor(f.start.y);
  const bossX = Math.floor(f.boss.x);
  const bossY = Math.floor(f.boss.y);
  /** The flagstones that could be broken: whole ones on the room's level floor, every tile they lie on clear of walls and of all that stands or lies there, and away from where the hero comes in and the boss waits. Each: [x, y] in flagstones. */
  const floorPlaces = (r: Room): [number, number][] => {
    const out: [number, number][] = [];
    const tiles = (s: number): [number, number] => [Math.floor(s / SLABS), Math.floor((s + 1) / SLABS - 1e-9)];
    for (let sv = Math.ceil(r.y * SLABS); (sv + 1) / SLABS <= r.y + r.h; sv++) {
      for (let su = Math.ceil(r.x * SLABS); (su + 1) / SLABS <= r.x + r.w; su++) {
        const [x0, x1] = tiles(su);
        const [y0, y1] = tiles(sv);
        let ok = true;
        for (let ty = y0; ty <= y1 && ok; ty++) {
          for (let tx = x0; tx <= x1 && ok; tx++) {
            // (clear of the walls: whole level floor all round the tile)
            for (let dy = -1; dy <= 1 && ok; dy++) for (let dx = -1; dx <= 1 && ok; dx++) ok = level(tx + dx, ty + dy);
            // (nor anything standing or lying within a tile: the stones beside it are broken too)
            if (ok && near(taken, tx, ty, 1)) ok = false;
            if (ok && Math.max(Math.abs(tx - startX), Math.abs(ty - startY)) < 3) ok = false;
            if (ok && Math.max(Math.abs(tx - bossX), Math.abs(ty - bossY)) < 3) ok = false;
          }
        }
        if (ok) out.push([su, sv]);
      }
    }
    return out;
  };
  /** The middle of a wall piece along its wall, in the world's tiles. */
  const middle = (w: WallPlace): [number, number] => (w.alongX ? [w.bx + w.wide / 2, w.by + 1] : [w.bx + 1, w.by + w.wide / 2]);
  const out: DecorSpot[] = [];
  for (const r of f.rooms) {
    let walls = rng.weightedIndex([0.2, 0.45, 0.35]);
    let floors = rng.weightedIndex([0.3, 0.45, 0.25]);
    if (walls + floors > ROOM_MOST) floors = ROOM_MOST - walls;
    walls = Math.min(walls, WALL_MOST);
    floors = Math.min(floors, FLOOR_MOST);
    // the wall pieces: a tapestry (two blocks wide) or a gargoyle (one) first, and the other kind second
    const first: DecorKind = rng.chance(0.5) ? 'tapestry' : 'gargoyle';
    const kinds: DecorKind[] = [first, first === 'tapestry' ? 'gargoyle' : 'tapestry'];
    const hung: WallPlace[] = [];
    for (const kind of kinds.slice(0, walls)) {
      const wide = kind === 'tapestry' ? TAPESTRY_BLOCKS : 1;
      for (const w of rng.shuffle(wallPlaces(r, wide))) {
        const [mx, my] = middle(w);
        if (hung.some((h) => Math.hypot(middle(h)[0] - mx, middle(h)[1] - my) < APART)) continue;
        hung.push(w);
        out.push({ kind, room: r.id, x: w.bx, y: w.by, alongX: w.alongX, variant: rng.int(0, 255) });
        break;
      }
    }
    // the broken flagstones
    const laid: [number, number][] = [];
    for (const s of rng.shuffle(floorPlaces(r))) {
      if (laid.length >= floors) break;
      if (laid.some((q) => Math.hypot(q[0] - s[0], q[1] - s[1]) < APART * SLABS)) continue;
      laid.push(s);
      out.push({ kind: rng.chance(0.55) ? 'crack' : 'hole', room: r.id, x: s[0], y: s[1], alongX: false, variant: rng.int(0, 255) });
    }
  }
  return out;
}

/** How many blocks of wall a tapestry hangs over (art/decor.ts: it is TAPESTRY_WIDE picture pixels, two blocks). */
export const TAPESTRY_BLOCKS = 2;

/** Of a wall piece: the point of its wall's face under the middle of its first block, on the floor (where a gargoyle is stood; a tapestry's strips are stood along the face from its first block's start), in the world's tiles. */
export function wallPoint(d: DecorSpot): { x: number; y: number } {
  return d.alongX ? { x: d.x + 0.5, y: d.y + 1 } : { x: d.x + 1, y: d.y + 0.5 };
}

/** Of a floor piece: the top corner of its flagstone, in the world's tiles (where its picture is anchored). */
export function slabCorner(d: DecorSpot): { x: number; y: number } {
  return { x: d.x / SLABS, y: d.y / SLABS };
}

/** Of any piece: the tile that has to have been seen for it to be drawn (a wall piece's block; the tile a floor piece's flagstone begins on). */
export function decorTile(f: Floor, d: DecorSpot): number {
  if (d.kind === 'tapestry' || d.kind === 'gargoyle') return d.y * f.w + d.x;
  const c = slabCorner(d);
  return Math.floor(c.y + 0.01) * f.w + Math.floor(c.x + 0.01);
}

/**
 * THE SOFT DARK AT THE FOOT OF A STANDING THING (with the switch on): how far it reaches, in tiles
 * as the shadow under a figure is measured (render.ts, `shadow`), and how dark it is at its middle.
 * Null for a thing that has none, and FOR EVERYTHING WITH THE SWITCH OFF. (`state` 1: a barrel or an
 * urn that has been broken lies on the floor, and stands no more.)
 */
export function footShadow(kind: string, state: number): { r: number; a: number } | null {
  if (!DECOR.on) return null;
  switch (kind) {
    case 'pillar':
      return { r: 0.56, a: 0.78 };
    case 'chest':
      return { r: 0.58, a: 0.74 };
    case 'barrel':
      return state === 0 ? { r: 0.46, a: 0.76 } : null;
    case 'urn':
      return state === 0 ? { r: 0.4, a: 0.74 } : null;
    case 'brazier':
      return { r: 0.46, a: 0.7 };
    default:
      return null;
  }
}

/**
 * THE NEAR SIDE OF A FIRE (with the switch on, and `near`): how much darker a figure standing at
 * (x, y) is drawn, 0 to 1, for the fires that burn at `fires`. A figure that stands between a fire
 * and the eye is seen from the side of it the fire does not light: just in front of the fire,
 * about in line with it as the eye looks, the most; less to either side, and less the further in
 * front, until at three tiles nothing. Nothing at all with the switch off.
 */
export function nearSide(x: number, y: number, fires: ReadonlyArray<{ x: number; y: number }>): number {
  if (!DECOR.on || !DECOR.near) return 0;
  let k = 0;
  for (const b of fires) {
    // (how much nearer the eye the figure is than the fire, along the way the eye looks; and how far to the side on the screen: 1 is half a tile's width)
    const ahead = x + y - (b.x + b.y);
    const aside = Math.abs(x - y - (b.x - b.y));
    if (ahead <= 0.2 || ahead >= 3 || aside >= 1.4) continue;
    const by = ahead < 0.8 ? (ahead - 0.2) / 0.6 : ahead < 2 ? 1 : 3 - ahead;
    k = Math.max(k, by * (1 - aside / 1.4));
  }
  return k;
}
