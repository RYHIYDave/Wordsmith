// BINDING AT WORK: how the word Binding LOOKS. A mock-up of the art chat's, behind BINDING3, which is
// off: with it off nothing here is drawn or called, and the game is as it was. Its rules are the main
// chat's, written once its look has his yes.
//
// His pick for new words on floors 11 to 15 (the main chat's 22:34, 21 Oct 2026): “Binding”, one of
// the words kept on his page "Wordsmith: Words, Crafting, Ranks": Control; in front, holds enemies in
// place; behind, leaves a snare for the next enemy to cross; on a monster, monsters root you. Asked how
// its hold should look, his pick to the art chat (21 Oct, by 20:43 Pacific): “Bands of written words
// (Recommended)”, offered as: ribbons of glowing script whip out and wrap round the enemy, pinning it;
// the snare a written sigil that lashes up at whoever crosses it.
//
// So: BANDS OF WRITTEN WORDS. In front, the bands leap up out of the floor round what it strikes, whip
// over and wrap it, at its feet, its middle and its chest, and are pinned to the floor by pegs of
// light; while it is held the script crawls round the bands and they strain; when the hold runs out
// they unravel, the letters peeling off. Behind, a sigil written on the floor, a ring of script round a
// coiled band, waiting; the first to cross it is lashed by the coil and bound as above, and the sigil
// burns out. On a monster, the monster's own bands, dark ink written in the enemy's pink, are flung at
// the hero and bind his legs to the floor.
//
// HOW THE RULES CALL IT (eventsB3, from main.ts with the frame's events, while BINDING3.on):
//   { t: 'bind', id, secs }                one held by Binding in front, for secs;
//   a zone carrying `look` or a word 'binding' (any kind; the rules' 'snare' say): the snare lying;
//   { t: 'snareSprung', id, x, y, secs }   the snare at (x, y) springing on monster id;
//   { t: 'rooted', x, y, secs }            the hero rooted by a monster's Binding, cast from (x, y);
//   { t: 'unbind', id }                    a hold broken early (id -1: the hero's).

import { FIGURE_SIZE, figureOf } from '../art/bestiary';
import { P } from '../art/palette';
import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { hash2 } from '../engine/rng';
import type { Game } from '../game/game';
import type { Monster, Zone } from '../game/state';
import type { Cam, Fx } from './fx';

/** The switch. Off: nothing here is drawn or called, and the game is as it was. */
export const BINDING3 = { on: false };

/**
 * Binding's colours, darkest to brightest (the last its white-hot); index 3 its own colour, index 4
 * its glow, as every word's. Parchment: the written word. As the eye sees colour (CIEDE2000) it is 13.0
 * from the enemy's gold (its nearest), 13.9 from Heavy, 14.2 from Fumes, 14.3 from Scald, and further
 * from every other word, the melds and the friend's cyan.
 */
export const BIND_RAMP: readonly string[] = ['#1e1810', '#3e3424', '#7a6a4e', '#c8b48a', '#f2e8cc', '#ffffff'];
export const BIND_COLOR = BIND_RAMP[3];
export const BIND_GLOW = BIND_RAMP[4];
/** A monster's Binding: dark ink, written in the enemy's pink burning to gold (his rule: pink and gold glows are the enemy's). */
export const BIND_ENEMY: readonly string[] = ['#0e050a', '#2a0c1c', '#5a1438', '#c02860', '#ff4f8a', '#ffd27a'];

/** Its glyph, cut in the rune stone as the others are: 7x7, 'X' its colour, 'o' its glowing core: a band tied in a knot. */
export const BIND_GLYPH: readonly string[] = ['XX...XX', 'X.X.X.X', 'X..o..X', 'X.X.X.X', 'XX...XX', '...X...', '..X.X..'];
export const BIND_GLYPH_IS = 'a band tied in a knot';

