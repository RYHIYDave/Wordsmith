// THE CRYPT, LESS FINISHED THE DEEPER IT GOES (src/art/crypt.ts, src/art/crypt_ways.ts; a mock-up
// behind CRYPT and game/dungeon.ts CRYPT_LITTER, both off).
//
// The owner's outline, 9 Oct 2026, 22:47: "the deeper you go, the less finished the crypt.  The top
// floor, while old and crumbling, is all stone.  As you go down, there’s more and more missing and
// more just dirt around.  By floor 4 it’s about half dirt and rocks with discarded and rusted
// mining equipment around." And to the art chat, 10 Oct 2026, 01:58: "Work on the environments
// after.  Apply the checks." So every picture of it is painted here, a plain painting standing in
// for the canvas (tests/helpers.ts), and held to his art rulebook:
//   - nothing of the game changes with the switches off: the vault's every picture, and every
//     dungeon the map-maker makes, as they were;
//   - each floor is as much earth as he said, and its walls go to rough rock with it;
//   - crisp pixels (Pixels 1); light from the upper left (Pixels 4); the floor's tiles meet;
//   - glows are reserved (Colour 3): no cyan and no pink in the places and the gear; the
//     waypoint's light is the friend's cyan, and nothing of it is pink;
//   - a place's palette stays darker than any word's colour (Colour 4), and the Crypt's is no
//     brighter than the vault he said yes to;
//   - the stairwell darkens as it goes down; the waypoint wakes, its light goes round, and a
//     warp's column rises and goes.
//   run: tsx --test tests/crypt.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import { createHash } from 'node:crypto';
// @ts-ignore
import { Buffer } from 'node:buffer';

import { CRYPT, CRYPT_FLOORS, DIRT, ROCK, cryptFloor, cryptGround, cryptLitter, cryptPieces, cryptProps, cryptWays } from '../src/art/crypt';
import { WARP_FRAMES, WAY_FRAMES } from '../src/art/crypt_ways';
import { VAULT, makeGroundArt } from '../src/art/ground';
import type { GroundArt } from '../src/art/ground';
import { WORD_COLOR } from '../src/art/icons';
import { GRAIN, mix } from '../src/art/kit';
import { makeDungeonProps } from '../src/art/props';
import type { Sprite } from '../src/engine/px';
import { CRYPT_LAYOUT, CRYPT_LITTER, generateFloor } from '../src/game/dungeon';
import { WAYS } from '../src/game/ways';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

const FLOORS = [1, 2, 3, 4];
const rgb = (d: Uint8ClampedArray | Uint8Array | number[], i: number): [number, number, number] => [d[i], d[i + 1], d[i + 2]];
const luma = ([r, g, b]: [number, number, number]): number => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const hex = ([r, g, b]: [number, number, number]): string => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
/** Hue (degrees), and saturation and value as HSV has them (0..1). */
function hsv([r, g, b]: [number, number, number]): [number, number, number] {
  const M = Math.max(r, g, b);
  const m = Math.min(r, g, b);
  const c = M - m;
  let h = 0;
  if (c > 0) h = M === r ? ((g - b) / c) % 6 : M === g ? (b - r) / c + 2 : (r - g) / c + 4;
  return [(h * 60 + 360) % 360, M === 0 ? 0 : c / M, M / 255];
}
/** A friend's glow: cyan, strong and bright. An enemy's: pink, strong and bright (the art rulebook, Colour 3). */
const isCyanGlow = (c: [number, number, number]): boolean => {
  const [h, s, v] = hsv(c);
  return h >= 168 && h <= 200 && s > 0.45 && v > 0.5;
};
const isPinkGlow = (c: [number, number, number]): boolean => {
  const [h, s, v] = hsv(c);
  return h >= 300 && h <= 352 && s > 0.45 && v > 0.55;
};
/** Every opaque pixel of some pictures. */
function pixels(sprites: readonly Sprite[], each: (c: [number, number, number], a: number, x: number, y: number, s: number) => void): void {
  sprites.forEach((sp, k) => {
    const p = paintingOf(sp);
    for (let y = 0; y < p.h; y++) {
      for (let x = 0; x < p.w; x++) {
        const i = (y * p.w + x) * 4;
        if (p.d[i + 3] > 0) each(rgb(p.d, i), p.d[i + 3], x, y, k);
      }
    }
  });
}
/** Every picture a ground has (its floor tiles, one of each place in its pattern), but the town's gate (and, `shades` false, the shadows a wall lays on the floor beside it, which are see-through by design). */
function groundPictures(G: GroundArt, shades = true): Sprite[] {
  const out: Sprite[] = [];
  for (let ty = 0; ty < 10; ty++) for (let tx = 0; tx < 10; tx++) out.push(G.floor(tx, ty));
  const walk = (v: unknown): void => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object' && 'img' in (v as object)) out.push(v as Sprite);
    else if (v && typeof v === 'object') for (const k of Object.keys(v as object).sort()) walk((v as Record<string, unknown>)[k]);
  };
  const g = G as unknown as Record<string, unknown>;
  for (const k of Object.keys(g).sort()) if (k !== 'floor' && k !== 'gate' && (shades || !k.startsWith('shade'))) walk(g[k]);
  return out;
}
/** The pictures that are the Crypt's own on floor k: its ground, its rocks and gear and pit prop, the stairwell each way, the waypoint asleep. */
function placePictures(k: number, shades = true): Sprite[] {
  const pc = cryptPieces(k);
  const w = cryptWays(k);
  return [...groundPictures(cryptGround(k), shades), ...pc.rocks, ...Object.values(pc.gear), pc.prop, w.stair.x, w.stair.y, w.way.asleep];
}

