// UNIQUE ITEMS IN PLAY, EACH HERO'S OWN (game/uniques.ts, game/game.ts “UNIQUE ITEMS”; behind UNIQUES): the three of each hero's
// weapon and the two that name him and only work for him, each doing what its card says, to the numbers of UNIQUE_TUNE.
//   run: tsx --test tests/uniques_heroes.test.ts
import './companions_on';
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { SKILLS, TUNE } from '../src/game/defs';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent } from '../src/game/state';
import type { Game } from '../src/game/game';
import { TINKER_TUNE } from '../src/game/tinkerer';
import { UNIQUE_TUNE } from '../src/game/uniques';
import { VET_MOVES } from '../src/game/veteran';
import { WARLOCK_TUNE } from '../src/game/warlock';
import { DT, cast, dummy, hurt, on, ready, room, seen, steady, strike, swipe, tap, wait, wear, words } from './uniques_helpers';

const T = UNIQUE_TUNE;
const near = (a: number, b: number, eps = 1e-6): boolean => Math.abs(a - b) <= eps * Math.max(1, Math.abs(a), Math.abs(b));
type In = { projectiles: { look: string; dmg: number; home?: boolean; blade?: boolean; hit: number[] }[]; traps: { x: number; y: number }[]; volleys: { x: number; y: number }[]; orbs: { x: number; y: number }[]; golems: { x: number; y: number; act: string }[]; vials: { foreman?: boolean; sticky?: boolean }[]; pets: { kind: string }[]; power: number };
const I = (g: Game): In => g as unknown as In;

// ---------------------------------------------------------------------------------------------
// THE WARRIOR

test('The Millstone: Whirlwind has no time limit, he spins for as long as he holds', () =>
  on(() => {
    const held = (g: Game, secs: number): boolean => {
      const c: Controls = { ...emptyControls(), cast: true, hold: true, castX: g.hero.x + 1, castY: g.hero.y };
      g.update(DT, c);
      c.cast = false;
      for (let t = 0; t < secs; t += DT) g.update(DT, c);
      return g.hero.channel !== null;
    };
    const long = (SKILLS.whirlwind.channel ?? 0) + 2;
    assert.equal(held(room('warrior'), long), false, 'without it: its length, and it ends');
    const g = wear(room('warrior'), 'millstone');
    assert.equal(held(g, long), true, 'still spinning');
    g.update(DT, emptyControls());
    assert.equal(g.hero.channel, null, 'let go, it ends');
    assert.ok(g.hero.skills[1].cd > 0, 'and its cooldown begins');
  }));

test('The Windcutter: every third Strike in a row sends a blade of wind on ahead, through everything in its line', () =>
  on(() => {
    const g = wear(room('warrior'), 'windcutter');
    steady(g);
    const a = dummy(g, 4, 0);
    const b = dummy(g, 6, 0);
    const side = dummy(g, 4, 3);
    const ev: GameEvent[] = [];
    for (let k = 0; k < 2; k++) {
      ev.push(...tap(g));
      g.hero.swingT = 0;
    }
    assert.equal(seen(ev, 'windcutter').length, 0, 'not the first, nor the second');
    assert.equal(hurt(a), 0, 'out of a Strike\'s reach');
    const third = tap(g, 1, 0, 0.7);
    assert.equal(seen(third, 'windcutter', 'blade').length, 1);
    const st = g.hero.d.stats;
    const blade = Math.round(100 * g.hero.skills[0].r.dmgMult * T.windcutter.share * (1 + (st.dmgPct + st.physPct) / 100));
    assert.ok(near(hurt(a), blade, 0.02), `${hurt(a)} against ${blade}`);
    assert.equal(hurt(b), hurt(a), 'through everything in its line');
    assert.equal(hurt(side), 0);
    // the count begins again; and anything between two Strikes begins it again too
    g.hero.swingT = 0;
    assert.equal(seen(tap(g, 1, 0, 0.5), 'windcutter').length, 0, 'the fourth is the first of the next three');
    wait(g, 2);
    const cold: GameEvent[] = [];
    for (let k = 0; k < 2; k++) {
      cold.push(...tap(g));
      g.hero.swingT = 0;
    }
    wait(g, 2);
    cold.push(...tap(g, 1, 0, 0.5));
    assert.equal(seen(cold, 'windcutter').length, 0, 'not in a row: no blade');
  }));

