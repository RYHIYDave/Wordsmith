// FLOOR 15'S BOSS, THE CENSOR, MADE AGAIN: WHAT HE LAYS ON THE FLOOR (render/act1_fx/censor.ts draws these in place of the old,
// art/censor_shots.ts, while CENSOR2 is on). His fight is as he set it (his ink filling the floor, hurting whoever stands on it); what
// is new is how each of his blows looks, each its own (his word of 14 Nov 2026: “you have the same impact art for a big front paw
// stomp as a minion being raised from the mist.  these are two completely different things.”), and that his ink is SEEN on the dark
// floor of the library, wet and glinting, its edge burning faintly: you must know where not to stand.
//   THE SLASH: a calligrapher's stroke of ink laid across the floor before him from his right to his left, thick where the brush
//     came down, a dry-brush tail of broken streaks at its end, flung drops beyond it; wet, glinting; drying away.
//   REDACTION: through its warning, where each bar will fall is marked in the enemy's pink, and above it the slab coming down, its
//     shadow darkening under it; the slab SLAMS down, ink bursting up off its sides in a sheet of drops; it lies wet, a sheen sliding
//     along it, its edge glinting pink; it dries away.
//   STRIKE-THROUGH: its warning the enemy's pink line (as before); the line itself RUN OUT AS A BURNING HEAD racing along the floor,
//     spitting sparks and ink, a thick wet stroke behind it, thinning to its end; drying away.
//   THE HUSH: a ring of silence rolling out across the room, its front a pale band of the city's letters torn up and blown along,
//     each struck through as it goes; the veil of grey behind it, thinning away.
// The same signatures as art/censor_shots.ts: drawn in the game's own pixels, given where a point of the floor is on the screen.

import { hash } from './kit';
import { FLAME } from './mkit';
import type { Bar } from './censor_shots';
/** Where a spot of the floor (tiles) is in game pixels: mob_shots' FloorAt, the same shape, kept here (tests/new_mobs3.test.ts). */
export type FloorAt = (x: number, y: number) => readonly [number, number];
import { REDACT_FOR, REDACT_WARN, ROOM_HUSH_FOR, ROOM_HUSH_RING, SLASH_MARK_FOR, SLASH_MARK_HALF, SLASH_MARK_REACH, STRIKE_FOR, STRIKE_SPEED } from './censor_shots';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const sm = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
function dot(g: CanvasRenderingContext2D, x: number, y: number, color: string, w = 1, h = 1): void {
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}
/** His ink: black, its wet sheen in two lights; dried, a dull grey-black. */
const INK = ['#030306', '#0d0c14', '#262436', '#4a4866', '#7a78a0'] as const;
const DRY = '#2a2830';
const PALE = ['#3e3852', '#625a7a', '#9890b4', '#c8c2dc', '#ece8f6'] as const;

// =============================================================================================
// THE SLASH

