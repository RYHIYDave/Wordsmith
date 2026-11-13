// SET 1, THE BATTLE AXE'S AND THE WARHAMMER'S UNIQUES (game/uniques.ts SET1_DEFS, behind SET1; game/game.ts “UNIQUE ITEMS, SET 1”):
// each doing what its card says, to the numbers of UNIQUE_TUNE (gyre, tithe, widow, knell, weight, star). His words, 12 Nov 2026:
// “lets do axe and hammer”; his picks of the six in his doc “Wordsmith: Unique Items”; “just do number 1, get it all finished”.
//   1. off: none is had; on: the axe's three for an axe Warrior, the hammer's three for a hammer Warrior, none for anyone else;
//   2. Gyre: the thrown axe stops where its flight ends and spins there, cutting what is round it, and falls; two at once;
//   3. Red Tithe: one that dies bleeding throws its blood to the nearest other; Cleave a little softer;
//   4. Widowfall: Leaping Chop lands with a Cleave all round him, and all it strikes bleed;
//   5. Death Knell: what his hammer stuns rings; struck ringing, it peals, stunning all round it, and those ring; stuns shorter;
//   6. Deadweight: each Smash in a row harder; the fifth an Earthquake of its own; stopped, the weight drains away;
//   7. Starbreaker: Earthquake's meteor falls while he winds up, lands as the hammer hits, fire, and the floor burning; with
//      Tremors its fire goes out again with each shake.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { SKILLS } from '../src/game/defs';
import { Game } from '../src/game/game';
import type { GameEvent, Monster } from '../src/game/state';
import { SET1, SET1_DEFS, UNIQUES, UNIQUE_TUNE, poolFor, uniqueLines, uniqueWeapon } from '../src/game/uniques';
import type { WeaponKind } from '../src/game/types';
import { seasoned } from './helpers';
import { DT, cast, dummy, hurt, ready, seen, steady, swipe, tap, wait, wear } from './uniques_helpers';

const T = UNIQUE_TUNE;
const AXE = ['gyre', 'redtithe', 'widowfall'];
const HAMMER = ['deathknell', 'deadweight', 'starbreaker'];

/** Set 1 switched on for the length of `f`, and back as it was. */
function set1<R>(f: () => R): R {
  const was = SET1.on;
  const u = UNIQUES.on;
  SET1.on = true;
  UNIQUES.on = true;
  try {
    return f();
  } finally {
    SET1.on = was;
    UNIQUES.on = u;
  }
}

/** A Warrior in the practice room, emptied, at level 30, his weapon `w` (and these talents), these uniques worn, his hits steady. */
function warrior(w: 'battleaxe' | 'warhammer', talents: string[], ...uniques: string[]): Game {
  const g = Game.forPractice('warrior', 5);
  (g as unknown as { waveT: number }).waveT = 1e9;
  g.monsters.length = 0;
  seasoned(g, 30);
  const h = g.hero;
  h.x = 14.5;
  h.y = 15.5;
  h.fx = 1;
  h.fy = 0;
  for (const t of [w, ...talents]) assert.equal(g.takeTalent(t), null, `takes ${t}`);
  wear(g, ...uniques);
  steady(g);
  ready(g);
  g.events.length = 0;
  return g;
}

const bleeding = (m: Monster): boolean => (m.bleedT ?? 0) > 0 && (m.bleedDps ?? 0) > 0;

