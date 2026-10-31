// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16, THE SWAN GARDENS, laid by its own map-maker and dressed by its own dresser
// (game/act2/swangardens.ts), its nettle beds' rules (game/act2/garden_rules.ts); behind HIGH_CITY (game/act1.ts, off until his
// yes: switched on here for each test and off after). His word to the main chat, 29 Oct 2026, 18:09: “Levels are ready to
// add”. Over several floors:
//   - everything that matters is reached from the start on the walk grid (the boss, the way on, each stair, the maze's way in
//     and out, each side garden, every chest, every pack);
//   - the terraces built true (a wall on every tile of a wall's row but its stair's three, piers either side, the stair's feet);
//   - the lake: nothing goes into it, the pavilion on its island in it;
//   - the nettle beds there, and they sting and slow whoever walks through them, and stir;
//   - every piece laid is the art's (act1Pieces(16)), nothing of the descent's or the Hush's;
//   - the boss's ground big and clear;
//   - the same dice give the same floor;
// and played: the boss falls, the gate on opens and takes him home.
//   run: tsx --test tests/act2_swangardens.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { hushSetPieces } from '../src/art/act2_set';
import { makeFilm } from '../src/art/films';
import type { StartArt, WayArt } from '../src/art/films';
import { HIGH_CITY } from '../src/game/act1';
import { ACT1_SETS, CAMP, HOLD } from '../src/game/act1_dress';
import { blobDist } from '../src/game/act1_layout';
import { BUILT, SG_PIECE, SG_PLAN } from '../src/game/act2/swangardens';
import { NETTLES, YEW_VINE, inNettles, nettleSlow, stepGardens } from '../src/game/act2/garden_rules';
import { isCamp } from '../src/game/camp';
import { Game } from '../src/game/game';
import { makeDungeon } from '../src/game/level';
import { emptyControls } from '../src/game/state';
import type { Hero, Level, Monster } from '../src/game/state';
import { T_FLOOR } from '../src/game/types';
import { GARDEN_GATE, ONWARD, START, takesTiles, turnAB } from '../src/game/ways';
import { Act1Pieces, act1Pieces } from '../src/render/act1_pieces';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();

function high<T>(fn: () => T): T {
  const was = HIGH_CITY.on;
  HIGH_CITY.on = true;
  try {
    return fn();
  } finally {
    HIGH_CITY.on = was;
  }
}

const SEEDS = Array.from({ length: 8 }, (_, i) => 1 + i * 37);
const LEVELS: Level[] = high(() => SEEDS.map((s) => makeDungeon(16, s)));
const DT = 1 / 60;

/** Tiles reached from the start on the walk grid (side steps; what stands in the way, in the way). */
function walked(L: Level): Uint8Array {
  const f = L.floor;
  const W = f.w;
  const seen = new Uint8Array(W * f.h);
  const s = Math.floor(f.start.y) * W + Math.floor(f.start.x);
  const q = [s];
  seen[s] = 1;
  while (q.length) {
    const i = q.pop()!;
    const x = i % W;
    const y = (i - x) / W;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= f.h) continue;
      const j = ny * W + nx;
      if (seen[j] || L.walk[j] !== 1) continue;
      seen[j] = 1;
      q.push(j);
    }
  }
  return seen;
}
/** Is a tile reached, or (it standing in the way) one of the eight round it? */
function reachedAt(L: Level, seen: Uint8Array, x: number, y: number): boolean {
  const W = L.floor.w;
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (seen[(ty + dy) * W + tx + dx]) return true;
  return false;
}
const piecesAt = (L: Level, x: number, y: number) => L.props.filter((p) => p.kind === 'piece' && p.tx === x && p.ty === y);

