// LESS REPETITION (the sound chat's fourteenth batch, 14 Nov 2026: assets/sound/README.md, "Fourteenth batch"; his words, 17:38
// Eastern, “there is a lot of repetition in the audio”; his picks “About a minute each (Recommended)”, “Hero grunting when hit
// (Recommended), Hero attack shouts, Enemies' grunts” and “Rarer, and more takes (Recommended)”; heard on try-out 19, “All good,
// hand over (Recommended)”). Held here (the music a minute round: tests/level_music.test.ts):
//   1. every voice family of game/sound_families.ts VOICE has four takes of its aggro, hurt and death, and all 276 are in the game's
//      files, packed with the enemies' voices; the rest keep their two (the breeze its three);
//   2. each hero has his new shout and grunt, two takes each, packed with his voice;
//   3. the hero's shout and grunt one time in three (VOICE_TUNE.keep); the enemies' grunt and death by a count (ENEMY_KEEP);
//   4. a family's deaths: the 1st, 4th, 7th … cry out, the others die with the plain sound; a champion always cries;
//   5. a family's grunts: the 1st, 4th, 7th … of those that would be heard.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import fs from 'node:fs';
import { FOUR_TAKE_FAMILIES, VOICE_TUNE, takesOf } from '../src/engine/audio';
import { Game } from '../src/game/game';
import { ENEMY_GAPS, ENEMY_KEEP, VOICE } from '../src/game/sound_families';
import type { GameEvent, Monster } from '../src/game/state';
// @ts-ignore - a tool of the build, plain JavaScript
import { packOf } from '../tools/sound_packs.mjs';

const has = (f: string): boolean => fs.existsSync(`assets/sound/${f}`);
const HEROES = ['warrior', 'ranger', 'mage', 'warlock', 'tinkerer', 'brawler'];

test('1. every voice family has four takes of its aggro, hurt and death, in the files, packed with the enemies\' voices', () => {
  const families = [...new Set(Object.values(VOICE))].sort();
  assert.deepEqual([...FOUR_TAKE_FAMILIES].sort(), families, 'the same families as VOICE');
  assert.equal(families.length, 23);
  let n = 0;
  for (const f of families) {
    for (const k of ['aggro', 'hurt', 'death']) {
      assert.equal(takesOf(`${f}_${k}`), 4, `${f}_${k}`);
      for (let t = 1; t <= 4; t++) {
        assert.ok(has(`${f}_${k}_${t}.mp3`), `${f}_${k}_${t}.mp3`);
        n++;
      }
      assert.equal(packOf(`${f}_${k}`), 'enemy-voices');
    }
  }
  assert.equal(n, 276);
  assert.equal(takesOf('swing'), 2, 'the rest keep their two');
  assert.equal(takesOf('chained_roar'), 2);
  assert.equal(takesOf('breeze'), 3, 'the breeze its three');
});

test('2. each hero has his new shout and grunt, two takes each, packed with his voice', () => {
  for (const h of HEROES) {
    for (const t of ['attack_c_1', 'attack_c_2', 'hurt_c_1', 'hurt_c_2']) assert.ok(has(`${h}_${t}.mp3`), `${h}_${t}`);
    assert.equal(packOf(`${h}_attack_c`), `voice-${h}`);
    assert.equal(packOf(`${h}_hurt_c`), `voice-${h}`);
  }
  const src = fs.readFileSync('src/engine/audio.ts', 'utf8');
  assert.ok(src.includes("attack: ['attack_a_1', 'attack_a_2', 'attack_b_1', 'attack_b_2', 'attack_c_1', 'attack_c_2']"), 'six shouts');
  assert.ok(src.includes("grunt: ['hurt_a_1', 'hurt_a_2', 'hurt_c_1', 'hurt_c_2']"), 'four grunts');
  assert.ok(/takes\.length >= 3 && ready\.length >= 2 && prev \? ready\.filter\(\(b\) => b !== prev\)/.test(src), 'no take twice in a row where there are three or more');
});

test('3. the hero\'s shout and grunt one time in three; the enemies\' grunt and death by a count of three', () => {
  assert.equal(VOICE_TUNE.keep, 3);
  assert.deepEqual({ ...ENEMY_KEEP }, { hurt: 3, death: 3 });
  // (the rates before it are as they were: tests/recorded_sounds.test.ts)
  assert.equal(VOICE_TUNE.attackOne, 42);
  assert.ok(Math.abs(VOICE_TUNE.gruntGap - 2.1) < 1e-9);
});

type Inside = { spawn(kind: string, x: number, y: number, n: number, rank: number, boss: boolean, rng: unknown): Monster; kill(m: Monster): void; rng: unknown; waveT: number; time: number };

function practice(): { g: Game; a: Inside; recs: () => string[]; plain: () => number } {
  const g = Game.forPractice('warrior', 3);
  const a = g as unknown as Inside;
  a.waveT = 1e9;
  g.monsters.length = 0;
  const recs = (): string[] => g.events.filter((e: GameEvent) => e.t === 'rec').map((e) => (e as { name: string }).name);
  const plain = (): number => g.events.filter((e: GameEvent) => e.t === 'sfx' && (e as { name: string }).name === 'monsterDie').length;
  return { g, a, recs, plain };
}

test('4. a family\'s deaths: the 1st, 4th, 7th … cry out, the others die with the plain sound; a champion always cries', () => {
  const { g, a, recs, plain } = practice();
  const heard: boolean[] = [];
  for (let i = 0; i < 7; i++) {
    const m = a.spawn('wolf', g.hero.x + 4, g.hero.y, 1, 0, false, a.rng);
    g.events.length = 0;
    m.life = 0;
    a.kill(m);
    const cried = recs().includes('wolf_death');
    heard.push(cried);
    assert.equal(plain(), cried ? 0 : 1, `death ${i + 1}: the plain sound where it does not cry`);
  }
  assert.deepEqual(heard, [true, false, false, true, false, false, true]);
  // (another family counts its own)
  const r = a.spawn('rat', g.hero.x + 4, g.hero.y, 1, 0, false, a.rng);
  g.events.length = 0;
  r.life = 0;
  a.kill(r);
  assert.ok(recs().includes('rat_death'), "the rats' first");
  // (a champion always cries)
  for (let i = 0; i < 2; i++) {
    const c = a.spawn('wolf', g.hero.x + 4, g.hero.y, 1, 0, false, a.rng);
    c.champion = true;
    g.events.length = 0;
    c.life = 0;
    a.kill(c);
    assert.ok(recs().includes('wolf_death'), `champion ${i + 1}`);
  }
});

test('5. a family\'s grunts: the 1st, 4th, 7th … of those that would be heard', () => {
  const { g, a, recs } = practice();
  const m = a.spawn('wolf', g.hero.x + 4, g.hero.y, 1, 0, false, a.rng);
  m.maxLife = m.life = 1e9;
  const heard: boolean[] = [];
  for (let i = 0; i < 7; i++) {
    a.time += ENEMY_GAPS.hurt + 0.1;
    g.events.length = 0;
    // (a critical: a grunt that would be heard)
    g.damageMonster(m, 1, 'phys' as never, true, -1);
    heard.push(recs().includes('wolf_hurt'));
  }
  assert.deepEqual(heard, [true, false, false, true, false, false, true]);
});
