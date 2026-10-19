// ACT 2, THE HUSH: FLOOR 12'S BOSS, THE RAT KING, IN THE GAME (game/act1_rules/ratking.ts; his pictures art/act1_figs/ratking.ts,
// the art chat's art/rat_king.ts; what he throws and his swarm, art/rat_king_shots.ts, drawn by render/act1_fx/ratking.ts), behind
// ACT2 (off):
//   1. he is built: his rules, his pictures with every clip his acts play, what he draws; floor 12's boss with the Hush on, a
//      boss, heavy; not with it off;
//   2. the rules' numbers are his pictures' own (his scuttle, every move's length and moments, the front rats' jaws, where his
//      word gathers and how fast it flies, his ball's pace and size, his swarm's stream), and his size as the game goes by it;
//   3. THE BITE lands at its moment on whoever is before the heap, as far and as wide as the front rats' jaws, and on no one
//      behind it, beside it or past it;
//   4. STOLEN WORDS: one of the hero's own (else any of the four); it flies at its speed, its aim following him until it holds;
//      it bursts on him with its word's harm, or where it ends, harming there; stepped out of its way, it misses;
//   5. THE ROLL: curled, then rolled at its ball's pace, one turn or two as the floor lets it; whoever it rolls over is struck,
//      once, and thrown aside; never made into a wall, and stopped by what stands in its way; its pictures in their turn;
//   6. UNKNOT: gone into the cracks, out of reach and out of sight; the swarm runs across the hero and they knot again on his far
//      side; the swarm bites one in its way, and no one off it;
//   7. killed in the middle of anything, nothing of him is left harming the hero; a long fight uses all four and throws nothing;
//   8. what he draws: the roll's lane, the word's aim, his swarm, his word in flight and its burst, each a light of the enemy's;
//      nothing cyan;
//   9. his line, and his size against his picture.
//   run: tsx --test tests/act2_ratking.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { RAT_KING_ON, RK_BITE, RK_PACE, RK_ROLL, RK_UNKNOT, RK_WALK, RK_WORDS, ROLL_PACE, headOf, makeRatKingArt, ratKingPose } from '../src/art/rat_king';
import { SWARM_FOR, WORD_BURST_FOR, WORD_SPEED } from '../src/art/rat_king_shots';
import { FIGURE_SIZE, makeBestiary } from '../src/art/bestiary';
import { GRAIN, hash } from '../src/art/kit';
import { TILE3 } from '../src/art/new_mobs3';
import { act1Fig } from '../src/art/act1_figs/index';
import { FIG } from '../src/art/act1_figs/ratking';
import { RNG } from '../src/engine/rng';
import { ACT2 } from '../src/game/act1';
import { RK, RK_ACTS, RK_GAIT, ROLL_TURN, RULES, STOLEN, rollEnd, swarmSpan, swarming, unknotted } from '../src/game/act1_rules/ratking';
import { act1Rules } from '../src/game/act1_rules/index';
import { actsOf, bossKind, gaitOf } from '../src/game/bosses';
import { BOSS_LINES, MONSTERS, TUNE, sizeOf } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { ActId, Monster } from '../src/game/state';
import type { WordId } from '../src/game/types';
import { FX } from '../src/render/act1_fx/ratking';
import { act1Fx } from '../src/render/act1_fx/index';
import type { Act1FxCtx } from '../src/render/act1_fx/types';
import { cyanIn, fakeDocument, firstHurt, keep, room, watch } from './act1_kinds_room';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
  fail(message?: string): never;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
// (VERSION 23.0: THE HUSH IS ON IN THE GAME. This file was written while it was off, and turns it on itself wherever it
// needs it: so it is turned off here for the file, as it was then, once the game's own is seen to be on)
nodeAssert.equal(ACT2.on, true, 'the Hush is on in the game (Version 23.0)');
ACT2.on = false;
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);

paintWithoutCanvas();
fakeDocument();

