// THE CHAINED ONE'S MOVES DONE THE ACTION WAY (src/art/chained_action.ts, CHAINED_ACTION, off; on the floor
// src/art/chained_action_fx.ts; docs/mockups/action_f3_chained/README.md). The owner, 31 Oct 2026: “He needs some work.  I think
// the action really needs to be applied to his moves”; offered a plan first, “Just draw it”. Under his Movement 9 (“Like the wind up
// and wind down are big but the actual punch is lightning quick”) and his rule for the enemies (“Start from now on, but every enemy
// is going to need that change eventually.  And bigger AOE to compensate for the extra time the player gets to evade”).
//   1. the switch off; nothing of the game imports the mock-up; his stand, walk, struck, death, setting off and stopping and his
//      chains breaking are the game's own (the same moves: every frame as they are), and the game's own four moves are kept;
//   2. every frame of the four new moves, in each of his three states, from in front and from behind: painted, the enemy's pink edge,
//      crisp, no cyan, nothing cut off;
//   3. THE WHOLE BOSSES' REVIEW (art/boss_checks.ts checkBoss, on the heroes' bones), every frame of every move of his, both ways
//      round, in each of his three states, with every handing over (from his stand at every frame into each move and back, the lash
//      ending a step and more on; into his walk and out of it; his chains breaking; the whirl's loop closing on itself): nothing;
//   4. Movement 9: each blow held before it, struck in two frames, smeared then and only then; bigger areas than his old moves;
//   5. the floor: the crack and the rings, their numbers; nothing cut off, crisp, no cyan, the enemy's pink at their leading edges;
//      nothing after they are done.
// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';

import type { AnimSet, Clip } from '../src/art/actor_types';
import { CHAINED, CHAINED_FREED, CO_BALL_LAND, CO_BALL_REACH, CO_HOOK_LET, CO_LASH_HIT, CO_WHIRL_FROM, CO_WHIRL_TO, coWhirlReach } from '../src/art/bosses3';
import { LASH_REACH } from '../src/art/chained_action';
import type { CoFreed } from '../src/art/bosses3';
import {
  BALL_BACK, BALL_LAND, BALL_LET, BALL_REACH, BALL_STRIKE, CHAINED_ACTION, CO_ACT_STRIKES, HOOK_BACK, HOOK_BITE, HOOK_BLOW, HOOK_BLOW_STRIKE, HOOK_LET, HOOK_STRIKE, LASH_HITS, LASH_STRIKES, LASH_TRAVEL,
  WHIRL_HIT, WHIRL_LOOP, WHIRL_RATE, WHIRL_SPIN, WHIRL_STILL, WHIRL_STRIKE, actBallPath, actHookPath, chainEndAt, chainedActionMob, coActionShape, coSmeared, makeChainedActionArt,
} from '../src/art/chained_action';
import { CRACK, CRACK_CANVAS, RING, crackPainted, crackReach, crackStrikes, ringCanvas, ringPainted } from '../src/art/chained_action_fx';
import { checkBoss, findingsSaid } from '../src/art/boss_checks';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { TILE3, paintMob, posedOfMob, skeletonAt } from '../src/art/new_mobs3';
import { project } from '../src/art/skeleton';
import { rgba } from '../src/engine/px';
import type { Px, Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

paintWithoutCanvas();

// (pure white is the heart of the enemy's own fire and of a blow on iron, as the game has it: not the friend's)
const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')).filter((k) => k !== '255,255,255'));
function cyanGlow(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 150 || max - min < 0.45 * max) return false;
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  h = (h + 360) % 360;
  return h >= 165 && h <= 205;
}
const rimKey = rgba(ENEMY_RIM).slice(0, 3).join(',');
function look(p: Px, lights: ReadonlyArray<{ color: string }> = []): { painted: number; odd: number; cyan: string | null; rim: number; edge: boolean; colours: Set<string> } {
  let painted = 0;
  let odd = 0;
  let rim = 0;
  let cyan: string | null = null;
  let edge = false;
  const colours = new Set<string>();
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const i = (y * p.w + x) * 4;
      const a = p.d[i + 3];
      if (a === 0) continue;
      painted++;
      if (a !== 255 && a !== RIM_ALPHA) odd++;
      const k = `${p.d[i]},${p.d[i + 1]},${p.d[i + 2]}`;
      colours.add(k);
      if (k === rimKey && a === RIM_ALPHA) rim++;
      if (!cyan && (FRIEND.has(k) || cyanGlow(p.d[i], p.d[i + 1], p.d[i + 2]))) cyan = k;
      if (x === 0 || y === 0 || x === p.w - 1 || y === p.h - 1) edge = true;
    }
  }
  for (const l of lights) if (cyanGlow(...(rgba(l.color).slice(0, 3) as [number, number, number]))) cyan = `light ${l.color}`;
  return { painted, odd, cyan, rim, edge, colours };
}
const STATES: ReadonlyArray<CoFreed> = [0, 1, 2];
const NEW = ['attack', 'whirl', 'hook', 'ball'] as const;
const gameOf = (freed: CoFreed) => (freed === 0 ? CHAINED : CHAINED_FREED[freed]);

