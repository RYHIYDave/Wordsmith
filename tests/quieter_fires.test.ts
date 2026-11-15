// QUIETER FIRES (the sound chat's try-out 20, its After; his words to the main chat, 15 Nov 2026, 14:26 Eastern: “Can you give
// me a small update with the new torch sound changes”; game/world_sounds.ts FIRE_REACH):
//   1. a brazier heard only right beside it: at full within 1 tile at 0.35, less by 2, none past 2.5; its pop with it;
//   2. the hearths every 25 to 60 s, half as loud; the pop every 10 to 25 s;
//   3. the Rim's torches on posts heard as near as the others; the forge and the ring as they were.
//
//   run: tsx --test tests/quieter_fires.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { Game } from '../src/game/game';
import { AMBIENT, FIRE_REACH, RIM_SOUNDS, ambientWants, loopWants } from '../src/game/world_sounds';

function onFloorWithBrazier(): { g: Game; b: { x: number; y: number } } {
  for (let d = 1; d <= 20; d++) {
    const g = Game.forPractice('warrior', d);
    const b = g.level.props.find((p) => p.kind === 'brazier' && p.state !== 1);
    if (b) return { g, b };
  }
  throw new Error('no floor with a brazier');
}

test('1. a brazier heard only right beside it, a third quieter; its pop with it', () => {
  assert.deepEqual({ ...FIRE_REACH }, { near: 1, far: 2.5, vol: 0.35 });
  const { g, b } = onFloorWithBrazier();
  const others = g.level.props.filter((p) => p.kind === 'brazier' && p.state !== 1 && p !== b);
  const clear = (x: number, y: number): boolean => others.every((p) => Math.hypot(p.x - x, p.y - y) > FIRE_REACH.far);
  g.hero.x = b.x + 0.5;
  g.hero.y = b.y;
  assert.equal(loopWants(g, true).fire_small, FIRE_REACH.vol, 'beside it: at full, 0.35');
  assert.equal(ambientWants(g, true).find((w) => w.a.name === 'fire_pop')?.vol, AMBIENT.fire.vol, 'its pop at full');
  for (const [dx, dy] of [[1.75, 0], [-1.75, 0], [0, 1.75], [0, -1.75]]) {
    if (!clear(b.x + dx, b.y + dy)) continue;
    g.hero.x = b.x + dx;
    g.hero.y = b.y + dy;
    const v = loopWants(g, true).fire_small ?? 0;
    assert.ok(v > 0 && v < FIRE_REACH.vol, `1.75 tiles off: less (${v})`);
    break;
  }
  for (const [dx, dy] of [[3, 0], [-3, 0], [0, 3], [0, -3]]) {
    if (!clear(b.x + dx, b.y + dy)) continue;
    g.hero.x = b.x + dx;
    g.hero.y = b.y + dy;
    assert.equal(loopWants(g, true).fire_small, undefined, '3 tiles off: none (was heard to 7)');
    assert.equal(ambientWants(g, true).find((w) => w.a.name === 'fire_pop')?.vol, 0, 'nor its pop');
    return;
  }
  throw new Error('no clear spot 3 tiles off a brazier');
});

test('2. the hearths every 25 to 60 s, half as loud; the pop every 10 to 25 s', () => {
  assert.deepEqual([AMBIENT.hall.from, AMBIENT.hall.to, AMBIENT.hall.vol], [25, 60, 0.89]);
  assert.deepEqual([AMBIENT.camp.from, AMBIENT.camp.to, AMBIENT.camp.vol], [25, 60, 0.71]);
  assert.deepEqual([AMBIENT.fire.from, AMBIENT.fire.to, AMBIENT.fire.vol], [10, 25, 2.15]);
});

test('3. the Rim\'s torches as near as the others; the forge and the ring as they were', () => {
  assert.equal(RIM_SOUNDS.torch.near, FIRE_REACH.near);
  assert.equal(RIM_SOUNDS.torch.far, FIRE_REACH.far);
  assert.equal(RIM_SOUNDS.torch.vol, 0.55, 'its own loop, its own loudness');
  const g = new Game('warrior', 3);
  const forge = g.level.stations.find((s) => s.kind === 'armourer');
  if (!forge) throw new Error('the town has its armourer');
  g.hero.x = forge.x + 4;
  g.hero.y = forge.y;
  const v = loopWants(g, true).fire_big ?? 0;
  assert.ok(Math.abs(v - 0.5 * (1 - (4 - 2) / (9 - 2))) < 1e-9, `the forge 4 tiles off as before (${v})`);
});