const act = (id: string) => RK_ACTS.find((a) => a.id === id)!;
const indexOf = (id: string): number => RK_ACTS.findIndex((a) => a.id === id);
function hush<T>(fn: () => T): T {
  const was = ACT2.on;
  ACT2.on = true;
  try {
    return fn();
  } finally {
    ACT2.on = was;
  }
}
/** The practice room with the King `far` west of the hero, `only` that act of his ready, begun now. */
function begun(far: number, only: ActId): { g: Game; m: Monster } {
  const r = room('ratking', far, only);
  r.g.bosses.startAct(r.m, RULES!.acts, indexOf(only));
  return r;
}
/** Steps the game on `secs` (the hero's life put back each step, nothing of what it leaves on him put out), `each` after each step. */
function run(g: Game, secs: number, each?: () => boolean | void): void {
  const c = emptyControls();
  for (let k = 0; k < Math.round(secs * 60); k++) {
    g.update(1 / 60, c);
    g.hero.life = g.hero.d.maxLife;
    if (each && each()) break;
  }
}
/** The hero's words: only these, in his first two attacks' fronts. */
function carry(g: Game, words: WordId[]): void {
  for (const s of g.hero.skills) {
    s.front = s.front.map(() => null);
    s.behind = s.behind.map(() => null);
  }
  words.forEach((w, i) => {
    const s = g.hero.skills[i % g.hero.skills.length];
    s.front[Math.floor(i / g.hero.skills.length)] = w;
  });
}

test('1. he is built: his rules, his pictures with every clip his acts play, what he draws; floor 12\'s boss with the Hush on', () => {
  assert.ok(act1Rules('ratking') === RULES && RULES, 'his rules');
  assert.ok(act1Fig('ratking') === FIG && FIG, 'his pictures');
  assert.ok(act1Fx('ratking') === FX && FX, 'what he draws');
  assert.equal(sizeOf('ratking'), 'boss');
  assert.equal(FIG!.heavy, true, 'heavy: a boss, made for his floor');
  assert.ok(FIG!.switches!.includes(RAT_KING_ON), "the art chat's switch for him, thrown with the acts' figures (art/bestiary.ts)");
  assert.equal(ACT2.on, false, 'the Hush is off');
  assert.ok(bossKind(12) !== 'ratking', 'with it off, floor 12 is not his');
  hush(() => assert.equal(bossKind(12), 'ratking', "with it on, floor 12's boss is the Rat King"));
  assert.equal(RK_ACTS.length, 4, 'a boss: four (his rulebook)');
  assert.equal(RK_ACTS[0].clip, 'attack', 'his basic blow first, the gnashing bite');
  assert.ok(RK_ACTS.slice(1).every((a) => a.cooldown > 0), 'the others cool down');
  assert.ok(act('ratking:roll').cooldown > act('ratking:words').cooldown && act('ratking:roll').dmg > act('ratking:words').dmg, 'the bigger the hit, the longer the cooldown');
  const art = makeRatKingArt();
  for (const set of [art.front, art.back]) {
    assert.ok(set.clips!.attack && set.clips!.reel && set.clips!.die, 'his bite, struck, his death');
    for (const c of ['words', 'curl', 'roll', 'uncurl', 'unknot', 'knot']) assert.ok(set.clips!.moves![c].frames.length > 0, `his ${c}`);
  }
  const g = Game.forPractice('warrior', 5);
  const m = g.spawn('ratking', g.hero.x - 3, g.hero.y, -2, 0, false, new RNG(3));
  assert.ok(gaitOf(m.kind) === RK_GAIT && actsOf(m) === RK_ACTS, 'run by his rules');
});

