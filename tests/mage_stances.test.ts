// Tests for the mage's new stances (art/moves3.ts MAGE_STANCES: a mock-up behind a switch that is
// off; the art chat, 8 Oct 2026). The owner, 15:38: "Each character should have a battle stance and
// a town stance." At 19:01 he said yes to her guard as her battle stance ("Yes, this stance
// (Recommended)") and to her running low with the staff ready ("Yes, low (Recommended)").
//   run: tsx --test tests/mage_stances.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { PLANS, makeHeroArt3 } from '../src/art/heroes3';
import { GRIP, MAGE_STANCES, MOVES3, RANGER_STANCES, SETTLES, WILD, useMageStances, useWild } from '../src/art/moves3';
import type { Move3 } from '../src/art/moves3';
import { bonesAt, solve } from '../src/art/skeleton';

// (VERSION 19.7: the mage's stances and every hero's moves big and wild are the game's own, art/moves3.ts
// MAGE_STANCES and WILD, put in place as moves3.ts loads. This file's tests were written with them off,
// and hold them off, as they were then; tests/wild.test.ts and tests/mage_stances.test.ts ask of them on.)
const GAME_HAS = { wild: WILD.on, stances: MAGE_STANCES.on };
useWild(false);
useMageStances(false);

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

/** Every move of the mage's that the switch changes, or that must stay as it is, by its short name. */
const HERS = ['mstand', 'mtown', 'mrun', 'mtownrun', 'mready', 'mreel', 'mlurch', 'mfall', 'mlight', 'reading', 'tmlight', 'treading'];
const snap = (k: string): string => JSON.stringify({ name: MOVES3[k].name, rest: MOVES3[k].rest, motion: MOVES3[k].motion, ready: MOVES3[k].ready, stride: MOVES3[k].stride });
const TODAY = new Map(HERS.map((k) => [k, snap(k)]));
const on = (fn: () => void): void => {
  useMageStances(true);
  try {
    fn();
  } finally {
    useMageStances(false);
  }
};
const headAt = (m: Move3, t: number): number => solve(m.build, bonesAt(m.motion.keys, m.rest, t)).head[2];
const endOf = (m: Move3): number => m.motion.keys[m.motion.keys.length - 1].at;

test('on in the game since Version 19.7, on his yes', () => {
  assert.equal(GAME_HAS.stances, true);
  assert.equal(GAME_HAS.wild, true);
});

test('switched off, her moves are today\'s', () => {
  assert.equal(MAGE_STANCES.on, false);
  for (const k of HERS) assert.equal(MOVES3[k].stride, undefined, `${k} has no stride`);
  // (her town stand and run, moves of their own now, are today's stand and run, picture for picture)
  assert.equal(JSON.stringify({ rest: MOVES3.mtown.rest, motion: MOVES3.mtown.motion }), JSON.stringify({ rest: MOVES3.mstand.rest, motion: MOVES3.mstand.motion }));
  assert.equal(JSON.stringify({ rest: MOVES3.mtownrun.rest, motion: MOVES3.mtownrun.motion }), JSON.stringify({ rest: MOVES3.mrun.rest, motion: MOVES3.mrun.motion }));
  // (and her two habits in town are today's two habits)
  assert.equal(JSON.stringify({ rest: MOVES3.tmlight.rest, motion: MOVES3.tmlight.motion }), JSON.stringify({ rest: MOVES3.mlight.rest, motion: MOVES3.mlight.motion }));
  assert.equal(JSON.stringify({ rest: MOVES3.treading.rest, motion: MOVES3.treading.motion }), JSON.stringify({ rest: MOVES3.reading.rest, motion: MOVES3.reading.motion }));
  assert.equal(PLANS.mage.town.idleA, 'tmlight');
  assert.equal(PLANS.mage.town.idleB, 'treading');
  assert.equal(PLANS.mage.dungeon.idleA, 'mlight');
  assert.equal(PLANS.mage.dungeon.idleB, 'reading');
  assert.equal(PLANS.mage.town.idle, 'mtown');
  assert.equal(PLANS.mage.town.walk, 'mtownrun');
  assert.equal(PLANS.mage.dungeon.idle, 'mstand');
});

