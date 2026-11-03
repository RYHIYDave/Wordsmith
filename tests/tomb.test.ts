// FLOOR 1, THE KING'S TOMB WITH DAYLIGHT, LOOK B (THE ROOTS BREAK IN), MADE GAME-READY (src/art/tomb.ts behind TOMB, off; his
// gate, src/art/tomb_gate.ts behind TOMB_GATE, off; nothing of the game imports them), held to his art rulebook before it goes to
// the main chat: off and imported by nothing of the game; every picture painted, at its size and anchored where the game lays it
// (a floor tile at its top corner, a wall tile at its top corner's floor point with its face hanging to the floor, as high as
// floor 1's walls and on their line column by column, its top fading out as the game's; the ways between the rooms as strips, as
// a gate's arch is; the town's stairs and the stairwell down their size, anchor and shape pixel for pixel); crisp (every pixel all
// there or not at all but the walls' fading tops, in the game's own four steps; a floor tile covering its whole diamond; no pixel
// alone; nothing cut off); nothing cyan (the friend's); the enemy's pink only in his gate's lock and floor 1's own fire; the
// floor and walls darker than the darkest word; light from the upper left; the pilasters every two tiles; the roots meeting at the
// tiles' edges; the daylight's pictures light (pale green-gold, added), the drips falling; floor 1's own pieces in look B's
// colours, their shapes and fire as they were; and his gate: the way the game's three tiles, the lock in embers and alight, the
// drop from up to down, its timing (Movement 9), the slam.
//   run: tsx --test tests/tomb.test.ts

// @ts-ignore
import { readdirSync, readFileSync, statSync } from 'node:fs';
// @ts-ignore
import { join } from 'node:path';
import {
  ARCHWAY, DRIP_FRAMES, FADE_STEPS, HALL_BAYS, ROOT, ROOT_TILES, SLAB_TILES, SUN, TOMB, TOMB_ADDED, TOMB_BAYS, TOMB_FADE, TOMB_LIGHTS, TOMB_OWN,
  TOMB_WALL, gradeColour, inArchway, makeTombArt,
} from '../src/art/tomb';
import {
  TG_LIFT, TG_LOCK, TG_SLAM_FRAMES, TG_WAY, TOMB_GATE, TOMB_GATE_DROP, TOMB_SLAM_AT, makeTombGateArt, tombGateDropAt, tombGateSlam, tombInWay, tombLift,
} from '../src/art/tomb_gate';
import { wardenGates, wardenPieces } from '../src/art/floor1';
import { CRYPT_FLOORS, cryptGround } from '../src/art/crypt';
import { floorStairsUp } from '../src/art/town_ways';
import { makeStairwell } from '../src/art/crypt_ways';
import { stairwellOpens } from '../src/art/stairwell_open';
import { ARCH_WIDE, GATE_UP, PILLAR, SPAN, STRIP } from '../src/art/gates';
import type { Strip } from '../src/art/gates';
import { WALL_LOOK } from '../src/art/ground';
import { WORD_COLOR } from '../src/art/icons';
import { FLAME } from '../src/art/mkit';
import { EMBER } from '../src/art/props';
import { GRAIN } from '../src/art/kit';
import type { Px, Sprite } from '../src/engine/px';
import { SHINES, anchor, count, each, hex, hsv, luma, mean, rgb, sprites, test } from './floor_checks';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const assert: Assert = nodeAssert;

paintWithoutCanvas();
const A = makeTombArt();
const GA = makeTombGateArt();

const floors: [string, Sprite][] = [];
for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) floors.push([`the tomb's flags ${x},${y}`, A.floor(x, y)]);
const walls: [string, Sprite][] = [];
const wallsOf = (n: string, list: Sprite[][], along: string): void => list.forEach((fr, k) => fr.forEach((s, f) => walls.push([`${n} along ${along} ${k} frame ${f}`, s])));
wallsOf("the tomb's wall", A.faceLeft, 'x');
wallsOf("the tomb's wall", A.faceRight, 'y');
wallsOf("his hall's wall", A.hall.faceLeft, 'x');
wallsOf("his hall's wall", A.hall.faceRight, 'y');
const tiles: [string, Sprite][] = A.tiles.flatMap((p) => p.frames!.map((s, f) => [`${p.name} ${f}`, s] as [string, Sprite]));
const ownPieces = A.pieces.filter((p) => (TOMB_OWN as readonly string[]).includes(p.name));
const ownSprites: [string, Sprite][] = ownPieces.flatMap((p) => sprites(p).map((s, i) => [`${p.name} ${i}`, s] as [string, Sprite]));
const solidOwn = ownSprites.filter(([n]) => !n.includes('daylight'));
const archways: [string, Sprite][] = [true, false].flatMap((alongX) => A.archway(alongX).map((q, i) => [`the archway ${alongX ? 'along x' : 'along y'} ${i}`, q.s] as [string, Sprite]));
const place: [string, Sprite][] = [...floors, ...tiles, ...walls, ...ownSprites];
const floorLike: Sprite[] = [...floors.map(([, s]) => s), ...tiles.map(([, s]) => s)];
const FIRE = new Set(EMBER.map((c) => c.toLowerCase()));
const FLAMES = new Set(FLAME.map((c) => c.toLowerCase()));
const isFire = (r: number, g: number, b: number): boolean => FIRE.has(hex(r, g, b));
const cyanIn = (s: Sprite): string[] => {
  const out = new Set<string>();
  each(s, (r, g, b) => {
    const [h, sa, v] = hsv(r, g, b);
    if (h >= 160 && h <= 205 && sa > 0.3 && v > 0.4) out.add(hex(r, g, b));
  });
  return [...out];
};
const isPink = (r: number, g: number, b: number): boolean => {
  const [h, sa, v] = hsv(r, g, b);
  return h >= 290 && h <= 352 && sa > 0.45 && v > 0.3;
};
const pinkIn = (s: Sprite, allowShines: boolean): string[] => {
  const out = new Set<string>();
  each(s, (r, g, b) => {
    const c = hex(r, g, b);
    if (isPink(r, g, b) && !(allowShines && SHINES.has(c))) out.add(c);
  });
  return [...out];
};
const edgeCount = (p: Px): number => {
  let edge = 0;
  for (let x = 0; x < p.w; x++) edge += (p.has(x, 0) ? 1 : 0) + (p.has(x, p.h - 1) ? 1 : 0);
  for (let y = 0; y < p.h; y++) edge += (p.has(0, y) ? 1 : 0) + (p.has(p.w - 1, y) ? 1 : 0);
  return edge;
};
const sameShape = (a: Sprite, b: Sprite): number => {
  const pa = paintingOf(a);
  const pb = paintingOf(b);
  if (pa.w !== pb.w || pa.h !== pb.h) return Infinity;
  let n = 0;
  for (let k = 3; k < pa.d.length; k += 4) if ((pa.d[k] === 0) !== (pb.d[k] === 0)) n++;
  return n;
};

