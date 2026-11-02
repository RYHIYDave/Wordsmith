// THE CRIER'S MOVES DONE THE ACTION WAY (src/art/crier_action.ts, CRIER_ACTION, off; what he sends out src/art/crier_action_fx.ts;
// docs/mockups/action_f11_crier/README.md). The owner's review of every enemy, 31 Oct 2026: offered “Shout off the walls, in place of
// the cone: his silent shout hits the square's walls and bounces back across from three sides. Find the one spot none of them
// reach”, he answered “Crier needs more work as well”: every move of his redone the action way, as the Chained One and the
// Amalgamation (“Just draw it”). Under his Movement 9 (“Like the wind up and wind down are big but the actual punch is lightning
// quick”) and his rule for the enemies (“Start from now on, but every enemy is going to need that change eventually.  And bigger AOE
// to compensate for the extra time the player gets to evade”).
//   1. the switch off; nothing of the game imports the mock-up; his stand, march, setting off and stopping, struck and death are the
//      game's own; the game's own moves kept;
//   2. THE GAME'S FRAMES THE SAME: every frame the game shows of him, and what it draws of his moves, hash as on bf48311;
//   3. every frame of the new moves, from in front and from behind: painted, the enemy's pink edge, crisp, no cyan, nothing cut off;
//   4. THE WHOLE BOSSES' REVIEW (art/boss_checks.ts checkBoss), every frame of every new move, both ways round, each blow of the
//      combo its own, every handing over: nothing found;
//   5. Movement 9 and the numbers: each blow held, struck in two frames, smeared then only; bigger, wider, further than the old;
//   6. what he sends out: crisp, no cyan, the enemy's pink, nothing cut off, nothing after; the shout fills the square but one spot.
// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodeCrypto from 'node:crypto';

import {
  CRIER_ACTION, CR_ACT_CANVAS, CR_ACT_MOVES, CR_ACT_SHAPE, CR_ACT_STRIKES, CROWD_HIT, CROWD_HOLD, CROWD_STRIKE, PROCLAIM_HIT, PROCLAIM_HOLD, PROCLAIM_STRIKE, SHOUT_HIT, SHOUT_HOLD,
  SHOUT_STRIKE, SWING_HITS, TOLL, TOLL_HITS, TOLL_LONG, TOLL_STRIKES, bellAt, crSmeared, crierActionMob, makeCrierActionArt, tilesOf, tollBellAt, tollStrikes,
} from '../src/art/crier_action';
import type { ActMove } from '../src/art/crier_action';
import { CALL, DECREE, RING, SWEEP, WALLS, decreeBurns, decreeFront, echoTimes, paintCall, paintDecree, paintShout, paintSwing, shoutSafe, shoutStrikes, swingStrikes } from '../src/art/crier_action_fx';
import type { At, Square } from '../src/art/crier_action_fx';
import { CRIER, CR_CROWD, CR_PROCLAIM, CR_SHOUT, CR_SWING_HIT, trumpetOf } from '../src/art/crier';
import { CRIER_MOB, makeCrierArt } from '../src/art/crier_moves';
import { PROCLAIM_HALF, PROCLAIM_TO, SHOUT_TO } from '../src/art/crier_shots';
import '../src/game/bosses';
import { CRIER as RULES } from '../src/game/act1_rules/crier';
import { checkBoss, findingsSaid } from '../src/art/boss_checks';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { paintMob, posedOfMob, skeletonAt } from '../src/art/new_mobs3';
import { project } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';
import { Px, rgba } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import type { ActorArt, AnimSet } from '../src/art/actor_types';

