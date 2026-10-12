// The picture behind the start screen MADE NEW FOR THE NEW WORDSMITH (src/art/title_smith3.ts), a
// mock-up behind a switch that is off, and the life drawn over it. The picture is a plain array until
// it is put on a canvas, so this runs here without a browser.
//   run: tsx --test tests/titlesmith3.test.ts
//
// The owner, 11 Oct 2026, 19:46: "Can you reimagine the title screen art to reflect the new wordsmith
// design". The new design is the wordsmith of Version 19.6 (art/smith3.ts, his "Yes, this is him
// (Recommended)"): a teal cowl and mantle, a night-blue robe, a white beard and brows, his eyes
// burning cyan, RUNES BURNING ON HIM (down his robe, along the edge of his mantle and cowl, in his
// bare forearms and the backs of his hands, one on his brow); and his ring big and wild (a great
// rune burning in each stone, light licking up it, letters of light swirling round him, a column of
// light off his slab). Kept: the picture he chose (from the floor, his "6 is fantastic"), and what
// he asked of it on 5 Oct ("get the runes to light up in succession ... the whole top pulses and
// illuminates the smith's face"; "we want to see him breathing"). And the game's rule: what glows of
// a friend is cyan; nothing warm glows here.
//   1. the switch is off, and with it off the start screen is the old one;
//   2. the picture is whole, and sinks into the dark at its edges;
//   3. he is where the start screen is told he is (eyes, the rune on his brow, the peak of his cowl);
//   4. no warm light anywhere in it;
//   5. RUNES BURN ON HIM: in his forearms, the backs of his hands, down his robe, along his mantle's
//      edge and his cowl's brim, on his brow;
//   6. the ring: a great rune in each of the four stones, which the life keeps alight at every moment,
//      and light licking up the stone above each;
//   7. the life draws inside the picture, changes from moment to moment, and never puts a dot on his
//      face but his eyes and the rune on his brow;
//   8. the letters of light go round him, some before him and some behind, and burst outward as the
//      top pulses its greatest;
//   9. the round is the one he asked for on 5 Oct (the power, the pulses, his breath), as the old one's;
//  10. a frame of his breath: his shoulders higher, his head, his hands and the table where they were;
//  11. the top alight lights his face from below and brings no warm light.
//
// And EVERY ANIMATION CHECK of his rulebook (his words of 11 Oct, 19:46, of the first one: "I'd like it
// to pass all the checks we have for animations.  And to just be drawn better.  The arms are too thin
// and the hands look weird"):
//  12. the great moment winds up: as he gathers it the letters are drawn in and whipped round faster,
//      motes are pulled in to the word, his eyes burn up;
//  13. ... bursts: the top pulses its greatest, the screen kicks, a flash, rings of light, sparks;
//  14. ... and follows through: the blast blows his beard and mantle up and out, they drop back; the
//      letters come back in; grit falls; and the screen's kick dies away;
//  15. nothing jumps: every letter goes on smoothly from frame to frame, round after round, and where
//      it goes fast it smears;
//  16. no lone pixel, and no soft fade, in anything that moves;
//  17. alive when still: his habits (he glances aside; the fingers of his right hand drum on the edge),
//      only while the power is quiet, and nothing of him but his fingers moves for them;
//  18. his arms are thick and his hands are drawn whole: wrist, knuckles, four fingers, a thumb, nails.

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import fs from 'node:fs';
import {
  SMITH3_BREATH, SMITH3_BROW, SMITH3_CHOSEN, SMITH3_CYCLE, SMITH3_EYES, SMITH3_H, SMITH3_HEAD_TOP, SMITH3_LETTERS, SMITH3_LIP, SMITH3_PLAIN, SMITH3_W,
  SMITH3_DRUM, SMITH3_FLASH, SMITH3_GATHER, SMITH3_GREAT,
  TITLE_SMITH3, paintSmith3, smith3Blow, smith3Flash, smith3Breath, smith3Drum, smith3Gather, smith3Glance, smith3Kick, smith3Letter, smith3Life, smith3Pulse,
} from '../src/art/title_smith3';
import { SMITH2_CYCLE, smith2Breath, smith2Pulse } from '../src/art/title_smith2';
import { rgba } from '../src/engine/px';

const W = SMITH3_W;
const H = SMITH3_H;
const CX = W / 2;
const painted = paintSmith3({ ...SMITH3_PLAIN, ...SMITH3_CHOSEN });
const d = painted.px.d;

