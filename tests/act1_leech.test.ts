// ACT 1: THE BOG LEECHES (FLOOR 10) IN THE GAME (game/act1_rules/leech.ts, art/act1_figs/leech.ts, render/act1_fx/leech.ts):
//   1. it is built: its rules, its pictures (the art chat's, each with his yes) with a clip by each name its acts use,
//      its switch on with the descent, its size as its pictures stand;
//   2. the rules' numbers are its pictures' own; its picture while it hangs on him is its clinging and swelling, its
//      mouth on him all the while, going on from one frame to the next without a leap, and drawn over him;
//   3. ITS LATCH (his design doc: "They latch on and drain life until you dodge them off"): it clamps on at its
//      picture's moment, where its mouth reaches, and holds on; rides along with him as he walks; drinks a sip at a
//      time, healed by what it takes; lets go once it has drunk its fill; misses one its mouth does not reach;
//   4. HE DODGES THEM OFF: a roll (or a leap, or a warp) and it lets go, and drinks no more; no more than four hang on
//      him at once; one he has stepped in close to latches all the same;
//   5. it comes in packs of its size, on its floor, never as an elite room's yellow pack;
//   6. a long fight on its floor with a pack of them: no exceptions, and its latch made.
//   run: tsx --test tests/act1_leech.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIRST5_FIGURES, makeBestiary } from '../src/art/bestiary';
import { act1Fig } from '../src/art/act1_figs/index';
import { BL_ATTACK, BL_HIT, BL_LAND, BL_LATCH, BL_LETGO, BL_PACE, BL_WALK, BL_WARN, LEECH_ON, attackPose } from '../src/art/bog_leech';
import { TILE3 } from '../src/art/new_mobs3';
import { RNG } from '../src/engine/rng';
import { ACT1 } from '../src/game/act1';
import { act1Pack } from '../src/game/act1_mobs';
import { act1Rules } from '../src/game/act1_rules/index';
import { LEECH, latchClock, latched } from '../src/game/act1_rules/leech';
import { actsOf, gaitOf } from '../src/game/bosses';
import { MONSTERS, PACK_BY_SIZE, sizeOf } from '../src/game/defs';
import { clipFrame } from '../src/render/figure';
import { act1Fx } from '../src/render/act1_fx/index';
import { longFight, measuredSize, room, untilAct, watch } from './act1_kinds_room_c';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);

paintWithoutCanvas();

test('1. it is built: its rules, its pictures with a clip by each name its acts use, its switch on with the descent, its size', () => {
  const r = act1Rules('leech');
  const fig = act1Fig('leech');
  assert.ok(r && fig, 'its rules and its pictures');
  assert.ok(fig!.switches?.includes(LEECH_ON), "the art chat's switch is its");
  assert.equal(LEECH_ON.on, ACT1.on, 'on with the descent');
  assert.ok(FIRST5_FIGURES.includes('leech'));
  const art = makeBestiary().of('leech');
  for (const set of [art.front, art.back]) {
    for (const a of r!.acts) {
      const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
      assert.ok(clip && clip.frames.length > 0, `its ${a.id}: its clip ${a.clip}`);
      near((clip!.frames.length - 1) / clip!.fps, a.long, 1 / clip!.fps, `its ${a.id}'s length`);
    }
    assert.ok(set.clips?.reel && set.clips?.die, 'struck and its death');
  }
  const m = measuredSize('leech');
  assert.ok(Math.abs(m.size.top - m.head) <= 4, `the game takes it to be ${m.size.top} up; in the picture it is ${m.head}`);
  assert.ok(m.size.half <= m.reach + 1 && m.size.half >= m.reach * 0.4, `${m.size.half} to either side; the picture reaches ${m.reach}`);
});

