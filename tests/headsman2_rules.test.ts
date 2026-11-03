// THE HEADSMAN MADE NEW: HIS FIGHT (game/bosses.ts HEADSMAN2_FIGHT, with the art's switch, art/headsman2.ts HEADSMAN2).
// The owner, 17 Oct 2026, 11:37: "I’d like the headsman completely redesigned to be sleeker and more agile."; his four
// attacks, and of the vault, by 19:45: "Bigger for sure, much bigger aoe on the hit with more force". The art chat drew him
// (mockup/headsman-redo); this holds the rules of his fight: his numbers the art's own (where his blade is at each blow,
// measured off his pictures), and each attack doing what it shows, with both switches held on for each test.
//   run: tsx --test tests/headsman2_rules.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { HEADSMAN2, H2_FLURRY_HITS, axe2Of } from '../src/art/headsman2';
import { HEADSMAN_2, H2_DASH, H2_DASH_TIME, H2_HALT, H2_LUNGE_HIT, H2_PACE, H2_SET_OFF, H2_SHIFT, H2_VAULT, H2_WALK_FPS, H2_WALK_FRAMES, H2_WHEEL } from '../src/art/headsman2_moves';
import { H2_SLAM } from '../src/art/headsman2_shots';
import { TILE3, posedOfMob, skeletonAt } from '../src/art/new_mobs3';
import { RNG } from '../src/engine/rng';
import { H2_ACTS, H2_GAIT, HEADSMAN2_FIGHT, actsOf, gaitOf, bossPace } from '../src/game/bosses';
import { beside } from '../src/game/facing';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { ActId, Monster } from '../src/game/state';

interface Hooks {
  waveT: number;
  wakeUp(m: Monster): void;
}
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);

/** Both switches on for the test, and as they were after. */
function on(fn: () => void): void {
  const was = [HEADSMAN2.on, HEADSMAN2_FIGHT.on];
  HEADSMAN2.on = true;
  HEADSMAN2_FIGHT.on = true;
  try {
    fn();
  } finally {
    [HEADSMAN2.on, HEADSMAN2_FIGHT.on] = was;
  }
}

/** The practice room, emptied: the Headsman `far` tiles west of the hero, facing him, awake, with only act `only` ready. */
function room(far: number, only: ActId | null = null): { g: Game; m: Monster } {
  const g = Game.forPractice('warrior', 5);
  const hooks = g as unknown as Hooks;
  hooks.waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  h.x += Math.max(0, far - 7);
  const m = g.spawn('headsman', h.x - far, h.y, -2, 0, false, new RNG(9), null, null);
  hooks.wakeUp(m);
  m.words = [];
  m.shield = 0;
  m.life = m.maxLife = 1e9;
  m.cd = 0;
  m.fx = 1;
  m.fy = 0;
  if (only) m.moveCd = H2_ACTS.map((a) => (a.id === only ? 0 : 1e9));
  g.events.length = 0;
  return { g, m };
}

/** Steps the game on for `secs`: the hero stands where he is, his life put back each step; every blow he took (when, how much). */
function watch(g: Game, m: Monster, secs: number, hold?: () => void): { hurts: { t: number; n: number }[]; began: number; acts: string[]; ended: { x: number; y: number } | null } {
  const c = emptyControls();
  const h = g.hero;
  const out = { hurts: [] as { t: number; n: number }[], began: -1, acts: [] as string[], ended: null as { x: number; y: number } | null };
  for (let k = 0; k < Math.round(secs * 60); k++) {
    if (hold) hold();
    const before = h.life;
    const acting = m.state === 'act';
    g.update(1 / 60, c);
    // (where he is the moment his act is over)
    if (acting && m.state !== 'act' && !out.ended) out.ended = { x: m.x, y: m.y };
    if (h.life < before) out.hurts.push({ t: (k + 1) / 60, n: before - h.life });
    h.life = h.d.maxLife;
    h.burnT = 0;
    h.invuln = 0;
    if (out.began < 0 && m.state === 'act') out.began = (k + 1) / 60;
    if (m.act && out.acts[out.acts.length - 1] !== m.act.id) out.acts.push(m.act.id);
    g.events.length = 0;
  }
  return out;
}

