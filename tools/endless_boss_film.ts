// ENDLESS MODE'S FINAL BOSS: A MOVE AS A FILM (src/art/endless_boss.ts), painted as the game paints its monsters, no browser. The
// boss on a floor of dark flags, carried over it as the game carries him (a charge), the warning marked on the floor while he
// holds it (the rules are the main chat's: here only to show it), his strike smeared, his lights laid soft over the dark.
//   npx tsx tools/endless_boss_film.ts <out dir> <move> <front|rear> [w h]   writes <out dir>/f/000.png ... at one picture pixel a
//   game pixel (the film is made from them with ffmpeg)
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { paintMob, paintViewOf } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
import { FROSTBITE, FROSTBITE_CANVAS, frostbiteIced, frostbiteIsle, frostbiteWave, paintFrostbite, FUMES, FUMES_CLOUDS, fumesSpread, WILDFIRE, SCALD, SCALD_CANVAS, paintScald, scaldBeam, scaldIce, scaldIn, scaldSteamAt, scaldWall, BLIGHT, BLIGHT_AT, BLIGHT_CANVAS, BLIGHT_FIELD, BLIGHT_TREES, blightAt, blightReach, paintBlight, THUNDER, THUNDER_CANVAS, THUNDER_STRIKES, paintThunder, thunderClapR, thunderClapAt, ARENA, AVAL, AVAL_CANVAS, AVAL_OUT, avalFront, avalSpared, avalTail, paintAvalanche, TURN, turnYaw, shadeGlide, HAIL, HAIL_BOLTS, HAIL_CANVAS, HAIL_HERO, HAIL_STONES, hailCloudAt, paintHail, DEATH, ERUPT, ERUPT_AT, ERUPT_CANVAS, ERUPT_VENTS, MELD, eruptRace, meldSmeared, paintEruption, FALL, fallCarry, slamAt, slamRing, paintShade, SHADE, SHADE_CANVAS, CHARGE, CHARGE_SKID, CHARGE_STRIKE, GORE, GORE_STRIKE, FIRE, FIRE_BURST, FIRE_CANVAS, FIRE_DROPS, BOLT, ORB_CANVAS, paintOrb, SPORE, SPORE_CANVAS, SPORE_PODS, paintSpores, FROST, FROST_SPIKES, FROST_STRIKE, ICE_CANVAS, frostSmeared, paintFrost, HAMMER_CANVAS, POWER, paintFirestorm, POWER_GLYPH, POWER_RED, POWER_STRIKES, STOMP, paintPowerHammer, STOMP_STRIKE, WHEEL, WS_CANVAS, boarPoseAt, chargeCarry, chargeSmeared, goreSmeared, powerRuneAt, powerSmeared, stompSmeared, wsMob } from '../src/art/endless_boss';
import { skeletonAt } from '../src/art/new_mobs3';
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { png } from './king_png';
import { GLYPH, WORD_COLOR, WORD_GLOW } from '../src/art/icons';
import { MELD_GLYPH, MELD_RAMP } from '../src/render/melds3';
import { P as PAL } from '../src/art/palette';
import { FLAME } from '../src/art/mkit';
import { hash } from '../src/art/kit';

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
const sy = move === 'fall' ? Math.round(H / 2 + 20) : move === 'power' ? H - 90 : move === 'flame' ? Math.round(H / 2 + 40) : Math.round(H / 2 + 50);
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
function hero(s: Px, x: number, y: number, ghost = 1): void {
  for (let j = 0; j < BRAWLER.h; j++) for (let i = 0; i < BRAWLER.w; i++) {
    const c = BRAWLER.px[j * BRAWLER.w + i];
    if (!c || !(x - BRAWLER.w / 2 + i >= 0 && y - BRAWLER.h + j >= 0 && x - BRAWLER.w / 2 + i < s.w && y - BRAWLER.h + j < s.h)) continue;
    if (ghost < 1) mix(s, Math.round(x - BRAWLER.w / 2 + i), Math.round(y - BRAWLER.h + 2 + j), c, ghost);
    else s.set(Math.round(x - BRAWLER.w / 2 + i), Math.round(y - BRAWLER.h + 2 + j), c);
  }
}
/** WHERE THE HERO IS in Thunder's film (his own lengths): standing where each ring locks on to him; dashing out of it before the bolt
 * falls; then caught by its thunderclap as it rolls out, and knocked on, to where the next ring locks on; out of the last to safe
 * ground. */
const THUNDER_HERO_OUT: [number, number, number] = [5.3 * TILE, -4.1 * TILE, 0];
const THUNDER_DASH = 0.75;
function thunderHeroAt(t: number): [number, number, number] {
  const pts = [...THUNDER_STRIKES.map((st) => [st.at[0], st.at[1], 0] as [number, number, number]), THUNDER_HERO_OUT];
  const ease = (u: number): number => u * u * (3 - 2 * u);
  const lerp = (a: number[], b: number[], u: number): [number, number, number] => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, 0];
  for (const [k, st] of THUNDER_STRIKES.entries()) {
    const a = pts[k], b = pts[k + 1], q = lerp(a, b, THUNDER_DASH);
    const d0 = st.lock + 0.06, d1 = d0 + 0.24;
    const s0 = st.t + thunderClapAt(Math.hypot(q[0] - a[0], q[1] - a[1])), s1 = s0 + 0.12;
    if (t <= d0) return a;
    if (t < d1) return lerp(a, q, ease((t - d0) / 0.24));
    if (t <= s0) return q;
    if (t < s1) { const u = (t - s0) / 0.12; return lerp(q, b, 1 - (1 - u) * (1 - u)); }
  }
  return pts[pts.length - 1];
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
/** THE RUNES HE WRITES (his words, 12 Nov 2026: “i want to see the runes i see in my lexicon on thiese attacks”, then “not with the
 * stone around it, just the symbol carved into it.  and have him like create it not just pull it out of thin air or whatever”): each
 * word's symbol as the Lexicon carves it (art/icons.ts GLYPH, in WORD_COLOR with WORD_GLOW at its heart), with no stone round it,
 * RUNE_K pixels to its cell, inked round. (The stone stays only on Poison's traps on the floor: “i do like the stone with poison on
 * the ground tho”, “just one the ground”, “and just poison”.) */
type Word = 'power' | 'fire' | 'frost' | 'lightning' | 'poison';
const RUNE_K = 4;
const RUNE_PINK = '#ff4f8a';
const RUNE_HOT = '#fffbe8';
/** The order his claw writes a symbol's cells in: on along a stroke while it goes on (straight on first, then round a corner), the
 * claw lifted to the topmost cell not yet written when a stroke ends. */
function strokeOrder(rows: readonly string[]): { x: number; y: number; lift: boolean }[] {
  const left = new Set<string>();
  rows.forEach((r, y) => [...r].forEach((c, x) => { if (c !== '.') left.add(`${x},${y}`); }));
  const out: { x: number; y: number; lift: boolean }[] = [];
  let cur: [number, number] | null = null;
  let d: [number, number] = [0, 0];
  while (left.size) {
    let next: [number, number] | null = null;
    if (cur) for (const [dx, dy] of [d, [1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]] as [number, number][]) {
      if ((dx || dy) && left.has(`${cur[0] + dx},${cur[1] + dy}`)) { next = [cur[0] + dx, cur[1] + dy]; break; }
    }
    const lift = !next;
    if (!next) for (const k of left) {
      const [x, y] = k.split(',').map(Number);
      if (!next || y < next[1] || (y === next[1] && x < next[0])) next = [x, y];
    }
    const n2 = next as [number, number];
    d = cur && !lift ? [n2[0] - cur[0], n2[1] - cur[1]] : [0, 0];
    left.delete(`${n2[0]},${n2[1]}`);
    out.push({ x: n2[0], y: n2[1], lift: lift && out.length > 0 });
    cur = n2;
  }
  return out;
}
/** The symbol as a little picture, `lit` of its cells written (in stroke order; all of them when not given), the freshest white-hot
 * and cooling through its glow to its own colour; inked round. */
function bareGlyph(word: Word, lit = Infinity, K = RUNE_K, rows0?: readonly string[], cols?: [string, string]): (string | null)[][] {
  const rows = rows0 ?? GLYPH[word];
  const n = rows.length, W2 = n * K + 2;
  const order = strokeOrder(rows);
  const g: (string | null)[][] = Array.from({ length: W2 }, () => Array(W2).fill(null));
  order.forEach((c, i) => {
    if (i >= Math.ceil(lit)) return;
    const age = lit - i;
    const [wc, wg] = cols ?? [WORD_COLOR[word], WORD_GLOW[word]];
    const own = rows[c.y][c.x] === 'o' ? wg : wc;
    const col = age < 1.6 ? RUNE_HOT : age < 4 ? wg : own;
    for (let y = 0; y < K; y++) for (let x = 0; x < K; x++) g[1 + c.y * K + y][1 + c.x * K + x] = col;
  });
  for (let y = 0; y < W2; y++) for (let x = 0; x < W2; x++) if (!g[y][x] && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => g[y + dy]?.[x + dx] && g[y + dy][x + dx] !== PAL.ink)) g[y][x] = PAL.ink;
  return g;
}
const BARE: Record<Word, (string | null)[][]> = { power: bareGlyph('power'), fire: bareGlyph('fire'), frost: bareGlyph('frost'), lightning: bareGlyph('lightning'), poison: bareGlyph('poison') };
const GLYPH_SMALL = BARE.power;
/** HE MAKES IT (his words: “have him like create it not just pull it out of thin air”): over his writing, `p` from 0 to 1, his pink
 * gathers out of the air into his raised claw, a spark swelling there; then a beam of it reaches out from his claw and writes the
 * symbol on the air, stroke by stroke, at (X, Y), the fresh strokes white-hot and cooling to the word's colours, sparks thrown off
 * where it writes; written, it flares, and hangs there burning (`held` seconds) until he throws it. (fx, fy) is his claw's tip. */
function writeRune(s: Px, word: Word, X: number, Y: number, fx: number, fy: number, p: number, held: number, t: number, K = RUNE_K): void {
  const GATHER = 0.22;
  const rows = GLYPH[word];
  const n = rows.length, half = (n * K) / 2;
  const order = strokeOrder(rows);
  const fr = Math.floor(t * 30);
  const spark = (x: number, y: number, r: number, a: number): void => {
    for (let yy = -Math.ceil(r); yy <= Math.ceil(r); yy++) for (let xx = -Math.ceil(r); xx <= Math.ceil(r); xx++) {
      const q = Math.hypot(xx, yy) / Math.max(0.6, r);
      if (q <= 1) mix(s, Math.round(x + xx), Math.round(y + yy), q < 0.45 ? RUNE_HOT : RUNE_PINK, a * (q < 0.45 ? 1 : 0.85 * (1 - q * 0.5)));
    }
  };
  if (p < GATHER) {
    // (gathering: his pink and the word's colour drawn in out of the air, spiralling into his claw; a spark swelling there)
    const g = p / GATHER;
    for (let i = 0; i < 16; i++) {
      const ph = g * 1.7 - (i / 16) * 0.7;
      if (ph <= 0 || ph >= 1) continue;
      const a = i * 2.39 + ph * 3.2;
      const r = 34 * (1 - ph) * (0.8 + 0.4 * ((i * 37) % 7) / 7);
      const x = fx + Math.cos(a) * r, y = fy + Math.sin(a) * r * 0.75;
      const c = i % 3 === 0 ? WORD_COLOR[word] : RUNE_PINK;
      mix(s, Math.round(x), Math.round(y), c, 0.95);
      if (i % 2 === 0) mix(s, Math.round(x - Math.cos(a) * 2), Math.round(y - Math.sin(a) * 1.5), c, 0.45);
    }
    spark(fx, fy, 0.8 + 2.4 * g, 0.9);
    return;
  }
  const w = Math.min(1, (p - GATHER) / (1 - GATHER));
  const lit = w * order.length;
  // (a haze of his pink about what is written)
  const R = half + 7;
  for (let yy = -R; yy <= R; yy++) for (let xx = -R; xx <= R; xx++) {
    const q = Math.hypot(xx, yy) / R;
    if (q < 1) mix(s, Math.round(X + xx), Math.round(Y + yy), RUNE_PINK, (0.1 + 0.12 * Math.min(1, held * 4)) * w * (1 - q) * (1 - q));
  }
  // (written, it flares white for a moment)
  const flare = held > 0 && held < 0.1;
  stamp(s, flare ? bareGlyph(word, order.length + 1.2 - held * 30, K) : bareGlyph(word, held > 0 ? Infinity : lit, K), X, Y, 1);
  if (w < 1) {
    // (the beam: from his claw to where it writes, flickering; dimmer while his claw is lifted between strokes)
    const i = Math.min(order.length - 1, Math.floor(lit));
    const a0 = order[Math.max(0, i - 1)], a1 = order[i];
    const f = lit - i;
    const cx = (a1.lift ? a1.x : a0.x + (a1.x - a0.x) * f) * K + K / 2 + 1, cy = (a1.lift ? a1.y : a0.y + (a1.y - a0.y) * f) * K + K / 2 + 1;
    const px = Math.round(X - half - 1 + cx), py = Math.round(Y - half - 1 + cy);
    const steps = Math.max(1, Math.ceil(Math.hypot(px - fx, py - fy)));
    for (let k = 0; k <= steps; k++) {
      const u = k / steps;
      const wob = Math.sin(u * 9 + fr * 1.7) * 0.8 * Math.sin(Math.PI * u);
      const bx = Math.round(fx + (px - fx) * u + wob), by = Math.round(fy + (py - fy) * u - wob);
      if (((k + fr) % 5) === 0) continue;
      mix(s, bx, by, (k + fr) % 3 === 0 ? RUNE_HOT : RUNE_PINK, a1.lift ? 0.4 : 0.9);
    }
    spark(fx, fy, 1.6, 0.9);
    spark(px, py, 2.2, 1);
    // (sparks thrown off where it writes)
    for (let k = 0; k < 6; k++) {
      const h = Math.sin((fr * 7 + k * 13) * 12.9898) * 43758.5453;
      const r = (h - Math.floor(h));
      const a = r * Math.PI * 2, d = 3 + 6 * ((k * 0.37 + r * 3) % 1);
      mix(s, Math.round(px + Math.cos(a) * d), Math.round(py + Math.sin(a) * d - 1), k % 2 ? RUNE_PINK : WORD_GLOW[word], 0.9);
    }
  }
}
/** Where a rune hangs as he writes it (out before his raised claw, above it: on the floor's own place, so it stays put while his
 * hand works), and his claw's tip `t` seconds in; both as picture places from the move's floor point. */
function runeSpot(move: string, tw: number, from: V2, dir: number): [number, number] {
  const h = skeletonAt(mob, move, tw).handL;
  return at([from[0] + dir * (h[0] + 9), from[1] + dir * h[1], h[2] + 15]);
}
function clawTip(move: string, t: number, from: V2, dir: number): [number, number] {
  const h = skeletonAt(mob, move, t).handL;
  return at([from[0] + dir * (h[0] + 1.5), from[1] + dir * h[1], h[2] + 1.5]);
}
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
/** A painting laid only where the frame has changed since `was` (where a figure has just been drawn): what is nearer the eye than
 * the figure, over it. */
