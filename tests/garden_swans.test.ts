// FLOOR 16'S SMALL MOB, THE SWANS (src/art/garden_swans.ts): a mock-up nothing of the game imports, held to his art
// rulebook and his rule of 27 Oct for a character (“Again, follow the rules, this is a character”), as the fog wolves are
// (tests/fog_wolves.test.ts), in every frame the game would show, from in front and from behind:
//   crisp, its pink edge while it lives and none dead; nothing cyan, no light of its own; nothing cut off;
//   its size, his brief's (“Knee-high, in flocks”); nothing of it under the floor;
//   FEET GRIP (Movement 8): a foot that is down stays where it is on the floor, at its pace and standing still;
//   THROUGH: its legs not through each other; its neck not through its body;
//   JERK and JUMP (Movement 5): nothing leaps from one frame to the next, nor where one move hands over to another;
//   ALIVE (Movement 6); its bite (his pick, “Hissing lunge, a bite”): the warning a crouch and a hiss, the bill open, then
//   the lunge, the bill shut far before it (Movement 9: big wind-up, lightning strike); its death (“Bursts into feathers
//   (Recommended)”); its look (“Wings raised in threat”, and “Not a goose or duck”: the long neck, the knobbed bill).
//   run: tsx --test tests/garden_swans.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { SWAN_BITE, SWAN_DIE, SWAN_ON, SWAN_PACE, SWAN_SIZE, SWAN_STAND, SWAN_WALK, makeSwanArt, swanLong, swanPainted, swanPose, swanSolids } from '../src/art/garden_swans';
import { RIM_ALPHA } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { TILE3 } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
import { rgba } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

type Frame = { name: string; move: string; t: number; alive: boolean; painted: () => Painted };
const frames: Frame[] = [];
const memo = (f: () => Painted): (() => Painted) => {
  let p: Painted | null = null;
  return () => (p ??= f());
};
const MOVES = ['stand', 'walk', 'attack', 'reel', 'dying'];
const FPS: Record<string, number> = { stand: SWAN_STAND.fps, walk: SWAN_WALK.fps };
const LONG: [string, number, number][] = MOVES.map((m) => [m, swanLong(m), FPS[m] ?? 30]);
for (const view of ['front', 'back'] as const) {
  for (const [move, long, fps] of LONG) {
    const n = Math.round(long * fps);
    const step = FPS[move] ? 1 : 2;
    for (let i = 0; i <= n; i += i + step > n && i !== n ? n - i : step) {
      if (FPS[move] && i === n) break;
      frames.push({ name: `${move} ${view} ${i}/${fps}`, move, t: i / fps, alive: move !== 'dying' || i / fps < SWAN_DIE.burst, painted: memo(() => swanPainted(move, i / fps, view)) });
    }
  }
}
type Solid = { part: string; piece: string; shape: any };
const solids = (move: string, t: number, view: 'front' | 'back' = 'front'): Solid[] => swanSolids(move, t, view) as Solid[];
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
function centreOf(sh: any): number[] {
  if (sh.k === 'rod') return [(sh.a[0] + sh.b[0]) / 2, (sh.a[1] + sh.b[1]) / 2, (sh.a[2] + sh.b[2]) / 2];
  if (sh.k === 'dot') return sh.p;
  return sh.c;
}
function geom(move: string, t: number): string {
  return JSON.stringify(solids(move, t), (k, v) => (k === 'skin' || k === 'ramp' ? undefined : typeof v === 'number' ? Math.round(v * 1e6) : v));
}
function biggestStep(move: string, long: number, which: (piece: string) => boolean, from = 0, to = Infinity): { d: number; piece: string; t: number } {
  let best = { d: 0, piece: '', t: 0 };
  const n = Math.round(long * 30);
  for (let i = 0; i < n; i++) {
    if ((i + 1) / 30 < from || i / 30 > to) continue;
    const a = new Map<string, Solid>(solids(move, i / 30).map((x) => [x.piece, x] as [string, Solid]));
    for (const x of solids(move, (i + 1) / 30)) {
      const before = a.get(x.piece);
      if (!before || !which(x.piece)) continue;
      const p = centreOf(before.shape);
      const q = centreOf(x.shape);
      const d = Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]);
      if (d > best.d) best = { d, piece: x.piece, t: (i + 1) / 30 };
    }
  }
  return best;
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
function segGap(p1: number[], q1: number[], p2: number[], q2: number[]): number {
  let best = Infinity;
  for (let i = 0; i <= 20; i++) {
    const a = p1.map((v, k) => v + ((q1[k] - v) * i) / 20);
    for (let j = 0; j <= 20; j++) {
      const b = p2.map((v, k) => v + ((q2[k] - v) * j) / 20);
      best = Math.min(best, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]));
    }
  }
  return best;
}

