// THE RIVERS FLOWING, IN THE MILL RACE'S LOOK, AND THE LIVELIER WHEEL (src/art/flowing.ts; the art chat's, a mock-up behind FLOW,
// off; docs/mockups/rivers/README.md), held to what the main chat needs and to his rules:
//   1. the switch off; outside the art, nothing of the game imports it; in the art only the Millrace's ground, the Pinewood's
//      and floor 13's pieces, each behind the switch;
//   2. along and across a line: how far along it, and which side of it and how far;
//   3. THE WATER: painted only where a floor's water is (the race, the river), every pixel opaque; it moves from frame to frame,
//      and the last frame runs into the first as any frame into the next (it goes round without a jump); carried downstream;
//      nothing cyan or pink; the Millrace's as quiet as Act 2's places (Colour 3 and 4);
//   4. the river banked as the race is (the Millrace: the race's dressed stone; the Pinewood: river boulders), on the switch;
//   5. THE WHEEL: four rounds of WHEEL_STEPS frames, all one size; each a step on from the last, and round again without a jump;
//      nothing cyan or pink.
//   run: tsx --test tests/flowing.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import fs from 'node:fs';
// @ts-ignore
import path from 'node:path';
import { FLOW, FLOW_FPS, FLOW_FRAMES, lineAlong, lineSide, paintFlow } from '../src/art/flowing';
import type { FlowLayer, FlowPiece } from '../src/art/flowing';
import { MR_RACE_HALF, MR_RIVER_HALF, millraceFlow, millraceLook } from '../src/art/millrace';
import { RIVER_HALF, pinewoodFlow, pinewoodLook } from '../src/art/pinewood';
import { WHEEL_STEPS, millracePieces } from '../src/art/floor13';
import { QUIET_MOST } from '../src/art/act2_quiet';
import { pictureOf, worldOf } from '../src/art/terrain';
import { paintWithoutCanvas, paintingOf } from './helpers';
import { hsv } from './floor_checks';

const test: (name: string, fn: () => void) => void = nodeTest;
const assert: { ok(v: unknown, m?: string): void; equal(a: unknown, b: unknown, m?: string): void } = nodeAssert;

paintWithoutCanvas();
const OFF = FLOW.on;
FLOW.on = true;

/** A stretch of the Millrace laid by hand: a river bending along y = 12, running +x; a race along y = 24, running +x, to x = 28. */
const RIVER: [number, number][] = [[-4, 12.5], [10, 11], [20, 14], [44, 12.5]];
const RACE: [number, number][] = [[-4, 24.5], [28, 24.5]];
const riverD = (x: number, y: number): number => Math.abs(lineSide(RIVER)(x, y));
const raceD = (x: number, y: number): number => (x < 28 ? Math.abs(y - 24.5) : Infinity);
const MILL = { river: riverD, race: raceD, raceFlow: (): [number, number] => [1, 0], riverAlong: lineAlong(RIVER), raceAlong: lineAlong(RACE), riverSide: lineSide(RIVER), raceSide: lineSide(RACE) };
const PINE = { river: riverD, riverAlong: lineAlong(RIVER), riverSide: lineSide(RIVER) };

// the picture of a stretch of it, 4 to 30 along x, both waters across
const [X0] = pictureOf(4, 28);
const [X1] = pictureOf(30, 8);
const [, Y0] = pictureOf(4, 8);
const [, Y1] = pictureOf(30, 28);
const BOX = [Math.floor(X0 / 2) * 2, Math.floor(Y0 / 2) * 2, Math.ceil(X1 - X0), Math.ceil(Y1 - Y0)] as const;
const framesOf = (layer: FlowLayer): FlowPiece[] => Array.from({ length: FLOW_FRAMES }, (_, f) => paintFlow(layer, BOX[0], BOX[1], BOX[2], BOX[3], f));
const MILL_FRAMES = framesOf(millraceFlow(MILL));
const PINE_FRAMES = framesOf(pinewoodFlow(PINE));

/** How many pixels differ between two frames. */
const differ = (a: FlowPiece, b: FlowPiece): number => {
  let n = 0;
  for (let i = 0; i < a.rgba.length; i += 4) if (a.rgba[i] !== b.rgba[i] || a.rgba[i + 1] !== b.rgba[i + 1] || a.rgba[i + 2] !== b.rgba[i + 2]) n++;
  return n;
};

