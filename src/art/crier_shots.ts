// WHAT THE CRIER DOES TO THE FLOOR (the art chat, 18 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of
// the game draws these yet: the rules (what each does to the hero, how far, how long) are the main chat's,
// and these are the pictures for them. As art/boss_shots.ts: drawn in the game's own pixels, as the
// floor's effects are, given where a point of the floor is on the screen (`at`, from tiles).
//
// THE CRIER (art/crier.ts, art/crier_moves.ts), floor 11's boss. The planning chat's moves, with his yes
// as ideas (act2 doc): "a swing of the trumpet; the Silent Shout (a cone of silence darkening the hero's
// words inside it); the Proclamation (a giant blank scroll down a street lane); the Crowd (a soundless
// call bringing the Hushed from the alleys)". His brief, 18 Oct: "Heavy and pompous, then sudden
// (Recommended)"; "The Hush pours out of him".
//   His swing: where the trumpet's bell slams down, the flags crack in a ring and dust flies (`drawBellSlam`).
//   The Silent Shout: as he draws breath, the cone it will fill is marked on the floor, and the dust and
//     scraps of paper in it are drawn in toward him (`drawShoutWarn`); as he blows, the dead air rolls out
//     across the cone in waves, the floor under it gone dark and grey (`drawShoutBlast`).
//   The Proclamation: as he holds the scroll high, the lane it will run down is marked on the floor
//     (`drawProclaimWarn`); flung down, it lands and unrolls down the lane, a great sheet of blank paper,
//     its seal burning at the near end, sweeping what is before it; it lies a while, then crumbles into
//     the Hush (`drawProclamation`).
//   The Crowd: as he draws breath, a ring closes in round him (`drawCrowdBreath`); as he blows, rings of
//     the Hush roll out across the floor and away (`drawCrowdCall`), and where the Hushed come out of the
//     alleys a pool of it wells up first (`drawHushedRising`: the game's own spots).
// Their colours are the enemy's pink and gold, and the Hush's grey (never a friend's cyan).

import { CR_CROWD, CR_SHOUT, HUSH } from './crier';
import { hash } from './kit';
import { FLAME } from './mkit';
import type { FloorAt } from './mob_shots';
import { P } from './palette';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (u: number): number => 1 - (1 - clamp01(u)) ** 2;

/** A pixel, rounded, in a colour. */
function dotAt(g: CanvasRenderingContext2D, x: number, y: number, color: string, w = 1, h = 1): void {
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}
/** A point of the floor `d` tiles out along (fx, fy) from (x0, y0) and `s` tiles to the side (to the right of the way, as the floor runs). */
function out(x0: number, y0: number, fx: number, fy: number, d: number, s: number): [number, number] {
  return [x0 + fx * d - fy * s, y0 + fy * d + fx * s];
}
/** Paper, as the scroll is: blank, a little yellowed; its edges and folds darker. */
const PAPER = ['#3e382e', '#7a6e5c', '#ab9f84', '#c4b898', '#d6cbad'];
/** The city's oxblood, the seal's wax. */
const WAX = ['#2a0a10', '#5a1420', '#8a2232'];

// ---------------------------------------------------------------------------------------------
// HIS SWING

/** How long the ring his bell cracks in the floor shows (seconds). */
export const SLAM_FOR = 1.2;
/**
 * WHERE HIS BELL SLAMS DOWN, `t` seconds after: a ring of the flags cracked round it, dark in the
 * middle with a lit lip; short cracks running out of it; a ring of dust thrown out low, and gone.
 */
