// THE DROWNED, FLOOR 10'S SMALL MOB (src/art/drowned.ts; a mock-up nothing of the game imports), held to his
// rulebook before he sees it: crisp in every frame, the enemy's pink edge round it while it lives, nothing cyan and
// every light the enemy's fire, its size beside the knight (his pick: the knight's height, hunched), nothing of it
// cut off at its canvas's edge, its eyes burning the Eye's gold.
//   run: tsx --test tests/drowned.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { checkBoss, findingsSaid, framesOf } from '../src/art/boss_checks';
import { DROWNED_MOVES, drownedShape } from './drowned_shape';
import { RIM_ALPHA } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { spriteOf3 } from '../src/art/heroes3';
import { MOVES3 } from '../src/art/moves3';
import { DROWNED, DROWNED_ON, DR_DIES, DR_GRAB, DR_RISE, makeDrownedArt3 } from '../src/art/drowned';
import { deathOfMob, paintMob, skeletonAt } from '../src/art/new_mobs3';
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
const living: Frame[] = [];
const dying: Frame[] = [];
for (const mv of ['stand', 'walk', 'attack', 'reel']) {
  framesOf(DROWNED, mv).forEach((t, i) => {
    if (mv !== 'stand' && i % 2) return;
    for (const view of VIEWS) {
      const p = paintMob(DROWNED, mv, t, view, ENEMY_RIM);
      living.push({ name: `drowned ${mv} ${view} ${t.toFixed(2)}`, px: p.px, lights: p.lights });
    }
  });
}
// (rising out of the water: what of it is still under is not seen; from its head breaking the surface on)
const rising: Frame[] = [];
for (let i = 0; i <= Math.round(DR_RISE.long * 30); i += 2) for (const view of VIEWS) {
  const p = paintMob(DROWNED, 'rise', i / 30, view, ENEMY_RIM);
  rising.push({ name: `drowned rise ${view} ${(i / 30).toFixed(2)}`, px: p.px, lights: p.lights });
}
for (let i = 0; i <= DROWNED.dieTime * 20; i++) for (const view of VIEWS) {
  const p = deathOfMob(DROWNED, Math.min(1, i / 20 / DROWNED.dieTime), view);
  dying.push({ name: `drowned dying ${view} ${(i / 20).toFixed(2)}`, px: p.px, lights: p.lights });
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
  assert.equal(DROWNED_ON.on, false);
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('drowned.ts')) continue;
    assert.ok(!/from ['"][^'"]*\/drowned['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the Drowned`);
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
    assert.ok(rim > 100, `${name}: its pink edge, ${rim} pixels`);
  }
});

test('crisp as it rises and as it dies, and no pink edge once it is dying', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  for (const { name, px } of [...rising, ...dying]) {
    let soft = 0;
    for (let i = 0; i < px.d.length; i += 4) {
      const a = px.d[i + 3];
      if (a === 0 || a === 255) continue;
      if (a === RIM_ALPHA && px.d[i] === pr && px.d[i + 1] === pg && px.d[i + 2] === pb && name.includes('rise')) continue;
      soft++;
    }
    assert.ok(soft === 0, `${name}: ${soft} soft pixels`);
  }
});

