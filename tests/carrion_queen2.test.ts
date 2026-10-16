// FLOOR 7'S BOSS, THE CARRION QUEEN MADE NEW (src/art/carrion_queen2.ts; a mock-up nothing of the game imports), held to
// his rulebook before he sees her: crisp in every frame, the enemy's pink edge round her, nothing cyan and every light
// the cult's fire, nothing of her cut off at her canvas's edge; her size his (“Wings wider than the trail
// (Recommended)”, offered as: perched, about the Unfinished's height; wings spread, wider than the trail is across);
// the one thing to know her by, her bone crown and the cult's mark burning on her breast; nothing of her under the rock;
// and, his pick of 16 Oct, “Fast and vicious (Recommended)”: never still, not one frame of her stand like the last.
//   run: tsx --test tests/carrion_queen2.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { CROWN, QUEEN2_ON, Q2_IDLE, Q2_SCALE, Q2_STAND, queen2Bits, queen2Frame, queen2Painted, standPose, wingBones } from '../src/art/carrion_queen2';
import { RIM_ALPHA } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { TILE3 } from '../src/art/new_mobs3';
import { unfinishedStanding } from '../src/art/unfinished';
import { rgba } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const FIRE = new Set(FLAME.map((c) => rgba(c).slice(0, 3).join(',')));
const N = Math.round(Q2_STAND * Q2_IDLE.fps);
const frames: { name: string; t: number; view: 'front' | 'back' }[] = [];
for (const view of ['front', 'back'] as const) for (let i = 0; i < N; i += 2) frames.push({ name: `stand ${view} ${i}`, t: i / Q2_IDLE.fps, view });

function hue(r: number, g: number, b: number): [number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return [0, 0];
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  return [(h + 360) % 360, (max - min) / max];
}
function tallOf(sp: Sprite): number {
  const q = paintingOf(sp);
  let top = q.h;
  let bottom = -1;
  for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) if (q.d[(y * q.w + x) * 4 + 3] === 255) {
    top = Math.min(top, y);
    bottom = Math.max(bottom, y);
  }
  return bottom - top + 1;
}

test('the switch is off, and nothing of the game imports her', () => {
  assert.equal(QUEEN2_ON.on, false);
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('carrion_queen2.ts')) continue;
    assert.ok(!/from ['"][^'"]*carrion_queen2['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the new Carrion Queen`);
  }
});

test('crisp: every pixel all there or not at all (but the pink edge); the pink edge round her', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  for (const f of frames) {
    const { px } = queen2Painted('stand', f.t, f.view);
    let soft = 0;
    let rim = 0;
    for (let i = 0; i < px.d.length; i += 4) {
      const a = px.d[i + 3];
      if (a === 0 || a === 255) continue;
      if (a === RIM_ALPHA && px.d[i] === pr && px.d[i + 1] === pg && px.d[i + 2] === pb) rim++;
      else soft++;
    }
    assert.ok(soft === 0, `${f.name}: ${soft} soft pixels`);
    assert.ok(rim > 600, `${f.name}: her pink edge, ${rim} pixels`);
  }
});

