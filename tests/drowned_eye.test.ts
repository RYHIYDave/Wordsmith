// FLOOR 10'S BOSS, THE DROWNED EYE (src/art/drowned_eye.ts, behind EYE_ON; in the game through art/act1_figs/eye.ts, which
// turns EYE_ON on with the descent), held to his art rulebook before he sees it. THIS FIRST STEP, its look (risen, under the water, torn open into its
// maw, blazing), from in front and from behind:
//   - crisp pixels; its pink edge while it lives; nothing cyan; every light the enemy's fire; nothing cut off;
//   - its size, his brief's (“Huge: its eye as wide as the pool”);
//   - its eye burning the enemy's pink to gold, looking at you from in front; its back sunk in its flesh from behind;
//   - under the water (his pick, “Its eye glowing gold under the water”): its iris still burning through it, nothing of
//     it seen beyond the pool's rim, no edge round what is under;
//   - its maw (his pick, “The eye splits open into a maw”): teeth and its gullet burning; blazing (his pick, “its veins
//     blaze”): more of the enemy's fire on it than risen.
// The whole boss review of every move (his rulebook, How art is made 7) comes with its moves.
//   run: tsx --test tests/drowned_eye.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { EYE_CANVAS, EYE_ON, EYE_POOL, EYE_R, eyeLookPainted, eyeLookUnder } from '../src/art/drowned_eye';
import { act1Fig } from '../src/art/act1_figs/index';
import type { EyeLook } from '../src/art/drowned_eye';
import { RIM_ALPHA } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { stage } from '../src/art/skin';
import { TILE3 } from '../src/art/new_mobs3';
import { rgba } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const key = (r: number, g: number, b: number): string => `${r},${g},${b}`;
const FIRE = new Set(FLAME.map((c) => rgba(c).slice(0, 3).join(',')));
const RIM = rgba(ENEMY_RIM).slice(0, 3).join(',');
const TOOTH_PALE = new Set(['#aea286', '#d4caae', '#efe7cf'].map((c) => rgba(c).slice(0, 3).join(',')));
const LOOKS: EyeLook[] = ['risen', 'under', 'maw', 'blaze'];
const memo = new Map<string, Painted>();
const painted = (k: EyeLook, view: 'front' | 'back'): Painted => {
  const id = `${k} ${view}`;
  let p = memo.get(id);
  if (!p) memo.set(id, (p = eyeLookPainted(k, view)));
  return p;
};
function hsv(r: number, g: number, b: number): [number, number, number] {
  const M = Math.max(r, g, b);
  const m = Math.min(r, g, b);
  const c = M - m;
  let h = 0;
  if (c > 0) h = M === r ? ((g - b) / c) % 6 : M === g ? (b - r) / c + 2 : (r - g) / c + 4;
  return [(h * 60 + 360) % 360, M === 0 ? 0 : c / M, M / 255];
}
function each(p: Painted, f: (r: number, g: number, b: number, a: number, x: number, y: number) => void): void {
  const { w, h, d } = p.px;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (d[i + 3] > 0) f(d[i], d[i + 1], d[i + 2], d[i + 3], x, y);
  }
}
/** How much of it burns with the enemy's fire (its pink edge, laid at RIM_ALPHA, not counted). */
const fireCount = (p: Painted): number => {
  let n = 0;
  each(p, (r, g, b, a) => (n += a === 255 && FIRE.has(key(r, g, b)) ? 1 : 0));
  return n;
};

test('in the game only through its own (ACT 1: art/act1_figs/eye.ts, which turns its switch on with the descent); nothing else of the game imports it', () => {
  assert.ok(act1Fig('eye')?.switches?.includes(EYE_ON), 'its switch is the one his pictures in the game turn on');
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('drowned_eye.ts')) continue;
    if (new Set(['art/act1_figs/eye.ts']).has(f.replace(/\\/g, '/'))) continue;
    assert.ok(!/from ['"][^'"]*\/drowned_eye['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the Drowned Eye`);
  }
});

