// ENDLESS MODE'S FINAL BOSS: A MOVE AS A FILM (src/art/endless_boss.ts), painted as the game paints its monsters, no browser. The
// boss on a floor of dark flags, carried over it as the game carries him (a charge), the warning marked on the floor while he
// holds it (the rules are the main chat's: here only to show it), his strike smeared, his lights laid soft over the dark.
//   npx tsx tools/endless_boss_film.ts <out dir> <move> <front|rear> [w h]   writes <out dir>/f/000.png ... at one picture pixel a
//   game pixel (the film is made from them with ffmpeg)
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { paintMob, paintViewOf } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
import { CHARGE, CHARGE_SKID, CHARGE_STRIKE, GORE, GORE_STRIKE, FIRE, FIRE_BURST, FIRE_CANVAS, FIRE_DROPS, BOLT, ORB_CANVAS, paintOrb, SPORE, SPORE_CANVAS, SPORE_PODS, paintSpores, FROST, FROST_SPIKES, FROST_STRIKE, ICE_CANVAS, frostSmeared, paintFrost, HAMMER_CANVAS, lexiconRune, POWER, paintFirestorm, POWER_GLYPH, POWER_RED, POWER_STRIKES, STOMP, paintPowerHammer, STOMP_STRIKE, WHEEL, WS_CANVAS, boarPoseAt, chargeCarry, chargeSmeared, goreSmeared, powerRuneAt, powerSmeared, stompSmeared, wsMob } from '../src/art/endless_boss';
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
const sy = move === 'power' ? H - 90 : move === 'flame' ? Math.round(H / 2 + 40) : Math.round(H / 2 + 50);
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
/** THE RUNES AS HIS LEXICON SHOWS THEM (his words, 12 Nov 2026: “i want to see the runes i see in my lexicon on thiese attacks”): each
 * word's own rune stone, as the Lexicon draws it, twice its size. */
const big2 = (g: (string | null)[][]): (string | null)[][] => g.flatMap((r) => [r.flatMap((c) => [c, c]), r.flatMap((c) => [c, c])]);
const LEX = { power: big2(lexiconRune('power')), fire: big2(lexiconRune('fire')), frost: big2(lexiconRune('frost')), lightning: big2(lexiconRune('lightning')), poison: big2(lexiconRune('poison')) };
const GLYPH_SMALL = LEX.power;
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
/** A word's glyph as a little picture: its own colour, his pink at its heart, a hot edge, inked round. */
function glyphOf(rows: readonly string[], k: number, own: string, hot: string): (string | null)[][] {
  const n = rows.length;
  const W2 = n * k + 2;
  const g: (string | null)[][] = Array.from({ length: W2 }, () => Array(W2).fill(null));
  for (let y = 0; y < n * k; y++) for (let x = 0; x < n * k; x++) {
    const c = rows[Math.floor(y / k)][Math.floor(x / k)];
    if (c === '.') continue;
    g[y + 1][x + 1] = c === 'o' ? '#ff4f8a' : (y % k) === 0 ? hot : own;
  }
  for (let y = 0; y < W2; y++) for (let x = 0; x < W2; x++) if (!g[y][x] && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => g[y + dy]?.[x + dx] && g[y + dy][x + dx] !== '#1a0610')) g[y][x] = '#1a0610';
  return g;
}
const FIRE_GLYPH = LEX.fire;
/** THE FIRESTORM'S SCENE: the hero dodging; each fireball's mark on the floor before it falls, the floor scorched where it fell (under
 * the storm's own solids, painted as he is); his rune flung out high over the room and bursting into a ring of fire. */
