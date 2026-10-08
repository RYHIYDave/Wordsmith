// SUNKEN FLOOR: stairs that go down.
//
// The owner, 7 Oct 2026, 08:01, of the terraces he had been shown: "Stairs should go down as well".
// Read as: there are places one goes DOWN to as well as up to: a part of a room one level LOWER
// than the rest, with a flight of stairs down into it. A flight is seen from its foot, so one that
// goes down comes toward the eye: it stands IN the sunken floor, at one of its two far edges.
//
// What is held here:
//   - the hall built for it (level.ts, makeStepHall) has floor one level up, floor one level down
//     and the hall's own floor between, and the ground rises evenly along every flight;
//   - the rules of height are the same rules one level down: walking never crosses the rim, a
//     flight is the way down and the way up, the swipe moves cross the rim both ways, a monster
//     comes round by the stairs, an arrow crosses;
//   - what the map-maker lays (relief.ts, laySunken), with its switch on: sunken floor out in a
//     room, two tiles at the least from every wall and clear of every doorway, in rooms that have
//     no terrace, each with stairs; everything can still be walked to; the terraces of a dungeon
//     are the ones it had; nothing else about the dungeon is changed;
//   - THE SWITCH IS ON IN THE GAME SINCE VERSION 18.1 (he saw the picture and said, 09:38: "Yes
//     sounds good"); with it off no dungeon has any.
//   run: tsx --test tests/sunken.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { botStep, newBot } from '../src/dev/bot';
import type { RNG } from '../src/engine/rng';
import { TUNE } from '../src/game/defs';
import { RELIEF, generateFloor } from '../src/game/dungeon';
import { Game } from '../src/game/game';
import { STAIR_HELP, STAIR_N, STAIR_W, STEP_E, STEP_N, STEP_S, STEP_W, canStep, levelAt, stepGrid } from '../src/game/height';
import { STEP_HALL, makeStepHall } from '../src/game/level';
import { UNREACHABLE, flowField } from '../src/game/nav';
import { emptyControls } from '../src/game/state';
import type { Controls, Monster } from '../src/game/state';
import { SOLID_PROPS, T_FLOOR, T_PIT, T_WALL } from '../src/game/types';
import type { ClassId, Floor, Room } from '../src/game/types';

const DT = 1 / 60;
const R = TUNE.heroRadius;
const H = STEP_HALL;
const S = H.sunken;

type Inner = {
  rng: RNG;
  waveT: number;
  spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster;
  wakeUp: (m: Monster) => void;
};
const inner = (g: Game): Inner => g as unknown as Inner;

function hall(cls: ClassId, x: number, y: number): Game {
  const g = Game.forPractice(cls, 5, 'steps');
  inner(g).waveT = 1e9;
  g.hero.x = x;
  g.hero.y = y;
  return g;
}
function step(g: Game, c: Controls, seconds: number): void {
  for (let t = 0; t < seconds; t += DT) g.update(DT, c);
}
function walk(g: Game, mx: number, my: number, seconds: number): void {
  const c = emptyControls();
  c.mx = mx;
  c.my = my;
  step(g, c, seconds);
}
function swipe(g: Game, tx: number, ty: number): void {
  const c = emptyControls();
  c.evade = true;
  c.evadeX = tx;
  c.evadeY = ty;
  g.update(DT, c);
  step(g, emptyControls(), 0.8);
}

// ---------------------------------------------------------------------------------------------
// The hall