test('The Undertow, The Pivot, The Press: Pulling on his Whirlwind; a turn of it where his Lunge lands; harder the more close round him', () =>
  on(() => {
    const u = wear(room('warrior'), 'undertow');
    assert.ok(u.hero.skills[1].r.pull > 0, 'Whirlwind drags in what it cuts');
    assert.deepEqual(u.hero.skills[1].front, [null, null], 'no slot used');
    assert.equal(u.hero.skills[0].r.pull, 0);
    // The Pivot
    const lunge = (g: Game, off = false): { ev: GameEvent[]; hurt: number } => {
      steady(g);
      if (off) g.worn = []; // its ordinary stats still on him, but not what it does
      const m = dummy(g, 5.2, 1.2);
      const ev = swipe(g, 5, 0, 1.2);
      return { ev, hurt: hurt(m) };
    };
    const plain = lunge(wear(room('warrior'), 'pivot'), true);
    const g = wear(room('warrior'), 'pivot');
    const turned = lunge(g);
    assert.equal(seen(turned.ev, 'pivot', 'turn').length, 1);
    const st = g.hero.d.stats;
    const cut = Math.round(100 * g.hero.skills[1].r.dmgMult * (1 + (st.dmgPct + st.physPct) / 100));
    assert.ok(near(turned.hurt - plain.hurt, cut * T.pivot.cuts, 0.03), `${turned.hurt - plain.hurt} against ${cut * T.pivot.cuts}`);
    assert.equal(g.hero.skills[1].charges, 1, 'free: his Whirlwind is not spent');
    // (another hero's boots do nothing for him)
    const r = wear(room('ranger'), 'pivot');
    assert.equal(r.wears('pivot'), false);
    // The Press
    const p = wear(room('warrior'), 'press');
    steady(p);
    const m = dummy(p, 1, 0);
    tap(p);
    const one = hurt(m);
    dummy(p, 0, 2);
    dummy(p, 0, -2);
    dummy(p, -2, 0);
    dummy(p, 8, 8);
    m.life = m.maxLife;
    ready(p);
    p.hero.comboT = 0;
    tap(p);
    assert.ok(near(hurt(m) / one, (1 + 4 * T.press.each) / (1 + T.press.each), 0.02), `${hurt(m) / one}`);
  }));

// ---------------------------------------------------------------------------------------------
// THE RANGER

test('The Rainwalker: Volley rains round him and moves with him', () =>
  on(() => {
    const g = wear(room('ranger'), 'rainwalker');
    cast(g, 7, 0);
    const v = I(g).volleys[0];
    assert.ok(v, 'a volley');
    assert.ok(Math.hypot(v.x - g.hero.x, v.y - g.hero.y) < 0.01, 'round him, not where he pointed');
    wait(g, 0.8, { ...emptyControls(), mx: 0, my: 1 });
    assert.ok(Math.hypot(v.x - g.hero.x, v.y - g.hero.y) < 0.2, 'and it goes with him');
    const m = dummy(g, 1, 0.5);
    wait(g, 1.5);
    assert.ok(hurt(m) > 0, 'it rains on what is by him');
    // without it: on the spot he pointed at
    const p = room('ranger');
    cast(p, 7, 0);
    assert.ok(Math.hypot(I(p).volleys[0].x - p.hero.x, I(p).volleys[0].y - p.hero.y) > 5);
  }));

test('The Fan: each Shot looses three arrows in a fan, each a little weaker; one enemy takes only one of them', () =>
  on(() => {
    const g = wear(room('ranger'), 'fan');
    steady(g);
    const m = dummy(g, 1.2, 0);
    tap(g);
    const mine = I(g).projectiles.filter((p) => p.look === 'arrow');
    assert.equal(mine.length + (hurt(m) > 0 ? 1 : 0) >= 3 || mine.length === T.fan.arrows, true, 'three arrows');
    wait(g, 0.5);
    const st = g.hero.d.stats;
    const one = Math.round(100 * g.hero.skills[0].r.dmgMult * T.fan.share * (1 + (st.dmgPct + st.physPct) / 100));
    assert.ok(near(hurt(m), one, 0.02), `one arrow of the three: ${hurt(m)} against ${one}`);
    // three enemies spread before him each take one
    const g2 = wear(room('ranger'), 'fan');
    steady(g2);
    const three = [-1, 0, 1].map((k) => dummy(g2, 5 * Math.cos(k * T.fan.spread), 5 * Math.sin(k * T.fan.spread)));
    tap(g2, 1, 0, 0.6);
    assert.deepEqual(three.map((q) => hurt(q) > 0), [true, true, true]);
  }));

