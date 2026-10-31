// THE GOLEM'S CHARGED SHOTS, WHAT THEY THROW OFF (the art chat, 31 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His words, 31 Oct, 00:00: “Also draw a hold for the big charged shot.”; offered the braced huge shell or the charged beam:
// “Damn I want both.” Its moves are dev/golem_moves.ts golemChargeShell and golemChargeBeam (the brace, the charge held as a
// loop, the strike, the recoil); here is what they throw off, by his art rulebook (Movement 9: the charge big and held, the
// strike a flash, smeared; Effects big and wild; everything that glows the friend's cyan, it is a friend: no pink, no gold).
//
// CHARGING (both): light gathering at its gun's mouth, motes of the friend's cyan drawn spiralling into it, more and brighter
// as it charges; steam jetting from its vents and hissing up out of its stacks, harder and harder; a flash at its full. Held at
// its full, all of it a loop of GCHARGE.round frames, each round the same.
// THE CANNON'S SHELL: one huge shell out of its mouth in a great cyan burst, a ring of air blown out round it; the shell, iron
// banded in cyan, streaking across the floor smeared out behind it, a trail of cyan after it, dropping as it goes; where it
// lands, A WIDE BLAST (SHELL_FX.blast tiles round): a white-hot flash, a dome of cyan fire boiling up, a ring of light and
// dust racing out over the floor to the blast's edge, stone flung up, a column of smoke, a scorch left glowing and cooling,
// gone when done. Its recoil: steam bursting out of its stacks, dust kicked up as it skids back; smoke curling out of its
// barrel, its vents cooling.
// THE TESLA COIL'S BEAM: arcs crawling up its coil, brighter and brighter, crackling round its ball; then a THICK BEAM blazing
// out of its ball to its full length (BEAM_FX.long tiles) in a frame, white-hot at its heart, cyan round it, its edge
// writhing, arcs coiling along it, a splash of light where it ends; held so, crackling, through a whole line of them; then
// thinning to threads and gone; the coil spitting and smoking as it cools.

import { Px } from '../engine/px';
import type { V3 } from '../art/skeleton';
import { UNITS_PER_TILE } from '../art/moves3';
import { GUN_GLOW, IRON, SMOKE, bolt, crackle, impactBurst } from './golem_gun_fx';
import { STEAM } from './golem_pound_fx';
import { CHIP, SCORCH, chips } from './blast_fx';
import { Light, cloud, fire } from './warlock_fx';
import { noise2 } from './sculpt_warlock';
import { GCHARGE, GCHARGE_BEAM, chargeOf } from './golem_moves';

export { GUN_GLOW, IRON, SMOKE, STEAM, CHIP, SCORCH };

/**
 * THE SHELL: how fast it flies (tiles a second; its old shot's 16), and THE BLAST where it lands: its radius (tiles), and how
 * long it takes, flash to gone (frames). Its flight from the muzzle to where it lands: SHELL_FX.speed; drawn so.
 */
export const SHELL_FX = { speed: 20, blast: 2.5, long: 40 };
/**
 * THE BEAM: how long (tiles, from its ball), how wide a band of the floor it strikes (tiles across), and how thick it is
 * drawn at its full (tiles: its white heart and cyan body; its arcs and its writhing edge a little beyond); at its full from
 * GCHARGE.fire to GCHARGE_BEAM.held, thinning out to gone at GCHARGE_BEAM.gone (frames).
 */
export const BEAM_FX = { long: 8, wide: 1.0, drawn: 0.55 };

const hash = (i: number): number => {
  const x = Math.sin(i * 57.31 + 23.7) * 43758.5453;
  return x - Math.floor(x);
};

/** What a charged shot paints, each laid in its own colours: on the floor (its scorch, its light), and in the air (smoke, steam, stone, iron, light). */
export interface ChargeLayers {
  floor: Light;
  floorLit: Light;
  sm: Light;
  st: Light;
  stone: Light;
  iron: Light;
  l: Light;
}
export function chargeLayers(): ChargeLayers {
  return { floor: new Light(), floorLit: new Light(), sm: new Light(), st: new Light(), stone: new Light(), iron: new Light(), l: new Light() };
}
/** What is on the floor, under what stands on it: its scorch, and the light of it. */
export function layFloor(w: number, h: number, ly: ChargeLayers): Px {
  const out = new Px(w, h);
  ly.floor.lay(out, SCORCH);
  ly.floorLit.lay(out, GUN_GLOW);
  return out;
}
/** What is in the air, over what stands: its smoke, its steam, its stone, its iron, its light, laid in that order. */
export function layAir(w: number, h: number, ly: ChargeLayers): Px {
  const out = new Px(w, h);
  ly.sm.lay(out, SMOKE);
  ly.st.lay(out, STEAM);
  ly.stone.lay(out, CHIP);
  ly.iron.lay(out, IRON);
  ly.l.lay(out, GUN_GLOW);
  return out;
}