/** Its rune stone, as the others are cut (art/icons.ts, runeSprite). */
export function bindRune(): Sprite {
  const rows = ['............', '..11111111..', '.1222222223.', '.1222222223.', '.1222222223.', '.1222222223.', '.1222222223.', '.1222222223.', '.1222222223.', '.1222222223.', '..33333333..', '............'];
  const p = new Px(12, 12);
  const tone: Record<string, string> = { '1': P.st6, '2': P.st5, '3': P.st3 };
  rows.forEach((row, y) => [...row].forEach((ch, x) => tone[ch] && p.set(x, y, tone[ch])));
  const g = BIND_GLYPH;
  const on = (gx: number, gy: number): boolean => gy >= 0 && gy < 7 && gx >= 0 && gx < 7 && g[gy].charAt(gx) !== '.';
  for (let gy = 0; gy < 7; gy++) {
    for (let gx = 0; gx < 7; gx++) {
      if (!on(gx, gy)) continue;
      if (!on(gx, gy - 1)) p.set(3 + gx, 2 + gy, P.st3);
      if (!on(gx - 1, gy)) p.set(2 + gx, 3 + gy, P.st3);
    }
  }
  for (let gy = 0; gy < 7; gy++) for (let gx = 0; gx < 7; gx++) if (on(gx, gy)) p.set(3 + gx, 3 + gy, g[gy].charAt(gx) === 'o' ? BIND_GLOW : BIND_COLOR);
  return p.outline(P.ink).sprite(6, 10);
}

/**
 * How long each part takes, as the pictures want it (the hold's length is the rules'): the bands
 * whip out over `whip`, wrap and snap tight by `wrap`, and unravel over the last `unravel` of the hold.
 */
export const BIND_TIME = { whip: 0.16, wrap: 0.3, unravel: 0.35, sprung: 0.6 };

// =============================================================================================
// What is going on.

/** A band leaping from where it starts (`from`, world) to wrap round the held at `h` of their height. */
interface Band {
  fromX: number;
  fromY: number;
  /** Its height on the held, 0 (the feet) to 1 (the top of the head); its turn round them as it starts. */
  h: number;
  a0: number;
  /** Seconds it waits before it leaps. */
  delay: number;
}

/** One held: monster `id`, or the hero (-1). */
interface Hold {
  id: number;
  t: number;
  dur: number;
  enemy: boolean;
  bands: Band[];
  /** Where its bands are pinned to the floor (world), each a peg of light. */
  pegs: [number, number][];
  /** Where the hold was drawn last frame, for the lights and the letters peeling off: screen x, foot y, height, half-width. */
  at?: [number, number, number, number];
  unravelled: boolean;
}

/** A snare sprung, burning out: where, seconds since. */
interface Burn {
  x: number;
  y: number;
  r: number;
  t: number;
  dur: number;
}

export const B3 = {
  clock: 0,
  holds: [] as Hold[],
  burns: [] as Burn[],
  later: [] as { t: number; fn: () => void }[],
  /** The playtest's hands: its hits bind (seconds), its snares spring on what crosses them, and the snares it has laid. */
  demo: { hits: 0, snares: false },
};

const MAX_PARTICLES = 900;
const TAU = Math.PI * 2;
const rnd = (a: number, b: number): number => a + Math.random() * (b - a);
const pick = (list: readonly string[]): string => list[Math.floor(Math.random() * list.length)];
const easeOut = (q: number): number => 1 - (1 - q) * (1 - q) * (1 - q);

export function clearB3(): void {
  B3.holds.length = 0;
  B3.burns.length = 0;
  B3.later.length = 0;
}

const wx = (c: Cam, x: number, y: number): number => c.ox + (x - y) * 16;
const wy = (c: Cam, x: number, y: number): number => c.oy + (x + y) * 8 - (c.lift ? c.lift(x, y) : 0);

