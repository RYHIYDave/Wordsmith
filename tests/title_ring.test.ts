// The start screen's new picture, THE RING ON THE HILL (src/art/title_ring.ts): a mock-up behind a switch
// that is off. The owner to the art chat, 21 Oct 2026, 17:26 Pacific: “I’d like to scrap the title screen
// and start again.  I like the moving picture style, but I don’t like the current art.” Shown ten
// sketches (src/dev/title_options.ts), his pick by 17:50: “9”; to it moving, at 18:11, “I like the surge,
// take the wordsmith out”. The picture painted pixel by pixel
// (paintRing) is a plain array, so this runs here without a browser; the game lays it up out of layers
// with a canvas (makeRingTitle), which its dev page films (src/dev/preview_title_ring.ts).
//   run: tsx --test tests/title_ring.test.ts
//   1. the switch is off, and nothing of the game uses the picture;
//   2. the picture is whole: every pixel of it painted, and it sinks into the screen's dark at its foot and top;
//   3. nothing warm or pink glows in it: what glows is his, cyan (the moon and the stars white; what
//      his light falls on, the night's blue);
//   4. it lives: the sky, the runes and the motes change from moment to moment; the hill under the ring
//      does not;
//   5. no one stands in the ring: the column shows whole from the slab up, and through the gap in the
//      ring's front the slab.

// @ts-ignore - node typings are not part of this project
import test from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import fs from 'node:fs';
import { RING_H, RING_LIP, RING_W, TITLE_RING, paintRing } from '../src/art/title_ring';

const at = (p: { d: Int32Array }, x: number, y: number): [number, number, number] => {
  const c = p.d[y * RING_W + x];
  return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
};
/** Hue in degrees, saturation and brightness (0 to 1) of a colour. */
function hsv([r, g, b]: [number, number, number]): [number, number, number] {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const d = mx - mn;
  let hue = 0;
  if (d > 0) hue = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(hue * 60 + 360) % 360, mx ? d / mx : 0, mx / 255];
}

test('1. the switch is off, and nothing of the game uses the picture', () => {
  assert.equal(TITLE_RING.on, false);
  const files = fs.readdirSync('src', { recursive: true }).map(String).filter((f: string) => f.endsWith('.ts') && !f.split('\\').join('/').startsWith('dev/'));
  const users = files.filter((f: string) => !f.endsWith('title_ring.ts') && /from '[./a-z_]*\/title_ring'/.test(fs.readFileSync(`src/${f}`, 'utf8')));
  assert.deepEqual(users, []);
});

test('2. the picture is whole, and sinks into the dark at its foot and top', () => {
  const p = paintRing(0);
  assert.equal(p.a.length, RING_W * RING_H);
  assert.ok(p.a.every((v) => v === 255));
  assert.ok(RING_LIP > 0 && RING_LIP < RING_H);
  const night = (y: number): number => {
    let n = 0;
    for (let x = 0; x < RING_W; x++) if (p.d[y * RING_W + x] === 0x05040f) n++;
    return n / RING_W;
  };
  assert.ok(night(RING_H - 1) > 0.9, 'its last row is all but the dark');
  assert.ok(night(0) > 0.7, 'its first row too');
  assert.ok(night(RING_H - 30) === 0 && night(20) < 0.01, 'and not far in');
});

test('3. nothing warm or pink glows in it: what glows is his, cyan', () => {
  for (const t of [0, 1.7, 4.2]) {
    const p = paintRing(t);
    let warm = 0;
    let pink = 0;
    let bright = 0;
    let notCyan = 0;
    for (let y = 0; y < RING_H; y++) {
      for (let x = 0; x < RING_W; x++) {
        const [hue, sat, val] = hsv(at(p, x, y));
        if (sat > 0.35 && val > 0.45 && (hue < 70 || hue > 290)) warm++;
        if (sat > 0.35 && val > 0.45 && hue > 290) pink++;
        if (val > 0.8 && sat > 0.3) {
          bright++;
          // (his light is cyan; what it lights, the stones' faces, is the night's blue)
          if (hue < 160 || hue > 250) notCyan++;
        }
      }
    }
    assert.equal(warm, 0, `warm light at ${t} s`);
    assert.equal(pink, 0, `pink at ${t} s`);
    assert.ok(bright > 200, `his light shows (${bright})`);
    assert.equal(notCyan, 0, `every bright and coloured pixel is cyan, or blue where it is lit, at ${t} s`);
  }
});

test('4. it lives: the sky, the runes and the motes change; the hill under the ring does not', () => {
  const a = paintRing(0.5);
  const b = paintRing(2.9);
  let sky = 0;
  let hill = 0;
  for (let y = 0; y < RING_H; y++) {
    for (let x = 0; x < RING_W; x++) {
      if (a.d[y * RING_W + x] === b.d[y * RING_W + x]) continue;
      if (y < 170) sky++;
      if (y > 330 && (x < 120 || x > 520)) hill++;
    }
  }
  assert.ok(sky > 5000, `the sky moves (${sky})`);
  assert.equal(hill, 0, 'the foot of the hill keeps still');
});

test('5. no one stands in the ring: the column shows whole from the slab up', () => {
  const p = paintRing(0);
  // (a little right of its middle: the letters climbing it are dark on its heart)
  for (let y = 140; y <= 255; y++) {
    const [, , v] = hsv(at(p, 324, y));
    assert.ok(v > 0.7, `the column is bright at row ${y} (${v.toFixed(2)})`);
  }
  // where he stood, left of the column: the lit ground and the slab, nothing dark standing on them
  let dark = 0;
  for (let y = 240; y <= 290; y++) for (let x = 292; x <= 306; x++) if (hsv(at(p, x, y))[2] < 0.12) dark++;
  assert.equal(dark, 0, 'nothing dark stands before the column');
});
