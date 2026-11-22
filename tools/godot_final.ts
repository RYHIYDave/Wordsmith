// THE GODOT PORT: THE BOTTOM OF THE SHAFT, the warped wordsmith's arena (game/final_arena.ts makeFinalArena, by Game.enterArena:
// endless mode's final boss, below the landing at the Shaft's Rim once the four shards are set), for godot/scripts/act3/wsboss.gd:
//   godot/assets/final/layout.json   its tiles and grids as a floor's are (tools/godot_export.ts), its round (`round`: a body held
//                                    off the rubble by it, art/final_arena.ts onArena), where he comes down (in the portal's light)
//                                    and where the boss waits, its name;
//   godot/assets/final/monsters.json the boss as the game spawns him there for a hero at Endless 1 (game.ts enterArena; `power`: the
//                                    depth his strength is of, so that the Godot side makes him as strong as the level reached).
// Its look is recorded whole by tools/godot_record.mjs final.
//   npx tsx tools/godot_final.ts [seed]
import { mkdirSync, writeFileSync } from 'node:fs';
import { gameSwitches } from './godot_switches';
import { Game } from '../src/game/game';
import { MONSTERS } from '../src/game/defs';
import { figureOf } from '../src/art/bestiary';
import { FINAL_ARRIVE, FINAL_BOSS_AT, FINAL_PLACE, FINAL_LOOT, FINAL_NAME, FINAL_TEXT, FINAL_UP_HOLD, FINAL_WAKE, FINAL_WAY_UP } from '../src/game/final_arena';
import { endlessPower } from '../src/game/endless';

declare const process: { argv: string[] };
gameSwitches();
const seed = Number(process.argv[2] ?? 1) >>> 0;
const OUT = 'godot/assets/final';
mkdirSync(OUT, { recursive: true });

const game = new Game('warrior', seed);
const G = game as unknown as { endless: number; endlessFloor: number; wayDepth: number; enterArena(): void };
G.wayDepth = 20;
G.endless = 1;
G.endlessFloor = 1;
G.enterArena();
const level = game.level;
const L = level.floor;
const arr = (a: ArrayLike<number> | undefined | null): number[] | null => (a ? Array.from(a) : null);
writeFileSync(`${OUT}/layout.json`, JSON.stringify({
  depth: L.depth, seed, w: L.w, h: L.h, title: { name: FINAL_NAME.level, level: FINAL_NAME.place },
  final: true, ways: null, body: null,
  tiles: arr(L.tiles), variant: arr(L.variant), cut: arr(L.cut), height: arr(L.height),
  walk: arr(level.walk), low: arr(level.low), stair: arr(L.stair), step: arr(level.step), open: arr(level.open),
  start: { x: FINAL_ARRIVE.x, y: FINAL_ARRIVE.y, fx: FINAL_ARRIVE.fx, fy: FINAL_ARRIVE.fy }, boss: L.boss,
  rooms: L.rooms.map((r) => ({ id: r.id, x: r.x, y: r.y, w: r.w, h: r.h, kind: r.kind, path: r.path })),
  props: [], levers: [], doors: [],
  round: { ...FINAL_PLACE }, arrive: { ...FINAL_ARRIVE }, bossAt: { ...FINAL_BOSS_AT },
  loot: { gold: [...FINAL_LOOT.gold], items: FINAL_LOOT.items, words: FINAL_LOOT.words }, wayUp: FINAL_WAY_UP, upHold: FINAL_UP_HOLD, wake: FINAL_WAKE,
  text: { ...FINAL_TEXT },
}));
const plain = (o: object): Record<string, number | string | boolean> => {
  const out: Record<string, number | string | boolean> = {};
  for (const [k, v] of Object.entries(o)) if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') out[k] = v;
  return out;
};
const monsters = game.monsters.map((m) => ({ ...plain(m), figure: figureOf(m), words: [...m.words], half: [], carries: [], a1: m.a1 ? plain(m.a1) : null }));
const defs: Record<string, Record<string, number | string | boolean>> = {};
for (const m of game.monsters) defs[m.kind] = plain(MONSTERS[m.kind as keyof typeof MONSTERS]);
writeFileSync(`${OUT}/monsters.json`, JSON.stringify({ hero: plain(game.hero), monsters, defs, power: endlessPower(1) }, null, 1));
console.log(`the bottom of the shaft: ${L.w}x${L.h}; ${monsters.map((m) => `${m.kind} (${m.maxLife} life, ${m.dmgMin}-${m.dmgMax})`).join(', ')}; he comes down at ${FINAL_ARRIVE.x},${FINAL_ARRIVE.y}`);
