// THE WALLS (Version 18.4): taller, fading into the dark at the top, and none toward the eye.
//
// The owner, 7 Oct 2026, 11:32: "Now that we have varying levels of height, the walls suddenly
// increasing or decreasing in height is jarring. Also I don't like being able to see the tops of
// the walls. I'd like a solution before we decorate the dungeon so we have a better idea of what
// we can and can't fit on the walls". Three ways were sent to him as a picture (13:29) and he
// chose the third (13:39: "3"). Its pictures in the town, in a corridor across the screen, in an
// eight-sided hall and beside a doorway went to him at 14:46 with the question "Good to put
// out?", and at 14:55 he said: "Good".
//
// The look (src/art/ground.ts, WALLS_FADING) and its two rules (src/render/walls.ts), held here:
//   - the look in force is the one he chose; the look the game had is kept beside it;
//   - A WALL IS ITS FACES ALONE: one side of a block each, 40 game pixels high, with no top; the
//     one turned to screen-left lit, the one turned to screen-right in shade; its top 12 pixels
//     fade out in four steps, and below them it is solid;
//   - the flat wall across a cut tile is one face the whole width of the tile, fading the same;
//     over raised floor only its top part stands, so that the walls keep ONE TOP LINE;
//   - a block's face is painted only if floor lies before it;
//   - a wall is LEFT OUT if floor lies right behind it, or one tile behind and one to the side;
//   - NO WALL STANDS IN FRONT OF FLOOR: in many dungeons, every face that would be painted is
//     walked point by point, and under its solid part there is never floor: the room's own,
//     raised or sunken (but, since Version 18.5, the stone beside a door in a back wall, which
//     stands so that the wall reaches the door's frame);
//   - where no wall stands toward the eye, the floor's edge is a thin line of light.
//   run: tsx --test tests/walls.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { VAULT, WALLS_BLOCKS, WALLS_FADING, WALL_LOOK, makeGroundArt, setWallLook } from '../src/art/ground';
import type { WallLook } from '../src/art/ground';
import { GRAIN } from '../src/art/kit';
import { LEDGE_H, LOW_WALL_H, WALL_H } from '../src/engine/iso';
import { rgba } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { doorPiers } from '../src/game/doors';
import { generateFloor } from '../src/game/dungeon';
import { levelAt } from '../src/game/height';
import { CUT_FAR, CUT_LEFT, CUT_NEAR_LOW, CUT_RIGHT, T_FLOOR, T_PIT, T_VOID, T_WALL } from '../src/game/types';
import type { Floor } from '../src/game/types';
import { FACE_LEFT, FACE_RIGHT, wallFaces, wallsAway } from '../src/render/walls';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

/** A tile in picture pixels. */
const TW = 32 * GRAIN;
const TH = 16 * GRAIN;
/** The look he chose, in picture pixels: how high a wall is, and how much of its top fades out. */
const TALL = WALLS_FADING.tall * GRAIN;
const FADE = WALLS_FADING.fade * GRAIN;
/** How much of a face is seen, row by row down from its top, in the four steps of its fading (255: all of it). */
const STEPS = [0.14, 0.38, 0.62, 0.84].map((a) => Math.round(255 * a));

/** The ground's pictures as they are painted under a look; the look in force is put back after. */
function paintedUnder(look: Readonly<WallLook>): ReturnType<typeof makeGroundArt> {
  const was = { ...WALL_LOOK };
  setWallLook(look);
  try {
    return makeGroundArt();
  } finally {
    setWallLook(was);
  }
}
const GROUND = paintedUnder(WALLS_FADING);

/** How much of a pixel of a painting is seen: 0 (not painted) to 255. */
const seen = (s: Sprite, x: number, y: number): number => {
  const p = paintingOf(s);
  return p.inside(x, y) ? p.d[(y * p.w + x) * 4 + 3] : 0;
};
/** How light a colour is, 0..255. */
function light(c: string): number {
  const v = rgba(c);
  return 0.3 * v[0] + 0.59 * v[1] + 0.11 * v[2];
}
/** The lowest row of a tile's diamond that holds column x (art/ground.ts, bottomRow): a block's faces hang from there. */
const edgeRow = (x: number): number => Math.floor(((x < TW / 2 ? x : TW - 1 - x) + TW / 2 - 1) / 2);