function layOver(s: Px, was: Uint8ClampedArray, p: { px: Px }, can: { ax: number; ay: number }, ox: number, oy: number): void {
  const x0 = Math.round(ox - can.ax), y0 = Math.round(oy - can.ay);
  for (let y = 0; y < p.px.h; y++) for (let x = 0; x < p.px.w; x++) {
    const X = x0 + x, Y = y0 + y;
    if (X < 0 || Y < 0 || X >= s.w || Y >= s.h) continue;
    const i = (Y * s.w + X) * 4;
    if (s.d[i] === was[i] && s.d[i + 1] === was[i + 1] && s.d[i + 2] === was[i + 2]) continue;
    const c = p.px.get(x, y);
    if (c) s.set(X, Y, c);
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
const FIRE_GLYPH = BARE.fire;
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
    const [x, y] = runeSpot('flame', FIRE.write[1], from, dir);
    const [fx, fy] = clawTip('flame', t, from, dir);
    writeRune(s, 'fire', ox + x, oy + y, ox + fx, oy + fy, Math.min(1, (t - FIRE.write[0]) / (FIRE.write[1] - FIRE.write[0])), Math.max(0, t - FIRE.write[1]), t);
  } else if (t > FIRE.cast && t < FIRE.cast + 0.3) {
    // (fired straight up into the sky, out of sight, a streak of fire behind it)
    const [x0, y0] = runeSpot('flame', FIRE.write[1], from, dir);
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
const FROST_GLYPH = BARE.frost;
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
    const [x, y] = runeSpot('frost', FROST.write[1], from, dir);
    const [fx, fy] = clawTip('frost', t, from, dir);
    writeRune(s, 'frost', ox + x, oy + y, ox + fx, oy + fy, Math.min(1, (t - FROST.write[0]) / (FROST.write[1] - FROST.write[0])), Math.max(0, t - FROST.write[1]), t);
  } else if (t > s0 && t <= hit) {
    // (driven down into the floor with his staff: two frames, smeared)
    const [x0, y0] = runeSpot('frost', FROST.write[1], from, dir);
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
const BOLT_GLYPH = BARE.lightning;
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
    const [x, y] = runeSpot('lightning', BOLT.write[1], from, dir);
    const [fx, fy] = clawTip('lightning', t, from, dir);
    writeRune(s, 'lightning', ox + x, oy + y, ox + fx, oy + fy, Math.min(1, (t - BOLT.write[0]) / (BOLT.write[1] - BOLT.write[0])), Math.max(0, t - BOLT.write[1]), t);
  } else if (t > BOLT.cast && t < BOLT.crack) {
    const [x0, y0] = runeSpot('lightning', BOLT.write[1], from, dir);
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
/** How bright a great bolt is, frame by frame from its stroke: it strikes, flickers out, strikes again, and fades. */
const SKY_FLICKER = [1, 0.9, 0.12, 1, 0.65, 0, 0.45, 0.22, 0.08];
/** A GREAT BOLT out of the sky onto (`x1`, `y1`): one channel, jagged at every scale (halved and kicked aside, again and again), its
 * forks off it reaching down and out, forking again; a white-hot core a pixel or two wide, his Lightning's yellow round it, his pink
 * glow round that; the floor flashing where it lands. `seed` keeps one strike's channel the same through its flicker; `b` how
 * bright (its forks show only at its brightest). */
function skyBolt(s: Px, x1: number, y1: number, seed: number, b: number): void {
  if (b <= 0) return;
  let q = seed >>> 0;
  const rnd = (): number => { q = (q + 0x6d2b79f5) >>> 0; let z = q; z = Math.imul(z ^ (z >>> 15), z | 1); z ^= z + Math.imul(z ^ (z >>> 7), z | 61); return ((z ^ (z >>> 14)) >>> 0) / 4294967296; };
  const jag = (a: [number, number], c: [number, number], rough: number): [number, number][] => {
    const L = Math.hypot(c[0] - a[0], c[1] - a[1]);
    if (L < 5) return [a, c];
    const nx = -(c[1] - a[1]) / L, ny = (c[0] - a[0]) / L, d = (rnd() - 0.5) * L * rough;
    const m: [number, number] = [(a[0] + c[0]) / 2 + nx * d, (a[1] + c[1]) / 2 + ny * d];
    return [...jag(a, m, rough).slice(0, -1), ...jag(m, c, rough)];
  };
  const main = jag([x1 + 20 + 70 * rnd(), -20], [x1, y1], 0.42);
  const lines: { pts: [number, number][]; w: number }[] = [{ pts: main, w: 1 }];
  if (b > 0.8) {
    for (let n = 0; n < 7; n++) {
      const i0 = Math.floor(main.length * (0.1 + 0.7 * rnd()));
      const from = main[i0], dir = Math.atan2(main[Math.min(main.length - 1, i0 + 3)][1] - from[1], main[Math.min(main.length - 1, i0 + 3)][0] - from[0]);
      const ang = dir + (rnd() < 0.5 ? -1 : 1) * (0.4 + 0.6 * rnd()), L = 30 + 80 * rnd();
      const br = jag(from, [from[0] + Math.cos(ang) * L, from[1] + Math.sin(ang) * L], 0.5);
      lines.push({ pts: br, w: 0.5 });
      if (rnd() < 0.6) {
        const j0 = Math.floor(br.length * (0.3 + 0.4 * rnd())), f2 = br[j0], a2 = ang + (rnd() < 0.5 ? -1 : 1) * (0.3 + 0.5 * rnd()), L2 = 12 + 30 * rnd();
        lines.push({ pts: jag(f2, [f2[0] + Math.cos(a2) * L2, f2[1] + Math.sin(a2) * L2], 0.5), w: 0.3 });
      }
    }
  }
  // (each layer's pixels taken once, so glow does not stack up where lines cross)
  const layer = (r: number, pick: (w: number) => number): Map<number, number> => {
    const m = new Map<number, number>();
    for (const ln of lines) {
      const rr = r * (ln.w < 1 ? 0.6 : 1), a0 = pick(ln.w);
      for (let i = 1; i < ln.pts.length; i++) {
        const [ax, ay] = ln.pts[i - 1], [cx, cy] = ln.pts[i], n = Math.max(1, Math.ceil(Math.hypot(cx - ax, cy - ay)));
        for (let j = 0; j <= n; j++) {
          const X = ax + ((cx - ax) * j) / n, Y = ay + ((cy - ay) * j) / n;
          for (let dy = -Math.ceil(rr); dy <= Math.ceil(rr); dy++) for (let dx = -Math.ceil(rr); dx <= Math.ceil(rr); dx++) {
            const d = Math.hypot(dx, dy);
            if (d > rr + 0.01) continue;
            const key = Math.round(Y + dy) * 100000 + Math.round(X + dx), v = a0 * (rr > 1.5 ? 1 - d / (rr + 1) : 1);
            if ((m.get(key) ?? 0) < v) m.set(key, v);
          }
        }
      }
    }
    return m;
  };
  const put = (m: Map<number, number>, c: string): void => { for (const [key, v] of m) { const Y = Math.floor(key / 100000), X = key - Y * 100000; mix(s, X, Y, c, Math.min(1, v * b)); } };
  put(layer(9, (w) => (w < 1 ? 0.12 : 0.22)), FLAME[2]);
  put(layer(3.2, (w) => (w < 1 ? 0.5 : 0.8)), PAL.lt3);
  put(layer(1.2, (w) => (w < 1 ? 0.55 : 1)), PAL.lt4);
  put(layer(0.5, () => 1), '#ffffff');
  // (the floor flashing where it lands)
  for (let dy = -14; dy <= 14; dy++) for (let dx = -30; dx <= 30; dx++) {
    const q2 = Math.hypot(dx / 30, dy / 14);
    if (q2 < 1) mix(s, Math.round(x1 + dx), Math.round(y1 + dy), q2 < 0.35 ? '#ffffff' : PAL.lt4, 0.75 * b * (1 - q2));
  }
}
const SPORE_GLYPH = BARE.poison;
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
    const [x, y] = runeSpot('poison', SPORE.write[1], from, dir);
    const [fx, fy] = clawTip('poison', t, from, dir);
    writeRune(s, 'poison', ox + x, oy + y, ox + fx, oy + fy, Math.min(1, (t - SPORE.write[0]) / (SPORE.write[1] - SPORE.write[0])), Math.max(0, t - SPORE.write[1]), t);
  } else if (t > SPORE.cast && t < SPORE.burst) {
    const [x0, y0] = runeSpot('poison', SPORE.write[1], from, dir);
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
    const [x, y] = runeSpot('power', POWER.write[1], from, dir);
    const [fx, fy] = clawTip('power', t, from, dir);
    writeRune(s, 'power', ox + x, oy + y, ox + fx, oy + fy, Math.min(1, (t - POWER.write[0]) / (POWER.write[1] - POWER.write[0])), Math.max(0, t - POWER.write[1]), t);
  }

  // (the rune he flings: flying from his hand up over the hero, and bursting there; out of the burst, the hammer)
  if (t > POWER.cast && t < POWER.cast + 0.5) {
    const [hx0, hy0] = runeSpot('power', POWER.write[1], from, dir);
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
/** ITS DEATH ON THE FLOOR: where it hit and slid on its side, the floor ploughed dark down the middle, frost thrown up white at
 * its edges; where his boots slid as he landed, two streaks of frost. */
function scrape(s: Px, t: number, ox: number, oy: number, from: V2, dir: number): void {
  const hit = FALL.kill + 0.2;
  if (t < hit) return;
  const a0 = fallCarry(hit) * TILE + 6, a1 = fallCarry(t) * TILE + 30;
  for (let x = a0; x <= a1; x += 1.2) {
    const fade = 0.6 + 0.4 * Math.min(1, (x - a0) / 60);
    for (let j = -20; j <= 20; j++) {
      const side = j / 20;
      const wob = Math.sin(x * 0.21 + j * 1.7) * 0.5 + 0.5;
      const [px, py] = at([from[0] + dir * x, from[1] + dir * (side * 0.62 * TILE - 4), 0]);
      if (Math.abs(side) > 0.78) mix(s, Math.round(ox + px), Math.round(oy + py), '#c4d4e4', (0.35 + 0.3 * wob) * fade);
      else if (Math.abs(side) < 0.6) mix(s, Math.round(ox + px), Math.round(oy + py), '#0e0b10', (0.3 + 0.2 * wob) * fade);
    }
  }
  const land = FALL.kill + FALL.throw + FALL.fly;
  if (t < land) return;
  const sk0 = skeletonAt(mob, 'fall', land), sk = skeletonAt(mob, 'fall', Math.min(t, land + FALL.slide));
  for (const [a, b] of [[sk0.heelL, sk.heelL], [sk0.heelR, sk.heelR]] as const) {
    const xa = a[0] + fallCarry(land) * TILE, xb = b[0] + fallCarry(Math.min(t, land + FALL.slide)) * TILE;
    for (let x = xa; x <= xb; x += 1) for (const dy of [-1.2, 0, 1.2]) {
      const [px, py] = at([from[0] + dir * x, from[1] + dir * (a[1] + dy), 0]);
      mix(s, Math.round(ox + px), Math.round(oy + py), dy ? '#93a8c0' : '#eef4fa', dy ? 0.35 : 0.6);
    }
  }
}
/** HIS SLAM ON THE FLOOR: where his staff strikes, the floor cracked out from it, the cracks glowing his pink and cooling; his ring
 * rolling out over the whole floor, a bright edge with the floor heaved and darkened behind it, thinning as it goes; where the boar
 * lay, a scorch of its ash once it has blown away. */
function slamFloor(s: Px, t: number, ox: number, oy: number, from: V2, dir: number): void {
  if (t < FALL.slam) return;
  const c = fallCarry(t) * TILE;
  const a0 = slamAt();
  const P = (x: number, y: number): [number, number] => {
    const [px, py] = at([from[0] + dir * (c + x), from[1] + dir * y, 0]);
    return [Math.round(ox + px), Math.round(oy + py)];
  };
  // (the scorch where it lay)
  const fade = Math.min(1, (t - FALL.slam - 0.25) / 0.4);
  if (fade > 0) for (let yy = -16; yy <= 16; yy++) for (let xx = -38; xx <= 34; xx++) {
    const q = Math.hypot(xx / 38, yy / 16);
    if (q >= 1) continue;
    const [x, y] = P(xx, yy * 1.4);
    mix(s, x, y, (xx * 7 + yy * 13) % 5 === 0 ? '#5e585c' : '#141014', 0.45 * fade * (1 - q * q));
  }
  // (cracks out from where it struck, glowing and cooling)
  const cool = Math.min(1, (t - FALL.slam) / 1.2);
  for (let k = 0; k < 9; k++) {
    let ang = (k / 9) * Math.PI * 2 + 0.4 * Math.sin(k * 3.1);
    let x = a0[0], y = a0[1];
    const long = (26 + 22 * ((k * 0.618) % 1)) * Math.min(1, (t - FALL.slam) / 0.12);
    for (let d = 0; d < long; d += 1) {
      ang += 0.35 * Math.sin(d * 0.6 + k);
      x += Math.cos(ang);
      y += Math.sin(ang);
      const [px, py] = P(x, y);
      mix(s, px, py, '#0e0b10', 0.8);
      if (d < long * 0.7) mix(s, px, py - 1, '#ff4f8a', 0.6 * (1 - cool));
    }
  }
  // (the ring)
  const r = slamRing(t);
  const u = (t - FALL.slam) / FALL.ring.long;
  if (u > 0 && u < 1.15) {
    const a = u < 1 ? 1 - 0.6 * u : (1.15 - u) / 0.15 * 0.4;
    for (let i = 0; i < 480; i++) {
      const ang = (i / 480) * Math.PI * 2;
      for (let w = -10; w <= 3; w += 1) {
        const [px, py] = P(a0[0] + Math.cos(ang) * (r + w), a0[1] + Math.sin(ang) * (r + w));
        if (w > -2) mix(s, px, py, w > 0 ? '#ffd0e0' : '#ff4f8a', 0.85 * a);
        else mix(s, px, py, '#2a0a18', 0.35 * a * (1 + w / 10));
      }
    }
  }
}
/** A MELD (his words: “he forges a word, as he would in phase one, the shade also phases a word, and they meld into the new
 * attack”): he writes his word at his hand; his shade, a moment after him, writes the other at its great hand; his staff thrust
 * high, the two fly up and meet over him, wheel round each other faster and faster and MELD in a flash into the meld's own rune,
 * blazing; the slam drives it down into the floor where it goes in. (`under`: what is laid under him; else, over him.) */
function meldScene(s: Px, t: number, ox: number, oy: number, from: V2, dir: number, mv: string, mine: Word, its: Word, meldRows: readonly string[], meldCols: [string, string], into: V3, under: boolean, sky = false): void {
  const W3 = (p: V3): [number, number] => { const [x, y] = at([from[0] + dir * p[0], from[1] + dir * p[1], p[2]]); return [ox + x, oy + y]; };
  const skAt = (tt: number) => skeletonAt(mob, mv, Math.max(0, tt));
  const O = (sk: ReturnType<typeof skAt>): V3 => [sk.pelvis[0], sk.pelvis[1], 0];
  const great = (sk: ReturnType<typeof skAt>, p: V3): V3 => { const o = O(sk); return [o[0] + (p[0] - o[0]) * SHADE.size - SHADE.behind, o[1] + (p[1] - o[1]) * SHADE.size + SHADE.side, (p[2]) * SHADE.size + SHADE.up]; };
  const spotOf = (h: V3): V3 => [h[0] + 9, h[1], h[2] + 15];
  const mySpot = spotOf(skAt(MELD.write[1]).handL);
  const itsSpot = great(skAt(MELD.write[1]), spotOf(skAt(MELD.write[1]).handL));
  const M: V3 = [8, -4, 112];
  if (under) {
    // (where it went in: the floor split, a fissure racing out along each way, molten in its depths, his pink at its heart; cooling
    // after the last vent has blown)
    if (t < MELD.slam || sky || mv !== 'eruption') return;
    const race = eruptRace(t);
    const last = Math.max(...ERUPT_VENTS.map((v) => v.t));
    const cool = Math.min(1, Math.max(0, (t - last - 0.6) / 1.6));
    for (const [f, deg] of ERUPT.fans.entries()) {
      const a = (deg * Math.PI) / 180;
      const L = race * ERUPT.long * TILE;
      for (let d = 0; d < L; d += 0.7) {
        const wob = Math.sin(d * 0.31 + f * 2) * 3 + Math.sin(d * 0.9 + f) * 1.2;
        const x = into[0] + Math.cos(a) * d - Math.sin(a) * wob, y = into[1] + Math.sin(a) * d + Math.cos(a) * wob;
        const w = 1.8 + 1.2 * Math.sin(d * 0.2 + f);
        for (let q = -w - 1.5; q <= w + 1.5; q += 0.7) {
          const [px, py] = W3([x - Math.sin(a) * q, y + Math.cos(a) * q, 0]);
          const edge = Math.abs(q) > w;
          const heart = Math.abs(q) < 0.6;
          const c = edge ? '#140808' : heart ? (cool < 0.5 ? '#ff4f8a' : '#4a1208') : cool < 0.6 ? (d % 9 < 4 ? '#ffb43a' : '#c25a12') : '#2a0e0a';
          mix(s, Math.round(px), Math.round(py), c, edge ? 0.7 : 0.9 - 0.4 * cool);
        }
      }
    }
    return;
  }
  // (his rune, written at his hand; the shade's, a moment after, at its great hand, twice the size)
  const myHeld = Math.max(0, t - MELD.write[1]);
  if (t > MELD.write[0] && t <= MELD.up) {
    const [x, y] = W3(mySpot);
    const [fx, fy] = W3([skAt(t).handL[0] + 1.5, skAt(t).handL[1], skAt(t).handL[2] + 1.5]);
    writeRune(s, mine, x, y, fx, fy, Math.min(1, (t - MELD.write[0]) / (MELD.write[1] - MELD.write[0])), myHeld, t);
  }
  const tl = t - SHADE.lag;
  if (tl > MELD.write[0] && t <= MELD.up + SHADE.lag * 0.5) {
    const [x, y] = W3(itsSpot);
    const h = great(skAt(tl), skAt(tl).handL);
    const [fx, fy] = W3(h);
    writeRune(s, its, x, y, fx, fy, Math.min(1, (tl - MELD.write[0]) / (MELD.write[1] - MELD.write[0])), Math.max(0, tl - MELD.write[1]), t, RUNE_K * 2);
  }
  // (up, and meeting over him: wheeling round each other faster and faster, closing)
  if (t > MELD.up && t < MELD.melded) {
    const u = Math.min(1, (t - MELD.up) / (MELD.meet - MELD.up));
    const e = u * u * (3 - 2 * u);
    const lift = (a: V3): V3 => [a[0] + (M[0] - a[0]) * e, a[1] + (M[1] - a[1]) * e, a[2] + (M[2] - a[2]) * e + 30 * Math.sin(Math.PI * u)];
    let pa = lift(mySpot), pb = lift(itsSpot);
    if (t > MELD.meet) {
      const w = (t - MELD.meet) / (MELD.melded - MELD.meet);
      const r = 16 * (1 - w);
      const th = 18 * w * w + 2;
      pa = [M[0] + Math.cos(th) * r, M[1] + Math.sin(th) * r, M[2] + Math.sin(th) * r * 0.4];
      pb = [M[0] - Math.cos(th) * r, M[1] - Math.sin(th) * r, M[2] - Math.sin(th) * r * 0.4];
      // (sparks thrown off them as they close)
      for (let i = 0; i < 10; i++) {
        const a2 = i * 2.4 + t * 13;
        const [qx, qy] = W3([M[0] + Math.cos(a2) * (r + 6 + (i % 3) * 3), M[1] + Math.sin(a2) * (r + 6), M[2] + Math.sin(a2 * 1.3) * 8]);
        mix(s, Math.round(qx), Math.round(qy), i % 2 ? '#ff4f8a' : '#fffbe8', 0.9);
      }
    }
    const ga = bareGlyph(mine), gb = bareGlyph(its, Infinity, RUNE_K + 2);
    const [xa, ya] = W3(pa), [xb, yb] = W3(pb);
    stamp(s, gb, xb, yb, 1);
    stamp(s, ga, xa, ya, 1);
  }
  // (MELDED: a flash of white and his pink, and the meld's own rune blazing where they met; driven down into the floor by the slam)
  const big = 5;
  const meldGlyph = bareGlyph('power', Infinity, big, meldRows, meldCols);
  const [mx, my] = W3(M);
  if (t >= MELD.melded && t < MELD.melded + 0.22) {
    const b = (t - MELD.melded) / 0.22;
    for (let yy = -40; yy <= 40; yy++) for (let xx = -40; xx <= 40; xx++) {
      const q = Math.hypot(xx, yy) / (14 + 30 * b);
      if (q < 1) mix(s, Math.round(mx + xx), Math.round(my + yy), q < 0.5 ? '#fffbe8' : '#ff4f8a', 0.85 * (1 - b) * (1 - q));
    }
  }
  if (t >= MELD.melded && t <= MELD.slam - 2 / 30 + 1e-6) {
    // (blazing: a haze of his pink about it, throbbing)
    const R = 30;
    for (let yy = -R; yy <= R; yy++) for (let xx = -R; xx <= R; xx++) {
      const q = Math.hypot(xx, yy) / R;
      if (q < 1) mix(s, Math.round(mx + xx), Math.round(my + yy), '#ff4f8a', (0.16 + 0.08 * Math.sin(t * 30)) * (1 - q) * (1 - q));
    }
    stamp(s, meldGlyph, mx, my, 1);
  } else if (sky && t > MELD.slam - 2 / 30 && t < MELD.slam + 0.3) {
    // (flung straight up out of sight by the slam, a streak of it behind)
    const u = (t - (MELD.slam - 2 / 30)) / (0.3 + 2 / 30);
    for (let k2 = 0; k2 < 8; k2++) stamp(s, meldGlyph, mx, my - 520 * u * u - 80 * u + 12 * k2, k2 === 0 ? 1 : 0.45 / k2);
  } else if (!sky && t > MELD.slam - 2 / 30 && t <= MELD.slam + 1 / 30) {
    // (driven down: two frames, smeared)
    const u = Math.min(1, (t - (MELD.slam - 2 / 30)) / (2 / 30));
    const [ix, iy] = W3(into);
    for (let k2 = 0; k2 < 6; k2++) {
      const v = Math.max(0, u - k2 * 0.12);
      stamp(s, meldGlyph, mx + (ix - mx) * v, my + (iy - my) * v, k2 === 0 ? 1 : 0.4 / k2);
    }
  }
  if (!sky && t > MELD.slam && t < MELD.slam + 0.4) {
    // (where it went in: a flash of the meld's colour and his pink, a ring of it thrown out)
    const b = (t - MELD.slam) / 0.4;
    const [ix, iy] = W3(into);
    for (let yy = -26; yy <= 26; yy++) for (let xx = -40; xx <= 40; xx++) {
      const q = Math.hypot(xx / 40, yy / 26);
      if (q < 1) mix(s, ix + xx, iy + yy, q < 0.35 ? '#fff0b0' : q < 0.7 ? meldCols[0] : '#ff4f8a', 0.8 * (1 - b) * (1 - q));
    }
  }
}
/** THE AVALANCHE ON THE FLOOR: the lane it will take rimed white first, racing out from where the rune went in, its edges his pink;
 * behind the wave, the snow it leaves, thawing. */
/** About where his shade stands on the floor (his own lengths): the avalanche's snow is laid in slices about it. */
const AVAL_SHADE_AT: V3 = [-SHADE.behind, SHADE.side, 0];
function avalFloor(s: Px, t: number, ox: number, oy: number, from: V2, dir: number): void {
  const P = (x: number, y: number): [number, number] => { const [px, py] = at([from[0] + dir * x, from[1] + dir * y, 0]); return [Math.round(ox + px), Math.round(oy + py)]; };
  const W = (x: number, y: number, z: number): [number, number] => { const [px, py] = at([from[0] + dir * x, from[1] + dir * y, z]); return [Math.round(ox + px), Math.round(oy + py)]; };
  // (the room: its floor's edge and the dark beyond; its two back walls standing, dark stone, lit along their tops)
  for (let yy = 0; yy < s.h; yy++) for (let xx = 0; xx < s.w; xx++) {
    const wx = ((xx - ox) / 0.816 + (yy - oy) / 0.408) / 2, wy = ((xx - ox) / 0.816 - (yy - oy) / 0.408) / 2;
    const fx = dir * (wx - from[0]) / TILE, fy = dir * (wy - from[1]) / TILE;
    if (fx < ARENA.x[0] || fx > ARENA.x[1] || fy < ARENA.y[0] || fy > ARENA.y[1]) mix(s, xx, yy, '#06040a', 0.75);
  }
  const X0 = ARENA.x[0] * TILE, Y1 = ARENA.y[1] * TILE;
  const rumble = Math.max(0, Math.min(1, (t - MELD.slam - AVAL.rumble[0]) / (AVAL.rumble[1] - AVAL.rumble[0])));
  for (let y = ARENA.y[0] * TILE; y <= Y1; y += 0.8) for (let z = 0; z <= 70; z += 0.8) {
    const [px, py] = W(X0, y, z);
    // (stone, in courses; frost creeping over it as it rumbles)
    const frost = rumble > 0 && (((Math.floor(y * 1.7) * 7 + Math.floor(z * 1.3) * 13) % 23) + 23) % 23 < 2.5 * rumble;
    mix(s, px, py, z > 67 ? '#5a4a60' : frost ? '#a5c6d7' : (Math.floor(y / 12) + Math.floor(z / 9)) % 2 ? '#241c2a' : '#2c2232', 1);
  }
  for (let x = X0; x <= ARENA.x[1] * TILE; x += 0.8) for (let z = 0; z <= 70; z += 0.8) {
    const [px, py] = W(x, Y1, z);
    mix(s, px, py, z > 67 ? '#5a4a60' : (Math.floor(x / 12) + Math.floor(z / 9)) % 2 ? '#2a2230' : '#322838', 1);
  }
  // (snow sifting out of the wall's cracks as it rumbles, more and more)
  if (rumble > 0 && t < AVAL_OUT()) for (let i = 0; i < 80 * rumble; i++) {
    const y = ARENA.y[0] * TILE + (Y1 - ARENA.y[0] * TILE) * ((i * 0.618) % 1);
    const u = (t * 1.5 + i * 0.37) % 1;
    const [px, py] = W(X0 + 3, y, 60 * (1 - u));
    mix(s, px, py, '#e2f0f8', 0.9);
  }
  if (t < MELD.slam) return;
  // (THE WARNING: the whole floor in the colour of every boss's warning on the ground (his words, 13 Nov 2026: “I’m gonna color to be
  // red or pink cause whatever you use for normal hit box warnings on the ground”: the bosses' warnings' own, art/mkit.ts FLAME[2],
  // the safe strip's edge in its hot gold), but the one safe strip (not his ground: “he’s fine”); throbbing; gone as the tail passes)
  const on = Math.min(1, Math.max(0, (t - MELD.slam - AVAL.red[0]) / (AVAL.red[1] - AVAL.red[0])));
  const Tl = avalTail(t);
  const throb = 0.75 + 0.25 * Math.sin(t * 12);
  for (let x = ARENA.x[0] * TILE; x <= ARENA.x[1] * TILE; x += 1.2) for (let y = ARENA.y[0] * TILE; y <= Y1; y += 1.2) {
    if (x < Tl) continue;
    const [px, py] = P(x, y);
    if (avalSpared(x, y)) {
      if (!avalSpared(x, y, -2.5)) mix(s, px, py, '#ffb070', 0.85 * on);
      continue;
    }
    mix(s, px, py, '#ff4f8a', 0.3 * on * throb);
  }
}
/** WHERE THE HERO IS in Fumes' film (his own lengths): at first in the way of a cloud as it vents; as it spreads over him he gets
 * out of it, to clear ground between the clouds, and stands there as they go up. */
const FUMES_HERO = ((): { from: [number, number, number]; to: [number, number, number]; at: number } => {
  const to: [number, number, number] = [5.0 * TILE, -1.6 * TILE, 0];
  let best = FUMES_CLOUDS[0], bd = Infinity;
  for (const c of FUMES_CLOUDS) { const d = Math.hypot(c.at[0] - to[0], c.at[1] - to[1]) - c.R; if (d < bd) { bd = d; best = c; } }
  const dx = to[0] - best.at[0], dy = to[1] - best.at[1], dl = Math.hypot(dx, dy) || 1;
  return { from: [best.at[0] + (dx / dl) * best.R * 0.62, best.at[1] + (dy / dl) * best.R * 0.62, 0], to, at: best.vent + 0.62 };
})();
function fumesHeroAt(t: number): [number, number, number] {
  const u = Math.min(1, Math.max(0, (t - FUMES_HERO.at) / 0.3)), e = u * u * (3 - 2 * u), { from: a, to: b } = FUMES_HERO;
  return [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, 0];
}
/** Soft puffs heaped up into one thickness over the picture and drawn in bands, as pixel art draws smoke (the steam's way): each puff
 * lit from above-left, shadowed under; `paint` gives each pixel its colour from how thick it is there and how lit. */
let puffBuf = new Float32Array(0), puffLit = new Float32Array(0);
function puffPass(s: Px, puffs: { X: number; Y: number; R: number; v: number; seed: number }[], t: number, paint: (d: number, L: number, x: number, y: number) => [string, number] | null): void {
  if (!puffs.length) return;
  if (puffBuf.length !== s.w * s.h) { puffBuf = new Float32Array(s.w * s.h); puffLit = new Float32Array(s.w * s.h); }
  let x0 = s.w, y0 = s.h, x1 = 0, y1 = 0;
  for (const p of puffs) { x0 = Math.min(x0, Math.max(0, Math.floor(p.X - p.R * 1.2))); x1 = Math.max(x1, Math.min(s.w - 1, Math.ceil(p.X + p.R * 1.2))); y0 = Math.min(y0, Math.max(0, Math.floor(p.Y - p.R * 1.2))); y1 = Math.max(y1, Math.min(s.h - 1, Math.ceil(p.Y + p.R * 1.2))); }
  for (let y = y0; y <= y1; y++) puffBuf.fill(0, y * s.w + x0, y * s.w + x1 + 1), puffLit.fill(0, y * s.w + x0, y * s.w + x1 + 1);
  for (const p of puffs) {
    for (let yy = Math.max(0, Math.floor(p.Y - p.R * 1.2)); yy <= Math.min(s.h - 1, Math.ceil(p.Y + p.R * 1.2)); yy++) for (let xx = Math.max(0, Math.floor(p.X - p.R * 1.2)); xx <= Math.min(s.w - 1, Math.ceil(p.X + p.R * 1.2)); xx++) {
      const dx = xx - p.X, dy = yy - p.Y, a = Math.atan2(dy, dx);
      const q = Math.hypot(dx, dy) / (p.R * (1 + 0.09 * Math.sin(a * 3 + t * 2.5 + p.seed) + 0.05 * Math.sin(a * 6 - t * 3 + p.seed * 2)));
      if (q >= 1) continue;
      const k = yy * s.w + xx, v = (1 - q * q) * p.v;
      puffBuf[k] += v;
      puffLit[k] += v * Math.max(0, Math.min(1, 0.62 - (0.6 * dy) / p.R - (0.25 * dx) / p.R));
    }
  }
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const k = y * s.w + x, d = puffBuf[k];
    if (d < 0.12) continue;
    const c = paint(d, puffLit[k] / d, x, y);
    if (c) mix(s, x, y, c[0], c[1]);
  }
}
/** THE FUMES ON THE FLOOR: the room; each vent cracking open; the poison spreading low under its cloud, its edge in every boss's
 * warning colour; once it has gone up, the floor under it scorched, embers dying in it. */
function fumesFloor(s: Px, t: number, ox: number, oy: number, from: V2, dir: number): void {
  roomWalls(s, ox, oy, from, dir);
  if (t < MELD.slam) return;
  const P = (x: number, y: number): [number, number] => { const [px, py] = at([from[0] + dir * x, from[1] + dir * y, 0]); return [Math.round(ox + px), Math.round(oy + py)]; };
  const throb = 0.75 + 0.25 * Math.sin(t * 12), fr = Math.floor(t * 30);
  for (const [i, c] of FUMES_CLOUDS.entries()) {
    if (t < c.vent) continue;
    const g = fumesSpread(c, t), R = c.R * Math.max(0.15, g), b = t - c.boom;
    for (let yy = -R - 4; yy <= R + 4; yy += 1.2) for (let xx = -R - 4; xx <= R + 4; xx += 1.2) {
      const r = Math.hypot(xx, yy), a = Math.atan2(yy, xx), edge = R * (1 + 0.08 * Math.sin(a * 5 + i + t));
      if (r > edge) continue;
      const [px, py] = P(c.at[0] + xx, c.at[1] + yy);
      if (b < 0) {
        mix(s, px, py, '#3e3610', 0.35);
        if (r > edge - 3) mix(s, px, py, FLAME[2], 0.65 + 0.3 * throb);
      } else {
        const fade = Math.max(0, 1 - b / 2.5), e = hash(Math.floor(xx / 2) + i * 60, Math.floor(yy / 2), 9811 + (fr >> 1));
        mix(s, px, py, '#120a08', 0.6 * fade);
        if (e > 0.94) mix(s, px, py, '#ffb43a', 0.8 * fade);
      }
    }
    // (the vent: the floor split, glowing sour yellow in its depths)
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + i;
      for (let d = 0; d < 18 * Math.min(1, (t - c.vent) / 0.2); d += 0.7) {
        const [px, py] = P(c.at[0] + Math.cos(a + Math.sin(d * 0.3) * 0.3) * d, c.at[1] + Math.sin(a + Math.sin(d * 0.3) * 0.3) * d);
        mix(s, px, py, b < 0 ? '#e0d07a' : '#1c0a08', 0.85);
      }
    }
  }
}
/** THE FUMES: each cloud rolling low over the floor as it spreads, sulphur-yellow, sour-pale where lit, olive and soot in its
 * shadows, his pink in a few bubbles in it; when it goes up, the whole of it fire (white-gold at its heart, orange, red, his pink at
 * its edge), swelling; then black smoke rolling up off it and thinning. The sparks he flings into them, arcing. Those clouds nearer
 * the eye than `split` (on the picture) or further, so the hero stands among them. */
