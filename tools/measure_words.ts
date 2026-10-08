// Does a scarcer word economy make the game too hard, and how many words are left over? Bots play
// the same runs under the chances in TUNE ("new") and under the old plenty ("old": every named
// monster and guardian drops its word, every vault's first chest holds one).
//   tsx tools/measure_words.ts new|old [seeds=8] [seconds=1500]
// The bots slot words but never burn one into gear or a gate, so a person will have fewer spare.
import { botStep, newBot } from '../src/dev/bot';
import { TUNE } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import { CLASS_IDS, WORD_IDS } from '../src/game/types';

const mode = process.argv[2] || 'new';
const SEEDS = Number(process.argv[3]) || 8;
const SECONDS = Number(process.argv[4]) || 1500;
if (mode === 'old') Object.assign(TUNE, { eliteCarry: 1, guardianCarry: 1, vaultWord: 1, chestWord: 0.35, dropWord: 0.012 });
for (const cls of CLASS_IDS) {
  let deaths = 0; let cleared = 0; const deathAt: number[] = []; let words = 0; let spare = 0; const levels: number[] = [];
  const clearedBy: number[] = [];
  for (let k = 0; k < SEEDS; k++) {
    const g = new Game(cls, 2000 + k * 131);
    if (mode === 'old') g.hero.words[cls === 'mage' ? 'twin' : 'fire'] = 1; // (the second first word of the old version)
    const c = emptyControls(); const bot = newBot(true); const dt = 1 / 30;
    let t = 0;
    for (; t < SECONDS && !g.over; t += dt) { botStep(g, c, bot, dt); g.update(dt, c); g.events.length = 0; }
    if (g.over) { deaths++; deathAt.push(g.depth); }
    cleared += g.cleared; clearedBy.push(g.cleared);
    const h = g.hero;
    const slotted = h.skills.reduce((n, s) => n + s.front.filter(Boolean).length + s.behind.filter(Boolean).length, 0);
    const pouch = WORD_IDS.reduce((n, w) => n + h.words[w], 0);
    words += slotted + pouch; spare += pouch; levels.push(h.level);
  }
  console.log(`${mode} ${cls}: ${SEEDS} runs of ${SECONDS} s: died ${deaths} (in dungeons ${deathAt.join(',') || '-'}); dungeons cleared ${clearedBy.join(',')} (avg ${(cleared / SEEDS).toFixed(1)}); level at end avg ${(levels.reduce((a, b) => a + b, 0) / SEEDS).toFixed(1)}; words held at end avg ${(words / SEEDS).toFixed(1)}, of which spare ${(spare / SEEDS).toFixed(1)}`);
}