test('crisp: every pixel all there or not at all; its pink edge while it lives; nothing cyan; every light the enemy\'s fire', () => {
  for (const k of LOOKS) {
    for (const view of ['front', 'back'] as const) {
      const p = painted(k, view);
      let soft = 0;
      let rim = 0;
      each(p, (r, g, b, a) => {
        // (its pink edge is laid at RIM_ALPHA, as every living figure's is)
        if (a !== 255 && !(a === RIM_ALPHA && key(r, g, b) === RIM)) soft++;
        if (key(r, g, b) === RIM && a === RIM_ALPHA) rim++;
        const [h, s, v] = hsv(r, g, b);
        assert.ok(!(s > 0.4 && v > 0.55 && h > 165 && h < 205), `${k} ${view}: cyan ${r},${g},${b}`);
      });
      assert.equal(soft, 0, `${k} ${view}: soft pixels`);
      // (under the water, nothing of it is over the surface to have an edge: see below)
      if (k !== 'under') assert.ok(rim > 100, `${k} ${view}: its pink edge (${rim})`);
      for (const L of p.lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${k} ${view}: its light ${L.color} is the enemy's fire`);
    }
  }
});

test('nothing of it cut off at its canvas\'s edge', () => {
  for (const k of LOOKS) {
    for (const view of ['front', 'back'] as const) {
      const p = painted(k, view);
      let edge = 0;
      each(p, (_r, _g, _b, _a, x, y) => (edge += x === 0 || y === 0 || x === EYE_CANVAS.w - 1 || y === EYE_CANVAS.h - 1 ? 1 : 0));
      assert.equal(edge, 0, `${k} ${view}: ${edge} pixels on its canvas's edge`);
    }
  }
});

test('huge (his pick): its eye near as wide as the pool, room round it, and it towers over the knight', () => {
  // (his pick, “Huge: its eye as wide as the pool”; then his word that the pool and ring grow, “He looks squished in the
  // middle”: its eye well over half the pool's narrow way, and not wider than it)
  assert.ok(2 * EYE_R >= 0.6 * 2 * EYE_POOL.ry && 2 * EYE_R <= 2 * EYE_POOL.ry, `its eye ${2 * EYE_R} across, the pool ${(2 * EYE_POOL.ry).toFixed(0)} at its narrowest`);
  let top = Infinity;
  each(painted('risen', 'front'), (_r, _g, _b, _a, _x, y) => (top = Math.min(top, y)));
  // (the knight stands about 56 picture pixels tall)
  assert.ok(EYE_CANVAS.ay - top > 3 * 56, `it rises ${EYE_CANVAS.ay - top} picture pixels over the water`);
});

test('its eye burns the enemy\'s pink to gold and looks at you from in front; from behind, its back is its flesh', () => {
  const front = fireCount(painted('risen', 'front'));
  const back = fireCount(painted('risen', 'back'));
  assert.ok(front > 800, `its iris from in front: ${front} pixels of the fire`);
  assert.ok(back < front / 10, `from behind, little of its iris: ${back}`);
});

test('under the water (his pick): its iris still burning through it; nothing of it beyond the pool; no edge round what is under', () => {
  const p = painted('under', 'front');
  const st = stage('front', EYE_CANVAS.ax, EYE_CANVAS.ay, EYE_CANVAS);
  const b = st.back;
  let fire = 0;
  let beyond = 0;
  let rim = 0;
  const under = eyeLookUnder('under', 'front');
  each(p, (r, g, bl, a, x, y) => {
    // (every burning pixel of its tinted iris is still hot: reds and golds over 140)
    const [h, s, v] = hsv(r, g, bl);
    if (a === 255 && s > 0.35 && v > 0.55 && (h > 300 || h < 60)) fire++;
    if (key(r, g, bl) === RIM && a === RIM_ALPHA) rim++;
    // where the water's surface is along the eye's line through this pixel
    const sx = x + 0.5 - EYE_CANVAS.ax;
    const sy = y + 0.5 - EYE_CANVAS.ay;
    const n0 = -(b[2][0] * sx + b[2][1] * sy) / b[2][2];
    const fx = b[0][0] * sx + b[0][1] * sy + b[0][2] * n0;
    const fy = b[1][0] * sx + b[1][1] * sy + b[1][2] * n0;
    if (under[y * EYE_CANVAS.w + x] && (fx / EYE_POOL.rx) ** 2 + (fy / EYE_POOL.ry) ** 2 > 1.0001) beyond++;
  });
  assert.ok(fire > 300, `its iris burning through the water: ${fire}`);
  assert.equal(beyond, 0, `${beyond} pixels of it under the paving beyond the pool`);
  assert.ok(rim < fireCount(painted('risen', 'front')) / 4, `little pink edge under the water: ${rim}`);
});

test('its maw (his pick): its eye torn open, teeth, its gullet burning', () => {
  const p = painted('maw', 'front');
  let teeth = 0;
  each(p, (r, g, b) => (teeth += TOOTH_PALE.has(key(r, g, b)) ? 1 : 0));
  assert.ok(teeth > 150, `its teeth: ${teeth}`);
  assert.ok(fireCount(p) > 150, `its gullet burning: ${fireCount(p)}`);
  assert.ok(p.lights.some((L) => L.r > 50), 'its gullet lights what is round it');
});

test('blazing (his pick, its veins blaze): more of the enemy\'s fire on it than risen, and more light', () => {
  const risen = painted('risen', 'front');
  const blaze = painted('blaze', 'front');
  assert.ok(fireCount(blaze) > fireCount(risen) * 1.2, `blazing ${fireCount(blaze)}, risen ${fireCount(risen)}`);
  assert.ok(blaze.lights.length > risen.lights.length, 'more lights');
});

// ---------------------------------------------------------------------------------------------
// HIS STANDS AND HIS TENTACLE MOVES: the boss review (his rulebook, How art is made 7), every frame of his stands and
// every third of his moves at thirty a second, from in front and from behind; and the bursts, every third.

import { EYE_DEATH, EYE_EMPOWER, EYE_STRUCK, EYE_SURFACE } from '../src/art/drowned_eye';
import { EYE_BITE, EYE_SPAWN, EYE_SPEW, EYE_SPLASH, SPAWN_CANVAS, spawnLanding, spawnPainted, waveAt } from '../src/art/drowned_eye';
import { BILE_CANVAS, BOLT_CANVAS, EYE_BILE, EYE_BOLT, EYE_CALL, EYE_SPIT, bileLanding, bilePainted, boltPainted } from '../src/art/drowned_eye';
import { BURST_CANVAS, EYE_BURST, EYE_GAZE, EYE_LURK, EYE_RING, EYE_SLAM, EYE_STAND, EYE_SWEEP, burstPainted, eyeMarks, eyePainted, gazeAngle } from '../src/art/drowned_eye';

type Frame = { name: string; painted: () => Painted; w: number; h: number };
const reviewed: Frame[] = [];
const once = (f: () => Painted): (() => Painted) => {
  let p: Painted | null = null;
  return () => (p ??= f());
};
/** The way to the knight in the films: the moves are reviewed aimed there, and at three other ways. */
const AIMS = [-54, 20, 120, -160];
for (const view of ['front', 'back'] as const) {
  for (let i = 0; i < EYE_STAND.frames; i++) reviewed.push({ name: `stand ${view} ${i}`, painted: once(() => eyePainted('stand', i / EYE_STAND.fps, view)), w: EYE_CANVAS.w, h: EYE_CANVAS.h });
  for (let i = 0; i < EYE_LURK.frames; i++) reviewed.push({ name: `lurk ${view} ${i}`, painted: once(() => eyePainted('lurk', i / EYE_LURK.fps, view)), w: EYE_CANVAS.w, h: EYE_CANVAS.h });
  for (const [move, long] of [['slam', EYE_SLAM.long], ['sweep', EYE_SWEEP.long], ['slamUnder', EYE_SLAM.long], ['sweepUnder', EYE_SWEEP.long], ['gaze', EYE_GAZE.long], ['gazeBack', EYE_GAZE.long], ['call', EYE_CALL.long], ['spit', EYE_SPIT.long], ['bite', EYE_BITE.long], ['spew', EYE_SPEW.long], ['splash', EYE_SPLASH.long], ['surface', EYE_SURFACE.long], ['empower', EYE_EMPOWER.long], ['struck', EYE_STRUCK.long], ['struckUnder', EYE_STRUCK.long], ['death', EYE_DEATH.long]] as [string, number][]) {
    const n = Math.round(long * 30);
    for (let i = 0; i <= n; i += 3) {
      const aim = AIMS[(i / 3) % AIMS.length];
      reviewed.push({ name: `${move} ${view} ${i}/30 aim ${aim}`, painted: once(() => eyePainted(move, i / 30, view, aim)), w: EYE_CANVAS.w, h: EYE_CANVAS.h });
    }
  }
  for (let i = 0; i <= Math.round(EYE_BURST.long * 30); i += 3) reviewed.push({ name: `burst ${view} ${i}/30`, painted: once(() => burstPainted(i / 30, view, i)), w: BURST_CANVAS.w, h: BURST_CANVAS.h });
  // phase 3: his stand and his death blazing, the obelisks' lines bent into him
  for (let i = 0; i < EYE_STAND.frames; i += 3) reviewed.push({ name: `stand, phase 3, ${view} ${i}`, painted: once(() => eyePainted('stand', i / EYE_STAND.fps, view, 0, 0, 1)), w: EYE_CANVAS.w, h: EYE_CANVAS.h });
  for (let i = 0; i <= Math.round(EYE_DEATH.long * 30); i += 3) reviewed.push({ name: `death, phase 3, ${view} ${i}/30`, painted: once(() => eyePainted('death', i / 30, view, 0, 0, 1)), w: EYE_CANVAS.w, h: EYE_CANVAS.h });
  for (let i = 0; i <= Math.round(EYE_SPAWN.long * EYE_SPAWN.fps); i += 2) reviewed.push({ name: `egg ${view} ${i}/${EYE_SPAWN.fps}`, painted: once(() => spawnPainted(i / EYE_SPAWN.fps, view, i)), w: SPAWN_CANVAS.w, h: SPAWN_CANVAS.h });
  for (let i = 0; i <= Math.round(EYE_BILE.long * EYE_BILE.fps); i += 2) reviewed.push({ name: `bile ${view} ${i}/${EYE_BILE.fps}`, painted: once(() => bilePainted(i / EYE_BILE.fps, view, i)), w: BILE_CANVAS.w, h: BILE_CANVAS.h });
  for (let i = 0; i <= Math.round(EYE_BOLT.long * 30); i += 2) reviewed.push({ name: `bolt ${view} ${i}/30`, painted: once(() => boltPainted(i / 30, view, i)), w: BOLT_CANVAS.w, h: BOLT_CANVAS.h });
}

test('THE REVIEW: every frame crisp, nothing cyan, every light the enemy\'s fire, nothing cut off', () => {
  for (const f of reviewed) {
    const p = f.painted();
    let soft = 0;
    let edge = 0;
    each(p, (r, g, b, a, x, y) => {
      if (a !== 255 && !(a === RIM_ALPHA && key(r, g, b) === RIM)) soft++;
      const [h, s, v] = hsv(r, g, b);
      assert.ok(!(s > 0.4 && v > 0.55 && h > 165 && h < 205), `${f.name}: cyan ${r},${g},${b}`);
      if (x === 0 || y === 0 || x === f.w - 1 || y === f.h - 1) edge++;
    });
    assert.equal(soft, 0, `${f.name}: soft pixels`);
    assert.equal(edge, 0, `${f.name}: ${edge} pixels on its canvas's edge`);
    for (const L of p.lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${f.name}: its light ${L.color} is the enemy's fire`);
  }
});

test('ALIVE: his stands are never still, and each round closes on itself', () => {
  for (const [which, S] of [['stand', EYE_STAND], ['lurk', EYE_LURK]] as const) {
    const at = (t: number): Uint8ClampedArray => eyePainted(which, t, 'front').px.d;
    const a = at(0);
    const b = at(S.period);
    let same = 0;
    for (let i = 0; i < a.length; i++) same += a[i] === b[i] ? 1 : 0;
    assert.equal(same, a.length, `${which}: its round closes`);
    for (let i = 0; i < S.frames; i += 5) {
      const p = at(i / S.fps);
      const q = at((i + 1) / S.fps);
      let moved = 0;
      for (let k = 3; k < p.length; k += 4) if (p[k] !== q[k]) moved++;
      assert.ok(moved > 80, `${which} at frame ${i}: ${moved} pixels moved (never still)`);
    }
  }
});

const STAGE = stage('front', EYE_CANVAS.ax, EYE_CANVAS.ay, EYE_CANVAS);
/** How far its arms' tips and its eye go from one frame to the next, at thirty a second, in picture pixels. */
function travel(which: string, long: number, aim: number, from: number, to: number): { tip: number; eye: number } {
  let tip = 0;
  let eye = 0;
  let prev = eyeMarks(which, from, aim);
  for (let t = from + 1 / 30; t <= to + 1e-9; t += 1 / 30) {
    const cur = eyeMarks(which, Math.min(t, long), aim);
    for (let k = 0; k < Math.min(prev.tips.length, cur.tips.length); k++) {
      const [ax, ay] = STAGE.at(prev.tips[k]);
      const [bx, by] = STAGE.at(cur.tips[k]);
      tip = Math.max(tip, Math.hypot(ax - bx, ay - by));
    }
    const [ax, ay] = STAGE.at(prev.eye);
    const [bx, by] = STAGE.at(cur.eye);
    eye = Math.max(eye, Math.hypot(ax - bx, ay - by));
    prev = cur;
  }
  return { tip, eye };
}

test('JERK: nothing of him leaps from one frame to the next (but the blow itself, as fast as it will go: his rulebook, Animations 1)', () => {
  // (his stands: arms writhing, never leaping; his eye and bulk never more than 6 picture pixels a frame, ever)
  for (const [which, S] of [['stand', EYE_STAND], ['lurk', EYE_LURK]] as const) {
    const m = travel(which, S.period, 0, 0, S.period);
    assert.ok(m.tip < 25 && m.eye < 6, `${which}: tips ${m.tip.toFixed(1)}, eye ${m.eye.toFixed(1)}`);
  }
  for (const under of ['', 'Under']) {
    for (const aim of AIMS) {
      const slam = `slam${under}`;
      const sweep = `sweep${under}`;
      // outside the blow: under 60 a frame; the blow (the slam's fall, the sweep's whip): under 200, a smear
      const before = travel(slam, EYE_SLAM.long, aim, 0, EYE_SLAM.fall);
      const after = travel(slam, EYE_SLAM.long, aim, EYE_SLAM.hit + 0.05, EYE_SLAM.long);
      const blow = travel(slam, EYE_SLAM.long, aim, EYE_SLAM.fall, EYE_SLAM.hit + 0.05);
      assert.ok(before.tip < 60 && after.tip < 60 && blow.tip < 200, `${slam} aim ${aim}: ${before.tip.toFixed(0)}, ${blow.tip.toFixed(0)}, ${after.tip.toFixed(0)}`);
      assert.ok(Math.max(before.eye, after.eye, blow.eye) < 6, `${slam} aim ${aim}: his eye ${Math.max(before.eye, after.eye, blow.eye).toFixed(1)}`);
      const s0 = travel(sweep, EYE_SWEEP.long, aim, 0, EYE_SWEEP.sweep[0]);
      const s2 = travel(sweep, EYE_SWEEP.long, aim, EYE_SWEEP.over, EYE_SWEEP.long);
      const s1 = travel(sweep, EYE_SWEEP.long, aim, EYE_SWEEP.sweep[0], EYE_SWEEP.over);
      assert.ok(s0.tip < 60 && s2.tip < 60 && s1.tip < 200, `${sweep} aim ${aim}: ${s0.tip.toFixed(0)}, ${s1.tip.toFixed(0)}, ${s2.tip.toFixed(0)}`);
      assert.ok(Math.max(s0.eye, s1.eye, s2.eye) < 6, `${sweep} aim ${aim}: his eye ${Math.max(s0.eye, s1.eye, s2.eye).toFixed(1)}`);
    }
  }
});

test('JUMP: a move begun at any moment of his stand starts from it and hands back to it', () => {
  for (const [move, base, long] of [['slam', 'stand', EYE_SLAM.long], ['sweep', 'stand', EYE_SWEEP.long], ['slamUnder', 'lurk', EYE_SLAM.long], ['sweepUnder', 'lurk', EYE_SWEEP.long]] as [string, string, number][]) {
    for (const clock of [0, 0.7, 1.9]) {
      const a = eyeMarks(move, 0, -54, clock);
      const b = eyeMarks(base, clock, 0);
      for (let k = 0; k < b.tips.length; k++) assert.ok(Math.hypot(...(STAGE.at(a.tips[k]).map((v, i) => v - STAGE.at(b.tips[k])[i]) as [number, number])) < 0.5, `${move} from ${clock}: its arm ${k} where the stand had it`);
      // (the striking arm is still coming up out of the water at its start; by its end it is gone back under)
      assert.ok(a.tips.length === b.tips.length + 1, `${move}: the striking arm is there from its start`);
      const c = eyeMarks(move, long, -54, clock);
      const d = eyeMarks(base, clock + long, 0);
      assert.equal(c.tips.length, d.tips.length, `${move}: the striking arm gone back by its end`);
      for (let k = 0; k < d.tips.length; k++) assert.ok(Math.hypot(...(STAGE.at(c.tips[k]).map((v, i) => v - STAGE.at(d.tips[k])[i]) as [number, number])) < 0.5, `${move} from ${clock}: hands back to the stand`);
    }
  }
});

test('THE WARNING IS A POSE: the slam\'s arm held high and trembling, the sweep\'s held cocked, the burst\'s cracks glowing before it bursts', () => {
  for (const aim of AIMS) {
    const slam = travel('slam', EYE_SLAM.long, aim, EYE_SLAM.rear + 0.05, EYE_SLAM.fall);
    // (held: its tip trembling, and swaying a little with his heaving bulk, against the 172 a frame of its fall)
    assert.ok(slam.tip < 18, `the slam aim ${aim}: held, its tip trembling ${slam.tip.toFixed(1)} a frame`);
    const sweep = travel('sweep', EYE_SWEEP.long, aim, EYE_SWEEP.cock + 0.05, EYE_SWEEP.sweep[0]);
    assert.ok(sweep.tip < 20, `the sweep aim ${aim}: held cocked, ${sweep.tip.toFixed(1)} a frame`);
  }
  // the slam's shadow and its burning arm while held
  const held = eyePainted('slam', (EYE_SLAM.rear + EYE_SLAM.fall) / 2, 'front', -54);
  assert.ok(fireCount(held) > 60, `the slam's arm burning while held: ${fireCount(held)}`);
  // the burst: the cracks glowing, no arm yet; then the arm up
  const glow = burstPainted(EYE_BURST.burst * 0.9, 'front', 1);
  const up = burstPainted((EYE_BURST.up + EYE_BURST.sink[0]) / 2, 'front', 1);
  // (its arm's own skin: the pale of his arms)
  const ARM = new Set(['#4a443e', '#736a5e', '#9c9282', '#c2b6a0'].map((c) => rgba(c).slice(0, 3).join(',')));
  let armGlow = 0;
  let armUp = 0;
  each(glow, (r, g, b) => (armGlow += ARM.has(key(r, g, b)) ? 1 : 0));
  each(up, (r, g, b) => (armUp += ARM.has(key(r, g, b)) ? 1 : 0));
  assert.ok(fireCount(glow) > 40, `the cracks glow: ${fireCount(glow)}`);
  assert.ok(armGlow === 0 && armUp > 300, `no arm before it bursts (${armGlow}), the arm up after (${armUp})`);
});

test('THE BLOWS LAND WHERE THEY ARE AIMED: the slam lies along its aim, the sweep passes through its aim', () => {
  for (const aim of AIMS) {
    const m = eyeMarks('slam', EYE_SLAM.hit + 0.1, aim);
    const tip = m.tips[m.tips.length - 1];
    const dir = Math.atan2(tip[0] * Math.SQRT1_2 + tip[1] * Math.SQRT1_2, tip[0] * Math.SQRT1_2 - tip[1] * Math.SQRT1_2) * (180 / Math.PI);
    const off = Math.abs(((dir - aim + 540) % 360) - 180);
    assert.ok(off < 8 && tip[2] < 25, `the slam aim ${aim}: its tip lies ${off.toFixed(1)} degrees off its line, ${tip[2].toFixed(0)} high`);
  }
});

// ---------------------------------------------------------------------------------------------
// HIS SPELLS

/** Where on the floor `r` out along the line `deg` falls (his front toward you, in front view). */
const floorAt = (deg: number, r: number): [number, number, number] => {
  const c = Math.cos((deg * Math.PI) / 180) * r * Math.SQRT1_2;
  const s = Math.sin((deg * Math.PI) / 180) * r * Math.SQRT1_2;
  return [c + s, -c + s, 0];
};
const between = (deg: number): number => {
  const d = floorAt(deg, 1);
  const rim = 1 / Math.hypot(d[0] / EYE_POOL.rx, d[1] / EYE_POOL.ry);
  const ring = 1 / Math.hypot(d[0] / EYE_RING.rx, d[1] / EYE_RING.ry);
  return (rim + ring) / 2;
};

test('HIS GAZE: never leaping; begun at any moment of his stand, it starts from it and hands back to it, the stones clean again', () => {
  for (const aim of AIMS) {
    for (const which of ['gaze', 'gazeBack']) {
      const m = travel(which, EYE_GAZE.long, aim, 0, EYE_GAZE.long);
      assert.ok(m.tip < 60 && m.eye < 6, `${which} aim ${aim}: tips ${m.tip.toFixed(1)}, eye ${m.eye.toFixed(1)} a frame`);
    }
  }
  for (const clock of [0, 0.7, 1.9]) {
    for (const [t, base] of [[0, clock], [EYE_GAZE.long, clock + EYE_GAZE.long]]) {
      const a = eyePainted('gaze', t, 'front', -54, clock).px.d;
      const b = eyePainted('stand', base, 'front').px.d;
      let diff = 0;
      for (let i = 0; i < a.length; i++) diff += a[i] !== b[i] ? 1 : 0;
      assert.equal(diff, 0, `the gaze at ${t} from ${clock}: as his stand`);
    }
  }
});

test('HIS GAZE\'S WARNING: his light flickering on the stones where it will start before it burns; then it burns along its line, through its aim', () => {
  for (const aim of AIMS) {
    // the warning: a line of fire on the floor where it will start, wherever he does not hide it; no beam yet
    for (const back of [false, true]) {
      const which = back ? 'gazeBack' : 'gaze';
      const start = back ? aim + EYE_GAZE.arc / 2 : aim - EYE_GAZE.arc / 2;
      const calm = eyePainted(which, 0.1, 'front', aim);
      const warn = eyePainted(which, EYE_GAZE.gather * 0.9, 'front', aim);
      let lit = 0;
      let seen = 0;
      for (let i = 1; i <= 7; i++) {
        const d = floorAt(start, 1);
        const rim = 1 / Math.hypot(d[0] / EYE_POOL.rx, d[1] / EYE_POOL.ry);
        const ring = 1 / Math.hypot(d[0] / EYE_RING.rx, d[1] / EYE_RING.ry);
        const [x, y] = STAGE.at(floorAt(start, rim + ((ring - rim) * i) / 8));
        // (seen: nothing of him there, before it or as it warns)
        let hot = false;
        let him = false;
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
          const q = (Math.round(y + dy) * warn.px.w + Math.round(x + dx)) * 4;
          if (FIRE.has(key(warn.px.d[q], warn.px.d[q + 1], warn.px.d[q + 2]))) hot = true;
          else if (warn.px.d[q + 3] > 0 || calm.px.d[q + 3] > 0) him = true;
        }
        if (him && !hot) continue;
        seen++;
        if (hot) lit++;
      }
      assert.ok(lit >= seen - 1, `${which} aim ${aim}: the warning burns along where it will start (${lit} of the ${seen} seen)`);
      assert.equal(gazeAngle(EYE_GAZE.gather * 0.9, aim, back), null, 'not burning while it warns');
    }
    const burn = eyePainted('gaze', (EYE_GAZE.sweep[0] + EYE_GAZE.sweep[1]) / 2, 'front', aim);
    assert.ok(fireCount(burn) > 800, `aim ${aim}: it burns (${fireCount(burn)})`);
    // halfway through its sweep it lies on its aim, burning there
    const mid = gazeAngle((EYE_GAZE.sweep[0] + EYE_GAZE.sweep[1]) / 2, aim) as number;
    assert.ok(Math.abs(mid - aim) < 1, `aim ${aim}: halfway, it lies at ${mid.toFixed(1)}`);
    const [x, y] = STAGE.at(floorAt(aim, between(aim)));
    let hot = 0;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const k = (Math.round(y + dy) * burn.px.w + Math.round(x + dx)) * 4;
      if (FIRE.has(key(burn.px.d[k], burn.px.d[k + 1], burn.px.d[k + 2]))) hot++;
    }
    assert.ok(hot > 6, `aim ${aim}: burning on its line (${hot})`);
  }
});

