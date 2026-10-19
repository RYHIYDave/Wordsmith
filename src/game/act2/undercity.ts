// ACT 2, THE HUSH: FLOOR 12, THE UNDERCITY: ITS MAP-MAKER AND ITS DRESSER (game/act2_layout.ts asks it for the floor,
// game/act2_dress.ts for its dressing; behind ACT2, game/act1.ts, off until his yes).
//
// His doc ("Wordsmith Act 2: The Hush"), level 12: "Down the drains to find where the Hush comes from." Its layout: "brick
// tunnels between cisterns, sluice gates, and the river's outflow under the walls. Tunnels and chambers, like the Prison's
// corridors and rooms." Its hazards: "sluices that open and flood a tunnel, and slick floors." Its enemies: "the Hushed, the
// Silent Order, and things that live in the sewers." Its story: "this is how the cult got in during the siege. The Silent
// Order's tunnels lead to shelves of corked jars, whispering: bottled voices." Its boss the Rat King, its floor "The King's
// Cistern". To the planning chat, 19 Oct 2026, 11:01 Pacific: "Get levels 11-15 into the game". And as long as the descent's
// floors, made longer at his word of 17 Oct, 11:37: "The levels are very short in 6-7 so far".
//
// The art is the art chat's, made on his word to it of 18 Oct, 21:24 Pacific (“Hey go without my say so.  If something is
// shit I’ll get it to it but you’re doing a great jobs. At least for 11-15”): its ground art/undercity.ts (undercityLook: what
// each walkable tile is, UC_ZONE, and which tiles that are not floor are water), its 25 pieces art/floor12.ts, the Hush's 25
// art/act2_set.ts, its moment art/floor12_moments.ts, all of it in docs/mockups/act2_undercity/README.md; and its stretch of
// the sewers laid by hand, src/dev/preview_undercity.ts, the model followed here: a long tunnel, a channel of water down its
// middle between two walkways, an iron grate and the Order's planks across it, a narrower tunnel up out of it, a cistern
// round a pool, the Order's tunnel dug down to a store.
//
// HOW IT IS LAID (the planning chat's helper's, for his yes with the pictures). The Prison's rooms and corridors, as the
// sewers have them: CHAMBERS joined by TUNNELS, every tunnel straight along x or along y (brickwork), turning now and then
// at a corner. The chambers stand on a lattice of six by six places, a tunnel between two places side by side; the lattice's
// columns and rows set apart by what stands in them, so that nothing meets but what is joined. THE MAIN WAY winds across it,
// ten or eleven places from the river's outflow, where he comes in, to the King's Cistern and the way on beyond it; off it
// the Muffled Bell's cistern, a lair, a side chamber of the bottled voices, the Silent Order's store at the end of its own
// dug tunnel, now and then a way round.
//   THE TUNNELS, in the preview's cross-sections: a sewer's (walkway 2, channel 2, walkway 3: seven across), a narrower one's
//     (2, 1, 1), a dry brick tunnel's (3) and the Order's dug tunnel (2, packed earth). The walkway of two is always on the
//     far side (toward lesser x or y, up the screen), the walkway of three toward the eye, so its wall is the one seen.
//     Over a channel, every dozen tiles or so, a crossing: an iron grate or the Order's planks.
//   THE CHAMBERS: the landing at the outflow (the river's water running in under the walls to a pool at its back); small
//     vaulted chambers where the tunnels meet; cisterns, brick-paved round a pool; the King's Cistern, wide and paved for the
//     Rat King's Roll (about 6.45 tiles a second, the art's ROLL_PACE: long straight runs across it) and his Unknot (the swarm
//     across the floor and the knot again somewhere else), its one pool in a corner; the landing beyond it, the way on.
//   THE WATER is never walked on: not floor (a pit to the rules: what flies and what is shot goes over it, as the Fen's water).
//
// THE BELLS (game/bells.ts, the planning chat's; its contract in docs/act2_build.md): the Muffled Bell is the diver's bell the
// Order dragged into a cistern off the main way; the bells to ring, alarm bells at the sluice gates in the tunnels and at the
// tunnels' mouths round it, each with the sluice gate it is at; the Hush's circle round the Muffled Bell holding them all.
//
// WHAT IT GIVES: a Floor as the rest of the game knows one and a Land (game/act1_layout.ts; game/act2_types.ts), by the floor's
// own dice: the same depth and seed give the same floor, here and in the painter's worker. Then, by dice of its own, the
// dressing (`dress`): its pieces, its Bells' pieces, its two traps, its lights.

import { RNG } from '../../engine/rng';
import { act1Pack } from '../act1_mobs';
import type { Act1Dress, Act1Trap } from '../act1_dress';
import { reach } from '../act1_layout';
import type { AreaRole, Laid, Land, Lane } from '../act1_layout';
import type { BellsPlan } from '../act2_types';
import type { Level, PropInst } from '../state';
import { makeHazards } from '../traps';
import { T_FLOOR, T_PIT, T_WALL } from '../types';
import type { Floor, HazardSpot, PackSpot, PropSpot, Room, RoomKind } from '../types';

/** Whether this map-maker lays the floor (false: the descent's stands in). */
export const BUILT = true;

/** What a walkable tile is: the art's UC_ZONE (art/undercity.ts), its numbers (tests/act2_undercity.test.ts holds them to the art's). */
export const ZONE = { Walk: 0, Cistern: 1, Grate: 2, Planks: 3, Dug: 4 } as const;

/** THE BELLS ON THIS FLOOR, by the contract's names (docs/act2_build.md; the art's pieces, art/floor12.ts). */
export const MUFFLED_BELL = "the diver's bell (the Muffled Bell)";
export const SMALL_BELL = 'an alarm bell at a sluice';
/** Its two traps (the art's, art/floor12.ts), laid as the descent's are, a spike floor's beat (game/traps.ts). */
export const FLOOD = 'the flood, a sluice bursting';
export const SLICK = 'a slick of slime';
/** The quest's piece, as dressing in the King's nest (his doc: the Crier's voice, the first the Order took). */
export const CRIERS_JAR = "the jar of the Crier's voice";

// ---------------------------------------------------------------------------------------------------
// THE SHAPES

/** A rectangle of tiles: x0, y0, x1, y1 (x1 and y1 not in it). */
type Rect = [number, number, number, number];
const inRect = (r: Rect, x: number, y: number): boolean => x >= r[0] && x < r[2] && y >= r[1] && y < r[3];
/** How far world (x, y) is from a rectangle of tiles (0 inside it). */
const rectDist = (r: Rect, x: number, y: number): number => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - y, 0, y - r[3]));

/** What stands at a place of the lattice: a chamber of some kind, or a tunnel's corner, or a tunnel going straight through. */
type NodeKind = 'start' | 'vault' | 'cistern' | 'boss' | 'exit' | 'muffled' | 'lair' | 'treasure' | 'store' | 'side' | 'corner' | 'through';
const OPEN_KINDS: readonly NodeKind[] = ['corner', 'through'];

interface UNode {
  i: number;
  j: number;
  kind: NodeKind;
  /** Its place along the main way (0 where he comes in), or -1 off it. */
  path: number;
  /** Its middle line (the tunnels to it run along it): world tiles. */
  X: number;
  Y: number;
  /** Its chamber (none at a corner or a tunnel going through), and the pool in it. */
  w: number;
  h: number;
  rect: Rect | null;
  pool: Rect | null;
  /** Its Room on the Floor (-1: none). */
  room: number;
}

/** A tunnel's kind: its cross-section (offsets from its middle line, the far side negative), its channel's, its floor's zone. */
type TunnelKind = 'main' | 'narrow' | 'dry' | 'dug';
const PROFILE: Readonly<Record<TunnelKind, { lo: number; hi: number; ch: readonly [number, number] | null; zone: number }>> = {
  // (the preview's long tunnel: a walkway of two, the channel of two, a walkway of three)
  main: { lo: -3, hi: 3, ch: [-1, 0], zone: ZONE.Walk },
  // (its narrower tunnel up out of it: a walkway of two, a channel of one, a walkway of one)
  narrow: { lo: -2, hi: 1, ch: [0, 0], zone: ZONE.Walk },
  dry: { lo: -1, hi: 1, ch: null, zone: ZONE.Walk },
  // (the Order's own, dug raw: two across, "a way through rather than a room", the art's dugNarrow)
  dug: { lo: -1, hi: 0, ch: null, zone: ZONE.Dug },
};

/** A straight run of a tunnel: along x (its middle line a row, `line`) or along y; from its end `a` to `b` (node middles, along it); whether each end is a corner. */
interface Seg {
  alongX: boolean;
  line: number;
  a: number;
  b: number;
  cornerA: boolean;
  cornerB: boolean;
}
interface Tunnel {
  /** The lattice's places it runs through, a chamber at each end. */
  nodes: number[];
  kind: TunnelKind;
  /** On the main way. */
  main: boolean;
  segs: Seg[];
}
/** The open stretch of a run (out of the chambers and clear of its corners): from `s0` to `s1`, along it. */
interface Stretch {
  t: number;
  seg: Seg;
  s0: number;
  s1: number;
}
/** A crossing over a channel: its run, where along it (two tiles: s and s + 1), a grate or the Order's planks. */
interface Crossing {
  seg: Seg;
  s: number;
  zone: number;
}
/**
 * A SLUICE GATE across a walkway of two (the art's "across a tunnel (a way through)": its two piers at the walkway's
 * edges), hauled up open or let down shut; and the place by it where an alarm bell may stand (three by three of walkway).
 */
interface Sluice {
  /** Its picture's point (world: the middle of the walkway it stands across), the tile it is laid on, its frame (the art's: shut and open along +y, shut and open along +x). */
  x: number;
  y: number;
  tx: number;
  ty: number;
  frame: number;
  /** The walkway's tiles under it (shut, nothing goes by). */
  under: number[];
  /** Where a bell stands at it. */
  bx: number;
  by: number;
  /** On which tunnel, and where along which run (for the dresser). */
  t: number;
  mouth: boolean;
}