/** Where a charged shot is, at a frame of it: on the picture through `S`, from where it is in the world (as the Golem was built, turned, and set on the floor). */
export interface ChargeAt {
  /** A point of the world to the picture. */
  S: (p: V3) => [number, number];
  /** Its gun's mouth and the way it points, as drawn this frame. */
  muzzle: V3;
  way: V3;
  /** Its vents and the way each blows; its stacks' mouths; its feet and its braced fist on the floor (for the dust of its skid). */
  vents: V3[];
  ventWays: V3[];
  stacks: V3[];
  grip: V3[];
  /** Its gun's mouth as it fired (the shell flies from there). */
  fired: V3;
  /** Where the shell lands (on the floor); or where the beam ends. */
  aim: V3;
}

const lerp = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
/** A line of light from (x0, y0) to (x1, y1), `k` bright, `w` across. */
function line(l: Light, x0: number, y0: number, x1: number, y1: number, k: number, w = 1): void {
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    const y = y0 + ((y1 - y0) * i) / n;
    for (let a = 0; a < w; a++) for (let b = 0; b < w; b++) l.put(x + a - (w >> 1), y + b - (w >> 1), k);
  }
}
/** A round of light at (x, y), `r` across, `top` at its heart, fading to its edge. */
function disc(l: Light, x: number, y: number, r: number, top = 3, squash = 1): void {
  for (let yy = Math.floor(-r * squash); yy <= Math.ceil(r * squash); yy++) {
    for (let xx = Math.floor(-r); xx <= Math.ceil(r); xx++) {
      const d = Math.hypot(xx, yy / squash) / Math.max(0.5, r);
      if (d > 1) continue;
      l.put(x + xx, y + yy, Math.max(0, Math.min(top, Math.round(top - d * top * 0.9))));
    }
  }
}
/** A unit on the picture: the way `w` (a way in the world) goes from `p`. */
function onPicture(S: (p: V3) => [number, number], p: V3, w: V3): [number, number] {
  const a = S(p);
  const b = S([p[0] + w[0] * 10, p[1] + w[1] * 10, p[2] + w[2] * 10]);
  const n = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [(b[0] - a[0]) / n, (b[1] - a[1]) / n];
}

// ---- CHARGING (both) -----------------------------------------------------------------------------------------------

/** Where a frame of the charge falls in its round (0 to 1): the same each round, the build-up in step with the loop. */
const phaseOf = (f: number): number => ((((f - GCHARGE.loop) % GCHARGE.round) + GCHARGE.round) % GCHARGE.round) / GCHARGE.round;
/**
 * STEAM OUT OF ITS GUN'S VENTS: off, at his word on the first pictures, 31 Oct:
 * “I don’t like the steam coming from the gun.  I like it from the stove pipes that’s nice”. Its stacks (the stove pipes on its back) still hiss as it charges and burst as
 * it fires; its gun's vents are quiet.
 */
export const GUN_STEAM = { on: false };

/** The time the charge's smoke and steam are drawn at: its round's own, so each round of the loop is the same. */
const roundT = (f: number): number => (f < GCHARGE.aimed ? f / 30 : phaseOf(f) * (GCHARGE.round / 30));

/**
 * THE CHARGE GATHERING at its gun's mouth (x, y), charged `c` (0 to 1), at frame `f`: a halo growing and pulsing, motes of
 * light drawn spiralling in to it from further and further out, more and brighter.
 */
export function gather(l: Light, x: number, y: number, c: number, f: number, seed: number): void {
  if (c <= 0) return;
  const ph = phaseOf(f);
  const pulse = 0.5 + 0.5 * Math.cos(ph * Math.PI * 4);
  disc(l, x, y, 3 + 6.5 * c + 2 * pulse * c, c > 0.5 ? 3 : 2);
  const n = Math.round(4 + 16 * c);
  for (let i = 0; i < n; i++) {
    // (each mote drawn in over a round, a new one where it began; spiralling, streaking as it comes)
    const q = (ph + i / n) % 1;
    const a0 = hash(seed + i) * Math.PI * 2;
    const R = (12 + 34 * c) * (0.65 + 0.55 * hash(seed * 3 + i));
    const at = (qq: number): [number, number] => {
      const r = R * (1 - qq);
      const a = a0 + qq * 2.0;
      return [x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8];
    };
    const [px, py] = at(q);
    const [bx, by] = at(Math.max(0, q - 0.16));
    const k = q > 0.55 ? 3 : q > 0.2 ? 2 : 1;
    line(l, bx, by, px, py, Math.max(1, k - 1), 1);
    l.put(px, py, k);
    l.put(px + 1, py, k);
    l.put(px, py + 1, Math.max(1, k - 1));
  }
}
/**
 * ITS POWER ON THE FLOOR round its feet (x, y) as it charges `c` (0 to 1), at frame `f`: a ring of the friend's cyan
 * running round it, brighter as it charges, `rx` and `ry` across; and grit of the floor hopping up round it.
 */
