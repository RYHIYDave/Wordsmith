// FLOOR 4, THE BURIED CHAPEL OF BONES, LOOK A WITH B'S BREAK-IN, MADE GAME-READY (src/art/chapel.ts behind CHAPEL, off; his gate,
// src/art/chapel_gate.ts behind CHAPEL_GATE, off; nothing of the game imports them), held to his art rulebook before it goes to
// the main chat: off and imported by nothing of the game; every picture painted, at its size and anchored where the game lays it
// (a floor tile at its top corner, a wall tile at its top corner's floor point with its face hanging to the floor, as high as
// floor 4's walls, its top fading out as the game's; the stretches of three tiles, the way in, the break-in and the cave, on the
// wall's line exactly where the three tiles they replace would stand); crisp (every pixel all there or not at all but the walls'
// fading tops, in the game's own four steps; a floor tile covering its whole diamond; no pixel alone); nothing cyan (the
// friend's), nothing pink (the enemy's) but his maw; the floor and walls darker than the darkest word; light from the upper left;
// the pilasters every two tiles; the candles' flames moving, their light; floor 4's own pieces in look A's colours, their shapes
// and fire as they were; the cave (art/cave4.ts) its shape, size, anchor and film unchanged; and his gate: the way the game's
// three tiles, the maw in embers and alight, the drop from up to down, its timing (Movement 9), the slam.
//   run: tsx --test tests/chapel.test.ts

// @ts-ignore
import { readdirSync, readFileSync, statSync } from 'node:fs';
// @ts-ignore
import { join } from 'node:path';
import {
  CHAPEL, CHAPEL_FADE, CHAPEL_LIGHTS, CHAPEL_OWN, CHAPEL_WALL, FADE_STEPS, gradedA, makeChapelArt,
} from '../src/art/chapel';
import {
  CG_BONES, CG_LIFT, CG_SLAM_FRAMES, CG_SPRING, CHAPEL_GATE, CHAPEL_GATE_DROP, CHAPEL_SLAM_AT, MAW_Z, chapelGateDropAt, chapelGateSlam,
  chapelInWay, chapelLift, makeChapelGateArt,
} from '../src/art/chapel_gate';
import { ossuaryGates, ossuaryPieces } from '../src/art/floor4';
import { CAVE_FRAMES, caveFilm } from '../src/art/cave4';
import { ARCH_WIDE, GATE_UP, PILLAR, SPAN, STRIP } from '../src/art/gates';
import type { Strip } from '../src/art/gates';
import { WALL_LOOK } from '../src/art/ground';
import { cryptGround } from '../src/art/crypt';
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
const A = makeChapelArt();
const GA = makeChapelGateArt();

const floors: Sprite[] = [];
for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) floors.push(A.floor(x, y));
const walls: [string, Sprite][] = [];
A.faceLeft.forEach((fr, k) => fr.forEach((s, f) => walls.push([`wall along x ${k} frame ${f}`, s])));
A.faceRight.forEach((fr, k) => fr.forEach((s, f) => walls.push([`wall along y ${k} frame ${f}`, s])));
A.hall.faceLeft.forEach((fr, k) => fr.forEach((s, f) => walls.push([`hall wall along x ${k} frame ${f}`, s])));
A.hall.faceRight.forEach((fr, k) => fr.forEach((s, f) => walls.push([`hall wall along y ${k} frame ${f}`, s])));
const tiles: [string, Sprite][] = A.tiles.flatMap((p) => p.frames!.map((s, f) => [`${p.name} ${f}`, s] as [string, Sprite]));
const stretches: [string, Sprite][] = [];
for (const alongX of [true, false]) {
  A.breakIn(alongX).frames.forEach((s, f) => stretches.push([`break-in ${alongX ? 'along x' : 'along y'} frame ${f}`, s]));
  A.wayIn(alongX).frames.forEach((s, f) => stretches.push([`way in ${alongX ? 'along x' : 'along y'} frame ${f}`, s]));
}
const ownPieces = A.pieces.filter((p) => (CHAPEL_OWN as readonly string[]).includes(p.name));
const mine: [string, Sprite][] = [
  ...floors.map((s, i) => [`flags ${i}`, s] as [string, Sprite]),
  ...tiles,
  ...walls,
  ...stretches,
  ...ownPieces.flatMap((p) => sprites(p).map((s, i) => [`${p.name} ${i}`, s] as [string, Sprite])),
];
const floorLike: Sprite[] = [...floors, ...tiles.map(([, s]) => s)];
const FIRE = new Set(EMBER.map((c) => c.toLowerCase()));
const isFire = (r: number, g: number, b: number): boolean => FIRE.has(hex(r, g, b));
const FADES = new Set([255, ...FADE_STEPS.map((a) => Math.round(255 * a))]);
const cyanIn = (s: Sprite): string[] => {
  const out = new Set<string>();
  each(s, (r, g, b) => {
    const [h, sa, v] = hsv(r, g, b);
    if (h >= 160 && h <= 205 && sa > 0.3 && v > 0.4) out.add(hex(r, g, b));
  });
  return [...out];
};
const pinkIn = (s: Sprite, allowShines: boolean): string[] => {
  const out = new Set<string>();
  each(s, (r, g, b) => {
    const [h, sa, v] = hsv(r, g, b);
    const c = hex(r, g, b);
    if (h >= 290 && h <= 352 && sa > 0.45 && v > 0.3 && !(allowShines && SHINES.has(c))) out.add(c);
  });
  return [...out];
};