test('The Poacher\'s Bow and The Hair Trigger: a Volley leaves one of his traps; an arrow across a trap sets it off, twice as hard', () =>
  on(() => {
    const g = wear(room('ranger'), 'poachersbow');
    cast(g, 6, 0);
    assert.equal(I(g).traps.length, 0);
    wait(g, TUNE.volleyDelay + 0.3);
    assert.equal(I(g).traps.length, 1, 'as its first arrow lands');
    const v = I(g).volleys[0];
    assert.ok(Math.hypot(I(g).traps[0].x - v.x, I(g).traps[0].y - v.y) < 0.01, 'where the Volley falls');
    wait(g, 3);
    assert.equal(I(g).traps.length, 1, 'one a Volley');
    // The Hair Trigger
    const burst = (trigger: boolean): { hurt: number; gone: boolean } => {
      const t = room('ranger');
      if (trigger) wear(t, 'hairtrigger');
      steady(t);
      // (a trap laid four tiles ahead, an enemy by it but not on it)
      (t as unknown as { layTrap: (i: number, x: number, y: number, frac: number) => void }).layTrap(2, t.hero.x + 4, t.hero.y, 1);
      const m = dummy(t, 4, 1.6);
      tap(t, 1, 0, 0.5);
      return { hurt: hurt(m), gone: I(t).traps.length === 0 };
    };
    const plain = burst(false);
    assert.deepEqual(plain, { hurt: 0, gone: false }, 'an arrow over a trap does nothing to it');
    const shot = burst(true);
    assert.equal(shot.gone, true, 'set off at once');
    const t = room('ranger');
    steady(t);
    const st = t.hero.d.stats;
    const once = Math.round(100 * t.hero.skills[2].r.dmgMult * (1 + (st.dmgPct + st.physPct) / 100));
    assert.ok(near(shot.hurt, once * T.trigger.mult, 0.03), `${shot.hurt} against ${once * T.trigger.mult}`);
  }));

test('The Pack Collar: one more companion than he would have, a second from the same list', () =>
  on(() => {
    const g = room('ranger');
    wait(g, 0.2);
    assert.equal(I(g).pets.length, 0);
    wear(g, 'packcollar');
    wait(g, 0.2);
    assert.deepEqual(I(g).pets.map((p) => p.kind), ['hawk'], 'none before: one now');
    g.hero.talents = ['keeneye', 'venom', 'huntcompanion'];
    g.hero.pets = { hunt: 'snake' };
    g.refresh();
    wait(g, 0.2);
    assert.deepEqual(I(g).pets.map((p) => p.kind).sort(), ['snake', 'wolf'], 'his pick, and the next of the same list');
    g.hero.gear.amulet = null;
    g.refresh();
    wait(g, 0.2);
    assert.deepEqual(I(g).pets.map((p) => p.kind), ['snake'], 'taken off: his own again');
  }));

// ---------------------------------------------------------------------------------------------
// THE MAGE

test('The Shepherd\'s Crook: the Orb follows him', () =>
  on(() => {
    const g = wear(room('mage'), 'shepherdscrook');
    cast(g, 5, 0);
    const o = I(g).orbs[0];
    assert.ok(o && Math.hypot(o.x - g.hero.x, o.y - g.hero.y) > 4);
    wait(g, 1.2);
    assert.ok(Math.hypot(o.x - g.hero.x, o.y - g.hero.y) <= T.crook.near + 0.05, 'it comes to him');
    wait(g, 1, { ...emptyControls(), mx: 0, my: 1 });
    assert.ok(Math.hypot(o.x - g.hero.x, o.y - g.hero.y) <= T.crook.near + 1, 'and keeps by him as he walks');
    const p = room('mage');
    cast(p, 5, 0);
    const at = { ...I(p).orbs[0] };
    wait(p, 1.2);
    assert.deepEqual([I(p).orbs[0].x, I(p).orbs[0].y], [at.x, at.y], 'without it: where it was set');
  }));

