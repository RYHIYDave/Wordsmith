// THE FIRST FIVE FLOORS: EVERY FLOOR LAID WITH ITS OWN PIECES. The owner, 10 Oct 2026, 07:29: "I’d also
// like each floor to be themed after the boss ... We need somewhere between 40-50 unique assets on each
// floor for each boss. That can include wall tiles, floor tiles, breakables, stuff on the walls, on the
// floor, obstacles, the looks of doors and gates, traps, and quests." And 07:52: "I’d also like a couple
// environmental things happening around you for immersion unique for each floor." The art chat painted
// them (art/floor1.ts to floor5.ts and floor5_moments.ts), each floor with his yes, as shown; "where each
// piece stands, when it is laid and what it does ... are the main chat's". This is where.
//
// WHAT THE RULES KNOW OF A PIECE IS ITS NAME (and what the game does with it): the pictures are the art's,
// and a test (tests/first5_floors.test.ts) holds every name here to the art's own list. After the
// map-maker has laid a floor, its last step (`dress`, by dice of its own: nothing else of the floor
// changes) lays:
//   IN THE WALLS' FACES, here and there (never the same piece on two neighbouring tiles of a wall: his
//     note on the first pictures), each at one of its places; those that burn further apart; and a
//     piece with a heap of its own (a crumbled wall) where there is floor before it to take its heap;
//   ON THE FLOOR, the floor's own tiles here and there, and a runner (the king's) or rails (the miners')
//     down a room;
//   IN THE ROOMS, its things that stand (solid, and kept clear of each other, so that nothing is cut
//     off), and its small things that lie or stand about (walked over);
//   ITS THREE MOMENTS, each at a host laid for it (render/dress.ts plays them as he comes near).
// The game's own things are the floor's own (render/dress.ts): its braziers, chests, barrels and urns
// (the floor's four breakables), pillars, bones; and its traps and gates (art/floors.ts).
// None of it on the way in, the way out, a waypoint, a trap, a lever, where a pack stands or before a door.

import { RNG } from '../engine/rng';
import { T_FLOOR, T_PIT, T_WALL } from './types';
import type { Floor, Room } from './types';
import type { Level, PropInst } from './state';
import { FIRST5, beforeGate } from './ways';

/** Where one of a floor's three moments is set: in a wall's face, at a piece laid for it, on the floor. */
export interface MomentSite {
  /** 'wall': in a wall's face (its own piece there, if `piece`); 'thing': at one of the floor's things that stand, laid for it (`piece`); 'floor': on the floor, nothing there before it plays but what the film holds (`solid`: it stands, a heap). */
  at: 'wall' | 'thing' | 'floor';
  piece?: string;
  solid?: boolean;
  /** (the chains' moment) a run of wall a tile and a half long and two tiles of floor out before it. */
  long?: boolean;
  /** (the cart's moment) the rails laid along x from its tile to the rails' end, six tiles on. */
  rails?: boolean;
  /** (the rift's) two tiles along x. */
  two?: boolean;
  /** What stands in for it on a device the film was not made for (a piece of the floor's), or none. */
  standIn?: string;
}

/** A FLOOR'S PIECES, by what the game does with them (their names the art's). */
export interface FloorSet {
  /** Set in a wall's face. */
  wall: readonly string[];
  /** Of those, the ones that burn (their light): fewer, and further apart. */
  burning: readonly string[];
  /** Set in a wall's face with a heap of their own on the floor before it (drawn there, before the wall: it stands, solid). */
  heaps: readonly string[];
  /** A floor's tile, laid here and there. */
  tiles: readonly string[];
  /** Laid down a room in a run (frames: along x two plain and its end, then the same along y): the king's runner. */
  runner?: string;
  /** What lies on the floor: the game's bones are laid as these. */
  lying: readonly string[];
  /** Small things that stand about, walked past (a helm, a lantern). */
  small: readonly string[];
  /** Things that stand, solid, a tile each. */
  things: readonly string[];
  /** Big ones: the eight tiles round each kept clear too. */
  big: readonly string[];
  /** The floor's four breakables: a barrel is the first or second, an urn the third or fourth. */
  breakables: readonly [string, string, string, string];
  chest: string;
  /** The game's brazier, as this floor has it (null: the floor's stone's own). */
  fire: string | null;
  pillar: string | null;
  /** Its traps: the spike floor's holes (and their glint), the dart trap's plate (and pressed), its slot in the wall. */
  traps: { holes: string; plate: string; slot: string };
  /** Its three moments, in the art's order. */
  moments: readonly [MomentSite, MomentSite, MomentSite];
  /** The pieces painted that the game does not lay yet (the quest's: there is no quest for them yet). */
  unlaid: readonly string[];
}

