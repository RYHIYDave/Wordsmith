// THE HIGH CITY, FLOOR 18: THE GLASS GALLERY, laid and dressed (game/act2/glassgallery.ts, behind HIGH_CITY, off). His doc's
// level 18: "long galleries of mirrors and a great glasshouse on the roof"; "mirrored halls and dressing rooms, a chapel of
// stained glass, and the glasshouse of dead orchids under a roof of panes"; its hazards "mirrors that crack and burst into
// shards when anything strikes near them; skylights to fall through to the floor below"; the Queen's floor the Mirror Hall.
// Here, over several throws of the dice:
//   1. its zones are the art's (GG_ZONE), and its pieces' names are floor 18's;
//   2. the floor is laid by its own map-maker: the antechamber, galleries, the chapel and the glasshouse, the Mirror Hall (the
//      boss's, her arena's size and more), the way on beyond it, off its far end clear of her mirror; dressing rooms (the lair
//      among them), a store;
//   3. everything walked is reached from the start; no pack in the antechamber, the Mirror Hall or beyond it; every skylight
//      broken through a pit in a gallery, off its runner;
//   4. tall mirrors on the galleries' far walls, a wall behind each; whole skylights (the trap) on the floor; nothing solid in
//      the Mirror Hall's floor but its edge; the apple in the room before the hall.
//   run: tsx --test tests/act2_glassgallery.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { HIGH_CITY, landOf } from '../src/game/act1';
import { Game } from '../src/game/game';
import { GALLERY_ZONE, GG_PIECE } from '../src/game/act2/glassgallery';
import { GG_ZONE } from '../src/art/glassgallery';
import { act1Pieces } from '../src/render/act1_pieces';
import { walkReach } from '../src/game/act2/housequiet';
import { T_FLOOR, T_PIT } from '../src/game/types';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();
const SEEDS = [1, 3, 4, 8, 11, 17];
function laid(seed: number): Game {
  const g = new Game('warrior', seed);
  g.depth = 18;
  g.cleared = 17;
  g.wayDepth = 18;
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

test('1. its zones are the art\'s, its pieces floor 18\'s', () => {
  assert.deepEqual({ ...GALLERY_ZONE }, { ...GG_ZONE });
  const names = new Set([...act1Pieces(18).keys()]);
  for (const n of Object.values(GG_PIECE)) assert.ok(names.has(n), n);
});

test('2-4. laid by its own map-maker: galleries, chapel, glasshouse, the Mirror Hall the boss\'s; reached; packs; skylights; mirrors; the dressing', () => high(() => {
  for (const seed of SEEDS) {
    const g = laid(seed);
    const L = g.level;
    const f = L.floor;
    const G = L.land?.gallery;
    assert.equal(landOf(18), 'glassgallery');
    assert.equal(L.land?.kind, 'glassgallery', `${seed}: its own map-maker`);
    assert.ok(G, `${seed}: its plan`);
    const roles = G!.rooms.map((q) => q.role);
    for (const r of ['ante', 'gallery', 'chapel', 'glasshouse', 'hall', 'beyond', 'dressing', 'lair', 'store']) assert.ok(roles.includes(r as never), `${seed}: a ${r}`);
    const inR = (r: number[], x: number, y: number): boolean => x >= r[0] && y >= r[1] && x < r[2] && y < r[3];
    const hall = G!.rooms.find((q) => q.role === 'hall')!;
    const long = Math.max(hall.r[2] - hall.r[0], hall.r[3] - hall.r[1]);
    const short = Math.min(hall.r[2] - hall.r[0], hall.r[3] - hall.r[1]);
    assert.ok(long >= 21 && short >= 18, `${seed}: the Mirror Hall her arena's size and more (${long} by ${short})`);
    assert.equal(G!.hall.alongX, hall.r[2] - hall.r[0] >= hall.r[3] - hall.r[1], `${seed}: the hall's long side`);
    assert.equal(f.rooms[hall.room].kind, 'boss');
    assert.ok(inR(hall.r, f.boss.x, f.boss.y), `${seed}: the boss in the Mirror Hall`);
    assert.ok(inR(hall.r, G!.hall.mirror.x, G!.hall.mirror.y), `${seed}: her mirror in her hall`);
    const zoneAt = (x: number, y: number): number => L.land!.zones![Math.floor(y) * f.w + Math.floor(x)];
    assert.equal(zoneAt(G!.hall.x, G!.hall.y), GALLERY_ZONE.MirrorHall, `${seed}: the hall its chequer`);
    for (const role of ['chapel', 'glasshouse'] as const) {
      const q = G!.rooms.find((r) => r.role === role)!;
      assert.equal(zoneAt((q.r[0] + q.r[2]) / 2, (q.r[1] + q.r[3]) / 2), role === 'chapel' ? GALLERY_ZONE.Chapel : GALLERY_ZONE.Glasshouse, `${seed}: the ${role} its own floor`);
    }
    const beyond = G!.rooms.find((q) => q.role === 'beyond')!;
    assert.ok(inR(beyond.r, L.land!.exit.x, L.land!.exit.y), `${seed}: the way on beyond the hall`);
    const out = G!.ways.find((w) => w.b === G!.rooms.indexOf(beyond))!;
    const oc = { x: (out.r[0] + out.r[2]) / 2, y: (out.r[1] + out.r[3]) / 2 };
    assert.ok(Math.hypot(oc.x - G!.hall.mirror.x, oc.y - G!.hall.mirror.y) >= 3.5, `${seed}: the way on clear of her mirror`);
    // (3) reached; packs; holes
    const seen = walkReach(L.walk, f.w, f.h, Math.floor(f.start.y) * f.w + Math.floor(f.start.x));
    for (let i = 0; i < f.w * f.h; i++) if (L.walk[i] === 1) assert.ok(seen[i], `${seed}: tile ${i % f.w},${Math.floor(i / f.w)} reached`);
    for (const p of f.packs) {
      for (const q of G!.rooms) if (q.role === 'ante' || q.role === 'hall' || q.role === 'beyond') assert.ok(!inR(q.r, p.x, p.y), `${seed}: no pack in the ${q.role}`);
    }
    const onRunner = (x: number, y: number): boolean => G!.runners.some((r) => x + 1 > r.x && x < r.x + r.w && y + 1 > r.y && y < r.y + r.h);
    for (let i = 0; i < f.w * f.h; i++) {
      if (!G!.holes[i]) continue;
      const x = i % f.w;
      const y = Math.floor(i / f.w);
      assert.equal(f.tiles[i], T_PIT, `${seed}: a hole a pit`);
      assert.ok(G!.rooms.some((q) => q.role === 'gallery' && inR(q.r, x, y)), `${seed}: a hole in a gallery`);
      assert.ok(!onRunner(x, y), `${seed}: a hole off the runner`);
    }
    // (4) mirrors, skylights, the hall's floor, the quest
    const mirrors = L.props.filter((p) => p.name === GG_PIECE.mirror);
    assert.ok(mirrors.length >= 8, `${seed}: mirrors down the galleries (${mirrors.length})`);
    for (const m of mirrors) {
      const [bx, by] = (m.variant & 1) === 0 ? [m.tx, m.ty - 1] : [m.tx - 1, m.ty];
      assert.notEqual(f.tiles[by * f.w + bx], T_FLOOR, `${seed}: a wall behind a mirror`);
    }
    assert.ok((f.hazards ?? []).length >= 2, `${seed}: whole skylights in the floor`);
    for (const h of f.hazards ?? []) assert.equal(f.tiles[h.y * f.w + h.x], T_FLOOR, `${seed}: a skylight on the floor`);
    for (const p of L.props) if (p.solid && inR([hall.r[0] + 2, hall.r[1] + 2, hall.r[2] - 2, hall.r[3] - 2], p.tx, p.ty)) assert.fail(`${seed}: ${p.name} in the Mirror Hall's floor`);
    const apple = L.props.find((p) => p.name === GG_PIECE.apple);
    const pre = G!.rooms.find((q) => q.path === hall.path - 1)!;
    assert.ok(apple && inR(pre.r, apple.tx, apple.ty), `${seed}: the apple in the room before the hall`);
    for (const role of ['chapel', 'glasshouse']) {
      const q = G!.rooms.find((r) => r.role === role)!;
      const want = role === 'chapel' ? GG_PIECE.pew : GG_PIECE.bench;
      assert.ok(L.props.some((p) => p.name === want && inR(q.r, p.tx, p.ty)), `${seed}: ${want}s in the ${role}`);
    }
  }
}));

test('off, nothing of it: floor 18 not laid', () => {
  assert.equal(HIGH_CITY.on, false);
});
