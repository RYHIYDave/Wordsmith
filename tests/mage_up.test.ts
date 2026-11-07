// THE MAGE BROUGHT UP TO THE BRAWLER'S LEVEL, STAGE 1 (src/art/mage_up.ts, _moves.ts, _art.ts; the art chat's helper, 7 Nov
// 2026; docs/mockups/mage_up/README.md). A MOCK-UP BEHIND A SWITCH THAT IS OFF, MAGE_UP: her look sculpted, shown in one still.
// Held here:
//   1. the switch is off; nothing of the game imports the new files; with it off, EVERY FRAME THE GAME PAINTS OF HER IS THE SAME
//      (each list's first, middle and last frame against the hashes made from the game's Mage as she is, 46584c7c:
//      tests/mage_up.hashes.json; MAGE_UP_ALL=1 for every frame);
//   2. HER LEGS TRUE in her stance: every frame of her breathing guard, from all eight sides, at 1.05 or more below the knee to
//      above it (on her bones; and as painted, each leg whose shin is seen); the game's guard read short; her body, arms and staff
//      as the game's, only her feet and knees placed again;
//   3. every picture of the still from every side: crisp, the friend's cyan edge, nothing of the enemy's rim, nothing cut off, both
//      braids fixed, her crystal's charge handed back, every light of hers the friend's cyan;
//   4. HER STAFF SEEN FROM EVERY SIDE in her stance: its wood and steel and its crystal;
//   5. HER FACE at the game's size: two dark eyes on her lit face from in front, toward you and from down and to the left; one
//      side-on.
//   run: tsx --test tests/mage_up.test.ts          MAGE_UP_ALL=1 tsx --test tests/mage_up.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';
// @ts-ignore
import * as nodePath from 'node:path';

import { MAGE_UP, MU_SKIN } from '../src/art/mage_up';
import { paintMuMove } from '../src/art/mage_up_art';
import { MU_CAST_HELD3, MU_GUARD, MU_GUARD_LEGS, MU_STAND3 } from '../src/art/mage_up_moves';
import { WU_RIM, WU_SIDES } from '../src/art/warrior_up';
import type { WuSide } from '../src/art/warrior_up';
import { WU_LEG_SEEN, wuLegs } from '../src/art/warrior_up_review';
import { MAGE_BODY, MOVES3 } from '../src/art/moves3';
import type { Move3 } from '../src/art/moves3';
import { CYAN, INK, RIM_ALPHA, SPARK } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { bonesAt, solve } from '../src/art/skeleton';
import { rgba } from '../src/engine/px';
import { hashSprite } from '../tools/cheap_heroes';
import { mageLists } from '../tools/mage_up_measure';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; deepEqual(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };
declare const process: { env: Record<string, string | undefined> };
paintWithoutCanvas();

const endOf = (m: Move3): number => m.motion.keys[m.motion.keys.length - 1].at;
/** The moments of her stance the pictures are looked at in (her breathing and the crystal's two surges among them). */
const LOOKED = [0, 0.3, 0.6, 1.2, 1.6, 2.1];

// --- 1. the switch, and the game's Mage unchanged while it is off --------------------------------------------------------------

test('1. the switch is off; nothing of the game imports the new files', () => {
  assert.equal(MAGE_UP.on, false, 'MAGE_UP is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('art/mage_up')) continue;
    if (/from ['"][^'"]*mage_up(_moves|_art)?['"]/.test(fs.readFileSync(path.join('src', f), 'utf8'))) users.push(f);
  }
  assert.equal(users.join(' '), '', 'nothing of the game imports them');
});

test('1. with the switch off, every frame the game paints of the Mage is the very same picture (the hashes made from her as she is)', () => {
  const pinned = JSON.parse(fs.readFileSync('tests/mage_up.hashes.json', 'utf8')) as { lists: Record<string, string[]> };
  const lists = mageLists();
  assert.deepEqual(lists.map((l) => l.name).sort(), Object.keys(pinned.lists).sort(), 'the same lists');
  const all = !!process.env.MAGE_UP_ALL;
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
  assert.ok(n > 250, `${n} frames held to their hashes`);
});