const at = (p: Uint8ClampedArray, x: number, y: number): [number, number, number, number] => {
  const i = (y * W + x) * 4;
  return [p[i], p[i + 1], p[i + 2], p[i + 3]];
};
/** Is this colour the word's (cyan, or the white of its heart): more blue and green in it than red? */
const cold = (c: readonly number[]): boolean => c[1] >= c[0] && c[2] >= c[0];
/** A burning rune's light: cyan or white, and bright. */
const burning = (c: readonly number[]): boolean => cold(c) && c[1] > 150 && c[2] > 170;
/** Is it a warm light: a good deal more red than blue? */
const warm = (c: readonly number[]): boolean => c[0] > 150 && c[0] > c[2] + 60;

test('1. the switch is off, and with it off the start screen is the old one', () => {
  assert.equal(TITLE_SMITH3.on, false);
  const main = fs.readFileSync('src/main.ts', 'utf8');
  assert.ok(main.includes("TITLE_SMITH3.on ? 'smith3' : 'floor'"), 'the start screen is the old one unless the switch is on');
  for (const f of fs.readdirSync('src', { recursive: true }).map((x: string) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f === 'main.ts' || f === 'art/title_smith3.ts') continue;
    assert.ok(!/title_smith3/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} uses the new picture`);
  }
});

test('2. the picture is whole: every pixel painted, and it sinks into the dark at its top, its sides and its foot', () => {
  assert.equal(d.length, W * H * 4);
  for (let i = 3; i < d.length; i += 4) assert.equal(d[i], 255, `pixel ${(i - 3) / 4} is painted`);
  const night = rgba('#05040f');
  for (let x = 0; x < W; x += 7) {
    assert.deepEqual(at(d, x, 0).slice(0, 3), [night[0], night[1], night[2]], `the top row at ${x} is the dark`);
    assert.deepEqual(at(d, x, H - 1).slice(0, 3), [night[0], night[1], night[2]], `the bottom row at ${x} is the dark`);
  }
  for (let y = 0; y < H; y += 7) {
    assert.deepEqual(at(d, 0, y).slice(0, 3), [night[0], night[1], night[2]], `the left edge at ${y} is the dark`);
    assert.deepEqual(at(d, W - 1, y).slice(0, 3), [night[0], night[1], night[2]], `the right edge at ${y} is the dark`);
  }
});

test('3. he is where the start screen is told he is: his eyes, the rune on his brow, the peak of his cowl', () => {
  for (const [ex, ey] of SMITH3_EYES) assert.ok(burning(at(d, ex, ey)), `an eye at (${ex}, ${ey}) burns (${at(d, ex, ey)})`);
  assert.ok(Math.abs(SMITH3_EYES[0][0] + SMITH3_EYES[1][0] - (W - 1)) <= 1, 'his eyes are either side of the middle of the picture');
  assert.ok(burning(at(d, SMITH3_BROW[0], SMITH3_BROW[1])), `the rune on his brow burns (${at(d, SMITH3_BROW[0], SMITH3_BROW[1])})`);
  // (the peak of his cowl: teal, more green and blue in it than red)
  const peak = at(d, CX - 2, SMITH3_HEAD_TOP + 4);
  assert.ok(peak[1] > peak[0] + 20 && peak[2] > peak[0] + 20, `the peak of his cowl is at the top of his head (${peak})`);
  assert.ok(SMITH3_HEAD_TOP < SMITH3_EYES[0][1] && SMITH3_EYES[0][1] < SMITH3_LIP, 'his eyes are between the top of his head and the table');
});

test('4. no warm light anywhere in it: what glows of his is the word\'s colour', () => {
  let n = 0;
  for (let i = 0; i < d.length; i += 4) if (warm([d[i], d[i + 1], d[i + 2]])) n++;
  assert.equal(n, 0, 'warm pixels');
});

test('5. RUNES BURN ON HIM: in his forearms, the backs of his hands, down his robe, along his mantle\'s edge and his cowl\'s brim', () => {
  const count = (x0: number, y0: number, x1: number, y1: number): number => {
    let n = 0;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (burning(at(d, x, y))) n++;
    return n;
  };
  for (const s of [-1, 1]) {
    const side = s < 0 ? 'his right' : 'his left';
    const xs = (a: number, b: number): [number, number] => (s < 0 ? [CX - b, CX - a] : [CX + a, CX + b]);
    const [fa, fb] = xs(82, 116);
    assert.ok(count(fa, 222, fb, 262) >= 12, `${side} forearm (${count(fa, 222, fb, 262)})`);
    const [ha, hb] = xs(80, 104);
    assert.ok(count(ha, SMITH3_LIP - 24, hb, SMITH3_LIP - 12) >= 4, `the back of ${side} hand (${count(ha, SMITH3_LIP - 24, hb, SMITH3_LIP - 12)})`);
    const [ra, rb] = xs(40, 54);
    assert.ok(count(ra, 226, rb, 266) >= 12, `down ${side} of his robe (${count(ra, 226, rb, 266)})`);
    const [ma, mb] = xs(40, 112);
    assert.ok(count(ma, 196, mb, 232) >= 20, `along his mantle's edge on ${side} (${count(ma, 196, mb, 232)})`);
  }
  assert.ok(count(CX - 26, 148, CX + 26, 167) >= 12, `along his cowl's brim (${count(CX - 26, 148, CX + 26, 167)})`);
});

