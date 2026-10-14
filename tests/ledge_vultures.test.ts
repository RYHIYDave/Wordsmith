// FLOOR 7'S VULTURE (src/art/ledge_vultures.ts; a mock-up nothing of the game imports), held to his rulebook before he
// sees its standing picture: about the knight's height, crisp in every frame it has, the enemy's pink edge round it,
// nothing cyan and every light the cult's fire, nothing of it cut off at its canvas's edge, two pink eyes, a pale bald
// head, and its broken cult chain in sight from in front as well as from behind.
//   run: tsx --test tests/ledge_vultures.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { RIM_ALPHA } from '../src/art/kit';
import { ENEMY_RIM, FLAME, IRON } from '../src/art/mkit';
import { VULTURE_ON, vulturePainted, vultureStanding } from '../src/art/ledge_vultures';
import { spriteOf3 } from '../src/art/heroes3';
import { MOVES3 } from '../src/art/moves3';
import { rgba } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const FIRE = new Set(FLAME.map((c) => rgba(c).slice(0, 3).join(',')));
const IRON_SET = new Set(IRON.map((c) => rgba(c).slice(0, 3).join(',')));

// every move it has (its walk, dive, flinch and death are still the standing motion, placeholders), both views, frame by frame
const frames: { name: string; move: string; t: number; view: 'front' | 'back' }[] = [];
for (const view of ['front', 'back'] as const) {
  for (let i = 0; i <= 24; i += 3) frames.push({ name: `stand ${view} ${i}`, move: 'stand', t: i / 10, view });
  for (const move of ['walk', 'attack', 'reel', 'dying'] as const) {
    for (let i = 0; i <= 24; i += 3) frames.push({ name: `${move} ${view} ${i}`, move, t: i / 10, view });
  }
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

test('the switch is off, and nothing of the game imports it', () => {
  assert.equal(VULTURE_ON.on, false);
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('ledge_vultures.ts')) continue;
    assert.ok(!/from ['"][^'"]*ledge_vultures['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the vulture`);
  }
});

test('crisp: every pixel all there or not at all (but the pink edge round it)', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  for (const f of frames) {
    const { px } = vulturePainted(f.t, f.view, f.move);
    let soft = 0;
    let rim = 0;
    for (let i = 0; i < px.d.length; i += 4) {
      const a = px.d[i + 3];
      if (a === 0 || a === 255) continue;
      if (a === RIM_ALPHA && px.d[i] === pr && px.d[i + 1] === pg && px.d[i + 2] === pb) rim++;
      else soft++;
    }
    assert.ok(soft === 0, `${f.name}: ${soft} soft pixels`);
    assert.ok(rim > 80, `${f.name}: its pink edge, ${rim} pixels`);
  }
});

test('nothing cyan, every light the cult\'s fire, and nothing of it cut off at its canvas\'s edge', () => {
  for (const f of frames) {
    const { px, lights } = vulturePainted(f.t, f.view, f.move);
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

test('its eyes burn the enemy\'s pink: two pink lights, one for each eye, from either side', () => {
  for (const view of ['front', 'back'] as const) {
    const { lights } = vulturePainted(0.4, view);
    const eyes = lights.filter((L) => L.color === ENEMY_RIM);
    assert.equal(eyes.length, 2, `${view}: ${eyes.length} pink eye lights`);
  }
});

test('its size, the knight\'s: about the knight\'s height standing', () => {
  const k = tallOf(vultureStanding(0.4, 'front')) / tallOf(spriteOf3(MOVES3.rear, 0, 'front'));
  assert.ok(k > 0.85 && k < 1.2, `${k.toFixed(2)} times the knight's height`);
});

test('its bald head pale at the top of the picture, and its broken cult chain in sight from in front and behind', () => {
  for (const view of ['front', 'back'] as const) {
    const { px } = vulturePainted(0.4, view);
    let chain = 0;
    let pale = 0;
    for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) {
      const i = (y * px.w + x) * 4;
      if (px.d[i + 3] !== 255) continue;
      if (IRON_SET.has(`${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`)) chain++;
      if (y < 110 && px.d[i] > 140 && px.d[i + 1] > 130 && px.d[i + 2] > 120) pale++;
    }
    assert.ok(chain > 20, `${view}: ${chain} pixels of the cult's iron (the chain and the shackle)`);
    // (from behind the bald crown shows as a small pale patch only, the ruff and mantle hiding the rest)
    assert.ok(pale > (view === 'front' ? 30 : 12), `${view}: ${pale} pale pixels at the top (the bald head and neck)`);
  }
});
