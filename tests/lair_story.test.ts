// FLOOR 5'S STORY PIECES (src/art/lair_story.ts, behind LAIR_STORY, off; nothing of the game imports it), held to his art
// rulebook before they go to the main chat: off and imported by nothing of the game; every piece painted, in both parts (the
// Eye in the temple's only), at its size and anchored where the game lays it (a floor tile 64 x 32 at its top corner, a wall
// piece at the foot of its face under its tile's middle, as floor 5's own are); crisp (every pixel all there or not at all, a
// floor tile covering its whole diamond); nothing cyan (the friend's); the enemy's pink only deep in the Eye's slit, dull (the
// deep end only), and the Eye giving no light of its own; no blood; darker than the darkest word; the drag marks' runs meeting
// at the tiles' edges; the water down to the floor; the temple's pieces on the bare stone beside a pilaster.
//   run: tsx --test tests/lair_story.test.ts

// @ts-ignore
import { readdirSync, readFileSync, statSync } from 'node:fs';
// @ts-ignore
import { join } from 'node:path';
import { DRAG_TILES, EYE_CARVED, EYE_FIRE, EYE_SLAB, LAIR_STORY, LAIR_STORY_PIECES, LAIR_STORY_TEMPLE_ONLY, SWAMP, eyeCarvedAt, makeLairStoryArt } from '../src/art/lair_story';
import { WORD_COLOR } from '../src/art/icons';
import { makeLairTempleArt } from '../src/art/lair_temple';
import { EMBER } from '../src/art/props';
import { GRAIN } from '../src/art/kit';
import { PCX, PFOOT, PH, PW } from '../src/art/floorkit';
import type { Piece } from '../src/art/floorkit';
import type { Sprite } from '../src/engine/px';
import { anchor, count, each, hex, hsv, luma, rgb, sprites, test } from './floor_checks';
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
const ST = makeLairStoryArt();
const parts = [['mine', ST.mine], ['temple', ST.temple]] as const;
const all: [string, Piece][] = parts.flatMap(([part, list]) => list.map((p) => [`${part}: ${p.name}`, p] as [string, Piece]));
const pictures: [string, Sprite][] = all.flatMap(([n, p]) => sprites(p).map((s, i) => [`${n} ${i}`, s] as [string, Sprite]));
const FIRE = new Set<string>(EYE_FIRE.map((c) => c.toLowerCase()));

test('the story pieces: off, and imported by nothing of the game', () => {
  assert.ok(LAIR_STORY.on === false, 'LAIR_STORY is off');
  const found: string[] = [];
  const walk = (d: string): void => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      // (art/prison_story.ts borrows its painters for floors 3 and 4's threads, and makes floor 5's pieces only with LAIR_STORY on;
      // game/first5.ts lays them only with it on, its names alone otherwise: game/stories.ts, floor 5's story; main.ts hands its
      // switch to the playtests and pictures, __dbg.lairStory)
      else if (p.endsWith('.ts') && !p.includes(join('src', 'dev')) && !p.endsWith(join('art', 'prison_story.ts')) && !p.endsWith(join('game', 'first5.ts')) && !p.endsWith(join('src', 'main.ts')) && /from '\.\.?\/(art\/)?lair_story'/.test(readFileSync(p, 'utf8'))) found.push(p);
    }
  };
  walk('src');
  assert.ok(found.length === 0, `imported by ${found.join(', ')}`);
});

test('every piece there, in both parts; the Eye in the temple only; every picture painted', () => {
  for (const [part, list] of parts) {
    for (const n of LAIR_STORY_PIECES) assert.ok(list.some((p) => p.name === n), `${part}: "${n}"`);
    assert.equal(new Set(list.map((p) => p.name)).size, list.length, `${part}: no name twice`);
  }
  for (const n of LAIR_STORY_TEMPLE_ONLY) {
    assert.ok(ST.temple.some((p) => p.name === n), `the temple: "${n}"`);
    assert.ok(!ST.mine.some((p) => p.name === n), `not in the mine: "${n}"`);
  }
  assert.equal(DRAG_TILES.length, 10, 'the marks: along x and y, four bends, four ends');
  for (const [n, s] of pictures) assert.ok(count(s) > 20, `${n}: ${count(s)} pixels`);
});

