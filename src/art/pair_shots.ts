// WHAT THE SCRAPER AND THE QUILL DO TO THE FLOOR (the art chat, 20 Oct 2026). A MOCK-UP: NOT IN THE GAME (PAIR_ON,
// art/scraper.ts, off). Nothing of the game draws these yet: what each does to the hero, and when, is the main chat's; these
// are the pictures, and THEIR SIZES ARE THE HIT AREAS HE ASKED FOR. His words, 20 Oct 2026, to the moves: “Sounds good.  But
// make the hit boxes on the attacks, and the attacks themselves big”. So every mark below is as big as the blow it shows,
// and the game's hit areas should be the marks: where the mark is, the blow lands.
//
// As art/censor_shots.ts: drawn in the game's own pixels, given where a point of the floor is on the screen (`at`, from
// tiles); (x, y) the monster's floor point in tiles, (dx, dy) the way it faces on the floor. Its left (its own +y) is
// (dy, -dx) on the floor's grid: facing the floor's +x, its left is the floor's -y (as art/terrain.ts pictureOf lays them).
//
// THE SCRAPER (art/scraper.ts):
//   CLAW SNAP: through its warning a ring of the enemy's pink closing on where the claw will snap shut (`drawSnapWarn`); at
//     the snap, ink and grit burst there and the floor cracks (`drawSnap`).
//   THE SCOUR: through its warning the whole fan before it, out to its claws' reach, marked in pink, darkening (`drawScourWarn`);
//     from the slam, the floor scraped bare under its two claws as they sweep in from its sides, deep gouges along their
//     paths, and the fan left raw (`drawScour`).
//   THE BACKWARD RUSH: through its warning the lane behind it marked in pink (`drawRushWarn`); as it shoots back, the floor
//     ploughed up along the lane, two furrows from its fan's edges (`drawRushWake`).
//   THE PALIMPSEST (the combo): through its warning the strip before it marked out (`drawStripWarn`); from the slam the
//     strip is scraped bare, running out from its claws; it lies bare, and as the Quill swoops down it from its far end
//     toward the Scraper the Order's ink is written along it, burning pink (`drawStrip`); then THE STRIP BURSTS along it as
//     it was written, in a wall of ink (`drawStripBurst`).
// THE QUILL (art/quill.ts):
//   THE NIB STAB: through its warning a ring closing on where the nib goes in (`drawStabWarn`); a splash of ink and a star
//     of cracks where it struck (`drawStab`).
//   INK LINES: each line written across the floor before it as its neck whips across, from its right to its left, back,
//     and across again; lying wet and burning pink (the warning), then bursting in a wall of ink; a stain left drying
//     (`drawInkLine`).
//   OVERWRITE: over the Scraper as the Quill writes on it, the Order's fresh writing in the enemy's pink crawling over its
//     back and sinking in (`drawOverwriting`, in screen pixels, over the Scraper).

import { hash } from './kit';
import { FLAME } from './mkit';
import type { FloorAt } from './mob_shots';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const sm = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
function dotAt(g: CanvasRenderingContext2D, x: number, y: number, color: string, w = 1, h = 1): void {
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}
/** The Order's ink (black, its wet sheen, dried); the floor scraped bare (pale raw pulp and grit); the gouges' dark. */
const INK = ['#06050a', '#16131d', '#3a3448', '#2a2830'];
const RAW = ['#6e6858', '#8c8572', '#aaa28c', '#c8bfa6'];
const GOUGE = '#24211c';

