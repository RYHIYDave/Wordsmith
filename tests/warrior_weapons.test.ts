// THE WARRIOR'S BATTLE AXE AND WARHAMMER, STEP 1: THEIR LOOKS (src/art/warrior_up_weapons.ts, src/dev/warrior_weapons_items.ts;
// the art chat's helper, 9 Nov 2026; docs/mockups/warrior_weapons/README.md). A MOCK-UP BEHIND A SWITCH THAT IS OFF. Held here:
//   1. the switch is off, and nothing of the game imports either file (the pictures' tools only);
//   2. each of the six takes, held by him in his guard, on his back in town, and at the top of its tap's wind-up (the Cleave, the
//      Smash): NOTHING THROUGH ANYTHING (no solid of the take inside one of his, but where his two fists close round its grip),
//      and both his hands on the haft, at its grip;
//   3. IT READS FROM ALL EIGHT SIDES: in his guard and on his back, from each of his eight sides, at least 100 picture pixels
//      of its head are seen at the game's own size; at the top of the wind-up, from the two sides the sheet shows it, 150;
//   4. every frame crisp (every pixel whole but his edge of light), the friend's cyan edge round him, and nothing on him of the enemy's pink or gold: what of the take is
//      seen is its own iron, wood and leather, and its glow the friend's cyan;
//   5. as items, each take at its four rarities in style A: 32 by 32, crisp, inside its frame with a clear pixel round it, the
//      rim of its rarity's colour; each rarer one finer (the four different; Magic with blue, Rare with gold or a yellow
//      stone, Unique with orange stones); nothing of the enemy's colours and no cyan.
//   run: tsx --test tests/warrior_weapons.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';

import { BLADE, CYAN, GLINT, INK, PINK, SPARK } from '../src/art/kit';
import { ENEMY_RIM, FLAME, MENACE } from '../src/art/mkit';
import { RARITY_COLOR } from '../src/art/palette';
import { rgba } from '../src/engine/px';
import type { Px } from '../src/engine/px';
import { WU_RIM, WU_SIDES } from '../src/art/warrior_up';
import type { WuSide } from '../src/art/warrior_up';
import { TAKES, TAKE_IDS, WARRIOR_WEAPONS, WW_DARK, WW_GLOW, WW_IRON, WW_LEATHER, WW_WOOD, armedThrough, handsOnHaft, paintHold, takeSeen } from '../src/art/warrior_up_weapons';
import type { ArmedFrame, Hold, TakeId } from '../src/art/warrior_up_weapons';
import { paintWeaponItem } from '../src/dev/warrior_weapons_items';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

paintWithoutCanvas();

const key = (c: string): string => rgba(c).slice(0, 3).join(',');
const ENEMY = new Set([...PINK, ...FLAME, ENEMY_RIM, MENACE.color, '#ff3a78'].map(key));
const GOLD_GLOW = new Set(['#ffb070', '#fff0a0', '#ffd448', '#f6cc5c'].map(key));
const CYANS = new Set([...CYAN, ...BLADE, ...SPARK, GLINT, WU_RIM, '#22d0e0', '#28dcf0'].map(key).filter((k) => k !== '255,255,255'));
const OWN = new Set([...WW_IRON, ...WW_DARK, ...WW_WOOD, ...WW_LEATHER, ...WW_GLOW, INK].map(key));

const holds = (id: TakeId): Hold[] => ['guard', 'town', TAKES[id].kind === 'axe' ? 'cleave' : 'smash'];
const frames = new Map<string, ArmedFrame>();
function frame(id: TakeId, hold: Hold, side: WuSide): ArmedFrame {
  const k = `${id}:${hold}:${side}`;
  let f = frames.get(k);
  if (!f) frames.set(k, (f = paintHold(TAKES[id], hold, side)));
  return f;
}
const pixel = (p: Px, i: number): string => `${p.d[i * 4]},${p.d[i * 4 + 1]},${p.d[i * 4 + 2]}`;

