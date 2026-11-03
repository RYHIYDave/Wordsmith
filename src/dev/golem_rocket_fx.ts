// HER GOLEM'S ROCKET JUMP, WHAT IT THROWS OFF (the art chat's helper, 2 Nov 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// Its moves are dev/golem_rocket.ts golemRocket; here is what they throw off, by his art rulebook (Animations 1: big and wild
// and kinetic and weighty; Movement 9: the blast and the slam each a flash; everything that glows the friend's cyan and white,
// it is a friend: no pink, no gold; smoke and steam grey, stone the floor's).
//
// AT THE GOLEM (lifted with it): as it crouches, steam venting from its stacks' feet as they swing down and lock (a burst, a
// clank of sparks); as it holds, fire licking out of their mouths, longer and brighter, white-hot, a pool of cyan light on the
// floor under them, grit hopping round its feet, a flash at their mouths as it blasts off; THE BLAST, a column of fire out
// of them driven down into the floor; in the air, long flames streaming back and down out of them, embers shed, sputtering
// out over the top, smoke wisps; landed, steam bursting out of them and hissing as they swing back up, a last burst as they lock.
// WHERE IT TOOK OFF: the floor scorched under the column, its cracks glowing cyan and cooling; a white flash, fire splashed out
// over the floor, a ring of dust blown out, stone flung up, a column of smoke rolling up and thinning; an after-image of it, in
// the friend's dark cyan, where it crouched, for two frames.
// ALONG ITS WAY: puffs of smoke shed off its flames, hanging in the air where it passed, spreading and thinning.
// WHERE IT LANDS: the floor cracked open in a crater round its feet and fist, a ring of dust blown out over the floor, stone
// flung up and falling back, dust billowing up and settling; the crater fading at last.

import { Px } from '../engine/px';
import type { V3 } from '../art/skeleton';
import { UNITS_PER_TILE } from '../art/moves3';
import { Light, SMOKE, cloud, fire } from './warlock_fx';
import { noise2 } from './sculpt_warlock';
import { STEAM, burstSteam, hiss } from './golem_pound_fx';
import { CHIP, SCORCH, chips } from './blast_fx';
import { ROCKET, golemRocket, rocketUp, ROCKET_GRAIN } from './golem_rocket';

/** What glows: the friend's cyan, darkest to white-hot. */
export const ROCKET_GLOW = ['#0c6a80', '#22d0e0', '#b8fff8', '#e8ffff'];
export { SMOKE, STEAM, CHIP, SCORCH };

const T = UNITS_PER_TILE;
const hash = (i: number): number => {
  const x = Math.sin(i * 71.13 + 9.71) * 43758.5453;
  return x - Math.floor(x);
};

/** What a layer of it holds: smoke, steam and dust, stone, light. */
export interface AirLayer {
  sm: Light;
  st: Light;
  stone: Light;
  l: Light;
}
/** Its layers: on the floor (its scorch and cracks, stone lying there, light on it); behind what stands; over it. */
export interface RocketLayers {
  floor: Light;
  floorStone: Light;
  floorLit: Light;
  behind: AirLayer;
  over: AirLayer;
}
const air = (): AirLayer => ({ sm: new Light(), st: new Light(), stone: new Light(), l: new Light() });
export function rocketLayers(): RocketLayers {
  return { floor: new Light(), floorStone: new Light(), floorLit: new Light(), behind: air(), over: air() };
}
export function layRocketFloor(w: number, h: number, ly: RocketLayers): Px {
  const out = new Px(w, h);
  ly.floor.lay(out, SCORCH);
  ly.floorStone.lay(out, CHIP);
  ly.floorLit.lay(out, ROCKET_GLOW);
  return out;
}
export function layRocketAir(w: number, h: number, a: AirLayer): Px {
  const out = new Px(w, h);
  a.sm.lay(out, SMOKE);
  a.st.lay(out, STEAM);
  a.stone.lay(out, CHIP);
  a.l.lay(out, ROCKET_GLOW);
  return out;
}

