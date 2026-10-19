// ACT 2, THE HUSH: FLOOR 11, THE GATE WARD: ITS MAP-MAKER AND ITS DRESSER (game/act2_layout.ts and game/act2_dress.ts ask
// them for the floor; behind ACT2, game/act1.ts, off until his yes).
//
// His doc ("Wordsmith Act 2: The Hush"): "You walk in through the broken gate as the town's rescuer, and the welcome is
// wrong." Its layout: "lanes between tall timber-and-stone houses opening into squares, the market's stalls, and cart
// barricades left from the siege. Some houses and shops can be walked into"; its hazards: "firepot craters still burning, and
// houses the siege brought down"; its story: "the bells ring for you, but the crowd under the festival bunting stands silent,
// lips moving with no sound. Shards of the dome glitter pink in the gutters." Its boss, the Crier, his floor "The Crier's
// Square"; of the art chat's first square, to it, 18 Oct: "The open squares should be like at least 2x that size", then
// "Bigger still" (its dev page's is 30 by 27).
// The art: art/gateward.ts (the ground: gateWardLook, gateWardPaintFloor, GWHouse, GW_ZONE, houseShell), art/floor11.ts and
// art/act2_set.ts (the fifty pieces), src/dev/preview_gateward.ts (the art chat's stretch laid by hand: its lanes, its square,
// its two houses walked into: the model of what the ground wants), docs/mockups/act2_gateward/README.md.
//
// HOW IT IS LAID (the planning chat's helper's, as the descent's floors were laid: game/act1_layout.ts): the city is HOUSES
// EVERYWHERE, every tile that is not floor painted as houses by plot (the art's ground does that of itself), and the floor is
// cut out of it as RECTANGLES, straight-edged as houses are (the art: "The edges are straight, as houses are"): open areas (the
// gate's street, the market's squares, smaller squares, a side market, a yard, a court, the Crier's Square) and the lanes
// between them, three or four tiles wide, straight or with a dog-leg in them, never nearer another than five tiles of houses
// (so that a house front stands its full height: art/gateward.ts GW_RISE). The main way: the gate's street where he comes in,
// eight squares on, the Crier's Square at the far end, ten open areas in all (as the descent's are since his word of 17 Oct,
// "The levels are very short in 6-7 so far"); off it a side market (the Muffled Bell's), a lair (its guardian pack) and a
// court (the reward). Then the HOUSES WALKED INTO, along the back edges of the squares and the lanes (the edges whose house
// fronts look toward the eye), each a room behind its front and a doorway two tiles wide in it, by the art's GWHouse.
//
// WHAT IT GIVES: a Floor as the rest of the game knows one (its tiles, its rooms, its packs, its props, where the hero starts
// and the boss waits) and a Land (game/act1_layout.ts), with the Hush's own (game/act2_types.ts): `zones` (the art's GW_ZONE: a
// street, a square, a room), `squares` (each square's middle, for its ring of setts), `houses` (those walked into) and `bells`
// (the Bells' plan, by the contract of docs/act2_build.md). By the floor's own dice: the same depth and seed give the same
// floor, here and in the painter's worker.

import { RNG } from '../../engine/rng';
import type { Act1Dress, Act1Tile } from '../act1_dress';
import { act1Pack } from '../act1_mobs';
import { nearestFloor, reach, tileMid } from '../act1_layout';
import type { AreaRole, Blob, Land, Laid, Lane } from '../act1_layout';
import type { BellsPlan, HouseLaid } from '../act2_types';
import type { Level, PropInst } from '../state';
import { makeHazards } from '../traps';
import { T_FLOOR, T_WALL } from '../types';
import type { Floor, HazardSpot, PackSpot, PropSpot, Room, RoomKind } from '../types';

/** Whether this map-maker lays the floor yet (false: the descent's stands in). */
export const BUILT = true;

/** What a walkable tile is: the art's GW_ZONE (art/gateward.ts), its numbers (the game does not import the art). */
export const GW_ZONES = { Street: 0, Square: 1, Room: 2 } as const;

// ---------------------------------------------------------------------------------------------------
// THE NUMBERS (the planning chat's helper's picks, where the art left them to the game)

/**
 * THE SIZES OF THINGS, in tiles. `gap`: the least depth of houses between two open things not joined (a house front stands
 * GW_RISE, 150 picture pixels, about four and a half tiles back up the screen: thinner, and it would be cut down as the ground
 * cuts a near wall); `margin`: houses round the floor's edge. The squares: [along the way, across it]. THE CRIER'S SQUARE:
 * his "at least 2x that size" and "Bigger still" to the art chat's squares (10 by 10, then 20 by 18), its dev page's 30 by 27:
 * so 30 to 32 across the way into it and 27 or 28 along it; the Crier's Silent Shout reaches 7.4 tiles and his Proclamation 8.6
 * (the art chat's board post of 18 Oct), so the square is three of his reaches and more across.
 */
export const GW_PLAN = {
  chain: 10,
  gap: 5,
  margin: 12,
  lane: { long: [6, 12] as const, side: [5, 9] as const, jog: 0.35 },
  gate: [9, 5] as const,
  market: { along: [11, 15] as const, across: [13, 18] as const },
  square: { along: [8, 10] as const, across: [9, 12] as const },
  crier: { along: [27, 28] as const, across: [30, 32] as const },
  sideMarket: { along: [11, 13] as const, across: [12, 15] as const },
  yard: { along: [9, 10] as const, across: [10, 12] as const },
  court: { along: [7, 9] as const, across: [8, 10] as const },
  /** Houses walked into: how many a floor (at most), their rooms' width along their front and depth behind it, the doorway's width. */
  houses: { most: 9, wide: [4, 7] as const, deep: [3, 4] as const, door: 2 },
  /**
   * THE BELLS: how far from the Muffled Bell a small bell may be at most (so the Hush round it, the bells' circle and 4 tiles
   * more, stays a part of the city, not the whole of it; the contract's other numbers are its own: docs/act2_build.md).
   */
  bells: { far: 24 },
};

/** A rectangle of tiles: x0, y0, x1, y1 (x1, y1 not in it). */
type Rect = [number, number, number, number];
/** The four ways along the grid: 0 +x, 1 +y, 2 -x, 3 -y. */
const DX = [1, 0, -1, 0];
const DY = [0, 1, 0, -1];

type Kind = 'gate' | 'market' | 'square' | 'crier' | 'yard' | 'court';

interface Area {
  r: Rect;
  role: AreaRole;
  kind: Kind;
  path: number;
  parent: number;
  /** The sides of it that a lane leaves or comes in by (0 +x, 1 +y, 2 -x, 3 -y). */
  sides: number[];
  /** Which way the way came into it (-1: the start). */
  inDir: number;
}
interface Way {
  rects: Rect[];
  w: number;
  pts: [number, number][];
  a: number;
  b: number;
  main: boolean;
}
interface Plan {
  areas: Area[];
  ways: Way[];
  houses: HouseLaid[];
  /** Which way the floor goes in from the gate (0 +x: the gate's front along +x; 1 +y). */
  first: number;
}

const overlaps = (a: Rect, b: Rect, g: number): boolean => a[0] - g < b[2] && b[0] < a[2] + g && a[1] - g < b[3] && b[1] < a[3] + g;
const inRect = (r: Rect, x: number, y: number): boolean => x >= r[0] && x < r[2] && y >= r[1] && y < r[3];
const midOf = (r: Rect): [number, number] => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
/** How far a point is from a rectangle (0 inside it). */
const rectDist = (r: Rect, x: number, y: number): number => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - y, 0, y - r[3]));

/** A rectangle beyond side `d` of `A`: `u0` to `u1` tiles out from that side, across it from `v0` to `v1` (the world's y for a side along y, x for one along x). */
function beyond(A: Rect, d: number, u0: number, u1: number, v0: number, v1: number): Rect {
  if (d === 0) return [A[2] + u0, v0, A[2] + u1, v1];
  if (d === 2) return [A[0] - u1, v0, A[0] - u0, v1];
  if (d === 1) return [v0, A[3] + u0, v1, A[3] + u1];
  return [v0, A[1] - u1, v1, A[1] - u0];
}
/** The world point `u` out from side `d` of `A`, at `v` across. */
function outAt(A: Rect, d: number, u: number, v: number): [number, number] {
  if (d === 0) return [A[2] + u, v];
  if (d === 2) return [A[0] - u, v];
  if (d === 1) return [v, A[3] + u];
  return [v, A[1] - u];
}
/** A rectangle's span across side `d` (the world's y for 0 and 2, its x for 1 and 3). */
const across = (A: Rect, d: number): [number, number] => (d % 2 === 0 ? [A[1], A[3]] : [A[0], A[2]]);

function sizeOf(rng: RNG, kind: Kind, side: boolean): [number, number] {
  const P = GW_PLAN;
  const r = (s: { along: readonly [number, number]; across: readonly [number, number] }): [number, number] => [rng.int(s.along[0], s.along[1]), rng.int(s.across[0], s.across[1])];
  switch (kind) {
    case 'gate':
      return [P.gate[0], P.gate[1]];
    case 'market':
      return r(side ? P.sideMarket : P.market);
    case 'square':
      return r(P.square);
    case 'crier':
      return r(P.crier);
    case 'yard':
      return r(P.yard);
    case 'court':
      return r(P.court);
  }
}

