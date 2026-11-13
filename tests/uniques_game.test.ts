// UNIQUE ITEMS IN PLAY (game/uniques.ts, game/game.ts “UNIQUE ITEMS”; behind UNIQUES): the ones any hero may wear, each doing
// what its card says, to the numbers of UNIQUE_TUNE; and with the switch off, nothing.
//   run: tsx --test tests/uniques_game.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { RNG } from '../src/engine/rng';
import { ALLY_DAMAGE, TUNE } from '../src/game/defs';
import { doorMiddle } from '../src/game/doors';
import { Game } from '../src/game/game';
import { plainWeapon, rollItem } from '../src/game/items';
import { emptyControls } from '../src/game/state';
import { UNIQUES, UNIQUE_TUNE, makeUnique } from '../src/game/uniques';
import { DT, dummy, hurt, inner, off, on, ready, room, seen, steady, strike, swipe, tap, wait, wear, words } from './uniques_helpers';

const T = UNIQUE_TUNE;
const near = (a: number, b: number, eps = 1e-6): boolean => Math.abs(a - b) <= eps * Math.max(1, Math.abs(a), Math.abs(b));

test('with the switch off a unique worn does nothing: the game is as it was', () =>
  off(() => {
  const g = room('warrior');
  const it = on(() => makeUnique('longodds', 10, new RNG(1)))!;
  it.reqLevel = 1;
  g.hero.gear.helm = it;
  g.refresh();
  assert.equal(UNIQUES.on, false);
  assert.equal(g.wears('longodds'), false);
  assert.deepEqual(g.worn, []);
  steady(g);
  const m = dummy(g, 1, 0);
  tap(g);
  const plain = hurt(m);
  on(() => {
    g.refresh();
    steady(g);
    assert.equal(g.wears('longodds'), true);
    m.life = m.maxLife;
    ready(g);
    tap(g);
    assert.ok(near(hurt(m), plain * (1 - T.odds.less), 0.02), 'on: an ordinary monster struck softer');
  });
  }));

test('Broken Shackles: the swipe move has no cooldown; its price, he can be hit during the move', () =>
  on(() => {
    const g = wear(room('warrior'), 'brokenshackles');
    assert.equal(g.hero.skills[2].r.cooldown, 0);
    swipe(g, 4, 0, 0.5);
    assert.equal(g.hero.skills[2].charges, 1, 'ready again at once');
    const x = g.hero.x;
    swipe(g, 4, 0, 0.5);
    assert.ok(g.hero.x > x + 2, 'and again');
    // hit in the air
    const c = emptyControls();
    c.evade = true;
    c.evadeX = g.hero.x - 5;
    c.evadeY = g.hero.y;
    g.update(DT, c);
    assert.ok(g.hero.move, 'in his Lunge');
    assert.ok(strike(g, 50) > 0, 'a blow lands on him in the move');
    // without them: nothing touches him in it, and it has its cooldown
    const p = room('warrior');
    assert.ok(p.hero.skills[2].r.cooldown > 0);
    p.update(DT, { ...emptyControls(), evade: true, evadeX: p.hero.x + 5, evadeY: p.hero.y });
    assert.ok(p.hero.move);
    assert.equal(strike(p, 50), 0);
  }));

test('Bloodprice: a flask heals nothing and he hits harder for a while; kills still refill them', () =>
  on(() => {
    const g = wear(room('warrior'), 'bloodprice');
    steady(g);
    const m = dummy(g, 1, 0);
    tap(g);
    const plain = hurt(m);
    g.hero.life = g.hero.d.maxLife * 0.5;
    const was = g.hero.life;
    const flasks = g.hero.potions;
    g.usePotion();
    assert.equal(g.hero.potions, flasks - 1);
    assert.ok(g.hero.life <= was + 1, 'no healing');
    m.life = m.maxLife;
    ready(g);
    tap(g);
    assert.ok(near(hurt(m), plain * (1 + T.bloodprice.more), 0.02), `${hurt(m)} against ${plain}`);
    wait(g, T.bloodprice.secs + 0.2);
    m.life = m.maxLife;
    ready(g);
    tap(g);
    assert.ok(near(hurt(m), plain, 0.02), 'and it wears off');
    // (drunk at full life too: it is not for healing)
    g.hero.life = g.hero.d.maxLife;
    const n = g.hero.potions;
    g.usePotion();
    assert.equal(g.hero.potions, n - 1);
    // kills still refill them
    g.hero.potions = 0;
    g.hero.potionKills = TUNE.potionKills - 1;
    g.kill(dummy(g, 3, 0, 10));
    assert.equal(g.hero.potions, 1);
  }));