/** Where its parts are at a frame, in the world (its floor point at the origin as the picture is drawn), and the world to the picture. */
export interface RocketAt {
  S: (p: V3) => [number, number];
  /** Its stacks' mouths, the way each points, and each one's foot. */
  mouths: V3[];
  ways: V3[];
  feet: V3[];
  /** Its feet on the floor and its giant fist. */
  grip: V3[];
  fist: V3;
  /** How high it is drawn over the floor (picture pixels): what is at it is painted at its floor point (the game lifts it with it); the floor is this much below it. */
  lift: number;
}

function line(l: Light, x0: number, y0: number, x1: number, y1: number, k: number, w = 1): void {
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    const y = y0 + ((y1 - y0) * i) / n;
    for (let a = 0; a < w; a++) for (let b = 0; b < w; b++) l.put(x + a - (w >> 1), y + b - (w >> 1), k);
  }
}
function disc(l: Light, x: number, y: number, r: number, top = 3, squash = 1): void {
  for (let yy = Math.floor(-r * squash); yy <= Math.ceil(r * squash); yy++) {
    for (let xx = Math.floor(-r); xx <= Math.ceil(r); xx++) {
      const d = Math.hypot(xx, yy / squash) / Math.max(0.5, r);
      if (d > 1) continue;
      l.put(x + xx, y + yy, Math.max(0, Math.min(top, Math.round(top - d * top * 0.9))));
    }
  }
}
/** A way in the world as a unit on the picture, from `p`. */
function onPicture(S: (p: V3) => [number, number], p: V3, w: V3): [number, number] {
  const a = S(p);
  const b = S([p[0] + w[0] * 10, p[1] + w[1] * 10, p[2] + w[2] * 10]);
  const n = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [(b[0] - a[0]) / n, (b[1] - a[1]) / n];
}
const up = (p: V3, z: number): V3 => [p[0], p[1], p[2] + z];

/**
 * A TONGUE OF FIRE out of a mouth at (x, y) the way (dx, dy) on the picture, `len` long and `wide` across at its widest, at
 * frame `f`: white-hot at its heart, the friend's cyan round it, its tip lashing and fraying.
 */
export function flame(l: Light, x: number, y: number, dx: number, dy: number, len: number, wide: number, f: number, seed: number): void {
  if (len < 1.5) return;
  const nx = -dy;
  const ny = dx;
  for (let s = 0; s <= len; s += 0.5) {
    const u = s / len;
    const wob = noise2(s * 0.13 - f * 1.9 + seed, f * 0.41 + seed * 0.7) - 0.5;
    const half = wide * (0.45 + 0.55 * Math.sqrt(u)) * (1 - u ** 2.4) * (1 + wob * 0.55) + 0.7;
    const off = wob * u * wide * 0.9;
    for (let a = -half; a <= half; a += 0.5) {
      const q = Math.abs(a) / half;
      let k = q < 0.4 ? 3 : q < 0.74 ? 2 : 1;
      if (u > 0.5) k = Math.min(k, 2);
      if (u > 0.78) k = 1;
      l.put(x + dx * s + nx * (a + off), y + dy * s + ny * (a + off), k);
    }
  }
}
/** Embers shed off a flame: flecks of light flung back from its tip, fading. */
function embers(l: Light, x: number, y: number, dx: number, dy: number, len: number, f: number, seed: number, n: number): void {
  for (let i = 0; i < n; i++) {
    const age = (f + i * 3 + Math.floor(hash(seed + i) * 5)) % 7;
    const s = len * (0.7 + 0.15 * age) + hash(seed * 3 + i) * 6;
    const side = (hash(seed * 5 + i) - 0.5) * (6 + age * 2.5);
    const px = x + dx * s - dy * side;
    const py = y + dy * s + dx * side + age * 0.6;
    const k = age < 2 ? 3 : age < 4 ? 2 : 1;
    l.put(px, py, k);
    l.put(px + 1, py, Math.max(1, k - 1));
  }
}

