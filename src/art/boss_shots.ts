// WHAT THE BOSSES OF DUNGEONS 2 TO 4 DO TO THE FLOOR (the art chat, 9 Oct 2026). A MOCK-UP: NOT IN THE
// GAME. Nothing of the game draws these yet: the rules (what each hurts, how far, how long) are the
// main chat's, and these are the pictures for them. As art/mob_shots.ts: drawn in the game's own
// pixels, as the floor's effects are, given where a point of the floor is on the screen.
//
// THE HEADSMAN (art/bosses3.ts), his picks by 16:46:
//   "The sentence (Recommended)": while he holds the axe high, the floor before him cracks along the
//     line it will fall on, faintly burning (the warning, `drawSentenceLine`); when it falls, the floor
//     SPLITS OPEN along that line, racing out from where the blade bit, and fire bursts up out of the
//     split all along it (`drawSentenceSplit`).
//   "Wide sweep (Recommended)": while he holds the axe back, a ring burns on the floor round him as far
//     as the blade will reach (`drawSweepRing`).
//   "Whirling throw (Recommended)": while he holds it back, its way out and round and back is traced
//     on the floor (`drawThrowPath`); in flight the axe (a picture: art/bosses3.ts makeAxeShotArt) has
//     its shadow under it (`drawAxeShadow`), and its way is `throwPathAt`.
//   His chop: where the blade bites, the floor cracks and a puff of it flies (`drawChopCrack`).
// THE CHAINED ONE (art/bosses3.ts), his picks by 16:44:
//   "Hook and drag (Recommended)": the hook flung out across the room is a picture of its own
//     (art/bosses3.ts makeHookShotArt), its chain drawn from his right cuff to it (`drawChainOut`), and
//     where it is, `coHookPath`; it scrapes the floor as he hauls it in (`drawScrape`).
//   "Ball throw (Recommended)": the ball in flight is a picture of its own (makeBallShotArt), its chain
//     drawn from his collar to it (`drawChainOut`); while it flies its shadow grows on the floor where it
//     will come down (`drawBallShadow`); there it crashes into the floor (`drawBallCrash`); and it
//     scrapes the floor as he hauls it back (`drawScrape`).
// Their colours are the enemy's: pink and gold (never a friend's cyan).

import { hash } from './kit';
import { FLAME, IRON } from './mkit';
import type { FloorAt } from './mob_shots';
import { P } from './palette';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** A pixel, rounded, in a colour. */
function dotAt(g: CanvasRenderingContext2D, x: number, y: number, color: string, w = 1, h = 1): void {
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}

/**
 * A JAGGED LINE ON THE FLOOR from `a` along (fx, fy) for `long` tiles, as screen points: steady (the
 * same jags every frame for the same `seed`), a jag every quarter tile.
 */
function jagged(at: FloorAt, ax: number, ay: number, fx: number, fy: number, long: number, seed: number, wild = 0.09): [number, number][] {
  const sx = -fy;
  const sy = fx;
  const out: [number, number][] = [];
  const n = Math.max(2, Math.round(long * 4));
  for (let i = 0; i <= n; i++) {
    const d = (i / n) * long;
    const off = i === 0 ? 0 : (hash(i, seed, 91) - 0.5) * 2 * wild * (0.6 + 0.4 * Math.min(1, d));
    const [x, y] = at(ax + fx * d + sx * off, ay + fy * d + sy * off);
    out.push([x, y]);
  }
  return out;
}
/** Along a line of screen points, every pixel of it (with how far along it is, 0 to 1). */
function along(pts: [number, number][], each: (x: number, y: number, k: number) => void): void {
  let total = 0;
  const segs: number[] = [];
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    segs.push(d);
    total += d;
  }
  let run = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = segs[i - 1];
    const n = Math.max(1, Math.ceil(d));
    for (let j = 0; j < n; j++) {
      const f = j / n;
      each(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f, (run + d * f) / Math.max(1e-6, total));
    }
    run += d;
  }
}

// ---------------------------------------------------------------------------------------------
// THE SENTENCE

/** Where the split runs: from this far before him (tiles, where his blade bites) to this far. */
export const SENTENCE_FROM = 2.7;
export const SENTENCE_TO = 8.2;
/** How long the split burns after the blow (seconds). */
export const SPLIT_FOR = 1.8;

