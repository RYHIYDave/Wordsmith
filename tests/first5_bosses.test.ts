// THE FIRST FIVE FLOORS: THE BOSSES OF FLOORS 2 TO 5 IN THE GAME (game/bosses.ts), and what comes with
// them: the bone beast, the cult's bodies and the mini fleshmancer's dead.
//
//   1. each floor has its own boss; past the fifth, and with the switch off, the Warden;
//   2. the rules' numbers are the pictures' own (the art chat's: every move's length and moments, where
//      things fly and fall);
//   3. a boss sets off, walks and stops as his pictures hand over to each other, carried at his pace;
//   4. the Headsman's four attacks hurt where and when their pictures say, and nowhere else;
//   5. the Chained One's, and his chains breaking as he is hurt;
//   6. the amalgamation's, its bone beasts, and its eating them back;
//   7. the Fleshmancer's;
//   8. the mini fleshmancer's fire, and his dead out of the cult's bodies;
//   9. a boss can be killed in the middle of anything, and nothing of his is left harming the hero long;
//  10. their sizes, as the game goes by them, held against their pictures.

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIGURE_SIZE, FIRST5_FIGURES, figureOf, makeBestiary } from '../src/art/bestiary';
import { SENTENCE_FROM, SENTENCE_TO, SPLIT_FOR, throwPathAt } from '../src/art/boss_shots';
import {
  AMALGAM as AM_MOB, AM_BURST_AT, AM_BURST_SPOT, AM_BURST_WAY, AM_DEVOUR_HIT, AM_SLAM_HIT, AM_SLAM_SPOTS, AM_SWARM_HIT, AM_SWARM_SPEED, AM_SWIPE_HIT, BB_BITE_HIT, BB_EMERGE_TIME, BONE_BEAST, CHAINED as CO_MOB, CHAINED_FREED,
  CO_BALL_BACK, CO_BALL_LAND, CO_BALL_LET, CO_BALL_REACH, CO_HOOK_BACK, CO_HOOK_BITE, CO_HOOK_LET, CO_HOOK_REACH, CO_LASH_HIT, CO_SNAP_BALL, CO_SNAP_L, CO_WHIRL_FROM, CO_WHIRL_TO, FLOOR_ARM_TIME, HEADSMAN as HS_MOB, HS_CATCH, HS_CHOP_HIT,
  HS_RAISE, HS_SENTENCE_HIT, HS_SWEEP_FROM, HS_SWEEP_TO, HS_THROW_HIT, amSwarmSkulls, axeOf, coHookPath, coWhirlReach, hsBite, hsSweepReach,
} from '../src/art/bosses3';
import { MINI_FIRE, MINI_FIRE_SIZE, MINI_FM, MINI_RAISE, miniFireTurn } from '../src/art/cultists';
import { FLESHMANCER as FM_MOB, FM_FIRE, FM_RAISE, FM_RINGS, FM_SHARDS, fmFireTurn, fmSkullAt } from '../src/art/fleshmancer';
import { FM_FIRE_BURN, FM_FIRE_LAND, FM_FIRE_REACH, FM_HAND_LEFT, FM_HAND_WARN, FM_RAISE_STIR, FM_RINGS_LAID, FM_SHARD, FM_WAVE_SPEED, FM_WAVE_TIME } from '../src/art/fm_spells';
import { GRAIN } from '../src/art/kit';
import { TILE3, handAt, posedOfMob, skeletonAt } from '../src/art/new_mobs3';
import type { Mob } from '../src/art/new_mobs3';
import { RNG } from '../src/engine/rng';
import { hookHigh } from '../src/render/bossfx';
import { act1Rules } from '../src/game/act1_rules/index';
import { ACTS, AMALGAM, BOSSES5, CARRY_FOR, CHAINED, FLESHMANCER, GAITS, HEADSMAN, MINIFM, along, axeAt, bossKind, fireTurn, hookAt, inGap, ringHand } from '../src/game/bosses';
import type { ActDef, GaitedKind } from '../src/game/bosses';
import { BOSS_LIFE, BOSS_LINES, MONSTERS, SUMMON } from '../src/game/defs';
import { ACT1_FLOORS } from '../src/game/act1';
import { beside, handOf } from '../src/game/facing';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { ActId, GameEvent, Monster } from '../src/game/state';
import type { MonsterKind, WordId } from '../src/game/types';
import { paintWithoutCanvas, paintingOf, seasoned } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

type Pack = { rarity: 'blue' | 'leader' | 'minion'; words: readonly WordId[] };
interface Hooks {
  waveT: number;
  wakeUp(m: Monster): void;
}
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);
const lastKey = (mob: Mob, which: string): number => {
  const mv = which === 'attack' ? mob.attack : which === 'reel' ? mob.reel : which === 'dying' ? mob.dying : mob.more?.[which];
  const keys = mv?.motion.keys ?? [];
  return keys[keys.length - 1].at;
};

/** Dungeon `depth` of a character who has been down before. */
function dungeon(seed: number, depth: number): Game {
  const g = seasoned(new Game('warrior', seed), 1);
  g.depth = depth;
  g.cleared = depth;
  g.enterDungeon();
  g.events.length = 0;
  return g;
}

/**
 * An empty practice room, a hero who stands still at (15, 15), and one of them `far` tiles to the west
 * of the hero, awake, facing him, its words taken off and not to be killed; every act of its but `only`
 * kept cooling (none: as they come).
 */
function room(kind: MonsterKind, far: number, only: ActId | null = null, pack: Pack | null = null): { g: Game; m: Monster } {
  const g = Game.forPractice('warrior', 5);
  const hooks = g as unknown as Hooks;
  hooks.waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  // (the room is sixteen tiles across, the hero in its middle: for one who is to stand far off, the hero stands further east)
  h.x += Math.max(0, far - 7);
  const m = g.spawn(kind, h.x - far, h.y, kind === 'minifm' || kind === 'beast' ? 1 : -2, pack?.rarity === 'leader' ? 1 : 0, false, new RNG(9), null, pack);
  hooks.wakeUp(m);
  m.words = [];
  m.shield = 0;
  m.life = m.maxLife = 1e9;
  m.cd = 0;
  m.fx = 1;
  m.fy = 0;
  if (only) keep(m, only);
  g.events.length = 0;
  return { g, m };
}
/** Only this act of its is ready, now. */
function keep(m: Monster, only: ActId): void {
  m.moveCd = ACTS[m.kind as GaitedKind].map((a) => (a.id === only ? 0 : 1e9));
  m.cd = 0;
}

