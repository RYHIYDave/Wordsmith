// THE GODOT PORT (branch godot/port; the project is godot/): floor 1 as the Godot version needs it, painted by the game's
// own code so that it looks exactly as it does in Play.html.
//   1. godot/assets/floor1/ground.png + ground.json: the Crypt's first floor stone (art/ground.ts makeGroundArt with
//      art/crypt.ts CRYPT_FLOORS[0], as main.ts cryptGround(1) has it): its floor tiles, its wall faces, the shade a wall
//      casts on the floor at its foot and the floor's edges, packed in one sheet. Every rect and anchor in picture pixels,
//      two to a game pixel (the grain the heroes are baked at).
//   2. godot/assets/floor1/layout.json: a floor 1 laid out by the game's own map-maker (game/level.ts makeDungeon).
//   npx tsx tools/godot_export.ts [seed]
import { mkdirSync, writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { gameSwitches } from './godot_switches';
import { makeGroundArt } from '../src/art/ground';
import { CRYPT_FLOORS } from '../src/art/crypt';
import { Game } from '../src/game/game';
import { MONSTERS } from '../src/game/defs';
import { doorMiddle, doorPiers, doorTiles, doorWay } from '../src/game/doors';
import { figureOf } from '../src/art/bestiary';
import { bakeName } from '../src/render/monsters_bake_list';

declare const process: { argv: string[] };
paintWithoutCanvas();
// (the game's own switches, as it starts: tools/godot_switches.ts)
gameSwitches();
const seed = Number(process.argv[2] ?? 1) >>> 0;
const OUT = 'godot/assets/floor1';
mkdirSync(OUT, { recursive: true });

// --- a PNG with its alpha (tools/px_png.ts lays pictures on a background; Godot wants them clear) ---
function png(w: number, h: number, rgba: Uint8ClampedArray): Uint8Array {
  const raw = new Uint8Array((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) raw.set(rgba.subarray(y * w * 4, (y + 1) * w * 4), y * (w * 4 + 1) + 1);
  const be = (n: number): number[] => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  const chunk = (type: string, data: Uint8Array): number[] => {
    const td = new Uint8Array(4 + data.length);
    for (let i = 0; i < 4; i++) td[i] = type.charCodeAt(i);
    td.set(data, 4);
    return [...be(data.length), ...td, ...be(crc32(td) >>> 0)];
  };
  const ihdr = new Uint8Array([...be(w), ...be(h), 8, 6, 0, 0, 0]);
  return new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, ...chunk('IHDR', ihdr), ...chunk('IDAT', deflateSync(raw, { level: 9 })), ...chunk('IEND', new Uint8Array(0))]);
}

// --- 1. the ground: every picture at two picture pixels to a game pixel, shelf-packed in one sheet ---
const g = makeGroundArt(CRYPT_FLOORS[0]);
// (the floor's tiles repeat every PERIOD tiles each way: art/ground.ts keeps PERIOD to itself, so find it)
let period = 1;
while (period < 64 && g.floor(period, 0) !== g.floor(0, 0)) period++;
const named: [string, Sprite][] = [];
for (let ty = 0; ty < period; ty++) for (let tx = 0; tx < period; tx++) named.push([`floor ${tx},${ty}`, g.floor(tx, ty)]);
g.faceLeft.forEach((s, i) => named.push([`face left ${i}`, s]));
g.faceRight.forEach((s, i) => named.push([`face right ${i}`, s]));
for (const k of ['shadeLeft', 'shadeRight', 'shadeCorner', 'edgeLeft', 'edgeRight'] as const) named.push([k, g[k]]);

const SHEET_W = 1024;
interface Placed { name: string; x: number; y: number; w: number; h: number; ax: number; ay: number }
const placed: Placed[] = [];
let cx = 0;
let cy = 0;
let rowH = 0;
for (const [name, s] of named) {
  const k = 2 / (s.density ?? 1);
  const p = paintingOf(s);
  const w = p.w * k;
  const h = p.h * k;
  if (cx + w > SHEET_W) { cx = 0; cy += rowH + 1; rowH = 0; }
  placed.push({ name, x: cx, y: cy, w, h, ax: s.ax * 2, ay: s.ay * 2 });
  cx += w + 1;
  rowH = Math.max(rowH, h);
}
const SHEET_H = cy + rowH;
const sheet = new Uint8ClampedArray(SHEET_W * SHEET_H * 4);
named.forEach(([, s], n) => {
  const at = placed[n];
  const k = 2 / (s.density ?? 1);
  const p = paintingOf(s);
  for (let j = 0; j < at.h; j++) for (let i = 0; i < at.w; i++) {
    const o = (Math.floor(j / k) * p.w + Math.floor(i / k)) * 4;
    const d = ((at.y + j) * SHEET_W + at.x + i) * 4;
    for (let c = 0; c < 4; c++) sheet[d + c] = p.d[o + c];
  }
});
writeFileSync(`${OUT}/ground.png`, png(SHEET_W, SHEET_H, sheet));
writeFileSync(`${OUT}/ground.json`, JSON.stringify({ theme: 'crypt 1', period, sprites: placed }, null, 0));
console.log(`ground: ${placed.length} pictures (floor repeats every ${period} tiles; ${g.faceLeft.length} + ${g.faceRight.length} wall faces) in a ${SHEET_W}x${SHEET_H} sheet`);