function fumesClouds(s: Px, t: number, ox: number, oy: number, from: V2, dir: number, near: boolean, split: number): void {
  const W = (x: number, y: number, z: number): [number, number] => { const [px, py] = at([from[0] + dir * x, from[1] + dir * y, z]); return [ox + px, oy + py]; };
  const gas: { X: number; Y: number; R: number; v: number; seed: number }[] = [], fire: typeof gas = [], smoke: typeof gas = [];
  for (const [i, c] of FUMES_CLOUDS.entries()) {
    if (t < c.vent) continue;
    if ((W(c.at[0], c.at[1], 0)[1] >= split) !== near) continue;
    const g = fumesSpread(c, t), b = t - c.boom;
    for (let j = 0; j < 24; j++) {
      const a = hash(i, j, 9821) * Math.PI * 2 + t * 0.35 * (j % 2 ? 1 : -1), r = c.R * g * (0.1 + 0.78 * Math.sqrt(hash(i, j, 9822)));
      const z = 6 + 18 * hash(i, j, 9823), R0 = (21 + 13 * hash(i, j, 9824)) * (0.45 + 0.55 * g);
      if (b < 0) { const [X, Y] = W(c.at[0] + Math.cos(a) * r, c.at[1] + Math.sin(a) * r, z); gas.push({ X, Y, R: R0, v: 0.95, seed: i * 16 + j }); }
      else if (b < FUMES.boom) { const sw = 1 + 0.45 * (b / FUMES.boom); const [X, Y] = W(c.at[0] + Math.cos(a) * r * sw, c.at[1] + Math.sin(a) * r * sw, z * sw + 10 * (b / FUMES.boom)); fire.push({ X, Y, R: R0 * sw * 1.1, v: 1.1, seed: i * 16 + j }); }
      if (b > FUMES.boom * 0.6 && b < FUMES.boom * 0.6 + FUMES.smoke) { const u = (b - FUMES.boom * 0.6) / FUMES.smoke; const [X, Y] = W(c.at[0] + Math.cos(a) * r * 1.3, c.at[1] + Math.sin(a) * r * 1.3, z + 30 + 70 * u); smoke.push({ X, Y, R: R0 * (1.2 + 0.5 * u), v: 0.9 * (1 - u), seed: i * 16 + j }); }
    }
  }
  puffPass(s, smoke, t, (d, L, x, y) => (d < 0.2 ? ((x + y) % 2 ? null : ['#2a2428', 0.35]) : [L > 0.55 ? '#5a4e52' : L > 0.3 ? '#3a3236' : '#241e22', d > 0.6 ? 0.85 : 0.6]));
  puffPass(s, gas, t, (d, L, x, y) => {
    if (d < 0.2) return (x + y) % 2 ? null : ['#76681c', 0.4];
    if (d > 0.7 && hash(x >> 2, y >> 2, 9825 + Math.floor(t * 4)) > 0.985) return ['#ff9cc0', 0.9];
    return [L > 0.62 ? '#fbf4cc' : L > 0.45 ? '#e0d07a' : L > 0.28 ? '#b4a02c' : '#76681c', d > 0.7 ? 0.9 : 0.72];
  });
  puffPass(s, fire, t, (d, L, x, y) => {
    // (billowing fire: its heart white-hot where it is thick and lit, rolling orange and red through it, his pink at its edge)
    const n = vnoise(x * 0.07, y * 0.07 + t * 8, 9826), m = vnoise(x * 0.16, y * 0.16 - t * 11, 9827);
    const v = 0.35 * Math.min(1, d) + 0.35 * L + 0.45 * n + 0.2 * m - 0.2;
    if (d < 0.3) return ['#ff4f8a', 0.8];
    return [v > 0.95 ? '#fffbe0' : v > 0.8 ? '#fff0a0' : v > 0.65 ? '#ffb43a' : v > 0.5 ? '#ff6a1a' : v > 0.38 ? '#d8303a' : '#8a1a2a', 0.95];
  });
  if (!near) return;
  // (the sparks: out of the rune, arcing high, into a cloud not yet gone up)
  for (const c of FUMES_CLOUDS) {
    if (c.spark === null || c.spark > c.boom + 1e-6) continue;
    const u = (t - (c.spark - FUMES.fly)) / FUMES.fly;
    if (u < 0 || u > 1) continue;
    const pos = (v: number): [number, number] => W(FUMES.at * TILE + (c.at[0] - FUMES.at * TILE) * v, c.at[1] * v, 30 + 100 * Math.sin(v * Math.PI) - 10 * v);
    for (let k = 8; k >= 0; k--) {
      const [X, Y] = pos(Math.max(0, u - k * 0.03)), r = k === 0 ? 5 : 3.5 - k * 0.3;
      for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) { const q = Math.hypot(dx, dy) / Math.max(1, r); if (q < 1) mix(s, Math.round(X + dx), Math.round(Y + dy), q < 0.4 ? '#fffbe0' : q < 0.7 ? '#ffb43a' : '#ff4f8a', k === 0 ? 0.95 : 0.6 * (1 - k / 9)); }
    }
  }
  // (each blast lighting the room for a frame)
  for (const c of FUMES_CLOUDS) if (t >= c.boom && t < c.boom + 1 / 30) for (let yy = 0; yy < s.h; yy++) for (let xx = 0; xx < s.w; xx++) mix(s, xx, yy, '#fff0a0', 0.12);
}
/** WHERE THE HERO IS in Wildfire's film (his own lengths): standing out in the room; a spot marked under him, he dodges out of it
 * into a gap in the web, and stays there. */
const WILD_HERO: { from: [number, number, number]; to: [number, number, number] } = { from: [6.9 * TILE, 1.1 * TILE, 0], to: [5.3 * TILE, -1.0 * TILE, 0] };
function wildHeroAt(t: number): [number, number, number] {
  const d0 = WILD_NODES.find((n) => n.under)!.t - 0.2, u = Math.min(1, Math.max(0, (t - d0) / 0.25)), e = u * u * (3 - 2 * u);
  const { from: a, to: b } = WILD_HERO;
  return [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, 0];
}
/** THE WILDFIRE'S BURNING SPOTS (his own lengths): the first where the rune went in; then at random all over the room, each its own
 * moment, none near another, none where the hero stands in the end (one where he stands at first, which he dodges); each linked by
 * lightning to those near it, never across the hero's gap. */