/** Its facing and its left on the floor, as unit vectors. */
function frame(dx: number, dy: number): { fx: number; fy: number; lx: number; ly: number } {
  const l = Math.hypot(dx, dy) || 1;
  return { fx: dx / l, fy: dy / l, lx: dy / l, ly: -dx / l };
}
/** A point `f` tiles ahead and `s` to its left of (x, y), on the screen. */
function onFloor(at: FloorAt, x: number, y: number, F: ReturnType<typeof frame>, f: number, s: number): readonly [number, number] {
  return at(x + F.fx * f + F.lx * s, y + F.fy * f + F.ly * s);
}
/** Fill a shape on the floor given by its outline (ahead, left), in `color` at `alpha`. */
function fillFloor(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, F: ReturnType<typeof frame>, outline: readonly (readonly [number, number])[], color: string, alpha: number): void {
  if (alpha <= 0) return;
  const was = g.globalAlpha;
  g.globalAlpha = alpha;
  g.fillStyle = color;
  g.beginPath();
  outline.forEach(([f, s], i) => {
    const [sx, sy] = onFloor(at, x, y, F, f, s);
    if (i === 0) g.moveTo(sx, sy);
    else g.lineTo(sx, sy);
  });
  g.closePath();
  g.fill();
  g.globalAlpha = was;
}
/** Draw the outline of a shape on the floor as a dashed line of the enemy's pink, its dashes running along it with `k`. */
function dashFloor(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, F: ReturnType<typeof frame>, outline: readonly (readonly [number, number])[], k: number, alpha: number): void {
  const was = g.globalAlpha;
  let run = 0;
  for (let i = 0; i < outline.length; i++) {
    const [f0, s0] = outline[i];
    const [f1, s1] = outline[(i + 1) % outline.length];
    const L = Math.hypot(f1 - f0, s1 - s0);
    const n = Math.max(1, Math.ceil(L / 0.05));
    for (let j = 0; j < n; j++) {
      const u = j / n;
      const d = run + u * L;
      if ((Math.floor(d / 0.22 - k * 6) & 1) === 0) continue;
      const [sx, sy] = onFloor(at, x, y, F, f0 + (f1 - f0) * u, s0 + (s1 - s0) * u);
      g.globalAlpha = alpha;
      dotAt(g, sx, sy, k > 0.75 ? FLAME[3] : FLAME[2], 2, 2);
    }
    run += L;
  }
  g.globalAlpha = was;
}
/** A ring on the floor round (f, s) (ahead, left of the monster), radius `r` tiles. */
function ringAt(f: number, s: number, r: number, n = 40): [number, number][] {
  return Array.from({ length: n }, (_, i): [number, number] => [f + Math.cos((i / n) * Math.PI * 2) * r, s + Math.sin((i / n) * Math.PI * 2) * r]);
}
/** Ink and grit bursting out round (f, s), `t` seconds after, out to `reach` tiles; black and the enemy's pink. */
function burst(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, F: ReturnType<typeof frame>, f: number, s: number, t: number, reach: number, n: number, seed: number, life = 0.5): void {
  if (t < 0 || t > life) return;
  const k = t / life;
  const was = g.globalAlpha;
  for (let i = 0; i < n; i++) {
    const a = hash(i, 1, seed) * Math.PI * 2;
    const r = reach * (0.25 + 0.75 * hash(i, 2, seed)) * sm(k * 1.8);
    const up = 26 * Math.sin(Math.PI * Math.min(1, k * 1.3)) * (0.4 + 0.6 * hash(i, 3, seed));
    const [sx, sy] = onFloor(at, x, y, F, f + Math.cos(a) * r, s + Math.sin(a) * r);
    g.globalAlpha = 1 - sm((k - 0.6) / 0.4);
    dotAt(g, sx, sy - up, i % 5 === 0 ? FLAME[2] : i % 3 ? INK[0] : INK[2], 2, 2);
  }
  g.globalAlpha = was;
}
/** A splash of ink lying on the floor round (f, s), radius `r`, drying over `life` from `t0`. */
function splash(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, F: ReturnType<typeof frame>, f: number, s: number, r: number, t: number, life: number, seed: number): void {
  if (t < 0 || t > life) return;
  const dry = sm((t - life * 0.4) / (life * 0.6));
  const out = Array.from({ length: 28 }, (_, i): [number, number] => {
    const a = (i / 28) * Math.PI * 2;
    const rr = r * (0.55 + 0.45 * hash(i, 4, seed)) * sm(t / 0.08);
    return [f + Math.cos(a) * rr, s + Math.sin(a) * rr];
  });
  fillFloor(g, at, x, y, F, out, INK[0], 0.8 * (1 - dry));
  // (its spatter thrown out past it, and cracks run out from its middle)
  const was = g.globalAlpha;
  for (let i = 0; i < 26; i++) {
    const a = hash(i, 5, seed) * Math.PI * 2;
    const rr = r * (1 + 0.5 * hash(i, 6, seed));
    if (hash(i, 7, seed) < dry) continue;
    const [sx, sy] = onFloor(at, x, y, F, f + Math.cos(a) * rr, s + Math.sin(a) * rr);
    g.globalAlpha = 0.9;
    dotAt(g, sx, sy, INK[1], 2, 2);
  }
  g.globalAlpha = 0.7 * (1 - dry);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + hash(i, 8, seed);
    for (let j = 0; j < 14; j++) {
      const rr = r * (0.2 + 0.08 * j);
      const [sx, sy] = onFloor(at, x, y, F, f + Math.cos(a + 0.1 * Math.sin(j)) * rr, s + Math.sin(a + 0.1 * Math.sin(j)) * rr);
      dotAt(g, sx, sy, GOUGE);
    }
  }
  g.globalAlpha = was;
}