/** How long its stacks' fire reaches (picture pixels), and how wide, at frame `f` of the jump (0 none). */
export function stackFire(f: number): { len: number; wide: number } {
  const R = ROCKET;
  const k = f - R.blast;
  const q = golemRocket(f).flare;
  if (f < R.crouch || f >= R.land) return { len: 0, wide: 0 };
  if (k < 0) {
    const flick = (noise2(f * 0.9, 3.3) - 0.5) * 4 * q;
    return { len: 3 + 15 * q ** 1.5 + flick, wide: 1.8 + 2.6 * q };
  }
  // (k 0 to 2, the column, reaches the floor: rocketAtGolem works out how far)
  if (k <= 2) return { len: 999, wide: [8, 7, 6][k] };
  if (k <= 11) return { len: 34 + (noise2(f * 0.7, 9.1) - 0.5) * 12, wide: 5 };
  if (k <= 16) return { len: [18, 6, 14, 4, 0][k - 12], wide: [4, 2.5, 3.5, 2, 0][k - 12] };
  return { len: 0, wide: 0 };
}

/**
 * EVERYTHING AT THE GOLEM at frame `f` of its rocket jump (drawn at its floor point, lifted with it: `at.lift`): its stacks'
 * steam and clank, their fire licking and flaring and blazing, the column of fire into the floor, the flames streaming as it
 * flies, sputtering, smoke wisps; the light on the floor and grit hopping as it holds; the steam as it lands and stands.
 * `front`: seen from in front its stacks are behind it (their fire laid behind it); from behind, over it.
 */
