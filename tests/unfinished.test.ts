// FLOOR 6'S BOSS, THE UNFINISHED, STANDING (src/art/unfinished.ts; a mock-up nothing of the game imports),
// held to his rulebook before he sees it: crisp, the enemy's pink edge round it, nothing cyan and every light
// the cult's fire, its size his ("Twice the Warden (Recommended)"), the cult's mark burning on its chest,
// and the boss review (art/boss_checks.ts) of its stand: nothing of it into itself or the floor, nothing
// jerks, and it is alive standing (its chest rises, its hips sway).
//   run: tsx --test tests/unfinished.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { checkBoss, findingsSaid } from '../src/art/boss_checks';
import { MADE, ufShape } from './unfinished_shape';
import { RIM_ALPHA } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { makeWardenArt } from '../src/art/monster_warden';
import { UF_BREATH, UNFINISHED, UNFINISHED_FUSED, UNFINISHED_ON, boulderRolling, hurledBlock, stompCracks, unfinishedStanding } from '../src/art/unfinished';
import { WORD_COLOR } from '../src/art/icons';
import { rgba } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();



const FIRE = new Set(FLAME.map((c) => rgba(c).slice(0, 3).join(',')));
/** Its stand, every frame the game would show (at its own frames a second), from in front and from behind, free and still one with the wall. */
const frames: { name: string; sp: Sprite }[] = [];
for (const fused of [false, true]) {
  for (const view of ['front', 'back'] as const) {
    const n = Math.round(UF_BREATH * UNFINISHED.idleFps);
    for (let i = 0; i < n; i += 3) frames.push({ name: `${fused ? 'fused ' : ''}${view} ${i}`, sp: unfinishedStanding(i / UNFINISHED.idleFps, view, fused) });
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

test('the switch is off, and nothing of the game imports it', () => {
  assert.equal(UNFINISHED_ON.on, false);
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('unfinished.ts')) continue;
    assert.ok(!/from ['"][^'"]*unfinished['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the Unfinished`);
  }
});

test('crisp: every pixel all there or not at all (but its pink edge), and the pink edge round it', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  for (const { name, sp } of frames) {
    const d = paintingOf(sp).d;
    let soft = 0;
    let rim = 0;
    for (let i = 0; i < d.length; i += 4) {
      const a = d[i + 3];
      if (a === 0 || a === 255) continue;
      if (a === RIM_ALPHA && d[i] === pr && d[i + 1] === pg && d[i + 2] === pb) rim++;
      else soft++;
    }
    assert.ok(soft === 0, `${name}: ${soft} soft pixels`);
    assert.ok(rim > 200, `${name}: its pink edge, ${rim} pixels`);
  }
});

test('nothing cyan, and every light it gives is the cult\'s fire', () => {
  for (const { name, sp } of frames) {
    const d = paintingOf(sp).d;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] === 0) continue;
      const [h, sat] = hue(d[i], d[i + 1], d[i + 2]);
      assert.ok(!(sat > 0.4 && Math.max(d[i], d[i + 1], d[i + 2]) > 140 && h >= 165 && h <= 205), `${name}: cyan ${d[i]},${d[i + 1]},${d[i + 2]}`);
    }
    for (const L of sp.lights ?? []) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${name}: its light ${L.color}`);
  }
});

test('his size: twice the Warden', () => {
  const warden = makeWardenArt().front.idle[0];
  const it = unfinishedStanding(0, 'front');
  const k = it.h / warden.h;
  assert.ok(k > 1.8 && k < 2.4, `${it.h} game pixels tall against the Warden's ${warden.h}: ${k.toFixed(2)} times`);
});

test('the cult\'s mark burns on its chest, in every frame from in front', () => {
  for (const { name, sp } of frames) {
    if (!name.includes('front')) continue;
    const d = paintingOf(sp).d;
    let fire = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] === 255 && FIRE.has(`${d[i]},${d[i + 1]},${d[i + 2]}`)) fire++;
    assert.ok(fire > 30, `${name}: ${fire} pixels of the fire`);
  }
});

test('the boss review (art/boss_checks.ts) of every move made so far: free; and its stand one with the wall', () => {
  for (const [mob, moves] of [[UNFINISHED, MADE], [UNFINISHED_FUSED, ['stand']]] as const) {
    const found = checkBoss(mob, ufShape(), moves);
    assert.ok(found.length === 0, `${mob.id}:\n  ${findingsSaid(found).join('\n  ')}`);
  }
});

test('what its big moves leave (the flying and landed block, the boulders, the stomp\'s cracks): crisp, no loose pixels, nothing cyan or pink, duller than every word', () => {
  const nine = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison'];
  const dullest = Math.min(...nine.map((w) => hue(...(rgba((WORD_COLOR as Record<string, string>)[w]).slice(0, 3) as [number, number, number]))[1]));
  const left: [string, Sprite][] = [
    ...[0, 1, 2, 3, 4].map((f): [string, Sprite] => [`block ${f}`, hurledBlock(f)]),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((f): [string, Sprite] => [`boulder ${f}`, boulderRolling(f)]),
    ...[0, 1, 2, 3].map((k): [string, Sprite] => [`cracks ${k}`, stompCracks(k)]),
  ];
  for (const [name, sp] of left) {
    const q = paintingOf(sp);
    let soft = 0;
    let loose = 0;
    let most = 0;
    for (let y = 0; y < q.h; y++) {
      for (let x = 0; x < q.w; x++) {
        const i = (y * q.w + x) * 4;
        const a = q.d[i + 3];
        if (a === 0) continue;
        if (a !== 255) soft++;
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && q.has(x + dx, y + dy)) n++;
        if (n === 0) loose++;
        const [h, sat] = hue(q.d[i], q.d[i + 1], q.d[i + 2]);
        if (Math.max(q.d[i], q.d[i + 1], q.d[i + 2]) < 51) continue;
        most = Math.max(most, sat);
        if (sat > 0.25) assert.ok(!(h > 165 && h < 205) && !(h > 300 || h < 10), `${name}: ${q.d[i]},${q.d[i + 1]},${q.d[i + 2]}`);
      }
    }
    assert.ok(soft === 0, `${name}: ${soft} soft pixels`);
    assert.ok(loose <= 2, `${name}: ${loose} loose pixels`);
    assert.ok(most < dullest, `${name}: ${most.toFixed(2)} against the dullest word's ${dullest.toFixed(2)}`);
  }
});
