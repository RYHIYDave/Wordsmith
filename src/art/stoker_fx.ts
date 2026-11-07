// FLOOR 3'S SIDE BOSS, THE STOKER: WHAT HIS FIRE DOES ON THE FLOOR (the art chat, 4 Nov 2026). A MOCK-UP: NOT IN THE GAME,
// behind STOKER_ON (art/stoker.ts, off). His moves are art/stoker_moves.ts.
//
// His rulebook's Monsters 9 (“Action, like a movie”: something hurled that comes down where you stood, floor taken away, bosses
// filling the arena with things to dance around) and his rule for the enemies, 28 Oct (“bigger AOE to compensate for the extra
// time the player gets to evade”). Fire an honest orange (the props' own embers); what is marked before it comes, the enemy's pink.
//
//   THE COALS (`COALS`): flung from his shovel at the hit, SEVEN burning coals arcing out, each coming down on its own spot round
//     where the hero stood (`COAL_SPOTS`), each spot MARKED on the floor first (a ring of the enemy's pink drawing itself closed,
//     beating faster, from `ST_COALS.mark`); where each lands, a splash of sparks and A FIRE burning on the floor (`COAL_FIRE`).
//   THE RAKE'S SHEET OF FIRE (`RAKE_FIRE`): marked on the floor in his pink while he holds the shovel up; then, as the blade is
//     dragged round, fire springing up off the floor behind it in a wide arc before him, a band of it burning on.
//   THE FURNACE'S RING (`RING`): marked while he roars (a ring of pink round him, and his three gaps marked out from it); from the
//     hit, A RING OF FIRE ROLLING OUT over the floor round him, its three gaps the way through; scorched floor smoking behind it.
// Each is painted here as the game would lay it: on the floor at a spot (in tiles from his floor point, along the way he faces and to
// his left), seen from in front or from behind as he is (`FxView`); the flames stood up on it, crisp, no soft edges.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import { hash } from './kit';
import { FLAME } from './mkit';
import { EMBER } from './props';
import { TILE3 } from './new_mobs3';
import { GRID } from './skeleton';
import type { V3 } from './skeleton';
import { RAKE_ARC, ST_BURST, ST_COALS, ST_DIES, ST_RAKE } from './stoker_moves';
import { ST_ASH, ST_CRUST, ST_SMOKE, noise2 } from './stoker';

const TAU = Math.PI * 2;
const D = Math.PI / 180;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const fr = (t: number): number => t - Math.floor(t);
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/** How the game shows him, and so his fire: from in front, or from behind (as it truly sees him, `trueBack`). */
export type FxView = 'front' | 'back';
/** A spot of the floor (tiles along the way he faces, and to his left) as the picture has it: picture pixels from his floor point. */
export function fxAt(view: FxView, fwd: number, left: number, up = 0): [number, number] {
  const f = fwd * TILE3;
  const l = left * TILE3;
  if (view === 'front') return [GRID * (f + l), GRID * 0.5 * (f - l) - up];
  return [GRID * (f - l), GRID * 0.5 * (-f - l) - up];
}
/** The enemy's pink for what is marked; the fire's own colours. */
export const FX_PINK = [FLAME[0], FLAME[1], FLAME[2]] as const;
export const FIRE = EMBER;

// =============================================================================================
// THE NUMBERS

/**
 * THE COALS: seven, each coming down on its own spot round where the hero stood (tiles: along the way of the throw, and across it),
 * `flight` seconds after the hit (each a little after the last, `stagger`), from `high` tiles up at the top of its arc. Each where it
 * lands a fire `r` tiles round, burning `burns` seconds (dying over its last `dies`); a hero within `r` of it is burnt (the rules').
 * Thrown at a hero `reach` tiles off at the most.
 */
