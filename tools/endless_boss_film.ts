// ENDLESS MODE'S FINAL BOSS: A MOVE AS A FILM (src/art/endless_boss.ts), painted as the game paints its monsters, no browser. The
// boss on a floor of dark flags, carried over it as the game carries him (a charge), the warning marked on the floor while he
// holds it (the rules are the main chat's: here only to show it), his strike smeared, his lights laid soft over the dark.
//   npx tsx tools/endless_boss_film.ts <out dir> <move> <front|rear> [w h]   writes <out dir>/f/000.png ... at one picture pixel a
//   game pixel (the film is made from them with ffmpeg)
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { paintMob, paintViewOf } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
import { CHARGE, CHARGE_SKID, CHARGE_STRIKE, GORE, GORE_STRIKE, HAMMER_CANVAS, POWER, POWER_GLYPH, POWER_RED, POWER_STRIKES, STOMP, paintPowerHammer, STOMP_STRIKE, WHEEL, WS_CANVAS, boarPoseAt, chargeCarry, chargeSmeared, goreSmeared, powerRuneAt, powerSmeared, stompSmeared, wsMob } from '../src/art/endless_boss';
import { skeletonAt } from '../src/art/new_mobs3';
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { png } from './king_png';

const [out = '/tmp/wsfilm', move = 'charge', view0 = 'front', w0 = '420', h0 = '300'] = process.argv.slice(2);
const view = view0 as 'front' | 'rear';
void view;
const W = Number(w0);
const H = Number(h0);
const TILE = 32 / Math.sqrt(2 / 3);
mkdirSync(`${out}/f`, { recursive: true });
const mob = wsMob();
// (the floor as seen from in front: a move seen from behind is him turned round on it)
const st = stage(paintViewOf(mob, 'front'), WS_CANVAS.ax, WS_CANVAS.ay, WS_CANVAS);
const at = (p: [number, number, number]): [number, number] => {
  const [x, y] = st.at(p);
  return [x - WS_CANVAS.ax, y - WS_CANVAS.ay];
};
const rgb = (c: string): number[] => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const hex = (r: number, g: number, b: number): string => `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;
const mix = (s: Px, x: number, y: number, c: string, a: number): void => {
  if (x < 0 || y < 0 || x >= s.w || y >= s.h) return;
  const [r0, g0, b0] = rgb(s.get(x, y) ?? '#000000');
  const [r, g, b] = rgb(c);
  s.set(x, y, hex(r0 + (r - r0) * a, g0 + (g - g0) * a, b0 + (b - b0) * a));
};
// (the camera follows him, a little behind: his floor point held near the picture's middle, the floor going by)
const sx = Math.round(W / 2);
const sy = move === 'power' ? H - 70 : Math.round(H / 2 + 50);
/** The floor: dark flags, their joints, lit a little toward the upper left (moved by the camera: `cx`, `cy`). */
function floor(cx: number, cy: number): Px {
  const s = new Px(W, H);
  for (let y0 = 0; y0 < H; y0++) {
    for (let x0 = 0; x0 < W; x0++) {
      const x = x0 + cx;
      const y = y0 + cy;
      // (flags laid on the floor's own lines, as the game's iso floor is)
      const u = (x / 2 + y) / 22;
      const v = (-x / 2 + y) / 22;
      const fu = u - Math.floor(u);
      const fv = v - Math.floor(v);
      const n = Math.sin(Math.floor(u) * 12.9898 + Math.floor(v) * 78.233) * 43758.5453;
      const k = n - Math.floor(n);
      const joint = fu < 0.05 || fv < 0.05;
      s.set(x0, y0, joint ? '#1c161c' : k < 0.33 ? '#2a2228' : k < 0.66 ? '#2e262c' : '#272026');
    }
  }
  return s;
}
/** The lane, marked while he winds up and holds: a band of the enemy's pink down the floor, chevrons running along it. */
function lane(s: Px, t: number, ox: number, oy: number, from: V2, dir: number): void {
  const [s0] = CHARGE_STRIKE;
  if (t < 0.15 || t > s0 + 0.05) return;
  const a = Math.min(1, (t - 0.15) / 0.2) * (t > s0 ? 0.5 : 1);
  const L = CHARGE.lane * TILE;
  const half = CHARGE.half * TILE;
  for (let i = 0; i <= 260; i++) {
    for (let j = -12; j <= 12; j++) {
      const f = i / 260;
      const side = j / 12;
      const [x, y] = at([from[0] + dir * f * L, from[1] + side * half, 0]);
      const edge = Math.abs(side) > 0.86;
      // (chevrons running down it, toward where he will go)
      const ch = (f * 26 - t * 5 - Math.abs(side) * 1.2) % 1;
      const on = edge ? 0.55 : ch > 0 && ch < 0.22 ? 0.32 : 0.12;
      mix(s, Math.round(ox + x), Math.round(oy + y), '#ff4f8a', on * a * (1 - 0.3 * f));
    }
  }
}
/** The gore's sweep, marked while it winds up and holds: a fan of the enemy's pink before it, its edge bright. */
function sweep(s: Px, t: number, ox: number, oy: number, from: V2, dir: number): void {
  const [s0] = GORE_STRIKE;
  if (t < 0.12 || t > s0 + 0.06) return;
  const a = Math.min(1, (t - 0.12) / 0.15) * (t > s0 ? 0.5 : 1);
  const R = GORE.reach * TILE;
  const half = (GORE.arc / 2) * (Math.PI / 180);
  for (let i = 0; i <= 90; i++) {
    for (let j = 0; j <= 60; j++) {
      const ang = -half + (2 * half * i) / 90;
      const r = (R * j) / 60;
      const [x, y] = at([from[0] + dir * (30 + r * Math.cos(ang)), from[1] + dir * r * Math.sin(ang), 0]);
      const edge = j > 56;
      const ring = ((r / R) * 6 - t * 3) % 1;
      const on = edge ? 0.55 : ring > 0 && ring < 0.18 ? 0.3 : 0.1;
      mix(s, Math.round(ox + x), Math.round(oy + y), '#ff4f8a', on * a);
    }
  }
}
/** The stomp: where its blast will reach, marked while it rears and holds (its edge bright, rings running in toward it); then, as
 * it lands, the floor cracked out from its forefeet and shock rings rolling out one after another, each a bright edge with the
 * floor heaved and darkened behind it. */
function blast(s: Px, t: number, ox: number, oy: number, from: V2, dir: number): void {
  const [s0, s1] = STOMP_STRIKE;
  const R = STOMP.reach * TILE;
  const mid: V2 = [from[0] + dir * 30, from[1]];
  const pt = (r: number, a: number): [number, number] => {
    const [x, y] = at([mid[0] + r * Math.cos(a), mid[1] + r * Math.sin(a), 0]);
    return [Math.round(ox + x), Math.round(oy + y)];
  };
  if (t > 0.12 && t < s0 + 0.05) {
    const a0 = Math.min(1, (t - 0.12) / 0.2) * (t > s0 ? 0.5 : 1);
    for (let i = 0; i < 360; i++) {
      const a = (i / 360) * Math.PI * 2;
      for (let j = 0; j <= 40; j++) {
        const r = (R * j) / 40;
        const run = ((1 - r / R) * 5 + t * 2.5) % 1;
        const on = j >= 39 ? 0.6 : run < 0.14 ? 0.22 : 0.07;
        const [x, y] = pt(r, a);
        mix(s, x, y, '#ff4f8a', on * a0);
      }
    }
  }
  if (t > s1) {
    const u = t - s1;
    // (the floor cracked out from where it struck: dark, a hot line down each crack at first)
    for (let k = 0; k < 9; k++) {
      let a = (k / 9) * Math.PI * 2 + 0.4 * Math.sin(k * 7.1);
      let r = 6;
      const long = R * (0.35 + 0.3 * ((k * 0.618) % 1)) * Math.min(1, u / 0.1);
      while (r < long) {
        const [x, y] = pt(r, a);
        mix(s, x, y, '#100c10', 0.85);
        mix(s, x + 1, y, '#100c10', 0.5);
        if (u < 0.5) mix(s, x, y, '#ff4f8a', 0.6 * (1 - u / 0.5));
        a += 0.06 * Math.sin(r * 0.3 + k);
        r += 1.5;
      }
    }
    // (the rings rolling out)
    for (const w0 of STOMP.rings) {
      const v = (u - w0) / STOMP.ringLong;
      if (v <= 0 || v >= 1) continue;
      const rr = R * (1 - (1 - v) * (1 - v));
      const fade = 1 - v;
      for (let i = 0; i < 720; i++) {
        const a = (i / 720) * Math.PI * 2;
        for (let j = 0; j < 7; j++) {
          const r = rr - j * 1.6;
          if (r < 2) continue;
          const [x, y] = pt(r, a);
          const c = j === 0 ? '#fff0d0' : j < 2 ? '#ff7aa8' : j < 4 ? '#c0206a' : '#3a1a2a';
          mix(s, x, y, c, (j === 0 ? 0.9 : j < 4 ? 0.6 : 0.35) * fade);
        }
      }
    }
  }
}
// THE HERO, for the words: the Brawler's standing frame (the live heroes' bake), dodging; the film's stand-in for whoever fights him
const BRAWLER = ((): { w: number; h: number; px: (string | null)[] } => {
  // (a PNG read by hand: RGBA, 8-bit, no interlace; the bake's own)
  const buf = readFileSync('tools/endless_tablet/brawler.png');
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  const chunks: Buffer[] = [];
  for (let o = 8; o < buf.length; ) {
    const n = buf.readUInt32BE(o);
    const ty = buf.toString('ascii', o + 4, o + 8);
    if (ty === 'IDAT') chunks.push(buf.subarray(o + 8, o + 8 + n));
    o += 12 + n;
  }
  const raw = inflateSync(Buffer.concat(chunks));
  const px: (string | null)[] = [];
  const bpp = 4;
  const prev = new Uint8Array(w * bpp);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (w * bpp + 1)];
    const row = new Uint8Array(w * bpp);
    for (let x = 0; x < w * bpp; x++) {
      const v = raw[y * (w * bpp + 1) + 1 + x];
      const a = x >= bpp ? row[x - bpp] : 0;
      const b = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
      row[x] = (v + (f === 1 ? a : f === 2 ? b : f === 3 ? (a + b) >> 1 : f === 4 ? (pa <= pb && pa <= pc ? a : pb <= pc ? b : c) : 0)) & 255;
    }
    prev.set(row);
    for (let x = 0; x < w; x++) px.push(row[x * 4 + 3] > 128 ? hex(row[x * 4], row[x * 4 + 1], row[x * 4 + 2]) : null);
  }
  return { w, h, px };
})();
function hero(s: Px, x: number, y: number): void {
  for (let j = 0; j < BRAWLER.h; j++) for (let i = 0; i < BRAWLER.w; i++) {
    const c = BRAWLER.px[j * BRAWLER.w + i];
    if (c && x - BRAWLER.w / 2 + i >= 0 && y - BRAWLER.h + j >= 0 && x - BRAWLER.w / 2 + i < s.w && y - BRAWLER.h + j < s.h) s.set(Math.round(x - BRAWLER.w / 2 + i), Math.round(y - BRAWLER.h + 2 + j), c);
  }
}
/** The Power rune's glyph, `k` pixels a cell, the word's red with his pink through its middle, a hot edge, inked round. */
function powerGlyph(k: number): (string | null)[][] {
  const n = POWER_GLYPH.length;
  const W2 = n * k + 2;
  const g: (string | null)[][] = Array.from({ length: W2 }, () => Array(W2).fill(null));
  const on = (cx: number, cy: number): string => (cy >= 0 && cx >= 0 && cy < n && cx < n ? POWER_GLYPH[cy][cx] : '.');
  for (let y = 0; y < n * k; y++) for (let x = 0; x < n * k; x++) {
    const c = on(Math.floor(x / k), Math.floor(y / k));
    if (c === '.') continue;
    const fx = (x % k) / (k - 1), fy = (y % k) / (k - 1);
    const edge = fy < 0.2 || fx < 0.15;
    g[y + 1][x + 1] = c === 'o' ? (edge ? '#fff0a0' : '#ff4f8a') : edge ? POWER_RED[3] : fy > 0.75 ? POWER_RED[1] : POWER_RED[2];
  }
  // (ink round it)
  for (let y = 0; y < W2; y++) for (let x = 0; x < W2; x++) {
    if (g[y][x]) continue;
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => g[y + dy]?.[x + dx] && g[y + dy][x + dx] !== '#1a0610');
    if (nb) g[y][x] = '#1a0610';
  }
  return g;
}
const GLYPH_BIG = powerGlyph(9);
const GLYPH_SMALL = powerGlyph(2);
function stamp(s: Px, g: (string | null)[][], cx: number, cy: number, a = 1, reveal = 1): void {
  const n = g.length;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const c = g[y][x];
    if (!c) continue;
    // (written stroke by stroke: its cells from the bottom up)
    if (reveal < 1 && y / n < 1 - reveal) continue;
    const X = Math.round(cx - n / 2 + x), Y = Math.round(cy - n / 2 + y);
    if (a >= 1) { if (X >= 0 && Y >= 0 && X < s.w && Y < s.h) s.set(X, Y, c); } else mix(s, X, Y, c, a);
  }
}
/** A painted picture laid on the floor at (ox, oy) by its canvas's anchor, its lights soft over it (or faint, as an after-image). */
function layPainted(s: Px, p: { px: Px; lights: { x: number; y: number; r: number; color: string; a?: number }[] }, can: { ax: number; ay: number }, ox: number, oy: number, ghost: number): void {
  const x0 = Math.round(ox - can.ax), y0 = Math.round(oy - can.ay);
  for (let y = 0; y < p.px.h; y++) for (let x = 0; x < p.px.w; x++) {
    const c = p.px.get(x, y);
    if (!c) continue;
    if (ghost) mix(s, x0 + x, y0 + y, c, ghost);
    else if (x0 + x >= 0 && y0 + y >= 0 && x0 + x < s.w && y0 + y < s.h) s.set(x0 + x, y0 + y, c);
  }
  if (ghost) return;
  for (const l of p.lights) {
    const [r, g, b] = rgb(l.color);
    for (let y = Math.floor(l.y - l.r); y <= Math.ceil(l.y + l.r); y++) for (let x = Math.floor(l.x - l.r); x <= Math.ceil(l.x + l.r); x++) {
      const q = Math.hypot(x - l.x, y - l.y) / l.r;
      if (q < 1) mix(s, x0 + x, y0 + y, hex(r, g, b), (l.a ?? 0.5) * (1 - q) * (1 - q));
    }
  }
}
/** THE HAMMER OUT OF THE RUNE: hung from the rune at (x, y), its haft `L` long to the middle of its head, swung `swing` degrees from
 * straight down (raised back up over the rune at -150); of the word's red with his pink through it, a hot edge, inked; coming out of
 * the rune as `formed` goes to 1 (from the rune down, in sparks). */
function hammer(s: Px, x: number, y: number, L: number, swing: number, formed: number, a: number): void {
  const ph = (swing * Math.PI) / 180;
  const d: V2 = [-Math.sin(ph), Math.cos(ph)];
  const pp: V2 = [d[1], -d[0]];
  const HW = 30, HH = 17, SW = 3.6;
  const reach = L * formed;
  const box = L + HW + 4;
  const ink: [number, number][] = [];
  const put2 = (X: number, Y: number, c: string): void => { if (a >= 1) { if (X >= 0 && Y >= 0 && X < s.w && Y < s.h) s.set(X, Y, c); } else mix(s, X, Y, c, a); };
  for (let Y = Math.floor(y - box); Y <= y + box; Y++) for (let X = Math.floor(x - box); X <= x + box; X++) {
    const rx = X - x, ry = Y - y;
    const v = rx * d[0] + ry * d[1];
    const u = rx * pp[0] + ry * pp[1];
    if (v < 4 || v > reach + HH) continue;
    let c: string | null = null;
    if (Math.abs(v - L) <= HH && Math.abs(u) <= HW && reach >= L - HH) {
      // (its head: a great block, lit on its upper side, his pink burning down its middle, its faces' edges hot)
      const top = v - L < -HH + 3;
      const end = Math.abs(u) > HW - 3;
      c = Math.abs(v - L) < 2.2 ? '#ff4f8a' : top || end ? POWER_RED[3] : v - L > HH - 3 ? POWER_RED[1] : POWER_RED[2];
      if (Math.abs(u) < 3 && Math.abs(v - L) < 4) c = '#fff0a0';
    } else if (Math.abs(u) <= SW && v <= Math.min(reach, L - HH)) {
      // (its haft, a pink line of power down it)
      c = Math.abs(u) < 0.9 ? '#ff4f8a' : u < 0 ? POWER_RED[2] : POWER_RED[1];
    } else if (Math.abs(v - L) <= HH + 1.5 && Math.abs(u) <= HW + 1.5 && reach >= L - HH) ink.push([X, Y]);
    else if (Math.abs(u) <= SW + 1.2 && v <= Math.min(reach, L - HH)) ink.push([X, Y]);
    if (!c) continue;
    // (still coming out of the rune: its far end in sparks)
    if (formed < 1 && v > reach - 10 && ((X * 7 + Y * 13) % 5) / 5 > (reach - v) / 10) continue;
    put2(X, Y, c);
  }
  for (const [X, Y] of ink) put2(X, Y, '#1a0610');
}
/** POWER'S SCENE: the hero dodging, the rune's shadow chasing a beat behind him, the rune hanging high over it, dropping onto it in
 * each strike (a crater, a ring of force, stone flying), heaving up again; bursting after the last. */
const HERO_AT = (t: number): V2 => {
  // (where the hero is: stepping aside before each blow lands)
  const T0 = 5.2 * TILE;
  const path: [number, V2][] = [[0, [T0, 0]], [POWER.slams[0] - 0.22, [T0, 0]], [POWER.slams[0] - 0.02, [T0 + 0.4 * TILE, 1.3 * TILE]], [POWER.slams[1] - 0.24, [T0 + 0.3 * TILE, 1.6 * TILE]], [POWER.slams[1] - 0.04, [T0 - 0.9 * TILE, 0.9 * TILE]], [POWER.slams[2] - 0.22, [T0 - 1.1 * TILE, 0.7 * TILE]], [POWER.slams[2] - 0.02, [T0 + 1.2 * TILE, -1.4 * TILE]], [99, [T0 + 1.2 * TILE, -1.4 * TILE]]];
  for (let i = 1; i < path.length; i++) {
    const [ta, pa] = path[i - 1], [tb, pb] = path[i];
    if (t <= tb) { const u = (t - ta) / (tb - ta); const w = u * u * (3 - 2 * u); return [pa[0] + (pb[0] - pa[0]) * w, pa[1] + (pb[1] - pa[1]) * w]; }
  }
  return path[path.length - 1][1];
};
const SHADOW_AT = (t: number): V2 => {
  // (the shadow chases him a beat behind, and is fixed the moment the staff is raised for each blow)
  let lock = t;
  for (const h of POWER.slams) if (t > h - 0.3 && t <= h + 0.45) lock = h - 0.3;
  const lag = 0.32;
  return HERO_AT(Math.max(0, lock - lag));
};
function powerScene(s: Px, t: number, ox: number, oy: number, from: V2, dir: number, after: boolean): void {
  const R = powerRuneAt(t);
  const sh = SHADOW_AT(t);
  const wp = (p: V2, up = 0): [number, number] => { const [x, y] = at([from[0] + dir * p[0], from[1] + dir * p[1], up]); return [Math.round(ox + x), Math.round(oy + y)]; };
  if (!after) {
    // (craters left by each blow, fading after a while)
    for (const h of POWER.slams) {
      const u = t - h;
      if (u < 0) continue;
      const at0 = SHADOW_AT(h);
      const fade = 1 - Math.min(1, Math.max(0, (u - 1.6) / 0.6));
      for (let i = 0; i < 260; i++) {
        const a = (i / 260) * Math.PI * 2;
        for (let r = 0; r < 0.9 * TILE; r += 1.5) {
          const [x, y] = wp([at0[0] + r * Math.cos(a), at0[1] + r * Math.sin(a)]);
          const rim = r > 0.75 * TILE;
          mix(s, x, y, rim ? '#4a3a40' : '#120c10', (rim ? 0.4 : 0.55) * fade);
        }
      }
      // (the ring of force)
      const v = u / 0.4;
      if (v < 1) {
        const rr = (0.6 + 1.6 * Math.sqrt(v)) * TILE;
        for (let i = 0; i < 360; i++) {
          const a = (i / 360) * Math.PI * 2;
          for (let j = 0; j < 4; j++) {
            const [x, y] = wp([at0[0] + (rr - j * 1.5) * Math.cos(a), at0[1] + (rr - j * 1.5) * Math.sin(a)]);
            mix(s, x, y, j === 0 ? '#fff0d0' : j === 1 ? '#ff8a80' : '#e03c44', (1 - v) * (j === 0 ? 0.9 : 0.6));
          }
        }
      }
    }
    // (the shadow: the rune's own shape thrown down, growing hard as it drops)
    if (R.formed > 0 && R.gone < 1) {
      const near = 1 - R.up / (POWER.high * TILE);
      const a = 0.18 + 0.5 * near;
      for (let i = 0; i < 200; i++) {
        const ang = (i / 200) * Math.PI * 2;
        for (let r = 0; r < 1.3 * TILE; r += 1.5) {
          const [x, y] = wp([sh[0] + r * Math.cos(ang), sh[1] + r * Math.sin(ang)]);
          const edge = r > 1.22 * TILE;
          mix(s, x, y, edge ? '#ff4f8a' : '#3a0a12', (edge ? 0.7 : 0.35) * a * R.formed * (1 - R.gone));
        }
      }
    }
    return;
  }
  // (the hero)
  const [hx, hy] = wp(HERO_AT(t));
  hero(s, hx, hy);
  // (the rune he writes, at his hand, then flying up off his staff)
  const sk = skeletonAt(mob, 'power', t);
  if (t > POWER.write[0] && t < POWER.cast + 0.25) {
    const [x, y] = at([from[0] + dir * sk.handL[0], from[1] + dir * sk.handL[1], sk.handL[2] + 6]);
    const flyUp = Math.max(0, t - POWER.cast) / 0.25;
    const rev = Math.min(1, (t - POWER.write[0]) / (POWER.write[1] - POWER.write[0]));
    stamp(s, GLYPH_SMALL, ox + x + flyUp * 10, oy + y - flyUp * 160, 1, rev);
    if (flyUp > 0) for (let k = 1; k < 8; k++) stamp(s, GLYPH_SMALL, ox + x + flyUp * 10, oy + y - flyUp * 160 + k * 6, 0.5 / k);
  }
  // (the rune he flings: flying from his hand up over the hero, and bursting there; out of the burst, the hammer)
  if (t > POWER.cast && t < POWER.cast + 0.5) {
    const sk2 = skeletonAt(mob, 'power', POWER.cast);
    const [hx0, hy0] = at([from[0] + dir * sk2.handL[0], from[1] + dir * sk2.handL[1], sk2.handL[2] + 6]);
    const [tx0, ty0] = wp(sh, 128);
    const u = Math.min(1, (t - POWER.cast) / 0.25);
    const X = ox + hx0 + (tx0 - ox - hx0) * u, Y = oy + hy0 + (ty0 - oy - hy0) * u - 60 * Math.sin(Math.PI * u);
    if (u < 1) {
      stamp(s, GLYPH_SMALL, X, Y, 1);
      for (let k = 1; k < 6; k++) stamp(s, GLYPH_SMALL, X - (tx0 - ox - hx0) * 0.04 * k, Y + 8 * k * (1 - 2 * u), 0.4 / k);
    } else {
      // (it bursts: a flash and a ring of sparks, and it is gone)
      const b = (t - POWER.cast - 0.25) / 0.25;
      for (let i = 0; i < 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        const r = 6 + 50 * b * (0.6 + 0.4 * ((i * 0.618) % 1));
        mix(s, Math.round(tx0 + Math.cos(a) * r), Math.round(ty0 + Math.sin(a) * r * 0.7), i % 3 ? '#ff4f8a' : '#fff0a0', 1 - b);
      }
      for (let yy = -24; yy <= 24; yy++) for (let xx = -24; xx <= 24; xx++) {
        const q = Math.hypot(xx, yy) / 24;
        if (q < 1) mix(s, tx0 + xx, ty0 + yy, '#fff0d0', 0.7 * (1 - b) * (1 - q));
      }
    }
  }
  // (the hammer, painted as he is, on the rune's shadow; smeared down its fall as it crushes)
  {
    const [fx0, fy0] = wp(sh, 0);
    if (powerSmeared(t)) for (const [m, a] of [[2, 0.25], [1, 0.45]] as const) layPainted(s, paintPowerHammer(t - m / 90, 'front'), HAMMER_CANVAS, fx0, fy0, a);
    layPainted(s, paintPowerHammer(t, 'front'), HAMMER_CANVAS, fx0, fy0, 0);
  }
  void R;
  // (stone thrown up out of each crater; and after the last, the rune's shards)
  for (const [bi, h] of POWER.slams.entries()) {
    const u = t - h;
    if (u <= 0 || u > 0.8) continue;
    const at0 = SHADOW_AT(h);
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * Math.PI * 2 + i;
      const sp = (40 + 60 * ((i * 0.618) % 1)) * 1.6;
      const z = (60 + 50 * ((i * 0.37) % 1)) * u - 0.5 * 200 * u * u;
      if (z < 0) continue;
      const [x, y] = wp([at0[0] + Math.cos(a) * sp * u, at0[1] + Math.sin(a) * sp * u], z);
      const c = i % 3 === 0 ? '#9a8e94' : i % 3 === 1 ? '#6a5e64' : '#c4b8b4';
      s.set(Math.max(0, Math.min(W - 1, x)), Math.max(0, Math.min(H - 1, y)), c);
      if (i % 4 === 0 && x + 1 < W && y + 1 < H && x >= 0 && y >= 0) { s.set(x + 1, y, c); s.set(x, y + 1, c); }
    }
    if (bi === 2) {
      for (let i = 0; i < 40; i++) {
        const a = (i / 40) * Math.PI * 2;
        const r = (20 + 140 * u) * (0.6 + 0.4 * ((i * 0.618) % 1));
        const [x, y] = wp([at0[0], at0[1]], 30 + 40 * u);
        const X = Math.round(x + Math.cos(a) * r * 0.5), Y = Math.round(y + Math.sin(a) * r * 0.35 - 30 * u);
        if (u < 0.6) mix(s, X, Y, i % 2 ? '#ff4f8a' : '#e03c44', 1 - u / 0.6);
      }
    }
  }
}
/** His picture laid on the floor at (ox, oy): his painted pixels, then his lights soft over them. */
function lay(s: Px, mv: string, vw: 'front' | 'rear', t: number, ox: number, oy: number, ghost = 0): void {
  const { px, lights } = paintMob(mob, mv, t, vw);
  const x0 = Math.round(ox - WS_CANVAS.ax);
  const y0 = Math.round(oy - WS_CANVAS.ay);
  // (seen from behind going back up the lane: the game's from-behind picture, turned over left for right as the game turns it)
  const flip = vw === 'rear';
  const fx = (x: number): number => (flip ? 2 * WS_CANVAS.ax - x : x);
  for (let y = 0; y < px.h; y++) {
    for (let xx = 0; xx < px.w; xx++) {
      const x = fx(xx);
      const c = px.get(xx, y);
      if (!c) continue;
      if (ghost) mix(s, x0 + x, y0 + y, c, ghost);
      else if (x0 + x >= 0 && y0 + y >= 0 && x0 + x < W && y0 + y < H) s.set(x0 + x, y0 + y, c);
    }
  }
  if (ghost) return;
  for (const l0 of lights) {
    const l = { ...l0, x: fx(l0.x) };
    const [r, g, b] = rgb(l.color);
    for (let y = Math.floor(l.y - l.r); y <= Math.ceil(l.y + l.r); y++) {
      for (let x = Math.floor(l.x - l.r); x <= Math.ceil(l.x + l.r); x++) {
        const q = Math.hypot(x - l.x, y - l.y) / l.r;
        if (q >= 1) continue;
        mix(s, x0 + x, y0 + y, hex(r, g, b), (l.a ?? 0.5) * (1 - q) * (1 - q));
      }
    }
  }
}
type V2 = [number, number];
/** A piece of the film: a move, from which side he is seen (from behind, he is turned round: the way he goes is the floor's other
 * way), where on the floor it starts, how much faster than itself it plays. */
interface Seg {
  move: string;
  view: 'front' | 'rear';
  from: V2;
  speed: number;
  long: number;
  /** where his floor point is, as the move's own points are, at `t` (a charge carries him; a wheel turns him round his forehand) */
  floorAt: (t: number) => V2;
}
const floorOf = (mv: string) => (t: number): V2 => {
  if (mv === 'charge') return [chargeCarry(t) * TILE, 0];
  if (mv === 'wheel') {
    const P = boarPoseAt('wheel', t);
    return [P.x, P.y];
  }
  return [0, 0];
};
const longOf = (mv: string): number => (mv === 'charge' ? CHARGE.long : mv === 'wheel' ? WHEEL.long : mv === 'gore' ? GORE.long : mv === 'stomp' ? STOMP.long : mv === 'power' ? POWER.long : 3);
/** The film: one move, or (charge3) three runs, wheeling round between, each faster. */
const segs: Seg[] = [];
{
  const plan: [string, 'front' | 'rear', number][] = move === 'charge3'
    ? [['charge', 'front', 1], ['wheel', 'front', 1], ['charge', 'rear', 1.15], ['wheel', 'rear', 1.15], ['charge', 'front', 1.3]]
    : [[move, view, 1]];
  let from: V2 = [0, 0];
  for (const [mv, vw, speed] of plan) {
    const f = floorOf(mv);
    const sg: Seg = { move: mv, view: vw, from, speed, long: longOf(mv) / speed, floorAt: f };
    segs.push(sg);
    const e = f(longOf(mv));
    const k = vw === 'front' ? 1 : -1;
    from = [from[0] + k * e[0], from[1] + k * e[1]];
  }
}
let camX = 0;
let camY = 0;
let i = 0;
for (const sg of segs) {
  const n = Math.round(sg.long * 30);
  const k = sg.view === 'front' ? 1 : -1;
  for (let j = 0; j <= n; j++, i++) {
    const t = Math.min(longOf(sg.move), (j / 30) * sg.speed);
    const world = (tt: number): [number, number, number] => {
      const f = sg.floorAt(tt);
      return [sg.from[0] + k * f[0], sg.from[1] + k * f[1], 0];
    };
    const [tx, ty] = sg.move === 'power' ? at([sg.from[0] + 3.1 * TILE, sg.from[1] + 0.2 * TILE, 0]) : at(world(t));
    camX += (tx - camX) * (i === 0 ? 1 : 0.32);
    camY += (ty - camY) * (i === 0 ? 1 : 0.32);
    // (the screen kicks as it bursts off and as it digs in to stop: his rulebook's Animations, “the screen kicks on big casts and hits”)
    const kick = sg.move === 'charge' ? Math.max(0, 1 - Math.abs(t - CHARGE_STRIKE[1]) / 0.1) * 3 + Math.max(0, 1 - Math.abs(t - CHARGE_SKID[0] - 0.1) / 0.12) * 2 : sg.move === 'gore' ? Math.max(0, 1 - Math.abs(t - GORE.hit - 0.02) / 0.12) * 4 : sg.move === 'stomp' ? Math.max(0, 1 - Math.abs(t - STOMP.hit - 0.03) / 0.25) * 7 : sg.move === 'power' ? Math.max(0, ...POWER.slams.map((h) => 1 - Math.abs(t - h - 0.03) / 0.2)) * 6 : 0;
    const ox = sx - Math.round(camX) + Math.round(kick * Math.sin(i * 2.7));
    const oy = sy - Math.round(camY) + Math.round(kick * Math.cos(i * 3.1));
    const s = floor(-ox, -oy);
    if (sg.move === 'charge') lane(s, t, ox, oy, sg.from, k);
    if (sg.move === 'gore') sweep(s, t, ox, oy, sg.from, k);
    if (sg.move === 'stomp') blast(s, t, ox, oy, sg.from, k);
    if (sg.move === 'power') powerScene(s, t, ox, oy, sg.from, k, false);
    const where = (tt: number): [number, number] => {
      const [x, y] = at(world(tt));
      return [ox + x, oy + y];
    };
    // (the move's own picture is drawn about its floor point as it stands at nothing: placed at where the segment starts)
    const base = (): [number, number] => {
      const [x, y] = at([sg.from[0], sg.from[1], 0]);
      return [ox + x, oy + y];
    };
    if (sg.move === 'charge' && chargeSmeared(t)) {
      for (const [m, a] of [[3, 0.18], [2, 0.3], [1, 0.45]] as const) {
        const [x, y] = where(t - m * (1 / 90));
        lay(s, sg.move, sg.view, t, x, y, a);
      }
    }
    if (sg.move === 'gore' && goreSmeared(t)) {
      // (its strike smeared: after-images of its head hooking through, fading)
      const [x, y] = base();
      for (const [m, a] of [[2, 0.25], [1, 0.45]] as const) lay(s, sg.move, sg.view, t - m * (1 / 90), x, y, a);
    }
    if (sg.move === 'stomp' && stompSmeared(t)) {
      const [x, y] = base();
      for (const [m, a] of [[2, 0.25], [1, 0.45]] as const) lay(s, sg.move, sg.view, t - m * (1 / 90), x, y, a);
    }
    if (sg.move === 'power' && powerSmeared(t)) {
      const [x, y] = base();
      for (const [m, a] of [[2, 0.25], [1, 0.45]] as const) lay(s, sg.move, sg.view, t - m * (1 / 90), x, y, a);
    }
    if (sg.move === 'wheel' || sg.move === 'gore' || sg.move === 'stomp' || sg.move === 'power') {
      const [x, y] = base();
      lay(s, sg.move, sg.view, t, x, y);
    } else {
      const [x, y] = where(t);
      lay(s, sg.move, sg.view, t, x, y);
    }
    if (sg.move === 'power') powerScene(s, t, ox, oy, sg.from, k, true);
    writeFileSync(`${out}/f/${String(i).padStart(3, '0')}.png`, png(s));
  }
}
const N = i - 1;
const long = segs.reduce((a, b) => a + b.long, 0);
console.log(N + 1, 'frames', long.toFixed(2), 's');
