// ACT 1: THE EYESPAWN (FLOOR 10) IN THE GAME (game/act1_rules/spawn.ts, art/act1_figs/spawn.ts, render/act1_fx/spawn.ts):
//   1. it is built: its rules, its pictures (the art chat's, each with his yes) with a clip by each name its acts use,
//      its switch on with the descent, its size as its pictures stand;
//   2. the rules' numbers are its pictures' own (where its beam strikes, moment by moment, as art/eyespawn.ts beamAt);
//   3. its lash lands at its picture's moment, before it as far as its arm reaches, and not further;
//   4. its gaze: made only at a hero on the line its picture burns, turned to the way its picture faces; it burns him
//      once, when its beam's point comes to him (or he steps on the line behind it), with fire; not one off its line;
//   5. HATCHING (for the Drowned Eye's eggs): one spawned with Monster.a1 = { hatch: 1 } hatches first, its hatching
//      played whole, its picture its hatching's first until then; then it is itself;
//   6. it comes in packs of its size, on its floor;
//   7. a long fight on its floor with a pack of them: no exceptions, both its attacks made.
//   run: tsx --test tests/act1_spawn.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIRST5_FIGURES, makeBestiary } from '../src/art/bestiary';
import { act1Fig } from '../src/art/act1_figs/index';
import { ES_GAZE, ES_HATCH, ES_LASH, ES_PACE, ES_WALK, SPAWN_ON, beamAt } from '../src/art/eyespawn';
import { TILE3 } from '../src/art/new_mobs3';
import { RNG } from '../src/engine/rng';
import { ACT1 } from '../src/game/act1';
import { act1Pack } from '../src/game/act1_mobs';
import { act1Rules } from '../src/game/act1_rules/index';
import { SPAWN, beamFar, pictureWay } from '../src/game/act1_rules/spawn';
import { actsOf, gaitOf } from '../src/game/bosses';
import { MONSTERS, PACK_BY_SIZE, sizeOf } from '../src/game/defs';
import { backView, flipped } from '../src/game/facing';
import { clipFrame } from '../src/render/figure';
import { act1Fx } from '../src/render/act1_fx/index';
import { keep, longFight, measuredSize, room, untilAct, watch } from './act1_kinds_room';
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
  const r = act1Rules('spawn');
  const fig = act1Fig('spawn');
  assert.ok(r && fig, 'its rules and its pictures');
  assert.ok(fig!.switches?.includes(SPAWN_ON), "the art chat's switch is its");
  assert.equal(SPAWN_ON.on, ACT1.on, 'on with the descent');
  assert.ok(FIRST5_FIGURES.includes('spawn'));
  const art = makeBestiary().of('spawn');
  for (const set of [art.front, art.back]) {
    for (const a of r!.acts) {
      const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
      assert.ok(clip && clip.frames.length > 0, `its ${a.id}: its clip ${a.clip}`);
      near((clip!.frames.length - 1) / clip!.fps, a.long, 1 / clip!.fps, `its ${a.id}'s length`);
    }
    assert.ok(set.clips?.reel && set.clips?.die, 'struck and its death');
  }
  const m = measuredSize('spawn');
  assert.ok(Math.abs(m.size.top - m.head) <= 4, `the game takes it to be ${m.size.top} up; in the picture it is ${m.head}`);
  assert.ok(m.size.half <= m.reach + 1 && m.size.half >= m.reach * 0.4, `${m.size.half} to either side; the picture reaches ${m.reach}`);
});

