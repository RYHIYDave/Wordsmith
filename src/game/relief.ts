// TERRACES AND STAIRS IN A DUNGEON: where the map-maker raises the floor.
//
// The owner, 7 Oct 2026: "Then work on ledges and stairs", and of the first pictures: "Stairs and
// raised areas look great.  Let's hold off pits for now." So: raised floor and flights of stairs,
// and NO PIT (game/height.ts has the rules of height; a pit is ruled and drawn and laid nowhere).
//
// What is laid, after the rooms, the corridors, the props and the packs are where they always
// were (so a dungeon is the dungeon it was, with some of its floor a level higher):
//
//   A TERRACE in a room that is big enough and is neither where the hero arrives nor the boss's:
//   floor one level up against the room's back walls, in its back corner or along the whole of
//   one back wall. Its edges are ledges that face the eye. Nobody walks over them. Where a corner
//   of the room is cut clean (TRIANGLES, game/cut.ts) the terrace runs up to the slanting wall
//   on half tiles.
//   ONE OR TWO FLIGHTS OF STAIRS, two tiles wide where there is room, standing out from a ledge
//   onto the low floor.
//
// Mine to answer for (he was told, and may overrule): THE WAY FORWARD NEVER NEEDS A JUMP. A
// terrace keeps clear of every doorway, so the way from door to door is on the low floor, and
// every tile that could be walked to before can still be walked to (round by the stairs): a
// terrace that would cut anything off is not laid.
//
// NOTHING ELSE IS MOVED OR TAKEN AWAY. A flight of stairs is put where nothing stands or lies, with
// nothing solid at its foot or its head; where there is no such place, there is no terrace.

import type { RNG } from '../engine/rng';
import { cutHalf } from './cut';
import { STAIR_N, STAIR_W, canStep } from './height';
import { CUT_NEAR, SOLID_PROPS, T_FLOOR } from './types';
import type { Floor, Room } from './types';

/** The share of the rooms that could have a terrace that get one. */
export const TERRACE_SHARE = 0.6;
/** A room narrower or shallower than this has none. */
const ROOM_MIN = 8;
/** How far a terrace keeps from a doorway (tiles, each way). */
const DOOR_CLEAR = 2;

interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** 1 on every tile within `radius` (each way) of a tile where `src` is 1. */
function near(size: number, src: Uint8Array, radius: number): Uint8Array {
  const out = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (src[y * size + x] !== 1) continue;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < size && ny < size) out[ny * size + nx] = 1;
        }
      }
    }
  }
  return out;
}

/**
 * The tiles a body could stand on (`walk`), and those of them that can be walked to from where the
 * hero arrives by the rules of height (`seen`). A tile cut corner to corner is nobody's to walk
 * to: way-finding has it shut, and a fire and a chest may stand at the two open sides of a half
 * tile.
 */
function reached(f: Floor): { walk: Uint8Array; seen: Uint8Array } {
  const n = f.w * f.h;
  const walk = new Uint8Array(n);
  for (let i = 0; i < n; i++) walk[i] = f.tiles[i] === T_FLOOR && !(f.cut && f.cut[i] !== 0) ? 1 : 0;
  for (const p of f.props) if (SOLID_PROPS.includes(p.kind)) walk[p.y * f.w + p.x] = 0;
  const seen = new Uint8Array(n);
  const sx = Math.floor(f.start.x);
  const sy = Math.floor(f.start.y);
  const queue = [sy * f.w + sx];
  seen[queue[0]] = 1;
  for (let head = 0; head < queue.length; head++) {
    const i = queue[head];
    const x = i % f.w;
    const y = (i - x) / f.w;
    for (let k = 0; k < 4; k++) {
      const nx = x + (k === 0 ? 1 : k === 1 ? -1 : 0);
      const ny = y + (k === 2 ? 1 : k === 3 ? -1 : 0);
      if (nx < 0 || ny < 0 || nx >= f.w || ny >= f.h) continue;
      const j = ny * f.w + nx;
      if (seen[j] === 1 || walk[j] !== 1 || !canStep(f, x, y, nx, ny)) continue;
      seen[j] = 1;
      queue.push(j);
    }
  }
  return { walk, seen };
}

