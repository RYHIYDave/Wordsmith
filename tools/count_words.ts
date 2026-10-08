// What a dungeon holds at each depth (named monsters, guardians, vaults, chests) and how many words
// a full clear gives on average under the chances in TUNE.
//   tsx tools/count_words.ts
import { TUNE } from '../src/game/defs';
import { Game } from '../src/game/game';
import { CLASS_IDS } from '../src/game/types';
for (const depth of [1, 2, 3, 4, 5, 6, 8, 10]) {
  let n = 0, el = 0, elC = 0, gu = 0, guC = 0, vault = 0, other = 0, ord = 0, exp = 0, mx = 0, mn = 99, bossOwn = 0;
  for (const cls of CLASS_IDS) for (let seed = 1; seed <= 40; seed++) {
    const g = new Game(cls, seed * 13 + depth);
    g.depth = depth; g.cleared = depth; // (not a first dungeon)
    g.enterDungeon();
    const f = g.level.floor;
    const E = g.monsters.filter((m) => m.elite && !m.champion && !m.boss);
    const G = g.monsters.filter((m) => m.champion);
    const O = g.monsters.filter((m) => !m.elite && !m.boss);
    const chests = g.level.props.filter((p) => p.kind === 'chest');
    const vaults = f.rooms.filter((r) => r.kind === 'treasure' && chests.some((p) => p.tx >= r.x && p.ty >= r.y && p.tx < r.x + r.w && p.ty < r.y + r.h)).length;
    const carriers = g.monsters.filter((m) => !m.boss && m.carries.length).length;
    const e = g.boss!.carries.length + carriers + vaults * TUNE.vaultWord + (chests.length - vaults) * TUNE.chestWord + O.length * TUNE.dropWord;
    n++; el += E.length; elC += E.filter((m) => m.carries.length).length; gu += G.length; guC += G.filter((m) => m.carries.length).length;
    vault += vaults; other += chests.length - vaults; ord += O.length; exp += e; mx = Math.max(mx, e); mn = Math.min(mn, e); bossOwn += g.boss!.carries.length;
  }
  console.log(`depth ${depth}: elites ${(el / n).toFixed(1)} (carry ${(elC / el * 100).toFixed(0)}%), guardians ${(gu / n).toFixed(1)} (carry ${(guC / Math.max(1, gu) * 100).toFixed(0)}%), vaults ${(vault / n).toFixed(1)}, other chests ${(other / n).toFixed(1)}, ordinary ${(ord / n).toFixed(0)}, boss gives ${(bossOwn / n).toFixed(2)};  words to be had in a full clear: ${(exp / n).toFixed(2)} on average (${mn.toFixed(1)} to ${mx.toFixed(1)})`);
}
