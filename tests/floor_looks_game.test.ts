// FLOORS 4 AND 5'S NEW LOOKS, WHERE THEIR OWN THINGS GO IN THE GAME (game/chapel_way.ts, game/lair_way.ts: the art chat's
// art/chapel.ts behind CHAPEL and art/lair_temple.ts behind LAIR_TEMPLE; brought in by the main chat on his word of 2 Nov 2026,
// “New looks for the first 5 floors are almost done.  We want those in the release as well”; off until his yes to them in play).
//   1. off, floors 4 and 5 as they were;
//   2. THE CHAPEL: the way in from floor 3 in a back wall of the first room, he comes in a tile and a half inside it; one or two
//      break-ins, the rock spilled before each; its tiles stay wall; candles in every room; his hall's piers; nothing cut off;
//   3. THE MINE AND THE TEMPLE: he comes in in the mine, his hall is the temple; each threshold a way of three tiles from the mine
//      into the temple with no door in it; the rails run from by where he comes in, joined tile to tile, to a tile short of the
//      way into the temple, ending on the rails' stop; the rift's cracks in the temple; the floor's own pieces each in its own
//      part; nothing cut off.
//   4. switched on, all seven switches of floors 3 to 5 together, as the game starts (game/floor_looks.ts).
//   run: tsx --test tests/floor_looks_game.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import fs from 'node:fs';
import { CHAPEL } from '../src/art/chapel';
import { FLOOR_LOOKS, FLOOR_LOOK_SWITCHES, useFloorLooks } from '../src/game/floor_looks';
import { LAIR_PART, LAIR_TEMPLE } from '../src/art/lair_temple';
import { stretchTiles } from '../src/game/chapel_way';
import { makeDungeon } from '../src/game/level';
import type { Level } from '../src/game/state';
import { T_FLOOR, T_WALL } from '../src/game/types';

const SEEDS = [1, 2, 3, 5, 8, 13, 21, 34];

function on<T>(sw: { on: boolean }, run: () => T): T {
  const was = sw.on;
  sw.on = true;
  try {
    return run();
  } finally {
    sw.on = was;
  }
}
function reach(L: Level, walk: Uint8Array): Uint8Array {
  const f = L.floor;
  const seen = new Uint8Array(f.w * f.h);
  const s = Math.floor(f.start.y) * f.w + Math.floor(f.start.x);
  const q = [s];
  seen[s] = 1;
  while (q.length) {
    const i = q.pop()!;
    for (const d of [1, -1, f.w, -f.w]) {
      const j = i + d;
      if (j >= 0 && j < seen.length && !seen[j] && walk[j]) {
        seen[j] = 1;
        q.push(j);
      }
    }
  }
  return seen;
}
/** Tiles cut off by what the look stands (walked to with them gone, not with them there). */
function cutOff(L: Level, names: RegExp): number {
  const f = L.floor;
  const w2 = L.walk.slice();
  for (const p of L.props) if (p.kind === 'piece' && p.solid && names.test(p.name ?? '')) w2[p.ty * f.w + p.tx] = f.tiles[p.ty * f.w + p.tx] === T_FLOOR ? 1 : 0;
  const a = reach(L, L.walk);
  const b = reach(L, w2);
  let n = 0;
  for (let i = 0; i < a.length; i++) if (b[i] && !a[i] && L.walk[i]) n++;
  return n;
}

test('1. off, floors 4 and 5 as they were', () => {
  assert.equal(CHAPEL.on, false);
  assert.equal(LAIR_TEMPLE.on, false);
  const L4 = makeDungeon(4, 3);
  assert.ok(!L4.chapel);
  const L5 = makeDungeon(5, 3);
  assert.ok(!L5.lair);
});

test('2. THE CHAPEL: the way in, the break-ins, the candles and his hall; nothing cut off', () =>
  on(CHAPEL, () => {
    for (const seed of SEEDS) {
      const L = makeDungeon(4, seed);
      const f = L.floor;
      const c = L.chapel!;
      assert.ok(c && c.wayIn, `seed ${seed}: the way in`);
      const w = c.wayIn!;
      const first = f.rooms[0];
      assert.equal(w.plane, w.alongX ? first.y : first.x, 'in a back wall of the first room');
      for (const i of stretchTiles(f, w)) assert.equal(f.tiles[i], T_WALL, 'its tiles stay wall');
      const mid = w.alongX ? { x: w.a + 1.5, y: w.plane } : { x: w.plane, y: w.a + 1.5 };
      const inside = w.alongX ? f.start.y - mid.y : f.start.x - mid.x;
      assert.ok(Math.abs(inside - 1.2) < 0.6 && Math.abs((w.alongX ? f.start.x : f.start.y) - (w.alongX ? mid.x : mid.y)) < 0.01, `he comes in a tile and a half inside it (${inside.toFixed(2)})`);
      assert.ok(c.breaks.length >= 1, 'a break-in');
      for (const b of c.breaks) {
        for (const i of stretchTiles(f, b)) assert.equal(f.tiles[i], T_WALL);
        assert.ok(L.props.some((p) => p.name?.startsWith('rock spilled from the break')), 'the rock before it');
      }
      assert.ok(L.props.filter((p) => p.name?.startsWith('candles on the floor')).length >= 6, 'candles');
      assert.ok(L.props.filter((p) => p.name?.startsWith('a pier of the hall')).length >= 1, "his hall's piers (one, where a corner has no room)");
      assert.equal(cutOff(L, /rock spilled|pew|pier|altar/), 0, `seed ${seed}: nothing cut off`);
    }
  }));

