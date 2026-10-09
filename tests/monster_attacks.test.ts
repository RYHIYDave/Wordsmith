// THE MONSTERS' ATTACKS (Version 19.8; src/game/defs.ts MONSTER_ATTACKS, MONSTER_MOVES, CHARGE, SUMMON;
// src/game/game.ts pickMove, startMove, landMove, runCharge, callDead; src/render/figure.ts moveFrame;
// src/art/bestiary.ts useMonsterAttacks). The owner, 9 Oct 2026, 08:15: "Tiny and small mobs should
// have one attack.  Medium two attacks, large 2-3, and the boss 4.  They should always have a basic,
// single target attack.  That way when their big telegraphed slams or spells go on cooldown, and they
// have their mace swing or magic missile to use in between.  The bigger the hit, the longer the
// cooldown." His yes to the moves: the green troll a club swing and its slam; the red troll a club
// swing, the slam and a charge along a marked line; the boss a swing, his slam, his fan of bolts and
// his skeleton summon as his fourth. The pictures are the art chat's (art/monster-attacks), with his yes.
// On since Version 19.8, his yes by 12:48 to films of them in the game: "Yes, as shown (Recommended)".
// So:
//   1. the switch is on in the game, the pictures with it; switched off, no monster has moves, and
//      each attacks as it did;
//   2. his rules, in the moves: tiny and small one attack (their own), medium two, large two or three,
//      the boss four; the first a basic blow at one, with no ground warning; the bigger the hit, the
//      longer the cooldown;
//   3. each move lands when its picture's blow does;
//   4. a green troll swings while its slam cools down, and slams no sooner than the slam's cooldown;
//   5. the red troll charges along a line laid on the floor: whoever stands in it when he comes is run
//      down, once, and knocked out of his way; whoever steps out of it is not; he pulls up at its end
//      and the line goes; a stun breaks it off; with a wall between, he does not charge;
//   6. the Warden swings beside the hero, shoots his bolts from afar, slams no sooner than its cooldown,
//      and calls the dead as an attack of its own: they crawl out of the ground, not among the monsters
//      (not to be hit, doing nothing) till they are out; with the switch off he calls them only as his
//      life runs down;
//   7. the pictures: each move shown with its own clip, its blow in the step the rules land theirs; the
//      charge's run goes round; the dead have their crawl; the new moves are painted ahead;
//   8. the bot steps out of a charge's line.
//   run: tsx --test tests/monster_attacks.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import type { AnimSet, Clip } from '../src/art/actor_types';
import { figureOf, makeBestiary, useMonsterAttacks } from '../src/art/bestiary';
import type { MonsterFigure } from '../src/art/bestiary';
import { CRAWL_OUT, CRAWL_TIME } from '../src/art/mkit';
import { CHARGE_GO, SWING_HIT, TROLL_MOVES } from '../src/art/monster_brute';
import { SUMMON_RISE, WARDEN_MOVES, WARDEN_SWING_HIT } from '../src/art/monster_warden';
import { botStep, newBot } from '../src/dev/bot';
import type { Sprite } from '../src/engine/px';
import { RNG } from '../src/engine/rng';
import { CHARGE, MONSTERS, MONSTER_ATTACKS, MONSTER_MOVES, SUMMON, TUNE, movesOf, sizeOf } from '../src/game/defs';
import type { MonsterMove, MoveId } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import type { MonsterKind } from '../src/game/types';
import { moveClip, moveFrame } from '../src/render/figure';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

type Which = 'brute' | 'guardian' | 'warden';
interface Room {
  g: Game;
  m: Monster;
  hooks: Hooks;
}
interface Hooks {
  waveT: number;
  spawn(kind: MonsterKind, x: number, y: number, pack: number, rank: 0 | 1 | 2, boss: boolean, rng: RNG): Monster;
  wakeUp(m: Monster): void;
  stunMonster(m: Monster, secs: number): void;
}

