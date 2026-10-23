// EXITS, FLOORS 6 TO 10: THE WAYS ON AND WHERE EACH FLOOR BEGINS, AS THE ART CHAT PAINTED THEM (game/ways.ts ONWARD, START,
// layOnward; game.ts updateWays; the pictures art/act1_ways.ts, drawn by render/dress.ts). His yes in the art chat, 22 Oct
// 2026, shown films of each from the game and stills of where each floor begins, asked “Are floors 6 to 10's ways on, and
// where each floor begins, right as shown?”, by 17:41: “Yes, on to 11–15 (Recommended)”; and to the main chat at 17:42,
// “6-10 are done as well”.
//
// What is held here:
//   - the rules' measures are the pictures' own (each film's length, how far back the ledge's crack and each start stand,
//     the four ways round);
//   - every floor 6 to 10, on many dice: the way on laid where the rules put it, leading on from the boss's ground; its
//     pieces' tiles solid, and nothing else changed from the floor without them; the way's own tile and its way in, the
//     start's tile and the ring round it, open; the waypoint off them; the way on still reached on foot from the start;
//   - played: the boss's death plays its film (nothing takes him on, nothing said, while it plays); at its end the way is
//     open, the line said, what it threw out lying where it fell (never under him); stepping onto its way in takes him on,
//     to the next floor (from the tenth, to the camp);
//   - off (EXITS), a floor is as it was: a column of light that takes him the moment the boss falls.
//   run: tsx --test tests/onward.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { CANYON_FILM, FEN_FILM, LEDGE_CHIMNEY, LEDGE_FILM, PINE_FILM, QUARRY_FILM, START_BACK } from '../src/art/act1_ways';
import { WAY_DIRS, turnOf, wayDirOf } from '../src/art/ways_kit';
import { isCamp } from '../src/game/camp';
import { Game } from '../src/game/game';
import { makeDungeon } from '../src/game/level';
import { UNREACHABLE, flowField } from '../src/game/nav';
import { emptyControls } from '../src/game/state';
import type { Controls, Level } from '../src/game/state';
import { EXITS, ONWARD, START, onDirOf, tilesAB, turnAB } from '../src/game/ways';

const DT = 1 / 60;
function exitsSet<T>(on: boolean, run: () => T): T {
  const was = EXITS.on;
  EXITS.on = on;
  try {
    return run();
  } finally {
    EXITS.on = was;
  }
}
function until(g: Game, secs: number, done: () => boolean, c: Controls = emptyControls()): number {
  for (let k = 0; k < secs / DT; k++) {
    if (done()) return k;
    g.events.length = 0;
    g.update(DT, { ...c });
  }
  return done() ? Math.round(secs / DT) : -1;
}
const tile = (L: Level, x: number, y: number): number => Math.floor(y) * L.floor.w + Math.floor(x);
const SEEDS = [1, 2, 3, 5, 8, 13, 21, 34];

test('the rules\' measures are the pictures\' own', () => {
  assert.equal(EXITS.on, true);
  const films = [QUARRY_FILM, LEDGE_FILM, CANYON_FILM, PINE_FILM, FEN_FILM];
  films.forEach((f, i) => assert.ok(Math.abs(ONWARD[6 + i].secs - f.frames / f.fps) < 1e-9, `floor ${6 + i}: its film's length`));
  assert.equal(ONWARD[7].back, (LEDGE_CHIMNEY.long + 6) / 40, 'the ledge\'s crack, back from the drop');
  for (const k of [6, 8, 9, 10]) assert.equal(ONWARD[k].back, 0);
  const backs = [START_BACK.quarry, START_BACK.ledge, START_BACK.canyon, START_BACK.pinewood, START_BACK.fen];
  backs.forEach((b, i) => assert.equal(START[6 + i].back, b, `floor ${6 + i}: where it begins, stood back`));
  for (const [dx, dy] of [[5, 1], [-5, 2], [1, 6], [-2, -8], [3, 3], [-3, 3], [0, -1]]) assert.equal(onDirOf(dx, dy), wayDirOf(dx, dy));
  for (const d of WAY_DIRS) {
    const T = turnOf(d);
    for (const [a, b] of [[1, 0], [0, 1], [2, -3]]) {
      const [x, y] = T(a, b, 0);
      const [tx, ty] = turnAB(d, a, b);
      assert.ok(tx === x && ty === y, `${d}: (${a}, ${b})`);
    }
  }
});

