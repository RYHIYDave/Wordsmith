// THE WALL BESIDE A DOOR (render/walls.ts, doorWallsBack; a mock-up behind DOOR_WALLS, off). The owner,
// 18 Oct 2026, 08:27: "add the wall sections that are missing on the sides of any door [...] Figure out how to
// fade them or whatever so it doesn’t hide the player, but I don’t like the gaps missing in the walls".
// What stands again: only walls the look left out, only along the line of a door in a back wall, next to the
// doorway and running on from it, never more than four a side; nothing beside a door on a side toward the eye.
// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
import { WALL_LOOK } from '../src/art/ground';
import { doorTiles } from '../src/game/doors';
import { generateFloor } from '../src/game/dungeon';
import { T_WALL } from '../src/game/types';
import { DOOR_WALLS, doorWallsBack, wallFaces, wallsAway } from '../src/render/walls';

const test = nodeTest as unknown as (name: string, fn: () => void) => void;
const assert = nodeAssert as unknown as { ok(v: unknown, m?: string): void; equal(a: unknown, b: unknown, m?: string): void };

test('the switch is off, so the game is as it was', () => {
  assert.equal(DOOR_WALLS.on, false);
  assert.equal(DOOR_WALLS.near, false);
});

test('floors 1 to 5: every wall that stands again was left out, is a wall, and lies on a back-wall door\'s line beside it', () => {
  let back = 0;
  let faced = 0;
  let doors = 0;
  for (let depth = 1; depth <= 5; depth++) {
    for (let seed = 1; seed <= 12; seed++) {
      const f = generateFloor(depth, seed * 7 + depth);
      const away = wallsAway(f, WALL_LOOK);
      const again = doorWallsBack(f, away);
      // where each may stand: a back-wall door's line, up to four tiles out from its doorway
      const allowed = new Set<number>();
      for (const d of f.doors ?? []) {
        if (d.near) continue;
        doors++;
        const t = doorTiles(f, d);
        const step = d.alongX ? 1 : f.w;
        for (let k = -4; k <= 6; k++) allowed.add(t[0] + k * step);
      }
      for (let i = 0; i < again.length; i++) {
        if (!again[i]) continue;
        back++;
        assert.equal(f.tiles[i], T_WALL, `floor ${depth} seed ${seed}: tile ${i} stands again and is not a wall`);
        assert.equal(away[i], 1, `floor ${depth} seed ${seed}: tile ${i} stands again but was not left out`);
        assert.ok(allowed.has(i), `floor ${depth} seed ${seed}: tile ${i} stands again away from any back-wall door`);
        if (wallFaces(f, i)) faced++;
      }
    }
  }
  // (the gaps are there to fill: the doors in back walls have them, and what fills them shows a face)
  assert.ok(doors > 0 && back > 0 && faced > 0, `doors ${doors}, walls stood again ${back}, with a face ${faced}`);
});

test('nothing stands again beside a door on a side toward the eye', () => {
  for (let depth = 1; depth <= 5; depth++) {
    for (let seed = 1; seed <= 12; seed++) {
      const f = generateFloor(depth, seed * 11 + depth);
      const again = doorWallsBack(f, wallsAway(f, WALL_LOOK));
      const backLines = new Set<number>();
      for (const d of f.doors ?? []) {
        if (d.near) continue;
        const t = doorTiles(f, d);
        const step = d.alongX ? 1 : f.w;
        for (let k = -4; k <= 6; k++) backLines.add(t[0] + k * step);
      }
      for (const d of f.doors ?? []) {
        if (!d.near) continue;
        for (const i of doorTiles(f, d)) if (!backLines.has(i)) assert.equal(again[i], 0, `floor ${depth} seed ${seed}: a near door's tile ${i} stands again`);
      }
    }
  }
});
