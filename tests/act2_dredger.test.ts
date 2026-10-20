// ACT 2, THE HUSH: FLOOR 12: THE ORDER'S DREDGERS IN THE GAME (game/act1_rules/dredger.ts; their pictures art/act1_figs/dredger.ts,
// the art chat's art/dredgers.ts and dredgers_moves.ts; the haul's scrape drawn by render/act1_fx/dredger.ts), behind ACT2 (off):
//   1. they are built: their rules, their pictures with the clips their acts name (both ways they are seen); floor 12's medium
//      kind and its lairs' guardians;
//   2. their numbers are their pictures' own (their wade, the hook and haul's length and moments, where the hook is from the
//      thrust to the end of the haul, measured off the motion), and their size as the game goes by it;
//   3. the thrust lands at its picture's moment on whoever is before them along the pole, and on no one off it or past it;
//   4. THE HOOK: one out where the hook is is caught on it, held, and hauled in toward them as far as the hook comes in, never
//      nearer than it lets; let go as the haul ends, or as they die; one in under the pole is struck, not hooked; one rolling
//      through is not caught;
//   5. what they draw: the scrape of the haul, in the floor's colours, nothing cyan;
//   6. a pack of them in a long fight: no exceptions.
//   run: tsx --test tests/act2_dredger.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { DREDGERS_ON } from '../src/art/dredgers';
import { poleOf } from '../src/art/dredgers';
import { DREDGER as DR_MOB, DR_HAUL, DR_PACE, DR_WALK, makeDredgerArt3 } from '../src/art/dredgers_moves';
import { FIGURE_SIZE, makeBestiary } from '../src/art/bestiary';
import { GRAIN } from '../src/art/kit';
import { TILE3, momentOf } from '../src/art/new_mobs3';
import { act1Fig } from '../src/art/act1_figs/index';
import { FIG } from '../src/art/act1_figs/dredger';
import { RNG } from '../src/engine/rng';
import { ACT2 } from '../src/game/act1';
import { act1Pack } from '../src/game/act1_mobs';
import { ACT2_GUARD, act2Ready } from '../src/game/act2_mobs';
import { DREDGER, DREDGER_ACTS, DREDGER_GAIT, RULES, hookAt } from '../src/game/act1_rules/dredger';
import { act1Rules } from '../src/game/act1_rules/index';
import { actsOf, gaitOf } from '../src/game/bosses';
import { MONSTERS, PACK_BY_SIZE, sizeOf } from '../src/game/defs';
import { Game } from '../src/game/game';
import type { Monster } from '../src/game/state';
import { FX } from '../src/render/act1_fx/dredger';
import { act1Fx } from '../src/render/act1_fx/index';
import type { Act1FxCtx } from '../src/render/act1_fx/types';
import { cyanIn, fakeDocument, firstHurt, room, watch } from './act1_kinds_room';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
  fail(message?: string): never;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);

paintWithoutCanvas();
fakeDocument();

const hook = DREDGER_ACTS[0];
function hush<T>(fn: () => T): T {
  const was = ACT2.on;
  ACT2.on = true;
  try {
    return fn();
  } finally {
    ACT2.on = was;
  }
}
/** Where the hook is at `t` of their hook and haul, as the art's motion carries it (tiles before them, to their left). */
function hookOfArt(t: number): [number, number] {
  const mo = momentOf(DR_MOB, DR_MOB.attack, t);
  const p = poleOf(mo.s, mo.q).hook;
  return [p[0] / TILE3, p[1] / TILE3];
}

