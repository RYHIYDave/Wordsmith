// ACT 2, THE HUSH: THE HUSHED WATCH IN THE GAME (game/act1_rules/watch.ts, art/act1_figs/watch.ts; nothing of its own drawn
// beyond its figure, render/act1_fx/watch.ts), behind ACT2 (game/act1.ts, off):
//   1. it is built: its rules, its pictures (the art chat's) with a clip by each name its act uses, the art's switch with
//      its figure, its size as its pictures stand, the watchman and the sergeant;
//   2. the rules' numbers are its pictures' own: its trudge, its sweep's length and moment, and THE SWEEP'S ARC, frame by
//      frame, the blade's bearing and the halberd's reach as its picture has them;
//   3. the sweep strikes as the blade passes where the hero stands, from their right to their left, as far as it reaches
//      there: once, at the picture's moment for one straight before them, sooner for one at their right, later for one at
//      their left; not one behind them or beyond its reach; and knocks him on a little;
//   4. THE SERGEANT leads a yellow pack (his look, 'watch1'), and brings a brace of the mute watch hounds at his heels, of
//      his pack; a plain one is a watchman, alone;
//   5. medium: its packs of three to five on floor 11, the guardian of its lair; with the switch off, on none;
//   6. a long fight on floor 11 with a pack of them: no exceptions, its sweep made.
//   run: tsx --test tests/act2_watch.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIGURE_SIZE, figureOf, makeBestiary } from '../src/art/bestiary';
import { act1Fig } from '../src/art/act1_figs/index';
import { WATCH_ON, halberdOf } from '../src/art/hushed_watch';
import { WATCHMAN, WATCH_ALL, WA_DIES, WA_PACE, WA_SWEEP, WA_WALK } from '../src/art/hushed_watch_moves';
import { TILE3, posedOfMob, skeletonAt } from '../src/art/new_mobs3';
import { RNG } from '../src/engine/rng';
import { ACT2_GUARD, act2Pack } from '../src/game/act2_mobs';
import { HOUND } from '../src/game/act1_rules/hound';
import { WATCH, sweepAt } from '../src/game/act1_rules/watch';
import { act1Rules } from '../src/game/act1_rules/index';
import { actsOf, gaitOf } from '../src/game/bosses';
import { MONSTERS, PACK_BY_SIZE, TUNE, sizeOf } from '../src/game/defs';
import { act1Fx } from '../src/render/act1_fx/index';
import { cityFight, hush, offTheFloors } from './act2_city_room';
import { measuredSize, room, untilAct, watch } from './act1_kinds_room_c';
import { GRAIN } from '../src/art/kit';
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

test('1. it is built: its rules, its pictures with a clip by each name its act uses, the art\'s switch, its size, its two', () => {
  const r = act1Rules('watch');
  const fig = act1Fig('watch');
  assert.ok(r && fig, 'its rules and its pictures');
  assert.ok(fig!.switches?.includes(WATCH_ON), "the art chat's switch is its figure's");
  assert.equal(fig!.looks?.length, 1, 'and one look more: the sergeant');
  assert.equal(act1Fx('watch'), null, 'nothing drawn beyond its figure');
  const B = makeBestiary();
  for (const f of ['watch', 'watch1'] as const) {
    const art = B.of(f);
    for (const set of [art.front, art.back]) {
      for (const a of r!.acts) {
        const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
        assert.ok(clip && clip.frames.length > 0, `${f}: its ${a.id}: its clip ${a.clip}`);
        near((clip!.frames.length - 1) / clip!.fps, a.long, 1 / clip!.fps, `${f}: its ${a.id}'s length`);
        near(clip!.hit ?? -1, a.hit, 1e-9, `${f}: its clip's blow is the act's`);
      }
      assert.ok(set.clips?.reel && set.clips?.die, `${f}: struck and its death`);
      near((set.clips!.die!.frames.length - 1) / set.clips!.die!.fps, WA_DIES.long, 0.06, `${f}: the gag falling and the kneeling, as long as its picture`);
    }
    // (its halberd stands on its butt at its right side, its top a little over the head and to the left of it as the picture
    // is seen: the head is measured from the middle to its right, as measuredSize measures the others, and the halberd is
    // not its head, as a club held over one is not)
    const m = measuredSize(f);
    const sp = art.front.idle[0];
    const p = paintingOf(sp);
    const ax = Math.round(sp.ax * GRAIN);
    const ay = Math.round(sp.ay * GRAIN);
    let head = 0;
    for (let y = 0; y < p.h && head === 0; y++) for (let x = ax - 1; x <= ax + 5; x++) if (p.has(x, y)) head = (ay - y) / GRAIN;
    assert.ok(m.head >= head, 'the halberd stands over its head');
    assert.ok(Math.abs(m.size.top - head) <= 4, `${f}: the game takes it to be ${m.size.top} up; in the picture its head is ${head}`);
    assert.ok(m.size.half <= m.reach + 1 && m.size.half >= m.reach * 0.4, `${f}: ${m.size.half} to either side; the picture reaches ${m.reach}`);
    assert.deepEqual(FIGURE_SIZE[f], fig!.size, `${f}: the game goes by its size`);
  }
  assert.ok(FIGURE_SIZE.watch.top > FIGURE_SIZE.hushed.top + 3, 'a head taller than the townsfolk');
});