test('HIS CALL: never leaping; begun at any moment of his stand, it starts from it and hands back to it', () => {
  const m = travel('call', EYE_CALL.long, 0, 0, EYE_CALL.long);
  assert.ok(m.tip < 60 && m.eye < 6, `the call: tips ${m.tip.toFixed(1)}, eye ${m.eye.toFixed(1)} a frame`);
  for (const clock of [0, 0.7, 1.9]) {
    for (const [t, base] of [[0, clock], [EYE_CALL.long, clock + EYE_CALL.long]]) {
      const a = eyePainted('call', t, 'front', 0, clock).px.d;
      const b = eyePainted('stand', base, 'front').px.d;
      let diff = 0;
      for (let i = 0; i < a.length; i++) diff += a[i] !== b[i] ? 1 : 0;
      assert.equal(diff, 0, `the call at ${t} from ${clock}: as his stand`);
    }
  }
  // held: his veins burning with the siege's fire, more than as he stands
  const held = eyePainted('call', (EYE_CALL.hold[0] + EYE_CALL.hold[1]) / 2, 'front');
  const calm = eyePainted('stand', (EYE_CALL.hold[0] + EYE_CALL.hold[1]) / 2, 'front');
  assert.ok(fireCount(held) > fireCount(calm) + 400, `his veins burn as he calls (${fireCount(held)} against ${fireCount(calm)})`);
});

