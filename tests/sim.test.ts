// Headless smoke test of the game rules: a crude bot plays each class through dungeons.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { botStep, newBot } from '../src/dev/bot';
import { SKILLS, skillsFor } from '../src/game/defs';
import { Game } from '../src/game/game';
import { seasoned } from './helpers';
import { emptyControls } from '../src/game/state';
import { CLASS_IDS, WEAPONS, WORD_IDS } from '../src/game/types';
import type { ClassId } from '../src/game/types';

/** Play up to `seconds` of game time. */
function botRun(cls: ClassId, seed: number, seconds: number, god = false) {
  const g = new Game(cls, seed);
  const c = emptyControls();
  const bot = newBot(true);
  const dt = 1 / 30;
  let maxMonsters = 0;
  const firstClear: number[] = [];
  let t = 0;
  for (; t < seconds; t += dt) {
    if (god) g.hero.life = g.hero.d.maxLife;
    botStep(g, c, bot, dt);
    const before = g.cleared;
    g.update(dt, c);
    if (g.cleared > before) firstClear.push(Math.round(g.runTime));
    maxMonsters = Math.max(maxMonsters, g.monsters.length);
    g.events.length = 0;
    const h = g.hero;
    for (const v of [h.x, h.y, h.life, h.mana, h.d.dmgMin, h.d.dmgMax]) assert.ok(Number.isFinite(v), 'hero state is finite');
    if (g.over) break;
  }
  return { g, maxMonsters, firstClear, t };
}

for (const cls of CLASS_IDS) {
  test(`bot plays a ${cls} without errors`, () => {
    const r = botRun(cls, 1234, 900);
    const h = r.g.hero;
    assert.ok(r.maxMonsters > 30, 'the dungeon was populated');
    assert.ok(r.g.kills > 10, 'the bot killed things');
    // A bot that can die may die anywhere, and the fallen wordsmith lies half way through the
    // first dungeon. Until Version 11 all three happened to live that long on this seed. With
    // the wind-up the fights go differently, and the warrior now dies at 73 s, a few rooms short
    // of the body (the line printed below says so). So the rule is stated as it is: the only way
    // not to have found the body is to have died in the first dungeon before reaching it. That
    // the bot's way always leads to the body is checked with the bot that cannot die, below.
    assert.ok(r.g.bodySearched || (r.g.over && r.g.cleared === 0), 'and found the fallen wordsmith of its first dungeon, if it lived to reach it');
    console.log(`${cls}: died=${r.g.over} at ${Math.round(r.t)}s, level ${h.level}, kills ${r.g.kills}, dungeon ${r.g.depth}, cleared ${r.g.cleared} (run time at each clear: ${r.firstClear.join(', ')}), gold ${h.gold}, skills: ${h.skills.map((s) => s.r.name).join(' | ')}`);
  });
}

test('every word can go in front and behind every word-taking ability, and come out again', () => {
  for (const cls of CLASS_IDS) {
    // (THE FIRST LEVELS, since Version 19.5: a slot behind opens at level 7, once the wordsmith's ring is lit)
    const g = seasoned(new Game(cls, 7), 10);
    for (const w of WORD_IDS) g.hero.words[w] = 1;
    for (const s of [0, 1]) {
      for (const w of WORD_IDS) {
        for (const side of ['front', 'behind'] as const) {
          assert.equal(g.socket(s, side, w), null);
          assert.ok(g.hero.skills[s].r.name.length > 0);
          assert.ok(g.hero.skills[s].r.lines.length >= 2);
          assert.equal(g.hero.words[w], 0, 'the word has left the pouch');
          assert.equal(g.unsocket(s, side, 0), null, 'and it can be taken out again');
          assert.equal(g.hero.words[w], 1);
        }
      }
    }
  }
});

test('an immortal bot clears dungeons with every class', () => {
  for (const cls of CLASS_IDS) {
    const r = botRun(cls, 99, 1500, true);
    assert.equal(r.g.over, false);
    assert.ok(r.g.cleared >= 1, `${cls} cleared a dungeon`);
    assert.ok(r.g.bodySearched, `${cls} found the fallen wordsmith of its first dungeon on the way`);
    console.log(`${cls} (immortal): level ${r.g.hero.level}, kills ${r.g.kills}, cleared ${r.g.cleared} (run time at each clear: ${r.firstClear.join(', ')}), skills: ${r.g.hero.skills.map((s) => s.r.name).join(' | ')}`);
  }
});

test("the owner's rule: the quick ability (tap / left button) is the one that waits less between uses, the slow one (hold / right button) the other: whatever the weapon", () => {
  // (Since Version 12 both attacks are the weapon's.)
  for (const cls of CLASS_IDS) {
    for (const weapon of [...WEAPONS, null]) {
      const [quick, slow] = skillsFor(cls, weapon);
      assert.ok(SKILLS[quick].cooldown < SKILLS[slow].cooldown, `${cls} with ${weapon ?? 'empty hands'}: ${quick} has a shorter base cooldown than ${slow}`);
      // (the familiar is the one quick attack that waits: the owner, "Give it a cooldown")
      if (quick === 'familiar') assert.ok(SKILLS[quick].cooldown > 0);
      else assert.equal(SKILLS[quick].cooldown, 0, `${quick} is as fast as the weapon swings`);
    }
  }
});
