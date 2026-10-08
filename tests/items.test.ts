// Tests for src/game/items.ts.
//   run: tsx --test tests/items.test.ts
//
// The rules checked here (slots, ranges, weights, the imbue table) are written out again from the
// design brief on purpose rather than imported from items.ts, so a tuning change that breaks a rule
// shows up as a failing test. All randomness is seeded, so results are the same on every run.

// The project type-checks without Node's own type package (tsconfig "types": []), so these two
// imports are untyped. The small interfaces below give back the parts the tests use.
// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { RNG } from '../src/engine/rng';
import {
  ITEM_BASES,
  ITEM_ROOM,
  MANA_AS_CDR,
  STAT_INFO,
  canPair,
  imbueItem,
  imbueOptions,
  imbueOptionsFor,
  imbueProblem,
  itemMods,
  itemRoom,
  itemScore,
  itemValue,
  kindName,
  migrateItem,
  modLines,
  modText,
  plainWeapon,
  rarityChances,
  rarityFor,
  reqLevelFor,
  rollItem,
  setNextUid,
  starterWeapon,
  statView,
} from '../src/game/items';
import { derive } from '../src/game/stats';
import type { ItemBase, RollOpts } from '../src/game/items';
import { CLASS_IDS, EQUIP_SLOTS, ICON_KEYS, SLOTS, STAT_KEYS, WORD_IDS } from '../src/game/types';
import type { Affix, ClassId, EquipSlot, Item, OffhandKind, Rarity, Slot, StatKey, StatMod, WeaponKind, WordId } from '../src/game/types';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  notEqual(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
  notDeepEqual(actual: unknown, expected: unknown, message?: string): void;
  doesNotThrow(fn: () => unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

// ---------------------------------------------------------------------------------------------
// The brief, as data

// Version 12: any character can use any weapon, and five kinds are left. The owner, 4 Oct 2026:
// "I need all weapons to be able to be equipped on all characters"; "boil the melee weapons down to
// just sword"; "slower harder hitting variants is good"; "just a regular bow with a quiver off hand
// works fine"; "lets have the warrior start with the two handed sword".
const STARTS: Record<ClassId, WeaponKind> = { warrior: 'greatsword', ranger: 'bow', mage: 'staff' };
const WEAPON_KINDS: WeaponKind[] = ['sword', 'greatsword', 'bow', 'wand', 'staff'];
const APS: Record<WeaponKind, number> = { sword: 1.3, greatsword: 1.05, bow: 1.4, wand: 1.5, staff: 1.0 };
const HANDS: Record<WeaponKind, 1 | 2> = { sword: 1, wand: 1, greatsword: 2, bow: 2, staff: 2 };
/** What each weapon was until Version 12 turned it into another: a saved item of the old kind becomes the new. */
const OLD_KINDS: Record<string, WeaponKind> = { axe: 'sword', mace: 'sword', maul: 'greatsword', longbow: 'bow' };
/**
 * The "within 10%" damage-per-second rule holds inside each of these groups. Bows are two-handed but
 * still take a quiver, so they are balanced like one-handers and form a group of their own.
 */
const DPS_GROUPS: Record<string, WeaponKind[]> = {
  'one-handed': ['sword', 'wand'],
  'two-handed without an off-hand': ['greatsword', 'staff'],
  'bows': ['bow'],
};

const OFFHAND_KINDS: OffhandKind[] = ['shield', 'quiver', 'focus'];
/** The main-hand weapons each off-hand kind can be worn with. */
const PAIRS: Record<OffhandKind, WeaponKind[]> = { shield: ['sword'], quiver: ['bow'], focus: ['wand'] };

const SLOT_WEIGHTS: Record<Slot, number> = { mainhand: 18, offhand: 9, chest: 12, helm: 11, gloves: 11, belt: 9, boots: 11, ring: 12, amulet: 7 };
const RARITIES: Rarity[] = [0, 1, 2];

const EVERY_SLOT: Slot[] = ['mainhand', 'offhand', 'helm', 'chest', 'gloves', 'belt', 'boots', 'amulet', 'ring'];
const NOT_MAINHAND: Slot[] = ['offhand', 'helm', 'chest', 'gloves', 'belt', 'boots', 'amulet', 'ring'];
const OFFENCE: Slot[] = ['mainhand', 'gloves', 'ring', 'amulet'];
const OFFENCE_AND_OFFHAND: Slot[] = ['mainhand', 'gloves', 'ring', 'amulet', 'offhand'];
const REGEN: Slot[] = ['helm', 'chest', 'ring', 'amulet', 'offhand', 'belt'];
const FIND: Slot[] = ['helm', 'boots', 'ring', 'amulet', 'belt'];

interface AffixSpec {
  kind: 'prefix' | 'suffix';
  slots: Slot[];
  /** [low, high] at item level 1 and at item level 15. */
  at1: [number, number];
  at15: [number, number];
}
/** 'damage' is the one affix with two mods (dmgMin + dmgMax); its size is checked separately. */
const AFFIX_SPEC: Record<string, AffixSpec> = {
  maxLife: { kind: 'prefix', slots: NOT_MAINHAND, at1: [8, 15], at15: [50, 80] },
  maxMana: { kind: 'prefix', slots: NOT_MAINHAND, at1: [6, 12], at15: [35, 60] },
  armor: { kind: 'prefix', slots: ['helm', 'chest', 'gloves', 'boots', 'offhand', 'belt'], at1: [4, 8], at15: [40, 70] },
  dmgPct: { kind: 'prefix', slots: OFFENCE_AND_OFFHAND, at1: [6, 12], at15: [25, 45] },
  damage: { kind: 'prefix', slots: OFFENCE, at1: [0, 0], at15: [0, 0] },
  physPct: { kind: 'prefix', slots: OFFENCE, at1: [6, 12], at15: [25, 45] },
  firePct: { kind: 'prefix', slots: OFFENCE_AND_OFFHAND, at1: [6, 12], at15: [25, 45] },
  frostPct: { kind: 'prefix', slots: OFFENCE_AND_OFFHAND, at1: [6, 12], at15: [25, 45] },
  lightPct: { kind: 'prefix', slots: OFFENCE_AND_OFFHAND, at1: [6, 12], at15: [25, 45] },
  str: { kind: 'suffix', slots: EVERY_SLOT, at1: [2, 5], at15: [10, 18] },
  dex: { kind: 'suffix', slots: EVERY_SLOT, at1: [2, 5], at15: [10, 18] },
  int: { kind: 'suffix', slots: EVERY_SLOT, at1: [2, 5], at15: [10, 18] },
  atkSpeed: { kind: 'suffix', slots: ['mainhand', 'gloves', 'ring'], at1: [4, 7], at15: [10, 18] },
  critChance: { kind: 'suffix', slots: OFFENCE_AND_OFFHAND, at1: [2, 4], at15: [6, 10] },
  critMult: { kind: 'suffix', slots: ['mainhand', 'amulet'], at1: [10, 18], at15: [30, 50] },
  moveSpeed: { kind: 'suffix', slots: ['boots'], at1: [5, 8], at15: [12, 20] },
  lifeRegen: { kind: 'suffix', slots: REGEN, at1: [0.3, 0.6], at15: [2, 4] },
  manaRegen: { kind: 'suffix', slots: REGEN, at1: [0.3, 0.6], at15: [2, 4] },
  lifeOnHit: { kind: 'suffix', slots: ['mainhand', 'ring', 'gloves'], at1: [0.5, 1], at15: [3, 5] },
  lifeOnKill: { kind: 'suffix', slots: ['mainhand', 'ring', 'amulet'], at1: [2, 4], at15: [10, 18] },
  cdr: { kind: 'suffix', slots: ['helm', 'amulet', 'offhand'], at1: [3, 5], at15: [8, 14] },
  areaPct: { kind: 'suffix', slots: ['mainhand', 'amulet'], at1: [5, 9], at15: [15, 25] },
  fireRes: { kind: 'suffix', slots: NOT_MAINHAND, at1: [8, 14], at15: [25, 40] },
  frostRes: { kind: 'suffix', slots: NOT_MAINHAND, at1: [8, 14], at15: [25, 40] },
  lightRes: { kind: 'suffix', slots: NOT_MAINHAND, at1: [8, 14], at15: [25, 40] },
  goldFind: { kind: 'suffix', slots: FIND, at1: [8, 15], at15: [30, 50] },
  magicFind: { kind: 'suffix', slots: FIND, at1: [8, 15], at15: [30, 50] },
};
/** Everything the two newest slots may roll, as listed in the brief ('damage' is "Adds X-Y Damage"). */
const OFFHAND_AFFIXES = ['maxLife', 'maxMana', 'armor', 'str', 'dex', 'int', 'fireRes', 'frostRes', 'lightRes', 'critChance', 'dmgPct', 'firePct', 'frostPct', 'lightPct', 'cdr', 'lifeRegen', 'manaRegen'];
const BELT_AFFIXES = ['maxLife', 'maxMana', 'armor', 'str', 'dex', 'int', 'fireRes', 'frostRes', 'lightRes', 'lifeRegen', 'manaRegen', 'goldFind', 'magicFind'];
/** The only stats that keep a decimal. */
const ONE_DECIMAL: StatKey[] = ['lifeRegen', 'manaRegen', 'lifeOnHit'];

type ImbuePick = ['prefix' | 'suffix', StatKey];
function expectedImbue(word: WordId, slot: Slot): ImbuePick[] {
  // main hand, gloves, ring and amulet get the offensive version of a word;
  // off-hand, helm, chest, belt and boots the protective one (boots differ for 'swift' only)
  const offence = OFFENCE.includes(slot);
  const element = (damage: StatKey, resistance: StatKey): ImbuePick[] => {
    if (slot === 'mainhand') return [['prefix', damage]];
    return offence ? [['prefix', damage], ['suffix', resistance]] : [['suffix', resistance]];
  };
  switch (word) {
    case 'power':
      return offence ? [['prefix', 'physPct'], ['suffix', 'str']] : [['prefix', 'armor'], ['suffix', 'str']];
    case 'swift':
      if (offence) return [['prefix', 'atkSpeed'], ['suffix', 'dex']];
      return slot === 'boots' ? [['prefix', 'moveSpeed'], ['suffix', 'dex']] : [['prefix', 'cdr'], ['suffix', 'dex']];
    case 'twin':
      return offence ? [['prefix', 'critChance'], ['suffix', 'dex']] : [['prefix', 'critMult'], ['suffix', 'dex']];
    case 'fire':
      return element('firePct', 'fireRes');
    case 'frost':
      return element('frostPct', 'frostRes');
    case 'lightning':
      return element('lightPct', 'lightRes');
    case 'leech':
      return offence ? [['prefix', 'lifeOnHit'], ['suffix', 'lifeOnKill']] : [['prefix', 'maxLife'], ['suffix', 'lifeRegen']];
    case 'volatile':
      return offence ? [['prefix', 'areaPct'], ['suffix', 'int']] : [['prefix', 'maxMana'], ['suffix', 'int']];
    case 'poison':
      return offence ? [['prefix', 'dmgPct'], ['suffix', 'dex']] : [['prefix', 'maxLife'], ['suffix', 'dex']];
  }
}

// ---------------------------------------------------------------------------------------------
// Helpers

const BASE_BY_ID = new Map<string, ItemBase>(ITEM_BASES.map((b): [string, ItemBase] => [b.id, b]));

function baseOf(item: Item): ItemBase {
  const base = BASE_BY_ID.get(item.baseId);
  assert.ok(base, `unknown base id ${item.baseId}`);
  return base as ItemBase;
}

/** 'life3' -> 'life'. */
function familyOf(a: Affix): string {
  return a.id.replace(/\d+$/, '');
}

/** Which row of AFFIX_SPEC an affix belongs to. */
function specKey(a: Affix): string {
  const stats = a.mods.map((m) => m.stat);
  if (stats.length === 2 && stats[0] === 'dmgMin' && stats[1] === 'dmgMax') return 'damage';
  assert.equal(stats.length, 1, `affix ${a.id} should have one mod, or the dmgMin + dmgMax pair`);
  return stats[0];
}

function expectedTier(ilvl: number): number {
  return ilvl <= 3 ? 1 : ilvl <= 7 ? 2 : ilvl <= 12 ? 3 : 4;
}

function valueOf(mods: readonly StatMod[], stat: StatKey): number {
  const found = mods.find((m) => m.stat === stat);
  assert.ok(found, `missing ${stat}`);
  return (found as StatMod).value;
}

function averageHit(mods: readonly StatMod[]): number {
  return (valueOf(mods, 'dmgMin') + valueOf(mods, 'dmgMax')) / 2;
}

/** The brief's sword curve: 5.5 at level 1, plus 22% of that per level. */
function swordHit(ilvl: number): number {
  return 5.5 * (1 + 0.22 * (ilvl - 1));
}

function decimalsOk(stat: StatKey, value: number): boolean {
  const scaled = ONE_DECIMAL.includes(stat) ? value * 10 : value;
  return Math.abs(scaled - Math.round(scaled)) < 1e-9;
}

function mean(values: readonly number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function near(actual: number, expected: number, tolerance: number, what: string): void {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${what}: got ${actual.toFixed(4)}, expected ${expected.toFixed(4)} +/- ${tolerance}`);
}

function withoutUid(item: Item): Omit<Item, 'uid'> {
  const { uid: _uid, ...rest } = item;
  return rest;
}

/** Bases grouped by kind ('sword', 'plate', ...), each list ordered weakest name first. */
function baseKinds(): Map<string, ItemBase[]> {
  const kinds = new Map<string, ItemBase[]>();
  for (const b of ITEM_BASES) {
    const kind = b.id.replace(/\d+$/, '');
    const list = kinds.get(kind) ?? [];
    list.push(b);
    kinds.set(kind, list);
  }
  for (const list of kinds.values()) list.sort((a, b) => a.minIlvl - b.minIlvl);
  return kinds;
}

/** Every rule a single generated item must obey. */
function checkItem(item: Item, ilvl: number, slot: Slot, rarity: Rarity): void {
  const where = `${item.name} (ilvl ${ilvl}, ${slot}, rarity ${rarity})`;
  assert.equal(item.slot, slot, where);
  assert.equal(item.rarity, rarity, where);
  assert.equal(item.ilvl, ilvl, where);
  assert.ok(Number.isInteger(item.uid) && item.uid >= 1, `${where}: uid`);
  assert.deepEqual(item.imbues, [], where);

  const base = baseOf(item);
  assert.equal(base.slot, slot, where);
  assert.ok(base.minIlvl <= ilvl, `${where}: base ${base.id} needs ilvl ${base.minIlvl}`);
  assert.equal(item.baseName, base.name, where);
  assert.equal(item.icon, base.icon, where);
  assert.deepEqual(item.implicit, base.implicit(ilvl), where);
  assert.ok(item.implicit.length > 0, `${where}: no implicit`);

  // what kind of piece it is: copied from the base, plus the level needed to equip it
  assert.equal(item.weapon, base.weapon, where);
  assert.equal(item.offhand, base.offhand, where);
  assert.equal(item.hands, base.hands, where);
  assert.equal(item.aps, base.aps, where);
  assert.equal(item.cls, base.cls, where);
  assert.equal(item.reqLevel, Math.max(1, ilvl), where);
  if (slot === 'mainhand') {
    const kind = item.weapon as WeaponKind;
    assert.ok(WEAPON_KINDS.includes(kind), where);
    assert.equal(item.offhand, null, where);
    assert.equal(item.hands, HANDS[kind], where);
    assert.equal(item.aps, APS[kind], where);
    assert.ok(item.aps > 0, where);
    assert.equal(item.cls, null, `${where}: no weapon is one class's own`);
    const min = valueOf(item.implicit, 'dmgMin');
    const max = valueOf(item.implicit, 'dmgMax');
    assert.ok(min >= 1 && min < max, `${where}: damage ${min}-${max}`);
  } else if (slot === 'offhand') {
    const kind = item.offhand as OffhandKind;
    assert.ok(OFFHAND_KINDS.includes(kind), where);
    assert.equal(item.weapon, null, where);
    assert.equal(item.hands, 0, where);
    assert.equal(item.aps, 0, where);
    assert.equal(item.cls, null, `${where}: nor any off-hand piece`);
    assert.equal(item.icon, kind, where);
  } else {
    assert.equal(item.weapon, null, where);
    assert.equal(item.offhand, null, where);
    assert.equal(item.hands, 0, where);
    assert.equal(item.aps, 0, where);
    assert.equal(item.cls, null, where);
  }

  // how many affixes
  const prefixes = item.affixes.filter((a) => a.kind === 'prefix').length;
  const suffixes = item.affixes.filter((a) => a.kind === 'suffix').length;
  assert.equal(prefixes + suffixes, item.affixes.length, where);
  if (rarity === 0) assert.equal(item.affixes.length, 0, where);
  if (rarity === 1) {
    assert.ok(item.affixes.length >= 1 && item.affixes.length <= 2, `${where}: ${item.affixes.length} affixes`);
    assert.ok(prefixes <= 1 && suffixes <= 1, `${where}: ${prefixes} prefixes, ${suffixes} suffixes`);
  }
  if (rarity === 2) {
    assert.ok(item.affixes.length >= 3 && item.affixes.length <= 4, `${where}: ${item.affixes.length} affixes`);
    assert.ok(prefixes <= 2 && suffixes <= 2, `${where}: ${prefixes} prefixes, ${suffixes} suffixes`);
  }

  // no family twice, and no stat granted by two affixes
  const families = item.affixes.map(familyOf);
  assert.equal(new Set(families).size, families.length, `${where}: duplicate family in ${families.join(',')}`);
  const keys = item.affixes.map(specKey);
  assert.equal(new Set(keys).size, keys.length, `${where}: duplicate stat in ${keys.join(',')}`);

  // each affix
  for (const a of item.affixes) {
    const spec = AFFIX_SPEC[specKey(a)];
    assert.ok(spec, `${where}: affix ${a.id} grants a stat no affix should`);
    assert.equal(a.kind, spec.kind, `${where}: ${a.id}`);
    assert.ok(spec.slots.includes(slot), `${where}: ${a.id} is not allowed on ${slot}`);
    assert.equal(a.tier, expectedTier(ilvl), `${where}: ${a.id}`);
    assert.equal(a.id, `${familyOf(a)}${a.tier}`, where);
    assert.ok(/^[a-z]+[1-4]$/.test(a.id), `${where}: id ${a.id}`);
    assert.ok(a.label.length > 0, `${where}: ${a.id} has no label`);
    assert.equal(a.label.startsWith('of '), a.kind === 'suffix', `${where}: label "${a.label}"`);
    if (specKey(a) === 'damage') assert.ok(a.mods[0].value >= 1 && a.mods[0].value < a.mods[1].value, `${where}: ${a.id}`);
  }

  // every number on the item
  for (const m of itemMods(item)) {
    assert.ok(m.value > 0, `${where}: ${m.stat} = ${m.value}`);
    assert.ok(decimalsOk(m.stat, m.value), `${where}: ${m.stat} = ${m.value} has too many decimals`);
    assert.ok(modText(m, 'cooldown').length > 0 && modText(m, 'mana').length > 0, where);
  }

  // name
  assert.ok(item.name.length > 0 && item.name === item.name.trim(), where);
  if (rarity === 0) assert.equal(item.name, base.name, where);
  if (rarity === 1) {
    const prefix = item.affixes.find((a) => a.kind === 'prefix');
    const suffix = item.affixes.find((a) => a.kind === 'suffix');
    const expected = [prefix ? prefix.label : '', base.name, suffix ? suffix.label : ''].filter((s) => s !== '').join(' ');
    assert.equal(item.name, expected, where);
  }
  if (rarity === 2) {
    assert.equal(item.name.split(' ').length, 2, `${where}: a Rare name is two words`);
    assert.notEqual(item.name, base.name, where);
  }

  // price and score
  const value = itemValue(item);
  assert.ok(Number.isInteger(value) && value >= 1, `${where}: value ${value}`);
  for (const cls of CLASS_IDS) {
    const score = itemScore(item, cls);
    assert.ok(Number.isFinite(score) && score > 0, `${where}: score ${score} for ${cls}`);
  }
}

// ---------------------------------------------------------------------------------------------
// Text

test('modText gives a readable line for every stat', () => {
  for (const limit of ['cooldown', 'mana'] as const) {
    assert.equal(modText({ stat: 'atkSpeed', value: 12 }, limit), '+12% Attack Speed');
    assert.equal(modText({ stat: 'str', value: 8 }, limit), '+8 Strength');
    assert.equal(modText({ stat: 'lifeRegen', value: 0.6 }, limit), '+0.6 Life Regen');
    assert.equal(modText({ stat: 'moveSpeed', value: -5 }, limit), '-5% Movement Speed');
  }
  for (const stat of STAT_KEYS) {
    const info = STAT_INFO[stat];
    assert.ok(info && info.label.length > 0, `${stat} has no label`);
    assert.ok(info.dp === 0 || info.dp === 1, `${stat} decimals`);
    assert.equal(info.dp === 1, ONE_DECIMAL.includes(stat), `${stat} decimals`);
    for (const limit of ['cooldown', 'mana'] as const) {
      const view = statView(stat, limit);
      for (const value of [0, 3, 12.5, -4]) {
        const text = modText({ stat, value }, limit);
        assert.ok(text.length > 0, `${stat} gives empty text`);
        assert.ok(text.endsWith(view.label), `${stat}: "${text}"`);
        assert.equal(text.includes('%'), view.pct, `${stat}: "${text}"`);
        assert.equal(text.charAt(0), value < 0 !== view.less ? '-' : '+', `${stat}: "${text}"`);
      }
    }
  }
  assert.equal(Object.keys(STAT_INFO).length, STAT_KEYS.length);
});

test("no dead lines on gear: each limit's idle stat does the other's work, and says so", () => {
  // with cooldowns there is no mana: mana on gear quickens cooldowns instead
  assert.equal(modText({ stat: 'maxMana', value: 12 }, 'cooldown'), '+1.2% Cooldown Recovery');
  assert.equal(modText({ stat: 'manaRegen', value: 0.6 }, 'cooldown'), '+1.2% Cooldown Recovery');
  assert.equal(modText({ stat: 'cdr', value: 5 }, 'cooldown'), '+5% Cooldown Recovery');
  // with mana there are no cooldowns: cooldown recovery makes abilities cheaper instead
  assert.equal(modText({ stat: 'maxMana', value: 12 }, 'mana'), '+12 Max Mana');
  assert.equal(modText({ stat: 'manaRegen', value: 0.6 }, 'mana'), '+0.6 Mana Regen');
  assert.equal(modText({ stat: 'cdr', value: 5 }, 'mana'), '-5% Mana Cost');
  for (const stat of STAT_KEYS) {
    for (const limit of ['cooldown', 'mana'] as const) {
      const label = statView(stat, limit).label;
      assert.ok(limit === 'mana' || !/mana/i.test(label), `${stat} speaks of mana where there is none: "${label}"`);
      assert.ok(limit === 'cooldown' || !/cooldown/i.test(label), `${stat} speaks of cooldowns where there are none: "${label}"`);
    }
  }
  // and the sums agree with the words
  const gear = {} as Record<EquipSlot, Item | null>;
  for (const slot of EQUIP_SLOTS) gear[slot] = null;
  const bare = derive('mage', 1, { str: 6, dex: 8, int: 14 }, gear, 'cooldown');
  const robe = rollItem(10, new RNG(5), { slot: 'chest', rarity: 0 });
  robe.implicit = [{ stat: 'maxMana', value: 30 }, { stat: 'manaRegen', value: 1 }];
  robe.affixes = [];
  gear.chest = robe;
  const worn = derive('mage', 1, { str: 6, dex: 8, int: 14 }, gear, 'cooldown');
  assert.ok(Math.abs(worn.cdr - bare.cdr - (30 * MANA_AS_CDR.perMana + 1 * MANA_AS_CDR.perRegen) / 100) < 1e-9, 'mana on gear quickens cooldowns');
  const inMana = derive('mage', 1, { str: 6, dex: 8, int: 14 }, gear, 'mana');
  assert.ok(Math.abs(inMana.cdr - bare.cdr) < 1e-9, 'but not where there is mana to have');
  assert.equal(inMana.maxMana, bare.maxMana + 30);
});

test('modLines merges a damage pair into one line', () => {
  assert.deepEqual(modLines([], 'cooldown'), []);
  assert.deepEqual(modLines([{ stat: 'dmgMin', value: 3 }, { stat: 'dmgMax', value: 7 }], 'cooldown'), ['Adds 3-7 Damage']);
  assert.deepEqual(
    modLines([{ stat: 'str', value: 8 }, { stat: 'dmgMin', value: 3 }, { stat: 'dmgMax', value: 7 }, { stat: 'atkSpeed', value: 12 }], 'cooldown'),
    ['+8 Strength', 'Adds 3-7 Damage', '+12% Attack Speed'],
  );
  // the pair need not be adjacent or in order
  assert.deepEqual(modLines([{ stat: 'dmgMax', value: 9 }, { stat: 'int', value: 2 }, { stat: 'dmgMin', value: 4 }], 'cooldown'), ['Adds 4-9 Damage', '+2 Intelligence']);
  // two pairs (a weapon's own damage plus an "adds damage" affix) stay two lines
  assert.deepEqual(
    modLines([{ stat: 'dmgMin', value: 4 }, { stat: 'dmgMax', value: 7 }, { stat: 'dmgMin', value: 1 }, { stat: 'dmgMax', value: 2 }], 'cooldown'),
    ['Adds 4-7 Damage', 'Adds 1-2 Damage'],
  );
  // half a pair is shown on its own
  assert.deepEqual(modLines([{ stat: 'dmgMin', value: 3 }], 'cooldown'), ['+3 Minimum Damage']);
  assert.deepEqual(modLines([{ stat: 'dmgMax', value: 7 }, { stat: 'dex', value: 1 }], 'cooldown'), ['+7 Maximum Damage', '+1 Dexterity']);
});

// ---------------------------------------------------------------------------------------------
// Bases

test('ITEM_BASES: ids, slots, icons, classes and speeds are consistent', () => {
  assert.equal(new Set(ITEM_BASES.map((b) => b.id)).size, ITEM_BASES.length, 'base ids must be unique');
  assert.equal(new Set(ITEM_BASES.map((b) => b.name)).size, ITEM_BASES.length, 'base names must be unique');
  for (const b of ITEM_BASES) {
    assert.ok(SLOTS.includes(b.slot), b.id);
    assert.ok(ICON_KEYS.includes(b.icon), b.id);
    assert.ok(b.name.length > 0, b.id);
    if (b.slot === 'mainhand') {
      const kind = b.weapon as WeaponKind;
      assert.ok(WEAPON_KINDS.includes(kind), b.id);
      assert.equal(b.icon, kind, b.id);
      assert.equal(b.aps, APS[kind], b.id);
      assert.equal(b.hands, HANDS[kind], b.id);
      assert.equal(b.offhand, null, b.id);
      assert.equal(b.cls, null, b.id);
    } else if (b.slot === 'offhand') {
      const kind = b.offhand as OffhandKind;
      assert.ok(OFFHAND_KINDS.includes(kind), b.id);
      assert.equal(b.icon, kind, b.id);
      assert.equal(b.cls, null, b.id);
      assert.equal(b.weapon, null, b.id);
      assert.equal(b.hands, 0, b.id);
      assert.equal(b.aps, 0, b.id);
    } else {
      assert.equal(b.weapon, null, b.id);
      assert.equal(b.offhand, null, b.id);
      assert.equal(b.hands, 0, b.id);
      assert.equal(b.cls, null, b.id);
      assert.equal(b.aps, 0, b.id);
    }
  }
  // every weapon and off-hand kind exists, and the icons the brief names appear on the right slots
  for (const kind of WEAPON_KINDS) assert.ok(ITEM_BASES.some((b) => b.weapon === kind), kind);
  for (const kind of OFFHAND_KINDS) assert.ok(ITEM_BASES.some((b) => b.offhand === kind), kind);
  for (const slot of SLOTS) assert.ok(ITEM_BASES.some((b) => b.slot === slot && b.minIlvl === 1), `no ilvl-1 base for ${slot}`);
  const icons = (slot: Slot): string[] => [...new Set(ITEM_BASES.filter((b) => b.slot === slot).map((b) => b.icon))].sort();
  assert.deepEqual(icons('mainhand'), [...WEAPON_KINDS].sort());
  assert.deepEqual(icons('offhand'), ['focus', 'quiver', 'shield']);
  assert.deepEqual(icons('helm'), ['helm', 'hood']);
  assert.deepEqual(icons('chest'), ['armor', 'robe']);
  assert.deepEqual(icons('gloves'), ['gloves']);
  assert.deepEqual(icons('belt'), ['belt']);
  assert.deepEqual(icons('boots'), ['boots']);
  assert.deepEqual(icons('ring'), ['ring']);
  assert.deepEqual(icons('amulet'), ['amulet']);
});

test('ITEM_BASES: every kind has three names unlocking at ilvl 1, 5 and 10, each stronger than the last', () => {
  const kinds = baseKinds();
  // 5 weapon kinds (since Version 12), 3 off-hand kinds, and 18 kinds of gear
  assert.ok(kinds.size >= 5 + 3 + 18, `expected at least 26 kinds, got ${kinds.size}`);
  const strength = (b: ItemBase, ilvl: number): number => b.implicit(ilvl).reduce((sum, m) => sum + m.value, 0);
  for (const [kind, tiers] of kinds) {
    assert.deepEqual(tiers.map((b) => b.minIlvl), [1, 5, 10], kind);
    assert.deepEqual(tiers.map((b) => b.id), [`${kind}1`, `${kind}2`, `${kind}3`], kind);
    assert.equal(new Set(tiers.map((b) => b.slot)).size, 1, kind);
    for (let ilvl = 1; ilvl <= 30; ilvl++) {
      for (const b of tiers) {
        const mods = b.implicit(ilvl);
        assert.ok(mods.length > 0, `${b.id} has no implicit at ilvl ${ilvl}`);
        for (const m of mods) assert.ok(m.value > 0 && decimalsOk(m.stat, m.value), `${b.id} ilvl ${ilvl}: ${m.stat} = ${m.value}`);
        // the same stats at every level, and never weaker at a higher level
        assert.deepEqual(mods.map((m) => m.stat), b.implicit(1).map((m) => m.stat), b.id);
        if (ilvl > 1) assert.ok(strength(b, ilvl) >= strength(b, ilvl - 1), `${b.id} gets weaker at ilvl ${ilvl}`);
      }
      // a later name is strictly stronger than an earlier one at the same item level
      if (ilvl >= 5) assert.ok(strength(tiers[1], ilvl) > strength(tiers[0], ilvl), `${kind} tier 2 vs 1 at ilvl ${ilvl}`);
      if (ilvl >= 10) assert.ok(strength(tiers[2], ilvl) > strength(tiers[1], ilvl), `${kind} tier 3 vs 2 at ilvl ${ilvl}`);
    }
  }
});

test('weapon damage: sword curve, min about 70% of max, extra implicits', () => {
  const kinds = baseKinds();
  const sword = (kinds.get('sword') as ItemBase[])[0];
  near(averageHit(sword.implicit(1)), 5.5, 0.001, 'plain sword at ilvl 1');
  for (let ilvl = 1; ilvl <= 30; ilvl++) {
    near(averageHit(sword.implicit(ilvl)), swordHit(ilvl), 0.26, `plain sword at ilvl ${ilvl}`);
  }
  for (const b of ITEM_BASES.filter((x) => x.slot === 'mainhand')) {
    for (let ilvl = 1; ilvl <= 30; ilvl++) {
      const mods = b.implicit(ilvl);
      const min = valueOf(mods, 'dmgMin');
      const max = valueOf(mods, 'dmgMax');
      assert.ok(Number.isInteger(min) && Number.isInteger(max) && min >= 1 && min < max, `${b.id} ilvl ${ilvl}: ${min}-${max}`);
      const ratio = min / max;
      assert.ok(ratio >= 0.55 && ratio <= 0.85, `${b.id} ilvl ${ilvl}: min/max ${ratio.toFixed(2)}`);
      if (ilvl >= 10) assert.ok(ratio >= 0.64 && ratio <= 0.76, `${b.id} ilvl ${ilvl}: min/max ${ratio.toFixed(2)}`);
    }
  }
  // the two kinds with something extra built in
  for (const b of kinds.get('wand') as ItemBase[]) assert.ok(valueOf(b.implicit(10), 'critChance') > 0, b.id);
  for (const b of kinds.get('staff') as ItemBase[]) assert.ok(valueOf(b.implicit(10), 'maxMana') > 0, b.id);
  // "slower harder hitting variants": the two-handed variant of each out-hits its one-handed
  // kind, and both out-hit every one-hander and the bow, at every item level and name tier
  for (const tier of [0, 1, 2]) {
    for (let ilvl = [1, 5, 10][tier]; ilvl <= 30; ilvl++) {
      const hit = (kind: WeaponKind): number => averageHit((kinds.get(kind) as ItemBase[])[tier].implicit(ilvl));
      const where = `tier ${tier + 1} at ilvl ${ilvl}`;
      assert.ok(hit('greatsword') > hit('sword'), `${where}: greatsword > sword per hit`);
      assert.ok(hit('staff') > hit('wand'), `${where}: staff > wand per hit`);
      for (const big of DPS_GROUPS['two-handed without an off-hand']) {
        for (const kind of [...DPS_GROUPS['one-handed'], ...DPS_GROUPS['bows']]) assert.ok(hit(big) > hit(kind), `${where}: ${big} should out-hit ${kind}`);
      }
    }
  }
  // bows did not change when the two-handers arrived (they still get a quiver on top)
  const range = (id: string, ilvl: number): number[] => {
    const mods = (ITEM_BASES.find((b) => b.id === id) as ItemBase).implicit(ilvl);
    return [valueOf(mods, 'dmgMin'), valueOf(mods, 'dmgMax')];
  };
  assert.deepEqual([range('bow1', 1), range('bow1', 10), range('bow1', 30), range('bow3', 30)], [[4, 6], [12, 18], [31, 44], [33, 48]]);
});

test('weapon damage per second: within 10% inside each hands group, two-handers about 1.30x a sword, staves about 1.25x a wand', () => {
  const kinds = baseKinds();
  // every weapon kind belongs to exactly one group
  assert.deepEqual(Object.values(DPS_GROUPS).flat().sort(), [...WEAPON_KINDS].sort());
  for (const tier of [0, 1, 2]) {
    for (let ilvl = [1, 5, 10][tier]; ilvl <= 30; ilvl++) {
      const where = `tier ${tier + 1} at ilvl ${ilvl}`;
      const dps = (kind: WeaponKind): number => {
        const base = (kinds.get(kind) as ItemBase[])[tier];
        return averageHit(base.implicit(ilvl)) * base.aps;
      };
      for (const [group, members] of Object.entries(DPS_GROUPS)) {
        const all = members.map(dps);
        const spread = Math.max(...all) / Math.min(...all);
        assert.ok(spread <= 1.1, `${group}, ${where}: dps spread ${spread.toFixed(3)}`);
      }
      // a two-hander gives up the off-hand and is paid in damage; whole-number damage makes the
      // ratio wobble at low levels, so the band is tighter from ilvl 10 on
      const settled = ilvl >= 10;
      for (const kind of ['greatsword'] as const) {
        const ratio = dps(kind) / dps('sword');
        assert.ok(ratio >= (settled ? 1.25 : 1.2) && ratio <= (settled ? 1.35 : 1.4), `${where}: ${kind} is ${ratio.toFixed(3)}x a sword`);
      }
      const staff = dps('staff') / dps('wand');
      assert.ok(staff >= (settled ? 1.2 : 1.15) && staff <= (settled ? 1.3 : 1.35), `${where}: staff is ${staff.toFixed(3)}x a wand`);
      // bows get a quiver, so they stay level with the one-handers
      for (const kind of DPS_GROUPS['bows']) {
        const ratio = dps(kind) / dps('sword');
        assert.ok(ratio >= 0.93 && ratio <= 1.07, `${where}: ${kind} is ${ratio.toFixed(3)}x a sword`);
      }
    }
  }
  // A better name of the same kind is only a little stronger.
  for (const kind of WEAPON_KINDS) {
    const tiers = kinds.get(kind) as ItemBase[];
    for (let ilvl = 10; ilvl <= 30; ilvl++) {
      const ratio = averageHit(tiers[2].implicit(ilvl)) / averageHit(tiers[0].implicit(ilvl));
      assert.ok(ratio > 1 && ratio <= 1.12, `${kind} at ilvl ${ilvl}: third name is ${ratio.toFixed(3)}x the first`);
    }
  }
});

test('off-hand and belt bases carry the built-in bonuses the brief names', () => {
  const kinds = baseKinds();
  const stats = (b: ItemBase): StatKey[] => b.implicit(12).map((m) => m.stat);
  for (let ilvl = 1; ilvl <= 30; ilvl++) {
    for (const tier of [0, 1, 2].filter((t) => [1, 5, 10][t] <= ilvl)) {
      const where = `tier ${tier + 1} at ilvl ${ilvl}`;
      const implicit = (kind: string): StatMod[] => (kinds.get(kind) as ItemBase[])[tier].implicit(ilvl);
      // shield: armour (large: more than a helm of the same tier) plus life
      assert.deepEqual(implicit('shield').map((m) => m.stat), ['armor', 'maxLife'], where);
      assert.ok(valueOf(implicit('shield'), 'armor') > valueOf(implicit('helm'), 'armor'), `${where}: shield armour should beat a helm's`);
      // quiver: critical chance plus a little attack speed
      assert.deepEqual(implicit('quiver').map((m) => m.stat), ['critChance', 'atkSpeed'], where);
      assert.ok(valueOf(implicit('quiver'), 'atkSpeed') < valueOf(implicit('quiver'), 'critChance'), `${where}: quiver attack speed should be the smaller bonus`);
      // focus: mana plus a little cooldown recovery
      assert.deepEqual(implicit('focus').map((m) => m.stat), ['maxMana', 'cdr'], where);
      assert.ok(valueOf(implicit('focus'), 'cdr') <= 5, `${where}: focus cooldown recovery should stay small`);
    }
  }
  // belts: one for life, one for armour, one for mana
  const belts = [...kinds.values()].filter((tiers) => tiers[0].slot === 'belt');
  assert.equal(belts.length, 3);
  assert.deepEqual(belts.map((tiers) => stats(tiers[0]).join('+')).sort(), ['armor', 'maxLife', 'maxMana']);
  for (const tiers of belts) for (const b of tiers) assert.deepEqual([b.icon, b.cls, stats(b).length], ['belt', null, 1], b.id);
  // the spec tables above agree with the brief's lists for the two newest slots
  const allowedOn = (slot: Slot): string[] => Object.keys(AFFIX_SPEC).filter((key) => AFFIX_SPEC[key].slots.includes(slot)).sort();
  assert.deepEqual(allowedOn('offhand'), [...OFFHAND_AFFIXES].sort());
  assert.deepEqual(allowedOn('belt'), [...BELT_AFFIXES].sort());
  assert.deepEqual([...EVERY_SLOT].sort(), [...SLOTS].sort());
});

// ---------------------------------------------------------------------------------------------
// rollItem

test('rollItem never throws and obeys every rule: ilvl 1-30 x every slot x rarities 0-2 x 50 seeds', () => {
  assert.equal(SLOTS.length, 9);
  let count = 0;
  for (let ilvl = 1; ilvl <= 30; ilvl++) {
    for (const slot of SLOTS) {
      for (const rarity of RARITIES) {
        for (let seed = 1; seed <= 50; seed++) {
          const rng = new RNG(seed * 7919 + ilvl * 131 + SLOTS.indexOf(slot) * 17 + rarity);
          const item = rollItem(ilvl, rng, { slot, rarity });
          checkItem(item, ilvl, slot, rarity);
          count++;
        }
      }
    }
  }
  assert.equal(count, 30 * 9 * 3 * 50);
});

test('rollItem with no options never throws either, with any class and magic find', () => {
  const rng = new RNG(2024);
  for (let i = 0; i < 6000; i++) {
    const ilvl = 1 + (i % 30);
    const forWeapon = i % 6 === 5 ? undefined : WEAPON_KINDS[i % WEAPON_KINDS.length];
    const item = rollItem(ilvl, rng, { forWeapon, magicFind: (i % 5) * 60 });
    assert.ok(item.rarity === 0 || item.rarity === 1 || item.rarity === 2, 'Unique is never rolled');
    checkItem(item, ilvl, item.slot, item.rarity);
  }
});

test('odd inputs are tidied instead of throwing', () => {
  const rng = new RNG(5);
  assert.equal(rollItem(0, rng).ilvl, 1);
  assert.equal(rollItem(-7, rng).ilvl, 1);
  assert.equal(rollItem(Number.NaN, rng).ilvl, 1);
  assert.equal(rollItem(2.9, rng).ilvl, 2);
  assert.equal(rollItem(500, rng, { rarity: 2 }).ilvl, 500);
  assert.doesNotThrow(() => rollItem(3, rng, { magicFind: -500 }));
  assert.doesNotThrow(() => rollItem(3, rng, { magicFind: Number.NaN }));
  // Unique is reserved: asking for it gives a Rare
  for (let i = 0; i < 50; i++) assert.equal(rollItem(8, rng, { rarity: 3 }).rarity, 2);
  // a huge negative magic find can only produce Normal items
  for (let i = 0; i < 200; i++) assert.equal(rollItem(8, rng, { magicFind: -100 }).rarity, 0);
});

test('affix counts: Magic is 1 prefix, 1 suffix or both; Rare is 3 or 4 with at most 2 of each', () => {
  const shapes = (rarity: Rarity): Map<string, number> => {
    const rng = new RNG(150 + rarity);
    const seen = new Map<string, number>();
    for (let i = 0; i < 3000; i++) {
      const item = rollItem(1 + (i % 30), rng, { rarity });
      const prefixes = item.affixes.filter((a) => a.kind === 'prefix').length;
      const shape = `${prefixes}p+${item.affixes.length - prefixes}s`;
      seen.set(shape, (seen.get(shape) ?? 0) + 1);
      // prefixes are listed before suffixes
      assert.deepEqual(item.affixes.map((a) => a.kind), [...item.affixes.map((a) => a.kind)].sort());
    }
    return seen;
  };
  assert.deepEqual([...shapes(0).keys()], ['0p+0s']);
  const magic = shapes(1);
  assert.deepEqual([...magic.keys()].sort(), ['0p+1s', '1p+0s', '1p+1s']);
  const rare = shapes(2);
  assert.deepEqual([...rare.keys()].sort(), ['1p+2s', '2p+1s', '2p+2s']);
  // none of the shapes is a rarity in itself
  for (const [shape, n] of [...magic, ...rare]) assert.ok(n > 300, `${shape} only came up ${n} times in 3000`);
});

test('affixes: every family appears on exactly its slots, in range at ilvl 1 and ilvl 15', () => {
  for (const [ilvl, pick] of [[1, 'at1'], [15, 'at15']] as const) {
    for (const slot of SLOTS) {
      const seen = new Map<string, number[]>();
      const rng = new RNG(900 + ilvl * 10 + SLOTS.indexOf(slot));
      for (let i = 0; i < 1500; i++) {
        const item = rollItem(ilvl, rng, { slot, rarity: i % 3 === 0 ? 1 : 2 });
        for (const a of item.affixes) {
          const key = specKey(a);
          const values = seen.get(key) ?? [];
          // for the damage pair, record the average as a share of a same-level plain sword hit
          values.push(key === 'damage' ? (a.mods[0].value + a.mods[1].value) / 2 / swordHit(ilvl) : a.mods[0].value);
          seen.set(key, values);
        }
      }
      const expected = Object.keys(AFFIX_SPEC).filter((key) => AFFIX_SPEC[key].slots.includes(slot)).sort();
      assert.deepEqual([...seen.keys()].sort(), expected, `families seen on ${slot} at ilvl ${ilvl}`);
      for (const [key, values] of seen) {
        const lo = Math.min(...values);
        const hi = Math.max(...values);
        if (key === 'damage') {
          // "about 20-30% of a same-level sword's hit"; whole-number rounding widens it a little at low levels
          assert.ok(lo >= 0.17 && hi <= 0.34, `added damage on ${slot} at ilvl ${ilvl}: ${lo.toFixed(2)}-${hi.toFixed(2)} of a sword hit`);
          continue;
        }
        const [min, max] = AFFIX_SPEC[key][pick];
        assert.ok(lo >= min && hi <= max, `${key} on ${slot} at ilvl ${ilvl}: saw ${lo}-${hi}, brief says ${min}-${max}`);
        // and the whole range is in use, not just one end of it
        assert.ok(lo <= min + (max - min) * 0.25 && hi >= max - (max - min) * 0.25, `${key} on ${slot} at ilvl ${ilvl}: only saw ${lo}-${hi} of ${min}-${max}`);
      }
    }
  }
});

test('affixes grow with item level; past 15 plain amounts keep growing and percentages hold', () => {
  const sample = (ilvl: number): Map<string, number[]> => {
    const seen = new Map<string, number[]>();
    const rng = new RNG(4242 + ilvl);
    for (const slot of SLOTS) {
      for (let i = 0; i < 1200; i++) {
        for (const a of rollItem(ilvl, rng, { slot, rarity: 2 }).affixes) {
          const key = specKey(a);
          const values = seen.get(key) ?? [];
          values.push(key === 'damage' ? (a.mods[0].value + a.mods[1].value) / 2 : a.mods[0].value);
          seen.set(key, values);
        }
      }
    }
    return seen;
  };
  const at1 = sample(1);
  const at8 = sample(8);
  const at15 = sample(15);
  const at30 = sample(30);
  const plainAmounts = ['maxLife', 'maxMana', 'armor', 'damage', 'str', 'dex', 'int', 'lifeRegen', 'manaRegen', 'lifeOnHit', 'lifeOnKill'];
  for (const key of Object.keys(AFFIX_SPEC)) {
    const m1 = mean(at1.get(key) as number[]);
    const m8 = mean(at8.get(key) as number[]);
    const m15 = mean(at15.get(key) as number[]);
    const m30 = mean(at30.get(key) as number[]);
    assert.ok(m1 < m8 && m8 < m15, `${key} should grow: ${m1.toFixed(1)} -> ${m8.toFixed(1)} -> ${m15.toFixed(1)}`);
    if (plainAmounts.includes(key)) {
      assert.ok(m30 > m15 * 1.5, `${key} should keep growing past ilvl 15: ${m15.toFixed(1)} -> ${m30.toFixed(1)}`);
    } else {
      // a percentage never rolls above its ilvl-15 range, however deep the dungeon
      const max = AFFIX_SPEC[key].at15[1];
      assert.ok(Math.max(...(at30.get(key) as number[])) <= max, `${key} should stop at ${max}%`);
    }
  }
});

test('rarity grows with the dungeons: mostly plain at first, rare a real event; shifted by magic find and luck; never Unique', () => {
  const shares = (ilvl: number, opts: RollOpts, seed: number): number[] => {
    const rng = new RNG(seed);
    const counts = [0, 0, 0, 0];
    const n = 20000;
    for (let i = 0; i < n; i++) counts[rollItem(ilvl, rng, opts).rarity]++;
    return counts.map((c) => c / n);
  };
  // the chances themselves
  assert.deepEqual(rarityChances(1), [89, 10, 1]);
  assert.deepEqual(rarityChances(0), [89, 10, 1]);
  for (let ilvl = 1; ilvl < 40; ilvl++) {
    const a = rarityChances(ilvl);
    const b = rarityChances(ilvl + 1);
    near(a[0] + a[1] + a[2], 100, 1e-9, 'they are chances in 100');
    assert.ok(b[1] >= a[1] && b[2] >= a[2] && b[0] <= a[0], `rarity never falls with depth (ilvl ${ilvl})`);
    assert.ok(a[0] > 50, 'plain gear is always the most common: it is what words are burned into');
    assert.ok(a[2] <= 5 && a[1] <= 36, 'and there is a ceiling');
  }
  assert.deepEqual(rarityChances(40), [59, 36, 5]);
  // what is rolled follows them
  const first = shares(1, {}, 11);
  near(first[0], 0.89, 0.012, 'Normal share, first dungeon');
  near(first[1], 0.10, 0.012, 'Magic share, first dungeon');
  near(first[2], 0.01, 0.005, 'Rare share, first dungeon');
  assert.equal(first[3], 0, 'Unique must never be rolled');
  // the sixth dungeon: 10 + 5 x 2.2 = 21 magic, 1 + 5 x 0.4 = 3 rare
  const sixth = shares(6, {}, 13);
  near(sixth[0], 0.76, 0.015, 'Normal share, sixth dungeon');
  near(sixth[1], 0.21, 0.015, 'Magic share, sixth dungeon');
  near(sixth[2], 0.03, 0.008, 'Rare share, sixth dungeon');
  // magic find 100 doubles the chances of Magic and Rare: 76 / 42 / 6
  const lucky = shares(6, { magicFind: 100 }, 12);
  near(lucky[0], 76 / 124, 0.015, 'Normal share with 100% magic find');
  near(lucky[1], 42 / 124, 0.015, 'Magic share with 100% magic find');
  near(lucky[2], 6 / 124, 0.008, 'Rare share with 100% magic find');
  assert.equal(lucky[3], 0);
  // a hoard is likelier to hold something good: 89 / 30 / 4
  const hoard = shares(1, { luck: [3, 4] }, 14);
  near(hoard[0], 89 / 123, 0.015, 'Normal share of a hoard, first dungeon');
  near(hoard[1], 30 / 123, 0.015, 'Magic share of a hoard, first dungeon');
  near(hoard[2], 4 / 123, 0.008, 'Rare share of a hoard, first dungeon');
  // the boss's first piece is never plain: what would have been plain is magic
  const boss = shares(1, { luck: [3, 4], atLeast: 1 }, 16);
  assert.equal(boss[0], 0, 'nothing plain');
  near(boss[2], 4 / 123, 0.008, 'Rare share of the boss\'s first piece, first dungeon');
  near(boss[1], 119 / 123, 0.008, 'Magic share of the boss\'s first piece, first dungeon');
  // odd luck is ignored rather than breaking the roll
  const odd = shares(1, { luck: [Number.NaN, -3] }, 15);
  near(odd[0], 0.89, 0.012, 'luck that is not a number counts as none');
});

test('slot roll follows the weights', () => {
  const rng = new RNG(77);
  const counts = new Map<Slot, number>();
  const n = 20000;
  for (let i = 0; i < n; i++) {
    const slot = rollItem(3, rng).slot;
    counts.set(slot, (counts.get(slot) ?? 0) + 1);
  }
  for (const slot of SLOTS) near((counts.get(slot) ?? 0) / n, SLOT_WEIGHTS[slot] / 100, 0.012, `share of ${slot}`);
});

// (Until Version 12 four in five of these were pieces of the hero's own class. Now nothing is
// anyone's own: half of what is found goes with the weapon in hand, and half is there to tempt.)
test('forWeapon: half the main-hand drops are the kind in hand, and half the off-hand drops the piece that goes with it', () => {
  const n = 6000;
  for (const held of WEAPON_KINDS) {
    const seed = 300 + WEAPON_KINDS.indexOf(held) * 10;
    // the main hand
    {
      const rng = new RNG(seed);
      const seen = new Set<string | null>();
      let same = 0;
      let sameUnbiased = 0;
      for (let i = 0; i < n; i++) {
        const biased = rollItem(1 + (i % 30), rng, { slot: 'mainhand', forWeapon: held });
        if (biased.weapon === held) same++;
        seen.add(biased.weapon);
        if (rollItem(1 + (i % 30), rng, { slot: 'mainhand' }).weapon === held) sameUnbiased++;
      }
      const own = 1 / WEAPON_KINDS.length;
      near(same / n, 0.5 + 0.5 * own, 0.02, `${held}s found while holding one`);
      near(sameUnbiased / n, own, 0.025, `${held}s found with nothing asked for`);
      assert.equal(seen.size, WEAPON_KINDS.length, `holding a ${held}: every other kind still drops`);
    }
    // the off hand: the piece that goes with the weapon, if one does
    {
      const rng = new RNG(seed + 1);
      const partner = OFFHAND_KINDS.find((o) => PAIRS[o].includes(held));
      const counts = new Map<OffhandKind, number>();
      for (let i = 0; i < n; i++) {
        const k = rollItem(1 + (i % 30), rng, { slot: 'offhand', forWeapon: held }).offhand as OffhandKind;
        counts.set(k, (counts.get(k) ?? 0) + 1);
      }
      const own = 1 / OFFHAND_KINDS.length;
      for (const o of OFFHAND_KINDS) {
        const share = (counts.get(o) ?? 0) / n;
        if (partner === undefined) near(share, own, 0.025, `${o}s while holding a ${held}, which takes none of them`);
        else near(share, o === partner ? 0.5 + 0.5 * own : 0.5 * own, 0.02, `${o}s while holding a ${held}`);
      }
    }
  }
  // empty hands lean nowhere, and no other slot is touched
  const rng = new RNG(9);
  const kinds = new Map<string, number>();
  for (let i = 0; i < 3000; i++) {
    const item = rollItem(12, rng, { slot: 'mainhand', forWeapon: null });
    kinds.set(item.weapon as string, (kinds.get(item.weapon as string) ?? 0) + 1);
  }
  for (const k of WEAPON_KINDS) near((kinds.get(k) ?? 0) / 3000, 1 / WEAPON_KINDS.length, 0.03, `${k}s with empty hands`);
  for (let i = 0; i < 300; i++) {
    const item = rollItem(12, rng, { forWeapon: 'wand' });
    assert.equal(item.cls, null, 'nothing is one class\'s own');
  }
});

test('base names: locked ones never drop, and the best unlocked one drops about 70% of the time', () => {
  const tierShares = (ilvl: number): Map<number, number> => {
    const rng = new RNG(600 + ilvl);
    const counts = new Map<number, number>();
    const n = 8000;
    for (let i = 0; i < n; i++) {
      const base = baseOf(rollItem(ilvl, rng));
      assert.ok(base.minIlvl <= ilvl, `${base.id} dropped at ilvl ${ilvl}`);
      counts.set(base.minIlvl, (counts.get(base.minIlvl) ?? 0) + 1 / n);
    }
    return counts;
  };
  for (const ilvl of [1, 4]) near(tierShares(ilvl).get(1) ?? 0, 1, 1e-9, `first names at ilvl ${ilvl}`);
  for (const ilvl of [5, 9]) {
    const shares = tierShares(ilvl);
    near(shares.get(5) ?? 0, 0.7, 0.02, `second names at ilvl ${ilvl}`);
    near(shares.get(1) ?? 0, 0.3, 0.02, `first names at ilvl ${ilvl}`);
  }
  for (const ilvl of [10, 30]) {
    const shares = tierShares(ilvl);
    near(shares.get(10) ?? 0, 0.7, 0.02, `third names at ilvl ${ilvl}`);
    assert.ok((shares.get(5) ?? 0) > 0.1 && (shares.get(1) ?? 0) > 0.1, `older names still drop at ilvl ${ilvl}`);
  }
  // every base can actually drop
  const dropped = new Set<string>();
  const rng = new RNG(31337);
  for (let i = 0; i < 8000; i++) dropped.add(rollItem(1 + (i % 30), rng).baseId);
  assert.equal(dropped.size, ITEM_BASES.length, 'some base never drops');
});

test('Rare names are varied', () => {
  const rng = new RNG(88);
  for (const slot of SLOTS) {
    const names = new Set<string>();
    for (let i = 0; i < 400; i++) names.add(rollItem(10, rng, { slot, rarity: 2 }).name);
    assert.ok(names.size >= 60, `only ${names.size} different Rare names for ${slot}`);
  }
});

test('determinism: the same seed gives the same items', () => {
  const run = (seed: number): Item[] => {
    const rng = new RNG(seed);
    const items: Item[] = [];
    for (let i = 0; i < 300; i++) items.push(rollItem(1 + (i % 30), rng, { forWeapon: WEAPON_KINDS[i % WEAPON_KINDS.length], magicFind: i % 50 }));
    items.forEach((item, i) => imbueItem(item, WORD_IDS[i % WORD_IDS.length], rng));
    return items;
  };
  setNextUid(1000);
  const a = run(4711);
  setNextUid(1000);
  const b = run(4711);
  // compared one by one, so a failure prints a single item instead of all three hundred
  a.forEach((item, i) => assert.deepEqual(b[i], item, `item ${i}: same seed and same uid counter should give identical items`));
  const c = run(4711);
  a.forEach((item, i) => {
    assert.deepEqual(withoutUid(c[i]), withoutUid(item), `item ${i}: same seed should give the same item apart from the uid`);
    assert.notEqual(c[i].uid, item.uid, `item ${i}: the uid counter moved on`);
  });
  const other = run(4712);
  const same = a.filter((item, i) => JSON.stringify(withoutUid(item)) === JSON.stringify(withoutUid(other[i]))).length;
  assert.ok(same < a.length / 10, `another seed should give different items, but ${same} of ${a.length} matched`);
});

test('uids are unique, and setNextUid restarts the counter', () => {
  const rng = new RNG(1);
  const uids = new Set<number>();
  let made = 0;
  for (let i = 0; i < 3000; i++) {
    uids.add(rollItem(1 + (i % 30), rng).uid);
    made++;
  }
  for (const cls of CLASS_IDS) {
    uids.add(starterWeapon(cls).uid);
    made++;
  }
  assert.equal(uids.size, made);

  setNextUid(500);
  assert.equal(starterWeapon('warrior').uid, 500);
  assert.equal(rollItem(3, rng).uid, 501);
  assert.equal(rollItem(3, rng).uid, 502);
  setNextUid(41.9); // tidied to a whole number
  assert.equal(rollItem(3, rng).uid, 41);
  setNextUid(Number.NaN); // ignored
  assert.equal(rollItem(3, rng).uid, 42);
});

test('items are plain data and survive a save and load', () => {
  const rng = new RNG(606);
  for (let i = 0; i < 200; i++) {
    const item = rollItem(1 + (i % 30), rng);
    if (i % 2 === 0) imbueItem(item, WORD_IDS[i % WORD_IDS.length], rng);
    const loaded = JSON.parse(JSON.stringify(item)) as Item;
    assert.deepEqual(loaded, item);
    assert.equal(itemValue(loaded), itemValue(item));
    assert.equal(itemScore(loaded, 'ranger'), itemScore(item, 'ranger'));
  }
});

// ---------------------------------------------------------------------------------------------
// Starter weapons

test('starterWeapon gives each class the plain ilvl-1 weapon it begins with', () => {
  for (const cls of CLASS_IDS) {
    const item = starterWeapon(cls);
    checkItem(item, 1, 'mainhand', 0);
    assert.equal(item.weapon, STARTS[cls], `a ${cls} begins with a ${STARTS[cls]}`);
    assert.equal(item.cls, null, 'and it is not that class\'s own: anyone could pick it up');
    assert.equal(item.name, item.baseName);
    assert.equal(item.reqLevel, 1, 'a new character can equip it');
    assert.equal(baseOf(item).minIlvl, 1);
    // the off-hand pieces that go with it are the ones for its kind, whoever holds it
    const rng = new RNG(40 + CLASS_IDS.indexOf(cls));
    for (let i = 0; i < 40; i++) {
      const off = rollItem(1, rng, { slot: 'offhand' });
      assert.equal(canPair(item, off), PAIRS[off.offhand as OffhandKind].includes(STARTS[cls]), `${item.name} + ${off.name}`);
    }
    // the same weapon every time, apart from the uid
    assert.deepEqual(withoutUid(starterWeapon(cls)), withoutUid(item));
  }
});

// ---------------------------------------------------------------------------------------------
// Hands, off-hands and level requirement

// (Until Version 11.1 it was twice the item level minus one, which went with two levels a dungeon.
// Levels now come half as often, and what falls in a dungeon must be wearable by whoever got there.)
test('reqLevel is the item level: what falls in dungeon N asks for level N', () => {
  const rng = new RNG(71);
  for (const [ilvl, expected] of [[1, 1], [2, 2], [3, 3], [10, 10], [15, 15], [30, 30]]) {
    for (const slot of SLOTS) assert.equal(rollItem(ilvl, rng, { slot }).reqLevel, expected, `${slot} at ilvl ${ilvl}`);
    assert.equal(reqLevelFor(ilvl), expected);
  }
  // odd item levels are tidied first, so the requirement is never below 1
  for (const ilvl of [0, -3, Number.NaN]) {
    assert.equal(rollItem(ilvl, rng).reqLevel, 1);
    assert.equal(reqLevelFor(ilvl), 1);
  }
});

test('canPair: a shield needs a one-handed sword, a quiver a bow, a focus a wand', () => {
  const rng = new RNG(246);
  // one item of every weapon kind and of every off-hand kind
  const mains = new Map<WeaponKind, Item>();
  const offs = new Map<OffhandKind, Item>();
  for (let i = 0; i < 2000 && mains.size < WEAPON_KINDS.length; i++) {
    const item = rollItem(1 + (i % 30), rng, { slot: 'mainhand', rarity: (i % 3) as Rarity });
    mains.set(item.weapon as WeaponKind, item);
  }
  for (let i = 0; i < 2000 && offs.size < OFFHAND_KINDS.length; i++) {
    const item = rollItem(1 + (i % 30), rng, { slot: 'offhand', rarity: (i % 3) as Rarity });
    offs.set(item.offhand as OffhandKind, item);
  }
  assert.equal(mains.size, WEAPON_KINDS.length);
  assert.equal(offs.size, OFFHAND_KINDS.length);

  for (const [offKind, off] of offs) {
    for (const [kind, main] of mains) {
      assert.equal(canPair(main, off), PAIRS[offKind].includes(kind), `${kind} + ${offKind}`);
    }
    assert.equal(canPair(null, off), false, `${offKind} with empty hands`);
    // only a weapon counts as a main hand
    assert.equal(canPair(off, off), false);
    assert.equal(canPair(rollItem(12, rng, { slot: 'helm' }), off), false);
  }
  for (const [kind, main] of mains) {
    // only an off-hand piece can be paired
    assert.equal(canPair(main, main), false);
    assert.equal(canPair(main, rollItem(12, rng, { slot: 'ring' })), false);
    // one-handers and the bow take an off-hand; the greatsword and the staff leave no room for one
    const takesOffhand = [...offs.values()].some((off) => canPair(main, off));
    assert.equal(takesOffhand, main.hands === 1 || kind === 'bow', kind);
    assert.equal(takesOffhand, !DPS_GROUPS['two-handed without an off-hand'].includes(kind), kind);
  }
  // canPair reads only the two items, so it works on loaded saves too
  const sword = JSON.parse(JSON.stringify(mains.get('sword'))) as Item;
  const shield = JSON.parse(JSON.stringify(offs.get('shield'))) as Item;
  assert.equal(canPair(sword, shield), true);
});

// ---------------------------------------------------------------------------------------------
// Imbuing

test('imbueOptions matches the word x slot table and is never empty', () => {
  for (const word of WORD_IDS) {
    for (const slot of SLOTS) {
      for (const ilvl of [1, 2, 7, 15, 30]) {
        const options = imbueOptions(word, slot, ilvl);
        const where = `${word} on ${slot} at ilvl ${ilvl}`;
        assert.ok(options.length >= 1 && options.length <= 2, `${where}: ${options.length} options`);
        assert.deepEqual(options.map((o): ImbuePick => [o.kind, o.stat]), expectedImbue(word, slot), where);
        for (const o of options) {
          assert.ok(o.min > 0 && o.min <= o.max, `${where}: ${o.stat} ${o.min}-${o.max}`);
          assert.ok(decimalsOk(o.stat, o.min) && decimalsOk(o.stat, o.max), `${where}: ${o.stat} ${o.min}-${o.max}`);
        }
      }
    }
  }
});

test('imbues are a little stronger than a same-level affix and scale with item level', () => {
  for (const word of WORD_IDS) {
    for (const slot of SLOTS) {
      const low = imbueOptions(word, slot, 1);
      const high = imbueOptions(word, slot, 15);
      low.forEach((o, i) => {
        const where = `${word} on ${slot}: ${o.stat}`;
        for (const [option, range] of [[o, AFFIX_SPEC[o.stat].at1], [high[i], AFFIX_SPEC[o.stat].at15]] as const) {
          const affixMid = (range[0] + range[1]) / 2;
          const imbueMid = (option.min + option.max) / 2;
          assert.ok(option.min >= range[0] && option.max > range[1], `${where}: ${option.min}-${option.max} vs affix ${range[0]}-${range[1]}`);
          assert.ok(imbueMid > affixMid && imbueMid < affixMid * 1.4, `${where}: middle ${imbueMid} vs affix ${affixMid}`);
        }
        assert.ok(high[i].min > o.min && high[i].max > o.max, `${where} should grow from ilvl 1 to 15`);
      });
    }
  }
});

/** The properties a piece carries: those of its affixes and of the words burned into it. */
function carriedStats(item: Item): StatKey[] {
  return [...item.affixes.flatMap((a) => a.mods.map((m) => m.stat)), ...item.imbues.flatMap((im) => im.mods.map((m) => m.stat))];
}

// The owner, 4 Oct 2026, 13:25: "All items have room for 4 mods. White starts with 0, blue 1-2,
// yellow 3-4".
test('every piece has room for four properties: a white one takes four words, a blue one two or three, a yellow one a single word or none', () => {
  assert.equal(ITEM_ROOM, 4);
  const rng = new RNG(1325);
  const rooms: Set<number>[] = [new Set(), new Set(), new Set()];
  for (let i = 0; i < 900; i++) {
    const rarity = (i % 3) as Rarity;
    const item = rollItem(1 + (i % 30), rng, { rarity });
    assert.equal(itemRoom(item), 4 - item.affixes.length, item.name);
    rooms[rarity].add(itemRoom(item));
    // what it is found as is the colour its count asks for
    assert.equal(rarityFor(item.affixes.length), rarity, item.name);
  }
  assert.deepEqual([...rooms[0]].sort(), [4], 'white');
  assert.deepEqual([...rooms[1]].sort(), [2, 3], 'blue');
  assert.deepEqual([...rooms[2]].sort(), [0, 1], 'yellow');
  assert.deepEqual([0, 1, 2, 3, 4].map(rarityFor), [0, 1, 1, 2, 2], 'none is white, one or two blue, three or four yellow');
});

test('imbueItem adds one modifier in range; a word never gives what the piece already has; and a piece stops at four properties', () => {
  const rng = new RNG(321);
  let refusedFull = 0;
  let refusedSame = 0;
  for (let round = 0; round < 40; round++) {
    for (const slot of SLOTS) {
      const ilvl = 1 + ((round * 7) % 30);
      const item = rollItem(ilvl, rng, { slot, rarity: (round % 3) as Rarity });
      // (everything about the piece but its words, and the colour that follows their count)
      const rest = (): string => JSON.stringify({ ...item, imbues: [], rarity: 0 });
      const before = rest();
      assert.deepEqual(item.imbues, []);
      // the words in a different order each round, so that every word meets pieces in every state
      const words = [...WORD_IDS.slice(round % WORD_IDS.length), ...WORD_IDS.slice(0, round % WORD_IDS.length)];
      for (const word of words) {
        const where = `${word} on ${item.name} (${slot}, ${item.affixes.length} affixes, ${item.imbues.length} words)`;
        const have = new Set(carriedStats(item));
        const room = ITEM_ROOM - item.affixes.length - item.imbues.length;
        assert.equal(itemRoom(item), room, where);
        const expected = room > 0 ? imbueOptions(word, slot, ilvl).filter((o) => !have.has(o.stat)) : [];
        const options = imbueOptionsFor(item, word);
        assert.deepEqual(options, expected, where);
        const count = item.imbues.length;
        const colour = item.rarity;
        const imbue = imbueItem(item, word, rng);
        if (expected.length === 0) {
          // no room, or nothing new to give: nothing happens, and there is a reason to show
          assert.equal(imbue, null, where);
          assert.equal(item.imbues.length, count, where);
          assert.equal(item.rarity, colour, where);
          assert.equal(imbueProblem(item, word), room > 0 ? 'It already has what this word gives' : 'That piece is full', where);
          if (room > 0) refusedSame++;
          else refusedFull++;
          continue;
        }
        assert.equal(imbueProblem(item, word) === null || item.imbues.length > count, true, where);
        assert.ok(imbue, where);
        if (!imbue) continue;
        assert.equal(item.imbues.length, count + 1, where);
        assert.equal(item.imbues[count], imbue, 'the returned imbue is the newest on the item');
        assert.equal(imbue.word, word);
        assert.equal(imbue.mods.length, 1);
        const mod = imbue.mods[0];
        const option = options.find((o) => o.stat === mod.stat && o.kind === imbue.kind);
        assert.ok(option, `${where} gave ${imbue.kind} ${mod.stat}, which is not an option`);
        if (option) assert.ok(mod.value >= option.min && mod.value <= option.max, `${where}: ${mod.stat} ${mod.value} outside ${option.min}-${option.max}`);
        assert.ok(decimalsOk(mod.stat, mod.value), `${mod.stat} = ${mod.value}`);
        assert.ok(!have.has(mod.stat), `${where}: it already had ${mod.stat}`);
        // the colour follows the count
        assert.equal(item.rarity, rarityFor(item.affixes.length + item.imbues.length), where);
      }
      // never more than four, never the same property twice
      const stats = carriedStats(item);
      assert.ok(item.affixes.length + item.imbues.length <= ITEM_ROOM, `${item.name}: ${stats.join(' ')}`);
      assert.equal(new Set(stats).size, stats.length, `${item.name}: ${stats.join(' ')}`);
      // nine words were offered: whatever its colour, a piece ends up full
      assert.equal(itemRoom(item), 0, `${item.name} (${slot}): ${stats.join(' ')}`);
      // nothing else on the item changes
      assert.equal(rest(), before);
    }
  }
  assert.ok(refusedFull > 100 && refusedSame >= 1, `both refusals were met: full ${refusedFull}, nothing new ${refusedSame}`);
});

test('the colour follows the count as a piece is crafted: a white with one word is blue, with three it is yellow', () => {
  const rng = new RNG(5);
  const item = rollItem(8, rng, { slot: 'chest', rarity: 0 });
  const name = item.name;
  assert.equal(item.rarity, 0);
  const colours: number[] = [];
  for (const word of ['power', 'leech', 'fire', 'swift', 'volatile'] as WordId[]) {
    imbueItem(item, word, rng);
    colours.push(item.rarity);
  }
  assert.equal(item.imbues.length, 4, 'the fifth word found no room');
  assert.deepEqual(colours, [1, 1, 2, 2, 2]);
  assert.equal(item.name, name, 'its name is its own');
  // a blue piece with two properties turns yellow with its first word; a yellow one stays yellow
  for (let i = 0; i < 200; i++) {
    const it = rollItem(6, rng, { rarity: i % 2 === 0 ? 1 : 2 });
    const was = it.rarity;
    const n = it.affixes.length;
    const made = imbueItem(it, WORD_IDS[i % WORD_IDS.length], rng);
    if (!made) continue;
    assert.equal(it.rarity, n + 1 >= 3 ? 2 : 1, `${it.name}: ${n} affixes and a word`);
    assert.ok(it.rarity >= was);
  }
});

test('a piece cannot carry the same property twice', () => {
  const rng = new RNG(88);
  // Power on a chest is Armour or Strength: twice gives one of each, and a third time has nothing left to give
  const chest = rollItem(8, rng, { slot: 'chest', rarity: 0 });
  assert.deepEqual(imbueOptionsFor(chest, 'power').map((o) => o.stat).sort(), ['armor', 'str']);
  const first = imbueItem(chest, 'power', rng);
  assert.ok(first);
  assert.equal(imbueOptionsFor(chest, 'power').length, 1, 'what it became is no longer on offer');
  const second = imbueItem(chest, 'power', rng);
  assert.ok(second);
  if (first && second) assert.notEqual(first.mods[0].stat, second.mods[0].stat);
  assert.deepEqual(carriedStats(chest).sort(), ['armor', 'str']);
  assert.equal(itemRoom(chest), 2, 'there is room, but not for this word');
  assert.equal(imbueProblem(chest, 'power'), 'It already has what this word gives');
  assert.equal(imbueItem(chest, 'power', rng), null);
  assert.equal(chest.imbues.length, 2);
  // (Twin on a chest is Critical Damage or Dexterity: neither is there yet)
  assert.equal(imbueProblem(chest, 'twin'), null);
  // a property the piece was FOUND with counts too: a helm "of the Bear" is not offered Strength again
  let met = 0;
  for (let i = 0; i < 4000 && met < 20; i++) {
    const it = rollItem(1 + (i % 20), rng, { slot: 'helm', rarity: 1 });
    if (!it.affixes.some((a) => a.mods.some((m) => m.stat === 'str'))) continue;
    met++;
    assert.deepEqual(imbueOptionsFor(it, 'power').map((o) => o.stat), ['armor'].filter((st) => !it.affixes.some((a) => a.mods.some((m) => m.stat === st))), it.name);
  }
  assert.ok(met >= 20);
  // what is built into a base does not count (an affix may repeat that as well): gloves' own attack speed leaves Swift both its outcomes
  const gloves = rollItem(8, rng, { slot: 'gloves', rarity: 0 });
  assert.equal(imbueOptionsFor(gloves, 'swift').length, imbueOptions('swift', 'gloves', 8).length);
});

test('a full piece takes no word: nothing about it changes', () => {
  const rng = new RNG(404);
  let full = 0;
  for (let i = 0; i < 400 && full < 30; i++) {
    const item = rollItem(1 + (i % 25), rng, { rarity: 2 });
    if (item.affixes.length < ITEM_ROOM) continue;
    full++;
    const before = JSON.stringify(item);
    for (const word of WORD_IDS) {
      assert.deepEqual(imbueOptionsFor(item, word), []);
      assert.equal(imbueProblem(item, word), 'That piece is full');
      assert.equal(imbueItem(item, word, rng), null);
    }
    assert.equal(JSON.stringify(item), before);
  }
  assert.ok(full >= 30, `met ${full} yellow pieces with four properties`);
});

test('imbueItem uses both options, and the whole range, when there are two', () => {
  const rng = new RNG(99);
  for (const word of WORD_IDS) {
    for (const slot of SLOTS) {
      const options = imbueOptions(word, slot, 15);
      const item = rollItem(15, rng, { slot, rarity: 0 });
      const seen = new Map<string, number[]>();
      for (let i = 0; i < 400; i++) {
        // (a fresh piece each time: the word is being tried on a piece with nothing on it)
        item.imbues = [];
        item.rarity = 0;
        const imbue = imbueItem(item, word, rng);
        assert.ok(imbue);
        if (!imbue) continue;
        const values = seen.get(imbue.mods[0].stat) ?? [];
        values.push(imbue.mods[0].value);
        seen.set(imbue.mods[0].stat, values);
      }
      assert.equal(seen.size, options.length, `${word} on ${slot}`);
      for (const o of options) {
        const values = seen.get(o.stat) as number[];
        assert.ok(values.length > 400 / options.length / 2, `${word} on ${slot}: ${o.stat} is picked too rarely`);
        assert.equal(Math.min(...values), o.min, `${word} on ${slot}: lowest ${o.stat}`);
        assert.equal(Math.max(...values), o.max, `${word} on ${slot}: highest ${o.stat}`);
      }
    }
  }
});

// ---------------------------------------------------------------------------------------------
// Totals, score, price

test('itemMods lists implicit, then affixes, then the words burned in, in the order they were burned', () => {
  const rng = new RNG(55);
  let two = 0;
  for (let i = 0; i < 300; i++) {
    const item = rollItem(1 + (i % 30), rng, { rarity: (i % 3) as Rarity });
    const plain = [...item.implicit, ...item.affixes.flatMap((a) => a.mods)];
    assert.deepEqual(itemMods(item), plain);
    const a = imbueItem(item, WORD_IDS[i % WORD_IDS.length], rng);
    const b = imbueItem(item, WORD_IDS[(i + 4) % WORD_IDS.length], rng);
    if (a && b) two++;
    assert.deepEqual(itemMods(item), [...plain, ...(a ? a.mods : []), ...(b ? b.mods : [])]);
    // the list is a copy: changing it leaves the item alone
    const snapshot = JSON.stringify(item);
    for (const m of itemMods(item)) m.value = 0;
    assert.equal(JSON.stringify(item), snapshot);
    assert.ok(modLines(itemMods(item), 'cooldown').every((line) => line.length > 0));
  }
  assert.ok(two > 100, `pieces that took two words: ${two}`);
});

test('itemScore: weights the class attribute, ignores weapons and off-hands the class cannot use, rewards better gear', () => {
  const rng = new RNG(808);
  // the same amulet is worth most to the class whose attribute it carries
  const attribute: Record<ClassId, StatKey> = { warrior: 'str', ranger: 'dex', mage: 'int' };
  for (const cls of CLASS_IDS) {
    let found = 0;
    while (found < 20) {
      const item = rollItem(12, rng, { slot: 'amulet', rarity: 0 });
      if (item.implicit[0].stat !== attribute[cls]) continue;
      found++;
      for (const other of CLASS_IDS) {
        if (other !== cls) assert.ok(itemScore(item, cls) > itemScore(item, other), `${item.name}: ${cls} vs ${other}`);
      }
    }
  }
  // a weapon or an off-hand scores for every class: any character can use any of them
  for (let i = 0; i < 400; i++) {
    const piece = rollItem(1 + (i % 30), rng, { slot: i % 2 === 0 ? 'mainhand' : 'offhand' });
    for (const cls of CLASS_IDS) assert.ok(itemScore(piece, cls) > 0, `${piece.name} for ${cls}`);
  }
  // the same base is worth more at a higher item level, and more again once imbued
  for (const base of ITEM_BASES) {
    const cls: ClassId = base.cls ?? 'warrior';
    const make = (ilvl: number): Item => ({
      uid: 1, baseId: base.id, baseName: base.name, name: base.name, slot: base.slot, rarity: 0, ilvl,
      icon: base.icon, cls: base.cls, weapon: base.weapon, offhand: base.offhand, hands: base.hands, aps: base.aps,
      reqLevel: reqLevelFor(ilvl), implicit: base.implicit(ilvl), affixes: [], imbues: [],
    });
    const low = make(base.minIlvl);
    const high = make(base.minIlvl + 15);
    assert.ok(itemScore(high, cls) >= itemScore(low, cls), base.id);
    const plainScore = itemScore(high, cls);
    imbueItem(high, 'power', rng);
    assert.ok(itemScore(high, cls) > plainScore, `${base.id}: an imbue should add score`);
  }
  // on average: Rare > Magic > Normal
  const averageScore = (rarity: Rarity): number => {
    const r = new RNG(1234);
    const scores: number[] = [];
    for (let i = 0; i < 2000; i++) {
      const item = rollItem(1 + (i % 30), r, { rarity, slot: SLOTS[i % SLOTS.length] });
      scores.push(itemScore(item, item.cls ?? 'warrior'));
    }
    return mean(scores);
  };
  const [normal, magic, rare] = [averageScore(0), averageScore(1), averageScore(2)];
  assert.ok(normal < magic && magic < rare, `average score ${normal.toFixed(0)} / ${magic.toFixed(0)} / ${rare.toFixed(0)}`);
});

test('itemValue is at least 1 and rises with rarity and item level', () => {
  const averageValue = (rarity: Rarity, ilvl: number): number => {
    const rng = new RNG(2468 + ilvl);
    const values: number[] = [];
    for (let i = 0; i < 1500; i++) {
      const value = itemValue(rollItem(ilvl, rng, { rarity }));
      assert.ok(Number.isInteger(value) && value >= 1);
      values.push(value);
    }
    return mean(values);
  };
  for (const ilvl of [1, 8, 20]) {
    const [normal, magic, rare] = [averageValue(0, ilvl), averageValue(1, ilvl), averageValue(2, ilvl)];
    assert.ok(normal < magic && magic < rare, `ilvl ${ilvl}: average value ${normal.toFixed(0)} / ${magic.toFixed(0)} / ${rare.toFixed(0)}`);
    // and by a clear margin, not just through the extra affixes
    assert.ok(magic > normal * 1.5 && rare > magic * 1.5, `ilvl ${ilvl}: rarity barely changes the price (${normal.toFixed(0)} / ${magic.toFixed(0)} / ${rare.toFixed(0)})`);
  }
  assert.ok(averageValue(1, 1) < averageValue(1, 8) && averageValue(1, 8) < averageValue(1, 20), 'value rises with item level');
  // a quarter of the cheapest thing in the game is still a sensible sell price
  const cheapest = Math.min(...CLASS_IDS.map((cls) => itemValue(starterWeapon(cls))));
  assert.ok(cheapest >= 4, `cheapest starter weapon is worth ${cheapest}`);
  // an imbued piece is worth a little more
  const rng = new RNG(13);
  const item = rollItem(10, rng, { slot: 'ring', rarity: 1 });
  const before = itemValue(item);
  imbueItem(item, 'leech', rng);
  assert.ok(itemValue(item) > before);
});

test('loot on the floor is told by its kind alone: one plain word, the same for every piece of a kind', () => {
  const KINDS = new Set(['Sword', 'Greatsword', 'Bow', 'Wand', 'Staff', 'Shield', 'Quiver', 'Focus', 'Helmet', 'Armour', 'Gloves', 'Belt', 'Boots', 'Amulet', 'Ring']);
  const rng = new RNG(77);
  const seen = new Set<string>();
  for (let i = 0; i < 1500; i++) {
    const it = rollItem(1 + (i % 12), rng, { forWeapon: WEAPON_KINDS[i % WEAPON_KINDS.length] });
    const kind = kindName(it);
    assert.ok(KINDS.has(kind), `"${kind}" (for ${it.name}) is a kind of thing`);
    assert.ok(!kind.includes(' ') || kind === 'Off hand', 'one word');
    if (it.weapon) assert.equal(kind.toLowerCase(), it.weapon, 'a weapon is called what it is');
    if (it.slot === 'ring') assert.equal(kind, 'Ring');
    if (it.slot === 'amulet') assert.equal(kind, 'Amulet');
    seen.add(kind);
  }
  assert.equal(seen.size, KINDS.size, `every kind turned up (${[...KINDS].filter((k) => !seen.has(k)).join(', ') || 'none missing'})`);
});

// ---------------------------------------------------------------------------------------------
// Version 12: items from older saves

test('migrateItem: an axe or a mace becomes a sword, a maul a greatsword, a longbow a bow; and nothing is one class\'s own', () => {
  const rng = new RNG(1212);
  /** An item as Version 11 would have saved it: of an old kind, marked as one class's own. */
  const old = (kind: string, tier: number, ilvl: number, cls: ClassId, rarity: Rarity): Item => {
    // (a weapon of the kind it will become, of the same name tier, with its base's name swapped for the old one's)
    let now = rollItem(ilvl, rng, { slot: 'mainhand', rarity, forWeapon: OLD_KINDS[kind] });
    while (now.baseId !== `${OLD_KINDS[kind]}${tier}`) now = rollItem(ilvl, rng, { slot: 'mainhand', rarity, forWeapon: OLD_KINDS[kind] });
    const baseName = `Old ${kind}`;
    return { ...now, baseId: `${kind}${tier}`, baseName, name: now.name.replace(now.baseName, baseName), icon: kind as Item['icon'], weapon: kind as WeaponKind, cls, aps: 0.9, hands: 1, implicit: [{ stat: 'dmgMin', value: 99 }, { stat: 'dmgMax', value: 199 }] };
  };
  for (const [kind, becomes] of Object.entries(OLD_KINDS)) {
    for (const tier of [1, 2, 3]) {
      for (const rarity of [0, 1, 2] as Rarity[]) {
        const ilvl = [1, 6, 14][tier - 1];
        const it = old(kind, tier, ilvl, kind === 'longbow' ? 'ranger' : 'warrior', rarity);
        const affixes = JSON.stringify(it.affixes);
        const uid = it.uid;
        const named = it.name;
        const same = migrateItem(it);
        assert.equal(same, it, 'the item itself is brought up to date');
        const where = `${kind}${tier}, rarity ${rarity}`;
        assert.equal(it.weapon, becomes, where);
        assert.equal(it.cls, null, `${where}: anyone can use it`);
        assert.equal(it.baseId, `${becomes}${tier}`, `${where}: the same name tier`);
        const base = baseOf(it);
        assert.equal(it.baseName, base.name, where);
        assert.equal(it.icon, becomes, where);
        assert.equal(it.aps, APS[becomes], `${where}: the new kind's own speed`);
        assert.equal(it.hands, HANDS[becomes], where);
        assert.deepEqual(it.implicit, base.implicit(ilvl), `${where}: and its own damage at that item level`);
        assert.equal(JSON.stringify(it.affixes), affixes, `${where}: its affixes are kept`);
        assert.equal(it.uid, uid, where);
        assert.equal(it.ilvl, ilvl, where);
        assert.equal(it.rarity, rarity, where);
        // the name follows where it named the base (a Rare's own two-word name does not, and is left alone)
        if (rarity === 0) assert.equal(it.name, base.name, where);
        if (rarity === 1) assert.ok(it.name.includes(base.name) && !it.name.includes('Old'), `${where}: "${it.name}"`);
        if (rarity === 2) assert.equal(it.name, named, `${where}: a Rare's own name is left alone`);
        checkItem(it, ilvl, 'mainhand', rarity);
      }
    }
  }
  // what is already up to date is left as it is (but for the class mark)
  for (let i = 0; i < 300; i++) {
    const it = rollItem(1 + (i % 30), rng, {});
    const before = JSON.stringify(it);
    it.cls = CLASS_IDS[i % 3];
    migrateItem(it);
    assert.equal(JSON.stringify(it), before, it.name);
  }
  // a word burned into the old weapon stays
  const maul = old('maul', 2, 8, 'warrior', 1);
  imbueItem(maul, 'fire', rng);
  const word = JSON.stringify(maul.imbues);
  assert.equal(maul.imbues.length, 1);
  migrateItem(maul);
  assert.equal(JSON.stringify(maul.imbues), word);
});

test('migrateItem: the one word a piece held before Version 13.2 is the first of its list, and the colour follows the count', () => {
  const rng = new RNG(1302);
  /** A piece as a save from before Version 13.2 holds it: one word or none in `imbue`, and no list. */
  const saved = (it: Item, word: WordId | null): Item => {
    const im = word ? imbueItem(it, word, rng) : null;
    const raw = JSON.parse(JSON.stringify(it)) as Record<string, unknown>;
    delete raw.imbues;
    raw.imbue = im;
    return raw as unknown as Item;
  };
  for (let i = 0; i < 300; i++) {
    const rarity = (i % 3) as Rarity;
    const fresh = rollItem(1 + (i % 20), rng, { rarity });
    const found = fresh.rarity;
    const word = i % 2 === 0 ? WORD_IDS[i % WORD_IDS.length] : null;
    // (before 13.2 a word did not change a piece's colour)
    const old = saved(fresh, word);
    old.rarity = found;
    const had = (old as unknown as { imbue: { word: WordId; mods: StatMod[] } | null }).imbue;
    const it = migrateItem(JSON.parse(JSON.stringify(old)) as Item);
    assert.equal('imbue' in it, false, 'the old field is gone');
    assert.ok(Array.isArray(it.imbues));
    assert.deepEqual(it.imbues, had ? [had] : [], it.name);
    assert.equal(JSON.stringify(it.affixes), JSON.stringify(fresh.affixes));
    // a white piece that carried a word is blue now; nothing ever loses its colour
    assert.equal(it.rarity, Math.max(found, rarityFor(it.affixes.length + it.imbues.length)), it.name);
    if (found === 0) assert.equal(it.rarity, had ? 1 : 0, it.name);
    // the hero is exactly as strong as before
    assert.deepEqual(itemMods(it), [...fresh.implicit, ...fresh.affixes.flatMap((a) => a.mods), ...(had ? had.mods : [])]);
    // and bringing it up to date a second time changes nothing
    const once = JSON.stringify(it);
    migrateItem(it);
    assert.equal(JSON.stringify(it), once);
  }
  // a yellow piece with four properties that also held a word keeps all five: it is simply full
  let five = 0;
  for (let i = 0; i < 400 && five < 10; i++) {
    const fresh = rollItem(10, rng, { rarity: 2 });
    if (fresh.affixes.length !== 4) continue;
    const raw = JSON.parse(JSON.stringify(fresh)) as Record<string, unknown>;
    delete raw.imbues;
    raw.imbue = { word: 'power', kind: 'suffix', mods: [{ stat: 'goldFind', value: 9 }] };
    const it = migrateItem(raw as unknown as Item);
    five++;
    assert.equal(it.imbues.length, 1);
    assert.equal(itemRoom(it), 0);
    assert.equal(it.rarity, 2);
    assert.equal(imbueProblem(it, 'fire'), 'That piece is full');
  }
  assert.ok(five >= 10);
});

test('itemValue: every word burned into a piece adds to what it is worth', () => {
  const rng = new RNG(71);
  const item = rollItem(9, rng, { slot: 'ring', rarity: 0 });
  let last = itemValue(item);
  for (const word of ['power', 'swift', 'fire', 'leech'] as WordId[]) {
    assert.ok(imbueItem(item, word, rng), word);
    const now = itemValue(item);
    assert.ok(now > last, `${word}: ${last} -> ${now}`);
    last = now;
  }
});

test('plainWeapon: the plainest of each kind, at any item level', () => {
  for (const kind of WEAPON_KINDS) {
    const it = plainWeapon(kind);
    checkItem(it, 1, 'mainhand', 0);
    assert.equal(it.weapon, kind);
    assert.equal(it.name, it.baseName);
    const later = plainWeapon(kind, 9);
    assert.equal(later.ilvl, 9);
    assert.equal(later.baseId, it.baseId, 'the same plain base');
    assert.ok(averageHit(later.implicit) > averageHit(it.implicit), 'which hits harder at a higher item level');
  }
});