test("2. the rules' numbers are its pictures' own; its picture while it hangs on him", () => {
  const G = gaitOf('leech')!;
  assert.equal(G.pace, BL_PACE, 'its slither at the pace it is painted for');
  assert.equal(MONSTERS.leech.speed, BL_PACE);
  near(G.cycle, 1 / BL_WALK.fps, 1e-9, 'it may stop at any frame of its slither');
  const acts = actsOf({ kind: 'leech' })!;
  assert.equal(acts.length, 1, 'tiny: one attack');
  const L = LEECH.latch;
  assert.equal(acts[0].hit, BL_HIT, 'it clamps on at its moment');
  assert.equal(acts[0].long, BL_ATTACK);
  assert.equal(L.spring, BL_WARN[1], 'it springs as its warning ends');
  assert.equal(L.letGo, BL_LETGO);
  assert.equal(L.land, BL_LAND);
  near(L.at, BL_LATCH[0] / TILE3, 1e-9, 'its mouth as far before it as its picture has it');
  near(G.stopAt, L.at, 1e-9, 'it stands that far from him (the art: "stand it that far from the hero")');
  assert.equal(MONSTERS.leech.windup, BL_HIT);
  // (its clinging, as painted, then there and back over the last of it: never a leap from one moment to the next)
  assert.equal(latchClock(0), BL_HIT, 'from its moment');
  let was = latchClock(0);
  for (let held = 1 / 60; held < LEECH.drink.most + 0.5; held += 1 / 60) {
    const t = latchClock(held);
    assert.ok(Math.abs(t - was) <= 1 / 60 + 1e-9, `no leap at ${held.toFixed(2)} s on him`);
    assert.ok(t >= BL_HIT && t < BL_LETGO, 'its clinging, never its letting go');
    // (its mouth on him all the while, and gorged once it has swelled)
    const p = attackPose(t);
    const off = Math.hypot(p.spine[0][0] - BL_LATCH[0], p.spine[0][1] - BL_LATCH[1], p.spine[0][2] - BL_LATCH[2]);
    if (t > BL_HIT + 0.15) assert.ok(off < 1.5, `its mouth on him (${off.toFixed(2)} off at ${t.toFixed(2)} s)`);
    if (held > 0.6) assert.ok(p.fat > 0.7, `swollen as it goes on drinking (${p.fat.toFixed(2)})`);
    was = t;
  }
  // (drawn over him while it hangs on him, its picture its clinging by how long it has held on)
  const { g, m } = room('leech', 0.92, 'leech:latch');
  untilAct(g, m, 'leech:latch');
  watch(g, m, 1.0, undefined, () => latched(m) && m.a1!.held > 0.8);
  assert.ok(latched(m), 'it hangs on him');
  const fx = act1Fx('leech')!;
  const art = makeBestiary().of('leech');
  assert.equal(fx.sprite!(m, art, art.front), clipFrame(art.front.clips!.attack!, latchClock(m.a1!.held)), 'its clinging, by how long it has held on');
  assert.ok(fx.over!(m) > 1, 'drawn over him');
});

