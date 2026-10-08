// Tests for src/art/clip.ts: animations as timelines (Version 11). An animation is a few key
// poses and the moment each is reached; the frames between are worked out here. All of it is
// arithmetic on Poses: nothing is painted.
//   run: tsx --test tests/clip.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { clipPoses, easeOf, frameCount, poseAt } from '../src/art/clip';
import type { Ease, Key } from '../src/art/clip';
import { REST } from '../src/art/kit';
import type { Pose } from '../src/art/kit';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
  notEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

const near = (a: number, b: number, eps = 1e-9): boolean => Math.abs(a - b) <= eps;
const EASES: readonly (Ease | undefined)[] = ['lin', 'in', 'out', 'io', 'hold', 'back', undefined];
/** A figure's rest pose that is not all zeroes, so that "as the rest pose has it" shows. */
const BASE: Pose = { ...REST, aim: -72, act: 1, hx: 2 };
/** Every number of a pose that moves smoothly from key to key. */
const SMOOTH = ['bob', 'lean', 'near', 'far', 'nearLift', 'farLift', 'swing', 'hx', 'hy', 'aim', 'act', 'wind', 'drag', 'ohx', 'ohy', 'pt'] as const;

test('every easing starts at nothing and ends at the whole way, and stays there outside the segment', () => {
  for (const kind of EASES) {
    // (to the last decimal but one: 'back' is a sum of cubes, and comes out at 2e-16 where it starts)
    assert.ok(near(easeOf(kind, 0), 0, 1e-12), `${kind}: nothing at the start`);
    assert.equal(easeOf(kind, 1), 1, `${kind}: all of it at the end`);
    assert.equal(easeOf(kind, -0.5), easeOf(kind, 0), `${kind}: before the segment`);
    assert.equal(easeOf(kind, 7), 1, `${kind}: after it`);
  }
});

test('the shape of each easing: even, slow to start, slow to stop, slow at both ends, held, and past the mark and back', () => {
  const steps = 200;
  for (let i = 0; i <= steps; i++) {
    const k = i / steps;
    // at an even pace
    assert.ok(near(easeOf('lin', k), k));
    // a blow leaving its wind-up: behind the even pace all the way, and settling into a pose is its mirror
    assert.ok(easeOf('in', k) <= k + 1e-12 && easeOf('out', k) >= k - 1e-12);
    assert.ok(near(easeOf('out', k), 1 - easeOf('in', 1 - k)), 'slowing into a pose is speeding out of it, backwards');
    // slow at both ends: the same from either end, and it is the default
    assert.ok(near(easeOf('io', k) + easeOf('io', 1 - k), 1), 'the same from either end');
    assert.equal(easeOf(undefined, k), easeOf('io', k), 'slow at both ends when nothing is said');
    // held: nothing until the key's own moment
    assert.equal(easeOf('hold', k), k >= 1 ? 1 : 0);
    // none of these goes backwards
    if (i > 0) for (const kind of ['lin', 'in', 'out', 'io', 'hold'] as const) assert.ok(easeOf(kind, k) >= easeOf(kind, (i - 1) / steps) - 1e-12, `${kind} never goes back`);
  }
  // slow to start: a quarter of the way after half the time; slow to stop: three quarters
  assert.ok(near(easeOf('in', 0.5), 0.25) && near(easeOf('out', 0.5), 0.75) && near(easeOf('io', 0.5), 0.5));
  assert.ok(easeOf('in', 0.1) < 0.02 && easeOf('out', 0.9) > 0.98, 'hardly moving at its slow end');
  assert.ok(easeOf('io', 0.1) < 0.03 && easeOf('io', 0.9) > 0.97 && easeOf('io', 0.25) < 0.25 && easeOf('io', 0.75) > 0.75, 'slow at both ends, quick in the middle');
  // past the key and back to it: it is at the key well before half the time has gone, a tenth
  // too far a little after half (0.58 of the way along), and comes back to the key from above
  let most = 0;
  let at = 0;
  let reached = -1;
  for (let i = 0; i <= steps; i++) {
    const v = easeOf('back', i / steps);
    if (v > most) {
      most = v;
      at = i / steps;
    }
    if (reached < 0 && v >= 1) reached = i / steps;
    if (reached >= 0) assert.ok(v >= 1 - 1e-12, 'once past the key it does not fall short of it again');
  }
  assert.ok(most > 1.05 && most < 1.15, `it overshoots by about a tenth (${most.toFixed(3)})`);
  assert.ok(at > 0.5 && at < 0.7, `a little after half way (${at})`);
  assert.ok(reached > 0.25 && reached < 0.45, `having reached the key early (${reached})`);
});