test('1. the switch is off, and nothing of the game imports the new weapons or their drops', () => {
  assert.equal(WARRIOR_WEAPONS.on, false, 'WARRIOR_WEAPONS is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f === 'art/warrior_up_weapons.ts' || f === 'dev/warrior_weapons_items.ts') continue;
    const text = fs.readFileSync(`src/${f}`, 'utf8');
    if (/from ['"][^'"]*(warrior_up_weapons|warrior_weapons_items)['"]/.test(text)) users.push(f);
  }
  assert.deepEqual(users, [], 'what imports them');
  // (the drops reach the game's item painter, art/items_a.ts, only to paint as it paints: it does not reach them)
  assert.ok(!/from ['"][^'"]*warrior_weapons/.test(fs.readFileSync('src/art/items_a.ts', 'utf8')), 'items_a does not import the drops');
});

test('2. nothing through anything: no solid of a take inside one of his but where his fists hold it; both hands on its grip', () => {
  const bad: string[] = [];
  for (const id of TAKE_IDS) for (const hold of holds(id)) {
    // (the solids are his and its whichever side he is seen from: one side is enough)
    const f = frame(id, hold, 'front');
    for (const t of armedThrough(f)) bad.push(`${id} ${hold}: ${t}`);
    if (hold !== 'town') for (const h of handsOnHaft(f)) bad.push(`${id} ${hold}: ${h}`);
  }
  assert.deepEqual(bad, [], 'through, or a hand off the haft');
});

test('2. ... and the check sees a take put through him (the axe laid level through his chest)', () => {
  const f = frame('axeA', 'guard', 'front');
  const s = f.s;
  // (the same frame, the take moved so its haft runs through his ribs)
  const moved = { ...f, placed: { ...f.placed, o: s.ribs } } as ArmedFrame;
  const sc = f.sc;
  const its = sc.prims.slice(f.firstPrim);
  const shift = [s.ribs[0] - f.placed.o[0], s.ribs[1] - f.placed.o[1], s.ribs[2] - f.placed.o[2]];
  const at = (p: readonly number[]): [number, number, number] => [p[0] + shift[0], p[1] + shift[1], p[2] + shift[2]];
  const prims = [...sc.prims.slice(0, f.firstPrim), ...its.map((p) => (p.k === 'cone' ? { ...p, a: at(p.a), b: at(p.b) } : p.k === 'tri' ? { ...p, a: at(p.a), b: at(p.b), c: at(p.c) } : { ...p, c: at(p.c) }))];
  const through = armedThrough({ ...moved, sc: { ...sc, prims } as typeof sc });
  assert.ok(through.some((t) => /trunk/.test(t)), `seen: ${through.join('; ')}`);
});

test('3. each take reads from all eight sides, in his guard and on his back (100 pixels of its head at least), and at the top of its wind-up (150)', () => {
  const least: string[] = [];
  const short: string[] = [];
  for (const id of TAKE_IDS) {
    for (const hold of ['guard', 'town'] as Hold[]) {
      let low = Infinity;
      let where = '';
      for (const side of WU_SIDES) {
        const n = takeSeen(frame(id, hold, side)).head;
        if (n < low) [low, where] = [n, side];
        if (n < 100) short.push(`${id} ${hold} ${side}: ${n}`);
      }
      least.push(`${id} ${hold} ${low} (${where})`);
    }
    const key = holds(id)[2];
    for (const side of ['front', 'side'] as WuSide[]) {
      const n = takeSeen(frame(id, key, side)).head;
      if (n < 150) short.push(`${id} ${key} ${side}: ${n}`);
    }
  }
  console.log(`  the least of each take's head seen: ${least.join('; ')}`);
  assert.deepEqual(short, [], 'too little of the head seen');
});

test('4. crisp; the friend\'s cyan edge round him; nothing of the enemy\'s; what of the take is seen is its own iron, wood and leather, and its glow cyan', () => {
  const bad: string[] = [];
  for (const id of TAKE_IDS) for (const hold of holds(id)) for (const side of WU_SIDES) {
    if (hold !== 'guard' && hold !== 'town' && side !== 'front' && side !== 'side') continue;
    const f = frame(id, hold, side);
    const p = f.px;
    const at = `${id} ${hold} ${side}`;
    let rim = 0;
    let glow = 0;
    const its = new Set<number>();
    for (let m = f.firstMat; m < f.sc.mats.length; m++) its.add(m);
    for (let i = 0; i < p.w * p.h; i++) {
      const a = p.d[i * 4 + 3];
      if (!a) continue;
      const c = pixel(p, i);
      // (every pixel whole but his edge of light, which the game lays at its own strength)
      if (a !== 255 && c !== key(WU_RIM)) bad.push(`${at}: a pixel half see-through (${c}, ${a})`);
      if (ENEMY.has(c) || GOLD_GLOW.has(c)) bad.push(`${at}: the enemy's colour ${c}`);
      if (c === key(WU_RIM)) rim++;
      if (its.has(f.drawn.stuff[i])) {
        if (!OWN.has(c)) bad.push(`${at}: the take painted ${c}, not its own`);
        if (CYANS.has(c) || c === '255,255,255') glow++;
      }
    }
    if (rim < 100) bad.push(`${at}: his cyan edge only ${rim} pixels`);
    if (hold !== 'town' && glow < 4) bad.push(`${at}: no cyan glow on it (${glow})`);
    if (bad.length > 20) break;
  }
  assert.deepEqual(bad.slice(0, 20), [], 'crisp, cyan, his own');
});

test('5. as items: each take at its four rarities, 32 by 32, crisp, inside its frame, its rarity\'s rim; each rarer one finer; no enemy\'s colour, no cyan', () => {
  const BLUE = new Set(['#0c1440', '#16286e', '#2446a8', '#4a74e0', '#9ab8ff', '#0a1048', '#18288a', '#2a50cc', '#5a8aff', '#d6e4ff'].map(key));
  const GOLD = new Set(['#4a2408', '#8a4e14', '#d0902c', '#f6cc5c', '#fff4c0', '#4a2a04', '#8a5208', '#d89a14', '#ffd448', '#fff8d0', '#e0a040'].map(key));
  const AMBER = new Set(['#4a1404', '#8a2c08', '#d85a14', '#ff9a3c', '#ffe0b0'].map(key));
  const bad: string[] = [];
  for (const id of TAKE_IDS) {
    const seen = new Set<string>();
    const finery: number[] = [];
    for (let r = 0; r < 4; r++) {
      const p = paintWeaponItem(id, r as 0);
      const at = `${id} (rarity ${r})`;
      if (p.w !== 32 || p.h !== 32) bad.push(`${at}: ${p.w} by ${p.h}`);
      let rim = 0;
      let blue = 0;
      let gold = 0;
      let amber = 0;
      let painted = 0;
      const sig: string[] = [];
      for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
        const i = y * 32 + x;
        const a = p.d[i * 4 + 3];
        if (a !== 0 && a !== 255) bad.push(`${at}: half see-through at ${x},${y}`);
        if (!a) continue;
        painted++;
        if (x === 0 || y === 0 || x === 31 || y === 31) bad.push(`${at}: touches its frame at ${x},${y}`);
        const c = pixel(p, i);
        sig.push(c);
        if (ENEMY.has(c)) bad.push(`${at}: the enemy's ${c}`);
        if (CYANS.has(c)) bad.push(`${at}: cyan ${c}`);
        if (c === key(RARITY_COLOR[r])) rim++;
        if (BLUE.has(c)) blue++;
        if (GOLD.has(c)) gold++;
        if (AMBER.has(c)) amber++;
      }
      if (rim < 50) bad.push(`${at}: its rim ${rim} pixels`);
      if (painted < 150) bad.push(`${at}: only ${painted} pixels`);
      if (r === 1 && blue < 6) bad.push(`${at}: no blue`);
      if (r === 2 && gold < 10) bad.push(`${at}: no gold`);
      if (r === 3 && amber < 4) bad.push(`${at}: no orange stones`);
      finery.push(gold + amber + blue);
      seen.add(sig.join(';'));
    }
    if (seen.size !== 4) bad.push(`${id}: its four rarities are not all different`);
    if (!(finery[3] > finery[0])) bad.push(`${id}: the Unique no finer than the Normal`);
  }
  assert.deepEqual(bad, [], 'the items');
});