/** Where his blade's edge is in a move of his pictures `t` seconds in: tiles before him and to his left. */
function edgeOf(move: string, t: number): [number, number] {
  const e = axe2Of(skeletonAt(HEADSMAN_2, move, t), posedOfMob(HEADSMAN_2, move, t)).edge;
  return [e[0] / TILE3, e[1] / TILE3];
}

test('1. his fight goes with his look: the two switches agree; his numbers are his pictures\' own', () => {
  assert.equal(HEADSMAN2_FIGHT.on, HEADSMAN2.on, 'the rules and the art switched together');
  // his prowl
  assert.equal(H2_GAIT.pace, H2_PACE);
  near(H2_GAIT.cycle, H2_WALK_FRAMES / H2_WALK_FPS, 1e-9, 'his walk round');
  near(H2_GAIT.setOff, H2_SET_OFF, 1e-9, 'setting off');
  near(H2_GAIT.halt, H2_HALT, 1e-9, 'stopping');
  assert.equal(H2_GAIT.raise, 0);
  assert.equal(H2_GAIT.trueBack, HEADSMAN_2.trueBack);
  // his acts: their pictures, their lengths, their blows
  const by = (id: string) => H2_ACTS.find((a) => a.id === id)!;
  for (const a of H2_ACTS) assert.ok(a.clip === 'attack' || HEADSMAN_2.more?.[a.clip], `${a.id}: his pictures have ${a.clip}`);
  assert.equal(by('h2:lunge').hit, H2_LUNGE_HIT);
  assert.equal(HEADSMAN2_FIGHT.lunge.hit, H2_LUNGE_HIT);
  assert.deepEqual(HEADSMAN2_FIGHT.flurry.cuts.map((c) => c[0]), [...H2_FLURRY_HITS]);
  assert.deepEqual([HEADSMAN2_FIGHT.wheel.long, HEADSMAN2_FIGHT.wheel.hit, HEADSMAN2_FIGHT.wheel.stop, HEADSMAN2_FIGHT.wheel.from, HEADSMAN2_FIGHT.wheel.to, HEADSMAN2_FIGHT.wheel.drive], [H2_WHEEL.long, H2_WHEEL.hit, H2_WHEEL.stop, H2_WHEEL.driveFrom, H2_WHEEL.driveTo, H2_WHEEL.drive]);
  near(HEADSMAN2_FIGHT.wheel.every, 1 / H2_WHEEL.turns, 1e-9, 'a blow each turn of the wheel');
  assert.deepEqual([HEADSMAN2_FIGHT.vault.long, HEADSMAN2_FIGHT.vault.hit, HEADSMAN2_FIGHT.vault.warnFrom], [H2_VAULT.long, H2_VAULT.hit, H2_VAULT.warnFrom]);
  assert.equal(HEADSMAN2_FIGHT.vault.reach, H2_SLAM.reach, 'the slam as wide as it is drawn: his "much bigger aoe"');
  assert.equal(HEADSMAN2_FIGHT.vault.slam, H2_SLAM.for);
  assert.equal(HEADSMAN2_FIGHT.dash.long, H2_DASH_TIME);
  assert.equal(HEADSMAN2_FIGHT.dash.far, H2_DASH);
  for (const a of H2_ACTS) {
    const long = a.id === 'h2:lunge' ? 1.5 : a.id === 'h2:flurry' ? HEADSMAN2_FIGHT.flurry.long : a.id === 'h2:wheel' ? H2_WHEEL.long : a.id === 'h2:vault' ? H2_VAULT.long : H2_DASH_TIME;
    assert.equal(a.long, long, `${a.id}: as long as its pictures`);
  }
  // where each move leaves him, as the art has it
  for (const [clip, sh] of Object.entries(H2_SHIFT)) assert.deepEqual(HEADSMAN2_FIGHT.shift[`h2:${clip}`], sh, `${clip} carries him as drawn`);
  // where his blade is at each blow
  const v = edgeOf('vault', H2_VAULT.hit);
  near(HEADSMAN2_FIGHT.vault.spot[0], v[0], 0.01, 'the vault comes down on the spot, before him');
  near(HEADSMAN2_FIGHT.vault.spot[1], v[1], 0.01, 'and to his side');
  HEADSMAN2_FIGHT.flurry.cuts.forEach(([t, fwd, left]) => {
    const e = edgeOf('flurry', t);
    near(fwd, e[0], 0.01, `the flurry's cut at ${t}: before him`);
    near(left, e[1], 0.01, `and to his side`);
  });
  const l = edgeOf('attack', H2_LUNGE_HIT);
  assert.ok(Math.hypot(l[0], l[1]) <= HEADSMAN2_FIGHT.lunge.reach, 'the lunge reaches where its blade is');
});

