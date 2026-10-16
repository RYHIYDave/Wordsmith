// ACT 1: THE HOLLOW STAG, FLOOR 9'S BOSS, IN THE GAME (game/act1_rules/stag.ts; its pictures art/act1_figs/stag.ts,
// the art chat's art/hollow_stag.ts; what it draws, render/act1_fx/stag.ts):
//   1. it is built: its rules, its pictures with every clip its acts name, what it draws; it is floor 9's boss, a boss;
//   2. the rules' numbers are its pictures' own (its stotting, every move's length and moments, its antlers' reach,
//      its charge's run, its roots' way through the ground);
//   3. it stots: carried at its pace, turning only as it lands, stopping only landed, jinking as it comes;
//   4. its gore lands at its picture's moment and reach;
//   5. its charge runs at its picture's pace and runs the hero down on the way; only with a clear run; a pine before
//      its antlers at the crash splinters;
//   6. its roots harm whoever their head passes, along three lines in a fan, when their picture's head passes;
//   7. its bellow: what answers from the fog, never more than so many;
//   8. killed in the middle of anything, nothing of it is left harming the hero; a long fight throws nothing;
//   9. what it draws is the enemy's colours, never cyan; its size as the game goes by it, against its picture.

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIG } from '../src/art/act1_figs/stag';
import { FIGURE_SIZE, makeBestiary } from '../src/art/bestiary';
import { ROOT_SNAKE, STAG_BELLOW, STAG_BOUNDS, STAG_CHARGE, STAG_FEET, STAG_GORE, STAG_ON, STAG_PACE, STAG_ROOTS, STAG_WALK, makeStagArt, stagLong, stagRootTime, stagSolids } from '../src/art/hollow_stag';
import { GRAIN } from '../src/art/kit';
import { TILE3 } from '../src/art/new_mobs3';
import { RNG } from '../src/engine/rng';
import { RULES, STAG, STAG_ACTS, STAG_GAIT, answers, rootHeadAt } from '../src/game/act1_rules/stag';
import { actsOf, bossKind, gaitOf } from '../src/game/bosses';
import { MONSTERS, sizeOf } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { ActId, Monster, PropInst } from '../src/game/state';
import { FX } from '../src/render/act1_fx/stag';
import type { Act1FxCtx } from '../src/render/act1_fx/types';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
paintWithoutCanvas();

const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);
const act = (id: string) => STAG_ACTS.find((a) => a.id === id)!;

/** An empty practice room, the hero still at its middle, and the Stag `far` tiles west of him, awake, facing him, not to be killed; every act of its but `only` kept cooling. */
function room(far: number, only: ActId | null = null): { g: Game; m: Monster } {
  const g = Game.forPractice('warrior', 5);
  const hooks = g as unknown as { waveT: number; wakeUp(m: Monster): void };
  hooks.waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  h.x += Math.max(0, far - 7);
  const m = g.spawn('stag', h.x - far, h.y, -2, 0, false, new RNG(9));
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
interface Seen {
  hurts: { t: number; n: number }[];
  began: number;
}
function watch(g: Game, m: Monster, secs: number, place?: (t: number) => { x: number; y: number } | null, until?: () => boolean, each?: () => void): Seen {
  const c = emptyControls();
  const h = g.hero;
  const seen: Seen = { hurts: [], began: -1 };
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
    g.events.length = 0;
    if (each) each();
    if (until && until()) break;
  }
  return seen;
}
const since = (s: Seen, i: number): number => s.hurts[i].t - s.began;

test("1. it is built: its rules, its pictures with every clip its acts name, what it draws; floor 9's boss", () => {
  assert.ok(RULES && FIG && FX, 'its rules, its pictures and what it draws');
  assert.equal(bossKind(9), 'stag', "floor 9's boss is the Hollow Stag");
  assert.equal(sizeOf('stag'), 'boss');
  assert.equal(RULES!.acts.length, 4, 'a boss: four (his rulebook)');
  assert.equal(RULES!.acts[0].clip, 'attack', 'its basic blow first');
  assert.ok(RULES!.acts.slice(1).every((a) => a.cooldown > 0), 'the others cool down');
  assert.ok(act('stag:charge').cooldown > act('stag:roots').cooldown && act('stag:charge').dmg > act('stag:roots').dmg, 'the bigger the hit, the longer the cooldown');
  assert.equal(FIG!.heavy, true, 'heavy: a boss, made for its floor');
  assert.ok(FIG!.switches!.includes(STAG_ON), "the art chat's switch for it goes on with the descent");
  const art = makeStagArt();
  for (const set of [art.front, art.back]) {
    for (const a of RULES!.acts) assert.ok(a.clip === 'attack' ? set.clips!.attack : set.clips!.moves![a.clip], `its ${a.id}'s picture, ${a.clip}`);
    assert.ok(set.clips!.reel && set.clips!.die, 'struck, and its death');
  }
  const g = Game.forPractice('warrior', 5);
  const m = g.spawn('stag', g.hero.x - 3, g.hero.y, -2, 0, false, new RNG(3));
  assert.ok(gaitOf(m.kind) === STAG_GAIT && actsOf(m) === STAG_ACTS, 'run by its rules');
});