export const FLOOR_SETS: readonly FloorSet[] = [
  {
    // 1, THE WARDEN'S: the dead king's tomb, and his jailer's iron
    wall: ['burial niche', 'sealed niche', 'barred window', 'horned skull', "the king's head", 'fallen-in stones', 'great crack', 'banner', 'banner in rags', 'shield', 'keys on a hook', 'shackles', 'torch', 'crossed mauls', 'horned helm on a peg'],
    burning: ['torch'],
    heaps: ['crumbled wall'],
    tiles: ['ledger stone', 'grave slab and ring', 'drain', 'the crown in the floor', 'sunken grave slab'],
    runner: "the king's runner",
    lying: ['fallen guard', 'dropped keys', 'fallen banner', 'chain'],
    small: ["the statue's head", 'horned helm'],
    things: ['horned knight', 'rack of mauls'],
    big: ['sarcophagus', 'open sarcophagus', "the king's tomb", "the king's throne"],
    breakables: ['funeral urn', 'squat urn', 'bone box', 'skull jar'],
    chest: "the king's coffer",
    fire: 'cresset',
    pillar: 'pillar',
    traps: { holes: 'spike grate', plate: 'skull plate', slot: 'dart skull' },
    moments: [{ at: 'wall' }, { at: 'wall', piece: 'rat hole' }, { at: 'thing', piece: 'candles' }],
    unlaid: ["the Warden's horn"],
  },
  {
    // 2, THE HEADSMAN'S: the place of execution
    wall: ['hatch', 'axe-scarred stone', 'bell niche', 'skull ledge', 'the hood carved', 'the long stain', 'hoods on pegs', 'axe on hooks', 'noose', 'torch', 'his banner', 'branding irons', 'tools of the trade', 'black candles', 'chain from the dark'],
    burning: ['torch', 'black candles'],
    heaps: ['the chute'],
    tiles: ['sawdust', 'gutter', 'trapdoor', 'the split floor', 'the hood in the floor', 'cobbles'],
    lying: ['broken axe', 'coil of rope', 'bones in irons', 'skulls in the sawdust', 'broken wheel'],
    small: ['kicked-over stool', 'dropped lantern'],
    things: ['the block', 'the gallows', 'the grindstone', 'the stocks'],
    big: ['the scaffold'],
    breakables: ['basket', 'sawdust barrel', 'pail', 'crate'],
    chest: "the headsman's strongbox",
    fire: 'brazier of irons',
    pillar: null,
    traps: { holes: 'blade slots', plate: 'crescent plate', slot: 'dart mask' },
    moments: [{ at: 'floor' }, { at: 'thing', piece: 'the great bell' }, { at: 'thing', piece: 'the gibbet' }],
    unlaid: ["the Headsman's hood"],
  },
  {
    // 3, THE CHAINED ONE'S: the prison
    wall: ['bent bars', 'claw-torn stone', 'the feeding slot', 'the cage carved', "the ball's crater", 'the bowed wall', 'the chain port', 'rings and chains', 'balls on a rack', 'fire basket', 'goad and catch-pole', 'empty bowls', 'rags on a nail', 'the wall winch', "the jailers' lamp", 'a skull in its cage'],
    burning: ['fire basket', "the jailers' lamp"],
    heaps: ['the torn-out ring'],
    tiles: ['old straw', 'ball grooves', 'the oubliette', 'the smashed flags', 'his muzzle in the floor', 'a ring in the floor'],
    lying: ['a burst cuff', 'a snapped chain', 'a bowl kicked over', 'his pallet', 'a torn-out bar'],
    small: ['ball and chain'],
    things: ['the chain post', 'the feed trough', 'the anvil', 'a heap of chains', 'the stone bench'],
    big: ['the cage', 'the great winch'],
    breakables: ['straw bale', 'water jug', 'meal sack', 'box of irons'],
    chest: "the jailers' chest",
    fire: "the jailers' kettle",
    pillar: null,
    traps: { holes: 'the trip chain', plate: 'the mantrap', slot: 'the ball hatch' },
    moments: [{ at: 'wall', long: true, standIn: 'rings and chains' }, { at: 'floor', solid: true, standIn: 'a heap of chains' }, { at: 'wall', piece: 'the cell grate' }],
    unlaid: ["the Chained One's face-cage"],
  },
  {
    // 4, THE OSSUARY: the dead the miners broke into
    wall: ['bone-lined niche', 'shored rock', "the dead's arm", 'seam of ore', 'the charnel layer', "miner's lantern", 'pick in the wall', "the cult's candle", 'garland of skulls', "the miners' ladder", "the miners' tools", "the cult's daub", 'ribs on a spike'],
    burning: ["miner's lantern", "the cult's candle"],
    heaps: ["the miners' breach"],
    tiles: ['earth and bones', 'raked earth', 'bone-paved floor', 'the drag', 'spilled ore'],
    lying: ['broken ladder', 'drill steels', "a cultist's robe", 'snapped prop'],
    small: ['empty boots', 'rib cage', 'arm from a heap'],
    things: ['pyramid of skulls', 'timber crib', "the cult's altar"],
    big: ['the windlass', 'the boulder'],
    breakables: ['ore sack', 'heap of skulls', 'oil jug', 'ore tub'],
    chest: 'the reliquary',
    fire: null,
    pillar: 'the bone column',
    traps: { holes: 'bone spikes', plate: 'rotten boards', slot: 'jaw slot' },
    moments: [{ at: 'wall', piece: 'the skull wall' }, { at: 'thing', piece: 'the mine cart', rails: true }, { at: 'thing', piece: 'the charnel heap' }],
    unlaid: ['the eldest skull'],
  },
  {
    // 5, THE FLESHMANCER'S LAIR: dirt, the cult, the miners' gear left behind; its way out the mine shaft
    wall: ['the lagged wall', 'the drilled face', 'the priest in the stone', 'the shrine', 'the boarded adit', 'black glass', "the cult's banner", "a cultist's robe", 'the candle ledge', 'the daubed mark', 'bones on cords', "a miner's candle", 'rope and pulley', 'the hung kibble'],
    burning: ['the shrine', 'the candle ledge', "a miner's candle"],
    heaps: ['the cave-in'],
    tiles: ['the trodden way', "the rails' bend", 'the plank walk', "the cult's ring", "the cult's slab", 'spoil'],
    lying: [],
    small: ["a miner's bones", 'a dropped lantern', 'the spilled kibble', 'skulls given to him'],
    things: ['the sump pump', 'the effigy', 'the skull standard', 'the pile of props', 'the cart on its side'],
    big: [],
    breakables: ['powder keg', 'box of candles', 'offering jar', 'basket of ore'],
    chest: "the cult's coffer",
    fire: null,
    pillar: null,
    traps: { holes: 'the grasping earth', plate: 'the charge', slot: 'the shrieking skull' },
    moments: [{ at: 'floor', solid: true, standIn: 'the pile of props' }, { at: 'thing', piece: 'the winding drum' }, { at: 'thing', piece: 'the rift', two: true }],
    unlaid: ['his book'],
  },
];