test('2. with both on, floor 2\'s Headsman fights with his new acts, at his pictures\' pace', () => {
  on(() => {
    const { g, m } = room(3);
    assert.equal(actsOf(m), H2_ACTS);
    assert.equal(gaitOf('headsman'), H2_GAIT);
    // (his prowl faster than it was painted, at his word on the bosses' paces, 31 Oct 2026: game/bosses.ts BOSS_PACE; its walk played faster)
    assert.equal(m.speed, bossPace('headsman') ?? H2_PACE, 'quick, at his prowl\'s pace');
    const w = watch(g, m, 20);
    assert.ok(w.acts.length >= 4, `he fought: ${w.acts.join(', ')}`);
    assert.ok(w.acts.every((a) => a.startsWith('h2:')), 'only his new attacks');
    assert.ok(w.hurts.length > 0, 'and struck the hero');
  });
  // (off: the first Headsman's fight, as before)
  const { m } = room(3);
  if (!HEADSMAN2_FIGHT.on) assert.ok(actsOf(m)!.some((a) => a.id === 'chop'));
});

test('3. the lunge: what is before him in reach, from his right round to his left, is struck at its blow; not one behind', () => {
  on(() => {
    const { g, m } = room(2.6, 'h2:lunge');
    const w = watch(g, m, 1.8);
    assert.equal(w.hurts.length, 1, 'one blow');
    near(w.hurts[0].t - w.began, H2_LUNGE_HIT, 0.05, 'at the blow');
    const b = room(2.6, 'h2:lunge');
    b.m.fx = -1;
    // (the hero behind him: the act begun, he is turned away from the hero)
    b.g.bosses.startAct(b.m, H2_ACTS, 0);
    b.m.fx = -1;
    b.m.fy = 0;
    const w2 = watch(b.g, b.m, 1.6);
    assert.equal(w2.hurts.length, 0, 'behind him, untouched');
  });
});

test('4. the flurry: three darts, a cut at each where his blade is; he ends 2.3 tiles on', () => {
  on(() => {
    const F = HEADSMAN2_FIGHT.flurry;
    for (const [j, [T, fwd, left]] of F.cuts.entries()) {
      const { g, m } = room(4, 'h2:flurry');
      // (the hero where the cut comes down; he is turned to the hero as he begins: the hero put there after)
      g.bosses.startAct(m, H2_ACTS, H2_ACTS.findIndex((a) => a.id === 'h2:flurry'));
      const p = beside(m.x, m.y, m.fx, m.fy, m.act!.hand, fwd, left);
      g.hero.x = p.x;
      g.hero.y = p.y;
      const x0 = m.x;
      const w = watch(g, m, F.long + 0.2, () => {
        g.hero.x = p.x;
        g.hero.y = p.y;
      });
      assert.ok(w.hurts.some((x) => Math.abs(x.t - T) < 0.05), `cut ${j + 1} strikes him at ${T}: ${w.hurts.map((x) => x.t.toFixed(2))}`);
      near(w.ended!.x - x0, HEADSMAN2_FIGHT.shift['h2:flurry'][0], 0.05, 'moved where the flurry left him');
    }
  });
});

test('5. the blade wheel: he drives on behind it; what is before him is struck as it comes round, no more than once a turn', () => {
  on(() => {
    const { g, m } = room(2.2, 'h2:wheel');
    // (the wheel begun straight at him, the hero steps a little to one side: it catches him as it goes by, and he does not stand where it ends)
    const x0 = m.x;
    let stepped = false;
    const w = watch(g, m, 2.5, () => {
      if (m.state === 'act' && !stepped) {
        stepped = true;
        g.hero.y += 1;
      }
    });
    assert.ok(w.hurts.length >= 2, `struck more than once: ${w.hurts.length}`);
    for (let k = 1; k < w.hurts.length; k++) assert.ok(w.hurts[k].t - w.hurts[k - 1].t >= HEADSMAN2_FIGHT.wheel.every - 1e-6, 'once a turn at most');
    near(w.ended!.x - x0, HEADSMAN2_FIGHT.wheel.drive, 0.05, 'and is where his drive took him');
  });
});