const WILD_NODES = ((): { at: [number, number]; t: number; from: number; under?: boolean }[] => {
  const out: { at: [number, number]; t: number; from: number; under?: boolean }[] = [{ at: [WILDFIRE.at * TILE, 0], t: MELD.slam, from: -1 }];
  const gap = WILD_HERO.to, start = WILD_HERO.from;
  for (let k = 0, tries = 0; out.length < WILDFIRE.spots && tries < 4000; tries++) {
    const x = (ARENA.x[0] + 0.8 + (ARENA.x[1] - ARENA.x[0] - 1.6) * hash(tries, 1, 9731)) * TILE, y = (ARENA.y[0] + 0.8 + (ARENA.y[1] - ARENA.y[0] - 1.6) * hash(tries, 2, 9732)) * TILE;
    if (Math.hypot(x - gap[0], y - gap[1]) < 2.0 * TILE || Math.hypot(x, y) < 1.4 * TILE) continue;
    if (out.some((n) => Math.hypot(n.at[0] - x, n.at[1] - y) < 1.9 * TILE)) continue;
    out.push({ at: [x, y], t: 0, from: -1 });
    k++;
  }
  // (one under where he stands at first)
  out.push({ at: [start[0], start[1]], t: 0, from: -1, under: true });
  // (their moments, at random over the spread, the one under him early)
  const rest = out.slice(1);
  rest.forEach((n, i) => { n.t = MELD.slam + WILDFIRE.first + WILDFIRE.over * (n.under ? 0.3 : hash(i, 3, 9733)); });
  return out;
})();
const WILD_LINKS = ((): [number, number][] => {
  const out: [number, number][] = [];
  const gap = WILD_HERO.to;
  const nearSeg = (a: [number, number], b: [number, number]): number => { const dx = b[0] - a[0], dy = b[1] - a[1], u = Math.max(0, Math.min(1, ((gap[0] - a[0]) * dx + (gap[1] - a[1]) * dy) / (dx * dx + dy * dy))); return Math.hypot(a[0] + dx * u - gap[0], a[1] + dy * u - gap[1]); };
  for (let i = 0; i < WILD_NODES.length; i++) for (let j = 0; j < i; j++) {
    const a = WILD_NODES[i].at, b = WILD_NODES[j].at;
    if (Math.hypot(a[0] - b[0], a[1] - b[1]) < WILDFIRE.link * TILE && nearSeg(a, b) > 1.1 * TILE) out.push(WILD_NODES[i].t < WILD_NODES[j].t ? [i, j] : [j, i]);
  }
  return out;
})();
const WILD_BOOM = (): number => Math.max(...WILD_NODES.map((n) => n.t)) + WILDFIRE.hold;
/** A jagged channel between two points on the picture, as lightning goes (halved and kicked aside, again and again). */
function jagLine(a: [number, number], c: [number, number], rough: number, rnd: () => number): [number, number][] {
  const L = Math.hypot(c[0] - a[0], c[1] - a[1]);
  if (L < 5) return [a, c];
  const nx = -(c[1] - a[1]) / L, ny = (c[0] - a[0]) / L, d = (rnd() - 0.5) * L * rough;
  const m: [number, number] = [(a[0] + c[0]) / 2 + nx * d, (a[1] + c[1]) / 2 + ny * d];
  return [...jagLine(a, m, rough, rnd).slice(0, -1), ...jagLine(m, c, rough, rnd)];
}
function seeded(seed: number): () => number { let q = seed >>> 0; return () => { q = (q + 0x6d2b79f5) >>> 0; let z = q; z = Math.imul(z ^ (z >>> 15), z | 1); z ^= z + Math.imul(z ^ (z >>> 7), z | 61); return ((z ^ (z >>> 14)) >>> 0) / 4294967296; }; }
/** Glowing lines on the picture (each pixel taken once a layer, so the glow does not pile up where they cross). */
function glowLines(s: Px, lines: [number, number][][], layers: [number, string, number][]): void {
  for (const [r, c, a] of layers) {
    const m = new Map<number, number>();
    for (const pts of lines) for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay)));
      for (let j = 0; j <= n; j++) {
        const X = ax + ((bx - ax) * j) / n, Y = ay + ((by - ay) * j) / n;
        for (let dy = -Math.ceil(r); dy <= Math.ceil(r); dy++) for (let dx = -Math.ceil(r); dx <= Math.ceil(r); dx++) {
          const d = Math.hypot(dx, dy);
          if (d > r + 0.01) continue;
          const k = Math.round(Y + dy) * 100000 + Math.round(X + dx), v = r > 1.5 ? 1 - d / (r + 1) : 1;
          if ((m.get(k) ?? 0) < v) m.set(k, v);
        }
      }
    }
    for (const [k, v] of m) { const Y = Math.floor(k / 100000), X = k - Y * 100000; mix(s, X, Y, c, Math.min(1, v * a)); }
  }
}
/** A PILLAR OF WILDFIRE standing on (`X`, `Y`): flame rolling up, white-gold at its heart, orange, his pink at its ragged edges;
 * lightning crackling up inside it. `H` how tall, `Wd` how wide. */
function wildPillar(s: Px, X: number, Y: number, H: number, Wd: number, t: number, seed: number): void {
  if (H < 2) return;
  for (let yy = 0; yy < H; yy += 0.7) {
    const f = yy / H, w = Wd * Math.pow(1 - f, 0.55) * (0.8 + 0.4 * vnoise(yy * 0.08 - t * 7, seed, 9711));
    for (let xx = -w * 1.25; xx <= w * 1.25; xx += 0.7) {
      const n = vnoise(xx * 0.18 + seed, yy * 0.11 - t * 9, 9712) * 0.65 + vnoise(xx * 0.4, yy * 0.25 - t * 14, 9713) * 0.35;
      const v = 1 - Math.abs(xx) / (w + 0.01) + (n - 0.45) * 0.9 - f * 0.45;
      if (v < 0.14) continue;
      const c = v > 0.9 ? '#fffbe0' : v > 0.72 ? '#fff4c0' : v > 0.55 ? '#ffb81c' : v > 0.38 ? '#e06a10' : v > 0.24 ? '#d8303a' : '#ff4f8a';
      mix(s, Math.round(X + xx + 3 * Math.sin(yy * 0.12 - t * 10 + seed)), Math.round(Y - yy), c, v > 0.24 ? 0.95 : 0.6);
    }
  }
  // (lightning crackling up inside it)
  const rnd = seeded(seed * 977 + Math.floor(t * 15));
  const bolts: [number, number][][] = [];
  for (let b = 0; b < 2; b++) bolts.push(jagLine([X + (rnd() - 0.5) * Wd * 0.6, Y - 2], [X + (rnd() - 0.5) * Wd * 0.8, Y - H * (0.55 + 0.3 * rnd())], 0.6, rnd));
  glowLines(s, bolts, [[2.2, '#ffb81c', 0.55], [0.6, '#ffffff', 1]]);
}
/** THE WILDFIRE ON THE FLOOR: where each leap will land, marked first in every boss's warning colour, a ring tightening; where it
 * has landed, the floor scorched black, embers glowing in it, flickering; dying away at the end. */
function wildFloor(s: Px, t: number, ox: number, oy: number, from: V2, dir: number): void {
  roomWalls(s, ox, oy, from, dir);
  const P = (x: number, y: number): [number, number] => { const [px, py] = at([from[0] + dir * x, from[1] + dir * y, 0]); return [Math.round(ox + px), Math.round(oy + py)]; };
  const boom = WILD_BOOM(), fr = Math.floor(t * 30);
  const fadeOut = Math.max(0, 1 - Math.max(0, t - boom - WILDFIRE.boom) / 1.5);
  for (const [i, n] of WILD_NODES.entries()) {
    const u = t - n.t;
    if (u >= -WILDFIRE.warn && u < 0) {
      const f = 1 + u / WILDFIRE.warn, R = 1.0 * TILE * (1.3 - 0.3 * f);
      for (let yy = -R; yy <= R; yy += 1.2) for (let xx = -R; xx <= R; xx += 1.2) {
        const q = Math.hypot(xx, yy) / R;
        if (q >= 1) continue;
        const [px, py] = P(n.at[0] + xx, n.at[1] + yy);
        mix(s, px, py, q > 0.88 ? (fr % 4 < 2 ? FLAME[3] : FLAME[2]) : FLAME[2], q > 0.88 ? 0.9 : 0.2 + 0.25 * f);
      }
    }
    if (u >= 0 && fadeOut > 0) {
      const R = 0.95 * TILE * Math.min(1, u / 0.15 + 0.4);
      for (let yy = -R; yy <= R; yy += 1.2) for (let xx = -R; xx <= R; xx += 1.2) {
        const q = Math.hypot(xx, yy) / R;
        if (q >= 1) continue;
        const [px, py] = P(n.at[0] + xx, n.at[1] + yy), e = hash(Math.floor(xx / 2) + i * 50, Math.floor(yy / 2), 9721 + (fr >> 1));
        mix(s, px, py, '#1c0a08', 0.6 * fadeOut * (1 - q * q));
        if (e > 0.9 - 0.1 * (1 - q)) mix(s, px, py, e > 0.97 ? '#fff4c0' : '#e06a10', 0.85 * fadeOut);
      }
    }
  }
}
/** THE WILDFIRE STANDING: each burning spot's pillar (towering as it lands, burning on, towering again as all of it detonates, then
 * dying down); the leap that lit it, a great arc of fire-lightning from the last; and the web, crackling arcs of fire between every
 * burning spot and those near it, flashing white as it detonates. Those spots nearer the eye than `split` (on the picture) or
 * further, so the figures stand among them. */
function wildfire(s: Px, t: number, ox: number, oy: number, from: V2, dir: number, near: boolean, split: number): void {
  const W = (x: number, y: number, z: number): [number, number] => { const [px, py] = at([from[0] + dir * x, from[1] + dir * y, z]); return [ox + px, oy + py]; };
  const boom = WILD_BOOM(), b = t - boom;
  const die = b < WILDFIRE.boom ? 1 : Math.max(0, 1 - (b - WILDFIRE.boom) / WILDFIRE.die);
  if (die <= 0) return;
  const lit = (i: number): boolean => t >= WILD_NODES[i].t;
  const isNear = (i: number): boolean => W(WILD_NODES[i].at[0], WILD_NODES[i].at[1], 0)[1] >= split;
  // (the web: crackling arcs between burning spots near each other; and each leap as it comes)
  if (near) {
    const arcs: [number, number][][] = [], leaps: [number, number][][] = [];
    for (const [k, [i, j]] of WILD_LINKS.entries()) {
      if (!lit(i) || !lit(j)) continue;
      const age = t - Math.max(WILD_NODES[i].t, WILD_NODES[j].t);
      const a = WILD_NODES[i].at, c = WILD_NODES[j].at, rnd = seeded(k * 131 + Math.floor(t * 15));
      if (age < 0.12) {
        // (the leap: a great arc of it, up over and down)
        const pts: [number, number][] = [];
        for (let q = 0; q <= 8; q++) { const u = q / 8; pts.push(W(a[0] + (c[0] - a[0]) * u, a[1] + (c[1] - a[1]) * u, 14 + 46 * Math.sin(u * Math.PI))); }
        const out: [number, number][] = [];
        for (let q = 1; q < pts.length; q++) out.push(...jagLine(pts[q - 1], pts[q], 0.5, rnd).slice(q === 1 ? 0 : 1));
        leaps.push(out);
      } else if (age > 0.05 && die > 0.15 && (k + Math.floor(t * 20)) % 5 !== 0) arcs.push(jagLine(W(a[0], a[1], 16), W(c[0], c[1], 16), 0.38, rnd));
    }
    const flash = b > 0 && b < WILDFIRE.boom ? 1 : 0;
    glowLines(s, arcs, flash ? [[6, '#ff4f8a', 0.35], [3, '#fff4c0', 0.9], [1.2, '#ffffff', 1]] : [[5, '#ff4f8a', 0.3 * die], [2.4, '#ffb81c', 0.9 * die], [0.9, '#fffbe0', die]]);
    glowLines(s, leaps, [[7, '#ff4f8a', 0.35], [3.2, '#ffb81c', 0.95], [1.3, '#ffffff', 1]]);
  }
  for (const [i, n] of WILD_NODES.entries()) {
    if (!lit(i) || isNear(i) !== near) continue;
    const u = t - n.t, [X, Y] = W(n.at[0], n.at[1], 0);
    const burst = Math.max(0, 1 - u / 0.35), up = b > -0.1 ? Math.max(0, 1 - Math.abs(b - 0.12) / 0.3) : 0;
    const H = (46 + 8 * Math.sin(t * 5 + i) + 70 * burst + 120 * up) * die, Wd = (14 + 10 * burst + 18 * up) * Math.max(0.3, die);
    wildPillar(s, X, Y, H, Wd, t, i + 1);
  }
  if (near && b > 0 && b < 2 / 30) for (let yy = 0; yy < s.h; yy++) for (let xx = 0; xx < s.w; xx++) mix(s, xx, yy, '#fff4c0', 0.3);
}
/** WHERE THE HERO IS in Scald's film (his own lengths): out in the room, clear of the steam; as each beam sweeps round on him, he
 * dodges through it (the fire's first, coming one way, then the cold's, coming the other). */
const SCALD_HERO_R = 4.6 * TILE;
const SCALD_HERO_A: [number, number] = [-15, 12];
const scaldDodges = ((): { t: number; from: number; to: number }[] => {
  const on = MELD.slam + SCALD.beams[0];
  const [a0, a1] = SCALD_HERO_A;
  // (the fire comes round clockwise onto him: through it the other way, a moment before it reaches him; then the cold, the same)
  const fireAt = on + (SCALD.fire0 - a0) / SCALD.turn, frostAt = on + (a1 - SCALD.frost0) / SCALD.turn;
  return [{ t: fireAt - 0.12, from: a0, to: a1 }, { t: frostAt - 0.12, from: a1, to: a0 }];
})();
function scaldHeroAt(t: number): [number, number, number] {
  let a = SCALD_HERO_A[0];
  for (const d of scaldDodges) {
    if (t >= d.t + 0.25) a = d.to;
    else if (t > d.t) { const u = (t - d.t) / 0.25; a = d.from + (d.to - d.from) * (u * u * (3 - 2 * u)); break; }
    else break;
  }
  return [Math.cos(a * Math.PI / 180) * SCALD_HERO_R, Math.sin(a * Math.PI / 180) * SCALD_HERO_R, 0];
}
/** The room: its floor's edge and the dark beyond; its two back walls standing, dark stone, lit along their tops. */
function roomWalls(s: Px, ox: number, oy: number, from: V2, dir: number): void {
  const W = (x: number, y: number, z: number): [number, number] => { const [px, py] = at([from[0] + dir * x, from[1] + dir * y, z]); return [Math.round(ox + px), Math.round(oy + py)]; };
  for (let yy = 0; yy < s.h; yy++) for (let xx = 0; xx < s.w; xx++) {
    const wx = ((xx - ox) / 0.816 + (yy - oy) / 0.408) / 2, wy = ((xx - ox) / 0.816 - (yy - oy) / 0.408) / 2;
    const fx = dir * (wx - from[0]) / TILE, fy = dir * (wy - from[1]) / TILE;
    if (fx < ARENA.x[0] || fx > ARENA.x[1] || fy < ARENA.y[0] || fy > ARENA.y[1]) mix(s, xx, yy, '#06040a', 0.75);
  }
  const X0 = ARENA.x[0] * TILE, Y1 = ARENA.y[1] * TILE;
  for (let y = ARENA.y[0] * TILE; y <= Y1; y += 0.8) for (let z = 0; z <= 70; z += 0.8) { const [px, py] = W(X0, y, z); mix(s, px, py, z > 67 ? '#5a4a60' : (Math.floor(y / 12) + Math.floor(z / 9)) % 2 ? '#241c2a' : '#2c2232', 1); }
  for (let x = X0; x <= ARENA.x[1] * TILE; x += 0.8) for (let z = 0; z <= 70; z += 0.8) { const [px, py] = W(x, Y1, z); mix(s, px, py, z > 67 ? '#5a4a60' : (Math.floor(x / 12) + Math.floor(z / 9)) % 2 ? '#2a2230' : '#322838', 1); }
}
/** THE SCALD ON THE FLOOR: the ice spreading round him, frosted, cracked; flushed in every boss's warning colour, its edge hot; fire
 * glowing up through its cracks, hotter and hotter; wet once it has flashed. Then each beam's warning, a line where it will start;
 * and where each has swept, the floor scorched glowing (the fire's) or rimed (the cold's), fading. */