test('the chapel and his gate: off; brought into the game by the main chat, and by nothing else', () => {
  // (2 Nov 2026, his “New looks for the first 5 floors are almost done.  We want those in the release as well”: the main chat brought
  // it in behind its switches, off until his yes to it in play)
  const BROUGHT = ['art/chapel.ts', 'art/chapel_gate.ts', 'art/films.ts', 'art/floors.ts', 'game/chapel_way.ts', 'game/first5.ts', 'game/floor_looks.ts', 'main.ts', 'render/chapel.ts', 'render/dress.ts', 'render/render.ts'].map((f) => join('src', f));
  assert.ok(CHAPEL.on === false && CHAPEL_GATE.on === false, 'CHAPEL and CHAPEL_GATE are off');
  const found: string[] = [];
  const walk = (d: string): void => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith('.ts') && !p.includes(join('src', 'dev')) && !BROUGHT.includes(p) && /from '\.\.?\/(art\/)?chapel(_gate)?'/.test(readFileSync(p, 'utf8'))) found.push(p);
    }
  };
  walk('src');
  assert.ok(found.length === 0, `imported by ${found.join(', ')}`);
});

test('the chapel: every picture painted, the pieces the brief asks for', () => {
  for (const [n, s] of mine) assert.ok(count(s) > 20, `${n}: ${count(s)} pixels`);
  const names = A.tiles.map((p) => p.name);
  for (const n of [
    'a grave slab', 'a grave slab along x, its head', 'a grave slab along x, its foot', 'a grave slab along y, its head', 'a grave slab along y, its foot',
    'bone dust', 'bone dust at a wall along x', 'bone dust at a wall along y', 'bone chips', 'rubble from the break, along x', 'rubble from the break, along y',
    'earth spilled from the break, along x', 'earth spilled from the break, along y',
  ]) assert.ok(names.includes(n), `the tile "${n}"`);
  for (const n of CHAPEL_OWN) assert.ok(A.pieces.some((p) => p.name === n), `the piece "${n}"`);
  // floor 4's own, all of them (the cult's altar among them, and the rails' end the break-in's floor wants)
  for (const p of ossuaryPieces()) assert.ok(A.pieces.some((q) => q.name === p.name), `floor 4's own "${p.name}"`);
  assert.ok(A.faceLeft.length === 4 && A.faceRight.length === 4 && A.hall.faceLeft.length === 4 && A.hall.faceRight.length === 4, 'the walls');
  assert.ok([...A.faceLeft, ...A.faceRight, ...A.hall.faceLeft, ...A.hall.faceRight].every((fr) => fr.length === 4), 'four frames each (the candles)');
  for (const alongX of [true, false]) assert.ok(A.breakIn(alongX).frames.length === 4 && A.wayIn(alongX).frames.length === 4, 'the break-in and the way in, four frames each');
});

