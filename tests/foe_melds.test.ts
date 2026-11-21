// EVERY WORD ON A DUNGEON (game/foe_melds.ts, behind FOE_WORDS, off). His words, 4 Nov 2026, 19:07: “And ALL words need to be
// craftable on items and put into strongholds.” His picks, 12 Nov 2026 (the Crafting chat): a melded and a ranked word on a
// stronghold's altar, “Counts as two words (Recommended)”; on the gate too, “Yes, the gate too (Recommended)”; on a monster, “Both
// words plus a twist (Recommended)”, a ranked word “Yes, half as strong again (Recommended)”; and, of gear, “One line, crafting only
// (Recommended)” (MELD_LINE). What is held: with the switch off the game is as it was; with it on, the altar and the gate take them
// and count them as two, what each comes to on a monster, and each of the fifteen live melded words' twists at work; and the eight new
// melds' (Siphon to Implode), his picks of 12 Nov 2026, built at his word (“Yes, the melds' twists (Recommended)”).
//   run: tsx --test tests/foe_melds.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { FOE_WORDS, LOOT2, WORDS, wordShare } from '../src/game/defs';
import { FOE_TEXT, FOE_TUNE, foeRage, foeText, foeWordsOf, upTo, wordsWeight } from '../src/game/foe_melds';
import { Game } from '../src/game/game';
import { MELD_LINE, imbueItem, imbueLines, rollItem } from '../src/game/items';
import { emptyControls } from '../src/game/state';
import type { GameEvent, Monster, Zone } from '../src/game/state';
import { MELD8_IDS, MELD_IDS, RANK_IDS, VOLT_MELD_IDS } from '../src/game/types';
import type { MonsterKind, WordId } from '../src/game/types';
import { RNG as Rng } from '../src/engine/rng';

const DT = 1 / 30;

interface Inside {
  rng: RNG;
  waveT: number;
  zones: Zone[];
  spawn(kind: MonsterKind, x: number, y: number, pack: number, rank: 0 | 1 | 2, boss: boolean, rng: RNG): Monster;
  wakeUp(m: Monster): void;
  kill(m: Monster): void;
}

function withFoe<T>(on: boolean, fn: () => T): T {
  const was = FOE_WORDS.on;
  FOE_WORDS.on = on;
  try {
    return fn();
  } finally {
    FOE_WORDS.on = was;
  }
}

function room(): { g: Game; a: Inside } {
  const g = Game.forPractice('warrior', 5);
  const a = g as unknown as Inside;
  a.waveT = 1e9;
  g.monsters.length = 0;
  g.hero.x = 14.5;
  g.hero.y = 15.5;
  g.hero.life = g.hero.d.maxLife = 1e6;
  g.events.length = 0;
  return { g, a };
}

function put(g: Game, a: Inside, words: WordId[], dx = 1.2, dy = 0): Monster {
  const h = g.hero;
  const m = a.spawn('skeleton', h.x + dx, h.y + dy, 1, 0, false, a.rng);
  a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = 1e6;
  for (const w of foeWordsOf(words)) if (!m.words.includes(w)) m.words.push(w);
  return m;
}

function run(g: Game, secs: number, seen: GameEvent[] = []): GameEvent[] {
  for (let t = 0; t < secs - 1e-9; t += DT) {
    g.update(DT, emptyControls());
    seen.push(...g.events);
    g.events.length = 0;
  }
  return seen;
}

function dungeon(depth: number, seed = 7): Game {
  const g = new Game('warrior', seed);
  g.depth = depth;
  g.cleared = depth - 1;
  g.wayDepth = depth;
  g.enterDungeon();
  return g;
}

test('switch off: the altar and the gate turn melded and ranked words away, as before', () => {
  withFoe(false, () => {
    const g = dungeon(6);
    const q = g.level.land?.holds[0];
    assert.ok(q, 'floor 6 has a stronghold');
    if (!q) return;
    g.hero.words.hailstorm = 1;
    g.hero.words.fire2 = 1;
    assert.equal(g.altarProblem(q.n, 'hailstorm'), 'A melded word goes on attacks and gear only');
    assert.equal(g.altarProblem(q.n, 'fire2'), 'A ranked word goes on attacks and gear only');
    const t = new Game('warrior', 3);
    t.depth = 3;
    t.hero.words.hailstorm = 1;
    assert.equal(t.planProblem('hailstorm'), 'A melded word goes on attacks and gear only');
    assert.deepEqual(foeWordsOf(['hailstorm']), ['hailstorm']);
    assert.equal(wordsWeight(['hailstorm', 'fire2']), 2);
  });
});