// =============================================================================================
// THE SCRAPER: CLAW SNAP

/** Where its claw snaps shut (tiles ahead of its floor point, and to its left: its left claw, held a little across), and how big the blow is (tiles round it). */
export const SNAP_AT = { ahead: 3.4, left: -0.3 } as const;
export const SNAP_R = 1.15;
/** How long the snap's splash lies (seconds). */
export const SNAP_FOR = 0.9;
/** THROUGH THE SNAP'S WARNING (`k` 0 to 1): a ring of the enemy's pink round where the claw will snap, closing in to its size. */
export function drawSnapWarn(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, dx: number, dy: number, k: number): void {
  if (k <= 0 || k > 1) return;
  const F = frame(dx, dy);
  const r = SNAP_R * (1.6 - 0.6 * sm(k));
  fillFloor(g, at, x, y, F, ringAt(SNAP_AT.ahead, SNAP_AT.left, SNAP_R), FLAME[0], 0.18 + 0.2 * k);
  dashFloor(g, at, x, y, F, ringAt(SNAP_AT.ahead, SNAP_AT.left, r), k, 0.5 + 0.5 * k);
}
/** THE SNAP, `t` seconds after it: ink and grit burst where the claw shut, a splash left on the floor, cracks. */
export function drawSnap(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, dx: number, dy: number, t: number): void {
  const F = frame(dx, dy);
  splash(g, at, x, y, F, SNAP_AT.ahead, SNAP_AT.left, SNAP_R * 0.75, t, SNAP_FOR, 6101);
  burst(g, at, x, y, F, SNAP_AT.ahead, SNAP_AT.left, t, SNAP_R, 30, 6102, 0.45);
}

// =============================================================================================
// THE SCRAPER: THE SCOUR

/** The fan it scrapes: out to SCOUR_REACH tiles from its floor point, SCOUR_HALF degrees either side of its facing; the floor left raw SCOUR_FOR seconds. The sweep's time (seconds after the slam) is its own (art/scraper.ts SR_SCOUR.sweep). */
export const SCOUR_REACH = 4.0;
export const SCOUR_HALF = 82;
export const SCOUR_FOR = 1.8;
const SWEEP = 0.5;
function fanOutline(reach: number, half: number, from = 0): [number, number][] {
  const out: [number, number][] = [[from, 0]];
  const h = (half * Math.PI) / 180;
  for (let i = 0; i <= 32; i++) {
    const a = -h + (2 * h * i) / 32;
    out.push([Math.cos(a) * reach, Math.sin(a) * reach]);
  }
  return out;
}
/** THROUGH THE SCOUR'S WARNING (`k` 0 to 1): the whole fan it will scrape marked in pink, darkening. */
export function drawScourWarn(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, dx: number, dy: number, k: number): void {
  if (k <= 0 || k > 1) return;
  const F = frame(dx, dy);
  const fan = fanOutline(SCOUR_REACH, SCOUR_HALF);
  fillFloor(g, at, x, y, F, fan, FLAME[0], 0.14 + 0.22 * k);
  dashFloor(g, at, x, y, F, fan, k, 0.5 + 0.5 * k);
}
/**
 * THE SCOUR, `t` seconds after the slam: its claws come down at the fan's two edges and sweep in toward its middle over
 * the sweep, the floor scraped raw behind them, deep gouges along their paths, shreds thrown up before them; the fan lies
 * raw, fading, gone SCOUR_FOR after the slam.
 */