export function floorPower(fl: Light, stone: Light, S: (p: V3) => [number, number], c0: V3, c: number, f: number, seed: number): void {
  if (c <= 0) return;
  const ph = phaseOf(f);
  const R = UNITS_PER_TILE * (0.95 + 0.1 * Math.sin(ph * Math.PI * 4));
  const n = 64;
  for (let i = 0; i < n; i++) {
    // (a dashed ring, its dashes running round it, more of it lit as it charges)
    const a = (i / n) * Math.PI * 2;
    if ((i + Math.floor(ph * 8)) % 4 === 3) continue;
    if (hash(seed + i) > 0.25 + 0.75 * c) continue;
    const [px, py] = S([c0[0] + Math.cos(a) * R, c0[1] + Math.sin(a) * R, 0]);
    fl.put(px, py, c > 0.45 ? 2 : 1);
    fl.put(px + 1, py, 1);
  }
  // (grit hopping up off the floor round it, higher as it charges)
  const m = Math.round(4 + 8 * c);
  for (let i = 0; i < m; i++) {
    const a = hash(seed * 5 + i) * Math.PI * 2;
    const r = UNITS_PER_TILE * (0.5 + 0.7 * hash(seed * 7 + i));
    const hop = Math.abs(Math.sin((ph * 2 + hash(seed * 11 + i)) * Math.PI)) * (1 + 5 * c);
    const [px, py] = S([c0[0] + Math.cos(a) * r, c0[1] + Math.sin(a) * r, 0]);
    stone.put(px, py - hop, 2);
    stone.put(px + 1, py - hop, 1);
    stone.put(px, py - hop + 1, 1);
  }
}
/** STEAM JETTING out of a vent at (x, y) the way (dx, dy) on the picture, `hard` 0 to 1, at frame `f` (each round the same). */
export function jet(st: Light, x: number, y: number, dx: number, dy: number, hard: number, f: number, seed: number): void {
  if (hard <= 0) return;
  const n = 3 + Math.round(hard * 3);
  const t = roundT(f);
  for (let i = 0; i < n; i++) {
    const age = (phaseOf(f) * GCHARGE.round + i * (GCHARGE.round / n)) % GCHARGE.round;
    const out = 2 + age * (4 + 6 * hard);
    const r = (3 + age * 1.5) * (0.6 + 0.7 * hard);
    cloud(st, x + dx * out, y + dy * out - age * 0.8, 2 * r, 1.5 * r, t + i * 0.2, Math.min(1, 0.05 + age / (GCHARGE.round + 0.5)), 6000 + seed + i);
  }
}
/** Steam hissing straight up out of a stack's mouth at (x, y), `hard` 0 to 1, at frame `f` (each round the same). */
export function stackHiss(st: Light, x: number, y: number, hard: number, f: number, seed: number): void {
  if (hard <= 0) return;
  const n = 3 + Math.round(hard * 2);
  const t = roundT(f);
  for (let i = 0; i < n; i++) {
    const age = (phaseOf(f) * GCHARGE.round + i * (GCHARGE.round / n)) % GCHARGE.round;
    const r = (3 + age * 1.3) * (0.6 + 0.6 * hard);
    cloud(st, x + Math.sin(i * 2.1 + seed) * 1.2, y - 2 - age * (2.2 + 3.4 * hard), 2 * r, 1.6 * r, t + i * 0.3, Math.min(1, 0.08 + age / (GCHARGE.round + 0.5)), 6500 + seed + i);
  }
}
/** THE FLASH AT ITS FULL round (x, y), `k` frames after: a star of rays and a ring of light blown out, gone in three frames. */
export function fullFlash(l: Light, x: number, y: number, k: number, seed: number): void {
  if (k < 0 || k > 2) return;
  const big = k === 0 ? 1 : k === 1 ? 0.75 : 0.45;
  disc(l, x, y, 11 * big, 3);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + hash(seed + i) * 0.3;
    const len = (24 + 18 * hash(seed * 3 + i)) * big;
    line(l, x, y, x + Math.cos(a) * len, y + Math.sin(a) * len * 0.8, k === 0 ? 2 : 1, 1);
    line(l, x, y, x + Math.cos(a) * len * 0.45, y + Math.sin(a) * len * 0.36, 3, 1);
  }
  const R = 12 + k * 10;
  const n = Math.round(R * 5);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    l.put(x + Math.cos(a) * R, y + Math.sin(a) * R * 0.8, k === 0 ? 3 : k === 1 ? 2 : 1);
  }
}
/** Arcs CRAWLING UP ITS COIL from its foot (x0, y0) to its tip (x1, y1), charged `c`: up as far as it is charged, more and brighter, broken anew each frame. */
export function coilArcs(l: Light, x0: number, y0: number, x1: number, y1: number, c: number, f: number, seed: number): void {
  if (c <= 0) return;
  const n = 1 + Math.round(4 * c);
  const ph = phaseOf(f);
  const top = Math.min(1, c * 1.05);
  for (let i = 0; i < n; i++) {
    // (each crawling up the coil over a round, from its foot to as high as it is charged)
    const q = ((ph + i / n) % 1) * top;
    const ax = x0 + (x1 - x0) * q;
    const ay = y0 + (y1 - y0) * q;
    const side = i % 2 ? 1 : -1;
    const nx = -(y1 - y0);
    const ny = x1 - x0;
    const nl = Math.hypot(nx, ny) || 1;
    const span = 5 + 3 * c;
    const e0: [number, number] = [ax + (nx / nl) * span * side, ay + (ny / nl) * span * side];
    const e1: [number, number] = [ax - (nx / nl) * span * side * 0.6 + (x1 - x0) * 0.12, ay - (ny / nl) * span * side * 0.6 + (y1 - y0) * 0.12];
    bolt(l, e0[0], e0[1], e1[0], e1[1], seed + i * 31 + Math.floor(ph * GCHARGE.round) * 7, c > 0.7 ? 0 : 1);
  }
}