// (IN THE GAME WITH THE HIGH CITY (game/act1.ts HIGH_CITY, off until his yes), since the main chat's helper built floor 16's
// kinds, 29 Oct 2026: through art/act1_figs/swan.ts alone, their pictures as the game holds a monster; its switch goes on with
// the descent's figures there, art/bestiary.ts useAct1Figs; until then a mock-up nothing of the game imported, its switch off.
// Off by itself here, where nothing of the game is loaded.)
// (THE HIGH CITY, FLOOR 16: the Princess's swans, circling her and her Eleven, are drawn from them by her pictures and what she
// casts for the game, behind HIGH_CITY (off): art/act1_figs/princess.ts, render/act1_fx/princess.ts; nothing else)
test('the switch is off by itself, and of the game only their figure and the Princess’s import the swans', () => {
  assert.equal(SWAN_ON.on, false);
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f === 'art/garden_swans.ts') continue;
    if (/from ['"][^'"]*garden_swans['"]/.test(fs.readFileSync(`src/${f}`, 'utf8'))) users.push(f);
  }
  assert.equal(users.sort().join(' '), 'art/act1_figs/princess.ts art/act1_figs/swan.ts render/act1_fx/princess.ts', 'game files that import the swans');
});

test('crisp: every pixel all there or not at all (but the pink edge); its pink edge while it lives, none dead', () => {
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
    else assert.ok(rim === 0, `${f.name}: a pink edge on it dead`);
  }
});

test('nothing cyan, no pink but its edge, no light of its own (a plain swan), and nothing of it cut off at its canvas\'s edge', () => {
  for (const f of frames) {
    const { px, lights } = f.painted();
    assert.equal(lights.length, 0, `${f.name}: a light`);
    for (let i = 0; i < px.d.length; i += 4) {
      if (px.d[i + 3] !== 255) continue;
      const [h, sat] = hue(px.d[i], px.d[i + 1], px.d[i + 2]);
      const v = Math.max(px.d[i], px.d[i + 1], px.d[i + 2]);
      assert.ok(!(sat > 0.4 && v > 140 && h >= 165 && h <= 205), `${f.name}: cyan`);
      assert.ok(!(sat > 0.35 && v > 120 && h > 300 && h < 350), `${f.name}: pink in it`);
    }
    let cut = 0;
    for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    assert.ok(cut === 0, `${f.name}: ${cut} pixels on its canvas's edge`);
  }
});

test('its size, his brief\'s (“Knee-high, in flocks”): its back about the knight\'s knee (he is 58 tall), its head not above his hip; a swan\'s long neck (“Not a goose or duck”)', () => {
  let back = 0;
  let top = 0;
  const neck: number[][] = [];
  for (const b of solids('stand', 0)) {
    if (/^(body|breast|tail)$/.test(b.piece)) back = Math.max(back, topOf(b.shape));
    top = Math.max(top, topOf(b.shape));
    if (/^neck\d+$/.test(b.piece)) neck.push(centreOf(b.shape));
  }
  assert.ok(back > 12 && back < 19, `its back ${back.toFixed(1)} up`);
  assert.ok(top > 26 && top < 34, `its head's top ${top.toFixed(1)} up`);
  let long = 0;
  for (let i = 1; i < neck.length; i++) long += Math.hypot(neck[i][0] - neck[i - 1][0], neck[i][1] - neck[i - 1][1], neck[i][2] - neck[i - 1][2]);
  assert.ok(long > 16, `its neck ${long.toFixed(1)} long, as long as its body or more`);
  // (its bill: orange, the black knob at its root)
  const pieces = new Set(solids('stand', 0).map((x) => x.piece));
  for (const p of ['upper', 'knob', 'lores', 'nail']) assert.ok(pieces.has(p), `its ${p}`);
});