import { drawBellSlam, drawCrowdBreath, drawCrowdCall, drawHushedRising, drawProclaimWarn, drawProclamation, drawShoutBlast, drawShoutWarn } from '../src/art/crier_shots';
import { PxCtx } from '../src/dev/action_f3_scene';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
interface Hasher {
  update(d: string | Uint8ClampedArray): Hasher;
  digest(e: 'hex'): string;
}
const sha = (): Hasher => (nodeCrypto as { createHash(a: string): Hasher }).createHash('sha256');
// (as tools/crier_action_hash.ts hashes them: every frame of every move, both ways round; and what the game draws of his moves)
function lists(s: AnimSet): [string, Sprite[]][] {
  const out: [string, Sprite[]][] = [['idle', s.idle], ['walk', s.walk], ['attack3', s.attack]];
  if (s.heavy) out.push(['heavy3', s.heavy]);
  const c = s.clips;
  if (c) {
    for (const k of ['attack', 'heavy', 'die', 'reel'] as const) if (c[k]) out.push([k, c[k]!.frames]);
    for (const [k, v] of Object.entries(c.moves ?? {})) out.push([`moves.${k}`, v.frames]);
  }
  return out;
}
function frameHash(sp: Sprite): string {
  const p = sp.img as unknown as Px;
  return sha().update(`${p.w}x${p.h}@${sp.ax},${sp.ay},${sp.density ?? 1};`).update(p.d).update(JSON.stringify(sp.lights ?? [])).digest('hex').slice(0, 12);
}
function hashMoves(art: ActorArt): string {
  const out: Record<string, string[]> = {};
  for (const [view, s] of [['front', art.front], ['back', art.back]] as const) for (const [name, fr] of lists(s)) out[`${view}:${name}`] = fr.map((sp) => frameHash(sp));
  return sha().update(JSON.stringify(out)).digest('hex').slice(0, 16);
}
function shotsHash(): string {
  const h = sha();
  const at = (x: number, y: number): [number, number] => [300 + 32 * (x - y), 200 + 16 * (x + y)];
  for (let t = 0; t <= 2.8; t += 0.1) {
    const p = new Px(640, 420);
    const g = new PxCtx(p, 1) as unknown as CanvasRenderingContext2D;
    drawBellSlam(g, at, 1, 0, t);
    drawShoutWarn(g, at, 0, 0, 1, 0, Math.min(1, t), t);
    drawShoutBlast(g, at, 0, 0, 1, 0, t);
    drawProclaimWarn(g, at, 0, 0, 0, 1, Math.min(1, t), t);
    drawProclamation(g, at, 0, 0, 0, 1, t);
    drawCrowdBreath(g, at, 0, 0, Math.min(1, t), t);
    drawCrowdCall(g, at, 0, 0, t);
    drawHushedRising(g, at, -3, 2, t);
    h.update(p.d);
  }
  return h.digest('hex').slice(0, 16);
}

paintWithoutCanvas();

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
const pinkKeys = new Set([FLAME[1], FLAME[2], FLAME[3]].map((c) => rgba(c).slice(0, 3).join(',')));
function look(p: Px, lights: ReadonlyArray<{ color: string }> = []): { painted: number; odd: number; cyan: string | null; rim: number; pink: number; edge: boolean } {
  let painted = 0;
  let odd = 0;
  let rim = 0;
  let pink = 0;
  let cyan: string | null = null;
  let edge = false;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const i = (y * p.w + x) * 4;
      const a = p.d[i + 3];
      if (a === 0) continue;
      painted++;
      if (a !== 255 && a !== RIM_ALPHA) odd++;
      const k = `${p.d[i]},${p.d[i + 1]},${p.d[i + 2]}`;
      if (k === rimKey && a === RIM_ALPHA) rim++;
      if (pinkKeys.has(k)) pink++;
      const grey = p.d[i] === p.d[i + 1] && p.d[i + 1] === p.d[i + 2];
      if (!cyan && ((FRIEND.has(k) && !grey) || cyanGlow(p.d[i], p.d[i + 1], p.d[i + 2]))) cyan = k;
      if (x === 0 || y === 0 || x === p.w - 1 || y === p.h - 1) edge = true;
    }
  }
  for (const l of lights) if (cyanGlow(...(rgba(l.color).slice(0, 3) as [number, number, number]))) cyan = `light ${l.color}`;
  return { painted, odd, cyan, rim, pink, edge };
}
const moveOf = (name: string) => {
  const mob = crierActionMob();
  return name === 'attack' ? mob.attack : mob.more![name];
};
const longOf = (name: string): number => {
  const k = moveOf(name).motion.keys;
  return k[k.length - 1].at;
};

