// FLOOR 5'S TEMPLE DOOR AND ITS TWO KEY-BEARERS (game/temple_door.ts, game/act1_rules/keybearers.ts; their pictures art/temple_door.ts,
// art/key_bearers.ts, art/key_bearers_fx.ts; drawn by render/act1_fx/keybearers.ts), behind TEMPLE_DOOR.
//
//   1. the switch off: floor 5 as it was, no door, no bearers;
//   2. on: the door in the mine's threshold, its tiles walled; two rooms of the mine for the bearers, far apart;
//   3. the unlocking: told without keys; with both, the chains, the swing, the way open;
//   4. the bearers are built: their rules, what they draw, their pictures with every clip their acts name, long enough;
//   5. the Knife's throw strikes from afar, his leap where he lands;
//   6. the Flame's great sigil under the hero, his fan, his ring as its edge passes (and not one rolling through it);
//   7. killed, each drops his key, taken as the hero walks onto it;
//   8. nothing they throw or drop glows cyan.
//   run: tsx --test tests/temple_door.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { act1Fig } from '../src/art/act1_figs/index';
import { LAIR_TEMPLE } from '../src/art/lair_temple';
import { KEY_BLADE, KEY_FLAME } from '../src/art/key_bearers';
import { fireBallSprite, keySprite, knifeSprite, ringTongue } from '../src/art/key_bearers_fx';
import { TEMPLE_DOOR } from '../src/art/temple_door';
import { KEY_PERIL, RULES_BLADE, RULES_FLAME } from '../src/game/act1_rules/keybearers';
import { act1Rules } from '../src/game/act1_rules/index';
import { doorTiles } from '../src/game/doors';
import { makeDungeon } from '../src/game/level';
import { TEMPLE_TIMES, keyBearerSpots, stepTempleDoor } from '../src/game/temple_door';
import { act1Fx } from '../src/render/act1_fx/index';
import { FX_BLADE, FX_FLAME } from '../src/render/act1_fx/keybearers';
import { doorMiddle } from '../src/game/doors';
import { cyanIn, fakeDocument, firstHurt, room, watch } from './act1_kinds_room';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();
fakeDocument();

/** Floor 5 laid with the switches as asked, then put back. */
function floor5(seed: number, on: boolean) {
  const was = [LAIR_TEMPLE.on, TEMPLE_DOOR.on];
  LAIR_TEMPLE.on = true;
  TEMPLE_DOOR.on = on;
  try {
    return makeDungeon(5, seed);
  } finally {
    [LAIR_TEMPLE.on, TEMPLE_DOOR.on] = was;
  }
}

test('1. the switch off: floor 5 as it was, no door, no bearers', () => {
  const L = floor5(3, false);
  assert.ok(!L.temple, 'no temple door');
  assert.ok(!L.doors.some((d) => d.spot.kind === 'templedoor'), 'none among its doors');
});

test('2. on: the door in the threshold, walled; two rooms of the mine for the bearers', () => {
  for (const seed of [1, 2, 3, 4, 5, 6]) {
    const L = floor5(seed, true);
    assert.ok(L.temple, `seed ${seed}: the door`);
    const T = L.temple!;
    const d = L.doors[T.door];
    assert.equal(d.spot.kind, 'templedoor', 'its own door');
    for (const i of doorTiles(L.floor, d.spot)) assert.equal(L.walk[i], 0, 'its tiles a wall till it opens');
    const spots = keyBearerSpots(L);
    assert.equal(spots.length, 2, `seed ${seed}: two rooms for the bearers`);
    for (const s of spots) {
      const i = Math.floor(s.y) * L.floor.w + Math.floor(s.x);
      assert.equal(L.walk[i], 1, 'each on the floor');
      assert.equal(L.lair!.part[i], 1, 'each in the mine, not the temple');
    }
    assert.ok(spots[0].room !== spots[1].room, 'in two rooms');
  }
});

test('3. the unlocking: told without keys; with both, the chains, the swing, the way open', () => {
  const L = floor5(2, true);
  const T = L.temple!;
  const m = doorMiddle(L.doors[T.door].spot);
  const hero = { x: m.x, y: m.y };
  assert.deepEqual(stepTempleDoor(L, hero, 1), ['told'], 'near it without keys: told, once');
  assert.deepEqual(stepTempleDoor(L, hero, 1.5), [], 'and only once');
  T.keys = 2;
  const seen: string[] = [];
  for (let t = 2; t < 2 + TEMPLE_TIMES.swingAt + TEMPLE_TIMES.swing + 0.5; t += 1 / 30) seen.push(...stepTempleDoor(L, hero, t));
  assert.deepEqual(seen, ['began', 'chain1', 'chain2', 'swing', 'open'], 'in order');
  for (const i of doorTiles(L.floor, L.doors[T.door].spot)) assert.equal(L.walk[i], 1, 'the way open');
});