test("2. the rules' numbers are its pictures' own", () => {
  const G = STAG_GAIT;
  assert.equal(G.pace, STAG_PACE);
  near(G.cycle, STAG_WALK.frames / STAG_WALK.fps, 1e-9, 'its stotting round');
  near(G.cycle, STAG_WALK.period, 1e-9, 'its stotting round');
  assert.equal(G.setOff, 0, 'it sets off from its stand into its stotting');
  assert.equal(G.halt, 0, 'and stops back onto its stand as it lands');
  assert.deepEqual([...STAG.stot.land], [...STAG_BOUNDS.land], 'it lands when its picture lands');
  assert.equal(STAG.stot.down, STAG_BOUNDS.down);
  assert.equal(STAG.stot.fps, STAG_WALK.fps);
  assert.equal(MONSTERS.stag.speed, STAG_PACE, 'it goes at its stotting\'s pace');
  assert.equal(MONSTERS.stag.windup, STAG_GORE.hit, "its blow's moment, its gore's");
  for (const a of STAG_ACTS) near(a.long, stagLong(a.clip), 1e-9, `${a.id}: its length`);
  assert.equal(act('stag:gore').hit, STAG_GORE.hit);
  assert.equal(act('stag:charge').hit, STAG_CHARGE.crash);
  assert.equal(act('stag:roots').hit, STAG_ROOTS.slam);
  assert.equal(act('stag:bellow').hit, STAG_BELLOW.roar);
  // (its antlers: as far before it as they sweep, from its forefeet)
  near(STAG.gore.reach, (STAG_GORE.reach + STAG_FEET[0][0]) / TILE3, 1e-6, "its antlers' reach");
  const tips = stagSolids('attack', STAG_GORE.hit).filter((b) => /^beam-?1_5$/.test(b.piece)).map((b) => (b.shape as unknown as { b: number[] }).b);
  assert.equal(tips.length, 2, 'both its antlers');
  for (const tp of tips) {
    assert.ok(Math.abs(tp[0] / TILE3 - STAG.gore.reach) <= 0.35, `an antler's tip at the gore, ${(tp[0] / TILE3).toFixed(2)} before it`);
    assert.ok(Math.abs(tp[1] / TILE3) <= STAG.gore.half + 0.3, 'and as wide as it harms');
  }
  assert.equal(STAG.charge.run, STAG_CHARGE.run);
  assert.equal(STAG.charge.crash, STAG_CHARGE.crash);
  assert.equal(STAG.charge.pace, STAG_CHARGE.pace);
  assert.equal(STAG.charge.warn, STAG_CHARGE.warn);
  assert.equal(STAG.roots.slam, STAG_ROOTS.slam);
  assert.equal(STAG.roots.freeze, STAG_ROOTS.freeze);
  assert.equal(STAG.roots.reach, STAG_ROOTS.reach);
  assert.equal(STAG.roots.from, ROOT_SNAKE.from);
  assert.equal(STAG.roots.speed, ROOT_SNAKE.speed);
  assert.equal(STAG.roots.body, ROOT_SNAKE.body);
  for (const d of [0.6, 1.5, 3, 6]) near(STAG.roots.slam + rootHeadAt(d), stagRootTime(d), 1e-9, `its root's head ${d} tiles out`);
  assert.deepEqual([...STAG.roots.fan], [-24, 0, 24], "three lines in a fan, as its film lays them");
  assert.equal(STAG.bellow.roar, STAG_BELLOW.roar);
});