test('the Swan Gardens have a map-maker of their own, and with HIGH_CITY on floor 16 is laid by it', () => high(() => {
  assert.equal(BUILT, true);
  for (const L of LEVELS) {
    const land = L.land!;
    const G = land.garden!;
    const seed = `seed ${L.floor.seed}`;
    assert.equal(land.kind, 'swangardens', seed);
    assert.ok(land.lake && G, seed);
    assert.deepEqual(G.terraces.map((t) => t.role), ['forecourt', 'parterre', 'maze', 'roses', 'lake'], `${seed}: five terraces up the hill`);
    assert.equal(G.walls.length, 4, `${seed}: a wall and its stair between each two`);
    for (let k = 0; k < 4; k++) assert.ok(G.terraces[k + 1].r[3] < G.terraces[k].r[1], `${seed}: each terrace up the hill (toward -y) of the last`);
    assert.deepEqual(G.sides.map((s) => s.role).sort(), ['gardeners', 'lair', 'treasure']);
    assert.equal(G.fountains.length, 2, `${seed}: still fountains`);
    assert.ok(G.royals, `${seed}: the fountain of the four royals`);
    assert.ok(land.areas.filter((a) => a.role === 'start').length === 1 && land.areas.filter((a) => a.role === 'boss').length === 1, seed);
    const boss = land.areas.find((a) => a.role === 'boss')!;
    assert.ok(blobDist(boss.blob, L.floor.boss.x, L.floor.boss.y) < 0.3, `${seed}: the boss waits in the middle of his ground (Game.meetOutdoorBoss)`);
    assert.deepEqual(land.arrive, L.floor.start);
    // (the way on: the gate in the back hedge beyond the lake's end, leading on up the hill; where he came in, the gate behind him)
    assert.deepEqual(land.exit, { x: G.gates.on.x + 0.5, y: G.gates.on.y + 0.5 });
    const a1 = L.ways!.a1!;
    assert.ok(a1, `${seed}: its way on and its start laid (game/ways.ts ONWARD[16], START[16])`);
    assert.equal(a1.dir, 'y-', seed);
    assert.equal(a1.startDir, 'x-', seed);
    assert.deepEqual(a1.start.at, { x: G.gates.start.x + 0.5, y: G.gates.start.y + 0.5 }, `${seed}: the gate he came in by, two tiles behind him`);
    assert.equal(L.walk[G.gates.start.y * L.floor.w + G.gates.start.x], 0, `${seed}: shut behind him`);
    assert.equal(L.walk[G.gates.on.y * L.floor.w + G.gates.on.x], 0, `${seed}: the gate on shut while the boss lives`);
    // (as long as the Hush's floors: its packs)
    assert.ok(L.floor.packs.length >= 35 && L.floor.packs.length <= 70, `${seed}: ${L.floor.packs.length} packs`);
    assert.ok(L.floor.packs.some((p) => p.tier === 'champion'), `${seed}: its lair's guardians`);
  }
}));

test('everything that matters is reached from the start on the walk grid: the boss, the way on, each stair, the maze, each side garden, every chest and pack', () => high(() => {
  for (const L of LEVELS) {
    const land = L.land!;
    const G = land.garden!;
    const seen = walked(L);
    const seed = `seed ${L.floor.seed}`;
    const W = L.floor.w;
    assert.ok(reachedAt(L, seen, L.floor.boss.x, L.floor.boss.y), `${seed}: the boss`);
    assert.ok(seen[(G.gates.on.y + 1) * W + G.gates.on.x], `${seed}: before the gate on`);
    for (const q of G.walls) {
      for (const x of [q.tx - 1, q.tx, q.tx + 1]) assert.ok(seen[q.y * W + x], `${seed}: a stair's way through its wall at ${x}, ${q.y}`);
      assert.ok(seen[(q.y + 1) * W + q.tx] && seen[(q.y - 1) * W + q.tx], `${seed}: its foot and its head`);
    }
    assert.ok(seen[G.maze.gin[1] * W + G.maze.gin[0]] && seen[G.maze.gout[1] * W + G.maze.gout[0]], `${seed}: the maze's way in and out`);
    for (const s of G.sides) assert.ok(reachedAt(L, seen, (s.r[0] + s.r[2]) / 2, (s.r[1] + s.r[3]) / 2), `${seed}: the ${s.role}`);
    for (const p of L.props) if (p.kind === 'chest') assert.ok(reachedAt(L, seen, p.x, p.y), `${seed}: a chest at ${p.tx}, ${p.ty}`);
    for (const p of L.floor.packs) assert.ok(seen[Math.floor(p.y) * W + Math.floor(p.x)], `${seed}: a pack at ${p.x}, ${p.y}`);
    // (the maze's chests are in its dead ends)
    assert.ok(L.props.filter((p) => p.kind === 'chest').length >= 3, seed);
  }
}));