// (TOLD BY THE MAIN CHAT, 23 Oct 2026: hooked in behind the switch, on his yes in the art chat by 15:23, “Yes, send to main
// (Recommended)”: the ground's looks and the water laid over its pieces (render/outdoor.ts, on the page and in the painter's
// worker), the wheel's frames (render/act1_pieces.ts), and the page's handle holds the switch for pictures. Still off until he
// says to put it live.)
// (ON, at his word in the main chat: his yes by 22:06, 23 Oct 2026, to the game's pictures: “Yes, next version (Recommended)”)
test('1. the switch on; nothing of the game imports it but the art that paints the water and the wheel', () => {
  assert.equal(OFF, true, 'FLOW is on');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x: unknown) => String(x).replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/') || f === 'art/flowing.ts') continue;
    const dir = f.split('/').slice(0, -1);
    for (const [, spec] of (fs.readFileSync(path.join('src', f), 'utf8') as string).matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const bit of spec.split('/')) {
        if (bit === '..') parts.pop();
        else if (bit !== '.') parts.push(bit);
      }
      if (parts.join('/') === 'art/flowing') users.push(f);
    }
  }
  assert.equal([...new Set(users)].sort().join(' '), 'art/floor13.ts art/millrace.ts art/pinewood.ts main.ts render/act1_pieces.ts render/outdoor.ts render/painter.ts', 'the files that import it');
  for (const f of ['art/floor13.ts', 'art/millrace.ts', 'art/pinewood.ts']) {
    const src = fs.readFileSync(path.join('src', f), 'utf8') as string;
    assert.ok(/FLOW\.on \?/.test(src), `${f}: what it paints new, only on the switch`);
  }
});

test('2. along a line and across it: how far along, which side and how far', () => {
  const along = lineAlong([[0, 0], [10, 0], [10, 10]]);
  const side = lineSide([[0, 0], [10, 0], [10, 10]]);
  assert.ok(Math.abs(along(4, 1) - 4) < 1e-9, 'along the first leg');
  assert.ok(Math.abs(along(9, 6) - 16) < 1e-9, 'along the second, from the first point');
  // running +x, its left (looking the way it runs, the world's y down the map) is +y
  assert.ok(Math.abs(side(4, 1) - 1) < 1e-9 && Math.abs(side(4, -2) + 2) < 1e-9, `which side and how far (${side(4, 1)}, ${side(4, -2)})`);
  // (on the second leg, running +y, its left is −x: the inside of the bend, as on the first leg)
  assert.ok(side(9, 6) > 0 && side(12, 6) < 0, `round the bend, its sides kept (${side(9, 6)}, ${side(12, 6)})`);
});

test('3. the water: only where it is, opaque; moving, round without a jump, downstream; nothing cyan or pink; the Millrace quiet', () => {
  const where = [
    { name: 'the Millrace', frames: MILL_FRAMES, wet: (x: number, y: number) => raceD(x, y) < MR_RACE_HALF || riverD(x, y) < MR_RIVER_HALF, quiet: true },
    { name: 'the Pinewood', frames: PINE_FRAMES, wet: (x: number, y: number) => riverD(x, y) < RIVER_HALF, quiet: false },
  ];
  for (const { name, frames, wet, quiet } of where) {
    const [W, H] = [BOX[2], BOX[3]];
    let water = 0;
    for (let r = 0; r < H; r += 1) {
      for (let c = 0; c < W; c += 1) {
        const [x, y] = worldOf(BOX[0] + c, BOX[1] + r);
        const o = (r * W + c) * 4;
        const a = frames[0].rgba[o + 3];
        assert.equal(a, wet(x, y) ? 255 : 0, `${name}: water there, and opaque, or nothing (${c}, ${r})`);
        if (!a) continue;
        water++;
        for (const f of [0, 7]) {
          const [R, G, B] = [frames[f].rgba[o], frames[f].rgba[o + 1], frames[f].rgba[o + 2]];
          const [h, s, v] = hsv(R, G, B);
          assert.ok(!(h >= 175 && h <= 200 && s > 0.55 && v > 0.6), `${name}: nothing cyan (${c}, ${r})`);
          assert.ok(!(h >= 320 && h <= 350 && s > 0.5 && v > 0.55), `${name}: nothing pink (${c}, ${r})`);
          const M = Math.max(R, G, B);
          if (quiet) assert.ok(M === 0 || (M - Math.min(R, G, B)) / M <= QUIET_MOST + 0.02, `${name}: as quiet as Act 2's places (${c}, ${r}: ${R}, ${G}, ${B})`);
        }
      }
    }
    assert.ok(water > 4000, `${name}: its water (${water} pixels)`);
    // moving: each frame to the next; the last to the first no more than the others
    const steps = frames.map((f, i) => differ(f, frames[(i + 1) % FLOW_FRAMES]));
    const mean = steps.slice(0, -1).reduce((a, b) => a + b, 0) / (FLOW_FRAMES - 1);
    assert.ok(Math.min(...steps) > water * 0.05, `${name}: every frame moves on (${Math.min(...steps)} of ${water})`);
    assert.ok(steps[FLOW_FRAMES - 1] < mean * 1.5, `${name}: round without a jump (last to first ${steps[FLOW_FRAMES - 1]}, the mean ${Math.round(mean)})`);
  }
  // carried downstream: the Millrace's race (running +x) a frame on is most like itself moved its speed's worth along +x
  const race = millraceFlow(MILL);
  const y = 24.5;
  const row = (f: number, dx: number): string[] =>
    Array.from({ length: 200 }, (_, i) => {
      const x = 6 + i * 0.05 + dx;
      const [px, py] = pictureOf(x, y);
      const c = race.paint(x, y, Math.round(px), Math.round(py), f);
      return c.join();
    });
  const now = row(0, 0);
  const like = (dx: number): number => row(1, dx).filter((c, i) => c === now[i]).length;
  const step = 4 / FLOW_FPS; // the race's speed, 4 tiles a second
  assert.ok(like(step) > like(-step) && like(step) > like(0), `downstream (+x) ${like(step)}, upstream ${like(-step)}, still ${like(0)}`);
});