export function drawBellSlam(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, t: number): void {
  if (t < 0 || t >= SLAM_FOR) return;
  const was = g.globalAlpha;
  const fade = t < SLAM_FOR * 0.6 ? 1 : 1 - (t - SLAM_FOR * 0.6) / (SLAM_FOR * 0.4);
  const R = 0.32;
  // the dent: a dark ring, its near lip catching the light
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const [sx, sy] = at(x + Math.cos(a) * R, y + Math.sin(a) * R);
    g.globalAlpha = was * fade;
    dotAt(g, sx, sy, P.ink, 2, 1);
    if (Math.sin(a + Math.PI / 4) > 0.3) dotAt(g, sx, sy + 1, HUSH[3]);
  }
  // the cracks running out of it
  for (let i = 0; i < 7; i++) {
    const a = hash(i, 1, 131) * Math.PI * 2;
    const long = R + 0.25 + 0.35 * hash(i, 2, 131);
    for (let k = 0; k < 12; k++) {
      const d = R + ((long - R) * k) / 12;
      const wob = (hash(i, k, 133) - 0.5) * 0.08;
      const [sx, sy] = at(x + Math.cos(a + wob) * d, y + Math.sin(a + wob) * d);
      g.globalAlpha = was * fade * (1 - k / 14);
      dotAt(g, sx, sy, P.ink);
    }
  }
  // dust, thrown out low and settling
  if (t < 0.7) {
    const r = R + 1.3 * easeOut(t / 0.7);
    for (let i = 0; i < 46; i++) {
      if (hash(i, 3, 137) < t / 0.7) continue;
      const a = (i / 46) * Math.PI * 2;
      const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
      g.globalAlpha = was * (1 - t / 0.7);
      dotAt(g, sx, sy - 2 - (1 - t / 0.7) * 3, i % 3 ? HUSH[3] : HUSH[4], 2, 1);
    }
  }
  g.globalAlpha = was;
}

// ---------------------------------------------------------------------------------------------
// THE SILENT SHOUT

/** The cone the Shout fills: from this far before him (tiles) to this far, and half as wide as this (degrees). */
export const SHOUT_FROM = 0.7;
export const SHOUT_TO = 5.4;
export const SHOUT_HALF = 26;
/** How long the dead air rolls across it from the blow (seconds), and how long the floor under it stays dark after. */
export const SHOUT_FOR = CR_SHOUT.end - CR_SHOUT.hit + 0.6;

/** Every pixel of the cone's floor, with how far out it is (0 to 1) and how far across (-1 to 1). */
function coneEach(at: FloorAt, x0: number, y0: number, fx: number, fy: number, step: number, each: (sx: number, sy: number, d: number, s: number) => void): void {
  const half = (SHOUT_HALF * Math.PI) / 180;
  for (let d = SHOUT_FROM; d <= SHOUT_TO; d += step) {
    const w = Math.tan(half) * d;
    const n = Math.max(1, Math.round((2 * w) / step));
    for (let i = 0; i <= n; i++) {
      const s = -w + (2 * w * i) / n;
      const [x, y] = out(x0, y0, fx, fy, d, s);
      const [sx, sy] = at(x, y);
      each(sx, sy, (d - SHOUT_FROM) / (SHOUT_TO - SHOUT_FROM), w > 0 ? s / w : 0);
    }
  }
}

/**
 * THE SHOUT'S WARNING, while he draws breath (`k`: how far through it): the cone it will fill marked
 * on the floor, its edges in the enemy's pink, dashes crawling in toward him; and the dust and scraps
 * of paper lying in it drawn in toward the trumpet, faster as the breath goes on.
 */