test('Open Palm: with a wand or a tome and no focus beside it, faster attacks and harder critical hits', () =>
  on(() => {
    const g = room('mage');
    g.hero.gear.mainhand = plainWeapon('wand', 10);
    g.hero.gear.offhand = null;
    g.refresh();
    wear(g, 'freehand');
    // (the gloves it took the place of had stats of their own: measured against the same hands with a focus held)
    const withFree = { speed: g.hero.d.stats.atkSpeed, crit: g.hero.d.critMult };
    let focus = rollItem(10, new RNG(2), { slot: 'offhand', rarity: 0, weapons: ['wand'] });
    for (let s = 3; focus.offhand !== 'focus'; s++) focus = rollItem(10, new RNG(s), { slot: 'offhand', rarity: 0, weapons: ['wand'] });
    g.hero.gear.offhand = focus;
    g.refresh();
    assert.equal(withFree.speed - g.hero.d.stats.atkSpeed, T.freeHand.atkSpeed);
    assert.equal(withFree.crit - g.hero.d.critMult, T.freeHand.critMult);
    // (a staff is not a wand: nothing)
    g.hero.gear.offhand = null;
    g.hero.gear.mainhand = plainWeapon('staff', 10);
    g.refresh();
    assert.equal(g.hero.d.critMult, withFree.crit - T.freeHand.critMult);
  }));

test('The Half-Carved Hand: below half life he attacks and moves faster', () =>
  on(() => {
    const g = wear(room('warrior'), 'halfcarvedhand');
    const pace = (): number => {
      const y = g.hero.y;
      wait(g, 0.5, { ...emptyControls(), mx: 0, my: 1 });
      const far = g.hero.y - y;
      g.hero.y = y;
      return far;
    };
    const swing = (): number => {
      ready(g);
      g.hero.comboT = 0;
      g.update(DT, { ...emptyControls(), fire: true, aimX: g.hero.x + 1, aimY: g.hero.y });
      const t = g.hero.swingT;
      wait(g, 1.2);
      return t;
    };
    g.hero.life = g.hero.d.maxLife;
    const full = { pace: pace(), swing: swing() };
    g.hero.d.lifeRegen = 0;
    g.hero.life = g.hero.d.maxLife * 0.4;
    const low = { pace: pace(), swing: swing() };
    assert.ok(near(low.pace / full.pace, 1 + T.halfHand.move, 0.03), `feet: ${low.pace / full.pace}`);
    assert.ok(near(full.swing / low.swing, 1 + T.halfHand.attack, 0.03), `hands: ${full.swing / low.swing}`);
  }));

test('Light Feet: nothing slows him or holds him in place', () =>
  on(() => {
    const g = wear(room('ranger'), 'dancingshoes');
    const h = g.hero;
    h.chillT = 3;
    h.chill = 0.6;
    h.rootT = 2;
    h.iceT = 2;
    h.slowT = 2;
    h.slowBy = 0.5;
    h.stillT = 3;
    h.stillK = 0.4;
    h.held = 2;
    wait(g, DT);
    assert.deepEqual([h.chillT, h.rootT, h.iceT, h.slowT, h.stillT, h.held], [0, 0, 0, 0, 0, 0]);
    const y = h.y;
    wait(g, 0.3, { ...emptyControls(), mx: 0, my: 1 });
    assert.ok(h.y > y + 0.5, 'he walks on');
  }));

