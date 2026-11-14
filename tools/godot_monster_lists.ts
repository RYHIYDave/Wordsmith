// THE GODOT PORT: what each list of a baked monster is. The baked file (render/monsters_bake_list.ts MonsterBakeFile) has
// only the lists' lengths; their names and paces are in the game's art (art/bestiary.ts framesOf: idle, walk, then attack,
// heavy, die and reel where the figure has them, then its other moves by name). Made here as the bake's page makes the
// figures (src/dev/bake_monsters_page.ts: the same three switches, then the bestiary), without painting a frame (reading a
// list's length paints nothing: art/kit.ts lazyFrames), and checked against the baked lengths.
//   npx tsx tools/godot_monster_lists.ts [folder]       (default godot/assets/monsters; writes lists.json there)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { makeBestiary } from '../src/art/bestiary';
import type { AnimSet } from '../src/art/actor_types';
import { heroSides } from '../src/art/sides';
import { bakedFigures, bakeName } from '../src/render/monsters_bake_list';
import { ALL_OF_IT, useAllOfIt } from '../src/game/all_of_it';
import { ENEMY_MOVES, useEnemyMoves } from '../src/game/enemy_moves';
import { FLOOR_LOOKS, useFloorLooks } from '../src/game/floor_looks';

declare const process: { argv: string[] };
const dir = process.argv[2] ?? 'godot/assets/monsters';
useEnemyMoves(ENEMY_MOVES.on);
useFloorLooks(FLOOR_LOOKS.on);
useAllOfIt(ALL_OF_IT.on);
const bestiary = makeBestiary();

interface List { name: string; fps: number; n: number }
function listsOf(set: AnimSet): List[] {
  const s = set as AnimSet & { idleFps?: number; walkFps?: number };
  // (render/figure.ts: a monster stands at 2 frames a second and walks at 8 unless its set says otherwise)
  const out: List[] = [
    { name: 'idle', fps: s.idleFps ?? 2, n: set.idle.length },
    { name: 'walk', fps: s.walkFps ?? 8, n: set.walk.length },
  ];
  const c = set.clips;
  if (c) {
    for (const k of ['attack', 'heavy', 'die', 'reel'] as const) {
      const clip = c[k];
      if (clip) out.push({ name: k, fps: clip.fps, n: clip.frames.length });
    }
    for (const [k, clip] of Object.entries(c.moves ?? {})) out.push({ name: k, fps: clip.fps, n: clip.frames.length });
  }
  return out;
}

const all: Record<string, { sides: number; lists: { name: string; fps: number }[] }> = {};
let ok = 0;
const wrong: string[] = [];
for (const figure of bakedFigures()) {
  const name = bakeName(figure);
  const file = `${dir}/${name}.json`;
  if (!existsSync(file)) continue;
  const baked = JSON.parse(readFileSync(file, 'utf8')) as { lens: number[][] };
  const sets = heroSides(bestiary.of(figure));
  const lists = sets.map(listsOf);
  const same = baked.lens.length === lists.length && baked.lens.every((l, v) => l.length === lists[v].length && l.every((n, i) => n === lists[v][i].n));
  if (same) ok++;
  else wrong.push(`${name}: baked ${JSON.stringify(baked.lens[0])}, now ${JSON.stringify(lists[0].map((l) => l.n))}`);
  all[name] = { sides: lists.length, lists: lists[0].map((l) => ({ name: l.name, fps: l.fps })) };
}
writeFileSync(`${dir}/lists.json`, JSON.stringify(all, null, 1));
console.log(`${ok} figures' lists named and matching their bake; ${wrong.length} not:`);
for (const w of wrong) console.log('  ' + w);
