// WHAT THE FLESHMANCER SENDS OUT, ON THE FLOOR (the art chat, 11 Oct 2026). A MOCK-UP: NOT IN THE GAME.
// Nothing of the game draws these: the rules (what each hurts, how far, how long, how many) are the main
// chat's, and these are the pictures for them. As art/boss_shots.ts: drawn in the game's own pixels, as
// the floor's effects are, given where a point of the floor is on the screen (`FloorAt`).
//
// His picks, by 08:36 on 11 Oct (art/fleshmancer.ts has his moves):
//   "Bone shards from the skull (Recommended)": the skull spits a fan of bone shards. Each flies as a
//     splinter of bone with his fire streaming off it (`drawBoneShard`), its shadow under it
//     (`drawShardShadow`); where it strikes, it bursts into burning splinters (`drawShardBreak`).
//   "Rings of hands (Recommended)": he slams the floor; a wave runs out from him over the floor, cracking
//     it (`drawSlamWave`), and where it passes, rings of hands of his own dead burst up out of the floor,
//     grab at the air and are dragged back under: each hand is a picture (art/fleshmancer.ts
//     makeRingHandArt), the crack glowing before it comes and left after it (`drawHandCrack`).
//   "Raise the dead (Recommended)": the dead climb back up out of the bone heaps round the room: the
//     game's skeleton's own death played backwards (art/monster_bones3.ts deathOf3, from 1 to 0), its
//     bones snatched up off the heap and slammed together, with his light boiling up out of the heap
//     under it (`drawRaiseGlow`).
//   "Sweeping fire": a stream of his fire pours out of the skull's jaws over his head, arcs down onto the
//     floor and rushes along it (`drawFireStream`), round the room once like a clock hand; the floor it
//     has swept burns on a moment and dies down, leaving it scorched (`drawScorch`).
// Their colours are the enemy's: hot pink burning to gold (never a friend's cyan); the bone is the skull's.

import { hash } from './kit';
import { FLAME } from './mkit';
import type { FloorAt } from './mob_shots';
import { P } from './palette';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (k: number): number => {
  const v = clamp01(k);
  return v * v * (3 - 2 * v);
};
/** The skull's bone, lit to shade (art/fleshmancer.ts IVORY). */
const BONE = ['#f0e7d4', '#d9ccb3', '#ae9f88', '#76665c'] as const;

/** A pixel, rounded, in a colour. */
function dotAt(g: CanvasRenderingContext2D, x: number, y: number, color: string, w = 1, h = 1): void {
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}
/** A line of pixels from one point to another, each coloured by how far along it is (0 to 1). */
function lineAt(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: (k: number) => string, w = 1): void {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    dotAt(g, x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, color(k), w, 1);
  }
}
/**
 * A TONGUE OF HIS FIRE standing up off the floor at (x, y): `tall` pixels high, `wide` across at its widest,
 * its tip leaning `lean` over; gold at its foot, pink in its body, deep pink at its tip (a step hotter with
 * `hot`). Each row touches the one below it: a flame is never broken into lone pixels.
 */
function tongue(g: CanvasRenderingContext2D, x: number, y: number, tall: number, wide: number, lean: number, hot = 1): void {
  const rows = Math.round(tall);
  if (rows < 2) return;
  for (let i = 0; i < rows; i++) {
    const k = i / (rows - 1);
    const hw = Math.max(0.5, (wide / 2) * (k < 0.3 ? 0.8 + k : 1.1 * ((1 - k) / 0.7) ** 0.8));
    const cx = x + lean * k * k;
    const step = hot > 1.2 ? 1 : 0;
    const c = FLAME[Math.min(4, (k < 0.25 ? 3 : k < 0.65 ? 2 : 1) + step)];
    const xa = Math.round(cx - hw);
    const xb = Math.max(xa + 1, Math.round(cx + hw));
    dotAt(g, xa, y - i, c, xb - xa, 1);
  }
}
/** An ember, never a lone pixel: a fleck of three, slanting. */
function fleck(g: CanvasRenderingContext2D, x: number, y: number, c: string, slant: number): void {
  const dim = FLAME[Math.max(0, FLAME.indexOf(c) - 1)];
  dotAt(g, x, y, c);
  dotAt(g, x + 1, y + slant, dim);
  dotAt(g, x + 2, y + 2 * slant, dim);
}
/** A soft light (the game's own lights are laid by it: this is for pictures and films), additive. */
export function glowAt(g: CanvasRenderingContext2D, x: number, y: number, r: number, a: number, color: string = FLAME[3]): void {
  if (a <= 0.01 || r <= 0.5) return;
  const was = g.globalCompositeOperation;
  const wasA = g.globalAlpha;
  g.globalCompositeOperation = 'lighter';
  g.globalAlpha = Math.min(1, a);
  const grd = g.createRadialGradient(x, y, 0, x, y, r);
  grd.addColorStop(0, color);
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(x - r, y - r, r * 2, r * 2);
  g.globalCompositeOperation = was;
  g.globalAlpha = wasA;
}