test('1. the switch is off, nothing of the game imports the mock-up, his other moves are the game’s own and the game’s four are kept', () => {
  assert.equal(CHAINED_ACTION.on, false, 'CHAINED_ACTION is off');
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    // (the Amalgamation's moves done the action way, art/amalgam_action*.ts, a mock-up behind AMALGAM_ACTION, off, draws its slams' rings with this one's;
    // the Chained One's new look, art/chained_look.ts, a mock-up behind CHAINED_LOOK, off, plays these moves on his new body: tests/chained_look.test.ts)
    // (and the game's own, brought in by the main chat behind CO_ACTION: his rules, game/bosses.ts; the hook and ball in flight,
    // render/bossfx.ts; his crack and rings, render/act1_fx/chained.ts; and the bestiary's choosing of his art)
    if (!f.endsWith('.ts') || f.startsWith('dev/') || f === 'art/chained_action.ts' || f === 'art/chained_action_fx.ts' || f.startsWith('art/amalgam_action') || f === 'art/chained_look.ts' || ['game/bosses.ts', 'render/bossfx.ts', 'render/act1_fx/chained.ts', 'art/bestiary.ts'].includes(f)) continue;
    assert.ok(!/from ['"][^'"]*(chained_action|chained_action_fx|action_f3_chained_scene)['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the mock-up`);
  }
  for (const freed of STATES) {
    const game = gameOf(freed);
    const mob = chainedActionMob(freed);
    for (const m of ['stand', 'walk', 'reel', 'dying'] as const) assert.ok(mob[m] === game[m], `${freed}: his ${m} is the game's own`);
    for (const m of ['setOff', 'halt', 'breakL', 'breakBall']) if (game.more?.[m]) assert.ok(mob.more?.[m] === game.more[m], `${freed}: his ${m} is the game's own`);
    assert.ok(mob.bits !== game.bits && mob.attack !== game.attack, `${freed}: his lash is the new one`);
    assert.equal(!!mob.more?.ball, freed < 2, `${freed}: the ball while he has it`);
    // (the game's own moves, kept as they were)
    assert.equal(game.attack.motion.hit, CO_LASH_HIT);
    assert.equal(game.more?.hook.motion.hit, CO_HOOK_LET);
    assert.ok(game.more?.whirl.motion.hit === (CO_WHIRL_FROM + CO_WHIRL_TO) / 2, 'the game’s whirl as it was');
  }
});

test('2. every frame of his four new moves, in each of his three states, paints, wears the pink edge, is crisp, has no cyan, nothing cut off', () => {
  for (const freed of STATES) {
    const mob = chainedActionMob(freed);
    for (const v of ['front', 'back'] as const) {
      for (const name of NEW) {
        const mv = name === 'attack' ? mob.attack : mob.more?.[name];
        if (!mv) {
          assert.ok(name === 'ball' && freed === 2, `${freed} ${name}: there`);
          continue;
        }
        const n = Math.round(mv.motion.keys[mv.motion.keys.length - 1].at * 30);
        for (let i = 0; i <= n; i++) {
          // (on his whole canvas, as the game paints him before it keeps only the box he fills)
          const p = paintMob(mob, name, i / 30, v);
          const l = look(p.px, p.lights);
          assert.ok(l.painted > 600, `${freed} ${v} ${name} ${i}: only ${l.painted} pixels`);
          assert.ok(l.rim > 40, `${freed} ${v} ${name} ${i}: the pink edge (${l.rim})`);
          assert.equal(l.odd, 0, `${freed} ${v} ${name} ${i}: pixels neither see-through nor whole`);
          assert.equal(l.cyan, null, `${freed} ${v} ${name} ${i}: a friend's colour`);
          assert.ok(!l.edge, `${freed} ${v} ${name} ${i}: cut off at the canvas's edge`);
        }
      }
    }
  }
});

test('3. THE WHOLE BOSSES’ REVIEW: every frame of every move of his, both ways round, in each of his three states, every handing over: nothing found', () => {
  for (const freed of STATES) {
    const mob = chainedActionMob(freed);
    const shape = coActionShape(mob);
    // (the review knows each blow of each new move, and the lash's end where his steps have taken him, and the whirl's loop)
    assert.equal(shape.blows?.attack?.length, 3, 'the lash: three blows');
    assert.equal(shape.blows?.hook?.length, 2, 'the hook: the fling and the blow waiting');
    assert.ok(shape.handovers?.some((h) => h.from === 'attack' && h.at === 'end' && h.shift?.[0] === LASH_TRAVEL), 'the lash ends where his steps have taken him');
    assert.ok(shape.handovers?.some((h) => h.from === 'whirl' && h.to === 'whirl'), 'the whirl’s loop closes on itself');
    for (const m of NEW) if (m !== 'ball' || freed < 2) assert.ok(shape.handovers?.some((h) => h.from === 'stand' && h.to === m) && shape.handovers?.some((h) => h.from === m && h.to === 'stand'), `${freed}: from his stand into ${m} and back`);
    const found = checkBoss(mob, shape);
    assert.equal(found.length, 0, `${freed}: ${findingsSaid(found).slice(0, 12).join('; ')}`);
  }
});

test('4. Movement 9: each blow held before it, struck in two frames, smeared then and only then; and bigger than his old moves', () => {
  const mob = chainedActionMob(0);
  const seen = (p: readonly number[]): [number, number] => {
    const r = project(p as [number, number, number], 'front');
    return [r[0] / 2, r[1] / 2];
  };
  const tipOf = (move: string, t: number) => coActionShape(mob).tip?.(move, t, skeletonAt(mob, move, t), posedOfMob(mob, move, t)) ?? null;
  for (const [move, strikes] of Object.entries(CO_ACT_STRIKES)) {
    for (const [s0, s1] of strikes) {
      assert.equal(Math.round((s1 - s0) * 30), 2, `${move}: a strike of two frames`);
      // (held: in the third of a second before its body goes, the end it strikes with barely moves)
      let most = 0;
      for (let f = Math.round(s0 * 30) - 8; f < Math.round(s0 * 30) - 2; f++) {
        const a = tipOf(move, f / 30);
        const b = tipOf(move, (f + 1) / 30);
        if (a && b) most = Math.max(most, Math.hypot(seen(b)[0] - seen(a)[0], seen(b)[1] - seen(a)[1]));
      }
      const a = tipOf(move, s0);
      const b = tipOf(move, s1);
      const flash = a && b ? Math.hypot(seen(b)[0] - seen(a)[0], seen(b)[1] - seen(a)[1]) / 2 : 0;
      assert.ok(most < 4.5, `${move} at ${s0.toFixed(2)} s: held before it (${most.toFixed(1)} game pixels a frame at most)`);
      assert.ok(flash > 4 * most && flash > 15, `${move} at ${s0.toFixed(2)} s: struck in a flash (${flash.toFixed(1)} a frame)`);
      // (smeared on its two frames and the one after, as it thins; not before)
      for (const f of [1, 2, 3]) assert.ok(coSmeared(move, s0 + f / 30), `${move}: smeared ${f} frames on`);
      assert.ok(!coSmeared(move, s0) && !coSmeared(move, s0 - 1 / 30), `${move}: not smeared before it`);
      const r = (move === 'attack' ? mob.attack : mob.more![move]).ropes!(s0 + 1 / 30);
      assert.ok(Object.keys(r).some((k) => k.startsWith('smear')), `${move}: its after-images there`);
      assert.ok(!Object.keys((move === 'attack' ? mob.attack : mob.more![move]).ropes!(s0 - 0.2)).some((k) => k.startsWith('smear')), `${move}: none before`);
    }
  }
  // each move's blow is the last frame of its strike
  assert.ok(LASH_HITS.every((h, i) => h === LASH_STRIKES[i][1]) && WHIRL_HIT === WHIRL_STRIKE[1] && HOOK_LET === HOOK_STRIKE[1] && HOOK_BLOW === HOOK_BLOW_STRIKE[1] && BALL_LET === BALL_STRIKE[1], 'each blow lands on the last frame of its strike');
  // THE LASH: the forehand's chain strikes further than the old lash's 3.2 (below a man's waist, from where he began); the finisher's chains flung out past 4 tiles; the crack runs to 6.4
  const reach = LASH_REACH(mob);
  assert.ok(reach[0] > 3.2 && reach[0] <= 3.6, `the forehand's chain ${reach[0].toFixed(2)} tiles out`);
  assert.ok(reach[2] > 3.2, `the finisher's chains ${reach[2].toFixed(2)} tiles out`);
  const fin = Math.max(...['L', 'R'].map((n) => chainEndAt(mob, 'attack', n as 'L', LASH_HITS[2])?.[0] ?? 0));
  assert.ok(fin > 4, `the finisher's chains out ${fin.toFixed(2)} tiles`);
  assert.ok(CRACK.to > 6 && CRACK.half * 2 >= 1.6, 'the crack: 6.4 tiles out, 1.6 wide');
  // THE WHIRL: faster than the old (1028 degrees a second) and as wide or wider, at a man's height; its ring wider still
  const old = (1080 / (CO_WHIRL_TO - CO_WHIRL_FROM));
  assert.ok(WHIRL_RATE > 1.35 * old, `spun at ${WHIRL_RATE} degrees a second (the old: ${old.toFixed(0)})`);
  let wide = 0;
  const heights: number[] = [];
  for (let t = WHIRL_SPIN + 0.4; t <= WHIRL_STILL - 0.3; t += 1 / 60) {
    const r = mob.more!.whirl.ropes!(t);
    for (const n of ['L', 'R']) {
      const c = r[n];
      if (!c) continue;
      heights.push(c[c.length - 1][2] / 2);
      for (const q of c) wide = Math.max(wide, Math.hypot(q[0], q[1]) / TILE3);
    }
  }
  heights.sort((a, b) => a - b);
  assert.ok(wide >= coWhirlReach() / TILE3, `his chains out ${wide.toFixed(2)} tiles as he spins (the old: ${(coWhirlReach() / TILE3).toFixed(2)})`);
  assert.ok(heights[heights.length >> 1] < 32 && heights[heights.length - 1] < 42, `his chains' ends at a man's height (half of them under ${heights[heights.length >> 1].toFixed(0)} game pixels)`);
  assert.ok(RING.whirl > wide + 0.4, 'the slam’s ring wider than his chains');
  // (the loop the game plays round and round: its end is its start, chains and all)
  const A = mob.more!.whirl.ropes!(WHIRL_LOOP.at);
  const B = mob.more!.whirl.ropes!(WHIRL_LOOP.at + WHIRL_LOOP.span);
  for (const n of ['L', 'R', 'ball']) A[n]?.forEach((p, i) => assert.ok(Math.hypot(p[0] - B[n][i][0], p[1] - B[n][i][1], p[2] - B[n][i][2]) < 0.01, `the loop: his ${n} chain the same at its end and its start`));
  // THE HOOK: flung in two frames, it bites three frames later however far it flies; dragged in; the blow waits
  assert.ok(HOOK_BITE - HOOK_LET <= 0.1 + 1e-9, 'the hook bites three frames after it leaves his hand');
  const flies = actHookPath(HOOK_LET + 0.05, 7.5);
  assert.ok(flies && flies.flying && flies.at[0] > 3, 'lightning fast: half way out to 7.5 tiles in a twentieth of a second');
  const home = actHookPath(HOOK_BACK - 1e-3, 7.5);
  assert.ok(home && !home.flying && home.at[0] < 1.6, 'hauled back to his feet');
  assert.ok(HOOK_BLOW - HOOK_BACK >= 0.5, 'the blow waits a half second and more after the drag: time to get out from under it');
  // THE BALL: further than the old, its ring bigger (the old: 4.0 tiles, 1.5 round)
  assert.ok(BALL_REACH > CO_BALL_REACH && RING.ball > 1.5, 'the ball further, its ring bigger');
  assert.ok(BALL_LAND - BALL_LET <= 0.2 && BALL_LAND - BALL_LET < CO_BALL_LAND - 1.78, 'whipped down: it lands five frames after it leaves his hands');
  const ball = actBallPath(BALL_LAND - 1e-3);
  assert.ok(ball && ball.flying && Math.abs(ball.at[0] - BALL_REACH) < 0.3, 'it comes down where it is marked');
  assert.ok(!actBallPath(BALL_BACK + 0.01), 'back in his hands');
});

test('5. the floor: the crack and the rings', () => {
  // THE CRACK: it runs out in a sixth of a second, strikes within its lane as it runs, and is gone by its end
  assert.equal(crackReach(0), CRACK.from);
  assert.ok(Math.abs(crackReach(CRACK.run) - CRACK.to) < 1e-9 && crackReach(CRACK.run / 2) > (CRACK.from + CRACK.to) / 2, 'it runs out fast');
  assert.ok(crackStrikes(3, 0.7, 0.05) && !crackStrikes(3, 0.9, 0.05) && !crackStrikes(6, 0, 0.02) && crackStrikes(6, 0, CRACK.run), 'what is struck');
  for (const way of [[1, 0], [0, -1], [0.7071, 0.7071], [-0.7071, 0.7071], [-1, 0], [0, 1], [0.7071, -0.7071], [-0.7071, -0.7071]] as const) {
    let pink = false;
    for (let t = 0; t <= CRACK.long; t += 1 / 30) {
      for (const layer of ['floor', 'air'] as const) {
        const p = crackPainted(t, layer, way);
        const l = look(p.px, p.lights);
        assert.equal(l.odd, 0, `the crack ${way} at ${t.toFixed(2)}: crisp`);
        assert.equal(l.cyan, null, `the crack ${way} at ${t.toFixed(2)}: no cyan`);
        assert.ok(!l.edge, `the crack ${way} at ${t.toFixed(2)} ${layer}: cut off`);
        if (layer === 'floor' && t < CRACK.run + 0.05 && [...l.colours].some((c) => c === rgba('#ff7aa8').slice(0, 3).join(','))) pink = true;
      }
    }
    assert.ok(pink, `the crack ${way}: the enemy's pink at its edges as it runs`);
    assert.equal(look(crackPainted(CRACK.long + 0.05, 'floor', way).px).painted, 0, 'nothing after');
  }
  assert.ok(CRACK_CANVAS.w > 0);
  // THE RINGS: round him as the whirl ends, where the ball lands, where his fists come down after the drag
  for (const r of [RING.whirl, RING.ball, RING.hammer]) {
    const C = ringCanvas(r);
    for (let t = 0; t <= RING.long; t += 1 / 30) {
      for (const layer of ['floor', 'air'] as const) {
        const p = ringPainted(t, layer, r);
        assert.ok(p.px.w === C.w && p.px.h === C.h);
        const l = look(p.px, p.lights);
        assert.equal(l.odd, 0, `ring ${r} at ${t.toFixed(2)}: crisp`);
        assert.equal(l.cyan, null, `ring ${r} at ${t.toFixed(2)}: no cyan`);
        assert.ok(!l.edge, `ring ${r} at ${t.toFixed(2)} ${layer}: cut off`);
      }
    }
    assert.ok(look(ringPainted(0.05, 'floor', r).px).colours.has(rgba('#ff7aa8').slice(0, 3).join(',')), `ring ${r}: the pink at its leading edge`);
    assert.equal(look(ringPainted(RING.long + 0.05, 'floor', r).px).painted, 0, 'nothing after');
  }
  assert.ok(RING.whirl === 3.5 && RING.ball === 2.5 && RING.hammer === 1.5, 'their sizes, as the README says');
});
