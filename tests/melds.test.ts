// WORDMELDING (src/game/melds.ts), behind MELD, which is off: the ten melded words, made of two
// damage words each, his page "Wordsmith: Word Combinations" and his picks of 13 Oct 2026, 12:36
// (a melded word takes its side's one damage-word place, "Yes, it takes that place (Recommended)";
// "Only damage words meld"). These tests hold:
//   - the ten: every two of the five damage words make one, and nothing else melds;
//   - a melded word takes its side's damage-word place, and does what both its words do there;
//   - each one's twist, in front and behind, at work in the practice room;
//   - for now on attacks only: not burned into gear, not laid on the gate, not kept in the Lexicon;
//   - with MELD off, nothing of it: no melded word to be had, nothing of them in a save.
//   run: tsx --test tests/melds.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { SKILLS, WORDS } from '../src/game/defs';
import { Game, newMeta } from '../src/game/game';
import type { ItemRef } from '../src/game/game';
import { MELD, MELD_TUNE, isDamageWord, meldOf, meldProblem, partsOf, savedMeta, withParts } from '../src/game/melds';
import { emptyControls } from '../src/game/state';
import type { GameEvent, Monster, Resolved } from '../src/game/state';
import { ALL_WORD_IDS, MELD_IDS, MELD_OF, WORD_IDS } from '../src/game/types';
import type { ClassId, MeldId, WordId } from '../src/game/types';
import { resolveSkill, socketProblem } from '../src/game/words';
import { land, seasoned } from './helpers';

const DT = 1 / 30;
const DAMAGE: readonly WordId[] = ['power', 'fire', 'frost', 'lightning', 'poison'];

/** Run `fn` with MELD on, and put it back off after, whatever happens. */
function melding<T>(fn: () => T): T {
  const was = MELD.on;
  MELD.on = true;
  try {
    return fn();
  } finally {
    MELD.on = was;
  }
}

interface Inner {
  waveT: number;
  rng: RNG;
  spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster;
  wakeUp: (m: Monster) => void;
  meldArc: (o: Monster, from: Monster, i: number, arc: number, struck: readonly Monster[]) => void;
  damageMonster: (m: Monster, dmg: number, el: string, crit: boolean, skill: number) => void;
}

interface Arena {
  g: Game;
  a: Inner;
  mons: Monster[];
  events: GameEvent[];
}

/**
 * The practice room (MELD on: it hands out the melded words too) with a warrior's first attack
 * (a melee strike) carrying `front` and `behind`, and skeletons standing still at `spots` (from the
 * hero, who faces along x), each with life to spare, never striking.
 */
function arena(front: readonly WordId[], behind: readonly WordId[], spots: readonly [number, number][] = [[1.1, 0]], cls: ClassId = 'warrior', seed = 5): Arena {
  const g = Game.forPractice(cls, seed);
  const a = g as unknown as Inner;
  a.waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  h.x = 14.5;
  h.y = 15.5;
  h.fx = 1;
  h.fy = 0;
  for (const w of front) assert.equal(g.socket(0, 'front', w), null, `${w} goes in front`);
  for (const w of behind) assert.equal(g.socket(0, 'behind', w), null, `${w} goes behind`);
  const mons = spots.map(([dx, dy]) => {
    const m = a.spawn('skeleton', h.x + dx, h.y + dy, 1, 0, false, a.rng);
    a.wakeUp(m);
    m.speed = 0;
    m.cd = 1e9;
    m.life = m.maxLife = 1e7;
    return m;
  });
  g.events.length = 0;
  return { g, a, mons, events: [] };
}

/** Step the arena on for `secs`, keeping what happens. */
function wait(s: Arena, secs: number): void {
  const c = emptyControls();
  for (let t = 0; t < secs; t += DT) {
    s.g.update(DT, c);
    s.events.push(...s.g.events);
    s.g.events.length = 0;
  }
}

/** The hero strikes once along x (ready at once, however lately he struck), and the blow lands. */
function strike(s: Arena): void {
  const { g } = s;
  const h = g.hero;
  h.skills[0].cd = 0;
  h.swingT = 0;
  h.mana = h.d.maxMana;
  const c = emptyControls();
  c.aimX = h.x + 1.1;
  c.aimY = h.y;
  c.castX = c.aimX;
  c.castY = c.aimY;
  c.fire = true;
  const uses = h.skills[0].uses;
  g.update(DT, c);
  c.fire = false;
  const keep = (): void => {
    s.events.push(...g.events);
    g.events.length = 0;
  };
  keep();
  land(g, c, DT, keep);
  assert.equal(h.skills[0].uses, uses + 1, 'the strike was made');
}