test('at its size and anchored where the game lays it: a floor tile 64 x 32 at its top corner, covering its diamond; a wall piece at the foot of its face, on both faces at every spot', () => {
  for (const [n, p] of all) {
    if (p.kind === 'floor tile') {
      assert.ok(p.frames?.length === 1 && !p.left && !p.spots, `${n}: one picture`);
      const s = p.frames![0];
      const q = paintingOf(s);
      assert.ok(q.w === 64 && q.h === 32 && anchor(s)[0] === 32 && anchor(s)[1] === 0 && s.density === GRAIN, `${n}: 64 x 32 at its top corner`);
      let holes = 0;
      for (let y = 0; y < 32; y++) {
        const hw = y < 16 ? 2 * y + 1 : 2 * (31 - y) + 1;
        for (let x = 32 - hw; x < 32 + hw; x++) if (!q.has(x, y)) holes++;
      }
      assert.equal(holes, 0, `${n}: its whole diamond`);
      assert.equal(count(s), 1024, `${n}: nothing outside its diamond`);
    } else {
      assert.ok(p.kind === 'on the wall' || p.kind === 'wall tile', `${n}: a wall's`);
      assert.ok(p.spots && p.spots.length >= 1 && p.left === p.spots[0].left && p.right === p.spots[0].right, `${n}: its spots, its first its own`);
      for (const s of sprites(p)) {
        const q = paintingOf(s);
        assert.ok(q.w === PW && q.h === PH && anchor(s)[0] === PCX && anchor(s)[1] === PFOOT && s.density === GRAIN, `${n}: ${PW} x ${PH} at the foot of its face`);
        // nothing cut off at the picture's edge
        let edge = 0;
        for (let x = 0; x < q.w; x++) edge += (q.has(x, 0) ? 1 : 0) + (q.has(x, q.h - 1) ? 1 : 0);
        for (let y = 0; y < q.h; y++) edge += (q.has(0, y) ? 1 : 0) + (q.has(q.w - 1, y) ? 1 : 0);
        assert.equal(edge, 0, `${n}: nothing at its picture's edge`);
      }
    }
  }
});

test('Pixels 1: crisp, every pixel all there or not at all; on the walls no pixel alone', () => {
  for (const [n, s] of pictures) {
    let soft = 0;
    each(s, (_r, _g, _b, a) => {
      if (a !== 255) soft++;
    });
    assert.equal(soft, 0, `${n}: soft pixels`);
  }
  for (const [n, p] of all) {
    if (p.kind === 'floor tile') continue;
    for (const s of sprites(p)) {
      const q = paintingOf(s);
      const lone: string[] = [];
      for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) {
        if (!q.has(x, y)) continue;
        let nb = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && q.has(x + dx, y + dy)) nb++;
        if (nb === 0) lone.push(`(${x}, ${y})`);
      }
      assert.ok(lone.length === 0, `${n}: ${lone.length} pixels alone: ${lone.slice(0, 5).join(' ')}`);
    }
  }
});

test("Colour 3: nothing cyan; the enemy's pink only deep in the Eye's slit, dull (the deep end only); the Eye gives no light", () => {
  for (const [n, s] of pictures) {
    const cyan = new Set<string>();
    const pink = new Set<string>();
    each(s, (r, g, b) => {
      const [h, sa, v] = hsv(r, g, b);
      if (h >= 160 && h <= 205 && sa > 0.3 && v > 0.4) cyan.add(hex(r, g, b));
      if (h >= 290 && h <= 352 && sa > 0.45 && v > 0.18) pink.add(hex(r, g, b));
    });
    assert.ok(cyan.size === 0, `${n}: cyan ${[...cyan].join(' ')}`);
    if (n.includes('the Eye in the stone')) {
      // (the slit's own on the lit face; on the face in shade the same, shaded as its wall is: never brighter)
      for (const c of pink) assert.ok(FIRE.has(c) || luma(...rgb(c)) < luma(...rgb(EYE_FIRE[2])), `${n}: a pink that is not the slit's (${c})`);
      assert.ok(!s.lights || s.lights.length === 0, `${n}: no light of its own`);
    } else assert.ok(pink.size === 0, `${n}: pink ${[...pink].join(' ')}`);
  }
  // (the deep end only: never brighter than the enemy's fire at its darkest, FLAME[0])
  for (const c of EYE_FIRE) assert.ok(luma(...rgb(c)) <= luma(...rgb('#7a1058')), `${c} no brighter than #7a1058`);
  // the slit: a few pixels, down the middle of the eye
  const eye = ST.temple.find((p) => p.name === 'the Eye in the stone')!;
  let fire = 0;
  each(eye.left![0], (r, g, b) => {
    if (FIRE.has(hex(r, g, b))) fire++;
  });
  assert.ok(fire >= 6 && fire <= 16, `the slit's fire: ${fire} pixels`);
});

test('never gory: no blood (nothing red), on any piece', () => {
  for (const [n, s] of pictures) {
    let red = 0;
    each(s, (r, g, b) => {
      const [h, sa, v] = hsv(r, g, b);
      if ((h <= 14 || h >= 353) && sa > 0.5 && v > 0.3) red++;
    });
    assert.equal(red, 0, `${n}: red`);
  }
});

