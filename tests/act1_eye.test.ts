// ACT 1, THE DESCENT: THE DROWNED EYE, FLOOR 10'S BOSS AND THE ACT'S, IN THE GAME (game/act1_rules/eye.ts, his rules;
// art/act1_figs/eye.ts, his pictures; render/act1_fx/eye.ts, what he draws). That he is built and is floor 10's boss;
// that his rules' numbers are his pictures' own; that his pictures are held as his acts name them; that he waits in the
// middle of his pool with the cult's obelisks round his ring, never moving or turning, each move of his figure begun as
// his round comes to its start; that each of his blows lands when and where its picture puts it, and misses whoever is
// not there; his phases by his life, his eggs hatching his eyespawn (never too many); nothing cyan in what he draws; and
// a long fight, through all his phases to his death, with nothing thrown.

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { act1Fig } from '../src/art/act1_figs/index';
import { EYE_COST, makeEyeArt } from '../src/art/act1_figs/eye';
import { FIGURE_SIZE, HEAVY_FIGURES } from '../src/art/bestiary';
import {
  EYE_BOLT as A_BOLT, EYE_BURST as A_BURST, EYE_CALL as A_CALL, EYE_DEATH as A_DEATH, EYE_EMPOWER as A_EMPOWER, EYE_LURK as A_LURK, EYE_OBELISKS as A_OBELISKS, EYE_ON,
  EYE_POOL, EYE_RING, EYE_SPAWN as A_SPAWN, EYE_SPEW as A_SPEW, EYE_SPLASH as A_SPLASH, EYE_STAND as A_STAND, EYE_SURFACE as A_SURFACE, EYE_SWEEP as A_SWEEP,
  eyeFrame, eyeLong, obeliskTop, poseOf, spawnLanding, waveAt as artWaveAt,
} from '../src/art/drowned_eye';
import { FLAME } from '../src/art/mkit';
import { GRAIN } from '../src/art/kit';
import { TILE3 } from '../src/art/new_mobs3';
import { act1Rules } from '../src/game/act1_rules/index';
import {
  BURSTS, CALL, EYE_ACTS, EYE_ARENA, EYE_BOLT, EYE_BURST, EYE_CALL, EYE_EGG, EYE_EMPOWER, EYE_MOVES, EYE_OBELISKS, EYE_SPEW, EYE_SPLASH, EYE_STAND,
  EYE_BARS, EYE_SURFACE, EYE_SWEEP, EYE_TILE, PHASES, RULES, SPAWN, aimOf, eggLanding, eyeClip, eyeClock, eyePhase, figureAct, moveOf, obeliskAt, onAim, rimOn, ringOn, sweepAngle, waveAt,
} from '../src/game/act1_rules/eye';
import { bossKind } from '../src/game/bosses';
import { MONSTERS, PACK_BY_SIZE, TUNE, sizeOf } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { ActId, GameEvent, Monster } from '../src/game/state';
import { act1Fx } from '../src/render/act1_fx/index';
import type { Act1FxCtx } from '../src/render/act1_fx/types';
import { paintWithoutCanvas, paintingOf, seasoned, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);
const D = Math.PI / 180;

interface Hooks {
  wakeUp(m: Monster): void;
}