/** WHERE THE SLASH SWEPT, from (x, y) facing (dx, dy), `t` seconds after its blow. */
export function drawSlashMark(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, dx: number, dy: number, t: number): void {
  if (t < 0 || t >= SLASH_MARK_FOR) return;
  const was = g.globalAlpha;
  const face = Math.atan2(dy, dx);
  const half = ((SLASH_MARK_HALF + 8) * Math.PI) / 180;
  const laid = sm(t / 0.08);
  const dry = sm((t - (SLASH_MARK_FOR - 0.5)) / 0.5);
  const N = 90;
  g.globalAlpha = 1;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    if (u > laid) break;
    const a = face - half + 2 * half * u;
    // (thick where the brush came down, at his right; a dry brush at his left)
    const thick = 0.42 * Math.sin(Math.PI * Math.min(1, 0.15 + u * 0.95)) * (1.1 - u * 0.5) + 0.05;
    const R = SLASH_MARK_REACH + 0.25 * Math.sin(u * 3);
    for (let j = -6; j <= 6; j++) {
      const w = (j / 6) * thick;
      if (u > 0.62 && hash(i, j, 8611) < (u - 0.62) * 2.2) continue;
      if (hash(i * 7, j, 8612) < dry) continue;
      const r = R + w;
      const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
      const edge = Math.abs(j) === 6;
      const sheen = j === -3 && i % 9 < 5 && dry < 0.3;
      dot(g, sx, sy, edge && t < 0.35 ? FLAME[2] : sheen ? INK[3] : dry > 0.5 ? DRY : INK[(i + j) & 1]);
    }
  }
  // (drops flung beyond it)
  for (let i = 0; i < 26; i++) {
    const u = hash(i, 1, 8613);
    if (u > laid) continue;
    if (hash(i, 2, 8613) < dry) continue;
    const a = face - half + 2 * half * u;
    const r = SLASH_MARK_REACH + 0.5 + 0.9 * hash(i, 3, 8613);
    const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
    dot(g, sx, sy, INK[0], i % 3 === 0 ? 2 : 1, 1);
  }
  g.globalAlpha = was;
}

// =============================================================================================
// REDACTION

/** REDACTION'S BARS, `t` seconds from its slam (from -REDACT_WARN): marked, the slab coming down, slammed, wet, dried away. */
export function drawRedaction(g: CanvasRenderingContext2D, at: FloorAt, bars: readonly Bar[], t: number): void {
  if (t < -REDACT_WARN || t >= REDACT_FOR) return;
  const was = g.globalAlpha;
  bars.forEach((b, n) => {
    const pt = (u: number, v: number): readonly [number, number] => (b.along === 0 ? at(b.x + u, b.y + v) : at(b.x + v, b.y + u));
    const L = b.long / 2;
    const Wd = b.wide / 2;
    const outline = (lift: number, colour: string, alpha: number, step: number): void => {
      const per = Math.ceil((2 * (b.long + b.wide)) / 0.08);
      for (let i = 0; i < per; i++) {
        const s = (i / per) * 2 * (b.long + b.wide);
        if (step && (Math.floor(s / 0.24 + t * 6 + n) & 1) === 0) continue;
        let u: number;
        let v: number;
        if (s < b.long) [u, v] = [-L + s, -Wd];
        else if (s < b.long + b.wide) [u, v] = [L, -Wd + (s - b.long)];
        else if (s < 2 * b.long + b.wide) [u, v] = [L - (s - b.long - b.wide), Wd];
        else [u, v] = [-L, Wd - (s - 2 * b.long - b.wide)];
        const [sx, sy] = pt(u, v);
        g.globalAlpha = alpha;
        dot(g, sx, sy - lift, colour);
      }
    };
    if (t < 0) {
      // THE WARNING: its place marked in pink, marching; the floor under it darkening, the slab's shadow; THE SLAB ITSELF coming down
      // from above, its edges a dim pink, nearer as the slam comes
      const k = 1 - -t / REDACT_WARN;
      outline(0, k > 0.7 ? FLAME[3] : FLAME[2], 0.55 + 0.45 * k, 1);
      for (let i = 0; i < b.long * 18; i++) {
        for (let j = 0; j < b.wide * 18; j++) {
          if (hash(i, j + n * 97, 8621) > 0.3 * k * k) continue;
          const [sx, sy] = pt(-L + (i + 0.5) / 18, -Wd + (j + 0.5) / 18);
          g.globalAlpha = 0.7;
          dot(g, sx, sy, INK[1]);
        }
      }
      const lift = (1 - k) * 46 + 6;
      outline(lift, k > 0.6 ? FLAME[1] : '#4a1838', 0.35 + 0.5 * k, 0);
    } else {
      // THE SLAB: the last of its fall in an instant; slammed down, black, its top glossed; ink bursting up off its sides
      const fall = clamp01(t / 0.06);
      const lift = (1 - fall) * 8;
      const dry = sm((t - (REDACT_FOR - 0.5)) / 0.5);
      const glint = (u: number): boolean => Math.abs(((u + L) / b.long + t * 0.35 + n * 0.3) % 1 - 0.5) < 0.06;
      for (let i = 0; i < b.long * 18; i++) {
        const u = -L + (i + 0.5) / 18;
        const rag = 0.07 * Math.sin(i * 1.7 + n) + 0.04 * Math.sin(i * 0.5 + n * 3);
        for (let j = -2; j < b.wide * 18 + 2; j++) {
          const v = -Wd + (j + 0.5) / 18;
          if (Math.abs(v) > Wd + rag) continue;
          if (hash(i, j + n * 97, 8622) < dry) continue;
          const [sx, sy] = pt(u, v);
          g.globalAlpha = 1;
          const rim = Math.abs(v) > Wd + rag - 0.07;
          // (the wet sheen: a band of cold light down its length, and a glint sliding along it)
          const band = Math.abs(v + Wd * 0.35) < 0.05;
          const c = dry > 0.5 ? DRY : rim ? (t < 0.25 ? FLAME[3] : hash(i, j, 8623) < 0.25 ? FLAME[1] : INK[0]) : band ? (glint(u) ? INK[4] : INK[3]) : INK[(i + j) & 1];
          dot(g, sx, sy - lift, c);
        }
      }
      // (the burst: a sheet of drops thrown up off its two long sides, arcing out and falling)
      if (t < 0.55 && fall >= 1) {
        const q = t / 0.55;
        for (let i = 0; i < Math.round(b.long * 7); i++) {
          const side = i % 2 ? 1 : -1;
          const u = -L + b.long * hash(i, n, 8624);
          const out = Wd + 0.1 + (0.4 + 0.6 * hash(i, n + 1, 8624)) * sm(q * 1.4);
          const [sx, sy] = pt(u, side * out);
          const up = 14 * hash(i, n + 2, 8624) * Math.sin(Math.PI * Math.min(1, q * 1.3));
          g.globalAlpha = 1 - sm((q - 0.7) / 0.3);
          dot(g, sx, sy - up, up > 6 ? INK[0] : INK[1], i % 3 === 0 ? 2 : 1, 2);
          if (i % 5 === 0 && up > 4) dot(g, sx, sy - up, FLAME[2]);
        }
      }
    }
  });
  g.globalAlpha = was;
}

