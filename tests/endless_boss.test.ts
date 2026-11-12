// ENDLESS MODE'S FINAL BOSS, THE WARPED WORDSMITH ON THE GREAT WOOLLY BOAR: his look standing, through the bosses' checks (his
// rulebook's How art is made 7) for the one move he has so far, his stand.
// @ts-ignore
import test from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { checkBoss, findingsSaid } from '../src/art/boss_checks';
import { paintMob } from '../src/art/new_mobs3';
import { SPARK, CYAN } from '../src/art/kit';
import { WS_SHAPE, wsMob } from '../src/art/endless_boss';

test("his stand passes the bosses' checks", () => {
  const found = checkBoss(wsMob(), WS_SHAPE, ['stand']);
  assert.deepEqual(findingsSaid(found), []);
});

test('nothing of them is cyan, front or back', () => {
  const mob = wsMob();
  const cy = new Set<string>([...SPARK, ...(Array.isArray(CYAN) ? CYAN : [])].map((c) => String(c).toLowerCase()));
  for (const view of ['front', 'back'] as const) {
    const { px } = paintMob(mob, 'stand', 0.4, view);
    for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) {
      const c = px.get(x, y);
      if (c) assert.ok(!cy.has(c.toLowerCase()), `${view}: cyan at ${x},${y}`);
    }
  }
});
