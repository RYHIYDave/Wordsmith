// ACT 1: THE DUST DEVILS OF ECHO CANYON IN THE GAME (game/act1_rules/devil.ts, art/act1_figs/devil.ts), the art chat's
// pictures (art/dust_devils.ts) each with his yes as shown.
//   1. it is built: its rules, its pictures by the names its acts use, its size against them, its pace its weave's;
//   2. its numbers are its pictures' own (its lash's moment and reach);
//   3. it spins into him and lashes at its picture's moment, knocks him about, then scatters, and comes back;
//      it misses one who has stepped away;
//   4. its packs are a small monster's; a long fight throws nothing.
//   run: tsx --test tests/act1_devil.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIG } from '../src/art/act1_figs/devil';
import { FIGURE_SIZE, makeBestiary } from '../src/art/bestiary';
import { DD_DIE, DD_LASH, DD_PACE, DD_WALK } from '../src/art/dust_devils';
import { TILE3 } from '../src/art/new_mobs3';
import { RNG } from '../src/engine/rng';
import { DEVIL, RULES } from '../src/game/act1_rules/devil';
import { act1Pack, act1Ready } from '../src/game/act1_mobs';
import { MONSTERS, PACK_BY_SIZE, TUNE } from '../src/game/defs';
import { floorOf, hooks, measure, room, watch } from './act1_ledge_canyon_harness';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
paintWithoutCanvas();
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);

test('1. it is built: its rules, its pictures by the names its acts use, its size against its pictures', () => {
  assert.ok(RULES && FIG, 'rules and pictures');
  assert.ok(act1Ready('devil'));
  assert.equal(MONSTERS.devil.size, 'small');
  assert.equal(RULES!.acts.length, 1, 'small: one attack, by his rule');
  const art = makeBestiary().of('devil');
  for (const set of [art.front, art.back]) {
    const a = RULES!.acts[0];
    const clip = set.clips?.attack;
    assert.equal(a.clip, 'attack');
    assert.ok(clip);
    near((clip!.frames.length - 1) / clip!.fps, a.long, 0.04, 'as long as its clip');
    near(clip!.hit ?? -1, a.hit, 1e-9, 'its blow\'s moment is its clip\'s');
    assert.ok(set.clips?.reel && set.clips?.die, 'its stutter, and its death');
    assert.equal(set.clips!.die!.fps, DD_DIE.fps);
    assert.ok(clip!.frames[15].w > 0 && set.clips!.die!.frames[40].w > 0, 'its frames paint');
  }
  const { head, reach } = measure(art.front.idle[0]);
  near(FIG!.size.top, head, 4, 'the top of its funnel');
  assert.ok(FIG!.size.half <= reach + 1 && FIG!.size.half >= reach * 0.4, `half its width ${FIG!.size.half}, its picture reaching ${reach}`);
  assert.equal(FIGURE_SIZE.devil.top, FIG!.size.top);
  assert.equal(MONSTERS.devil.speed, DD_PACE, 'at the pace its dust trail is painted for');
  assert.equal(RULES!.gait.pace, DD_PACE);
  assert.equal(RULES!.gait.cycle, DD_WALK.period);
});

test('2. its numbers are its pictures\' own', () => {
  const a = RULES!.acts[0];
  assert.equal(a.hit, DD_LASH.hit);
  assert.equal(a.long, DD_LASH.long);
  near(DEVIL.lash.reach, DD_LASH.reach / TILE3, 1e-3, 'where its whip cracks');
  assert.ok(DEVIL.lash.fwd[0] < DEVIL.lash.reach && DEVIL.lash.fwd[1] > DEVIL.lash.reach, 'it strikes along its whip, to its tip');
  assert.ok(DEVIL.near < DEVIL.lash.reach + 0.1, 'it comes in as near as its whip reaches, or nearer');
});

test('3. it spins into him, lashes at its picture\'s moment, knocks him about, scatters and comes back', () => {
  let { g, m } = room('devil', 5);
  const h = g.hero;
  let knocked = false;
  let after = -1;
  let far = 0;
  const seen = watch(g, m, 6, () => {
    if (m.act && m.act.t > DD_LASH.hit && m.act.t < DD_LASH.hit + 0.05 && h.step) knocked = true;
    if (after < 0 && seen0()) after = 0;
    if (after >= 0 && !m.act) far = Math.max(far, Math.hypot(m.x - h.x, m.y - h.y));
  });
  function seen0(): boolean {
    return !!m.a1 && m.a1.go > 0;
  }
  const blows = seen.hurts.filter((x) => x.act === 'devil:lash');
  assert.ok(blows.length >= 2, 'it lashes him, and again');
  for (const b of blows) near(b.at, DD_LASH.hit, 1 / 50, 'at the crack of its whip, as its picture has it');
  assert.ok(knocked, 'and knocks him about');
  assert.ok(far > 2.2, `it scatters off away from him after (${far.toFixed(2)} tiles)`);
  assert.ok(seen.acts.length >= 2, 'and comes back at him');
  ({ g, m } = room('devil', 1.0));
  let away = false;
  const miss = watch(g, m, 2, () => {
    if (!away && m.state === 'act') {
      away = true;
      g.hero.x += 3;
    }
  }, () => away && m.state !== 'act');
  assert.ok(away);
  assert.equal(miss.hurts.length, 0, 'it misses one out of its reach');
});

test('4. its packs are a small monster\'s; a long fight throws nothing', () => {
  let n = 0;
  for (let s = 1; s < 400 && n < 5; s++) {
    const p = act1Pack(8, new RNG(s), 'normal');
    if (p.kind !== 'devil') continue;
    n++;
    assert.ok(p.size >= PACK_BY_SIZE.small[0] && p.size <= PACK_BY_SIZE.small[1], `a pack of ${p.size}`);
  }
  assert.ok(n > 0, 'Echo Canyon has packs of them');
  const f = floorOf(9, 8);
  const h = f.hero;
  f.monsters.length = 0;
  const pack = f.spotsRound(h.x + 3, h.y, 5).map((s) => f.spawn('devil', s.x, s.y, 6, 0, false, new RNG(7)));
  for (const c of pack) hooks(f).wakeUp(c);
  const x0 = h.x;
  const y0 = h.y;
  watch(f, pack[0], 45, (t) => {
    const nx = x0 + Math.cos(t * 0.5) * 2;
    const ny = y0 + Math.sin(t * 0.5) * 2;
    if (f.free(f.level.walk, nx, ny, TUNE.heroRadius)) {
      h.x = nx;
      h.y = ny;
    }
    if (Math.round(t * 60) % 15 === 0) for (const c of pack) if (!c.dead && Math.hypot(c.x - h.x, c.y - h.y) < 1.6) hooks(f).damageMonster(c, 6, 'phys', false, -1);
  });
  assert.ok(pack.some((c) => c.dead), 'he kills some of them');
});