test('the hall has what it says: floor one level up, floor one level down, and the hall\'s own floor between', () => {
  const f = makeStepHall(1).floor;
  assert.equal(levelAt(f, H.terrace.x0 + 0.5, H.terrace.y0 + 0.5), 1);
  assert.equal(levelAt(f, S.x0 + 2.5, S.y0 + 2.5), -1);
  assert.equal(levelAt(f, S.x1 + 0.5, S.y1 + 0.5), -1);
  assert.equal(levelAt(f, S.x1 + 1.5, S.y1 + 1.5), 0, 'the floor round it');
  assert.equal(levelAt(f, S.x0 - 0.5, S.y0 - 0.5), 0);
  assert.equal(levelAt(f, f.start.x, f.start.y), 0, 'the hero arrives on the hall\'s own floor');
  for (let i = 0; i < f.tiles.length; i++) assert.notEqual(f.tiles[i], T_PIT, 'no pit');
  // the sunken floor touches no wall: two tiles of floor at the least all round it
  for (let y = S.y0 - 2; y <= S.y1 + 2; y++) for (let x = S.x0 - 2; x <= S.x1 + 2; x++) assert.equal(f.tiles[y * f.w + x], T_FLOOR, `${x},${y}`);
  assert.ok(stepGrid(f) !== null);
});

test('the ground rises evenly up a flight out of the sunken floor: from one level down at its foot to the hall\'s floor at its head', () => {
  const f = makeStepHall(1).floor;
  const n = H.downN[0];
  assert.equal(f.stair ? f.stair[n.y * f.w + n.x] : 0, STAIR_N);
  assert.equal(f.height ? f.height[n.y * f.w + n.x] : 0, -1, 'the flight stands in the sunken floor');
  assert.ok(Math.abs(levelAt(f, n.x + 0.5, n.y + 0.5) + 0.5) < 1e-9, 'half way down, half a level down');
  assert.ok(Math.abs(levelAt(f, n.x + 0.5, n.y + 0.999) + 0.999) < 1e-9, 'at its foot');
  assert.ok(Math.abs(levelAt(f, n.x + 0.5, n.y + 0.001) + 0.001) < 1e-9, 'at its head');
  assert.equal(levelAt(f, n.x + 0.5, n.y - 0.5), 0, 'behind its head, the hall\'s floor');
  assert.equal(levelAt(f, n.x + 0.5, n.y + 1.5), -1, 'in front of its foot, the sunken floor');
  const w = H.downW[0];
  assert.equal(f.stair ? f.stair[w.y * f.w + w.x] : 0, STAIR_W);
  assert.ok(Math.abs(levelAt(f, w.x + 0.25, w.y + 0.5) + 0.25) < 1e-9);
  assert.equal(levelAt(f, w.x - 0.5, w.y + 0.5), 0);
  assert.equal(levelAt(f, w.x + 1.5, w.y + 0.5), -1);
});

test('the rules of steps are the same one level down: the rim is a ledge, a flight is entered by its two ends', () => {
  const f = makeStepHall(1).floor;
  const g = stepGrid(f);
  assert.ok(g);
  if (!g) return;
  const at = (x: number, y: number): number => g[y * f.w + x];
  // the far rim, away from the stairs: no step down into the sunken floor, and none up out of it
  const x = S.x1 - 1;
  assert.equal(at(x, S.y0 - 1) & STEP_S, 0);
  assert.equal(at(x, S.y0) & STEP_N, 0);
  assert.ok(!canStep(f, x, S.y0 - 1, x, S.y0));
  // the near rim, and the two sides
  assert.equal(at(x, S.y1) & STEP_S, 0);
  assert.equal(at(S.x1, S.y0 + 3) & STEP_E, 0);
  assert.equal(at(S.x0, S.y0 + 1) & STEP_W, 0);
  // within the sunken floor, and on the hall's floor: free
  assert.ok((at(x, S.y0 + 2) & (STEP_N | STEP_S | STEP_E | STEP_W)) === (STEP_N | STEP_S | STEP_E | STEP_W));
  // a flight: from the hall's floor behind its head, down it, to the sunken floor at its foot; never from its side
  const n = H.downN[0];
  assert.ok((at(n.x, n.y - 1) & STEP_S) !== 0, 'onto its head');
  assert.ok((at(n.x, n.y) & STEP_S) !== 0, 'off its foot');
  assert.ok((at(n.x, n.y + 1) & STEP_N) !== 0, 'and up it again');
  assert.equal(at(n.x, n.y) & STEP_W, 0, 'not out of its side');
  assert.equal(at(n.x - 1, n.y) & STEP_E, 0, 'nor into it');
  const w = H.downW[0];
  assert.ok((at(w.x - 1, w.y) & STEP_E) !== 0);
  assert.ok((at(w.x, w.y) & STEP_E) !== 0);
  assert.equal(at(w.x, w.y) & STEP_N, 0);
});

