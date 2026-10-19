// FLOOR 12, THE UNDERCITY (THE KING'S CISTERN): ITS OWN PIECES, themed after its boss (a mock-up; nothing of the
// game imports it).
//
// His rule for a set of floors from the second on (10 Oct, 14:54): “Going forward, let’s do 25 that are the theme of
// the 5 levels, then 25 for each boss.” This floor's boss is the Rat King (his doc "Wordsmith Act 2: The Hush", the
// planning chat's, with his yes as ideas): a knot of rats tied at the tails, swollen on jars of bottled voices it
// broke into, squeaking in a hundred stolen voices; his floor the King's Cistern. Its ground: art/undercity.ts. Made
// on his word to this chat, 18 Oct, 21:24 Pacific: “Hey go without my say so.  If something is shit I’ll get it to
// it but you’re doing a great jobs. At least for 11-15”.
//
// THE STORY IN THEM: this is how the cult got in during the siege. The sewermen's works (sluices, winches, punts,
// eel traps, their lanterns) lie as they left them; the Silent Order's tunnels lead to shelves of corked jars,
// whispering: bottled voices; the rats have been at them, and where the King has fed there are heaps of gnawed rags,
// corks and broken green glass, the voices leaking out pink. The Muffled Bell here is a diver's bell the Order
// dragged into the cistern and gagged; the Bells to ring, the alarm bells at the sluice gates. One jar, sealed in
// the Order's black wax, holds the Crier's own voice, the first taken (the quest).
//
// THE RULES THEY KEEP: as art/act2_kit.ts says. Pink burning to gold only on what is the enemy's (the stolen voices
// in their jars, the rats' eyes); the sewermen's lanterns an honest orange; the Bells awake or rung the hero's cyan
// (his to ring); the quest's own pale light; nothing else gives light.

import type { Sprite } from '../engine/px';
import { toneAt } from './floor4';
import type { Scene, V3 } from './floor4';
import { timber, rope } from './floor6';
import { CANDLE, SWING, bell, bellGlow, metalOf } from './floor11';
import type { Piece } from './floorkit';
import { hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { bright } from './act2_quiet';
import { BLACK, BRASS, BRONZE, DEAL, HOLE, IRON, MASK, ROPE, SOFT_ID, STRAW, checker, cylinder, done, facing, frontPiece, local, lying, planks, scene, slab, turned } from './act2_kit';

const fr = (t: number): number => t - Math.floor(t);

// =================================================================================================
// THE UNDERCITY'S MATERIALS (each from its deep shade to its lit top)

/** Wet brick, as the tunnels' (art/undercity.ts UC_BRICK). */
export const SBRICK: Ramp = ['#24181c', '#3e2526', '#5a352e', '#76473a', '#8e5c48'];
/** The sewers' grey stone, wet. */
export const WSTONE: Ramp = ['#23232b', '#35353f', '#484852', '#5e5d66', '#78767c'];
/** Slime and wet moss. */
export const SLIME: Ramp = ['#121a12', '#1e2c1a', '#2e4026', '#425634', '#5a6e44'];
/** Old wet timber, near black. */
export const ROT: Ramp = ['#141011', '#241b19', '#352922', '#4a392c', '#5f4b39'];
/** Rust on iron. */
export const RUST: Ramp = ['#24150f', '#3a2117', '#562e1e', '#723e26', '#8e5434'];
/** Rags, grey-brown. */
export const RAG: Ramp = ['#1a1819', '#2c2826', '#423c36', '#5a5248', '#766c5e'];
/** Bone. */
export const BONE: Ramp = ['#48423a', '#686256', '#8a8272', '#a8a08e', '#c6bea8'];
/** The jars' green glass. */
export const GLASS: Ramp = ['#0e1712', '#1a281e', '#2a3e2e', '#3e563c', '#68845e'];
/** Cork. */
export const CORK: Ramp = ['#382a1c', '#523e28', '#6c5436', '#886c46', '#a4885c'];
/** Wicker. */
export const WICKER: Ramp = ['#2a2016', '#40311f', '#5a462c', '#76603c', '#927a4e'];
/** Green water in a hole or a hull. */
export const GWATER: Ramp = ['#0b1310', '#13201a', '#1b2e22', '#284030', '#46644c'];
/** The diver's bell's bronze, dark and gone green with the wet. */
const SEA_BRONZE: Ramp = ['#15110f', '#2a2019', '#433222', '#634a30', '#8e7048'];
const VERDIGRIS: Ramp = ['#162420', '#22362e', '#304a3e', '#42604e', '#587a62'];
/** Roots, grey-brown and wet. */
const ROOT: Ramp = ['#1e1814', '#33281f', '#4a3c2e', '#62523e', '#7a6a52'];
/** Pale toadstools. */
export const TOAD: Ramp = ['#4c4840', '#6e685c', '#8e887a', '#aca492', '#c4bca8'];
/** THE STOLEN VOICES: the enemy's pink burning to gold (his rulebook, Colour 3), seen through the jars' glass. */
const VOICE = FLAME;
/** The quest's own pale light: the Crier's voice, not yet free. */
const PALE: Ramp = ['#6e6858', '#9a927e', '#c4bca4', '#e2dac2', '#f4eedc'];
bright(PALE);

// =================================================================================================
// HELPERS

/** Courses of brick on a slab's sides: a grain for `slab` (the mortar dark, each brick a little its own). */
function coursedBrick(h: number, seed: number) {
  return (f: number, u: number, v: number): number => {
    if (f >= 4) return 0;
    const z = v * h;
    const row = Math.floor(z / 5);
    const a = u * 6 + (row & 1) * 0.5;
    if (fr(z / 5) < 0.2 || fr(a) < 0.08) return -0.65;
    return (hash(row, Math.floor(a), seed) - 0.5) * 0.35;
  };
}

/**
 * A CORKED JAR of the Order's green glass, standing at (x, y, z0), `h` tall, `r` round: its shoulder and neck, the
 * cork, a twist of the Order's black cord; inside it, seen through the glass, a stolen voice burning pink (`voice`:
 * 0 none, 1 faint, 2 bright); `broken`: its top snapped off, jagged.
 */
function jar(S: Scene, x: number, y: number, z0: number, h: number, r: number, id: number, voice = 1, broken = false, inner: Ramp = VOICE): void {
  const body = (z: number): number => {
    const t = (z - z0) / h;
    if (t < 0.7) return r * (0.86 + 0.14 * Math.sin(Math.min(1, t / 0.7) * Math.PI * 0.5 + 0.4));
    if (t < 0.84) return r * (1 - ((t - 0.7) / 0.14) * 0.55);
    return r * 0.42;
  };
  const top = broken ? z0 + h * (0.55 + 0.12 * hash(id, 1, 5101)) : z0 + h;
  cylinder(S, x, y, body, z0, top, (n, a, z) => {
    if (broken && z > top - 2.2 && fr(a * 1.6 + 0.2) < 0.5 && z > top - 2.2 + 2.2 * fr(a * 3.1)) return null;
    const t = (z - z0) / h;
    // the voice inside, through the glass, toward the eye
    const toward = Math.cos(a - Math.PI / 4);
    if (voice > 0 && t > 0.16 && t < 0.58 && toward > 0.5) {
      const k = ((toward - 0.5) / 0.5) * (1 - Math.abs(t - 0.37) / 0.21);
      if (k > (voice === 2 ? 0.3 : 0.5)) return k > 0.72 ? inner[voice === 2 ? 3 : 2] : inner[voice === 2 ? 1 : 0];
    }
    // a glint down its lit side
    if (fr(a / (Math.PI * 2) - 0.62) < 0.03 && t < 0.7) return GLASS[4];
    return toneAt(n, GLASS, 0.05);
  }, id, broken ? undefined : () => GLASS[2]);
  if (broken) return;
  // the cork, the cord tied round the neck
  cylinder(S, x, y, r * 0.36, top, top + 2.2, (n) => toneAt(n, CORK, 0.1), id + 1, () => CORK[3]);
  cylinder(S, x, y, r * 0.45, top - h * 0.12, top - h * 0.12 + 0.9, (n) => toneAt(n, BLACK, 0.3), id + 2);
}

/** Wisps of a stolen voice rising pink off what holds it (soft: no seam), `n` of them from about `c`. */
function wisps(S: Scene, c: V3, n: number, seed: number, rise = 14): void {
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(1, n - 1);
    const a = seed * 1.7 + i * 2.3;
    const p: V3 = [c[0] + Math.cos(a) * (1 + t * 4) + Math.sin(t * 9 + seed) * 2, c[1] + Math.sin(a) * (1 + t * 3), c[2] + t * rise];
    S.ball(p, 1.1 - t * 0.6, VOICE, SOFT_ID + 40 + i, undefined, 0.3 - t);
  }
}

/** A coil or heap of rags at (x, y): lumps of grey-brown cloth, torn. */
function rags(S: Scene, x: number, y: number, n: number, id: number, seed: number, R = 7): void {
  for (let i = 0; i < n; i++) {
    const a = i * 2.4 + seed;
    const d = i === 0 ? 0 : R * (0.4 + 0.6 * hash(i, seed, 5111));
    const c: V3 = [x + Math.cos(a) * d, y + Math.sin(a) * d, 2.2 + 1.6 * hash(i, seed, 5112)];
    const ang = a * 1.3;
    S.egg(c, [[Math.cos(ang), Math.sin(ang), 0], [-Math.sin(ang), Math.cos(ang), 0], [0, 0, 1]], [5 + 3 * hash(i, seed, 5113), 3.5, 2.4], (nn, w) => (fr((w[0] + w[1]) * 0.4) < 0.15 ? toneAt(nn, RAG, -0.5) : toneAt(nn, RAG, 0)), id + i);
  }
}