test('THE SIEGE\'S BOLTS: their runes on the stones before, no bolt yet; the bolt cracking down; the stones clean by the end', () => {
  for (const seed of [0, 3, 7]) {
    const [cx, cy] = stage('front', BOLT_CANVAS.ax, BOLT_CANVAS.ay, BOLT_CANVAS).at([0, 0, 0]);
    // (the fire between the stones and the tear in the dome high above: the bolt's)
    const high = (p: Painted): number => {
      let n = 0;
      each(p, (r, g, b, a, x, y) => (n += a === 255 && y < cy - 60 && y > cy - EYE_BOLT.sky + 40 && Math.abs(x - cx) < 40 && FIRE.has(key(r, g, b)) ? 1 : 0));
      return n;
    };
    const warn = boltPainted(EYE_BOLT.strike * 0.8, 'front', seed);
    const strike = boltPainted(EYE_BOLT.strike + 0.05, 'front', seed);
    const end = boltPainted(EYE_BOLT.long, 'front', seed);
    assert.ok(fireCount(warn) > 150, `seed ${seed}: the runes glow (${fireCount(warn)})`);
    assert.ok(high(warn) < 30, `seed ${seed}: no bolt before it strikes (${high(warn)})`);
    assert.ok(high(strike) > 400, `seed ${seed}: the bolt (${high(strike)})`);
    let left = 0;
    each(end, (r, g, b, a) => (left += a > 0 ? 1 : 0));
    assert.equal(left, 0, `seed ${seed}: the stones clean by its end`);
    // its runes no wider than where it hurts, and as wide
    let far = 0;
    const b = stage('front', BOLT_CANVAS.ax, BOLT_CANVAS.ay, BOLT_CANVAS).back;
    each(warn, (r, g, bb, a, x, y) => {
      if (!FIRE.has(key(r, g, bb)) || y < cy - 60) return;
      const sx = x + 0.5 - BOLT_CANVAS.ax;
      const sy = y + 0.5 - BOLT_CANVAS.ay;
      const n0 = -(b[2][0] * sx + b[2][1] * sy) / b[2][2];
      const fx = b[0][0] * sx + b[0][1] * sy + b[0][2] * n0;
      const fy = b[1][0] * sx + b[1][1] * sy + b[1][2] * n0;
      far = Math.max(far, Math.hypot(fx, fy) / (EYE_BOLT.reach * TILE3));
    });
    assert.ok(far > 0.95 && far < 1.12, `seed ${seed}: its runes reach ${far.toFixed(2)} of where it hurts`);
  }
});