/** An empty practice room, a hero who stands still, and the monster `far` tiles to the west of them, awake, its words taken off and not to be killed. */
function room(which: Which, far: number, seed = 9): Room {
  const g = Game.forPractice('warrior', 5);
  const hooks = g as unknown as Hooks;
  hooks.waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  const m = hooks.spawn(which === 'warden' ? 'warden' : 'brute', h.x - far, h.y, 1, which === 'guardian' ? 2 : 0, which === 'warden', new RNG(seed));
  hooks.wakeUp(m);
  m.words = [];
  m.shield = 0;
  m.life = m.maxLife = 1e9;
  return { g, m, hooks };
}

/** What a monster began, step by step: each move's id and when it began (seconds), and whether a red circle went down with it. */
interface Began {
  id: MoveId;
  at: number;
  circle: boolean;
}

/** Plays the room on for `secs`, the hero's life put back each step; what was begun, and the harm taken in each move's landing (or charge). */
function play(r: Room, secs: number, each?: (k: number) => void): { began: Began[]; harm: { id: MoveId; lost: number }[] } {
  const { g, m } = r;
  const h = g.hero;
  const c = emptyControls();
  const dt = 1 / 60;
  const began: Began[] = [];
  const harm: { id: MoveId; lost: number }[] = [];
  const moves = movesOf(m);
  let was = m.state;
  for (let k = 0; k < Math.round(secs * 60); k++) {
    const before = h.life;
    g.update(dt, c);
    const lost = before - h.life;
    h.life = h.d.maxLife;
    if (moves && m.state === 'windup' && was !== 'windup' && m.move !== undefined && m.move >= 0) {
      began.push({ id: moves[m.move].id, at: k * dt, circle: g.zones.some((z) => z.kind === 'warn' && z.src === m.id) });
    }
    if (lost > 0 && moves && m.move !== undefined && m.move >= 0 && !/Skeleton/.test(g.slainBy)) harm.push({ id: moves[m.move].id, lost });
    was = m.state;
    each?.(k);
  }
  return { began, harm };
}

const FIGURES: Which[] = ['brute', 'guardian', 'warden'];

test('the switch is on in the game, the pictures with it; switched off, no monster has moves, and each attacks as it did', () => {
  assert.equal(MONSTER_ATTACKS.on, true, 'MONSTER_ATTACKS is on');
  assert.equal(TROLL_MOVES.on, true, "and the trolls' new pictures with it");
  assert.equal(WARDEN_MOVES.on, true, "and the Warden's");
  assert.equal(CRAWL_OUT.on, true, 'and the dead crawling out');
  const game = makeBestiary();
  for (const f of ['brute', 'guardian', 'warden', 'skeleton'] as MonsterFigure[]) assert.ok(game.of(f).front.clips?.moves, `${f}: its new moves are painted in the game`);
  useMonsterAttacks(false);
  try {
    assert.equal(TROLL_MOVES.on || WARDEN_MOVES.on || CRAWL_OUT.on, false, 'switched off, the pictures go with it');
    for (const kind of Object.keys(MONSTERS) as MonsterKind[]) {
      assert.equal(movesOf({ kind, champion: false }), null, `${kind}: no moves`);
      assert.equal(movesOf({ kind, champion: true }), null, `${kind}, a guardian's rank: no moves`);
    }
    // (a green troll beside the hero brings its slam down, the red circle first, as it always has)
    const r = room('brute', 1);
    let circle = false;
    for (let k = 0; k < 180 && !circle; k++) {
      r.g.update(1 / 60, emptyControls());
      circle = r.g.zones.some((z) => z.kind === 'warn');
    }
    assert.ok(circle, 'switched off, its one attack is the slam, its red circle first');
    // (and the art made with the switch off has none of the new pictures)
    const beasts = makeBestiary();
    for (const f of ['brute', 'guardian', 'warden', 'skeleton'] as MonsterFigure[]) assert.equal(beasts.of(f).front.clips?.moves, undefined, `${f}: no new moves painted`);
  } finally {
    useMonsterAttacks(true);
  }
});