export function drawShoutWarn(g: CanvasRenderingContext2D, at: FloorAt, x0: number, y0: number, fx: number, fy: number, k: number, t: number): void {
  if (k <= 0) return;
  const was = g.globalAlpha;
  const half = (SHOUT_HALF * Math.PI) / 180;
  const run = (t * 2.2) % 1;
  const lit = 0.3 + 0.6 * k;
  // the edges: two sides and the far arc, dashed, the dashes running in
  const edge = (pts: [number, number][]): void => {
    for (let i = 0; i < pts.length; i++) {
      const f = i / pts.length;
      const dash = (((f * 9 + run) % 1) + 1) % 1 < 0.6;
      if (!dash) continue;
      const [sx, sy] = at(pts[i][0], pts[i][1]);
      g.globalAlpha = was * lit;
      dotAt(g, sx, sy, k > 0.7 ? FLAME[3] : FLAME[2]);
      dotAt(g, sx, sy + 1, FLAME[0]);
    }
  };
  for (const side of [-1, 1]) {
    const pts: [number, number][] = [];
    for (let d = SHOUT_TO; d >= SHOUT_FROM; d -= 0.04) pts.push(out(x0, y0, fx, fy, d, side * Math.tan(half) * d));
    edge(pts);
  }
  const arc: [number, number][] = [];
  for (let a = -half; a <= half; a += 0.012) arc.push([x0 + (fx * Math.cos(a) - fy * Math.sin(a)) * SHOUT_TO, y0 + (fy * Math.cos(a) + fx * Math.sin(a)) * SHOUT_TO]);
  edge(arc);
  // a thin stipple of the pink over the cone's floor, pulsing
  const pulse = 0.5 + 0.5 * Math.sin(t * 10);
  coneEach(at, x0, y0, fx, fy, 0.12, (sx, sy, d, s) => {
    if (hash(Math.round(sx), Math.round(sy), 139) > 0.22) return;
    g.globalAlpha = was * (0.12 + 0.22 * k * pulse) * (1 - 0.4 * d) * (1 - 0.3 * Math.abs(s));
    dotAt(g, sx, sy, FLAME[1]);
  });
  // dust and scraps of paper drawn in toward him
  for (let i = 0; i < 26; i++) {
    const s = (hash(i, 1, 141) * 2 - 1) * 0.9;
    const d0 = SHOUT_FROM + (SHOUT_TO - SHOUT_FROM) * (0.3 + 0.7 * hash(i, 2, 141));
    const speed = 0.6 + 2.6 * k;
    const life = (t * speed * 0.4 + hash(i, 3, 141)) % 1;
    const d = d0 - (d0 - SHOUT_FROM * 0.6) * life * life;
    const [x, y] = out(x0, y0, fx, fy, d, s * Math.tan(half) * d);
    const [sx, sy] = at(x, y);
    g.globalAlpha = was * Math.min(1, k * 2) * (1 - life * 0.6);
    const paper = i % 4 === 0;
    dotAt(g, sx, sy - 1 - life * 3, paper ? PAPER[3] : i % 2 ? HUSH[3] : HUSH[4], paper ? 2 : 1, 1);
  }
  g.globalAlpha = was;
}

/**
 * THE SHOUT, `t` seconds after it bursts out of the bell: the floor under the cone gone dark and grey
 * (the Hush lying on it), deepest near him; the dead air rolling out across it in waves, a fresh wave
 * each sixth of a second, pale and violet, shot through with the pink; dust and paper blown out ahead
 * of them; when he stops, the last wave runs out and the dark lifts.
 */