test("2. the rules' numbers are its pictures' own", () => {
  const G = gaitOf('spawn')!;
  assert.equal(G.pace, ES_PACE, 'its haul at the pace it is painted for');
  assert.equal(MONSTERS.spawn.speed, ES_PACE);
  near(G.cycle, 1 / ES_WALK.fps, 1e-9, 'it may stop at any frame of its haul');
  const acts = actsOf({ kind: 'spawn' })!;
  assert.equal(acts.filter((a) => !a.forced).length, 2, 'medium: two attacks');
  const lash = acts.find((a) => a.id === 'spawn:lash')!;
  const gaze = acts.find((a) => a.id === 'spawn:gaze')!;
  const hatch = acts.find((a) => a.id === 'spawn:hatch')!;
  assert.ok(lash.cooldown === 0 && gaze.cooldown > 0, 'its lash its basic blow; its gaze its big one, with a cooldown');
  assert.equal(lash.hit, ES_LASH.hit);
  assert.equal(lash.long, ES_LASH.long);
  assert.equal(SPAWN.lash.reach, ES_LASH.reach);
  assert.equal(gaze.clip, 'gaze');
  assert.equal(gaze.long, ES_GAZE.long);
  assert.equal(gaze.hit, ES_GAZE.beam[0], 'its gaze hits as its beam burns');
  assert.equal(SPAWN.gaze.beam[0], ES_GAZE.beam[0]);
  assert.equal(SPAWN.gaze.beam[1], ES_GAZE.beam[1]);
  assert.equal(SPAWN.gaze.near, ES_GAZE.near);
  assert.equal(SPAWN.gaze.reach, ES_GAZE.reach);
  for (let t = 0; t <= ES_GAZE.long; t += 0.01) {
    const a = beamAt(t);
    const b = beamFar(t);
    assert.equal(a === null, b === null, `its beam burns at ${t.toFixed(2)} s as its picture's does`);
    if (a && b !== null) near(b, a[0] / TILE3, 1e-6, `where its beam strikes at ${t.toFixed(2)} s`);
  }
  assert.ok(hatch.forced, 'its hatching is not chosen: it comes as it is spawned to hatch');
  assert.equal(hatch.clip, 'hatch');
  assert.equal(hatch.long, ES_HATCH.long);
  assert.equal(MONSTERS.spawn.windup, ES_LASH.hit);
  // (the way its picture faces, for one that faces any way: as the game picks its picture and turns it over)
  for (let a = 0; a < Math.PI * 2; a += 0.05) {
    const fx = Math.cos(a);
    const fy = Math.sin(a);
    const w = pictureWay(fx, fy);
    assert.equal(backView(w.x, w.y), backView(fx, fy), 'the same picture');
    assert.equal(flipped(w.x, w.y), flipped(fx, fy), 'turned over the same');
    assert.ok(w.x * fx + w.y * fy > 0.4, 'and the way it faces, near enough');
  }
});

test('3. its lash lands at its moment, before it as far as its arm reaches, and not further', () => {
  for (const [far, side, hurt] of [[1.0, 0, true], [1.25, 0, true], [0.8, 0.7, true], [1.5, 0, false]] as const) {
    const { g, m } = room('spawn', 1.0, 'spawn:lash');
    assert.ok(untilAct(g, m, 'spawn:lash'), 'it lashes');
    g.hero.x = m.x + m.fx * far + m.fy * side;
    g.hero.y = m.y + m.fy * far - m.fx * side;
    const t0 = m.act!.t;
    const s = watch(g, m, 1.2, undefined, () => m.state !== 'act');
    if (hurt) {
      assert.equal(s.hurts.length, 1, `at ${far}, ${side} aside: struck once`);
      near(s.hurts[0].t + t0, ES_LASH.hit, 1.5 / 60, 'at its moment');
    } else assert.equal(s.hurts.length, 0, 'beyond its arm: not struck');
  }
});