const BILE_SEEN = new Set(['#424a16', '#646e20', '#8c982e', '#b6bf52'].map((c) => rgba(c).slice(0, 3).join(',')));

test('HIS BILE: never leaping; from his stand and back to it; his maw open and the rings where it will land before each glob comes down', () => {
  for (const aim of AIMS) {
    const m = travel('spit', EYE_SPIT.long, aim, 0, EYE_SPIT.long);
    assert.ok(m.tip < 60 && m.eye < 6, `the spit aim ${aim}: tips ${m.tip.toFixed(1)}, eye ${m.eye.toFixed(1)} a frame`);
  }
  for (const clock of [0, 0.7, 1.9]) {
    for (const [t, base] of [[0, clock], [EYE_SPIT.long, clock + EYE_SPIT.long]]) {
      const a = eyePainted('spit', t, 'front', -54, clock).px.d;
      const b = eyePainted('stand', base, 'front').px.d;
      let diff = 0;
      for (let i = 0; i < a.length; i++) diff += a[i] !== b[i] ? 1 : 0;
      assert.equal(diff, 0, `the spit at ${t} from ${clock}: as his stand`);
    }
  }
  // the rings where they will land, round each landing, before it lands
  for (const aim of [-54, 20]) {
    EYE_SPIT.spits.forEach((ts, i) => {
      const p = eyePainted('spit', ts + EYE_SPIT.fly * 0.6, 'front', aim);
      const [x, y] = STAGE.at(bileLanding(aim, i));
      const r = EYE_BILE.reach * TILE3 * 1.155;
      let ring = 0;
      each(p, (rr, g, b, a, px, py) => {
        if (!BILE_SEEN.has(key(rr, g, b))) return;
        const d = Math.hypot((px + 0.5 - x) / r, (py + 0.5 - y) / (r * 0.5));
        if (Math.abs(d - 1) < 0.12) ring++;
      });
      assert.ok(ring > 40, `aim ${aim}, glob ${i}: its ring (${ring})`);
    });
  }
});

