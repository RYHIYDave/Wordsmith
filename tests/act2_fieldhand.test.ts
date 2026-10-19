// ACT 2, THE HUSH: FLOOR 13'S HUSHED WORKING THE FIELDS IN THE GAME (game/act1_rules/fieldhand.ts, art/act1_figs/fieldhand.ts),
// behind ACT2 (off until his yes):
//   1. they are built: their rules, their pictures (the art chat's, both looks) with a clip by each name their act uses,
//      their switch on with the descent's figures, their size as their pictures stand;
//   2. the rules' numbers are their pictures' own: their shuffle's pace, the slash's moment, where the blade is then;
//   3. A REAPER OR A GLEANER: each one of the two, about half and half, its own pictures, its death and its name with it;
//   4. the sickle slash lands at its picture's moment, where the blade sweeps, and not beyond it or behind them;
//   5. with ACT2 off they are nowhere; with it on they come in packs of their size on floor 13;
//   6. a long fight on floor 13 with a pack of them: no exceptions, their blow made.
//   run: tsx --test tests/act2_fieldhand.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIRST5_FIGURES, HEAVY_FIGURES, figureOf, makeBestiary } from '../src/art/bestiary';
import { act1Fig } from '../src/art/act1_figs/index';
import { FIELDHANDS_ON, sickleOf } from '../src/art/fieldhands';
import { FH_DIES, FH_PACE, FH_SLASH, FIELD_GLEANER, FIELD_REAPER } from '../src/art/fieldhands_moves';
import { TILE3, skeletonAt } from '../src/art/new_mobs3';
import { RNG } from '../src/engine/rng';
import { ACT1, ACT2 } from '../src/game/act1';
import { act1Pack } from '../src/game/act1_mobs';
import { FIELDHAND } from '../src/game/act1_rules/fieldhand';
import { act1Rules } from '../src/game/act1_rules/index';
import { actsOf, gaitOf } from '../src/game/bosses';
import { MONSTERS, PACK_BY_SIZE, TUNE, sizeOf } from '../src/game/defs';
import { act1Fx } from '../src/render/act1_fx/index';
import { longFight, measuredSize, room, untilAct, watch } from './act1_kinds_room_c';
import { paintWithoutCanvas, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
// (VERSION 23.0: THE HUSH IS ON IN THE GAME. This file was written while it was off, and turns it on itself wherever it
// needs it: so it is turned off here for the file, as it was then, once the game's own is seen to be on)
nodeAssert.equal(ACT2.on, true, 'the Hush is on in the game (Version 23.0)');
ACT2.on = false;
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);

paintWithoutCanvas();

/** With the Hush on, for a while. */
function hush<T>(fn: () => T): T {
  const was = ACT2.on;
  ACT2.on = true;
  try {
    return fn();
  } finally {
    ACT2.on = was;
  }
}

