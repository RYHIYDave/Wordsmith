// Tests for the runs whose feet grip the floor (art/moves3.ts GRIP, a mock-up behind a switch that
// is off; the art chat, 8 Oct 2026). The owner asked at 14:20, "I want you to go through all
// animations for the three characters and see if they pass our ruleset"; every run slid its feet
// (docs/requests/hero_moves_review.md, A). With the switch on, each run steps as fast and as far
// as the game carries the hero, it is painted in sixty pictures a second of it, and the game picks
// its picture by how far the hero has gone (render/figure.ts).
//   run: tsx --test tests/grip_runs.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import type { ActorArt, AnimSet } from '../src/art/actor_types';
import { PLANS, makeHeroArt3 } from '../src/art/heroes3';
import { GRIP, GRIP_SPEED, MOVES3, RANGER_STANCES, useGrippingRuns } from '../src/art/moves3';
import { TUNE } from '../src/game/defs';
import { CLASS_IDS } from '../src/game/types';
import type { Sprite } from '../src/engine/px';
import { Figure } from '../src/render/figure';
import type { FigureState } from '../src/render/figure';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

/** Every run there is: each hero's, in the dungeon and in town. */
const RUNS = [...new Set(CLASS_IDS.flatMap((c) => [PLANS[c].dungeon.walk, PLANS[c].town.walk]))];
/** The runs as they are with the switch off, as this file found them. */
const TODAY = new Map(RUNS.map((k) => [k, JSON.stringify(MOVES3[k].motion)]));
/** The ranger's runs, which grip with his new stances whether or not the others' do (RANGER_STANCES, on since Version 19.4: tests/ranger_stances.test.ts). */
const HIS = new Set([PLANS.ranger.dungeon.walk, PLANS.ranger.town.walk]);

test('the switch is off, and the runs are today\'s (the ranger\'s grip with his stances, since Version 19.4)', () => {
  assert.equal(GRIP.on, false);
  assert.equal(RANGER_STANCES.on, true);
  for (const k of RUNS) {
    if (HIS.has(k)) assert.ok((MOVES3[k].stride ?? 0) > 0, `${k} grips with the ranger's stances`);
    else assert.equal(MOVES3[k].stride, undefined, `${k} has no stride with the switch off`);
  }
});

test('the gripping runs are made for the speed the game gives a hero', () => {
  assert.equal(GRIP_SPEED, TUNE.heroSpeed);
});

test('switched on and off again, the runs are today\'s exactly', () => {
  useGrippingRuns(true);
  try {
    for (const k of RUNS) {
      // (the ranger's grip already, with his stances: the same with the switch on)
      if (HIS.has(k)) assert.equal(JSON.stringify(MOVES3[k].motion), TODAY.get(k), `${k} grips already`);
      else assert.ok(JSON.stringify(MOVES3[k].motion) !== TODAY.get(k), `${k} changes with the switch on`);
    }
  } finally {
    useGrippingRuns(false);
  }
  assert.equal(GRIP.on, false);
  for (const k of RUNS) {
    assert.equal(JSON.stringify(MOVES3[k].motion), TODAY.get(k), `${k} is today's again`);
    if (!HIS.has(k)) assert.equal(MOVES3[k].stride, undefined);
  }
});

test('with the switch on, a turn of each run is a whole number of sixtieths, and is that many pictures', () => {
  useGrippingRuns(true);
  try {
    const art = makeHeroArt3();
    for (const cls of CLASS_IDS) {
      for (const town of [false, true]) {
        const a = art.of(cls, { twoHanded: cls === 'warrior', town });
        const key = town ? PLANS[cls].town.walk : PLANS[cls].dungeon.walk;
        const m = MOVES3[key];
        const stride = m.stride as number;
        assert.ok(stride > 0, `${key} has a stride`);
        const seconds = stride / GRIP_SPEED;
        assert.ok(Math.abs(seconds * 60 - Math.round(seconds * 60)) < 1e-9, `${key}: a turn takes ${seconds * 60} sixtieths`);
        for (const set of [a.front, a.back]) {
          assert.equal(set.walkStride, stride);
          assert.equal(set.walkFps, 60);
          assert.equal(set.walk.length, Math.round(seconds * 60), `${key}: a picture for each sixtieth`);
        }
      }
    }
  } finally {
    useGrippingRuns(false);
  }
});

test('with the switch off, the heroes are given today\'s runs, by the clock (the ranger his gripping one, with his stances)', () => {
  const art = makeHeroArt3();
  for (const cls of CLASS_IDS) {
    const a = art.of(cls, { twoHanded: cls === 'warrior', town: false });
    for (const set of [a.front, a.back]) {
      if (cls === 'ranger') {
        assert.equal(set.walkStride, MOVES3[PLANS.ranger.dungeon.walk].stride);
        assert.equal(set.walkFps, 60);
      } else {
        assert.equal(set.walkStride, undefined);
        assert.equal(set.walkFps, 30);
      }
    }
  }
});

// ---------------------------------------------------------------------------------------------
// The game's chooser: by how far the hero has gone

const named = (name: string): Sprite => ({ img: name as unknown as HTMLCanvasElement, w: 20, h: 30, ax: 10, ay: 29 });
function runner(stride: number | undefined): ActorArt {
  const set = (tag: string): AnimSet => {
    const s: AnimSet = { idle: [named(`${tag}idle`)], walk: Array.from({ length: 27 }, (_, i) => named(`${tag}walk ${i}`)), attack: [named('a'), named('b'), named('c')], idleFps: 10, walkFps: 60 };
    if (stride !== undefined) s.walkStride = stride;
    return s;
  };
  return { front: set(''), back: set('back ') };
}
const WALKING: FigureState = { anim: 'walk', animT: 0, fx: 1, fy: 0, attackSkill: 0, attackAge: 0, attackWind: 0, leapK: -1 };

test('a gripping run is shown by how far the hero has gone, whatever the clock', () => {
  const stride = 2.07;
  const art = runner(stride);
  const fig = new Figure();
  // (hasted or slowed, the same distance is the same picture)
  for (const [walked, animT] of [[0, 0], [stride / 27, 5], [(stride * 13) / 27, 0.01], [stride + (stride * 4) / 27, 9]]) {
    const k = Math.round((walked / stride) * 27) % 27;
    const f = fig.frame(art, { ...WALKING, animT, walked }, 1 / 60, 0, 0, false);
    assert.equal(f.img as unknown as string, `walk ${k}`, `${walked.toFixed(3)} tiles gone`);
  }
  // (a hair short of a picture's worth is that picture, not the one before)
  const f = fig.frame(art, { ...WALKING, animT: 0, walked: (stride * 5) / 27 - 1e-9 }, 1 / 60, 0, 0, false);
  assert.equal(f.img as unknown as string, 'walk 5');
});

test('any other run is shown by the clock, as before', () => {
  const art = runner(undefined);
  const fig = new Figure();
  for (const animT of [0, 0.1, 0.25, 0.7]) {
    const f = fig.frame(art, { ...WALKING, animT, walked: 99 }, 1 / 60, 0, 0, false);
    assert.equal(f.img as unknown as string, `walk ${Math.floor(animT * 60) % 27}`);
  }
});