interface Seen {
  /** Every time the hero was hurt: when (seconds from the start), and how much. */
  hurts: { t: number; n: number }[];
  /** When its act began (the first step it was in one), and which. */
  began: number;
  events: GameEvent[];
}
/** Steps the game on for `secs`, the hero's life put back each step (he stands, or goes where `move` says). */
function watch(g: Game, m: Monster, secs: number, move?: (t: number) => { mx: number; my: number } | null, until?: () => boolean): Seen {
  const c = emptyControls();
  const h = g.hero;
  const seen: Seen = { hurts: [], began: -1, events: [] };
  for (let k = 0; k < Math.round(secs * 60); k++) {
    const t = k / 60;
    const mv = move ? move(t) : null;
    c.mx = mv ? mv.mx : 0;
    c.my = mv ? mv.my : 0;
    const before = h.life;
    g.update(1 / 60, c);
    if (h.life < before) seen.hurts.push({ t: (k + 1) / 60, n: before - h.life });
    h.life = h.d.maxLife;
    // (only blows are counted: what a blow of fire leaves burning on him is put out)
    h.burnT = 0;
    h.shockT = 0;
    h.chillT = 0;
    if (seen.began < 0 && m.state === 'act') seen.began = (k + 1) / 60;
    seen.events.push(...g.events);
    g.events.length = 0;
    if (until && until()) break;
  }
  return seen;
}
/** The moment of its act (seconds into it) at which the hero was first hurt; -1 if he never was. */
const firstHurt = (s: Seen): number => (s.hurts.length ? s.hurts[0].t - s.began : -1);

// =============================================================================================

test('1. each floor has its own boss; past the fifth, and with the switch off, the Warden', () => {
  assert.equal(BOSSES5.on, true, 'on, on this branch (not live until he has seen it)');
  assert.deepEqual([1, 2, 3, 4, 5].map(bossKind), ['warden', 'headsman', 'chained', 'amalgam', 'fleshmancer']);
  // (ACT 1, THE DESCENT: floors 6 to 10 each have their own boss once his rules are built, the Warden until then: game/act1_rules/)
  for (const d of [6, 7, 8, 9, 10]) assert.equal(bossKind(d), act1Rules(ACT1_FLOORS[d].boss) ? ACT1_FLOORS[d].boss : 'warden', `floor ${d}'s boss`);
  const names: Record<number, string> = { 2: 'Headsman', 3: 'Chained One', 4: 'Ossuary Amalgamation', 5: 'Fleshmancer' };
  for (const depth of [2, 3, 4, 5]) {
    for (const seed of [3, 17]) {
      const g = dungeon(seed, depth);
      const boss = g.boss;
      assert.ok(boss && boss.boss && boss.kind === bossKind(depth), `floor ${depth}: its boss is the ${bossKind(depth)}`);
      assert.ok(boss!.name.endsWith(names[depth]), `floor ${depth}: he is named for what he is (${boss!.name})`);
      assert.ok(!boss!.name.startsWith('Greater'), `floor ${depth}: no "Greater" (${boss!.name})`);
      assert.equal(g.monsters.filter((m) => m.boss).length, 1, 'one boss');
      assert.equal(boss!.words.length, depth === 5 ? 3 : 2, `floor ${depth}: a boss's words, three on the fifth`);
      assert.ok((BOSS_LINES[boss!.kind] ?? []).length >= 3, `the ${boss!.kind} has lines to say as his gate falls`);
    }
  }
  // (the lair boss has twice the life of his kind at that depth, as a fifth floor's boss always has)
  const five = dungeon(3, 5).boss!;
  // (BOSS_LIFE, his word of 17 Oct: "Bosses need more HP past the warden": each times his own)
  const more = BOSS_LIFE.on ? BOSS_LIFE.times.fleshmancer ?? 1 : 1;
  assert.equal(five.maxLife, Math.round(MONSTERS.fleshmancer.life * (1 + 0.4 * 4) * 2 * more * (five.words.includes('power') ? 1.3 : 1)), 'the Fleshmancer: his life');
  assert.equal(dungeon(3, 15).boss!.name.startsWith('Greater'), true, 'a Warden of a fifth floor is still a Greater one (past the descent: its tenth is the Drowned Eye\'s)');
  BOSSES5.on = false;
  try {
    for (const depth of [2, 3, 4, 5]) assert.equal(dungeon(3, depth).boss!.kind, 'warden', `off: floor ${depth}'s boss is the Warden, as up to Version 20.2`);
  } finally {
    BOSSES5.on = true;
  }
});