// ---------------------------------------------------------------------------------------------

/** The Crypt's switches (and those of its layout and its ways, which change what the map-maker lays), set for the length of `run` and put back. */
function switches<T>(on: { crypt?: boolean; litter: boolean; layout?: boolean; ways?: boolean }, run: () => T): T {
  const was = [CRYPT.on, CRYPT_LITTER.on, CRYPT_LAYOUT.on, WAYS.on];
  CRYPT.on = on.crypt ?? was[0];
  CRYPT_LITTER.on = on.litter;
  CRYPT_LAYOUT.on = on.layout ?? was[2];
  WAYS.on = on.ways ?? was[3];
  try {
    return run();
  } finally {
    [CRYPT.on, CRYPT_LITTER.on, CRYPT_LAYOUT.on, WAYS.on] = was;
  }
}

test('both switches are on in the game (Version 20.2); with them off nothing of the game changes: the vault, every picture, as at aaa8310', () => {
  assert.equal(CRYPT.on, true, 'CRYPT is on');
  assert.equal(CRYPT_LITTER.on, true, 'CRYPT_LITTER is on');
  // (the vault's pictures are painted whatever the switches say: the Crypt's are its own, cryptGround and cryptProps)
  const c = createHash('sha1');
  const put = (s: Sprite): void => {
    const p = paintingOf(s);
    c.update(`${p.w}x${p.h}@${s.ax},${s.ay};`);
    c.update(Buffer.from(p.d));
  };
  const walk = (v: unknown): void => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object' && 'img' in (v as object)) put(v as Sprite);
    else if (v && typeof v === 'object') for (const k of Object.keys(v as object).sort()) walk((v as Record<string, unknown>)[k]);
  };
  const G = makeGroundArt() as unknown as Record<string, unknown>;
  for (let ty = 0; ty < 10; ty++) for (let tx = 0; tx < 10; tx++) put((G.floor as (x: number, y: number) => Sprite)(tx, ty));
  for (const k of Object.keys(G).sort()) if (k !== 'floor') walk(G[k]);
  const P = makeDungeonProps() as unknown as Record<string, unknown>;
  for (const k of Object.keys(P).sort()) walk(P[k]);
  // (the hash of the same pictures painted by main at aaa8310: if the vault is repainted on purpose, this changes with it)
  assert.equal(c.digest('hex').slice(0, 16), '3bd3183f39eb6227', "the vault's pictures are as they were");
});

test('nothing of the game changes with the switches off (and the Crypt\'s layout and ways): every dungeon the map-maker makes, as at aaa8310', () => {
  const c = createHash('sha1');
  for (let d = 1; d <= 6; d++) {
    for (let s = 1; s <= 25; s++) {
      const f = switches({ litter: false, layout: false, ways: false }, () => generateFloor(d, s * 7919));
      c.update(JSON.stringify({ t: Array.from(f.tiles), v: Array.from(f.variant), p: f.props, k: f.packs, r: f.rooms, d: f.doors ?? null, c: f.cut ? Array.from(f.cut) : null, h: f.height ? Array.from(f.height) : null }));
    }
  }
  assert.equal(c.digest('hex').slice(0, 16), 'a89c4a6c51c4eba8', '150 dungeons as they were');
});

