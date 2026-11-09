// ACT 1: THE MAP-MAKER OF THE OUTDOOR FLOORS (6 to 10). A floor of the descent is not a dungeon of rooms and
// corridors: it is open ground, laid as SHAPES (open areas, and the ways between them) and then its tiles
// taken from the shapes, whole or a half each (the game walks by today's tiles, 32 by 16 with their halves:
// his pick of 12 Oct 2026, 18:33, "Yeah I really like the rounded edges", the edge painted round over them
// by art/terrain.ts).
//
// HIS WORDS FOR THE SHAPES (the project's claude/act1_descent.md):
//   6 THE QUARRY (13 Oct, to the planning chat's second Quarry, "Yes, this is it"): very open: one great pit
//     floor with the next pit opening broadly off it, the rock pushed to the edges; a narrow cut down to the
//     next terrace. 12 Oct, 18:56: "I’d like the quarry and forest to be mostly open with minimal narrow paths
//     between open areas".
//   7 THE LEDGE ROAD (13 Oct, to the art chat): "My vision was it looks like your on a cliff side trail with
//     cliff on top and bottom.  When you make a northwest turn, the sky would open up, it’s like your going
//     around the mountain"; 20:59: "Or we can just have the trail sort of work out one direction primarily,
//     then have the boss area be on some peak where we can see the city"; his pick, "Mostly one way, views at
//     turns (Recommended)".
//   8 ECHO CANYON (12 Oct, his pick by 20:35): the canyon runs up the screen mostly, a cliff on the left and
//     the right and none in front; where it turns across, the near wall cut away, its shadow on the sand, and
//     rock pillars along it seen through.
//   9 THE PINEWOOD (13 Oct, 08:19): "I’d like the forest to be very open.  Really big open areas that cross
//     the river on little bridges"; 12 Oct, 18:56: "The forest and the swamp don’t really have walls".
//   10 THE SUNKEN FEN: no walls; dark water, mud islands, boardwalks between; the arena a sunken ruin, a ring
//     of old paving round a deep pool (the art chat's EYE_POOL and EYE_RING, his word of 15 Oct: "The ring
//     should be bigger" and "it just needs to be wider for more movement").
// AND FOR EVERY FLOOR (17:21 on 12 Oct): "K I’d like at add side areas to each level.  Always 1, never more
// than two.  A cultist stronghold." Each stronghold is a yard off the main way with the cult's gate in its
// back wall; what is inside is a hall of its own, laid here too, far off from the open ground (the screen
// there shows the hall as a dungeon's room in the dark, as his yes of 13 Oct to the redoubt's last room).
//
// WHAT COMES OUT is a Floor as the rest of the game knows one (its tiles, its rooms, its packs, its props,
// where the hero starts and the boss waits) and a Land: what only the outdoor floors have (the drop, the
// river, the boardwalks, the strongholds), for the painter of the ground and for the rules that are theirs.
// Everything is by the floor's own dice: the same depth and seed give the same floor, here and in the worker.

import { F8F9_FIX, squareBridge } from './f8f9';
import { RNG } from '../engine/rng';
import { COLOSSUS, onStoneOrJetty, stoneToWorld, worldToStone } from './colossus_fight';
import type { StoneAt } from './colossus_fight';
import { act1Def } from './act1';
import { act1Pack } from './act1_mobs';
import { isAct2Land } from './act1';
import type { Act1LandKind, LandKind } from './act1';
import type { Act2Land } from './act2_types';
import { CUT_FAR, CUT_LEFT, CUT_NEAR, CUT_RIGHT, T_FLOOR, T_PIT, T_WALL } from './types';
import type { Floor, MonsterKind, PackSpot, PropSpot, Room, RoomKind } from './types';

// ---------------------------------------------------------------------------------------------------
// Shapes

/** An open area: an ellipse, its edge wandering by `wob`. */
export interface Blob {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rot: number;
  wob: number;
  seed: number;
}
/** A way between areas: a line through its points, `w` tiles wide. */
export interface Lane {
  pts: [number, number][];
  w: number;
}

/** Steady noise in 0..1 (a cell a unit), for the edges' wander. */
function noise(x: number, y: number, k: number): number {
  const h = (a: number, b: number): number => {
    let v = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(k | 0, 2147483647)) | 0;
    v = Math.imul(v ^ (v >>> 13), 1274126177);
    return ((v ^ (v >>> 16)) >>> 0) / 4294967296;
  };
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = h(xi, yi);
  const b = h(xi + 1, yi);
  const c = h(xi, yi + 1);
  const d = h(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/** How far into a blob world (x, y) is: below 1 inside. */
export function blobDist(b: Blob, x: number, y: number): number {
  const c = Math.cos(b.rot);
  const s = Math.sin(b.rot);
  const u = ((x - b.x) * c + (y - b.y) * s) / b.rx;
  const v = (-(x - b.x) * s + (y - b.y) * c) / b.ry;
  const d = Math.hypot(u, v);
  const a = Math.atan2(v, u);
  const w = b.wob ? 1 + b.wob * (noise(Math.cos(a) * 1.6 + b.seed, Math.sin(a) * 1.6, 77) - 0.5) * 2 : 1;
  return d / w;
}
export function segDist(x: number, y: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const l2 = dx * dx + dy * dy;
  const t = l2 > 0 ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l2)) : 0;
  return Math.hypot(x - ax - t * dx, y - ay - t * dy);
}
/** How far from a lane's middle line world (x, y) is. */
export function laneDist(l: Lane, x: number, y: number): number {
  let d = Infinity;
  const p = l.pts;
  for (let i = 0; i + 1 < p.length; i++) d = Math.min(d, segDist(x, y, p[i][0], p[i][1], p[i + 1][0], p[i + 1][1]));
  if (p.length === 1) d = Math.hypot(x - p[0][0], y - p[0][1]);
  return d;
}

// World ways, in the screen's words (engine/iso.ts: x runs down to the right on the screen, y down to the left)
const DEG = Math.PI / 180;
/** World headings (radians) of the screen's ways. */
export const UP = 225 * DEG;
export const DOWN = 45 * DEG;
export const LEFT = 135 * DEG;
export const RIGHT = 315 * DEG;
/** A world point a heading and distance from another. */
export const along = (x: number, y: number, a: number, d: number): [number, number] => [x + Math.cos(a) * d, y + Math.sin(a) * d];
/** How far down the screen a world point is (the depth the game sorts by). */
const downOf = (x: number, y: number): number => x + y;

// ---------------------------------------------------------------------------------------------------
// What comes out

/** A cult stronghold (his word of 12 Oct, 17:21): its yard and gate on the open ground, and its hall inside. */
export interface Hold {
  /** Which of the floor's (0 or 1). */
  n: number;
  /** The foot of its gate, on the back line of its yard (a tile corner: the gate stands over (gx-1, gy) and (gx, gy)), and which way its yard lies (+1 toward greater y, its door turned to the screen's lower left; the gate's back wall runs along x). */
  gx: number;
  gy: number;
  /** The altar of the words before it (world). */
  altar: { x: number; y: number };
  /** The yard: a room of the floor's (Room.id); and where the guards stand. */
  yard: number;
  guards: { x: number; y: number }[];
  /** The hall inside: its room, its rectangle of floor, where the hero comes in (and goes out by), and where its last fight stands. */
  hall: number;
  inside: { x: number; y: number; w: number; h: number };
  entry: { x: number; y: number };
  fight: { x: number; y: number };
  /** (HOLD_HALLWAY) The little hallway into the hall: its floor, out from the middle of the hall's near side; he comes in at its far end, and goes out by it. */
  way?: { x: number; y: number; w: number; h: number };
}

/**
 * A LITTLE HALLWAY INTO EACH STRONGHOLD'S HALL. His words, 7 Nov 2026, 00:05 (Eastern): “add a little halway to strongholds”;
 * as the Stoker's arena was given one at his word of 6 Nov, 16:29 (game/furnace_arena.ts). So, `on`: through the door he comes in
 * at the far end of a short hallway (`long` tiles, `wide` across), open into the hall at the middle of its near side; the
 * threshold he goes out by is at the hallway's far end. ON at his word: shown its pictures, asked “Put it in the game?”, by
 * 06:41, 7 Nov 2026: “Yes, put it in (Recommended)”.
 */
export const HOLD_HALLWAY = { on: true, long: 4, wide: 3 };

/** Is (x, y) in a stronghold's hall or its hallway, `m` tiles round them counted in. */
export function inHold(q: Hold, x: number, y: number, m = 1): boolean {
  const inRect = (r: { x: number; y: number; w: number; h: number }): boolean => x >= r.x - m && y >= r.y - m && x <= r.x + r.w + m && y <= r.y + r.h + m;
  return inRect(q.inside) || (!!q.way && inRect(q.way));
}

/** Is tile (tx, ty) one of a stronghold's hall's or hallway's own, or a wall round them (what is drawn while he is in it)? */
export function holdShows(q: Hold, tx: number, ty: number): boolean {
  const r = q.inside;
  if (tx >= r.x - 1 && ty >= r.y - 1 && tx <= r.x + r.w && ty <= r.y + r.h) return true;
  const w = q.way;
  return !!w && tx >= w.x - 1 && ty >= w.y - 1 && tx <= w.x + w.w && ty <= w.y + w.h;
}

/** A bridge over the Pinewood's river: its tiles (whole floor), along x or along y. */
export interface Bridge {
  tiles: number[];
  alongX: boolean;
  /**
   * (F8F9_FIX, game/f8f9.ts: his “The bridges don’t line up but they also just look bad.”) A bridge laid square to the stream,
   * drawn whole by the art (art/f8f9.ts) in place of its tiles' planks: its middle (world), its axis's angle (world radians), its
   * length and width (tiles). Absent: the bridge of before, its tiles planked one by one.
   */
  x?: number;
  y?: number;
  ang?: number;
  len?: number;
  wide?: number;
}