test('on: the altar takes a melded and a ranked word, never a word already in one, nor a second element', () => {
  withFoe(true, () => {
    const g = dungeon(6);
    const q = g.level.land?.holds[0];
    if (!q) return assert.fail('floor 6 has a stronghold');
    for (const w of ['hailstorm', 'fire2', 'frost', 'fire', 'swift'] as WordId[]) g.hero.words[w] = 1;
    assert.equal(g.altarWord(q.n, 'hailstorm'), null);
    assert.equal(g.altarProblem(q.n, 'frost'), 'Already on the altar', 'Frost is in Hailstorm');
    assert.equal(g.altarProblem(q.n, 'fire2'), 'One element per stronghold', 'Hailstorm brings its two, no third');
    assert.equal(g.altarProblem(q.n, 'swift'), null);
    // (the gate, the same)
    const t = new Game('warrior', 3);
    t.depth = 3;
    for (const w of ['eruption', 'power', 'power2', 'heavy'] as WordId[]) t.hero.words[w] = 1;
    assert.equal(t.planWord('eruption'), null);
    assert.equal(t.planProblem('power'), 'Already burning', 'Power is in Eruption');
    assert.equal(t.planProblem('power2'), 'Already burning', "Power II is Power's");
    assert.equal(t.planProblem('heavy'), null);
  });
});

test('on: a melded or ranked word counts as two, the strongholds\' tables run on past three', () => {
  withFoe(true, () => {
    assert.equal(wordsWeight(['hailstorm', 'fire2', 'swift']), 5);
    assert.equal(upTo(LOOT2.hold, 3), LOOT2.hold[3]);
    assert.equal(upTo(LOOT2.hold, 6), LOOT2.hold[3] + (LOOT2.hold[3] - LOOT2.hold[2]) * 3);
    // (a stronghold's waves: harder by every word's worth past the first)
    const g = dungeon(6);
    const q = g.level.land?.holds[0];
    if (!q) return assert.fail('floor 6 has a stronghold');
    g.hero.words.hailstorm = 1;
    g.hero.words.swift = 1;
    assert.equal(g.altarWord(q.n, 'hailstorm'), null);
    assert.equal(g.altarWord(q.n, 'swift'), null);
    assert.equal(wordsWeight(g.level.holds![q.n].words), 3);
  });
});

test('on: what the words come to on a monster, and a ranked word half as strong again', () => {
  withFoe(true, () => {
    const on = foeWordsOf(['hailstorm', 'fire2', 'swift']);
    for (const w of ['frost', 'lightning', 'hailstorm', 'fire', 'fire2', 'swift'] as WordId[]) assert.ok(on.includes(w), w);
    assert.equal(wordShare({ words: on }, 'fire'), 1.5);
    assert.equal(wordShare({ words: on }, 'frost'), 1);
    assert.equal(wordShare({ words: on, half: ['fire'] }, 'fire'), 1.5 * 0.5);
  });
  withFoe(false, () => assert.equal(wordShare({ words: ['fire', 'fire2'] }, 'fire'), 1));
});

test('on: every live melded word and ranked word has its page, its two words and its twist', () => {
  withFoe(true, () => {
    for (const w of [...MELD_IDS, ...VOLT_MELD_IDS, ...MELD8_IDS]) {
      assert.ok(FOE_TEXT[w], `${w} has a twist`);
      assert.ok(foeText(w).includes(FOE_TEXT[w] ?? '~'), w);
    }
    for (const w of RANK_IDS) assert.match(foeText(w), /half as strong again/, w);
    assert.equal(foeText('fire2'), 'Deals fire damage and sets you burning, half as strong again.');
  });
});

test('on: Hailstorm on a monster, a blow half frost, half lightning: it chills him and shocks him; and its hail', () => {
  withFoe(true, () => {
    const { g, a } = room();
    const m = put(g, a, ['hailstorm']);
    g.hurtHero(100, g.monsterElement(m), m.words, m);
    assert.ok(g.hero.chillT > 0, 'chilled');
    assert.ok(g.hero.shockT > 0, 'shocked');
    // (its hail: a marked circle on him, within its wait)
    a.zones.length = 0;
    m.hailT = 0.01;
    run(g, 0.1);
    const hail = a.zones.find((z) => z.kind === 'warn' && z.from.endsWith("'s hail"));
    assert.ok(hail, 'hail marked round him');
    if (hail) assert.ok(Math.hypot(hail.x - g.hero.x, hail.y - g.hero.y) < 0.2);
  });
});

