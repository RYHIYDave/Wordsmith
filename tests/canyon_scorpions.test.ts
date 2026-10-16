// FLOOR 8'S CANYON SCORPIONS (src/art/canyon_scorpions.ts; a mock-up behind SCORPION_ON, off; nothing of the game
// imports it), held to his art rulebook before he sees them, in every move from in front and from behind: crisp, its
// pink edge while it lives and none once it is dead; nothing cyan, every light the cult's fire; nothing of it cut off
// at its canvas's edge; its size, his brief's (knee-high to the knight); nothing of it below the rock; its stand
// alive and its feet still; its scuttle's feet gripping the rock; its pincer snap and its tail strike wound up, held,
// and followed through, the strike held a tenth; its flinch and its death as his picks ask; nothing jumps.
//   run: tsx --test tests/canyon_scorpions.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { FIG as FIG_SCORPION } from '../src/art/act1_figs/scorpion';
import { SCORPION_ON, SC_DIE, SC_FEET, SC_PACE, SC_REEL, SC_SNAP, SC_STAND, SC_STING, SC_WALK, makeScorpionArt, scorpionChipCount, scorpionFeet, scorpionPainted, scorpionSolids } from '../src/art/canyon_scorpions';
import { TILE3 } from '../src/art/new_mobs3';
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
// every move it has, both views, every third frame at thirty a second through its whole length (and its last)
const LONG: [string, number][] = [
  ['stand', SC_STAND.period],
  ['walk', SC_WALK.period],
  ['attack', SC_SNAP.long],
  ['sting', SC_STING.long],
  ['reel', SC_REEL.long],
  ['dying', SC_DIE.long],
];
for (const view of ['front', 'back'] as const) {
  for (const [move, long] of LONG) {
    const n = Math.round(long * 30);
    for (let i = 0; i <= n; i += i + 3 > n && i !== n ? n - i : 3) frames.push({ name: `${move} ${view} ${i}/30`, alive: move !== 'dying', painted: memo(() => scorpionPainted(move, i / 30, view)) });
  }
}
type Solid = { part: string; piece: string; shape: any };
const pieceAt = (move: string, t: number, piece: string): any => (scorpionSolids(move, t) as Solid[]).find((x) => x.piece === piece)?.shape;
function bottomOf(sh: any): number {
  if (sh.k === 'rod') return Math.min(sh.a[2] - sh.ra, sh.b[2] - sh.rb);
  if (sh.k === 'ball') return sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  return Infinity;
}
function centreOf(sh: any): number[] {
  if (sh.k === 'rod') return [(sh.a[0] + sh.b[0]) / 2, (sh.a[1] + sh.b[1]) / 2, (sh.a[2] + sh.b[2]) / 2];
  if (sh.k === 'dot' || sh.k === 'glow') return sh.p;
  return sh.c;
}
/** The geometry of one moment, each number to a millionth (skins left out). */
function geom(move: string, t: number): string {
  return JSON.stringify(scorpionSolids(move, t), (k, v) => (k === 'skin' || k === 'ramp' ? undefined : typeof v === 'number' ? Math.round(v * 1e6) : v));
}
/** The largest move of any part (by its middle) from one frame (1/30 s) to the next, and where. */
function biggestStep(move: string, long: number, skip: (piece: string) => boolean = () => false): { d: number; piece: string; t: number } {
  let best = { d: 0, piece: '', t: 0 };
  const n = Math.round(long * 30);
  for (let i = 0; i < n; i++) {
    const a = new Map<string, Solid>((scorpionSolids(move, i / 30) as Solid[]).map((x) => [x.piece, x] as [string, Solid]));
    for (const x of scorpionSolids(move, (i + 1) / 30) as Solid[]) {
      const before = a.get(x.piece);
      if (!before || skip(x.piece)) continue;
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

// (ACT 1 IN THE GAME: no longer a mock-up nothing imports. The game holds its pictures through art/act1_figs/scorpion.ts
// alone, and its switch goes on with the descent, as the bestiary throws the switches of every kind of it.)
test('in the game through art/act1_figs/scorpion.ts alone, its switch thrown with the descent', () => {
  assert.ok(FIG_SCORPION !== null && (FIG_SCORPION.switches ?? []).includes(SCORPION_ON), 'its switch is one the bestiary throws with the descent');
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('canyon_scorpions.ts')) continue;
    const at = f.split('\\').join('/');
    if (at === 'art/act1_figs/scorpion.ts') continue;
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

test('nothing of it sinks into the rock: its lowest point is on the rock or above it, in every move and every frame', () => {
  for (const [move, long] of LONG) {
    let low = Infinity;
    for (let i = 0; i <= Math.round(long * 30); i++) for (const x of scorpionSolids(move, i / 30) as Solid[]) low = Math.min(low, bottomOf(x.shape));
    assert.ok(low >= -0.5, `${move}: its lowest point is ${low.toFixed(2)}, under the rock`);
  }
});

test('its stand is alive: never still from one frame to the next, and its feet stay where they are (Movement 6, Movement 8)', () => {
  for (let i = 0; i < SC_STAND.frames; i++) {
    assert.notEqual(geom('stand', i / SC_STAND.fps), geom('stand', (i + 1) / SC_STAND.fps), `frames ${i} and ${i + 1} are the same`);
    assert.equal(JSON.stringify(scorpionFeet('stand', i / SC_STAND.fps)), JSON.stringify(SC_FEET), `its feet move at ${i / SC_STAND.fps} s`);
  }
});

test('its stand and its scuttle each close their loop: the first and the last moments are the same', () => {
  for (const [move, period] of [['stand', SC_STAND.period], ['walk', SC_WALK.period]] as const) assert.equal(geom(move, 0), geom(move, period), `${move}: its shape at the loop's end differs`);
});

test('its scuttle: four feet on the rock at every moment, the two sets taking turns; a foot on the rock stays on its spot while the rock slides under it at its pace (Movement 8)', () => {
  let fewest = 8;
  for (let i = 0; i < 256; i++) fewest = Math.min(fewest, scorpionFeet('walk', (i / 256) * SC_WALK.period).filter((f) => f[2] < 1e-6).length);
  assert.ok(fewest >= 4, `at some moment only ${fewest} feet are on the rock`);
  const V = SC_PACE * TILE3;
  const dt = 1 / 480;
  for (let leg = 0; leg < 8; leg++) {
    for (let t = 0; t + dt < SC_WALK.period * 2; t += dt) {
      const a = scorpionFeet('walk', t)[leg];
      const b = scorpionFeet('walk', t + dt)[leg];
      if (a[2] < 1e-6 && b[2] < 1e-6) {
        const slip = V * dt + (b[0] - a[0]);
        assert.ok(Math.abs(slip) < 1e-6 && Math.abs(b[1] - a[1]) < 1e-9, `leg ${leg} slips ${slip.toFixed(4)} at ${t.toFixed(4)} s`);
      }
    }
  }
});

test('no foot on the rock moves across it in any move but its scuttle: a foot that is down stays where it lands (Movement 8)', () => {
  const dt = 1 / 300;
  for (const [move, long] of LONG) {
    if (move === 'walk') continue;
    for (let t = 0; t + dt <= long; t += dt) {
      const a = scorpionFeet(move, t);
      const b = scorpionFeet(move, t + dt);
      for (let i = 0; i < 8; i++) {
        if (a[i][2] < 1e-6 && b[i][2] < 1e-6) assert.ok(Math.abs(a[i][0] - b[i][0]) + Math.abs(a[i][1] - b[i][1]) < 1e-6, `${move}: foot ${i} slides at ${t.toFixed(3)} s`);
      }
    }
  }
});

test('its pincer snap: its pincers drawn back wide and held trembling (the warning), snapped shut far before it at the blow, and back on its stand (Movement 3, Monsters 4)', () => {
  const hand = (t: number): number[] => pieceAt('attack', t, 'hand0').c;
  const y0 = hand(0)[1];
  assert.ok(hand(0.2)[1] > y0 + 6, `its pincer spreads ${(hand(0.2)[1] - y0).toFixed(1)} wide in the warning`);
  assert.ok(Math.hypot(hand(0.2)[0] - hand(0.23)[0], hand(0.2)[1] - hand(0.23)[1]) < 3, 'and is held there');
  assert.ok(hand(SC_SNAP.hit)[0] > hand(0)[0] + 12, `its pincer strikes ${(hand(SC_SNAP.hit)[0] - hand(0)[0]).toFixed(1)} forward at ${SC_SNAP.hit} s`);
  assert.ok(hand(0.4)[0] > hand(SC_SNAP.hit)[0], 'and carries on through the blow');
  assert.equal(geom('attack', SC_SNAP.long), geom('stand', 0), 'it is back on its stand at its end');
});

test('its tail strike: the tail drawn back high and held (the warning), the stab held a tenth of a second, its venom bursting on the floor two tiles on, and back on its stand (Movement 3, Movement 7, Monsters 4)', () => {
  const bulb = (t: number): number[] => pieceAt('sting', t, 'bulb').c;
  assert.ok(bulb(0.45)[0] < bulb(0)[0] - 3, `its sting is drawn back ${(bulb(0) [0] - bulb(0.45)[0]).toFixed(1)} in the warning`);
  const held = geom('sting', SC_STING.hit);
  for (const t of [SC_STING.hit + 0.03, SC_STING.hit + 0.07, SC_STING.hit + SC_STING.freeze - 0.005]) assert.equal(geom('sting', t), held, `the stab moves at ${t.toFixed(3)} s`);
  assert.ok(bulb(SC_STING.hit)[0] > bulb(0)[0] + 10, `its sting stabs ${(bulb(SC_STING.hit)[0] - bulb(0)[0]).toFixed(1)} forward`);
  const splash = scorpionPainted('sting', SC_STING.hit + SC_STING.freeze + 0.15, 'front').lights;
  assert.ok(splash.length > 0, 'its venom bursts with a light of the cult\'s fire');
  assert.ok(scorpionChipCount('sting', SC_STING.hit + SC_STING.freeze + 0.15) > 10, 'and a splash of it on the floor');
  assert.equal(geom('sting', SC_STING.long), geom('stand', 0), 'it is back on its stand at its end');
});

test('its flinch: frozen as the blow lands, knocked back and up, its shell chipping, and back on its stand by its end (Hits 3, Hits 4)', () => {
  const frozen = geom('reel', 0);
  for (const t of [0.03, SC_REEL.freeze - 0.005]) assert.equal(geom('reel', t), frozen, `moves during the freeze at ${t}`);
  const head = (t: number): number[] => pieceAt('reel', t, 'head').c;
  assert.ok(head(0.2)[0] < head(0)[0] - 5, `its head goes back ${(head(0)[0] - head(0.2)[0]).toFixed(1)}`);
  assert.ok(head(0.2)[2] > head(0)[2] + 3, `and up ${(head(0.2)[2] - head(0)[2]).toFixed(1)}`);
  assert.ok(scorpionChipCount('reel', 0.2) > 0, 'flakes of its shell fly');
  assert.equal(geom('reel', SC_REEL.long), geom('stand', 0), 'it is back on its stand at its end');
});

test('its death: frozen as the blow lands; on its back by its time, its legs up; its sting and eyes out; still to its end (Hits 5)', () => {
  const frozen = geom('dying', 0);
  for (const t of [0.03, 0.07]) assert.equal(geom('dying', t), frozen, `moves in the blow's freeze at ${t}`);
  const back = pieceAt('dying', SC_DIE.flipped + 0.15, 'back');
  const feet = scorpionFeet('dying', SC_DIE.flipped + 0.15);
  assert.ok(feet.every((f) => f[2] > back.c[2]), 'its feet are up over its body: it is on its back');
  assert.equal(scorpionPainted('dying', SC_DIE.out + 0.01, 'front').lights.length, 0, 'its sting and its eyes are out');
  assert.ok(scorpionPainted('dying', 0.2, 'front').lights.length > 0, 'and still burning at 0.2 s');
  const still = geom('dying', SC_DIE.still);
  for (const t of [SC_DIE.still + 0.05, SC_DIE.long]) assert.equal(geom('dying', t), still, `something moves at ${t} s`);
});

test('nothing jumps: from one frame to the next no part moves further than its move can (Movement 5); its blows alone are quick', () => {
  // (its stand and its scuttle are small and smooth. Its blows are quick by their nature: the pincers' snap (its fingers
  // 24 picture pixels in its last frame), the tail's whip into the stab (its barb 20); its flinch's knock snaps as the
  // freeze ends (its fingers 15.5) and dies away; its death's throw flings its tail out straight as it rolls over (its barb
  // 26 at the throw), each on one continuous arc: the blow's own punch, not a jump)
  const limit: Record<string, number> = { stand: 1.5, walk: 4, attack: 26, sting: 22, reel: 17, dying: 28 };
  for (const [move, long] of LONG) {
    const worst = biggestStep(move, long);
    assert.ok(worst.d <= limit[move], `${move}: ${worst.piece} moves ${worst.d.toFixed(1)} in one frame, at ${worst.t.toFixed(3)} s`);
  }
  // (its body moves less in its blows than what strikes, its pincers and its tail: the snap's lunge drives its body in
  // behind its pincers, 5.9 in its fastest frame; the strike's lunge in under its tail as it whips, 6.8)
  const body = (move: string, long: number): number => biggestStep(move, long, (p) => !/^(back|head)$/.test(p)).d;
  assert.ok(body('attack', SC_SNAP.long) <= 6.5, `the snap's body moves ${body('attack', SC_SNAP.long).toFixed(1)} in one frame`);
  assert.ok(body('sting', SC_STING.long) <= 7.5, `the strike's body moves ${body('sting', SC_STING.long).toFixed(1)} in one frame`);
});

test('what its moves throw off comes and goes: nothing standing or scuttling; dust as it snaps; its venom as it stabs; its shell as it is struck and as it dies', () => {
  for (const move of ['stand', 'walk']) for (const t of [0, 0.2, 0.4]) assert.equal(scorpionChipCount(move, t), 0, `${move} at ${t} s throws nothing off`);
  assert.ok(scorpionChipCount('attack', SC_SNAP.hit + 0.02) > 0, 'its snap kicks up dust');
  assert.equal(scorpionChipCount('attack', SC_SNAP.long), 0, 'gone by its end');
  assert.ok(scorpionChipCount('reel', 0.2) > 0, 'its flinch throws shell off');
  assert.equal(scorpionChipCount('reel', SC_REEL.long), 0, 'gone by its end');
  assert.ok(scorpionChipCount('dying', 0.3) > 0, 'its death throws shell off');
  assert.equal(scorpionChipCount('dying', SC_DIE.long), 0, 'gone by its end');
  assert.equal(scorpionChipCount('sting', SC_STING.long), 0, 'its venom gone by its end');
});

test('its pictures as the game holds them: standing ten a second, scuttling sixteen, the snap, the strike, the flinch and the death at thirty', () => {
  const art = makeScorpionArt() as any;
  const f = art.front;
  assert.equal(f.idle.length, SC_STAND.frames);
  assert.equal(f.walk.length, SC_WALK.frames);
  assert.equal(f.idleFps, 10);
  assert.equal(f.walkFps, 16);
  assert.equal(f.attack.length, 3);
  assert.equal(f.clips.attack.hit, SC_SNAP.hit);
  assert.equal(f.clips.moves.sting.hit, SC_STING.hit);
  assert.equal(f.clips.moves.sting.frames.length, Math.round(SC_STING.long * 30) + 1);
  assert.equal(f.clips.die.frames.length, Math.round(SC_DIE.long * 30) + 1);
  assert.equal(f.clips.reel.frames.length, Math.round(SC_REEL.long * 30) + 1);
});