/** Floor 10 of a character who has been down before, its boss ready to fight (his wait over), alone on it, not to be killed, his words off. */
function arena(seed: number): { g: Game; m: Monster } {
  const g = seasoned(new Game('warrior', seed), 1);
  g.depth = 10;
  g.cleared = 10;
  g.enterDungeon();
  const m = g.boss!;
  g.monsters.splice(0, g.monsters.length, m);
  g.bossReady();
  (g as unknown as Hooks).wakeUp(m);
  m.words = [];
  m.shield = 0;
  m.life = m.maxLife = 1e9;
  m.cd = 0;
  g.events.length = 0;
  return { g, m };
}
/** The hero stood on the ring `r` tiles from his middle, as near the line `aim` as there is floor (and returns where). */
function stand(g: Game, m: Monster, aim: number, r: number): { x: number; y: number; aim: number } {
  for (let k = 0; k < 90; k++) {
    for (const s of [1, -1]) {
      const a = aim + s * k * 2;
      const p = onAim(a, r);
      const x = m.x + p.x;
      const y = m.y + p.y;
      if (g.free(g.level.walk, x, y, TUNE.heroRadius + 0.05)) {
        g.hero.x = x;
        g.hero.y = y;
        return { x, y, aim: a };
      }
    }
  }
  throw new Error(`no floor ${r} tiles off near ${aim}`);
}
/** Only this act of his is ready (every other kept cooling), now. */
function keep(m: Monster, only: ActId): void {
  m.moveCd = EYE_ACTS.map((a) => (a.id === only ? 0 : 1e9));
  m.cd = 0;
}
interface Seen {
  hurts: { t: number; n: number }[];
  began: number;
  events: GameEvent[];
}
/** Steps the game on for `secs`, the hero's life put back each step (he stands, or goes where `move` says). */
function watch(g: Game, m: Monster, secs: number, move?: (t: number) => { mx: number; my: number } | null, each?: () => void): Seen {
  const c = emptyControls();
  const h = g.hero;
  const seen: Seen = { hurts: [], began: -1, events: [] };
  for (let k = 0; k < Math.round(secs * 60); k++) {
    const mv = move ? move(k / 60) : null;
    c.mx = mv ? mv.mx : 0;
    c.my = mv ? mv.my : 0;
    const before = h.life;
    g.update(1 / 60, c);
    if (h.life < before) seen.hurts.push({ t: (k + 1) / 60, n: before - h.life });
    h.life = h.d.maxLife;
    h.burnT = 0;
    h.shockT = 0;
    h.chillT = 0;
    if (seen.began < 0 && m.state === 'act') seen.began = (k + 1) / 60;
    seen.events.push(...g.events);
    g.events.length = 0;
    if (each) each();
  }
  return seen;
}
const since = (s: Seen, i = 0): number => (s.hurts.length > i ? s.hurts[i].t - s.began : -1);

test('1. he is built, and is floor 10\'s boss: his rules, his pictures (heavy, his switch), what he draws; a boss alone', () => {
  assert.ok(act1Rules('eye') === RULES, 'his rules');
  const fig = act1Fig('eye');
  assert.ok(fig && fig.heavy, 'his pictures, heavy (made for his floor, let go of after)');
  assert.ok(fig!.switches!.includes(EYE_ON), "the art chat's switch for him goes on with the descent");
  assert.ok(HEAVY_FIGURES.includes('eye'), 'painted by the painter, beside the game');
  assert.ok(act1Fx('eye'), 'what he draws');
  assert.equal(bossKind(10), 'eye', "floor 10's boss");
  assert.equal(sizeOf('eye'), 'boss');
  assert.deepEqual(PACK_BY_SIZE[sizeOf('eye')], [1, 1], 'alone');
  assert.equal(MONSTERS.eye.speed, 0, 'he never walks');
  assert.ok(MONSTERS.eye.radius > 2 && MONSTERS.eye.radius < 4, 'his body reaches out over his pool\'s rim (a blade or a shot from the ring strikes him)');
  const ids = EYE_ACTS.map((a) => a.id);
  assert.ok(EYE_ACTS.filter((a) => !a.forced).length >= 4, `a boss of four moves at least (${ids.join(', ')})`);
  assert.equal(EYE_ACTS[0].cooldown, 0, 'his first, a basic blow, with no cooldown');
  for (const a of EYE_ACTS) assert.ok(a.id.startsWith('eye:'), `${a.id}: his own`);
  // (his life, floor 10's: a fifth floor's boss's, doubled; well more than twice the Hollow Stag's on floor 9)
  const life = MONSTERS.eye.life * (1 + 0.4 * 9) * 2;
  assert.ok(life > 2.5 * MONSTERS.stag.life * (1 + 0.4 * 8), `a long fight (${life})`);
});