/** The fifth floor's bone heaps, in its boss's hall: where the Fleshmancer raises his dead (game/bosses.ts, Floor.heaps). */
export const LAIR_HEAPS = ['the great bone heap', 'the long bone heap'] as const;

/** A piece set in a wall's face: the wall's tile, which face (0 turned to screen-left, 1 to screen-right), its name, which of its places. */
export interface WallPiece {
  i: number;
  side: 0 | 1;
  name: string;
  spot: number;
}
/** A floor tile laid with a piece: which, and which of its frames. */
export interface TilePiece {
  i: number;
  name: string;
  frame: number;
}
/**
 * WHERE ONE OF THE FLOOR'S MOMENTS PLAYS (its number, 0 to 2): on the floor at (x, y), the middle of its
 * tile (or, `two` along x, the edge between its two); or in the face of wall tile `i`, turned `side`.
 * `rails`: the cart's rails' end, six tiles on along x. `clears`: the tile that is walked on once it has
 * played (the cart's, run off down the rails).
 */
export interface MomentHost {
  n: number;
  x: number;
  y: number;
  i?: number;
  side?: 0 | 1;
  clears?: number;
}
/** What a floor of the first five is laid with, beyond its props (those are in Level.props). */
export interface Dress {
  /** Which floor's pieces (1 to 5). */
  floor: number;
  wall: WallPiece[];
  tiles: TilePiece[];
  moments: MomentHost[];
}

