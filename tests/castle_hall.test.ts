// THE FIRST TOWN AS THE CASTLE'S HALL, MADE GAME-READY (src/art/castle_hall.ts behind CASTLE_HALL, off; its owl src/art/hall_owl.ts;
// nothing of the game imports them), held to his art rulebook before it goes to the main chat: off and imported by nothing of the
// game; every picture painted, at its size and anchored where the game lays it (a floor tile at its top corner; a tile of wall at
// its top corner's floor point, as high as the town's walls and on their line column by column; the roof over the dark above the
// back walls and never over the floor or the faces; the trusses, plants and owl at their floor points; the gate's pillar and the
// passage beyond as the game's pillar and floor 1's stairs up; the stairs down townStairs' size, anchor and shape pixel for
// pixel); crisp; nothing cyan, nothing pink; the place darker than the darkest word, the sun's pictures light; light from the
// upper left; the slats where the windows throw them; the owl alive (breathing, blinking, turning its head, ruffling, never a
// jump); the game's own portcullis and the town's bars fitting as today; and on the phone screen he is shown nothing pink but
// the game's own (the mystic's, the Fleshmancer's seal on the bars) and the knight.
//   run: tsx --test tests/castle_hall.test.ts

// @ts-ignore
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
// @ts-ignore
import { join } from 'node:path';
// @ts-ignore
import { inflateSync } from 'node:zlib';
import {
  AIR_DEPTH, CASTLE_ADDED, CASTLE_HALL, CASTLE_LIGHTS, CASTLE_OWL_AT, CASTLE_OWN, CASTLE_TOP, CH_WALL, CGATE, HALL, IVY_PIC, PILLAR_PIC, POT_PIC, ROOF_PIC, SUN,
  SUN_WINDOWS, TRUSSES_X, TRUSS_PIC, WINDOWS, isDaylight, makeCastleHallArt, sunAt, FLOWERS, STAIRS_THEME, FLOOR1_THEME,
  DAYLIGHT, STEEL5, STONE, TOWN_THEME, WOOD, castleTone, dayLights, isTownTeal,
} from '../src/art/castle_hall';
import { makeTownProps } from '../src/art/town';
import { lookWays } from '../src/art/floors';
import { OWL_LOOP, OWL_LOOP_SECS, OWL_PERCH, OWL_PIC, OWL_POSES, owlFrameAt } from '../src/art/hall_owl';
import { makeGroundArt, WALL_LOOK } from '../src/art/ground';
import { TOWN_STAIRS, townStairs } from '../src/art/town_ways';
import { makeStairwellOf } from '../src/art/crypt_ways';
import { gateBars } from '../src/art/town_ways';
import { ARCH, ARCH_WIDE, PILLAR, SPAN, STRIP, curveOf, inWay, makeGateArt } from '../src/art/gates';
import type { Strip } from '../src/art/gates';
import { makeDungeonProps } from '../src/art/props';
import { WORD_COLOR } from '../src/art/icons';
import { GRAIN } from '../src/art/kit';
import type { Px, Sprite } from '../src/engine/px';
import { anchor, count, each, hex, hsv, luma, mean, rgb, sprites, test } from './floor_checks';
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
const A = makeCastleHallArt();

const floors: [string, Sprite][] = [];
for (let x = HALL.x0; x < HALL.x1; x++) for (let y = HALL.y0; y < HALL.y1; y++) floors.push([`the hall's flags ${x},${y}`, A.floor(x, y)]);
for (let x = 13; x <= 15; x++) floors.push([`the gate's doorway ${x},5`, A.floor(x, 5)]);
const faces: [string, Sprite][] = [];
for (let x = HALL.x0; x < HALL.x1; x++) if (x < 13 || x > 15) faces.push([`the wall along x at ${x}`, A.face(true, x, 5)]);
for (let y = HALL.y0; y < HALL.y1; y++) faces.push([`the wall along y at ${y}`, A.face(false, 5, y)]);
const tiles: [string, Sprite][] = A.tiles.flatMap((p) => p.frames!.map((s, f) => [`${p.name} ${f}`, s] as [string, Sprite]));
const suns: [string, Sprite][] = [];
for (let x = HALL.x0; x < HALL.x1; x++) for (let y = HALL.y0; y < HALL.y1; y++) {
  const s = A.sun(x, y);
  if (s) suns.push([`the sun on ${x},${y}`, s]);
}
const own: [string, Sprite][] = A.pieces.flatMap((p) => sprites(p).map((s, i) => [`${p.name} ${i}`, s] as [string, Sprite]));
const light = (n: string): boolean => n.startsWith('the sun');
const solidOwn = own.filter(([n]) => !light(n));
const owls: [string, Sprite][] = A.owl.frames.map((s, i) => [`the owl ${i}`, s]);
const gateArch: [string, Sprite][] = [true, false].flatMap((ax) => A.gate.arch(ax).map((q, i) => [`the gate's arch ${ax ? 'x' : 'y'} ${i}`, q.s] as [string, Sprite]));
const place: [string, Sprite][] = [...floors, ...faces, ...tiles, ['the roof', A.roof], ...solidOwn, ...owls, ['the gate pillar', A.gate.pillar], ...gateArch, ['the stairs x', A.stairs('x')], ['the stairs y', A.stairs('y')]];
const isPink = (r: number, g: number, b: number): boolean => {
  const [h, sa, v] = hsv(r, g, b);
  return h >= 290 && h <= 352 && sa > 0.45 && v > 0.3;
};
const isCyan = (r: number, g: number, b: number): boolean => {
  const [h, sa, v] = hsv(r, g, b);
  return h >= 160 && h <= 205 && sa > 0.3 && v > 0.4;
};
const sameShape = (a: Sprite, b: Sprite): number => {
  const pa = paintingOf(a);
  const pb = paintingOf(b);
  if (pa.w !== pb.w || pa.h !== pb.h) return Infinity;
  let n = 0;
  for (let k = 3; k < pa.d.length; k += 4) if ((pa.d[k] === 0) !== (pb.d[k] === 0)) n++;
  return n;
};
const edgeCount = (p: Px): number => {
  let e = 0;
  for (let x = 0; x < p.w; x++) e += (p.has(x, 0) ? 1 : 0) + (p.has(x, p.h - 1) ? 1 : 0);
  for (let y = 0; y < p.h; y++) e += (p.has(0, y) ? 1 : 0) + (p.has(p.w - 1, y) ? 1 : 0);
  return e;
};
/** A flat thing's strips laid back into its plane: (u, v) to its colour. */
function plane(strips: Strip[], alongX: boolean): Map<string, string> {
  const out = new Map<string, string>();
  for (const q of strips) {
    const p = paintingOf(q.s);
    const ay = q.s.ay * GRAIN;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const c = p.get(x, y);
      if (c === null) continue;
      const j = alongX ? x : STRIP - 1 - x;
      out.set(`${Math.round(q.t * 32) + j},${ay + Math.floor((j - 1) / 2) - y}`, c);
    }
  }
  return out;
}