test('the look in force is the one he chose (the owner, 7 Oct 2026, 14:55, of its pictures and "Good to put out?": "Good"); the look the game had is kept', () => {
  assert.deepEqual({ ...WALL_LOOK }, { ...WALLS_FADING }, 'the game starts with the fading walls');
  assert.deepEqual({ ...WALLS_FADING }, { tall: 40, cap: 'dark', fade: 12, level: true, front: 'none', away: true, faces: true });
  // (taller than the walls were, by two courses of stones; and more of it solid than a whole wall was high)
  assert.equal(WALLS_FADING.tall - WALL_H, 16);
  assert.ok(WALLS_FADING.tall - WALLS_FADING.fade > WALL_H);
  // the look until Version 18.3, should he want it back: blocks with a lit capstone, cut down low toward the eye
  assert.deepEqual({ ...WALLS_BLOCKS }, { tall: WALL_H, cap: 'lit', fade: 0, level: false, front: 'low', away: false, faces: false });
  assert.equal(WALL_H, 24);
  assert.equal(LOW_WALL_H, 8);
});

test('a wall is its faces alone: one side of a block, 40 pixels high, with no top; lit on the left and in shade on the right', () => {
  assert.ok(GROUND.faceLeft.length >= 3, 'several faces to choose from, as there were several walls');
  assert.equal(GROUND.faceLeft.length, GROUND.faceRight.length);
  for (const [list, left] of [[GROUND.faceLeft, true], [GROUND.faceRight, false]] as const) {
    for (const s of list) {
      const p = paintingOf(s);
      assert.equal(p.w, TW);
      assert.equal(p.h, TH + TALL);
      assert.equal(s.ax, 16);
      assert.equal(s.ay, WALLS_FADING.tall, 'it stands with the diamond of its foot on its tile, as a block did');
      for (let x = 0; x < TW; x++) {
        const mine = x >= 1 && x <= TW - 2 && x < TW / 2 === left;
        const edge = edgeRow(x);
        for (let y = 0; y < p.h; y++) {
          // (its one face hangs from the lower edge of where the block's top was, whole, down to its foot: and nothing else is painted)
          const want = mine && y > edge && y <= edge + TALL;
          if (p.has(x, y) !== want) assert.ok(false, `${left ? 'the left face' : 'the right face'}: ${want ? 'a hole' : 'paint where none belongs'} at ${x},${y}`);
        }
      }
    }
  }
  // (the light is from the upper left: the face turned to screen-left is the middle tone, the other is in shade)
  const mean = (s: Sprite): number => {
    const p = paintingOf(s);
    let sum = 0;
    let n = 0;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const c = p.get(x, y);
      if (c !== null) { sum += light(c); n++; }
    }
    return sum / n;
  };
  for (let i = 0; i < GROUND.faceLeft.length; i++) {
    const l = mean(GROUND.faceLeft[i]);
    const r = mean(GROUND.faceRight[i]);
    assert.ok(l > r * 1.3, `the left face is lighter than the right (${l.toFixed(1)} against ${r.toFixed(1)})`);
  }
  // and each is in its own tones of the theme's stone
  const lit = new Set<string>(VAULT.lit);
  const shade = new Set<string>(VAULT.shade);
  for (const s of GROUND.faceLeft) { const p = paintingOf(s); for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) { const c = p.get(x, y); if (c !== null) assert.ok(lit.has(c), `${c} is one of the lit stone's tones`); } }
  for (const s of GROUND.faceRight) { const p = paintingOf(s); for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) { const c = p.get(x, y); if (c !== null) assert.ok(shade.has(c), `${c} is one of the shaded stone's tones`); } }
});