export function drawScour(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, dx: number, dy: number, t: number): void {
  if (t < 0 || t > SCOUR_FOR) return;
  const F = frame(dx, dy);
  const swept = sm(t / SWEEP);
  const fade = 1 - sm((t - SCOUR_FOR * 0.45) / (SCOUR_FOR * 0.55));
  const h = (SCOUR_HALF * Math.PI) / 180;
  // (scraped raw: each side's fan from its edge in to where its claw has got)
  for (const side of [1, -1]) {
    const out: [number, number][] = [[0, 0]];
    for (let i = 0; i <= 16; i++) {
      const a = side * (h - h * swept * (i / 16));
      out.push([Math.cos(a) * SCOUR_REACH, Math.sin(a) * SCOUR_REACH]);
    }
    fillFloor(g, at, x, y, F, out, RAW[2], 0.7 * fade);
  }
  // (the gouges: four deep scratches along each claw's path, from the edge to where it has got)
  const was = g.globalAlpha;
  for (const side of [1, -1]) {
    for (let k = 0; k < 4; k++) {
      const r = SCOUR_REACH * (0.62 + 0.11 * k);
      const n = 60;
      for (let i = 0; i <= n * swept; i++) {
        const a = side * (h - (h * i) / n);
        const [sx, sy] = onFloor(at, x, y, F, Math.cos(a) * r, Math.sin(a) * r);
        g.globalAlpha = 0.85 * fade;
        dotAt(g, sx, sy, k % 2 ? GOUGE : INK[1], 2, 1);
      }
    }
    // (the claw's edge as it scrapes: shreds and grit thrown up before it)
    if (t < SWEEP + 0.2) {
      const a = side * (h - h * swept);
      for (let i = 0; i < 16; i++) {
        const r = SCOUR_REACH * (0.55 + 0.45 * hash(i, 1, 6201 + side));
        const a2 = a - side * 0.12 * hash(i, 2, 6201);
        const up = 30 * hash(i, 3, 6201) * (1 - sm((t - SWEEP) / 0.2));
        const [sx, sy] = onFloor(at, x, y, F, Math.cos(a2) * r, Math.sin(a2) * r);
        g.globalAlpha = 1;
        dotAt(g, sx, sy - up, i % 3 ? RAW[3] : INK[0], 2, 2);
      }
    }
  }
  g.globalAlpha = was;
}

// =============================================================================================
// THE SCRAPER: THE BACKWARD RUSH

/** Its lane: back from its floor point RUSH_LANE tiles (how far it goes, art/scraper.ts RUSH_TILES, and its tail's length past that), RUSH_HALF tiles either side; its wake lies RUSH_WAKE_FOR seconds. */
export const RUSH_LANE = 7.4;
export const RUSH_HALF = 1.3;
export const RUSH_WAKE_FOR = 1.4;
/** THROUGH THE RUSH'S WARNING (`k` 0 to 1): the lane behind it marked in pink. */
export function drawRushWarn(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, dx: number, dy: number, k: number): void {
  if (k <= 0 || k > 1) return;
  const F = frame(dx, dy);
  const lane: [number, number][] = [[0, -RUSH_HALF], [0, RUSH_HALF], [-RUSH_LANE, RUSH_HALF], [-RUSH_LANE, -RUSH_HALF]];
  fillFloor(g, at, x, y, F, lane, FLAME[0], 0.14 + 0.22 * k);
  dashFloor(g, at, x, y, F, lane, k, 0.5 + 0.5 * k);
}
/** ITS WAKE, `t` seconds after it shot back, (x, y) where it set off from, `gone` tiles back it has got: the floor ploughed up along the lane behind it, two furrows from its fan's edges, grit and shreds thrown up where it is; fading. */
export function drawRushWake(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, dx: number, dy: number, t: number, gone: number): void {
  if (t < 0 || t > RUSH_WAKE_FOR + 0.5) return;
  const F = frame(dx, dy);
  const fade = 1 - sm((t - 0.5) / RUSH_WAKE_FOR);
  const back = gone + 2.0;
  fillFloor(g, at, x, y, F, [[-0.6, -RUSH_HALF * 0.75], [-0.6, RUSH_HALF * 0.75], [-back, RUSH_HALF * 0.75], [-back, -RUSH_HALF * 0.75]], RAW[0], 0.5 * fade);
  const was = g.globalAlpha;
  for (const s of [-0.85, -0.3, 0.3, 0.85]) {
    for (let f = -0.6; f > -back; f -= 0.04) {
      const [sx, sy] = onFloor(at, x, y, F, f, s * RUSH_HALF + 0.05 * Math.sin(f * 7));
      g.globalAlpha = 0.85 * fade;
      dotAt(g, sx, sy, Math.abs(s) > 0.5 ? GOUGE : INK[1], 2, 1);
    }
  }
  g.globalAlpha = was;
}

