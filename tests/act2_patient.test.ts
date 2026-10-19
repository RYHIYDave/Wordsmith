// ACT 2, THE HUSH: FLOOR 14'S HUSHED PATIENTS IN THE GAME (game/act1_rules/patient.ts; their pictures art/act1_figs/patient.ts,
// the art chat's art/patients.ts and patients_moves.ts; what they draw, render/act1_fx/patient.ts, the art's patient_shots.ts).
//
//   1. they are built: their rules, their pictures with the clips their acts name (both ways they are seen), what they draw;
//   2. their numbers are their pictures' own (their pace and shuffle, the scream's length, moment, mouth and burst, their
//      rising, where the bed lies behind them), and their size as the game goes by it;
//   3. IN THEIR BEDS: one laid by a ward bed lies in it, as the art lays it (behind it, facing the way it rises, either way
//      the bed is turned), the bed shown risen from; it lies there woken until the hero passes near, then rises, and stands
//      clear of the bed; one with no bed stands where it was laid;
//   4. struck in bed it rises at once, and is not brought down until it has stood;
//   5. the scream lands as its burst's front rolls over a hero before them, once; not on one beside them, behind them, or
//      beyond its reach, nor on one who rolls through it as it passes;
//   6. small: their packs of four to seven, on floor 14, with the Hush on; with it off, never;
//   7. what they draw: lying in bed, the art's own picture of it; the scream's burst only while it lasts; nothing cyan;
//   8. a ward of them in a long fight: no exceptions; every act made.
//   run: tsx --test tests/act2_patient.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIGURE_SIZE, makeBestiary } from '../src/art/bestiary';
import { GRAIN } from '../src/art/kit';
import { TILE3, skeletonAt } from '../src/art/new_mobs3';
import { PATIENTS_ON, PT_BED } from '../src/art/patients';
import { PATIENT_MAN, PT_PACE, PT_RISE, PT_SCREAM, PT_WALK, mouthOf } from '../src/art/patients_moves';
import { SCREAM_FOR, SCREAM_HALF, SCREAM_REACH } from '../src/art/patient_shots';
import { FIG } from '../src/art/act1_figs/patient';
import { act1Fig } from '../src/art/act1_figs/index';
import { RNG } from '../src/engine/rng';
import { ACT1, ACT2 } from '../src/game/act1';
import { act2Pack, act2Ready } from '../src/game/act2_mobs';
import { PATIENT, PATIENT_ACTS, PATIENT_GAIT, RULES, bedPlace, screamFront } from '../src/game/act1_rules/patient';
import { act1Rules } from '../src/game/act1_rules/index';
import { actsOf, gaitOf } from '../src/game/bosses';
import { MONSTERS, PACK_BY_SIZE, TUNE, sizeOf } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster, PropInst } from '../src/game/state';
import { FX } from '../src/render/act1_fx/patient';
import { act1Fx } from '../src/render/act1_fx/index';
import { cyanIn, fakeCtx, fakeDocument, firstHurt, room, watch } from './act1_kinds_room';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);

paintWithoutCanvas();
fakeDocument();

const act = (id: string) => PATIENT_ACTS.find((a) => a.id === id)!;
type Hooks = { waveT: number; wakeUp(m: Monster): void; damageMonster(m: Monster, n: number, el: string, crit: boolean, k: number): void };
const hooks = (g: Game): Hooks => g as unknown as Hooks;

/** A ward bed laid at tile (tx, ty) of the practice room, its head toward -x (`variant` 0) or -y (2), solid as the dresser lays it. */
function layBed(g: Game, tx: number, ty: number, variant: number): PropInst {
  const L = g.level;
  const p: PropInst = { kind: 'piece', name: PATIENT.bed.piece, tx, ty, x: tx + 0.5, y: ty + 0.5, solid: true, state: 0, variant };
  L.props.push(p);
  L.walk[ty * L.floor.w + tx] = 0;
  return p;
}
/** An empty practice room, the hero at its middle, nothing else in it. */
function ward(): Game {
  const g = Game.forPractice('warrior', 5);
  hooks(g).waveT = 1e9;
  g.monsters.length = 0;
  g.events.length = 0;
  return g;
}
function step(g: Game, secs: number, each?: (t: number) => void): void {
  const c = emptyControls();
  for (let k = 0; k < Math.round(secs * 60); k++) {
    g.update(1 / 60, c);
    g.hero.life = g.hero.d.maxLife;
    if (each) each((k + 1) / 60);
  }
}

