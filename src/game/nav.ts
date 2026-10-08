// Grid navigation helpers: walkability grids, a flow field toward a target, line of sight, and
// scattering a pack's monsters around a point.
//
// Every grid here is a flat typed array indexed y * w + x. World positions are in tiles, and tile
// (tx, ty) covers world [tx, tx+1) x [ty, ty+1), so a tile centre is (tx + 0.5, ty + 0.5).
//
// flowField / flowDir / lineOfSight run every frame for many monsters, so they reuse scratch
// buffers and create no objects in their loops.

import type { RNG } from '../engine/rng';
import { segmentInWall } from './cut';
import { STEP_E, STEP_N, STEP_S, STEP_W } from './height';
import { SOLID_PROPS, T_FLOOR, T_PIT } from './types';
import type { Floor, Vec } from './types';

/** The value flowField stores for tiles it could not reach (or that are farther than maxDist). */
export const UNREACHABLE = 65535;

const STEP_ORTH = 10; // cost of a step to a side neighbour
const STEP_DIAG = 14; // cost of a diagonal step (about 10 * sqrt 2)

// ---------------------------------------------------------------------------------------------
// Grids

/**
 * 1 where a tile is floor or a pit, else 0 (walls and void block): what shots, sight and whatever
 * flies go by. (A cut floor tile is open here: the half of it that is wall is asked of the cut
 * itself, by `lineOfSight` and by Game.isOpen.)
 */
export function buildOpenGrid(f: Floor): Uint8Array {
  const n = f.w * f.h;
  const grid = new Uint8Array(n);
  for (let i = 0; i < n; i++) grid[i] = f.tiles[i] === T_FLOOR || f.tiles[i] === T_PIT ? 1 : 0;
  return grid;
}

/**
 * 1 where a body can stand: floor with no solid prop on it (a pit is not floor). A tile CUT corner
 * to corner is shut here though half of it is floor: nobody is steered through half a tile, no
 * pack is put down on one, and a straight walk is not planned across one. (A body may still stand
 * on its floor half: game/cut.ts and Game.free.)
 */
export function buildWalkGrid(f: Floor): Uint8Array {
  const n = f.w * f.h;
  const grid = new Uint8Array(n);
  for (let i = 0; i < n; i++) grid[i] = f.tiles[i] === T_FLOOR && !(f.cut && f.cut[i] !== 0) ? 1 : 0;
  for (const p of f.props) {
    if (!SOLID_PROPS.includes(p.kind)) continue;
    if (p.x < 0 || p.y < 0 || p.x >= f.w || p.y >= f.h) continue;
    grid[p.y * f.w + p.x] = 0;
  }
  return grid;
}

// ---------------------------------------------------------------------------------------------
// Flow field

// Scratch queues for flowField, shared by every call and grown only when a bigger map shows up.
// Two queues, one per step cost: because tiles are taken in order of rising cost, each queue
// stays sorted by itself, so "take the smaller of the two fronts" is a full shortest-path search
// without a heap.
let qOrthTile = new Int32Array(0);
let qOrthCost = new Uint16Array(0);
let qDiagTile = new Int32Array(0);
let qDiagCost = new Uint16Array(0);

function ensureQueues(n: number): void {
  // A tile can be queued once per neighbour that improves it: at most 4 times per queue.
  const need = n * 4 + 1;
  if (qOrthTile.length >= need) return;
  qOrthTile = new Int32Array(need);
  qOrthCost = new Uint16Array(need);
  qDiagTile = new Int32Array(need);
  qDiagCost = new Uint16Array(need);
}

/**
 * Distance field toward target tile (tx, ty): walking cost to reach the target from every tile within maxDist tiles,
 * 8-directional, orthogonal step = 10, diagonal step = 14, diagonal moves only when both adjacent orthogonal tiles are
 * walkable (no corner cutting). Unreachable or too far = 65535. Reuses `out` when given.
 *
 * `out` must hold exactly w * h entries to be reused; otherwise a new array is returned.
 * The target tile itself always gets 0, even if it is not walkable, so monsters still close in on it.
 *
 * `step` (height.ts, stepGrid): on a level with ledges and stairs, the side steps each tile allows.
 * A way is then found only where a body could walk it: round by the stairs, never over a ledge.
 */