// --- 2. her legs ----------------------------------------------------------------------------------------------------------------

test('2. her legs read true in her stance: every frame of her breathing guard from all eight sides at 1.05 or more; the game\'s read short', () => {
  const least = (m: Move3, t: number, v: WuSide): number => Math.min(...wuLegs(solve(m.build, bonesAt(m.motion.keys, m.rest, t)), v, MAGE_BODY.ankle).map((l) => l.ratio));
  const faults: string[] = [];
  let n = 0;
  for (let i = 0; i < Math.round(endOf(MU_STAND3) * 30); i++) {
    for (const v of WU_SIDES) {
      const r = least(MU_STAND3, i / 30, v);
      if (r < 1.05) faults.push(`${i} ${v} ${r.toFixed(2)}`);
      n++;
    }
  }
  assert.ok(n >= 72 * 8, `${n} moments`);
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
  // (the game's guard, as it is: short from in front and from toward the camera)
  assert.ok(least(MOVES3.mstand, 0.6, 'front') < 0.75, 'the game\'s guard from in front');
  assert.ok(least(MOVES3.mstand, 0.6, 'toward') < 0.65, 'the game\'s guard from toward the camera');
  // (her body, arms and staff as the game's: only her feet and knees placed again)
  const legKeys = new Set(Object.keys(MU_GUARD_LEGS));
  for (const [k, v] of Object.entries(MU_GUARD)) if (!legKeys.has(k)) assert.equal(v, (MOVES3.mstand.rest as unknown as Record<string, number>)[k], `${k} as the game's`);
  assert.equal(MU_STAND3.motion, MOVES3.mstand.motion, 'her breathing the game\'s own');
});

test('2. ... and as painted: each leg whose shin is seen, from every side, at 1.05 or more', () => {
  const faults: string[] = [];
  let seen = 0;
  for (const t of LOOKED) for (const v of WU_SIDES) {
    const f = paintMuMove(MU_STAND3, t, v);
    for (const l of wuLegs(f.s, v, MAGE_BODY.ankle, { z: f.drawn.z, w: f.px.w, h: f.px.h })) {
      if (l.seen < WU_LEG_SEEN) continue;
      seen++;
      if (l.ratio < 1.05) faults.push(`${t} ${v} ${l.leg} ${l.ratio.toFixed(2)}`);
    }
  }
  assert.ok(seen >= LOOKED.length * 8, `${seen} legs seen`);
  assert.equal(faults.length, 0, faults.join('; '));
});

// --- 3. every picture ------------------------------------------------------------------------------------------------------------

test('3. every picture of the still, from every side: crisp, the friend\'s cyan edge, nothing of the enemy\'s rim, nothing cut off, her braids fixed, her lights cyan', () => {
  const rim = rgba(WU_RIM);
  const enemy = rgba(ENEMY_RIM);
  const cyan = new Set([...SPARK, ...CYAN].map((c) => c.toLowerCase()));
  const faults: string[] = [];
  const shots: [Move3, number, WuSide][] = [];
  for (const t of LOOKED) for (const v of WU_SIDES) shots.push([MU_STAND3, t, v]);
  for (const v of WU_SIDES) shots.push([MU_CAST_HELD3, 0.3, v]);
  for (const [m, t, v] of shots) {
    const f = paintMuMove(m, t, v);
    const d = f.px.d;
    let edge = 0;
    for (let k = 0; k < d.length; k += 4) {
      const a = d[k + 3];
      if (a === 0) continue;
      if (a === RIM_ALPHA) {
        if (d[k] === rim[0] && d[k + 1] === rim[1] && d[k + 2] === rim[2]) edge++;
        else faults.push(`${m.name} ${t} ${v}: an edge pixel not cyan`);
        continue;
      }
      if (a !== 255) faults.push(`${m.name} ${t} ${v}: a pixel part seen through`);
      if (d[k] === enemy[0] && d[k + 1] === enemy[1] && d[k + 2] === enemy[2]) faults.push(`${m.name} ${t} ${v}: the enemy's rim`);
    }
    if (edge < 60) faults.push(`${m.name} ${t} ${v}: ${edge} of edge`);
    const W = f.px.w;
    const H = f.px.h;
    for (let x = 0; x < W; x++) for (const y of [0, H - 1]) if (d[(y * W + x) * 4 + 3] > 0) faults.push(`${m.name} ${t} ${v}: cut off`);
    for (let y = 0; y < H; y++) for (const x of [0, W - 1]) if (d[(y * W + x) * 4 + 3] > 0) faults.push(`${m.name} ${t} ${v}: cut off`);
    const ids = (f.tails ?? []).map((r) => r.id).sort().join(' ');
    if (ids !== 'm-braid-a m-braid-b') faults.push(`${m.name} ${t} ${v}: her braids (${ids})`);
    if (!f.charge || !(f.charge.heat > 0)) faults.push(`${m.name} ${t} ${v}: no charge`);
    for (const l of f.lights) if (!cyan.has(l.color.toLowerCase())) faults.push(`${m.name} ${t} ${v}: a light of ${l.color}`);
  }
  assert.equal(faults.length, 0, [...new Set(faults)].slice(0, 12).join('; '));
});