test('3. THE MINE AND THE TEMPLE: the parts, the thresholds, the rails, the cracks; each piece in its part; nothing cut off', () =>
  on(LAIR_TEMPLE, () => {
    let thresholds = 0;
    for (const seed of SEEDS) {
      const L = makeDungeon(5, seed);
      const f = L.floor;
      const W = f.w;
      const P = L.lair!;
      assert.ok(P, `seed ${seed}: the plan`);
      assert.equal(P.part[Math.floor(f.start.y) * W + Math.floor(f.start.x)], 1, 'he comes in in the mine');
      assert.equal(P.part[Math.floor(f.boss.y) * W + Math.floor(f.boss.x)], 2, 'his hall is the temple');
      for (const t of P.thresholds) {
        thresholds++;
        for (let k = 0; k < 3; k++) {
          const [x, y] = t.alongX ? [t.a + k, t.line] : [t.line, t.a + k];
          assert.equal(P.part[y * W + x], 1, 'its way in the mine');
          const [tx, ty] = t.alongX ? [x, y + t.temple] : [x + t.temple, y];
          assert.equal(P.part[ty * W + tx], 2, 'the temple across it');
          for (const d of L.doors) assert.ok(!(d.spot.alongX === t.alongX && Math.abs(d.spot.a - t.a) < 3 && Math.abs(d.spot.plane - t.line) < 2), 'no door in it');
        }
      }
      assert.ok(P.rails.length >= 3, `seed ${seed}: the rails`);
      for (let k = 1; k < P.rails.length; k++) {
        const a = P.rails[k - 1].i;
        const b = P.rails[k].i;
        assert.equal(Math.abs((a % W) - (b % W)) + Math.abs(Math.floor(a / W) - Math.floor(b / W)), 1, 'joined tile to tile');
        assert.equal(P.part[b], 1, 'in the mine');
      }
      assert.ok(P.rails[0].name.startsWith("rails' end") && P.rails[P.rails.length - 1].name.startsWith("rails' end"), 'an end at each end');
      const last = P.rails[P.rails.length - 1].i;
      assert.ok(L.props.some((p) => p.name?.startsWith("the rails' stop") && p.ty * W + p.tx === last), "the rails' stop on the last");
      assert.ok(P.cracks.length > 0 && P.cracks.every((c) => P.part[c.i] === 2), 'the cracks in the temple');
      for (const p of L.props) {
        const part = p.name ? LAIR_PART[p.name] : undefined;
        if (part) assert.equal(P.part[p.ty * W + p.tx], part === 'mine' ? 1 : 2, `${p.name} in its own part`);
      }
      assert.equal(cutOff(L, /lantern post|brazier|cart on the rails/), 0, `seed ${seed}: nothing cut off`);
    }
    assert.ok(thresholds >= SEEDS.length / 2, `thresholds on most floors (${thresholds})`);
  }));

test('4. switched on together as the game starts, before it boots or paints (his “Yes, switch them on (Recommended)”, 18:11)', () => {
  assert.equal(FLOOR_LOOKS.on, true);
  assert.equal(FLOOR_LOOK_SWITCHES.length, 7);
  const was = FLOOR_LOOK_SWITCHES.map((s) => s.on);
  try {
    useFloorLooks(true);
    for (const s of FLOOR_LOOK_SWITCHES) assert.equal(s.on, true);
    assert.ok(CHAPEL.on && LAIR_TEMPLE.on);
    useFloorLooks(false);
    for (const s of FLOOR_LOOK_SWITCHES) assert.equal(s.on, false);
  } finally {
    FLOOR_LOOK_SWITCHES.forEach((s, i) => (s.on = was[i]));
  }
  const src = (fs as { readFileSync(p: string, e: string): string }).readFileSync('src/main.ts', 'utf8');
  const at = src.indexOf('useFloorLooks(FLOOR_LOOKS.on);');
  assert.ok(at > 0 && at < src.indexOf('paintWorkerMain();\nelse boot();'), 'before the game or its painter starts');
});