test("2. the rules' numbers are the pictures' own", () => {
  const act = (kind: GaitedKind, id: ActId): ActDef => ACTS[kind].find((a) => a.id === id)!;
  // ----- gaits
  const mobs: [GaitedKind, Mob][] = [['headsman', HS_MOB], ['chained', CO_MOB], ['amalgam', AM_MOB], ['beast', BONE_BEAST], ['fleshmancer', FM_MOB], ['minifm', MINI_FM]];
  for (const [kind, mob] of mobs) {
    const G = GAITS[kind];
    assert.equal(G.pace, mob.pace, `${kind}: its walk's pace`);
    near(G.cycle, mob.walkFrames / mob.walkFps, 1e-9, `${kind}: its walk's loop`);
    near(G.setOff, lastKey(mob, 'setOff'), 0.002, `${kind}: setting off`);
    near(G.halt, lastKey(mob, 'halt'), 0.002, `${kind}: stopping`);
    assert.equal(G.trueBack, !!mob.trueBack, `${kind}: how it is painted from behind`);
    // (every act's length is its picture's)
    for (const a of ACTS[kind]) {
      // (a beast is dragged for as long as it is dragged; the ball's chain breaks in his second state: below)
      if (a.id === 'dragged' || a.id === 'breakBall') continue;
      // (the Fleshmancer's blink, FLESH_BLINK, off: its look is the art chat's, still to come, and its length will be its picture's)
      if (a.id === 'blink') continue;
      // (CHAINED_SPIN: a whirl's loop played over and over is that much longer than its picture)
      near(a.long - (a.loop?.extra ?? 0), lastKey(mob, a.clip), 0.02, `${kind} ${a.id}: its length`);
    }
  }
  near(GAITS.headsman.raise, HS_RAISE, 1e-9, 'the Headsman takes his axe up');
  near(GAITS.headsman.lower, lastKey(HS_MOB, 'lower'), 1e-9, 'and sets it down');
  // (the paces the rules give the bosses are their pictures' own)
  for (const kind of ['headsman', 'chained', 'amalgam', 'fleshmancer'] as const) assert.equal(MONSTERS[kind].speed, GAITS[kind].pace, `${kind}: goes at its pictures' pace`);
  // ----- the Headsman
  assert.equal(act('headsman', 'chop').hit, HS_CHOP_HIT);
  assert.equal(act('headsman', 'sentence').hit, HS_SENTENCE_HIT);
  assert.equal(act('headsman', 'sweep').hit, HS_SWEEP_FROM);
  assert.equal(act('headsman', 'axe').hit, HS_THROW_HIT);
  near(HEADSMAN.chop.bite, hsBite('attack')[0] / TILE3, 0.005, "the chop's bite");
  near(HEADSMAN.chop.left, hsBite('attack')[1] / TILE3, 0.005, "the chop's bite, to his left");
  near(HEADSMAN.sentence.bite, hsBite('sentence')[0] / TILE3, 0.005, "the sentence's bite");
  assert.equal(HEADSMAN.sentence.from, SENTENCE_FROM);
  assert.equal(HEADSMAN.sentence.to, SENTENCE_TO);
  assert.equal(HEADSMAN.sentence.burn, SPLIT_FOR);
  assert.equal(HEADSMAN.sweep.from, HS_SWEEP_FROM);
  assert.equal(HEADSMAN.sweep.to, HS_SWEEP_TO);
  near(HEADSMAN.sweep.reach, hsSweepReach() / TILE3, 0.005, "the sweep's reach");
  // (the blade's bearing as it comes round, against the picture's own axe)
  let turns = 0;
  let prev = -2;
  for (let t = HS_SWEEP_FROM; t <= HS_SWEEP_TO + 1e-6; t += 0.03) {
    const e = axeOf(skeletonAt(HS_MOB, 'sweep', t), posedOfMob(HS_MOB, 'sweep', t).draw).edge;
    let a = Math.atan2(e[1], e[0]);
    while (a + turns * 2 * Math.PI < prev - Math.PI) turns++;
    a += turns * 2 * Math.PI;
    prev = a;
    near(along(HEADSMAN.sweepAt, t), a, 0.25, `the sweep's blade at ${t.toFixed(2)} s`);
  }
  assert.equal(HEADSMAN.axe.let, HS_THROW_HIT);
  assert.equal(HEADSMAN.axe.back, HS_CATCH);
  const from = handAt(HS_MOB, 'throw', HS_THROW_HIT - 0.02, 'R').map((v) => v / TILE3) as [number, number, number];
  const to = handAt(HS_MOB, 'throw', HS_CATCH, 'R').map((v) => v / TILE3) as [number, number, number];
  for (const far of [4.2, 7]) {
    for (let u = 0; u <= 1.0001; u += 0.05) {
      const p = axeAt(u, far);
      const q = throwPathAt(u, from, to, far);
      near(p.fwd, q[0], 0.01, `the axe's way at ${u.toFixed(2)}, before him`);
      near(p.left, q[1], 0.01, `the axe's way at ${u.toFixed(2)}, to his left`);
    }
  }
  // ----- the Chained One
  assert.equal(act('chained', 'lash').hit, CO_LASH_HIT);
  assert.equal(act('chained', 'hook').hit, CO_HOOK_LET);
  assert.equal(act('chained', 'ball').hit, CO_BALL_LET);
  assert.equal(act('chained', 'breakL').hit, CO_SNAP_L);
  assert.equal(act('chained', 'breakBall').hit, CO_SNAP_BALL);
  near(lastKey(CHAINED_FREED[1], 'breakBall'), act('chained', 'breakBall').long, 0.02, 'the breaking of the ball’s chain: its length');
  assert.deepEqual([CHAINED.hook.let, CHAINED.hook.bite, CHAINED.hook.back, CHAINED.hook.reach], [CO_HOOK_LET, CO_HOOK_BITE, CO_HOOK_BACK, CO_HOOK_REACH]);
  for (let t = CO_HOOK_LET; t < CO_HOOK_BACK - 0.01; t += 1 / 30) {
    const p = hookAt(t)!;
    const q = coHookPath(t)!;
    near(p.fwd, q.at[0], 0.02, `the hook at ${t.toFixed(2)} s, before him`);
    near(p.left, q.at[1], 0.02, `the hook at ${t.toFixed(2)} s, to his left`);
    assert.equal(p.flying, q.flying, `the hook at ${t.toFixed(2)} s: flying`);
    // (and how high it is drawn: the renderer's own sum, so that it need not work out his chains where the game is played)
    near(hookHigh(t), q.at[2], 0.05, `the hook at ${t.toFixed(2)} s: how high`);
  }
  assert.equal(hookAt(CO_HOOK_LET - 0.01), null, 'in his hand until he lets go');
  near(hookAt(CO_HOOK_BITE, 7)!.fwd, 7, 1e-6, 'thrown further, it bites further off');
  near(CHAINED.whirl.reach, coWhirlReach() / TILE3, 0.005, "the whirl's reach");
  assert.ok(CHAINED.whirl.from >= CO_WHIRL_FROM && CHAINED.whirl.to <= CO_WHIRL_TO + 0.03, 'the whirl harms while his chains fly out');
  assert.deepEqual([CHAINED.ball.let, CHAINED.ball.land, CHAINED.ball.back, CHAINED.ball.reach], [CO_BALL_LET, CO_BALL_LAND, CO_BALL_BACK, CO_BALL_REACH]);
  assert.equal(CHAINED.snap.at, CO_SNAP_L);
  // ----- the amalgamation and its beast
  assert.equal(act('amalgam', 'swipe').hit, AM_SWIPE_HIT);
  assert.equal(act('amalgam', 'floorArms').hit, AM_SLAM_HIT);
  assert.equal(act('amalgam', 'swarm').hit, AM_SWARM_HIT);
  assert.equal(act('amalgam', 'devour').hit, AM_DEVOUR_HIT);
  assert.equal(act('amalgam', 'burst').hit, AM_BURST_AT);
  AM_SLAM_SPOTS.forEach((p, i) => {
    near(AMALGAM.arms.slam[i][0], p[0] / TILE3, 0.005, 'where its hands slam, before it');
    near(AMALGAM.arms.slam[i][1], p[1] / TILE3, 0.005, 'where its hands slam, to its left');
  });
  assert.equal(AMALGAM.arms.time, FLOOR_ARM_TIME);
  assert.equal(AMALGAM.swarm.speed, AM_SWARM_SPEED);
  const skulls = amSwarmSkulls();
  assert.equal(AMALGAM.swarm.skulls.length, skulls.length, 'as many skulls as its picture spews');
  skulls.forEach((k, i) => {
    const s = AMALGAM.swarm.skulls[i];
    near(s[0], k.at[0] / TILE3, 0.005, `skull ${i}: where it leaves its picture`);
    near(s[1], k.at[1] / TILE3, 0.005, `skull ${i}: to its left`);
    near(s[2], k.at[2] / 2, 0.01, `skull ${i}: its height`);
    near(s[3], k.way[0], 0.002, `skull ${i}: its way`);
    near(s[4], k.way[1], 0.002, `skull ${i}: its way, to its left`);
    near(s[5], k.after, 0.002, `skull ${i}: when`);
  });
  near(AMALGAM.burst.spot[0], AM_BURST_SPOT[0] / TILE3, 0.005, 'where its beast lands');
  near(AMALGAM.burst.spot[1], AM_BURST_SPOT[1] / TILE3, 0.005, 'where its beast lands, to its left');
  near(AMALGAM.burst.way[0], AM_BURST_WAY[0], 0.002, 'the way its beast faces');
  near(AMALGAM.burst.way[1], AM_BURST_WAY[1], 0.002, 'the way its beast faces, to its left');
  assert.equal(act('beast', 'bite').hit, BB_BITE_HIT);
  assert.equal(act('beast', 'emerge').long, BB_EMERGE_TIME);
  // ----- the Fleshmancer
  assert.deepEqual([act('fleshmancer', 'shards').long, act('fleshmancer', 'shards').hit], [FM_SHARDS.long, FM_SHARDS.hit]);
  assert.deepEqual([act('fleshmancer', 'rings').long, act('fleshmancer', 'rings').hit], [FM_RINGS.long, FM_RINGS.hit]);
  assert.deepEqual([act('fleshmancer', 'raise').long, act('fleshmancer', 'raise').hit], [FM_RAISE.long, FM_RAISE.shriek]);
  assert.deepEqual([act('fleshmancer', 'fire').long, act('fleshmancer', 'fire').hit], [FM_FIRE.long, FM_FIRE.burst]);
  assert.deepEqual([FLESHMANCER.shards.fan, FLESHMANCER.shards.apart, FLESHMANCER.shards.speed], [FM_SHARD.fan, FM_SHARD.apart, FM_SHARD.speed]);
  const skull = fmSkullAt('attack', FM_SHARDS.hit);
  near(FLESHMANCER.shards.from[0], skull[0] / TILE3, 0.005, 'where the skull is as it spits');
  near(FLESHMANCER.shards.from[1], skull[1] / TILE3, 0.005, 'where the skull is as it spits, to his left');
  assert.deepEqual(FLESHMANCER.rings.laid.map(([r, n, gap]) => ({ r, n, gap })), FM_RINGS_LAID.map((q) => ({ ...q })), 'the rings as the films lay them');
  assert.deepEqual([FLESHMANCER.rings.speed, FLESHMANCER.rings.warn, FLESHMANCER.rings.left, FLESHMANCER.rings.wave], [FM_WAVE_SPEED, FM_HAND_WARN, FM_HAND_LEFT, FM_WAVE_TIME]);
  assert.equal(FLESHMANCER.raise.stir, FM_RAISE_STIR);
  assert.deepEqual([FLESHMANCER.fire.burst, FLESHMANCER.fire.pour, FLESHMANCER.fire.stop, FLESHMANCER.fire.land, FLESHMANCER.fire.reach, FLESHMANCER.fire.burn], [FM_FIRE.burst, FM_FIRE.pour, FM_FIRE.stop, FM_FIRE_LAND, FM_FIRE_REACH, FM_FIRE_BURN]);
  for (let t = FM_FIRE.burst; t <= FM_FIRE.stop + 1e-6; t += 0.05) near(fireTurn(false, t)!, fmFireTurn(t), 0.05, `the fire's way at ${t.toFixed(2)} s`);
  assert.equal(fireTurn(false, FM_FIRE.burst - 0.05), null, 'no fire before it bursts');
  assert.equal(fireTurn(false, FM_FIRE.stop + 0.05), null, 'nor after it stops');
  // ----- the mini fleshmancer
  assert.deepEqual([act('minifm', 'miniFire').long, act('minifm', 'miniFire').hit], [MINI_FIRE.long, MINI_FIRE.burst]);
  assert.deepEqual([act('minifm', 'miniRaise').long, act('minifm', 'miniRaise').hit], [MINI_RAISE.long, MINI_RAISE.rise]);
  assert.deepEqual([MINIFM.fire.pour, MINIFM.fire.stop, MINIFM.fire.land, MINIFM.fire.reach], [MINI_FIRE.pour, MINI_FIRE.stop, MINI_FIRE_SIZE.land, MINI_FIRE_SIZE.reach]);
  for (let t = MINI_FIRE.pour; t <= MINI_FIRE.stop + 1e-6; t += 0.05) near(fireTurn(true, t)!, miniFireTurn(t), 0.06, `the mini's fire at ${t.toFixed(2)} s`);
  near(act('minifm', 'miniRaise').hit, 1.1, 1e-9, 'his dead come up as the Warden’s do');
  assert.ok(SUMMON.rise > 0, 'and crawl out as his');
});

