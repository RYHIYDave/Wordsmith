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

import { EYE_CANVAS, EYE_ON, EYE_POOL, EYE_R, eyeLookPainted } from '../src/art/drowned_eye';
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

test('huge (his pick): its eye as wide as the pool, and it towers over the knight', () => {
  // (the pool 1.95 by 1.62 tiles from its middle to its rim; its eye at least three quarters as wide as the pool's narrow way)
  assert.ok(2 * EYE_R >= 0.75 * 2 * EYE_POOL.ry, `its eye ${2 * EYE_R} across, the pool ${(2 * EYE_POOL.ry).toFixed(0)} at its narrowest`);
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
    if ((fx / EYE_POOL.rx) ** 2 + (fy / EYE_POOL.ry) ** 2 > 1.15 && sy > 0) beyond++;
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
