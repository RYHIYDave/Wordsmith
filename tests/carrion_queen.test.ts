// FLOOR 7'S BOSS, THE CARRION QUEEN (src/art/carrion_queen.ts; a mock-up nothing of the game imports), held to
// his rulebook before he sees her: crisp in every frame of every move made, the enemy's pink edge round her, nothing cyan and
// every light the cult's fire, nothing of her cut off at her canvas's edge, her size his (“Wings wider than
// the trail (Recommended)”, offered as: perched, about the Unfinished's height), the cult's mark burning on
// her breast, her crown bone-pale, and the whole boss review (art/boss_checks.ts) of what of her moves.
//   run: tsx --test tests/carrion_queen.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { checkBoss, findingsSaid } from '../src/art/boss_checks';
import { MADE, queenShape } from './carrion_queen_shape';
import { RIM_ALPHA } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { CARRION_QUEEN, CARRION_QUEEN_ON, CQ_BREATH, CQ_RAKE, CROWN, queenPainted, queenStanding } from '../src/art/carrion_queen';
import { unfinishedStanding } from '../src/art/unfinished';
import { rgba } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const FIRE = new Set(FLAME.map((c) => rgba(c).slice(0, 3).join(',')));
const frames: { name: string; move: string; t: number; view: 'front' | 'back' }[] = [];
for (const view of ['front', 'back'] as const) {
  const n = Math.round(CQ_BREATH * CARRION_QUEEN.idleFps);
  for (let i = 0; i < n; i += 3) frames.push({ name: `stand ${view} ${i}`, move: 'stand', t: i / CARRION_QUEEN.idleFps, view });
  for (let i = 0; i < CARRION_QUEEN.walkFrames; i += 2) frames.push({ name: `walk ${view} ${i}`, move: 'walk', t: i / CARRION_QUEEN.walkFps, view });
  for (let i = 0; i <= Math.round(CQ_RAKE.long * 30); i += 4) frames.push({ name: `attack ${view} ${i}`, move: 'attack', t: i / 30, view });
  for (let i = 0; i <= Math.round(CARRION_QUEEN.reelTime * 30); i += 3) frames.push({ name: `reel ${view} ${i}`, move: 'reel', t: i / 30, view });
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
  assert.equal(CARRION_QUEEN_ON.on, false);
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('carrion_queen.ts')) continue;
    assert.ok(!/from ['"][^'"]*carrion_queen['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the Carrion Queen`);
  }
});

test('crisp: every pixel all there or not at all (but the pink edge); the pink edge round her', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  for (const f of frames) {
    const { px } = queenPainted(f.t, f.view, f.move);
    let soft = 0;
    let rim = 0;
    for (let i = 0; i < px.d.length; i += 4) {
      const a = px.d[i + 3];
      if (a === 0 || a === 255) continue;
      if (a === RIM_ALPHA && px.d[i] === pr && px.d[i + 1] === pg && px.d[i + 2] === pb) rim++;
      else soft++;
    }
    assert.ok(soft === 0, `${f.name}: ${soft} soft pixels`);
    assert.ok(rim > 400, `${f.name}: her pink edge, ${rim} pixels`);
  }
});

test('nothing cyan, every light the cult\'s fire, and nothing of her cut off at her canvas\'s edge', () => {
  for (const f of frames) {
    const { px, lights } = queenPainted(f.t, f.view, f.move);
    for (let i = 0; i < px.d.length; i += 4) {
      if (px.d[i + 3] === 0) continue;
      const [h, sat] = hue(px.d[i], px.d[i + 1], px.d[i + 2]);
      assert.ok(!(sat > 0.4 && Math.max(px.d[i], px.d[i + 1], px.d[i + 2]) > 140 && h >= 165 && h <= 205), `${f.name}: cyan`);
    }
    for (const L of lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${f.name}: her light ${L.color}`);
    let cut = 0;
    for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    assert.ok(cut === 0, `${f.name}: ${cut} pixels on her canvas's edge`);
  }
});

test('her size, his: perched, about the Unfinished\'s height', () => {
  const k = tallOf(queenStanding(0.4, 'front')) / tallOf(unfinishedStanding(0.4, 'front'));
  assert.ok(k > 0.85 && k < 1.2, `${k.toFixed(2)} times the Unfinished's height`);
});

test('the one thing to know her by: her crown bone-pale, the cult\'s mark burning on her breast', () => {
  const { px } = queenPainted(0.4, 'front');
  const crown = new Set(CROWN.map((c) => rgba(c).slice(0, 3).join(',')));
  let pale = 0;
  let fire = 0;
  for (let i = 0; i < px.d.length; i += 4) {
    if (px.d[i + 3] !== 255) continue;
    const k = `${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`;
    if (crown.has(k)) pale++;
    if (FIRE.has(k)) fire++;
  }
  assert.ok(pale > 300, `her crown: ${pale} pixels`);
  assert.ok(fire > 30, `the cult's mark burning: ${fire} pixels`);
});

test('the whole review (art/boss_checks.ts) of what of her moves', () => {
  const found = checkBoss(CARRION_QUEEN, queenShape(), MADE);
  assert.ok(found.length === 0, `the Carrion Queen:\n  ${findingsSaid(found).join('\n  ')}`);
});
