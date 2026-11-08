// THE SOUND CHAT'S SECOND BATCH WIRED IN (game/sound_families.ts, engine/audio.ts sfxNamed and RECORDED_SFX): his word, 7 Nov 2026,
// 09:34, “all good”. Every name the game plays has its two takes in assets/sound; an enemy cries out as it first notices him
// and dies with its own voice; a boss who roars, his own roar as his fight begins.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import fs from 'node:fs';
import { RECORDED_SFX } from '../src/engine/audio';
import { MONSTERS } from '../src/game/defs';
import { Game } from '../src/game/game';
import { ACT_SOUND, ATK, BOSS_VOICE, VOICE, soundsOf } from '../src/game/sound_families';
import type { GameEvent, Monster } from '../src/game/state';
import type { MonsterKind } from '../src/game/types';

const has = (f: string): boolean => fs.existsSync(`assets/sound/${f}`);

test('every sound the game plays by name has both its takes in assets/sound', () => {
  const kinds = Object.keys(MONSTERS) as MonsterKind[];
  for (const k of kinds) assert.ok(MONSTERS[k], k);
  for (const k of [...Object.keys(ATK), ...Object.keys(VOICE), ...Object.keys(BOSS_VOICE)]) assert.ok(kinds.includes(k as MonsterKind), `${k} is an enemy of the game`);
  const names = soundsOf(kinds);
  for (const n of Object.values(ACT_SOUND)) assert.ok(names.includes(n), `${n} fetched with its floor`);
  for (const n of names) for (const t of [1, 2]) assert.ok(has(`${n}_${t}.mp3`), `${n}_${t}.mp3`);
  for (const [name, takes] of Object.entries(RECORDED_SFX)) for (const t of takes ?? []) assert.ok(has(`${t}.mp3`), `${name}: ${t}.mp3`);
  assert.ok(names.length > 60, `${names.length} names`);
});

type Inside = { spawn(kind: string, x: number, y: number, n: number, rank: number, boss: boolean, rng: unknown): Monster; wakeUp(m: Monster): void; kill(m: Monster): void; rng: unknown; waveT: number };

test('a skeleton cries out as it first notices him and dies with its own voice; a boss who roars, his roar', () => {
  const g = Game.forPractice('warrior', 3);
  const a = g as unknown as Inside;
  a.waveT = 1e9;
  g.monsters.length = 0;
  const m = a.spawn('skeleton', g.hero.x + 4, g.hero.y, 1, 0, false, a.rng);
  m.state = 'sleep';
  g.events.length = 0;
  a.wakeUp(m);
  const recs = (): string[] => g.events.filter((e: GameEvent) => e.t === 'rec').map((e) => (e as { name: string }).name);
  assert.ok(recs().includes('bones_aggro'), 'its cry');
  g.events.length = 0;
  m.life = 0;
  a.kill(m);
  assert.ok(recs().includes('bones_death'), 'its death');
  assert.ok(!g.events.some((e) => e.t === 'sfx' && e.name === 'monsterDie'), 'in place of monsterDie');
  const b = a.spawn('stag', g.hero.x + 6, g.hero.y, 1, 0, true, a.rng);
  b.state = 'sleep';
  g.events.length = 0;
  a.wakeUp(b);
  assert.ok(recs().includes('stag_roar'), 'his roar');
});