test("2. his rules' numbers are his pictures' own", () => {
  near(EYE_TILE, TILE3, 1e-9, 'a tile in his lengths');
  near(EYE_ARENA.pool.rx, EYE_POOL.rx / TILE3, 1e-9, 'his pool, across');
  near(EYE_ARENA.pool.ry, EYE_POOL.ry / TILE3, 1e-9, 'his pool, along');
  near(EYE_ARENA.ring.rx, EYE_RING.rx / TILE3, 1e-9, 'his ring, across');
  near(EYE_ARENA.ring.ry, EYE_RING.ry / TILE3, 1e-9, 'his ring, along');
  assert.deepEqual([EYE_STAND.period, EYE_STAND.frames, EYE_STAND.fps], [A_STAND.period, A_STAND.frames, A_STAND.fps], 'his stand');
  assert.deepEqual([A_LURK.period, A_LURK.frames, A_LURK.fps], [A_STAND.period, A_STAND.frames, A_STAND.fps], 'his lurk, the same round');
  for (const [k, M] of Object.entries(EYE_MOVES)) assert.ok(M.fps === A_STAND.fps || M.fps === 10, `${k}: held at his stand's own rate, or 10`);
  assert.equal(EYE_MOVES.stand.fps, A_STAND.fps, 'his stand at its own rate');
  assert.deepEqual([...EYE_OBELISKS.at], [...A_OBELISKS], 'the obelisks round his ring');
  for (let i = 0; i < 3; i++) {
    const top = obeliskTop(i);
    const o = obeliskAt(i);
    near(o.x, top[0] / TILE3, 1e-6, `obelisk ${i}, its foot under its top (x)`);
    near(o.y, -top[1] / TILE3, 1e-6, `obelisk ${i} (y)`);
  }
  assert.deepEqual([EYE_SWEEP.long, EYE_SWEEP.cock, ...EYE_SWEEP.sweep, EYE_SWEEP.over, EYE_SWEEP.arc, EYE_SWEEP.reach], [A_SWEEP.long, A_SWEEP.cock, ...A_SWEEP.sweep, A_SWEEP.over, A_SWEEP.arc, A_SWEEP.reach], 'his sweep');
  // (where its arm is, moment by moment, as his picture has it)
  for (const aim of EYE_MOVES.sweepUnder.aims) {
    for (let t = 0.02; t < A_SWEEP.back[1] - 0.02; t += 0.07) {
      const arms = poseOf('sweepUnder', t, aim).arms;
      // (while it is out of the water: it is the one more than his lurk's)
      if (arms.length === poseOf('lurk', t).arms.length) continue;
      near(arms[arms.length - 1].a, sweepAngle(t, aim), 1e-6, `the sweep's arm at ${t.toFixed(2)} s, aimed ${aim}`);
    }
  }
  assert.deepEqual([EYE_SPLASH.long, ...EYE_SPLASH.hang, EYE_SPLASH.crash, ...EYE_SPLASH.wave], [A_SPLASH.long, ...A_SPLASH.hang, A_SPLASH.crash, ...A_SPLASH.wave], 'his splash');
  for (let t = 1.5; t < 3; t += 0.05) assert.equal(waveAt(t), artWaveAt(t), `its wave at ${t.toFixed(2)} s`);
  assert.deepEqual([EYE_SPEW.long, EYE_SPEW.retch, ...EYE_SPEW.eggs, EYE_SPEW.fly], [A_SPEW.long, A_SPEW.retch, ...A_SPEW.eggs, A_SPEW.fly], 'his spew');
  for (const aim of [0, 120, -120, 37]) {
    for (let i = 0; i < 3; i++) {
      const art = spawnLanding(aim, i);
      const o = eggLanding(aim, i);
      near(o.x, art[0] / TILE3, 1e-6, `egg ${i} aimed ${aim} lands (x)`);
      near(o.y, -art[1] / TILE3, 1e-6, `egg ${i} aimed ${aim} lands (y)`);
    }
  }
  assert.deepEqual([EYE_EGG.long, EYE_EGG.hatch], [A_SPAWN.long, A_SPAWN.hatch], 'his eggs');
  assert.deepEqual([EYE_BURST.long, EYE_BURST.burst], [A_BURST.long, A_BURST.burst], 'his arms bursting up');
  assert.ok(BURSTS.reach <= A_BURST.reach, 'a burst harms no wider than its cracks run');
  assert.deepEqual([EYE_BOLT.long, EYE_BOLT.strike, EYE_BOLT.reach], [A_BOLT.long, A_BOLT.strike, A_BOLT.reach], "the siege's bolts");
  assert.deepEqual([EYE_CALL.long, EYE_CALL.raise], [A_CALL.long, A_CALL.raise], 'his call');
  assert.ok(CALL.from + CALL.apart * (CALL.n - 1) < A_CALL.hold[1], 'the bolts all fall while he holds his call');
  assert.deepEqual([EYE_SURFACE.long, EYE_SURFACE.boil, EYE_SURFACE.roar], [A_SURFACE.long, A_SURFACE.boil, A_SURFACE.roar[0]], 'his surfacing');
  assert.deepEqual([EYE_EMPOWER.long, EYE_EMPOWER.reach, EYE_EMPOWER.burst], [A_EMPOWER.long, A_EMPOWER.reach[0], A_EMPOWER.burst], 'the siege pulled in');
  for (const [k, M] of Object.entries(EYE_MOVES)) assert.equal(M.long, eyeLong(M.which), `${k}: as long as his picture's`);
  assert.equal(EYE_MOVES.death.long, A_DEATH.long, 'his death');
  // (his acts as long as the moves that show them)
  for (const a of EYE_ACTS) {
    const mv = moveOf(a);
    if (figureAct(a) && mv) assert.equal(a.long, EYE_MOVES[mv].long, `${a.id}: its act as long as its picture`);
  }
  // (the aims: wherever the hero stands, within the sweep's arc of one of them, with room)
  for (let aim = -180; aim < 180; aim += 5) {
    const best = Math.min(...EYE_MOVES.sweepUnder.aims.map((a) => Math.abs(((aim - a + 540) % 360) - 180)));
    assert.ok(best <= EYE_SWEEP.arc / 2 - 20, `a hero ${aim} degrees round is in the sweep's way (${best})`);
  }
});

