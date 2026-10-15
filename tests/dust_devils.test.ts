// FLOOR 8'S DUST DEVILS (src/art/dust_devils.ts; a mock-up behind DEVIL_ON, off; nothing of the game imports it),
// held to his art rulebook before he sees them, from in front and from behind: crisp, its pink edge while it lives;
// nothing cyan, every light the cult's fire; nothing of it cut off at its canvas's edge; its size, his brief's
// (waist-high to the knight, thin and tall); nothing of it below the rock; its stand never still, and closing its loop.
//   run: tsx --test tests/dust_devils.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { DD_STAND, DEVIL_ON, devilPainted, devilSolids, makeDevilArt } from '../src/art/dust_devils';
import { RIM_ALPHA } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { rgba } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; notEqual(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const FIRE = new Set(FLAME.map((c) => rgba(c).slice(0, 3).join(',')));
type Frame = { name: string; alive: boolean; painted: () => Painted };
const frames: Frame[] = [];
const memo = (f: () => Painted): (() => Painted) => {
  let p: Painted | null = null;
  return () => (p ??= f());
};
// every move it has, both views, every other frame at sixteen a second through its whole length (and its last)
const LONG: [string, number, number][] = [['stand', DD_STAND.period, DD_STAND.fps]];
for (const view of ['front', 'back'] as const) {
  for (const [move, long, fps] of LONG) {
    const n = Math.round(long * fps);
    for (let i = 0; i <= n; i++) frames.push({ name: `${move} ${view} ${i}/${fps}`, alive: move !== 'dying', painted: memo(() => devilPainted(move, i / fps, view)) });
  }
}
type Solid = { part: string; piece: string; shape: any };
function bottomOf(sh: any): number {
  if (sh.k === 'rod') return Math.min(sh.a[2] - sh.ra, sh.b[2] - sh.rb);
  if (sh.k === 'ball') return sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  return Infinity;
}
function topOf(sh: any): number {
  if (sh.k === 'rod') return Math.max(sh.a[2] + sh.ra, sh.b[2] + sh.rb);
  if (sh.k === 'ball') return sh.c[2] + Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  return -Infinity;
}
/** The geometry of one moment, each number to a millionth (skins left out). */
function geom(move: string, t: number): string {
  return JSON.stringify(devilSolids(move, t), (k, v) => (k === 'skin' || k === 'ramp' ? undefined : typeof v === 'number' ? Math.round(v * 1e6) : v));
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
  assert.equal(DEVIL_ON.on, false);
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('dust_devils.ts')) continue;
    assert.ok(!/from ['"][^'"]*\/dust_devils['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the dust devils`);
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
    if (f.alive) assert.ok(rim > 60, `${f.name}: its pink edge, ${rim} pixels`);
    else assert.ok(rim === 0, `${f.name}: an edge as it dies`);
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

test('its size, his brief\'s: waist-high to the knight (58 tall, his waist about 30 up), about half his height; thin and tall, its bell in its heart', () => {
  for (let i = 0; i < DD_STAND.frames; i++) {
    let top = 0;
    let bell = -1;
    const lo = [Infinity, Infinity];
    const hi = [-Infinity, -Infinity];
    for (const b of devilSolids('stand', i / DD_STAND.fps) as Solid[]) {
      top = Math.max(top, topOf(b.shape));
      if (b.shape.k === 'rod') {
        for (const p of [b.shape.a, b.shape.b]) for (const k of [0, 1]) {
          lo[k] = Math.min(lo[k], p[k] - b.shape.ra);
          hi[k] = Math.max(hi[k], p[k] + b.shape.ra);
        }
      }
      if (b.piece === 'bell3') bell = b.shape.c[2];
    }
    const wide = Math.max(hi[0] - lo[0], hi[1] - lo[1]);
    assert.ok(top > 27 && top < 36, `its top ${top.toFixed(1)} up`);
    assert.ok(wide < 0.8 * top, `as wide as ${wide.toFixed(1)}, for its height ${top.toFixed(1)}`);
    assert.ok(bell > 0.3 * top && bell < 0.6 * top, `its bell ${bell.toFixed(1)} up`);
  }
});

test('nothing of it sinks into the rock: its lowest point is on the rock or above it, in every frame', () => {
  for (const [move, long, fps] of LONG) {
    let low = Infinity;
    for (let i = 0; i <= Math.round(long * fps); i++) for (const x of devilSolids(move, i / fps) as Solid[]) low = Math.min(low, bottomOf(x.shape));
    assert.ok(low >= -0.5, `${move}: its lowest point is ${low.toFixed(2)}, under the rock`);
  }
});

test('its stand is never still: no two frames running alike (Movement 6); and it closes its loop: its first and last moments the same', () => {
  for (let i = 0; i < DD_STAND.frames; i++) assert.notEqual(geom('stand', i / DD_STAND.fps), geom('stand', (i + 1) / DD_STAND.fps), `frames ${i} and ${i + 1} are the same`);
  assert.equal(geom('stand', 0), geom('stand', DD_STAND.period), 'its shape at the loop\'s end differs');
});

test('its pictures as the game holds them: standing sixteen a second', () => {
  const art = makeDevilArt() as any;
  assert.equal(art.front.idle.length, DD_STAND.frames);
  assert.equal(art.front.idleFps, 16);
});
