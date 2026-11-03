// FLOORS 16 TO 19'S NEW MOVES, IN THE GAME (the art chat's art/action_f16_*.ts behind GARDENER_HEDGE, GROOM_HORSE, GUARD_DRILL,
// DANCER_THROW and KNIGHT_BANNER, his picks there: the shear lunge and the javelin of 2 Nov, the horse, the partner throw and the banner
// of 31 Oct, the banner's 7 tiles of 2 Nov; brought in by the main chat, 2 Nov 2026, behind the same switches, off until his yes here).
// Each with its switch on, in a practice room:
//   1. off, the old moves; on, the new;
//   2. the gardener's shear lunge: a hero in its lane struck as the blades snap shut; one well off to the side, not; he is on where he
//      landed;
//   3. the groom's horse: a hero who stands where he was when the line was marked struck once as it gallops by; one who steps off the
//      line, not;
//   4. the palace guard's javelin: a hero where it is thrown struck as it sticks; the partisan guard then fights with his sword, marches
//      to his partisan and wrenches it out, the partisan guard again; the sword guard, his back bare after;
//   5. the dancers' partner throw: a pair throw together, she carried down the lane, a hero on it struck once; a dancer alone spins;
//   6. the king's knight's banner: planted, a shockwave; while it stands those within 7 tiles of it hit harder; the hero's blows cut it
//      down; one banner a knight.
//   run: tsx --test tests/action_f16_game.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { GARDENER_HEDGE, LUNGE, LUNGE_HIT, LUNGE_TRAVEL_TILES } from '../src/art/action_f16_gardener';
import { GROOM_HORSE, LOOSE, WHISTLE_HIT } from '../src/art/action_f16_groom';
import { GUARD_DRILL, JAV } from '../src/art/action_f16_guard';
import { DANCER_THROW, LANE_LONG, THROW, THROW_HIT } from '../src/art/action_f16_dancer';
import { BANNER, BANNER_HIT, KNIGHT_BANNER } from '../src/art/action_f16_knight';
import { RNG } from '../src/engine/rng';
import { act1Rules } from '../src/game/act1_rules/index';
import { JAV_PERIL, JAV_PARTISAN_FORM, JAV_SWORD_FORM, PARTISAN_SWORD_FORM, SWORD_AFTER_FORM } from '../src/game/act1_rules/pguard';
import { BANNER_LIFE, BANNER_PERIL, RALLY } from '../src/game/act1_rules/kknight';
import { HORSE_PERIL } from '../src/game/act1_rules/groom';
import type { Game } from '../src/game/game';
import type { Monster } from '../src/game/state';
import { firstHurt, keep, room, watch } from './act1_kinds_room';

function on(sw: { on: boolean }, fn: () => void): void {
  const was = sw.on;
  sw.on = true;
  try {
    fn();
  } finally {
    sw.on = was;
  }
}
const ids = (kind: string): string[] => act1Rules(kind as never)!.acts.map((a) => a.id);
interface Hooks {
  wakeUp(m: Monster): void;
}

test('1. off, the old moves; on, the new', () => {
  for (const sw of [GARDENER_HEDGE, GROOM_HORSE, GUARD_DRILL, DANCER_THROW, KNIGHT_BANNER]) assert.equal(sw.on, false, 'off until his yes');
  assert.deepEqual(ids('gardener'), ['gardener:snap']);
  assert.deepEqual(ids('groom'), ['groom:jab']);
  assert.deepEqual(ids('pguard'), ['pguard:thrust', 'pguard:sweep']);
  assert.deepEqual(ids('dancer'), ['dancer:spin', 'dancer:chime', 'dancer:notice']);
  assert.deepEqual(ids('kknight'), ['kknight:sweep', 'kknight:cleave']);
  on(GARDENER_HEDGE, () => assert.deepEqual(ids('gardener'), ['gardener:lunge']));
  on(GROOM_HORSE, () => assert.deepEqual(ids('groom'), ['groom:whistle']));
  on(GUARD_DRILL, () => assert.deepEqual(ids('pguard'), ['pguard:thrust', 'pguard:javelin', 'pguard:javelin2', 'pguard:pullout']));
  on(DANCER_THROW, () => assert.deepEqual(ids('dancer'), ['dancer:throw', 'dancer:thrown', 'dancer:spin', 'dancer:chime', 'dancer:notice']));
  on(KNIGHT_BANNER, () => assert.deepEqual(ids('kknight'), ['kknight:cleave', 'kknight:banner']));
});