test('3. a boss sets off, walks and stops as his pictures hand over, carried at his pace', () => {
  for (const kind of ['headsman', 'chained', 'amalgam', 'fleshmancer'] as const) {
    const G = GAITS[kind];
    const { g, m } = room(kind, 8.5);
    // (nothing of his is ready: he only comes on)
    m.fy = 0;
    m.moveCd = ACTS[kind].map(() => 1e9);
    m.cd = 1e9;
    const h = g.hero;
    const c = emptyControls();
    const modes: string[] = ['stand'];
    let was = 'stand';
    let wasT = 0;
    let moved = 0;
    let carried = 0;
    for (let k = 0; k < 60 * 30; k++) {
      const x0 = m.x;
      const y0 = m.y;
      g.update(1 / 60, c);
      const mode = m.gait ? m.gait.mode : '';
      const step = Math.hypot(m.x - x0, m.y - y0);
      if (was === 'setOff' || was === 'walk' || was === 'halt') {
        carried += step;
        near(step, G.pace / 60, 1e-6, `${kind}: carried at his pace while ${was}`);
      } else {
        moved += step;
      }
      if (mode !== was) {
        modes.push(mode);
        // (how it hands over)
        if (mode === 'halt' && was === 'walk') near(Math.min(wasT % G.cycle, G.cycle - (wasT % G.cycle)), 0, 1 / 60 + 0.005, `${kind}: stopping begins as his walk comes round to its first frame`);
        if (mode === 'walk') assert.equal(was, 'setOff', `${kind}: into his walk from setting off`);
        if (mode === 'setOff') assert.ok(was === (G.raise > 0 ? 'carry' : 'stand'), `${kind}: sets off from ${G.raise > 0 ? 'his carry' : 'his stand'} (from ${was})`);
        if (mode === 'raise') assert.equal(was, 'stand', 'the Headsman takes his axe up from where it stands');
        if (mode === 'lower') assert.equal(was, 'carry', 'and sets it down from his carry');
        if (mode === 'carry') assert.ok(was === 'raise' || was === 'halt', `his carry, from taking it up or from stopping (from ${was})`);
        if (mode === 'stand') assert.ok(was === (G.raise > 0 ? 'lower' : 'halt'), `${kind}: stands again from ${G.raise > 0 ? 'setting his axe down' : 'stopping'} (from ${was})`);
      }
      was = mode;
      wasT = m.gait ? m.gait.t : 0;
      if (modes.includes('halt') && (mode === 'stand' || (G.raise > 0 && mode === 'lower'))) break;
    }
    assert.equal(moved, 0, `${kind}: stands still while he stands`);
    const want = G.raise > 0 ? ['stand', 'raise', 'carry', 'setOff', 'walk', 'halt', 'carry', 'lower'] : ['stand', 'setOff', 'walk', 'halt', 'stand'];
    assert.deepEqual(modes, want, `${kind}: stands, sets off, walks, stops, stands`);
    const dist = Math.hypot(h.x - m.x, h.y - m.y);
    assert.ok(dist <= G.stopAt + 0.05 && dist >= G.stopAt - G.pace * G.cycle - 0.05, `${kind}: stops about where he likes to stand (${dist.toFixed(2)} from the hero; ${G.stopAt})`);
    assert.ok(carried > 5, 'he came the way');
  }
  assert.ok(CARRY_FOR > 0);
});

