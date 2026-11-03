// THE NEW ITEM PICTURES, STYLE A, GAME-READY (src/art/items_a.ts), behind ITEMS_A, off. His picks, 3 Nov 2026: “A, painted”;
// “Finer and a rim”. So:
//   1. the switch is off, and the game asks for the pictures in one place only, art/icons.ts itemPic (main.ts holds the switch
//      for its __dbg hook, nothing more; tests/items_a_game.test.ts checks each place that shows an item);
//   2. every kind at every rarity: 32 by 32 picture pixels (16 game pixels), every pixel crisp, the item inside its frame with a
//      clear pixel all round (nothing cut off, the rim clear of the slot's frame), big enough to read;
//   3. the rim: a thin line, one picture pixel, of the rarity's own colour (the game's RARITY_COLOR) all round the item's ink;
//   4. each rarer one finer: the four all different, Magic with a touch of blue, Rare with gold or a yellow stone, Unique with
//      orange stones, and more finery (gold, stones) than the Normal;
//   5. no two kinds' silhouettes alike, at any rarity (the closest pair is printed);
//   6. no enemy's colours anywhere; the friend's cyan only in the core of the Tinkerer's wrench; the tome's fire the demon's
//      red-orange (his words, 3 Nov 2026, 10:44: “red/orange fire on the tome”), never cyan;
//   7. itemArt: 16 by 16 game pixels, anchor the middle, painted two to a game pixel; the old weapons show the kind they became.
//   run: tsx --test tests/items_a.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';

import { BLADE, CYAN, GLINT, PINK, SPARK } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { RARITY_COLOR } from '../src/art/palette';
import { Px, rgba } from '../src/engine/px';
import { ITEMS_A, ITEM_A_INK, ITEM_A_KINDS, ITEM_A_N, ITEM_A_OLD, itemAKind, itemArt, paintItemA } from '../src/art/items_a';
import type { ItemAKind } from '../src/art/items_a';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