test('the terraces built true (the art\'s README): a wall on every tile of its row but its stair\'s three, a pier either side, the stair\'s two feet; the row walked only at its stair', () => high(() => {
  for (const L of LEVELS) {
    const G = L.land!.garden!;
    const W = L.floor.w;
    const seed = `seed ${L.floor.seed}`;
    for (const q of G.walls) {
      for (let x = q.x0; x < q.x1; x++) {
        const here = piecesAt(L, x, q.y);
        const open = x >= q.tx - 1 && x <= q.tx + 1;
        assert.equal(L.floor.tiles[q.y * W + x], T_FLOOR, `${seed}: the wall's row is floor (the game walks on one level)`);
        if (open) {
          assert.equal(here.filter((p) => p.solid).length, 0, `${seed}: its stair's way through at ${x}`);
          assert.equal(L.walk[q.y * W + x], 1, seed);
          continue;
        }
        const want = x === q.tx - 2 || x === q.tx + 2 ? [SG_PIECE.pier] : [SG_PIECE.wall, SG_PIECE.wallVine];
        assert.ok(here.length === 1 && want.includes(here[0].name as never) && here[0].solid, `${seed}: ${want[0]} at ${x}, ${q.y}`);
        assert.equal(L.walk[q.y * W + x], 0, seed);
      }
      for (const x of [q.tx, q.tx + 1]) {
        const st = piecesAt(L, x, q.y + 1).filter((p) => p.name === SG_PIECE.stair);
        assert.ok(st.length === 1 && !st[0].solid, `${seed}: the stair's foot at ${x}, ${q.y + 1}`);
      }
    }
    // (her vine over one of them, by the gardeners' corner)
    assert.ok(L.props.some((p) => p.name === SG_PIECE.wallVine), seed);
  }
}));

test("the lake: deep water, nothing goes into it (as the Ledge Road's drop: no body, no shot, nothing thrown); the Swan Pavilion on its island in it, the lake past it toward the eye", () => high(() => {
  for (const L of LEVELS) {
    const land = L.land!;
    const G = land.garden!;
    const W = L.floor.w;
    const seed = `seed ${L.floor.seed}`;
    let n = 0;
    for (let i = 0; i < W * L.floor.h; i++) {
      if (!land.lake![i]) continue;
      n++;
      assert.notEqual(L.floor.tiles[i], T_FLOOR, `${seed}: a lake tile is not floor`);
      assert.equal(L.walk[i], 0, seed);
      assert.equal(L.open[i], 0, `${seed}: nothing shot nor thrown into it (game.ts isOpen)`);
    }
    assert.ok(n >= SG_PLAN.lake.deep * 30, `${seed}: a long lake (${n} tiles)`);
    const pv = L.props.filter((p) => p.name === SG_PIECE.pavilion);
    assert.equal(pv.length, 1, seed);
    const P = G.pavilion;
    // (its island, 2.6 round, all in the lake, and the lake two tiles past it toward the eye: art/floor16.ts)
    for (let a = 0; a < 16; a++) {
      const t = (a / 16) * Math.PI * 2;
      const x = P.x + Math.cos(t) * 2.7;
      const y = P.y + Math.sin(t) * 2.7;
      assert.equal(land.lake![Math.floor(y) * W + Math.floor(x)], 1, `${seed}: the island's edge in the water`);
    }
    for (let k = 0; k <= 3.8; k += 0.5) assert.equal(land.lake![Math.floor(P.y + k) * W + Math.floor(P.x + k)], 1, `${seed}: the lake toward the eye`);
  }
}));