test('with it on, only what lies on the floor changes (nothing else of the dungeon: its shape, packs, doors, traps, stairs), and more of it the deeper the floor', () => {
  const extra: number[] = [];
  for (const d of FLOORS) {
    let more = 0;
    for (let s = 1; s <= 10; s++) {
      const off = switches({ litter: false }, () => generateFloor(d, s * 104729));
      const on = switches({ litter: true }, () => generateFloor(d, s * 104729));
      const rest = (f: typeof off): string => JSON.stringify({ t: Array.from(f.tiles), v: Array.from(f.variant), k: f.packs, r: f.rooms, s: f.start, b: f.boss, d: f.doors ?? null, l: f.levers ?? null, z: f.hazards ?? null, h: f.height ? Array.from(f.height) : null, st: f.stair ? Array.from(f.stair) : null, c: f.cut ? Array.from(f.cut) : null });
      assert.equal(rest(on), rest(off), `dungeon ${d}, seed ${s * 104729}: everything but what lies on the floor as it was`);
      assert.deepEqual(on.props.slice(0, off.props.length), off.props, 'what was there is there, in the same order');
      for (const p of on.props.slice(off.props.length)) {
        assert.equal(p.kind, 'rubble', 'what is added lies on the floor');
        const i = p.y * on.w + p.x;
        assert.ok(!(on.stair && on.stair[i]), 'not on a stair');
        assert.ok(!(on.hazards ?? []).some((h) => p.x >= h.x && p.x < h.x + h.w && p.y >= h.y && p.y < h.y + h.h), 'not on a trap');
        assert.equal(on.props.filter((q) => q.x === p.x && q.y === p.y).length, 1, 'not where something else is');
      }
      more += on.props.length - off.props.length;
    }
    extra.push(more);
  }
  assert.equal(extra[0], 0, 'the first floor has no more than it had');
  for (let k = 1; k < extra.length; k++) assert.ok(extra[k] > extra[k - 1], `more lies on floor ${k + 1} than on floor ${k}: ${extra.join(', ')}`);
});

test('each floor is as much earth as he said: the first all stone, the fourth about half earth', () => {
  const share: number[] = [];
  const earth = new Set<string>([...DIRT, ...ROCK]);
  for (const k of FLOORS) {
    let n = 0;
    let all = 0;
    const tiles: Sprite[] = [];
    for (let ty = 0; ty < 10; ty++) for (let tx = 0; tx < 10; tx++) tiles.push(cryptGround(k).floor(tx, ty));
    pixels(tiles, (c) => {
      all++;
      if (earth.has(hex(c))) n++;
    });
    share.push(n / all);
  }
  assert.ok(share[0] < 0.03, `the first: all stone, earth only in the corners lost (${(share[0] * 100).toFixed(1)}%)`);
  assert.ok(share[1] > 0.08 && share[1] < 0.24, `the second: here and there (${(share[1] * 100).toFixed(1)}%)`);
  assert.ok(share[2] > 0.26 && share[2] < 0.42, `the third: a third (${(share[2] * 100).toFixed(1)}%)`);
  assert.ok(share[3] > 0.44 && share[3] < 0.6, `the fourth: about half (${(share[3] * 100).toFixed(1)}%)`);
});

test('the walls go to rough rock as the floors go to earth, floor by floor, and the first floor has none', () => {
  const rough: number[] = [];
  for (const k of FLOORS) {
    const G = cryptGround(k);
    const theme = CRYPT_FLOORS[k - 1];
    // (the rock in a wall's face, in the light of that face: art/ground.ts, wallFace)
    const rockLit = new Set(ROCK.map((c) => mix(c, theme.lit[2], 0.25)));
    const rockShade = new Set(ROCK.map((c) => mix(c, theme.shade[1], 0.45)));
    let n = 0;
    let all = 0;
    pixels(G.faceLeft, (c, a) => {
      if (a < 255) return;
      all++;
      if (rockLit.has(hex(c))) n++;
    });
    pixels(G.faceRight, (c, a) => {
      if (a < 255) return;
      all++;
      if (rockShade.has(hex(c))) n++;
    });
    rough.push(n / all);
  }
  assert.equal(rough[0], 0, 'the first floor\'s walls: all dressed stone');
  for (let k = 1; k < rough.length; k++) assert.ok(rough[k] > rough[k - 1], `rougher, floor by floor: ${rough.map((r) => r.toFixed(3)).join(', ')}`);
  assert.ok(rough[3] > 0.25, `the fourth floor's walls much of them rock: ${rough[3].toFixed(3)}`);
});