const STORM_AT: V2 = [4.6 * TILE, 0.2 * TILE];
const FIRE_HERO = (t: number): V2 => {
  // (dodging each wave as its marks show, and getting out of the fire at the last)
  const path: [number, V2][] = [[0, [4.2 * TILE, 0.3 * TILE]], [1.0, [4.2 * TILE, 0.3 * TILE]], [1.6, [5.4 * TILE, 1.4 * TILE]], [2.3, [6.6 * TILE, 0.2 * TILE]], [3.0, [5.6 * TILE, -1.2 * TILE]], [3.7, [6.8 * TILE, -0.8 * TILE]], [99, [6.8 * TILE, -0.8 * TILE]]];
  for (let i = 1; i < path.length; i++) {
    const [ta, pa] = path[i - 1], [tb, pb] = path[i];
    if (t <= tb) { const u = (t - ta) / (tb - ta); const w = u * u * (3 - 2 * u); return [pa[0] + (pb[0] - pa[0]) * w, pa[1] + (pb[1] - pa[1]) * w]; }
  }
  return path[path.length - 1][1];
};
function flameScene(s: Px, t: number, ox: number, oy: number, from: V2, dir: number, after: boolean): void {
  const wp = (p: V2, up = 0): [number, number] => { const [x, y] = at([from[0] + dir * p[0], from[1] + dir * p[1], up]); return [Math.round(ox + x), Math.round(oy + y)]; };
  const sp = (p: V3): V2 => [STORM_AT[0] + p[0], STORM_AT[1] + p[1]];
  if (!after) {
    for (const d of FIRE_DROPS) {
      const c = sp(d.at);
      // (its mark: a ring of orange with his pink through it, filling as it comes)
      if (t > d.t - FIRE.warn && t < d.t) {
        const u = (t - (d.t - FIRE.warn)) / FIRE.warn;
        for (let i = 0; i < 160; i++) {
          const a = (i / 160) * Math.PI * 2;
          for (let r = 0; r < 0.7 * TILE; r += 1.5) {
            const [x, y] = wp([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
            const edge = r > 0.62 * TILE;
            const fill = r < 0.7 * TILE * u;
            if (edge) mix(s, x, y, i % 8 < 4 ? '#ff8a2a' : '#ff4f8a', 0.7);
            else if (fill) mix(s, x, y, '#ff8a2a', 0.18 + 0.1 * u);
          }
        }
      }
      // (its crater: the floor blasted dark, its rim glowing, cooling)
      if (t >= d.t) {
        const cool = Math.min(1, (t - d.t) / 1.5);
        for (let i = 0; i < 140; i++) {
          const a = (i / 140) * Math.PI * 2;
          for (let r = 0; r < 0.75 * TILE; r += 1.5) {
            const [x, y] = wp([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
            const rim = r > 0.58 * TILE;
            if (rim) mix(s, x, y, (i + Math.floor(r)) % 5 < 2 ? '#ff8a2a' : '#3a1a14', 0.7 - 0.4 * cool);
            else mix(s, x, y, '#0e080a', 0.75);
          }
        }
      }
    }
    return;
  }
  const [hx, hy] = wp(FIRE_HERO(t));
  hero(s, hx, hy);
  // (his rune: written at his hand, flung out high over the room, bursting into a ring of fire)
  const sk = skeletonAt(mob, 'flame', t);
  const [bx, by] = wp(sp(FIRE_BURST), FIRE_BURST[2]);
  if (t > FIRE.write[0] && t <= FIRE.cast) {
    const [x, y] = at([from[0] + dir * sk.handL[0], from[1] + dir * sk.handL[1], sk.handL[2] + 6]);
    stamp(s, FIRE_GLYPH, ox + x, oy + y, 1, Math.min(1, (t - FIRE.write[0]) / (FIRE.write[1] - FIRE.write[0])));
  } else if (t > FIRE.cast && t < FIRE.cast + 0.3) {
    // (fired straight up into the sky, out of sight, a streak of fire behind it)
    const sk2 = skeletonAt(mob, 'flame', FIRE.cast);
    const [x0, y0] = at([from[0] + dir * sk2.handL[0], from[1] + dir * sk2.handL[1], sk2.handL[2] + 6]);
    const u = (t - FIRE.cast) / 0.3;
    const X = ox + x0, Y = oy + y0 - 420 * u * u - 60 * u;
    stamp(s, FIRE_GLYPH, X, Y, 1);
    for (let k = 1; k < 10; k++) stamp(s, FIRE_GLYPH, X, Y + 9 * k, 0.5 / k);
  }
  // (the storm, painted as he is)
  layPainted(s, paintFirestorm(t, 'front'), FIRE_CANVAS, wp(STORM_AT)[0], wp(STORM_AT)[1], 0);
  void bx;
  void by;
}
const FROST_GLYPH = LEX.frost;
const ICE_AT: V2 = [FROST.from * TILE, 0];
const FROST_HERO = (t: number): V2 => {
  const path: [number, V2][] = [[0, [6.2 * TILE, 0.2 * TILE]], [0.9, [6.2 * TILE, 0.2 * TILE]], [1.3, [6.6 * TILE, 1.5 * TILE]], [99, [6.6 * TILE, 1.5 * TILE]]];
  for (let i = 1; i < path.length; i++) {
    const [ta, pa] = path[i - 1], [tb, pb] = path[i];
    if (t <= tb) { const u = (t - ta) / (tb - ta); const w = u * u * (3 - 2 * u); return [pa[0] + (pb[0] - pa[0]) * w, pa[1] + (pb[1] - pa[1]) * w]; }
  }
  return path[path.length - 1][1];
};
/** FROST'S SCENE: the rune driven into the floor before him; out of it the ice racing at the hero (painted as he is), the floor frozen
 * white behind it. */
function frostScene(s: Px, t: number, ox: number, oy: number, from: V2, dir: number, after: boolean): void {
  const wp = (p: V2, up = 0): [number, number] => { const [x, y] = at([from[0] + dir * p[0], from[1] + dir * p[1], up]); return [Math.round(ox + x), Math.round(oy + y)]; };
  if (!after) {
    // (the floor frozen white behind the ice as it races, and about where the rune struck)
    for (const sp of FROST_SPIKES) {
      if (t < sp.t) continue;
      const u = Math.min(1, (t - sp.t) / 0.15);
      const c: V2 = [ICE_AT[0] + sp.at[0], ICE_AT[1] + sp.at[1]];
      for (let i = 0; i < 40; i++) {
        const a = (i / 40) * Math.PI * 2;
        for (let r = 0; r < 14 * u; r += 1.5) {
          const [x, y] = wp([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
          mix(s, x, y, (i * 7 + Math.floor(r)) % 9 === 0 ? '#f2f6ff' : '#b4d6f6', 0.22);
        }
      }
    }
    return;
  }
  const [hx, hy] = wp(FROST_HERO(t));
  hero(s, hx, hy);
  const sk = skeletonAt(mob, 'frost', t);
  const [s0, hit] = FROST_STRIKE;
  const [ix, iy] = wp(ICE_AT);
  if (t > FROST.write[0] && t <= s0) {
    const [x, y] = at([from[0] + dir * sk.handL[0], from[1] + dir * sk.handL[1], sk.handL[2] + 6]);
    stamp(s, FROST_GLYPH, ox + x, oy + y, 1, Math.min(1, (t - FROST.write[0]) / (FROST.write[1] - FROST.write[0])));
  } else if (t > s0 && t <= hit) {
    // (driven down into the floor with his staff: two frames, smeared)
    const sk2 = skeletonAt(mob, 'frost', s0);
    const [x0, y0] = at([from[0] + dir * sk2.handL[0], from[1] + dir * sk2.handL[1], sk2.handL[2] + 6]);
    const u = (t - s0) / (hit - s0);
    for (let k = 0; k < 6; k++) {
      const v = Math.max(0, u - k * 0.12);
      stamp(s, FROST_GLYPH, ox + x0 + (ix - ox - x0) * v, oy + y0 + (iy - oy - y0) * v, k === 0 ? 1 : 0.4 / k);
    }
  }
  layPainted(s, paintFrost(t, 'front'), ICE_CANVAS, ix, iy, 0);
  // (where it struck: it shatters, a flash of white and his pink, a ring of frost thrown out)
  if (t > hit && t < hit + 0.5) {
    const b = (t - hit) / 0.5;
    for (let yy = -22; yy <= 22; yy++) for (let xx = -32; xx <= 32; xx++) {
      const q = Math.hypot(xx / 32, yy / 22);
      if (q < 1) mix(s, ix + xx, iy + yy, q < 0.4 ? '#ff4f8a' : '#f2f6ff', 0.75 * (1 - b) * (1 - q));
    }
    for (let i = 0; i < 90; i++) {
      const a = (i / 90) * Math.PI * 2;
      const r = 10 + 60 * Math.sqrt(b);
      mix(s, Math.round(ix + Math.cos(a) * r), Math.round(iy + Math.sin(a) * r * 0.5), i % 4 ? '#b4d6f6' : '#ff4f8a', 0.8 * (1 - b));
    }
  }
}
const BOLT_GLYPH = LEX.lightning;
const CRACK_AT: V2 = [4.4 * TILE, 0.3 * TILE];
const BOLT_HERO = (t: number): V2 => {
  const path: [number, V2][] = [[0, [5.6 * TILE, 0.5 * TILE]], [1.2, [5.6 * TILE, 0.5 * TILE]], [2.2, [7.2 * TILE, 1.8 * TILE]], [3.0, [7.6 * TILE, -0.6 * TILE]], [3.8, [6.4 * TILE, -2.0 * TILE]], [99, [6.4 * TILE, -2.0 * TILE]]];
  for (let i = 1; i < path.length; i++) {
    const [ta, pa] = path[i - 1], [tb, pb] = path[i];
    if (t <= tb) { const u = (t - ta) / (tb - ta); const w = u * u * (3 - 2 * u); return [pa[0] + (pb[0] - pa[0]) * w, pa[1] + (pb[1] - pa[1]) * w]; }
  }
  return path[path.length - 1][1];
};
/** Where each orb is (the floor's points, its height over it), drifting after the hero from where the rune cracked. */
const ORB_PATHS: [number, number][][] = ((): [number, number][][] => {
  const out: [number, number][][] = [];
  for (let k = 0; k < BOLT.orbs; k++) {
    const a = (k / BOLT.orbs) * Math.PI * 2 + 0.4;
    let x = CRACK_AT[0] + Math.cos(a) * 0.5 * TILE, y = CRACK_AT[1] + Math.sin(a) * 0.5 * TILE;
    const path: [number, number][] = [];
    for (let i = 0; i <= Math.round(BOLT.long * 30); i++) {
      const t = i / 30;
      if (t > BOLT.crack) {
        // (each hunts its own side of the hero, so they come at him from about him, not in a clump)
        const h: V2 = BOLT_HERO(t - 0.5);
        const dx = h[0] - x, dy = h[1] - y, d = Math.hypot(dx, dy) || 1;
        const sp = (0.75 + 0.2 * k) * TILE / 30;
        x += (dx / d) * sp + Math.cos(t * 3 + k * 2) * 0.6;
        y += (dy / d) * sp + Math.sin(t * 2.6 + k) * 0.6;
      }
      path.push([x, y]);
    }
    out.push(path);
  }
  return out;
})();
function boltScene(s: Px, t: number, ox: number, oy: number, from: V2, dir: number, after: boolean): void {
  const wp = (p: V2, up = 0): [number, number] => { const [x, y] = at([from[0] + dir * p[0], from[1] + dir * p[1], up]); return [Math.round(ox + x), Math.round(oy + y)]; };
  const fi = Math.min(ORB_PATHS[0].length - 1, Math.round(t * 30));
  if (!after) {
    // (the floor scorched where each orb burst)
    for (const [k, b] of [...BOLT.zaps, ...BOLT.bursts].map((v) => [0, v] as const)) {
      if (t < b) continue;
      const c = ORB_PATHS[k][Math.round(b * 30)];
      for (let i = 0; i < 120; i++) {
        const a = (i / 120) * Math.PI * 2;
        for (let r = 0; r < 0.8 * TILE; r += 1.5) {
          const [x, y] = wp([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
          if ((i * 3 + Math.floor(r)) % 11 < 3 || r < 0.35 * TILE) mix(s, x, y, '#120c10', 0.6);
        }
      }
    }
    return;
  }
  const [hx, hy] = wp(BOLT_HERO(t));
  hero(s, hx, hy);
  const sk = skeletonAt(mob, 'lightning', t);
  const [cx, cy] = wp(CRACK_AT, 80);
  if (t > BOLT.write[0] && t <= BOLT.cast) {
    const [x, y] = at([from[0] + dir * sk.handL[0], from[1] + dir * sk.handL[1], sk.handL[2] + 6]);
    stamp(s, BOLT_GLYPH, ox + x, oy + y, 1, Math.min(1, (t - BOLT.write[0]) / (BOLT.write[1] - BOLT.write[0])));
  } else if (t > BOLT.cast && t < BOLT.crack) {
    const sk2 = skeletonAt(mob, 'lightning', BOLT.cast);
    const [x0, y0] = at([from[0] + dir * sk2.handL[0], from[1] + dir * sk2.handL[1], sk2.handL[2] + 6]);
    const u = (t - BOLT.cast) / (BOLT.crack - BOLT.cast);
    const X = ox + x0 + (cx - ox - x0) * u, Y = oy + y0 + (cy - oy - y0) * u - 40 * Math.sin(Math.PI * u);
    stamp(s, BOLT_GLYPH, X, Y, 1);
    for (let k = 1; k < 6; k++) stamp(s, BOLT_GLYPH, X - (cx - ox - x0) * 0.035 * k, Y + 5 * k, 0.4 / k);
  }
  // (it cracks open: a flash, bolts thrown down to the floor)
  if (t >= BOLT.crack && t < BOLT.crack + 0.35) {
    const b = (t - BOLT.crack) / 0.35;
    for (let yy = -30; yy <= 30; yy++) for (let xx = -30; xx <= 30; xx++) {
      const q = Math.hypot(xx, yy) / 30;
      if (q < 1) mix(s, cx + xx, cy + yy, '#fffbe0', 0.85 * (1 - b) * (1 - q));
    }
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + 0.7;
      const [fx, fy] = wp([CRACK_AT[0] + Math.cos(a) * 1.4 * TILE, CRACK_AT[1] + Math.sin(a) * 1.4 * TILE]);
      let X = cx, Y = cy;
      for (let j = 1; j <= 14; j++) {
        const f = j / 14;
        const nx = Math.round(cx + (fx - cx) * f + (Math.sin(j * 7.3 + k * 3 + Math.floor(t * 30)) * 5)), ny = Math.round(cy + (fy - cy) * f);
        for (let m = 0; m <= 6; m++) mix(s, Math.round(X + (nx - X) * m / 6), Math.round(Y + (ny - Y) * m / 6), j % 3 ? '#fffbe0' : '#fff060', 1 - b);
        X = nx; Y = ny;
      }
    }
  }
  // (the orb, painted as he is: drifting after the hero; every so often swelling and crackling, its reach marked on the floor, then
  // zapping out bolts across the floor all round it; bursting at the last)
  if (t >= BOLT.crack) {
    const k = 0;
    const b = BOLT.bursts[0];
    const c = ORB_PATHS[k][fi];
    const bob = 34 + 4 * Math.sin(t * 4);
    if (t <= b + 0.45) {
      let swell = t <= b ? Math.max(0, 1 - (b - t) / 0.4) : 1;
      const zaps: V3[] = [];
      for (const z of BOLT.zaps) {
        if (t > z - BOLT.swell && t <= z) swell = Math.max(swell, 1 - (z - t) / BOLT.swell);
        if (t > z && t < z + BOLT.zapLong) {
          for (let m = 0; m < BOLT.bolts; m++) {
            const a = (m / BOLT.bolts) * Math.PI * 2 + z * 3;
            zaps.push([Math.cos(a) * BOLT.reach * TILE, Math.sin(a) * BOLT.reach * TILE, -bob]);
          }
        }
        // (its reach, marked on the floor as it swells)
        if (t > z - BOLT.swell && t <= z + 0.05) {
          const u = Math.min(1, (t - (z - BOLT.swell)) / BOLT.swell);
          for (let i = 0; i < 260; i++) {
            const a = (i / 260) * Math.PI * 2;
            const [x, y] = wp([c[0] + Math.cos(a) * BOLT.reach * TILE, c[1] + Math.sin(a) * BOLT.reach * TILE]);
            mix(s, x, y, i % 6 < 3 ? '#fff060' : '#ff4f8a', 0.4 + 0.5 * u);
          }
        }
      }
      if (t <= b) {
        const [x, y] = wp(c);
        layPainted(s, paintOrb([0, 0, bob], t, k, swell, [], 'front'), ORB_CANVAS, x, y, 0);
        const [ox2, oy2] = wp(c, bob);
        // (its zaps: thick bolts lancing out across the floor all round, new each frame)
        for (const [zi, z] of zaps.entries()) {
          const [zx, zy] = wp([c[0] + z[0], c[1] + z[1]]);
          boltLine(s, ox2, oy2, zx, zy, zi * 31 + Math.floor(t * 30) * 7, 1.6, 1, 1);
        }
        // (and its crackle between: small bolts down to the floor beside it, flickering)
        const fq = Math.floor(t * 30);
        if (fq % 4 === 0 || swell > 0.5) {
          for (let m = 0; m < 1 + Math.round(3 * swell); m++) {
            const a = ((fq * 2.39 + m * 1.7) % (Math.PI * 2));
            const [zx, zy] = wp([c[0] + Math.cos(a) * 0.9 * TILE, c[1] + Math.sin(a) * 0.9 * TILE]);
            boltLine(s, ox2, oy2, zx, zy, fq * 13 + m, 1, 0.9, 0);
          }
        }
      } else {
        // (it bursts: a great flash and a ring of bolts thrown out along the floor)
        const u = (t - b) / 0.45;
        const [x, y] = wp(c, bob);
        for (let yy = -90; yy <= 90; yy++) for (let xx = -90; xx <= 90; xx++) {
          const q = Math.hypot(xx, yy) / 90;
          if (q < 1) mix(s, x + xx, y + yy, q < 0.5 ? '#fffbe0' : '#ff4f8a', 0.9 * (1 - u) * (1 - q));
        }
        for (let m = 0; m < 10; m++) {
          const a = (m / 10) * Math.PI * 2;
          const r = 140 * (0.4 + u);
          boltLine(s, x, y + Math.round(bob * 0.6), Math.round(x + Math.cos(a) * r), Math.round(y + bob * 0.6 + Math.sin(a) * r * 0.5), m * 17 + Math.floor(t * 30), 1.6, 1 - u, 1);
        }
      }
    }
  }
}
/** A BOLT OF LIGHTNING drawn from (x0, y0) to (x1, y1): jagged, forking, a white-hot core inside the word's yellow inside his pink;
 * new every frame. */
function boltLine(s: Px, x0: number, y0: number, x1: number, y1: number, seed: number, w: number, a = 1, fork = 2): void {
  const n = Math.max(5, Math.round(Math.hypot(x1 - x0, y1 - y0) / 10));
  const pts: [number, number][] = [[x0, y0]];
  const nx = -(y1 - y0), ny = x1 - x0, nl = Math.hypot(nx, ny) || 1;
  for (let j = 1; j < n; j++) {
    const f = j / n;
    const h = Math.sin(seed * 12.9898 + j * 78.233) * 43758.5453;
    const jit = (h - Math.floor(h)) * 2 - 1;
    pts.push([x0 + (x1 - x0) * f + (nx / nl) * jit * 4.5, y0 + (y1 - y0) * f + (ny / nl) * jit * 4.5]);
  }
  pts.push([x1, y1]);
  for (let j = 1; j < pts.length; j++) {
    const [ax, ay] = pts[j - 1], [bx, by] = pts[j];
    const m = Math.ceil(Math.hypot(bx - ax, by - ay));
    for (let q = 0; q <= m; q++) {
      const X = Math.round(ax + (bx - ax) * q / m), Y = Math.round(ay + (by - ay) * q / m);
      const Wi = Math.ceil(w) + 1;
      for (let dy = -Wi; dy <= Wi; dy++) for (let dx = -Wi; dx <= Wi; dx++) {
        const d = Math.hypot(dx, dy);
        if (d > w + 1) continue;
        mix(s, X + dx, Y + dy, d <= w * 0.5 ? '#fffbe0' : d <= w ? '#fff060' : '#ff4f8a', a * (d <= w ? 1 : 0.35));
      }
    }
    // (forks off it)
    if (fork > 0 && j % 4 === 2) {
      const ang = Math.atan2(by - ay, bx - ax) + (j % 2 ? 0.7 : -0.7);
      const L = 14 + 10 * ((seed * 7 + j) % 3);
      boltLine(s, bx, by, bx + Math.cos(ang) * L, by + Math.sin(ang) * L, seed * 3 + j, Math.max(0, w - 1), a * 0.8, fork - 1);
    }
  }
}
const SPORE_GLYPH = LEX.poison;
const SPORE_AT: V2 = [4.6 * TILE, 0.2 * TILE];
const SPORE_HERO = (t: number): V2 => {
  const path: [number, V2][] = [[0, [5.0 * TILE, 0.4 * TILE]], [1.8, [5.0 * TILE, 0.4 * TILE]], [2.7, [7.2 * TILE, 2.2 * TILE]], [3.6, [9.0 * TILE, 0.0 * TILE]], [4.5, [7.4 * TILE, -2.8 * TILE]], [99, [7.4 * TILE, -2.8 * TILE]]];
  for (let i = 1; i < path.length; i++) {
    const [ta, pa] = path[i - 1], [tb, pb] = path[i];
    if (t <= tb) { const u = (t - ta) / (tb - ta); const w = u * u * (3 - 2 * u); return [pa[0] + (pb[0] - pa[0]) * w, pa[1] + (pb[1] - pa[1]) * w]; }
  }
  return path[path.length - 1][1];
};
/** When each pod is set off: the first moment, once it has sprouted, that the hero comes within a tile and a bit of it. */
const SPORE_FIRED: (number | null)[] = SPORE_PODS.map((pod) => {
  for (let i = 0; i <= Math.round(SPORE.long * 30); i++) {
    const t = i / 30;
    if (t < pod.land + SPORE.sprout) continue;
    const h = SPORE_HERO(t);
    if (Math.hypot(h[0] - (SPORE_AT[0] + pod.at[0]), h[1] - (SPORE_AT[1] + pod.at[1])) < 1.15 * TILE) return t;
  }
  return null;
});
function sporeScene(s: Px, t: number, ox: number, oy: number, from: V2, dir: number, after: boolean): void {
  const wp = (p: V2, up = 0): [number, number] => { const [x, y] = at([from[0] + dir * p[0], from[1] + dir * p[1], up]); return [Math.round(ox + x), Math.round(oy + y)]; };
  if (!after) {
    // (each pod's reach, faint on the floor about it once it has sprouted; the floor stained where its cloud hung)
    for (const [k, pod] of SPORE_PODS.entries()) {
      if (t < pod.land + SPORE.sprout) continue;
      const f = SPORE_FIRED[k];
      const c: V2 = [SPORE_AT[0] + pod.at[0], SPORE_AT[1] + pod.at[1]];
      for (let i = 0; i < 120; i++) {
        const a = (i / 120) * Math.PI * 2;
        if (f === null || t < f + SPORE.swell) {
          const [x, y] = wp([c[0] + Math.cos(a) * 1.15 * TILE, c[1] + Math.sin(a) * 1.15 * TILE]);
          if (i % 4 < 2) mix(s, x, y, '#b4cc24', f !== null && t > f ? 0.8 : 0.3);
        } else {
          for (let r = 0; r < 1.2 * TILE; r += 2) {
            const [x, y] = wp([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]);
            mix(s, x, y, '#2a3412', 0.35);
          }
        }
      }
    }
    return;
  }
  const sk = skeletonAt(mob, 'poison', t);
  const [cx, cy] = wp(SPORE_AT, 70);
  if (t > SPORE.write[0] && t <= SPORE.cast) {
    const [x, y] = at([from[0] + dir * sk.handL[0], from[1] + dir * sk.handL[1], sk.handL[2] + 6]);
    stamp(s, SPORE_GLYPH, ox + x, oy + y, 1, Math.min(1, (t - SPORE.write[0]) / (SPORE.write[1] - SPORE.write[0])));
  } else if (t > SPORE.cast && t < SPORE.burst) {
    const sk2 = skeletonAt(mob, 'poison', SPORE.cast);
    const [x0, y0] = at([from[0] + dir * sk2.handL[0], from[1] + dir * sk2.handL[1], sk2.handL[2] + 6]);
    const u = (t - SPORE.cast) / (SPORE.burst - SPORE.cast);
    const X = ox + x0 + (cx - ox - x0) * u, Y = oy + y0 + (cy - oy - y0) * u - 40 * Math.sin(Math.PI * u);
    stamp(s, SPORE_GLYPH, X, Y, 1);
    for (let k = 1; k < 6; k++) stamp(s, SPORE_GLYPH, X - (cx - ox - x0) * 0.035 * k, Y + 5 * k, 0.4 / k);
  }
  if (t >= SPORE.burst && t < SPORE.burst + 0.3) {
    const b = (t - SPORE.burst) / 0.3;
    for (let yy = -26; yy <= 26; yy++) for (let xx = -26; xx <= 26; xx++) {
      const q = Math.hypot(xx, yy) / 26;
      if (q < 1) mix(s, cx + xx, cy + yy, q < 0.4 ? '#ff4f8a' : '#e2f07a', 0.8 * (1 - b) * (1 - q));
    }
  }
  layPainted(s, paintSpores(t, SPORE_FIRED, 'front'), SPORE_CANVAS, wp(SPORE_AT)[0], wp(SPORE_AT)[1], 0);
  // (the hero kept in sight over the clouds: his rulebook's Animations 4)
  const [hx, hy] = wp(SPORE_HERO(t));
  hero(s, hx, hy);
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
  // (the rune he writes, at his hand, stroke by stroke, until he flings it out over the hero: one rune, that one)
  const sk = skeletonAt(mob, 'power', t);
  if (t > POWER.write[0] && t <= POWER.cast) {
    const [x, y] = at([from[0] + dir * sk.handL[0], from[1] + dir * sk.handL[1], sk.handL[2] + 6]);
    const rev = Math.min(1, (t - POWER.write[0]) / (POWER.write[1] - POWER.write[0]));
    stamp(s, GLYPH_SMALL, ox + x, oy + y, 1, rev);
  }

  // (the rune he flings: flying from his hand up over the hero, and bursting there; out of the burst, the hammer)
  if (t > POWER.cast && t < POWER.cast + 0.5) {
    const sk2 = skeletonAt(mob, 'power', POWER.cast);
    const [hx0, hy0] = at([from[0] + dir * sk2.handL[0], from[1] + dir * sk2.handL[1], sk2.handL[2] + 6]);
    const [tx0, ty0] = wp(sh, 133);
    const u = Math.min(1, (t - POWER.cast) / 0.25);
    const X = ox + hx0 + (tx0 - ox - hx0) * u, Y = oy + hy0 + (ty0 - oy - hy0) * u - 60 * Math.sin(Math.PI * u);
    if (u < 1) {
      stamp(s, GLYPH_SMALL, X, Y, 1);
      for (let k = 1; k < 6; k++) stamp(s, GLYPH_SMALL, X - (tx0 - ox - hx0) * 0.04 * k, Y + 8 * k * (1 - 2 * u), 0.4 / k);
    }
  }
  // (the hammer, painted as he is, on the rune's shadow; smeared down its fall as it crushes)
  {
    const [fx0, fy0] = wp(sh, 0);
    if (powerSmeared(t)) for (const [m, a] of [[2, 0.25], [1, 0.45]] as const) layPainted(s, paintPowerHammer(t - m / 90, 'front'), HAMMER_CANVAS, fx0, fy0, a);
    layPainted(s, paintPowerHammer(t, 'front'), HAMMER_CANVAS, fx0, fy0, 0);
  }
  // (the rune bursting over the hero, over the hammer forming out of it)
  if (t >= POWER.cast + 0.25 && t < POWER.cast + 0.5) {
    const [tx0, ty0] = wp(sh, 133);
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
const longOf = (mv: string): number => (mv === 'charge' ? CHARGE.long : mv === 'wheel' ? WHEEL.long : mv === 'gore' ? GORE.long : mv === 'stomp' ? STOMP.long : mv === 'power' ? POWER.long : mv === 'flame' ? FIRE.long : mv === 'frost' ? FROST.long : mv === 'lightning' ? BOLT.long : mv === 'poison' ? SPORE.long : 3);
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
    const [tx, ty] = sg.move === 'power' ? at([sg.from[0] + 3.1 * TILE, sg.from[1] + 0.2 * TILE, 0]) : sg.move === 'flame' ? at([sg.from[0] + STORM_AT[0] - 1.0 * TILE, sg.from[1] + STORM_AT[1], 0]) : sg.move === 'frost' ? at([sg.from[0] + 3.6 * TILE, sg.from[1] + 0.4 * TILE, 0]) : sg.move === 'lightning' ? at([sg.from[0] + 3.8 * TILE, sg.from[1] + 0.2 * TILE, 0]) : sg.move === 'poison' ? at([sg.from[0] + 4.8 * TILE, sg.from[1] + 0.2 * TILE, 0]) : at(world(t));
    camX += (tx - camX) * (i === 0 ? 1 : 0.32);
    camY += (ty - camY) * (i === 0 ? 1 : 0.32);
    // (the screen kicks as it bursts off and as it digs in to stop: his rulebook's Animations, “the screen kicks on big casts and hits”)
    const kick = sg.move === 'charge' ? Math.max(0, 1 - Math.abs(t - CHARGE_STRIKE[1]) / 0.1) * 3 + Math.max(0, 1 - Math.abs(t - CHARGE_SKID[0] - 0.1) / 0.12) * 2 : sg.move === 'gore' ? Math.max(0, 1 - Math.abs(t - GORE.hit - 0.02) / 0.12) * 4 : sg.move === 'stomp' ? Math.max(0, 1 - Math.abs(t - STOMP.hit - 0.03) / 0.25) * 7 : sg.move === 'power' ? Math.max(0, ...POWER.slams.map((h) => 1 - Math.abs(t - h - 0.03) / 0.2)) * 6 : sg.move === 'flame' ? Math.max(0, ...FIRE_DROPS.map((d) => 1 - Math.abs(t - d.t - 0.02) / 0.1)) * 2 : sg.move === 'frost' ? Math.max(0, 1 - Math.abs(t - FROST.hit - 0.03) / 0.25) * 5 : sg.move === 'lightning' ? Math.max(0, ...[...BOLT.bursts, ...BOLT.zaps].map((b) => 1 - Math.abs(t - b - 0.03) / 0.15), 1 - Math.abs(t - BOLT.crack) / 0.12) * 4 : 0;
    const ox = sx - Math.round(camX) + Math.round(kick * Math.sin(i * 2.7));
    const oy = sy - Math.round(camY) + Math.round(kick * Math.cos(i * 3.1));
    const s = floor(-ox, -oy);
    if (sg.move === 'charge') lane(s, t, ox, oy, sg.from, k);
    if (sg.move === 'gore') sweep(s, t, ox, oy, sg.from, k);
    if (sg.move === 'stomp') blast(s, t, ox, oy, sg.from, k);
    if (sg.move === 'power') powerScene(s, t, ox, oy, sg.from, k, false);
    if (sg.move === 'flame') flameScene(s, t, ox, oy, sg.from, k, false);
    if (sg.move === 'frost') frostScene(s, t, ox, oy, sg.from, k, false);
    if (sg.move === 'lightning') boltScene(s, t, ox, oy, sg.from, k, false);
    if (sg.move === 'poison') sporeScene(s, t, ox, oy, sg.from, k, false);
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
    if (sg.move === 'frost' && frostSmeared(t)) {
      const [x, y] = base();
      for (const [m, a] of [[2, 0.25], [1, 0.45]] as const) lay(s, sg.move, sg.view, t - m * (1 / 90), x, y, a);
    }
    if (sg.move === 'wheel' || sg.move === 'gore' || sg.move === 'stomp' || sg.move === 'power' || sg.move === 'flame' || sg.move === 'frost' || sg.move === 'lightning' || sg.move === 'poison') {
      const [x, y] = base();
      lay(s, sg.move, sg.view, t, x, y);
    } else {
      const [x, y] = where(t);
      lay(s, sg.move, sg.view, t, x, y);
    }
    if (sg.move === 'power') powerScene(s, t, ox, oy, sg.from, k, true);
    if (sg.move === 'flame') flameScene(s, t, ox, oy, sg.from, k, true);
    if (sg.move === 'frost') frostScene(s, t, ox, oy, sg.from, k, true);
    if (sg.move === 'lightning') boltScene(s, t, ox, oy, sg.from, k, true);
    if (sg.move === 'poison') sporeScene(s, t, ox, oy, sg.from, k, true);
    writeFileSync(`${out}/f/${String(i).padStart(3, '0')}.png`, png(s));
  }
}
const N = i - 1;
const long = segs.reduce((a, b) => a + b.long, 0);
console.log(N + 1, 'frames', long.toFixed(2), 's');
