// THE HIGH CITY, FLOOR 19: THE KEEP, laid and dressed (game/act2/keep.ts, behind HIGH_CITY, off). His doc's level 19: "The old
// castle at the hill's crown, where the king lies dying."; "walls and towers: battlements, a gatehouse, the barracks and the
// armoury, the throne hall, and the king's bedchamber at the top of the keep."; its hazards "murder holes that drop pitch, and
// portcullises that slam down to cut a hall in two."; its boss "The King. His floor is the Throne Hall." Here, over several
// throws of the dice:
//   1. its zones are the art's (KP_ZONE), and its pieces' names are floor 19's;
//   2. the floor is laid by its own map-maker: the bailey, the gate passage, halls, the wall walk, the throne hall (the boss's,
//      his arena's size, entered through its wall toward the eye, the throne in the middle of its far wall), the way on beyond
//      it; the barracks (the lair), the king's bedchamber off the hall before the throne, a store;
//   3. everything walked is reached from the start; no pack in the bailey, the gate passage, the throne hall or beyond it; each
//      portcullis a row right across a hall, clear of its doorways; the murder holes (the trap) in the gate passage;
//   4. the battlements along the walk's far row; the throne's dais solid; nothing solid in the throne hall's floor but its edge;
//      the great bed, the cushion and the broken songbird in the bedchamber; the great doors open in the bailey's far wall.
//   run: tsx --test tests/act2_keep.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { HIGH_CITY, landOf } from '../src/game/act1';
import { Game } from '../src/game/game';
import { KEEP_ZONE, KP_PIECE } from '../src/game/act2/keep';
import { KP_ZONE } from '../src/art/keep';
import { act1Pieces } from '../src/render/act1_pieces';
import { walkReach } from '../src/game/act2/housequiet';
import { T_FLOOR } from '../src/game/types';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();
const SEEDS = [1, 3, 4, 8, 11, 17, 21];
function laid(seed: number): Game {
  const g = new Game('warrior', seed);
  g.depth = 19;
  g.cleared = 18;
  g.wayDepth = 19;
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

test("1. its zones are the art's, its pieces floor 19's", () => {
  assert.deepEqual({ ...KEEP_ZONE }, { ...KP_ZONE });
  const names = new Set([...act1Pieces(19).keys()]);
  for (const n of Object.values(KP_PIECE)) assert.ok(names.has(n), n);
});

test('2-4. laid by its own map-maker: the bailey, the passage, the walk, the throne hall the boss\'s; reached; packs; portcullises; murder holes; the dressing', () => high(() => {
  for (const seed of SEEDS) {
    const g = laid(seed);
    const L = g.level;
    const f = L.floor;
    const K = L.land?.keep;
    assert.equal(landOf(19), 'keep');
    assert.equal(L.land?.kind, 'keep', `${seed}: its own map-maker`);
    assert.ok(K, `${seed}: its plan`);
    const roles = K!.rooms.map((q) => q.role);
    for (const r of ['bailey', 'gate', 'hall', 'walk', 'throne', 'beyond', 'chamber', 'barracks', 'store']) assert.ok(roles.includes(r as never), `${seed}: a ${r}`);
    const inR = (r: readonly number[], x: number, y: number): boolean => x >= r[0] && y >= r[1] && x < r[2] && y < r[3];
    const zoneAt = (x: number, y: number): number => L.land!.zones![Math.floor(y) * f.w + Math.floor(x)];
    // (2) the throne hall
    const hallI = K!.rooms.findIndex((q) => q.role === 'throne');
    const hall = K!.rooms[hallI];
    const hw = hall.r[2] - hall.r[0];
    const hh = hall.r[3] - hall.r[1];
    assert.ok(Math.max(hw, hh) >= 21 && Math.min(hw, hh) >= 19, `${seed}: the throne hall his arena's size (${hw} by ${hh})`);
    assert.equal(f.rooms[hall.room].kind, 'boss');
    assert.ok(inR(hall.r, f.boss.x, f.boss.y), `${seed}: the boss in the throne hall`);
    assert.equal(zoneAt(f.boss.x, f.boss.y), KEEP_ZONE.Throne, `${seed}: the throne hall its own floor`);
    assert.ok(Math.abs(K!.throne.x - (hall.r[0] + hall.r[2]) / 2) <= 0.5 && K!.throne.y - hall.r[1] < 2, `${seed}: the throne in the middle of the far wall`);
    const inn = K!.ways.find((w) => w.b === hallI)!;
    assert.ok(!inn.alongX && inn.r[1] >= hall.r[3], `${seed}: the throne hall entered through its wall toward the eye`);
    const beyondI = K!.rooms.findIndex((q) => q.role === 'beyond');
    assert.ok(inR(K!.rooms[beyondI].r, L.land!.exit.x, L.land!.exit.y), `${seed}: the way on beyond the throne hall`);
    const out = K!.ways.find((w) => w.a === hallI && w.b === beyondI)!;
    if (out.r[3] <= hall.r[1]) assert.ok(Math.abs((out.r[0] + out.r[2]) / 2 - K!.throne.x) >= 5, `${seed}: the way on clear of the throne`);
    const chamber = K!.rooms.find((q) => q.role === 'chamber')!;
    const lastHall = K!.rooms.filter((q) => q.role === 'hall').sort((a, b) => b.path - a.path)[0];
    assert.ok(K!.ways.some((w) => w.a === K!.rooms.indexOf(lastHall) && w.b === K!.rooms.indexOf(chamber)), `${seed}: the bedchamber off the hall before the throne`);
    assert.equal(f.rooms[K!.rooms.find((q) => q.role === 'barracks')!.room].kind, 'guardian', `${seed}: the barracks the lair`);
    // (3) reached; packs; portcullises; murder holes
    const seen = walkReach(L.walk, f.w, f.h, Math.floor(f.start.y) * f.w + Math.floor(f.start.x));
    for (let i = 0; i < f.w * f.h; i++) if (L.walk[i] === 1) assert.ok(seen[i], `${seed}: tile ${i % f.w},${Math.floor(i / f.w)} reached`);
    for (const p of f.packs) for (const q of K!.rooms) if (['bailey', 'gate', 'throne', 'beyond'].includes(q.role)) assert.ok(!inR(q.r, p.x, p.y), `${seed}: no pack in the ${q.role}`);
    for (const p of K!.portcullises) {
      const q = K!.rooms.find((r) => r.role === 'hall' && inR(r.r, p.x, p.y));
      assert.ok(q, `${seed}: a portcullis in a hall`);
      assert.equal(p.n, p.alongX ? q!.r[2] - q!.r[0] : q!.r[3] - q!.r[1], `${seed}: right across it`);
      for (let k = 0; k < p.n; k++) {
        const [x, y] = p.alongX ? [p.x + k, p.y] : [p.x, p.y + k];
        assert.ok(!K!.ways.some((w) => inR([w.r[0] - 2, w.r[1] - 2, w.r[2] + 2, w.r[3] + 2], x, y)), `${seed}: clear of the doorways`);
        assert.ok(L.props.some((o) => o.name === KP_PIECE.portcullis && o.tx === x && o.ty === y && !o.solid), `${seed}: its tile laid, up`);
      }
    }
    assert.ok(K!.portcullises.length >= 1, `${seed}: a portcullis`);
    const gate = K!.rooms.find((q) => q.role === 'gate')!;
    assert.ok((f.hazards ?? []).length >= 2, `${seed}: murder holes`);
    for (const h of f.hazards ?? []) {
      assert.ok(inR(gate.r, h.x, h.y), `${seed}: a murder hole in the gate passage`);
      assert.equal(f.tiles[h.y * f.w + h.x], T_FLOOR);
    }
    // (4) the dressing
    const walk = K!.rooms.find((q) => q.role === 'walk')!;
    const wx = walk.r[2] - walk.r[0] >= walk.r[3] - walk.r[1];
    const bat = L.props.filter((p) => p.name === KP_PIECE.battlements);
    assert.ok(bat.length >= 15, `${seed}: battlements along the walk (${bat.length})`);
    for (const b of bat) assert.ok(wx ? b.ty === walk.r[1] && b.variant === 0 : b.tx === walk.r[0] && b.variant === 1, `${seed}: on its far row`);
    const throne = L.props.find((p) => p.name === KP_PIECE.throne)!;
    assert.ok(throne && throne.solid, `${seed}: the throne on its dais`);
    for (const p of L.props) if (p.solid && inR([hall.r[0] + 2, hall.r[1] + 2, hall.r[2] - 2, hall.r[3] - 2], p.tx, p.ty)) assert.fail(`${seed}: ${p.name ?? p.kind} in the throne hall's floor`);
    for (const n of [KP_PIECE.bed, KP_PIECE.cushion, KP_PIECE.songbird]) assert.ok(L.props.some((p) => p.name === n && inR(chamber.r, p.tx, p.ty)), `${seed}: ${n} in the bedchamber`);
    const bailey = K!.rooms.find((q) => q.role === 'bailey')!;
    const doors = L.props.find((p) => p.name === KP_PIECE.doors);
    assert.ok(doors && (doors.variant >> 1) === 1 && (doors.ty === bailey.r[1] || doors.tx === bailey.r[0]), `${seed}: the great doors open in the bailey's far wall`);
  }
}));

test('off, nothing of it: floor 19 not laid', () => {
  assert.equal(HIGH_CITY.on, false);
});
