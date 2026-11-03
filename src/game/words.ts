// Power words on abilities. One rule covers every pairing:
//   a word IN FRONT of an ability changes the hit; a word BEHIND it changes what the ability leaves behind.
// Every pairing is assembled from the same few parts (bigger, faster, doubled, element, ground
// patch, echo, rune, buff), so no pairing needs its own code or its own art.

import { ATTR_GIVES, ATTR_NAME, ATTR_SPLIT, BIND, CLASSES, FRENZY, GUARD, HEAVY, HEX, HYBRID_LESS, MANA_MODE, OWN_MOVES, PRECISE, PULL, SKILLS, SPLIT, STILL, TUNE, WORDS, holdSkill, tapSkill, wordAttr, weaponAttr } from './defs';
import type { Limit, SkillDef } from './defs';
import type { Derived, Resolved } from './state';
import type { Attr, ClassId, Element, MeldId, WeaponKind, WordId } from './types';
import { RANK_OF } from './types';
import { MELD_TUNE, RANK_TUNE, isDamageWord, isMeld, isRank, partsOf, rankOf } from './melds';

const pct = (n: number): string => `${Math.round(n)}%`;
const secs = (n: number): string => String(Math.round(n * 10) / 10);

function attrOf(word: WordId, d: Derived): number {
  const a = WORDS[word].attr;
  return a === 'str' ? d.str : a === 'dex' ? d.dex : d.int;
}

