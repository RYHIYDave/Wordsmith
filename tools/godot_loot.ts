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
//   THE TABLES SPLIT (22 Nov 2026, so that Godot holds only what is wanted: tools/godot_loot_split.mjs, run at the end of this):
//     `imbue`, `byDepth` and `gamble.pieces` go out of items.json into imbue.json + imbue_opts.bin, depth/<d>.json, gamble/<d>.json.
//   npx tsx tools/godot_loot.ts [seed]
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { gameSwitches } from './godot_switches';
import { DARK_RING, Game } from '../src/game/game';
import { DEFENCE_DEFS, LEVEL2_DEFS, LEVEL_DEFS, UNIQUE_DROPS, UNIQUE_RULES, UNIQUE_TUNE, liveDefs, makeUnique, uniqueDef, uniqueSlot, uniqueWeapon, wordIsIn } from '../src/game/uniques';
import { rarityChances } from '../src/game/items';
import { RNG as UniqueRng } from '../src/engine/rng';
import { CLASS_BASES, ITEM_BASES, rollFullRare, rollItem } from '../src/game/items';
import { RNG as LootRNG } from '../src/engine/rng';
import { CLAPPER_REWARD, PAGES, QUEST1115_TEXT, QUESTS1115, jarWords } from '../src/game/quests1115';
import { ROYALS, ROYAL_NAMES, ROYAL_TUNE } from '../src/game/royal_cards';
import { BIRD_ALL, BIRD_BODY, BIRD_KEY, BIRD_SPRING, CAPTAIN_WHERE, QUEST1620_TEXT, QUESTS1620, SONG, birdWords } from '../src/game/quests1620';
import { ROYAL_LOOK, royalCard } from '../src/art/high_city_set';
import { royalCrests } from '../src/art/royal_crest';
import { CARD_FACE } from '../src/render/royal_cards';
import { keySprite, springSprite } from '../src/art/quest1620';
import { ITEM_ROOM, STAT_INFO, flatPair, imbueItem, imbueLines, imbueOptions, imbueOptionsFor, itemMods, itemRoom, itemValue, kindName, modLines, rarityFor, starterWeapon, statGroup } from '../src/game/items';
import { CLASSES, FIRST_WORD, WORDS, wordGrowth, wordsAt } from '../src/game/defs';
import { TUNE, ATTR_GIVES, LOOT2 } from '../src/game/defs';
import { FURNACE_WORD, QUEST_TEXT } from '../src/game/quests15';
import { QUEST_MARKS, SPEAK_BACK, SPEAK_WHERE } from '../src/game/quest_marks';
import { WORD_COLOR, itemPic, makeIconArt } from '../src/art/icons';
import { DEFENCE_ART, uniqueArt } from '../src/art/items_unique';
import { makeBodyArt } from '../src/art/body';
import type { RNG } from '../src/engine/rng';
import { PRISON_WORD_IDS, WORD_IDS } from '../src/game/types';
import { wordIds } from '../src/game/melds';
import type { ImbueOption } from '../src/game/items';
import type { ClassId, WeaponKind } from '../src/game/types';
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
// (and the city's five, found from floor 11 down: types.ts DEEP_WORD_IDS)
// (and the High City's seven last words, found from floor 16: types.ts LAST_WORD_IDS)
const OURS: WordId[] = [...PRISON, ...WORD_IDS.filter((w) => !PRISON.includes(w) && [6, 7, 8, 9, 10, 11, 16].some((d) => wordsAt(d).includes(w)))];
// (WORDMELDING: the words melding makes, in the game's order: tools/godot_words.ts)
const MADE: WordId[] = wordIds().filter((w) => !WORD_IDS.includes(w));