export function drawShoutBlast(g: CanvasRenderingContext2D, at: FloorAt, x0: number, y0: number, fx: number, fy: number, t: number): void {
  if (t < 0 || t >= SHOUT_FOR) return;
  const was = g.globalAlpha;
  const blowing = CR_SHOUT.end - CR_SHOUT.hit;
  const reach = clamp01(t / 0.18);
  const fade = t < blowing ? 1 : 1 - (t - blowing) / (SHOUT_FOR - blowing);
  const half = (SHOUT_HALF * Math.PI) / 180;
  // THE DARK: the Hush lying on the floor under it (the hero's words go dark in it)
  coneEach(at, x0, y0, fx, fy, 0.07, (sx, sy, d, s) => {
    if (d > reach) return;
    const h = hash(Math.round(sx), Math.round(sy), 143);
    const thick = (0.62 - 0.25 * d) * (1 - 0.35 * Math.abs(s) ** 3);
    if (h > thick) return;
    g.globalAlpha = was * fade * (0.55 + 0.25 * Math.sin(t * 7 + d * 6));
    dotAt(g, sx, sy, h < thick * 0.4 ? HUSH[0] : HUSH[1], 2, 1);
  });
  // ITS EDGE: the two sides and the far arc, a line of the Hush's pale with the pink in it
  for (const side of [-1, 1]) {
    for (let d = SHOUT_FROM; d <= SHOUT_FROM + (SHOUT_TO - SHOUT_FROM) * reach; d += 0.05) {
      const [sx, sy] = at(...out(x0, y0, fx, fy, d, side * Math.tan(half) * d));
      g.globalAlpha = was * fade * 0.8;
      dotAt(g, sx, sy, hash(Math.round(sx), Math.round(sy), 145) < 0.25 ? FLAME[2] : HUSH[3]);
    }
  }
  // THE WAVES of dead air rolling out across it
  const EVERY = 1 / 6;
  const SPEED = 9;
  for (let j = 0; j * EVERY <= Math.min(t, blowing); j++) {
    const age = t - j * EVERY;
    const d = SHOUT_FROM + age * SPEED;
    if (d > SHOUT_TO) continue;
    const f = (d - SHOUT_FROM) / (SHOUT_TO - SHOUT_FROM);
    const n = Math.max(12, Math.round(d * 30));
    for (let i = 0; i <= n; i++) {
      const a = -half + (2 * half * i) / n;
      if (hash(i, j, 147) < f * 0.45) continue;
      for (const [back, c] of [[0, HUSH[4]], [0.08, HUSH[3]], [0.17, HUSH[2]]] as const) {
        const r = d - back;
        if (r < SHOUT_FROM) continue;
        const [sx, sy] = at(x0 + (fx * Math.cos(a) - fy * Math.sin(a)) * r, y0 + (fy * Math.cos(a) + fx * Math.sin(a)) * r);
        g.globalAlpha = was * fade * (1 - f * 0.55);
        const pink = back === 0 && hash(i, j + 7, 149) < 0.12;
        dotAt(g, sx, sy - 1, pink ? FLAME[2] : c, back === 0 ? 2 : 1, 1);
      }
    }
  }
  // dust and scraps of paper blown out ahead of it, tumbling
  for (let i = 0; i < 30; i++) {
    const s = (hash(i, 1, 151) * 2 - 1) * 0.85;
    const t0 = hash(i, 2, 151) * 0.4;
    const age = t - t0;
    if (age < 0 || age > 0.9) continue;
    const d = SHOUT_FROM + 0.3 + age * (6 + 3 * hash(i, 3, 151));
    if (d > SHOUT_TO + 0.8) continue;
    const z = 4 + 10 * Math.sin(Math.min(1, age / 0.9) * Math.PI) * hash(i, 4, 151);
    const [sx, sy] = at(...out(x0, y0, fx, fy, d, s * Math.tan(half) * d));
    g.globalAlpha = was * (1 - age / 0.9);
    const paper = i % 3 === 0;
    dotAt(g, sx, sy - z, paper ? PAPER[Math.floor(age * 10) % 2 ? 3 : 2] : HUSH[3], paper ? 2 : 1, paper && Math.floor(age * 12) % 2 ? 2 : 1);
  }
  g.globalAlpha = was;
}

// ---------------------------------------------------------------------------------------------
// THE PROCLAMATION

/** The lane the scroll runs down: from this far before him (tiles) to this far, and this wide each side of its middle. */
export const PROCLAIM_FROM = 1.3;
export const PROCLAIM_TO = 8.6;
export const PROCLAIM_HALF = 0.62;
/** From the moment he flings it (seconds): it lands; it has unrolled; it begins to crumble; it is gone. */
export const PROCLAIM_LANDS = 0.14;
export const PROCLAIM_UNROLLED = PROCLAIM_LANDS + 0.42;
export const PROCLAIM_CRUMBLES = 1.9;
export const PROCLAIM_FOR = 2.7;

/**
 * THE PROCLAMATION'S WARNING, while he holds the scroll high (`k`: how far through the hold): the lane
 * it will run down marked on the floor, its two edges dashed in the enemy's pink, the dashes running out
 * along it, and a bar across its far end.
 */
