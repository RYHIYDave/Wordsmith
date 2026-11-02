// FLOOR 3, THE BLACK IRON PRISON, LOOK B, MADE GAME-READY (src/art/prison.ts behind PRISON, off; his gate, src/art/prison_gate.ts
// behind PRISON_GATE, off; nothing of the game imports them), held to his art rulebook before it goes to the main chat: off and
// imported by nothing of the game; every picture painted, at its size and anchored where the game lays it (a floor tile at its
// top corner, a wall tile at its top corner's floor point with its face hanging to the floor, as high as floor 3's walls, its
// top fading out as the game's); crisp (every pixel all there or not at all but the walls' fading tops, the game's own four
// steps; a floor tile covering its whole diamond; no pixel alone); nothing cyan (the friend's), nothing pink (the enemy's) but
// his mark; the floor and the walls darker than the darkest word; light from the upper left; the ribs every two tiles; the
// grates' fire flickering; floor 3's own pieces in look B's colours, their shapes and fire as they were; the boss hall flat,
// its great grate glowing; and his gate: the way the game's three tiles, the mark in embers and alight, the portcullis from up
// to down, the drop's timing (Movement 9), the slam. And THE DOOR OUT OF HIS HALL (src/art/prison_exit.ts, behind PRISON_EXIT, off):
// its frames, sizes and anchors, its face on the wall's line, crisp, nothing cyan, his mark out as he falls, shut and open, the
// passage going down away from the hall, its timing.
//   run: tsx --test tests/prison.test.ts

// @ts-ignore
import { readdirSync, readFileSync, statSync } from 'node:fs';
// @ts-ignore
import { join } from 'node:path';
import {
  CHANNEL_DEEP, FADE_STEPS, GREAT, HALL_REACH, PRISON, PRISON_FADE, PRISON_LIGHTS, PRISON_OWN, PRISON_WALL, gradedB, makePrisonArt,
} from '../src/art/prison';
import {
  PG_BARS, PG_LIFT, PG_SLAM_FRAMES, PG_SPRING, PRISON_GATE, PRISON_GATE_DROP, PRISON_SLAM_AT, makePrisonGateArt, prisonGateDropAt,
  prisonGateSlam, prisonInWay, prisonLift,
} from '../src/art/prison_gate';
import {
  EXIT_DOOR, EXIT_FPS, EXIT_FRAMES, EXIT_JOLTS, EXIT_LIGHTS, EXIT_OPEN_SECS, EXIT_PASSAGE, EXIT_TAKES, EXIT_TILES, MARK_OUT, PRISON_EXIT, exitArt, exitBar,
  exitSpill, exitSwing,
} from '../src/art/prison_exit';
import { chainedGates, chainedPieces } from '../src/art/floor3';
import { ARCH_WIDE, GATE_UP, PILLAR, SPAN, STRIP } from '../src/art/gates';
import type { Strip } from '../src/art/gates';
import { WALL_LOOK } from '../src/art/ground';
import { WORD_COLOR } from '../src/art/icons';
import { FLAME } from '../src/art/mkit';
import { EMBER } from '../src/art/props';
import { GRAIN } from '../src/art/kit';
import type { Sprite } from '../src/engine/px';
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
const A = makePrisonArt();
const GA = makePrisonGateArt();

const floors: Sprite[] = [];
for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) floors.push(A.floor(x, y));
const walls: [string, Sprite][] = [
  ...A.faceLeft.map((s, i) => [`wall along x ${i}`, s] as [string, Sprite]),
  ...A.faceRight.map((s, i) => [`wall along y ${i}`, s] as [string, Sprite]),
  ...A.cellLeft.map((s, i) => [`cell front along x ${i}`, s] as [string, Sprite]),
  ...A.cellRight.map((s, i) => [`cell front along y ${i}`, s] as [string, Sprite]),
  ...A.hall.faceLeft.map((s, i) => [`hall wall along x ${i}`, s] as [string, Sprite]),
  ...A.hall.faceRight.map((s, i) => [`hall wall along y ${i}`, s] as [string, Sprite]),
];
const hallTiles: [string, Sprite][] = [];
for (let dx = HALL_REACH.lo; dx < HALL_REACH.hi; dx++) for (let dy = HALL_REACH.lo; dy < HALL_REACH.hi; dy++) {
  (A.hall.floor(dx + 40, dy + 40, dx, dy) ?? []).forEach((s, f) => hallTiles.push([`hall floor ${dx},${dy} frame ${f}`, s]));
}
const tiles: [string, Sprite][] = A.tiles.flatMap((p) => p.frames!.map((s, f) => [`${p.name} ${f}`, s] as [string, Sprite]));
const ownPieces = A.pieces.filter((p) => (PRISON_OWN as readonly string[]).includes(p.name));
const mine: [string, Sprite][] = [
  ...floors.map((s, i) => [`flags ${i}`, s] as [string, Sprite]),
  ...tiles,
  ...walls,
  ...hallTiles,
  ...ownPieces.flatMap((p) => sprites(p).map((s, i) => [`${p.name} ${i}`, s] as [string, Sprite])),
];
const floorLike: Sprite[] = [...floors, ...tiles.map(([, s]) => s), ...hallTiles.map(([, s]) => s)];
const FIRE = new Set(EMBER.map((c) => c.toLowerCase()));
const isFire = (r: number, g: number, b: number): boolean => FIRE.has(hex(r, g, b));

