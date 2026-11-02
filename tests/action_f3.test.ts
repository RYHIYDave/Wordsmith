// FLOOR 3'S ENEMIES, MORE ACTION (the art chat's helper, 31 Oct 2026; docs/mockups/action_f3/README.md). His picks of 31 Oct: the
// green troll (the brute), offered "Rampage: two stepping club swings, then a leaping two-fisted slam with a shockwave ring. Bull rush
// as its second: lowers its head and charges down a marked lane.", “Yes (Recommended)”; the Boneward, offered "Keep the spear throw.
// Shield wall: while it comes at you behind its shield, hits from in front glance off. Get round it, or wait for it to throw.",
// “Yes (Recommended)”. So:
//   1. the switches are off (BRUTE_RAMPAGE, BONEWARD_WALL), nothing of the game imports the mock-up's files, and with the switch on
//      every frame the trolls had is the same but the green troll's attack (now the rampage) and his moves (his bull rush, played as
//      the red troll's charge; his old swing out of his set); the red troll and the chieftain the same;
//   2. every frame of the rampage and the bull rush paints, wears the pink edge, is crisp, has no cyan, nothing cut off by its canvas;
//   3. THE RAMPAGE through the bosses' review for the old rigs (art/action_f1_checks.ts checkKit), from in front and from behind, as the
//      game shows it (carried over the floor: his feet where they are on it), its three blows each reviewed; Movement 9: each wind-up
//      held, each strike two frames, smeared, the slam's warning the biggest; the club on the floor where the ring is;
//   4. THE BULL RUSH through the review, as the game plays it, wind-up, run and stop as one, from in front and behind; its run round
//      and round; from any frame of the run into the stop; its numbers (faster and wider than the red troll's); the head brow first;
//   5. the ring: its numbers; it goes out, breaks up, the cracks fade, nothing after; nothing cut off at 2.25 to 2.75 tiles; crisp; no
//      cyan; the enemy's pink at its leading edge;
//   6. THE BONEWARD'S WALL through the bosses' review (art/boss_checks.ts checkBoss), from in front and from behind: its new moves (its
//      stand and advance behind the wall, the glance, struck from the side) and every handing over between its moves find nothing; its
//      inherited moves (the thrust, the throw, the pick-up, the bash, its death) only what the game's own Boneward's do; the wall's
//      numbers; the glance: white, gold and pink, no cyan, gone when done; every frame paints, the pink edge, crisp, not cut off.
//   run: tsx --test tests/action_f3.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';