/** How many of a wall's faces have a piece, about (one in four). */
const WALL_SHARE = 0.26;
/** A burning piece is at least this many tiles from the next. */
const BURN_APART = 6;
/** Floor tiles laid with a piece, about: one in this many of a room's. */
const TILE_EVERY = 22;
/** Things that stand in a room: one for this many tiles of it, at most THINGS_MOST. */
const THING_EVERY = 38;
const THINGS_MOST = 3;
/** The moments' hosts are at least this far apart (tiles), and this far from where he comes in. */
const MOMENTS_APART = 14;

/** Is a floor tile plain: floor, not cut, no stair, at the floor's own height? */
function plainAt(f: Floor, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= f.w || y >= f.h) return false;
  const i = y * f.w + x;
  return f.tiles[i] === T_FLOOR && !(f.cut && f.cut[i] !== 0) && !(f.stair && f.stair[i] !== 0) && !(f.height && f.height[i] !== 0);
}
const floorish = (f: Floor, x: number, y: number): boolean => x >= 0 && y >= 0 && x < f.w && y < f.h && (f.tiles[y * f.w + x] === T_FLOOR || f.tiles[y * f.w + x] === T_PIT);

/**
 * THE WALL FACES THAT ARE DRAWN in the game's look (render/walls.ts: a wall is its faces alone, 40 pixels
 * high and the top 12 fading; one whose solid part would hide floor behind it is left out). Of wall tile
 * i: 1 its face turned to screen-left (floor before it at y + 1), 2 the one to screen-right (floor at
 * x + 1); 0 none, or left out. (Held to render/walls.ts by tests/first5_floors.test.ts.)
 */
export function drawnFaces(f: Floor, i: number): number {
  if (f.tiles[i] !== T_WALL) return 0;
  const x = i % f.w;
  const y = (i - x) / f.w;
  // (left out: floor where its solid part would stand over it)
  for (const [a, b] of [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]]) if (floorish(f, x - a, y - b)) return 0;
  let out = 0;
  if (plainAt(f, x, y + 1)) out += 1;
  if (plainAt(f, x + 1, y)) out += 2;
  return out;
}

/**
 * LAY A FLOOR OF THE FIRST FIVE WITH ITS PIECES: the last step of making it (game/level.ts), by dice of its
 * own (`seed`). Changes only what the floor holds: its props (more of them), what cannot be walked on
 * where something now stands, and the dressing itself (Level.dress). Nothing on a floor past the fifth.
 */