/** Is a new rectangle clear of everything laid (but what it joins) by `gap`? */
function clearOf(plan: Plan, r: Rect, gap: number, exceptAreas: readonly number[], exceptWays: readonly Way[] = []): boolean {
  for (let i = 0; i < plan.areas.length; i++) if (!exceptAreas.includes(i) && overlaps(r, plan.areas[i].r, gap)) return false;
  for (const w of plan.ways) {
    if (exceptWays.includes(w)) continue;
    if (exceptAreas.includes(w.a) && exceptAreas.includes(w.b)) continue;
    for (const q of w.rects) if (overlaps(r, q, gap - 1)) return false;
  }
  return true;
}

/**
 * GROW AN AREA OFF ANOTHER: a lane out of side `d` of area `ai`, `L` tiles of houses long, `w` wide (straight, or with a dog-leg
 * in it), and the new area at its end, `along` deep and `across` wide; null if it would come within the houses' gap of
 * anything else. `mid`: the lane comes into the new area near the middle of its side (the Crier's Square: his rostrum faces it).
 */
function grow(rng: RNG, plan: Plan, ai: number, d: number, kind: Kind, role: AreaRole, size: [number, number], L: number, w: number, jog: boolean, mid: boolean): { area: Area; way: Way } | null {
  const A = plan.areas[ai].r;
  const [a0, a1] = across(A, d);
  if (a1 - 1 - w < a0 + 1) return null;
  const p = rng.int(a0 + 1, a1 - 1 - w);
  let j = 0;
  let at = 0;
  if (jog && L >= 9) {
    at = rng.int(2, L - 3 - w);
    j = (rng.chance(0.5) ? 1 : -1) * rng.int(3, 5);
  }
  const q = p + j;
  const [along, wide] = size;
  let q0 = rng.int(q + 1 + w - wide, q - 1);
  if (mid) q0 = Math.max(q + 1 + w - wide, Math.min(q - 1, Math.round(q + w / 2 - wide / 2) + rng.int(-2, 2)));
  const b = beyond(A, d, L, L + along, q0, q0 + wide);
  const rects: Rect[] = [];
  const pts: [number, number][] = [];
  if (!j) {
    rects.push(beyond(A, d, -1, L + 1, p, p + w));
    pts.push(outAt(A, d, 0, p + w / 2), outAt(A, d, L, p + w / 2));
  } else {
    rects.push(beyond(A, d, -1, at + w, p, p + w));
    rects.push(beyond(A, d, at, at + w, Math.min(p, q), Math.max(p, q) + w));
    rects.push(beyond(A, d, at, L + 1, q, q + w));
    pts.push(outAt(A, d, 0, p + w / 2), outAt(A, d, at + w / 2, p + w / 2), outAt(A, d, at + w / 2, q + w / 2), outAt(A, d, L, q + w / 2));
  }
  const n = plan.areas.length;
  if (!clearOf(plan, b, GW_PLAN.gap, [])) return null;
  for (const r of rects) if (!clearOf(plan, r, GW_PLAN.gap, [ai])) return null;
  const area: Area = { r: b, role, kind, path: -1, parent: ai, sides: [(d + 2) % 4], inDir: d };
  const way: Way = { rects, w, pts, a: ai, b: n, main: false };
  return { area, way };
}

// ---------------------------------------------------------------------------------------------------
// THE PLAN

function planOf(rng: RNG): Plan | null {
  const P = GW_PLAN;
  // which way the floor goes in from the gate (its front along +x or +y), and the other way it turns now and then
  const first = rng.int(0, 1);
  const second = first === 0 ? rng.pick([1, 3]) : rng.pick([0, 2]);
  const plan: Plan = { areas: [], ways: [], houses: [], first };
  const g = first === 0 ? ([0, 0, P.gate[0], P.gate[1]] as Rect) : ([0, 0, P.gate[1], P.gate[0]] as Rect);
  plan.areas.push({ r: g, role: 'start', kind: 'gate', path: 0, parent: -1, sides: [(first + 2) % 4], inDir: -1 });
  // THE MAIN WAY: the gate's street, eight squares (the market's and smaller ones), the Crier's Square
  const kinds: Kind[] = rng.shuffle(['market', 'market', 'market', 'market', 'square', 'square', 'square', 'square']);
  let last = first;
  let run = 0;
  for (let i = 1; i < P.chain; i++) {
    const kind: Kind = i === P.chain - 1 ? 'crier' : kinds[i - 1];
    const role: AreaRole = i === P.chain - 1 ? 'boss' : 'path';
    const prefer = i === 1 ? first : run >= 2 ? (last === first ? second : first) : rng.chance(0.45) ? second : first;
    let got: { area: Area; way: Way } | null = null;
    for (const d of [prefer, prefer === first ? second : first]) {
      for (let tries = 0; tries < 30 && !got; tries++) {
        const L = rng.int(P.lane.long[0], P.lane.long[1]);
        const w = i === 1 || kind === 'crier' ? 3 : rng.chance(0.3) ? 4 : 3;
        got = grow(rng, plan, plan.areas.length - 1, d, kind, role, sizeOf(rng, kind, false), L, w, rng.chance(P.lane.jog), kind === 'crier');
      }
      if (got) {
        run = got.area.inDir === last ? run + 1 : 1;
        last = got.area.inDir;
        break;
      }
    }
    if (!got) return null;
    got.area.path = i;
    got.way.main = true;
    plan.areas[plan.areas.length - 1].sides.push(got.area.inDir);
    plan.areas.push(got.area);
    plan.ways.push(got.way);
  }
  // THE SIDE AREAS: the Muffled Bell's market (off the main way's middle, so that the Hush round it reaches neither the gate
  // nor the Crier's Square), the lair (its guardian pack: the Order's yard), the court (the reward)
  const side = (kind: Kind, role: AreaRole, hosts: number[], must: boolean): boolean => {
    for (let tries = 0; tries < 60; tries++) {
      const h = rng.pick(hosts);
      const free = [0, 1, 2, 3].filter((d) => !plan.areas[h].sides.includes(d));
      if (!free.length) continue;
      const d = rng.pick(free);
      const L = rng.int(P.lane.side[0], P.lane.side[1]);
      const got = grow(rng, plan, h, d, kind, role, sizeOf(rng, kind, true), L, 3, rng.chance(P.lane.jog * 0.5), false);
      if (!got) continue;
      plan.areas[h].sides.push(d);
      plan.areas.push(got.area);
      plan.ways.push(got.way);
      return true;
    }
    return !must;
  };
  if (!side('market', 'side', [4, 5], true)) return null;
  if (!side('yard', 'lair', [2, 3, 6, 7], true)) return null;
  side('court', 'side', [1, 2, 3, 5, 6, 7, 8], false);
  return plan;
}

/**
 * THE HOUSES WALKED INTO (his word to the art chat, 18 Oct: "Can we make it so the fronts of any building you can go into is
 * there, but once you enter, the wholefacade fades to transparent so you can see inside?"; his rule, art rulebook Places 9): along
 * the back edges of the squares and of the lanes (the fronts that look toward the eye: those along x look along +y, those along
 * y along +x), each a room `deep` behind its front, its doorway two tiles wide, two tiles of houses round it at its back and sides
 * (so its front stands its height whole, and nothing of the street lies behind its shell), none at the gate.
 */
function layHouses(rng: RNG, plan: Plan): void {
  const H = GW_PLAN.houses;
  // (the edges they may stand on: each area's and each straight run of lane's back edges, along x (y0) and along y (x0))
  const edges: { r: Rect; alongX: boolean; area: number }[] = [];
  plan.areas.forEach((a, i) => {
    if (a.kind === 'gate') return;
    edges.push({ r: a.r, alongX: true, area: i }, { r: a.r, alongX: false, area: i });
  });
  for (const w of plan.ways) {
    for (const r of w.rects) {
      const lx = r[2] - r[0];
      const ly = r[3] - r[1];
      if (lx >= 9 && ly <= 4) edges.push({ r, alongX: true, area: -1 });
      if (ly >= 9 && lx <= 4) edges.push({ r, alongX: false, area: -1 });
    }
  }
  rng.shuffle(edges);
  const floorRects: Rect[] = [...plan.areas.map((a) => a.r), ...plan.ways.flatMap((w) => w.rects)];
  const boss = plan.areas.find((a) => a.role === 'boss')!;
  let inBoss = 0;
  for (const e of edges) {
    if (plan.houses.length >= H.most) break;
    if (e.area >= 0 && plan.areas[e.area] === boss && inBoss >= 1) continue;
    const wide = rng.int(H.wide[0], H.wide[1]);
    const deep = rng.int(H.deep[0], H.deep[1]);
    const [s0, s1] = e.alongX ? [e.r[0], e.r[2]] : [e.r[1], e.r[3]];
    if (s1 - s0 < wide + 2) continue;
    const h0 = rng.int(s0 + 1, s1 - 1 - wide);
    const at = e.alongX ? e.r[1] - 1 : e.r[0] - 1;
    const room: Rect = e.alongX ? [h0, at - deep, h0 + wide, at] : [at - deep, h0, at, h0 + wide];
    const front: Rect = e.alongX ? [h0 - 1, at, h0 + wide + 1, at + 1] : [at, h0 - 1, at + 1, h0 + wide + 1];
    // (two tiles of houses round its room at its back and its sides; its front, and the houses either side of it, not the street)
    const ring: Rect = [room[0] - 2, room[1] - 2, room[2] + (e.alongX ? 2 : 0), room[3] + (e.alongX ? 0 : 2)];
    if (floorRects.some((f) => overlaps(f, ring, 0) || overlaps(f, front, 0))) continue;
    if (plan.houses.some((o) => overlaps(o.room as Rect, ring, 2))) continue;
    const d0 = rng.int(h0 + 1, h0 + wide - 1 - H.door);
    plan.houses.push({ room, front: { along: e.alongX ? 'x' : 'y', at, door: [d0, d0 + H.door] } });
    if (e.area >= 0 && plan.areas[e.area] === boss) inBoss++;
  }
}