/**
 * Has what was just laid cut anything off?
 *
 * ON A LEVEL WITH NO CUT TILE (`was` null), as it has been since Version 18.0: every tile a body
 * could stand on must be walked to. (So a dungeon in which a cluster of barrels has walled a tile
 * in has no terrace at all. That is stricter than the rule at the top of this file, and it is
 * left as it is: a dungeon's terraces are the ones Version 18 gave it.)
 *
 * ON A LEVEL WITH TRIANGLES, the rule as it is written: every tile that could be walked to BEFORE
 * (`was`, from `reached`) can still be walked to. There a fire against a flat back wall, or
 * things against a slanting one, wall a tile in far more often, and one such tile anywhere would
 * forbid every terrace in the dungeon.
 */
function nothingCutOff(f: Floor, was: Uint8Array | null): boolean {
  const { walk, seen } = reached(f);
  const n = seen.length;
  if (was) {
    for (let i = 0; i < n; i++) if (was[i] === 1 && seen[i] !== 1) return false;
    return true;
  }
  for (let i = 0; i < n; i++) if (walk[i] === 1 && seen[i] !== 1) return false;
  return true;
}

/**
 * Try a terrace on the floor tiles of `rect` in room `r`, with its stairs. Returns false, and
 * leaves the floor as it was, if it cannot be laid.
 */
function tryTerrace(f: Floor, height: Int8Array, stair: Uint8Array, doors: Uint8Array, things: Uint8Array, rect: Rect, flights: number, rng: RNG): boolean {
  const w = f.w;
  const at = (x: number, y: number): number => y * w + x;
  const floorAt = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < w && y < f.h && f.tiles[at(x, y)] === T_FLOOR;
  // TRIANGLES (game/cut.ts): A TERRACE RUNS UP TO A SLANTING WALL. The half tiles of floor along
  // a corner that is cut clean are raised with the rest (the painter has a raised half tile:
  // render.ts, raisedHalf), so that a room whose back corner is cut has its terrace as it had
  // when the corner was taken off in steps. Not at the corner toward the eye, where the wall is
  // cut down low (no terrace reaches there). A flight of stairs stands on whole tiles, with whole
  // tiles at its foot and at its head.
  const cutAt = (x: number, y: number): number => (f.cut && x >= 0 && y >= 0 && x < w && y < f.h ? f.cut[at(x, y)] : 0);
  const whole: number[] = [];
  const halves: number[] = [];
  for (let y = rect.y0; y <= rect.y1; y++) {
    for (let x = rect.x0; x <= rect.x1; x++) {
      if (!floorAt(x, y)) continue;
      if (doors[at(x, y)] === 1) return false;
      const c = cutAt(x, y);
      if (c === 0) whole.push(at(x, y));
      else if (cutHalf(c) === CUT_NEAR) return false;
      else halves.push(at(x, y));
    }
  }
  if (whole.length < 6) return false;
  const inTerrace = new Uint8Array(w * f.h);
  for (const i of whole) inTerrace[i] = 1;
  // (a half tile is raised with the whole tile beside it; one with none of the terrace's whole tiles beside it stays on the room's floor)
  const tiles = whole.slice();
  for (const i of halves) {
    if (inTerrace[i + 1] === 1 || inTerrace[i - 1] === 1 || inTerrace[i + w] === 1 || inTerrace[i - w] === 1) tiles.push(i);
  }
  for (const i of tiles) inTerrace[i] = 1;
  const low = (x: number, y: number): boolean => floorAt(x, y) && cutAt(x, y) === 0 && inTerrace[at(x, y)] === 0 && height[at(x, y)] === 0 && stair[at(x, y)] === 0;

  // Where a flight could stand: on a low tile in front of an edge tile, with low floor at its foot;
  // nothing on the tile itself, and nothing solid at its foot or at its head.
  // (north: the flight goes up toward -y, standing out from the edge that faces down the screen to
  // the left; west: up toward -x, standing out from the edge that faces down the screen to the right)
  const spotsN: number[] = [];
  const spotsW: number[] = [];
  for (const i of tiles) {
    const x = i % w;
    const y = (i - x) / w;
    // (a flight's head is a whole tile, with nothing solid on it)
    if (things[i] === 2 || cutAt(x, y) !== 0) continue;
    if (low(x, y + 1) && low(x, y + 2) && doors[at(x, y + 1)] === 0 && things[at(x, y + 1)] === 0 && things[at(x, y + 2)] !== 2) spotsN.push(at(x, y + 1));
    if (low(x + 1, y) && low(x + 2, y) && doors[at(x + 1, y)] === 0 && things[at(x + 1, y)] === 0 && things[at(x + 2, y)] !== 2) spotsW.push(at(x + 1, y));
  }
  /** The runs a flight could take along one edge: two spots side by side where there are any, else single spots. */
  const runsOf = (spots: number[], north: boolean): number[][] => {
    const stepTo = north ? 1 : w;
    const pairs = spots.filter((t) => spots.includes(t + stepTo)).map((t) => [t, t + stepTo]);
    return pairs.length > 0 ? pairs : spots.map((t) => [t]);
  };
  /** One of an edge's runs, toward the middle of it where there is a choice (a flight in the middle of a ledge reads best). */
  const middle = (runs: number[][]): number[] => {
    const inner = runs.length > 2 ? runs.slice(1, -1) : runs;
    return inner[rng.int(0, inner.length - 1)];
  };
  const laid: { tile: number; kind: number }[] = [];
  const lay = (run: number[], north: boolean): void => {
    for (const t of run) laid.push({ tile: t, kind: north ? STAIR_N : STAIR_W });
  };
  const sides = [
    { north: true, runs: runsOf(spotsN, true) },
    { north: false, runs: runsOf(spotsW, false) },
  ].filter((side) => side.runs.length > 0);
  if (sides.length === 0) return false;
  rng.shuffle(sides);
  const first = sides[0];
  const a = middle(first.runs);
  lay(a, first.north);
  if (flights >= 2) {
    if (sides.length > 1) lay(middle(sides[1].runs), sides[1].north);
    else {
      // (one edge only: a second flight on it, well away from the first)
      const stepTo = first.north ? 1 : w;
      const far = first.runs.filter((run) => Math.abs(run[0] - a[0]) / stepTo >= 5);
      if (far.length > 0) lay(far[rng.int(0, far.length - 1)], first.north);
    }
  }
  if (laid.length === 0) return false;

  // Lay it.
  f.height = height;
  f.stair = stair;
  const was = f.cut ? reached(f).seen : null;
  for (const i of tiles) height[i] = 1;
  for (const s of laid) stair[s.tile] = s.kind;
  if (nothingCutOff(f, was)) return true;
  // (it would have cut something off: the floor is put back as it was)
  for (const i of tiles) height[i] = 0;
  for (const s of laid) stair[s.tile] = 0;
  return false;
}