// (brought into the game by the main chat, 2 Nov 2026, behind the same switch: the files that bring it in may import it)
const BROUGHT = ['game/castle_way.ts', 'game/level.ts', 'game/floor_looks.ts', 'main.ts', 'render/castle.ts'].map((f) => join('src', f));
test('the castle hall and its owl: off, and nothing of the game imports them but the files that bring them in', () => {
  assert.ok(CASTLE_HALL.on === false, 'CASTLE_HALL is off');
  const found: string[] = [];
  const walk = (d: string): void => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith('.ts') && !p.includes(join('src', 'dev')) && !p.endsWith(join('art', 'castle_hall.ts')) && !p.endsWith(join('art', 'hall_owl.ts')) && !BROUGHT.includes(p) && /from '\.\.?\/(art\/)?(castle_hall|hall_owl)'/.test(readFileSync(p, 'utf8'))) found.push(p);
    }
  };
  walk('src');
  assert.ok(found.length === 0, `imported by ${found.join(', ')}`);
});

test('every picture painted, the pieces the brief asks for', () => {
  for (const [n, s] of place) assert.ok(count(s) > 8, `${n}: ${count(s)} pixels`);
  for (const n of CASTLE_OWN) assert.ok(A.pieces.some((p) => p.name === n), `the piece "${n}"`);
  assert.ok(A.tiles.some((p) => p.name.startsWith('moss')) && A.tiles.some((p) => p.name.startsWith('grass')), 'moss and grass to lay over the flags');
  assert.equal(SUN_WINDOWS.length, 4, 'four windows in the sun');
  assert.ok(WINDOWS.some((W) => W.brace === 'wheel') && WINDOWS.filter((W) => W.brace === 'door').length === 2, 'a cart wheel wedged against one window, a door against two');
  assert.ok(WINDOWS.every((W) => W.planks.length >= (W.brace ? 1 : 4)), 'every window boarded, planks crooked across it (over the wheel or the door, the rest)');
  assert.ok(A.owl.frames.length === OWL_POSES.length && A.owl.frames.length >= 12, `the owl's frames: ${A.owl.frames.length}`);
});