test("Colour 4: the floor tiles and the Eye darker than the darkest word (at the 99th of their pixels); what hangs on the walls no brighter than floor 5's own that hang there", () => {
  const darkest = Math.min(...Object.values(WORD_COLOR).map((c) => luma(...rgb(c))));
  const p99 = (ss: Sprite[]): number => {
    const h = new Array<number>(256).fill(0);
    for (const s of ss) each(s, (r, g, b) => void h[Math.round(luma(r, g, b))]++);
    const total = h.reduce((t, k) => t + k, 0);
    let seen = 0;
    for (let l = 0; l < 256; l++) {
      seen += h[l];
      if (seen >= total * 0.99) return l;
    }
    return 255;
  };
  const bad: string[] = [];
  for (const [n, p] of all) if ((p.kind === 'floor tile' || p.kind === 'wall tile') && p99(sprites(p)) >= darkest) bad.push(`${n} ${p99(sprites(p))}`);
  assert.ok(bad.length === 0, `brighter than the darkest word (${darkest.toFixed(0)}): ${bad.join(', ')}`);
  // (floor 5's own on its walls, in look A's colours: the hung kibble, the rope and pulley, the chimes, and the rest; their fires left out)
  const own = makeLairTempleArt().pieces.filter((p) => p.kind === 'on the wall');
  const fire = new Set<string>([...EMBER, '#fff0a0', '#ffb070'].map((c) => c.toLowerCase()));
  const ownTop = Math.max(...own.map((p) => {
    const h = new Array<number>(256).fill(0);
    for (const s of sprites(p)) each(s, (r, g, b) => {
      if (!fire.has(hex(r, g, b))) h[Math.round(luma(r, g, b))]++;
    });
    const total = h.reduce((t, k) => t + k, 0);
    let seen = 0;
    for (let l = 0; l < 256; l++) {
      seen += h[l];
      if (seen >= total * 0.99) return l;
    }
    return 255;
  }));
  for (const [n, p] of all) if (p.kind === 'on the wall') assert.ok(p99(sprites(p)) <= ownTop, `${n}: at the 99th ${p99(sprites(p))}; floor 5's own on its walls ${ownTop}`);
});

test('the Eye: lying on its side, wider than tall, a slit down it; his tongue under it down to the water, an arm either side; inside its slab', () => {
  const kinds = new Map<string, { u0: number; u1: number; v0: number; v1: number; n: number }>();
  for (let v = EYE_SLAB.v0; v <= EYE_SLAB.v1; v++) for (let u = EYE_SLAB.u0; u <= EYE_SLAB.u1; u++) {
    const k = eyeCarvedAt(u, v);
    if (!k) continue;
    const b = kinds.get(k) ?? { u0: 99, u1: -99, v0: 99, v1: -99, n: 0 };
    kinds.set(k, { u0: Math.min(b.u0, u), u1: Math.max(b.u1, u), v0: Math.min(b.v0, v), v1: Math.max(b.v1, v), n: b.n + 1 });
  }
  for (const k of ['eye', 'ring', 'slit', 'tongue', 'arm', 'water']) assert.ok(kinds.has(k), `the carving's ${k}`);
  const eye = kinds.get('eye')!;
  assert.ok(eye.u1 - eye.u0 > (eye.v1 - eye.v0) * 1.4, 'the eye wider than tall');
  const slit = kinds.get('slit')!;
  assert.ok(slit.v1 - slit.v0 > (slit.u1 - slit.u0) * 3, 'the slit tall');
  assert.ok(kinds.get('tongue')!.v1 < EYE_CARVED.eyeV && kinds.get('tongue')!.v0 <= EYE_CARVED.water, 'the tongue from under the eye down to the water');
  const arm = kinds.get('arm')!;
  assert.ok(arm.u0 < -6 && arm.u1 > 5, 'an arm either side');
  // all of it inside the slab's field, and the slab as wide as a tile's face, covering the temple's hanging (to 72) and panel
  for (const b of kinds.values()) assert.ok(b.u0 >= EYE_SLAB.u0 + EYE_SLAB.frame && b.u1 <= EYE_SLAB.u1 - EYE_SLAB.frame && b.v0 >= EYE_SLAB.v0 + EYE_SLAB.frame && b.v1 <= EYE_SLAB.v1 - EYE_SLAB.frame, 'inside the field');
  assert.ok(EYE_SLAB.u0 >= -16 && EYE_SLAB.u1 <= 15 && EYE_SLAB.u0 <= -14 && EYE_SLAB.u1 >= 13 && EYE_SLAB.v1 >= 72 && EYE_SLAB.v0 <= 16, 'the slab over the hanging or the panel of its tile');
});