/** (ACT 2, THE HUSH: what only its floors have, game/act2_types.ts) */
export interface Land extends Act2Land {
  kind: LandKind;
  depth: number;
  seed: number;
  /** THE LEDGE ROAD: 1 for every tile that is not floor and falls away (the drop); others are the mountain. */
  drop?: Uint8Array;
  /** THE LEDGE ROAD and the Fen: the far side opens to the sky (its horizon fixed on the screen, the sky sliding slower than the ground). */
  sky?: boolean;
  /** THE PINEWOOD: the river's middle line; the trails' middle lines (the main way); the bridges; how sick the ground is from where (the share of the way to the end) to the end. */
  river?: [number, number][];
  trails?: [number, number][][];
  bridges?: Bridge[];
  sickFrom?: number;
  /** The main way's middle line, start to boss (for how sick the ground is, and for the dressing). */
  way: [number, number][];
  /** THE FEN: the boardwalks' tiles (over the water); the ruin's ring and the Eye's pool (world, tiles; their axes along the screen: rx across, ry up and down). */
  boards?: number[];
  ring?: { x: number; y: number; rx: number; ry: number };
  pool?: { x: number; y: number; rx: number; ry: number };
  /** THE SWAMP COLOSSUS'S STONE (COLOSSUS on): where it is (its middle); and the landing on the boss's ground the hero is carried to it from. */
  stone?: StoneAt;
  landing?: { x: number; y: number };
  /** The open areas (for the dressing and the packs): each its blob and its room. */
  areas: { blob: Blob; room: number; role: AreaRole }[];
  /** The ways between them. */
  lanes: Lane[];
  /** The strongholds. */
  holds: Hold[];
  /** Where the way on (down to the next floor) opens when the boss dies: the far end of the boss's area (world). */
  exit: { x: number; y: number };
  /** Where the hero comes in (and the floor's waypoint stands, beside it). */
  arrive: { x: number; y: number };
}

export type AreaRole = 'start' | 'path' | 'boss' | 'side' | 'lair' | 'yard';

// ---------------------------------------------------------------------------------------------------
// The tiles of shapes: each tile whole, one of its four halves, or rock, whichever is least wrong.

const SUB = 6;
const OPTIONS: [number, (u: number, v: number) => boolean][] = [
  [-1, () => false],
  [0, () => true],
  [CUT_RIGHT, (u, v) => v > u],
  [CUT_LEFT, (u, v) => u > v],
  [CUT_NEAR, (u, v) => u + v < 1],
  [CUT_FAR, (u, v) => u + v > 1],
];

/** Lay tiles from a shape; `whole` says where a tile must be whole floor (a bridge, a yard), `never` where it must be rock. */
export function layTiles(w: number, h: number, inside: (x: number, y: number) => boolean, whole: (tx: number, ty: number) => boolean, never: (tx: number, ty: number) => boolean, maybe: Uint8Array): { tiles: Uint8Array; cut: Uint8Array } {
  const tiles = new Uint8Array(w * h).fill(T_WALL);
  const cut = new Uint8Array(w * h);
  const sub = new Uint8Array(SUB * SUB);
  for (let ty = 1; ty < h - 1; ty++) {
    for (let tx = 1; tx < w - 1; tx++) {
      if (never(tx, ty)) continue;
      if (whole(tx, ty)) {
        tiles[ty * w + tx] = T_FLOOR;
        continue;
      }
      if (!maybe[ty * w + tx]) continue;
      let any = 0;
      for (let a = 0; a < SUB; a++) for (let b = 0; b < SUB; b++) any += sub[a * SUB + b] = inside(tx + (a + 0.5) / SUB, ty + (b + 0.5) / SUB) ? 1 : 0;
      if (any === 0) continue;
      if (any === SUB * SUB) {
        tiles[ty * w + tx] = T_FLOOR;
        continue;
      }
      let best = 0;
      let least = Infinity;
      for (let k = 0; k < OPTIONS.length; k++) {
        const fn = OPTIONS[k][1];
        let wrong = 0;
        for (let a = 0; a < SUB; a++) for (let b = 0; b < SUB; b++) if (fn((a + 0.5) / SUB, (b + 0.5) / SUB) !== (sub[a * SUB + b] === 1)) wrong++;
        if (wrong < least - 0.5) {
          least = wrong;
          best = k;
        }
      }
      const c = OPTIONS[best][0];
      if (c >= 0) {
        tiles[ty * w + tx] = T_FLOOR;
        cut[ty * w + tx] = c;
      }
    }
  }
  return { tiles, cut };
}

/** Whole floor tiles reached from tile `from` by side steps (cut tiles count as floor if `cuts`). */
export function reach(w: number, h: number, tiles: Uint8Array, cut: Uint8Array, from: number, cuts: boolean): Uint8Array {
  const seen = new Uint8Array(w * h);
  const q = [from];
  seen[from] = 1;
  const ok = (i: number): boolean => tiles[i] === T_FLOOR && (cuts || cut[i] === 0);
  if (!ok(from)) return seen;
  while (q.length) {
    const i = q.pop()!;
    const x = i % w;
    const y = (i - x) / w;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const j = ny * w + nx;
      if (seen[j] || !ok(j)) continue;
      // (a diagonal-free walk: the game's walk grid has cut tiles shut, so whole tiles must join by sides)
      seen[j] = 1;
      q.push(j);
    }
  }
  return seen;
}

// ---------------------------------------------------------------------------------------------------
// THE PLAN: open areas and the ways between them

// (ACT 2, THE HUSH: what a plan is made of, and the makings of one below (Area, Plan, radiusOf, clear, wander, ChainOpts,
// planChain; along, MARGIN, cross, farEnd), exported for floor 13's map-maker, game/act2/millrace.ts, laid as the Pinewood is)
export interface Area {
  blob: Blob;
  role: AreaRole;
  path: number;
  parent: number;
  /** A circle round it, for keeping areas apart. */
  r: number;
}
export interface Plan {
  areas: Area[];
  lanes: Lane[];
  /** The main way's middle line. */
  way: [number, number][];
  /** (THE LEDGE ROAD) the trail's middle line, for which side of it is the drop. */
  trail?: [number, number][];
  holds: { yard: number; gx: number; gy: number }[];
  /** (planMassive) The share of its areas' summed size that is ground of its own (they overlap): their packs counted by it. */
  packShare?: number;
  /** (planMassive) How much of one of the floor's old open areas (laid one after another) each of its shapes stands for: the floor's things that were so many to an area, so many to it. */
  areaShare?: number;
  /** (planMassive) Lines along the one massive ground either side of its middle: bridged where they meet water, as the way is. */
  along?: [number, number][][];
  /** Extra shapes taken out of the floor (the Fen's pool), and put in (the Fen's boardwalks, the Pinewood's bridges). */
}

export const radiusOf = (b: Blob): number => Math.max(b.rx, b.ry) * (1 + b.wob);

/** Is a new area at `b` clear of every area but `except` by `gap`, and is the lane to it clear of them? */
export function clear(areas: readonly Area[], b: Blob, gap: number, except: readonly number[], lane: Lane | null): boolean {
  const r = radiusOf(b);
  for (let i = 0; i < areas.length; i++) {
    if (except.includes(i)) continue;
    const a = areas[i];
    if (Math.hypot(a.blob.x - b.x, a.blob.y - b.y) < a.r + r + gap) return false;
    if (lane && laneDist(lane, a.blob.x, a.blob.y) < a.r + lane.w / 2 + gap * 0.6) return false;
  }
  return true;
}

/** A wandering lane from one point to another, `w` wide: a few bends off the straight line. */
export function wander(rng: RNG, ax: number, ay: number, bx: number, by: number, w: number, bend: number): Lane {
  const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / 5));
  const pts: [number, number][] = [[ax, ay]];
  const nx = -(by - ay);
  const ny = bx - ax;
  const len = Math.hypot(nx, ny) || 1;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const off = (rng.next() - 0.5) * 2 * bend;
    pts.push([ax + (bx - ax) * t + (nx / len) * off, ay + (by - ay) * t + (ny / len) * off]);
  }
  pts.push([bx, by]);
  return { pts, w };
}

export interface ChainOpts {
  count: number;
  /** The way the chain goes, and how far each step may turn from it (radians). */
  heading: number;
  spread: number;
  turn: number;
  size: (rng: RNG, role: AreaRole) => { rx: number; ry: number; wob: number };
  /** The share of joins that are broad (the areas overlap) rather than a narrow way. */
  broad: number;
  laneW: number;
  laneLong: [number, number];
  gap: number;
  /** (floor 13, laid open) the boss's area joined by a way, whatever `broad` is: its ground kept to itself for the fight. */
  laneLast?: boolean;
}

/** How a floor laid as ONE MASSIVE AREA is laid (planMassive). */
export interface MassiveOpts {
  /** The way across it, from where he comes in to the boss's side (radians on the world), how far it runs and how wide (tiles). */
  heading: number;
  long: number;
  wide: number;
  /** Where he comes in and the boss's ground. */
  size: (rng: RNG, role: AreaRole) => { rx: number; ry: number; wob: number };
  /** The open ground's own shapes, overlapping: how big, how far apart, how wandering their edges. */
  cell: [number, number];
  step: number;
  wob: number;
  /** The boss's ground joined by a way this wide and long (its fight kept to itself), else opening into the ground. */
  laneLast: boolean;
  laneW: number;
  laneLong: [number, number];
}

