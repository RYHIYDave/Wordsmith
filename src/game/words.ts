// Power words on abilities. One rule covers every pairing:
//   a word IN FRONT of an ability changes the hit; a word BEHIND it changes what the ability leaves behind.
// Every pairing is assembled from the same few parts (bigger, faster, doubled, element, ground
// patch, echo, rune, buff), so no pairing needs its own code or its own art.

import { ATTR_GIVES, ATTR_NAME, BOMB, CLASSES, FRENZY, GUARD, HEAVY, HEX, MANA_MODE, MYSTIC, PRECISE, PULL, SKILLS, SPLIT, STILL, TUNE, WORDS, WORDS4, holdSkill, isSpell, tapSkill, weaponAttr, wordInert } from './defs';
import type { Limit, SkillDef } from './defs';
import type { Derived, Resolved } from './state';
import type { Attr, ClassId, Element, WeaponKind, WordId } from './types';

const pct = (n: number): string => `${Math.round(n)}%`;

function attrOf(word: WordId, d: Derived): number {
  const a = WORDS[word].attr;
  return a === 'str' ? d.str : a === 'dex' ? d.dex : d.int;
}

/** Why a word cannot go into a socket group, or null if it can. */
export function socketProblem(group: readonly (WordId | null)[], word: WordId): string | null {
  if (!group.includes(null)) return 'No free socket';
  if (group.includes(word)) return 'Already there';
  // ONE DAMAGE WORD A SIDE (his answer, 8 Oct 2026, 16:53: "Yes, one a side (Recommended)"; before, one element a side)
  if (WORDS[word].kind === 'damage' && group.some((w) => w !== null && WORDS[w].kind === 'damage')) return 'One damage word per side';
  return null;
}

/** WORDS4: what a word set on the wrong kind says (on the attack's lines, and over the slot before it is set). */
export function inertLine(w: 'power' | 'mystical'): string {
  return w === 'power' ? 'Power: nothing on a spell. Power is for attacks.' : 'Mystical: nothing on an attack. Mystical is for spells.';
}

/** Whether a word does nothing on this ability (WORDS4: Power on a spell, Mystical on an attack), for the slot to say so. */
export function inertOn(word: WordId, def: SkillDef): boolean {
  return wordInert(word, def.id);
}

/** The ability's display name with its words: "Twin Flame Orb of Echoes". */
export function skillName(def: SkillDef, front: readonly (WordId | null)[], behind: readonly (WordId | null)[]): string {
  const f = front.filter((w): w is WordId => w !== null).map((w) => WORDS[w].front);
  const b = behind.filter((w): w is WordId => w !== null).map((w) => WORDS[w].behind.replace(/^of /, ''));
  let name = [...f, def.name].join(' ');
  if (b.length) name += ' of ' + b.join(' and ');
  return name;
}

/**
 * `grows`: the attribute the ability grows with. The two attacks grow with their weapon's (a
 * sword's with Strength, whoever swings it: defs.ts, WEAPON_ATTR); the evasive move with the
 * character's own, for which the class may be named instead.
 * `limit`: how the abilities that wait are held back. 'cooldown': they wait between uses and cost
 * no mana. 'mana': they cost mana and need only a moment between uses.
 */