test('3. his pictures, as the game holds them: every clip his acts name, each frame the art\'s own, his size', () => {
  const art = makeEyeArt();
  const set = art.front;
  assert.ok(art.back === art.front, 'he never turns his back: from in front both ways round');
  const moves = set.clips!.moves!;
  assert.equal(set.idle.length, A_STAND.frames, 'his stand');
  assert.ok(set.walk === set.idle, 'he never walks');
  for (const k of ['lurk', 'stand3', 'burst', 'bolt', 'egg']) assert.ok(moves[k], `${k}: held`);
  assert.ok(set.clips!.die, 'his death');
  // (each act's clip, by its name, in each phase it is his)
  for (const a of EYE_ACTS) {
    if (!figureAct(a)) {
      assert.ok(moves[a.clip], `${a.id}: ${a.clip}`);
      continue;
    }
    {
      const mv = moveOf(a);
      assert.ok(mv, `${a.id}: a move of his`);
      for (const aim of EYE_MOVES[mv!].aims) {
        const c = moves[eyeClip(mv!, aim)];
        assert.ok(c, `${a.id}: ${eyeClip(mv!, aim)}`);
        assert.equal(c.frames.length, Math.ceil(EYE_MOVES[mv!].long * EYE_MOVES[mv!].fps - 1e-6), `${eyeClip(mv!, aim)}: as long as his picture's`);
        assert.equal(c.fps, EYE_MOVES[mv!].fps);
      }
    }
  }
  // (each frame his picture's own, as painted: a few of them)
  const same = (a: ReturnType<typeof eyeFrame>, b: ReturnType<typeof eyeFrame>, what: string): void => assert.equal(unlike(a, b), 0, what);
  same(set.idle[7], eyeFrame('stand', 7 / 15, 'front'), 'his stand');
  same(moves['sweepUnder@120'].frames[17], eyeFrame('sweepUnder', 17 / 15, 'front', 120), 'his sweep, aimed');
  same(moves.stand3.frames[3], eyeFrame('stand', 3 / 15, 'front', 0, 0, 1), 'his stand, blazing');
  same(set.clips!.die!.frames[20], eyeFrame('death', 20 / 10, 'front', 0, 0, 1), 'his death, blazing');
  // HIS SIZE, as the game goes by it (tests/first5_bosses.test.ts measures every boss so)
  const size = FIGURE_SIZE.eye;
  const s = set.idle[0];
  const p = paintingOf(s);
  const ax = Math.round(s.ax * GRAIN);
  const ay = Math.round(s.ay * GRAIN);
  let head = 0;
  for (let y = 0; y < p.h && head === 0; y++) for (let x = ax - 3; x <= ax + 3; x++) if (p.has(x, y)) head = (ay - y) / GRAIN;
  assert.ok(Math.abs(size.top - head) <= 4, `his head: the game takes it to be ${size.top} up; in his picture it is ${head}`);
  const reach = Math.max(s.ax, s.w - s.ax);
  assert.ok(size.half <= reach + 1 && size.half >= reach * 0.4, `${size.half} to either side; his picture reaches ${reach}`);
  let run = 0;
  for (let x = ax; x < p.w && p.has(x, ay - 20 * GRAIN); x++) run++;
  assert.ok(Math.abs(run / GRAIN - size.half) <= 10, `half his bulk's width (${run / GRAIN})`);
  assert.ok(EYE_COST.frames > 0 && EYE_COST.mb > 0, 'what he costs to paint and hold is written down');
});