export function rocketAtGolem(ly: RocketLayers, at: RocketAt, f: number, front: boolean): void {
  const R = ROCKET;
  const k = f - R.blast;
  const t = f / 30;
  const fireL = front ? ly.behind : ly.over;
  // (painted at its floor point as it is drawn; the game lifts the piece with it: the floor is `at.lift` below it)
  const S = at.S;
  const { len, wide } = stackFire(f);
  at.mouths.forEach((m, i) => {
    const way = at.ways[i];
    const [x, y] = S(m);
    const [dx, dy] = onPicture(S, m, way);
    const foot = at.feet[i];
    const [bx, by] = S(foot);
    // THE STACKS SWINGING DOWN AND LOCKING, AND BACK UP AND LOCKING: steam bursting out at their feet, a clank of sparks
    for (const lockAt of [R.lock - 1, R.stand - 1]) {
      const kk = f - lockAt;
      if (kk >= 0 && kk < 16) burstSteam(ly.over.st, bx, by - 2, kk, t, 0.75, 70 + i * 9 + lockAt);
      if (kk >= 0 && kk < 3) for (let j = 0; j < 5; j++) {
        const a = hash(lockAt * 7 + i * 13 + j) * Math.PI * 2;
        const r = 3 + kk * 4 + hash(j + i) * 3;
        ly.over.l.put(bx + Math.cos(a) * r, by + Math.sin(a) * r * 0.7, 3 - kk);
        ly.over.l.put(bx + Math.cos(a) * r + 1, by + Math.sin(a) * r * 0.7, Math.max(1, 2 - kk));
      }
    }
    // HOLDING: steam venting out of their feet, harder and harder
    if (f >= R.lock && f < R.blast) {
      const hard = (f - R.lock) / (R.blast - R.lock);
      for (let j = 0; j < 3; j++) {
        const age = (f - R.lock + j * 2) % 6;
        const side = i === 0 ? 1 : -1;
        const r = (2 + age * 0.9) * (0.7 + 0.6 * hard);
        cloud(ly.over.st, bx + side * (3 + age * (1.5 + 2 * hard)), by - 3 - age * (1.6 + 1.6 * hard), 2 * r, 1.6 * r, t + j * 0.3, Math.min(1, 0.1 + age / 6.5), 7100 + i * 7 + j);
      }
    }
    // ITS FIRE
    if (len > 0) {
      let L = len;
      if (L > 500) {
        // (the column: from its mouth along its way down into the floor, under it as it is lifted)
        const wz = way[2];
        const tt = wz < -0.05 ? (m[2] + at.lift) / -wz : 40;
        const end: V3 = [m[0] + way[0] * tt, m[1] + way[1] * tt, m[2] + way[2] * tt];
        const [ex, ey] = S(end);
        L = Math.hypot(ex - x, ey - y) + 4;
      }
      flame(fireL.l, x, y, dx, dy, L, wide, f, 11 + i * 17);
      disc(fireL.l, x, y, Math.max(2, wide * 0.8), 3);
      if (k >= 0 && k <= 13) embers(fireL.l, x, y, dx, dy, Math.min(L, 40), f, 300 + i * 29, k <= 11 ? 6 : 3);
    }
    // THE FLASH at their mouths as it blasts off
    if (k === -1 || k === 0) {
      const big = k === -1 ? 0.7 : 1;
      disc(fireL.l, x, y, 7 * big, 3);
      for (let j = 0; j < 10; j++) {
        const a = (j / 10) * Math.PI * 2 + hash(i * 5 + j) * 0.4;
        const r = (12 + 10 * hash(i * 7 + j)) * big;
        line(fireL.l, x, y, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8, 2, 1);
        line(fireL.l, x, y, x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.4, 3, 1);
      }
    }
    // SMOKE WISPS off their mouths once their fire is out
    if (k >= 13 && k < R.flight + 6) {
      for (let j = 0; j < 2; j++) {
        const age = k - 13 - j * 3;
        if (age < 0 || age > 12) continue;
        const r = 2 + age * 0.45;
        cloud(ly.over.sm, x + dx * (3 + age) , y + dy * (3 + age) - age * 0.6, 2 * r, 1.6 * r, t + j, Math.min(1, 0.2 + age / 13), 7400 + i * 5 + j);
      }
    }
    // LANDED: steam bursting out of them, hissing as they swing back up, thinning away
    if (f >= R.land) {
      const kk = f - R.land;
      burstSteam(ly.over.st, x, y - 2, kk, t, 0.7, 90 + i * 11);
      const hard = Math.max(0, 1 - kk / (R.end - R.land));
      if (kk >= 3) hiss(ly.over.st, x, y - 1, kk, t, hard * 0.9, 40 + i * 7);
    }
  });
  // HOLDING: a pool of the fire's light on the floor under its mouths, grit hopping round its feet
  if (f >= R.crouch && f <= R.blast) {
    const q = golemRocket(Math.min(f, R.blast - 1)).flare;
    const mid: V3 = [(at.mouths[0][0] + at.mouths[1][0]) / 2, (at.mouths[0][1] + at.mouths[1][1]) / 2, 0];
    const w = at.ways[0];
    const reach = w[2] < -0.05 ? Math.min(30, ((at.mouths[0][2] + at.mouths[1][2]) / 2) / -w[2]) : 0;
    const [px, py] = at.S([mid[0] + w[0] * reach, mid[1] + w[1] * reach, 0]);
    disc(ly.floorLit, px, py, 4 + 8 * q, q > 0.6 ? 2 : 1, 0.5);
    const n = Math.round(4 + 10 * q);
    for (let j = 0; j < n; j++) {
      const g = at.grip[j % at.grip.length];
      const a = hash(j * 3 + 1) * Math.PI * 2;
      const r = 6 + 16 * hash(j * 5 + 2);
      const hop = Math.abs(Math.sin((f * 0.55 + hash(j * 7)) * Math.PI)) * (1 + 6 * q);
      const [gx, gy] = at.S([g[0] + Math.cos(a) * r, g[1] + Math.sin(a) * r, 0]);
      ly.behind.stone.put(gx, gy - hop, 2);
      ly.behind.stone.put(gx + 1, gy - hop, 1);
      ly.behind.stone.put(gx, gy - hop + 1, 1);
    }
  }
}

/** How many frames what it leaves where it took off lasts, from the blast. */
export const LAUNCH_N = 42;
/** How far its take-off's ring of dust is blown out (tiles), and its scorch (tiles round). */
export const LAUNCH_FX = { ring: 1.8, scorch: 0.6 };

/**
 * WHERE IT TOOK OFF, `k` frames after the blast, at `c` (where its column drove into the floor; the take-off floor point at
 * the origin): a scorch with glowing cracks, cooling; a white flash; fire splashed out over the floor; a ring of dust blown
 * out; stone flung; a column of smoke rolling up and thinning. `a` is the layer it is laid in (behind or over the Golem).
 */
