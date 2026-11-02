// FLOOR 11 LAID AS ONE GREAT WARD, THE PIGEONS' ROW (game/act2/gateward.ts GW_PIGEON_ROW; game/act2_moments.ts gateWardMomentAt):
// his pick of 2 Nov 2026, to the pigeons sitting far off the main way and on some layings nowhere, “A row of houses by the path
// (Recommended)”, and his yes to its pictures the same morning, “Yes, switch it on (Recommended)”. Held here, over ten seeds:
//   1. on (his yes); off, no row;
//   2. every laying of the great ward has its row, and the pigeons on its roof: the plot and every tile under a bird houses, the
//      street at its foot open and walked on, whence they are seen;
//   3. walking the main way's middle line he sees them go up: along a tile and a half of it at least, within their reach
//      (render/act1_pieces.ts MOMENT_NEAR, 5.5), the street at their foot in his sight, and they on a phone's screen;
//   4. the row cuts nothing off, stands on no tile of the way's middle line, and no bell stands by it.
//   run: tsx --test tests/pigeon_row.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { ACT2 } from '../src/game/act1';
import { reach } from '../src/game/act1_layout';
import { GW_OPEN, GW_PIGEON_ROW } from '../src/game/act2/gateward';
import { bellDist, pigeonRoofTiles, roofRidge } from '../src/game/act2_moments';
import { makeDungeon } from '../src/game/level';
import type { Level } from '../src/game/state';
import { T_FLOOR } from '../src/game/types';

const SEEDS = Array.from({ length: 10 }, (_, i) => i + 1);
/** (on a phone's screen, 234 game pixels high, his feet 129 down it: the birds, 84 over their ridge, 18 in from its top) */
const PHONE_DOWN = (129 - 84 - 18) / 8;
const NEAR = 5.5;

function floor11(s: number, row = GW_PIGEON_ROW.on): Level {
  const was = [ACT2.on, GW_PIGEON_ROW.on];
  ACT2.on = true;
  GW_PIGEON_ROW.on = row;
  try {
    return makeDungeon(11, s);
  } finally {
    [ACT2.on, GW_PIGEON_ROW.on] = was;
  }
}
const LAID = new Map<number, Level>();
const laid = (s: number): Level => LAID.get(s) ?? (LAID.set(s, floor11(s)), LAID.get(s)!);

/** The main way's middle line, a quarter tile at a time. */
function wayPoints(L: Level): [number, number][] {
  const way = L.land!.way;
  const out: [number, number][] = [];
  for (let i = 0; i + 1 < way.length; i++) {
    const [ax, ay] = way[i];
    const [bx, by] = way[i + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 0.25));
    for (let k = 0; k < n; k++) out.push([ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n]);
  }
  return out;
}

test('1. on (his yes); off, no row', () => {
  assert.equal(GW_PIGEON_ROW.on, true, 'his “Yes, switch it on (Recommended)”, 2 Nov 2026');
  assert.ok(GW_OPEN.on);
  for (const s of SEEDS.slice(0, 3)) assert.equal(floor11(s, false).land!.pigeons, undefined, `seed ${s}`);
});

test('2. every laying has its row, the pigeons on its roof, the street at its foot open', () => {
  for (const s of SEEDS) {
    const L = laid(s);
    const f = L.floor;
    const row = L.land!.pigeons;
    assert.ok(row, `seed ${s}: a row`);
    const m = L.act1?.moments?.[0];
    assert.ok(m, `seed ${s}: the pigeons laid`);
    assert.ok(Math.abs(m!.x - row!.x) < 1e-9 && Math.abs(m!.y - row!.y) < 1e-9, `seed ${s}: on the row`);
    const r = roofRidge(m!.x, m!.y);
    const j = Math.floor(m!.y / 2.5);
    for (const [tx, ty] of pigeonRoofTiles(m!.x, m!.y, j, r.from, r.to)) assert.notEqual(f.tiles[ty * f.w + tx], T_FLOOR, `seed ${s}: houses at ${tx}, ${ty}`);
    assert.equal(m!.seen, row!.foot * f.w + Math.floor(row!.x), `seed ${s}: seen from the street at its foot`);
    assert.equal(f.tiles[m!.seen], T_FLOOR);
    assert.equal(L.walk[m!.seen], 1, `seed ${s}: walked on`);
  }
});

test('3. walking the way he sees them go up: near, in sight, on a phone\'s screen, along a tile and a half of it', () => {
  for (const s of SEEDS) {
    const L = laid(s);
    const f = L.floor;
    const m = L.act1!.moments![0];
    const sx = (m.seen % f.w) + 0.5;
    const sy = Math.floor(m.seen / f.w) + 0.5;
    const clear = (px: number, py: number): boolean => {
      const n = Math.max(1, Math.ceil(Math.hypot(px - sx, py - sy) / 0.25));
      for (let k = 0; k <= n; k++) if (f.tiles[Math.floor(sy + ((py - sy) * k) / n) * f.w + Math.floor(sx + ((px - sx) * k) / n)] !== T_FLOOR) return false;
      return true;
    };
    let run = 0;
    let best = 0;
    for (const [px, py] of wayPoints(L)) {
      const sees = Math.hypot(px - m.x, py - m.y) <= NEAR && px + py <= m.x + m.y + PHONE_DOWN && clear(px, py);
      run = sees ? run + 1 : 0;
      best = Math.max(best, run);
    }
    assert.ok(best * 0.25 >= 1.5, `seed ${s}: seen along ${best * 0.25} tiles of the way`);
  }
});

test('4. nothing cut off; the way\'s middle line left open past it; no bell by it', () => {
  for (const s of SEEDS) {
    const L = laid(s);
    const f = L.floor;
    const row = L.land!.pigeons!;
    const start = Math.floor(f.start.y) * f.w + Math.floor(f.start.x);
    const got = reach(f.w, f.h, f.tiles, new Uint8Array(f.w * f.h), start, true);
    for (let i = 0; i < f.w * f.h; i++) if (f.tiles[i] === T_FLOOR) assert.ok(got[i], `seed ${s}: ${i % f.w}, ${Math.floor(i / f.w)} cut off`);
    const r = roofRidge(row.x, row.y);
    const j = Math.floor(row.y / 2.5);
    const mine = new Set(pigeonRoofTiles(row.x, row.y, j, r.from, r.to).map(([tx, ty]) => ty * f.w + tx));
    for (const [px, py] of wayPoints(L)) assert.ok(!mine.has(Math.floor(py) * f.w + Math.floor(px)), `seed ${s}: the way runs through the row at ${px.toFixed(2)}, ${py.toFixed(2)}`);
    assert.ok(bellDist(L.land!, row.x, row.y) >= 7, `seed ${s}: a bell ${bellDist(L.land!, row.x, row.y).toFixed(1)} from it`);
  }
});