/** A small bone lying at (x, y): a shaft and its two knobs. */
function boneAt(S: Scene, x: number, y: number, a: number, len: number, id: number): void {
  const d: V3 = [Math.cos(a), Math.sin(a), 0];
  const p0: V3 = [x - d[0] * len / 2, y - d[1] * len / 2, 1];
  const p1: V3 = [x + d[0] * len / 2, y + d[1] * len / 2, 1];
  S.rod(p0, p1, 0.8, 0.7, BONE, id);
  S.ball(p0, 1.3, BONE, id);
  S.ball(p1, 1.2, BONE, id);
}

// =================================================================================================
// THE SEWERMEN'S WORKS

/**
 * A SLUICE GATE across a tunnel (a way through): two piers of wet brick, a beam over them, the iron gate between,
 * riveted plates in their grooves, slime up its foot; its winch on the beam, the chains down to it. Shut, the gate
 * down; open, hauled up under the beam, the water still running off its edge. Front along +y (`k` 0) or +x (1).
 * 190 x 220 at (95, 176).
 */
function sluiceGate(open: boolean, k: number): Sprite {
  const S = turned(scene(190, 220, 95, 176), k);
  const FRONT = facing(S, [0, 1, 0]);
  const H = 98;
  for (const sx of [-1, 1]) {
    slab(S, sx * 36 - 8, -10, sx * 36 + 8, 10, 0, H, SBRICK, 1 + (sx > 0 ? 1 : 0), 0, coursedBrick(H, 5121 + sx));
    slab(S, sx * 36 - 9, -11, sx * 36 + 9, 11, H, H + 5, WSTONE, 3 + (sx > 0 ? 1 : 0), 0.1);
    // its groove, dark, down the pier's inner face
    S.quad([[sx * 28, -2, 0], [sx * 28, 2, 0], [sx * 28, 2, H], [sx * 28, -2, H]], () => HOLE, 5 + (sx > 0 ? 1 : 0));
    // slime up its foot
    S.quad([[sx * 36 - 8.2, 10.2, 0], [sx * 36 + 8.2, 10.2, 0], [sx * 36 + 8.2, 10.2, 14], [sx * 36 - 8.2, 10.2, 14]], (u, v, w) => (v < 0.35 + 0.4 * hash(Math.floor(u * 10), 0, 5122) ? toneAt(FRONT, SLIME, 0.1) : null), 7 + (sx > 0 ? 1 : 0));
  }
  // the beam over them: iron-shod oak
  timber(S, [-46, 0, H + 9], [46, 0, H + 9], 4.5, 9, [0.12, 0.88]);
  // THE GATE: riveted iron plates, its edge banded, slime and rust on its foot
  const lift = open ? 66 : 0;
  const z0 = 1 + lift;
  const z1 = Math.min(H + 2, 88 + lift);
  S.quad([[-28, 1.5, z0], [28, 1.5, z0], [28, 1.5, z1], [-28, 1.5, z1]], (u, v, w) => {
    const [x, , z] = local(S, w);
    const plate = Math.floor((z - z0) / 22);
    const pz = fr((z - z0) / 22);
    if (pz < 0.06) return toneAt(FRONT, IRON, -0.6);
    if (pz > 0.94) return toneAt(FRONT, IRON, 0.5);
    // rivets along each seam and edge
    if ((pz < 0.14 || pz > 0.86 || Math.abs(x) > 25.5) && fr(x / 4.4) < 0.25) return toneAt(FRONT, IRON, 0.7);
    if (Math.abs(x) > 26.5) return toneAt(FRONT, IRON, -0.3);
    // slime and rust, worst at its foot, streaks of rust down from each seam
    const foot = z - z0;
    if (foot < 16 + 8 * hash(Math.floor(u * 12), plate, 5123)) return hash(Math.floor(u * 40), Math.floor(foot), 5124) < 0.6 ? toneAt(FRONT, SLIME, 0) : toneAt(FRONT, RUST, 0);
    if (fr(x / 9.3 + plate * 0.37) < 0.08 && pz > 0.5) return toneAt(FRONT, RUST, 0.1);
    return toneAt(FRONT, IRON, (hash(plate, Math.floor(u * 3), 5125) - 0.5) * 0.25);
  }, 10);
  S.quad([[-28, -1.5, z1], [28, -1.5, z1], [28, 1.5, z1], [-28, 1.5, z1]], () => toneAt([0, 0, 1], IRON, 0.2), 11);
  // open: the water still running off its edge in threads, the drips falling
  if (open) {
    for (let i = 0; i < 9; i++) {
      const x = -24 + i * 6 + hash(i, 0, 5126) * 2;
      const len = 6 + hash(i, 1, 5126) * 18;
      S.rod([x, 2, z0 - 0.5], [x, 2, z0 - len], 0.35, 0.25, GWATER, SOFT_ID + 1);
      S.ball([x, 2, z0 - len - 6 - hash(i, 2, 5126) * 20], 0.6, GWATER, SOFT_ID + 2, undefined, 0.6);
    }
  }
  // THE WINCH on the beam: a gear wheel and its drum, the handle; the chains down to the gate
  const wc: V3 = [0, -5, H + 18];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    S.ball([wc[0] + Math.cos(a) * 9, wc[1], wc[2] + Math.sin(a) * 9], 1.4, IRON, 12);
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    S.rod(wc, [wc[0] + Math.cos(a) * 9, wc[1], wc[2] + Math.sin(a) * 9], 0.8, 0.8, IRON, 12);
  }
  S.ball(wc, 2.2, RUST, 13);
  S.rod([-12, -5, H + 9], [-12, -5, H + 28], 1.4, 1.4, IRON, 14);
  S.rod([12, -5, H + 9], [12, -5, H + 28], 1.4, 1.4, IRON, 14);
  S.rod([-12, -5, H + 18], [12, -5, H + 18], 1.2, 1.2, IRON, 14);
  S.rod([12, -2, H + 18], [16, 4, H + 22], 0.8, 0.8, IRON, 15);
  for (const x of [-18, 18]) {
    const n = Math.round((H + 9 - z1) / 3);
    for (let i = 0; i <= n; i++) S.ball([x, 1, z1 + ((H + 9 - z1) * i) / Math.max(1, n)], 0.7, IRON, 16);
  }
  return done(S, 95, 176);
}

/**
 * THE SLUICE'S WINCH: a great iron wheel on a timber trestle, its drum wound with chain, the chain run off along the
 * floor to the gate; a ratchet, its pawl. 120 x 140 at (60, 112).
 */
function winch(): Sprite {
  const S = scene(120, 140, 60, 112);
  // the trestle: two A-frames of timber, a sill
  for (const x of [-13, 13]) {
    timber(S, [x, -12, 1], [x, 0, 44], 2.2, 1);
    timber(S, [x, 12, 1], [x, 0, 44], 2.2, 1);
  }
  timber(S, [-16, -12, 2], [16, -12, 2], 2, 2);
  timber(S, [-16, 12, 2], [16, 12, 2], 2, 2);
  // the drum, wound with chain
  cylinderX(S, 0, 0, 40, 5, 22, (n, a, x) => (fr(x / 2.2 + (a / Math.PI) * 0.5) < 0.45 ? toneAt(n, IRON, 0.25) : toneAt(n, IRON, -0.35)), 3);
  // the wheel at its end, spoked; its rim rusted
  const wc: V3 = [16, 0, 40];
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2;
    S.ball([wc[0], wc[1] + Math.cos(a) * 17, wc[2] + Math.sin(a) * 17], 1.7, i % 5 === 0 ? RUST : IRON, 4);
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.2;
    S.rod(wc, [wc[0], wc[1] + Math.cos(a) * 17, wc[2] + Math.sin(a) * 17], 0.9, 0.9, IRON, 5);
  }
  S.ball(wc, 2.6, RUST, 6);
  // the ratchet and its pawl, on the near A-frame
  S.rod([-14, 8, 30], [-14, 2, 38], 0.9, 0.7, IRON, 7);
  // the chain off the drum, down and away along the floor
  for (let i = 0; i < 18; i++) {
    const t = i / 17;
    S.ball([-4 + t * 2, 6 + t * 30, 36 * (1 - t) ** 2 + 1], 0.8, i % 2 ? IRON : RUST, 8);
  }
  return done(S, 60, 112);
}

/** An upright drum along x (the winch's): from x0 to x1, `r` round, at (y, z); shade(n, a, x). */
function cylinderX(S: Scene, y: number, _unused: number, z: number, r: number, len: number, shade: (n: V3, a: number, x: number) => string, id: number): void {
  const N = 28;
  const STEPS = Math.ceil(len / 2);
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2;
    const a1 = ((i + 1) / N) * Math.PI * 2;
    for (let k = 0; k < STEPS; k++) {
      const xa = -len / 2 + (len * k) / STEPS;
      const xb = -len / 2 + (len * (k + 1)) / STEPS;
      const P = (aa: number, x: number): V3 => [x, y + Math.cos(aa) * r, z + Math.sin(aa) * r];
      const am = (a0 + a1) / 2;
      const n: V3 = [0, Math.cos(am), Math.sin(am)];
      S.quad([P(a0, xa), P(a1, xa), P(a1, xb), P(a0, xb)], (_u, v) => shade(n, am, xa + (xb - xa) * v), id);
    }
  }
}