/**
 * THE SENTENCE'S WARNING, while he holds the axe high (`k`: how far through the hold, 0 to 1): the
 * floor cracking along the line it will fall on, from his feet outward, a thin line of light in it,
 * pulsing; and here and there a point of the fire under the floor showing through.
 */
export function drawSentenceLine(g: CanvasRenderingContext2D, at: FloorAt, x0: number, y0: number, fx: number, fy: number, k: number, t: number): void {
  if (k <= 0) return;
  const long = (SENTENCE_TO - SENTENCE_FROM) * clamp01(k * 1.6);
  const pts = jagged(at, x0 + fx * SENTENCE_FROM, y0 + fy * SENTENCE_FROM, fx, fy, long, 3, 0.07);
  const pulse = 0.6 + 0.4 * Math.sin(t * 9);
  const was = g.globalAlpha;
  along(pts, (x, y, f) => {
    g.globalAlpha = was * (0.5 + 0.5 * pulse) * (1 - 0.5 * f);
    dotAt(g, x, y + 1, P.ink, 1, 1);
    dotAt(g, x, y, f < 0.7 ? FLAME[2] : FLAME[1]);
  });
  // (the fire under the floor, showing through at a few points, more as the hold goes on)
  for (let i = 0; i < 9; i++) {
    const d = SENTENCE_FROM + (SENTENCE_TO - SENTENCE_FROM) * hash(i, 1, 93);
    if (d > SENTENCE_FROM + long || hash(i, 2, 93) > k) continue;
    const [x, y] = at(x0 + fx * d, y0 + fy * d);
    g.globalAlpha = was * (0.4 + 0.6 * Math.abs(Math.sin(t * 7 + i)));
    dotAt(g, x - 1, y - 1, FLAME[3], 2, 1);
  }
  g.globalAlpha = was;
}

/**
 * THE SPLIT, `t` seconds after his blade bites: a flash where it bit; the floor splits open from there
 * along the line, racing out to its end in a fifth of a second; fire bursts up out of it all along
 * it, high where it has just opened, and shards of the floor are thrown up; then the fire sinks, the
 * split glows, and it fades. Over the floor and what stands on it, as the game draws a blast.
 */