test('1. they are built: their rules, their pictures with the clips their acts name, what they draw', () => {
  assert.ok(ACT1.on, 'the acts\' kinds are run by their rules');
  assert.ok(act1Rules('patient') === RULES && RULES, 'their rules');
  assert.ok(act2Ready('patient'), 'in the game with the Hush: no longer stood in for');
  assert.ok(act1Fx('patient') === FX && FX, 'what they draw');
  assert.ok(act1Fig('patient') === FIG && FIG, 'their pictures');
  assert.ok(FIG!.switches!.includes(PATIENTS_ON), "the art chat's switch for them");
  assert.ok(!FIG!.heavy, 'a small mob: not made for its floor and let go of as a boss is');
  const art = FIG!.make();
  for (const set of [art.front, art.back]) {
    for (const a of PATIENT_ACTS) {
      const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
      assert.ok(clip && clip.frames.length > 0, `its ${a.id} plays its clip ${a.clip}`);
      near((clip!.frames.length - 1) / clip!.fps, a.long, 0.05, `${a.id}: its clip as long as the act`);
    }
    near(set.clips!.attack!.hit!, act('patient:scream').hit, 1e-9, "the scream's clip screams at the act's moment");
    assert.ok(set.clips?.moves?.abed && set.clips.moves.abed.frames.length === 30 && set.clips.moves.abed.loop === 0, 'lying in bed, going round');
    assert.ok(set.clips?.reel && set.clips.die, 'struck, and their death');
  }
  const g = ward();
  const m = g.spawn('patient', g.hero.x - 3, g.hero.y, 1, 0, false, new RNG(3));
  assert.ok(gaitOf(m.kind) === PATIENT_GAIT && actsOf(m) === PATIENT_ACTS, 'run by their rules');
  assert.equal(PATIENT_ACTS.filter((a) => !a.forced).length, 1, 'small: one attack (his rule)');
});

