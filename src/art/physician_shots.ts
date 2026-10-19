// WHAT THE PHYSICIAN THROWS, TAKES AND LEAVES ON THE FLOOR (the art chat, 19 Oct 2026). A MOCK-UP: NOT IN THE GAME.
// Nothing of the game draws these yet: the rules (how far the Draw reaches, which word it takes and for how long, how
// many phials he throws and where, how big a cloud of the Hush is and what it does, how many patients his Rounds raise)
// are the main chat's, and these are the pictures for them. As art/crier_shots.ts and art/rat_king_shots.ts: drawn in
// the game's own pixels, given where a point of the floor is on the screen (`at`, from tiles).
//
// THE PHYSICIAN (art/physician.ts, art/physician_moves.ts):
//   THE RAP: where the cane's ferrule strikes the floor, chips and dust thrown up and a star of cracks (`drawCaneRap`).
//   THE DRAW: through its warning, a line of the enemy's pink along the floor the way his lunge will go
//     (`drawDrawAim`). The word he draws out of you is pushed up out of his quill as he holds the syringe over his
//     head, and hangs there (his doc: “which glows over his head until you beat it back out of him”): the rune of your
//     own word, burning the enemy's pink (`drawHeldWord`); beaten out of him, it breaks free and flies home to you,
//     taking its own colour again as it comes (`drawWordFreed`).
//   TONIC: the phials he flings, tumbling through the air (`drawPhialFlight`); where each lands it smashes, the pale
//     green tonic splashes, and a cloud of the Hush wells up out of it and lies on the floor, roiling, until it thins
//     away (`drawHushCloud`).
//   ROUNDS: from each rap of his cane on the floor, a ring of the Hush rolls out across the room (`drawRoundsRing`);
//     where the patients rise is the game's.

import { hash } from './kit';
import { FLAME } from './mkit';
import { GLYPH, WORD_COLOR } from './icons';
import type { FloorAt } from './mob_shots';
import type { WordId } from '../game/types';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const sm = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
function dotAt(g: CanvasRenderingContext2D, x: number, y: number, color: string, w = 1, h = 1): void {
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}
const mixHex = (a: string, b: string, t: number): string => {
  const p = (h: string, i: number): number => parseInt(h.slice(1 + 2 * i, 3 + 2 * i), 16);
  const c = [0, 1, 2].map((i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * clamp01(t)));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
};
/** The floor's dust and chips; the Hush; the tonic and its glass; the dark seam. */
const DUST = ['#4a4438', '#6e6656', '#958c78'];
const HUSH = ['#262234', '#3e3852', '#625a7a', '#9890b4'];
const TONIC = ['#3b4a30', '#5a7048', '#86a066', '#a8c086'];
const GLASS = ['#84948a', '#bcc8c0', '#dce4dc'];
const INK = '#0e0c24';

// =============================================================================================
// THE RAP

/** How long the rap's chips and dust last (seconds); how far its cracks run (tiles). */
export const RAP_FOR = 0.45;
export const RAP_CRACKS = 0.5;
/** WHERE THE CANE STRUCK at (x, y) (tiles), `t` seconds after: a star of cracks run out and fade; chips and dust thrown up and down again. */
export function drawCaneRap(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, t: number): void {
  if (t < 0 || t >= RAP_FOR) return;
  const q = t / RAP_FOR;
  const was = g.globalAlpha;
  // the cracks
  g.globalAlpha = 1 - q * 0.8;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + hash(i, 0, 7701) * 0.6;
    const reach = RAP_CRACKS * (0.5 + 0.5 * hash(i, 1, 7701)) * Math.min(1, q * 5);
    for (let k = 0; k < 8; k++) {
      const r = (reach * k) / 8;
      const jog = (hash(i, k, 7702) - 0.5) * 0.06;
      const [sx, sy] = at(x + Math.cos(a + jog * 4) * r, y + Math.sin(a + jog * 4) * r);
      dotAt(g, sx, sy, INK);
    }
  }
  // chips and dust thrown up round it
  for (let i = 0; i < 14; i++) {
    const a = i * 2.39996;
    const sp = 0.4 + 0.6 * hash(i, 2, 7703);
    const r = 0.1 + 0.45 * Math.sqrt(q) * sp;
    const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
    const up = 10 * sp * 4 * q * (1 - q);
    g.globalAlpha = 1 - q;
    dotAt(g, sx, sy - up, DUST[i % 3], i % 4 === 0 ? 2 : 1, 1);
  }
  g.globalAlpha = was;
}