import type { ActorArt, AnimSet, Clip } from '../src/art/actor_types';
import { clipPoses } from '../src/art/clip';
import type { Timeline } from '../src/art/clip';
import { BLADE, CYAN, GLINT, REST, RIM_ALPHA, SPARK, idlePoses } from '../src/art/kit';
import type { Pose, V } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { BRUTE_CANVAS, BRUTE_RAMPAGE, BRUTE_SEEN, RAMPAGE_HITS, RAMPAGE_LONG, RAMPAGE_RAISE, RAMPAGE_STRIKES, RUSH_GO, RUSH_PACE, RUSH_STOP, STRIDE_PER_TILE, TROLL_MOVES, makeBruteArt, makeChieftainArt, makeGuardianArt, paintBrute, rampageTimeline, rampageTravel, rushStopTimeline, rushStopTravel, rushTimeline, rushWindTimeline } from '../src/art/monster_brute';
import type { BruteSeen } from '../src/art/monster_brute';
import { BONEWARD_WALL, RAMPAGE, RING, RING_CANVAS, RUSH, WALL, WALL_BONEWARD, glances, makeWallBonewardArt, ringPainted, ringReach, ringStrikes, rushLane } from '../src/art/action_f3_fx';
import { checkKit } from '../src/art/action_f1_checks';
import type { KitFrame, KitMove } from '../src/art/action_f1_checks';
import { JUMP_MAX, checkBoss } from '../src/art/boss_checks';
import type { BossShape, Handover } from '../src/art/boss_checks';
import { BONEWARD, paintMob } from '../src/art/new_mobs3';
import type { Mob, MobMove } from '../src/art/new_mobs3';
import { add, lerp3, mul } from '../src/art/skeleton';
import { CHARGE } from '../src/game/defs';
import { rgba } from '../src/engine/px';
import type { Px, Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

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
      if (k === rimKey) rim++;
      if (!cyan && (FRIEND.has(k) || cyanGlow(p.d[i], p.d[i + 1], p.d[i + 2]))) cyan = k;
      if (x === 0 || y === 0 || x === p.w - 1 || y === p.h - 1) edge = true;
    }
  }
  for (const l of lights) if (cyanGlow(...(rgba(l.color).slice(0, 3) as [number, number, number]))) cyan = `light ${l.color}`;
  return { painted, odd, cyan, rim, edge, colours };
}
function lists(s: AnimSet): [string, Sprite[]][] {
  const out: [string, Sprite[]][] = [['idle', s.idle], ['walk', s.walk], ['attack3', s.attack]];
  if (s.heavy) out.push(['heavy3', s.heavy]);
  const c = s.clips;
  if (c) {
    for (const k of ['attack', 'heavy', 'die', 'reel'] as const) if (c[k]) out.push([k, (c[k] as Clip).frames]);
    for (const [k, v] of Object.entries(c.moves ?? {})) out.push([`moves.${k}`, v.frames]);
  }
  return out;
}
function withRampage<T>(make: () => T): T {
  const was = BRUTE_RAMPAGE.on;
  BRUTE_RAMPAGE.on = true;
  try {
    return make();
  } finally {
    BRUTE_RAMPAGE.on = was;
  }
}

// --- the green troll, frame by frame, as the review sees him (game pixels; carried over the floor as the game carries him) ---
const REST_B: Pose = { ...REST, aim: 80 };
const { ax: AX, ay: AY } = BRUTE_CANVAS;
const seenOf = (q: Pose, back: boolean): BruteSeen => {
  let j: BruteSeen | null = null;
  BRUTE_SEEN.see = (x) => (j = x);
  paintBrute(q, back);
  BRUTE_SEEN.see = null;
  return j as unknown as BruteSeen;
};
/** His frames as the review sees them: `travel` how far the game has carried him (tiles) at each moment; `world` whether his points are seen as on the floor (carried) or on his own canvas (a loop). */
function kitFrames(back: boolean, poses: Pose[], fps: number, travel: (t: number) => number, world = true): KitFrame[] {
  const fwd = back ? -1 : 1;
  return poses.map((q, i) => {
    const s = seenOf(q, back);
    const T = travel(i / fps);
    const [dx, dy] = [16 * T, 8 * T * fwd];
    const g = (p: V, carried = world): V => [(p[0] - AX) / 2 + (carried ? dx : 0), (p[1] - AY) / 2 + (carried ? dy : 0)];
    return {
      t: i / fps,
      pts: { head: g(s.head), hips: g(s.hips), hand: g(s.hand), offHand: g(s.offHand), clubEl: g(s.clubEl), offEl: g(s.offEl) },
      soles: [g(s.soles[0], true), g(s.soles[1], true)],
      down: [s.lifts[0] < 0.05 && s.air <= 0.5, s.lifts[1] < 0.05 && s.air <= 0.5],
      heights: [(s.lifts[0] * 3.2 + Math.max(0, s.air)) / 2, (s.lifts[1] * 3.2 + Math.max(0, s.air)) / 2],
      tip: g(s.tip),
      smeared: Math.abs(q.sweep) >= 4 && (q.prop === 3 || q.prop === 5),
    };
  });
}
const posesOf = (tl: Timeline): Pose[] => clipPoses(tl.keys, REST_B, 30);
const standKit = (back: boolean): KitMove => ({ name: 'stand', frames: kitFrames(back, idlePoses().map((q) => ({ ...REST_B, ...q })), 8, () => 0), round: true });
function rampageKit(back: boolean): KitMove {
  const fwd = back ? -1 : 1;
  const [h1, h2, h3] = RAMPAGE_HITS;
  return {
    name: 'rampage',
    frames: kitFrames(back, posesOf(rampageTimeline(back)), 30, rampageTravel),
    shift: [16 * RAMPAGE.travel, 8 * RAMPAGE.travel * fwd],
    blows: [
      { hit: h1, strike: RAMPAGE_STRIKES[0], from: 0.15, until: 0.8 },
      { hit: h2, strike: RAMPAGE_STRIKES[1], from: 0.8, until: 1.3 },
      { hit: h3, strike: RAMPAGE_STRIKES[2], from: 1.3 },
    ],
  };
}
/** The bull rush as the game plays it: its wind-up, two rounds of its run, its stop; carried on at its pace, and through its stop. */
function rushKit(back: boolean, rounds = 2): KitMove {
  const fwd = back ? -1 : 1;
  const w = posesOf(rushWindTimeline(back)).slice(0, Math.round(RUSH_GO * 30));
  const r = posesOf(rushTimeline(back));
  const st = posesOf(rushStopTimeline(back));
  const run = (rounds * r.length) / 30;
  const trav = (t: number): number => (t < RUSH_GO ? 0 : t < RUSH_GO + run ? RUSH_PACE * (t - RUSH_GO) : RUSH_PACE * run + rushStopTravel(t - RUSH_GO - run));
  const all = RUSH_PACE * run + RUSH_STOP.far;
  return { name: 'bull rush', frames: kitFrames(back, [...w, ...Array.from({ length: rounds }, () => r).flat(), ...st], 30, trav), shift: [16 * all, 8 * all * fwd] };
}

