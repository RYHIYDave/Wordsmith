// THE STOKER'S ARENA OFF FLOOR 3 (game/furnace_arena.ts): his word, 6 Nov 2026, 16:29: “The stoker and his area is done.  I’d like
// a little hallway leading to his arena tho.  Not a door into it like a stronghold.”
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { ARENA, carveArena } from '../src/game/furnace_arena';
import { generateFloor } from '../src/game/dungeon';
import { doorTiles } from '../src/game/doors';
import { T_FLOOR, T_WALL } from '../src/game/types';

test('on every floor 3 tried, an arena at the end of a short hallway: open floor all the way, walled round, no doorway in it', () => {
  for (let seed = 1; seed <= 25; seed++) {
    const f = generateFloor(3, seed * 7919 + 3 * 104729);
    const before = new Uint8Array(f.tiles);
    const a = carveArena(f);
    assert.ok(a, `seed ${seed}: an arena`);
    const T = (x: number, y: number): number => f.tiles[y * f.w + x];
    const { room: R, hall: H } = a!;
    assert.equal(R.w, ARENA.side);
    assert.equal(R.h, ARENA.side);
    for (let y = R.y; y < R.y + R.h; y++) for (let x = R.x; x < R.x + R.w; x++) assert.equal(T(x, y), T_FLOOR, `seed ${seed}: its floor`);
    for (let y = H.y; y < H.y + H.h; y++) for (let x = H.x; x < H.x + H.w; x++) assert.equal(T(x, y), T_FLOOR, `seed ${seed}: the hallway open`);
    assert.equal(Math.max(H.w, H.h), ARENA.hall + 2, 'a little hallway: its length and the two walls opened');
    // (walled round: every tile beside its floor is floor of it or of the hallway, or wall)
    for (let y = R.y - 1; y <= R.y + R.h; y++) for (let x = R.x - 1; x <= R.x + R.w; x++) {
      const inside = x >= R.x && x < R.x + R.w && y >= R.y && y < R.y + R.h;
      const hall = x >= H.x && x < H.x + H.w && y >= H.y && y < H.y + H.h;
      if (!inside && !hall) assert.equal(T(x, y), T_WALL, `seed ${seed}: walled at ${x},${y}`);
    }
    // (no doorway where the hallway was cut: no door in it)
    const hallTiles = new Set<number>();
    for (let y = H.y; y < H.y + H.h; y++) for (let x = H.x; x < H.x + H.w; x++) hallTiles.add(y * f.w + x);
    for (const d of f.doors ?? []) for (const i of doorTiles(f, d)) assert.ok(!hallTiles.has(i), `seed ${seed}: no door in the hallway`);
    // (only nothing was built on: what was floor or wall before, outside its opening, is as it was)
    let changed = 0;
    for (let i = 0; i < before.length; i++) if (before[i] !== 0 && before[i] !== f.tiles[i] && !hallTiles.has(i)) changed++;
    assert.equal(changed, 0, `seed ${seed}: nothing of the floor built over`);
    // (the furnace in a wall of it; the crank and he on its floor)
    const s = a!.furnace;
    assert.ok(s.alongX ? s.plane === R.y && s.a >= R.x && s.a + 4 <= R.x + R.w : s.plane === R.x && s.a >= R.y && s.a + 4 <= R.y + R.h, 'the furnace in a back wall');
    for (const p of [a!.crank, a!.keeper]) assert.equal(T(Math.floor(p.x), Math.floor(p.y)), T_FLOOR);
  }
});