/** The light, smoke and steam of a charge at frame `f` (before it fires): its gather, its vents and stacks, its arcs, its flash. */
function charging(kind: 'shell' | 'beam', ly: ChargeLayers, at: ChargeAt, f: number): void {
  const C = GCHARGE;
  // (held at its full, each round the same)
  const c = chargeOf(kind, f < C.loop ? f : C.loop + ((f - C.loop) % C.round));
  const m = at.S(at.muzzle);
  const [dx, dy] = onPicture(at.S, at.muzzle, at.way);
  const mouth: [number, number] = [m[0] + dx * (kind === 'shell' ? 2 : 0), m[1] + dy * (kind === 'shell' ? 2 : 0)];
  if (f >= C.aimed) gather(ly.l, mouth[0], mouth[1], c, f, kind === 'shell' ? 11 : 13);
  if (f >= C.aimed && at.grip.length) {
    const mid: V3 = [at.grip.reduce((a, p) => a + p[0], 0) / at.grip.length, at.grip.reduce((a, p) => a + p[1], 0) / at.grip.length, 0];
    floorPower(ly.floorLit, ly.stone, at.S, mid, c, f, 70);
  }
  // (its vents jetting steam, its stacks hissing, harder and harder)
  const hard = f < C.aimed ? 0 : Math.min(1, 0.25 + 0.75 * c);
  for (let i = 0; i < (GUN_STEAM.on ? Math.min(2, at.vents.length) : 0); i++) {
    const v = at.S(at.vents[i]);
    const [vx, vy] = onPicture(at.S, at.vents[i], at.ventWays[i]);
    jet(ly.st, v[0], v[1], vx, vy, hard, f, 31 * (i + 1));
  }
  at.stacks.forEach((p, i) => {
    const s = at.S(p);
    stackHiss(ly.st, s[0], s[1], hard * 0.9, f, 17 * (i + 1));
  });
  if (kind === 'beam' && at.vents.length >= 4) {
    const a = at.S(at.vents[2]);
    const b = at.S(at.vents[3]);
    coilArcs(ly.l, a[0], a[1], b[0], b[1], c, f, 400);
    if (c > 0.3) crackle(ly.l, m[0], m[1], 7 + 9 * c, 1 + Math.round(3 * c), 900 + Math.floor(phaseOf(f) * GCHARGE.round));
  }
  fullFlash(ly.l, mouth[0], mouth[1], f - C.full, kind === 'shell' ? 5 : 9);
}

// ---- THE CANNON'S SHELL ---------------------------------------------------------------------------------------------

/** How many frames the shell flies from its mouth to where it lands. */
export function shellFlight(at: ChargeAt): number {
  const d = Math.hypot(at.aim[0] - at.fired[0], at.aim[1] - at.fired[1]) / UNITS_PER_TILE;
  return Math.max(2, Math.round((d / SHELL_FX.speed) * 30));
}
/** Where the shell is `u` of its flight (0 its mouth, 1 where it lands): straight out of the level barrel, dropping as it goes. */
function shellAt(at: ChargeAt, u: number): V3 {
  const p = lerp(at.fired, at.aim, u);
  return [p[0], p[1], at.fired[2] * (1 - u * u) + at.aim[2] * u * u];
}
/** THE HUGE SHELL at (x, y) flying the way (dx, dy) on the picture: iron, long, banded in the friend's cyan, its nose lit. */
function shellSprite(l: Light, iron: Light, x: number, y: number, dx: number, dy: number): void {
  const len = 13;
  const r = 7.2;
  for (let yy = -20; yy <= 20; yy++) {
    for (let xx = -20; xx <= 20; xx++) {
      const along = xx * dx + yy * dy;
      const across = -xx * dy + yy * dx;
      // (a round body, a rounded nose ahead, its base flat behind)
      const t = Math.max(-len, Math.min(len * 0.5, along));
      const d = Math.hypot(along - t, across);
      const nose = along > len * 0.5 ? Math.hypot((along - len * 0.5) * 1.15, across) : d;
      if (Math.max(d, nose) > r || along < -len - 0.5) continue;
      // (a band of cyan round its middle; its lit top; its dark underside)
      if (Math.abs(along + 2) < 1.6 || Math.abs(along + 8) < 1.1) {
        l.put(x + xx, y + yy, across < -1.5 ? 3 : 2);
        continue;
      }
      iron.put(x + xx, y + yy, across < -4 ? 3 : across < 0.5 ? 2 : across < 4.5 ? 1 : 0);
    }
  }
  // (its glowing nose)
  disc(l, x + dx * (len * 0.5 + 5), y + dy * (len * 0.5 + 5), 2.2, 3);
}
/**
 * THE SHELL IN FLIGHT, `k` frames after it fired (its flight `n` frames): the shell, after-images of it smeared back along
 * its way, and a trail of cyan behind those, thinning and gone a few frames after it lands.
 */