/**
 * ONE MASSIVE AREA (his word of 1 Nov 2026, of what OPEN means: “When I say open I mean one massive area with a waypoint on one
 * side, and the boss somewhere on the other”): where he comes in on one side; then one great open ground, made of shapes
 * overlapping on a jittered grid across a rounded oblong `long` by `wide`, so that its edge wanders; and the boss's ground on
 * the far side. The ground's shapes are areas of the main way in the order they lie along it (its packs counted by the ground
 * they really cover: Plan.packShare).
 */
export function planMassive(rng: RNG, o: MassiveOpts): Plan {
  const areas: Area[] = [];
  const lanes: Lane[] = [];
  const way: [number, number][] = [];
  const cos = Math.cos(o.heading);
  const sin = Math.sin(o.heading);
  // (a point `u` along the way and `v` across it, in the world)
  const at = (u: number, v: number): [number, number] => [u * cos - v * sin, u * sin + v * cos];
  const s0 = o.size(rng, 'start');
  const b0: Blob = { x: 0, y: 0, rx: s0.rx, ry: s0.ry, rot: rng.range(0, Math.PI), wob: s0.wob, seed: rng.int(0, 9999) };
  areas.push({ blob: b0, role: 'start', path: 0, parent: -1, r: radiusOf(b0) });
  way.push([0, 0]);
  // THE GROUND: from just past where he comes in to `long`, `wide` across, its corners rounded off
  const u0 = radiusOf(b0) * 0.6;
  const mid = (u0 + o.long) / 2;
  const half = (o.long - u0) / 2;
  const cells: { u: number; b: Blob }[] = [];
  for (let u = u0; u <= o.long + 0.01; u += o.step) {
    for (let v = -o.wide / 2; v <= o.wide / 2 + 0.01; v += o.step) {
      const ju = u + rng.range(-0.3, 0.3) * o.step;
      const jv = v + rng.range(-0.3, 0.3) * o.step;
      // (an oblong with its corners rounded: a super-ellipse)
      const e = Math.pow(Math.abs(ju - mid) / (half + o.step * 0.3), 4) + Math.pow(Math.abs(jv) / (o.wide / 2 + o.step * 0.3), 4);
      if (e > 1) continue;
      const r = rng.range(o.cell[0], o.cell[1]);
      const [x, y] = at(ju, jv);
      cells.push({ u: ju, b: { x, y, rx: r, ry: r * rng.range(0.8, 1), rot: rng.range(0, Math.PI), wob: o.wob, seed: rng.int(0, 9999) } });
    }
  }
  cells.sort((p, q) => p.u - q.u);
  let sum = 0;
  cells.forEach((c, k) => {
    areas.push({ blob: c.b, role: 'path', path: k + 1, parent: k, r: radiusOf(c.b) });
    sum += Math.PI * c.b.rx * c.b.ry;
  });
  for (let u = u0; u <= o.long; u += o.step) way.push(at(u, 0));
  const alongs: [number, number][][] = [-0.3, 0.3].map((f) => {
    const line: [number, number][] = [];
    for (let u = u0; u <= o.long; u += o.step) line.push(at(u, f * o.wide));
    return line;
  });
  // (the ground they cover together, counted on a coarse grid)
  let cover = 0;
  for (let u = u0 - o.cell[1]; u <= o.long + o.cell[1]; u += 1) {
    for (let v = -o.wide / 2 - o.cell[1]; v <= o.wide / 2 + o.cell[1]; v += 1) {
      const [x, y] = at(u, v);
      if (cells.some((c) => Math.abs(c.b.x - x) < c.b.rx * 1.6 && Math.abs(c.b.y - y) < c.b.rx * 1.6 && blobDist(c.b, x, y) < 1)) cover++;
    }
  }
  // THE BOSS'S GROUND on the far side
  const sb = o.size(rng, 'boss');
  const rB = Math.max(sb.rx, sb.ry);
  const uB = o.long + (o.laneLast ? rB + rng.range(o.laneLong[0], o.laneLong[1]) + o.cell[0] * 0.5 : rB * 0.4);
  const [bx, by] = at(uB, rng.range(-0.15, 0.15) * o.wide);
  const bb: Blob = { x: bx, y: by, rx: sb.rx, ry: sb.ry, rot: rng.range(0, Math.PI), wob: sb.wob, seed: rng.int(0, 9999) };
  areas.push({ blob: bb, role: 'boss', path: cells.length + 1, parent: cells.length, r: radiusOf(bb) });
  if (o.laneLast) lanes.push(wander(rng, ...at(o.long - o.cell[0] * 0.5, (by * cos - bx * sin) * 0.5), ...along(bx, by, o.heading + Math.PI, rB * 0.6), o.laneW, 0.6));
  way.push([bx, by]);
  // (an old open area's size, as the floor's own sizes have it, by dice of their own)
  const sr = new RNG(0x0a4ea);
  let old = 0;
  for (let k = 0; k < 16; k++) {
    const z = o.size(sr, 'path');
    old += (Math.PI * z.rx * z.ry) / 16;
  }
  return { areas, lanes, way, holds: [], packShare: sum > 0 ? Math.min(1, cover / sum) : 1, areaShare: cells.length ? cover / old / cells.length : 1, along: alongs };
}

/**
 * (planMassive) A place set off the edge of one massive ground: `b` moved on from `from` along `ang` (from `d0` tiles) until it is
 * `gap` tiles clear of every area (`pathGap` of the ground's own: less than nothing to open into it), then hosted by the
 * ground's area nearest it. The host, and the way from it to `b`.
 */
export function offEdge(plan: Plan, b: Blob, from: Blob, ang: number, d0: number, gap: number, pathGap: number): { host: number; ang: number } {
  const r = radiusOf(b);
  const clearOf = (): boolean => plan.areas.every((o) => Math.hypot(o.blob.x - b.x, o.blob.y - b.y) >= o.r + r + (o.role === 'path' ? pathGap : gap));
  let d = d0;
  [b.x, b.y] = along(from.x, from.y, ang, d);
  while (d < d0 + 80 && !clearOf()) {
    d += 1.5;
    [b.x, b.y] = along(from.x, from.y, ang, d);
  }
  let host = 0;
  let best = Infinity;
  plan.areas.forEach((o, i) => {
    const e = Math.hypot(o.blob.x - b.x, o.blob.y - b.y) - o.r;
    if (o.role === 'path' && e < best) {
      best = e;
      host = i;
    }
  });
  const h = plan.areas[host].blob;
  return { host, ang: Math.atan2(b.y - h.y, b.x - h.x) };
}

/** (planMassive) `b` clear of every area as offEdge set it, and its path in clear of all but the ground's own areas. */
export function edgeClear(plan: Plan, b: Blob, gap: number, pathGap: number, lane: Lane): boolean {
  const r = radiusOf(b);
  return plan.areas.every((o) => Math.hypot(o.blob.x - b.x, o.blob.y - b.y) >= o.r + r + (o.role === 'path' ? pathGap : gap) - 0.01 && (o.role === 'path' || laneDist(lane, o.blob.x, o.blob.y) >= o.r + lane.w / 2 + gap * 0.6));
}

/**
 * ONE MASSIVE AREA on the descent's open floors (his picks of 1 Nov 2026: the Quarry, floor 6, and the Pinewood, floor 9, open;
 * the Fen, floor 10, kept as it is: “10 should be okay, I like the islands in the swamp with bridges in between.  The rest can
 * change”): which floors, and each one's ground (planMassive).
 */
export const A1_OPEN: { on: Act1LandKind[] } & Partial<Record<Act1LandKind, { long: number; wide: number; cell: [number, number]; step: number; wob: number }>> = {
  on: ['quarry', 'pine'],
  quarry: { long: 48, wide: 23, cell: [5.5, 7], step: 6, wob: 0.2 },
  pine: { long: 76, wide: 34, cell: [6.5, 8.5], step: 7, wob: 0.22 },
};

/** A chain of open areas from the start to the boss's, each joined to the last. */
export function planChain(rng: RNG, o: ChainOpts): Plan | null {
  const areas: Area[] = [];
  const lanes: Lane[] = [];
  const way: [number, number][] = [];
  let heading = o.heading;
  const first = o.size(rng, 'start');
  const b0: Blob = { x: 0, y: 0, rx: first.rx, ry: first.ry, rot: rng.range(0, Math.PI), wob: first.wob, seed: rng.int(0, 9999) };
  areas.push({ blob: b0, role: 'start', path: 0, parent: -1, r: radiusOf(b0) });
  way.push([0, 0]);
  for (let i = 1; i < o.count; i++) {
    const role: AreaRole = i === o.count - 1 ? 'boss' : 'path';
    let placed = false;
    for (let tries = 0; tries < 40 && !placed; tries++) {
      const prev = areas[areas.length - 1];
      const sz = o.size(rng, role);
      const turnTo = heading + (rng.next() - 0.5) * 2 * o.turn;
      const h = Math.max(o.heading - o.spread, Math.min(o.heading + o.spread, turnTo));
      const rNew = Math.max(sz.rx, sz.ry);
      const rOld = Math.max(prev.blob.rx, prev.blob.ry);
      const broad = !(o.laneLast && role === 'boss') && rng.chance(o.broad);
      const d = broad ? (rOld + rNew) * rng.range(0.62, 0.8) : rOld + rNew + rng.range(o.laneLong[0], o.laneLong[1]);
      const [x, y] = along(prev.blob.x, prev.blob.y, h, d);
      const b: Blob = { x, y, rx: sz.rx, ry: sz.ry, rot: rng.range(0, Math.PI), wob: sz.wob, seed: rng.int(0, 9999) };
      const lane = broad ? null : wander(rng, ...along(prev.blob.x, prev.blob.y, h, rOld * 0.6), ...along(x, y, h + Math.PI, rNew * 0.6), o.laneW, 1.2);
      if (!clear(areas, b, o.gap, [areas.length - 1], lane)) continue;
      areas.push({ blob: b, role, path: i, parent: areas.length - 1, r: radiusOf(b) });
      if (lane) lanes.push(lane);
      way.push([x, y]);
      heading = h;
      placed = true;
    }
    if (!placed) return null;
  }
  return { areas, lanes, way, holds: [] };
}