test("2. the rules' numbers are his pictures' own, and his size as the game goes by it", () => {
  const G = RK_GAIT;
  assert.equal(G.pace, RK_PACE, 'the pace his scuttle is painted for');
  assert.equal(MONSTERS.ratking.speed, RK_PACE, 'and he goes at it');
  near(G.cycle, RK_WALK.frames / RK_WALK.fps, 1e-9, 'his scuttle goes round');
  assert.equal(act('ratking:bite').long, RK_BITE.long);
  assert.equal(act('ratking:bite').hit, RK_BITE.hit);
  assert.equal(MONSTERS.ratking.windup, RK_BITE.hit, "his blow's moment, his bite's");
  assert.equal(MONSTERS.ratking.range, act('ratking:bite').far, 'his reach, his bite');
  // (the front rats' jaws as they snap down: the three on the floor before the heap)
  const jaws = ratKingPose('attack', RK_BITE.hit).rats.map((P) => headOf(P).mouth).filter((p) => p[0] > 20 && p[2] < 10);
  assert.equal(jaws.length, 3, 'three front rats snap');
  for (const [f, l] of RK.bite.jaws) assert.ok(jaws.some((p) => Math.abs(p[0] / TILE3 - f) < 0.02 && Math.abs(p[1] / TILE3 - l) < 0.02), `a front rat's jaws at ${f}, ${l}`);
  for (const [f, l] of RK.bite.jaws) {
    assert.ok(Math.hypot(f, l) + 0.4 <= RK.bite.reach, 'his reach takes in the jaws and the hero\'s middle');
    assert.ok(Math.abs(Math.atan2(l, f)) + 0.15 <= RK.bite.arc, 'and as wide as they are spread');
  }
  assert.ok(RK.bite.reach >= act('ratking:bite').far, 'he bites as far as he bites from');
  // STOLEN WORDS
  const W = RK.words;
  assert.equal(act('ratking:words').long, RK_WORDS.long);
  assert.equal(act('ratking:words').hit, RK_WORDS.hit);
  assert.equal(W.warn, RK_WORDS.warn[0], 'its warning');
  assert.equal(W.speed, WORD_SPEED, 'it flies at its speed');
  assert.equal(W.burstFor, WORD_BURST_FOR, 'its burst');
  assert.ok(W.lock > W.warn && W.lock < W.hit, 'its aim holds before it flies');
  const charge = ratKingPose('words', RK_WORDS.warn[1]).charge!;
  near(W.from, charge.at[0] / TILE3, 0.02, 'it flies from where it gathered');
  near(W.rise, charge.at[2] / 2, 1, 'as high as it gathered (game pixels)');
  // THE ROLL
  const C = RK.roll;
  assert.equal(C.curl, RK_ROLL.curl);
  near(C.turn, RK_ROLL.frames / RK_ROLL.fps, 1e-9, 'a turn of its ball');
  assert.equal(C.uncurl, RK_ROLL.uncurl);
  near(C.pace, ROLL_PACE, 1e-9, 'it rolls at its ball\'s pace: it does not slide');
  near(C.ball * TILE3, ratKingPose('roll', 0).knot[2] - 1.6 * 2, 0.5, 'its ball, to the backs of its rats');
  assert.ok(C.r >= C.ball + TUNE.heroRadius, 'it runs over what its ball meets');
  near(act('ratking:roll').long, C.curl + C.turns * C.turn + C.uncurl, 1e-9, 'curled, rolled, uncurled');
  assert.equal(act('ratking:roll').hit, C.curl, 'it rolls once curled');
  // UNKNOT, the swarm, KNOT
  const U = RK.unknot;
  assert.equal(U.out, RK_UNKNOT.out);
  assert.equal(U.knot, RK_UNKNOT.in);
  assert.equal(U.swarm, SWARM_FOR, 'the swarm runs its while');
  near(act('ratking:unknot').long, RK_UNKNOT.out + SWARM_FOR + RK_UNKNOT.in, 1e-9, 'come apart, the swarm, knotted');
  const gone = ratKingPose('unknot', U.gone).rats.map((r) => r.gone);
  assert.ok(gone.every((x) => x < 0.05), 'still all there as he goes out of reach (they are bursting away)');
  assert.ok(ratKingPose('unknot', U.out).rats.every((r) => r.gone > 0.95), 'gone into the cracks as the swarm runs');
  assert.ok(ratKingPose('knot', U.formed).rats.every((r) => r.gone < 0.05), 'all back as he is in reach again');
  // (every rat the swarm is drawn with is within its stream: art/rat_king_shots.ts drawSwarm, its own numbers)
  for (let tau = 0; tau < SWARM_FOR; tau += 0.02) {
    const [back, front] = swarmSpan(tau);
    for (let i = 0; i < 18; i++) {
      const delay = hash(i, 0, 6204) * 0.25;
      const pace = 0.75 + 0.25 * hash(i, 1, 6204);
      const q = Math.max(0, Math.min(1, (tau - delay) / ((SWARM_FOR - 0.25) * pace)));
      if (q <= 0 || q >= 1) continue;
      assert.ok(q >= back - 1e-9 && q <= front + 1e-9, `rat ${i} of the swarm ${tau.toFixed(2)} s in: ${q.toFixed(3)} in ${back.toFixed(3)}..${front.toFixed(3)}`);
      assert.ok(Math.abs((hash(i, 2, 6204) - 0.5) * 1.6) + 0.08 <= U.half, 'and within its width');
    }
  }
});

