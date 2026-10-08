// TERRACES AND STAIRS IN A DUNGEON: what the map-maker lays (src/game/relief.ts).
//
// The owner, 7 Oct 2026: "Then work on ledges and stairs"; of the first pictures: "Stairs and
// raised areas look great.  Let's hold off pits for now."
//
// What is held here, over many dungeons:
//   - there is no pit anywhere;
//   - a terrace is raised floor in a room that is neither where the hero arrives nor the boss's,
//     clear of every doorway; each has a flight of stairs, with low floor at its foot and the
//     terrace at its head;
//   - everything that could be walked to can still be walked to, on foot, with no jump;
//   - nothing else about the dungeon has changed: its rooms, its floor, its packs, and every thing
//     that stands or lies in it are where they were with no terraces at all;
//   - the same dungeon number and seed give the same terraces;
//   - a played game on such a floor: every monster has a way to the hero's door, and the fallen
//     wordsmith of a first dungeon lies on no stair;
//   - the playtests' own player (src/dev/bot.ts) finds its way up the stairs to something that
//     waits on a terrace: so that a playtest that sets it loose in a dungeon tests the dungeon,
//     and not a player stood against a ledge.
// The rules are written out again here, not borrowed from relief.ts.
//   run: tsx --test tests/relief.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { botStep, newBot } from '../src/dev/bot';
import type { RNG } from '../src/engine/rng';
import { doorTiles } from '../src/game/doors';
import { MIX, RELIEF, generateFloor } from '../src/game/dungeon';
import { Game } from '../src/game/game';
import { STAIR_N, STAIR_W, canStep, levelAt } from '../src/game/height';
import { UNREACHABLE, flowField } from '../src/game/nav';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import { SOLID_PROPS, T_FLOOR, T_PIT } from '../src/game/types';
import type { ClassId, Floor, Room } from '../src/game/types';

const DEPTHS = [1, 2, 3, 4, 5, 6, 8, 10, 12];
const SEEDS = 14;

interface Sample {
  depth: number;
  seed: number;
  f: Floor;
}
const samples: Sample[] = [];
for (const depth of DEPTHS) for (let k = 0; k < SEEDS; k++) samples.push({ depth, seed: 9000 + depth * 131 + k * 17, f: generateFloor(depth, 9000 + depth * 131 + k * 17) });

const name = (s: Sample): string => `dungeon ${s.depth}, seed ${s.seed}`;
const at = (f: Floor, x: number, y: number): number => y * f.w + x;
const isFloor = (f: Floor, x: number, y: number): boolean => x >= 0 && y >= 0 && x < f.w && y < f.h && f.tiles[at(f, x, y)] === T_FLOOR;
const high = (f: Floor, x: number, y: number): boolean => isFloor(f, x, y) && f.height !== undefined && f.height[at(f, x, y)] === 1;
const stairOf = (f: Floor, x: number, y: number): number => (isFloor(f, x, y) && f.stair ? f.stair[at(f, x, y)] : 0);
const roomOf = (f: Floor, x: number, y: number): Room | null => f.rooms.find((r) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h) ?? null;
/** Plain floor (no stair) at the height asked. */
const plain = (f: Floor, x: number, y: number, level: number): boolean => isFloor(f, x, y) && stairOf(f, x, y) === 0 && (f.height ? f.height[at(f, x, y)] : 0) === level;

function without<T>(run: () => T): T {
  RELIEF.on = false;
  try {
    return run();
  } finally {
    RELIEF.on = true;
  }
}

test('most dungeons have a terrace, and none has a pit', () => {
  let withOne = 0;
  for (const s of samples) {
    for (let i = 0; i < s.f.tiles.length; i++) assert.notEqual(s.f.tiles[i], T_PIT, `${name(s)}: a pit`);
    if (s.f.height && s.f.height.some((v) => v === 1)) withOne++;
  }
  assert.ok(withOne >= samples.length * 0.6, `${withOne} of ${samples.length} dungeons have a terrace`);
});