test('4. the river banked as the race is: the Millrace\'s in the race\'s dressed stone, the Pinewood\'s in river boulders; on the switch', () => {
  // just past the water on the river's bank, all along it: stone (grey), on the switch; as it was off it
  const bankOf = (on: boolean, look: 'mill' | 'pine'): number[][] => {
    FLOW.on = on;
    try {
      const L = look === 'mill' ? millraceLook(MILL) : pinewoodLook(PINE);
      const half = look === 'mill' ? MR_RIVER_HALF : RIVER_HALF;
      return Array.from({ length: 60 }, (_, i) => {
        const x = 4 + i * 0.43;
        let y = 10;
        while (lineSide(RIVER)(x, y) < half + 0.09) y += 0.01;
        const [px, py] = pictureOf(x, y);
        return [...L.floor(x, y, Math.round(px), Math.round(py), 1)];
      });
    } finally {
      FLOW.on = true;
    }
  };
  for (const look of ['mill', 'pine'] as const) {
    const on = bankOf(true, look);
    const off = bankOf(false, look);
    const grey = on.filter((c) => hsv(c[0], c[1], c[2])[1] < 0.3).length;
    const changed = on.filter((c, i) => c.join() !== off[i].join()).length;
    assert.ok(grey >= on.length * (look === 'mill' ? 0.8 : 0.5), `${look}: its bank stone, on the switch (${grey} of ${on.length} grey)`);
    assert.ok(changed >= on.length * 0.8, `${look}: as before off the switch, and banked anew on it (${changed} of ${on.length} changed)`);
  }
});

test('5. the wheel: four rounds of WHEEL_STEPS frames, one size, each a step on, round without a jump; nothing cyan or pink', () => {
  const wheel = millracePieces().find((p) => p.name === 'the water wheel')!;
  const frames = wheel.frames!;
  assert.equal(frames.length, 4 * WHEEL_STEPS, 'four rounds (along +y forward, back; along +x forward, back)');
  const px = frames.map(paintingOf);
  for (const p of px) assert.ok(p.w === px[0].w && p.h === px[0].h, 'one size');
  const diff = (a: (typeof px)[0], b: (typeof px)[0]): number => {
    let n = 0;
    for (let i = 0; i < a.d.length; i += 4) if (a.d[i] !== b.d[i] || a.d[i + 1] !== b.d[i + 1] || a.d[i + 2] !== b.d[i + 2] || a.d[i + 3] !== b.d[i + 3]) n++;
    return n;
  };
  for (let round = 0; round < 4; round++) {
    const steps = Array.from({ length: WHEEL_STEPS }, (_, f) => diff(px[round * WHEEL_STEPS + f], px[round * WHEEL_STEPS + ((f + 1) % WHEEL_STEPS)]));
    const mean = steps.slice(0, -1).reduce((a, b) => a + b, 0) / (WHEEL_STEPS - 1);
    assert.ok(Math.min(...steps) > 50, `round ${round}: every frame a step on (${steps})`);
    assert.ok(steps[WHEEL_STEPS - 1] < mean * 1.6, `round ${round}: round without a jump (${steps})`);
  }
  for (const p of px) {
    for (let i = 0; i < p.d.length; i += 4) {
      if (!p.d[i + 3]) continue;
      const [h, s, v] = hsv(p.d[i], p.d[i + 1], p.d[i + 2]);
      assert.ok(!(h >= 175 && h <= 200 && s > 0.55 && v > 0.6), 'nothing cyan');
      assert.ok(!(h >= 320 && h <= 350 && s > 0.5 && v > 0.55), 'nothing pink');
    }
  }
});