export function drawProclaimWarn(g: CanvasRenderingContext2D, at: FloorAt, x0: number, y0: number, fx: number, fy: number, k: number, t: number): void {
  if (k <= 0) return;
  const was = g.globalAlpha;
  const run = (t * 2.4) % 1;
  const long = (PROCLAIM_TO - PROCLAIM_FROM) * clamp01(k * 1.8);
  for (const side of [-1, 1]) {
    for (let d = 0; d <= long; d += 0.04) {
      const f = d / (PROCLAIM_TO - PROCLAIM_FROM);
      if ((((f * 12 - run) % 1) + 1) % 1 > 0.6) continue;
      const [sx, sy] = at(...out(x0, y0, fx, fy, PROCLAIM_FROM + d, side * PROCLAIM_HALF));
      g.globalAlpha = was * (0.35 + 0.55 * k) * (1 - 0.3 * f);
      dotAt(g, sx, sy, k > 0.7 ? FLAME[3] : FLAME[2]);
      dotAt(g, sx, sy + 1, FLAME[0]);
    }
  }
  if (k * 1.8 >= 1) {
    for (let s = -PROCLAIM_HALF; s <= PROCLAIM_HALF; s += 0.04) {
      const [sx, sy] = at(...out(x0, y0, fx, fy, PROCLAIM_TO, s));
      g.globalAlpha = was * (0.35 + 0.55 * k);
      dotAt(g, sx, sy, FLAME[2]);
    }
  }
  // (the seal's light, faint, where it will land)
  const [cx, cy] = at(...out(x0, y0, fx, fy, PROCLAIM_FROM + 0.2, 0));
  g.globalAlpha = was * k * (0.4 + 0.3 * Math.sin(t * 12));
  dotAt(g, cx - 2, cy - 1, FLAME[2], 4, 2);
  g.globalAlpha = was;
}

/**
 * THE PROCLAMATION, `t` seconds after he flings the scroll (from where his hand lets go, `from`: tiles
 * before him and its height, the game's pixels): it flies to the near end of the lane and lands; it
 * unrolls down the lane in under half a second, the roll racing out ahead with dust thrown before it, a
 * great sheet of blank paper behind it, its seal of oxblood cracked open and burning at the near end; it
 * lies a while, the pink creeping along its edges; then from its far end it crumbles into the Hush,
 * grey specks rising off it, and is gone.
 */