test('4. he waits in the middle of his pool, which no one walks in; the cult\'s obelisks stand round his ring, solid', () => {
  for (const seed of [3, 17, 41]) {
    const g = seasoned(new Game('warrior', seed), 1);
    g.depth = 10;
    g.cleared = 10;
    g.enterDungeon();
    const L = g.level;
    const m = g.boss!;
    assert.equal(m.kind, 'eye', `seed ${seed}: the Drowned Eye`);
    const P = L.land!.pool!;
    near(m.x, P.x, 1e-9, 'at his pool\'s middle (x)');
    near(m.y, P.y, 1e-9, 'at his pool\'s middle (y)');
    near(m.fx, Math.SQRT1_2, 1e-9, 'facing the camera');
    near(m.fy, Math.SQRT1_2, 1e-9, 'facing the camera');
    assert.equal(L.walk[Math.floor(m.y) * L.floor.w + Math.floor(m.x)], 0, 'his pool is not walked in');
    const obs = L.props.filter((q) => q.kind === 'piece' && q.name === "the cult's obelisk");
    assert.equal(obs.length, 3, `seed ${seed}: three obelisks`);
    obs.forEach((q, i) => {
      const o = obeliskAt(i);
      near(q.x, m.x + o.x, 1e-6, `obelisk ${i} where his pictures have it`);
      near(q.y, m.y + o.y, 1e-6, `obelisk ${i} where his pictures have it`);
      assert.ok(q.solid && L.walk[q.ty * L.floor.w + q.tx] === 0, `obelisk ${i}: solid`);
      const a = aimOf(q.x - m.x, q.y - m.y);
      near(Math.hypot(q.x - m.x, q.y - m.y), ringOn(a) + EYE_OBELISKS.out, 1e-6, `obelisk ${i}: just beyond the ring's edge`);
    });
    // (a blade swung from the ring's inner stones reaches him)
    let nearest = Infinity;
    for (let a = -180; a < 180; a += 3) {
      for (let r = 2; r < 5; r += 0.1) {
        const p = onAim(a, r);
        if (g.free(L.walk, m.x + p.x, m.y + p.y, TUNE.heroRadius)) {
          nearest = Math.min(nearest, r);
          break;
        }
      }
    }
    assert.ok(nearest - m.r < 1.1, `the hero comes within a blade's reach of him (${nearest.toFixed(2)} from his middle)`);
    assert.ok(TUNE.heroRadius + m.r * 0.8 < nearest + 0.6, 'and is not pushed far off the ring\'s inner stones by his body');
    // (an arrow shot at him from the ring, stepped as the game steps it, comes within his reach before the rim's stones stop it)
    for (let a = 0; a < 360; a += 3) {
      const ux = Math.cos(a * D);
      const uy = Math.sin(a * D);
      let x = m.x + ux * 6;
      let y = m.y + uy * 6;
      if (!g.isOpen(x, y)) continue;
      let closest = 6;
      for (let k = 0; k < 40 && g.isOpen(x - ux * 0.25, y - uy * 0.25); k++) {
        x -= ux * 0.25;
        y -= uy * 0.25;
        closest = Math.min(closest, Math.hypot(x - m.x, y - m.y));
      }
      assert.ok(closest <= m.r + 0.25, `seed ${seed}: a shot from ${a} degrees round reaches him (it comes within ${closest.toFixed(2)})`);
    }
  }
});