test('crisp pixels: every pixel whole or not there, but the four steps a top fades out in (the shadows a wall lays on the floor are the vault\'s own, see-through)', () => {
  // (art/ground.ts, put: a wall's top is lost in the dark in four flat steps, and so is the pit prop's)
  const steps = new Set([0, 255, ...[0.14, 0.38, 0.62, 0.84].map((a) => Math.round(255 * a))]);
  for (const k of FLOORS) {
    const w = cryptWays(k);
    const all = [...placePictures(k, false), ...w.way.awake, ...w.way.motes, ...w.way.warp];
    for (const s of all) {
      const p = paintingOf(s);
      for (let i = 3; i < p.d.length; i += 4) assert.ok(steps.has(p.d[i]), `floor ${k}: a pixel ${p.d[i]} of 255 strong in a picture ${p.w}x${p.h}`);
      assert.equal(s.density, GRAIN, 'painted at the heroes\' grain');
    }
  }
});

test('glows are reserved: nothing of the places or the gear is cyan or pink; the waypoint\'s light is the friend\'s cyan and never pink', () => {
  for (const k of FLOORS) {
    let cyan = 0;
    let pink = 0;
    pixels(placePictures(k), (c) => {
      if (isCyanGlow(c)) cyan++;
      if (isPinkGlow(c)) pink++;
    });
    assert.equal(cyan, 0, `floor ${k}: no cyan`);
    assert.equal(pink, 0, `floor ${k}: no pink`);
    const w = cryptWays(k).way;
    let lit = 0;
    pixels([...w.awake, ...w.motes, ...w.warp], (c) => {
      if (isCyanGlow(c)) lit++;
      assert.ok(!isPinkGlow(c), `floor ${k}: the waypoint is never pink`);
    });
    assert.ok(lit > 1000, `floor ${k}: awake, it is alight with the friend's cyan`);
  }
});

test("a place stays darker than any word's colour, and the Crypt is no brighter than the vault he said yes to", () => {
  const darkest = Math.min(...Object.values(WORD_COLOR).map((c) => luma([parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)])));
  let vaultMost = 0;
  pixels(groundPictures(makeGroundArt(VAULT)), (c) => {
    vaultMost = Math.max(vaultMost, luma(c));
  });
  for (const k of FLOORS) {
    const ls: number[] = [];
    pixels(placePictures(k), (c) => ls.push(luma(c)));
    ls.sort((a, b) => a - b);
    assert.ok(ls[Math.floor(ls.length * 0.99)] < darkest, `floor ${k}: 99 in 100 of its pixels darker than the darkest word (${darkest.toFixed(0)})`);
    assert.ok(ls[ls.length - 1] <= vaultMost + 0.01, `floor ${k}: none brighter than the vault's brightest (${vaultMost.toFixed(0)}): ${ls[ls.length - 1].toFixed(0)}`);
  }
});

test('light from the upper left: the face of a wall turned to the left lighter than the one in shade; a rock lit on its upper left; the pit prop lit on its left', () => {
  const mean = (sprites: readonly Sprite[], keep: (x: number, y: number, w: number, h: number) => boolean = () => true): number => {
    let sum = 0;
    let n = 0;
    for (const s of sprites) {
      const p = paintingOf(s);
      pixels([s], (c, a, x, y) => {
        if (a === 255 && keep(x, y, p.w, p.h)) {
          sum += luma(c);
          n++;
        }
      });
    }
    return sum / Math.max(1, n);
  };
  for (const k of FLOORS) {
    const G = cryptGround(k);
    assert.ok(mean(G.faceLeft) > mean(G.faceRight) + 4, `floor ${k}: the left face lighter`);
    const pc = cryptPieces(k);
    for (const r of pc.rocks) {
      const p = paintingOf(r);
      // (each rock's own pixels: lighter toward the upper left of it than toward the lower right)
      let ul = 0;
      let lr = 0;
      let nu = 0;
      let nl = 0;
      for (let y = 0; y < p.h; y++) {
        for (let x = 0; x < p.w; x++) {
          const i = (y * p.w + x) * 4;
          const rock = (j: number): boolean => p.d[j + 3] > 0 && (ROCK as readonly string[]).includes(hex(rgb(p.d, j)));
          if (!rock(i)) continue;
          const left = x > 0 && rock(i - 4);
          const right = x + 1 < p.w && rock(i + 4);
          if (!left) {
            ul += luma(rgb(p.d, i));
            nu++;
          }
          if (!right) {
            lr += luma(rgb(p.d, i));
            nl++;
          }
        }
      }
      assert.ok(ul / nu > lr / nl, `floor ${k}: a rock's left edge is lit, its right in shade`);
    }
    // the pit prop: its post's face turned to the left lighter than the face turned to the right
    const prop = paintingOf(pc.prop);
    const cx = Math.round(pc.prop.ax * GRAIN);
    assert.ok(mean([pc.prop], (x, y) => x < cx - 1 && y < prop.h - 30 && y > 30) > mean([pc.prop], (x, y) => x > cx + 1 && x < cx + 8 && y < prop.h - 30 && y > 30), `floor ${k}: the pit prop lit on its left`);
  }
});