test('switched on and off again, her moves are today\'s exactly', () => {
  on(() => {
    for (const k of ['mstand', 'mtown', 'mrun', 'mtownrun', 'mreel', 'mlurch', 'mfall', 'mlight', 'reading']) assert.ok(snap(k) !== TODAY.get(k), `${k} changes with the switch on`);
    // (in town she keeps both her habits as they are)
    for (const k of ['tmlight', 'treading']) assert.equal(snap(k), TODAY.get(k), `${k} stays as it is in town`);
    assert.equal(MOVES3.reading.name, 'The power gets away from the mage');
  });
  for (const k of HERS) assert.equal(snap(k), TODAY.get(k), `${k} is today's again`);
});

test('her runs grip with the switch, and the others\' do not; the ranger\'s switch is not touched', () => {
  on(() => {
    assert.equal(GRIP.on, false);
    // (the ranger's stances are the game's own since Version 19.4, and her switch leaves them so: his runs grip with them)
    assert.equal(RANGER_STANCES.on, true);
    assert.ok((MOVES3.mrun.stride ?? 0) > 0);
    assert.ok((MOVES3.mtownrun.stride ?? 0) > 0);
    for (const k of ['krun', 'ktownrun']) assert.equal(MOVES3[k].stride, undefined, `${k} is today's`);
    for (const k of ['rrun', 'rtownrun']) assert.ok((MOVES3[k].stride ?? 0) > 0, `${k} grips, with his stances`);
  });
});

test('in a fight she stands in the guard she comes to when she is picked, low, and runs low; in town she stands tall', () => {
  on(() => {
    const stand = MOVES3.mstand;
    const ready = MOVES3.mready;
    const guard = bonesAt(ready.motion.keys, ready.rest, ready.ready ?? 0);
    const rest = stand.rest as unknown as Record<string, number>;
    for (const f of ['pz', 'yaw', 'pitch', 'lfx', 'rfx', 'rhx', 'rhy', 'rhz', 'lhIn', 'lhx', 'wAz', 'wEl'] as const) assert.equal(rest[f], (guard as unknown as Record<string, number>)[f], `the guard's ${f}`);
    const low = headAt(stand, 0);
    const tall = headAt(MOVES3.mtown, 0);
    assert.ok(tall > low + 2, `head ${low.toFixed(1)} in a fight, ${tall.toFixed(1)} in town`);
    let run = 0;
    for (let i = 0; i < 24; i++) run += headAt(MOVES3.mrun, (endOf(MOVES3.mrun) * i) / 24);
    run /= 24;
    let townRun = 0;
    for (let i = 0; i < 24; i++) townRun += headAt(MOVES3.mtownrun, (endOf(MOVES3.mtownrun) * i) / 24);
    townRun /= 24;
    // (her run in a fight is as low as her guard, and lower than her run in town)
    assert.ok(Math.abs(run - low) < 2, `her run in a fight ${run.toFixed(1)}, her guard ${low.toFixed(1)}`);
    assert.ok(townRun > run + 0.5, `her run in a fight ${run.toFixed(1)}, in town ${townRun.toFixed(1)}`);
    // (and the crystal is alight in her guard, and surges)
    const draws = Array.from({ length: 49 }, (_, i) => bonesAt(stand.motion.keys, stand.rest, (endOf(stand) * i) / 48).draw);
    assert.ok(Math.min(...draws) >= 1.2 && Math.max(...draws) >= 1.9, `the crystal burns ${Math.min(...draws).toFixed(2)} to ${Math.max(...draws).toFixed(2)}`);
  });
});

test('her art has her stops and her setting off with the switch on, in a fight and in town, and none without', () => {
  const check = (yes: boolean): void => {
    const art = makeHeroArt3();
    for (const town of [false, true]) {
      const a = art.of('mage', { twoHanded: false, town });
      for (const set of [a.front, a.back]) {
        assert.equal(set.stops?.length ?? 0, yes ? SETTLES : 0);
        assert.equal(set.start !== undefined, yes);
        // (her casts made walking and her run the other ways are still to come)
        assert.equal(set.walkWays, undefined);
        assert.equal(set.clips?.attackWalk, undefined);
      }
    }
    assert.equal(art.of('warrior', { twoHanded: true, town: false }).front.stops, undefined, 'the warrior as today');
    // (the ranger has his own, with his stances: the game's own since Version 19.4)
    assert.ok((art.of('ranger', { twoHanded: false, town: false }).front.stops?.length ?? 0) > 0, 'the ranger with his own');
  };
  check(false);
  on(() => check(true));
});