test('3. THE BITE lands at its moment on whoever is before the heap, and on no one behind it, beside it or past it', () => {
  const B = RK.bite;
  for (const [f, l] of [[1.5, 0], [2.3, 0], [1.6, 1.0], [1.5, -1.1]] as const) {
    const { g, m } = begun(2, 'ratking:bite');
    g.hero.x = m.x + f;
    g.hero.y = m.y + l;
    const s = watch(g, m, 1.36);
    assert.equal(s.hurts.length, 1, `${f}, ${l}: bitten once`);
    near(firstHurt(s) - s.began, act('ratking:bite').hit, 0.04, `${f}, ${l}: as they snap`);
  }
  for (const [f, l, what] of [[-1.6, 0, 'behind'], [0.4, 1.6, 'beside'], [B.reach + 0.3, 0, 'past']] as const) {
    const { g, m } = begun(2, 'ratking:bite');
    g.hero.x = m.x + f;
    g.hero.y = m.y + l;
    assert.equal(watch(g, m, 1.36).hurts.length, 0, `${what} the heap: nothing`);
  }
});

test('4. STOLEN WORDS: one of his own; it flies at its speed, following him until it holds; it bursts with its word\'s harm, or misses', () => {
  // (the hero's own: only Frost, then Frost and Poison; none of the four, any)
  for (const [words, want] of [[['frost'], [1]], [['frost', 'poison', 'swift'], [1, 3]], [['swift', 'power'], [0, 1, 2, 3]]] as [WordId[], number[]][]) {
    const seen = new Set<number>();
    const { g, m } = room('ratking', 5, 'ratking:words');
    carry(g, words);
    for (let k = 0; k < 40; k++) {
      g.bosses.startAct(m, RULES!.acts, indexOf('ratking:words'));
      seen.add(m.a1!.word);
      g.bosses.breakOff(m);
    }
    assert.deepEqual([...seen].sort(), want, `carrying ${words.join(', ')}: stolen ${[...seen].map((i) => STOLEN[i]).join(', ')}`);
  }
  // (it flies at its speed, and bursts on him)
  {
    const { g, m } = begun(6, 'ratking:words');
    // (Frost: nothing of it burning on after, to be counted as a blow)
    m.a1!.word = 1;
    const s = watch(g, m, 3);
    assert.equal(s.hurts.length, 1, 'it strikes him, once');
    const flight = 6 - RK.words.from - RK.words.r;
    near(firstHurt(s) - s.began, RK.words.hit + flight / RK.words.speed, 0.08, 'as fast as it flies');
  }
  // (with its word's harm)
  for (const [i, left] of [[0, 'burnT'], [1, 'chillT'], [2, 'shockT'], [3, 'poisonT']] as const) {
    const { g, m } = begun(4, 'ratking:words');
    m.a1!.word = i;
    const h = g.hero as unknown as Record<string, number>;
    h.burnT = h.chillT = h.shockT = h.poisonT = 0;
    let after = 0;
    run(g, 2, () => void (after = Math.max(after, h[left])));
    assert.ok(after > 0, `${STOLEN[i]}: its harm on him (${left})`);
  }
  // (its aim follows him until it holds; stepped out of its way after, it misses, and bursts where it ends, harming there)
  {
    const { g, m } = begun(5, 'ratking:words');
    const h = g.hero;
    run(g, 0.3);
    h.y += 1.5;
    run(g, 0.05);
    near(m.act!.y, h.y, 1e-6, 'its aim follows him');
    run(g, RK.words.lock - 0.35 + 0.05);
    const aim = { x: m.act!.x, y: m.act!.y };
    h.y -= 2.2;
    run(g, 0.05);
    assert.ok(Math.hypot(m.act!.x - aim.x, m.act!.y - aim.y) < 1e-6, 'and then holds');
    let burst = false;
    const s = watch(g, m, 2.5, undefined, () => {
      for (const q of g.perils) if (q.a1 === 'ratking:word' && q.done) burst = true;
      return false;
    });
    assert.equal(s.hurts.length, 0, 'out of its way, it misses');
    assert.ok(burst, 'and bursts where it ends');
  }
  {
    // (where it ends: a hero beside where it ends, off its line, is caught in its burst)
    const { g, m } = begun(5, 'ratking:words');
    m.a1!.word = 1;
    const h = g.hero;
    run(g, RK.words.lock + 0.02);
    const o = { x: m.x + RK.words.from, y: m.y };
    const end = o.x + m.act!.a;
    h.x = end;
    h.y = o.y + 0.8;
    const s = watch(g, m, 2.5, undefined, () => {
      h.x = end;
      h.y = o.y + 0.8;
      return false;
    });
    assert.equal(s.hurts.length, 1, 'caught in its burst, once');
  }
});