const RARS = [0, 1, 2, 3] as const;
const key = (c: string): string => rgba(c).slice(0, 3).join(',');
const GLOW = new Set([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0', '#8af6f0', '#e8fffc', '#127e94'].map(key).filter((k) => k !== '255,255,255'));
const ENEMY = new Set([...PINK, ...FLAME, ENEMY_RIM, '#ff3a78'].map(key));
const BLUE = new Set(['#0c1440', '#16286e', '#2446a8', '#4a74e0', '#9ab8ff', '#0a1048', '#18288a', '#2a50cc', '#5a8aff', '#d6e4ff'].map(key));
const GOLD = new Set(['#4a2408', '#8a4e14', '#d0902c', '#f6cc5c', '#fff4c0', '#4a2a04', '#8a5208', '#d89a14', '#ffd448', '#fff8d0'].map(key));
const AMBER = new Set(['#4a1404', '#8a2c08', '#d85a14', '#ff9a3c', '#ffe0b0'].map(key));
const pics = new Map<string, Px>();
const pic = (k: ItemAKind, r: 0 | 1 | 2 | 3): Px => {
  const id = `${k}:${r}`;
  let p = pics.get(id);
  if (!p) pics.set(id, (p = paintItemA(k, r)));
  return p;
};
const has = (p: Px, x: number, y: number): boolean => x >= 0 && y >= 0 && x < p.w && y < p.h && p.d[(y * p.w + x) * 4 + 3] > 0;
const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const;

test('the switch is ON at his yes of 3 Nov 2026, and the game asks for the new pictures only through art/icons.ts itemPic', () => {
  assert.equal(ITEMS_A.on, true, 'ITEMS_A is on');
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/') || f === 'art/items_a.ts') continue;
    const src = fs.readFileSync(`src/${f}`, 'utf8');
    if (f === 'art/icons.ts') {
      assert.ok(/import \{ ITEMS_A, itemAKind, itemArt \} from '\.\/items_a';/.test(src), 'art/icons.ts asks for them (itemPic)');
      continue;
    }
    if (f === 'main.ts') {
      assert.ok(/import \{ ITEMS_A \} from '\.\/art\/items_a';/.test(src), 'main.ts: the switch, for __dbg');
      assert.equal(src.match(/items_a['"]/g)?.length, 1, 'main.ts imports the switch alone');
      continue;
    }
    assert.ok(!/items_a['"]/.test(src), `src/${f} imports art/items_a`);
  }
});

test('every kind at every rarity: its size, crisp, inside its frame with a clear pixel round it, big enough', () => {
  for (const k of ITEM_A_KINDS) for (const r of RARS) {
    const p = pic(k, r);
    const id = `${k} (rarity ${r})`;
    assert.equal(p.w, ITEM_A_N, `${id}: width`);
    assert.equal(p.h, ITEM_A_N, `${id}: height`);
    let painted = 0;
    let x0 = 99, x1 = -1, y0 = 99, y1 = -1;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const a = p.d[(y * p.w + x) * 4 + 3];
      assert.ok(a === 0 || a === 255, `${id}: a pixel half see-through at ${x},${y}`);
      if (!a) continue;
      painted++;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    assert.ok(x0 >= 1 && y0 >= 1 && x1 <= p.w - 2 && y1 <= p.h - 2, `${id}: reaches the edge of its frame (${x0},${y0} to ${x1},${y1})`);
    assert.ok(painted >= 150, `${id}: only ${painted} pixels`);
    assert.ok(Math.max(x1 - x0, y1 - y0) + 1 >= 22, `${id}: only ${Math.max(x1 - x0, y1 - y0) + 1} across`);
  }
});

test('the rim: one picture pixel of the rarity’s own colour, all round the item’s ink', () => {
  for (const k of ITEM_A_KINDS) for (const r of RARS) {
    const p = pic(k, r);
    const id = `${k} (rarity ${r})`;
    const rim = RARITY_COLOR[r];
    let n = 0;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      if (!has(p, x, y)) continue;
      const c = p.get(x, y);
      const outside = N4.some(([dx, dy]) => !has(p, x + dx, y + dy));
      // (its outermost pixels are all the rim; the rim is only ever outermost, one pixel thick; ink lies inside it)
      if (outside) assert.equal(c, rim, `${id}: its edge at ${x},${y} is ${c}, not the rim`);
      if (c === rim) {
        n++;
        assert.ok(outside, `${id}: the rim is thicker than a pixel at ${x},${y}`);
        assert.ok(N4.some(([dx, dy]) => has(p, x + dx, y + dy) && p.get(x + dx, y + dy) === ITEM_A_INK), `${id}: the rim at ${x},${y} is not round the ink`);
      }
    }
    assert.ok(n >= 50, `${id}: its rim has only ${n} pixels`);
  }
});

test('each rarer one is finer: all four different; blue in the Magic, gold or a yellow stone in the Rare, orange stones in the Unique, and more finery than the Normal', () => {
  const inner = (p: Px, x: number, y: number): string | null => {
    const c = p.get(x, y);
    return c && !(RARITY_COLOR as readonly string[]).includes(c) ? c : null;
  };
  for (const k of ITEM_A_KINDS) {
    const four = RARS.map((r) => pic(k, r));
    for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) {
      let diff = 0;
      for (let y = 0; y < ITEM_A_N; y++) for (let x = 0; x < ITEM_A_N; x++) if (inner(four[a], x, y) !== inner(four[b], x, y)) diff++;
      assert.ok(diff >= 12, `${k}: the rarities ${a} and ${b} differ by only ${diff} pixels`);
    }
    const colours = four.map((p) => {
      const s = new Set<string>();
      for (let y = 0; y < ITEM_A_N; y++) for (let x = 0; x < ITEM_A_N; x++) { const c = inner(p, x, y); if (c) s.add(key(c)); }
      return s;
    });
    assert.ok([...colours[1]].some((c) => BLUE.has(c)), `${k}: no blue in the Magic`);
    assert.ok([...colours[2]].some((c) => GOLD.has(c)), `${k}: no gold in the Rare`);
    assert.ok([...colours[3]].some((c) => AMBER.has(c)), `${k}: no orange stone in the Unique`);
    // (and more of its finery: gold, stones, blue)
    const fine = (p: Px): number => {
      let n = 0;
      for (let y = 0; y < ITEM_A_N; y++) for (let x = 0; x < ITEM_A_N; x++) { const c = inner(p, x, y); if (c && (GOLD.has(key(c)) || AMBER.has(key(c)) || BLUE.has(key(c)))) n++; }
      return n;
    };
    assert.ok(fine(four[3]) >= fine(four[0]) + 10, `${k}: the Unique (${fine(four[3])} pixels of finery) hardly finer than the Normal (${fine(four[0])})`);
  }
});

test('no two kinds look alike: no two silhouettes overlap by four fifths or more, at any rarity', () => {
  const mask = (p: Px): boolean[] => Array.from({ length: p.w * p.h }, (_, i) => p.d[i * 4 + 3] > 0);
  for (const r of RARS) {
    const ms = ITEM_A_KINDS.map((k) => mask(pic(k, r)));
    let worst = 0, pair = '';
    for (let i = 0; i < ms.length; i++) for (let j = i + 1; j < ms.length; j++) {
      let both = 0, either = 0;
      for (let q = 0; q < ms[i].length; q++) { if (ms[i][q] && ms[j][q]) both++; if (ms[i][q] || ms[j][q]) either++; }
      const iou = both / either;
      if (iou > worst) { worst = iou; pair = `${ITEM_A_KINDS[i]} and ${ITEM_A_KINDS[j]}`; }
    }
    console.log(`  rarity ${r}: the closest two, ${pair}, overlap ${worst.toFixed(2)}`);
    assert.ok(worst < 0.8, `rarity ${r}: ${pair} overlap ${worst.toFixed(2)}`);
  }
});

test('no enemy’s colours anywhere; the friend’s cyan only in the core of the Tinkerer’s wrench', () => {
  for (const k of ITEM_A_KINDS) for (const r of RARS) {
    const p = pic(k, r);
    let cyan = 0;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const c = p.get(x, y);
      if (!c) continue;
      assert.ok(!ENEMY.has(key(c)), `${k} (rarity ${r}): the enemy's colour ${c} at ${x},${y}`);
      if (GLOW.has(key(c))) cyan++;
    }
    if (k === 'wrench' && r === 3) assert.ok(cyan >= 3, `the Unique wrench's core shows only ${cyan} pixels of cyan`);
    else assert.equal(cyan, 0, `${k} (rarity ${r}): the friend's glow`);
  }
});

test('the demonic tome burns in the demon’s red-orange fire at every rarity, none of it cyan', () => {
  const FIRE = new Set(['#4a0806', '#8e1a0a', '#d8401a', '#ff8a2c', '#ffd49a'].map(key));
  for (const r of RARS) {
    const p = pic('tome', r);
    let fire = 0, cyan = 0;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const c = p.get(x, y);
      if (!c) continue;
      if (FIRE.has(key(c))) fire++;
      if (GLOW.has(key(c))) cyan++;
    }
    assert.ok(fire >= 15, `the tome (rarity ${r}): its pages' fire shows only ${fire} pixels of red-orange`);
    assert.equal(cyan, 0, `the tome (rarity ${r}): ${cyan} pixels of the friend's cyan`);
  }
});

test('itemArt: 16 by 16 game pixels, anchor the middle, two picture pixels to a game pixel; the old weapons show what they became', () => {
  const proto = Px.prototype as unknown as { toCanvas: () => unknown };
  const was = proto.toCanvas;
  proto.toCanvas = function (this: Px): unknown { return this; };
  try {
    for (const k of ITEM_A_KINDS) for (const r of RARS) {
      const s = itemArt(k, r);
      assert.equal(s.w, 16, `${k}: w`);
      assert.equal(s.h, 16, `${k}: h`);
      assert.equal(s.ax, 8, `${k}: ax`);
      assert.equal(s.ay, 8, `${k}: ay`);
      assert.equal(s.density, 2, `${k}: density`);
      assert.ok(itemArt(k, r) === s, `${k}: made more than once`);
    }
    for (const [old, now] of Object.entries(ITEM_A_OLD)) {
      assert.equal(itemAKind(old), now, `${old}`);
      assert.ok(itemArt(old, 2) === itemArt(now, 2), `${old} shows the ${now}`);
    }
    assert.equal(itemAKind('potion'), null, 'a key with no picture');
  } finally {
    proto.toCanvas = was;
  }
});
