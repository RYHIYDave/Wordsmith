// THE FIRST TOWN REDONE TO GO WITH FLOOR 1'S NEW LOOK: THE THREE LOOKS (src/dev/town_look_paint.ts, src/dev/town_look_life.ts,
// src/dev/preview_town_look.ts; pictures in docs/mockups/town_look/pictures). Pictures first: nothing of the game imports
// them; nothing pink anywhere (the knight's own deep red is his); the town's own teal-to-cyan only where it is now (the
// Lexicon, the stash, the wordsmith's ring, the waypoint, the bazaar's and the smithy's own) and the knight's; the pictures
// the sizes asked for; the knight reads on a phone; the town brighter than floor 1 below it.
//   run: tsx --test tests/town_look.test.ts

// @ts-ignore
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
// @ts-ignore
import { join } from 'node:path';
// @ts-ignore
import { inflateSync } from 'node:zlib';
import { assert, test } from './floor_checks';
import { FILE, HERO_AT, LETTER, LOOKS, PHONE, PICTURE, TOWN_AT, atPx } from '../src/dev/town_look_paint';
import type { Look } from '../src/dev/town_look_paint';

const DIR = join('docs', 'mockups', 'town_look', 'pictures');
/** How far the knight's lightest and darkest stand out of the floor round him on a phone; how bright the lit places must be. */
const MIN_HI = 60;
const MIN_LO = 30;
const MIN_BRIGHT = 90;

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
      assert.ok(body[8] === 8, 'eight bits a channel');
      type = body[9];
      assert.ok(body[12] === 0, 'not interlaced');
    } else if (name === 'IDAT') idat.push(body);
    else if (name === 'IEND') break;
    o += 12 + len;
  }
  const n = type === 6 ? 4 : type === 2 ? 3 : 0;
  assert.ok(n > 0, `colour type ${type}`);
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
function hsv(r: number, g: number, b: number): [number, number, number] {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const d = mx - mn;
  let h = 0;
  if (d > 0) {
    if (mx === r) h = 60 * (((g - b) / d) % 6);
    else if (mx === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return [h, mx === 0 ? 0 : d / mx, mx / 255];
}
const isCyan = (r: number, g: number, b: number): boolean => {
  const [h, s, v] = hsv(r, g, b);
  return h >= 168 && h <= 200 && s > 0.45 && v > 0.5;
};
const isPink = (r: number, g: number, b: number): boolean => {
  const [h, s, v] = hsv(r, g, b);
  return h >= 300 && h <= 352 && s > 0.45 && v > 0.55;
};

/** Each picture of a look: its file, its size, where the knight stands on it, how the world is moved onto it. */
interface Pic { file: string; w: number; h: number; hero: [number, number]; look: Look; dx: number; dy: number }
function pics(): Pic[] {
  const out: Pic[] = [];
  for (const look of LOOKS) {
    out.push({ file: `${FILE[look]}.png`, w: PICTURE.W, h: PICTURE.H, hero: atPx(HERO_AT[0], HERO_AT[1]), look, dx: 0, dy: 0 });
    const [hx, hy] = atPx(HERO_AT[0], HERO_AT[1]);
    const dx = Math.round(PHONE.W / 2 - hx);
    const dy = Math.round(PHONE.H / 2 - (hy - PHONE.lift));
    out.push({ file: `${LETTER[look]}_phone.png`, w: PHONE.W, h: PHONE.H, hero: [hx + dx, hy + dy], look, dx, dy });
  }
  return out;
}
/** Where the town's own teal-to-cyan is now (its things as the game paints them), in the world: [x, y, half width, up, down] in picture pixels. */
const at = (k: readonly number[]): [number, number] => [k[0] + 0.5, k[1] + 0.5];
const TEAL_PLACES: [number, number, number, number, number][] = [
  [...at(TOWN_AT.lexicon), 44, 96, 24],
  [...at(TOWN_AT.stash), 44, 56, 24],
  [...at(TOWN_AT.wordsmith), 150, 170, 90],
  [TOWN_AT.way[0], TOWN_AT.way[1], 80, 50, 40],
  [...at(TOWN_AT.mystic), 150, 180, 110],
  [...at(TOWN_AT.armourer), 130, 130, 50],
];

test('town looks: pictures first, nothing of the game imports the dev pages', () => {
  const found: string[] = [];
  const walk = (d: string): void => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) {
        if (p !== join('src', 'dev')) walk(p);
      } else if (p.endsWith('.ts') && /town_look_paint|town_look_life|preview_town_look/.test(readFileSync(p, 'utf8'))) found.push(p);
    }
  };
  walk('src');
  assert.ok(found.length === 0, `the dev pages imported by ${found.join(', ')}`);
});

