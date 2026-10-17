// THE WARRIOR'S DIVING THRUST (art/moves3.ts THRUST3, shown for his leap while art/heroes3.ts THRUST
// is on; render/wild.ts gives it its own dust, wind and blade). The owner to the main chat, 17 Oct
// 2026: "A diving thrust in the direction with the sword extended.  Same distance as the leap.  Same
// mobility." What is held here: that with the switch off nothing of the game changes; that with it on
// only the warrior's leap pictures change, as many as the leap's and over as long, so the game carries
// him as far and as quick (his coming up out of it, shown only while he stands, is a beat longer); that both hands stay on the hilt and the point leads from the coil to the
// lunge; and that the dive stays low, a dive and not a leap.
//   run: tsx --test tests/warrior_thrust.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
import type { Clip } from '../src/art/actor_types';
import type { HeroLook } from '../src/art/heroes';
import { THRUST, makeHeroArt3 } from '../src/art/heroes3';
import { LEAP3, MOVES3, THRUST3 } from '../src/art/moves3';
import { CLASS_IDS } from '../src/game/types';
import { LEAP_LIFT, THRUST_LIFT } from '../src/render/wild';
import { paintWithoutCanvas, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

const DUNGEON: HeroLook = { twoHanded: true };
const VIEWS = ['front', 'back'] as const;

test('the switch is off, and the thrust is a move of its own beside the leap', () => {
  assert.equal(THRUST.on, false, 'the switch is the main chat\'s to turn on');
  assert.ok(MOVES3.kthrust === THRUST3, 'the thrust is among the moves');
  assert.ok(MOVES3.leap === LEAP3, 'the leap is still the leap');
  assert.equal(THRUST3.held, 'greatsword');
  assert.equal(THRUST3.motion.hit, 0.5, 'the blow lands as he comes down, as the leap\'s does');
  assert.equal(THRUST3.arc?.until, LEAP3.arc?.until, 'he is carried for as long a share of it as the leap');
});

test('with the switch on only the warrior\'s leap changes, frame for frame as many and as long', () => {
  // (the heroes are painted as they are first asked for: each set is read whole while its switch is as it should be)
  const read = (on: boolean): Map<string, Record<string, unknown>> => {
    THRUST.on = on;
    try {
      const art = makeHeroArt3();
      const out = new Map<string, Record<string, unknown>>();
      for (const cls of CLASS_IDS) for (const view of VIEWS) out.set(`${cls} ${view}`, (art.of(cls, DUNGEON)[view].clips ?? {}) as Record<string, unknown>);
      return out;
    } finally {
      THRUST.on = false;
    }
  };
  const offs = read(false);
  const ons = read(true);
  for (const cls of CLASS_IDS) {
    for (const view of VIEWS) {
      const a = offs.get(`${cls} ${view}`) ?? {};
      const b = ons.get(`${cls} ${view}`) ?? {};
      assert.equal(Object.keys(b).sort().join(), Object.keys(a).sort().join(), `${cls}, ${view}: the same clips`);
      // (each clip, and each clip of the ones kept in lists and by name)
      const clipsOf = (o: Record<string, unknown>): Map<string, Clip> => {
        const out = new Map<string, Clip>();
        for (const [name, v] of Object.entries(o)) {
          if (Array.isArray(v)) v.forEach((c, i) => out.set(`${name}.${i}`, c as Clip));
          else if (v && typeof v === 'object' && 'frames' in v) out.set(name, v as Clip);
          else if (v && typeof v === 'object') for (const [k, c] of Object.entries(v)) out.set(`${name}.${k}`, c as Clip);
        }
        return out;
      };
      const ma = clipsOf(a);
      const mb = clipsOf(b);
      for (const [name, ca] of ma) {
        const cb = mb.get(name);
        assert.ok(cb !== undefined, `${cls}, ${view}: ${name} is still there`);
        if (!cb) continue;
        assert.equal(cb.fps, ca.fps, `${cls}, ${view}, ${name}: as quick`);
        // (what he does once down, if he is left standing, is a picture only: the lunge is held a beat longer than the leap's landing)
        if (!(cls === 'warrior' && name === 'land')) assert.equal(cb.frames.length, ca.frames.length, `${cls}, ${view}, ${name}: as many frames`);
        const changed = cb.frames.length !== ca.frames.length || ca.frames.some((f, i) => unlike(f, cb.frames[i]) > 0);
        const should = cls === 'warrior' && (name === 'leap' || name === 'land');
        assert.equal(changed, should, `${cls}, ${view}, ${name}: ${should ? 'unchanged, and it should be the thrust' : 'changed by the thrust'}`);
      }
    }
  }
});

test('both hands on the hilt and the point leading, from the coil to the lunge', () => {
  const keys = THRUST3.motion.keys;
  const hit = THRUST3.motion.hit ?? 0;
  for (const key of keys) {
    if (key.at > hit + 1e-9) break;
    const pose = { ...THRUST3.rest, ...key.pose };
    assert.equal(pose.lhIn, 3, `at ${key.at.toFixed(3)}: the left hand is on the hilt`);
    assert.equal(pose.rhIn, 1, `at ${key.at.toFixed(3)}: the right hand holds the sword`);
    assert.equal(pose.wAz ?? 0, 0, `at ${key.at.toFixed(3)}: the point is on where he is going`);
  }
  // (flat out in the middle of it: leaning far over, and the point a little down at the end)
  const mid = keys.filter((k) => k.at > hit * 0.3 && k.at < hit * 0.8);
  assert.ok(mid.length >= 2 && mid.every((k) => (k.pose.pitch ?? 0) >= 60), 'he is flat out in the dive');
  const down = keys.find((k) => Math.abs(k.at - hit) < 1e-9);
  assert.ok(down !== undefined && (down.pose.wEl ?? 0) < 0 && (down.pose.pz ?? 0) < -5, 'he lands low in a lunge, the point down at what he strikes');
});

test('the dive stays low: a dive, not a leap', () => {
  assert.ok(THRUST_LIFT > 0 && THRUST_LIFT < LEAP_LIFT / 3, `lifted ${THRUST_LIFT}, the leap ${LEAP_LIFT}`);
  assert.ok((THRUST3.arc?.high ?? 0) < (LEAP3.arc?.high ?? 0) / 3, 'its arc is low');
});