test("the floor's tiles meet: each exactly its diamond, the pattern coming round every ten tiles", () => {
  for (const k of FLOORS) {
    const G = cryptGround(k);
    for (let ty = 0; ty < 10; ty++) {
      for (let tx = 0; tx < 10; tx++) {
        const s = G.floor(tx, ty);
        const p = paintingOf(s);
        assert.equal(p.w, 64);
        assert.equal(p.h, 32);
        for (let y = 0; y < 32; y++) {
          const hw = y < 16 ? 2 * y + 1 : 2 * (31 - y) + 1;
          for (let x = 0; x < 64; x++) {
            const inside = x >= 32 - hw && x < 32 + hw;
            assert.equal(p.d[(y * 64 + x) * 4 + 3] > 0, inside, `floor ${k}, tile ${tx},${ty}: pixel ${x},${y}`);
          }
        }
        assert.equal(G.floor(tx + 10, ty - 10), s, 'the pattern comes round');
      }
    }
  }
});

test('what lies on each floor: dressed rubble going, rocks coming, the gear on the third and fourth; the fourth floor\'s pillar a pit prop', () => {
  const vault = makeDungeonProps();
  const GEAR = ['pick', 'shovel', 'bucket', 'rail', 'sledge'];
  for (const k of FLOORS) {
    const P = cryptProps(k);
    const names = cryptLitter(k);
    assert.equal(P.rubble.length, names.length, `floor ${k}: one picture for each thing named`);
    for (const s of P.rubble) {
      // (laid by its middle, as the vault's litter is)
      assert.ok(Math.abs(s.ax - s.w / 2) < 1 && Math.abs(s.ay - s.h / 2) < 3, 'anchored at its middle');
    }
    const rocks = names.filter((n) => n.startsWith('rock')).length;
    const dressed = names.filter((n) => n.startsWith('rubble')).length;
    const gear = names.filter((n) => GEAR.includes(n));
    if (k === 1) assert.deepEqual(names, ['rubble0', 'rubble1', 'rubble2'], 'the first: the vault\'s rubble, nothing else');
    if (k >= 2) assert.ok(rocks >= 2, `floor ${k}: rocks`);
    if (k <= 2) assert.equal(gear.length, 0, `floor ${k}: no gear`);
    if (k === 3) assert.deepEqual(gear, ['pick', 'bucket'], 'the third: a pick and a bucket');
    if (k === 4) assert.deepEqual(gear, GEAR, 'the fourth: all the gear');
    if (k > 1) assert.ok(dressed <= cryptLitter(k - 1).filter((n) => n.startsWith('rubble')).length, 'the dressed rubble going');
    // (the first three floors keep the vault's stone pillar, in their own stone: the first's the vault's to the pixel; the fourth's is the pit prop, painted to its own size)
    if (k === 1) assert.deepEqual(Array.from(paintingOf(P.pillar).d), Array.from(paintingOf(vault.pillar).d), 'floor 1: its pillar the vault\'s stone one');
    if (k < 4) assert.ok(paintingOf(P.pillar).w === paintingOf(vault.pillar).w && paintingOf(P.pillar).h === paintingOf(vault.pillar).h, `floor ${k}: its pillar the stone one`);
    else assert.ok(paintingOf(P.pillar).w !== paintingOf(vault.pillar).w, 'the fourth: a pit prop');
  }
  assert.equal(cryptFloor(0), 0);
  assert.equal(cryptFloor(1), 1);
  assert.equal(cryptFloor(9), 4, 'deeper than the fourth, as the fourth');
});