test('every floor 6 to 10: the way on and the start laid; their pieces solid, nothing else changed; the ways in open; still reached on foot', () => {
  let n = 0;
  for (let depth = 6; depth <= 10; depth++) {
    for (const seed of SEEDS) {
      const what = `floor ${depth}, seed ${seed}`;
      const L = exitsSet(true, () => makeDungeon(depth, seed));
      const plain = exitsSet(false, () => makeDungeon(depth, seed));
      const W = L.ways!;
      const on = W.onward!;
      const a1 = W.a1!;
      assert.ok(a1, what);
      assert.equal(plain.ways!.a1, undefined, `${what}: off, none`);
      assert.equal(a1.floor, depth);
      assert.equal(a1.open, false, `${what}: shut`);
      const f = L.floor;
      assert.equal(a1.dir, onDirOf(on.x - f.boss.x, on.y - f.boss.y), `${what}: leading on from the boss's ground`);
      assert.equal(a1.startDir, onDirOf(f.start.x - f.boss.x, f.start.y - f.boss.y), `${what}: the start's way back`);
      const ox = Math.floor(on.x);
      const oy = Math.floor(on.y);
      const sx = Math.floor(f.start.x);
      const sy = Math.floor(f.start.y);
      const solid = new Set([...tilesAB(f, ox, oy, a1.dir, ONWARD[depth].solid), ...tilesAB(f, sx, sy, a1.startDir, START[depth].solid)]);
      const kept = new Set([...tilesAB(f, ox, oy, a1.dir, ONWARD[depth].takes), ...tilesAB(f, sx, sy, a1.startDir, [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 0], [0, 1], [1, -1], [1, 0], [1, 1]])]);
      // (the floor's own pieces are laid after, clear of these: one may stand a little elsewhere, no more nor fewer of them)
      let shut = 0;
      let freed = 0;
      for (let i = 0; i < L.walk.length; i++) {
        if (solid.has(i) && !kept.has(i)) assert.equal(L.walk[i], 0, `${what}: tile ${i % f.w}, ${Math.floor(i / f.w)} solid`);
        else if (kept.has(i)) assert.equal(L.walk[i], plain.walk[i], `${what}: tile ${i % f.w}, ${Math.floor(i / f.w)} as it was`);
        else if (L.walk[i] < plain.walk[i]) shut++;
        else if (L.walk[i] > plain.walk[i]) freed++;
      }
      assert.ok(shut === freed && shut <= 4, `${what}: ${shut} tiles shut and ${freed} freed elsewhere`);
      assert.equal(L.walk[tile(L, on.x, on.y)], 1, `${what}: the way's own tile open`);
      assert.equal(L.walk[tile(L, f.start.x, f.start.y)], 1, `${what}: the start's tile open`);
      if (W.way) for (let ty = Math.floor(W.way.y - 0.75); ty <= Math.floor(W.way.y + 0.75); ty++) for (let tx = Math.floor(W.way.x - 0.75); tx <= Math.floor(W.way.x + 0.75); tx++) assert.equal(L.walk[ty * f.w + tx], 1, `${what}: the waypoint on open ground`);
      const flow = flowField(L.walk, f.w, f.h, sx, sy);
      assert.notEqual(flow[tile(L, on.x, on.y)], UNREACHABLE, `${what}: the way on reached on foot from the start`);
      n++;
    }
  }
  assert.equal(n, 5 * SEEDS.length);
});

/** A game on floor `depth`, the boss's company gone, the hero by the way on; the boss struck down (or, where his death is in stages, the way woken as it would be). */
function bossDown(depth: number, seed: number): Game {
  const g = new Game('warrior', seed);
  g.hero.invuln = 1e9;
  g.depth = depth;
  g.cleared = depth - 1;
  g.wayDepth = depth;
  g.enterDungeon();
  const on = g.level.ways!.onward!;
  const [ux, uy] = turnAB(g.level.ways!.a1!.dir, 1, 0);
  g.hero.x = on.x - ux * 3.5;
  g.hero.y = on.y - uy * 3.5;
  for (const m of g.monsters) if (!m.boss) m.dead = true;
  const boss = g.monsters.find((m) => m.boss);
  for (let k = 0; k < 12 && boss && !on.awake; k++) {
    boss.x = g.hero.x - ux * 2;
    boss.y = g.hero.y - uy * 2;
    g.bossReady();
    (g as unknown as { damageMonster(m: unknown, n: number, k: string, c: boolean, s: number): void }).damageMonster(boss, boss.life + boss.shield + 1, 'phys', false, -1);
    until(g, 0.5, () => on.awake);
  }
  if (!on.awake) {
    on.awake = true;
    on.warpAt = g.time;
  }
  return g;
}