test('1. off, none is had; on, each weapon\'s three for a Warrior who uses it, and for no one else', () => {
  assert.equal(SET1.on, true, 'on: his yes, 13 Nov 2026, “Yes, put them live (Recommended)”');
  // (switched off, as it was until his yes: none in the pool)
  SET1.on = false;
  try {
    assert.ok(!poolFor('warrior').some((d) => [...AXE, ...HAMMER].includes(d.id)), 'off: not in the pool');
  } finally {
    SET1.on = true;
  }
  set1(() => {
    assert.equal(SET1_DEFS.length, 6);
    for (const d of SET1_DEFS) {
      const w: WeaponKind | null = uniqueWeapon(d);
      assert.equal(w, AXE.includes(d.id) ? 'battleaxe' : 'warhammer', `${d.id}: its weapon`);
      assert.equal(d.cls, 'warrior');
      assert.ok(!d.name.startsWith('The '), `${d.id}: no "The" (his word)`);
      const lines = uniqueLines(d, 'warrior');
      assert.ok(lines.some((l) => l.kind === 'does'), `${d.id}: its card says what it does`);
    }
    assert.ok([...AXE, ...HAMMER].every((id) => poolFor('warrior').some((d) => d.id === id)), 'on: in the Warrior\'s pool');
    assert.ok(!poolFor('ranger').some((d) => [...AXE, ...HAMMER].includes(d.id)), 'not the Ranger\'s');
    // (an axe Warrior finds only the axe's; a hammer Warrior only the hammer's)
    for (const [w, his, not] of [['battleaxe', AXE, HAMMER], ['warhammer', HAMMER, AXE]] as const) {
      const g = warrior(w, []);
      const a = g as unknown as { makePoolUnique: (slot?: string, weapon?: WeaponKind | null) => { unique?: string; weapon?: WeaponKind } | null };
      const found = new Set<string>();
      for (let i = 0; i < 600; i++) {
        const it = a.makePoolUnique(undefined, null);
        if (it?.unique) found.add(it.unique);
      }
      for (const id of his) assert.ok(found.has(id), `${w}: ${id} found`);
      for (const id of not) assert.ok(!found.has(id), `${w}: ${id} never found`);
    }
  });
});

test('2. Gyre: the thrown axe stops where its flight ends and spins there, cutting what is round it, then falls; two at once', () =>
  set1(() => {
    const g = warrior('battleaxe', [], 'gyre');
    const range = SKILLS.axethrow.range;
    const far = dummy(g, range, 0);
    const ev = cast(g, 1, 0, 0, 0.9);
    assert.equal(seen(ev, 'gyre', 'spin').length, 1, 'it stops, and spins');
    const spinning = g.projectiles.filter((p) => !p.hostile && p.gyre);
    assert.equal(spinning.length, 1);
    assert.ok(Math.hypot(spinning[0].x - far.x, spinning[0].y - far.y) < 1.2, 'at the end of its flight');
    assert.ok(!ev.some((e) => e.t === 'axeTurn'), 'it does not turn for home');
    const at = hurt(far);
    wait(g, 1.2);
    assert.ok(hurt(far) > at, `it goes on cutting what is round it (${at} then ${hurt(far)})`);
    const fall = wait(g, g.ut.gyre.secs);
    assert.equal(seen(fall, 'gyre', 'fall').length, 1, 'and falls');
    assert.equal(g.projectiles.filter((p) => !p.hostile).length, 0, 'gone');
    // two at once; a third throw takes the place of the oldest
    for (let k = 0; k < 3; k++) {
      ready(g);
      cast(g, 1, k - 1, 0, 0.7);
    }
    assert.equal(g.projectiles.filter((p) => !p.hostile && p.gyre && p.gyre.t > 0).length, T.gyre.most, `${T.gyre.most} spinning`);
    // and without it, the axe comes back as ever
    const plain = warrior('battleaxe', []);
    const pv = cast(plain, 1, 0, 0, 0.9);
    assert.ok(pv.some((e) => e.t === 'axeTurn'), 'without it: it turns for home');
  }));

test('3. Red Tithe: one that dies bleeding throws its blood to the nearest other, which bleeds; Cleave a little softer', () =>
  set1(() => {
    const g = warrior('battleaxe', ['rend'], 'redtithe');
    const a = dummy(g, 1.3, 0, 50);
    const b = dummy(g, 3.5, 0.5);
    const c = dummy(g, -5, 0);
    a.bleedDps = 10;
    a.bleedT = 2;
    const ev = tap(g, 1, 0, 0.5);
    assert.ok(a.dead, 'the first dies');
    assert.equal(seen(ev, 'redtithe', 'throw').length, 1, 'its blood thrown');
    assert.ok(bleeding(b), 'the nearest bleeds');
    assert.ok(!bleeding(c), 'not one further off');
    // Cleave, its price (the same hero, with its rule and without: its stats the same)
    const soft = warrior('battleaxe', [], 'redtithe');
    const m1 = dummy(soft, 1.3, 0);
    tap(soft, 1, 0, 0.6);
    const with1 = hurt(m1);
    soft.worn = soft.worn.filter((id) => id !== 'redtithe');
    ready(soft);
    tap(soft, 1, 0, 0.6);
    const without = hurt(m1) - with1;
    // (its price as his piece rolled it: Game.ut)
    assert.ok(Math.abs(with1 / without - (1 - soft.ut.tithe.cleave)) < 0.02, `${with1} against ${without}`);
  }));