function pline(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string): void {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  g.fillStyle = color;
  for (let n = 0; n < 600; n++) {
    g.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

type P3 = Fx['particles'][number];
function add(fx: Fx, p: P3): void {
  if (fx.particles.length < MAX_PARTICLES) fx.particles.push(p);
}

function later(t: number, fn: () => void): void {
  B3.later.push({ t, fn });
}

/** Letters flung off a place: little strokes of script, white and the band's glow. */
function letters(fx: Fx, x: number, y: number, n: number, C: readonly string[], o: { speed?: number; up?: number; z?: number; r?: number; grav?: number; life?: number } = {}): void {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU;
    const d = Math.sqrt(Math.random()) * (o.r ?? 0.2);
    const s = rnd(0.4, 1) * (o.speed ?? 2);
    const life = rnd(0.5, 1) * (o.life ?? 0.6);
    add(fx, { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, z: (o.z ?? 10) + rnd(-3, 3), vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: rnd(0.4, 1) * (o.up ?? 40), life, life0: life, ramp: [C[5], C[4], C[3], C[2]], color: C[4], size: 1, grav: o.grav ?? 60, streak: 2 });
  }
}

// =============================================================================================
// The looks the rules call up.

function heightOf(game: Game, id: number): number {
  if (id < 0) return 32;
  const m = game.monsters.find((q) => q.id === id);
  return m ? FIGURE_SIZE[figureOf(m)].top : 28;
}

/**
 * BINDING IN FRONT: monster `id` is held for `secs`. Three bands of script leap up out of the floor
 * round it (or out of `from`, a snare sprung), whip over, wrap it at its feet, its middle and its chest,
 * snap tight and are pinned to the floor.
 */
export function bindOn(fx: Fx, game: Game, id: number, secs: number, from?: [number, number], enemy = false): void {
  const holder = id < 0 ? game.hero : game.monsters.find((q) => q.id === id);
  if (!holder) return;
  B3.holds = B3.holds.filter((h) => h.id !== id);
  const C = enemy ? BIND_ENEMY : BIND_RAMP;
  const n = enemy ? 2 : 3;
  const heights = enemy ? [0.08, 0.3] : [0.12, 0.45, 0.72];
  const a0 = Math.random() * TAU;
  const bands: Band[] = [];
  const pegs: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = a0 + (i / n) * TAU;
    const px = holder.x + Math.cos(a) * 0.95;
    const py = holder.y + Math.sin(a) * 0.95;
    pegs.push([px, py]);
    bands.push({ fromX: from ? from[0] : px, fromY: from ? from[1] : py, h: heights[i], a0: a + Math.PI, delay: i * 0.04 });
  }
  B3.holds.push({ id, t: 0, dur: Math.max(BIND_TIME.wrap + BIND_TIME.unravel, secs), enemy, bands, pegs, unravelled: false });
  // the floor gives up its bands: a ring of script flashes out round it, the pegs driven in
  fx.rings.push({ x: holder.x, y: holder.y, r: 1.0, t: 0, dur: 0.26, colors: [C[5], C[4], C[3]], fill: false, heavy: true });
  for (const [px, py] of pegs) letters(fx, px, py, 4, C, { speed: 1, up: 70, z: 2, r: 0.1 });
  later(BIND_TIME.wrap - 0.02, () => {
    // they snap tight
    const h = heightOf(game, id);
    fx.flashes.push({ x: holder.x, y: holder.y, z: h * 0.45, r: 0.45, t: 0, dur: 0.1, colors: [C[5], C[4], C[3]] });
    letters(fx, holder.x, holder.y, 14, C, { speed: 3, up: 60, z: h * 0.45, r: 0.2 });
    fx.shake = Math.max(fx.shake, enemy ? 2 : 2.6);
    fx.hold(0.04);
    for (const [px, py] of pegs) {
      fx.flashes.push({ x: px, y: py, z: 2, r: 0.18, t: 0, dur: 0.08, colors: [C[5], C[4]] });
      add(fx, { x: px, y: py, z: 1, vx: rnd(-0.6, 0.6), vy: rnd(-0.6, 0.6), vz: rnd(30, 60), life: 0.35, color: '#6a5e50', size: 1, grav: 300 });
    }
  });
  if (fx.glows.length < 24) fx.glows.push({ x: holder.x, y: holder.y, r: 46, t: 0, dur: 0.35 });
}