test('5. THE ROLL: rolled at its pace, a turn or two; whoever it rolls over struck once and thrown aside; never into a wall, stopped on the way', () => {
  const C = RK.roll;
  {
    const { g, m } = begun(4, 'ratking:roll');
    const x0 = m.x;
    const y0 = m.y;
    assert.equal(m.a1!.turns, 2, 'two turns where the floor is clear for two');
    run(g, C.curl - 0.02);
    near(m.x, x0, 1e-6, 'curled where he stood');
    const h = g.hero;
    let hurts = 0;
    let aside = 0;
    const s = watch(g, m, act('ratking:roll').long, undefined, () => {
      aside = Math.max(aside, Math.abs(h.y - y0));
      return m.state !== 'act';
    });
    hurts = s.hurts.length;
    assert.equal(hurts, 1, 'run over, once');
    assert.ok(aside > 0.4, `and thrown aside (${aside.toFixed(2)})`);
    near(Math.hypot(m.x - x0, m.y - y0), 2 * ROLL_TURN, 0.6, 'rolled two turns of its ball');
  }
  {
    // (its pace: so far a moment into its run)
    const { g, m } = begun(4, 'ratking:roll');
    g.hero.y += 4;
    const x0 = m.x;
    run(g, C.curl + 0.5);
    near(m.x - x0, C.pace * 0.5, 0.15, 'at its ball\'s pace');
  }
  {
    // (one turn where the floor is clear for one only: it uncurls from where it ends)
    const { g, m } = room('ratking', 4, 'ratking:roll');
    m.x = 13.5;
    g.hero.x = 17.5;
    g.bosses.startAct(m, RULES!.acts, indexOf('ratking:roll'));
    g.hero.y = m.y + 3;
    assert.equal(m.a1!.turns, 1, 'one turn');
    const x0 = m.x;
    let ended = -1;
    let k = 0;
    run(g, 3, () => {
      k++;
      if (ended < 0 && m.state !== 'act') ended = k / 60;
    });
    near(m.x - x0, ROLL_TURN, 0.3, 'rolled one turn');
    near(ended, C.curl + C.turn + C.uncurl, 0.05, 'and uncurled from there');
  }
  {
    // (never into a wall: no clear turn's run, no roll)
    const { g, m } = room('ratking', 3, 'ratking:roll');
    m.x = 19.5;
    g.hero.x = 22.5;
    g.hero.y = m.y;
    assert.equal(RULES!.can!(g.bosses, m, act('ratking:roll'), 3, true), false, 'no roll into a wall');
    m.x = 11.5;
    g.hero.x = 15.5;
    assert.equal(RULES!.can!(g.bosses, m, act('ratking:roll'), 4, true), true, 'a roll where there is room');
  }
  {
    // (stopped by what stands in its way: it stops there, and uncurls in its time)
    const { g, m } = begun(4, 'ratking:roll');
    g.hero.y += 4;
    const L = g.level;
    const tx = Math.floor(m.x + 4);
    for (let ty = Math.floor(m.y) - 1; ty <= Math.floor(m.y) + 1; ty++) L.walk[ty * L.floor.w + tx] = 0;
    run(g, act('ratking:roll').long);
    assert.ok(m.x < tx - 0.3, `stopped before it (${m.x.toFixed(2)} against ${tx})`);
    assert.ok(m.a1!.stuck === 1, 'stopped');
  }
  {
    // (its pictures, each in its turn)
    const { g, m } = begun(4, 'ratking:roll');
    g.hero.y += 4;
    const art = makeRatKingArt();
    const mv = art.front.clips!.moves!;
    const seen = new Set<string>();
    run(g, act('ratking:roll').long - 0.02, () => {
      const sp = FX!.sprite!(m, art, art.front);
      const t = m.act!.t;
      const which = mv.curl.frames.includes(sp!) ? 'curl' : mv.roll.frames.includes(sp!) ? 'roll' : mv.uncurl.frames.includes(sp!) ? 'uncurl' : '?';
      seen.add(which);
      const want = t < C.curl ? 'curl' : t < act('ratking:roll').long - C.uncurl ? 'roll' : 'uncurl';
      if (which !== want) assert.fail(`${t.toFixed(2)} s in: ${which}, not ${want}`);
    });
    assert.deepEqual([...seen], ['curl', 'roll', 'uncurl'], 'curled, rolling, uncurled');
  }
});