test('his rules: tiny and small one attack, medium two, large two or three, the boss four; a basic blow first; the bigger the hit, the longer the cooldown', () => {
  useMonsterAttacks(true);
  assert.equal(MONSTER_ATTACKS.on && TROLL_MOVES.on && WARDEN_MOVES.on && CRAWL_OUT.on, true, 'the rules and the pictures go on together');
  const want = { tiny: [1, 1], small: [1, 1], medium: [2, 2], large: [2, 3], boss: [4, 4] };
  for (const kind of Object.keys(MONSTERS) as MonsterKind[]) {
    for (const champion of kind === 'brute' ? [false, true] : [false]) {
      const size = sizeOf(kind, champion);
      const moves = movesOf({ kind, champion });
      // (one that has no moves has its one attack, as before)
      const n = moves ? moves.length : 1;
      const what = `${kind}${champion ? ' (a guardian: the red troll)' : ''}, ${size}`;
      assert.ok(n >= want[size][0] && n <= want[size][1], `${what}: ${n} attacks (his rule: ${want[size].join(' to ')})`);
      if (!moves) continue;
      const first = moves[0];
      assert.equal(first.id, 'swing', `${what}: the first is the basic blow, a swing`);
      assert.equal(first.cooldown, 0, `${what}: the basic blow has no cooldown of its own: it is used between the big ones`);
      assert.equal(first.far, 0, `${what}: it reaches no further than the monster's own reach`);
      for (let i = 1; i < moves.length; i++) assert.ok(moves[i].cooldown > moves[i - 1].cooldown, `${what}: ${moves[i].id} cools down longer (${moves[i].cooldown} s) than ${moves[i - 1].id} (${moves[i - 1].cooldown} s)`);
      for (const mv of moves.slice(1)) assert.ok(mv.dmg > first.dmg || mv.id === 'bolts' || mv.id === 'summon', `${what}: ${mv.id} hits harder than the swing`);
    }
  }
  // the moves he said yes to
  const ids = (list: readonly MonsterMove[]): string => list.map((mv) => mv.id).join(' ');
  assert.equal(ids(MONSTER_MOVES.brute), 'swing slam', 'the green troll: a club swing and its slam');
  assert.equal(ids(MONSTER_MOVES.guardian), 'swing slam charge', 'the red troll: a club swing, the slam and a charge');
  assert.equal(ids(MONSTER_MOVES.warden), 'swing bolts slam summon', 'the boss: a swing, his bolts, his slam and his summon');
  assert.equal(movesOf({ kind: 'brute', champion: false }), MONSTER_MOVES.brute);
  assert.equal(movesOf({ kind: 'brute', champion: true }), MONSTER_MOVES.guardian);
  assert.equal(movesOf({ kind: 'warden', champion: false }), MONSTER_MOVES.warden);
});

test('each move lands when its picture says: the swings, the charge setting off, the dead rising; the slams and the bolts as they were', () => {
  useMonsterAttacks(true);
  const of = (list: readonly MonsterMove[], id: MoveId): MonsterMove => {
    const mv = list.find((x) => x.id === id);
    if (!mv) throw new Error(`no ${id}`);
    return mv;
  };
  assert.equal(of(MONSTER_MOVES.brute, 'swing').windup, SWING_HIT);
  assert.equal(of(MONSTER_MOVES.guardian, 'swing').windup, SWING_HIT);
  assert.equal(of(MONSTER_MOVES.guardian, 'charge').windup, CHARGE_GO);
  assert.equal(of(MONSTER_MOVES.warden, 'swing').windup, WARDEN_SWING_HIT);
  assert.equal(of(MONSTER_MOVES.warden, 'summon').windup, SUMMON_RISE);
  assert.equal(of(MONSTER_MOVES.brute, 'slam').windup, MONSTERS.brute.windup);
  assert.equal(of(MONSTER_MOVES.guardian, 'slam').windup, MONSTERS.brute.windup);
  assert.equal(of(MONSTER_MOVES.warden, 'slam').windup, MONSTERS.warden.windup);
  assert.equal(of(MONSTER_MOVES.warden, 'bolts').windup, TUNE.wardenVolleyWindup);
  assert.equal(SUMMON.rise, CRAWL_TIME, 'the dead are out of the ground when their picture says');
});