test('on: Avalanche hits harder on him chilled; Scald cracks; Blight makes every blow harder while its poison is on him', () => {
  withFoe(true, () => {
    const hurt = (words: WordId[], set: (g: Game) => void, el: 'phys' | 'fire' | 'frost' = 'phys'): number => {
      const { g, a } = room();
      const m = put(g, a, words);
      set(g);
      const was = g.hero.life;
      g.hurtHero(100, el, m.words, m);
      return was - g.hero.life;
    };
    const plain = hurt(['avalanche'], () => {}, 'frost');
    const cold = hurt(['avalanche'], (g) => {
      g.hero.chillT = 2;
      g.hero.chill = 0.3;
    }, 'frost');
    assert.ok(cold > plain * 1.2, `Avalanche: ${cold} on him chilled, ${plain} not`);
    const dry = hurt(['scald'], () => {}, 'fire');
    const crack = hurt(['scald'], (g) => {
      g.hero.chillT = 2;
    }, 'fire');
    assert.ok(crack > dry * 1.3, `Scald: ${crack} cracking, ${dry} not`);
    // (Blight: its poison on him, then another's blow)
    const { g, a } = room();
    const b = put(g, a, ['blight']);
    const other = put(g, a, [], -1.2, 0);
    let was = g.hero.life;
    g.hurtHero(100, 'phys', other.words, other);
    const before = was - g.hero.life;
    g.hurtHero(100, 'phys', b.words, b);
    assert.ok(g.hero.poisonT > 0 && (g.hero.blightMore ?? 0) > 0, 'blighted');
    was = g.hero.life;
    g.hurtHero(100, 'phys', other.words, other);
    assert.ok(was - g.hero.life > before * 1.1, `after Blight ${was - g.hero.life}, before ${before}`);
  });
});

test('on: Eruption builds heat and erupts round it; Thunder claps every few blows', () => {
  withFoe(true, () => {
    const { g, a } = room();
    const e = put(g, a, ['eruption']);
    for (let i = 0; i < FOE_TUNE.eruption.heat; i++) g.hurtHero(10, 'fire', e.words, e);
    assert.ok(a.zones.some((z) => z.kind === 'warn' && z.from.endsWith("'s eruption") && Math.hypot(z.x - e.x, z.y - e.y) < 0.1), 'erupts round it');
    const t = put(g, a, ['thunder'], -1.2, 0);
    for (let i = 0; i < FOE_TUNE.thunder.every; i++) g.hurtHero(10, 'lightning', t.words, t);
    assert.ok(a.zones.some((z) => z.kind === 'warn' && z.from.endsWith("'s thunderclap")), 'claps');
  });
});

test('on: Wildfire leaves a fire that sparks at him; Frostbite takes life while he is chilled', () => {
  withFoe(true, () => {
    const { g, a } = room();
    const w = put(g, a, ['wildfire']);
    g.hurtHero(50, 'fire', w.words, w);
    const fire = a.zones.find((z) => z.foe === 'wildfire');
    assert.ok(fire && fire.hostile, 'a fire where he stood');
    const seen = run(g, 1.5);
    assert.ok(seen.some((e) => e.t === 'arc'), 'it sparked at him');
    const r = room();
    const f = put(r.g, r.a, ['frostbite']);
    r.g.hurtHero(50, 'frost', f.words, f);
    assert.ok((r.g.hero.frostbiteDps ?? 0) > 0 && r.g.hero.chillT > 0, 'frostbitten');
    const was = r.g.hero.life;
    run(r.g, 1);
    assert.ok(r.g.hero.life < was, 'losing life');
  });
});