test('walking never crosses the rim: not down into the sunken floor, not up out of it', () => {
  const f = makeStepHall(1).floor;
  const x = S.x1 - 0.5;
  let g = hall('warrior', x, S.y0 - 2.5);
  walk(g, 0, 1, 2);
  assert.ok(g.hero.y <= S.y0 - R + 1e-6, `stopped at the far rim (y ${g.hero.y.toFixed(2)})`);
  assert.equal(levelAt(f, g.hero.x, g.hero.y), 0);
  g = hall('warrior', x, S.y0 + 2.5);
  walk(g, 0, -1, 2);
  assert.ok(g.hero.y >= S.y0 + R - 1e-6, `stopped under the far rim (y ${g.hero.y.toFixed(2)})`);
  assert.equal(levelAt(f, g.hero.x, g.hero.y), -1);
  // (a column with nothing standing in it)
  g = hall('warrior', S.x0 + 4.5, S.y1 - 1.5);
  walk(g, 0, 1, 2);
  assert.ok(g.hero.y <= S.y1 + 1 - R + 1e-6 && g.hero.y > S.y1 + 0.5, `stopped under the near rim (y ${g.hero.y.toFixed(2)})`);
  assert.equal(levelAt(f, g.hero.x, g.hero.y), -1);
  g = hall('warrior', S.x1 + 2.5, S.y0 + 3.5);
  walk(g, -1, 0, 2);
  assert.ok(g.hero.x >= S.x1 + 1 + R - 1e-6, `stopped at the side (x ${g.hero.x.toFixed(2)})`);
});

test('a flight of stairs is the way down and the way up again', () => {
  const f = makeStepHall(1).floor;
  const a = H.downN[0];
  const b = H.downN[1];
  assert.equal(b.x, a.x + 1);
  let g = hall('warrior', b.x, a.y - 2.5);
  walk(g, 0, 1, 2.5);
  assert.equal(levelAt(f, g.hero.x, g.hero.y), -1, `walked down (at ${g.hero.x.toFixed(2)}, ${g.hero.y.toFixed(2)})`);
  assert.ok(g.hero.y > a.y + 1);
  walk(g, 0, -1, 2.5);
  assert.equal(levelAt(f, g.hero.x, g.hero.y), 0, `and up again (at ${g.hero.x.toFixed(2)}, ${g.hero.y.toFixed(2)})`);
  assert.ok(g.hero.y < a.y);
  // the other flight, down toward +x
  const w = H.downW[0];
  g = hall('warrior', w.x - 2.5, w.y + 1);
  walk(g, 1, 0, 2.5);
  assert.equal(levelAt(f, g.hero.x, g.hero.y), -1);
  // a little out of line with its head: moved into line
  g = hall('warrior', b.x + 1 - R + STAIR_HELP - 0.03, a.y - 2.5);
  walk(g, 0, 1, 3);
  assert.equal(levelAt(f, g.hero.x, g.hero.y), -1, `from out of line: down (at ${g.hero.x.toFixed(2)}, ${g.hero.y.toFixed(2)})`);
});

