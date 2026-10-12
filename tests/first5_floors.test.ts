// THE FIRST FIVE FLOORS: the floors themselves (game/ways.ts, the mine shaft; game/first5.ts, what each
// floor is laid with), held to the art chat's pictures and to the owner's words.
//   1. the shaft's times are its films' own
//   2. every fifth floor has the shaft at the back of its boss's hall, and no stairwell and no portal
//   3. the Fleshmancer dead, the cage comes down; no monster steps into it; walked into, it takes the
//      hero up to town, nothing touching him on the way, the Crypt cleared
//   4. the dead he raised fall with him
//   run: tsx --test tests/first5_floors.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
import { cageDown, cageUp } from '../src/art/shaft';
import { wardenPieces } from '../src/art/floor1';
import { headsmanPieces } from '../src/art/floor2';
import { chainedPieces } from '../src/art/floor3';
import { ossuaryPieces } from '../src/art/floor4';
import { lairPieces } from '../src/art/floor5';
import { WALLS_FADING } from '../src/art/ground';
import { FLOOR_SETS, LAIR_HEAPS, drawnFaces } from '../src/game/first5';
import { T_WALL } from '../src/game/types';
import { wallFaces, wallsAway } from '../src/render/walls';
import { doorTiles } from '../src/game/doors';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import { FIRST5, SHAFT, STAIR_OPENING, beforeGate, shaftTiles } from '../src/game/ways';
import { flowField } from '../src/game/nav';
import { paintWithoutCanvas, seasoned } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

const near = (a: number, b: number, by: number, what: string): void => assert.ok(Math.abs(a - b) <= by, `${what}: ${a} against ${b}`);

/** A game on floor `depth` of the Crypt, the hero as he comes in. */
function floor(depth: number, seed: number): Game {
  const g = seasoned(new Game('warrior', seed), 8);
  g.depth = depth;
  g.cleared = depth - 1;
  g.enterDungeon();
  g.events.length = 0;
  return g;
}

test('1. the shaft\'s times are its films\' own (art/shaft.ts)', () => {
  const down = cageDown().m;
  const up = cageUp().m;
  near(SHAFT.down, down.frames.length / down.fps, 1e-9, 'the cage coming down');
  assert.equal(SHAFT.downJolts.map((j) => Math.round(j * down.fps)).join(' '), down.jolts.join(' '), 'it strikes the catches, and bounces');
  near(SHAFT.up, up.frames.length / up.fps, 1e-9, 'the ride up');
  assert.equal(SHAFT.upJolts.map((j) => Math.round(j * up.fps)).join(' '), up.jolts.join(' '), 'its gate slams, its cable snaps taut');
  assert.equal(cageUp().layers.lift.length, up.frames.length, 'how far up it is, frame by frame');
});