// =============================================================================================
// THE PALIMPSEST (THE COMBO): THE STRIP

/** The strip: from STRIP_FROM tiles before the Scraper's floor point (where its claws come down), STRIP_TILES long, STRIP_HALF tiles either side. Scraped out over STRIP_RUN seconds from the slam. */
export const STRIP_FROM = 3.0;
export const STRIP_TILES = 6;
export const STRIP_HALF = 0.85;
export const STRIP_RUN = 0.5;
/** It bursts from its near end to its far end over STRIP_BURST_RUN seconds, each place in it bursting for STRIP_BURST_FOR, its stain gone STRIP_STAIN_FOR after. */
export const STRIP_BURST_RUN = 0.35;
/** The strip bursts STRIP_BURST_AFTER the Quill has written the last of it (art/quill.ts QL_SWOOP.stop). */
export const STRIP_BURST_AFTER = 0.45;
export const STRIP_BURST_FOR = 0.5;
export const STRIP_STAIN_FOR = 1.6;
const stripBox = (from: number, to: number, half = STRIP_HALF): [number, number][] => [[from, -half], [from, half], [to, half], [to, -half]];
/** THROUGH THE STRIP'S WARNING (`k` 0 to 1): the strip marked out before the Scraper in pink. */
export function drawStripWarn(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, dx: number, dy: number, k: number): void {
  if (k <= 0 || k > 1) return;
  const F = frame(dx, dy);
  const box = stripBox(STRIP_FROM, STRIP_FROM + STRIP_TILES);
  fillFloor(g, at, x, y, F, box, FLAME[0], 0.12 + 0.2 * k);
  dashFloor(g, at, x, y, F, box, k, 0.5 + 0.5 * k);
}
/**
 * THE STRIP, from the Scraper's floor point (x, y) facing (dx, dy), `t` seconds after its slam: scraped bare, running out
 * from its claws over STRIP_RUN; lying bare. `written` (0 to 1): how far along it the Quill has written, from its far end
 * (`fromFar`: the Quill swoops down it toward the Scraper) or its near end, the Order's ink laid down its middle in a line
 * of script, burning pink; while it lies written it glows, the warning of its burst.
 */
