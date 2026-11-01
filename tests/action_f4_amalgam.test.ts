// THE OSSUARY AMALGAMATION'S MOVES DONE THE ACTION WAY (src/art/amalgam_action.ts, AMALGAM_ACTION, off; on the floor
// src/art/amalgam_action_fx.ts; docs/mockups/action_f4_amalgam/README.md). The owner, 31 Oct 2026, offered the bone rain in place of
// the skull fan: “Let’s make the change plus add the action to all his moves cause he is not intimidating at all”; told every move
// would be redone the action way: “Just draw it”. Under his Movement 9 (“Like the wind up and wind down are big but the actual punch
// is lightning quick”) and his rule for the enemies (“Start from now on, but every enemy is going to need that change eventually.
// And bigger AOE to compensate for the extra time the player gets to evade”).
//   1. the switch off; nothing of the game imports the mock-up; its stand, crawl, setting off and stopping, struck, death and
//      bursting are the game's own; the game's own moves kept (the skull swarm in the game's set, out of this one's);
//   2. every frame of the four new moves, from in front and from behind: painted, the enemy's pink edge, crisp, no cyan, nothing
//      cut off;
//   3. THE WHOLE BOSSES' REVIEW (art/boss_checks.ts checkBoss), every frame of every move of it, both ways round, each blow of each
//      combo its own, with every handing over (from its stand at every frame into each move and back; into its crawl and out):
//      nothing;
//   4. Movement 9 and its looming: each blow held before it, struck in two frames, smeared then and only then; reared to twice
//      its height; its areas bigger than its old moves';
//   5. the floor: the bone rain (its lattice, its waves, its gaps, its shadows, bursts and piles), the bigger arms, the slam's
//      ring: crisp, no cyan, nothing cut off, the enemy's pink, nothing after.
// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';

import {
  AMALGAM_ACTION, AM_ACT_STRIKES, ARMS_HIT, ARMS_STRIKE, DEVOUR_HITS, DEVOUR_STRIKES, RAIN_HIT, RAIN_STRIKE, REAR, SWIPE_HITS, SWIPE_STRIKES,
  amActionShape, amSmeared, amalgamActionMob, handAt, heightAt, makeAmalgamActionArt,
} from '../src/art/amalgam_action';
import {
  ARMS, BIG_ARM_CANVAS, BIG_ARM_FPS, BIG_ARM_FRAMES, DROP_CANVAS, RAIN, RAIN_SKULL_FRAMES, SLAM_RING, bigArmsPainted, dropAt, dropPainted, pileSlows, rainDrops, rainSkullPainted, rainStrikes, slamRingCanvas, slamRingPainted,
} from '../src/art/amalgam_action_fx';
import { AMALGAM, AM_DEVOUR_HIT, AM_SLAM_HIT, AM_SWARM_HIT, AM_SWIPE_HIT, amGeometry } from '../src/art/bosses3';
import { AMALGAM as RULES } from '../src/game/bosses';
import { checkBoss, findingsSaid } from '../src/art/boss_checks';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { paintMob, posedOfMob, skeletonAt } from '../src/art/new_mobs3';
import { project } from '../src/art/skeleton';
import { rgba } from '../src/engine/px';
import type { Px } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

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
const NEW = ['attack', 'rain', 'floorArms', 'devour'] as const;
const moveOf = (name: string) => {
  const mob = amalgamActionMob();
  return name === 'attack' ? mob.attack : mob.more![name];
};
const longOf = (name: string): number => {
  const k = moveOf(name).motion.keys;
  return k[k.length - 1].at;
};

