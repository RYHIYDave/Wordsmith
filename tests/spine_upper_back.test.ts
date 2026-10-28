// THE SPINE'S TWO NEW JOINTS (art/skeleton.ts Bones.hunch, shrug): the top of the back curled forward over the chest, from
// half way up the ribs, and the shoulders rolled forward round it. His words, 25 Oct 2026, of the warlock (the art chat,
// branch mockup/classes): "Can you put some articulation points in the spine in the wire frame the character sprites are
// being built with?  The bend needs to be higher up in the back. Shoulders hunched forward".
//   1. A POSE THAT DOES NOT NAME THEM IS AS IT ALWAYS WAS, TO THE LAST DIGIT: every figure in the game is posed without
//      them, and its joints are where the spine of one piece put them (the neck a chest's length up the chest from the
//      ribs, the shoulders off the neck along the chest, the ribs' solid on the chest), and naming them as 0 changes
//      nothing either. (Checked once more widely when they were made: every pose the whole unit suite solves, solved by the
//      skeleton as it was before them and as it is, the same in every number.)
//   2. Curled, the back bends where it should: the spine keeps its lengths, the neck comes forward and down, the head and
//      the shoulders go with it, the face still looks where it is told.
//   3. Shrugged, the shoulders come forward, in, and up.
//   4. From key to key they go smoothly where a key names them, and are not there where none does.
//   run: tsx --test tests/spine_upper_back.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { HEAD_B } from '../src/art/moves3';
import { bonesAt, buildOf, curled, solve, standing, trunkOf } from '../src/art/skeleton';
import type { Bones, Build, Key3, Posed, Skeleton, V3 } from '../src/art/skeleton';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

const BUILDS: Build[] = [
  buildOf(57, 1),
  buildOf(58, HEAD_B),
  buildOf(58, HEAD_B * 1.12, { shoulders: 1.16, chest: 1.1, waist: 1.0, hips: 1.0, depth: 1.05, limbs: 1.08, pad: 1.1 }),
  buildOf(40, HEAD_B, { shoulders: 0.8, chest: 0.9 }),
];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const far = (a: V3, b: V3): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const alongR = (r: readonly [V3, V3, V3], v: V3): V3 => add(add(mul(r[0], v[0]), mul(r[1], v[1])), mul(r[2], v[2]));

/** Poses of every kind the figures take: standing, bent, twisted, tipped, the head turned past what a neck allows. */
function poses(b: Build): Bones[] {
  const out: Bones[] = [];
  let seed = 7;
  const rnd = (): number => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647 - 0.5;
  };
  out.push(standing(b));
  for (let i = 0; i < 60; i++) {
    out.push({
      ...standing(b),
      px: rnd() * 6, py: rnd() * 6, pz: rnd() * 6, yaw: rnd() * 120, pitch: rnd() * 60, roll: rnd() * 30,
      twist: rnd() * 80, bend: rnd() * 90, side: rnd() * 40, faceTurn: rnd() * 260, faceUp: rnd() * 160, faceTilt: rnd() * 40,
      lhIn: (i % 3) as 0 | 1 | 2, lhx: rnd() * 20, lhy: rnd() * 20, lhz: rnd() * 20, le: rnd() * 120,
      rhx: rnd() * 20, rhy: rnd() * 20, rhz: rnd() * 20, re: rnd() * 120,
      lfx: rnd() * 8, lfz: Math.abs(rnd()) * 6, rfx: rnd() * 8, lk: rnd() * 40, rk: rnd() * 40,
    });
  }
  return out;
}

test('a pose that does not name the new joints is as it always was: the spine in one piece, to the last digit; and naming them as 0 changes nothing', () => {
  const found: string[] = [];
  for (const b of BUILDS) {
    for (const q of poses(b)) {
      const s = solve(b, q as Posed);
      // (the spine as it was: the neck a chest's length up the chest from the ribs, the shoulders off it along the chest)
      const neck = add(s.ribs, alongR(s.chest, [0, 0, b.chest]));
      const shL = add(neck, alongR(s.chest, [0, b.shoulderHalf, -b.shoulderDrop]));
      const shR = add(neck, alongR(s.chest, [0, -b.shoulderHalf, -b.shoulderDrop]));
      const ribs = trunkOf(b, s)[0];
      const ribsC = add(s.ribs, mul(s.chest[2], b.chest * 0.42));
      if (s.upper !== s.chest) found.push('the top of the back is not the chest');
      if (curled(s)) found.push('the back counts as curled');
      if (far(s.neck, neck) !== 0) found.push(`the neck is ${far(s.neck, neck)} off`);
      if (far(s.shoulderL, shL) !== 0 || far(s.shoulderR, shR) !== 0) found.push('a shoulder is off');
      if (far(ribs.c, ribsC) !== 0 || ribs.r !== s.chest) found.push('the ribs are off');
      // (and named as nothing: the very same in every number)
      const z = solve(b, { ...q, hunch: 0, shrug: 0 } as Posed) as unknown as Record<string, unknown>;
      for (const k of Object.keys(s) as (keyof Skeleton)[]) if (JSON.stringify(s[k]) !== JSON.stringify(z[k])) found.push(`${k} differs when they are named as 0`);
    }
  }
  assert.deepEqual([...new Set(found)], []);
});