test('Menhir: stood still he takes less and nothing shoves him; it ends the moment he moves', () =>
  on(() => {
    const g = wear(room('warrior'), 'standingstone');
    g.hero.d.lifeRegen = 0;
    wait(g, T.stone.after + 0.1);
    const still = strike(g, 100);
    assert.equal(still, Math.round(100 * (1 - T.stone.less)));
    const x = g.hero.x;
    g.knockHero(g.hero.x + 1, g.hero.y);
    g.pullHero(g.hero.x + 4, g.hero.y);
    wait(g, 0.3);
    assert.equal(g.hero.x, x, 'not shoved, not dragged');
    wait(g, 0.2, { ...emptyControls(), mx: 0, my: 1 });
    assert.equal(strike(g, 100), 100, 'walking: as ever');
    g.knockHero(g.hero.x + 1, g.hero.y);
    wait(g, 0.05, { ...emptyControls(), mx: 0, my: 1 });
    assert.ok(g.hero.x < x, 'and shoved again');
  }));

test('The Long Odds: elites and bosses struck harder, everything else softer', () =>
  on(() => {
    const g = room('warrior');
    steady(g);
    const m = dummy(g, 1, 0);
    tap(g);
    const plain = hurt(m);
    wear(g, 'longodds');
    steady(g);
    m.life = m.maxLife;
    ready(g);
    tap(g);
    assert.ok(near(hurt(m), plain * (1 - T.odds.less), 0.02));
    m.elite = true;
    m.life = m.maxLife;
    ready(g);
    tap(g);
    assert.ok(near(hurt(m), plain * (1 + T.odds.more), 0.02));
  }));

test('The Miser\'s Purse: the more gold he carries the harder he hits; every hit he takes spills some of it', () =>
  on(() => {
    const g = wear(room('warrior'), 'miserspurse');
    steady(g);
    const m = dummy(g, 1, 0);
    g.hero.gold = 0;
    tap(g);
    const plain = hurt(m);
    g.hero.gold = 2000;
    m.life = m.maxLife;
    ready(g);
    tap(g);
    assert.ok(near(hurt(m), plain * (1 + 2000 * T.purse.each), 0.02), '2,000 gold: a fifth harder');
    // a hit spills
    g.drops.length = 0;
    strike(g, 30);
    const spilled = Math.round(2000 * T.purse.spill);
    assert.equal(g.hero.gold, 2000 - spilled);
    assert.equal(g.drops.filter((d) => d.kind === 'gold').reduce((n, d) => n + d.gold, 0), spilled, 'on the floor, to be picked up again');
    // on the Tinkerer it adds to her Fortune talent: one sum
    const t = wear(room('tinkerer'), 'miserspurse');
    t.hero.talents = ['bombsaway', 'fortune'];
    t.refresh();
    steady(t);
    const d = dummy(t, 2, 0);
    t.hero.gold = 0;
    tap(t, 2, 0, 1);
    const base = hurt(d);
    assert.ok(base > 0);
    t.hero.gold = 2000;
    d.life = d.maxLife;
    ready(t);
    tap(t, 2, 0, 1);
    assert.ok(near(hurt(d), base * (1 + 2000 * (T.purse.each + 0.0001)), 0.02), `${hurt(d) / base}`);
  }));

test('The Physician\'s Coat: flasks refill from hits landed on elites and bosses, not from kills', () =>
  on(() => {
    const g = wear(room('warrior'), 'physicianscoat');
    steady(g, 10);
    g.hero.potions = 0;
    g.hero.potionKills = 0;
    for (let k = 0; k < TUNE.potionKills + 2; k++) g.kill(dummy(g, 3, 0, 10));
    assert.equal(g.hero.potions, 0, 'no refills from kills');
    const plain = dummy(g, 1, 0);
    for (let k = 0; k < T.coat.hits + 2; k++) {
      ready(g);
      tap(g);
    }
    assert.equal(g.hero.potions, 0, 'nor from hits on an ordinary monster');
    plain.dead = true;
    wait(g, DT);
    const e = dummy(g, 1, 0);
    e.elite = true;
    for (let k = 0; k < T.coat.hits; k++) {
      ready(g);
      tap(g);
    }
    assert.equal(g.hero.potions, 1, `one for every ${T.coat.hits} hits on an elite`);
  }));