test("2. their numbers are their pictures' own, and their size as the game goes by it", () => {
  const G = PATIENT_GAIT;
  assert.equal(G.pace, PT_PACE, 'the pace their shuffle is painted for');
  assert.equal(MONSTERS.patient.speed, PT_PACE, 'and they go at it: their feet do not slide');
  near(G.cycle, 1 / PT_WALK.fps, 1e-9, 'they stop at any frame of it, as their pictures hand over from any');
  assert.equal(G.setOff + G.halt, 0, 'their shuffle loops from their stand');
  assert.equal(G.trueBack, !!PATIENT_MAN.trueBack, 'from behind as their pictures are painted');
  const keys = PATIENT_MAN.attack.motion.keys;
  near(act('patient:scream').long, keys[keys.length - 1].at, 1e-9, 'the scream is as long as its picture');
  assert.equal(act('patient:scream').hit, PT_SCREAM.hit, 'and bursts out at its moment');
  assert.equal(PATIENT.scream.hit, PT_SCREAM.hit);
  assert.equal(MONSTERS.patient.windup, PT_SCREAM.hit, "their blow's moment, the scream's");
  near(PATIENT.scream.from, mouthOf(skeletonAt(PATIENT_MAN, 'attack', PT_SCREAM.hit))[0] / TILE3, 0.002, 'the burst leaves the mouth, where the art has it at the scream');
  assert.equal(PATIENT.scream.reach, SCREAM_REACH, 'it rolls out as far as the art draws it');
  near(PATIENT.scream.half, (SCREAM_HALF * Math.PI) / 180, 1e-9, 'as wide');
  assert.equal(PATIENT.scream.long, SCREAM_FOR, 'and is gone as soon');
  assert.equal(PT_SCREAM.burst, SCREAM_FOR, "(the art's burst in their picture lasts as long)");
  near(screamFront(0)!, 0.15, 1e-9, 'its front leaves the mouth');
  near(screamFront(SCREAM_FOR - 1e-6)!, SCREAM_REACH, 1e-3, 'and is at its reach as it goes');
  assert.equal(screamFront(SCREAM_FOR), null, 'gone');
  assert.equal(act('patient:rise').long, PT_RISE.long, 'their rising as long as its picture');
  assert.equal(PATIENT.rise.up, PT_RISE.up, 'stood when it has them stood');
  assert.equal(PATIENT.rise.feet, PT_RISE.feet, 'their feet on the floor when it has them');
  near(PATIENT.bed.back, -PT_BED.x / TILE3, 1e-9, 'the bed behind them as the art lays it (PT_BED, 20 of their lengths)');
  assert.ok(act('patient:scream').far <= PATIENT.scream.from + SCREAM_REACH, 'they scream at a hero their burst can reach');
  assert.ok(G.stopAt < act('patient:scream').far, 'and stop within it');
  // THEIR SIZE, measured as tests/first5_bosses.test.ts measures the others'
  const art = makeBestiary();
  const size = FIGURE_SIZE.patient;
  assert.deepEqual(size, FIG!.size, 'the game goes by their own');
  const sp = art.of('patient').front.idle[0];
  const p = paintingOf(sp);
  const ax = Math.round(sp.ax * GRAIN);
  const ay = Math.round(sp.ay * GRAIN);
  let head = 0;
  for (let y = 0; y < p.h && head === 0; y++) for (let x = ax - 3; x <= ax + 3; x++) if (p.has(x, y)) head = (ay - y) / GRAIN;
  assert.ok(Math.abs(size.top - head) <= 4, `the game takes their top to be ${size.top} up; in the picture it is ${head}`);
  const reach = Math.max(sp.ax, sp.w - sp.ax);
  assert.ok(size.half <= reach + 1 && size.half >= reach * 0.4, `${size.half} to either side; the picture reaches ${reach}`);
});

