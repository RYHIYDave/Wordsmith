// FLOOR 9'S TWO SIDE AREAS, DRESSED FOR ITS SIDE BOSSES (game/f9_lairs.ts, F9_LAIRS, off; art/f9_lairs.ts;
// docs/mockups/f9_side_bosses/README.md): the trolls' camp in the lair, its guardians at its way in; the misty glade in the side area.
// @ts-ignore
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { F9_LAIRS, LAIR9, mouthOf } from '../src/game/f9_lairs';
import { blobDist } from '../src/game/act1_layout';
import { Game } from '../src/game/game';
import { f9LairPieces } from '../src/art/f9_lairs';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();

const CAMP = ["the trolls' barricade", "the trolls' palisade", 'a skull pole', "the trolls' fire", "the chieftain's seat", "a troll's lean-to", 'gnawed bones'];
const GLADE = ['the moonbeam', 'mist, lying', 'a white dead tree', 'a standing stone, clawed', 'moonflowers', "a deer's bones, picked clean"];

const floor9 = (seed: number, on: boolean): Game => {
  const was = F9_LAIRS.on;
  F9_LAIRS.on = on;
  try {
    const g = new Game('warrior', seed);
    g.depth = 9;
    g.cleared = 8;
    g.wayDepth = 9;
    g.enterDungeon();
    return g;
  } finally {
    F9_LAIRS.on = was;
  }
};

test('the switch is on at his yes (14 Nov 2026); off, floor 9 has nothing of the camp or the glade', () => {
  assert.equal(F9_LAIRS.on, true);
  for (const seed of [9, 4]) {
    const names = new Set(floor9(seed, false).level.props.map((p) => p.name));
    for (const n of [...CAMP, ...GLADE]) assert.ok(!names.has(n), `seed ${seed}: no ${n}`);
  }
});

test('ON: the lair grown to a boss room and dressed as the trolls\' camp, its guardians just inside its way in; the side area the misty glade, no pack of the floor\'s in it', () => {
  for (const seed of [9, 4, 17]) {
    const g = floor9(seed, true);
    const L = g.level;
    const land = L.land!;
    const lair = land.areas.find((a) => a.role === 'lair');
    const side = land.areas.find((a) => a.role === 'side');
    assert.ok(lair && side, `seed ${seed}: a lair and a side area`);
    assert.equal(lair!.blob.rx, LAIR9.rx, `seed ${seed}: the lair a boss's room`);
    const inside = (b: typeof lair, p: { x: number; y: number }, slack = 1.1): boolean => blobDist(b!.blob, p.x, p.y) < slack;
    const props = L.props.filter((p) => p.name);
    for (const n of CAMP) assert.ok(props.some((p) => p.name === n && inside(lair, p)), `seed ${seed}: ${n} in the camp`);
    for (const n of ['the moonbeam', 'a standing stone, clawed', 'a white dead tree', 'mist, lying']) assert.ok(props.some((p) => p.name === n && inside(side, p)), `seed ${seed}: ${n} in the glade`);
    // (nothing of the camp in the glade, or of the glade in the camp)
    for (const p of props) {
      if (CAMP.includes(p.name!)) assert.ok(inside(lair, p, 1.25), `seed ${seed}: ${p.name} at ${p.tx},${p.ty} in the camp`);
      if (GLADE.includes(p.name!)) assert.ok(inside(side, p, 1.25), `seed ${seed}: ${p.name} at ${p.tx},${p.ty} in the glade`);
    }
    // (two barricades at least, either side of the way in; the seat behind the fire from the way in)
    const m = mouthOf(lair!.blob, land.lanes);
    const bars = props.filter((p) => p.name === "the trolls' barricade");
    assert.ok(bars.length >= 2, `seed ${seed}: barricades`);
    const sideOf = (p: { x: number; y: number }): number => Math.sign((p.x - lair!.blob.x) * -m.uy + (p.y - lair!.blob.y) * m.ux);
    assert.ok(new Set(bars.map(sideOf)).size === 2, `seed ${seed}: barricades either side of the way in`);
    const seat = props.find((p) => p.name === "the chieftain's seat")!;
    assert.ok((seat.x - lair!.blob.x) * m.ux + (seat.y - lair!.blob.y) * m.uy < 0, `seed ${seed}: the seat at the camp's back`);
    // (the guardians: champions, toward the way in from the middle)
    const guards = g.monsters.filter((q) => !q.dead && q.champion && inside(lair, q, 1.2));
    assert.ok(guards.length >= 2, `seed ${seed}: guardians in the camp`);
    const toward = guards.reduce((s, q) => s + (q.x - lair!.blob.x) * m.ux + (q.y - lair!.blob.y) * m.uy, 0) / guards.length;
    assert.ok(toward > 0.5, `seed ${seed}: the guardians toward the way in (${toward.toFixed(2)})`);
    // (no pack of the floor's in the glade)
    assert.ok(!g.monsters.some((q) => !q.dead && !q.boss && q.kind !== 'mistwolf' && inside(side, q, 0.9)), `seed ${seed}: the glade empty of packs (but its own boss, the mist wolf)`);
    // (the way in to the camp walkable from its mouth to the fire)
    const fire = props.find((p) => p.name === "the trolls' fire")!;
    for (let k = 0.95; k > 0.25; k -= 0.1) {
      const x = Math.floor(lair!.blob.x + m.ux * m.edge * k);
      const y = Math.floor(lair!.blob.y + m.uy * m.edge * k);
      assert.equal(L.walk[y * L.floor.w + x], 1, `seed ${seed}: the way in open at ${x},${y} (the fire at ${fire.tx},${fire.ty})`);
    }
  }
});

test('THE PIECES: each has its pictures, crisp (no half-seen pixel), with nothing cyan of the friend\'s on them', () => {
  for (const pc of f9LairPieces()) {
    assert.ok(pc.frames && pc.frames.length > 0, `${pc.name}: pictures`);
    for (const fr of pc.frames!) {
      const p = fr.img as unknown as { w: number; h: number; d: Uint8ClampedArray };
      let seen = 0;
      for (let i = 0; i < p.w * p.h; i++) {
        const a = p.d[i * 4 + 3];
        if (a === 0) continue;
        assert.equal(a, 255, `${pc.name}: a pixel half seen`);
        seen++;
        const [r, gg, b] = [p.d[i * 4], p.d[i * 4 + 1], p.d[i * 4 + 2]];
        assert.ok(!(b > 180 && gg > 180 && r < 120), `${pc.name}: a cyan pixel (${r}, ${gg}, ${b})`);
      }
      assert.ok(seen > 40, `${pc.name}: something drawn`);
    }
  }
});
