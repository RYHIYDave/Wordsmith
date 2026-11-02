// EVERY WALL STANDING ON FLOORS 1 TO 5, SEEN THROUGH WIDE ROUND WHOEVER IS BEHIND IT (render/walls.ts WHOLE_WALLS; render.ts
// wallVeil). His words, 2 Nov 2026, 18:17: “We really need to figure out how we are going to do walls that block character view and
// apply it to every level.  Cause I hate that some wall sections are still missing from the early floors”; shown it from the game,
// 18:38: “I’m going to go with this for now, but I’m not sure how I feel about it.  I’ll test in game and see”.
//   1. on, by his word;
//   2. on every floor of the first five, no wall that bounds floor is left without a face toward the eye where one is seen: every
//      face painted before is painted still, and the walls toward the eye (nothing before them, the room's floor behind) have
//      theirs; a face with another wall before it never.
//   run: tsx --test tests/whole_walls.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { makeDungeon } from '../src/game/level';
import { T_FLOOR, T_VOID, T_WALL } from '../src/game/types';
import { FACE_LEFT, FACE_RIGHT, WHOLE_WALLS, wallFaces, wholeFaces } from '../src/render/walls';

test('1. on, by his word', () => {
  assert.equal(WHOLE_WALLS.on, true);
  assert.ok(WHOLE_WALLS.across >= 80, 'a wide stretch, not a small window');
  assert.ok(WHOLE_WALLS.faint <= 0.25, 'faint enough to see him through');
});

test('2. every wall toward the eye has its face; every face painted before still is; none with a wall before it', () => {
  for (const depth of [1, 2, 3, 4, 5]) {
    for (const seed of [3, 11]) {
      const L = makeDungeon(depth, seed);
      const f = L.floor;
      let near = 0;
      for (let i = 0; i < f.w * f.h; i++) {
        if (f.tiles[i] !== T_WALL) continue;
        const x = i % f.w;
        const y = (i - x) / f.w;
        const was = wallFaces(f, i);
        const now = wholeFaces(f, i);
        assert.equal(now & was, was, 'every face painted before still is');
        const at = (tx: number, ty: number): number => (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h ? T_VOID : f.tiles[ty * f.w + tx]);
        if (now & FACE_LEFT) assert.notEqual(at(x, y + 1), T_WALL, 'no face with a wall before it');
        if (now & FACE_RIGHT) assert.notEqual(at(x + 1, y), T_WALL, 'no face with a wall before it');
        // (a wall toward the eye: the room's floor behind it, nothing before it)
        if (at(x, y - 1) === T_FLOOR && at(x, y + 1) === T_VOID) {
          assert.ok(now & FACE_LEFT, `floor ${depth}: the wall toward the eye at ${x},${y} stands`);
          near++;
        }
        if (at(x - 1, y) === T_FLOOR && at(x + 1, y) === T_VOID) {
          assert.ok(now & FACE_RIGHT, `floor ${depth}: the wall toward the eye at ${x},${y} stands`);
          near++;
        }
      }
      assert.ok(near > 20, `floor ${depth}: walls toward the eye (${near})`);
    }
  }
});
