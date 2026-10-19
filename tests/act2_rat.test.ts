// ACT 2, THE HUSH: FLOOR 12: THE KING'S RATS IN THE GAME (game/act1_rules/rat.ts; their pictures art/act1_figs/rat.ts, the art
// chat's art/rats.ts; their looking round drawn by render/act1_fx/rat.ts), behind ACT2 (off):
//   1. they are built: their rules, their pictures with every clip their acts and effects name (both ways they are seen); in the
//      game only on the Hush's floors (ACT2);
//   2. their numbers are their pictures' own (their pace and scurry, their leap and bite's length, moment and reach, measured off
//      the picture; their looking round), and their size as the game goes by it;
//   3. the bite lands at its picture's snap on a hero before it, along the way its jaws go, and not on one who has stepped away;
//   4. LOOKING ROUND: now and then, each by its own clock, while their pack lies not yet woken; one woken in the middle of it
//      finishes it before it comes;
//   5. tiny: floor 12's packs of them six to ten; never a yellow pack;
//   6. what they draw is their own pictures, nothing cyan;
//   7. a swarm of them in a long fight: no exceptions.
//   run: tsx --test tests/act2_rat.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { RATS_ON, RAT_BITE, RAT_LOOK, RAT_PACE, RAT_WALK, makeRatArt, ratPose } from '../src/art/rats';
import { headOf } from '../src/art/rat_king';
import { FIGURE_SIZE, makeBestiary } from '../src/art/bestiary';
import { GRAIN } from '../src/art/kit';
import { TILE3 } from '../src/art/new_mobs3';
import { act1Fig } from '../src/art/act1_figs/index';
import { FIG } from '../src/art/act1_figs/rat';
import { RNG } from '../src/engine/rng';
import { ACT2 } from '../src/game/act1';
import { act1Pack } from '../src/game/act1_mobs';
import { act2Ready } from '../src/game/act2_mobs';
import { RAT, RAT_ACTS, RAT_GAIT, RULES, lookPhase, looking } from '../src/game/act1_rules/rat';
import { act1Rules } from '../src/game/act1_rules/index';
import { actsOf, gaitOf } from '../src/game/bosses';
import { MONSTERS, PACK_BY_SIZE, TUNE, sizeOf } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import { FX } from '../src/render/act1_fx/rat';
import { act1Fx } from '../src/render/act1_fx/index';
import { cyanIn, fakeDocument, firstHurt, room, watch } from './act1_kinds_room';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
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

const bite = RAT_ACTS[0];
function hush<T>(fn: () => T): T {
  const was = ACT2.on;
  ACT2.on = true;
  try {
    return fn();
  } finally {
    ACT2.on = was;
  }
}
/** The practice room with one rat `far` west of the hero, out of any look round it was in as it was woken. */
function ratRoom(far: number): { g: Game; m: Monster } {
  const r = room('rat', far, 'rat:bite');
  r.m.a1 = { look: -1, woke: 1 };
  return r;
}

test('1. they are built: their rules, their pictures with every clip their acts and effects name; only on the Hush', () => {
  assert.ok(act1Rules('rat') === RULES && RULES, 'their rules');
  assert.ok(act1Fig('rat') === FIG && FIG, 'their pictures');
  assert.ok(act1Fx('rat') === FX && FX, 'what they draw');
  assert.ok(act2Ready('rat'), 'in the Hush: no longer stood in for');
  assert.ok(FIG!.switches!.includes(RATS_ON), "the art chat's switch for them, thrown with the acts' figures (art/bestiary.ts)");
  assert.equal(RULES!.acts.length, 1, 'tiny: one blow (his rule of 9 Oct)');
  const art = makeRatArt();
  for (const set of [art.front, art.back]) {
    const clip = set.clips!.attack!;
    near((clip.frames.length - 1) / clip.fps, bite.long, 0.05, 'its bite: its clip as long as the act');
    assert.ok(set.clips!.reel && set.clips!.die, 'struck, and its death');
    assert.ok(set.clips!.moves!.look.frames.length > 0, 'looking round');
  }
  const g = Game.forPractice('warrior', 5);
  const m = g.spawn('rat', g.hero.x - 3, g.hero.y, -2, 0, false, new RNG(3));
  assert.ok(gaitOf(m.kind) === RAT_GAIT && actsOf(m) === RAT_ACTS, 'run by their rules');
  assert.equal(ACT2.on, false, 'the Hush is off');
  for (let i = 0; i < 100; i++) assert.ok(act1Pack(12, new RNG(i), 'normal').kind !== 'rat', 'with it off, floor 12 is not theirs (the deep Crypt is)');
});