/** A plain move: rest, a pose at 0.2 s, another at 0.5 s, rest at 0.8 s, each segment at an even pace. */
const MOVE: Key[] = [
  { at: 0, pose: {} },
  { at: 0.2, pose: { hx: 10, hy: -8, aim: 100, lean: -2 }, ease: 'lin' },
  { at: 0.5, pose: { hx: 4, hy: 6, aim: -20, bob: 2 }, ease: 'lin' },
  { at: 0.8, pose: {}, ease: 'lin' },
];

test('at a key the pose is the key: what the key names, and the rest pose for everything else', () => {
  assert.deepEqual(poseAt(MOVE, BASE, 0), BASE, 'the first key names nothing: the rest pose');
  assert.deepEqual(poseAt(MOVE, BASE, 0.2), { ...BASE, hx: 10, hy: -8, aim: 100, lean: -2 });
  assert.deepEqual(poseAt(MOVE, BASE, 0.5), { ...BASE, hx: 4, hy: 6, aim: -20, bob: 2 });
  assert.deepEqual(poseAt(MOVE, BASE, 0.8), BASE, 'and it ends as it began');
  // what a key does not name is as the rest pose has it, not as the key before left it
  assert.equal(poseAt(MOVE, BASE, 0.5).lean, 0, 'the lean of the first key is not carried into the second');
  assert.equal(poseAt(MOVE, BASE, 0.2).act, BASE.act);
});

test('before the first key and after the last the pose is that key, held', () => {
  const late: Key[] = [{ at: 1, pose: { hx: 5 } }, { at: 2, pose: { hx: 9 } }];
  assert.deepEqual(poseAt(late, BASE, -3), { ...BASE, hx: 5 });
  assert.deepEqual(poseAt(late, BASE, 0.999), { ...BASE, hx: 5 });
  assert.deepEqual(poseAt(late, BASE, 2), { ...BASE, hx: 9 });
  assert.deepEqual(poseAt(late, BASE, 60), { ...BASE, hx: 9 });
  // a timeline of one key is that pose always; one of none is the rest pose
  assert.deepEqual(poseAt([{ at: 0.3, pose: { bob: 1 } }], BASE, 0), { ...BASE, bob: 1 });
  assert.deepEqual(poseAt([{ at: 0.3, pose: { bob: 1 } }], BASE, 9), { ...BASE, bob: 1 });
  assert.deepEqual(poseAt([], BASE, 0.4), BASE);
  // and the poses handed back are the caller's own: changing one changes nothing else
  const a = poseAt([], BASE, 0);
  const b = poseAt(MOVE, BASE, 0);
  a.hx = 99;
  b.hx = 98;
  assert.equal(BASE.hx, 2, 'the rest pose is not touched');
  assert.equal(poseAt(MOVE, BASE, 0).hx, 2);
  assert.deepEqual(MOVE[0].pose, {}, 'nor are the keys');
});

test('between two keys every number of the pose moves from the one toward the other', () => {
  // half way from the first key to the second, at an even pace
  const mid = poseAt(MOVE, BASE, 0.1);
  assert.ok(near(mid.hx, (BASE.hx + 10) / 2) && near(mid.hy, -4) && near(mid.aim, (BASE.aim + 100) / 2) && near(mid.lean, -1));
  // two thirds of the way from the second to the third
  const on = poseAt(MOVE, BASE, 0.4);
  assert.ok(near(on.hx, 10 + (4 - 10) * (2 / 3)) && near(on.hy, -8 + 14 * (2 / 3)) && near(on.aim, 100 - 120 * (2 / 3)));
  assert.ok(near(on.lean, -2 / 3) && near(on.bob, 4 / 3), 'a number only one of the two keys names moves between it and the rest pose');
  // all of them move: a key that names every smooth number, reached at an even pace
  const all: Partial<Pose> = {};
  SMOOTH.forEach((f, i) => (all[f] = 10 + i));
  const q = poseAt([{ at: 0, pose: {} }, { at: 1, pose: all, ease: 'lin' }], BASE, 0.25);
  for (const f of SMOOTH) assert.ok(near(q[f], BASE[f] + ((all[f] as number) - BASE[f]) * 0.25), `${f} is a quarter of the way there`);
  // the pace of a segment is the easing of the key it leads to
  const eased = (ease: Ease | undefined, t: number): number => poseAt([{ at: 0, pose: { hx: 0 } }, { at: 1, pose: { hx: 100 }, ease }], BASE, t).hx;
  for (const kind of EASES) {
    for (const t of [0.1, 0.3, 0.5, 0.77, 0.95]) assert.ok(near(eased(kind, t), 100 * easeOf(kind, t)), `${kind} at ${t}`);
  }
  assert.equal(eased('hold', 0.99), 0, 'held: the old pose until the key\'s moment');
  assert.equal(eased('hold', 1), 100);
  assert.ok(eased('back', 0.75) > 100, 'past the key, on the way to it');
  // the easing named on the FIRST of two keys says how that key was reached, not how it is left
  const left = poseAt([{ at: 0, pose: { hx: 0 }, ease: 'hold' }, { at: 1, pose: { hx: 100 }, ease: 'lin' }], BASE, 0.5).hx;
  assert.ok(near(left, 50));
  // a segment is measured from its own keys, wherever on the timeline it lies
  const late = poseAt([{ at: 2, pose: { hx: 0 } }, { at: 4, pose: { hx: 10 }, ease: 'lin' }, { at: 5, pose: { hx: 20 }, ease: 'lin' }], BASE, 4.5).hx;
  assert.ok(near(late, 15));
});

