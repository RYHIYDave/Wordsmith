// FLOOR 4, THE BURIED CHAPEL OF BONES: THE THREE LOOKS (src/dev/floor4_look_paint.ts, src/dev/preview_floor4_look.ts; pictures
// in docs/mockups/floor4_look/pictures). Pictures first: nothing of the game imports them; nothing in the pictures glows cyan
// but the knight's own, nothing pink but the Amalgamation's own and the maw on his gate (his art rulebook, Colour 3; the
// knight's own deep red is his); the pictures the sizes asked for.
//   run: tsx --test tests/floor4_look.test.ts

// @ts-ignore
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
// @ts-ignore
import { join } from 'node:path';
// @ts-ignore
import { inflateSync } from 'node:zlib';
import { assert, test } from './floor_checks';
import { BOSS_AT, FILE, HERO_PHONE, HERO_RUN, LETTER, LOOKS, MARK_AT, PHONE, PICTURE, atPx } from '../src/dev/floor4_look_paint';

const DIR = join('docs', 'mockups', 'floor4_look', 'pictures');

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

/** Each picture of a look: its file, its size, where the knight stands on it, where the Amalgamation and the maw are. */
interface Pic { file: string; w: number; h: number; hero: [number, number]; boss: [number, number]; mark: [number, number] }
function pics(): Pic[] {
  const out: Pic[] = [];
  for (const look of LOOKS) {
    const boss = atPx(BOSS_AT[0], BOSS_AT[1]);
    const mark = atPx(MARK_AT[0], MARK_AT[1], MARK_AT[2]);
    out.push({ file: `${FILE[look]}.png`, w: PICTURE.W, h: PICTURE.H, hero: atPx(HERO_RUN[0], HERO_RUN[1]), boss, mark });
    // (one phone screen: the whole picture moved so that the knight is in its middle, a little up the screen of his feet)
    const [hx, hy] = atPx(HERO_PHONE[0], HERO_PHONE[1]);
    const dx = Math.round(PHONE.W / 2 - hx);
    const dy = Math.round(PHONE.H / 2 - (hy - PHONE.lift));
    const mv = (q: [number, number]): [number, number] => [q[0] + dx, q[1] + dy];
    out.push({ file: `${LETTER[look]}_phone.png`, w: PHONE.W, h: PHONE.H, hero: mv([hx, hy]), boss: mv(boss), mark: mv(mark) });
  }
  return out;
}

test('floor 4 looks: pictures first, nothing of the game imports the dev pages', () => {
  const found: string[] = [];
  const walk = (d: string): void => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) {
        if (p !== join('src', 'dev')) walk(p);
      } else if (p.endsWith('.ts') && /floor4_look_paint|preview_floor4_look/.test(readFileSync(p, 'utf8'))) found.push(p);
    }
  };
  walk('src');
  assert.ok(found.length === 0, `the dev pages imported by ${found.join(', ')}`);
});

test('floor 4 looks: every picture there, the sizes asked for', () => {
  for (const p of pics()) {
    const path = join(DIR, p.file);
    assert.ok(existsSync(path), `${p.file} is missing`);
    const q = readPng(path);
    assert.ok(q.w === p.w && q.h === p.h, `${p.file}: ${q.w} x ${q.h}, not ${p.w} x ${p.h}`);
  }
  const s = readPng(join(DIR, 'floor4_look_sheet.png'));
  assert.ok(s.w >= 1100 && s.w <= 1300 && s.h <= 7500 && s.h > 3000, `the sheet: ${s.w} x ${s.h}`);
});

test("floor 4 looks, Colour 3: nothing cyan but the knight's own; nothing pink but the Amalgamation's own and the maw on his gate", () => {
  for (const p of pics()) {
    const q = readPng(join(DIR, p.file));
    let cyan = 0;
    let strayCyan = 0;
    let strayPink = 0;
    const where: string[] = [];
    for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) {
      const [r, g, b] = q.px(x, y);
      if (isCyan(r, g, b)) {
        cyan++;
        // (the knight: his blade, his edge, the friend's glow round him)
        const dx = x - p.hero[0];
        const dy = y - p.hero[1];
        if (Math.abs(dx) > 70 || dy < -110 || dy > 30) {
          strayCyan++;
          if (where.length < 4) where.push(`cyan at ${x},${y}`);
        }
      }
      if (isPink(r, g, b)) {
        // (the Amalgamation: a heap low and wide; its pink in its skulls' sockets, its cracks, its edge)
        const nearBoss = Math.abs(x - p.boss[0]) < 140 && y > p.boss[1] - 200 && y < p.boss[1] + 40;
        const nearMark = Math.abs(x - p.mark[0]) < 18 && Math.abs(y - p.mark[1]) < 20;
        // (the knight's own deep red, his tunic's shade, lifted by a fire's light beside him: his, and no glow)
        const onKnight = Math.abs(x - p.hero[0]) < 30 && y > p.hero[1] - 64 && y < p.hero[1] + 4;
        if (!nearBoss && !nearMark && !onKnight) {
          strayPink++;
          if (where.length < 8) where.push(`pink at ${x},${y}`);
        }
      }
    }
    assert.ok(cyan > 20, `${p.file}: the knight's cyan not found where he stands`);
    assert.ok(strayCyan === 0 && strayPink === 0, `${p.file}: ${strayCyan} cyan and ${strayPink} pink astray: ${where.join('; ')}`);
  }
  // (the sheet: its cyan in no more patches than it has knights, nine, each no bigger than a knight twice as big)
  const s = readPng(join(DIR, 'floor4_look_sheet.png'));
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

test('floor 4 looks: the floor and the knight read on a phone (the floor round him lighter than the dark, the knight lighter than the floor)', () => {
  for (const look of LOOKS) {
    const q = readPng(join(DIR, `${LETTER[look]}_phone.png`));
    const luma = (x: number, y: number): number => {
      const [r, g, b] = q.px(x, y);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    // (the knight's feet are at the middle of the screen, PHONE.lift below it)
    const fx = Math.round(PHONE.W / 2);
    const fy = Math.round(PHONE.H / 2 + PHONE.lift);
    let floor = 0;
    let n = 0;
    for (let y = fy - 10; y < fy + 40; y++) for (const x of [fx - 110, fx - 90, fx + 90, fx + 110]) {
      floor += luma(x, y);
      n++;
    }
    floor /= n;
    let knight = 0;
    for (let y = fy - 50; y < fy - 4; y++) for (let x = fx - 12; x < fx + 12; x++) knight = Math.max(knight, luma(x, y));
    const dark = luma(4, 4);
    assert.ok(floor > dark + 12, `${look}: the floor round him (${floor.toFixed(1)}) hardly lighter than the dark (${dark.toFixed(1)})`);
    assert.ok(knight > floor + 80, `${look}: the knight (${knight.toFixed(1)}) does not stand out of the floor (${floor.toFixed(1)})`);
  }
});