// (the fifteen's pictures are exported whatever their switch: Godot's own switch says whether they show)
DEFENCE_ART.on = true;
// --- the pictures, each once, by key ---
const pics = new Map<string, Sprite>();
const picKey = (it: Item): string => {
  // (A UNIQUE'S OWN PICTURE, art/items_unique.ts uniqueArt: his words, 23 Nov 2026, “Uniques always have unique sprite art”; the
  // port had every unique in its base's orange look. Its key `u:<id>`; one with no picture of its own, its base's as before)
  const own = it.rarity === 3 && it.unique ? uniqueArt(it.unique) : null;
  if (own && it.unique) {
    if (!pics.has(`u:${it.unique}`)) pics.set(`u:${it.unique}`, own);
    return `u:${it.unique}`;
  }
  const key = `${it.icon}:${it.rarity}`;
  if (!pics.has(key)) pics.set(key, itemPic(icons, it.icon, it.rarity));
  // (SPLITTING AND BINDING change a piece's colour with the count of its properties: its picture in each of the three)
  if (it.rarity < 3) for (const r of [0, 1, 2] as Rarity[]) if (!pics.has(`${it.icon}:${r}`)) pics.set(`${it.icon}:${r}`, itemPic(icons, it.icon, r));
  return key;
};
// (items.ts VALUE_BY_RARITY, VALUE_PER_AFFIX, VALUE_IMBUED: what a piece's colour, each property it was found with and each word
// burned into it make of its price, itemValue)
const VALUE = { rarity: [1, 2.5, 6, 15], affix: 0.15, imbued: 1.2 };
icons.gold.forEach((s, i) => pics.set(`gold:${i}`, s));
pics.set('orb', icons.lifeOrb);
pics.set('potion', icons.potion);
pics.set('word:power', icons.word.power);
// (THE RANGER'S TRAP lying on the floor, by its element: shut and, armed, open, art/icons.ts trapIcon; render.ts draws it)
for (const [el, frames] of Object.entries(icons.trap)) (frames as Sprite[]).forEach((sp, k) => pics.set(`trap:${el}:${k}`, sp));
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
// (ABILITIES: MANA, the start screen's switch: a piece's lines as they read when mana is the limit (items.ts statView: its Max Mana
// and Mana Regen as themselves, not as cooldown recovery; its cooldown recovery as less Mana Cost), kept only where they differ)
const ifMana = (cd: string[], mana: string[]): string[] | undefined => (JSON.stringify(cd) === JSON.stringify(mana) ? undefined : mana);
// (a unique's piece: THE UNIQUES' DEFENCES, defenceOf, wherever it is made: the pieces of each, a floor's pool)
const plain = (it: Item): Record<string, unknown> => {
  const d = it.rarity === 3 ? uniqueDef(it.unique) : undefined;
  if (!d) return plain0(it);
  const out = defenceOf(plain0(it), d);
  // (THE FIFTEEN's pictures wait on his yes, loot.gd DEFENCE_ART: its base's picture as `icon`, its own as `uicon`)
  if (DEFENCE_DEFS.includes(d) && String(out.icon).startsWith('u:')) {
    const base = `${it.icon}:${it.rarity}`;
    if (!pics.has(base)) pics.set(base, itemPic(icons, it.icon, it.rarity));
    return { ...out, uicon: out.icon, icon: base };
  }
  return out;
};
const plain0 = (it: Item): Record<string, unknown> => {
  const mods = itemMods(it);
  if (!kinds.has(`${it.slot}:${it.ilvl}`)) kinds.set(`${it.slot}:${it.ilvl}`, it);
  return {
    name: it.name, base: it.baseName, kind: kindName(it), slot: it.slot, rarity: it.rarity, ilvl: it.ilvl, req: it.reqLevel,
    icon: picKey(it), weapon: !!it.weapon, hands: it.hands ?? 0, aps: it.aps ?? 0, value: itemValue(it),
    mods: mods.map((m) => [m.stat, m.value]),
    implicit: modLines(it.implicit, 'cooldown'),
    lines: modLines(it.affixes.flatMap((a) => a.mods), 'cooldown'),
    implicitMana: ifMana(modLines(it.implicit, 'cooldown'), modLines(it.implicit, 'mana')),
    linesMana: ifMana(modLines(it.affixes.flatMap((a) => a.mods), 'cooldown'), modLines(it.affixes.flatMap((a) => a.mods), 'mana')),
    // (the properties it was found with: how many of its four places they take (items.ts itemRoom), and which they are, so
    // that no word gives it one of them again (items.ts carried))
    affixes: it.affixes.length,
    has: it.affixes.flatMap((a) => a.mods.map((m) => m.stat)),
    // (its price with one word burned into it, with two, as far as it has room)
    worth: worth(it),
    // (SPLITTING AND BINDING, items.ts splitItem, bindItems: each property it was found with, its mods and its lines; what is built
    // into its base; its price before its colour, its properties and its words, itemValue)
    props: it.affixes.map((a) => ({ mods: a.mods.map((m) => [m.stat, m.value]), lines: modLines(a.mods, 'cooldown'), linesMana: ifMana(modLines(a.mods, 'cooldown'), modLines(a.mods, 'mana')) })),
    imods: it.implicit.map((m) => [m.stat, m.value]),
    vbase: itemValue(it) / (VALUE.rarity[it.rarity] * (1 + VALUE.affix * it.affixes.length) * VALUE.imbued ** it.imbues.length),
    // (UNIQUE ITEMS, game/uniques.ts: which it is, its own numbers as rolled, and what its card says it does and costs)
    ...(it.rarity === 3 && it.unique ? uniqueOut(it) : {}),
  };
};