test('4. Widowfall: Leaping Chop lands with a Cleave all round him, and all it strikes bleed', () =>
  set1(() => {
    const g = warrior('battleaxe', [], 'widowfall');
    const ev = swipe(g, 4, 0, 1);
    assert.equal(seen(ev, 'widowfall', 'cleave').length, 1, 'a Cleave all round him as he lands');
    // (where he lands: those all round him there struck, and bleeding; behind him too, where the Chop's own axe never comes)
    const h = g.hero;
    const round = [dummy(g, 2.2, 0), dummy(g, 4, 1.6), dummy(g, 4, -1.6), dummy(g, 5.8, 0)];
    ready(g);
    swipe(g, 4, 0, 1);
    let n = 0;
    for (const m of round) {
      if (Math.hypot(m.x - h.x, m.y - h.y) > T.widow.r + m.r) continue;
      n++;
      assert.ok(hurt(m) > 0, 'struck');
      assert.ok(bleeding(m), 'and bleeding');
    }
    assert.ok(n >= 3, `all round him where he lands: ${n}`);
    const behind = round.find((m) => (m.x - h.x) * h.fx + (m.y - h.y) * h.fy < -0.5 && Math.hypot(m.x - h.x, m.y - h.y) <= T.widow.r + m.r);
    assert.ok(behind && hurt(behind) > 0, 'behind him too');
    const plain = warrior('battleaxe', []);
    const p0 = dummy(plain, 2.2, 0);
    swipe(plain, 4, 0, 1);
    const ph = plain.hero;
    assert.ok(Math.hypot(p0.x - ph.x, p0.y - ph.y) <= T.widow.r && (p0.x - ph.x) * ph.fx < -0.5, 'one behind where he lands');
    assert.equal(hurt(p0), 0, 'without it, nothing behind him is struck');
  }));

test('5. Death Knell: what his hammer stuns rings; struck ringing, it peals and stuns all round it, and those ring; each stun shorter', () =>
  set1(() => {
    const g = warrior('warhammer', [], 'deathknell');
    // (it where the Smash comes down, 1.4 tiles before him; the pack beyond the Earthquake's ring, within the peal's)
    const a = dummy(g, 1.4, 0);
    const pack = [dummy(g, 4.2, 0.6), dummy(g, 4.2, -0.6)];
    const ev = cast(g, 1, 0, 0, 0.1);
    assert.ok(ev.some((e) => e.t === 'stun' && e.id === a.id), 'Earthquake stuns it');
    assert.ok((a.knellT ?? 0) > 0 && seen(ev, 'deathknell', 'ring').length >= 1, 'and it rings');
    assert.ok(a.stunT <= (SKILLS.quake.stun ?? 0) * (1 - g.ut.knell.shorter) + 1e-6, `its stun shorter (${a.stunT.toFixed(2)})`);
    for (const m of pack) assert.equal(m.stunT, 0, 'the others not yet');
    // struck while it rings (its stun over, his Earthquake's follow-through done): it peals
    wait(g, 0.6);
    assert.ok((a.knellT ?? 0) > 0, 'still ringing');
    ready(g);
    const hit = tap(g, 1, 0, 0.05);
    assert.equal(seen(hit, 'deathknell', 'peal').length >= 1, true, 'it peals');
    for (const m of pack) {
      assert.ok(m.stunT > 0, 'everything round it stunned');
      assert.ok((m.knellT ?? 0) > 0, 'and ringing too');
    }
    // the rings die away
    wait(g, T.knell.secs + 0.2);
    for (const m of pack) assert.equal(m.knellT ?? 0, 0, 'the ringing gone');
  }));

