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
import { VULTURE, VULTURE_BODY, VULTURE_DIVE, VULTURE_ON, VULTURE_REST, VULTURE_WALK, vultureDivePose, vulturePainted, vultureStanding, vultureWalkPose } from '../src/art/ledge_vultures';
import { bonesAt, solve } from '../src/art/skeleton';
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

// every move it has (its dive, flinch and death are still the standing motion, placeholders), both views, frame by frame
const frames: { name: string; move: string; t: number; view: 'front' | 'back' }[] = [];
for (const view of ['front', 'back'] as const) {
  for (let i = 0; i <= 24; i += 3) frames.push({ name: `stand ${view} ${i}`, move: 'stand', t: i / 10, view });
  for (const move of ['walk', 'attack', 'reel', 'dying'] as const) {
    for (let i = 0; i <= 24; i += 3) frames.push({ name: `${move} ${view} ${i}`, move, t: i / 10, view });
  }
  for (const t of [0.7, 0.75, 0.8]) frames.push({ name: `the strike ${view} ${t}`, move: 'attack', t, view });
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

test('its walk is flight: its feet off the floor all the round, its wings beating up and down once a round', () => {
  let lowest = Infinity;
  let lo = Infinity;
  let hi = -Infinity;
  const N = 64;
  for (let i = 0; i <= N; i++) {
    const s = solve(VULTURE_BODY, bonesAt(VULTURE.walk.motion.keys, VULTURE_REST, i / N));
    for (const p of [s.heelL, s.heelR, s.toeL, s.toeR, s.ankleL, s.ankleR]) lowest = Math.min(lowest, p[2]);
    lo = Math.min(lo, s.handL[2]);
    hi = Math.max(hi, s.handL[2]);
  }
  assert.ok(lowest > 4, `its lowest foot point is ${lowest.toFixed(1)} above the floor (it must not stand on it)`);
  assert.ok(hi - lo > 6, `its hand goes ${(hi - lo).toFixed(1)} up and down in a round`);
  assert.equal(VULTURE.walk.period, VULTURE.walkFrames / VULTURE.walkFps, 'one round is its frames at its frame rate');
});

test('its walk round closes: its first and last moments are the same picture, from either side', () => {
  for (const view of ['front', 'back'] as const) {
    const a = vulturePainted(0, view, 'walk').px;
    const b = vulturePainted(1, view, 'walk').px;
    assert.equal(a.w, b.w);
    assert.equal(a.h, b.h);
    let diff = 0;
    for (let i = 0; i < a.d.length; i++) if (a.d[i] !== b.d[i]) diff++;
    assert.ok(diff === 0, `${view}: ${diff} values differ between the round's start and its end`);
  }
});

// THE RULEBOOK'S CHECKS, added on 14 Oct for the walk's revision and the dive (docs/art/RULEBOOK.md: Animations 1, Movement
// 1 to 7, Monsters 4 and 6, the frame rates): each one a test that runs every time.
const nums = (p: object): Record<string, number> => Object.fromEntries(Object.entries(p).filter(([, v]) => typeof v === 'number')) as Record<string, number>;
const ARM = VULTURE_BODY.upperArm + VULTURE_BODY.foreArm;

test('its walk is sixteen frames a second: the rulebook\'s "monsters walk 16"', () => {
  assert.equal(VULTURE_WALK.fps, 16);
  assert.equal(VULTURE_WALK.frames, 16);
});

test('its dive is thirty frames a second, a key every frame, ending at its long', () => {
  assert.equal(VULTURE_DIVE.fps, 30);
  const keys = VULTURE.attack.motion.keys;
  assert.ok(Math.abs(keys[1].at - keys[0].at - 1 / 30) < 1e-9, 'a key each thirtieth of a second');
  assert.ok(Math.abs(keys[keys.length - 1].at - VULTURE_DIVE.long) < 1e-9, 'it ends at its long');
});

test('its dive holds its strike for a tenth of a second, and moves again after it (Movement 7)', () => {
  const a = nums(vultureDivePose(VULTURE_DIVE.hit));
  for (const t of [VULTURE_DIVE.hit + 1 / 30, VULTURE_DIVE.hit + 2 / 30, VULTURE_DIVE.hit + VULTURE_DIVE.freeze]) {
    const b = nums(vultureDivePose(t));
    for (const f of Object.keys(a)) assert.ok(Math.abs(a[f] - b[f]) < 1e-9, `${f} moves during the freeze, at ${t.toFixed(3)} s`);
  }
  const after = nums(vultureDivePose(VULTURE_DIVE.hit + 0.2));
  assert.ok(Math.abs(after.pitch - a.pitch) > 5, 'it moves again after the freeze');
});

test('its dive winds up: it holds the warning at the top, its wings up high and trembling, its body rearing back (Monsters 4)', () => {
  const hands: number[] = [];
  for (let t = VULTURE_DIVE.warn + 0.02; t < 0.5; t += 0.02) {
    const p = nums(vultureDivePose(t));
    assert.ok(p.lhz > 0.9 * ARM, `at ${t.toFixed(2)} s its wings are only ${p.lhz.toFixed(1)} up`);
    assert.ok(Math.abs(p.pitch - (VULTURE_REST.pitch - 6)) < 3, `at ${t.toFixed(2)} s its body is ${p.pitch.toFixed(1)}`);
    hands.push(p.lhz);
  }
  assert.ok(Math.max(...hands) - Math.min(...hands) > 0.5, 'and its wings tremble in the hold');
});

test('its dive stoops head down: at the strike its body is pitched well past upright (Animations 1)', () => {
  const p = nums(vultureDivePose(VULTURE_DIVE.hit));
  assert.ok(p.pitch >= VULTURE_REST.pitch + 100, `pitched ${p.pitch.toFixed(0)} degrees forward at the strike`);
});

test('its dive sweeps its wings back from the warning to the strike (Animations 1)', () => {
  const up = nums(vultureDivePose(0.35)).lhz;
  const back = nums(vultureDivePose(VULTURE_DIVE.hit)).lhz;
  assert.ok(up - back > ARM * 0.8, `its wings go from ${up.toFixed(1)} to ${back.toFixed(1)} from the warning to the strike`);
});

test('its dive keeps its feet off the floor all the way, the talons at the strike too (Feet and Movement 1)', () => {
  let lowest = Infinity;
  for (let i = 0; i <= 72; i++) {
    const s = solve(VULTURE_BODY, bonesAt(VULTURE.attack.motion.keys, VULTURE_REST, i / 60));
    for (const p of [s.heelL, s.heelR, s.toeL, s.toeR, s.ankleL, s.ankleR]) lowest = Math.min(lowest, p[2]);
  }
  assert.ok(lowest > 4, `its lowest foot point is ${lowest.toFixed(1)} above the floor`);
});

test('its dive ends on the walk\'s first pose, so the walk takes it up again with no jump (Movement 3)', () => {
  const end = nums(vultureDivePose(VULTURE_DIVE.long));
  const w0 = nums(vultureWalkPose(0));
  for (const f of Object.keys(w0)) assert.ok(Math.abs(end[f] - w0[f]) < 1e-6, `${f}: ${end[f]} against the walk's ${w0[f]}`);
});