/** All of a laying the dresser needs (the Land carries only what the painter and the rules ask for). */
interface UPlan {
  nodes: UNode[];
  tunnels: Tunnel[];
  stretches: Stretch[];
  crossings: Crossing[];
  /** Every sluice the floor has a place for; `bells` those the Bells stand at. */
  sluices: Sluice[];
  bellAt: number[];
  /** The Muffled Bell's cistern. */
  muffled: number;
  /** Before each tunnel's mouth, the chamber's floor three deep (nothing stands there). */
  mouths: Rect[];
  outX: boolean;
}

/** What `generate` laid, kept for `dress` (the same Land object, in the same thread: game/act1_level.ts); laid again from its seed where it is not. */
const PLANS = new WeakMap<Land, UPlan>();

// ---------------------------------------------------------------------------------------------------
// THE LATTICE

const GX = 6;
const GY = 6;
/** Wall round the floor's edge (tiles). */
const MARGIN = 8;
const DIRS: readonly [number, number][] = [[1, 0], [0, 1], [-1, 0], [0, -1]];

/** A chamber's size by its kind (tiles), by the dice. */
function sizeOf(rng: RNG, k: NodeKind, outX: boolean): [number, number] {
  const r = (a: number, b: number): number => rng.int(a, b);
  switch (k) {
    case 'start':
      return outX ? [12, 11] : [11, 12];
    case 'vault':
      return [r(9, 12), r(9, 12)];
    case 'cistern':
      return [r(14, 17), r(14, 17)];
    case 'muffled':
      return [r(15, 17), r(15, 17)];
    // (THE KING'S CISTERN: wide and paved, for the Roll's long runs and the Unknot's swarm across the floor; the heap near three tiles across)
    case 'boss':
      return rng.chance(0.5) ? [26, 22] : [22, 26];
    case 'exit':
      return [7, 7];
    case 'lair':
      return [r(10, 12), r(10, 12)];
    case 'treasure':
      return [r(9, 10), r(9, 10)];
    case 'store':
      return [r(9, 11), r(9, 11)];
    case 'side':
      return [r(9, 11), r(9, 11)];
    default:
      return [0, 0];
  }
}
/** How far a place's chamber (or its tunnels' corner) reaches from its middle line: left, right, up, down (tiles, to its last tile). */
function extentOf(n: UNode | undefined): [number, number, number, number] {
  if (!n) return [0, 0, 0, 0];
  if (!n.w) return [3, 3, 3, 3];
  const l = Math.floor((n.w - 1) / 2);
  const u = Math.floor((n.h - 1) / 2);
  return [l, n.w - 1 - l, u, n.h - 1 - u];
}

// ---------------------------------------------------------------------------------------------------
// LAY THE FLOOR

/** Lay floor 12, or null (not laid this time: the dice are rolled again, game/act2_layout.ts). */
export function generate(depth: number, seed: number): Laid | null {
  const out = lay(depth, seed);
  if (!out) return null;
  PLANS.set(out.laid.land, out.plan);
  return out.laid;
}

