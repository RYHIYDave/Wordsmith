// WHAT GEAR A FLOOR GIVES, cleared: pieces a floor and the share plain / magic / rare, LOOT2 on against off (every monster
// on it killed where it stands, as tests/economy.test.ts counts it). tsx tools/count_loot.ts [dungeons=120]
import { LOOT2 } from '../src/game/defs';
import { Game } from '../src/game/game';
import type { Monster } from '../src/game/state';
import { CLASS_IDS } from '../src/game/types';
const N = Number((globalThis as unknown as { process: { argv: string[] } }).process.argv[2]) || 120;
for (const on of (process.env.ONLY === 'on' ? [true] : [false, true])) {
  LOOT2.on = on;
  const rows: string[] = [];
  for (const depth of (process.env.DEPTHS ? process.env.DEPTHS.split(',').map(Number) : [1, 3, 5, 6, 7, 8, 9, 10, 12])) {
    const c = [0, 0, 0];
    for (let k = 0; k < N; k++) {
      const g = new Game(CLASS_IDS[k % 3], 21 + k);
      g.depth = depth; g.cleared = depth; g.enterDungeon(); g.events.length = 0;
      g.drops.length = 0;
      for (const m of [...g.monsters]) (g as unknown as { kill: (m: Monster) => void }).kill(m);
      for (const d of g.drops) if (d.kind === 'item') c[Math.min(2, d.item!.rarity)]++;
    }
    const n = c[0] + c[1] + c[2];
    rows.push(`  floor ${depth}: ${(n / N).toFixed(1)} pieces a floor, ${c.map((v) => ((v / n) * 100).toFixed(1) + '%').join(' / ')}  (rare ${(c[2] / N).toFixed(2)} a floor)`);
  }
  console.log(`LOOT2 ${on ? 'on' : 'off'} (${N} floors each):`);
  console.log(rows.join('\n'));
}