/** BINDING BEHIND: the snare at (x, y) springs on monster `id`: its coil lashes up and binds it, and the sigil burns out. */
export function snareSprung(fx: Fx, game: Game, id: number, x: number, y: number, secs: number, r = 1.0): void {
  const C = BIND_RAMP;
  B3.burns.push({ x, y, r, t: 0, dur: BIND_TIME.sprung });
  fx.flashes.push({ x, y, z: 3, r: Math.min(1.2, r * 0.6), t: 0, dur: 0.12, colors: [C[5], C[4], C[3]] });
  fx.rings.push({ x, y, r: r * 1.15, t: 0, dur: 0.3, colors: [C[5], C[4], C[3]], fill: false, heavy: true });
  letters(fx, x, y, 22, C, { speed: 2.4, up: 90, z: 3, r: r * 0.6 });
  bindOn(fx, game, id, secs, [x, y]);
}

/** ON A MONSTER: the hero rooted for `secs` by a monster's Binding, cast from (x, y): its dark bands, written in pink, bind his legs. */
export function rootHero(fx: Fx, game: Game, secs: number, x: number, y: number): void {
  bindOn(fx, game, -1, secs, [x, y], true);
}

/** A hold broken early: it unravels at once. */
export function unbind(id: number): void {
  for (const h of B3.holds) if (h.id === id && h.t < h.dur - BIND_TIME.unravel) h.t = h.dur - BIND_TIME.unravel;
}

/** Whether this patch is Binding's snare (the renderer leaves it to the looks here). */
export function isSnare(z: Zone): boolean {
  const w = z as { look?: unknown };
  return w.look === 'binding' || (z.words as readonly string[]).includes('binding');
}
export function ownsZoneB3(z: Zone): boolean {
  return BINDING3.on && isSnare(z);
}

// =============================================================================================
// Drawing.

/** The script's letters: little shapes three pixels wide and two high, read along the band. */
const GLYPHS: readonly string[][] = [
  ['X.X', 'XXX'],
  ['XX.', '.XX'],
  ['X..', 'XXX'],
  ['.X.', 'X.X'],
  ['XXX', 'X..'],
  ['X.X', '.X.'],
  ['XX.', 'X.X'],
  ['.XX', 'XX.'],
];

/**
 * A band of script along a line of screen points: four pixels deep, a dark ribbon with its upper edge
 * lit and its lower in shadow, and along its middle the words written on it in light, letter after
 * letter, a gap between words, crawling along it (`scroll`, pixels).
 */
function bandAlong(g: CanvasRenderingContext2D, pts: number[], C: readonly string[], scroll: number, alpha = 1): void {
  if (alpha <= 0) return;
  g.globalAlpha = Math.min(1, alpha);
  let run = 0;
  const sc = Math.floor(scroll);
  for (let i = 0; i + 3 < pts.length; i += 2) {
    const x0 = pts[i];
    const y0 = pts[i + 1];
    const x1 = pts[i + 2];
    const y1 = pts[i + 3];
    const steps = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
    for (let s = 0; s < steps; s++) {
      const x = Math.round(x0 + ((x1 - x0) * s) / steps);
      const y = Math.round(y0 + ((y1 - y0) * s) / steps);
      g.fillStyle = C[2];
      g.fillRect(x, y - 1, 1, 1);
      g.fillStyle = C[0];
      g.fillRect(x, y, 1, 2);
      g.fillStyle = C[1];
      g.fillRect(x, y + 2, 1, 1);
      // the letter this pixel falls in, and its column in it (the fourth a space between letters)
      const k = run + sc;
      const ch = Math.floor(k / 4);
      const col = ((k % 4) + 4) % 4;
      const word = hash2(Math.floor(ch / 5), 3, 9);
      const gap = hash2(ch, 5, 11) < 0.18 || (((ch % 5) + 5) % 5 === 4 && word > 0.4);
      if (col < 3 && !gap) {
        const glyph = GLYPHS[Math.floor(hash2(ch, 1, 13) * GLYPHS.length)];
        const bright = hash2(ch, 2, 17) > 0.7 ? C[5] : C[4];
        g.fillStyle = bright;
        if (glyph[0][col] === 'X') g.fillRect(x, y, 1, 1);
        if (glyph[1][col] === 'X') g.fillRect(x, y + 1, 1, 1);
      }
      run++;
    }
  }
  g.globalAlpha = 1;
}

/** The front half of a ring round a figure (what is behind it is behind it), as screen points. */
function frontArc(cx: number, cy: number, rx: number, ry: number, from = 0, to = Math.PI): number[] {
  const pts: number[] = [];
  const n = Math.max(6, Math.round(rx * 1.2));
  for (let i = 0; i <= n; i++) {
    const a = from + ((to - from) * i) / n;
    pts.push(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry);
  }
  return pts;
}