const mine = (s: Arena, kind: string): number => s.g.zones.filter((z) => !z.hostile && z.kind === kind).length;

// ----- the ten -----

test('the ten melded words: every two of the five damage words make one, both ways round, and nothing else melds', () => {
  assert.equal(MELD_IDS.length, 10);
  const seen = new Set<string>();
  for (const m of MELD_IDS) {
    const [a, b] = MELD_OF[m];
    assert.ok(DAMAGE.includes(a) && DAMAGE.includes(b) && a !== b, `${m} is of two different damage words`);
    assert.equal(WORDS[m].kind, 'meld', m);
    assert.deepEqual(WORDS[m].of, MELD_OF[m], m);
    assert.deepEqual([...partsOf(m)], [a, b], m);
    assert.equal(meldOf(a, b), m, `${a} and ${b} make ${m}`);
    assert.equal(meldOf(b, a), m, `${b} and ${a} make ${m}`);
    seen.add([a, b].sort().join('+'));
  }
  assert.equal(seen.size, 10, 'each pair once');
  for (const a of WORD_IDS) {
    for (const b of WORD_IDS) {
      const both = DAMAGE.includes(a) && DAMAGE.includes(b) && a !== b;
      assert.equal(meldOf(a, b) !== null, both, `${a} + ${b}`);
      assert.equal(meldProblem(a, b) === null, both, `${a} + ${b}`);
    }
  }
  assert.equal(meldProblem(null, 'fire'), 'Two words go in');
  assert.equal(meldProblem('fire', 'fire'), 'Two different words');
  assert.equal(meldProblem('eruption', 'frost'), 'A melded word melds no further');
  assert.equal(meldProblem('swift', 'fire'), 'Only damage words meld');
  assert.equal(meldProblem('volatile', 'fire'), 'Only damage words meld', 'Volatile does not meld (his pick)');
});

test('the words found in the dungeon are the thirteen they were; the melded words are made, never found', () => {
  assert.equal(WORD_IDS.length, 13);
  for (const m of MELD_IDS) assert.ok(!WORD_IDS.includes(m), m);
  assert.equal(ALL_WORD_IDS.length, 23);
  for (const w of ALL_WORD_IDS) assert.ok(WORDS[w], w);
  for (const m of MELD_IDS) {
    const d = WORDS[m];
    assert.ok(d.name && d.front && d.behind && d.about && d.frontText && d.behindText, `${m} has its words`);
  }
});

test('a melded word takes its side\'s one damage-word place', () => {
  for (const m of MELD_IDS) {
    assert.ok(isDamageWord(m), m);
    for (const w of DAMAGE) assert.equal(socketProblem([w, null], m), 'One damage word per side', `${m} beside ${w}`);
    for (const w of MELD_IDS) if (w !== m) assert.equal(socketProblem([w, null], m), 'One damage word per side', `${m} beside ${w}`);
    for (const w of WORD_IDS.filter((x) => WORDS[x].kind === 'shape')) {
      assert.equal(socketProblem([w, null], m), null, `${m} beside ${w}`);
      assert.equal(socketProblem([m, null], w), null, `${w} beside ${m}`);
    }
  }
  assert.deepEqual(withParts(['swift', 'eruption']), ['swift', 'eruption', 'power', 'fire']);
});

/** Everything of a Resolved that its words decide, but the name, the lines and which melded words there are. */
function numbers(r: Resolved): Record<string, unknown> {
  const { name: _n, lines: _l, meld: _m, meldBehind: _b, ...rest } = r;
  return rest;
}