export function drawSentenceSplit(g: CanvasRenderingContext2D, at: FloorAt, x0: number, y0: number, fx: number, fy: number, t: number): void {
  if (t < 0 || t >= SPLIT_FOR) return;
  const RACE = 0.2;
  const reach = clamp01(t / RACE);
  const long = SENTENCE_TO - SENTENCE_FROM;
  const bx = x0 + fx * SENTENCE_FROM;
  const by = y0 + fy * SENTENCE_FROM;
  const fade = t < SPLIT_FOR * 0.55 ? 1 : 1 - (t - SPLIT_FOR * 0.55) / (SPLIT_FOR * 0.45);
  const was = g.globalAlpha;
  // the split itself: dark, two or three pixels wide, its lips catching the fire's light
  const pts = jagged(at, bx, by, fx, fy, long * reach, 3, 0.07);
  along(pts, (x, y, f) => {
    g.globalAlpha = was * fade;
    const wide = f < 0.85 ? 2 : 1;
    dotAt(g, x - 1, y - 1, FLAME[1], wide + 2, 1);
    dotAt(g, x - 1, y, P.ink, wide + 2, 1);
    dotAt(g, x, y + 1, FLAME[0], wide, 1);
    if (hash(Math.round(x), Math.round(y), 95) < 0.35) dotAt(g, x, y, FLAME[3]);
  });
  // (branches off it, short)
  for (let i = 0; i < 6; i++) {
    const d = long * hash(i, 1, 97);
    if (d > long * reach) continue;
    const side = hash(i, 2, 97) < 0.5 ? -1 : 1;
    const bfx = fx * 0.6 - fy * side * 0.8;
    const bfy = fy * 0.6 + fx * side * 0.8;
    const br = jagged(at, bx + fx * d, by + fy * d, bfx, bfy, 0.35 + 0.4 * hash(i, 3, 97), 10 + i, 0.06);
    along(br, (x, y) => {
      g.globalAlpha = was * fade * 0.8;
      dotAt(g, x, y, P.ink);
    });
  }
  // the flash where the blade bit
  if (t < 0.1) {
    const [cx, cy] = at(bx, by);
    g.globalAlpha = was;
    dotAt(g, cx - 3, cy - 4, FLAME[4], 7, 4);
    dotAt(g, cx - 6, cy - 2, FLAME[3], 13, 2);
  }
  // FIRE BURSTING UP out of it, all along: high where it has just opened, sinking after
  for (let i = 0; i < 46; i++) {
    const d = (i + 0.5) / 46;
    if (d > reach) continue;
    const opened = (d * RACE) / Math.max(1e-6, 1);
    const age = t - opened;
    if (age < 0) continue;
    const off = (hash(i, 4, 99) - 0.5) * 0.1;
    const [x, y] = at(bx + fx * long * d - fy * off, by + fy * long * d + fx * off);
    const high = (6 + 16 * hash(i, 5, 99)) * Math.max(0, 1 - age / (SPLIT_FOR * 0.7)) * (age < 0.08 ? age / 0.08 : 1);
    if (high < 0.5) continue;
    const flick = 0.75 + 0.25 * Math.sin(t * 31 + i * 1.7);
    const h = Math.max(1, Math.round(high * flick));
    g.globalAlpha = was * fade;
    for (let j = 0; j < h; j++) {
      const k = j / h;
      const c = k < 0.25 ? FLAME[4] : k < 0.5 ? FLAME[3] : k < 0.8 ? FLAME[2] : FLAME[1];
      const sway = Math.round(Math.sin(t * 12 + i + j * 0.5) * k * 1.4);
      dotAt(g, x + sway, y - j - 1, c, k < 0.5 ? 2 : 1, 1);
    }
  }
  // shards of the floor thrown up, falling back
  for (let i = 0; i < 20; i++) {
    const d = hash(i, 6, 101);
    if (d > reach) continue;
    const age = t - d * RACE;
    if (age < 0) continue;
    const vz = 40 + 50 * hash(i, 7, 101);
    const z = vz * age - 0.5 * 280 * age * age;
    if (z < 0) continue;
    const side = (hash(i, 8, 101) - 0.5) * 2;
    const [x, y] = at(bx + fx * long * d - fy * side * age * 1.2, by + fy * long * d + fx * side * age * 1.2);
    g.globalAlpha = was;
    dotAt(g, x, y - z, hash(i, 9, 101) < 0.5 ? '#6a6488' : '#3b3052', 2, 1);
  }
  // embers rising off it as it sinks
  for (let i = 0; i < 16; i++) {
    const life = (t * 0.9 + hash(i, 10, 103)) % 1;
    const d = hash(i, 11, 103);
    if (d > reach || t < 0.25) continue;
    const [x, y] = at(bx + fx * long * d, by + fy * long * d);
    g.globalAlpha = was * fade * (1 - life);
    dotAt(g, x + Math.sin(i + t * 3) * 2, y - 4 - life * 26, life < 0.4 ? FLAME[3] : FLAME[2]);
  }
  g.globalAlpha = was;
}

// ---------------------------------------------------------------------------------------------
// THE WIDE SWEEP

/**
 * THE SWEEP'S WARNING, while he holds the axe back (`k`: how far through the hold): a ring of light on
 * the floor round him, `r` tiles out (as far as his blade reaches), brightening as the hold goes on, a
 * brighter arc running round it the way the axe will go (to his left).
 */
export function drawSweepRing(g: CanvasRenderingContext2D, at: FloorAt, x0: number, y0: number, r: number, k: number, t: number): void {
  if (k <= 0) return;
  const was = g.globalAlpha;
  const n = Math.max(48, Math.round(r * 40));
  const run = (t * 1.6) % 1;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const [x, y] = at(x0 + Math.cos(a) * r, y0 + Math.sin(a) * r);
    // (the arc that runs round it: the way the axe will come)
    const lead = 1 - (((i / n - run) % 1) + 1) % 1;
    const hot = lead > 0.85 ? (lead - 0.85) / 0.15 : 0;
    g.globalAlpha = was * Math.min(1, 0.25 + 0.6 * k + 0.4 * hot);
    dotAt(g, x, y, hot > 0.5 ? FLAME[3] : FLAME[2]);
    if (i % 2 === 0) dotAt(g, x, y + 1, FLAME[0]);
  }
  g.globalAlpha = was;
}

// ---------------------------------------------------------------------------------------------
// THE WHIRLING THROW