test('a green troll swings while its slam cools down, and slams no sooner than the cooldown allows', () => {
  useMonsterAttacks(true);
  const r = room('brute', 1);
  const slam = MONSTER_MOVES.brute[1];
  const { began, harm } = play(r, 40);
  assert.ok(began.length >= 10, `it fought on (${began.length} moves)`);
  assert.equal(began[0].id, 'swing', 'it opens with its basic blow');
  const slams = began.filter((b) => b.id === 'slam');
  assert.ok(slams.length >= 3, `it slams (${slams.length} times in 40 s)`);
  for (let i = 1; i < slams.length; i++) assert.ok(slams[i].at - slams[i - 1].at >= slam.cooldown, `slams ${(slams[i].at - slams[i - 1].at).toFixed(2)} s apart (its cooldown: ${slam.cooldown} s)`);
  for (let i = 1; i < slams.length; i++) assert.ok(began.some((b) => b.id === 'swing' && b.at > slams[i - 1].at && b.at < slams[i].at), 'a swing between two slams');
  for (const b of began) assert.equal(b.circle, b.id === 'slam', `${b.id} at ${b.at.toFixed(2)} s: ${b.id === 'slam' ? 'its red circle' : 'no red circle: a blow at one'}`);
  assert.ok(harm.some((x) => x.id === 'swing'), 'the swing hurts the hero beside it');
  assert.ok(harm.some((x) => x.id === 'slam'), 'and so does the slam, on one who stands in its circle');
});

test('the red troll charges along a line on the floor: run down if you stand in it, not if you step out; he pulls up at its end, and the line goes', () => {
  useMonsterAttacks(true);
  // (1) the hero stands in it
  {
    const r = room('guardian', 6);
    const { g, m } = r;
    const h = g.hero;
    const at = { x: h.x, y: h.y };
    let laid = false;
    let ran = false;
    let hits = 0;
    let lane: { x: number; y: number; x1: number; y1: number; r: number } | null = null;
    let fill = -1;
    let filled = true;
    for (let k = 0; k < 240; k++) {
      const before = h.life;
      g.update(1 / 60, emptyControls());
      const z = g.zones.find((o) => o.kind === 'lane' && o.src === m.id);
      if (z && m.state === 'windup') {
        if (!laid) lane = { x: z.x, y: z.y, x1: z.x1 ?? z.x, y1: z.y1 ?? z.y, r: z.r };
        laid = true;
        const kk = z.t / z.dur;
        if (kk < fill - 1e-9) filled = false;
        fill = kk;
      }
      if (m.state === 'charge') {
        ran = true;
        assert.ok(!!z, 'its line is there while he runs it');
        if (before > h.life) hits++;
      }
      if (ran && m.state !== 'charge') break;
    }
    assert.ok(laid && lane, 'his line was laid on the floor as he wound up');
    if (!lane) return;
    assert.ok(filled && fill > 0.95, `it filled as his wind-up ran out (to ${fill.toFixed(2)})`);
    const len = Math.hypot(lane.x1 - lane.x, lane.y1 - lane.y);
    const toHero = Math.hypot(at.x - lane.x, at.y - lane.y);
    assert.ok(len > toHero + 0.3, `it runs past where the hero stood (${len.toFixed(2)} tiles; the hero ${toHero.toFixed(2)} off)`);
    assert.equal(lane.r, CHARGE.half);
    assert.ok(ran, 'he ran it');
    assert.equal(hits, 1, 'the hero standing in it was run down, once');
    const aside = Math.abs((h.x - lane.x) * -(lane.y1 - lane.y) / len + (h.y - lane.y) * (lane.x1 - lane.x) / len);
    assert.ok(aside > lane.r, `and knocked out of his way (${aside.toFixed(2)} tiles from the middle of the line)`);
    assert.equal(m.state, 'recover', 'at its end he pulls up');
    assert.ok(!g.zones.some((o) => o.kind === 'lane'), 'and the line is gone');
    const along = (m.x - lane.x) * (lane.x1 - lane.x) / len + (m.y - lane.y) * (lane.y1 - lane.y) / len;
    assert.ok(along > toHero, `he ran past where the hero stood (${along.toFixed(2)} tiles down it)`);
  }
  // (2) the hero steps out of it
  {
    const r = room('guardian', 6);
    const { g, m } = r;
    const h = g.hero;
    let stepped = false;
    let hits = 0;
    let ran = false;
    for (let k = 0; k < 240; k++) {
      if (!stepped && m.state === 'windup' && g.zones.some((o) => o.kind === 'lane')) {
        h.y += 2;
        stepped = true;
      }
      const before = h.life;
      g.update(1 / 60, emptyControls());
      if (m.state === 'charge') {
        ran = true;
        if (before > h.life) hits++;
      }
      if (ran && m.state !== 'charge') break;
    }
    assert.ok(stepped && ran, 'he wound up and ran');
    assert.equal(hits, 0, 'the hero who stepped out of his line was not run down');
  }
  // (3) a stun breaks it off, and its line with it
  {
    const r = room('guardian', 6);
    const { g, m, hooks } = r;
    let broke = false;
    for (let k = 0; k < 240 && !broke; k++) {
      g.update(1 / 60, emptyControls());
      if (m.state === 'windup' && g.zones.some((o) => o.kind === 'lane')) {
        hooks.stunMonster(m, 1);
        broke = true;
      }
    }
    assert.ok(broke, 'he wound up a charge');
    assert.ok(m.state !== 'windup' && m.state !== 'charge', `stunned, he does not run it (${m.state})`);
    assert.ok(!g.zones.some((o) => o.kind === 'lane'), 'and its line is gone');
  }
  // (4) with a wall between, he has no clear run, and does not charge
  {
    const r = room('guardian', 6);
    const { g, m } = r;
    const L = g.level;
    const f = L.floor;
    const wx = Math.floor((m.x + g.hero.x) / 2);
    for (let y = Math.floor(m.y) - 1; y <= Math.floor(m.y) + 1; y++) L.walk[y * f.w + wx] = 0;
    let lane = false;
    for (let k = 0; k < 40; k++) {
      g.update(1 / 60, emptyControls());
      if (g.zones.some((o) => o.kind === 'lane')) lane = true;
    }
    assert.ok(!lane, 'with a wall between, no line is laid');
  }
});