// =============================================================================================
// THE DRAW

/** THE DRAW'S WARNING: a line of the enemy's pink along the floor from (x0, y0) toward (x1, y1) (tiles), `k` of the way through the warning; dashes running along it toward the hero. */
export function drawDrawAim(g: CanvasRenderingContext2D, at: FloorAt, x0: number, y0: number, x1: number, y1: number, k: number, t: number): void {
  if (k <= 0) return;
  const was = g.globalAlpha;
  const d = Math.hypot(x1 - x0, y1 - y0) || 1;
  const n = Math.ceil(d * 10 * clamp01(k * 1.4));
  for (let i = 0; i < n; i++) {
    const q = i / (d * 10);
    if (((i - Math.floor(t * 24)) % 4 + 4) % 4 === 3) continue;
    const [sx, sy] = at(x0 + (x1 - x0) * q, y0 + (y1 - y0) * q);
    g.globalAlpha = 0.3 + 0.6 * clamp01(k);
    dotAt(g, sx, sy, k > 0.7 ? FLAME[2] : FLAME[1], 2, 1);
  }
  // the point it ends at: a small diamond
  const [ex, ey] = at(x0 + (x1 - x0) * clamp01(k * 1.4), y0 + (y1 - y0) * clamp01(k * 1.4));
  g.globalAlpha = 0.5 + 0.5 * clamp01(k);
  dotAt(g, ex - 2, ey, FLAME[3], 5, 1);
  dotAt(g, ex - 1, ey - 1, FLAME[3], 3, 3);
  g.globalAlpha = was;
}

/** How high over his head the word he took hangs (game pixels over his floor point), and how big a cell of its rune is (game pixels). */
export const HELD_WORD_UP = 58;
export const HELD_CELL = 2;
/**
 * THE WORD HE TOOK, HANGING OVER HIS HEAD: the rune of your own word (`word`) at (sx, sy) on the screen (game pixels,
 * its middle), burning the enemy's pink to gold and pulsing, a ring of pink round it, motes of it drifting up; `t`
 * seconds since it came out of his quill (it swells into shape over its first 0.25 s).
 */
export function drawHeldWord(g: CanvasRenderingContext2D, sx: number, sy: number, word: WordId, t: number): void {
  if (t < 0) return;
  const rows = GLYPH[word];
  const H = rows.length;
  const W = rows[0].length;
  const grow = sm(t / 0.25);
  const pulse = 0.5 + 0.5 * Math.sin(t * 6);
  const bob = Math.round(Math.sin(t * 2.2) * 1.5);
  const C = HELD_CELL;
  const was = g.globalAlpha;
  // the ring round it, of the enemy's pink, slowly turning
  const R = (Math.max(W, H) * C) / 2 + 4;
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 + t * 1.4;
    if (i % 3 === 2) continue;
    g.globalAlpha = (0.45 + 0.35 * pulse) * grow;
    dotAt(g, sx + Math.cos(a) * R * grow, sy + bob + Math.sin(a) * R * 0.8 * grow, FLAME[1]);
  }
  // the rune itself, cell by cell: its body the enemy's pink, its core burning to gold
  g.globalAlpha = grow;
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      const ch = rows[r][c];
      if (ch === '.') continue;
      const px = sx + (c - W / 2) * C * grow;
      const py = sy + bob + (r - H / 2) * C * grow;
      dotAt(g, px, py, ch === 'o' ? (pulse > 0.5 ? FLAME[4] : FLAME[3]) : FLAME[2], C, C);
    }
  }
  // its dark seam under it, so it reads over anything
  g.globalAlpha = 0.7 * grow;
  dotAt(g, sx - (W * C) / 2, sy + bob + (H * C) / 2 + 1, INK, W * C, 1);
  // motes of it drifting up
  for (let i = 0; i < 6; i++) {
    const life = (t * 0.8 + i / 6) % 1;
    g.globalAlpha = (1 - life) * 0.8 * grow;
    dotAt(g, sx + (hash(i, Math.floor(t * 0.8 + i / 6), 7711) - 0.5) * W * C, sy + bob - (H * C) / 2 - life * 14, FLAME[i % 2 ? 2 : 3]);
  }
  g.globalAlpha = was;
}