test('3. it stots: carried at its pace, turning only as it lands, stopping only landed, jinking as it comes', () => {
  const { g, m } = room(8.5);
  m.moveCd = STAG_ACTS.map(() => 1e9);
  const G = STAG_GAIT;
  const landed = (t: number): boolean => {
    const p = t - Math.floor(t / G.cycle) * G.cycle;
    return STAG.stot.land.some((l) => p >= l - 1e-6 && p <= l + STAG.stot.down + 1e-6);
  };
  let turns = 0;
  let stops = 0;
  let steps = 0;
  let wrong = 0;
  const c = emptyControls();
  const h = g.hero;
  for (let k = 0; k < 60 * 20; k++) {
    // (the hero runs about, far from it, so that it comes and comes)
    const a = k / 60 / 3;
    h.x = 8 + Math.cos(a) * 5;
    h.y = 8 + Math.sin(a * 1.3) * 5;
    const was = { fx: m.fx, fy: m.fy, x: m.x, y: m.y, mode: m.gait?.mode, t: m.gait?.t ?? 0 };
    g.update(1 / 60, c);
    h.life = h.d.maxLife;
    const mode = m.gait?.mode;
    if (was.mode === 'walk' && mode === 'walk') {
      steps++;
      const d = Math.hypot(m.x - was.x, m.y - was.y);
      if (d > G.pace / 60 + 1e-6) wrong++;
      if (Math.abs(m.fx - was.fx) + Math.abs(m.fy - was.fy) > 1e-6) {
        turns++;
        assert.ok(landed(m.gait!.t) || landed(was.t), `it turns only as it lands (at ${(m.gait!.t % G.cycle).toFixed(3)} s of its round)`);
      }
    }
    if (was.mode === 'walk' && mode !== 'walk') {
      stops++;
      assert.ok(landed(was.t + 1 / 60) || landed(was.t), `it stops only landed (at ${(was.t % G.cycle).toFixed(3)} s of its round)`);
    }
  }
  assert.equal(wrong, 0, 'never faster than its pace');
  assert.ok(steps > 300, `it stots (${steps} steps)`);
  assert.ok(turns > 10, `turning as it lands, often: jinking (${turns})`);
  assert.ok(stops > 0, 'and stops');
});

test('4. its gore lands at its picture\'s moment and reach', () => {
  {
    const { g, m } = room(1.6, 'stag:gore');
    const s = watch(g, m, 1.8);
    assert.equal(s.hurts.length, 1, 'struck once');
    near(since(s, 0), STAG_GORE.hit, 0.03, 'as its antlers hook up through him');
  }
  {
    const { g, m } = room(1.6, 'stag:gore');
    const h0 = { x: g.hero.x, y: g.hero.y };
    const s = watch(g, m, 1.8, (t) => (t > 0.4 ? { x: h0.x, y: h0.y + 1.6 } : null));
    assert.equal(s.hurts.length, 0, 'stepped aside, it misses');
  }
  {
    const { g, m } = room(1.6, 'stag:gore');
    const s = watch(g, m, 1.8, (t) => (t > 0.4 ? { x: m.x + 3.2, y: m.y } : null));
    assert.equal(s.hurts.length, 0, 'beyond its antlers, it misses');
  }
});

test('5. its charge runs at its picture\'s pace and runs the hero down on the way; only with a clear run; a pine splinters', () => {
  const C = STAG.charge;
  {
    const { g, m } = room(4, 'stag:charge');
    const s = watch(g, m, 2.8);
    assert.ok(s.hurts.length >= 1, 'run down');
    const t = since(s, 0);
    assert.ok(t > C.run && t <= C.crash + 0.02, `as it runs (${t.toFixed(2)} s)`);
    near(t, C.run + (4 - C.ahead[1]) / C.pace, 0.05, 'as its antlers come to him');
  }
  {
    // (out of its lane in time: nothing; and it runs its picture's whole run, at its pace)
    const { g, m } = room(4, 'stag:charge');
    const h0 = { x: g.hero.x, y: g.hero.y };
    const x0 = m.x;
    let at = -1;
    const s = watch(g, m, 2.8, (t) => (t > 0.5 ? { x: h0.x, y: h0.y + 2 } : null), undefined, () => {
      if (m.state === 'act' && m.act && m.act.t >= C.crash && at < 0) at = m.x;
    });
    assert.equal(s.hurts.length, 0, 'out of its lane in time, nothing');
    near(at - x0, C.pace * (C.crash - C.run), 0.02, "carried its picture's run, at its pace");
  }
  {
    // (not into a wall: no clear run, no charge)
    const { g, m } = room(4);
    const f = g.level.floor;
    for (let y = 0; y < f.h; y++) g.level.walk[y * f.w + Math.floor(m.x + 3)] = 0;
    assert.equal(RULES!.can!(g.bosses, m, act('stag:charge'), 4, true), false, 'no clear run, no charge');
  }
  {
    // (a pine before its antlers as it crashes splinters: a stump after)
    const { g, m } = room(4, 'stag:charge');
    const end = m.x + C.pace * (C.crash - C.run) + 1.2;
    const pine: PropInst = { kind: 'piece', name: 'young pine', tx: Math.floor(end), ty: Math.floor(m.y), x: end, y: m.y, solid: false, state: 0, variant: 0 };
    g.level.props.push(pine);
    watch(g, m, 2.8);
    assert.equal(pine.name, 'stump', 'the pine splinters');
  }
});