/**
 * WHERE THE AXE IS IN ITS FLIGHT, `u` of the way from his hand (0) back to it (1), in tiles: forward
 * of him and to his left, and its height (the game's pixels). Out before him and to his left, round
 * the far end of its loop, and back on his right. `from` and `to`: where it leaves his hand and where
 * it comes back to it (forward, left, height); `far`: how far out the loop goes.
 */
export function throwPathAt(u: number, from: readonly [number, number, number], to: readonly [number, number, number], far = 4.2): [number, number, number] {
  const k = clamp01(u);
  const s = Math.sin(Math.PI * k);
  const fwd = from[0] + (to[0] - from[0]) * k + (far - (from[0] + to[0]) / 2) * s;
  const left = from[1] + (to[1] - from[1]) * k + 1.35 * Math.sin(2 * Math.PI * k) * (0.6 + 0.4 * s);
  const high = from[2] + (to[2] - from[2]) * k - 6 * s;
  return [fwd, left, high];
}

/**
 * THE THROW'S WARNING, while he holds the axe back (`k`: how far through the hold): its way traced on
 * the floor, out and round and back, a dashed line of light running along it the way the axe will go.
 */
export function drawThrowPath(g: CanvasRenderingContext2D, at: FloorAt, x0: number, y0: number, fx: number, fy: number, from: readonly [number, number, number], to: readonly [number, number, number], k: number, t: number): void {
  if (k <= 0) return;
  const was = g.globalAlpha;
  const n = 120;
  const run = (t * 1.2) % 1;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    if (u > clamp01(k * 1.4)) break;
    const [a, b] = throwPathAt(u, from, to);
    // (the figure's left is the floor's -y when he faces +x: turned to the way he faces)
    const x = x0 + fx * a + fy * b;
    const y = y0 + fy * a - fx * b;
    const [sx, sy] = at(x, y);
    const dash = ((u - run) % 0.08 + 0.08) % 0.08 < 0.045;
    g.globalAlpha = was * (0.35 + 0.55 * k);
    if (dash) dotAt(g, sx, sy, FLAME[2]);
    else if (i % 3 === 0) dotAt(g, sx, sy, FLAME[0]);
  }
  g.globalAlpha = was;
}

