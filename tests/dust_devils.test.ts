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

import { DD_DIE, DD_LASH, DD_REEL, DD_STAND, DD_WALK, DEVIL_ON, devilPainted, devilSolids, makeDevilArt } from '../src/art/dust_devils';
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
// every move it has, both views, every frame at its own rate through its whole length (and its last)
const LONG: [string, number, number][] = [
  ['stand', DD_STAND.period, DD_STAND.fps],
  ['walk', DD_WALK.period, DD_WALK.fps],
  ['attack', DD_LASH.long, 30],
  ['reel', DD_REEL.long, 30],
  ['dying', DD_DIE.long, 30],
];
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
    if (f.alive) assert.ok(rim > 40, `${f.name}: its pink edge, ${rim} pixels`);
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

const pieceAt = (move: string, t: number, piece: string): any => (devilSolids(move, t) as Solid[]).find((x) => x.piece === piece)?.shape;
const has = (move: string, t: number, piece: string): boolean => pieceAt(move, t, piece) !== undefined;
const topAt = (move: string, t: number): number => Math.max(...(devilSolids(move, t) as Solid[]).filter((b) => b.part.startsWith('band') || b.part === 'far').map((b) => topOf(b.shape)));

test('its weave closes its loop, and is never still', () => {
  assert.equal(geom('walk', 0), geom('walk', DD_WALK.period), 'its shape at the loop\'s end differs');
  for (let i = 0; i < DD_WALK.frames; i++) assert.notEqual(geom('walk', i / DD_WALK.fps), geom('walk', (i + 1) / DD_WALK.fps), `frames ${i} and ${i + 1} are the same`);
});

test('its lash: spun up taller and held, trembling, its whip curled at its side (the warning); the whip lashing out to its reach at the blow; back on its stand at its end (Monsters 4, Movement 3)', () => {
  const L = DD_LASH;
  const stood = topAt('stand', 0);
  for (const t of [L.warn, (L.warn + L.throw) / 2, L.throw - 0.01]) {
    assert.ok(topAt('attack', t) > stood * 1.12, `at ${t} s it is not spun up tall (${topAt('attack', t).toFixed(1)} against ${stood.toFixed(1)})`);
    assert.ok(has('attack', t, 'whip1'), `at ${t} s its whip is not curled at its side`);
  }
  const tip = pieceAt('attack', L.hit, 'whip16').b;
  assert.ok(Math.hypot(tip[0] - L.reach, tip[1], tip[2] - 12) < 3, `its whip's tip at the blow is at ${tip.map((v: number) => v.toFixed(1))}`);
  assert.ok(!has('attack', L.long, 'whip1'), 'its whip still out at its end');
  assert.equal(geom('attack', L.long), geom('stand', 0), 'not back on its stand at its end');
});

test('struck, it flickers and stutters (his pick): its rings jolted, its bell\'s pink flickering, knocked back; spinning on its stand again at its end (Hits 3)', () => {
  const R = DD_REEL;
  let lit = 0;
  let dark = 0;
  for (let i = 0; i < Math.round(R.stutter * 30); i++) has('reel', i / 30, 'glow') ? lit++ : dark++;
  assert.ok(lit >= 2 && dark >= 2, `its pink does not flicker (${lit} lit, ${dark} dark)`);
  assert.notEqual(geom('reel', 1 / 30), geom('stand', 0), 'it does not stutter');
  assert.ok(pieceAt('reel', 0.06, 'bell3').c[0] < pieceAt('reel', 0, 'bell3').c[0] - 4, 'not knocked back');
  assert.equal(geom('reel', R.long), geom('stand', 0), 'not back on its stand at its end');
});

test('its death, his pick: the wind dies into a heap of its sand; its bell drops onto it, rings once, cracks, its pink out; still from its time (Hits 5)', () => {
  const Dd = DD_DIE;
  assert.ok(pieceAt('dying', Dd.drop, 'bell3').c[2] > 12, 'its bell not held up as it sags');
  const lowest = Math.min(...(devilSolids('dying', Dd.land) as Solid[]).filter((b) => b.part === 'bell').map((b) => bottomOf(b.shape)));
  assert.ok(lowest > 0 && lowest < 3, `its bell not down on the heap (its lowest ${lowest.toFixed(2)} up)`);
  assert.ok(!(devilSolids('dying', Dd.long) as Solid[]).some((b) => b.part.startsWith('band') || b.part === 'far'), 'some of its sand still whirls');
  assert.ok(has('dying', Dd.long, 'heap'), 'no heap of its sand');
  assert.ok(has('dying', Dd.long, 'crack1'), 'its bell not cracked');
  assert.ok(has('dying', Dd.crack + 0.04, 'glow') && !has('dying', Dd.out, 'glow'), 'its pink not burning through its crack, then out');
  assert.equal(geom('dying', Dd.still), geom('dying', Dd.long), 'not still from its time');
});

test('nothing jumps: its bell never moves further from one frame to the next than its move can (Movement 5)', () => {
  // (the flinch's knock snaps as it is struck, on one line: Hits 3; the lash's warning trembles)
  const most: Record<string, number> = { stand: 1.5, walk: 3, attack: 4.5, reel: 7, dying: 3 };
  for (const [move, long] of LONG) {
    for (let i = 0; i < Math.round(long * 30); i++) {
      const a = pieceAt(move, i / 30, 'bell3').c;
      const b = pieceAt(move, (i + 1) / 30, 'bell3').c;
      const d = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      assert.ok(d <= most[move], `${move}: its bell leaps ${d.toFixed(2)} at ${((i + 1) / 30).toFixed(2)} s`);
    }
  }
});

test('its pictures as the game holds them: standing and weaving sixteen a second, its lash, its flinch and its death at thirty', () => {
  const art = makeDevilArt() as any;
  const f = art.front;
  assert.equal(f.idle.length, DD_STAND.frames);
  assert.equal(f.walk.length, DD_WALK.frames);
  assert.equal(f.idleFps, 16);
  assert.equal(f.walkFps, 16);
  assert.equal(f.attack.length, 3);
  assert.equal(f.clips.attack.hit, DD_LASH.hit);
  assert.equal(f.clips.attack.frames.length, Math.round(DD_LASH.long * 30) + 1);
  assert.equal(f.clips.die.frames.length, Math.round(DD_DIE.long * 30) + 1);
  assert.equal(f.clips.reel.frames.length, Math.round(DD_REEL.long * 30) + 1);
});