test('5. he never moves and never turns; a move of his figure begins as his round comes to its start', () => {
  const { g, m } = arena(5);
  stand(g, m, 20, 4);
  const x0 = m.x;
  const y0 = m.y;
  let starts = 0;
  let prev = eyeClock(m);
  let lastN = -1;
  const acts: string[] = [];
  // (the hero goes round him on the ring, about 4 tiles out: he runs round, kept to that circle)
  const round = (): { mx: number; my: number } => {
    const dx = g.hero.x - m.x;
    const dy = g.hero.y - m.y;
    const r = Math.hypot(dx, dy) || 1;
    const k = (4 - r) * 0.8;
    return { mx: -dy / r + (dx / r) * k, my: dx / r + (dy / r) * k };
  };
  watch(g, m, 30, round, () => {
    assert.ok(m.x === x0 && m.y === y0, 'he stays in the middle of his pool');
    assert.ok(Math.abs(m.fx - Math.SQRT1_2) < 1e-9 && Math.abs(m.fy - Math.SQRT1_2) < 1e-9, 'facing the camera');
    if (m.act && m.act.n !== lastN) {
      lastN = m.act.n;
      acts.push(m.act.id);
      const a = EYE_ACTS.find((q) => q.id === m.act!.id)!;
      if (figureAct(a)) {
        starts++;
        assert.ok(prev > EYE_STAND.period - 0.05, `${a.id} begins as his round comes to its start (it was at ${prev.toFixed(3)})`);
      }
    }
    prev = eyeClock(m);
  });
  assert.ok(starts >= 2, `moves of his figure made (${acts.join(', ')})`);
  assert.ok(acts.includes('eye:burst') && acts.includes('eye:bursts') && acts.includes('eye:sweep'), `under the water: his bursts and his sweep (${acts.join(', ')})`);
});

test('6. his arms burst up where the hero stood, when their cracks have glowed, and miss him who has stepped away', () => {
  {
    const { g, m } = arena(7);
    stand(g, m, 0, 4.2);
    keep(m, 'eye:burst');
    const s = watch(g, m, 2);
    assert.equal(s.hurts.length, 1, 'struck once');
    near(since(s), EYE_BURST.burst, 2.5 / 60, 'as the arm bursts up');
    const [lo, hi] = [m.dmgMin * 0.75 * 0.3, m.dmgMax * 0.75 * 1.01];
    assert.ok(s.hurts[0].n >= lo && s.hurts[0].n <= hi, `a blow of his (${s.hurts[0].n})`);
  }
  {
    const { g, m } = arena(7);
    stand(g, m, 0, 4.2);
    keep(m, 'eye:burst');
    // (walked off along the ring as the cracks glow)
    const s = watch(g, m, 2, (t) => (t < 0.7 ? { mx: 1, my: -1 } : null));
    assert.equal(s.hurts.length, 0, 'stepped away in time, the arm misses');
  }
  {
    // THE BURSTS: several round him, the first under him
    const { g, m } = arena(9);
    stand(g, m, 60, 4.5);
    keep(m, 'eye:bursts');
    const s = watch(g, m, 2.5);
    const bursts = g.perils.filter((p) => p.a1 === 'eye:burst');
    assert.ok(s.hurts.length >= 1, 'the one under him strikes him');
    near(since(s), EYE_BURST.burst, 2.5 / 60, 'as it bursts');
    void bursts;
  }
  {
    const { g, m } = arena(9);
    stand(g, m, 60, 4.5);
    keep(m, 'eye:bursts');
    let most = 0;
    watch(g, m, 1.0, null as never, () => (most = Math.max(most, g.perils.filter((p) => p.a1 === 'eye:burst').length)));
    assert.equal(most, BURSTS.n[0], `${BURSTS.n[0]} at once under the water`);
  }
});

test('7. his sweep strikes whoever is within its reach as it comes round, and no one beyond it, nor one who rolls over it', () => {
  {
    const { g, m } = arena(11);
    const at = stand(g, m, 30, 4.6);
    keep(m, 'eye:sweep');
    const s = watch(g, m, 6);
    assert.equal(s.hurts.length, 1, 'struck once');
    const t = since(s);
    assert.ok(t >= EYE_SWEEP.hurt && t <= EYE_SWEEP.over + 0.03, `as it comes round low (${t.toFixed(2)})`);
    // (as his arm passes where he stood)
    const aim = m.act ? m.act.a : EYE_MOVES.sweepUnder.aims.reduce((b, a) => (Math.abs(((at.aim - a + 540) % 360) - 180) < Math.abs(((at.aim - b + 540) % 360) - 180) ? a : b));
    const arm = sweepAngle(t, aim);
    const off = Math.abs(((arm - at.aim + 540) % 360) - 180);
    assert.ok(off < 14, `his arm where he stood (${arm.toFixed(0)} against ${at.aim.toFixed(0)})`);
  }
  {
    const { g, m } = arena(11);
    const at = stand(g, m, 30, 6.75);
    keep(m, 'eye:sweep');
    const s = watch(g, m, 6);
    assert.ok(Math.hypot(at.x - m.x, at.y - m.y) > EYE_SWEEP.reach + TUNE.heroRadius, 'beyond its reach');
    assert.equal(s.hurts.length, 0, 'beyond its reach, it misses');
  }
});

