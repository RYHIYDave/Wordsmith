// THE SKILL TREES REMADE (game/talents.ts TALENTS2, on with his yes of 17 Oct 2026, 19:42: "Everything looks good", to the
// page "The Skill Trees, Revised", docs/talents/trees_revised.html). Every talent that was a plain step now changes how you
// play; each test here holds one or two to what its new card says, by the rules in game/game.ts. Their numbers are
// TALENT_TUNE's (the `2` ones). The first trees' rules: tests/talents_rules.test.ts, with TALENTS2 held off.
//   run: tsx --test tests/talents2.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { SKILLS, TUNE } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Monster, Projectile, Trap, Volley, Zone } from '../src/game/state';
import { TALENTS, TALENTS2, TALENT_TUNE } from '../src/game/talents';
import type { ClassId, Element, MonsterKind, WordId } from '../src/game/types';
import { land } from './helpers';

const DT = 1 / 30;
const T = TALENT_TUNE;

interface Inside {
  rng: RNG;
  waveT: number;
  zones: Zone[];
  traps: Trap[];
  volleys: Volley[];
  projectiles: Projectile[];
  stillT: number;
  charge: number;
  spawn(kind: MonsterKind, x: number, y: number, pack: number, rank: 0 | 1 | 2, boss: boolean, rng: RNG): Monster;
  wakeUp(m: Monster): void;
  hitMonster(m: Monster, i: number, frac: number, quiet: boolean, sure?: boolean): void;
  damageMonster(m: Monster, dmg: number, el: Element, crit: boolean, skill: number): void;
  kill(m: Monster): void;
  boons(i: number): void;
  practice: boolean;
}

