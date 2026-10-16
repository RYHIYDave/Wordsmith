// THE EYESPAWN, FLOOR 10'S MEDIUM MOB (src/art/eyespawn.ts; a mock-up nothing of the game imports), held to his
// rulebook before he sees it: crisp in every frame, the enemy's pink edge round it while it lives, nothing cyan and
// every light the enemy's fire, nothing of it cut off at its canvas's edge; its size (his pick: the knight's height);
// its one staring eye (his pick), his eye small: its iris the enemy's fire, looking at you from in front, its light
// gold; its back its flesh.
//   run: tsx --test tests/eyespawn.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { ES_HABITS, ES_R, ES_STAND, IRIS, SPAWN_ON, eyespawnPainted, standPose } from '../src/art/eyespawn';
import { RIM_ALPHA } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { rgba } from '../src/engine/px';
import type { Px } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const FIRE = new Set(FLAME.map((c) => rgba(c).slice(0, 3).join(',')));
const IRIS_SET = new Set(IRIS.slice(1).map((c) => rgba(c).slice(0, 3).join(',')));
const VIEWS = ['front', 'back'] as const;
type Frame = { name: string; t: number; view: string; px: Px; lights: { color: string }[] };
const living: Frame[] = [];
for (let i = 0; i < Math.round(ES_STAND * 15); i++) for (const view of VIEWS) {
  const p = eyespawnPainted('stand', i / 15, view);
  living.push({ name: `eyespawn stand ${view} ${(i / 15).toFixed(2)}`, t: i / 15, view, px: p.px, lights: p.lights });
}
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
const irisOf = (px: Px): number => {
  let n = 0;
  for (let i = 0; i < px.d.length; i += 4) if (px.d[i + 3] === 255 && IRIS_SET.has(`${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`)) n++;
  return n;
};
const blinking = (t: number): boolean => t > ES_HABITS.blink[0] - 0.02 && t < ES_HABITS.blink[1] + 0.02;

test('the switch is off, and nothing of the game imports it', () => {
  assert.equal(SPAWN_ON.on, false);
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('eyespawn.ts')) continue;
    assert.ok(!/from ['"][^'"]*\/eyespawn['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the Eyespawn`);
  }
});

test('crisp: every pixel all there or not at all (but the pink edge), and the pink edge round it while it lives', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  for (const { name, px } of living) {
    let soft = 0;
    let rim = 0;
    for (let i = 0; i < px.d.length; i += 4) {
      const a = px.d[i + 3];
      if (a === 0 || a === 255) continue;
      if (a === RIM_ALPHA && px.d[i] === pr && px.d[i + 1] === pg && px.d[i + 2] === pb) rim++;
      else soft++;
    }
    assert.ok(soft === 0, `${name}: ${soft} soft pixels`);
    assert.ok(rim > 100, `${name}: its pink edge, ${rim} pixels`);
  }
});

test('nothing cyan, and every light it gives is the enemy\'s fire', () => {
  for (const { name, px, lights } of living) {
    for (let i = 0; i < px.d.length; i += 4) {
      if (px.d[i + 3] === 0) continue;
      const [h, sat] = hue(px.d[i], px.d[i + 1], px.d[i + 2]);
      assert.ok(!(sat > 0.4 && Math.max(px.d[i], px.d[i + 1], px.d[i + 2]) > 140 && h >= 165 && h <= 205), `${name}: cyan ${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`);
    }
    for (const L of lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${name}: its light ${L.color}`);
  }
});

test('nothing of it cut off at its canvas\'s edge, in any frame', () => {
  for (const { name, px } of living) {
    let cut = 0;
    for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    assert.ok(cut === 0, `${name}: ${cut} pixels on the canvas's edge`);
  }
});

test('its size (his pick): the knight\'s height (the knight is 58 of the figure\'s lengths), its legs on the floor', () => {
  for (let i = 0; i < 24; i++) {
    const P = standPose(i / 10);
    const top = Math.max(P.E[2] + ES_R, ...P.arms.map((a) => Math.max(...a.map((q) => q[2]))));
    assert.ok(top > 0.85 * 58 && top < 1.15 * 58, `its top ${top.toFixed(1)} up`);
    assert.ok(P.tips.filter((q) => q[2] < 0.5).length >= 4, 'standing on its legs');
  }
});

test('its one staring eye (his pick): from in front its iris the enemy\'s fire, open but for its blink, its light gold; from behind its flesh, no iris', () => {
  for (const f of living) {
    if (f.view === 'front' && !blinking(f.t)) {
      assert.ok(irisOf(f.px) >= 20, `${f.name}: its iris, ${irisOf(f.px)} pixels`);
      assert.ok(f.lights.some((L) => L.color === FLAME[3]), `${f.name}: its gold light`);
    }
    if (f.view === 'back') assert.ok(irisOf(f.px) < 6, `${f.name}: its iris seen from behind, ${irisOf(f.px)} pixels`);
  }
  const shut = eyespawnPainted('stand', (ES_HABITS.blink[0] + ES_HABITS.blink[1]) / 2, 'front');
  assert.ok(irisOf(shut.px) < 6 && shut.lights.length === 0, 'shut as it blinks, no light');
});