export function flowField(
  walk: Uint8Array,
  w: number,
  h: number,
  tx: number,
  ty: number,
  maxDist: number = Infinity,
  out?: Uint16Array,
  step: Uint8Array | null = null,
): Uint16Array {
  const n = w * h;
  const dist = out && out.length === n ? out : new Uint16Array(n);
  dist.fill(UNREACHABLE);
  tx = Math.floor(tx);
  ty = Math.floor(ty);
  if (tx < 0 || ty < 0 || tx >= w || ty >= h) return dist;

  // Costs must stay below the "unreachable" marker.
  const limit = maxDist * STEP_ORTH < UNREACHABLE ? Math.floor(maxDist * STEP_ORTH) : UNREACHABLE - 1;
  ensureQueues(n);
  const oT = qOrthTile;
  const oC = qOrthCost;
  const dT = qDiagTile;
  const dC = qDiagCost;
  let oHead = 0;
  let oTail = 0;
  let dHead = 0;
  let dTail = 0;

  const target = ty * w + tx;
  dist[target] = 0;
  oT[oTail] = target;
  oC[oTail++] = 0;

  while (oHead < oTail || dHead < dTail) {
    // Take whichever queue has the cheaper tile at its front.
    let i: number;
    let cost: number;
    if (dHead >= dTail || (oHead < oTail && oC[oHead] <= dC[dHead])) {
      i = oT[oHead];
      cost = oC[oHead++];
    } else {
      i = dT[dHead];
      cost = dC[dHead++];
    }
    if (cost !== dist[i]) continue; // a cheaper route to this tile was found after it was queued

    const x = i % w;
    const y = (i - x) / w;
    const st = step ? step[i] : 15;
    const left = x > 0 && walk[i - 1] === 1 && (st & STEP_W) !== 0;
    const right = x < w - 1 && walk[i + 1] === 1 && (st & STEP_E) !== 0;
    const up = y > 0 && walk[i - w] === 1 && (st & STEP_N) !== 0;
    const down = y < h - 1 && walk[i + w] === 1 && (st & STEP_S) !== 0;

    const c1 = cost + STEP_ORTH;
    if (c1 <= limit) {
      if (left && dist[i - 1] > c1) { dist[i - 1] = c1; oT[oTail] = i - 1; oC[oTail++] = c1; }
      if (right && dist[i + 1] > c1) { dist[i + 1] = c1; oT[oTail] = i + 1; oC[oTail++] = c1; }
      if (up && dist[i - w] > c1) { dist[i - w] = c1; oT[oTail] = i - w; oC[oTail++] = c1; }
      if (down && dist[i + w] > c1) { dist[i + w] = c1; oT[oTail] = i + w; oC[oTail++] = c1; }
    }

    const c2 = cost + STEP_DIAG;
    if (c2 <= limit) {
      // A diagonal step is allowed only when both tiles beside it are walkable (and, where there
      // are ledges, when it could be made either way round: by one side step and then the other).
      let j: number;
      if (left && up && (!step || ((step[i - 1] & STEP_N) !== 0 && (step[i - w] & STEP_W) !== 0))) { j = i - w - 1; if (walk[j] === 1 && dist[j] > c2) { dist[j] = c2; dT[dTail] = j; dC[dTail++] = c2; } }
      if (right && up && (!step || ((step[i + 1] & STEP_N) !== 0 && (step[i - w] & STEP_E) !== 0))) { j = i - w + 1; if (walk[j] === 1 && dist[j] > c2) { dist[j] = c2; dT[dTail] = j; dC[dTail++] = c2; } }
      if (left && down && (!step || ((step[i - 1] & STEP_S) !== 0 && (step[i + w] & STEP_W) !== 0))) { j = i + w - 1; if (walk[j] === 1 && dist[j] > c2) { dist[j] = c2; dT[dTail] = j; dC[dTail++] = c2; } }
      if (right && down && (!step || ((step[i + 1] & STEP_S) !== 0 && (step[i + w] & STEP_E) !== 0))) { j = i + w + 1; if (walk[j] === 1 && dist[j] > c2) { dist[j] = c2; dT[dTail] = j; dC[dTail++] = c2; } }
    }
  }
  return dist;
}