test('6. its roots harm whoever their head passes, along three lines in a fan, when its picture\'s head passes', () => {
  {
    const { g, m } = room(3, 'stag:roots');
    const s = watch(g, m, 2.8);
    assert.equal(g.perils.length === 0 || g.perils.every((p) => p.a1 === 'stag:root'), true);
    assert.equal(s.hurts.length, 1, 'struck once');
    const t = since(s, 0);
    assert.ok(t >= stagRootTime(3 - 0.3) - 0.02 && t <= stagRootTime(3) + 0.02, `as its root's head comes to him (${t.toFixed(2)} s; it passes him at ${stagRootTime(3).toFixed(2)})`);
  }
  {
    let lines = 0;
    const { g, m } = room(3, 'stag:roots');
    const h0 = { x: g.hero.x, y: g.hero.y };
    // (after the slam, off every line: between two of them)
    const s = watch(g, m, 2.8, (t) => (t > STAG.roots.slam + 0.05 ? { x: h0.x, y: h0.y + 0.75 } : null), undefined, () => {
      lines = Math.max(lines, g.perils.filter((p) => p.a1 === 'stag:root').length);
    });
    assert.equal(lines, 3, 'three lines');
    assert.equal(s.hurts.length, 0, 'between its lines, nothing');
  }
  {
    // (near it, where its lines have not yet parted, more than one passes him: they strike once)
    const { g, m } = room(1.0, 'stag:roots');
    const s = watch(g, m, 2.8);
    assert.equal(s.hurts.length, 1, `its slam's roots strike him once (${s.hurts.length})`);
  }
  {
    const { g, m } = room(4.5, 'stag:roots');
    // (rolled through it as it came)
    const s = watch(g, m, 2.8, (t) => {
      g.hero.invuln = Math.abs(t - stagRootTime(4.5)) < 0.15 ? 0.1 : 0;
      return null;
    });
    assert.equal(s.hurts.length, 0, 'dodged through, nothing');
    void m;
  }
});

test('7. its bellow: what answers from the fog, never more than so many', () => {
  const { g, m } = room(5, 'stag:bellow');
  const came = new Map<Monster, number>();
  const s = watch(g, m, 2.7, undefined, undefined, () => {
    for (const o of g.monsters) if (o !== m && o.a1?.stagCalled && !came.has(o)) came.set(o, Math.hypot(o.x - g.hero.x, o.y - g.hero.y));
  });
  const kind = answers();
  const called = g.monsters.filter((o) => o !== m && !o.dead && o.a1?.stagCalled);
  assert.equal(called.length, STAG.bellow.n, `${called.length} answer`);
  for (const o of called) {
    assert.equal(o.kind, kind, `the ${kind}`);
    assert.equal(o.xp, 0, 'worth nothing: its calling');
    assert.ok(o.state !== 'sleep', 'awake, coming');
    const d = came.get(o)!;
    assert.ok(d >= STAG.bellow.near - 0.2 && d <= STAG.bellow.far + 0.2, `out of the wood well off (${d.toFixed(1)} tiles)`);
  }
  void s;
  for (let k = 0; k < 3; k++) {
    keep(m, 'stag:bellow');
    // (the hero kept out of their reach: they are only counted)
    if (RULES!.can!(g.bosses, m, act('stag:bellow'), 5, true)) watch(g, m, 2.7);
  }
  assert.ok(g.monsters.filter((o) => !o.dead && o.a1?.stagCalled).length <= STAG.bellow.most, 'never more than so many');
  assert.equal(RULES!.can!(g.bosses, m, act('stag:bellow'), 5, true), g.monsters.filter((o) => !o.dead && o.a1?.stagCalled).length < STAG.bellow.most);
});

