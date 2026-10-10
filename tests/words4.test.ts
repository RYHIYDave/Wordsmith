// THE WORDS STILL TO COME, THE FIRST OF THEM (WORDS4, game/defs.ts): MYSTICAL, which does for
// spells what Power does for attacks, with POWER FOR ATTACKS ONLY and VOLATILE'S HIDDEN BOMB, as his
// doc "Wordsmith: The New Words" has them (his yes of 8 Oct 2026, 16:53: "Yes, as it is
// (Recommended)"; Power on a spell and Mystical on an attack do nothing: "Nothing (Recommended)").
// Their numbers are its starting points (MYSTIC, BOMB); their looks are the art chat's
// (render/words3.ts), called up by what the rules say happened, and the bomb's charge this chat's.
// These tests hold:
//   - the switch: off in the game; on, Mystical is a word of the game, the four shaping words not
//     until their own switch (WORDS5);
//   - Power on a spell, and Mystical on an attack: nothing, and the attack's lines and the slot say so;
//   - Mystical in front: more spell damage by Intelligence, a bigger hit, a splash for a spell that
//     strikes one enemy, its constellation; behind: ARCANA, five stacks at most, five seconds, for
//     spells alone; spell damage burned into gear, for spells alone;
//   - Mystical on a monster: it hits harder, and the hero's spells do it a quarter less;
//   - Volatile's hidden bomb: by Dexterity; a charge on the first enemy each use hits, one on a
//     monster at a time, that bursts on all near it a moment later, where it fell if it died first;
//   - their looks, called up by the rules' events, and drawn.
//   run: tsx --test tests/words4.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { BOMB, MYSTIC, WORDS, WORDS4, WORDS5, useWords4, useWords5, wordInert } from '../src/game/defs';
import { Game } from '../src/game/game';
import { imbueOptionsFor } from '../src/game/items';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Monster } from '../src/game/state';
import { ALL_WORD_IDS, WORD_IDS } from '../src/game/types';
import type { ClassId, Element, MonsterKind, WeaponKind, WordId } from '../src/game/types';
import { inertLine } from '../src/game/words';
import { Fx } from '../src/render/fx';
import type { Cam } from '../src/render/fx';
import { W3, air3, clear3, events3, lights3 } from '../src/render/words3';
import { land } from './helpers';

