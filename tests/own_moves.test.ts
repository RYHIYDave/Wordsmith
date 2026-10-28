// EVERYONE FIGHTS WITH THEIR OWN MOVES (defs.ts OWN_MOVES). The owner, 28 Oct 2026, to the main chat: asked how weapons
// should work for the three new classes, whose tap and tap and hold are their own, his pick “Everyone own moves” (offered
// as: all six classes, the old three too, fight with their own moves; weapons only give stats); and of the old three's
// moves, “Starting weapon's (Recommended)”: the warrior Strike and Whirlwind, the ranger Shot and Volley, the mage Wave
// and Orb, each always drawn with his own weapon.
//   run: tsx --test tests/own_moves.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { ATTR_GIVES, CLASSES, OWN_MOVES, SKILLS } from '../src/game/defs';
import type { SkillId } from '../src/game/defs';
import { Game } from '../src/game/game';
import { CLASS_IDS, WEAPONS } from '../src/game/types';
import type { ClassId, WeaponKind } from '../src/game/types';
import { attacksGrownBy } from '../src/game/words';

const OWN: Record<ClassId, [SkillId, SkillId, SkillId]> = {
  warrior: ['strike', 'whirlwind', 'leap'],
  ranger: ['shot', 'volley', 'trap'],
  mage: ['wave', 'orb', 'warp'],
  warlock: ['hellbolt', 'curse', 'smokestep'],
  tinkerer: ['contraption', 'golem', 'blastjump'],
  brawler: ['jab', 'cross', 'slip'],
};

function wear(g: Game, weapon: WeaponKind): void {
  const i = g.hero.bag.findIndex((it) => it !== null && it.weapon === weapon);
  assert.ok(i >= 0, `a ${weapon} is in the bag`);
  assert.equal(g.equipFromBag(i), null, `the ${g.hero.cls} puts on the ${weapon}`);
}

test('the switch is on', () => {
  assert.equal(OWN_MOVES.on, true);
});

test('each of the three fights with his own two attacks whatever is in his hand: the warrior Strike and Whirlwind, the ranger Shot and Volley, the mage Wave and Orb', () => {
  for (const cls of CLASS_IDS) {
    const g = Game.forPractice(cls, 3);
    const h = g.hero;
    assert.deepEqual(h.skills.map((s) => s.id), OWN[cls], `a new ${cls}`);
    for (const w of WEAPONS) {
      if (g.weapon() !== w) wear(g, w);
      assert.equal(g.weapon(), w);
      assert.deepEqual(h.skills.map((s) => s.id), OWN[cls], `a ${cls} with a ${w}`);
    }
  }
});

test('the weapon still gives its damage and its speed', () => {
  const g = Game.forPractice('warrior', 3);
  const before = { min: g.hero.d.dmgMin, max: g.hero.d.dmgMax, aps: g.hero.d.aps };
  wear(g, 'wand');
  const after = { min: g.hero.d.dmgMin, max: g.hero.d.dmgMax, aps: g.hero.d.aps };
  assert.notDeepEqual(after, before, 'the wand is not the great sword');
  assert.deepEqual(g.hero.skills.map((s) => s.id), OWN.warrior, 'and he still strikes and whirls');
});

test('both attacks grow with the class\'s own attribute, whatever is in the hand', () => {
  for (const cls of CLASS_IDS) {
    const g = Game.forPractice(cls, 3);
    const c = CLASSES[cls];
    for (const w of WEAPONS) {
      const grown = attacksGrownBy(c.primary, cls, w);
      assert.ok(grown.includes(SKILLS[c.tap].name) && grown.includes(SKILLS[c.hold].name), `a ${cls}'s attacks grow with ${c.primary} holding a ${w}`);
      for (const a of ['str', 'dex', 'int'] as const) {
        if (a === c.primary) continue;
        const other = attacksGrownBy(a, cls, w);
        assert.ok(!other.includes(SKILLS[c.tap].name), `not with ${a}`);
      }
    }
    // a point of the class's attribute is a point more of each attack's damage
    const r0 = g.hero.skills[0].r.dmgMult;
    g.hero.attrs[c.primary] += 10;
    g.refresh();
    const r1 = g.hero.skills[0].r.dmgMult;
    const def = SKILLS[c.tap];
    assert.ok(Math.abs(r1 - r0 - (def.dmg * 10 * ATTR_GIVES.primaryDmg) / 100) < 1e-9, `${cls}: ten points of ${c.primary}`);
  }
});