export const COALS = { n: 7, flight: 0.62, stagger: 0.035, high: 2.4, reach: 8 } as const;
export const COAL_SPOTS: ReadonlyArray<readonly [number, number]> = [[0, 0], [1.55, 0.55], [1.15, -1.25], [-1.35, 0.95], [-1.05, -1.4], [0.25, 1.85], [0.05, -1.9]];
export const COAL_FIRE = { r: 0.6, burns: 3.0, dies: 0.8 } as const;
/** When the coal `i` lands, seconds after the hit. */
export const coalLands = (i: number): number => COALS.flight + i * COALS.stagger;
/**
 * THE RAKE'S SHEET OF FIRE: a band before him from `r0` to `r1` tiles out, across the arc the blade is dragged round (RAKE_ARC,
 * degrees off his forward to his left); fire springs up behind the blade as it passes each way (ST_RAKE.drag), burning `burns`
 * seconds from then, dying over its last `dies`.
 */
export const RAKE_FIRE = { r0: 1.5, r1: 4.2, burns: 3.6, dies: 1.0 } as const;
/** The way the blade is on the floor `since` seconds after the hit (degrees off his forward, to his left), as it is dragged round. */
export function rakeWay(since: number): number {
  const [d0, d1] = ST_RAKE.drag;
  const u = clamp01(since / (d1 - d0));
  // (fastest at first, slowing as it comes round)
  const g = 1 - (1 - u) * (1 - u);
  return RAKE_ARC[0] + (RAKE_ARC[1] - RAKE_ARC[0]) * g;
}
/** When the blade passes the way `deg` (seconds after the hit), or null if it never does. */
export function rakePasses(deg: number): number | null {
  if (deg < RAKE_ARC[0] || deg > RAKE_ARC[1]) return null;
  const [d0, d1] = ST_RAKE.drag;
  const g = (deg - RAKE_ARC[0]) / (RAKE_ARC[1] - RAKE_ARC[0]);
  return (1 - Math.sqrt(1 - g)) * (d1 - d0);
}
/**
 * THE FURNACE'S RING: rolling out from `r0` to `r1` tiles round him at `pace` tiles a second from the hit, `deep` tiles deep; its
 * three GAPS, `gap` degrees wide, at these ways off his forward (the way through); scorched floor smoking behind it for `scorch` s.
 */
export const RING = { r0: 1.2, r1: 6.0, pace: 8, deep: 0.8, gap: 34, gaps: [60, 180, 300] as const, scorch: 1.4 } as const;
/** How far out the ring's front is `since` seconds after the hit (tiles), or null before it and after it has rolled out. */
export function ringAt(since: number): number | null {
  if (since < 0) return null;
  const r = RING.r0 + RING.pace * since;
  return r > RING.r1 + RING.deep ? null : r;
}
/** Whether the way `deg` (off his forward, to his left) is in one of the ring's gaps. */
export function inGap(deg: number): boolean {
  const a = ((deg % 360) + 360) % 360;
  return RING.gaps.some((g) => Math.abs(((a - g + 540) % 360) - 180) < RING.gap / 2);
}

// =============================================================================================
// PAINTING FIRE: a bed of embers on the floor, tongues of flame stood up on it, sparks over; crisp

