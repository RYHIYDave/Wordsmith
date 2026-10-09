// THE SKILL TREES AT WORK (game/talents.ts, TALENTS: OFF until the owner has said yes): what each
// talent does, by the rules in game/game.ts, with the switch on for each test (and off again after).
// Their numbers are TALENT_TUNE's, as the cards say them.
//   run: tsx --test tests/talents_rules.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { FRENZY, SKILLS, TUNE } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Monster, Projectile, Trap, Volley, Zone } from '../src/game/state';
import { TALENTS, TALENT_TUNE } from '../src/game/talents';
import type { ClassId, Element, MonsterKind, WordId } from '../src/game/types';
import { land } from './helpers';

const DT = 1 / 30;
const near = (a: number, b: number, what: string, tol = 1e-6): void => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${what}: ${a} is not ${b}`);

interface Inside {
  rng: RNG;
  waveT: number;
  zones: Zone[];
  traps: Trap[];
  volleys: Volley[];
  projectiles: Projectile[];
  stillT: number;
  momentumT: number;
  windT: number;
  spawn(kind: MonsterKind, x: number, y: number, pack: number, rank: 0 | 1 | 2, boss: boolean, rng: RNG): Monster;
  wakeUp(m: Monster): void;
  hitMonster(m: Monster, i: number, frac: number, quiet: boolean): void;
  damageMonster(m: Monster, dmg: number, el: Element, crit: boolean, skill: number): void;
  poisonMonster(m: Monster, dps: number, skill: number): void;
  talentHitMult(m: Monster): number;
  kill(m: Monster): void;
  practice: boolean;
}

/** With the talents' switch on for the test, and off again after. */
function on(fn: () => void): void {
  TALENTS.on = true;
  try {
    fn();
  } finally {
    TALENTS.on = false;
  }
}

/** The practice room, emptied, the hero at (14.5, 15.5) facing +x, with these talents and words. */
function room(cls: ClassId, talents: string[], words: readonly [number, 'front' | 'behind', WordId][] = [], seed = 5): { g: Game; a: Inside; seen: GameEvent[] } {
  const g = Game.forPractice(cls, seed);
  const a = g as unknown as Inside;
  a.waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  h.x = 14.5;
  h.y = 15.5;
  h.fx = 1;
  h.fy = 0;
  for (const [i, side, w] of words) {
    h.words[w] = (h.words[w] ?? 0) + 1;
    assert.equal(g.socket(i, side, w), null, `${w} goes ${side} of ability ${i}`);
  }
  h.talents = [...talents];
  g.refresh();
  h.life = h.d.maxLife;
  g.events.length = 0;
  return { g, a, seen: [] };
}

function put(g: Game, a: Inside, kind: MonsterKind, dx: number, dy: number, rank: 0 | 1 | 2 = 0, boss = false): Monster {
  const h = g.hero;
  const m = a.spawn(kind, h.x + dx, h.y + dy, 1, rank, boss, a.rng);
  a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = 1e6;
  return m;
}

function run(g: Game, seen: GameEvent[], secs: number, c: Controls = emptyControls()): void {
  for (let t = 0; t < secs - 1e-9; t += DT) {
    g.update(DT, c);
    seen.push(...g.events);
    g.events.length = 0;
  }
}

/** The evasive move toward (dx, dy) from the hero, to where it ends. */
function evade(g: Game, seen: GameEvent[], dx: number, dy: number): void {
  const h = g.hero;
  const c = emptyControls();
  c.evade = true;
  c.evadeX = h.x + dx;
  c.evadeY = h.y + dy;
  g.update(DT, c);
  seen.push(...g.events);
  g.events.length = 0;
  run(g, seen, 0.6);
}

/** The quick attack at monster `m`, to where it lands. */
function swing(g: Game, seen: GameEvent[], m: Monster): void {
  const h = g.hero;
  h.swingT = 0;
  const c = emptyControls();
  c.fire = true;
  c.aimX = m.x;
  c.aimY = m.y;
  g.update(DT, c);
  seen.push(...g.events);
  g.events.length = 0;
  c.fire = false;
  land(g, c, DT, () => {
    seen.push(...g.events);
    g.events.length = 0;
  });
}

const of = <T extends GameEvent['t']>(seen: readonly GameEvent[], t: T): Extract<GameEvent, { t: T }>[] => seen.filter((e) => e.t === t) as Extract<GameEvent, { t: T }>[];

// ---- with the switch off, a hero's talents do nothing -------------------------------------------

test('switched off, talents written into a hero do nothing', () => {
  const g = Game.forPractice('warrior', 5);
  const before = g.hero.d.maxLife;
  g.hero.talents = ['thickskin', 'bloodlust'];
  g.refresh();
  assert.equal(g.hero.d.maxLife, before);
  assert.equal(g.has('thickskin'), false);
});

// ---- the warrior ------------------------------------------------------------------------------

test('Thick Skin: life +15%; Bloodlust: all damage +15%', () => {
  on(() => {
    const bare = room('warrior', []).g.hero.d;
    const { g } = room('warrior', ['thickskin', 'bloodlust']);
    assert.equal(g.hero.d.maxLife, Math.round(bare.maxLife * 1.15));
    assert.equal(g.hero.d.stats.dmgPct, bare.stats.dmgPct + 15);
  });
});

test('Battle Rush: Leap ready again 30% sooner; Fury: Power and Frenzied stack to eight', () => {
  on(() => {
    const bare = room('warrior', []).g.hero.skills[2].r.cooldown;
    const { g } = room('warrior', ['battlerush', 'fury'], [[0, 'front', 'frenzied']]);
    assert.equal(SKILLS[g.hero.skills[2].id].kind, 'leap');
    near(g.hero.skills[2].r.cooldown, bare * 0.7, 'the leap\'s wait');
    // eight uses of a Frenzied attack: eight stacks (five without Fury)
    const inner = g as unknown as { boons(i: number): void };
    for (let k = 0; k < 10; k++) inner.boons(0);
    assert.equal(g.hero.frenzy, 8);
    const plain = room('warrior', [], [[0, 'front', 'frenzied']]).g;
    for (let k = 0; k < 10; k++) (plain as unknown as { boons(i: number): void }).boons(0);
    assert.equal(plain.hero.frenzy, FRENZY.max);
  });
});

test('Wrath: elites and bosses take 25% more; Berserk: below half life, 30% harder and faster', () => {
  on(() => {
    const { g, a } = room('warrior', ['wrath', 'berserk']);
    const m = put(g, a, 'skeleton', 1, 0);
    const e = put(g, a, 'skeleton', 1, 1, 1);
    near(a.talentHitMult(m), 1, 'a plain monster');
    near(a.talentHitMult(e), 1.25, 'an elite');
    const pace = g.frenzyPace();
    g.hero.life = g.hero.d.maxLife * 0.4;
    near(a.talentHitMult(m), 1.3, 'below half his life');
    near(g.frenzyPace(), pace * 1.3, 'and faster');
  });
});

test('Bulwark: 10% less harm; Thorns: what strikes him up close takes 30% back; Second Wind: flasks 30% more', () => {
  on(() => {
    const plain = room('warrior', []);
    const { g, a } = room('warrior', ['bulwark', 'thorns', 'secondwind']);
    const m = put(g, a, 'skeleton', 1, 0);
    const pm = put(plain.g, plain.a, 'skeleton', 1, 0);
    const life0 = g.hero.life;
    const plain0 = plain.g.hero.life;
    g.hurtHero(100, 'phys', [], m);
    plain.g.hurtHero(100, 'phys', [], pm);
    const took = life0 - g.hero.life;
    const plainTook = plain0 - plain.g.hero.life;
    assert.ok(Math.abs(took - plainTook * 0.9) <= 1, `took ${took}, against ${plainTook} without`);
    assert.equal(m.maxLife - m.life, 30, 'the skeleton took 30 back');
    assert.equal(pm.life, pm.maxLife);
    // a flask
    g.hero.life = 1;
    g.hero.potions = 1;
    g.usePotion();
    near(g.hero.life, Math.min(g.hero.d.maxLife, 1 + g.hero.d.maxLife * TUNE.potionHeal * 1.3), 'healed', 1e-3);
  });
});

test('Unbreakable: once a dungeon, a killing blow leaves him at 1 life, shielded', () => {
  on(() => {
    const { g, a } = room('warrior', ['unbreakable']);
    a.practice = false;
    g.hurtHero(1e6, 'phys', [], null);
    assert.equal(g.hero.life, 1);
    assert.ok(g.hero.invuln >= 2.9, 'shielded for three seconds');
    assert.equal(g.over, false);
    g.hero.invuln = 0;
    g.hurtHero(1e6, 'phys', [], null);
    assert.ok(g.hero.life <= 0 || g.over, 'not twice in one dungeon');
  });
});

test('Earthshaker: the leap lands with a quake that stuns everything near', () => {
  on(() => {
    const { g, a, seen } = room('warrior', ['earthshaker']);
    const m1 = put(g, a, 'skeleton', 4.2, 0.8);
    const m2 = put(g, a, 'skeleton', 4.2, -1.2);
    const far = put(g, a, 'skeleton', -4, 0);
    evade(g, seen, 4, 0);
    assert.ok(m1.stunT > 0 && m2.stunT > 0, `stunned: ${m1.stunT}, ${m2.stunT}`);
    assert.equal(far.stunT, 0, 'not what is far');
    assert.ok(of(seen, 'heavy').some((e) => e.big), 'the quake shows');
  });
});

test('Cleave: a melee hit splashes 30% of itself on the enemies beside', () => {
  on(() => {
    const { g, a, seen } = room('warrior', ['cleave']);
    const m = put(g, a, 'skeleton', 1.1, 0);
    const beside = put(g, a, 'skeleton', 1.4, 0.9);
    swing(g, seen, m);
    const hurt = m.maxLife - m.life;
    const side = beside.maxLife - beside.life;
    assert.ok(hurt > 0 && side > 0, `both hurt: ${hurt}, ${side}`);
    assert.ok(side < hurt * 0.5, 'the one beside the less');
  });
});

test('Momentum: a kill, 25% faster for a second', () => {
  on(() => {
    const { g, a } = room('warrior', ['momentum']);
    const m = put(g, a, 'skeleton', 1, 0);
    a.kill(m);
    near(a.momentumT, 1, 'the second of speed');
  });
});

// ---- the ranger --------------------------------------------------------------------------------

test('Light Step: Trap holds three charges and rolls a third further; Windrunner after a roll', () => {
  on(() => {
    const bare = room('ranger', []);
    const { g, a, seen } = room('ranger', ['lightstep', 'windrunner']);
    assert.equal(g.hero.skills[2].maxCharges, 3);
    assert.equal(bare.g.hero.skills[2].maxCharges, 2);
    const x0 = g.hero.x;
    evade(g, seen, 6, 0);
    const bx0 = bare.g.hero.x;
    evade(bare.g, bare.seen, 6, 0);
    const went = g.hero.x - x0;
    const bareWent = bare.g.hero.x - bx0;
    near(went, bareWent * (4 / 3), 'a third further', 0.08);
    assert.ok(a.windT > 1, 'and runs faster for a while');
  });
});

test('Minefield: each roll lays three traps; Wide Traps: their bursts a third wider', () => {
  on(() => {
    const { g, a, seen } = room('ranger', ['minefield', 'widetraps']);
    evade(g, seen, -3, 0);
    assert.equal(a.traps.length, 3, 'three traps');
    const plain = room('ranger', []);
    evade(plain.g, plain.seen, -3, 0);
    assert.equal(plain.a.traps.length, 1);
    // one goes off: its burst is a third wider
    const t = a.traps[0];
    put(g, a, 'skeleton', t.x - g.hero.x, t.y - g.hero.y);
    a.traps.forEach((q) => (q.arm = 0));
    run(g, seen, 0.2);
    const pt = plain.a.traps[0];
    put(plain.g, plain.a, 'skeleton', pt.x - plain.g.hero.x, pt.y - plain.g.hero.y);
    plain.a.traps.forEach((q) => (q.arm = 0));
    run(plain.g, plain.seen, 0.2);
    const r = Math.max(...of(seen, 'burst').map((e) => e.r));
    const pr = Math.max(...of(plain.seen, 'burst').map((e) => e.r));
    near(r, pr * (4 / 3), 'the burst', 1e-3);
  });
});

test('Long Shot, Piercing and Split Shot: arrows further and faster, through one more, every third in three', () => {
  on(() => {
    const { g, a, seen } = room('ranger', ['longshot', 'piercing', 'splitshot']);
    const m = put(g, a, 'skeleton', 6, 0);
    const counts: number[] = [];
    for (let k = 0; k < 3; k++) {
      a.projectiles.length = 0;
      g.hero.swingT = 0;
      const c = emptyControls();
      c.fire = true;
      c.aimX = m.x;
      c.aimY = m.y;
      for (let n = 0; n < 12 && a.projectiles.length === 0; n++) {
        g.update(DT, c);
        c.fire = false;
      }
      counts.push(a.projectiles.length);
      const p = a.projectiles[0];
      near(p.dist <= SKILLS.shot.range * (4 / 3) ? 1 : 0, 1, 'a third further at most');
      assert.ok(p.dist > SKILLS.shot.range, `further than ${SKILLS.shot.range}: ${p.dist}`);
      assert.equal(p.pierceN, 1, 'through one more');
      run(g, seen, 0.6);
    }
    assert.deepEqual(counts, [1, 1, 3], 'every third shot splits in three');
  });
});

test('Hail: Volley rains twice as long, and half again as wide', () => {
  on(() => {
    const { g, a } = room('ranger', ['hail']);
    const plain = room('ranger', []);
    for (const [gg, aa] of [[g, a], [plain.g, plain.a]] as const) {
      const c = emptyControls();
      c.cast = true;
      c.castX = gg.hero.x + 5;
      c.castY = gg.hero.y;
      for (let n = 0; n < 30 && aa.volleys.length === 0; n++) {
        gg.update(DT, c);
        c.cast = false;
      }
      assert.equal(aa.volleys.length, 1, 'a volley');
    }
    near(a.volleys[0].r, plain.a.volleys[0].r * 1.5, 'wider');
    assert.equal(a.volleys[0].total, plain.a.volleys[0].total * 2, 'twice as many arrows: twice as long');
  });
});

test("Far Sight: up to +50% at eight tiles; Steady Aim: +15% standing still; Hunter's Mark: a triple critical", () => {
  on(() => {
    const { g, a, seen } = room('ranger', ['farsight', 'steadyaim', 'huntersmark']);
    const close = put(g, a, 'skeleton', 0.5, 0);
    const mid = put(g, a, 'skeleton', 4, 0);
    const far = put(g, a, 'skeleton', 9, 0);
    a.stillT = 0;
    near(a.talentHitMult(close), 1 + 0.5 * (0.5 / 8), 'close');
    near(a.talentHitMult(mid), 1.25, 'four tiles');
    near(a.talentHitMult(far), 1.5, 'beyond eight');
    run(g, seen, 0.5);
    // (the one close by has pushed him a little: measured from where he stands now)
    const dist = Math.hypot(mid.x - g.hero.x, mid.y - g.hero.y);
    const k = a.talentHitMult(mid);
    near(k, (1 + 0.5 * Math.min(1, dist / 8)) * 1.15, 'standing still');
    // a marked one: its critical's extra is three times as much
    const d = g.hero.d;
    mid.markT = 5;
    const life = mid.life;
    a.hitMonster(mid, 0, 1, true);
    const hit = life - mid.life;
    const most = d.dmgMax * g.hero.skills[0].r.dmgMult * (1 + (d.stats.dmgPct + d.stats.physPct + g.hero.might) / 100) * k * (1 + (d.critMult / 100) * 3);
    const least = d.dmgMin * g.hero.skills[0].r.dmgMult * (1 + (d.stats.dmgPct + d.stats.physPct + g.hero.might) / 100) * k * (1 + (d.critMult / 100) * 3);
    assert.ok(hit >= Math.floor(least) - 1 && hit <= Math.ceil(most) + 1, `${hit} within ${least}..${most}`);
  });
});

test('Venom: poison stacks twice as high; Fleet, Keen Eye, Quick Draw: their numbers', () => {
  on(() => {
    const { g, a } = room('ranger', ['venom', 'fleet', 'keeneye', 'quickdraw']);
    const bare = room('ranger', []).g.hero.d;
    const m = put(g, a, 'skeleton', 1, 0);
    for (let k = 0; k < 20; k++) a.poisonMonster(m, 1, 0);
    assert.equal(m.poisonN, TUNE.poisonStacks * 2);
    assert.equal(g.hero.d.stats.moveSpeed, bare.stats.moveSpeed + 10);
    assert.equal(g.hero.d.stats.critChance, bare.stats.critChance + 8);
    assert.equal(g.hero.d.stats.atkSpeed, bare.stats.atkSpeed + 10);
  });
});

// ---- the mage ----------------------------------------------------------------------------------

test('Frost Warp, Flame Warp, Storm Warp: cold where she leaves, fire on the way, lightning where she arrives', () => {
  on(() => {
    const { g, a, seen } = room('mage', ['frostwarp', 'flamewarp', 'stormwarp']);
    const left = put(g, a, 'skeleton', 1.2, 1.2);
    const there = put(g, a, 'skeleton', 5.5, 0.5);
    const x0 = g.hero.x;
    evade(g, seen, 5, 0);
    assert.ok(g.hero.x > x0 + 3, 'she warped');
    assert.ok(of(seen, 'freeze').length >= 1 && left.frozenT >= 0, 'the one she left is frozen');
    const fires = a.zones.filter((z) => z.kind === 'burn');
    assert.ok(fires.length >= 4, `fire along the way: ${fires.length} patches`);
    assert.ok(there.maxLife - there.life > 0, 'lightning where she arrived');
  });
});

test('Stormcaller: lightning strikes an enemy near her every two seconds', () => {
  on(() => {
    const { g, a, seen } = room('mage', ['stormcaller']);
    const m = put(g, a, 'skeleton', 3, 0);
    run(g, seen, 4.2);
    const bolts = of(seen, 'arc').filter((e) => e.sky);
    assert.ok(bolts.length >= 2 && bolts.length <= 3, `${bolts.length} bolts in four seconds`);
    assert.ok(m.maxLife - m.life > 0);
  });
});

test('Kindling, Charged, Bitter Cold: +25% of their element; Overload: shocked enemies take 15% more', () => {
  on(() => {
    const bare = room('mage', []).g.hero.d.stats;
    const { g, a } = room('mage', ['kindling', 'charged', 'bittercold', 'overload']);
    const st = g.hero.d.stats;
    assert.deepEqual([st.firePct - bare.firePct, st.lightPct - bare.lightPct, st.frostPct - bare.frostPct], [25, 25, 25]);
    const m = put(g, a, 'skeleton', 1, 0);
    a.damageMonster(m, 100, 'phys', false, -1);
    assert.equal(m.maxLife - m.life, 100);
    m.shockT = 1;
    a.damageMonster(m, 100, 'phys', false, -1);
    assert.equal(m.maxLife - m.life, 100 + 115);
  });
});

test('Searing, Deep Freeze, Shatter, Inferno: burning longer and harder, frozen longer, the frozen take double, the burning dead explode', () => {
  on(() => {
    const { g, a, seen } = room('mage', ['searing', 'deepfreeze', 'shatter', 'inferno'], [[0, 'front', 'fire']]);
    const m = put(g, a, 'skeleton', 1, 0);
    a.hitMonster(m, 0, 1, true);
    assert.equal(m.burnT, 4, 'burning a second longer');
    const frozen = put(g, a, 'skeleton', 1, 1);
    frozen.frozenT = 1;
    near(a.talentHitMult(frozen), 2, 'the frozen take double');
    // Inferno: one that dies burning explodes, and what it reaches burns
    const by = put(g, a, 'skeleton', 1.8, 0);
    m.life = 1;
    a.damageMonster(m, 5, 'phys', false, -1);
    run(g, seen, 0.3);
    assert.ok(by.maxLife - by.life > 0, 'its neighbour hurt');
    assert.ok(by.burnT > 0, 'and burning');
  });
});

test('Forking: Lightning arcs to two more', () => {
  on(() => {
    const { g, a, seen } = room('mage', ['forking'], [[0, 'front', 'lightning']]);
    const m = put(g, a, 'skeleton', 1, 0);
    const others = [put(g, a, 'skeleton', 2, 0), put(g, a, 'skeleton', 1, 1), put(g, a, 'skeleton', 2, 1), put(g, a, 'skeleton', 1, -1), put(g, a, 'skeleton', 2, -1)];
    const arcs = g.hero.skills[0].r.arcs;
    a.hitMonster(m, 0, 1, false);
    const hurt = others.filter((o) => o.life < o.maxLife).length;
    assert.equal(hurt, Math.min(others.length, arcs + 2));
    void seen;
  });
});

test('Fuel: Flame in front explodes a third wider; Rime: the ice Frost leaves twice as big; Deep Freeze: frozen half as long again', () => {
  on(() => {
    const fuel = room('warrior', ['fuel'], [[0, 'front', 'fire']]);
    const bare = room('warrior', [], [[0, 'front', 'fire']]);
    for (const w of [fuel, bare]) {
      const m = put(w.g, w.a, 'skeleton', 1.1, 0);
      swing(w.g, w.seen, m);
    }
    const r1 = Math.max(...of(fuel.seen, 'burst').map((e) => e.r));
    const r0 = Math.max(...of(bare.seen, 'burst').map((e) => e.r));
    near(r1, r0 * (4 / 3), 'the blast', 1e-3);
    // Rime: the ice of Frost behind
    const rime = room('ranger', ['rime'], [[0, 'behind', 'frost']]);
    const plain = room('ranger', [], [[0, 'behind', 'frost']]);
    for (const w of [rime, plain]) {
      const m = put(w.g, w.a, 'skeleton', 3, 0);
      swing(w.g, w.seen, m);
      run(w.g, w.seen, 0.6);
    }
    const ice1 = rime.a.zones.filter((z) => z.kind === 'ice');
    const ice0 = plain.a.zones.filter((z) => z.kind === 'ice');
    assert.ok(ice1.length > 0 && ice0.length > 0, 'ice left');
    near(Math.max(...ice1.map((z) => z.r)), Math.max(...ice0.map((z) => z.r)) * 2, 'twice as big');
    // Deep Freeze: a chilled monster hit by frost again is frozen half as long again
    const deep = room('mage', ['deepfreeze'], [[0, 'front', 'frost']]);
    const m = put(deep.g, deep.a, 'skeleton', 1, 0);
    m.chillT = 1;
    m.chill = 0.3;
    deep.a.hitMonster(m, 0, 1, true);
    near(m.frozenT, 1.1 * 1.5, 'frozen');
    near(m.freezeImmune, 2.5, 'and can be frozen again sooner');
  });
});

test('Shieldwall: Guarding gives a shield twice as strong; Resolute: resistance to fire, frost and lightning', () => {
  on(() => {
    const wall = room('warrior', ['shieldwall', 'resolute'], [[0, 'front', 'guarding']]);
    const bare = room('warrior', [], [[0, 'front', 'guarding']]);
    for (const w of [wall, bare]) (w.g as unknown as { boons(i: number): void }).boons(0);
    assert.ok(Math.abs(wall.g.hero.shield - bare.g.hero.shield * 2) <= 1, `${wall.g.hero.shield} against ${bare.g.hero.shield}`);
    const st = wall.g.hero.d.stats;
    const b = bare.g.hero.d.stats;
    assert.deepEqual([st.fireRes - b.fireRes, st.frostRes - b.frostRes, st.lightRes - b.lightRes], [15, 15, 15]);
  });
});