/**
 * Try SUNKEN FLOOR on the tiles of `rect` (all of them floor of the room's own height, with such
 * floor all round it: sunken floor touches no wall), with its stairs. A flight down into it stands
 * IN it, at one of its two far edges, and comes toward the eye: so every flight in a dungeon is
 * seen from its foot. Returns false, and leaves the floor as it was, if it cannot be laid.
 */
function trySunken(f: Floor, height: Int8Array, stair: Uint8Array, doors: Uint8Array, things: Uint8Array, rect: Rect, flights: number, rng: RNG): boolean {
  const w = f.w;
  const at = (x: number, y: number): number => y * w + x;
  const plain = (x: number, y: number): boolean =>
    x >= 0 && y >= 0 && x < w && y < f.h && f.tiles[at(x, y)] === T_FLOOR && height[at(x, y)] === 0 && stair[at(x, y)] === 0 && !(f.cut && f.cut[at(x, y)] !== 0);
  // (the tiles, and two tiles of the room's own floor all round them; the tiles and the first of
  // those two rings clear of every doorway)
  for (let y = rect.y0 - 2; y <= rect.y1 + 2; y++) {
    for (let x = rect.x0 - 2; x <= rect.x1 + 2; x++) {
      if (!plain(x, y)) return false;
      const ring2 = x < rect.x0 - 1 || x > rect.x1 + 1 || y < rect.y0 - 1 || y > rect.y1 + 1;
      if (!ring2 && doors[at(x, y)] === 1) return false;
    }
  }
  // Where a flight could stand: in the first row (it goes up toward -y, to the floor behind that
  // row) or in the first column (up toward -x); not in the corner the two share. Nothing on the
  // tile itself, and nothing solid at its foot or at its head.
  const spotsN: number[] = [];
  const spotsW: number[] = [];
  for (let x = rect.x0 + 1; x <= rect.x1; x++) {
    if (things[at(x, rect.y0)] === 0 && things[at(x, rect.y0 - 1)] !== 2 && things[at(x, rect.y0 + 1)] !== 2) spotsN.push(at(x, rect.y0));
  }
  for (let y = rect.y0 + 1; y <= rect.y1; y++) {
    if (things[at(rect.x0, y)] === 0 && things[at(rect.x0 - 1, y)] !== 2 && things[at(rect.x0 + 1, y)] !== 2) spotsW.push(at(rect.x0, y));
  }
  const runsOf = (spots: number[], north: boolean): number[][] => {
    const stepTo = north ? 1 : w;
    const pairs = spots.filter((t) => spots.includes(t + stepTo)).map((t) => [t, t + stepTo]);
    return pairs.length > 0 ? pairs : spots.map((t) => [t]);
  };
  const middle = (runs: number[][]): number[] => {
    const inner = runs.length > 2 ? runs.slice(1, -1) : runs;
    return inner[rng.int(0, inner.length - 1)];
  };
  const sides = [
    { north: true, runs: runsOf(spotsN, true) },
    { north: false, runs: runsOf(spotsW, false) },
  ].filter((side) => side.runs.length > 0);
  if (sides.length === 0) return false;
  rng.shuffle(sides);
  const laid: { tile: number; kind: number }[] = [];
  for (const side of sides.slice(0, flights)) for (const t of middle(side.runs)) laid.push({ tile: t, kind: side.north ? STAIR_N : STAIR_W });
  // (a flight's foot is sunken floor, not the other flight)
  const taken = new Set(laid.map((l) => l.tile));
  for (const l of laid) if (taken.has(l.kind === STAIR_N ? l.tile + w : l.tile + 1)) return false;

  f.height = height;
  f.stair = stair;
  const was = f.cut ? reached(f).seen : null;
  for (let y = rect.y0; y <= rect.y1; y++) for (let x = rect.x0; x <= rect.x1; x++) height[at(x, y)] = -1;
  for (const l of laid) stair[l.tile] = l.kind;
  if (nothingCutOff(f, was)) return true;
  for (let y = rect.y0; y <= rect.y1; y++) for (let x = rect.x0; x <= rect.x1; x++) height[at(x, y)] = 0;
  for (const l of laid) stair[l.tile] = 0;
  return false;
}