/** A side area off one of the chain's (not the start's, not the boss's): a reward, a lair, or a stronghold's yard. */
function growSide(rng: RNG, plan: Plan, role: AreaRole, size: { rx: number; ry: number; wob: number }, laneW: number, gap: number, prefer?: (a: number) => number): number {
  const hosts = plan.areas.map((a, i) => i).filter((i) => plan.areas[i].role === 'path' || (plan.areas[i].role === 'start' && role !== 'yard'));
  let best: { b: Blob; lane: Lane; host: number; score: number } | null = null;
  for (let tries = 0; tries < 80; tries++) {
    let host = rng.pick(hosts);
    let a = plan.areas[host];
    let ang = rng.range(0, Math.PI * 2);
    let rA = Math.max(a.blob.rx, a.blob.ry);
    const rB = Math.max(size.rx, size.ry);
    const d = rA + rB + rng.range(3, 7);
    const [x0, y0] = along(a.blob.x, a.blob.y, ang, d);
    const b: Blob = { x: x0, y: y0, rx: size.rx, ry: size.ry, rot: role === 'yard' ? 0 : rng.range(0, Math.PI), wob: size.wob, seed: rng.int(0, 9999) };
    const massive = plan.packShare !== undefined;
    if (massive) {
      const o = offEdge(plan, b, a.blob, ang, d, gap, gap);
      host = o.host;
      ang = o.ang;
      a = plan.areas[host];
      rA = Math.max(a.blob.rx, a.blob.ry);
    }
    const { x, y } = b;
    const lane = wander(rng, ...along(a.blob.x, a.blob.y, ang, rA * 0.6), ...along(x, y, ang + Math.PI, rB * 0.5), laneW, 0.8);
    if (massive ? !edgeClear(plan, b, gap, gap, lane) : !clear(plan.areas, b, gap, [host], lane)) continue;
    // (and clear of every lane already laid)
    if (plan.lanes.some((l) => laneDist(l, x, y) < rB + l.w / 2 + gap)) continue;
    const score = prefer ? prefer(ang) + rng.next() * 0.3 : rng.next();
    if (!best || score > best.score) best = { b, lane, host, score };
    if (!prefer && best) break;
  }
  if (!best) return -1;
  plan.areas.push({ blob: best.b, role, path: -1, parent: best.host, r: radiusOf(best.b) });
  plan.lanes.push(best.lane);
  return plan.areas.length - 1;
}

// ---------------------------------------------------------------------------------------------------
// THE FIVE FLOORS' PLANS

/** The sizes of each floor's areas (tiles, half-widths), by role. */
function sizer(kind: Act1LandKind): (rng: RNG, role: AreaRole) => { rx: number; ry: number; wob: number } {
  return (rng, role) => {
    const r = (a: number, b: number): number => rng.range(a, b);
    switch (kind) {
      case 'quarry':
        return role === 'boss' ? { rx: 9.5, ry: 8.5, wob: 0.1 } : role === 'start' ? { rx: 6, ry: 5, wob: 0.12 } : { rx: r(7, 10), ry: r(5.5, 8), wob: 0.16 };
      case 'ledge':
        return role === 'boss' ? { rx: 7.5, ry: 6, wob: 0.1 } : { rx: r(3.4, 4.6), ry: r(2.6, 3.4), wob: 0.14 };
      case 'canyon':
        return role === 'boss' ? { rx: 8, ry: 7, wob: 0.1 } : role === 'start' ? { rx: 4.5, ry: 4, wob: 0.12 } : { rx: r(4.5, 6.5), ry: r(3.5, 5), wob: 0.18 };
      case 'pine':
        return role === 'boss' ? { rx: 10, ry: 9, wob: 0.12 } : role === 'start' ? { rx: 8, ry: 7, wob: 0.15 } : { rx: r(10, 14), ry: r(8, 11), wob: 0.2 };
      case 'fen':
        return role === 'boss' ? { rx: 8.6, ry: 7.6, wob: 0 } : role === 'start' ? { rx: 4, ry: 3.4, wob: 0.15 } : { rx: r(3, 5.5), ry: r(2.5, 4.5), wob: 0.25 };
    }
  };
}

/**
 * The Pinewood's paths, easier to see (his words of 17 Oct, 11:37: "The thin paths through the forest are hard to see past the
 * trees maybe make them a little wider"; his yes to the game's pictures of it, 17 Oct, 19:42 (16:42 his time): “Everything looks good”): `w` tiles wide (were 3.2), and no tall tree
 * within `clear` tiles of one whose picture would stand over it (render/act1_pieces.ts; the trees on the near side, whose
 * crowns rise up the screen over the path, hid most of it however wide).
 */
export const PINE_PATH = { on: true, w: 4.6, clear: 7 };
/**
 * How many open areas on the main way, start and boss's among them (the Ledge Road: how many legs its trail has). LONGER,
 * 17 Oct 2026, the owner after playing them, 11:37: "The levels are very short in 6-7 so far"; "8-10 need to be
 * significantly longer as well". (They were: the Quarry 6, the Ledge Road 9 legs, Echo Canyon 8, the Pinewood 6, the Fen 9.)
 */
export const CHAIN: Record<Act1LandKind, number> = { quarry: 10, ledge: 15, canyon: 14, pine: 11, fen: 16 };

function planFor(kind: Act1LandKind, rng: RNG): Plan | null {
  const size = sizer(kind);
  // which way the floor goes on the screen (the game's own sense of it: across, or up)
  const across = rng.chance(0.5) ? LEFT : RIGHT;
  switch (kind) {
    case 'quarry':
      if (A1_OPEN.on.includes('quarry')) {
        const o = A1_OPEN.quarry!;
        return planMassive(rng, { heading: rng.pick([LEFT, RIGHT, UP, DOWN]) + rng.range(-0.4, 0.4), long: o.long, wide: o.wide, size, cell: o.cell, step: o.step, wob: o.wob, laneLast: true, laneW: 2.8, laneLong: [3, 6] });
      }
      return planChain(rng, { count: CHAIN.quarry, heading: rng.pick([LEFT, RIGHT, UP, DOWN]) + rng.range(-0.4, 0.4), spread: 1.2, turn: 0.75, size, broad: 0.45, laneW: 2.8, laneLong: [3, 6], gap: 3 });
    case 'canyon':
      // (up the screen, mostly; a turn across now and then: see `canyonTrail`)
      return planCanyon(rng, size);
    case 'ledge':
      return planLedge(rng, size, across);
    case 'pine':
      if (A1_OPEN.on.includes('pine')) {
        const o = A1_OPEN.pine!;
        return planMassive(rng, { heading: across + rng.range(-0.3, 0.3), long: o.long, wide: o.wide, size, cell: o.cell, step: o.step, wob: o.wob, laneLast: true, laneW: PINE_PATH.on ? PINE_PATH.w : 3.2, laneLong: [3, 7] });
      }
      // (its paths between the open areas wider than they were, 3.2: "The thin paths through the forest are hard to see past
      // the trees maybe make them a little wider", 17 Oct 2026, 11:37)
      return planChain(rng, { count: CHAIN.pine, heading: across + rng.range(-0.3, 0.3), spread: 0.9, turn: 0.6, size, broad: 0.55, laneW: PINE_PATH.on ? PINE_PATH.w : 3.2, laneLong: [3, 7], gap: 4 });
    case 'fen':
      return planChain(rng, { count: CHAIN.fen, heading: across + rng.range(-0.3, 0.3), spread: 0.9, turn: 0.8, size, broad: 0, laneW: 2, laneLong: [2, 5], gap: 3 });
  }
}

/** THE CANYON: a winding way up the screen, a hollow now and then; where it turns across, it runs across for a while. */
function planCanyon(rng: RNG, size: (rng: RNG, role: AreaRole) => { rx: number; ry: number; wob: number }): Plan | null {
  const areas: Area[] = [];
  const lanes: Lane[] = [];
  const way: [number, number][] = [];
  let x = 0;
  let y = 0;
  const s0 = size(rng, 'start');
  const b0: Blob = { x, y, rx: s0.rx, ry: s0.ry, rot: rng.range(0, Math.PI), wob: s0.wob, seed: rng.int(0, 9999) };
  areas.push({ blob: b0, role: 'start', path: 0, parent: -1, r: radiusOf(b0) });
  way.push([x, y]);
  for (let i = 1; i < CHAIN.canyon; i++) {
    const role: AreaRole = i === CHAIN.canyon - 1 ? 'boss' : 'path';
    const sz = size(rng, role);
    // (two steps in three up the screen; one in three across it, left or right)
    const h = rng.chance(0.34) ? (rng.chance(0.5) ? LEFT : RIGHT) + rng.range(-0.25, 0.25) : UP + rng.range(-0.35, 0.35);
    const prev = areas[areas.length - 1];
    const rOld = Math.max(prev.blob.rx, prev.blob.ry);
    const rNew = Math.max(sz.rx, sz.ry);
    const d = rOld + rNew + rng.range(4, 9);
    const [nx, ny] = along(prev.blob.x, prev.blob.y, h, d);
    const b: Blob = { x: nx, y: ny, rx: sz.rx, ry: sz.ry, rot: rng.range(0, Math.PI), wob: sz.wob, seed: rng.int(0, 9999) };
    const lane = wander(rng, prev.blob.x, prev.blob.y, nx, ny, rng.range(4.2, 5.4), 1.4);
    if (!clear(areas, b, 4, [areas.length - 1], lane)) return null;
    areas.push({ blob: b, role, path: i, parent: areas.length - 1, r: radiusOf(b) });
    lanes.push(lane);
    way.push([nx, ny]);
    x = nx;
    y = ny;
  }
  return { areas, lanes, way, holds: [] };
}

