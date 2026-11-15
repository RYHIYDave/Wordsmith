// THE GODOT PORT: the town as the game itself makes it, for godot/scripts/town.gd; and floor 1's gate back up to it.
//   godot/assets/town/ground.png + ground.json: the town's stone (art/ground.ts makeGroundArt, the vault's: render/main.ts
//     vault.ground), packed as floor 1's is (tools/godot_export.ts).
//   godot/assets/town/pics.png + pics.json: everything that stands in it (art/town.ts makeTownProps with the ring made new,
//     art/ring3.ts; art/props.ts makeDungeonProps' braziers, pillars, barrels, urn; art/town_ways.ts the stairs down and the
//     shaft's head) and floor 1's stairs up (floorStairsUp), each with its anchor, two picture pixels to a game pixel.
//   godot/assets/town/layout.json: the town Level a new Warrior's game begins in (game/level.ts makeTown, by Game.enterTown):
//     its tiles (the barred gate's doorway shut as wall: its pictures are not brought over yet), the walk grid, where he
//     stands, every piece (kind, place, variant, flat or standing), the stairs, the shaft, the stations, the ring's timings.
//   godot/assets/town/floor1_gate.json: floor 1's gate up to the town as the game has it entered from the town
//     (Game.enterDungeon('gate')): where he stands, its doorway's tiles, where its stairs-up picture is laid.
//   npx tsx tools/godot_town.ts [seed]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { Game } from '../src/game/game';
import { makeGroundArt } from '../src/art/ground';
import { makeTownProps } from '../src/art/town';
import { makeDungeonProps } from '../src/art/props';
import { townStairs, townShaft, floorStairsUp } from '../src/art/town_ways';
import { CRYPT_FLOORS } from '../src/art/crypt';
import { STONE_AT } from '../src/art/ring3';
import { POWER } from '../src/art/quest3';
import { TOWN } from '../src/game/level';
import { TOWN_STAIR } from '../src/game/ways';
import { doorTiles, doorFace } from '../src/game/doors';
import { PILLAR } from '../src/art/gates';

declare const process: { argv: string[] };
paintWithoutCanvas();
const seed = Number(process.argv[2] ?? 1) >>> 0;
const OUT = 'godot/assets/town';
mkdirSync(OUT, { recursive: true });

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
  return new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, ...chunk('IHDR', new Uint8Array([...be(w), ...be(h), 8, 6, 0, 0, 0])), ...chunk('IDAT', deflateSync(raw, { level: 9 })), ...chunk('IEND', new Uint8Array(0))]);
}

/** Pack named sprites into one sheet (each at two picture pixels to a game pixel, anchor kept) and write it. */
function sheet(named: [string, Sprite][], name: string, width = 2048): number {
  const placed: { name: string; x: number; y: number; w: number; h: number; ax: number; ay: number }[] = [];
  let cx = 0;
  let cy = 0;
  let rowH = 0;
  for (const [n, s] of named) {
    const k = 2 / (s.density ?? 1);
    const p = paintingOf(s);
    const w = p.w * k;
    const h = p.h * k;
    if (cx + w > width) { cx = 0; cy += rowH + 1; rowH = 0; }
    placed.push({ name: n, x: cx, y: cy, w, h, ax: s.ax * 2, ay: s.ay * 2 });
    cx += w + 1;
    rowH = Math.max(rowH, h);
  }
  const H = cy + rowH;
  const px = new Uint8ClampedArray(width * H * 4);
  named.forEach(([, s], i) => {
    const at = placed[i];
    const k = 2 / (s.density ?? 1);
    const p = paintingOf(s);
    for (let j = 0; j < at.h; j++) for (let x = 0; x < at.w; x++) {
      const o = (Math.floor(j / k) * p.w + Math.floor(x / k)) * 4;
      const d = ((at.y + j) * width + at.x + x) * 4;
      for (let c = 0; c < 4; c++) px[d + c] = p.d[o + c];
    }
  });
  writeFileSync(`${OUT}/${name}.png`, png(width, H, px));
  writeFileSync(`${OUT}/${name}.json`, JSON.stringify(placed));
  return H;
}

// --- the town's stone ---
const g = makeGroundArt();
let period = 1;
while (period < 64 && g.floor(period, 0) !== g.floor(0, 0)) period++;
const groundNamed: [string, Sprite][] = [];
for (let ty = 0; ty < period; ty++) for (let tx = 0; tx < period; tx++) groundNamed.push([`floor ${tx},${ty}`, g.floor(tx, ty)]);
g.faceLeft.forEach((s, i) => groundNamed.push([`face left ${i}`, s]));
g.faceRight.forEach((s, i) => groundNamed.push([`face right ${i}`, s]));
for (const k of ['shadeLeft', 'shadeRight', 'shadeCorner'] as const) groundNamed.push([k, g[k]]);
const gh = sheet(groundNamed, 'ground', 1024);
writeFileSync(`${OUT}/ground.json`, JSON.stringify({ theme: 'vault', period, sprites: JSON.parse(readFileSync(`${OUT}/ground.json`, 'utf8')) }));

