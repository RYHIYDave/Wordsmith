// ACT 2, THE HUSH: FLOOR 11'S BOSS, THE CRIER, IN THE GAME behind ACT2 (game/act1_rules/crier.ts; his pictures
// art/act1_figs/crier.ts, the art chat's art/crier.ts and art/crier_moves.ts; what he draws, render/act1_fx/crier.ts, the
// art chat's art/crier_shots.ts):
//   1. he is built: his rules, his pictures with every clip his acts name, what he draws; floor 11's boss with the act on,
//      and nowhere with it off; a heavy figure, painted by the painter; his line, a silent man's;
//   2. the rules' numbers are his pictures' own (his march, every move's length and moments, where his bell comes down,
//      the way his trumpet points as he shouts and its cone, the way he flings the scroll and its lane, his call's rings and
//      the pools the Hushed come out of);
//   3. his swing lands at its picture's moment, where the bell comes down and under the trumpet, and not beside or behind;
//   4. the Silent Shout: in its cone the hero's words go dark (the Hush), for a while after he is out of it; each wave of
//      dead air that rolls over him hurts; out of it (beside, behind, beyond), nothing;
//   5. the Proclamation: its roll strikes whoever it passes over, once, as it races down its lane; not beside it, nor what
//      walks onto it once it lies; only where its lane is open floor;
//   6. the Crowd: the Hushed come out where his call's rings reach, at the edges of his square on his floor, a few at a
//      call, more once he is hurt, never more than so many;
//   7. killed in the middle of anything, nothing of his is left harming the hero; a long fight throws nothing, and he
//      makes all four;
//   8. what he draws is the enemy's colours and the Hush's, never cyan; his size as the game goes by it, against his picture.
//   run: tsx --test tests/act2_crier.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { FIG } from '../src/art/act1_figs/crier';
import { FIGURE_SIZE, FIRST5_FIGURES, HEAVY_FIGURES, makeBestiary } from '../src/art/bestiary';
import { CRIER as CRIER_SWITCH, CR_CROWD, CR_PROCLAIM, CR_SHOUT, CR_SWING_HIT, trumpetOf } from '../src/art/crier';
import { CRIER_MOB, CR_HALT, CR_PACE, CR_SET_OFF, CR_WALK_FPS, CR_WALK_FRAMES, makeCrierArt } from '../src/art/crier_moves';
import { CROWD_FOR, PROCLAIM_CRUMBLES, PROCLAIM_FOR, PROCLAIM_FROM, PROCLAIM_HALF, PROCLAIM_LANDS, PROCLAIM_TO, PROCLAIM_UNROLLED, RISING_FOR, RISING_OUT, SHOUT_FOR, SHOUT_FROM, SHOUT_HALF, SHOUT_TO, SLAM_FOR } from '../src/art/crier_shots';
import { GRAIN } from '../src/art/kit';
import { TILE3, posedOfMob, skeletonAt } from '../src/art/new_mobs3';
import { RNG } from '../src/engine/rng';
import { ACT2 } from '../src/game/act1';
import { blobDist } from '../src/game/act1_layout';
import { CRIER, CRIER_ACTS, CRIER_GAIT, RULES, answers, callReaches, proclaimWay, scrollFront, slamSpot } from '../src/game/act1_rules/crier';
import { act2Pack } from '../src/game/act2_mobs';
import { actsOf, bossKind, gaitOf } from '../src/game/bosses';
import { BOSS_LINES, MONSTERS, sizeOf } from '../src/game/defs';
import { fromFigure } from '../src/game/facing';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { ActId, GameEvent, Monster } from '../src/game/state';
import { FX } from '../src/render/act1_fx/crier';
import { cyanGlow, fakeCtx } from './act1_kinds_room';
import { paintWithoutCanvas, paintingOf, seasoned } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);
const act = (id: string) => CRIER_ACTS.find((a) => a.id === id)!;
const idx = (id: string): number => CRIER_ACTS.findIndex((a) => a.id === id);

/** With the act on, for `fn`. */
function hush<T>(fn: () => T): T {
  const was = ACT2.on;
  ACT2.on = true;
  try {
    return fn();
  } finally {
    ACT2.on = was;
  }
}

