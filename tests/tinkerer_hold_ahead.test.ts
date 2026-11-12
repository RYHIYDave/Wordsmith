// THE TINKERER'S HELD MOVE WORKED OUT APART (the queue's make-tinkerers-art-set-up-in-parts, 12 Nov 2026): her tap and hold's keys
// steadied (dev/brawler_punches.ts steadied, some 2.7 s of work) no longer as her art is set up, but when a picture of the move is
// first painted, or ahead, a slice a step (dev/keys_later.ts keysAhead; art/tinkerer_art.ts tinkererAhead; main.ts loadSteps); her fall's keys likewise.
// Held here:
//   1. her keys are the very numbers they were before (their hash taken on the code before this change), read at once or made a
//      slice a step; and the Brawler's moves steadied by the same code are the same too;
//   2. made a slice a step, the work is some 380 steps, and once done there is nothing more to do ahead;
//   3. her art set up does not work them out (her pictures from the bake never need them); a picture of the move painted does.
//   (Her fall's keys, a tenth of a second, are worked out apart the same way.)
//   run: tsx --test tests/tinkerer_hold_ahead.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore - node typings are not part of this project
import { createHash } from 'node:crypto';
import type { LoadStep } from '../src/engine/steps';
import type { Key3 } from '../src/art/skeleton';
import { tinkerHold } from '../src/dev/tinkerer_hold';
import { tinkerFall } from '../src/dev/tinkerer_fall';
import { keysAhead, keysWorkedOut } from '../src/dev/keys_later';
import { brawlerLurch, brawlerReel } from '../src/dev/brawler_hits';
import { makeTinkererArt, tinkererAhead } from '../src/art/tinkerer_art';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const assert: Assert = nodeAssert;
const test: (name: string, fn: () => void) => void = nodeTest;

paintWithoutCanvas();

/** Every step done, as main.ts runSteps does them (one that gives back more has them done next); how many there were. */
function runAll(steps: LoadStep[]): number {
  const q = [...steps];
  let n = 0;
  while (q.length) {
    const more = q.shift()!();
    n++;
    if (more && more.length) q.unshift(...more);
  }
  return n;
}

/** A move's keys, every number to the last bit, as a short hash (as they were taken on the code before this change). */
function hash(keys: readonly Key3[]): string {
  const num = (v: unknown): string => (typeof v === 'number' ? (Object.is(v, -0) ? '-0' : v.toString()) : JSON.stringify(v));
  const h = createHash('sha256');
  for (const k of keys) {
    h.update(num(k.at) + '|' + (k.ease ?? '') + '|');
    for (const f of Object.keys(k.pose).sort()) h.update(f + '=' + num((k.pose as Record<string, unknown>)[f]) + ';');
    h.update('\n');
  }
  return h.digest('hex').slice(0, 16);
}

/** The hashes the code made before this change (smooth-loading-frames 713b3058). */
const BEFORE = { tinkerHold: '4700dea40f92c588', tinkerFall: 'de75064d988f43b0', brawlerReel: '1b88734f04368750', brawlerLurch: 'd8c1d90f20c38d3e' };

// (first: her art set up, before anything here has worked out her held move; the module keeps one for her art)
test('her art set up does not work out her held move or her fall; a picture of each painted does', () => {
  const art = makeTinkererArt();
  const set = art.front!;
  assert.ok(set.clips?.heavy, 'her tap and hold is in her set');
  assert.ok((set.clips?.heavy?.frames.length ?? 0) > 30, 'its frames listed (how long the move is), none painted');
  assert.equal(tinkererAhead().length, 2, 'her held move and her fall still to be worked out after her art is set up');
  const s = set.clips!.heavy!.frames[20];
  assert.ok(s && s.w > 0, 'a picture of the move painted');
  assert.equal(tinkererAhead().length, 1, 'her held move worked out as it was first painted: her fall left to do ahead');
  const f = set.clips!.fall!.frames[10];
  assert.ok(f && f.w > 0, 'a picture of her fall painted');
  assert.equal(tinkererAhead().length, 0, 'nothing left to do ahead');
});

test('her keys are the very numbers they were, read at once', () => {
  const m = tinkerHold();
  assert.equal(keysWorkedOut(m), false, 'not worked out until read');
  const keys = m.motion.keys;
  assert.equal(keysWorkedOut(m), true);
  assert.equal(hash(keys), BEFORE.tinkerHold);
  assert.equal(m.motion.keys, keys, 'worked out once: the same list read again');
});

test('made a slice a step, the same numbers; some 380 steps; nothing more to do after', () => {
  const m = tinkerHold();
  const steps = keysAhead(m);
  assert.equal(steps.length, 1, 'one step, giving back the next');
  const n = runAll(steps);
  assert.ok(n >= 350 && n <= 420, `in slices: ${n} steps`);
  assert.equal(keysWorkedOut(m), true);
  assert.equal(keysAhead(m).length, 0, 'nothing more to do ahead');
  assert.equal(hash(m.motion.keys), BEFORE.tinkerHold);
  assert.deepEqual(m.motion.keys, tinkerHold().motion.keys, 'the same keys as worked out at once');
});

test('her fall: the same numbers, read at once or made a slice a step', () => {
  const a = tinkerFall();
  assert.equal(keysWorkedOut(a), false, 'not worked out until read');
  assert.equal(hash(a.motion.keys), BEFORE.tinkerFall);
  const b = tinkerFall();
  const n = runAll(keysAhead(b));
  assert.ok(n > 10, `in slices: ${n} steps`);
  assert.equal(keysWorkedOut(b), true);
  assert.equal(hash(b.motion.keys), BEFORE.tinkerFall);
});

test("the Brawler's moves steadied by the same code are the same", () => {
  assert.equal(hash(brawlerReel().motion.keys), BEFORE.brawlerReel);
  assert.equal(hash(brawlerLurch().motion.keys), BEFORE.brawlerLurch);
});