test("every picture at its size and anchored where the game lays it; the walls as high as the town's, on their line column by column", () => {
  assert.equal(CH_WALL, WALL_LOOK.tall * GRAIN, "as high as the game's walls (WALL_LOOK.tall)");
  for (const [n, s] of [...floors, ...tiles, ...suns]) {
    const q = paintingOf(s);
    assert.ok(q.w === 64 && q.h === 32 && anchor(s)[0] === 32 && anchor(s)[1] === 0 && s.density === GRAIN, `${n}: a floor tile 64 x 32 at its top corner`);
  }
  // (the town's walls as the game paints them: art/ground.ts, makeGroundArt, the vault's)
  const G = makeGroundArt();
  for (const [n, s] of faces) {
    const q = paintingOf(s);
    const alongX = n.includes('along x');
    const theirs = paintingOf(alongX ? G.faceLeft[0] : G.faceRight[0]);
    assert.ok(q.w === theirs.w && q.h === theirs.h && anchor(s)[0] === anchor(alongX ? G.faceLeft[0] : G.faceRight[0])[0] && anchor(s)[1] === anchor(alongX ? G.faceLeft[0] : G.faceRight[0])[1], `${n}: as big as the game's, anchored as the game's`);
    for (let x = alongX ? 0 : 32; x < (alongX ? 32 : 64); x++) {
      const ends = (p: Px, xx: number): [number, number, number] => {
        let t = -1;
        let l = -1;
        let k = 0;
        for (let y = 0; y < p.h; y++) if (p.has(xx, y)) {
          if (t < 0) t = y;
          l = y;
          k++;
        }
        return [t, l, k];
      };
      const [t, l, k] = ends(q, x);
      assert.equal(k, CH_WALL, `${n}: column ${x} whole, ${CH_WALL} high`);
      // (the game leaves its joint column empty; this one is filled, on the line of the column beside it)
      const xx = alongX ? Math.max(1, x) : Math.min(62, x);
      const [t2, l2] = ends(theirs, xx);
      const shift = x === xx ? 0 : alongX ? -1 : 0;
      assert.ok(t === t2 + shift || (x !== xx && Math.abs(t - t2) <= 1), `${n}: column ${x} tops at ${t}, the game's at ${t2}`);
      assert.ok(l === l2 + shift || (x !== xx && Math.abs(l - l2) <= 1), `${n}: column ${x} foot at ${l}, the game's at ${l2}`);
    }
  }
  // the roof: anchored at the hall's back corner, over the dark above the back walls, never over the faces or the floor
  const R = paintingOf(A.roof);
  assert.ok(anchor(A.roof)[0] === ROOF_PIC.ax && anchor(A.roof)[1] === ROOF_PIC.ay && R.w === ROOF_PIC.w && R.h === ROOF_PIC.h, 'the roof: its size and anchor');
  let over = 0;
  for (let y = 0; y < R.h; y++) for (let x = 0; x < R.w; x++) {
    if (!R.has(x, y)) continue;
    const q = Math.abs((x + 0.5 - ROOF_PIC.ax) / 32);
    if (y + 0.5 - ROOF_PIC.ay > q * 16 - CH_WALL + 1) over++;
  }
  assert.equal(over, 0, 'nothing of the roof below the tops of the faces: never over the walls the game lays, never over the floor');
  assert.equal(edgeCount(R), 0, 'nothing of it cut off');
  // the pieces at their floor points, in whole game pixels, nothing cut off
  const piece = (n: string): Sprite[] => sprites(A.pieces.find((p) => p.name === n)!);
  for (const n of ['potted herbs', 'potted flowers', 'a bay tree in a pot', 'a fern in a pot']) for (const s of piece(n)) assert.ok(anchor(s)[0] === POT_PIC.ax && anchor(s)[1] === POT_PIC.ay, `${n}: at its floor point`);
  for (const ax of ['x', 'y']) for (const s of piece(`ivy at the foot of a wall, along ${ax}`)) assert.ok(anchor(s)[0] === IVY_PIC.ax && anchor(s)[1] === IVY_PIC.ay, 'the ivy at the middle of the wall\'s foot');
  const pl = makeDungeonProps().pillar;
  for (const s of piece('a pillar of the hall')) assert.ok(s.w === pl.w && s.h === pl.h && s.ax === pl.ax && s.ay === pl.ay && anchor(s)[1] === PILLAR_PIC.ay, "a pillar of the hall: the game's pillar's size and anchor");
  for (const s of piece('a hammer-beam truss')) assert.ok(anchor(s)[0] === TRUSS_PIC.axX && anchor(s)[1] === TRUSS_PIC.ay, 'the truss at the wall\'s foot under it');
  for (const s of A.owl.frames) assert.ok(anchor(s)[0] === OWL_PIC.ax && anchor(s)[1] === OWL_PIC.ay && paintingOf(s).w === OWL_PIC.w && paintingOf(s).h === OWL_PIC.h, 'the owl at the floor point under it');
  // (the owl's feet on its beam, OWL_PERCH over the floor point: its talons a little over the beam's edge)
  const ob = paintingOf(A.owl.frames[0]).bounds()!;
  assert.ok(anchor(A.owl.frames[0])[1] - (ob.y + ob.h) >= OWL_PERCH - 3 && anchor(A.owl.frames[0])[1] - (ob.y + ob.h) <= OWL_PERCH, `the owl on its beam: its talons ${anchor(A.owl.frames[0])[1] - (ob.y + ob.h)} over the floor`);
  assert.ok(CASTLE_OWL_AT[2] === OWL_PERCH && TRUSSES_X.some((x) => x === CASTLE_OWL_AT[0]), 'the owl perches on a hammer beam');
  for (const [n, s] of [...own, ...owls, ...faces, ...floors, ['the roof', A.roof] as [string, Sprite]]) {
    const q = paintingOf(s);
    assert.ok(q.w % 2 === 0 && q.h % 2 === 0 && anchor(s)[0] % 2 === 0 && anchor(s)[1] % 2 === 0, `${n}: ${q.w} x ${q.h} at (${anchor(s).join(', ')}), whole game pixels`);
  }
  for (const [n, s] of [...own, ...owls, ['the gate pillar', A.gate.pillar] as [string, Sprite]]) assert.equal(edgeCount(paintingOf(s)), 0, `${n}: pixels on its picture's edge`);
});