/** A unique's own (game/uniques.ts uniqueLines, makeUnique): its id, its numbers as rolled, what it does and its price as its card says them. */
function uniqueOut(it: Item): Record<string, unknown> {
  const d = uniqueDef(it.unique);
  if (!d) return { unique: it.unique };
  return {
    unique: d.id, uroll: it.uroll ?? {}, does: d.does(it), price: d.price ? d.price(it) : null,
    ucls: d.cls ?? null, only: !!d.only, wordIn: wordIsIn(d), powers: d.powers ?? 1,
    // (THE UNIQUES' DEFENCES, uniques.ts `defence`: the defence it carries where that is not its base's kind's, loot.gd `udef`; a
    // leveling unique carries nothing of its base, `bare`)
    udef: d.defence ?? null, bare: d.from === 'level',
  };
}

/** THE UNIQUES' DEFENCES: a leveling unique whose armour is another defence (the Quilted Coat's, dodge): its mods and lines so. */
function defenceOf(out: Record<string, unknown>, d: { from: string; defence?: string }): Record<string, unknown> {
  if (d.from !== 'level' || !d.defence || d.defence === 'armor') return out;
  const word = d.defence === 'dodge' ? 'Dodge' : 'Barrier';
  const mods = (l: unknown): unknown => (l as [string, number][]).map((m) => (m[0] === 'armor' ? [d.defence, m[1]] : m));
  const lines = (l: unknown): unknown => (Array.isArray(l) ? (l as string[]).map((t) => t.replace(/ Armou?r$/, ` ${word}`)) : l);
  const o = { ...out, mods: mods(out.mods), lines: lines(out.lines), linesMana: lines(out.linesMana), has: (out.has as string[]).map((h) => (h === 'armor' ? d.defence! : h)) };
  o.props = (out.props as { mods: unknown; lines: unknown; linesMana: unknown }[]).map((p) => ({ mods: mods(p.mods), lines: lines(p.lines), linesMana: lines(p.linesMana) }));
  return o;
}

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
    const made = new Map<string, [number, [StatKey, number][], string[], string[]?]>();
    const roll = (draw: Partial<RNG>): void => {
      const im = imbueItem(structuredClone(bare), word, draw as RNG, k);
      if (!im) throw new Error(`${word} would not burn into a bare ${bare.slot} of level ${bare.ilvl}`);
      const mods = im.mods.map((m): [StatKey, number] => [m.stat, m.value]);
      const key = JSON.stringify(mods);
      const was = made.get(key);
      if (was) was[0]++;
      else {
        const mana = ifMana(imbueLines(im, 'cooldown'), imbueLines(im, 'mana'));
        made.set(key, mana ? [1, mods, imbueLines(im, 'cooldown'), mana] : [1, mods, imbueLines(im, 'cooldown')]);
      }
    };
    if (flatPair(o.stat)) {
      const N = 400;
      for (let j = 0; j < N; j++) roll({ range: (lo: number, hi: number) => lo + ((hi - lo) * (j + 0.5)) / N });
    } else {
      let ends: [number, number] = [0, 0];
      imbueItem(structuredClone(bare), word, { int: (a: number, b: number) => { ends = [a, b]; return a; } } as RNG, k);
      for (let v = ends[0]; v <= ends[1]; v++) roll({ int: () => v });
    }
    return { stat: o.stat, kind: o.kind, range: rangeText(o, 'cooldown'), ...(rangeText(o, 'mana') !== rangeText(o, 'cooldown') ? { rangeMana: rangeText(o, 'mana') } : {}), rolls: [...made.values()] };
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
    const out = new Map<string, [number, [StatKey, number][], string[], string[]?]>();
    for (const v of vals) {
      const im = made(v);
      const mods = cut(im);
      const key = JSON.stringify(mods.map((m) => [m.stat, m.value]));
      const was = out.get(key);
      if (was) was[0]++;
      else {
        const cd = whole ? imbueLines(im, 'cooldown') : modLines(mods, 'cooldown');
        const mana = ifMana(cd, whole ? imbueLines(im, 'mana') : modLines(mods, 'mana'));
        out.set(key, mana ? [1, mods.map((m): [StatKey, number] => [m.stat, m.value]), cd, mana] : [1, mods.map((m): [StatKey, number] => [m.stat, m.value]), cd]);
      }
    }
    return [...out.values()];
  };
  const range = rangeText(o, 'cooldown');
  const rangeMana = rangeText(o, 'mana') !== range ? { rangeMana: rangeText(o, 'mana') } : {};
  if (calls.length === 1) return { stat: o.stat, also: o.also ? o.also.stat : null, kind: o.kind, range, ...rangeMana, rolls: tally(span(calls[0]).map((v) => [v]), (im) => im.mods, true) };
  if (calls.length !== 2) throw new Error(`${word}: ${calls.length} draws`);
  for (const a of [calls[0][1], calls[0][2]]) for (const b of [calls[1][1], calls[1][2]]) {
    const im = made([a, b]);
    const whole = imbueLines(im, 'cooldown').join('|');
    const parts = [...modLines(im.mods.slice(0, first), 'cooldown'), ...modLines(im.mods.slice(first), 'cooldown')].join('|');
    if (whole !== parts) throw new Error(`${word} on a ${bare.slot}: '${whole}' is not '${parts}'`);
  }
  return {
    stat: o.stat, also: o.also!.stat, kind: o.kind, range, ...rangeMana,
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
for (let depth = 2; depth <= 20; depth++) {
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
// (QUESTS1115: THE ARMOURER'S PICK for the clapper, game.ts handIn1115: a fully modded rare of each of CLAPPER_REWARD.slots (gloves,
// boots, a helm: two prefixes and two suffixes, items.ts rollFullRare), rolled at the level the game rolls them at, max(1, power,
// min(15, floors cleared)): for each level the city may give, eight of each)
const fullRares: Record<string, Record<string, unknown[]>> = {};
const frRng = new LootRNG(1115);
for (let lv = 10; lv <= 15; lv++) {
  fullRares[String(lv)] = {};
  for (const sl of CLAPPER_REWARD.slots) fullRares[String(lv)][sl] = Array.from({ length: 8 }, () => plain(rollFullRare(lv, sl, frRng, { cls: 'warrior' })));
}
const starter = plain(starterWeapon('warrior'));
// (EVERY HERO'S OWN: the weapon each class starts with, items.ts starterWeapon; since Version 12 no weapon belongs to a class, so the
// rest of what is found is the same for every hero but the new classes' own weapons)
const starters = Object.fromEntries((Object.keys(CLASSES) as ClassId[]).map((c) => [c, plain(starterWeapon(c))]));
const stats: Record<string, { label: string; pct: boolean }> = {};
for (const [k, v] of Object.entries(STAT_INFO)) stats[k] = { label: (v as { label: string }).label, pct: !!(v as { pct?: boolean }).pct };
// (the vendors' shelves on a new Warrior's first day in town: Game.rollShop, as enterTown has it; each piece's price itemValue)
const inTown = new Game('warrior', seed);
const shopsOf = (inTown as unknown as { shops: Record<string, (Item | null)[]> }).shops;
const shops: Record<string, unknown[]> = {};
for (const [id, list] of Object.entries(shopsOf)) shops[id] = list.filter((it): it is Item => it !== null).map(plain);
// THE STRANGER'S GAMBLE (game.ts gambleKinds, gamblePrice, gamble; defs.ts TUNE.gambleMult, gambleOdds): the kinds he throws for
// a Warrior (each its name and its Normal picture), what a throw costs coming up from each floor (power 1 to 20), and for each
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
for (let depth = 1; depth <= 20; depth++) {
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
// (QUESTS1620: THE WHOLE COURT, the stranger's, and THE CAPTAIN'S VOICE, the knight-captain's, game.ts handIn1620 and captainUsed:
// a unique of his pool, or where there is none a fully modded rare, an amulet, a ring or a belt (the court's), a weapon of the kind
// in his hand (the captain's), at max(1, power, min(20, floors cleared)). The uniques are not in the Godot version: the rares, for
// each level the High City may give, eight of each)
for (let lv = 10; lv <= 20; lv++) {
  fullRares[String(lv)] ??= {};
  for (const sl of ['amulet', 'ring', 'belt'] as const) fullRares[String(lv)][sl] = Array.from({ length: 8 }, () => plain(rollFullRare(lv, sl, frRng, { cls: 'warrior' })));
  for (const wk of [...new Set(gambleKindsList.filter((k) => k.weapon).map((k) => k.weapon as WeaponKind))]) fullRares[String(lv)][`mainhand:${wk}`] = Array.from({ length: 8 }, () => plain(rollFullRare(lv, 'mainhand', frRng, { cls: 'warrior', forWeapon: wk })));
}
// THE ROYAL CARDS (game/royal_cards.ts, the High City's event; godot/scripts/loot.gd, inventory.gd): the four royals, their names, the
// colour each card is named in (render/royal_cards.ts royalLabelColor: its royal's trim, lit), how many packs a royal touches and
// which (ROYAL_TUNE: game.ts spawns it; the floors' exports carry each monster's `royal`), where a card's face lies on its picture
// (CARD_FACE); their pictures (the card lying face up, art/high_city_set.ts royalCard; the crest over a touched one,
// art/royal_crest.ts) as `card:<royal>` and `crest:<royal>`; and what a hand pays (game.ts handInCards): pieces of each rarity a hand
// may pay (1 magic, 2 rare) rolled by the game's own rollItem at each level a hand may pay at (his power, 1 to 20, and up to five
// over it), eight of each
for (const r of ROYALS) {
  pics.set(`card:${r}`, royalCard(r));
  pics.set(`crest:${r}`, royalCrests()[r]);
}
// (QUESTS1620: the songbird's key and spring, as they lie: art/quest1620.ts)
pics.set('quest:key', keySprite());
pics.set('quest:spring', springSprite());
const royalRng = new LootRNG(1620);
const royalForHim = (it: Item): Item => (inTown as unknown as { forHim(i: Item): Item }).forHim(it);
const royal = {
  royals: [...ROYALS],
  names: ROYAL_NAMES,
  label: Object.fromEntries(ROYALS.map((r) => [r, ROYAL_LOOK[r].trim[4]])),
  tune: ROYAL_TUNE,
  face: CARD_FACE,
  pieces: {} as Record<string, Record<string, unknown[]>>,
};
for (let lv = 1; lv <= 25; lv++) {
  royal.pieces[String(lv)] = {};
  for (const rarity of [1, 2] as const) royal.pieces[String(lv)][String(rarity)] = Array.from({ length: 8 }, () => plain(royalForHim(rollItem(lv, royalRng, { rarity, cls: 'warrior' }))));
}
// THE QUEST LINE OF FLOORS 16 TO 20 (game/quests1620.ts QUESTS1620; godot/scripts/act3/quest1620.gd): its switch, the songbird's
// parts' bits, its numbers (SONG), the mended bird's reward (birdWords), and its lines, those that take a number or a word with
// `{k}` or `{w}`
{
  const T = QUEST1620_TEXT;
  const N = 7777;
  const k = (t: string): string => t.split(String(N)).join('{k}');
  writeFileSync('godot/assets/act2/quest1620.json', JSON.stringify({
    on: QUESTS1620.on,
    bits: { key: BIRD_KEY, spring: BIRD_SPRING, body: BIRD_BODY, all: BIRD_ALL },
    song: { ...SONG },
    birdWords: [...birdWords()],
    captainWhere: CAPTAIN_WHERE,
    text: {
      birdAsk: T.birdAsk, birdAskPrompt: T.birdAskPrompt, partGotKey: k(T.partGot('key', N)), partGotSpring: k(T.partGot('spring', N)), partGotBody: k(T.partGot('body', N)),
      birdGivePrompt: T.birdGivePrompt, birdMended: T.birdMended('{w}', false), birdMendedTower: T.birdMended('{w}', true), towerShut: T.towerShut,
      songPrompt: T.songPrompt, sang: T.sang, keyLabel: T.keyLabel, springLabel: T.springLabel, birdLabel: T.birdLabel, captainLabel: T.captainLabel,
      courtAsk: T.courtAsk, courtAskPrompt: T.courtAskPrompt, courtGivePrompt: T.courtGivePrompt, courtGiven: T.courtGiven, captainJarLabel: T.captainJarLabel,
      captainJarGot: T.captainJarGot, captainSilent: T.captainSilent, captainPrompt: T.captainPrompt, captainGivePrompt: T.captainGivePrompt,
      captainSpeaks: T.captainSpeaks, captainAgain: T.captainAgain,
    },
  }));
}
// THE START SCREEN'S TEST HEROES (godot/assets/loot/trials.json; main.gd's level select and practice room):
//   THE LEVEL SELECT (game.ts forTrial, readyFor): for each class and each floor from the second, the test hero the game makes
//     for it: the level a hero comes there at (LEVEL_SELECT.level), those levels' points spent (two of every three on his class's
//     own attribute), the wordsmith's ring lit, a full set of magic gear of the floor's item level, and in the pouch every word
//     that can be found down to that floor, with the made words, six of each. (On floor 1, a new hero as any.)
//   THE PRACTICE ROOM (game.ts forPractice, beginPractice): for each class, its seasoned throwaway: level 10, the ring lit, its
//     attributes raised, a full set of magic gear, one of every other weapon (and a piece for the other hand) in the bag, and
//     six of every word.
const heroOf = (g: Game): Record<string, unknown> => {
  const h = g.hero;
  const gear: Record<string, unknown> = {};
  for (const [slot, it] of Object.entries(h.gear)) gear[slot] = it ? plain(it as Item) : null;
  return {
    level: h.level, attrs: { ...h.attrs }, gear, bag: h.bag.map((it) => (it ? plain(it) : null)),
    words: Object.fromEntries(Object.entries(h.words).filter(([, n]) => (n as number) > 0)),
  };
};
const trials: Record<string, Record<string, unknown>> = {};
const practice: Record<string, unknown> = {};
for (const c of Object.keys(CLASSES) as ClassId[]) {
  trials[c] = {};
  for (let d = 2; d <= Game.trialFloors(); d++) trials[c][String(d)] = heroOf(Game.forTrial(c, seed, d));
  practice[c] = heroOf(Game.forPractice(c, seed));
}
tally.push(`test heroes: ${Object.keys(trials).length} classes, floors 2 to ${Game.trialFloors()}; practice heroes: ${Object.keys(practice).length}`);
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
const FLOORS = Array.from({ length: 20 }, (_, i) => i + 1);
const words = {
  // (the order the game lists the words a hero holds in, types.ts WORD_IDS; and each word's own colour, art/icons.ts WORD_COLOR)
  // (WORDMELDING: the words melding makes after them, in the game's order, melds.ts wordIds; and their own colours as the game
  // starts, tools/godot_meld_art.ts)
  order: [...WORD_IDS.filter((w) => OURS.includes(w)), ...MADE],
  color: Object.fromEntries([...OURS, ...MADE].map((w) => [w, WORD_COLOR[w]])),
  made: MADE,
  // (the Warrior's first word, the fallen wordsmith's and the wordsmith's: defs.ts FIRST_WORD)
  first: FIRST_WORD.warrior.word,
  // (and every class's: the word, and the move it is set in)
  firstOf: FIRST_WORD,
  // (the words that may be found on each floor, and how many times as likely a word is there: types.ts wordsAt, defs.ts wordGrowth)
  // (those the Godot version has: the High City's last words come with their port)
  at: Object.fromEntries(FLOORS.map((d) => [d, wordsAt(d).filter((w) => OURS.includes(w))])),
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
  // (every class's word for it, and the line it is given with)
  wordOf: FURNACE_WORD,
  rewardOf: Object.fromEntries(Object.entries(FURNACE_WORD).map(([c, w]) => [c, QUEST_TEXT.reward(WORDS[w].name.toUpperCase())])),
  speakWhere: SPEAK_WHERE,
  speakBack: SPEAK_BACK,
  speakSecs: QUEST_MARKS.secs,
};
// THE QUEST LINE OF FLOORS 11 TO 15 (game/quests1115.ts QUESTS1115; godot/scripts/act2/quest1115.gd): its switch, its numbers
// (PAGES, CLAPPER_REWARD), the jar's reward (jarWords), and its lines, those that take a number or a word with `{n}` or `{w}`
{
  const T = QUEST1115_TEXT;
  const N = 7777;
  const n = (s: string): string => s.split(String(N)).join('{n}');
  mkdirSync('godot/assets/act2', { recursive: true });
  writeFileSync('godot/assets/act2/quest1115.json', JSON.stringify({
    on: QUESTS1115.on,
    pages: { ...PAGES },
    clapper: { slots: [...CLAPPER_REWARD.slots], apart: CLAPPER_REWARD.apart, before: CLAPPER_REWARD.before },
    jarWords: [...jarWords()],
    text: {
      jarAsk: T.jarAsk, jarAskPrompt: T.jarAskPrompt, jarHere: T.jarHere, jarGot: T.jarGot, jarLabel: T.jarLabel, jarGivePrompt: T.jarGivePrompt,
      jarGiven: T.jarGiven('{w}'), pagesHere: T.pagesHere(13), pageGot: n(T.pageGot(N)), pageLabel: T.pageLabel, pagePrompt: n(T.pagePrompt(N)),
      pageLaid: n(T.pageLaid(N)), clapperAsk: T.clapperAsk, clapperAskPrompt: T.clapperAskPrompt, clapperGot: T.clapperGot, clapperLabel: T.clapperLabel,
      clapperGivePrompt: T.clapperGivePrompt, clapperGiven: T.clapperGiven, offerAgainArmourer: T.offerAgain('armourer'), offerTakenArmourer: T.offerTaken('armourer'),
    },
  }));
}
// (THE WARRIOR'S THREE WEAPONS, game/items.ts asWarriorWeapon: a greatsword, battle axe or warhammer made his weapon's kind of the
// same name tier, its name, picture and kind its new kind's, its numbers the same (the three's are): each kind's name, its three
// bases' names, its picture at the three plain rarities)
const armsKinds = ['greatsword', 'battleaxe', 'warhammer'] as const;
const warriorArms = Object.fromEntries(armsKinds.map((w) => {
  const tiers = [...ITEM_BASES, ...CLASS_BASES].filter((b) => b.weapon === w).sort((a, b) => a.id.localeCompare(b.id));
  for (const r of [0, 1, 2] as Rarity[]) if (!pics.has(`${tiers[0].icon}:${r}`)) pics.set(`${tiers[0].icon}:${r}`, itemPic(icons, tiers[0].icon, r));
  return [w, { kind: kindName({ weapon: w, offhand: null, slot: 'mainhand' } as unknown as Item), names: tiers.map((b) => b.name), icon: tiers[0].icon }];
}));
writeFileSync(`${OUT}/trials.json`, JSON.stringify({ trials, practice }));
// UNIQUE ITEMS (game/uniques.ts, UNIQUES on): what each is and where it drops, its numbers' tune and the odds; and pieces of each as
// the game's own makeUnique makes them, at each floor's level (a leveling unique at its own); and the chances of plain, magic and
// rare at each floor's level, for magic find to move (items.ts rarityChances, rollRarity)
const uRng = new UniqueRng((seed ^ 0x5a17c3) >>> 0);
const uDefs: Record<string, unknown> = {};
const uPieces: Record<string, unknown[]> = {};
// (THE FIFTEEN OF THE THREE DEFENCES, uniques.ts DEFENCE_DEFS: `set` "defence"; loot.gd DEFENCE_UNIQUES says whether they drop)
// (FIFTEEN MORE LEVELING UNIQUES, uniques.ts LEVEL2_DEFS: `set` "level2"; loot.gd LEVEL2_UNIQUES says whether they drop)
for (const d of [...liveDefs(), ...LEVEL_DEFS, ...DEFENCE_DEFS, ...LEVEL2_DEFS]) {
  uDefs[d.id] = { set: DEFENCE_DEFS.includes(d) ? 'defence' : LEVEL2_DEFS.includes(d) ? 'level2' : null, udef: d.defence ?? null, name: d.name, from: d.from, boss: d.boss ?? null, floor: d.floor ?? null, cls: d.cls ?? null, only: !!d.only, bends: d.bends, powers: d.powers ?? 1, rolled: d.rolled ?? [], slot: uniqueSlot(d), weapon: uniqueWeapon(d) ?? null, level: d.level ?? null };
  const out: unknown[] = [];
  if (d.from === 'level') {
    for (let k = 0; k < 4; k++) {
      const it = makeUnique(d.id, 1, uRng);
      if (it) out.push(plain(it));
    }
  } else {
    // (at the level of each floor it may drop on: a boss's at his own; the pool's from UNIQUE_DROPS.pool.from)
    const floors = d.from === 'boss' && d.floor ? [d.floor] : Array.from({ length: 20 }, (_, i) => i + 1).filter((f) => f >= UNIQUE_DROPS.pool.from);
    for (const f of floors) {
      const deep = new Game('warrior', seed);
      deep.depth = f;
      deep.enterDungeon();
      const power = Math.max(1, (deep as unknown as { power: number }).power);
      for (let k = 0; k < 2; k++) {
        const it = makeUnique(d.id, power, uRng);
        if (it) out.push({ ...plain(it), floor: f });
      }
    }
  }
  uPieces[d.id] = out;
}
const chances: Record<string, number[]> = {};
const powers: Record<string, number> = {};
for (let depth = 1; depth <= 20; depth++) {
  const deep = new Game('warrior', seed);
  deep.depth = depth;
  deep.enterDungeon();
  powers[String(depth)] = Math.max(1, (deep as unknown as { power: number }).power);
  chances[String(depth)] = [...rarityChances(powers[String(depth)])];
}
const uniques = { defs: uDefs, pieces: uPieces, tune: UNIQUE_TUNE, drops: UNIQUE_DROPS, rules: UNIQUE_RULES, gamble: TUNE.gambleOdds.unique, chances, powers, loot2: LOOT2 };
tally.push(`uniques: ${Object.keys(uDefs).length}, ${Object.values(uPieces).reduce((n, l) => n + l.length, 0)} pieces made`);
writeFileSync(`${OUT}/items.json`, JSON.stringify({ uniques, pools, byDepth, fullRares, value: VALUE, starter, starters, stats, tune: { ...TUNE }, attr: { ...ATTR_GIVES }, body: body ? { x: body.x, y: body.y } : null, shops, imbue, words, quest, gamble, royal, warriorArms }));
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
// (the tables split, so that Godot holds only what is wanted: tools/godot_loot_split.mjs)
execFileSync('node', ['tools/godot_loot_split.mjs'], { stdio: 'inherit' });
