// ACT 1: THE CANYON SCORPIONS OF ECHO CANYON IN THE GAME (game/act1_rules/scorpion.ts, art/act1_figs/scorpion.ts,
// render/act1_fx/scorpion.ts), the art chat's pictures (art/canyon_scorpions.ts) each with his yes as shown.
//   1. it is built: its rules, its pictures by the names its acts use, its size against them, its pace its scuttle's;
//   2. its numbers are its pictures' own (its pincers' snap, its venom's reach and when it comes down);
//   3. its pincer snap strikes at its picture's moment and misses one who has stepped away;
//   4. its tail strike's venom comes down two tiles before it, as its jet reaches the floor, and poisons what it bursts
//      on; with it ready and the hero too near, it darts back first;
//   5. it darts: dashes, then dead still;
//   6. its packs are a medium monster's; nothing it draws is cyan; a long fight throws nothing.
//   run: tsx --test tests/act1_scorpion.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIG } from '../src/art/act1_figs/scorpion';
import { FIGURE_SIZE, makeBestiary } from '../src/art/bestiary';
import { SC_DIE, SC_PACE, SC_SNAP, SC_STING, SC_WALK, scorpionChipCount, scorpionSolids } from '../src/art/canyon_scorpions';
import { TILE3 } from '../src/art/new_mobs3';
import type { V3 } from '../src/art/skeleton';
import { RNG } from '../src/engine/rng';
import { RULES, SCORPION } from '../src/game/act1_rules/scorpion';
import { act1Pack, act1Ready } from '../src/game/act1_mobs';
import { MONSTERS, PACK_BY_SIZE, TUNE } from '../src/game/defs';
import { FX } from '../src/render/act1_fx/scorpion';
import { cyan, floorOf, hooks, measure, noteColours, only, room, watch } from './act1_ledge_canyon_harness';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
paintWithoutCanvas();
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);

test('1. it is built: its rules, its pictures by the names its acts use, its size against its pictures', () => {
  assert.ok(RULES && FIG && FX, 'rules, pictures and what it draws');
  assert.ok(act1Ready('scorpion'));
  assert.equal(MONSTERS.scorpion.size, 'medium');
  assert.equal(RULES!.acts.length, 2, 'medium: two attacks, by his rule');
  const art = makeBestiary().of('scorpion');
  for (const set of [art.front, art.back]) {
    for (const a of RULES!.acts) {
      const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
      assert.ok(clip, `${a.id}: its clip, ${a.clip}`);
      near((clip!.frames.length - 1) / clip!.fps, a.long, 0.04, `${a.id}: as long as its clip`);
      near(clip!.hit ?? -1, a.hit, 1e-9, `${a.id}: its blow's moment is its clip's`);
    }
    assert.ok(set.clips?.reel && set.clips?.die, 'struck, and its death');
    assert.equal(set.clips!.die!.fps, SC_DIE.fps);
    assert.ok(set.clips!.moves!.sting.frames[25].w > 0 && set.clips!.die!.frames[20].w > 0, 'its frames paint');
  }
  const { head, reach } = measure(art.front.idle[0]);
  near(FIG!.size.top, head, 4, 'the top of its back, standing');
  assert.ok(FIG!.size.half <= reach + 1 && FIG!.size.half >= reach * 0.4, `half its width ${FIG!.size.half}, its picture reaching ${reach}`);
  assert.equal(FIGURE_SIZE.scorpion.top, FIG!.size.top);
  assert.equal(MONSTERS.scorpion.speed, SC_PACE, 'its feet grip: at the pace its scuttle is painted for');
  assert.equal(RULES!.gait.pace, SC_PACE);
  assert.equal(RULES!.gait.cycle, SC_WALK.period);
});

test('2. its numbers are its pictures\' own', () => {
  const [snap, sting] = RULES!.acts;
  assert.equal(snap.hit, SC_SNAP.hit);
  assert.equal(snap.long, SC_SNAP.long);
  assert.equal(sting.hit, SC_STING.hit);
  assert.equal(sting.long, SC_STING.long);
  // (its pincers' fingers at the snap are in the strip it strikes)
  for (const b of scorpionSolids('attack', SC_SNAP.hit).filter((x) => x.piece.startsWith('fixed') || x.piece.startsWith('moving'))) {
    const tip = (b.shape as { b: V3 }).b;
    const f = tip[0] / TILE3;
    assert.ok(f >= SCORPION.snap.fwd[0] && f <= SCORPION.snap.fwd[1] && Math.abs(tip[1] / TILE3) <= SCORPION.snap.half, `a finger at the snap, ${f.toFixed(2)} before it`);
  }
  // (its venom bursts its picture's reach before it, as the jet's head reaches the floor: a tenth after the stab's freeze)
  near(SCORPION.sting.reach, SC_STING.reach / TILE3, 1e-3, 'where its venom bursts');
  near(SCORPION.sting.burst, SC_STING.hit + SC_STING.freeze + 0.1, 1e-9, 'when');
  assert.ok(scorpionChipCount('sting', SCORPION.sting.burst + 0.05) > 20, 'its splash is painted there then');
  assert.ok(SCORPION.sting.warnFrom < SC_STING.warn, 'its ring on the floor from as its tail is drawn back');
});