test('each hero\'s swipe goes down into the sunken floor and up out of it', () => {
  const f = makeStepHall(1).floor;
  for (const cls of ['warrior', 'ranger', 'mage'] as ClassId[]) {
    const x = S.x1 - 0.5;
    const g = hall(cls, x, S.y0 - 0.8);
    swipe(g, x, S.y0 + 2.2);
    assert.equal(levelAt(f, g.hero.x, g.hero.y), -1, `${cls}: down (at ${g.hero.x.toFixed(2)}, ${g.hero.y.toFixed(2)})`);
    g.hero.x = x;
    g.hero.y = S.y0 + 0.8;
    for (const k of g.hero.skills) {
      k.cd = 0;
      k.charges = k.maxCharges;
    }
    g.hero.mana = g.hero.d.maxMana;
    swipe(g, x, S.y0 - 2.2);
    assert.equal(levelAt(f, g.hero.x, g.hero.y), 0, `${cls}: up (at ${g.hero.x.toFixed(2)}, ${g.hero.y.toFixed(2)})`);
  }
});

test('a skeleton in the sunken floor comes up by the stairs to a hero on the hall\'s floor', () => {
  const g = hall('warrior', S.x1 + 2.5, S.y0 + 3.5);
  g.monsters.length = 0;
  const m = inner(g).spawn('skeleton', S.x1 - 0.5, S.y0 + 3.5, 900, 0, false, inner(g).rng);
  inner(g).wakeUp(m);
  const f = g.level.floor;
  let crossed = false;
  let last = Math.floor(m.y) * f.w + Math.floor(m.x);
  const c = emptyControls();
  let reached = -1;
  for (let t = 0; t < 16 && reached < 0; t += DT) {
    g.hero.life = g.hero.d.maxLife;
    g.update(DT, c);
    const now = Math.floor(m.y) * f.w + Math.floor(m.x);
    if (now !== last) {
      const dx = (now % f.w) - (last % f.w);
      const dy = Math.floor(now / f.w) - Math.floor(last / f.w);
      if (Math.abs(dx) + Math.abs(dy) === 1 && !canStep(f, last % f.w, Math.floor(last / f.w), now % f.w, Math.floor(now / f.w))) crossed = true;
      last = now;
    }
    if (levelAt(f, m.x, m.y) === 0 && Math.hypot(m.x - g.hero.x, m.y - g.hero.y) < 2) reached = t;
  }
  assert.ok(!crossed, 'it never stepped over the rim');
  assert.ok(reached > 2, `it reached the hero, and had gone round to get there (${reached.toFixed(1)} s)`);
});

test('the way a monster is shown out of the sunken floor goes by the stairs', () => {
  const L = makeStepHall(1);
  const f = L.floor;
  const tx = S.x1 + 2;
  const ty = S.y0 + 3;
  const dist = flowField(L.walk, f.w, f.h, tx, ty, Infinity, undefined, L.step);
  const flat = flowField(L.walk, f.w, f.h, tx, ty);
  const i = (S.y0 + 3) * f.w + S.x1;
  assert.notEqual(dist[i], UNREACHABLE);
  assert.ok(dist[i] > flat[i] + 60, `round by the stairs is a longer way than straight over the rim (${dist[i]} against ${flat[i]})`);
});

// ---------------------------------------------------------------------------------------------
// What the map-maker lays

/** Run with the map-maker's switch for sunken floor set, and put it back as it was. */
function sunkenSet<T>(on: boolean, run: () => T): T {
  const was = RELIEF.sunken;
  RELIEF.sunken = on;
  try {
    return run();
  } finally {
    RELIEF.sunken = was;
  }
}
const withSunken = <T>(run: () => T): T => sunkenSet(true, run);