// (brought into the game by the main chat, 2 Nov 2026, behind the same two switches: the files that bring it in may import it)
const BROUGHT = ['art/films.ts', 'art/floors.ts', 'game/tomb_way.ts', 'main.ts', 'render/render.ts', 'render/tomb.ts'].map((f) => join('src', f));
test("the king's tomb and his gate: off, and nothing of the game imports them but the files that bring them in", () => {
  assert.ok(TOMB.on === false && TOMB_GATE.on === false, 'TOMB and TOMB_GATE are off');
  const found: string[] = [];
  const walk = (d: string): void => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith('.ts') && !p.includes(join('src', 'dev')) && !p.endsWith(join('art', 'tomb.ts')) && !p.endsWith(join('art', 'tomb_gate.ts')) && !BROUGHT.includes(p) && /from '\.\.?\/(art\/)?tomb(_gate)?'/.test(readFileSync(p, 'utf8'))) found.push(p);
    }
  };
  walk('src');
  assert.ok(found.length === 0, `imported by ${found.join(', ')}`);
});

test('every picture painted, the pieces the brief asks for', () => {
  for (const [n, s] of [...place, ...archways]) assert.ok(count(s) > (n.startsWith('water dripping') ? 2 : 8), `${n}: ${count(s)} pixels`);
  const names = A.tiles.map((p) => p.name);
  for (const [n] of ROOT_TILES) assert.ok(names.includes(n), `the tile "${n}"`);
  for (const [n] of SLAB_TILES) assert.ok(names.includes(n), `the tile "${n}"`);
  for (const n of ['a puddle', 'moss', 'fallen leaves and earth', 'fallen leaves']) assert.ok(names.includes(n), `the tile "${n}"`);
  for (const n of TOMB_OWN) assert.ok(A.pieces.some((p) => p.name === n), `the piece "${n}"`);
  for (const p of wardenPieces()) assert.ok(A.pieces.some((q) => q.name === p.name), `floor 1's own "${p.name}"`);
  assert.ok(A.faceLeft.length === 2 * TOMB_BAYS.length && A.faceRight.length === 2 * TOMB_BAYS.length, 'two tiles of wall to every bay, each way');
  assert.ok(A.hall.faceLeft.length === 2 * HALL_BAYS.length && A.hall.faceRight.length === 2 * HALL_BAYS.length, "his hall's: two tiles to every bay");
  for (const list of [A.faceLeft, A.faceRight, A.hall.faceLeft, A.hall.faceRight]) assert.ok(list.every((fr) => fr.length === 4), 'four frames each');
  // the wall's bays: a banner, a wall tomb, a cell, the crown, bare stone; roots in most of them
  const kinds = new Set(TOMB_BAYS.map((b) => b.what));
  for (const k of ['banner', 'tomb', 'cell', 'crown', 'plain']) assert.ok(kinds.has(k as never), `a bay with ${k}`);
  assert.ok(TOMB_BAYS.every((b) => b.roots.length > 0) && TOMB_BAYS.some((b) => b.roots.some((r) => r.end < 0)), 'the roots down every bay, some to the floor');
  assert.ok(A.archway(true).length === 20 && A.archway(false).length === 20, 'the way between rooms: five tiles of strips each way');
});