test('the prison, his gate and the door out of his hall: off, and nothing of the game imports them', () => {
  assert.ok(PRISON.on === false && PRISON_GATE.on === false && PRISON_EXIT.on === false, 'PRISON, PRISON_GATE and PRISON_EXIT are off');
  const found: string[] = [];
  const walk = (d: string): void => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith('.ts') && !p.includes(join('src', 'dev')) && !p.endsWith(join('art', 'prison.ts')) && !p.endsWith(join('art', 'prison_gate.ts')) && !p.endsWith(join('art', 'prison_exit.ts')) && /from '\.\.?\/(art\/)?prison(_gate|_exit)?'/.test(readFileSync(p, 'utf8'))) found.push(p);
    }
  };
  walk('src');
  assert.ok(found.length === 0, `imported by ${found.join(', ')}`);
});

test('the prison: every picture painted, the pieces the brief asks for', () => {
  for (const [n, s] of mine) assert.ok(count(s) > 20, `${n}: ${count(s)} pixels`);
  const names = A.tiles.map((p) => p.name);
  for (const n of ['a grate', 'a grate, glowing', 'soot', 'rust stains', 'a drain', 'straw before a cell']) assert.ok(names.includes(n), `the tile "${n}"`);
  for (const w of ['along x', 'along y']) {
    for (const h of [', its far half', ', its near half']) {
      for (const n of [`the channel's grate ${w}`, `the channel's grate ${w}, glowing`, `the open channel ${w}`, `the open channel ${w}, where it begins`, `the bridge ${w}`]) assert.ok(names.includes(n + h), `the tile "${n}${h}"`);
    }
  }
  assert.ok(A.faceLeft.length === 4 && A.faceRight.length === 4 && A.cellLeft.length === 3 && A.cellRight.length === 3 && A.hall.faceLeft.length === 4 && A.hall.faceRight.length === 4, 'the walls');
  for (const n of PRISON_OWN) assert.ok(A.pieces.some((p) => p.name === n), `the piece "${n}"`);
});

test("the prison: every picture at its size and anchored where the game lays it; the walls as high as floor 3's, their tops fading as the game's", () => {
  assert.equal(PRISON_WALL, WALL_LOOK.tall * GRAIN, "as high as the game's walls (WALL_LOOK.tall)");
  assert.equal(PRISON_FADE, WALL_LOOK.fade * GRAIN, "their tops fading as far down as the game's (WALL_LOOK.fade)");
  for (const s of floorLike) {
    const q = paintingOf(s);
    assert.ok(q.w === 64 && q.h === 32 && anchor(s)[0] === 32 && anchor(s)[1] === 0 && s.density === GRAIN, 'a floor tile 64 x 32 at its top corner');
  }
  for (const [n, s] of walls) {
    const q = paintingOf(s);
    const [, ay] = anchor(s);
    assert.ok(q.w === 64 && q.h === 32 + PRISON_WALL && anchor(s)[0] === 32 && ay === PRISON_WALL, `${n}: 64 x ${32 + PRISON_WALL} at the floor point of its top corner`);
    // (each column of the face PRISON_WALL high, down to the floor line of the tile's near edges; the columns at the tile's
    // ends empty, as the game's)
    let low = -1;
    for (let x = 0; x < q.w; x++) {
      let k = 0;
      for (let y = 0; y < q.h; y++) if (q.has(x, y)) {
        k++;
        low = Math.max(low, y);
      }
      const want = x === 0 || x === q.w - 1 ? 0 : PRISON_WALL;
      if ((n.includes('along x') && x < 32) || (n.includes('along y') && x >= 32)) assert.equal(k, want, `${n}: column ${x} ${k} high`);
    }
    assert.ok(low >= ay + 28 && low <= ay + 33, `${n}: its foot ${low - ay} below its anchor`);
  }
  for (const p of ['railing along y', 'railing along x', 'railing post']) {
    const s = A.pieces.find((q) => q.name === p)!.frames![0];
    assert.ok(paintingOf(s).w === 56 && paintingOf(s).h === 96 && anchor(s)[0] === 28 && anchor(s)[1] === 80, `${p}: 56 x 96 at the floor point under its middle`);
  }
  for (const p of ['a chain from the dark, a hook', 'a chain from the dark, a shackle']) {
    for (const s of sprites(A.pieces.find((q) => q.name === p)!)) assert.ok(paintingOf(s).w === 48 && paintingOf(s).h === 120 && anchor(s)[0] === 24 && anchor(s)[1] === 104, `${p}: as a wall piece, at the foot of its face`);
  }
  for (const p of ['a chain from the dark, hanging to a hook', 'a chain from the dark, hanging to a cage', 'a great chain from the dark']) {
    const s = A.pieces.find((q) => q.name === p)!.frames![0];
    const q = paintingOf(s);
    assert.ok(anchor(s)[0] === 16 && anchor(s)[1] === q.h - 8, `${p}: at the floor point under it`);
  }
});

