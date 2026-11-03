// FLOOR 2 AS THE PRISON'S GROUNDS AT NIGHT (src/art/grounds.ts; behind GROUNDS, off), held to his art rulebook before it goes to
// the main chat, as the yard was (tests/yard.test.ts): off, and nothing of the game imports it; every picture painted and
// anchored where the game lays it; crisp (every pixel all there or not at all but a wall's fading top in the game's four steps; a
// floor tile covering its whole diamond; no pixel alone); nothing cyan (the friend's); no pink in the place (the enemy's, only in
// floor 2's own where it was); the floor and the walls darker than the darkest word; light from the upper left; the stair down
// from floor 1 a three-tile stretch of wall with its arch two tiles across in its middle; the ways three tiles wide and open; his
// yard's own pictures (its wall, its tower, its sky) the yard's, unchanged; floor 2's own pieces with their shapes and anchors.
//   run: tsx --test tests/grounds.test.ts

// @ts-ignore
import { readdirSync, readFileSync, statSync } from 'node:fs';
// @ts-ignore
import { join } from 'node:path';
import { BLOCK_H, BLOCK_KINDS, GAOL_FADE, GAOL_WALL, GROUNDS, GROUNDS_LIGHTS, ROOF, WAY_IN, makeGroundsArt } from '../src/art/grounds';
import { makeYardArt } from '../src/art/yard';
import { headsmanPieces } from '../src/art/floor2';
import { STRIP } from '../src/art/gates';
import type { Sprite } from '../src/engine/px';
import { WORD_COLOR } from '../src/art/icons';
import { EMBER } from '../src/art/props';
import { assert, count, each, hex, hsv, luma, mean, rgb, sprites, test } from './floor_checks';
import { paintWithoutCanvas, paintingOf } from './helpers';

paintWithoutCanvas();
const G = makeGroundsArt();
const Y = makeYardArt();
const OWN = headsmanPieces();
const floors: Sprite[] = [];
const walks: Sprite[] = [];
const gaolFloors: Sprite[] = [];
for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) {
  floors.push(G.floor(x, y));
  walks.push(G.walk(x, y));
  gaolFloors.push(G.gaol.floor(x, y));
}
const ownTiles = G.tiles.filter((p) => !Y.tiles.includes(p));
const gateways = (['open', 'barred', 'gaol'] as const).flatMap((k) => [true, false].map((ax) => ({ name: `the gateway (${k}, ${ax ? 'along x' : 'along y'})`, strips: G.gateway(ax, k) })));
const ownPieces = G.pieces.filter((p) => p.name === 'the well' || p.name.startsWith('the tumbril'));
/** The grounds' own pictures (not the yard's, not floor 2's own). */
const mine: [string, Sprite][] = [
  ...walks.map((s, i) => [`the long walk ${i}`, s] as [string, Sprite]),
  ...gaolFloors.map((s, i) => [`the gaoler's flags ${i}`, s] as [string, Sprite]),
  ...ownTiles.map((p) => [p.name, p.frames![0]] as [string, Sprite]),
  ...G.block.faceLeft.map((s, i) => [`a block along x, ${BLOCK_KINDS[i]}`, s] as [string, Sprite]),
  ...G.block.faceRight.map((s, i) => [`a block along y, ${BLOCK_KINDS[i]}`, s] as [string, Sprite]),
  ...G.gaol.faceLeft.map((s, i) => [`the gaoler's wall along x ${i}`, s] as [string, Sprite]),
  ...G.gaol.faceRight.map((s, i) => [`the gaoler's wall along y ${i}`, s] as [string, Sprite]),
  ...gateways.flatMap((g) => g.strips.map((q, i) => [`${g.name} strip ${i}`, q.s] as [string, Sprite])),
  ['the chapel along x', G.chapel(true)],
  ['the chapel along y', G.chapel(false)],
  ['the stair down from floor 1, along x', G.wayIn(true)],
  ['the stair down from floor 1, along y', G.wayIn(false)],
  ...ownPieces.map((p) => [p.name, p.frames![0]] as [string, Sprite]),
];
/** Pictures with a wall's fading top (the game's four steps), and where it is. */
const fading = new Set<Sprite>([...G.gaol.faceLeft, ...G.gaol.faceRight, G.wayIn(true), G.wayIn(false)]);
const isFire = (r: number, g: number, b: number): boolean => EMBER.includes(hex(r, g, b));
/** A lit window or doorway, the stair's light from floor 1: an honest orange or a faint green-gold. */
const isLight = (r: number, g: number, b: number): boolean => {
  const [h, s, v] = hsv(r, g, b);
  return (h >= 8 && h <= 75 && s > 0.35 && v > 0.3) || isFire(r, g, b);
};