test('town looks: every picture there, the sizes asked for', () => {
  for (const p of pics()) {
    const path = join(DIR, p.file);
    assert.ok(existsSync(path), `${p.file} is missing`);
    const q = readPng(path);
    assert.ok(q.w === p.w && q.h === p.h, `${p.file}: ${q.w} x ${q.h}, not ${p.w} x ${p.h}`);
  }
  const o = readPng(join(DIR, 'the_owl.png'));
  assert.ok(o.w === 1000 && o.h === 300, `the owl: ${o.w} x ${o.h}`);
  const s = readPng(join(DIR, 'town_look_sheet.png'));
  assert.ok(s.w === 1200 && s.h <= 7500 && s.h > 4000, `the sheet: ${s.w} x ${s.h}`);
});

test("town looks, Colour 3: nothing pink; the town's own teal-to-cyan only where it is now, and the knight's", () => {
  for (const p of pics()) {
    const q = readPng(join(DIR, p.file));
    const places = TEAL_PLACES.map(([x, y, rx, up, down]) => {
      const [sx, sy] = atPx(x, y);
      return { x: sx + p.dx, y: sy + p.dy, rx, up, down };
    });
    let cyan = 0;
    let strayCyan = 0;
    let strayPink = 0;
    const where: string[] = [];
    for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) {
      const [r, g, b] = q.px(x, y);
      const onKnight = Math.abs(x - p.hero[0]) < 40 && y > p.hero[1] - 80 && y < p.hero[1] + 10;
      if (isCyan(r, g, b)) {
        cyan++;
        const theirs = places.some((g) => Math.abs(x - g.x) <= g.rx && y >= g.y - g.up && y <= g.y + g.down);
        if (!theirs && !onKnight) {
          strayCyan++;
          if (where.length < 6) where.push(`cyan at ${x},${y}`);
        }
      }
      if (isPink(r, g, b) && !onKnight) {
        strayPink++;
        if (where.length < 10) where.push(`pink at ${x},${y}`);
      }
    }
    assert.ok(cyan > 20, `${p.file}: the town's own teal-to-cyan not found`);
    assert.ok(strayCyan === 0 && strayPink === 0, `${p.file}: ${strayCyan} cyan and ${strayPink} pink astray: ${where.join('; ')}`);
  }
  // (the owl and the sheet: no pink at all but the knights')
  const o = readPng(join(DIR, 'the_owl.png'));
  for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) {
    const [r, g, b] = o.px(x, y);
    assert.ok(!isPink(r, g, b) && !isCyan(r, g, b), `the owl: pink or cyan at ${x},${y}`);
  }
});

test('town looks: the knight reads on a phone (standing out of the floor round him, lighter and darker both)', () => {
  for (const look of LOOKS) {
    const q = readPng(join(DIR, `${LETTER[look]}_phone.png`));
    const luma = (x: number, y: number): number => {
      const [r, g, b] = q.px(x, y);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const fx = Math.round(PHONE.W / 2);
    const fy = Math.round(PHONE.H / 2 + PHONE.lift);
    let floor = 0;
    let n = 0;
    for (let y = fy - 10; y < fy + 30; y++) for (const x of [fx - 70, fx - 50, fx + 50, fx + 70]) {
      floor += luma(x, y);
      n++;
    }
    floor /= n;
    let hi = 0;
    let lo = 255;
    for (let y = fy - 50; y < fy - 4; y++) for (let x = fx - 12; x < fx + 12; x++) {
      hi = Math.max(hi, luma(x, y));
      lo = Math.min(lo, luma(x, y));
    }
    assert.ok(hi > floor + MIN_HI && lo < floor - MIN_LO, `${look}: the knight (${lo.toFixed(1)} to ${hi.toFixed(1)}) does not stand out of the floor (${floor.toFixed(1)})`);
  }
});

test("town looks: brighter than floor 1 below it (its lit places well over floor 1 B's 69 of 255)", () => {
  for (const look of LOOKS) {
    const q = readPng(join(DIR, `${FILE[look]}.png`));
    let t = 0;
    let n = 0;
    for (let y = 0; y < q.h; y += 2) for (let x = 0; x < q.w; x += 2) {
      const [r, g, b] = q.px(x, y);
      const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      if (l > 20) {
        t += l;
        n++;
      }
    }
    assert.ok(t / n > MIN_BRIGHT, `${look}: its lit places come to ${(t / n).toFixed(1)}`);
  }
});