/** A curve thrown from (x0, y0) to (x1, y1), screen, arched `lift` pixels up, from `a` to `b` of its way. */
function whipCurve(x0: number, y0: number, x1: number, y1: number, lift: number, a: number, b: number, wob: number): number[] {
  const pts: number[] = [];
  const n = 14;
  for (let i = 0; i <= n; i++) {
    const q = a + ((b - a) * i) / n;
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2 - lift;
    const u = 1 - q;
    const x = u * u * x0 + 2 * u * q * mx + q * q * x1 + Math.sin(q * 9 + wob) * 2 * (1 - q);
    const y = u * u * y0 + 2 * u * q * my + q * q * y1;
    pts.push(x, y);
  }
  return pts;
}

/** A peg of light driven into the floor, holding a band. */
function peg(g: CanvasRenderingContext2D, x: number, y: number, C: readonly string[], a: number): void {
  g.globalAlpha = a;
  g.fillStyle = C[1];
  g.fillRect(Math.round(x) - 1, Math.round(y) - 4, 3, 5);
  g.fillStyle = C[3];
  g.fillRect(Math.round(x), Math.round(y) - 4, 1, 4);
  g.fillStyle = C[5];
  g.fillRect(Math.round(x), Math.round(y) - 5, 1, 1);
  g.globalAlpha = 1;
}

function drawHold(g: CanvasRenderingContext2D, cam: Cam, h: Hold, game: Game): void {
  const holder = h.id < 0 ? game.hero : game.monsters.find((q) => q.id === h.id && !q.dead);
  if (!holder) return;
  const C = h.enemy ? BIND_ENEMY : BIND_RAMP;
  const top = h.id < 0 ? 32 : FIGURE_SIZE[figureOf(holder as Monster)].top;
  const half = h.id < 0 ? 8 : FIGURE_SIZE[figureOf(holder as Monster)].half;
  const sx = Math.round(wx(cam, holder.x, holder.y));
  const sy = Math.round(wy(cam, holder.x, holder.y));
  h.at = [sx, sy, top, half];
  const left = h.dur - h.t;
  const going = left < BIND_TIME.unravel ? 1 - left / BIND_TIME.unravel : 0;
  const scroll = B3.clock * 14;
  // (it strains now and then, the bands shuddering)
  const strain = Math.sin(B3.clock * 9 + h.id) > 0.92 ? 1 : 0;
  for (const b of h.bands) {
    const t = h.t - b.delay;
    if (t < 0) continue;
    const by = sy - Math.round(top * b.h);
    const tight = half * (b.h < 0.2 ? 0.8 : 1.0) + 2;
    const fx0 = wx(cam, b.fromX, b.fromY);
    const fy0 = wy(cam, b.fromX, b.fromY);
    if (t < BIND_TIME.whip) {
      // it leaps: its head flying from where it starts to its place on them, the band trailing behind it
      const q = easeOut(t / BIND_TIME.whip);
      const pts = whipCurve(fx0, fy0, sx + Math.cos(b.a0) * tight, by + Math.sin(b.a0) * tight * 0.38, 26 + top * 0.4, Math.max(0, q - 0.7), q, b.a0);
      bandAlong(g, pts, C, scroll);
      const hx = pts[pts.length - 2];
      const hy = pts[pts.length - 1];
      g.fillStyle = C[5];
      g.fillRect(Math.round(hx) - 1, Math.round(hy) - 1, 3, 3);
      continue;
    }
    // it wraps: a ring closing in to its width and snapping tight; then held; then unravelling out
    const w = Math.min(1, (t - BIND_TIME.whip) / (BIND_TIME.wrap - BIND_TIME.whip));
    const rx = (tight * (1.9 - 0.9 * easeOut(w)) + going * tight * 0.8) + (strain ? 1 : 0);
    const ry = rx * 0.38;
    const alpha = 1 - going;
    // its tether down to its peg
    if (w >= 1 && going < 0.6) {
      const pi = h.bands.indexOf(b);
      const [px, py] = h.pegs[pi];
      const ax = sx + Math.cos(Math.atan2(wy(cam, px, py) - sy, wx(cam, px, py) - sx)) * rx;
      bandAlong(g, [ax, by + ry * 0.6, wx(cam, px, py), wy(cam, px, py) - 2], C, -scroll, alpha * 0.9);
    }
    const wrapAt = w < 1 ? Math.PI * (0.35 + 0.65 * w) : Math.PI;
    bandAlong(g, frontArc(sx, by, rx, ry, 0, wrapAt), C, scroll + b.h * 20, alpha);
    if (w < 1 || strain) {
      g.fillStyle = C[5];
      g.fillRect(sx - Math.round(rx), by - 1, 1, 2);
      g.fillRect(sx + Math.round(rx), by - 1, 1, 2);
    }
  }
  // the pegs
  if (h.t > BIND_TIME.wrap - 0.05) for (const [px, py] of h.pegs) peg(g, wx(cam, px, py), wy(cam, px, py), C, 1 - going);
}