test('2. every fifth floor: the shaft at the back of its boss\'s hall (three tiles by three of plain floor), its gate side open to the hall and reached from where he comes in; no stairwell, no portal', () => {
  assert.equal(FIRST5.on, true);
  for (let seed = 1; seed <= 40; seed++) {
    const g = floor(5, seed * 7919);
    const L = g.level;
    const f = L.floor;
    const W = L.ways!;
    const sh = W.shaft;
    const at = `seed ${seed * 7919}`;
    assert.ok(sh, `${at}: the shaft`);
    assert.equal(W.stair, null, `${at}: no stairwell`);
    assert.equal(W.stairs.length, 0, `${at}: nor places for one`);
    assert.equal(L.portal, null, `${at}: no portal`);
    const hall = f.rooms.find((r) => r.kind === 'boss')!;
    assert.ok(sh!.x - 1 >= hall.x && sh!.y - 1 >= hall.y && sh!.x + 1 < hall.x + hall.w && sh!.y + 1 < hall.y + hall.h, `${at}: in the boss's hall`);
    assert.ok(!L.props.some((p) => Math.abs(p.tx - sh!.x) <= 1 && Math.abs(p.ty - sh!.y) <= 1), `${at}: nothing stands or lies round it`);
    for (const i of [...shaftTiles(f, sh!), sh!.y * f.w + sh!.x]) assert.equal(L.walk[i], 0, `${at}: its timbers and its middle not walked on`);
    // (the hero reaches the tile before its gate: the cage is then walked into from there)
    const walk = L.walk.slice();
    for (const d of L.doors) for (const i of doorTiles(f, d.spot)) walk[i] = 1;
    const reach = flowField(walk, f.w, f.h, f.start.x, f.start.y, Infinity, undefined, L.step);
    assert.ok(reach[(sh!.y + 1) * f.w + sh!.x] < 0xffff, `${at}: the way to its gate`);
    // (and the boss is the Fleshmancer)
    assert.equal(g.monsters.find((m) => m.boss)?.kind, 'fleshmancer', `${at}: his hall`);
  }
  // (and none on the floors above)
  for (let d = 1; d <= 4; d++) assert.equal(floor(d, 77).level.ways!.shaft ?? null, null, `floor ${d}: no shaft`);
});

test('3. the Fleshmancer dead, the cage comes down; no monster steps into it; walked into, it takes the hero up to town, nothing touching him on the way: the Crypt cleared', () => {
  const g = floor(5, 31337);
  const L = g.level;
  const f = L.floor;
  const sh = L.ways!.shaft!;
  const boss = g.monsters.find((m) => m.boss)!;
  g.hero.x = sh.x + 0.5;
  g.hero.y = sh.y + 3.5;
  g.kill(boss);
  g.events.length = 0;
  assert.equal(sh.state, 'coming', 'it comes down as he dies');
  const shakes: number[] = [];
  let t = 0;
  while (sh.state === 'coming' && t < 10) {
    g.update(1 / 60, emptyControls());
    t += 1 / 60;
    for (const e of g.events) if (e.t === 'shake') shakes.push(+t.toFixed(2));
    g.events.length = 0;
  }
  near(t, SHAFT.down, 0.05, 'down when its film is over');
  assert.ok(shakes.length >= 2 && Math.abs(shakes[0] - SHAFT.downJolts[0]) < 0.05, `the screen kicked as it strikes (${shakes.join(', ')})`);
  const i = sh.y * f.w + sh.x;
  assert.equal(L.walk[i], 1, 'its middle walked into now');
  assert.ok(L.shut && L.shut[i] === 1, 'but held against monsters, as a shut door is');
  for (const j of shaftTiles(f, sh)) assert.equal(L.walk[j], 0, 'its timbers still not');
  // (he walks into it, from before its gate)
  const cleared = g.cleared;
  g.hero.x = sh.x + 0.5;
  g.hero.y = sh.y + 1.6;
  const c = emptyControls();
  c.my = -1;
  let k = 0;
  while (!g.leaving && k++ < 120) g.update(1 / 60, c);
  assert.ok(g.leaving && g.leaving.to === 'up', 'walked into, it takes him up');
  assert.equal(sh.state, 'going');
  assert.ok(Math.abs(g.hero.x - (sh.x + 0.5)) < 1e-9 && Math.abs(g.hero.y - (sh.y + 0.5)) < 1e-9, 'standing in its middle');
  const life = g.hero.life;
  // (a monster at him as he goes)
  const o = g.spawn('skeleton', sh.x + 0.5, sh.y + 1.6, 0, 0, false, g.rng);
  g.monsters.push(o);
  let ride = 0;
  while (!g.level.town && ride < 10) {
    g.update(1 / 60, emptyControls());
    ride += 1 / 60;
  }
  near(ride, SHAFT.up, 0.05, 'up in the time of its film');
  assert.ok(g.level.town, 'in town');
  assert.equal(g.cleared, cleared + 1, 'the floor cleared');
  assert.ok(g.hero.life >= life, 'nothing touched him on the way up');
});