export function launchFx(ly: RocketLayers, a: AirLayer, S: (p: V3) => [number, number], c: V3, k: number, seed: number): void {
  if (k < 0 || k >= LAUNCH_N) return;
  const t = k / 30;
  const [x, y] = S([c[0], c[1], 0]);
  // (the scorch: ragged and black, its cracks glowing cyan and cooling, fading away at the end)
  const sr = LAUNCH_FX.scorch * T;
  const gone = Math.max(0, (k - (LAUNCH_N - 12)) / 12);
  for (let yy = -sr; yy <= sr; yy += 1) {
    for (let xx = -sr; xx <= sr; xx += 1) {
      const d = Math.hypot(xx, yy) / sr + (noise2((c[0] + xx) * 0.09 + seed, (c[1] + yy) * 0.09) - 0.5) * 0.6;
      if (d > 1 - gone) continue;
      const [px, py] = S([c[0] + xx, c[1] + yy, 0]);
      ly.floor.put(px, py, d < 0.4 ? 0 : d < 0.72 ? 1 : 2);
    }
  }
  const heat = k < 6 ? 3 : k < 14 ? 2 : k < 26 ? 1 : 0;
  if (heat) {
    for (let i = 0; i < 8; i++) {
      const an = (i / 8) * Math.PI * 2 + hash(seed + i) * 0.6;
      const len = sr * (0.8 + 0.6 * hash(seed * 3 + i)) * (1 - gone);
      for (let r = 2; r < len; r += 1) {
        const jag = (noise2(r * 0.14 + i * 5, seed) - 0.5) * 8;
        const [px, py] = S([c[0] + Math.cos(an) * r - Math.sin(an) * jag, c[1] + Math.sin(an) * r + Math.cos(an) * jag, 0]);
        ly.floorLit.put(px, py, r < len * 0.5 ? heat : Math.max(1, heat - 1));
      }
    }
  }
  // (the flash, the first two frames)
  if (k < 2) disc(a.l, x, y - 6, k === 0 ? 30 : 20, 3, 0.62);
  // (fire splashed out over the floor where the column drove into it)
  if (k < 7) {
    const left = 1 - k / 7;
    const tongues: [number, number, number][] = [[0, 0, 7], [-16, 3, 5], [16, 3, 5], [-8, -3, 4.5], [9, -3, 4.5], [-28, 7, 3.2], [28, 7, 3.2]];
    tongues.forEach(([dx, dy, size], i) => fire(a.l, x + dx * (1 + k * 0.25), y + dy * (1 + k * 0.2) - 2, size * left * (0.85 + 0.3 * hash(seed + i)), t + i * 0.37, dx * 0.02));
  }
  // (THE RING OF DUST blown out over the floor: a ring of light the first frames, its dust rolling after it)
  if (k < 14) {
    const u = Math.min(1, (k + 1) / 9);
    const r = LAUNCH_FX.ring * T * (1 - (1 - u) * (1 - u));
    if (k < 2) {
      const n = Math.max(24, Math.round(r * 1.2));
      for (let i = 0; i < n; i++) {
        const an = (i / n) * Math.PI * 2;
        const p = S([c[0] + Math.cos(an) * r, c[1] + Math.sin(an) * r, 0]);
        const q = S([c[0] + Math.cos(an + (Math.PI * 2) / n) * r, c[1] + Math.sin(an + (Math.PI * 2) / n) * r, 0]);
        line(a.l, p[0], p[1] - 1, q[0], q[1] - 1, k < 1 ? 2 : 1, 1);
      }
    }
    for (let i = 0; i < 22; i++) {
      const an = (i / 22) * Math.PI * 2 + hash(seed + i) * 0.25;
      const [px, py] = S([c[0] + Math.cos(an) * r * 0.96, c[1] + Math.sin(an) * r * 0.96, 0]);
      const rr = (5 + k * 1.0) * (0.8 + 0.4 * hash(seed * 5 + i));
      cloud(a.st, px, py + 1, 2.2 * rr, 1.3 * rr, t + i * 0.2, Math.min(1, 0.05 + k / 14), 7600 + seed + i);
    }
  }
  // (stone flung up and falling back)
  if (k < 24) {
    chips(a.stone, a.l, x - 8, y, k, seed);
    chips(a.stone, a.l, x + 9, y + 2, k, seed + 5);
  }
  // (its smoke: a column rolling up out of the scorch, thinning)
  if (k >= 1) {
    const left = (k - 1) / (LAUNCH_N - 2);
    for (let i = 0; i < 6; i++) {
      const upk = 6 + i * 7 + k * (0.9 + 0.14 * i);
      const wide = 9 + i * 2.4 + k * 0.45;
      const sway = Math.sin(t * 2 + i) * 3 + (hash(seed + i) - 0.5) * 10;
      cloud(a.sm, x + sway, y - upk, 2 * wide, 1.5 * wide, t + i * 0.3, Math.min(1, 0.04 + left * 1.05 + i * 0.03), 7700 + seed + i);
    }
  }
}