function scaldFloor(s: Px, t: number, ox: number, oy: number, from: V2, dir: number): void {
  roomWalls(s, ox, oy, from, dir);
  if (t < MELD.slam) return;
  const P = (x: number, y: number): [number, number] => { const [px, py] = at([from[0] + dir * x, from[1] + dir * y, 0]); return [Math.round(ox + px), Math.round(oy + py)]; };
  const reach = scaldIce(t);
  const heat = Math.min(1, Math.max(0, (t - MELD.slam - SCALD.heat[0]) / (SCALD.heat[1] - SCALD.heat[0])));
  const flashed = t - MELD.slam - SCALD.flash;
  const throb = 0.75 + 0.25 * Math.sin(t * 12);
  const R = SCALD.r * TILE + 12;
  for (let y = -R; y <= R; y += 1.2) for (let x = -R; x <= R; x += 1.2) {
    if (!scaldIn(x, y) || Math.hypot(x, y) > reach) continue;
    const [px, py] = P(x, y);
    const cx = Math.floor(x / 9 + 0.3 * Math.sin(y / 7)), cy = Math.floor(y / 9 + 0.3 * Math.sin(x / 6));
    const fx = x / 9 + 0.3 * Math.sin(y / 7) - cx, fy = y / 9 + 0.3 * Math.sin(x / 6) - cy;
    const crack = (fx < 0.12 || fy < 0.12) && hash(cx, cy, 9611 + (fx < 0.12 ? 0 : 1)) > 0.25;
    if (flashed < 0) {
      mix(s, px, py, crack ? '#34485c' : hash(Math.floor(x / 3), Math.floor(y / 3), 9612) > 0.8 ? '#e2f0f8' : '#a5c6d7', 0.62);
      mix(s, px, py, FLAME[2], 0.16 + 0.1 * throb);
      if (crack && heat > 0) mix(s, px, py, heat > 0.6 ? '#ffb070' : '#ff5a2a', 0.4 + 0.55 * heat);
      const edge = !scaldIn(x, y, -3.5) || Math.hypot(x, y) > reach - 4;
      if (edge) mix(s, px, py, Math.hypot(x, y) > reach - 4 ? FLAME[3] : FLAME[2], 0.85);
    } else {
      mix(s, px, py, crack ? '#1a1418' : '#2a2024', 0.45);
      // (the steam's edge on the floor: the warning that it burns and chills, there all the while)
      if (!scaldIn(x, y, -3)) mix(s, px, py, FLAME[2], 0.6 + 0.3 * throb);
    }
  }
  // (each beam's warning: a line out from him to the wall where it will start, flickering, hot; then the floor it has swept)
  const fr = Math.floor(t * 30);
  for (const kind of ['fire', 'frost'] as const) {
    const b = scaldBeam(kind, t);
    if (!b) continue;
    if (b.on === 0) {
      const end = scaldWall(b.deg), L = Math.hypot(end[0], end[1]);
      for (let d = SCALD.r * TILE; d < L; d += 0.8) {
        if (Math.floor(d / 6) % 2 && fr % 4 < 2) continue;
        for (const w of [-1.5, 0, 1.5]) {
          const c = Math.cos(b.deg * Math.PI / 180), sn = Math.sin(b.deg * Math.PI / 180);
          const [px, py] = P(c * d - sn * w, sn * d + c * w);
          mix(s, px, py, w === 0 ? FLAME[3] : FLAME[2], 0.9);
        }
      }
    }
  }
  // (the floor each has swept: a band behind it, scorched and glowing (the fire's) or rimed (the cold's), fading as it falls behind)
  const beams = (['fire', 'frost'] as const).map((kind) => ({ kind, b: scaldBeam(kind, t) })).filter((q) => q.b && q.b.on > 0);
  if (beams.length) for (let y = ARENA.y[0] * TILE; y <= ARENA.y[1] * TILE; y += 1.2) for (let x = ARENA.x[0] * TILE; x <= ARENA.x[1] * TILE; x += 1.2) {
    const r = Math.hypot(x, y);
    if (r < SCALD.r * TILE) continue;
    const deg = (Math.atan2(y, x) * 180) / Math.PI;
    for (const { kind, b } of beams) {
      const fired = t - MELD.slam - SCALD.beams[0];
      // (how long since the beam passed here: the fire turns clockwise (its angle falling), the cold counter-clockwise)
      let behind = kind === 'fire' ? deg - b!.deg : b!.deg - deg;
      behind = ((behind % 360) + 360) % 360;
      const age = behind / SCALD.turn;
      if (age > 0.7 || age > fired) continue;
      const fade = 1 - age / 0.7, [px, py] = P(x, y), n = hash(Math.floor(x / 2), Math.floor(y / 2), (kind === 'fire' ? 9631 : 9632) + fr);
      if (kind === 'fire') mix(s, px, py, n > 0.82 ? '#ffb070' : n > 0.55 ? '#c25a12' : '#1c0a08', (n > 0.55 ? 0.8 : 0.45) * fade);
      else mix(s, px, py, n > 0.75 ? '#ffffff' : n > 0.4 ? '#a5c6d7' : '#6a8aa2', (n > 0.4 ? 0.7 : 0.35) * fade);
    }
  }
}
/** Smooth noise over the picture (0 ... 1): hashed at whole steps, blended between. */
function vnoise(x: number, y: number, seed: number): number {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = hash(xi, yi, seed), b = hash(xi + 1, yi, seed), c = hash(xi, yi + 1, seed), d = hash(xi + 1, yi + 1, seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
/** THE BEAMS, out of the steam to the wall, reading as what they are (his words, 13 Nov 2026: “Yes but can we get the beams to read
 * fire and cold”). THE FIRE: a roaring stream of flame, widening as it goes, rolling out along its length, tongues of it licking
 * upward off it; white-gold at its heart, orange, red, his pink at its ragged edges; embers flung up off it, a little smoke. THE
 * COLD: a freezing blast, white at its core, streaked along its length with icy wind, its edges breaking into frost mist that sinks
 * off it; ice shards glittering along it, his pink in a few. Each blazing at its root in the steam where he is, bursting on the
 * wall. Light and flame, not solids, as his Lightning's bolts are. */
function scaldBeams(s: Px, t: number, ox: number, oy: number, from: V2, dir: number): void {
  const W = (x: number, y: number, z: number): [number, number] => { const [px, py] = at([from[0] + dir * x, from[1] + dir * y, z]); return [ox + px, oy + py]; };
  const fr = Math.floor(t * 30);
  for (const kind of ['fire', 'frost'] as const) {
    const b = scaldBeam(kind, t);
    if (!b || b.on <= 0) continue;
    const end = scaldWall(b.deg);
    const [x0, y0] = W(0, 0, 34), [x1, y1] = W(end[0], end[1], 22);
    const L = Math.hypot(x1 - x0, y1 - y0) || 1, ux = (x1 - x0) / L, uy = (y1 - y0) / L;
    // (across it, on the picture: the side of it toward the top of the picture first)
    let nx = -uy, ny = ux;
    if (ny > 0) { nx = -nx; ny = -ny; }
    const heat = new Map<number, number>();
    const put = (X: number, Y: number, v: number): void => { const k = Math.round(Y) * 100000 + Math.round(X); if ((heat.get(k) ?? 0) < v) heat.set(k, v); };
    if (kind === 'fire') {
      for (let d = 0; d < L; d += 0.6) {
        const f = d / L, w = (5 + 15 * f) * b.on;
        const flow = d * 0.09 - t * 22;
        for (let q = -w * 1.3; q <= w * 1.3; q += 0.6) {
          const n = vnoise(flow, q * 0.22 + t * 3, 9651) * 0.65 + vnoise(flow * 2.3, q * 0.5 - t * 5, 9652) * 0.35;
          const v = 1 - Math.abs(q) / w + (n - 0.45) * 0.9;
          if (v > 0.12) put(x0 + ux * d + nx * q, y0 + uy * d + ny * q, v);
        }
        // (tongues of it licking up off it)
        const H = w * (0.4 + 1.8 * vnoise(d * 0.06 - t * 9, 1, 9653) ** 2);
        for (let h = 0; h < H; h += 0.6) {
          const sway = 3 * Math.sin(h * 0.25 + d * 0.1 - t * 14);
          const v = (1 - h / H) * 0.75 + (vnoise(d * 0.15 - t * 15, h * 0.2 - t * 8, 9654) - 0.5) * 0.5;
          if (v > 0.12) put(x0 + ux * d + nx * w * 0.5 + sway, y0 + uy * d + ny * w * 0.5 - h, v);
        }
      }
      for (const [k, v] of heat) {
        const Y = Math.floor(k / 100000), X = k - Y * 100000;
        const c = v > 0.92 ? '#fffbe0' : v > 0.75 ? '#fff0a0' : v > 0.55 ? '#ffb43a' : v > 0.38 ? '#ff6a1a' : v > 0.24 ? '#d8303a' : '#ff4f8a';
        mix(s, X, Y, c, v > 0.24 ? 0.95 : 0.6);
      }
      // (embers flung up off it, drifting, and a little smoke)
      for (let i = 0; i < 60; i++) {
        const d = L * hash(i, 1, 9655), u = (t * 1.6 + hash(i, 2, 9656)) % 1, w = 5 + 15 * (d / L);
        const X = x0 + ux * d + nx * w * 0.6 + 8 * Math.sin(i + t * 3) * u, Y = y0 + uy * d + ny * w * 0.6 - 50 * u;
        mix(s, Math.round(X), Math.round(Y), u < 0.5 ? '#ffb43a' : '#ff4f8a', 0.9 * (1 - u));
        if (i % 5 === 0) for (let r = 0; r < 4; r++) mix(s, Math.round(X + r - 2), Math.round(Y - 14 - 30 * u), '#3a2c30', 0.25 * (1 - u));
      }
    } else {
      for (let d = 0; d < L; d += 0.6) {
        const f = d / L, w = (6 + 14 * f) * b.on;
        const flow = d * 0.04 - t * 30;
        for (let q = -w * 2.1; q <= w * 1.7; q += 0.6) {
          // (streaked along its length: icy wind)
          const n = vnoise(flow, q * 0.9, 9661) * 0.7 + vnoise(flow * 3, q * 1.6, 9662) * 0.3;
          let v = 1 - Math.abs(q) / w + (n - 0.5) * 0.7;
          // (frost mist sinking off its lower edge)
          v = Math.max(v, (1 - Math.abs(q) / (w * (q < 0 ? 2.1 : 1.7))) * (q < 0 ? 0.62 : 0.45) * vnoise(d * 0.08 - t * 6, q * 0.25 + t * 4, 9663));
          if (v > 0.1) put(x0 + ux * d + nx * q, y0 + uy * d + ny * q, v);
        }
      }
      for (const [k, v] of heat) {
        const Y = Math.floor(k / 100000), X = k - Y * 100000;
        if (v < 0.22 && (X + Y) % 2) continue;
        const c = v > 0.9 ? '#ffffff' : v > 0.7 ? '#f0f8ff' : v > 0.5 ? '#e2f0f8' : v > 0.33 ? '#a5c6d7' : v > 0.22 ? '#6a8aa2' : '#a5c6d7';
        mix(s, X, Y, c, v > 0.33 ? 0.95 : 0.55);
      }
      // (ice shards glittering along it, streaming out with it; his pink in a few)
      for (let i = 0; i < 70; i++) {
        const d = ((hash(i, 1, 9664) + t * 2.2) % 1) * L, q = (hash(i, 2, 9665) - 0.5) * 2.6 * (6 + 14 * (d / L));
        const X = Math.round(x0 + ux * d + nx * q), Y = Math.round(y0 + uy * d + ny * q), c = i % 7 === 0 ? '#ff9cc0' : '#ffffff';
        for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) mix(s, X + dx, Y + dy, dx || dy ? '#e2f0f8' : c, 0.95);
        if ((fr + i) % 3 === 0) { mix(s, X + 2, Y, c, 0.9); mix(s, X - 2, Y, c, 0.9); mix(s, X, Y + 2, c, 0.9); mix(s, X, Y - 2, c, 0.9); }
      }
    }
    const cols = kind === 'fire' ? ['#ff4f8a', '#ff6a1a', '#ffb43a', '#fff0a0'] : ['#ff4f8a', '#a5c6d7', '#e2f0f8', '#ffffff'];
    // (its light on the floor under it)
    for (let j = 0; j <= L; j += 2) { const u = j / L; const [px, py] = W(end[0] * u, end[1] * u, 0); mix(s, Math.round(px), Math.round(py), cols[1], 0.3); }
    // (where it hits the wall: a splash of sparks, or of frost)
    for (let i = 0; i < 30; i++) {
      const a = hash(i, fr, kind === 'fire' ? 9641 : 9642) * Math.PI * 2, d = 4 + 20 * hash(i, fr, 9643);
      mix(s, Math.round(x1 + Math.cos(a) * d), Math.round(y1 + Math.sin(a) * d * 0.7), i % 3 ? cols[2] : cols[3], 0.9);
    }
    for (let dy = -12; dy <= 12; dy++) for (let dx = -18; dx <= 18; dx++) { const q = Math.hypot(dx / 18, dy / 12); if (q < 1) mix(s, Math.round(x1 + dx), Math.round(y1 + dy), cols[3], 0.5 * (1 - q)); }
    // (its root, blazing out of the steam where he is)
    for (let dy = -14; dy <= 14; dy++) for (let dx = -14; dx <= 14; dx++) { const q = Math.hypot(dx, dy) / 14; if (q < 1) mix(s, Math.round(x0 + dx), Math.round(y0 + dy), cols[2], 0.5 * (1 - q)); }
  }
}
/** THE STEAM, soft (vapour, not a solid): every plume's puffs heaped up into one thickness over the picture, swirling at their
 * edges; then drawn in bands, as pixel art draws smoke: white where thickest, warm greys thinning to a dithered haze at its edge;
 * lit from above (a white rim where it thins upward), shadowed under; his pink-hot at its roots as it flashes. Thick, it hides
 * what is in it. Those plumes standing beyond him (`behind`), or the rest, nearer the eye. */
let steamBuf = new Float32Array(0), hotBuf = new Float32Array(0), litBuf = new Float32Array(0);
function steam(s: Px, t: number, ox: number, oy: number, from: V2, dir: number, behind: boolean): void {
  const plumes = scaldSteamAt(t);
  if (!plumes.length) return;
  if (steamBuf.length !== s.w * s.h) { steamBuf = new Float32Array(s.w * s.h); hotBuf = new Float32Array(s.w * s.h); litBuf = new Float32Array(s.w * s.h); }
  steamBuf.fill(0); hotBuf.fill(0); litBuf.fill(0);
  const W = (x: number, y: number, z: number): [number, number] => { const [px, py] = at([from[0] + dir * x, from[1] + dir * y, z]); return [ox + px, oy + py]; };
  const [, himY] = W(0, 0, 0);
  let x0 = s.w, y0 = s.h, x1 = 0, y1 = 0;
  for (const [i, pl] of plumes.entries()) {
    const [, by] = W(pl.at[0], pl.at[1], 0);
    if ((by < himY) !== behind) continue;
    const n = pl.puffs.length;
    for (const [j, [z, R, ddx, ddy]] of pl.puffs.entries()) {
      const [cx, cy] = W(pl.at[0] + ddx, pl.at[1] + ddy, z);
      const th = pl.thick * (j === 0 ? 1.15 : 1 - (0.35 * j) / n);
      for (let yy = Math.floor(cy - R * 1.2); yy <= Math.ceil(cy + R * 1.2); yy++) for (let xx = Math.floor(cx - R * 1.2); xx <= Math.ceil(cx + R * 1.2); xx++) {
        if (xx < 0 || yy < 0 || xx >= s.w || yy >= s.h) continue;
        const dx = xx - cx, dy = yy - cy, a = Math.atan2(dy, dx);
        const wob = 1 + 0.08 * Math.sin(a * 3 + t * 2.5 + i + j) + 0.05 * Math.sin(a * 6 - t * 3 + j * 2);
        const q = Math.hypot(dx, dy) / (R * wob);
        if (q >= 1) continue;
        const k = yy * s.w + xx, v = (1 - q * q) * th;
        steamBuf[k] += v;
        // (each billow lit from above and to the left, shadowed under: so its lobes show)
        litBuf[k] += v * Math.max(0, Math.min(1, 0.62 - (0.6 * dy) / R - (0.25 * dx) / R));
        if (j === 0) hotBuf[k] += v * pl.hot;
        if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy;
      }
    }
  }
  // (thinning away: fainter all over as well as smaller in its thickness)
  const fade = 0.25 + 0.75 * Math.min(1, Math.max(...plumes.map((p) => p.thick)));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const k = y * s.w + x, d = steamBuf[k] / Math.max(0.4, fade);
    if (d < 0.12) continue;
    const L = litBuf[k] / steamBuf[k];
    let c: string, a: number;
    if (d > 0.45) { c = L > 0.62 ? '#ffffff' : L > 0.42 ? '#f2e4dc' : L > 0.24 ? '#d8c4bc' : '#b8a49c'; a = d > 0.8 ? 0.96 : 0.82; }
    else if (d > 0.22) { c = L > 0.5 ? '#d8c4bc' : '#b8a49c'; a = 0.55; }
    else { if ((x + y) % 2) continue; c = '#a08884'; a = 0.35; }
    const h = hotBuf[k];
    if (h > 0.25) c = h > 0.7 ? '#ff9cc0' : '#ffb090';
    mix(s, x, y, c, a * fade);
  }
}
/** WHERE THE HERO IS in Frostbite's film (his own lengths): out in the room as the wave rolls over him (chilled, so slowed);
 * struggling to the nearest bare island before the ice locks. */
const BITE_ISLE: [number, number, number] = [FROSTBITE.isles[0][0] * TILE, FROSTBITE.isles[0][1] * TILE, 0];
const BITE_FROM: [number, number, number] = [4.6 * TILE, -0.6 * TILE, 0];
/** When the wave reaches him. */
const BITE_HIT = ((): number => { for (let t = MELD.slam; t < MELD.slam + 3; t += 0.01) if (frostbiteWave(t) > Math.hypot(BITE_FROM[0], BITE_FROM[1])) return t; return MELD.slam + 1; })();
function biteHeroAt(t: number): [number, number, number] {
  // (slowed: a laboured walk, not a dash)
  const u = Math.min(1, Math.max(0, (t - BITE_HIT - 0.2) / 1.2)), e = u * (2 - u);
  return [BITE_FROM[0] + (BITE_ISLE[0] - BITE_FROM[0]) * e, BITE_FROM[1] + (BITE_ISLE[1] - BITE_FROM[1]) * e, 0];
}
/** THE FROSTBITE ON THE FLOOR: the room; behind the wave, the floor iced over, frosted, his pink venom in its veins; the bare islands
 * it leaves, their edges hot gold; the ice flushing in every boss's warning colour, faster and faster, before it locks; locked,
 * white, then melting to wet floor. Venom rising off it as vapour. */