test("2. the rules' numbers are its pictures' own: its trudge, its sweep, and the sweep's arc frame by frame", () => {
  const G = gaitOf('watch')!;
  assert.equal(G.pace, WA_PACE, 'its trudge at the pace it is painted for');
  assert.equal(MONSTERS.watch.speed, WA_PACE, 'and it goes at it: its boots do not slide');
  assert.equal(makeBestiary().of('watch').front.walkFps, WA_WALK.fps, 'its trudge shown at its own rate');
  near(G.cycle, WA_WALK.frames / 2 / WA_WALK.fps, 1e-9, 'it stops where both boots are down: each half of its trudge');
  assert.equal(G.trueBack, WATCHMAN.trueBack === true, 'its back as its pictures have it');
  const acts = actsOf({ kind: 'watch' })!;
  assert.equal(acts.length, 1, 'the one move the art has for it (his rule asks two of a medium: the art chat\'s to draw)');
  const sweep = acts[0];
  assert.equal(sweep.hit, WA_SWEEP.hit, 'the blade crosses before them at its moment');
  assert.equal(sweep.long, WA_SWEEP.long);
  assert.equal(MONSTERS.watch.windup, WA_SWEEP.hit);
  assert.ok(WA_SWEEP.warn[1] < WATCH.sweep.from, 'its warning before the blade comes round');
  // (THE ARC: at each frame of it, for both of them, where the blade's edge is and how far the halberd reaches, off the picture)
  for (const mob of WATCH_ALL) {
    for (const [t, bearing, reach] of WATCH.sweep.at) {
      const h = halberdOf(skeletonAt(mob, 'attack', t), posedOfMob(mob, 'attack', t));
      near(bearing, Math.atan2(h.edge[1], h.edge[0]), 0.005, `${mob.name} at ${t.toFixed(3)}: the blade's bearing`);
      near(reach, Math.hypot(h.tip[0], h.tip[1]) / TILE3, 0.005, `${mob.name} at ${t.toFixed(3)}: the halberd's reach`);
      // (low enough to strike a man: below the top of the knight's head, 58 high)
      assert.ok(h.edge[2] < 75, `${mob.name} at ${t.toFixed(3)}: the blade comes down to strike (${h.edge[2].toFixed(1)} up)`);
    }
    // (from their right to their left, and crossing straight before them at the blow)
    const at = WATCH.sweep.at;
    for (let i = 1; i < at.length; i++) assert.ok(at[i][1] > at[i - 1][1], 'from their right to their left');
    near(sweepAt(WA_SWEEP.hit).bearing, 0, 0.1, 'straight before them as it crosses');
    near(sweepAt(WA_SWEEP.hit).reach, 2.65, 0.05, 'reaching most there');
    // (on high before it: over his head)
    const pre = halberdOf(skeletonAt(mob, 'attack', WATCH.sweep.from - 2 / 30), posedOfMob(mob, 'attack', WATCH.sweep.from - 2 / 30));
    assert.ok(pre.edge[2] > 85, 'on high a moment before');
  }
  assert.ok(G.stopAt < sweep.far && sweep.far <= sweepAt(WA_SWEEP.hit).reach, 'it stops inside its reach');
  assert.ok(G.stopAt + G.slack <= sweep.far + 1e-9, 'and does not stand off out of it');
  assert.ok(MONSTERS.watch.range === sweep.far, "its reach in the monsters' table is its sweep's");
});

/** One of them sweeping at a hero `far` tiles off, `deg` degrees round to its left of straight before it: when he is struck (seconds into its act), or -1. */
function swept(far: number, deg: number): { at: number; n: number; knocked: number } {
  const { g, m } = room('watch', 2.0, 'watch:sweep');
  assert.ok(untilAct(g, m, 'watch:sweep'), 'it sweeps');
  const h = g.hero;
  // (as its picture is turned: to its left as it is drawn)
  const a = (deg * Math.PI) / 180;
  const hand = m.act!.hand;
  h.x = m.x + far * (m.fx * Math.cos(a) + m.fy * hand * Math.sin(a));
  h.y = m.y + far * (m.fy * Math.cos(a) - m.fx * hand * Math.sin(a));
  const x0 = h.x;
  const y0 = h.y;
  const t0 = m.act!.t;
  let knocked = 0;
  const s = watch(g, m, 2, undefined, () => {
    knocked = Math.max(knocked, Math.hypot(h.x - x0, h.y - y0));
    return m.state !== 'act';
  });
  return { at: s.hurts.length ? s.hurts[0].t + t0 : -1, n: s.hurts.length, knocked };
}