test('4. its gaze: only at a hero on its line; it burns him once, with fire, as its beam comes to him; not one off its line', () => {
  // (on its line, two tiles off)
  {
    const { g, m } = room('spawn', 2.0, 'spawn:gaze');
    assert.ok(untilAct(g, m, 'spawn:gaze'), 'it gazes at a hero on its line');
    const w = pictureWay(m.fx, m.fy);
    near(m.fx, w.x, 1e-9, 'turned to the way its picture faces');
    near(m.fy, w.y, 1e-9, 'turned to the way its picture faces');
    const t0 = m.act!.t;
    const far = Math.hypot(g.hero.x - m.x, g.hero.y - m.y);
    const s = watch(g, m, 2.4, undefined, () => m.state !== 'act');
    assert.equal(s.hurts.length, 1, 'burned once');
    // (when its beam's point comes to him)
    let when = SPAWN.gaze.beam[0];
    while (when < SPAWN.gaze.beam[1] && (beamFar(when) ?? 0) < far - 0.3) when += 0.005;
    near(s.hurts[0].t + t0, when, 0.08, 'as its beam comes to him');
    assert.ok(s.events.some((e) => e.t === 'hit' && e.onHero && e.el === 'fire'), 'with fire');
  }
  // (stepping on the line behind its beam, while it burns)
  {
    const { g, m } = room('spawn', 2.0, 'spawn:gaze');
    untilAct(g, m, 'spawn:gaze');
    const h = g.hero;
    h.x = m.x + m.fx * 2.4 + m.fy * 1.2;
    h.y = m.y + m.fy * 2.4 - m.fx * 1.2;
    const s = watch(g, m, 2.4, (t) => {
      if (m.act && m.act.t > 1.5) {
        h.x = m.x + m.fx * 0.9;
        h.y = m.y + m.fy * 0.9;
      }
      void t;
    }, () => m.state !== 'act');
    assert.equal(s.hurts.length, 1, 'stepped onto its burning line: burned');
  }
  // (off its line, at a slant between two of its picture's ways: it does not gaze; it comes on and lashes)
  {
    const { g, m } = room('spawn', 2.0, null);
    const h = g.hero;
    m.x = h.x + 1.5;
    m.y = h.y + 1.5;
    keep(m, 'spawn:gaze');
    const s = watch(g, m, 3, undefined, () => m.state === 'act');
    assert.ok(s.act !== 'spawn:gaze', 'no gaze at a hero off its line');
  }
});

test('5. hatching: one spawned to hatch hatches first, played whole; then it is itself', () => {
  const { g, m } = room('spawn', 3);
  const egg = g.spawn('spawn', g.hero.x + 2, g.hero.y + 2, -4, 0, false, new RNG(4));
  egg.a1 = { hatch: 1 };
  egg.state = 'chase';
  const art = makeBestiary().of('spawn');
  const fx = act1Fx('spawn')!;
  assert.equal(fx.sprite!(egg, art, art.front), clipFrame(art.front.clips!.moves!.hatch, 0), "until it begins, its hatching's first picture");
  let began = -1;
  let ended = -1;
  watch(g, m, 3, undefined, () => {
    if (began < 0 && egg.state === 'act' && egg.act?.id === 'spawn:hatch') began = g.time;
    if (began >= 0 && ended < 0 && egg.act?.id !== 'spawn:hatch') ended = g.time;
    return ended >= 0;
  });
  assert.ok(began >= 0, 'it hatches');
  near(ended - began, ES_HATCH.long, 2 / 60, 'its hatching played whole');
  assert.equal(egg.a1?.hatch, 0, 'hatched');
  assert.equal(fx.sprite!(egg, art, art.front), null, 'its pictures are its gait and acts once hatched');
  // (and after it, itself: it comes on and lashes)
  const s = watch(g, egg, 6, undefined, () => egg.state === 'act');
  assert.ok(s.act === 'spawn:lash' || s.act === 'spawn:gaze', `it fights (${s.act})`);
});

test('6. it comes in packs of its size, on its floor', () => {
  assert.equal(sizeOf('spawn'), 'medium');
  const [lo, hi] = PACK_BY_SIZE.medium;
  const rng = new RNG(8);
  let seen = 0;
  for (let k = 0; k < 600; k++) {
    const p = act1Pack(10, rng, 'normal');
    if (p.kind !== 'spawn') continue;
    seen++;
    assert.ok(p.size >= lo && p.size <= hi, `a pack of ${p.size}`);
  }
  assert.ok(seen > 20, 'its own packs on floor 10, no stand-in');
});

test('7. a long fight on its floor with a pack of them: no exceptions, both its attacks made', () => {
  const { acts } = longFight('spawn', 10, 50);
  for (const id of ['spawn:lash', 'spawn:gaze']) assert.ok(acts.has(id), `it made its ${id}`);
});
