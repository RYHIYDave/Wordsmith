// WHAT THE UNIQUE ITEMS SHOW IN PLAY (src/art/unique_play_art.ts, src/render/unique_play.ts), each behind a switch that is off.
// The art chat, 11 Nov 2026 (queue item draw-unique-items): the first three, which the build had no picture for at all.
//   1. the switches are all off;
//   2. THE FOURTH GLOBE: a row of three is painted as it was, a row of four is one globe wider, its first three as a row of
//      three's, and locked its bar joins all four;
//   3. THE RESTLESS TOME: the book every way round and at every frame of its beat: crisp, whole (not cut off by its picture's
//      edge), its red boards, its leaves and its gold ribbon there, no two ways round alike; nothing on it pink or cyan;
//   4. its fire: only the demon's red and orange, crisp, no pixel left alone; its burst on the one it touches dies away;
//   5. THE RISEN LOOK: the enemy's pinks come out the friend's cyan, as bright; the gold of its fire's tip comes out the cyan's
//      white; everything else comes out drained and cold, never pink, never gold, never brighter;
//   6. the brand under it: only the friend's cyan, its ring burning away as its time runs out, turning; the cracks where it
//      rose run out and go dark.
//
//   run: tsx --test tests/unique_play.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { Px } from '../src/engine/px';
import { ENEMY_RIM, FLAME, MENACE } from '../src/art/mkit';
import { BRAND, RISEN_BLOW_FRAMES, RISEN_CYAN, RISE_CRACKS, TOME, TOME_FIRE, TOME_FLAME, TOME_GOLD, TOME_LEAF, TOME_RED, TOME_TOUCH_FRAMES, paintBrand, paintRiseCracks, paintRisenBlow, paintTome, paintTomeFlame, paintTomeTouch, risenLook, risenPixel } from '../src/art/unique_play_art';
import { GLOBES_H, GLOBES_W, GLOBE, globesW, paintGlobes } from '../src/dev/veteran_globes';
import type { Globe } from '../src/dev/veteran_globes';
import { UNIQUE_PLAY } from '../src/render/unique_play';

const rgb = (c: string): [number, number, number] => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
function hsv(r: number, g: number, b: number): [number, number, number] {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const d = mx - mn;
  let h = 0;
  if (d > 0) h = 60 * (mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4);
  return [h, mx === 0 ? 0 : d / mx, mx / 255];
}
const isPink = (r: number, g: number, b: number): boolean => {
  const [h, s, v] = hsv(r, g, b);
  // (the enemy's own band: its deep magenta to its hot pink, art/mkit.ts FLAME, ENEMY_RIM; the book's blood red is not in it)
  return h >= 290 && h <= 349 && s > 0.4 && v > 0.4;
};
const isGold = (r: number, g: number, b: number): boolean => {
  const [h, s, v] = hsv(r, g, b);
  return h >= 38 && h <= 64 && s > 0.45 && v > 0.55;
};
const isCyan = (r: number, g: number, b: number): boolean => {
  const [h, s, v] = hsv(r, g, b);
  return h >= 172 && h <= 198 && s > 0.3 && v > 0.3;
};
/** Every pixel of a picture that is there: its colour. All of them wholly there or wholly not. */
function pixels(px: Px, what: string): [number, number, number, number, number][] {
  const out: [number, number, number, number, number][] = [];
  for (let y = 0; y < px.h; y++) {
    for (let x = 0; x < px.w; x++) {
      const i = (y * px.w + x) * 4;
      const a = px.d[i + 3];
      assert.ok(a === 0 || a === 255, `${what}: a pixel neither there nor not`);
      if (a) out.push([px.d[i], px.d[i + 1], px.d[i + 2], x, y]);
    }
  }
  return out;
}
const has = (ps: [number, number, number, number, number][], c: string): boolean => {
  const v = rgb(c);
  return ps.some((p) => p[0] === v[0] && p[1] === v[1] && p[2] === v[2]);
};
const only = (ps: [number, number, number, number, number][], cols: readonly string[], what: string): void => {
  const ok = new Set(cols.map((c) => rgb(c).join(',')));
  for (const p of ps) assert.ok(ok.has(`${p[0]},${p[1]},${p[2]}`), `${what}: a colour that is not its own at ${p[3]},${p[4]}: ${p.slice(0, 3)}`);
};

