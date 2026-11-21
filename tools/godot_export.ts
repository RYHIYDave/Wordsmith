// THE GODOT PORT (branch godot/port; the project is godot/): floor 1 as the Godot version needs it, painted by the game's
// own code so that it looks exactly as it does in Play.html.
//   1. godot/assets/floor1/ground.png + ground.json: the Crypt's first floor stone (art/ground.ts makeGroundArt with
//      art/crypt.ts CRYPT_FLOORS[0], as main.ts cryptGround(1) has it): its floor tiles, its wall faces, the shade a wall
//      casts on the floor at its foot and the floor's edges, packed in one sheet. Every rect and anchor in picture pixels,
//      two to a game pixel (the grain the heroes are baked at).
//   2. godot/assets/floor1/layout.json: a floor 1 laid out by the game's own map-maker (game/level.ts makeDungeon).
//   3. godot/assets/floor1/monsters.json: its monsters as the game spawns them.
//   npx tsx tools/godot_export.ts [seed] [floor]
// ANY FLOOR: the second number is the floor (1 if not given), written to godot/assets/floor<N>/: its layout as the game's
// map-maker lays it for that seed, where a new Warrior comes in, its ways on (the stairwell that opens in the boss's hall,
// the waypoint, floor 3's door out the back, floor 4's cave, floor 5's shaft), its traps, and every monster the game spawns.
import { mkdirSync, writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { gameSwitches } from './godot_switches';
import { makeGroundArt } from '../src/art/ground';
import { CRYPT_FLOORS } from '../src/art/crypt';
import { Game } from '../src/game/game';
import { MONSTERS, floorTitle } from '../src/game/defs';
import { doorMiddle, doorPiers, doorTiles, doorWay } from '../src/game/doors';
import { DOOR_OPENING, prisonDoorTiles } from '../src/game/prison_way';
import { figureOf } from '../src/art/bestiary';
import { bakeName } from '../src/render/monsters_bake_list';
import { PATIENT, bedPlace } from '../src/game/act1_rules/patient';
import { STOLEN_BOOK, censorGround } from '../src/game/act1_rules/censor';
import { CRIERS_JAR } from '../src/game/act2/undercity';
import { BELLS_TUNE, BELL_STILL } from '../src/game/bells';
import { ACT2_OWN, act2Ready } from '../src/game/act2_mobs';
import { cityFloor } from '../src/game/act1';
import { RNG } from '../src/engine/rng';

declare const process: { argv: string[] };
paintWithoutCanvas();
// (the game's own switches, as it starts: tools/godot_switches.ts)
gameSwitches();
const seed = Number(process.argv[2] ?? 1) >>> 0;
const depth = Math.max(1, Number(process.argv[3] ?? 1) | 0);
const OUT = `godot/assets/floor${depth}`;
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
const g = makeGroundArt(CRYPT_FLOORS[Math.min(depth, CRYPT_FLOORS.length) - 1]);
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
writeFileSync(`${OUT}/ground.json`, JSON.stringify({ theme: `crypt ${depth}`, period, sprites: placed }, null, 0));
console.log(`ground: ${placed.length} pictures (floor repeats every ${period} tiles; ${g.faceLeft.length} + ${g.faceRight.length} wall faces) in a ${SHEET_W}x${SHEET_H} sheet`);

// --- 2. a floor 1 as the game itself sets it up: a new Warrior's game, into the first dungeon (as tests/action_f1_game.test.ts
// does), its layout and every monster spawned on it ---
// (a Level, game/state.ts: its Floor, game/types.ts, and the grids made from it: `walk` where a body may stand, `low` the
// walls drawn cut down low because floor lies behind them)
const game = new Game('warrior', seed);
game.depth = depth;
game.enterDungeon();
// (THE WORDS: the same floor made for a hero whose wordsmith's ring is lit, as it is once the Master Rune-stone has been
// brought back from floor 1. Until it is, nothing in the game gives up a word (game.ts wordsFall): from this one, which of
// the monsters carry a word to give up. Everything else is taken from the floor above, made for a hero who has not found the
// stone: the game lays the fallen wordsmith on a floor only for him (`body`: where he lies, if he is still to be found), and
// the floor's look was recorded so. The two floors' monsters are the same monsters in the same places.)
const lit = new Game('warrior', seed);
lit.depth = depth;
lit.hero.ring = true;
lit.enterDungeon();
if (lit.monsters.length !== game.monsters.length || lit.monsters.some((m, i) => m.kind !== game.monsters[i].kind || m.x !== game.monsters[i].x || m.y !== game.monsters[i].y)) throw new Error('the floor made with the ring lit has other monsters');
const level = game.level;
const L = level.floor;
const arr = (a: ArrayLike<number> | undefined | null): number[] | null => (a ? Array.from(a) : null);
const count = (v: number): number => L.tiles.reduce((n, t) => n + (t === v ? 1 : 0), 0);
// (the ways on from this floor, game/ways.ts: the stairwell that opens in the boss's hall when he dies and the places it may
// open in, the waypoint by the way in, floor 3's door out the back of his hall, floor 4's cave, floor 5's shaft and the mouth
// he comes in by; each as the game keeps it)
const ways = level.ways ? (structuredClone(level.ways) as unknown as Record<string, any>) : null;
if (ways?.exit) {
  ways.exit.tiles = prisonDoorTiles(L, level.ways!.exit!);
  ways.exit.secs = DOOR_OPENING;
}
if (ways?.cave) ways.cave.tiles = doorTiles(L, level.ways!.cave!.spot);
writeFileSync(`${OUT}/layout.json`, JSON.stringify({
  depth, seed, w: L.w, h: L.h, title: floorTitle(depth),
  ways: ways ?? null,
  body: level.body ? { x: level.body.x, y: level.body.y } : null,
  tiles: arr(L.tiles), variant: arr(L.variant), cut: arr(L.cut), height: arr(L.height),
  walk: arr(level.walk), low: arr(level.low),
  // (LEDGES AND STAIRS, game/height.ts: which floor tiles are a flight of stairs and which way each goes up; the side steps a
  // body may take from each tile by the rules of height (null: a floor all of one height); the open grid: what sight, shots
  // and what flies pass over)
  stair: arr(L.stair), step: arr(level.step), open: arr(level.open),
  start: { x: game.hero.x, y: game.hero.y, fx: game.hero.fx, fy: game.hero.fy }, boss: L.boss,
  // (THE MIX, game/dungeon.ts: the room whose way in a lever's gate bars (`gated`), the nook its lever stands in, the room that
  // locks: only where the map-maker marked one)
  rooms: L.rooms.map((r) => ({ id: r.id, x: r.x, y: r.y, w: r.w, h: r.h, kind: r.kind, path: r.path, ...(r.gated ? { gated: true } : {}), ...(r.nook ? { nook: true } : {}), ...(r.locks ? { locks: true } : {}) })),
  // (the chests, barrels and urns: each by its place in the level's props (the looks' `props` go by it), where it stands, its
  // tile (solid: out of the walk grid until it is broken), and whether it is in a treasure vault; and THE MIX's levers, and
  // floor 3's forge crank, a lever by kind, named 'crank')
  props: level.props.map((p, i) => ({ i, kind: p.kind, x: p.x, y: p.y, tx: p.tx, ty: p.ty, state: p.state, solid: p.solid, ...(p.name ? { name: p.name } : {}) }))
    .filter((p) => p.kind === 'chest' || p.kind === 'barrel' || p.kind === 'urn' || p.kind === 'lever'),
  // (QUESTS1115, floor 12: THE CRIER'S JAR in the Rat King's nest, game/act2/undercity.ts CRIERS_JAR: its tile, solid until it is
  // taken (game.ts jarTick), and its place among the level's props (the look's state `jar<i>`); godot/scripts/act2/quest1115.gd)
  jar: (() => {
    const i = level.props.findIndex((p) => p.kind === 'piece' && p.name === CRIERS_JAR);
    if (i < 0) return null;
    const p = level.props[i];
    return { i, x: p.x, y: p.y, tx: p.tx, ty: p.ty, solid: p.solid };
  })(),
  // (THE MIX: each lever's tile and the room whose way in its gate bars: types.ts LeverSpot)
  levers: (L.levers ?? []).map((l) => ({ ...l })),
  // (the room each pack is of, by the pack's id: a room that locks counts the living of its own packs inside it, game.ts updateLocks)
  packs: (L.packs ?? []).map((q) => q.roomId),
  // (QUESTS15, floor 3 while its furnace burns: the furnace quest as the game keeps it (its crank's place among the props, its
  // keeper's id among the monsters, the gate its fire bars); the Stoker's arena (game/furnace_arena.ts); the fire channels)
  furnace: level.furnace ? { crank: level.props.indexOf(level.furnace.crank), keeper: level.furnace.keeper, gate: level.furnace.gate, room: level.furnace.room, spot: level.furnace.spot } : null,
  arena: level.arena ? structuredClone(level.arena) : null,
  channels: level.channels ? structuredClone(level.channels) : null,
  // (FLOOR 5: the temple's door and its keys (game/temple_door.ts), and the bone heaps of the Fleshmancer's hall)
  temple: level.temple ? structuredClone(level.temple) : null,
  heaps: L.heaps ? L.heaps.map((q) => ({ ...q })) : null,
  // (game/doors.ts: each door and gate the map-maker laid, as the game keeps it (open, want), with its doorway's three tiles,
  // the tiles passed through (a door's middle one, a gate's three), the stone either side of a door, and its middle)
  doors: level.doors.map((d) => ({
    kind: d.spot.kind, room: d.spot.room, alongX: d.spot.alongX, near: d.spot.near, a: d.spot.a, plane: d.spot.plane, out: d.spot.out,
    tiles: doorTiles(L, d.spot), way: doorWay(L, d.spot), piers: doorPiers(L, d.spot), middle: doorMiddle(d.spot), open: d.open, want: d.want,
    ...(d.spot.word ? { word: d.spot.word } : {}),
  })),
  // (game/ways.ts: the places in the boss's hall where the stairwell down may open, the nearest his hall's middle first
  // (stairSpots; it opens in the first clear of where he fell: stairFor), and the floor's waypoint, where it has one)
  stairs: (level.ways?.stairs ?? []).map((s) => ({ x: s.x, y: s.y, way: s.way })),
  waypoint: level.ways?.way ? { x: level.ways.way.x, y: level.ways.way.y } : null,
  // (game/traps.ts: the floor's spike floors, {kind, x, y, w, h, phase}, and dart walls, {kind, x, y, w, h (the plate), slot})
  hazards: (L.hazards ?? []).map((h) => ({ ...h })),
  // (THE SWAMP COLOSSUS, game/colossus_fight.ts COLOSSUS, floor 10: his stone, the world point of its middle (game/act1_layout.ts
  // stoneAt), and the landing on the boss's ground the hero is carried across to it from (game.ts updateStone); null elsewhere)
  stone: level.land?.stone ? { cx: level.land.stone.cx, cy: level.land.stone.cy } : null,
  landing: level.land?.landing ? { x: level.land.landing.x, y: level.land.landing.y } : null,
}));

// --- 3. its monsters: each as game.ts spawn made it (life, damage and speed with the first floor's softening in them), its
// figure (art/bestiary.ts figureOf: the pictures it is drawn with) and its kind's numbers (game/defs.ts MONSTERS) ---
const plain = (o: object): Record<string, number | string | boolean> => {
  const out: Record<string, number | string | boolean> = {};
  for (const [k, v] of Object.entries(o)) if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') out[k] = v;
  return out;
};
const kinds = new Set<string>();
// (THE WORDS: `words`, the words it fights with (an elite's one, a guardian's, a boss's, its pack's; game.ts spawn); `half`, a
// pack's minion's, its leader's at half strength; `carries`, the word it gives up when it dies, the rune over its head)
const monsters = game.monsters.map((m, i) => {
  kinds.add(m.kind);
  // (`a1`: what its kind's rules keep about it as it comes into the world: floor 14's patients lying in their beds)
  return { ...plain(m), figure: bakeName(figureOf(m)), words: [...m.words], half: [...(m.half ?? [])], carries: [...lit.monsters[i].carries], a1: m.a1 ? plain(m.a1) : null };
});
// (ACT 2, THE BELLS, floors 11 to 15 (game/bells.ts, Game's "ACT 2: THE BELLS"; godot/scripts/act2/bells.gd): the plan (the
// Muffled Bell, the bells to ring, the Hush's circle), its numbers; THE TOUGH ONE each bell rung calls, as the game itself makes
// it on this floor for the k-th bell (game.ts bellTough: a yellow pack's leader of the floor's guard kind with its words, its
// life `tough` more for each bell before it); and WHAT THE HUSH RAISES, the floor's own kinds by their weights (act2Pack 'normal'),
// a plain one of each as the game makes it here, rising in the Hush (none of floor 14's lying down in a bed); none elsewhere)
const mon = (m: (typeof game.monsters)[number]) => ({ ...plain(m), figure: bakeName(figureOf(m)), words: [...m.words], half: [...(m.half ?? [])], carries: [] as string[], a1: m.a1 ? plain(m.a1) : null });
let bells: Record<string, unknown> | null = null;
if (level.bells) {
  const bg = new Game('warrior', seed);
  bg.depth = depth;
  bg.hero.ring = true;
  bg.enterDungeon();
  const BB = bg.level.bells!;
  BB.phase = 'on';
  const G = bg as unknown as { bellTough(x: number, y: number, k: number): void; spawn(...a: unknown[]): (typeof game.monsters)[number]; risingInHush: boolean };
  const n = BB.plan.bells.length;
  const tough = [];
  // (each the leader and what comes with it, the Hushed Watch's sergeant his brace of hounds: ARRIVALS, kept among the risers
  // until they are up out of their rifts)
  const R = (bg as unknown as { risers: { m: (typeof game.monsters)[number] }[] }).risers;
  for (let k = 1; k < n; k++) {
    const from = bg.monsters.length;
    const was = R.length;
    G.bellTough(BB.plan.bells[k - 1].x, BB.plan.bells[k - 1].y, k);
    const come = [...bg.monsters.slice(from), ...R.slice(was).map((r) => r.m)];
    come.sort((a, b) => (b.rarity === 'leader' ? 1 : 0) - (a.rarity === 'leader' ? 1 : 0));
    for (const m of come) kinds.add(m.kind);
    tough.push(come.map((m) => ({ ...mon(m), dx: m.x - come[0].x, dy: m.y - come[0].y })));
  }
  const own = (ACT2_OWN[cityFloor(depth) || 11] ?? []).filter((o) => o.kind !== 'rshade').map((o) => ({ kind: act2Ready(o.kind) ? o.kind : 'hushed', weight: o.weight }));
  const rise: Record<string, unknown> = {};
  const rng = new RNG(depth * 7919);
  for (const o of own) {
    if (rise[o.kind]) continue;
    G.risingInHush = true;
    const m = G.spawn(o.kind, BB.plan.muffled.x, BB.plan.muffled.y, 8000, 0, false, rng);
    G.risingInHush = false;
    kinds.add(m.kind);
    rise[o.kind] = mon(m);
  }
  const p = (k: number) => (k >= 0 ? { i: k, tx: level.props[k].tx, ty: level.props[k].ty, name: level.props[k].name } : null);
  bells = { plan: structuredClone(level.bells.plan), limit: level.bells.limit, props: level.bells.props.map(p), muffled: p(level.bells.muffled), tune: { ...BELLS_TUNE }, still: BELL_STILL, tough, own, rise };
  console.log(`the Bells: ${n} bells, the Hush ${level.bells.first} tiles; the tough ones ${tough.map((g) => g.map((m) => `${m.name} (${m.maxLife})`).join(' + ')).join(', ')}; it raises ${own.map((o) => `${o.kind} ${o.weight}`).join(', ')}`);
}
const defs: Record<string, Record<string, number | string | boolean>> = {};
for (const k of kinds) defs[k] = plain(MONSTERS[k as keyof typeof MONSTERS]);
// (FLOOR 14, THE HOUSE OF QUIET: its ward beds, each where one lying in it lies, the way it faces (game/act1_rules/patient.ts
// bedPlace) and its key, `bt` (its tile, counted from 1): where the Physician's rounds lay new patients (freeBeds); none elsewhere)
const beds = level.props
  .filter((p) => p.kind === 'piece' && p.name === PATIENT.bed.piece)
  .map((p) => ({ ...bedPlace(p), bt: p.ty * L.w + p.tx + 1 }));
// (FLOOR 15, THE GREAT LIBRARY: the Censor's ground, the tiles of the Reading Room joined to where he stands (game/act1_rules/
// censor.ts censorGround: the Hush's reach, where his ink may lie and how much of it), and the book of stolen words on its lectern,
// which bursts as he dies; none elsewhere)
const censor = game.monsters.find((m) => m.kind === 'censor');
const book = level.props.find((p) => p.kind === 'piece' && p.name === STOLEN_BOOK);
const ground = censor ? { censor: { ground: censorGround(level, censor.x, censor.y), book: book ? { x: book.x, y: book.y } : null } } : {};
writeFileSync(`${OUT}/monsters.json`, JSON.stringify({ hero: plain(game.hero), monsters, defs, ...(beds.length ? { beds } : {}), ...ground, ...(bells ? { bells } : {}) }, null, 1));
const tally: Record<string, number> = {};
for (const m of monsters) tally[`${m.kind}/${m.figure}`] = (tally[`${m.kind}/${m.figure}`] ?? 0) + 1;
console.log(`monsters: ${monsters.length}: ${Object.entries(tally).map(([k, n]) => `${n} ${k}`).join(', ')}`);
const cuts = L.cut ? Array.from(L.cut).filter((c) => c !== 0).length : 0;
const raised = L.height ? Array.from(L.height).filter((c) => c !== 0).length : 0;
const lows = Array.from(level.low).filter((c) => c !== 0).length;
console.log(`layout: seed ${seed}, ${L.w}x${L.h}, ${count(1)} floor / ${count(2)} wall / ${count(3)} pit tiles, ${L.rooms.length} rooms, ${cuts} cut tiles, ${raised} raised or sunken, ${lows} low walls; start ${L.start.x},${L.start.y}`);

// --- 4. THE DESCENT'S OPEN GROUND (floors 6 and down: game/act1_layout.ts Land): its areas, each its role ('start', 'boss',
// 'lair', ...), the room it stands for and its blob (an ellipse `rx` by `ry` round (x, y), turned `rot`, its edge wandering by
// `wob` from `seed`: blobDist). The boss waits on it till the hero comes into his ground (game.ts meetOutdoorBoss); the Hollow
// Stag's clearing is his area's (game/act1_rules/stag.ts own). Its lanes (`w` wide along `pts`): the Crier's call brings the Hushed
// out of their mouths into his square first (game/act1_rules/crier.ts spotsFor). Written beside the layout, only for a floor that
// has one. ---
if (level.land) {
  const areas = level.land.areas.map((a) => ({ role: a.role, room: a.room, blob: { ...a.blob } }));
  const lanes = level.land.lanes.map((l) => ({ w: l.w, pts: l.pts.map(([x, y]) => [x, y]) }));
  writeFileSync(`${OUT}/land.json`, JSON.stringify({ kind: level.land.kind, areas, lanes }, null, 1));
  console.log(`land: ${level.land.kind}, ${areas.length} areas (${areas.map((a) => a.role).join(', ')}), ${lanes.length} lanes`);
}