test('6. the ring: a great rune in each of the four stones, alight at every moment, and light licking up the stone above it', () => {
  const { scene } = painted;
  const great = scene.runes.filter((r) => r.great);
  assert.equal(great.length, 4, 'four great runes');
  for (const r of great) assert.ok(r.dots.length > 30 && r.s >= 3, `a great rune is great (${r.dots.length} pixels, ${r.s} times)`);
  for (let step = 0; step < 60; step++) {
    const t = step * 0.27;
    const lit = new Map<number, number>();
    const licks: number[] = [];
    smith3Life(t, scene, (x, y, _c, a, w = 1, h = 1) => {
      for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) lit.set(yy * W + xx, Math.max(lit.get(yy * W + xx) ?? 0, a));
      if (w === 1 && h === 1) licks.push(y * W + x);
    });
    for (const r of great) {
      let on = 0;
      for (let i = 0; i < r.dots.length; i++) if ((lit.get(r.dots[i]) ?? 0) >= 0.36) on++;
      assert.ok(on >= r.dots.length * 0.9, `t = ${t.toFixed(2)}: the great rune at (${r.x}, ${r.y}) burns (${on} of ${r.dots.length})`);
      // (above it, within a stone's width: light on the stone; the life lays it there through a sheet that lets nothing off the stone)
      let above = 0;
      for (const i of licks) {
        const x = i % W;
        const y = Math.floor(i / W);
        if (y < r.y && y > r.y - 50 && Math.abs(x - (r.x + 2 * r.s)) < 4 * r.s + 10 && scene.stone[i] === 1) above++;
      }
      assert.ok(above > 10, `t = ${t.toFixed(2)}: light licks up the stone above the great rune at (${r.x}, ${r.y}) (${above})`);
    }
  }
});

test('7. the life: it draws inside the picture, changes from moment to moment, and never puts a dot on his face but his eyes and the rune on his brow', () => {
  const { scene } = painted;
  const seen = new Set<string>();
  for (let step = 0; step < 150; step++) {
    const t = step / 7.5;
    let dots = 0;
    let sum = 0;
    smith3Life(t, scene, (x, y, color, a, w = 1, h = 1) => {
      assert.ok(Number.isInteger(x) && Number.isInteger(y), `a dot at whole pixels (${x}, ${y})`);
      assert.ok(a >= -0.001 && a <= 1.6, `a strength of ${a}`);
      assert.equal(rgba(color).length, 4);
      assert.ok(w >= 1 && h >= 1 && w <= 340 && h <= 40, `a block of ${w} x ${h}`);
      assert.ok(!warm(rgba(color)), `a warm dot (${color})`);
      dots++;
      sum += x * 31 + y * 17 + Math.round(a * 100);
      // his face: from under the rune on his brow to his moustache, between his temples
      const faceTop = SMITH3_BROW[1] + 4;
      const faceBottom = SMITH3_EYES[0][1] + 14;
      const onFace = a > 0.05 && x + w > SMITH3_EYES[0][0] - 4 && x < SMITH3_EYES[1][0] + 5 && y + h > faceTop && y < faceBottom;
      const onEyes = y >= SMITH3_EYES[0][1] - 1 && y + h <= SMITH3_EYES[0][1] + 3;
      assert.ok(!onFace || onEyes, `a dot on his face at (${x}, ${y}) ${w} x ${h}, t = ${t.toFixed(2)}`);
    });
    assert.ok(dots > 20, `there is life at t = ${t.toFixed(2)} (${dots} dots)`);
    seen.add(String(sum));
  }
  assert.ok(seen.size > 100, `it changes from moment to moment (${seen.size} different moments of 150)`);
});