/** A canvas for what lies on the floor round a spot (picture pixels), its spot at (`ax`, `ay`). */
export interface FxCanvas {
  w: number;
  h: number;
  ax: number;
  ay: number;
}
/** One patch of fire on the floor: `rx` picture pixels across its middle (half), `k` how big it is (0 none, 1 full), `age` seconds. */
export function flames(px: Px, cx: number, cy: number, rx: number, k: number, age: number, seed: number, lights?: Light[]): void {
  if (k <= 0.02) return;
  const ry = rx * 0.5;
  // the bed: a glowing ellipse of embers and crust, its edge ragged
  for (let y = Math.floor(cy - ry - 2); y <= cy + ry + 2; y++) {
    for (let x = Math.floor(cx - rx - 2); x <= cx + rx + 2; x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      const d = Math.hypot(dx, dy);
      const n = noise2((x + seed * 7) * 0.35, (y + seed * 3) * 0.5 + age * 2, 211);
      if (d > 0.82 + 0.3 * n) continue;
      const hot = (1 - d) * k + 0.35 * n - 0.1;
      px.set(x, y, hot > 0.62 ? EMBER[3] : hot > 0.4 ? EMBER[2] : hot > 0.2 ? EMBER[1] : hot > 0.05 ? ST_CRUST[2] : ST_CRUST[1]);
    }
  }
  // the tongues: each a flame stood up on the bed, flickering, its heart bright
  const n = Math.max(3, Math.round(rx / 2.6));
  for (let i = 0; i < n; i++) {
    const a = hash(i, seed, 213) * TAU;
    const r = Math.sqrt(hash(i, seed, 214)) * 0.75;
    const bx = cx + Math.cos(a) * rx * r;
    const by = cy + Math.sin(a) * ry * r;
    const fl = 0.55 + 0.45 * noise2(i * 3.1 + seed, age * 7, 215);
    const tall = (rx * 1.15 + 4) * k * fl * (1 - 0.4 * r);
    const wide = 2 + rx * 0.16 * k;
    const lean = 1.6 * Math.sin(age * 5 + i);
    for (let yy = 0; yy < tall; yy++) {
      const u = yy / tall;
      const w = wide * Math.sqrt(1 - u) * (1 - 0.5 * u);
      const xm = bx + lean * u * u;
      for (let xx = Math.floor(xm - w); xx <= xm + w; xx++) {
        const e = Math.abs(xx + 0.5 - xm) / Math.max(0.5, w);
        const c = u > 0.7 || e > 0.75 ? EMBER[1] : u > 0.4 || e > 0.45 ? EMBER[2] : u > 0.15 ? EMBER[3] : EMBER[4];
        px.set(xx, Math.round(by - yy), c);
      }
    }
  }
  // sparks going up off it
  for (let i = 0; i < Math.round(3 * k + rx / 6); i++) {
    const life = fr(age * 1.3 + hash(i, seed, 216));
    if (life > 0.7) continue;
    const x = cx + (hash(i, seed, 217) - 0.5) * rx * 1.4 + 2 * Math.sin(life * 9 + i);
    const y = cy - rx * 1.2 * k - 18 * life;
    px.set(Math.round(x), Math.round(y), life < 0.35 ? EMBER[4] : EMBER[3]);
  }
  lights?.push({ x: cx, y: cy - rx * 0.4, r: rx * 2.2 + 10, color: EMBER[2], a: 0.3 * k });
}
/** A scorch on the floor where fire has burnt out: soot, a few embers dying in it, smoke going up. */
export function scorch(px: Px, cx: number, cy: number, rx: number, age: number, seed: number, k: number): void {
  if (k <= 0.02) return;
  const ry = rx * 0.5;
  for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) {
    for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
      const d = Math.hypot((x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry);
      const n = noise2((x + seed) * 0.4, y * 0.5, 221);
      if (d > 0.8 + 0.25 * n) continue;
      if ((x + y) % 2 && d > 0.6) continue;
      px.set(x, y, n > 0.82 && k > 0.5 ? ST_CRUST[2] : n > 0.5 ? '#141012' : '#1c1718');
    }
  }
  for (let i = 0; i < 3; i++) {
    const life = fr(age * 0.5 + i / 3 + hash(i, seed, 222));
    if (life > 0.8 * k) continue;
    px.set(Math.round(cx + (hash(i, seed, 223) - 0.5) * rx + 3 * Math.sin(life * 6)), Math.round(cy - 6 - 26 * life), ST_SMOKE[Math.min(3, 1 + Math.floor(life * 3))]);
  }
}
/** A MARK: a ring of the enemy's pink drawn round a spot on the floor, its dashes filling in as the moment comes (`k` 0 to 1), beating faster. */
export function markRing(px: Px, cx: number, cy: number, rx: number, k: number, t: number): void {
  if (k <= 0) return;
  const ry = rx * 0.5;
  const beat = 0.5 + 0.5 * Math.sin(t * (8 + 22 * k));
  const n = Math.max(24, Math.round(rx * 5));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    // (dashes, filling in round it as it comes)
    const dash = fr((i / n) * 12) < 0.5 + 0.5 * k;
    if (!dash || i / n > Math.min(1, 0.25 + k)) continue;
    const x = Math.round(cx + Math.cos(a) * rx - 0.5);
    const y = Math.round(cy + Math.sin(a) * ry - 0.5);
    px.set(x, y, beat > 0.5 ? FX_PINK[2] : FX_PINK[1]);
    if (k > 0.6) px.set(x, y + 1, FX_PINK[0]);
  }
  // (a cross in its middle, once it is nearly come)
  if (k > 0.5) for (let d = -2; d <= 2; d++) {
    px.set(Math.round(cx) + d, Math.round(cy), FX_PINK[1]);
    px.set(Math.round(cx), Math.round(cy) + Math.round(d / 2), FX_PINK[1]);
  }
}