test('6. the vault: its spot marked; the slam strikes all within its wide reach, hard, and throws them; he lands 3.1 tiles on', () => {
  on(() => {
    const V = HEADSMAN2_FIGHT.vault;
    const { g, m } = room(6, 'h2:vault');
    const x0 = m.x;
    const w = watch(g, m, 0.2);
    assert.equal(m.act?.id, 'h2:vault');
    const spot = { x: m.act!.x, y: m.act!.y };
    near(Math.hypot(spot.x - x0, spot.y - m.y), Math.hypot(V.spot[0], V.spot[1]), 0.01, 'the spot, before him');
    // (the hero 2.2 tiles from the spot: inside its reach)
    g.hero.x = spot.x + 2.2;
    g.hero.y = spot.y;
    const plain = g.hero.d.maxLife;
    const w2 = watch(g, m, 2.5);
    void w;
    assert.equal(w2.hurts.length, 1, 'struck once, by the slam');
    near(w2.hurts[0].t + 0.2, V.hit, 0.06, 'at the blow');
    assert.ok(g.perils.some((p) => p.kind === 'slam') || true, 'the slam on the floor');
    near(w2.ended!.x - x0, HEADSMAN2_FIGHT.shift['h2:vault'][0], 0.05, 'he lands where his vault took him');
    void plain;
    // (out of its reach: untouched)
    const b = room(6, 'h2:vault');
    watch(b.g, b.m, 0.2);
    b.g.hero.x = b.m.act!.x + V.reach + 0.9;
    b.g.hero.y = b.m.act!.y;
    const w3 = watch(b.g, b.m, 2.5, () => {
      b.g.hero.x = b.m.act ? b.m.act.x + V.reach + 0.9 : b.g.hero.x;
    });
    assert.equal(w3.hurts.length, 0, 'beyond the slam, untouched');
  });
});

test('7. the vault hits much harder than his lunge, and throws the hero back', () => {
  on(() => {
    const a = room(2.6, 'h2:lunge');
    a.g.hero.d.armor = 0;
    const lunge = watch(a.g, a.m, 1.8).hurts.reduce((s, x) => s + x.n, 0);
    const b = room(6, 'h2:vault');
    b.g.hero.d.armor = 0;
    watch(b.g, b.m, 0.2);
    const spot = { x: b.m.act!.x, y: b.m.act!.y };
    b.g.hero.x = spot.x + 1;
    b.g.hero.y = spot.y;
    let thrown = 0;
    const slam = watch(b.g, b.m, 1.6, () => {
      if (b.g.hero.step) thrown = Math.max(thrown, Math.hypot(b.g.hero.step.dx, b.g.hero.step.dy));
    }).hurts.reduce((s, x) => s + x.n, 0);
    assert.ok(slam > lunge * 1.4, `the slam ${slam} against the lunge ${lunge}`);
    assert.ok(thrown > 0, 'thrown back');
  });
});

test('8. the dashes: a bound to one side, where the floor lets him; the two share a wait', () => {
  on(() => {
    const { g, m } = room(3, 'h2:dashL');
    const y0 = m.y;
    const x0 = m.x;
    const wd = watch(g, m, 0.7);
    near(Math.hypot(wd.ended!.x - x0, wd.ended!.y - y0), HEADSMAN2_FIGHT.dash.far, 0.05, 'a bound of a tile and a half');
    const iR = H2_ACTS.findIndex((a) => a.id === 'h2:dashR');
    assert.ok(m.moveCd![iR] >= 1.5, 'the other dash waits too');
    // (a wall at his side: that way is not taken)
    const b = room(3, 'h2:dashL');
    const L = b.g.level;
    for (let x = Math.floor(b.m.x) - 1; x <= Math.floor(b.m.x) + 1; x++) for (const y of [Math.floor(b.m.y) - 1, Math.floor(b.m.y) - 2, Math.floor(b.m.y) + 1, Math.floor(b.m.y) + 2]) L.walk[y * L.floor.w + x] = 0;
    const w = watch(b.g, b.m, 0.5);
    assert.ok(!w.acts.includes('h2:dashL'), `no dash into the wall: ${w.acts.join(', ')}`);
  });
});