test('the Warden: his swing beside you, his bolts from afar, his slam not overused, and the dead called as an attack, crawling out of the ground', () => {
  useMonsterAttacks(true);
  const slam = MONSTER_MOVES.warden[2];
  {
    const r = room('warden', 2.4);
    const { g, m } = r;
    let rose: { at: number; n: number; among: number; aimed: boolean } | null = null;
    let joined = -1;
    const { began, harm } = play(r, 40, (k) => {
      if (!rose && g.risers.length > 0) {
        const ids = new Set(g.risers.map((o) => o.m.id));
        const aim = g.nearAssist(12);
        rose = { at: k / 60, n: g.risers.length, among: g.monsters.filter((o) => ids.has(o.id)).length, aimed: !!aim && ids.has(aim.id) };
      }
      if (rose && joined < 0 && g.risers.length === 0) joined = g.monsters.filter((o) => o !== m && o.kind === 'skeleton').length;
    });
    const ids = new Set(began.map((b) => b.id));
    assert.ok(ids.has('swing') && ids.has('slam') && ids.has('summon'), `beside him: his swing, his slam and his summon (${[...ids].join(', ')})`);
    assert.equal(began[0].id, 'swing', 'he opens with his swing');
    const slams = began.filter((b) => b.id === 'slam');
    for (let i = 1; i < slams.length; i++) assert.ok(slams[i].at - slams[i - 1].at >= slam.cooldown, `slams ${(slams[i].at - slams[i - 1].at).toFixed(2)} s apart (its cooldown: ${slam.cooldown} s)`);
    assert.ok(began.filter((b) => b.id === 'swing').length > slams.length, 'he swings more often than he slams');
    assert.ok(harm.some((x) => x.id === 'swing'), 'his swing hurts');
    assert.ok(rose !== null, 'the dead came up');
    if (rose) {
      const rr: { at: number; n: number; among: number; aimed: boolean } = rose;
      assert.equal(rr.n, SUMMON.count, `${SUMMON.count} of them`);
      assert.equal(rr.among, 0, 'not among the monsters while they crawl out');
      assert.equal(rr.aimed, false, 'nor aimed at');
    }
    assert.equal(joined, SUMMON.count, 'out of the ground, they join the fight');
  }
  {
    const r = room('warden', 7);
    r.m.speed = 0;
    const { began } = play(r, 12);
    assert.ok(began.some((b) => b.id === 'bolts'), `from afar, his bolts (${began.map((b) => b.id).join(', ')})`);
    assert.ok(!began.some((b) => b.id === 'swing' || b.id === 'slam'), 'and nothing of his that reaches no further than his maul');
  }
});