// =============================================================================================
// STRIKE-THROUGH

/** THE STRIKE-THROUGH, `t` seconds from the thrust: a burning head racing out from (x, y) along (dx, dy) to `reach` tiles at STRIKE_SPEED, spitting sparks and ink, a wet stroke behind it thinning to its end; drying away. */
export function drawStrikeLine(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, dx: number, dy: number, reach: number, t: number): void {
  if (t < 0 || t >= STRIKE_FOR) return;
  const l = Math.hypot(dx, dy) || 1;
  const ux = dx / l;
  const uy = dy / l;
  const head = Math.min(reach, STRIKE_SPEED * t);
  const dry = sm((t - (STRIKE_FOR - 0.5)) / 0.5);
  const was = g.globalAlpha;
  g.globalAlpha = 1;
  const n = Math.ceil(head / 0.04);
  for (let i = 0; i < n; i++) {
    const s = (i / n) * head;
    if (hash(i, 1, 8631) < dry) continue;
    // (thick near him, thinning to its end, as a brush's stroke runs dry)
    const w = 0.16 * (1 - (s / Math.max(reach, 1)) * 0.6);
    for (const o of [-w, -w / 2, 0, w / 2, w]) {
      const [sx, sy] = at(x + ux * s - uy * o, y + uy * s + ux * o);
      const edge = Math.abs(o) === w;
      dot(g, sx, sy - 1, dry > 0.5 ? DRY : edge && t < 0.6 ? (hash(i, 2, 8632) < 0.4 ? FLAME[2] : INK[0]) : o === -w / 2 && i % 11 < 6 ? INK[3] : INK[0]);
    }
  }
  // (its head: burning, spitting sparks and drops as it races)
  if (head < reach && t < reach / STRIKE_SPEED + 0.02) {
    const [hx, hy] = at(x + ux * head, y + uy * head);
    dot(g, hx - 2, hy - 3, FLAME[3], 4, 3);
    dot(g, hx - 1, hy - 3, FLAME[4], 2, 2);
    for (let i = 0; i < 12; i++) {
      const back = 0.1 + 0.8 * hash(i, Math.floor(t * 40), 8633);
      const o = (hash(i, Math.floor(t * 40) + 1, 8633) - 0.5) * 0.7;
      const [sx, sy] = at(x + ux * (head - back) - uy * o, y + uy * (head - back) + ux * o);
      const up = 6 * hash(i, 3, 8633) * (1 - back);
      dot(g, sx, sy - 2 - up, i % 3 === 0 ? INK[0] : i % 3 === 1 ? FLAME[3] : FLAME[2]);
    }
  }
  g.globalAlpha = was;
}