test('a weapon goes behind the body, and one thing in the hand gives way to another, at the middle of the segment', () => {
  const swing: Key[] = [
    { at: 0, pose: { behind: false } },
    { at: 1, pose: { behind: true }, ease: 'lin' },
    { at: 2, pose: { behind: false }, ease: 'in' },
  ];
  assert.equal(poseAt(swing, BASE, 0.49).behind, false);
  assert.equal(poseAt(swing, BASE, 0.5).behind, true, 'from the middle on, as the key it is going to has it');
  assert.equal(poseAt(swing, BASE, 1).behind, true);
  // the middle of the MOVEMENT: a segment that starts slowly is half way along after seven tenths of its time
  assert.equal(poseAt(swing, BASE, 1.7).behind, true);
  assert.equal(poseAt(swing, BASE, 1.72).behind, false);
  // two things, one after the other: the first until the middle, then the second
  const things: Key[] = [
    { at: 0, pose: { prop: 1 } },
    { at: 1, pose: { prop: 2 }, ease: 'lin' },
  ];
  assert.equal(poseAt(things, BASE, 0.49).prop, 1);
  assert.equal(poseAt(things, BASE, 0.5).prop, 2);
  // a thing taken in hand, or put away: it is in the picture all the while the hand is on its way
  // (how far out it is, is for the pose's other numbers to say)
  const taken: Key[] = [
    { at: 0, pose: {} },
    { at: 1, pose: { prop: 2, pt: 1 }, ease: 'lin' },
    { at: 2, pose: {}, ease: 'lin' },
  ];
  assert.equal(poseAt(taken, BASE, 0).prop, 0, 'not before the timeline begins');
  for (const t of [0.01, 0.3, 0.7, 1, 1.3, 1.99]) assert.equal(poseAt(taken, BASE, t).prop, 2, `in the picture at ${t}`);
  assert.equal(poseAt(taken, BASE, 2).prop, 0, 'and gone when the last key is reached');
  assert.ok(near(poseAt(taken, BASE, 1.5).pt, 0.5), 'while how far along it is moves like any other number');
  // nothing in hand at either end: nothing in between
  assert.equal(poseAt(MOVE, BASE, 0.35).prop, 0);
});

test('the free hand: moved smoothly as a number, or carried from one named place to the next', () => {
  const hand: Key[] = [
    { at: 0, pose: { off: 0 } },
    { at: 1, pose: { off: 4 }, ease: 'lin' },
    { at: 2, pose: { off: 5 }, ease: 'in' },
    { at: 3, pose: { off: 0 } },
  ];
  // as an amount (the warrior's shield arm, the mage's flung hand): it moves like the other numbers
  const smooth = poseAt(hand, BASE, 0.25);
  assert.ok(near(smooth.off, 1) && near(smooth.off2, 1) && smooth.offK === 0, 'a quarter of the way, and going nowhere else');
  assert.ok(near(poseAt(hand, BASE, 1.5).off, 4 + 0.25), 'eased like the rest of the segment');
  // as one of a few named places (the ranger's: at the side, on the string, at the quiver): the
  // pose says where the hand was, where it is going, and how far along it is
  const stepped = poseAt(hand, BASE, 0.25, true);
  assert.deepEqual([stepped.off, stepped.off2], [0, 4], 'from the side to the fourth place');
  assert.ok(near(stepped.offK, 0.25));
  const next = poseAt(hand, BASE, 1.5, true);
  assert.deepEqual([next.off, next.off2], [4, 5]);
  assert.ok(near(next.offK, 0.25), 'how far along is eased like the rest of the segment');
  // the other numbers are the same either way
  for (const f of SMOOTH) assert.equal(poseAt(MOVE, BASE, 0.33, true)[f], poseAt(MOVE, BASE, 0.33)[f]);
  // at the moment of a key the hand is at that key's place, with all of the way to the next still to go
  const at = poseAt(hand, BASE, 1, true);
  assert.deepEqual([at.off, at.off2, at.offK], [4, 5, 0]);
  // and at the ends of the timeline, and outside it, it is where it is and going nowhere
  for (const t of [-1, 0, 3, 8]) {
    for (const s of [true, false]) {
      const q = poseAt(hand, BASE, t, s);
      assert.deepEqual([q.off, q.off2, q.offK], [0, 0, 0], `settled at ${t}`);
    }
  }
  const held = poseAt([{ at: 0, pose: { off: 6 } }], BASE, 0.5, true);
  assert.deepEqual([held.off, held.off2, held.offK], [6, 6, 0], 'a hand that is somewhere is going to where it is');
});