function shellFlightFx(ly: ChargeLayers, at: ChargeAt, k: number, n: number): void {
  if (k < 0 || k > n + 3) return;
  const u = Math.min(1, (k + 1) / n);
  const now = at.S(shellAt(at, u));
  const ahead = at.S(shellAt(at, Math.min(1, u + 0.02)));
  const back = at.S(shellAt(at, Math.max(0, u - 0.02)));
  let dx = ahead[0] - back[0];
  let dy = ahead[1] - back[1];
  const dn = Math.hypot(dx, dy) || 1;
  dx /= dn;
  dy /= dn;
  // (its trail: from its mouth, or from a little way behind it, to it; bright behind it, thinning)
  const tail = Math.max(0, u - 0.7);
  const fade = k >= n ? (k - n + 1) / 4 : 0;
  const steps = 24;
  for (let i = 0; i < steps; i++) {
    const a = tail + ((u - tail) * i) / steps;
    const b = tail + ((u - tail) * (i + 1)) / steps;
    const p = at.S(shellAt(at, a));
    const q = at.S(shellAt(at, b));
    const near = i / steps;
    if (near < fade) continue;
    const w = near > 0.75 ? 9 : near > 0.45 ? 7 : near > 0.2 ? 5 : 3;
    line(ly.l, p[0], p[1], q[0], q[1], 1, w);
    if (near > 0.25 && fade < 0.5) line(ly.l, p[0], p[1], q[0], q[1], 2, w - 3);
    if (near > 0.6 && fade < 0.5) line(ly.l, p[0], p[1], q[0], q[1], 3, 2);
  }
  if (k >= n) return;
  // (THE SMEAR: after-images of it back along its way, the furthest dimmest)
  for (const [g, lv] of [[0.2, 1], [0.13, 1], [0.07, 2]] as const) {
    const p = at.S(shellAt(at, Math.max(0, u - g)));
    disc(ly.l, p[0], p[1], 7.5, lv);
  }
  shellSprite(ly.l, ly.iron, now[0], now[1], dx, dy);
}
/** THE HUGE MUZZLE BURST out of its mouth (x, y) the way (dx, dy), `k` frames after it fired: a white heart, long cyan tongues, a ring of air blown out round it. */
function bigBurst(l: Light, x: number, y: number, dx: number, dy: number, k: number, seed: number): void {
  if (k < 0 || k > 4) return;
  const big = [1, 0.8, 0.55, 0.3, 0.15][k];
  disc(l, x + dx * 6, y + dy * 6, 11 * big, 3);
  const rays = 13;
  for (let i = 0; i < rays; i++) {
    const spread = ((i / (rays - 1)) * 2 - 1) * 1.35;
    const a = Math.atan2(dy, dx) + spread + (hash(seed + i) - 0.5) * 0.2;
    const len = (10 + 36 * (1 - Math.abs(spread) / 1.35) + 8 * hash(seed * 3 + i)) * big;
    const ex = x + Math.cos(a) * len;
    const ey = y + Math.sin(a) * len;
    line(l, x, y, ex, ey, 1, 3);
    line(l, x, y, x + (ex - x) * 0.65, y + (ey - y) * 0.65, 2, 2);
    line(l, x, y, x + (ex - x) * 0.35, y + (ey - y) * 0.35, 3, 2);
  }
  // (a ring of air blown out round its mouth, square to its way)
  if (k < 4) {
    const R = 7 + k * 7;
    const n = Math.round(R * 6);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const c = Math.cos(a) * 0.35;
      const s = Math.sin(a);
      const px = x + dx * (8 + k * 5) + dx * c * R - dy * s * R;
      const py = y + dy * (8 + k * 5) + dy * c * R + dx * s * R;
      l.put(px, py, k < 2 ? 2 : 1);
    }
  }
}
/**
 * THE WIDE BLAST where it lands (at, on the floor), `k` frames on: a white-hot flash; a dome of cyan fire boiling up; a
 * ring of light and dust racing out over the floor to its edge (SHELL_FX.blast tiles); stone flung up; a column of smoke
 * rolling up; a scorch on the floor, its cracks glowing, cooling, fading. All gone at SHELL_FX.long.
 */