/** How long the freed word takes to fly home (seconds). */
export const WORD_FREED_FOR = 0.6;
/**
 * THE WORD BEATEN OUT OF HIM: its rune breaks apart over his head at (sx0, sy0) and its pieces fly home to the hero at
 * (sx1, sy1) (the screen, game pixels), `t` seconds after, the enemy's pink going out of them and the word's own colour
 * coming back as they come; false once it is home.
 */
export function drawWordFreed(g: CanvasRenderingContext2D, sx0: number, sy0: number, sx1: number, sy1: number, word: WordId, t: number): boolean {
  if (t < 0 || t >= WORD_FREED_FOR) return false;
  const q = t / WORD_FREED_FOR;
  const rows = GLYPH[word];
  const H = rows.length;
  const W = rows[0].length;
  const own = WORD_COLOR[word];
  const was = g.globalAlpha;
  let i = 0;
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      if (rows[r][c] === '.') continue;
      i++;
      // each piece leaves a little after the last, flies in an arc, and comes home
      const k = sm((q - 0.25 * hash(i, 0, 7721)) / 0.75);
      const ox = (c - W / 2) * HELD_CELL * (1 + 1.5 * Math.sin(Math.PI * k));
      const oy = (r - H / 2) * HELD_CELL * (1 + 1.5 * Math.sin(Math.PI * k));
      const px = sx0 + (sx1 - sx0) * k + ox * (1 - k);
      const py = sy0 + (sy1 - sy0) * k + oy * (1 - k) - 18 * Math.sin(Math.PI * k);
      g.globalAlpha = 1 - 0.5 * k;
      dotAt(g, px, py, mixHex(FLAME[2], own, k * 1.3), 2, 2);
    }
  }
  g.globalAlpha = was;
  return true;
}

// =============================================================================================
// TONIC

/** How long a phial flies (seconds) and how high it arcs (game pixels). */
export const PHIAL_FLIGHT = 0.55;
export const PHIAL_ARC = 30;
/** A PHIAL IN FLIGHT from (x0, y0) to (x1, y1) (tiles), `t` seconds after it left his hand: a little bottle of pale green, tumbling end over end in an arc; false once it has landed. */
export function drawPhialFlight(g: CanvasRenderingContext2D, at: FloorAt, x0: number, y0: number, x1: number, y1: number, t: number, seed = 0): boolean {
  if (t < 0 || t >= PHIAL_FLIGHT) return false;
  const u = t / PHIAL_FLIGHT;
  const [sx, sy0] = at(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u);
  const sy = sy0 - 14 * (1 - u) - PHIAL_ARC * 4 * u * (1 - u);
  const a = t * 16 + seed;
  const cx = Math.cos(a);
  const cy = Math.sin(a);
  for (let k = -3; k <= 3; k++) dotAt(g, sx + cx * k, sy + cy * k, k === 3 ? '#1d1511' : k < -1 ? TONIC[3] : TONIC[2], 2, 2);
  dotAt(g, sx - cx * 2, sy - cy * 2, GLASS[2]);
  // its shadow on the floor under it
  const [hx, hy] = at(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u);
  const was = g.globalAlpha;
  g.globalAlpha = 0.35;
  dotAt(g, hx - 2, hy, INK, 5, 1);
  g.globalAlpha = was;
  return true;
}

/** A cloud of the Hush: how far it spreads (tiles), how long it lies before it is gone (seconds), and how long the smash lasts. */
export const HUSH_CLOUD_R = 1.25;
export const HUSH_CLOUD_FOR = 4.0;
export const SMASH_FOR = 0.35;
/**
 * WHERE A PHIAL LANDS at (x, y) (tiles), `t` seconds after: it smashes, the glass and the pale green tonic splashed out;
 * a cloud of the Hush wells up out of the spill, spreads to HUSH_CLOUD_R, lies on the floor roiling, and thins away by
 * HUSH_CLOUD_FOR. Drawn in a fine dither, so the floor and whoever stands in it show through.
 */