test("every picture at its size and anchored where the game lays it; the walls as high as floor 1's, on their line column by column, their tops fading as the game's", () => {
  assert.equal(TOMB_WALL, WALL_LOOK.tall * GRAIN, "as high as the game's walls (WALL_LOOK.tall)");
  assert.equal(TOMB_FADE, WALL_LOOK.fade * GRAIN, "their tops fading as far down as the game's (WALL_LOOK.fade)");
  for (const s of floorLike) {
    const q = paintingOf(s);
    assert.ok(q.w === 64 && q.h === 32 && anchor(s)[0] === 32 && anchor(s)[1] === 0 && s.density === GRAIN, 'a floor tile 64 x 32 at its top corner');
  }
  for (const [n, s] of walls) {
    const q = paintingOf(s);
    assert.ok(q.w === 64 && q.h === 32 + TOMB_WALL && anchor(s)[0] === 32 && anchor(s)[1] === TOMB_WALL, `${n}: 64 x ${32 + TOMB_WALL} at the floor point of its top corner`);
    for (let x = 0; x < q.w; x++) {
      let k = 0;
      for (let y = 0; y < q.h; y++) if (q.has(x, y)) k++;
      // (the joint between two tiles' faces left empty, as floor 1's own walls leave it)
      const joint = n.includes('along x') ? x === 0 : x === 63;
      if (joint) assert.equal(k, 0, `${n}: the joint, column ${x}, empty`);
      else if ((n.includes('along x') && x < 32) || (n.includes('along y') && x >= 32)) assert.equal(k, TOMB_WALL, `${n}: column ${x} ${k} high`);
    }
  }
  // (on floor 1's own walls' line: column by column, the same top and the same foot as the game's)
  const G1 = cryptGround(1);
  for (const [ours, theirs] of [[A.faceLeft[0][0], G1.faceLeft[0]], [A.faceRight[1][0], G1.faceRight[0]], [A.hall.faceLeft[3][0], G1.faceLeft[1]], [A.hall.faceRight[2][0], G1.faceRight[1]]] as const) {
    const pa = paintingOf(ours);
    const pb = paintingOf(theirs);
    assert.ok(pa.w === pb.w && pa.h === pb.h && anchor(ours)[0] === anchor(theirs)[0] && anchor(ours)[1] === anchor(theirs)[1], "as big as the game's, anchored as the game's");
    for (let x = 0; x < pa.w; x++) {
      const ends = (p: Px): string => {
        let t = -1;
        let l = -1;
        for (let y = 0; y < p.h; y++) if (p.has(x, y)) {
          if (t < 0) t = y;
          l = y;
        }
        return `${t},${l}`;
      };
      assert.equal(ends(pa), ends(pb), `column ${x}: on the game's own wall's line`);
    }
  }
  for (const alongX of [true, false]) {
    const list = A.archway(alongX);
    assert.deepEqual(list.map((q) => q.t), Array.from({ length: 20 }, (_, i) => -1 + i / 4), 'its strips, a quarter of a tile each');
    for (const q of list) assert.ok(paintingOf(q.s).w === STRIP && q.s.density === GRAIN, "a strip as a gate's");
  }
  const piece = (name: string): Sprite[] => sprites(A.pieces.find((p) => p.name === name)!);
  for (const n of ['a chained tomb, along x', 'a chained tomb, along y', 'a tomb of the court, along x', 'a tomb of the court, along y']) for (const s of piece(n)) assert.ok(anchor(s)[0] === 56 && anchor(s)[1] === 78, `${n}: at the floor point under its middle`);
  for (const s of piece('water dripping')) assert.ok(anchor(s)[0] === 8 && anchor(s)[1] === 176, 'the drip at the floor point it strikes');
  // (every picture of the place's own in whole game pixels: its size and its anchor even, so the game draws it crisp)
  for (const [n, s] of [...ownSprites, ...walls, ...floors, ...tiles]) {
    const q = paintingOf(s);
    assert.ok(q.w % 2 === 0 && q.h % 2 === 0 && anchor(s)[0] % 2 === 0 && anchor(s)[1] % 2 === 0, `${n}: ${q.w} x ${q.h} at (${anchor(s).join(', ')}), whole game pixels`);
  }
  for (const size of ['small', 'middle', 'large']) {
    const pool = piece(`daylight on the floor, ${size}`)[0];
    const pp = paintingOf(pool);
    assert.ok(Math.abs(anchor(pool)[0] - pp.w / 2) <= 1 && Math.abs(anchor(pool)[1] - pp.h / 2) <= 1, `the pool (${size}): at its middle on the floor`);
    for (const s of piece(`a shaft of daylight, ${size}`)) {
      const b = paintingOf(s).bounds()!;
      assert.ok(anchor(s)[1] >= b.y + b.h - 30 && anchor(s)[1] - b.y > 280, `the column (${size}): anchored at its foot, rising ${anchor(s)[1] - b.y}`);
    }
  }
});

test("Pixels 1: crisp, every pixel all there or not at all (but a wall's top, fading out in the game's four steps); a floor tile covers its whole diamond; no pixel alone; nothing cut off", () => {
  const steps = new Set(FADE_STEPS.map((k) => Math.round(255 * k)));
  for (const [n, s] of [...place, ...archways]) {
    const q = paintingOf(s);
    const wall = walls.some(([m]) => m === n);
    const strip = archways.some(([m]) => m === n);
    let soft = 0;
    for (let x = 0; x < q.w; x++) {
      let top = -1;
      for (let y = 0; y < q.h; y++) {
        const a = q.d[(y * q.w + x) * 4 + 3];
        if (a === 0) continue;
        if (top < 0) top = y;
        if (a === 255) continue;
        if (wall && steps.has(a) && y - top < TOMB_FADE && Math.round(255 * FADE_STEPS[Math.floor(((y - top) * 4) / TOMB_FADE)]) === a) continue;
        if (strip && steps.has(a)) continue;
        soft++;
      }
    }
    assert.ok(soft === 0, `${n}: ${soft} soft pixels`);
  }
  for (const s of floorLike) {
    const q = paintingOf(s);
    const holes: string[] = [];
    for (let y = 2; y <= 29; y++) {
      const hw = 2 * Math.min(y, 32 - y);
      for (let x = -hw + 3; x <= hw - 4; x++) if (!q.get(32 + x, y)) holes.push(`(${x}, ${y})`);
    }
    assert.ok(holes.length === 0, `${holes.length} holes in a floor tile: ${holes.slice(0, 6).join(' ')}`);
  }
  for (const [n, s] of place.filter(([m]) => !m.includes('daylight') && !m.startsWith('water dripping'))) {
    const q = paintingOf(s);
    let loose = 0;
    for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) {
      if (!q.has(x, y)) continue;
      let k = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && q.has(x + dx, y + dy)) k++;
      if (k === 0) loose++;
    }
    assert.ok(loose <= 2, `${n}: ${loose} loose pixels`);
  }
  for (const [n, s] of ownSprites) assert.equal(edgeCount(paintingOf(s)), 0, `${n}: pixels on its picture's edge`);
  for (const [n, s] of archways) {
    const p = paintingOf(s);
    let e = 0;
    for (let x = 0; x < p.w; x++) e += (p.has(x, 0) ? 1 : 0) + (p.has(x, p.h - 1) ? 1 : 0);
    assert.equal(e, 0, `${n}: cut off at its top or foot`);
  }
});