function lay(depth: number, seed: number): { laid: Laid; plan: UPlan } | null {
  const rng = new RNG((seed ^ 0x2c1b3c6d) >>> 0);
  const key = (i: number, j: number): number => j * GX + i;
  const at = new Map<number, number>();
  const nodes: UNode[] = [];
  const mk = (i: number, j: number, kind: NodeKind, path: number): number => {
    nodes.push({ i, j, kind, path, X: 0, Y: 0, w: 0, h: 0, rect: null, pool: null, room: -1 });
    at.set(key(i, j), nodes.length - 1);
    return nodes.length - 1;
  };
  const free = (i: number, j: number): boolean => i >= 0 && j >= 0 && i < GX && j < GY && !at.has(key(i, j));

  // ---- THE MAIN WAY: from the outflow (on the floor's far side, up the screen: lesser x, or lesser y) across the lattice
  const outX = rng.chance(0.5);
  const fwd: [number, number] = outX ? [1, 0] : [0, 1];
  const LEN = rng.int(10, 11);
  let ci = outX ? 0 : rng.int(1, GX - 2);
  let cj = outX ? rng.int(1, GY - 2) : 0;
  const walk: [number, number][] = [[ci, cj]];
  const seen = new Set<number>([key(ci, cj)]);
  while (walk.length < LEN) {
    const opts: { i: number; j: number; w: number }[] = [];
    for (const [dx, dy] of DIRS) {
      const ni = ci + dx;
      const nj = cj + dy;
      if (ni < 0 || nj < 0 || ni >= GX || nj >= GY || seen.has(key(ni, nj))) continue;
      opts.push({ i: ni, j: nj, w: dx === fwd[0] && dy === fwd[1] ? 3 : dx === -fwd[0] && dy === -fwd[1] ? 0.4 : 1.5 });
    }
    if (!opts.length) return null;
    const o = rng.weighted(opts, (q) => q.w);
    ci = o.i;
    cj = o.j;
    seen.add(key(ci, cj));
    walk.push([ci, cj]);
  }
  // (the King's Cistern far from where he comes in)
  if (Math.abs(walk[LEN - 2][0] - walk[0][0]) + Math.abs(walk[LEN - 2][1] - walk[0][1]) < 4) return null;
  // what stands at each place of it: a chamber, or now and then a tunnel's corner or a tunnel going straight on
  const kinds: NodeKind[] = walk.map(() => 'vault');
  kinds[0] = 'start';
  kinds[LEN - 2] = 'boss';
  kinds[LEN - 1] = 'exit';
  for (let k = 1; k <= LEN - 3; k++) {
    const din = [walk[k][0] - walk[k - 1][0], walk[k][1] - walk[k - 1][1]];
    const dout = [walk[k + 1][0] - walk[k][0], walk[k + 1][1] - walk[k][1]];
    const turn = din[0] !== dout[0] || din[1] !== dout[1];
    const prevOpen = OPEN_KINDS.includes(kinds[k - 1]);
    if (k >= 2 && k <= LEN - 4 && !prevOpen && turn && rng.chance(0.3)) kinds[k] = 'corner';
    else if (k >= 2 && k <= LEN - 4 && !prevOpen && !turn && rng.chance(0.2)) kinds[k] = 'through';
    else kinds[k] = rng.chance(0.35) ? 'cistern' : 'vault';
  }
  if (kinds.slice(1, LEN - 2).filter((q) => !OPEN_KINDS.includes(q)).length < 5) return null;
  walk.forEach(([i, j], k) => mk(i, j, kinds[k], k === LEN - 1 ? -1 : k));
  const isPathChamber = (n: number): boolean => nodes[n].path >= 1 && (nodes[n].kind === 'vault' || nodes[n].kind === 'cistern');
  const freeNbrs = (n: number): [number, number][] => DIRS.map(([dx, dy]): [number, number] => [nodes[n].i + dx, nodes[n].j + dy]).filter(([i, j]) => free(i, j));

  // ---- THE TUNNELS OF THE MAIN WAY (between one chamber and the next, through what corners and straight runs lie between)
  const tunnels: Tunnel[] = [];
  const pathTunnels: number[][] = [];
  for (let k = 0; k < LEN - 1; ) {
    const chain = [k];
    let m = k + 1;
    while (OPEN_KINDS.includes(nodes[m].kind)) chain.push(m++);
    chain.push(m);
    pathTunnels.push(chain);
    k = m;
  }

  // ---- THE HUSH'S HOST: a chamber of the main way, well along it and short of the King, with the Muffled Bell's cistern off it
  const hosts = nodes.map((_n, i) => i).filter((n) => isPathChamber(n) && nodes[n].path >= 3 && nodes[n].path <= LEN - 4 && freeNbrs(n).length > 0);
  if (!hosts.length) return null;
  const P = rng.pick(hosts);
  const M = mk(...rng.pick(freeNbrs(P)), 'muffled', -1);
  const branch: { nodes: number[]; kind: TunnelKind }[] = [{ nodes: [P, M], kind: 'main' }];
  // (and from it, a way round to the main way again, or on to a chamber of its own: more tunnels round the bell, for its bells)
  const loopTo = DIRS.map(([dx, dy]) => at.get(key(nodes[M].i + dx, nodes[M].j + dy))).find((q) => q !== undefined && q !== P && isPathChamber(q) && nodes[q].path <= LEN - 3);
  if (loopTo !== undefined && rng.chance(0.7)) branch.push({ nodes: [M, loopTo], kind: 'main' });
  else if (freeNbrs(M).length) branch.push({ nodes: [M, mk(...rng.pick(freeNbrs(M)), 'side', -1)], kind: 'main' });
  // (and, where the lattice has the room, one more sewer out of it to a chamber of its own: the bells spread round it, not far)
  if (freeNbrs(M).length > 1 || (freeNbrs(M).length === 1 && rng.chance(0.5))) branch.push({ nodes: [M, mk(...rng.pick(freeNbrs(M)), 'side', -1)], kind: 'main' });
  // ---- THE LAIR, THE SIDE CHAMBER OF THE BOTTLED VOICES, THE ORDER'S STORE AT THE END OF ITS OWN DUG TUNNEL
  const sides: [NodeKind, TunnelKind, boolean][] = [
    ['lair', 'narrow', true],
    ['store', 'dug', true],
    ['treasure', rng.chance(0.5) ? 'dry' : 'narrow', false],
  ];
  for (const [kind, tk, must] of sides) {
    const hs = nodes.map((_n, i) => i).filter((n) => (isPathChamber(n) && nodes[n].path >= (kind === 'lair' ? 2 : 1)) || (kind === 'store' && n === M)).filter((n) => freeNbrs(n).length > 0);
    if (!hs.length) {
      if (must) return null;
      continue;
    }
    const h = rng.pick(hs);
    branch.push({ nodes: [h, mk(...rng.pick(freeNbrs(h)), kind, -1)], kind: tk });
  }
  // ---- A WAY ROUND now and then: two chambers of the main way side by side on the lattice, not one after the other
  const joined = new Set<string>();
  const pairKey = (a: number, b: number): string => (a < b ? `${a},${b}` : `${b},${a}`);
  for (const c of pathTunnels) joined.add(pairKey(c[0], c[c.length - 1]));
  for (const b of branch) joined.add(pairKey(b.nodes[0], b.nodes[1]));
  const rounds: [number, number][] = [];
  for (let a = 0; a < nodes.length; a++) {
    for (const [dx, dy] of DIRS) {
      const b = at.get(key(nodes[a].i + dx, nodes[a].j + dy));
      if (b === undefined || b <= a || !isPathChamber(a) || !isPathChamber(b) || Math.abs(nodes[a].path - nodes[b].path) < 3 || joined.has(pairKey(a, b))) continue;
      // (never between two places a corner of the main way is beside: its lattice line is taken)
      rounds.push([a, b]);
    }
  }
  if (rounds.length && rng.chance(0.6)) {
    const [a, b] = rng.pick(rounds);
    branch.push({ nodes: [a, b], kind: 'narrow' });
  }
  // the kinds of the main way's tunnels: a sewer's mostly; round the Hush's host always a sewer's (its sluices are the bells')
  for (const chain of pathTunnels) {
    const a = chain[0];
    const b = chain[chain.length - 1];
    const kind: TunnelKind = nodes[b].kind === 'exit' ? 'dry' : a === P || b === P || a === 0 ? 'main' : rng.weighted<[TunnelKind, number]>([['main', 0.62], ['narrow', 0.28], ['dry', 0.1]], (q) => q[1])[0];
    tunnels.push({ nodes: chain, kind, main: true, segs: [] });
  }
  for (const b of branch) tunnels.push({ nodes: b.nodes, kind: b.kind, main: false, segs: [] });

  // ---- THE SIZES, AND THE LATTICE'S COLUMNS AND ROWS SET APART BY THEM (nothing meets but what a tunnel joins)
  for (const n of nodes) {
    const [w, h] = sizeOf(rng, n.kind, outX);
    n.w = w;
    n.h = h;
  }
  const nodeAt = (i: number, j: number): UNode | undefined => {
    const n = at.get(key(i, j));
    return n === undefined ? undefined : nodes[n];
  };
  const imin = Math.min(...nodes.map((n) => n.i));
  const imax = Math.max(...nodes.map((n) => n.i));
  const jmin = Math.min(...nodes.map((n) => n.j));
  const jmax = Math.max(...nodes.map((n) => n.j));
  const X: number[] = new Array(GX).fill(0);
  const Y: number[] = new Array(GY).fill(0);
  let most = 0;
  for (let j = 0; j < GY; j++) most = Math.max(most, extentOf(nodeAt(imin, j))[0]);
  X[imin] = MARGIN + most;
  // (the tunnels round the Muffled Bell's cistern a little shorter: its bells near it)
  const byBell = (a: number, b: number, alongX: boolean): boolean => branch.some((q) => q.nodes.includes(M) && q.nodes.some((n) => (alongX ? nodes[n].i === a : nodes[n].j === a)) && q.nodes.some((n) => (alongX ? nodes[n].i === b : nodes[n].j === b)));
  const tlen = (a: number, alongX: boolean): number => (byBell(a, a + 1, alongX) ? rng.int(6, 8) : rng.int(7, 13));
  for (let i = imin; i < imax; i++) {
    let g = 0;
    for (let j = 0; j < GY; j++) g = Math.max(g, extentOf(nodeAt(i, j))[1] + extentOf(nodeAt(i + 1, j))[0]);
    X[i + 1] = X[i] + g + 1 + tlen(i, true);
  }
  most = 0;
  for (let i = 0; i < GX; i++) most = Math.max(most, extentOf(nodeAt(i, jmin))[2]);
  Y[jmin] = MARGIN + most;
  for (let j = jmin; j < jmax; j++) {
    let g = 0;
    for (let i = 0; i < GX; i++) g = Math.max(g, extentOf(nodeAt(i, j))[3] + extentOf(nodeAt(i, j + 1))[2]);
    Y[j + 1] = Y[j] + g + 1 + tlen(j, false);
  }
  let farX = 0;
  let farY = 0;
  for (let j = 0; j < GY; j++) farX = Math.max(farX, extentOf(nodeAt(imax, j))[1]);
  for (let i = 0; i < GX; i++) farY = Math.max(farY, extentOf(nodeAt(i, jmax))[3]);
  const W = X[imax] + farX + 1 + MARGIN;
  const H = Y[jmax] + farY + 1 + MARGIN;
  for (const n of nodes) {
    n.X = X[n.i];
    n.Y = Y[n.j];
    if (!n.w) continue;
    const [l, , u] = extentOf(n);
    n.rect = [n.X - l, n.Y - u, n.X - l + n.w, n.Y - u + n.h];
    const r = n.rect;
    if (n.kind === 'cistern' || n.kind === 'muffled') n.pool = [r[0] + 4, r[1] + 4, r[2] - 4, r[3] - 4];
    // (the King's Cistern's one pool, in its corner to the screen's right, clear of the middle of every side where a tunnel comes in)
    if (n.kind === 'boss') n.pool = [r[2] - 7, r[1] + 2, r[2] - 2, r[1] + 7];
  }

  // ---- THE TILES
  const tiles = new Uint8Array(W * H).fill(T_WALL);
  const zones = new Uint8Array(W * H);
  const water = new Uint8Array(W * H);
  const floorAt = (x: number, y: number, z: number): void => {
    if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1) return;
    const i = y * W + x;
    tiles[i] = T_FLOOR;
    zones[i] = z;
    water[i] = 0;
  };
  const waterAt = (x: number, y: number): void => {
    if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1) return;
    const i = y * W + x;
    tiles[i] = T_WALL;
    zones[i] = 0;
    water[i] = 1;
  };
  const xyOf = (s: Seg, along: number, off: number): [number, number] => (s.alongX ? [along, s.line + off] : [s.line + off, along]);
  const hull = (vals: number[]): [number, number] => [Math.min(...vals), Math.max(...vals)];
  // each tunnel's runs, from one chamber's middle (or a corner) to the next
  for (const t of tunnels) {
    const pts = t.nodes.filter((n, k) => k === 0 || k === t.nodes.length - 1 || nodes[n].kind === 'corner');
    for (let k = 0; k + 1 < pts.length; k++) {
      const p = nodes[pts[k]];
      const q = nodes[pts[k + 1]];
      const alongX = p.j === q.j;
      t.segs.push({ alongX, line: alongX ? p.Y : p.X, a: alongX ? p.X : p.Y, b: alongX ? q.X : q.Y, cornerA: p.kind === 'corner', cornerB: q.kind === 'corner' });
    }
  }
  // (before each tunnel's mouth into a chamber, three deep: kept clear of what stands)
  const mouths: Rect[] = [];
  for (const t of tunnels) {
    const P2 = PROFILE[t.kind];
    for (const [end, s] of [[t.nodes[0], t.segs[0]], [t.nodes[t.nodes.length - 1], t.segs[t.segs.length - 1]]] as [number, Seg][]) {
      const n = nodes[end];
      if (!n.w) continue;
      const [l, r2, u, d] = extentOf(n);
      const mid = end === t.nodes[0] ? s.a : s.b;
      const dir = Math.sign((end === t.nodes[0] ? s.b : s.a) - mid);
      const e0 = s.alongX ? (dir > 0 ? n.X + r2 - 2 : n.X - l) : dir > 0 ? n.Y + d - 2 : n.Y - u;
      mouths.push(s.alongX ? [e0, s.line + P2.lo - 1, e0 + 3, s.line + P2.hi + 2] : [s.line + P2.lo - 1, e0, s.line + P2.hi + 2, e0 + 3]);
    }
  }
  /** A run's tiles along it (its floor, or its channel's: at a corner reaching across the other run's). */
  const spanOf = (s: Seg, lo: number, hi: number): [number, number] => {
    const v = [s.a, s.b];
    if (s.cornerA) v.push(s.a + lo, s.a + hi);
    if (s.cornerB) v.push(s.b + lo, s.b + hi);
    return hull(v);
  };
  for (const t of tunnels) {
    const P2 = PROFILE[t.kind];
    for (const s of t.segs) {
      const [s0, s1] = spanOf(s, P2.lo, P2.hi);
      for (let a = s0; a <= s1; a++) for (let o = P2.lo; o <= P2.hi; o++) floorAt(...xyOf(s, a, o), P2.zone);
    }
  }
  for (const t of tunnels) {
    const ch = PROFILE[t.kind].ch;
    if (!ch) continue;
    for (const s of t.segs) {
      const [s0, s1] = spanOf(s, ch[0], ch[1]);
      for (let a = s0; a <= s1; a++) for (let o = ch[0]; o <= ch[1]; o++) waterAt(...xyOf(s, a, o));
    }
  }
  // the chambers over the tunnels' ends (a channel stops at a chamber's edge, as at a culvert), their pools
  const zoneOfNode = (k: NodeKind): number => (k === 'cistern' || k === 'muffled' || k === 'boss' ? ZONE.Cistern : k === 'store' ? ZONE.Dug : ZONE.Walk);
  for (const n of nodes) {
    if (!n.rect) continue;
    const [x0, y0, x1, y1] = n.rect;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) floorAt(x, y, zoneOfNode(n.kind));
  }
  for (const n of nodes) {
    if (!n.pool) continue;
    const [x0, y0, x1, y1] = n.pool;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) waterAt(x, y);
  }
  // THE RIVER'S OUTFLOW UNDER THE WALLS, where he comes in: its water from the floor's edge to a pool at the landing's back
  const S0 = nodes[0];
  const sr = S0.rect!;
  if (outX) for (let y = S0.Y - 2; y <= S0.Y + 2; y++) for (let x = 1; x <= sr[0] + 3; x++) waterAt(x, y);
  else for (let x = S0.X - 2; x <= S0.X + 2; x++) for (let y = 1; y <= sr[1] + 3; y++) waterAt(x, y);

  // ---- THE OPEN STRETCHES OF THE RUNS (out of the chambers, clear of the corners), THE CROSSINGS OVER THEIR CHANNELS
  const inChamber = (x: number, y: number): boolean => nodes.some((n) => n.rect && inRect(n.rect, x, y));
  const stretches: Stretch[] = [];
  const crossings: Crossing[] = [];
  tunnels.forEach((t, ti) => {
    for (const s of t.segs) {
      const [a0, a1] = hull([s.a, s.b]);
      let s0 = Infinity;
      let s1 = -Infinity;
      for (let a = a0; a <= a1; a++) {
        const [x, y] = xyOf(s, a, 0);
        if (inChamber(x, y)) continue;
        if ((s.cornerA && Math.abs(a - s.a) <= 4) || (s.cornerB && Math.abs(a - s.b) <= 4)) continue;
        s0 = Math.min(s0, a);
        s1 = Math.max(s1, a);
      }
      if (s1 < s0) continue;
      stretches.push({ t: ti, seg: s, s0, s1 });
      const ch = PROFILE[t.kind].ch;
      if (!ch || s1 - s0 + 1 < 8) continue;
      for (let c = s0 + rng.int(3, 6); c + 1 <= s1 - 3; c += rng.int(11, 16)) {
        const z = rng.chance(0.6) ? ZONE.Grate : ZONE.Planks;
        crossings.push({ seg: s, s: c, zone: z });
        for (const a of [c, c + 1]) for (let o = ch[0]; o <= ch[1]; o++) floorAt(...xyOf(s, a, o), z);
      }
    }
  });
  // (the water laid as the rules know it: a pit beside the floor, rock further off; the Land says where the water is)
  for (let i = 0; i < W * H; i++) {
    if (!water[i]) continue;
    const x = i % W;
    const y = (i - x) / W;
    let near = false;
    for (let dy = -3; dy <= 3 && !near; dy++) for (let dx = -3; dx <= 3 && !near; dx++) {
      const u = x + dx;
      const v = y + dy;
      if (u >= 0 && v >= 0 && u < W && v < H && tiles[v * W + u] === T_FLOOR) near = true;
    }
    tiles[i] = near ? T_PIT : T_WALL;
  }

  // ---- WHERE HE COMES IN, WHERE THE KING WAITS, THE WAY ON
  const start = outX ? (S0.Y) * W + sr[0] + 7 : (sr[1] + 7) * W + S0.X;
  const boss = nodes[LEN - 2];
  const br = boss.rect!;
  const bossTile = (br[1] + Math.floor(boss.h / 2)) * W + br[0] + Math.floor(boss.w / 2);
  const exitN = nodes[LEN - 1];
  const exitTile = exitN.Y * W + exitN.X;
  const cut = new Uint8Array(W * H);
  const got = reach(W, H, tiles, cut, start, false);
  if (!got[start] || !got[bossTile] || !got[exitTile]) return null;
  for (const n of nodes) {
    if (!n.rect) continue;
    let any = false;
    for (let y = n.rect[1]; y < n.rect[3] && !any; y++) for (let x = n.rect[0]; x < n.rect[2] && !any; x++) any = got[y * W + x] === 1;
    if (!any) return null;
  }
  const sx = (start % W) + 0.5;
  const sy = Math.floor(start / W) + 0.5;

  // ---- THE SLUICES: across the far walkway (of two) of every sewer's tunnel, in the open stretch and at its mouths; at each, the place for a bell on the near walkway (of three) or in the chamber at the mouth
  const whole3 = (x: number, y: number): boolean => {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const u = x + dx;
      const v = y + dy;
      if (u < 0 || v < 0 || u >= W || v >= H || tiles[v * W + u] !== T_FLOOR || !got[v * W + u]) return false;
    }
    return true;
  };
  const onCrossing = (s: Seg, a: number, pad: number): boolean => crossings.some((c) => c.seg === s && a >= c.s - pad && a <= c.s + 1 + pad);
  const sluices: Sluice[] = [];
  const sluiceOf = (ti: number, s: Seg, a: number, bx: number, by: number, mouth: boolean): void => {
    const [fx0, fy0] = xyOf(s, a, -3);
    const [fx1, fy1] = xyOf(s, a, -2);
    if (tiles[fy0 * W + fx0] !== T_FLOOR || tiles[fy1 * W + fx1] !== T_FLOOR) return;
    if (!whole3(bx, by)) return;
    // (its point the walkway's middle; along x its front turned along +x, the art's frames 2 and 3, shut and open; along y, 0 and 1)
    const x = s.alongX ? a + 0.5 : s.line - 2;
    const y = s.alongX ? s.line - 2 : a + 0.5;
    sluices.push({ x, y, tx: fx1, ty: fy1, frame: s.alongX ? 3 : 1, under: [fy0 * W + fx0, fy1 * W + fx1], bx, by, t: ti, mouth });
  };
  for (const st of stretches) {
    const t = tunnels[st.t];
    if (t.kind !== 'main') continue;
    for (let a = st.s0 + 3; a <= st.s1 - 3; a++) {
      if (onCrossing(st.seg, a, 2)) continue;
      const [bx, by] = xyOf(st.seg, a, 2);
      sluiceOf(st.t, st.seg, a, bx, by, false);
    }
  }
  tunnels.forEach((t, ti) => {
    if (t.kind !== 'main') return;
    for (const [end, s] of [[t.nodes[0], t.segs[0]], [t.nodes[t.nodes.length - 1], t.segs[t.segs.length - 1]]] as [number, Seg][]) {
      const n = nodes[end];
      if (!n.rect || n.kind === 'start' || n.kind === 'boss' || n.kind === 'exit') continue;
      const mid = end === t.nodes[0] ? s.a : s.b;
      const other = end === t.nodes[0] ? s.b : s.a;
      const dir = Math.sign(other - mid);
      const e = s.alongX ? (dir > 0 ? n.rect[2] - 1 : n.rect[0]) : dir > 0 ? n.rect[3] - 1 : n.rect[1];
      const [bx, by] = xyOf(s, e - dir, 2);
      // (the gate across the far walkway at the tunnel's first tile, the bell just inside the chamber)
      if (onCrossing(s, e + dir, 1)) continue;
      sluiceOf(ti, s, e + dir, bx, by, true);
    }
  });

  // ---- THE BELLS (docs/act2_build.md, the contract). The bells to ring: four to seven by depth (this floor five or six), at the
  // sluices nearest the Muffled Bell, spread about (none within eight of another), none near where he comes in (ten), none
  // in the King's Cistern; a sixth only if it is not much further out than the fifth (the Hush's circle no wider than it
  // need be). The Muffled Bell: the diver's bell in its cistern, two tiles out from the pool, off the tunnels' mouths, at
  // whichever such place makes the Hush's circle smallest.
  const mn = nodes[M];
  const mr = mn.rect!;
  const mp = mn.pool!;
  const bossR: Rect = br;
  const want = rng.chance(0.5) ? 5 : 6;
  const bellsFor = (mx: number, my: number): { at: number[]; r: number } | null => {
    const cands = sluices.map((q, k) => ({ k, d: Math.hypot(q.bx + 0.5 - mx, q.by + 0.5 - my) })).sort((p, q) => p.d - q.d);
    const picked: number[] = [];
    let last = 0;
    for (const c of cands) {
      if (picked.length >= want) break;
      if (picked.length === 5 && c.d > Math.max(last, 22)) break;
      const q = sluices[c.k];
      const x = q.bx + 0.5;
      const y = q.by + 0.5;
      if (c.d < 5 || Math.hypot(x - sx, y - sy) < 10 || rectDist(bossR, x, y) < 2 || inRect(sr, q.bx, q.by)) continue;
      if (picked.some((k) => Math.hypot(sluices[k].bx - q.bx, sluices[k].by - q.by) < 8)) continue;
      picked.push(c.k);
      last = c.d;
    }
    if (picked.length < 5) return null;
    const r = Math.ceil(last + 4);
    // (the Hush's circle: not reaching where he comes in, twelve tiles clear, nor the King's Cistern)
    if (Math.hypot(mx - sx, my - sy) < r + 12 || rectDist(bossR, mx, my) < r + 1) return null;
    return { at: picked, r };
  };
  let best: { mb: { x: number; y: number }; at: number[]; r: number; v: number } | null = null;
  for (let y = mr[1]; y < mr[3]; y++) for (let x = mr[0]; x < mr[2]; x++) {
    // (two tiles out from the pool: one tile of paving between the eight round it and the water; clear of the tunnels' mouths, the middle lines)
    const k = Math.max(mp[0] - x, 0, x - (mp[2] - 1), mp[1] - y, y - (mp[3] - 1));
    if (!whole3(x, y) || k !== 2 || Math.abs(x - mn.X) <= 3 || Math.abs(y - mn.Y) <= 3) continue;
    if (Math.hypot(x + 0.5 - sx, y + 0.5 - sy) < 12) continue;
    const got5 = bellsFor(x + 0.5, y + 0.5);
    if (!got5) continue;
    const v = got5.r + rng.next() * 2;
    if (!best || v < best.v) best = { mb: { x: x + 0.5, y: y + 0.5 }, at: got5.at, r: got5.r, v };
  }
  if (!best) return null;
  const mb = best.mb;
  const bellAt = best.at;
  const bells: BellsPlan = {
    muffled: mb,
    bells: bellAt.map((k) => ({ x: sluices[k].bx + 0.5, y: sluices[k].by + 0.5 })),
    hush: { x: mb.x, y: mb.y, r: best.r },
  };

  // ---- THE ROOMS: each chamber its own; two of the main way's for a yellow pack
  const rooms: Room[] = [];
  const kindOfRoom = (k: NodeKind): RoomKind => (k === 'start' ? 'start' : k === 'boss' ? 'boss' : k === 'treasure' ? 'treasure' : k === 'lair' ? 'guardian' : 'normal');
  for (const n of nodes) {
    if (!n.rect) continue;
    n.room = rooms.length;
    rooms.push({ id: rooms.length, x: n.rect[0], y: n.rect[1], w: n.w, h: n.h, kind: kindOfRoom(n.kind), path: n.path });
  }
  const pathRooms = rooms.filter((q) => q.kind === 'normal' && q.path > 0);
  rng.shuffle(pathRooms);
  for (let k = 0; k < Math.min(2, Math.floor(pathRooms.length / 3)); k++) pathRooms[k].kind = 'elite';

  const floor: Floor = {
    depth,
    seed,
    w: W,
    h: H,
    tiles,
    cut,
    variant: new Uint8Array(W * H),
    rooms,
    start: { x: sx, y: sy },
    boss: { x: (bossTile % W) + 0.5, y: Math.floor(bossTile / W) + 0.5 },
    packs: [],
    props: [],
  };
  const vr = new RNG(seed ^ 0x1b873593);
  for (let i = 0; i < W * H; i++) floor.variant[i] = vr.int(0, 255);
  floor.packs = packsOf(rng, floor, nodes, tunnels, stretches, depth);
  floor.props = propsOf(rng, floor, nodes, mouths, [bells.muffled, ...bells.bells]);

  const roleOf = (k: NodeKind): AreaRole => (k === 'start' ? 'start' : k === 'boss' ? 'boss' : k === 'lair' ? 'lair' : k === 'vault' || k === 'cistern' ? 'path' : 'side');
  const way: [number, number][] = nodes.filter((n) => n.path >= 0).sort((p, q) => p.path - q.path).map((n) => [n.X + 0.5, n.Y + 0.5]);
  const lanes: Lane[] = tunnels.map((t) => ({ pts: t.nodes.filter((n, k) => k === 0 || k === t.nodes.length - 1 || nodes[n].kind === 'corner').map((n): [number, number] => [nodes[n].X + 0.5, nodes[n].Y + 0.5]), w: PROFILE[t.kind].hi - PROFILE[t.kind].lo + 1 }));
  const land: Land = {
    kind: 'undercity',
    depth,
    seed,
    way,
    areas: nodes.filter((n) => n.rect).map((n) => ({ blob: { x: n.rect![0] + n.w / 2, y: n.rect![1] + n.h / 2, rx: n.w / 2, ry: n.h / 2, rot: 0, wob: 0, seed: n.i * 31 + n.j }, room: n.room, role: roleOf(n.kind) })),
    lanes,
    holds: [],
    exit: { x: exitN.X + 0.5, y: exitN.Y + 0.5 },
    arrive: { x: sx, y: sy },
    zones,
    water,
    bells,
  };
  const plan: UPlan = { nodes, tunnels, stretches, crossings, sluices, bellAt, muffled: M, mouths, outX };
  return { laid: { floor, land }, plan };
}