export function wideBlast(ly: ChargeLayers, S: (p: V3) => [number, number], c: V3, k: number, t: number, seed: number): void {
  if (k < 0 || k >= SHELL_FX.long) return;
  const R = SHELL_FX.blast * UNITS_PER_TILE;
  const [x, y] = S([c[0], c[1], 0]);
  const ring = (r: number): [number, number][] => {
    const pts: [number, number][] = [];
    const n = Math.max(24, Math.round(r * 0.9));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push(S([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, 0]));
    }
    return pts;
  };
  // (the scorch: a ragged black round on the floor, a third of the blast across, its cracks glowing and cooling; fading away at the end)
  if (k >= 1) {
    const gone = Math.max(0, (k - (SHELL_FX.long - 12)) / 12);
    const sr = R * 0.42;
    const step = 2;
    for (let yy = -sr; yy <= sr; yy += step * 0.5) {
      for (let xx = -sr; xx <= sr; xx += step * 0.5) {
        const d = Math.hypot(xx, yy) / sr + (noise2((c[0] + xx) * 0.08 + seed, (c[1] + yy) * 0.08) - 0.5) * 0.55;
        if (d > 1 - gone) continue;
        const [px, py] = S([c[0] + xx, c[1] + yy, 0]);
        ly.floor.put(px, py, d < 0.45 ? 0 : d < 0.75 ? 1 : 2);
      }
    }
    const heat = k < 8 ? 3 : k < 18 ? 2 : k < SHELL_FX.long - 8 ? 1 : 0;
    if (heat > 0) {
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2 + hash(seed + i) * 0.5;
        const len = sr * (0.75 + 0.5 * hash(seed * 3 + i)) * (1 - gone);
        for (let r = 3; r < len; r += 1) {
          const jag = (noise2(r * 0.12 + i * 5, seed) - 0.5) * 9;
          const [px, py] = S([c[0] + Math.cos(a) * r - Math.sin(a) * jag, c[1] + Math.sin(a) * r + Math.cos(a) * jag, 0]);
          ly.floorLit.put(px, py, r < len * 0.45 ? heat : Math.max(1, heat - 1));
        }
      }
    }
  }
  // (the flash: a great white round over it all, the first two frames)
  if (k < 2) {
    const r = k === 0 ? 46 : 36;
    disc(ly.l, x, y - 16, r, 3, 0.8);
    const pts = ring(R * (k === 0 ? 0.6 : 0.8));
    pts.forEach(([ax, ay], i) => {
      const [bx, by] = pts[(i + 1) % pts.length];
      line(ly.l, ax, ay, bx, by, 3, 3);
    });
  }
  // (the dome: cyan fire boiling up and out, torn by noise, white at its heart, hollowing as it burns out)
  if (k < 9) {
    const Rd = 26 + 20 * (1 - Math.exp(-k / 1.6));
    const cy = y - 14 - k * 2.6;
    for (let yy = -Math.ceil(Rd * 1.3); yy <= Math.ceil(Rd * 0.8); yy++) {
      for (let xx = -Math.ceil(Rd * 1.3); xx <= Math.ceil(Rd * 1.3); xx++) {
        const n = noise2((x + xx) * 0.13 + seed, (cy + yy + t * 40) * 0.13) - 0.5;
        const d = Math.hypot(xx / 1.25, yy) / Rd + n * 0.55;
        if (d > 1) continue;
        if (k > 3 && d < (k - 3) / 6) continue;
        const v = 1 - d;
        ly.l.put(x + xx, cy + yy, v > 0.55 ? 3 : v > 0.28 ? 2 : 1);
      }
    }
  }
  // (tongues of cyan fire licking up out of it, burning down)
  if (k >= 3 && k < 22) {
    const left = 1 - (k - 3) / 19;
    const tongues: [number, number, number][] = [[0, 0, 11], [-26, 5, 7], [26, 5, 7], [-13, -5, 6], [14, -4, 6], [-44, 11, 4.5], [44, 11, 4.5], [-60, 18, 3], [60, 18, 3]];
    tongues.forEach(([dx, dy, size], i) => fire(ly.l, x + dx, y + dy - 3, size * left * (0.85 + 0.3 * hash(seed + i)), t + i * 0.37, dx * 0.012));
  }
  // (THE RING racing out over the floor to the blast's edge: light, and its dust rolling after it)
  if (k < 10) {
    const u = Math.min(1, (k + 1) / 6);
    const r = R * (1 - (1 - u) * (1 - u));
    const lv = k < 3 ? 3 : k < 6 ? 2 : 1;
    if (k < 8) {
      const pts = ring(r);
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i];
        const [bx, by] = pts[(i + 1) % pts.length];
        line(ly.l, ax, ay - 1, bx, by - 1, Math.max(1, lv - 1), 4);
        line(ly.l, ax, ay, bx, by, lv, 2);
      }
    }
    const n = 22;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + hash(seed + i) * 0.2;
      const [px, py] = S([c[0] + Math.cos(a) * r * 0.97, c[1] + Math.sin(a) * r * 0.97, 0]);
      const rr = (4 + k * 0.9) * (0.8 + 0.4 * hash(seed * 5 + i));
      cloud(ly.st, px, py, 2 * rr, 1.4 * rr, t + i * 0.2, Math.min(1, 0.05 + k / 10), 7000 + seed + i);
    }
  }
  // (shards of light flung out of it, and stone chips flung up and falling back)
  impactBurst(ly.l, x, y - 16, k, seed, 3.2);
  if (k < 26) {
    chips(ly.stone, ly.l, x - 10, y, k, seed);
    chips(ly.stone, ly.l, x + 12, y + 2, k, seed + 3);
  }
  // (its smoke: a column rolling up and out over it, thinning, gone by its end)
  if (k >= 2) {
    const left = (k - 2) / (SHELL_FX.long - 3);
    for (let i = 0; i < 8; i++) {
      const up = 8 + i * 7 + k * (0.8 + 0.12 * i);
      const wide = 11 + i * 2.6 + k * 0.5;
      const sway = Math.sin(t * 2 + i) * 3 + (hash(seed + i) - 0.5) * 14;
      cloud(ly.sm, x + sway, y - up, 2 * wide, 1.5 * wide, t + i * 0.3, Math.min(1, 0.02 + left * 1.05 + i * 0.025), 7500 + seed + i);
    }
  }
}

