// THE SAME MOD TWICE (game/items.ts statGroup). His words, 4 Nov 2026, 19:13: “And I really hate seeing the same mod twice like
// cooldown reduction.  Seems to be the biggest culprit.” Max Mana and Mana Regen read as Cooldown Recovery under cooldowns.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { RNG } from '../src/engine/rng';
import { modLines, rollItem, statGroup } from '../src/game/items';
import type { StatMod } from '../src/game/types';

test('no piece rolls two of a group: no two lines read the same, under cooldowns or mana', () => {
  const rng = new RNG(4242);
  let n = 0;
  for (let k = 0; k < 6000; k++) {
    const it = rollItem(1 + (k % 30), rng, { atLeast: 2 });
    const groups = it.affixes.flatMap((a) => a.mods.map((m) => statGroup(m.stat))).filter((g) => g !== 'dmgMin' && g !== 'dmgMax');
    assert.equal(new Set(groups).size, groups.length, `${it.name}: ${groups.join(', ')}`);
    for (const limit of ['cooldown', 'mana'] as const) {
      const lines = modLines(it.affixes.flatMap((a) => a.mods), limit).map((l) => l.replace(/^[-+][\d.]+%? /, ''));
      assert.equal(new Set(lines).size, lines.length, `${it.name} (${limit}): ${lines.join(' / ')}`);
    }
    n++;
  }
  assert.ok(n === 6000);
});

test('a piece rolled before, with Max Mana and Mana Regen, shows one Cooldown Recovery line, their worth added', () => {
  const mods: StatMod[] = [{ stat: 'maxMana', value: 20 } as StatMod, { stat: 'manaRegen', value: 1 } as StatMod];
  const lines = modLines(mods, 'cooldown');
  assert.equal(lines.length, 1, lines.join(' / '));
  assert.match(lines[0], /^\+4\.0% Cooldown Recovery$/i);
  assert.equal(modLines(mods, 'mana').length, 2, 'under mana they are two things');
});