test('6. UNKNOT: gone into the cracks, out of reach and sight; the swarm runs across the hero; they knot again on his far side', () => {
  const U = RK.unknot;
  {
    const { g, m } = begun(4, 'ratking:unknot');
    const h = g.hero;
    const from = { x: m.x, y: m.y };
    const hero = { x: h.x, y: h.y };
    const hit = (): number => {
      const was = m.life;
      (g as unknown as { damageMonster(m: unknown, n: number, el: string, c: boolean, k: number): void }).damageMonster(m, 5, 'phys', false, -1);
      const took = was - m.life;
      m.life = was;
      return took;
    };
    const art = makeRatKingArt();
    const mv = art.front.clips!.moves!;
    let reached = 0;
    let unreached = 0;
    const s = watch(g, m, act('ratking:unknot').long - 0.02, undefined, () => {
      h.x = hero.x;
      h.y = hero.y;
      const t = m.act!.t;
      const gone = t >= U.gone && t < U.out + U.swarm + U.formed;
      assert.equal(unknotted(m), gone, `${t.toFixed(2)} s in: out of reach just while gone`);
      if (gone) unreached += hit() === 0 ? 1 : 0;
      else reached += hit() > 0 ? 1 : 0;
      assert.equal(FX!.hidden!(m), swarming(m), 'nothing of him seen while his swarm runs');
      const sp = FX!.sprite!(m, art, art.front);
      if (t < U.out) assert.ok(mv.unknot.frames.includes(sp!), 'coming loose');
      else if (t >= U.out + U.swarm) assert.ok(mv.knot.frames.includes(sp!), 'knotting again');
      return false;
    });
    const bitten = s.hurts.length;
    assert.ok(unreached > 30 && reached > 30, `out of reach while gone (${unreached} steps), in reach otherwise (${reached})`);
    // (knotted again past the hero, on his far side: the swarm ran across him)
    const lx = m.x - from.x;
    const ly = m.y - from.y;
    const len = Math.hypot(lx, ly);
    const along = ((hero.x - from.x) * lx + (hero.y - from.y) * ly) / len;
    const off = Math.abs((hero.x - from.x) * ly - (hero.y - from.y) * lx) / len;
    assert.ok(len >= U.apart, `somewhere else (${len.toFixed(1)} tiles off)`);
    assert.ok(along > 0 && along < len && off < U.half, `the hero in its way (${along.toFixed(1)} of ${len.toFixed(1)}, ${off.toFixed(2)} off)`);
    const beyond = Math.hypot(m.x - hero.x, m.y - hero.y);
    assert.ok(beyond >= U.near - 0.01 && beyond <= U.far + 0.01, `knotted ${beyond.toFixed(1)} tiles past him`);
    assert.ok(g.free(g.level.walk, m.x, m.y, U.room), 'where there is room for the heap');
    assert.ok(bitten >= 1, `the swarm bites him as it passes (${bitten})`);
  }
  {
    // (one off its way: not bitten)
    const { g, m } = begun(4, 'ratking:unknot');
    const h = g.hero;
    let moved = false;
    const s = watch(g, m, act('ratking:unknot').long, undefined, () => {
      if (!moved && m.act && m.act.t > U.out + 0.01) {
        // (out of the way the swarm runs: three tiles off its middle, square to it)
        moved = true;
        const lx = m.x - m.a1!.sx;
        const ly = m.y - m.a1!.sy;
        const len = Math.hypot(lx, ly) || 1;
        h.x = (m.x + m.a1!.sx) / 2 - (ly / len) * 3;
        h.y = (m.y + m.a1!.sy) / 2 + (lx / len) * 3;
      }
      return false;
    });
    const bitten = s.hurts.filter((x) => x.t > U.out + 0.05).length;
    assert.equal(bitten, 0, 'off the swarm\'s way, nothing');
  }
});