test("Colour 3: nothing cyan; the enemy's pink nowhere in the place (only his gate's lock and floor 1's own fire); fire an honest orange; the daylight green-gold", () => {
  for (const [n, s] of [...place, ...archways]) {
    assert.ok(cyanIn(s).length === 0, `${n}: cyan ${cyanIn(s).join(' ')}`);
    assert.ok(pinkIn(s, false).length === 0, `${n}: pink ${pinkIn(s, false).join(' ')}`);
    let pink = 0;
    each(s, (r, g, b) => (pink += FLAMES.has(hex(r, g, b)) ? 1 : 0));
    assert.equal(pink, 0, `${n}: the enemy's fire in the tomb`);
  }
  for (const alongX of [true, false]) assert.ok(cyanIn(A.stairsUp(alongX)).length === 0 && pinkIn(A.stairsUp(alongX), false).length === 0, "the town's stairs: nothing cyan, nothing pink");
  for (const p of A.pieces) for (const s of sprites(p)) {
    const b = [...cyanIn(s), ...pinkIn(s, true)];
    assert.ok(b.length === 0, `${p.name}: ${b.join(' ')}`);
  }
  // the daylight: a pale green-gold, never cyan; the shafts' glow, the town's light
  for (const c of [...SUN.pool, ...SUN.air, SUN.mote, SUN.glow, SUN.town, TOMB_LIGHTS.shaft.glow.color, TOMB_LIGHTS.stairs.glow.color]) {
    const [h, sa] = hsv(...rgb(c));
    assert.ok(h >= 45 && h <= 80 && sa > 0.15 && sa < 0.6, `the daylight's ${c}: green-gold (${h.toFixed(0)}, ${sa.toFixed(2)})`);
  }
});

test('Colour 4: its floors and its walls darker than the darkest word (at the 99th of their pixels); the daylight makes it bright', () => {
  const darkest = Math.min(...Object.values(WORD_COLOR).map((c) => luma(...rgb(c))));
  const bad: string[] = [];
  for (const [n, s] of [...floors, ...tiles, ...walls.filter((_, i) => i % 4 === 0), ...archways.filter((_, i) => i % 3 === 0), ...solidOwn.filter(([m]) => m.includes('tomb'))]) {
    const h = new Array<number>(256).fill(0);
    each(s, (r, g, b) => {
      if (isFire(r, g, b) || FLAMES.has(hex(r, g, b))) return;
      h[Math.round(luma(r, g, b))]++;
    });
    const total = h.reduce((t, k) => t + k, 0);
    let seen = 0;
    let p99 = 255;
    for (let l = 0; l < 256; l++) {
      seen += h[l];
      if (seen >= total * 0.99) {
        p99 = l;
        break;
      }
    }
    if (p99 >= darkest) bad.push(`${n} ${p99}`);
  }
  assert.ok(bad.length === 0, `brighter than the darkest word (${darkest.toFixed(0)}): ${bad.join(', ')}`);
  // (the brightest floor: its dark lighter than any other's, the game's far dark 0.88, floor 4's 0.76, floor 5's 0.8)
  assert.ok(TOMB_LIGHTS.dark.a > 0.45 && TOMB_LIGHTS.dark.a < 0.7, `its dark ${TOMB_LIGHTS.dark.a}: lighter than the deeper floors', darker than the town's 0.45`);
});

test('Pixels 4: light from the upper left (a wall turned to screen-left lighter than one turned to screen-right); the pilasters every two tiles', () => {
  const m = (list: Sprite[][]): number => list.reduce((t, fr) => t + mean(fr[0]), 0) / list.length;
  for (const [n, L, R] of [['the tomb', A.faceLeft, A.faceRight], ['his hall', A.hall.faceLeft, A.hall.faceRight]] as const) {
    assert.ok(m(L) > m(R) + 3, `${n}: turned left ${m(L).toFixed(0)}, right ${m(R).toFixed(0)}`);
  }
  for (let t = 0; t < 12; t++) {
    for (const alongX of [true, false]) {
      const s = alongX ? A.face(true, t, 3) : A.face(false, 3, t);
      const list = alongX ? A.faceLeft : A.faceRight;
      const k = list.findIndex((fr) => fr.includes(s));
      assert.ok(k >= 0 && (k % 2 === 0) === (t % 2 === 0), `tile ${t} ${alongX ? 'along x' : 'along y'}: variant ${k}`);
    }
  }
  // (different bays along a wall: not every bay the same)
  const seen = new Set<number>();
  for (let t = 0; t < 40; t += 2) seen.add(A.faceLeft.findIndex((fr) => fr.includes(A.face(true, t, 5))));
  assert.ok(seen.size >= 4, `the bays vary along a wall: ${seen.size}`);
});