test('the top 12 pixels of a wall fade out in four steps, and below them it is solid', () => {
  assert.equal(FADE % 4, 0, 'four steps of whole rows');
  const step = FADE / 4;
  for (const s of [...GROUND.faceLeft, ...GROUND.faceRight]) {
    for (let x = 1; x <= TW - 2; x++) {
      const edge = edgeRow(x);
      if (seen(s, x, edge + 1) === 0) continue; // (the other half of the tile: not this face)
      for (let k = 0; k < TALL; k++) {
        const want = k < FADE ? STEPS[Math.floor(k / step)] : 255;
        if (seen(s, x, edge + 1 + k) !== want) assert.ok(false, `column ${x}, ${k} rows below its top: seen ${seen(s, x, edge + 1 + k)} of 255, not ${want}`);
      }
    }
  }
  // (each step is plainly fainter than the next: the top of a wall is lost in the dark, not cut off)
  for (let i = 1; i < STEPS.length; i++) assert.ok(STEPS[i] - STEPS[i - 1] >= 50);
  assert.ok(STEPS[0] < 40 && STEPS[3] > 200);
});

test('the flat wall across a cut tile is one face the whole width of the tile, fading the same; over raised floor its top part alone stands: one top line', () => {
  const tall = GROUND.part.far.tall;
  const mid = GROUND.part.far.mid;
  const step = FADE / 4;
  for (const [s, rows, what] of [[tall, TALL, 'the whole flat wall'], [mid, TALL - LEDGE_H * GRAIN, 'the flat wall over raised floor']] as const) {
    const p = paintingOf(s);
    assert.equal(p.w, TW);
    assert.equal(s.ax, 16);
    assert.equal(s.ay * GRAIN, rows, `${what} stands ${rows / GRAIN} game pixels over its line`);
    for (let x = 0; x < TW; x++) {
      for (let y = 0; y < p.h; y++) {
        // (it stands on the line across the middle of its tile, from edge to edge of the tile: nothing is behind it to fill a seam)
        const k = y - TH / 2;
        const want = k < 0 || k >= rows ? 0 : k < FADE ? STEPS[Math.floor(k / step)] : 255;
        if (seen(s, x, y) !== want) assert.ok(false, `${what}: at ${x},${y} seen ${seen(s, x, y)} of 255, not ${want}`);
      }
    }
  }
  // ONE TOP LINE: raised floor is drawn LEDGE_H higher, and the wall over it is that much shorter
  assert.equal(mid.ay + LEDGE_H, tall.ay);
  assert.equal(tall.ay, WALLS_FADING.tall);
});

/** A small level by hand: rows of letters. `.` floor, `#` wall, `_` a pit, space nothing; a digit is a FLOOR tile cut that way (1 far, 3 left, 4 right, 6 near and low). */
function byHand(rows: string[]): Floor {
  const w = rows[0].length;
  const h = rows.length;
  const tiles = new Uint8Array(w * h);
  const cut = new Uint8Array(w * h);
  rows.forEach((row, y) => {
    assert.equal(row.length, w);
    [...row].forEach((ch, x) => {
      const i = y * w + x;
      if (ch === '.') tiles[i] = T_FLOOR;
      else if (ch === '#') tiles[i] = T_WALL;
      else if (ch === '_') tiles[i] = T_PIT;
      else if (ch === ' ') tiles[i] = T_VOID;
      else { tiles[i] = T_FLOOR; cut[i] = Number(ch); }
    });
  });
  return { w, h, tiles, cut } as unknown as Floor;
}