// (brought into the game by the main chat, 2 Nov 2026, behind the same switch: the files that bring it in may import it)
const BROUGHT = ['art/floors.ts', 'game/floor_looks.ts', 'game/grounds_way.ts', 'render/grounds.ts', 'render/render.ts'].map((f) => join('src', f));
test('the grounds: off, and nothing of the game imports it but the files that bring it in', () => {
  assert.ok(GROUNDS.on === false, 'GROUNDS is off');
  const found: string[] = [];
  const walk = (d: string): void => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith('.ts') && !p.includes(`${join('src', 'dev')}`) && !p.endsWith(join('art', 'grounds.ts')) && !BROUGHT.includes(p) && /from '\.\.?\/(art\/)?grounds'/.test(readFileSync(p, 'utf8'))) found.push(p);
    }
  };
  walk('src');
  assert.ok(found.length === 0, `imported by ${found.join(', ')}`);
});

test('the grounds: every picture painted, every piece the brief asks for', () => {
  for (const [n, s] of mine) assert.ok(count(s) > 20, `${n}: ${count(s)} pixels`);
  for (const n of ['mud', 'straw', 'a drift of straw', 'weeds along x', 'weeds along y', 'a puddle', 'beaten earth', 'gutter along x', 'gutter along y']) assert.ok(G.tiles.some((p) => p.name === n), `the tile ${n}`);
  for (const n of ['the well', 'the tumbril, along x', 'the tumbril, along y', 'brazier of irons', "the yard's torch", 'a wide puddle']) assert.ok(G.pieces.some((p) => p.name === n), `the piece ${n}`);
  assert.ok(G.block.faceLeft.length === BLOCK_KINDS.length && G.block.faceRight.length === BLOCK_KINDS.length, 'a block face of every kind each way');
});

test("the grounds build on his yard: its cobbles, its tiles, its outer wall, its tower, its sky and its torch are the yard's own pictures, unchanged", () => {
  for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) assert.ok(G.floor(x, y) === Y.floor(x, y), 'the cobbles are the yard\'s');
  for (const p of Y.tiles) assert.ok(G.tiles.includes(p), `the yard's ${p.name}`);
  assert.ok(G.wall.faceLeft === Y.faceLeft && G.wall.faceRight === Y.faceRight, "the outer wall is the yard's");
  assert.ok(G.tower === Y.tower && G.beyond === Y.beyond, "the tower and the sky are the yard's");
  assert.ok(G.pieces.find((p) => p.name === "the yard's torch") === Y.pieces.find((p) => p.name === "the yard's torch"), "the torch is the yard's");
});

