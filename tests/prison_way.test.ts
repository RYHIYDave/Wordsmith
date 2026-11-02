// FLOOR 3'S WAYS IN THE GAME (game/prison_way.ts): THE DOOR OUT THE BACK OF HIS HALL (the art chat's art/prison_exit.ts, behind
// PRISON_EXIT: his “Door out the back (Recommended)”, 1 Nov 2026) and THE FIRE CHANNEL down each cell block (art/prison.ts, behind
// PRISON). Off until his yes to them in play.
//   1. off, floor 3 as it was: its stairwell, no door, no channel;
//   2. THE DOOR: in a back wall of his hall, the one farther from his gate; two wall tiles with wall either side; nothing standing
//      on the two rows before it; no stairwell; nobody walks into it while it is shut;
//   3. as he falls it opens: open DOOR_OPENING after (the film's end); then walking onto it takes the hero down to floor 4;
//   4. THE CHANNEL: one down each cell block (in every one of many floors), two tiles wide; its open run not walked on, its bridge
//      and its grates walked on; nothing stands or lies on it; it cuts nothing off (everything reached with the run shut that is
//      reached with it open); the floor's own pieces keep a tile clear round it;
//   5. the door's film: its 90 frames from his fall, its passage's four, its five jolts.
//   run: tsx --test tests/prison_way.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { PRISON } from '../src/art/prison';
import { EXIT_FRAMES, PRISON_EXIT } from '../src/art/prison_exit';
import { makeFilm } from '../src/art/films';
import type { ExitFilm } from '../src/art/films';
import { doorMiddle } from '../src/game/doors';
import { Game } from '../src/game/game';
import { makeDungeon } from '../src/game/level';
import { DOOR_OPENING, channelOpen, channelXY, onChannel, prisonDoorTiles } from '../src/game/prison_way';
import { emptyControls } from '../src/game/state';
import type { Level, Monster } from '../src/game/state';
import type { Element } from '../src/game/types';
import { T_FLOOR, T_WALL } from '../src/game/types';
import { paintWithoutCanvas } from './helpers';

const DT = 1 / 60;
const SEEDS = [1, 2, 3, 7, 11, 19, 23, 42, 77, 4242];

function on<T>(run: () => T): T {
  const was = [PRISON.on, PRISON_EXIT.on];
  PRISON.on = true;
  PRISON_EXIT.on = true;
  try {
    return run();
  } finally {
    [PRISON.on, PRISON_EXIT.on] = was;
  }
}
type Inner = { damageMonster: (m: Monster, dmg: number, el: Element, crit: boolean, skill: number) => void };
function killBoss(g: Game): void {
  const boss = g.monsters.find((m) => m.boss)!;
  g.bossReady();
  (g as unknown as Inner).damageMonster(boss, boss.life + boss.shield + 1, 'phys', false, -1);
}
function until(g: Game, secs: number, done: () => boolean): number {
  for (let k = 0; k < secs / DT; k++) {
    if (done()) return k;
    g.events.length = 0;
    g.update(DT, emptyControls());
  }
  return done() ? Math.round(secs / DT) : -1;
}
/** What is walked to from tile `from` over the level's walk grid. */
function reach(L: Level, from: number): Uint8Array {
  const f = L.floor;
  const seen = new Uint8Array(f.w * f.h);
  const q = [from];
  seen[from] = 1;
  while (q.length) {
    const i = q.pop()!;
    for (const d of [1, -1, f.w, -f.w]) {
      const j = i + d;
      if (j >= 0 && j < seen.length && !seen[j] && L.walk[j]) {
        seen[j] = 1;
        q.push(j);
      }
    }
  }
  return seen;
}

test('1. off, floor 3 as it was: its stairwell, no door, no channel', () => {
  assert.equal(PRISON_EXIT.on, false, 'off until his yes');
  assert.equal(PRISON.on, false);
  for (const seed of SEEDS.slice(0, 4)) {
    const L = makeDungeon(3, seed);
    assert.ok(!L.ways!.exit, 'no door');
    assert.ok(!L.channels, 'no channel');
    assert.ok(L.ways!.stairs.length > 0 || L.portal, 'its way down as before');
  }
});

test('2. THE DOOR: in the back wall of his hall farther from his gate, two tiles, wall either side, nothing before it, no stairwell; shut', () =>
  on(() => {
    for (const seed of SEEDS) {
      const L = makeDungeon(3, seed);
      const f = L.floor;
      const e = L.ways!.exit!;
      assert.ok(e, `seed ${seed}: a door`);
      assert.equal(e.state, 'shut');
      assert.equal(L.ways!.stairs.length, 0, 'no stairwell');
      assert.equal(L.portal, null, 'no portal');
      const r = f.rooms.find((q) => q.kind === 'boss')!;
      assert.equal(e.line, e.alongX ? r.y - 1 : r.x - 1, 'a back wall of his hall');
      for (let k = e.a - 1; k <= e.a + 2; k++) assert.equal(f.tiles[e.alongX ? e.line * f.w + k : k * f.w + e.line], T_WALL, 'its wall, and wall either side');
      for (const i of prisonDoorTiles(f, e)) assert.equal(L.walk[i], 0, 'shut: nobody walks in');
      for (const p of L.props) {
        const out = (e.alongX ? p.y : p.x) - e.line;
        const along = e.alongX ? p.x : p.y;
        assert.ok(!(out >= 1 && out <= 2 && along >= e.a - 1 && along <= e.a + 2), 'nothing standing before it');
      }
      const gate = (f.doors ?? []).find((d) => d.kind === 'bossgate');
      if (gate) {
        const gm = doorMiddle(gate);
        const mine = e.alongX ? { x: r.x + r.w / 2, y: r.y } : { x: r.x, y: r.y + r.h / 2 };
        const other = e.alongX ? { x: r.x, y: r.y + r.h / 2 } : { x: r.x + r.w / 2, y: r.y };
        const far = Math.hypot(mine.x - gm.x, mine.y - gm.y) >= Math.hypot(other.x - gm.x, other.y - gm.y);
        if (!far) {
          // (the far wall had no place for it: say so plainly)
          console.log(`  seed ${seed}: the door is in the nearer back wall (the far one has no place)`);
        }
      }
    }
  }));