test('The Warden\'s Keys: a sealed word door opens to him without its word, and a chest holds one more piece', () =>
  on(() => {
    const chestPieces = (keys: boolean): { opened: boolean; items: number } => {
      const g = Game.forPractice('warrior', 5, 'traps');
      inner(g).waveT = 1e9;
      g.monsters.length = 0;
      if (keys) wear(g, 'wardenskeys');
      const door = g.level.doors.find((d) => d.spot.kind === 'worddoor')!;
      assert.ok(door, 'the trap hall has a sealed door');
      const at = doorMiddle(door.spot);
      // (stood before it, on the side he came from)
      const spots = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => ({ x: at.x + dx, y: at.y + dy })).filter((p) => g.isOpen(p.x, p.y));
      g.hero.x = spots[0].x;
      g.hero.y = spots[0].y;
      wait(g, 0.2);
      const opened = door.want === 1;
      const chest = g.level.props.find((p) => p.kind === 'chest' && p.state === 0)!;
      g.drops.length = 0;
      g.hero.x = chest.x;
      g.hero.y = chest.y + 1;
      wait(g, 0.1);
      return { opened, items: g.drops.filter((d) => d.kind === 'item').length };
    };
    const without = chestPieces(false);
    const withKeys = chestPieces(true);
    assert.equal(without.opened, false, 'sealed to anyone else');
    assert.equal(withKeys.opened, true);
    assert.equal(withKeys.items, without.items + T.keys.more);
  }));

test('The Crier\'s Hush: a monster standing close to him has its words darkened, and has them back as it steps away; not a boss', () =>
  on(() => {
    const g = wear(room('warrior'), 'criershush');
    const m = dummy(g, 1.5, 0);
    m.elite = true;
    m.words = ['leech', 'fire'];
    const far = dummy(g, 6, 0);
    far.words = ['frenzied'];
    const boss = dummy(g, 0, 1.5);
    boss.boss = true;
    boss.words = ['leech'];
    wait(g, DT * 2);
    assert.deepEqual(m.words, [], 'dark: they do nothing');
    assert.deepEqual(m.dark?.words, ['leech', 'fire']);
    assert.deepEqual(far.words, ['frenzied'], 'one far off keeps its own');
    assert.deepEqual(boss.words, ['leech'], 'a boss keeps his');
    // (its Leech heals it nothing off a blow while it is next to him)
    const life = (m.life = m.maxLife - 500);
    g.hurtHero(40, 'phys', m.words, m, m.name);
    assert.equal(m.life, life);
    m.x = g.hero.x + 7;
    wait(g, DT * 2);
    assert.deepEqual(m.words, ['leech', 'fire'], 'stepped away: its words are its own again');
    assert.equal(m.dark, undefined);
    // taken off, every one has its words back at once
    m.x = g.hero.x + 1.5;
    wait(g, DT * 2);
    assert.deepEqual(m.words, []);
    g.hero.gear.helm = null;
    g.refresh();
    wait(g, DT * 2);
    assert.deepEqual(m.words, ['leech', 'fire']);
  }));