test('the grounds, Pixels 1: crisp, every pixel all there or not at all (a wall\'s fading top in four steps); a floor tile covers its whole diamond', () => {
  for (const [n, s] of mine) {
    const q = paintingOf(s);
    let soft = 0;
    for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) {
      const a = q.d[(y * q.w + x) * 4 + 3];
      if (a === 0 || a === 255) continue;
      if (fading.has(s) && [36, 97, 158, 214].includes(a)) continue;
      soft++;
    }
    assert.ok(soft === 0, `${n}: ${soft} soft pixels`);
  }
  for (const s of [...walks, ...gaolFloors, ...ownTiles.map((p) => p.frames![0])]) {
    const q = paintingOf(s);
    const holes: string[] = [];
    for (let y = 2; y <= 29; y++) {
      const hw = 2 * Math.min(y, 32 - y);
      for (let x = -hw + 3; x <= hw - 4; x++) if (!q.get(32 + x, y)) holes.push(`(${x}, ${y})`);
    }
    assert.ok(holes.length === 0, `${holes.length} holes in a floor tile: ${holes.slice(0, 6).join(' ')}`);
  }
});

test('the grounds, Pixels 1: no loose single pixels standing alone', () => {
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

test("the grounds, Colour 3: nothing cyan (the friend's); no pink in the place (the enemy's), floor 2's own pink only where it was", () => {
  const cyanPink = (s: Sprite): [number, number] => {
    let cyan = 0;
    let pink = 0;
    each(s, (r, g, b) => {
      const [h, sa, v] = hsv(r, g, b);
      if (h >= 168 && h <= 200 && sa > 0.45 && v > 0.5) cyan++;
      if (h >= 300 && h <= 352 && sa > 0.45 && v > 0.55) pink++;
    });
    return [cyan, pink];
  };
  for (const [n, s] of mine) {
    const [c, p] = cyanPink(s);
    assert.ok(c === 0 && p === 0, `${n}: ${c} cyan, ${p} pink`);
  }
  for (const p of G.pieces.filter((q) => OWN.some((o) => o.name === q.name))) {
    const o = OWN.find((q) => q.name === p.name)!;
    const a = sprites(p);
    const b = sprites(o);
    for (let i = 0; i < a.length; i++) {
      const [c, pk] = cyanPink(a[i]);
      const [, pk0] = cyanPink(b[i]);
      assert.ok(c === 0 && pk <= pk0, `${p.name} ${i}: ${c} cyan, ${pk} pink (it had ${pk0})`);
    }
  }
});

test('the grounds, Colour 4: the floors, the tiles and the walls darker than the darkest word (at the 99th of their pixels; fire and lit windows are light)', () => {
  const darkest = Math.min(...Object.values(WORD_COLOR).map((c) => luma(...rgb(c))));
  const bad: string[] = [];
  const held: [string, Sprite][] = mine.filter(([n]) => !n.startsWith('the well') && !n.startsWith('the tumbril'));
  for (const [n, s] of held) {
    const h = new Array<number>(256).fill(0);
    each(s, (r, g, b) => {
      if (isLight(r, g, b)) return;
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
  // (and the long walk a step paler than the cobbles, so the condemned's road reads under the moon)
  const mw = walks.reduce((t, s) => t + mean(s), 0) / walks.length;
  const mc = floors.reduce((t, s) => t + mean(s), 0) / floors.length;
  assert.ok(mw > mc + 3, `the walk ${mw.toFixed(0)}, the cobbles ${mc.toFixed(0)}`);
});

test('the grounds, Pixels 4: light from the upper left: a block\'s face turned to screen-left lighter than one turned to screen-right; the gaoler\'s too; what stands lit on its left', () => {
  const avg = (l: Sprite[]): number => l.reduce((t, s) => t + mean(s), 0) / l.length;
  assert.ok(avg(G.block.faceLeft) > avg(G.block.faceRight) + 3, `blocks: left ${avg(G.block.faceLeft).toFixed(0)}, right ${avg(G.block.faceRight).toFixed(0)}`);
  assert.ok(avg(G.gaol.faceLeft) > avg(G.gaol.faceRight) + 3, `the gaoler's: left ${avg(G.gaol.faceLeft).toFixed(0)}, right ${avg(G.gaol.faceRight).toFixed(0)}`);
  for (const p of ownPieces) {
    const s = p.frames![0];
    const px: [number, number][] = [];
    each(s, (r, g, b, _a, x) => {
      if (!isLight(r, g, b)) px.push([x, luma(r, g, b)]);
    });
    const cx = px.reduce((t, q) => t + q[0], 0) / px.length;
    const side = (f: (x: number) => boolean): number => {
      const q = px.filter(([x]) => f(x));
      return q.reduce((t, [, l]) => t + l, 0) / Math.max(1, q.length);
    };
    assert.ok(side((x) => x < cx - 1) >= side((x) => x > cx + 1) - 1, `${p.name}: lit on its right`);
  }
});

test('the grounds: anchored where the game lays them (a wall tile at its top corner\'s floor point, its face down to the floor; a floor tile at its top corner; three tiles of wall at the floor point under their middle)', () => {
  const lowest = (s: Sprite): number => {
    const q = paintingOf(s);
    let low = -1;
    for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) if (q.has(x, y)) low = Math.max(low, y);
    return low - Math.round(s.ay * (s.density ?? 1));
  };
  for (const s of [...G.block.faceLeft, ...G.block.faceRight, ...G.gaol.faceLeft, ...G.gaol.faceRight]) {
    const low = lowest(s);
    assert.ok(low >= 28 && low <= 33, `a wall tile's foot ${low} below its anchor`);
  }
  for (const s of [...G.block.faceLeft, ...G.block.faceRight]) assert.ok(Math.round(s.ay * 2) === BLOCK_H + ROOF + 2 && s.h * 2 === 32 + BLOCK_H + ROOF + 2, 'a block tile as high as its face and roof');
  for (const s of [...G.gaol.faceLeft, ...G.gaol.faceRight]) assert.ok(Math.round(s.ay * 2) === GAOL_WALL && s.h * 2 === 32 + GAOL_WALL, "the gaoler's walls as high as the game's (80) ");
  for (const s of [...walks, ...gaolFloors, ...ownTiles.map((p) => p.frames![0])]) assert.ok(Math.round(s.ay * 2) === 0 && Math.round(s.ax * 2) === 32, 'a floor tile at its top corner');
  for (const s of [G.chapel(true), G.chapel(false), G.wayIn(true), G.wayIn(false)]) {
    const low = lowest(s);
    assert.ok(low >= 22 && low <= 26, `three tiles of a face: their foot ${low} below the floor point under their middle (24 at their near end)`);
    // (its two ends a tile and a half either side of the anchor: 48 picture pixels)
    const q = paintingOf(s);
    let x0 = q.w;
    let x1 = -1;
    for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) if (q.has(x, y)) {
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
    }
    const ax = Math.round(s.ax * 2);
    assert.ok(Math.abs(ax - x0 - 48) <= 1 && Math.abs(x1 + 1 - ax - 48) <= 1, `three tiles across: ${ax - x0} and ${x1 + 1 - ax} from the anchor`);
  }
});

test('the ways between courtyards: strips a quarter tile wide from the tile before the doorway to the tile after; the way open three tiles wide', () => {
  for (const g of gateways) {
    const ts = g.strips.map((q) => q.t);
    assert.ok(Math.abs(Math.min(...ts) + 1) < 1e-9 && Math.abs(Math.max(...ts) - 3.75) < 1e-9 && g.strips.length === 20, `${g.name}: t ${Math.min(...ts)} to ${Math.max(...ts)}, ${g.strips.length} strips`);
    for (const q of g.strips) assert.ok(q.s.w * 2 === STRIP, `${g.name}: a strip ${q.s.w * 2} wide`);
    // (the way: nothing painted a hero's height up across the doorway's three tiles, but the gaoler's leaves and the jambs at its edges)
    for (const q of g.strips.filter((s) => s.t >= 0.25 && s.t < 2.75)) {
      const p = paintingOf(q.s);
      const ay = Math.round(q.s.ay * 2);
      let solid = 0;
      for (let x = 0; x < p.w; x++) for (let up = 4; up < 50; up++) if (p.has(x, ay - up)) solid++;
      assert.ok(solid === 0, `${g.name}: ${solid} pixels across the way at t ${q.t}`);
    }
  }
  // (the gaoler's lantern gives its light)
  assert.ok(G.gateway(true, 'gaol').some((q) => (q.s.lights ?? []).length > 0), "the gaoler's lantern's light");
});

test('where you arrive: the stair down from floor 1 in a three-tile stretch of the gaoler\'s wall, its arch two tiles across in the middle, the stair seen through it, floor 1\'s light at its head', () => {
  const s = G.wayIn(true);
  const q = paintingOf(s);
  const ax = Math.round(s.ax * 2);
  const ay = Math.round(s.ay * 2);
  // (a little up from the floor, along the face's line: the arch's opening from 30 to 78 along the face, the wall either side)
  const row = (u: number, up: number): number => ay - 24 + Math.floor(u / 2) - up;
  const inArch = (u: number): boolean => Math.abs(u - 48) < WAY_IN.half - 1;
  let stairSeen = 0;
  let wallBeside = 0;
  for (let u = 4; u < 92; u++) {
    const c = q.get(ax - 48 + u, row(u, 16));
    if (!c) continue;
    if (inArch(u)) stairSeen++;
    else wallBeside++;
  }
  assert.ok(stairSeen > 40 && wallBeside > 20, `through the arch ${stairSeen}, the wall beside it ${wallBeside}`);
  assert.ok((s.lights ?? []).length === 1, "floor 1's light at the stair's head");
  // (its top fades as the game's walls do, but the arch's ring stands whole)
  let faded = 0;
  for (let i = 0; i < q.d.length; i += 4) if (q.d[i + 3] > 0 && q.d[i + 3] < 255) faded++;
  assert.ok(faded > 100, `the wall's fading top: ${faded}`);
  assert.ok(GAOL_FADE === 24 && GAOL_WALL === 80, "the gaoler's walls the game's height and fade");
});

test("floor 2's own pieces under the moon: the same names, kinds, shapes, anchors and lights; their fire as it was", () => {
  for (const o of OWN) {
    const p = G.pieces.find((q) => q.name === o.name);
    assert.ok(p && p.kind === o.kind, `${o.name}`);
    const a = sprites(p!);
    const b = sprites(o);
    assert.ok(a.length === b.length, `${o.name}: ${a.length} pictures, it had ${b.length}`);
    for (let i = 0; i < a.length; i++) {
      assert.ok(a[i].w === b[i].w && a[i].h === b[i].h && a[i].ax === b[i].ax && a[i].ay === b[i].ay, `${o.name} ${i}: its size and anchor`);
      assert.ok(count(a[i]) === count(b[i]), `${o.name} ${i}: its shape`);
      assert.ok((a[i].lights ?? []).length === (b[i].lights ?? []).length, `${o.name} ${i}: its lights`);
      let fa = 0;
      let fb = 0;
      each(a[i], (r, g, bb) => (fa += isFire(r, g, bb) ? 1 : 0));
      each(b[i], (r, g, bb) => (fb += isFire(r, g, bb) ? 1 : 0));
      assert.ok(fa === fb, `${o.name} ${i}: its fire ${fa}, it had ${fb}`);
    }
  }
});

test("the lights for the main chat: the yard's dark under the sky; the torch, the brazier, the lantern, the chapel, the stair", () => {
  assert.ok(GROUNDS_LIGHTS.dark.a === 0.42 && GROUNDS_LIGHTS.dark.skyLift === 0.55 && GROUNDS_LIGHTS.dark.vignette === 0.4, "the yard's dark");
  for (const k of ['torch', 'brazier', 'lantern', 'chapel', 'wayIn'] as const) {
    const L = GROUNDS_LIGHTS[k];
    assert.ok(L.r > 0 && L.strength > 0 && L.strength <= 1, k);
  }
});