test('3. in their beds: they lie as the art lays them until the hero passes near, then rise and stand clear; with no bed, they stand', () => {
  for (const variant of [2, 0]) {
    const g = ward();
    const h = g.hero;
    // (a bed four tiles west of the hero, its head toward -y (frame 2) or -x (frame 0); the patient laid beside it)
    const bed = layBed(g, Math.floor(h.x) - 5, Math.floor(h.y), variant);
    const m = g.spawn('patient', bed.x + 0.9, bed.y + 0.6, 4, 0, false, new RNG(7));
    const at = bedPlace(bed);
    assert.equal(m.a1!.bed, 1, `it lies in the bed (frame ${variant})`);
    near(m.x, at.x, 1e-9, 'where the art lays one in bed');
    near(m.y, at.y, 1e-9, 'where the art lays one in bed');
    near(Math.hypot(m.x - bed.x, m.y - bed.y), -PT_BED.x / TILE3, 1e-9, "the bed's middle behind it");
    // (facing you, down the screen to the right over a bed whose head is toward -y; turned over, down to the left, over one toward -x)
    assert.deepEqual([m.fx, m.fy], variant === 2 ? [1, 0] : [0, 1], 'facing the way the art has it rise');
    assert.equal(bed.variant, variant + 1, 'the bed shown in its risen-from frame');
    const art = FIG!.make();
    const set = m.fx + m.fy < -0.2 ? art.back : art.front;
    assert.ok(set.clips!.moves!.abed.frames.includes(FX!.sprite!(m, art, set)!), 'drawn as the art draws one lying in bed');
    // (woken, the hero four tiles and more off: it lies on)
    hooks(g).wakeUp(m);
    h.x = m.x + 4.2;
    h.y = m.y + 0.2;
    step(g, 3);
    assert.equal(m.a1!.bed, 1, 'woken, it lies on while the hero is further off');
    assert.ok(!m.act, 'and does nothing');
    // (he comes near: it sits up and rises)
    h.x = m.x + 2.6;
    let began = -1;
    step(g, 1.2, (t) => {
      if (began < 0 && m.act?.id === 'patient:rise') began = t;
    });
    assert.ok(began >= 0 && began <= PATIENT.rise.most + 0.1, `it rises as he passes (${began.toFixed(2)} s)`);
    assert.deepEqual([m.fx, m.fy], variant === 2 ? [1, 0] : [0, 1], 'rising as it lay, the way its picture of rising is drawn');
    const stood: { at: { x: number; y: number } | null } = { at: null };
    step(g, PATIENT.rise.long + 0.2, () => {
      if (!stood.at && m.a1!.bed === 0) stood.at = { x: m.x, y: m.y };
    });
    assert.equal(m.a1!.bed, 0, 'up out of its bed');
    const up = stood.at!;
    assert.ok(up && g.free(g.level.walk, up.x, up.y, Math.min(m.r, 0.42)), 'standing clear of the bed, free to go');
    near(Math.hypot(up.x - at.x, up.y - at.y), PATIENT.rise.step, 0.02, 'carried on clear of it as it stood');
    assert.equal(FX!.sprite!(m, art, set), null, 'drawn as its gait and acts have it');
    const x0 = m.x;
    step(g, 2);
    assert.ok(Math.abs(m.x - x0) > 0.2 || m.act, 'and comes');
  }
  {
    // (no bed near: it stands where it was laid, and wakes as any monster does)
    const g = ward();
    const m = g.spawn('patient', g.hero.x - 6, g.hero.y, 4, 0, false, new RNG(7));
    assert.equal(m.a1!.bed, 0, 'no bed: it stands');
    near(m.x, g.hero.x - 6, 1e-9, 'where it was laid');
    assert.equal(FX!.sprite!(m, FIG!.make(), FIG!.make().front), null, 'drawn standing');
  }
  {
    // (two laid by one bed: one lies in it, the other stands)
    const g = ward();
    const bed = layBed(g, Math.floor(g.hero.x) - 5, Math.floor(g.hero.y), 2);
    const a = g.spawn('patient', bed.x + 1, bed.y, 4, 0, false, new RNG(7));
    const b = g.spawn('patient', bed.x + 1.2, bed.y + 0.8, 4, 0, false, new RNG(8));
    assert.equal(a.a1!.bed + b.a1!.bed, 1, 'one bed, one patient in it');
  }
});

test('4. struck in bed it rises at once, and is not brought down until it has stood', () => {
  const g = ward();
  const h = g.hero;
  const bed = layBed(g, Math.floor(h.x) - 5, Math.floor(h.y), 2);
  const m = g.spawn('patient', bed.x + 1, bed.y, 4, 0, false, new RNG(7));
  hooks(g).wakeUp(m);
  h.x = m.x + 6;
  step(g, 0.5);
  assert.equal(m.a1!.bed, 1, 'it lies');
  // (a blow that would kill it twice over)
  hooks(g).damageMonster(m, m.maxLife * 2, 'phys', false, 0);
  assert.ok(!m.dead && m.life >= 1, 'not brought down in its bed');
  step(g, 0.1);
  assert.equal(m.act?.id, 'patient:rise', 'it rises at once');
  // (struck again as it rises: still up until it has stood)
  hooks(g).damageMonster(m, m.maxLife * 2, 'phys', false, 0);
  assert.ok(!m.dead, 'not as it rises');
  step(g, PATIENT.rise.up + 0.05);
  hooks(g).damageMonster(m, m.maxLife * 2, 'phys', false, 0);
  assert.ok(m.dead, 'stood, it falls');
  {
    // (its rising broken off by a blow that stuns or staggers it: it is up at once, clear of the bed, and may be brought down)
    const g2 = ward();
    const bed2 = layBed(g2, Math.floor(g2.hero.x) - 5, Math.floor(g2.hero.y), 2);
    const p = g2.spawn('patient', bed2.x + 1, bed2.y, 4, 0, false, new RNG(7));
    const lay = { x: p.x, y: p.y };
    hooks(g2).wakeUp(p);
    hooks(g2).damageMonster(p, 1, 'phys', false, 0);
    step(g2, 0.6);
    assert.equal(p.act?.id, 'patient:rise', 'rising');
    g2.bosses.breakOff(p);
    step(g2, 0.05);
    assert.equal(p.a1!.bed, 0, 'up at once');
    near(Math.hypot(p.x - lay.x, p.y - lay.y), PATIENT.rise.step, 0.05, 'where its rising would have left it');
    assert.ok(g2.free(g2.level.walk, p.x, p.y, Math.min(p.r, 0.42)), 'clear of the bed');
    hooks(g2).damageMonster(p, p.maxLife * 2, 'phys', false, 0);
    assert.ok(p.dead, 'and may be brought down');
  }
});