test("1. they are built: their rules, their pictures with the clips their acts name; floor 12's medium kind", () => {
  assert.ok(act1Rules('dredger') === RULES && RULES, 'their rules');
  assert.ok(act1Fig('dredger') === FIG && FIG, 'their pictures');
  assert.ok(act1Fx('dredger') === FX && FX, 'what they draw');
  assert.ok(act2Ready('dredger'), 'in the Hush: no longer stood in for');
  assert.ok(FIG!.switches!.includes(DREDGERS_ON), "the art chat's switch for them, thrown with the acts' figures (art/bestiary.ts)");
  assert.equal(sizeOf('dredger'), 'medium');
  assert.equal(ACT2_GUARD[12], 'dredger', "floor 12's lairs' guardians");
  const art = makeDredgerArt3();
  for (const set of [art.front, art.back]) {
    const clip = set.clips!.attack!;
    near((clip.frames.length - 1) / clip.fps, hook.long, 0.05, 'the hook and haul: its clip as long as the act');
    assert.equal(clip.hit, hook.hit, 'its thrust, its blow');
    assert.ok(set.clips!.reel && set.clips!.die, 'struck, and the jars burst');
  }
  const g = Game.forPractice('warrior', 5);
  const m = g.spawn('dredger', g.hero.x - 3, g.hero.y, -2, 0, false, new RNG(3));
  assert.ok(gaitOf(m.kind) === DREDGER_GAIT && actsOf(m) === DREDGER_ACTS, 'run by their rules');
  hush(() => {
    const rng = new RNG(5);
    let seen = 0;
    for (let i = 0; i < 300; i++) {
      const p = act1Pack(12, rng, 'normal');
      if (p.kind !== 'dredger') continue;
      seen++;
      assert.ok(p.size >= PACK_BY_SIZE.medium[0] && p.size <= PACK_BY_SIZE.medium[1], `a pack of ${p.size}`);
    }
    assert.ok(seen > 40, `floor 12 has them (${seen} packs of 300)`);
    assert.equal(act1Pack(12, rng, 'champion').kind, 'dredger', 'a lair is theirs');
  });
});

test("2. their numbers are their pictures' own, and their size as the game goes by it", () => {
  const G = DREDGER_GAIT;
  assert.equal(G.pace, DR_PACE, 'the pace their wade is painted for');
  assert.equal(MONSTERS.dredger.speed, DR_PACE, 'and they go at it: their feet do not slide');
  near(G.cycle, DR_WALK.frames / DR_WALK.fps, 1e-9, 'their wade goes round');
  assert.equal(G.trueBack, DR_MOB.trueBack, 'from behind as their pictures are');
  assert.equal(hook.long, DR_HAUL.long, 'the hook and haul as long as its picture');
  assert.equal(hook.hit, DR_HAUL.hit, 'the thrust at its moment');
  assert.equal(MONSTERS.dredger.windup, DR_HAUL.hit, "their blow's moment, the thrust's");
  assert.equal(MONSTERS.dredger.range, hook.far, 'their reach, the hook');
  near(DREDGER.haul.hit, DR_HAUL.hit, 1e-9, 'the thrust');
  near(DREDGER.haul.bite, DR_HAUL.bite, 1e-9, 'the bite');
  near(DREDGER.haul.haul, DR_HAUL.haul, 1e-9, 'the haul');
  assert.ok(DREDGER.haul.held > DR_HAUL.haul && DREDGER.haul.held < DR_HAUL.long, 'held a moment after the haul, before the pole is stood');
  // (the hook where the motion carries it, moment by moment from the thrust to the end of the haul)
  for (const [t, f] of DREDGER.hook) {
    const [af, al] = hookOfArt(t);
    near(f, af, 0.02, `the hook ${t.toFixed(3)} s in`);
    assert.ok(Math.abs(al) < DREDGER.strike.half, 'before them, along the pole');
  }
  for (let t = DREDGER.haul.hit; t <= DREDGER.haul.haul; t += 0.03) near(hookAt(t), hookOfArt(t)[0], 0.1, `the hook between, ${t.toFixed(2)} s in`);
  let most = 0;
  for (let t = DREDGER.haul.hit; t <= DREDGER.haul.bite; t += 0.01) most = Math.max(most, hookOfArt(t)[0]);
  assert.ok(DREDGER.strike.reach >= most + 0.25 && DREDGER.strike.reach <= most + 0.45, `the thrust reaches its hook carried through (${most.toFixed(2)}) and the hero's middle`);
  assert.ok(DREDGER.strike.catchFrom <= hookOfArt(0.6)[0], 'the hook is caught on from where it is held, drawn back, and out');
  assert.ok(hook.far <= DREDGER.strike.reach, 'it reaches as far as it thrusts from');
  // THEIR SIZE: the top of the hood (the boathook's head stands higher beside it), half their width
  const size = FIGURE_SIZE.dredger;
  assert.deepEqual(size, FIG!.size, 'the game goes by its own');
  const sp = makeBestiary().of('dredger').front.idle[0];
  const p = paintingOf(sp);
  const ax = Math.round(sp.ax * GRAIN);
  const ay = Math.round(sp.ay * GRAIN);
  let hood = 0;
  for (let y = 0; y < p.h && hood === 0; y++) for (let x = ax; x <= ax + 8; x++) if (p.has(x, y)) hood = (ay - y) / GRAIN;
  assert.ok(Math.abs(size.top - hood) <= 3, `the game takes the top to be ${size.top} up; the hood is ${hood}`);
  const reach = Math.max(sp.ax, sp.w - sp.ax);
  assert.ok(size.half <= reach + 1 && size.half >= reach * 0.4, `${size.half} to either side; the picture reaches ${reach}`);
});