export function drawStrip(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, dx: number, dy: number, t: number, written: number, fromFar = true): void {
  if (t < 0) return;
  const F = frame(dx, dy);
  const run = sm(t / STRIP_RUN);
  const to = STRIP_FROM + STRIP_TILES * run;
  fillFloor(g, at, x, y, F, stripBox(STRIP_FROM, to), RAW[1], 0.6);
  const was = g.globalAlpha;
  // (its edges ragged and gouged, scratches along it)
  for (const s of [-1, -0.55, 0, 0.55, 1]) {
    for (let f = STRIP_FROM; f < to; f += 0.04) {
      const j = Math.floor(f * 25);
      if (Math.abs(s) < 0.9 && hash(j, Math.round(s * 10), 6301) < 0.35) continue;
      const [sx, sy] = onFloor(at, x, y, F, f, s * STRIP_HALF * (Math.abs(s) > 0.9 ? 1 + 0.06 * hash(j, 2, 6302) : 1));
      g.globalAlpha = 0.9;
      dotAt(g, sx, sy, Math.abs(s) > 0.9 ? GOUGE : RAW[0], 2, 1);
    }
  }
  // (as it runs out: shreds thrown up at its head)
  if (t < STRIP_RUN + 0.2) {
    for (let i = 0; i < 18; i++) {
      const s = (hash(i, 1, 6303) - 0.5) * 2 * STRIP_HALF;
      const up = 34 * hash(i, 2, 6303) * (1 - sm((t - STRIP_RUN) / 0.2));
      const [sx, sy] = onFloor(at, x, y, F, to - 0.3 * hash(i, 3, 6303), s);
      g.globalAlpha = 1;
      dotAt(g, sx, sy - up, i % 3 ? RAW[3] : INK[0], 2, 2);
    }
  }
  // (the Quill's writing: a thick line of ink down its middle, script along it, the ink burning pink)
  if (written > 0) {
    const w0 = fromFar ? STRIP_FROM + STRIP_TILES * (1 - clamp01(written)) : STRIP_FROM;
    const end = fromFar ? STRIP_FROM + STRIP_TILES : STRIP_FROM + STRIP_TILES * clamp01(written);
    const pulse = 0.5 + 0.5 * Math.sin(t * 18);
    for (let f = w0; f < end; f += 0.03) {
      const j = Math.floor(f * 33);
      const wob = 0.18 * Math.sin(f * 9) + 0.08 * Math.sin(f * 23);
      for (let s = -0.16; s <= 0.16; s += 0.08) {
        const [sx, sy] = onFloor(at, x, y, F, f, wob + s);
        g.globalAlpha = 1;
        dotAt(g, sx, sy, INK[0], 2, 2);
      }
      // (its letters: loops and strokes either side of the line)
      if (hash(j, 1, 6304) < 0.4) {
        const s = (hash(j, 2, 6304) < 0.5 ? -1 : 1) * (0.3 + 0.35 * hash(j, 3, 6304));
        const [sx, sy] = onFloor(at, x, y, F, f, wob + s);
        dotAt(g, sx, sy, INK[1], 2, 2);
      }
      if (hash(j, 4, 6304) < 0.25 * pulse + 0.1) {
        const [sx, sy] = onFloor(at, x, y, F, f, wob);
        dotAt(g, sx, sy - 1, hash(j, 5, 6304) < 0.5 ? FLAME[2] : FLAME[3], 2, 2);
      }
    }
  }
  g.globalAlpha = was;
}
/** THE STRIP BURSTS, `t` seconds after it begins to: along it as it was written (from its far end, `fromFar`, or its near end) over STRIP_BURST_RUN, a wall of the Order's ink bursting up out of it, pink sparks thrown off it; its stain left drying, gone STRIP_STAIN_FOR after. */
export function drawStripBurst(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, dx: number, dy: number, t: number, fromFar = true): void {
  if (t < 0 || t > STRIP_BURST_RUN + STRIP_STAIN_FOR) return;
  const F = frame(dx, dy);
  const run = STRIP_TILES * sm(t / STRIP_BURST_RUN);
  const far = STRIP_FROM + STRIP_TILES;
  const dry = sm((t - STRIP_BURST_RUN - 0.3) / (STRIP_STAIN_FOR - 0.3));
  fillFloor(g, at, x, y, F, fromFar ? stripBox(far - run, far, STRIP_HALF * 1.05) : stripBox(STRIP_FROM, STRIP_FROM + run, STRIP_HALF * 1.05), INK[0], 0.5 * (1 - dry));
  wall(g, at, x, y, F, fromFar ? far : STRIP_FROM, fromFar ? STRIP_FROM : far, STRIP_HALF, t, STRIP_BURST_RUN, STRIP_BURST_FOR, 6401);
}
/** A wall of ink bursting up out of the floor along a strip from `from` to `to` (ahead), `half` either side: the burst running from its near end to its far end over `runFor`, each place bursting as it reaches it, for `life`. */
function wall(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, F: ReturnType<typeof frame>, from: number, to: number, half: number, t: number, runFor: number, life: number, seed: number): void {
  const was = g.globalAlpha;
  for (let i = 0; i < 160; i++) {
    const u = hash(i, 1, seed);
    const f = from + u * (to - from);
    const s = t - runFor * u;
    if (s < 0 || s > life) continue;
    const k = s / life;
    const side = (hash(i, 2, seed) - 0.5) * 2 * half;
    const up = (24 + 30 * hash(i, 3, seed)) * Math.sin(Math.PI * Math.min(1, k * 1.2));
    const [sx, sy] = onFloor(at, x, y, F, f, side);
    g.globalAlpha = 1 - sm((k - 0.6) / 0.4);
    // (a spike of ink: a short column of drops up out of the floor)
    for (let q = 0; q < 4; q++) dotAt(g, sx, sy - up * (q / 3), q === 3 && i % 4 === 0 ? FLAME[2] : q === 3 ? INK[2] : INK[0], 2, 3);
    if (i % 6 === 0) dotAt(g, sx + (hash(i, 4, seed) - 0.5) * 10, sy - up - 6 * k, FLAME[3], 2, 2);
  }
  g.globalAlpha = was;
}