interface Sample {
  depth: number;
  seed: number;
  f: Floor;
}
const DEPTHS = [1, 2, 3, 4, 6, 8, 10, 12];
const SEEDS = 12;
const samples: Sample[] = withSunken(() => {
  const out: Sample[] = [];
  for (const depth of DEPTHS) for (let k = 0; k < SEEDS; k++) out.push({ depth, seed: 4000 + depth * 211 + k * 29, f: generateFloor(depth, 4000 + depth * 211 + k * 29) });
  return out;
});
const name = (s: Sample): string => `dungeon ${s.depth}, seed ${s.seed}`;
const at = (f: Floor, x: number, y: number): number => y * f.w + x;
const isFloor = (f: Floor, x: number, y: number): boolean => x >= 0 && y >= 0 && x < f.w && y < f.h && f.tiles[at(f, x, y)] === T_FLOOR;
const lvl = (f: Floor, x: number, y: number): number => (isFloor(f, x, y) && f.height ? f.height[at(f, x, y)] : 0);
const stairOf = (f: Floor, x: number, y: number): number => (isFloor(f, x, y) && f.stair ? f.stair[at(f, x, y)] : 0);
const roomOf = (f: Floor, x: number, y: number): Room | null => f.rooms.find((r) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h) ?? null;

test('the switch is on in the game (the owner, 7 Oct 2026, 09:38, of its picture: "Yes sounds good"), and with it off no dungeon has sunken floor', () => {
  assert.equal(RELIEF.sunken, true, 'the switch is on');
  for (const s of samples.filter((_, i) => i % 4 === 0)) {
    const f = sunkenSet(false, () => generateFloor(s.depth, s.seed));
    if (f.height) for (let i = 0; i < f.height.length; i++) assert.ok(f.height[i] >= 0, `${name(s)}: sunken floor with the switch off`);
  }
});

test('with it on, many dungeons have sunken floor, and none has a pit', () => {
  let withOne = 0;
  let rooms = 0;
  for (const s of samples) {
    for (let i = 0; i < s.f.tiles.length; i++) assert.notEqual(s.f.tiles[i], T_PIT, `${name(s)}: a pit`);
    const f = s.f;
    const got = new Set<number>();
    if (f.height) for (let i = 0; i < f.height.length; i++) if (f.height[i] < 0) got.add(roomOf(f, i % f.w, Math.floor(i / f.w))?.id ?? -1);
    if (got.size) withOne++;
    rooms += got.size;
  }
  assert.ok(withOne >= samples.length * 0.5, `${withOne} of ${samples.length} dungeons have sunken floor`);
  console.log(`(${withOne} of ${samples.length} dungeons have sunken floor: ${rooms} rooms)`);
});

test('sunken floor is one level down, out in a room that is neither the first nor the boss\'s and has no terrace, two tiles from every wall and clear of every doorway', () => {
  for (const s of samples) {
    const f = s.f;
    if (!f.height) continue;
    for (let y = 0; y < f.h; y++) {
      for (let x = 0; x < f.w; x++) {
        const v = f.height[at(f, x, y)];
        assert.ok(v === 0 || v === 1 || v === -1, `${name(s)}: a height of ${v}`);
        if (v !== -1) continue;
        assert.ok(isFloor(f, x, y), `${name(s)}: sunken tile ${x},${y} is not floor`);
        const r = roomOf(f, x, y);
        if (!r) throw new Error(`${name(s)}: sunken tile ${x},${y} is in no room`);
        assert.ok(r.kind !== 'start' && r.kind !== 'boss', `${name(s)}: sunken floor in the ${r.kind} room`);
        for (let yy = r.y; yy < r.y + r.h; yy++) for (let xx = r.x; xx < r.x + r.w; xx++) assert.ok(lvl(f, xx, yy) !== 1, `${name(s)}: room ${r.id} has a terrace and sunken floor`);
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            assert.ok(isFloor(f, x + dx, y + dy), `${name(s)}: sunken tile ${x},${y} is within two tiles of what is not floor (${x + dx},${y + dy})`);
            assert.ok(roomOf(f, x + dx, y + dy), `${name(s)}: sunken tile ${x},${y} is within two tiles of a corridor`);
          }
        }
        // (beside it: sunken floor too, or the room's own floor: never raised floor)
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) assert.ok(lvl(f, x + dx, y + dy) <= 0, `${name(s)}: sunken floor beside raised floor at ${x},${y}`);
      }
    }
    assert.equal(levelAt(f, f.start.x, f.start.y), 0);
    assert.equal(levelAt(f, f.boss.x, f.boss.y), 0);
  }
});