test('1. they are built: their rules, both looks with a clip by each name their act uses, their switch, their size', () => {
  const r = act1Rules('fieldhand');
  const fig = act1Fig('fieldhand');
  assert.ok(r && fig, 'their rules and their pictures');
  assert.equal(act1Fx('fieldhand'), null, 'nothing beyond their figure: the blade, its glint and the Hush are their pictures\'');
  assert.ok(fig!.switches?.includes(FIELDHANDS_ON), "the art chat's switch is theirs");
  makeBestiary();
  assert.equal(FIELDHANDS_ON.on, ACT1.on, 'on with the descent\'s figures (art/bestiary.ts useAct1Figs): a switch nothing reads');
  assert.equal(fig!.looks?.length, 1, 'one other look: the gleaner');
  assert.ok(act1Fig('fieldhand:1') === fig!.looks![0], "the gleaner is the game's figure 'fieldhand:1'");
  for (const f of ['fieldhand', 'fieldhand:1'] as const) {
    assert.ok(FIRST5_FIGURES.includes(f), `${f}: a figure the painter paints`);
    assert.ok(!HEAVY_FIGURES.includes(f), `${f}: light, painted beside the game as the small kinds are`);
    const art = makeBestiary().of(f);
    for (const set of [art.front, art.back]) {
      for (const a of r!.acts) {
        const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
        assert.ok(clip && clip.frames.length > 0, `${f}, ${a.id}: its clip ${a.clip}`);
        near((clip!.frames.length - 1) / clip!.fps, a.long, 1 / clip!.fps, `${f}, ${a.id}'s length`);
      }
      assert.ok(set.clips?.reel && set.clips?.die, `${f}: struck, and the Hush leaving them`);
      near((set.clips!.die!.frames.length - 1) / set.clips!.die!.fps, FH_DIES.long, 0.06, `${f}: their death's length`);
    }
    const m = measuredSize(f);
    assert.ok(Math.abs(m.size.top - m.head) <= 4, `${f}: the game takes it to be ${m.size.top} up; in the picture it is ${m.head}`);
    assert.ok(m.size.half <= m.reach + 1 && m.size.half >= m.reach * 0.4, `${f}: ${m.size.half} to either side; the picture reaches ${m.reach}`);
  }
});

test("2. the rules' numbers are their pictures' own", () => {
  const G = gaitOf('fieldhand')!;
  assert.equal(G.pace, FH_PACE, 'their shuffle at the pace it is painted for');
  assert.equal(MONSTERS.fieldhand.speed, FH_PACE);
  assert.equal(makeBestiary().of('fieldhand').front.walkFps, FIELD_REAPER.walkFps, 'their shuffle shown at its own rate');
  assert.equal(G.trueBack, FIELD_REAPER.trueBack === true, 'their backs as their pictures have them');
  const acts = actsOf({ kind: 'fieldhand' })!;
  assert.equal(acts.filter((a) => !a.forced).length, 1, 'small: one attack');
  const slash = acts[0];
  assert.equal(slash.hit, FH_SLASH.hit, 'the blade crosses at its moment');
  assert.equal(slash.long, FH_SLASH.long);
  assert.equal(MONSTERS.fieldhand.windup, FH_SLASH.hit);
  const S = FIELDHAND.slash;
  for (const mob of [FIELD_REAPER, FIELD_GLEANER]) {
    // (where the blade's middle is as it crosses: the picture's, both of them)
    const k = sickleOf(skeletonAt(mob, 'attack', FH_SLASH.hit));
    near(S.at[0], k.mid[0] / TILE3, 0.03, `${mob.id}: the blade's middle before them`);
    near(S.at[1], k.mid[1] / TILE3, 0.03, `${mob.id}: and to their left`);
    // (the strip it strikes holds the blade's sweep, from their right just before to their left just after)
    for (const t of [FH_SLASH.hit - 0.04, FH_SLASH.hit, FH_SLASH.hit + 0.1]) {
      const b = sickleOf(skeletonAt(mob, 'attack', t)).mid;
      const f = b[0] / TILE3;
      const l = b[1] / TILE3;
      assert.ok(f >= S.fwd[0] && f <= S.fwd[1] && l >= S.left[0] && l <= S.left[1], `${mob.id} at ${t.toFixed(2)}: the blade (${f.toFixed(2)}, ${l.toFixed(2)}) within what it strikes`);
    }
  }
  assert.ok(S.fwd[1] <= S.at[0] + TUNE.heroRadius + 0.01, 'no further than the blade and the hero\'s breadth');
  assert.ok(G.stopAt < slash.far && slash.far <= S.fwd[1], 'they stop inside their reach');
});