test('3. the sweep strikes as the blade passes where he stands, as far as it reaches there: once; not behind, nor beyond', () => {
  const ahead = swept(2.0, 0);
  assert.equal(ahead.n, 1, 'one straight before them is struck once');
  near(ahead.at, WA_SWEEP.hit, 1.5 / 60 + 1 / 30, 'as the blade crosses before them');
  assert.ok(ahead.knocked > 0.1, 'and knocked on a little');
  const right = swept(1.8, -55);
  assert.equal(right.n, 1, 'one at their right is struck');
  assert.ok(right.at < ahead.at - 0.02, `sooner: the blade comes from their right (${right.at.toFixed(3)})`);
  const left = swept(1.7, 70);
  assert.equal(left.n, 1, 'one at their left is struck');
  assert.ok(left.at > ahead.at + 0.04, `later: the blade goes on round to their left (${left.at.toFixed(3)})`);
  assert.equal(swept(1.2, 180).n, 0, 'one behind them is not');
  assert.equal(swept(2.95, 0).n, 0, 'one beyond its reach is not');
  assert.equal(swept(0.7, 10).n, 1, 'one hugging them is: the staff sweeps him');
});

test('4. the sergeant leads a yellow pack, and brings a brace of hounds at his heels, of his pack; a plain one is a watchman, alone', () => {
  const { g } = room('watch', 4);
  g.monsters.length = 0;
  const h = g.hero;
  const lead = g.spawn('watch', h.x + 7, h.y, 41, 1, false, new RNG(3), null, { rarity: 'leader', words: ['fire'] });
  const minion = g.spawn('watch', h.x + 7, h.y + 1.5, 41, 0, false, new RNG(4), null, { rarity: 'minion', words: ['fire'] });
  const plain = g.spawn('watch', h.x + 2, h.y - 4, 42, 0, false, new RNG(5));
  assert.equal(figureOf(lead), 'watch1', 'the leader is the sergeant');
  assert.ok(/Sergeant$/.test(lead.name) && /Watchman$/.test(minion.name), `and called so (${lead.name}; ${minion.name})`);
  assert.equal(figureOf(minion), 'watch', 'those he leads are watchmen');
  assert.equal(figureOf(plain), 'watch', 'and a plain one');
  const hounds = g.monsters.filter((m) => m.kind === 'hound');
  assert.equal(hounds.length, HOUND.heel.brace, `a brace of hounds with the sergeant (${hounds.length})`);
  for (const d of hounds) {
    assert.equal(d.packId, lead.packId, 'of his pack');
    assert.equal(d.rarity, 'minion', 'its minions');
    assert.ok(d.half?.includes('fire'), "with his words at half, as the pack's");
    assert.ok(Math.hypot(d.x - lead.x, d.y - lead.y) < 1.8, 'at his heels');
    assert.ok(g.free(g.level.walk, d.x, d.y, 0.3), 'on free floor');
  }
  assert.ok(Math.abs(hounds[0].x - hounds[1].x) + Math.abs(hounds[0].y - hounds[1].y) > 0.5, 'one to either side of him');
  // (the floor laid the same each time: the hounds' places and draws are his own)
  const { g: g2 } = room('watch', 4);
  g2.monsters.length = 0;
  const lead2 = g2.spawn('watch', g2.hero.x + 7, g2.hero.y, 41, 1, false, new RNG(3), null, { rarity: 'leader', words: ['fire'] });
  const h2 = g2.monsters.filter((m) => m.kind === 'hound');
  assert.deepEqual(h2.map((d) => [d.x - lead2.x, d.y - lead2.y, d.seed]), hounds.map((d) => [d.x - lead.x, d.y - lead.y, d.seed]), 'the same again');
});

test('5. medium: its packs of three to five on floor 11, the guardian of its lair; with the switch off, on none', () => {
  assert.equal(sizeOf('watch'), 'medium');
  assert.equal(ACT2_GUARD[11], 'watch', "its lair's guardian");
  const [lo, hi] = PACK_BY_SIZE.medium;
  hush(() => {
    const rng = new RNG(11);
    let seen = 0;
    for (let k = 0; k < 600; k++) {
      const p = act2Pack(11, rng, 'normal');
      if (p.kind !== 'watch') continue;
      seen++;
      assert.ok(p.size >= lo && p.size <= hi, `a pack of ${p.size}`);
    }
    assert.ok(seen > 30, `floor 11 has them (${seen})`);
  });
  assert.deepEqual(offTheFloors('watch'), [], 'the switch off: nothing of it in the game');
});

test('6. a long fight on floor 11 with a pack of them: no exceptions, its sweep made', () => {
  const { acts } = cityFight('watch', 11, 40);
  assert.ok(acts.has('watch:sweep'), 'it swept');
  void TUNE;
});