// ---- THE TESLA COIL'S BEAM ------------------------------------------------------------------------------------------

/** How thick the beam is at frame `f` (0 to 1 of its full): out at once as it fires, held, thinning to nothing. */
export function beamWidth(f: number): number {
  const k = f - GCHARGE.fire;
  if (k < 0 || f >= GCHARGE_BEAM.gone) return 0;
  if (k === 0) return 0.75;
  if (f <= GCHARGE_BEAM.held) return 1 + 0.08 * Math.sin(k * 2.2);
  const u = (f - GCHARGE_BEAM.held) / (GCHARGE_BEAM.gone - GCHARGE_BEAM.held);
  return Math.max(0, (1 - u) ** 1.6);
}
/** How far out the beam reaches at frame `f` (0 to 1 of its length): two-thirds out as it fires, all of it the frame after. */
export function beamReach(f: number): number {
  const k = f - GCHARGE.fire;
  return k < 0 ? 0 : k === 0 ? 0.62 : 1;
}
/**
 * THE BEAM from (x0, y0) to (x1, y1) on the picture, `w` pixels thick, at frame `f`: white-hot at its heart, cyan round it,
 * its edge writhing; arcs coiling along it; a flare at its root; a splash of light where it ends. Thinning, it frays to threads.
 */
function beamFx(l: Light, x0: number, y0: number, x1: number, y1: number, w: number, f: number, thinning: boolean): void {
  const len = Math.hypot(x1 - x0, y1 - y0) || 1;
  const ux = (x1 - x0) / len;
  const uy = (y1 - y0) / len;
  const nx = -uy;
  const ny = ux;
  if (w >= 3) {
    for (let s = 0; s <= len; s += 0.5) {
      // (its edge writhing, its root narrower, flaring out)
      const root = Math.min(1, 0.55 + s / 30);
      const wob = noise2(s * 0.09 - f * 1.7, f * 0.31) - 0.5;
      const half = (w / 2) * root * (1 + wob * 0.35);
      const cx = x0 + ux * s;
      const cy = y0 + uy * s;
      for (let a = -half - 1; a <= half + 1; a += 0.5) {
        const q = Math.abs(a) / Math.max(0.5, half);
        if (q > 1.05) continue;
        const k = q < 0.32 ? 3 : q < 0.62 ? 2 : 1;
        l.put(cx + nx * a, cy + ny * a, k);
      }
    }
  }
  // (arcs coiling along it, and off it, broken anew each frame)
  const arcs = thinning ? 3 : 5;
  for (let i = 0; i < arcs; i++) {
    const s0 = ((i / arcs + f * 0.07) % 1) * len;
    const s1 = Math.min(len, s0 + 24 + 16 * hash(f * 3 + i));
    const side = (i + f) % 2 ? 1 : -1;
    const off = (w / 2 + 2) * side;
    const off2 = (w / 2 + 2) * -side;
    bolt(l, x0 + ux * s0 + nx * off, y0 + uy * s0 + ny * off, x0 + ux * s1 + nx * off2, y0 + uy * s1 + ny * off2, 3000 + f * 7 + i, thinning ? 1 : 0);
  }
  if (thinning) {
    // (frayed to threads: two jags of lightning down its length)
    for (let i = 0; i < 2; i++) bolt(l, x0, y0, x1 + nx * (i ? 4 : -4), y1 + ny * (i ? 4 : -4), 5000 + f * 11 + i, w > 4 ? 0 : 1);
  }
  // (its root's flare and the splash where it ends)
  disc(l, x0, y0, Math.max(3, w * 0.75), 3);
  if (!thinning || w > 4) {
    disc(l, x1, y1, Math.max(3, w * 0.6), 3);
    for (let i = 0; i < 7; i++) {
      const a = Math.atan2(uy, ux) + (hash(f * 5 + i) - 0.5) * 2.6;
      const r = w * 0.6 + 6 + 8 * hash(f * 7 + i);
      line(l, x1, y1, x1 + Math.cos(a) * r, y1 + Math.sin(a) * r, 2, 1);
    }
  }
}

/**
 * EVERYTHING A CHARGED SHOT THROWS OFF at frame `f` of its move (dev/golem_moves.ts GCHARGE_SHELL / GCHARGE_BEAM), `t` the
 * scene's time: the charge, the strike, the shell and its blast or the beam, the smoke, the steam, the dust of its skid.
 */