test('a melded word does what both its words do, in front and behind; only its twist is its own', () => {
  const g = Game.forPractice('mage', 5);
  const d = g.hero.d;
  for (const id of ['strike', 'shot', 'orb', 'beam'] as const) {
    const def = SKILLS[id];
    for (const m of MELD_IDS) {
      const [a, b] = MELD_OF[m];
      // in front
      const melded = resolveSkill(def, [m, null], [null, null], 'int', d);
      const both = resolveSkill(def, [a, b], [null, null], 'int', d);
      assert.equal(melded.meld, m);
      assert.equal(melded.meldBehind, null);
      const want = numbers(both);
      if (m === 'thunder') {
        // one bolt, harder, that stuns, in place of the arcs
        assert.equal(melded.arcs, 0, `${id}: Thunder has no arcs`);
        assert.ok(Math.abs(melded.dmgMult - both.dmgMult * (1 + MELD_TUNE.thunder.bolt)) < 1e-9, `${id}: Thunder's bolt`);
        assert.ok(melded.stun >= MELD_TUNE.thunder.stun, `${id}: Thunder stuns`);
        Object.assign(want, { arcs: 0, arcDmg: 0, dmgMult: melded.dmgMult, stun: melded.stun });
      } else if (m === 'blight') {
        // the hit is not weakened by the poison
        assert.ok(Math.abs(melded.dmgMult - both.dmgMult / 0.8) < 1e-9, `${id}: Blight's hit is not weakened`);
        Object.assign(want, { dmgMult: melded.dmgMult });
      }
      assert.deepEqual(numbers(melded), want, `${id}: ${m} in front is ${a} and ${b}`);
      // behind
      const mb = resolveSkill(def, [null, null], [m, null], 'int', d);
      const bb = resolveSkill(def, [null, null], [a, b], 'int', d);
      assert.equal(mb.meldBehind, m);
      assert.equal(mb.meld, null);
      const wantB = numbers(bb);
      if (m === 'scald') {
        assert.equal(mb.zone?.kind, 'steam', `${id}: Scald behind leaves steam`);
        Object.assign(wantB, { zone: mb.zone });
      } else if (m === 'hailstorm') {
        assert.equal(mb.zone?.kind, 'storm', `${id}: Hailstorm behind leaves a storm`);
        assert.equal(mb.zone?.slow, MELD_TUNE.hailstorm.slow, `${id}: that slows`);
        Object.assign(wantB, { zone: mb.zone });
      }
      assert.deepEqual(numbers(mb), wantB, `${id}: ${m} behind is ${a} and ${b}`);
      // and its own line, saying its twist
      assert.ok(melded.lines.some((l) => l.startsWith(`${WORDS[m].name}:`)), `${id}: ${m} says its twist in front`);
      assert.ok(mb.lines.some((l) => l.startsWith(`${WORDS[m].behind}:`)), `${id}: ${m} says its twist behind`);
    }
  }
});

// ----- the twists, in front -----

test('Eruption in front: the blast leaves a pool of molten ground (Flame alone leaves none)', () => {
  melding(() => {
    const plain = arena(['fire'], []);
    strike(plain);
    assert.equal(mine(plain, 'burn'), 0);
    const s = arena(['eruption'], []);
    strike(s);
    assert.equal(mine(s, 'burn'), 1, 'a molten pool');
    const z = s.g.zones.find((q) => q.kind === 'burn')!;
    assert.equal(z.r, MELD_TUNE.eruption.pool);
    assert.ok(s.mons[0].burnT > 0, 'and what it hit burns, as Flame does');
  });
});

test('Avalanche in front: it shoves back; one stopped short by another is frozen', () => {
  melding(() => {
    const s = arena(['avalanche'], []);
    const x0 = s.mons[0].x;
    strike(s);
    const m = s.mons[0];
    assert.ok(m.x - x0 > MELD_TUNE.avalanche.shove * 0.8, `shoved back ${(m.x - x0).toFixed(2)}`);
    assert.ok(m.chillT > 0 && m.frozenT <= 0, 'chilled, as Frost chills, and not frozen: nothing stopped it');
    const two = arena(['avalanche'], [], [[1.1, 0], [1.65, 0]]);
    strike(two);
    assert.ok(two.mons.some((q) => q.frozenT > 0), 'one shoved into another is frozen');
  });
});

test('Thunder in front: one bolt from the sky in place of the arcs, and it stuns', () => {
  melding(() => {
    // (the other stands behind the hero, out of the blow's reach and within an arc's)
    const s = arena(['thunder'], [], [[1.1, 0], [-1.4, 0]]);
    strike(s);
    assert.ok(s.mons[0].stunT > 0, 'the one it hit is stunned');
    assert.equal(s.mons[1].life, s.mons[1].maxLife, 'no arc to the other');
    assert.ok(s.events.some((e) => e.t === 'arc' && e.sky), 'a bolt from the sky');
  });
});