test('3. the thrust lands at its moment on whoever is before them along the pole, and on no one off it or past it', () => {
  for (const far of [0.9, 1.6, 2.3, hook.far]) {
    const { g, m } = room('dredger', far, 'dredger:hook');
    const s = watch(g, m, 2.1);
    assert.equal(s.hurts.length, 1, `${far} tiles off: struck once`);
    near(firstHurt(s) - s.began, hook.hit, 0.04, `${far} tiles off: as the pole is thrust out`);
  }
  for (const [fwd, left, what] of [[DREDGER.strike.reach + 0.3, 0, 'past its hook'], [1.8, DREDGER.strike.half + 0.3, 'beside the pole']] as const) {
    const { g, m } = room('dredger', 2, 'dredger:hook');
    g.bosses.startAct(m, RULES!.acts, 0);
    g.hero.x = m.x + fwd;
    g.hero.y = m.y + left;
    assert.equal(watch(g, m, 2.0).hurts.length, 0, `${what}, it strikes no one`);
  }
});

test('4. THE HOOK: caught on it, held and hauled in as far as the hook comes in; let go after; not caught in under it, nor rolling through', () => {
  {
    const { g, m } = room('dredger', 2.2, 'dredger:hook');
    const h = g.hero;
    g.bosses.startAct(m, RULES!.acts, 0);
    const x0 = h.x;
    let held = 0;
    let hooked = false;
    let pulledBy = 0;
    const s = watch(g, m, 2.0, undefined, () => {
      if (h.held && h.held > 0) held++;
      if (m.act && m.act.t > DREDGER.haul.hit && m.act.t < DREDGER.haul.bite) pulledBy = Math.max(pulledBy, Math.abs(h.x - x0));
      return false;
    });
    hooked = s.events.some((e) => e.t === 'text' && (e as { text: string }).text === 'Hooked');
    assert.ok(hooked, 'hooked');
    assert.ok(held / 60 >= DREDGER.haul.held - DREDGER.haul.hit - 0.1, `held from the thrust to the end of the haul (${(held / 60).toFixed(2)} s)`);
    assert.ok(pulledBy < 0.05, 'not pulled before the hook bites');
    const came = x0 - h.x;
    near(came, hookAt(DREDGER.haul.bite) - hookAt(DREDGER.haul.held), 0.12, 'hauled in as far as the hook comes in');
    assert.ok(h.x - m.x >= DREDGER.strike.least - 0.05, 'never nearer them than the hook lets');
    assert.ok(!h.held, 'let go as the haul ends');
    assert.ok(!m.a1!.hooked, 'and their hook is free');
  }
  {
    // (in under the pole: struck, not hooked)
    const { g, m } = room('dredger', 1.0, 'dredger:hook');
    const x0 = g.hero.x;
    const s = watch(g, m, 2.0);
    assert.equal(s.hurts.length, 1, 'struck');
    assert.ok(!s.events.some((e) => e.t === 'text' && (e as { text: string }).text === 'Hooked'), 'not hooked');
    assert.ok(Math.abs(g.hero.x - x0) < 0.05, 'not moved');
  }
  {
    // (killed as they haul: he is let go there and then)
    const { g, m } = room('dredger', 2.2, 'dredger:hook');
    watch(g, m, 2.0, undefined, () => !!m.act && m.act.t > DREDGER.haul.bite + 0.1);
    assert.ok(g.hero.held && g.hero.held > 0, 'held as they haul');
    g.kill(m);
    assert.ok(!g.hero.held, 'let go as they die');
    const x = g.hero.x;
    watch(g, m, 1.0);
    assert.ok(Math.abs(g.hero.x - x) < 1e-6, 'and hauled no more');
  }
  {
    // (rolling through as it is thrust: not caught)
    const { g, m } = room('dredger', 2.2, 'dredger:hook');
    const h = g.hero;
    watch(g, m, 2.0, undefined, () => !!m.act && m.act.t > DREDGER.haul.hit - 0.05);
    h.move = { kind: 'roll', t: 0, dur: 0.4, x0: h.x, y0: h.y, x1: h.x, y1: h.y + 0.01 } as typeof h.move;
    const s = watch(g, m, 1.5);
    assert.equal(s.hurts.length, 0, 'not struck');
    assert.ok(!m.a1!.hooked, 'not hooked');
  }
});