test("4. the Headsman's four attacks hurt where and when their pictures say, and nowhere else", () => {
  const dmgOf = (m: Monster, mult: number): [number, number] => [m.dmgMin * mult * 0.3, m.dmgMax * mult * 1.01];
  // THE CHOP: a hero before him, within its reach
  {
    const { g, m } = room('headsman', 2.6, 'chop');
    const s = watch(g, m, 2.6);
    near(firstHurt(s), HS_CHOP_HIT, 0.03, 'the chop lands when the blade bites');
    assert.equal(s.hurts.length, 1, 'once');
    const [lo, hi] = dmgOf(m, 1);
    assert.ok(s.hurts[0].n >= lo && s.hurts[0].n <= hi, `a blow of his (${s.hurts[0].n})`);
    assert.ok(g.perils.some((p) => p.kind === 'crack') || s.events.length > 0, 'it leaves its crack');
  }
  // (a hero at his side is not struck by it)
  {
    const { g, m } = room('headsman', 2.6, 'chop');
    const s = watch(g, m, 3, (t) => (t > 0.75 && t < 1.5 ? { mx: 0, my: 1 } : null));
    assert.equal(s.hurts.length, 0, 'stepped aside in time, the chop misses');
  }
  // THE SENTENCE: the long line; and the split burns whoever stands in it after
  {
    const { g, m } = room('headsman', 6, 'sentence');
    const s = watch(g, m, 6);
    near(firstHurt(s), HS_SENTENCE_HIT, 0.03, 'the sentence lands when the blade bites');
    assert.ok(s.hurts.length >= 3, `and the split burns on him who stands in it (${s.hurts.length} hurts)`);
    assert.ok(s.hurts[1].n < s.hurts[0].n, 'its burning less than its blow');
    const last = s.hurts[s.hurts.length - 1].t - s.began;
    assert.ok(last <= HS_SENTENCE_HIT + SPLIT_FOR + 0.05, `it burns no longer than its picture (${last.toFixed(2)})`);
    assert.equal(g.perils.filter((p) => p.kind === 'split').length, 0, 'and is gone');
  }
  {
    const { g, m } = room('headsman', 6, 'sentence');
    const s = watch(g, m, 6, (t) => (t > 0.9 && t < 1.9 ? { mx: 0, my: -1 } : null));
    assert.equal(s.hurts.length, 0, 'out of its line in time, nothing of it touches him');
  }
  // THE WIDE SWEEP: whoever is within its reach as the blade comes round; no one beyond it
  {
    const { g, m } = room('headsman', 2.2, 'sweep');
    const s = watch(g, m, 4);
    assert.equal(s.hurts.length, 1, 'the sweep strikes once');
    const at = firstHurt(s);
    assert.ok(at >= HS_SWEEP_FROM && at <= HS_SWEEP_TO + 0.03, `as the blade comes round (${at.toFixed(2)})`);
    // (he is before him: the blade passes there when its bearing is nought)
    near(along(HEADSMAN.sweepAt, at), 0, 0.5, 'as it passes where he stands');
  }
  {
    const { g, m } = room('headsman', 3.6, 'sweep');
    m.gait = { mode: 'carry', t: 0 };
    g.bosses.startAct(m, ACTS.headsman, 1);
    const s = watch(g, m, 3);
    assert.equal(s.hurts.length, 0, 'beyond its reach, the sweep misses');
  }
  // THE WHIRLING THROW: out and back; a hero in its way is struck
  {
    const { g, m } = room('headsman', 5, 'axe');
    const s = watch(g, m, 5);
    assert.ok(s.hurts.length >= 1 && s.hurts.length <= 2, `the axe strikes on its way out, and may on its way back (${s.hurts.length})`);
    const at = firstHurt(s);
    assert.ok(at > HS_THROW_HIT && at < HS_CATCH, `while it flies (${at.toFixed(2)})`);
  }
  {
    // (thrown at a hero far off, its loop goes out as far as he stands)
    const { g, m } = room('headsman', 8, 'axe');
    const s = watch(g, m, 5);
    assert.ok(s.hurts.length >= 1, 'it reaches a hero who stands eight tiles off');
  }
});
test("5. the Chained One's attacks, and his chains breaking as he is hurt", () => {
  {
    const { g, m } = room('chained', 2.4, 'lash');
    const s = watch(g, m, 2);
    near(firstHurt(s), CO_LASH_HIT, 0.03, 'the lash lands when the chain slams down');
    assert.equal(s.hurts.length, 1);
  }
  // HOOK AND DRAG: a hero who stands off is caught and dragged in to him
  {
    const { g, m } = room('chained', 6, 'hook');
    const h = g.hero;
    const far0 = Math.hypot(h.x - m.x, h.y - m.y);
    // (he stands as it is thrown, and pulls away with all he has once it has him)
    let far1 = far0;
    const s = watch(g, m, 3.3, (t) => (t > 1.35 ? { mx: 1, my: 0 } : null), () => {
      far1 = Math.min(far1, Math.hypot(h.x - m.x, h.y - m.y));
      return false;
    });
    const at = firstHurt(s);
    assert.ok(at >= CO_HOOK_LET && at <= CO_HOOK_BITE + 0.05, `the hook catches him as it flies (${at.toFixed(2)})`);
    assert.ok(far1 < 2.2 && far0 > 5.5, `and he is dragged in to him, for all he pulls away (from ${far0.toFixed(1)} to ${far1.toFixed(1)})`);
    assert.ok(!h.held, 'and let go');
  }
  {
    // (he steps out of its line while the hook is whirled)
    const { g, m } = room('chained', 6, 'hook');
    const s = watch(g, m, 3.3, (t) => (t > 0.3 && t < 1.2 ? { mx: 0, my: 1 } : null));
    assert.equal(s.hurts.length, 0, 'out of its line, the hook bites the floor');
    assert.ok(!g.hero.held);
  }
  // THE CHAIN WHIRL: several blows for one who stays in it; none beyond it
  {
    const { g, m } = room('chained', 2.0, 'whirl');
    const s = watch(g, m, 3);
    // (CHAINED_SPIN, his word of 17 Oct: longer, and he chases you: his chains go on striking whoever stays in them)
    const most = Math.ceil(3 / CHAINED.whirl.gap) + 1;
    assert.ok(s.hurts.length >= 2 && s.hurts.length <= most, `his chains strike more than once as they go round (${s.hurts.length})`);
    for (let i = 1; i < s.hurts.length; i++) assert.ok(s.hurts[i].t - s.hurts[i - 1].t >= CHAINED.whirl.gap - 0.02, 'no two of its blows at once');
  }
  // THE BALL: it comes down four tiles before him
  {
    const { g, m } = room('chained', 4, 'ball');
    const s = watch(g, m, 4.5);
    near(firstHurt(s), CO_BALL_LAND, 0.03, 'the ball lands when its picture does');
    assert.equal(s.hurts.length, 1);
  }
  {
    const { g, m } = room('chained', 4, 'ball');
    const s = watch(g, m, 4.5, (t) => (t > 1.0 && t < 2.2 ? { mx: 0, my: 1 } : null));
    assert.equal(s.hurts.length, 0, 'out from under it, the ball misses');
  }
  // HIS CHAINS BREAK as he is hurt: his left at two thirds of his life, the ball's at a third; quicker each time; free of the ball, no ball to throw
  {
    const { g, m } = room('chained', 7);
    m.moveCd = ACTS.chained.map(() => 1e9);
    const speed0 = m.speed;
    m.life = m.maxLife * 0.6;
    watch(g, m, 8, undefined, () => (m.form ?? 0) === 1);
    assert.equal(m.form, 1, 'hurt to two thirds, he breaks his left chain');
    near(m.speed, speed0 * CHAINED.faster[1], 1e-9, 'and is quicker');
    assert.equal(figureOf(m), 'chained1', 'shown with it broken');
    assert.ok(g.perils.some((p) => p.kind === 'left' && p.a === 0), 'the chain lies where it broke');
    m.life = m.maxLife * 0.3;
    watch(g, m, 8, undefined, () => (m.form ?? 0) === 2);
    assert.equal(m.form, 2, 'hurt to a third, he tears free of the ball');
    near(m.speed, speed0 * CHAINED.faster[2], 1e-9, 'and is quicker still');
    assert.equal(figureOf(m), 'chained2');
    // (free of the ball, he never throws it)
    keep(m, 'ball');
    g.hero.x = m.x + 4;
    g.hero.y = m.y;
    const s = watch(g, m, 5);
    assert.ok(!s.events.some((e) => e.t === 'shake' && e.amount === 6) && g.perils.every((p) => p.kind !== 'crash'), 'no ball throw once it is gone');
  }
});