test('1. the switch is off, nothing of the game imports the mock-up, the rest of it is the game’s own and the game’s moves are kept', () => {
  assert.equal(AMALGAM_ACTION.on, false, 'AMALGAM_ACTION is off');
  const mock = ['art/amalgam_action.ts', 'art/amalgam_action_fx.ts'];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/') || mock.includes(f)) continue;
    assert.ok(!/from ['"][^'"]*(amalgam_action|amalgam_action_fx|action_f4_amalgam_scene)['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the mock-up`);
  }
  const mob = amalgamActionMob();
  for (const m of ['stand', 'walk', 'reel', 'dying'] as const) assert.ok(mob[m] === AMALGAM[m], `its ${m} is the game's own`);
  for (const m of ['setOff', 'halt', 'burst']) assert.ok(mob.more?.[m] === AMALGAM.more?.[m], `its ${m} is the game's own`);
  assert.ok(mob.attack !== AMALGAM.attack && mob.bits !== AMALGAM.bits, 'its swipe is the new one');
  assert.ok(!mob.more?.swarm && !!mob.more?.rain, 'the bone rain in place of the skull swarm');
  // (the game's own, kept as they were)
  assert.equal(AMALGAM.attack.motion.hit, AM_SWIPE_HIT);
  assert.equal(AMALGAM.more?.swarm.motion.hit, AM_SWARM_HIT);
  assert.equal(AMALGAM.more?.floorArms.motion.hit, AM_SLAM_HIT);
  assert.equal(AMALGAM.more?.devour.motion.hit, AM_DEVOUR_HIT);
  // (none of the game's moves rears it: the two fields that do are 0 in every frame of them)
  for (const m of ['stand', 'walk', 'attack', 'reel', 'dying', ...Object.keys(AMALGAM.more ?? {})]) {
    for (let t = 0; t <= 3; t += 0.1) {
      const q = posedOfMob(AMALGAM, m, t);
      assert.ok(q.faceUp === 0 && q.faceTilt === 0, `the game's ${m} at ${t.toFixed(1)} s is not reared`);
    }
  }
  const art = makeAmalgamActionArt();
  assert.ok(art.front.clips?.moves?.rain && art.back.clips?.moves?.devour && !art.front.clips?.moves?.swarm, 'as the game holds a monster');
});

test('2. every frame of its four new moves paints, wears the pink edge, is crisp, has no cyan, nothing cut off', () => {
  const mob = amalgamActionMob();
  for (const v of ['front', 'back'] as const) {
    for (const name of NEW) {
      const n = Math.round(longOf(name) * 30);
      for (let i = 0; i <= n; i++) {
        const p = paintMob(mob, name, i / 30, v);
        const l = look(p.px, p.lights);
        assert.ok(l.painted > 2500, `${v} ${name} ${i}: only ${l.painted} pixels`);
        assert.ok(l.rim > 60, `${v} ${name} ${i}: the pink edge (${l.rim})`);
        assert.equal(l.odd, 0, `${v} ${name} ${i}: pixels neither see-through nor whole`);
        assert.equal(l.cyan, null, `${v} ${name} ${i}: a friend's colour`);
        assert.ok(!l.edge, `${v} ${name} ${i}: cut off at the canvas's edge`);
      }
    }
  }
});

test('3. THE WHOLE BOSSES’ REVIEW: every frame of every move of it, both ways round, every handing over: nothing found', () => {
  const mob = amalgamActionMob();
  const shape = amActionShape(mob);
  assert.equal(shape.blows?.attack?.length, 3, 'the swipe: three blows');
  assert.equal(shape.blows?.devour?.length, 2, 'the devour: the rake and the bite');
  for (const m of NEW) assert.ok(shape.handovers?.some((h) => h.from === 'stand' && h.to === m) && shape.handovers?.some((h) => h.from === m && h.to === 'stand'), `from its stand into ${m} and back`);
  assert.ok(shape.handovers?.some((h) => h.from === 'walk' && h.to === 'halt') && shape.handovers?.some((h) => h.from === 'setOff' && h.to === 'walk'), 'into its crawl and out');
  const found = checkBoss(mob, shape);
  assert.equal(found.length, 0, findingsSaid(found).slice(0, 12).join('; '));
});

test('4. Movement 9, and it looms: each blow held, struck in two frames, smeared then only; reared to twice its height; bigger areas', () => {
  const mob = amalgamActionMob();
  const shape = amActionShape(mob);
  const seen = (p: readonly number[]): [number, number] => {
    const r = project(p as [number, number, number], 'front');
    return [r[0] / 2, r[1] / 2];
  };
  const tipOf = (move: string, t: number) => shape.tip?.(move, t, skeletonAt(mob, move, t), posedOfMob(mob, move, t)) ?? null;
  for (const [move, strikes] of Object.entries(AM_ACT_STRIKES)) {
    for (const { s: [s0, s1] } of strikes) {
      assert.equal(Math.round((s1 - s0) * 30), 2, `${move}: a strike of two frames`);
      let most = 0;
      for (let f = Math.round(s0 * 30) - 8; f < Math.round(s0 * 30) - 2; f++) {
        const a = tipOf(move, f / 30);
        const b = tipOf(move, (f + 1) / 30);
        if (a && b) most = Math.max(most, Math.hypot(seen(b)[0] - seen(a)[0], seen(b)[1] - seen(a)[1]));
      }
      const a = tipOf(move, s0);
      const b = tipOf(move, s1);
      const flash = a && b ? Math.hypot(seen(b)[0] - seen(a)[0], seen(b)[1] - seen(a)[1]) / 2 : 0;
      assert.ok(most < 3, `${move} at ${s0.toFixed(2)} s: held before it (${most.toFixed(1)} game pixels a frame at most)`);
      assert.ok(flash > 4 * most && flash > 5, `${move} at ${s0.toFixed(2)} s: struck in a flash (${flash.toFixed(1)} a frame)`);
      for (const f of [1, 2, 3]) assert.ok(amSmeared(move, s0 + f / 30), `${move}: smeared ${f} frames on`);
      assert.ok(!amSmeared(move, s0) && !amSmeared(move, s0 - 1 / 30), `${move}: not smeared before it`);
      if (strikes.find((x) => x.s[0] === s0)?.hands.length) {
        assert.ok(Object.keys(moveOf(move).ropes!(s0 + 1 / 30)).some((k) => k.startsWith('smear')), `${move}: its after-images there`);
        assert.ok(!Object.keys(moveOf(move).ropes!(s0 - 0.2)).some((k) => k.startsWith('smear')), `${move}: none before`);
      }
    }
  }
  assert.ok(SWIPE_HITS.every((h, i) => h === SWIPE_STRIKES[i][1]) && RAIN_HIT === RAIN_STRIKE[1] && ARMS_HIT === ARMS_STRIKE[1] && DEVOUR_HITS.every((h, i) => h === DEVOUR_STRIKES[i][1]), 'each blow lands on the last frame of its strike');
  // IT LOOMS: at rest its heap is 47 of its lengths high; reared before each big move, near twice that (the game's own rear: 65)
  const rest = Math.max(...amGeometry(skeletonAt(AMALGAM, 'stand', 0), posedOfMob(AMALGAM, 'stand', 0)).frame.lumps.map((L) => L.c[2] + L.r[2]));
  for (const [m, f] of [['attack', 84], ['rain', 35], ['floorArms', 30]] as const) {
    const h = heightAt(m, f / 30);
    assert.ok(h.heap > 1.9 * rest && h.heap > 90, `${m}: reared ${h.heap.toFixed(0)} high (at rest ${rest.toFixed(0)})`);
    assert.ok(h.claws > 70, `${m}: its claws raised ${h.claws.toFixed(0)} high`);
  }
  assert.ok(heightAt('devour', 28 / 30).heap > 1.6 * rest, 'reared for the devour too');
  assert.ok(REAR.lift === 14 && REAR.tilt === 22, 'its rear, as the README says');
  // ITS AREAS: the rakes' claws out near two tiles from its middle, across its front; the finisher's ring; more and bigger arms;
  // the devour's cone further and its drag faster (the game's: swipe 2.45, five arms 0.62 round to 2.8 tiles, cone 3.6 at 3.1 a second)
  let rake = 0;
  for (const [n, s] of [['R1', SWIPE_STRIKES[0]], ['L1', SWIPE_STRIKES[1]]] as const) for (let t = s[0]; t <= s[1] + 1e-9; t += 1 / 120) rake = Math.max(rake, Math.hypot(...handAt('attack', n, t).slice(0, 2) as [number, number]));
  assert.ok(rake > 1.8, `the rakes' hands ${rake.toFixed(2)} tiles out`);
  assert.ok(SLAM_RING.ahead + SLAM_RING.finisher > RULES.swipe.reach + 1.5, 'the finisher reaches far past the old swipe');
  assert.ok(ARMS.n > RULES.arms.n && ARMS.r > RULES.arms.r && ARMS.far > RULES.arms.far && ARMS.warn >= RULES.arms.warn, 'more arms, bigger, further, warned as long or longer');
  const [r1, l1] = [handAt('devour', 'R1', DEVOUR_HITS[0]), handAt('devour', 'L1', DEVOUR_HITS[0])];
  assert.ok(r1[0] > 1.9 && l1[0] > 1.9 && r1[2] > 0.6 && l1[2] > 0.6, 'the rake: its claws in the floor two tiles out (not gripping: raked)');
});

test('5. the floor: the bone rain, the bigger arms, the slam’s ring', () => {
  // THE RAIN: the whole floor, three waves, every third point of the lattice each; gaps; none near it nor the wall
  const drops = rainDrops({ rx: 8.5, ry: 10 }, [0, 0]);
  assert.ok(drops.length >= 50, `${drops.length} skulls over the floor`);
  for (const w of [0, 1, 2]) {
    const ws = drops.filter((d) => d.wave === w);
    assert.ok(ws.length >= 15, `wave ${w}: ${ws.length} skulls`);
    for (const a of ws) for (const b of ws) if (a !== b) assert.ok(Math.hypot(a.at[0] - b.at[0], a.at[1] - b.at[1]) > 2 * RAIN.r + 1.2, `wave ${w}: room between its skulls`);
    assert.ok(ws.every((d) => d.leave >= RAIN.first + RAIN.gap * w && d.leave <= RAIN.first + RAIN.gap * w + RAIN.ripple && Math.abs(d.land - d.leave - RAIN.fly) < 1e-9), `wave ${w}: its times`);
  }
  assert.ok(drops.every((d) => Math.hypot(d.at[0], d.at[1]) >= RAIN.clear && Math.hypot(d.at[0] / 8.5, d.at[1] / 10) < 1), 'none on it, none past the wall');
  // (anywhere on the floor a skull comes down within the lattice's reach: the whole floor)
  for (let x = -6; x <= 6; x += 1.5) for (let y = -7; y <= 7; y += 1.5) if (Math.hypot(x, y) > 2.5 && Math.hypot(x / 8.5, y / 10) < 0.75) assert.ok(drops.some((d) => Math.hypot(d.at[0] - x, d.at[1] - y) < RAIN.spacing), `the rain comes down near (${x}, ${y})`);
  assert.ok(rainStrikes(0.8, 0.3) && !rainStrikes(1.0, 0.3) && pileSlows(0.5, 0.4, 3) && !pileSlows(0.5, 0.4, RAIN.pile.lie + 0.01) && !pileSlows(0.9, 0, 1), 'what it strikes, what slows');
  // (each falls from its niche on the wall and comes down on its spot)
  for (const d of drops.slice(0, 8)) {
    const a = dropAt(d, 0);
    const b = dropAt(d, 1);
    assert.ok(Math.hypot(a[0] / 8.5, a[1] / 10) > 0.95 && a[2] > 30, 'out of a niche on the wall');
    assert.ok(Math.hypot(b[0] - d.at[0], b[1] - d.at[1]) < 1e-6 && b[2] < 1e-6, 'down on its spot');
    assert.ok(dropAt(d, 0.5)[2] > 60, 'high over the floor on its way');
  }
  for (const v of ['front', 'back'] as const) {
    for (let i = 0; i < RAIN_SKULL_FRAMES; i++) {
      const p = rainSkullPainted(i / RAIN_SKULL_FRAMES, v);
      const l = look(p.px, p.lights);
      assert.ok(l.painted > 150 && l.rim > 20 && l.odd === 0 && !l.cyan && !l.edge, `a falling skull ${v} ${i}`);
    }
  }
  let pink = false;
  for (let t = -RAIN.fly; t <= RAIN.pile.lie + RAIN.pile.crumble; t += t < 1 || t > RAIN.pile.lie - 0.1 ? 1 / 30 : 0.5) {
    for (const layer of ['floor', 'air'] as const) {
      const p = dropPainted(t, layer, 5);
      assert.ok(p.px.w === DROP_CANVAS.w && p.px.h === DROP_CANVAS.h);
      const l = look(p.px, p.lights);
      assert.equal(l.odd, 0, `the drop at ${t.toFixed(2)} ${layer}: crisp`);
      assert.equal(l.cyan, null, `the drop at ${t.toFixed(2)} ${layer}: no cyan`);
      assert.ok(!l.edge, `the drop at ${t.toFixed(2)} ${layer}: cut off`);
      if (layer === 'floor' && t < 0 && t > -0.3 && [...l.colours].some((c) => c === rgba('#e0287a').slice(0, 3).join(',') || c === rgba('#ff7aa8').slice(0, 3).join(','))) pink = true;
    }
  }
  assert.ok(pink, 'its reach ringed in the enemy’s pink before it lands');
  assert.ok(look(dropPainted(-0.1, 'floor', 5).px).painted > look(dropPainted(-0.9, 'floor', 5).px).painted, 'its shadow grows as it comes down');
  assert.ok(look(dropPainted(3, 'floor', 5).px).painted > 120, 'the pile lies there');
  assert.equal(look(dropPainted(RAIN.pile.lie + RAIN.pile.crumble + 0.05, 'floor', 5).px).painted, 0, 'nothing after');
  // THE ARMS: bigger than the game's, crisp, the pink edge while up
  for (const v of ['front', 'back'] as const) {
    for (let i = 0; i < BIG_ARM_FRAMES; i++) {
      const p = bigArmsPainted(i / BIG_ARM_FPS, v);
      assert.ok(p.px.w === BIG_ARM_CANVAS.w);
      const l = look(p.px, p.lights);
      assert.ok(l.odd === 0 && !l.cyan && !l.edge, `the arms ${v} ${i}: crisp, no cyan, whole`);
      if (i >= 2 && i <= 9) assert.ok(l.painted > 900 && l.rim > 40, `the arms ${v} ${i}: up, big (${l.painted})`);
    }
  }
  // THE RING where its weight lands
  for (const r of [SLAM_RING.finisher, SLAM_RING.rain, SLAM_RING.arms]) {
    const C = slamRingCanvas(r);
    for (let t = 0; t <= SLAM_RING.long; t += 1 / 15) {
      for (const layer of ['floor', 'air'] as const) {
        const p = slamRingPainted(t, layer, r);
        const l = look(p.px, p.lights);
        assert.ok(p.px.w === C.w && l.odd === 0 && !l.cyan && !l.edge, `ring ${r} at ${t.toFixed(2)} ${layer}`);
      }
    }
    assert.equal(look(slamRingPainted(SLAM_RING.long + 0.05, 'floor', r).px).painted, 0, 'nothing after');
  }
});
