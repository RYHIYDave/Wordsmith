// THE FOUR NEW WORDS AT WORK (Version 19.3): Heavy, Precise, Frenzied and Guarding, as his doc
// "Wordsmith: The New Words" has them (his yes of 8 Oct 2026, 16:53: "Yes, as it is (Recommended)").
// Their numbers are its starting points (src/game/defs.ts: HEAVY, PRECISE, FRENZY, GUARD); their
// rules are in src/game/game.ts; their looks, the art chat's (src/render/words3.ts), are called up
// by what the rules say happened (events3). These tests hold:
//   - Heavy: slower and harder; the stun (a monster 0.8 s, an elite half, a boss never), which
//     breaks off an attack being wound up and takes away its warning; gear's chance to stun, to a
//     cap; cracked ground that staggers what walks onto it, and not again for a while;
//   - Precise: more damage in a smaller area; the mark, and the certain critical that spends it;
//   - Frenzied: stacks to five that make attacks and cooldowns faster and fade; kills that feed it;
//   - Guarding: the shield that takes blows first; the ward circle; gear's chance to block, to a cap;
//   - the four on monsters: knocked back, armour pierced, faster as it is hurt, a shield of its own;
//   - their looks, called up by the rules' events, and nothing called up with the switch off.
//   run: tsx --test tests/new_words.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { FRENZY, GUARD, HEAVY, PRECISE } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Monster, Zone } from '../src/game/state';
import { armorReduction } from '../src/game/stats';
import type { ClassId, Element, MonsterKind, WordId } from '../src/game/types';
import { Fx } from '../src/render/fx';
import { W3, WORDS3, clear3, events3 } from '../src/render/words3';
import { land } from './helpers';