test('curled, the back bends from half way up the ribs: the spine keeps its lengths, the neck comes forward and down, the head and the shoulders go with it, the face still looks where it is told', () => {
  for (const b of BUILDS) {
    const q0 = { ...standing(b), bend: 10 } as Posed;
    const s0 = solve(b, q0);
    let fwd = 0;
    for (const hunch of [20, 40, 60, 80]) {
      const s = solve(b, { ...q0, hunch } as Posed);
      assert.ok(curled(s), 'curled');
      assert.ok(Math.abs(far(s.back, s.ribs) - b.chest / 2) < 1e-9, 'the ribs to where the back curls: half the chest');
      assert.ok(Math.abs(far(s.neck, s.back) - b.chest / 2) < 1e-9, 'where it curls to the neck: the other half');
      assert.ok(Math.abs(dot(s.upper[2], s.chest[2]) - Math.cos((hunch * Math.PI) / 180)) < 1e-9, 'curled by as many degrees as it is told');
      const ahead = dot(sub(s.neck, s0.neck), s0.chest[0]);
      assert.ok(ahead > fwd, `the neck further forward the more it curls (${hunch})`);
      fwd = ahead;
      assert.ok(s.neck[2] < s0.neck[2], 'and lower');
      assert.ok(dot(sub(s.head, s0.head), s0.chest[0]) > 0 && s.head[2] < s0.head[2], 'the head goes with it');
      assert.ok(dot(sub(s.shoulderL, s0.shoulderL), s0.chest[0]) > 0 && s.shoulderR[2] < s0.shoulderR[2], 'the shoulders go with it');
      // (the face looks level and ahead, as it is told, the back curled under it as far as a neck allows looking up from
      // it; further, it looks as far up from the curled back as a neck lets it, and no further)
      if (hunch + 10 <= 65) assert.ok(far(s.face[0], [1, 0, 0]) < 1e-9, 'the face looks where it is told');
      else assert.ok(Math.abs(Math.asin(Math.max(-1, Math.min(1, dot(s.face[0], s.upper[2])))) / (Math.PI / 180) - 65) < 1e-6, 'looking up from the curled back as far as a neck allows');
      // (the ribs lie half way between, round where it curls: a hump between the shoulder blades)
      const ribs = trunkOf(b, s)[0];
      const tip = Math.acos(Math.max(-1, Math.min(1, dot(ribs.r[2], s.chest[2])))) / (Math.PI / 180);
      assert.ok(Math.abs(tip - hunch / 2) < 1e-6, 'the ribs turned half as far');
    }
  }
});

test('shrugged, the shoulders come forward, in toward each other, and up', () => {
  for (const b of BUILDS) {
    const q0 = standing(b) as Posed;
    const s0 = solve(b, q0);
    const s = solve(b, { ...q0, shrug: 1 } as Posed);
    for (const [a, z] of [[s0.shoulderL, s.shoulderL], [s0.shoulderR, s.shoulderR]] as const) {
      assert.ok(z[0] - a[0] > 0.2 * b.shoulderHalf, 'forward');
      assert.ok(z[2] - a[2] > 0.08 * b.shoulderHalf, 'up');
    }
    assert.ok(far(s.shoulderL, s.shoulderR) < far(s0.shoulderL, s0.shoulderR), 'in');
    assert.ok(far(s.neck, s0.neck) === 0, 'the neck stays where it is');
  }
});

test('from key to key the new joints go smoothly where a key names them, and are not there where none does', () => {
  const b = BUILDS[0];
  const rest = standing(b);
  const plain: Key3[] = [{ at: 0, pose: { bend: 0 } }, { at: 1, pose: { bend: 20 } }];
  const p = bonesAt(plain, rest, 0.5);
  assert.ok(!('hunch' in p) && !('shrug' in p), 'not there where no key names them');
  const keys: Key3[] = [{ at: 0, pose: { bend: 0 }, ease: 'lin' }, { at: 1, pose: { bend: 20, hunch: 40, shrug: 1 }, ease: 'lin' }];
  for (const t of [0.25, 0.5, 0.75]) {
    const q = bonesAt(keys, rest, t);
    assert.ok(Math.abs((q.hunch ?? -1) - 40 * t) < 1e-9 && Math.abs((q.shrug ?? -1) - t) < 1e-9, `half way at ${t}`);
  }
});