test("the roots: straight, bending and ending, round and lit, meeting the next tile's at the edges; the puddle's rings and the drip falling", () => {
  const tile = (n: string): Px => paintingOf(A.tiles.find((p) => p.name === n)!.frames![0]);
  const bark = new Set<string>(ROOT.map((c) => c.toLowerCase()));
  const rootPx = (p: Px): number => {
    let k = 0;
    for (let i = 0; i < p.d.length; i += 4) if (p.d[i + 3] && bark.has(hex(p.d[i], p.d[i + 1], p.d[i + 2]))) k++;
    return k;
  };
  const straight = rootPx(tile('a root along x'));
  assert.ok(straight > 150, `a root along x: ${straight} pixels of bark`);
  for (const [n, , b] of ROOT_TILES) {
    const k = rootPx(tile(n));
    if (b === null) assert.ok(k > straight * 0.25 && k < straight * 0.8, `${n}: about half the root (${k})`);
    else assert.ok(k > straight * 0.6, `${n}: ${k}`);
  }
  const near = (p: Px, x: number, y: number): boolean => {
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (bark.has(p.get(Math.round(x + dx), Math.round(y + dy)) ?? '')) return true;
    return false;
  };
  for (const [n, a, b] of ROOT_TILES) {
    const p = tile(n);
    for (const e of [a, b]) {
      if (e === null) continue;
      const [u, v] = e === '-x' ? [0.05, 0.5] : e === '+x' ? [0.95, 0.5] : e === '-y' ? [0.5, 0.05] : [0.5, 0.95];
      assert.ok(near(p, 32 + (u - v) * 32, (u + v) * 16), `${n}: its root at its ${e} edge`);
    }
  }
  // (lit along its top toward the light: of a root along y, the side toward -x lighter)
  const ry = tile('a root along y');
  const lum = (x: number, y: number): number => luma(...rgb(ry.get(x, y) ?? '#000000'));
  let litSide = 0;
  let shadeSide = 0;
  for (let t = 0.2; t < 0.8; t += 0.05) {
    litSide += lum(Math.round(32 + (0.44 - t) * 32), Math.round((0.44 + t) * 16));
    shadeSide += lum(Math.round(32 + (0.56 - t) * 32), Math.round((0.56 + t) * 16));
  }
  assert.ok(litSide > shadeSide, `round and lit: ${litSide.toFixed(0)} on its lit side, ${shadeSide.toFixed(0)} on its other`);
  assert.ok(A.floor(0, 0) === A.floor(4, -4), 'the floor repeats every four tiles');
  // the puddle: four frames, its rings spreading
  const pud = A.tiles.find((p) => p.name === 'a puddle')!.frames!;
  assert.ok(pud.length === 4 && sameShape(pud[0], pud[1]) === 0, 'the puddle: four frames, one shape');
  let differ = 0;
  const p0 = paintingOf(pud[0]);
  const p1 = paintingOf(pud[1]);
  for (let i = 0; i < p0.d.length; i++) if (p0.d[i] !== p1.d[i]) differ++;
  assert.ok(differ > 10, `its rings move (${differ})`);
  // the drip: eight frames; the drop falls, faster as it goes, then splashes
  const dr = A.pieces.find((p) => p.name === 'water dripping')!.frames!;
  assert.equal(dr.length, DRIP_FRAMES, 'eight frames');
  const lowest = (s: Sprite): number => {
    const b = paintingOf(s).bounds()!;
    return b.y + b.h;
  };
  const falls = dr.slice(0, 5).map(lowest);
  for (let i = 1; i < falls.length; i++) assert.ok(falls[i] - falls[i - 1] >= falls[Math.max(0, i - 1)] - falls[Math.max(0, i - 2)] - 1 && falls[i] > falls[i - 1], `the drop falls faster: ${falls.join(' ')}`);
  assert.ok(count(dr[6]) > count(dr[2]), 'the splash');
});

test("the daylight: its pools in three bands and its columns of lit air (brightest low down, giving out in steps up into the dark, motes moving in four frames), pictures of light drawn added", () => {
  for (const size of ['small', 'middle', 'large']) {
    const pool = A.pieces.find((p) => p.name === `daylight on the floor, ${size}`)!.frames![0];
    const tones = new Set<string>();
    each(pool, (r, g, b) => tones.add(hex(r, g, b)));
    assert.deepEqual([...tones].sort(), [...SUN.pool].map((c) => c.toLowerCase()).sort(), `the pool (${size}): three bands`);
    const air = A.pieces.find((p) => p.name === `a shaft of daylight, ${size}`)!.frames!;
    assert.ok(air.length === 4, 'four frames');
    const p = paintingOf(air[0]);
    const b = p.bounds()!;
    const rowLight = (y0: number, y1: number): number => {
      let t = 0;
      let n = 0;
      for (let y = y0; y < y1; y++) for (let x = 0; x < p.w; x++) {
        const c = p.get(x, y);
        if (!c) continue;
        t += luma(...rgb(c));
        n++;
      }
      return n ? t / n : 0;
    };
    const low = rowLight(b.y + b.h - 60, b.y + b.h);
    const high = rowLight(b.y, b.y + 60);
    assert.ok(low > high + 3, `the column (${size}) brightest low down: ${low.toFixed(1)} against ${high.toFixed(1)}`);
    let moved = 0;
    const q = paintingOf(air[1]);
    for (let i = 0; i < p.d.length; i++) if (p.d[i] !== q.d[i]) moved++;
    assert.ok(moved > 0, 'its motes move');
    assert.ok(TOMB_ADDED.has(`daylight on the floor, ${size}`) && TOMB_ADDED.has(`a shaft of daylight, ${size}`), 'drawn added, as light');
    // (dim colours: added to what is under them, never a solid shape)
    let max = 0;
    for (const s of [pool, ...air]) each(s, (r, g, bb) => (max = Math.max(max, luma(r, g, bb))));
    assert.ok(max < 100, `light to add, never solid: its brightest ${max.toFixed(0)}`);
  }
  assert.ok(TOMB_LIGHTS.shaft.small.r < TOMB_LIGHTS.shaft.middle.r && TOMB_LIGHTS.shaft.middle.r < TOMB_LIGHTS.shaft.large.r, 'a bigger shaft, a bigger hole in the dark');
});