// ---------------------------------------------------------------------------------------------------
// LAY THE FLOOR

/** The Gate Ward's own, beyond what the Land holds: the city gate where he comes in. */
export interface GateWardLaid extends Laid {
  gate: { x: number; y: number; frame: number };
}

/** Lay floor 11, or null (not laid this time: the dice are rolled again). */
export function generate(depth: number, seed: number): Laid | null {
  const rng = new RNG((seed ^ 0x6a09e667) >>> 0);
  const plan = planOf(rng);
  if (!plan) return null;
  layHouses(rng, plan);

  // THE BOUNDS: everything moved so the floor starts `margin` tiles in
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  const grow2 = (r: Rect): void => {
    x0 = Math.min(x0, r[0]);
    y0 = Math.min(y0, r[1]);
    x1 = Math.max(x1, r[2]);
    y1 = Math.max(y1, r[3]);
  };
  for (const a of plan.areas) grow2(a.r);
  for (const w of plan.ways) for (const r of w.rects) grow2(r);
  for (const h of plan.houses) grow2([h.room[0] - 2, h.room[1] - 2, h.room[2] + 2, h.room[3] + 2]);
  const M = GW_PLAN.margin;
  const dx = M - x0;
  const dy = M - y0;
  const mv = (r: Rect): void => {
    r[0] += dx;
    r[1] += dy;
    r[2] += dx;
    r[3] += dy;
  };
  for (const a of plan.areas) mv(a.r);
  for (const w of plan.ways) {
    for (const r of w.rects) mv(r);
    for (const p of w.pts) {
      p[0] += dx;
      p[1] += dy;
    }
  }
  for (const h of plan.houses) {
    mv(h.room as Rect);
    h.front.at += h.front.along === 'x' ? dy : dx;
    h.front.door[0] += h.front.along === 'x' ? dx : dy;
    h.front.door[1] += h.front.along === 'x' ? dx : dy;
  }
  const W = x1 - x0 + 2 * M;
  const H = y1 - y0 + 2 * M;

  // THE TILES AND WHAT EACH IS: the open areas and the lanes floor, the houses walked into their rooms and doorways; all else houses
  const tiles = new Uint8Array(W * H).fill(T_WALL);
  const zones = new Uint8Array(W * H);
  const fill = (r: Rect, zone: number): void => {
    for (let ty = r[1]; ty < r[3]; ty++) for (let tx = r[0]; tx < r[2]; tx++) {
      tiles[ty * W + tx] = T_FLOOR;
      zones[ty * W + tx] = zone;
    }
  };
  for (const w of plan.ways) for (const r of w.rects) fill(r, GW_ZONES.Street);
  for (const a of plan.areas) fill(a.r, a.kind === 'gate' ? GW_ZONES.Street : GW_ZONES.Square);
  for (const h of plan.houses) {
    fill(h.room as Rect, GW_ZONES.Room);
    const F = h.front;
    for (let k = F.door[0]; k < F.door[1]; k++) {
      const i = F.along === 'x' ? F.at * W + k : k * W + F.at;
      tiles[i] = T_FLOOR;
      zones[i] = GW_ZONES.Room;
    }
  }
  // THE CITY GATE, BROKEN, where he comes in: at the back of the gate's street (its front along +x or +y, as the way goes in),
  // its towers over the houses either side (the art: "built 1.4 times as big as it is measured here, so that it stands over the
  // houses"); the street's back tiles under it houses, but its own (its doorway, broken: it stands in it)
  const gr = plan.areas[0].r;
  const first = plan.first;
  const gmid = first === 0 ? (gr[1] + gr[3]) / 2 : (gr[0] + gr[2]) / 2;
  const gk = Math.floor(gmid);
  for (let k = first === 0 ? gr[1] : gr[0]; k < (first === 0 ? gr[3] : gr[2]); k++) {
    if (k === gk) continue;
    tiles[first === 0 ? k * W + gr[0] : gr[1] * W + k] = T_WALL;
  }
  const gate = first === 0 ? { x: gr[0] + 0.4, y: gmid, frame: 1 } : { x: gmid, y: gr[1] + 0.4, frame: 0 };

  const cut = new Uint8Array(W * H);
  // THE START: four tiles in from the gate, in the middle of its street
  const startTile = first === 0 ? Math.floor(gmid) * W + gr[0] + 4 : (gr[1] + 4) * W + Math.floor(gmid);
  if (tiles[startTile] !== T_FLOOR) return null;
  const got = reach(W, H, tiles, cut, startTile, true);
  for (let i = 0; i < W * H; i++) if (tiles[i] === T_FLOOR && !got[i]) return null;

  // THE CRIER'S SQUARE: his rostrum by its far side, beside the way on; the boss before it
  const bossA = plan.areas.find((a) => a.role === 'boss')!;
  const br = bossA.r;
  const bd = bossA.inDir;
  const [bcx, bcy] = midOf(br);
  const side = rng.chance(0.5) ? 1 : -1;
  // (the far side: `bd` the way the way came in; 2.5 tiles in from it, at its middle, the way on; the rostrum 3.5 in, 6 to the side)
  const farAt = (inn: number, off: number): [number, number] => {
    if (bd === 0) return [br[2] - inn, bcy + off];
    if (bd === 2) return [br[0] + inn, bcy + off];
    if (bd === 1) return [bcx + off, br[3] - inn];
    return [bcx + off, br[1] + inn];
  };
  const exitAt = farAt(2.5, 0);
  const exit = { x: Math.floor(exitAt[0]) + 0.5, y: Math.floor(exitAt[1]) + 0.5 };
  const rost = farAt(3.5, 6 * side);
  const bossAt = farAt(7.5, 4 * side);
  const bossTile = nearestFloor(W, H, tiles, cut, bossAt[0], bossAt[1]);
  if (bossTile < 0) return null;

  // ROOMS: each area its rectangle
  const roleKind = (r: AreaRole): RoomKind => (r === 'start' ? 'start' : r === 'boss' ? 'boss' : r === 'side' ? 'treasure' : r === 'lair' ? 'guardian' : 'normal');
  const rooms: Room[] = plan.areas.map((a, i) => ({ id: i, x: a.r[0], y: a.r[1], w: a.r[2] - a.r[0], h: a.r[3] - a.r[1], kind: roleKind(a.role), path: a.path }));
  // (an elite area or two on the main way: a yellow pack's)
  const pathRooms = rooms.filter((r) => r.kind === 'normal' && r.path > 1);
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
    start: tileMid(W, startTile),
    boss: tileMid(W, bossTile),
    packs: [],
    props: [],
  };
  const vr = new RNG(seed ^ 0x1b873593);
  for (let i = 0; i < W * H; i++) floor.variant[i] = vr.int(0, 255);

  // THE BELLS (the contract, docs/act2_build.md)
  const bells = bellsOf(rng, plan, floor, zones);
  if (!bells) return null;

  floor.packs = packsOf(rng, plan, floor, depth, bells);
  floor.props = propsOf(rng, plan, floor, bells);

  // THE MAIN WAY'S MIDDLE LINE, start to boss
  const way: [number, number][] = [];
  plan.areas.filter((a) => a.path >= 0).sort((a, b) => a.path - b.path).forEach((a, k) => {
    if (k > 0) {
      const w = plan.ways.find((q) => q.main && q.b === plan.areas.indexOf(a))!;
      way.push(...w.pts.map((p) => [p[0], p[1]] as [number, number]));
    }
    way.push(midOf(a.r));
  });
  const blobOf = (r: Rect, i: number): Blob => ({ x: (r[0] + r[2]) / 2, y: (r[1] + r[3]) / 2, rx: (r[2] - r[0]) / 2, ry: (r[3] - r[1]) / 2, rot: 0, wob: 0, seed: i });
  const lanes: Lane[] = plan.ways.map((w) => ({ pts: w.pts, w: w.w }));
  const squares = plan.areas
    .filter((a) => a.kind !== 'gate')
    .map((a) => {
      const [x, y] = midOf(a.r);
      const r = a.kind === 'crier' ? 2.8 : a.kind === 'market' ? 2.2 : a.kind === 'square' ? 1.8 : 1.6;
      return { x, y, r };
    });
  const land: Land = {
    kind: 'gateward',
    depth,
    seed,
    way,
    areas: plan.areas.map((a, i) => ({ blob: blobOf(a.r, i), room: i, role: a.role })),
    lanes,
    holds: [],
    exit,
    arrive: { ...floor.start },
    zones,
    squares,
    houses: plan.houses,
    bells,
  };
  // (the plan's own, for the dresser: the gate, the rostrum, each area's kind and rectangle, each lane's rectangles)
  GW_PLANS.set(land, {
    gate,
    rostrum: { x: Math.floor(rost[0]) + 0.5, y: Math.floor(rost[1]) + 0.5 },
    kinds: plan.areas.map((a) => a.kind),
    rects: plan.areas.map((a) => a.r),
    lanes: plan.ways.map((w) => ({ rects: w.rects, w: w.w, main: w.main })),
    inDir: plan.areas.map((a) => a.inDir),
  });
  return { floor, land };
}

/**
 * What the map-maker knows that the Land does not hold (it is the frame's, and goes to the painter's worker as it is): kept
 * beside it for the dresser, which is asked for the same Land straight after (game/act1_level.ts). Where a Land was not laid
 * here in this run (a save come back to), the dresser works it out again from the Land (`planOfLand`).
 */
