// Tests for BIG AND WILD (art/moves3.ts WILD, render/wild.ts: a mock-up behind a switch that is off;
// the art chat, 8 Oct 2026). The owner, by 20:14: "i think we need to amend the rules for effects and
// animations change it to big and wild.  why dont you redo the WAVE animation as big and wild as you
// think is appropriate and ill tell you if it needs to go more or less wild".
//   run: tsx --test tests/wild.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { paintMove3 } from '../src/art/heroes3';
import { MAGE_BODY, MAGE_STANCES, MOVES3, WILD, useMageStances, useWild } from '../src/art/moves3';
import { bonesAt, solve } from '../src/art/skeleton';
import { SKILLS } from '../src/game/defs';
import { Fx } from '../src/render/fx';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

const wave = (): string => JSON.stringify({ rest: MOVES3.wave.rest, motion: MOVES3.wave.motion });
const TODAY = wave();
useMageStances(true);
const GUARDED = wave();
useMageStances(false);
const FR = 1 / 30;

/** With these switches on for a moment, and both off again after. */
const with_ = (stances: boolean, wild: boolean, fn: () => void): void => {
  useMageStances(stances);
  useWild(wild);
  try {
    fn();
  } finally {
    useWild(false);
    useMageStances(false);
  }
};

test('the switch is off, and the Wave is today\'s, or from her guard with her stances, as it was', () => {
  assert.equal(WILD.on, false);
  assert.equal(MAGE_STANCES.on, false);
  assert.equal(wave(), TODAY);
  with_(true, false, () => assert.equal(wave(), GUARDED));
});

test('switched on and off again, the Wave is as it was exactly; without her stances it is today\'s even with the switch on', () => {
  with_(true, true, () => assert.ok(wave() !== GUARDED, 'the wild Wave is its own'));
  assert.equal(wave(), TODAY);
  with_(false, true, () => assert.equal(wave(), TODAY, 'the wild Wave is cast from her guard'));
  // (and whichever switch goes first)
  useWild(true);
  useMageStances(true);
  const both = wave();
  useMageStances(false);
  useWild(false);
  with_(true, true, () => assert.equal(wave(), both));
  assert.equal(wave(), TODAY);
});

test('the wild Wave lands when the rules let it go, is over before their attack is, and goes from her guard to her guard', () => {
  with_(true, true, () => {
    const m = MOVES3.wave;
    const keys = m.motion.keys;
    assert.equal(m.motion.hit, 5 * FR);
    const end = keys[keys.length - 1].at;
    assert.ok(end <= SKILLS.wave.windup + SKILLS.wave.follow + 1e-9, `it ends at ${end.toFixed(3)} s`);
    assert.equal(JSON.stringify(keys[0].pose), '{}');
    assert.equal(JSON.stringify(keys[keys.length - 1].pose), '{}');
    // (the crystal burns hottest as it is let go, and her coat is thrown back by it)
    const at = bonesAt(keys, m.rest, m.motion.hit as number);
    assert.ok(at.draw >= 2.9 && at.gale >= 1.5, `draw ${at.draw.toFixed(2)}, gale ${at.gale.toFixed(2)}`);
  });
});

test('her feet grip the floor all through it: the front foot stays put, and the back one turns on its ball no more than in the Wave he said yes to', () => {
  /** The most the front foot (heel or toe) and the back foot's toe move over the floor in her Wave as it is now. */
  const feet = (): [number, number] => {
    const m = MOVES3.wave;
    const end = m.motion.keys[m.motion.keys.length - 1].at;
    const at = (t: number) => solve(MAGE_BODY, bonesAt(m.motion.keys, m.rest, t));
    const s0 = at(0);
    let front = 0;
    let back = 0;
    for (let i = 0; i <= 60; i++) {
      const s = at((end * i) / 60);
      front = Math.max(front, Math.hypot(s.toeL[0] - s0.toeL[0], s.toeL[1] - s0.toeL[1]), Math.hypot(s.heelL[0] - s0.heelL[0], s.heelL[1] - s0.heelL[1]));
      back = Math.max(back, Math.hypot(s.toeR[0] - s0.toeR[0], s.toeR[1] - s0.toeR[1]));
    }
    return [front, back];
  };
  let yes: [number, number] = [0, 0];
  with_(true, false, () => (yes = feet()));
  with_(true, true, () => {
    const [front, back] = feet();
    assert.ok(front < 0.6, `the front foot moves ${front.toFixed(2)} picture px`);
    // (turning on its ball, the tip of the back foot goes round: as far as in the Wave of 19:19, and no further)
    assert.ok(back <= yes[1] + 0.01, `the back foot's toe moves ${back.toFixed(2)} (in the Wave he said yes to, ${yes[1].toFixed(2)})`);
  });
});

test('the mage\'s pictures say where her crystal burns and how hot; the others\' say nothing', () => {
  with_(true, false, () => {
    const c = paintMove3(MOVES3.mstand, 0, 'front').charge;
    assert.ok(c !== undefined && c.heat > 1 && c.heat < 1.6, `in her guard it burns ${c?.heat}`);
  });
  with_(true, true, () => {
    const c = paintMove3(MOVES3.wave, 5 * FR, 'front').charge;
    assert.ok(c !== undefined && c.heat >= 2.9, `as the Wave goes it burns ${c?.heat}`);
  });
  assert.equal(paintMove3(MOVES3.rear, 0, 'front').charge, undefined);
});

test('the effects add nothing with the switch off; with it on, the Wave is let go with bolts, and its crystal crackles', () => {
  const play = (): void => {};
  const fx = new Fx();
  fx.handle([{ t: 'wave', x: 5, y: 5, dx: 1, dy: 0, w: 1, el: 'phys', words: [], echo: false }], play);
  fx.charge(5, 5, 20, 3, 1, 0);
  fx.update(1 / 30);
  assert.equal(fx.wild.arcs.length, 0);
  const shake = fx.shake;
  useWild(true);
  try {
    const on = new Fx();
    on.handle([{ t: 'wave', x: 5, y: 5, dx: 1, dy: 0, w: 1, el: 'phys', words: [], echo: false }], play);
    on.update(1 / 30);
    assert.ok(on.wild.arcs.some((a) => a.bolt), 'bolts shoot out');
    assert.ok(on.shake > shake, 'the screen kicks');
    const still = new Fx();
    for (let i = 0; i < 10; i++) {
      still.charge(5, 5, 20, 3, 1, 0);
      still.update(1 / 30);
    }
    assert.ok(still.wild.arcs.length > 0, 'the crystal crackles');
  } finally {
    useWild(false);
  }
});