test('a timeline has a frame at its start, a frame at its end, and those between', () => {
  // whole frames: 0.4 s at 30 a second is 13 frames (12 steps), 3.6 s at 20 is 73
  assert.equal(frameCount([{ at: 0, pose: {} }, { at: 0.4, pose: {} }], 30), 13);
  assert.equal(frameCount([{ at: 0, pose: {} }, { at: 1.3, pose: {} }, { at: 3.6, pose: {} }], 20), 73);
  assert.equal(frameCount(MOVE, 10), 9);
  // only the first and the last key count, and only how far apart they are
  assert.equal(frameCount([{ at: 2, pose: {} }, { at: 2.1, pose: {} }, { at: 2.4, pose: {} }], 30), 13);
  // a leap is laid out from 0 to 1 and shown in twelve steps
  assert.equal(frameCount([{ at: 0, pose: {} }, { at: 1, pose: {} }], 12), 13);
  // nothing to show is still one frame
  assert.equal(frameCount([], 30), 1);
  assert.equal(frameCount([{ at: 0.7, pose: {} }], 30), 1);
  // (anything longer than nothing has a frame for its end as well as its start)
  assert.equal(frameCount([{ at: 0, pose: {} }, { at: 0.001, pose: {} }], 30), 2);
  // a length that is not a whole number of frames is taken UP to the next: the last frame is at or
  // after the last key (where the pose is the last key's), never short of it, and less than a
  // frame late. (It was taken to the nearest at first, and a 0.48 s attack then stopped a third of
  // a frame before its end, with the hero not yet back as they stand.)
  for (const len of [0.42, 0.46, 0.48, 0.5, 0.6, 0.62, 0.64, 1, 2.4]) {
    for (const fps of [12, 20, 30]) {
      const n = frameCount([{ at: 0, pose: {} }, { at: len, pose: {} }], fps);
      const late = (n - 1) / fps - len;
      assert.ok(late >= -1e-6 && late < 1 / fps, `${len} s at ${fps} a second: ${n} frames, the last ${late.toFixed(4)} s after the end`);
    }
  }
});

test('the frames of a timeline: one pose for each, a frame apart, from the first key on', () => {
  const poses = clipPoses(MOVE, BASE, 10);
  assert.equal(poses.length, frameCount(MOVE, 10));
  poses.forEach((q, i) => assert.deepEqual(q, poseAt(MOVE, BASE, i / 10), `frame ${i} shows the moment ${i / 10}`));
  assert.deepEqual(poses[0], BASE);
  assert.deepEqual(poses[2], { ...BASE, hx: 10, hy: -8, aim: 100, lean: -2 }, 'a key that falls on a frame is shown as it is');
  assert.deepEqual(poses[8], BASE);
  // each frame is a pose of its own
  assert.notEqual(poses[0], poses[8]);
  // a timeline that does not begin at nought is shown from its first key
  const late: Key[] = [{ at: 5, pose: { hx: 0 } }, { at: 6, pose: { hx: 10 }, ease: 'lin' }];
  const shown = clipPoses(late, BASE, 4);
  assert.deepEqual(shown.map((q) => q.hx), [0, 2.5, 5, 7.5, 10]);
  // the stepped hand is carried through
  const hand: Key[] = [{ at: 0, pose: {} }, { at: 1, pose: { off: 2 }, ease: 'lin' }];
  assert.deepEqual(clipPoses(hand, BASE, 2, true).map((q) => [q.off, q.off2, q.offK]), [[0, 0, 0], [0, 2, 0.5], [2, 2, 0]]);
  assert.deepEqual(clipPoses(hand, BASE, 2).map((q) => [q.off, q.off2, q.offK]), [[0, 0, 0], [1, 1, 0], [2, 2, 0]]);
  // no keys: one frame, the rest pose
  assert.deepEqual(clipPoses([], BASE, 30), [BASE]);
});