test('the prison, Pixels 1: crisp, every pixel all there or not at all (but a wall\'s top, fading out in the game\'s four steps); a floor tile covers its whole diamond', () => {
  const steps = new Set(FADE_STEPS.map((k) => Math.round(255 * k)));
  for (const [n, s] of mine) {
    const q = paintingOf(s);
    const wall = walls.some(([m]) => m === n);
    let soft = 0;
    for (let x = 0; x < q.w; x++) {
      let top = -1;
      for (let y = 0; y < q.h; y++) {
        const a = q.d[(y * q.w + x) * 4 + 3];
        if (a === 0) continue;
        if (top < 0) top = y;
        if (a === 255) continue;
        // (the fading top of a wall: one of the game's four steps, in the step its row is in)
        if (wall && steps.has(a) && y - top < PRISON_FADE && Math.round(255 * FADE_STEPS[Math.floor(((y - top) * 4) / PRISON_FADE)]) === a) continue;
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
  for (const [n, s] of mine) {
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
});

test('the prison, Colour 3: nothing cyan, nothing pink (the friend\'s and the enemy\'s glows); fire an honest orange', () => {
  const bad = (s: Sprite, allowShines: boolean): string[] => {
    const out = new Set<string>();
    each(s, (r, g, b) => {
      const [h, sa, v] = hsv(r, g, b);
      const c = hex(r, g, b);
      if (h >= 160 && h <= 205 && sa > 0.3 && v > 0.4) out.add(`cyan ${c}`);
      if (h >= 290 && h <= 352 && sa > 0.45 && v > 0.5 && !(allowShines && SHINES.has(c))) out.add(`pink ${c}`);
    });
    return [...out];
  };
  for (const [n, s] of mine) {
    const b = bad(s, false);
    assert.ok(b.length === 0, `${n}: ${b.join(' ')}`);
  }
  // (floor 3's own pieces: no cyan; pink only where it was the enemy's own fire, his eyes)
  for (const p of A.pieces) for (const s of sprites(p)) {
    const b = bad(s, true);
    assert.ok(b.length === 0, `${p.name}: ${b.join(' ')}`);
  }
});

test('the prison, Colour 4: its floor and its walls darker than the darkest word (at the 99th of their pixels; fire is light)', () => {
  const darkest = Math.min(...Object.values(WORD_COLOR).map((c) => luma(...rgb(c))));
  const bad: string[] = [];
  for (const [n, s] of [...floors.map((s, i) => [`flags ${i}`, s] as [string, Sprite]), ...tiles, ...walls, ...hallTiles]) {
    const h = new Array<number>(256).fill(0);
    each(s, (r, g, b) => {
      if (isFire(r, g, b)) return;
      h[Math.round(luma(r, g, b))]++;
    });
    const total = h.reduce((t, k) => t + k, 0);
    if (total === 0) continue;
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
});

test('the prison, Pixels 4: light from the upper left (a wall turned to screen-left lighter than one turned to screen-right); the ribs every two tiles', () => {
  const m = (list: Sprite[]): number => list.reduce((t, s) => t + mean(s), 0) / list.length;
  assert.ok(m(A.faceLeft) > m(A.faceRight) + 3, `turned left ${m(A.faceLeft).toFixed(0)}, right ${m(A.faceRight).toFixed(0)}`);
  assert.ok(m(A.cellLeft) > m(A.cellRight) + 2, `the cells' fronts: ${m(A.cellLeft).toFixed(0)}, ${m(A.cellRight).toFixed(0)}`);
  assert.ok(m(A.hall.faceLeft) > m(A.hall.faceRight) + 3, `the hall's walls: ${m(A.hall.faceLeft).toFixed(0)}, ${m(A.hall.faceRight).toFixed(0)}`);
  for (let t = 0; t < 8; t++) {
    for (const alongX of [true, false]) {
      const s = alongX ? A.face(true, t, 3) : A.face(false, 3, t);
      const list = alongX ? A.faceLeft : A.faceRight;
      const k = list.indexOf(s);
      assert.ok(k >= 0 && (k % 2 === 0) === (t % 2 === 0), `tile ${t} ${alongX ? 'along x' : 'along y'}: variant ${k}`);
    }
  }
});

test('the prison: the grates (dark: dying embers; glowing: the fire under it in four frames that differ, its light); the channel burnt low, its far side going down', () => {
  const fire = (s: Sprite, bright: boolean): number => {
    let n = 0;
    each(s, (r, g, b) => (n += bright ? (hex(r, g, b) === EMBER[3] || hex(r, g, b) === EMBER[4] ? 1 : 0) : isFire(r, g, b) ? 1 : 0));
    return n;
  };
  const tile = (n: string): Sprite[] => A.tiles.find((p) => p.name === n)!.frames!;
  assert.ok(fire(tile('a grate')[0], true) === 0 && fire(tile('a grate')[0], false) > 0, 'a dark grate: embers dying, nothing bright');
  for (const n of ['a grate, glowing', "the channel's grate along y, glowing, its far half", "the channel's grate along x, glowing, its near half"]) {
    const fr = tile(n);
    assert.ok(fr.length === 4, `${n}: four frames`);
    for (const s of fr) assert.ok(fire(s, false) > 120 && fire(s, true) > 10 && (s.lights ?? []).length === 1, `${n}: fire ${fire(s, false)}, its light`);
    const px = fr.map((s) => paintingOf(s));
    let differ = 0;
    for (let i = 0; i < px[0].d.length; i += 4) if (px[0].d[i] !== px[1].d[i] || px[0].d[i + 1] !== px[1].d[i + 1]) differ++;
    assert.ok(differ > 40, `${n}: its frames differ (${differ} pixels): it flickers`);
  }
  for (const w of ['along x', 'along y']) {
    for (const h of [', its far half', ', its near half']) {
      const open = tile(`the open channel ${w}${h}`)[0];
      const start = tile(`the open channel ${w}, where it begins${h}`)[0];
      assert.ok(fire(open, false) > (h.includes("far") ? 20 : 60) && fire(open, true) === 0, `the open channel ${w}${h} burnt low: ${fire(open, false)} pixels of fire in its cracks, nothing bright`);
      let differ = 0;
      const a = paintingOf(open);
      const b = paintingOf(start);
      for (let i = 0; i < a.d.length; i += 4) if (a.d[i] !== b.d[i] || a.d[i + 1] !== b.d[i + 1] || a.d[i + 2] !== b.d[i + 2]) differ++;
      assert.ok(differ > 100 && count(start) === count(open), `where it begins ${w}${h}: its far end seen going down (${differ} pixels)`);
    }
    // (the far half shows the far side going down; the near half is the bed)
    const far = tile(`the open channel ${w}, its far half`)[0];
    const near = tile(`the open channel ${w}, its near half`)[0];
    assert.ok(fire(near, false) > fire(far, false), `${w}: more of the bed seen in its near half (${fire(near, false)}) than its far (${fire(far, false)})`);
  }
  assert.ok(CHANNEL_DEEP > 0 && CHANNEL_DEEP < 32, 'its bed a little below the floor');
});

test("the prison: floor 3's own pieces in look B's colours: every one there, its shapes and its fire as they were, its colours drawn toward the charcoal", () => {
  const before = chainedPieces();
  for (const p of before) {
    const q = A.pieces.find((r) => r.name === p.name);
    assert.ok(q && q.kind === p.kind, `${p.name}: there`);
    const a = sprites(p);
    const b = sprites(q!);
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
      }
      assert.ok(shape === 0 && fire === 0, `${p.name} ${i}: ${shape} pixels changed shape, ${fire} of its fire changed`);
      assert.equal((a[i].lights ?? []).length, (b[i].lights ?? []).length, `${p.name} ${i}: its lights`);
    }
  }
  // (a colour of theirs, greyer)
  for (const c of ['#5e5a92', '#7e4466', '#46323f']) {
    const [, s0] = hsv(...rgb(c));
    const [, s1] = hsv(...rgb(gradedB(c)));
    assert.ok(s1 < s0, `${c} to ${gradedB(c)}`);
  }
});

test('the prison: his hall flat, its great grate glowing (four tiles each way, four frames), its iron ring and the rings in its floor; the plain floor beyond', () => {
  for (let dx = 0; dx < GREAT; dx++) for (let dy = 0; dy < GREAT; dy++) {
    const fr = A.hall.floor(10, 10, dx, dy)!;
    assert.ok(fr.length === 4, `the great grate ${dx},${dy}: four frames`);
    let fire = 0;
    each(fr[0], (r, g, b) => (fire += isFire(r, g, b) ? 1 : 0));
    assert.ok(fire > 250, `the great grate ${dx},${dy}: ${fire} pixels of fire`);
  }
  assert.ok(A.hall.floor(0, 0, HALL_REACH.hi, 0) === null && A.hall.floor(0, 0, HALL_REACH.lo - 1, 2) === null, 'beyond its reach, the plain floor');
  // the ring round the grate: iron in the tiles about it
  let iron = 0;
  for (const [dx, dy] of [[-1, 2], [5, 2], [2, -1], [2, 5]]) each(A.hall.floor(0, 0, dx, dy)![0], (r, g, b) => (iron += hex(r, g, b) === '#323039' || hex(r, g, b) === '#55505e' ? 1 : 0));
  assert.ok(iron > 40, `the iron ring round it: ${iron} pixels`);
  // (the same hall tile laid twice is the same picture: made once)
  assert.ok(A.hall.floor(4, 8, 1, 1) === A.hall.floor(8, 12, 1, 1), 'made once and kept');
  assert.ok(PRISON_LIGHTS.dark > 0.5 && PRISON_LIGHTS.dark < 0.9, 'its dark');
});

// =================================================================================================
// HIS GATE

function plane(strips: Strip[], alongX: boolean): Map<string, string> {
  const out = new Map<string, string>();
  for (const q of strips) {
    const p = paintingOf(q.s);
    assert.ok(p.w === STRIP && q.s.density === GRAIN, 'a strip a quarter of a tile wide');
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
const lowest = (m: Map<string, string>): number => Math.min(...[...m.keys()].map((k) => Number(k.split(',')[1])));
const gatePics: [string, Sprite][] = [['the pillar', GA.pillar(true)]];
for (const alongX of [true, false]) {
  for (const lit of [false, true]) GA.arch(alongX, true, lit).forEach((q, i) => gatePics.push([`the arch ${alongX}${lit}, ${i}`, q.s]));
  for (const raise of [0, 30, GATE_UP]) GA.portcullis(alongX, true, raise).forEach((q, i) => gatePics.push([`the portcullis ${alongX} ${raise}, ${i}`, q.s]));
  for (let f = 0; f < PG_SLAM_FRAMES; f++) gatePics.push([`the slam ${alongX} ${f}`, prisonGateSlam(alongX, f)]);
}
const FLAMES = new Set(FLAME.map((c) => c.toLowerCase()));

test("his gate: a GateArt; everything but the boss's pillar, arch and portcullis floor 3's own; every picture painted, crisp, nothing cyan", () => {
  const F3 = chainedGates();
  assert.ok(GA.post === F3.post && GA.pillar(false) === F3.pillar(false) && GA.arch(true, false, false) === F3.arch(true, false, false) && GA.portcullis(true, false, 30) === F3.portcullis(true, false, 30), "the plain gates and doors' posts: floor 3's");
  assert.ok(GA.leaf(32, 16) === F3.leaf(32, 16) && GA.lintel(false) === F3.lintel(false) && GA.lever(true) === F3.lever(true), "its doors' leaves, lintels, levers: floor 3's");
  assert.ok(GA.pillar(true) !== F3.pillar(true) && GA.arch(true, true, false) !== F3.arch(true, true, false), "the boss's: his own");
  assert.ok(GA.arch(false, true, true) === GA.arch(false, true, true) && GA.portcullis(true, true, 44) === GA.portcullis(true, true, 44), 'painted once and kept');
  for (const [n, s] of gatePics) {
    const p = paintingOf(s);
    assert.ok(p.bounds() !== null, `${n}: painted`);
    let soft = 0;
    for (let i = 3; i < p.d.length; i += 4) if (p.d[i] !== 0 && p.d[i] !== 255) soft++;
    assert.ok(soft === 0, `${n}: ${soft} soft pixels`);
    const cyan = new Set<string>();
    each(s, (r, g, b) => {
      const [h, sa, v] = hsv(r, g, b);
      if (h >= 160 && h <= 205 && sa > 0.3 && v > 0.4) cyan.add(hex(r, g, b));
    });
    assert.ok(cyan.size === 0, `${n}: cyan ${[...cyan].join(' ')}`);
  }
  // (the pillar and the slam not cut off at their pictures' edges)
  for (const [n, s] of gatePics.filter(([m]) => m === 'the pillar' || m.startsWith('the slam'))) {
    const p = paintingOf(s);
    let edge = 0;
    for (let x = 0; x < p.w; x++) edge += (p.has(x, 0) ? 1 : 0) + (p.has(x, p.h - 1) ? 1 : 0);
    for (let y = 0; y < p.h; y++) edge += (p.has(0, y) ? 1 : 0) + (p.has(p.w - 1, y) ? 1 : 0);
    assert.equal(edge, 0, `${n}: ${edge} pixels on its picture's edge`);
  }
});

test("his gate: the way exactly the game's three tiles, a hero under it with room to spare; light from the upper left, the same gate both ways", () => {
  assert.ok(SPAN === 96 && PILLAR === 12, 'three tiles between pillars three eighths of a tile to a side');
  const way: number[] = [];
  for (let u = -4; u < ARCH_WIDE + 4; u++) if (prisonInWay(u, 0)) way.push(u);
  assert.ok(way.length === SPAN && way[0] === PILLAR, `the way: ${way[0]} to ${way[way.length - 1]}`);
  for (const alongX of [true, false]) {
    const m = plane(GA.arch(alongX, true, false), alongX);
    assert.equal(lowest(m), PG_SPRING, 'it springs from the heads of the pillars');
    for (let v = 0; v < 88; v++) assert.ok(!m.has(`59,${v}`) && !m.has(`60,${v}`), `the middle of the way clear at ${v}`);
  }
  const mean2 = (m: Map<string, string>): number => [...m.values()].reduce((t, c) => t + luma(...rgb(c)), 0) / m.size;
  const X = plane(GA.arch(true, true, false), true);
  const Y = plane(GA.arch(false, true, false), false);
  assert.ok(mean2(X) > mean2(Y) + 3, `the face along x lit: ${mean2(X).toFixed(1)} against ${mean2(Y).toFixed(1)}`);
  assert.deepEqual([...X.keys()].sort(), [...Y.keys()].sort(), 'the same shape both ways');
});

test('his gate: his mark in embers (the enemy\'s, dull) and alight (bright, and it gives the enemy\'s light), on the keystone', () => {
  for (const alongX of [true, false]) {
    const fire = (m: Map<string, string>, cs: string[]): number => [...m.values()].filter((c) => cs.includes(c)).length;
    const dim = plane(GA.arch(alongX, true, false), alongX);
    const lit = plane(GA.arch(alongX, true, true), alongX);
    assert.ok(fire(dim, [FLAME[0], FLAME[1], FLAME[2]]) >= 8 && fire(dim, [FLAME[3], FLAME[4]]) === 0, `in embers: ${fire(dim, [FLAME[0], FLAME[1]])}, none bright`);
    assert.ok(fire(lit, [FLAME[3], FLAME[4]]) >= 30, `alight: ${fire(lit, [FLAME[3], FLAME[4]])} pixels bright`);
    for (const [k, c] of lit) {
      if (!FLAMES.has(c.toLowerCase())) continue;
      const [u, v] = k.split(',').map(Number);
      assert.ok(Math.abs(u + 0.5 - ARCH_WIDE / 2) <= 9 && v >= PG_SPRING + 40 && v <= PG_SPRING + 76, `his fire on the keystone, at ${u},${v}`);
    }
    const lights = GA.arch(alongX, true, true).flatMap((q) => q.s.lights ?? []);
    assert.ok(lights.length === 1 && lights[0].color === FLAME[2], 'alight, the enemy\'s light');
    assert.ok(GA.arch(alongX, true, false).every((q) => !q.s.lights), 'in embers, none');
  }
});

test('his gate: the portcullis from up to down: drawn up, its spikes under the crown; let down step by step, down to the floor on its points', () => {
  for (const alongX of [true, false]) {
    let last = Infinity;
    for (let raise = GATE_UP; raise >= 0; raise -= 2) {
      const m = plane(GA.portcullis(alongX, true, raise), alongX);
      const lo = lowest(m);
      assert.equal(lo, prisonLift(raise), `raised ${raise}: its lowest point ${lo}`);
      assert.ok(lo <= last, 'coming down');
      last = lo;
      for (const k of m.keys()) {
        const [u, v] = k.split(',').map(Number);
        assert.ok(prisonInWay(u, v), `only in the way: ${k}`);
      }
    }
    const down = plane(GA.portcullis(alongX, true, 0), alongX);
    let points = 0;
    for (const b of PG_BARS) if (down.has(`${b},0`)) points++;
    assert.ok(points >= 6, `down to the floor on its points: ${points}`);
    assert.ok(down.size > 2000, `down, it fills the way: ${down.size}`);
  }
  assert.ok(prisonLift(GATE_UP) === PG_LIFT && PG_LIFT >= 56 + 24, `up, its spikes ${PG_LIFT} over the floor (a hero is 56)`);
});

test('his gate: the drop (Movement 9): held juddering at the top, down in two frames, a hard landing and a bounce; the slam\'s soot thins, its sparks an honest orange', () => {
  const D = PRISON_GATE_DROP;
  assert.ok(D.every((r) => r >= 0 && r <= GATE_UP && r % 2 === 0) && D[0] === GATE_UP, 'from the top, the game\'s raise');
  const judder = D.slice(0, PRISON_SLAM_AT - 1);
  assert.ok(judder.length >= 8 && judder.every((r) => r >= GATE_UP - 12) && judder.some((r) => r < GATE_UP), `held at the top, juddering: ${judder.join(' ')}`);
  assert.ok(D[PRISON_SLAM_AT] === 0 && D[PRISON_SLAM_AT - 1] > 0 && D[PRISON_SLAM_AT - 1] < GATE_UP - 12, 'down in two frames');
  const after = D.slice(PRISON_SLAM_AT);
  assert.ok(Math.max(...after) >= 6 && D[D.length - 1] === 0, `a bounce, then down: ${after.join(' ')}`);
  assert.ok(prisonGateDropAt(PRISON_SLAM_AT).slam === 0 && prisonGateDropAt(PRISON_SLAM_AT).lit && !prisonGateDropAt(PRISON_SLAM_AT - 1).lit && prisonGateDropAt(PRISON_SLAM_AT + PG_SLAM_FRAMES).slam === -1, 'the slam and the mark from the landing');
  const n = (f: number): number => count(prisonGateSlam(true, f));
  assert.ok(n(6) > n(0) && n(PG_SLAM_FRAMES - 1) < n(6) / 2, `it billows and thins: ${n(0)}, ${n(6)}, ${n(PG_SLAM_FRAMES - 1)}`);
  for (let f = 0; f < 4; f++) {
    let sparks = 0;
    each(prisonGateSlam(true, f), (r, g, b) => {
      sparks += isFire(r, g, b) ? 1 : 0;
      assert.ok(!FLAMES.has(hex(r, g, b)), 'no pink in the sparks');
    });
    assert.ok(sparks >= 12, `frame ${f}: ${sparks} pixels of sparks`);
  }
});

// =================================================================================================
// THE DOOR OUT OF HIS HALL (src/art/prison_exit.ts): his words, 2 Nov 2026, “Love it, but let’s not have stairs down from his arena
// cause if under it is fire, going down to something else is gonna be weird”; his pick, “Door out the back (Recommended)”.

const EX = [exitArt(true), exitArt(false)];
const doorPics = (k: number): [string, Sprite][] => [
  ...EX[k].frames.map((s, f) => [`door ${k ? 'along y' : 'along x'} frame ${f}`, s] as [string, Sprite]),
  ...EX[k].under.map((s, f) => [`passage ${k ? 'along y' : 'along x'} ${f}`, s] as [string, Sprite]),
];
const exitAll: [string, Sprite][] = [...doorPics(0), ...doorPics(1)];
const FADES = new Set([255, ...FADE_STEPS.map((a) => Math.round(255 * a))]);
/** What is painted inside the doorway's own place on the face (u0..u1 along, 0..high up), in a door picture laid at its anchor. */
function inDoorway(s: Sprite, alongX: boolean): { painted: number; all: number } {
  const p = paintingOf(s);
  const [ax, ay] = anchor(s);
  let painted = 0;
  let all = 0;
  for (let us = EXIT_DOOR.u0 + 2; us < EXIT_DOOR.u1 - 2; us++) {
    const c = ax - 32 + us;
    const foot = alongX ? ay + Math.floor((c - ax) / 2) : ay + Math.floor((ax - c) / 2);
    for (let z = 6; z < EXIT_DOOR.high - 2; z++) {
      all++;
      if (p.has(c, foot - z)) painted++;
    }
  }
  return { painted, all };
}

test('the door out of his hall: every frame and the passage painted; two tiles of wall; at its size, anchored under its middle on the wall\'s line', () => {
  assert.equal(EXIT_TILES, 2, 'two tiles of the wall');
  for (const [n, s] of exitAll) assert.ok(count(s) > 400, `${n}: ${count(s)} pixels`);
  for (const k of [0, 1]) {
    const alongX = k === 0;
    assert.equal(EX[k].frames.length, EXIT_FRAMES, 'every frame of the film');
    assert.ok(EX[k].shut === EX[k].frames[0] && EX[k].open === EX[k].frames[EXIT_FRAMES - 1], 'shut its first, open its last');
    for (const s of EX[k].frames) {
      const q = paintingOf(s);
      assert.ok(q.w === 220 && q.h === 190 && anchor(s)[0] === 110 && anchor(s)[1] === 136 && s.density === GRAIN, 'a door frame 220 x 190 at its anchor');
    }
    for (const s of EX[k].under) {
      const q = paintingOf(s);
      assert.ok(q.w === 370 && q.h === 230 && anchor(s)[0] === (alongX ? 40 : 330) && anchor(s)[1] === 214, 'the passage 370 x 230 at its anchor');
    }
    // its face on the wall's line: laid where the two wall tiles it takes the place of would stand, the foot of every column of its
    // face (the doorway's aside: its jambs and the wall's ends) on the same row as theirs
    const shut = paintingOf(EX[k].shut);
    const [ax, ay] = anchor(EX[k].shut);
    const walls2 = alongX ? A.faceLeft : A.faceRight;
    let checked = 0;
    for (let t = 0; t < 2; t++) {
      const w = walls2[t];
      const wp = paintingOf(w);
      const [wx, wy] = anchor(w);
      // (the wall tile's anchor, its top corner's floor point, from the door's: along x (32 t, 16 t - 32), along y (-32 t, 16 t - 32))
      const ox = ax + (alongX ? 32 * t : -32 * t) - wx;
      const oy = ay + 16 * t - 32 - wy;
      for (let x = 0; x < wp.w; x++) {
        let low = -1;
        for (let y = wp.h - 1; y >= 0; y--) if (wp.has(x, y)) { low = y; break; }
        if (low < 0) continue;
        const c = x + ox;
        const us = c - (ax - 32);
        if (us >= EXIT_DOOR.u0 && us < EXIT_DOOR.u1) continue;
        let dlow = -1;
        for (let y = shut.h - 1; y >= 0; y--) if (shut.has(c, y)) { dlow = y; break; }
        assert.equal(dlow, low + oy, `${alongX ? 'along x' : 'along y'}: the foot of column ${us} on the wall's line`);
        checked++;
      }
    }
    assert.ok(checked >= 20, `${checked} columns checked`);
  }
});

test('the door out of his hall: crisp (every pixel whole but the wall\'s fading top, in the game\'s own steps), nothing cyan, nothing on its picture\'s edge', () => {
  for (const [n, s] of exitAll) {
    const bad = new Set<number>();
    const cyan = new Set<string>();
    each(s, (r, g, b, a) => {
      if (!FADES.has(a)) bad.add(a);
      const [h, sa, v] = hsv(r, g, b);
      if (h >= 160 && h <= 205 && sa > 0.3 && v > 0.4) cyan.add(hex(r, g, b));
    });
    assert.ok(bad.size === 0, `${n}: alpha ${[...bad].join(' ')}`);
    assert.ok(cyan.size === 0, `${n}: cyan ${[...cyan].join(' ')}`);
    const p = paintingOf(s);
    let edge = 0;
    for (let x = 0; x < p.w; x++) edge += (p.has(x, 0) ? 1 : 0) + (p.has(x, p.h - 1) ? 1 : 0);
    for (let y = 0; y < p.h; y++) edge += (p.has(0, y) ? 1 : 0) + (p.has(p.w - 1, y) ? 1 : 0);
    assert.equal(edge, 0, `${n}: ${edge} pixels on its picture's edge (nothing cut off)`);
  }
});

test('the door out of his hall: shut fast in the fight (the leaf fills the doorway, two bars, the great lock, his mark in the enemy\'s embers); open at the end, the passage seen through it', () => {
  const FL = new Set(FLAME.map((c) => c.toLowerCase()));
  for (const k of [0, 1]) {
    const alongX = k === 0;
    const shut = inDoorway(EX[k].shut, alongX);
    assert.ok(shut.painted === shut.all, `shut, the leaf fills the doorway: ${shut.painted} of ${shut.all}`);
    const open = inDoorway(EX[k].open, alongX);
    assert.ok(open.painted < open.all * 0.45, `open, the doorway's depth only (the passage under shows): ${open.painted} of ${open.all}`);
    const fire = (s: Sprite): number => {
      let n = 0;
      each(s, (r, g, b) => (n += FL.has(hex(r, g, b)) ? 1 : 0));
      return n;
    };
    assert.ok(fire(EX[k].shut) >= 6, `his mark's embers while he lives: ${fire(EX[k].shut)}`);
    assert.equal(fire(EX[k].frames[MARK_OUT]), 0, 'out as he falls');
    for (let f = MARK_OUT; f < EXIT_FRAMES; f++) assert.equal(fire(EX[k].frames[f]), 0, `no enemy's fire on it after he falls (frame ${f})`);
    // the passage seen through the open doorway: the layer under painted in the doorway's place, its baskets burning, their light
    const under = inDoorway(EX[k].under[0], alongX);
    assert.ok(under.painted > under.all * 0.8, `the passage through the doorway: ${under.painted} of ${under.all}`);
    let flame = 0;
    each(EX[k].under[0], (r, g, b) => (flame += isFire(r, g, b) ? 1 : 0));
    assert.ok(flame >= 20, `its fire baskets burning: ${flame}`);
    assert.ok((EX[k].under[0].lights ?? []).length >= 2, 'their light');
    assert.ok(count(EX[k].under[0]) !== count(EX[k].under[1]) || EX[k].under[0] !== EX[k].under[1], 'they flicker');
  }
  assert.ok(exitBar('upper', 0) === 0 && exitBar('lower', 0) === 0, 'both bars across it at first');
});

test('the door out of his hall: its opening (Movement 9): his mark out, the bars back one by one with a clank, the lock, HELD a beat, the lurch, a quick swing, the stop; open to walk into at the film\'s end, about 3 s', () => {
  const J = EXIT_JOLTS;
  assert.equal(EXIT_FPS, 30);
  assert.ok(EXIT_OPEN_SECS === EXIT_FRAMES / EXIT_FPS && EXIT_OPEN_SECS >= 2.5 && EXIT_OPEN_SECS <= 3.5, `open to walk into ${EXIT_OPEN_SECS} s after he falls`);
  assert.ok(MARK_OUT < J.upperBar && J.upperBar < J.lowerBar && J.lowerBar < J.lock && J.lock < J.lurch && J.lurch < J.stop && J.stop < EXIT_FRAMES - 20, 'in order, the soot settling after');
  assert.ok(exitBar('upper', J.upperBar - 5) === 0 && exitBar('upper', J.upperBar) >= 52 && exitBar('lower', J.lowerBar - 5) === 0 && exitBar('lower', J.lowerBar) >= 52, 'each bar home at its clank');
  // held: from the lock to the lurch the leaf does not move (a beat of half a second)
  assert.ok(J.lurch - J.lock >= 15, `held ${J.lurch - J.lock} frames`);
  for (let f = 0; f < J.lurch; f++) assert.equal(exitSwing(f), 0, `still at ${f}`);
  // the swing quick: from the catch to the stop in a few frames, smeared; the stop past square, the rebound, at rest square
  const moving: number[] = [];
  for (let f = J.lurch; f <= J.stop; f++) moving.push(exitSwing(f));
  assert.ok(moving.every((d, i) => i === 0 || d >= moving[i - 1]), `opening: ${moving.join(' ')}`);
  let fast = 0;
  for (let f = J.lurch; f < J.stop; f++) if (exitSwing(f + 1) - exitSwing(f) >= 15) fast++;
  assert.ok(fast >= 3 && fast <= 6, `the swing in ${fast} quick frames`);
  assert.ok(exitSwing(J.stop) > 90 && exitSwing(J.stop + 2) < exitSwing(J.stop) && exitSwing(EXIT_FRAMES - 1) === 90, 'the stop, the rebound, at rest');
  assert.ok(exitSpill(0) === 0 && exitSpill(J.lurch - 1) === 0 && exitSpill(EXIT_FRAMES - 1) === 1, "the doorway's light from the lurch");
  // the frames change at each jolt (a clank is seen), and the door is still between the lock and the lurch but for grit
  const differ = (a: Sprite, b: Sprite): number => {
    const p = paintingOf(a);
    const q = paintingOf(b);
    let n = 0;
    for (let i = 0; i < p.d.length; i += 4) if (p.d[i] !== q.d[i] || p.d[i + 1] !== q.d[i + 1] || p.d[i + 2] !== q.d[i + 2] || p.d[i + 3] !== q.d[i + 3]) n++;
    return n;
  };
  for (const j of [J.upperBar, J.lowerBar, J.lock, J.lurch, J.stop]) assert.ok(differ(EX[0].frames[j], EX[0].frames[j - 2]) > 20, `something moves at ${j}`);
  // the soot gone by the end
  assert.ok(count(EX[0].open) < count(EX[0].frames[J.stop + 6]), 'the soot thins and goes');
  // the shudder before the bars go: the door jars
  assert.ok(differ(EX[0].frames[6], EX[0].frames[5]) > 40, 'it shudders');
});

test('the door out of his hall: the passage leads away from the hall (back from the wall) and down (its steps), lit; the doorway\'s two tiles take him on', () => {
  const P = EXIT_PASSAGE;
  assert.ok(P.stepsAt < -32 && P.steps >= 5 && P.rise > 0 && P.end < P.stepsAt - P.steps * P.tread, 'level beyond the wall, then steps down, then on into the dark');
  assert.ok(P.baskets.every((b) => b < -32 && b > P.end), 'its fire baskets down its length');
  assert.ok(EXIT_LIGHTS.baskets.length === P.baskets.length && EXIT_LIGHTS.path.length >= 3 && EXIT_LIGHTS.path.every((q, i) => i === 0 || q.strength <= EXIT_LIGHTS.path[i - 1].strength), 'its light, dimmer as it goes down');
  // away from the hall: up the screen from the door; along x to the screen's right, along y to its left
  for (const k of [0, 1]) {
    const p = paintingOf(EX[k].under[0]);
    const [ax, ay] = anchor(EX[k].under[0]);
    let far = 0;
    for (let y = 0; y < ay - 120; y++) for (let x = 0; x < p.w; x++) if (p.has(x, y) && (k === 0 ? x > ax + 80 : x < ax - 80)) far++;
    assert.ok(far > 2000, `${k ? 'along y' : 'along x'}: the passage going on beyond the wall: ${far}`);
  }
  assert.deepEqual(EXIT_TAKES.map((t) => [...t]), [[0, 0], [1, 0]], "the doorway's two tiles in the wall's row");
});