test('the nettle beds: there, a nettle on every tile of them; they sting and slow whoever walks through them, and stir', () => high(() => {
  for (const L of LEVELS) {
    const G = L.land!.garden!;
    const seed = `seed ${L.floor.seed}`;
    assert.ok(G.nettles.length >= 5, `${seed}: ${G.nettles.length} beds`);
    for (const r of G.nettles) {
      for (let y = r[1]; y < r[3]; y++) {
        for (let x = r[0]; x < r[2]; x++) {
          assert.ok(inNettles(L, x + 0.5, y + 0.5), seed);
          assert.equal(piecesAt(L, x, y).filter((p) => p.name === SG_PIECE.nettles).length, 1, `${seed}: nettles at ${x}, ${y}`);
          assert.equal(L.walk[y * L.floor.w + x], 1, `${seed}: walked through`);
        }
      }
    }
  }
  // the rules: a hero and a monster stood in a bed, stung after a moment and every NETTLES.every after, slowed, the nettles stirred
  const L = LEVELS[0];
  const r = L.land!.garden!.nettles[0];
  const x = r[0] + 0.5;
  const y = r[1] + 0.5;
  const hero = { x, y, move: null, life: 100, d: { maxLife: 100 } } as unknown as Hero;
  const mon = { x, y: y + (r[3] - r[1] > 1 ? 1 : 0), dead: false, boss: false, kind: 'hushed', maxLife: 50 } as unknown as Monster;
  const boss = { x, y, dead: false, boss: true, kind: 'warden', maxLife: 500 } as unknown as Monster;
  const piece = L.props.find((p) => p.name === SG_PIECE.nettles && p.tx === r[0] && p.ty === r[1])!;
  let now = 0;
  const stings: { m: Monster | null; dmg: number }[] = [];
  const run = (secs: number): void => {
    for (let k = 0; k < secs / DT; k++) {
      now += DT;
      stings.push(...stepGardens(L, hero, [mon, boss], now, DT));
    }
  };
  run(NETTLES.first + 0.05);
  assert.equal(stings.filter((s) => s.m === null).length, 1, 'the hero stung');
  assert.ok(Math.abs(stings.find((s) => s.m === null)!.dmg - 100 * NETTLES.share) < 1e-9, 'his share of life (before armour: game.ts hurtHero)');
  assert.equal(stings.filter((s) => s.m === mon).length, 1, 'a monster on foot stung');
  assert.equal(stings.filter((s) => s.m === boss).length, 0, 'never the boss');
  assert.equal(nettleSlow(hero), 1 - NETTLES.slow, 'slowed');
  assert.equal(nettleSlow(mon), 1 - NETTLES.slow);
  assert.equal(nettleSlow(boss), 1);
  assert.equal(piece.variant, 1, 'stirred');
  run(NETTLES.every * 2);
  assert.equal(stings.filter((s) => s.m === null).length, 3, 'every NETTLES.every while in them');
  // out of them: slowed a moment more, then not; stepping back in stings no sooner than the last sting's NETTLES.every
  hero.x = L.floor.start.x;
  hero.y = L.floor.start.y;
  mon.x = hero.x;
  mon.y = hero.y;
  run(NETTLES.after * 0.5);
  assert.equal(nettleSlow(hero), 1 - NETTLES.slow, 'a moment after');
  run(NETTLES.after);
  assert.equal(nettleSlow(hero), 1, 'and then not');
  assert.equal(piece.variant, 0, 'the nettles still again');
}));

test('in the game: stood in the nettles the hero is stung (his life goes) and walks slower', () => high(() => {
  const g = new Game('warrior', 7);
  g.depth = 16;
  g.cleared = 15;
  g.wayDepth = 16;
  g.enterDungeon();
  assert.equal(g.level.land?.kind, 'swangardens');
  for (const m of g.monsters) m.dead = true;
  g.monsters = [];
  const r = g.level.land!.garden!.nettles[0];
  // (walking along its length, through it, and on the open lawn as far for as long)
  const pace = (x0: number, y0: number, dx: number): number => {
    g.hero.x = x0;
    g.hero.y = y0;
    const c = emptyControls();
    c.mx = dx;
    let moved = 0;
    for (let k = 0; k < 0.3 / DT; k++) {
      const was = g.hero.x;
      g.update(DT, c);
      moved += Math.abs(g.hero.x - was);
    }
    return moved;
  };
  // (on the open lawn first: the slow lingers a moment after the nettles)
  const free = pace(g.level.floor.start.x, g.level.floor.start.y, 1);
  const life0 = g.hero.life;
  g.hero.x = r[0] + 0.5;
  g.hero.y = r[1] + 0.5;
  for (let k = 0; k < 1 / DT; k++) g.update(DT, emptyControls());
  assert.ok(g.hero.life < life0, `stung: ${life0} to ${g.hero.life}`);
  const inBed = pace(r[0] + 0.3, r[1] + 0.5, 1);
  assert.ok(inBed < free * (1 - NETTLES.slow * 0.5), `slower in them (${inBed.toFixed(2)} to ${free.toFixed(2)})`);
}));