// =============================================================================================
// THE BONE SHARDS

/** How the skull spits them: how many in the fan, how far apart (degrees), how fast (tiles a second), how far they go (tiles) before they strike the floor. */
export const FM_SHARD = { fan: 7, apart: 12, speed: 9, reach: 6.5 } as const;
/** How long a shard's burst lasts where it strikes (seconds). */
export const FM_SHARD_BREAK = 0.4;

/**
 * A BONE SHARD IN FLIGHT, over the floor at (x, y) on the screen, `z` pixels up, flying along (ux, uy) on the
 * screen: a splinter of bone, pointed, pale at its point and shaded along its underside, eight pixels long;
 * his fire streaming off its broken end behind it, flickering. (`t`: seconds it has flown.)
 */
export function drawBoneShard(g: CanvasRenderingContext2D, x: number, y: number, z: number, ux: number, uy: number, t: number, seed = 0): void {
  const l = Math.hypot(ux, uy) || 1;
  const u = [ux / l, uy / l];
  // (across it, on the side the light falls from: the upper left)
  let n = [-u[1], u[0]];
  if (n[0] + n[1] > 0) n = [-n[0], -n[1]];
  const tx = x;
  const ty = y - z;
  // the fire streaming off it, behind it: long and ragged, its tail flickering
  const tail = 11 + 3 * Math.sin(t * 40 + seed);
  for (let i = 6; i < 6 + tail; i++) {
    const k = (i - 6) / tail;
    const wob = Math.sin(i * 0.9 - t * 50 + seed) * 0.7 * k;
    const c = k < 0.25 ? FLAME[3] : k < 0.6 ? FLAME[2] : FLAME[1];
    const px = tx - u[0] * i + n[0] * wob;
    const py = ty - u[1] * i + n[1] * wob;
    dotAt(g, px, py, c);
    if (k < 0.45) dotAt(g, px - n[0], py - n[1], k < 0.2 ? FLAME[2] : FLAME[1]);
  }
  // the splinter: its point, its lit side and its underside, its broken end
  for (let i = 0; i < 8; i++) {
    const px = tx - u[0] * i;
    const py = ty - u[1] * i;
    dotAt(g, px, py, i === 0 ? BONE[0] : i < 5 ? BONE[1] : BONE[2]);
    if (i >= 2 && i <= 6) dotAt(g, px - n[0], py - n[1], i < 5 ? BONE[2] : BONE[3]);
    if (i >= 3 && i <= 5) dotAt(g, px + n[0], py + n[1], BONE[0]);
  }
  dotAt(g, tx - u[0] * 8, ty - u[1] * 8, FLAME[4]);
}
/** A shard's shadow on the floor under it, at (x, y) on the screen. */
export function drawShardShadow(g: CanvasRenderingContext2D, x: number, y: number): void {
  const was = g.globalAlpha;
  g.globalAlpha = was * 0.45;
  dotAt(g, x - 3, y, P.black, 6, 1);
  dotAt(g, x - 2, y + 1, P.black, 4, 1);
  g.globalAlpha = was;
}
/**
 * WHERE A SHARD STRIKES, at (x, y) on the screen, `z` up, flying along (ux, uy), `t` seconds after: it bursts
 * into his fire, a flash at once, and its splinters are flung on and up, burning, and fall to the floor,
 * burning down as they go; the fire where it struck sinks into the floor. FM_SHARD_BREAK long.
 */
