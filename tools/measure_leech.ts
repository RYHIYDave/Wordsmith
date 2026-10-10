// A HERO OF A GIVEN LEVEL ON A GIVEN FLOOR, WITH A WORD SET OR NOT: what reaches him, what comes
// back to him, and how fast he kills (the owner, 10 Oct 2026, 18:07: "Warrior and ranger.  Warrior is
// basically unkillable once you get leech and the ranger does so much damage nothing even gets close
// to you").
//
//   tsx tools/measure_leech.ts [class = warrior] [level = 8] [floor = 5] [seeds = 4] [seconds = 240]
//
// The hero is made at that level, his points in his class's own attribute, and dressed in the best
// of 80 pieces the game rolls for that floor (one a place, the rarest and then the highest item
// level; his class's own weapon), then set down on the floor and played by the playtests' own
// player (src/dev/bot.ts) for that many seconds of the game, never dying (a death is counted and he
// is made whole). Each set-up is one line: the share of his life lost and won back each minute, of
// it what Leech gave, the hardest blow, deaths, and monsters killed a minute.
import { botStep, newBot } from '../src/dev/bot';
import { CLASSES, DEPTH_SCALE, LEECH } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Item } from '../src/game/state';
import type { ClassId, EquipSlot, WordId } from '../src/game/types';

declare const process: { argv: string[]; env: Record<string, string | undefined> };
const a = process.argv.slice(2);
const CLS = (a[0] ?? 'warrior') as ClassId;
const LEVEL = Number(a[1] ?? 8);
const FLOOR = Number(a[2] ?? 5);
const SEEDS = [4242, 77, 9001, 5, 123456, 31337, 808, 2718].slice(0, Number(a[3] ?? 4));
const SECS = Number(a[4] ?? 240);

// (LEECH_CAP=0.03: Leech gives back at most 3% of his life a second; DMG_SCALE / LIFE_SCALE: monsters
// grow by that share a floor; NOFLASK=1: no flasks, so that what keeps him alive is what he does)
if (process.env.LEECH_CAP) LEECH.cap = Number(process.env.LEECH_CAP);
if (process.env.DMG_SCALE) DEPTH_SCALE.dmg = Number(process.env.DMG_SCALE);
if (process.env.LIFE_SCALE) DEPTH_SCALE.life = Number(process.env.LIFE_SCALE);
const NOFLASK = !!process.env.NOFLASK;
const RANK: Record<string, number> = { normal: 0, magic: 1, rare: 2, unique: 3 };
type SetUp = { name: string; words: [number, 'front' | 'behind', WordId][] };
const SETUPS: Record<ClassId, SetUp[]> = {
  warrior: [
    { name: 'no word', words: [] },
    { name: 'Leech on Strike', words: [[0, 'front', 'leech']] },
    { name: 'Leech on Whirlwind', words: [[1, 'front', 'leech']] },
    { name: 'Leech on both', words: [[0, 'front', 'leech'], [1, 'front', 'leech']] },
  ],
  ranger: [
    { name: 'no word', words: [] },
    { name: 'Poison on Trap', words: [[2, 'front', 'poison']] },
    { name: 'Poison on Volley', words: [[1, 'front', 'poison']] },
    { name: 'Twin on Shot', words: [[0, 'front', 'twin']] },
  ],
  mage: [
    { name: 'no word', words: [] },
    { name: 'Flame on Wave', words: [[0, 'front', 'fire']] },
    { name: 'Leech on Wave', words: [[0, 'front', 'leech']] },
  ],
};

