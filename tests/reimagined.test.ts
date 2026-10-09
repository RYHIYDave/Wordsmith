// The heroes reimagined (src/art/reimagined.ts; the art chat, 9 Oct 2026): new outfits over the same
// bones and moves, as pictures for the owner, behind switches that are OFF until he has seen them
// and said yes. What is held here: the switches are off, and with them off the game's ranger is
// today's, frame for frame, byte for byte; and the ranger's new outfit (the Wind-runner,
// src/art/hero3_ranger2.ts), switched on, is painted in every one of his moves, cleanly.
//   run: tsx --test tests/reimagined.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { HERO_TAILS } from '../src/art/heroes';
import { paintMove3, windAt } from '../src/art/heroes3';
import { paintRanger3 } from '../src/art/hero3_ranger';
import { PINK, lightsOut } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { FLAME } from '../src/art/mkit';
import { MOVES3, runWaysOf, settlesOf, startsOf, walkingOf } from '../src/art/moves3';
import type { Move3 } from '../src/art/moves3';
import { RANGER2_TAILS, REIMAGINED } from '../src/art/reimagined';
import { CANVAS3 } from '../src/art/skin';
import type { GameView } from '../src/art/skin';
import { bonesAt, solve } from '../src/art/skeleton';
import type { Posed } from '../src/art/skeleton';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

const VIEWS: GameView[] = ['front', 'back'];
const endOf = (m: Move3): number => m.motion.keys[m.motion.keys.length - 1].at;

/** Every move of the ranger's: his own, and those made from them (coming to a stand, setting off, running the other ways, shooting and being rocked as he walks). */
const run = MOVES3.rrun;
const stand = MOVES3.rstand;
const HIS: [string, Move3][] = Object.entries(MOVES3).filter(([, m]) => m.held === 'bow');
const start = startsOf(run, stand);
const MADE: [string, Move3][] = [
  ...settlesOf(run, stand).map((m, k): [string, Move3] => [`coming to a stand ${k}`, m]),
  ...settlesOf(MOVES3.rtownrun, MOVES3.rtown).map((m, k): [string, Move3] => [`coming to a stand in town ${k}`, m]),
  ...(start ? [['setting off', start.move] as [string, Move3]] : []),
  ...runWaysOf(run).map((m, k): [string, Move3] => [`running the other way ${k}`, m]),
  ...walkingOf(MOVES3.shot, run).map((m, k): [string, Move3] => [`shot, walking ${k}`, m]),
  ...walkingOf(MOVES3.volley, run).map((m, k): [string, Move3] => [`volley, walking ${k}`, m]),
  ...walkingOf(MOVES3.rreel, run, false).map((m, k): [string, Move3] => [`rocked, walking ${k}`, m]),
  ...walkingOf(MOVES3.rlurch, run, false).map((m, k): [string, Move3] => [`thrown forward, walking ${k}`, m]),
];
const ALL: [string, Move3][] = [...HIS, ...MADE];
/** Moments of a move, `every` seconds apart, and its end. */
function moments(m: Move3, every: number): number[] {
  const out: number[] = [];
  for (let t = 0; t < endOf(m) - 1e-9; t += every) out.push(t);
  out.push(endOf(m));
  return out;
}

/** With the ranger's switch on for a while, and off again after, whatever happens. */
function wearing(fn: () => void): void {
  REIMAGINED.ranger = true;
  try {
    fn();
  } finally {
    REIMAGINED.ranger = false;
  }
}

/**
 * A frame of one of the ranger's moves as TODAY'S painter (src/art/hero3_ranger.ts) paints it,
 * called here directly with what art/heroes3.ts's paintMove3 hands a painter: the bones at that
 * moment (in a move that goes round, folded into its loop), the bones a thirtieth of a second
 * before, where the wind has got to, and the light going out of a hero who has fallen.
 */
function today(move: Move3, t: number, view: GameView): Painted {
  const end = endOf(move);
  const from = move.motion.loop;
  const long = from !== undefined ? end - from : 0;
  const fold = (when: number): number => (from !== undefined && long > 1e-6 && when >= end ? from + ((when - from) % long) : when);
  const now = fold(Math.max(0, t));
  const posed = (back: number): Posed => {
    let when = now - back;
    if (from !== undefined && long > 1e-6 && now >= from && when < from) when += long;
    return bonesAt(move.motion.keys, move.rest, Math.max(0, when));
  };
  const q = posed(0);
  const f = paintRanger3(solve(move.build, q), q, view, { build: move.build }, { prev: solve(move.build, posed(1 / 30)), wind: windAt(move, now) });
  return q.out > 0.01 ? lightsOut(f, q.out) : f;
}

/** How many pixels two paintings differ in. */
function unlike(a: Painted, b: Painted): number {
  let n = 0;
  for (let i = 0; i < a.px.d.length; i += 4) {
    if (a.px.d[i] !== b.px.d[i] || a.px.d[i + 1] !== b.px.d[i + 1] || a.px.d[i + 2] !== b.px.d[i + 2] || a.px.d[i + 3] !== b.px.d[i + 3]) n++;
  }
  return n;
}
const same = (a: Painted, b: Painted): boolean => a.px.w === b.px.w && a.px.h === b.px.h && unlike(a, b) === 0 && JSON.stringify(a.tails ?? []) === JSON.stringify(b.tails ?? []) && JSON.stringify(a.lights) === JSON.stringify(b.lights);