/**
 * THE LEDGE ROAD: a trail across the screen, mostly one way, the mountain above it and the drop below; at
 * a turn round the mountain it goes up and to the left (or right) a way, and the sky opens beyond it;
 * outcrops off its lower side for the fights; the Queen's peak at its end, the drop all round.
 */
function planLedge(rng: RNG, size: (rng: RNG, role: AreaRole) => { rx: number; ry: number; wob: number }, across: number): Plan | null {
  const areas: Area[] = [];
  const lanes: Lane[] = [];
  const trail: [number, number][] = [[0, 0]];
  let x = 0;
  let y = 0;
  // the trail's legs: mostly across, a turn up round the mountain every two or three
  const legs: number[] = [];
  const up = across === LEFT ? 180 * DEG : 270 * DEG;
  let sinceTurn = 0;
  for (let i = 0; i < CHAIN.ledge; i++) {
    if (sinceTurn >= 2 && rng.chance(0.55)) {
      legs.push(up + rng.range(-0.15, 0.15));
      sinceTurn = 0;
    } else {
      legs.push(across + rng.range(-0.2, 0.2));
      sinceTurn++;
    }
  }
  for (const h of legs) {
    const len = rng.range(9, 15);
    [x, y] = along(x, y, h, len);
    trail.push([x, y]);
  }
  const W = rng.range(3.6, 4.4);
  lanes.push({ pts: trail, w: W });
  // the start, at the trail's beginning; outcrops along its lower side; the peak past its end
  const s0 = size(rng, 'start');
  areas.push({ blob: { x: 0, y: 0, rx: s0.rx, ry: s0.ry, rot: 0, wob: s0.wob, seed: rng.int(0, 9999) }, role: 'start', path: 0, parent: -1, r: 0 });
  const way: [number, number][] = [[0, 0]];
  let path = 1;
  for (let i = 1; i < trail.length; i++) {
    // an outcrop half way along a leg, on the drop's side, every leg but the first
    if (i < 2) continue;
    const [ax, ay] = trail[i - 1];
    const [bx, by] = trail[i];
    const mx = (ax + bx) / 2;
    const my = (ay + by) / 2;
    const h = Math.atan2(by - ay, bx - ax);
    // (the drop's side: of the two sides, the one further down the screen)
    const n1 = h + Math.PI / 2;
    const n2 = h - Math.PI / 2;
    const side = downOf(Math.cos(n1), Math.sin(n1)) > downOf(Math.cos(n2), Math.sin(n2)) ? n1 : n2;
    const sz = size(rng, 'path');
    const [cx, cy] = along(mx, my, side, W / 2 + sz.ry * 0.45);
    areas.push({ blob: { x: cx, y: cy, rx: sz.rx, ry: sz.ry, rot: h, wob: sz.wob, seed: rng.int(0, 9999) }, role: 'path', path: path++, parent: areas.length - 1, r: 0 });
    way.push([mx, my]);
  }
  const [ex, ey] = trail[trail.length - 1];
  const [px, py] = trail[trail.length - 2];
  const h = Math.atan2(ey - py, ex - px);
  const sb = size(rng, 'boss');
  const [bx, by] = along(ex, ey, h, sb.rx * 0.8);
  areas.push({ blob: { x: bx, y: by, rx: sb.rx, ry: sb.ry, rot: h, wob: sb.wob, seed: rng.int(0, 9999) }, role: 'boss', path: path++, parent: areas.length - 1, r: 0 });
  way.push([bx, by]);
  for (const a of areas) a.r = radiusOf(a.blob);
  return { areas, lanes, way, trail, holds: [] };
}

// ---------------------------------------------------------------------------------------------------
// LAY A FLOOR OF THE DESCENT

/** Tiles of rock (or drop, or forest, or water) left round the open ground. */
export const MARGIN = 14;
/** The stronghold's yard: its court before the gate, as the art chat's mock-up laid it (src/dev/preview_hold.ts): 6 tiles along the gate's wall, 3 out from it. */
const COURT = { half: 3, deep: 3 };
/** A stronghold's hall inside. */
const HALL = { w: 13, h: 11 };
/** (HOLD_HALLWAY) A hall's hallway: its floor, out from the middle of its near side (greater y). */
function wayOf(r: { x: number; y: number; w: number; h: number }): { x: number; y: number; w: number; h: number } {
  const wide = HOLD_HALLWAY.wide;
  return { x: Math.round(r.x + r.w / 2 - wide / 2), y: r.y + r.h, w: wide, h: HOLD_HALLWAY.long };
}

export interface Laid {
  floor: Floor;
  land: Land;
}

/** Make floor `depth` (6 to 10) of the descent (and, ACT 2, a floor of the Hush whose own map-maker is not built yet: game/act2_layout.ts). */
export function generateAct1(depth: number, seed: number): Laid {
  const def = act1Def(depth);
  if (!def) throw new Error(`no floor of the descent at ${depth}`);
  for (let attempt = 0; attempt < 60; attempt++) {
    const out = tryAct1(def.land, depth, (seed + attempt * 7919) >>> 0);
    if (out) return out;
  }
  throw new Error(`the descent's floor ${depth} could not be laid (seed ${seed})`);
}