export function drawHushCloud(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, t: number, seed = 0): void {
  if (t < 0 || t >= HUSH_CLOUD_FOR) return;
  const was = g.globalAlpha;
  // the smash: glass and tonic thrown out and down
  if (t < SMASH_FOR) {
    const q = t / SMASH_FOR;
    for (let i = 0; i < 16; i++) {
      const a = i * 2.39996 + seed;
      const r = 0.05 + 0.5 * Math.sqrt(q) * (0.5 + hash(i, 1, 7731));
      const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
      g.globalAlpha = 1 - q;
      dotAt(g, sx, sy - 8 * 4 * q * (1 - q) * hash(i, 2, 7731), i % 3 === 0 ? GLASS[1] : TONIC[2 + (i % 2)], i % 4 === 0 ? 2 : 1, 1);
    }
  }
  // the pool of tonic left under the cloud
  const pool = 0.35 * sm(t / 0.2) * (1 - sm((t - (HUSH_CLOUD_FOR - 0.8)) / 0.8));
  if (pool > 0.01) {
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      const r = pool * (0.7 + 0.3 * hash(i, 3, 7732));
      for (let k = 0; k < 4; k++) {
        const [sx, sy] = at(x + Math.cos(a) * r * (k / 4), y + Math.sin(a) * r * (k / 4));
        g.globalAlpha = 0.6;
        dotAt(g, sx, sy, k === 3 ? TONIC[0] : TONIC[1]);
      }
    }
  }
  // the cloud: wells up, spreads, roils, thins away
  const grow = sm((t - 0.1) / 0.5);
  const fade = 1 - sm((t - (HUSH_CLOUD_FOR - 1.2)) / 1.2);
  const R = HUSH_CLOUD_R * (0.3 + 0.7 * grow);
  const dens = 0.55 * grow * fade;
  if (dens > 0.01) {
    const [cx, cy] = at(x, y);
    const spanX = Math.ceil(R * 32 + 6);
    const spanY = Math.ceil(R * 16 + 18);
    for (let py = -spanY; py <= spanY / 2; py++) {
      for (let px = -spanX; px <= spanX; px++) {
        // (a low dome over an ellipse on the floor, its edge ragged, roiling)
        const ex = px / (R * 32);
        const ey = (py + 4) / (R * 16);
        const wob = 0.12 * Math.sin(px * 0.3 + t * 2 + seed) + 0.1 * Math.sin(py * 0.5 - t * 1.6);
        const d = Math.hypot(ex, ey * (py < 0 ? 0.7 : 1)) + wob;
        if (d > 1) continue;
        // (fine dither: thick in its heart, thin at its edge)
        const want = dens * (1 - d * d);
        if (hash(px + Math.floor(cx), py + Math.floor(cy), 7733 + Math.floor(t * 6)) > want * 1.6) continue;
        const tone = d < 0.4 ? 3 : d < 0.7 ? 2 : 1;
        g.globalAlpha = 0.85;
        dotAt(g, cx + px, cy + py, HUSH[tone]);
      }
    }
  }
  g.globalAlpha = was;
}

// =============================================================================================
// ROUNDS

/** How far a ring of the Hush rolls out from a rap of his cane (tiles), and how long it takes (seconds). */
export const ROUNDS_RING_REACH = 3.5;
export const ROUNDS_RING_FOR = 0.9;
/** A RING OF THE HUSH rolling out across the floor from (x, y) (tiles), `t` seconds after his cane rapped there, thinning as it goes. */
export function drawRoundsRing(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, t: number): void {
  if (t < 0 || t >= ROUNDS_RING_FOR) return;
  const q = t / ROUNDS_RING_FOR;
  const R = 0.2 + (ROUNDS_RING_REACH - 0.2) * sm(q * 1.1);
  const was = g.globalAlpha;
  const n = Math.ceil(R * 40);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    if (hash(i, Math.floor(t * 20), 7741) < q * 0.7) continue;
    const [sx, sy] = at(x + Math.cos(a) * R, y + Math.sin(a) * R);
    g.globalAlpha = 0.8 * (1 - q);
    dotAt(g, sx, sy - 1, HUSH[3], 2, 1);
    dotAt(g, sx, sy, HUSH[1], 2, 1);
  }
  g.globalAlpha = was;
}
