// THE PACK COLLAR'S COMPANION, PICKED ON THE COLLAR (game/companions.ts collarChoices, collarPick; game/game.ts
// pickCollarCompanion; ui/inventory.ts, the row on its card). His picks, 12 Nov 2026, by pop-up: how she picks it, “Pick it on
// the collar”; whether it may be the animal she already has, “No, one of the other two (Recommended)”.
//   run: tsx --test tests/pack_collar_pick.test.ts
import './companions_on';
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import { cleanPicks, collarChoices, collarPick } from '../src/game/companions';
import { on, room, wear } from './uniques_helpers';

const DT = 1 / 60;
const HUNT = ['keeneye', 'venom', 'huntcompanion'];
const WILD = ['fleet', 'windrunner', 'wildcompanion'];
type In = { pets: { kind: string; seat: number }[] };
const I = (g: Game): In => g as unknown as In;
function wait(g: Game, seconds: number): void {
  for (let t = 0; t < seconds - 1e-9; t += DT) {
    g.update(DT, emptyControls());
    g.events.length = 0;
  }
}
const kinds = (g: Game): string[] => I(g).pets.map((p) => p.kind).sort();

/** A Ranger in town with these talents, the collar worn. */
function inTown(talents: string[]): Game {
  const t = new Game('ranger', 5);
  t.hero.level = 50;
  t.hero.talents = [...talents];
  if (!t.level.town) t.enterTown();
  wear(t, 'packcollar');
  wait(t, 0.2);
  return t;
}

test('what it may bring: the other two of her list; of both lists with both talents; the hunting list with neither', () => {
  assert.deepEqual(collarChoices({ hunt: 'snake' }, HUNT), ['hawk', 'wolf'], 'never the one at her side');
  assert.deepEqual(collarChoices({}, WILD), ['fox', 'tortoise'], 'the bat is hers until she picks');
  assert.deepEqual(collarChoices({ hunt: 'wolf', wild: 'fox' }, [...HUNT, ...WILD]), ['hawk', 'snake', 'bat', 'tortoise']);
  assert.deepEqual(collarChoices({}, []), ['hawk', 'snake', 'wolf'], 'no companion talent: the hunting list, as it was built');
});

test('what it brings: the one picked while it may be; else, as built, the next in the list after her own', () => {
  assert.equal(collarPick({ hunt: 'snake' }, HUNT), 'wolf', 'not picked yet: as before');
  assert.equal(collarPick({}, []), 'hawk');
  assert.equal(collarPick({ hunt: 'snake', collar: 'hawk' }, HUNT), 'hawk');
  assert.equal(collarPick({ hunt: 'hawk', collar: 'hawk' }, HUNT), 'snake', 'her own pick now the same: never twins, the next after hers');
  assert.equal(collarPick({ hunt: 'snake', collar: 'bat' }, HUNT), 'wolf', 'not of her list: not brought');
  assert.equal(collarPick({ hunt: 'snake', wild: 'fox', collar: 'bat' }, [...HUNT, ...WILD]), 'bat', 'with both talents, of either list');
});

test('picked on the collar in town, only in town; the one at her side changes; kept in the save', () =>
  on(() => {
    const t = inTown(HUNT);
    assert.deepEqual(kinds(t), ['hawk', 'snake'], 'her hawk, and the collar\'s next one');
    assert.deepEqual(t.collarChoices(), ['snake', 'wolf']);
    assert.equal(t.collarCompanion(), 'snake');
    assert.equal(t.pickCollarCompanion('hawk'), false, 'not the one she has');
    assert.equal(t.pickCollarCompanion('bat'), false, 'not of another list');
    assert.equal(t.pickCollarCompanion('wolf'), true);
    wait(t, 0.1);
    assert.deepEqual(kinds(t), ['hawk', 'wolf']);
    assert.equal(I(t).pets.find((p) => p.kind === 'wolf')!.seat, 2, 'the collar\'s keeps the third place, behind her');
    const back = Game.restore(JSON.parse(JSON.stringify(t.save())));
    assert.deepEqual(back.hero.pets, { collar: 'wolf' });
    assert.deepEqual(cleanPicks({ hunt: 'snake', collar: 'tortoise', x: 'hawk' }), { hunt: 'snake', collar: 'tortoise' });
    // (her own changed to the collar's: the collar's goes back to the next after hers)
    assert.equal(t.pickCompanion('wolf'), true);
    wait(t, 0.1);
    assert.deepEqual(kinds(t), ['hawk', 'wolf'], 'her wolf, the collar\'s hawk: never two wolves');
    // (out in a dungeon: not picked)
    const d = wear(room('ranger'), 'packcollar');
    d.hero.talents = [...HUNT];
    d.refresh();
    assert.equal(d.pickCollarCompanion('wolf'), false, 'not out of town');
  }));

test('with the switch off, or for another hero, it offers nothing', () => {
  const t = on(() => inTown(HUNT));
  assert.deepEqual(t.collarChoices(), [], 'UNIQUES off');
  assert.equal(t.collarCompanion(), null);
  on(() => {
    const w = new Game('warrior', 5);
    if (!w.level.town) w.enterTown();
    assert.deepEqual(w.collarChoices(), []);
    assert.equal(w.pickCollarCompanion('hawk'), false);
  });
});