test('8. the letters of light go round him, some before him and some behind, and burst outward as the top pulses its greatest', () => {
  assert.ok(SMITH3_LETTERS >= 12, `letters of light (${SMITH3_LETTERS})`);
  let front = 0;
  let behind = 0;
  const spread = (t: number): number => {
    let sum = 0;
    for (let k = 0; k < SMITH3_LETTERS; k++) sum += Math.abs(smith3Letter(k, t).x - CX);
    return sum / SMITH3_LETTERS;
  };
  for (let step = 0; step < 80; step++) {
    const t = step * 0.1;
    for (let k = 0; k < SMITH3_LETTERS; k++) {
      const l = smith3Letter(k, t);
      if (l.front) front++;
      else behind++;
      assert.ok(l.y < SMITH3_LIP - 8, `letter ${k} keeps above the table (${l.y})`);
    }
  }
  assert.ok(front > 200 && behind > 200, `some go before him and some behind (${front}, ${behind})`);
  // (each goes round: where one is changes)
  for (let k = 0; k < SMITH3_LETTERS; k++) assert.notDeepEqual(smith3Letter(k, 0.5), smith3Letter(k, 2.5), `letter ${k} goes round`);
  // the great pulse: where the two runs meet in the middle, at 2 x 2 + 1.6 = 5.6 s into the round
  let peak = 0;
  let peakAt = 0;
  for (let t = 5.5; t < 6.6; t += 1 / 30) {
    const b = smith3Letter(0, t).burst;
    if (b > peak) {
      peak = b;
      peakAt = t;
    }
  }
  assert.ok(peak > 0.5 && Math.abs(peakAt - 5.75) < 0.15, `they burst at the great pulse (${peak.toFixed(2)} at ${peakAt.toFixed(2)})`);
  assert.ok(smith3Pulse(peakAt) > 0.6, 'as the top pulses');
  assert.ok(spread(peakAt) > spread(2.2) * 1.25, `they are further out (${spread(peakAt).toFixed(0)} against ${spread(2.2).toFixed(0)})`);
  assert.equal(smith3Letter(0, 2.2).burst, 0, 'and not between');
});

test('9. the round is the one he asked for on 5 Oct, as the old picture\'s: the power, the pulses, his breath', () => {
  assert.equal(SMITH3_CYCLE, SMITH2_CYCLE);
  for (let t = 0; t < 2 * SMITH3_CYCLE; t += 0.13) {
    assert.equal(smith3Pulse(t), smith2Pulse(t), `the top pulses as it did (${t.toFixed(2)})`);
    assert.equal(smith3Breath(t), smith2Breath(t), `he breathes as he did (${t.toFixed(2)})`);
  }
});

test('10. a frame of his breath: his shoulders are higher, his head and his hands and the table are where they were', () => {
  const base = painted.px.d;
  const arris = SMITH3_LIP - 8;
  let before = 0;
  for (let rise = 1; rise <= SMITH3_BREATH; rise++) {
    const f = painted.frame(rise).px.d;
    let differ = 0;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        if (f[i] === base[i] && f[i + 1] === base[i + 1] && f[i + 2] === base[i + 2]) continue;
        differ++;
        assert.ok(y < SMITH3_LIP + 2, `rise ${rise}: nothing of the table's front moves (${x}, ${y})`);
        const onFace = Math.abs(x + 0.5 - W / 2) < 16 && y >= SMITH3_BROW[1] && y < SMITH3_BROW[1] + 30;
        assert.ok(!onFace, `rise ${rise}: his face does not move (${x}, ${y})`);
      }
    }
    assert.ok(differ > before, `rise ${rise}: more of him has moved than at the rise before (${differ} pixels)`);
    before = differ;
    for (const fx of [W / 2 - 92, W / 2 + 92]) {
      for (let y = arris - 4; y < arris + 24; y++) for (let x = fx - 18; x < fx + 18; x++) assert.deepEqual(at(f, x, y), at(base, x, y), `rise ${rise}: his hand is where it was (${x}, ${y})`);
    }
    for (const [ex, ey] of SMITH3_EYES) assert.deepEqual(at(f, ex, ey), at(base, ex, ey));
  }
  assert.ok(before > 2500, `breathed in, a good deal of him is elsewhere (${before} pixels)`);
});

test('11. the top alight: it lights his face from below, changes nothing under the table\'s edge, and brings no warm light', () => {
  const arris = SMITH3_LIP - 8;
  for (const rise of [0, SMITH3_BREATH]) {
    const f = rise === 0 ? painted : painted.frame(rise);
    const a = f.px.d;
    const b = f.lit.d;
    let plainFace = 0;
    let litFace = 0;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const same = a[i] === b[i] && a[i + 1] === b[i + 1] && a[i + 2] === b[i + 2];
        if (y >= arris) assert.ok(same, `nothing at or under the edge is changed (${x}, ${y})`);
        assert.ok(!warm([b[i], b[i + 1], b[i + 2]]), `no warm light (${x}, ${y})`);
        if (Math.abs(x + 0.5 - W / 2) < 20 && y >= SMITH3_BROW[1] + 4 && y < SMITH3_BROW[1] + 30) {
          plainFace += a[i] + a[i + 1] + a[i + 2];
          litFace += b[i] + b[i + 1] + b[i + 2];
        }
      }
    }
    assert.ok(litFace > plainFace * 1.12, `his face is a good deal brighter (${litFace} against ${plainFace})`);
  }
});

