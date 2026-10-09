// THREE NEW MONSTERS (src/art/new_mobs3.ts): A MOCK-UP, BEHIND A SWITCH THAT IS OFF. Pictures for
// the owner to judge; nothing of them is in the game. So:
//   1. the switch is off, and nothing of the game imports the file;
//   2. each painter paints every pose the pictures show (standing both ways, the held warning, the
//      blow, its death) without throwing, and paints something;
//   3. nothing on them glows a friend's colour: no cyan anywhere in their paintings or their lights;
//   4. each living one wears the enemy's pink edge, and the dying wear none.
//   run: tsx --test tests/new_mobs3.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { NEW_MOBS, NEW_MOBS_LIST, deathOfMob, paintMob } from '../src/art/new_mobs3';
import { rgba } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };

paintWithoutCanvas();

/** Every pose the pictures show, of one monster, both ways round. */
function poses(): { name: string; living: boolean; paint: () => Painted }[] {
  const out: { name: string; living: boolean; paint: () => Painted }[] = [];
  for (const mob of NEW_MOBS_LIST) {
    for (const view of ['front', 'back'] as const) {
      out.push({ name: `${mob.id} stands, ${view}`, living: true, paint: () => paintMob(mob, 'stand', 0, view) });
      out.push({ name: `${mob.id} stands a moment on, ${view}`, living: true, paint: () => paintMob(mob, 'stand', 0.45, view) });
      out.push({ name: `${mob.id} winds up, ${view}`, living: true, paint: () => paintMob(mob, 'attack', mob.warn, view) });
      out.push({ name: `${mob.id} strikes, ${view}`, living: true, paint: () => paintMob(mob, 'attack', mob.hit, view) });
      for (const k of [0, 0.3, 0.6, 1]) out.push({ name: `${mob.id} dies (${k}), ${view}`, living: false, paint: () => deathOfMob(mob, k, view) });
    }
  }
  return out;
}

/** The friend's glowing colours (art/kit.ts; the heroes' edge and pool of light). */
const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')));

/** True of a colour in the cyan family, bright and strong: a glow of the friend's side. */
function cyanGlow(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 150 || max - min < 0.45 * max) return false;
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  h = (h + 360) % 360;
  return h >= 165 && h <= 205;
}

test('the switch is off, and no file of the game imports the mock-up', () => {
  assert.equal(NEW_MOBS.on, false);
  const files = fs.readdirSync('src', { recursive: true }).filter((f) => f.endsWith('.ts') && !f.startsWith('dev'));
  for (const f of files) {
    if (f.endsWith('new_mobs3.ts')) continue;
    assert.ok(!fs.readFileSync(path.join('src', f), 'utf8').includes('new_mobs3'), `${f} imports the mock-up`);
  }
});

test('each painter paints every pose of the pictures without throwing, and paints something', () => {
  for (const p of poses()) {
    const f = p.paint();
    let n = 0;
    for (let i = 3; i < f.px.d.length; i += 4) if (f.px.d[i] === 255) n++;
    // (the Shade is gone at the end of its death: nothing is left of it)
    if (!(p.name.startsWith('shade dies (1)'))) assert.ok(n > 40, `${p.name}: only ${n} pixels painted`);
  }
});

test('nothing on them glows cyan: not a pixel of the friend’s colours, nor a light', () => {
  for (const p of poses()) {
    const f = p.paint();
    const d = f.px.d;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] === 0) continue;
      const key = `${d[i]},${d[i + 1]},${d[i + 2]}`;
      assert.ok(!FRIEND.has(key), `${p.name}: a friend's colour (${key})`);
      assert.ok(!cyanGlow(d[i], d[i + 1], d[i + 2]), `${p.name}: a cyan glow (${key})`);
    }
    for (const l of f.lights) {
      const [r, g, b] = rgba(l.color);
      assert.ok(!FRIEND.has(`${r},${g},${b}`) && !cyanGlow(r, g, b), `${p.name}: a cyan light (${l.color})`);
    }
  }
});

test('each living one wears the enemy’s pink edge; the dying wear none', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  for (const p of poses()) {
    const d = p.paint().px.d;
    let rim = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] === RIM_ALPHA && d[i] === pr && d[i + 1] === pg && d[i + 2] === pb) rim++;
    if (p.living) assert.ok(rim > 30, `${p.name}: its pink edge has ${rim} pixels`);
    else assert.equal(rim, 0, `${p.name}: a dying thing has no edge`);
  }
});