function biteFloor(s: Px, t: number, ox: number, oy: number, from: V2, dir: number): void {
  roomWalls(s, ox, oy, from, dir);
  if (t < MELD.slam) return;
  const P = (x: number, y: number): [number, number] => { const [px, py] = at([from[0] + dir * x, from[1] + dir * y, 0]); return [Math.round(ox + px), Math.round(oy + py)]; };
  const f0 = MELD.slam + FROSTBITE.freeze, fr = Math.floor(t * 30);
  const melt = Math.max(0, Math.min(1, (t - f0 - FROSTBITE.sweep - FROSTBITE.hold) / FROSTBITE.melt));
  if (melt >= 1) return;
  const warn = t < f0 ? Math.max(0, (t - (f0 - 1.2)) / 1.2) : 0, rate = 6 + 18 * warn;
  const throb = 0.5 + 0.5 * Math.sin(t * rate);
  const W = frostbiteWave(t);
  for (let y = ARENA.y[0] * TILE; y <= ARENA.y[1] * TILE; y += 1.2) for (let x = ARENA.x[0] * TILE; x <= ARENA.x[1] * TILE; x += 1.2) {
    const r = Math.hypot(x, y);
    if (r > W) continue;
    const [px, py] = P(x, y);
    if (frostbiteIsle(x, y)) {
      // (a bare island: the floor itself, warm, its edge hot gold: safe)
      mix(s, px, py, FLAME[3], 0.1 * (1 - melt));
      if (!frostbiteIsle(x, y, -3)) mix(s, px, py, FLAME[3], 0.9 * (1 - melt));
      continue;
    }
    if (!frostbiteIced(x, y, t)) continue;
    // (the ice: broad frosted plates, cracked between; his pink venom running in it in wavy veins; a glint here and there)
    const v = vnoise(x * 0.035, y * 0.035, 9961), g = hash(Math.floor(x / 2), Math.floor(y / 2), 9963);
    const cx = Math.floor(x / 22 + 0.3 * Math.sin(y / 15)), cy = Math.floor(y / 22 + 0.3 * Math.sin(x / 13));
    const fx = x / 22 + 0.3 * Math.sin(y / 15) - cx, fy = y / 22 + 0.3 * Math.sin(x / 13) - cy;
    const crack = (fx < 0.05 || fy < 0.05) && hash(cx, cy, 9964 + (fx < 0.05 ? 0 : 1)) > 0.3;
    const vein = Math.abs(Math.sin(x * 0.045 + 2.2 * Math.sin(y * 0.03)) * Math.cos(y * 0.021 + x * 0.006)) < 0.035;
    const locked = t >= f0 + FROSTBITE.sweep * (r / (13.4 * TILE));
    const c = crack ? '#22508a' : locked ? (v > 0.55 ? '#ffffff' : '#e4f4ff') : v > 0.62 ? '#e4f4ff' : v > 0.4 ? '#8cc0ec' : '#5a94cc';
    mix(s, px, py, c, (locked ? 0.72 : 0.6) * (1 - melt));
    if (g > 0.992) mix(s, px, py, '#ffffff', 0.9 * (1 - melt));
    if (vein) mix(s, px, py, '#ff4f8a', 0.8 * (1 - melt));
    if (warn > 0) mix(s, px, py, FLAME[2], (0.12 + 0.3 * warn) * throb);
    // (the wave's front: a hard white rim of frost rolling out)
    if (W - r < 5 && W < 13.5 * TILE) mix(s, px, py, '#ffffff', 0.9);
  }
}
/** THE FROSTBITE'S MIST AND VENOM: the wave's front rolling out over the floor, a bank of frost mist, white and ice-blue, his pink
 * glinting in it; venom vapour rising off the ice; the crack of the ice locking, a white flash sweeping out. */
function biteMist(s: Px, t: number, ox: number, oy: number, from: V2, dir: number): void {
  const Wp = (x: number, y: number, z: number): [number, number] => { const [px, py] = at([from[0] + dir * x, from[1] + dir * y, z]); return [ox + px, oy + py]; };
  const W = frostbiteWave(t), f0 = MELD.slam + FROSTBITE.freeze;
  if (t > MELD.slam && W < 13.5 * TILE) {
    const puffs: { X: number; Y: number; R: number; v: number; seed: number }[] = [];
    for (let i = 0; i < 90; i++) {
      const a = (i / 90) * Math.PI * 2 + 0.02 * Math.sin(i * 3.1);
      const x = Math.cos(a) * W, y = Math.sin(a) * W;
      if (x < ARENA.x[0] * TILE || x > ARENA.x[1] * TILE || y < ARENA.y[0] * TILE || y > ARENA.y[1] * TILE) continue;
      const [X, Y] = Wp(x, y, 10 + 8 * hash(i, 1, 9971));
      puffs.push({ X, Y, R: 16 + 8 * hash(i, 2, 9972), v: 0.9, seed: i });
    }
    puffPass(s, puffs, t, (d, L, x, y) => (d < 0.2 ? ((x + y) % 2 ? null : ['#8cc0ec', 0.4]) : [hash(x >> 2, y >> 2, 9973 + Math.floor(t * 6)) > 0.985 ? '#ff9cc0' : L > 0.55 ? '#ffffff' : L > 0.35 ? '#e4f4ff' : '#8cc0ec', d > 0.6 ? 0.9 : 0.65]));
  }
  // (venom vapour rising off the ice)
  if (t > MELD.slam + 0.3 && t < f0 + FROSTBITE.sweep + FROSTBITE.hold) for (let i = 0; i < 140; i++) {
    const x = (ARENA.x[0] + (ARENA.x[1] - ARENA.x[0]) * hash(i, 1, 9974)) * TILE, y = (ARENA.y[0] + (ARENA.y[1] - ARENA.y[0]) * hash(i, 2, 9975)) * TILE;
    if (!frostbiteIced(x, y, t)) continue;
    const u = (t * 0.7 + hash(i, 3, 9976)) % 1, [X, Y] = Wp(x, y, 4 + 36 * u);
    mix(s, Math.round(X), Math.round(Y), i % 3 ? '#ff9cc0' : '#c8e0b0', 0.7 * (1 - u));
  }
  // (the ice locking: a white flash for a frame)
  if (t >= f0 && t < f0 + 1 / 30) for (let yy = 0; yy < s.h; yy++) for (let xx = 0; xx < s.w; xx++) mix(s, xx, yy, '#e4f4ff', 0.3);
}
/** The hero chilled and poisoned: frost over him, pale blue; his poison rising off him as pink bubbles, more the longer he stood on
 * the ice. */
function heroChilled(s: Px, x: number, y: number, t: number, onIce: number): void {
  for (let j = 0; j < BRAWLER.h; j++) for (let i = 0; i < BRAWLER.w; i++) {
    const c = BRAWLER.px[j * BRAWLER.w + i];
    if (!c) continue;
    const X = Math.round(x - BRAWLER.w / 2 + i), Y = Math.round(y - BRAWLER.h + 2 + j);
    mix(s, X, Y, j < BRAWLER.h * 0.35 || (i + j) % 5 === 0 ? '#e4f4ff' : '#8cc0ec', 0.38);
  }
  const n = Math.min(10, 2 + Math.floor(onIce * 8));
  for (let k = 0; k < n; k++) {
    const u = (t * 1.3 + k * 0.37) % 1;
    mix(s, Math.round(x + 10 * Math.sin(k * 2.3 + t * 3)), Math.round(y - BRAWLER.h * 0.6 - 30 * u), '#ff4f8a', 0.9 * (1 - u));
  }
}
/** What a meld makes that stands among the figures, laid round them as they are drawn: its picture, the hero's place, the words. */
const AMID: Record<string, { paint: (t: number, view: 'front' | 'rear', nearer: V3 | null) => { px: Px; lights: { x: number; y: number; r: number; color: string; a?: number }[] }; can: { ax: number; ay: number }; hero: (t: number) => [number, number, number]; words: [Word, Word]; into: V3 }> = {
  blight: { paint: (t, v, n) => paintBlight(t, v, n), can: BLIGHT_CANVAS, hero: (t) => blightHeroAt(t), words: ['power', 'poison'], into: BLIGHT_AT },
  scald: { paint: (t, v, n) => paintScald(t, v, n), can: SCALD_CANVAS, hero: (t) => scaldHeroAt(t), words: ['fire', 'frost'], into: [0, 0, 0] },
  frostbite: { paint: (t, v, n) => paintFrostbite(t, v, n), can: FROSTBITE_CANVAS, hero: (t) => biteHeroAt(t), words: ['frost', 'poison'], into: [0, 0, 0] },
};
/** WHERE THE HERO IS in Blight's film (his own lengths): out before him in the path of a finger of the rot as it creeps, stepping
 * aside into a gap between two as it comes for him, before the trees burst up. */
const BLIGHT_HERO = ((): { from: [number, number, number]; to: [number, number, number] } => {
  const r = 5.6 * TILE;
  const clear = (x: number, y: number, pad: number): boolean => { for (let a = 0; a < 16; a++) for (const d of [0, pad * 0.33, pad * 0.66, pad]) if (blightAt(x + Math.cos(a * 0.4) * d, y + Math.sin(a * 0.4) * d).at < Infinity) return false; return true; };
  let best: [number, number, number] = [BLIGHT_AT[0] + r, BLIGHT_AT[1], 0], bestA = Infinity;
  for (const pad of [1.4, 1.2, 1.0, 0.8]) {
    for (let i = -75; i <= 75; i++) {
      const a = (i * Math.PI) / 180, x = BLIGHT_AT[0] + Math.cos(a) * r, y = BLIGHT_AT[1] + Math.sin(a) * r;
      if (clear(x, y, pad * TILE) && Math.abs(a) < bestA) { bestA = Math.abs(a); best = [x, y, 0]; }
    }
    if (bestA < Infinity) break;
  }
  let from: [number, number, number] = best, fromD = Infinity;
  for (let i = -90; i <= 90; i++) {
    const a = (i * Math.PI) / 180, x = BLIGHT_AT[0] + Math.cos(a) * r, y = BLIGHT_AT[1] + Math.sin(a) * r, d = Math.hypot(x - best[0], y - best[1]);
    if (blightAt(x, y).deep > 0.55 && d < fromD) { fromD = d; from = [x, y, 0]; }
  }
  return { from, to: best };
})();
function blightHeroAt(t: number): [number, number, number] {
  const d0 = MELD.slam + 0.95, u = Math.min(1, Math.max(0, (t - d0) / 0.3)), e = u * u * (3 - 2 * u);
  const { from: a, to: b } = BLIGHT_HERO;
  return [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, 0];
}
/** THE BLIGHT ON THE FLOOR: the rot creeping out of where the rune went in, in long forking fingers, black-green, veined; flushed in
 * every boss's warning colour as it creeps, its front hot; dark after the trees have burst out of it, drying and gone at the end. */
function blightFloor(s: Px, t: number, ox: number, oy: number, from: V2, dir: number): void {
  if (t < MELD.slam) return;
  const P = (x: number, y: number): [number, number] => { const [px, py] = at([from[0] + dir * x, from[1] + dir * y, 0]); return [Math.round(ox + px), Math.round(oy + py)]; };
  const reach = blightReach(t);
  const last = Math.max(...BLIGHT_TREES.map((tr) => tr.t)) + BLIGHT.rise + BLIGHT.hold + BLIGHT.wither;
  const dry = 1 - Math.min(1, Math.max(0, (t - last) / BLIGHT.dry));
  if (dry <= 0) return;
  const heaved = t >= MELD.slam + BLIGHT.heave;
  const warn = heaved ? Math.max(0, 1 - (t - MELD.slam - BLIGHT.heave) / 0.25) : 1;
  const throb = 0.75 + 0.25 * Math.sin(t * 12);
  const F = BLIGHT_FIELD;
  for (let y = F.y0; y < F.y0 + F.h; y += 1.2) for (let x = F.x0; x < F.x0 + F.w; x += 1.2) {
    const r = blightAt(x, y);
    if (r.at > reach) continue;
    const [px, py] = P(x, y);
    const n = hash(Math.floor(x / 2.5), Math.floor(y / 2.5), 9541), vein = hash(Math.floor((x + y) / 3), Math.floor((x - y) / 9), 9542) > 0.86;
    mix(s, px, py, '#10140a', 0.82 * dry);
    if (vein) mix(s, px, py, '#52661e', 0.75 * dry);
    else if (n > 0.8) mix(s, px, py, '#2e3a12', 0.8 * dry);
    if (n > 0.97) mix(s, px, py, '#b8cc7a', 0.6 * dry);
    if (warn > 0) {
      const front = reach - r.at;
      mix(s, px, py, FLAME[2], (0.2 + 0.12 * throb) * warn);
      if (front < 4 && !heaved) mix(s, px, py, FLAME[3], 0.85);
      else if ((front < 9 || r.deep < 0.12) && !heaved) mix(s, px, py, FLAME[2], 0.7);
    }
  }
}
/** THE THUNDER ON THE FLOOR: each great ring locking on, crackling, tightening; the crater it blasts, cracks thrown out of it, glowing
 * and cooling; its thunderclap rolling out. */
function thunderFloor(s: Px, t: number, ox: number, oy: number, from: V2, dir: number): void {
  const P = (x: number, y: number): [number, number] => { const [px, py] = at([from[0] + dir * x, from[1] + dir * y, 0]); return [Math.round(ox + px), Math.round(oy + py)]; };
  const W = (x: number, y: number, z: number): [number, number] => { const [px, py] = at([from[0] + dir * x, from[1] + dir * y, z]); return [Math.round(ox + px), Math.round(oy + py)]; };
  const fr = Math.floor(t * 30);
  // (THE STORM: as the rune goes up into the sky the room darkens under gathering cloud, great rolls of its shadow drifting over the
  // floor; lit from inside, a flicker in the dark, as each ring locks on)
  const cl = Math.min(1, Math.max(0, (t - MELD.slam - THUNDER.clouds[0]) / (THUNDER.clouds[1] - THUNDER.clouds[0])));
  if (cl > 0) {
    for (let y = 0; y < s.h; y += 1) for (let x = (y % 2); x < s.w; x += 2) mix(s, x, y, '#06060e', 0.3 * cl);
    for (let i = 0; i < 10; i++) {
      const cx = (-2 + 12 * ((i * 0.618) % 1)) * TILE + t * 26, cy = (-6 + 9 * ((i * 0.381 + 0.2) % 1)) * TILE;
      const R = (1.8 + 1.4 * ((i * 0.77) % 1)) * TILE;
      for (let yy = -R; yy <= R; yy += 1.4) for (let xx = -R; xx <= R; xx += 1.4) {
        const q = Math.hypot(xx, yy) / R;
        if (q >= 1) continue;
        const [px, py] = P(cx + xx, cy + yy);
        mix(s, px, py, '#04030a', 0.3 * cl * (1 - q * q));
      }
    }
    for (const st of THUNDER_STRIKES) {
      const u = t - st.lock;
      if (u >= 0 && u < 0.1) for (let y = 0; y < s.h; y += 1) for (let x = 0; x < s.w; x++) mix(s, x, y, '#b8a8d8', 0.07 * (1 - u / 0.1));
    }
  }
  for (const [k, st] of THUNDER_STRIKES.entries()) {
    if (t >= st.lock && t < st.t) {
      const f = (t - st.lock) / (st.t - st.lock);
      const R = THUNDER.R * TILE * (1.35 - 0.35 * f);
      // (THE WARNING in the colour of every boss's warning on the ground (his words, 13 Nov 2026, of Avalanche's: “whatever you use for
      // normal hit box warnings on the ground”: art/mkit.ts FLAME, as art/boss_shots.ts draws them): the floor inside it flushed and
      // throbbing, stronger as it charges; its ring, a hot arc running round it, crackling)
      const throb = 0.75 + 0.25 * Math.sin(t * 14);
      for (let yy = -R; yy <= R; yy += 1.2) for (let xx = -R; xx <= R; xx += 1.2) {
        if (Math.hypot(xx, yy) >= R - 2) continue;
        const [px, py] = P(st.at[0] + xx, st.at[1] + yy);
        mix(s, px, py, FLAME[2], (0.12 + 0.22 * f) * throb);
      }
      const run = (t * 1.6) % 1;
      for (let i = 0; i < 260; i++) {
        const a = (i / 260) * Math.PI * 2;
        const lead = 1 - ((((i / 260 - run) % 1) + 1) % 1);
        const hot = lead > 0.85 ? (lead - 0.85) / 0.15 : 0;
        const j = (fr + i) % 7 === 0 ? 1.5 : 0;
        for (let w = 0; w < 3; w++) { const [px, py] = P(st.at[0] + Math.cos(a) * (R - w + j), st.at[1] + Math.sin(a) * (R - w + j)); mix(s, px, py, w === 2 ? FLAME[0] : hot > 0.5 || w === 0 && i % 9 === 0 ? FLAME[3] : FLAME[2], Math.min(1, 0.55 + 0.4 * f + 0.4 * hot)); }
      }
      for (let i = 0; i < 40 * f; i++) { const a = ((i * 2.4 + fr) % 6.28), d = R * ((i * 0.37 + fr * 0.1) % 1); const [px, py] = P(st.at[0] + Math.cos(a) * d, st.at[1] + Math.sin(a) * d); mix(s, px, py, FLAME[4], 0.8); }
    }
    if (t >= st.t) {
      const cool = Math.min(1, (t - st.t) / 1.6);
      for (let yy = -22; yy <= 22; yy++) for (let xx = -22; xx <= 22; xx++) { const q = Math.hypot(xx, yy) / 22; if (q < 1) { const [px, py] = P(st.at[0] + xx, st.at[1] + yy); mix(s, px, py, q > 0.8 ? '#3a2070' : '#0e0b10', 0.7 * (1 - q * 0.4)); } }
      for (let c = 0; c < 9; c++) {
        let ang = (c / 9) * Math.PI * 2 + k, x = st.at[0], y = st.at[1];
        for (let d = 0; d < 46; d++) { ang += 0.4 * Math.sin(d * 0.5 + c); x += Math.cos(ang); y += Math.sin(ang); const [px, py] = P(x, y); mix(s, px, py, '#0e0b10', 0.8); if (d < 30) mix(s, px, py - 1, '#bc84ff', 0.7 * (1 - cool)); }
      }
      // (ITS THUNDERCLAP, rolling out over the floor a moment after it: a ring of force, the floor rippling as it passes (warped
      // outward under it), its front a hard pale edge, a shadow trough behind; the floor's dust and grit thrown up off it; and two
      // fainter echoes rolling after it)
      const r = thunderClapR(t - st.t);
      if (r !== null) {
        const v = (t - st.t - THUNDER.clapAfter) / THUNDER.clapLong, fade = 1 - v;
        const was = s.d.slice();
        for (let i = 0; i < 520; i++) {
          const a = (i / 520) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
          for (let w = -22; w <= 0; w += 0.7) {
            const d = r + w, push = 12 * Math.sin(((w + 22) / 22) * Math.PI) * fade;
            const [px, py] = P(st.at[0] + ca * d, st.at[1] + sa * d), [qx, qy] = P(st.at[0] + ca * (d - push), st.at[1] + sa * (d - push));
            if (px < 0 || py < 0 || px >= s.w || py >= s.h || qx < 0 || qy < 0 || qx >= s.w || qy >= s.h) continue;
            const j = (qy * s.w + qx) * 4, o = (py * s.w + px) * 4;
            s.d[o] = was[j]; s.d[o + 1] = was[j + 1]; s.d[o + 2] = was[j + 2];
          }
          // (its front: a glow ahead of it, a thick hard white edge, violet under it, a dark trough behind)
          for (let w = -6; w <= 6; w += 0.6) {
            const [px, py] = P(st.at[0] + ca * (r + w), st.at[1] + sa * (r + w));
            if (w > 2) mix(s, px, py, '#e8deff', 0.3 * fade * (1 - (w - 2) / 4));
            else if (w >= -1) mix(s, px, py, '#ffffff', 0.95 * fade);
            else if (w >= -3) mix(s, px, py, '#b49ce8', 0.85 * fade);
            else mix(s, px, py, '#0a0810', 0.45 * fade);
          }
          // (the floor's dust churned up in a band behind it)
          for (let w = -18; w <= -4; w += 1.1) {
            if (hash(i, Math.round(w), 9934 + Math.floor(t * 30)) > 0.3) continue;
            const [px, py] = P(st.at[0] + ca * (r + w), st.at[1] + sa * (r + w));
            mix(s, px, py - 1, '#9a90a8', 0.55 * fade);
          }
          { const [px, py] = P(st.at[0] + ca * r * 0.62, st.at[1] + sa * r * 0.62); mix(s, px, py, '#d8ccf4', 0.3 * fade); }
        }
        // (dust and grit thrown up off its front, rising and falling behind it)
        for (let i = 0; i < 220; i++) {
          const a = hash(k, i, 9931) * Math.PI * 2, lag = 4 + 20 * hash(k, i, 9932), up = (6 + 30 * hash(k, i, 9933)) * Math.sin(Math.min(1, v * 1.4 + 0.1 * hash(k, i, 9935)) * Math.PI);
          const [px, py] = W(st.at[0] + Math.cos(a) * (r - lag), st.at[1] + Math.sin(a) * (r - lag), Math.max(0, up));
          const c = i % 3 ? '#8a8098' : '#d4ccdc';
          mix(s, px, py, c, 0.85 * fade); mix(s, px + 1, py, c, 0.85 * fade);
          if (i % 2 === 0) { mix(s, px, py + 1, '#4a4058', 0.7 * fade); mix(s, px + 1, py + 1, '#4a4058', 0.7 * fade); }
        }
      }
    }
  }
}
/** THE HAILSTORM ON THE FLOOR: each stone's shadow growing as it comes; a splash of frost where it struck, thawing; each bolt's
 * spot ringed in crackling white first, scorched after. */
