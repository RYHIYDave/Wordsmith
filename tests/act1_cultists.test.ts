// THE CULT'S TWO NEW KINDS FOR FLOORS 6 TO 10, THE CHANTER AND THE FIREPOT THROWER (src/art/act1_cultists.ts;
// a mock-up nothing of the game imports), held to his rulebook before he sees them: crisp in every frame, the
// enemy's pink edge round them while they live and none as they die, nothing cyan and every light the cult's
// fire, their size beside the knight, nothing of them cut off at their canvas's edge, the whole review of every
// move (as the bosses have it), and what they send (the bolt, the firepot, its fire, the ward) crisp.
//   run: tsx --test tests/act1_cultists.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { checkBoss, findingsSaid, framesOf } from '../src/art/boss_checks';
import { CULT_MOVES, chanterShape, potsShape } from './act1_cult_shape';
import { RIM_ALPHA } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { spriteOf3 } from '../src/art/heroes3';
import { MOVES3 } from '../src/art/moves3';
import { ACT1_CULT_ON, BOLT_FRAMES, CHANTER, FIREPOT_FRAMES, FIREPOT_THROWER, chantWard, curseBolt, firepotFire, firepotFlying, makeChanterArt3, makeFirepotThrowerArt3 } from '../src/art/act1_cultists';
import { deathOfMob, paintMob } from '../src/art/new_mobs3';
import type { Mob } from '../src/art/new_mobs3';
import { rgba } from '../src/engine/px';
import type { Px, Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const FIRE = new Set(FLAME.map((c) => rgba(c).slice(0, 3).join(',')));
const VIEWS = ['front', 'back'] as const;
type Frame = { name: string; px: Px; lights: { color: string }[] };
const MOBS: Mob[] = [CHANTER, FIREPOT_THROWER];
const living: Frame[] = [];
const dying: Frame[] = [];
for (const mob of MOBS) {
  for (const mv of ['stand', 'walk', 'attack', 'reel']) {
    framesOf(mob, mv).forEach((t, i) => {
      if (i % 2 === 0) for (const view of VIEWS) {
        const p = paintMob(mob, mv, t, view, ENEMY_RIM);
        living.push({ name: `${mob.id} ${mv} ${view} ${t.toFixed(2)}`, px: p.px, lights: p.lights });
      }
    });
  }
  for (let i = 0; i <= mob.dieTime * 20; i++) for (const view of VIEWS) {
    const p = deathOfMob(mob, Math.min(1, i / 20 / mob.dieTime), view);
    dying.push({ name: `${mob.id} dying ${view} ${(i / 20).toFixed(2)}`, px: p.px, lights: p.lights });
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
  assert.equal(ACT1_CULT_ON.on, false);
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('act1_cultists.ts')) continue;
    assert.ok(!/from ['"][^'"]*act1_cultists['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the cult's two new kinds`);
  }
});

test('crisp: every pixel all there or not at all (but the pink edge), the pink edge round them while they live, none as they die', () => {
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
    assert.ok(rim > 100, `${name}: its pink edge, ${rim} pixels`);
  }
  for (const { name, px } of dying) {
    let soft = 0;
    for (let i = 0; i < px.d.length; i += 4) if (px.d[i + 3] !== 0 && px.d[i + 3] !== 255) soft++;
    assert.ok(soft === 0, `${name}: ${soft} soft pixels`);
  }
});