test('the dead he calls are no more than a picture till they are out: not hit, not hitting, not walking', () => {
  useMonsterAttacks(true);
  const r = room('warden', 2.4);
  const { g, m } = r;
  const h = g.hero;
  (g as unknown as { callDead(m: Monster): void }).callDead(m);
  assert.equal(g.risers.length, SUMMON.count);
  const at = g.risers.map((o) => ({ x: o.m.x, y: o.m.y, life: o.m.life }));
  // (the hero swings at the nearest of them while they come up)
  const near = g.risers[0].m;
  h.x = near.x + 0.6;
  h.y = near.y;
  m.speed = 0;
  m.cd = 99;
  const before = h.life;
  const used = h.skills[0].uses;
  const c = emptyControls();
  for (let k = 0; k < Math.round((SUMMON.rise - 0.05) * 60); k++) {
    c.fire = k % 20 === 0;
    c.aimX = near.x;
    c.aimY = near.y;
    g.update(1 / 60, c);
  }
  g.risers.forEach((o, i) => {
    assert.ok(Math.hypot(o.m.x - at[i].x, o.m.y - at[i].y) < 1e-9, 'it does not walk while it comes up');
    assert.equal(o.m.life, at[i].life, 'nor is it hurt');
  });
  assert.ok(h.life >= before, 'nor does it hurt the hero');
  assert.ok(h.skills[0].uses > used, `(the hero did swing at them: ${h.skills[0].uses - used} times)`);
});

test('with the switch off the Warden calls the dead only as his life runs down, and they appear at once', () => {
  useMonsterAttacks(false);
  try {
    const r = room('warden', 2.4);
    const { g, m } = r;
    m.life = m.maxLife = 1000;
    let called = 0;
    for (let k = 0; k < 20 * 60; k++) {
      const n = g.monsters.filter((o) => o.kind === 'skeleton').length;
      g.update(1 / 60, emptyControls());
      g.hero.life = g.hero.d.maxLife;
      if (g.monsters.filter((o) => o.kind === 'skeleton').length > n) called++;
    }
    assert.equal(called, 0, 'at full life, in 20 s, he calls none');
    assert.equal(g.risers.length, 0);
    m.life = 600;
    for (let k = 0; k < 30; k++) g.update(1 / 60, emptyControls());
    assert.ok(g.monsters.filter((o) => o.kind === 'skeleton').length > 0, 'below two thirds of his life, they are there at once');
    assert.equal(g.risers.length, 0, 'not crawling out of the ground');
  } finally {
    useMonsterAttacks(true);
  }
});