/**
 * Lay terraces and their stairs in the rooms of a finished dungeon floor. `corr`: 1 on corridor
 * tiles (the floor that is no room's). `rng`: a stream of its own, so that nothing else about the
 * dungeon depends on what is laid here. Returns how many rooms got a terrace.
 */
export function layTerraces(f: Floor, corr: Uint8Array, rng: RNG): number {
  const n = f.w * f.h;
  const height = new Int8Array(n);
  const stair = new Uint8Array(n);
  const doors = near(f.w, corr, DOOR_CLEAR);
  // (what is on each tile: 0 nothing, 1 something that lies there, 2 something solid)
  const things = new Uint8Array(n);
  for (const p of f.props) things[p.y * f.w + p.x] = SOLID_PROPS.includes(p.kind) ? 2 : 1;
  const hadHeight = f.height;
  const hadStair = f.stair;
  let count = 0;
  for (const r of f.rooms as Room[]) {
    if (r.kind === 'start' || r.kind === 'boss') continue;
    if (r.w < ROOM_MIN || r.h < ROOM_MIN) continue;
    if (!rng.chance(TERRACE_SHARE)) continue;
    const x0 = r.x;
    const y0 = r.y;
    const x1 = r.x + r.w - 1;
    const y1 = r.y + r.h - 1;
    // TRIANGLES: where the room's back corner is cut clean, the terrace in that corner reaches
    // further out, by half the cut each way (the slanting wall has taken its corner: it would be
    // a sliver). Never nearer than three tiles to the room's far sides. (No cut tile: nothing changes.)
    let more = 0;
    if (f.cut) {
      let k = 0;
      while (k < 8 && f.tiles[y0 * f.w + x0 + k] !== T_FLOOR) k++;
      if (k < 8 && f.cut[y0 * f.w + x0 + k] !== 0) more = (k + 1) >> 1;
    }
    const out = (to: number, far: number): number => (more > 0 ? Math.max(to, Math.min(to + more, far - 3)) : to);
    // three shapes, tried in an order of the dice: the back corner; along the whole of the upper-right wall; along the whole of the upper-left wall
    const deep = (span: number): number => rng.int(2, Math.max(2, Math.min(4, span - 5)));
    const shapes: { rect: Rect; flights: number }[] = [
      { rect: { x0, y0, x1: out(x0 + rng.int(3, Math.max(3, Math.min(7, r.w - 4))) - 1, x1), y1: out(y0 + rng.int(3, Math.max(3, Math.min(5, r.h - 4))) - 1, y1) }, flights: rng.chance(0.5) ? 2 : 1 },
      { rect: { x0, y0, x1, y1: y0 + deep(r.h) - 1 }, flights: r.w >= 11 ? 2 : 1 },
      { rect: { x0, y0, x1: x0 + deep(r.w) - 1, y1 }, flights: r.h >= 11 ? 2 : 1 },
    ];
    rng.shuffle(shapes);
    for (const s of shapes) {
      if (tryTerrace(f, height, stair, doors, things, s.rect, s.flights, rng)) {
        count++;
        break;
      }
    }
  }
  if (count === 0) {
    f.height = hadHeight;
    f.stair = hadStair;
  }
  return count;
}