/**
 * THE FLOOD (a trap): a sluice hatch low in a housing of wet brick, its iron door bolted; the warning, the door
 * shuddering, jets spraying from its edges, the chains rattling, green water spilling over the floor; then it
 * bursts open and a great tongue of green water rushes out along the floor, foaming, and sweeps away. `f`: 0 quiet,
 * 1 the warning, 2 to 4 the rush. Looking along +y (`k` 0) or +x (1). 440 x 280 at (210, 130).
 */
function floodTrap(f: number, k: number): Sprite {
  const S = turned(scene(440, 280, 210, 130), k);
  const FRONT = facing(S, [0, 1, 0]);
  // the housing: a low box of brick against the wall, a stone lintel
  slab(S, -20, -16, 20, 4, 0, 40, SBRICK, 1, 0, coursedBrick(40, 5131));
  slab(S, -22, -17, 22, 6, 40, 45, WSTONE, 2, 0.1);
  // the hatch: an iron door in its face, bolted, slime round it
  const shake = f === 1 ? 0.8 : 0;
  const openAng = f >= 2 ? 1.25 : 0;
  // (open: swung up on its top hinge, out over the floor)
  const hz = 34;
  const hinge = (x: number, z: number): V3 => {
    const dz = z - hz;
    return [x + (f === 1 ? Math.sin(x * 3) * shake : 0), 4.3 - Math.sin(openAng) * dz, hz + dz * Math.cos(openAng)];
  };
  S.quad([hinge(-13, 6), hinge(13, 6), hinge(13, hz), hinge(-13, hz)], (u, v, w) => {
    const [x, , z] = local(S, w);
    if (fr(x / 6.5) < 0.12 && v > 0.1 && v < 0.9) return toneAt(FRONT, IRON, -0.5);
    if (v < 0.08 || v > 0.92 || u < 0.05 || u > 0.95) return toneAt(FRONT, IRON, 0.45);
    if (z < 14) return toneAt(FRONT, RUST, -0.1);
    return toneAt(FRONT, IRON, 0);
  }, 3);
  // behind it, open: the dark of the culvert
  if (f >= 2) S.quad([[-12, 4.1, 6], [12, 4.1, 6], [12, 4.1, hz], [-12, 4.1, hz]], () => HOLE, 4);
  // the bolts and the chain, drawn back
  for (const x of [-15, 15]) S.rod([x, 5, 20], [x, 5, 26], 1.1, 1.1, IRON, 5);
  // THE WARNING: jets from round the hatch's edges, the water spilling out across the floor before it
  const water = (u: number, v: number, w: V3, reach: number, spread: number, foam: number): string | null => {
    const [x, y] = local(S, w);
    const d = y - 4;
    if (d < 0 || d > reach) return null;
    const half = 12 + spread * (d / reach) ** 0.7 + 3 * Math.sin(d * 0.3 + x * 0.2);
    if (Math.abs(x) > half) return null;
    // ripples across it, foam at its edges and its front
    const edge = Math.min(half - Math.abs(x), reach - d);
    if (edge < foam + 1.5 * hash(Math.floor(x), Math.floor(d), 5132)) return hash(Math.floor(x * 2), Math.floor(d * 2), 5133) < 0.5 ? '#9aa894' : '#6f7e6c';
    if (fr(d / 7 - x * 0.03) < 0.16) return GWATER[4];
    return fr(x * 0.15 + d * 0.05) < 0.5 ? GWATER[3] : GWATER[2];
  };
  if (f === 1) {
    S.quad([[-40, 4, 0.6], [40, 4, 0.6], [40, 40, 0.6], [-40, 40, 0.6]], (u, v, w) => water(u, v, w, 24, 10, 1.4), 6);
    for (let i = 0; i < 14; i++) {
      const side = i % 2 ? -1 : 1;
      const z = 8 + (i * 1.9) % 24;
      for (let j = 0; j < 5; j++) S.ball([side * (13.5 + j * 2.2), 5 + j * 1.6, z + j * 0.4 - j * j * 0.5], 0.7, GWATER, SOFT_ID + 3, undefined, 0.5);
    }
  }
  // THE RUSH: a great tongue of water flung out along the floor, heaped up at its front into a breaking wave, its
  // crest foaming; behind it the floor running with it; then it sweeps on past and the last of it drains away
  if (f >= 2) {
    const reach = f === 2 ? 74 : f === 3 ? 140 : 152;
    const spread = f === 2 ? 18 : f === 3 ? 32 : 38;
    const tail = f === 4 ? 96 : 0;
    // the sheet of water over the floor under it all
    S.quad([[-62, 4, 0.8], [62, 4, 0.8], [62, 160, 0.8], [-62, 160, 0.8]], (u, v, w) => {
      const [, y] = local(S, w);
      if (y - 4 < tail) return null;
      return water(u, v, w, reach, spread, 2.2);
    }, 7);
    // its body: heaped water, highest at the front where it breaks
    const FOAM: Ramp = ['#4a584a', '#66766a', '#8a9a8a', '#aab8a6', '#c8d2c0'];
    for (let d = Math.max(4, tail); d < reach - 3; d += 5) {
      const t = d / reach;
      const half = 12 + spread * t ** 0.7;
      const h = f === 4 ? 2 : (f === 2 ? 7 : 5) + (f === 2 ? 17 : 13) * Math.max(0, (t - 0.5) / 0.5) ** 1.8;
      for (let x = -half + 4; x <= half - 4; x += 7) {
        const hh = h * (0.72 + 0.28 * Math.cos((x / half) * Math.PI * 0.5)) * (0.9 + 0.2 * hash(Math.floor(x), Math.floor(d), 5136));
        S.egg([x, 4 + d, hh * 0.45], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [6.2, 5, hh * 0.6 + 0.8], (n, w) => {
          // foam on its crest, and churned in thin streaks along it
          const [lx, ly] = local(S, w);
          if (f < 4 && n[2] > 0.7 && t > 0.84) return toneAt(n, FOAM, 0.15);
          if (n[2] > 0.8 && fr(lx * 0.13 + ly * 0.05) < 0.08) return toneAt(n, FOAM, -0.1);
          return toneAt(n, GWATER, 0.2);
        }, 8);
      }
    }
    // the crest, curling over at the front: a lip of foam along it
    if (f < 4) {
      const half = 12 + spread;
      for (let x = -half + 2; x <= half - 2; x += 2.5) {
        const zc = (f === 2 ? 25 : 19) * (0.75 + 0.25 * Math.cos((x / half) * Math.PI * 0.5));
        S.ball([x, 4 + reach - 4, zc], 2.4 + hash(Math.floor(x * 3), f, 5137) * 1.4, FOAM, SOFT_ID + 8, undefined, 0.25);
        S.ball([x + 1, 4 + reach - 1, zc - 4], 1.6, FOAM, SOFT_ID + 8, undefined, 0.1);
      }
    }
    // the gush out of the hatch, arching
    if (f < 4) {
      for (let i = 0; i < 46; i++) {
        const t = i / 45;
        const x = (hash(i, 0, 5134) - 0.5) * 22;
        S.ball([x, 6 + t * 34, 22 * (1 - t) + 5 * Math.sin(t * Math.PI) + 2], 2.6 - t * 1.2, i % 4 === 0 ? FOAM : GWATER, SOFT_ID + 4, undefined, 0.3);
      }
    }
    // spray thrown up at its front, flecks flying ahead of it
    const fy = 4 + reach;
    for (let i = 0; i < 40; i++) {
      const x = (hash(i, f, 5135) - 0.5) * 2 * (12 + spread);
      const z = 3 + hash(i, f + 1, 5135) * (f === 4 ? 8 : 42);
      S.ball([x, fy + 2 - hash(i, f + 2, 5135) * 10 + (i % 5 === 0 ? 8 : 0), z], 0.8 + hash(i, f + 3, 5135) * 1.6, FOAM, SOFT_ID + 5, undefined, 0.3);
    }
  }
  return done(S, 210, 130);
}

/**
 * A SLICK OF SLIME on the flags (slick floors, a hazard): a sheet of it, wet and glistening, a sheen that moves.
 * `f` 0 or 1 (the sheen's two places). Laid flat: 150 x 84 at (75, 42).
 */
function slick(f: number): Sprite {
  return lying(150, 84, 75, 42, (u, v, px, py) => {
    const d = Math.hypot(u / 1.25, v / 0.95);
    const edge = 0.92 + 0.12 * Math.sin(Math.atan2(v, u) * 5 + 1) + 0.06 * Math.sin(Math.atan2(v, u) * 11);
    if (d > edge) return null;
    if (d > edge - 0.07) return SLIME[0];
    // thick and dark in its middle, thinner and paler toward its edge; the sheen where the light catches the wet, in
    // soft broken streaks that move (f)
    const th = Math.sin(u * 4.3 + 1.1) * Math.cos(v * 5.1) + 0.5 * Math.sin((u - v) * 9);
    let c = d < 0.5 ? SLIME[1] : th > 0.3 ? SLIME[3] : SLIME[2];
    const sh = Math.sin((u - v) * 7 + f * 1.6 + Math.sin(u * 3) * 1.2);
    if (sh > 0.93 && d < edge - 0.15) c = hash(px >> 1, py, 5141) < 0.75 ? SLIME[4] : '#8a9a80';
    if (hash(px, py, 5142) < 0.012) c = '#8a9a80';
    return c;
  });
}