test('a face of a block is painted only if floor lies before it', () => {
  // (the block is the middle tile: floor at (x, y + 1), down the screen to the left, shows its left face; at (x + 1, y), its right face)
  const faces = (rows: string[]): number => wallFaces(byHand(rows), 1 * 3 + 1);
  assert.equal(faces(['###', '###', '###']), 0, 'walled in: nothing of it is seen');
  assert.equal(faces(['   ', ' # ', '   ']), 0, 'alone in the dark: nothing');
  assert.equal(faces(['###', '###', '#.#']), FACE_LEFT);
  assert.equal(faces(['###', '##.', '###']), FACE_RIGHT);
  assert.equal(faces(['###', '##.', '#.#']), FACE_LEFT + FACE_RIGHT, 'a corner that juts into a room shows both');
  assert.equal(faces(['#.#', '.##', '###']), 0, 'floor BEHIND it (up the screen) shows no face: those sides are turned away');
  assert.equal(faces(['###', '##_', '#_#']), FACE_LEFT + FACE_RIGHT, 'a pit is open ground too');
  // a tile cut corner to corner counts only if its FLOOR half lies along the block's edge
  assert.equal(CUT_FAR, 1);
  assert.equal(CUT_LEFT, 3);
  assert.equal(CUT_RIGHT, 4);
  assert.equal(CUT_NEAR_LOW, 6);
  assert.equal(faces(['###', '##1', '#1#']), 0, 'a tile whose far half is wall turns wall to both blocks behind it');
  assert.equal(faces(['###', '###', '#3#']), FACE_LEFT, 'the tile below, its left half wall: its floor half is along the block');
  assert.equal(faces(['###', '###', '#4#']), 0, 'the tile below, its right half wall: that half is along the block');
  assert.equal(faces(['###', '##4', '###']), FACE_RIGHT, 'the tile beside, its right half wall: its floor half is along the block');
  assert.equal(faces(['###', '##3', '###']), 0, 'the tile beside, its left half wall: that half is along the block');
  assert.equal(faces(['###', '##6', '#6#']), FACE_LEFT + FACE_RIGHT, 'a tile whose near half is (low) wall has its floor along both');
});

test('a wall is left out if floor lies right behind it, or one tile behind and one to the side; and stands otherwise', () => {
  // one wall in the dark and one tile of floor a tiles to the upper left of it (x - a) and b to the upper right (y - b)
  const one = (a: number, b: number, flat: boolean): boolean => {
    const N = 9;
    const rows: string[] = [];
    for (let y = 0; y < N; y++) {
      let r = '';
      for (let x = 0; x < N; x++) r += x === 6 && y === 6 ? (flat ? '1' : '#') : x === 6 - a && y === 6 - b ? '.' : ' ';
      rows.push(r);
    }
    return wallsAway(byHand(rows), WALLS_FADING)[6 * N + 6] === 1;
  };
  const out: string[] = [];
  const outFlat: string[] = [];
  for (let b = 0; b <= 4; b++) for (let a = 0; a <= 4; a++) {
    if (a + b === 0) continue;
    if (one(a, b, false)) out.push(`${a},${b}`);
    if (one(a, b, true)) outFlat.push(`${a},${b}`);
  }
  // (a face's solid part is 28 pixels high: it reaches over the tile right behind its block, and
  // over the near corner of the tile one further to a side; a tile two straight behind it is clear)
  assert.deepEqual(out.sort(), ['0,1', '1,0', '1,1', '1,2', '2,1']);
  // (the flat wall across a cut tile stands half a tile further back; the tile right behind it is its own back, and is never floor)
  assert.deepEqual(outFlat.sort(), ['1,2', '2,1', '2,2']);
  // floor in FRONT of a wall, or beside it, takes nothing away: that is what a back wall is
  for (const rows of [['   ', ' # ', ' . '], ['   ', ' #.', '   '], ['   ', ' #.', ' ..']]) assert.equal(wallsAway(byHand(rows), WALLS_FADING)[4], 0);
  // the look the game had cut a wall down only for floor right behind it, and left none out: its grid is the level's own
  const old = (a: number, b: number): boolean => {
    const N = 9;
    const rows: string[] = [];
    for (let y = 0; y < N; y++) {
      let r = '';
      for (let x = 0; x < N; x++) r += x === 6 && y === 6 ? '#' : x === 6 - a && y === 6 - b ? '.' : ' ';
      rows.push(r);
    }
    return wallsAway(byHand(rows), { ...WALLS_BLOCKS, away: true })[6 * N + 6] === 1;
  };
  // (asked all the same: a block 24 high with a top hides the tile right behind it and the one two straight behind)
  assert.ok(old(1, 1) && old(2, 2) && old(1, 0) && old(0, 1) && !old(3, 3));
});