// =============================================================================================
// THE QUILL: THE NIB STAB

/** Where its nib goes in (tiles ahead of its floor point: art/quill.ts STAB_AT), and how big the blow is (tiles round it); how long its splash lies. */
export const STAB_R = 1.05;
export const STAB_FOR = 1.0;
/** THROUGH THE STAB'S WARNING (`k` 0 to 1): a ring of pink closing on where the nib will go in, `ahead` tiles before it. */
export function drawStabWarn(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, dx: number, dy: number, ahead: number, k: number): void {
  if (k <= 0 || k > 1) return;
  const F = frame(dx, dy);
  fillFloor(g, at, x, y, F, ringAt(ahead, 0, STAB_R), FLAME[0], 0.18 + 0.2 * k);
  dashFloor(g, at, x, y, F, ringAt(ahead, 0, STAB_R * (1.6 - 0.6 * sm(k))), k, 0.5 + 0.5 * k);
}
/** THE STAB, `t` seconds after: ink bursts up where the nib went in, a splash and a star of cracks left on the floor, drying. */
export function drawStab(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, dx: number, dy: number, ahead: number, t: number): void {
  const F = frame(dx, dy);
  splash(g, at, x, y, F, ahead, 0, STAB_R * 0.8, t, STAB_FOR, 6501);
  burst(g, at, x, y, F, ahead, 0, t, STAB_R, 34, 6502, 0.45);
}

// =============================================================================================
// THE QUILL: INK LINES

/** Its three lines (art/quill.ts QL_LINES.strokes), each across the floor before it: how far ahead each lies (tiles), how long each is (tiles, its middle on its facing), how wide either side of it (tiles). */
export const LINES_AT = [1.8, 3.3, 4.8] as const;
export const LINE_LONG = 5.2;
export const LINE_HALF = 0.45;
/** Each line bursts LINE_BURST_AFTER its stroke ends, for LINE_BURST_FOR; its stain gone LINE_STAIN_FOR after it burst. Each stroke takes LINE_STROKE (art/quill.ts). */
export const LINE_BURST_AFTER = 0.6;
export const LINE_BURST_FOR = 0.5;
export const LINE_STAIN_FOR = 1.4;
const LINE_STROKE = 0.22;
/**
 * LINE `i` (0, 1 or 2) written by the Quill at (x, y) facing (dx, dy), `t` seconds after its stroke began: laid across the
 * floor as its neck whips across (line 0 and 2 from its right to its left, line 1 back), a band of the Order's ink a little
 * slanted, wet, burning pink at its edges (the warning); it BURSTS LINE_BURST_AFTER the stroke ends, a wall of ink up out
 * of it from end to end; its stain dries away.
 */