// =================================================================================================
// THE BELLS ON THIS FLOOR (the set's event: struck in time, they break the Hush)

/**
 * THE DIVER'S BELL (the Muffled Bell on this floor): a great bronze diving bell, a sewerman's for working under the
 * water, the Silent Order dragged into the cistern and gagged: its dome and skirt, round ports of thick glass, its
 * bands of rivets, the lifting eye on its crown and the chain to it; wound in the Order's black cloth and chained,
 * the blank mask on it. Struck, the gag torn away, it rocks on its rim. `gagged`, then rocking one way and back.
 * 200 x 230 at (100, 196).
 */
function diversBell(gagged: boolean, rock = 0): Sprite {
  const S = scene(200, 230, 100, 196);
  const H = 70;
  const R = 30;
  // rocked about the point of its rim it leans on (along x)
  const pivot: V3 = [0, rock > 0 ? R : rock < 0 ? -R : 0, 0];
  const tilt = (w: V3): V3 => {
    if (!rock) return w;
    const dy = w[1] - pivot[1];
    const dz = w[2];
    return [w[0], pivot[1] + dy * Math.cos(rock) - dz * Math.sin(rock), dy * Math.sin(rock) + dz * Math.cos(rock)];
  };
  const prof = (t: number): number => (t < 0.35 ? R * (0.55 + 0.45 * Math.sin((t / 0.35) * Math.PI * 0.5)) : t < 0.9 ? R : R * 1.06);
  const N = 40;
  const M = 14;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2;
    const a1 = ((i + 1) / N) * Math.PI * 2;
    for (let j = 0; j < M; j++) {
      const t0 = j / M;
      const t1 = (j + 1) / M;
      const P = (a: number, t: number): V3 => tilt([Math.cos(a) * prof(t), Math.sin(a) * prof(t), H * (1 - t)]);
      const am = (a0 + a1) / 2;
      const tm = (t0 + t1) / 2;
      const nz = t1 < 0.35 ? Math.cos((tm / 0.35) * Math.PI * 0.5) : 0;
      const nr = Math.sqrt(1 - nz * nz);
      const n0 = tilt([Math.cos(am) * nr, Math.sin(am) * nr, nz]);
      const n: V3 = [n0[0] - (rock ? tilt([0, 0, 0])[0] : 0), n0[1] - (rock ? tilt([0, 0, 0])[1] : 0), n0[2] - (rock ? tilt([0, 0, 0])[2] : 0)];
      const nl = Math.hypot(n[0], n[1], n[2]) || 1;
      const N3: V3 = [n[0] / nl, n[1] / nl, n[2] / nl];
      S.quad([P(a0, t0), P(a1, t0), P(a1, t1), P(a0, t1)], (_u, v) => {
        const t = t0 + (t1 - t0) * v;
        const z = H * (1 - t);
        if (gagged && t > 0.22 && t < 0.82) {
          // the blank mask on the cloth where it faces the eye: an oval, two eyes, no mouth
          const mx = (am - Math.PI * 0.25) / 0.5;
          const my = (t - 0.5) / 0.2;
          if ((mx * mx) / 0.8 + my * my < 1) return Math.abs(Math.abs(mx) - 0.36) < 0.2 && Math.abs(my + 0.18) < 0.07 ? BLACK[0] : toneAt(N3, MASK, 0.1);
          return fr(t * 6 + am * 0.7) < 0.12 ? BLACK[1] : toneAt(N3, BLACK, 0.2);
        }
        // the ports: round glass, thick and dark, a brass ring, a glint
        for (const pa of [Math.PI * 0.25 - 0.62, Math.PI * 0.25 + 0.62, Math.PI * 1.25]) {
          const dx = (am - pa) * R;
          const dz = z - 34;
          const d = Math.hypot(dx, dz);
          if (d < 9) {
            if (d > 6.6) return fr(Math.atan2(dz, dx) * 1.3) < 0.2 ? toneAt(N3, SEA_BRONZE, 1) : toneAt(N3, SEA_BRONZE, d > 8 ? -0.3 : 0.55);
            return dx < -1.5 && dz > 1.5 && d < 4.5 ? '#6e7c70' : d > 5.6 ? '#0c100e' : '#1a2420';
          }
        }
        // the bands of rivets, and the flange at its rim
        for (const bz of [14, 54]) if (Math.abs(z - bz) < 2.4) return Math.abs(z - bz) < 1 && fr(am * 9) < 0.35 ? toneAt(N3, SEA_BRONZE, 1) : toneAt(N3, SEA_BRONZE, -0.5);
        if (z < 4) return fr(am * 9) < 0.3 ? toneAt(N3, SEA_BRONZE, 0.9) : toneAt(N3, SEA_BRONZE, 0.25);
        // slime toward its rim; verdigris running down from the bands in streaks
        if (z < 9 + 5 * hash(Math.floor(am * 9), 0, 5151)) return toneAt(N3, SLIME, 0.15);
        const st = Math.floor(am * 5.1);
        if (fr(am * 5.1) < 0.07 && hash(st, 2, 5152) < 0.6 && z < 50 && z > 14 + 30 * hash(st, 1, 5152)) return toneAt(N3, VERDIGRIS, 0.1);
        if (hash(Math.floor(am * 14), Math.floor(z / 4), 5152) < 0.05) return toneAt(N3, VERDIGRIS, 0);
        // the metal's sheen: a bright line down its lit side
        if (Math.abs(am - Math.PI * 1.25) < 0.05 && z > 14 && z < 66) return SEA_BRONZE[4];
        return toneAt(N3, SEA_BRONZE, 0.05);
      }, 1);
    }
  }
  // its crown: the lifting eye; the chain up from it into the dark
  S.rod(tilt([-3, 0, H]), tilt([-3, 0, H + 7]), 1.6, 1.6, SEA_BRONZE, 2);
  S.rod(tilt([3, 0, H]), tilt([3, 0, H + 7]), 1.6, 1.6, SEA_BRONZE, 2);
  S.rod(tilt([-3, 0, H + 7]), tilt([3, 0, H + 7]), 1.6, 1.6, SEA_BRONZE, 2);
  for (let i = 0; i < 12; i++) S.ball(tilt([0, 0, H + 9 + i * 3.2]), 1.1, i % 2 ? IRON : RUST, 3);
  if (gagged) {
    // the Order's chains wound round and round it, sagging; a padlock hanging off the lowest
    for (const z0 of [H * 0.78, H * 0.3]) {
      for (let i = 0; i <= 44; i++) {
        const a = (i / 44) * Math.PI * 2;
        const z = z0 - 2.5 * Math.cos(a - Math.PI * 0.25);
        S.ball(tilt([Math.cos(a) * (R + 1.4), Math.sin(a) * (R + 1.4), z]), 1, i % 3 ? IRON : RUST, 4);
      }
    }
    S.box(tilt([Math.cos(Math.PI * 0.18) * (R + 2.4), Math.sin(Math.PI * 0.18) * (R + 2.4), H * 0.3 - 6]), [[0.7, -0.7, 0], [0.7, 0.7, 0], [0, 0, 1]], [2.6, 1.1, 3.2], (_f, _u, _v, n) => toneAt(n, IRON, 0.2), 5);
  }
  return done(S, 100, 196);
}

/**
 * AN ALARM BELL AT A SLUICE (one of the Bells on this floor): an iron post by the sluice, a bracket out from its top,
 * the bell under it, its pull-chain hanging; a sewerman's tally board nailed to the post. Quiet; awake; rung.
 * 170 x 200 at (85, 150).
 */
function sluiceBell(state: number): Sprite {
  const S = scene(170, 200, 85, 150);
  slab(S, -5, -5, 5, 5, 0, 4, WSTONE, 1, -0.05);
  S.rod([0, 0, 4], [0, 0, 74], 1.8, 1.6, IRON, 2);
  S.ball([0, 0, 75], 2.2, IRON, 2);
  // the bracket out over the walkway, a scroll under it
  S.rod([0, 0, 70], [0, 20, 70], 0.9, 0.9, IRON, 3);
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    S.ball([0, 2 + 10 * t + Math.sin(t * 6.3) * 2, 63 + 6 * t + Math.cos(t * 6.3) * 2], 0.6, IRON, 3);
  }
  // the tally board: a plank with notches, nailed on
  slab(S, -4.5, 1.6, 4.5, 2.6, 30, 46, DEAL, 4, -0.1, (f, u, v) => (f === 2 && fr(v * 6) < 0.15 && u < 0.6 ? -0.8 : 0));
  // rust and slime up the post
  for (let i = 0; i < 8; i++) S.ball([Math.cos(i) * 1.6, Math.sin(i) * 1.6, 6 + i * 1.4], 0.9, i % 2 ? SLIME : RUST, 5);
  const c: V3 = [0, 18, 68.5];
  bell(S, c, 7, 14, SWING[state], 6, false, metalOf(state));
  rope(S, [0, 18 + 14 * Math.sin(SWING[state]), 68.5 - 14 * Math.cos(SWING[state])], [0, 16, 26], 0.4, 8, 0.45);
  const glow = bellGlow(S, c, 7, 14, state, [0, 18, 0]);
  return done(S, 85, 150, glow);
}