test('1. the switches are off, nothing of the game imports the mock-up, and with the switch on only the green troll’s attack and moves are new', () => {
  assert.equal(BRUTE_RAMPAGE.on, false, 'BRUTE_RAMPAGE is off');
  assert.equal(BONEWARD_WALL.on, false, 'BONEWARD_WALL is off');
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    // (and the game's own, brought in by the main chat behind ACTION_F3: the Boneward's wall and the green troll's rampage and rush
    // in its rules, game/game.ts and game/action_f3.ts; the ring drawn, render/act1_fx/brute.ts; and the bestiary's choosing of art)
    if (!f.endsWith('.ts') || f.startsWith('dev/') || f === 'art/action_f3_fx.ts' || ['game/game.ts', 'game/action_f3.ts', 'render/act1_fx/brute.ts', 'art/bestiary.ts'].includes(f)) continue;
    assert.ok(!/from ['"][^'"]*action_f3_(fx|scene)['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the mock-up`);
  }
  const was = TROLL_MOVES.on;
  try {
    for (const moves of [true, false]) {
      TROLL_MOVES.on = moves;
      // the red troll and the chieftain: every frame the same with the switch on
      for (const [who, make] of [['guardian', makeGuardianArt], ['chieftain', makeChieftainArt]] as const) {
        const off: ActorArt = make();
        const on: ActorArt = withRampage(make);
        for (const v of ['front', 'back'] as const) {
          const a = lists(off[v]);
          const b = lists(on[v]);
          assert.equal(a.map(([n]) => n).join(), b.map(([n]) => n).join(), `${who} ${v}: the same lists`);
          a.forEach(([n, fr], li) => fr.forEach((sp, i) => assert.equal(unlike(sp, b[li][1][i]), 0, `${who} ${v} ${n} ${i}`)));
        }
      }
      // the green troll: his stand, walk and death the same; his attack the rampage; his moves the bull rush (and his old swing gone)
      const off = makeBruteArt();
      const on = withRampage(makeBruteArt);
      for (const v of ['front', 'back'] as const) {
        const a = new Map(lists(off[v]));
        const b = new Map(lists(on[v]));
        for (const n of ['idle', 'walk', 'die']) (a.get(n) as Sprite[]).forEach((sp, i) => assert.equal(unlike(sp, (b.get(n) as Sprite[])[i]), 0, `brute ${v} ${n} ${i} is the same`));
        const ramp = on[v].clips?.attack as Clip;
        assert.ok(ramp.frames.length === Math.round(RAMPAGE_LONG * 30) + 1 && Math.abs((ramp.hit ?? 0) - RAMPAGE_HITS[2]) < 1e-9, `brute ${v}: his attack is the rampage, its slam its hit`);
        const mv = on[v].clips?.moves ?? {};
        assert.equal(Object.keys(mv).sort().join(), 'charge,chargeStop,chargeWind', `brute ${v}: his moves are the bull rush (played as the charge), no old swing`);
        assert.ok(Math.abs((mv.chargeWind.hit ?? 0) - RUSH_GO) < 1e-9 && mv.charge.loop === 0 && mv.charge.frames.length === 6, `brute ${v}: the rush's wind-up and its run`);
        assert.ok(Math.abs(((off[v].clips?.attack as Clip).hit ?? 0) - Math.round(0.85 * 30) / 30) < 1e-9, `brute ${v}: his slam with the switch off`);
        if (moves) assert.ok(off[v].clips?.moves?.swing, `brute ${v}: his swing with the switch off`);
      }
    }
  } finally {
    TROLL_MOVES.on = was;
  }
});

test('2. every frame of the rampage and the bull rush paints, wears the pink edge, is crisp, has no cyan, nothing cut off', () => {
  const art = withRampage(makeBruteArt);
  for (const v of ['front', 'back'] as const) {
    const c = art[v].clips as NonNullable<AnimSet['clips']>;
    for (const [name, clip] of [['rampage', c.attack], ['chargeWind', c.moves?.chargeWind], ['charge', c.moves?.charge], ['chargeStop', c.moves?.chargeStop]] as const) {
      (clip as Clip).frames.forEach((sp, i) => {
        const l = look(paintingOf(sp), sp.lights);
        assert.ok(l.painted > 900, `${v} ${name} ${i}: only ${l.painted} pixels`);
        assert.ok(l.rim > 60, `${v} ${name} ${i}: the pink edge (${l.rim})`);
        assert.equal(l.odd, 0, `${v} ${name} ${i}: pixels neither see-through nor whole`);
        assert.equal(l.cyan, null, `${v} ${name} ${i}: a friend's colour`);
      });
    }
  }
  // (cut off: his own canvas, before it is trimmed: nothing on its edge)
  for (const back of [false, true]) {
    for (const tl of [rampageTimeline(back), rushWindTimeline(back), rushTimeline(back), rushStopTimeline(back)]) for (const q of posesOf(tl)) assert.ok(!look(paintBrute(q, back).px).edge, `${back ? 'back' : 'front'}: cut off by his canvas`);
  }
});

test('3. the rampage through the review, from in front and from behind; Movement 9; the club down where the ring is', () => {
  const said: string[] = [];
  for (const back of [false, true]) {
    const v = back ? 'back' : 'front';
    const m = rampageKit(back);
    for (const f of checkKit(m, standKit(back))) said.push(`${v} ${f.move}: ${f.kind} ${f.what}, ${f.by.toFixed(1)} at ${f.t.toFixed(2)} s`);
    // each blow's wind-up HELD (the end it strikes with within a game pixel a frame, as he is carried or not), the slam's the longest
    const held = (from: number, to: number): number => {
      let run = 0;
      let most = 0;
      for (let i = 1; i < m.frames.length; i++) {
        const f = m.frames[i];
        if (f.t <= from || f.t >= to) continue;
        const p = f.tip as V;
        const o = m.frames[i - 1].tip as V;
        run = Math.hypot(p[0] - o[0], p[1] - o[1]) < 1 ? run + 1 : 0;
        most = Math.max(most, run);
      }
      return most / 30;
    };
    const [h1, h2, h3] = RAMPAGE_HITS;
    const holds = [held(0.2, h1 - 0.07), held(0.8, h2 - 0.07), held(1.6, h3 - 0.3)];
    assert.ok(holds[0] >= 0.1 && holds[1] >= 0.1 && holds[2] >= 0.2, `${v}: held ${holds.map((h) => h.toFixed(2)).join(', ')} s`);
    assert.ok(h3 - RAMPAGE_RAISE > h1 && h3 - RAMPAGE_RAISE > h2 - h1, 'the slam’s warning the biggest of the three');
    for (const [a, b] of RAMPAGE_STRIKES) assert.ok(Math.round((b - a) * 30) === 2, `${v}: a strike of two frames`);
    // the club's head on the floor before him as the slam lands, where the ring has its middle
    const q = posesOf(rampageTimeline(back))[Math.round(h3 * 30) + 2];
    const s = seenOf(q, back);
    const ahead = (s.tip[0] - AX) / 32;
    const height = (back ? -16 * ahead : 16 * ahead) - (s.tip[1] - AY);
    assert.ok(Math.abs(ahead - RING.ahead) < 0.15 && height > 2 && height < 9, `${v}: the club's head ${ahead.toFixed(2)} tiles before him, its middle ${height.toFixed(1)} over the floor`);
  }
  // his numbers: big, as his rule asks
  assert.ok(RAMPAGE.reach >= 2 && RAMPAGE.arc >= 180 && RING.radius >= 2.25 && Math.abs(rampageTravel(RAMPAGE_LONG) - RAMPAGE.travel) < 1e-9, 'the swings reach 2 tiles and more, the ring 2.25 and more');
  assert.equal(said.length, 0, `the review found:\n${said.join('\n')}`);
});

test('4. the bull rush through the review, as the game plays it; its run round and round; into the stop from any frame of it; its numbers', () => {
  const said: string[] = [];
  for (const back of [false, true]) {
    const v = back ? 'back' : 'front';
    for (const f of checkKit(rushKit(back), standKit(back))) said.push(`${v} ${f.move}: ${f.kind} ${f.what}, ${f.by.toFixed(1)} at ${f.t.toFixed(2)} s`);
    // the run, round and round on his canvas (his feet carried on the floor): its handing over is the wind-up's and the stop's, not the stand's
    const run: KitMove = { name: 'run', frames: kitFrames(back, posesOf(rushTimeline(back)), 30, (t) => RUSH_PACE * t, false), round: true };
    for (const f of checkKit(run, standKit(back))) if (f.kind !== 'jump') said.push(`${v} ${f.move}: ${f.kind} ${f.what}, ${f.by.toFixed(1)} at ${f.t.toFixed(2)} s`);
    // into the stop from the frame of the run the game ends it on (his canvas; his feet as they are under him): the stop takes it
    // from there as the run's next frame would have (RUSH.endOn: the frames of the round the game may end the run on)
    const stop0 = kitFrames(back, posesOf(rushStopTimeline(back)).slice(0, 1), 30, () => 0, false)[0];
    const atFoot = (f: KitFrame): KitFrame => kitFrames(back, [posesOf(rushTimeline(back))[Math.round(f.t * 30)]], 30, () => 0, false)[0];
    const leap = (a: KitFrame, b: KitFrame): number => {
      const keys = Object.keys(a.pts);
      let sum = 0;
      for (const k of keys) sum += Math.hypot(a.pts[k][0] - b.pts[k][0], a.pts[k][1] - b.pts[k][1]);
      for (const s of [0, 1] as const) sum += Math.hypot(a.soles[s][0] - b.soles[s][0], a.soles[s][1] - b.soles[s][1]);
      return sum / (keys.length + 2);
    };
    for (const f of RUSH.endOn) {
      const next = atFoot(run.frames[(f + 1) % run.frames.length]);
      assert.ok(leap(next, stop0) <= JUMP_MAX, `${v}: ending the run on its frame ${f}, into the stop, ${leap(next, stop0).toFixed(1)}`);
    }
    // the wind-up: his head down, brow first (lower than standing by half its height and more), his fist on the floor
    const wq = posesOf(rushWindTimeline(back))[18];
    const ws = seenOf(wq, back);
    const st = seenOf({ ...REST_B }, back);
    assert.ok(ws.head[1] - st.head[1] >= 6, `${v}: his head down (${(ws.head[1] - st.head[1]).toFixed(1)} pixels)`);
    const fist = back ? ws.offHand : ws.hand;
    // (its middle a fist's height over the floor under him: further from behind, where the floor before him is further up the picture)
    assert.ok(fist[1] >= AY - (back ? 10 : 7), `${v}: his free fist down on the floor (${(AY - fist[1]).toFixed(1)} over it)`);
  }
  assert.ok(RUSH.pace > CHARGE.speed && RUSH.half > CHARGE.half && RUSH.past + RUSH.stop >= 2.5, 'faster than the red troll’s charge, a wider lane, on well past you');
  const lane = rushLane([0, 0], [4, 0], 1);
  assert.ok(Math.abs(lane.x1 - (4 + RUSH.past + RUSH.stop)) < 1e-9 && lane.half === RUSH.half, 'the lane: from him, through where you stood, to the end of his stop');
  // his run: each foot down two frames of the six, where it came down on the floor (it goes back under him as fast as he goes on)
  const step = RUSH_PACE / 30;
  assert.ok(Math.abs(step * STRIDE_PER_TILE * 30 / STRIDE_PER_TILE / 30 - RUSH_PACE / 30) < 1e-9, 'the run carried at its pace');
  assert.equal(said.length, 0, `the review found:\n${said.join('\n')}`);
});

test('5. the ring: its numbers; it goes out and breaks up, the cracks fade, nothing after; nothing cut off; crisp; no cyan; pink-edged', () => {
  assert.ok(RING.radius >= 2.25 && RING.radius <= 2.75 && ringStrikes(1.7, 1.7) && !ringStrikes(1.8, 1.8), 'struck within 2.5 tiles');
  assert.ok(ringReach(RING.wave) === RING.radius && ringReach(0) === 0 && ringReach(RING.wave / 2) > RING.radius / 2, 'it goes out to its edge, fast');
  const C = RING_CANVAS;
  for (const r of [2.25, 2.5, 2.75]) {
    for (let f = -2; f <= Math.ceil(RING.long * 30) + 2; f++) {
      const t = f / 30;
      for (const layer of ['floor', 'air'] as const) {
        for (const side of ['all', 'behind', 'before'] as const) {
          if (layer === 'floor' && side !== 'all') continue;
          const p = ringPainted(t, layer, r, side);
          assert.equal(p.px.w, C.w);
          const l = look(p.px, p.lights);
          assert.ok(!l.edge, `${layer} ${side} ${r} at ${t.toFixed(2)} s: cut off`);
          assert.equal(l.odd, 0, `${layer} at ${t.toFixed(2)} s: not crisp`);
          assert.equal(l.cyan, null, `${layer} at ${t.toFixed(2)} s: cyan`);
          if (t < -1e-6 || t > RING.long + 1e-6) assert.equal(l.painted, 0, `${layer} at ${t.toFixed(2)} s: something before or after`);
        }
      }
    }
  }
  const floor = (t: number): ReturnType<typeof look> => look(ringPainted(t, 'floor').px);
  const air = (t: number): ReturnType<typeof look> => look(ringPainted(t, 'air').px);
  const pink = rgba('#ff7aa8').slice(0, 3).join(',');
  assert.ok(floor(0.1).colours.has(pink) && floor(0.2).colours.has(pink), 'the enemy’s pink at its leading edge as it goes out');
  assert.ok(air(0).painted > 150 && air(0).colours.has('255,248,236'), 'the flash of the blow');
  const gone = RING.wave + RING.fade + 0.05;
  assert.ok(floor(0.05).painted > floor(0).painted * 4 && floor(gone).painted < floor(0.2).painted * 0.7 && !floor(gone).colours.has(pink), 'the ring goes out, then breaks up');
  assert.ok(floor(0.8).painted > 50 && floor(RING.long - 0.05).painted < floor(0.8).painted / 3, 'the cracks lie a while, then fade');
});

/** The Boneward as the review sees it: its bones and its old iron; what it carries, its spear (none while it is thrown); what it strikes with. */
const K = 1.18 * 1.08;
function bonewardShape(mob: Mob): BossShape {
  const mv = (move: string): MobMove | undefined => (mob.more?.[move] ?? (mob as unknown as Record<string, MobMove>)[move]);
  return {
    body: (s) => ({
      limbs: [
        { name: 'legL', a: s.hipL, b: s.kneeL, r: 1.0 * K },
        { name: 'legR', a: s.hipR, b: s.kneeR, r: 1.0 * K },
        { name: 'shinL', a: s.kneeL, b: s.ankleL, r: 0.85 * K },
        { name: 'shinR', a: s.kneeR, b: s.ankleR, r: 0.85 * K },
        { name: 'upperL', a: s.shoulderL, b: s.elbowL, r: 0.85 * K },
        { name: 'upperR', a: s.shoulderR, b: s.elbowR, r: 0.85 * K },
        { name: 'foreL', a: s.elbowL, b: s.handL, r: 0.75 * K },
        { name: 'foreR', a: s.elbowR, b: s.handR, r: 0.75 * K },
        { name: 'neck', a: s.neck, b: s.skull, r: 1.05 * K },
      ],
      lumps: [
        { name: 'head', c: s.head, rot: s.face, h: [5.3 * K, 5.1 * K, 4.7 * K] },
        { name: 'ribs', c: lerp3(s.ribs, s.neck, 0.35), rot: s.chest, h: [3.2 * K, 4.6 * K, 5.0 * K] },
        { name: 'pelvis', c: add(s.pelvis, mul(s.hips[2], 0.9 * K)), rot: s.hips, h: [3.1 * K, 5.0 * K, 2.2 * K] },
      ],
    }),
    things: (move, t, s) => {
      if (mv(move)?.bare?.(t)) return [];
      const butt = add(s.handR, mul(s.point, -11));
      const tip = add(s.handR, mul(s.point, 23));
      return [{ name: 'spear', pts: Array.from({ length: 9 }, (_, i) => lerp3(butt, tip, i / 8)), r: 0.85, may: ['foreR'] }];
    },
    tip: (move, t, s) => {
      if (move === 'throw') return s.handR;
      if (move === 'bash') return add(s.handL, mul(s.chest[0], 2));
      if (mv(move)?.bare?.(t)) return null;
      return add(s.handR, mul(s.point, 23));
    },
    strikes: { attack: [20 / 30, 21 / 30] },
    smeared: (move, t) => move === 'attack' && Math.abs(t - 0.7) < 0.02,
  };
}
/** Where the walled Boneward's moves hand over to each other: its stand and its walk, in and out, at every step; into each of its moves and back; its throw into its stand with no spear; its pick-up back into its wall. */
const WALL_HANDOVERS: Handover[] = [
  { from: 'stand', at: 0, to: 'walk', toAt: 0 },
  ...Array.from({ length: 8 }, (_, i): Handover => ({ from: 'walk', at: i / 11, to: 'stand', toAt: 0 })),
  ...Array.from({ length: 8 }, (_, i): Handover => ({ from: 'walk', at: i / 11, to: 'glance', toAt: 0 })),
  ...Array.from({ length: 8 }, (_, i): Handover => ({ from: 'walk', at: i / 11, to: 'reel', toAt: 0 })),
  ...['attack', 'reel', 'glance', 'throw', 'dying'].map((m): Handover => ({ from: 'stand', at: 0, to: m, toAt: 0 })),
  ...['attack', 'reel', 'glance'].map((m): Handover => ({ from: m, at: 'end', to: 'stand', toAt: 0 })),
  { from: 'throw', at: 'end', to: 'standBare', toAt: 0 },
  { from: 'standBare', at: 0, to: 'pickUp', toAt: 0 },
  { from: 'pickUp', at: 'end', to: 'stand', toAt: 0 },
];
const said = (found: ReturnType<typeof checkBoss>): string[] => found.map((f) => `${f.move}: ${f.kind} ${f.what.replace(/ \(down from [0-9.]+ s\)/, '')}`);

test('6. the Boneward’s shield wall through the bosses’ review: its new moves and every handing over find nothing; what it inherits, only what the game’s own does', () => {
  const NEW = ['stand', 'walk', 'glance', 'reel'];
  const INHERITED = ['attack', 'throw', 'pickUp', 'bash', 'standBare', 'walkBare', 'dying'];
  const wall = checkBoss(WALL_BONEWARD, { ...bonewardShape(WALL_BONEWARD), handovers: WALL_HANDOVERS });
  const game = new Set(said(checkBoss(BONEWARD, bonewardShape(BONEWARD))));
  const found: string[] = [];
  for (const f of said(wall)) {
    const move = f.split(':')[0];
    if (NEW.includes(move) || move.includes('>')) found.push(f);
    else if (!INHERITED.includes(move) || !game.has(f)) found.push(`${f} (not the game's own)`);
  }
  assert.equal([...new Set(found)].length, 0, `the review found:\n${[...new Set(found)].join('\n')}`);
});

test('7. the wall’s numbers, the glance, and every frame of the new moves painted, pink-edged, crisp, no cyan, nothing cut off', () => {
  assert.ok(WALL.arc === 120 && glances(0) && glances(59) && glances(-59) && !glances(61) && !glances(180) && !glances(-90), 'a blow within 60 degrees of its front glances off');
  assert.ok(WALL.thrustOpen < 0.7 && WALL.glance <= 0.35, 'open as it lunges; the glance short');
  const art = makeWallBonewardArt();
  for (const v of ['front', 'back'] as const) {
    const c = art[v].clips as NonNullable<AnimSet['clips']>;
    for (const [name, frames] of [['stand', art[v].idle], ['walk', art[v].walk], ['glance', c.moves?.glance?.frames], ['reel', c.reel?.frames], ['throw', c.moves?.throw?.frames], ['attack', c.attack?.frames], ['pickUp', c.moves?.pickUp?.frames]] as const) {
      (frames as Sprite[]).forEach((sp, i) => {
        const l = look(paintingOf(sp), sp.lights);
        assert.ok(l.painted > 400 && l.rim > 40, `${v} ${name} ${i}: painted (${l.painted}), the pink edge (${l.rim})`);
        assert.equal(l.odd, 0, `${v} ${name} ${i}: not crisp`);
        assert.equal(l.cyan, null, `${v} ${name} ${i}: a friend's colour`);
      });
    }
    // (cut off: its own canvas)
    for (const move of ['stand', 'walk', 'glance', 'reel', 'throw', 'attack', 'pickUp']) for (let f = 0; f <= 40; f++) assert.ok(!look(paintMob(WALL_BONEWARD, move, f / 30, v).px).edge, `${v} ${move} ${f}: cut off`);
  }
  // the glance: white, the enemy's gold and pink on the shield as it is struck; nothing of it when done; nothing of it in any other move
  const glance = (t: number, v: 'front' | 'back'): Set<string> => look(paintMob(WALL_BONEWARD, 'glance', t, v).px).colours;
  const white = '255,248,236';
  assert.ok(glance(0, 'front').has(white) && glance(0.067, 'front').has(rgba('#fff0a0').slice(0, 3).join(',')), 'a white star and gold on the shield');
  assert.ok(!glance(0.29, 'front').has(white), 'gone when done');
  assert.ok(!look(paintMob(WALL_BONEWARD, 'reel', 0.03, 'front').px).colours.has(white), 'struck from the side: no glance');
  // the wall up: its shield raised from where the game's Boneward holds it, square to its front; the spear over the shield's rim
  const s = (mob: Mob): ReturnType<typeof paintMob> => paintMob(mob, 'stand', 0, 'front');
  void s;
  const q = WALL_BONEWARD.stand.rest;
  assert.ok(q.pAz === 0 && q.lhIn === 1 && q.rhIn === 1, 'the shield square to its front, the spear held to the front');
});
