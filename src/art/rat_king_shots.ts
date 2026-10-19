// WHAT THE RAT KING THROWS AND WHERE IT GOES (the art chat, 19 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the
// game draws these yet: the rules (how far a word flies, what it does to the hero, how the swarm goes from one place to
// another) are the main chat's, and these are the pictures for them. As art/crier_shots.ts: drawn in the game's own
// pixels, given where a point of the floor is on the screen (`at`, from tiles).
//
// THE RAT KING (art/rat_king.ts):
//   STOLEN WORDS: through the warning, a thin line of the enemy's pink runs along the floor the way the word will fly
//     (`drawWordAim`); then the word itself flies (`drawStolenWord`): the shape of one of the hero's own words, fire,
//     frost, lightning or poison, but burning the enemy's pink to gold, never a friend's colour (his rulebook, Colour 3);
//     and where it lands it bursts in its own way (`drawWordBurst`).
//   UNKNOT: between the rats bursting outward and their knotting again somewhere else, the swarm runs across the floor
//     from the one place to the other, a stream of dark rats, eyes pink (`drawSwarm`).

import { hash } from './kit';
import { FLAME } from './mkit';
import type { FloorAt } from './mob_shots';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const INK = '#0e0c24';
function dotAt(g: CanvasRenderingContext2D, x: number, y: number, color: string, w = 1, h = 1): void {
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}

/** The four stolen words. */
export type StolenWord = 'fire' | 'frost' | 'lightning' | 'poison';
/** How fast a word flies (tiles a second), and how long its burst lasts (seconds). */
export const WORD_SPEED = 7;
export const WORD_BURST_FOR = 0.5;
/** How long the swarm takes to run from one place to the other, at most (seconds), and how many rats are drawn in it. */
export const SWARM_FOR = 0.9;
export const SWARM_RATS = 18;

/**
 * THE WARNING: a thin line of the enemy's pink along the floor from (x0, y0) toward (x1, y1) (tiles), `k` of the way
 * through the warning: it runs out along the way and brightens, dashes moving along it.
 */
export function drawWordAim(g: CanvasRenderingContext2D, at: FloorAt, x0: number, y0: number, x1: number, y1: number, k: number, t: number): void {
  if (k <= 0) return;
  const was = g.globalAlpha;
  const d = Math.hypot(x1 - x0, y1 - y0) || 1;
  const reach = clamp01(k * 1.4);
  const n = Math.ceil(d * 10 * reach);
  for (let i = 0; i < n; i++) {
    const q = i / (d * 10);
    if (((i + Math.floor(t * 30)) % 5) === 4) continue;
    const [sx, sy] = at(x0 + (x1 - x0) * q, y0 + (y1 - y0) * q);
    g.globalAlpha = 0.3 + 0.6 * clamp01(k);
    dotAt(g, sx, sy, k > 0.7 ? FLAME[2] : FLAME[1], 2, 1);
  }
  g.globalAlpha = was;
}

/**
 * A STOLEN WORD IN FLIGHT, `t` seconds after it leaves the King's mouth at (x0, y0), `rise` game pixels up, toward
 * (x1, y1), flying WORD_SPEED; null once it is there. Drawn in its own shape, in the enemy's fire.
 */
export function drawStolenWord(g: CanvasRenderingContext2D, at: FloorAt, kind: StolenWord, x0: number, y0: number, rise: number, x1: number, y1: number, t: number): boolean {
  const d = Math.hypot(x1 - x0, y1 - y0) || 1;
  const long = d / WORD_SPEED;
  if (t < 0 || t >= long) return false;
  const u = t / long;
  const px = x0 + (x1 - x0) * u;
  const py = y0 + (y1 - y0) * u;
  const [sx, sy0] = at(px, py);
  const sy = sy0 - rise * (1 - u) - 6 * u;
  const [ax, ay] = at(x0, y0);
  const dir = Math.atan2(sy - (ay - rise), sx - ax);
  const cx = Math.cos(dir);
  const cy = Math.sin(dir);
  if (kind === 'fire') {
    // a teardrop of the enemy's fire, its tail streaming back, embers shed behind
    for (let i = 10; i >= 0; i--) {
      const r = 4 - i * 0.32;
      const ex = sx - cx * i * 1.8;
      const ey = sy - cy * i * 1.8 + Math.sin(t * 40 + i) * 0.6;
      dotAt(g, ex - r, ey - r * 0.7, i < 2 ? FLAME[4] : i < 5 ? FLAME[3] : i < 8 ? FLAME[2] : FLAME[1], Math.max(1, Math.round(r * 2)), Math.max(1, Math.round(r * 1.4)));
    }
    for (let i = 0; i < 6; i++) dotAt(g, sx - cx * (14 + i * 4) + (hash(i, Math.floor(t * 20), 6201) - 0.5) * 6, sy - cy * (14 + i * 4) + (hash(i, 1, 6201) - 0.5) * 6, FLAME[i % 2 ? 2 : 3]);
  } else if (kind === 'frost') {
    // a cluster of shards, spinning, each a narrow diamond of pink ice, glints of gold on their points
    for (let i = 0; i < 5; i++) {
      const a = t * 14 + (i / 5) * Math.PI * 2;
      const ox = Math.cos(a) * 4;
      const oy = Math.sin(a) * 2;
      for (let k = -3; k <= 3; k++) dotAt(g, sx + ox + cx * k, sy + oy + cy * k - Math.abs(k) * 0, Math.abs(k) === 3 ? FLAME[3] : FLAME[2], Math.abs(k) < 2 ? 2 : 1, 1);
    }
    dotAt(g, sx - 1, sy - 1, FLAME[4], 3, 2);
    for (let i = 1; i < 5; i++) dotAt(g, sx - cx * i * 4, sy - cy * i * 4, FLAME[1]);
  } else if (kind === 'lightning') {
    // a forked bolt jumping ahead in jags, its head a hot knot
    let lx = sx;
    let ly = sy;
    for (let i = 0; i < 7; i++) {
      const nx = lx - cx * 4 + (hash(i, Math.floor(t * 30), 6202) - 0.5) * 6;
      const ny = ly - cy * 4 + (hash(i, Math.floor(t * 30) + 7, 6202) - 0.5) * 6;
      const steps = 4;
      for (let k = 0; k <= steps; k++) dotAt(g, lx + ((nx - lx) * k) / steps, ly + ((ny - ly) * k) / steps, i < 2 ? FLAME[4] : FLAME[3], 2, 1);
      if (i === 3) for (let k = 0; k <= 4; k++) dotAt(g, nx + k * 1.5, ny + k, FLAME[2]);
      lx = nx;
      ly = ny;
    }
    dotAt(g, sx - 2, sy - 2, FLAME[4], 4, 3);
  } else {
    // poison: a swollen gob, its skin burning pink, dripping a trail of drops
    for (let y = -4; y <= 4; y++) for (let x = -5; x <= 5; x++) {
      if ((x * x) / 25 + (y * y) / 16 > 1) continue;
      dotAt(g, sx + x, sy + y, x + y < -4 ? FLAME[3] : (x * x) / 25 + (y * y) / 16 > 0.6 ? FLAME[1] : FLAME[2]);
    }
    dotAt(g, sx - 2, sy - 2, FLAME[4], 2, 1);
    for (let i = 1; i < 6; i++) dotAt(g, sx - cx * i * 4, sy - cy * i * 4 + i * 1.2, FLAME[i % 2 ? 1 : 2], 2, 2);
  }
  // its dark seam under it, so it reads against any floor
  dotAt(g, sx - 1, sy + 4, INK, 3, 1);
  return true;
}