interface DressPlan {
  gate: { x: number; y: number; frame: number };
  rostrum: { x: number; y: number };
  kinds: Kind[];
  rects: Rect[];
  lanes: { rects: Rect[]; w: number; main: boolean }[];
  inDir: number[];
}
const GW_PLANS = new WeakMap<Land, DressPlan>();

// ---------------------------------------------------------------------------------------------------
// WHAT HANGS ON THE HOUSE FRONTS

/** Is tile (a, b) of a house walked into (its room, its front, the tile of houses round them)? */
function walkInAt(houses: readonly HouseLaid[], a: number, b: number): boolean {
  return houses.some((h) => a >= h.room[0] - 1 && b >= h.room[1] - 1 && (h.front.along === 'x' ? a <= h.room[2] && b <= h.front.at : a <= h.front.at && b <= h.room[3]));
}
/**
 * Does the face of the house at tile (a, b) stand its height whatever the hero does, so that a wall piece (or a shop's doorbell)
 * may hang on it? Not a house walked into (its front fades away), and not a house whose face stands up the screen over a house
 * walked into's room (the ground cuts it down while that house is open, and what hung on it would hang in the air). `alongX`: its
 * wall runs along x (the face looking +y), else along y. A face stands GW_RISE up the screen: about four and a half tiles back.
 */
function faceStands(floorAt: (x: number, y: number) => boolean, houses: readonly HouseLaid[], a: number, b: number, alongX: boolean): boolean {
  if (floorAt(a, b) || walkInAt(houses, a, b)) return false;
  for (let k = 0; k <= 5; k++) for (let s = -1; s <= 1; s++) if (walkInAt(houses, a - k + (alongX ? s : 0), b - k + (alongX ? 0 : s))) return false;
  return true;
}

// ---------------------------------------------------------------------------------------------------
// THE BELLS: the contract between the floors and the event (docs/act2_build.md)

/**
 * THE BELLS' PLAN: the Muffled Bell ("the market bell (the Muffled Bell)") in its bell-cote by the back edge of the side market,
 * off the main way; four or five small bells about it, in the squares and on the house fronts (a wayside shrine's bell and the
 * watch's alarm bell standing, each the middle of three tiles by three of whole floor kept clear; a shop's doorbell on the wall,
 * at a house front's foot on the street's side), no two within 8 tiles, none within 10 of the start nor in the Crier's Square;
 * the Hush's circle round the Muffled Bell holding them all with 4 tiles to spare, 12 clear of the start and clear of the
 * Crier's Square. Which bell is which is told by where it is: a small bell with whole floor all round it stands; one at a
 * house front's foot is the shop's doorbell (`bellKinds`).
 */
function bellsOf(rng: RNG, plan: Plan, f: Floor, zones: Uint8Array): BellsPlan | null {
  const W = f.w;
  const H = f.h;
  const floorAt = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H && f.tiles[y * W + x] === T_FLOOR;
  const ring = (x: number, y: number): boolean => {
    for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) if (!floorAt(x + a, y + b) || zones[(y + b) * W + x + a] === GW_ZONES.Room) return false;
    return true;
  };
  const doorFronts: [number, number][] = plan.houses.flatMap((h) => {
    const F = h.front;
    const out: [number, number][] = [];
    for (let k = F.door[0]; k < F.door[1]; k++) out.push(F.along === 'x' ? [k, F.at + 1] : [F.at + 1, k]);
    return out;
  });
  const nearDoor = (x: number, y: number, r: number): boolean => doorFronts.some(([a, b]) => Math.abs(a - x) <= r && Math.abs(b - y) <= r);
  const laneRects = plan.ways.flatMap((w) => w.rects);
  const bossR = plan.areas.find((a) => a.role === 'boss')!.r;
  const sx = f.start.x;
  const sy = f.start.y;
  // THE MUFFLED BELL: in the side market, a tile in from its back edge (along x or y, whichever no lane comes in by), by a corner
  const mk = plan.areas.find((a) => a.role === 'side' && a.kind === 'market')!;
  const m = mk.r;
  const spots: [number, number][] = [];
  if (mk.inDir !== 1) spots.push([m[0] + 2, m[1] + 1], [m[2] - 3, m[1] + 1]);
  if (mk.inDir !== 0) spots.push([m[0] + 1, m[1] + 2], [m[0] + 1, m[3] - 3]);
  rng.shuffle(spots);
  const mb = spots.find(([x, y]) => ring(x, y) && !nearDoor(x, y, 2) && !laneRects.some((r) => overlaps(r, [x, y, x + 1, y + 1], 2)));
  if (!mb) return null;
  const cx = mb[0] + 0.5;
  const cy = mb[1] + 0.5;
  const dStart = Math.hypot(cx - sx, cy - sy);
  const dBoss = rectDist(bossR, cx, cy);
  const far = Math.min(GW_PLAN.bells.far, Math.min(dStart - 12, dBoss - 2) - 4.2);
  if (far < 12) return null;
  // THE SMALL BELLS' PLACES: standing ones in the squares and the yards (never at a lane's mouth, a door, or a square's heart);
  // doorbells at a house front's foot (a house, not one walked into, at -y or -x of a floor tile of a street or a square)
  const stand: [number, number][] = [];
  const wall: [number, number][] = [];
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      if (!floorAt(x, y) || zones[y * W + x] === GW_ZONES.Room) continue;
      const mx = x + 0.5;
      const my = y + 0.5;
      const d = Math.hypot(mx - cx, my - cy);
      if (d > far || d < 5 || Math.hypot(mx - sx, my - sy) < 10 || overlaps(bossR, [x, y, x + 1, y + 1], 1)) continue;
      if (nearDoor(x, y, 2)) continue;
      const area = plan.areas.find((a) => inRect(a.r, x, y));
      if (area && area.kind !== 'gate' && ring(x, y) && !laneRects.some((r) => overlaps(r, [x, y, x + 1, y + 1], 2))) {
        const [ax, ay] = midOf(area.r);
        if (Math.hypot(mx - ax, my - ay) >= 3) stand.push([x, y]);
      }
      if ((faceStands(floorAt, plan.houses, x, y - 1, true) && floorAt(x, y + 1)) || (faceStands(floorAt, plan.houses, x - 1, y, false) && floorAt(x + 1, y))) wall.push([x, y]);
    }
  }
  const n = rng.int(4, 5);
  const kinds = rng.shuffle(n === 4 ? ['wall', 'stand', 'stand', 'stand'] : ['wall', 'stand', 'stand', 'stand', rng.chance(0.5) ? 'wall' : 'stand']);
  const chosen: [number, number][] = [];
  for (const k of kinds) {
    const list = k === 'wall' ? wall : stand;
    // (spread about the map: of a few at random that will do, the one furthest from those chosen already)
    let best: [number, number] | null = null;
    let bestD = -1;
    for (let tries = 0; tries < 60; tries++) {
      if (!list.length) break;
      const c = list[rng.int(0, list.length - 1)];
      const dmin = Math.min(Math.hypot(c[0] - mb[0], c[1] - mb[1]) + 2, ...chosen.map((o) => Math.hypot(c[0] - o[0], c[1] - o[1])));
      if (chosen.some((o) => Math.hypot(c[0] - o[0], c[1] - o[1]) < 8)) continue;
      if (dmin > bestD) {
        bestD = dmin;
        best = c;
      }
    }
    if (!best) return null;
    chosen.push(best);
  }
  const bells = chosen.map(([x, y]) => ({ x: x + 0.5, y: y + 0.5 }));
  const r = Math.max(...bells.map((b) => Math.hypot(b.x - cx, b.y - cy))) + 4;
  return { muffled: { x: cx, y: cy }, bells, hush: { x: cx, y: cy, r: Math.ceil(r * 10) / 10 } };
}

/** Which of the floor's bells is which, by where it is (see `bellsOf`): the shop's doorbell where a house stands at its back. */
export function bellKinds(f: Floor, bells: BellsPlan): ('shrine' | 'watch' | 'door')[] {
  const W = f.w;
  let stood = 0;
  return bells.bells.map((b) => {
    const x = Math.floor(b.x);
    const y = Math.floor(b.y);
    let whole = true;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (f.tiles[(y + dy) * W + x + dx] !== T_FLOOR) whole = false;
    if (!whole) return 'door';
    return stood++ % 2 === 0 ? 'shrine' : 'watch';
  });
}

// ---------------------------------------------------------------------------------------------------
// THE PACKS AND THE GAME'S OWN THINGS