test('1. the switch is off, nothing of the game imports the mock-up, the rest of him is the game’s own and the game’s moves are kept', () => {
  assert.equal(CRIER_ACTION.on, false, 'CRIER_ACTION is off');
  const mock = ['art/crier_action.ts', 'art/crier_action_fx.ts'];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    // (brought in by the main chat, 2 Nov 2026, behind the switch: only through the game's figures, rules and what they leave; and the
    // art chat's own scene of the toll, whose painter moved into art/crier_action_fx.ts)
    if (!f.endsWith('.ts') || f.startsWith('dev/') || mock.includes(f) || /^(art\/act1_figs|game\/act1_rules|render\/act1_fx)\/[a-z0-9_]+\.ts$/.test(f)) continue;
    assert.ok(!/from ['"][^'"]*(crier_action|crier_action_fx|crier_action_scene)['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the mock-up`);
  }
  const mob = crierActionMob();
  for (const m of ['stand', 'walk', 'reel', 'dying'] as const) assert.ok(mob[m] === CRIER_MOB[m], `his ${m} is the game's own`);
  for (const m of ['setOff', 'halt']) assert.ok(mob.more?.[m] === CRIER_MOB.more?.[m], `his ${m} is the game's own`);
  for (const m of CR_ACT_MOVES) assert.ok(moveOf(m) !== (m === 'attack' ? CRIER_MOB.attack : CRIER_MOB.more?.[m]), `his ${m} is the new one`);
  // (the game's own, kept as they were)
  assert.equal(CRIER.on, false);
  assert.equal(CRIER_MOB.attack.motion.hit, CR_SWING_HIT);
  assert.equal(CR_SWING_HIT, 0.72);
  assert.equal(CR_SHOUT.hit, 0.82);
  assert.equal(CR_PROCLAIM.hit, 0.92);
  assert.equal(CR_CROWD.hit, 0.74);
  const art = makeCrierActionArt();
  assert.ok(art.front.clips?.moves?.shout && art.back.clips?.moves?.crowd && art.front.clips?.attack, 'as the game holds a monster');
});

test('2. THE GAME’S FRAMES THE SAME: every frame the game shows of him, and what it draws of his moves', () => {
  // (made on bf48311, the branch this one came from, which this branch changes no file of: tools/crier_action_hash.ts)
  assert.equal(hashMoves(makeCrierArt()), '7efa5e84c62bd0c5', 'the Crier');
  assert.equal(shotsHash(), '74c2635fc68cedfb', 'what the game draws of his moves');
});

test('3. every frame of the new moves paints, wears the pink edge, is crisp, has no cyan, nothing cut off', () => {
  const mob = crierActionMob();
  for (const v of ['front', 'back'] as const) {
    for (const name of CR_ACT_MOVES) {
      const n = Math.round(longOf(name) * 30);
      for (let i = 0; i <= n; i++) {
        const p = paintMob(mob, name, i / 30, v);
        assert.equal(`${p.px.w}x${p.px.h}`, `${CR_ACT_CANVAS.w}x${CR_ACT_CANVAS.h}`);
        const l = look(p.px, p.lights);
        const tag = `${v} ${name} ${i}`;
        assert.ok(l.painted > 1200, `${tag}: only ${l.painted} pixels`);
        assert.ok(l.rim > 60, `${tag}: the pink edge (${l.rim})`);
        assert.equal(l.odd, 0, `${tag}: pixels neither see-through nor whole`);
        assert.equal(l.cyan, null, `${tag}: a friend's colour`);
        assert.ok(!l.edge, `${tag}: cut off at the canvas's edge`);
      }
    }
  }
});

test('4. THE WHOLE BOSSES’ REVIEW: every frame of every new move, both ways round, each blow its own, every handing over: nothing found', () => {
  assert.equal(CR_ACT_SHAPE.blows?.attack?.length, 5, 'the toll (2 Nov): five tolls, each its own blow');
  const found = checkBoss(crierActionMob(), CR_ACT_SHAPE, [...CR_ACT_MOVES]);
  assert.equal(found.length, 0, findingsSaid(found).slice(0, 12).join('; '));
});

test('5. Movement 9: each blow held, struck in two frames, smeared then only; bigger, wider and further than his old moves', () => {
  const mob = crierActionMob();
  const seen = (p: V3): [number, number] => {
    const r = project(p, 'front');
    return [r[0] / 2, r[1] / 2];
  };
  const tipOf = (move: string, t: number): V3 => {
    const s = skeletonAt(mob, move, t);
    return move === 'proclaim' ? s.handL : move === 'attack' ? tollBellAt(t) : trumpetOf(s, posedOfMob(mob, move, t)).rim;
  };
  for (const [move, strikes] of Object.entries(CR_ACT_STRIKES)) {
    for (const [s0, s1] of strikes) {
      assert.equal(Math.round((s1 - s0) * 30), 2, `${move}: a strike of two frames`);
      let most = 0;
      for (let f = Math.round(s0 * 30) - 5; f < Math.round(s0 * 30); f++) {
        const a = seen(tipOf(move, f / 30));
        const b = seen(tipOf(move, (f + 1) / 30));
        most = Math.max(most, Math.hypot(b[0] - a[0], b[1] - a[1]));
      }
      const a = seen(tipOf(move, s0));
      const b = seen(tipOf(move, s1));
      const flash = Math.hypot(b[0] - a[0], b[1] - a[1]) / 2;
      assert.ok(most < 1.6, `${move} at ${s0.toFixed(2)} s: held before it (${most.toFixed(1)} game pixels a frame at most)`);
      assert.ok(flash > 4 * most && flash > 8, `${move} at ${s0.toFixed(2)} s: struck in a flash (${flash.toFixed(1)} a frame)`);
      for (const f of [1, 2, 3]) assert.ok(crSmeared(move, s0 + f / 30), `${move}: smeared ${f} frames on`);
      assert.ok(!crSmeared(move, s0) && !crSmeared(move, s0 - 1 / 30) && !crSmeared(move, s1 + 2 / 30), `${move}: smeared only then`);
      const ropes = moveOf(move).ropes!;
      assert.ok(Object.keys(ropes(s0 + 1 / 30)).some((k) => k.startsWith('smear')) && !Object.keys(ropes(s0 - 0.2)).some((k) => k.startsWith('smear')), `${move}: its after-images there, and only there`);
    }
  }
  assert.ok(TOLL_HITS.every((h, i) => h === TOLL_STRIKES[i][1]) && SHOUT_HIT === SHOUT_STRIKE[1] && PROCLAIM_HIT === PROCLAIM_STRIKE[1] && CROWD_HIT === CROWD_STRIKE[1], 'each blow lands on the last frame of its strike');
  // HELD: each wind-up held long before its strike (the warning): the big ones near a second
  for (const [what, held] of [['first toll', TOLL_STRIKES[0][0] - TOLL.raised], ['shout', SHOUT_STRIKE[0] - SHOUT_HOLD[0]], ['decree', PROCLAIM_STRIKE[0] - PROCLAIM_HOLD[0]], ['call', CROWD_STRIKE[0] - CROWD_HOLD[0]]] as const) {
    assert.ok(held >= 0.13 - 1e-6, `${what}: held ${held.toFixed(2)} s`);
  }
  assert.ok(SHOUT_STRIKE[0] - SHOUT_HOLD[0] >= 0.99 && CROWD_STRIKE[0] - CROWD_HOLD[0] >= 0.86 && PROCLAIM_STRIKE[0] - PROCLAIM_HOLD[0] >= 0.7, 'the big three held long');
  // THE TOLL (2 Nov, in place of the swing combo): his handbell raised high and held, then rung five times, each a strike of two frames;
  // each toll marks where you are then, 1.6 tiles round, bursting a beat later
  assert.ok(TOLL_STRIKES[0][0] - TOLL.raised >= 0.28, `the first toll held ${(TOLL_STRIKES[0][0] - TOLL.raised).toFixed(2)} s`);
  for (let k = 1; k < 5; k++) assert.ok(TOLL_STRIKES[k][0] - (TOLL_HITS[k - 1] + 9 / 30) >= 0.16, `toll ${k + 1}: held again`);
  assert.ok(TOLL_HITS.length === 5 && TOLL.r >= 1.5 && TOLL.burst >= 0.5 && TOLL.burst <= 0.7 && TOLL_LONG - TOLL_HITS[4] >= 0.9, 'five tolls; each mark 1.6 round, bursting a beat later; a big wind-down');
  assert.ok(tollBellAt(TOLL.raised + 0.1)[2] > 110 && tollBellAt(TOLL_HITS[0])[2] < 80, 'the bell held up over his hat, rung down before him');
  assert.ok(tollStrikes(0, 0, 1.2, 0.8) && !tollStrikes(0, 0, 1.4, 1.0) && !tollStrikes(0, 0, 3, 0), 'standing still is death; moving 1.7 tiles saves you');
  void [bellAt, SWEEP, RING, swingStrikes, RULES];
  // THE SCROLL: longer and wider than the old (8.6 by 2.5): to the far wall, 3 tiles wide; its letters burn on
  assert.ok(DECREE.to > PROCLAIM_TO + 3 && DECREE.half * 2 >= PROCLAIM_HALF * 2 + 0.4, 'a longer, wider lane');
  assert.ok(decreeFront(DECREE.unrolled) === DECREE.to && decreeFront(DECREE.lands - 0.01) === null, 'unrolled in a smear, in 0.2 s');
  assert.ok(decreeBurns(2.0, 6, 0) && !decreeBurns(2.0, 6, DECREE.half + 0.2) && !decreeBurns(DECREE.out + 0.1, 6, 0), 'floor taken away while it burns, and given back');
  // THE CROWD: more of them (old: three at a call, four at half his life)
  assert.ok(CALL.each * 8 > RULES.crowd.more * 3, 'a crowd');
  void SHOUT_TO;
});

test('6. what he sends out: crisp, no cyan, the enemy’s pink, nothing cut off, nothing after; the shout fills the square but one spot', () => {
  const W = 1300;
  const H = 760;
  const at: At = (x, y, z = 0) => [W / 2 + 32 * (x - y), H / 2 + 16 * (x + y) - z];
  const SQ: Square = { x0: -8, x1: 8, y0: -8, y1: 8 };
  const check = (name: string, paint: (p: Px) => void, empty = false, pinkToo = true): void => {
    const p = new Px(W, H);
    paint(p);
    const l = look(p);
    if (empty) {
      assert.equal(l.painted, 0, `${name}: nothing after`);
      return;
    }
    assert.ok(l.painted > 40, `${name}: painted (${l.painted})`);
    if (pinkToo) assert.ok(l.pink > 10, `${name}: the enemy's pink (${l.pink})`);
    assert.equal(l.odd, 0, `${name}: crisp`);
    assert.equal(l.cyan, null, `${name}: no cyan`);
    assert.ok(!l.edge, `${name}: nothing cut off`);
  };
  const C: [number, number] = [0, 3];
  const aim = -Math.PI / 2;
  for (const t of [0.5, SWING_HITS[0], 1.5, 2.6, SWING_HITS[2] + 0.1, SWING_HITS[2] + 0.5]) check(`swing ${t.toFixed(2)}`, (p) => paintSwing(p, at, t, C, aim), false, t < 2.9);
  check('swing after', (p) => paintSwing(p, at, SWING_HITS[2] + RING.out + RING.lie + 0.05, C, aim), true);
  for (const t of [SHOUT_HOLD[0] + 0.3, SHOUT_HIT - 0.1, SHOUT_HIT + 0.2, SHOUT_HIT + 0.6, SHOUT_HIT + 1.1]) check(`shout ${t.toFixed(2)}`, (p) => paintShout(p, at, t, C, aim, SQ), false, t < SHOUT_HIT + 0.4);
  check('shout after', (p) => paintShout(p, at, SHOUT_HIT + 1.5 + WALLS.dark + 0.5, C, aim, SQ), true);
  for (const t of [PROCLAIM_HOLD[0] + 0.3, PROCLAIM_HIT + 0.05, PROCLAIM_HIT + 0.2, PROCLAIM_HIT + 2, PROCLAIM_HIT + DECREE.out + 0.3]) {
    // (in the air, the lane still marked under it until it lands)
    check(`decree floor ${t.toFixed(2)}`, (p) => paintDecree(p, at, t, C, aim, 10.5, [0.9, 70], 'floor'), false, t < PROCLAIM_HIT + DECREE.out);
    if (t > PROCLAIM_HIT && t < PROCLAIM_HIT + DECREE.lands) check(`decree air ${t.toFixed(2)}`, (p) => paintDecree(p, at, t, C, aim, 10.5, [0.9, 70], 'air'), false, true);
  }
  check('decree after', (p) => paintDecree(p, at, PROCLAIM_HIT + DECREE.gone + 0.1, C, aim, 10.5, [0.9, 70], 'floor'), true);
  const spots: [number, number][] = [[-7.3, -2.5], [2.5, -7.3], [7.3, 3.5]];
  for (const t of [CROWD_HOLD[0] + 0.4, CROWD_HIT - 0.1, CROWD_HIT + 0.3, CROWD_HIT + 1.2]) check(`call ${t.toFixed(2)}`, (p) => paintCall(p, at, t, C, spots), false, t < CROWD_HIT + 1);
  check('call after', (p) => paintCall(p, at, CROWD_HIT + 4, C, spots), true);
  // THE SHOUT OFF THE WALLS FILLS THE SQUARE BUT ONE SPOT: every spot of the square (a tenth of a tile apart) is struck by a front
  // at some moment, but those in the one spot, which none reaches; the echoes come back off three walls, not the one at his back
  const w = { far: 11, back: 5, left: 8, right: 8 };
  const T = echoTimes(w);
  const last = Math.max(T.far[1], T.left[1], T.right[1]);
  let safe = 0;
  let missed = 0;
  for (let fwd = -w.back + 0.05; fwd < w.far; fwd += 0.1) {
    for (let left = -w.right + 0.05; left < w.left; left += 0.1) {
      let hit = false;
      for (let s = 0; s <= last + 0.05 && !hit; s += 1 / 60) hit = shoutStrikes(s, fwd, left, w);
      if (shoutSafe(fwd, left, w)) {
        assert.ok(!hit, `the one spot is struck at ${fwd.toFixed(2)}, ${left.toFixed(2)}`);
        safe++;
      } else if (!hit && !(Math.abs(left) < WALLS.side + WALLS.band && fwd < -WALLS.behind + WALLS.band)) missed++;
    }
  }
  assert.equal(missed, 0, 'every spot of the square but the one is struck');
  assert.ok(safe > 200 && safe < 0.05 * 16 * 16 * 100, `one spot, and small: ${(safe / 100).toFixed(1)} square tiles of 256`);
  assert.ok(T.far[0] > 0 && T.left[0] > 0 && last < 1.6, `the walls reached and the echoes back across in ${last.toFixed(2)} s`);
});
