// STEADY BACKGROUNDS, THEIR STANDOUT SOUNDS NOW AND THEN (the sound chat's eleventh batch, 12 Nov 2026: assets/sound/README.md;
// his words, “there is a sound effect in the town im hearing way too often”, “the swap sounds are repeating way too often as well
// in area 10”; his picks, “Steady loops, sounds at random (Recommended)”, “Yes, all of them (Recommended)”, and of try-out 16,
// “All good, hand over (Recommended)”; game/world_sounds.ts AMBIENT, AMBIENT_FLOORS, ambientWants; main.ts worldFrame). Held:
//   1. the thirteen steady loops in place of the old (as long as they were), the thirteen standouts' two takes each, packed with
//      their place's;
//   2. each standout's times and loudness the batch's table's, to the figure;
//   3. where each is heard: the castle hall's in the town (not the Rim), the camp's in the camp, the brazier's pop by its
//      nearness, each floor's on its floor, two on floor 10, none on 5, 13 and 17.
// SINCE THE FIFTEENTH BATCH (15 Nov 2026, his “The only constant sound I want in levels or towns is the music.  Everything else is
// sound effects.”): no loop at all; the hall's and the camp's hearth gone, a breeze now and then in their place (three takes);
// the times the fifteenth batch's table's.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import fs from 'node:fs';
import { makeCamp } from '../src/game/camp';
import { Game } from '../src/game/game';
import { makeRim } from '../src/game/rim';
import { AMBIENT, AMBIENT_FLOORS, ambientWants, loopWants } from '../src/game/world_sounds';
import { takesOf } from '../src/engine/audio';
import type { Ambient } from '../src/game/world_sounds';
// @ts-ignore - a tool of the build, plain JavaScript
import { packOf } from '../tools/sound_packs.mjs';

const DIR = 'assets/sound';
const LOOPS = ['bed_hall', 'bed_camp', 'fire_small', 'water', 'bed_f1', 'bed_f2', 'bed_f3', 'bed_f4', 'bed_f6', 'bed_f7', 'bed_f8', 'bed_f10', 'bed_f14'];
const all: Ambient[] = [...Object.values(AMBIENT), ...Object.values(AMBIENT_FLOORS).flat()];

function onFloor(depth: number, seed = 5): Game {
  const g = new Game('warrior', seed);
  g.depth = depth;
  g.cleared = depth - 1;
  g.wayDepth = depth;
  g.enterDungeon();
  return g;
}
const names = (g: Game, hall = true): string[] => ambientWants(g, hall).map((w) => w.a.name);

test('1. no loop anywhere, their files gone; the sounds now and then each with its takes, packed with their place', () => {
  for (const l of LOOPS) assert.ok(!fs.existsSync(`${DIR}/${l}_loop.wav`), `${l}: none now`);
  const g = new Game('warrior', 3);
  assert.deepEqual(loopWants(g, true), {}, 'the town: no loop');
  g.level = makeCamp(11, true);
  assert.deepEqual(loopWants(g, true), {}, 'the camp: none');
  for (let d = 1; d <= 20; d++) assert.deepEqual(loopWants(onFloor(d), true), {}, `floor ${d}: none`);
  assert.equal(all.length, 13, 'thirteen sounds now and then');
  for (const a of all) for (let k = 1; k <= takesOf(a.name); k++) assert.ok(fs.existsSync(`${DIR}/${a.name}_${k}.mp3`), `${a.name}_${k}.mp3`);
  assert.equal(takesOf('breeze'), 3, 'the breeze: three takes');
  assert.equal(packOf('breeze'), 'town');
  assert.equal(packOf('fire_pop'), 'world');
  assert.equal(packOf('amb_f1'), 'scene-1');
  assert.equal(packOf('amb_f10_bog'), 'scene-2');
  assert.equal(packOf('amb_f14'), 'scene-3');
});

test("2. each standout's times and loudness are the batch's table's", () => {
  const readme = fs.readFileSync(`${DIR}/README.md`, 'utf8');
  const from = readme.indexOf('## Fifteenth batch');
  assert.ok(from >= 0, 'the fifteenth batch in the README');
  const rows = [...readme.slice(from).matchAll(/^\| [^|\n]+ \| `([a-z0-9_]+)` \| (\d+) to (\d+) \| ([\d.]+)/gm)];
  assert.equal(rows.length, 13, 'thirteen rows');
  assert.deepEqual([rows[0][1], rows[1][1]], ['breeze', 'breeze'], 'the hall\'s and the camp\'s: the breeze');
  for (const r of rows) {
    const a = all.find((q) => q.name === r[1]);
    if (!a) throw new Error(`${r[1]}: not played`);
    assert.deepEqual([a.from, a.to, a.vol], [Number(r[2]), Number(r[3]), Number(r[4])], r[1]);
  }
});

test('3. where each is heard: the hall in town (not the Rim), the camp, a brazier by nearness, each floor its own', () => {
  const g = new Game('warrior', 3);
  assert.ok(names(g).includes('breeze'), 'the castle hall');
  assert.ok(!names(g).includes('amb_hall'), 'its hearth gone');
  assert.ok(!names(g, false).includes('breeze'), 'no hall, none of its');
  g.level = makeRim(11, true);
  assert.ok(!names(g).includes('breeze'), 'the Rim: none');
  g.level = makeCamp(11, true);
  assert.ok(names(g).includes('breeze'), 'the camp');
  assert.ok(!names(g).includes('amb_camp'), 'its hearth gone');
  for (let d = 1; d <= 20; d++) {
    const own = names(onFloor(d)).filter((n) => n.startsWith('amb_'));
    const want = (AMBIENT_FLOORS[d] ?? []).map((a) => a.name);
    assert.deepEqual(own, want, `floor ${d}`);
  }
  assert.equal((AMBIENT_FLOORS[10] ?? []).length, 2, 'floor 10: the frog and the bog');
  for (const d of [5, 13, 17]) assert.equal(AMBIENT_FLOORS[d], undefined, `floor ${d} keeps its beat`);
  // (the brazier's pop, by the nearest brazier: full beside it, none far off)
  for (let d = 1; d <= 20; d++) {
    const f = onFloor(d);
    const b = f.level.props.find((p) => p.kind === 'brazier' && p.state !== 1);
    if (!b) continue;
    f.hero.x = b.x + 0.5;
    f.hero.y = b.y;
    const near = ambientWants(f, true).find((w) => w.a.name === 'fire_pop');
    assert.equal(near?.vol, AMBIENT.fire.vol, `floor ${d}: beside a brazier, its pop at full`);
    return;
  }
  throw new Error('no floor with a brazier');
});
