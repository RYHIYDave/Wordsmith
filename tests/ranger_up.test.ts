// THE RANGER BROUGHT UP TO THE BRAWLER'S LEVEL (src/art/ranger_up.ts; the art chat's helper, 6 Nov 2026;
// docs/mockups/ranger_up/README.md). A MOCK-UP BEHIND A SWITCH THAT IS OFF, RANGER_UP. FIRST STEP ONLY: his look, sculpted,
// shown in one still of his stance (the owner, 6 Nov: “Just a still of him”). Held here, as far as that step goes:
//   1. the switch is off and nothing of the game imports the new file; EVERY FRAME THE GAME PAINTS OF HIM IS THE SAME (each
//      list's first, middle and last frame against the hashes made from the game's Ranger as he is, d31abc22:
//      tests/ranger_up.hashes.json; with RANGER_UP_ALL=1, every frame);
//   2. his stance, sculpted, from in front, every frame of its loop at 30 a second: crisp; the friend's cyan edge round him;
//      nothing of the enemy's rim; nothing cut off; the feather's quill fixed in his cap;
//   3. his face reads at the game's size: two dark eyes on his lit face under the cap, and the brown of his moustache under them.
//   run: tsx --test tests/ranger_up.test.ts          RANGER_UP_ALL=1 tsx --test tests/ranger_up.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';
// @ts-ignore
import * as nodePath from 'node:path';

import { RANGER_UP, RU_BROWN, RU_SKIN, paintRu } from '../src/art/ranger_up';
import { WU_RIM } from '../src/art/warrior_up';
import { MOVES3 } from '../src/art/moves3';
import { INK, RIM_ALPHA } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { rgba } from '../src/engine/px';
import { hashSprite } from '../tools/cheap_heroes';
import { rangerLists } from '../tools/ranger_up_measure';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; deepEqual(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };
declare const process: { env: Record<string, string | undefined> };
paintWithoutCanvas();

test('1. the switch is off, and nothing of the game imports the new file', () => {
  assert.equal(RANGER_UP.on, false, 'RANGER_UP is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('art/ranger_up')) continue;
    if (/from ['"][^'"]*ranger_up['"]/.test(fs.readFileSync(path.join('src', f), 'utf8'))) users.push(f);
  }
  assert.equal(users.join(' '), '', 'what imports it');
});

test('1. every frame the game paints of the Ranger is the very same picture (the hashes made from him as he is)', () => {
  const pinned = JSON.parse(fs.readFileSync('tests/ranger_up.hashes.json', 'utf8')) as { lists: Record<string, string[]> };
  const lists = rangerLists();
  assert.deepEqual(lists.map((l) => l.name).sort(), Object.keys(pinned.lists).sort(), 'the same lists');
  const all = !!process.env.RANGER_UP_ALL;
  let n = 0;
  for (const l of lists) {
    const want = pinned.lists[l.name];
    assert.equal(l.frames.length, want.length, `${l.name}: as many frames`);
    const picks = all ? want.map((_, i) => i) : [...new Set([0, Math.floor(want.length / 2), want.length - 1])];
    for (const i of picks) {
      assert.equal(hashSprite(l.frames[i]), want[i], `${l.name}[${i}]: the very same picture`);
      n++;
    }
  }
  assert.ok(n > 300, `${n} frames held to their hashes`);
});

test('2. his stance, sculpted, from in front: crisp, the friend\'s cyan edge, nothing of the enemy\'s rim, nothing cut off, the feather fixed', () => {
  const m = MOVES3.rstand;
  const end = m.motion.keys[m.motion.keys.length - 1].at;
  const rim = rgba(WU_RIM);
  const enemy = rgba(ENEMY_RIM);
  const faults: string[] = [];
  for (let i = 0; i < Math.round(end * 30); i++) {
    const f = paintRu(m, i / 30, 'front');
    const { px } = f;
    const d = px.d;
    let edge = 0;
    let body = 0;
    for (let k = 0; k < d.length; k += 4) {
      const a = d[k + 3];
      if (a === 0) continue;
      if (a === RIM_ALPHA) {
        if (d[k] === rim[0] && d[k + 1] === rim[1] && d[k + 2] === rim[2]) edge++;
        else faults.push(`${i}: an edge pixel not cyan`);
        continue;
      }
      if (a !== 255) faults.push(`${i}: a pixel part seen through (${a})`);
      if (d[k] === enemy[0] && d[k + 1] === enemy[1] && d[k + 2] === enemy[2]) faults.push(`${i}: the enemy's rim`);
      body++;
    }
    if (body < 400 || edge < 60) faults.push(`${i}: ${body} painted, ${edge} of edge`);
    for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) if (d[(y * px.w + x) * 4 + 3] > 0) faults.push(`${i}: cut off`);
    for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) if (d[(y * px.w + x) * 4 + 3] > 0) faults.push(`${i}: cut off`);
    const quill = (f.tails ?? []).find((t) => t.id === 'r-feather');
    if (!quill) faults.push(`${i}: no feather`);
    else {
      // (the quill in his cap: on a painted pixel of the cap's teal, or right at its edge)
      let near = false;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const x = Math.round(quill.x) + dx;
        const y = Math.round(quill.y) + dy;
        if (x >= 0 && y >= 0 && x < px.w && y < px.h && d[(y * px.w + x) * 4 + 3] === 255) near = true;
      }
      if (!near) faults.push(`${i}: the feather's quill off his cap`);
    }
  }
  assert.equal(faults.length, 0, [...new Set(faults)].slice(0, 12).join('; '));
});

test('3. his face reads at the game\'s size: two dark eyes on his lit face, the brown of his moustache under them', () => {
  const m = MOVES3.rstand;
  const ink = rgba(INK);
  const skin = new Set(RU_SKIN.map((c) => rgba(c).slice(0, 3).join(',')));
  const lit = new Set(RU_SKIN.slice(2).map((c) => rgba(c).slice(0, 3).join(',')));
  const brown = new Set(RU_BROWN.slice(1).map((c) => rgba(c).slice(0, 3).join(',')));
  for (const t of [0, 0.6, 1.2, 1.8]) {
    const { px } = paintRu(m, t, 'front');
    const d = px.d;
    const at = (x: number, y: number): string => (x < 0 || y < 0 || x >= px.w || y >= px.h ? '' : `${d[(y * px.w + x) * 4]},${d[(y * px.w + x) * 4 + 1]},${d[(y * px.w + x) * 4 + 2]}`);
    // (an eye: an ink pixel with his skin left and right of it, lit on one side at least)
    const eyes: [number, number][] = [];
    let tash = 0;
    for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) {
      const c = at(x, y);
      if (c === `${ink[0]},${ink[1]},${ink[2]}` && skin.has(at(x - 1, y)) && skin.has(at(x + 1, y)) && (lit.has(at(x - 1, y)) || lit.has(at(x + 1, y)))) eyes.push([x, y]);
    }
    const cols = new Set(eyes.map(([x]) => x));
    assert.ok(cols.size >= 2, `t ${t}: two eyes on lit skin (${eyes.length} eye pixels in ${cols.size} columns)`);
    const top = Math.min(...eyes.map(([, y]) => y));
    for (let y = top + 1; y <= top + 6; y++) for (let x = Math.min(...cols) - 3; x <= Math.max(...cols) + 3; x++) if (brown.has(at(x, y))) tash++;
    assert.ok(tash >= 6, `t ${t}: his moustache under his eyes (${tash} pixels of its brown)`);
  }
});