/** How far round letter k has gone between two moments a frame apart, as an angle about him (to tell how fast it goes round). */
const reachOf = (t: number): number => {
  let sum = 0;
  for (let k = 0; k < SMITH3_LETTERS; k++) sum += Math.abs(smith3Letter(k, t).x - CX);
  return sum / SMITH3_LETTERS;
};
const speedOf = (t: number): number => {
  let sum = 0;
  for (let k = 0; k < SMITH3_LETTERS; k++) {
    const a = smith3Letter(k, t);
    const b = smith3Letter(k, t + 1 / 30);
    sum += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return sum / SMITH3_LETTERS;
};
/** Every dot the life draws at time t, as a mask (strong enough to be seen), and the blocks it drew. */
const lifeAt = (t: number): { mask: Uint8Array; blocks: [number, number, string, number, number, number][] } => {
  const mask = new Uint8Array(W * H);
  const blocks: [number, number, string, number, number, number][] = [];
  smith3Life(t, painted.scene, (x, y, c, a, w = 1, h = 1) => {
    blocks.push([x, y, c, a, w, h]);
    if (a < 0.08 || (w === W && h === H)) return;
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (xx >= 0 && yy >= 0 && xx < W && yy < H) mask[yy * W + xx] = 1;
  });
  return { mask, blocks };
};
const near = (x: number, y: number, dx: number, dy: number): number => Math.hypot(x - dx, y - dy);
const [WX, WY] = [CX, SMITH3_LIP - 20];

test('12. the great moment winds up: as he gathers it the letters are drawn in and whipped round, motes are pulled in to the word, his eyes burn up', () => {
  assert.ok(SMITH3_GATHER >= 0.8, `a wind-up you can see (${SMITH3_GATHER} s)`);
  assert.equal(SMITH3_GREAT, 2 * 2 + 1.6, 'the burst is where the two runs meet in the middle, at the top of his breath');
  assert.equal(smith3Breath(SMITH3_GREAT), SMITH3_BREATH);
  // gathering: 0 until it starts, and growing to the burst
  assert.equal(smith3Gather(SMITH3_GREAT - SMITH3_GATHER - 0.1), 0);
  let was = 0;
  for (let t = SMITH3_GREAT - SMITH3_GATHER + 0.05; t < SMITH3_GREAT; t += 1 / 30) {
    const g = smith3Gather(t);
    assert.ok(g >= was, `it gathers on (${t.toFixed(2)})`);
    was = g;
  }
  assert.ok(was > 0.9);
  // the letters drawn in close, and going round faster
  const calm = reachOf(2.2);
  const drawn = reachOf(SMITH3_GREAT - 0.05);
  assert.ok(drawn < calm * 0.8, `drawn in (${drawn.toFixed(0)} against ${calm.toFixed(0)})`);
  assert.ok(speedOf(SMITH3_GREAT - 0.1) > speedOf(2.2) * 2, `whipped round (${speedOf(SMITH3_GREAT - 0.1).toFixed(1)} against ${speedOf(2.2).toFixed(1)} pixels a frame)`);
  // motes pulled in: near the word, more light the nearer the burst; and none of it there before he gathers
  const round = (t: number): number => {
    const { mask } = lifeAt(t);
    let n = 0;
    for (let y = WY - 110; y < SMITH3_LIP - 8; y++) for (let x = WX - 200; x < WX + 200; x++) if (mask[y * W + x] && near(x, y, WX, WY) > 40 && near(x, y, WX, WY) < 200) n++;
    return n;
  };
  assert.ok(round(SMITH3_GREAT - 0.3) > round(SMITH3_GREAT - SMITH3_GATHER - 0.2) + 40, `motes pulled in (${round(SMITH3_GREAT - 0.3)} against ${round(SMITH3_GREAT - SMITH3_GATHER - 0.2)})`);
  // his eyes burn up
  const eyes = (t: number): number => {
    let sum = 0;
    smith3Life(t, painted.scene, (x, y, c, a, w = 1, h = 1) => {
      if (w === W) return;
      for (const [ex, ey] of SMITH3_EYES) if (Math.abs(x - ex) < 12 && Math.abs(y - ey) < 3) sum += a * w * h;
    });
    return sum;
  };
  assert.ok(eyes(SMITH3_GREAT - 0.1) > eyes(2.2) * 1.3, 'his eyes burn up');
});

test('13. ... it bursts: the top pulses its greatest, the screen kicks, a flash, rings of light over the vault, sparks', () => {
  assert.ok(smith3Pulse(SMITH3_GREAT + 0.05) > 0.95, 'the top pulses its greatest');
  // the screen kicks: down first, hard, and only then
  const [kx, ky] = smith3Kick(SMITH3_GREAT);
  assert.ok(ky >= 4 && ky <= 8 && kx === 0, `it slams down (${kx}, ${ky})`);
  for (let t = 0; t < 2 * SMITH3_CYCLE; t += 1 / 30) {
    const dc = (((t - SMITH3_GREAT) % SMITH3_CYCLE) + SMITH3_CYCLE) % SMITH3_CYCLE;
    const [x, y] = smith3Kick(t);
    if (dc > 0.45) assert.deepEqual([x, y], [0, 0], `no kick but at the burst (${t.toFixed(2)})`);
    assert.ok(Math.abs(x) <= 3 && Math.abs(y) <= 8, `a kick, not a jump off the screen (${x}, ${y})`);
  }
  // a flash over the whole picture, in the word's cyan, four frames and only then
  let flashed = 0;
  for (let t = 0; t < 2 * SMITH3_CYCLE; t += 1 / 30) {
    const f = smith3Flash(t);
    assert.ok(f >= 0 && f <= 0.4, `a flash, not a white-out (${f})`);
    if (f > 0) {
      flashed++;
      const dc = (((t - SMITH3_GREAT) % SMITH3_CYCLE) + SMITH3_CYCLE) % SMITH3_CYCLE;
      assert.ok(dc < 0.15, `the screen flashes only as the burst comes (${t.toFixed(2)})`);
    }
  }
  assert.ok(flashed >= 6 && flashed <= 10, `for four frames each round (${flashed} in two rounds)`);
  assert.ok(smith3Flash(SMITH3_GREAT) > smith3Flash(SMITH3_GREAT + 0.1), 'dying away');
  assert.ok(!warm(rgba(SMITH3_FLASH)), 'in the word\'s cold light');
  // rings of light: out over the vault, far from him, a fifth of a second on
  const { mask } = lifeAt(SMITH3_GREAT + 0.2);
  let far = 0;
  for (let y = 0; y < SMITH3_LIP - 8; y++) for (let x = 0; x < W; x++) if (mask[y * W + x] && near(x, (y - WY) * 2 + WY, WX, WY) > 160) far++;
  const { mask: calm } = lifeAt(SMITH3_GREAT - 2.6);
  let farCalm = 0;
  for (let y = 0; y < SMITH3_LIP - 8; y++) for (let x = 0; x < W; x++) if (calm[y * W + x] && near(x, (y - WY) * 2 + WY, WX, WY) > 160) farCalm++;
  assert.ok(far > farCalm + 250, `light bursts out over the vault (${far} against ${farCalm})`);
  // sparks: flecks high over the word, going up, then falling
  const sparksAbove = (t: number): number => {
    const { mask: m } = lifeAt(t);
    let n = 0;
    for (let y = WY - 160; y < WY - 30; y++) for (let x = WX - 60; x < WX + 60; x++) if (m[y * W + x]) n++;
    return n;
  };
  assert.ok(sparksAbove(SMITH3_GREAT + 0.2) > sparksAbove(SMITH3_GREAT - 2.6) + 30, `sparks spray up (${sparksAbove(SMITH3_GREAT + 0.2)} against ${sparksAbove(SMITH3_GREAT - 2.6)})`);
});

test('14. ... and follows through: the blast blows his beard and mantle up and out and they drop back; the letters fly out and come home; grit falls', () => {
  // the blow: none until the burst; then hard, a flutter, easing, and still again before half a second and a bit
  const seq: number[] = [];
  for (let t = SMITH3_GREAT - 0.5; t < SMITH3_GREAT + 1; t += 1 / 30) {
    const b = smith3Blow(t);
    if (t < SMITH3_GREAT - 1e-6) assert.equal(b, 0, `nothing blows before the burst (${t.toFixed(2)})`);
    if (seq[seq.length - 1] !== b) seq.push(b);
  }
  assert.deepEqual(seq, [0, 2, 1, 2, 1, 0], 'blown hard at once, a flutter, and they drop back');
  for (let t = 0; t < SMITH3_CYCLE; t += 1 / 30) if (t < SMITH3_GREAT || t > SMITH3_GREAT + 0.6) assert.equal(smith3Blow(t), 0, `still but for the blast (${t.toFixed(2)})`);
  // blown, the beard and the mantle are elsewhere: his face, his hands and the table are not
  const rise = smith3Breath(SMITH3_GREAT);
  const calm = painted.frame(rise, 0).px.d;
  const arris = SMITH3_LIP - 8;
  let before = 0;
  for (const blow of [1, 2]) {
    const f = painted.frame(rise, blow).px.d;
    let beard = 0;
    let mantle = 0;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        if (f[i] === calm[i] && f[i + 1] === calm[i + 1] && f[i + 2] === calm[i + 2]) continue;
        assert.ok(y < arris + 2, `blow ${blow}: nothing under the table's edge moves (${x}, ${y})`);
        assert.ok(!(Math.abs(x + 0.5 - CX) < 16 && y >= SMITH3_BROW[1] && y < SMITH3_BROW[1] + 30), `blow ${blow}: his face does not move (${x}, ${y})`);
        if (Math.abs(x + 0.5 - CX) < 60 && y > SMITH3_BROW[1] + 40) beard++;
        else if (y > 180 && y < 240) mantle++;
      }
    }
    assert.ok(beard > before + 100 && mantle > 150, `blow ${blow}: his beard and his mantle are blown (${beard}, ${mantle} pixels)`);
    before = beard;
  }
  // the letters: flung out at the burst, and back where they go round within two seconds, a little past and home
  const furthest = (from: number, to: number): number => {
    let most = 0;
    for (let t = from; t < to; t += 1 / 30) for (let k = 0; k < SMITH3_LETTERS; k++) most = Math.max(most, Math.abs(smith3Letter(k, t).x - CX));
    return most;
  };
  assert.ok(furthest(SMITH3_GREAT + 0.15, SMITH3_GREAT + 0.4) > furthest(2, 2.6) * 1.4, `flung far out (${furthest(SMITH3_GREAT + 0.15, SMITH3_GREAT + 0.4).toFixed(0)} against ${furthest(2, 2.6).toFixed(0)})`);
  assert.ok(Math.abs(reachOf(SMITH3_GREAT + 2) - reachOf(2.2)) < reachOf(2.2) * 0.12, 'and home again');
  // grit shaken loose: it falls behind him, a second on
  const grit = (t: number): number => {
    let n = 0;
    smith3Life(t, painted.scene, (x, y, c, a, w = 1, h = 1) => {
      if (c === '#5660ac') n += w * h;
    });
    return n;
  };
  assert.equal(grit(SMITH3_GREAT - 1), 0, 'no grit before');
  assert.ok(grit(SMITH3_GREAT + 0.8) > 10, `grit falls after (${grit(SMITH3_GREAT + 0.8)})`);
  // the screen's kick dies away
  const ks: number[] = [];
  for (let t = SMITH3_GREAT; t < SMITH3_GREAT + 0.45; t += 1 / 30) ks.push(Math.abs(smith3Kick(t)[1]));
  assert.ok(ks[0] > ks[4] && ks[4] >= ks[ks.length - 1] && ks[ks.length - 1] === 0, `it rings out (${ks.join(' ')})`);
});

