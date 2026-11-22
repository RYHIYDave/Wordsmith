// THE DAMAGE CHECK'S GEAR (godot/scripts/check_dmg.gd; his words, 22 Nov 2026: “I'd like you to check on damage.  I feel like
// right about the time you get a word in back and in front of your attacks the damage kinda skyrockets.  So can you run, let's
// say a ranger with full dex scaling, optimized gear rolls for poison damage, full damage talent tree points, and words to push
// the poison as far as possible and see how hard it can actually hit in a min/max build.”). Everything a piece of gear can be at
// an item level, by the game's own tables (game/items.ts), for the check to pick the best of:
//   bases     each slot's kinds of base at their best name unlocked at that level, with what is built into them (a weapon's
//             damage and speed, a quiver's critical chance and speed, ...): the best of many rolled
//   options   every word burned into a piece of that slot (imbueOptions: every word, melded and ranked ones too), at the top of
//             its range. A piece holds four properties in all (ITEM_ROOM) and never two of one kind (statGroup); a word burned
//             in rolls in a same-level affix's range times IMBUE_STRENGTH, so the best piece is four words burned into a plain
//             one: a found affix never beats the word of its stat.
//   npx tsx tools/godot_dmg_gear.ts <ilvl> <out.json> [plain]
import { writeFileSync } from 'node:fs';
import { RNG } from '../src/engine/rng';
import { flatPair, flatSpan, imbueOptions, rollItem, statGroup } from '../src/game/items';
import { wordIds } from '../src/game/melds';
import { RANK_OF } from '../src/game/types';
import type { Slot, StatKey, WeaponKind } from '../src/game/types';

const ilvl = Number(process.argv[2] ?? 20);
const out = process.argv[3] ?? 'dmg_gear.json';
const SLOTS: Slot[] = ['mainhand', 'offhand', 'helm', 'chest', 'gloves', 'belt', 'boots', 'amulet', 'ring'];
const WEAPONS: Record<string, WeaponKind> = { warrior: 'greatsword', ranger: 'bow', mage: 'staff', tinkerer: 'wrench' };

type Mod = [StatKey, number];
const implicitOf = (it: { implicit: { stat: StatKey; value: number }[] }): Mod[] => it.implicit.map((m) => [m.stat, m.value]);

// BASES: for each class (its weapon and the off-hand that pairs with it) and each slot, the best of each base name rolled
const bases: Record<string, Record<string, unknown[]>> = {};
for (const [cls, weapon] of Object.entries(WEAPONS)) {
  bases[cls] = {};
  for (const slot of SLOTS) {
    const seen = new Map<string, { name: string; weapon: string | null; offhand: string | null; hands: number; aps: number; implicit: Mod[]; score: number }>();
    for (let seed = 1; seed <= 600; seed++) {
      const it = rollItem(ilvl, new RNG(seed * 7919 + slot.length), { slot, rarity: 0, weapons: [weapon], cls: cls as never, forWeapon: weapon });
      if (slot === 'mainhand' && it.weapon !== weapon) continue;
      if (slot === 'offhand' && it.offhand === null) continue;
      const implicit = implicitOf(it);
      const score = implicit.reduce((n, [, v]) => n + v, 0) + it.aps * 100;
      const was = seen.get(it.baseName);
      if (!was || score > was.score) seen.set(it.baseName, { name: it.baseName, weapon: it.weapon, offhand: it.offhand, hands: it.hands, aps: it.aps, implicit, score });
    }
    bases[cls][slot] = [...seen.values()];
  }
}

// OPTIONS: every word on every slot, at the top of its range
const options: Record<string, { word: string; mods: Mod[]; groups: string[] }[]> = {};
for (const slot of SLOTS) {
  options[slot] = [];
  for (const word of wordIds()) {
    // (THE CLASSES EVENED, as the Godot game has it: loot.gd imbue_options, words.gd EVEN_GEAR_ATTR: a ranked word's Strength,
    // Dexterity or Intelligence on gear is its plain word's; `plain` on the command line for the game's own)
    const rank = (RANK_OF as Record<string, { word: string }>)[word];
    const evenAttr = process.argv[4] !== 'plain';
    const plainOpts = rank ? imbueOptions(rank.word as never, slot, ilvl) : [];
    for (const o0 of imbueOptions(word as never, slot, ilvl)) {
      const o = rank && evenAttr && ['str', 'dex', 'int'].includes(o0.stat) ? (plainOpts.find((p) => p.stat === o0.stat) ?? o0) : o0;
      const one = (stat: StatKey, max: number): Mod[] => {
        const pair = flatPair(stat);
        if (!pair) return [[stat, max]];
        const [lo, hi] = flatSpan(max, max);
        return [[pair.min, lo], [pair.max, hi]];
      };
      const mods = [...one(o.stat, o.max), ...(o.also ? one(o.also.stat, o.also.max) : [])];
      options[slot].push({ word, mods, groups: [statGroup(o.stat), ...(o.also ? [statGroup(o.also.stat)] : [])] });
    }
  }
}

writeFileSync(out, JSON.stringify({ ilvl, bases, options }));
console.log(`dmg gear at item level ${ilvl}: ${SLOTS.map((s) => `${s} ${options[s].length}`).join(', ')} options -> ${out}`);
