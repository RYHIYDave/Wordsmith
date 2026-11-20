// THE GODOT PORT: floor 1's loot as the game itself makes it, for godot/scripts/loot.gd.
//   godot/assets/loot/items.json  pools of gear rolled by the game's own Game.rollGear on floor 1 for a new Warrior, one pool
//     for each quality a drop asks for (0 an ordinary monster's, 1 a leader's or a chest's, 2 a guardian's first, 4 a
//     boss's first: game.ts dropLoot), each piece with its name, slot, rarity, picture, its mods (items.ts itemMods) and
//     their lines (modLines), how many properties it was found with and which (what no word may give it again), its price
//     (itemValue) and its price with one, two, ... words burned into it; the Warrior's own starting greatsword; and the
//     numbers the hero's stats are made from (game/stats.ts derive, defs.ts TUNE, ATTR_GIVES).
//     WHAT A WORD BECOMES ON A PIECE (`imbue`; items.ts imbueOptions, imbueItem): for each of the sixteen words a Warrior can
//     come by on floors 1 to 10 (tools/godot_words.ts), each kind of piece and each level a piece here has: the one, two or
//     three things the word may become there, each with the range it is read out with (ui/inventory.ts rangeText) and
//     EVERY SIZE IT CAN ROLL, each made by the game's own imbueItem (its mods, its lines) with how likely it is. The game
//     picks one of those things evenly and rolls its size; loot.gd does the same from this table, less what the piece
//     already has (imbueOptionsFor), so a piece takes one word after another as in the game.
//     HOW WORDS ARE COME BY (`words`): which may be found on each floor and how much likelier the deeper (wordsAt,
//     wordGrowth), the Warrior's first, the order the game lists a hero's words in and each word's colour; and THE
//     ARMOURER'S QUEST'S OWN LINES (`quest`; game/quests15.ts QUEST_TEXT, game/quest_marks.ts).
//     WORDMELDING (the meld's port, 15 Nov 2026): THE WORDS MELDING MAKES too (game/melds.ts wordIds: the melded words and the
//     ranked ones), each on gear as the game has it as it starts (items.ts EVERY WORD ON GEAR, MELD_GEAR_STRENGTH, RANK_GEAR_STRENGTH,
//     MELD_LINE): a ranked word what its word becomes, half as strong again; a melded word one property of each of its two words in
//     the one place (its pairs, of which a piece is offered the first two its properties leave free: imbueOptionsFor), each rolled
//     on its own (`rolls` the first, `alsoRolls` the second), or, two of a kind, as one line at one number (MELD_LINE: `rolls` both).
//   godot/assets/loot/icons.png + icons.json  the pictures (art/icons.ts itemPic for each piece at its rarity; the gold piles,
//     the life orb, the potion, the words' rune stones, the made words' with their own colours and runes as the game starts:
//     tools/godot_meld_art.ts), two picture pixels to a game pixel.
//   npx tsx tools/godot_loot.ts [seed]
import { mkdirSync, writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { gameSwitches } from './godot_switches';
import { DARK_RING, Game } from '../src/game/game';
import { rollItem } from '../src/game/items';
import { ITEM_ROOM, STAT_INFO, flatPair, imbueItem, imbueLines, imbueOptions, imbueOptionsFor, itemMods, itemRoom, itemValue, kindName, modLines, rarityFor, starterWeapon, statGroup } from '../src/game/items';
import { FIRST_WORD, WORDS, wordGrowth, wordsAt } from '../src/game/defs';
import { TUNE, ATTR_GIVES } from '../src/game/defs';
import { FURNACE_WORD, QUEST_TEXT } from '../src/game/quests15';
import { QUEST_MARKS, SPEAK_BACK, SPEAK_WHERE } from '../src/game/quest_marks';
import { WORD_COLOR, itemPic, makeIconArt } from '../src/art/icons';
import { makeBodyArt } from '../src/art/body';
import type { RNG } from '../src/engine/rng';
import { PRISON_WORD_IDS, WORD_IDS } from '../src/game/types';
import { wordIds } from '../src/game/melds';
import type { ImbueOption } from '../src/game/items';
import { useMeldLooks } from './godot_meld_art';
import type { Imbue, Item, Rarity, StatKey, WordId } from '../src/game/types';
import { rangeText } from '../src/ui/inventory';

declare const process: { argv: string[] };
paintWithoutCanvas();
// (the game's own switches, as it starts: tools/godot_switches.ts)
gameSwitches();
const seed = Number(process.argv[2] ?? 1) >>> 0;
const OUT = 'godot/assets/loot';
mkdirSync(OUT, { recursive: true });

const game = new Game('warrior', seed);
game.depth = 1;
game.enterDungeon();
const roll = (q: number): Item => (game as unknown as { rollGear(q: number): Item }).rollGear(q);
const icons = makeIconArt();
// (WORDMELDING: the melded words' own colours and runes, as the game puts them on as it starts)
useMeldLooks(icons);
// (the words a Warrior can come by on floors 1 to 5: the prison's six and Heavy, the armourer's reward; and floors 6 to 10's, the
// rest of what may be found there, in the game's order: tools/godot_words.ts)
const PRISON: WordId[] = [...PRISON_WORD_IDS, FURNACE_WORD.warrior];
const OURS: WordId[] = [...PRISON, ...WORD_IDS.filter((w) => !PRISON.includes(w) && [6, 7, 8, 9, 10].some((d) => wordsAt(d).includes(w)))];
// (WORDMELDING: the words melding makes, in the game's order: tools/godot_words.ts)
const MADE: WordId[] = wordIds().filter((w) => !WORD_IDS.includes(w));

// --- the pictures, each once, by key ---
const pics = new Map<string, Sprite>();
const picKey = (it: Item): string => {
  const key = `${it.icon}:${it.rarity}`;
  if (!pics.has(key)) pics.set(key, itemPic(icons, it.icon, it.rarity));
  return key;
};
icons.gold.forEach((s, i) => pics.set(`gold:${i}`, s));
pics.set('orb', icons.lifeOrb);
pics.set('potion', icons.potion);
pics.set('word:power', icons.word.power);
// (the other words' rune stones: a word as it lies on the floor, and on the gear screen)
for (const w of [...OURS, ...MADE]) if (w !== 'power') pics.set(`word:${w}`, icons.word[w]);
// (the fallen wordsmith, before and after he is searched: art/body.ts)
const bodyArt = makeBodyArt();
pics.set('body', bodyArt.body);
pics.set('body:searched', bodyArt.searched);

/**
 * A PIECE'S PRICE WITH WORDS BURNED INTO IT (items.ts itemValue): with one more word in it, with two, as far as it has room.
 * A fifth more for each word, and its colour's own worth where the word changes its colour (imbueItem: a piece's colour
 * follows the count of its properties).
 */
function worth(it: Item): number[] {
  const out: number[] = [];
  for (let n = 1; n <= itemRoom(it); n++) {
    const imbues: Imbue[] = [...it.imbues, ...Array.from({ length: n }, (): Imbue => ({ word: 'power', kind: 'prefix', mods: [] }))];
    out.push(itemValue({ ...it, imbues, rarity: Math.max(it.rarity, rarityFor(it.affixes.length + imbues.length)) as Rarity }));
  }
  return out;
}

// (every kind of piece at every level a piece here has, one of each kept: what a word becomes on it is told once for them all)
const kinds = new Map<string, Item>();
const plain = (it: Item): Record<string, unknown> => {
  const mods = itemMods(it);
  if (!kinds.has(`${it.slot}:${it.ilvl}`)) kinds.set(`${it.slot}:${it.ilvl}`, it);
  return {
    name: it.name, base: it.baseName, kind: kindName(it), slot: it.slot, rarity: it.rarity, ilvl: it.ilvl, req: it.reqLevel,
    icon: picKey(it), weapon: !!it.weapon, hands: it.hands ?? 0, aps: it.aps ?? 0, value: itemValue(it),
    mods: mods.map((m) => [m.stat, m.value]),
    implicit: modLines(it.implicit, 'cooldown'),
    lines: modLines(it.affixes.flatMap((a) => a.mods), 'cooldown'),
    // (the properties it was found with: how many of its four places they take (items.ts itemRoom), and which they are, so
    // that no word gives it one of them again (items.ts carried))
    affixes: it.affixes.length,
    has: it.affixes.flatMap((a) => a.mods.map((m) => m.stat)),
    // (its price with one word burned into it, with two, as far as it has room)
    worth: worth(it),
  };
};

/**
 * WHAT A WORD BECOMES ON A PIECE OF THAT KIND AND LEVEL (items.ts imbueOptions): each thing it may become there, and every
 * size of it the game's own imbueItem can roll, with how likely each is. imbueItem rolls a size with one draw: a whole
 * number between two ends, each as likely as the next (rollStat), so each is made here by handing it that number; or, for
 * "Adds X-Y Damage", an average hit anywhere between two ends (damageRange), handed it here at 400 places evenly across,
 * the outcomes that come out the same counted together.
 */
function becomes(word: WordId, like: Item): unknown[] {
  const bare: Item = structuredClone(like);
  bare.affixes = [];
  bare.imbues = [];
  bare.rarity = 0;
  delete bare.unique;
  // (WORDMELDING: a melded word's pairs, each on its own: `twoPart`)
  if (imbueOptions(word, bare.slot, bare.ilvl).some((o) => o.also)) return imbueOptions(word, bare.slot, bare.ilvl).map((o) => twoPart(word, bare, o));
  return imbueOptions(word, bare.slot, bare.ilvl).map((o, k) => {
    const made = new Map<string, [number, [StatKey, number][], string[]]>();
    const roll = (draw: Partial<RNG>): void => {
      const im = imbueItem(structuredClone(bare), word, draw as RNG, k);
      if (!im) throw new Error(`${word} would not burn into a bare ${bare.slot} of level ${bare.ilvl}`);
      const mods = im.mods.map((m): [StatKey, number] => [m.stat, m.value]);
      const key = JSON.stringify(mods);
      const was = made.get(key);
      if (was) was[0]++;
      else made.set(key, [1, mods, imbueLines(im, 'cooldown')]);
    };
    if (flatPair(o.stat)) {
      const N = 400;
      for (let j = 0; j < N; j++) roll({ range: (lo: number, hi: number) => lo + ((hi - lo) * (j + 0.5)) / N });
    } else {
      let ends: [number, number] = [0, 0];
      imbueItem(structuredClone(bare), word, { int: (a: number, b: number) => { ends = [a, b]; return a; } } as RNG, k);
      for (let v = ends[0]; v <= ends[1]; v++) roll({ int: () => v });
    }
    return { stat: o.stat, kind: o.kind, range: rangeText(o, 'cooldown'), rolls: [...made.values()] };
  });
}

/**
 * WORDMELDING: ONE PAIR OF A MELDED WORD ON A PIECE (items.ts imbueOptions `also`, imbueItem). The game offers a piece only the
 * first two pairs its properties leave free (imbueOptionsFor), so each pair is made here on a piece that carries every other pair's
 * stats, which leaves this pair alone to be made. imbueItem rolls the pair's first property, then its second on its own
 * (rollStat), unless the two are of a kind and MELD_LINE gives the second the first's number (one draw). So: with two draws, each
 * first size the game can roll (its mods and lines, the second at its least) and each second size (the first at its least), each
 * held against the game's own lines for the whole (imbueLines) at the four ends; with one, every size of the two together.
 */
function twoPart(word: WordId, bare: Item, o: ImbueOption): unknown {
  const all = imbueOptions(word, bare.slot, bare.ilvl);
  // (the pairs before it given a piece's properties of theirs that are not its own: it is then among the first two offered)
  const mine = [o.stat, o.also ? o.also.stat : o.stat];
  const others = [...new Set(all.slice(0, all.indexOf(o)).flatMap((x) => [x.stat, ...(x.also ? [x.also.stat] : [])]).filter((st) => !mine.includes(st)))];
  const lone: Item = structuredClone(bare);
  lone.imbues = others.length ? [{ word: 'power', kind: 'prefix', mods: others.map((st) => ({ stat: st, value: 1 })) }] : [];
  const choice = imbueOptionsFor(lone, word).findIndex((x) => x.stat === o.stat && (x.also ? x.also.stat : null) === (o.also ? o.also.stat : null));
  if (choice < 0) throw new Error(`${word} on a ${bare.slot}: its pair ${mine.join('+')} is never offered`);
  // (the draws imbueItem makes on its roll, and their ends: `int` for a stat's size, `range` for an average hit)
  const calls: [string, number, number][] = [];
  const record = { int: (a: number, b: number) => (calls.push(['int', a, b]), a), range: (a: number, b: number) => (calls.push(['range', a, b]), a), pick: () => { throw new Error('picked'); } };
  imbueItem(structuredClone(lone), word, record as unknown as RNG, choice);
  const made = (vals: number[]): Imbue => {
    let k = 0;
    const draw = (): number => vals[k++];
    const im = imbueItem(structuredClone(lone), word, { int: draw, range: draw, pick: () => { throw new Error('picked'); } } as unknown as RNG, choice);
    if (!im) throw new Error(`${word} would not burn into a ${bare.slot} of level ${bare.ilvl}`);
    const want = flatPair(o.stat) ? flatPair(o.stat)!.min : o.stat;
    if (im.mods[0].stat !== want) throw new Error(`${word} on a ${bare.slot}: the pair made (${im.mods[0].stat}) is not the one asked for (${want})`);
    return im;
  };
  const span = (c: [string, number, number]): number[] => {
    if (c[0] === 'range') return Array.from({ length: 400 }, (_, j) => c[1] + ((c[2] - c[1]) * (j + 0.5)) / 400);
    return Array.from({ length: c[2] - c[1] + 1 }, (_, j) => c[1] + j);
  };
  const first = flatPair(o.stat) ? 2 : 1;
  const tally = (vals: number[][], cut: (im: Imbue) => Imbue['mods'], whole: boolean): unknown[] => {
    const out = new Map<string, [number, [StatKey, number][], string[]]>();
    for (const v of vals) {
      const im = made(v);
      const mods = cut(im);
      const key = JSON.stringify(mods.map((m) => [m.stat, m.value]));
      const was = out.get(key);
      if (was) was[0]++;
      else out.set(key, [1, mods.map((m): [StatKey, number] => [m.stat, m.value]), whole ? imbueLines(im, 'cooldown') : modLines(mods, 'cooldown')]);
    }
    return [...out.values()];
  };
  const range = rangeText(o, 'cooldown');
  if (calls.length === 1) return { stat: o.stat, also: o.also ? o.also.stat : null, kind: o.kind, range, rolls: tally(span(calls[0]).map((v) => [v]), (im) => im.mods, true) };
  if (calls.length !== 2) throw new Error(`${word}: ${calls.length} draws`);
  for (const a of [calls[0][1], calls[0][2]]) for (const b of [calls[1][1], calls[1][2]]) {
    const im = made([a, b]);
    const whole = imbueLines(im, 'cooldown').join('|');
    const parts = [...modLines(im.mods.slice(0, first), 'cooldown'), ...modLines(im.mods.slice(first), 'cooldown')].join('|');
    if (whole !== parts) throw new Error(`${word} on a ${bare.slot}: '${whole}' is not '${parts}'`);
  }
  return {
    stat: o.stat, also: o.also!.stat, kind: o.kind, range,
    rolls: tally(span(calls[0]).map((v) => [v, calls[1][1]]), (im) => im.mods.slice(0, first), false),
    alsoRolls: tally(span(calls[1]).map((v) => [calls[0][1], v]), (im) => im.mods.slice(first), false),
  };
}

const POOLS: [number, number][] = [[0, 300], [1, 160], [2, 100], [4, 80]];
const pools: Record<string, unknown[]> = {};
const tally: string[] = [];
for (const [q, n] of POOLS) {
  const list = Array.from({ length: n }, () => plain(roll(q)));
  pools[String(q)] = list;
  const by = [0, 0, 0, 0];
  for (const it of list) by[(it as { rarity: number }).rarity]++;
  tally.push(`quality ${q}: ${n} (plain ${by[0]}, magic ${by[1]}, rare ${by[2]}, unique ${by[3]})`);
}
// (ANY FLOOR: the same pools rolled by the game on each of floors 2 to 10, a new Warrior's game set down there: the deeper, the
// better the gear, as the game's rollGear has it by the floor; loot.gd takes the pool of the floor he is on)
const byDepth: Record<string, Record<string, unknown[]>> = { '1': pools };
for (let depth = 2; depth <= 10; depth++) {
  const deep = new Game('warrior', seed);
  deep.depth = depth;
  deep.enterDungeon();
  const rollDeep = (q: number): Item => (deep as unknown as { rollGear(q: number): Item }).rollGear(q);
  const here: Record<string, unknown[]> = {};
  for (const [q, n] of POOLS) here[String(q)] = Array.from({ length: n }, () => plain(rollDeep(q)));
  byDepth[String(depth)] = here;
  const lv = (here['0'] as { ilvl: number }[]).reduce((a, it) => a + it.ilvl, 0) / here['0'].length;
  tally.push(`floor ${depth}: ${POOLS.map(([q, n]) => `${n} of quality ${q}`).join(', ')}; an ordinary piece's level ${lv.toFixed(1)} on average`);
}
const starter = plain(starterWeapon('warrior'));
const stats: Record<string, { label: string; pct: boolean }> = {};
for (const [k, v] of Object.entries(STAT_INFO)) stats[k] = { label: (v as { label: string }).label, pct: !!(v as { pct?: boolean }).pct };
// (the vendors' shelves on a new Warrior's first day in town: Game.rollShop, as enterTown has it; each piece's price itemValue)
const inTown = new Game('warrior', seed);
const shopsOf = (inTown as unknown as { shops: Record<string, (Item | null)[]> }).shops;
const shops: Record<string, unknown[]> = {};
for (const [id, list] of Object.entries(shopsOf)) shops[id] = list.filter((it): it is Item => it !== null).map(plain);
// THE STRANGER'S GAMBLE (game.ts gambleKinds, gamblePrice, gamble; defs.ts TUNE.gambleMult, gambleOdds): the kinds he throws for
// a Warrior (each its name and its Normal picture), what a throw costs coming up from each floor (power 1 to 10), and for each
// such floor and each quality a throw can come out at (0 plain, 1 magic, 2 rare) GAMBLE_N pieces rolled by the game's own
// rollItem as gamble() rolls them; loot.gd rolls the quality as the game does and takes one of them. (Its very rare unique,
// TUNE.gambleOdds.unique: the uniques are not in the Godot version.)
const GAMBLE_N = 8;
const gambleKindsList = inTown.gambleKinds();
const gamble = {
  kinds: gambleKindsList.map((k) => {
    const key = `${k.icon}:0`;
    if (!pics.has(key)) pics.set(key, itemPic(icons, k.icon, 0));
    return { name: k.name, slot: k.slot, weapon: k.weapon ?? null, icon: key };
  }),
  price: {} as Record<string, number[]>,
  pieces: {} as Record<string, unknown[][][]>,
};
for (let depth = 1; depth <= 10; depth++) {
  const gg = new Game('warrior', seed);
  gg.depth = depth;
  gamble.price[String(depth)] = gambleKindsList.map((_, k) => gg.gamblePrice(k));
  const forHim = (it: Item): Item => (gg as unknown as { forHim(i: Item): Item }).forHim(it);
  const rng = (gg as unknown as { rng: Parameters<typeof rollItem>[1] }).rng;
  gamble.pieces[String(depth)] = gambleKindsList.map((kind) =>
    [0, 1, 2].map((rarity) => Array.from({ length: GAMBLE_N }, () => plain(forHim(rollItem(Math.max(1, depth), rng, { slot: kind.slot, rarity: rarity as 0 | 1 | 2, weapons: kind.weapon ? [kind.weapon] : undefined, cls: 'warrior' }))))),
  );
}
tally.push(`the stranger: ${gambleKindsList.length} kinds (${gambleKindsList.map((k) => k.name).join(', ')}), a throw ${gamble.price['1'].join('/')} gold coming up from floor 1, ${gamble.price['10'].join('/')} from floor 10; ${GAMBLE_N} pieces of each quality for each kind and floor`);
const body = game.level.body;
// (what each word becomes on each kind of piece: once every piece that is written has been seen)
const imbue: Record<string, Record<string, unknown[]>> = {};
let sizes = 0;
for (const w of [...OURS, ...MADE]) {
  imbue[w] = {};
  for (const [key, like] of kinds) {
    imbue[w][key] = becomes(w, like);
    for (const o of imbue[w][key] as { rolls: unknown[]; alsoRolls?: unknown[] }[]) sizes += o.rolls.length + (o.alsoRolls ? o.alsoRolls.length : 0);
  }
}
// (stats that count as one property on a piece: items.ts statGroup; only those that are not their own)
const groups: Record<string, string> = {};
for (const k of Object.keys(STAT_INFO)) if (statGroup(k as StatKey) !== k) groups[k] = statGroup(k as StatKey);
const FLOORS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const words = {
  // (the order the game lists the words a hero holds in, types.ts WORD_IDS; and each word's own colour, art/icons.ts WORD_COLOR)
  // (WORDMELDING: the words melding makes after them, in the game's order, melds.ts wordIds; and their own colours as the game
  // starts, tools/godot_meld_art.ts)
  order: [...WORD_IDS.filter((w) => OURS.includes(w)), ...MADE],
  color: Object.fromEntries([...OURS, ...MADE].map((w) => [w, WORD_COLOR[w]])),
  made: MADE,
  // (the Warrior's first word, the fallen wordsmith's and the wordsmith's: defs.ts FIRST_WORD)
  first: FIRST_WORD.warrior.word,
  // (the words that may be found on each floor, and how many times as likely a word is there: types.ts wordsAt, defs.ts wordGrowth)
  at: Object.fromEntries(FLOORS.map((d) => [d, wordsAt(d)])),
  growth: Object.fromEntries(FLOORS.map((d) => [d, wordGrowth(d)])),
  // (a piece's places for properties, and what is said of a word before the ring is lit: items.ts ITEM_ROOM, game.ts DARK_RING)
  room: ITEM_ROOM,
  dark: DARK_RING,
  groups,
};
// (THE ARMOURER'S QUEST, game/quests15.ts: his word for the Warrior, and each of its lines as the game says it; and the line at
// the top that sends the hero to him and back to him: game/quest_marks.ts)
const reward = FURNACE_WORD.warrior;
const quest = {
  word: reward,
  furnaceAsk: QUEST_TEXT.furnaceAsk,
  furnaceAskPrompt: QUEST_TEXT.furnaceAskPrompt,
  rewardPrompt: QUEST_TEXT.rewardPrompt,
  reward: QUEST_TEXT.reward(WORDS[reward].name.toUpperCase()),
  speakWhere: SPEAK_WHERE,
  speakBack: SPEAK_BACK,
  speakSecs: QUEST_MARKS.secs,
};
writeFileSync(`${OUT}/items.json`, JSON.stringify({ pools, byDepth, starter, stats, tune: { ...TUNE }, attr: { ...ATTR_GIVES }, body: body ? { x: body.x, y: body.y } : null, shops, imbue, words, quest, gamble }));
tally.push(`words on gear: ${[...OURS, ...MADE].join(', ')} on ${kinds.size} kinds of piece by level, ${sizes} sizes in all`);

// --- the pictures in one sheet: each at two picture pixels to a game pixel, its anchor kept ---
function png(w: number, h: number, rgba: Uint8ClampedArray): Uint8Array {
  const raw = new Uint8Array((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) raw.set(rgba.subarray(y * w * 4, (y + 1) * w * 4), y * (w * 4 + 1) + 1);
  const be = (n: number): number[] => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  const chunk = (type: string, data: Uint8Array): number[] => {
    const td = new Uint8Array(4 + data.length);
    for (let i = 0; i < 4; i++) td[i] = type.charCodeAt(i);
    td.set(data, 4);
    return [...be(data.length), ...td, ...be(crc32(td) >>> 0)];
  };
  return new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, ...chunk('IHDR', new Uint8Array([...be(w), ...be(h), 8, 6, 0, 0, 0])), ...chunk('IDAT', deflateSync(raw, { level: 9 })), ...chunk('IEND', new Uint8Array(0))]);
}
const SHEET_W = 1024;
const placed: { key: string; x: number; y: number; w: number; h: number; ax: number; ay: number }[] = [];
let cx = 0;
let cy = 0;
let rowH = 0;
for (const [key, s] of pics) {
  const k = 2 / (s.density ?? 1);
  const p = paintingOf(s);
  const w = p.w * k;
  const h = p.h * k;
  if (cx + w > SHEET_W) { cx = 0; cy += rowH + 1; rowH = 0; }
  placed.push({ key, x: cx, y: cy, w, h, ax: s.ax * 2, ay: s.ay * 2 });
  cx += w + 1;
  rowH = Math.max(rowH, h);
}
const H = cy + rowH;
const sheet = new Uint8ClampedArray(SHEET_W * H * 4);
let n = 0;
for (const [, s] of pics) {
  const at = placed[n++];
  const k = 2 / (s.density ?? 1);
  const p = paintingOf(s);
  for (let j = 0; j < at.h; j++) for (let i = 0; i < at.w; i++) {
    const o = (Math.floor(j / k) * p.w + Math.floor(i / k)) * 4;
    const d = ((at.y + j) * SHEET_W + at.x + i) * 4;
    for (let c = 0; c < 4; c++) sheet[d + c] = p.d[o + c];
  }
}
writeFileSync(`${OUT}/icons.png`, png(SHEET_W, H, sheet));
writeFileSync(`${OUT}/icons.json`, JSON.stringify(placed));
console.log(tally.join('\n'));
console.log(`starter: ${(starter as { name: string }).name}; ${pics.size} pictures in a ${SHEET_W}x${H} sheet`);