test('Blight in front: its poison bites harder the lower the enemy\'s life', () => {
  melding(() => {
    const dose = (low: boolean): number => {
      const s = arena(['blight'], []);
      if (low) s.mons[0].life = s.mons[0].maxLife * 0.1;
      strike(s);
      const hit = s.events.find((e): e is Extract<GameEvent, { t: 'hit' }> => e.t === 'hit' && !e.onHero && !e.poison);
      if (!hit) throw new Error('it hit');
      return s.mons[0].poisonDps / hit.amount;
    };
    const k = dose(true) / dose(false);
    assert.ok(k > 1.8 && k < 2.0, `at a tenth of its life, the poison ${k.toFixed(2)} times as strong`);
  });
});

test('Scald in front: a burning enemy that is chilled cracks, and not again for a while', () => {
  melding(() => {
    const plain = arena(['scald'], []);
    strike(plain);
    assert.ok(!plain.mons[0].scaldCd, 'neither burning nor chilled before: no crack');
    const s = arena(['scald'], []);
    s.mons[0].burnT = 3;
    s.mons[0].burnDps = 1;
    strike(s);
    assert.ok(s.mons[0].scaldCd! > 0, 'it cracked');
    assert.ok(s.events.some((e) => e.t === 'burst' && e.el === 'frost'), 'with a burst');
    const hits = s.events.filter((e) => e.t === 'hit' && !e.onHero).length;
    assert.ok(hits >= 2, 'the hit and the crack');
  });
});

test('Wildfire, Hailstorm and Contagion in front: what their arcs carry', () => {
  melding(() => {
    const s = arena(['wildfire'], [], [[1.1, 0], [2.6, 0], [2.6, 1.2]]);
    const [from, o, n] = s.mons;
    s.a.meldArc(o, from, 0, 20, [from]);
    assert.ok(o.burnT > 0, 'Wildfire: the arc sets burning');
    const c = arena(['contagion'], [], [[1.1, 0], [2.6, 0]]);
    c.a.meldArc(c.mons[1], c.mons[0], 0, 20, [c.mons[0]]);
    assert.ok(c.mons[1].poisonT > 0, 'Contagion: the arc poisons');
    const h = arena(['hailstorm'], [], [[1.1, 0], [2.6, 0], [3.4, 0.4]]);
    const [h0, h1, h2] = h.mons;
    h.a.meldArc(h1, h0, 0, 20, [h0]);
    assert.ok(h1.chillT > 0 && h1.frozenT <= 0, 'Hailstorm: the arc chills');
    assert.equal(h2.life, h2.maxLife, 'and goes no further from one not frozen');
    h.a.meldArc(h1, h0, 0, 20, [h0]);
    assert.ok(h1.frozenT > 0, 'a second chill freezes');
    assert.ok(h2.life < h2.maxLife && h2.chillT > 0, 'a frozen one passes the arc on, chilling');
    void n;
    // and in play, the arcs are there to carry them (Thunder's are not)
    for (const m of ['wildfire', 'hailstorm', 'contagion'] as const) assert.ok(arena([m], []).g.hero.skills[0].r.arcs > 0, `${m} arcs`);
  });
});

test('Fumes in front: an enemy burning and poisoned gives off a toxic cloud (Flame alone gives none)', () => {
  melding(() => {
    const s = arena(['fumes'], []);
    strike(s);
    assert.ok(s.mons[0].burnT > 0 && s.mons[0].poisonT > 0, 'burning and poisoned');
    assert.equal(mine(s, 'venom'), 1, 'a toxic cloud');
    assert.ok(s.mons[0].fumesCd! > 0);
    strike(s);
    assert.equal(mine(s, 'venom'), 1, 'not another at once');
  });
});

test('Frostbite in front: a chilled enemy loses life, and a frozen one twice as fast', () => {
  melding(() => {
    const s = arena(['frostbite'], []);
    strike(s);
    const m = s.mons[0];
    assert.ok(m.chillT > 0 && m.biteDps! > 0, 'chilled, and bitten');
    s.events.length = 0;
    m.freezeImmune = 99;
    wait(s, 1.1);
    const bites = s.events.filter((e): e is Extract<GameEvent, { t: 'hit' }> => e.t === 'hit' && e.el === 'frost' && !e.onHero);
    assert.ok(bites.length >= 2, 'the bite, twice a second');
    const one = bites[0].amount;
    m.frozenT = 2;
    m.chillT = 2;
    s.events.length = 0;
    wait(s, 0.6);
    const frozen = s.events.filter((e): e is Extract<GameEvent, { t: 'hit' }> => e.t === 'hit' && e.el === 'frost' && !e.onHero);
    assert.ok(frozen.length >= 1 && Math.abs(frozen[0].amount - one * 2) <= 1, `frozen, twice: ${frozen[0]?.amount} for ${one}`);
    m.frozenT = 0;
    m.chillT = 0;
    s.events.length = 0;
    wait(s, 1.1);
    assert.equal(s.events.filter((e) => e.t === 'hit' && e.el === 'frost').length, 0, 'warm again, no bite');
  });
});