export function drawProclamation(g: CanvasRenderingContext2D, at: FloorAt, x0: number, y0: number, fx: number, fy: number, t: number, from: readonly [number, number] = [0.6, 40]): void {
  if (t < 0 || t >= PROCLAIM_FOR) return;
  const was = g.globalAlpha;
  const LONG = PROCLAIM_TO - PROCLAIM_FROM;
  // IN FLIGHT: the rolled scroll, end over end, from his hand down to the lane's near end
  if (t < PROCLAIM_LANDS) {
    const u = t / PROCLAIM_LANDS;
    const d = from[0] + (PROCLAIM_FROM - from[0]) * u;
    const z = from[1] * (1 - u) + 16 * u * (1 - u);
    const [sx, sy] = at(...out(x0, y0, fx, fy, d, 0));
    rollAt(g, at, x0, y0, fx, fy, d, 5, z, t * 30);
    g.globalAlpha = was * 0.5;
    dotAt(g, sx - 4, sy, P.ink, 9, 2);
    g.globalAlpha = was;
    return;
  }
  const u = clamp01((t - PROCLAIM_LANDS) / (PROCLAIM_UNROLLED - PROCLAIM_LANDS));
  const front = LONG * (1 - (1 - u) ** 2.2);
  // (crumbling, from the far end back: how far of it is left)
  const crumble = t < PROCLAIM_CRUMBLES ? 0 : (t - PROCLAIM_CRUMBLES) / (PROCLAIM_FOR - PROCLAIM_CRUMBLES);
  const left = front * (1 - crumble);
  // its shadow along its edges, and the sheet: blank paper, yellowed, lighter in its middle
  const step = 0.035;
  for (let d = 0; d <= left; d += step) {
    for (let s = -PROCLAIM_HALF; s <= PROCLAIM_HALF; s += step) {
      const [sx, sy] = at(...out(x0, y0, fx, fy, PROCLAIM_FROM + d, s));
      const edge = PROCLAIM_HALF - Math.abs(s);
      const h = hash(Math.round(sx), Math.round(sy), 153);
      // (the near end of the crumbling torn ragged)
      if (crumble > 0 && d > left - 0.5 && h < (d - (left - 0.5)) / 0.5) continue;
      const c = edge < 0.05 ? PAPER[1] : edge < 0.12 ? PAPER[2] : h < 0.08 ? PAPER[2] : h < 0.7 ? PAPER[3] : PAPER[4];
      g.globalAlpha = was;
      dotAt(g, sx, sy, c, 2, 1);
    }
  }
  // its edges: a dark line under each, and in the pink, creeping along it while it lies
  for (const side of [-1, 1]) {
    for (let d = 0; d <= left; d += 0.03) {
      const [sx, sy] = at(...out(x0, y0, fx, fy, PROCLAIM_FROM + d, side * (PROCLAIM_HALF + 0.02)));
      g.globalAlpha = was * 0.8;
      dotAt(g, sx, sy + 1, P.ink, 2, 1);
      if (u >= 1 && (((d * 3 - t * 2.2) % 1) + 1) % 1 < 0.12) {
        g.globalAlpha = was * (1 - crumble);
        dotAt(g, sx, sy, FLAME[2], 2, 1);
      }
    }
  }
  // THE ROLL, racing out ahead (thinner as it gives out its paper), dust thrown up before it
  if (u < 1) {
    rollAt(g, at, x0, y0, fx, fy, PROCLAIM_FROM + front, 5 - 2.6 * u, 0, u * 40);
    for (let i = 0; i < 20; i++) {
      const s = (hash(i, 1, 155) * 2 - 1) * PROCLAIM_HALF * 1.3;
      const lead = 0.15 + 0.5 * hash(i, 2, 155);
      const [sx, sy] = at(...out(x0, y0, fx, fy, PROCLAIM_FROM + front + lead, s));
      g.globalAlpha = was * (1 - u) * 0.9;
      dotAt(g, sx, sy - 3 - 6 * hash(i, 3, 155) - ((t * 40 + i * 3) % 5), i % 3 ? HUSH[3] : HUSH[4], 2, 1);
    }
  } else if (crumble === 0) {
    // (unrolled to the end: the last of it curled up there)
    rollAt(g, at, x0, y0, fx, fy, PROCLAIM_TO, 2.4, 0, 0);
  }
  // THE SEAL at the near end: the city's oxblood wax, cracked open, burning the cult's pink and gold
  if (crumble < 0.98) {
    const [cx, cy] = at(...out(x0, y0, fx, fy, PROCLAIM_FROM + 0.26, 0));
    g.globalAlpha = was;
    // (a round of wax, bigger than a hand, with a ribbon's two tails)
    dotAt(g, cx - 6, cy + 1, WAX[1], 3, 5);
    dotAt(g, cx + 4, cy + 1, WAX[1], 3, 4);
    dotAt(g, cx - 5, cy - 3, WAX[1], 11, 6);
    dotAt(g, cx - 4, cy - 4, WAX[2], 9, 1);
    dotAt(g, cx - 6, cy - 2, WAX[1], 13, 4);
    dotAt(g, cx - 5, cy + 3, WAX[0], 11, 1);
    const burn = 0.6 + 0.4 * Math.sin(t * 13);
    g.globalAlpha = was * burn * (1 - crumble);
    // (cracked across, the cult's fire showing through the crack)
    dotAt(g, cx - 4, cy - 1, FLAME[2], 9, 1);
    dotAt(g, cx - 1, cy - 2, FLAME[4], 3, 2);
    dotAt(g, cx - 3, cy, FLAME[3], 2, 1);
    dotAt(g, cx + 2, cy - 2, FLAME[3], 2, 1);
    // (sparks off it)
    for (let i = 0; i < 4; i++) {
      const life = (t * 1.6 + i * 0.25) % 1;
      g.globalAlpha = was * (1 - life) * (1 - crumble);
      dotAt(g, cx + Math.sin(i * 2.1 + t * 4) * 3, cy - 3 - life * 12, life < 0.5 ? FLAME[3] : FLAME[2]);
    }
  }
  // CRUMBLING INTO THE HUSH: grey specks rising off its ragged end
  if (crumble > 0) {
    for (let i = 0; i < 36; i++) {
      const life = (t * 1.4 + hash(i, 1, 157)) % 1;
      const d = left + 0.6 * hash(i, 2, 157) - 0.2;
      if (d < 0) continue;
      const s = (hash(i, 3, 157) * 2 - 1) * PROCLAIM_HALF;
      const [sx, sy] = at(...out(x0, y0, fx, fy, PROCLAIM_FROM + d, s));
      g.globalAlpha = was * (1 - life);
      dotAt(g, sx + Math.sin(i + t * 3) * 2, sy - 2 - life * 18, life < 0.3 ? PAPER[2] : life < 0.6 ? HUSH[4] : HUSH[3], 2, 1);
    }
  }
  g.globalAlpha = was;
}
/** The rolled scroll lying across the lane at `d` tiles out (its radius `r`, the game's pixels; lifted `z`; rolled round `spin`). */
function rollAt(g: CanvasRenderingContext2D, at: FloorAt, x0: number, y0: number, fx: number, fy: number, d: number, r: number, z: number, spin: number): void {
  const was = g.globalAlpha;
  const half = PROCLAIM_HALF + 0.04;
  for (let s = -half; s <= half; s += 0.025) {
    const [sx, sy] = at(...out(x0, y0, fx, fy, d, s));
    const top = sy - z - r * 2;
    for (let j = 0; j < Math.max(2, Math.round(r * 2)); j++) {
      const f = j / Math.max(2, Math.round(r * 2));
      // (lit on top, shadowed under; a turn of its edge showing each so often, rolling)
      const turn = (((s * 6 + spin) % 1) + 1) % 1 < 0.08;
      const c = f < 0.25 ? PAPER[4] : f < 0.6 ? (turn ? PAPER[1] : PAPER[3]) : f < 0.85 ? PAPER[2] : PAPER[1];
      g.globalAlpha = was;
      dotAt(g, sx, top + j, c, 2, 1);
    }
  }
  // its two ends, rolled
  for (const side of [-1, 1]) {
    const [sx, sy] = at(...out(x0, y0, fx, fy, d, side * half));
    g.globalAlpha = was;
    dotAt(g, sx - 1, sy - z - r * 2, PAPER[1], 3, Math.max(2, Math.round(r * 2)));
    dotAt(g, sx, sy - z - r, PAPER[0], 1, 1);
  }
  g.globalAlpha = was;
}

