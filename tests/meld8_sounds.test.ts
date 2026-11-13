// THE EIGHT MELDS' SOUNDS (game/meld8_sounds.ts), the sound chat's twelfth batch. His word in the sound chat, shown them on
// try-out 17: “All good, hand over (Recommended)”.
//   1. every sound has both its takes in assets/sound, in a pack of its own;
//   2. each meld's moment its own sound: Sunder's blow on one sundered and Fervor's fifth their own; in front at 1, behind at 0.6;
//   3. sent by the rules as the moment is, through the world's bus; Siphon at most one each 0.5 s, Forking four a second; off, none.
//
//   run: tsx --test tests/meld8_sounds.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import { existsSync } from 'node:fs';
import { Game } from '../src/game/game';
import type { GameEvent } from '../src/game/state';
import { MELD8_SOUND, MELD8_SOUNDS, MELD8_SOUND_NAMES, meld8SoundOf, meld8SoundsOf } from '../src/game/meld8_sounds';
// @ts-ignore
import { packOf } from '../tools/sound_packs.mjs';

const EIGHT = ['siphon', 'cauterize', 'forking', 'shiver', 'sunder', 'fervor', 'rimeward', 'implode'];

test('every sound has both its takes in assets/sound, in the melds\' own pack', () => {
  assert.deepEqual(Object.keys(MELD8_SOUND).sort(), [...EIGHT].sort());
  assert.equal(MELD8_SOUND_NAMES.length, 10);
  for (const n of MELD8_SOUND_NAMES) {
    for (const t of [1, 2]) assert.ok(existsSync(`assets/sound/${n}_${t}.mp3`), `${n}_${t}.mp3`);
    assert.equal(packOf(n), 'melds', `${n} in the melds' pack`);
  }
  assert.deepEqual(meld8SoundsOf(['sunder']), ['meld_sunder', 'meld_sunder_hit']);
  assert.deepEqual(meld8SoundsOf(['fervor', 'eruption', 'toString']), ['meld_fervor', 'meld_fervor_flare']);
});

test('each moment its own sound; in front at 1, behind at 0.6; Sunder\'s blow and Fervor\'s fifth their own', () => {
  for (const id of EIGHT) {
    assert.deepEqual(meld8SoundOf({ id, k: 1 })?.name, `meld_${id}`);
    assert.equal(meld8SoundOf({ id, k: 1 })?.vol, 1);
    assert.equal(meld8SoundOf({ id, k: 0.5 })?.vol, 0.6);
  }
  assert.equal(meld8SoundOf({ id: 'sunder', what: 'hit' })?.name, 'meld_sunder_hit');
  assert.equal(meld8SoundOf({ id: 'sunder', what: 'hit' })?.vol, 1);
  assert.equal(meld8SoundOf({ id: 'fervor', n: 4, most: 5, k: 1 })?.name, 'meld_fervor');
  assert.equal(meld8SoundOf({ id: 'fervor', n: 5, most: 5, k: 1 })?.name, 'meld_fervor_flare');
  assert.equal(meld8SoundOf({ id: 'siphon' })?.gap, 0.5);
  assert.equal(meld8SoundOf({ id: 'forking' })?.gap, 0.25);
  assert.equal(meld8SoundOf({ id: 'eruption' }), null);
  assert.equal(meld8SoundOf({ id: 'toString' }), null, 'not fooled by a name every object has');
});

type Recs = Extract<GameEvent, { t: 'rec' }>;
const recs = (g: Game): Recs[] => g.events.filter((e): e is Recs => e.t === 'rec' && (e as Recs).name.startsWith('meld_'));

test('the rules send it with the moment, through the world\'s bus; Siphon one each 0.5 s, Forking four a second; off, none', () => {
  const g = Game.forPractice('warrior', 3);
  const a = g as unknown as { time: number };
  g.events.length = 0;
  g.emit({ t: 'meld8', id: 'siphon', on: 1, k: 1 } as GameEvent);
  g.emit({ t: 'meld8', id: 'siphon', on: 2, k: 1 } as GameEvent);
  assert.equal(recs(g).length, 1, 'two ticks at once: one Siphon');
  assert.equal(recs(g)[0].world, true, 'through the world\'s bus');
  assert.equal(recs(g)[0].vol, 1);
  a.time += 0.3;
  g.emit({ t: 'meld8', id: 'siphon', on: 1, k: 1 } as GameEvent);
  assert.equal(recs(g).length, 1, 'not again within 0.5 s');
  a.time += 0.25;
  g.emit({ t: 'meld8', id: 'siphon', on: 1, k: 0.5 } as GameEvent);
  assert.equal(recs(g).length, 2);
  assert.equal(recs(g)[1].vol, 0.6, 'behind, at 0.6');
  g.events.length = 0;
  for (let i = 0; i < 20; i++) {
    a.time += 0.05;
    g.emit({ t: 'meld8', id: 'forking', x: 0, y: 0, x1: 1, y1: 1, k: 1 } as GameEvent);
  }
  assert.ok(recs(g).length <= 4, `a second of Forking: ${recs(g).length}`);
  g.events.length = 0;
  MELD8_SOUNDS.on = false;
  try {
    a.time += 5;
    g.emit({ t: 'meld8', id: 'implode', x: 0, y: 0, k: 1 } as GameEvent);
    assert.equal(recs(g).length, 0, 'off: no sound');
  } finally {
    MELD8_SOUNDS.on = true;
  }
  assert.equal(MELD8_SOUNDS.on, true, 'on: his yes to them in the sound chat');
});
