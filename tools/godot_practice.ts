// THE GODOT PORT: THE PRACTICE ROOM (game.ts forPractice, beginPractice, updatePractice, spawnWave; game/level.ts makeArena;
// defs.ts PRACTICE), for godot/scripts/practice.gd:
//   godot/assets/practice/layout.json  the arena as the game lays it for the seed (its tiles, its walk, where the hero stands),
//     at the depth its monsters are as tough as (PRACTICE.depth), and the arena's bounds and where its packs may come (ARENA).
//   godot/assets/practice/monsters.json  none to begin with; `packs`: the packs its waves bring, each as the game's own
//     spawnWave spawns it (PRACTICE.packSize of skeletons, archers, cultists and bats; every third led by a brute, every other by
//     an elite carrying a word), its members as the game makes them and where each stands from the pack's first; and the kinds'
//     numbers (`defs`). The port takes them in turn, round again from the first.
//   godot/assets/practice/ground.json + ground.png: the stone (the look recorded from the game is what is drawn: tools/godot_record.mjs
//     practice).
//   npx tsx tools/godot_practice.ts [seed]
import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { paintWithoutCanvas } from '../tests/helpers';
import { gameSwitches } from './godot_switches';
import { Game } from '../src/game/game';
import { MONSTERS, PRACTICE } from '../src/game/defs';
import { ARENA } from '../src/game/level';
import { figureOf } from '../src/art/bestiary';
import { bakeName } from '../src/render/monsters_bake_list';
import { ARRIVALS, riftSize } from '../src/game/arrivals';

declare const process: { argv: string[] };
paintWithoutCanvas();
gameSwitches();
const seed = Number(process.argv[2] ?? 1) >>> 0;
const OUT = 'godot/assets/practice';
mkdirSync(OUT, { recursive: true });

const g = Game.forPractice('warrior', seed);
const level = g.level;
const L = level.floor;
const arr = (a: ArrayLike<number> | undefined | null): number[] | null => (a ? Array.from(a) : null);
writeFileSync(`${OUT}/layout.json`, JSON.stringify({
  depth: PRACTICE.depth, seed, w: L.w, h: L.h, title: { name: 'Practice room', level: '' }, ways: null, body: null,
  tiles: arr(L.tiles), variant: arr(L.variant), cut: arr(L.cut), height: arr(L.height),
  walk: arr(level.walk), low: arr(level.low), stair: arr(L.stair), step: arr(level.step), open: arr(level.open),
  start: { x: g.hero.x, y: g.hero.y, fx: g.hero.fx, fy: g.hero.fy }, boss: L.boss,
  rooms: L.rooms.map((r) => ({ id: r.id, x: r.x, y: r.y, w: r.w, h: r.h, kind: r.kind, path: r.path })),
  props: [], doors: [], stairs: [], waypoint: null, hazards: [], levers: [], packs: [],
  arena: null, practice: { x0: ARENA.x0, y0: ARENA.y0, x1: ARENA.x1, y1: ARENA.y1, start: { ...ARENA.start } },
}));

// (the packs, as the game's spawnWave makes them, one after another: a brute leading every third, an elite every other, so six
// make the round; twelve kept, the words its elites carry differing)
const plain = (o: object): Record<string, number | string | boolean> => {
  const out: Record<string, number | string | boolean> = {};
  for (const [k, v] of Object.entries(o)) if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') out[k] = v;
  return out;
};
const kinds = new Set<string>();
const packs: unknown[] = [];
const spawn = g as unknown as { spawnWave(): void; risers: { m: (typeof g.monsters)[number] }[] };
for (let n = 0; n < 12; n++) {
  const before = new Set([...g.monsters, ...spawn.risers.map((r) => r.m)]);
  spawn.spawnWave();
  const made = [...g.monsters, ...spawn.risers.map((r) => r.m)].filter((m) => !before.has(m));
  const first = made[0];
  packs.push(made.map((m) => {
    kinds.add(m.kind);
    return { ...plain(m), dx: m.x - first.x, dy: m.y - first.y, figure: bakeName(figureOf(m)), words: [...m.words], half: [...(m.half ?? [])], carries: [...m.carries], a1: m.a1 ? plain(m.a1) : null, rift: riftSize(MONSTERS[m.kind]?.size) };
  }));
}
const defs: Record<string, Record<string, number | string | boolean>> = {};
for (const k of kinds) defs[k] = plain(MONSTERS[k as keyof typeof MONSTERS]);
writeFileSync(`${OUT}/monsters.json`, JSON.stringify({ monsters: [], defs, packs, tune: { ...PRACTICE }, arrivals: { apart: ARRIVALS.apart, rise: ARRIVALS.rise } }, null, 1));
// (the stone: floor 4's, as its monsters are; the look recorded from the game is what is drawn)
for (const f of ['ground.png', 'ground.json']) copyFileSync(`godot/assets/floor4/${f}`, `${OUT}/${f}`);
console.log(`practice room: ${L.w} x ${L.h}, the hero at ${g.hero.x}, ${g.hero.y}; ${packs.length} packs (${(packs as unknown[][]).map((p) => p.length).join(', ')}), kinds ${[...kinds].join(', ')}`);