// ----- the twists, behind -----

test('Eruption behind: each hit builds heat, and at full heat the next hit erupts round what it struck', () => {
  melding(() => {
    const s = arena([], ['eruption'], [[1.1, 0], [1.6, 0.9]]);
    for (let k = 0; k < MELD_TUNE.eruption.heat; k++) {
      strike(s);
      wait(s, 0.5);
    }
    assert.ok(s.events.some((e) => e.t === 'text' && e.text === 'HEAT'), 'full heat is shown');
    assert.ok(!s.events.some((e) => e.t === 'burst' && e.r === MELD_TUNE.eruption.blastR), 'no eruption yet');
    strike(s);
    assert.ok(s.events.some((e) => e.t === 'burst' && e.r === MELD_TUNE.eruption.blastR && e.el === 'fire'), 'it erupts');
  });
});

test('Avalanche behind: a hit on a chilled enemy hits harder', () => {
  melding(() => {
    const first = (chilled: boolean): number => {
      const s = arena([], ['avalanche'], [[1.1, 0]], 'warrior', 9);
      if (chilled) {
        s.mons[0].chillT = 2.5;
        s.mons[0].chill = 0.3;
        s.mons[0].freezeImmune = 99;
      }
      strike(s);
      const hit = s.events.find((e): e is Extract<GameEvent, { t: 'hit' }> => e.t === 'hit' && !e.onHero);
      if (!hit) throw new Error('it hit');
      return hit.amount;
    };
    const k = first(true) / first(false);
    assert.ok(Math.abs(k - (1 + MELD_TUNE.avalanche.chilled)) < 0.05, `${k.toFixed(3)} times as hard`);
  });
});

test('Thunder behind: every few hits, a thunderclap round the hero', () => {
  melding(() => {
    const s = arena([], ['thunder']);
    const clap = (): boolean => s.events.some((e) => e.t === 'burst' && e.el === 'lightning' && e.r === MELD_TUNE.thunder.clapR);
    for (let k = 1; k < MELD_TUNE.thunder.every; k++) {
      strike(s);
      wait(s, 0.5);
    }
    assert.ok(!clap(), 'not yet');
    strike(s);
    assert.ok(clap(), 'the thunderclap');
  });
});

test('Blight behind: a poisoned enemy it has touched takes more from everything', () => {
  melding(() => {
    const s = arena([], ['blight'], [[1.1, 0], [1.6, 0.9]]);
    strike(s);
    const [m, o] = s.mons;
    assert.ok(m.blightT! > 0, 'touched');
    m.poisonT = 3;
    o.poisonT = 3;
    o.blightT = 0;
    const l0 = m.life;
    const k0 = o.life;
    s.a.damageMonster(m, 100, 'phys', false, 0);
    s.a.damageMonster(o, 100, 'phys', false, 0);
    assert.equal(l0 - m.life, Math.round(100 * (1 + MELD_TUNE.blight.more)));
    assert.equal(k0 - o.life, 100);
  });
});

