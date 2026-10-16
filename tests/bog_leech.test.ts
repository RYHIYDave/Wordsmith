// THE BOG LEECHES, FLOOR 10'S TINY MOB (src/art/bog_leech.ts; a mock-up nothing of the game imports), held to his
// rulebook before he sees it: crisp in every frame, the enemy's pink edge round it while it lives, nothing cyan and
// every light the enemy's fire, nothing of it cut off at its canvas's edge; its size (his pick: tiny, knee-high to
// the knight when it rears); its round mouth of teeth (his pick), flaring open on its pink gullet.
//   run: tsx --test tests/bog_leech.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { BL_LONG, BL_STAND, GULLET, LEECH_ON, leechPainted, makeLeechArt, standPose } from '../src/art/bog_leech';
import { RIM_ALPHA } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { spriteOf3 } from '../src/art/heroes3';
import { MOVES3 } from '../src/art/moves3';
import { rgba } from '../src/engine/px';
import type { Px, Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const FIRE = new Set(FLAME.map((c) => rgba(c).slice(0, 3).join(',')));
const PINK = new Set(GULLET.map((c) => rgba(c).slice(0, 3).join(',')));
const VIEWS = ['front', 'back'] as const;
type Frame = { name: string; t: number; view: string; px: Px; lights: { color: string }[] };
const living: Frame[] = [];
for (let i = 0; i < Math.round(BL_STAND * 30); i++) for (const view of VIEWS) {
  const p = leechPainted('stand', i / 30, view);
  living.push({ name: `leech stand ${view} ${(i / 30).toFixed(2)}`, t: i / 30, view, px: p.px, lights: p.lights });
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
const pinkOf = (px: Px): number => {
  let n = 0;
  for (let i = 0; i < px.d.length; i += 4) if (px.d[i + 3] === 255 && PINK.has(`${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`)) n++;
  return n;
};

test('the switch is off, and nothing of the game imports it', () => {
  assert.equal(LEECH_ON.on, false);
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('bog_leech.ts')) continue;
    assert.ok(!/from ['"][^'"]*\/bog_leech['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the Bog Leech`);
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
    assert.ok(rim > 40, `${name}: its pink edge, ${rim} pixels`);
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

test('its size (his pick): tiny, its body its length, reared to about the knight\'s knee, well under half his height', () => {
  for (let i = 0; i < 16; i++) {
    const s = standPose(i / 10).spine;
    let long = 0;
    for (let k = 1; k < s.length; k++) long += Math.hypot(s[k][0] - s[k - 1][0], s[k][1] - s[k - 1][1], s[k][2] - s[k - 1][2]);
    assert.ok(Math.abs(long - BL_LONG) < 0.5, `its length ${long.toFixed(1)}`);
    assert.ok(s[0][2] > 10 && s[0][2] < 19, `its mouth reared to ${s[0][2].toFixed(1)} (the knight's knee about 16)`);
    assert.ok(s[s.length - 1][2] < 0.5, 'its tail on the floor');
  }
  const knight = tallOf(spriteOf3(MOVES3.rear, 0, 'front'));
  const k = tallOf(makeLeechArt().front.idle[0]) / knight;
  assert.ok(k > 0.15 && k < 0.45, `${k.toFixed(2)} times the knight's height`);
});

test('its round mouth of teeth (his pick): shut most of its stand; once a round flared open on its pink gullet, its light the enemy\'s', () => {
  const shut = living.filter((f) => f.view === 'front' && (f.t < 0.85 || f.t > 1.4));
  for (const f of shut) {
    assert.ok(pinkOf(f.px) === 0, `${f.name}: its mouth shut, ${pinkOf(f.px)} pink`);
    assert.equal(f.lights.length, 0, `${f.name}: no light while its mouth is shut`);
  }
  for (const view of VIEWS) {
    const open = leechPainted('stand', 1.12, view);
    assert.ok(view === 'back' || pinkOf(open.px) >= 12, `${view}: its gullet showing, ${pinkOf(open.px)} pixels`);
    assert.ok(open.lights.length > 0, `${view}: its gullet's light`);
  }
});