test('Pixels 1: crisp, every pixel all there or not at all; a floor tile covers its whole diamond; no pixel alone', () => {
  for (const [n, s] of [...place, ...suns, ...own]) {
    const q = paintingOf(s);
    let soft = 0;
    for (let i = 3; i < q.d.length; i += 4) if (q.d[i] !== 0 && q.d[i] !== 255) soft++;
    assert.ok(soft === 0, `${n}: ${soft} soft pixels`);
  }
  for (const [n, s] of floors) {
    const q = paintingOf(s);
    const holes: string[] = [];
    for (let y = 2; y <= 29; y++) {
      const hw = 2 * Math.min(y, 32 - y);
      for (let x = -hw + 3; x <= hw - 4; x++) if (!q.get(32 + x, y)) holes.push(`(${x}, ${y})`);
    }
    assert.ok(holes.length === 0, `${n}: ${holes.length} holes`);
  }
  for (const [n, s] of [...solidOwn, ...owls, ...tiles]) {
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

test("Colour 3: nothing cyan and nothing pink in the place, its owl, its gate or its stairs (the friend's cyan, the enemy's pink: not the castle's)", () => {
  for (const [n, s] of [...place, ...suns, ...own, ['the passage and the day x', A.gate.beyond(true)] as [string, Sprite], ['the passage and the day y', A.gate.beyond(false)] as [string, Sprite]]) {
    let pink = 0;
    let cyan = 0;
    each(s, (r, g, b) => {
      if (isPink(r, g, b)) pink++;
      if (isCyan(r, g, b)) cyan++;
    });
    assert.ok(pink === 0 && cyan === 0, `${n}: ${pink} pink, ${cyan} cyan`);
  }
  // the sun: a warm gold, never cyan, never pink
  for (const c of [...SUN.slat, ...SUN.air, SUN.mote, SUN.glow, SUN.day]) {
    const [h, sa] = hsv(...rgb(c));
    assert.ok(h >= 30 && h <= 55 && sa > 0.2, `the sun's ${c}: gold (${h.toFixed(0)}, ${sa.toFixed(2)})`);
  }
});

test('Colour 4: its floor, walls, roof and the things of its own darker than the darkest word (at the 99th of their pixels: the day through the gaps and the flowers apart); the sun makes it bright', () => {
  const darkest = Math.min(...Object.values(WORD_COLOR).map((c) => luma(...rgb(c))));
  const bad: string[] = [];
  for (const [n, s] of [...floors, ...faces, ...tiles, ['the roof', A.roof] as [string, Sprite], ...solidOwn, ...gateArch.filter((_, i) => i % 3 === 0), ['the gate pillar', A.gate.pillar] as [string, Sprite], ['the stairs', A.stairs('x')] as [string, Sprite]]) {
    const h = new Array<number>(256).fill(0);
    each(s, (r, g, b) => {
      const c = hex(r, g, b);
      const [, sa, v] = hsv(r, g, b);
      // (the day seen through a gap; a flower: small bright accents, not the place's stone)
      if (isDaylight(c) || FLOWERS.includes(c)) return;
      void sa;
      void v;
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
  // (the light makes it bright: since his “Brighter, castle stone (Recommended)” a day's thin warm dark, not the town's own 0.45)
  const dk: number = CASTLE_LIGHTS.dark.a;
  const [tr, tg, tb] = CASTLE_LIGHTS.dark.rgb;
  assert.ok(dk <= 0.12 && tr >= tb && CASTLE_LIGHTS.vignette <= 0.3 && CASTLE_LIGHTS.hero.r === 170, `a thin warm dark (${dk}, ${CASTLE_LIGHTS.dark.rgb.join(' ')}), a light vignette (${CASTLE_LIGHTS.vignette}), the hero's pool as now`);
});

test('Pixels 4: light from the upper left: the wall along x (turned to screen-left) lighter than the wall along y', () => {
  const m = (list: [string, Sprite][]): number => list.reduce((t, [, s]) => t + mean(s), 0) / list.length;
  const X = m(faces.filter(([n]) => n.includes('along x')));
  const Y = m(faces.filter(([n]) => n.includes('along y')));
  assert.ok(X > Y + 3, `along x ${X.toFixed(0)}, along y ${Y.toFixed(0)}`);
});

test("the sun through the boards: slats on the floor where the windows throw them, the gaps' own shapes; its light in the air; pictures of light, drawn added", () => {
  assert.ok(suns.length >= 15, `${suns.length} tiles of floor in the sun`);
  // (all of it in from the wall along y, before the windows: the sun comes in only there)
  for (const [n] of suns) {
    const [x, y] = n.split(' ').pop()!.split(',').map(Number);
    assert.ok(x < 15 && SUN_WINDOWS.some((W) => y >= W.c - 1.5 && y <= W.c + 4), `${n}: before a window`);
  }
  for (const [n, s] of suns) each(s, (r, g, b) => assert.ok(SUN.slat.includes(hex(r, g, b) as never), `${n}: only the slats' three tones`));
  // (a slat is the gap's shape: a point in the sun sees a gap in the boards up the sun's line, a point beside it may not)
  let edges = 0;
  for (const y of [9, 12, 15, 18]) for (let x = 6.05; x < 14; x += 0.05) if (sunAt(x, y, 0) !== sunAt(x + 0.05, y, 0)) edges++;
  assert.ok(edges >= 8, `slats and shade in turn across the floor: ${edges} edges`);
  for (const [n, s] of own.filter(([m]) => light(m))) {
    let max = 0;
    each(s, (r, g, b) => (max = Math.max(max, luma(r, g, b))));
    assert.ok(max < 140, `${n}: light to add, never solid: its brightest ${max.toFixed(0)}`);
  }
  for (const [, s] of suns) {
    let max = 0;
    each(s, (r, g, b) => (max = Math.max(max, luma(r, g, b))));
    assert.ok(max < 140, `a slat to add: ${max.toFixed(0)}`);
  }
  for (const p of A.pieces.filter((q) => light(q.name))) {
    assert.ok(CASTLE_ADDED.has(p.name) && p.frames!.length === 4, `${p.name}: drawn added, four frames`);
    const a = paintingOf(p.frames![0]);
    const b = paintingOf(p.frames![1]);
    let moved = 0;
    for (let i = 0; i < a.d.length; i++) if (a.d[i] !== b.d[i]) moved++;
    assert.ok(moved > 0 && count(p.frames![0]) > 400, `${p.name}: its motes move (${moved}), ${count(p.frames![0])} pixels of light`);
  }
  assert.ok(AIR_DEPTH > 0 && A.slatLights().length >= 10, `holes for the slats: ${A.slatLights().length}`);
});

test('the owl: alive, breathing all the time, blinking every few seconds, turning its head and back through a frame between, looking behind, ruffling; never a jump', () => {
  const at = (t: number): number => owlFrameAt(t);
  assert.ok(OWL_LOOP_SECS > 20 && OWL_LOOP_SECS < 40, `a loop of ${OWL_LOOP_SECS.toFixed(1)} s`);
  const shown = new Set(OWL_LOOP.map(([f]) => f));
  for (let f = 0; f < OWL_POSES.length; f++) assert.ok(shown.has(f), `frame ${f} played`);
  // (breathing: out and in, a step at a time)
  for (let i = 1; i < OWL_LOOP.length; i++) {
    const a = OWL_LOOP[i - 1][0];
    const b = OWL_LOOP[i][0];
    const pa = OWL_POSES[a];
    const pb = OWL_POSES[b];
    assert.ok(Math.abs(pa.turn - pb.turn) <= 0.35 && Math.abs(pa.ruffle - pb.ruffle) <= 0.55 && Math.abs(pa.breath - pb.breath) <= 1.4, `no jump from frame ${a} to ${b}`);
  }
  // (a blink every few seconds: the longest stretch without one under 9 s)
  let last = 0;
  let longest = 0;
  for (let t = 0; t < OWL_LOOP_SECS * 2; t += 0.02) if (OWL_POSES[at(t)].blink >= 1) {
    longest = Math.max(longest, t - last);
    last = t;
  }
  assert.ok(longest < 9, `blinks: the longest wait ${longest.toFixed(1)} s`);
  assert.ok(at(1.234) === owlFrameAt(1.234 + OWL_LOOP_SECS), 'it loops');
  // the frames: breathing in widens it, the head turned moves the face, ruffled is bigger all over
  const n = (f: number): number => count(A.owl.frames[f]);
  assert.ok(n(3) > n(0) && n(13) > n(3), `breathing in ${n(3)} > out ${n(0)}; ruffled ${n(13)}`);
  const differ = (a: number, b: number): number => {
    const pa = paintingOf(A.owl.frames[a]);
    const pb = paintingOf(A.owl.frames[b]);
    let k = 0;
    for (let i = 0; i < pa.d.length; i += 4) if (pa.d[i] !== pb.d[i] || pa.d[i + 1] !== pb.d[i + 1]) k++;
    return k;
  };
  assert.ok(differ(2, 5) > 6 && differ(0, 7) > 30 && differ(0, 11) > 40, 'blinking, turning, looking behind: each seen');
  // (the barn owl: its pale face and breast, its dark eyes)
  let pale = 0;
  let dark = 0;
  each(A.owl.frames[0], (r, g, b) => {
    const l = luma(r, g, b);
    if (l > 200) pale++;
    if (l < 30) dark++;
  });
  assert.ok(pale > 60 && dark > 30, `pale face and breast ${pale}, dark eyes and outline ${dark}`);
});

test("the gate out to the Quarry: the game's own way, its portcullis and the town's bars fitting as today; the castle's stone round them; the passage and the day beyond", () => {
  const C = curveOf(ARCH);
  const game = makeGateArt();
  for (const alongX of [true, false]) {
    const ours = plane(A.gate.arch(alongX), alongX);
    const theirs = plane(game.arch(alongX, false, false), alongX);
    // (the way clear as the game's: nothing of ours in it but what the game's arch has there, its underside)
    for (const k of ours.keys()) {
      const [u, v] = k.split(',').map(Number);
      if (inWay(ARCH, C, u, v)) assert.ok(theirs.has(k), `nothing more in the way than the game's arch has: ${k}`);
    }
    for (let v = 0; v < 56; v++) assert.ok(!ours.has(`${PILLAR + 24},${v}`) && !ours.has(`${ARCH_WIDE / 2},${v}`) && !ours.has(`${PILLAR + SPAN - 24},${v}`), `a hero's breadth clear at ${v}`);
    // (the game's portcullis and the town's bars: no more of them hidden under the arch than under the game's own)
    for (const [what, list] of [['the portcullis', game.portcullis(alongX, false, 0)], ['the bars', gateBars(alongX)]] as const) {
      const p = plane(list as Strip[], alongX);
      let hidOurs = 0;
      let hidTheirs = 0;
      for (const k of p.keys()) {
        if (ours.has(k)) hidOurs++;
        if (theirs.has(k)) hidTheirs++;
      }
      assert.ok(hidOurs <= hidTheirs, `${what}: ${hidOurs} pixels hidden under the castle's arch, ${hidTheirs} under the game's`);
    }
    // (the castle's: a ring of voussoirs and its hood; the wall over the doorway, to the faces' top)
    let hood = 0;
    for (const k of ours.keys()) {
      const [u, v] = k.split(',').map(Number);
      if (v >= CGATE.hoodFrom && Math.hypot(u + 0.5 - C.mid, v + 0.5 - C.vc) > C.rho + CGATE.ring) hood++;
    }
    assert.ok(hood > 60, `the hood mould: ${hood}`);
    assert.ok(ours.has(`${PILLAR + 4},${CH_WALL - 1}`) && ours.has(`${PILLAR + SPAN - 5},${CH_WALL - 1}`), 'the wall over the doorway up to the top of the faces');
  }
  // the pillar: the game's pillar's footprint, size and anchor
  const gp = game.pillar(false);
  assert.ok(A.gate.pillar.w === gp.w && A.gate.pillar.h === gp.h && A.gate.pillar.ax === gp.ax && A.gate.pillar.ay === gp.ay && sameShape(A.gate.pillar, gp) === 0, "the pillar: the game's, its shape");
  // the passage and the day: as floor 1's stairs up (art/town_ways.ts floorStairsUp's frame), seen through the way; the day bright at its far end
  for (const alongX of [true, false]) {
    const b = A.gate.beyond(alongX);
    assert.ok(b.w === (ARCH_WIDE + 8) / GRAIN && b.ax === (alongX ? 4 : ARCH_WIDE + 4) / GRAIN && b.ay === 112 / GRAIN, 'its size and anchor: where the arch\'s first strip begins');
    let day = 0;
    let all = 0;
    each(b, (r, g, bb) => {
      all++;
      if (isDaylight(hex(r, g, bb))) day++;
    });
    assert.ok(all > 3000 && day > all * 0.15, `through the way: ${all} pixels, ${day} of them the day outside`);
  }
});

test("the stairs down to floor 1: townStairs' size, anchor and shape pixel for pixel; the hall's stone at the top turning to floor 1's mossy stone down the flight", () => {
  for (const way of ['x', 'y'] as const) {
    const theirs = townStairs(way);
    const ours = A.stairs(way);
    assert.ok(ours.ax === theirs.ax && ours.ay === theirs.ay && ours.w === theirs.w && ours.h === theirs.h, 'its size and anchor');
    assert.equal(sameShape(theirs, ours), 0, `its shape (${way})`);
    // (its parapet the hall's stone; down the flight floor 1's: nearer floor 1's own painting of it than the hall's)
    const p = paintingOf(ours);
    const hall = paintingOf(makeStairwellOf(STAIRS_THEME, way, TOWN_STAIRS));
    const f1 = paintingOf(makeStairwellOf(FLOOR1_THEME, way, TOWN_STAIRS));
    const dist = (a: string, b: string): number => {
      const [r0, g0, b0] = rgb(a);
      const [r1, g1, b1] = rgb(b);
      return Math.abs(r0 - r1) + Math.abs(g0 - g1) + Math.abs(b0 - b1);
    };
    let toF1 = 0;
    let all = 0;
    let topHall = 0;
    let top = 0;
    const b = p.bounds()!;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const c = p.get(x, y);
      if (!c) continue;
      all++;
      const h = hall.get(x, y)!;
      const f = f1.get(x, y)!;
      if (dist(c, f) < dist(c, h)) toF1++;
      if (y < b.y + 12) {
        top++;
        if (c === h) topHall++;
      }
    }
    assert.ok(toF1 > all * 0.2, `down the flight floor 1's stone: ${toF1} of ${all}`);
    assert.ok(topHall > top * 0.9, `its parapet the hall's: ${topHall} of ${top}`);
  }
});

// =================================================================================================
// THE PICTURE HE WILL SEE

/** A PNG read without a canvas: 8 bits a channel, RGB or RGBA, not interlaced (as the browser's screenshots are). */
function readPng(path: string): { w: number; h: number; px: (x: number, y: number) => [number, number, number] } {
  const buf: Uint8Array = readFileSync(path);
  const u32 = (o: number): number => ((buf[o] << 24) | (buf[o + 1] << 16) | (buf[o + 2] << 8) | buf[o + 3]) >>> 0;
  let o = 8;
  let w = 0;
  let h = 0;
  let type = 0;
  const idat: Uint8Array[] = [];
  while (o < buf.length) {
    const len = u32(o);
    const name = String.fromCharCode(buf[o + 4], buf[o + 5], buf[o + 6], buf[o + 7]);
    const body = buf.subarray(o + 8, o + 8 + len);
    if (name === 'IHDR') {
      w = u32(o + 8);
      h = u32(o + 12);
      type = body[9];
    } else if (name === 'IDAT') idat.push(body);
    else if (name === 'IEND') break;
    o += 12 + len;
  }
  const n = type === 6 ? 4 : 3;
  const total = idat.reduce((t, b) => t + b.length, 0);
  const all = new Uint8Array(total);
  let at = 0;
  for (const b of idat) {
    all.set(b, at);
    at += b.length;
  }
  const raw: Uint8Array = inflateSync(all);
  const stride = w * n;
  const out = new Uint8Array(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const a = i >= n ? out[y * stride + i - n] : 0;
      const b = y > 0 ? out[(y - 1) * stride + i] : 0;
      const c = i >= n && y > 0 ? out[(y - 1) * stride + i - n] : 0;
      let v = line[i];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[y * stride + i] = v & 255;
    }
  }
  return { w, h, px: (x, y) => [out[y * stride + x * n], out[y * stride + x * n + 1], out[y * stride + x * n + 2]] };
}

const PICTURE = join('docs', 'mockups', 'town_look', 'pictures', 'game_ready.png');
test("game_ready.png: the hall built the game's way as bright as the castle hall he said yes to beside it (its floor and walls, on average, within a tenth)", () => {
  const P = readPng(PICTURE);
  // (the first picture: the game's (left) and his (right), each 600 x 420 at the game's size, under the title and its line)
  const Y = 43 + 36;
  const OX = 284;
  const OY = 55;
  let ng = 0;
  let nh = 0;
  let sg = 0;
  let sh = 0;
  for (let sy = 0; sy < 420; sy++) for (let sx = 0; sx < 600; sx++) {
    // (the floor: back from the screen to the tile; the two back walls up to 40 over their feet)
    const u = (sx - OX) / 16;
    const v = (sy - OY) / 8;
    const tx = (u + v) / 2;
    const ty = (v - u) / 2;
    const floor = tx > HALL.x0 + 0.1 && tx < HALL.x1 - 0.1 && ty > HALL.y0 + 0.1 && ty < HALL.y1 - 0.1;
    const xw = u + 6;
    const zx = OY + (xw + 6) * 8 - sy;
    const yw = 6 - u;
    const zy = OY + (6 + yw) * 8 - sy;
    const wall = (xw > HALL.x0 + 0.2 && xw < HALL.x1 - 0.2 && zx > 1 && zx < 38) || (yw > HALL.y0 + 0.2 && yw < HALL.y1 - 0.2 && zy > 1 && zy < 38);
    if (!floor && !wall) continue;
    sg += luma(...P.px(sx, Y + sy));
    sh += luma(...P.px(600 + sx, Y + sy));
    ng++;
    nh++;
  }
  const g = sg / ng;
  const h = sh / nh;
  assert.ok(Math.abs(g - h) < h * 0.1, `the game's ${g.toFixed(1)} against his picture's ${h.toFixed(1)}`);
});
test("game_ready.png: 1200 wide; on its phone screen nothing pink but the game's own (the mystic's, the seal on the gate's bars) and the knight's, the knight standing out", () => {
  assert.ok(existsSync(PICTURE), 'the picture is there');
  const P = readPng(PICTURE);
  assert.ok(P.w === 1200 && P.h > 1800 && P.h < 3000, `${P.w} x ${P.h}`);
  // (the phone screen: 1014 x 468 under the first picture and its captions; the camera on the knight at (15.7, 12.3))
  const X0 = 93;
  const Y0 = 43 + 36 + 434 + 36;
  const OX = Math.round(253 - (15.7 - 12.3) * 16);
  const OY = Math.round(117 + 14 - (15.7 + 12.3) * 8);
  const scr = (x: number, y: number, z = 0): [number, number] => [Math.round(X0 + (OX + (x - y) * 16) * 2), Math.round(Y0 + (OY + (x + y) * 8 - z) * 2)];
  const allowed: [number, number, number, number][] = [];
  const box = (p: [number, number], w: number, up: number, down = 20): void => void allowed.push([p[0] - w, p[1] - up, p[0] + w, p[1] + down]);
  // (the game's own pictures, as they are: the bazaar, the smithy, the stash, the ring, the Lexicon, the stranger; the seal on the gate's bars; the knight)
  box(scr(19.5, 12.5), 150, 260, 120);
  for (const [x, y] of [[17.5, 6.5], [19.5, 7.5], [19.5, 8.5], [20.5, 6.5], [21.5, 6.5], [12.5, 18.5], [13.5, 12.5], [9.5, 14.5], [9.5, 15.5], [6.5, 7.5], [20.5, 10.5], [21.5, 10.5], [21.5, 11.5]] as const) box(scr(x, y), 50, 150, 30);
  box(scr(14.5, 6, 17), 70, 70, 70);
  box(scr(15.7, 12.3), 40, 120);
  let pink = 0;
  const stray: string[] = [];
  for (let y = Y0; y < Y0 + 468; y++) for (let x = X0; x < X0 + 1014; x++) {
    const [r, g, b] = P.px(x, y);
    if (!isPink(r, g, b)) continue;
    pink++;
    if (!allowed.some(([a, bb, c, d]) => x >= a && x <= c && y >= bb && y <= d)) stray.push(`(${x - X0}, ${y - Y0})`);
  }
  assert.ok(stray.length === 0, `pink outside the game's own and the knight: ${stray.slice(0, 8).join(' ')} (${stray.length})`);
  // the knight stands out of the floor round him, lighter and darker both
  const [hx, hy] = scr(15.7, 12.3);
  const lum = (x: number, y: number): number => luma(...P.px(x, y));
  let hi = 0;
  let lo = 255;
  for (let y = hy - 50; y < hy - 6; y++) for (let x = hx - 14; x < hx + 14; x++) {
    hi = Math.max(hi, lum(x, y));
    lo = Math.min(lo, lum(x, y));
  }
  let fl = 0;
  let fn = 0;
  for (let y = hy - 4; y < hy + 30; y++) for (let x = hx + 40; x < hx + 90; x++) {
    fl += lum(x, y);
    fn++;
  }
  const floor = fl / fn;
  assert.ok(hi > floor + 50 && lo < floor - 20, `the knight: ${hi.toFixed(0)} and ${lo.toFixed(0)} against the floor round him, ${floor.toFixed(0)}`);
  void pink;
  void CASTLE_TOP;
});

// =================================================================================================
// HIS “Brighter, castle stone (Recommended)”, 2 Nov 2026: the town's own things in the castle's stone and timber, and the town's
// light lifted so it reads as sunny as the castle hall he said yes to

const GAME = makeTownProps();
const GAME_PROPS = makeDungeonProps();
const GAME_WAY = lookWays(1).way;
type Pair = [string, Sprite, Sprite];
const C = A.town;
/** (the things the game's painters paint without the place's stone: only their indigo and plum may change) */
const plain: Pair[] = [
  ['the anvil', GAME.anvil, C.anvil], ['the rack', GAME.rack, C.rack], ['the trough', GAME.trough, C.trough], ["the tent's back", GAME.tentBack, C.tentBack],
  ['the table of wares', GAME.tentTable, C.tentTable], ['the rug', GAME.rug, C.rug], ['the stash', GAME.stash, C.stash],
  ...GAME_PROPS.brazier.map((s, i): Pair => [`a brazier ${i}`, s, A.props.brazier[i]]), ['a barrel', GAME_PROPS.barrel, A.props.barrel], ['the urn', GAME_PROPS.urn, A.props.urn],
];
/** (the things painted in the place's stone: the forge, the ring, the Lexicon, the waypoint's dais) */
const themed: Pair[] = [
  ...GAME.forge.map((s, i): Pair => [`the forge ${i}`, s, C.forge[i]]), ...GAME.lexicon.map((s, i): Pair => [`the Lexicon ${i}`, s, C.lexicon[i]]),
  ...GAME.runeSlab.map((s, i): Pair => [`the slab ${i}`, s, C.runeSlab[i]]), ...GAME.runeStone.flatMap((q, i): Pair[] => [[`stone ${i} dim`, q.dim, C.runeStone[i].dim], [`stone ${i} alight`, q.alight, C.runeStone[i].alight]]),
  ...GAME.runeRing.map((s, i): Pair => [`the ring's circle ${i}`, s, C.runeRing[i]]),
  ...(GAME.ring3 && C.ring3
    ? [
        ...GAME.ring3.stones.flatMap((a, i) => a.flatMap((b, j) => b.filter((_, k) => k % 3 === 0).map((s, k): Pair => [`ring stone ${i} ${j} ${k}`, s, C.ring3!.stones[i][j][k * 3]]))),
        ...GAME.ring3.slab.map((s, i): Pair => [`the ring's slab ${i}`, s, C.ring3!.slab[i]]),
        ...GAME.ring3.floor.filter((_, i) => i % 2 === 0).map((s, i): Pair => [`the ring's circle ${i * 2}`, s, C.ring3!.floor[i * 2]]),
        ['the slab, empty', GAME.ring3.slabEmpty, C.ring3.slabEmpty] as Pair,
      ]
    : []),
  // (the town's waypoint as the game has it today: floor 1's crypt's, art/floors.ts lookWays(1))
  ['the waypoint asleep', GAME_WAY.asleep, A.way.asleep], ...GAME_WAY.awake.filter((_, i) => i % 3 === 0).map((s, i): Pair => [`the waypoint awake ${i * 3}`, s, A.way.awake[i * 3]]),
];
const isIndigoOrPlum = (r: number, g: number, b: number): boolean => {
  const [h, sa, v] = hsv(r, g, b);
  return h >= 225 && h <= 352 && sa > 0.22 && sa < 0.6 && v < 0.75;
};

test("the town's own things in the castle's stone and timber: the same pictures (size, anchor, shape, lights), their indigo grey steel and their plum the hall's timber, every rune, glow and mark of the town's teal-to-cyan and the forge's fire exactly as they are", () => {
  assert.ok(STEEL5.length === 5 && WOOD.length === 5, 'grey steel and the hall timber');
  for (const [n, g, c] of [...plain, ...themed]) {
    const pg = paintingOf(g);
    const pc = paintingOf(c);
    assert.ok(pg.w === pc.w && pg.h === pc.h && anchor(g).join() === anchor(c).join() && (g.density ?? 1) === (c.density ?? 1), `${n}: the game's size and anchor`);
    assert.equal(sameShape(g, c), 0, `${n}: the game's shape`);
    assert.deepEqual(c.lights ?? null, g.lights ?? null, `${n}: the lights it gives off, as the game's`);
    // every rune, glow and mark of the town's teal-to-cyan, where it is and as it is
    let moved = 0;
    for (let i = 0; i < pg.d.length; i += 4) {
      if (pg.d[i + 3] === 0) continue;
      const cg = hex(pg.d[i], pg.d[i + 1], pg.d[i + 2]);
      if (isTownTeal(cg) && cg !== hex(pc.d[i], pc.d[i + 1], pc.d[i + 2])) moved++;
    }
    assert.equal(moved, 0, `${n}: its teal-to-cyan as it is`);
    let left = 0;
    each(c, (r, gg, b) => void (isIndigoOrPlum(r, gg, b) && left++));
    assert.ok(left === 0, `${n}: ${left} pixels of indigo or plum left`);
  }
  // the plain things: every pixel the game's, or its indigo or plum brought into the hall (nothing else touched: the fire, the gold, the cloth)
  for (const [n, g, c] of plain) {
    const pg = paintingOf(g);
    const pc = paintingOf(c);
    let bad = 0;
    let changed = 0;
    for (let i = 0; i < pg.d.length; i += 4) {
      if (pg.d[i + 3] === 0) continue;
      const cg = hex(pg.d[i], pg.d[i + 1], pg.d[i + 2]);
      const cc = hex(pc.d[i], pc.d[i + 1], pc.d[i + 2]);
      if (cc !== castleTone(cg)) bad++;
      if (cc !== cg) changed++;
    }
    assert.ok(bad === 0, `${n}: ${bad} pixels not the game's or its tone in the hall`);
    if (n !== 'the urn') assert.ok(changed > 20, `${n}: brought into the hall (${changed} pixels)`);
  }
  // the things of stone: in the hall's stone
  const hall = new Set<string>([...STONE, TOWN_THEME.mortar, ...TOWN_THEME.slab].map((q) => q.toLowerCase()));
  for (const [n, , c] of themed.filter(([m]) => /forge|Lexicon|slab|stone|waypoint asleep/.test(m))) {
    let k = 0;
    each(c, (r, g, b) => void (hall.has(hex(r, g, b)) && k++));
    assert.ok(k > 30, `${n}: ${k} pixels of the hall's stone`);
  }
  // the ring's column of light and its swirling letters: the game's own, untouched
  if (GAME.ring3 && C.ring3) for (const [k, list] of [['column', 'column'], ['letters', 'letters']] as const) {
    const a = (GAME.ring3[list] as unknown as (Sprite | Sprite[])[]).flat()[0];
    const b = (C.ring3[k] as unknown as (Sprite | Sprite[])[]).flat()[0];
    assert.equal(sameShape(a, b), 0, `the ring's ${k}: as the game's`);
    const pa = paintingOf(a);
    const pb = paintingOf(b);
    let diff = 0;
    for (let i = 0; i < pa.d.length; i++) if (pa.d[i] !== pb.d[i]) diff++;
    assert.equal(diff, 0, `the ring's ${k}: the game's own colours`);
  }
  // the forge's fire: its embers and flames as they are
  const fire = (s: Sprite): number => {
    let k = 0;
    each(s, (r, g, b) => {
      const [h, sa, v] = hsv(r, g, b);
      if (h >= 10 && h <= 50 && sa > 0.55 && v > 0.6) k++;
    });
    return k;
  };
  for (let i = 0; i < GAME.forge.length; i++) assert.equal(fire(C.forge[i]), fire(GAME.forge[i]), `the forge ${i}: its fire as it is`);
});

test("the town's light lifted (his “Brighter, castle stone”): a thin warm day's dark, the day's glows over the hall's floor and walls, warm, none outside it", () => {
  const list = dayLights();
  assert.ok(list.length >= 40, `${list.length} glows of the day`);
  for (const q of list) {
    const onFloor = q.x >= HALL.x0 && q.x <= HALL.x1 && q.y >= HALL.y0 && q.y <= HALL.y1;
    assert.ok(onFloor, `a glow at (${q.x}, ${q.y}): in the hall`);
    const [h, sa] = hsv(...rgb(q.color));
    assert.ok(h >= 25 && h <= 55 && sa > 0.1 && sa < 0.5 && q.a <= 0.1, `a glow of ${q.color} at ${q.a}: a warm white, soft`);
  }
  assert.ok(rgb(DAYLIGHT)[0] > rgb(DAYLIGHT)[2], 'the day warm');
  assert.ok(CASTLE_LIGHTS.window.floor.r > 100 && CASTLE_LIGHTS.window.strength > 0.7, 'the windows: wider and stronger');
});