test('Scald behind: steam in place of burning ground and ice; it hurts and slows, and hides the hero standing in it', () => {
  melding(() => {
    const s = arena([], ['scald']);
    strike(s);
    assert.equal(mine(s, 'steam'), 1, 'steam');
    assert.equal(mine(s, 'burn') + mine(s, 'ice'), 0, 'and neither burning ground nor ice');
    const z = s.g.zones.find((q) => q.kind === 'steam')!;
    const m = s.mons[0];
    m.x = z.x;
    m.y = z.y;
    const l0 = m.life;
    wait(s, 1.1);
    assert.ok(m.life < l0 && m.chillT > 0, 'it hurts and slows');
    // a skeleton beside the hero, ready to strike: it strikes, unless he stands in the steam
    const blows = (steam: boolean): number => {
      const t = arena([], steam ? ['scald'] : []);
      const h = t.g.hero;
      if (steam) {
        strike(t);
        const st = t.g.zones.find((q) => q.kind === 'steam')!;
        h.x = st.x;
        h.y = st.y;
      }
      const k = t.mons[0];
      k.x = h.x + 0.9;
      k.y = h.y;
      k.cd = 0;
      k.life = k.maxLife = 1e7;
      const life0 = h.life;
      h.life = h.d.maxLife;
      let starts = 0;
      const c = emptyControls();
      for (let q = 0; q < 1.5 / DT; q++) {
        t.g.update(DT, c);
        if (k.state === 'windup') starts++;
        t.g.events.length = 0;
      }
      void life0;
      return starts;
    };
    assert.ok(blows(false) > 0, 'out of the steam, it strikes');
    assert.equal(blows(true), 0, 'in the steam, it does not see him to strike');
  });
});

test('Wildfire behind: the burning ground throws sparks at enemies near it', () => {
  melding(() => {
    const s = arena([], ['wildfire']);
    strike(s);
    const z = s.g.zones.find((q) => q.kind === 'burn' && !q.hostile);
    assert.ok(z && z.meld === 'wildfire', 'burning ground of Wildfire');
    s.events.length = 0;
    wait(s, 1.5);
    assert.ok(s.events.some((e) => e.t === 'arc' && !e.sky), 'sparks');
  });
});

test('Fumes behind: the poison cloud explodes when anything burning comes into it', () => {
  melding(() => {
    const s = arena([], ['fumes']);
    strike(s);
    const z = s.g.zones.find((q) => q.kind === 'venom' && !q.hostile);
    if (!z) throw new Error('a cloud');
    assert.ok(z.meld === 'fumes', 'a cloud of Fumes');
    const m = s.mons[0];
    m.x = z.x;
    m.y = z.y;
    s.events.length = 0;
    wait(s, 0.2);
    assert.ok(s.g.zones.includes(z), 'nothing burning in it yet: it hangs there');
    m.burnT = 3;
    m.burnDps = 1;
    wait(s, 0.1);
    assert.ok(!s.g.zones.includes(z), 'it is gone');
    assert.ok(s.events.some((e) => e.t === 'burst' && e.el === 'fire'), 'in an explosion');
  });
});

test('Hailstorm, Frostbite and Contagion behind: a storm that slows; ice that poisons; a cloud that shocks', () => {
  melding(() => {
    const at = (w: MeldId, kind: string, check: (m: Monster, s: Arena) => void): void => {
      const s = arena([], [w]);
      strike(s);
      const z = s.g.zones.find((q) => q.kind === kind && !q.hostile);
      if (!z) throw new Error(`${w}: its ${kind}`);
      assert.ok(z.meld === w, `${w}: its ${kind}`);
      const m = s.mons[0];
      m.x = z.x;
      m.y = z.y;
      m.chillT = 0;
      m.poisonT = 0;
      s.events.length = 0;
      wait(s, 1.1);
      check(m, s);
    };
    at('hailstorm', 'storm', (m) => assert.ok(m.chillT > 0 && m.chill >= MELD_TUNE.hailstorm.slow, 'Hailstorm: the storm slows'));
    at('frostbite', 'ice', (m) => assert.ok(m.poisonT > 0, 'Frostbite: the ice poisons'));
    at('contagion', 'venom', (_m, s) => assert.ok(s.events.some((e) => e.t === 'arc' && !e.sky), 'Contagion: the cloud shocks'));
  });
});

// ----- on attacks only, for now -----

test('a melded word goes on attacks only: not burned into gear, not laid on the gate, not kept in the Lexicon', () => {
  melding(() => {
    const g = Game.forPractice('warrior', 5);
    assert.ok(g.hero.words.eruption > 0, 'the practice room hands them out');
    const i = g.hero.bag.findIndex((it) => it !== null);
    assert.ok(i >= 0);
    assert.equal(g.imbueProblem({ kind: 'bag', i } as ItemRef, 'eruption'), 'A melded word goes on attacks only');
    assert.deepEqual(g.imbueChoices({ kind: 'bag', i } as ItemRef, 'eruption'), []);
    assert.equal(g.planProblem('eruption'), 'A melded word goes on attacks only');
    g.hero.gold = 1e6;
    assert.equal(g.depositWord('eruption'), 'The Lexicon keeps no melded word');
    assert.equal(g.socket(0, 'front', 'eruption'), null, 'on an attack, yes');
  });
});

