// THE BOG LEECHES, FLOOR 10'S TINY MOB (src/art/bog_leech.ts; in the game through art/act1_figs/leech.ts), held to his
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

import { ACT1 } from '../src/game/act1';
// (the bestiary throws the art chat's switches for the descent's kinds with the descent's own: useAct1Figs)
import '../src/art/bestiary';
import { BL_ATTACK, BL_DIE, BL_HIT, BL_LAND, BL_LATCH, BL_LETGO, BL_LONG, BL_PACE, BL_POP, BL_REEL, BL_STAND, BL_WALK, BL_WARN, GULLET, LEECH_ON, attackPose, leechPainted, makeLeechArt, reelPose, slitherPose, standPose } from '../src/art/bog_leech';
import { TILE3 } from '../src/art/new_mobs3';
import type { V3 } from '../src/art/skeleton';
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
const moving: Frame[] = [];
const moves: [string, number, number][] = [['walk', BL_WALK.frames / BL_WALK.fps, 1], ['attack', BL_ATTACK, 2], ['reel', BL_REEL, 1]];
for (const [mv, long, every] of moves) for (let i = 0; i <= Math.round(long * 30); i += every) for (const view of VIEWS) {
  const p = leechPainted(mv, i / 30, view);
  moving.push({ name: `leech ${mv} ${view} ${(i / 30).toFixed(2)}`, t: i / 30, view, px: p.px, lights: p.lights });
}
const dying: Frame[] = [];
for (let i = 0; i <= BL_DIE * 20; i++) for (const view of VIEWS) {
  const p = leechPainted('dying', i / 20, view);
  dying.push({ name: `leech dying ${view} ${(i / 20).toFixed(2)}`, t: i / 20, view, px: p.px, lights: p.lights });
}
const spineGap = (a: V3[], b: V3[]): number => Math.max(...a.map((q, i) => Math.hypot(q[0] - b[i][0], q[1] - b[i][1], q[2] - b[i][2])));
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

// (IN THE GAME since the descent came in, 16 Oct 2026: through art/act1_figs/leech.ts alone, its switch on with the
// descent's; until then a mock-up nothing of the game imported, its switch off)
test('in the game through art/act1_figs/leech.ts alone, its switch on with the descent', () => {
  assert.equal(LEECH_ON.on, ACT1.on);
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev')) continue;
    const dir = f.split('/').slice(0, -1);
    for (const m of fs.readFileSync(`src/${f}`, 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const q of m[1].split('/')) if (q === '..') parts.pop(); else if (q !== '.') parts.push(q);
      if (parts.join('/') === 'art/bog_leech') users.push(f);
    }
  }
  assert.equal(users.join(', '), 'art/act1_figs/leech.ts', 'only its pictures for the game import the Bog Leech');
});