test('7. killed in the middle of anything, nothing of him is left harming the hero; a long fight uses all four and throws nothing', () => {
  for (const [id, far] of [['ratking:bite', 1.8], ['ratking:words', 6], ['ratking:roll', 4], ['ratking:unknot', 4]] as const) {
    for (const when of [0.4, 1.0, 1.9]) {
      const { g, m } = room('ratking', far, id);
      watch(g, m, 6, undefined, () => m.state === 'act' && m.act !== undefined && m.act.t >= when);
      g.kill(m);
      // (what a word of Poison that struck him before left working in him is not the King's after)
      g.hero.poisonT = 0;
      const s = watch(g, m, 4);
      assert.equal(g.perils.filter((p) => p.kind === 'act1').length, 0, `${id}, killed ${when} s in: nothing of him left`);
      assert.equal(s.hurts.length, 0, `${id}, killed ${when} s in: nothing of him harms the hero after`);
    }
  }
  const { g, m } = room('ratking', 4);
  const used = new Set<string>();
  const c = emptyControls();
  const h = g.hero;
  for (let k = 0; k < 60 * 150; k++) {
    const t = k / 60;
    if (m.act) used.add(m.act.id);
    // (he walks about the room, now toward the King, now round him)
    const a = t * 0.4;
    c.mx = Math.cos(a) * (k % 600 < 300 ? 1 : 0);
    c.my = Math.sin(a) * (k % 600 < 300 ? 1 : 0);
    g.update(1 / 60, c);
    h.life = h.d.maxLife;
  }
  for (const a of RK_ACTS) assert.ok(used.has(a.id), `he made his ${a.id}`);
});