// ----- with the switch off -----

test('with MELD off, no melded word can be had, and nothing of them is written to a save', () => {
  assert.equal(MELD.on, false, 'off');
  const g = Game.forPractice('mage', 5);
  for (const m of MELD_IDS) assert.ok(!(m in g.hero.words), `${m}: none, and no count kept of it`);
  assert.deepEqual(Object.keys(g.hero.words).sort(), [...WORD_IDS].sort(), 'the hero counts the thirteen words, as before');
  assert.deepEqual(Object.keys(g.meta.known).sort(), [...WORD_IDS].sort(), 'and so does the Lexicon');
  const play = new Game('warrior', 7, newMeta());
  const saved = JSON.parse(JSON.stringify(play.save())) as { words: Record<string, number> };
  assert.deepEqual(Object.keys(saved.words).sort(), [...WORD_IDS].sort(), 'the save has the thirteen words, as before');
  const meta = JSON.parse(JSON.stringify(savedMeta(play.meta))) as { lexicon: Record<string, number>; known: Record<string, unknown> };
  assert.deepEqual(Object.keys(meta.lexicon).sort(), [...WORD_IDS].sort());
  assert.deepEqual(Object.keys(meta.known).sort(), [...WORD_IDS].sort());
  // and a save from before them comes back as it went
  const back = Game.restore(play.save(), play.meta);
  for (const w of ALL_WORD_IDS) assert.equal(back.hero.words[w], play.hero.words[w], w);
});

test('with MELD on, a melded word on an attack and in the pouch is saved and comes back', () => {
  melding(() => {
    const play = Game.forPractice('warrior', 5);
    play.hero.words.thunder = 2;
    play.hero.words.scald = 1;
    assert.equal(play.socket(0, 'front', 'thunder'), null);
    const back = Game.restore(JSON.parse(JSON.stringify(play.save())), play.meta);
    assert.equal(back.hero.words.thunder, 1);
    assert.equal(back.hero.words.scald, 1);
    assert.deepEqual(back.hero.skills[0].front.filter((w) => w !== null), ['thunder']);
    assert.equal(back.hero.skills[0].r.meld, 'thunder');
  });
});

// ----- runedust, the Meldstone, and the wordsmith melding -----

interface Killer {
  kill: (m: Monster) => void;
}

/** Floor 5, the Fleshmancer felled where he stands. */
function felled(seed = 9): { g: Game; boss: Monster } {
  const g = seasoned(new Game('warrior', seed), 20);
  g.depth = 5;
  g.cleared = 4;
  g.enterDungeon();
  const boss = g.monsters.find((m) => m.kind === 'fleshmancer');
  if (!boss) throw new Error('the Fleshmancer is on floor 5');
  boss.life = 0;
  (g as unknown as Killer).kill(boss);
  return { g, boss };
}

test('the Fleshmancer drops runedust and the Meldstone (with MELD off, neither); walked over, they are taken up', () => {
  const off = felled();
  assert.ok(!off.g.drops.some((d) => d.kind === 'dust' || d.kind === 'stone'), 'with MELD off, nothing of it');
  melding(() => {
    const { g } = felled();
    const dust = g.drops.filter((d) => d.kind === 'dust');
    assert.equal(dust.length, 1);
    assert.equal(dust[0].gold, MELD_TUNE.fleshmancerDust, 'as much runedust as he drops');
    assert.equal(g.drops.filter((d) => d.kind === 'stone').length, 1, 'and the Meldstone');
    const h = g.hero;
    const c = emptyControls();
    for (const d of [...g.drops.filter((q) => q.kind === 'dust' || q.kind === 'stone')]) {
      h.x = d.x;
      h.y = d.y;
      for (let k = 0; k < 30; k++) g.update(DT, c);
    }
    assert.equal(h.dust, MELD_TUNE.fleshmancerDust, 'runedust counted');
    assert.equal(h.meld, 'stone', 'the Meldstone carried');
    // felled by a hero who has brought the Meldstone already: runedust, and no second Meldstone
    const g2 = seasoned(new Game('warrior', 11), 20);
    g2.hero.meld = 'open';
    g2.depth = 5;
    g2.cleared = 4;
    g2.enterDungeon();
    const b2 = g2.monsters.find((m) => m.kind === 'fleshmancer')!;
    b2.life = 0;
    (g2 as unknown as Killer).kill(b2);
    assert.ok(g2.drops.some((d) => d.kind === 'dust'), 'runedust every time');
    assert.ok(!g2.drops.some((d) => d.kind === 'stone'), 'the Meldstone only until it has been brought');
  });
});