test('raised floor is floor, one level up, in a room that is neither the first nor the boss\'s, and at least 8 by 8', () => {
  for (const s of samples) {
    const f = s.f;
    if (!f.height) continue;
    for (let y = 0; y < f.h; y++) {
      for (let x = 0; x < f.w; x++) {
        const v = f.height[at(f, x, y)];
        // (-1 is sunken floor: tests/sunken.test.ts)
        assert.ok(v === 0 || v === 1 || v === -1, `${name(s)}: a height of ${v}`);
        if (v !== 1) continue;
        assert.ok(isFloor(f, x, y), `${name(s)}: raised tile ${x},${y} is not floor`);
        const r = roomOf(f, x, y);
        if (!r) throw new Error(`${name(s)}: raised tile ${x},${y} is in no room`);
        assert.ok(r.kind !== 'start' && r.kind !== 'boss', `${name(s)}: a terrace in the ${r.kind} room`);
        assert.ok(r.w >= 8 && r.h >= 8, `${name(s)}: a terrace in a room of ${r.w} by ${r.h}`);
      }
    }
    assert.equal(levelAt(f, f.start.x, f.start.y), 0, `${name(s)}: the hero arrives on the low floor`);
    assert.equal(levelAt(f, f.boss.x, f.boss.y), 0, `${name(s)}: the boss waits on the low floor`);
  }
});

test('a terrace and its stairs keep two tiles clear of every doorway and corridor', () => {
  for (const s of samples) {
    const f = s.f;
    if (!f.height) continue;
    for (let y = 0; y < f.h; y++) {
      for (let x = 0; x < f.w; x++) {
        if (!high(f, x, y) && stairOf(f, x, y) === 0) continue;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            // (corridor: floor that is no room's)
            if (isFloor(f, x + dx, y + dy)) assert.ok(roomOf(f, x + dx, y + dy), `${name(s)}: ${x},${y} is within two tiles of the corridor tile ${x + dx},${y + dy}`);
          }
        }
      }
    }
  }
});

test('a flight of stairs stands on low floor, with low floor at its foot and the terrace at its head, and nothing on it or in its way', () => {
  let flights = 0;
  let wide = 0;
  for (const s of samples) {
    const f = s.f;
    if (!f.stair) continue;
    const thing = new Map<number, string>();
    for (const p of f.props) thing.set(at(f, p.x, p.y), p.kind);
    const solid = (x: number, y: number): boolean => SOLID_PROPS.includes((thing.get(at(f, x, y)) ?? '') as never);
    for (let y = 0; y < f.h; y++) {
      for (let x = 0; x < f.w; x++) {
        const k = f.stair[at(f, x, y)];
        if (k === 0) continue;
        assert.ok(k === STAIR_N || k === STAIR_W, `${name(s)}: a stair of kind ${k}`);
        // (a flight down into sunken floor stands in it: tests/sunken.test.ts)
        if (f.height && f.height[at(f, x, y)] < 0) continue;
        assert.ok(isFloor(f, x, y) && !high(f, x, y), `${name(s)}: stair ${x},${y} is not on low floor`);
        const hx = k === STAIR_N ? x : x - 1;
        const hy = k === STAIR_N ? y - 1 : y;
        const fx = k === STAIR_N ? x : x + 1;
        const fy = k === STAIR_N ? y + 1 : y;
        assert.ok(plain(f, hx, hy, 1), `${name(s)}: stair ${x},${y} has no terrace at its head`);
        assert.ok(plain(f, fx, fy, 0), `${name(s)}: stair ${x},${y} has no low floor at its foot`);
        assert.ok(!thing.has(at(f, x, y)), `${name(s)}: a ${thing.get(at(f, x, y))} on stair ${x},${y}`);
        assert.ok(!solid(hx, hy) && !solid(fx, fy), `${name(s)}: something solid at the head or foot of stair ${x},${y}`);
        flights++;
        // (beside it: another tile of the same flight?)
        const sx = k === STAIR_N ? 1 : 0;
        const sy = k === STAIR_N ? 0 : 1;
        if (stairOf(f, x + sx, y + sy) === k || stairOf(f, x - sx, y - sy) === k) wide++;
      }
    }
  }
  assert.ok(flights > 0);
  assert.ok(wide >= flights * 0.8, `${wide} of ${flights} stair tiles are in a flight two wide`);
});

