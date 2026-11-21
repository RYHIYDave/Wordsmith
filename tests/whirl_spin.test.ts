// THE WARRIOR'S WHIRL SHOWN AS ONE TURN OF HIS SPIN (render/figure.ts WHIRL_SPIN, spinOnce). Asked 14 Nov 2026, 20:09: “What is
// the warrior’s whirl attack?  Is it really just an overhead swing?” (it was: it had borrowed the Slam's picture); his pick: “One turn
// of the spin (Recommended)”. What is held here, on a figure of stand-in pictures (nothing painted):
//   1. off: the Whirl is shown as it was, the slow attack’s picture (the Slam); the switch is on in the game (his yes to its film);
//   2. on: the Whirl is the figure's whirlwind from its loop, gone round once: its first picture as it begins, the turn's halfway
//      picture as the rules land the blow, its last picture at its end, and held there;
//   3. on: nothing else changes: the slow attack's other skills, and a figure with no whirlwind, are as they were.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { ActorArt, AnimSet, Clip } from '../src/art/actor_types';
import type { Sprite } from '../src/engine/px';
import { SKILLS } from '../src/game/defs';
import { Figure, WHIRL_SPIN, spinOnce } from '../src/render/figure';

const pic = (name: string): Sprite => ({ w: 8, h: 8, ax: 4, ay: 7, name } as unknown as Sprite);
const pics = (name: string, n: number): Sprite[] => Array.from({ length: n }, (_, i) => pic(`${name}${i}`));

function stand(withWhirl = true): ActorArt {
  const heavy: Clip = { frames: pics('slam', 12), fps: 30, hit: 0.3 };
  const set: AnimSet = {
    idle: pics('idle', 2),
    walk: pics('walk', 4),
    attack: pics('strike', 3),
    heavy: pics('heavy', 3),
    clips: { heavy, ...(withWhirl ? { whirl: { frames: pics('whirl', 15), fps: 30, loop: 2 / 30, turns: true } } : {}) },
  } as AnimSet;
  return { front: set, back: set } as ActorArt;
}

function shown(art: ActorArt, age: number, move = 'whirl'): string {
  const w = SKILLS.whirl;
  const s = new Figure().frame(art, { anim: 'attack', animT: 0, fx: 1, fy: 0, attackSkill: 1, attackMove: move, attackAge: age, attackWind: w.windup, leapK: -1 }, 1 / 60, 0, 0, false);
  return (s as unknown as { name: string }).name;
}

function on<T>(run: () => T, yes = true): T {
  const was = WHIRL_SPIN.on;
  WHIRL_SPIN.on = yes;
  try {
    return run();
  } finally {
    WHIRL_SPIN.on = was;
  }
}

test('the switch is on in the game, at his yes to its film', () => {
  assert.equal(WHIRL_SPIN.on, true);
});

test('off: the Whirl is shown as the slow attack it borrowed (the Slam)', () =>
  on(() => {
    assert.match(shown(stand(), 0.01), /^slam/);
    assert.match(shown(stand(), SKILLS.whirl.windup), /^slam/);
  }, false));

test('on: one turn of his spin, from its loop round: begun, the blow halfway round as the rules land it, its end held', () =>
  on(() => {
    const art = stand();
    const once = spinOnce(art.front.clips!.whirl!);
    assert.equal(once.frames.length, 13, 'the turn from its loop round, its last picture the first again');
    assert.equal(once.hit, WHIRL_SPIN.hitAt);
    assert.equal(shown(art, 0), 'whirl2', 'begun where the turn begins');
    assert.equal(shown(art, SKILLS.whirl.windup), `whirl${2 + Math.round(WHIRL_SPIN.hitAt * 30)}`, 'the blow halfway round');
    assert.equal(shown(art, SKILLS.whirl.windup + SKILLS.whirl.follow), 'whirl14', 'round to its end by the time the rules are done');
    assert.equal(shown(art, 5), 'whirl14', 'and held there');
    // (the same clip made once, not again every frame)
    assert.equal(spinOnce(art.front.clips!.whirl!), once);
  }));

test('on: nothing else changes: another slow attack, and a figure with no whirlwind of its own', () =>
  on(() => {
    assert.match(shown(stand(), 0.2, 'slam'), /^slam/);
    assert.match(shown(stand(false), 0.2), /^slam/);
  }));