test('8. what he draws: the lane of his roll, the aim of his word, his swarm, his word and its burst, lit; nothing cyan', () => {
  const colours = new Set<string>();
  let dots = 0;
  let lit = 0;
  const ctx = new Proxy({} as Record<string, unknown>, {
    get: (o, k) => (k === 'fillRect' || k === 'fill' ? () => void dots++ : k in o ? o[k as string] : () => undefined),
    set: (o, k, v) => {
      if (k === 'fillStyle' || k === 'strokeStyle') colours.add(String(v));
      o[k as string] = v;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
  const drew: Record<string, number> = {};
  for (const [id, far] of [['ratking:roll', 4], ['ratking:words', 6], ['ratking:unknot', 4]] as const) {
    const { g, m } = begun(far, id);
    const c: Act1FxCtx = { g: ctx, at: (x, y) => [(x - y) * 16, (x + y) * 8], game: g, t: 0, bestiary: makeBestiary(), stand: () => undefined, spot: () => void lit++ };
    run(g, 3, () => {
      const before = dots;
      FX!.ground!(c, m, null);
      if (dots > before) drew[`${id} on the floor`] = (drew[`${id} on the floor`] ?? 0) + 1;
      for (const p of g.perils) {
        if (p.a1 !== 'ratking:word') continue;
        const b = dots;
        FX!.air!(c, null, p);
        if (dots > b) drew[p.done ? 'its burst' : 'its word'] = (drew[p.done ? 'its burst' : 'its word'] ?? 0) + 1;
      }
    });
  }
  for (const what of ['ratking:roll on the floor', 'ratking:words on the floor', 'ratking:unknot on the floor', 'its word', 'its burst']) assert.ok((drew[what] ?? 0) > 3, `${what} drawn (${drew[what] ?? 0})`);
  assert.ok(lit > 10, 'his word lights the dark');
  for (const col of colours) {
    const v = col.replace('#', '');
    const r = parseInt(v.slice(0, 2), 16);
    const gg = parseInt(v.slice(2, 4), 16);
    const b = parseInt(v.slice(4, 6), 16);
    assert.ok(!(b > r + 30 && gg > r + 30), `nothing cyan: ${col}`);
  }
  const art = makeRatKingArt();
  for (const set of [art.front, art.back]) for (const sp of [set.idle[0], set.clips!.attack!.frames[20], set.clips!.moves!.words.frames[25], set.clips!.moves!.roll.frames[5], set.clips!.moves!.unknot.frames[10]]) assert.equal(cyanIn(sp), 0, 'nothing cyan on him');
});

test('9. his line as the hero comes into his ground, and his size as the game goes by it, against his picture', () => {
  const lines = BOSS_LINES.ratking ?? [];
  assert.equal(lines.length, 3, 'three, as every boss has');
  for (const l of lines) assert.ok(l.length > 4 && l.length < 60, `short: ${l}`);
  const size = FIGURE_SIZE.ratking;
  assert.deepEqual(size, FIG!.size, 'the game holds the size his pictures give');
  const sp = makeBestiary().of('ratking').front.idle[0];
  const p = paintingOf(sp);
  const ax = Math.round(sp.ax * GRAIN);
  const ay = Math.round(sp.ay * GRAIN);
  let top = 0;
  for (let y = 0; y < p.h && top === 0; y++) for (let x = ax - 3; x <= ax + 3; x++) if (p.has(x, y)) top = (ay - y) / GRAIN;
  assert.ok(Math.abs(size.top - top) <= 3, `his top ${size.top}; his picture's ${top}`);
  assert.ok(Math.abs(size.top - 28) <= 3, 'the King on top as high as the knight\'s head (28)');
  const reach = Math.max(sp.ax, sp.w - sp.ax);
  assert.ok(size.half <= reach + 1 && size.half >= reach * 0.8, `${size.half} to either side; his heap reaches ${reach}`);
  void keep;
});