function dress(g: Game): void {
  const h = g.hero;
  const roll = (g as unknown as { rollGear: (q: number) => Item }).rollGear.bind(g);
  const best: Partial<Record<string, Item>> = {};
  const own = CLASSES[CLS].starts;
  for (let i = 0; i < 80; i++) {
    const it = roll(1);
    const slot = it.slot === 'ring' ? 'ring1' : it.slot;
    if (slot === 'mainhand' && it.weapon !== own) continue;
    if (slot === 'offhand') continue;
    const was = best[slot];
    if (!was || RANK[it.rarity] > RANK[was.rarity] || (RANK[it.rarity] === RANK[was.rarity] && it.ilvl > was.ilvl)) best[slot] = it;
  }
  for (const [slot, it] of Object.entries(best)) if (it) h.gear[slot as EquipSlot] = it;
  g.refresh();
}

function run(seed: number, s: SetUp): number[] {
  const g = new Game(CLS, seed);
  const h = g.hero;
  g.depth = FLOOR;
  g.cleared = FLOOR - 1;
  h.level = LEVEL;
  h.pending = 0;
  (h.attrs as Record<string, number>)[CLASSES[CLS].primary] += 5 * (LEVEL - 1);
  (h as unknown as { ring: boolean }).ring = true;
  g.enterDungeon();
  dress(g);
  for (const k of Object.keys(h.words)) (h.words as Record<string, number>)[k] = 0;
  for (const [i, side, w] of s.words) {
    h.words[w]++;
    g.socket(i, side, w);
  }
  g.refresh();
  h.life = h.d.maxLife;
  const c = emptyControls();
  const bot = newBot(false);
  const dt = 1 / 30;
  let lost = 0;
  let healed = 0;
  let leech = 0;
  let worst = 0;
  let deaths = 0;
  let kills = 0;
  for (let t = 0; t < SECS; t += dt) {
    if (NOFLASK) h.potions = 0;
    botStep(g, c, bot, dt);
    const before = h.life;
    const k0 = g.kills;
    g.update(dt, c);
    kills += Math.max(0, g.kills - k0);
    for (const e of g.events) {
      if (e.t === 'hit' && (e as { onHero?: boolean }).onHero) worst = Math.max(worst, (e as { amount: number }).amount / h.d.maxLife);
      if (e.t === 'leech') leech += (e as { n: number }).n / h.d.maxLife;
    }
    g.events.length = 0;
    const d = h.life - before;
    if (d < 0) lost += -d / h.d.maxLife;
    else healed += d / h.d.maxLife;
    if (h.life <= 0 || g.over) {
      deaths++;
      g.over = false;
      h.life = h.d.maxLife;
    }
    if (g.level.town || g.depth !== FLOOR) break;
  }
  const mins = SECS / 60;
  return [h.d.maxLife, h.d.armor, lost / mins, healed / mins, leech / mins, worst, deaths, kills / mins];
}

console.log(`${CLS.toUpperCase()}, level ${LEVEL}, floor ${FLOOR}, ${SEEDS.length} seeds, ${SECS} s each; Leech's ceiling ${LEECH.cap}; monsters +${DEPTH_SCALE.life} life, +${DEPTH_SCALE.dmg} damage a floor${NOFLASK ? '; no flasks' : ''}`);
console.log(`${'set-up'.padEnd(20)}   life  armor  lost/min  healed/min  (of it Leech)  worst hit  deaths  kills/min`);
// (FIRST=1: the first set-up alone, for a sweep over levels and floors)
for (const s of process.env.FIRST ? SETUPS[CLS].slice(0, 1) : SETUPS[CLS]) {
  const rs = SEEDS.map((seed) => run(seed, s));
  const m = (i: number): number => rs.reduce((x, r) => x + r[i], 0) / rs.length;
  console.log(`${s.name.padEnd(20)} ${m(0).toFixed(0).padStart(6)} ${m(1).toFixed(0).padStart(6)} ${m(2).toFixed(2).padStart(9)} ${m(3).toFixed(2).padStart(11)} ${m(4).toFixed(2).padStart(14)} ${(m(5) * 100).toFixed(1).padStart(9)}% ${m(6).toFixed(1).padStart(7)} ${m(7).toFixed(1).padStart(10)}`);
}