test("floor 1's own pieces in look B's colours: every one there, its shapes, its fire and its lights as they were; their colours look B's", () => {
  const before = wardenPieces();
  let changed = 0;
  for (const p of before) {
    const q = A.pieces.find((r) => r.name === p.name)!;
    assert.ok(q.kind === p.kind, `${p.name}: there`);
    const a = sprites(p);
    const b = sprites(q);
    assert.equal(a.length, b.length, `${p.name}: as many pictures`);
    for (let i = 0; i < a.length; i++) {
      const pa = paintingOf(a[i]);
      const pb = paintingOf(b[i]);
      assert.ok(pa.w === pb.w && pa.h === pb.h && a[i].ax === b[i].ax && a[i].ay === b[i].ay, `${p.name} ${i}: its size and anchor`);
      let shape = 0;
      let fire = 0;
      for (let k = 0; k < pa.d.length; k += 4) {
        if ((pa.d[k + 3] === 0) !== (pb.d[k + 3] === 0)) shape++;
        const ca = hex(pa.d[k], pa.d[k + 1], pa.d[k + 2]);
        if (pa.d[k + 3] && SHINES.has(ca) && ca !== hex(pb.d[k], pb.d[k + 1], pb.d[k + 2])) fire++;
        if (pa.d[k + 3] && ca !== hex(pb.d[k], pb.d[k + 1], pb.d[k + 2])) changed++;
      }
      assert.ok(shape === 0 && fire === 0, `${p.name} ${i}: ${shape} pixels changed shape, ${fire} of its fire changed`);
      assert.equal((a[i].lights ?? []).length, (b[i].lights ?? []).length, `${p.name} ${i}: its lights`);
    }
  }
  assert.ok(changed > 20000, `in look B's colours (${changed} pixels changed colour)`);
  // (floor 1's violet stone turned to look B's green-grey)
  const [r, g, b] = rgb(gradeColour(CRYPT_FLOORS[0].lit[2]));
  assert.ok(g >= r && g > b, `its stone green-grey: ${gradeColour(CRYPT_FLOORS[0].lit[2])}`);
});

// =================================================================================================
// THE TOWN'S STAIRS AND THE STAIRWELL DOWN: fitting unchanged

test("the town's stairs coming down: art/town_ways.ts floorStairsUp's size, anchor and shape pixel for pixel, in the tomb's stone, the daylight brighter up the flight", () => {
  for (const alongX of [true, false]) {
    const theirs = floorStairsUp(CRYPT_FLOORS[0], alongX);
    const ours = A.stairsUp(alongX);
    assert.ok(ours.ax === theirs.ax && ours.ay === theirs.ay && ours.density === theirs.density, 'its anchor');
    assert.equal(sameShape(theirs, ours), 0, `${alongX ? 'along x' : 'along y'}: its shape`);
    // the daylight: the flight's far end (up the screen, up the flight) lighter than its foot
    const p = paintingOf(ours);
    const b = p.bounds()!;
    const band = (y0: number, y1: number): number => {
      let t = 0;
      let n = 0;
      for (let y = y0; y < y1; y++) for (let x = 0; x < p.w; x++) {
        const c = p.get(x, y);
        if (!c) continue;
        t += luma(...rgb(c));
        n++;
      }
      return t / Math.max(1, n);
    };
    const top = band(b.y, b.y + 30);
    const foot = band(b.y + b.h - 30, b.y + b.h);
    assert.ok(top > foot + 10, `brighter up the flight: ${top.toFixed(0)} at its head, ${foot.toFixed(0)} at its foot`);
  }
});

test('the stairwell down: art/crypt_ways.ts makeStairwell its shape pixel for pixel, in the tomb\'s stone; its opening the same moment', () => {
  for (const way of ['x', 'y'] as const) {
    const theirs = makeStairwell(CRYPT_FLOORS[0], way);
    const ours = A.stairwell(way);
    assert.ok(ours.ax === theirs.ax && ours.ay === theirs.ay, 'its anchor');
    assert.equal(sameShape(theirs, ours), 0, `its shape (${way})`);
    let differ = 0;
    const pa = paintingOf(theirs);
    const pb = paintingOf(ours);
    for (let i = 0; i < pa.d.length; i += 4) if (pa.d[i + 3] && (pa.d[i] !== pb.d[i] || pa.d[i + 1] !== pb.d[i + 1])) differ++;
    assert.ok(differ > 500, `in the tomb's stone (${differ} pixels)`);
    assert.ok(cyanIn(ours).length === 0 && pinkIn(ours, false).length === 0, 'nothing cyan, nothing pink');
  }
  // its opening as he dies (art/stairwell_open.ts): the same moment, its jolts on the same frames, as long (to its last still frames of dust)
  const theirs = stairwellOpens(CRYPT_FLOORS[0], 'x', [4, -9]);
  const ours = A.stairwellOpens('x', [4, -9]);
  assert.deepEqual(ours.jolts, theirs.jolts, 'its jolts on the same frames');
  assert.ok(ours.fps === theirs.fps && Math.abs(ours.frames.length - theirs.frames.length) <= 3, `as long: ${ours.frames.length} frames, floor 1's ${theirs.frames.length}`);
  assert.equal(sameShape(ours.after![0], A.stairwell('x')), 0, 'it ends on the stairwell, to the pixel');
});

// =================================================================================================
// THE WAY BETWEEN TWO ROOMS

function plane(strips: Strip[], alongX: boolean): Map<string, string> {
  const out = new Map<string, string>();
  for (const q of strips) {
    const p = paintingOf(q.s);
    const ay = q.s.ay * GRAIN;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const c = p.get(x, y);
      if (c === null) continue;
      const j = alongX ? x : STRIP - 1 - x;
      out.set(`${q.t * 32 + j},${ay + Math.floor((j - 1) / 2) - y}`, c);
    }
  }
  return out;
}