test("the pictures: each move shown with its own clip, its blow in the step the rules land theirs; the run goes round; the dead have their crawl; and they are painted ahead", () => {
  useMonsterAttacks(true);
  const beasts = makeBestiary();
  const dt = 1 / 60;
  for (const which of FIGURES) {
    const r = room(which, which === 'guardian' ? 6 : which === 'warden' ? 2.4 : 1);
    const { g, m } = r;
    const moves = movesOf(m);
    assert.ok(moves, `${which}: has moves`);
    if (!moves) continue;
    const art = beasts.of(figureOf(m));
    const seen = new Set<MoveId>();
    let was = m.state;
    let runFrames = new Set<Sprite>();
    for (let k = 0; k < 40 * 60; k++) {
      g.update(dt, emptyControls());
      g.hero.life = g.hero.d.maxLife;
      if (m.move === undefined || m.move < 0) {
        was = m.state;
        continue;
      }
      const mv = moves[m.move];
      const set: AnimSet = m.fx + m.fy < -0.2 ? art.back : art.front;
      const what = `${which}'s ${mv.id}`;
      if (m.state === 'charge') {
        const run = set.clips?.moves?.charge;
        assert.ok(run, `${what}: the run is painted`);
        const s = moveFrame(set, m, mv);
        assert.ok(s && run && run.frames.includes(s), `${what}: he is shown running`);
        if (s) runFrames.add(s);
      } else if (m.state === 'windup' || (m.state === 'recover' && m.anim === 'attack' && mv.id !== 'charge')) {
        const c = moveClip(set, mv) as Clip;
        assert.ok(c && c.hit !== undefined, `${what}: has a clip, with its blow`);
        const s = moveFrame(set, m, mv);
        const i = s ? c.frames.indexOf(s) : -1;
        const blow = Math.round((c.hit ?? 0) * c.fps);
        assert.ok(i >= 0, `${what}: a frame of its own clip is shown`);
        if (m.state === 'windup') assert.ok(i < blow, `${what}: winding up, the picture is short of its blow (${i}; the blow ${blow})`);
        else if (was === 'windup') {
          assert.equal(i, blow, `${what}: in the step it lands, the picture is on its blow`);
          seen.add(mv.id);
        }
      } else if (m.state === 'recover' && mv.id === 'charge') {
        const stop = set.clips?.moves?.chargeStop;
        const s = moveFrame(set, m, mv);
        assert.ok(s && stop && stop.frames.includes(s), `${what}: he is shown pulling up`);
        seen.add('charge');
      }
      was = m.state;
      if (which === 'guardian' && k === 20 * 60) {
        // (and, later, from afar again: he charges again)
        g.hero.x = m.x + 6;
        g.hero.y = m.y;
      }
    }
    const want: MoveId[] = moves.map((mv) => mv.id).filter((id) => id !== 'bolts');
    for (const id of want) assert.ok(seen.has(id), `${which}: ${id} was shown (${[...seen].join(', ')})`);
    if (which === 'guardian') assert.ok(runFrames.size >= 3, `the run goes round (${runFrames.size} frames of it)`);
    runFrames = new Set();
  }
  // the dead crawl out of the ground: the skeleton's crawl, as long as the rules' rising
  const crawl = beasts.of('skeleton').front.clips?.moves?.crawl;
  assert.ok(crawl && Math.abs(crawl.frames.length / crawl.fps - SUMMON.rise) < 0.1, 'the skeleton has its crawl out of the ground, as long as the rules have it');
  // painted ahead: a fresh bestiary paints the new moves of a figure too, and then has nothing left
  const fresh = makeBestiary();
  let calls = 0;
  while (fresh.warm(['guardian'])) calls++;
  const a = fresh.of('guardian');
  const total = (s: AnimSet): number => s.idle.length + s.walk.length + (s.clips?.attack?.frames.length ?? 0) + (s.clips?.heavy?.frames.length ?? 0) + Object.values(s.clips?.moves ?? {}).reduce((n, c) => n + c.frames.length, 0) + (s.clips?.die?.frames.length ?? 0);
  assert.equal(calls, total(a.front) + total(a.back), 'every frame of the red troll, his new moves among them, is painted ahead');
});

test('the bot steps out of a charge’s line', () => {
  useMonsterAttacks(true);
  const r = room('guardian', 30);
  const { g } = r;
  const h = g.hero;
  g.zones.push({ x: h.x - 3, y: h.y, x1: h.x + 2, y1: h.y, r: CHARGE.half, t: 0.3, dur: 0.9, kind: 'lane', element: 'phys', dmg: 0, slow: 0, tick: 0, hostile: true, skill: -1, words: [], from: 'Guardian', src: r.m.id, gone: 0 });
  const c = emptyControls();
  botStep(g, c, newBot(true, true), 1 / 60);
  assert.ok(Math.abs(c.my) > 0.99 && Math.abs(c.mx) < 0.01, `it walks square out of the line (${c.mx.toFixed(2)}, ${c.my.toFixed(2)})`);
});