test('The Drowned Arm: every few seconds a tentacle bursts up under the enemy he is fighting and slams it', () =>
  on(() => {
    const g = wear(room('warrior'), 'drownedarm');
    steady(g);
    const m = dummy(g, 1, 0);
    const by = dummy(g, 1.6, 0.6);
    const far = dummy(g, 6, 0);
    const ev = tap(g);
    const hit = hurt(m);
    ev.push(...wait(g, T.arm.lead + 0.3));
    assert.equal(seen(ev, 'drownedarm', 'warn').length, 1);
    assert.equal(seen(ev, 'drownedarm', 'slam').length, 1);
    const st = g.hero.d.stats;
    const slam = Math.round(100 * T.arm.share * (1 + (st.dmgPct + st.physPct) / 100));
    assert.ok(near(hurt(m) - hit, slam, 0.02), `${hurt(m) - hit} against ${slam}`);
    assert.ok(hurt(by) > 0, 'and what stands by it');
    assert.equal(hurt(far), 0);
    // (his pick, 12 Nov 2026: “Every 3s, and it stuns (Recommended)”)
    assert.equal(T.arm.every, 3);
    assert.ok(m.stunT > 0 && by.stunT > 0 && far.stunT === 0, 'what it slams is stunned');
    // not again until its time has come round; and none with nobody fought
    const again = wait(g, T.arm.every - 1.5);
    assert.equal(seen(again, 'drownedarm', 'slam').length, 0);
    const none = wait(g, T.arm.every + 1);
    assert.equal(seen(none, 'drownedarm', 'slam').length, 0, 'he has struck nothing lately');
    ready(g);
    assert.equal(seen(tap(g, 1, 0, T.arm.lead + 0.2), 'drownedarm', 'slam').length, 1);
  }));

test('The Queen\'s Talons: each critical hit calls a bird that dives on the nearest enemy', () =>
  on(() => {
    const g = wear(room('warrior'), 'queenstalons');
    steady(g, 100, true);
    const m = dummy(g, 1, 0);
    const ev = tap(g);
    assert.equal(seen(ev, 'queenstalons', 'dive').length, 1);
    const hit = hurt(m);
    wait(g, T.talons.dive + 0.1);
    const st = g.hero.d.stats;
    const bird = Math.round(100 * T.talons.share * (1 + (st.dmgPct + st.physPct) / 100));
    assert.ok(near(hurt(m) - hit, bird, 0.02), `${hurt(m) - hit} against ${bird}`);
    // ALLY DAMAGE (his words, 12 Nov 2026, 13:47): what makes allies hit harder makes the bird's hit harder
    ALLY_DAMAGE.more = 2;
    try {
      steady(g, 100, true);
      ready(g);
      wait(g, T.talons.gap + 0.1);
      tap(g);
      const before = hurt(m);
      wait(g, T.talons.dive + 0.1);
      assert.ok(near(hurt(m) - before, 2 * bird, 0.02), `the bird's, doubled: ${hurt(m) - before} against ${2 * bird}`);
    } finally {
      ALLY_DAMAGE.more = 1;
    }
    // no critical hit, no bird
    steady(g, 100, false);
    ready(g);
    assert.equal(seen(tap(g, 1, 0, 0.5), 'queenstalons').length, 0);
  }));

test('The Fleshmancer\'s Brand: an elite he kills rises and fights for him for a while, then falls; one at a time', () =>
  on(() => {
    const g = wear(room('warrior'), 'fleshmancersbrand');
    steady(g);
    const plain = dummy(g, 3, 0, 10);
    g.kill(plain);
    assert.equal(g.risen, null, 'not an ordinary monster');
    const e = dummy(g, 2, 0, 10);
    e.elite = true;
    e.name = 'Grim the Elite';
    g.kill(e);
    assert.ok(g.risen, 'it rises');
    assert.equal(g.risen!.name, 'Grim the Elite');
    wait(g, DT);
    const foe = dummy(g, 4, 1);
    const ev = wait(g, 4);
    assert.ok(seen(ev, 'fleshmancersbrand', 'strike').length >= 2, 'it goes for an enemy and strikes it');
    assert.ok(hurt(foe) > 0);
    assert.ok(hurt(foe) % 1 === 0);
    // another elite killed takes its place
    const e2 = dummy(g, -2, 0, 10);
    e2.elite = true;
    e2.name = 'Second';
    g.kill(e2);
    assert.equal(g.risen!.name, 'Second');
    const end = wait(g, T.brand.secs + 0.2);
    assert.equal(g.risen, null, 'its time up, it falls');
    assert.ok(seen(end, 'fleshmancersbrand', 'fall').length >= 1);
  }));