export function drawShardBreak(g: CanvasRenderingContext2D, x: number, y: number, z: number, ux: number, uy: number, t: number): void {
  if (t < 0 || t >= FM_SHARD_BREAK) return;
  const k = t / FM_SHARD_BREAK;
  const l = Math.hypot(ux, uy) || 1;
  const u = [ux / l, uy / l];
  // the burst: a ball of fire where it struck, swelling over two frames and burning down into itself
  const r = t < 0.05 ? 2 + 60 * t : 5 * (1 - smooth((t - 0.05) / 0.25));
  if (r > 0.6) {
    for (let dy = -Math.ceil(r); dy <= Math.ceil(r); dy++) {
      for (let dx = -Math.ceil(r); dx <= Math.ceil(r); dx++) {
        const d = Math.hypot(dx, dy * 1.2) / r;
        if (d > 1) continue;
        dotAt(g, x + dx, y - z + dy, d < 0.35 && t < 0.15 ? FLAME[4] : d < 0.65 ? FLAME[3] : FLAME[2]);
      }
    }
  }
  // its splinters: flung on along its way and up, burning, falling to the floor, each a short streak
  for (let i = 0; i < 6; i++) {
    const a = (i - 2.5) * 0.55 + (hash(i, 1, 281) - 0.5) * 0.4;
    const dx = u[0] * Math.cos(a) - u[1] * Math.sin(a);
    const dy = u[0] * Math.sin(a) + u[1] * Math.cos(a);
    const sp = 30 + 30 * hash(i, 2, 281);
    const vz = 25 + 35 * hash(i, 3, 281);
    const zz = Math.max(0, z + vz * t - 160 * t * t);
    const px = x + dx * sp * t;
    const py = y + dy * sp * t * 0.6 - zz;
    const life = 0.55 + 0.4 * hash(i, 4, 281);
    if (k > life) continue;
    const hot = 1 - k / life;
    dotAt(g, px, py, hot > 0.5 ? BONE[1] : BONE[2]);
    dotAt(g, px - dx, py - dy * 0.6 + (zz > 0 ? 1 : 0), hot > 0.5 ? FLAME[3] : FLAME[2]);
    if (hot > 0.4) dotAt(g, px - 2 * dx, py - 2 * dy * 0.6 + (zz > 0 ? 2 : 0), FLAME[1]);
  }
  // (sparks thrown up, each a slanting fleck)
  for (let i = 0; i < 5; i++) {
    if (k > 0.5 + 0.3 * hash(i, 5, 281)) continue;
    const a = hash(i, 6, 281) * Math.PI * 2;
    const far = 4 + 12 * Math.sqrt(k);
    fleck(g, x + Math.cos(a) * far, y - z - 3 - 10 * k + Math.sin(a) * far * 0.5, k < 0.3 ? FLAME[3] : FLAME[2], Math.cos(a) * Math.sin(a) >= 0 ? 1 : -1);
  }
  glowAt(g, x, y - z, 16 - 8 * k, 0.55 * (1 - k));
}

// =============================================================================================
// THE RINGS OF HANDS

/** The rings, as the films lay them: each ring's radius (tiles), how many hands round it, and how wide the gap left in it is (hands left out). */
export const FM_RINGS_LAID: ReadonlyArray<{ r: number; n: number; gap: number }> = [
  { r: 1.5, n: 8, gap: 2 },
  { r: 2.9, n: 14, gap: 3 },
  { r: 4.3, n: 20, gap: 4 },
];
/** How fast the wave runs out over the floor from where he slams it (tiles a second): each ring bursts up as it reaches it. */
export const FM_WAVE_SPEED = 3.6;
/** How long before a hand bursts up its crack glows (seconds: the warning), and how long the cracks are left after it has gone under. */
export const FM_HAND_WARN = 0.4;
export const FM_HAND_LEFT = 0.6;

