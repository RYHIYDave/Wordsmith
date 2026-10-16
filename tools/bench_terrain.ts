// Bench: how long the outdoor ground takes to paint (main chat, act 1).
import { paintTerrain, terrainOf } from '../src/art/terrain';
import { QUARRY_LOOK } from '../src/art/quarry';
import { CANYON_LOOK } from '../src/art/canyon';
import { pinewoodLook } from '../src/art/pinewood';
import { T_FLOOR, T_WALL } from '../src/game/types';
import type { Floor } from '../src/game/types';
const W = 70, H = 70;
const tiles = new Uint8Array(W * H).fill(T_WALL);
const blobs = [[18, 18, 9], [36, 30, 11], [52, 50, 9]];
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (blobs.some(([cx, cy, r]) => Math.hypot(x - cx, y - cy) < r)) tiles[y * W + x] = T_FLOOR;
  if (Math.abs(x - y) < 1.5 && x > 15 && x < 55) tiles[y * W + x] = T_FLOOR;
}
const f = { depth: 6, seed: 1, w: W, h: H, tiles, variant: new Uint8Array(W * H), rooms: [], start: { x: 0, y: 0 }, boss: { x: 0, y: 0 }, packs: [], props: [] } as unknown as Floor;
for (const [name, look] of [['quarry', QUARRY_LOOK], ['canyon', CANYON_LOOK], ['pine', pinewoodLook({})]] as const) {
  let t0 = performance.now();
  const T = terrainOf(f, look as never);
  const tField = performance.now() - t0;
  const times: number[] = [];
  for (const [px, py] of [[0, 600], [256, 700], [-512, 900], [0, 1100], [700, 1200]]) {
    t0 = performance.now();
    paintTerrain(T, px, py, 256, 256);
    times.push(Math.round(performance.now() - t0));
  }
  const t1 = performance.now();
  paintTerrain(T, 100, 800, 128, 128);
  console.log(name, 'field', Math.round(tField), 'ms; 256 pieces', times.join(' '), 'ms; one 128:', Math.round(performance.now() - t1));
}