test('15. nothing jumps: every letter goes on smoothly frame to frame, round after round, and where it goes fast it smears', () => {
  let fastest = 0;
  for (let i = 0; i < 2 * SMITH3_CYCLE * 30 + 30; i++) {
    const t = i / 30;
    const dc = (((t - SMITH3_GREAT) % SMITH3_CYCLE) + SMITH3_CYCLE) % SMITH3_CYCLE;
    for (let k = 0; k < SMITH3_LETTERS; k++) {
      const a = smith3Letter(k, t);
      const b = smith3Letter(k, t + 1 / 30);
      const step = Math.hypot(b.x - a.x, b.y - a.y);
      fastest = Math.max(fastest, step);
      // (quiet, a few pixels a frame; whipped round, faster, but never a leap; flung out at the burst, a whip, smeared all its way)
      const quiet = dc > 1.8 && dc < SMITH3_CYCLE - SMITH3_GATHER;
      assert.ok(step <= (quiet ? 6 : dc < 0.25 ? 60 : 26), `letter ${k} at ${t.toFixed(2)} goes ${step.toFixed(1)} pixels in a frame`);
    }
  }
  assert.ok(fastest > 12, 'and at the burst they go fast');
  // fast, it smears: more of its light between where it was and where it is
  const lit = (t: number): number => lifeAt(t).mask.reduce((n, v) => n + v, 0);
  assert.ok(lit(SMITH3_GREAT + 0.05) > lit(2.2), 'smeared');
});