test('2. the shear lunge: in its lane, struck as the blades snap shut; off to the side, not; he is on where he landed', () => {
  on(GARDENER_HEDGE, () => {
    {
      const { g, m } = room('gardener', 2.5, 'gardener:lunge');
      const x0 = m.x;
      const s = watch(g, m, LUNGE.long + 0.1);
      assert.ok(s.acts[0]?.startsWith('gardener:lunge'), 'he lunges');
      assert.equal(s.hurts.length, 1, 'struck');
      assert.ok(Math.abs(firstHurt(s) - s.began - LUNGE_HIT) < 0.05, 'as the blades snap shut');
      assert.ok(Math.abs(m.x - x0 - LUNGE_TRAVEL_TILES) < 0.15, `on where he landed (${(m.x - x0).toFixed(2)})`);
    }
    {
      const { g, m } = room('gardener', 2.5, 'gardener:lunge');
      watch(g, m, 0.3);
      g.hero.y = m.y + 2.6;
      assert.equal(watch(g, m, LUNGE.long).hurts.length, 0, 'off to the side, not');
    }
  });
});

test('3. the horse: where he stood as the line was marked, struck once as it gallops by; stepped off the line, not', () => {
  on(GROOM_HORSE, () => {
    {
      const { g, m } = room('groom', 4, 'groom:whistle');
      const s = watch(g, m, LOOSE.long + 0.6);
      assert.ok(s.acts[0]?.startsWith('groom:whistle'), 'he whistles');
      assert.ok(g.perils.some((p) => p.a1 === HORSE_PERIL) || s.hurts.length, 'the horse loosed');
      assert.equal(s.hurts.length, 1, 'struck once');
      assert.ok(firstHurt(s) - s.began > WHISTLE_HIT, 'as it comes by');
    }
    {
      const { g, m } = room('groom', 4, 'groom:whistle');
      const s = watch(g, m, LOOSE.long + 0.6, (t) => (t > LOOSE.aim + 0.05 && t < WHISTLE_HIT + 0.1 ? { mx: 0, my: 1 } : null));
      assert.equal(s.hurts.length, 0, 'off the line, not');
    }
  });
});

test('4. the javelin: struck where it sticks; he fights with his sword, marches to his partisan, wrenches it out', () => {
  on(GUARD_DRILL, () => {
    {
      const { g, m } = room('pguard', 5, 'pguard:javelin');
      m.form = JAV_PARTISAN_FORM;
      const s = watch(g, m, JAV.partisan.long + 0.1);
      assert.ok(s.acts[0]?.startsWith('pguard:javelin'), 'he hurls it');
      assert.equal(s.hurts.length, 1, 'struck where it sticks');
      assert.ok(firstHurt(s) - s.began > JAV.partisan.hit, 'as it lands');
      assert.equal(m.form, PARTISAN_SWORD_FORM, 'his sword drawn');
      const sp = g.perils.find((p) => p.a1 === JAV_PERIL)!;
      assert.ok(sp && sp.d === 1, 'it stands stuck');
      // (the hero away out of his way: he marches to it and wrenches it out)
      g.hero.x = m.x - 6;
      m.moveCd = m.moveCd!.map(() => 1e9);
      const s2 = watch(g, m, 12, undefined, () => m.form === JAV_PARTISAN_FORM && m.state !== 'act');
      assert.ok(s2.acts.some((a) => a.startsWith('pguard:pullout')), 'he wrenches it out');
      assert.equal(m.form, JAV_PARTISAN_FORM, 'the partisan guard again');
      assert.ok(!g.perils.some((p) => p.a1 === JAV_PERIL), 'off the floor');
    }
    {
      const { g, m } = room('pguard', 5, 'pguard:javelin2');
      m.form = JAV_SWORD_FORM;
      const s = watch(g, m, JAV.sword.long + 0.1);
      assert.ok(s.acts[0]?.startsWith('pguard:javelin2'), 'the sword guard throws his');
      assert.equal(s.hurts.length, 1, 'struck');
      assert.equal(m.form, SWORD_AFTER_FORM, 'his back bare after');
    }
    {
      const { g, m } = room('pguard', 5, 'pguard:javelin');
      m.form = JAV_PARTISAN_FORM;
      const s = watch(g, m, JAV.partisan.long + 0.1, (t) => (t > JAV.partisan.hit + 0.02 && t < JAV.partisan.hit + 0.6 ? { mx: 0, my: 1 } : null));
      assert.equal(s.hurts.length, 0, 'gone from where it was thrown, not');
    }
  });
});