function tryAct1(kind: LandKind, depth: number, seed: number): Laid | null {
  const rng = new RNG(seed ^ 0x51ed270b);
  // (ACT 2: a floor of the Hush laid by this map-maker is laid as the Quarry's open areas, its own ground painted over them, and has no stronghold: its event is the Bells)
  const pk: Act1LandKind = isAct2Land(kind) ? 'quarry' : kind;
  const plan = planFor(pk, rng);
  if (!plan) return null;
  const size = sizer(pk);
  // SIDE AREAS: the strongholds (always one, never more than two: one in three floors two), a reward, a lair
  const holds = isAct2Land(kind) ? 0 : rng.chance(0.34) ? 2 : 1;
  const yards: number[] = [];
  for (let n = 0; n < holds; n++) {
    // (a yard whose gate's wall looks down the screen to the left: the yard lies off its host toward lesser y, so the gate is at its far side)
    const yard = growSide(rng, plan, 'yard', { rx: COURT.half + 1.4, ry: COURT.deep + 1.2, wob: 0.08 }, kind === 'fen' ? 2 : 2.8, 3, (a) => -Math.sin(a) * 1.2 - Math.cos(a) * 0.3);
    if (yard < 0) {
      if (n === 0) return null;
      break;
    }
    yards.push(yard);
  }
  const extra = kind === 'ledge' ? 0 : 1;
  for (let n = 0; n < extra; n++) growSide(rng, plan, 'side', size(rng, 'path'), kind === 'fen' ? 2 : 2.8, 3);
  if (depth >= 7 && kind !== 'ledge') growSide(rng, plan, 'lair', { rx: 4.5, ry: 4, wob: 0.12 }, kind === 'fen' ? 2 : 2.8, 3);

  // THE BOUNDS: everything moved so the open ground starts MARGIN tiles in; the halls inside laid beyond it
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  const grow = (x: number, y: number, r: number): void => {
    x0 = Math.min(x0, x - r);
    y0 = Math.min(y0, y - r);
    x1 = Math.max(x1, x + r);
    y1 = Math.max(y1, y + r);
  };
  for (const a of plan.areas) grow(a.blob.x, a.blob.y, a.r + 1);
  for (const l of plan.lanes) for (const [x, y] of l.pts) grow(x, y, l.w);
  // (the Fen's ring is bigger than its blob says: it is laid to the Eye's own sizes)
  const dx = MARGIN - Math.floor(x0);
  const dy = MARGIN - Math.floor(y0);
  const shift = (p: { x: number; y: number }): void => {
    p.x += dx;
    p.y += dy;
  };
  for (const a of plan.areas) shift(a.blob);
  for (const l of plan.lanes) for (const p of l.pts) {
    p[0] += dx;
    p[1] += dy;
  }
  for (const p of [...plan.way, ...(plan.along ?? []).flat()]) {
    p[0] += dx;
    p[1] += dy;
  }
  if (plan.trail && plan.trail !== plan.lanes[0].pts) for (const p of plan.trail) {
    p[0] += dx;
    p[1] += dy;
  }
  const openW = Math.ceil(x1 - x0) + 2 * MARGIN;
  const openH = Math.ceil(y1 - y0) + 2 * MARGIN;
  // the halls inside, in a row beyond the open ground's far-right edge (along x), far enough that the screen there shows only the hall
  const hallX = openW + 4;
  // (THE SWAMP COLOSSUS, game/colossus_fight.ts, behind COLOSSUS: floor 10's stone, an island of its own beyond the halls, the
  // water all round it)
  const stoneOn = kind === 'fen' && COLOSSUS.on;
  const stoneX = hallX + yards.length * (HALL.w + 30) + 6;
  const W = stoneX + (stoneOn ? STONE_ROOM : 0);
  const H = Math.max(openH, HALL.h + 30, stoneOn ? STONE_ROOM : 0);
  const stoneAt: StoneAt | null = stoneOn ? { cx: stoneX + STONE_ROOM / 2, cy: Math.round(H / 2) } : null;

  // THE YARDS' GATES: on each yard's far side (toward lesser y), its court laid square to the gate's wall
  const holdsAt: { yard: number; gx: number; gy: number }[] = [];
  for (const yi of yards) {
    const b = plan.areas[yi].blob;
    const gx = Math.round(b.x);
    const gy = Math.round(b.y - COURT.deep / 2 - 0.5);
    holdsAt.push({ yard: yi, gx, gy });
  }
  const inCourt = (tx: number, ty: number): boolean => holdsAt.some((h) => tx >= h.gx - COURT.half && tx < h.gx + COURT.half && ty >= h.gy && ty < h.gy + COURT.deep);
  // (behind a gate, rock: nothing of the open ground comes within its towers' reach)
  const behindGate = (x: number, y: number): boolean => holdsAt.some((h) => Math.abs(x - h.gx) < COURT.half + 1.6 && y < h.gy + 0.3 && y > h.gy - 7);

  // THE SHAPE OF THE OPEN GROUND
  const fenPool = kind === 'fen' && !stoneOn ? poolOf(plan) : null;
  // (each area's circle and each lane's box, beyond which nothing of it can be: asked first, so that the shape of a long
  // floor is quick to lay; the shape is the same to the tile)
  const reachOf = plan.areas.map((a) => radiusOf(a.blob));
  const boxOf = plan.lanes.map((l) => {
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const [px, py] of l.pts) {
      x0 = Math.min(x0, px);
      y0 = Math.min(y0, py);
      x1 = Math.max(x1, px);
      y1 = Math.max(y1, py);
    }
    const r = l.w / 2;
    return [x0 - r, y0 - r, x1 + r, y1 + r] as const;
  });
  const inside = (x: number, y: number): boolean => {
    if (stoneAt && x >= stoneX) return onStoneOrJetty(worldToStone(stoneAt, x, y));
    if (x >= openW - 2) return false;
    if (behindGate(x, y)) return false;
    if (fenPool && fenPool.pool(x, y)) return false;
    for (let i = 0; i < plan.areas.length; i++) {
      const b = plan.areas[i].blob;
      const dx = x - b.x;
      const dy = y - b.y;
      if (dx * dx + dy * dy >= reachOf[i] * reachOf[i]) continue;
      if (blobDist(b, x, y) < 1) return true;
    }
    if (fenPool && fenPool.ring(x, y)) return true;
    for (let i = 0; i < plan.lanes.length; i++) {
      const bx = boxOf[i];
      if (x < bx[0] || y < bx[1] || x > bx[2] || y > bx[3]) continue;
      const l = plan.lanes[i];
      if (laneDist(l, x, y) < l.w / 2) return true;
    }
    return false;
  };
  // THE PINEWOOD'S RIVER, and its bridges where the way crosses it
  const river = kind === 'pine' ? riverOf(rng, plan, openW, openH) : null;
  const bridgeTiles = new Set<number>();
  const bridges: Bridge[] = [];
  if (river) {
    for (const br of bridgesOf(plan, river, W)) {
      bridges.push(br);
      for (const i of br.tiles) bridgeTiles.add(i);
    }
  }
  const wet = (x: number, y: number): boolean => !!river && laneDist({ pts: river, w: 0 }, x, y) < 0.95;
  const shape = (x: number, y: number): boolean => inside(x, y) && !wet(x, y);
  const whole = (tx: number, ty: number): boolean => inCourt(tx, ty) || bridgeTiles.has(ty * W + tx);
  const never = (tx: number, ty: number): boolean => (tx >= openW - 1 && !(stoneAt && tx >= stoneX)) || (behindGate(tx + 0.5, ty + 0.5) && !inCourt(tx, ty));
  // (only the tiles near a shape are asked about: the rest is rock)
  const maybe = new Uint8Array(W * H);
  const stamp = (x: number, y: number, r: number): void => {
    for (let ty = Math.max(0, Math.floor(y - r)); ty <= Math.min(H - 1, Math.ceil(y + r)); ty++) for (let tx = Math.max(0, Math.floor(x - r)); tx <= Math.min(W - 1, Math.ceil(x + r)); tx++) maybe[ty * W + tx] = 1;
  };
  for (const a of plan.areas) stamp(a.blob.x, a.blob.y, a.r + 2);
  for (const l of plan.lanes) {
    for (let i = 0; i + 1 < l.pts.length; i++) {
      const [ax, ay] = l.pts[i];
      const [bx, by] = l.pts[i + 1];
      const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 1.5));
      for (let k = 0; k <= n; k++) stamp(ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n, l.w / 2 + 2);
    }
  }
  if (fenPool) stamp(fenPool.ringE.x, fenPool.ringE.y, Math.max(RING.rx, RING.ry) * 1.5 + 2);
  if (stoneAt) stamp(stoneAt.cx, stoneAt.cy, 14);
  const { tiles, cut } = layTiles(W, H, shape, whole, never, maybe);
  // (a bridge's tiles are whole floor; the river on either side of it is not)
  // THE HALLS INSIDE
  const hallRects: { x: number; y: number; w: number; h: number }[] = [];
  holdsAt.forEach((h, k) => {
    const hx = hallX + 15 + k * (HALL.w + 30);
    const hy = Math.round(H / 2 - HALL.h / 2);
    hallRects.push({ x: hx, y: hy, w: HALL.w, h: HALL.h });
    for (let ty = hy; ty < hy + HALL.h; ty++) for (let tx = hx; tx < hx + HALL.w; tx++) {
      tiles[ty * W + tx] = T_FLOOR;
      cut[ty * W + tx] = 0;
    }
    // (HOLD_HALLWAY: its hallway, out from the middle of its near side toward the eye, along y)
    if (HOLD_HALLWAY.on) {
      const way = wayOf({ x: hx, y: hy, w: HALL.w, h: HALL.h });
      for (let ty = way.y; ty < way.y + way.h; ty++) for (let tx = way.x; tx < way.x + way.w; tx++) {
        tiles[ty * W + tx] = T_FLOOR;
        cut[ty * W + tx] = 0;
      }
    }
  });

  // THE START AND THE BOSS
  const startA = plan.areas[0].blob;
  const bossA = plan.areas.find((a) => a.role === 'boss')!.blob;
  let start = nearestFloor(W, H, tiles, cut, startA.x, startA.y);
  if (start < 0) return null;
  // KEEP ONLY WHAT IS REACHED from the start (by whole tiles; a cut tile beside them stays: it is edge)
  const got = reach(W, H, tiles, cut, start, false);
  for (let i = 0; i < W * H; i++) {
    if (tiles[i] !== T_FLOOR || got[i]) continue;
    const x = i % W;
    const y = (i - x) / W;
    if (hallRects.some((r) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h)) continue;
    // (the Colossus's stone: an island, reached across the water from the landing)
    if (stoneAt && x >= stoneX) continue;
    if (HOLD_HALLWAY.on && hallRects.some((r) => { const w = wayOf(r); return x >= w.x && y >= w.y && x < w.x + w.w && y < w.y + w.h; })) continue;
    // (a half tile is kept if a whole one reached is beside it)
    if (cut[i] !== 0 && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => { const j = (y + b) * W + x + a; return j >= 0 && j < W * H && got[j] === 1; })) continue;
    tiles[i] = T_WALL;
    cut[i] = 0;
  }
  const bossTile = nearestFloor(W, H, tiles, cut, bossA.x, bossA.y);
  if (bossTile < 0 || !got[bossTile]) return null;
  for (const h of holdsAt) if (!got[h.gy * W + h.gx] && !got[h.gy * W + h.gx - 1]) return null;
  // (every area's middle reached, or the plan is rolled again: an area cut off by the river or a half-tile neck)
  for (const a of plan.areas) {
    const t = nearestFloor(W, H, tiles, cut, a.blob.x, a.blob.y);
    if (t < 0 || !got[t]) return null;
  }

  // THE LEDGE ROAD'S DROP: every tile that is not floor, on the drop's side of the trail (or round the peak), falls away
  let drop: Uint8Array | undefined;
  if (kind === 'ledge' && plan.trail) {
    drop = new Uint8Array(W * H);
    const trail = plan.trail;
    const peak = bossA;
    for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < openW; tx++) {
      const i = ty * W + tx;
      if (tiles[i] === T_FLOOR) continue;
      drop[i] = ledgeDrops(trail, peak, tx + 0.5, ty + 0.5) ? 1 : 0;
      // (near the trail, the drop is a pit: the vultures fly out over it; further off, nothing the rules go by)
      if (drop[i] && nearFloor(W, H, tiles, tx, ty, 3)) tiles[i] = T_PIT;
    }
  }
  // THE FEN'S WATER near the islands and boardwalks: a pit (what flies goes over it; nobody stands in it)
  if (kind === 'fen') {
    for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < openW; tx++) {
      const i = ty * W + tx;
      if (tiles[i] === T_WALL && nearFloor(W, H, tiles, tx, ty, 3)) tiles[i] = T_PIT;
    }
  }

  // ROOMS: each area its bounding box; the halls inside theirs
  const rooms: Room[] = [];
  const areaRoom: number[] = [];
  const roleKind = (r: AreaRole): RoomKind => (r === 'start' ? 'start' : r === 'boss' ? 'boss' : r === 'side' ? 'treasure' : r === 'lair' ? 'guardian' : 'normal');
  plan.areas.forEach((a, i) => {
    const R = Math.ceil(Math.max(a.blob.rx, a.blob.ry) * (1 + a.blob.wob));
    const room: Room = { id: rooms.length, x: Math.max(0, Math.floor(a.blob.x - R)), y: Math.max(0, Math.floor(a.blob.y - R)), w: 2 * R + 1, h: 2 * R + 1, kind: roleKind(a.role), path: a.path };
    rooms.push(room);
    areaRoom[i] = room.id;
  });
  // (an elite area or two on the main way: a yellow pack's)
  const pathRooms = rooms.filter((r) => r.kind === 'normal' && r.path > 0);
  rng.shuffle(pathRooms);
  for (let k = 0; k < Math.min(2, Math.floor(pathRooms.length / 3)); k++) pathRooms[k].kind = 'elite';
  // (THE STONE: a room of its own, as a hall is)
  if (stoneAt) rooms.push({ id: rooms.length, x: Math.floor(stoneAt.cx - 12), y: Math.floor(stoneAt.cy - 12), w: 24, h: 24, kind: 'normal', path: -1 });
  const hallRoom: number[] = hallRects.map((r) => {
    const room: Room = { id: rooms.length, x: r.x, y: r.y, w: r.w, h: r.h, kind: 'normal', path: -1 };
    rooms.push(room);
    return room.id;
  });

  // THE STRONGHOLDS
  const holdList: Hold[] = holdsAt.map((h, n) => {
    const r = hallRects[n];
    return {
      n,
      gx: h.gx,
      gy: h.gy,
      altar: { x: h.gx, y: h.gy + 1.55 },
      yard: areaRoom[h.yard],
      guards: [
        { x: h.gx - 1.9, y: h.gy + 2.3 },
        { x: h.gx + 1.9, y: h.gy + 2.3 },
      ],
      hall: hallRoom[n],
      inside: r,
      // (in by the middle of its near side toward the eye, along y: the hall's door is its way out too; HOLD_HALLWAY, in at the
      // far end of its hallway, and out by it)
      entry: HOLD_HALLWAY.on ? { x: r.x + r.w / 2, y: r.y + r.h + HOLD_HALLWAY.long - 1.5 } : { x: r.x + r.w / 2, y: r.y + r.h - 1.5 },
      fight: { x: r.x + r.w / 2, y: r.y + r.h / 2 - 0.5 },
      ...(HOLD_HALLWAY.on ? { way: wayOf(r) } : {}),
    };
  });

  // THE PACKS, THE START, THE BOSS
  const floor: Floor = {
    depth,
    seed,
    w: W,
    h: H,
    tiles,
    cut,
    variant: new Uint8Array(W * H),
    rooms,
    start: tileMid(W, start),
    boss: tileMid(W, bossTile),
    packs: [],
    props: [],
  };
  const vr = new RNG(seed ^ 0x1b873593);
  for (let i = 0; i < W * H; i++) floor.variant[i] = vr.int(0, 255);
  const exitAt = stoneAt ? stoneToWorld(stoneAt, 8.5, 9.0) : farEnd(plan, tiles, cut, W, H, bossA);
  const arrive = { ...floor.start };
  floor.packs = placePacks(rng, floor, plan, areaRoom, depth, holdList, kind);
  floor.props = baseProps(rng, floor, plan, areaRoom, kind);

  const land: Land = {
    kind,
    depth,
    seed,
    drop,
    sky: kind === 'ledge',
    river: river ?? undefined,
    trails: [plan.way],
    bridges,
    sickFrom: kind === 'pine' ? 0.62 : undefined,
    way: plan.way,
    boards: kind === 'fen' ? boardsOf(plan, tiles, W, H, fenPool) : undefined,
    ring: fenPool?.ringE,
    pool: fenPool?.poolE,
    stone: stoneAt ?? undefined,
    landing: stoneAt ? { x: plan.areas.find((a) => a.role === 'boss')!.blob.x, y: plan.areas.find((a) => a.role === 'boss')!.blob.y } : undefined,
    areas: plan.areas.map((a, i) => ({ blob: a.blob, room: areaRoom[i], role: a.role })),
    lanes: plan.lanes,
    holds: holdList,
    exit: exitAt,
    arrive,
  };
  return { floor, land };
}