test('8. his splash: the wave strikes him as it rolls over where he stands; his spew\'s eggs land where his picture throws them and hatch his eyespawn', () => {
  {
    const { g, m } = arena(13);
    m.a1!.ph = 1;
    const at = stand(g, m, -40, 4.5);
    keep(m, 'eye:splash');
    const s = watch(g, m, 7);
    assert.equal(s.hurts.length, 1, 'struck once');
    const b = aimOf(at.x - m.x, at.y - m.y);
    const u = (Math.hypot(at.x - m.x, at.y - m.y) - rimOn(b)) / (ringOn(b) - rimOn(b));
    const when = EYE_SPLASH.wave[0] + (EYE_SPLASH.wave[1] - EYE_SPLASH.wave[0]) * (1 - Math.pow(1 - u, 1 / 1.6));
    near(since(s), when, 0.05, 'as the wave reaches him');
  }
  {
    const { g, m } = arena(13);
    m.a1!.ph = 1;
    stand(g, m, -40, 4.5);
    keep(m, 'eye:splash');
    // (he rolls through the wave as it comes)
    const s = watch(g, m, 7, null as never, () => {
      const t = m.act ? m.act.t : 0;
      if (m.act && m.act.id === 'eye:splash' && t > 1.6 && t < 2.6 && !g.hero.move) g.hero.move = { kind: 'roll', t: 0, dur: 0.4, x0: g.hero.x, y0: g.hero.y, x1: g.hero.x, y1: g.hero.y };
    });
    assert.equal(s.hurts.length, 0, 'rolled through it, untouched');
  }
  {
    const { g, m } = arena(15);
    m.a1!.ph = 1;
    const at = stand(g, m, 100, 4.2);
    keep(m, 'eye:spew');
    let laid: { x: number; y: number }[] = [];
    // (each eyespawn hatches by its own rules, game/act1_rules/spawn.ts: its hatching its first act)
    const hatching = new Set<number>();
    const s = watch(g, m, 7.5, null as never, () => {
      for (const p of g.perils) if (p.a1 === 'eye:egg' && p.t <= 1 / 60 + 1e-9) laid.push({ x: p.x, y: p.y });
      for (const o of g.monsters) if (o.kind === 'spawn' && o.act && o.act.id === 'spawn:hatch') hatching.add(o.id);
    });
    void s;
    assert.equal(laid.length, 3, 'three eggs land');
    const aim = EYE_MOVES.spew.aims.reduce((b, a) => (Math.abs(((at.aim - a + 540) % 360) - 180) < Math.abs(((at.aim - b + 540) % 360) - 180) ? a : b));
    laid.forEach((e, i) => {
      const o = eggLanding(aim, i);
      assert.ok(Math.hypot(e.x - (m.x + o.x), e.y - (m.y + o.y)) < 1.5, `egg ${i} where his picture throws it`);
    });
    const brood = g.monsters.filter((o) => !o.dead && o.kind === 'spawn');
    assert.equal(brood.length, 3, 'each hatches an eyespawn');
    for (const o of brood) {
      assert.equal(o.packId, m.packId, 'his');
      assert.ok(hatching.has(o.id), 'it hatched (the Eyespawn\'s own rules took it from there: its hatching its first act)');
    }
    laid = [];
    // (never more than SPAWN.most of them: no spew while they live)
    assert.equal(RULES.can!(g.bosses, m, EYE_ACTS.find((a) => a.id === 'eye:spew')!, 4, true), false, 'no more while his brood lives');
    assert.ok(brood.length <= SPAWN.most);
  }
});