/** Why a word cannot go into a socket group, or null if it can. */
export function socketProblem(group: readonly (WordId | null)[], word: WordId): string | null {
  if (!group.includes(null)) return 'No free socket';
  if (group.includes(word)) return 'Already there';
  // ONE DAMAGE WORD A SIDE (his answer, 8 Oct 2026, 16:53: "Yes, one a side (Recommended)"; before, one element a side).
  // (WORDMELDING: a melded word takes that place, his pick of 13 Oct 2026, 12:36: "Yes, it takes that place (Recommended)")
  if (isDamageWord(word) && group.some((w) => w !== null && isDamageWord(w))) return 'One damage word per side';
  return null;
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
  // (WORDMELDING: a melded word does the work of both its words, so for all that follows it is both of
  // them; its own twist is added after, by `meld` and `meldBehind`)
  const has = (g: readonly (WordId | null)[], w: WordId): boolean => g.some((x) => x !== null && (x === w || partsOf(x).includes(w)));
  const meldIn = (g: readonly (WordId | null)[]): MeldId | null => (g.find((x): x is MeldId => x !== null && isMeld(x)) ?? null);
  const meld = meldIn(front);
  const meldBehind = meldIn(behind);
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
  const val = (a: Attr): number => (a === 'str' ? d.str : a === 'dex' ? d.dex : d.int);
  // (a class of two attributes, the warlock: their sum less HYBRID_LESS, defs.ts ClassDef.grows)
  const two = grows === 'str' || grows === 'dex' || grows === 'int' ? undefined : CLASSES[grows].grows;
  const prim = two ? Math.max(0, val(two[0]) + val(two[1]) - HYBRID_LESS) : val(attr);
  // HOW MUCH A WORD HERE GROWS (ATTR_SPLIT, defs.ts; his "Yeah that’s a good split", 17 Oct 2026): by the attribute of the
  // melded word it is a part of, on that side; fire, frost and lightning set alone, by this ability's own (its weapon's,
  // or the class's on the evasive move); any other word, by its own. (Off: every word by its own, as before.)
  const growsBy = (side: readonly (WordId | null)[], w: WordId): number => {
    if (!ATTR_SPLIT.on) return attrOf(w, d);
    const m = meldIn(side);
    const a = (m && partsOf(m).includes(w) ? wordAttr(m) : wordAttr(w)) ?? attr;
    return a === 'str' ? d.str : a === 'dex' ? d.dex : d.int;
  };
  // RANK II (game/melds.ts, behind RANK2): a ranked word on this side is its word half as strong again. The word's own
  // figure grows; what the attribute adds stays on top, as now (his table of 5 Oct 2026: "Your stats add on top").
  const rankIn = (side: readonly (WordId | null)[], w: WordId): number => {
    const x = side.find((y) => y !== null && isRank(y) && RANK_OF[y].word === w);
    return x ? rankOf(x) : 1;
  };
  const rk = (side: readonly (WordId | null)[], w: WordId): number => 1 + RANK_TUNE.step * (rankIn(side, w) - 1);
  const rn = (side: readonly (WordId | null)[], w: WordId): string => ['', '', ' II', ' III', ' IV', ' V'][rankIn(side, w)] ?? '';
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
    ignite: 0, chill: 0, arcs: 0, arcDmg: 0, leech: 0, volatile: 0, poison: 0, stun: 0, precise: false, frenzy: false, shield: 0, meld,
    might: 0, haste: 0, echo: 0, zone: null, orbChance: 0, rune: 0, cloud: 0, cracks: 0, mark: false, frenzyFeed: false, ward: 0, pull: 0, split: 0, hex: 0, still: 0, vortex: 0, shards: 0, hexCircle: 0, bubble: 0, bind: 0, snare: 0, meldBehind, lines,
  };

  // ----- in front: the hit -----
  if (has(front, 'power')) {
    const a = growsBy(front, 'power');
    const k = rk(front, 'power');
    const dmg = 25 * k + 0.6 * a;
    const big = 20 * k + 0.3 * a;
    dmgMult *= 1 + dmg / 100;
    size *= 1 + big / 100;
    if (single) {
      r.splash = Math.max(r.splash, 1.2);
      r.splashDmg = Math.max(r.splashDmg, 0.5);
    }
    lines.push(`Power${rn(front, 'power')}: +${pct(dmg)} damage, +${pct(big)} size${single ? ', splashes nearby enemies' : ''}.`);
  }
  if (has(front, 'swift')) {
    const a = growsBy(front, 'swift');
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
    const each = Math.min(80, 55 + 0.25 * growsBy(front, 'twin'));
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
    const burn = 30 * rk(front, 'fire') + 0.8 * growsBy(front, 'fire');
    r.ignite = burn / 100;
    if (single) {
      r.splash = Math.max(r.splash, 1.5);
      r.splashDmg = 1;
    }
    lines.push(`Flame${rn(front, 'fire')}: fire damage${single ? ', explodes on contact' : ''}, burns for ${pct(burn)} more over 3 s.`);
  }
  if (has(front, 'frost')) {
    const slow = Math.min(70, 30 * rk(front, 'frost') + 0.3 * growsBy(front, 'frost'));
    r.chill = slow / 100;
    if (single) {
      r.splash = Math.max(r.splash, 1.5);
      r.splashDmg = 1;
    }
    lines.push(`Frost${rn(front, 'frost')}: frost damage${single ? ', bursts on contact' : ''}, slows by ${pct(slow)}; a second hit freezes.`);
  }
  if (has(front, 'lightning')) {
    const a = growsBy(front, 'lightning');
    const arc = 40 * rk(front, 'lightning') + 0.5 * a;
    r.arcs = 2 + Math.floor((ATTR_SPLIT.on ? a : d.int) / 40);
    r.arcDmg = arc / 100;
    // (THUNDER: one big bolt instead of arcs: its twist, below)
    if (meld === 'thunder') lines.push('Lightning: lightning damage.');
    else lines.push(`Lightning${rn(front, 'lightning')}: lightning damage, arcs to ${r.arcs} more enemies for ${pct(arc)}.`);
  }
  if (has(front, 'leech')) {
    r.leech = 1 + 0.08 * growsBy(front, 'leech');
    lines.push(`Leeching: heals ${r.leech.toFixed(1)} life per enemy hit.`);
  }
  if (has(front, 'poison')) {
    // a weaker hit, and the poison does the work: every hit adds a dose
    const dose = 20 * rk(front, 'poison') + 0.4 * growsBy(front, 'poison');
    r.poison = dose / 100;
    // (BLIGHT: the hit is not weakened)
    if (meld !== 'blight') dmgMult *= 0.8;
    lines.push(`Poison${rn(front, 'poison')}: ${meld === 'blight' ? 'poisons' : 'hits 20% softer; poisons'} for ${pct(dose)} of the hit a second for ${TUNE.poisonTime} s. Up to ${TUNE.poisonStacks} doses add up.`);
  }
  if (has(front, 'volatile')) {
    const boom = 12 + 0.2 * growsBy(front, 'volatile');
    r.volatile = boom / 100;
    lines.push(`Volatile: enemies it kills explode for ${pct(boom)} of their life.`);
  }

  // THE NEW WORDS IN FRONT (Version 19.3; his doc "Wordsmith: The New Words", his yes of 8 Oct 2026,
  // 16:53; the numbers are its starting points)
  if (has(front, 'heavy')) {
    // slower, much harder, and it stuns
    const a = growsBy(front, 'heavy');
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
    const a = growsBy(front, 'precise');
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
    const a = growsBy(front, 'guarding');
    r.shield = Math.min(0.2, GUARD.shield + 0.001 * a);
    lines.push(`Guarding: each use gives you a shield of ${pct(r.shield * 100)} of your life for ${GUARD.shieldTime} s.`);
  }
  // THE CITY'S WORDS IN FRONT (Version 23.8; his doc "Wordsmith: The New Words": the numbers its starting points, each growing a
  // little with its attribute, a tenth of a percent a point, a two-hundredth of a tile for Pulling's drag)
  if (has(front, 'pulling')) {
    r.pull = Math.min(PULL.most, PULL.far + 0.005 * growsBy(front, 'pulling'));
    lines.push(`Pulling: drags the enemies it hits up to ${r.pull.toFixed(1)} tiles toward where it struck.`);
  }
  if (has(front, 'splitting')) {
    r.split = Math.min(SPLIT.most, SPLIT.share + 0.001 * growsBy(front, 'splitting'));
    lines.push(`Splitting: its first hit breaks into ${SPLIT.copies} copies of ${pct(r.split * 100)} that fly on to other enemies.`);
  }
  if (has(front, 'hexing')) {
    r.hex = Math.min(HEX.most, HEX.more + 0.001 * growsBy(front, 'hexing'));
    lines.push(`Hexing: curses what it hits for ${HEX.secs} s: it takes ${pct(r.hex * 100)} more damage from everything.`);
  }
  if (has(front, 'stilling')) {
    r.still = Math.min(STILL.most, STILL.slower + 0.001 * growsBy(front, 'stilling'));
    lines.push(`Stilling: what it hits is slowed in time for ${STILL.secs} s: it moves, attacks and shoots ${pct(r.still * 100)} slower.`);
  }
  if (has(front, 'binding')) {
    r.bind = Math.min(BIND.most, BIND.secs + 0.004 * growsBy(front, 'binding'));
    lines.push(`Binding: holds what it hits in place for ${secs(r.bind)} s (an elite half as long, a boss not at all).`);
  }

  // ----- behind: the wake -----
  let softer = false;
  if (has(behind, 'power')) {
    r.might = 6 * rk(behind, 'power') + 0.1 * growsBy(behind, 'power');
    lines.push(`of Power${rn(behind, 'power')}: each hit that lands adds +${pct(r.might)} damage for 5 s (up to 5 times).`);
  }
  if (has(behind, 'swift')) {
    r.haste = 15 + 0.2 * growsBy(behind, 'swift');
    lines.push(`of Swiftness: +${pct(r.haste)} movement speed for 3 s after each use.`);
  }
  if (has(behind, 'twin')) {
    const again = Math.min(100, 40 + 0.5 * growsBy(behind, 'twin'));
    r.echo = again / 100;
    lines.push(`of Echoes: repeats a moment later for ${pct(again)}.`);
  }
  for (const w of behind.flatMap((x) => (x === null ? [] : partsOf(x)))) {
    if (w !== 'fire' && w !== 'frost' && w !== 'lightning') continue;
    const a = growsBy(behind, w);
    softer = true;
    r.pierce = true;
    const k = rk(behind, w);
    const tag = rn(behind, w);
    if (w === 'fire') {
      const dps = 25 * k + 0.6 * a;
      r.zone = { kind: 'burn', element: 'fire', dps: dps / 100, slow: 0, dur: 4 };
      lines.push(`of Flame${tag}: passes through, leaves ground that burns for ${pct(dps)} a second.`);
    } else if (w === 'frost') {
      const slow = Math.min(75, 40 * k + 0.3 * a);
      const dps = 10 * k + 0.2 * a;
      r.zone = { kind: 'ice', element: 'frost', dps: dps / 100, slow: slow / 100, dur: 4 };
      lines.push(`of Frost${tag}: passes through, leaves ice that slows by ${pct(slow)}.`);
    } else {
      const zap = 30 * k + 0.6 * a;
      r.zone = { kind: 'storm', element: 'lightning', dps: zap / 100, slow: 0, dur: 4 };
      lines.push(`of Lightning${tag}: passes through, leaves a storm that strikes for ${pct(zap)}.`);
    }
    break; // one element behind
  }
  if (has(behind, 'leech')) {
    const chance = Math.min(90, 35 + 0.4 * growsBy(behind, 'leech'));
    r.orbChance = chance / 100;
    lines.push(`of Leeching: enemies it kills drop a life orb ${pct(chance)} of the time.`);
  }
  if (has(behind, 'poison')) {
    const dose = 25 * rk(behind, 'poison') + 0.5 * growsBy(behind, 'poison');
    r.cloud = dose / 100;
    lines.push(`of Venom${rn(behind, 'poison')}: leaves a cloud that poisons for ${pct(dose)} of the hit a second.`);
  }
  if (has(behind, 'volatile')) {
    const boom = 70 + growsBy(behind, 'volatile');
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
    const a = growsBy(behind, 'guarding');
    r.ward = Math.min(0.5, GUARD.ward + 0.002 * a);
    lines.push(`of Warding: leaves a ward circle for ${GUARD.wardTime} s; inside it you take ${pct(r.ward * 100)} less damage.`);
  }
  // THE CITY'S WORDS BEHIND (Version 23.8)
  if (has(behind, 'pulling')) {
    r.vortex = PULL.vortex;
    lines.push(`of the Vortex: leaves a vortex for ${PULL.vortex} s that keeps drawing enemies in to its middle.`);
  }
  if (has(behind, 'splitting')) {
    r.shards = Math.min(SPLIT.shardMost, SPLIT.shardShare + 0.001 * growsBy(behind, 'splitting'));
    lines.push(`of Shards: where it ends, ${SPLIT.shards} shards of ${pct(r.shards * 100)} fly out in every direction.`);
  }
  if (has(behind, 'hexing')) {
    r.hexCircle = Math.min(HEX.weakest, HEX.weaker + 0.001 * growsBy(behind, 'hexing'));
    lines.push(`of Hexes: leaves a hex circle for ${HEX.circle} s; enemies inside deal ${pct(r.hexCircle * 100)} less damage.`);
  }
  if (has(behind, 'stilling')) {
    r.bubble = Math.min(STILL.crawlMost, STILL.crawl + 0.001 * growsBy(behind, 'stilling'));
    lines.push(`of Stillness: leaves a bubble for ${STILL.bubble} s where enemies and their shots are ${pct(r.bubble * 100)} slower.`);
  }
  if (has(behind, 'binding')) {
    r.snare = Math.min(BIND.snareMost, BIND.snareSecs + 0.004 * growsBy(behind, 'binding'));
    lines.push(`of the Snare: leaves a snare; the next enemy to cross it is held in place for ${secs(r.snare)} s.`);
  }
  if (softer) dmgMult *= 0.7;

  // ----- WORDMELDING: each melded word's twist, in front and behind (game/melds.ts) -----
  if (meld) {
    const T = MELD_TUNE;
    const twist = (s: string): void => {
      lines.push(`${WORDS[meld].name}: ${s}`);
    };
    if (meld === 'eruption') twist(`the blast leaves a pool of molten ground that burns for ${pct(T.eruption.poolDps * 100)} of the hit a second.`);
    else if (meld === 'avalanche') twist(`shoves enemies ${T.avalanche.shove} tiles back; one that is stopped by a wall or another is frozen.`);
    else if (meld === 'thunder') {
      // one big bolt instead of arcs, and it stuns
      r.arcs = 0;
      r.arcDmg = 0;
      dmgMult *= 1 + T.thunder.bolt;
      r.stun = Math.max(r.stun, T.thunder.stun);
      twist(`one bolt ${pct(T.thunder.bolt * 100)} harder instead of arcs; it stuns for ${T.thunder.stun} s.`);
    } else if (meld === 'blight') twist(`the hit is not weakened, and its poison bites up to ${T.blight.most} times harder as the enemy's life runs out.`);
    else if (meld === 'scald') twist(`a burning enemy that gets chilled, or a chilled one set burning, cracks for ${pct(T.scald.crack * 100)} of the hit.`);
    else if (meld === 'wildfire') twist('its arcs set burning what they strike.');
    else if (meld === 'fumes') twist(`an enemy both burning and poisoned gives off a toxic cloud.`);
    else if (meld === 'hailstorm') twist('its arcs chill what they strike; a frozen enemy passes the arc on.');
    else if (meld === 'frostbite') twist(`a chilled enemy loses ${pct(T.frostbite.bite * 100)} of the hit a second, a frozen one twice that.`);
    else if (meld === 'contagion') twist('every enemy its arcs strike is poisoned.');
    // (VOLATILE'S MELDS, behind VOLT_MELDS: what Volatile in front does, and more)
    else if (meld === 'demolition') twist(`its explosions ${pct((T.demolition.bigger - 1) * 100)} bigger; an elite or a boss explodes once at half its life.`);
    else if (meld === 'powderkeg') twist('a burning enemy killed explodes harder, and the blast sets others burning.');
    else if (meld === 'shatter') twist(`a frozen enemy killed bursts into shards that hit those around it for ${pct(T.shatter.share * 100)} of its life.`);
    else if (meld === 'chainreaction') twist(`an exploding enemy sends arcs to the ${T.chainreaction.arcs} nearest; those it kills explode too.`);
    else if (meld === 'rupture') twist('a poisoned enemy killed bursts, splashing its poison on those around.');
  }
  if (meldBehind) {
    const T = MELD_TUNE;
    const twist = (s: string): void => {
      lines.push(`${WORDS[meldBehind].behind}: ${s}`);
    };
    // (a line of one of its words that its twist does in another way)
    const drop = (start: string): void => {
      const k = lines.findIndex((l) => l.startsWith(start));
      if (k >= 0) lines.splice(k, 1);
    };
    if (meldBehind === 'eruption') twist(`each hit builds heat; at ${T.eruption.heat}, the next hit erupts for ${pct(T.eruption.blast * 100)}.`);
    else if (meldBehind === 'avalanche') twist(`every hit on a chilled enemy, ${pct(T.avalanche.chilled * 100)} harder.`);
    else if (meldBehind === 'thunder') twist(`every ${T.thunder.every} hits, a thunderclap bursts around you for ${pct(T.thunder.clap * 100)}.`);
    else if (meldBehind === 'blight') twist(`an enemy it poisons takes ${pct(T.blight.more * 100)} more damage from everything while poisoned.`);
    else if (meldBehind === 'scald') {
      // fire meeting ice on the ground: steam, in place of either
      drop('of Flame:');
      const a = growsBy(behind, 'fire');
      r.zone = { kind: 'steam', element: 'fire', dps: T.scald.steamDps + 0.004 * a, slow: T.scald.slow, dur: T.scald.dur };
      twist(`fire meets ice: it leaves steam that hurts and slows by ${pct(T.scald.slow * 100)}, and hides you while you stand in it.`);
    } else if (meldBehind === 'wildfire') twist(`the burning ground throws sparks at enemies within ${T.wildfire.reach} tiles.`);
    else if (meldBehind === 'fumes') twist('the poison cloud explodes when anything burning comes into it.');
    else if (meldBehind === 'hailstorm') {
      // a storm of ice: the storm, slowing (in place of the ice)
      drop('of Frost:');
      const a = growsBy(behind, 'lightning');
      r.zone = { kind: 'storm', element: 'lightning', dps: (30 + 0.6 * a) / 100, slow: T.hailstorm.slow, dur: 4 };
      twist(`a storm of ice that strikes and slows by ${pct(T.hailstorm.slow * 100)}.`);
    } else if (meldBehind === 'frostbite') twist('the ice on the ground poisons what crosses it.');
    else if (meldBehind === 'contagion') twist('the poison cloud shocks whatever stands in it.');
    // (VOLATILE'S MELDS, behind VOLT_MELDS: what Volatile behind leaves, its rune, does more)
    else if (meldBehind === 'demolition') twist(`one huge rune, ${pct((T.demolition.runeHard - 1) * 100)} harder and ${T.demolition.runeWide} times as wide, slow to go off.`);
    else if (meldBehind === 'powderkeg') twist('the rune leaves burning ground when it goes off.');
    else if (meldBehind === 'shatter') twist('the rune freezes what is near, then bursts.');
    else if (meldBehind === 'chainreaction') twist('your runes are linked: one going off sets off the rest.');
    else if (meldBehind === 'rupture') twist('the rune bursts into a poison cloud.');
  }

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
  const c = CLASSES[cls];
  // (EVERYONE FIGHTS WITH THEIR OWN MOVES, defs.ts OWN_MOVES: the class's own two, with the class's attribute)
  if (OWN_MOVES.on || c.own) {
    if (c.primary === a || (c.grows && c.grows.includes(a))) out.push(SKILLS[c.tap].name, SKILLS[c.hold].name);
  } else if (weaponAttr(weapon) === a) out.push(SKILLS[tapSkill(weapon)].name, SKILLS[holdSkill(weapon)].name);
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