test('the switches: each unique’s picture in play is off until his yes', () => {
  assert.deepEqual(UNIQUE_PLAY, { tome: false, risen: false, fourth: false, arm: false, talons: false, wrench: false, wind: false, moth: false, hush: false, drop: false });
});

test('The Fourth Globe: three painted as they were; four one globe wider, the first three the same, the bar joining all four', () => {
  const g = (kind: 'punch' | 'kick' | 'jump', level = 1): Globe => ({ kind, level });
  const three = paintGlobes({ globes: [g('punch'), g('kick', 0.6), { kind: 'empty' }] });
  assert.equal(three.w, GLOBES_W);
  assert.equal(three.h, GLOBES_H);
  assert.equal(globesW(3), GLOBES_W);
  const four = paintGlobes({ globes: [g('punch'), g('kick', 0.6), { kind: 'empty' }, g('jump')] });
  assert.equal(four.w, GLOBES_W + GLOBE.r * 2 + 1 + GLOBE.gap, 'one globe and one gap wider');
  assert.equal(four.h, GLOBES_H);
  // (the first three of four, pixel for pixel, as a row of three: up to where the fourth begins)
  const upTo = GLOBES_W - GLOBE.pad;
  for (let y = 0; y < three.h; y++) for (let x = 0; x < upTo; x++) for (let k = 0; k < 4; k++) assert.equal(four.d[(y * four.w + x) * 4 + k], three.d[(y * three.w + x) * 4 + k], `at ${x},${y}`);
  // (the fourth is there: the jump's white in its place)
  const cx4 = GLOBE.pad + GLOBE.r + 3 * (2 * GLOBE.r + 1 + GLOBE.gap);
  const cy = GLOBE.pad + GLOBE.fire + GLOBE.r;
  const at = (px: Px, x: number, y: number): number[] => [...px.d.slice((y * px.w + x) * 4, (y * px.w + x) * 4 + 4)];
  assert.ok(at(four, cx4, cy + 2)[3] === 255 && at(four, cx4, cy + 2)[0] > 180, 'the fourth globe filled white');
  // (locked: the bar under them runs from the first to the fourth)
  const locked = paintGlobes({ globes: [g('punch'), g('punch'), g('kick'), g('punch')], locked: true });
  const barY = cy + GLOBE.r;
  const between = cx4 - GLOBE.r - 2;
  assert.equal(at(locked, between, barY)[3], 255, 'the bar reaches the fourth');
  const open = paintGlobes({ globes: [g('punch'), g('punch'), g('kick'), g('punch')] });
  assert.equal(at(open, between, barY)[3], 0, 'no bar until it locks');
  pixels(locked, 'four locked');
});

test('The Restless Tome: the book every way round, at every frame of its beat: crisp, whole, red boards, leaves, a gold ribbon; never pink or cyan', () => {
  const seen = new Set<string>();
  let ribbons = 0;
  for (let h = 0; h < TOME.headings; h++) {
    for (let f = 0; f < TOME.flaps; f++) {
      const px = paintTome(h, f);
      const what = `the book ${h}/${f}`;
      assert.equal(px.w, TOME.w);
      assert.equal(px.h, TOME.h);
      const ps = pixels(px, what);
      assert.ok(ps.length > 150, `${what}: only ${ps.length} pixels`);
      for (const [r, g, b, x, y] of ps) {
        assert.ok(x >= 1 && y >= 1 && x < px.w - 1 && y < px.h - 1, `${what}: cut off at ${x},${y}`);
        assert.ok(!isPink(r, g, b), `${what}: pink at ${x},${y}`);
        assert.ok(!isCyan(r, g, b), `${what}: cyan at ${x},${y}`);
      }
      assert.ok(TOME_RED.some((c) => has(ps, c)), `${what}: none of its red leather`);
      assert.ok(TOME_LEAF.slice(2).some((c) => has(ps, c)), `${what}: none of its leaves`);
      if (TOME_GOLD.some((c) => has(ps, c))) ribbons++;
      if (f === 0) seen.add(px.d.join(','));
    }
  }
  assert.equal(seen.size, TOME.headings, 'no two ways round alike');
  // (its ribbon flies behind it: seen but where the book itself, flying at the eye, hides it)
  assert.ok(ribbons >= TOME.headings * TOME.flaps * 0.85, `its ribbon seen in only ${ribbons} of its pictures`);
  // (it beats: its frames are not one picture)
  assert.notDeepEqual(paintTome(3, 0).d, paintTome(3, 4).d);
});