test('nothing cyan, every light the cult\'s fire, and nothing of her cut off at her canvas\'s edge', () => {
  for (const f of frames) {
    const { px, lights } = queen2Painted('stand', f.t, f.view);
    for (let i = 0; i < px.d.length; i += 4) {
      if (px.d[i + 3] === 0) continue;
      const [h, sat] = hue(px.d[i], px.d[i + 1], px.d[i + 2]);
      assert.ok(!(sat > 0.4 && Math.max(px.d[i], px.d[i + 1], px.d[i + 2]) > 140 && h >= 165 && h <= 205), `${f.name}: cyan`);
    }
    assert.ok(lights.length > 0, `${f.name}: no lights`);
    for (const L of lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${f.name}: her light ${L.color}`);
    let cut = 0;
    for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    assert.ok(cut === 0, `${f.name}: ${cut} pixels on her canvas's edge`);
  }
});

test('her size, his: about the Unfinished\'s height as she stands; her wings, held about her, wider than the trail (four tiles and more)', () => {
  const k = tallOf(queen2Frame('stand', 0.1, 'front')) / tallOf(unfinishedStanding(0.4, 'front'));
  assert.ok(k > 0.85 && k < 1.3, `${k.toFixed(2)} times the Unfinished's height`);
  for (let i = 0; i < N; i++) {
    const P = standPose(i / Q2_IDLE.fps);
    const a = wingBones(P, 1);
    const b = wingBones(P, -1);
    // (across her, from the tip of one hand to the other, the feathers past them not counted)
    const span = Math.hypot(a.tip[0] - b.tip[0], a.tip[1] - b.tip[1]) * Q2_SCALE;
    assert.ok(span > 4 * TILE3, `at ${(i / Q2_IDLE.fps).toFixed(2)} s her wings are ${(span / TILE3).toFixed(1)} tiles across`);
  }
});

test('the one thing to know her by: her crown bone-pale, the cult\'s mark burning on her breast', () => {
  for (const t of [0.1, 0.7, 1.45]) {
    const { px } = queen2Painted('stand', t, 'front');
    const crown = new Set(CROWN.map((c) => rgba(c).slice(0, 3).join(',')));
    let pale = 0;
    let fire = 0;
    for (let i = 0; i < px.d.length; i += 4) {
      if (px.d[i + 3] !== 255) continue;
      const k = `${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`;
      if (crown.has(k)) pale++;
      if (FIRE.has(k)) fire++;
    }
    assert.ok(pale > 250, `at ${t} s her crown: ${pale} pixels`);
    assert.ok(fire > 250, `at ${t} s the cult's fire (her mark, her crown's tips, her eyes): ${fire} pixels`);
  }
});

test('nothing of her goes under the rock, in any frame of her stand', () => {
  const lowOf = (sh: any): number => {
    if (sh.k === 'panel') return Math.min(...[-1, 1].flatMap((a) => [-1, 1].map((b) => sh.c[2] + a * sh.u[2] + b * sh.v[2])));
    if (sh.k === 'ball') return sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
    if (sh.k === 'rod') return Math.min(sh.a[2] - sh.ra, sh.b[2] - sh.rb);
    return Infinity;
  };
  for (let i = 0; i < N; i++) {
    const t = i / Q2_IDLE.fps;
    for (const b of queen2Bits(standPose(t), t)) {
      const z = lowOf(b.shape);
      assert.ok(z >= -0.5, `stand at ${t.toFixed(2)} s: her ${b.part} ${b.piece} is ${(-z).toFixed(1)} under the rock`);
    }
  }
});

test('fast and vicious, his pick: never still (no frame of her stand the same as the one before), her head snapping', () => {
  for (const view of ['front', 'back'] as const) {
    let last = '';
    for (let i = 0; i <= N; i++) {
      const { px } = queen2Painted('stand', i / Q2_IDLE.fps, view);
      let h = 0;
      for (let k = 0; k < px.d.length; k += 4) if (px.d[k + 3]) h = (h * 31 + k + px.d[k] * 7 + px.d[k + 1] * 13 + px.d[k + 2]) % 1000000007;
      const key = String(h);
      assert.ok(key !== last, `${view}: frame ${i} the same as the one before`);
      last = key;
    }
  }
  // (her head darts: in her stand it goes at least a quarter of a tile in a fifteenth of a second, several times)
  let darts = 0;
  for (let i = 0; i < N; i++) {
    const a = standPose(i / Q2_IDLE.fps).head;
    const b = standPose((i + 1) / Q2_IDLE.fps).head;
    if (Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) * Q2_SCALE > TILE3 / 4) darts++;
  }
  assert.ok(darts >= 4, `her head darts ${darts} times a round`);
});