export function resolveSkill(def: SkillDef, front: readonly (WordId | null)[], behind: readonly (WordId | null)[], grows: Attr | ClassId, d: Derived, limit: Limit = 'cooldown'): Resolved {
  // (WORDS4: Power does nothing on a spell, nor Mystical on an attack: wordInert)
  const has = (g: readonly (WordId | null)[], w: WordId): boolean => g.includes(w) && !wordInert(w, def.id);
  // (one enemy at a time: a blade, a shot, a familiar's bolt. A word that makes "the hit" bigger gives these a splash.)
  const single = def.kind === 'melee' || def.kind === 'projectile' || def.kind === 'summon';
  const lines: string[] = [def.desc];

  // Damage element: the element word in front decides; failing that, the one behind.
  let element: Element = 'phys';
  for (const w of [...front, ...behind]) {
    if (w !== null && WORDS[w].element) {
      element = WORDS[w].element as Element;
      break;
    }
  }

  const attr: Attr = grows === 'str' || grows === 'dex' || grows === 'int' ? grows : CLASSES[grows].primary;
  const prim = attr === 'str' ? d.str : attr === 'dex' ? d.dex : d.int;
  let dmgMult = def.dmg * (1 + (prim * ATTR_GIVES.primaryDmg) / 100);
  let size = d.area;
  let rate = d.aps;
  let cooldown = def.cooldown * (1 - d.cdr);
  let mana = 0;
  const byMana = limit === 'mana' && def.cooldown > 0;
  if (byMana) {
    // (what would have shortened the cooldown makes it cheaper instead)
    mana = (def.mana > 0 ? def.mana * MANA_MODE.cost : MANA_MODE.evade) * (1 - d.cdr);
    cooldown = def.mana > 0 ? MANA_MODE.recover : MANA_MODE.evadeRecover;
  }
  let projSpeed = def.speed;

  const r: Resolved = {
    id: def.id, name: skillName(def, front, behind), element, dmgMult: 0, size: 1, rate: 0, cooldown: 0, mana: 0,
    count: 1, countDmg: 1, splash: 0, splashDmg: 0, pierce: false, projSpeed: 0,
    ignite: 0, chill: 0, arcs: 0, arcDmg: 0, leech: 0, volatile: 0, poison: 0, stun: 0, precise: false, frenzy: false, shield: 0,
    might: 0, haste: 0, echo: 0, zone: null, orbChance: 0, rune: 0, cloud: 0, cracks: 0, mark: false, frenzyFeed: false, ward: 0, lines,
    mystic: false, bomb: 0, pull: 0, split: 0, hex: 0, still: 0, arcana: 0, vortex: false, shards: 0, hexCircle: false, bubble: false,
  };

  // (WORDS4: a word set on the wrong kind says so, and does nothing: his answer of 8 Oct 2026, 16:53, "Nothing (Recommended)")
  for (const w of ['power', 'mystical'] as const) {
    if (!(front.includes(w) || behind.includes(w)) || !wordInert(w, def.id)) continue;
    lines.push(inertLine(w));
  }

  // ----- in front: the hit -----
  if (has(front, 'power')) {
    const a = attrOf('power', d);
    const dmg = 25 + 0.6 * a;
    const big = 20 + 0.3 * a;
    dmgMult *= 1 + dmg / 100;
    size *= 1 + big / 100;
    if (single) {
      r.splash = Math.max(r.splash, 1.2);
      r.splashDmg = Math.max(r.splashDmg, 0.5);
    }
    lines.push(`Power: +${pct(dmg)} damage, +${pct(big)} size${single ? ', splashes nearby enemies' : ''}.`);
  }
  // MYSTICAL in front (WORDS4): for spells what Power is for attacks
  if (has(front, 'mystical')) {
    const a = attrOf('mystical', d);
    const dmg = MYSTIC.dmg + MYSTIC.dmgPer * a;
    const big = MYSTIC.big + MYSTIC.bigPer * a;
    dmgMult *= 1 + dmg / 100;
    size *= 1 + big / 100;
    r.mystic = true;
    if (single) {
      r.splash = Math.max(r.splash, MYSTIC.splash);
      r.splashDmg = Math.max(r.splashDmg, MYSTIC.splashDmg);
    }
    lines.push(`Mystical: +${pct(dmg)} spell damage, +${pct(big)} size${single ? ', splashes nearby enemies' : ''}.`);
  }
  if (has(front, 'swift')) {
    const a = attrOf('swift', d);
    if (def.cooldown > 0) {
      const cut = Math.min(60, 20 + 0.3 * a);
      if (byMana) {
        mana *= 1 - cut / 100;
        lines.push(`Swift: costs ${pct(cut)} less mana.`);
      } else {
        cooldown *= 1 - cut / 100;
        lines.push(`Swift: ${pct(cut)} shorter cooldown.`);
      }
    } else {
      const fast = 25 + 0.5 * a;
      rate *= 1 + fast / 100;
      lines.push(`Swift: +${pct(fast)} attack speed.`);
    }
    projSpeed *= 1.3;
  }
  if (has(front, 'twin')) {
    // The owner's rule for words that add: they take something too. Two of everything, each the
    // weaker for it, and (for shots) no enemy takes both: a bow at arm's length does not double.
    const each = Math.min(80, 55 + 0.25 * attrOf('twin', d));
    r.count = 2;
    r.countDmg = each / 100;
    lines.push(
      def.kind === 'projectile' ? `Twin: two shots, each for ${pct(each)}. One enemy takes only one of them.`
      : def.kind === 'beam' ? `Twin: two beams side by side, each for ${pct(each)}. One enemy takes only one of them.`
      : def.kind === 'wave' ? `Twin: two waves, fanned apart, each for ${pct(each)}. One enemy takes only one of them.`
      : def.kind === 'summon' ? `Twin: every familiar shoots two bolts, each for ${pct(each)}. One enemy takes only one of them.`
      : def.kind === 'orb' ? `Twin: every wave comes twice, each for ${pct(each)}.`
      : def.kind === 'whirl' ? `Twin: every turn cuts twice, each for ${pct(each)}.`
      : def.kind === 'volley' ? `Twin: the arrows come down in pairs, each for ${pct(each)}.`
      : def.kind === 'roll' ? `Twin: a second trap where the roll ends, each for ${pct(each)}.`
      : def.kind === 'leap' ? `Twin: lands with two shocks, each for ${pct(each)}.`
      : def.kind === 'warp' ? `Twin: arrives with two bursts, each for ${pct(each)}.`
      : `Twin: hits twice, each for ${pct(each)}.`,
    );
  }
  if (has(front, 'fire')) {
    const burn = 30 + 0.8 * attrOf('fire', d);
    r.ignite = burn / 100;
    if (single) {
      r.splash = Math.max(r.splash, 1.5);
      r.splashDmg = 1;
    }
    lines.push(`Flame: fire damage${single ? ', explodes on contact' : ''}, burns for ${pct(burn)} more over 3 s.`);
  }
  if (has(front, 'frost')) {
    const slow = Math.min(70, 30 + 0.3 * attrOf('frost', d));
    r.chill = slow / 100;
    if (single) {
      r.splash = Math.max(r.splash, 1.5);
      r.splashDmg = 1;
    }
    lines.push(`Frost: frost damage${single ? ', bursts on contact' : ''}, slows by ${pct(slow)}; a second hit freezes.`);
  }
  if (has(front, 'lightning')) {
    const a = attrOf('lightning', d);
    const arc = 40 + 0.5 * a;
    r.arcs = 2 + Math.floor(d.int / 40);
    r.arcDmg = arc / 100;
    lines.push(`Lightning: lightning damage, arcs to ${r.arcs} more enemies for ${pct(arc)}.`);
  }
  if (has(front, 'leech')) {
    r.leech = 1 + 0.08 * attrOf('leech', d);
    lines.push(`Leeching: heals ${r.leech.toFixed(1)} life per enemy hit.`);
  }
  if (has(front, 'poison')) {
    // a weaker hit, and the poison does the work: every hit adds a dose
    const dose = 20 + 0.4 * attrOf('poison', d);
    r.poison = dose / 100;
    dmgMult *= 0.8;
    lines.push(`Poison: hits 20% softer; poisons for ${pct(dose)} of the hit a second for ${TUNE.poisonTime} s. Up to ${TUNE.poisonStacks} doses add up.`);
  }
  if (has(front, 'volatile')) {
    if (WORDS4.on) {
      // VOLATILE'S HIDDEN BOMB (WORDS4; his words of 5 Oct 2026: "Like you secretly stuck a bomb on them"), by Dexterity
      const boom = BOMB.dmg + BOMB.per * attrOf('volatile', d);
      r.bomb = boom / 100;
      lines.push(`Volatile: sticks a hidden charge on what it hits; ${BOMB.delay} s later it bursts for ${pct(boom)} of the hit, on all near it.`);
    } else {
      const boom = 12 + 0.2 * attrOf('volatile', d);
      r.volatile = boom / 100;
      lines.push(`Volatile: enemies it kills explode for ${pct(boom)} of their life.`);
    }
  }

  // THE NEW WORDS IN FRONT (Version 19.3; his doc "Wordsmith: The New Words", his yes of 8 Oct 2026,
  // 16:53; the numbers are its starting points)
  if (has(front, 'heavy')) {
    // slower, much harder, and it stuns
    const a = attrOf('heavy', d);
    const more = 50 + 0.5 * a;
    dmgMult *= 1 + more / 100;
    if (def.cooldown > 0) {
      if (byMana) mana *= HEAVY.slower;
      else cooldown *= HEAVY.slower;
    } else rate /= HEAVY.slower;
    r.stun = HEAVY.stun;
    lines.push(`Heavy: +${pct(more)} damage, ${pct((HEAVY.slower - 1) * 100)} slower; stuns for ${HEAVY.stun} s.`);
  }
  if (has(front, 'precise')) {
    // his change (5 Oct): more damage, not a critical chance; and a smaller area
    const a = attrOf('precise', d);
    const more = 30 + 0.5 * a;
    dmgMult *= 1 + more / 100;
    size *= PRECISE.area;
    r.precise = true;
    lines.push(`Precise: +${pct(more)} damage, ${pct((1 - PRECISE.area) * 100)} smaller area.`);
  }
  if (has(front, 'frenzied')) {
    r.frenzy = true;
    lines.push(`Frenzied: each use makes the next ${pct(FRENZY.each * 100)} faster, up to ${FRENZY.max} times; it fades ${FRENZY.hold} s after the last.`);
  }
  if (has(front, 'guarding')) {
    const a = attrOf('guarding', d);
    r.shield = Math.min(0.2, GUARD.shield + 0.001 * a);
    lines.push(`Guarding: each use gives you a shield of ${pct(r.shield * 100)} of your life for ${GUARD.shieldTime} s.`);
  }
  // THE WORDS STILL TO COME IN FRONT (WORDS4; the same doc's starting points)
  if (has(front, 'pulling')) {
    r.pull = Math.min(2.5, PULL.drag + 0.005 * attrOf('pulling', d));
    lines.push(`Pulling: drags what it hits up to ${r.pull.toFixed(1)} tiles toward the blow.`);
  }
  if (has(front, 'splitting')) {
    r.split = Math.min(0.6, SPLIT.copyDmg + 0.002 * attrOf('splitting', d));
    lines.push(`Splitting: on its first hit it breaks into ${SPLIT.copies} smaller copies, each for ${pct(r.split * 100)}, that go on to other enemies.`);
  }
  if (has(front, 'hexing')) {
    r.hex = HEX.secs + 0.01 * attrOf('hexing', d);
    lines.push(`Hexing: curses what it hits for ${r.hex.toFixed(1)} s: it takes ${pct(HEX.more * 100)} more damage from everything.`);
  }
  if (has(front, 'stilling')) {
    r.still = STILL.secs + 0.01 * attrOf('stilling', d);
    lines.push(`Stilling: what it hits moves, attacks and shoots ${pct(STILL.slow * 100)} slower for ${r.still.toFixed(1)} s.`);
  }

  // ----- behind: the wake -----
  let softer = false;
  if (has(behind, 'power')) {
    r.might = 6 + 0.1 * attrOf('power', d);
    lines.push(`of Power: each hit that lands adds +${pct(r.might)} damage for 5 s (up to 5 times).`);
  }
  if (has(behind, 'mystical')) {
    r.arcana = MYSTIC.arcana + MYSTIC.arcanaPer * attrOf('mystical', d);
    lines.push(`of Mysteries: each spell hit that lands adds +${pct(r.arcana)} spell damage for ${MYSTIC.secs} s (up to ${MYSTIC.max} times).`);
  }
  if (has(behind, 'swift')) {
    r.haste = 15 + 0.2 * attrOf('swift', d);
    lines.push(`of Swiftness: +${pct(r.haste)} movement speed for 3 s after each use.`);
  }
  if (has(behind, 'twin')) {
    const again = Math.min(100, 40 + 0.5 * attrOf('twin', d));
    r.echo = again / 100;
    lines.push(`of Echoes: repeats a moment later for ${pct(again)}.`);
  }
  for (const w of behind) {
    if (w !== 'fire' && w !== 'frost' && w !== 'lightning') continue;
    const a = attrOf(w, d);
    softer = true;
    r.pierce = true;
    if (w === 'fire') {
      const dps = 25 + 0.6 * a;
      r.zone = { kind: 'burn', element: 'fire', dps: dps / 100, slow: 0, dur: 4 };
      lines.push(`of Flame: passes through, leaves ground that burns for ${pct(dps)} a second.`);
    } else if (w === 'frost') {
      const slow = Math.min(75, 40 + 0.3 * a);
      const dps = 10 + 0.2 * a;
      r.zone = { kind: 'ice', element: 'frost', dps: dps / 100, slow: slow / 100, dur: 4 };
      lines.push(`of Frost: passes through, leaves ice that slows by ${pct(slow)}.`);
    } else {
      const zap = 30 + 0.6 * a;
      r.zone = { kind: 'storm', element: 'lightning', dps: zap / 100, slow: 0, dur: 4 };
      lines.push(`of Lightning: passes through, leaves a storm that strikes for ${pct(zap)}.`);
    }
    break; // one element behind
  }
  if (has(behind, 'leech')) {
    const chance = Math.min(90, 35 + 0.4 * attrOf('leech', d));
    r.orbChance = chance / 100;
    lines.push(`of Leeching: enemies it kills drop a life orb ${pct(chance)} of the time.`);
  }
  if (has(behind, 'poison')) {
    const dose = 25 + 0.5 * attrOf('poison', d);
    r.cloud = dose / 100;
    lines.push(`of Venom: leaves a cloud that poisons for ${pct(dose)} of the hit a second.`);
  }
  if (has(behind, 'volatile')) {
    const boom = 70 + attrOf('volatile', d);
    r.rune = boom / 100;
    lines.push(`of Ruin: leaves a rune that detonates for ${pct(boom)}.`);
  }
  // THE NEW WORDS BEHIND (Version 19.3)
  if (has(behind, 'heavy')) {
    r.cracks = HEAVY.cracks;
    lines.push(`of Quakes: leaves cracked ground for ${HEAVY.cracks} s; an enemy walking onto it is staggered.`);
  }
  if (has(behind, 'precise')) {
    r.mark = true;
    lines.push('of the Mark: marks the first enemy it hits; your next hit on it is a certain critical.');
  }
  if (has(behind, 'frenzied')) {
    r.frenzyFeed = true;
    lines.push(`of Frenzy: each kill adds a stack and holds the frenzy ${FRENZY.hold} s more.`);
  }
  if (has(behind, 'guarding')) {
    const a = attrOf('guarding', d);
    r.ward = Math.min(0.5, GUARD.ward + 0.002 * a);
    lines.push(`of Warding: leaves a ward circle for ${GUARD.wardTime} s; inside it you take ${pct(r.ward * 100)} less damage.`);
  }
  // THE WORDS STILL TO COME BEHIND (WORDS4)
  if (has(behind, 'pulling')) {
    r.vortex = true;
    lines.push(`of the Vortex: leaves a vortex for ${PULL.secs} s that draws enemies to its middle.`);
  }
  if (has(behind, 'splitting')) {
    r.shards = Math.min(0.45, SPLIT.shardDmg + 0.001 * attrOf('splitting', d));
    lines.push(`of Shards: where it ends, ${SPLIT.shards} shards fly out all round, each for ${pct(r.shards * 100)}.`);
  }
  if (has(behind, 'hexing')) {
    r.hexCircle = true;
    lines.push(`of the Hex: leaves a hex circle for ${HEX.circleSecs} s; enemies in it deal ${pct(HEX.weaker * 100)} less damage.`);
  }
  if (has(behind, 'stilling')) {
    r.bubble = true;
    lines.push(`of Stillness: leaves a bubble for ${STILL.bubbleSecs} s where enemies and their shots go ${pct(STILL.crawl * 100)} slower.`);
  }
  if (softer) dmgMult *= 0.7;

  r.dmgMult = dmgMult;
  r.size = size;
  r.rate = rate;
  r.cooldown = cooldown;
  r.mana = Math.round(mana);
  r.projSpeed = projSpeed;
  return r;
}