test('4. the dead the Fleshmancer raised fall with him, worth nothing; those of a pack of his own kind stand', () => {
  const g = floor(5, 4242);
  const boss = g.monsters.find((m) => m.boss)!;
  const mine = [0, 1, 2].map((k) => g.spawn('skeleton', boss.x + 1 + k * 0.6, boss.y + 1, boss.packId, 0, false, g.rng));
  const other = g.spawn('skeleton', boss.x - 2, boss.y + 1, 999, 0, false, g.rng);
  g.monsters.push(...mine, other);
  const kills = g.kills;
  const xp = g.hero.xp;
  g.kill(boss);
  assert.ok(mine.every((m) => m.dead), 'his raised dead fall');
  assert.ok(!other.dead, 'another skeleton stands');
  assert.equal(g.kills, kills + 1, 'only he is counted');
  assert.ok(g.hero.xp - xp <= boss.xp * 3, 'no more than his worth');
});

test('5. the stairwell breaks open for as long as its film (3 to 3.5 s: art/stairwell_open.ts): it says so to the renderer, and takes nobody down until it has', () => {
  for (const depth of [1, 2, 3, 4]) {
    const g = floor(depth, 900 + depth);
    const L = g.level;
    const boss = g.monsters.find((m) => m.boss)!;
    const st0 = L.ways!.stairs[0];
    boss.x = st0.x + 1.2;
    boss.y = st0.y + 6;
    g.kill(boss);
    const st = L.ways!.stair!;
    assert.ok(st.open && st.t === 0, `floor ${depth}: it begins to open as he dies`);
    assert.ok(g.events.some((e) => e.t === 'stairOpens'), `floor ${depth}: and the renderer is told`);
    assert.ok(!g.events.some((e) => e.t === 'burst'), `floor ${depth}: no placeholder burst from the rules (main.ts shows one where there is no film)`);
    // (on its top step at once: nothing, until it has broken open)
    g.hero.x = st.x + 0.5;
    g.hero.y = st.y + 0.62;
    let t = 0;
    while (g.level === L && t < 6) {
      g.update(1 / 60, emptyControls());
      t += 1 / 60;
    }
    assert.ok(g.level !== L, `floor ${depth}: down at last`);
    assert.ok(t >= STAIR_OPENING - 0.02 && t <= STAIR_OPENING + 0.6, `floor ${depth}: once it had broken open (${t.toFixed(2)} s)`);
  }
  assert.ok(STAIR_OPENING >= 3.5, 'no sooner than its longest film is over');
});

// ---------------------------------------------------------------------------------------------------
// EVERY FLOOR LAID WITH ITS OWN PIECES (game/first5.ts)

const ART = [wardenPieces, headsmanPieces, chainedPieces, ossuaryPieces, lairPieces];
const artOf = new Map<number, Map<string, { kind: string; frames?: unknown[]; left?: unknown[]; spots?: unknown[] }>>();
const piecesOf = (k: number): Map<string, { kind: string; frames?: unknown[]; left?: unknown[]; spots?: unknown[] }> => {
  let m = artOf.get(k);
  if (!m) artOf.set(k, (m = new Map(ART[k - 1]().map((p) => [p.name, p]))));
  return m;
};

