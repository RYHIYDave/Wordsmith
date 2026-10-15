// FLOOR 8'S BOSS, THE CANTOR (src/art/cantor.ts; a mock-up behind CANTOR_ON, off; nothing of the game imports
// it), held to his art rulebook before he sees him: crisp, his pink edge; nothing cyan, every light the cult's
// fire; nothing of him cut off at his canvas's edge; his size, his brief's (half again the knight); and the whole
// boss review (art/boss_checks.ts) of what of his moves are made.
//   run: tsx --test tests/cantor.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { checkBoss, findingsSaid } from '../src/art/boss_checks';
import { CANTOR, CANTOR_BODY, CANTOR_ON, CANTOR_STAND_LONG, cantorPainted } from '../src/art/cantor';
import { RIM_ALPHA } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { rgba } from '../src/engine/px';
import { MADE, cantorShape } from './cantor_shape';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const FIRE = new Set(FLAME.map((c) => rgba(c).slice(0, 3).join(',')));
const frames: { name: string; move: string; t: number; view: 'front' | 'back' }[] = [];
for (const view of ['front', 'back'] as const) {
  const n = Math.round(CANTOR_STAND_LONG * CANTOR.idleFps);
  for (let i = 0; i < n; i += 4) frames.push({ name: `stand ${view} ${i}`, move: 'stand', t: i / CANTOR.idleFps, view });
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

test('the switch is off, and nothing of the game imports him', () => {
  assert.equal(CANTOR_ON.on, false);
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('cantor.ts')) continue;
    assert.ok(!/from ['"][^'"]*\/cantor['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the Cantor`);
  }
});

test('crisp: every pixel all there or not at all (but the pink edge); his pink edge round him', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  for (const f of frames) {
    const { px } = cantorPainted(f.t, f.view, f.move);
    let soft = 0;
    let rim = 0;
    for (let i = 0; i < px.d.length; i += 4) {
      const a = px.d[i + 3];
      if (a === 0 || a === 255) continue;
      if (a === RIM_ALPHA && px.d[i] === pr && px.d[i + 1] === pg && px.d[i + 2] === pb) rim++;
      else soft++;
    }
    assert.ok(soft === 0, `${f.name}: ${soft} soft pixels`);
    assert.ok(rim > 200, `${f.name}: his pink edge, ${rim} pixels`);
  }
});

test('nothing cyan, every light the cult\'s fire, and nothing of him cut off at his canvas\'s edge', () => {
  for (const f of frames) {
    const { px, lights } = cantorPainted(f.t, f.view, f.move);
    for (let i = 0; i < px.d.length; i += 4) {
      if (px.d[i + 3] === 0) continue;
      const [h, sat] = hue(px.d[i], px.d[i + 1], px.d[i + 2]);
      assert.ok(!(sat > 0.4 && Math.max(px.d[i], px.d[i + 1], px.d[i + 2]) > 140 && h >= 165 && h <= 205), `${f.name}: cyan`);
    }
    for (const L of lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${f.name}: his light ${L.color}`);
    let cut = 0;
    for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    assert.ok(cut === 0, `${f.name}: ${cut} pixels on his canvas's edge`);
  }
});

test('his size, his brief\'s: half again the knight\'s height (58)', () => {
  const k = CANTOR_BODY.tall / 58;
  assert.ok(k > 1.4 && k < 1.6, `${k.toFixed(2)} times the knight's height`);
});

test('the whole review (art/boss_checks.ts) of what of his moves are made', () => {
  const found = checkBoss(CANTOR, cantorShape(), MADE);
  assert.ok(found.length === 0, `the Cantor:\n  ${findingsSaid(found).join('\n  ')}`);
});