test("the water: the swamp's black, down to the floor on every wall piece; a pool against its wall; the fen's own colours, dull", () => {
  const swamp = new Set(SWAMP.map((c) => c.toLowerCase()));
  for (const [part, list] of parts) {
    const w = list.find((p) => p.name === 'black water down the wall')!;
    for (const spot of w.spots!) {
      // (the lit face: its colours are the swamp's own; the face in shade is shaded as its wall is)
      const q = paintingOf(spot.left[0]);
      let wet = 0;
      let foot = 0;
      for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) {
        const c = q.get(x, y);
        if (!c || !swamp.has(c.toLowerCase())) continue;
        wet++;
        // (the foot of a face along x: the row of the anchor, dropping a pixel for every two across)
        if (y - Math.floor((x - PCX) / 2) >= PFOOT - 1) foot++;
      }
      assert.ok(wet > 60, `${part}: the water (${wet} pixels)`);
      assert.ok(foot >= 4, `${part}: down to the floor (${foot} pixels at the wall's foot)`);
    }
    for (const at of ['x', 'y']) {
      const t = list.find((p) => p.name === `black water pooled, at a wall along ${at}`)!;
      const q = paintingOf(t.frames![0]);
      let pool = 0;
      let far = 0;
      for (let y = 0; y < 32; y++) for (let x = 0; x < 64; x++) {
        const c = q.get(x, y);
        if (!c || !swamp.has(c.toLowerCase())) continue;
        pool++;
        const px = x + 0.5 - 32;
        const py = y + 0.5;
        const u = (px / 32 + py / 16) / 2;
        const v = (py / 16 - px / 32) / 2;
        if ((at === 'x' ? v : u) > 0.62) far++;
      }
      assert.ok(pool > 120 && pool < 520, `${part}: the pool along ${at} (${pool} pixels)`);
      assert.equal(far, 0, `${part}: the pool along ${at} against its wall`);
    }
  }
  // dull: no tone of it brighter than a third of full, none strong in colour
  for (const c of SWAMP) {
    const [, sa, v] = hsv(...rgb(c));
    assert.ok(v <= 0.4 && sa <= 0.45, `${c} dull`);
  }
});

test("the drag marks: a run's tiles meet at their edges (the marks cross every edge they are named for, and no other)", () => {
  for (const [part, list] of parts) {
    for (const [name, a, b] of DRAG_TILES) {
      const q = paintingOf(list.find((p) => p.name === name)!.frames![0]);
      // how dark (the mine) or how brown (the temple) a tile's edge is at its middle, against its corners: the marks are there
      const at = (u: number, v: number): [number, number, number] => {
        const x = Math.round(32 + (u - v) * 32 - 0.5);
        const y = Math.round((u + v) * 16 - 0.5);
        const c = q.get(Math.max(0, Math.min(63, x)), Math.max(0, Math.min(31, y)));
        return c ? rgb(c) : [0, 0, 0];
      };
      const marked = (e: string): number => {
        let n = 0;
        for (let t = -0.2; t <= 0.2; t += 0.02) {
          const [u, v] = e === '-x' ? [0.03, 0.5 + t] : e === '+x' ? [0.97, 0.5 + t] : e === '-y' ? [0.5 + t, 0.03] : [0.5 + t, 0.97];
          const [r, g, bb] = at(u, v);
          // (the mine: a heel's furrow, cut to the seam's dark, which its earth never is; the temple: the earth's brown on its black flags)
          if (part === 'mine' ? hex(r, g, bb) === '#07060a' : r - bb > 6) n++;
        }
        return n;
      };
      for (const e of ['-x', '+x', '-y', '+y']) {
        const named = e === a || e === b;
        const n = marked(e);
        if (named) assert.ok(n >= 3, `${part}: "${name}" crosses its ${e} edge (${n})`);
        else assert.ok(n <= 2, `${part}: "${name}" does not cross its ${e} edge (${n})`);
      }
    }
  }
});

test("the temple's shackles and water: over on the bare stone beside the pilaster (u -1 to 15 on a face along x, the other way on one along y)", () => {
  for (const name of ['empty shackles', 'black water down the wall']) {
    const p = ST.temple.find((q) => q.name === name)!;
    for (const spot of p.spots!) {
      for (const [face, s] of [['x', spot.left[0]], ['y', spot.right[0]]] as const) {
        const q = paintingOf(s);
        let off = 0;
        let n = 0;
        for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) {
          if (!q.has(x, y)) continue;
          // (above the plinth: up the face more than 12)
          const up = PFOOT - (y - Math.floor(((face === 'x' ? x - PCX : PCX - x)) / 2));
          if (up <= 12) continue;
          n++;
          const u = x - PCX;
          if (face === 'x' ? u < -2 || u > 15 : u > 1 || u < -16) off++;
        }
        assert.ok(n > 40 && off === 0, `${name} along ${face}: ${off} of ${n} pixels off the bare stone`);
      }
    }
  }
});