test('6. every piece the rules lay is one of the art chat\'s, of its kind; and every one the art chat painted is laid (but the quest\'s: no quest for it yet)', () => {
  for (let k = 1; k <= 5; k++) {
    const set = FLOOR_SETS[k - 1];
    const P = piecesOf(k);
    const is = (name: string | null, kinds: string[], role: string): void => {
      if (name === null) return;
      const p = P.get(name);
      assert.ok(p, `floor ${k}: "${name}" (${role}) is one of its pieces`);
      assert.ok(kinds.includes(p!.kind), `floor ${k}: "${name}" (${role}) is a ${p!.kind}, not ${kinds.join(' or ')}`);
    };
    for (const n of set.wall) is(n, ['wall tile', 'on the wall'], 'in a wall');
    for (const n of set.burning) assert.ok(set.wall.includes(n), `floor ${k}: "${n}" burns, and is one of its wall pieces`);
    for (const n of set.heaps) {
      is(n, ['wall tile'], 'with a heap');
      assert.ok((P.get(n)!.frames ?? []).length >= 1, `floor ${k}: "${n}" has its heap`);
    }
    for (const n of set.tiles) is(n, ['floor tile'], 'a floor tile');
    if (set.runner) is(set.runner, ['floor tile'], 'a runner');
    for (const n of set.lying) is(n, ['on the floor'], 'lying');
    for (const n of set.small) is(n, ['on the floor'], 'standing about');
    for (const n of [...set.things, ...set.big]) is(n, ['obstacle', 'on the floor'], 'standing');
    for (const n of set.breakables) {
      is(n, ['breakable'], 'a breakable');
      assert.ok((P.get(n)!.frames ?? []).length === 2, `floor ${k}: "${n}" whole and broken`);
    }
    is(set.chest, ['obstacle'], 'the chest');
    assert.ok((P.get(set.chest)!.frames ?? []).length === 2, `floor ${k}: its chest shut and open`);
    is(set.fire, ['obstacle'], 'the brazier');
    is(set.pillar, ['obstacle'], 'the pillar');
    is(set.traps.holes, ['trap'], 'the spike floor');
    is(set.traps.plate, ['trap'], 'the dart trap\'s plate');
    is(set.traps.slot, ['trap'], 'the dart trap\'s slot');
    const hosts: string[] = [];
    for (const m of set.moments) {
      if (m.piece) {
        is(m.piece, m.at === 'wall' ? ['wall tile', 'on the wall'] : ['obstacle', 'on the floor'], 'a moment\'s');
        hosts.push(m.piece);
      }
      if (m.standIn) is(m.standIn, ['obstacle', 'on the floor', 'on the wall', 'wall tile'], 'standing in for a moment');
      if (m.rails) hosts.push('the rails', "the rails' end");
    }
    for (const n of set.unlaid) is(n, ['quest'], 'not laid yet');
    // (every piece painted is laid: but its doors and gates, which are the game's gates' own, art/floors.ts)
    const laid = new Set<string>([...set.wall, ...set.heaps, ...set.tiles, ...(set.runner ? [set.runner] : []), ...set.lying, ...set.small, ...set.things, ...set.big, ...set.breakables, set.chest, ...(set.fire ? [set.fire] : []), ...(set.pillar ? [set.pillar] : []), set.traps.holes, set.traps.plate, set.traps.slot, ...hosts, ...set.unlaid, ...(k === 5 ? [...LAIR_HEAPS, 'the mine shaft'] : [])]);
    for (const [name, p] of P) {
      if (p.kind === 'door' || p.kind === 'gate') continue;
      assert.ok(laid.has(name), `floor ${k}: "${name}" (${p.kind}) is laid`);
    }
  }
});

test('7. what a wall face holds is drawn: the faces the rules lay pieces in are the renderer\'s own (render/walls.ts, the game\'s look)', () => {
  for (let d = 1; d <= 5; d++) {
    for (const seed of [17, 4711]) {
      const f = floor(d, seed).level.floor;
      const away = wallsAway(f, WALLS_FADING);
      for (let i = 0; i < f.w * f.h; i++) {
        if (f.tiles[i] !== T_WALL) continue;
        const theirs = away[i] ? 0 : wallFaces(f, i);
        const mine = drawnFaces(f, i);
        // (mine only where the floor before the face is plain: never more than theirs)
        assert.ok((mine & ~theirs) === 0, `floor ${d}, seed ${seed}, wall ${i % f.w},${Math.floor(i / f.w)}: faces ${mine} drawn as ${theirs}`);
      }
    }
  }
});