test("her vine in the yew: its first picture until he is near, then the rest once, and the last kept (the art's README)", () => high(() => {
  const L = LEVELS[1];
  const v = L.props.find((p) => p.name === SG_PIECE.coneVine);
  assert.ok(v, 'laid in the gardeners\' corner');
  const hero = { x: L.floor.start.x, y: L.floor.start.y, move: null, life: 100, d: { maxLife: 100 } } as unknown as Hero;
  let now = 0;
  stepGardens(L, hero, [], (now += DT), DT);
  assert.equal(v!.variant, 0);
  hero.x = v!.x + YEW_VINE.near - 0.5;
  hero.y = v!.y;
  const seen = new Set<number>();
  for (let k = 0; k < 2 / DT; k++) {
    stepGardens(L, hero, [], (now += DT), DT);
    seen.add(v!.variant);
  }
  assert.deepEqual([...seen].sort(), [1, 2, 3]);
  hero.x = L.floor.start.x;
  hero.y = L.floor.start.y;
  stepGardens(L, hero, [], (now += DT), DT);
  assert.equal(v!.variant, 3, 'kept: gone back into the yew');
}));

test("every piece laid is the art's (act1Pieces(16)): the Swan Gardens' own, her vines, the High City's; nothing of the descent's or the Hush's", () => high(() => {
  const own = act1Pieces(16);
  const hush = new Set(hushSetPieces().map((p) => p.name));
  const descent = new Set<string>([...CAMP.things, ...CAMP.big, ...CAMP.lying, ...CAMP.breakables, ...(Object.values(HOLD).filter((v) => typeof v === 'string') as string[])]);
  for (let n = 6; n <= 10; n++) {
    const s = ACT1_SETS[n];
    for (const k of [...s.things, ...s.big, ...s.lying, ...s.wallFoot, ...s.breakables, ...s.edge]) descent.add(k);
  }
  for (const name of Object.values(SG_PIECE)) assert.ok(own.has(name), `${name} is one of the art's`);
  for (const name of ACT1_SETS[16].breakables) assert.ok(own.has(name), `${name}: the game's barrels and urns drawn as it`);
  for (const L of LEVELS) {
    for (const p of L.props) {
      if (p.kind === 'piece') {
        assert.ok(own.has(p.name!), `${p.name}`);
        assert.ok(!descent.has(p.name!) && !hush.has(p.name!), `${p.name} is another floor's`);
        const fr = own.get(p.name!)!.frames!;
        assert.ok(p.variant < fr.length, `${p.name}: its picture ${p.variant} of ${fr.length}`);
      } else assert.ok(p.kind === 'chest' || p.kind === 'barrel' || p.kind === 'urn', p.kind);
    }
    for (const t of L.act1!.tiles) assert.ok(own.has(t.name), t.name);
  }
  // (drawn: the nettles by their state, the arbour half there while someone is under it, the breakables as the floor's)
  const L = LEVELS[0];
  const pieces = new Act1Pieces();
  assert.ok(pieces.begin(L));
  const nt = L.props.find((p) => p.name === SG_PIECE.nettles)!;
  const nf = own.get(SG_PIECE.nettles)!.frames!;
  const was = nt.variant;
  nt.variant = 1;
  // (pictures compared by what they are: a failed equal would print every pixel of them)
  assert.ok(pieces.sprite(nt, 0) === nf[1], 'stirred');
  nt.variant = was;
  const ar = L.props.find((p) => p.name === SG_PIECE.arbour)!;
  assert.ok(pieces.seenOf(ar) === own.get(SG_PIECE.arbour)!.frames![(ar.variant & 2) + 1], 'half there');
  for (const p of L.props) if (p.kind === 'urn' || p.kind === 'barrel') assert.ok(pieces.sprite(p, 0) === own.get(p.kind === 'urn' ? SG_PIECE.urn : SG_PIECE.barrow)!.frames![0], `${p.kind}: the gardens' own`);
}));

test("the boss's ground: about 17 by 20 tiles, whole floor, nothing standing in it, its middle clear; no nettles, no packs", () => high(() => {
  for (const L of LEVELS) {
    const land = L.land!;
    const A = land.areas.find((a) => a.role === 'boss')!.blob;
    const seed = `seed ${L.floor.seed}`;
    const W = L.floor.w;
    assert.ok(Math.min(A.rx, A.ry) * 2 >= 17 && Math.max(A.rx, A.ry) * 2 >= 20, `${seed}: ${A.rx * 2} by ${A.ry * 2}`);
    let n = 0;
    for (let y = Math.floor(A.y - A.ry - 2); y <= A.y + A.ry + 2; y++) {
      for (let x = Math.floor(A.x - A.rx - 2); x <= A.x + A.rx + 2; x++) {
        const d = blobDist(A, x + 0.5, y + 0.5);
        if (d >= 1) continue;
        n++;
        assert.equal(L.floor.tiles[y * W + x], T_FLOOR, `${seed}: floor at ${x}, ${y}`);
        assert.equal(L.walk[y * W + x], 1, `${seed}: walked at ${x}, ${y}`);
        assert.ok(!inNettles(L, x + 0.5, y + 0.5), seed);
        if (d < 0.85) assert.equal(L.props.filter((p) => p.tx === x && p.ty === y).length, 0, `${seed}: something at ${x}, ${y}`);
      }
    }
    assert.ok(n >= 250, `${seed}: ${n} tiles`);
    for (const p of L.floor.packs) assert.ok(blobDist(A, p.x, p.y) > 1.2, seed);
  }
}));