/** A jagged crack on the floor from (x, y) (tiles) along (fx, fy), `long` tiles, as screen points: the same every frame for the same seed. */
function jagged(at: FloorAt, ax: number, ay: number, fx: number, fy: number, long: number, seed: number, wild = 0.08): [number, number][] {
  const sx = -fy;
  const sy = fx;
  const out: [number, number][] = [];
  const n = Math.max(2, Math.round(long * 5));
  for (let i = 0; i <= n; i++) {
    const d = (i / n) * long;
    const off = i === 0 ? 0 : (hash(i, seed, 283) - 0.5) * 2 * wild;
    const [x, y] = at(ax + fx * d + sx * off, ay + fy * d + sy * off);
    out.push([x, y]);
  }
  return out;
}
function alongPts(pts: [number, number][], each: (x: number, y: number, k: number) => void): void {
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

/** How long the slam's wave lasts on the floor (seconds): out past the last ring, and dying. */
export const FM_WAVE_TIME = 1.6;
/**
 * WHERE HE SLAMS THE FLOOR (his floor point, x, y in tiles), `t` seconds after: cracks burst out from the
 * staff's foot every way, glowing, and a WAVE of his light runs out over the floor from him (FM_WAVE_SPEED),
 * a broken ring of fire skimming it, the floor's dust kicked up along it; the rings of hands burst up where
 * it passes. The cracks darken; the wave runs out past the last ring and is gone over the edge of the room's
 * light.
 */
export function drawSlamWave(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, t: number): void {
  if (t < 0 || t >= FM_WAVE_TIME) return;
  const was = g.globalAlpha;
  // the cracks from his foot: racing out in the first tenth of a second, glowing, then dark
  const reach = clamp01(t / 0.12);
  const hot = 1 - smooth((t - 0.15) / 0.6);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + hash(i, 7, 283) * 0.5;
    const long = (0.7 + 0.6 * hash(i, 8, 283)) * reach;
    const pts = jagged(at, x, y, Math.cos(a), Math.sin(a), long, 20 + i);
    alongPts(pts, (px, py, k) => {
      dotAt(g, px, py + 1, P.ink);
      dotAt(g, px, py, hot > 0.15 && k < 0.85 ? (hot > 0.6 && k < 0.5 ? FLAME[3] : FLAME[2]) : P.ink);
    });
  }
  // the wave: a broken ring of fire skimming out over the floor, unbroken arcs (never lone pixels), fewer as it goes on
  const R = 0.3 + FM_WAVE_SPEED * t;
  const fade = 1 - smooth((R - 4.4) / 0.9);
  if (fade > 0.02) {
    for (let seg = 0; seg < 18; seg++) {
      if (hash(seg, 9, 283) < 0.12 + 0.2 * smooth(t / 1.2)) continue;
      const arc: [number, number][] = [];
      for (let j = 0; j <= 6; j++) {
        const a = ((seg + j / 6 * 0.8) / 18) * Math.PI * 2;
        arc.push(at(x + Math.cos(a) * R, y + Math.sin(a) * R) as [number, number]);
      }
      alongPts(arc, (px, py) => {
        g.globalAlpha = was * fade;
        dotAt(g, px, py, t < 0.5 ? FLAME[3] : FLAME[2]);
        dotAt(g, px, py - 1, FLAME[1]);
        dotAt(g, px, py + 1, P.ink);
      });
    }
  }
  g.globalAlpha = was;
  const [cx, cy] = at(x, y);
  glowAt(g, cx, cy, 30 - 10 * smooth(t / 0.6), 0.5 * hot);
}

/**
 * WHERE ONE OF THE HANDS COMES, at (x, y) (tiles), `t` seconds from when it bursts up (art/fleshmancer.ts
 * paintRingHand): before (FM_HAND_WARN), the floor cracks open there out every way, its cracks glowing
 * brighter and longer as it comes, beating faster (the warning); while it is up, the cracks dark round the
 * hole; after it has gone under (FM_HAND_TIME), they are left a while (FM_HAND_LEFT), cooling.
 */