test('8. a floor laid: its pieces where they may be (never the same in two neighbouring tiles of a wall; nothing on the stairwell\'s places, the waypoint, before a door), all of it reached as before, its three moments laid', () => {
  for (let d = 1; d <= 5; d++) {
    let moments = 0;
    const seeds = [3, 77, 991, 4242, 31337, 65535];
    for (const seed of seeds) {
      const g = floor(d, seed);
      const L = g.level;
      const f = L.floor;
      const D = L.dress!;
      const at = `floor ${d}, seed ${seed}`;
      assert.ok(D && D.floor === d, `${at}: laid`);
      // (in faces that are drawn; the same piece never on two neighbouring tiles of a wall)
      const onWall = new Map<string, string>();
      for (const w of D.wall) {
        assert.ok(drawnFaces(f, w.i) & (w.side === 0 ? 1 : 2), `${at}: "${w.name}" in a face that is drawn`);
        onWall.set(`${w.i}:${w.side}`, w.name);
      }
      for (const w of D.wall) {
        const along = w.side === 0 ? 1 : f.w;
        for (const j of [w.i - along, w.i + along]) assert.ok(onWall.get(`${j}:${w.side}`) !== w.name || FLOOR_SETS[d - 1].moments.some((m) => m.piece === w.name), `${at}: "${w.name}" twice side by side`);
      }
      // (nothing on the stairwell's places and a tile round them, the waypoint's dais, before the floor's doors and gates)
      const clear = (x: number, y: number, why: string): void => {
        const i = y * f.w + x;
        assert.ok(!D.tiles.some((t) => t.i === i && t.name !== 'the rails'), `${at}: no floor tile at ${x},${y} (${why})`);
        assert.ok(!L.props.some((p) => p.kind === 'piece' && p.tx === x && p.ty === y), `${at}: nothing laid at ${x},${y} (${why})`);
      };
      for (const s of L.ways!.stairs) for (let y = s.y - 1; y <= s.y + 2; y++) for (let x = s.x - 1; x <= s.x + 3; x++) clear(x, y, 'the stairwell');
      const w = L.ways!.way;
      if (w) for (let y = Math.floor(w.y - 1); y <= Math.floor(w.y + 1); y++) for (let x = Math.floor(w.x - 1); x <= Math.floor(w.x + 1); x++) clear(x, y, 'the waypoint');
      for (const q of L.doors) for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) if (beforeGate(q.spot, x, y)) clear(x, y, 'before a door');
      clear(Math.floor(f.start.x), Math.floor(f.start.y), 'where he comes in');
      // (all of it reached as it was: the same floor without them)
      const was = FIRST5.on;
      FIRST5.on = false;
      let bare;
      try {
        bare = floor(d, seed).level;
      } finally {
        FIRST5.on = was;
      }
      const open = (lv: typeof L): Uint8Array => {
        const walk = lv.walk.slice();
        for (const q of lv.doors) for (const i of doorTiles(f, q.spot)) walk[i] = 1;
        return walk;
      };
      const before = flowField(open(bare), f.w, f.h, f.start.x, f.start.y, Infinity, undefined, bare.step);
      const after = flowField(open(L), f.w, f.h, f.start.x, f.start.y, Infinity, undefined, L.step);
      for (let i = 0; i < f.w * f.h; i++) if (before[i] < 0xffff && L.walk[i] === 1) assert.ok(after[i] < 0xffff, `${at}: ${i % f.w},${Math.floor(i / f.w)} still reached`);
      moments += D.moments.length;
      // (the fifth floor: his bone heaps in his hall)
      if (d === 5) assert.ok((f.heaps ?? []).length >= 1, `${at}: his bone heaps`);
    }
    assert.ok(moments >= seeds.length * 3 - 1, `floor ${d}: its three moments laid (${moments} of ${seeds.length * 3})`);
  }
});