/** The snare lying in wait: a ring of script, a coiled band in it, pegs round it; breathing. */
function drawSnare(g: CanvasRenderingContext2D, cam: Cam, z: Zone, t: number): void {
  const C = BIND_RAMP;
  const cx = wx(cam, z.x, z.y);
  const cy = wy(cam, z.x, z.y);
  const r = Math.min(1.4, z.r);
  const born = Math.min(1, z.t / 0.3);
  const fade = Math.min(1, (z.dur - z.t) * 2) * born;
  const breath = 0.75 + 0.25 * Math.sin(t * 2.4 + z.x);
  // a faint pool of light under it
  g.globalAlpha = 0.22 * fade * breath;
  g.fillStyle = C[3];
  const rw = Math.round(r * 22.6);
  const rh = Math.round(r * 11.3);
  for (let dy = -rh; dy <= rh; dy++) {
    const half = Math.round(rw * Math.sqrt(1 - (dy / rh) * (dy / rh)));
    g.fillRect(Math.round(cx) - half, Math.round(cy) + dy, half * 2 + 1, 1);
  }
  g.globalAlpha = 1;
  // the ring of script, written round as it is laid, turning slowly
  const ring: number[] = [];
  const n = 48;
  const turn = t * 0.3;
  for (let i = 0; i <= Math.round(n * born); i++) {
    const a = turn + (i / n) * TAU;
    ring.push(cx + Math.cos(a) * rw, cy + Math.sin(a) * rh);
  }
  bandAlong(g, ring, C, t * 8, fade);
  // a thin line of light just outside it, breathing
  g.globalAlpha = 0.6 * fade * breath;
  g.fillStyle = C[3];
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * TAU;
    g.fillRect(Math.round(cx + Math.cos(a) * (rw + 3)), Math.round(cy + Math.sin(a) * (rh + 2)), 1, 1);
  }
  g.globalAlpha = 1;
  // the coil in it: a band wound in on itself, its end lifting and falling as if it breathed
  const coil: number[] = [];
  for (let i = 0; i <= 40; i++) {
    const u = i / 40;
    if (u > born) break;
    const a = -turn * 1.6 + u * TAU * 1.6;
    const rho = (0.15 + 0.55 * u);
    coil.push(cx + Math.cos(a) * rw * rho, cy + Math.sin(a) * rh * rho - (u > 0.85 ? (u - 0.85) * 40 * (0.5 + 0.5 * Math.sin(t * 3)) : 0));
  }
  bandAlong(g, coil, C, -t * 10, fade);
  // three pegs round it
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU + 0.5;
    peg(g, cx + Math.cos(a) * rw * 1.08, cy + Math.sin(a) * rh * 1.08, C, fade * breath);
  }
}

/** A snare sprung burns out: its ring flaring and opening out, gone. */
function drawBurn(g: CanvasRenderingContext2D, cam: Cam, b: Burn): void {
  const C = BIND_RAMP;
  const k = b.t / b.dur;
  const cx = wx(cam, b.x, b.y);
  const cy = wy(cam, b.x, b.y);
  const r = Math.min(1.4, b.r) * (1 + k * 0.4);
  const ring: number[] = [];
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * TAU;
    ring.push(cx + Math.cos(a) * r * 22.6, cy + Math.sin(a) * r * 11.3);
  }
  bandAlong(g, ring, k < 0.3 ? [C[2], C[3], C[4], C[5], C[5], C[5]] : C, B3.clock * 30, 1 - k);
}

