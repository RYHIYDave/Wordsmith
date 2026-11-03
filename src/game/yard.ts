// THE HEADSMAN'S YARD (the art chat's, art/yard.ts, behind YARD): FLOOR 2's BOSS HALL LAID AS THE YARD, OUTDOORS, AT NIGHT.
//
// His words, 28 Oct 2026: “And I think I want the headman’s yard to be outdoors.  Like you go out to a big open area like a
// prison yard but there’s the gallows and the chopping block where the headsman’s boss area is at.”; of its light, to the
// art chat, “B, night (Recommended)”; handed over, “Yes, hand it over (Recommended)”; and to put it in, 1 Nov 2026, “Yes, put
// it in now (Recommended)”.
//
// What the game lays (game/dungeon.ts grows floor 2's boss hall for it; layYard squares it; game/first5.ts stands its pieces):
//   - THE HALL: YARD_N tiles each way, a plain square walled round, come into by its far wall along x (the wall at y - 1, whose
//     face is turned to screen-left: render/yard.ts draws it as the prison wall, the doorway the way out of the Crypt);
//   - ITS PIECES, where the art's picture has them: the scaffold, draped, in the middle (the Headsman waits at the foot of its
//     steps), the long gallows against the far wall, the great bell with a barrel and a crate in the far corner, the
//     grindstone, the stocks and the gibbet by the left wall, two braziers. The gallows and the bell's corner change places
//     where the doorway would be among them (`mirror`), and anything that would stand before the doorway is left out;
//   - THE SCAFFOLD AND THE GALLOWS stand as big things: every tile under them is stood on by nobody (`blocks`).

import { YARD } from '../art/yard';
import { T_FLOOR, T_WALL } from './types';
import type { Floor, PropSpot } from './types';

export { YARD };

/** The name of what stands on the tiles of a big piece but its own (nothing is drawn for it: it only stops whoever walks). */
export const YARD_FOOT = 'yard foot';

/** The yard's size, tiles each way (the art's). */
export const YARD_N = 13;

/** One of the yard's pieces: its name (the art's), where it stands (the world's tiles), and the tiles it takes. */
export interface YardPiece {
  name: string;
  x: number;
  y: number;
  /** The tiles (indexes) nobody stands on. */
  blocks: number[];
}
/** The yard as laid: its far corner (x, y), its size, its doorway's first tile along x, whether the far wall's pieces changed places, its pieces. */
export interface YardPlan {
  x: number;
  y: number;
  n: number;
  door: number;
  mirror: boolean;
  pieces: YardPiece[];
}

/** Is floor `depth` laid with the yard? */
export function yardOn(depth: number): boolean {
  return YARD.on && Math.floor(depth) === 2;
}

/** One thing of a group: its name (the art's) or the game's kind it is laid as, its anchor and the tiles it takes, from the group's place. */
interface Member {
  name: string;
  kind?: 'brazier' | 'barrel' | 'urn';
  x: number;
  y: number;
  tiles: [number, number][];
}
/** A group of the yard's things that stand together, and the places it may stand (the yard's tiles from its far corner: x along the far wall at y - 1, y along the wall at x - 1), the first that is free taken. */
interface Group {
  members: Member[];
  at: [number, number][];
}
/** The gallows (its tiles by where its middle is: gallowsTiles). */
const GALLOWS: Member = { name: 'the long gallows', x: 0, y: 1.05, tiles: [] };
/** The tiles the gallows takes with its middle at x = `m`: its platform 3.8 by 1.6 from y 0.25, every tile it covers by a third of one or more, and its steps' tile toward the eye (0.05 left of its middle). */
function gallowsTiles(m: number): [number, number][] {
  const out: [number, number][] = [];
  for (let x = Math.floor(m - 1.9); x <= Math.floor(m + 1.9); x++) {
    if (Math.min(x + 1, m + 1.9) - Math.max(x, m - 1.9) < 0.35) continue;
    out.push([x, 0], [x, 1]);
  }
  out.push([Math.floor(m - 0.05), 2]);
  return out;
}
/**
 * THE YARD'S THINGS, as the art's picture has them, each group with the places it may take if the first is before the doorway
 * or taken: the scaffold in the middle; the gallows against the far wall (its middle at x 10.5 in the picture, at 11, 2.5 or 2
 * else: gallowsTiles); the great bell with a barrel and a
 * crate in the far corner (or the other far corner, or along the left wall); the grindstone; the stocks; the gibbet; two braziers.
 */
const GROUPS: Group[] = [
  // (the scaffold's footprint 3.4 by 3.2, its middle at (6.5, 5.4), its steps down toward the eye at x 5.7 to 7.1)
  { members: [{ name: 'the scaffold, draped', x: 6.5, y: 5.4, tiles: [[5, 4], [6, 4], [7, 4], [5, 5], [6, 5], [7, 5], [5, 6], [6, 6], [7, 6], [6, 7]] }], at: [[0, 0]] },
  { members: [GALLOWS], at: [[10.5, 0], [11, 0], [2.5, 0], [2, 0]] },
  {
    members: [
      { name: 'the great bell', x: 1.6, y: 2.8, tiles: [[1, 2]] },
      { name: 'barrel', kind: 'barrel', x: 2.5, y: 1.5, tiles: [[2, 1]] },
      { name: 'crate', kind: 'urn', x: 1.5, y: 1.5, tiles: [[1, 1]] },
    ],
    at: [[0, 0], [9, 0], [0, 3]],
  },
  { members: [{ name: 'the grindstone', x: 11.9, y: 3.9, tiles: [[11, 3]] }], at: [[0, 0], [0, 2], [-10, 1]] },
  { members: [{ name: 'the stocks', x: 2.0, y: 9.0, tiles: [[2, 9]] }], at: [[0, 0]] },
  { members: [{ name: 'the gibbet', x: 1.1, y: 11.4, tiles: [[1, 11]] }], at: [[0, 0]] },
  { members: [{ name: 'brazier', kind: 'brazier', x: 3.5, y: 8.5, tiles: [[3, 8]] }], at: [[0, 0]] },
  { members: [{ name: 'brazier', kind: 'brazier', x: 10.5, y: 8.5, tiles: [[10, 8]] }], at: [[0, 0]] },
];
/** Where the Headsman waits: at the foot of the scaffold's steps, on its sawdust. */
const BOSS_AT = { x: 6.5, y: 9.5 };