/** The packs, by area, the floor's own kinds (game/act2_mobs.ts says which, and how many: the frame's act1Pack gives floor 11's). */
function packsOf(rng: RNG, plan: Plan, f: Floor, depth: number, bells: BellsPlan): PackSpot[] {
  const out: PackSpot[] = [];
  const W = f.w;
  const used: [number, number][] = [];
  const free = (x: number, y: number): boolean => {
    for (let ty = Math.floor(y) - 1; ty <= Math.floor(y) + 1; ty++) for (let tx = Math.floor(x) - 1; tx <= Math.floor(x) + 1; tx++) if (tx < 0 || ty < 0 || tx >= W || ty >= f.h || f.tiles[ty * W + tx] !== T_FLOOR) return false;
    return true;
  };
  const nearBell = (x: number, y: number): boolean => [bells.muffled, ...bells.bells].some((b) => Math.hypot(b.x - x, b.y - y) < 3);
  const put = (x: number, y: number, room: number, tier: PackSpot['tier'], n?: number): void => {
    const p = act1Pack(depth, rng, tier);
    out.push({ x: Math.floor(x) + 0.5, y: Math.floor(y) + 0.5, roomId: room, size: n ?? p.size, tier, kind: p.kind });
    used.push([x, y]);
  };
  plan.areas.forEach((a, i) => {
    if (a.role === 'start' || a.role === 'boss') return;
    const [w, h] = [a.r[2] - a.r[0], a.r[3] - a.r[1]];
    const n = a.role === 'lair' ? 1 : Math.max(1, Math.round((w * h) / 75));
    const room = f.rooms[i];
    for (let k = 0; k < n; k++) {
      for (let tries = 0; tries < 40; tries++) {
        const x = rng.range(a.r[0] + 2, a.r[2] - 2);
        const y = rng.range(a.r[1] + 2, a.r[3] - 2);
        if (!free(x, y) || nearBell(x, y)) continue;
        if (Math.hypot(x - f.start.x, y - f.start.y) < 10) continue;
        if (used.some(([ux, uy]) => Math.hypot(ux - x, uy - y) < 5)) continue;
        const tier: PackSpot['tier'] = a.role === 'lair' ? 'champion' : room.kind === 'elite' && k === 0 ? 'elite' : 'normal';
        put(x, y, room.id, tier);
        break;
      }
    }
  });
  // (along the long lanes, a small pack now and then)
  for (const w of plan.ways) {
    const len = w.pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - w.pts[i - 1][0], p[1] - w.pts[i - 1][1]) : 0), 0);
    if (len < 9 || rng.chance(0.5)) continue;
    const a = w.pts[Math.floor((w.pts.length - 1) / 2)];
    const b = w.pts[Math.floor((w.pts.length - 1) / 2) + 1];
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    if (f.tiles[Math.floor(my) * W + Math.floor(mx)] !== T_FLOOR || nearBell(mx, my) || used.some(([ux, uy]) => Math.hypot(ux - mx, uy - my) < 6) || Math.hypot(mx - f.start.x, my - f.start.y) < 10) continue;
    const p = act1Pack(depth, rng, 'normal');
    put(mx, my, -1, 'normal', Math.max(2, Math.ceil(p.size * 0.6)));
  }
  return out;
}

/** The game's own things: the court's chests (the reward), and the breakables about the areas (drawn as the floor's barrel and crates). */
function propsOf(rng: RNG, plan: Plan, f: Floor, bells: BellsPlan): PropSpot[] {
  const out: PropSpot[] = [];
  const W = f.w;
  const taken = new Set<number>();
  const ok = (tx: number, ty: number): boolean => {
    for (let y = ty - 1; y <= ty + 1; y++) for (let x = tx - 1; x <= tx + 1; x++) if (x < 0 || y < 0 || x >= W || y >= f.h || f.tiles[y * W + x] !== T_FLOOR) return false;
    if ([bells.muffled, ...bells.bells].some((b) => Math.abs(b.x - 0.5 - tx) <= 2 && Math.abs(b.y - 0.5 - ty) <= 2)) return false;
    if (f.packs!.some((p) => Math.abs(p.x - 0.5 - tx) <= 1 && Math.abs(p.y - 0.5 - ty) <= 1)) return false;
    return !taken.has(ty * W + tx);
  };
  const put = (k: PropSpot['kind'], tx: number, ty: number): void => {
    out.push({ kind: k, x: tx, y: ty });
    taken.add(ty * W + tx);
  };
  plan.areas.forEach((a) => {
    const [cx, cy] = midOf(a.r);
    if (a.kind === 'court') {
      const n = rng.int(2, 3);
      for (let k = 0, t = 0; k < n && t < 40; t++) {
        const tx = Math.floor(cx + rng.range(-2.5, 2.5));
        const ty = Math.floor(cy + rng.range(-2, 2));
        if (!ok(tx, ty) || (Math.abs(tx + 0.5 - cx) < 1 && Math.abs(ty + 0.5 - cy) < 1)) continue;
        put('chest', tx, ty);
        k++;
      }
    }
    if (a.role === 'start' || a.role === 'boss') return;
    // (barrels and crates, toward the edges)
    const n = rng.int(1, 3);
    for (let k = 0, t = 0; k < n && t < 30; t++) {
      const edge = rng.int(0, 3);
      const tx = edge === 0 ? a.r[0] + 1 : edge === 1 ? a.r[2] - 2 : rng.int(a.r[0] + 1, a.r[2] - 2);
      const ty = edge === 2 ? a.r[1] + 1 : edge === 3 ? a.r[3] - 2 : rng.int(a.r[1] + 1, a.r[3] - 2);
      if (!ok(tx, ty)) continue;
      put(rng.chance(0.5) ? 'barrel' : 'urn', tx, ty);
      k++;
    }
  });
  return out;
}

// ---------------------------------------------------------------------------------------------------
// THE DRESSER

/** The art's names, as the dresser lays them (art/floor11.ts and art/act2_set.ts). */
export const GW_NAMES = {
  gate: 'the city gate, broken',
  muffled: 'the market bell (the Muffled Bell)',
  shrine: "a wayside shrine's bell",
  door: "a shop's doorbell",
  watch: "the watch's alarm bell",
  firepot: "a firepot's crater, burning",
  horn: "the watch's alarm horn, the Hush's",
  jar: 'a jar of the Hush',
  quest: "the crier's last proclamation",
  rostrum: "the crier's rostrum",
} as const;

/**
 * A TRAP OF THE GATE WARD (the art's three, each laid as the descent's traps are, as a spike floor's beat: game/traps.ts): its
 * piece (a prop of the floor's, at tile `i`), and the hazard whose beat its frames follow (Floor.hazards[`hz`]): its frames
 * from `frame0`, quiet (the beat's 'down'), the warning, then sprung (render/act2_houses.ts, `trapSprite`).
 */
export interface GWTrap {
  i: number;
  name: string;
  frame0: number;
  hz: number;
}
/** THE GATE WARD DRESSED: as the descent's are (game/act1_dress.ts, Act1Dress), and its traps. */
export interface GateWardDress extends Act1Dress {
  traps: GWTrap[];
}

/** The plan again from the Land alone (a floor laid in another run: a save come back to). */
function planOfLand(L: Level): DressPlan {
  const land = L.land!;
  const kinds: Kind[] = land.areas.map((a) => (a.role === 'start' ? 'gate' : a.role === 'boss' ? 'crier' : a.role === 'lair' ? 'yard' : a.role === 'side' ? (a.blob.rx * 2 >= 11 && a.blob.ry * 2 >= 11 ? 'market' : 'court') : a.blob.rx * 2 >= 11 && a.blob.ry * 2 >= 11 ? 'market' : 'square'));
  const rects: Rect[] = land.areas.map((a) => [a.blob.x - a.blob.rx, a.blob.y - a.blob.ry, a.blob.x + a.blob.rx, a.blob.y + a.blob.ry]);
  const lanes = land.lanes.map((l) => {
    const out: Rect[] = [];
    for (let k = 0; k + 1 < l.pts.length; k++) {
      const [ax, ay] = l.pts[k];
      const [bx, by] = l.pts[k + 1];
      const h = l.w / 2;
      out.push([Math.round(Math.min(ax, bx) - (ay === by ? 0 : h)), Math.round(Math.min(ay, by) - (ax === bx ? 0 : h)), Math.round(Math.max(ax, bx) + (ay === by ? 0 : h)), Math.round(Math.max(ay, by) + (ax === bx ? 0 : h))]);
    }
    return { rects: out, w: l.w, main: true };
  });
  const s = rects[0];
  const first = s[2] - s[0] > s[3] - s[1] ? 0 : 1;
  const gmid = first === 0 ? (s[1] + s[3]) / 2 : (s[0] + s[2]) / 2;
  const gate = first === 0 ? { x: s[0] + 0.4, y: gmid, frame: 1 } : { x: gmid, y: s[1] + 0.4, frame: 0 };
  const bi = land.areas.findIndex((a) => a.role === 'boss');
  const br = rects[bi];
  const ex = land.exit;
  const inDir = land.areas.map(() => -1);
  inDir[bi] = Math.abs(ex.x - br[2]) < 4 ? 0 : Math.abs(ex.x - br[0]) < 4 ? 2 : Math.abs(ex.y - br[3]) < 4 ? 1 : 3;
  const along = inDir[bi] % 2 === 0;
  const rostrum = { x: along ? ex.x + (inDir[bi] === 0 ? -1 : 1) : ex.x + 6, y: along ? ex.y + 6 : ex.y + (inDir[bi] === 1 ? -1 : 1) };
  return { gate, rostrum, kinds, rects, lanes, inDir };
}