test('The King\'s Knot: kill a monster that carries a word, and his tap attack carries it too for a while', () =>
  on(() => {
    const g = wear(room('warrior'), 'kingsknot');
    words(g, 0, ['power', null]);
    assert.equal(g.hero.skills[0].r.leech, 0);
    const m = dummy(g, 3, 0, 10);
    m.words = ['leech'];
    g.kill(m);
    assert.equal(g.uq.borrowed, 'leech');
    assert.ok(g.hero.skills[0].r.leech > 0, 'Leech in front of his Strike');
    assert.deepEqual(g.hero.skills[0].front, ['power', null], 'his own sockets untouched');
    assert.equal(g.hero.skills[1].r.leech, 0, 'the tap attack only');
    wait(g, T.knot.secs + 0.1);
    assert.equal(g.uq.borrowed, null);
    assert.equal(g.hero.skills[0].r.leech, 0, 'and it runs out');
    // (one without a word: nothing)
    g.kill(dummy(g, 3, 0, 10));
    assert.equal(g.uq.borrowed, null);
  }));

test('Nettleweave: her Vow, his words stronger the longer he goes unhit; a hit breaks it and it starts over', () =>
  on(() => {
    const g = wear(room('warrior'), 'nettleshirt');
    words(g, 0, ['power', null]);
    const at0 = g.hero.skills[0].r.dmgMult;
    wait(g, T.nettle.every + 0.1);
    assert.equal(g.uq.vow, T.nettle.each);
    assert.ok(g.hero.skills[0].r.dmgMult > at0);
    wait(g, T.nettle.every * 6);
    assert.equal(g.uq.vow, T.nettle.most, 'up to its most');
    const top = g.hero.skills[0].r.dmgMult;
    strike(g, 20);
    assert.equal(g.uq.vow, 0);
    assert.ok(near(g.hero.skills[0].r.dmgMult, at0), 'broken');
    wait(g, T.nettle.every + 0.1);
    assert.equal(g.uq.vow, T.nettle.each, 'and begun again');
    assert.ok(top > g.hero.skills[0].r.dmgMult);
  }));

test('The Clockwork Songbird: while his life is full his words are half as strong again; silent when he is hurt', () =>
  on(() => {
    const g = room('warrior');
    words(g, 0, ['power', null]);
    const plain = g.hero.skills[0].r.dmgMult;
    wear(g, 'clockworksongbird');
    g.hero.life = g.hero.d.maxLife;
    wait(g, DT * 2);
    const sings = g.hero.skills[0].r.dmgMult;
    assert.ok(sings > plain * 1.05);
    g.hero.d.lifeRegen = 0;
    strike(g, 40);
    wait(g, DT * 2);
    assert.ok(near(g.hero.skills[0].r.dmgMult, plain), 'hurt: it falls silent');
    g.hero.life = g.hero.d.maxLife;
    wait(g, DT * 2);
    assert.ok(near(g.hero.skills[0].r.dmgMult, sings), 'whole again: it sings');
  }));

test('The Moth\'s Wing: less from every hit; each hit darkens one of his words for a while, only one word ever dark', () =>
  on(() => {
    const g = room('warrior');
    g.hero.d.lifeRegen = 0;
    assert.equal(strike(g, 100), 100);
    wear(g, 'mothswing');
    g.hero.d.lifeRegen = 0;
    words(g, 0, ['power', 'twin'], ['leech', null]);
    words(g, 1, ['fire', null]);
    assert.equal(strike(g, 100), Math.round(100 * (1 - T.moth.less)));
    const first = g.uq.dark;
    assert.ok(first, 'a word is dark');
    const lit = (): number => g.hero.skills.reduce((n, s) => n + (s.eff ? [...s.eff.front, ...s.eff.behind] : [...s.front, ...s.behind]).filter((w) => w !== null).length, 0);
    assert.equal(lit(), 3, 'four set, one dark');
    // another hit: another word, and still only one
    strike(g, 100);
    assert.ok(g.uq.dark && (g.uq.dark.skill !== first!.skill || g.uq.dark.side !== first!.side || g.uq.dark.idx !== first!.idx), 'the dark moves to another');
    assert.equal(lit(), 3, 'only one word is ever dark');
    for (let k = 0; k < 6; k++) strike(g, 10);
    assert.equal(lit(), 3, 'six hits quickly: still one');
    wait(g, T.moth.dark + 0.1);
    assert.equal(g.uq.dark, null);
    assert.equal(lit(), 4, 'and it comes back');
    // (his sockets themselves are never touched)
    assert.deepEqual(g.hero.skills[0].front, ['power', 'twin']);
  }));