/** How many frames its landing's crater and dust last, from the slam (the crater fading over its last LAND_FADE). */
export const LAND_N = 60;
export const LAND_FADE = 16;
/** How far its landing's ring of dust is blown out (tiles), and its crater (tiles round). */
export const LAND_FX = { ring: 2.0, crater: 0.75, cracks: 1.5 };

/**
 * WHERE IT LANDS, `k` frames after the slam, round `c` (between its feet and its fist, on the floor): the floor cracked open
 * in a crater, its cracks running out; a ring of dust blown out over the floor; stone flung up and falling back; dust
 * billowing up and settling.
 */
export function landFx(ly: RocketLayers, a: AirLayer, S: (p: V3) => [number, number], c: V3, k: number, seed: number): void {
  if (k < 0 || k >= LAND_N) return;
  const t = k / 30;
  const [x, y] = S([c[0], c[1], 0]);
  const gone = Math.max(0, (k - (LAND_N - LAND_FADE)) / LAND_FADE);
  // (THE CRATER: a dented round, its lip of broken stone, opening in the first frames)
  const open = Math.min(1, (k + 1) / 3);
  const cr = LAND_FX.crater * T * (0.6 + 0.4 * open);
  for (let yy = -cr - 3; yy <= cr + 3; yy += 1) {
    for (let xx = -cr - 3; xx <= cr + 3; xx += 1) {
      const d = Math.hypot(xx, yy) / cr + (noise2((c[0] + xx) * 0.1 + seed, (c[1] + yy) * 0.1) - 0.5) * 0.5;
      if (d > 1.12 - gone * 1.12) continue;
      const [px, py] = S([c[0] + xx, c[1] + yy, 0]);
      if (d > 0.92) ly.floorStone.put(px, py, yy < 0 ? 2 : 3);
      else ly.floor.put(px, py, d < 0.45 ? 1 : d < 0.75 ? 2 : 3);
    }
  }
  // (its cracks: jagged, out from the crater's middle across the floor, opened in a flash)
  const cl = LAND_FX.cracks * T * Math.min(1, (k + 1) / 2) * (1 - gone);
  for (let i = 0; i < 9; i++) {
    const an = (i / 9) * Math.PI * 2 + hash(seed + i) * 0.5;
    const len = cl * (0.55 + 0.45 * hash(seed * 3 + i));
    for (let r = cr * 0.4; r < len; r += 0.8) {
      const jag = (noise2(r * 0.11 + i * 7, seed) - 0.5) * 10;
      const p: V3 = [c[0] + Math.cos(an) * r - Math.sin(an) * jag, c[1] + Math.sin(an) * r + Math.cos(an) * jag, 0];
      const [px, py] = S(p);
      ly.floor.put(px, py, 0);
      ly.floor.put(px + 1, py, 0);
      if (r < len * 0.6) ly.floor.put(px, py + 1, 0);
      ly.floorStone.put(px, py - 1, 2);
      ly.floorStone.put(px + 1, py - 1, 2);
      // (a branch off it)
      if (i % 2 === 0 && r > len * 0.45 && r < len * 0.75) {
        const b = r - len * 0.45;
        const [qx, qy] = S([p[0] + Math.cos(an + 0.9) * b, p[1] + Math.sin(an + 0.9) * b, 0]);
        ly.floor.put(qx, qy, 0);
        ly.floorStone.put(qx, qy - 1, 1);
      }
    }
  }
  // (the blow: a flash of white dust)
  if (k < 2) {
    for (let i = 0; i < 9; i++) {
      const an = (i / 9) * Math.PI * 2;
      const [px, py] = S([c[0] + Math.cos(an) * cr * 0.8, c[1] + Math.sin(an) * cr * 0.8, 0]);
      cloud(a.st, px, py, 16 - k * 3, 10 - k * 2, t + i, k * 0.2, 7800 + seed + i, 1);
    }
  }
  // (THE RING OF DUST blown out over the floor)
  if (k < 18) {
    const u = Math.min(1, (k + 1) / 10);
    const r = LAND_FX.ring * T * (1 - (1 - u) ** 2.2);
    for (let i = 0; i < 24; i++) {
      const an = (i / 24) * Math.PI * 2 + hash(seed + i) * 0.2;
      const [px, py] = S([c[0] + Math.cos(an) * r, c[1] + Math.sin(an) * r, 0]);
      const rr = (3 + k * 0.75) * (0.8 + 0.4 * hash(seed * 5 + i));
      cloud(a.st, px, py + 1, 2.4 * rr, 1.3 * rr, t + i * 0.2, Math.min(1, 0.05 + k / 18), 7900 + seed + i);
    }
  }
  // (stone flung up out of it and falling back; the big chunks of its lip)
  if (k < 26) {
    chips(a.stone, a.l, x - 12, y - 1, k, seed);
    chips(a.stone, a.l, x + 13, y + 1, k, seed + 7);
    chips(a.stone, a.l, x, y + 4, k, seed + 13);
  }
  // (dust billowing up round it and settling)
  if (k >= 1 && k < 44) {
    for (let i = 0; i < 7; i++) {
      const an = (i / 7) * Math.PI * 2 + 0.4;
      const out = cr * (0.8 + 0.5 * (1 - Math.exp(-k / 5)));
      const [px, py] = S([c[0] + Math.cos(an) * out, c[1] + Math.sin(an) * out, 0]);
      const rr = (5 + k * 0.4) * (0.8 + 0.4 * hash(seed * 9 + i));
      cloud(a.st, px, py - k * 0.35, 2.2 * rr, 1.6 * rr, t + i * 0.3, Math.min(1, 0.12 + k / 44), 8000 + seed + i);
    }
  }
}