// ---------------------------------------------------------------------------------------------
// THE CROWD

/** How far its rings roll out across the floor (tiles), and for how long from the call (seconds). */
export const CROWD_REACH = 10;
export const CROWD_FOR = CR_CROWD.end - CR_CROWD.hit + 1.0;
/** How long a pool of the Hush wells up where one of the Hushed comes out, before it is out and the pool sinks (seconds). */
export const RISING_FOR = 1.5;
export const RISING_OUT = 0.9;

/**
 * THE CROWD'S WARNING, while he draws breath (`k`): a ring on the floor round him, closing in from far
 * out toward him, in the enemy's pink; dashes running round it.
 */
export function drawCrowdBreath(g: CanvasRenderingContext2D, at: FloorAt, x0: number, y0: number, k: number, t: number): void {
  if (k <= 0) return;
  const was = g.globalAlpha;
  for (const [j, lag] of [[0, 0], [1, 0.35]] as const) {
    const kk = clamp01((k - lag) / (1 - lag));
    if (kk <= 0) continue;
    const r = 5.5 - 4.2 * easeOut(kk);
    const n = Math.round(r * 46);
    const run = (t * (j ? -0.4 : 0.5)) % 1;
    for (let i = 0; i < n; i++) {
      const f = i / n;
      if ((((f * 18 + run) % 1) + 1) % 1 > 0.55) continue;
      const a = f * Math.PI * 2;
      const [sx, sy] = at(x0 + Math.cos(a) * r, y0 + Math.sin(a) * r);
      g.globalAlpha = was * (0.25 + 0.6 * kk);
      dotAt(g, sx, sy, kk > 0.7 ? FLAME[3] : FLAME[2]);
      dotAt(g, sx, sy + 1, FLAME[0]);
    }
  }
  g.globalAlpha = was;
}

/**
 * THE CROWD'S CALL, `t` seconds after he blows: rings of the Hush rolling out across the floor from
 * him, one after another while he blows, out past the edge of what is seen, thinning as they go.
 */