test('The Third Word, The Dog-Eared Page, Polyglot\'s Mantle: the slots themselves', () =>
  on(() => {
    // a third slot in front of the tap attack
    const g = wear(room('warrior'), 'thirdword');
    assert.deepEqual(g.hero.skills.map((s) => [s.front.length, s.behind.length]), [[3, 2], [2, 2], [2, 2]]);
    assert.equal(g.placeWord({ skill: 0, side: 'front', idx: 2 }, 'twin'), null);
    assert.ok(g.hero.skills[0].r.count === 2);
    // taken off, the slot closes and its word goes back to the pouch
    const had = g.hero.words.twin;
    g.hero.gear.amulet = null;
    g.refresh();
    assert.equal(g.hero.skills[0].front.length, 2);
    assert.equal(g.hero.words.twin, had + 1);
    // every slot open at level 1
    const young = new Game('mage', 9);
    young.hero.ring = true;
    young.meta.ring = true;
    young.hero.level = 5;
    young.refresh();
    const before = young.hero.skills.map((s) => [s.front.length, s.behind.length]);
    assert.ok(before.some(([f, b]) => f < 2 || b < 2), 'a young hero has slots still shut');
    wear(young, 'dogearedpage');
    assert.deepEqual(young.hero.skills.map((s) => [s.front.length, s.behind.length]), [[2, 2], [2, 2], [2, 2]]);
    assert.equal(young.useProblem(makeUnique('dogearedpage', 20, new RNG(1))!), null, 'made to hand down: a hero of any level may put it on');
    // two damage words a side
    const p = room('mage');
    assert.equal(p.placeWord({ skill: 0, side: 'front', idx: 0 }, 'fire'), null);
    assert.equal(p.placeWord({ skill: 0, side: 'front', idx: 1 }, 'frost'), 'One damage word per side');
    wear(p, 'polyglotsmantle');
    assert.equal(p.placeWord({ skill: 0, side: 'front', idx: 1 }, 'frost'), null);
    assert.ok(p.hero.skills[0].r.ignite > 0 && p.hero.skills[0].r.chill > 0, 'each with its full effect');
    const frost = p.hero.words.frost;
    p.hero.gear.chest = null;
    p.refresh();
    assert.deepEqual(p.hero.skills[0].front, ['fire', null], 'taken off: the second goes back to the pouch');
    assert.equal(p.hero.words.frost, frost + 1);
  }));

test('The Censor\'s Seal and The Quill\'s Band in play, one on each hand: the words set stay set, and do nothing where they may not', () =>
  on(() => {
    const g = room('warrior');
    words(g, 0, ['power', null]);
    words(g, 1, ['power', null]);
    const tap0 = g.hero.skills[0].r.dmgMult;
    const hold0 = g.hero.skills[1].r.dmgMult;
    wear(g, 'censorsseal');
    assert.ok(g.hero.skills[0].r.dmgMult > tap0, 'the tap attack\'s words stronger');
    assert.ok(g.hero.skills[1].r.dmgMult < hold0, 'the hold attack takes none');
    assert.deepEqual(g.hero.skills[1].front, ['power', null], 'the word stays where it was set');
    wear(g, 'quillsband');
    assert.ok(g.wears('censorsseal') && g.wears('quillsband'), 'a ring on each hand');
    assert.ok(g.hero.skills[0].r.dmgMult < tap0 && g.hero.skills[1].r.dmgMult < hold0, 'both worn: neither attack takes words');
  }));