export const tileMid = (W: number, i: number): { x: number; y: number } => ({ x: (i % W) + 0.5, y: Math.floor(i / W) + 0.5 });

/** The whole floor tile nearest a world point (within 8 tiles), or -1. */
export function nearestFloor(W: number, H: number, tiles: Uint8Array, cut: Uint8Array, x: number, y: number): number {
  let best = -1;
  let bd = Infinity;
  const cx = Math.floor(x);
  const cy = Math.floor(y);
  for (let ty = cy - 8; ty <= cy + 8; ty++) for (let tx = cx - 8; tx <= cx + 8; tx++) {
    if (tx < 0 || ty < 0 || tx >= W || ty >= H) continue;
    const i = ty * W + tx;
    if (tiles[i] !== T_FLOOR || cut[i] !== 0) continue;
    // (well in: whole floor on every side, where there is)
    let open = 0;
    for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (tiles[(ty + b) * W + tx + a] === T_FLOOR) open++;
    const d = Math.hypot(tx + 0.5 - x, ty + 0.5 - y) + (4 - open) * 0.7;
    if (d < bd) {
      bd = d;
      best = i;
    }
  }
  return best;
}

/** Is there floor within `r` tiles of tile (tx, ty)? */
export function nearFloor(W: number, H: number, tiles: Uint8Array, tx: number, ty: number, r: number): boolean {
  for (let y = ty - r; y <= ty + r; y++) for (let x = tx - r; x <= tx + r; x++) if (x >= 0 && y >= 0 && x < W && y < H && tiles[y * W + x] === T_FLOOR) return true;
  return false;
}

/** THE LEDGE ROAD: does the ground at world (x, y), not floor, fall away? The drop's side of the trail, and all round the peak but its neck. */
export function ledgeDrops(trail: readonly [number, number][], peak: Blob, x: number, y: number): boolean {
  // (round the peak: nearer it than the trail's last leg says, it falls away)
  let best = Infinity;
  let bi = 0;
  for (let i = 0; i + 1 < trail.length; i++) {
    const d = segDist(x, y, trail[i][0], trail[i][1], trail[i + 1][0], trail[i + 1][1]);
    if (d < best) {
      best = d;
      bi = i;
    }
  }
  const pd = Math.hypot((x - peak.x) / peak.rx, (y - peak.y) / peak.ry) * Math.min(peak.rx, peak.ry);
  if (pd < best + 1.5) return true;
  const [ax, ay] = trail[bi];
  const [bx, by] = trail[bi + 1];
  const h = Math.atan2(by - ay, bx - ax);
  const n1x = Math.cos(h + Math.PI / 2);
  const n1y = Math.sin(h + Math.PI / 2);
  // (the drop's normal: the one further down the screen)
  const sgn = downOf(n1x, n1y) >= 0 ? 1 : -1;
  const s = ((x - ax) * n1x + (y - ay) * n1y) * sgn;
  return s > 0;
}

// THE FEN'S RUIN: the ring of paving round the Eye's pool, laid to the art chat's sizes (EYE_RING 8 by 7, EYE_POOL 2.9 by 2.5: tiles, across the screen and up and down it)
/** (COLOSSUS) The stone's island: tiles each way, the water round it. */
const STONE_ROOM = 52;
const RING = { rx: 8.0, ry: 7.0 };
const POOL = { rx: 2.9, ry: 2.5 };
/** Across the screen (world (1, -1)/√2) and up it ((1, 1)/√2): how far out a point is, for an ellipse with those axes. */
function screenEllipse(cx: number, cy: number, rx: number, ry: number): (x: number, y: number) => number {
  return (x, y) => {
    const u = (x - cx - (y - cy)) / Math.SQRT2;
    const v = (x - cx + (y - cy)) / Math.SQRT2;
    return Math.hypot(u / rx, v / ry);
  };
}
function poolOf(plan: Plan): { pool: (x: number, y: number) => boolean; ring: (x: number, y: number) => boolean; ringE: { x: number; y: number; rx: number; ry: number }; poolE: { x: number; y: number; rx: number; ry: number } } {
  const b = plan.areas.find((a) => a.role === 'boss')!.blob;
  const ringD = screenEllipse(b.x, b.y, RING.rx, RING.ry);
  const poolD = screenEllipse(b.x, b.y, POOL.rx, POOL.ry);
  return {
    pool: (x, y) => poolD(x, y) < 1,
    ring: (x, y) => ringD(x, y) < 1,
    ringE: { x: b.x, y: b.y, ...RING },
    poolE: { x: b.x, y: b.y, ...POOL },
  };
}

/** THE FEN'S BOARDWALKS: the floor tiles of its lanes that are not on an island (the planks are laid on them: game/act1_dress.ts). */
function boardsOf(plan: Plan, tiles: Uint8Array, W: number, H: number, pool: ReturnType<typeof poolOf> | null): number[] {
  const out: number[] = [];
  for (let i = 0; i < W * H; i++) {
    if (tiles[i] !== T_FLOOR) continue;
    const x = (i % W) + 0.5;
    const y = Math.floor(i / W) + 0.5;
    if (pool && pool.ring(x, y)) continue;
    if (plan.areas.some((a) => blobDist(a.blob, x, y) < 1.02)) continue;
    if (plan.lanes.some((l) => laneDist(l, x, y) < l.w / 2 + 0.3)) out.push(i);
  }
  return out;
}

/** THE PINEWOOD'S RIVER: a long curve across the floor, from one side to the other, crossing the main way. */
function riverOf(rng: RNG, plan: Plan, W: number, H: number): [number, number][] {
  // (across the way the floor goes: from a side of the bounds to the other, through the middle third of the way)
  const way = plan.way;
  const [sx, sy] = way[0];
  const [ex, ey] = way[way.length - 1];
  const h = Math.atan2(ey - sy, ex - sx);
  const n = h + Math.PI / 2;
  const mid = way[Math.floor(way.length * rng.range(0.3, 0.55))];
  const reachOut = Math.max(W, H);
  const pts: [number, number][] = [];
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps - 0.5;
    const wob = Math.sin(t * 5 + rng.next()) * 3;
    pts.push([mid[0] + Math.cos(n) * t * reachOut + Math.cos(h) * (wob + t * 8), mid[1] + Math.sin(n) * t * reachOut + Math.sin(h) * (wob + t * 8)]);
  }
  return pts;
}