/** Under the figures (render.ts, with the floor's patches): the snares lying, the snares burning out. */
export function floorB3(g: CanvasRenderingContext2D, cam: Cam, t: number, game: Game, here: (x: number, y: number) => boolean): void {
  if (!BINDING3.on) return;
  for (const z of game.zones) if (isSnare(z) && here(z.x, z.y)) drawSnare(g, cam, z, t);
  for (const b of B3.burns) if (here(b.x, b.y)) drawBurn(g, cam, b);
}

/** Over the figures (drawn after the dark, so it glows): the bands round what is held, and the bands leaping. */
export function airB3(g: CanvasRenderingContext2D, cam: Cam, t: number, game: Game): void {
  if (!BINDING3.on) return;
  for (const h of B3.holds) drawHold(g, cam, h, game);
  void t;
}

/** Light: the renderer's `spot` (screen x, y, radius, strength). */
export function lightsB3(spot: (x: number, y: number, r: number, a: number) => void, cam: Cam, game: Game, t: number): void {
  if (!BINDING3.on) return;
  for (const z of game.zones) if (isSnare(z)) spot(wx(cam, z.x, z.y), wy(cam, z.x, z.y) - 2, 40 + z.r * 22, (0.85 + 0.12 * Math.sin(t * 2.4 + z.x)) * Math.min(1, (z.dur - z.t) * 2));
  for (const h of B3.holds) {
    if (!h.at) continue;
    const left = h.dur - h.t;
    spot(h.at[0], h.at[1] - h.at[2] * 0.4, 30, (h.enemy ? 0.4 : 0.55) * Math.min(1, left / BIND_TIME.unravel));
  }
}

/** A colour laid over a held figure for an instant as the bands snap tight. */
export function tintB3(m: Monster): [string, number] | null {
  if (!BINDING3.on) return null;
  const h = B3.holds.find((q) => q.id === m.id);
  if (!h) return null;
  const since = h.t - BIND_TIME.wrap;
  if (since >= -0.02 && since < 0.08) return [BIND_RAMP[4], 0.55];
  return null;
}

// =============================================================================================
// The clock, and what the rules said happened.

let joinedLevel: unknown = null;

export function tickB3(dt: number, game: Game, fx: Fx): void {
  if (!BINDING3.on) return;
  if (game.level !== joinedLevel) {
    joinedLevel = game.level;
    clearB3();
  }
  B3.clock += dt;
  for (let i = B3.later.length - 1; i >= 0; i--) {
    B3.later[i].t -= dt;
    if (B3.later[i].t <= 0) {
      const fn = B3.later[i].fn;
      B3.later.splice(i, 1);
      fn();
    }
  }
  for (let i = B3.burns.length - 1; i >= 0; i--) {
    B3.burns[i].t += dt;
    if (B3.burns[i].t >= B3.burns[i].dur) B3.burns.splice(i, 1);
  }
  for (let i = B3.holds.length - 1; i >= 0; i--) {
    const h = B3.holds[i];
    h.t += dt;
    const gone = h.id >= 0 && !game.monsters.some((q) => q.id === h.id && !q.dead);
    const C = h.enemy ? BIND_ENEMY : BIND_RAMP;
    const holder = h.id < 0 ? game.hero : game.monsters.find((q) => q.id === h.id);
    // unravelling: the letters peel off the bands and fall away
    if (!h.unravelled && h.t >= h.dur - BIND_TIME.unravel && holder) {
      h.unravelled = true;
      const top = h.at ? h.at[2] : 28;
      for (const b of h.bands) letters(fx, holder.x, holder.y, 10, C, { speed: 1.6, up: 20, z: top * b.h, r: 0.35, grav: 40, life: 0.8 });
    }
    // while held: a letter now and then shaken off as it strains
    if (holder && h.t > BIND_TIME.wrap && h.t < h.dur - BIND_TIME.unravel && Math.random() < 5 * dt * fx.room()) {
      const b = h.bands[Math.floor(Math.random() * h.bands.length)].h;
      const top = h.at ? h.at[2] : 28;
      letters(fx, holder.x, holder.y, 1, C, { speed: 0.8, up: 10, z: top * b, r: 0.3, grav: 30, life: 0.7 });
    }
    if (h.t >= h.dur || gone) {
      if (gone && holder && !h.unravelled) letters(fx, holder.x, holder.y, 16, C, { speed: 2, up: 30, z: 12, r: 0.3 });
      B3.holds.splice(i, 1);
    }
  }
  // (the playtest's: its snares spring on the first to cross them)
  if (B3.demo.snares) {
    for (const z of [...game.zones]) {
      if (!isSnare(z)) continue;
      const m = game.monsters.find((q) => !q.dead && Math.hypot(q.x - z.x, q.y - z.y) <= Math.min(1.4, z.r) * 0.8);
      if (!m) continue;
      game.zones.splice(game.zones.indexOf(z), 1);
      snareSprung(fx, game, m.id, z.x, z.y, 2.6, z.r);
      (m as { walkTo?: unknown }).walkTo = null;
    }
  }
}