test('The Tide and The Tuning Staff: the Wave comes back through everything; a Wave through his Orb makes it pulse, twice as hard', () =>
  on(() => {
    const g = wear(room('mage'), 'tide');
    steady(g);
    const m = dummy(g, 3, 0);
    const ev = tap(g, 1, 0, 2);
    assert.ok(seen(ev, 'tide', 'turn').length >= 1, 'it turns at the end of its way');
    const st = g.hero.d.stats;
    const wave = Math.round(100 * g.hero.skills[0].r.dmgMult * (1 + (st.dmgPct + st.physPct) / 100));
    const back = Math.round(100 * g.hero.skills[0].r.dmgMult * T.tide.share * (1 + (st.dmgPct + st.physPct) / 100));
    assert.ok(near(hurt(m), wave + back, 0.02), `out and home: ${hurt(m)} against ${wave + back}`);
    assert.equal(I(g).projectiles.length, 0, 'home, it is gone: it turns only once');
    // The Tuning Staff
    const t = wear(room('mage'), 'tuningstaff');
    steady(t);
    cast(t, 4, 0, 0, 0.3);
    const far = dummy(t, 4, 1.8);
    const before = hurt(far);
    ready(t);
    const ev2 = tap(t, 1, 0, 0.8);
    assert.equal(seen(ev2, 'tuningstaff', 'pulse').length, 1);
    const pulse = Math.round(100 * t.hero.skills[1].r.dmgMult * T.tuning.mult * (1 + (st.dmgPct + st.physPct) / 100));
    assert.ok(hurt(far) - before >= pulse * 0.98, `a pulse twice as hard: ${hurt(far) - before} against ${pulse}`);
  }));

test('The Prism: fire, frost and lightning each count as all three: what one of them hits burns, is chilled and is shocked', () =>
  on(() => {
    for (const w of ['fire', 'frost', 'lightning'] as const) {
      const g = wear(room('mage'), 'prism');
      words(g, 0, [w, null]);
      const m = dummy(g, 3, 0);
      tap(g, 1, 0, 0.4);
      assert.ok(m.burnT > 0, `${w}: it burns`);
      assert.ok(m.chillT > 0 || m.frozenT > 0, `${w}: it is chilled`);
      assert.ok(m.shockT > 0, `${w}: it is shocked`);
    }
    // a plain Wave: none of the three
    const g = wear(room('mage'), 'prism');
    const m = dummy(g, 3, 0);
    tap(g, 1, 0, 0.4);
    assert.deepEqual([m.burnT > 0, m.chillT > 0, m.shockT > 0], [false, false, false]);
    // and without it, Flame is Flame alone
    const p = room('mage');
    words(p, 0, ['fire', null]);
    const q = dummy(p, 3, 0);
    tap(p, 1, 0, 0.4);
    assert.deepEqual([q.burnT > 0, q.chillT > 0, q.shockT > 0], [true, false, false]);
  }));

test('The Short Way: Warp again within two seconds to snap back to where she started; later, an ordinary Warp', () =>
  on(() => {
    const g = wear(room('mage'), 'shortway');
    const x0 = g.hero.x;
    const y0 = g.hero.y;
    swipe(g, 5, 0, 0.2);
    assert.ok(g.hero.x > x0 + 4, 'warped');
    assert.equal(g.hero.skills[2].charges, 0);
    const ev = swipe(g, 5, 0, 0.2);
    assert.ok(Math.hypot(g.hero.x - x0, g.hero.y - y0) < 0.01, 'back where she started');
    assert.equal(seen(ev, 'shortway', 'back').length, 1);
    assert.equal(g.hero.skills[2].charges, 0, 'the snap back is not another Warp: its cooldown runs on');
    // nothing to snap back to now: a swipe waits for the Warp
    swipe(g, 5, 0, 0.2);
    assert.ok(Math.hypot(g.hero.x - x0, g.hero.y - y0) < 0.01);
    // too late: an ordinary Warp
    ready(g);
    swipe(g, 5, 0, T.shortWay.secs + 0.3);
    ready(g);
    swipe(g, 5, 0, 0.2);
    assert.ok(g.hero.x > x0 + 8, 'on again, not back');
  }));

