// THE CRIER'S HUSH IN PLAY (src/render/unique_fx.ts; its ring and name in render/render.ts; behind UNIQUE_PLAY.hush, off):
//   1. its switch is off, and with it off its moments show nothing of it;
//   2. on: as an enemy's words go dark, a ring of the Hush's grey (art/crier.ts HUSH) closes in on it and its dead air is puffed up;
//      as they come back, a ring and a spray in its word's own colour; nothing of a friend's cyan.
//   run: node tools/unit.mjs --only unique_play3_hush

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { HUSH } from '../src/art/crier';
import { WORD_COLOR } from '../src/art/icons';
import { UniqueFx } from '../src/render/unique_fx';
import { UNIQUE_PLAY } from '../src/render/unique_play';
import type { Game } from '../src/game/game';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

function moment(what: 'dark' | 'light'): { rings: { colors: readonly string[]; closing?: boolean }[]; sprays: (readonly string[])[] } {
  const rings: { colors: readonly string[]; closing?: boolean }[] = [];
  const sprays: (readonly string[])[] = [];
  const lent = { shake: 0, fallen: [], rings, spray: (_x: number, _y: number, _n: number, colors: readonly string[]): void => void sprays.push(colors) };
  const u = new UniqueFx();
  u.game = { monsters: [{ id: 7, kind: 'skeleton', x: 3, y: 3, words: what === 'light' ? ['fire'] : [], champion: false }] } as unknown as Game;
  u.handle({ t: 'unique', id: 'criershush', what, x: 3, y: 3, mid: 7 } as never, lent as never);
  return { rings, sprays };
}

test("1. the Crier's Hush's switch is on; its moments show nothing with it off", () => {
  assert.equal(UNIQUE_PLAY.hush, true, 'on: his yes, 12 Nov 2026');
  UNIQUE_PLAY.hush = false;
  try {
    const a = moment('dark');
    const b = moment('light');
    assert.equal(a.rings.length + a.sprays.length + b.rings.length + b.sprays.length, 0);
  } finally {
    UNIQUE_PLAY.hush = true;
  }
});

test('2. on: the Hush closes on it in its grey; its words come back in their own colour', () => {
  UNIQUE_PLAY.hush = true;
  try {
    const dark = moment('dark');
    assert.equal(dark.rings.length, 1);
    assert.ok(dark.rings[0].closing, 'the ring closes in on it');
    const grey = new Set<string>(HUSH);
    for (const c of [...dark.rings[0].colors, ...dark.sprays.flat()]) assert.ok(grey.has(c), `${c} is the Hush's grey`);
    const light = moment('light');
    assert.equal(light.rings.length, 1);
    assert.ok(light.rings[0].colors.includes(WORD_COLOR.fire), "its word's own colour");
    for (const c of [...light.rings[0].colors, ...light.sprays.flat()]) assert.ok(c === WORD_COLOR.fire || c === '#ffffff', `${c}: its word's colour or white`);
  } finally {
    UNIQUE_PLAY.hush = true;
  }
});