test('played: the boss falls, the film plays (nothing takes him, nothing said); then open, what it threw lying; its way in takes him on', () =>
  exitsSet(true, () => {
    for (let depth = 6; depth <= 10; depth++) {
      for (const seed of [4, 9]) {
        const what = `floor ${depth}, seed ${seed}`;
        const g = bossDown(depth, seed);
        const L = g.level;
        const on = L.ways!.onward!;
        const a1 = L.ways!.a1!;
        assert.equal(a1.open, false, `${what}: shut while the film plays`);
        // (he stands in its way in while it plays: it does not take him)
        g.hero.x = Math.floor(on.x) + 0.5;
        g.hero.y = Math.floor(on.y) + 0.5;
        const said: string[] = [];
        const shown = (): void => {
          for (const e of g.events) if (e.t === 'msg') said.push((e as { text: string }).text);
        };
        const secs = ONWARD[depth].secs - (g.time - (on.warpAt ?? g.time));
        for (let k = 0; k < (secs - 0.1) / DT; k++) {
          g.events.length = 0;
          g.update(DT, emptyControls());
          shown();
        }
        assert.equal(g.leaving, null, `${what}: not taken while it plays`);
        assert.equal(a1.open, false, what);
        assert.ok(!said.some((t) => /way (on|home) is open/.test(t)), `${what}: nothing said yet`);
        // (and stood away from it, it opens)
        const [ux, uy] = turnAB(a1.dir, 1, 0);
        g.hero.x = on.x - ux * 3.5;
        g.hero.y = on.y - uy * 3.5;
        assert.ok(until(g, 0.5, () => a1.open) >= 0, `${what}: open at the film's end`);
        g.events.length = 0;
        g.update(DT, emptyControls());
        const thrown = tilesAB(L.floor, Math.floor(on.x), Math.floor(on.y), a1.dir, ONWARD[depth].thrown);
        for (const i of thrown) if (i !== tile(L, g.hero.x, g.hero.y)) assert.equal(L.walk[i], 0, `${what}: what it threw out lies there`);
        const flow = flowField(L.walk, L.floor.w, L.floor.h, Math.floor(g.hero.x), Math.floor(g.hero.y));
        assert.notEqual(flow[tile(L, on.x, on.y)], UNREACHABLE, `${what}: its way in still reached`);
        g.hero.x = Math.floor(on.x) + 0.5;
        g.hero.y = Math.floor(on.y) + 0.5;
        assert.ok(until(g, 4, () => g.depth !== depth || g.level.town) > 0, `${what}: taken on`);
        if (depth < 10) assert.equal(g.depth, depth + 1, `${what}: to the next floor`);
        else assert.ok(isCamp(g.level), `${what}: to the camp`);
      }
    }
  }));

test('the line comes as it opens, not as the boss falls; what it throws out never lands on him', () =>
  exitsSet(true, () => {
    const g = bossDown(6, 4);
    const L = g.level;
    const on = L.ways!.onward!;
    const a1 = L.ways!.a1!;
    // (stood on one of the tiles the quarry's blocks are thrown onto)
    const i = tilesAB(L.floor, Math.floor(on.x), Math.floor(on.y), a1.dir, ONWARD[6].thrown).find((k) => L.walk[k] === 1)!;
    assert.ok(i !== undefined);
    g.hero.x = (i % L.floor.w) + 0.5;
    g.hero.y = Math.floor(i / L.floor.w) + 0.5;
    const said: string[] = [];
    for (let k = 0; k < (ONWARD[6].secs + 0.3) / DT; k++) {
      g.events.length = 0;
      g.update(DT, emptyControls());
      for (const e of g.events) if (e.t === 'msg') said.push((e as { text: string }).text);
    }
    assert.ok(a1.open);
    assert.ok(said.includes('The way on is open.'), said.join(' / '));
    assert.equal(L.walk[i], 1, 'not under him');
  }));

test('off, a floor is as it was: no pieces, and its column of light takes him as the boss falls', () =>
  exitsSet(false, () => {
    const g = new Game('warrior', 4);
    g.hero.invuln = 1e9;
    g.depth = 7;
    g.cleared = 6;
    g.wayDepth = 7;
    g.enterDungeon();
    assert.equal(g.level.ways!.a1, undefined);
    const on = g.level.ways!.onward!;
    on.awake = true;
    on.warpAt = g.time;
    g.hero.x = on.x;
    g.hero.y = on.y;
    assert.ok(until(g, 3, () => g.depth === 8) > 0);
  }));
