// THE WARRIOR'S SWIPES AND TWIN AXES, EACH ITS OWN (15 Nov 2026; his words to the main chat: “make sure all the animations for the
// warrior are correct”, “Is the shoulder charge animation correct?”; shown warrior_swipes.mp4, the live game beside it mended, by
// 15:56: “Yes, all three (Recommended)”; render/wild.ts WEAPON_LEAPS, render/figure.ts TWIN_AXES_SHOWN):
//   1. both switches on, at his yes;
//   2. his Shoulder Charge along the floor, his Leaping Chop the game's own leap's height (the art's AXE_CHOP_HIGH), his Lunge as before;
//   3. every other hero's leap as before.
//
//   run: tsx --test tests/warrior_swipes.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { AXE_CHOP_HIGH } from '../src/art/warrior_up_axe_moves';
import { TWIN_AXES_SHOWN } from '../src/render/figure';
import { LEAP_LIFT, THRUST_LIFT, WEAPON_LEAPS, leapLiftOf, swipeOf } from '../src/render/wild';

test('1. both on, at his yes', () => {
  assert.equal(WEAPON_LEAPS.on, true);
  assert.equal(TWIN_AXES_SHOWN.on, true);
});

test('2. the Charge on the floor, the Chop a leap of the art\'s height, the Lunge as before', () => {
  const maul = { cls: 'warrior', talents: ['warhammer'] };
  const axe = { cls: 'warrior', talents: ['battleaxe'] };
  const sword = { cls: 'warrior', talents: ['greatsword'] };
  assert.equal(swipeOf(maul), 'charge');
  assert.equal(swipeOf(axe), 'chop');
  assert.equal(swipeOf(sword), 'lunge');
  assert.equal(leapLiftOf(maul), 0, 'the Charge: along the floor');
  assert.equal(leapLiftOf(axe), AXE_CHOP_HIGH, 'the Chop: as high as the art drew it for');
  assert.equal(leapLiftOf(sword), THRUST_LIFT, 'the Lunge: low, as before');
  WEAPON_LEAPS.on = false;
  try {
    assert.equal(leapLiftOf(maul), THRUST_LIFT, 'off: as the live game before');
    assert.equal(leapLiftOf(axe), THRUST_LIFT);
  } finally {
    WEAPON_LEAPS.on = true;
  }
});

test('3. every other hero\'s leap as before', () => {
  for (const cls of ['ranger', 'mage', 'brawler', 'tinkerer', 'warlock']) {
    assert.equal(swipeOf({ cls, talents: ['warhammer'] }), null, cls);
    assert.equal(leapLiftOf({ cls, talents: [] }), LEAP_LIFT, cls);
  }
});