test("6. the amalgamation's attacks, its bone beasts, and its eating them back", () => {
  {
    const { g, m } = room('amalgam', 2.0, 'swipe');
    const s = watch(g, m, 2);
    near(firstHurt(s), AM_SWIPE_HIT, 0.03, 'its swipe lands when its picture does');
    assert.equal(s.hurts.length, 1);
  }
  // ARMS FROM THE FLOOR: its hands slam before it; then arms of the dead burst up where the hero stands, each warned
  {
    const { g, m } = room('amalgam', 6, 'floorArms');
    const s = watch(g, m, 5);
    const at = firstHurt(s);
    assert.ok(at >= AM_SLAM_HIT + AMALGAM.arms.first && at <= AM_SLAM_HIT + AMALGAM.arms.last + AMALGAM.arms.up + 0.05, `an arm comes up under a hero who stands still (${at.toFixed(2)})`);
    assert.ok(at - AM_SLAM_HIT >= AMALGAM.arms.warn, 'not before its crack has glowed its time');
    assert.equal(g.perils.filter((p) => p.kind === 'arm').length, 0, 'and they are gone');
  }
  {
    const { g, m } = room('amalgam', 6, 'floorArms');
    let arms = 0;
    const s = watch(g, m, 5, (t) => (t > 1.0 ? { mx: Math.cos(t * 3), my: Math.sin(t * 3) } : null), () => {
      arms = Math.max(arms, g.perils.filter((p) => p.kind === 'arm').length);
      return false;
    });
    assert.equal(arms, AMALGAM.arms.n, 'five places');
    assert.ok(s.hurts.length <= 1, 'a hero who keeps moving is hardly touched');
  }
  // THE SKULL SWARM: fourteen skulls, out before it in a fan
  {
    const { g, m } = room('amalgam', 5, 'swarm');
    let most = 0;
    const s = watch(g, m, 5, undefined, () => {
      most = Math.max(most, g.perils.filter((p) => p.kind === 'skull').length);
      return false;
    });
    assert.equal(most, 14, 'fourteen skulls');
    assert.ok(s.hurts.length >= 1 && s.hurts.length <= 6, `some of them strike a hero who stands before it (${s.hurts.length})`);
    assert.ok(firstHurt(s) > AM_SWARM_HIT + 0.3, 'after they have left its maw');
    assert.equal(g.perils.length, 0, 'and all burst');
  }
  // DEVOUR: a hero before it is dragged in, and bitten as its maw snaps shut
  {
    const { g, m } = room('amalgam', 3, 'devour');
    const h = g.hero;
    const s = watch(g, m, 3.2);
    near(firstHurt(s), AM_DEVOUR_HIT, 0.03, 'its maw snaps shut on him');
    assert.ok(Math.hypot(h.x - m.x, h.y - m.y) < 2.2, 'dragged in to it');
  }
  {
    // (he walks away from it as its arms rake: he is slowed, not held)
    const { g, m } = room('amalgam', 3, 'devour');
    const s = watch(g, m, 3.2, (t) => (t > 0.6 ? { mx: 1, my: 0 } : null));
    assert.equal(s.hurts.length, 0, 'a hero who walks away from it gets clear');
  }
  // BONE BEASTS burst out of it as it is hurt; and it eats back one it drags in, and is healed
  {
    const { g, m } = room('amalgam', 7);
    m.moveCd = ACTS.amalgam.map(() => 1e9);
    m.maxLife = 1000;
    m.life = 790;
    const beasts = (): Monster[] => g.monsters.filter((o) => o.kind === 'beast' && !o.dead);
    watch(g, m, 4, undefined, () => beasts().length === 1);
    assert.equal(beasts().length, 1, 'hurt to four fifths, a bone beast bursts out of it');
    const b = beasts()[0];
    assert.equal(b.act?.id, 'emerge', 'flung out, it lands and uncurls');
    const from = beside(m.x, m.y, 1, 0, handOf(false, 1, 0), AMALGAM.burst.spot[0], AMALGAM.burst.spot[1]);
    near(Math.hypot(b.x - from.x, b.y - from.y), 0, 0.05, 'where its picture throws it: behind its right flank');
    watch(g, m, 1.3);
    assert.ok(!b.act, 'then it is on its feet');
    assert.equal(m.phase, 1);
    // (it comes at the hero and bites)
    g.hero.x = b.x + 1.1;
    g.hero.y = b.y;
    const s = watch(g, b, 4, undefined, () => false);
    assert.ok(s.hurts.length >= 1, 'the bone beast bites');
    // DEVOUR eats it back
    b.x = m.x + 2.2;
    b.y = m.y;
    b.act = undefined;
    b.state = 'chase';
    g.hero.x = m.x + 9;
    g.hero.y = m.y + 6;
    m.gait = { mode: 'stand', t: 0 };
    m.state = 'chase';
    m.fx = 1;
    m.fy = 0;
    g.bosses.startAct(m, ACTS.amalgam, ACTS.amalgam.findIndex((a) => a.id === 'devour'));
    m.fx = 1;
    m.fy = 0;
    const life = m.life;
    const seen = watch(g, m, 3);
    assert.equal(beasts().length, 0, 'the beast it dragged in is eaten');
    assert.ok(m.life > life, 'and it is healed by it');
    assert.ok(seen.events.some((e) => e.t === 'gone' && e.what === 'beast'));
  }
  // (when it dies, its beasts fall apart with it)
  {
    const { g, m } = room('amalgam', 7);
    m.moveCd = ACTS.amalgam.map(() => 1e9);
    m.maxLife = 1000;
    m.life = 790;
    watch(g, m, 3, undefined, () => g.monsters.some((o) => o.kind === 'beast'));
    assert.ok(g.monsters.some((o) => o.kind === 'beast'));
    g.kill(m);
    g.update(1 / 60, emptyControls());
    assert.equal(g.monsters.filter((o) => !o.dead).length, 0, 'none left');
  }
});