/** The share of the rooms that could have sunken floor (and have no terrace) that get it. */
export const SUNKEN_SHARE = 0.4;

/**
 * Lay SUNKEN FLOOR in rooms of a finished dungeon floor that have no terrace: a part of the room
 * one level down, out in the room (the room's own floor all round it, two tiles of it at the least
 * between it and any wall), with one or two flights of stairs down into it. Called after
 * `layTerraces`, with dice of its own: the terraces of a dungeon are the ones it had before there
 * was any sunken floor. Returns how many rooms got one.
 */
export function laySunken(f: Floor, corr: Uint8Array, rng: RNG): number {
  const n = f.w * f.h;
  const had = f.height !== undefined;
  const height = f.height ?? new Int8Array(n);
  const stair = f.stair ?? new Uint8Array(n);
  const doors = near(f.w, corr, DOOR_CLEAR);
  const things = new Uint8Array(n);
  for (const p of f.props) things[p.y * f.w + p.x] = SOLID_PROPS.includes(p.kind) ? 2 : 1;
  let count = 0;
  for (const r of f.rooms as Room[]) {
    if (r.kind === 'start' || r.kind === 'boss') continue;
    if (r.w < ROOM_MIN + 1 || r.h < ROOM_MIN + 1) continue;
    let raised = false;
    for (let y = r.y; y < r.y + r.h && !raised; y++) for (let x = r.x; x < r.x + r.w; x++) if (height[y * f.w + x] !== 0) raised = true;
    if (raised || !rng.chance(SUNKEN_SHARE)) continue;
    // three tries at a place for it: 4 to 6 tiles each way (three is a trench: a flight two wide
    // takes most of its edge), two tiles at the least from every wall
    for (let k = 0; k < 3; k++) {
      const sw = rng.int(4, Math.max(4, Math.min(6, r.w - 4)));
      const sh = rng.int(4, Math.max(4, Math.min(6, r.h - 4)));
      const x0 = r.x + rng.int(2, r.w - 2 - sw);
      const y0 = r.y + rng.int(2, r.h - 2 - sh);
      if (trySunken(f, height, stair, doors, things, { x0, y0, x1: x0 + sw - 1, y1: y0 + sh - 1 }, rng.chance(0.5) ? 2 : 1, rng)) {
        count++;
        break;
      }
    }
  }
  if (count === 0 && !had) {
    f.height = undefined;
    f.stair = undefined;
  }
  return count;
}