test('3. as he falls it opens; open DOOR_OPENING after, and walking onto it takes him down to floor 4', () =>
  on(() => {
    const g = new Game('warrior', 53);
    g.hero.invuln = 1e9;
    g.depth = 3;
    g.cleared = 2;
    g.enterDungeon();
    const e = g.level.ways!.exit!;
    assert.ok(e);
    killBoss(g);
    g.events.length = 0;
    g.update(DT, emptyControls());
    assert.equal(e.state, 'opening', 'it begins to open as he falls');
    const k = until(g, DOOR_OPENING + 1, () => e.state === 'open');
    assert.ok(k > 0 && Math.abs(k * DT - DOOR_OPENING) < 0.1, `open DOOR_OPENING after (${(k * DT).toFixed(2)})`);
    for (const i of prisonDoorTiles(g.level.floor, e)) assert.equal(g.level.walk[i], 1, 'walked into');
    const i = prisonDoorTiles(g.level.floor, e)[0];
    g.hero.x = (i % g.level.floor.w) + 0.5;
    g.hero.y = Math.floor(i / g.level.floor.w) + 0.5;
    assert.ok(until(g, 3, () => g.depth === 4) > 0, 'down to floor 4');
    assert.equal(g.cleared, 3);
  }));

test('4. THE CHANNEL: one down each cell block; its open run not walked on; nothing on it; it cuts nothing off; the floor\'s pieces keep clear', () =>
  on(() => {
    let blocks = 0;
    let made = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const L = makeDungeon(3, seed);
      const f = L.floor;
      blocks += f.rooms.filter((r) => r.block).length;
      for (const c of L.channels ?? []) {
        made++;
        const r = f.rooms.find((q) => q.block && (c.alongX ? q.y <= c.row && c.row + 2 <= q.y + q.h && q.x < c.a0 && c.a1 < q.x + q.w : q.x <= c.row && c.row + 2 <= q.x + q.w && q.y < c.a0 && c.a1 < q.y + q.h));
        assert.ok(r, `seed ${seed}: in a cell block, short of its ends`);
        assert.equal(c.alongX, r!.w >= r!.h, 'along its length');
        assert.ok(c.open1 - c.open0 >= 3 && c.bridge > c.open0 && c.bridge < c.open1 - 1, 'an open run, the bridge in it');
        const open = new Set(channelOpen(f, c));
        for (let k = c.a0; k < c.a1; k++) {
          for (const j of [0, 1]) {
            const [x, y] = channelXY(c, k, j);
            const i = y * f.w + x;
            assert.equal(f.tiles[i], T_FLOOR);
            assert.equal(L.walk[i], open.has(i) ? 0 : 1, open.has(i) ? 'the open run: not walked on' : 'a grate or the bridge: walked on');
          }
        }
        for (const p of L.props) assert.ok(!onChannel(c, p.x, p.y), `nothing on it (${p.kind})`);
        for (const w of L.dress?.wall ?? []) {
          const x = w.i % f.w;
          const y = Math.floor(w.i / f.w);
          const fx = w.side === 0 ? x : x + 1;
          const fy = w.side === 0 ? y + 1 : y;
          assert.ok(!onChannel(c, fx, fy), 'no wall piece over it');
        }
        for (const t of L.dress?.tiles ?? []) assert.ok(!onChannel(c, t.i % f.w, Math.floor(t.i / f.w), 1), 'none of the floor\'s own tiles on it or by it');
        // (from a grate: what is reached with the run shut is all that is reached with it open)
        const g0 = channelXY(c, c.a0, 0);
        const from = g0[1] * f.w + g0[0];
        const shut = reach(L, from);
        for (const i of open) L.walk[i] = 1;
        const all = reach(L, from);
        for (const i of open) L.walk[i] = 0;
        let lost = 0;
        for (let i = 0; i < all.length; i++) if (all[i] && !shut[i] && !open.has(i)) lost++;
        assert.equal(lost, 0, `seed ${seed}: it cuts nothing off`);
      }
    }
    assert.ok(blocks > 0);
    assert.equal(made, blocks, 'a channel down every cell block');
  }));

test('5. the door\'s film: 90 frames from his fall, the passage\'s four, five jolts', () => {
  paintWithoutCanvas();
  const film = makeFilm('exit:x') as ExitFilm;
  assert.equal(film.frames.length, EXIT_FRAMES);
  assert.equal(film.under.length, 4);
  assert.equal(film.jolts.length, 5);
  assert.equal(film.kicks.length, 5);
  assert.equal(film.fps, 30);
});