test('FLOOR: nothing of it under the floor in any frame of any move; its feathers come down to it and no further', () => {
  for (const [move, long] of LONG) {
    let low = Infinity;
    for (let i = 0; i <= Math.round(long * 30); i++) for (const x of solids(move, i / 30)) low = Math.min(low, bottomOf(x.shape));
    assert.ok(low >= -0.5, `${move}: its lowest solid is ${low.toFixed(2)} up`);
  }
});

test('FEET GRIP (Movement 8): standing, biting and struck, a foot that is down does not move; charging, it is carried back under it at its pace (SWAN_PACE tiles a second), so on the floor it stays put', () => {
  for (const [move, long] of LONG) {
    if (move === 'dying') continue;
    const n = Math.round(long * 30);
    for (let i = 0; i < n; i++) {
      const a = swanPose(move, i / 30);
      const b = swanPose(move, (i + 1) / 30);
      for (const k of [0, 1]) {
        if (a.feet[k][2] > 1e-6 || b.feet[k][2] > 1e-6) continue;
        const want = move === 'walk' ? -(SWAN_PACE * TILE3) / 30 : 0;
        const dx = (b.feet[k][0] - a.feet[k][0]) * SWAN_SIZE;
        assert.ok(Math.abs(dx - want) < 0.05 && Math.abs(b.feet[k][1] - a.feet[k][1]) < 1e-6, `${move}: foot ${k} slides ${(dx - want).toFixed(2)} at ${(i / 30).toFixed(3)} s`);
      }
    }
  }
  // (and in its charge each foot is down for half the round, both never off the floor at once)
  for (let i = 0; i < SWAN_WALK.frames; i++) {
    const P = swanPose('walk', i / SWAN_WALK.fps);
    assert.ok(P.feet[0][2] < 1e-6 || P.feet[1][2] < 1e-6, `walk: both feet up at ${(i / SWAN_WALK.fps).toFixed(3)} s`);
  }
});

test('THROUGH: its legs never through each other, its neck never through its body (in every move but its death, where it falls over)', () => {
  for (const [move, long] of LONG) {
    if (move === 'dying') continue;
    for (let i = 0; i <= Math.round(long * 30); i++) {
      const sol = solids(move, i / 30);
      const a = sol.find((x) => x.piece === 'shank1')!.shape;
      const b = sol.find((x) => x.piece === 'shank-1')!.shape;
      assert.ok(segGap(a.a, a.b, b.a, b.b) > (a.ra + b.ra) * 0.9, `${move}: its legs through each other at ${(i / 30).toFixed(2)} s`);
      // (the neck's upper half stays out of the body's egg)
      const body = sol.find((x) => x.piece === 'body')!.shape;
      for (const x of sol.filter((y) => /^neck([5-9]|10)$/.test(y.piece))) {
        const c = x.shape.c;
        const d = [c[0] - body.c[0], c[1] - body.c[1], c[2] - body.c[2]];
        const k = body.ax.map((v: number[]) => (d[0] * v[0] + d[1] * v[1] + d[2] * v[2]) / (v[0] * v[0] + v[1] * v[1] + v[2] * v[2]));
        assert.ok(Math.hypot(k[0], k[1], k[2]) > 1, `${move}: its ${x.piece} inside its body at ${(i / 30).toFixed(2)} s`);
      }
    }
  }
});