// =============================================================================================
// THE COALS

/** Where coal `i` is `since` seconds after the hit (tiles: along his forward, to his left, and up), flung from `from` (tiles, and up) to its spot about `aim` (tiles off his floor point, along his forward and to his left; the throw's way his forward). */
export function coalAt(i: number, since: number, from: V3, aim: readonly [number, number]): V3 | null {
  const T = coalLands(i);
  if (since < 0 || since > T) return null;
  const sp = COAL_SPOTS[i];
  const to: [number, number] = [aim[0] + sp[0], aim[1] + sp[1]];
  const u = since / T;
  // (a high arc, as a thing thrown up and over comes down)
  const z = from[2] * (1 - u) + 4 * COALS.high * u * (1 - u) * (0.85 + 0.3 * hash(i, 1, 231));
  return [from[0] + (to[0] - from[0]) * u, from[1] + (to[1] - from[1]) * u, z];
}
/** THE COALS ON THE FLOOR `t` seconds into his move (the marks before; the fires after): painted on `px` with his floor point at (`ox`, `oy`), seen `view`. */
export function coalsFloor(px: Px, ox: number, oy: number, t: number, view: FxView, aim: readonly [number, number], lights?: Light[]): void {
  const C = ST_COALS;
  for (let i = 0; i < COALS.n; i++) {
    const sp = COAL_SPOTS[i];
    const [x, y] = fxAt(view, aim[0] + sp[0], aim[1] + sp[1]);
    const cx = ox + x;
    const cy = oy + y;
    const rx = COAL_FIRE.r * 32 * Math.SQRT2 * 0.98;
    const lands = C.hit + coalLands(i);
    if (t >= C.mark && t < lands) markRing(px, cx, cy, rx, clamp01((t - C.mark) / (lands - C.mark)), t);
    const age = t - lands;
    if (age >= 0 && age < COAL_FIRE.burns + 1.2) {
      const live = age < 0.12 ? 0.6 + 3 * age : 1 - smooth(COAL_FIRE.burns - COAL_FIRE.dies, COAL_FIRE.burns, age);
      if (age > COAL_FIRE.burns - COAL_FIRE.dies) scorch(px, cx, cy, rx, age, i + 3, 1 - smooth(COAL_FIRE.burns, COAL_FIRE.burns + 1.2, age));
      flames(px, cx, cy, rx, live, age, i + 3, lights);
      // (the splash as it lands: sparks thrown out round it)
      if (age < 0.3) {
        for (let j = 0; j < 16; j++) {
          const a = (j / 16) * TAU + hash(j, i, 233);
          const r = 4 + 70 * age;
          px.set(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r * 0.5 - 30 * age * (1 - age * 2)), j % 2 ? EMBER[4] : EMBER[3]);
        }
      }
    }
  }
}
/** A burning coal in the air (a lump glowing white at its heart, a crust of black), `r` picture pixels round, with a trail of sparks behind it (`back`: the way it came, picture pixels a step). */
export function coalInAir(px: Px, cx: number, cy: number, t: number, i: number, back: readonly [number, number]): void {
  for (let k = 1; k <= 6; k++) {
    const x = Math.round(cx + back[0] * k * 0.8 + 1.5 * Math.sin(k * 2 + i));
    const y = Math.round(cy + back[1] * k * 0.8);
    if (hash(k, i, Math.floor(t * 30)) < 0.75) px.set(x, y, k < 3 ? EMBER[3] : EMBER[2]);
  }
  const r = 3.2;
  for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) {
    const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) / r;
    if (d > 1) continue;
    const n = hash(x, y, 235 + i);
    px.set(x, y, d < 0.4 ? EMBER[4] : d < 0.7 ? (n > 0.3 ? EMBER[3] : ST_CRUST[2]) : n > 0.5 ? EMBER[2] : ST_CRUST[1]);
  }
}