test('HIS BILE\'S POOLS: no light; as wide as where they hurt; gone by their end', () => {
  for (const seed of [0, 4, 9]) {
    const p = bilePainted(2, 'front', seed);
    assert.equal(p.lights.length, 0, 'it gives no light');
    let far = 0;
    let n = 0;
    const st = stage('front', BILE_CANVAS.ax, BILE_CANVAS.ay, BILE_CANVAS);
    const b = st.back;
    each(p, (r, g, bb, a, x, y) => {
      if (a === 0) return;
      n++;
      const sx = x + 0.5 - BILE_CANVAS.ax;
      const sy = y + 0.5 - BILE_CANVAS.ay;
      const n0 = -(b[2][0] * sx + b[2][1] * sy) / b[2][2];
      const fx = b[0][0] * sx + b[0][1] * sy + b[0][2] * n0;
      const fy = b[1][0] * sx + b[1][1] * sy + b[1][2] * n0;
      if (y > BILE_CANVAS.ay - 30) far = Math.max(far, Math.hypot(fx, fy) / (EYE_BILE.reach * TILE3));
    });
    assert.ok(n > 1500, `seed ${seed}: a pool (${n} pixels)`);
    assert.ok(far > 0.95 && far < 1.4, `seed ${seed}: it spreads ${far.toFixed(2)} of where it hurts`);
    let left = 0;
    each(bilePainted(EYE_BILE.long, 'front', seed), (r, g, bb, a) => (left += a > 0 ? 1 : 0));
    assert.equal(left, 0, `seed ${seed}: gone by its end`);
  }
});

import { EYE_R as RADIUS, armSpine, eyeLong, poseOf } from '../src/art/drowned_eye';

test('NOTHING THROUGH HIS EYE (his rulebook, How art 7): no arm of his goes into the face of his eye, in any move', () => {
  const D = Math.PI / 180;
  for (const m of ['stand', 'lurk', 'slam', 'sweep', 'slamUnder', 'sweepUnder', 'gaze', 'gazeBack', 'call', 'spit', 'bite', 'spew', 'splash', 'surface', 'empower', 'struck', 'death']) {
    const long = eyeLong(m);
    for (const aim of AIMS) {
      for (let i = 0; i <= Math.round(long * 30); i += 2) {
        const P = poseOf(m, i / 30, aim, 0);
        // (his face, turned round by his turn and up by his tilt)
        const T = (P.turn ?? 0) * D;
        const fw = [Math.SQRT1_2 * (Math.cos(T) + Math.sin(T)), Math.SQRT1_2 * (Math.sin(T) - Math.cos(T))];
        const F = [fw[0] * Math.cos(P.tilt * D), fw[1] * Math.cos(P.tilt * D), Math.sin(P.tilt * D)];
        const E = [P.heave[0], P.heave[1], P.zE + P.heave[2]];
        P.arms.forEach((A, k) => {
          armSpine(P, A).forEach((s, j) => {
            if (j < 2) return;
            const q = [s.p[0] - E[0], s.p[1] - E[1], s.p[2] - E[2]];
            if (q[0] * F[0] + q[1] * F[1] + q[2] * F[2] < -s.r) return;
            // (where they rise from beside it, the rim of his flesh round it hides a little of them: no more)
            const deep = RADIUS * 0.97 - (Math.hypot(q[0], q[1], q[2]) - s.r);
            assert.ok(deep < 15, `${m} aim ${aim} at ${(i / 30).toFixed(2)}: arm ${k} ${deep.toFixed(1)} into his eye`);
          });
        });
      }
    }
  }
});

test('HIS BREATH AND BITE: from his stand and back; never leaping but for the lunge itself; he turns his face on you; the draught streaming in before he bites', () => {
  for (const aim of AIMS) {
    const before = travel('bite', EYE_BITE.long, aim, 0, EYE_BITE.inhale[1]);
    const lunge = travel('bite', EYE_BITE.long, aim, EYE_BITE.inhale[1], EYE_BITE.snap + 0.05);
    const after = travel('bite', EYE_BITE.long, aim, EYE_BITE.snap + 0.05, EYE_BITE.long);
    assert.ok(before.tip < 60 && after.tip < 60 && lunge.tip < 200, `the bite aim ${aim}: tips ${before.tip.toFixed(0)}, ${lunge.tip.toFixed(0)}, ${after.tip.toFixed(0)}`);
    // (his bulk under 6 a frame but in the lunge, as fast as it will go)
    assert.ok(before.eye < 6 && after.eye < 6 && lunge.eye < 30, `the bite aim ${aim}: his eye ${before.eye.toFixed(1)}, ${lunge.eye.toFixed(1)}, ${after.eye.toFixed(1)}`);
    // his face on you through the breath and the bite
    const held = poseOf('bite', (EYE_BITE.inhale[0] + EYE_BITE.inhale[1]) / 2, aim);
    const d = Math.abs((((held.turn ?? 0) - aim) % 360 + 540) % 360 - 180);
    assert.ok(d < 1, `the bite aim ${aim}: his face turned ${held.turn} against ${aim}`);
    // the lunge goes at you: his bulk out along the aim at the bite
    const at = poseOf('bite', EYE_BITE.snap, aim).heave;
    const dir = floorAt(aim, 1);
    assert.ok(at[0] * dir[0] + at[1] * dir[1] > EYE_BITE.lunge * 0.8, `the bite aim ${aim}: lunging along it`);
  }
  for (const clock of [0, 0.7, 1.9]) {
    for (const [t, base] of [[0, clock], [EYE_BITE.long, clock + EYE_BITE.long]]) {
      const a = eyePainted('bite', t, 'front', -54, clock).px.d;
      const b = eyePainted('stand', base, 'front').px.d;
      let diff = 0;
      for (let i = 0; i < a.length; i++) diff += a[i] !== b[i] ? 1 : 0;
      assert.equal(diff, 0, `the bite at ${t} from ${clock}: as his stand`);
    }
  }
  // the draught: streaks through the air into his maw while he breathes in, none once he has bitten
  const breathing = poseOf('bite', (EYE_BITE.inhale[0] + EYE_BITE.inhale[1]) / 2, -54);
  const bitten = poseOf('bite', EYE_BITE.snap + 0.2, -54);
  assert.ok((breathing.streaks ?? []).length > 30, `the draught: ${(breathing.streaks ?? []).length} streaks`);
  assert.equal((bitten.streaks ?? []).length, 0, 'no draught once he bites');
});

