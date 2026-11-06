// HER WORDS ON THE CONTRAPTION (game.ts throwContraption, updateTinkerer). His words, 4 Nov 2026, 19:01: “After taking the passive
// for contraption, I don’t think the words are working as intended.” Swift on her tap broke her Contraptions before they fired
// (none of its harm dealt at all), Frenzied most of them: now none is put out before its first shot, and both quicken its shots.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import type { WordId } from '../src/game/types';

const DT = 1 / 60;
type Inner = { waveT: number; rng: unknown; spawn: (...a: unknown[]) => Monster; wakeUp: (m: Monster) => void };

function dealt(pick: 'bombs' | 'energy', word: WordId | null): number {
  const g = Game.forPractice('tinkerer', 3);
  const a = g as unknown as Inner;
  a.waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  h.x = 14.5;
  h.y = 15.5;
  h.fx = 1;
  h.fy = 0;
  h.invuln = 1e9;
  h.talents = ['bombsaway', 'fortune', 'contraptions'];
  h.picks = { ...(h.picks ?? {}), contraptions: pick };
  h.skills[0].front = [null, null, null];
  h.skills[0].behind = [null, null, null];
  if (word) h.skills[0].front[0] = word;
  g.refresh();
  h.d.dmgMin = h.d.dmgMax = 100;
  h.d.critChance = 0;
  const ms = [[3, 0], [3.5, 1], [3.5, -1]].map(([dx, dy]) => {
    const m = a.spawn('skeleton', h.x + dx, h.y + dy, 1, 0, false, a.rng);
    a.wakeUp(m);
    m.speed = 0;
    m.cd = 1e9;
    m.life = m.maxLife = 1e7;
    m.seen = true;
    return m;
  });
  for (let t = 0; t < 8; t += DT) {
    const c = emptyControls();
    c.fire = true;
    c.aimX = h.x + 3;
    c.aimY = h.y;
    h.mana = h.d.maxMana;
    g.update(DT, c);
    g.events.length = 0;
  }
  return ms.reduce((t, m) => t + (m.maxLife - m.life), 0);
}

for (const pick of ['bombs', 'energy'] as const) {
  test(`${pick}: Swift and Frenzied on her tap make her Contraptions deal more, not nothing`, () => {
    const base = dealt(pick, null);
    assert.ok(base > 0, 'they fire');
    for (const w of ['swift', 'frenzied'] as WordId[]) {
      const v = dealt(pick, w);
      assert.ok(v > base, `${w}: ${Math.round(v)} against ${Math.round(base)} without it`);
    }
  });
}