test('16. no lone pixel and no soft fade in anything that moves', () => {
  let lone = 0;
  let seen = 0;
  for (let i = 0; i < SMITH3_CYCLE * 30; i += 2) {
    const { mask } = lifeAt(i / 30);
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        if (!mask[y * W + x]) continue;
        seen++;
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && mask[(y + dy) * W + x + dx]) n++;
        if (n === 0) lone++;
      }
    }
  }
  assert.ok(seen > 100000);
  assert.equal(lone, 0, `no pixel of light alone (${lone} of ${seen})`);
  // the column of light off his slab: its strength in a few flat steps, not a fade
  const steps = new Set<string>();
  for (let i = 0; i < 60; i++) {
    smith3Life(i / 30, painted.scene, (x, y, c, a, w = 1) => {
      if (x === WX - 2 && w === 5) steps.add(a.toFixed(3));
    });
  }
  assert.ok(steps.size <= 12, `the column of light comes in steps (${steps.size} strengths)`);
});

test('17. alive when still: he glances aside, and the fingers of his right hand drum, only while the power is quiet; nothing of him but his fingers moves for it', () => {
  let looks = 0;
  let was = 0;
  for (let t = 0; t < 2 * SMITH3_CYCLE; t += 1 / 30) {
    const g = smith3Glance(t);
    assert.ok(Math.abs(g - was) <= 1, `his eyes turn a pixel at a time (${t.toFixed(2)})`);
    if (g !== 0) {
      looks++;
      assert.ok(smith3Pulse(t) < 0.3 && smith3Gather(t) === 0 && smith3Blow(t) === 0, `he glances only while it is quiet (${t.toFixed(2)})`);
    }
    was = g;
  }
  assert.ok(looks > 30, 'he glances aside');
  // the drum: each finger up once a round, the little one first, while nothing pulses
  const order: number[] = [];
  for (let t = 0; t < SMITH3_CYCLE; t += 1 / 60) {
    const { up } = smith3Drum(t);
    if (up >= 0) {
      assert.ok(smith3Pulse(t) < 0.02 && smith3Gather(t) === 0, `the fingers drum while it is quiet (${t.toFixed(2)})`);
      if (order[order.length - 1] !== up) order.push(up);
    }
  }
  assert.deepEqual(order, [3, 2, 1, 0], 'the little finger first, to the index');
  assert.equal(SMITH3_DRUM.length, 4);
  // a finger up: only that finger moves, below the edge, on his right hand
  const arris = SMITH3_LIP - 8;
  painted.drum.forEach((p, f) => {
    let moved = 0;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        if (p.d[i] === d[i] && p.d[i + 1] === d[i + 1] && p.d[i + 2] === d[i + 2]) continue;
        moved++;
        assert.ok(y >= arris && x > CX + 50 && x < CX + 140, `finger ${f}: only below the edge, on his right hand (${x}, ${y})`);
      }
    }
    assert.ok(moved > 15 && moved < 400, `finger ${f} is up (${moved} pixels)`);
  });
});