test('the way between two rooms: round-headed, open through its three tiles, a hero under it with room; the wall either side to the tile beyond; the same both ways, lit along x', () => {
  let wide = 0;
  for (let du = -60; du < 60; du++) if (inArchway(du + 0.5, 0)) wide++;
  assert.ok(wide >= 90 && wide <= 96, `the way at the floor: ${wide} across`);
  let head = 0;
  for (let v = 0; v < 120; v++) if (inArchway(0.5, v)) head = v;
  assert.ok(head >= 60 && head < ARCHWAY.spring + ARCHWAY.rise + 1, `its head at ${head}`);
  for (let v = 0; v < 56; v++) assert.ok(inArchway(-24, v) && inArchway(24, v), `a hero's breadth clear at ${v}`);
  const X = plane(A.archway(true), true);
  const Y = plane(A.archway(false), false);
  assert.deepEqual([...X.keys()].sort(), [...Y.keys()].sort(), 'the same shape both ways');
  const m2 = (m: Map<string, string>): number => [...m.values()].reduce((t, c) => t + luma(...rgb(c)), 0) / m.size;
  assert.ok(m2(X) > m2(Y) + 2, `the face along x lit: ${m2(X).toFixed(1)} against ${m2(Y).toFixed(1)}`);
  for (const u of [-28, -12, 108, 124]) {
    let k = 0;
    for (let v = 0; v < TOMB_WALL; v++) if (X.has(`${u},${v}`)) k++;
    assert.ok(k >= TOMB_WALL - 2, `the wall at ${u}: ${k} high`);
  }
  for (let v = 0; v < 56; v++) assert.ok(!X.has(`47,${v}`) && !X.has(`48,${v}`), `the middle of the way clear at ${v}`);
});

// =================================================================================================
// HIS GATE

const lowest = (m: Map<string, string>): number => Math.min(...[...m.keys()].map((k) => Number(k.split(',')[1])));
const gatePics: [string, Sprite][] = [['the pillar', GA.pillar(true)]];
for (const alongX of [true, false]) {
  for (const lit of [false, true]) GA.arch(alongX, true, lit).forEach((q, i) => gatePics.push([`the arch ${alongX}${lit}, ${i}`, q.s]));
  for (const raise of [0, 30, GATE_UP]) GA.portcullis(alongX, true, raise).forEach((q, i) => gatePics.push([`the drop ${alongX} ${raise}, ${i}`, q.s]));
  for (let f = 0; f < TG_SLAM_FRAMES; f++) gatePics.push([`the slam ${alongX} ${f}`, tombGateSlam(alongX, f)]);
}

test("his gate: a GateArt; everything but the boss's pillar, arch and drop floor 1's own (in look B's colours); every picture painted, crisp, nothing cyan, nothing pink but the lock", () => {
  const F1 = wardenGates();
  const like = (a: Sprite, b: Sprite): boolean => sameShape(a, b) === 0 && a.ax === b.ax && a.ay === b.ay;
  assert.ok(like(GA.post, F1.post) && like(GA.pillar(false), F1.pillar(false)) && like(GA.leaf(32, 16), F1.leaf(32, 16)) && like(GA.lever(true), F1.lever(true)), "the doors' and plain gates' pictures: floor 1's own, their shapes");
  const pa = GA.arch(true, false, false);
  const pb = F1.arch(true, false, false);
  assert.ok(pa.length === pb.length && pa.every((q, i) => q.t === pb[i].t && like(q.s, pb[i].s)), "the plain gates' arches (the town's stairs stand in one): floor 1's own");
  assert.ok(GA.arch(false, true, true) === GA.arch(false, true, true) && GA.portcullis(true, true, 44) === GA.portcullis(true, true, 44), 'painted once and kept');
  for (const [n, s] of gatePics) {
    const p = paintingOf(s);
    assert.ok(p.bounds() !== null, `${n}: painted`);
    let soft = 0;
    for (let i = 3; i < p.d.length; i += 4) if (p.d[i] !== 0 && p.d[i] !== 255) soft++;
    assert.ok(soft === 0, `${n}: ${soft} soft pixels`);
    assert.ok(cyanIn(s).length === 0, `${n}: cyan ${cyanIn(s).join(' ')}`);
    if (!n.startsWith('the arch')) assert.ok(pinkIn(s, false).length === 0, `${n}: pink ${pinkIn(s, false).join(' ')}`);
  }
  for (const alongX of [true, false]) for (const lit of [false, true]) {
    for (const [k, c] of plane(GA.arch(alongX, true, lit), alongX)) {
      if (!isPink(...rgb(c))) continue;
      const [u, vv] = k.split(',').map(Number);
      assert.ok(Math.hypot(u + 0.5 - ARCH_WIDE / 2, vv + 0.5 - TG_LOCK.hole) < 6, `pink only in the lock: ${k}`);
    }
  }
  for (const [n, s] of gatePics.filter(([m]) => m === 'the pillar' || m.startsWith('the slam'))) assert.equal(edgeCount(paintingOf(s)), 0, `${n}: pixels on its picture's edge`);
  const pp = paintingOf(GA.pillar(true));
  const b = pp.bounds()!;
  const high = anchor(GA.pillar(true))[1] - b.y;
  assert.ok(high >= TG_WAY.spring + 4 && high <= TG_WAY.spring + 16, `the pillar up to the spring (its back corner a little higher on the screen): ${high}`);
});

test("his gate: the way exactly the game's three tiles, round-headed, a hero under it with room; the gable, the crown, his horns; light from the upper left, the same gate both ways", () => {
  assert.ok(SPAN === 96 && PILLAR === 12, 'three tiles between pillars three eighths of a tile to a side');
  const way: number[] = [];
  for (let u = -4; u < ARCH_WIDE + 4; u++) if (tombInWay(u, 0)) way.push(u);
  assert.ok(way.length === SPAN && way[0] === PILLAR, `the way: ${way[0]} to ${way[way.length - 1]}`);
  for (let v = 0; v < 70; v++) assert.ok(tombInWay(36, v) && tombInWay(83, v), `a hero's breadth clear under the head at ${v}`);
  for (const alongX of [true, false]) {
    const m = plane(GA.arch(alongX, true, false), alongX);
    for (let v = 0; v < TG_LOCK.z0; v++) assert.ok(!m.has(`59,${v}`) && !m.has(`60,${v}`), `the middle of the way clear under the lock at ${v}`);
    let top = 0;
    for (const k of m.keys()) top = Math.max(top, Number(k.split(',')[1]));
    assert.ok(top >= 205 && top <= 230, `his horns at the peak: ${top}`);
  }
  const mean2 = (m: Map<string, string>): number => [...m.values()].reduce((t, c) => t + luma(...rgb(c)), 0) / m.size;
  const X = plane(GA.arch(true, true, false), true);
  const Y = plane(GA.arch(false, true, false), false);
  assert.ok(mean2(X) > mean2(Y) + 3, `the face along x lit: ${mean2(X).toFixed(1)} against ${mean2(Y).toFixed(1)}`);
  assert.deepEqual([...X.keys()].sort(), [...Y.keys()].sort(), 'the same shape both ways');
});