/** WHERE IT LANDS, `t` seconds after, at (x, y): fire a ring of flame; frost a star of shards; lightning a crackle of forks; poison a splash and a pool. */
export function drawWordBurst(g: CanvasRenderingContext2D, at: FloorAt, kind: StolenWord, x: number, y: number, t: number): void {
  if (t < 0 || t >= WORD_BURST_FOR) return;
  const q = t / WORD_BURST_FOR;
  const was = g.globalAlpha;
  const R = 0.3 + 0.9 * Math.sqrt(q);
  const n = 28;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = kind === 'frost' ? R * (i % 2 ? 1 : 0.55) : kind === 'lightning' ? R * (0.6 + 0.4 * hash(i, Math.floor(t * 30), 6203)) : R;
    const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
    g.globalAlpha = 1 - q;
    const up = kind === 'fire' ? 8 * Math.sin(q * Math.PI) * hash(i, 1, 6203) : kind === 'poison' ? 6 * 4 * q * (1 - q) * hash(i, 2, 6203) : 0;
    dotAt(g, sx, sy - up, q < 0.3 ? FLAME[3] : FLAME[2], 2, 2);
  }
  // the heart of it, burning, fading
  const [cx, cy] = at(x, y);
  g.globalAlpha = 1 - q;
  dotAt(g, cx - 3, cy - 2, q < 0.4 ? FLAME[4] : FLAME[2], 6, 4);
  g.globalAlpha = was;
}

/**
 * THE SWARM between unknotting and knotting: SWARM_RATS small dark rats running from (x0, y0) to (x1, y1) (tiles),
 * `t` seconds since they burst away, each its own path and pace, all there by SWARM_FOR; their pink eyes.
 */
export function drawSwarm(g: CanvasRenderingContext2D, at: FloorAt, x0: number, y0: number, x1: number, y1: number, t: number): void {
  if (t < 0 || t >= SWARM_FOR) return;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const d = Math.hypot(dx, dy) || 1;
  const nx = -dy / d;
  const ny = dx / d;
  for (let i = 0; i < SWARM_RATS; i++) {
    const delay = hash(i, 0, 6204) * 0.25;
    const pace = 0.75 + 0.25 * hash(i, 1, 6204);
    const q = clamp01((t - delay) / ((SWARM_FOR - 0.25) * pace));
    if (q <= 0 || q >= 1) continue;
    const side = (hash(i, 2, 6204) - 0.5) * 1.6 * Math.sin(q * Math.PI);
    const wig = Math.sin(q * 30 + i) * 0.08;
    const [sx, sy] = at(x0 + dx * q + nx * (side + wig), y0 + dy * q + ny * (side + wig));
    const [tx, ty] = at(x0 + dx * (q + 0.02) + nx * side, y0 + dy * (q + 0.02) + ny * side);
    const dirx = Math.sign(tx - sx) || 1;
    // body, head, tail; an eye
    dotAt(g, sx - 3, sy - 2, '#2a2426', 6, 3);
    dotAt(g, sx - 2, sy - 3, '#4c433e', 4, 1);
    dotAt(g, sx + dirx * 3, sy - 2, '#37302f', 2, 2);
    dotAt(g, sx + dirx * 3 + (dirx > 0 ? 1 : 0), sy - 2, FLAME[2]);
    dotAt(g, sx - dirx * 5, sy - 1, '#664c4c', 3, 1);
    dotAt(g, sx - dirx * 7, sy, '#664c4c', 2, 1);
    dotAt(g, sx - 3, sy + 1, INK, 6, 1);
  }
}