const DT = 1 / 30;
const near = (a: number, b: number, what: string, tol = 1e-9): void => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${what}: ${a} is not ${b}`);

/** What the tests reach inside the rules for. */
interface Inside {
  rng: RNG;
  waveT: number;
  depth: number;
  dungeonWords: WordId[];
  zones: Zone[];
  spawn(kind: MonsterKind, x: number, y: number, pack: number, rank: 0 | 1 | 2, boss: boolean, rng: RNG): Monster;
  wakeUp(m: Monster): void;
  hitMonster(m: Monster, i: number, frac: number, quiet: boolean): void;
  damageMonster(m: Monster, dmg: number, el: Element, crit: boolean, skill: number): void;
  stunMonster(m: Monster, secs: number): void;
  addPatch(i: number, kind: 'cracks' | 'ward', x: number, y: number, rad: number, dur: number, share: number): void;
}

/** The practice room, emptied, with the hero at (14.5, 15.5) facing +x and these words set. */
function room(cls: ClassId, words: readonly [number, 'front' | 'behind', WordId][] = [], seed = 5): { g: Game; a: Inside; seen: GameEvent[] } {
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
  g.events.length = 0;
  return { g, a, seen: [] };
}

/** A monster (dx, dy) from the hero, awake, standing still and holding its blows, with life enough. */
function put(g: Game, a: Inside, kind: MonsterKind, dx: number, dy: number, rank: 0 | 1 | 2 = 0, boss = false): Monster {
  const h = g.hero;
  const m = a.spawn(kind, h.x + dx, h.y + dy, 1, rank, boss, a.rng);
  a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = 1e6;
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

/** The hero's quick attack at monster `m`, by the rules, to where it lands. */
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

/** (read afresh: the rules change it between steps) */
const stateOf = (m: Monster): string => m.state;

const of = <T extends GameEvent['t']>(seen: readonly GameEvent[], t: T): Extract<GameEvent, { t: T }>[] => seen.filter((e) => e.t === t) as Extract<GameEvent, { t: T }>[];

// ---------------------------------------------------------------------------------------------
// HEAVY

test('Heavy in front: slower to use and much harder, and what it hits is stunned for 0.8 s', () => {
  const { g, a, seen } = room('warrior', [[0, 'front', 'heavy']]);
  const bare = room('warrior').g.hero.skills[0].r;
  const r = g.hero.skills[0].r;
  assert.ok(r.dmgMult > bare.dmgMult * 1.5, `much harder: ${r.dmgMult} against ${bare.dmgMult}`);
  near(r.rate, bare.rate / HEAVY.slower, 'a quick attack 20% slower');
  assert.equal(r.stun, HEAVY.stun);
  const m = put(g, a, 'skeleton', 1.1, 0);
  swing(g, seen, m);
  const stuns = of(seen, 'stun');
  assert.equal(stuns.length, 1, 'one stun');
  assert.deepEqual([stuns[0].id, stuns[0].secs], [m.id, HEAVY.stun]);
  assert.ok(m.stunT > HEAVY.stun - 2 * DT && m.stunT <= HEAVY.stun, `stunned for 0.8 s (${m.stunT})`);
  assert.ok(of(seen, 'heavy').length === 1 && !of(seen, 'heavy')[0].big, 'the blow lands with its weight (its look)');
  // stunned, it neither moves nor strikes, even let go and in reach
  m.speed = 3;
  m.cd = 0;
  m.state = 'chase';
  const at = [m.x, m.y];
  const life = g.hero.life;
  run(g, seen, 0.6);
  assert.deepEqual([m.x, m.y], at, 'it has not moved');
  assert.equal(m.state, 'chase');
  assert.equal(g.hero.life, life, 'nor struck');
  // and once it is over, it does
  run(g, seen, 0.5);
  assert.equal(m.stunT, 0);
  assert.ok(stateOf(m) === 'windup' || stateOf(m) === 'recover' || g.hero.life < life, 'it comes back to the fight');
});

test('a stun: an elite for half as long, a boss never; a longer one is not cut short by a shorter', () => {
  const { g, a, seen } = room('warrior');
  const plain = put(g, a, 'skeleton', 1.1, 0);
  const elite = put(g, a, 'skeleton', 1.1, 1.2, 1);
  const guardian = put(g, a, 'skeleton', 1.1, -1.2, 2);
  const boss = put(g, a, 'skeleton', -1.5, 0, 0, true);
  for (const m of [plain, elite, guardian, boss]) a.stunMonster(m, HEAVY.stun);
  assert.equal(plain.stunT, HEAVY.stun);
  assert.equal(elite.stunT, HEAVY.stun / 2);
  assert.equal(guardian.stunT, HEAVY.stun / 2, 'a guardian is an elite');
  assert.equal(boss.stunT, 0, 'a boss is never stunned');
  a.stunMonster(plain, 0.3);
  assert.equal(plain.stunT, HEAVY.stun);
  seen.push(...g.events);
  assert.equal(of(seen, 'stun').length, 3);
});

test('a stun breaks off the blow a monster is winding up, and the warning of it goes too', () => {
  const { g, a, seen } = room('warrior');
  const m = put(g, a, 'brute', 1.5, 0);
  m.cd = 0;
  m.state = 'chase';
  // (the brute brings its club down on the ground: a warning comes first)
  for (let t = 0; t < 1 && stateOf(m) !== 'windup'; t += DT) run(g, seen, DT);
  assert.equal(stateOf(m), 'windup');
  assert.equal(a.zones.filter((z) => z.kind === 'warn' && z.src === m.id).length, 1, 'its warning lies on the floor');
  const life = g.hero.life;
  a.stunMonster(m, HEAVY.stun);
  assert.equal(m.state, 'chase');
  assert.equal(a.zones.filter((z) => z.kind === 'warn').length, 0, 'the warning is gone');
  m.cd = 1e9;
  run(g, seen, 1.5);
  assert.equal(g.hero.life, life, 'and the blow never falls');
});

test("gear's chance to stun (Heavy burned in): on any hit, and never more than half the time", () => {
  const { g, a } = room('warrior');
  const m = put(g, a, 'skeleton', 1.1, 0);
  const st = g.hero.d.stats;
  let n = 0;
  for (let k = 0; k < 600; k++) {
    m.stunT = 0;
    a.hitMonster(m, 0, 1, false);
    if (m.stunT > 0) n++;
  }
  assert.equal(n, 0, 'none without it');
  st.stunChance = 100;
  for (let k = 0; k < 600; k++) {
    m.stunT = 0;
    a.hitMonster(m, 0, 1, false);
    if (m.stunT > 0) n++;
  }
  assert.ok(n > 600 * 0.42 && n < 600 * 0.58, `capped at ${HEAVY.stunCap}%: ${n} of 600`);
  assert.equal(HEAVY.stunCap, 50);
});

test('Heavy behind: cracked ground where it lands, for 4 seconds, and laid again it lasts again rather than piling up', () => {
  const { g, a, seen } = room('warrior', [[0, 'behind', 'heavy']]);
  const m = put(g, a, 'skeleton', 1.1, 0);
  swing(g, seen, m);
  const cracks = a.zones.filter((z) => z.kind === 'cracks');
  assert.equal(cracks.length, 1);
  assert.ok(Math.hypot(cracks[0].x - m.x, cracks[0].y - m.y) < 0.01 && cracks[0].dur === HEAVY.cracks && cracks[0].r >= 1, 'under what it struck');
  const told = of(seen, 'zone').filter((e) => e.kind === 'cracks');
  assert.ok(told.length === 1 && told[0].dur === HEAVY.cracks, 'its look is told how long it lasts');
  run(g, seen, 1.5);
  swing(g, seen, m);
  assert.equal(a.zones.filter((z) => z.kind === 'cracks').length, 1, 'one patch, not two');
  assert.ok(a.zones.filter((z) => z.kind === 'cracks')[0].t < 0.5, 'and it has its time again');
  run(g, seen, HEAVY.cracks + 0.2);
  assert.equal(a.zones.filter((z) => z.kind === 'cracks').length, 0, 'gone when its time is up');
});

test('cracked ground staggers what walks onto it: its attack broken off, and not again for a while; bats fly over it, bosses stand firm', () => {
  const { g, a, seen } = room('warrior');
  const h = g.hero;
  const walker = put(g, a, 'skeleton', 3.2, 0);
  const bat = put(g, a, 'bat', 3.2, 0.4);
  const boss = put(g, a, 'skeleton', 3.2, -0.5, 0, true);
  a.addPatch(0, 'cracks', h.x + 3.2, h.y, 1.0, HEAVY.cracks, 0);
  // (the walker is winding up a blow as it stands there)
  walker.state = 'windup';
  walker.t = 5;
  run(g, seen, DT);
  const st = of(seen, 'stagger');
  assert.deepEqual(st.map((e) => e.id), [walker.id], 'the walker is staggered; the bat and the boss are not');
  assert.equal(walker.state, 'chase', 'its attack is broken off');
  assert.ok(walker.staggerT > 0 && walker.staggerT <= HEAVY.stagger);
  assert.equal(bat.staggerT + boss.staggerT, 0);
  // reeling, it does nothing; standing on, it is staggered again only once its wait is over
  walker.speed = 0;
  run(g, seen, HEAVY.stagger + HEAVY.staggerAgain - 0.2);
  assert.equal(of(seen, 'stagger').length, 1, 'not again too soon');
  run(g, seen, 0.4);
  assert.equal(of(seen, 'stagger').length, 2, 'again, once the wait is over');
});

// ---------------------------------------------------------------------------------------------
// PRECISE

test('Precise in front: more damage, a smaller area', () => {
  const r = room('warrior', [[1, 'front', 'precise']]).g.hero.skills[1].r;
  const bare = room('warrior').g.hero.skills[1].r;
  assert.ok(r.dmgMult > bare.dmgMult * 1.3, `more damage (${r.dmgMult} against ${bare.dmgMult})`);
  near(r.size, bare.size * PRECISE.area, '30% smaller');
  assert.equal(r.precise, true);
});

test('Precise behind: the first enemy a use hits is marked for 5 s, and the next hit on it is a certain critical', () => {
  const { g, a, seen } = room('warrior', [[0, 'behind', 'precise']]);
  g.hero.d.critChance = 0;
  const m = put(g, a, 'skeleton', 1.1, 0);
  swing(g, seen, m);
  assert.equal(of(seen, 'markOn').length, 1);
  assert.ok(m.markT > PRECISE.markTime - 2 * DT, `marked for 5 s (${m.markT})`);
  assert.ok(!of(seen, 'hit').some((e) => !e.onHero && e.crit), 'no critical without a chance of one');
  run(g, seen, 1);
  seen.length = 0;
  swing(g, seen, m);
  const hits = of(seen, 'hit').filter((e) => !e.onHero);
  assert.ok(hits.length === 1 && hits[0].crit, 'a certain critical');
  assert.equal(of(seen, 'markSpent').length, 1);
  assert.equal(m.markT, 0, 'the mark is spent');
  assert.equal(of(seen, 'markOn').length, 0, 'and the blow that spent it marks nothing');
  // the next use marks it again, and a mark not used runs out
  run(g, seen, 1);
  swing(g, seen, m);
  assert.equal(of(seen, 'markOn').length, 1);
  run(g, seen, PRECISE.markTime + 0.1);
  assert.ok(m.markT <= 0, 'run out');
  seen.length = 0;
  swing(g, seen, m);
  assert.ok(!of(seen, 'hit').some((e) => !e.onHero && e.crit), 'and the next hit is as any other');
});

test('Precise behind marks one enemy a use, however many it hits', () => {
  const { g, a, seen } = room('warrior', [[1, 'behind', 'precise']]);
  for (const [dx, dy] of [[1.4, 0], [1.9, 0.5], [1.9, -0.5]] as const) put(g, a, 'skeleton', dx, dy);
  const c = emptyControls();
  c.cast = true;
  c.castX = g.hero.x + 1.4;
  c.castY = g.hero.y;
  g.update(DT, c);
  seen.push(...g.events);
  g.events.length = 0;
  c.cast = false;
  run(g, seen, 1.2, c);
  assert.ok(of(seen, 'hit').filter((e) => !e.onHero).length >= 3, 'it hit them all');
  assert.equal(of(seen, 'markOn').length, 1);
  assert.equal(g.monsters.filter((m) => m.markT > 0).length, 1);
});

test('a monster with Precise: its blows ignore half the hero\'s armour', () => {
  const { g } = room('warrior');
  const h = g.hero;
  h.d.armor = 300;
  const depth = Math.max(1, (g as unknown as Inside).depth);
  const blow = (words: WordId[]): number => {
    const life = (h.life = h.d.maxLife);
    g.hurtHero(100, 'phys', words, null, 'a test');
    return life - h.life;
  };
  assert.equal(blow([]), Math.max(1, Math.round(100 * (1 - armorReduction(300, depth)))));
  assert.equal(blow(['precise']), Math.max(1, Math.round(100 * (1 - armorReduction(300 * (1 - PRECISE.armourIgnored), depth)))));
  assert.ok(blow(['precise']) > blow([]));
  // (armour is against blows, not fire)
  h.d.resFire = 0;
  const fire = (words: WordId[]): number => {
    const life = (h.life = h.d.maxLife);
    g.hurtHero(100, 'fire', words, null, 'a test');
    return life - h.life;
  };
  assert.equal(fire(['precise']), fire([]));
});

// ---------------------------------------------------------------------------------------------
// FRENZIED

test('Frenzied in front: each use a stack, up to five, held three seconds after the last', () => {
  const { g, a, seen } = room('warrior', [[0, 'front', 'frenzied']]);
  const h = g.hero;
  const m = put(g, a, 'skeleton', 1.1, 0);
  for (let k = 1; k <= 7; k++) {
    swing(g, seen, m);
    assert.equal(h.frenzy, Math.min(FRENZY.max, k), `after ${k} uses`);
    assert.ok(h.frenzyT > FRENZY.hold - 0.5, 'held for its time');
    run(g, seen, 0.5);
  }
  assert.deepEqual(of(seen, 'frenzy').map((e) => e.n), [1, 2, 3, 4, 5, 5, 5], 'its look is told of each');
  run(g, seen, FRENZY.hold - 0.5 - 0.1);
  assert.equal(h.frenzy, FRENZY.max, 'still held');
  run(g, seen, 0.3);
  assert.deepEqual([h.frenzy, h.frenzyT], [0, 0], 'and then it fades, all at once');
});

test('the frenzy makes the quick attack faster and every cooldown come round faster: 8% a stack', () => {
  const { g, a, seen } = room('warrior');
  const h = g.hero;
  const m = put(g, a, 'skeleton', 1.1, 0);
  swing(g, seen, m);
  const calm = 1 / h.skills[0].r.rate;
  assert.ok(Math.abs(h.swingT + DT * 2 - calm) < DT * 3, 'without a frenzy, the time between blows is the weapon\'s');
  run(g, seen, 1);
  h.frenzy = 5;
  h.frenzyT = 9;
  swing(g, seen, m);
  near(1 / (h.skills[0].r.rate * g.frenzyPace()), calm / (1 + 5 * FRENZY.each), 'five stacks: 40% faster');
  near(g.frenzyPace(), 1.4, 'the pace', 1e-12);
  // a cooldown
  const s = h.skills[1];
  s.charges = 0;
  s.cd = 3;
  h.frenzyT = 9;
  run(g, seen, 1);
  near(s.cd, 3 - 1 * 1.4, 'the slow attack comes round 40% faster', 1e-6);
});

test('Frenzied behind: a kill by it adds a stack and holds the frenzy three seconds more, to nine at most', () => {
  const { g, a, seen } = room('warrior', [[0, 'behind', 'frenzied']]);
  const h = g.hero;
  for (let k = 1; k <= 5; k++) {
    const m = put(g, a, 'skeleton', 1.1, 0);
    m.life = 1;
    swing(g, seen, m);
    assert.ok(m.dead, 'killed');
    assert.equal(h.frenzy, Math.min(FRENZY.max, k));
    assert.ok(h.frenzyT <= FRENZY.hold * 3 + 1e-9, 'held no more than nine seconds');
  }
  assert.equal(of(seen, 'frenzyFed').length, 5, 'its look is told of each');
  assert.ok(h.frenzyT > FRENZY.hold * 3 - 0.5, `kills stack the time (${h.frenzyT})`);
  // a kill by an ability without it feeds nothing
  const { g: g2, a: a2, seen: s2 } = room('warrior', [[1, 'behind', 'frenzied']]);
  const m2 = put(g2, a2, 'skeleton', 1.1, 0);
  m2.life = 1;
  swing(g2, s2, m2);
  assert.ok(m2.dead && g2.hero.frenzy === 0 && of(s2, 'frenzyFed').length === 0);
});

test('a monster with Frenzied speeds up as it is hurt: half as fast again near death', () => {
  const { g, a, seen } = room('warrior');
  const fresh = put(g, a, 'skeleton', 4, 2);
  const hurt = put(g, a, 'skeleton', 4, -2);
  const dying = put(g, a, 'skeleton', -4, 2);
  for (const m of [fresh, hurt, dying]) {
    m.words.push('frenzied');
    m.cd = 1;
    m.state = 'chase';
  }
  hurt.life = hurt.maxLife / 2;
  dying.life = 1;
  run(g, seen, DT);
  near(1 - fresh.cd, DT, 'unhurt, as ever', 1e-9);
  near(1 - hurt.cd, DT * (1 + FRENZY.monster / 2), 'at half its life, a quarter faster', 1e-9);
  near(1 - dying.cd, DT * (1 + FRENZY.monster * (1 - 1 / dying.maxLife)), 'near death, half as fast again', 1e-9);
});

// ---------------------------------------------------------------------------------------------
// GUARDING

test('Guarding in front: each use a shield of a tenth of life or more, for 3 s, that takes blows before life does', () => {
  const { g, a, seen } = room('warrior', [[0, 'front', 'guarding']]);
  const h = g.hero;
  const m = put(g, a, 'skeleton', 1.1, 0);
  const r = h.skills[0].r;
  assert.ok(r.shield >= GUARD.shield && r.shield <= 0.2);
  swing(g, seen, m);
  const full = Math.round(h.d.maxLife * r.shield);
  assert.equal(h.shield, full);
  assert.ok(h.shieldT > GUARD.shieldTime - 0.5);
  assert.deepEqual(of(seen, 'shield').map((e) => e.secs), [GUARD.shieldTime], 'its look is told');
  h.d.armor = 0;
  const life = h.life;
  g.hurtHero(full - 4, 'phys', [], m);
  assert.equal(h.life, life, 'a blow smaller than the shield does not reach life');
  assert.equal(h.shield, 4);
  g.hurtHero(10, 'phys', [], m);
  assert.equal(h.life, life - 6, 'a bigger one: what the shield could not take');
  assert.deepEqual([h.shield, h.shieldT], [0, 0], 'and the shield is gone');
  seen.push(...g.events);
  assert.equal(of(seen, 'guarded').length, 2, 'its look is told of both');
  // given again, a shield fades when its time is up
  swing(g, seen, m);
  run(g, seen, GUARD.shieldTime + 0.1);
  assert.deepEqual([h.shield, h.shieldT], [0, 0]);
});

test('Guarding behind: a ward circle where it lands, for 4 s; inside it the hero takes less harm, outside as ever', () => {
  const { g, a, seen } = room('warrior', [[0, 'behind', 'guarding']]);
  const h = g.hero;
  const m = put(g, a, 'skeleton', 1.1, 0);
  swing(g, seen, m);
  const wards = a.zones.filter((z) => z.kind === 'ward');
  assert.equal(wards.length, 1);
  const share = h.skills[0].r.ward;
  assert.ok(share >= GUARD.ward && share <= 0.5);
  assert.ok(wards[0].dur === GUARD.wardTime && wards[0].dmg === share && wards[0].r >= 1.5);
  h.d.armor = 0;
  const blow = (): number => {
    const life = (h.life = h.d.maxLife);
    g.hurtHero(100, 'phys', [], m);
    return life - h.life;
  };
  assert.ok(Math.hypot(h.x - wards[0].x, h.y - wards[0].y) <= wards[0].r, 'the hero stands in it');
  assert.equal(blow(), Math.round(100 * (1 - share)));
  h.x -= 3;
  assert.equal(blow(), 100, 'outside it, as ever');
  h.x += 3;
  run(g, seen, GUARD.wardTime + 0.1);
  assert.equal(a.zones.filter((z) => z.kind === 'ward').length, 0, 'gone when its time is up');
  assert.equal(blow(), 100);
});

test("gear's chance to block (Guarding burned in): a blocked blow does nothing at all; never more than half", () => {
  const { g } = room('warrior');
  const h = g.hero;
  h.d.stats.blockChance = 100;
  let blocked = 0;
  for (let k = 0; k < 600; k++) {
    const life = (h.life = h.d.maxLife);
    h.invuln = 0;
    g.hurtHero(10, 'phys', ['poison'], null, 'a test');
    if (h.life === life) {
      blocked++;
      assert.equal(h.poisonT, 0, 'nothing at all');
    }
    h.poisonT = 0;
  }
  assert.ok(blocked > 600 * 0.42 && blocked < 600 * 0.58, `capped at ${GUARD.blockCap}%: ${blocked} of 600`);
  const told = g.events.filter((e) => e.t === 'blocked').length;
  assert.equal(told, blocked, 'its look is told of each');
  assert.ok(g.events.some((e) => e.t === 'text' && e.text === 'Blocked'), 'and it says so');
});

test('a monster with Guarding carries a shield of a fifth of its life, which takes harm before its life does', () => {
  const { g, a } = room('warrior');
  a.dungeonWords = ['guarding'];
  const h = g.hero;
  const m = a.spawn('skeleton', h.x + 2, h.y, 1, 0, false, a.rng);
  assert.ok(m.words.includes('guarding'));
  assert.equal(m.shield, Math.round(m.maxLife * GUARD.monster));
  const life = m.life;
  a.damageMonster(m, m.shield - 1, 'phys', false, 0);
  assert.equal(m.life, life, 'its shield takes it');
  a.damageMonster(m, 3, 'phys', false, 0);
  assert.deepEqual([m.shield, m.life], [0, life - 2], 'and then its life');
  const plain = a.spawn('skeleton', h.x - 2, h.y, 1, 0, false, a.rng);
  plain.words.length = 0;
  assert.equal(room('warrior').a.spawn('skeleton', h.x, h.y + 2, 1, 0, false, a.rng).shield, 0, 'without the word, no shield');
});

test('a monster with Heavy: its blows knock the hero back a step, away from it; walls stop it', () => {
  const { g, a, seen } = room('warrior');
  const h = g.hero;
  const m = put(g, a, 'skeleton', 1, 0);
  h.d.armor = 0;
  const x0 = h.x;
  const y0 = h.y;
  g.hurtHero(5, 'phys', ['heavy'], m);
  assert.ok(h.step, 'a step back');
  run(g, seen, 0.3);
  near(h.x, x0 - HEAVY.knock, 'away from it', 1e-6);
  near(h.y, y0, 'straight back', 1e-6);
  // a shot's knock goes the way the shot flew (from where it came)
  h.x = x0;
  h.y = y0;
  g.hurtHero(5, 'phys', ['heavy'], null, 'a test', x0, y0 - 2);
  run(g, seen, 0.3);
  near(h.y, y0 + HEAVY.knock, 'along the shot', 1e-6);
  // and without the word, no knock
  h.x = x0;
  h.y = y0;
  g.hurtHero(5, 'phys', [], m);
  run(g, seen, 0.3);
  assert.deepEqual([h.x, h.y], [x0, y0]);
});

// ---------------------------------------------------------------------------------------------
// THE LOOKS, CALLED UP BY THE RULES

test('the looks are called up by what the rules say happened, and only with their switch on', () => {
  const was = WORDS3.on;
  try {
    const { g, a, seen } = room('warrior', [[0, 'front', 'heavy'], [0, 'behind', 'heavy']]);
    const m = put(g, a, 'skeleton', 1.1, 0);
    swing(g, seen, m);
    const fx = new Fx();
    clear3();
    WORDS3.on = false;
    events3(seen, g, fx);
    assert.equal(W3.marks.size + W3.patches.length + fx.rings.length, 0, 'switched off: nothing');
    WORDS3.on = true;
    events3(seen, g, fx);
    assert.ok((W3.marks.get(m.id)?.stun ?? 0) > 0, 'the stun is shown over the one it stunned');
    const laid = (): number => W3.patches.filter((p) => p.kind === 'cracks' && p.dur === HEAVY.cracks).length;
    assert.equal(laid(), 1, 'the cracked ground, for as long as it lasts');
    assert.ok(fx.rings.length > 0, 'and the blow landed with its weight');
    // laid again where it lies: one patch, lasting longer
    const before = W3.patches.length;
    W3.patches.find((p) => p.dur === HEAVY.cracks)!.t = 1;
    events3([{ t: 'zone', kind: 'cracks', x: m.x, y: m.y, r: 1, el: 'phys', dur: HEAVY.cracks }], g, fx);
    assert.equal(W3.patches.length, before, 'not a second patch');
    assert.ok(W3.patches.some((p) => p.kind === 'cracks' && p.dur === 1 + HEAVY.cracks), 'the first lasts longer');
    // the frenzy and the shield are shown as the hero has them
    g.hero.frenzy = 3;
    g.hero.frenzyT = 2;
    g.hero.shieldT = 1.5;
    events3([], g, fx);
    assert.deepEqual([W3.frenzy.n, W3.frenzy.t, W3.guard.t], [3, 2, 1.5]);
    // a mark, and the critical that spends it
    events3([{ t: 'markOn', id: m.id, x: m.x, y: m.y, secs: PRECISE.markTime }], g, fx);
    assert.equal(W3.marks.get(m.id)?.aim, PRECISE.markTime);
    events3([{ t: 'markSpent', id: m.id, x: m.x, y: m.y, dx: 1, dy: 0 }, { t: 'hit', x: m.x, y: m.y, amount: 9, crit: true, el: 'phys', onHero: false, words: ['precise'] }], g, fx);
    assert.equal(W3.marks.get(m.id)?.aim, 0, 'the sight is shut');
    // a new level: what was left on the floor of the last is gone
    g.enterTown();
    events3([], g, fx);
    assert.equal(W3.patches.length, 0);
  } finally {
    WORDS3.on = was;
    clear3();
  }
});