test('5. what they draw: the scrape of the haul, in the floor\'s colours, nothing cyan', () => {
  const colours = new Set<string>();
  let dots = 0;
  const ctx = new Proxy({} as Record<string, unknown>, {
    get: (o, k) => (k === 'fillRect' ? () => void dots++ : k in o ? o[k as string] : () => undefined),
    set: (o, k, v) => {
      if (k === 'fillStyle' || k === 'strokeStyle') colours.add(String(v));
      o[k as string] = v;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
  const { g, m } = room('dredger', 2.2, 'dredger:hook');
  const c: Act1FxCtx = { g: ctx, at: (x, y) => [(x - y) * 16, (x + y) * 8], game: g, t: 0, bestiary: makeBestiary(), stand: () => undefined, spot: () => undefined };
  let drawnWhileHauled = 0;
  watch(g, m, 2.0, undefined, () => {
    const before = dots;
    FX!.ground!(c, m, null);
    if (dots > before && m.a1?.hooked) drawnWhileHauled++;
    if (dots > before && !m.a1?.hooked) assert.fail('drawn while it has no one on its hook');
    return false;
  });
  assert.ok(drawnWhileHauled > 20, `the scrape drawn while he is hauled (${drawnWhileHauled} frames)`);
  for (const col of colours) {
    const v = col.replace('#', '');
    const r = parseInt(v.slice(0, 2), 16);
    const gg = parseInt(v.slice(2, 4), 16);
    const b = parseInt(v.slice(4, 6), 16);
    assert.ok(!(b > r + 30 && gg > r + 30), `nothing cyan: ${col}`);
  }
  const art = makeDredgerArt3();
  for (const set of [art.front, art.back]) for (const sp of [set.idle[0], set.walk[4], set.clips!.attack!.frames[22], set.clips!.attack!.frames[30], set.clips!.reel!.frames[5]]) assert.equal(cyanIn(sp), 0, 'nothing cyan on them');
});

test('6. a pack of them in a long fight: no exceptions', () => {
  const { g, m } = room('dredger', 3, null);
  for (let i = 0; i < 3; i++) g.spawn('dredger', m.x - 0.9 * (i + 1), m.y + (i % 2 ? 1 : -1), -2, 0, false, new RNG(30 + i));
  for (const o of g.monsters) (g as unknown as { wakeUp(m: Monster): void }).wakeUp(o);
  let hooked = 0;
  const s = watch(g, m, 40, (t) => (t < 15 ? null : { mx: Math.cos(t * 0.7), my: Math.sin(t * 1.1) }), () => {
    if (g.hero.held && g.hero.held > 0) hooked++;
    return false;
  });
  assert.ok(s.hurts.length > 3, `they strike him (${s.hurts.length})`);
  assert.ok(hooked > 0, 'and hook him');
});
