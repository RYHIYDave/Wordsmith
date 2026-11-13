// A UNIQUE DROPPED (src/render/unique_fx.ts drawBeams and its ring in drawGround; behind UNIQUE_PLAY.drop, off):
//   1. its switch is off, and with it off nothing is drawn for a unique lying on the floor;
//   2. on: any unique lying on the floor (rarity 3, the pool's or a boss's own alike) stands in a beam of the uniques' orange and
//      white, its ring running out as it lands; nothing for an ordinary piece, nor for one on a part of the floor not yet seen.
//   run: node tools/unit.mjs --only unique_play3_drop

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { RARITY_COLOR } from '../src/art/palette';
import { UniqueFx } from '../src/render/unique_fx';
import { UNIQUE_PLAY } from '../src/render/unique_play';
import type { Game } from '../src/game/game';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

/** What is drawn, over everything and on the floor, for drops of these rarities at these ages: its colours and how many marks. */
function draw(drops: { rarity: number; age: number; seen?: boolean }[]): { colours: Set<string>; n: number } {
  const colours = new Set<string>();
  let n = 0;
  const g = {
    globalAlpha: 1,
    fillStyle: '#000000',
    globalCompositeOperation: 'source-over',
    fillRect(): void {
      if (this.globalAlpha <= 0) return;
      colours.add(String(this.fillStyle).toLowerCase());
      n++;
    },
    drawImage(): void {},
  };
  const explored = new Uint8Array(100).fill(0);
  drops.forEach((d, i) => void (explored[2 * 10 + 2 + i] = d.seen === false ? 0 : 1));
  const u = new UniqueFx();
  u.game = {
    level: { floor: { w: 10 }, explored },
    drops: drops.map((d, i) => ({ kind: 'item', x: 2 + i + 0.5, y: 2.5, gold: 0, word: null, age: d.age, item: { rarity: d.rarity, unique: d.rarity === 3 ? 'fan' : undefined } })),
    monsters: [],
    volleys: [],
    risen: null,
    projectiles: [],
    hero: { x: 0, y: 0 },
  } as unknown as Game;
  const cam = { ox: 100, oy: 100 } as never;
  u.drawGround(g as unknown as CanvasRenderingContext2D, cam);
  u.drawAir(g as unknown as CanvasRenderingContext2D, cam);
  return { colours, n };
}

test('1. its switch is on; with it off nothing is drawn for a unique on the floor', () => {
  assert.equal(UNIQUE_PLAY.drop, true, 'on: his yes, 12 Nov 2026');
  UNIQUE_PLAY.drop = false;
  try {
    assert.equal(draw([{ rarity: 3, age: 1 }]).n, 0);
  } finally {
    UNIQUE_PLAY.drop = true;
  }
});

test("2. on: a unique stands in the uniques' orange and white; an ordinary piece, or one not yet seen, in nothing", () => {
  UNIQUE_PLAY.drop = true;
  try {
    for (const age of [0.05, 0.2, 1, 5]) {
      const d = draw([{ rarity: 3, age }]);
      assert.ok(d.n > 20, `age ${age}: its beam there`);
      for (const c of d.colours) assert.ok(c === RARITY_COLOR[3] || c === '#ffffff', `age ${age}: ${c} is the uniques' orange or white`);
    }
    const landing = draw([{ rarity: 3, age: 0.05 }]);
    const lying = draw([{ rarity: 3, age: 2 }]);
    assert.ok(landing.colours.has('#ffffff') && landing.n !== lying.n, 'as it lands: white, and its ring');
    assert.equal(draw([{ rarity: 2, age: 1 }]).n, 0, 'a rare: nothing');
    assert.equal(draw([{ rarity: 3, age: 1, seen: false }]).n, 0, 'not yet seen: nothing');
  } finally {
    UNIQUE_PLAY.drop = true;
  }
});