test("2. their numbers are their pictures' own, and their size as the game goes by it", () => {
  const G = RAT_GAIT;
  assert.equal(G.pace, RAT_PACE, 'the pace its scurry is painted for');
  assert.equal(MONSTERS.rat.speed, RAT_PACE, 'and it goes at it: its feet do not slide');
  near(G.cycle, RAT_WALK.frames / RAT_WALK.fps, 1e-9, 'its scurry goes round');
  near(G.cycle, RAT_WALK.period, 1e-9, 'its scurry goes round');
  assert.equal(G.setOff + G.halt, 0, 'its scurry loops from its stand');
  assert.equal(bite.long, RAT_BITE.long, 'the bite is as long as its picture');
  assert.equal(bite.hit, RAT_BITE.hit, 'and snaps at its moment');
  assert.equal(MONSTERS.rat.windup, RAT_BITE.hit, "its blow's moment, its bite's");
  assert.equal(MONSTERS.rat.range, bite.far, 'its reach, its bite');
  assert.equal(RAT.look.long, RAT_LOOK.long, 'its looking round');
  // (where its jaws are as it crouches to spring, and where they snap: its mouth, off its picture's pose)
  near(RAT.bite.from, headOf(ratPose('attack', RAT_BITE.spring)).mouth[0] / TILE3, 0.01, 'its jaws as it springs');
  near(RAT.bite.to, headOf(ratPose('attack', RAT_BITE.hit)).mouth[0] / TILE3, 0.01, 'its jaws as it snaps');
  near(ratPose('attack', RAT_BITE.hit).c[0] - ratPose('attack', 0).c[0], RAT_BITE.reach, 0.5, 'it springs 24 of its lengths');
  assert.ok(Math.abs(headOf(ratPose('attack', RAT_BITE.hit)).mouth[1]) < 0.5, 'straight before it');
  assert.ok(RAT.bite.to + RAT.bite.r >= bite.far, 'it reaches as far as it bites from');
  // ITS SIZE, measured as the descent's are
  const size = FIGURE_SIZE.rat;
  assert.deepEqual(size, FIG!.size, 'the game goes by its own');
  const sp = makeBestiary().of('rat').front.idle[0];
  const p = paintingOf(sp);
  const ax = Math.round(sp.ax * GRAIN);
  const ay = Math.round(sp.ay * GRAIN);
  let top = 0;
  for (let y = 0; y < p.h && top === 0; y++) for (let x = ax - 3; x <= ax + 3; x++) if (p.has(x, y)) top = (ay - y) / GRAIN;
  assert.ok(Math.abs(size.top - top) <= 3, `the game takes its top to be ${size.top} up; in the picture it is ${top}`);
  assert.ok(size.top < 28 / 2.5, 'under a third of the knight (28) and a little: a rat');
  const reach = Math.max(sp.ax, sp.w - sp.ax);
  assert.ok(size.half <= reach + 1 && size.half >= reach * 0.4, `${size.half} to either side; the picture reaches ${reach}`);
});

test('3. the bite lands at its snap on a hero before it, along the way its jaws go, and not on one who has stepped away', () => {
  for (const far of [0.7, 1.0, RAT.bite.to, bite.far]) {
    const { g, m } = ratRoom(far);
    const s = watch(g, m, 1.0);
    assert.equal(s.hurts.length, 1, `${far} tiles off: bitten once`);
    near(firstHurt(s) - s.began, bite.hit, 0.04, `${far} tiles off: as it snaps`);
    assert.ok(s.hurts[0].n >= 1 && s.hurts[0].n <= MONSTERS.rat.dmgMax * 3, `a little blow (${s.hurts[0].n})`);
  }
  {
    // (stepped away as it springs: past where its jaws snap)
    const { g, m } = ratRoom(1.0);
    g.bosses.startAct(m, RULES!.acts, 0);
    g.hero.x = m.x + RAT.bite.to + RAT.bite.r + TUNE.heroRadius;
    assert.equal(watch(g, m, 0.6).hurts.length, 0, 'stepped away, it snaps on nothing');
  }
  {
    // (to one side of it: its jaws go straight before it)
    const { g, m } = ratRoom(1.0);
    g.bosses.startAct(m, RULES!.acts, 0);
    g.hero.x = m.x + 1.0;
    g.hero.y = m.y + RAT.bite.r + 0.25;
    assert.equal(watch(g, m, 0.6).hurts.length, 0, 'beside it, it snaps on nothing');
  }
});

