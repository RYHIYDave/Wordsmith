// THE WARRIOR'S WEAPON, DRAWN (docs/warrior_tree_build.md, step 2): with game/talents.ts WARRIOR_TREE2 on and his tree's first
// point on the battle axe or the warhammer, the game asks for him with the war axe or the maul in his hands (art/heroes.ts
// HeroLook.weapon; the art chat's art/warrior_up_heavy_art.ts, his yes of 11 Nov 2026 by 10:51: “Yes, hand both to main
// (Recommended)”), in a dungeon and in town; his class card, and he with the greatsword, as ever. Off, nothing changes. Held here:
//   1. which weapon is drawn: the axe for the battle axe, the maul for the warhammer, none for the greatsword, none off, none for
//      another hero;
//   2. his places with each (art/heroes.ts HEAVY_PLACES, lookOfPlace) and the pictures given for them: the axe's own lists (its
//      chop crouch, its run while the axe flies), the maul's (its charge crouch), on his back in town; the greatsword's otherwise;
//   3. the bake's groups (render/baked.ts): one each for him with the axe and with the maul while the tree is on; none off.
// No frame is painted: only lists are asked for.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { HEAVY_PLACES, lookOfPlace } from '../src/art/heroes';
import { makeHeroArt3 } from '../src/art/heroes3';
import { WARRIOR_TREE2, heavyDrawn } from '../src/game/talents';
import { bakeGroups } from '../src/render/baked';

function withTree<T>(on: boolean, run: () => T): T {
  const was = WARRIOR_TREE2.on;
  WARRIOR_TREE2.on = on;
  try {
    return run();
  } finally {
    WARRIOR_TREE2.on = was;
  }
}

test('1. which weapon is drawn: the axe, the maul, or none (the greatsword; the tree off; another hero)', () => {
  withTree(true, () => {
    assert.equal(heavyDrawn('warrior', ['battleaxe']), 'axe');
    assert.equal(heavyDrawn('warrior', ['warhammer', 'x']), 'hammer');
    assert.equal(heavyDrawn('warrior', ['greatsword']), null);
    assert.equal(heavyDrawn('warrior', []), null, 'the greatsword till one is picked');
    assert.equal(heavyDrawn('ranger', ['battleaxe']), null);
  });
  withTree(false, () => assert.equal(heavyDrawn('warrior', ['battleaxe']), null, 'off: as ever'));
});

test('2. his places with each weapon, and the pictures given for them', () => {
  assert.deepEqual(lookOfPlace(HEAVY_PLACES.axe.dungeon), { twoHanded: true, town: false, weapon: 'axe' });
  assert.deepEqual(lookOfPlace(HEAVY_PLACES.axe.town), { twoHanded: true, town: true, weapon: 'axe' });
  assert.deepEqual(lookOfPlace(HEAVY_PLACES.hammer.dungeon), { twoHanded: true, town: false, weapon: 'hammer' });
  assert.deepEqual(lookOfPlace(HEAVY_PLACES.hammer.town), { twoHanded: true, town: true, weapon: 'hammer' });
  const art = makeHeroArt3();
  const sword = art.of('warrior', { twoHanded: true, town: false });
  const axe = art.of('warrior', { twoHanded: true, town: false, weapon: 'axe' });
  const maul = art.of('warrior', { twoHanded: true, town: false, weapon: 'hammer' });
  assert.ok(axe !== sword && maul !== sword && axe !== maul, 'three sets of pictures');
  assert.ok(axe.front.clips?.moves?.chopCrouch, 'the axe: its Leaping Chop crouch');
  assert.ok(axe.front.clips?.moves?.runEmpty, 'the axe: his run while it flies');
  assert.ok(maul.front.clips?.moves?.chargeCrouch, 'the maul: its Shoulder Charge crouch');
  assert.ok(!sword.front.clips?.moves?.chopCrouch && !sword.front.clips?.moves?.chargeCrouch, 'the greatsword: neither');
  assert.equal(art.of('warrior', { twoHanded: true, town: false, weapon: 'axe' }), axe, 'made once');
  const town = art.of('warrior', { twoHanded: true, town: true, weapon: 'axe' });
  assert.ok(town !== axe && town.front.idle.length > 0 && (town.front.attack ?? []).length === 0, 'in town: on his back, no blows');
  const card = art.of('warrior', { twoHanded: true, town: true, card: true, weapon: 'axe' });
  assert.equal(card, art.of('warrior', { twoHanded: true, town: true, card: true }), 'his card: the great sword, as ever');
});

test('3. the bake: a group for him with the axe and one with the maul while the tree is on; none off', () => {
  withTree(true, () => {
    const g = bakeGroups(false);
    assert.deepEqual(g['warrior-axe'].map((k) => k.place), ['axeTown', 'axe']);
    assert.deepEqual(g['warrior-hammer'].map((k) => k.place), ['hammerTown', 'hammer']);
    assert.deepEqual(g.warrior.map((k) => k.place), ['town', 'dungeon'], 'the great sword\'s as it was');
  });
  withTree(false, () => {
    const g = bakeGroups(false);
    assert.ok(!('warrior-axe' in g) && !('warrior-hammer' in g));
  });
});