test('no wall stands in front of floor, but the stone beside a door in a back wall: every face that is painted, walked point by point in sixty dungeons, at every height of floor', () => {
  const look = WALLS_FADING;
  const solid = look.tall - look.fade;
  let faces = 0;
  let flats = 0;
  let away = 0;
  let stand = 0;
  let backs = 0;
  let backsOut = 0;
  let doorStone = 0;
  const hidden: string[] = [];
  for (let depth = 1; depth <= 6; depth++) {
    for (let seed = 1; seed <= 10; seed++) {
      const f = generateFloor(depth, seed * 7 + depth);
      const inside = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < f.w && y < f.h;
      const cut = (x: number, y: number): number => (f.cut && inside(x, y) ? f.cut[y * f.w + x] : 0);
      const low = wallsAway(f, look);
      // (DOORS, Version 18.5: of the stone on either side of a door, the one a back wall runs on into stands
      // whatever it hides, so that the wall reaches the door's frame: render/walls.ts. It is the one wall that may.)
      const beside = new Set<number>();
      for (const d of f.doors ?? []) if (d.kind === 'door' && !d.near) beside.add(doorPiers(f, d)[0]);
      // What floor, if any, is seen at a point of the screen `foot - Yp` above a wall's foot. Raised
      // floor is drawn LEDGE_H higher than the ground it is, sunken floor LEDGE_H lower, a stair
      // in between: so the point is asked of the ground at each height it could be showing.
      const floorSeen = (X: number, Yp: number, foot: number): string | null => {
        for (let lv = -1; lv <= 1.001; lv += 0.25) {
          const gy = Yp + LEDGE_H * lv;
          if (gy >= foot - 0.01) continue; // (ground in front of the wall's foot: there the floor hides the wall, not the wall the floor)
          const wx = (X / 16 + gy / 8) / 2;
          const wy = (gy / 8 - X / 16) / 2;
          const tx = Math.floor(wx);
          const ty = Math.floor(wy);
          if (!inside(tx, ty) || f.tiles[ty * f.w + tx] !== T_FLOOR) continue;
          const c = cut(tx, ty);
          if (c !== 0) {
            // (game/cut.ts: which half of a cut tile is wall)
            const u = wx - tx;
            const v = wy - ty;
            const k = c > 4 ? c - 4 : c;
            const into = k === 1 ? 1 - u - v : k === 2 ? u + v - 1 : k === 3 ? v - u : u - v;
            if (into >= -0.02) continue;
          }
          if (Math.abs(levelAt(f, wx, wy) - lv) > 0.13) continue;
          return lv > 0.1 ? 'raised floor' : lv < -0.1 ? 'sunken floor' : 'floor';
        }
        return null;
      };
      for (let y = 0; y < f.h; y++) {
        for (let x = 0; x < f.w; x++) {
          const i = y * f.w + x;
          const px = (x - y) * 16;
          const py = (x + y) * 8;
          if (f.tiles[i] === T_WALL && cut(x, y) === 0) {
            // (a back wall: one with whole floor before it, as a player meets it)
            const back = (inside(x, y + 1) && f.tiles[i + f.w] === T_FLOOR) || (inside(x + 1, y) && f.tiles[i + 1] === T_FLOOR);
            if (back) backs++;
            if (low[i]) {
              away++;
              if (back) backsOut++;
              continue;
            }
            stand++;
            if (beside.has(i)) {
              doorStone++;
              continue;
            }
            const which = wallFaces(f, i);
            for (const left of [true, false]) {
              if (!(which & (left ? FACE_LEFT : FACE_RIGHT))) continue;
              faces++;
              let bad: string | null = null;
              // (the face turned to screen-left hangs from the tile's lower-left edge, the other from its lower-right one: up each column of it, from just over its foot to the top of its solid part)
              for (let u = 0.5; u < 16 && !bad; u += 1) {
                const X = left ? px - u : px + u;
                const foot = py + 16 - u / 2;
                for (let h = 1.5; h < solid && !bad; h += 1) bad = floorSeen(X, foot - h, foot);
              }
              if (bad && hidden.length < 6) hidden.push(`dungeon ${depth}, seed ${seed * 7 + depth}: the ${left ? 'left' : 'right'} face of the wall at ${x},${y} stands over ${bad}`);
            }
          } else if (f.tiles[i] === T_FLOOR && cut(x, y) === CUT_FAR) {
            if (low[i]) {
              away++;
              continue;
            }
            flats++;
            let bad: string | null = null;
            for (let u = -15.5; u < 16 && !bad; u += 1) for (let h = 1.5; h < solid && !bad; h += 1) bad = floorSeen(px + u, py + 8 - h, py + 8);
            if (bad && hidden.length < 6) hidden.push(`dungeon ${depth}, seed ${seed * 7 + depth}: the flat wall at ${x},${y} stands over ${bad}`);
          }
        }
      }
    }
  }
  assert.deepEqual(hidden, [], 'no painted wall stands over floor');
  assert.ok(doorStone > 150 && doorStone < stand * 0.05, `${doorStone} walls beside doors in back walls stand whatever they hide, of ${stand} that stand`);
  // (and this walked a great deal of wall)
  assert.ok(faces > 15000 && flats > 1200, `${faces} faces and ${flats} flat walls walked`);
  assert.ok(stand > 15000 && away > 15000, `${stand} blocks stand and ${away} are left out`);
  // A ROOM KEEPS ITS BACK WALLS: of the walls with floor before them, few are left out (the two beside a doorway in a back wall)
  assert.ok(backsOut > 0 && backsOut < backs * 0.2, `${backsOut} of ${backs} back walls are left out`);
});

