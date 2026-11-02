// THE HOLLOW STAG DONE THE ACTION WAY: WHAT HE MAKES OF THE CLEARING (the art chat's helper, 1 Nov 2026;
// docs/mockups/action_f9_stag/README.md). A MOCK-UP: NOTHING OF THE GAME IMPORTS THIS FILE (behind STAG_ACTION, art/stag_action.ts).
//
//   THE CLEARING (`CLEARING`): his arena, an ellipse 17 by 20 tiles; at 3/4, 1/2 and 1/4 of his life its edge moves in to 80, 60 and
//     40 hundredths of it across (`clearingEdge`, `inClearing`), and stays.
//   THE WALL OF ROOTS AND THORNY TRUNKS (`wallClumpPainted`): clumps round the new edge, a clump every `WALL.step` tiles along it
//     (`wallAt`): thick dark trunks of thorn, barbed all over, their points black, and the swamp's violet roots arched between them,
//     moss on them, standing over the knight's head; bursting up out of the ground with earth thrown, standing; the wall inside it
//     sinking away as a smaller one rises; splintered where his charge crashes into it, and growing back.
//   THE MARKS ON THE FLOOR (the warnings, the enemy's pink): the new edge (`paintEdgeMark`: two dashed lines either side of where the
//     wall will stand, chevrons pointing in, beating faster as his bellow is held); his gore's sweep (`paintGoreMark`: the arc before
//     him, held; gouges of his gold torn along it as it lands); his charge's lane (art/action_f6_golem.ts `lanePainted`, the
//     red troll's and the deer's).
// Nothing of it cyan.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import { hash } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { TILE3, paintBits } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import { stage } from './skin';
import type { V3 } from './skeleton';
import { BARK, POINT, THORN, crooked, thorns } from './twisted_deer';
import { CLOD, MOSS, ROOT, SPLINTER, burst, laid } from './hollow_stag';
import { CLOSE, GORE9, GORE9_HIT } from './stag_action';
import { TAU, clamp01, smooth } from './action_f6_fx';

const sm = smooth;
const easeOut = (v: number): number => 1 - (1 - clamp01(v)) ** 2;
/** A floor point (tiles from the clearing's middle, and a height in picture pixels) to a picture pixel. */
export type At = (x: number, y: number, z?: number) => [number, number];

// =============================================================================================
// THE CLEARING

/** His arena: an ellipse `rx` by `ry` tiles from its middle (17 by 20 across); the stages its edge moves in to. */
export const CLEARING = { rx: 8.5, ry: 10, stages: CLOSE.stages } as const;
/** How far across the clearing is (its share of the whole arena) at `life` (his life, 0 to 1): 1, then 0.8 from 3/4, 0.6 from 1/2, 0.4 from 1/4. */
export function clearingAt(life: number): number {
  let k = 1;
  CLOSE.at.forEach((a, i) => {
    if (life <= a + 1e-9) k = CLOSE.stages[i + 1];
  });
  return k;
}
/** The point of the clearing's edge at angle `a` (radians round its middle), at `k` of it across. */
export const clearingEdge = (a: number, k: number): [number, number] => [Math.cos(a) * CLEARING.rx * k, Math.sin(a) * CLEARING.ry * k];
/** How far out a floor point is, as a share of the clearing's edge at `k` (1: on the edge). */
export const outOf = (x: number, y: number, k: number): number => Math.hypot(x / (CLEARING.rx * k), y / (CLEARING.ry * k));
/** Whether a floor point is inside the clearing at `k`, clear of its wall (`WALL.band` inside the edge). */
export function inClearing(x: number, y: number, k: number): boolean {
  const d = outOf(x, y, k);
  const r = Math.hypot(x, y);
  // (the band measured along the way out from the middle, in tiles)
  return d < 1 && (r === 0 || r * (1 / d - 1) >= WALL.band);
}
/**
 * WHOEVER THE WALL CATCHES as it rises (in its band, or outside the new edge): struck, and thrown in, to `CLOSE.throwIn` tiles inside
 * the new edge along the way to the middle. Null if he is clear.
 */
export function thrownIn(x: number, y: number, k: number): [number, number] | null {
  if (inClearing(x, y, k)) return null;
  const a = Math.atan2(y / CLEARING.ry, x / CLEARING.rx);
  const [ex, ey] = clearingEdge(a, k);
  const r = Math.hypot(ex, ey);
  const to = Math.max(0, r - CLOSE.throwIn - WALL.band) / r;
  return [ex * to, ey * to];
}