test('every terrace has stairs: each raised patch touches the head of a flight', () => {
  for (const s of samples) {
    const f = s.f;
    if (!f.height || !f.stair) continue;
    const seen = new Uint8Array(f.w * f.h);
    for (let y = 0; y < f.h; y++) {
      for (let x = 0; x < f.w; x++) {
        if (!high(f, x, y) || seen[at(f, x, y)] === 1) continue;
        // (one raised patch)
        let hasStairs = false;
        const queue = [[x, y]];
        seen[at(f, x, y)] = 1;
        for (let head = 0; head < queue.length; head++) {
          const [cx, cy] = queue[head];
          if (stairOf(f, cx, cy + 1) === STAIR_N || stairOf(f, cx + 1, cy) === STAIR_W) hasStairs = true;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (!high(f, nx, ny) || seen[at(f, nx, ny)] === 1) continue;
            seen[at(f, nx, ny)] = 1;
            queue.push([nx, ny]);
          }
        }
        assert.ok(hasStairs, `${name(s)}: the terrace at ${x},${y} has no stairs`);
        assert.ok(queue.length >= 6, `${name(s)}: a terrace of ${queue.length} tiles`);
      }
    }
  }
});

test('everything that could be walked to can still be walked to, on foot: no way needs a jump', () => {
  for (const s of samples) {
    const f = s.f;
    const n = f.w * f.h;
    const walk = new Uint8Array(n);
    // (the tiles a body is steered over, as nav.ts has them: whole tiles of floor with nothing solid
    // on them. A tile cut corner to corner is not one: half of it is wall, and nobody is steered
    // over the half tile of floor that is left; one of those shut in behind a chest or an urn at
    // the edge of a terrace is no way to anywhere.)
    for (let i = 0; i < n; i++) walk[i] = f.tiles[i] === T_FLOOR && !(f.cut && f.cut[i] !== 0) ? 1 : 0;
    for (const p of f.props) if (SOLID_PROPS.includes(p.kind)) walk[at(f, p.x, p.y)] = 0;
    const flood = (heights: boolean): Uint8Array => {
      const seen = new Uint8Array(n);
      const queue = [at(f, Math.floor(f.start.x), Math.floor(f.start.y))];
      seen[queue[0]] = 1;
      for (let head = 0; head < queue.length; head++) {
        const i = queue[head];
        const x = i % f.w;
        const y = (i - x) / f.w;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= f.w || ny >= f.h) continue;
          const j = at(f, nx, ny);
          if (seen[j] === 1 || walk[j] !== 1) continue;
          if (heights && !canStep(f, x, y, nx, ny)) continue;
          seen[j] = 1;
          queue.push(j);
        }
      }
      return seen;
    };
    const flat = flood(false);
    const real = flood(true);
    for (let i = 0; i < n; i++) assert.equal(real[i], flat[i], `${name(s)}: tile ${i % f.w},${Math.floor(i / f.w)} can no longer be walked to`);
  }
});

test('nothing else about the dungeon is changed: with no terraces it is the same floor, rooms, packs and things', () => {
  let checked = 0;
  for (const s of samples.filter((_, i) => i % 3 === 0)) {
    const flat = without(() => generateFloor(s.depth, s.seed));
    assert.equal(flat.height, undefined);
    assert.equal(flat.stair, undefined);
    assert.deepEqual(s.f.tiles, flat.tiles, `${name(s)}: the floor`);
    assert.deepEqual(s.f.variant, flat.variant, `${name(s)}: the look of the tiles`);
    assert.deepEqual(s.f.rooms, flat.rooms, `${name(s)}: the rooms`);
    assert.deepEqual(s.f.packs, flat.packs, `${name(s)}: the packs`);
    assert.deepEqual(s.f.props, flat.props, `${name(s)}: the things`);
    assert.deepEqual(s.f.start, flat.start);
    assert.deepEqual(s.f.boss, flat.boss);
    checked++;
  }
  assert.ok(checked >= 20);
});