test('5. the scream lands as its front rolls over a hero before them, once; not beside, behind, beyond, nor through a roll', () => {
  const scream = act('patient:scream');
  const S = PATIENT.scream;
  /** When its front reaches a hero `D` tiles before them: seconds after the scream. */
  const reaches = (D: number): number => {
    for (let u = 0; u < S.long; u += 0.001) if (screamFront(u)! >= D - S.from - TUNE.heroRadius) return u;
    return -1;
  };
  for (const D of [0.9, 1.4]) {
    const { g, m } = room('patient', D, 'patient:scream');
    const s = watch(g, m, 2.2);
    assert.ok(s.began >= 0, `it screams at a hero ${D} tiles off`);
    assert.equal(s.hurts.length, 1, 'once');
    near(firstHurt(s) - s.began, scream.hit + Math.max(0, reaches(D)), 0.04, `as its front rolls over him (${D} tiles)`);
  }
  {
    // (made, and he stands at the edge of its reach: struck as its front comes; just past it: nothing)
    for (const [D, n] of [[S.from + S.reach + TUNE.heroRadius - 0.05, 1], [S.from + S.reach + TUNE.heroRadius + 0.15, 0]] as const) {
      const { g, m } = room('patient', 1.2, 'patient:scream');
      g.bosses.startAct(m, PATIENT_ACTS, 0);
      g.hero.x = m.x + D;
      g.hero.y = m.y;
      const s = watch(g, m, 2);
      assert.equal(s.hurts.length, n, `${D.toFixed(2)} tiles before it: ${n ? 'struck' : 'not reached'}`);
    }
  }
  {
    // (beside it, out of the fan; behind it)
    for (const [dx, dy] of [[0.3, 1.2], [-1.1, 0]] as const) {
      const { g, m } = room('patient', 1.2, 'patient:scream');
      g.bosses.startAct(m, PATIENT_ACTS, 0);
      g.hero.x = m.x + dx;
      g.hero.y = m.y + dy;
      assert.equal(watch(g, m, 2).hurts.length, 0, `at (${dx}, ${dy}) from it, out of the burst`);
    }
  }
  {
    // (he rolls through it as its front passes him: it has passed him)
    const { g, m } = room('patient', 1.3, 'patient:scream');
    const h = g.hero;
    const u = reaches(1.3);
    const s = watch(g, m, 2.2, (t) => {
      h.invuln = Math.abs(t - (scream.hit + u)) < 0.12 ? 0.1 : 0;
      return null;
    });
    assert.equal(s.hurts.length, 0, 'not struck once it has passed');
  }
});

test('6. small: their packs of four to seven on floor 14, with the Hush on; never with it off', () => {
  assert.equal(sizeOf('patient'), 'small');
  assert.equal(MONSTERS.patient.minDepth, 99, 'never drawn for a pack of the old floors');
  const was = ACT2.on;
  ACT2.on = true;
  try {
    const rng = new RNG(4);
    let seen = 0;
    for (let i = 0; i < 400; i++) {
      const p = act2Pack(14, rng, 'normal');
      if (p.kind !== 'patient') continue;
      seen++;
      assert.ok(p.size >= PACK_BY_SIZE.small[0] && p.size <= PACK_BY_SIZE.small[1], `a pack of ${p.size}`);
    }
    assert.ok(seen > 60, `floor 14 has them (${seen} of 400)`);
  } finally {
    ACT2.on = was;
  }
  assert.equal(ACT2.on, false, 'the Hush is off');
});