test('crisp: every pixel all there or not at all (but the pink edge), and the pink edge round it while it lives', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  for (const { name, px } of [...living, ...moving]) {
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

test('crisp as it dies, and no pink edge once it is dying', () => {
  for (const { name, px } of dying) {
    let soft = 0;
    for (let i = 0; i < px.d.length; i += 4) if (px.d[i + 3] !== 0 && px.d[i + 3] !== 255) soft++;
    assert.ok(soft === 0, `${name}: ${soft} soft pixels`);
  }
});

test('nothing cyan, and every light it gives is the enemy\'s fire', () => {
  for (const { name, px, lights } of [...living, ...moving, ...dying]) {
    for (let i = 0; i < px.d.length; i += 4) {
      if (px.d[i + 3] === 0) continue;
      const [h, sat] = hue(px.d[i], px.d[i + 1], px.d[i + 2]);
      assert.ok(!(sat > 0.4 && Math.max(px.d[i], px.d[i + 1], px.d[i + 2]) > 140 && h >= 165 && h <= 205), `${name}: cyan ${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`);
    }
    for (const L of lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${name}: its light ${L.color}`);
  }
});

test('nothing of it cut off at its canvas\'s edge, in any frame', () => {
  for (const { name, px } of [...living, ...moving, ...dying]) {
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

test('ITS SLITHER (his pick: like a snake): its body on one track on the floor, every point of it following its head, never sliding off it sideways; its round closing', () => {
  const V = BL_PACE * TILE3;
  const T = BL_WALK.frames / BL_WALK.fps;
  for (let i = 0; i < 24; i++) {
    const t = (i / 24) * T;
    const dt = 1 / 120;
    const a = slitherPose(t).spine.map((q) => [q[0] + V * t, q[1]] as [number, number]);
    const b = slitherPose(t + dt).spine.map((q) => [q[0] + V * (t + dt), q[1]] as [number, number]);
    // (each point of it a moment later lies on the track its body lay along a moment before; its head goes on ahead onto new track)
    for (let k = 1; k < b.length - 1; k++) {
      let best = Infinity;
      for (let j = 0; j < a.length - 1; j++) {
        const [x0, y0] = a[j];
        const [x1, y1] = a[j + 1];
        const dx = x1 - x0;
        const dy = y1 - y0;
        const f = Math.max(0, Math.min(1, ((b[k][0] - x0) * dx + (b[k][1] - y0) * dy) / (dx * dx + dy * dy)));
        best = Math.min(best, Math.hypot(b[k][0] - x0 - f * dx, b[k][1] - y0 - f * dy));
      }
      assert.ok(best < 0.6, `at ${t.toFixed(3)} s its point ${k} off its track by ${best.toFixed(2)}`);
    }
  }
  assert.ok(spineGap(slitherPose(0).spine, slitherPose(T).spine) < 0.05, 'its round closes');
  let long = 0;
  const s = slitherPose(0.1).spine;
  for (let k = 1; k < s.length; k++) long += Math.hypot(s[k][0] - s[k - 1][0], s[k][1] - s[k - 1][1], s[k][2] - s[k - 1][2]);
  assert.ok(Math.abs(long - BL_LONG) < 1.5, `its length slithering ${long.toFixed(1)}`);
});

test('ITS LEAP AND LATCH (his pick): from its stand; reared to your knee, its mouth flared and its gullet\'s light (the warning); its mouth on you at the blow; swelling as it drinks; down on the floor once it lets go; back as it stood', () => {
  const s0 = standPose(0).spine;
  assert.ok(spineGap(attackPose(0).spine, s0) < 0.01, 'from its stand');
  for (let t = BL_WARN[0]; t <= BL_WARN[1]; t += 0.05) {
    const p = attackPose(t);
    assert.ok(p.gape > 0.95 && p.spine[0][2] > 14, `${t.toFixed(2)} s: reared ${p.spine[0][2].toFixed(1)}, its mouth ${p.gape.toFixed(2)}`);
    assert.ok(leechPainted('attack', t, 'front').lights.length > 0, `${t.toFixed(2)} s: its gullet's light`);
  }
  const hit = attackPose(BL_HIT).spine[0];
  const off = Math.hypot(hit[0] - BL_LATCH[0], hit[1] - BL_LATCH[1], hit[2] - BL_LATCH[2]);
  assert.ok(off < 1, `its mouth on you at the blow (${off.toFixed(2)} off)`);
  let last = -1;
  for (let t = BL_HIT; t < BL_LETGO; t += 0.05) {
    const f = attackPose(t).fat;
    assert.ok(f >= last - 1e-9, `swelling as it drinks (${f.toFixed(2)} at ${t.toFixed(2)} s)`);
    last = f;
  }
  assert.ok(attackPose(BL_LETGO - 0.01).fat > 0.95, 'gorged as it lets go');
  assert.ok(Math.max(...attackPose(BL_LAND).spine.map((q) => q[2])) < 5, 'down on the floor');
  assert.ok(spineGap(attackPose(BL_ATTACK).spine, s0) < 0.01 && attackPose(BL_ATTACK).fat < 0.01, 'back as it stood');
});

test('STRUCK: from its stand, flung back and gaping, and back as it stood', () => {
  const s0 = standPose(0).spine;
  assert.ok(spineGap(reelPose(0).spine, s0) < 0.01, 'from its stand');
  assert.ok(spineGap(reelPose(BL_REEL).spine, s0) < 0.01, 'back as it stood');
  assert.ok(spineGap(reelPose(BL_REEL * 0.4).spine, s0) > 6, 'flung');
});

test('ITS DEATH (his pick: it bursts in a dark splash): swelling, then nothing of its body: a dark stain, scraps and drops; no light once it has burst', () => {
  const before = leechPainted('dying', BL_POP - 0.02, 'front');
  const after = leechPainted('dying', BL_DIE, 'front');
  let n0 = 0;
  let n1 = 0;
  for (let i = 3; i < before.px.d.length; i += 4) if (before.px.d[i] === 255) n0++;
  for (let i = 3; i < after.px.d.length; i += 4) if (after.px.d[i] === 255) n1++;
  assert.ok(n0 > 300, `swollen before it bursts (${n0} pixels)`);
  assert.ok(n1 > 200, `its stain, scraps and drops left (${n1} pixels)`);
  for (const f of dying.filter((d) => d.t >= BL_POP)) assert.equal(f.lights.length, 0, `${f.name}: no light once it has burst`);
  // (nothing left standing: what is left lies on the floor, its picture no taller than the stain's)
  let top = after.px.h;
  for (let y = 0; y < after.px.h; y++) for (let x = 0; x < after.px.w; x++) if (after.px.d[(y * after.px.w + x) * 4 + 3] === 255) top = Math.min(top, y);
  assert.ok(108 - top < 30, `lying on the floor (${108 - top} up)`);
});

test('as the game holds a monster: both facings, its slither, its blow on its frame, its flinch and death', () => {
  const art = makeLeechArt();
  for (const v of ['front', 'back'] as const) {
    const a = art[v];
    assert.equal(a.walk.length, BL_WALK.frames);
    assert.equal(a.walkFps, BL_WALK.fps);
    assert.equal(a.clips?.attack?.hit, BL_HIT);
    assert.equal(a.clips?.attack?.frames.length, Math.round(BL_ATTACK * 30) + 1);
    assert.ok((a.clips?.die?.frames.length ?? 0) > 10 && (a.clips?.reel?.frames.length ?? 0) > 5, 'its death and flinch');
  }
});