export function chargeFx(kind: 'shell' | 'beam', ly: ChargeLayers, at: ChargeAt, f: number, t: number): void {
  const C = GCHARGE;
  if (f < C.fire) {
    charging(kind, ly, at, f);
    return;
  }
  const k = f - C.fire;
  const m = at.S(at.muzzle);
  const [dx, dy] = onPicture(at.S, at.muzzle, at.way);
  // (its recoil: steam bursting out of its stacks; its vents hissing on, cooling; dust kicked up where it grips the floor as it skids)
  at.stacks.forEach((p, i) => {
    const s = at.S(p);
    for (let j = 0; j < 4; j++) {
      const age = k - j * 2;
      if (age < 0 || age > 22) continue;
      const r = (3 + age * 0.55) * (kind === 'shell' ? 1.15 : 1);
      cloud(ly.st, s[0] + Math.sin(j * 1.7 + i) * 2, s[1] - 3 - age * 1.6, 2 * r, 1.6 * r, t + j * 0.3, Math.min(1, 0.03 + age / 23), 8000 + i * 13 + j);
    }
  });
  const cool = Math.max(0, 1 - k / 26);
  for (let i = 0; i < (GUN_STEAM.on ? Math.min(2, at.vents.length) : 0); i++) {
    const v = at.S(at.vents[i]);
    const [vx, vy] = onPicture(at.S, at.vents[i], at.ventWays[i]);
    jet(ly.st, v[0], v[1], vx, vy, cool * 0.7, f, 31 * (i + 1));
  }
  const skidding = kind === 'shell' ? k < 14 : k < 20;
  if (skidding) {
    at.grip.forEach((p, i) => {
      const g = at.S([p[0], p[1], 0]);
      const r = (kind === 'shell' ? 4.5 : 3) * (1 - k / 16) + 1.5;
      cloud(ly.st, g[0] + (i - 1) * 2, g[1] + 1, 2.4 * r, 1.3 * r, t + i * 0.4, Math.min(1, 0.15 + k / 18), 8500 + i * 7 + k);
    });
  }
  if (kind === 'shell') {
    bigBurst(ly.l, m[0] + dx * 2, m[1] + dy * 2, dx, dy, k, 77);
    // (smoke rolling out of its mouth, and then curling up off it as the barrel cools)
    if (k < 30) {
      for (let i = 0; i < 6; i++) {
        const out = (6 + 20 * hash(91 + i)) * (1 - Math.exp(-k / 4));
        const up = k * (0.35 + 0.3 * hash(97 + i));
        const r = 5 + i * 1.1 + k * 0.5;
        cloud(ly.sm, m[0] + dx * (6 + out) + (hash(93 + i) - 0.5) * 12, m[1] + dy * (6 + out) - up, 2 * r, 1.6 * r, t + i, Math.min(1, 0.02 + k / 32), 9000 + i);
      }
    }
    for (let j = 0; j < 3; j++) {
      const age = k - 8 - j * 7;
      if (age < 0 || age > 24) continue;
      const r = 2 + age * 0.3;
      cloud(ly.sm, m[0] + Math.sin(age * 0.35 + j) * 3, m[1] - 2 - age * 1.1, 2 * r, 1.6 * r, t + j, Math.min(1, 0.15 + age / 25), 9100 + j);
    }
    const n = shellFlight(at);
    shellFlightFx(ly, at, k, n);
    wideBlast(ly, at.S, at.aim, k - n, t, 61);
    return;
  }
  // THE BEAM: from its ball to its length, as thick as it is now
  const wpx = beamWidth(f);
  const reach = beamReach(f);
  if (wpx > 0) {
    const full = BEAM_FX.drawn * UNITS_PER_TILE;
    const end = lerp(at.muzzle, at.aim, reach);
    const e = at.S(end);
    beamFx(ly.l, m[0], m[1], e[0], e[1], Math.max(1.5, full * wpx), f, f > GCHARGE_BEAM.held);
  }
  // (the coil spitting as it cools, and smoke curling off its ball)
  if (f > GCHARGE_BEAM.gone - 2 && f < GCHARGE_BEAM.gone + 16 && f % 3 === 0) crackle(ly.l, m[0], m[1], 6, 1, 1200 + f);
  for (let j = 0; j < 3; j++) {
    const age = f - GCHARGE_BEAM.held - j * 6;
    if (age < 0 || age > 24) continue;
    const r = 2 + age * 0.3;
    cloud(ly.sm, m[0] + Math.sin(age * 0.35 + j) * 3, m[1] - 3 - age * 1.0, 2 * r, 1.6 * r, t + j, Math.min(1, 0.15 + age / 25), 9200 + j);
  }
}
/** How long after it fires a charged shot's effects are all gone (frames): the shell's flight and its blast; the beam's smoke. */
export function chargeFxLong(kind: 'shell' | 'beam', at: ChargeAt): number {
  return kind === 'shell' ? Math.max(32, shellFlight(at) + SHELL_FX.long) : GCHARGE_BEAM.gone + 26 - GCHARGE.fire;
}