/**
 * DRESS THE FLOOR with its own pieces (the art chat's, by its names: art/floor11.ts, the Crier's 25; art/act2_set.ts, the
 * Hush's 25), as its dev page dresses its stretch (src/dev/preview_gateward.ts) and his doc has it:
 *   THE GATE, broken, behind him where he comes in;
 *   THE BELLS' PIECES where the Land's plan has them (the contract): the Muffled Bell gagged, the small bells quiet;
 *   THE CRIER'S SQUARE: his rostrum by its far side and "the crier's last proclamation" dropped by it (dressing: nothing to
 *     hand in), the market's stalls round its edges facing in, its middle open for the fight;
 *   THE MARKET'S SQUARES: stalls along their edges facing in and back to back in the middle of the big ones ("those open
 *     squares we want a natural market layout look": his words to the art chat, 18 Oct), their goods, a handcart, the notice
 *     board, the herald gagged or the town well or the festival maypole at the heart of each square, the horse trough and hay;
 *   THE LANES: the dome's shards in the gutters ("Shards of the dome glitter pink in the gutters"), cart barricades left from
 *     the siege against their sides, the rubble of houses the siege brought down, lamps at their mouths, drains;
 *   THE HOUSE FRONTS (wall pieces, at the foot of a front, on the street's side): festival bunting ("the crowd under the
 *     festival bunting stands silent"), lanterns, guild signs blotted, the Order's banners and its blank proclamations, washing,
 *     doors; never on a front walked into (it fades away);
 *   THE HOUSES WALKED INTO, their rooms with the Hush's set: a tavern's table and benches, its hearth and a dresser; a shop
 *     the Order holds (its rack of jars, its blank paper); a home (a bed, a dresser, the hearth), against their far walls;
 *   THE ORDER'S YARD (the lair): its cart, its crates of stolen voices, its hooded lanterns, its blank paper;
 *   THE COURT (the reward): a stable yard, its trough and hay, washing over it;
 *   THE TRAPS, each a spike floor's beat: firepots' craters still burning, the watch's alarm horns, the Hush's jars.
 * Everything solid kept off the ways through (every lane's middle, the start, the waypoint, the way on, every doorway and the
 * tile before it, every pack's middle, the 8 tiles round each bell), and what is reached from the start checked last.
 */
