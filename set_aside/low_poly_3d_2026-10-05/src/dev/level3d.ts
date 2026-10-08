// Dev page: a real level of the game (game/dungeon.ts made it) as a still in low-poly 3D, to see
// what gl/level3.ts builds of it.
//   node tools/preview.mjs src/dev/level3d.ts shots/3d/level.png 1400 800 "seed=7,depth=1,room=0,half=9"
//   room=<n>: look at the middle of that room (0 = where the hero begins); x=, y= instead: a tile
import { paint } from '../gl/gl';
import type { Scene } from '../gl/gl';
import { CHUNK, buildPiece, wallHeights } from '../gl/level3';
import { Mesh } from '../gl/mesh';
import { gameCam } from '../gl/scenes';
import { makeDungeon } from '../game/level';

const arg = new Map(decodeURIComponent(location.hash.slice(1)).split(',').map((kv) => kv.split('=') as [string, string]));
const num = (k: string, d: number): number => (arg.has(k) ? Number(arg.get(k)) : d);
const L = makeDungeon(num('depth', 1), num('seed', 7));
const f = L.floor;
const room = f.rooms[Math.min(f.rooms.length - 1, num('room', 0))];
const gx = num('x', room.x + room.w / 2);
const gy = num('y', room.y + room.h / 2);
const half = num('half', 9);

const cv = document.createElement('canvas');
cv.width = window.innerWidth;
cv.height = window.innerHeight;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.style.background = '#000';
document.body.appendChild(cv);

const t0 = performance.now();
const H = wallHeights(L);
const t1 = performance.now();
const mesh = new Mesh();
const reach = Math.ceil((half * 2.6) / CHUNK) + 1;
let pieces = 0;
const lights: Scene['lights'] = [];
for (let cy = Math.floor(gy / CHUNK) - reach; cy <= Math.floor(gy / CHUNK) + reach; cy++) {
  for (let cx = Math.floor(gx / CHUNK) - reach; cx <= Math.floor(gx / CHUNK) + reach; cx++) {
    if (cx < 0 || cy < 0 || cx * CHUNK >= f.w || cy * CHUNK >= f.h) continue;
    const p = buildPiece(L, H, cx, cy);
    if (p.mesh.data.length === 0) continue;
    mesh.add(p.mesh);
    pieces++;
    for (const fl of p.flames) if (lights.length < 12 && Math.hypot(fl.x - gx, fl.y - gy) < half * 1.6) lights.push({ at: [fl.y, fl.x, fl.z + 0.2], color: [1.5, 0.67, 0.21], reach: 4.5 });
  }
}
const t2 = performance.now();
// (the painter's X is the game's y)
const scene: Scene = {
  mesh,
  cam: gameCam([gy, gx, 0.5], half),
  sky: [0.105, 0.11, 0.24],
  ground: [0.035, 0.032, 0.08],
  moonFrom: [0.75, -0.55, 1.15],
  moon: [0.38, 0.42, 0.72],
  lights: [{ at: [gy + 0.6, gx + 0.6, 2.2], color: [0.5, 0.55, 1.0], reach: 9 }, ...lights],
  bounds: { at: [gy, gx, 1], half: half * 2 },
  vignette: 0.4,
};
paint(cv, scene);
const hs = new Map<string, number>();
for (let i = 0; i < H.length; i++) if (H[i] > 0) hs.set(H[i].toFixed(2), (hs.get(H[i].toFixed(2)) ?? 0) + 1);
console.log(`level ${f.w}x${f.h}, ${f.rooms.length} rooms; heights ${[...hs].sort().map(([k, v]) => `${k}:${v}`).join(' ')}`);
console.log(`heights in ${Math.round(t1 - t0)} ms; ${pieces} pieces, ${mesh.triangles} triangles in ${Math.round(t2 - t1)} ms (${((t2 - t1) / Math.max(1, pieces)).toFixed(1)} each)`);
(window as unknown as { __ready: boolean }).__ready = true;