test('on: what the melded words leave as they die', () => {
  withFoe(true, () => {
    const die = (words: WordId[]): { g: Game; a: Inside; m: Monster } => {
      const { g, a } = room();
      const m = put(g, a, words, 2.5, 0);
      a.kill(m);
      return { g, a, m };
    };
    let r = die(['fumes']);
    assert.ok(r.a.zones.some((z) => z.foe === 'fumes' && z.kind === 'venom' && z.hostile), 'Fumes: a cloud');
    r = die(['contagion']);
    assert.ok(r.a.zones.some((z) => z.foe === 'contagion'), 'Contagion: a cloud');
    r = die(['rupture']);
    assert.ok(r.a.zones.some((z) => z.foe === 'rupture'), 'Rupture: its splash');
    r = die(['powderkeg']);
    assert.ok(r.a.zones.some((z) => z.foe === 'powderkeg' && z.kind === 'burn'), 'Powderkeg: burning ground');
    r = die(['demolition']);
    const blast = r.a.zones.find((z) => z.kind === 'warn' && z.from.endsWith('dying blast'));
    assert.ok(blast && blast.r === FOE_TUNE.demolition.r && blast.dur === FOE_TUNE.demolition.wait, 'Demolition: huge and slow');
    r = die(['shatter']);
    assert.equal(r.g.projectiles.filter((p) => p.hostile).length, FOE_TUNE.shatter.n, 'Shatter: its ring of shards');
    r = die(['chainreaction']);
    const was = r.g.hero.life;
    const seen = run(r.g, 1);
    assert.ok(seen.some((e) => e.t === 'arc') && r.g.hero.life < was, 'Chain Reaction: an arc at him');
  });
});

test('on: Fumes\' cloud goes off when he walks in burning', () => {
  withFoe(true, () => {
    const { g, a } = room();
    const m = put(g, a, ['fumes'], 3, 0);
    a.kill(m);
    run(g, 1);
    const cloud = a.zones.find((z) => z.foe === 'fumes');
    if (!cloud) return assert.fail('a cloud');
    g.hero.burnT = 3;
    g.hero.burnDps = 1;
    g.hero.x = cloud.x;
    g.hero.y = cloud.y;
    const was = g.hero.life;
    const seen = run(g, 0.2);
    assert.ok(!a.zones.includes(cloud), 'gone off');
    assert.ok(seen.some((e) => e.t === 'burst') && g.hero.life < was);
  });
});

test('on: the eight new melds: Siphon cuts his healing, Cauterize sears its wounds shut, Forking forks, Shiver freezes', () => {
  withFoe(true, () => {
    // (Siphon: its poison on him, every heal the less)
    const healed = (words: WordId[]): number => {
      const { g, a } = room();
      const m = put(g, a, words);
      g.hurtHero(100, 'phys', m.words, m);
      g.hero.life = 1000;
      (g as unknown as { healHero(n: number): void }).healHero(1000);
      return g.hero.life - 1000;
    };
    const plain = healed(['poison']);
    const cut = healed(['siphon']);
    assert.ok(Math.abs(cut - plain * (1 - FOE_TUNE.siphon)) < 2, `Siphon: healed ${cut}, without it ${plain}`);
    // (Cauterize: low on life, a flash, then some of its life back, once)
    let r = room();
    const c = put(r.g, r.a, ['cauterize']);
    c.life = c.maxLife * 0.2;
    const seen = run(r.g, 0.2);
    assert.ok(c.seared && seen.some((e) => e.t === 'burst'), 'Cauterize: it flashes');
    run(r.g, FOE_TUNE.cauterize.flash + 0.2);
    assert.ok(c.life > c.maxLife * (0.2 + FOE_TUNE.cauterize.heal * 0.9), `Cauterize: its wounds seared shut, ${c.life / c.maxLife}`);
    c.life = c.maxLife * 0.1;
    run(r.g, FOE_TUNE.cauterize.flash + 0.3);
    assert.ok(c.life <= c.maxLife * 0.1 + 1, 'only once');
    // (Forking: a lightning blow, then a second bolt marked where he was struck)
    r = room();
    const f = put(r.g, r.a, ['forking']);
    r.g.hurtHero(100, 'lightning', f.words, f);
    const fork = r.a.zones.find((z) => z.kind === 'warn' && z.from.endsWith("'s forked bolt"));
    assert.ok(fork && Math.hypot(fork.x - r.g.hero.x, fork.y - r.g.hero.y) < 0.1 && fork.dur === FOE_TUNE.forking.wait, 'Forking: its second bolt');
    // (Shiver: now and then a critical hit, and he is frozen a moment)
    r = room();
    const sh = put(r.g, r.a, ['shiver']);
    let froze = 0;
    for (let i = 0; i < 80; i++) {
      r.g.hero.iceT = 0;
      r.g.hurtHero(100, 'frost', sh.words, sh);
      if ((r.g.hero.iceT ?? 0) > 0) froze++;
    }
    assert.ok(froze > 5 && froze < 35, `Shiver: frozen by ${froze} of 80 blows`);
  });
});