// --- 2. a floor 1 as the game itself sets it up: a new Warrior's game, into the first dungeon (as tests/action_f1_game.test.ts
// does), its layout and every monster spawned on it ---
// (a Level, game/state.ts: its Floor, game/types.ts, and the grids made from it: `walk` where a body may stand, `low` the
// walls drawn cut down low because floor lies behind them)
const game = new Game('warrior', seed);
game.depth = 1;
game.enterDungeon();
const level = game.level;
const L = level.floor;
const arr = (a: ArrayLike<number> | undefined | null): number[] | null => (a ? Array.from(a) : null);
const count = (v: number): number => L.tiles.reduce((n, t) => n + (t === v ? 1 : 0), 0);
writeFileSync(`${OUT}/layout.json`, JSON.stringify({
  depth: 1, seed, w: L.w, h: L.h,
  tiles: arr(L.tiles), variant: arr(L.variant), cut: arr(L.cut), height: arr(L.height),
  walk: arr(level.walk), low: arr(level.low),
  start: { x: game.hero.x, y: game.hero.y }, boss: L.boss,
  rooms: L.rooms.map((r) => ({ id: r.id, x: r.x, y: r.y, w: r.w, h: r.h, kind: r.kind, path: r.path })),
  // (game/doors.ts: each door and gate the map-maker laid, as the game keeps it (open, want), with its doorway's three tiles,
  // the tiles passed through (a door's middle one, a gate's three), the stone either side of a door, and its middle)
  doors: level.doors.map((d) => ({
    kind: d.spot.kind, room: d.spot.room, alongX: d.spot.alongX, near: d.spot.near, a: d.spot.a, plane: d.spot.plane, out: d.spot.out,
    tiles: doorTiles(L, d.spot), way: doorWay(L, d.spot), piers: doorPiers(L, d.spot), middle: doorMiddle(d.spot), open: d.open, want: d.want,
  })),
}));

// --- 3. its monsters: each as game.ts spawn made it (life, damage and speed with the first floor's softening in them), its
// figure (art/bestiary.ts figureOf: the pictures it is drawn with) and its kind's numbers (game/defs.ts MONSTERS) ---
const plain = (o: object): Record<string, number | string | boolean> => {
  const out: Record<string, number | string | boolean> = {};
  for (const [k, v] of Object.entries(o)) if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') out[k] = v;
  return out;
};
const kinds = new Set<string>();
const monsters = game.monsters.map((m) => {
  kinds.add(m.kind);
  return { ...plain(m), figure: bakeName(figureOf(m)) };
});
const defs: Record<string, Record<string, number | string | boolean>> = {};
for (const k of kinds) defs[k] = plain(MONSTERS[k as keyof typeof MONSTERS]);
writeFileSync(`${OUT}/monsters.json`, JSON.stringify({ hero: plain(game.hero), monsters, defs }, null, 1));
const tally: Record<string, number> = {};
for (const m of monsters) tally[`${m.kind}/${m.figure}`] = (tally[`${m.kind}/${m.figure}`] ?? 0) + 1;
console.log(`monsters: ${monsters.length}: ${Object.entries(tally).map(([k, n]) => `${n} ${k}`).join(', ')}`);
const cuts = L.cut ? Array.from(L.cut).filter((c) => c !== 0).length : 0;
const raised = L.height ? Array.from(L.height).filter((c) => c !== 0).length : 0;
const lows = Array.from(level.low).filter((c) => c !== 0).length;
console.log(`layout: seed ${seed}, ${L.w}x${L.h}, ${count(1)} floor / ${count(2)} wall / ${count(3)} pit tiles, ${L.rooms.length} rooms, ${cuts} cut tiles, ${raised} raised or sunken, ${lows} low walls; start ${L.start.x},${L.start.y}`);