function hailFloor(s: Px, t: number, ox: number, oy: number, from: V2, dir: number): void {
  const P = (x: number, y: number): [number, number] => { const [px, py] = at([from[0] + dir * x, from[1] + dir * y, 0]); return [Math.round(ox + px), Math.round(oy + py)]; };
  // (the cloud's shadow over the room)
  const cl = hailCloudAt(t);
  if (cl > 0) {
    for (let y = 0; y < s.h; y += 1) for (let x = (y % 2); x < s.w; x += 2) mix(s, x, y, '#06060e', 0.22 * cl);
    // (the storm cloud's shadow, in great dark rolls drifting over the floor)
    for (let i = 0; i < 9; i++) {
      const cx = (-1 + 10 * ((i * 0.618) % 1)) * TILE + t * 22, cy = (-4 + 8 * ((i * 0.381 + 0.2) % 1)) * TILE;
      const R = (1.6 + 1.2 * ((i * 0.77) % 1)) * TILE;
      for (let yy = -R; yy <= R; yy += 1.4) for (let xx = -R; xx <= R; xx += 1.4) {
        const q = Math.hypot(xx, yy) / R;
        if (q >= 1) continue;
        const [px, py] = P(cx + xx, cy + yy);
        mix(s, px, py, '#04040a', 0.22 * cl * (1 - q * q));
      }
    }
  }
  for (const [k, h] of HAIL_STONES.entries()) {
    const u = t - (h.t - HAIL.warn);
    if (u < 0) continue;
    if (t < h.t) {
      const f = u / HAIL.warn;
      const R = h.r * (1.2 + 1.6 * f);
      for (let yy = -R; yy <= R; yy += 0.7) for (let xx = -R; xx <= R; xx += 0.7) if (Math.hypot(xx, yy) < R) { const [px, py] = P(h.at[0] + xx, h.at[1] + yy); mix(s, px, py, '#0a0a18', 0.35 + 0.35 * f); }
      continue;
    }
    const w = t - h.t;
    const fade = 1 - Math.min(1, w / 2.2);
    if (fade <= 0) continue;
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2;
      const r = h.r * (1.4 + 1.6 * ((i * 0.618 + k) % 1));
      for (let d = 0; d < r; d += 0.8) { const [px, py] = P(h.at[0] + Math.cos(a) * d, h.at[1] + Math.sin(a) * d); mix(s, px, py, d < r * 0.5 ? '#eef2ff' : '#b4cce8', 0.6 * fade); }
    }
  }
  for (const b of HAIL_BOLTS) {
    const u = t - (b.t - HAIL.boltWarn);
    if (u < 0) continue;
    if (t < b.t) {
      const f = u / HAIL.boltWarn;
      const R = 22 - 6 * f;
      for (let i = 0; i < 120; i++) {
        const a = (i / 120) * Math.PI * 2;
        const j = (Math.floor(t * 30) + i) % 6 === 0 ? 2 : 0;
        const [px, py] = P(b.at[0] + Math.cos(a) * (R + j), b.at[1] + Math.sin(a) * (R + j));
        mix(s, px, py, i % 9 === 0 ? '#ff4f8a' : '#eef2ff', 0.5 + 0.4 * f);
      }
      continue;
    }
    const fade = 1 - Math.min(1, (t - b.t) / 2.0);
    for (let yy = -14; yy <= 14; yy++) for (let xx = -14; xx <= 14; xx++) { const q = Math.hypot(xx, yy) / 14; if (q < 1) { const [px, py] = P(b.at[0] + xx, b.at[1] + yy); mix(s, px, py, '#0e0b10', 0.5 * fade * (1 - q)); } }
  }
}
/** His shade laid on the floor at (ox, oy), its anchor his floor point: see-through as far as `a`, its light over all. */
function layShade(s: Px, p: { px: Px; lights: { x: number; y: number; r: number; color: string; a?: number }[] }, ox: number, oy: number, a: number): void {
  const x0 = Math.round(ox - SHADE_CANVAS.ax), y0 = Math.round(oy - SHADE_CANVAS.ay);
  for (let y = 0; y < p.px.h; y++) for (let x = 0; x < p.px.w; x++) {
    const c = p.px.get(x, y);
    if (c) mix(s, x0 + x, y0 + y, c, a);
  }
  for (const l of p.lights) {
    const [r, g, b] = rgb(l.color);
    for (let y = Math.floor(l.y - l.r); y <= Math.ceil(l.y + l.r); y++) for (let x = Math.floor(l.x - l.r); x <= Math.ceil(l.x + l.r); x++) {
      const q = Math.hypot(x - l.x, y - l.y) / l.r;
      if (q < 1) mix(s, x0 + x, y0 + y, hex(r, g, b), (l.a ?? 0.5) * a * (1 - q) * (1 - q));
    }
  }
}
/** His picture laid again over itself, washed with his pink. */
function flash(s: Px, mv: string, vw: 'front' | 'rear', t: number, ox: number, oy: number, a: number): void {
  const { px } = paintMob(mob, mv, t, vw);
  const x0 = Math.round(ox - WS_CANVAS.ax), y0 = Math.round(oy - WS_CANVAS.ay);
  for (let y = 0; y < px.h; y++) for (let xx = 0; xx < px.w; xx++) {
    if (!px.get(xx, y)) continue;
    const x = vw === 'rear' ? 2 * WS_CANVAS.ax - xx : xx;
    mix(s, x0 + x, y0 + y, '#ffc2d8', a);
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
  /** where in the move it is cut (its end, if it is not), and whether it goes straight on from the one before (its first frame that one's last) */
  end?: number;
  join?: boolean;
}
const floorOf = (mv: string) => (t: number): V2 => {
  if (mv === 'charge') return [chargeCarry(t) * TILE, 0];
  if (mv === 'fall') return [fallCarry(t) * TILE, 0];
  if (mv === 'wheel') {
    const P = boarPoseAt('wheel', t);
    return [P.x, P.y];
  }
  return [0, 0];
};
const longOf = (mv: string): number => (mv === 'charge' ? CHARGE.long : mv === 'wheel' ? WHEEL.long : mv === 'gore' ? GORE.long : mv === 'stomp' ? STOMP.long : mv === 'power' ? POWER.long : mv === 'flame' ? FIRE.long : mv === 'frost' ? FROST.long : mv === 'lightning' ? BOLT.long : mv === 'poison' ? SPORE.long : mv === 'fall' ? FALL.long : mv === 'eruption' ? ERUPT.end : mv === 'foot' ? 4.8 : mv === 'death' ? DEATH.long : mv === 'hailstorm' ? HAIL.end : mv === 'turn' ? TURN.long : mv === 'avalanche' ? AVAL.end : mv === 'thunder' ? THUNDER.end : mv === 'blight' ? BLIGHT.end : mv === 'scald' ? SCALD.end : mv === 'wildfire' ? WILDFIRE.end : mv === 'fumes' ? FUMES.end : mv === 'frostbite' ? FROSTBITE.end : 3);
/** The film: one move, or (charge3) three runs, wheeling round between, each faster. */
const segs: Seg[] = [];
{
  // (its death: the charge down its lane, killed flat out, and on from there)
  const plan: [string, 'front' | 'rear', number, number?][] = move === 'charge3'
    ? [['charge', 'front', 1], ['wheel', 'front', 1], ['charge', 'rear', 1.15], ['wheel', 'rear', 1.15], ['charge', 'front', 1.3]]
    : move === 'fall' ? [['charge', view, 1, FALL.from], ['fall', view, 1]]
    : [[move, view, 1]];
  let from: V2 = [0, 0];
  for (const [mv, vw, speed, until] of plan) {
    const f = floorOf(mv);
    const end = until ?? longOf(mv);
    const sg: Seg = { move: mv, view: vw, from, speed, long: end / speed, floorAt: f, end, join: segs.length > 0 && mv === 'fall' };
    segs.push(sg);
    const e = f(end);
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
  for (let j = sg.join ? 1 : 0; j <= n; j++, i++) {
    const t = Math.min(sg.end ?? longOf(sg.move), (j / 30) * sg.speed);
    const world = (tt: number): [number, number, number] => {
      const f = sg.floorAt(tt);
      return [sg.from[0] + k * f[0], sg.from[1] + k * f[1], 0];
    };
    const fallFilm = move === 'fall';
    const meldFilm = sg.move === 'eruption';
    const turnFilm = sg.move === 'turn';
    const avalFilm = sg.move === 'avalanche';
    const thunderFilm = sg.move === 'thunder';
    const hailFilm = sg.move === 'hailstorm';
    const deathFilm = sg.move === 'death';
    const FALL_END = fallCarry(FALL.long) * TILE;
    const lead = sg.move === 'fall' ? 50 + 60 * Math.min(1, t / 1.2) : 50;
    // (as his shade rises, the camera lifts to take it in)
    const lift = sg.move === 'fall' ? 60 * Math.min(1, Math.max(0, (t - FALL.shade[0]) / (FALL.shade[1] - FALL.shade[0]))) : 0;
    const blightFilm = sg.move === 'blight';
    const [tx, ty] = sg.move === 'frostbite' ? at([sg.from[0] + 4.6 * TILE, sg.from[1] - 0.2 * TILE, 40]) : sg.move === 'fumes' ? at([sg.from[0] + 4.6 * TILE, sg.from[1] - 0.2 * TILE, 40]) : sg.move === 'wildfire' ? at([sg.from[0] + 4.6 * TILE, sg.from[1] - 0.2 * TILE, 50]) : sg.move === 'scald' ? at([sg.from[0] + 4.6 * TILE, sg.from[1] - 0.2 * TILE, 40]) : blightFilm ? at([sg.from[0] + BLIGHT_AT[0] + 1.6 * TILE, sg.from[1] + BLIGHT_AT[1], 110]) : thunderFilm ? at([sg.from[0] + 4.85 * TILE, sg.from[1] - 1.75 * TILE, 70]) : avalFilm ? at([sg.from[0] + 4.6 * TILE, sg.from[1] - 0.2 * TILE, 30]) : turnFilm ? at([sg.from[0] + 0.6 * TILE, sg.from[1] - 0.2 * TILE, 70]) : hailFilm ? at([sg.from[0] + 3.3 * TILE, sg.from[1] - 0.4 * TILE, 75]) : deathFilm ? at([sg.from[0] + 0.9 * TILE, sg.from[1] - 0.3 * TILE, 70]) : meldFilm ? at([sg.from[0] + 3.4 * TILE, sg.from[1] - 0.2 * TILE, 80]) : fallFilm ? at([world(t)[0] + lead - lift, world(t)[1] - 50 * (lead / 110) + lift, 0]) : sg.move === 'power' ? at([sg.from[0] + 3.1 * TILE, sg.from[1] + 0.2 * TILE, 0]) : sg.move === 'flame' ? at([sg.from[0] + STORM_AT[0] - 1.0 * TILE, sg.from[1] + STORM_AT[1], 0]) : sg.move === 'frost' ? at([sg.from[0] + 3.6 * TILE, sg.from[1] + 0.4 * TILE, 0]) : sg.move === 'lightning' ? at([sg.from[0] + 3.8 * TILE, sg.from[1] + 0.2 * TILE, 0]) : sg.move === 'poison' ? at([sg.from[0] + 4.8 * TILE, sg.from[1] + 0.2 * TILE, 0]) : at(world(t));
    camX += (tx - camX) * (i === 0 ? 1 : 0.32);
    camY += (ty - camY) * (i === 0 ? 1 : 0.32);
    // (the screen kicks as it bursts off and as it digs in to stop: his rulebook's Animations, “the screen kicks on big casts and hits”)
    const kick = sg.move === 'frostbite' ? Math.max(0, 1 - Math.abs(t - MELD.slam - FROSTBITE.freeze - 0.05) / 0.3) * 8 + (t > MELD.slam + FROSTBITE.wave[0] && t < MELD.slam + FROSTBITE.wave[1] ? 1.5 : 0) : sg.move === 'fumes' ? Math.max(0, ...FUMES_CLOUDS.map((c) => 1 - Math.abs(t - c.boom - 0.04) / 0.3)) * 8 + Math.max(0, ...FUMES_CLOUDS.map((c) => 1 - Math.abs(t - c.vent) / 0.12)) * 2 : sg.move === 'wildfire' ? Math.max(0, ...WILD_NODES.map((n) => 1 - Math.abs(t - n.t - 0.02) / 0.12)) * 3 + Math.max(0, 1 - Math.abs(t - WILD_BOOM() - 0.05) / 0.35) * 9 : sg.move === 'scald' ? (t > MELD.slam + SCALD.heat[0] && t < MELD.slam + SCALD.flash ? 0.5 + 1.5 * ((t - MELD.slam - SCALD.heat[0]) / (SCALD.heat[1] - SCALD.heat[0])) : 0) + Math.max(0, 1 - Math.abs(t - MELD.slam - SCALD.flash - 0.05) / 0.35) * 7 + (t > MELD.slam + SCALD.beams[0] && t < MELD.slam + SCALD.beams[1] ? 1.2 : 0) + Math.max(0, 1 - Math.abs(t - MELD.slam - SCALD.beams[0] - 0.03) / 0.2) * 4 : sg.move === 'blight' ? (t > MELD.slam + BLIGHT.spread[0] && t < MELD.slam + BLIGHT.heave ? 0.6 + 1.2 * ((t - MELD.slam) / BLIGHT.heave) : 0) + Math.max(0, 1 - Math.abs(t - MELD.slam - BLIGHT.heave - 0.08) / 0.3) * 7 : sg.move === 'avalanche' ? (t > MELD.slam + AVAL.rumble[0] && t < AVAL_OUT() + AVAL.cross + AVAL.stream ? 1 + 5 * Math.min(1, Math.max(0, (t - MELD.slam - AVAL.rumble[0]) / (AVAL.rumble[1] - AVAL.rumble[0]))) : 0) : sg.move === 'thunder' ? Math.max(0, ...THUNDER_STRIKES.map((st) => Math.max(4 * (1 - Math.abs(t - st.t - 0.02) / 0.12), 9 * (1 - Math.abs(t - st.t - THUNDER.clapAfter - 0.05) / 0.3), t > st.lock && t < st.t ? 0.8 + 1.4 * ((t - st.lock) / (st.t - st.lock)) : 0))) : sg.move === 'death' ? Math.max(0, 1 - Math.abs(t - 0.02) / 0.12) * 3 + Math.max(0, 1 - Math.abs(t - DEATH.burst - 0.02) / 0.25) * 7 + (t > 0.3 && t < 1.35 ? 1.5 : 0) : sg.move === 'fall' ? Math.max(0, 1 - Math.abs(t - FALL.kill - 0.02) / 0.1) * 3 + Math.max(0, 1 - Math.abs(t - FALL.kill - 0.22) / 0.15) * 5 + Math.max(0, 1 - Math.abs(t - FALL.slam - 0.03) / 0.3) * 8 : sg.move === 'charge' ? Math.max(0, 1 - Math.abs(t - CHARGE_STRIKE[1]) / 0.1) * 3 + Math.max(0, 1 - Math.abs(t - CHARGE_SKID[0] - 0.1) / 0.12) * 2 : sg.move === 'gore' ? Math.max(0, 1 - Math.abs(t - GORE.hit - 0.02) / 0.12) * 4 : sg.move === 'stomp' ? Math.max(0, 1 - Math.abs(t - STOMP.hit - 0.03) / 0.25) * 7 : sg.move === 'power' ? Math.max(0, ...POWER.slams.map((h) => 1 - Math.abs(t - h - 0.03) / 0.2)) * 6 : sg.move === 'flame' ? Math.max(0, ...FIRE_DROPS.map((d) => 1 - Math.abs(t - d.t - 0.02) / 0.1)) * 2 : sg.move === 'frost' ? Math.max(0, 1 - Math.abs(t - FROST.hit - 0.03) / 0.25) * 5 : sg.move === 'lightning' ? Math.max(0, ...[...BOLT.bursts, ...BOLT.zaps].map((b) => 1 - Math.abs(t - b - 0.03) / 0.15), 1 - Math.abs(t - BOLT.crack) / 0.12) * 4 : 0;
    const ox = sx - Math.round(camX) + Math.round(kick * Math.sin(i * 2.7));
    const oy = sy - Math.round(camY) + Math.round(kick * Math.cos(i * 3.1));
    const s = floor(-ox, -oy);
    if (sg.move === 'charge') lane(s, t, ox, oy, sg.from, k);
    if (sg.move === 'fall') scrape(s, t, ox, oy, sg.from, k);
    if (sg.move === 'fall') slamFloor(s, t, ox, oy, sg.from, k);
    if (sg.move === 'eruption') meldScene(s, t, ox, oy, sg.from, k, 'eruption', 'power', 'fire', MELD_GLYPH.eruption, [MELD_RAMP.eruption[3], MELD_RAMP.eruption[4]], ERUPT_AT, true);
    if (sg.move === 'death') {
      // (the hero, who struck the last blow, before him)
      const [hx, hy] = at([sg.from[0] + k * 2.9 * TILE, sg.from[1] - k * 1.7 * TILE, 0]);
      hero(s, ox + hx, oy + hy);
      // (his shade dragged back down into him, writhing, flickering, gone)
      const g0 = Math.min(1, Math.max(0, (t - DEATH.shade[0]) / (DEATH.shade[1] - DEATH.shade[0])));
      const g = 1 - g0 * g0;
      if (g > 0.02 && !(g0 > 0 && Math.floor(t * 30) % 3 === 0)) {
        const sk = skeletonAt(mob, 'death', Math.max(0, t - SHADE.lag));
        const [x, y] = at([sg.from[0] + k * sk.pelvis[0], sg.from[1] + k * sk.pelvis[1], 0]);
        layShade(s, paintShade(sk, t, sg.view, g, 6 * Math.sin(t * 40) * g0), ox + x, oy + y, 0.67 * (0.4 + 0.6 * g));
      }
      // (the burst: a ring of his light thrown out over the floor from where he was)
      if (t > DEATH.burst && t < DEATH.burst + 0.7) {
        const u = (t - DEATH.burst) / 0.7;
        const r = 6 + 120 * (1 - (1 - u) * (1 - u));
        for (let i = 0; i < 360; i++) {
          const a = (i / 360) * Math.PI * 2;
          for (let w = -3; w <= 1; w++) {
            const [px, py] = at([sg.from[0] + Math.cos(a) * (r + w), sg.from[1] + Math.sin(a) * (r + w), 0]);
            mix(s, Math.round(ox + px), Math.round(oy + py), w > -1 ? '#ffd8e6' : '#ff4f8a', 0.8 * (1 - u));
          }
        }
      }
    }
    if (sg.move === 'thunder') {
      thunderFloor(s, t, ox, oy, sg.from, k);
      meldScene(s, t, ox, oy, sg.from, k, 'thunder', 'power', 'lightning', MELD_GLYPH.thunder, [MELD_RAMP.thunder[3], MELD_RAMP.thunder[4]], [0, 0, 0], true, true);
    }
    if (sg.move === 'avalanche') {
      avalFloor(s, t, ox, oy, sg.from, k);
      meldScene(s, t, ox, oy, sg.from, k, 'avalanche', 'power', 'frost', MELD_GLYPH.avalanche, [MELD_RAMP.avalanche[3], MELD_RAMP.avalanche[4]], [ARENA.x[0] * TILE, 0, 40], true, false);
    }
    if (sg.move === 'hailstorm') {
      hailFloor(s, t, ox, oy, sg.from, k);
      meldScene(s, t, ox, oy, sg.from, k, 'hailstorm', 'frost', 'lightning', MELD_GLYPH.hailstorm, [MELD_RAMP.hailstorm[3], MELD_RAMP.hailstorm[4]], [0, 0, 0], true, true);
    }
    if (sg.move === 'blight') {
      blightFloor(s, t, ox, oy, sg.from, k);
      meldScene(s, t, ox, oy, sg.from, k, 'blight', 'power', 'poison', MELD_GLYPH.blight, [MELD_RAMP.blight[3], MELD_RAMP.blight[4]], BLIGHT_AT, true);
    }
    if (sg.move === 'scald') { scaldFloor(s, t, ox, oy, sg.from, k); steam(s, t, ox, oy, sg.from, k, true); }
    if (sg.move === 'frostbite') biteFloor(s, t, ox, oy, sg.from, k);
    const amid = AMID[sg.move];
    const [, fumesSplit] = sg.move === 'fumes' ? ((): [number, number] => { const h = fumesHeroAt(t), [, y] = at([sg.from[0] + k * h[0], sg.from[1] + k * h[1], 0]); return [0, oy + y]; })() : [0, 0];
    if (sg.move === 'fumes') { fumesFloor(s, t, ox, oy, sg.from, k); fumesClouds(s, t, ox, oy, sg.from, k, false, fumesSplit); }
    const [, wildSplit] = sg.move === 'wildfire' ? ((): [number, number] => { const h = wildHeroAt(t), [, y] = at([sg.from[0] + k * h[0], sg.from[1] + k * h[1], 0]); return [0, oy + y]; })() : [0, 0];
    if (sg.move === 'wildfire') { wildFloor(s, t, ox, oy, sg.from, k); wildfire(s, t, ox, oy, sg.from, k, false, wildSplit); }
    if (sg.move === 'eruption' || sg.move === 'foot' || sg.move === 'hailstorm' || sg.move === 'turn' || sg.move === 'avalanche' || sg.move === 'thunder' || sg.move === 'wildfire' || sg.move === 'fumes' || amid) {
      // (the hero, out before him)
      const [bx0, by0] = at([sg.from[0], sg.from[1], 0]);
      // (what the meld makes stands among them all (the dead trees, the steam): all of it laid first; then, over each figure as it
      // is drawn, what of it is nearer the eye)
      if (amid) layPainted(s, amid.paint(t, sg.view, null), amid.can, ox + bx0, oy + by0, 0);
      const wasHero = amid ? s.d.slice() : null;
      if (amid) for (const [m, a] of [[2, 0.25], [1, 0.45]] as const) {
        const p = amid.hero(t - m / 30), q = amid.hero(t);
        if (Math.hypot(p[0] - q[0], p[1] - q[1]) < 4) continue;
        const [gx, gy] = at([sg.from[0] + k * p[0], sg.from[1] + k * p[1], 0]);
        hero(s, ox + gx, oy + gy, a);
      }
      const hh = sg.move === 'fumes' ? fumesHeroAt(t) : sg.move === 'wildfire' ? wildHeroAt(t) : amid ? amid.hero(t) : sg.move === 'thunder' ? thunderHeroAt(t) : sg.move === 'hailstorm' ? HAIL_HERO : sg.move === 'avalanche' ? [AVAL.safe.at[0] * TILE, AVAL.safe.at[1] * TILE, 0] : [5.0 * TILE, -1.6 * TILE, 0];
      const [hx, hy] = at([sg.from[0] + k * hh[0], sg.from[1] + k * hh[1], 0]);
      if (sg.move === 'thunder') for (const [m, a] of [[2, 0.25], [1, 0.45]] as const) {
        // (dashing: after-images of him where he was a moment ago)
        const p = thunderHeroAt(t - m / 30);
        if (Math.hypot(p[0] - hh[0], p[1] - hh[1]) < 4) continue;
        const [gx, gy] = at([sg.from[0] + k * p[0], sg.from[1] + k * p[1], 0]);
        hero(s, ox + gx, oy + gy, a);
      }
      hero(s, ox + hx, oy + hy);
      if (wasHero && amid) layOver(s, wasHero, amid.paint(t, sg.view, hh), amid.can, ox + bx0, oy + by0);
      // (HIS SHADE, behind him, doing as he does a moment after him)
      const sk = skeletonAt(mob, sg.move, Math.max(0, t - SHADE.lag));
      const [x, y] = at([sg.from[0] + k * sk.pelvis[0], sg.from[1] + k * sk.pelvis[1], 0]);
      // (the avalanche pours straight past him and his shade (his words, 13 Nov 2026: “it doesn’t need the circle under the boss, he’s
      // fine”): all of it laid before them; then, where the shade is drawn, the snow nearer the eye than it over it; below, the same
      // for him)
      const [bx, by] = at([sg.from[0], sg.from[1], 0]);
      if (sg.move === 'avalanche') layPainted(s, paintAvalanche(t, sg.view), AVAL_CANVAS, ox + bx, oy + by, 0);
      const was = sg.move === 'avalanche' || amid ? s.d.slice() : null;
      layShade(s, paintShade(sk, t, sg.view, 1, 0, sg.move === 'turn' ? shadeGlide(turnYaw, t) : undefined), ox + x, oy + y, 0.78);
      if (was && sg.move === 'avalanche') layOver(s, was, paintAvalanche(t, sg.view, AVAL_SHADE_AT), AVAL_CANVAS, ox + bx, oy + by);
      if (was && amid) layOver(s, was, amid.paint(t, sg.view, AVAL_SHADE_AT), amid.can, ox + bx, oy + by);
    }
    const beforeHim = sg.move === 'avalanche' || amid ? s.d.slice() : null;
    if (fallFilm) {
      // (the hero, out of its lane, watching; just past where his ring will reach)
      const last = segs[segs.length - 1];
      const [hx, hy] = at([last.from[0] + FALL_END + 130 + 3.3 * TILE, last.from[1] - 3.6 * TILE, 0]);
      hero(s, ox + hx, oy + hy);
    }
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
    if (sg.move === 'fall' && t > FALL.shade[0]) {
      // (HIS SHADE, torn up out of him as he strikes, looming over him from behind: laid behind him, see-through, its light over all)
      const grow = Math.min(1, Math.max(0, (t - FALL.shade[0]) / (FALL.shade[1] - FALL.shade[0])));
      const g = grow * grow * (3 - 2 * grow);
      const sk = skeletonAt(mob, 'fall', Math.max(FALL.shade[0], t - SHADE.lag));
      const [x, y] = at([sg.from[0] + k * (fallCarry(t) * TILE + sk.pelvis[0]), sg.from[1] + k * sk.pelvis[1], 0]);
      layShade(s, paintShade(sk, t, sg.view, g), ox + x, oy + y, 0.25 + 0.42 * g);
    }
    if ((sg.move === 'eruption' || sg.move === 'hailstorm' || sg.move === 'avalanche' || sg.move === 'thunder' || sg.move === 'blight' || sg.move === 'scald' || sg.move === 'wildfire' || sg.move === 'fumes' || sg.move === 'frostbite') && meldSmeared(t)) {
      const [x, y] = base();
      for (const [m, a] of [[2, 0.25], [1, 0.45]] as const) lay(s, sg.move, sg.view, t - m * (1 / 90), x, y, a);
    }
    if (sg.move === 'foot' || sg.move === 'turn' || sg.move === 'avalanche' || sg.move === 'thunder' || sg.move === 'blight' || sg.move === 'scald' || sg.move === 'wildfire' || sg.move === 'fumes' || sg.move === 'frostbite' || sg.move === 'death' || sg.move === 'eruption' || sg.move === 'hailstorm' || sg.move === 'wheel' || sg.move === 'gore' || sg.move === 'stomp' || sg.move === 'power' || sg.move === 'flame' || sg.move === 'frost' || sg.move === 'lightning' || sg.move === 'poison') {
      const [x, y] = base();
      lay(s, sg.move, sg.view, t, x, y);
    } else {
      const [x, y] = where(t);
      lay(s, sg.move, sg.view, t, x, y);
    }
    if (sg.move === 'death' && t < 2.5 / 30) {
      const [x, y] = base();
      flash(s, sg.move, sg.view, t, x, y, t < 1 / 30 ? 0.75 : 0.4);
    }
    if (sg.move === 'fall' && t > FALL.kill - 1e-6 && t < FALL.kill + 2.5 / 30) {
      // (killed: his pink flaring out of all of it at once)
      const [x, y] = where(t);
      flash(s, sg.move, sg.view, t, x, y, t < FALL.kill + 1 / 30 ? 0.75 : 0.4);
    }
    if (sg.move === 'thunder') {
      const [x, y] = base();
      layPainted(s, paintThunder(t, sg.view), THUNDER_CANVAS, x, y, 0);
      // (each great bolt: a pillar of lightning out of the top of the picture, the width of a man, white at its core, violet, forking;
      // the room lit for a frame)
      // (LIGHTNING THAT LOOKS LIKE LIGHTNING (his words, 13 Nov 2026: “The lightning doesn’t look like lightning”): one thin channel
      // white-hot, jagged at every scale, forking as it comes down; it flickers, out and back, and the room flashes with it)
      let hit = -Infinity;
      for (const [bi, st] of THUNDER_STRIKES.entries()) {
        const f = Math.floor((t - st.t) * 30 + 1e-6);
        if (f < 0 || f >= SKY_FLICKER.length) continue;
        const [x1, y1] = at([sg.from[0] + k * st.at[0], sg.from[1] + k * st.at[1], 0]);
        skyBolt(s, ox + x1, oy + y1, 1000 + bi * 97, SKY_FLICKER[f]);
        if (f === 0 || f === 3) for (let yy = 0; yy < s.h; yy++) for (let xx = 0; xx < s.w; xx++) mix(s, xx, yy, '#fffbe0', f === 0 ? 0.3 : 0.14);
        hit = Math.max(hit, oy + y1);
      }
      // (the hero, nearer the eye than where it struck: over it)
      { const hh = thunderHeroAt(t), [hx, hy] = at([sg.from[0] + k * hh[0], sg.from[1] + k * hh[1], 0]); if (oy + hy > hit && hit > -Infinity) hero(s, ox + hx, oy + hy); }
      meldScene(s, t, ox, oy, sg.from, k, 'thunder', 'power', 'lightning', MELD_GLYPH.thunder, [MELD_RAMP.thunder[3], MELD_RAMP.thunder[4]], [0, 0, 0], false, true);
    }
    if (sg.move === 'fumes') {
      fumesClouds(s, t, ox, oy, sg.from, k, true, fumesSplit);
      meldScene(s, t, ox, oy, sg.from, k, 'fumes', 'fire', 'poison', MELD_GLYPH.fumes, [MELD_RAMP.fumes[3], MELD_RAMP.fumes[4]], [FUMES.at * TILE, 0, 0], false);
    }
    if (sg.move === 'wildfire') {
      wildfire(s, t, ox, oy, sg.from, k, true, wildSplit);
      meldScene(s, t, ox, oy, sg.from, k, 'wildfire', 'fire', 'lightning', MELD_GLYPH.wildfire, [MELD_RAMP.wildfire[3], MELD_RAMP.wildfire[4]], [WILDFIRE.at * TILE, 0, 0], false);
    }
    if (amid) {
      const [x, y] = base();
      if (beforeHim) layOver(s, beforeHim, amid.paint(t, sg.view, [0, 0, 0]), amid.can, x, y);
      if (sg.move === 'frostbite') {
        biteMist(s, t, ox, oy, sg.from, k);
        if (t > BITE_HIT) { const h = biteHeroAt(t), [hx, hy] = at([sg.from[0] + k * h[0], sg.from[1] + k * h[1], 0]); heroChilled(s, ox + hx, oy + hy, t, Math.min(1, (t - BITE_HIT) / 1.4)); }
      }
      if (sg.move === 'scald') { scaldBeams(s, t, ox, oy, sg.from, k); steam(s, t, ox, oy, sg.from, k, false); }
      meldScene(s, t, ox, oy, sg.from, k, sg.move, amid.words[0], amid.words[1], MELD_GLYPH[sg.move as 'blight'], [MELD_RAMP[sg.move as 'blight'][3], MELD_RAMP[sg.move as 'blight'][4]], amid.into, false);
    }
    if (sg.move === 'avalanche') {
      const [x, y] = base();
      if (beforeHim) layOver(s, beforeHim, paintAvalanche(t, sg.view, [0, 0, 0]), AVAL_CANVAS, x, y);
      // (the hero, in the safe strip, nearer the eye than the snow: drawn over it)
      { const [hx, hy] = at([sg.from[0] + k * AVAL.safe.at[0] * TILE, sg.from[1] + k * AVAL.safe.at[1] * TILE, 0]); hero(s, ox + hx, oy + hy); }
      meldScene(s, t, ox, oy, sg.from, k, 'avalanche', 'power', 'frost', MELD_GLYPH.avalanche, [MELD_RAMP.avalanche[3], MELD_RAMP.avalanche[4]], [ARENA.x[0] * TILE, 0, 40], false, false);
    }
    if (sg.move === 'hailstorm') {
      const [x, y] = base();
      layPainted(s, paintHail(t, sg.view), HAIL_CANVAS, x, y, 0);
      // (its bolts, cracking down out of the cloud's belly onto their spots, forking)
      for (const [bi, b] of HAIL_BOLTS.entries()) {
        if (t < b.t || t > b.t + 0.13) continue;
        const [x0, y0] = at([sg.from[0] + k * (b.at[0] - 20), sg.from[1] + k * b.at[1], HAIL.high - 10]);
        const [x1, y1] = at([sg.from[0] + k * b.at[0], sg.from[1] + k * b.at[1], 0]);
        // (from out of the picture's top, where the cloud is)
        boltLine(s, ox + x1 - 30, 0, ox + x1, oy + y1, bi * 17 + Math.floor(t * 60), 3, 1, 3);
        if (t < b.t + 1 / 30) for (let yy = 0; yy < s.h; yy++) for (let xx = 0; xx < s.w; xx++) mix(s, xx, yy, '#cad6ff', 0.16);
        void x0; void y0;
      }
      meldScene(s, t, ox, oy, sg.from, k, 'hailstorm', 'frost', 'lightning', MELD_GLYPH.hailstorm, [MELD_RAMP.hailstorm[3], MELD_RAMP.hailstorm[4]], [0, 0, 0], false, true);
    }
    if (sg.move === 'eruption') {
      const [x, y] = base();
      layPainted(s, paintEruption(t, sg.view), ERUPT_CANVAS, x, y, 0);
      meldScene(s, t, ox, oy, sg.from, k, 'eruption', 'power', 'fire', MELD_GLYPH.eruption, [MELD_RAMP.eruption[3], MELD_RAMP.eruption[4]], ERUPT_AT, false);
    }
    if (sg.move === 'power') powerScene(s, t, ox, oy, sg.from, k, true);
    if (sg.move === 'flame') flameScene(s, t, ox, oy, sg.from, k, true);
    if (sg.move === 'frost') frostScene(s, t, ox, oy, sg.from, k, true);
    if (sg.move === 'lightning') boltScene(s, t, ox, oy, sg.from, k, true);
    if (sg.move === 'poison') sporeScene(s, t, ox, oy, sg.from, k, true);
    writeFileSync(`${out}/f/${String(i).padStart(3, '0')}.png`, png(s));
    if (sg.move === 'fall' && t >= FALL.slam - 1e-6 && t < FALL.slam + 1 / 30 - 1e-6) for (let h = 0; h < 3; h++) writeFileSync(`${out}/f/${String(++i).padStart(3, '0')}.png`, png(s));
  }
}
const N = i - 1;
const long = segs.reduce((a, b) => a + b.long, 0);
console.log(N + 1, 'frames', long.toFixed(2), 's');