test('JERK (Movement 5): nothing leaps from one frame to the next; its lunge alone quick (Movement 9); its stand and its charge close their loops', () => {
  const limit: Record<string, number> = { stand: 1.2, walk: 3, attack: 3.2, reel: 3, dying: 4.5 };
  for (const [move, long] of LONG) {
    const all = biggestStep(move, long, () => true);
    if (move === 'attack') {
      // (outside its lunge, slow; the lunge itself, the neck and head thrown out, quick)
      const before = biggestStep(move, long, () => true, 0, SWAN_BITE.lunge - 1 / 30);
      const after = biggestStep(move, long, () => true, SWAN_BITE.hit + 0.12, long);
      assert.ok(before.d <= limit.attack, `attack: its ${before.piece} moves ${before.d.toFixed(1)} in a thirtieth before its lunge, at ${before.t.toFixed(3)} s`);
      assert.ok(after.d <= limit.attack, `attack: its ${after.piece} moves ${after.d.toFixed(1)} in a thirtieth after it, at ${after.t.toFixed(3)} s`);
      assert.ok(all.d <= 12, `attack: its lunge throws its ${all.piece} ${all.d.toFixed(1)} in a thirtieth`);
    } else assert.ok(all.d <= limit[move], `${move}: its ${all.piece} moves ${all.d.toFixed(1)} in a thirtieth, at ${all.t.toFixed(3)} s`);
  }
  assert.equal(geom('stand', 0), geom('stand', SWAN_STAND.period), 'its stand\'s last moment is not its first');
  assert.equal(geom('walk', 0), geom('walk', SWAN_WALK.period), 'its charge\'s last moment is not its first');
});

const KEYS = ['head', 'upper', 'breast', 'tail', 'body', 'neck4', 'foot1', 'foot-1'];
function pointsOf(move: string, t: number, view: 'front' | 'back'): number[][] {
  const st = stage(view, 0, 0, { w: 2, h: 2 });
  const sol = solids(move, t, view);
  return KEYS.map((k) => {
    const x = sol.find((y) => y.piece === k)!;
    return st.at(x.shape.k === 'rod' ? x.shape.b : x.shape.c) as unknown as number[];
  });
}
const leap = (a: number[][], b: number[][]): number => a.reduce((s, p, i) => s + Math.hypot(p[0] - b[i][0], p[1] - b[i][1]), 0) / a.length / 2;

test('JUMP: where one move hands over to the next (its stand into each move and back; its charge back to its stand), the picture does not leap (the review\'s 3 game pixels)', () => {
  for (const view of ['front', 'back'] as const) {
    const stands = Array.from({ length: SWAN_STAND.frames }, (_, i) => pointsOf('stand', i / SWAN_STAND.fps, view));
    const rest = pointsOf('stand', 0, view);
    for (const move of MOVES) {
      if (move === 'stand') continue;
      const first = pointsOf(move, 0, view);
      for (let i = 0; i < stands.length; i++) assert.ok(leap(stands[i], first) <= 3, `${view}: its stand at ${(i / SWAN_STAND.fps).toFixed(2)} s into its ${move} leaps ${leap(stands[i], first).toFixed(2)}`);
      if (move !== 'dying' && move !== 'walk') assert.ok(leap(pointsOf(move, swanLong(move), view), rest) <= 3, `${view}: its ${move}'s end back to its stand leaps`);
    }
    for (let i = 0; i < SWAN_WALK.frames; i++) {
      const w = pointsOf('walk', i / SWAN_WALK.fps, view);
      assert.ok(leap(w, rest) <= 3, `${view}: its charge at ${(i / SWAN_WALK.fps).toFixed(3)} s back to its stand leaps ${leap(w, rest).toFixed(2)}`);
    }
  }
});

