// FLOOR 4 AS THE BURIED CHAPEL OF BONES: WHERE ITS OWN THINGS GO (the art chat's art/chapel.ts, behind CHAPEL: his “A with B's
// break-in (Recommended)”, 2 Nov 2026, and his “Yes, hand it over (Recommended)”; off until his yes to it in play). As the art
// chat's README lays it out ("How to bring it in", docs/mockups/floor4_look/README.md):
//   THE WAY IN FROM FLOOR 3: three tiles of a back wall of the first room, where the passage from the prison's door comes down a
//     stair through an arch; the hero comes in standing a tile and a half inside it; nobody walks into it (its tiles stay wall);
//   THE BREAK-IN: one or two stretches of three tiles of wall where the miners' tunnel burst through (in the first room and the
//     next), the rock spilled before each (it stands: its tile is not walked on), a broken pew, a pew thrown down and a dropped
//     pick near the first;
//   CANDLES ON THE FLOOR in every room, three to six (more before his gate); in his hall its two piers in the back corners and the
//     cult's altar against the back wall without the cave, candles either side of it.
// What is placed here is the level's (Level.chapel, Level.props); what is drawn is render/chapel.ts's.

import { CHAPEL } from '../art/chapel';
import { placeInBackWall } from './ways';
import { T_FLOOR, T_WALL } from './types';
import type { DoorSpot, Floor } from './types';
import type { Level, PropInst } from './state';

/** Floor 4's own stretches of wall: the way in, the break-ins (each three wall tiles that stay wall). */
export interface ChapelPlan {
  wayIn: DoorSpot | null;
  breaks: DoorSpot[];
}

/** Is floor `depth` the chapel (floor 4, CHAPEL on)? */
export function chapelHere(depth: number): boolean {
  return CHAPEL.on && depth === 4;
}

/** The three wall tiles of a stretch (tile indices). */
export function stretchTiles(f: Floor, s: DoorSpot): number[] {
  const line = s.plane - 1;
  return [0, 1, 2].map((k) => (s.alongX ? line * f.w + s.a + k : (s.a + k) * f.w + line));
}

/** Where the art chat's picture of a stretch is anchored: the foot of the wall's face under the middle of its middle tile. */
export function stretchAnchor(s: DoorSpot): { x: number; y: number } {
  return s.alongX ? { x: s.a + 1.5, y: s.plane } : { x: s.plane, y: s.a + 1.5 };
}

/** Is tile (x, y) on the two rows of floor before a stretch, or a tile to either side of them? */
export function beforeStretch(s: DoorSpot, x: number, y: number): boolean {
  const along = s.alongX ? x : y;
  const inside = (s.alongX ? y : x) - s.plane;
  return along >= s.a - 1 && along <= s.a + 3 && inside >= 0 && inside < 2;
}

/** Where the way in and the break-ins go (nothing changes in the floor: their tiles stay wall). */
export function placeChapel(f: Floor): ChapelPlan {
  const first = f.rooms[0];
  const wayIn = placeInBackWall(f, first);
  const used: DoorSpot[] = wayIn ? [wayIn] : [];
  const clash = (alongX: boolean, a: number): boolean => used.some((u) => u.alongX === alongX && Math.abs(u.a - a) < 5);
  const breaks: DoorSpot[] = [];
  const next = f.rooms.find((q) => q.path === 1 && q.kind !== 'boss');
  for (const r of [first, next]) {
    if (!r) continue;
    const b = placeInBackWall(f, r, clash);
    if (b) {
      breaks.push(b);
      used.push(b);
    }
  }
  return { wayIn, breaks };
}

/** A small hash of a tile, 0 to 1. */
function hash(x: number, y: number, k: number): number {
  let h = Math.imul(x * 374761393 + y * 668265263 + k * 2147483647, 1274126177);
  h ^= h >>> 13;
  h = Math.imul(h, 1103515245);
  return ((h >>> 0) % 10007) / 10007;
}

/**
 * THE CHAPEL'S THINGS, laid last (after the floor's own pieces, so that nothing is laid on another): the rock before each break-in,
 * the pews and the pick by the first; the candles in every room; his hall's piers and the cult's altar. What stands is not walked on.
 */