test('18. his arms are thick and his hands are drawn whole: a wrist, four fingers over the edge with a nail at each end, a thumb', () => {
  const arris = SMITH3_LIP - 8;
  /** His skin (the lavender of it, light or dark), or a rune burning in it. */
  const skin = (c: readonly number[]): boolean => burning(c) || (c[0] > 50 && c[0] >= c[2] * 0.5 && c[1] < c[2] && c[2] > c[0]);
  for (const s of [-1, 1]) {
    // the forearm, half way down: as wide as a third of his face is high, and more
    const y = arris - 30;
    let w = 0;
    for (let x = CX + s * 60; Math.abs(x - CX) < 150; x += s) if (skin(at(d, x, y))) w++;
    assert.ok(w >= 30, `side ${s}: a thick forearm (${w} pixels across)`);
    // the fingers: four runs of skin across the row a little under the edge, each 8 pixels wide or more
    const row = arris + 8;
    const runs: number[] = [];
    let run = 0;
    for (let x = CX + s * 50; Math.abs(x - CX) < 150; x += s) {
      if (skin(at(d, x, row))) run++;
      else if (run) {
        runs.push(run);
        run = 0;
      }
    }
    if (run) runs.push(run);
    const fingers = runs.filter((r) => r >= 7);
    assert.equal(fingers.length, 4, `side ${s}: four fingers over the edge (${runs.join(', ')})`);
  }
});