/** How many frames a puff of its trail lives. */
export const PUFF_LIFE = 22;
/** A PUFF of the smoke its flames shed, `age` frames old, at (x, y): small and dense, spreading, rising, thinning away; a fleck of light in it while young. */
export function puffFx(a: AirLayer, x: number, y: number, age: number, seed: number): void {
  if (age < 0 || age >= PUFF_LIFE) return;
  const t = age / 30;
  const r = 5 + age * 0.55;
  cloud(a.st, x + Math.sin(seed + age * 0.2) * 1.5, y - age * 0.5, 2 * r, 1.6 * r, t + seed, Math.min(1, 0.04 + (age / PUFF_LIFE) * 1.0), 8200 + seed);
  if (age < 4) {
    a.l.put(x + (hash(seed) - 0.5) * 4, y - r * 0.6, 3 - Math.min(2, age));
    a.l.put(x + (hash(seed) - 0.5) * 4 + 1, y - r * 0.6, 2 - Math.min(1, age >> 1));
  }
}

/** Where its trail's puffs are born, `k` frames into its flight (0 none): out of each stack's fire, two a frame while it rides them, one as they sputter. */
export function puffsBorn(k: number): number[] {
  if (k < 1) return [];
  if (k <= 11) return [0, 1];
  if (k <= 16) return [k % 2];
  return [];
}

/** How high it is drawn (picture pixels) at frame `f` of the jump (rocketUp in picture pixels). */
export function liftOf(f: number): number {
  return f >= ROCKET.blast && f < ROCKET.land ? Math.round(rocketUp(f - ROCKET.blast) * ROCKET_GRAIN) : 0;
}