export function dress(L: Level, depth: number, seed: number): Act1Dress | null {
  const land = L.land;
  if (!land || land.kind !== 'gateward') return null;
  const P = GW_PLANS.get(land) ?? planOfLand(L);
  const f = L.floor;
  const W = f.w;
  const H = f.h;
  const rng = new RNG((seed ^ 0x3c6ef372 ^ depth) >>> 0);
  const out: GateWardDress = { floor: 11, tiles: [], traps: [] };
  const zones = land.zones ?? new Uint8Array(W * H);
  const houses = land.houses ?? [];
  const bells = land.bells;

  const floorAt = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H && f.tiles[y * W + x] === T_FLOOR;
  const keep = new Uint8Array(W * H);
  const keepRound = (x: number, y: number, r: number): void => {
    for (let ty = Math.floor(y - r); ty <= Math.floor(y + r); ty++) for (let tx = Math.floor(x - r); tx <= Math.floor(x + r); tx++) {
      if (tx < 0 || ty < 0 || tx >= W || ty >= H) continue;
      if (Math.hypot(tx + 0.5 - x, ty + 0.5 - y) <= r) keep[ty * W + tx] = 1;
    }
  };
  const keepRect = (x0: number, y0: number, x1: number, y1: number): void => {
    for (let ty = Math.max(0, y0); ty < Math.min(H, y1); ty++) for (let tx = Math.max(0, x0); tx < Math.min(W, x1); tx++) keep[ty * W + tx] = 1;
  };
  // WHAT IS KEPT CLEAR
  keepRound(f.start.x, f.start.y, 3.2);
  if (L.ways?.way) keepRound(L.ways.way.x, L.ways.way.y, 2);
  keepRound(land.exit.x, land.exit.y, 3);
  for (const p of f.packs ?? []) keepRound(p.x, p.y, 1.5);
  // (every lane's middle: in a lane of 3, its middle tile; of 4, its middle two; and its mouths, two tiles into the areas it joins)
  for (const l of P.lanes) {
    for (const r of l.rects) {
      const lx = r[2] - r[0];
      const ly = r[3] - r[1];
      if (lx > ly) keepRect(r[0] - 2, r[1] + 1, r[2] + 2, r[3] - 1);
      else keepRect(r[0] + 1, r[1] - 2, r[2] - 1, r[3] + 2);
    }
  }
  // (every doorway, the tiles before it, and the room's tiles straight behind it)
  for (const h of houses) {
    const F = h.front;
    if (F.along === 'x') keepRect(F.door[0], h.room[1], F.door[1], F.at + 3);
    else keepRect(h.room[0], F.door[0], F.at + 3, F.door[1]);
  }
  // (the 8 tiles round each bell)
  if (bells) for (const b of [bells.muffled, ...bells.bells]) keepRect(Math.floor(b.x) - 1, Math.floor(b.y) - 1, Math.floor(b.x) + 2, Math.floor(b.y) + 2);

  const taken = new Uint8Array(W * H);
  for (const p of L.props) taken[p.ty * W + p.tx] = 1;
  const inHouse = (x: number, y: number): boolean => houses.some((h) => x >= h.room[0] && x < h.room[2] && y >= h.room[1] && y < h.room[3]) || zones[y * W + x] === GW_ZONES.Room;
  /** A free tile: floor, nothing there, not kept clear, walkable; `ring`: its eight neighbours floor and walkable too. */
  const free = (x: number, y: number, ring: boolean): boolean => {
    if (!floorAt(x, y)) return false;
    const i = y * W + x;
    if (keep[i] || taken[i] || L.walk[i] !== 1) return false;
    if (!ring) return true;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      if (!floorAt(x + dx, y + dy) || L.walk[(y + dy) * W + x + dx] !== 1) return false;
    }
    return true;
  };
  const props: PropInst[] = [];
  /** The solid ones, in the order laid (the last taken away first, if anything that matters is cut off: see the end). */
  const solids: PropInst[] = [];
  const put = (name: string, x: number, y: number, solid: boolean, variant = 0, at?: { x: number; y: number }): PropInst => {
    const p: PropInst = { kind: 'piece', name, tx: x, ty: y, x: at ? at.x : x + 0.5, y: at ? at.y : y + 0.5, solid, state: 0, variant };
    props.push(p);
    taken[y * W + x] = 1;
    if (solid) {
      L.walk[y * W + x] = 0;
      solids.push(p);
    }
    return p;
  };
  const layTile = (i: number, name: string, frame: number): void => {
    const t: Act1Tile = { i, name, frame };
    out.tiles.push(t);
  };
  const stands = (a: number, b: number, alongX: boolean): boolean => faceStands(floorAt, houses, a, b, alongX);
  /** A wall piece at the foot of the house front behind floor tile (x, y): the face looking +y (its wall along x) if there is one there, else +x (art: `left`, `right`; render/act1_pieces.ts: variant = face | frame << 1). */
  const onWall = (name: string, x: number, y: number, frame: number): PropInst | null => {
    if (!floorAt(x, y) || taken[y * W + x]) return null;
    if (stands(x, y - 1, true)) return put(name, x, y, false, 0 | (frame << 1), { x: x + 0.5, y });
    if (stands(x - 1, y, false)) return put(name, x, y, false, 1 | (frame << 1), { x, y: y + 0.5 });
    return null;
  };
  const areaOf = (x: number, y: number): number => P.rects.findIndex((r) => inRect(r, x, y));

  // ---- THE GATE, behind him
  {
    const g = P.gate;
    const tx = Math.floor(g.x);
    const ty = Math.floor(g.y);
    put(GW_NAMES.gate, tx, ty, true, g.frame, { x: g.x, y: g.y });
  }

  // ---- THE BELLS' PIECES (the contract): solid, quiet (state 0); the doorbell on the wall, its frame its state's
  if (bells) {
    put(GW_NAMES.muffled, Math.floor(bells.muffled.x), Math.floor(bells.muffled.y), true, 0);
    bellKinds(f, bells).forEach((k, n) => {
      const b = bells.bells[n];
      const tx = Math.floor(b.x);
      const ty = Math.floor(b.y);
      if (k === 'door') {
        if (!onWall(GW_NAMES.door, tx, ty, 0)) put(GW_NAMES.door, tx, ty, false, 0);
      } else put(k === 'shrine' ? GW_NAMES.shrine : GW_NAMES.watch, tx, ty, true, 0);
    });
  }

  // ---- THE CRIER'S SQUARE: his rostrum by its far side, the proclamation dropped by it
  const bi = P.kinds.indexOf('crier');
  {
    const r = P.rostrum;
    const tx = Math.floor(r.x);
    const ty = Math.floor(r.y);
    if (floorAt(tx, ty)) {
      put(GW_NAMES.rostrum, tx, ty, true, 0);
      // (a tile out from its front toward the square's middle, and one along: a scroll lying on the setts, walked over)
      const [cx, cy] = midOf(P.rects[bi]);
      const acrossX = Math.abs(cx - r.x) > Math.abs(cy - r.y);
      const qx = acrossX ? tx + Math.sign(cx - r.x) : tx + 1;
      const qy = acrossX ? ty + 1 : ty + Math.sign(cy - r.y);
      if (floorAt(qx, qy) && !taken[qy * W + qx]) put(GW_NAMES.quest, qx, qy, false, 0, { x: qx + 0.5, y: qy + 0.4 });
    }
  }

  // ---- THE CRIER'S GATE, the way into his square (the art: "the way into the Crier's Square (the boss's gate)"): an arch across
  // the main way's mouth into it, open (its doors back, the Order's cloth hanging torn: frames 1 and 3, its front along +y or +x);
  // walked through. (The descent's bosses wait out in the open, no gate falls behind the hero: game.ts meetOutdoorBoss. Whether
  // it shuts behind him is not the floor's to say.)
  {
    const wy = land.way;
    const e = wy[wy.length - 2];
    const d = P.inDir[bi];
    const r = P.rects[bi];
    const tx = d === 0 ? r[0] : d === 2 ? r[2] - 1 : Math.floor(e[0]);
    const ty = d === 1 ? r[1] : d === 3 ? r[3] - 1 : Math.floor(e[1]);
    if (e && d >= 0 && floorAt(tx, ty) && !taken[ty * W + tx]) put("the crier's gate", tx, ty, false, d % 2 === 1 ? 1 : 3, { x: d % 2 === 1 ? e[0] : d === 0 ? r[0] : r[2], y: d % 2 === 1 ? (d === 1 ? r[1] : r[3]) : e[1] });
  }

  // ---- THE SQUARES: stalls round their edges facing in (frames: facing * 4 + stall, facing 0 +y, 1 +x, 2 -y, 3 -x), their goods
  const stalls = (ai: number, every: number): void => {
    const r = P.rects[ai];
    const sides: { facing: number; pts: [number, number][] }[] = [
      { facing: 0, pts: [] },
      { facing: 1, pts: [] },
      { facing: 2, pts: [] },
      { facing: 3, pts: [] },
    ];
    for (let x = r[0] + 2; x < r[2] - 2; x++) {
      sides[0].pts.push([x, r[1] + 1]);
      sides[2].pts.push([x, r[3] - 2]);
    }
    for (let y = r[1] + 2; y < r[3] - 2; y++) {
      sides[1].pts.push([r[0] + 1, y]);
      sides[3].pts.push([r[2] - 2, y]);
    }
    for (const s of sides) {
      let since = rng.int(0, every);
      for (const [x, y] of s.pts) {
        since++;
        if (since < every) continue;
        if (!free(x, y, true)) continue;
        // (one in five of those along x smashed by the siege: its frames, which of four, then facing +y or -y)
        const smashed = s.facing % 2 === 0 && rng.chance(0.2);
        const at = { x: x + 0.5 + (s.facing === 1 ? 0.1 : s.facing === 3 ? -0.1 : 0), y: y + 0.5 + (s.facing === 0 ? 0.1 : s.facing === 2 ? -0.1 : 0) };
        if (smashed) put('market stall, smashed', x, y, true, rng.int(0, 3) * 2 + (s.facing === 0 ? 0 : 1), at);
        else put('market stall', x, y, true, s.facing * 4 + rng.int(0, 3), at);
        since = 0;
        // (its goods beside it now and then)
        if (rng.chance(0.35)) {
          const along = s.facing % 2 === 0;
          const gx = along ? x + (rng.chance(0.5) ? 2 : -2) : x;
          const gy = along ? y : y + (rng.chance(0.5) ? 2 : -2);
          if (free(gx, gy, true)) put(rng.pick(['baskets of produce', 'sacks of grain', 'crates', 'barrel']), gx, gy, true, 0);
        }
      }
    }
  };
  /** The heart of a square: one thing (the herald gagged, the town well, the festival maypole) on its ring of setts, or none. */
  const heart = (ai: number, name: string | null): void => {
    if (!name) return;
    const [cx, cy] = midOf(P.rects[ai]);
    const tx = Math.floor(cx);
    const ty = Math.floor(cy);
    if (free(tx, ty, true)) put(name, tx, ty, true, 0, { x: cx, y: cy });
  };
  /** Things about an area's outer band (from `inner` of the way to its edge): `n` of `names`, solid or lying. */
  const about = (ai: number, names: readonly string[], n: number, solid: boolean, frames = 1): void => {
    const r = P.rects[ai];
    const [cx, cy] = midOf(r);
    const list: [number, number][] = [];
    for (let y = r[1] + 1; y < r[3] - 1; y++) for (let x = r[0] + 1; x < r[2] - 1; x++) {
      const u = Math.abs(x + 0.5 - cx) / ((r[2] - r[0]) / 2);
      const v = Math.abs(y + 0.5 - cy) / ((r[3] - r[1]) / 2);
      if (Math.max(u, v) > 0.45) list.push([x, y]);
    }
    rng.shuffle(list);
    let laid = 0;
    for (const [x, y] of list) {
      if (laid >= n) break;
      if (!free(x, y, solid)) continue;
      put(rng.pick(names), x, y, solid, rng.int(0, frames - 1));
      laid++;
    }
  };
  const hearts = rng.shuffle(['the herald, gagged', 'the town well', 'the festival maypole', 'the town well', 'the festival maypole', 'the herald, gagged']);
  let nh = 0;
  P.kinds.forEach((k, ai) => {
    const r = P.rects[ai];
    const big = r[2] - r[0] >= 13 && r[3] - r[1] >= 13;
    if (k === 'crier') {
      stalls(ai, 9);
      about(ai, ['rubble of the siege', 'handcart', 'sacks of grain'], 3, true);
      about(ai, ['a shard of the dome'], 3, false, 4);
    } else if (k === 'market') {
      stalls(ai, big ? 6 : 7);
      heart(ai, hearts[nh++ % hearts.length]);
      about(ai, ['handcart', 'the notice board', 'the horse trough', 'hay bales', 'baskets of produce', 'sacks of grain'], big ? 3 : 2, true);
      if (rng.chance(0.4)) about(ai, ["a cellar's hatch"], 1, true, 2);
      about(ai, ['a shard of the dome', 'an ink spill', "the Order's ink bars"], 2, false, 2);
    } else if (k === 'square') {
      heart(ai, rng.chance(0.7) ? hearts[nh++ % hearts.length] : null);
      about(ai, ['the notice board', 'rubble of the siege', 'handcart', "the Order's hooded lantern", "a cellar's hatch"], 2, true, 2);
      about(ai, ['a shard of the dome', 'an ink spill'], 2, false, 2);
    } else if (k === 'yard') {
      about(ai, ["the carters' cart, the Order's"], 1, true, 4);
      about(ai, ['a crate of stolen voices', 'bundles of blank paper', 'crates', "the Order's hooded lantern"], 4, true, 2);
      about(ai, ["the Order's ink bars", 'an ink spill'], 2, false, 3);
    } else if (k === 'court') {
      about(ai, ['the horse trough', 'hay bales', 'the town well'], 3, true);
      about(ai, ['a shard of the dome'], 1, false, 4);
    }
  });

  // ---- LAMPS at the mouths of the ways into the squares: a street lamp (an honest flame) or the Order's hooded lantern (its fire)
  for (const l of P.lanes) {
    for (const r of [l.rects[0], l.rects[l.rects.length - 1]]) {
      // (a tile beside each end of the lane, in the area it opens into)
      const alongX = r[2] - r[0] > r[3] - r[1];
      const ends: [number, number][] = alongX ? [[r[0] - 1, r[1] - 1], [r[2], r[1] - 1], [r[0] - 1, r[3]], [r[2], r[3]]] : [[r[0] - 1, r[1] - 1], [r[2], r[1] - 1], [r[0] - 1, r[3]], [r[2], r[3]]];
      const [x, y] = rng.pick(ends);
      if (areaOf(x, y) >= 0 && areaOf(x, y) !== 0 && free(x, y, false) && rng.chance(0.6)) put(rng.chance(0.75) ? 'street lamp' : "the Order's hooded lantern", x, y, true, rng.int(0, 1));
    }
  }

  // ---- THE LANES: the dome's shards in the gutters, a cart barricade or rubble against a side, a lamp; drains in the gutters
  for (const l of P.lanes) {
    for (const r of l.rects) {
      const alongX = r[2] - r[0] > r[3] - r[1];
      const len = alongX ? r[2] - r[0] : r[3] - r[1];
      const gutters: [number, number][] = [];
      for (let k = 1; k < len - 1; k++) {
        if (alongX) gutters.push([r[0] + k, r[1]], [r[0] + k, r[3] - 1]);
        else gutters.push([r[0], r[1] + k], [r[2] - 1, r[1] + k]);
      }
      rng.shuffle(gutters);
      let shards = Math.max(1, Math.round(len / 7));
      let solid = len >= 8 ? 1 : 0;
      let drains = rng.chance(0.4) ? 1 : 0;
      for (const [x, y] of gutters) {
        const i = y * W + x;
        if (shards > 0 && free(x, y, false)) {
          put('a shard of the dome', x, y, false, rng.int(0, 3));
          shards--;
        } else if (solid > 0 && free(x, y, false)) {
          put(rng.pick(['the cart barricade', 'rubble of the siege', 'rubble of the siege', 'street lamp', 'barrel']), x, y, true, 0);
          solid--;
        } else if (drains > 0 && floorAt(x, y) && !taken[i] && !out.tiles.some((t) => t.i === i)) {
          layTile(i, 'a drain grate', rng.chance(0.2) ? 1 : 0);
          taken[i] = 1;
          drains--;
        }
      }
    }
  }

  // ---- THE HOUSES WALKED INTO: their rooms, by their own dice: a tavern, a shop the Order holds, a home; against their far walls
  houses.forEach((h, n) => {
    const kind = (h.room[2] - h.room[0]) * (h.room[3] - h.room[1]) >= 20 && n % 3 === 0 ? 'tavern' : n % 3 === 1 ? 'shop' : n % 3 === 2 ? 'home' : 'tavern';
    const alongX = h.front.along === 'x';
    const [rx0, ry0, rx1, ry1] = h.room;
    // (its back wall: along x at ry0 (a front along x), along y at rx0 (a front along y); its far side wall: x = rx0, or y = ry0)
    const backRow: [number, number][] = [];
    if (alongX) for (let x = rx0 + 1; x < rx1; x++) backRow.push([x, ry0]);
    else for (let y = ry0 + 1; y < ry1; y++) backRow.push([rx0, y]);
    const sideWall: [number, number] = alongX ? [rx0, ry0 + 1] : [rx0 + 1, ry0];
    const k = alongX ? 0 : 1;
    const fits = (x: number, y: number): boolean => free(x, y, false) && !(alongX ? x >= h.front.door[0] && x < h.front.door[1] : y >= h.front.door[0] && y < h.front.door[1]);
    const near = (p: [number, number], name: string, frame: number, at?: { x: number; y: number }): boolean => {
      if (!fits(p[0], p[1])) return false;
      put(name, p[0], p[1], true, frame, at);
      return true;
    };
    const backAt = (p: [number, number]): { x: number; y: number } => (alongX ? { x: p[0] + 0.5, y: p[1] + 0.35 } : { x: p[0] + 0.35, y: p[1] + 0.5 });
    if (kind === 'tavern' || kind === 'home') {
      // the hearth against the far side wall, its opening into the room (frames: flame, then which way it opens: k * 2)
      near(sideWall, 'the hearth', (1 - k) * 2 + rng.int(0, 1), alongX ? { x: sideWall[0] + 0.35, y: sideWall[1] + 0.5 } : { x: sideWall[0] + 0.5, y: sideWall[1] + 0.35 });
    }
    rng.shuffle(backRow);
    if (kind === 'tavern') {
      for (const p of backRow) if (near(p, 'a dresser', k * 2, backAt(p))) break;
      // its table and benches a tile out from the back wall
      const tbl: [number, number][] = backRow.map(([x, y]) => (alongX ? [x, y + 1] : [x + 1, y]));
      for (const p of tbl) if (near(p, 'a tavern table and benches', k)) break;
    } else if (kind === 'shop') {
      for (const p of backRow) if (near(p, "the Order's rack of jars", rng.int(0, 1), backAt(p))) break;
      for (const p of backRow) if (near(p, 'bundles of blank paper', 0)) break;
      for (const p of backRow) if (rng.chance(0.5) && near(p, 'a crate of stolen voices', rng.int(0, 1))) break;
    } else {
      for (const p of backRow) if (near(p, 'a bed', k)) break;
      for (const p of backRow) if (near(p, 'a dresser', k * 2, backAt(p))) break;
    }
  });

  // ---- THE TRAPS, each a spike floor's beat (game/traps.ts): firepots' craters still burning (his doc's hazard), the watch's
  // alarm horns (blasting along their mouths, three tiles), the Hush's jars; on the main way's squares and lanes, never in the
  // Crier's Square, before the start, or where a pack stands
  const hazards: HazardSpot[] = [];
  const traps: { name: string; n: number }[] = [
    { name: GW_NAMES.firepot, n: rng.int(3, 5) },
    { name: GW_NAMES.jar, n: rng.int(2, 3) },
    { name: GW_NAMES.horn, n: 2 },
  ];
  const trapAreas = P.kinds.map((k, i) => i).filter((i) => P.kinds[i] === 'market' || P.kinds[i] === 'square' || P.kinds[i] === 'yard');
  const apart = (x: number, y: number): boolean => hazards.every((z) => Math.hypot(z.x - x, z.y - y) >= 6) && Math.hypot(x + 0.5 - f.start.x, y + 0.5 - f.start.y) >= 12;
  for (const t of traps) {
    for (let k = 0, tries = 0; k < t.n && tries < 200; tries++) {
      if (t.name === GW_NAMES.horn) {
        // (in a lane, at a side tile, looking down it: along +x (frames 5 to 9) or +y (0 to 4); its blast the three tiles before its mouth)
        const l = rng.pick(P.lanes);
        const r = rng.pick(l.rects);
        const alongX = r[2] - r[0] > r[3] - r[1];
        if ((alongX ? r[2] - r[0] : r[3] - r[1]) < 7) continue;
        const x = alongX ? r[0] + 1 : rng.chance(0.5) ? r[0] : r[2] - 1;
        const y = alongX ? (rng.chance(0.5) ? r[1] : r[3] - 1) : r[1] + 1;
        if (!free(x, y, false) || !apart(x, y)) continue;
        const strip: [number, number][] = [1, 2, 3].map((s) => (alongX ? [x + s, y] : [x, y + s]));
        if (!strip.every(([a, b]) => floorAt(a, b) && !taken[b * W + a])) continue;
        const p = put(t.name, x, y, true, 0);
        hazards.push({ kind: 'spikes', x: alongX ? x + 1 : x, y: alongX ? y : y + 1, w: alongX ? 3 : 1, h: alongX ? 1 : 3, phase: rng.range(0, 2.5) });
        out.traps.push({ i: p.ty * W + p.tx, name: t.name, frame0: alongX ? 5 : 0, hz: hazards.length - 1 });
        k++;
        continue;
      }
      const ai = rng.pick(trapAreas);
      const r = P.rects[ai];
      const x = rng.int(r[0] + 1, r[2] - 2);
      const y = rng.int(r[1] + 1, r[3] - 2);
      if (!free(x, y, true) || !apart(x, y)) continue;
      // (walked over: it is in the floor, or a jar on it; the beat bites whoever stands on its tile)
      const p = put(t.name, x, y, false, 0);
      hazards.push({ kind: 'spikes', x, y, w: 1, h: 1, phase: rng.range(0, 2.5) });
      out.traps.push({ i: p.ty * W + p.tx, name: t.name, frame0: 0, hz: hazards.length - 1 });
      k++;
    }
  }

  // ---- THE HOUSE FRONTS: wall pieces at their feet, on the street's side, a few tiles apart; bunting most by the squares
  {
    const feet: [number, number][] = [];
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      if (!floorAt(x, y) || inHouse(x, y) || taken[y * W + x]) continue;
      if (!floorAt(x, y - 1) || !floorAt(x - 1, y)) feet.push([x, y]);
    }
    rng.shuffle(feet);
    const laid: [number, number][] = [];
    const want = Math.round(feet.length / 6);
    for (const [x, y] of feet) {
      if (laid.length >= want) break;
      if (laid.some(([a, b]) => Math.abs(a - x) + Math.abs(b - y) < 3)) continue;
      const ai = areaOf(x, y);
      const square = ai >= 0 && P.kinds[ai] !== 'gate';
      const roll = rng.next();
      const pick: [string, number] = square
        ? roll < 0.34 ? ['festival bunting', 0] : roll < 0.52 ? ['wall lantern', rng.int(0, 1)] : roll < 0.64 ? ['paper lanterns', 0] : roll < 0.78 ? ['guild sign, blotted', rng.int(0, 3)] : roll < 0.88 ? ["the Silent Order's banner", 0] : ['blank proclamations, pasted', 0]
        : roll < 0.2 ? ['wall lantern', rng.chance(0.8) ? rng.int(0, 1) : 2] : roll < 0.34 ? ['washing on a line', 0] : roll < 0.5 ? ["a house's door", rng.int(0, 2)] : roll < 0.62 ? ['blank proclamations, pasted', 0] : roll < 0.74 ? ['guild sign, blotted', rng.int(0, 3)] : roll < 0.84 ? ["the Silent Order's banner", 0] : roll < 0.92 ? ['paper lanterns', rng.int(0, 1)] : ['festival bunting', 0];
      if (onWall(pick[0], x, y, pick[1])) laid.push([x, y]);
    }
  }

  // ---- WHAT IS REACHED FROM THE START, last: every bell's place, the boss, the way on, every house's room; anything solid that
  // cuts one off taken away again (the last laid first)
  L.props.push(...props);
  const musts: number[] = [];
  const tileOf = (x: number, y: number): number => Math.floor(y) * W + Math.floor(x);
  if (bells) {
    for (const b of [bells.muffled, ...bells.bells]) {
      // (a bell's tile is solid: a tile of floor beside it)
      const tx = Math.floor(b.x);
      const ty = Math.floor(b.y);
      const side = [[0, 1], [1, 0], [0, -1], [-1, 0]].map(([a, c]) => (ty + c) * W + tx + a).find((i) => L.walk[i] === 1);
      if (side !== undefined) musts.push(side);
    }
  }
  if (f.boss) musts.push(tileOf(f.boss.x, f.boss.y));
  musts.push(tileOf(land.exit.x, land.exit.y));
  for (const h of houses) {
    const F = h.front;
    musts.push(F.along === 'x' ? (F.at - 1) * W + F.door[0] : F.door[0] * W + F.at - 1);
  }
  const reached = (): boolean => {
    const seen = new Uint8Array(W * H);
    const s0 = tileOf(f.start.x, f.start.y);
    const q = [s0];
    seen[s0] = 1;
    while (q.length) {
      const i = q.pop()!;
      const x = i % W;
      for (const j of [i + 1, i - 1, i + W, i - W]) {
        if (j < 0 || j >= W * H || seen[j] || L.walk[j] !== 1) continue;
        if ((j === i + 1 && x === W - 1) || (j === i - 1 && x === 0)) continue;
        seen[j] = 1;
        q.push(j);
      }
    }
    return musts.every((i) => seen[i] === 1);
  };
  while (!reached() && solids.length) {
    const p = solids.pop()!;
    // (the gate and the bells stay: they are never in a way)
    if (p.name === GW_NAMES.gate || p.name === GW_NAMES.muffled || p.name === GW_NAMES.shrine || p.name === GW_NAMES.watch) continue;
    L.props.splice(L.props.indexOf(p), 1);
    L.walk[p.ty * W + p.tx] = 1;
    const t = out.traps.findIndex((q) => q.i === p.ty * W + p.tx);
    if (t >= 0) out.traps.splice(t, 1);
  }
  // (a trap whose piece was taken away bites no more)
  const live = hazards.filter((_, n) => out.traps.some((t) => t.hz === n));
  out.traps = out.traps.map((t) => ({ ...t, hz: live.indexOf(hazards[t.hz]) + (f.hazards?.length ?? 0) }));
  if (live.length) {
    f.hazards = [...(f.hazards ?? []), ...live];
    L.hazards = makeHazards(f);
  }
  return out;
}