export function layChapel(L: Level): void {
  const plan = L.chapel;
  if (!plan) return;
  const f = L.floor;
  const W = f.w;
  const taken = new Uint8Array(W * f.h);
  for (const p of L.props) taken[p.ty * W + p.tx] = 1;
  for (const t of L.dress?.tiles ?? []) taken[t.i] = 1;
  const plain = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < f.h && f.tiles[y * W + x] === T_FLOOR && !(f.cut && f.cut[y * W + x] !== 0) && !(f.height && f.height[y * W + x] !== 0) && L.walk[y * W + x] === 1;
  // (kept clear: where he comes in, the waypoint, before every doorway and stretch)
  const keep = (x: number, y: number): boolean => {
    if (Math.hypot(x + 0.5 - f.start.x, y + 0.5 - f.start.y) < 2.5) return true;
    const w = L.ways?.way;
    if (w && Math.hypot(x + 0.5 - w.x, y + 0.5 - w.y) < 2.2) return true;
    if (Math.hypot(x + 0.5 - f.boss.x, y + 0.5 - f.boss.y) < 3) return true;
    for (const d of L.doors) {
      const along = d.spot.alongX ? x : y;
      const inside = Math.abs((d.spot.alongX ? y : x) - d.spot.plane + 0.5);
      if (along >= d.spot.a - 1 && along <= d.spot.a + 3 && inside < 2.6) return true;
    }
    for (const s of [plan.wayIn, ...plan.breaks, L.ways?.cave?.spot ?? null]) if (s && beforeStretch(s, x, y)) return true;
    return false;
  };
  /** Open floor all round (a thing standing there cuts nothing off). */
  const open = (x: number, y: number): boolean => {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (!plain(x + dx, y + dy)) return false;
    return true;
  };
  const put = (name: string, x: number, y: number, solid: boolean): void => {
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    const p: PropInst = { kind: 'piece', name, tx, ty, x, y, solid, state: 0, variant: 0 };
    L.props.push(p);
    taken[ty * W + tx] = 1;
    if (solid) L.walk[ty * W + tx] = 0;
  };
  const free = (x: number, y: number): boolean => plain(x, y) && !taken[y * W + x] && !keep(x, y);
  // THE BREAK-INS: the rock spilled before each, at the wall's foot under its middle, a third of a tile out
  plan.breaks.forEach((b, n) => {
    const A = stretchAnchor(b);
    const [x, y] = b.alongX ? [A.x, A.y + 0.33] : [A.x + 0.33, A.y];
    if (plain(Math.floor(x), Math.floor(y))) put(`rock spilled from the break, ${b.alongX ? 'along x' : 'along y'}`, x, y, true);
    if (n > 0) return;
    // (by the first: a broken pew, a pew thrown down, a dropped pick, on open floor two to four tiles out)
    const near: [string, boolean][] = [['a dropped pick', false], ['a broken pew', true], ['a pew thrown down', true]];
    for (const [name, solid] of near) {
      let best: [number, number] | null = null;
      let bd = Infinity;
      for (let dy = -5; dy <= 5; dy++) {
        for (let dx = -5; dx <= 5; dx++) {
          const tx = Math.floor(A.x) + dx;
          const ty = Math.floor(A.y) + dy;
          const d = Math.hypot(tx + 0.5 - A.x, ty + 0.5 - A.y);
          if (d < 1.8 || d > 4.5 || !free(tx, ty) || (solid && !open(tx, ty))) continue;
          const score = Math.abs(d - 2.8) + hash(tx, ty, 41 + name.length);
          if (score < bd) {
            bd = score;
            best = [tx, ty];
          }
        }
      }
      if (best) put(name, best[0] + 0.5, best[1] + 0.5, solid);
    }
  });
  // HIS HALL: its two piers in the back corners (along its far wall, along x), the cult's altar against the back wall the cave is not in
  const hall = f.rooms.find((r) => r.kind === 'boss') ?? null;
  if (hall) {
    for (const [cx, dir, name] of [[hall.x, 1, 'a pier of the hall, its ribs toward x'], [hall.x + hall.w - 1, -1, 'a pier of the hall, its ribs away from x']] as const) {
      for (let k = 0; k < 4; k++) {
        const tx = cx + dir * k;
        const ty = hall.y + k;
        if (plain(tx, ty) && !taken[ty * W + tx]) {
          put(name, tx + 0.5 + dir * -0.16, ty + 0.34, true);
          break;
        }
      }
    }
    const cave = L.ways?.cave?.spot ?? null;
    const alongX = !(cave && cave.alongX);
    const mid = alongX ? Math.floor(hall.x + hall.w / 2) : Math.floor(hall.y + hall.h / 2);
    for (const off of [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5]) {
      const [tx, ty] = alongX ? [mid + off, hall.y + 1] : [hall.x + 1, mid + off];
      const behind = alongX ? f.tiles[(ty - 2) * W + tx] : f.tiles[ty * W + tx - 2];
      if (behind !== T_WALL || !free(tx, ty) || !open(tx, ty)) continue;
      put("the cult's altar", alongX ? tx + 0.5 : tx + 0.65, alongX ? ty + 0.65 : ty + 0.5, true);
      // (candles either side of it)
      for (const s of [-1.6, 1.6]) {
        const [cx, cy] = alongX ? [tx + 0.5 + s, ty + 0.2] : [tx + 0.2, ty + 0.5 + s];
        if (free(Math.floor(cx), Math.floor(cy))) put('candles on the floor, many', cx, cy, false);
      }
      break;
    }
  }
  // CANDLES ON THE FLOOR in every room, three to six, more in the room before his gate: by its walls, apart
  const before = f.rooms.reduce((m, r) => (r.kind !== 'boss' && r.path > m ? r.path : m), 0);
  for (const r of f.rooms) {
    if (r.kind === 'boss') continue;
    const want = 3 + Math.floor(hash(r.x, r.y, 77) * 4) + (r.path === before && r.path > 0 ? 2 : 0);
    const spots: [number, number][] = [];
    for (let y = r.y; y < r.y + r.h; y++) {
      for (let x = r.x; x < r.x + r.w; x++) {
        // (a tile by a wall: the wall at y - 1 or x - 1, or a corner)
        const byWall = f.tiles[(y - 1) * W + x] === T_WALL || f.tiles[y * W + x - 1] === T_WALL || f.tiles[(y + 1) * W + x] === T_WALL || f.tiles[y * W + x + 1] === T_WALL;
        if (byWall && free(x, y)) spots.push([x, y]);
      }
    }
    spots.sort((p, q) => hash(p[0], p[1], 79) - hash(q[0], q[1], 79));
    const laid: [number, number][] = [];
    for (const [x, y] of spots) {
      if (laid.length >= want) break;
      if (laid.some(([u, v]) => Math.hypot(u - x, v - y) < 3)) continue;
      laid.push([x, y]);
      put(hash(x, y, 83) < 0.6 ? 'candles on the floor, a few' : 'candles on the floor, many', x + 0.5, y + 0.5, false);
    }
  }
}
