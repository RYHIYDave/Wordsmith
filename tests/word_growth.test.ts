// WORDS GROW WITH THE LEVELS (game/defs.ts WORD_GROWTH, wordGrowth; since Version 23.7). His words to the main chat,
// 21 Oct 2026, 18:24 Pacific: “I’d like the drops of words to increase with each level as well” and “I don’t think the
// player is getting enough words to experiment with the melding system”; his picks: “10% each level, up to triple” and
// “All of them (Recommended)” (monsters carrying words, chests and vaults; the boss's extra word grows already).
//   1. the switch is on, the numbers his: 10% likelier each level past the first, held at triple; off, as before;
//   2. on floor 13, its elites and guardians 2.2 times as likely to carry a word as with it off; on floor 2, 1.1 times;
//   3. an ordinary monster's rare word, a chest's and the Bells' explosion's chances, each times the growth.
//   run: tsx --test tests/word_growth.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import * as fs from 'node:fs';
import { RNG } from '../src/engine/rng';
import { TUNE, WORD_GROWTH, wordGrowth } from '../src/game/defs';
import { Game } from '../src/game/game';
import { seasoned } from './helpers';

const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b}`);

function growing<T>(on: boolean, fn: () => T): T {
  const was = WORD_GROWTH.on;
  WORD_GROWTH.on = on;
  try {
    return fn();
  } finally {
    WORD_GROWTH.on = was;
  }
}

/** Dungeon `depth` of a character who has been down before (the ring lit: words fall). */
function dungeon(seed: number, depth: number): Game {
  const g = seasoned(new Game('warrior', seed), 1);
  g.depth = depth;
  g.cleared = depth;
  g.enterDungeon();
  return g;
}

test('1. the switch is on, the numbers his: 10% likelier each level past the first, held at triple', () => {
  assert.equal(WORD_GROWTH.on, true);
  assert.equal(WORD_GROWTH.each, 0.1);
  assert.equal(WORD_GROWTH.most, 3);
  near(wordGrowth(1), 1, 1e-9, 'the first floor as it was');
  near(wordGrowth(6), 1.5, 1e-9, 'floor 6, where melding opens');
  near(wordGrowth(15), 2.4, 1e-9, 'floor 15');
  near(wordGrowth(21), 3, 1e-9, 'Endless 6 (power 21)');
  near(wordGrowth(40), 3, 1e-9, 'held at triple');
  growing(false, () => near(wordGrowth(15), 1, 1e-9, 'off'));
});

test('2. on floor 13, its elites and guardians 2.2 times as likely to carry a word as with it off; on floor 2, 1.1 times', () => {
  // (every chance the floor's making asks of its dice, written down: an elite's is its carry times the growth)
  const asked = (on: boolean, depth: number): number[] =>
    growing(on, () => {
      const out: number[] = [];
      const chance = RNG.prototype.chance;
      RNG.prototype.chance = function (this: RNG, p: number): boolean {
        out.push(p);
        return chance.call(this, p);
      };
      try {
        for (let seed = 1; seed <= 4; seed++) dungeon(seed, depth);
      } finally {
        RNG.prototype.chance = chance;
      }
      return out;
    });
  const has = (list: number[], p: number): boolean => list.some((q) => Math.abs(q - p) < 1e-12);
  const on13 = asked(true, 13);
  const off13 = asked(false, 13);
  assert.ok(has(on13, TUNE.eliteCarry * 2.2), 'an elite on floor 13, grown');
  assert.ok(!has(on13, TUNE.eliteCarry), 'and never as it was');
  assert.ok(has(off13, TUNE.eliteCarry) && !has(off13, TUNE.eliteCarry * 2.2), 'off, as it was');
  assert.ok(has(on13, TUNE.guardianCarry * 2.2) || !has(off13, TUNE.guardianCarry), 'a guardian on floor 13, grown (if one came)');
  const on2 = asked(true, 2);
  assert.ok(has(on2, TUNE.eliteCarry * 1.1), 'an elite on floor 2, 10% likelier');
});

test("3. an ordinary monster's rare word, a chest's and the Bells' explosion's chances are each times the growth", () => {
  const g = dungeon(5, 13);
  const asked: number[] = [];
  const chance = g.rng.chance.bind(g.rng);
  g.rng.chance = (p: number): boolean => {
    asked.push(p);
    return chance(p);
  };
  // (an ordinary monster killed: among the chances its loot asks, its rare word's, grown)
  const m = g.monsters.find((o) => !o.boss && !o.elite && !o.champion && !o.carries?.length && !o.words.length);
  assert.ok(m, 'an ordinary monster');
  g.kill(m!);
  assert.ok(asked.some((p) => Math.abs(p - TUNE.dropWord * wordGrowth(13)) < 1e-12), `its word's chance grown: ${asked.join(', ')}`);
  // (the source holds the chest's and the Bells' the same way)
  const src: string = fs.readFileSync('src/game/game.ts', 'utf8');
  assert.ok(src.includes('(firstInVault ? TUNE.vaultWord : TUNE.chestWord) * wordGrowth(this.power)'), "a chest's, grown");
  assert.ok(src.includes('BELLS_TUNE.word * wordGrowth(this.power)'), "the Bells' explosion's, grown");
  assert.ok(src.includes('(champion ? TUNE.guardianCarry : TUNE.eliteCarry) * wordGrowth(P)'), "an elite's or a guardian's, grown");
});