/** A SEWERMAN'S HANDBELL hung on the wall by a sluice (one of the Bells), on a hook, its rope down. Quiet; awake; rung. */
function wallBell(state: number): { left: Sprite; right: Sprite } {
  let glow: { at: V3; r: number; color: string; a?: number }[] = [];
  const sp = frontPiece((S, w) => {
    const Z = 58;
    S.rod(w(0, 0, Z), w(0, 9, Z), 1, 1, IRON, 1);
    S.rod(w(0, 9, Z), w(0, 9, Z - 3), 0.8, 0.8, IRON, 1);
    const c = w(0, 9, Z - 3);
    bell(S, c, 5.5, 10, SWING[state], 2, false, metalOf(state));
    for (let i = 0; i < 8; i++) S.ball(w(0, 7.5 - i * 0.1, Z - 14 - i * 3), 0.55, ROPE, 3);
    glow = bellGlow(S, c, 5.5, 10, state, w(0, 9, 0));
  }, 210, 200, () => glow, 64);
  return sp;
}

// =================================================================================================
// THE RAT KING'S

/**
 * THE KING'S NEST, where it lies up in the cistern: a great heap of gnawed rags and straw, bones, corks by the
 * hundred and shards of green glass, the broken jars it fed on; the voices still leaking pink out of the cracked
 * ones, a few whole jars it has dragged in to keep. Built half as big again as it is measured: 260 x 170 at (130, 112).
 */
function kingsNest(): Sprite {
  const S = turned(scene(260, 170, 130, 112), 0, 1.5);
  rags(S, 0, 0, 14, 1, 3, 26);
  rags(S, -8, 6, 8, 20, 7, 14);
  // straw through it
  for (let i = 0; i < 40; i++) {
    const a = i * 2.39;
    const d = 6 + 22 * hash(i, 0, 5161);
    const c: V3 = [Math.cos(a) * d, Math.sin(a) * d, 3 + 3 * hash(i, 1, 5161)];
    const b: V3 = [c[0] + Math.cos(a * 3) * 5, c[1] + Math.sin(a * 3) * 5, c[2] + 1];
    S.rod(c, b, 0.35, 0.3, STRAW, 30 + (i % 4));
  }
  // bones, gnawed
  for (let i = 0; i < 7; i++) boneAt(S, Math.cos(i * 1.9) * (14 + i * 2), Math.sin(i * 1.9) * (10 + i * 1.5), i * 0.9, 6 + (i % 3) * 2, 40 + i);
  // the jars: broken ones leaking, whole ones kept
  jar(S, -16, -10, 3, 13, 4.2, 60, 2, true);
  jar(S, 10, -14, 2, 14, 4.4, 64, 2, true);
  jar(S, 18, 4, 1, 15, 4.6, 68, 1, false);
  jar(S, -22, 10, 1, 12, 4, 72, 1, false);
  wisps(S, [-16, -10, 12], 6, 1, 18);
  wisps(S, [10, -14, 12], 5, 2, 16);
  // corks and shards scattered round it
  for (let i = 0; i < 26; i++) {
    const a = i * 2.17 + 0.5;
    const d = 24 + 14 * hash(i, 2, 5161);
    const x = Math.cos(a) * d;
    const y = Math.sin(a) * d * 0.8;
    if (i % 3) S.egg([x, y, 1], [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]], [1.6, 1.3, 1.1], (n) => toneAt(n, CORK, 0.1), 80 + (i % 6));
    else S.quad([[x - 1.5, y, 0.4], [x + 1.5, y - 1, 0.4], [x + 1, y + 1.5, 0.4], [x - 1, y + 1, 0.4]], () => GLASS[i % 2 ? 4 : 2], 90 + (i % 6));
  }
  return done(S, 130, 112, [
    { at: [-16, -10, 12], r: 30, color: '#ff4f8a', a: 0.35 },
    { at: [10, -14, 12], r: 28, color: '#ff4f8a', a: 0.3 },
  ]);
}

/**
 * SMASHED VOICE JARS (a breakable): a few of the Order's jars knocked over and broken, the green glass in shards, the
 * voices leaking out pink; one still whole. `v` 0 or 1. 110 x 100 at (55, 76).
 */
function smashedJars(v: number): Sprite {
  const S = scene(110, 100, 55, 76);
  const spots: [number, number, boolean][] = v === 0 ? [[-8, -6, true], [6, -9, false], [10, 6, true], [-6, 8, true]] : [[-10, 0, true], [4, -10, true], [9, 5, false]];
  spots.forEach(([x, y, broken], i) => jar(S, x, y, 0.5, 13 + (i % 2) * 2, 4.2, 1 + i * 4, broken ? 2 : 1, broken));
  spots.forEach(([x, y, broken], i) => {
    if (broken) wisps(S, [x, y, 9], 5, i + v * 3, 16);
  });
  for (let i = 0; i < 18; i++) {
    const a = i * 2.3 + v;
    const d = 10 + 12 * hash(i, v, 5171);
    const x = Math.cos(a) * d;
    const y = Math.sin(a) * d * 0.8;
    S.quad([[x - 1.6, y, 0.4], [x + 1.4, y - 1.2, 0.4], [x + 1.1, y + 1.4, 0.4], [x - 1.2, y + 1.1, 0.4]], () => GLASS[i % 3 ? 3 : 4], 40 + (i % 5));
  }
  return done(S, 55, 76, [{ at: [0, 0, 8], r: 24, color: '#ff4f8a', a: 0.3 }]);
}

/**
 * A CRATE OF JARS, GNAWED OPEN (a breakable): a deal crate of the Order's, a corner gnawed through, straw spilling, the
 * jars inside showing, one dragged half out. `v` 0 or 1. 110 x 110 at (55, 86).
 */
function gnawedCrate(v: number): Sprite {
  const S = scene(110, 110, 55, 86);
  const W = 15;
  const D = 11;
  const Hh = 18;
  const gnawed = (x: number, y: number, z: number): boolean => {
    const cx = v === 0 ? W : -W;
    return Math.hypot(x - cx, y - D, (z - Hh) * 0.8) < 9 + 2 * Math.sin(x * 1.3 + z);
  };
  S.box([0, 0, Hh / 2], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [W, D, Hh / 2], (f, u, vv, n) => {
    const x = f === 0 ? W : f === 1 ? -W : (u * 2 - 1) * W;
    const y = f === 2 ? D : f === 3 ? -D : f >= 4 ? (vv * 2 - 1) * D : (u * 2 - 1) * D;
    const z = f === 4 ? Hh : f === 5 ? 0 : vv * Hh;
    if (gnawed(x, y, z)) return null;
    const p = planks(3)(f, u, vv);
    return toneAt(n, DEAL, p + (fr(u * 9 + vv * 3) < 0.1 ? -0.3 : 0));
  }, 1);
  // inside, through the hole: straw, jars
  const hx = v === 0 ? W - 4 : -W + 4;
  jar(S, hx, D - 5, 6, 12, 3.8, 10, 1, false);
  for (let i = 0; i < 14; i++) {
    const a = i * 1.7;
    S.rod([hx + Math.cos(a) * 4, D - 2 + Math.sin(a) * 2, 13 + (i % 3)], [hx + Math.cos(a) * 9, D + 4 + Math.sin(a) * 3, 2 + (i % 4)], 0.35, 0.3, STRAW, 20 + (i % 3));
  }
  // one dragged half out, lying on its side
  S.egg([hx + (v === 0 ? 8 : -8), D + 8, 3.6], [[0, 1, 0], [1, 0, 0], [0, 0, 1]], [6.5, 3.6, 3.6], (n) => toneAt(n, GLASS, 0.05), 30);
  S.ball([hx + (v === 0 ? 8 : -8), D + 15, 3.6], 1.6, CORK, 31);
  // the gnawed edge: pale splinters
  for (let i = 0; i < 10; i++) {
    const a = i * 0.6;
    S.ball([(v === 0 ? W : -W) + Math.cos(a) * 8 * (v === 0 ? -1 : 1) * 0.6, D, Hh - Math.sin(a) * 8], 0.6, DEAL, 32, undefined, 0.6);
  }
  return done(S, 55, 86);
}

/** A NICHE OF BOTTLED VOICES, cut into the brick: an arched recess, two shelves of corked jars in it, the voices in them burning pink. */
function jarNiche(): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    // the recess: dark, an arch of brick on end round it
    S.quad([w(-17, 0.4, 8), w(17, 0.4, 8), w(17, 0.4, 62), w(-17, 0.4, 62)], (u, v) => {
      const a = (u - 0.5) * 34;
      const z = 8 + v * 54;
      if (z > 50 && Math.hypot(a, z - 50) > 17) return null;
      return HOLE;
    }, 1);
    for (let i = 0; i < 13; i++) {
      const ang = Math.PI * (i / 12);
      S.ball(w(-Math.cos(ang) * 19, 1, 50 + Math.sin(ang) * 19), 1.7, SBRICK, 2, undefined, 0.2);
    }
    // two shelves, rough planks; jars on each
    for (const z of [10, 32]) {
      S.rod(w(-16, 2.5, z), w(16, 2.5, z), 1.1, 1.1, ROT, 3);
      for (let k = 0; k < 5; k++) {
        const a = -12.5 + k * 6.2 + hash(k, z, 5181) * 1.2;
        const p = w(a, 4, z + 1.2);
        jar(S, p[0], p[1], p[2], 10 + (k % 2) * 2, 2.8, 10 + k * 3 + z, hash(k, z, 5182) < 0.7 ? 1 : 0);
      }
    }
  }, 80, 130, (S, w) => [{ at: w(0, 4, 26), r: 30, color: '#ff4f8a', a: 0.3 }]);
}