test('4. the bearers are built: rules, what they draw, every clip their acts name, long enough', () => {
  assert.ok(act1Rules('keyblade') === RULES_BLADE && act1Rules('keyflame') === RULES_FLAME, 'their rules');
  assert.ok(act1Fx('keyblade') === FX_BLADE && act1Fx('keyflame') === FX_FLAME, 'what they draw');
  for (const [kind, R] of [['keyblade', RULES_BLADE], ['keyflame', RULES_FLAME]] as const) {
    const art = act1Fig(kind)!.make();
    for (const set of [art.front, art.back]) {
      for (const a of R.acts) {
        const clip = a.clip === 'attack' ? set.clips!.attack! : set.clips!.moves![a.clip];
        assert.ok(clip, `${kind}: its clip ${a.clip}`);
        assert.ok(clip.frames.length / clip.fps >= a.long - 0.05, `${kind}: ${a.clip} as long as its act`);
      }
      assert.ok(set.clips!.die && set.clips!.reel, `${kind}: its death and its flinch`);
    }
  }
  assert.ok(KEY_BLADE.more!.leap && KEY_BLADE.more!.throw && KEY_FLAME.more!.fan && KEY_FLAME.more!.ring, 'their moves');
});

test('5. the Knife: his throw strikes from afar; his leap where he lands', () => {
  {
    const { g, m } = room('keyblade', 6, 'keyblade:throw');
    const s = watch(g, m, 2.5);
    assert.ok(s.acts.some((a) => a.startsWith('keyblade:throw')), 'he throws');
    assert.equal(s.hurts.length, 1, 'the knife strikes him once');
    assert.ok(firstHurt(s) - s.began > RULES_BLADE.acts[1].hit, 'after it leaves his hand');
  }
  {
    const { g, m } = room('keyblade', 3.5, 'keyblade:leap');
    const s = watch(g, m, 1.6);
    assert.ok(s.acts.some((a) => a.startsWith('keyblade:leap')), 'he leaps');
    assert.ok(s.hurts.length >= 1, 'and his plunge strikes him where he lands');
  }
});

test('6. the Flame: his sigil under the hero, his fan, his ring as it passes (not through a roll)', () => {
  {
    const { g, m } = room('keyflame', 5, 'keyflame:sigil');
    const s = watch(g, m, 1.6);
    assert.ok(s.hurts.length >= 1, 'the sigil erupts under him');
    assert.ok(Math.abs(firstHurt(s) - s.began - RULES_FLAME.acts[0].hit) < 0.12, 'at his slam');
  }
  {
    const { g, m } = room('keyflame', 5, 'keyflame:fan');
    const s = watch(g, m, 2);
    assert.ok(s.hurts.length >= 1, 'a ball of his fan strikes him');
  }
  {
    const { g, m } = room('keyflame', 2.5, 'keyflame:ring');
    const s = watch(g, m, 2.4);
    assert.equal(s.hurts.length, 1, 'the ring strikes him once as it passes');
  }
  {
    const { g, m } = room('keyflame', 2.5, 'keyflame:ring');
    // (rolling the whole while: unhurtable as he rolls)
    const s = watch(g, m, 2.4, () => {
      g.hero.invuln = 0.1;
      return null;
    });
    assert.equal(s.hurts.length, 0, 'not one who rolls through it');
  }
});

test('7. killed, each drops his key, taken as the hero walks onto it', () => {
  for (const kind of ['keyblade', 'keyflame'] as const) {
    const { g, m } = room(kind, 3);
    let taken = 0;
    (g as unknown as { templeKeyTaken: () => void }).templeKeyTaken = () => taken++;
    g.kill(m);
    const key = g.perils.find((p) => p.a1 === KEY_PERIL);
    assert.ok(key, `${kind}: his key on the floor`);
    watch(g, m, 0.3);
    assert.equal(taken, 0, 'not taken from afar');
    g.hero.x = key!.x;
    g.hero.y = key!.y;
    watch(g, m, 1);
    assert.equal(taken, 1, `${kind}: taken as he walks onto it`);
    assert.ok(!g.perils.some((p) => p.a1 === KEY_PERIL), 'and gone from the floor');
  }
});

test('8. nothing they throw or drop glows cyan', () => {
  const all = [keySprite(0), keySprite(1), knifeSprite(0), knifeSprite(3), fireBallSprite(0), ringTongue(10, 0), ringTongue(4, 2)];
  for (const s of all) assert.equal(cyanIn(s), 0, 'no cyan: the friend’s colour');
});