/** Convenience for abilities with no words (evasive moves, previews). */
export function resolveBare(id: keyof typeof SKILLS, grows: Attr | ClassId, d: Derived): Resolved {
  return resolveSkill(SKILLS[id], [], [], grows, d);
}

/**
 * Which of a character's abilities grow with an attribute: both attacks if the weapon in hand
 * grows with it, and the evasive move, if it does any harm (they all do since Version 12.2), when
 * the class does. For the level-up screen ("+5% Wave and Orb damage").
 */
export function attacksGrownBy(a: Attr, cls: ClassId, weapon: WeaponKind | null): string[] {
  const out: string[] = [];
  if (weaponAttr(weapon) === a) out.push(SKILLS[tapSkill(weapon)].name, SKILLS[holdSkill(weapon)].name);
  const c = CLASSES[cls];
  if (c.primary === a && SKILLS[c.evade].dmg > 0) out.push(SKILLS[c.evade].name);
  return out;
}

/** "Strike", "Strike and Slam", "Strike, Slam and Leap". */
export function listed(names: readonly string[]): string {
  return names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/**
 * What a weapon gives whoever holds it, in two short lines:
 * "Tap: WAVE. Hold: ORB." / "They grow with Intelligence."
 */
export function weaponLines(weapon: WeaponKind, touch: boolean): [string, string] {
  const tap = SKILLS[tapSkill(weapon)].name.toUpperCase();
  const hold = SKILLS[holdSkill(weapon)].name.toUpperCase();
  return [`${touch ? 'Tap' : 'Click'}: ${tap}. ${touch ? 'Hold' : 'Right click'}: ${hold}.`, `They grow with ${ATTR_NAME[weaponAttr(weapon)]}.`];
}