test('8. killed in the middle of anything, nothing of it is left harming the hero; a long fight throws nothing', () => {
  for (const [id, far] of [['stag:gore', 1.6], ['stag:charge', 4], ['stag:roots', 3], ['stag:bellow', 5]] as const) {
    for (const when of [0.4, 1.2, 1.9]) {
      const { g, m } = room(far, id);
      watch(g, m, 6, undefined, () => m.state === 'act' && m.act !== undefined && m.act.t >= when);
      g.kill(m);
      for (const o of g.monsters) if (o !== m) g.kill(o);
      const s = watch(g, m, 6);
      assert.equal(g.perils.filter((p) => p.kind === 'act1').length, 0, `${id}, killed ${when} s in: nothing of it left on the floor`);
      assert.equal(s.hurts.filter((x) => x.t > 3).length, 0, `${id}, killed ${when} s in: nothing of it harms the hero after`);
    }
  }
  const { g, m } = room(4);
  const used = new Set<string>();
  const cx = m.x + 4;
  const cy = m.y;
  watch(g, m, 120, (t) => {
    if (m.act) used.add(m.act.id);
    if (t < 0) return null;
    const a = t * 0.3;
    const r = 1.5 + 4 * (0.5 + 0.5 * Math.sin(t * 0.17));
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.8 };
  });
  for (const a of STAG_ACTS) assert.ok(used.has(a.id), `it made its ${a.id}`);
});

test("9. what it draws is the enemy's colours, never cyan; its size as the game goes by it, against its picture", () => {
  const colours = new Set<string>();
  const ctx = new Proxy({} as Record<string, unknown>, {
    get: (o, k) => (k in o ? o[k as string] : () => undefined),
    set: (o, k, v) => {
      if (k === 'fillStyle' || k === 'strokeStyle') colours.add(String(v));
      o[k as string] = v;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
  const stood: number[] = [];
  const { g, m } = room(4);
  const h0 = { x: g.hero.x, y: g.hero.y };
  const c: Act1FxCtx = { g: ctx, at: (x, y) => [(x - y) * 16, (x + y) * 8], game: g, t: 0, bestiary: makeBestiary(), stand: (d) => void stood.push(d), spot: () => undefined };
  for (const id of ['stag:charge', 'stag:roots'] as const) {
    keep(m, id);
    const until = g.time + 3;
    while (g.time < until) {
      g.hero.x = h0.x;
      g.hero.y = h0.y + (id === 'stag:charge' && m.act && m.act.t > 0.5 ? 2 : 0);
      g.update(1 / 60, emptyControls());
      g.hero.life = g.hero.d.maxLife;
      if (Math.round(g.time * 60) % 5 === 0) {
        FX!.ground!(c, m, null);
        for (const p of g.perils) if (p.kind === 'act1') FX!.standing!({ ...c, g: null }, null, p);
      }
    }
  }
  assert.ok(colours.size > 0, 'its lane is drawn');
  assert.ok(stood.length > 0, 'its roots stand among the figures');
  for (const col of colours) {
    const v = col.replace('#', '');
    const r = parseInt(v.slice(0, 2), 16);
    const gg = parseInt(v.slice(2, 4), 16);
    const b = parseInt(v.slice(4, 6), 16);
    assert.ok(!(b > r + 30 && gg > r + 30), `nothing cyan: ${col}`);
  }
  const size = FIGURE_SIZE.stag;
  assert.deepEqual(size, FIG!.size, 'the game holds the size its pictures give');
  const sp = makeStagArt().front.idle[0];
  const p = paintingOf(sp);
  const ax = Math.round(sp.ax * GRAIN);
  const ay = Math.round(sp.ay * GRAIN);
  let top = 0;
  for (let y = 0; y < p.h && top === 0; y++) for (let x = ax - 3; x <= ax + 3; x++) if (p.has(x, y)) top = (ay - y) / GRAIN;
  assert.ok(Math.abs(size.top - top) <= 4, `its top ${size.top}; its picture's ${top}`);
  const reach = Math.max(sp.ax, sp.w - sp.ax);
  assert.ok(size.half <= reach + 1 && size.half >= reach * 0.4, `${size.half} to either side; its picture reaches ${reach}`);
});