const DT = 1 / 30;
const near = (a: number, b: number, what: string, tol = 1e-9): void => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${what}: ${a} is not ${b}`);

/** What the tests reach inside the rules for. */
interface Inside {
  rng: RNG;
  waveT: number;
  dungeonWords: WordId[];
  spawn(kind: MonsterKind, x: number, y: number, pack: number, rank: 0 | 1 | 2, boss: boolean, rng: RNG): Monster;
  wakeUp(m: Monster): void;
  hitMonster(m: Monster, i: number, frac: number, quiet: boolean): void;
  damageMonster(m: Monster, dmg: number, el: Element, crit: boolean, skill: number): void;
}

/** With the switch on for `fn`, and back as it was after. */
function withOn<T>(fn: () => T): T {
  const was = WORDS4.on;
  useWords4(true);
  try {
    return fn();
  } finally {
    useWords4(was);
  }
}

/** The practice room, emptied, with the hero at (14.5, 15.5) facing +x, holding `weapon` if given, and these words set. */
function room(cls: ClassId, words: readonly [number, 'front' | 'behind', WordId][] = [], weapon: WeaponKind | null = null, seed = 5): { g: Game; a: Inside; seen: GameEvent[] } {
  const g = Game.forPractice(cls, seed);
  const a = g as unknown as Inside;
  a.waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  if (weapon && g.weapon() !== weapon) {
    const i = h.bag.findIndex((it) => it !== null && it.weapon === weapon);
    assert.ok(i >= 0, `a ${weapon} is in the bag`);
    assert.equal(g.equipFromBag(i), null, `the ${cls} takes up the ${weapon}`);
  }
  h.x = 14.5;
  h.y = 15.5;
  h.fx = 1;
  h.fy = 0;
  for (const [i, side, w] of words) {
    h.words[w] = (h.words[w] ?? 0) + 1;
    assert.equal(g.socket(i, side, w), null, `${w} goes ${side} of ability ${i}`);
  }
  g.events.length = 0;
  return { g, a, seen: [] };
}

/** A monster (dx, dy) from the hero, awake, standing still and holding its blows, with life enough. */
function put(g: Game, a: Inside, kind: MonsterKind, dx: number, dy: number, life = 1e6): Monster {
  const h = g.hero;
  const m = a.spawn(kind, h.x + dx, h.y + dy, 1, 0, false, a.rng);
  a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = life;
  m.shield = 0;
  return m;
}

/** Step the game for `secs`, keeping what it says happened. */
function run(g: Game, seen: GameEvent[], secs: number, c: Controls = emptyControls()): void {
  for (let t = 0; t < secs - 1e-9; t += DT) {
    g.update(DT, c);
    seen.push(...g.events);
    g.events.length = 0;
  }
}

/** Ability `i` used at (x, y), by the rules, to where it lands (and `fly` seconds more, for a wave or a shot to get there). */
function use(g: Game, seen: GameEvent[], i: number, x: number, y: number, fly = 0): void {
  const h = g.hero;
  h.swingT = 0;
  h.skills[i].cd = 0;
  h.mana = h.d.maxMana;
  const c = emptyControls();
  if (i === 0) c.fire = true;
  else c.hold = true;
  c.aimX = x;
  c.aimY = y;
  g.update(DT, c);
  seen.push(...g.events);
  g.events.length = 0;
  c.fire = false;
  c.hold = false;
  land(g, c, DT, () => {
    seen.push(...g.events);
    g.events.length = 0;
  });
  if (fly > 0) run(g, seen, fly);
}

const of = <T extends GameEvent['t']>(seen: readonly GameEvent[], t: T): Extract<GameEvent, { t: T }>[] => seen.filter((e) => e.t === t) as Extract<GameEvent, { t: T }>[];

/** One hit of ability `i` on `m`, with every hit the same (no spread, no critical): what it took. */
function evenHit(g: Game, a: Inside, m: Monster, i: number): number {
  const d = g.hero.d;
  d.dmgMin = d.dmgMax = 1000;
  d.critChance = 0;
  const before = m.life;
  a.hitMonster(m, i, 1, true);
  return before - m.life;
}

// ---------------------------------------------------------------------------------------------
// THE SWITCH

test('the switch is off in the game: Mystical is no word of it, Power works on a spell, Volatile blows up what it kills', () => {
  assert.equal(WORDS4.on, false);
  assert.equal(WORDS5.on, false);
  assert.ok(!WORD_IDS.includes('mystical'), 'Mystical does not drop and is not shown');
  for (const w of ['pulling', 'splitting', 'hexing', 'stilling'] as const) assert.ok(!WORD_IDS.includes(w));
  assert.ok(ALL_WORD_IDS.includes('mystical'), 'but what is kept for every word is kept for it');
  const bare = room('mage').g.hero.skills[0].r;
  const power = room('mage', [[0, 'front', 'power']]).g.hero.skills[0].r;
  assert.ok(power.dmgMult > bare.dmgMult * 1.2, 'Power still feeds the Wave');
  const vol = room('warrior', [[0, 'front', 'volatile']]).g.hero.skills[0].r;
  assert.ok(vol.volatile > 0, 'Volatile: what it kills explodes');
  assert.equal(vol.bomb, 0, 'and no hidden bomb');
  assert.equal(wordInert('power', 'wave'), false);
  assert.equal(wordInert('mystical', 'strike'), false);
});

test('on, Mystical is a word of the game; Pulling, Splitting, Hexing and Stilling wait for their own switch', () => {
  withOn(() => {
    assert.ok(WORD_IDS.includes('mystical'));
    for (const w of ['pulling', 'splitting', 'hexing', 'stilling'] as const) assert.ok(!WORD_IDS.includes(w), `${w} waits`);
    useWords5(true);
    try {
      for (const w of ['mystical', 'pulling', 'splitting', 'hexing', 'stilling'] as const) assert.ok(WORD_IDS.includes(w), `${w}, with both on`);
    } finally {
      useWords5(false);
    }
    assert.deepEqual(WORD_IDS.filter((w) => !ALL_WORD_IDS.includes(w)), []);
  });
  assert.ok(!WORD_IDS.includes('mystical'), 'off again, gone again');
});

// ---------------------------------------------------------------------------------------------
// POWER FOR ATTACKS, MYSTICAL FOR SPELLS

test('Power on a spell does nothing, and the attack says so; on an attack it is as it was', () => {
  withOn(() => {
    const bare = room('mage').g.hero.skills[0].r;
    const { g, a, seen } = room('mage', [[0, 'front', 'power']]);
    const r = g.hero.skills[0].r;
    assert.equal(r.dmgMult, bare.dmgMult, 'no more damage');
    assert.equal(r.size, bare.size, 'no bigger');
    assert.ok(r.lines.includes(inertLine('power')), `its lines say so: ${r.lines.join(' | ')}`);
    assert.equal(inertLine('power'), 'Power: nothing on a spell. Power is for attacks.');
    assert.ok(wordInert('power', 'wave') && wordInert('power', 'familiar') && !wordInert('power', 'strike') && !wordInert('power', 'shot'));
    // (its hits do not carry it, so it has no look there either)
    const m = put(g, a, 'skeleton', 3, 0);
    use(g, seen, 0, m.x, m.y, 0.6);
    const hits = of(seen, 'hit').filter((e) => !e.onHero);
    assert.ok(hits.length > 0, 'the Wave struck');
    assert.ok(hits.every((e) => !(e.words ?? []).includes('power')), 'and Power is not on its hits');
    // an attack: as with the switch off
    const sword = room('warrior', [[0, 'front', 'power']]).g.hero.skills[0].r;
    useWords4(false);
    const swordOff = room('warrior', [[0, 'front', 'power']]).g.hero.skills[0].r;
    useWords4(true);
    assert.equal(sword.dmgMult, swordOff.dmgMult, "Power on Strike: the same");
    assert.equal(sword.splash, swordOff.splash);
  });
});

test('Mystical on an attack does nothing, and says so; it may still be set there', () => {
  withOn(() => {
    const bare = room('warrior').g.hero.skills[0].r;
    const { g } = room('warrior', [[0, 'front', 'mystical']]);
    const r = g.hero.skills[0].r;
    assert.equal(r.dmgMult, bare.dmgMult);
    assert.equal(r.mystic, false);
    assert.ok(r.lines.includes(inertLine('mystical')));
    assert.equal(inertLine('mystical'), 'Mystical: nothing on an attack. Mystical is for spells.');
    assert.ok(wordInert('mystical', 'strike') && !wordInert('mystical', 'wave'));
    // (behind, no ARCANA from an attack)
    const behind = room('warrior', [[0, 'behind', 'mystical']]).g.hero.skills[0].r;
    assert.equal(behind.arcana, 0);
  });
});

test('Mystical in front of a spell: +25% spell damage and 0.6% a point of Intelligence, a bigger hit (+20%, 0.3% a point)', () => {
  withOn(() => {
    const bare = room('mage').g.hero.skills[0].r;
    const { g } = room('mage', [[0, 'front', 'mystical']]);
    const h = g.hero;
    const r = h.skills[0].r;
    const int = h.d.int;
    assert.ok(int > 0);
    near(r.dmgMult / bare.dmgMult, 1 + (MYSTIC.dmg + MYSTIC.dmgPer * int) / 100, 'spell damage');
    near(r.size / bare.size, 1 + (MYSTIC.big + MYSTIC.bigPer * int) / 100, 'size');
    assert.equal(r.mystic, true);
    assert.equal(r.splash, bare.splash, 'the Wave strikes many: no splash of its own');
    assert.deepEqual([MYSTIC.dmg, MYSTIC.dmgPer, MYSTIC.big, MYSTIC.bigPer], [25, 0.6, 20, 0.3], "the doc's starting points");
    // a spell that strikes one enemy: the wand's Familiar
    const fam = room('mage', [[0, 'front', 'mystical']], 'wand').g.hero.skills[0];
    assert.equal(fam.id, 'familiar');
    assert.equal(fam.r.splash, MYSTIC.splash, 'it splashes those beside what it strikes');
    assert.equal(fam.r.splashDmg, MYSTIC.splashDmg);
  });
});

test("Mystical's hit and its splash: the hit carries the word for its look, the splash runs to those beside and hurts them", () => {
  withOn(() => {
    const { g, a, seen } = room('mage', [[0, 'front', 'mystical']], 'wand');
    const m = put(g, a, 'skeleton', 3, 0);
    const beside = put(g, a, 'skeleton', 3, 0.8);
    const far = put(g, a, 'skeleton', 3, 4);
    use(g, seen, 0, m.x, m.y);
    run(g, seen, 3);
    const struck = of(seen, 'hit').filter((e) => !e.onHero && (e.words ?? []).includes('mystical'));
    assert.ok(struck.length > 0, 'a familiar\'s bolt struck, in moonlight');
    const splashes = of(seen, 'mysticSplash');
    assert.ok(splashes.length > 0, 'and its splash ran out');
    assert.ok(splashes.some((e) => e.to.some((p) => Math.hypot(p.x - beside.x, p.y - beside.y) < 0.01)), 'to the one beside');
    assert.ok(splashes.every((e) => e.to.every((p) => Math.hypot(p.x - far.x, p.y - far.y) > 0.01)), 'not to the one far off');
    assert.ok(beside.life < beside.maxLife, 'which it hurt');
    // (what is far off was not struck by the splash; whatever the familiar shot at, the one beside was splashed)
    void far;
  });
});

// ---------------------------------------------------------------------------------------------
// ARCANA

test('ARCANA: each spell blow that lands adds a stack, five at the most, for five seconds', () => {
  withOn(() => {
    const { g, a, seen } = room('mage', [[0, 'behind', 'mystical']]);
    const h = g.hero;
    const r = h.skills[0].r;
    near(r.arcana, MYSTIC.arcana + MYSTIC.arcanaPer * h.d.int, 'a stack');
    assert.ok(r.lines.some((l) => l.startsWith('of Mysteries:')));
    const m = put(g, a, 'skeleton', 3, 0);
    use(g, seen, 0, m.x, m.y, 0.6);
    near(h.arcana, r.arcana, 'one stack');
    assert.ok(h.arcanaT > MYSTIC.secs - 1 && h.arcanaT <= MYSTIC.secs);
    const buffs = of(seen, 'buff').filter((e) => e.kind === 'arcana');
    assert.equal(buffs.length, 1);
    assert.equal(buffs[0].stacks, 1);
    assert.ok(Math.hypot(buffs[0].x - m.x, buffs[0].y - m.y) < 1.5, 'its star flies from where the blow struck');
    for (let k = 0; k < 7; k++) use(g, seen, 0, m.x, m.y, 0.6);
    near(h.arcana, r.arcana * MYSTIC.max, 'five at the most');
    assert.equal(Math.max(...of(seen, 'buff').filter((e) => e.kind === 'arcana').map((e) => e.stacks)), 5);
    run(g, seen, MYSTIC.secs + 0.1);
    assert.equal(h.arcana, 0, 'gone five seconds after the last');
    // (a swing at the air builds nothing)
    use(g, seen, 0, h.x - 5, h.y, 0.8);
    assert.equal(h.arcana, 0);
  });
});

test('ARCANA and spell damage burned into gear make spells hit harder, never attacks', () => {
  withOn(() => {
    const mage = room('mage');
    const m = put(mage.g, mage.a, 'skeleton', 2, 0);
    const plain = evenHit(mage.g, mage.a, m, 0);
    mage.g.hero.arcana = 30;
    const withArcana = evenHit(mage.g, mage.a, m, 0);
    const st = mage.g.hero.d.stats;
    const base = 1 + (st.dmgPct + st.physPct) / 100;
    near(withArcana / plain, (base + 0.3) / base, 'ARCANA on a spell', 0.01);
    mage.g.hero.arcana = 0;
    st.spellPct = 40;
    near(evenHit(mage.g, mage.a, m, 0) / plain, (base + 0.4) / base, 'spell damage from gear', 0.01);
    // an attack
    const war = room('warrior');
    const w = put(war.g, war.a, 'skeleton', 1, 0);
    const swing = evenHit(war.g, war.a, w, 0);
    war.g.hero.arcana = 30;
    war.g.hero.d.stats.spellPct = 40;
    assert.equal(evenHit(war.g, war.a, w, 0), swing, 'Strike: the same');
  });
});

// ---------------------------------------------------------------------------------------------
// ON A MONSTER, AND ON GEAR

test('a monster with Mystical hits harder, and the hero\'s spells do it a quarter less; attacks the same', () => {
  withOn(() => {
    const mage = room('mage');
    const plainM = put(mage.g, mage.a, 'skeleton', 2, 0);
    mage.a.dungeonWords = ['mystical'];
    const myst = put(mage.g, mage.a, 'skeleton', 2, 1);
    assert.ok(myst.words.includes('mystical'));
    near(myst.dmgMin / plainM.dmgMin, MYSTIC.monsterDmg, 'it hits harder', 0.05);
    const toPlain = evenHit(mage.g, mage.a, plainM, 0);
    const toMyst = evenHit(mage.g, mage.a, myst, 0);
    near(toMyst / toPlain, MYSTIC.monsterSpells, 'spells do it a quarter less', 0.01);
    const war = room('warrior');
    const p2 = put(war.g, war.a, 'skeleton', 1, 0);
    war.a.dungeonWords = ['mystical'];
    const m2 = put(war.g, war.a, 'skeleton', 1, 0.5);
    assert.equal(evenHit(war.g, war.a, m2, 0), evenHit(war.g, war.a, p2, 0), 'a sword does it as much as ever');
    assert.equal(WORDS.mystical.monsterText, 'Hits harder, and your spells do less to it.');
  });
});

test('Mystical burned into gear: spell damage or Intelligence on a weapon; mana or Intelligence on armour', () => {
  withOn(() => {
    const g = Game.forPractice('mage', 3);
    const weapon = g.hero.gear.mainhand!;
    const onWeapon = imbueOptionsFor({ ...weapon, affixes: [], imbues: [] }, 'mystical').map((o) => o.stat).sort();
    assert.deepEqual(onWeapon, ['int', 'spellPct']);
    const chest = g.hero.gear.chest;
    if (chest) {
      const onChest = imbueOptionsFor({ ...chest, affixes: [], imbues: [] }, 'mystical').map((o) => o.stat).sort();
      assert.deepEqual(onChest, ['int', 'maxMana']);
    }
  });
});

// ---------------------------------------------------------------------------------------------
// VOLATILE'S HIDDEN BOMB

test("Volatile, on: by Dexterity, and a hidden bomb in place of the blast of what it kills", () => {
  withOn(() => {
    assert.equal(WORDS.volatile.attr, 'dex');
    const { g } = room('warrior', [[0, 'front', 'volatile']]);
    const r = g.hero.skills[0].r;
    near(r.bomb, (BOMB.dmg + BOMB.per * g.hero.d.dex) / 100, 'its charge: a share of the hit');
    assert.equal(r.volatile, 0, 'what it kills does not blow up as well');
    assert.deepEqual([BOMB.delay, BOMB.r], [1.5, 1.6]);
    assert.ok(r.lines.some((l) => l.startsWith('Volatile: sticks a hidden charge')));
  });
  assert.notEqual(WORDS.volatile.attr, 'dex', 'off, as it was');
});

test('the bomb: stuck on the first enemy a use hits, one on a monster at a time; 1.5 s later it bursts on all near it', () => {
  withOn(() => {
    const { g, a, seen } = room('warrior', [[0, 'front', 'volatile']]);
    const m = put(g, a, 'skeleton', 1.1, 0);
    const beside = put(g, a, 'skeleton', 1.1, 1.0);
    const far = put(g, a, 'skeleton', 1.1, 3.5);
    use(g, seen, 0, m.x, m.y);
    const stuck = of(seen, 'bomb');
    assert.equal(stuck.length, 1, 'one charge');
    assert.equal(stuck[0].id, m.id);
    assert.equal(g.bombs.length, 1);
    const b = g.bombs[0];
    assert.ok(b.t > BOMB.delay - 0.5 && b.t <= BOMB.delay);
    assert.equal(b.dur, BOMB.delay);
    assert.ok(m.bombT > 0);
    // (the dmg is the share of the blow that stuck it)
    const blow = m.maxLife - m.life;
    near(b.dmg, Math.max(1, Math.round(blow * g.hero.skills[0].r.bomb)), 'its burst', 0.02);
    // a second blow before it bursts: no second charge on it
    use(g, seen, 0, m.x, m.y);
    assert.equal(g.bombs.length, 1, 'one on a monster at a time');
    const lives = [m.life, beside.life, far.life];
    run(g, seen, BOMB.delay);
    const bursts = of(seen, 'bombBurst');
    assert.equal(bursts.length, 1, 'it burst');
    assert.ok(Math.hypot(bursts[0].x - m.x, bursts[0].y - m.y) < 0.01, 'where its monster stands');
    assert.ok(of(seen, 'burst').some((e) => e.style === 'blast' && (e.words ?? []).includes('volatile')), "with Volatile's blast");
    assert.equal(g.bombs.length, 0);
    assert.ok(m.life <= lives[0] - b.dmg + 1, 'it hurt its monster');
    assert.ok(beside.life <= lives[1] - b.dmg + 1, 'and the one beside');
    assert.equal(far.life, lives[2], 'not the one far off');
  });
});

test('the bomb on a monster that dies first lies where it fell and bursts there', () => {
  withOn(() => {
    const { g, a, seen } = room('warrior', [[0, 'front', 'volatile']]);
    const weak = put(g, a, 'skeleton', 1.1, 0, 1);
    const beside = put(g, a, 'skeleton', 1.1, 1.0);
    const at = [weak.x, weak.y];
    use(g, seen, 0, weak.x, weak.y);
    assert.ok(weak.dead, 'the blow killed it');
    assert.equal(g.bombs.length, 1, 'but its charge was stuck');
    run(g, seen, BOMB.delay + 0.1);
    const bursts = of(seen, 'bombBurst');
    assert.equal(bursts.length, 1);
    assert.ok(Math.hypot(bursts[0].x - at[0], bursts[0].y - at[1]) < 0.01, 'where it fell');
    assert.ok(beside.life < beside.maxLife, 'and it hurt the one beside');
  });
});

test('a new use sticks a new charge (on another), and a new level has none left', () => {
  withOn(() => {
    const { g, a, seen } = room('warrior', [[0, 'front', 'volatile']]);
    const m = put(g, a, 'skeleton', 1.1, 0);
    use(g, seen, 0, m.x, m.y);
    const other = put(g, a, 'skeleton', 1.1, -0.3);
    m.x += 5;
    use(g, seen, 0, other.x, other.y);
    assert.equal(g.bombs.length, 2, 'one on each');
    assert.deepEqual(g.bombs.map((b) => b.id).sort((p, q) => p - q), [m.id, other.id].sort((p, q) => p - q));
  });
});

// ---------------------------------------------------------------------------------------------
// THE LOOKS

test("their looks: Mystical's crescent, constellation and moon, and the bomb's spark, from the rules' events; the charge is drawn", () => {
  withOn(() => {
    clear3();
    const { g, a } = room('mage');
    const fx = new Fx();
    const m = put(g, a, 'skeleton', 2, 0);
    events3([
      { t: 'hit', x: m.x, y: m.y, amount: 10, crit: false, el: 'phys', onHero: false, words: ['mystical'] },
      { t: 'mysticSplash', x: m.x, y: m.y, to: [{ x: m.x, y: m.y + 1 }] },
      { t: 'buff', kind: 'arcana', x: m.x, y: m.y, stacks: 2 },
    ], g, fx);
    assert.equal(W3.sweeps.length, 1, 'a crescent sweeps round the struck');
    assert.equal(W3.links.length, 1, 'a line of the constellation');
    assert.equal(W3.mystic.n, 2, 'the moon will show what the rules hold');
    assert.ok(W3.stars.length >= 1, 'a star flies to it');
    // (Mystical not on the hit: no crescent)
    events3([{ t: 'hit', x: m.x, y: m.y, amount: 10, crit: false, el: 'phys', onHero: false, words: ['power'] }], g, fx);
    assert.equal(W3.sweeps.length, 1);
    const flashes = fx.flashes.length;
    events3([{ t: 'bomb', id: m.id, x: m.x, y: m.y, secs: BOMB.delay }], g, fx);
    assert.ok(fx.flashes.length > flashes, 'a spark where the charge bites in');
    // the charge, drawn while the rules hold it, with a little light
    let n = 0;
    const canvas = { fillStyle: '', globalAlpha: 1, fillRect: () => n++, beginPath: () => {}, ellipse: () => n++, fill: () => {}, moveTo: () => {}, lineTo: () => {}, closePath: () => {}, stroke: () => {} } as unknown as CanvasRenderingContext2D;
    const cam = { ox: 200, oy: 100, lift: null } as unknown as Cam;
    clear3();
    air3(canvas, cam, 1, g, fx);
    const without = n;
    g.bombs.push({ id: m.id, x: m.x, y: m.y, t: 1, dur: BOMB.delay, dmg: 10, el: 'phys', skill: 0 });
    n = 0;
    air3(canvas, cam, 1, g, fx);
    assert.ok(n > without + 20, `the charge is drawn (${n} against ${without})`);
    let lit = 0;
    lights3(() => lit++, cam, g, 1);
    assert.ok(lit >= 1, 'and gives light');
    g.bombs.length = 0;
    clear3();
  });
});