/** RAT HOLES at the wall's foot: ragged holes gnawed through the brick, rubble under them; in two of them, eyes burning pink (`eyes`). */
function ratHoles(eyes: boolean): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    const holes: [number, number, number][] = [[-14, 3, 5], [3, 1, 6], [16, 4, 4]];
    holes.forEach(([a, z, r], i) => {
      S.quad([w(a - r - 2, 0.3, 0), w(a + r + 2, 0.3, 0), w(a + r + 2, 0.3, z + r * 2 + 2), w(a - r - 2, 0.3, z + r * 2 + 2)], (u, v) => {
        const x = (u - 0.5) * (2 * r + 4);
        const zz = v * (z + r * 2 + 2);
        const d = Math.hypot(x / r, (zz - z - r * 0.7) / (r * 0.9)) + 0.15 * Math.sin(x * 2 + zz);
        if (d > 1.15) return null;
        if (d > 0.92) return SBRICK[3];
        return HOLE;
      }, 1 + i);
      // rubble and droppings under it
      for (let k = 0; k < 4; k++) S.ball(w(a - 3 + k * 2, 2 + (k % 2) * 1.5, 0.8), 0.9, SBRICK, 10 + i, undefined, -0.1);
      if (eyes && i !== 2) {
        for (const s of [-1, 1]) S.ball(w(a + s * 1.4, 1, z + r * 0.8), 0.55, VOICE, 20 + i, undefined, 0.6);
      }
    });
  }, 70, 60, (S, w) => (eyes ? [{ at: w(-6, 2, 8), r: 10, color: '#ff4f8a', a: 0.25 }] : []));
}

/** GNAWED BONES AND RAGS, strewn flat on the floor where the King has fed: scraps of cloth, small bones, corks. Laid flat: 130 x 76 at (65, 38). */
function bonesAndRags(): Sprite {
  return lying(130, 76, 65, 38, (u, v, px, py) => {
    const d = Math.hypot(u / 1.1, v / 0.85);
    if (d > 1.05) return null;
    // rag scraps in patches
    const r = Math.sin(u * 6.1 + 1) * Math.cos(v * 5.3) + 0.4 * Math.sin((u + v) * 11);
    if (r > 0.55 && d < 0.9) return fr(u * 9) < 0.15 ? RAG[1] : r > 0.9 ? RAG[3] : RAG[2];
    // small bones: short pale strokes
    const bx = Math.floor(px / 13);
    const by = Math.floor(py / 7);
    if (hash(bx, by, 5191) < 0.35) {
      const ax = bx * 13 + 3;
      const ay = by * 7 + 3;
      if (py === ay && px - ax >= 0 && px - ax < 6) return px - ax === 0 || px - ax === 5 ? BONE[4] : BONE[3];
      if (py === ay + 1 && px - ax >= 0 && px - ax < 6) return BONE[1];
    }
    // corks
    if (hash(px >> 2, py >> 1, 5192) < 0.06 && d < 0.95) return (px & 3) < 2 ? CORK[3] : CORK[2];
    return null;
  });
}

/**
 * THE JAR OF THE CRIER'S VOICE (the quest): the greatest of the Order's jars, sealed with its black wax and corded,
 * a scrap of the crier's oxblood coat tied round its neck for a label; inside, his voice, the first the Order took,
 * held still: a pale light. 110 x 120 at (55, 96).
 */
function criersJar(): Sprite {
  const S = scene(110, 120, 55, 96);
  slab(S, -14, -14, 14, 14, 0, 3, WSTONE, 1, 0.05);
  jar(S, 0, 0, 3, 32, 12.5, 2, 2, false, PALE);
  // the black wax over its cork, dripping down the neck
  S.egg([0, 0, 38.2], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [6.2, 6.2, 2.4], (n) => toneAt(n, BLACK, 0.3), 6);
  for (let i = 0; i < 6; i++) S.rod([Math.cos(i * 1.1) * 5.2, Math.sin(i * 1.1) * 5.2, 37], [Math.cos(i * 1.1) * 5.6, Math.sin(i * 1.1) * 5.6, 32 - (i % 3) * 2], 0.8, 0.55, BLACK, 7);
  // the scrap of oxblood coat tied round its neck, its ends hanging
  cylinder(S, 0, 0, 5.9, 29.5, 31.8, (n) => toneAt(n, ['#2e161c', '#4a2226', '#6a302e', '#86423a', '#a05a48'], 0.1), 8);
  S.quad([[3, 5, 30.5], [5, 6, 30.5], [6.5, 8.5, 20], [4.5, 7.5, 21]], () => '#6a302e', 9);
  return done(S, 55, 96, [{ at: [0, 0, 16], r: 34, color: '#e8e2d2', a: 0.35 }]);
}

// =================================================================================================
// THE SEWERMEN'S LEAVINGS

/** A SEWERMAN'S PUNT, hauled up and turned over: a flat-bottomed boat of tarred planks, its pole beside it. 190 x 110 at (95, 70). */
function punt(): Sprite {
  const S = scene(190, 110, 95, 70);
  // the hull upside down: its bottom a flat of planks, its sides sloping in to the floor
  const L = 46;
  const B = 13;
  const Hh = 10;
  S.quad([[-L, -B, Hh], [L, -B, Hh], [L, B, Hh], [-L, B, Hh]], (u, v) => (fr(v * 5) < 0.1 ? ROT[0] : toneAt([0, 0, 1], ROT, (hash(Math.floor(v * 5), Math.floor(u * 4), 5201) - 0.5) * 0.3)), 1);
  for (const s of [-1, 1]) {
    S.quad([[-L, s * B, Hh], [L, s * B, Hh], [L - 3, s * (B + 4), 0.5], [-L + 3, s * (B + 4), 0.5]], (u, v) => (fr(v * 2) < 0.12 ? ROT[0] : toneAt(facing(S, [0, s * 0.8, -0.4]), ROT, 0.1)), 2 + (s > 0 ? 1 : 0));
  }
  // its square ends, raked
  for (const s of [-1, 1]) S.quad([[s * L, -B, Hh], [s * L, B, Hh], [s * (L + 6), B + 3, 1], [s * (L + 6), -B - 3, 1]], () => toneAt(facing(S, [s * 0.8, 0, 0.5]), ROT, 0), 4 + (s > 0 ? 1 : 0));
  // slime along its gunwales where they sit in the wet
  S.quad([[-L + 3, B + 4, 0.6], [L - 3, B + 4, 0.6], [L - 3, B + 5, 0.6], [-L + 3, B + 5, 0.6]], () => SLIME[2], 6);
  // the pole, lying beside it
  S.rod([-50, 24, 1.2], [44, 30, 1.2], 1.1, 1.1, ROT, 7);
  return done(S, 95, 70);
}

/** EEL TRAPS (a breakable): wicker cones stacked, a net over one, a cork float. `v` 0 or 1. 110 x 90 at (55, 68). */
function eelTraps(v: number): Sprite {
  const S = scene(110, 90, 55, 68);
  const cone = (c: V3, dir: V3, len: number, r: number, id: number): void => {
    const d = dir;
    const e1: V3 = [-d[1], d[0], 0];
    for (let k = 0; k < 10; k++) {
      const t = k / 10;
      const rr = r * (1 - t * 0.7);
      const p: V3 = [c[0] + d[0] * len * t, c[1] + d[1] * len * t, c[2]];
      S.egg(p, [d, e1, [0, 0, 1]], [len / 18, rr, rr], (n, w) => (fr((w[0] * d[0] + w[1] * d[1]) / 2.2) < 0.3 || fr(Math.atan2(w[2] - c[2], (w[0] - c[0]) * e1[0] + (w[1] - c[1]) * e1[1]) * 2) < 0.25 ? toneAt(n, WICKER, -0.4) : toneAt(n, WICKER, 0.1)), id);
    }
  };
  cone([-14, -4, 6], [1, 0.2, 0], 30, 6, 1);
  cone([-10, 8, 6], [1, -0.1, 0], 28, 6, 2);
  if (v === 0) cone([-12, 2, 17], [1, 0.05, 0], 26, 5, 3);
  // the net, draped
  S.quad([[-14, -10, 12], [14, -10, 10], [16, 14, 4], [-12, 14, 6]], (u, vv, w) => (checker(S, w, 2) && (fr(u * 8) < 0.2 || fr(vv * 8) < 0.2) ? ROPE[2] : null), SOFT_ID + 6);
  S.ball([18, 12, 2], 2.4, CORK, 4);
  return done(S, 55, 68);
}