test("his gate: the lock in embers (the enemy's, dull) and alight (pink to gold, and it gives the enemy's light)", () => {
  for (const alongX of [true, false]) {
    const fire = (m: Map<string, string>, cs: string[]): number => [...m.values()].filter((c) => cs.includes(c)).length;
    const dim = plane(GA.arch(alongX, true, false), alongX);
    const lit = plane(GA.arch(alongX, true, true), alongX);
    assert.ok(fire(dim, [FLAME[0], FLAME[1]]) >= 8 && fire(dim, [FLAME[2], FLAME[3], FLAME[4]]) === 0, `in embers: ${fire(dim, [FLAME[0], FLAME[1]])}, none bright`);
    assert.ok(fire(lit, [FLAME[3], FLAME[4]]) >= 6 && fire(lit, [FLAME[1], FLAME[2]]) >= 10, `alight: ${fire(lit, [FLAME[3], FLAME[4]])} pixels gold, pink at its rim`);
    const lights = GA.arch(alongX, true, true).flatMap((q) => q.s.lights ?? []);
    assert.ok(lights.length === 1 && lights[0].color === FLAME[2], "alight, the enemy's light");
    assert.ok(GA.arch(alongX, true, false).every((q) => !q.s.lights), 'in embers, none');
  }
});

test('his gate: the drop from up to down: drawn up, its points over a hero; let down step by step, to the floor on its points; square bars of black iron', () => {
  for (const alongX of [true, false]) {
    let last = Infinity;
    for (let raise = GATE_UP; raise >= 0; raise -= 2) {
      const m = plane(GA.portcullis(alongX, true, raise), alongX);
      const lo = lowest(m);
      assert.equal(lo, tombLift(raise), `raised ${raise}: its lowest point ${lo}`);
      assert.ok(lo <= last, 'coming down');
      last = lo;
      for (const k of m.keys()) {
        const [u, v] = k.split(',').map(Number);
        assert.ok(tombInWay(u, v), `only in the way: ${k}`);
      }
    }
    const down = plane(GA.portcullis(alongX, true, 0), alongX);
    let points = 0;
    for (let u = PILLAR; u < PILLAR + SPAN; u++) if (down.has(`${u},0`)) points++;
    assert.ok(points >= 6, `down to the floor on its points: ${points}`);
    assert.ok(down.size > 700, `down, it fills the way: ${down.size}`);
    const iron = [...down.values()].filter((c) => { const [, sa, v] = hsv(...rgb(c)); return v < 0.4 && (sa < 0.36 || v < 0.12); }).length;
    assert.ok(iron === down.size, 'black iron');
  }
  assert.ok(tombLift(GATE_UP) === TG_LIFT && TG_LIFT >= 56 + 12 && TG_LIFT < TG_WAY.spring + TG_WAY.rise, `up, its points ${TG_LIFT} over the floor (a hero is 56), under the way's head`);
});

test("his gate: the drop (Movement 9): held juddering at the top, down in two frames, a hard landing and a bounce; the slam's chips fall and its dust thins", () => {
  const D = TOMB_GATE_DROP;
  assert.ok(D.every((r) => r >= 0 && r <= GATE_UP && r % 2 === 0) && D[0] === GATE_UP, "from the top, the game's raise");
  const judder = D.slice(0, TOMB_SLAM_AT - 1);
  assert.ok(judder.length >= 8 && judder.every((r) => r >= GATE_UP - 12) && judder.some((r) => r < GATE_UP), `held at the top, juddering: ${judder.join(' ')}`);
  assert.ok(D[TOMB_SLAM_AT] === 0 && D[TOMB_SLAM_AT - 1] > 0 && D[TOMB_SLAM_AT - 1] < GATE_UP - 12, 'down in two frames');
  const after = D.slice(TOMB_SLAM_AT);
  assert.ok(Math.max(...after) >= 6 && D[D.length - 1] === 0, `a bounce, then down: ${after.join(' ')}`);
  assert.ok(tombGateDropAt(TOMB_SLAM_AT).slam === 0 && tombGateDropAt(TOMB_SLAM_AT).lit && !tombGateDropAt(TOMB_SLAM_AT - 1).lit && tombGateDropAt(TOMB_SLAM_AT + TG_SLAM_FRAMES).slam === -1, 'the slam and the lock from the landing');
  const n = (f: number): number => count(tombGateSlam(true, f));
  assert.ok(n(6) > n(0) && n(TG_SLAM_FRAMES - 1) < n(6) * 0.7, `it billows and thins: ${n(0)}, ${n(6)}, ${n(TG_SLAM_FRAMES - 1)}`);
  const chipsHigh = (f: number): number => {
    let k = 0;
    const s = tombGateSlam(true, f);
    each(s, (r, g, b, _a, _x, y) => {
      const l = luma(r, g, b);
      if (l > 70 && y < anchor(s)[1] - 60) k++;
    });
    return k;
  };
  assert.ok(chipsHigh(1) >= 10 && chipsHigh(TG_SLAM_FRAMES - 1) === 0, `chips falling: ${chipsHigh(1)} high at first, ${chipsHigh(TG_SLAM_FRAMES - 1)} at the end`);
  for (let f = 0; f < TG_SLAM_FRAMES; f++) each(tombGateSlam(true, f), (r, g, b) => assert.ok(!FLAMES.has(hex(r, g, b)) && !isFire(r, g, b), 'no fire, no pink in the slam: stone and dust'));
});