// ---------------------------------------------------------------------------------------------
// THE WARLOCK

test('The Ledger of Debts: the Hellfire Bolt hits harder for every cursed enemy near him', () =>
  on(() => {
    const g = wear(room('warlock'), 'ledgerofdebts');
    steady(g);
    const m = dummy(g, 4, 0);
    // (the bolt's own blow: the biggest number over the enemy, its hellfire's ticks being small beside it)
    const bolt = (ev: GameEvent[]): number => Math.max(...ev.filter((e): e is Extract<GameEvent, { t: 'hit' }> => e.t === 'hit' && !e.onHero).map((e) => e.amount));
    const plain = bolt(tap(g, 1, 0, 0.6));
    for (const [dx, dy] of [[0, 2], [0, -2], [-2, 0]]) dummy(g, dx, dy).curseT = 99;
    dummy(g, 0, 12).curseT = 99;
    ready(g);
    const more = bolt(tap(g, 1, 0, 0.6));
    assert.ok(near(more / plain, 1 + 3 * T.ledger.each, 0.01), `three cursed near him, one far off: ${more / plain}`);
    // (his other attacks as they were: the Curse is no bolt)
    assert.equal(g.hero.skills[0].id, 'hellbolt');
  }));

test('The Restless Tome: it swirls round him and puts hellfire on any enemy it touches', () =>
  on(() => {
    const g = wear(room('warlock'), 'restlesstome');
    const m = dummy(g, T.tome.r, 0);
    const far = dummy(g, 6, 0);
    const ev = wait(g, T.tome.turn + 0.1);
    assert.ok((m.hellT ?? 0) > 0, 'burning in his hellfire');
    assert.ok(seen(ev, 'restlesstome', 'touch').length >= 1);
    assert.equal(far.hellT ?? 0, 0);
    assert.ok(hurt(m) > 0);
    // (not in his hand: without it, nothing)
    const p = room('warlock');
    const q = dummy(p, T.tome.r, 0);
    wait(p, T.tome.turn + 0.1);
    assert.equal(q.hellT ?? 0, 0);
  }));

test('The Burning Verse: a burn he causes on a cursed enemy never goes out', () =>
  on(() => {
    const burnsOn = (verse: boolean): boolean => {
      const g = room('warlock');
      if (verse) wear(g, 'burningverse');
      steady(g, 10);
      const m = dummy(g, 4, 0);
      tap(g, 1, 0, 0.6);
      assert.ok((m.hellT ?? 0) > 0, 'his bolt sets it burning');
      m.curseT = 2;
      m.curseDps = 1;
      wait(g, WARLOCK_TUNE.hell.secs + 6);
      return (m.hellT ?? 0) > 0;
    };
    assert.equal(burnsOn(false), false, 'without it, it burns out');
    assert.equal(burnsOn(true), true, 'with it, it lasts until the enemy dies, the curse long gone');
    // (a burn on one that was never cursed goes out as ever)
    const g = wear(room('warlock'), 'burningverse');
    const m = dummy(g, 4, 0);
    tap(g, 1, 0, 0.6);
    wait(g, WARLOCK_TUNE.hell.secs + 1);
    assert.equal(m.hellT ?? 0, 0);
  }));

