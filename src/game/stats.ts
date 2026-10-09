// Turns a hero's class, level, attributes and gear into the numbers the rules use.

import { ATTR_GIVES, CLASSES, TUNE } from './defs';
import { MANA_AS_CDR, itemMods } from './items';
import type { Derived } from './state';
import { EQUIP_SLOTS, STAT_KEYS } from './types';
import type { Attr, ClassId, EquipSlot, Item, Limit, StatMod, Stats } from './types';

export function emptyStats(): Stats {
  const s = {} as Stats;
  for (const k of STAT_KEYS) s[k] = 0;
  return s;
}

export function derive(cls: ClassId, level: number, attrs: Record<Attr, number>, gear: Record<EquipSlot, Item | null>, limit: Limit = 'cooldown', extra: readonly StatMod[] = []): Derived {
  const stats = emptyStats();
  for (const slot of EQUIP_SLOTS) {
    const it = gear[slot];
    if (!it) continue;
    for (const m of itemMods(it)) stats[m.stat] += m.value;
  }
  // (THE SKILL TREES: what the talents taken add, game/talents.ts talentMods; none while TALENTS is off)
  for (const m of extra) stats[m.stat] += m.value;
  const str = attrs.str + stats.str;
  const dex = attrs.dex + stats.dex;
  const int = attrs.int + stats.int;

  const weapon = gear.mainhand;
  // A weapon's own damage arrives through its implicit dmgMin / dmgMax; "adds damage" affixes on
  // other pieces land in the same two stats, so the totals are simply the sums.
  let dmgMin = stats.dmgMin;
  let dmgMax = stats.dmgMax;
  let baseAps = weapon ? weapon.aps : TUNE.unarmedAps;
  if (!weapon) {
    dmgMin += TUNE.unarmedMin;
    dmgMax += TUNE.unarmedMax;
  }
  if (baseAps <= 0) baseAps = TUNE.unarmedAps;
  if (dmgMax < dmgMin) dmgMax = dmgMin;

  const speedPct = stats.atkSpeed + dex * ATTR_GIVES.dexSpeed;
  // (with cooldowns as the limit there is no mana: what gear gives of it quickens cooldowns instead)
  const manaAsCdr = limit === 'cooldown' ? stats.maxMana * MANA_AS_CDR.perMana + stats.manaRegen * MANA_AS_CDR.perRegen : 0;
  const cap = TUNE.resCap;
  return {
    stats,
    str,
    dex,
    int,
    maxLife: Math.round(TUNE.baseLife + TUNE.lifePerLevel * (level - 1) + str * ATTR_GIVES.strLife + stats.maxLife),
    maxMana: Math.round(TUNE.baseMana + int * ATTR_GIVES.intMana + stats.maxMana),
    lifeRegen: TUNE.baseLifeRegen + stats.lifeRegen,
    manaRegen: TUNE.baseManaRegen + int * ATTR_GIVES.intManaRegen + stats.manaRegen,
    dmgMin,
    dmgMax,
    aps: baseAps * (1 + speedPct / 100),
    critChance: TUNE.baseCrit + stats.critChance + dex * ATTR_GIVES.dexCrit,
    critMult: TUNE.baseCritMult + stats.critMult,
    armor: stats.armor,
    resFire: Math.min(cap, stats.fireRes),
    resFrost: Math.min(cap, stats.frostRes),
    resLight: Math.min(cap, stats.lightRes),
    moveSpeed: TUNE.heroSpeed * (1 + stats.moveSpeed / 100),
    cdr: Math.min(0.6, (stats.cdr + manaAsCdr + int * ATTR_GIVES.intCdr) / 100),
    area: 1 + stats.areaPct / 100,
  };
}

/** The value of the class's own attribute (the one its abilities scale with). */
export function primaryValue(cls: ClassId, d: Derived): number {
  const p = CLASSES[cls].primary;
  return p === 'str' ? d.str : p === 'dex' ? d.dex : d.int;
}

/** Fraction of physical damage that armour removes when fighting in dungeon `depth`. */
export function armorReduction(armor: number, depth: number): number {
  if (armor <= 0) return 0;
  return Math.min(0.75, armor / (armor + 40 + 20 * depth));
}