// =============================================================================================
// THE HUSH

/** THE HUSH, `t` seconds after he lets it go from (x, y): a ring of silence rolling out to `reach` tiles, its front a band of the city's letters torn up and struck through; the veil behind it, thinning away. */
export function drawRoomHush(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, reach: number, t: number): void {
  if (t < 0 || t >= ROOM_HUSH_FOR) return;
  const was = g.globalAlpha;
  const R = 0.3 + (reach - 0.3) * sm(t / ROOM_HUSH_RING);
  const fade = 1 - sm((t - (ROOM_HUSH_FOR - 1)) / 1);
  if (t < ROOM_HUSH_RING + 0.35) {
    const out = sm((t - ROOM_HUSH_RING) / 0.35);
    // (its front: a pale band)
    const n = Math.ceil(R * 50);
    for (let k = 0; k < 2; k++) {
      const r = R - k * 0.1;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        if (hash(i, k + Math.floor(t * 24) * 3, 8641) < 0.2 + 0.7 * out) continue;
        const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
        g.globalAlpha = 0.9 - 0.3 * k;
        dot(g, sx, sy - 1, PALE[4 - k], 2, 1);
      }
    }
    // (the letters torn up and blown along on it, each struck through)
    const m = Math.ceil(R * 7);
    for (let i = 0; i < m; i++) {
      const a = (i / m) * Math.PI * 2 + hash(i, 1, 8642) * 0.3;
      const r = R - 0.15 - 0.45 * hash(i, 2, 8642);
      if (hash(i, 3, 8642) < out) continue;
      const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
      const lift = 3 + 6 * hash(i, 4, 8642);
      g.globalAlpha = 0.95;
      for (let c = 0; c < 3; c++) for (let rr = 0; rr < 4; rr++) if (hash(i * 5 + c, rr, 8643) > 0.45) dot(g, sx + c - 1, sy - lift - rr, PALE[3]);
      dot(g, sx - 2, sy - lift - 2, INK[0], 5, 1);
    }
  }
  // (the veil behind it: a sparse grey drifting over the floor)
  const cells = Math.ceil(R * 10);
  for (let i = -cells; i <= cells; i++) {
    for (let j = -cells; j <= cells; j++) {
      const u = i / 10;
      const v = j / 10;
      if (u * u + v * v > R * R) continue;
      if (hash(i, j, 8644) > 0.18 * fade) continue;
      const drift = Math.sin(t * 1.3 + i * 0.7) * 0.05;
      const [sx, sy] = at(x + u + drift, y + v);
      g.globalAlpha = 0.55 * fade;
      dot(g, sx, sy, PALE[hash(i, j, 8645) < 0.5 ? 0 : 1], 2, 1);
    }
  }
  g.globalAlpha = was;
}