// ---------------------------------------------------------------------------------------------------
// THE PACKS (the floor's own kinds: game/act2_mobs.ts, by game/act1_mobs.ts act1Pack), as the descent's are laid
// (game/act1_layout.ts placePacks): in each chamber one for every seventy tiles of it, the lair's guardian, a yellow pack
// in an elite chamber; now and then a small one on a tunnel's walkway

function packsOf(rng: RNG, f: Floor, nodes: readonly UNode[], tunnels: readonly Tunnel[], stretches: readonly Stretch[], depth: number): PackSpot[] {
  const out: PackSpot[] = [];
  const W = f.w;
  const used: [number, number][] = [];
  const free = (x: number, y: number, r: number): boolean => {
    for (let ty = Math.floor(y - r); ty <= Math.floor(y + r); ty++) for (let tx = Math.floor(x - r); tx <= Math.floor(x + r); tx++) {
      if (tx < 0 || ty < 0 || tx >= W || ty >= f.h || f.tiles[ty * W + tx] !== T_FLOOR) return false;
    }
    return true;
  };
  const put = (x: number, y: number, room: number, tier: PackSpot['tier'], size: number, kind: PackSpot['kind']): void => {
    out.push({ x: Math.floor(x) + 0.5, y: Math.floor(y) + 0.5, roomId: room, size, tier, kind });
    used.push([x, y]);
  };
  for (const n of nodes) {
    if (!n.rect || n.kind === 'start' || n.kind === 'boss' || n.kind === 'exit') continue;
    const room = f.rooms[n.room];
    let area = 0;
    for (let y = n.rect[1]; y < n.rect[3]; y++) for (let x = n.rect[0]; x < n.rect[2]; x++) if (f.tiles[y * W + x] === T_FLOOR) area++;
    const many = n.kind === 'lair' ? 1 : Math.max(1, Math.round(area / 70));
    for (let k = 0; k < many; k++) {
      for (let tries = 0; tries < 40; tries++) {
        const x = n.rect[0] + 1.5 + rng.next() * (n.w - 3);
        const y = n.rect[1] + 1.5 + rng.next() * (n.h - 3);
        if (!free(x, y, 1) || Math.hypot(x - f.start.x, y - f.start.y) < 10 || used.some(([ux, uy]) => Math.hypot(ux - x, uy - y) < 5)) continue;
        const tier: PackSpot['tier'] = n.kind === 'lair' ? 'champion' : room.kind === 'elite' && k === 0 ? 'elite' : 'normal';
        const p = act1Pack(depth, rng, tier);
        put(x, y, room.id, tier, p.size, p.kind);
        break;
      }
    }
  }
  for (const st of stretches) {
    const t = tunnels[st.t];
    if ((t.kind !== 'main' && t.kind !== 'dry') || st.s1 - st.s0 < 11 || rng.chance(0.5)) continue;
    const a = Math.floor((st.s0 + st.s1) / 2);
    const off = t.kind === 'main' ? 2 : 0;
    const x = st.seg.alongX ? a + 0.5 : st.seg.line + off + 0.5;
    const y = st.seg.alongX ? st.seg.line + off + 0.5 : a + 0.5;
    if (!free(x, y, 0.5) || Math.hypot(x - f.start.x, y - f.start.y) < 10 || used.some(([ux, uy]) => Math.hypot(ux - x, uy - y) < 6)) continue;
    const p = act1Pack(depth, rng, 'normal');
    put(x, y, -1, 'normal', Math.max(2, Math.ceil(p.size * 0.6)), p.kind);
  }
  return out;
}