export function drawCrowdCall(g: CanvasRenderingContext2D, at: FloorAt, x0: number, y0: number, t: number): void {
  if (t < 0 || t >= CROWD_FOR) return;
  const was = g.globalAlpha;
  const blowing = CR_CROWD.end - CR_CROWD.hit;
  const SPEED = 7.5;
  for (let j = 0; j * 0.27 <= Math.min(t, blowing); j++) {
    const age = t - j * 0.27;
    const r = 0.9 + age * SPEED;
    if (r > CROWD_REACH) continue;
    const f = r / CROWD_REACH;
    const n = Math.round(r * 60);
    for (let i = 0; i < n; i++) {
      if (hash(i, j, 159) < f * 0.7) continue;
      const a = (i / n) * Math.PI * 2;
      for (const [back, c] of [[0, HUSH[4]], [0.12, HUSH[3]], [0.26, HUSH[2]]] as const) {
        const rr = r - back;
        if (rr < 0.6) continue;
        const [sx, sy] = at(x0 + Math.cos(a) * rr, y0 + Math.sin(a) * rr);
        g.globalAlpha = was * (1 - f) * 0.9;
        dotAt(g, sx, sy - 1, back === 0 && hash(i, j + 3, 161) < 0.1 ? FLAME[2] : c, back === 0 ? 2 : 1, 1);
      }
    }
  }
  g.globalAlpha = was;
}

/**
 * WHERE ONE OF THE HUSHED COMES OUT, `t` seconds after the call reaches it: a pool of the Hush wells
 * up on the floor, dark, spreading, grey specks rising off it and two pinpoints of pink in it; by
 * `RISING_OUT` the one it brings is out (the game's own figure), and the pool sinks away.
 */
export function drawHushedRising(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, t: number): void {
  if (t < 0 || t >= RISING_FOR) return;
  const was = g.globalAlpha;
  const grow = easeOut(t / 0.5);
  const sink = t < RISING_OUT ? 1 : 1 - (t - RISING_OUT) / (RISING_FOR - RISING_OUT);
  const R = 0.8 * grow;
  for (let i = 0; i < 140; i++) {
    const a = hash(i, 1, 163) * Math.PI * 2;
    const r = R * Math.sqrt(hash(i, 2, 163));
    const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
    g.globalAlpha = was * sink * 0.85;
    dotAt(g, sx, sy, r < R * 0.5 ? HUSH[0] : HUSH[1], 2, 1);
  }
  // (its rim, a little lighter, rippling)
  const n = Math.max(8, Math.round(R * 70));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = R * (1 + 0.06 * Math.sin(a * 5 + t * 9));
    const [sx, sy] = at(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    g.globalAlpha = was * sink;
    dotAt(g, sx, sy, i % 5 === 0 ? FLAME[1] : HUSH[3]);
    dotAt(g, sx, sy + 1, HUSH[2]);
  }
  // two pinpoints of the enemy's pink in it, before the one it brings is out
  if (t > 0.25 && t < RISING_OUT) {
    const [sx, sy] = at(x, y);
    g.globalAlpha = was * Math.min(1, (t - 0.25) / 0.2);
    dotAt(g, sx - 3, sy - 2, FLAME[3], 2, 1);
    dotAt(g, sx + 2, sy - 2, FLAME[3], 2, 1);
    dotAt(g, sx - 3, sy - 1, FLAME[1], 2, 1);
    dotAt(g, sx + 2, sy - 1, FLAME[1], 2, 1);
  }
  // grey specks rising off it
  for (let i = 0; i < 30; i++) {
    const life = (t * 1.8 + hash(i, 3, 165)) % 1;
    const a = hash(i, 4, 165) * Math.PI * 2;
    const [sx, sy] = at(x + Math.cos(a) * R * 0.8, y + Math.sin(a) * R * 0.8);
    g.globalAlpha = was * sink * (1 - life);
    dotAt(g, sx + Math.sin(i + t * 4) * 1.5, sy - 2 - life * 34, life < 0.4 ? HUSH[4] : HUSH[3], 2, 2);
  }
  g.globalAlpha = was;
}
