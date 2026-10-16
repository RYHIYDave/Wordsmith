// HAND_IN (src/game/defs.ts), behind its switch, off: quest items given by using the one they are
// for, not by walking past him. His word, 13 Oct 2026, 14:25 (to the planning chat): “I’d like the
// quest turn ins to be triggered by interacting with the npcs not just when you walk by.” These hold:
//   - with it off, walking up to the wordsmith with the master rune-stone gives it, as before;
//   - with it on, walking up gives nothing; his prompt says it is given; using him gives it, in
//     place of his panel; out of his reach, using does nothing to it; without it, using him opens
//     his panel as always.
//   run: tsx --test tests/hand_in.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { HAND_IN, TUNE } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { GameEvent } from '../src/game/state';

const DT = 1 / 30;

/** Run `fn` with HAND_IN on, and put it back off after, whatever happens. */
function handingIn<T>(fn: () => T): T {
  const was = HAND_IN.on;
  HAND_IN.on = true;
  try {
    return fn();
  } finally {
    HAND_IN.on = was;
  }
}

/** A new hero in town, the ring dark, carrying the master rune-stone, standing on the open floor `far` tiles (or as near as that as there is) from the wordsmith. */
function carrying(seed: number, far: number): Game {
  const g = new Game('warrior', seed);
  assert.ok(g.level.town, 'in town');
  const h = g.hero;
  h.ring = false;
  g.meta.ring = false;
  h.quest = 'heart';
  const s = g.level.stations.find((q) => q.kind === 'wordsmith');
  if (!s) throw new Error('the wordsmith is in town');
  const f = g.level.floor;
  let best = { x: h.x, y: h.y, d: Infinity };
  for (let ty = 0; ty < f.h; ty++) {
    for (let tx = 0; tx < f.w; tx++) {
      if (g.level.walk[ty * f.w + tx] !== 1) continue;
      const d = Math.abs(Math.hypot(tx + 0.5 - s.x, ty + 0.5 - s.y) - far);
      if (d < best.d) best = { x: tx + 0.5, y: ty + 0.5, d };
    }
  }
  h.x = best.x;
  h.y = best.y;
  g.events.length = 0;
  return g;
}

/** Step the game on for `secs`, the use button pressed in the first step if `use`; what happened. */
function step(g: Game, secs: number, use = false): GameEvent[] {
  const seen: GameEvent[] = [];
  for (let t = 0; t < secs; t += DT) {
    const c = emptyControls();
    c.interact = use && t === 0;
    g.update(DT, c);
    seen.push(...g.events);
    g.events.length = 0;
  }
  return seen;
}

test('with HAND_IN off, walking up to the wordsmith with the master rune-stone gives it, as before', () => {
  assert.equal(HAND_IN.on, false, 'off');
  const g = carrying(12, 1);
  step(g, 0.3);
  assert.equal(g.hero.quest, null, 'given');
  assert.equal(g.hero.ring, true, 'the ring is lit');
  assert.equal(g.handInNear(), null, 'nothing to hand in by using him');
});

test('with HAND_IN on, walking up gives nothing; using him gives it, in place of his panel', () => {
  handingIn(() => {
    const g = carrying(12, 1);
    const h = g.hero;
    step(g, 1);
    assert.equal(h.quest, 'heart', 'walked up to: still carried');
    assert.equal(h.ring, false, 'the ring still dark');
    assert.equal(g.stationNear(), 'wordsmith', 'beside him');
    assert.equal(g.handInNear(), 'stone');
    assert.equal(g.interactHint(), HAND_IN.prompt, 'his prompt says it is given');
    const seen = step(g, 0.2, true);
    assert.equal(h.quest, null, 'used: given');
    assert.equal(h.ring, true, 'the ring is lit');
    assert.ok(seen.some((e) => e.t === 'ring'), 'the ring powers up');
    assert.ok(!seen.some((e) => e.t === 'station'), 'his panel does not open');
    assert.equal(g.interactHint(), 'Wordsmith', 'his own prompt again');
    // used again, he opens his panel, as always
    const again = step(g, 0.1, true);
    assert.ok(again.some((e) => e.t === 'station' && e.kind === 'wordsmith'), 'his panel opens');
  });
});

test('with HAND_IN on, out of his reach, using does nothing to the stone', () => {
  handingIn(() => {
    const g = carrying(13, TUNE.useRange + 2);
    assert.equal(g.stationNear(), null, 'out of reach of every service');
    assert.equal(g.handInNear(), null);
    step(g, 0.2, true);
    assert.equal(g.hero.quest, 'heart', 'still carried');
    assert.equal(g.hero.ring, false);
  });
});

test('with HAND_IN on, a hero with nothing to give opens the wordsmith\'s panel by using him', () => {
  handingIn(() => {
    const g = carrying(14, 1);
    g.hero.quest = null;
    g.hero.ring = true;
    assert.equal(g.handInNear(), null);
    assert.equal(g.interactHint(), 'Wordsmith');
    const seen = step(g, 0.1, true);
    assert.ok(seen.some((e) => e.t === 'station' && e.kind === 'wordsmith'));
  });
});
