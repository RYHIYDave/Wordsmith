// FLOOR 8'S BOSS, THE CANTOR (src/art/cantor.ts; in the game through art/act1_figs/cantor.ts, his switch CANTOR_ON on
// with the descent), held to his art rulebook before he sees him, in every move and his death, from in front and from behind:
// crisp, his pink edge while he lives; nothing cyan, every light the cult's fire; nothing of him or of what his
// moves throw off cut off at his canvas's edge; his size, his brief's (half again the knight); and the whole boss
// review (art/boss_checks.ts) of every move.
//   run: tsx --test tests/cantor.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { FIG } from '../src/art/act1_figs/cantor';
import { useAct1Figs } from '../src/art/bestiary';
import { checkBoss, findingsSaid, framesOf } from '../src/art/boss_checks';
import { CANTOR, CANTOR_BODY, CANTOR_ON, cantorEchoPainted, cantorPainted } from '../src/art/cantor';
import { RIM_ALPHA } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { deathOfMob } from '../src/art/new_mobs3';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { rgba } from '../src/engine/px';
import { MADE, cantorShape } from './cantor_shape';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const FIRE = new Set(FLAME.map((c) => rgba(c).slice(0, 3).join(',')));
/** Every move (but his death) every few frames as the game plays it, from in front and from behind; his death as the game paints it (no edge). Painted once, for every test. */
type Frame = { name: string; dying: boolean; painted: () => Painted };
const frames: Frame[] = [];
const memo = (f: () => Painted): (() => Painted) => {
  let p: Painted | null = null;
  return () => (p ??= f());
};
for (const view of ['front', 'back'] as const) {
  for (const move of MADE) {
    if (move === 'dying') {
      const n = Math.round(CANTOR.dieTime * 20);
      for (let i = 0; i <= n; i += 3) frames.push({ name: `dying ${view} ${i}`, dying: true, painted: memo(() => deathOfMob(CANTOR, i / n, view)) });
      continue;
    }
    const ts = framesOf(CANTOR, move);
    const step = move === 'stand' ? 4 : 3;
    for (let i = 0; i < ts.length; i += step) frames.push({ name: `${move} ${view} ${ts[i].toFixed(2)}`, dying: false, painted: memo(() => cantorPainted(ts[i], view, move)) });
  }
  // (one of his sound-copies as a figure of its own, in two of his moves)
  for (const [move, t] of [['stand', 0.4], ['attack', 1.0]] as const) frames.push({ name: `a copy, ${move} ${view} ${t}`, dying: false, painted: memo(() => cantorEchoPainted(move, t, view)) });
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

test('he is in the game through art/act1_figs/cantor.ts alone, and his switch goes on with the descent', () => {
  // (who of the game imports this file: by where each import leads, not by its name)
  const users: string[] = [];
  for (const f0 of fs.readdirSync('src', { recursive: true })) {
    const f = f0.split('\\').join('/');
    if (!f.endsWith('.ts') || f.startsWith('dev') || f === 'art/cantor.ts') continue;
    const dir = f.split('/').slice(0, -1);
    for (const [, spec] of fs.readFileSync(`src/${f}`, 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const bit of spec.split('/')) {
        if (bit === '..') parts.pop();
        else if (bit !== '.') parts.push(bit);
      }
      if (parts.join('/') === 'art/cantor') users.push(f);
    }
  }
  assert.equal(users.sort().join(', '), 'art/act1_figs/cantor.ts', 'only his figure imports him');
  assert.ok(FIG !== null && (FIG.switches ?? []).includes(CANTOR_ON), 'his figure holds his switch');
  useAct1Figs(true);
  assert.equal(CANTOR_ON.on, true, 'on with the descent');
  useAct1Figs(false);
  assert.equal(CANTOR_ON.on, false, 'and off without it');
});

test('crisp: every pixel all there or not at all (but the pink edge); his pink edge round him while he lives', () => {
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
    if (f.dying) assert.ok(rim === 0, `${f.name}: an edge as he dies`);
    else assert.ok(rim > 200, `${f.name}: his pink edge, ${rim} pixels`);
  }
});

test('nothing cyan, every light the cult\'s fire, and nothing of him cut off at his canvas\'s edge', () => {
  for (const f of frames) {
    const { px, lights } = f.painted();
    for (let i = 0; i < px.d.length; i += 4) {
      if (px.d[i + 3] === 0) continue;
      const [h, sat] = hue(px.d[i], px.d[i + 1], px.d[i + 2]);
      assert.ok(!(sat > 0.4 && Math.max(px.d[i], px.d[i + 1], px.d[i + 2]) > 140 && h >= 165 && h <= 205), `${f.name}: cyan`);
    }
    for (const L of lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${f.name}: his light ${L.color}`);
    let cut = 0;
    for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    assert.ok(cut === 0, `${f.name}: ${cut} pixels on his canvas's edge`);
  }
});

test('his size, his brief\'s: half again the knight\'s height (58)', () => {
  const k = CANTOR_BODY.tall / 58;
  assert.ok(k > 1.4 && k < 1.6, `${k.toFixed(2)} times the knight's height`);
});

test('the whole review (art/boss_checks.ts) of every move', () => {
  const found = checkBoss(CANTOR, cantorShape(), MADE);
  assert.ok(found.length === 0, `the Cantor:\n  ${findingsSaid(found).join('\n  ')}`);
});
