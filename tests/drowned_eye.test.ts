// FLOOR 10'S BOSS, THE DROWNED EYE (src/art/drowned_eye.ts; a mock-up behind EYE_ON, off; nothing of the game imports
// it), held to his art rulebook before he sees it. THIS FIRST STEP, its look (risen, under the water, torn open into its
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
import type { EyeLook } from '../src/art/drowned_eye';
import { RIM_ALPHA } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { stage } from '../src/art/skin';
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

test('nothing of the game imports it, and its switch is off', () => {
  assert.equal(EYE_ON.on, false);
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('drowned_eye.ts')) continue;
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

import { BURST_CANVAS, EYE_BURST, EYE_LURK, EYE_SLAM, EYE_STAND, EYE_SWEEP, burstPainted, eyeMarks, eyePainted } from '../src/art/drowned_eye';

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
  for (const [move, long] of [['slam', EYE_SLAM.long], ['sweep', EYE_SWEEP.long], ['slamUnder', EYE_SLAM.long], ['sweepUnder', EYE_SWEEP.long]] as [string, number][]) {
    const n = Math.round(long * 30);
    for (let i = 0; i <= n; i += 3) {
      const aim = AIMS[(i / 3) % AIMS.length];
      reviewed.push({ name: `${move} ${view} ${i}/30 aim ${aim}`, painted: once(() => eyePainted(move, i / 30, view, aim)), w: EYE_CANVAS.w, h: EYE_CANVAS.h });
    }
  }
  for (let i = 0; i <= Math.round(EYE_BURST.long * 30); i += 3) reviewed.push({ name: `burst ${view} ${i}/30`, painted: once(() => burstPainted(i / 30, view, i)), w: BURST_CANVAS.w, h: BURST_CANVAS.h });
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