/** Both switches held on for the test, and as they were after. */
function on(fn: () => void): void {
  const was = [TALENTS.on, TALENTS2.on];
  TALENTS.on = true;
  TALENTS2.on = true;
  try {
    fn();
  } finally {
    [TALENTS.on, TALENTS2.on] = was;
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

/** A monster (dx, dy) from the hero: awake, standing still, never attacking, hard to kill. `asleep`: left asleep. */
function put(g: Game, a: Inside, kind: MonsterKind, dx: number, dy: number, rank: 0 | 1 | 2 = 0, asleep = false): Monster {
  const h = g.hero;
  const m = a.spawn(kind, h.x + dx, h.y + dy, 1, rank, false, a.rng);
  if (!asleep) a.wakeUp(m);
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

/** The bow's quick attack at (x, y), until an arrow is loosed: how many there are then. */
function shoot(g: Game, a: Inside, x: number, y: number): number {
  const before = a.projectiles.length;
  g.hero.swingT = 0;
  const c = emptyControls();
  c.fire = true;
  c.aimX = x;
  c.aimY = y;
  for (let n = 0; n < 15 && a.projectiles.length === before; n++) {
    g.update(DT, c);
    c.fire = false;
  }
  return a.projectiles.length;
}

/** A hero's arrow set flying from (x, y) along (dx, dy), as the bow's quick attack would loose it. */
function arrow(g: Game, a: Inside, x: number, y: number, dx: number, dy: number, more: Partial<Projectile> = {}): Projectile {
  const sp = SKILLS.shot.speed;
  const p: Projectile = {
    x, y, vx: dx * sp, vy: dy * sp, r: 0.25, dist: 11, hostile: false, dmg: 1, element: 'phys', look: 'arrow', pierce: false, hit: [], volley: false,
    skill: 0, trail: 0, words: [], runed: false, clouded: false, age: 0, from: '', n: 0, flown: 0, ...more,
  };
  a.projectiles.push(p);
  return p;
}

const of = <K extends GameEvent['t']>(seen: readonly GameEvent[], t: K): Extract<GameEvent, { t: K }>[] => seen.filter((e) => e.t === t) as Extract<GameEvent, { t: K }>[];
const hurt = (m: Monster): number => m.maxLife - m.life;

// ---- the warrior --------------------------------------------------------------------------------

test('Honed Edge: a critical hit makes the enemy bleed half the hit again over three seconds', () => {
  on(() => {
    const { g, a, seen } = room('warrior', ['honededge']);
    const m = put(g, a, 'skeleton', 1, 0);
    g.hero.d.critChance = 100;
    a.hitMonster(m, 0, 1, true);
    const blow = hurt(m);
    assert.ok(m.bleedT === T.honedEdge2.secs && (m.bleedDps ?? 0) > 0, 'bleeding');
    run(g, seen, 3.4);
    const bled = hurt(m) - blow;
    assert.ok(Math.abs(bled - blow * 0.5) <= 4, `bled ${bled} of a ${blow} hit`);
    // (not a critical: no bleeding)
    const n = put(g, a, 'skeleton', 1, 1);
    g.hero.d.critChance = 0;
    a.hitMonster(n, 0, 1, true);
    assert.ok(!n.bleedT);
  });
});

test('Sweeping Cut: every enemy in the arc of the swing is struck as hard, not only the first; none behind', () => {
  on(() => {
    const { g, a, seen } = room('warrior', ['sweepingcut']);
    g.hero.d.critChance = 0;
    const m = put(g, a, 'skeleton', 1.1, 0);
    const beside = put(g, a, 'skeleton', 1.1, 0.8);
    const behind = put(g, a, 'skeleton', -1.4, 0);
    swing(g, seen, m);
    assert.ok(hurt(m) > 0 && hurt(beside) > 0, `both struck: ${hurt(m)}, ${hurt(beside)}`);
    assert.ok(hurt(beside) > hurt(m) * 0.6, 'the one beside about as hard');
    assert.equal(hurt(behind), 0, 'not the one behind');
  });
});

test('Footwork: every kill makes Lunge ready again at once', () => {
  on(() => {
    const { g, a } = room('warrior', ['footwork']);
    const s = g.hero.skills[2];
    assert.equal(SKILLS[s.id].kind, 'leap');
    s.charges = 0;
    s.cd = s.r.cooldown;
    a.kill(put(g, a, 'skeleton', 1, 0));
    assert.equal(s.charges, 1);
    assert.equal(s.cd, 0);
  });
});

test('Drilled Lunge: Lunge strikes every enemy passed on the way, not only where it lands', () => {
  on(() => {
    const { g, a, seen } = room('warrior', ['drilledleap']);
    const passed = put(g, a, 'skeleton', 2.2, 0.3);
    const off = put(g, a, 'skeleton', 2.2, 3);
    evade(g, seen, 5.5, 0);
    assert.ok(hurt(passed) > 0, 'the one passed is struck');
    assert.equal(hurt(off), 0, 'not the one off the way');
    const plain = room('warrior', []);
    const p = put(plain.g, plain.a, 'skeleton', 2.2, 0.3);
    evade(plain.g, plain.seen, 5.5, 0);
    assert.equal(hurt(p), 0, 'without it, only where he lands');
  });
});

test('Giant Slayer: each hit on an elite or a boss cracks its guard, 3% more from everything, ten at most', () => {
  on(() => {
    const { g, a } = room('warrior', ['giantslayer']);
    const e = put(g, a, 'skeleton', 1, 0, 1);
    const plain = put(g, a, 'skeleton', 1, 1);
    assert.ok(e.elite);
    for (let k = 0; k < 3; k++) a.hitMonster(e, 0, 1, true);
    a.hitMonster(plain, 0, 1, true);
    assert.equal(e.cracks, 3);
    assert.ok(!plain.cracks, 'not a plain one');
    const life = e.life;
    a.damageMonster(e, 100, 'phys', false, -1);
    assert.equal(life - e.life, 109, 'three cracks: 9% more');
    for (let k = 0; k < 20; k++) a.hitMonster(e, 0, 1, true);
    assert.equal(e.cracks, T.giantSlayer2.most);
  });
});

test('Thick Skin: below half his life, 30% less harm; above it, as before', () => {
  on(() => {
    const { g } = room('warrior', ['thickskin']);
    const plain = room('warrior', []).g;
    for (const w of [g, plain]) w.hero.life = w.hero.d.maxLife;
    const full = [g, plain].map((w) => {
      const was = w.hero.life;
      w.hurtHero(100, 'phys', [], null);
      return was - w.hero.life;
    });
    assert.equal(full[0], full[1], 'above half, the same');
    const low = [g, plain].map((w) => {
      w.hero.life = w.hero.d.maxLife * 0.4;
      w.hero.invuln = 0;
      const was = w.hero.life;
      w.hurtHero(100, 'phys', [], null);
      return was - w.hero.life;
    });
    assert.ok(Math.abs(low[0] - low[1] * 0.7) <= 1, `below half: ${low[0]} against ${low[1]}`);
  });
});

test("Shieldwall: Guarding's shield breaking bursts outward, throwing back and stunning what is near", () => {
  on(() => {
    const { g, a, seen } = room('warrior', ['shieldwall'], [[0, 'front', 'guarding']]);
    a.boons(0);
    const shield = g.hero.shield;
    assert.ok(shield > 0, 'a shield');
    const plain = room('warrior', [], [[0, 'front', 'guarding']]);
    plain.a.boons(0);
    assert.equal(shield, plain.g.hero.shield, 'as strong as without it');
    const m = put(g, a, 'skeleton', 1.2, 0);
    const x0 = m.x;
    g.hurtHero(shield + 50, 'phys', [], null);
    assert.equal(g.hero.shield, 0);
    assert.ok(m.stunT > 0, 'stunned');
    run(g, seen, 0.4);
    assert.ok(m.x > x0 + 0.8, `thrown back: ${m.x - x0}`);
  });
});

test('Resolute: nothing slows him, freezes him or knocks him back', () => {
  on(() => {
    const { g, seen } = room('warrior', ['resolute']);
    const h = g.hero;
    g.knockHero(h.x - 1, h.y);
    assert.equal(h.step, null, 'no knock');
    g.hurtHero(10, 'frost', [], null);
    run(g, seen, DT);
    assert.equal(h.chillT, 0, 'no chill');
    const plain = room('warrior', []).g;
    plain.knockHero(plain.hero.x - 1, plain.hero.y);
    assert.notEqual(plain.hero.step, null);
  });
});

test('Second Wind: a flask throws back everything near, and nothing can hurt him for a second', () => {
  on(() => {
    const { g, a, seen } = room('warrior', ['secondwind']);
    const m = put(g, a, 'skeleton', 1.2, 0);
    const x0 = m.x;
    g.hero.life = 10;
    g.hero.potions = 1;
    g.usePotion();
    assert.ok(g.hero.invuln >= T.secondWind2.secs - 1e-6);
    const healed = g.hero.life;
    assert.ok(Math.abs(healed - Math.min(g.hero.d.maxLife, 10 + g.hero.d.maxLife * TUNE.potionHeal)) <= 1, 'a flask as before');
    g.hurtHero(100, 'phys', [], null);
    assert.equal(g.hero.life, healed, 'not hurt');
    run(g, seen, 0.4);
    assert.ok(m.x > x0 + 1, `thrown back: ${m.x - x0}`);
  });
});

test('Bulwark: 6% less a blow for each enemy close round him, up to 30%', () => {
  on(() => {
    const { g, a } = room('warrior', ['bulwark']);
    const plain = room('warrior', []).g;
    const took = (w: Game): number => {
      w.hero.life = w.hero.d.maxLife;
      w.hero.invuln = 0;
      const was = w.hero.life;
      w.hurtHero(200, 'phys', [], null);
      return was - w.hero.life;
    };
    const base = took(plain);
    assert.ok(Math.abs(took(g) - base) <= 1, 'alone: as before');
    for (let k = 0; k < 3; k++) put(g, a, 'skeleton', Math.cos(k * 2) * 1, Math.sin(k * 2) * 1);
    assert.ok(Math.abs(took(g) - base * 0.82) <= 1, 'three close: 18% less');
    for (let k = 3; k < 8; k++) put(g, a, 'skeleton', Math.cos(k * 0.8) * 1.1, Math.sin(k * 0.8) * 1.1);
    assert.ok(Math.abs(took(g) - base * 0.7) <= 1, 'eight close: 30% at most');
  });
});

test('Thorns: an enemy that strikes him up close is thrown back, and takes half the blow itself', () => {
  on(() => {
    const { g, a, seen } = room('warrior', ['thorns']);
    const m = put(g, a, 'skeleton', 1, 0);
    const x0 = m.x;
    g.hurtHero(100, 'phys', [], m);
    assert.equal(hurt(m), 50);
    run(g, seen, 0.4);
    assert.ok(m.x > x0 + 0.8, `thrown back: ${m.x - x0}`);
  });
});

// ---- the ranger ---------------------------------------------------------------------------------

test('Fleet: loosing an arrow no longer slows him', () => {
  on(() => {
    const went = (talents: string[]): number => {
      const { g, a } = room('ranger', talents);
      put(g, a, 'skeleton', 0, -6);
      g.hero.swingT = 0;
      const c = emptyControls();
      c.fire = true;
      c.aimX = g.hero.x;
      c.aimY = g.hero.y - 6;
      c.mx = 1;
      const x0 = g.hero.x;
      for (let k = 0; k < 6; k++) g.update(DT, c);
      return g.hero.x - x0;
    };
    const fleet = went(['fleet']);
    const plain = went([]);
    assert.ok(fleet > plain * 1.2, `${fleet} tiles against ${plain}`);
  });
});

test('Windrunner: every kill gives him back a roll', () => {
  on(() => {
    const { g, a } = room('ranger', ['windrunner']);
    const s = g.hero.skills[2];
    assert.equal(SKILLS[s.id].kind, 'roll');
    s.charges = 0;
    s.cd = s.r.cooldown;
    a.kill(put(g, a, 'skeleton', 1, 0));
    assert.equal(s.charges, 1);
    a.kill(put(g, a, 'skeleton', 1, 1));
    assert.equal(s.charges, Math.min(2, s.maxCharges));
  });
});

test('Keen Eye: the first arrow at an enemy that has not noticed him is a certain critical', () => {
  on(() => {
    const { g, a } = room('ranger', ['keeneye']);
    assert.equal(SKILLS[g.hero.skills[0].id].kind, 'projectile', 'a bow');
    g.hero.d.critChance = 0;
    const m = put(g, a, 'skeleton', 4, 0, 0, true);
    assert.equal(m.state, 'sleep');
    a.hitMonster(m, 0, 1, true);
    assert.ok(g.events.some((e) => e.t === 'hit' && e.crit), 'a critical');
    g.events.length = 0;
    a.hitMonster(m, 0, 1, true);
    assert.ok(!g.events.some((e) => e.t === 'hit' && e.crit), 'the next is not: it knows him now');
  });
});

test('Venom: a poisoned enemy that dies bursts in a cloud that poisons those near it', () => {
  on(() => {
    const { g, a, seen } = room('ranger', ['venom']);
    const m = put(g, a, 'skeleton', 2, 0);
    const by = put(g, a, 'skeleton', 2.8, 0.4);
    m.poisonT = 3;
    m.poisonDps = 40;
    m.poisonN = 1;
    a.kill(m);
    const cloud = a.zones.find((z) => z.kind === 'venom');
    assert.ok(cloud, 'a cloud');
    run(g, seen, 0.5);
    assert.ok(by.poisonT > 0, 'the one near it poisoned');
  });
});

test('Steady Aim: a second stood still, the next arrow goes through every enemy in its line', () => {
  on(() => {
    const { g, a, seen } = room('ranger', ['steadyaim']);
    put(g, a, 'skeleton', 6, 0);
    run(g, seen, 1.2);
    shoot(g, a, g.hero.x + 6, g.hero.y);
    assert.equal(a.projectiles[a.projectiles.length - 1].pierce, true, 'through everything');
    run(g, seen, 0.3);
    a.projectiles.length = 0;
    shoot(g, a, g.hero.x + 6, g.hero.y);
    assert.equal(a.projectiles[a.projectiles.length - 1].pierce, false, 'the next, not stood still again');
  });
});

test('Quick Draw: every fifth arrow fires twice', () => {
  on(() => {
    const { g, a, seen } = room('ranger', ['quickdraw']);
    put(g, a, 'skeleton', 0, -7);
    const loosed: number[] = [];
    for (let k = 0; k < 5; k++) {
      a.projectiles.length = 0;
      shoot(g, a, g.hero.x, g.hero.y - 7);
      run(g, seen, 0.15);
      loosed.push(a.projectiles.length + 0);
      run(g, seen, 0.5);
    }
    assert.deepEqual(loosed, [1, 1, 1, 1, 2]);
  });
});

test('Long Shot: an arrow knocks back what it hits', () => {
  on(() => {
    const { g, a, seen } = room('ranger', ['longshot']);
    const m = put(g, a, 'skeleton', 4, 0);
    const x0 = m.x;
    arrow(g, a, g.hero.x + 1, g.hero.y, 1, 0);
    run(g, seen, 0.6);
    assert.ok(hurt(m) > 0);
    assert.ok(m.x > x0 + 0.5, `knocked back: ${m.x - x0}`);
  });
});

test('Light Step: Trap holds three charges; the roll as far as before', () => {
  on(() => {
    const { g, seen } = room('ranger', ['lightstep']);
    const bare = room('ranger', []);
    assert.equal(g.hero.skills[2].maxCharges, 3);
    const x0 = g.hero.x;
    evade(g, seen, 6, 0);
    const bx0 = bare.g.hero.x;
    evade(bare.g, bare.seen, 6, 0);
    assert.ok(Math.abs(g.hero.x - x0 - (bare.g.hero.x - bx0)) < 0.05, 'as far');
  });
});

test('Wide Traps: a trap pulls the enemies near it in before it bursts', () => {
  on(() => {
    const { g, a, seen } = room('ranger', ['widetraps']);
    evade(g, seen, 3, 0);
    const t = a.traps[0];
    assert.ok(t, 'a trap');
    t.arm = 0;
    const away = put(g, a, 'skeleton', t.x + 3.2 - g.hero.x, t.y - g.hero.y);
    const d0 = Math.hypot(away.x - t.x, away.y - t.y);
    put(g, a, 'skeleton', t.x - g.hero.x, t.y + 0.3 - g.hero.y);
    run(g, seen, 0.5);
    const d1 = Math.hypot(away.x - t.x, away.y - t.y);
    assert.ok(d1 < d0 - 1.5, `pulled in: ${d0.toFixed(2)} to ${d1.toFixed(2)}`);
    assert.ok(hurt(away) > 0, 'and caught in the burst');
  });
});

test('Split Shot: an arrow that kills splits into three, and they fly on', () => {
  on(() => {
    const { g, a, seen } = room('ranger', ['splitshot']);
    const m = put(g, a, 'skeleton', 3, 0);
    m.life = 1;
    arrow(g, a, g.hero.x + 1, g.hero.y, 1, 0);
    run(g, seen, 0.2);
    assert.ok(m.dead);
    const split = a.projectiles.filter((p) => p.split);
    assert.equal(split.length, T.splitShot2.n);
    // (a plain arrow that hits and does not kill: no split)
    const n = put(g, a, 'skeleton', 3, 2);
    a.projectiles.length = 0;
    arrow(g, a, g.hero.x + 1, g.hero.y + 2, 1, 0);
    run(g, seen, 0.2);
    assert.ok(hurt(n) > 0 && !a.projectiles.some((p) => p.split));
  });
});

test('Hail: Volley follows the enemy it was aimed at', () => {
  on(() => {
    const { g, a, seen } = room('ranger', ['hail']);
    const m = put(g, a, 'skeleton', 5, 0);
    const c = emptyControls();
    c.cast = true;
    c.castX = m.x;
    c.castY = m.y;
    for (let n = 0; n < 30 && a.volleys.length === 0; n++) {
      g.update(DT, c);
      c.cast = false;
    }
    const v = a.volleys[0];
    assert.equal(v.follow, m.id);
    m.y -= 2.5;
    const y0 = v.y;
    run(g, seen, 0.5);
    assert.ok(v.y < y0 - 1, `the rain moved after it: ${y0 - v.y}`);
    run(g, seen, 2);
    assert.ok(hurt(m) > 0, 'and hit it where it went');
  });
});

test('Ricochet: an arrow that hits a wall bounces off it and flies on', () => {
  on(() => {
    const { g, a, seen } = room('ranger', ['piercing']);
    const h = g.hero;
    let x = h.x;
    while (g.isOpen(x + 0.25, h.y)) x += 0.25;
    const p = arrow(g, a, x - 1.5, h.y, 1, 0);
    run(g, seen, 0.3);
    assert.ok(a.projectiles.includes(p), 'still flying');
    assert.equal(p.bounced, true);
    assert.ok(p.vx < 0, 'back the other way');
    // (once only: the next wall ends it)
    const plain = room('ranger', []);
    const q = arrow(plain.g, plain.a, x - 1.5, h.y, 1, 0);
    run(plain.g, plain.seen, 0.3);
    assert.ok(!plain.a.projectiles.includes(q), 'without it, the wall ends the arrow');
  });
});

test('Far Sight: an arrow that has flown past eight tiles is a certain critical', () => {
  on(() => {
    const { g, a, seen } = room('ranger', ['farsight']);
    g.hero.d.critChance = 0;
    put(g, a, 'skeleton', 3, 0);
    arrow(g, a, g.hero.x + 2, g.hero.y, 1, 0, { flown: 8.5 });
    run(g, seen, 0.2);
    assert.ok(of(seen, 'hit').some((e) => !e.onHero && e.crit), 'a critical');
    const near = room('ranger', ['farsight']);
    near.g.hero.d.critChance = 0;
    put(near.g, near.a, 'skeleton', 3, 0);
    arrow(near.g, near.a, near.g.hero.x + 2, near.g.hero.y, 1, 0, { flown: 2 });
    run(near.g, near.seen, 0.2);
    assert.ok(!of(near.seen, 'hit').some((e) => !e.onHero && e.crit), 'short of eight, not');
  });
});

// ---- the mage -----------------------------------------------------------------------------------

test('Kindling: his fire leaves the ground burning two seconds where it hits, and what stands in it burns', () => {
  on(() => {
    const { g, a, seen } = room('mage', ['kindling'], [[0, 'front', 'fire']]);
    assert.equal(g.hero.skills[0].r.element, 'fire');
    const m = put(g, a, 'skeleton', 2, 0);
    a.hitMonster(m, 0, 1, true);
    a.hitMonster(m, 0, 1, true);
    const patches = a.zones.filter((z) => z.from === 'kindling');
    assert.equal(patches.length, 1, 'one patch where it hit (not one on another)');
    assert.equal(patches[0].dur, T.kindling2.secs);
    const by = put(g, a, 'skeleton', 2, 0.3);
    run(g, seen, 0.7);
    assert.ok(by.burnT > 0, 'what stands in it burns');
    run(g, seen, 2);
    assert.equal(a.zones.filter((z) => z.from === 'kindling').length, 0, 'gone after two seconds');
    // (not his frost)
    const frost = room('mage', ['kindling'], [[0, 'front', 'frost']]);
    frost.a.hitMonster(put(frost.g, frost.a, 'skeleton', 2, 0), 0, 1, true);
    assert.equal(frost.a.zones.filter((z) => z.from === 'kindling').length, 0);
  });
});

test('Searing: fire spreads, a burning enemy setting alight any enemy it touches', () => {
  on(() => {
    const { g, a, seen } = room('mage', ['searing']);
    const m = put(g, a, 'skeleton', 3, 0);
    const touching = put(g, a, 'skeleton', 3 + m.r * 2, 0);
    const apart = put(g, a, 'skeleton', 3, 3);
    m.burnT = 3;
    m.burnDps = 20;
    run(g, seen, 0.6);
    assert.ok(touching.burnT > 0, 'the one it touches');
    assert.equal(apart.burnT, 0, 'not one apart');
  });
});

test('Hearth: standing in fire he made, nothing burns him and his mana comes back three times as fast', () => {
  on(() => {
    const { g, a, seen } = room('mage', ['fuel']);
    const plain = room('mage', []);
    for (const w of [{ g, a }, plain]) {
      // (the practice room's own quick mana, off)
      w.a.practice = false;
      w.a.zones.push({ x: w.g.hero.x, y: w.g.hero.y, r: 1, t: 0, dur: 9, kind: 'burn', element: 'fire', dmg: 1, slow: 0, tick: 9, hostile: false, skill: -1, words: [], from: '' });
      w.g.hero.mana = 0;
      w.g.hero.burnT = 3;
      w.g.hero.burnDps = 10;
    }
    // (a short while: well short of a full well of mana either way)
    run(g, seen, 0.1);
    run(plain.g, plain.seen, 0.1);
    assert.ok(g.hero.mana < g.hero.d.maxMana * 0.9, 'not full');
    assert.equal(g.hero.burnT, 0, 'not burning');
    assert.ok(plain.g.hero.burnT > 0);
    assert.ok(Math.abs(g.hero.mana - plain.g.hero.mana * T.hearth.mana) < 0.5, `${g.hero.mana} against ${plain.g.hero.mana}`);
  });
});

test('Charged: moving gathers a charge, sparks round him; his next hit lets it go, a bolt leaping between up to five', () => {
  on(() => {
    const { g, a, seen } = room('mage', ['charged']);
    const c = emptyControls();
    c.mx = 1;
    run(g, seen, 0.4, c);
    assert.ok(a.charge > 0 && a.charge < 1, `gathering: ${a.charge}`);
    a.charge = 1;
    run(g, seen, 0.5);
    assert.ok(of(seen, 'spark').some((e) => e.el === 'lightning'), 'sparks round him');
    const first = put(g, a, 'skeleton', 2, 0);
    const rest = [put(g, a, 'skeleton', 3.5, 0), put(g, a, 'skeleton', 5, 0), put(g, a, 'skeleton', 6.5, 0), put(g, a, 'skeleton', 8, 0), put(g, a, 'skeleton', 9.5, 0)];
    a.hitMonster(first, 0, 1, false);
    assert.equal(a.charge, 0, 'let go');
    assert.equal(rest.filter((m) => hurt(m) > 0).length, 4, 'five in all, the one struck and four more');
    assert.equal(hurt(rest[4]), 0);
  });
});

test('Overload: a shocked enemy that dies passes its shock on to the three nearest', () => {
  on(() => {
    const { g, a } = room('mage', ['overload']);
    const m = put(g, a, 'skeleton', 3, 0);
    const near = [put(g, a, 'skeleton', 4, 0), put(g, a, 'skeleton', 3, 1), put(g, a, 'skeleton', 2.2, -0.8)];
    const fourth = put(g, a, 'skeleton', 3, -2.6);
    m.shockT = 1;
    a.kill(m);
    for (const o of near) assert.ok(o.shockT > 0 && hurt(o) > 0, 'shocked and jolted');
    assert.equal(fourth.shockT, 0);
    // (not shocked: nothing passes)
    const n = put(g, a, 'skeleton', 3, 4);
    const by = put(g, a, 'skeleton', 3.8, 4);
    a.kill(n);
    assert.equal(hurt(by), 0);
  });
});

test('Bitter Cold: any enemy that strikes him is chilled to half its speed for two seconds', () => {
  on(() => {
    const { g, a } = room('mage', ['bittercold']);
    const m = put(g, a, 'skeleton', 1, 0);
    g.hurtHero(10, 'phys', [], m);
    assert.equal(m.chill, T.bitterCold2.slow);
    assert.equal(m.chillT, T.bitterCold2.secs);
    assert.equal(m.frozenT, 0, 'chilled, not frozen');
  });
});

test('Deep Freeze: a frozen enemy struck slides across the floor, freezing what it slides into', () => {
  on(() => {
    const { g, a, seen } = room('mage', ['deepfreeze']);
    const m = put(g, a, 'skeleton', 1.5, 0);
    const inWay = put(g, a, 'skeleton', 3.5, 0);
    m.frozenT = 2;
    const x0 = m.x;
    a.hitMonster(m, 0, 1, true);
    run(g, seen, 0.5);
    assert.ok(m.x > x0 + 1, `slid: ${m.x - x0}`);
    assert.ok(inWay.frozenT > 0, 'what it slid into is frozen');
    // (not frozen: it stays)
    const n = put(g, a, 'skeleton', -1.5, 2);
    const nx = n.x;
    a.hitMonster(n, 0, 1, true);
    run(g, seen, 0.3);
    assert.ok(Math.abs(n.x - nx) < 0.05);
  });
});

test("Rime: one dying on Frost's ice shatters the patch, freezing every enemy on it", () => {
  on(() => {
    const { g, a } = room('mage', ['rime']);
    const at = { x: g.hero.x + 3, y: g.hero.y };
    a.zones.push({ x: at.x, y: at.y, r: 1.6, t: 0, dur: 5, kind: 'ice', element: 'frost', dmg: 1, slow: 0.3, tick: 9, hostile: false, skill: 0, words: [], from: '' });
    const m = put(g, a, 'skeleton', 3, 0);
    const on1 = put(g, a, 'skeleton', 3.8, 0.6);
    const off = put(g, a, 'skeleton', 3, 3);
    a.kill(m);
    assert.equal(a.zones.filter((z) => z.kind === 'ice').length, 0, 'the patch shattered');
    assert.ok(on1.frozenT > 0, 'the one on it frozen');
    assert.equal(off.frozenT, 0);
  });
});