/**
 * Unit vector (world space) from world position (x, y) toward the best neighbouring tile centre; (0, 0) if none is
 * better or the tile is unreachable.
 *
 * "Best" is the neighbour that gives the shortest remaining walk (its distance plus the step to reach it). A monster
 * standing on a tile the field did not reach (pushed onto a blocked tile, or just outside maxDist) is still steered
 * toward a reachable neighbour when there is one. Pass `out` to reuse a vector instead of creating one.
 */
export function flowDir(dist: Uint16Array, walk: Uint8Array, w: number, h: number, x: number, y: number, out?: Vec, step: Uint8Array | null = null): Vec {
  const v = out ?? { x: 0, y: 0 };
  v.x = 0;
  v.y = 0;
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  if (tx < 0 || ty < 0 || tx >= w || ty >= h) return v;
  const i = ty * w + tx;
  const here = dist[i];
  if (here === 0) return v; // already on the target tile

  const st = step ? step[i] : 15;
  const left = tx > 0 && walk[i - 1] === 1 && (st & STEP_W) !== 0;
  const right = tx < w - 1 && walk[i + 1] === 1 && (st & STEP_E) !== 0;
  const up = ty > 0 && walk[i - w] === 1 && (st & STEP_N) !== 0;
  const down = ty < h - 1 && walk[i + w] === 1 && (st & STEP_S) !== 0;

  // Find the neighbour with the lowest (distance + step cost) among those closer to the target than this tile.
  let best = UNREACHABLE + STEP_DIAG;
  let bx = 0;
  let by = 0;
  let d: number;
  // Side neighbours. The target tile may be unwalkable, so a neighbour at distance 0 always counts.
  // (where there are ledges, a neighbour that is the target but cannot be stepped to is no way to it)
  if (tx > 0 && (left || (dist[i - 1] === 0 && (st & STEP_W) !== 0))) { d = dist[i - 1]; if (d < here && d + STEP_ORTH < best) { best = d + STEP_ORTH; bx = -1; by = 0; } }
  if (tx < w - 1 && (right || (dist[i + 1] === 0 && (st & STEP_E) !== 0))) { d = dist[i + 1]; if (d < here && d + STEP_ORTH < best) { best = d + STEP_ORTH; bx = 1; by = 0; } }
  if (ty > 0 && (up || (dist[i - w] === 0 && (st & STEP_N) !== 0))) { d = dist[i - w]; if (d < here && d + STEP_ORTH < best) { best = d + STEP_ORTH; bx = 0; by = -1; } }
  if (ty < h - 1 && (down || (dist[i + w] === 0 && (st & STEP_S) !== 0))) { d = dist[i + w]; if (d < here && d + STEP_ORTH < best) { best = d + STEP_ORTH; bx = 0; by = 1; } }
  // Diagonal neighbours, only where the corner is not cut.
  if (left && up && (!step || ((step[i - 1] & STEP_N) !== 0 && (step[i - w] & STEP_W) !== 0))) { d = dist[i - w - 1]; if (d < here && d + STEP_DIAG < best) { best = d + STEP_DIAG; bx = -1; by = -1; } }
  if (right && up && (!step || ((step[i + 1] & STEP_N) !== 0 && (step[i - w] & STEP_E) !== 0))) { d = dist[i - w + 1]; if (d < here && d + STEP_DIAG < best) { best = d + STEP_DIAG; bx = 1; by = -1; } }
  if (left && down && (!step || ((step[i - 1] & STEP_S) !== 0 && (step[i + w] & STEP_W) !== 0))) { d = dist[i + w - 1]; if (d < here && d + STEP_DIAG < best) { best = d + STEP_DIAG; bx = -1; by = 1; } }
  if (right && down && (!step || ((step[i + 1] & STEP_S) !== 0 && (step[i + w] & STEP_E) !== 0))) { d = dist[i + w + 1]; if (d < here && d + STEP_DIAG < best) { best = d + STEP_DIAG; bx = 1; by = 1; } }
  if (bx === 0 && by === 0) return v;

  const dx = tx + bx + 0.5 - x;
  const dy = ty + by + 0.5 - y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len > 1e-6) {
    v.x = dx / len;
    v.y = dy / len;
  }
  return v;
}