/** Where the main way (and every lane) crosses the river, a bridge of whole floor tiles over it, along x or y. */
function bridgesOf(plan: Plan, river: [number, number][], W: number): Bridge[] {
  const out: Bridge[] = [];
  const routes: [number, number][][] = [plan.way, ...plan.lanes.map((l) => l.pts)];
  // (one massive ground: its lines along it too, where they meet the river on the ground itself)
  const onGround = (x: number, y: number): boolean => plan.areas.some((a) => a.role === 'path' && blobDist(a.blob, x, y) < 0.8);
  const extra = plan.along ?? [];
  routes.push(...extra);
  // (the river's own line as segments)
  const crossings: { x: number; y: number; rh: number }[] = [];
  for (const route of routes) {
    for (let i = 0; i + 1 < route.length; i++) {
      for (let j = 0; j + 1 < river.length; j++) {
        const p = cross(route[i], route[i + 1], river[j], river[j + 1]);
        if (!p) continue;
        if (extra.includes(route) && !onGround(p[0], p[1])) continue;
        if (crossings.some((c) => Math.hypot(c.x - p[0], c.y - p[1]) < 6)) continue;
        crossings.push({ x: p[0], y: p[1], rh: Math.atan2(river[j + 1][1] - river[j][1], river[j + 1][0] - river[j][0]) });
      }
    }
  }
  for (const c of crossings) {
    // (F8F9_FIX: square to the stream where it crosses, whatever way it runs on the grid: game/f8f9.ts)
    if (F8F9_FIX.on) {
      const sq = squareBridge(river, c.x, c.y, W);
      out.push({ tiles: sq.tiles, alongX: Math.abs(Math.cos(sq.ang)) >= Math.abs(Math.sin(sq.ang)), x: sq.x, y: sq.y, ang: sq.ang, len: sq.len, wide: sq.wide });
      continue;
    }
    // (the bridge goes across the river: along x where the river runs more along y, else along y)
    const alongX = Math.abs(Math.sin(c.rh)) > Math.abs(Math.cos(c.rh));
    const tiles: number[] = [];
    const cx = Math.floor(c.x);
    const cy = Math.floor(c.y);
    for (let k = -2; k <= 2; k++) for (let s = 0; s <= 1; s++) {
      const tx = alongX ? cx + k : cx + s;
      const ty = alongX ? cy + s : cy + k;
      tiles.push(ty * W + tx);
    }
    out.push({ tiles, alongX });
  }
  return out;
}
export function cross(a: [number, number], b: [number, number], c: [number, number], d: [number, number]): [number, number] | null {
  const r1 = b[0] - a[0];
  const r2 = b[1] - a[1];
  const s1 = d[0] - c[0];
  const s2 = d[1] - c[1];
  const den = r1 * s2 - r2 * s1;
  if (Math.abs(den) < 1e-9) return null;
  const t = ((c[0] - a[0]) * s2 - (c[1] - a[1]) * s1) / den;
  const u = ((c[0] - a[0]) * r2 - (c[1] - a[1]) * r1) / den;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? [a[0] + t * r1, a[1] + t * r2] : null;
}

/** The far end of the boss's area: the floor of it furthest from where the way came in (the way on opens there). */
export function farEnd(plan: Plan, tiles: Uint8Array, cut: Uint8Array, W: number, H: number, boss: Blob): { x: number; y: number } {
  const from = plan.way.length >= 2 ? plan.way[plan.way.length - 2] : plan.way[0];
  const h = Math.atan2(boss.y - from[1], boss.x - from[0]);
  for (let d = Math.max(boss.rx, boss.ry); d > 0; d -= 0.5) {
    const [x, y] = along(boss.x, boss.y, h, d);
    const i = Math.floor(y) * W + Math.floor(x);
    if (i >= 0 && i < W * H && tiles[i] === T_FLOOR && cut[i] === 0) return { x: Math.floor(x) + 0.5, y: Math.floor(y) + 0.5 };
  }
  return { x: boss.x, y: boss.y };
}

// ---------------------------------------------------------------------------------------------------
// THE PACKS: by area, the floor's own kinds (game/act1_mobs.ts says which, and how many)

function placePacks(rng: RNG, f: Floor, plan: Plan, areaRoom: readonly number[], depth: number, holds: readonly Hold[], kind: LandKind): PackSpot[] {
  const out: PackSpot[] = [];
  const W = f.w;
  const used: [number, number][] = [];
  const free = (x: number, y: number, r: number): boolean => {
    for (let ty = Math.floor(y - r); ty <= Math.floor(y + r); ty++) for (let tx = Math.floor(x - r); tx <= Math.floor(x + r); tx++) {
      if (tx < 0 || ty < 0 || tx >= W || ty >= f.h) return false;
      const i = ty * W + tx;
      if (f.tiles[i] !== T_FLOOR) return false;
    }
    return true;
  };
  const startX = f.start.x;
  const startY = f.start.y;
  const put = (x: number, y: number, room: number, tier: PackSpot['tier'], mk: MonsterKind, size: number): void => {
    out.push({ x: Math.floor(x) + 0.5, y: Math.floor(y) + 0.5, roomId: room, size, tier, kind: mk });
    used.push([x, y]);
  };
  let owed = 0.5;
  plan.areas.forEach((a, i) => {
    const room = f.rooms[areaRoom[i]];
    if (a.role === 'start' || a.role === 'boss' || a.role === 'yard') return;
    const b = a.blob;
    const area = Math.PI * b.rx * b.ry;
    // (one massive ground: its packs by the ground it really covers, the parts of one carried from shape to shape)
    let n: number;
    if (a.role === 'path' && plan.packShare !== undefined) {
      owed += (area * plan.packShare) / 70;
      n = Math.floor(owed);
      owed -= n;
    } else n = a.role === 'lair' ? 1 : Math.max(1, Math.round(area / (kind === 'ledge' ? 22 : 70)));
    for (let k = 0; k < n; k++) {
      for (let tries = 0; tries < 30; tries++) {
        const ang = rng.range(0, Math.PI * 2);
        const d = Math.sqrt(rng.next()) * 0.62;
        const x = b.x + Math.cos(ang) * b.rx * d;
        const y = b.y + Math.sin(ang) * b.ry * d;
        if (!free(x, y, 1)) continue;
        if (Math.hypot(x - startX, y - startY) < 10) continue;
        if (used.some(([ux, uy]) => Math.hypot(ux - x, uy - y) < 5)) continue;
        const tier: PackSpot['tier'] = a.role === 'lair' ? 'champion' : room.kind === 'elite' && k === 0 ? 'elite' : 'normal';
        const p = act1Pack(depth, rng, tier);
        put(x, y, room.id, tier, p.kind, p.size);
        break;
      }
    }
  });
  // (along the lanes, a small pack here and there)
  for (const l of plan.lanes) {
    const len = l.pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - l.pts[i - 1][0], p[1] - l.pts[i - 1][1]) : 0), 0);
    if (len < 12 || rng.chance(0.5)) continue;
    const mid = l.pts[Math.floor(l.pts.length / 2)];
    if (!free(mid[0], mid[1], 0.5) || used.some(([ux, uy]) => Math.hypot(ux - mid[0], uy - mid[1]) < 6) || Math.hypot(mid[0] - startX, mid[1] - startY) < 10) continue;
    const p = act1Pack(depth, rng, 'normal');
    put(mid[0], mid[1], -1, 'normal', p.kind, Math.max(2, Math.ceil(p.size * 0.6)));
  }
  void holds;
  return out;
}

/** The game's own things on a floor of the descent: a treasure area's chests, and the breakables about (the floor's own pictures: game/act1_dress.ts). */
function baseProps(rng: RNG, f: Floor, plan: Plan, areaRoom: readonly number[], kind: LandKind): PropSpot[] {
  const out: PropSpot[] = [];
  const W = f.w;
  const taken = new Set<number>();
  const ok = (tx: number, ty: number): boolean => {
    for (let y = ty - 1; y <= ty + 1; y++) for (let x = tx - 1; x <= tx + 1; x++) {
      const i = y * W + x;
      if (x < 0 || y < 0 || x >= W || y >= f.h || f.tiles[i] !== T_FLOOR || (f.cut && f.cut[i] !== 0)) return false;
    }
    return !taken.has(ty * W + tx);
  };
  const put = (k: PropSpot['kind'], tx: number, ty: number): void => {
    out.push({ kind: k, x: tx, y: ty });
    taken.add(ty * W + tx);
  };
  let owed = 0.5;
  plan.areas.forEach((a, i) => {
    const b = a.blob;
    if (a.role === 'side') {
      // the reward: two or three chests near its middle
      const n = rng.int(2, 3);
      for (let k = 0, t = 0; k < n && t < 40; t++) {
        const tx = Math.floor(b.x + rng.range(-2, 2));
        const ty = Math.floor(b.y + rng.range(-1.5, 1.5));
        if (!ok(tx, ty)) continue;
        put('chest', tx, ty);
        k++;
      }
    }
    if (a.role === 'yard' || a.role === 'boss' || a.role === 'start') return;
    // breakables about the area (barrels and urns: the floor's own breakables stand for them; on one massive ground, by the
    // ground each of its shapes really covers, the parts of one carried on)
    let n = rng.int(1, kind === 'ledge' ? 2 : 4);
    if (a.role === 'path' && plan.packShare !== undefined) {
      owed += n * (plan.areaShare ?? 1);
      n = Math.floor(owed);
      owed -= n;
    }
    for (let k = 0, t = 0; k < n && t < 30; t++) {
      const ang = rng.range(0, Math.PI * 2);
      const tx = Math.floor(b.x + Math.cos(ang) * b.rx * rng.range(0.55, 0.85));
      const ty = Math.floor(b.y + Math.sin(ang) * b.ry * rng.range(0.55, 0.85));
      if (!ok(tx, ty)) continue;
      put(rng.chance(0.5) ? 'barrel' : 'urn', tx, ty);
      k++;
    }
    void areaRoom;
    void i;
  });
  return out;
}