/** A move begun at three moments of his stand starts from it and hands back to it, pixel for pixel. */
function handsBack(move: string, long: number, aim: number): void {
  for (const clock of [0, 0.7, 1.9]) {
    for (const [t, base] of [[0, clock], [long, clock + long]]) {
      const a = eyePainted(move, t, 'front', aim, clock).px.d;
      const b = eyePainted('stand', base, 'front').px.d;
      let diff = 0;
      for (let i = 0; i < a.length; i++) diff += a[i] !== b[i] ? 1 : 0;
      assert.equal(diff, 0, `the ${move} at ${t} from ${clock}: as his stand`);
    }
  }
}

test('HIS EYESPAWN: from his stand and back, never leaping; he turns his face on you; the eggs fly and land on the ring', () => {
  for (const aim of AIMS) {
    const m = travel('spew', EYE_SPEW.long, aim, 0, EYE_SPEW.long);
    assert.ok(m.tip < 60 && m.eye < 6, `the spew aim ${aim}: tips ${m.tip.toFixed(1)}, eye ${m.eye.toFixed(1)} a frame`);
    const held = poseOf('spew', (EYE_SPEW.spew[0] + EYE_SPEW.spew[1]) / 2, aim);
    assert.ok(Math.abs((((held.turn ?? 0) - aim) % 360 + 540) % 360 - 180) < 1, `the spew aim ${aim}: his face on you`);
    assert.ok((held.globs ?? []).length > 20, `the spew aim ${aim}: the torrent (${(held.globs ?? []).length})`);
    EYE_SPEW.eggs.forEach((te, i) => {
      const flying = poseOf('spew', te + EYE_SPEW.fly / 2, aim);
      assert.ok((flying.eggs ?? []).length >= 1, `the spew aim ${aim}: egg ${i} in the air`);
      const at = spawnLanding(aim, i);
      const ring = Math.hypot(at[0] / EYE_RING.rx, at[1] / EYE_RING.ry);
      const pool = Math.hypot(at[0] / EYE_POOL.rx, at[1] / EYE_POOL.ry);
      assert.ok(ring < 1 && pool > 1, `the spew aim ${aim}: egg ${i} lands on the ring`);
    });
    assert.equal((poseOf('spew', EYE_SPEW.long, aim).eggs ?? []).length, 0, 'no eggs in the air by its end');
  }
  handsBack('spew', EYE_SPEW.long, -54);
});

test('HIS EYESPAWN\'S EGGS: no light; rocking, then shaking hard before they hatch; burst at the hatch; the stones clean by the end', () => {
  for (const seed of [0, 2, 5]) {
    const moved = (a: number, b: number): number => {
      const p = spawnPainted(a, 'front', seed).px.d;
      const q = spawnPainted(b, 'front', seed).px.d;
      let n = 0;
      for (let k = 3; k < p.length; k += 4) n += p[k] !== q[k] ? 1 : 0;
      return n;
    };
    assert.equal(spawnPainted(1, 'front', seed).lights.length, 0, 'no light');
    // (rocking a little; shaking hard as it nears its hatch)
    assert.ok(moved(2.3, 2.3 + 1 / 15) > moved(1.0, 1.0 + 1 / 15), `seed ${seed}: shaking harder before it hatches (${moved(2.3, 2.3 + 1 / 15)} against ${moved(1.0, 1.0 + 1 / 15)})`);
    let left = 0;
    each(spawnPainted(EYE_SPAWN.long, 'front', seed), (r, g, b, a) => (left += a > 0 ? 1 : 0));
    assert.equal(left, 0, `seed ${seed}: clean by its end`);
  }
});

test('HIS SPLASH: from his stand and back; his bulk heaved up and held before it crashes; the wave rolls across the ring from its rim to its edge', () => {
  const S = EYE_SPLASH;
  for (const aim of AIMS) {
    // (the heave and the crash are the blow: as fast as they go; held at the top, trembling)
    const before = travel('splash', S.long, aim, 0, S.rise[0]);
    const held = travel('splash', S.long, aim, S.hang[0] + 0.05, S.hang[1]);
    const after = travel('splash', S.long, aim, S.crash + 0.1, S.long);
    const blow = travel('splash', S.long, aim, S.rise[0], S.crash + 0.1);
    assert.ok(before.eye < 6 && held.eye < 6 && after.eye < 6 && blow.eye < 60, `the splash: his bulk ${before.eye.toFixed(1)}, ${held.eye.toFixed(1)}, ${after.eye.toFixed(1)}, ${blow.eye.toFixed(1)}`);
    assert.ok(before.tip < 60 && held.tip < 60 && after.tip < 60 && blow.tip < 200, `the splash: tips ${before.tip.toFixed(0)}, ${held.tip.toFixed(0)}, ${after.tip.toFixed(0)}, ${blow.tip.toFixed(0)}`);
  }
  // up high while he hangs
  assert.ok(poseOf('splash', (S.hang[0] + S.hang[1]) / 2).heave[2] > S.high * 0.9, 'heaved up high');
  // the wave: none before the crash; from the rim out to the edge; gone after
  assert.equal(waveAt(S.crash - 0.05), null);
  let last = -1;
  for (let t = S.wave[0]; t <= S.wave[1]; t += 1 / 30) {
    const w = waveAt(t) as number;
    assert.ok(w >= last && w >= 0 && w <= 1, `the wave at ${t.toFixed(2)}: ${w}`);
    last = w;
  }
  assert.ok(last > 0.97, 'the wave reaches the ring\'s edge');
  assert.equal(waveAt(S.wave[1] + 0.05), null);
  // painted where it is: its foam at its front, before him
  const t = S.wave[0] + (S.wave[1] - S.wave[0]) * 0.4;
  const w = waveAt(t) as number;
  const p = eyePainted('splash', t, 'front');
  let foam = 0;
  for (const a of [-60, -30, 0, 30, 60]) {
    const d = floorAt(a, 1);
    const rim = 1 / Math.hypot(d[0] / EYE_POOL.rx, d[1] / EYE_POOL.ry);
    const ring = 1 / Math.hypot(d[0] / EYE_RING.rx, d[1] / EYE_RING.ry);
    const [x, y] = STAGE.at(floorAt(a, rim + (ring - rim) * w));
    for (let dy = -30; dy <= 2; dy++) {
      const k = (Math.round(y + dy) * p.px.w + Math.round(x)) * 4;
      if (key(p.px.d[k], p.px.d[k + 1], p.px.d[k + 2]) === '223,230,224') { foam++; break; }
    }
  }
  assert.ok(foam >= 4, `the wave's foam where it is (${foam} of 5)`);
  handsBack('splash', S.long, 0);
});

