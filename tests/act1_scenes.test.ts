// ACT1_SCENES (game/act1_dress.ts): A FLOOR OF THE DESCENT'S THINGS WHERE THEY BELONG. His words, 1 Nov 2026, 10:05: “Can you make
// sure the doodads go in places that seem proper as opposed to randomly?”; floor by floor, each shown him first. Held here, on
// the Quarry (floor 6) over many seeds:
//   1. its scenes laid: most of its open areas have one; its face scenes at the far cliffs' feet; no scene more often than it may;
//   2. nothing stands about at random outside the boss's ground: every thing that stands in an open area is part of a scene;
//   3. what stands against the cliff has rock behind it; nothing that stands cuts off any floor: every tile walked on before is
//      walked to from where he comes in.
//   run: tsx --test tests/act1_scenes.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { ACT1_SCENES, ACT1_SCENE_SETS } from '../src/game/act1_dress';
import { Game } from '../src/game/game';
import { T_WALL } from '../src/game/types';

const SEEDS = [9, 17, 31, 47, 63, 88];
// (the Quarry laid as scenes for these tests, whether or not it is in the game yet: it goes in at his yes to its pictures)
if (!ACT1_SCENES.floors.includes(6)) ACT1_SCENES.floors = [...ACT1_SCENES.floors, 6];

function floor6(seed: number): Game {
  const g = new Game('warrior', seed);
  g.depth = 6;
  g.cleared = 5;
  g.enterDungeon();
  return g;
}

test('1. the Quarry is laid as scenes: its open areas have them, its cliffs have theirs, none more often than it may', () => {
  assert.ok(ACT1_SCENES.on);
  const most = new Map([...ACT1_SCENE_SETS[6].open, ...ACT1_SCENE_SETS[6].face].map((s) => [s.name, s.most]));
  for (const seed of SEEDS) {
    const g = floor6(seed);
    const scenes = g.level.act1?.scenes ?? [];
    const areas = g.level.land!.areas.filter((a) => a.role === 'path' || a.role === 'side').length;
    assert.ok(scenes.length >= Math.min(4, areas - 1), `seed ${seed}: ${scenes.length} scenes in ${areas} areas`);
    const count = new Map<string, number>();
    for (const s of scenes) count.set(s.name, (count.get(s.name) ?? 0) + 1);
    for (const [name, n] of count) assert.ok(n <= (most.get(name) ?? 0), `seed ${seed}: ${name} ${n} times`);
  }
});

test('2. nothing stands about at random outside the boss\'s ground: each thing that stands near a scene of its own', () => {
  for (const seed of SEEDS) {
    const g = floor6(seed);
    const L = g.level;
    const scenes = L.act1?.scenes ?? [];
    const boss = L.land!.areas.find((a) => a.role === 'boss')!;
    const quarry = new Set(ACT1_SCENE_SETS[6].open.flatMap((s) => s.parts.map((p) => p.name)));
    for (const p of L.props) {
      if (p.kind !== 'piece' || !p.name || !quarry.has(p.name) || !p.solid) continue;
      // (the rails' cart is the rails'; the boss's ground has its own few)
      if ((p.name === 'empty cart' || p.name === 'cart of rubble') && L.act1!.tiles.some((t) => t.name === 'rails' && Math.abs((t.i % L.floor.w) - p.tx) + Math.abs(Math.floor(t.i / L.floor.w) - p.ty) === 0)) continue;
      if (Math.hypot(p.x - boss.blob.x, p.y - boss.blob.y) < Math.max(boss.blob.rx, boss.blob.ry) + 1) continue;
      assert.ok(scenes.some((s) => Math.hypot(s.x - p.x, s.y - p.y) < 8), `seed ${seed}: ${p.name} at (${p.tx}, ${p.ty}) is in no scene`);
    }
  }
});

/** The tiles walked on but not come to from where he comes in (four ways), as "x,y". */
function lostOf(g: Game): Set<string> {
  const L = g.level;
  const f = L.floor;
  const seen = new Uint8Array(f.w * f.h);
  const q = [Math.floor(f.start.y) * f.w + Math.floor(f.start.x)];
  seen[q[0]] = 1;
  for (let k = 0; k < q.length; k++) {
    const i = q[k];
    const x = i % f.w;
    for (const j of [i - 1, i + 1, i - f.w, i + f.w]) {
      if (j < 0 || j >= seen.length || seen[j] || L.walk[j] !== 1 || Math.abs((j % f.w) - x) > 1) continue;
      seen[j] = 1;
      q.push(j);
    }
  }
  const out = new Set<string>();
  for (let i = 0; i < seen.length; i++) if (L.walk[i] === 1 && !seen[i]) out.add(`${i % f.w},${Math.floor(i / f.w)}`);
  return out;
}

test('3. what stands against the cliff has rock behind it; nothing that stands cuts off any floor', () => {
  for (const seed of SEEDS) {
    const g = floor6(seed);
    const L = g.level;
    const f = L.floor;
    for (const p of L.props) {
      if (p.kind !== 'piece' || !p.name || !/against the face|rope and bucket|half carved/.test(p.name)) continue;
      const i = p.ty * f.w + p.tx;
      assert.ok(f.tiles[i - f.w] === T_WALL || f.tiles[i - 1] === T_WALL, `seed ${seed}: ${p.name} at (${p.tx}, ${p.ty}) has no rock behind it`);
    }
    // (every tile walked on that was come to from where he comes in without the scenes is come to with them)
    const was = ACT1_SCENES.floors;
    ACT1_SCENES.floors = [];
    const before = lostOf(floor6(seed));
    ACT1_SCENES.floors = was;
    const now = lostOf(g);
    const more = [...now].filter((k) => !before.has(k));
    assert.deepEqual(more, [], `seed ${seed}: cut off by the scenes`);
  }
});