test('nothing cyan, and every light it gives is the enemy\'s fire', () => {
  for (const { name, px, lights } of [...living, ...rising, ...dying]) {
    for (let i = 0; i < px.d.length; i += 4) {
      if (px.d[i + 3] === 0) continue;
      const [h, sat] = hue(px.d[i], px.d[i + 1], px.d[i + 2]);
      assert.ok(!(sat > 0.4 && Math.max(px.d[i], px.d[i + 1], px.d[i + 2]) > 140 && h >= 165 && h <= 205), `${name}: cyan ${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`);
    }
    for (const L of lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${name}: its light ${L.color}`);
  }
});

test('nothing of it cut off at its canvas\'s edge, in any frame', () => {
  for (const { name, px } of [...living, ...rising, ...dying]) {
    let cut = 0;
    for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    assert.ok(cut === 0, `${name}: ${cut} pixels on the canvas's edge`);
  }
});

test('its size (his pick): the knight\'s height, hunched', () => {
  const knight = tallOf(spriteOf3(MOVES3.rear, 0, 'front'));
  const k = tallOf(makeDrownedArt3().front.idle[0]) / knight;
  assert.ok(k > 0.85 && k < 1.15, `${k.toFixed(2)} times the knight's height`);
});

test('its eyes (his pick): burning the Eye\'s gold from in front, their light gold', () => {
  for (const { name, px, lights } of living.filter((f) => f.name.includes('front'))) {
    let gold = 0;
    for (let i = 0; i < px.d.length; i += 4) if (px.d[i + 3] === 255 && (`${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}` === rgba(FLAME[4]).slice(0, 3).join(',') || `${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}` === rgba(FLAME[3]).slice(0, 3).join(','))) gold++;
    assert.ok(gold >= 6, `${name}: its eyes, ${gold} pixels of gold`);
    assert.ok(lights.some((L) => L.color === FLAME[3]), `${name}: their gold light`);
  }
});

test('the whole review (art/boss_checks.ts) of its stand, shamble, grab and flinch, and where its moves hand over (out of its rise, into its death)', () => {
  const found = checkBoss(DROWNED, drownedShape(), DROWNED_MOVES);
  assert.ok(found.length === 0, `drowned:\n  ${findingsSaid(found).join('\n  ')}`);
});

test('IT RISES OUT OF THE WATER (his pick): wholly under at first, nothing of it but the water; then up, its eyes lighting as it comes; standing at the end', () => {
  const count = (t: number): number => {
    const p = paintMob(DROWNED, 'rise', t, 'front', ENEMY_RIM);
    let n = 0;
    for (let i = 3; i < p.px.d.length; i += 4) if (p.px.d[i] === 255) n++;
    return n;
  };
  assert.ok(count(0) < 40, `under at first: ${count(0)} pixels`);
  assert.ok(count(0.5) > count(0.2) && count(DR_RISE.up) > count(0.5), 'coming up');
  const s0 = skeletonAt(DROWNED, 'rise', 0);
  assert.ok(s0.head[2] < 0, `its head under the water at first (${s0.head[2].toFixed(1)})`);
  const dark = paintMob(DROWNED, 'rise', 0.25, 'front', ENEMY_RIM).lights.length;
  const lit = paintMob(DROWNED, 'rise', DR_RISE.up, 'front', ENEMY_RIM).lights.length;
  assert.ok(dark === 0 && lit > 0, `its eyes lighting as it comes up (${dark}, then ${lit})`);
});

test('ITS GRAB (his pick): its hands spread and up before, clutched shut on you at the blow, out before it; dragged down after', () => {
  const sk = (t: number) => skeletonAt(DROWNED, 'attack', t);
  const rest = sk(0);
  const warn = sk(DR_GRAB.warn);
  const hit = sk(DR_GRAB.hit);
  const down = sk(DR_GRAB.drag);
  assert.ok(warn.handL[2] > rest.handL[2] + 10 && warn.handR[2] > rest.handR[2] + 10, 'its hands up as it warns');
  assert.ok(hit.handL[0] > rest.handL[0] + 8 && hit.handR[0] > rest.handR[0] + 8, 'its hands out before it at the blow');
  assert.ok(down.handL[2] < hit.handL[2] - 8, 'dragged down after');
});

test('ITS DEATH (his pick): it collapses into water and weed: its eyes out, nothing of its body left, its robes slumped empty in a puddle; no light', () => {
  const last = deathOfMob(DROWNED, 1, 'front');
  assert.equal(last.lights.length, 0, 'no light once it has died');
  const s = skeletonAt(DROWNED, 'dying', DR_DIES.long);
  assert.ok(s.head[2] < 0, `its body gone under (${s.head[2].toFixed(1)})`);
  let n = 0;
  for (let i = 3; i < last.px.d.length; i += 4) if (last.px.d[i] === 255) n++;
  assert.ok(n > 300, `its robes and the puddle left (${n} pixels)`);
});