test('the same dungeon number and seed give the same terraces', () => {
  for (const s of samples.filter((_, i) => i % 5 === 0)) {
    const again = generateFloor(s.depth, s.seed);
    assert.deepEqual(again.height, s.f.height, name(s));
    assert.deepEqual(again.stair, s.f.stair, name(s));
  }
});

test('a played dungeon with terraces: every monster has a way on foot to where the hero arrives, and the game knows the ledges', () => {
  let played = 0;
  const classes: ClassId[] = ['warrior', 'ranger', 'mage'];
  for (let k = 0; k < 24; k++) {
    const g = new Game(classes[k % 3], 500 + k * 37);
    g.depth = 1 + (k % 8);
    g.enterDungeon();
    const L = g.level;
    const f = L.floor;
    const what = `game seed ${500 + k * 37}, dungeon ${g.depth}`;
    assert.equal(L.step !== null, f.height !== undefined, `${what}: the game has a grid of steps where the floor has heights`);
    if (!L.step) continue;
    // (THE MIX, game/dungeon.ts: a lever's gate that is down is a way on foot once its lever is pulled)
    const walk = L.walk.slice();
    for (const d of L.doors) if (d.spot.kind === 'gate') for (const i of doorTiles(f, d.spot)) walk[i] = 1;
    const dist = flowField(walk, f.w, f.h, f.start.x, f.start.y, Infinity, undefined, L.step);
    for (const m of g.monsters) {
      const i = Math.floor(m.y) * f.w + Math.floor(m.x);
      assert.equal(L.walk[i], 1, `${what}: a ${m.kind} stands where nobody can`);
      assert.notEqual(dist[i], UNREACHABLE, `${what}: a ${m.kind} at ${m.x},${m.y} has no way to the hero's door`);
    }
    played++;
  }
  assert.ok(played >= 12, `${played} dungeons with terraces played`);
});

test('the fallen wordsmith of a first dungeon lies on no stair and on the room\'s own floor, and can be walked to', () => {
  let seen = 0;
  let onHigh = 0;
  for (let seed = 1; seed <= 60; seed++) {
    const g = Game.forFirstRun('warrior', seed * 7919);
    const b = g.level.body;
    if (!b) continue;
    const f = g.level.floor;
    assert.equal(f.stair ? f.stair[b.ty * f.w + b.tx] : 0, 0, `seed ${seed * 7919}: the body lies on a stair`);
    const dist = flowField(g.level.walk, f.w, f.h, f.start.x, f.start.y, Infinity, undefined, g.level.step);
    assert.notEqual(dist[b.ty * f.w + b.tx], UNREACHABLE, `seed ${seed * 7919}: no way to the body`);
    if (levelAt(f, b.x, b.y) !== 0) onHigh++;
    seen++;
  }
  assert.ok(seen >= 30, `${seen} first dungeons with a body`);
  assert.equal(onHigh, 0, 'the body lies on the room\'s own floor');
});

// ---------------------------------------------------------------------------------------------
// The playtests' own player

type Inner = {
  rng: RNG;
  waveT: number;
  spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster;
};
const inner = (g: Game): Inner => g as unknown as Inner;

/**
 * Set the bot to walk to one sleeping monster, which is kept asleep, for up to `seconds`.
 * Returns how long it took to stand beside it (or -1), and whether it stood on raised floor then.
 */
function botWalksTo(g: Game, m: Monster, seconds: number): { took: number; level: number; dist: number } {
  const c = emptyControls();
  const bot = newBot(false, false);
  const dt = 1 / 30;
  const h = g.hero;
  let dist = Math.hypot(m.x - h.x, m.y - h.y);
  for (let t = 0; t < seconds; t += dt) {
    m.state = 'sleep';
    h.life = h.d.maxLife;
    botStep(g, c, bot, dt);
    g.update(dt, c);
    g.events.length = 0;
    dist = Math.hypot(m.x - h.x, m.y - h.y);
    if (dist < 1.6) return { took: t, level: levelAt(g.level.floor, h.x, h.y), dist };
  }
  return { took: -1, level: levelAt(g.level.floor, h.x, h.y), dist };
}