test('3. a reaper or a gleaner: about half and half, each its own pictures, its death and its name', () => {
  const { g } = room('fieldhand', 4);
  const forms = [0, 0];
  for (let i = 0; i < 200; i++) {
    const m = g.spawn('fieldhand', g.hero.x + 3, g.hero.y + (i % 5), -4, 0, false, new RNG(100 + i));
    forms[m.form ?? 0]++;
    assert.equal(figureOf(m), (m.form ?? 0) === 1 ? 'fieldhand:1' : 'fieldhand', 'shown as its look');
    assert.equal(m.name, (m.form ?? 0) === 1 ? 'Hushed Gleaner' : 'Hushed Reaper', 'named for it');
  }
  assert.ok(forms[0] > 70 && forms[1] > 70, `reapers ${forms[0]}, gleaners ${forms[1]}`);
  // (each look its own pictures: the gleaner's sunbonnet and skirt are not the reaper's hat and smock)
  const art = makeBestiary();
  const reaper = art.of('fieldhand').front.idle[0];
  const gleaner = art.of('fieldhand:1').front.idle[0];
  assert.ok(unlike(reaper, gleaner) > 200, `the two stand differently: ${unlike(reaper, gleaner)} pixels`);
  // (and dies as itself: the game's death is told with its form, game.ts kill)
  const { g: g2, m } = room('fieldhand', 4);
  m.form = 1;
  m.life = 1;
  m.maxLife = 1;
  (g2 as unknown as { kill(m: unknown): void }).kill(m);
  const died = g2.events.find((e) => e.t === 'die');
  assert.ok(died && figureOf(died as unknown as { kind: 'fieldhand'; champion: boolean; form?: number }) === 'fieldhand:1', 'a gleaner falls as a gleaner');
});

test('4. the sickle slash lands at its moment, where the blade sweeps, and not beyond or behind', () => {
  for (const [fwd, left, hurt] of [[0.7, 0, true], [1.25, -0.2, true], [1.0, 0.35, true], [1.0, -0.6, true], [1.6, 0, false], [-0.6, 0, false], [0.8, 0.9, false]] as const) {
    const { g, m } = room('fieldhand', 0.9, 'fieldhand:slash');
    assert.ok(untilAct(g, m, 'fieldhand:slash'), 'it slashes');
    const h = g.hero;
    // (the figure's left as its picture is drawn: east-facing it is not turned over)
    const hand = m.act!.hand;
    h.x = m.x + m.fx * fwd + m.fy * hand * left;
    h.y = m.y + m.fy * fwd - m.fx * hand * left;
    const t0 = m.act!.t;
    const s = watch(g, m, 1.2, undefined, () => m.state !== 'act');
    if (hurt) {
      assert.equal(s.hurts.length, 1, `at ${fwd}, ${left}: struck once`);
      near(s.hurts[0].t + t0, FH_SLASH.hit, 1.5 / 60, 'as the blade crosses');
    } else assert.equal(s.hurts.length, 0, `at ${fwd}, ${left}: beyond the blade, not struck`);
  }
});

test('5. with ACT2 off they are nowhere; with it on, packs of their size on floor 13', () => {
  const rng = new RNG(4);
  for (let d = 1; d <= 15; d++) for (let k = 0; k < 60; k++) assert.ok(act1Pack(d, rng, 'normal').kind !== 'fieldhand', `ACT2 off: none on floor ${d}`);
  hush(() => {
    assert.equal(sizeOf('fieldhand'), 'small');
    const [lo, hi] = PACK_BY_SIZE.small;
    let seen = 0;
    for (let k = 0; k < 400; k++) {
      const p = act1Pack(13, rng, 'normal');
      if (p.kind !== 'fieldhand') continue;
      seen++;
      assert.ok(p.size >= lo && p.size <= hi, `a pack of ${p.size}`);
    }
    assert.ok(seen > 60, `their own packs on floor 13, no stand-in (${seen} in 400)`);
  });
});

test('6. a long fight on floor 13 with a pack of them: no exceptions, their blow made', () => {
  hush(() => {
    const { acts } = longFight('fieldhand', 13, 30);
    assert.ok(acts.has('fieldhand:slash'), 'they slashed');
  });
});