test('3. its pincer snap strikes at its picture\'s moment, and misses one who has stepped away', () => {
  let { g, m } = room('scorpion', 1.1);
  only(m, 'scorpion:snap');
  const seen = watch(g, m, 3);
  const blows = seen.hurts.filter((x) => x.act === 'scorpion:snap');
  assert.ok(blows.length >= 1, 'it strikes him');
  for (const b of blows) near(b.at, SC_SNAP.hit, 1 / 50, 'at the snap, as its picture has it');
  ({ g, m } = room('scorpion', 1.1));
  only(m, 'scorpion:snap');
  let away = false;
  const miss = watch(g, m, 2, () => {
    if (!away && m.state === 'act') {
      away = true;
      g.hero.x += 2.5;
    }
  }, () => away && m.state !== 'act');
  assert.ok(away);
  assert.equal(miss.hurts.length, 0, 'it misses one out of its reach');
});

test('4. its tail strike: its venom comes down two tiles on as its jet reaches the floor, and poisons; too near, it darts back first', () => {
  let { g, m } = room('scorpion', 2.0);
  only(m, 'scorpion:sting');
  const h = g.hero;
  let poisoned = 0;
  const seen = watch(g, m, 3, () => {
    if (h.poisonT > 0) poisoned = Math.max(poisoned, h.poisonT);
  });
  const blows = seen.hurts.filter((x) => x.act === 'scorpion:sting' && x.at <= SCORPION.sting.burst + 0.02);
  assert.equal(blows.length, 1, 'its venom strikes him once');
  near(blows[0].at, SCORPION.sting.burst, 1 / 50, 'as its jet reaches the floor');
  assert.ok(poisoned > TUNE.poisonTime - 0.1, 'and poisons him');
  assert.ok(seen.hurts.filter((x) => x.at > SCORPION.sting.burst + 0.02 || x.act === '').length >= 3, 'the poison works on him after');
  // (one standing at its feet is not where its venom comes down: with its tail strike ready it darts back first, then strikes)
  ({ g, m } = room('scorpion', 0.9));
  only(m, 'scorpion:sting');
  const back = watch(g, m, 4);
  const first = back.acts.find((a) => a.id === 'scorpion:sting');
  assert.ok(first, 'it makes its tail strike');
  assert.ok(back.hurts.some((x) => x.act === 'scorpion:sting'), 'and its venom finds him, from range');
});

test('5. it darts: dashes, then dead still', () => {
  const { g, m } = room('scorpion', 9);
  m.moveCd = RULES!.acts.map(() => 1e9);
  const modes: string[] = [];
  watch(g, m, 4, () => modes.push(m.state === 'act' ? 'act' : m.gait ? m.gait.mode : 'none'), () => Math.hypot(m.x - g.hero.x, m.y - g.hero.y) < 2);
  let stops = 0;
  for (let i = 1; i < modes.length; i++) if (modes[i] === 'stand' && modes[i - 1] === 'walk') stops++;
  assert.ok(stops >= 2, `it stops dead on its way to him (${stops} times)`);
  const walking = modes.filter((x) => x === 'walk').length;
  const still = modes.filter((x) => x === 'stand').length;
  assert.ok(walking > still && still > 15, 'mostly dashing, and still between');
});

test('6. its packs are a medium monster\'s; nothing it draws is cyan; a long fight throws nothing', () => {
  let n = 0;
  for (let s = 1; s < 400 && n < 5; s++) {
    const p = act1Pack(8, new RNG(s), 'normal');
    if (p.kind !== 'scorpion') continue;
    n++;
    assert.ok(p.size >= PACK_BY_SIZE.medium[0] && p.size <= PACK_BY_SIZE.medium[1], `a pack of ${p.size}`);
  }
  assert.ok(n > 0, 'Echo Canyon has packs of them');
  const { g, m } = room('scorpion', 2.0);
  only(m, 'scorpion:sting');
  const { ctx, colours } = noteColours();
  watch(g, m, 1.2, () => FX!.ground!({ g: ctx, at: (x, y) => [(x - y) * 16, (x + y) * 8], game: g, t: 1, bestiary: makeBestiary(), stand: () => undefined, spot: () => undefined }, m, null));
  assert.ok(colours.size > 0, 'its warning is drawn');
  for (const c of colours) assert.ok(!cyan(c), `${c} is not cyan`);
  // A LONG FIGHT in Echo Canyon
  const f = floorOf(8, 8);
  const h = f.hero;
  f.monsters.length = 0;
  const pack = f.spotsRound(h.x + 3, h.y, 4).map((s) => f.spawn('scorpion', s.x, s.y, 6, 0, false, new RNG(7)));
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
