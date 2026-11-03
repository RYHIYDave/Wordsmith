// ACT 2, PART TWO, THE HIGH CITY (game/act1.ts HIGH_CITY, off until he has seen each floor in play and said yes): the frame its
// floors are built in. His word, 29 Oct 2026, 18:09: “Levels are ready to add”; his picks, “One floor at a time”, “The camp
// stays the town (Recommended)”, the Royal Cards “With floor 16 (Recommended)”.
//   run: tsx --test tests/high_city.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { ACT1_FLOORS, HIGH_CITY, act1Floor, act2Floor, cityFloor, highFloor, landOf, lastFloor } from '../src/game/act1';
import { ACT2_GUARD, ACT2_OWN } from '../src/game/act2_mobs';
import { MONSTERS } from '../src/game/defs';
import { HIGH_KINDS } from '../src/game/types';

test('off, nothing of it: the Hush’s fifteenth is the last floor', () => {
  assert.equal(HIGH_CITY.on, false);
  assert.equal(lastFloor(), 15);
  assert.equal(act1Floor(16), 0);
  assert.equal(cityFloor(16), 0);
});

test('on, floor 16 is the Swan Gardens: laid as open ground by a map-maker of its own, the Princess its boss, not one of the Hush’s (no bells)', () => {
  HIGH_CITY.on = true;
  try {
    assert.equal(lastFloor(), 15 + HIGH_CITY.built);
    assert.equal(act1Floor(16), 16);
    assert.equal(highFloor(16), 16);
    assert.equal(cityFloor(16), 16);
    assert.equal(act2Floor(16), 0, 'the bells are the Hush’s');
    assert.equal(landOf(16), 'swangardens');
    assert.equal(ACT1_FLOORS[16].place, 'The Swan Gardens');
    assert.equal(ACT1_FLOORS[16].boss, 'princess');
    assert.equal(highFloor(16 + HIGH_CITY.built), 0, 'nothing past the floors built');
  } finally {
    HIGH_CITY.on = false;
  }
});

test('its kinds: each with its stats; on floor 16, its own (his doc: “the Hushed gardeners and grooms, the palace guard, and the swans”), the guard its lair’s', () => {
  for (const k of HIGH_KINDS) assert.ok(MONSTERS[k] && MONSTERS[k].kind === k, k);
  assert.deepEqual(ACT2_OWN[16].map((m) => m.kind).sort(), ['gardener', 'groom', 'pguard', 'swan']);
  assert.equal(ACT2_GUARD[16], 'pguard');
  assert.equal(MONSTERS.princess.size, 'boss');
});