/** A move from one stand to another: pixel for pixel, its first frame its first stand's, its last its second's. */
function fromTo(move: string, long: number, from: [string, number], to: [string, number], aim = 0, phase3 = 0): void {
  for (const clock of [0, 0.7, 1.9]) {
    for (const [t, [base, p3]] of [[0, from], [long, to]] as [number, [string, number]][]) {
      const a = eyePainted(move, t, 'front', aim, clock, phase3).px.d;
      const b = eyePainted(base, clock + t, 'front', 0, 0, p3).px.d;
      let diff = 0;
      for (let i = 0; i < a.length; i++) diff += a[i] !== b[i] ? 1 : 0;
      assert.equal(diff, 0, `the ${move} at ${t} from ${clock}: as his ${base}${p3 ? ', phase 3' : ''}`);
    }
  }
}

test('HE SURFACES (phase 1 to 2): from his lurk to his stand; the pool boiling before he rises; his eye torn open into his maw as he roars; never leaping but as he bursts up', () => {
  const S = EYE_SURFACE;
  fromTo('surface', S.long, ['lurk', 0], ['stand', 0]);
  const boil = travel('surface', S.long, 0, 0, S.boil - 1 / 30);
  const risen = travel('surface', S.long, 0, S.rise[0] + 1 / 30, S.long);
  assert.ok(boil.eye < 6 && boil.tip < 60, `boiling: his eye ${boil.eye.toFixed(1)}, tips ${boil.tip.toFixed(0)}`);
  assert.ok(risen.eye < 40 && risen.tip < 200, `rising: his eye ${risen.eye.toFixed(1)}, tips ${risen.tip.toFixed(0)}`);
  const settled = travel('surface', S.long, 0, S.roar[1], S.long);
  assert.ok(settled.eye < 6 && settled.tip < 60, `settling: his eye ${settled.eye.toFixed(1)}, tips ${settled.tip.toFixed(0)}`);
  // the boil: rings on the pool as it warns
  assert.ok((poseOf('surface', S.boil * 0.8).ripples ?? []).length > 10, 'the pool boils');
  // the roar: his maw torn open
  assert.equal(poseOf('surface', (S.roar[0] + S.roar[1]) / 2).split, 1);
});

test('HE PULLS THE SIEGE IN (phase 2 to 3): from his stand to his blazing stand; the obelisks\' lines reaching him; his veins catching', () => {
  const S = EYE_EMPOWER;
  fromTo('empower', S.long, ['stand', 0], ['stand', 1]);
  const m = travel('empower', S.long, 0, 0, S.long);
  assert.ok(m.eye < 6 && m.tip < 60, `never leaping: his eye ${m.eye.toFixed(1)}, tips ${m.tip.toFixed(0)}`);
  assert.equal(poseOf('empower', S.reach[0] - 0.05).siegeReach, 0, 'the lines not out yet');
  assert.equal(poseOf('empower', S.reach[1] + 0.05).siegeReach, 1, 'the lines reach him');
  assert.ok(poseOf('empower', S.blaze[0]).blaze < 0.05 && poseOf('empower', S.blaze[1]).blaze > 0.8, 'his veins catching');
  // phase 3 burns more of the siege's fire on him than phase 2
  const two = fireCount(eyePainted('stand', 1, 'front'));
  const three = fireCount(eyePainted('stand', 1, 'front', 0, 0, 1));
  assert.ok(three > two + 1500, `phase 3 blazing: ${three} against ${two}`);
});

test('STRUCK: risen and under the water, from his stand and back; his eye flinching shut', () => {
  for (const aim of AIMS) {
    fromTo('struck', EYE_STRUCK.long, ['stand', 0], ['stand', 0], aim);
    fromTo('struckUnder', EYE_STRUCK.long, ['lurk', 0], ['lurk', 0], aim);
    const m = travel('struck', EYE_STRUCK.long, aim, 0.1, EYE_STRUCK.long);
    assert.ok(m.eye < 6 && m.tip < 60, `struck aim ${aim}: back smoothly (${m.eye.toFixed(1)}, ${m.tip.toFixed(0)})`);
  }
  assert.ok(poseOf('struck', 0.2, -54).lid > 0.7, 'his eye flinching shut');
});

test('HIS DEATH: from his stand (blazing, in phase 3); the dome cracking, then its shards falling; his eye going dark; he sinks; nothing of him left', () => {
  const S = EYE_DEATH;
  for (const clock of [0, 0.7, 1.9]) {
    const a = eyePainted('death', 0, 'front', 0, clock, 1).px.d;
    const b = eyePainted('stand', clock, 'front', 0, 0, 1).px.d;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff += a[i] !== b[i] ? 1 : 0;
    assert.equal(diff, 0, `his death from ${clock}: as his stand`);
  }
  assert.ok((poseOf('death', (S.cracks[0] + S.shatter) / 2, 0, 0, 1).cracks ?? 0) > 0.3, 'the dome cracking');
  assert.ok((poseOf('death', S.shatter + 0.4, 0, 0, 1).shards ?? []).length > 30, 'its shards falling');
  assert.equal((poseOf('death', S.long, 0, 0, 1).shards ?? []).length, 0, 'its shards gone');
  assert.equal(poseOf('death', S.shatter + 0.3, 0, 0, 1).siege, 0, 'the obelisks\' lines snapped');
  assert.ok((poseOf('death', S.dark[1]).dark ?? 0) > 0.99, 'his eye gone dark');
  let left = 0;
  each(eyePainted('death', S.long, 'front', 0, 0, 1), (r, g, b, a) => (left += a > 0 ? 1 : 0));
  assert.equal(left, 0, 'nothing of him left');
  assert.equal(eyePainted('death', S.long, 'front', 0, 0, 1).lights.length, 0, 'no light left');
});