test("the chapel: every picture at its size and anchored where the game lays it; the walls as high as floor 4's, their tops fading as the game's", () => {
  assert.equal(CHAPEL_WALL, WALL_LOOK.tall * GRAIN, "as high as the game's walls (WALL_LOOK.tall)");
  assert.equal(CHAPEL_FADE, WALL_LOOK.fade * GRAIN, "their tops fading as far down as the game's (WALL_LOOK.fade)");
  for (const s of floorLike) {
    const q = paintingOf(s);
    assert.ok(q.w === 64 && q.h === 32 && anchor(s)[0] === 32 && anchor(s)[1] === 0 && s.density === GRAIN, 'a floor tile 64 x 32 at its top corner');
  }
  for (const [n, s] of walls) {
    const q = paintingOf(s);
    const [, ay] = anchor(s);
    assert.ok(q.w === 64 && q.h === 32 + CHAPEL_WALL && anchor(s)[0] === 32 && ay === CHAPEL_WALL, `${n}: 64 x ${32 + CHAPEL_WALL} at the floor point of its top corner`);
    let low = -1;
    for (let x = 0; x < q.w; x++) {
      let k = 0;
      for (let y = 0; y < q.h; y++) if (q.has(x, y)) {
        k++;
        low = Math.max(low, y);
      }
      const want = x === 0 || x === q.w - 1 ? 0 : CHAPEL_WALL;
      if ((n.includes('along x') && x < 32) || (n.includes('along y') && x >= 32)) assert.equal(k, want, `${n}: column ${x} ${k} high`);
    }
    assert.ok(low >= ay + 28 && low <= ay + 33, `${n}: its foot ${low - ay} below its anchor`);
  }
  // (the chapel's wall tiles lie exactly where the game's own walls lie: column by column, the same top and the same foot)
  for (const [mineS, theirs] of [[A.faceLeft[1][0], cryptGround(4).faceLeft[0]], [A.faceRight[1][0], cryptGround(4).faceRight[0]]] as const) {
    const pa = paintingOf(mineS);
    const pb = paintingOf(theirs);
    assert.ok(pa.w === pb.w && pa.h === pb.h && anchor(mineS)[0] === anchor(theirs)[0] && anchor(mineS)[1] === anchor(theirs)[1], "as big as the game's, anchored as the game's");
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
  for (const [n, s] of stretches) {
    const q = paintingOf(s);
    const [ax, ay] = anchor(s);
    assert.ok(q.w === 160 && q.h === 200 && ax === (n.includes('along x') ? 92 : 68) && ay === 136 && s.density === GRAIN, `${n}: 160 x 200 at the foot of its face under its middle`);
  }
  const piece = (name: string): Sprite[] => sprites(A.pieces.find((p) => p.name === name)!);
  for (const n of ['candles on the floor, a few', 'candles on the floor, many']) for (const s of piece(n)) assert.ok(paintingOf(s).w === 64 && anchor(s)[0] === 32 && anchor(s)[1] === 44, `${n}: at the floor point at their middle`);
  for (const n of ['rock spilled from the break, along x', 'rock spilled from the break, along y']) for (const s of piece(n)) assert.ok(anchor(s)[0] === 60 && anchor(s)[1] === 66, `${n}: at the floor point under its middle`);
  for (const n of ['a pier of the hall, its ribs toward x', 'a pier of the hall, its ribs away from x']) for (const s of piece(n)) assert.ok(anchor(s)[0] === 110 && anchor(s)[1] === 240 && paintingOf(s).h - anchor(s)[1] <= 20, `${n}: at the floor point under its middle`);
});

test("the chapel, Pixels 1: crisp, every pixel all there or not at all (but a wall's top, fading out in the game's four steps); a floor tile covers its whole diamond; no pixel alone", () => {
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
        if (wall && steps.has(a) && y - top < CHAPEL_FADE && Math.round(255 * FADE_STEPS[Math.floor(((y - top) * 4) / CHAPEL_FADE)]) === a) continue;
        if (!wall && steps.has(a)) continue;
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
  // (and nothing cut off at a picture's edge: the stretches and the standing pieces)
  for (const [n, s] of [...stretches, ...ownPieces.flatMap((p) => sprites(p).map((q, i) => [`${p.name} ${i}`, q] as [string, Sprite]))]) {
    const p = paintingOf(s);
    let edge = 0;
    for (let x = 0; x < p.w; x++) edge += (p.has(x, 0) ? 1 : 0) + (p.has(x, p.h - 1) ? 1 : 0);
    for (let y = 0; y < p.h; y++) edge += (p.has(0, y) ? 1 : 0) + (p.has(p.w - 1, y) ? 1 : 0);
    assert.equal(edge, 0, `${n}: ${edge} pixels on its picture's edge`);
  }
});

test("the chapel, Colour 3: nothing cyan, nothing pink (the friend's and the enemy's glows); fire an honest gold and orange", () => {
  for (const [n, s] of mine) {
    const c = cyanIn(s);
    const p = pinkIn(s, false);
    assert.ok(c.length === 0 && p.length === 0, `${n}: ${[...c, ...p].join(' ')}`);
  }
  // (floor 4's own pieces: no cyan; pink only where it was the enemy's own fire)
  for (const p of A.pieces) for (const s of sprites(p)) {
    const b = [...cyanIn(s), ...pinkIn(s, true)];
    assert.ok(b.length === 0, `${p.name}: ${b.join(' ')}`);
  }
  // the lights: candle gold and the miners' orange, never cyan or pink
  for (const [k, l] of Object.entries(CHAPEL_LIGHTS)) {
    if (typeof l !== 'object') continue;
    const [h, sa] = hsv(...rgb(l.glow.color));
    assert.ok(h >= 20 && h <= 50 && sa > 0.5, `${k}: its glow ${l.glow.color} a warm gold or orange`);
  }
});

test('the chapel, Colour 4: its floor and its walls darker than the darkest word (at the 99th of their pixels; fire is light)', () => {
  const darkest = Math.min(...Object.values(WORD_COLOR).map((c) => luma(...rgb(c))));
  const bad: string[] = [];
  for (const [n, s] of [...floors.map((s, i) => [`flags ${i}`, s] as [string, Sprite]), ...tiles, ...walls, ...stretches]) {
    const h = new Array<number>(256).fill(0);
    each(s, (r, g, b) => {
      if (isFire(r, g, b)) return;
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
});

test('the chapel, Pixels 4: light from the upper left (a wall turned to screen-left lighter than one turned to screen-right); the pilasters every two tiles', () => {
  const m = (list: Sprite[][]): number => list.reduce((t, fr) => t + mean(fr[0]), 0) / list.length;
  assert.ok(m(A.faceLeft) > m(A.faceRight) + 3, `turned left ${m(A.faceLeft).toFixed(0)}, right ${m(A.faceRight).toFixed(0)}`);
  assert.ok(m(A.hall.faceLeft) > m(A.hall.faceRight) + 3, `the hall's walls: ${m(A.hall.faceLeft).toFixed(0)}, ${m(A.hall.faceRight).toFixed(0)}`);
  for (let t = 0; t < 8; t++) {
    for (const alongX of [true, false]) {
      const s = alongX ? A.face(true, t, 3) : A.face(false, 3, t);
      const list = alongX ? A.faceLeft : A.faceRight;
      const k = list.findIndex((fr) => fr.includes(s));
      assert.ok(k >= 0 && (k % 2 === 0) === (t % 2 === 0), `tile ${t} ${alongX ? 'along x' : 'along y'}: variant ${k}`);
    }
  }
  assert.ok(A.face(true, 2, 3, 1) === A.faceLeft[A.faceLeft.findIndex((fr) => fr.includes(A.face(true, 2, 3, 0)))][1], 'its frames by f');
});

test('the chapel: candles in the niches all through, and on the floor; their flames move (four frames that differ), their light', () => {
  const fire = (s: Sprite): number => {
    let n = 0;
    each(s, (r, g, b) => (n += isFire(r, g, b) ? 1 : 0));
    return n;
  };
  const differ = (a: Sprite, b: Sprite): number => {
    const p = paintingOf(a);
    const q = paintingOf(b);
    let n = 0;
    for (let i = 0; i < p.d.length; i += 4) if (p.d[i] !== q.d[i] || p.d[i + 1] !== q.d[i + 1] || p.d[i + 2] !== q.d[i + 2] || p.d[i + 3] !== q.d[i + 3]) n++;
    return n;
  };
  for (const list of [A.faceLeft, A.faceRight, A.hall.faceLeft, A.hall.faceRight]) {
    for (const fr of list) {
      for (const s of fr) assert.ok(fire(s) >= 12, `a tile of wall: its candles' flames (${fire(s)} pixels)`);
      assert.ok(differ(fr[0], fr[1]) > 0 && differ(fr[0], fr[3]) > 0, 'their flames move');
    }
  }
  for (const n of ['candles on the floor, a few', 'candles on the floor, many']) {
    const fr = A.pieces.find((p) => p.name === n)!.frames!;
    assert.ok(fr.length === 4 && fr.every((s) => fire(s) >= 10 && (s.lights ?? []).length === 1 && s.lights![0].color === CHAPEL_LIGHTS.floorCandles.glow.color), `${n}: four frames, fire, their light`);
    assert.ok(differ(fr[0], fr[1]) > 0, `${n}: their flames move`);
  }
  // the break-in's lantern and the way in's firelight up the stair
  for (const alongX of [true, false]) {
    const b = A.breakIn(alongX).frames;
    assert.ok(b.every((s) => fire(s) >= 20 && (s.lights ?? []).length === 1 && s.lights![0].color === EMBER[2]), "the miner's lantern: its flame, its orange light");
    assert.ok(differ(b[0], b[1]) > 0, 'it flickers');
    assert.ok(A.wayIn(alongX).frames.every((s) => (s.lights ?? []).length === 1), "the way in: floor 3's firelight up the stair");
  }
  assert.ok(CHAPEL_LIGHTS.dark > 0.5 && CHAPEL_LIGHTS.dark < 0.88, 'its dark, lighter than the Crypt\'s');
});

test("the chapel: floor 4's own pieces in look A's colours: every one there, its shapes and its fire as they were, its colours drawn toward the grey", () => {
  const before = ossuaryPieces();
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
      }
      assert.ok(shape === 0 && fire === 0, `${p.name} ${i}: ${shape} pixels changed shape, ${fire} of its fire changed`);
      assert.equal((a[i].lights ?? []).length, (b[i].lights ?? []).length, `${p.name} ${i}: its lights`);
    }
  }
  for (const c of ['#5a5378', '#867ea6', '#7e4466']) {
    const [, s0] = hsv(...rgb(c));
    const [, s1] = hsv(...rgb(gradedA(c)));
    assert.ok(s1 < s0, `${c} to ${gradedA(c)}`);
  }
});

// =================================================================================================
// THE STRETCHES ON THE WALL'S LINE: the way in, the break-in, and the cave (art/cave4.ts, unchanged), each where the three wall tiles
// it takes the place of would stand

/** Where three wall tiles would lie in a stretch's picture: for each of its columns, the top row of their face and its foot. */
function wallLine(stretch: Sprite, alongX: boolean): Map<number, [number, number]> {
  const out = new Map<number, [number, number]>();
  const [sax, say] = anchor(stretch);
  const list = alongX ? A.faceLeft : A.faceRight;
  for (let t = 0; t < 3; t++) {
    const w = list[1][0];
    const wp = paintingOf(w);
    const [wx, wy] = anchor(w);
    // (the tile's top corner from the stretch's anchor: along x (32 t - 16, 16 t - 40); along y (16 - 32 t, 16 t - 40))
    const ox = alongX ? 32 * t - 16 : 16 - 32 * t;
    const oy = 16 * t - 40;
    for (let x = 0; x < wp.w; x++) {
      let top = -1;
      let low = -1;
      for (let y = 0; y < wp.h; y++) if (wp.has(x, y)) {
        if (top < 0) top = y;
        low = y;
      }
      if (top < 0) continue;
      out.set(sax + ox + x - wx, [say + oy + top - wy, say + oy + low - wy]);
    }
  }
  return out;
}
/** For each column of a picture: its first row with a pixel of the wall's topmost fading step, its first painted row and its last. */
function columns(p: Px): Map<number, { fadeTop: number; top: number; low: number }> {
  const out = new Map<number, { fadeTop: number; top: number; low: number }>();
  const step0 = Math.round(255 * FADE_STEPS[0]);
  for (let x = 0; x < p.w; x++) {
    let fadeTop = -1;
    let top = -1;
    let low = -1;
    for (let y = 0; y < p.h; y++) {
      const a = p.d[(y * p.w + x) * 4 + 3];
      if (a === 0) continue;
      if (top < 0) top = y;
      if (fadeTop < 0 && a === step0) fadeTop = y;
      low = y;
    }
    if (top >= 0) out.set(x, { fadeTop, top, low });
  }
  return out;
}

test('the break-in and the way in: on the wall\'s line, exactly where the three tiles they take the place of would stand (the wall\'s fading top where theirs would be)', () => {
  for (const alongX of [true, false]) {
    for (const [name, s] of [['the break-in', A.breakIn(alongX).frames[0]], ['the way in', A.wayIn(alongX).frames[0]]] as const) {
      const line = wallLine(s, alongX);
      const cols = columns(paintingOf(s));
      let checked = 0;
      for (const [x, [top]] of line) {
        const c = cols.get(x);
        if (!c || c.fadeTop < 0) continue;
        assert.equal(c.fadeTop, top, `${name} ${alongX ? 'along x' : 'along y'}: column ${x}, its wall's top`);
        checked++;
      }
      assert.ok(checked >= (name === 'the way in' ? 8 : 40), `${name}: ${checked} columns of its wall's top on the line`);
      // (and nothing of the wall's face beyond the three tiles' columns)
      const xs = [...line.keys()];
      const lo = Math.min(...xs);
      const hi = Math.max(...xs);
      for (const [x, c] of cols) if (c.fadeTop >= 0) assert.ok(x >= lo - 1 && x <= hi + 1, `${name}: its wall within its three tiles (${x})`);
    }
  }
});

const cave4 = caveFilm(true);
const cave = A.hall.cave(true);
test("the cave to floor 5 (art/cave4.ts, his yes): its shape, size, anchor and film unchanged, in look A's colours; on the hall's wall's line, as high as its walls", () => {
  const same = (a: Sprite, b: Sprite, n: string): void => {
    const pa = paintingOf(a);
    const pb = paintingOf(b);
    assert.ok(pa.w === pb.w && pa.h === pb.h && a.ax === b.ax && a.ay === b.ay, `${n}: its size and anchor`);
    let shape = 0;
    let colour = 0;
    for (let k = 0; k < pa.d.length; k += 4) {
      if (pa.d[k + 3] !== pb.d[k + 3]) shape++;
      if (pa.d[k + 3] && (pa.d[k] !== pb.d[k] || pa.d[k + 1] !== pb.d[k + 1] || pa.d[k + 2] !== pb.d[k + 2])) colour++;
    }
    assert.ok(shape === 0, `${n}: ${shape} pixels changed shape`);
    assert.ok(colour > 1000, `${n}: in look A's colours (${colour} pixels changed colour)`);
  };
  same(cave4.before, cave.before, 'the wall standing');
  for (const f of [0, 34, 60, CAVE_FRAMES - 1]) same(cave4.frames[f], cave.frame(f), `frame ${f}`);
  same(cave4.under, cave.under, 'the cave, under');
  same(cave4.over, cave.over, 'the cave, over');
  assert.deepEqual(cave.jolts, cave4.jolts, 'its jolts');
  assert.ok(cave.frame(5) === cave.frame(5), 'each frame graded once and kept');
  // on the wall's line: its face's foot where the three wall tiles' would be, 80 high, column by column
  const line = wallLine(cave.before, true);
  const cols = columns(paintingOf(cave.before));
  let checked = 0;
  let proud = 0;
  for (const [x, [top, low]] of line) {
    const c = cols.get(x);
    assert.ok(c, `column ${x}: the cave's wall there`);
    // (its foot on the wall's line: here and there a bone's end a pixel proud of it, as cave4.ts painted it)
    assert.ok(c!.low === low || c!.low === low + 1, `column ${x}: its foot on the wall's line (${c!.low - low})`);
    if (c!.low !== low) proud++;
    assert.ok(Math.abs(c!.top - top) <= 1, `column ${x}: as high as the walls (${low - c!.top + 1})`);
    checked++;
  }
  // (a pixel proud in every other column, as it stands among the game's own walls now: the chapel's walls lie exactly on theirs)
  assert.ok(checked >= 90 && proud <= checked * 0.6, `${checked} columns, ${proud} a pixel proud`);
  for (const s of [cave.before, cave.frame(60), cave.under, cave.over]) assert.ok(cyanIn(s).length === 0, 'nothing cyan');
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
  for (const raise of [0, 30, GATE_UP]) GA.portcullis(alongX, true, raise).forEach((q, i) => gatePics.push([`the drop ${alongX} ${raise}, ${i}`, q.s]));
  for (let f = 0; f < CG_SLAM_FRAMES; f++) gatePics.push([`the slam ${alongX} ${f}`, chapelGateSlam(alongX, f)]);
}
const FLAMES = new Set(FLAME.map((c) => c.toLowerCase()));

test("his gate: a GateArt; everything but the boss's pillar, arch and drop floor 4's own (in look A's colours); every picture painted, crisp, nothing cyan, nothing pink but his maw", () => {
  const F4 = ossuaryGates();
  const like = (a: Sprite, b: Sprite): boolean => {
    const pa = paintingOf(a);
    const pb = paintingOf(b);
    if (pa.w !== pb.w || pa.h !== pb.h || a.ax !== b.ax || a.ay !== b.ay) return false;
    for (let k = 3; k < pa.d.length; k += 4) if (pa.d[k] !== pb.d[k]) return false;
    return true;
  };
  assert.ok(like(GA.post, F4.post) && like(GA.pillar(false), F4.pillar(false)) && like(GA.leaf(32, 16), F4.leaf(32, 16)) && like(GA.lever(true), F4.lever(true)), "the doors' and plain gates' pictures: floor 4's own, their shapes");
  const pa = GA.arch(true, false, false);
  const pb = F4.arch(true, false, false);
  assert.ok(pa.length === pb.length && pa.every((q, i) => q.t === pb[i].t && like(q.s, pb[i].s)), "the plain gates' arches: floor 4's own");
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
  // (the pink only in the maw, in the gable's roundel)
  for (const alongX of [true, false]) for (const lit of [false, true]) {
    for (const [k, c] of plane(GA.arch(alongX, true, lit), alongX)) {
      const [r, g, b] = rgb(c);
      const [h, sa, v] = hsv(r, g, b);
      if (!(h >= 290 && h <= 352 && sa > 0.45 && v > 0.3)) continue;
      const [u, vv] = k.split(',').map(Number);
      assert.ok(Math.hypot(u + 0.5 - ARCH_WIDE / 2, vv + 0.5 - MAW_Z) < 12, `pink only in his maw: ${k}`);
    }
  }
  // (the pillar and the slam not cut off at their pictures' edges)
  for (const [n, s] of gatePics.filter(([m]) => m === 'the pillar' || m.startsWith('the slam'))) {
    const p = paintingOf(s);
    let edge = 0;
    for (let x = 0; x < p.w; x++) edge += (p.has(x, 0) ? 1 : 0) + (p.has(x, p.h - 1) ? 1 : 0);
    for (let y = 0; y < p.h; y++) edge += (p.has(0, y) ? 1 : 0) + (p.has(p.w - 1, y) ? 1 : 0);
    assert.equal(edge, 0, `${n}: ${edge} pixels on its picture's edge`);
  }
  // (the pillar: on its front corner, as high as the spring)
  const pp = paintingOf(GA.pillar(true));
  const b = pp.bounds()!;
  const high = anchor(GA.pillar(true))[1] - b.y;
  assert.ok(high >= CG_SPRING + 8 && high <= CG_SPRING + 18, `the pillar up to the spring (its back corner a little higher on the screen): ${high}`);
});

test("his gate: the way exactly the game's three tiles, a hero under it with room to spare; a pointed arch; light from the upper left, the same gate both ways", () => {
  assert.ok(SPAN === 96 && PILLAR === 12, 'three tiles between pillars three eighths of a tile to a side');
  const way: number[] = [];
  for (let u = -4; u < ARCH_WIDE + 4; u++) if (chapelInWay(u, 0)) way.push(u);
  assert.ok(way.length === SPAN && way[0] === PILLAR, `the way: ${way[0]} to ${way[way.length - 1]}`);
  // pointed: high in the middle, its sides near upright, its crown 123
  let crown = 0;
  for (let v = 0; v < 200; v++) if (chapelInWay(59, v)) crown = v;
  assert.ok(crown >= 118 && crown <= 124, `its crown at ${crown}`);
  for (const alongX of [true, false]) {
    const m = plane(GA.arch(alongX, true, false), alongX);
    assert.equal(lowest(m), CG_SPRING, 'it springs from the heads of the pillars');
    for (let v = 0; v < 110; v++) assert.ok(!m.has(`59,${v}`) && !m.has(`60,${v}`), `the middle of the way clear at ${v}`);
  }
  const mean2 = (m: Map<string, string>): number => [...m.values()].reduce((t, c) => t + luma(...rgb(c)), 0) / m.size;
  const X = plane(GA.arch(true, true, false), true);
  const Y = plane(GA.arch(false, true, false), false);
  assert.ok(mean2(X) > mean2(Y) + 3, `the face along x lit: ${mean2(X).toFixed(1)} against ${mean2(Y).toFixed(1)}`);
  assert.deepEqual([...X.keys()].sort(), [...Y.keys()].sort(), 'the same shape both ways');
});

test("his gate: his maw in embers (the enemy's, dull) and alight (pink to gold, and it gives the enemy's light), in the gable's roundel", () => {
  for (const alongX of [true, false]) {
    const fire = (m: Map<string, string>, cs: string[]): number => [...m.values()].filter((c) => cs.includes(c)).length;
    const dim = plane(GA.arch(alongX, true, false), alongX);
    const lit = plane(GA.arch(alongX, true, true), alongX);
    assert.ok(fire(dim, [FLAME[0], FLAME[1]]) >= 8 && fire(dim, [FLAME[3], FLAME[4]]) === 0, `in embers: ${fire(dim, [FLAME[0], FLAME[1]])}, none bright`);
    assert.ok(fire(lit, [FLAME[3], FLAME[4]]) >= 20 && fire(lit, [FLAME[1], FLAME[2]]) >= 10, `alight: ${fire(lit, [FLAME[3], FLAME[4]])} pixels gold, pink at its rim`);
    for (const [k, c] of lit) {
      if (!FLAMES.has(c.toLowerCase())) continue;
      const [u, v] = k.split(',').map(Number);
      assert.ok(Math.hypot(u + 0.5 - ARCH_WIDE / 2, v + 0.5 - MAW_Z) < 12, `his fire in the maw, at ${u},${v}`);
    }
    const lights = GA.arch(alongX, true, true).flatMap((q) => q.s.lights ?? []);
    assert.ok(lights.length === 1 && lights[0].color === FLAME[2], "alight, the enemy's light");
    assert.ok(GA.arch(alongX, true, false).every((q) => !q.s.lights), 'in embers, none');
  }
});

test('his gate: the drop from up to down: drawn up, its points under the crown at 88; let down step by step, down to the floor on its points; a grille of bone bound with iron', () => {
  for (const alongX of [true, false]) {
    let last = Infinity;
    for (let raise = GATE_UP; raise >= 0; raise -= 2) {
      const m = plane(GA.portcullis(alongX, true, raise), alongX);
      const lo = lowest(m);
      assert.equal(lo, chapelLift(raise), `raised ${raise}: its lowest point ${lo}`);
      assert.ok(lo <= last, 'coming down');
      last = lo;
      for (const k of m.keys()) {
        const [u, v] = k.split(',').map(Number);
        assert.ok(chapelInWay(u, v), `only in the way: ${k}`);
      }
    }
    const down = plane(GA.portcullis(alongX, true, 0), alongX);
    let points = 0;
    for (const b of CG_BONES) if (down.has(`${b},0`)) points++;
    assert.ok(points >= 6, `down to the floor on its points: ${points}`);
    assert.ok(down.size > 1500, `down, it fills the way: ${down.size}`);
    // bone, and iron across it
    const values = [...down.values()];
    const bone = values.filter((c) => { const [h, sa] = hsv(...rgb(c)); return sa > 0.15 && h >= 20 && h <= 50; }).length;
    const iron = values.filter((c) => { const [, sa, v] = hsv(...rgb(c)); return sa < 0.2 && v < 0.45; }).length;
    assert.ok(bone > 500 && iron > 200, `bone ${bone}, iron ${iron}`);
  }
  assert.ok(chapelLift(GATE_UP) === CG_LIFT && CG_LIFT >= 56 + 24, `up, its points ${CG_LIFT} over the floor (a hero is 56)`);
});

test("his gate: the drop (Movement 9): held juddering at the top, down in two frames, a hard landing and a bounce; the slam's bone dust thins, its chips are bone", () => {
  const D = CHAPEL_GATE_DROP;
  assert.ok(D.every((r) => r >= 0 && r <= GATE_UP && r % 2 === 0) && D[0] === GATE_UP, "from the top, the game's raise");
  const judder = D.slice(0, CHAPEL_SLAM_AT - 1);
  assert.ok(judder.length >= 8 && judder.every((r) => r >= GATE_UP - 12) && judder.some((r) => r < GATE_UP), `held at the top, juddering: ${judder.join(' ')}`);
  assert.ok(D[CHAPEL_SLAM_AT] === 0 && D[CHAPEL_SLAM_AT - 1] > 0 && D[CHAPEL_SLAM_AT - 1] < GATE_UP - 12, 'down in two frames');
  const after = D.slice(CHAPEL_SLAM_AT);
  assert.ok(Math.max(...after) >= 6 && D[D.length - 1] === 0, `a bounce, then down: ${after.join(' ')}`);
  assert.ok(chapelGateDropAt(CHAPEL_SLAM_AT).slam === 0 && chapelGateDropAt(CHAPEL_SLAM_AT).lit && !chapelGateDropAt(CHAPEL_SLAM_AT - 1).lit && chapelGateDropAt(CHAPEL_SLAM_AT + CG_SLAM_FRAMES).slam === -1, 'the slam and the maw from the landing');
  const n = (f: number): number => count(chapelGateSlam(true, f));
  assert.ok(n(6) > n(0) && n(CG_SLAM_FRAMES - 1) < n(6) / 2, `it billows and thins: ${n(0)}, ${n(6)}, ${n(CG_SLAM_FRAMES - 1)}`);
  for (let f = 0; f < 4; f++) {
    let chips = 0;
    each(chapelGateSlam(true, f), (r, g, b) => {
      const [h, sa, v] = hsv(r, g, b);
      if (v > 0.45 && sa > 0.15 && h >= 20 && h <= 50) chips++;
      assert.ok(!FLAMES.has(hex(r, g, b)) && !isFire(r, g, b), 'no fire, no pink in the slam: bone on stone');
    });
    assert.ok(chips >= 12, `frame ${f}: ${chips} pixels of chips`);
  }
});