test('The Unsigned Pact and The Cloven Boots: the demon stays on his life when the pact runs dry; its Smoke Step has no cooldown', () =>
  on(() => {
    const demon = (g: Game): Game => {
      g.hero.form = 'demon';
      g.hero.pact = WARLOCK_TUNE.pact.full;
      g.refresh();
      return g;
    };
    // without it: the pact dry, the demon burns out
    const p = demon(room('warlock'));
    p.hero.pact = 0.001;
    wait(p, 0.2);
    assert.ok(p.hero.change && p.hero.change.to === 'man');
    // with it: it stays, and feeds on his life
    const g = demon(wear(room('warlock'), 'unsignedpact'));
    g.hero.d.lifeRegen = 0;
    g.hero.pact = 0.001;
    const life = g.hero.life;
    wait(g, 2);
    assert.equal(g.hero.form, 'demon');
    assert.equal(g.hero.change ?? null, null);
    assert.ok(near(life - g.hero.life, g.hero.d.maxLife * T.pact.drain * 2, 0.05), `${life - g.hero.life}`);
    // a tap on him lets it go
    g.update(DT, { ...emptyControls(), change: true });
    assert.ok(g.hero.change && g.hero.change.to === 'man', 'at his word');
    // and it lets him go by itself when he has little left, never killing him
    const low = demon(wear(room('warlock'), 'unsignedpact'));
    low.hero.d.lifeRegen = 0;
    low.hero.pact = 0.001;
    low.hero.life = low.hero.d.maxLife * (T.pact.floor + 0.02);
    wait(low, 2);
    assert.ok(low.hero.life >= low.hero.d.maxLife * T.pact.floor - 1);
    assert.ok((low.hero.change && low.hero.change.to === 'man') || low.hero.form === 'man');
    // The Cloven Boots
    const b = wear(room('warlock'), 'clovenboots');
    assert.ok(b.hero.skills[2].r.cooldown > 0, 'as a man: its cooldown');
    demon(b);
    assert.equal(b.hero.skills[2].r.cooldown, 0, 'while the demon has him: none');
    swipe(b, 4, 0, 0.6);
    assert.equal(b.hero.skills[2].charges, 1);
  }));

// ---------------------------------------------------------------------------------------------
// THE TINKERER

