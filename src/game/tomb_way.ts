// FLOOR 1 AS THE KING'S TOMB: WHAT STANDS OF ITS OWN (the art chat's art/tomb.ts, behind TOMB: his “Tomb with daylight
// (Recommended)”, “B, roots break in” and “Yes, hand it over (Recommended)”, 2 Nov 2026; off until his yes to it in play). As the art
// chat's README asks (docs/mockups/floor1_look/README.md, "How to bring it in", step 8): `a chained tomb` two to four in his hall, at
// its back; `a tomb of the court` here and there in the other rooms, against their back walls. Each stands: its tile is not walked
// on, and none cuts anything off (each on open floor). The roots, the puddles, the moss, the slabs, the daylight and the archways
// are only drawn (render/tomb.ts): nothing of them stands in anyone's way.

import { TOMB } from '../art/tomb';
import { T_FLOOR, T_WALL } from './types';
import type { Level, PropInst } from './state';

/** Is floor `depth` the king's tomb (floor 1, TOMB on)? */
export function tombHere(depth: number): boolean {
  return TOMB.on && depth === 1;
}

/** A small hash of a tile, 0 to 1. */
function hash(x: number, y: number, k: number): number {
  let h = Math.imul(x * 374761393 + y * 668265263 + k * 2147483647, 1274126177);
  h ^= h >>> 13;
  h = Math.imul(h, 1103515245);
  return ((h >>> 0) % 10007) / 10007;
}

/** THE TOMBS, laid last (after the floor's own pieces). */
export function layTomb(L: Level): void {
  const f = L.floor;
  const W = f.w;
  const taken = new Uint8Array(W * f.h);
  for (const p of L.props) taken[p.ty * W + p.tx] = 1;
  const plain = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < f.h && f.tiles[y * W + x] === T_FLOOR && !(f.cut && f.cut[y * W + x] !== 0) && !(f.height && f.height[y * W + x] !== 0) && L.walk[y * W + x] === 1;
  const keep = (x: number, y: number): boolean => {
    if (Math.hypot(x + 0.5 - f.start.x, y + 0.5 - f.start.y) < 3) return true;
    const w = L.ways?.way;
    if (w && Math.hypot(x + 0.5 - w.x, y + 0.5 - w.y) < 2.2) return true;
    if (Math.hypot(x + 0.5 - f.boss.x, y + 0.5 - f.boss.y) < 3.5) return true;
    for (const s of L.ways?.stairs ?? []) if (x >= s.x - 2 && x <= s.x + 4 && y >= s.y - 2 && y <= s.y + 3) return true;
    for (const d of L.doors) {
      const along = d.spot.alongX ? x : y;
      const inside = Math.abs((d.spot.alongX ? y : x) - d.spot.plane + 0.5);
      if (along >= d.spot.a - 1 && along <= d.spot.a + 3 && inside < 2.6) return true;
    }
    return false;
  };
  const open = (x: number, y: number): boolean => {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (!plain(x + dx, y + dy)) return false;
    return true;
  };
  const put = (name: string, x: number, y: number): void => {
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    const p: PropInst = { kind: 'piece', name, tx, ty, x, y, solid: true, state: 0, variant: 0 };
    L.props.push(p);
    taken[ty * W + tx] = 1;
    L.walk[ty * W + tx] = 0;
  };
  // (a place a tile in from a back wall, on open floor: the tomb along the wall. In his hall, where its back is taken (its stairs,
  // its pillars and braziers), along the walls toward the eye after: a tile in from them too)
  const along = (r: { x: number; y: number; w: number; h: number }, want: number, name: string, seed: number, near: boolean): void => {
    const back: [number, number, boolean][] = [];
    const front: [number, number, boolean][] = [];
    // (a hall's corners may be rounded: its wall is found tile by tile, two tiles from the spot with floor between)
    const wallAt = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < f.h && f.tiles[y * W + x] === T_WALL;
    const floorAt = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < f.h && f.tiles[y * W + x] === T_FLOOR;
    for (let y = r.y; y < r.y + r.h; y++) {
      for (let x = r.x; x < r.x + r.w; x++) {
        if (!floorAt(x, y)) continue;
        if (wallAt(x, y - 2) && floorAt(x, y - 1)) back.push([x, y, true]);
        if (wallAt(x - 2, y) && floorAt(x - 1, y)) back.push([x, y, false]);
        if (near && wallAt(x, y + 2) && floorAt(x, y + 1)) front.push([x, y, true]);
        if (near && wallAt(x + 2, y) && floorAt(x + 1, y)) front.push([x, y, false]);
      }
    }
    const order = (l: [number, number, boolean][]): [number, number, boolean][] => l.sort((p, q) => hash(p[0], p[1], seed) - hash(q[0], q[1], seed));
    const spots = [...order(back), ...order(front)];
    const laid: [number, number][] = [];
    for (const [x, y, ax] of spots) {
      if (laid.length >= want) break;
      if (laid.some(([u, v]) => Math.hypot(u - x, v - y) < 3)) continue;
      if (taken[y * W + x] || keep(x, y) || !open(x, y)) continue;
      laid.push([x, y]);
      put(`${name}, ${ax ? 'along x' : 'along y'}`, x + 0.5, y + 0.5);
    }
  };
  for (const r of f.rooms) {
    if (r.kind === 'boss') along(r, 2 + Math.floor(hash(r.x, r.y, 6101) * 3), 'a chained tomb', 6103, true);
    else if (r.w >= 5 && r.h >= 5 && hash(r.x, r.y, 6105) < 0.55) along(r, 1, 'a tomb of the court', 6107, false);
  }
}