/** An empty practice room, the hero still at its middle, and the Crier `far` tiles west of him, awake, facing him, not to be killed; every act of his but `only` kept cooling. */
function room(far: number, only: ActId | null = null): { g: Game; m: Monster } {
  const g = Game.forPractice('warrior', 5);
  const hooks = g as unknown as { waveT: number; wakeUp(m: Monster): void };
  hooks.waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  h.x += Math.max(0, far - 7);
  const m = g.spawn('crier', h.x - far, h.y, -2, 0, false, new RNG(9));
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
function keep(m: Monster, only: ActId): void {
  m.moveCd = actsOf(m)!.map((a) => (a.id === only ? 0 : 1e9));
  m.cd = 0;
}
/** He begins act `id` now, from where he stands, whatever the hero's distance. */
function begin(g: Game, m: Monster, id: ActId): void {
  keep(m, id);
  m.moveCd![idx(id)] = 1e9;
  m.gait = { mode: 'stand', t: 0 };
  g.bosses.startAct(m, CRIER_ACTS, idx(id));
}
interface Seen {
  hurts: { t: number; n: number }[];
  began: number;
  hushed: number;
  events: GameEvent[];
}
/** The game stepped on for `secs`, the hero's life put back each step; `place(t)` puts him where he is to stand (t from when the act began, -1 before). */
function watch(g: Game, m: Monster, secs: number, place?: (t: number) => { x: number; y: number } | null, until?: () => boolean): Seen {
  const c = emptyControls();
  const h = g.hero;
  const seen: Seen = { hurts: [], began: m.state === 'act' ? 0 : -1, hushed: -1, events: [] };
  for (let k = 0; k < Math.round(secs * 60); k++) {
    const t = k / 60;
    const at = place ? place(seen.began < 0 ? -1 : t - seen.began) : null;
    if (at) {
      h.x = at.x;
      h.y = at.y;
    }
    const before = h.life;
    g.update(1 / 60, c);
    if (h.life < before) seen.hurts.push({ t: (k + 1) / 60, n: before - h.life });
    h.life = h.d.maxLife;
    h.burnT = 0;
    if (seen.began < 0 && m.state === 'act') seen.began = (k + 1) / 60;
    if (seen.hushed < 0 && g.hushT > 0) seen.hushed = (k + 1) / 60;
    seen.events.push(...g.events);
    g.events.length = 0;
    if (until && until()) break;
  }
  return seen;
}
const since = (s: Seen, i: number): number => s.hurts[i].t - s.began;

test("1. he is built: his rules, his pictures with every clip his acts name, what he draws; floor 11's boss with the act on, and nowhere with it off", () => {
  assert.ok(RULES && FIG && FX, 'his rules, his pictures and what he draws');
  assert.equal(ACT2.on, false, 'the act is off');
  assert.equal(bossKind(11), 'warden', 'with it off, floor 11 is no floor of his');
  const rng = new RNG(3);
  for (let i = 0; i < 60; i++) assert.ok(act2Pack(11, rng, 'normal').kind !== 'crier', 'never in a pack');
  hush(() => assert.equal(bossKind(11), 'crier', "with it on, floor 11's boss is the Crier"));
  assert.equal(sizeOf('crier'), 'boss');
  assert.equal(RULES!.acts.length, 4, 'a boss: four (his rulebook); his "Yes, these four (Recommended)"');
  assert.equal(RULES!.acts[0].clip, 'attack', 'his basic blow first');
  assert.ok(RULES!.acts.slice(1).every((a) => a.cooldown > 0), 'the others cool down');
  for (let i = 2; i < 4; i++) assert.ok(RULES!.acts[i].cooldown >= RULES!.acts[i - 1].cooldown, 'the bigger, the longer the cooldown');
  assert.equal(FIG!.heavy, true, 'heavy: a boss, made for his floor');
  assert.ok(HEAVY_FIGURES.includes('crier') && FIRST5_FIGURES.includes('crier'), 'painted by the painter beside the game, let go of after his floor');
  assert.equal(CRIER_SWITCH.on, false, "the art chat's switch for him stays off (it gates nothing; the act's to throw)");
  const art = makeCrierArt();
  for (const set of [art.front, art.back]) {
    const moves = set.clips!.moves!;
    for (const a of RULES!.acts) assert.ok(a.clip === 'attack' ? set.clips!.attack : moves[a.clip], `his ${a.id}'s picture, ${a.clip}`);
    assert.ok(set.clips!.reel && set.clips!.die, 'struck, and his death');
    assert.ok(moves.setOff && moves.halt, 'setting off and stopping');
    assert.equal(set.walk.length, CR_WALK_FRAMES);
    assert.equal(set.walkFps, CR_WALK_FPS, 'his march shown at the pace it is painted for');
  }
  const g = Game.forPractice('warrior', 5);
  const m = g.spawn('crier', g.hero.x - 3, g.hero.y, -2, 0, false, new RNG(3));
  assert.ok(gaitOf(m.kind) === CRIER_GAIT && actsOf(m) === CRIER_ACTS, 'run by his rules');
  // (no voice: the Hush took it first)
  assert.deepEqual(BOSS_LINES.crier, ['...'], 'his line: a silent man\'s');
});

test("2. the rules' numbers are his pictures' own", () => {
  const G = CRIER_GAIT;
  assert.equal(G.pace, CR_PACE, 'his march\'s pace (his "quick moving")');
  near(G.cycle, CR_WALK_FRAMES / CR_WALK_FPS, 1e-9, "his march's round");
  near(G.setOff, CR_SET_OFF, 1e-9, 'setting off');
  near(G.halt, CR_HALT, 1e-9, 'stopping');
  assert.equal(G.trueBack, !!CRIER_MOB.trueBack, 'his back as the camera truly sees it');
  assert.equal(MONSTERS.crier.speed, CR_PACE, "he goes at his march's pace (his feet do not slide)");
  assert.equal(MONSTERS.crier.windup, CR_SWING_HIT, "his blow's moment, his swing's");
  assert.ok(G.stopAt < act('crier:swing').far, "he stops within his swing's reach");
  const last = (which: string): number => {
    const mv = which === 'attack' ? CRIER_MOB.attack : CRIER_MOB.more![which];
    return mv.motion.keys[mv.motion.keys.length - 1].at;
  };
  for (const a of CRIER_ACTS) near(a.long, last(a.clip), 1e-9, `${a.id}: its length`);
  assert.equal(act('crier:swing').hit, CR_SWING_HIT);
  assert.equal(act('crier:shout').hit, CR_SHOUT.hit);
  assert.equal(act('crier:proclaim').hit, CR_PROCLAIM.hit);
  assert.equal(act('crier:crowd').hit, CR_CROWD.hit);
  // (where his bell comes down: the trumpet's rim in his picture a moment after the blow, as the art chat's films lay the cracks)
  const rim = trumpetOf(skeletonAt(CRIER_MOB, 'attack', CR_SWING_HIT + 0.02), posedOfMob(CRIER_MOB, 'attack', CR_SWING_HIT + 0.02)).rim;
  near(CRIER.swing.spot[0], rim[0] / TILE3, 1e-3, 'his bell comes down before him');
  near(CRIER.swing.spot[1], rim[1] / TILE3, 1e-3, 'a little to his right, the trumpet in his right hand');
  near(CRIER.swing.cracks, SLAM_FOR, 1e-9, 'the cracks lie as long as their picture');
  // (the Shout: the way the trumpet points as he blows; its cone; how long he blows and the dark lies)
  const sh = trumpetOf(skeletonAt(CRIER_MOB, 'shout', CR_SHOUT.hit + 0.05), posedOfMob(CRIER_MOB, 'shout', CR_SHOUT.hit + 0.05)).way;
  const sl = Math.hypot(sh[0], sh[1]);
  near(CRIER.shout.way[0], sh[0] / sl, 1e-6, 'the way the trumpet points');
  near(CRIER.shout.way[1], sh[1] / sl, 1e-6, 'the way the trumpet points');
  assert.equal(CRIER.shout.from, SHOUT_FROM);
  assert.equal(CRIER.shout.to, SHOUT_TO, 'his "bigger hit box": 7.4 tiles out');
  near(CRIER.shout.half, (SHOUT_HALF * Math.PI) / 180, 1e-12, 'and 80 degrees wide');
  near(CRIER.shout.blowing, CR_SHOUT.end - CR_SHOUT.hit, 1e-9, 'he blows');
  near(CRIER.shout.lasts, SHOUT_FOR, 1e-9, 'the dark lies');
  // (the Proclamation: the way the scroll is flung, from his hips to his hand as it lets go; its lane; its clock)
  const pr = skeletonAt(CRIER_MOB, 'proclaim', CR_PROCLAIM.hit + 0.04);
  const pw = [pr.handL[0] - pr.pelvis[0], pr.handL[1] - pr.pelvis[1]];
  const pl = Math.hypot(pw[0], pw[1]);
  near(CRIER.proclaim.way[0], pw[0] / pl, 1e-6, 'the way he flings it');
  near(CRIER.proclaim.way[1], pw[1] / pl, 1e-6, 'a little to his left');
  near(CRIER.proclaim.hand[0], Math.hypot(pr.handL[0], pr.handL[1]) / TILE3, 1e-3, 'his hand lets go so far before him');
  near(CRIER.proclaim.hand[1], pr.handL[2] / 2, 1e-3, 'and so high');
  assert.equal(CRIER.proclaim.from, PROCLAIM_FROM);
  assert.equal(CRIER.proclaim.to, PROCLAIM_TO);
  assert.equal(CRIER.proclaim.half, PROCLAIM_HALF, 'his "wider": 2.5 tiles across');
  assert.equal(CRIER.proclaim.lands, PROCLAIM_LANDS);
  near(CRIER.proclaim.unrolled, PROCLAIM_UNROLLED, 1e-9, 'unrolled');
  assert.equal(CRIER.proclaim.crumbles, PROCLAIM_CRUMBLES);
  assert.equal(CRIER.proclaim.lasts, PROCLAIM_FOR);
  // (the Crowd: his call's rings; the pools the Hushed come out of)
  near(CRIER.crowd.blowing, CR_CROWD.end - CR_CROWD.hit, 1e-9, 'he blows his call');
  near(CRIER.crowd.rings, CROWD_FOR, 1e-9, 'its rings roll');
  assert.equal(CRIER.crowd.out, RISING_OUT, 'the one a pool brings is out');
  assert.equal(CRIER.crowd.pool, RISING_FOR, 'and the pool is gone');
  // (the numbers the art chat's pictures keep inside them, read from its own source: the Shout's waves and how fast the
  // dark fills its cone; the scroll's roll; the call's rings)
  const shots = fs.readFileSync('src/art/crier_shots.ts', 'utf8');
  assert.ok(shots.includes('const EVERY = 1 / 6;') && CRIER.shout.every === 1 / 6, 'a wave every sixth of a second');
  assert.ok(shots.includes('const SPEED = 9;') && CRIER.shout.speed === 9, 'rolling out at 9 tiles a second');
  assert.ok(shots.includes('clamp01(t / 0.18)') && CRIER.shout.fill === 0.18, 'the dark filling the cone in 0.18 s');
  let waves = 0;
  for (let j = 0; j * CRIER.shout.every <= CRIER.shout.blowing; j++) waves++;
  assert.equal(CRIER.shout.waves, waves, 'five waves while he blows');
  assert.ok(shots.includes('(1 - u) ** 2.2') && CRIER.proclaim.roll === 2.2, "the scroll's roll racing out");
  assert.ok(shots.includes('const SPEED = 7.5;') && CRIER.crowd.speed === 7.5 && shots.includes('const r = 0.9 + age * SPEED;') && CRIER.crowd.r0 === 0.9, "the call's rings");
  near(scrollFront(PROCLAIM_UNROLLED)!, PROCLAIM_TO, 1e-9, 'unrolled to its end');
  near(scrollFront(PROCLAIM_LANDS)!, PROCLAIM_FROM, 1e-9, 'from its near end');
});

test('3. his swing lands at its moment, where the bell comes down and under the trumpet; not beside, behind or beyond', () => {
  {
    const { g, m } = room(2.6, 'crier:swing');
    let slam: { x: number; y: number; mx: number; my: number } | null = null;
    const s = watch(g, m, 2.2, () => {
      const p = g.perils.find((q) => q.a1 === 'crier:slam');
      if (p && !slam) slam = { x: p.x, y: p.y, mx: m.x, my: m.y };
      return null;
    });
    assert.equal(s.hurts.length, 1, `where the bell comes down: struck once (${s.hurts.length})`);
    near(since(s, 0), CR_SWING_HIT, 0.04, 'as the bell slams the flags');
    assert.ok(slam, 'the flags crack where it lands');
    const at = slamSpot({ x: slam!.mx, y: slam!.my, fx: 1, fy: 0 }, 1);
    near(slam!.x, at.x, 1e-6, 'where his picture brings it down');
    near(slam!.y, at.y, 1e-6, 'to his right as he faces the floor\'s x');
    near(slam!.y - slam!.my, -CRIER.swing.spot[1], 1e-6, 'his right');
  }
  {
    // (under the trumpet as it comes down, near him)
    const { g, m } = room(1.2, 'crier:swing');
    const s = watch(g, m, 2.2);
    assert.equal(s.hurts.length, 1, 'under the trumpet: struck');
  }
  for (const [what, place] of [
    ['beside its line', (m: Monster) => ({ x: m.x + 2.4, y: m.y + 1.9 })],
    ['behind him', (m: Monster) => ({ x: m.x - 1.5, y: m.y })],
    ['beyond the bell', (m: Monster) => ({ x: m.x + 4.0, y: m.y })],
  ] as const) {
    const { g, m } = room(2.6, 'crier:swing');
    const s = watch(g, m, 2.2, (t) => (t > 0.3 ? place(m) : null));
    assert.equal(s.hurts.length, 0, `${what}, stepped there as he held it up: nothing`);
  }
});

test('4. the Silent Shout: in its cone his words go dark, for a while after; each wave that rolls over him hurts; out of it, nothing', () => {
  const S = CRIER.shout;
  // (when wave j's front passes a hero `d` tiles from his floor point: the slack is the hero's own size)
  const passes = (j: number, d: number): number => CR_SHOUT.hit + j * S.every + (d - S.slack * 0.5 - S.from) / S.speed;
  {
    const { g, m } = room(4, 'crier:shout');
    const s = watch(g, m, 2.4);
    assert.ok(s.hushed > 0, 'hushed in it');
    near(s.hushed - s.began, CR_SHOUT.hit + ((4 - S.slack - S.from) / (S.to - S.from)) * S.fill, 0.04, 'as the dark rolls out of the bell over him');
    assert.equal(s.hurts.length, S.waves, `every wave rolls over him (${s.hurts.map((x) => (x.t - s.began).toFixed(2)).join(', ')})`);
    for (let j = 0; j < S.waves; j++) near(since(s, j), passes(j, 4), 0.05, `wave ${j} as its front passes him`);
    const his = (m.dmgMin + m.dmgMax) / 2;
    assert.ok(s.hurts.every((x) => x.n < his * 0.5), 'each a little');
  }
  {
    // (aimed at him: the cone goes straight at the hero, its way the trumpet's, turned)
    const { g, m } = room(5, 'crier:shout');
    let way: { fx: number; fy: number } | null = null;
    watch(g, m, 1.2, () => {
      const p = g.perils.find((q) => q.a1 === 'crier:shout');
      if (p && !way) way = { fx: p.fx, fy: p.fy };
      return null;
    });
    assert.ok(way, 'the cone');
    near(way!.fx, 1, 1e-6, 'at the hero');
    const r = fromFigure(0, 0, m.fx, m.fy, 1, way!.fx, way!.fy);
    near(Math.atan2(Math.abs(r.left), r.fwd), Math.abs(Math.atan2(S.way[1], S.way[0])), 1e-6, 'his body turned by the trumpet\'s own turn');
  }
  {
    // (out of the cone at once, behind him: his words come back four seconds after; inside a moment, out after)
    const { g, m } = room(4, 'crier:shout');
    const h0 = { x: g.hero.x, y: g.hero.y };
    const s = watch(g, m, 7.5, (t) => (t > CR_SHOUT.hit + 0.5 ? { x: m.x - 2, y: m.y } : t >= 0 ? h0 : null));
    assert.ok(s.hushed > 0, 'hushed while in it');
    assert.ok(s.hurts.length >= 1 && s.hurts.length < S.waves, `struck by the waves while in it, and no more (${s.hurts.length})`);
    const back = s.events.find((e) => e.t === 'hushed' && !e.on);
    assert.ok(back, 'his words come back');
    assert.equal(g.hushT, 0);
  }
  for (const [what, place] of [
    ['beside it', (m: Monster) => ({ x: m.x + 3, y: m.y + 3.7 })],
    ['behind him', (m: Monster) => ({ x: m.x - 2.5, y: m.y })],
    ['beyond it', (m: Monster) => ({ x: m.x + 8.2, y: m.y })],
  ] as const) {
    const { g, m } = room(4, 'crier:shout');
    const s = watch(g, m, 2.6, (t) => (t > 0.3 ? place(m) : null));
    assert.equal(s.hurts.length, 0, `${what}: no wave`);
    assert.ok(s.hushed < 0, `${what}: his words are his`);
  }
  {
    // (rolled through it: no wave, and his words not dark while he rolls)
    const { g, m } = room(4, 'crier:shout');
    const h = g.hero;
    const s = watch(g, m, 2.6, (t) => {
      h.invuln = t >= 0 ? 0.1 : 0;
      return null;
    });
    assert.equal(s.hurts.length, 0, 'out of harm\'s way');
    assert.ok(s.hushed < 0, 'and of the Hush');
  }
});

test('5. the Proclamation: its roll strikes whoever it passes over, once; not beside it, nor what walks onto it after; only down an open lane', () => {
  const P = CRIER.proclaim;
  // (when the roll's front passes a hero `d` tiles out along its lane)
  const passes = (d: number): number => {
    const k = (d - 0.2 - P.from) / (P.to - P.from);
    return CR_PROCLAIM.hit + P.lands + (P.unrolled - P.lands) * (1 - (1 - k) ** (1 / P.roll));
  };
  for (const far of [3, 5, 7.5]) {
    const { g, m } = room(far, 'crier:proclaim');
    let lane: { x: number; y: number; fx: number; fy: number } | null = null;
    const s = watch(g, m, 3.2, () => {
      const p = g.perils.find((q) => q.a1 === 'crier:scroll');
      if (p && !lane) lane = { x: p.x, y: p.y, fx: p.fx, fy: p.fy };
      return null;
    });
    assert.ok(lane, `${far} tiles off: the scroll flung down`);
    near(lane!.fx, 1, 1e-6, 'its lane aimed straight at him');
    assert.equal(s.hurts.length, 1, `${far} tiles off: struck once as it passes over him (${s.hurts.length})`);
    near(since(s, 0), passes(far), 0.05, `${far} tiles off: as its roll passes`);
    assert.ok(s.events.some((e) => e.t === 'shake'), 'swept');
  }
  {
    // (his body turned by the way his picture flings it: a little to his right of the hero, so it runs at him)
    const { g, m } = room(5, 'crier:proclaim');
    watch(g, m, 0.3);
    const w = proclaimWay(m.fx, m.fy, m.act!.hand);
    near(w.fx, 1, 1e-6, 'the scroll\'s way, at the hero');
    near(Math.abs(Math.atan2(m.fy, m.fx)), Math.atan2(P.way[1], P.way[0]), 1e-6, "his body turned by the fling's own turn");
  }
  for (const [what, place] of [
    ['beside its lane', (m: Monster) => ({ x: m.x + 5, y: m.y + 2.2 })],
    ['behind him', (m: Monster) => ({ x: m.x - 2, y: m.y })],
    ['under its flight, at his feet', (m: Monster) => ({ x: m.x + 0.7, y: m.y })],
  ] as const) {
    const { g, m } = room(5, 'crier:proclaim');
    const s = watch(g, m, 3.2, (t) => (t > 0.3 ? place(m) : null));
    assert.equal(s.hurts.length, 0, `${what}: nothing`);
  }
  {
    // (stepped onto it once it lies: blank paper, nothing)
    const { g, m } = room(5, 'crier:proclaim');
    const h0 = { x: g.hero.x, y: g.hero.y };
    const s = watch(g, m, 3.4, (t) => (t >= 0 && t < CR_PROCLAIM.hit + P.unrolled + 0.1 ? { x: h0.x, y: h0.y + 3 } : t >= 0 ? h0 : null));
    assert.equal(s.hurts.length, 0, 'what walks onto it after: nothing');
  }
  {
    // (only down a lane of open floor: not with a wall across it)
    const { g, m } = room(2.5, 'crier:proclaim');
    m.x = 19;
    g.hero.x = 21.5;
    g.hero.y = m.y;
    assert.equal(RULES!.can!(g.bosses, m, act('crier:proclaim'), 2.5, true), false, 'a wall across its lane: not now');
    m.x = 8;
    g.hero.x = 10.5;
    assert.equal(RULES!.can!(g.bosses, m, act('crier:proclaim'), 2.5, true), true, 'an open lane');
  }
});

test('6. the Crowd: the Hushed come where his call reaches, a few at a call, more once he is hurt, never more than so many', () => {
  const C = CRIER.crowd;
  const kind = answers();
  const calledBy = (g: Game) => g.monsters.filter((o) => !o.dead && o.a1?.crierCalled);
  {
    const { g, m } = room(3, 'crier:crowd');
    let pools: { x: number; y: number; t: number; c: number; mx: number; my: number }[] = [];
    const s = watch(g, m, 4, () => {
      const now = g.perils.filter((p) => p.a1 === 'crier:rising');
      if (now.length && !pools.length) pools = now.map((p) => ({ x: p.x, y: p.y, t: p.t, c: p.c, mx: m.x, my: m.y }));
      return null;
    });
    assert.equal(pools.length, C.n, 'a few at a call');
    for (const p of pools) {
      const d = Math.hypot(p.x - p.mx, p.y - p.my);
      near(-p.t, callReaches(d, p.c), 1 / 30, 'each pool wells up as his call\'s rings reach it');
      const dh = Math.hypot(p.x - g.hero.x, p.y - g.hero.y);
      assert.ok(dh >= C.near - 1e-6, `no nearer the hero than ${C.near} (${dh.toFixed(2)})`);
    }
    const come = calledBy(g);
    assert.equal(come.length, C.n, `the Hushed come out of them (${come.length})`);
    assert.ok(come.every((o) => o.kind === kind && o.xp === 0 && o.state !== 'sleep'), `${kind}, awake, worth nothing`);
    void s;
  }
  {
    // (more once he is down to half his life; and never more than so many of his calling at once)
    const { g, m } = room(3, 'crier:crowd');
    m.life = m.maxLife * 0.4;
    watch(g, m, 4);
    assert.equal(calledBy(g).length, C.more, 'more once he is hurt');
    keep(m, 'crier:crowd');
    watch(g, m, 4);
    assert.equal(calledBy(g).length, C.most, 'never more than so many');
    assert.equal(RULES!.can!(g.bosses, m, act('crier:crowd'), 3, true), false, 'no more calls while they are up');
  }
  // (on his floor, the stand-in Gate Ward: at the edges of his ground)
  hush(() => {
    for (const seed of [2, 5]) {
      const g = seasoned(new Game('warrior', seed), 30);
      g.depth = 11;
      g.cleared = 10;
      g.enterDungeon();
      const b = g.boss!;
      assert.equal(b.kind, 'crier', 'floor 11\'s boss');
      const area = g.level.land!.areas.find((a) => a.role === 'boss')!;
      assert.ok(area, 'his ground');
      const at = g.spotsRound(area.blob.x, area.blob.y, 1)[0];
      g.hero.x = at.x;
      g.hero.y = at.y;
      g.bossReady();
      (g as unknown as { wakeUp(m: Monster): void }).wakeUp(b);
      begin(g, b, 'crier:crowd');
      const c = emptyControls();
      for (let k = 0; k < 60; k++) {
        g.update(1 / 60, c);
        g.hero.life = g.hero.d.maxLife;
      }
      const pools = g.perils.filter((p) => p.a1 === 'crier:rising');
      assert.ok(pools.length >= 1, `seed ${seed}: they come (${pools.length})`);
      for (const p of pools) {
        const e = blobDist(area.blob, p.x, p.y);
        assert.ok(e >= C.edge[0] - 1e-6 && e <= C.edge[1] + 1e-6, `seed ${seed}: at the edge of his square (${e.toFixed(2)})`);
        assert.ok(g.free(g.level.walk, p.x, p.y, 0.36), 'on open floor');
      }
    }
  });
});

test('7. killed in the middle of anything, nothing of his is left harming the hero; a long fight throws nothing, and he makes all four', () => {
  for (const [id, far] of [['crier:swing', 2.4], ['crier:shout', 4], ['crier:proclaim', 5], ['crier:crowd', 3]] as const) {
    for (const when of [0.4, 1.0, 1.5]) {
      const { g, m } = room(far, id);
      watch(g, m, 6, undefined, () => m.state === 'act' && m.act !== undefined && m.act.t >= when);
      g.kill(m);
      const s = watch(g, m, 6);
      assert.equal(g.perils.filter((p) => p.kind === 'act1').length, 0, `${id}, killed ${when} s in: nothing of his left on the floor`);
      assert.equal(s.hurts.length, 0, `${id}, killed ${when} s in: nothing of his harms the hero after`);
      assert.equal(g.monsters.filter((o) => !o.dead && o.a1?.crierCalled).length, 0, `${id}, killed ${when} s in: none of the Hushed come after`);
    }
  }
  // (a long fight: every act as it comes, the hero going round where he began; nothing throws, and he makes all four)
  const { g, m } = room(4);
  const used = new Set<string>();
  const cx = m.x + 3;
  const cy = m.y;
  watch(g, m, 120, (t) => {
    if (m.act) used.add(m.act.id);
    // (his calling put out of the way, so that the hero's going round is all that moves him)
    for (const o of g.monsters) if (o.a1?.crierCalled) o.dead = true;
    const a = t * 0.25;
    const r = 2 + 3 * (0.5 + 0.5 * Math.sin(t * 0.13));
    return t < 0 ? null : { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  });
  for (const a of CRIER_ACTS) assert.ok(used.has(a.id), `he made his ${a.id} (${[...used].join(', ')})`);
});

test("8. what he draws is the enemy's colours and the Hush's, never cyan; his size as the game goes by it, against his picture", () => {
  const { g, m } = room(4);
  const { c, drawn } = fakeCtx(g);
  // (a canvas that keeps every colour it is given: the art chat's shots draw with fillRect)
  const colours = new Set<string>();
  const canvas = c.g as unknown as Record<string, unknown>;
  canvas.fillRect = (): void => void colours.add(String(canvas.fillStyle));
  const look = (): void => {
    c.t = g.time;
    FX!.ground!(c, m, null);
    for (const p of g.perils) if (p.kind === 'act1') FX!.ground!(c, null, p);
  };
  for (const id of ['crier:swing', 'crier:shout', 'crier:proclaim', 'crier:crowd'] as const) {
    begin(g, m, id);
    const until = g.time + 4.5;
    while (g.time < until) {
      g.update(1 / 60, emptyControls());
      g.hero.life = g.hero.d.maxLife;
      for (const o of g.monsters) if (o.a1?.crierCalled) o.dead = true;
      if (Math.round(g.time * 60) % 4 === 0) look();
    }
  }
  void drawn;
  assert.ok(colours.size > 4, `he draws (${colours.size} colours)`);
  const hex = (col: string): [number, number, number] => {
    const v = col.replace('#', '');
    return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
  };
  for (const col of colours) assert.ok(!cyanGlow(...hex(col)), `nothing cyan: ${col}`);
  // (his size, as tests/first5_bosses.test.ts measures every figure's)
  const size = FIGURE_SIZE.crier;
  assert.deepEqual(size, FIG!.size, 'the game holds the size his pictures give');
  const sp = makeBestiary().of('crier').front.idle[0];
  const p = paintingOf(sp);
  const ax = Math.round(sp.ax * GRAIN);
  const ay = Math.round(sp.ay * GRAIN);
  let top = 0;
  for (let y = 0; y < p.h && top === 0; y++) for (let x = ax - 3; x <= ax + 3; x++) if (p.has(x, y)) top = (ay - y) / GRAIN;
  assert.ok(Math.abs(size.top - top) <= 4, `his top ${size.top}; his picture's ${top}`);
  const reach = Math.max(sp.ax, sp.w - sp.ax);
  assert.ok(size.half <= reach + 1 && size.half >= reach * 0.4, `${size.half} to either side; his picture reaches ${reach}`);
});

test('his line as the hero comes into his square, and his name: on the stand-in floor 11 with the act on', () => hush(() => {
  const g = seasoned(new Game('warrior', 3), 30);
  g.depth = 11;
  g.cleared = 10;
  g.enterDungeon();
  const b = g.boss!;
  assert.equal(b.kind, 'crier');
  assert.ok(/Crier/.test(b.name), b.name);
  const events: GameEvent[] = [];
  const at = g.spotsRound(b.x, b.y, 40).find((q) => Math.hypot(q.x - b.x, q.y - b.y) > 2.5)!;
  g.hero.x = at.x;
  g.hero.y = at.y;
  const c = emptyControls();
  for (let k = 0; k < 30; k++) {
    g.update(1 / 60, c);
    events.push(...g.events);
    g.events.length = 0;
  }
  const intro = events.find((e) => e.t === 'bossIntro') as { line: string | null; name: string } | undefined;
  assert.ok(intro, 'he meets the hero');
  assert.equal(intro!.line, '...', 'his mouth open on a shout that makes no sound');
  assert.equal(intro!.name, b.name);
}));
