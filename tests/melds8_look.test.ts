// THE EIGHT MELDS ACROSS THE GROUPS: HOW THEY LOOK (render/melds8.ts, behind MELDS8_LOOK, off). Checks:
//   1. off, nothing is taken, ticked or drawn: the game is as it was;
//   2. their colours: six tones each, darkest to white-hot; each one's own colour at least 12 from every colour a word already
//      shows, the friend's cyan and the enemy's pink and gold, and from each other, as the eye sees colour (CIEDE2000); nothing
//      cyan or pink;
//   3. their runes: 7 by 7, each its own, none any other word's;
//   4. on, each look draws at its moment, on whole pixels, and is gone when it is over.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { GLYPH } from '../src/art/icons';
import type { Game } from '../src/game/game';
import type { Monster } from '../src/game/state';
import type { Cam } from '../src/render/fx';
import { BIND_GLYPH } from '../src/render/binding3';
import { M8Fx, M8_GLYPH, M8_IDS, M8_RAMP, MELDS8_LOOK } from '../src/render/melds8';
import type { M8Id } from '../src/render/melds8';
import { MELD_GLYPH } from '../src/render/melds3';
import { VMELD_GLYPH } from '../src/render/volatile3';
import { NEW_GLYPH } from '../src/render/words3';
import { W7_GLYPH } from '../src/render/words7';
import { W10_GLYPH } from '../src/render/words10';
import { de2000, lab, taken } from '../tools/melds8_palette';

const cam: Cam = { ox: 300, oy: -150, lift: null } as unknown as Cam;
function canvas(): { g: CanvasRenderingContext2D; drawn: () => number; crisp: () => boolean } {
  let n = 0;
  let whole = true;
  const g = {
    fillStyle: '',
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    fillRect(x: number, y: number, w: number, h: number) {
      n++;
      if (![x, y, w, h].every(Number.isInteger)) whole = false;
    },
    drawImage: () => {},
  };
  return { g: g as unknown as CanvasRenderingContext2D, drawn: () => n, crisp: () => whole };
}
/** A page's canvas for the glows (engine/px.ts glowOf makes one), here only enough to be drawn with. */
function withPage<T>(fn: () => T): T {
  const G = globalThis as unknown as { document?: unknown };
  const had = G.document;
  const pen = { fillStyle: '', fillRect: () => {}, createRadialGradient: () => ({ addColorStop: () => {} }) };
  G.document = { createElement: (): unknown => ({ width: 0, height: 0, getContext: (): unknown => pen }) };
  try {
    return fn();
  } finally {
    if (had === undefined) delete G.document;
    else G.document = had;
  }
}
const mon = (id: number, x: number, y: number): Monster => ({ id, kind: 'skeleton', champion: false, x, y, dead: false, life: 10, maxLife: 10 }) as unknown as Monster;
const game = (): Game => ({ hero: { x: 10, y: 10 }, monsters: [mon(1, 11.2, 10.1), mon(2, 12.5, 11)] }) as unknown as Game;
const moment = (id: M8Id) => ({ t: 'meld8' as const, id, on: 1, x: 11.2, y: 10.1, x1: 12.5, y1: 11, n: 2, most: 5, secs: 1.2, reach: 3, r: 2.2, wait: 0.4 });

test('1. off: nothing is taken, ticked or drawn (on in the game since 25.3.17, with the eight melds\' rules: off here for this test)', () => {
  assert.equal(MELDS8_LOOK.on, true, 'on in the game');
  MELDS8_LOOK.on = false;
  try {
  const fx = new M8Fx();
  fx.game = game();
  for (const id of M8_IDS) fx.handle(moment(id));
  fx.update(0.1);
  const c = canvas();
  fx.drawGround(c.g, cam);
  fx.drawAir(c.g, cam);
  assert.equal(c.drawn(), 0);
  } finally {
    MELDS8_LOOK.on = true;
  }
});

test("2. their colours: six tones; told apart from every word's, the friend's and the enemy's, and from each other; nothing cyan or pink", () => {
  const T = taken();
  const hsv = (hex: string): [number, number, number] => {
    const n = parseInt(hex.slice(1), 16);
    const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    const mx = Math.max(r, g, b);
    const d = mx - Math.min(r, g, b);
    let h = 0;
    if (d > 0) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [(h * 60 + 360) % 360, mx ? d / mx : 0, mx / 255];
  };
  for (const id of M8_IDS) {
    const R = M8_RAMP[id];
    assert.equal(R.length, 6, id);
    for (let i = 1; i < 6; i++) assert.ok(lab(R[i])[0] > lab(R[i - 1])[0], `${id}: tone ${i} lighter than tone ${i - 1}`);
    for (const c of R) {
      const [h, s, v] = hsv(c);
      assert.ok(!(s > 0.3 && v > 0.45 && ((h > 170 && h < 200) || (h > 315 && h < 350))), `${id}'s ${c} is cyan or pink`);
    }
    for (const [w, c] of Object.entries(T)) assert.ok(de2000(R[3], c) >= 12, `${id} is ${de2000(R[3], c).toFixed(1)} from ${w}`);
    for (const o of M8_IDS) if (o !== id) assert.ok(de2000(R[3], M8_RAMP[o][3]) >= 12, `${id} and ${o}`);
  }
});

test('3. their runes: 7 by 7, each its own', () => {
  const others = [...Object.values(GLYPH), ...Object.values(MELD_GLYPH), ...Object.values(NEW_GLYPH), ...Object.values(VMELD_GLYPH), ...Object.values(W7_GLYPH), ...Object.values(W10_GLYPH), BIND_GLYPH].map((g) => (g as readonly string[]).join('/'));
  const mine = new Set<string>();
  for (const id of M8_IDS) {
    const g = M8_GLYPH[id];
    assert.equal(g.length, 7, id);
    for (const row of g) assert.ok(/^[.Xo]{7}$/.test(row), `${id}: ${row}`);
    const key = g.join('/');
    assert.ok(!others.includes(key), `${id}'s rune is another word's`);
    assert.ok(!mine.has(key), `${id}'s rune is another of the eight's`);
    mine.add(key);
  }
});

test('4. on: each look draws at its moment, on whole pixels, and is gone when it is over', () => {
  const was = MELDS8_LOOK.on;
  MELDS8_LOOK.on = true;
  try {
    withPage(() => {
      for (const id of M8_IDS) {
        const fx = new M8Fx();
        fx.game = game();
        fx.handle(moment(id));
        let drawn = 0;
        let crisp = true;
        for (let f = 0; f < 150; f++) {
          fx.update(1 / 30);
          const c = canvas();
          fx.drawGround(c.g, cam);
          fx.drawAir(c.g, cam);
          drawn += c.drawn();
          crisp &&= c.crisp();
        }
        assert.ok(drawn > 100, `${id} drew ${drawn}`);
        assert.ok(crisp, `${id} drew off the pixel grid`);
        const c = canvas();
        fx.drawGround(c.g, cam);
        fx.drawAir(c.g, cam);
        assert.equal(c.drawn(), 0, `${id} still drawing after 5 s`);
      }
    });
  } finally {
    MELDS8_LOOK.on = was;
  }
});