test('every switch is off: no hero wears a reimagined outfit in the game', () => {
  assert.equal(REIMAGINED.ranger, false);
  assert.equal(REIMAGINED.knight, false);
  assert.equal(REIMAGINED.mage, false);
});

test("with the switch off, every frame of the ranger is today's painter's own, byte for byte", () => {
  let frames = 0;
  for (const [name, m] of ALL) {
    for (const t of moments(m, 0.1)) {
      for (const view of VIEWS) {
        const game = paintMove3(m, t, view);
        const was = today(m, t, view);
        assert.ok(same(game, was), `${name}, ${t.toFixed(2)} s, ${view}: ${unlike(game, was)} pixels are not today's`);
        frames++;
      }
    }
  }
  assert.ok(frames > 300, `every move was looked at (${frames} frames)`);
});

test('with the switch on, the ranger is the Wind-runner: not today, with the tail of his hood and his feather; the knight and the mage are as they were', () => {
  const knight = paintMove3(MOVES3.rear, 0, 'front');
  const mage = paintMove3(MOVES3.mstand, 0, 'front');
  wearing(() => {
    for (const [name, m] of HIS) {
      for (const view of VIEWS) {
        const now = paintMove3(m, 0, view);
        const n = unlike(now, today(m, 0, view));
        assert.ok(n > 300, `${name}, ${view}: only ${n} pixels differ from today's`);
        assert.equal((now.tails ?? []).map((r) => r.id).sort().join(','), 'r2-feather,r2-liripipe', `${name}, ${view}: what flies from him`);
      }
    }
    assert.ok(same(paintMove3(MOVES3.rear, 0, 'front'), knight), 'the knight changed');
    assert.ok(same(paintMove3(MOVES3.mstand, 0, 'front'), mage), 'the mage changed');
  });
  // (and off again: today's)
  assert.ok(same(paintMove3(stand, 0, 'front'), today(stand, 0, 'front')));
});

test('switched on, every move of his is painted cleanly: the whole figure, what flies from him tied on him, and nothing of the enemy\'s pink or gold', () => {
  const enemy = new Set([...FLAME, ...PINK].map((c) => parseInt(c.slice(1), 16)));
  let frames = 0;
  wearing(() => {
    for (const [name, m] of ALL) {
      for (const t of moments(m, 1 / 15)) {
        for (const view of VIEWS) {
          const where = `${name}, ${t.toFixed(3)} s, ${view}`;
          const f = paintMove3(m, t, view);
          const d = f.px.d;
          let painted = 0;
          let pink = 0;
          for (let i = 0; i < d.length; i += 4) {
            if (d[i + 3] === 0) continue;
            painted++;
            if (enemy.has((d[i] << 16) | (d[i + 1] << 8) | d[i + 2])) pink++;
          }
          // (the whole of him: he has no long cloak, so a little less of him than today, never much less; measured, 0.73 at the least, in the tightest moment of the roll)
          const was = today(m, t, view).px.d;
          let then = 0;
          for (let i = 3; i < was.length; i += 4) if (was[i] > 0) then++;
          assert.ok(painted > 0.65 * then, `${where}: only ${painted} pixels of him, where today has ${then}`);
          assert.equal(pink, 0, `${where}: ${pink} pixels of the enemy's colours`);
          const roots = f.tails ?? [];
          assert.equal(roots.map((r) => r.id).sort().join(','), 'r2-feather,r2-liripipe', `${where}: what flies from him`);
          for (const r of roots) assert.ok(r.x >= 0 && r.y >= 0 && r.x <= CANVAS3.w && r.y <= CANVAS3.h && Number.isFinite(r.x + r.y), `${where}: ${r.id} is tied at ${r.x}, ${r.y}`);
          frames++;
        }
      }
    }
  });
  assert.ok(frames > 600, `every move was looked at (${frames} frames)`);
});

test('what flies from the Wind-runner is a tail the game knows how to move and draw: the tail of his hood is cloth, the feather a glowing quill', () => {
  for (const id of ['r2-liripipe', 'r2-feather']) assert.ok(HERO_TAILS[id] === RANGER2_TAILS[id], `${id} is one of the game's tails`);
  const tail = RANGER2_TAILS['r2-liripipe'];
  assert.ok(tail.rest === undefined && (tail.stiff ?? 0) === 0 && tail.glow === undefined, 'the tail of the hood is cloth, and does not glow');
  // (about half his height long: he is 57 picture pixels tall, two to a game pixel)
  const long = tail.n * tail.seg * 2;
  assert.ok(long > 0.45 * MOVES3.rstand.build.tall && long < 0.65 * MOVES3.rstand.build.tall, `the tail of the hood is ${long.toFixed(1)} picture pixels long`);
  const feather = RANGER2_TAILS['r2-feather'];
  assert.ok((feather.stiff ?? 0) > 0 && feather.rest?.length === feather.n && feather.glow !== undefined, 'the feather is a quill, with a shape, and glows');
});