export function dress(L: Level, depth: number, seed: number): Dress | null {
  if (!FIRST5.on || depth < 1 || depth > 5) return null;
  const set = FLOOR_SETS[depth - 1];
  const f = L.floor;
  const W = f.w;
  const rng = new RNG((Math.imul(seed, 2654435761) ^ 0x5eed5) >>> 0);
  const out: Dress = { floor: depth, wall: [], tiles: [], moments: [] };
  // WHAT IS KEPT CLEAR: the way in and the waypoint, the stairwell's places (its film begins with the
  // floor as it is), the shaft, the traps, the levers, where the packs and the boss stand, before every door.
  const keep = new Uint8Array(W * f.h);
  const clear = (cx: number, cy: number, r: number): void => {
    for (let y = Math.floor(cy - r); y <= Math.floor(cy + r); y++) for (let x = Math.floor(cx - r); x <= Math.floor(cx + r); x++) if (x >= 0 && y >= 0 && x < W && y < f.h) keep[y * W + x] = 1;
  };
  clear(f.start.x, f.start.y, 3);
  clear(f.boss.x, f.boss.y, 4);
  const ways = L.ways;
  if (ways?.way) clear(ways.way.x, ways.way.y, 2.5);
  for (const s of ways?.stairs ?? []) for (let y = s.y - 2; y <= s.y + 3; y++) for (let x = s.x - 2; x <= s.x + 4; x++) if (x >= 0 && y >= 0 && x < W && y < f.h) keep[y * W + x] = 1;
  if (ways?.shaft) clear(ways.shaft.x + 0.5, ways.shaft.y + 0.5, 2.5);
  for (const z of L.hazards) {
    const s = z.spot;
    for (let y = s.y - 1; y <= s.y + s.h; y++) for (let x = s.x - 1; x <= s.x + s.w; x++) if (x >= 0 && y >= 0 && x < W && y < f.h) keep[y * W + x] = 1;
    if (s.slot) clear(s.slot.x + 0.5, s.slot.y + 0.5, 1.5);
  }
  for (const l of f.levers ?? []) clear(l.x + 0.5, l.y + 0.5, 1.5);
  for (const p of f.packs) clear(p.x, p.y, 1.5);
  for (const d of L.doors) {
    for (let y = 0; y < f.h; y++) for (let x = 0; x < W; x++) if (keep[y * W + x] === 0 && beforeGate(d.spot, x, y)) keep[y * W + x] = 1;
    // (the doorway itself and the walls either side of it)
    const a = d.spot.a;
    const plane = d.spot.plane;
    for (let k = -2; k <= 4; k++) for (const p of [plane - 2, plane - 1, plane, plane + 1]) {
      const x = d.spot.alongX ? a + k : p;
      const y = d.spot.alongX ? p : a + k;
      if (x >= 0 && y >= 0 && x < W && y < f.h) keep[y * W + x] = 1;
    }
  }
  /** Where something stands now (the game's props, and what is laid here): solid or not. */
  const taken = new Uint8Array(W * f.h);
  const solid = new Uint8Array(W * f.h);
  for (const p of L.props) {
    taken[p.ty * W + p.tx] = 1;
    if (p.solid) solid[p.ty * W + p.tx] = 1;
  }
  const boss = f.rooms.find((r) => r.kind === 'boss');
  const inRoom = (r: Room, x: number, y: number): boolean => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
  /** A free tile in a room's inside (a tile off its edges): plain floor, nothing there, not kept clear; `ring`: its eight neighbours too, and none of them solid. */
  const freeAt = (x: number, y: number, ring: boolean): boolean => {
    if (!plainAt(f, x, y) || keep[y * W + x] || taken[y * W + x] || L.walk[y * W + x] !== 1) return false;
    // (its four sides plain floor: nothing stands by a ledge, a flight of stairs or a pit, where the ways round it are the heights' own)
    if (!plainAt(f, x - 1, y) || !plainAt(f, x + 1, y) || !plainAt(f, x, y - 1) || !plainAt(f, x, y + 1)) return false;
    if (cuts(x, y)) return false;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const j = (y + dy) * W + x + dx;
        if (solid[j]) return false;
        if (ring && (!plainAt(f, x + dx, y + dy) || keep[j] || L.walk[j] !== 1)) return false;
      }
    }
    return true;
  };
  /**
   * Would a solid thing on (x, y) cut the floor round it in two? Its eight neighbours that are walked on,
   * gone round in order, make more than one run (a body goes round a corner, never between two corners).
   */
  const cuts = (x: number, y: number): boolean => {
    const ring: [number, number][] = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
    // (walked on at the floor's own height: a terrace beside it is reached by its own ways, if at all)
    const on = ring.map(([dx, dy]) => L.walk[(y + dy) * W + x + dx] === 1 && plainAt(f, x + dx, y + dy));
    // (a corner counts only joined to one of its two sides along the ring: alone it is reached from beyond, or not at all)
    const edge = (k: number): boolean => on[k];
    let runs = 0;
    for (let k = 0; k < 8; k++) {
      const here = k % 2 === 0 ? edge(k) : on[k] && (edge((k + 7) % 8) || edge((k + 1) % 8));
      const prevK = (k + 7) % 8;
      const prev = prevK % 2 === 0 ? edge(prevK) : on[prevK] && (edge((prevK + 7) % 8) || edge((prevK + 1) % 8));
      if (here && !prev) runs++;
    }
    return runs > 1;
  };
  const props: PropInst[] = [];
  const put = (name: string, x: number, y: number, isSolid: boolean, variant = 0): PropInst => {
    const p: PropInst = { kind: 'piece', name, tx: x, ty: y, x: x + 0.5, y: y + 0.5, solid: isSolid, state: 0, variant };
    props.push(p);
    taken[y * W + x] = 1;
    if (isSolid) {
      solid[y * W + x] = 1;
      L.walk[y * W + x] = 0;
    }
    return p;
  };
  /** The tiles of a room's inside where a thing may stand, shuffled. */
  const spotsIn = (r: Room, ring: boolean): [number, number][] => {
    const list: [number, number][] = [];
    for (let y = r.y + 1; y < r.y + r.h - 1; y++) for (let x = r.x + 1; x < r.x + r.w - 1; x++) if (freeAt(x, y, ring)) list.push([x, y]);
    return rng.shuffle(list);
  };
  const rooms = f.rooms.filter((r) => r.kind !== 'boss');

  // ---- THE MOMENTS' HOSTS (first, while there is room): in rooms apart, away from where he comes in
  const used: { x: number; y: number }[] = [{ x: f.start.x, y: f.start.y }];
  const farFromUsed = (x: number, y: number, by: number): boolean => used.every((u) => Math.hypot(u.x - x, u.y - y) >= by);
  const wallFaces = (r: Room | null): { i: number; side: 0 | 1; x: number; y: number }[] => {
    const list: { i: number; side: 0 | 1; x: number; y: number }[] = [];
    for (let i = 0; i < W * f.h; i++) {
      const faces = drawnFaces(f, i);
      if (!faces) continue;
      const x = i % W;
      const y = (i - x) / W;
      for (const side of [0, 1] as const) {
        if (!(faces & (side === 0 ? 1 : 2))) continue;
        // (the floor before the face)
        const fx = side === 0 ? x : x + 1;
        const fy = side === 0 ? y + 1 : y;
        if (keep[fy * W + fx] || (r && !inRoom(r, fx, fy))) continue;
        list.push({ i, side, x: fx + 0.5, y: fy + 0.5 });
      }
    }
    return list;
  };
  const wallTaken = new Map<number, string>();
  const keyOf = (i: number, side: number): number => i * 2 + side;
  set.moments.forEach((site, n) => {
    for (let tries = 0; tries < 2; tries++) {
      const by = tries === 0 ? MOMENTS_APART : MOMENTS_APART / 2;
      if (site.at === 'wall') {
        const faces = rng.shuffle(wallFaces(null)).filter((w) => farFromUsed(w.x, w.y, by) && rooms.some((r) => inRoom(r, Math.floor(w.x), Math.floor(w.y))));
        const ok = faces.find((w) => {
          if (wallTaken.has(keyOf(w.i, w.side))) return false;
          // (the floor two tiles out before it clear; and for the chains, the wall a tile on either side along it a face too)
          const ox = w.side === 0 ? 0 : 1;
          const oy = w.side === 0 ? 1 : 0;
          for (let k = 1; k <= 2; k++) {
            const tx = Math.floor(w.x) + ox * (k - 1);
            const ty = Math.floor(w.y) + oy * (k - 1);
            if (!plainAt(f, tx, ty) || solid[ty * W + tx] || keep[ty * W + tx]) return false;
          }
          if (site.long) {
            const along = w.side === 0 ? 1 : W;
            for (const j of [w.i - along, w.i + along]) if (!(drawnFaces(f, j) & (w.side === 0 ? 1 : 2)) || wallTaken.has(keyOf(j, w.side))) return false;
          }
          return true;
        });
        if (!ok) continue;
        if (site.piece) out.wall.push({ i: ok.i, side: ok.side, name: site.piece, spot: 0 });
        wallTaken.set(keyOf(ok.i, ok.side), site.piece ?? `moment ${n}`);
        if (site.long) {
          const along = ok.side === 0 ? 1 : W;
          for (const j of [ok.i - along, ok.i + along]) wallTaken.set(keyOf(j, ok.side), `moment ${n}`);
        }
        out.moments.push({ n, x: ok.x, y: ok.y, i: ok.i, side: ok.side });
        // (the floor before it kept clear: what plays there is seen)
        clear(ok.x, ok.y, 1.5);
        used.push({ x: ok.x, y: ok.y });
        return;
      }
      // on the floor: a room's tile, its ring clear (the cart: along x, its rails and the rails' end)
      for (const r of rng.shuffle([...rooms])) {
        const spot = spotsIn(r, true).find(([x, y]) => {
          if (!farFromUsed(x + 0.5, y + 0.5, by)) return false;
          if (site.two && !freeAt(x + 1, y, true)) return false;
          if (site.rails) {
            for (let k = 1; k <= 6; k++) if (!plainAt(f, x + k, y) || keep[y * W + x + k] || taken[y * W + x + k] || solid[y * W + x + k] || L.walk[y * W + x + k] !== 1 || !inRoom(r, x + k, y)) return false;
            if (!freeAt(x + 6, y, false)) return false;
          }
          return true;
        });
        if (!spot) continue;
        const [x, y] = spot;
        const host: MomentHost = { n, x: x + (site.two ? 1 : 0.5), y: y + 0.5 };
        if (site.at === 'thing' && site.piece) put(site.piece, x, y, true);
        else if (site.solid) {
          // (a heap the film holds: it stands; nothing of the floor's own pictures stands there)
          taken[y * W + x] = 1;
          solid[y * W + x] = 1;
          L.walk[y * W + x] = 0;
        }
        if (site.two) {
          taken[y * W + x + 1] = 1;
          solid[y * W + x + 1] = 1;
          L.walk[y * W + x + 1] = 0;
        }
        if (site.rails) {
          for (let k = 1; k <= 5; k++) {
            out.tiles.push({ i: y * W + x + k, name: 'the rails', frame: 0 });
            taken[y * W + x + k] = 1;
            keep[y * W + x + k] = 1;
          }
          put("the rails' end", x + 6, y, true);
          // (the cart runs off down its rails: its tile is walked on once it has)
          host.clears = y * W + x;
        }
        clear(x + 0.5, y + 0.5, 1.5);
        out.moments.push(host);
        used.push({ x: host.x, y: host.y });
        return;
      }
    }
  });

  // ---- THE FIFTH FLOOR'S BONE HEAPS, in his hall: where he raises his dead
  if (depth === 5 && boss) {
    const heaps: { x: number; y: number }[] = [];
    const sh = ways?.shaft;
    for (const name of LAIR_HEAPS) {
      const spot = spotsIn(boss, true).find(([x, y]) => Math.hypot(x + 0.5 - f.boss.x, y + 0.5 - f.boss.y) >= 4 && (!sh || Math.hypot(x - sh.x, y - sh.y) >= 4) && heaps.every((h) => Math.hypot(h.x - x - 0.5, h.y - y - 0.5) >= 4));
      if (!spot) continue;
      put(name, spot[0], spot[1], true);
      heaps.push({ x: spot[0] + 0.5, y: spot[1] + 0.5 });
    }
    if (heaps.length) f.heaps = heaps;
  }

  // ---- THE ROOMS' THINGS: big ones first, then the rest; each of the floor's before any is laid twice
  const bag = (names: readonly string[]): (() => string | null) => {
    let left: string[] = [];
    return () => {
      if (names.length === 0) return null;
      if (left.length === 0) left = rng.shuffle([...names]);
      return left.pop() ?? null;
    };
  };
  const nextBig = bag(set.big);
  const nextThing = bag(set.things);
  const nextSmall = bag(set.small);
  for (const r of rng.shuffle([...rooms])) {
    const area = r.w * r.h;
    let n = Math.min(THINGS_MOST, Math.floor(area / THING_EVERY));
    if (r.kind === 'start') n = Math.min(n, 1);
    for (let k = 0; k < n; k++) {
      const big = set.big.length > 0 && k === 0 && area >= 60 && rng.chance(0.6);
      const name = big ? nextBig() : nextThing();
      if (!name) continue;
      const spot = spotsIn(r, big)[0];
      if (!spot) break;
      put(name, spot[0], spot[1], true);
      if (big) clear(spot[0] + 0.5, spot[1] + 0.5, 1.5);
    }
    // (and a small thing or two that stands about, walked past)
    const small = Math.min(2, Math.floor(area / 30));
    for (let k = 0; k < small; k++) {
      const name = nextSmall();
      if (!name) break;
      // (against a wall, out of the way)
      const spot = spotsIn(r, false).find(([x, y]) => !plainAt(f, x - 1, y) || !plainAt(f, x, y - 1) || !plainAt(f, x + 1, y) || !plainAt(f, x, y + 1));
      if (!spot) break;
      put(name, spot[0], spot[1], false, rng.int(0, 3));
    }
  }

  // ---- THE FLOOR'S TILES: here and there in the rooms; never two the same side by side
  const nextTile = bag(set.tiles);
  const tileAt = new Map<number, string>();
  for (const t of out.tiles) tileAt.set(t.i, t.name);
  for (const r of rooms) {
    const n = Math.floor((r.w * r.h) / TILE_EVERY);
    const spots = spotsIn(r, false);
    for (let k = 0; k < n && k < spots.length; k++) {
      const [x, y] = spots[k];
      const i = y * W + x;
      const name = nextTile();
      if (!name || tileAt.has(i)) continue;
      if ([i - 1, i + 1, i - W, i + W].some((j) => tileAt.get(j) === name)) continue;
      out.tiles.push({ i, name, frame: 0 });
      tileAt.set(i, name);
    }
  }
  // (the king's runner, down the middle of a big room along x or y, its end fringed)
  if (set.runner) {
    for (const r of rng.shuffle([...rooms])) {
      if (r.w * r.h < 64) continue;
      const alongX = r.w >= r.h;
      const len = Math.min(6, (alongX ? r.w : r.h) - 3);
      const x0 = alongX ? r.x + 1 : r.x + Math.floor(r.w / 2);
      const y0 = alongX ? r.y + Math.floor(r.h / 2) : r.y + 1;
      const tiles: number[] = [];
      for (let k = 0; k < len; k++) {
        const x = alongX ? x0 + k : x0;
        const y = alongX ? y0 : y0 + k;
        if (!plainAt(f, x, y) || keep[y * W + x] || taken[y * W + x] || tileAt.has(y * W + x)) break;
        tiles.push(y * W + x);
      }
      if (tiles.length < 3) continue;
      tiles.forEach((i, k) => {
        const end = k === tiles.length - 1;
        out.tiles.push({ i, name: set.runner!, frame: (alongX ? 0 : 3) + (end ? 2 : k % 2) });
        tileAt.set(i, set.runner!);
      });
      break;
    }
  }

  // ---- THE WALLS: about one face in four, never the same piece on two neighbouring tiles; those that burn apart
  const faces = wallFaces(null);
  const burning: { x: number; y: number }[] = [];
  const nextWall = bag(set.wall.filter((n) => !set.burning.includes(n)));
  const nextBurn = bag(set.burning);
  let heaps = 0;
  for (const w of rng.shuffle(faces)) {
    const key = keyOf(w.i, w.side);
    if (wallTaken.has(key) || !rng.chance(WALL_SHARE)) continue;
    const along = w.side === 0 ? 1 : W;
    const near = [wallTaken.get(keyOf(w.i - along, w.side)), wallTaken.get(keyOf(w.i + along, w.side))];
    // (a heap of its own: once or twice a floor, where its floor tile is free and the tile beyond it too, in a room)
    const fx = Math.floor(w.x);
    const fy = Math.floor(w.y);
    if (heaps < 2 && set.heaps.length && rng.chance(0.25) && rooms.some((r) => inRoom(r, fx, fy)) && freeAt(fx, fy, true)) {
      const name = set.heaps[heaps % set.heaps.length];
      out.wall.push({ i: w.i, side: w.side, name, spot: 0 });
      wallTaken.set(key, name);
      // (its heap stands on the floor before it: nobody walks through it)
      taken[fy * W + fx] = 1;
      solid[fy * W + fx] = 1;
      L.walk[fy * W + fx] = 0;
      heaps++;
      continue;
    }
    const burns = set.burning.length > 0 && rng.chance(0.3) && burning.every((b) => Math.hypot(b.x - w.x, b.y - w.y) >= BURN_APART);
    let name = burns ? nextBurn() : nextWall();
    if (name && near.includes(name)) name = nextWall();
    if (!name || near.includes(name)) continue;
    if (set.burning.includes(name)) burning.push({ x: w.x, y: w.y });
    out.wall.push({ i: w.i, side: w.side, name, spot: rng.int(0, 2) });
    wallTaken.set(key, name);
  }

  L.props.push(...props);
  return out;
}