export function drawInkLine(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, dx: number, dy: number, i: number, t: number): void {
  if (t < 0) return;
  const F = frame(dx, dy);
  const ahead = LINES_AT[i] ?? LINES_AT[0];
  const laid = sm(t / LINE_STROKE);
  const bursts = t - LINE_STROKE - LINE_BURST_AFTER;
  if (bursts > LINE_STAIN_FOR) return;
  const dir = i % 2 ? -1 : 1;
  const half = LINE_LONG / 2;
  const slant = 0.25 * (i - 1);
  // (the line as a box across its facing, from its right end to its left: `along` -half (its right) to +half (its left))
  const along0 = -dir * half;
  const along1 = along0 + dir * LINE_LONG * laid;
  const lo = Math.min(along0, along1);
  const hi = Math.max(along0, along1);
  const box: [number, number][] = [[ahead - LINE_HALF + slant * lo / half, lo], [ahead + LINE_HALF + slant * lo / half, lo], [ahead + LINE_HALF + slant * hi / half, hi], [ahead - LINE_HALF + slant * hi / half, hi]];
  const dry = bursts > 0 ? sm((bursts - 0.2) / (LINE_STAIN_FOR - 0.2)) : 0;
  fillFloor(g, at, x, y, F, box, INK[0], 0.82 * (1 - dry));
  const was = g.globalAlpha;
  if (bursts < 0) {
    // (wet and burning: its edges glinting pink, brighter as its burst comes)
    const k = clamp01((t - LINE_STROKE) / LINE_BURST_AFTER);
    for (let s = lo; s < hi; s += 0.05) {
      for (const e of [-1, 1]) {
        if (hash(Math.floor(s * 20), e + 2, 6601 + i) > 0.55 + 0.4 * k) continue;
        const [sx, sy] = onFloor(at, x, y, F, ahead + e * LINE_HALF + slant * s / half, s);
        g.globalAlpha = 0.6 + 0.4 * k;
        dotAt(g, sx, sy, k > 0.7 ? FLAME[3] : FLAME[2], 2, 2);
      }
    }
    // (its head as it is written: a spatter of drops landing)
    if (t < LINE_STROKE + 0.05) {
      for (let q = 0; q < 10; q++) {
        const [sx, sy] = onFloor(at, x, y, F, ahead + (hash(q, 1, 6602) - 0.5) * 1.2, along1 + (hash(q, 2, 6602) - 0.5) * 0.6);
        g.globalAlpha = 1;
        dotAt(g, sx, sy - 8 * hash(q, 3, 6602), INK[0], 2, 2);
      }
    }
  } else {
    // (the burst: a wall of ink up out of it, end to end)
    const G = { fx: F.lx, fy: F.ly, lx: -F.fx, ly: -F.fy };
    // (in the line's own frame: along it is "ahead", across it is "left")
    const ox = x + F.fx * ahead;
    const oy = y + F.fy * ahead;
    wall(g, at, ox, oy, G, -half, half, LINE_HALF, bursts, 0.12, LINE_BURST_FOR, 6603 + i);
  }
  g.globalAlpha = was;
}

// =============================================================================================
// THE QUILL: OVERWRITE

/**
 * THE QUILL WRITING OVER THE SCRAPER, in screen pixels: (sx, sy) the middle of the Scraper's back on the screen, `t`
 * seconds into the writing: letters of the Order's fresh writing in the enemy's pink crawl in over its back from where
 * the nib touches, glowing, and sink into it; a soft pink light over it. Drawn over the Scraper while the Quill writes.
 */
export function drawOverwriting(g: CanvasRenderingContext2D, sx: number, sy: number, t: number): void {
  if (t < 0) return;
  const was = g.globalAlpha;
  for (let i = 0; i < 26; i++) {
    const t0 = (i / 26) * 1.3;
    const s = ((t - t0) % 1.3 + 1.3) % 1.3;
    if (t < t0) continue;
    const k = s / 1.3;
    // (each letter: written at the nib's side, crawls round over its back, sinks in)
    const a = hash(i, 1, 6701) * Math.PI * 2;
    const r = 26 * (1 - 0.5 * k) * (0.5 + 0.5 * hash(i, 2, 6701));
    const lx = sx + Math.cos(a + k * 2) * r * 1.3;
    const ly = sy + Math.sin(a + k * 2) * r * 0.55 - 6 * Math.sin(Math.PI * k);
    g.globalAlpha = Math.sin(Math.PI * k);
    // (a letter: a little loop or a stroke)
    const kind = Math.floor(hash(i, 3, 6701) * 3);
    const col = k < 0.5 ? FLAME[3] : FLAME[2];
    if (kind === 0) {
      dotAt(g, lx, ly, col, 2, 1);
      dotAt(g, lx + 2, ly - 1, col, 1, 2);
      dotAt(g, lx, ly - 2, col, 2, 1);
    } else if (kind === 1) {
      dotAt(g, lx, ly, col, 1, 3);
      dotAt(g, lx + 1, ly - 2, col, 2, 1);
    } else {
      dotAt(g, lx, ly, col, 3, 1);
      dotAt(g, lx + 3, ly - 1, col, 1, 1);
    }
  }
  g.globalAlpha = was;
}