test('its fire: only the demon’s red and orange, crisp, none left alone; its burst on the one it touches dies away', () => {
  for (const size of TOME_FLAME.sizes) {
    for (let f = 0; f < TOME_FLAME.frames; f++) {
      for (const lean of [-1, 0, 1]) {
        const { px, ax, ay } = paintTomeFlame(size, f, lean);
        const what = `a tongue ${size}/${f}/${lean}`;
        const ps = pixels(px, what);
        assert.ok(ps.length >= 4, `${what}: nothing of it`);
        only(ps, TOME_FIRE, what);
        assert.ok(ax > 0 && ay > 0 && ax < px.w && ay < px.h, `${what}: its heart off its picture`);
        const there = new Set(ps.map((p) => p[4] * 4096 + p[3]));
        for (const p of ps) assert.ok(there.has(p[4] * 4096 + p[3] - 1) || there.has(p[4] * 4096 + p[3] + 1) || there.has((p[4] - 1) * 4096 + p[3]) || there.has((p[4] + 1) * 4096 + p[3]), `${what}: a pixel alone at ${p[3]},${p[4]}`);
      }
    }
  }
  for (const c of TOME_FIRE) {
    const [r, g, b] = rgb(c);
    assert.ok(!isPink(r, g, b) && !isCyan(r, g, b), `${c}: not the demon's fire`);
  }
  // (a bigger tongue is a bigger picture; the burst is biggest early and all but gone at its end)
  assert.ok(pixels(paintTomeFlame(4.8, 0, 0).px, 'big').length > pixels(paintTomeFlame(1.2, 0, 0).px, 'small').length * 3);
  const n = [...Array(TOME_TOUCH_FRAMES).keys()].map((a) => {
    const ps = pixels(paintTomeTouch(a, 1).px, `the touch ${a}`);
    only(ps, TOME_FIRE, `the touch ${a}`);
    return ps.length;
  });
  assert.ok(Math.max(...n.slice(0, 3)) > 250, 'a great tongue of it as it touches');
  assert.ok(n[TOME_TOUCH_FRAMES - 1] < Math.max(...n) * 0.25, 'dying away');
});

test('the risen look: the enemy’s pink the friend’s cyan, as bright; its fire’s gold the cyan’s white; the rest drained and cold', () => {
  const lum = (c: [number, number, number]): number => 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
  for (const c of [ENEMY_RIM, MENACE.color, ...FLAME.slice(0, 3)]) {
    const out = risenPixel(...rgb(c));
    const [h, s] = hsv(...out);
    assert.ok(h >= 176 && h <= 196 && s > 0.5, `${c} comes out ${out}: not the friend's cyan`);
    assert.ok(!isPink(...out));
  }
  // (as bright: the hot pink of its edge comes out about the cyan of a hero's edge, not a dark one)
  assert.ok(lum(risenPixel(...rgb(ENEMY_RIM))) > 120);
  // (its deep magenta stays deep)
  assert.ok(lum(risenPixel(...rgb(FLAME[0]))) < 90);
  // (the gold at its fire's tip: the cyan's light, near white, never gold)
  for (const c of FLAME.slice(3)) {
    const out = risenPixel(...rgb(c));
    assert.ok(!isGold(...out) && !isPink(...out), `${c} comes out ${out}`);
    assert.ok(out[2] >= out[0] && lum(out) > 180, `${c} comes out ${out}: not the cyan's white`);
  }
  // (everything else: drained and cold: a great many colours, none comes out pink or gold, none brighter, each less coloured)
  for (let r = 0; r <= 255; r += 15) {
    for (let g = 0; g <= 255; g += 15) {
      for (let b = 0; b <= 255; b += 15) {
        const out = risenPixel(r, g, b);
        assert.ok(!isPink(...out), `${[r, g, b]} comes out pink: ${out}`);
        assert.ok(!isGold(...out), `${[r, g, b]} comes out gold: ${out}`);
        // (a pink, however pale, has come out the cyan as pale: told by its hue)
        if (hsv(...out)[0] >= 170 && hsv(...out)[0] <= 200 && out[0] < out[2]) continue;
        assert.ok(lum(out) <= lum([r, g, b]) + 1, `${[r, g, b]} comes out brighter: ${out}`);
        assert.ok(Math.max(...out) - Math.min(...out) <= (Math.max(r, g, b) - Math.min(r, g, b)) * 0.45 + 80, `${[r, g, b]} keeps its colour: ${out}`);
      }
    }
  }
  // (a robe's violet, bone, blood: drained; a grey stays a grey, colder)
  const grey = risenPixel(120, 120, 120);
  assert.ok(grey[2] > grey[0] && Math.abs(grey[1] - 100) < 12);
  // (a whole picture: what is clear stays clear, what is there stays there)
  const d = new Uint8ClampedArray([255, 79, 138, 110, 0, 0, 0, 0, 200, 180, 150, 255]);
  risenLook(d);
  assert.equal(d[3], 110);
  assert.deepEqual([...d.slice(4, 8)], [0, 0, 0, 0]);
  assert.equal(d[11], 255);
  assert.ok(isCyan(d[0], d[1], d[2]));
});

