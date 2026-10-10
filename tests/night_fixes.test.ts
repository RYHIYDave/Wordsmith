// HIS NOTES OF 9 OCT 2026, 22:12, AFTER PLAYING VERSION 19.9: "Okay so bosses with leech are very hard
// to kill for warrior.  Almost impossible.  The quest is too in your face with all the text and reminder
// constantly at the top of the screen.  The wordsmith should give you the word after the altar powers
// up.  And mobs shouldn’t flash white when taking dot damage". These tests hold:
//   - LEECH on a monster heals what its blow takes from the hero ("What its blow takes (Recommended)"),
//     not 15% of its whole life a blow;
//   - harm over time (burning, fire or ice on the ground) does not flash a monster; a blow still does;
//   - the word the wordsmith gives comes once the ring has powered up; not lost if the hero leaves town
//     first, nor if the game is saved while he waits.
// (The quest's line for a few seconds, and the slots at 1 and 4 in front, 15 and 20 behind: tests/first_levels.test.ts.)
//   run: tsx --test tests/night_fixes.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { FIRST_LEVELS, FIRST_WORD, QUEST_ITEM } from '../src/game/defs';
import { Game, newMeta } from '../src/game/game';
import type { RunSave } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster, Zone } from '../src/game/state';
import type { Element, MonsterKind, WordId } from '../src/game/types';

const DT = 1 / 30;

interface Inside {
  rng: RNG;
  waveT: number;
  dungeonWords: WordId[];
  zones: Zone[];
  spawn(kind: MonsterKind, x: number, y: number, pack: number, rank: 0 | 1 | 2, boss: boolean, rng: RNG): Monster;
  wakeUp(m: Monster): void;
  hitMonster(m: Monster, i: number, frac: number, quiet: boolean): void;
  damageMonster(m: Monster, dmg: number, el: Element, crit: boolean, skill: number): void;
}

function room(): { g: Game; a: Inside } {
  const g = Game.forPractice('warrior', 5);
  const a = g as unknown as Inside;
  a.waveT = 1e9;
  g.monsters.length = 0;
  return { g, a };
}

function put(g: Game, a: Inside, kind: MonsterKind, dx: number, dy: number, boss = false): Monster {
  const m = a.spawn(kind, g.hero.x + dx, g.hero.y + dy, 1, 0, boss, a.rng);
  a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  return m;
}

test('a monster with Leech heals what its blow takes from the hero, not a share of its whole life', () => {
  const { g, a } = room();
  a.dungeonWords = ['leech'];
  const boss = put(g, a, 'brute', 1.5, 0, true);
  assert.ok(boss.words.includes('leech'));
  // (a boss's life, as a deep one has)
  boss.maxLife = 3000;
  boss.life = boss.maxLife / 2;
  const h = g.hero;
  h.invuln = 0;
  h.life = h.d.maxLife;
  const before = h.life;
  const was = boss.life;
  g.hurtHero(40, 'phys', boss.words, boss);
  const took = before - h.life;
  assert.ok(took > 0);
  assert.equal(boss.life - was, took, `it healed ${boss.life - was}, what it took (${took})`);
  assert.ok(boss.life - was < boss.maxLife * 0.15, 'far less than 15% of its life, as it was');
  // (and never past its whole life)
  boss.life = boss.maxLife - 1;
  h.life = h.d.maxLife;
  g.hurtHero(40, 'phys', boss.words, boss);
  assert.equal(boss.life, boss.maxLife);
});

test('burning and fire on the ground do not flash a monster; a blow does', () => {
  const { g, a } = room();
  const m = put(g, a, 'skeleton', 2, 0);
  m.life = m.maxLife = 1e6;
  // burning
  m.burnT = 3;
  m.burnDps = 50;
  m.flash = 0;
  let hurt = false;
  for (let t = 0; t < 1.2; t += DT) {
    const life = m.life;
    g.update(DT, emptyControls());
    if (m.life < life) hurt = true;
    assert.equal(m.flash, 0, 'no flash while it burns');
  }
  assert.ok(hurt, 'and it burned');
  // fire on the ground
  m.burnT = 0;
  a.zones.push({ x: m.x, y: m.y, r: 1.2, t: 0, dur: 3, kind: 'burn', element: 'fire', dmg: 40, slow: 0, tick: 0, hostile: false, skill: 0, words: [], from: '' });
  hurt = false;
  for (let t = 0; t < 1.2; t += DT) {
    const life = m.life;
    g.update(DT, emptyControls());
    if (m.life < life) hurt = true;
    assert.equal(m.flash, 0, 'no flash from the fire on the ground');
  }
  assert.ok(hurt, 'and the ground burned it');
  // a blow
  a.hitMonster(m, 0, 1, false);
  assert.ok(m.flash > 0, 'a blow flashes it, as ever');
});

/** A new player's first run, the stone found, in town beside the wordsmith. */
function atTheRing(): Game {
  const g = Game.forFirstRun('mage', 21, newMeta());
  const b = g.level.body!;
  g.hero.x = b.x + 0.4;
  g.hero.y = b.y;
  g.update(DT, emptyControls());
  assert.equal(g.hero.quest, 'heart');
  g.enterTown();
  const st = g.level.stations.find((s) => s.kind === 'wordsmith')!;
  g.hero.x = st.x + 0.5;
  g.hero.y = st.y + 0.5;
  g.update(DT, emptyControls());
  assert.equal(g.hero.ring, true, 'the ring is lit');
  return g;
}

test('the word comes once the ring has powered up', () => {
  assert.equal(FIRST_LEVELS.on, true);
  const g = atTheRing();
  const w = FIRST_WORD.mage.word;
  assert.equal(g.hero.words[w], 0, 'not yet');
  assert.ok(!g.events.some((e) => e.t === 'wordGot'));
  for (let t = 0; t < QUEST_ITEM.ringSecs - 0.3; t += DT) g.update(DT, emptyControls());
  assert.equal(g.hero.words[w], 0, 'not while it powers up');
  g.events.length = 0;
  for (let t = 0; t < 0.5; t += DT) g.update(DT, emptyControls());
  assert.equal(g.hero.words[w], 1, 'given');
  assert.equal(g.offer, w, 'and the inventory opens for it');
  assert.equal(QUEST_ITEM.ringSecs, 4.7, 'the ring powers up in 4.7 s (art/quest3.ts POWER.done)');
});

test('a hero who leaves town or is saved while the ring powers up does not lose the word', () => {
  const w = FIRST_WORD.mage.word;
  const g = atTheRing();
  const s = g.save() as RunSave;
  assert.equal(s.words[w], 1, 'a save while he waits holds the word');
  g.enterDungeon();
  assert.equal(g.hero.words[w], 1, 'leaving, the word is given at once');
});