// =============================================================================================
// THE RAKE'S SHEET OF FIRE

/** The patches the sheet is laid in: each a way (degrees) and a distance (tiles) from him. */
export const RAKE_PATCHES: ReadonlyArray<readonly [number, number]> = (() => {
  const out: [number, number][] = [];
  for (let r = RAKE_FIRE.r0 + 0.35; r < RAKE_FIRE.r1; r += 0.62) {
    const step = (0.62 / r) / D;
    for (let a = RAKE_ARC[0] + step / 2; a < RAKE_ARC[1]; a += step) out.push([a, r]);
  }
  return out;
})();
/** THE RAKE ON THE FLOOR `t` seconds into his move: its mark while he holds the shovel up; the sheet of fire after. */
export function rakeFloor(px: Px, ox: number, oy: number, t: number, view: FxView, lights?: Light[]): void {
  const K = ST_RAKE;
  if (t >= K.mark && t < K.hit + 0.15) {
    // the mark: the band's edges and its ends dashed in his pink, beating
    const k = clamp01((t - K.mark) / (K.hit - K.mark));
    const beat = Math.sin(t * (8 + 20 * k)) > 0;
    for (const r of [RAKE_FIRE.r0, RAKE_FIRE.r1]) {
      for (let a = RAKE_ARC[0]; a <= RAKE_ARC[1]; a += 0.6) {
        if (fr(a / 6) > 0.35 + 0.5 * k) continue;
        const [x, y] = fxAt(view, r * Math.cos(a * D), r * Math.sin(a * D));
        px.set(Math.round(ox + x), Math.round(oy + y), beat ? FX_PINK[2] : FX_PINK[1]);
      }
    }
    for (const a of RAKE_ARC) {
      for (let r = RAKE_FIRE.r0; r <= RAKE_FIRE.r1; r += 0.05) {
        if (fr(r * 2) > 0.4 + 0.5 * k) continue;
        const [x, y] = fxAt(view, r * Math.cos(a * D), r * Math.sin(a * D));
        px.set(Math.round(ox + x), Math.round(oy + y), beat ? FX_PINK[2] : FX_PINK[1]);
      }
    }
  }
  const since = t - K.hit;
  if (since < 0) return;
  // the patches, nearest the eye last
  const order = RAKE_PATCHES.map((p, i) => ({ p, i, y: fxAt(view, p[1] * Math.cos(p[0] * D), p[1] * Math.sin(p[0] * D))[1] })).sort((a, b) => a.y - b.y);
  for (const { p, i } of order) {
    const pass = rakePasses(p[0]);
    if (pass === null) continue;
    const age = since - pass;
    if (age < 0 || age > RAKE_FIRE.burns + 1.2) continue;
    const [x, y] = fxAt(view, p[1] * Math.cos(p[0] * D), p[1] * Math.sin(p[0] * D));
    const rx = 19 + 4 * hash(i, 1, 241);
    const live = age < 0.1 ? 0.5 + 5 * age : 1 - smooth(RAKE_FIRE.burns - RAKE_FIRE.dies, RAKE_FIRE.burns, age + 0.25 * hash(i, 2, 241));
    if (age > RAKE_FIRE.burns - RAKE_FIRE.dies) scorch(px, ox + x, oy + y, rx, age, i, 1 - smooth(RAKE_FIRE.burns, RAKE_FIRE.burns + 1.2, age));
    flames(px, ox + x, oy + y, rx, live, age, i + 11, i % 3 === 0 ? lights : undefined);
  }
}

// =============================================================================================
// THE FURNACE'S RING