export function drawHandCrack(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, t: number, up = 1.1, seed = 0): void {
  if (t < -FM_HAND_WARN || t >= up + FM_HAND_LEFT) return;
  const was = g.globalAlpha;
  const coming = t < 0 ? 1 + t / FM_HAND_WARN : 1;
  const fade = t < up ? 1 : 1 - (t - up) / FM_HAND_LEFT;
  const hot = t < 0 ? 0.4 + 0.6 * coming : clamp01(1 - t / 0.3);
  // (a cluster of short cracks, each its own way, crazing the floor round the spot: never a star, nor a letter)
  for (let i = 0; i < 8; i++) {
    const r0 = 0.04 + 0.16 * hash(i, seed + 13, 283) * (0.4 + 0.6 * coming);
    const a0 = hash(i, seed + 14, 283) * Math.PI * 2;
    const a = hash(i, seed + 11, 283) * Math.PI * 2;
    const long = (0.08 + 0.1 * hash(i, seed + 12, 283)) * (0.4 + 0.6 * coming);
    const pts = jagged(at, x + Math.cos(a0) * r0, y + Math.sin(a0) * r0, Math.cos(a), Math.sin(a), long, 60 + i + seed * 5, 0.04);
    alongPts(pts, (px, py, f) => {
      g.globalAlpha = was * fade;
      dotAt(g, px, py, hot > 0.1 && r0 < 0.13 && f < 0.7 ? (hot > 0.6 ? FLAME[3] : FLAME[2]) : P.ink);
    });
  }
  g.globalAlpha = was;
  if (t < 0) {
    const [cx, cy] = at(x, y);
    glowAt(g, cx, cy, 6 + 6 * coming, (0.3 + 0.4 * coming) * (0.75 + 0.25 * Math.sin(t * (18 + 24 * coming))));
  }
}

// =============================================================================================
// RAISING THE DEAD

/** How long the dead take to come back up (seconds): the game's skeleton's death, played backwards, and a beat before it. */
export const FM_RAISE_STIR = 0.3;
/**
 * HIS LIGHT BOILING UP OUT OF A HEAP OF BONES as one of the dead comes back up out of it, at (x, y) on the
 * screen, `t` seconds from when he shrieks: the heap's cracks kindle; his light wells up out of it,
 * streaming up in slanting flecks, swelling as the bones are snatched up (from FM_RAISE_STIR); a flash as
 * they slam together; and it sinks back into the heap as the dead one stands.
 */
export function drawRaiseGlow(g: CanvasRenderingContext2D, x: number, y: number, t: number, long = 1.0): void {
  if (t < 0 || t > FM_RAISE_STIR + long + 0.3) return;
  const up = smooth(t / FM_RAISE_STIR);
  const end = FM_RAISE_STIR + long;
  const down = 1 - smooth((t - end) / 0.3);
  const k = up * down;
  // (the flecks of light streaming up out of the heap)
  // (his fire licking up out of the bones, flames standing up among them, swelling as the bones are snatched up and sinking back as the dead one stands)
  for (let i = 0; i < 5; i++) {
    const ox = (hash(i, 3, 287) - 0.5) * 20;
    const oy = (hash(i, 5, 287) - 0.5) * 6;
    const tall = (5 + 6 * hash(i, 4, 287)) * k * (0.8 + 0.25 * Math.sin(t * 23 + i * 2.1));
    if (tall >= 2) tongue(g, x + ox, y + oy, tall, 3, Math.sin(t * 9 + i) * 1.5, t > FM_RAISE_STIR ? 1.3 : 1);
  }
  // (the flash as the bones slam together)
  const slam = 1 - smooth(Math.abs(t - end) / 0.08);
  glowAt(g, x, y - 6, 18 + 10 * slam, 0.35 * k + 0.4 * slam);
  if (slam > 0.3) {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      fleck(g, x + Math.cos(a) * 12 * (1.4 - slam), y - 14 + Math.sin(a) * 9 * (1.4 - slam), FLAME[3], Math.cos(a) * Math.sin(a) >= 0 ? 1 : -1);
    }
  }
}

// =============================================================================================
// THE SWEEPING FIRE

/** Where the stream comes down onto the floor (tiles from him) and how far it rushes on along it. */
export const FM_FIRE_LAND = 1.0;
export const FM_FIRE_REACH = 4.8;
/** How long the floor it has swept burns on after it (seconds), dying down. */
export const FM_FIRE_BURN = 0.6;