// --- what stands in it ---
const T = makeTownProps();
const D = makeDungeonProps();
const R = T.ring3!;
const named: [string, Sprite][] = [];
const many = (key: string, list: Sprite[]): void => list.forEach((s, i) => named.push([`${key} ${i}`, s]));
many('forge', T.forge);
named.push(['anvil', T.anvil], ['rack', T.rack], ['trough', T.trough], ['tentBack', T.tentBack], ['tentTable', T.tentTable], ['rug', T.rug], ['stash', T.stash]);
many('lexicon', T.lexicon);
many('ring', R.floor);
named.push(['ring dark', R.floorDark]);
many('fuse', R.fuse);
named.push(['slab empty', R.slabEmpty]);
many('slab set', R.slabSet);
many('slab runes', R.slabRunes);
many('slab', R.slab);
R.stones.forEach((ways, v) => ways.forEach((frames, b) => frames.forEach((s, f) => named.push([`stone ${v} ${b} ${f}`, s]))));
many('brazier', D.brazier);
named.push(['pillar', D.pillar], ['barrel', D.barrel], ['urn', D.urn]);
named.push(['stairs down', townStairs(TOWN_STAIR.way as 'x' | 'y')]);
const head = townShaft();
named.push(['shaft back', head.back], ['shaft front', head.front]);
named.push(['stairs up x', floorStairsUp(CRYPT_FLOORS[0], true)], ['stairs up y', floorStairsUp(CRYPT_FLOORS[0], false)]);
const ph = sheet(named, 'pics');

// --- the town a new Warrior begins in ---
const game = new Game('warrior', seed);
const L = game.level;
const f = L.floor;
const tiles = Array.from(f.tiles);
// (the gate in the back wall, barred on a new game: its doorway drawn as wall until its pictures are brought over)
const gateTiles = L.ways && L.ways.gate >= 0 ? doorTiles(f, L.doors[L.ways.gate].spot) : [];
for (const i of gateTiles) tiles[i] = 2;
writeFileSync(`${OUT}/layout.json`, JSON.stringify({
  depth: 0, seed, w: f.w, h: f.h, tiles, variant: Array.from(f.variant), walk: Array.from(L.walk),
  start: { x: game.hero.x, y: game.hero.y, fx: game.hero.fx, fy: game.hero.fy },
  rooms: f.rooms.map((r) => ({ x: r.x, y: r.y, w: r.w, h: r.h })),
  props: L.props.map((p) => ({ kind: p.kind, x: p.x, y: p.y, variant: p.variant, solid: p.solid })),
  stair: L.ways?.stair ? { ...L.ways.stair } : null,
  shaft: L.ways?.shaft ? { x: L.ways.shaft.x, y: L.ways.shaft.y } : null,
  stations: L.stations,
  ring: { x: TOWN.wordsmith.x + 0.5, y: TOWN.wordsmith.y + 0.5, stones: STONE_AT, power: POWER },
}));

// --- floor 1's gate up, as it is when he comes down the stairs ---
const down = new Game('warrior', seed);
down.depth = 1;
(down as unknown as { enterDungeon(by?: string): void }).enterDungeon('gate');
const DL = down.level;
const gate = DL.ways && DL.ways.gate >= 0 ? DL.doors[DL.ways.gate] : null;
if (gate) {
  const s = gate.spot;
  const face = doorFace(s);
  const wide = PILLAR / 32;
  const [ux, uy] = s.alongX ? [s.a - wide, face] : [face, s.a - wide];
  writeFileSync(`${OUT}/floor1_gate.json`, JSON.stringify({
    hero: { x: down.hero.x, y: down.hero.y, fx: down.hero.fx, fy: down.hero.fy },
    tiles: doorTiles(DL.floor, s).map((i) => [i % DL.floor.w, Math.floor(i / DL.floor.w)]),
    alongX: s.alongX, up: { x: ux, y: uy }, pic: s.alongX ? 'stairs up x' : 'stairs up y',
  }));
}
console.log(`town: ${f.w}x${f.h}, ${L.props.length} pieces, start ${game.hero.x},${game.hero.y}; gate shut as wall (${gateTiles.length} tiles); ground ${gh}px, pictures ${named.length} in a sheet ${ph}px tall`);
console.log(gate ? `floor 1's gate: ${gate.spot.alongX ? 'along x' : 'along y'} at ${gate.spot.a},${doorFace(gate.spot)}; he comes in at ${down.hero.x.toFixed(2)},${down.hero.y.toFixed(2)}` : 'floor 1 has no gate');