test("the playtests' own player goes round by the stairs to what waits on a terrace: in the hall built for ledges", () => {
  const g = Game.forPractice('warrior', 5, 'ledges');
  inner(g).waveT = 1e9;
  g.monsters.length = 0;
  // (under the terrace's long edge, well to one side of its stairs; the skeleton straight above, on the terrace)
  g.hero.x = 13.5;
  g.hero.y = 13.5;
  const m = inner(g).spawn('skeleton', 13.5, 8.5, 900, 0, false, inner(g).rng);
  assert.equal(levelAt(g.level.floor, m.x, m.y), 1);
  assert.equal(levelAt(g.level.floor, g.hero.x, g.hero.y), 0);
  const r = botWalksTo(g, m, 12);
  assert.ok(r.took >= 0, `it stood beside the skeleton (it was ${r.dist.toFixed(1)} tiles off at the end)`);
  assert.equal(r.level, 1, 'on the terrace');
  assert.ok(r.took > 1.2, `and had gone round to get there (${r.took.toFixed(1)} s: five tiles straight up would take about one)`);
});

test("and in real dungeons: from the low floor of a room to a skeleton on its terrace", () => {
  let done = 0;
  for (let k = 0; k < 40 && done < 6; k++) {
    const g = new Game((['warrior', 'ranger', 'mage'] as ClassId[])[k % 3], 800 + k * 53);
    g.depth = 1 + (k % 6);
    // (the dungeons these rooms were found in, laid without THE MIX: game/dungeon.ts)
    const mixWas = MIX.on;
    MIX.on = false;
    g.enterDungeon();
    MIX.on = mixWas;
    const L = g.level;
    const f = L.floor;
    if (!f.height || !f.stair) continue;
    // a room with raised floor: the raised tile furthest from the stairs, and the low tile furthest from it
    const room = f.rooms.find((r) => {
      for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) if (f.height && f.height[y * f.w + x] === 1) return true;
      return false;
    });
    if (!room) continue;
    const dist = (ax: number, ay: number, bx: number, by: number): number => Math.hypot(ax - bx, ay - by);
    const stairs: [number, number][] = [];
    const highs: [number, number][] = [];
    const lows: [number, number][] = [];
    for (let y = room.y; y < room.y + room.h; y++) {
      for (let x = room.x; x < room.x + room.w; x++) {
        const i = y * f.w + x;
        if (L.walk[i] !== 1) continue;
        if (f.stair[i] !== 0) stairs.push([x, y]);
        else if (f.height[i] === 1) highs.push([x, y]);
        else lows.push([x, y]);
      }
    }
    const far = (list: [number, number][], from: [number, number][]): [number, number] =>
      list.reduce((best, p) => (Math.min(...from.map((q) => dist(p[0], p[1], q[0], q[1]))) > Math.min(...from.map((q) => dist(best[0], best[1], q[0], q[1]))) ? p : best), list[0]);
    const top = far(highs, stairs);
    const low = far(lows, [top]);
    g.monsters.length = 0;
    const m = inner(g).spawn('skeleton', top[0] + 0.5, top[1] + 0.5, 900, 0, false, inner(g).rng);
    g.hero.x = low[0] + 0.5;
    g.hero.y = low[1] + 0.5;
    const what = `game seed ${800 + k * 53}, dungeon ${g.depth}, room ${room.id} (${room.w} by ${room.h}): from ${low} to ${top}`;
    const r = botWalksTo(g, m, 25);
    assert.ok(r.took >= 0, `${what}: it stood beside the skeleton (it was ${r.dist.toFixed(1)} tiles off at the end)`);
    assert.equal(r.level, 1, `${what}: on the terrace`);
    done++;
  }
  assert.ok(done >= 6, `${done} rooms walked`);
});