/** The way the stream goes, as a way on the floor (tiles), at a moment: or null if it is not pouring then. */
export type FireWay = (t: number) => readonly [number, number] | null;

/**
 * THE SCORCH it leaves: where it swept more than a moment ago (`way`, his floor point x, y in tiles), dark
 * streaks burned into the floor from where it came down out to its reach, a few embers still in them. Laid on
 * the floor, under everything; it stays (how long is the game's).
 */
export function drawScorch(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, way: FireWay, t: number, from = 0): void {
  const was = g.globalAlpha;
  for (let s = from; s < t - FM_FIRE_BURN * 0.5; s += 1 / 30) {
    const w = way(s);
    if (!w) continue;
    const i = Math.round(s * 30);
    if (i % 2) continue;
    for (let d = FM_FIRE_LAND; d < FM_FIRE_REACH; d += 0.25) {
      if (hash(i, Math.round(d * 4), 289) < 0.35) continue;
      const [px, py] = at(x + w[0] * d, y + w[1] * d);
      g.globalAlpha = was * 0.4;
      dotAt(g, px - 1, py, P.black, 3, 1);
      if (hash(i, Math.round(d * 4), 291) < 0.06 && t - s < 2.5) {
        g.globalAlpha = was;
        dotAt(g, px, py - 1, FLAME[1], 2, 1);
      }
    }
  }
  g.globalAlpha = was;
}

/**
 * THE STREAM, `t` seconds into it, pouring out of the skull's jaws (mx, my on the screen) over his head:
 * a rope of his fire, white-gold at its heart, arcing out and down onto the floor FM_FIRE_LAND tiles from his
 * floor point (x, y in tiles) along `way(t)`, blobs of it rushing down it; and from there a river of fire
 * rushing on along the floor out to FM_FIRE_REACH, its flames standing up off it, splashing up where it ends.
 * Behind it, the floor it has swept in the last FM_FIRE_BURN seconds burns on, its flames sinking down into
 * it. As it starts (the burst) it shoots out to its reach in a tenth of a second; as it stops, what is left of
 * it is flung on out and falls.
 */