test('nothing cyan, and every light they give is the cult\'s fire', () => {
  for (const { name, px, lights } of [...living, ...dying]) {
    for (let i = 0; i < px.d.length; i += 4) {
      if (px.d[i + 3] === 0) continue;
      const [h, sat] = hue(px.d[i], px.d[i + 1], px.d[i + 2]);
      assert.ok(!(sat > 0.4 && Math.max(px.d[i], px.d[i + 1], px.d[i + 2]) > 140 && h >= 165 && h <= 205), `${name}: cyan ${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`);
    }
    for (const L of lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${name}: its light ${L.color}`);
  }
});

test('nothing of them cut off at their canvas\'s edge, in any frame', () => {
  for (const { name, px } of [...living, ...dying]) {
    let cut = 0;
    for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    assert.ok(cut === 0, `${name}: ${cut} pixels on the canvas's edge`);
  }
});

test('their size: about the knight\'s (the chanter\'s rings and the rack over the thrower\'s head with them)', () => {
  const knight = tallOf(spriteOf3(MOVES3.rear, 0, 'front'));
  for (const [name, sp] of [['chanter', makeChanterArt3().front.idle[0]], ['firepot thrower', makeFirepotThrowerArt3().front.idle[0]]] as const) {
    const k = tallOf(sp) / knight;
    assert.ok(k > 0.9 && k < 1.25, `the ${name}: ${k.toFixed(2)} times the knight's height`);
  }
});

test('the whole review (art/boss_checks.ts) of every move of both', () => {
  for (const [mob, shape] of [[CHANTER, chanterShape()], [FIREPOT_THROWER, potsShape()]] as const) {
    const found = checkBoss(mob, shape, CULT_MOVES);
    assert.ok(found.length === 0, `${mob.id}:\n  ${findingsSaid(found).join('\n  ')}`);
  }
});

test('as it dies: the chanter\'s book burns (the cult\'s fire on it, then none); the thrower\'s pots go off (the fire on it, then out); both lie still at the end, no light', () => {
  for (const mob of MOBS) {
    const fireAt = (t: number): number => {
      const p = deathOfMob(mob, t / mob.dieTime, 'front');
      let n = 0;
      for (let i = 0; i < p.px.d.length; i += 4) if (p.px.d[i + 3] === 255 && FIRE.has(`${p.px.d[i]},${p.px.d[i + 1]},${p.px.d[i + 2]}`)) n++;
      return n;
    };
    const most = Math.max(...[0.3, 0.5, 0.7, 0.9, 1.0, 1.2].map(fireAt));
    assert.ok(most > 30, `${mob.id}: the fire as it dies, ${most} pixels at most`);
    const last = deathOfMob(mob, 1, 'front');
    assert.ok(last.lights.length === 0, `${mob.id}: no light once it has died`);
  }
});

test('what they send: the bolt, the firepot in flight, its fire on the floor, the ward: crisp, no loose pixels, nothing cyan, lights the cult\'s fire', () => {
  const all: [string, Sprite][] = [
    ...Array.from({ length: BOLT_FRAMES }, (_, i): [string, Sprite] => [`bolt ${i}`, curseBolt(i)]),
    ...Array.from({ length: FIREPOT_FRAMES }, (_, i): [string, Sprite] => [`firepot ${i}`, firepotFlying(i / FIREPOT_FRAMES)]),
    ...Array.from({ length: 8 }, (_, i): [string, Sprite] => [`fire ${i}`, firepotFire(i)]),
    ...Array.from({ length: 4 }, (_, i): [string, Sprite] => [`ward ${i}`, chantWard(i)]),
  ];
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  for (const [name, sp] of all) {
    const q = paintingOf(sp);
    let soft = 0;
    let lone = 0;
    for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) {
      const i = (y * q.w + x) * 4;
      const a = q.d[i + 3];
      if (a === 0) continue;
      if (a !== 255 && !(a === RIM_ALPHA && q.d[i] === pr && q.d[i + 1] === pg && q.d[i + 2] === pb)) soft++;
      if (a !== 255) continue;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && q.has(x + dx, y + dy)) n++;
      if (n === 0 && !name.startsWith('ward')) lone++;
      const [h, sat] = hue(q.d[i], q.d[i + 1], q.d[i + 2]);
      assert.ok(!(sat > 0.4 && Math.max(q.d[i], q.d[i + 1], q.d[i + 2]) > 140 && h >= 165 && h <= 205), `${name}: cyan`);
    }
    assert.ok(soft === 0, `${name}: ${soft} soft pixels`);
    assert.ok(lone <= 2, `${name}: ${lone} lone pixels`);
    for (const L of sp.lights ?? []) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${name}: its light ${L.color}`);
  }
});