/** THE RING ON THE FLOOR `t` seconds into his move: its mark while he roars; then rolling out, its gaps the way through; the scorch behind. `half`: the far half (behind him and the hero) or the near; both if not said. */
export function ringFloor(px: Px, ox: number, oy: number, t: number, view: FxView, half?: 'far' | 'near', lights?: Light[]): void {
  const K = ST_BURST;
  const want = (y: number): boolean => !half || (half === 'far' ? y < 0 : y >= 0);
  if (t >= K.mark && t < K.hit) {
    const k = clamp01((t - K.mark) / (K.hit - K.mark));
    const beat = Math.sin(t * (8 + 22 * k)) > 0;
    // a ring round him at its start, filling in; each gap marked out along the floor with dashes
    for (let a = 0; a < 360; a += 1.5) {
      if (inGap(a)) continue;
      if (fr(a / 10) > 0.4 + 0.6 * k) continue;
      const [x, y] = fxAt(view, RING.r0 * Math.cos(a * D), RING.r0 * Math.sin(a * D));
      if (want(y)) px.set(Math.round(ox + x), Math.round(oy + y), beat ? FX_PINK[2] : FX_PINK[1]);
    }
    for (const g of RING.gaps) {
      for (const e of [-1, 1]) {
        const a = g + e * RING.gap / 2;
        for (let r = RING.r0; r <= RING.r0 + (RING.r1 - RING.r0) * k; r += 0.06) {
          if (fr(r * 2.5) > 0.5) continue;
          const [x, y] = fxAt(view, r * Math.cos(a * D), r * Math.sin(a * D));
          if (want(y)) px.set(Math.round(ox + x), Math.round(oy + y), beat ? FX_PINK[2] : FX_PINK[1]);
        }
      }
    }
  }
  const since = t - K.hit;
  if (since < 0) return;
  const front = RING.r0 + RING.pace * since;
  // the scorch behind it: the floor it has rolled over, smoking (but in the gaps)
  for (let r = RING.r0; r < Math.min(front - RING.deep, RING.r1); r += 0.55) {
    const step = (0.55 / r) / D;
    for (let a = 0; a < 360; a += step) {
      if (inGap(a)) continue;
      const passed = (r - RING.r0) / RING.pace;
      const age = since - passed;
      if (age > RING.scorch + 0.8) continue;
      const [x, y] = fxAt(view, r * Math.cos(a * D), r * Math.sin(a * D));
      if (!want(y)) continue;
      scorch(px, ox + x, oy + y, 13, age, Math.round(a * 7 + r * 13), 1 - smooth(RING.scorch, RING.scorch + 0.8, age));
    }
  }
  // the ring of fire itself: patches along its front, the far side first
  if (front > RING.r1 + RING.deep) return;
  const pts: { x: number; y: number; i: number }[] = [];
  const step = (0.5 / front) / D;
  let i = 0;
  for (let a = 0; a < 360; a += step, i++) {
    if (inGap(a)) continue;
    const r = front - RING.deep / 2;
    const [x, y] = fxAt(view, r * Math.cos(a * D), r * Math.sin(a * D));
    if (want(y)) pts.push({ x, y, i });
  }
  pts.sort((a, b) => a.y - b.y);
  const k = 1 - 0.35 * smooth(RING.r1 - 1.5, RING.r1 + RING.deep, front);
  for (const p of pts) flames(px, ox + p.x, oy + p.y, 15, k, since, p.i + 51, p.i % 4 === 0 ? lights : undefined);
}

// =============================================================================================
// HIS DEATH'S BLAST ON THE FLOOR (his pick of 6 Nov 2026, “Furnace explodes (Recommended)”): as he bursts (art/stoker.ts
// `ST_DEATH.hit`) a SHOCKWAVE rolls out over the floor from where he stood, a ring of fire and dust, out to `r1` tiles at `pace`
// tiles a second (the main chat may make it hurt or not: a hero within `deep` of its front as it passes); and where he stood the
// floor is left SCORCHED, `scorch` tiles round, embers dying in it and smoke going up, to the end of his death and after.