test('4. LOOKING ROUND: now and then, each by its own clock, while their pack lies not yet woken; woken in the middle of it, it finishes it first', () => {
  const g = Game.forPractice('warrior', 5);
  (g as unknown as { waveT: number }).waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  const art = makeRatArt();
  const pack: Monster[] = [];
  for (let i = 0; i < 6; i++) pack.push(g.spawn('rat', h.x - 12 + i * 0.6, h.y - 6, 5, 0, false, new RNG(40 + i)));
  for (const m of pack) m.state = 'sleep';
  const up: number[] = pack.map(() => 0);
  const starts: number[][] = pack.map(() => []);
  const steps = 60 * 30;
  for (let k = 0; k < steps; k++) {
    for (const m of pack) m.animT += 1 / 60;
    pack.forEach((m, i) => {
      const t = looking(m);
      const sp = FX!.sprite!(m, art, art.front);
      if (t >= 0) {
        up[i]++;
        assert.ok(sp === art.front.clips!.moves!.look.frames[Math.min(art.front.clips!.moves!.look.frames.length - 1, Math.floor(t * RAT_LOOK.fps + 1e-6))], 'drawn looking round, at its moment');
        if (t < 1 / 60 + 1e-9) starts[i].push(k / 60);
      } else assert.equal(sp, null, 'otherwise as it stands');
    });
  }
  pack.forEach((m, i) => {
    const share = up[i] / steps;
    const [lo, hi] = RAT.look.every;
    assert.ok(share >= RAT.look.long / hi - 0.05 && share <= RAT.look.long / lo + 0.05, `rat ${i} looks round ${(share * 100).toFixed(0)}% of the time`);
    assert.ok(starts[i].length >= 3, `rat ${i} looked round ${starts[i].length} times in 30 s`);
  });
  assert.ok(new Set(starts.map((s) => s[0].toFixed(1))).size >= 4, `each by its own clock (${starts.map((s) => s[0].toFixed(1)).join(', ')})`);
  // (woken in the middle of it: it finishes it, standing, its head up, before it comes)
  const { g: g2, m } = room('rat', 4, 'rat:bite');
  m.a1 = { look: -1, woke: 0 };
  const [lo, hi] = RAT.look.every;
  const every = lo + (hi - lo) * m.seed;
  m.animT = every * 10 + 0.3 - m.seed * 11.3;
  near(lookPhase(m), 0.3, 1e-6, 'in the middle of a look');
  const x0 = m.x;
  const s = watch(g2, m, 0.9);
  assert.ok(Math.abs(m.x - x0) < 1e-6 && s.hurts.length === 0, 'it finishes its look where it stands');
  assert.ok(looking(m) >= 0 && FX!.sprite!(m, art, art.front) !== null, 'drawn looking round');
  watch(g2, m, 0.3);
  assert.equal(looking(m), -1, 'its look done');
  const s2 = watch(g2, m, 3);
  assert.ok(m.x > x0 + 1 && s2.hurts.length > 0, 'and then it comes, and bites');
});

test('5. tiny: floor 12 has packs of them, six to ten, never a yellow pack', () => hush(() => {
  assert.equal(sizeOf('rat'), 'tiny');
  const rng = new RNG(4);
  let seen = 0;
  for (let i = 0; i < 400; i++) {
    const p = act1Pack(12, rng, 'normal');
    if (p.kind !== 'rat') continue;
    seen++;
    assert.ok(p.size >= PACK_BY_SIZE.tiny[0] && p.size <= PACK_BY_SIZE.tiny[1], `a pack of ${p.size}`);
  }
  assert.ok(seen > 40, `floor 12 has them (${seen} packs of 400)`);
  for (let i = 0; i < 200; i++) assert.ok(act1Pack(12, rng, 'elite').kind !== 'rat', 'not led');
}));

test('6. what they draw is their own pictures, nothing cyan', () => {
  assert.equal(FX!.ground, undefined);
  assert.equal(FX!.standing, undefined);
  assert.equal(FX!.air, undefined);
  const art = makeRatArt();
  for (const set of [art.front, art.back]) {
    for (const sp of [set.idle[0], set.walk[3], set.clips!.attack!.frames[15], set.clips!.moves!.look.frames[12], set.clips!.reel!.frames[4], set.clips!.die!.frames[20]]) assert.equal(cyanIn(sp), 0, 'nothing cyan on it');
  }
});

test('7. a swarm of them in a long fight: no exceptions', () => {
  const { g, m } = room('rat', 3, null);
  m.a1 = { look: -1, woke: 1 };
  for (let i = 0; i < 7; i++) g.spawn('rat', m.x - 0.5 * i, m.y + (i % 2 ? 0.7 : -0.7), -2, 0, false, new RNG(30 + i));
  for (const o of g.monsters) (g as unknown as { wakeUp(m: Monster): void }).wakeUp(o);
  let k0 = 0;
  const s = watch(g, m, 30, (t) => (t < 12 ? null : { mx: Math.cos(t * 0.9), my: Math.sin(t * 1.3) }), () => {
    if (++k0 % 40 === 0) for (const o of g.monsters) if (!o.dead && o !== m) (g as unknown as { damageMonster(m: unknown, n: number, el: string, c: boolean, k: number): void }).damageMonster(o, 2, 'phys', false, -1);
    return false;
  });
  assert.ok(s.hurts.length > 3, `they bite him (${s.hurts.length})`);
  assert.ok(g.monsters.filter((o) => o.kind === 'rat' && !o.dead).length < 8, 'and he kills some of them');
  void emptyControls;
});