/** THE AXE'S SHADOW on the floor under it as it flies: a dark oval as wide as its blade goes round. */
export function drawAxeShadow(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number): void {
  const [sx, sy] = at(x, y);
  const was = g.globalAlpha;
  g.globalAlpha = was * 0.5;
  g.fillStyle = P.black;
  g.beginPath();
  g.ellipse(Math.round(sx), Math.round(sy), 13, 6.5, 0, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = was;
}

// ---------------------------------------------------------------------------------------------
// HIS CHOP

/** How long the crack his chop leaves stays (seconds). */
export const CHOP_CRACK_FOR = 1.2;
/** WHERE HIS CHOP BITES, `t` seconds after: a short crack in the floor along the blade, glowing as it opens, and fading. */
export function drawChopCrack(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, fx: number, fy: number, t: number): void {
  if (t < 0 || t >= CHOP_CRACK_FOR) return;
  const was = g.globalAlpha;
  const fade = t < CHOP_CRACK_FOR * 0.5 ? 1 : 1 - (t - CHOP_CRACK_FOR * 0.5) / (CHOP_CRACK_FOR * 0.5);
  const glow = clamp01(1 - t / 0.35);
  for (const [dfx, dfy, long, seed] of [[fx, fy, 0.55, 21], [-fx, -fy, 0.35, 22], [fx * 0.5 - fy * 0.8, fy * 0.5 + fx * 0.8, 0.3, 23], [fx * 0.5 + fy * 0.8, fy * 0.5 - fx * 0.8, 0.25, 24]] as const) {
    const pts = jagged(at, x, y, dfx, dfy, long, seed, 0.06);
    along(pts, (px, py, f) => {
      g.globalAlpha = was * fade;
      dotAt(g, px, py, glow > 0.1 && f < 0.6 ? (glow > 0.6 ? FLAME[3] : FLAME[2]) : P.ink);
    });
  }
  if (t < 0.08) {
    const [cx, cy] = at(x, y);
    g.globalAlpha = was;
    dotAt(g, cx - 2, cy - 2, FLAME[4], 5, 3);
  }
  g.globalAlpha = was;
}

// ---------------------------------------------------------------------------------------------
// THE CHAINED ONE

/**
 * A CHAIN OUT ACROSS THE ROOM, from (x0, y0) to (x1, y1) (screen points in the game's pixels: his
 * cuff or his collar, and the hook or the ball), sagging `sag` pixels at its middle: its links, each
 * turned a quarter round from the last, as the chain at his wrist is painted, in his old iron; a dark
 * seam under it.
 */
export function drawChainOut(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, sag: number): void {
  const long = Math.hypot(x1 - x0, y1 - y0);
  const n = Math.max(2, Math.ceil(long / 1.25));
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    const x = x0 + (x1 - x0) * k;
    const y = y0 + (y1 - y0) * k + sag * 4 * k * (1 - k);
    if (i % 2 === 0) {
      // (a link seen flat: a little ring)
      dotAt(g, x, y + 1, P.ink, 2, 1);
      dotAt(g, x, y, IRON[3], 2, 1);
    } else {
      // (a link seen edge on)
      dotAt(g, x, y + 1, P.ink);
      dotAt(g, x, y, IRON[2]);
    }
  }
}
/** THE BALL'S SHADOW on the floor where it will come down, at (x, y) (tiles), as it falls: `k` 0 as it leaves his hands to 1 as it lands; darker and wider as it nears. */
export function drawBallShadow(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, k: number): void {
  const [sx, sy] = at(x, y);
  const near = clamp01(k);
  const rx = 3 + 6 * near;
  const was = g.globalAlpha;
  g.globalAlpha = was * (0.2 + 0.55 * near);
  g.fillStyle = P.black;
  g.beginPath();
  g.ellipse(Math.round(sx), Math.round(sy), rx, rx / 2, 0, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = was;
}
/** How long the ball's crash shows (seconds from when it comes down). */
export const BALL_CRASH_FOR = 1.4;
/** WHERE THE BALL COMES DOWN, at (x, y) (tiles), `t` seconds after: the floor cracked out all round from it, a ring of dust and chips flung out, and a flash where it struck. */
export function drawBallCrash(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, t: number): void {
  if (t < 0 || t >= BALL_CRASH_FOR) return;
  const was = g.globalAlpha;
  const fade = t < BALL_CRASH_FOR * 0.55 ? 1 : 1 - (t - BALL_CRASH_FOR * 0.55) / (BALL_CRASH_FOR * 0.45);
  const glow = clamp01(1 - t / 0.3);
  // the cracks, out every way from it
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + hash(i, 5, 41) * 0.6;
    const long = 0.35 + 0.3 * hash(i, 6, 41);
    const pts = jagged(at, x, y, Math.cos(a), Math.sin(a), long, 40 + i, 0.07);
    along(pts, (px, py, f) => {
      g.globalAlpha = was * fade;
      dotAt(g, px, py, glow > 0.1 && f < 0.5 ? (glow > 0.6 ? FLAME[3] : FLAME[2]) : P.ink);
    });
  }
  // the dust and chips flung out, a ring going wider and fading
  const [cx, cy] = at(x, y);
  const r = 4 + 22 * clamp01(t / 0.6);
  const dust = clamp01(1 - t / 0.9);
  if (dust > 0) {
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2 + hash(i, 9, 43) * 0.3;
      const rr = r * (0.7 + 0.5 * hash(i, 10, 43));
      g.globalAlpha = was * dust * 0.85;
      dotAt(g, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.5 - 2 * Math.sin(Math.PI * clamp01(t / 0.6)) * hash(i, 11, 43) * 6, i % 3 === 0 ? P.st6 : P.st4);
    }
  }
  if (t < 0.08) {
    g.globalAlpha = was;
    dotAt(g, cx - 3, cy - 2, FLAME[4], 7, 4);
  }
  g.globalAlpha = was;
}
/** WHAT IS DRAGGED SCRAPES THE FLOOR: from (x0, y0) back to (x1, y1) (tiles), the way it has just come, a pale scratch in the stone and a little dust kicked up (`k`: 1 fresh to 0 gone). */
export function drawScrape(g: CanvasRenderingContext2D, at: FloorAt, x0: number, y0: number, x1: number, y1: number, k: number): void {
  if (k <= 0) return;
  const was = g.globalAlpha;
  const [ax, ay] = at(x0, y0);
  const [bx, by] = at(x1, y1);
  const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay)));
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    g.globalAlpha = was * clamp01(k) * (0.35 + 0.4 * (1 - f));
    dotAt(g, ax + (bx - ax) * f, ay + (by - ay) * f, i % 4 === 0 ? P.st6 : P.st5);
  }
  g.globalAlpha = was * clamp01(k) * 0.7;
  for (let i = 0; i < 4; i++) dotAt(g, ax + (hash(i, 3, 47) - 0.5) * 6, ay - 1 - hash(i, 4, 47) * 3, P.st4);
  g.globalAlpha = was;
}