export function drawFireStream(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, mx: number, my: number, way: FireWay, t: number, start: number, stop: number): void {
  const was = g.globalAlpha;
  // THE FLOOR IT HAS SWEPT, still burning, its flames sinking
  for (let i = Math.ceil(Math.max(start, t - FM_FIRE_BURN) * 10); i / 10 < t - 1 / 30; i++) {
    const s = i / 10;
    const w = way(s);
    if (!w) continue;
    const left = 1 - (t - s) / FM_FIRE_BURN;
    for (let j = 0; j < 4; j++) {
      const d = FM_FIRE_LAND + 0.4 + j * 0.95 + 0.3 * hash(i, j, 293);
      if (d > FM_FIRE_REACH) continue;
      const [px, py] = at(x + w[0] * d, y + w[1] * d);
      // (each a flame standing where the stream passed, sinking down into the floor as it dies)
      const tall = (6 + 5 * hash(i, j, 295)) * left * (0.85 + 0.15 * Math.sin(t * 30 + i + j));
      if (tall >= 4) tongue(g, px, py, tall, 3, Math.sin(i * 1.3 + j) * 1.5, left > 0.5 ? 1.3 : 0.9);
    }
  }
  const w = way(t);
  // (as it starts: shooting out to its reach; as it stops: what is left flung on out)
  const grow = clamp01((t - start) / 0.1);
  const gone = clamp01((t - stop) / 0.16);
  const wl = w ?? way(stop - 1 / 60);
  if (!wl || t < start || gone >= 1) {
    g.globalAlpha = was;
    return;
  }
  const [fx, fy] = at(x + wl[0] * FM_FIRE_LAND, y + wl[1] * FM_FIRE_LAND);
  // THE ROPE OF FIRE, from the jaws out and down to the floor: a curve bulging out the way it pours
  const [ox, oy] = at(x + wl[0] * 2.2, y + wl[1] * 2.2);
  const cx = mx + (ox - mx) * 0.55;
  const cy = my - 6 + (oy - my) * 0.05;
  const rope = (k: number): [number, number] => [(1 - k) * (1 - k) * mx + 2 * (1 - k) * k * cx + k * k * fx, (1 - k) * (1 - k) * my + 2 * (1 - k) * k * cy + k * k * fy];
  const k0 = gone;
  const k1 = Math.min(1, grow * 2.5);
  const N = 160;
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i <= N; i++) {
      const k = i / N;
      if (k < k0 || k > k1) continue;
      const [px, py] = rope(k);
      // (its heart rushing down it: brighter where a surge of it is)
      const surge = 0.5 + 0.5 * Math.sin(k * 22 - t * 40);
      const r = [2.3 + 1.6 * k, 1.5 + 1.1 * k, 0.6 + 0.6 * k * surge][pass];
      const c = [FLAME[2], FLAME[3], FLAME[4]][pass];
      if (r < 0.5) continue;
      const R = Math.ceil(r);
      for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) if (Math.hypot(dx, dy) <= r) dotAt(g, px + dx, py + dy, c);
    }
  }
  // THE RIVER OF FIRE along the floor, from where it comes down out to its reach: its bed, and its flames standing up off it, rushing out
  const reach = FM_FIRE_LAND + (FM_FIRE_REACH - FM_FIRE_LAND) * clamp01((grow * 2.5 - 1) / 1.5);
  const from = FM_FIRE_LAND + (FM_FIRE_REACH - FM_FIRE_LAND) * gone;
  if (reach > from + 0.05) {
    const bed = jagged(at, x + wl[0] * from, y + wl[1] * from, wl[0], wl[1], reach - from, 31, 0.05);
    alongPts(bed, (px, py) => {
      dotAt(g, px - 2, py - 1, FLAME[1], 5, 1);
      dotAt(g, px - 2, py, FLAME[2], 5, 1);
      dotAt(g, px - 1, py, FLAME[3], 3, 1);
      dotAt(g, px - 2, py + 1, FLAME[1], 5, 1);
    });
    // (its flames standing up off it, rushing out along it: each surging up as it goes and sinking again)
    for (let d = from; d < reach; d += 0.22) {
      const j = Math.round(d * 10);
      const flow = (((d - t * 6) % 0.66) + 0.66) % 0.66 / 0.66;
      const [px, py] = at(x + wl[0] * d, y + wl[1] * d);
      const near = 1 - 0.3 * ((d - FM_FIRE_LAND) / (FM_FIRE_REACH - FM_FIRE_LAND));
      const tall = (6 + 9 * Math.sin(Math.PI * flow) + 2 * Math.sin(t * 37 + j)) * near;
      tongue(g, px + (hash(j, 1, 297) - 0.5) * 3, py, tall, 4, Math.sin(t * 20 + j) * 2, 1.3);
    }
    // THE SPLASH where it ends: taller tongues, sparks flung up and on
    const [ex, ey] = at(x + wl[0] * reach, y + wl[1] * reach);
    for (let j = 0; j < 3; j++) tongue(g, ex + (j - 1) * 3, ey + (j === 1 ? 1 : 0), 8 + 5 * Math.abs(Math.sin(t * 25 + j * 2)), 3, (j - 1) * 2, 1.3);
    for (let i = 0; i < 5; i++) {
      const life = (((t * 3 + hash(i, 2, 297)) % 1) + 1) % 1;
      if (life > 0.8) continue;
      fleck(g, ex + (hash(i, 3, 297) - 0.5) * 14 + life * 6, ey - 4 - life * 16, life < 0.4 ? FLAME[3] : FLAME[2], i % 2 ? 1 : -1);
    }
    glowAt(g, ex, ey - 3, 18, 0.45 * (1 - gone));
    const [lx, ly] = at(x + wl[0] * ((from + reach) / 2), y + wl[1] * ((from + reach) / 2));
    glowAt(g, lx, ly - 2, 34, 0.35 * (1 - gone));
  }
  glowAt(g, fx, fy - 3, 16, 0.5 * (1 - gone));
  glowAt(g, mx, my, 14, 0.5 * (1 - gone));
  g.globalAlpha = was;
}