test('7. what they draw: in bed the art\'s own picture of it; the scream\'s burst only while it lasts; nothing cyan', () => {
  const { g, m } = room('patient', 1.2, 'patient:scream');
  let drewAt: number[] = [];
  const S = PATIENT.scream;
  // (a canvas that keeps every colour it is given, and counts what is put on it)
  const colours = new Set<string>();
  let put = 0;
  const ctx = new Proxy({} as Record<string, unknown>, {
    get: (o, k) => (k in o ? o[k as string] : k === 'fillRect' ? () => void put++ : () => undefined),
    set: (o, k, v) => {
      if (k === 'fillStyle' || k === 'strokeStyle') colours.add(String(v));
      o[k as string] = v;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
  for (let k = 0; k < 120; k++) {
    g.update(1 / 60, emptyControls());
    g.hero.life = g.hero.d.maxLife;
    const { c } = fakeCtx(g, k / 60);
    const was = put;
    FX!.air!({ ...c, g: ctx }, m, null);
    if (put > was) drewAt.push(m.act ? m.act.t : -1);
  }
  // (nothing cyan in what it draws)
  for (const col of colours) {
    const v = col.replace('#', '');
    const r = parseInt(v.slice(0, 2), 16);
    const gg = parseInt(v.slice(2, 4), 16);
    const b = parseInt(v.slice(4, 6), 16);
    assert.ok(!(b > r + 30 && gg > r + 30), `nothing cyan: ${col}`);
  }
  assert.ok(drewAt.length > 10, 'its burst is drawn');
  assert.ok(drewAt.every((t) => t >= S.hit && t < S.hit + S.long), 'only from the scream until it is gone');
  drewAt = [];
  assert.equal(FX!.ground, undefined, 'nothing under what stands');
  const art = FIG!.make();
  for (const set of [art.front, art.back]) {
    for (const sp of [set.idle[0], set.walk[3], set.clips!.attack!.frames[21], set.clips!.attack!.frames[30], set.clips!.moves!.abed.frames[0], set.clips!.moves!.rise.frames[20], set.clips!.reel!.frames[4]]) assert.equal(cyanIn(sp), 0, 'nothing cyan on them');
  }
});

test('8. a ward of them in a long fight: no exceptions; every act made', () => {
  const g = ward();
  const h = g.hero;
  const beds: PropInst[] = [];
  for (let i = 0; i < 4; i++) beds.push(layBed(g, Math.floor(h.x) - 6, Math.floor(h.y) - 4 + 2 * i, 2));
  const them: Monster[] = [];
  for (const b of beds) them.push(g.spawn('patient', b.x + 0.9, b.y, 6, 0, false, new RNG(40 + them.length)));
  for (let i = 0; i < 2; i++) them.push(g.spawn('patient', h.x - 3, h.y + 2 + i, 6, 0, false, new RNG(60 + i)));
  assert.equal(them.filter((m) => m.a1!.bed === 1).length, 4, 'four in their beds');
  hooks(g).wakeUp(them[0]);
  const used = new Set<string>();
  let k = 0;
  // (he stands a while, then walks down the ward past the beds, and about)
  step(g, 40, (t) => {
    for (const m of them) if (m.act) used.add(m.act.id);
    if (t > 4 && t < 9) h.x -= 1 / 60;
    if (t > 12) {
      h.x += Math.cos(t * 0.9) / 60;
      h.y += Math.sin(t * 1.3) / 60;
    }
    if (++k % 50 === 0) for (const m of them) if (!m.dead && m.a1!.bed === 0) hooks(g).damageMonster(m, 3, 'phys', false, 0);
  });
  assert.ok(used.has('patient:rise') && used.has('patient:scream'), `they rise and scream (${[...used].join(', ')})`);
  assert.ok(them.every((m) => m.dead || m.a1!.bed === 0), 'every one of them up out of its bed');
});