/** A SEWERMAN'S LANTERN on a hook in the wall: an old iron lantern, its horn panes, a stub of candle burning (an honest light). `lit` or out. */
function sewerLantern(lit: boolean): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    const Z = 54;
    S.rod(w(0, 0, Z + 6), w(0, 7, Z + 6), 0.9, 0.9, IRON, 1);
    S.rod(w(0, 7, Z + 6), w(0, 7, Z + 2), 0.7, 0.7, IRON, 1);
    // its cage: four posts, a cap, a base; horn panes between, warm when lit
    const c = w(0, 7, Z - 6);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      S.rod([c[0] + Math.cos(a) * 3.2, c[1] + Math.sin(a) * 3.2, c[2] - 6], [c[0] + Math.cos(a) * 3.2, c[1] + Math.sin(a) * 3.2, c[2] + 6], 0.5, 0.5, IRON, 2);
    }
    cylinder(S, c[0], c[1], 3, c[2] - 6, c[2] + 6, (n, a, z) => (lit ? (Math.abs(z - c[2]) < 3 && Math.cos(a - Math.PI / 4) > 0 ? CANDLE[4] : CANDLE[2]) : toneAt(n, ['#2a2418', '#3e3622', '#55492e', '#6e5f3c', '#88764c'], 0)), 3);
    S.egg([c[0], c[1], c[2] + 7.5], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3.8, 3.8, 2], (n) => toneAt(n, IRON, 0.1), 4);
    S.rod([c[0], c[1], c[2] - 6.5], [c[0], c[1], c[2] - 7.5], 3.6, 3.6, IRON, 5);
  }, 50, 100, (S, w) => (lit ? [{ at: w(0, 7, 48), r: 40, color: '#f0a040', a: 0.55 }] : []));
}

/**
 * LIGHT FROM THE STREET ABOVE, fallen through a grate (laid on the floor): the grate's bars in a warm patch of the
 * Gate Ward's lamplight, dust in it. Its light. Laid flat: 150 x 90 at (75, 45).
 */
const STREET_LIGHT = ['#8a6438', '#b08048', '#d8a860', '#f0c880'];
function streetLight(): Sprite {
  // (where the light falls: in the grate's shape, not under a bar's shadow; a picture pixel (px, py) of the floor)
  const lit = (px: number, py: number): number => {
    const a = (px + 0.5 - 75) / 32;
    const b = (py + 0.5 - 45) / 16;
    const u = (a + b) / 2;
    const v = (b - a) / 2;
    const soft = Math.max(Math.abs(u) / 0.75, Math.abs(v) / 0.6);
    if (soft > 1.02 || fr((u + 0.75) * 4.2) < 0.22) return -1;
    return soft;
  };
  return lying(150, 90, 75, 45, (_u, _v, px, py) => {
    // laid over the floor in a fine dither, so the flags show through it; brighter in its heart
    if (((px + py) & 1) !== 0) return null;
    const soft = lit(px, py);
    if (soft < 0) return null;
    // (none left alone at its corners)
    if (lit(px - 1, py - 1) < 0 && lit(px + 1, py - 1) < 0 && lit(px - 1, py + 1) < 0 && lit(px + 1, py + 1) < 0) return null;
    if (soft > 0.82) return STREET_LIGHT[1];
    return soft < 0.5 || hash(px >> 1, py >> 1, 5211) < 0.05 ? STREET_LIGHT[3] : STREET_LIGHT[2];
  }, [{ x: 75 / 2, y: 45 / 2, r: 60, color: '#d89a50', a: 0.45 }]);
}
bright(STREET_LIGHT);

/**
 * A CHAIN HOIST the Order rigged to drag the diver's bell: a timber gantry of two legs and a beam, a pulley block
 * hanging from it, its chain run down to a great iron hook, a loop of slack chain on the floor. 150 x 230 at (75, 196).
 */
function chainHoist(): Sprite {
  const S = scene(150, 230, 75, 196);
  timber(S, [-26, -8, 0], [-14, 0, 120], 3, 1);
  timber(S, [-26, 8, 0], [-14, 0, 120], 3, 1);
  timber(S, [26, -8, 0], [14, 0, 120], 3, 2);
  timber(S, [26, 8, 0], [14, 0, 120], 3, 2);
  timber(S, [-18, 0, 118], [18, 0, 118], 3.4, 3, [0.1, 0.9]);
  // the pulley block, its wheel
  S.box([0, 0, 106], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3, 2.4, 6], (_f, _u, _v, n) => toneAt(n, ROT, 0), 4);
  S.rod([0, 0, 112], [0, 0, 116], 0.9, 0.9, IRON, 4);
  // the chain down to the hook, and back up as the hauling end
  for (let i = 0; i < 24; i++) S.ball([-1.2, 1, 100 - i * 3], 0.9, i % 3 ? IRON : RUST, 5);
  for (let i = 0; i < 26; i++) S.ball([1.6, 1, 100 - i * 3.6], 0.8, IRON, 6);
  // the hook
  for (let i = 0; i <= 14; i++) {
    const a = (i / 14) * Math.PI * 1.3 - 0.2;
    S.ball([-1.2 + Math.cos(a + Math.PI) * 4.5, 1, 24 - Math.sin(a) * 4.5 - 3], 1.3, IRON, 7, undefined, 0.1);
  }
  // the slack on the floor
  for (let i = 0; i < 30; i++) {
    const a = i * 0.42;
    S.ball([4 + Math.cos(a) * (4 + i * 0.25), 6 + Math.sin(a) * (3 + i * 0.2), 1], 0.85, i % 4 ? IRON : RUST, 8);
  }
  return done(S, 75, 196);
}

/** PALE TOADSTOOLS in the wet, a cluster at the foot of a wall or a post: domes and stalks, the gills dark (no glow). `v` 0 or 1. Built a little bigger than measured: 90 x 76 at (45, 58). */
function toadstools(v: number): Sprite {
  const S = turned(scene(90, 76, 45, 58), 0, 1.4);
  const n = v === 0 ? 7 : 5;
  for (let i = 0; i < n; i++) {
    const a = i * 2.4 + v;
    const d = i === 0 ? 0 : 3 + 5 * hash(i, v, 5221);
    const x = Math.cos(a) * d;
    const y = Math.sin(a) * d;
    const h = 3 + 6 * hash(i, v + 1, 5221);
    const r = 1.6 + 2.4 * hash(i, v + 2, 5221);
    S.rod([x, y, 0], [x, y, h], 0.7, 0.55, TOAD, 1 + i);
    S.egg([x, y, h], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [r, r, r * 0.55], (nn) => (nn[2] < 0.1 ? TOAD[1] : toneAt(nn, TOAD, 0.15)), 20 + i);
  }
  return done(S, 45, 58);
}

/** ROOTS through the vault, hanging down the wall from the dark above, thinning to threads; drips on their tips. */
function roots(): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    for (let k = 0; k < 7; k++) {
      let a = -18 + k * 6 + hash(k, 0, 5231) * 3;
      let z = 108;
      const end = 30 + 40 * hash(k, 1, 5231);
      let r = 1.6 - k * 0.08;
      while (z > end) {
        const na = a + (hash(k, Math.floor(z), 5232) - 0.5) * 3;
        const nz = z - 4;
        S.rod(w(a, 1 + r, z), w(na, 1 + r, nz), r, r * 0.9, ROOT, 1 + k);
        a = na;
        z = nz;
        r = Math.max(0.35, r * 0.93);
      }
      S.ball(w(a, 1.2, z - 1.5), 0.5, ['#3e4a3e', '#56645a', '#76847a', '#9aa894', '#b8c2b0'], SOFT_ID + 7);
    }
  }, 64, 140);
}

/** A DOOR INTO THE ORDER'S STORE, set in the raw earth: a frame of rough timber, a door of planks, the Order's blank mask daubed on it. Shut or open. */
function storeDoor(open: boolean): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    // the frame
    S.rod(w(-14, 1, 0), w(-14, 1, 56), 2, 2, ROT, 1);
    S.rod(w(14, 1, 0), w(14, 1, 56), 2, 2, ROT, 1);
    S.rod(w(-17, 1, 56), w(17, 1, 56), 2.4, 2.4, ROT, 2);
    // the dark beyond
    S.quad([w(-12, 0.2, 0), w(12, 0.2, 0), w(12, 0.2, 54), w(-12, 0.2, 54)], () => HOLE, 3);
    // the door: planks, a batten, its mask daubed in white
    const hinge = -12;
    const ang = open ? 1.3 : 0;
    const P = (a: number, z: number): V3 => w(hinge + (a - hinge) * Math.cos(ang), 0.8 + (a - hinge) * Math.sin(ang), z);
    S.quad([P(-12, 0), P(12, 0), P(12, 54), P(-12, 54)], (u, v) => {
      const a = (u - 0.5) * 24;
      const z = v * 54;
      if (fr(u * 5) < 0.08) return ROT[0];
      if (Math.abs(z - 14) < 1.6 || Math.abs(z - 42) < 1.6) return ROT[3];
      if (!open) {
        const mx = a / 6;
        const my = (z - 32) / 8;
        if ((mx * mx) / 0.8 + my * my < 1) return Math.abs(Math.abs(mx) - 0.36) < 0.18 && Math.abs(my + 0.15) < 0.07 ? ROT[0] : MASK[2];
      }
      return ROT[(hash(Math.floor(u * 5), 0, 5241) * 2 + 1) | 0];
    }, 4);
  }, 96, 100, undefined, 18);
}