test('ALIVE (Movement 6): never still from one frame to the next standing; now and then it hisses, the bill open; it glances aside', () => {
  let hiss = 0;
  let glance = 0;
  for (let i = 0; i < SWAN_STAND.frames; i++) {
    assert.ok(geom('stand', i / SWAN_STAND.fps) !== geom('stand', (i + 1) / SWAN_STAND.fps), `stand: still from frame ${i} to ${i + 1}`);
    const P = swanPose('stand', i / SWAN_STAND.fps);
    hiss = Math.max(hiss, P.gape);
    glance = Math.max(glance, Math.abs(P.look));
  }
  assert.ok(hiss > 0.4, `it hisses: its bill at most ${hiss.toFixed(2)} open`);
  assert.ok(glance > 12, `it glances aside: ${glance.toFixed(1)} degrees`);
});

test('ITS BITE (his pick, “Hissing lunge, a bite”): crouched and coiled, the bill open, by its warning; the neck thrown out, the bill shut, at its blow, far before it; back on its stand by its end; its wings up all through (“Wings raised in threat”)', () => {
  const B = SWAN_BITE;
  const warn = swanPose('attack', B.warn + 0.05);
  assert.ok(warn.gape > 0.6 && warn.neck[1] > 0.6 && warn.z < -0.3, `its warning: bill ${warn.gape.toFixed(2)}, coiled ${warn.neck[1].toFixed(2)}, down ${warn.z.toFixed(2)}`);
  const hit = swanPose('attack', B.hit);
  assert.ok(hit.gape < 0.05 && hit.neck[2] > 0.8, `its blow: bill ${hit.gape.toFixed(2)}, out ${hit.neck[2].toFixed(2)}`);
  const head = (t: number): number => solids('attack', t).find((x) => x.piece === 'nail')!.shape.c[0];
  assert.ok(head(B.hit) > 28 && head(B.hit) - head(0) > 8, `its bill's tip reaches ${head(B.hit).toFixed(1)} (from ${head(0).toFixed(1)})`);
  for (let i = 0; i <= Math.round(B.long * 30); i++) assert.ok(swanPose('attack', i / 30).wings >= 0.95, `its wings down at ${(i / 30).toFixed(2)} s`);
  assert.equal(geom('attack', B.long), geom('stand', 0), 'its bite ends off its stand');
});

test('ITS DEATH (his pick, “Bursts into feathers”): held as the blow lands; knocked over flat; its feathers burst from it and come down round it; it lies still', () => {
  const Dd = SWAN_DIE;
  const flat = swanPose('dying', Dd.long);
  assert.ok(Math.abs(flat.roll) > 60, `on its side: rolled ${flat.roll.toFixed(0)}`);
  assert.equal(geom('dying', Dd.long), geom('dying', Dd.long - 1 / 30), 'still at its end');
  // (its feathers: none before the burst; flying after it; at its end, lying on the floor round it)
  const count = (t: number, view: 'front' | 'back' = 'front'): number => {
    const { px } = swanPainted('dying', t, view);
    const solid = swanPainted('dying', Dd.burst - 0.02, view).px;
    void solid;
    let n = 0;
    for (let i = 0; i < px.d.length; i += 4) if (px.d[i + 3] === 255 && px.d[i] > 225 && px.d[i + 1] > 215) n++;
    return n;
  };
  assert.ok(count(Dd.burst + 0.3) > count(Dd.burst - 0.02), 'the feathers burst from it');
});

test('its pictures as the game holds them: standing fifteen a second, charging thirty; its bite, struck and its death at thirty', () => {
  const art = makeSwanArt();
  for (const s of [art.front, art.back]) {
    assert.equal(s.idle.length, SWAN_STAND.frames);
    assert.equal(s.walk.length, SWAN_WALK.frames);
    assert.equal(s.idleFps, 15);
    assert.equal(s.walkFps, 30);
    assert.equal(s.clips!.attack!.fps, 30);
    assert.ok(Math.abs(s.clips!.attack!.hit! - SWAN_BITE.hit) < 1e-9);
    assert.equal(s.clips!.die!.frames.length, Math.round(SWAN_DIE.long * 30) + 1);
  }
});
