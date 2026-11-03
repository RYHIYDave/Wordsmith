// THE HIGH CITY, FLOOR 17: THE MASQUE, laid and dressed (game/act2/masque.ts, behind HIGH_CITY, off). His doc's level 17: "a
// winding suite of seven great rooms, each in its own colour (blue, purple, green, orange, white, violet, and a black one lit
// red through its windows), with galleries, card rooms and servants' passages between"; the Prince's floor the Black Room; its
// hazard the great ebony clock in the black room. Here, over several throws of the dice:
//   1. its zones are the art's (MQ_ZONE), and its pieces' names are floor 17's;
//   2. the floor is laid by its own map-maker: the seven in the tale's order along the suite, each its colour, the black room the
//      boss's and the biggest, the way on beyond it; galleries, card rooms (the lair among them), passages, a store;
//   3. everything walked is reached from the start; no pack in the gates' hall, the black room or beyond it;
//   4. the clock against the black room's west wall, its front along +x; the braziers in the passages; nothing solid in the
//      black room's floor but its edge; the quest by the violet room's doorway into the black.
//   run: tsx --test tests/act2_masque.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { HIGH_CITY, landOf } from '../src/game/act1';
import { Game } from '../src/game/game';
import { CLOCK_FACING_X, MASQUE_ZONE, MQ_PIECE, SEVEN, isSeven } from '../src/game/act2/masque';
import { MQ_ZONE } from '../src/art/masque';
import { CLOCK_FRAMES } from '../src/art/floor17';
import { act1Pieces } from '../src/render/act1_pieces';
import { walkReach } from '../src/game/act2/housequiet';
import { T_FLOOR } from '../src/game/types';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();
const SEEDS = [1, 3, 4, 8, 11, 17];
function laid(seed: number): Game {
  const g = new Game('warrior', seed);
  g.depth = 17;
  g.cleared = 16;
  g.wayDepth = 17;
  g.enterDungeon();
  return g;
}
function high<T>(fn: () => T): T {
  const was = HIGH_CITY.on;
  HIGH_CITY.on = true;
  try {
    return fn();
  } finally {
    HIGH_CITY.on = was;
  }
}

test('1. its zones are the art\'s, its pieces floor 17\'s', () => {
  assert.deepEqual({ ...MASQUE_ZONE }, { ...MQ_ZONE });
  assert.equal(CLOCK_FACING_X, CLOCK_FRAMES.perFacing);
  const names = new Set([...act1Pieces(17).keys()]);
  for (const n of Object.values(MQ_PIECE)) assert.ok(names.has(n), n);
});

test('2-4. laid by its own map-maker: the seven in order, the black room the boss\'s; reached; packs; the clock; the dressing', () => high(() => {
  for (const seed of SEEDS) {
    const g = laid(seed);
    const L = g.level;
    const f = L.floor;
    const M = L.land?.masque;
    assert.equal(landOf(17), 'masque');
    assert.equal(L.land?.kind, 'masque', `${seed}: its own map-maker`);
    assert.ok(M, `${seed}: its plan`);
    const suite = M!.rooms.filter((q) => q.path >= 0).sort((a, b) => a.path - b.path).map((q) => q.role).filter((r) => isSeven(r));
    assert.deepEqual(suite, [...SEVEN], `${seed}: the seven in the tale's order`);
    const roles = M!.rooms.map((q) => q.role);
    for (const r of ['gates', 'gallery', 'beyond', 'cards', 'passage', 'lair', 'store']) assert.ok(roles.includes(r as never), `${seed}: a ${r}`);
    for (const q of M!.rooms) {
      if (!isSeven(q.role)) continue;
      const cx = Math.floor((q.r[0] + q.r[2]) / 2);
      const cy = Math.floor((q.r[1] + q.r[3]) / 2);
      assert.equal(L.land!.zones![cy * f.w + cx], MASQUE_ZONE[(q.role[0].toUpperCase() + q.role.slice(1)) as keyof typeof MASQUE_ZONE], `${seed}: the ${q.role} room its colour`);
    }
    const black = M!.rooms.find((q) => q.role === 'black')!;
    const area = (q: { r: number[] }): number => (q.r[2] - q.r[0]) * (q.r[3] - q.r[1]);
    assert.ok(M!.rooms.every((q) => area(q) <= area(black)), `${seed}: the black room the biggest`);
    assert.ok(Math.min(black.r[2] - black.r[0], black.r[3] - black.r[1]) >= 17, `${seed}: the black room at least 17 across`);
    assert.equal(f.rooms[black.room].kind, 'boss');
    const inR = (r: number[], x: number, y: number): boolean => x >= r[0] && y >= r[1] && x < r[2] && y < r[3];
    assert.ok(inR(black.r, f.boss.x, f.boss.y), `${seed}: the boss in the black room`);
    const beyond = M!.rooms.find((q) => q.role === 'beyond')!;
    assert.ok(inR(beyond.r, L.land!.exit.x, L.land!.exit.y), `${seed}: the way on beyond it`);
    // (3) reached; packs
    const seen = walkReach(L.walk, f.w, f.h, Math.floor(f.start.y) * f.w + Math.floor(f.start.x));
    for (let i = 0; i < f.w * f.h; i++) if (L.walk[i] === 1) assert.ok(seen[i], `${seed}: tile ${i % f.w},${Math.floor(i / f.w)} reached`);
    for (const p of f.packs) {
      for (const q of M!.rooms) if (q.role === 'gates' || q.role === 'black' || q.role === 'beyond') assert.ok(!inR(q.r, p.x, p.y), `${seed}: no pack in the ${q.role}`);
    }
    // (4) the clock, the braziers, the black room's floor, the quest
    const clock = L.props.find((p) => p.name === MQ_PIECE.clock)!;
    assert.ok(clock, `${seed}: the clock`);
    assert.equal(clock.variant, CLOCK_FACING_X, `${seed}: its front along +x`);
    assert.equal(clock.tx, black.r[0], `${seed}: against the west wall`);
    assert.notEqual(f.tiles[clock.ty * f.w + clock.tx - 1], T_FLOOR, `${seed}: the wall behind it`);
    const passages = M!.rooms.filter((q) => q.role === 'passage');
    assert.ok(L.props.some((p) => p.name === MQ_PIECE.brazier && passages.some((q) => inR(q.r, p.tx, p.ty))), `${seed}: braziers in the passages`);
    for (const p of L.props) if (p.solid && p !== clock && inR([black.r[0] + 2, black.r[1] + 2, black.r[2] - 2, black.r[3] - 2], p.tx, p.ty)) assert.fail(`${seed}: ${p.name} in the black room's floor`);
    const violet = M!.rooms.find((q) => q.role === 'violet')!;
    const quest = L.props.find((p) => p.name === MQ_PIECE.bargain);
    assert.ok(quest && inR(violet.r, quest.tx, quest.ty), `${seed}: the quest in the violet room`);
  }
}));

test('off, nothing of it: floor 17 not laid', () => {
  assert.equal(HIGH_CITY.on, false);
});