// ---------------------------------------------------------------------------------------------
// THE OSSUARY AMALGAMATION

/** How long before arms of the dead burst up out of the floor its cracks glow there (seconds: the warning). */
export const ARM_CRACK_WARN = 0.5;
/** How long the cracks stay after the arms have sunk back (seconds), fading. */
export const ARM_CRACK_AFTER = 0.8;
/**
 * WHERE ARMS OF THE DEAD BURST UP OUT OF THE FLOOR (its "Arms from the floor"), at (x, y) (tiles), `t`
 * seconds from when they do: before, the floor cracking open there, out every way, its cracks glowing
 * brighter and longer as it comes (the warning); while they are up (`stay` seconds: art/bosses3.ts
 * FLOOR_ARM_TIME) the cracks dark round the hole; after, fading.
 */
export function drawArmCrack(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, t: number, stay = 1.4): void {
  if (t < -ARM_CRACK_WARN || t >= stay + ARM_CRACK_AFTER) return;
  const was = g.globalAlpha;
  const coming = t < 0 ? 1 + t / ARM_CRACK_WARN : 1;
  const fade = t < stay ? 1 : 1 - (t - stay) / ARM_CRACK_AFTER;
  const hot = t < 0 ? 0.35 + 0.65 * coming : clamp01(1 - t / 0.25);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + hash(i, 5, 61) * 0.7;
    const long = (0.28 + 0.2 * hash(i, 6, 61)) * (0.35 + 0.65 * coming);
    const pts = jagged(at, x, y, Math.cos(a), Math.sin(a), long, 60 + i, 0.07);
    along(pts, (px, py, f) => {
      g.globalAlpha = was * fade;
      dotAt(g, px, py, hot > 0.1 && f < 0.75 ? (hot > 0.6 && f < 0.4 ? FLAME[3] : FLAME[2]) : P.ink);
    });
  }
  // (and the glow coming up through them, beating faster as it comes)
  if (t < 0) {
    const [cx, cy] = at(x, y);
    g.globalAlpha = was * (0.25 + 0.35 * coming) * (0.75 + 0.25 * Math.sin(t * (18 + 20 * coming)));
    dotAt(g, cx - 2, cy - 1, FLAME[2], 5, 2);
    dotAt(g, cx - 1, cy - 1, FLAME[3], 3, 1);
  }
  g.globalAlpha = was;
}
/**
 * WHERE GREAT CLAWS RAKE THE FLOOR (its devour): along a way of floor points (tiles, oldest first),
 * three gouges side by side, dark, a pale edge of broken stone along each, the freshest end the
 * deepest; `k`: 1 fresh to 0 gone.
 */
export function drawClawRake(g: CanvasRenderingContext2D, at: FloorAt, pts: ReadonlyArray<readonly [number, number]>, k: number): void {
  if (k <= 0 || pts.length < 2) return;
  const was = g.globalAlpha;
  for (let c = -1; c <= 1; c++) {
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const L = Math.hypot(x1 - x0, y1 - y0) || 1;
      const sx = (-(y1 - y0) / L) * 0.1 * c;
      const sy = ((x1 - x0) / L) * 0.1 * c;
      const [ax, ay] = at(x0 + sx, y0 + sy);
      const [bx, by] = at(x1 + sx, y1 + sy);
      const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay)));
      for (let j = 0; j < n; j++) {
        const f = j / n;
        const fresh = 0.55 + 0.45 * ((i - 1 + f) / (pts.length - 1));
        g.globalAlpha = was * clamp01(k) * fresh;
        dotAt(g, ax + (bx - ax) * f, ay + (by - ay) * f, P.ink);
        g.globalAlpha = was * clamp01(k) * fresh * 0.7;
        dotAt(g, ax + (bx - ax) * f, ay + (by - ay) * f - 1, P.st6);
      }
    }
  }
  g.globalAlpha = was;
}