// ---------------------------------------------------------------------------------------------
// Line of sight

/**
 * True if the straight segment between two WORLD points crosses only tiles where grid is 1 (grid traversal, no gaps).
 *
 * Every tile the segment passes through is checked. Where the segment goes exactly through a tile corner, both tiles
 * beside that corner must be open too, so nothing sees or shoots through the crack between two diagonal walls.
 * Points outside the grid never have line of sight.
 */
export function lineOfSight(grid: Uint8Array, w: number, h: number, x0: number, y0: number, x1: number, y1: number, cut: Uint8Array | null = null): boolean {
  let tx = Math.floor(x0);
  let ty = Math.floor(y0);
  const ex = Math.floor(x1);
  const ey = Math.floor(y1);
  if (tx < 0 || ty < 0 || tx >= w || ty >= h || ex < 0 || ey < 0 || ex >= w || ey >= h) return false;
  if (grid[ty * w + tx] !== 1) return false;

  const dx = x1 - x0;
  const dy = y1 - y0;
  const stepX = ex > tx ? 1 : ex < tx ? -1 : 0;
  const stepY = ey > ty ? 1 : ey < ty ? -1 : 0;
  // tMax*: how far along the segment (0..1) the next vertical / horizontal tile border is.
  // tDelta*: how far along the segment one whole tile is.
  const tDeltaX = stepX !== 0 ? Math.abs(1 / dx) : Infinity;
  const tDeltaY = stepY !== 0 ? Math.abs(1 / dy) : Infinity;
  let tMaxX = stepX > 0 ? (tx + 1 - x0) / dx : stepX < 0 ? (tx - x0) / dx : Infinity;
  let tMaxY = stepY > 0 ? (ty + 1 - y0) / dy : stepY < 0 ? (ty - y0) / dy : Infinity;

  // (`cut`: where a tile is cut corner to corner, the stretch of the line that lies in it is asked of the cut: game/cut.ts)
  let tIn = 0;
  while (tx !== ex || ty !== ey) {
    let tOut: number;
    const here = cut ? cut[ty * w + tx] : 0;
    if (tx !== ex && ty !== ey && Math.abs(tMaxX - tMaxY) < 1e-9) {
      // Exactly through a corner: step diagonally, but only if both side tiles are open.
      if (grid[ty * w + tx + stepX] !== 1 || grid[(ty + stepY) * w + tx] !== 1) return false;
      tOut = tMaxX;
      if (here !== 0 && segmentInWall(here, tx, ty, x0 + dx * tIn, y0 + dy * tIn, x0 + dx * tOut, y0 + dy * tOut)) return false;
      tx += stepX;
      ty += stepY;
      tMaxX += tDeltaX;
      tMaxY += tDeltaY;
    } else if (ty === ey || (tx !== ex && tMaxX < tMaxY)) {
      tOut = tMaxX;
      if (here !== 0 && segmentInWall(here, tx, ty, x0 + dx * tIn, y0 + dy * tIn, x0 + dx * tOut, y0 + dy * tOut)) return false;
      tx += stepX;
      tMaxX += tDeltaX;
    } else {
      tOut = tMaxY;
      if (here !== 0 && segmentInWall(here, tx, ty, x0 + dx * tIn, y0 + dy * tIn, x0 + dx * tOut, y0 + dy * tOut)) return false;
      ty += stepY;
      tMaxY += tDeltaY;
    }
    tIn = tOut;
    if (grid[ty * w + tx] !== 1) return false;
  }
  if (cut) {
    const here = cut[ty * w + tx];
    if (here !== 0 && segmentInWall(here, tx, ty, x0 + dx * tIn, y0 + dy * tIn, x1, y1)) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------------------------
// Scatter

let seenScratch = new Uint8Array(0);

/**
 * Up to `count` distinct walkable tile centres near (x, y), nearest first, for placing a pack's monsters.
 * Deterministic given rng.
 *
 * Only tiles that can be walked to from the centre tile are used, so nobody spawns behind a wall or inside a ring of
 * barrels. The tile under (x, y) is always first when it is walkable; the rest are picked at random from the closest
 * tiles around it so a pack looks like a loose group, not a filled disc.
 */
export function scatter(walk: Uint8Array, w: number, h: number, x: number, y: number, count: number, rng: RNG): Vec[] {
  const result: Vec[] = [];
  if (count <= 0) return result;
  let cx = Math.floor(x);
  let cy = Math.floor(y);
  if (cx < 0) cx = 0; else if (cx >= w) cx = w - 1;
  if (cy < 0) cy = 0; else if (cy >= h) cy = h - 1;

  // If the centre tile is blocked, start from the closest walkable tile within a few steps instead.
  if (walk[cy * w + cx] !== 1) {
    let found = -1;
    let foundD = Infinity;
    for (let r = 1; r <= 4 && found < 0; r++) {
      for (let yy = cy - r; yy <= cy + r; yy++) {
        for (let xx = cx - r; xx <= cx + r; xx++) {
          if (xx < 0 || yy < 0 || xx >= w || yy >= h || walk[yy * w + xx] !== 1) continue;
          const d = (xx + 0.5 - x) * (xx + 0.5 - x) + (yy + 0.5 - y) * (yy + 0.5 - y);
          if (d < foundD) { foundD = d; found = yy * w + xx; }
        }
      }
    }
    if (found < 0) return result;
    cx = found % w;
    cy = (found - cx) / w;
  }

  // Flood outward over walkable tiles (side steps only) until there are comfortably more tiles than monsters.
  const pool = count + Math.ceil(count * 0.6) + 2; // tiles to choose from
  const visitCap = pool * 2 + 8; // flooding this many guarantees the closest `pool` tiles are among them
  if (seenScratch.length < w * h) seenScratch = new Uint8Array(w * h);
  const seen = seenScratch;
  const queue: number[] = [cy * w + cx];
  seen[queue[0]] = 1;
  for (let head = 0; head < queue.length && queue.length < visitCap; head++) {
    const i = queue[head];
    const ix = i % w;
    const iy = (i - ix) / w;
    if (ix > 0 && walk[i - 1] === 1 && seen[i - 1] === 0) { seen[i - 1] = 1; queue.push(i - 1); }
    if (ix < w - 1 && walk[i + 1] === 1 && seen[i + 1] === 0) { seen[i + 1] = 1; queue.push(i + 1); }
    if (iy > 0 && walk[i - w] === 1 && seen[i - w] === 0) { seen[i - w] = 1; queue.push(i - w); }
    if (iy < h - 1 && walk[i + w] === 1 && seen[i + w] === 0) { seen[i + w] = 1; queue.push(i + w); }
  }
  for (const i of queue) seen[i] = 0; // leave the scratch buffer clean for the next call

  // Sort by straight-line distance from the asked-for point (ties broken by tile index, so the order is stable).
  const d2 = (i: number): number => {
    const ix = i % w;
    const iy = (i - ix) / w;
    return (ix + 0.5 - x) * (ix + 0.5 - x) + (iy + 0.5 - y) * (iy + 0.5 - y);
  };
  queue.sort((a, b) => d2(a) - d2(b) || a - b);
  if (queue.length > pool) queue.length = pool;

  // Keep the nearest tile, then a random choice of the others.
  const rest = queue.slice(1);
  rng.shuffle(rest);
  const chosen = [queue[0], ...rest.slice(0, count - 1)];
  chosen.sort((a, b) => d2(a) - d2(b) || a - b);
  for (const i of chosen) {
    const ix = i % w;
    result.push({ x: ix + 0.5, y: (i - ix) / w + 0.5 });
  }
  return result;
}