/** The shockwave: from `r0` to `r1` tiles round him at `pace` tiles a second, `deep` tiles deep; the scorch where he stood, `scorch` tiles round. */
export const BLAST = { r0: 0.5, r1: 3.0, pace: 10, deep: 0.5, scorch: 1.2 } as const;
/** How far out the shockwave's front is (tiles) `since` seconds after he bursts, or null before it and once it has passed `r1`. */
export function blastAt(since: number): number | null {
  if (since < 0) return null;
  const r = BLAST.r0 + BLAST.pace * since;
  return r > BLAST.r1 + BLAST.deep ? null : r;
}
export function blastFloor(px: Px, ox: number, oy: number, t: number, view: FxView, lights?: Light[]): void {
  const since = t - ST_DIES.hit;
  if (since < 0) return;
  // the scorch where he stood: soot, embers dying in it, smoke going up
  const grow = clamp01(since / 0.15);
  for (let r = 0; r <= BLAST.scorch * grow; r += 0.4) {
    const n = Math.max(1, Math.round((TAU * r) / 0.45));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + r;
      const [x, y] = fxAt(view, r * Math.cos(a), r * Math.sin(a));
      scorch(px, ox + x, oy + y, 12, since + i * 0.13, Math.round(a * 11 + r * 17) + 7, 1);
    }
  }
  if (since < 0.8) flames(px, ox, oy, 26 * (1 - since / 0.8) + 6, 1 - since / 0.8, since, 61, lights);
  // the shockwave: a ring of fire and dust rolling out over the floor, thinning as it goes
  const front = blastAt(since);
  if (front === null) return;
  const k = 1 - 0.7 * clamp01((front - BLAST.r0) / (BLAST.r1 - BLAST.r0));
  const pts: { x: number; y: number; i: number }[] = [];
  const step = (0.55 / front) / D;
  let i = 0;
  for (let a = 0; a < 360; a += step, i++) {
    const [x, y] = fxAt(view, front * Math.cos(a * D), front * Math.sin(a * D));
    pts.push({ x, y, i });
  }
  pts.sort((p, q) => p.y - q.y);
  for (const p of pts) flames(px, ox + p.x, oy + p.y, 9, k, since, p.i + 71, p.i % 5 === 0 ? lights : undefined);
  // (dust thrown up in a band behind its front)
  for (let j = 0; j < 90; j++) {
    const a = hash(j, 1, 231) * TAU;
    const r = Math.max(BLAST.r0, front - BLAST.deep * hash(j, 2, 231) * 1.6);
    const [x, y] = fxAt(view, r * Math.cos(a), r * Math.sin(a));
    px.set(Math.round(ox + x), Math.round(oy + y - 3 - 8 * hash(j, 3, 231) * k), ST_SMOKE[j % 3 === 0 ? 1 : 2]);
  }
}

/** The painted canvases the film and the sheet lay these on (and the game would): his floor point at (ax, ay). */
export const FX_CANVAS: FxCanvas = { w: 900, h: 560, ax: 450, ay: 260 };
/** Each of the four (the coals, the rake, the burst's ring, his death's blast), painted alone on its own canvas, his floor point at its anchor (for the sheet, the tests and the game). */
export function fxPainted(which: 'coals' | 'rake' | 'ring' | 'blast', t: number, view: FxView, aim: readonly [number, number] = [4, 0]): { px: Px; lights: Light[] } {
  const px = new Px(FX_CANVAS.w, FX_CANVAS.h);
  const lights: Light[] = [];
  if (which === 'coals') coalsFloor(px, FX_CANVAS.ax, FX_CANVAS.ay, t, view, aim, lights);
  else if (which === 'rake') rakeFloor(px, FX_CANVAS.ax, FX_CANVAS.ay, t, view, lights);
  else if (which === 'blast') blastFloor(px, FX_CANVAS.ax, FX_CANVAS.ay, t, view, lights);
  else ringFloor(px, FX_CANVAS.ax, FX_CANVAS.ay, t, view, undefined, lights);
  return { px, lights };
}
export { ST_ASH as FX_ASH };