/** The game's own things: the side chamber's chests, and breakables about the chambers (drawn as the floor's two: smashed voice jars, a crate of jars gnawed open). */
function propsOf(rng: RNG, f: Floor, nodes: readonly UNode[], mouths: readonly Rect[], bells: readonly { x: number; y: number }[]): PropSpot[] {
  const out: PropSpot[] = [];
  const W = f.w;
  const taken = new Set<number>();
  const ok = (tx: number, ty: number): boolean => {
    for (let y = ty - 1; y <= ty + 1; y++) for (let x = tx - 1; x <= tx + 1; x++) {
      if (x < 0 || y < 0 || x >= W || y >= f.h || f.tiles[y * W + x] !== T_FLOOR || taken.has(y * W + x)) return false;
    }
    // (nothing where a pack stands, nor in the eight round a bell: the contract)
    if (f.packs.some((p) => Math.abs(p.x - 0.5 - tx) <= 1 && Math.abs(p.y - 0.5 - ty) <= 1)) return false;
    return bells.every((b) => Math.abs(Math.floor(b.x) - tx) > 2 || Math.abs(Math.floor(b.y) - ty) > 2);
  };
  const put = (k: PropSpot['kind'], tx: number, ty: number): void => {
    out.push({ kind: k, x: tx, y: ty });
    taken.add(ty * W + tx);
  };
  for (const n of nodes) {
    if (!n.rect || n.kind === 'start' || n.kind === 'boss' || n.kind === 'exit') continue;
    const [x0, y0, x1, y1] = n.rect;
    // (never before a tunnel's mouth)
    const mouth = (tx: number, ty: number): boolean => mouths.some((m) => inRect(m, tx, ty));
    if (n.kind === 'treasure') {
      const many = rng.int(2, 3);
      for (let k = 0, t = 0; k < many && t < 40; t++) {
        const tx = x0 + 2 + rng.int(0, n.w - 5);
        const ty = y0 + 1 + rng.int(0, 2);
        if (!ok(tx, ty) || mouth(tx, ty)) continue;
        put('chest', tx, ty);
        k++;
      }
    }
    // breakables about its edge (the descent's DRESS_EDGES: toward the edges, not the middle)
    const many = rng.int(1, 3);
    for (let k = 0, t = 0; k < many && t < 40; t++) {
      const edge = rng.int(0, 3);
      const tx = edge === 0 ? x0 + 1 : edge === 1 ? x1 - 2 : x0 + 1 + rng.int(0, n.w - 3);
      const ty = edge === 2 ? y0 + 1 : edge === 3 ? y1 - 2 : y0 + 1 + rng.int(0, n.h - 3);
      if (!ok(tx, ty) || mouth(tx, ty)) continue;
      put(rng.chance(0.5) ? 'barrel' : 'urn', tx, ty);
      k++;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------
// THE DRESSING

/**
 * Dress the floor (its pieces, its traps, its Bells' pieces where Land.bells has them, its quest's jar, its lights), as
 * game/act1_dress.ts dresses the descent's, by dice of its own.
 *   THE BELLS: the diver's bell (the Muffled Bell) where Land.bells has it, the Order's chain hoist beside it that dragged it
 *     there, the Order's hooded lanterns; an alarm bell at each of the bells, with its sluice gate hauled up across the far
 *     walkway (or the tunnel's mouth) beside it; each a piece prop, solid, at state 0 and variant 0, the eight tiles round it
 *     kept walkable and clear (the contract).
 *   THE SLUICE GATES: more across the far walkways and at the tunnels' mouths, now and then one let down shut (the other
 *     walkway is always open); a winch by one now and then.
 *   ITS TWO TRAPS, as the spike floor's beat (game/traps.ts), each drawn once where it stands (Act1Dress.traps): THE FLOOD,
 *     a sluice in a sewer's far wall that bursts and floods its walkway (his doc: "sluices that open and flood a tunnel"),
 *     the whole walkway's width, so it is gone round by the other walkway or over a crossing; THE SLICK OF SLIME on a near
 *     walkway or a chamber's floor ("slick floors").
 *   ON THE WALLS (the far walls, the ones seen): sewermen's lanterns, roots through the vault, rat holes; niches of bottled
 *     voices in the side chamber and the Order's store ("The Silent Order's tunnels lead to shelves of corked jars,
 *     whispering: bottled voices"), the Order's banner, a door into its store, an iron sewer door now and then.
 *   IN THE CHAMBERS, by their kinds; ON THE WALKWAYS, light from the street above through its grates, bones and rags, pale
 *     toadstools at the walls' feet; IN THE KING'S CISTERN, the King's nest at its back and in it the jar of the Crier's voice
 *     (the quest), gnawed bones and rags and broken jars round it, its floor otherwise kept open for the Roll.
 */
export function dress(L: Level, depth: number, seed: number): Act1Dress | null {
  const land = L.land;
  if (!land || land.kind !== 'undercity') return null;
  const plan = PLANS.get(land) ?? lay(land.depth, land.seed)?.plan;
  if (!plan) return null;
  void depth;
  const rng = new RNG((seed ^ 0x3c6ef372) >>> 0);
  const f = L.floor;
  const W = f.w;
  const H = f.h;
  const out: Act1Dress = { floor: 12, tiles: [], traps: [] };
  const { nodes, tunnels } = plan;

  // WHAT IS KEPT CLEAR: where he comes in, the waypoint, the way on, every pack's middle, the crossings and the ground
  // round them, the tunnels' mouths into the chambers, the near walkways' middles (nothing stands in a walkway's way)
  const keep = new Uint8Array(W * H);
  const clearRound = (x: number, y: number, r: number): void => {
    for (let ty = Math.floor(y - r); ty <= Math.floor(y + r); ty++) for (let tx = Math.floor(x - r); tx <= Math.floor(x + r); tx++) {
      if (tx < 0 || ty < 0 || tx >= W || ty >= H) continue;
      if (Math.hypot(tx + 0.5 - x, ty + 0.5 - y) <= r) keep[ty * W + tx] = 1;
    }
  };
  clearRound(f.start.x, f.start.y, 3.2);
  if (L.ways?.way) clearRound(L.ways.way.x, L.ways.way.y, 2);
  clearRound(land.exit.x, land.exit.y, 3);
  for (const p of f.packs) clearRound(p.x, p.y, 1.5);
  const xyOf = (s: Seg, along: number, off: number): [number, number] => (s.alongX ? [along, s.line + off] : [s.line + off, along]);
  for (const c of plan.crossings) for (let a = c.s - 1; a <= c.s + 2; a++) for (let o = -3; o <= 3; o++) {
    const [x, y] = xyOf(c.seg, a, o);
    keep[y * W + x] = 1;
  }
  for (const m of plan.mouths) for (let y = m[1]; y < m[3]; y++) for (let x = m[0]; x < m[2]; x++) if (x >= 0 && y >= 0 && x < W && y < H) keep[y * W + x] = 1;
  for (const st of plan.stretches) {
    if (tunnels[st.t].kind !== 'main') continue;
    for (let a = st.s0; a <= st.s1; a++) {
      const [x, y] = xyOf(st.seg, a, 2);
      keep[y * W + x] = 1;
    }
  }

  const taken = new Uint8Array(W * H);
  for (const p of L.props) taken[p.ty * W + p.tx] = 1;
  const whole = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H && f.tiles[y * W + x] === T_FLOOR;
  /** A free tile: floor, nothing there, not kept clear, walked on; `ring`: its eight neighbours floor and walked on (so what stands there never shuts a way). */
  const free = (x: number, y: number, ring: boolean): boolean => {
    if (!whole(x, y)) return false;
    const i = y * W + x;
    if (keep[i] || taken[i] || L.walk[i] !== 1) return false;
    if (!ring) return true;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      if (!whole(x + dx, y + dy) || L.walk[(y + dy) * W + x + dx] !== 1) return false;
    }
    return true;
  };
  const props: PropInst[] = [];
  const put = (name: string, x: number, y: number, solid: boolean, variant = 0, at?: { x: number; y: number }): PropInst => {
    const p: PropInst = { kind: 'piece', name, tx: x, ty: y, x: at ? at.x : x + 0.5, y: at ? at.y : y + 0.5, solid, state: 0, variant };
    props.push(p);
    taken[y * W + x] = 1;
    if (solid) L.walk[y * W + x] = 0;
    return p;
  };
  /** Keep the eight round a tile clear of anything else (a bell's, a big thing's). */
  const ringKeep = (x: number, y: number): void => {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) keep[(y + dy) * W + x + dx] = 1;
  };

  // ---- THE BELLS: the Muffled Bell, the chain hoist the Order dragged it in by, its lanterns; the alarm bells at their sluices
  const bells = land.bells;
  const mn = nodes[plan.muffled];
  if (bells) {
    const mx = Math.floor(bells.muffled.x);
    const my = Math.floor(bells.muffled.y);
    put(MUFFLED_BELL, mx, my, true);
    ringKeep(mx, my);
    for (const b of bells.bells) {
      const bx = Math.floor(b.x);
      const by = Math.floor(b.y);
      put(SMALL_BELL, bx, by, true);
      ringKeep(bx, by);
    }
  }
  // (round the Muffled Bell: the hoist, a little way off along the pool; two of the Order's hooded lanterns, its pink light)
  if (mn.rect) {
    const near = (x: number, y: number, r0: number, r1: number): [number, number][] => {
      const list: [number, number][] = [];
      for (let y2 = mn.rect![1]; y2 < mn.rect![3]; y2++) for (let x2 = mn.rect![0]; x2 < mn.rect![2]; x2++) {
        const d = Math.hypot(x2 - x, y2 - y);
        if (d >= r0 && d <= r1) list.push([x2, y2]);
      }
      return rng.shuffle(list);
    };
    const bx = bells ? Math.floor(bells.muffled.x) : mn.X;
    const by = bells ? Math.floor(bells.muffled.y) : mn.Y;
    for (const [x, y] of near(bx, by, 2.9, 3.6)) if (free(x, y, true)) { put('a chain hoist', x, y, true); ringKeep(x, y); break; }
    let lit = 0;
    for (const [x, y] of near(bx, by, 4, 7)) if (lit < 2 && free(x, y, true)) { put("the Order's hooded lantern", x, y, true, rng.int(0, 1)); lit++; }
    for (const [x, y] of near(bx, by, 3, 6)) if (free(x, y, true)) { put('a crate of stolen voices', x, y, true, rng.int(0, 1)); break; }
  }

  // ---- THE SLUICE GATES: at each bell; then more along the sewers and at their mouths, one in four let down shut (never at a bell)
  const gates = new Set<number>();
  /** How many walkable tiles are reached from where he comes in (what shuts a way is not laid: a shut gate, a flood's housing). */
  const reachCount = (): number => {
    const seen = new Uint8Array(W * H);
    const s0 = Math.floor(f.start.y) * W + Math.floor(f.start.x);
    const q = [s0];
    seen[s0] = 1;
    let n = 0;
    while (q.length) {
      const i = q.pop()!;
      n++;
      const x = i % W;
      for (const j of [x + 1 < W ? i + 1 : -1, x > 0 ? i - 1 : -1, i + W < W * H ? i + W : -1, i - W]) {
        if (j < 0 || seen[j] || L.walk[j] !== 1) continue;
        seen[j] = 1;
        q.push(j);
      }
    }
    return n;
  };
  /** Make these tiles unwalkable if nothing else is cut off by it; whether it was. */
  const shutIf = (tiles: number[]): boolean => {
    const was = tiles.map((i) => L.walk[i]);
    const n0 = reachCount();
    for (const i of tiles) L.walk[i] = 0;
    if (reachCount() >= n0 - tiles.length) return true;
    tiles.forEach((i, k) => (L.walk[i] = was[k]));
    return false;
  };
  const layGate = (k: number, shut: boolean, bell: boolean): void => {
    const q = plan.sluices[k];
    if (q.under.some((i) => taken[i] || (keep[i] && !bell))) return;
    if (!bell && [...gates].some((g) => Math.hypot(plan.sluices[g].x - q.x, plan.sluices[g].y - q.y) < 6)) return;
    // (one let down shut only where the other walkway or a crossing still takes him by)
    const down = shut && shutIf(q.under);
    gates.add(k);
    put('a sluice gate', q.tx, q.ty, false, q.frame - (down ? 1 : 0), { x: q.x, y: q.y });
    for (const i of q.under) taken[i] = 1;
  };
  for (const k of plan.bellAt) layGate(k, false, true);
  const others = rng.shuffle(plan.sluices.map((_q, k) => k).filter((k) => !plan.bellAt.includes(k)));
  let more = 0;
  for (const k of others) {
    if (more >= 6) break;
    const q = plan.sluices[k];
    if (Math.hypot(q.x - f.start.x, q.y - f.start.y) < 8) continue;
    const before = gates.size;
    layGate(k, rng.chance(0.25), false);
    if (gates.size > before) more++;
  }
  // (a winch by a gate now and then, where there is the floor for it near the gate's bell place: at a tunnel's mouth, in the chamber)
  let winches = 0;
  for (const k of rng.shuffle([...gates])) {
    if (winches >= 3) break;
    const q = plan.sluices[k];
    let done = false;
    for (let dy = -4; dy <= 4 && !done; dy++) for (let dx = -4; dx <= 4 && !done; dx++) {
      const d = Math.hypot(dx, dy);
      if (d < 2.5 || d > 4 || !free(q.bx + dx, q.by + dy, true)) continue;
      put("the sluice's winch", q.bx + dx, q.by + dy, true);
      ringKeep(q.bx + dx, q.by + dy);
      winches++;
      done = true;
    }
  }

  // ---- THE TRAPS: the flood at sluices in the sewers' far walls; the slick of slime on the near walkways and the chambers' floors
  const hazards: HazardSpot[] = [];
  const bellPts = bells ? [bells.muffled, ...bells.bells] : [];
  const trapOk = (x: number, y: number): boolean => Math.hypot(x - f.start.x, y - f.start.y) >= 14 && bellPts.every((b) => Math.hypot(b.x - x, b.y - y) >= 6) && hazards.every((z) => Math.hypot(z.x + z.w / 2 - x, z.y + z.h / 2 - y) >= 9);
  const floods = rng.int(2, 3);
  const spots = rng.shuffle(plan.stretches.filter((st) => tunnels[st.t].kind !== 'dug' && st.s1 - st.s0 >= 6));
  for (const st of spots) {
    if (out.traps!.filter((t) => t.name === FLOOD).length >= floods) break;
    const along: number[] = [];
    for (let a = st.s0 + 2; a <= st.s1 - 2; a++) along.push(a);
    for (const a of rng.shuffle(along)) {
      const s = st.seg;
      // the patch: the far walkway's whole width (a dry tunnel's whole width), three along; the sluice's housing at its back, against the wall
      const P2 = PROFILE[tunnels[st.t].kind];
      const across = P2.ch ? [P2.lo, P2.lo + 1] : [P2.lo, P2.lo + 1, P2.lo + 2];
      const cells: [number, number][] = [];
      for (let da = -1; da <= 1; da++) for (const o of across) cells.push(xyOf(s, a + da, o));
      if (!cells.every(([x, y]) => whole(x, y) && !taken[y * W + x] && !keep[y * W + x] && L.walk[y * W + x] === 1)) continue;
      const [wx, wy] = xyOf(s, a, P2.lo - 1);
      if (f.tiles[wy * W + wx] !== T_WALL || land.water?.[wy * W + wx]) continue;
      const [hx, hy] = xyOf(s, a, P2.lo);
      if (!trapOk(hx + 0.5, hy + 0.5)) continue;
      // (the housing itself stands in the walkway: nothing walks through it, and it shuts no way)
      if (!shutIf([hy * W + hx])) continue;
      const phase = Math.round(rng.next() * 25) / 10;
      const spot: HazardSpot = s.alongX ? { kind: 'spikes', x: a - 1, y: s.line + P2.lo, w: 3, h: across.length, phase } : { kind: 'spikes', x: s.line + P2.lo, y: a - 1, w: across.length, h: 3, phase };
      hazards.push(spot);
      // (its picture: the art's frames along +y, 0 quiet, 1 the warning, 2 to 4 the rush; along +x the same, 5 to 9)
      const k0 = s.alongX ? 0 : 5;
      const trap: Act1Trap = { x: spot.x, y: spot.y, w: spot.w, h: spot.h, name: FLOOD, down: [k0], warn: [k0 + 1], up: [k0 + 2, k0 + 3, k0 + 4], at: s.alongX ? { x: a + 0.5, y: s.line + P2.lo + 0.4 } : { x: s.line + P2.lo + 0.4, y: a + 0.5 } };
      out.traps!.push(trap);
      for (const [x, y] of cells) taken[y * W + x] = 1;
      break;
    }
  }
  const slicks = rng.int(3, 4);
  const slickAt = (x: number, y: number): boolean => {
    for (let dy = 0; dy <= 1; dy++) for (let dx = 0; dx <= 1; dx++) {
      const i = (y + dy) * W + x + dx;
      if (!whole(x + dx, y + dy) || taken[i] || L.walk[i] !== 1 || plan.crossings.some((c) => { const [cx, cy] = xyOf(c.seg, c.s, 0); return Math.abs(cx - x - dx) <= 2 && Math.abs(cy - y - dy) <= 2; })) return false;
    }
    return trapOk(x + 1, y + 1);
  };
  const layList: [number, number][] = [];
  for (const st of plan.stretches) {
    if (tunnels[st.t].kind !== 'main') continue;
    for (let a = st.s0 + 1; a < st.s1 - 1; a += 3) layList.push(st.seg.alongX ? [a, st.seg.line + 1] : [st.seg.line + 1, a]);
  }
  for (const n of nodes) {
    if (!n.rect || n.kind === 'start' || n.kind === 'boss' || n.kind === 'exit' || n.kind === 'muffled') continue;
    for (let k = 0; k < 4; k++) layList.push([n.rect[0] + 1 + rng.int(0, n.w - 4), n.rect[1] + 1 + rng.int(0, n.h - 4)]);
  }
  for (const [x, y] of rng.shuffle(layList)) {
    if (out.traps!.filter((t) => t.name === SLICK).length >= slicks) break;
    if (!slickAt(x, y)) continue;
    const spot: HazardSpot = { kind: 'spikes', x, y, w: 2, h: 2, phase: Math.round(rng.next() * 25) / 10 };
    hazards.push(spot);
    // (its two frames, the sheen in its two places: still, then moving as it warns, and on while it is up)
    out.traps!.push({ x, y, w: 2, h: 2, name: SLICK, down: [0], warn: [1], up: [0, 1, 0, 1], at: { x: x + 1, y: y + 1 } });
    for (let dy = 0; dy <= 1; dy++) for (let dx = 0; dx <= 1; dx++) taken[(y + dy) * W + x + dx] = 1;
  }

  // ---- ON THE FAR WALLS (the faces seen): a piece at a point of the wall's foot line (render/act1_pieces.ts: variant's bit 0 the face, the rest its frame)
  const wallUsed = new Set<number>();
  /** The places along a far wall where a wall piece may hang: a chamber's (its back row, its back column) or a tunnel's (its far walkway's back). */
  const footAlong = (alongX: boolean, foot: number, a0: number, a1: number): [number, number, number][] => {
    // ([floor tile x, floor tile y, face]: along x the wall's tiles at foot - 1, the floor at foot)
    const list: [number, number, number][] = [];
    for (let a = a0; a <= a1; a++) {
      const [fx, fy] = alongX ? [a, foot] : [foot, a];
      const wall = (b: number): boolean => {
        const [x, y] = alongX ? [b, foot - 1] : [foot - 1, b];
        return x >= 0 && y >= 0 && x < W && y < H && f.tiles[y * W + x] === T_WALL && !land.water?.[y * W + x];
      };
      if (!whole(fx, fy) || !wall(a - 1) || !wall(a) || !wall(a + 1)) continue;
      list.push([fx, fy, alongX ? 0 : 1]);
    }
    return list;
  };
  const hang = (name: string, spot: [number, number, number], frame = 0): boolean => {
    const [fx, fy, face] = spot;
    const i = fy * W + fx;
    if (wallUsed.has(i) || taken[i]) return false;
    for (let d = -2; d <= 2; d++) if (wallUsed.has(face === 0 ? i + d : i + d * W)) return false;
    wallUsed.add(i);
    taken[i] = 1;
    const at = face === 0 ? { x: fx + 0.5, y: fy } : { x: fx, y: fy + 0.5 };
    props.push({ kind: 'piece', name, tx: fx, ty: fy, x: at.x, y: at.y, solid: false, state: 0, variant: face | (frame << 1) });
    return true;
  };
  const chamberFeet = (n: UNode): [number, number, number][] => {
    const [x0, y0, x1, y1] = n.rect!;
    return [...footAlong(true, y0, x0, x1 - 1), ...footAlong(false, x0, y0, y1 - 1)];
  };
  // the tunnels' far walls: a sewerman's lantern every dozen tiles or so (an honest light), roots now and then, rat holes
  for (const st of plan.stretches) {
    const t = tunnels[st.t];
    const lo = PROFILE[t.kind].lo;
    const feet = footAlong(st.seg.alongX, st.seg.line + lo, st.s0, st.s1);
    let next = st.s0 + rng.int(1, 6);
    for (const spot of feet) {
      const a = st.seg.alongX ? spot[0] : spot[1];
      if (a < next) continue;
      const roll = rng.next();
      const name = t.kind === 'dug' ? (roll < 0.5 ? "the Silent Order's banner" : 'roots through the vault') : roll < 0.55 ? "a sewerman's lantern" : roll < 0.75 ? 'roots through the vault' : roll < 0.9 ? 'rat holes' : 'a niche of bottled voices';
      if (hang(name, spot, name === 'rat holes' ? rng.int(0, 1) : 0)) next = a + rng.int(9, 15);
    }
  }
  // the chambers' far walls, by their kinds
  for (const n of nodes) {
    if (!n.rect) continue;
    const feet = rng.shuffle(chamberFeet(n));
    const hangSome = (names: string[]): void => {
      let k = 0;
      for (const spot of feet) if (k < names.length && hang(names[k], spot, names[k] === 'rat holes' ? rng.int(0, 1) : 0)) k++;
    };
    switch (n.kind) {
      case 'start':
        hangSome(["a sewerman's lantern", "a sewerman's lantern", 'roots through the vault']);
        break;
      case 'treasure':
        hangSome(['a niche of bottled voices', 'a niche of bottled voices', 'a niche of bottled voices', "a sewerman's lantern"]);
        break;
      case 'store':
        hangSome(["a door into the Order's store", "the Silent Order's banner", 'a niche of bottled voices', 'a niche of bottled voices']);
        break;
      case 'muffled':
        hangSome(["the Silent Order's banner", "the Silent Order's banner", 'a niche of bottled voices', "a sewerman's lantern"]);
        break;
      case 'lair':
        hangSome(['rat holes', 'rat holes', 'rat holes', 'roots through the vault']);
        break;
      case 'boss':
        hangSome(['rat holes', 'rat holes', 'rat holes', 'rat holes', 'roots through the vault', "a sewerman's lantern"]);
        break;
      case 'exit':
        hangSome(["a sewerman's lantern", 'an iron sewer door']);
        break;
      default:
        hangSome([rng.chance(0.3) ? 'an iron sewer door' : "a sewerman's lantern", rng.chance(0.5) ? 'roots through the vault' : 'rat holes', "a sewerman's lantern"]);
    }
  }

  // ---- THE KING'S CISTERN: the nest at its back, the jar of the Crier's voice in it, what the King has fed on round it; the floor otherwise open
  const boss = nodes.find((n) => n.kind === 'boss')!;
  if (boss.rect) {
    const [x0, y0] = boss.rect;
    const nx = x0 + 4;
    const ny = y0 + 4;
    if (free(nx, ny, true)) {
      put("the King's nest", nx, ny, true);
      ringKeep(nx, ny);
      for (const [jx, jy] of [[nx + 3, ny - 1], [nx - 1, ny + 3], [nx + 3, ny + 1]] as [number, number][]) if (free(jx, jy, true)) { put(CRIERS_JAR, jx, jy, true); ringKeep(jx, jy); break; }
    }
    let laid = 0;
    for (let k = 0; k < 30 && laid < 6; k++) {
      const x = x0 + 1 + rng.int(0, 8);
      const y = y0 + 1 + rng.int(0, 8);
      if (Math.hypot(x - nx, y - ny) < 2 || !free(x, y, false)) continue;
      if (laid < 4) put('gnawed bones and rags', x, y, false);
      else if (free(x, y, true)) {
        L.props.push({ kind: rng.chance(0.5) ? 'barrel' : 'urn', tx: x, ty: y, x: x + 0.5, y: y + 0.5, solid: true, state: 0, variant: rng.int(0, 3) });
        taken[y * W + x] = 1;
        L.walk[y * W + x] = 0;
      } else continue;
      laid++;
    }
  }

  // ---- THE CHAMBERS: what stands in each by its kind, toward its edges; what lies about; light from the street above
  const bandOf = (n: UNode, r0: number, r1: number): [number, number][] => {
    const list: [number, number][] = [];
    const [x0, y0, x1, y1] = n.rect!;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const e = Math.min(x - x0, x1 - 1 - x, y - y0, y1 - 1 - y);
      if (e >= r0 && e <= r1) list.push([x, y]);
    }
    return rng.shuffle(list);
  };
  for (const n of nodes) {
    if (!n.rect || n.kind === 'boss') continue;
    const stand = (names: string[]): void => {
      let k = 0;
      for (const [x, y] of bandOf(n, 1, 2)) {
        if (k >= names.length) break;
        if (!free(x, y, true)) continue;
        put(names[k], x, y, true, rng.int(0, 1));
        ringKeep(x, y);
        k++;
      }
    };
    const lie = (names: string[], r0 = 0, r1 = 3): void => {
      let k = 0;
      for (const [x, y] of bandOf(n, r0, r1)) {
        if (k >= names.length) break;
        if (!free(x, y, false)) continue;
        put(names[k], x, y, false, rng.int(0, 1));
        k++;
      }
    };
    switch (n.kind) {
      case 'start':
        // (the landing at the outflow: the sewermen's punt hauled up by the water, their eel traps)
        stand(["a sewerman's punt, hauled up", 'eel traps']);
        lie(['pale toadstools', 'pale toadstools'], 0, 0);
        break;
      case 'store':
        // THE ORDER'S STORE: its racks of jars along the back wall (their fronts to +y), crates of stolen voices, its lantern
        {
          // (against the back wall, along x: the row before them kept walked on, so they shut nothing)
          let racks = 0;
          const [x0, y0, x1] = n.rect;
          const before = (x: number): boolean => [-1, 0, 1].every((d) => whole(x + d, y0 + 1) && L.walk[(y0 + 1) * W + x + d] === 1 && !taken[(y0 + 1) * W + x + d]);
          for (let x = x0 + 1; x < x1 - 1 && racks < 3; x += 2) if (free(x, y0, false) && before(x)) { put("the Order's rack of jars", x, y0, true, rng.int(0, 1)); keep[(y0 + 1) * W + x] = 1; racks++; }
        }
        stand(['a crate of stolen voices', 'a crate of stolen voices', "the Order's hooded lantern"]);
        lie(['an ink spill'], 1, 3);
        break;
      case 'treasure':
        stand(['a crate of stolen voices', 'a crate of jars, gnawed open']);
        lie(['gnawed bones and rags']);
        break;
      case 'lair':
        stand(['eel traps', "a sewerman's barrow"]);
        lie(['gnawed bones and rags', 'gnawed bones and rags', 'gnawed bones and rags', 'pale toadstools'], 0, 4);
        break;
      case 'muffled':
        lie(['pale toadstools', 'gnawed bones and rags'], 0, 1);
        break;
      case 'cistern':
        stand([rng.chance(0.5) ? 'a chain hoist' : "a sewerman's punt, hauled up", rng.chance(0.5) ? 'rubble of the siege' : 'a sinkhole in the flags']);
        lie(['pale toadstools', 'gnawed bones and rags'], 0, 1);
        break;
      case 'exit':
        break;
      default:
        stand([rng.pick(["a sewerman's barrow", 'rubble of the siege', 'eel traps', 'a sinkhole in the flags'])]);
        lie([rng.pick(['pale toadstools', 'gnawed bones and rags'])], 0, 1);
    }
    // light from the street above, fallen through a grate in the vault, on every chamber's floor but the Order's own (its pink lantern)
    if (n.kind !== 'store') {
      const mids = bandOf(n, 2, 6).sort((p, q) => Math.hypot(p[0] - n.X, p[1] - n.Y) - Math.hypot(q[0] - n.X, q[1] - n.Y));
      for (const [x, y] of mids) if (!taken[y * W + x] && whole(x, y) && L.walk[y * W + x] === 1) { put('light from the street above', x, y, false); break; }
    }
  }
  // (the King's Cistern lit too: light from the street above, two places in it)
  if (boss.rect) {
    const [x0, y0, x1, y1] = boss.rect;
    for (const [x, y] of [[Math.floor((x0 + x1) / 2) - 3, Math.floor((y0 + y1) / 2) - 2], [Math.floor((x0 + x1) / 2) + 3, Math.floor((y0 + y1) / 2) + 3]] as [number, number][]) if (!taken[y * W + x] && whole(x, y)) put('light from the street above', x, y, false);
  }

  // ---- ON THE WALKWAYS: light from the street above now and then, what lies about, toadstools at the walls' feet
  for (const st of plan.stretches) {
    const t = tunnels[st.t];
    if (t.kind === 'dug') continue;
    const off = t.kind === 'main' ? 2 : t.kind === 'narrow' ? -1 : 0;
    let next = st.s0 + rng.int(2, 8);
    for (let a = st.s0; a <= st.s1; a++) {
      if (a < next) continue;
      const [x, y] = xyOf(st.seg, a, off);
      if (taken[y * W + x] || !whole(x, y) || L.walk[y * W + x] !== 1) continue;
      put(rng.chance(0.55) ? 'light from the street above' : rng.chance(0.5) ? 'gnawed bones and rags' : 'pale toadstools', x, y, false);
      next = a + rng.int(10, 18);
    }
  }

  L.props.push(...props);
  if (hazards.length) {
    f.hazards = [...(f.hazards ?? []), ...hazards];
    L.hazards = makeHazards(f);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------
// FOR ITS MOMENT (art/floor12_moments.ts, THE SURGE: not wired yet)

/**
 * Where floor 12's moment may be laid (the art's README: "on a channel two tiles across that runs along x ... its anchor
 * the point on the middle of the channel at the walkways' height, the culvert in its far wall (toward -y) a tile upstream (-x)
 * of it; the wave runs off toward +x and dies away about six tiles past the anchor"): every such anchor on the floor, world,
 * the channel two across with walkway either side from two tiles upstream to seven down, no crossing over it there; a
 * dozen tiles apart at least. For whoever wires the moment (as the first floors' are: render/pieces.ts, game/first5.ts).
 */
export function surgeSites(floor: Floor, land: Land): { x: number; y: number }[] {
  const W = floor.w;
  const H = floor.h;
  const wet = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H && !!land.water && land.water[y * W + x] === 1;
  const dry = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H && floor.tiles[y * W + x] === T_FLOOR && (land.zones?.[y * W + x] ?? 0) === ZONE.Walk;
  const out: { x: number; y: number }[] = [];
  for (let y = 1; y < H - 2; y++) {
    for (let x = 2; x < W - 7; x++) {
      let ok = true;
      for (let a = x - 2; a <= x + 7 && ok; a++) ok = wet(a, y) && wet(a, y + 1) && dry(a, y - 1) && dry(a, y + 2);
      if (!ok || out.some((p) => Math.hypot(p.x - x, p.y - y) < 12)) continue;
      out.push({ x, y: y + 1 });
    }
  }
  return out;
}