test('every patch of sunken floor has a flight of stairs in it: its foot sunken floor, its head the room\'s own, nothing on it or in its way', () => {
  let flights = 0;
  for (const s of samples) {
    const f = s.f;
    if (!f.height || !f.stair) continue;
    const thing = new Map<number, string>();
    for (const p of f.props) thing.set(at(f, p.x, p.y), p.kind);
    const solid = (x: number, y: number): boolean => SOLID_PROPS.includes((thing.get(at(f, x, y)) ?? '') as never);
    const seen = new Uint8Array(f.w * f.h);
    for (let y = 0; y < f.h; y++) {
      for (let x = 0; x < f.w; x++) {
        if (lvl(f, x, y) !== -1 || seen[at(f, x, y)] === 1) continue;
        let stairs = 0;
        const queue = [[x, y]];
        seen[at(f, x, y)] = 1;
        for (let head = 0; head < queue.length; head++) {
          const [cx, cy] = queue[head];
          const k = stairOf(f, cx, cy);
          if (k !== 0) {
            stairs++;
            flights++;
            const hx = k === STAIR_N ? cx : cx - 1;
            const hy = k === STAIR_N ? cy - 1 : cy;
            const fx = k === STAIR_N ? cx : cx + 1;
            const fy = k === STAIR_N ? cy + 1 : cy;
            assert.ok(lvl(f, hx, hy) === 0 && stairOf(f, hx, hy) === 0 && isFloor(f, hx, hy), `${name(s)}: stair ${cx},${cy} has no floor of the room at its head`);
            assert.ok(lvl(f, fx, fy) === -1 && stairOf(f, fx, fy) === 0, `${name(s)}: stair ${cx},${cy} has no sunken floor at its foot`);
            assert.ok(!thing.has(at(f, cx, cy)), `${name(s)}: a ${thing.get(at(f, cx, cy))} on stair ${cx},${cy}`);
            assert.ok(!solid(hx, hy) && !solid(fx, fy), `${name(s)}: something solid at the head or foot of stair ${cx},${cy}`);
          }
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (lvl(f, nx, ny) !== -1 || seen[at(f, nx, ny)] === 1) continue;
            seen[at(f, nx, ny)] = 1;
            queue.push([nx, ny]);
          }
        }
        assert.ok(stairs > 0, `${name(s)}: the sunken floor at ${x},${y} has no stairs`);
        assert.ok(queue.length >= 16, `${name(s)}: sunken floor of ${queue.length} tiles`);
      }
    }
  }
  assert.ok(flights > 0);
});