test('on: Sunder follows a knockback up harder; Fervor is fed by deaths; Rime Ward\'s shield chills; Implode draws him in', () => {
  withFoe(true, () => {
    // (Sunder: its blow after one that knocked him back, much harder; the one after that, as before)
    let r = room();
    const su = put(r.g, r.a, ['sunder']);
    const hit = (): number => {
      const was = r.g.hero.life;
      r.g.hurtHero(100, 'phys', su.words, su);
      return was - r.g.hero.life;
    };
    const first = hit();
    const second = hit();
    const third = hit();
    assert.ok(second > first * 1.5 && third < second * 0.8, `Sunder: ${first}, then ${second}, then ${third}`);
    // (Fervor: one dying near it feeds it: faster, its fire hotter)
    r = room();
    const fv = put(r.g, r.a, ['fervor']);
    const near = put(r.g, r.a, [], 0, 1.5);
    let was = r.g.hero.life;
    r.g.hurtHero(100, 'fire', fv.words, fv);
    const before = was - r.g.hero.life;
    r.a.kill(near);
    assert.equal(fv.fervorN, 1, 'fed');
    assert.ok(foeRage(fv) > 1, 'faster');
    r.g.hero.burnT = 0;
    was = r.g.hero.life;
    r.g.hurtHero(100, 'fire', fv.words, fv);
    assert.ok(was - r.g.hero.life > before * 1.05, `hotter: ${was - r.g.hero.life} after, ${before} before`);
    run(r.g, FOE_TUNE.fervor.secs + 0.5);
    assert.ok(!fv.fervorN, 'it wears off');
    // (Rime Ward: a blow of his on its shield chills him)
    r = room();
    const rw = put(r.g, r.a, ['rimeward']);
    rw.shield = 500;
    r.g.hero.chillT = 0;
    r.g.damageMonster(rw, 100, 'phys', false, 0);
    assert.ok(r.g.hero.chillT > 0, 'Rime Ward: chilled');
    // (Implode: as it dies its blast is marked, and he is drawn in toward it)
    r = room();
    const im = put(r.g, r.a, ['implode'], 3, 0);
    const from = Math.hypot(r.g.hero.x - im.x, r.g.hero.y - im.y);
    r.a.kill(im);
    const blast = r.a.zones.find((z) => z.kind === 'warn' && z.from.endsWith('dying blast'));
    assert.ok(blast && blast.r === FOE_TUNE.implode.r && blast.dur === FOE_TUNE.implode.wait, 'Implode: its blast marked');
    assert.ok(r.a.zones.some((z) => z.foe === 'implode' && z.kind === 'vortex'), 'its pull');
    run(r.g, 0.8);
    assert.ok(Math.hypot(r.g.hero.x - im.x, r.g.hero.y - im.y) < from - 0.5, `drawn in: ${from.toFixed(2)} to ${Math.hypot(r.g.hero.x - im.x, r.g.hero.y - im.y).toFixed(2)}`);
  });
});

test('MELD_LINE: a melded word\'s two of a kind, one number, one line; off, two lines as before', () => {
  const ring = (): ReturnType<typeof rollItem> => {
    const it = rollItem(12, new Rng(5), { slot: 'amulet', rarity: 0 });
    it.affixes = [];
    it.imbues = [];
    return it;
  };
  const was = MELD_LINE.on;
  try {
    MELD_LINE.on = true;
    let lines: string[] = [];
    for (let s = 1; s < 40 && !lines.length; s++) {
      const it = ring();
      const im = imbueItem(it, 'hailstorm', new Rng(s));
      if (im && im.mods.length === 2 && im.mods[0].stat === 'frostPct' && im.mods[1].stat === 'lightPct') {
        assert.equal(im.mods[0].value, im.mods[1].value);
        lines = imbueLines(im, 'cooldown');
      }
    }
    assert.equal(lines.length, 1);
    assert.match(lines[0], /^\+\d+% Frost and Lightning Damage$/);
    MELD_LINE.on = false;
    const it = ring();
    const im = imbueItem(it, 'hailstorm', new Rng(3));
    if (im) assert.equal(imbueLines(im, 'cooldown').length, 2);
  } finally {
    MELD_LINE.on = was;
  }
  assert.ok(WORDS.hailstorm);
});
