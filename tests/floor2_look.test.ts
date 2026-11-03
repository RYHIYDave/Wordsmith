// FLOOR 2'S HALLS, THE CONDEMNED'S ROAD: THE THREE LOOKS (src/dev/floor2_look_paint.ts, src/dev/preview_floor2_look.ts; pictures
// in docs/mockups/floor2_look/pictures). Pictures first: nothing of the game imports them; nothing in the pictures glows cyan but
// the knight's own, nothing pink but the enemy's own (the Headsman's mark on his gate; the knight's own deep red is his); the
// pictures the sizes asked for; the floor and the knight read plainly on a phone, on the long walk; a step darker than floor 1's
// tomb; each look its own.
//   run: tsx --test tests/floor2_look.test.ts

// @ts-ignore
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
// @ts-ignore
import { join } from 'node:path';
// @ts-ignore
import { inflateSync } from 'node:zlib';
import { assert, test } from './floor_checks';
import { FILE, HERO_PHONE, HERO_RUN, LETTER, LOOKS, PHONE, PICTURE, atPx, pinkPlaces } from '../src/dev/floor2_look_paint';
import type { Look } from '../src/dev/floor2_look_paint';

const DIR = join('docs', 'mockups', 'floor2_look', 'pictures');

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
    out.push({ file: `${FILE[look]}.png`, w: PICTURE.W, h: PICTURE.H, hero: atPx(HERO_RUN[0], HERO_RUN[1]), look, dx: 0, dy: 0 });
    // (one phone screen: the world moved so that the knight is in its middle, a little up the screen of his feet)
    const [hx, hy] = atPx(HERO_PHONE[look][0], HERO_PHONE[look][1]);
    const dx = Math.round(PHONE.W / 2 - hx);
    const dy = Math.round(PHONE.H / 2 - (hy - PHONE.lift));
    out.push({ file: `${LETTER[look]}_phone.png`, w: PHONE.W, h: PHONE.H, hero: [hx + dx, hy + dy], look, dx, dy });
  }
  return out;
}
const lumaAt = (q: ReturnType<typeof readPng>, x: number, y: number): number => {
  const [r, g, b] = q.px(x, y);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

test('floor 2 looks: pictures first, nothing of the game imports the dev pages', () => {
  const found: string[] = [];
  const walk = (d: string): void => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) {
        if (p !== join('src', 'dev')) walk(p);
      } else if (p.endsWith('.ts') && /floor2_look_paint|preview_floor2_look/.test(readFileSync(p, 'utf8'))) found.push(p);
    }
  };
  walk('src');
  assert.ok(found.length === 0, `the dev pages imported by ${found.join(', ')}`);
});

test('floor 2 looks: every picture there, the sizes asked for', () => {
  for (const p of pics()) {
    const path = join(DIR, p.file);
    assert.ok(existsSync(path), `${p.file} is missing`);
    const q = readPng(path);
    assert.ok(q.w === p.w && q.h === p.h, `${p.file}: ${q.w} x ${q.h}, not ${p.w} x ${p.h}`);
  }
  const s = readPng(join(DIR, 'floor2_look_sheet.png'));
  assert.ok(s.w >= 1100 && s.w <= 1300 && s.h <= 7500 && s.h > 3000, `the sheet: ${s.w} x ${s.h}`);
});

test("floor 2 looks, Colour 3: nothing cyan but the knight's own; nothing pink but the enemy's own", () => {
  for (const p of pics()) {
    const q = readPng(join(DIR, p.file));
    const places = pinkPlaces().map((g) => {
      const [x, y] = atPx(g.at[0], g.at[1], g.at[2]);
      return { x: x + p.dx, y: y + p.dy, rx: g.rx, ry: g.ry };
    });
    let cyan = 0;
    let strayCyan = 0;
    let strayPink = 0;
    const where: string[] = [];
    for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) {
      const [r, g, b] = q.px(x, y);
      if (isCyan(r, g, b)) {
        cyan++;
        const dx = x - p.hero[0];
        const dy = y - p.hero[1];
        if (Math.abs(dx) > 70 || dy < -110 || dy > 30) {
          strayCyan++;
          if (where.length < 4) where.push(`cyan at ${x},${y}`);
        }
      }
      if (isPink(r, g, b)) {
        const theirs = places.some((g) => Math.abs(x - g.x) <= g.rx && Math.abs(y - g.y) <= g.ry);
        // (the knight's own deep red, his tunic's shade, lifted by a fire's light beside him: his, and no glow)
        const onKnight = Math.abs(x - p.hero[0]) < 30 && y > p.hero[1] - 64 && y < p.hero[1] + 4;
        if (!theirs && !onKnight) {
          strayPink++;
          if (where.length < 8) where.push(`pink at ${x},${y}`);
        }
      }
    }
    assert.ok(cyan > 20, `${p.file}: the knight's cyan not found where he stands`);
    assert.ok(strayCyan === 0 && strayPink === 0, `${p.file}: ${strayCyan} cyan and ${strayPink} pink astray: ${where.join('; ')}`);
  }
  // (the sheet: its cyan in no more patches than it has knights, nine, each no bigger than a knight twice as big)
  const s = readPng(join(DIR, 'floor2_look_sheet.png'));
  const pts: [number, number][] = [];
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) if (isCyan(...s.px(x, y))) pts.push([x, y]);
  const patches: { x0: number; y0: number; x1: number; y1: number }[] = [];
  for (const [x, y] of pts) {
    const p = patches.find((q) => x > q.x0 - 60 && x < q.x1 + 60 && y > q.y0 - 60 && y < q.y1 + 60);
    if (p) {
      p.x0 = Math.min(p.x0, x);
      p.x1 = Math.max(p.x1, x);
      p.y0 = Math.min(p.y0, y);
      p.y1 = Math.max(p.y1, y);
    } else patches.push({ x0: x, y0: y, x1: x, y1: y });
  }
  assert.ok(patches.length >= 3 && patches.length <= 9, `the sheet's cyan in ${patches.length} patches`);
  for (const p of patches) assert.ok(p.x1 - p.x0 < 200 && p.y1 - p.y0 < 200, `a patch of cyan ${p.x1 - p.x0} x ${p.y1 - p.y0} at ${p.x0},${p.y0}`);
});