test('everything that could be walked to can still be walked to, on foot', () => {
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

test('a dungeon\'s terraces are the ones it had, and nothing else about it is changed', () => {
  let checked = 0;
  for (const s of samples.filter((_, i) => i % 3 === 0)) {
    const before = sunkenSet(false, () => generateFloor(s.depth, s.seed));
    assert.deepEqual(s.f.tiles, before.tiles, `${name(s)}: the floor`);
    assert.deepEqual(s.f.rooms, before.rooms, `${name(s)}: the rooms`);
    assert.deepEqual(s.f.packs, before.packs, `${name(s)}: the packs`);
    assert.deepEqual(s.f.props, before.props, `${name(s)}: the things`);
    const n = s.f.w * s.f.h;
    for (let i = 0; i < n; i++) {
      const was = before.height ? before.height[i] : 0;
      const now = s.f.height ? s.f.height[i] : 0;
      if (was === 1 || now === 1) assert.equal(now, was, `${name(s)}: a terrace changed at ${i % s.f.w},${Math.floor(i / s.f.w)}`);
      const stWas = before.stair ? before.stair[i] : 0;
      if (stWas !== 0) assert.equal(s.f.stair ? s.f.stair[i] : 0, stWas, `${name(s)}: a flight up changed`);
    }
    checked++;
  }
  assert.ok(checked >= 20);
  // and the same number and seed give the same sunken floor
  for (const s of samples.filter((_, i) => i % 7 === 0)) {
    const again = withSunken(() => generateFloor(s.depth, s.seed));
    assert.deepEqual(again.height, s.f.height, name(s));
    assert.deepEqual(again.stair, s.f.stair, name(s));
  }
});

test("the playtests' own player walks down the stairs to what waits in sunken floor", () => {
  // in the hall
  const g = Game.forPractice('warrior', 5, 'steps');
  inner(g).waveT = 1e9;
  g.monsters.length = 0;
  g.hero.x = S.x1 + 2.5;
  g.hero.y = S.y1 + 0.5;
  const m = inner(g).spawn('skeleton', S.x1 - 0.5, S.y1 + 0.5, 900, 0, false, inner(g).rng);
  assert.equal(levelAt(g.level.floor, m.x, m.y), -1);
  const c = emptyControls();
  const bot = newBot(false, false);
  let took = -1;
  for (let t = 0; t < 20 && took < 0; t += 1 / 30) {
    m.state = 'sleep';
    g.hero.life = g.hero.d.maxLife;
    botStep(g, c, bot, 1 / 30);
    g.update(1 / 30, c);
    g.events.length = 0;
    if (Math.hypot(m.x - g.hero.x, m.y - g.hero.y) < 1.6 && levelAt(g.level.floor, g.hero.x, g.hero.y) === -1) took = t;
  }
  assert.ok(took > 2, `it stood beside the skeleton, in the sunken floor, having gone round by the stairs (${took.toFixed(1)} s)`);
});

test('walls are as they were: no wall stands at the edge of sunken floor (the painter has no wall that goes down)', () => {
  for (const s of samples) {
    const f = s.f;
    if (!f.height) continue;
    for (let y = 1; y < f.h - 1; y++) {
      for (let x = 1; x < f.w - 1; x++) {
        if (lvl(f, x, y) !== -1) continue;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) assert.notEqual(f.tiles[at(f, x + dx, y + dy)], T_WALL, `${name(s)}: a wall beside sunken floor at ${x},${y}`);
      }
    }
  }
});

// (kept from tests/height.test.ts so that the two files agree on the flights' kinds)
test('the two kinds of flight are the two there are', () => {
  assert.equal(STAIR_N, 1);
  assert.equal(STAIR_W, 2);
});

test('with sunken floor in the dungeons, the fallen wordsmith of a first dungeon still lies on the room\'s own floor', () => {
  let seen = 0;
  let roomsWithSunk = 0;
  withSunken(() => {
    for (let seed = 1; seed <= 60; seed++) {
      const g = Game.forFirstRun('warrior', seed * 7919);
      const b = g.level.body;
      if (!b) continue;
      const f = g.level.floor;
      assert.equal(levelAt(f, b.x, b.y), 0, `seed ${seed * 7919}: the body lies at level ${levelAt(f, b.x, b.y)}`);
      assert.equal(f.stair ? f.stair[b.ty * f.w + b.tx] : 0, 0, `seed ${seed * 7919}: the body lies on a stair`);
      const dist = flowField(g.level.walk, f.w, f.h, f.start.x, f.start.y, Infinity, undefined, g.level.step);
      assert.notEqual(dist[b.ty * f.w + b.tx], UNREACHABLE, `seed ${seed * 7919}: no way to the body`);
      const r = roomOf(f, b.tx, b.ty);
      if (r) {
        let sunk = false;
        for (let y = r.y; y < r.y + r.h && !sunk; y++) for (let x = r.x; x < r.x + r.w; x++) if (lvl(f, x, y) < 0) sunk = true;
        if (sunk) roomsWithSunk++;
      }
      seen++;
    }
  });
  assert.ok(seen >= 30, `${seen} first dungeons with a body`);
  console.log(`(in ${roomsWithSunk} of ${seen} first dungeons the body's room has sunken floor)`);
});