test('the Meldstone brought to the wordsmith: walk up to him, and melding is open', () => {
  melding(() => {
    const g = seasoned(new Game('warrior', 12), 10);
    assert.ok(g.level.town, 'in town');
    const h = g.hero;
    h.meld = 'stone';
    assert.equal(g.meldProblem('power', 'fire'), 'Give him the MELDSTONE first');
    const st = g.level.stations.find((q) => q.kind === 'wordsmith')!;
    // (somewhere open beside him)
    let best = { x: h.x, y: h.y, d: 1e9 };
    const f = g.level.floor;
    for (let ty = 0; ty < f.h; ty++) for (let tx = 0; tx < f.w; tx++) {
      if (g.level.walk[ty * f.w + tx] !== 1) continue;
      const d = Math.hypot(tx + 0.5 - st.x, ty + 0.5 - st.y);
      if (d < best.d) best = { x: tx + 0.5, y: ty + 0.5, d };
    }
    h.x = best.x;
    h.y = best.y;
    const c = emptyControls();
    for (let k = 0; k < 10; k++) g.update(DT, c);
    assert.equal(h.meld, 'open', 'he has it, and can meld');
    // (as with his ring: once brought on this device, every hero after can meld, and no Meldstone falls for them)
    assert.equal(g.meta.meld, true, 'kept on this device');
    const next = new Game('mage', 14, g.meta);
    assert.equal(next.hero.meld, 'open', 'the next hero can meld from the start');
  });
});

test('the wordsmith melds two spare damage words into one, for runedust; both are used up, and the Lexicon knows what came of it', () => {
  melding(() => {
    const g = seasoned(new Game('warrior', 13), 10);
    const h = g.hero;
    h.words.power = 1;
    h.words.fire = 1;
    h.words.swift = 1;
    assert.equal(g.meldProblem('power', 'fire'), 'He needs the MELDSTONE to meld');
    h.meld = 'open';
    assert.equal(g.meldProblem('power', 'fire'), `Needs ${MELD_TUNE.cost} runedust`);
    h.dust = 2;
    assert.equal(g.meldProblem('power', 'swift'), 'Only damage words meld');
    assert.equal(g.meldProblem('power', 'frost'), 'No spare word');
    assert.equal(g.meldProblem('power', null), 'Two words go in');
    assert.equal(g.meldProblem('power', 'fire'), null);
    assert.equal(g.meta.known.eruption.found, false);
    assert.equal(g.meldWords('power', 'fire'), null);
    assert.equal(h.words.power, 0);
    assert.equal(h.words.fire, 0);
    assert.equal(h.words.eruption, 1);
    assert.equal(h.dust, 2 - MELD_TUNE.cost);
    assert.deepEqual(g.melded, { word: 'eruption', first: true });
    const k = g.meta.known.eruption;
    assert.ok(k.found && k.front && k.behind, 'found, and what it does in front and behind is known');
    assert.equal(g.meldProblem('eruption', 'frost'), 'A melded word melds no further');
    // a second Eruption is no longer new
    h.words.power = 1;
    h.words.fire = 1;
    assert.equal(g.meldWords('fire', 'power'), null);
    assert.deepEqual(g.melded, { word: 'eruption', first: false });
    assert.equal(h.words.eruption, 2);
    // runedust and the Meldstone are saved with it, and come back
    const back = Game.restore(JSON.parse(JSON.stringify(g.save())), g.meta);
    assert.equal(back.hero.dust, h.dust);
    assert.equal(back.hero.meld, 'open');
    assert.equal(back.hero.words.eruption, 2);
  });
  // with MELD off: nothing to meld with, and nothing of it in a save
  const g = seasoned(new Game('warrior', 13), 10);
  g.hero.words.power = 1;
  g.hero.words.fire = 1;
  assert.equal(g.meldProblem('power', 'fire'), 'Not yet');
  const saved = JSON.parse(JSON.stringify(g.save())) as Record<string, unknown>;
  assert.ok(!('dust' in saved) && !('meld' in saved), 'no runedust and no Meldstone in a save');
});