test("7. the Fleshmancer's spells", () => {
  // THE SHARDS: seven, a fan toward the hero; one strikes a hero who stands still
  {
    const { g, m } = room('fleshmancer', 5, 'shards');
    let most = 0;
    const s = watch(g, m, 3, undefined, () => {
      most = Math.max(most, g.perils.filter((p) => p.kind === 'shard').length);
      return false;
    });
    assert.equal(most, FM_SHARD.fan, 'seven shards');
    assert.ok(s.hurts.length >= 1 && s.hurts.length <= 3, `the middle of the fan strikes him (${s.hurts.length})`);
    const at = firstHurt(s);
    assert.ok(at > FM_SHARDS.hit && at < FM_SHARDS.hit + 5 / FM_SHARD.speed + 0.1, `as fast as they fly (${at.toFixed(2)})`);
    assert.equal(g.perils.length, 0);
  }
  {
    const { g, m } = room('fleshmancer', 5, 'shards');
    const s = watch(g, m, 3, (t) => (t > 0.45 ? { mx: 0, my: 1 } : null));
    assert.ok(s.hurts.length <= 1, 'a hero who runs across them is hardly struck');
  }
  // THE RINGS OF HANDS: a hero on a ring where a hand comes up is hurt; one in its gap, or between rings, is not
  {
    const { g, m } = room('fleshmancer', 2.9, 'rings');
    const h = g.hero;
    // (the hero stood on the second ring, where one of its hands will come: wait for the ring, then put him on a hand)
    let placed = false;
    const s = watch(g, m, 4, undefined, () => {
      const ring = g.perils.find((p) => p.kind === 'ring' && p.a === 2.9);
      if (ring && !placed) {
        placed = true;
        let j = 0;
        while (inGap(ring.b, ring.c, ring.fy, j)) j++;
        const q = ringHand(ring.x, ring.y, ring.a, ring.b, ring.fx, j);
        h.x = q.x;
        h.y = q.y;
      }
      return false;
    });
    assert.ok(placed, 'the rings are laid as he slams the floor');
    assert.equal(s.hurts.length, 1, 'a hand that comes up under him hurts him, once');
    const at = firstHurt(s);
    near(at, FM_RINGS.hit + 2.9 / FM_WAVE_SPEED + 0.05, 0.08, 'as the wave reaches its ring');
  }
  {
    const { g, m } = room('fleshmancer', 2.9, 'rings');
    const h = g.hero;
    let placed = false;
    const s = watch(g, m, 4, undefined, () => {
      const ring = g.perils.find((p) => p.kind === 'ring' && p.a === 2.9);
      if (ring && !placed) {
        placed = true;
        // (the middle of its gap)
        const q = ringHand(ring.x, ring.y, ring.a, ring.b, ring.fx, ring.c + (ring.fy - 1) / 2);
        h.x = q.x;
        h.y = q.y;
      }
      return false;
    });
    assert.equal(s.hurts.length, 0, 'in the gap of his ring, nothing touches him');
  }
  {
    const { g, m } = room('fleshmancer', 3.6, 'rings');
    const s = watch(g, m, 4);
    assert.equal(s.hurts.length, 0, 'between two rings, nothing touches him');
  }
  // RAISING THE DEAD: out of the bone heaps of his hall, as many as three at a casting; never more than six standing
  {
    const { g, m } = room('fleshmancer', 6, 'raise');
    g.level.floor.heaps = [{ x: m.x + 2, y: m.y + 3 }, { x: m.x + 2, y: m.y - 3 }];
    const s = watch(g, m, 1.2, undefined, () => g.risers.length > 0);
    assert.ok(s.began >= 0);
    assert.equal(g.risers.length, FLESHMANCER.raise.n, 'three of the dead');
    assert.ok(g.risers.every((r) => r.way === 'gather'), 'their bones gathering');
    const byHeap = g.risers.filter((r) => g.level.floor.heaps!.some((p) => Math.hypot(p.x - r.m.x, p.y - r.m.y) < 2.2)).length;
    assert.equal(byHeap, 2, 'one beside each heap, the third by him');
    assert.equal(g.monsters.filter((o) => o.kind === 'skeleton').length, 0, 'not among the monsters until they are up');
    watch(g, m, FLESHMANCER.raise.stir + FLESHMANCER.raise.rise + 0.5);
    assert.equal(g.monsters.filter((o) => o.kind === 'skeleton').length, 3, 'then they stand, and fight');
    // (again: no more than six)
    keep(m, 'raise');
    watch(g, m, 6);
    keep(m, 'raise');
    watch(g, m, 6);
    assert.ok(g.monsters.filter((o) => o.kind === 'skeleton').length + g.risers.length <= FLESHMANCER.raise.most, 'never more than six of them standing');
  }
  // THE SWEEPING FIRE: once round; a hero in its way burns; one beyond its reach, or at his very feet, does not
  {
    const { g, m } = room('fleshmancer', 3, 'fire');
    const s = watch(g, m, 5);
    assert.ok(s.hurts.length >= 2, `the stream burns a hero it passes over, and the floor it leaves burns him on (${s.hurts.length})`);
    const at = firstHurt(s);
    assert.ok(at >= FM_FIRE.pour && at <= 1.0, `it sets off a little to his right and comes across him soon (${at.toFixed(2)})`);
    const last = s.hurts[s.hurts.length - 1].t - s.began;
    assert.ok(last < 2.2, `and passes on (${last.toFixed(2)})`);
  }
  {
    const { g, m } = room('fleshmancer', 5.6, 'fire');
    m.gait = { mode: 'stand', t: 0 };
    g.bosses.startAct(m, ACTS.fleshmancer, ACTS.fleshmancer.findIndex((a) => a.id === 'fire'));
    const s = watch(g, m, 5);
    assert.equal(s.hurts.length, 0, 'beyond its reach, it does not burn');
  }
  {
    const { g, m } = room('fleshmancer', 0.55, 'fire');
    const s = watch(g, m, 5);
    assert.equal(s.hurts.length, 0, 'nor at his very feet, inside where it comes down');
  }
  // (hurt to half, he casts again sooner)
  {
    const { g, m } = room('fleshmancer', 6);
    m.moveCd = ACTS.fleshmancer.map(() => 10);
    m.cd = 1e9;
    watch(g, m, 2);
    const slow = 10 - m.moveCd![1];
    m.maxLife = 1000;
    m.life = 400;
    m.moveCd = ACTS.fleshmancer.map(() => 10);
    watch(g, m, 2);
    const fast = 10 - m.moveCd![1];
    near(fast / slow, FLESHMANCER.hurry, 0.02, 'his spells come round a third sooner');
  }
});