/** A waltzing pair, `far` tiles west of the hero, awake, the lady first. */
function pair(g: Game, far: number): { lady: Monster; gent: Monster } {
  const h = g.hero;
  const lady = g.spawn('dancer', h.x - far, h.y, 7, 0, false, new RNG(11));
  const gent = g.spawn('dancer', h.x - far, h.y, 7, 1, false, new RNG(12));
  for (const m of [lady, gent]) {
    (g as unknown as Hooks).wakeUp(m);
    m.words = [];
    m.life = m.maxLife = 1e9;
    m.fx = 1;
    m.fy = 0;
    if (m.a1) {
      m.a1.noticed = 1;
      m.a1.want = 0;
    }
  }
  return { lady, gent };
}

test('5. the partner throw: the pair throw together, she is carried down the lane and strikes him once; alone, a dancer spins', () => {
  on(DANCER_THROW, () => {
    {
      const { g } = room('dancer', 5);
      g.monsters.length = 0;
      const { lady, gent } = pair(g, 5);
      assert.equal((gent.form ?? 0) % 2, 1, 'a gentleman');
      assert.equal(gent.a1!.partner, lady.id, 'with his lady');
      keep(gent, 'dancer:throw');
      lady.moveCd = act1Rules('dancer')!.acts.map(() => 1e9);
      const x0 = lady.x;
      let flung = false;
      const s = watch(g, gent, THROW.lady + 0.2, undefined, () => {
        if (lady.act?.id === 'dancer:thrown') flung = true;
        return false;
      });
      assert.ok(s.acts[0]?.startsWith('dancer:throw'), 'he leads');
      assert.ok(flung, 'she with him');
      assert.equal(s.hurts.length, 1, 'struck once');
      assert.ok(firstHurt(s) - s.began > THROW_HIT, 'as she comes by');
      assert.ok(lady.x - x0 > 4, `carried down the lane (${(lady.x - x0).toFixed(1)})`);
      assert.ok(LANE_LONG > 8, 'a long lane');
    }
    {
      const { g, m } = room('dancer', 1.5, 'dancer:spin');
      if (m.a1) m.a1.noticed = 1;
      const s = watch(g, m, 2.2);
      assert.ok(s.acts[0]?.startsWith('dancer:spin'), 'alone, it spins');
    }
  });
});

test('6. the banner: planted with a shockwave; within 7 tiles of it they hit harder; cut down by his blows; one a knight', () => {
  on(KNIGHT_BANNER, () => {
    const { g, m } = room('kknight', 2.5, 'kknight:banner');
    const s = watch(g, m, BANNER.long + 0.1);
    assert.ok(s.acts[0]?.startsWith('kknight:banner'), 'he plants it');
    assert.equal(s.hurts.length, 1, 'the shockwave');
    assert.ok(firstHurt(s) - s.began >= BANNER_HIT - 0.02, 'as it goes in');
    const b = g.perils.find((p) => p.a1 === BANNER_PERIL)!;
    assert.ok(b, 'it stands');
    assert.equal(m.form, 1, 'his look without it');
    assert.ok(!act1Rules('kknight')!.can!(g.bosses, m, act1Rules('kknight')!.acts[1], 3, true), 'one banner a knight');
    // (one within its reach hits harder; one out of it, not)
    const near = g.spawn('pguard', b.x + 6.5, b.y, -9, 0, false, new RNG(4));
    const far = g.spawn('pguard', b.x + 7.6, b.y, -9, 0, false, new RNG(4));
    near.dmgMin = near.dmgMax = far.dmgMin = far.dmgMax = 10;
    assert.ok(Math.abs(g.rollMonsterDmg(near) - 10 * RALLY) < 1e-9, 'within it, harder');
    assert.ok(Math.abs(g.rollMonsterDmg(far) - 10) < 1e-9, 'out of it, not');
    // (his blows on it: cut down)
    for (let i = 0; i < BANNER_LIFE; i++) g.bosses.floorBlow(b.x, b.y, 0.8, 'phys');
    assert.ok(b.d >= 0, 'cut down');
    assert.ok(Math.abs(g.rollMonsterDmg(near) - 10) < 1e-9, 'and they hit as before');
    watch(g, m, 2);
    assert.ok(!g.perils.includes(b), 'gone');
  });
});