// =============================================================================================
// THE WALL

/**
 * THE WALL'S NUMBERS: a clump every `step` tiles along the edge, `band` to either side of it; the trunks `high` of his lengths (the
 * knight is 58, the Stag's shoulder 68); bursting up in `rise` seconds, each clump a little after the blow by how far round it is
 * (`ripple` seconds from the nearest to the furthest); the wall inside sinking away in `sink`; splintered by his charge, growing back
 * in `regrow`.
 */
export const WALL = { step: 0.8, band: CLOSE.band, high: CLOSE.high, rise: 0.16, ripple: CLOSE.rise - 0.16, sink: 0.7, regrow: 2.4, kinds: 10 } as const;
/** The clumps of the wall round the edge at `k`: each its floor point, its angle round the middle, and its kind (which of the clumps it is). */
export function wallAt(k: number): { x: number; y: number; a: number; kind: number }[] {
  // (spaced evenly along the edge: its length measured in small steps)
  const N = 720;
  const pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) pts.push(clearingEdge((i / N) * TAU, k));
  const along: number[] = [0];
  for (let i = 1; i <= N; i++) along.push(along[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = along[N];
  const n = Math.max(8, Math.round(L / WALL.step));
  const out: { x: number; y: number; a: number; kind: number }[] = [];
  let j = 0;
  for (let c = 0; c < n; c++) {
    const want = (c / n) * L;
    while (j < N && along[j + 1] < want) j++;
    const u = (want - along[j]) / Math.max(1e-9, along[j + 1] - along[j]);
    const a = ((j + u) / N) * TAU;
    const [x, y] = clearingEdge(a, k);
    out.push({ x, y, a, kind: Math.floor(hash(c, Math.round(k * 10), 811) * WALL.kinds) });
  }
  return out;
}
/** When a clump at angle `a` bursts up, seconds after the blow, the blow's way from the middle being `from` (the nearest first, rippling round both ways). */
export function wallUp(a: number, from: number): number {
  let d = Math.abs((((a - from) % TAU) + TAU) % TAU);
  if (d > Math.PI) d = TAU - d;
  return (WALL.ripple * d) / Math.PI;
}
/** A clump's canvas, its floor point on it. */
export const CLUMP9_CANVAS = { w: 170, h: 170, ax: 85, ay: 128 } as const;
/** How far up a clump stands `s` seconds after it bursts up (shot up, a little past, settled), or as it sinks away (`gone` seconds into its sinking), or splintered (`broken` seconds since). */
export function clumpHigh(s: number, gone = -1, broken = -1): number {
  if (s < 0) return 0;
  let k = s < WALL.rise ? easeOut(s / WALL.rise) * (1 + 0.18 * Math.sin((Math.PI * s) / WALL.rise)) : 1;
  if (gone >= 0) k *= 1 - sm(gone / WALL.sink);
  if (broken >= 0) k = Math.min(k, 0.3 + 0.7 * sm(broken / WALL.regrow));
  return k;
}
const CACHE = new Map<string, { px: Px; lights: Light[] }>();
/**
 * ONE CLUMP OF THE WALL (`kind` 0 to 9), `s` seconds after it burst up (or sinking `gone` seconds, or splintered `broken` seconds
 * since), its anchor its foot on the floor: 'air' the clump, 'floor' the torn earth at its foot. Painted once for each moment that
 * looks its own (on whole frames at 30 a second while it moves), and kept.
 */
export function wallClumpPainted(kind: number, s: number, layer: 'floor' | 'air' = 'air', gone = -1, broken = -1): { px: Px; lights: Light[] } {
  const C = CLUMP9_CANVAS;
  if (s < 0 || (gone >= WALL.sink && layer === 'air')) return { px: new Px(1, 1), lights: [] };
  const q = (v: number, top: number): number => (v < 0 ? -1 : v >= top ? 999 : Math.round(v * 30));
  const key = `${layer}:${kind}:${q(s, 1.0)}:${q(gone, WALL.sink)}:${q(broken, WALL.regrow)}`;
  const had = CACHE.get(key);
  if (had) return had;
  const st = stage('front', C.ax, C.ay, C);
  let made: { px: Px; lights: Light[] };
  if (layer === 'floor') {
    // (the earth torn open where it burst up: a dark rut along the edge, clods lying, roots' violet showing in it)
    const px = new Px(C.w, C.h);
    const k = gone >= 0 ? 1 - sm(gone / (WALL.sink * 2)) : 1;
    for (let i = 0; i < 70 * k; i++) {
      const a = hash(i, kind, 821) * TAU;
      const r = Math.sqrt(hash(i, kind + 1, 821));
      const [x, y] = st.at([Math.cos(a) * r * WALL.step * TILE3 * 0.75, Math.sin(a) * r * WALL.step * TILE3 * 0.75, 0]);
      const X = Math.round(x);
      const Y = Math.round(y);
      const c = r < 0.5 ? '#160e10' : hash(i, kind + 2, 821) > 0.8 ? ROOT[2] : hash(i, kind + 3, 821) > 0.5 ? '#2a1e16' : '#3a2a1e';
      for (const [ox, oy] of [[0, 0], [1, 0], [0, 1], [1, 1]] as const) if (X + ox > 0 && Y + oy > 0 && X + ox < C.w - 1 && Y + oy < C.h - 1) px.set(X + ox, Y + oy, c);
    }
    made = { px, lights: [] };
  } else {
    const k = clumpHigh(s, gone, broken);
    const bits: Bit[] = [];
    const put: Put = (part, piece, shape) => {
      bits.push({ part, piece, shape });
    };
    const dead = gone >= 0 ? clamp01(gone / WALL.sink) : 0;
    const wood = dead > 0.4 ? ([BARK[0], BARK[0], BARK[1], BARK[1], BARK[2]] as const) : BARK;
    const root = dead > 0.4 ? ([ROOT[0], ROOT[0], ROOT[1], ROOT[1], ROOT[2]] as const) : ROOT;
    const snapped = broken >= 0 && broken < WALL.regrow;
    if (k > 0.02) {
      // THE TRUNKS: two or three, thick, dark, crooked, leaning a little, barbed all over
      const nt = 2 + (kind % 2);
      for (let i = 0; i < nt; i++) {
        const x0 = (hash(i, kind, 831) - 0.5) * 14;
        const y0 = (hash(i, kind, 833) - 0.5) * 18;
        const tall = WALL.high * (0.72 + 0.28 * hash(i, kind, 835)) * k;
        const lean = (hash(i, kind, 837) - 0.5) * 0.5;
        const leanY = (hash(i, kind, 839) - 0.5) * 0.4;
        const pts: V3[] = [];
        for (let j = 0; j <= 5; j++) {
          const u = j / 5;
          pts.push([x0 + lean * tall * u + 1.8 * Math.sin(u * 6 + i * 2 + kind), y0 + leanY * tall * u + 1.4 * Math.cos(u * 5 + i), -2 + (tall + 2) * u]);
        }
        const r0 = 5.2 - 0.6 * i;
        crooked(put, `trunk${i}`, `t${i}_`, pts, r0, 1.4, wood as unknown as typeof BARK);
        if (k > 0.3) thorns(put, `trunk${i}`, `b${i}_`, pts, 3, 5.5, 841 + i + kind * 7, (dead > 0.4 ? wood : THORN) as unknown as typeof THORN, POINT, r0, 1.4);
        // (splintered: its top snapped off, the fresh wood pale where it broke)
        if (snapped) put(`trunk${i}`, `snap${i}`, { k: 'ball', c: pts[5], ax: [[2.6, 0, 0], [0, 2.6, 0], [0, 0, 1.6]], skin: ['#5a3a2a', '#8a6a48', '#cbb07c', '#e8d6aa', '#f2e4c0'] });
        if (i === 0 && dead < 0.5) put(`trunk${i}`, `moss${i}`, { k: 'ball', c: pts[1], ax: [[3.6, 0, 0], [0, 3.6, 0], [0, 0, 2.2]], skin: MOSS });
      }
      // THE ROOTS: the swamp's violet, arched up out of the ground and back into it between the trunks, barbed
      for (let i = 0; i < 3; i++) {
        const phi = hash(i, kind, 851) * TAU;
        const reach = (14 + 10 * hash(i, kind, 853)) * Math.min(1, k * 1.4);
        const top = (22 + 22 * hash(i, kind, 855)) * k;
        const x0 = Math.cos(phi) * -reach * 0.5;
        const y0 = Math.sin(phi) * -reach * 0.5;
        const pts: V3[] = [];
        for (let j = 0; j <= 6; j++) {
          const u = j / 6;
          pts.push([x0 + Math.cos(phi) * reach * u + 1.2 * Math.sin(u * 9 + i), y0 + Math.sin(phi) * reach * u * 0.8, -2 + (top + 2) * Math.sin(Math.PI * u) + (u > 0.5 ? -4 * (u - 0.5) : 0)]);
        }
        crooked(put, `root${i}`, `r${i}_`, pts, 3.0, 1.3, root as unknown as typeof ROOT);
        if (k > 0.4) thorns(put, `root${i}`, `rb${i}_`, pts, 1, 3.5, 861 + i + kind * 5, (dead > 0.4 ? wood : THORN) as unknown as typeof THORN, POINT, 3.0, 1.3);
      }
    }
    const lights = paintBits(st, bits, [0, 0, 20]);
    const px = st.whole(k > 0.02 && dead < 0.5 ? ENEMY_RIM : null);
    // (earth thrown up as it bursts out of the ground; splinters as it is smashed)
    for (const ch of burst([0, 0, 0.6], 0, s, 12, 871 + kind, CLOD, { speed: 30, up: 50, life: 0.42, size: 2 })) laid(px, st, ch[0], ch[1], ch[2]);
    if (broken >= 0) for (const ch of burst([0, 0, WALL.high * 0.5], 0, broken, 16, 873 + kind, [...SPLINTER, ROOT[3]], { speed: 40, up: 40, life: 0.7, size: 2 })) laid(px, st, ch[0], ch[1], ch[2]);
    // (sinking: bits of dead thorn and root falling off it)
    if (gone >= 0 && gone < WALL.sink) for (let i = 0; i < 8; i++) {
      const u = (gone / WALL.sink + i / 8) % 1;
      laid(px, st, [(hash(i, kind, 881) - 0.5) * 22, (hash(i, kind, 883) - 0.5) * 16, Math.max(0.6, WALL.high * 0.7 * (1 - u))], i % 2 ? BARK[2] : ROOT[2], 2);
    }
    made = { px, lights };
  }
  CACHE.set(key, made);
  return made;
}

// =============================================================================================
// THE MARKS ON THE FLOOR

/** Whole pixels laid on a picture, within it. */
function pen(px: Px): (x: number, y: number, c: string) => void {
  return (x, y, c) => {
    const X = Math.round(x);
    const Y = Math.round(y);
    if (X >= 1 && Y >= 1 && X < px.w - 1 && Y < px.h - 1) px.set(X, Y, c);
  };
}
const PINK = ['#7a1058', '#e0287a', '#ff7aa8', '#ffd0e0'] as const;
/** A beat that quickens from `a` to `b` (seconds): on or off. */
function beat(m: number, a: number, b: number): boolean {
  const k = clamp01((m - a) / Math.max(1e-6, b - a));
  // (from three a second to twelve)
  const ph = (m - a) * (3 + 9 * k * k);
  return ph - Math.floor(ph) < 0.55;
}
/**
 * THE NEW EDGE MARKED ON THE FLOOR, `m` seconds into the move that closes the wood (from `CLOSE.mark`, gone as the wall bursts up): two
 * dashed lines of the enemy's pink either side of where the wall will stand (`WALL.band`), chevrons on its inner side pointing in, at
 * the edge at `k` of the clearing; drawn round from the side nearest him; beating faster as his bellow is held.
 */
export function paintEdgeMark(px: Px, at: At, k: number, m: number, from = 0): void {
  if (m < CLOSE.mark || m > CLOSE.hit + 0.05) return;
  const dot = pen(px);
  const laidK = sm((m - CLOSE.mark) / 0.35);
  const on = beat(m, CLOSE.mark, CLOSE.hit);
  const hot = m > CLOSE.hit - 0.35;
  const N = 900;
  for (let i = 0; i < N; i++) {
    const a = from + ((i / N - 0.5) * TAU);
    if (Math.abs(i / N - 0.5) > laidK / 2) continue;
    const [ex, ey] = clearingEdge(a, k);
    const r = Math.hypot(ex, ey);
    for (const [j, off] of [[0, WALL.band], [1, -WALL.band]] as const) {
      if ((i + j * 3) % 9 >= 6) continue;
      const s = (r + off) / r;
      const [x, y] = at(ex * s, ey * s);
      dot(x, y, on ? PINK[hot ? 3 : 2] : PINK[1]);
      dot(x + 1, y, PINK[1]);
      dot(x, y + 1, PINK[0]);
    }
  }
  // (chevrons inside it, every so far round, pointing in)
  const n = Math.round((TAU * Math.hypot(CLEARING.rx, CLEARING.ry) * k) / 1.6);
  for (let c = 0; c < n; c++) {
    const a = from + ((c / n - 0.5) * TAU);
    if (Math.abs(c / n - 0.5) > laidK / 2) continue;
    const [ex, ey] = clearingEdge(a, k);
    const r = Math.hypot(ex, ey);
    const ux = ex / r;
    const uy = ey / r;
    const tx = -uy;
    const ty = ux;
    const d0 = r - WALL.band - 0.55;
    for (let s = -1; s <= 1; s += 0.06) {
      const d = d0 - 0.35 + Math.abs(s) * 0.35;
      const [x, y] = at(ux * d + tx * s * 0.42, uy * d + ty * s * 0.42);
      dot(x, y, on ? PINK[2] : PINK[1]);
      dot(x, y + 1, PINK[0]);
    }
  }
}
/**
 * HIS GORE'S SWEEP ON THE FLOOR, `m` seconds into it, him at `B` facing `aim` (radians on the floor): the arc before him from `GORE9.near`
 * to `GORE9.reach` tiles, `GORE9.arc` degrees across, marked from his head going down (0.1 s) to the blow, beating; at the blow,
 * three gouges of his gold torn along it, the pink at their edges, cooling to dark earth.
 */
export function paintGoreMark(px: Px, at: At, m: number, B: readonly [number, number], aim: number): void {
  const dot = pen(px);
  const half = ((GORE9.arc / 2) * Math.PI) / 180;
  const P = (r: number, a: number): [number, number] => at(B[0] + Math.cos(aim + a) * r, B[1] + Math.sin(aim + a) * r);
  if (m > 0.1 && m < GORE9_HIT) {
    const k = sm((m - 0.1) / 0.2);
    const on = beat(m, 0.1, GORE9_HIT);
    for (let i = 0; i <= 160; i++) {
      if (i % 6 >= 4) continue;
      const a = -half + (2 * half * i) / 160;
      if (Math.abs(a) > half * k) continue;
      for (const r of [GORE9.reach, GORE9.near + 0.25]) {
        const [x, y] = P(r, a);
        dot(x, y, on ? PINK[2] : PINK[1]);
        dot(x + 1, y, PINK[1]);
        dot(x, y + 1, PINK[0]);
      }
    }
    for (const sd of [-1, 1]) for (let r = GORE9.near + 0.25; r <= GORE9.reach; r += 0.05) {
      if (Math.round(r * 20) % 6 >= 4 || k < 0.98) continue;
      const [x, y] = P(r, sd * half);
      dot(x, y, on ? PINK[2] : PINK[1]);
      dot(x, y + 1, PINK[0]);
    }
    // (inside it, hatched faintly, so that it reads as a place to be out of)
    for (let i = 0; i < 260 * k; i++) {
      const a = (hash(i, 1, 891) - 0.5) * 2 * half * k;
      const r = GORE9.near + 0.3 + (GORE9.reach - GORE9.near - 0.4) * Math.sqrt(hash(i, 2, 891));
      const [x, y] = P(r, a);
      if ((Math.round(x) + Math.round(y)) % 2) continue;
      dot(x, y, on ? PINK[1] : PINK[0]);
    }
  }
  const s = m - GORE9_HIT;
  if (s >= 0 && s < 1.2) {
    for (const [j, r] of [[0, 1.3], [1, 2.15], [2, 2.85]] as const) {
      for (let i = 0; i <= 140; i++) {
        const a = -half + (2 * half * i) / 140;
        if (hash(i, j, 893) > 1 - s * 0.5) continue;
        const [x, y] = P(r + 0.06 * Math.sin(i * 0.7 + j), a);
        const c = s < 0.25 ? (i % 3 ? FLAME[4] : FLAME[3]) : s < 0.6 ? FLAME[2] : '#2a1a14';
        dot(x, y, c);
        dot(x + 1, y, s < 0.4 ? FLAME[2] : '#1e140e');
        dot(x, y + 1, s < 0.25 ? FLAME[1] : '#160e0a');
      }
    }
  }
}