test('The Second Whistle: one more Golem than she would have, each at full strength', () =>
  on(() => {
    const whistles = (g: Game, n: number): number => {
      for (let k = 0; k < n; k++) {
        ready(g);
        cast(g, 3, 0, 0, 1.2);
      }
      return I(g).golems.filter((q) => q.act !== 'down').length;
    };
    assert.equal(whistles(room('tinkerer'), 3), 1);
    assert.equal(whistles(wear(room('tinkerer'), 'secondwhistle'), 3), 2, 'two without Mark II');
    const g = wear(room('tinkerer'), 'secondwhistle');
    g.hero.talents = ['bombsaway', 'markii'];
    g.refresh();
    assert.equal(whistles(g, 3), 3, 'three with it');
    const at = I(g).golems.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`);
    assert.equal(new Set(at).size, 3, 'each in a place of its own');
    assert.equal(whistles(g, 1), 3, 'and no fourth');
  }));

test('The Sticky Wrench and The Foreman\'s Wrench: vials stick and burst a moment later, twice as wide; each Golem lobs one as well', () =>
  on(() => {
    const toss = (g: Game, secs: number): { m: number; edge: number; whole: number } => {
      steady(g);
      const m = dummy(g, 4, 0);
      const rad = SKILLS.vialtoss.radius * g.hero.skills[0].r.size;
      const edge = dummy(g, 4, rad * 1.7);
      tap(g, 4, 0, secs);
      const st = g.hero.d.stats;
      return { m: hurt(m), edge: hurt(edge), whole: Math.round(100 * g.hero.skills[0].r.dmgMult * (1 + (st.dmgPct + st.physPct) / 100)) };
    };
    const flight = TINKER_TUNE.toss.flight;
    const plain = toss(room('tinkerer'), flight + 0.2);
    assert.ok(plain.m === plain.whole && plain.edge === 0, 'a vial bursts as it lands, on what is in its ring');
    const g = wear(room('tinkerer'), 'stickywrench');
    const soon = toss(g, flight + 0.2);
    assert.equal(soon.m, 0, 'stuck: not yet');
    const g2 = wear(room('tinkerer'), 'stickywrench');
    const later = toss(g2, flight + T.sticky.fuse + 0.2);
    assert.equal(later.m, later.whole, 'a moment later it bursts, as hard as ever');
    assert.ok(later.edge > 0, 'twice as wide');
    // (it goes where what it stuck to goes)
    const g3 = wear(room('tinkerer'), 'stickywrench');
    steady(g3);
    const m3 = dummy(g3, 4, 0);
    const by = dummy(g3, 9, 0);
    tap(g3, 4, 0, flight + 0.1);
    m3.x += 5;
    wait(g3, T.sticky.fuse + 0.2);
    assert.ok(hurt(by) > 0, 'the vial went with it');
    // The Foreman's Wrench
    const f = wear(room('tinkerer'), 'foremanswrench');
    steady(f);
    cast(f, 3, 0, 0, 1.5);
    assert.equal(I(f).golems.length, 1);
    const ev = tap(f, 0, 5);
    const lobbed = I(f).vials as unknown as { foreman?: boolean; frac: number; x1: number; y1: number }[];
    assert.equal(lobbed.length, 2);
    assert.equal(lobbed.filter((v) => v.foreman).length, 1, 'her Golem lobs one as well');
    assert.equal(lobbed.find((v) => v.foreman)!.frac, lobbed.find((v) => !v.foreman)!.frac * T.foreman.share, 'its share of hers');
    assert.deepEqual([lobbed[1].x1, lobbed[1].y1], [lobbed[0].x1, lobbed[0].y1], 'at the same spot');
    ev.push(...wait(f, flight + 0.3));
    assert.equal(ev.filter((e) => e.t === 'vialBurst').length, 2, 'and both burst there');
    // (no Golem out: hers alone)
    const alone = wear(room('tinkerer'), 'foremanswrench');
    tap(alone, 0, 5);
    assert.equal(I(alone).vials.length, 1);
  }));

test('The Tow Line and The Company Scrip: her Golem rides the Blast Jump and lands with a ground pound; no cooldown, for gold', () =>
  on(() => {
    const g = wear(room('tinkerer'), 'towline');
    steady(g);
    cast(g, 3, 0, 0, 1.5);
    const golem = I(g).golems[0];
    const m = dummy(g, 7.5, 0);
    const ev = swipe(g, 6, 0, 0.8);
    assert.equal(seen(ev, 'towline', 'ride').length, 1);
    assert.ok(Math.hypot(golem.x - g.hero.x, golem.y - g.hero.y) < 2, 'it lands by her');
    assert.ok(ev.some((e) => e.t === 'golemPound'), 'with a ground pound');
    assert.ok(hurt(m) > 0);
    // The Company Scrip
    const s = wear(room('tinkerer'), 'companyscrip');
    const cost = Math.round(T.scrip.gold * Math.max(1, I(s).power));
    s.hero.gold = cost * 2;
    swipe(s, 5, 0, 0.6);
    assert.equal(s.hero.skills[2].charges, 1, 'no cooldown');
    assert.equal(s.hero.gold, cost);
    cast(s, 3, 0, 0, 0.3);
    assert.equal(s.hero.skills[1].charges, 1, 'nor her whistle\'s');
    assert.equal(s.hero.gold, 0, 'each use costs gold');
    swipe(s, -5, 0, 0.6);
    assert.equal(s.hero.skills[2].charges, 0, 'no gold: its cooldown, as ever');
  }));

// ---------------------------------------------------------------------------------------------
// THE BRAWLER

/** Presses in a row, a frame apart (t a tap, h a hold, s a swipe), aimed a step ahead of him; then `secs` of the game. */
function presses(g: Game, keys: string, secs: number): GameEvent[] {
  const ev: GameEvent[] = [];
  const step = (c: Controls): void => {
    g.update(DT, c);
    for (const e of g.events) ev.push(e);
    g.events.length = 0;
  };
  const aim = (): Controls => ({ ...emptyControls(), aimX: g.hero.x + 2, aimY: g.hero.y, castX: g.hero.x + 2, castY: g.hero.y });
  for (const k of keys) {
    const c = aim();
    if (k === 't') c.fire = true;
    if (k === 'h') c.cast = true;
    if (k === 's') {
      c.evade = true;
      c.evadeX = g.hero.x - 3;
      c.evadeY = g.hero.y;
    }
    step(c);
    step(aim());
  }
  for (let t = 0; t < secs; t += DT) step(aim());
  return ev;
}

test('The Last Round and The Fourth Globe: the third globe sets itself in fire, the jump not spent; his combos hold four', () =>
  on(() => {
    const p = room('brawler');
    presses(p, 'ttt', 0);
    assert.deepEqual(p.hero.vet!.globes, ['punch', 'punch', 'punch']);
    const g = wear(room('brawler'), 'lastround');
    presses(g, 'ttt', 0);
    assert.deepEqual(g.hero.vet!.globes, ['punch', 'punch', 'punchFire'], 'the third in fire');
    assert.equal(g.hero.skills[2].charges, 1, 'the jump not spent');
    const k = wear(room('brawler'), 'lastround');
    presses(k, 'tth', 0);
    assert.deepEqual(k.hero.vet!.globes, ['punch', 'punch', 'kickFire'], 'a hold: the flying knee');
    assert.equal(k.hero.vet!.queue[k.hero.vet!.queue.length - 1].id, 'knee');
    // The Fourth Globe
    assert.equal(p.vetMost(), 3);
    presses(p, 't', 0);
    assert.equal(p.hero.vet!.globes.length, 3, 'three, and locked');
    const f = wear(room('brawler'), 'fourthglobe');
    assert.equal(f.vetMost(), T.fourth.globes);
    presses(f, 'tttt', 0);
    assert.equal(f.hero.vet!.globes.length, 4, 'one more blow before the combo locks');
    presses(f, 't', 0);
    assert.equal(f.hero.vet!.globes.length, 4, 'and then it is locked');
    presses(f, '', 6);
    assert.equal(f.hero.vet!.globes.length, 0, 'played out, its globes go out');
  }));

test('The Winning Streak: every combo he finishes makes his blows hit harder; getting hit ends it', () =>
  on(() => {
    const g = wear(room('brawler'), 'winningstreak');
    steady(g);
    const m = dummy(g, 1.5, 0);
    presses(g, 'ttt', 5);
    assert.equal(g.uq.streak, 1, 'a combo finished');
    const first = hurt(m);
    m.life = m.maxLife;
    presses(g, 'ttt', 5);
    assert.equal(g.uq.streak, 2);
    assert.ok(near(hurt(m) / first, 1 + T.streak.each, 0.02), `the second combo, one finished behind it: ${hurt(m) / first}`);
    strike(g, 5);
    assert.equal(g.uq.streak, 0, 'a hit ends the streak');
    // (a combo not finished builds nothing)
    presses(g, 'tt', 4);
    assert.equal(g.uq.streak, 0);
  }));

test('The Sprung Heels and The Receipt: a second jump before he lands; a blow from in front answered with a free punch', () =>
  on(() => {
    const g = wear(room('brawler'), 'sprungheels');
    assert.equal(g.hero.skills[2].maxCharges, T.heels.jumps);
    ready(g);
    // one jump, and in the air, another
    presses(g, 's', 0);
    for (let n = 0; n < 60 && !(g.hero.vet!.move && g.hero.vet!.move.id === 'dodge' && g.hero.vet!.move.f >= VET_MOVES.dodge.air![0]); n++) presses(g, '', DT);
    assert.ok(g.hero.vet!.move && g.hero.vet!.move.id === 'dodge', 'in the air');
    const f = g.hero.vet!.move!.f;
    presses(g, 's', 0);
    assert.ok(g.hero.vet!.move && g.hero.vet!.move.id === 'dodge' && g.hero.vet!.move.f < f, 'a second jump, begun before he lands');
    assert.deepEqual(g.hero.vet!.globes, ['jump', 'jump']);
    assert.equal(g.hero.skills[2].charges, 0);
    // without them: one
    assert.equal(room('brawler').hero.skills[2].maxCharges, 1);
    // The Receipt
    const r = wear(room('brawler'), 'receipt');
    steady(r);
    const front = dummy(r, 1.5, 0);
    const back = dummy(r, -1.5, 0);
    const ev: GameEvent[] = [];
    strike(r, 10, front);
    ev.push(...r.events);
    r.events.length = 0;
    assert.equal(seen(ev, 'receipt', 'answer').length, 1);
    const st = r.hero.d.stats;
    const punch = Math.round(100 * r.hero.skills[0].r.dmgMult * T.receipt.share * (1 + (st.dmgPct + st.physPct) / 100));
    assert.ok(near(hurt(front), punch, 0.02), `${hurt(front)} against ${punch}`);
    wait(r, T.receipt.gap + 0.05);
    strike(r, 10, back);
    assert.equal(hurt(back), 0, 'a blow from behind is not answered');
  }));