test('the same seed gives the same floor', () => high(() => {
  const sum = (L: Level): string => JSON.stringify({ t: [...L.floor.tiles], w: [...L.walk], p: L.props, k: L.floor.packs, g: L.land!.garden, l: [...L.land!.lake!], d: L.act1 });
  for (const s of SEEDS.slice(0, 3)) assert.equal(sum(makeDungeon(16, s)), sum(makeDungeon(16, s)), `seed ${s}`);
  assert.notEqual(sum(LEVELS[0]), sum(LEVELS[1]));
}));

test('its ways: the gates are the art\'s garden gate (shut; and the way on\'s film, shut then open); the boss falls, the gate on opens, and it takes him home', () => high(() => {
  assert.equal(ONWARD[16].secs, GARDEN_GATE.secs);
  assert.equal(START[16].back, 2);
  const way = makeFilm('onward:16:y-') as WayArt;
  const gate = act1Pieces(16).get(SG_PIECE.gate)!.frames!;
  assert.ok(way.shut.over === gate[0], 'across x: a way along y through it');
  assert.ok(way.open.over === gate[1]);
  assert.equal(way.film.frames.length / way.film.fps, GARDEN_GATE.secs, "its film the way on's time");
  const start = makeFilm('start:16:x-') as StartArt;
  assert.ok(start.over === gate[2], 'shut behind him, across y');
  for (const seed of [4, 9]) {
    const g = new Game('warrior', seed);
    g.hero.invuln = 1e9;
    g.depth = 16;
    g.cleared = 15;
    g.wayDepth = 16;
    g.enterDungeon();
    const L = g.level;
    const on = L.ways!.onward!;
    const a1 = L.ways!.a1!;
    const [ux, uy] = turnAB(a1.dir, 1, 0);
    g.hero.x = on.x - ux * 3.5;
    g.hero.y = on.y - uy * 3.5;
    for (const m of g.monsters) if (!m.boss) m.dead = true;
    const boss = g.monsters.find((m) => m.boss)!;
    for (let k = 0; k < 12 && !on.awake; k++) {
      boss.x = g.hero.x - ux * 2;
      boss.y = g.hero.y - uy * 2;
      g.bossReady();
      (g as unknown as { damageMonster(m: unknown, n: number, k: string, c: boolean, s: number): void }).damageMonster(boss, boss.life + boss.shield + 1, 'phys', false, -1);
      for (let j = 0; j < 0.5 / DT && !on.awake; j++) g.update(DT, emptyControls());
    }
    assert.ok(on.awake, `seed ${seed}: woken as the boss falls`);
    for (let j = 0; j < (GARDEN_GATE.secs + 0.3) / DT && !a1.open; j++) g.update(DT, emptyControls());
    assert.ok(a1.open, `seed ${seed}: the gate open`);
    const t = takesTiles(L.floor, a1)[0];
    assert.equal(L.walk[t], 1, `seed ${seed}: its gateway walked into`);
    g.hero.x = (t % L.floor.w) + 0.5;
    g.hero.y = Math.floor(t / L.floor.w) + 0.5;
    for (let j = 0; j < 4 / DT && !g.level.town; j++) g.update(DT, emptyControls());
    // (on to floor 17 when it is built; home to the camp were floor 16 the last floor built)
    if (HIGH_CITY.built > 1) assert.ok(!g.level.town && g.depth === 17, `seed ${seed}: on to floor 17 (${g.depth}, ${g.level.town ? 'town' : 'a floor'})`);
    else assert.ok(isCamp(g.level), `seed ${seed}: home to the camp (the last floor built)`);
  }
}));

test('the switch off: floor 16 is not the Swan Gardens', () => {
  assert.equal(HIGH_CITY.on, false);
  assert.equal(makeDungeon(16, 5).land, undefined);
});