/**
 * LAY THE YARD in the boss hall `id` of a floor just laid (before its terraces, doors and traps): the hall squared (its tiles
 * floor, the ring round it wall but for the doorway, nothing cut), what the map-maker stood in it taken away and the yard's
 * braziers, barrel and crate stood there instead, the Headsman's place, and the plan (`floor.yard`). Null if the hall is not
 * the yard's size or is not come into by its far wall along x (the map-maker grows it so: game/dungeon.ts).
 */
export function layYard(f: Floor, id: number): YardPlan | null {
  const r = f.rooms.find((q) => q.id === id);
  if (!r || r.w !== YARD_N || r.h !== YARD_N) return null;
  const n = YARD_N;
  const W = f.w;
  // (the doorway: the floor in the far wall along x, where the corridor comes in)
  const ins: number[] = [];
  for (let x = r.x; x < r.x + n; x++) if (f.tiles[(r.y - 1) * W + x] === T_FLOOR) ins.push(x - r.x);
  if (ins.length === 0) return null;
  // (nothing comes in by any other wall)
  for (let k = -1; k <= n; k++) {
    for (const [x, y] of [[r.x - 1, r.y + k], [r.x + n, r.y + k], [r.x + k, r.y + n]]) if (f.tiles[y * W + x] === T_FLOOR) return null;
  }
  const door = ins[0];
  // THE HALL SQUARED: its tiles floor, its ring wall (the doorway left), nothing cut in either
  for (let y = r.y - 1; y <= r.y + n; y++) {
    for (let x = r.x - 1; x <= r.x + n; x++) {
      const i = y * W + x;
      const inside = x >= r.x && x < r.x + n && y >= r.y && y < r.y + n;
      if (inside) f.tiles[i] = T_FLOOR;
      else if (!(y === r.y - 1 && x - r.x >= door && x - r.x < door + ins.length)) f.tiles[i] = T_WALL;
      if (f.cut) f.cut[i] = 0;
    }
  }
  // WHAT STOOD IN IT taken away
  const inHall = (p: { x: number; y: number }): boolean => p.x >= r.x && p.x < r.x + n && p.y >= r.y && p.y < r.y + n;
  f.props = f.props.filter((p) => !inHall(p));
  f.packs = f.packs.filter((p) => !inHall(p));
  // ITS THINGS: each group at the first of its places that is clear of the doorway and of what stands already
  const before = (x: number, y: number): boolean => x >= door - 1 && x <= door + ins.length && y <= 3;
  const taken = new Set<string>();
  const pieces: YardPiece[] = [];
  const spots: PropSpot[] = [];
  let mirror = false;
  for (const g of GROUPS) {
    for (const [ox, oy] of g.at) {
      // (the gallows' places are its middles: its tiles go by where its middle is)
      const tilesOf = (m: Member): [number, number][] => (m === GALLOWS ? gallowsTiles(ox) : m.tiles.map(([x, y]): [number, number] => [x + ox, y + oy]));
      const all = g.members.flatMap(tilesOf);
      if (all.some(([x, y]) => x < 0 || y < 0 || x >= n || y >= n || before(x, y) || taken.has(`${x},${y}`))) continue;
      for (const [x, y] of all) taken.add(`${x},${y}`);
      if (g.members[0] === GALLOWS && ox < n / 2) mirror = true;
      for (const m of g.members) {
        const t = tilesOf(m);
        if (m.kind) spots.push({ kind: m.kind, x: r.x + t[0][0], y: r.y + t[0][1] });
        else pieces.push({ name: m.name, x: r.x + m.x + ox, y: r.y + m.y + oy, blocks: t.map(([x, y]) => (r.y + y) * W + r.x + x) });
      }
      break;
    }
  }
  f.props.push(...spots);
  f.boss = { x: r.x + BOSS_AT.x, y: r.y + BOSS_AT.y };
  const plan: YardPlan = { x: r.x, y: r.y, n, door, mirror, pieces };
  f.yard = plan;
  return plan;
}

/** The tiles the yard's pieces take (nobody stands there): for whoever lays the stairwell and the waypoint. */
export function yardBlocks(f: Floor): Set<number> {
  const out = new Set<number>();
  for (const p of f.yard?.pieces ?? []) for (const i of p.blocks) out.add(i);
  return out;
}

/** Is (x, y) in the yard? */
export function inYard(f: Floor, x: number, y: number): boolean {
  const Y = f.yard;
  return !!Y && x >= Y.x && x < Y.x + Y.n && y >= Y.y && y < Y.y + Y.n;
}
