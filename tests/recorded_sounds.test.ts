// THE RECORDED SOUNDS (engine/audio.ts; assets/sound/, the sound chat's): his “okay” to the combat sounds (6 Nov 2026, 22:21),
// “good” to the heroes' voices (22:34), “Throw it in for now” to the title theme (23:15); and the male/female voice gone, his
// words, 21:46: “we do want voices, im scrapping the male/female toggle and i want each character to have a unique sound to their voice”.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import fs from 'node:fs';
import { HERO_VOICE, RECORDED, RECORDED_SFX, TITLE, VOICE_TUNE } from '../src/engine/audio';
import { VOICE_TOGGLE } from '../src/ui/panels';

const has = (f: string): boolean => fs.existsSync(`assets/sound/${f}`);

test('every combat sound recorded has its two takes in the game\'s files: swing, hit, crit, slam, the monster\'s death, hurt', () => {
  // (and since 7 Nov 2026, the second batch's spells and skills: tests/sounds2.test.ts)
  for (const k of ['crit', 'hit', 'hurt', 'monsterDie', 'slam', 'swing']) assert.ok(Object.keys(RECORDED_SFX).includes(k), k);
  assert.ok(!('beamHum' in RECORDED_SFX), 'beamHum made in code: it is played at every bite of a beam');
  for (const takes of Object.values(RECORDED_SFX)) {
    assert.equal(takes!.length, 2);
    for (const t of takes!) assert.ok(has(`${t}.mp3`), t);
  }
  assert.equal(RECORDED.on, true);
});

test('every hero has his voice, all of it: attack cries, grunts, lines, his death; one voice each, men and women as given', () => {
  for (const who of ['warrior', 'ranger', 'mage', 'warlock', 'tinkerer', 'brawler']) {
    for (const t of ['attack_a_1', 'attack_a_2', 'attack_b_1', 'attack_b_2', 'hurt_a_1', 'hurt_a_2', 'hurt_b_1', 'hurt_b_2', 'death_1', 'death_2']) assert.ok(has(`${who}_${t}.mp3`), `${who}_${t}`);
  }
  assert.deepEqual(HERO_VOICE, { warrior: 'male', ranger: 'male', mage: 'female', warlock: 'male', tinkerer: 'female', brawler: 'male' });
  assert.equal(VOICE_TOGGLE.on, false, 'the male/female toggle gone');
  // (THE ATTACK SHOUTS A QUARTER AS OFTEN, his pick, 9 Nov 2026: at first one attack in 3.5, never within 1.2 s; both four times that)
  assert.equal(VOICE_TUNE.attackOne, 3.5 * 4, 'one attack in fourteen');
  assert.ok(Math.abs(VOICE_TUNE.attackGap - 1.2 * 4) < 1e-9, 'and never within 4.8 s of the last');
  assert.deepEqual([VOICE_TUNE.gruntGap, VOICE_TUNE.lineOne, VOICE_TUNE.lineGap], [0.7, 8, 25], 'the grunts and the hurt lines as they were');
});

test('the title theme: its file, and the stretch it goes round (68.25 s, 32 bars at 112.5 a minute)', () => {
  assert.ok(has(TITLE.file));
  assert.ok(Math.abs(TITLE.loop[1] - TITLE.loop[0] - 68.251) < 0.01);
});