/** AN IRON SEWER DOOR in a brick arch: iron-banded oak, studded, its great ring; rust and slime at its foot. Shut or open. */
function ironDoor(open: boolean): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    // the arch of brick on end
    for (let i = 0; i < 17; i++) {
      const ang = Math.PI * (i / 16);
      S.ball(w(-Math.cos(ang) * 17, 1, 44 + Math.sin(ang) * 17), 2.1, SBRICK, 1, undefined, 0.15);
    }
    for (const s of [-1, 1]) for (let z = 1; z < 44; z += 4) S.ball(w(s * 17, 1, z), 2, SBRICK, 1, undefined, (z / 4) % 2 ? 0.1 : -0.1);
    S.quad([w(-15, 0.2, 0), w(15, 0.2, 0), w(15, 0.2, 60), w(-15, 0.2, 60)], (u, v) => {
      const a = (u - 0.5) * 30;
      const z = v * 60;
      return z > 44 && Math.hypot(a, z - 44) > 15 ? null : HOLE;
    }, 2);
    const hinge = -15;
    const ang = open ? 1.35 : 0;
    const P = (a: number, z: number): V3 => w(hinge + (a - hinge) * Math.cos(ang), 0.8 + (a - hinge) * Math.sin(ang), z);
    S.quad([P(-15, 0), P(15, 0), P(15, 59), P(-15, 59)], (u, v) => {
      const a = (u - 0.5) * 30;
      const z = v * 59;
      if (z > 44 && Math.hypot(a, z - 44) > 15) return null;
      if (Math.abs(z - 10) < 1.5 || Math.abs(z - 30) < 1.5 || Math.abs(z - 48) < 1.5) return fr(a / 4) < 0.25 ? IRON[4] : IRON[2];
      if (z < 7 + 3 * hash(Math.floor(u * 9), 0, 5251)) return SLIME[2];
      if (fr(u * 6) < 0.07) return ROT[0];
      return ROT[2];
    }, 3);
    if (!open) {
      for (let i = 0; i <= 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        S.ball(w(8 + Math.cos(a) * 2.6, 1.6, 26 + Math.sin(a) * 2.6), 0.6, IRON, 4);
      }
    }
  }, 96, 100, undefined, 18);
}

/**
 * A SINKHOLE in the flags (a floor tile): the walkway's stones cracked and fallen in round a ragged hole, the green
 * water glinting down in it. Laid flat: 100 x 56 at (50, 28).
 */
function sinkhole(): Sprite {
  return lying(100, 56, 50, 28, (u, v, px, py) => {
    if (Math.abs(u) > 0.48 || Math.abs(v) > 0.48) return null;
    const d = Math.hypot(u, v) + 0.06 * Math.sin(Math.atan2(v, u) * 5);
    if (d > 0.46) return null;
    if (d > 0.34) {
      // the broken flags round it, tipped in, cracked
      if (fr(Math.atan2(v, u) * 1.3) < 0.08) return WSTONE[0];
      return d > 0.41 ? WSTONE[3] : WSTONE[2];
    }
    if (d > 0.29) return WSTONE[0];
    // the hole: dark, the water deep in it, a glint
    if (d < 0.2 && v > 0.02) return hash(px, py, 5261) < 0.05 ? GWATER[4] : GWATER[1];
    return HOLE;
  });
}

/** A SEWERMAN'S BARROW, left: a wooden barrow, a shovel and a rake across it, a bucket by its wheel, a rag. 120 x 100 at (60, 76). */
function barrow(): Sprite {
  const S = scene(120, 100, 60, 76);
  // the tray: a box of planks, sloping
  S.box([0, 0, 13], [[1, 0, 0.15], [0, 1, 0], [-0.15, 0, 1]], [14, 9, 5], (f, u, v, n) => (f === 4 ? toneAt(n, ROT, -0.4) : toneAt(n, ROT, planks(4)(f, u, v))), 1);
  // the wheel at its front, the legs at its back, the handles
  for (let i = 0; i <= 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    S.ball([17 + Math.cos(a) * 6, 0, 6 + Math.sin(a) * 6], 1.2, ROT, 2);
  }
  S.ball([17, 0, 6], 1.6, IRON, 3);
  for (const s of [-1, 1]) {
    S.rod([-12, s * 7, 9], [-14, s * 7, 0.5], 0.9, 0.9, ROT, 4);
    S.rod([-10, s * 8, 14], [-30, s * 10, 18], 0.9, 0.8, ROT, 5);
  }
  // a shovel across it, and a rake
  S.rod([-16, -6, 20], [16, 8, 22], 0.8, 0.8, ROT, 6);
  S.box([18, 9, 22], [[0.9, 0.4, 0], [-0.4, 0.9, 0], [0, 0, 1]], [3.5, 2.6, 0.5], (_f, _u, _v, n) => toneAt(n, IRON, 0), 7);
  S.rod([-14, 8, 20], [14, -6, 20], 0.7, 0.7, ROT, 8);
  for (let i = 0; i < 5; i++) S.rod([14 + i * 0.4, -6 - 2 + i, 20], [15 + i * 0.4, -6 - 2 + i, 17], 0.3, 0.3, IRON, 9);
  // a bucket by the wheel
  cylinder(S, 20, 14, (z) => 4 + z * 0.08, 0, 9, (n, a) => (fr(a * 1.6) < 0.1 ? toneAt(n, IRON, 0.4) : toneAt(n, ROT, 0)), 10, (_a, rr) => (rr < 0.8 ? GWATER[1] : ROT[1]));
  return done(S, 60, 76);
}

// =================================================================================================

let made: Piece[] | null = null;
/** FLOOR 12'S PIECES, the Rat King's: 25. */
export function undercityPieces(): Piece[] {
  if (made) return made;
  made = [
    // (frames: shut and open along +y, shut and open along +x)
    { name: 'a sluice gate', kind: 'gate', frames: [0, 1].flatMap((k) => [sluiceGate(false, k), sluiceGate(true, k)]), shadow: 1.2 },
    { name: "the sluice's winch", kind: 'obstacle', frames: [winch()], shadow: 0.6 },
    // (frames: quiet, the warning, the rush three, looking along +y; the same along +x)
    { name: 'the flood, a sluice bursting', kind: 'trap', frames: [0, 1].flatMap((k) => [0, 1, 2, 3, 4].map((f) => floodTrap(f, k))), shadow: 0.4 },
    { name: 'a slick of slime', kind: 'trap', frames: [slick(0), slick(1)] },
    { name: "the diver's bell (the Muffled Bell)", kind: 'obstacle', frames: [diversBell(true), diversBell(false, 0), diversBell(false, 0.12), diversBell(false, -0.12)], shadow: 1.1 },
    // (the Bells: quiet, awake, rung one way, rung back)
    { name: 'an alarm bell at a sluice', kind: 'obstacle', frames: [0, 1, 2, 3].map(sluiceBell), shadow: 0.3 },
    { name: "a sewerman's handbell", kind: 'on the wall', ...withFramesN([0, 1, 2, 3].map(wallBell)) },
    { name: "the King's nest", kind: 'obstacle', frames: [kingsNest()], shadow: 1.1 },
    { name: 'smashed voice jars', kind: 'breakable', frames: [smashedJars(0), smashedJars(1)], shadow: 0.35 },
    { name: 'a crate of jars, gnawed open', kind: 'breakable', frames: [gnawedCrate(0), gnawedCrate(1)], shadow: 0.4 },
    { name: 'a niche of bottled voices', kind: 'on the wall', ...withFrames(jarNiche()) },
    { name: 'rat holes', kind: 'on the wall', ...withFramesN([ratHoles(true), ratHoles(false)]) },
    { name: 'gnawed bones and rags', kind: 'on the floor', frames: [bonesAndRags()] },
    { name: "the jar of the Crier's voice", kind: 'quest', frames: [criersJar()], shadow: 0.3 },
    { name: "a sewerman's punt, hauled up", kind: 'obstacle', frames: [punt()], shadow: 1.0 },
    { name: 'eel traps', kind: 'breakable', frames: [eelTraps(0), eelTraps(1)], shadow: 0.45 },
    { name: "a sewerman's lantern", kind: 'on the wall', ...withFramesN([sewerLantern(true), sewerLantern(false)]) },
    { name: 'light from the street above', kind: 'on the floor', frames: [streetLight()] },
    { name: 'a chain hoist', kind: 'obstacle', frames: [chainHoist()], shadow: 0.7 },
    { name: 'pale toadstools', kind: 'on the floor', frames: [toadstools(0), toadstools(1)], shadow: 0.12 },
    { name: 'roots through the vault', kind: 'on the wall', ...withFrames(roots()) },
    { name: "a door into the Order's store", kind: 'door', ...withFramesN([storeDoor(false), storeDoor(true)]) },
    { name: 'an iron sewer door', kind: 'door', ...withFramesN([ironDoor(false), ironDoor(true)]) },
    { name: 'a sinkhole in the flags', kind: 'floor tile', frames: [sinkhole()] },
    { name: "a sewerman's barrow", kind: 'obstacle', frames: [barrow()], shadow: 0.5 },
  ];
  return made;
}

function withFrames(s: { left: Sprite; right: Sprite }): { left: Sprite[]; right: Sprite[] } {
  return { left: [s.left], right: [s.right] };
}
function withFramesN(ss: { left: Sprite; right: Sprite }[]): { left: Sprite[]; right: Sprite[] } {
  return { left: ss.map((s) => s.left), right: ss.map((s) => s.right) };
}

