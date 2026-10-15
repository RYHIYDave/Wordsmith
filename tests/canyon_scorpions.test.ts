// FLOOR 8'S CANYON SCORPIONS (src/art/canyon_scorpions.ts; a mock-up behind SCORPION_ON, off; nothing of the game
// imports it), held to his art rulebook before he sees them: crisp, its pink edge while it lives; nothing cyan, every
// light the cult's fire; nothing of it cut off at its canvas's edge; its size, his brief's (knee-high to the knight).
//   run: tsx --test tests/canyon_scorpions.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { SCORPION_ON, SC_STAND, scorpionPainted, scorpionSolids } from '../src/art/canyon_scorpions';
import { RIM_ALPHA } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { rgba } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const FIRE = new Set(FLAME.map((c) => rgba(c).slice(0, 3).join(',')));
type Frame = { name: string; alive: boolean; painted: () => Painted };
const frames: Frame[] = [];
const memo = (f: () => Painted): (() => Painted) => {
  let p: Painted | null = null;
  return () => (p ??= f());
};
for (const view of ['front', 'back'] as const) {
  for (let i = 0; i < SC_STAND.frames; i += 2) frames.push({ name: `stand ${view} ${i}`, alive: true, painted: memo(() => scorpionPainted('stand', i / SC_STAND.fps, view)) });
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

test('the switch is off, and nothing of the game imports it', () => {
  assert.equal(SCORPION_ON.on, false);
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('canyon_scorpions.ts')) continue;
    assert.ok(!/from ['"][^'"]*\/canyon_scorpions['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the scorpions`);
  }
});

test('crisp: every pixel all there or not at all (but the pink edge); its pink edge round it while it lives', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  for (const f of frames) {
    const { px } = f.painted();
    let soft = 0;
    let rim = 0;
    for (let i = 0; i < px.d.length; i += 4) {
      const a = px.d[i + 3];
      if (a === 0 || a === 255) continue;
      if (a === RIM_ALPHA && px.d[i] === pr && px.d[i + 1] === pg && px.d[i + 2] === pb) rim++;
      else soft++;
    }
    assert.ok(soft === 0, `${f.name}: ${soft} soft pixels`);
    if (f.alive) assert.ok(rim > 100, `${f.name}: its pink edge, ${rim} pixels`);
  }
});

test('nothing cyan, every light the cult\'s fire, and nothing of it cut off at its canvas\'s edge', () => {
  for (const f of frames) {
    const { px, lights } = f.painted();
    for (let i = 0; i < px.d.length; i += 4) {
      if (px.d[i + 3] === 0) continue;
      const [h, sat] = hue(px.d[i], px.d[i + 1], px.d[i + 2]);
      assert.ok(!(sat > 0.4 && Math.max(px.d[i], px.d[i + 1], px.d[i + 2]) > 140 && h >= 165 && h <= 205), `${f.name}: cyan`);
    }
    for (const L of lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${f.name}: its light ${L.color}`);
    let cut = 0;
    for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    assert.ok(cut === 0, `${f.name}: ${cut} pixels on its canvas's edge`);
  }
});

test('its size, his brief\'s: knee-high to the knight (58 tall, his knee about 17 up), its tail raised over it to about his waist', () => {
  let back = 0;
  let top = 0;
  for (const b of scorpionSolids('stand', 0)) {
    const sh = b.shape;
    const zs = sh.k === 'ball' ? [sh.c[2] + Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2])] : sh.k === 'rod' ? [sh.a[2] + sh.ra, sh.b[2] + sh.rb] : [];
    for (const z of zs) {
      if (b.part === 'body') back = Math.max(back, z);
      top = Math.max(top, z);
    }
  }
  assert.ok(back > 9 && back < 17, `its back ${back.toFixed(1)} up`);
  assert.ok(top > 26 && top < 38, `its tail ${top.toFixed(1)} up`);
});