test('where no wall stands toward the eye, the floor\'s edge is a thin line of light', () => {
  const lightest = Math.max(...VAULT.slab.map(light));
  const all: [string, Sprite, (x: number, y: number) => boolean][] = [
    // (a tile's lower-left edge, and its lower-right one: in the lower half of the diamond, on that side)
    ['the edge down the screen to the left', GROUND.edgeLeft, (x, y) => y >= TH / 2 - 2 && x <= TW / 2 + 2],
    ['the edge down the screen to the right', GROUND.edgeRight, (x, y) => y >= TH / 2 - 2 && x >= TW / 2 - 2],
    // (the line across a tile cut corner to corner, on its far half: just over the middle row)
    ['the edge of a half tile, across the screen', GROUND.edgeAcross, (_x, y) => y >= TH / 2 - 5 && y <= TH / 2],
    // (the line up and down a tile cut the other way: just left of the middle column, and just right of it)
    ['the edge of a half tile, up the screen, on its left', GROUND.edgeUpLeft, (x) => x >= TW / 2 - 6 && x <= TW / 2 + 1],
    ['the edge of a half tile, up the screen, on its right', GROUND.edgeUpRight, (x) => x >= TW / 2 - 2 && x <= TW / 2 + 6],
  ];
  for (const [what, s, where] of all) {
    const p = paintingOf(s);
    assert.equal(p.w, TW, `${what} is laid over a floor tile`);
    assert.equal(p.h, TH);
    assert.equal(s.ax, 16);
    assert.equal(s.ay, 0);
    let n = 0;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const c = p.get(x, y);
      if (c === null) continue;
      n++;
      assert.ok(where(x, y), `${what}: paint at ${x},${y}, away from that edge`);
      assert.ok(light(c) > lightest, `${what} is lighter than any flagstone (${c})`);
    }
    assert.ok(n >= 24 && n <= 140, `${what} is a thin line (${n} picture pixels of a tile's ${TW * TH / 2})`);
  }
});