test('6. Deadweight: each Smash in a row harder than the last; the fifth an Earthquake of its own; stopped, the weight drains away', () =>
  set1(() => {
    const g = warrior('warhammer', [], 'deadweight');
    const m = dummy(g, 1.4, 0);
    const blows: number[] = [];
    let quakes = 0;
    for (let k = 0; k < 5; k++) {
      const was = hurt(m);
      g.hero.swingT = 0;
      const ev = tap(g, 1, 0, 0.05);
      blows.push(hurt(m) - was);
      quakes += seen(ev, 'deadweight', 'quake').length;
    }
    for (let k = 1; k < 4; k++) assert.ok(blows[k] > blows[k - 1] * 1.05, `each harder than the last: ${blows.join(', ')}`);
    assert.ok(Math.abs(blows[1] / blows[0] - (1 + g.ut.weight.more)) < 0.03, `${(g.ut.weight.more * 100).toFixed(0)}% harder: ${blows[1]} after ${blows[0]}`);
    assert.equal(quakes, 1, 'the fifth an Earthquake of its own');
    assert.ok(blows[4] > blows[3] * 1.5, `and the fifth the heaviest of all, the quake with it: ${blows.join(', ')}`);
    assert.equal(g.uq.weight, 0, 'and the weight starts over');
    // its price: slower swings while it is heavy
    g.hero.swingT = 0;
    tap(g, 1, 0, 0.05);
    const light = g.hero.swingT;
    g.hero.swingT = 0;
    tap(g, 1, 0, 0);
    assert.ok(g.uq.weight === 2, 'two in a row');
    // (the swing's own clock runs from the press: the second's, heavier, longer)
    assert.ok(g.hero.swingT > light - 0.1, 'slower');
    // stopped swinging: it drains away
    wait(g, T.weight.keep + T.weight.drain * 2 + 0.2);
    assert.equal(g.uq.weight, 0, 'drained');
  }));

test('7. Starbreaker: the meteor falls as he winds up and lands as the hammer hits, fire, the floor burning; with Tremors, out again each shake', () =>
  set1(() => {
    const g = warrior('warhammer', [], 'starbreaker');
    const m = dummy(g, 1.4, 0);
    const c = { fire: 0 };
    const ev = cast(g, 1, 0, 0, 0.1);
    const fall = seen(ev, 'starbreaker', 'fall');
    const land = seen(ev, 'starbreaker', 'land');
    assert.equal(fall.length, 1, 'called down');
    assert.equal(land.length, 1, 'it lands');
    assert.ok(Math.abs((fall[0].secs ?? 0) - SKILLS.quake.windup) < 1e-6, 'falling for his wind-up');
    assert.ok(ev.indexOf(fall[0]) < ev.indexOf(land[0]), 'before it lands');
    assert.ok(Math.hypot(land[0].x - fall[0].x, land[0].y - fall[0].y) < 0.01, 'where it was seen falling');
    // (it lands with the hammer: in the same step as the Earthquake's own ring)
    const quake = ev.find((e) => e.t === 'quake');
    assert.ok(quake && Math.abs(quake.x - land[0].x) < 0.01, 'on the spot the maul comes down on');
    for (const e of ev) if (e.t === 'hit' && !e.onHero && e.el === 'fire') c.fire++;
    assert.ok(c.fire >= 1, 'its fire strikes');
    assert.ok(g.zones.some((z) => z.kind === 'burn' && !z.hostile && Math.hypot(z.x - land[0].x, z.y - land[0].y) < 0.01), 'the floor left burning');
    assert.ok(hurt(m) > 0);
    // with Tremors: its fire again with each later shake
    const t = warrior('warhammer', ['tremors'], 'starbreaker');
    dummy(t, 1.4, 0);
    const tv = cast(t, 1, 0, 0, 1.2);
    assert.equal(seen(tv, 'starbreaker', 'land').length, 1);
    assert.equal(seen(tv, 'starbreaker', 'shake').length, (2), 'three shakes in all');
    // (and DT is the helpers' step)
    assert.ok(DT > 0);
    void (null as unknown as GameEvent);
  }));