test('3. its latch: at its moment where its mouth reaches; rides along; drinks, healed by it; lets go with its fill drunk; misses one out of reach', () => {
  const { g, m } = room('leech', 0.92, 'leech:latch');
  m.life = 10;
  m.maxLife = 1e9;
  assert.ok(untilAct(g, m, 'leech:latch'), 'it springs');
  const t0 = m.act!.t;
  const h = g.hero;
  // (it clamps on at its moment)
  const bite = watch(g, m, 1.0, undefined, () => latched(m));
  assert.ok(latched(m), 'clamped on');
  assert.equal(bite.hurts.length, 1, 'bitten');
  near(bite.hurts[0].t + t0, BL_HIT, 1.5 / 60, 'at its moment');
  near(Math.hypot(m.x - h.x, m.y - h.y), LEECH.latch.at, 0.01, 'its mouth on him');
  // (it rides along as he walks, and drinks)
  const y0 = h.y;
  let gap = 0;
  const drink = watch(g, m, LEECH.drink.most + 0.2, (t, c) => {
    if (t < 1.5) c.my = 1;
  }, () => {
    if (latched(m)) gap = Math.max(gap, Math.abs(Math.hypot(m.x - h.x, m.y - h.y) - LEECH.latch.at));
    return !latched(m);
  });
  assert.ok(Math.abs(h.y - y0) > 2, `he walked (${Math.abs(h.y - y0).toFixed(1)} tiles) with it on him`);
  assert.ok(gap < 0.02, `it rode along with him, its mouth on him (${gap.toFixed(3)} off at most)`);
  const sips = drink.hurts.length;
  near(sips, LEECH.drink.most / LEECH.drink.every, 1, 'a sip at a time while it held on');
  assert.ok(m.life > 10, 'healed by what it drank');
  assert.ok(!latched(m) && m.act !== undefined && m.act.t >= BL_LETGO, 'its fill drunk, it lets go, as its picture does');
  const after = watch(g, m, 0.6, undefined, () => m.state !== 'act');
  assert.equal(after.hurts.length, 0, 'and drinks no more');
  // (one its mouth does not reach is missed, and it drops where it sprang)
  const r2 = room('leech', 0.92, 'leech:latch');
  untilAct(r2.g, r2.m, 'leech:latch');
  r2.g.hero.x = r2.m.x + r2.m.fx * 1.8;
  const miss = watch(r2.g, r2.m, 1.0, undefined, () => r2.m.act !== undefined && r2.m.act.t >= BL_HIT + 0.05);
  assert.equal(miss.hurts.length, 0, 'missed');
  assert.ok(!latched(r2.m) && r2.m.act!.t >= BL_LETGO, 'it drops');
});

test('4. he dodges them off; no more than four on him; one he has stepped in close to latches all the same', () => {
  for (const cls of ['ranger', 'warrior', 'mage'] as const) {
    const { g, m } = room('leech', 0.92, 'leech:latch', 1, cls);
    untilAct(g, m, 'leech:latch');
    watch(g, m, 1.5, undefined, () => latched(m) && m.a1!.held > 0.6);
    assert.ok(latched(m), `${cls}: it hangs on him`);
    const h = g.hero;
    // (his evasive move, away from it)
    const s = watch(g, m, 1.6, (t, c) => {
      if (t < 0.02) {
        c.evade = true;
        c.evadeX = h.x - m.fx * 4;
        c.evadeY = h.y - m.fy * 4;
      }
    });
    assert.ok(!latched(m), `${cls}: dodged off`);
    assert.equal(s.hurts.length, 0, `${cls}: it drinks no more`);
  }
  // (no more than four hang on him)
  const { g, all } = room('leech', 0.92, null, 7);
  let most = 0;
  watch(g, all[0], 4, undefined, () => {
    most = Math.max(most, all.filter((m) => latched(m)).length);
    return false;
  });
  assert.ok(most >= 2 && most <= LEECH.most, `at most four on him (${most})`);
  // (stepped in close, half its reach: it springs back onto him all the same)
  const r = room('leech', 0.92, 'leech:latch');
  untilAct(r.g, r.m, 'leech:latch');
  r.g.hero.x = r.m.x + r.m.fx * 0.5;
  watch(r.g, r.m, 1.0, undefined, () => latched(r.m));
  assert.ok(latched(r.m), 'it latches on him close in');
});

test('5. it comes in packs of its size, on its floor, never an elite room\'s', () => {
  assert.equal(sizeOf('leech'), 'tiny');
  const [lo, hi] = PACK_BY_SIZE.tiny;
  const rng = new RNG(7);
  let seen = 0;
  for (let k = 0; k < 600; k++) {
    const p = act1Pack(10, rng, 'normal');
    if (p.kind === 'leech') {
      seen++;
      assert.ok(p.size >= lo && p.size <= hi, `a pack of ${p.size}`);
    }
    assert.ok(act1Pack(10, rng, 'elite').kind !== 'leech', 'never an elite room');
  }
  assert.ok(seen > 20, 'its own packs on floor 10, no stand-in');
});

test('6. a long fight on its floor with a pack of them: no exceptions, its latch made', () => {
  const { acts } = longFight('leech', 10, 40, 4, 'ranger');
  assert.ok(acts.has('leech:latch'), 'it latched');
});