test("9. his call: the siege's bolts rain on the ring, one where he stands; his phases change by his life", () => {
  {
    const { g, m } = arena(19);
    m.a1!.ph = 2;
    stand(g, m, 150, 5);
    keep(m, 'eye:call');
    let most = 0;
    const s = watch(g, m, 6, null as never, () => (most = Math.max(most, g.perils.filter((p) => p.a1 === 'eye:bolt').length)));
    assert.ok(most >= CALL.n - 1, `the bolts rain down (${most})`);
    assert.ok(s.hurts.length >= 1, 'the one on him strikes him');
    near(since(s), CALL.from + EYE_BOLT.strike, 2.5 / 60, 'as it strikes');
  }
  {
    const { g, m } = arena(21);
    // (EYE_BARS: his first bar emptied; until then, PHASES' shares)
    m.life = EYE_BARS.on ? 1 : m.maxLife * (PHASES.at[0] - 0.02);
    stand(g, m, 0, 5);
    const seen: string[] = [];
    watch(g, m, 12, null as never, () => {
      if (m.act && !seen.includes(m.act.id)) seen.push(m.act.id);
    });
    assert.ok(seen.includes('eye:surface'), `hurt enough, he surfaces (${seen.join(', ')})`);
    assert.equal(eyePhase(m), 1, 'risen');
    if (EYE_BARS.on) assert.equal(m.life, m.maxLife, 'his bar full again');
    m.life = EYE_BARS.on ? 1 : m.maxLife * (PHASES.at[1] - 0.02);
    watch(g, m, 12, null as never, () => {
      if (m.act && !seen.includes(m.act.id)) seen.push(m.act.id);
    });
    assert.ok(seen.includes('eye:empower'), `hurt more, he pulls the siege in (${seen.join(', ')})`);
    assert.equal(eyePhase(m), 2, 'blazing');
    if (EYE_BARS.on) assert.equal(m.life, m.maxLife, 'his bar full again');
  }
});

test('10. nothing cyan in what he draws: the warning of his sweep is the enemy\'s fire', () => {
  const fills: string[] = [];
  const ctx = { globalAlpha: 1, set fillStyle(v: string) { fills.push(v); }, get fillStyle() { return ''; }, fillRect() {} } as unknown as CanvasRenderingContext2D;
  const { g, m } = arena(23);
  stand(g, m, 0, 4);
  keep(m, 'eye:sweep');
  watch(g, m, 4, null as never, () => {
    for (const p of g.perils) {
      if (p.a1 !== 'eye:reach') continue;
      const c = { g: ctx, at: (x: number, y: number) => [(x - y) * 16, (x + y) * 8] as const, game: g, t: g.time, bestiary: null as never, stand: () => undefined, spot: () => undefined } as unknown as Act1FxCtx;
      act1Fx('eye')!.ground!(c, null, p);
    }
  });
  assert.ok(fills.length > 50, 'it is drawn');
  for (const f of new Set(fills)) {
    assert.ok(FLAME.includes(f), `${f}: the enemy's fire`);
    const n = parseInt(f.slice(1), 16);
    const [r, gg, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    assert.ok(!(b > r + 20 && gg > r + 20), `${f}: not cyan`);
  }
});

test('11. a long fight through all his phases to his death, nothing thrown; nothing of his left harming the hero once he is dead', () => {
  const { g, m } = arena(29);
  m.life = m.maxLife = 6000;
  const at = stand(g, m, -60, 4.5);
  const seen = new Set<string>();
  const phases = new Set<number>();
  let k = 0;
  watch(g, m, 150, null as never, () => {
    k++;
    // (the hero is not to fall: nothing strikes him in this one)
    g.hero.invuln = 1e9;
    // (the hero goes slowly round the ring, where there is floor)
    const p = onAim(at.aim + k * 0.04, 4.5);
    if (g.free(g.level.walk, m.x + p.x, m.y + p.y, TUNE.heroRadius)) {
      g.hero.x = m.x + p.x;
      g.hero.y = m.y + p.y;
    }
    // (the hero wears him down: all of his life in two minutes)
    if (k % 30 === 0 && !m.dead) m.life = Math.max(1, m.life - 6000 / 240);
    if (m.act) seen.add(m.act.id);
    phases.add(eyePhase(m));
  });
  assert.deepEqual([...phases].sort(), [0, 1, 2], 'all three of his phases');
  for (const id of ['eye:burst', 'eye:bursts', 'eye:sweep', 'eye:surface', 'eye:spew', 'eye:splash', 'eye:empower', 'eye:call'] as ActId[]) assert.ok(seen.has(id), `${id} made (${[...seen].join(', ')})`);
  assert.ok(g.monsters.filter((o) => o.kind === 'spawn' && !o.dead).length <= SPAWN.most, 'never too many of his eyespawn');
  g.kill(m);
  watch(g, m, 3);
  assert.equal(g.perils.filter((p) => p.a1 && p.a1.startsWith('eye:')).length, 0, 'nothing of his is left on the floor');
  assert.equal(g.monsters.filter((o) => o.kind === 'spawn' && !o.dead).length, 0, 'his eyespawn go with him');
});