test('the brand under it: the friend’s cyan only, its ring burning away with its time, turning; the cracks run out and go dark', () => {
  const lit = (left: number): number => {
    const ps = pixels(paintBrand(26, 0, left).px, `the brand ${left}`);
    only(ps, RISEN_CYAN, `the brand ${left}`);
    return ps.length;
  };
  const all = lit(BRAND.steps);
  assert.ok(all > 200, 'a ring and a stroke');
  assert.ok(lit(BRAND.steps / 2) < all, 'half burnt away');
  assert.ok(lit(0) < lit(BRAND.steps / 2), 'all but gone');
  assert.ok(lit(0) > 60, 'its stroke still there at the end');
  assert.notDeepEqual(paintBrand(26, 0, BRAND.steps).px.d, paintBrand(26, 12, BRAND.steps).px.d, 'it turns');
  // (twice as wide as it is deep: it lies on the floor)
  const b = paintBrand(26, 0, BRAND.steps);
  assert.ok(b.px.w > b.px.h * 1.7);
  only(pixels(paintBrand(26, 5, BRAND.steps, true).px, 'stamped down'), ['#ffffff'], 'the brand stamped down');
  for (const c of RISEN_CYAN.slice(0, 2)) assert.ok(isCyan(...rgb(c)), `${c}: not the friend's cyan`);
  assert.deepEqual([...RISEN_CYAN], ['#0c6a80', '#22d0e0', '#b8fff8', '#ffffff'], 'the Warlock’s own cyan, dark to white');
  // the cracks
  const first = pixels(paintRiseCracks(0, 0, 1).px, 'cracks begun').length;
  const run = pixels(paintRiseCracks(RISE_CRACKS.grow - 1, 0, 1).px, 'cracks run out');
  assert.ok(run.length > first * 1.5, 'they run out from under it');
  assert.ok(run.some((p) => isCyan(p[0], p[1], p[2]) || (p[0] > 240 && p[2] > 240)), 'light in them');
  const cold = pixels(paintRiseCracks(RISE_CRACKS.grow - 1, RISE_CRACKS.cool - 1, 1).px, 'cracks gone dark');
  assert.ok(cold.length > 20 && !cold.some((p) => isCyan(p[0], p[1], p[2])), 'dark at the end');
  // its blow: a star of the friend's light, flung out and gone
  const blow = [...Array(RISEN_BLOW_FRAMES).keys()].map((a) => {
    const ps = pixels(paintRisenBlow(a, 2).px, `its blow ${a}`);
    only(ps, RISEN_CYAN.slice(1), `its blow ${a}`);
    for (const p of ps) assert.ok(p[3] >= 1 && p[4] >= 1 && p[3] < 83 && p[4] < 71, `its blow ${a}: cut off`);
    return ps.length;
  });
  assert.ok(blow[0] > 200 && blow[RISEN_BLOW_FRAMES - 1] < blow[0] * 0.3, 'big as it lands, all but gone at its end');
});