// --- 4. her staff seen -------------------------------------------------------------------------------------------------------

test('4. her staff is seen from every side in her stance: its wood and steel, and its crystal', () => {
  const faults: string[] = [];
  const least: Record<string, [number, number]> = {};
  for (const t of LOOKED) for (const v of WU_SIDES) {
    const f = paintMuMove(MU_STAND3, t, v);
    const st = f.drawn.stuff;
    const W = f.px.w;
    // (game pixels: two picture pixels across; one counts when half of it or more is the staff's)
    let staff = 0;
    let gem = 0;
    for (let y = 0; y + 1 < f.px.h; y += 2) for (let x = 0; x + 1 < W; x += 2) {
      let a = 0;
      let b = 0;
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        const k = st[(y + dy) * W + x + dx];
        if (f.staffMats.includes(k)) a++;
        if (k === 1000) b++;
      }
      if (a >= 2) staff++;
      if (b >= 2) gem++;
    }
    const e = (least[v] ??= [Infinity, Infinity]);
    e[0] = Math.min(e[0], staff + gem);
    e[1] = Math.min(e[1], gem);
    if (staff + gem < 20 || gem < 12) faults.push(`${t} ${v}: ${staff} of its wood and steel, ${gem} of its crystal`);
  }
  console.log('# her staff, the least seen from each side (all of it / its crystal), game pixels:', JSON.stringify(least));
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

// --- 5. her face ----------------------------------------------------------------------------------------------------------------

test('5. her face reads at the game\'s size: two dark eyes on her lit face from in front, toward you and down to the left; one side-on', () => {
  const ink = rgba(INK);
  const skin = new Set(MU_SKIN.map((c) => rgba(c).slice(0, 3).join(',')));
  const lit = new Set(MU_SKIN.slice(2).map((c) => rgba(c).slice(0, 3).join(',')));
  for (const [v, want] of [['front', 2], ['toward', 2], ['frontL', 2], ['side', 1]] as const) {
    for (const t of LOOKED) {
      const { px } = paintMuMove(MU_STAND3, t, v);
      const d = px.d;
      const at = (x: number, y: number): string => (x < 0 || y < 0 || x >= px.w || y >= px.h ? '' : `${d[(y * px.w + x) * 4]},${d[(y * px.w + x) * 4 + 1]},${d[(y * px.w + x) * 4 + 2]}`);
      const cols = new Set<number>();
      for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) {
        if (at(x, y) === `${ink[0]},${ink[1]},${ink[2]}` && skin.has(at(x - 1, y)) && skin.has(at(x + 1, y)) && (lit.has(at(x - 1, y)) || lit.has(at(x + 1, y)))) cols.add(x);
      }
      assert.ok(cols.size >= want, `${v} ${t}: ${want} eyes on lit skin (${cols.size})`);
    }
  }
});
