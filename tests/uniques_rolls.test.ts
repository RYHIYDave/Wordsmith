// THE 62's NUMBERS ROLL (src/game/uniques.ts UniqueDef.rolled, ROLL_SPAN, tuned, rolledTune; Game.ut). His words, 12 Nov 2026,
// 20:12: “I’d like the uniques we have currently to have rolls if they have those types of mods.  Or maybe add some of those mods
// that might need a roll.  We just want a little randomness, and to give a player something to keep playing for, like a really
// well rolled unique”.
//   run: node tools/unit.mjs --only uniques_rolls

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
import { RNG } from '../src/engine/rng';
import { ROLL_SPAN, UNIQUE_DEFS, UNIQUE_TUNE, bendWords, makeUnique, rolledTune, tuned, uniqueDef, uniqueLines, uniqueSlot } from '../src/game/uniques';
import type { EquipSlot, Item } from '../src/game/types';
import { on, room } from './uniques_helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const near = (a: number, b: number, eps = 1e-9): boolean => Math.abs(a - b) <= eps;

test('1. every number a card of the 62 states rolls, and it is a number of the tune; the rest roll nothing', () => {
  const rolling = UNIQUE_DEFS.filter((d) => d.rolled && d.rolled.length);
  assert.equal(rolling.length, 24);
  for (const d of rolling) for (const p of d.rolled!) assert.ok(tuned(undefined, p) > 0, `${d.id}: ${p} is in the tune`);
  // (a card that names a number of the tune names one that rolls: its text read at the tune's own and at a roll's other end differ)
  for (const d of UNIQUE_DEFS) {
    const it = { uroll: Object.fromEntries((d.rolled ?? []).map((p) => [p, ROLL_SPAN[1]])) } as unknown as Item;
    const a = [...d.does(), d.price ? d.price() : ''].join(' ');
    const b = [...d.does(it), d.price ? d.price(it) : ''].join(' ');
    assert.equal(a !== b, !!(d.rolled && d.rolled.length), `${d.id}: its card ${a === b ? 'does not change' : 'changes'} with a roll`);
  }
});

test('2. one made: each of its numbers rolled within the span, the factor kept on the piece; its card says what it rolled', () =>
  on(() => {
    for (const d of UNIQUE_DEFS) {
      for (let s = 1; s <= 20; s++) {
        const it = makeUnique(d.id, 10, new RNG(s))!;
        if (!d.rolled) {
          assert.equal(it.uroll, undefined, d.id);
          continue;
        }
        for (const p of d.rolled) assert.ok(it.uroll![p] >= ROLL_SPAN[0] && it.uroll![p] <= ROLL_SPAN[1], `${d.id} ${p} ${it.uroll![p]}`);
      }
    }
    const arm = makeUnique('drownedarm', 10, new RNG(4))!;
    const said = uniqueLines(uniqueDef('drownedarm')!, 'warrior', arm)[0].text;
    assert.ok(said.includes(`${Math.round(UNIQUE_TUNE.arm.share * arm.uroll!['arm.share'] * 100)}% of your hit`), said);
    const factors = new Set(Array.from({ length: 20 }, (_, s) => makeUnique('drownedarm', 10, new RNG(s))!.uroll!['arm.share']));
    assert.ok(factors.size >= 8, 'they differ');
  }));

test('3. in play: the rules go by the rolls of the pieces he wears; one made before they rolled, by the tune', () =>
  on(() => {
    const g = room('warrior');
    const wearIt = (id: string, roll: Record<string, number> | undefined): void => {
      const d = uniqueDef(id)!;
      const it = makeUnique(id, 5, new RNG(1))!;
      it.reqLevel = 1;
      if (roll) it.uroll = roll;
      else delete it.uroll;
      const s = uniqueSlot(d);
      g.hero.gear[(s === 'ring' ? 'ring1' : s) as EquipSlot] = it;
      g.refresh();
    };
    wearIt('drownedarm', { 'arm.every': 0.8, 'arm.share': 1.2 });
    assert.ok(near(g.ut.arm.share, UNIQUE_TUNE.arm.share * 1.2) && near(g.ut.arm.every, UNIQUE_TUNE.arm.every * 0.8));
    assert.equal(g.ut.arm.r, UNIQUE_TUNE.arm.r, 'what does not roll, as the tune');
    wearIt('drownedarm', undefined);
    assert.equal(g.ut.arm.share, UNIQUE_TUNE.arm.share, 'an old piece: the tune');
    wearIt('physicianscoat', { 'coat.hits': 0.85 });
    assert.equal(g.ut.coat.hits, Math.round(UNIQUE_TUNE.coat.hits * 0.85), 'a count made whole');
    // (each “half as strong again” its own piece's)
    wearIt('censorsseal', { half: 1.2 });
    assert.ok(near(g.halves.censorsseal, UNIQUE_TUNE.half * 1.2));
    const sk = [{ front: ['fire'], behind: [] }, { front: [], behind: [] }, { front: [], behind: [] }] as never;
    assert.ok(near(bendWords(0, sk, { worn: ['censorsseal'], full: false, vow: 0, dark: null, borrowed: null, halves: g.halves }).boost, 1 + UNIQUE_TUNE.half * 1.2));
    assert.ok(near(bendWords(0, sk, { worn: ['censorsseal'], full: false, vow: 0, dark: null, borrowed: null }).boost, 1 + UNIQUE_TUNE.half), 'none given: the tune');
    // (taken off: the tune again)
    g.hero.gear.amulet = null;
    g.hero.gear.ring1 = null;
    g.hero.gear.chest = null;
    g.refresh();
    assert.equal(g.ut, UNIQUE_TUNE);
    assert.deepEqual(rolledTune(g.hero.gear, []).halves, {});
  }));