test('floor 2 looks: the floor and the knight read on a phone (the floor round him lit out of the dark; the knight standing out of it)', () => {
  for (const look of LOOKS) {
    const q = readPng(join(DIR, `${LETTER[look]}_phone.png`));
    const fx = Math.round(PHONE.W / 2);
    const fy = Math.round(PHONE.H / 2 + PHONE.lift);
    let floor = 0;
    let n = 0;
    for (let y = fy - 10; y < fy + 30; y++) for (const x of [fx - 70, fx - 50, fx + 50, fx + 70]) {
      floor += lumaAt(q, x, y);
      n++;
    }
    floor /= n;
    let hi = 0;
    let lo = 255;
    for (let y = fy - 50; y < fy - 4; y++) for (let x = fx - 12; x < fx + 12; x++) {
      hi = Math.max(hi, lumaAt(q, x, y));
      lo = Math.min(lo, lumaAt(q, x, y));
    }
    const dark = Math.min(lumaAt(q, 4, 4), lumaAt(q, q.w - 5, 4), lumaAt(q, 4, q.h - 5), lumaAt(q, q.w - 5, q.h - 5));
    assert.ok(floor > dark + 40, `${look}: the floor round him (${floor.toFixed(1)}) not lit well out of the dark (${dark.toFixed(1)})`);
    assert.ok(hi > floor + 70 && lo < floor - 25, `${look}: the knight (${lo.toFixed(1)} to ${hi.toFixed(1)}) does not stand out of the floor (${floor.toFixed(1)})`);
  }
});

/** The average of a picture's lit places (luma over 20), and their average colour. */
function litOf(file: string): { l: number; rgb: [number, number, number] } {
  const q = readPng(join(DIR, file));
  let t = 0;
  let n = 0;
  const sum: [number, number, number] = [0, 0, 0];
  for (let y = 0; y < q.h; y += 2) for (let x = 0; x < q.w; x += 2) {
    const [r, g, b] = q.px(x, y);
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (l > 20) {
      t += l;
      n++;
      sum[0] += r;
      sum[1] += g;
      sum[2] += b;
    }
  }
  return { l: t / n, rgb: [sum[0] / n, sum[1] / n, sum[2] / n] };
}

test("floor 2 looks: a step darker than floor 1's tomb, and no darker than floor 5's mine (its lit places between theirs)", () => {
  for (const look of LOOKS) {
    const { l } = litOf(`${FILE[look]}.png`);
    // (floor 1's tomb with daylight came to 69 to 75 so, floor 4's candlelit chapel to 55, floor 5's mine and temple to 44)
    assert.ok(l < 66 && l > 44, `${look}: its lit places come to ${l.toFixed(1)}`);
  }
});

test('floor 2 looks: each look its own (A the warmest and palest, C the coldest, B the darkest)', () => {
  const [A, B, C] = LOOKS.map((look) => litOf(`${FILE[look]}.png`));
  const warmth = (o: { rgb: [number, number, number] }): number => o.rgb[0] - o.rgb[2];
  assert.ok(warmth(A) > warmth(B) && warmth(B) > warmth(C), `warmth A ${warmth(A).toFixed(1)}, B ${warmth(B).toFixed(1)}, C ${warmth(C).toFixed(1)}`);
  assert.ok(A.l > B.l && C.l > B.l, `lit A ${A.l.toFixed(1)}, B ${B.l.toFixed(1)}, C ${C.l.toFixed(1)}`);
});