test('the stairwell: a kerb round it with its edge lit, its steps going down into the dark', () => {
  for (const k of FLOORS) {
    for (const way of ['x', 'y'] as const) {
      const s = cryptWays(k).stair[way];
      const p = paintingOf(s);
      // its kerb: the lit edge along the opening (art/crypt_ways.ts: as the floor's edge over a drop)
      const lip = mix(CRYPT_FLOORS[k - 1].slab[3], '#ffffff', 0.15);
      let lit = 0;
      pixels([s], (c) => {
        if (hex(c) === lip) lit++;
      });
      assert.ok(lit > 60, `floor ${k}, way ${way}: the kerb's lit edge (${lit} pixels)`);
      // the lower half of the picture (deeper, toward the eye) is darker than the upper (the top of the steps and the kerb)
      let top = 0;
      let bottom = 0;
      let nt = 0;
      let nb = 0;
      pixels([s], (c, _a, _x, y) => {
        if (y < p.h * 0.45) {
          top += luma(c);
          nt++;
        } else if (y > p.h * 0.6) {
          bottom += luma(c);
          nb++;
        }
      });
      assert.ok(top / nt > bottom / nb, `floor ${k}, way ${way}: darker going down`);
      // and the dark at the bottom of it is there: the darkest twentieth of it nearly black
      const ls: number[] = [];
      pixels([s], (c) => ls.push(luma(c)));
      ls.sort((a, b) => a - b);
      assert.ok(ls[Math.floor(ls.length / 20)] < 13, `floor ${k}, way ${way}: the dark at the bottom`);
    }
  }
});

test('the waypoint: asleep its cuts are dark; awake, its light goes round, every frame its own; a warp\'s column rises and goes', () => {
  for (const k of FLOORS) {
    const w = cryptWays(k).way;
    let cyan = 0;
    pixels([w.asleep], (c) => {
      if (isCyanGlow(c)) cyan++;
    });
    assert.equal(cyan, 0, 'asleep, no light');
    assert.equal(w.awake.length, WAY_FRAMES);
    assert.equal(w.warp.length, WARP_FRAMES);
    const keys = w.awake.map((s) => Buffer.from(paintingOf(s).d).toString('base64'));
    assert.equal(new Set(keys).size, WAY_FRAMES, 'awake, every frame of its loop its own');
    // its light goes round: the brightest of the ring (away from the disc in the middle) a step further round every frame, all the same way
    const angles = w.awake.map((s) => {
      const p = paintingOf(s);
      const cx = s.ax * GRAIN;
      const cy = s.ay * GRAIN - 8;
      let sx = 0;
      let sy = 0;
      pixels([s], (c, _a, x, y) => {
        if (hex(c) !== '#ffffff' || Math.hypot((x + 0.5 - cx) / 2, y + 0.5 - cy) < 7) return;
        sx += (x + 0.5 - cx) / 2;
        sy += y + 0.5 - cy;
      });
      assert.ok(p.w > 0);
      return Math.atan2(sy, sx);
    });
    const steps = angles.map((a, i) => {
      const d = angles[(i + 1) % angles.length] - a;
      return Math.atan2(Math.sin(d), Math.cos(d));
    });
    assert.ok(steps.every((d) => d > 0) || steps.every((d) => d < 0), `floor ${k}: round, all one way: ${steps.map((d) => ((d * 180) / Math.PI).toFixed(0)).join(', ')}`);
    assert.ok(Math.abs(steps.reduce((a, b) => a + b, 0)) > 5.5, 'once round in a loop');
    // the column: how high it stands, frame by frame (rows with light in them), and how wide at its widest
    const heights = w.warp.map((s) => {
      const p = paintingOf(s);
      let rows = 0;
      for (let y = 0; y < p.h - 40; y++) {
        let any = false;
        for (let x = 0; x < p.w; x++) if (p.d[(y * p.w + x) * 4 + 3] > 0) any = true;
        if (any) rows++;
      }
      return rows;
    });
    for (let f = 1; f <= 3; f++) assert.ok(heights[f] > heights[f - 1], `it rises: ${heights.join(', ')}`);
    const widths = w.warp.map((s) => {
      const p = paintingOf(s);
      const y = p.h - 80;
      let n = 0;
      for (let x = 0; x < p.w; x++) if (p.d[(y * p.w + x) * 4 + 3] > 0) n++;
      return n;
    });
    assert.ok(widths[5] > widths[2] && widths[WARP_FRAMES - 1] < widths[5], `it flares and thins away: ${widths.join(', ')}`);
  }
});