/** What eventsB3 reads of an event. */
type Seen = { t: string; id?: number; x?: number; y?: number; secs?: number; onHero?: boolean };

/** The looks, called up by what the rules say happened this frame (main.ts, while BINDING3.on). */
export function eventsB3(events: readonly unknown[], game: Game, fx: Fx): void {
  if (!BINDING3.on) return;
  for (const raw of events) {
    const e = raw as Seen;
    if (e.t === 'bind' && e.id !== undefined) bindOn(fx, game, e.id, e.secs ?? 2);
    else if (e.t === 'snareSprung' && e.id !== undefined) snareSprung(fx, game, e.id, e.x ?? 0, e.y ?? 0, e.secs ?? 2);
    else if (e.t === 'rooted') rootHero(fx, game, e.secs ?? 1.5, e.x ?? game.hero.x, e.y ?? game.hero.y);
    else if (e.t === 'unbind') unbind(e.id ?? -1);
    else if (e.t === 'hit' && B3.demo.hits > 0 && !e.onHero) {
      // (the playtest's: its hero's hits bind what they strike)
      let best: Monster | undefined;
      let bd = 0.6;
      for (const m of game.monsters) {
        const d = Math.hypot(m.x - (e.x ?? 0), m.y - (e.y ?? 0));
        if (!m.dead && d < bd) {
          bd = d;
          best = m;
        }
      }
      if (best) bindOn(fx, game, best.id, B3.demo.hits);
    }
  }
}

/** The playtest's hands: `window.__dbg.binding3` (main.ts). Nothing here runs unless a playtest calls it. */
export function demoB3(fx: Fx, getGame: () => Game | null) {
  const G = (): Game => {
    const g = getGame();
    if (!g) throw new Error('no game');
    return g;
  };
  return {
    switch: BINDING3,
    state: B3,
    clear: () => {
      clearB3();
      joinedLevel = getGame()?.level ?? null;
    },
    rune: bindRune,
    /** The hero's hits bind what they strike, for `secs` (0: they do not). */
    hits: (secs: number) => {
      B3.demo.hits = secs;
    },
    /** Snares spring on the first to cross them. */
    snares: (on: boolean) => {
      B3.demo.snares = on;
    },
    bind: (id: number, secs: number) => bindOn(fx, G(), id, secs),
    root: (secs: number, x: number, y: number) => rootHero(fx, G(), secs, x, y),
    /** A snare laid at (x, y), radius r, for secs. */
    lay: (x: number, y: number, r: number, secs = 9999) => {
      // (laid as a 'rune' that never comes to its time: no rules take it up, and the playtest takes it away when it springs)
      G().zones.push({ x, y, r, t: 0, dur: secs, kind: 'rune', element: 'phys', dmg: 0, slow: 0, tick: 0, hostile: false, skill: -1, words: [], from: '', look: 'binding' } as unknown as Zone);
    },
  };
}