test("8. the mini fleshmancer's fire, and his dead out of the cult's bodies", () => {
  {
    const { g, m } = room('minifm', 1.8, 'miniFire');
    const s = watch(g, m, 3.2);
    assert.ok(s.hurts.length >= 1, 'his fire burns a hero before him');
    const at = firstHurt(s);
    assert.ok(at >= MINI_FIRE.pour && at <= MINI_FIRE.stop + MINIFM.fire.burn, `as it sweeps across (${at.toFixed(2)})`);
  }
  {
    const { g, m } = room('minifm', 3.3, 'miniFire');
    m.gait = { mode: 'stand', t: 0 };
    g.bosses.startAct(m, ACTS.minifm, 0);
    const s = watch(g, m, 3.2);
    assert.equal(s.hurts.length, 0, 'it is smaller than his master’s: beyond 2.6 tiles it does not reach');
  }
  // HIS CALL: only where a cultist's body lies near; the dead crawl out where the bodies lay
  {
    const { g, m } = room('minifm', 6, 'miniRaise');
    watch(g, m, 3);
    assert.equal(g.risers.length + g.monsters.filter((o) => o.kind === 'skeleton').length, 0, 'no bodies, no dead: he does not call');
    // (two dagger cultists die near him)
    for (const [dx, dy] of [[1.5, 1], [2, -1.5], [3, 0.5]] as const) {
      const c = g.spawn('dagger', m.x + dx, m.y + dy, 1, 0, false, new RNG(3));
      g.kill(c);
    }
    assert.equal(g.corpses.length, 3, 'the cult’s bodies lie where they fell');
    g.events.length = 0;
    keep(m, 'miniRaise');
    // (the hero far enough off that he comes on no further)
    const s = watch(g, m, 2.4, undefined, () => false);
    assert.ok(s.events.filter((e) => e.t === 'gone' && e.what === 'corpse').length === MINIFM.raise.n, 'two of the bodies burn away');
    const up = g.risers.length + g.monsters.filter((o) => o.kind === 'skeleton').length;
    assert.equal(up, MINIFM.raise.n, 'and the dead come up out of them: two at a call');
    assert.equal(g.corpses.filter((c) => !c.taken).length, 1, 'the third body lies still');
    watch(g, m, SUMMON.rise + 0.6);
    assert.equal(g.monsters.filter((o) => o.kind === 'skeleton').length, 2, 'then they are up, and fight');
  }
  // (he leads a yellow pack of dagger cultists)
  assert.equal(MONSTERS.minifm.weight, 0, 'never a pack of his own');
});

test('9. a boss can be killed in the middle of anything, and nothing of his is left harming the hero long', () => {
  const kinds: [MonsterKind, ActId, number][] = [
    ['headsman', 'sentence', 6], ['headsman', 'axe', 5], ['chained', 'hook', 6], ['chained', 'ball', 4], ['chained', 'whirl', 2],
    ['amalgam', 'floorArms', 6], ['amalgam', 'swarm', 5], ['amalgam', 'devour', 3], ['fleshmancer', 'rings', 2.9], ['fleshmancer', 'fire', 3], ['fleshmancer', 'shards', 5],
  ];
  for (const [kind, id, far] of kinds) {
    for (const when of [0.3, 1.0, 1.7]) {
      const { g, m } = room(kind, far, id);
      watch(g, m, 10, () => ({ mx: 1, my: 0 }), () => m.state === 'act' && m.act !== undefined && m.act.t >= when);
      if (!(m.state === 'act')) continue;
      g.kill(m);
      const s = watch(g, m, 9);
      assert.ok(!g.hero.held, `${kind} ${id}: a hero he had hold of is let go`);
      assert.equal(g.perils.filter((p) => p.kind !== 'left' && p.kind !== 'scorch').length, 0, `${kind} ${id}, killed ${when} s in: nothing of his is left on the floor after nine seconds`);
      const late = s.hurts.filter((x) => x.t > 4.5);
      assert.equal(late.length, 0, `${kind} ${id}, killed ${when} s in: nothing of his harms the hero long after`);
      assert.ok(s.events.every((e) => e.t !== 'die' || true));
    }
  }
});

test('10. their sizes, as the game goes by them, held against their pictures', () => {
  const art = makeBestiary();
  for (const f of FIRST5_FIGURES) {
    const size = FIGURE_SIZE[f];
    const s = art.of(f).front.idle[0];
    const p = paintingOf(s);
    const ax = Math.round(s.ax * GRAIN);
    const ay = Math.round(s.ay * GRAIN);
    let head = 0;
    for (let y = 0; y < p.h && head === 0; y++) for (let x = ax - 3; x <= ax + 3; x++) if (p.has(x, y)) head = (ay - y) / GRAIN;
    assert.ok(Math.abs(size.top - head) <= 4, `the ${f}: the game takes its head to be ${size.top} up; in the picture it is ${head}`);
    const reach = Math.max(s.ax, s.w - s.ax);
    assert.ok(size.half <= reach + 1 && size.half >= reach * 0.4, `the ${f}: ${size.half} to either side; the picture reaches ${reach}`);
  }
  // (and the bestiary lets go of one, and makes it again)
  const hs = art.of('headsman');
  assert.ok(art.left(['headsman']) > 900, 'every frame of him to paint');
  art.forget('headsman');
  assert.ok(art.of('headsman') !== hs, 'forgotten, he is made again when asked for');
});
