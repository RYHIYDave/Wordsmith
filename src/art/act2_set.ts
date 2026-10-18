// ACT 2, THE HUSH (floors 11 to 15): THE SET'S OWN PIECES, for all five of its floors (a mock-up; nothing of
// the game imports it).
//
// His rule for a set of floors from the second on (10 Oct, 14:54): “Going forward, let’s do 25 that are the
// theme of the 5 levels, then 25 for each boss.” The theme of these five is the Hush: the city going quiet
// because the cult's inner circle, the Silent Order, is stealing its words, voices first and then names, and
// carrying them off in jars to be pulped and bound into a book (his doc "Wordsmith Act 2: The Hush"). So the
// set's pieces are the Silent Order's (its black banners with the blank mask, its hooded lanterns of the
// cult's fire, its jars of stolen voices whispering pink, its ink over everything) and the city's own, as all
// five floors have them (lamps, barrels and crates, chimneys, the dome's shards, rubble of the siege).
//
// THE RULES THEY KEEP: as art/act2_kit.ts says. The stolen voices in their jars and the dome's shards glow the
// enemy's pink, faintly (Colour 3); a city lamp burns an honest orange.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { toneAt } from './floor4';
import type { Scene, V3 } from './floor4';
import { timber } from './floor6';
import type { Piece } from './floorkit';
import { hash, mix } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { EMBER } from './props';
import { BLACK, BRICK, CLAY, CHAR, DEAL, HOLE, IRON, MASK, OAK, SOFT_ID, STONE, checker, cylinder, dim, done, facing, frontPiece, local, lying, planks, scene, slab, turned } from './act2_kit';

const fr = (t: number): number => t - Math.floor(t);

// =================================================================================================
// THE CITY'S

/** A STREET LAMP: an iron post on a stone foot, a crook at its top, a lantern hung from it with its honest flame (two frames). 60 x 170 at (30, 150). */
function streetLamp(f: number): Sprite {
  const S = scene(60, 170, 30, 150);
  slab(S, -5, -5, 5, 5, 0, 8, STONE, 1, 0.05);
  S.rod([0, 0, 8], [0, 0, 104], 1.5, 1.1, IRON, 2);
  // its crook, out over the street
  for (let k = 0; k < 8; k++) {
    const a = (k / 7) * Math.PI * 0.6;
    const b = ((k + 1) / 7) * Math.PI * 0.6;
    S.rod([0, Math.sin(a) * 9, 104 + (1 - Math.cos(a)) * -2 + Math.sin(a) * 4], [0, Math.sin(b) * 9, 104 + (1 - Math.cos(b)) * -2 + Math.sin(b) * 4], 1, 1, IRON, 2);
  }
  // the lantern: an iron cage with panes, a little roof, the flame inside
  const c: V3 = [0, 10, 96];
  S.box([c[0], c[1], c[2] + 9], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3.4, 3.4, 1.4], (_f, _u, _v, n) => toneAt(n, IRON, 0.2), 3);
  S.box(c, [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3, 3, 7.4], (face, u, v, n) => {
    if (face >= 4) return toneAt(n, IRON, 0);
    if (u < 0.15 || u > 0.85 || v < 0.1 || v > 0.9) return toneAt(n, IRON, 0.1);
    const flick = f ? 0.06 : 0;
    const d = Math.abs(u - 0.5) + Math.abs(v - 0.42 - flick) * 0.6;
    return d < 0.14 ? EMBER[4] : d < 0.26 ? EMBER[3] : EMBER[2];
  }, 4);
  S.rod([0, 10, 105], [0, 10, 109], 0.6, 0.6, IRON, 5);
  return done(S, 30, 150, [{ at: c, r: 34 + f * 3, color: EMBER[2], a: 0.42 }]);
}

/** A BARREL of the market: oak staves bound with iron hoops, its lid. `broken`: staves sprung and scattered round its hoops, what was in it spilled. 64 x 72 at (32, 56). */
function barrel(broken: boolean): Sprite {
  const S = scene(64, 72, 32, 56);
  if (!broken) {
    cylinder(S, 0, 0, (z) => 9 + 1.6 * Math.sin((z / 26) * Math.PI), 0, 26, (n, a, z) => {
      if (Math.abs(z - 4) < 1.2 || Math.abs(z - 22) < 1.2) return toneAt(n, IRON, 0.25);
      return fr(a * 2.6) < 0.1 ? toneAt(n, OAK, -0.5) : toneAt(n, OAK, 0.05);
    }, 1, (a, rr) => (rr > 0.86 ? OAK[4] : fr(a * 1.2) < 0.08 ? OAK[1] : OAK[3]));
  } else {
    // the hoops lying flat, the staves splayed out of them, the barrel's foot still standing
    cylinder(S, 0, 0, 9.5, 0, 5, (n, a) => (fr(a * 2.6) < 0.1 ? toneAt(n, OAK, -0.5) : toneAt(n, OAK, 0)), 1, () => HOLE);
    for (let k = 0; k < 7; k++) {
      const a = k * 0.9 + 0.3;
      const d = 12 + hash(k, 1, 61) * 8;
      const c: V3 = [Math.cos(a) * d, Math.sin(a) * d, 1.4];
      S.box(c, [[Math.cos(a + 1.4), Math.sin(a + 1.4), 0], [-Math.sin(a + 1.4), Math.cos(a + 1.4), 0], [0, 0, 1]], [11, 2.2, 1.2], (_f, _u, _v, n) => toneAt(n, OAK, 0.05), 2 + k);
    }
    for (const [x, y, r] of [[-10, 8, 11], [9, -6, 10]] as const) {
      cylinder(S, x, y, r, 0, 1.2, (n) => toneAt(n, IRON, 0.2), 10, (_a, rr) => (rr > 0.86 ? IRON[3] : null));
    }
  }
  return done(S, 32, 56);
}

/** CRATES, two stacked, deal battened at their corners. `broken`: smashed open, planks flung, the top one tumbled. 80 x 80 at (40, 62). */
function crates(broken: boolean): Sprite {
  const S = scene(80, 80, 40, 62);
  const crate = (x: number, y: number, z: number, s: number, id: number): void => {
    slab(S, x - s, y - s, x + s, y + s, z, z + 2 * s, DEAL, id, 0, (f, u, v) => {
      const edge = u < 0.1 || u > 0.9 || v < 0.1 || v > 0.9;
      return edge ? 0.25 : planks(3)(f, u, v);
    });
  };
  if (!broken) {
    crate(0, 0, 0, 10, 1);
    crate(1, -1, 20, 8, 2);
  } else {
    // the bottom one burst open, its side split off; planks flung; the top one fallen on its side
    slab(S, -10, -10, 10, 10, 0, 6, DEAL, 1, -0.1, planks(3));
    for (let k = 0; k < 6; k++) {
      const a = k * 1.1;
      const d = 14 + hash(k, 2, 71) * 6;
      S.box([Math.cos(a) * d, Math.sin(a) * d, 1], [[Math.cos(a + 0.8), Math.sin(a + 0.8), 0], [-Math.sin(a + 0.8), Math.cos(a + 0.8), 0], [0, 0, 1]], [9, 2.4, 1], (_f, _u, _v, n) => toneAt(n, DEAL, 0.05), 3 + k);
    }
    S.box([14, -8, 8], [[0.9, 0.3, 0.3], [-0.3, 0.95, 0], [-0.28, -0.08, 0.96]], [8, 8, 8], (f, u, v, n) => toneAt(n, DEAL, planks(3)(f, u, v)), 10);
  }
  return done(S, 40, 62);
}

// =================================================================================================
// THE SILENT ORDER'S

/**
 * A CRATE OF STOLEN VOICES: an open crate packed in straw with corked jars of greenish glass, in each a
 * stolen voice, a faint pink whisper of light turning in it (two frames). `broken`: the crate smashed, jars
 * shattered, the voices gone up in thin pink wisps. 72 x 84 at (36, 66).
 */
function voiceJars(broken: boolean, f: number): Sprite {
  const S = scene(72, 84, 36, 66);
  const GLASS = ['#1c2420', '#2a3630', '#3c4c44', '#566a5e', '#8aa092'] as const;
  const lights: { at: V3; r: number; color: string; a?: number }[] = [];
  if (!broken) {
    slab(S, -12, -10, 12, 10, 0, 14, DEAL, 1, 0, planks(3));
    // the straw on top, and the jars standing in it
    S.quad([[-11, -9, 14], [11, -9, 14], [11, 9, 14], [-11, 9, 14]], (u, v) => (hash(Math.floor(u * 20), Math.floor(v * 14), 81) < 0.3 ? '#7a6636' : '#5a4a2a'), 2);
    const spots: [number, number][] = [[-6, -4], [3, -5], [-5, 4], [4, 3], [-0.5, -0.5]];
    spots.forEach(([x, y], k) => {
      const turn = (f + k) % 2;
      cylinder(S, x, y, (z) => (z < 22 ? 3.2 : 3.2 - (z - 22) * 0.6), 12, 25, (n, a, z) => {
        // the glass, dark, and in it the voice: a pink wisp curling up, lit faint
        const wisp = Math.abs(Math.sin(a * 2 + z * 0.5 + turn * 1.5)) < 0.3 && z > 14 && z < 22;
        if (wisp) return FLAME[turn ? 1 : 2];
        return toneAt(n, GLASS, 0.1);
      }, 3 + k);
      cylinder(S, x, y, 1.6, 25, 28, (n) => toneAt(n, ['#3a2a1c', '#5a4028', '#7a5a36', '#9a7a4a', '#b4945e'], 0.1), 10 + k, () => '#9a7a4a');
      if (k === 4) lights.push({ at: [x, y, 18], r: 12, color: FLAME[2], a: 0.16 + turn * 0.04 });
    });
  } else {
    slab(S, -12, -10, 12, 10, 0, 5, DEAL, 1, -0.1, planks(3));
    for (let k = 0; k < 4; k++) {
      const a = k * 1.6 + 0.3;
      S.box([Math.cos(a) * 16, Math.sin(a) * 16, 1], [[Math.cos(a + 1), Math.sin(a + 1), 0], [-Math.sin(a + 1), Math.cos(a + 1), 0], [0, 0, 1]], [8, 2, 1], (_f, _u, _v, n) => toneAt(n, DEAL, 0.05), 2 + k);
    }
    // the shards of glass, glinting; the voices' wisps rising thin and pink, going
    for (let k = 0; k < 14; k++) {
      const a = hash(k, 3, 82) * Math.PI * 2;
      const d = 4 + hash(k, 4, 82) * 18;
      S.box([Math.cos(a) * d, Math.sin(a) * d, 0.6], [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]], [1.6, 1, 0.6], (_f, _u, _v, n) => toneAt(n, ['#1c2420', '#2a3630', '#3c4c44', '#6a8478', '#a8c0b0'], 0.3), 20 + k);
    }
    for (let k = 0; k < 3; k++) {
      const x = -6 + k * 6;
      for (let i = 0; i < 6; i++) {
        if ((i + k + f) % 2) continue;
        const z = 6 + i * 6 + f * 3;
        S.egg([x + Math.sin(i * 1.3 + k + f) * 3, 0, z], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [0.7, 0.7, 1.2], () => FLAME[i > 3 ? 0 : 1], 40 + k);
      }
    }
    lights.push({ at: [0, 0, 12], r: 14, color: FLAME[1], a: 0.14 });
  }
  return done(S, 36, 66, lights);
}

/** THE SILENT ORDER'S BANNER, hung down a house front from an iron rod: black cloth, its foot cut in tails, the blank mask on it in dead white (no mouth). */
function orderBanner(): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    S.rod(w(-14, 2, 124), w(14, 2, 124), 0.8, 0.8, IRON, 1);
    for (const a of [-14, 14]) S.ball(w(a, 2, 124), 1.3, IRON, 1);
    S.quad([w(-12, 2.6, 123), w(12, 2.6, 123), w(12, 2.6, 52), w(-12, 2.6, 52)], (u, v) => {
      const x = (u - 0.5) * 2;
      const z = 1 - v; // 0 at its foot, 1 at the rod
      // its tails: three, cut in points
      const tail = Math.abs(fr(u * 3) - 0.5) * 2;
      if (z < 0.1 * (1 - tail)) return null;
      // the mask: an oval, two dark eyes, no mouth; lit on its upper left
      const my = (z - 0.62) / 0.2;
      const mx = x / 0.5;
      if (mx * mx + my * my < 1) {
        const eye = (Math.abs(Math.abs(mx) - 0.38) < 0.17 && Math.abs(my - 0.18) < 0.12);
        if (eye) return BLACK[0];
        return mx + my * 0.6 < -0.5 ? MASK[4] : mx > 0.5 ? MASK[2] : MASK[3];
      }
      const fold = Math.sin(u * 14);
      return BLACK[fold > 0.55 ? 4 : fold < -0.55 ? 1 : 2];
    }, 2);
  });
}

// =================================================================================================
// THE ROOFS', AND THE SIEGE'S

/** A CHIMNEY on the roofs: a stack of brick on its stone foot, a capping, two clay pots. Stands on a top (drawn the ground's rise up). 40 x 72 at (20, 60). */
function chimney(tall: number): Sprite {
  const S = scene(40, 82, 20, 70);
  slab(S, -7, -6, 7, 6, 0, tall, BRICK, 1, 0, (f, u, v) => {
    if (f >= 4) return 0;
    const course = Math.floor(v * tall / 3);
    return fr(v * tall / 3) < 0.25 || fr(u * 3 + course * 0.5) < 0.08 ? -0.6 : 0;
  });
  slab(S, -8, -7, 8, 7, tall, tall + 3, STONE, 2, 0.1);
  for (const x of [-3.5, 3.5]) cylinder(S, x, 0, (z) => 2.6 - (z - tall - 3) * 0.08, tall + 3, tall + 11, (n) => toneAt(n, CLAY, 0.05), 3, () => HOLE);
  return done(S, 20, 70);
}

/**
 * A SHARD OF THE DOME, the siege magic's, broken when it fell and stuck in the setts at a slant: a jagged
 * blade of the cult's pink, cracked with light, faint now (two frames, its light breathing). `big` or small.
 * 64 x 80 at (32, 66).
 */
function domeShard(big: boolean, f: number): Sprite {
  const S = scene(64, 90, 32, 74);
  const H = big ? 40 : 22;
  const W = big ? 13 : 7;
  const SHARD = ['#2a0c22', '#4a1236', '#7a1a4e', '#b4306a', '#e86a98'] as const;
  // a blade of the dome: two faces meeting in a ridge, its top broken off in a jag, stuck in at a slant
  const lean: V3 = [0.42, 0.12, 0.9];
  const across: V3 = [0.9, -0.28, -0.33];
  const out: V3 = [0.1, 0.95, -0.2];
  const P = (u: number, z: number, o: number): V3 => [across[0] * u + lean[0] * z + out[0] * o, across[1] * u + lean[1] * z + out[1] * o, across[2] * u + lean[2] * z + out[2] * o];
  const top = (u: number): number => H * (0.75 + 0.25 * Math.abs(Math.sin(u * 0.55 + 1.3))) - (u > 0 ? u * 0.9 : -u * 0.3);
  const N = 8;
  for (let i = 0; i < N; i++) {
    const u0 = -W + (2 * W * i) / N;
    const u1 = -W + (2 * W * (i + 1)) / N;
    // its face toward the street, lit on its upper left half; its back, dark
    for (const side of [1, -1]) {
      const o = side * 1.6 * (1 - Math.abs((u0 + u1) / 2) / W);
      S.quad([P(u0, 0, side * 0.2), P(u1, 0, side * 0.2), P(u1, top(u1), 0), P(u0, top(u0), o)], (u, v) => {
        const uu = u0 + (u1 - u0) * u;
        const crack = Math.abs(Math.sin(uu * 1.7 + v * 5.3)) < 0.1;
        if (crack) return f ? FLAME[4] : FLAME[3];
        if (v > 0.92) return SHARD[4]; // its broken edge, catching the light
        return side > 0 ? (uu < 0 ? SHARD[3] : SHARD[2]) : SHARD[1];
      }, 1);
    }
  }
  // its foot sunk in broken setts
  for (let k = 0; k < 6; k++) {
    const a = k * 1.05;
    S.box([Math.cos(a) * 8, Math.sin(a) * 6, 1], [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]], [2.6, 2, 1.4], (_f, _u, _v, n) => toneAt(n, STONE, 0.1), 2 + k);
  }
  return done(S, 32, 74, [{ at: P(0, H * 0.4, 0), r: big ? 20 : 12, color: FLAME[2], a: 0.14 + f * 0.06 }]);
}

/** RUBBLE OF THE SIEGE: a heap of the city's stone fallen from a house, a charred beam across it. 110 x 80 at (55, 60). */
function rubble(): Sprite {
  const S = scene(110, 80, 55, 60);
  for (let k = 0; k < 16; k++) {
    const a = hash(k, 1, 91) * Math.PI * 2;
    const d = hash(k, 2, 91) * 22;
    const s = 3 + hash(k, 3, 91) * 4;
    const z = Math.max(0, 10 - d * 0.4) + s * 0.6;
    const t = hash(k, 4, 91) * 1.2;
    S.box([Math.cos(a) * d * 1.3, Math.sin(a) * d, z], [[Math.cos(t), Math.sin(t), 0.2], [-Math.sin(t), Math.cos(t), 0], [-0.2, 0, 1]], [s * 1.3, s, s * 0.8], (_f, _u, _v, n) => toneAt(n, STONE, (hash(k, 5, 91) - 0.5) * 0.4), 1 + k);
  }
  // the beam: oak, charred black along its top, still glowing nowhere (long out)
  S.box([4, 2, 13], [[0.92, -0.32, 0.22], [0.33, 0.94, 0], [-0.2, 0.07, 0.98]], [30, 3.4, 3.4], (f, u, v, n) => {
    const charred = f === 4 || (f !== 4 && v > 0.55);
    if (charred) return hash(Math.floor(u * 30), Math.floor(v * 4), 92) < 0.2 ? CHAR[3] : toneAt(n, CHAR, 0.1);
    return toneAt(n, OAK, 0);
  }, 30);
  return done(S, 55, 60);
}

// =================================================================================================
// THE REST OF THE SET'S: the city's lights, its walls and ways down, its rooms; the Order's work in it

const I3: readonly [V3, V3, V3] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
/** Iron blackened (the Order's). */
const BLACK_IRON: Ramp = ['#0e0c14', '#18161f', '#25222e', '#363242', '#4c4858'];
/** Glass of the voices' jars. */
const GLASS: Ramp = ['#1c2420', '#2a3630', '#3c4c44', '#566a5e', '#8aa092'];
/** A cork, a stopper. */
const CORK: Ramp = ['#3a2a1c', '#5a4028', '#7a5a36', '#9a7a4a', '#b4945e'];
/** The dull dyes of the city's cloth (as the market's). */
const OXB: Ramp = ['#2e161c', '#4a2226', '#6a302e', '#86423a', '#a05a48'];
const BOT: Ramp = ['#18221e', '#24342c', '#34483a', '#46604a', '#5c7a5e'];
const CRM: Ramp = ['#4e463c', '#6c6252', '#8e826a', '#ab9c80', '#c4b494'];
const SLB: Ramp = ['#1c1e2c', '#2a2e42', '#3c425a', '#525a74', '#6a728c'];
/** Paper, blank. */
const PAPER: Ramp = ['#5e5850', '#827a6c', '#a69c88', '#c4b9a2', '#ddd2ba'];
/** Hemp. */
const ROPE: Ramp = ['#4a3e32', '#62533f', '#7e6c52', '#9a8766', '#b4a07c'];
/** The Hush: the dead grey-violet of a silence. */
const HUSH: Ramp = ['#14121e', '#262234', '#3e3852', '#625a7a', '#9890b4'];
/** Clay, fired: a pot, a jug, a jar. */
const POT: Ramp = ['#2e1a18', '#4a2a22', '#6a3c2c', '#8a5238', '#a46a48'];

/** A voice in a jar: a corked jar of dark glass at (x, y, z), `h` tall, the stolen voice in it a pink wisp curling (its `turn`). */
function voiceJar(S: Scene, x: number, y: number, z: number, h: number, turn: number, id: number): void {
  cylinder(S, x, y, (zz) => (zz < z + h * 0.78 ? 3 : 3 - (zz - z - h * 0.78) * 0.55), z, z + h, (n, a, zz) => {
    const wisp = Math.abs(Math.sin(a * 2 + zz * 0.55 + turn * 1.5)) < 0.3 && zz > z + 2 && zz < z + h * 0.75;
    if (wisp) return FLAME[turn % 2 ? 1 : 2];
    return toneAt(n, GLASS, 0.1);
  }, id);
  cylinder(S, x, y, 1.5, z + h, z + h + 2.6, (n) => toneAt(n, CORK, 0.1), id + 1, () => CORK[3]);
}

/** A WALL LANTERN on a house front: an iron cage with panes on a scrolled bracket, its honest flame (two frames), or dark (put out). */
function wallLantern(f: number): { left: Sprite; right: Sprite } {
  const lit = f < 2;
  return frontPiece((S, w) => {
    const Z = 98;
    S.rod(w(0, 0, Z + 13), w(0, 11, Z + 13), 0.9, 0.9, IRON, 1);
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      S.ball(w(0, 2 + 8 * t + Math.sin(t * 6) * 1.6, Z + 3 + 9 * t + Math.cos(t * 6) * 1.6), 0.65, IRON, 1);
    }
    const c = w(0, 11, Z);
    S.rod([c[0], c[1], c[2] + 13], [c[0], c[1], c[2] + 9], 0.6, 0.6, IRON, 2);
    S.box([c[0], c[1], c[2] + 8], I3, [3.8, 3.8, 1.3], (_f, _u, _v, n) => toneAt(n, IRON, 0.2), 3);
    S.box(c, I3, [3.1, 3.1, 6.8], (face, u, v, n) => {
      if (face >= 4) return toneAt(n, IRON, 0);
      if (u < 0.15 || u > 0.85 || v < 0.1 || v > 0.9) return toneAt(n, IRON, 0.1);
      if (!lit) return toneAt(n, GLASS, -0.2);
      const d = Math.abs(u - 0.5) + Math.abs(v - 0.42 - (f ? 0.06 : 0)) * 0.6;
      return d < 0.14 ? EMBER[4] : d < 0.26 ? EMBER[3] : EMBER[2];
    }, 4);
  }, 72, 190, (_S, w) => (lit ? [{ at: w(0, 11, 98), r: 30 + f * 3, color: EMBER[2], a: 0.42 }] : []));
}

/**
 * THE SILENT ORDER'S HOODED LANTERN, set up in the streets they hold: a tall post of blackened iron on three
 * feet, the blank mask on a plate on it; a lantern under a black cowl, burning the cult's fire, pink to gold
 * (two frames). 70 x 140 at (35, 118).
 */
function orderLantern(f: number): Sprite {
  const S = scene(70, 140, 35, 118);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.5;
    S.rod([0, 0, 14], [Math.cos(a) * 9, Math.sin(a) * 9, 0], 1, 0.8, BLACK_IRON, 1);
  }
  S.rod([0, 0, 0], [0, 0, 74], 1.4, 1.1, BLACK_IRON, 2);
  // the mask's plate
  S.quad([[-4, 1.6, 52], [4, 1.6, 52], [4, 1.6, 38], [-4, 1.6, 38]], (u, v) => {
    const mx = (u - 0.5) / 0.48;
    const my = (v - 0.5) / 0.48;
    if (mx * mx + my * my > 1) return null;
    if (Math.abs(Math.abs(mx) - 0.38) < 0.17 && Math.abs(my + 0.15) < 0.16) return BLACK[0];
    return mx + my < -0.4 ? MASK[4] : MASK[3];
  }, 3);
  // the lantern: a cage, its panes burning the cult's fire
  const c: V3 = [0, 0, 80];
  S.box(c, I3, [3.6, 3.6, 6.5], (face, u, v, n) => {
    if (face >= 4) return toneAt(n, BLACK_IRON, 0.1);
    if (u < 0.14 || u > 0.86 || v < 0.08 || v > 0.92) return toneAt(n, BLACK_IRON, 0.2);
    const d = Math.abs(u - 0.5) + Math.abs(v - 0.45 - (f ? 0.07 : 0)) * 0.6;
    return d < 0.14 ? FLAME[4] : d < 0.27 ? FLAME[3] : FLAME[2];
  }, 4);
  // the cowl over it: black cloth, open toward the street, its peak drooping back
  S.egg([0, -0.8, 88], I3, [6.2, 6.2, 8.5], (n, w) => {
    if (w[2] < 82) return null;
    // the opening in its front, round the lantern
    if (n[1] > 0.45 && w[2] < 91) return null;
    return fr((w[0] + w[1]) * 0.35) < 0.15 ? toneAt(n, BLACK, -0.3) : toneAt(n, BLACK, 0.25);
  }, 5);
  S.rod([0, -2, 95], [0, -6, 99], 1.6, 0.4, BLACK, 6);
  return done(S, 35, 118, [{ at: c, r: 30 + f * 3, color: FLAME[2], a: 0.45 }]);
}

/**
 * THE ORDER'S RACK OF JARS, where they keep what they have taken before it goes down to the carts: shelves of
 * rough deal, jars of dark glass corked and tagged, in each a stolen voice whispering pink (two frames); gaps
 * where jars have gone, one tipped on its side. Along x, its front to +y. 120 x 130 at (60, 108).
 */
function jarRack(f: number): Sprite {
  const S = scene(120, 130, 60, 108);
  for (const x of [-27, 27]) for (const y of [-7, 7]) timber(S, [x, y, 0], [x, y, 74], 1.4, 1);
  const shelves = [6, 30, 54];
  shelves.forEach((z, i) => slab(S, -29, -8, 29, 8, z, z + 2.4, DEAL, 2 + i, 0, planks(1)));
  const lights: { at: V3; r: number; color: string; a?: number }[] = [];
  shelves.forEach((z, i) => {
    for (let j = 0; j < 6; j++) {
      if (hash(i, j, 101) < 0.18) continue; // a gap: a jar gone
      const x = -22 + j * 8.8 + (hash(i, j, 102) - 0.5) * 2;
      const y = (hash(i, j, 103) - 0.5) * 6;
      const h = 9 + hash(i, j, 104) * 5;
      voiceJar(S, x, y, z + 2.4, h, (f + i + j) % 2, 10 + i * 10 + j);
      // its tag, on a twist of string at its neck
      if (hash(i, j, 105) < 0.5) S.quad([[x + 1.5, y + 3.2, z + 2.4 + h], [x + 4.5, y + 3.4, z + 2.4 + h - 0.5], [x + 4.5, y + 3.4, z + 2.4 + h - 4.5], [x + 1.5, y + 3.2, z + 2.4 + h - 4]], () => PAPER[3], 60 + i * 6 + j);
    }
    lights.push({ at: [0, 0, z + 8], r: 18, color: FLAME[1], a: 0.12 + f * 0.03 });
  });
  // one tipped on its side on the top shelf
  S.egg([18, 2, 59.5], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [6, 3, 3], (n, w) => (Math.abs(Math.sin(w[0] * 0.8 + f)) < 0.25 ? FLAME[2] : toneAt(n, GLASS, 0.1)), 80);
  return done(S, 60, 108, lights);
}

/** A CELLAR'S HATCH in the street: two oak leaves strapped with iron in a frame of stone, a ring to lift by. Shut; open, its leaves thrown back and steps going down into the dark. 100 x 110 at (50, 70). */
function cellarHatch(open: boolean): Sprite {
  const S = scene(100, 110, 50, 70);
  // the stone frame
  for (const [x0, y0, x1, y1] of [[-22, -18, 22, -14], [-22, 14, 22, 18], [-22, -14, -18, 14], [18, -14, 22, 14]] as const) slab(S, x0, y0, x1, y1, 0, 2, STONE, 1, 0.1);
  const leaf = (s: number, up: boolean, id: number): void => {
    // a leaf hinged along its outer edge (x = s * 18); flat, or thrown back up past upright
    const hx = s * 18;
    const ang = up ? 1.9 : 0;
    const d: V3 = [-s * Math.cos(ang), 0, Math.sin(ang)];
    S.quad([[hx, -14, 1.6], [hx, 14, 1.6], [hx + d[0] * 18, 14, 1.6 + d[2] * 18], [hx + d[0] * 18, -14, 1.6 + d[2] * 18]], (u, v) => {
      if (Math.abs(u - 0.25) < 0.05 || Math.abs(u - 0.75) < 0.05) return v < 0.85 ? IRON[3] : IRON[2];
      if (!up && s > 0 && Math.abs(v - 0.9) < 0.06 && Math.abs(u - 0.5) < 0.12) return IRON[4]; // the ring
      return fr(v * 4) < 0.08 ? OAK[0] : OAK[up ? 2 : 3];
    }, id);
  };
  if (!open) {
    S.quad([[-18, -14, 1.6], [18, -14, 1.6], [18, 14, 1.6], [-18, 14, 1.6]], () => OAK[0], 2);
    leaf(-1, false, 3);
    leaf(1, false, 4);
  } else {
    // the steps going down into the dark, each fainter
    for (let k = 0; k < 5; k++) {
      const z = -k * 7;
      const y0 = -14 + k * 6;
      S.quad([[-17.5, y0, z + 1.5], [17.5, y0, z + 1.5], [17.5, y0 + 6, z + 1.5], [-17.5, y0 + 6, z + 1.5]], () => dim(STONE[3], 0.2 + k * 0.17), 5);
      S.quad([[-17.5, y0 + 6, z + 1.5], [17.5, y0 + 6, z + 1.5], [17.5, y0 + 6, z - 5.5], [-17.5, y0 + 6, z - 5.5]], () => dim(STONE[1], 0.3 + k * 0.15), 5);
    }
    leaf(-1, true, 3);
    leaf(1, true, 4);
  }
  return done(S, 50, 70);
}

/** A DRAIN GRATE in the gutter: bars of iron in a frame of stone over the dark of the sewers. `eyes`: two small pink eyes down in it, looking up. 70 x 50 at (35, 28). */
function drainGrate(eyes: boolean): Sprite {
  const S = scene(70, 50, 35, 28);
  slab(S, -14, -14, 14, 14, 0, 1.4, STONE, 1, 0.05);
  S.quad([[-10, -10, 1.45], [10, -10, 1.45], [10, 10, 1.45], [-10, 10, 1.45]], (u, v) => {
    if (eyes && Math.abs(v - 0.55) < 0.07 && (Math.abs(u - 0.42) < 0.05 || Math.abs(u - 0.6) < 0.05)) return FLAME[3];
    return HOLE;
  }, 2);
  for (let k = -8; k <= 8; k += 4) S.rod([k, -10, 1.8], [k, 10, 1.8], 1, 1, IRON, 3);
  S.rod([-10, 0, 2.3], [10, 0, 2.3], 0.9, 0.9, IRON, 4);
  return done(S, 35, 28, eyes ? [{ at: [0, 1, 0], r: 8, color: FLAME[2], a: 0.18 }] : []);
}

/** THE ORDER'S INK BARS: their redaction, thick black strokes of ink brushed across the setts, ragged at their ends, dripped; a wet shine on them (three kinds). 140 x 76 at (70, 38). */
function inkBars(kind: number): Sprite {
  const bars: [number, number, number, number, boolean][] = kind === 0 ? [[-0.15, -0.7, 0.6, 0.15, true], [0.25, -0.5, 0.75, 0.13, true]] : kind === 1 ? [[-0.4, -0.55, 0.5, 0.12, false], [0, -0.7, 0.4, 0.14, false], [0.4, -0.45, 0.65, 0.12, false]] : [[0.05, -0.85, 0.85, 0.17, true]];
  return lying(140, 76, 70, 38, (u, v) => {
    for (const [c, a, b, half, alongU] of bars) {
      const along = alongU ? u : v;
      const across = alongU ? v : u;
      const rag = 0.05 * Math.sin(across * 60 + c * 9) + 0.03 * Math.sin(across * 23);
      if (along > a + rag && along < b + rag && Math.abs(across - c) < half * (0.9 + 0.1 * Math.sin(along * 30))) {
        // a dry stroke at its tail, the brush's hairs: streaks
        if (along > b - 0.12 + rag && fr(across * 40) < 0.4) return null;
        return across - c < -half * 0.55 && fr(along * 6) < 0.6 ? BLACK[4] : BLACK[1];
      }
      // drips and spatter beside it
      if (Math.abs(across - c) < half + 0.08 && Math.abs(across - c) > half && hash(Math.floor(along * 26), Math.floor(across * 26), 112) < 0.12) return BLACK[2];
    }
    return null;
  });
}

/** AN INK SPILL: a pot of the Order's ink knocked over on the setts, its pool spread black and shining, the brush dropped in it. 90 x 60 at (45, 34). */
function inkSpill(): Sprite {
  const S = scene(90, 60, 45, 34);
  const blob = (x: number, y: number): number => {
    let s = 0;
    for (const [cx, cy, r] of [[0, 0, 11], [9, 6, 7], [-7, 8, 6], [14, -3, 4], [-12, -4, 5]] as const) s += (r * r) / ((x - cx) ** 2 + (y - cy) ** 2 + 1);
    return s;
  };
  S.quad([[-28, -20, 0.3], [28, -20, 0.3], [28, 24, 0.3], [-28, 24, 0.3]], (_u, _v, w) => {
    const b = blob(w[0], w[1]);
    if (b < 1) return b > 0.88 && hash(Math.floor(w[0]), Math.floor(w[1]), 113) < 0.3 ? BLACK[1] : null;
    if (b < 1.15) return BLACK[2];
    // its shine: the sky's dusk caught in it, a streak to the upper left
    if (Math.abs(w[0] + w[1] * 0.6 + 4) < 1.2 && w[0] < 2) return SLB[3];
    return BLACK[0];
  }, 1);
  // the pot on its side, its mouth to the pool
  S.egg([-6, -6, 4], [[0.7, 0.7, 0], [-0.7, 0.7, 0], [0, 0, 1]], [6, 4.2, 4.2], (n, w) => (w[0] + w[1] > -10 && n[0] + n[1] > 1 ? BLACK[0] : toneAt(n, POT, 0.05)), 3);
  // the brush, dropped across the pool: its handle, its black hairs
  S.rod([10, 10, 1], [26, 4, 1.4], 1.1, 0.9, OAK, 4);
  S.rod([10, 10, 1], [5, 12, 0.8], 1.6, 0.5, BLACK, 5);
  return done(S, 45, 34);
}

/** BLANK PROCLAMATIONS pasted over a house front, the Order's: sheets slapped up crooked, overlapping, the paste run down the wall under them; one torn half away, one with the blank mask printed small at its head. */
function pastedSheets(): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    const sheets: [number, number, number, number, number][] = [[-14, 92, 13, 17, -0.08], [-1, 96, 14, 18, 0.05], [12, 90, 12, 16, 0.12], [-8, 70, 14, 15, 0.04], [7, 68, 13, 17, -0.06], [-18, 62, 11, 14, 0.1]];
    sheets.forEach(([a, z, wd, ht, rot], k) => {
      const P = (u: number, v: number): V3 => w(a + (u - 0.5) * wd + (v - 0.5) * ht * rot * -1, 0.5 + k * 0.08, z - (v - 0.5) * ht + (u - 0.5) * wd * rot);
      const torn = k === 2;
      S.quad([P(0, 0), P(1, 0), P(1, 1), P(0, 1)], (u, v) => {
        if (torn && v > 0.4 + 0.15 * Math.sin(u * 17)) return null;
        // the paste, run and dried, darker under its foot
        if (v > 0.93) return PAPER[1];
        if (k === 1 && v > 0.08 && v < 0.3 && Math.abs(u - 0.5) < 0.12) {
          const mx = (u - 0.5) / 0.12;
          const my = (v - 0.19) / 0.11;
          if (mx * mx + my * my < 1) return Math.abs(Math.abs(mx) - 0.4) < 0.2 && Math.abs(my + 0.1) < 0.25 ? PAPER[0] : BLACK[2];
        }
        return PAPER[u < 0.05 || u > 0.95 ? 2 : k % 2 ? 3 : 4];
      }, 2 + k);
      // the paste run down the wall under it
      for (let i = 0; i < 3; i++) {
        if (hash(k, i, 121) < 0.4) continue;
        const aa = a + (hash(k, i, 122) - 0.5) * wd * 0.8;
        S.quad([w(aa - 0.6, 0.4, z - ht / 2), w(aa + 0.6, 0.4, z - ht / 2), w(aa + 0.4, 0.4, z - ht / 2 - 4 - hash(k, i, 123) * 8), w(aa - 0.4, 0.4, z - ht / 2 - 4 - hash(k, i, 123) * 8)], () => PAPER[1], 20);
      }
    });
  });
}

/** A HOUSE'S DOOR in the city's stone: a stout oak door, iron-studded, in a dressed surround with a lintel. Shut; open (into the dark of the house); or marked: the Order's blank mask daubed on it in white, its folk taken. */
function houseDoor(state: 'shut' | 'open' | 'marked'): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    // the surround: jambs and a lintel of paler dressed stone, standing out of the face a little
    for (const a of [-13, 13]) S.quad([w(a - 2.5, 1.2, 0), w(a + 2.5, 1.2, 0), w(a + 2.5, 1.2, 52), w(a - 2.5, 1.2, 52)], (_u, v) => (fr(v * 5) < 0.08 ? STONE[1] : STONE[3]), 1);
    S.quad([w(-16, 1.3, 52), w(16, 1.3, 52), w(16, 1.3, 60), w(-16, 1.3, 60)], (u) => (Math.abs(u - 0.5) < 0.06 ? STONE[4] : fr(u * 4) < 0.03 ? STONE[1] : STONE[3]), 2);
    if (state === 'open') {
      // the dark of the house, and the leaf swung in, seen on edge
      S.quad([w(-10.5, 0.6, 0), w(10.5, 0.6, 0), w(10.5, 0.6, 52), w(-10.5, 0.6, 52)], () => HOLE, 3);
      S.quad([w(-10.5, 0.7, 0), w(-8, -9, 0), w(-8, -9, 52), w(-10.5, 0.7, 52)], (u) => (u < 0.2 ? OAK[1] : OAK[2]), 4);
      return;
    }
    S.quad([w(-10.5, 0.8, 0), w(10.5, 0.8, 0), w(10.5, 0.8, 52), w(-10.5, 0.8, 52)], (u, v) => {
      const x = (u - 0.5) * 21;
      const z = (1 - v) * 52;
      // the mask, daubed on in white, dripping
      if (state === 'marked') {
        const mx = x / 7.5;
        const my = (z - 34) / 9.5;
        const r = mx * mx + my * my;
        if (r < 1 && !(Math.abs(Math.abs(mx) - 0.4) < 0.2 && Math.abs(my - 0.2) < 0.2)) return r > 0.75 ? MASK[2] : MASK[3];
        if (Math.abs(x - 3) < 0.6 && z < 26 && z > 18 - Math.abs(Math.sin(x)) * 4) return MASK[2];
        if (Math.abs(x + 4) < 0.6 && z < 26 && z > 21) return MASK[2];
      }
      if ((Math.abs(z - 12) < 1.2 || Math.abs(z - 40) < 1.2) && Math.abs(x) < 10) return fr(x / 3.5) < 0.2 ? IRON[4] : IRON[2];
      if (Math.abs(x - 7) < 1 && Math.abs(z - 26) < 1.5) return IRON[3]; // its ring
      return fr(x / 5.2) < 0.08 ? OAK[0] : OAK[(hash(Math.floor(x / 5.2 + 3), 1, 131) > 0.5 ? 2 : 3)];
    }, 3);
  });
}

/** WASHING strung out between two houses' hooks along a front, left out when the street went quiet: shirts, a sheet, stockings, faded. */
function washing(): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    const z0 = 104;
    const sag = (a: number): number => z0 - 8 * (1 - (a / 30) ** 2);
    for (let a = -30; a < 30; a += 2) S.rod(w(a, 5, sag(a)), w(a + 2, 5, sag(a + 2)), 0.45, 0.45, ROPE, 1);
    for (const a of [-30, 30]) S.rod(w(a, 0, z0), w(a, 5, z0), 0.7, 0.7, IRON, 2);
    // a shirt (sleeves out), a sheet, stockings, a shirt
    const hangs: [number, number, number, Ramp, string][] = [[-22, 9, 15, CRM, 'shirt'], [-6, 16, 24, CRM, 'sheet'], [9, 3, 12, OXB, 'stocking'], [13, 3, 11, SLB, 'stocking'], [22, 9, 14, BOT, 'shirt']];
    hangs.forEach(([a, half, len, R, kind], k) => {
      const top = sag(a) - 0.5;
      S.quad([w(a - half, 5.3, top), w(a + half, 5.3, top), w(a + half + (kind === 'sheet' ? 1 : 0), 5.6, top - len), w(a - half, 5.6, top - len)], (u, v) => {
        if (kind === 'shirt') {
          // sleeves: the top third full width; the body narrower below
          if (v > 0.3 && Math.abs(u - 0.5) > 0.3) return null;
          if (v > 0.92) return R[1];
          return Math.abs(u - 0.5) < 0.04 ? R[2] : u < 0.5 ? R[3] : R[2];
        }
        if (kind === 'stocking') return v > 0.8 && u > 0.5 ? null : u < 0.5 ? R[3] : R[2];
        // the sheet: folds down it, its hem
        if (v > 0.95) return R[1];
        return Math.sin(u * 18) > 0.5 ? R[4] : Math.sin(u * 18) < -0.6 ? R[2] : R[3];
      }, 3 + k);
      for (const s of [-1, 1]) S.ball(w(a + s * (half - 1), 5.6, top + 0.6), 0.7, OAK, 10);
    });
  });
}

/** BUNDLES OF BLANK PAPER, the Hush's, waiting for the press: reams stacked, tied with string. Broken: the string cut, the sheets blown out over the ground. 100 x 80 at (50, 60). */
function paperBundles(broken: boolean): Sprite {
  const S = scene(100, 80, 50, 60);
  const ream = (x: number, y: number, z: number, t: number, id: number): void => {
    const A0: V3 = [Math.cos(t), Math.sin(t), 0];
    const A1: V3 = [-Math.sin(t), Math.cos(t), 0];
    S.box([x, y, z + 4], [A0, A1, [0, 0, 1]], [9, 6.5, 4], (f, u, v, n) => {
      const along = f === 4 ? u : f === 2 || f === 3 ? v : -1;
      if (along >= 0 && Math.abs(along - 0.5) < 0.05) return ROPE[2];
      if (f === 4 && Math.abs(v - 0.5) < 0.06) return ROPE[3];
      if (f < 4) return fr((f === 2 || f === 3 ? u : v) * 14) < 0.35 ? toneAt(n, PAPER, -0.35) : toneAt(n, PAPER, 0); // the sheets' edges
      return toneAt(n, PAPER, 0.15);
    }, id);
  };
  if (!broken) {
    ream(-8, 4, 0, 0.1, 1);
    ream(10, -4, 0, -0.2, 2);
    ream(-6, 3, 8, -0.15, 3);
    ream(1, -1, 0, 0.6, 4);
    ream(9, -3, 8, 0.25, 5);
  } else {
    ream(-8, 4, 0, 0.1, 1);
    for (let k = 0; k < 18; k++) {
      const a = hash(k, 1, 141) * Math.PI * 2;
      const d = 6 + hash(k, 2, 141) * 26;
      const x = 8 + Math.cos(a) * d;
      const y = -2 + Math.sin(a) * d * 0.8;
      const t = hash(k, 3, 141) * 3;
      const P = (u: number, v: number): V3 => [x + Math.cos(t) * u * 6 - Math.sin(t) * v * 4.5, y + Math.sin(t) * u * 6 + Math.cos(t) * v * 4.5, 0.4 + k * 0.05 + (u + 1) * (k % 3 === 0 ? 1.2 : 0)];
      S.quad([P(-1, -1), P(1, -1), P(1, 1), P(-1, 1)], (u) => (u > 0.92 ? PAPER[2] : PAPER[k % 2 ? 3 : 4]), 10 + k);
    }
    S.rod([2, 6, 0.5], [10, 9, 0.4], 0.4, 0.4, ROPE, 40);
  }
  return done(S, 50, 60);
}

/** A WHEEL OF WOOD: its rim, its spokes, an iron hub; `face` the way its outer side looks. */
function woodWheel(S: Scene, c: V3, face: V3, R: number, id: number): void {
  const fl = Math.hypot(...face);
  const F: V3 = [face[0] / fl, face[1] / fl, face[2] / fl];
  const Au: V3 = [F[1], -F[0], 0];
  const al = Math.hypot(...Au) || 1;
  const A: V3 = [Au[0] / al, Au[1] / al, 0];
  const B: V3 = [F[1] * A[2] - F[2] * A[1], F[2] * A[0] - F[0] * A[2], F[0] * A[1] - F[1] * A[0]];
  S.egg(c, [F, A, B], [1.4, R, R], (n, w0) => {
    const w = local(S, w0);
    const q: V3 = [w[0] - c[0], w[1] - c[1], w[2] - c[2]];
    const a = q[0] * A[0] + q[1] * A[1] + q[2] * A[2];
    const b = q[0] * B[0] + q[1] * B[1] + q[2] * B[2];
    const r = Math.hypot(a, b);
    if (r > R - 2.2) return r > R - 0.8 ? IRON[2] : toneAt(n, OAK, b > 0 ? 0.2 : -0.2);
    if (r < 2.2) return IRON[3];
    const ang = Math.atan2(b, a);
    if (Math.abs(fr((ang / (Math.PI * 2)) * 8) - 0.5) > 0.42) return toneAt(n, OAK, 0);
    return null;
  }, id);
}

/**
 * THE CARTERS' CART, the Order's: a two-wheeled cart, its shafts down on the setts, piled with crates and jars
 * under a black tarpaulin, the blank mask painted on it, one corner thrown back on the jars and their pink
 * whispers (two frames). Its shafts toward +y (`k` 0) or +x (1). 150 x 120 at (75, 84).
 */
function cartersCart(f: number, k: number): Sprite {
  const S = turned(scene(150, 120, 75, 84), k);
  // the bed and its sides
  slab(S, -20, -22, 20, 22, 16, 19, DEAL, 1, 0, planks(5));
  for (const x of [-20, 20]) slab(S, x - 1, -22, x + 1, 22, 19, 26, DEAL, 2, 0.05, planks(2));
  slab(S, -20, -23, 20, -21, 19, 26, DEAL, 3, 0.05);
  // the axle, the wheels
  S.rod([-23, 2, 13], [23, 2, 13], 1.2, 1.2, IRON, 4);
  for (const s of [-1, 1]) woodWheel(S, [s * 24, 2, 13], [s, 0, 0], 13, 5 + (s > 0 ? 1 : 0));
  // the shafts, forward and down onto the setts
  for (const x of [-9, 9]) timber(S, [x, 20, 17], [x, 54, 1.5], 1.3, 7);
  // the load: crates under the tarpaulin; the corner thrown back on the jars
  slab(S, -18, -20, 2, 0, 19, 33, DEAL, 8, -0.1, planks(3));
  slab(S, -18, 2, 0, 18, 19, 30, DEAL, 9, -0.1, planks(3));
  for (let j = 0; j < 5; j++) voiceJar(S, 6 + (j % 2) * 7, -14 + j * 6.5, 19, 10, (f + j) % 2, 20 + j * 2);
  // the tarpaulin: drawn over the crates and roped down, the mask painted on its end; its corner rolled back off the jars
  S.box([-8, -1, 28.5], I3, [11.5, 21, 7], (f, u, v, n) => {
    if (f === 4) {
      // its top: folds across, the ropes over it
      if (Math.abs(v - 0.3) < 0.03 || Math.abs(v - 0.72) < 0.03) return ROPE[2];
      return Math.sin(v * 30 + u * 3) > 0.6 ? toneAt(n, BLACK, 0.35) : toneAt(n, BLACK, 0.15);
    }
    if (f === 2) {
      // its end toward the shafts (u up it, v across): the blank mask, its hem hanging in loops
      if (u < 0.12 && fr(v * 4) > 0.5 + u * 3) return null;
      const mx = (v - 0.5) / 0.22;
      const my = (u - 0.55) / 0.36;
      if (mx * mx + my * my < 1) return Math.abs(Math.abs(mx) - 0.4) < 0.2 && Math.abs(my - 0.15) < 0.25 ? BLACK[0] : my > 0.3 ? MASK[4] : MASK[3];
      return Math.sin(v * 22) > 0.6 ? toneAt(n, BLACK, 0.2) : toneAt(n, BLACK, 0);
    }
    if (f === 0 && u < 0.12) return null;
    return toneAt(n, BLACK, Math.sin(u * 20) > 0.5 ? 0.1 : -0.1);
  }, 30);
  S.egg([4, -1, 33], I3, [2.6, 20, 2.6], (n, w) => (fr(local(S, w)[1] * 0.3) < 0.15 ? toneAt(n, BLACK, -0.2) : toneAt(n, BLACK, 0.3)), 31);
  return done(S, 75, 84, [{ at: [9, -2, 25], r: 18, color: FLAME[1], a: 0.14 + f * 0.04 }]);
}

// THE ROOMS: what stands in the houses that can be gone into

/** A TAVERN TABLE and its two benches: rough oak, a tankard or two left standing, a candle stub, a cloth cap dropped. Along x (`k` 0) or y (1). 110 x 80 at (55, 56). */
function tavernTable(k: number): Sprite {
  const S = turned(scene(110, 80, 55, 56), k);
  slab(S, -24, -9, 24, 9, 20, 23, OAK, 1, 0.05, planks(4));
  for (const x of [-19, 19]) for (const y of [-6, 6]) timber(S, [x, y, 0], [x, y, 20], 1.3, 2);
  for (const s of [-1, 1]) {
    slab(S, -22, s * 15 - 3.5, 22, s * 15 + 3.5, 11, 13.5, OAK, 3 + (s > 0 ? 1 : 0), 0.05, planks(1));
    for (const x of [-17, 17]) timber(S, [x, s * 15, 0], [x, s * 15, 11], 1, 5);
  }
  // tankards: pewter, one tipped over
  const PEWTER: Ramp = ['#2a2a34', '#40404e', '#5c5c6c', '#7e7e8e', '#a8a8b4'];
  cylinder(S, -10, -2, 2.6, 23, 30, (n) => toneAt(n, PEWTER, 0), 6, () => '#3a2410');
  S.rod([-7.4, -2, 28], [-6.4, -2, 25], 0.6, 0.6, PEWTER, 6);
  S.egg([8, 3, 25.6], [[0.8, 0.6, 0], [-0.6, 0.8, 0], [0, 0, 1]], [3.6, 2.6, 2.6], (n) => toneAt(n, PEWTER, 0), 7);
  // the candle stub, out
  cylinder(S, 1, -4, 1.2, 23, 26, (n) => toneAt(n, CRM, 0.1), 8, () => CRM[3]);
  return done(S, 55, 56);
}

/** THE HEARTH of a house: a chimney breast of the city's stone, its brick flue going on up, a firebox with logs burning an honest fire (two frames), a pot hung over it, an oak mantel with a jug on it. Its opening to +y (`k` 0) or +x (1). 110 x 160 at (55, 128). */
function hearth(f: number, k: number): Sprite {
  // built at 0.62 of its measure, so that it stands under a room's ceiling (a house front is 75 game pixels high)
  const S = turned(scene(110, 160, 55, 128), k, 0.62);
  const inBox = (x: number, z: number): boolean => Math.abs(x) < 12 && z < 26;
  // the breast: its front cut by the firebox
  const TOP = 74;
  S.quad([[-20, 6, 0], [20, 6, 0], [20, 6, TOP], [-20, 6, TOP]], (_u, _v, w0) => {
    const [x, , z] = local(S, w0);
    if (inBox(x, z)) return null;
    const row = Math.floor(z / 8);
    const joint = fr(z / 8) < 0.13 || fr((x + (row & 1) * 6) / 12) < 0.07;
    const soot = z > 24 && z < 60 && Math.abs(x) < 14 - (z - 24) * 0.2 ? 0.5 : 0;
    const c = toneAt(facing(S, [0, 1, 0]), STONE, joint ? -0.55 : (hash(Math.floor((x + (row & 1) * 6) / 12), row, 151) - 0.5) * 0.3);
    return soot ? mix(c, CHAR[1], soot) : c;
  }, 1);
  S.quad([[20, -8, 0], [20, 6, 0], [20, 6, TOP], [20, -8, TOP]], () => toneAt(facing(S, [1, 0, 0]), STONE, -0.1), 2);
  S.quad([[-20, -8, TOP], [20, -8, TOP], [20, 6, TOP], [-20, 6, TOP]], () => STONE[3], 2);
  // its head: a stepped cap and the flue going on up, narrower
  slab(S, -22, -9, 22, 8, TOP, TOP + 4, STONE, 11, 0.12);
  slab(S, -11, -8, 11, 2, TOP + 4, TOP + 30, BRICK, 12, 0, (f, u, v) => (f >= 4 ? 0 : fr((f === 0 || f === 1 ? v : u) * 9) < 0.2 ? -0.55 : 0));
  // the firebox: its sooted back and sides, the hearthstone, the logs, the fire
  S.quad([[-12, -6, 0], [12, -6, 0], [12, -6, 26], [-12, -6, 26]], () => CHAR[1], 3);
  S.quad([[-12, -6, 0], [-12, 6, 0], [-12, 6, 26], [-12, -6, 26]], () => CHAR[2], 3);
  slab(S, -16, 6, 16, 12, 0, 1.5, STONE, 4, 0.1);
  timber(S, [-8, -1, 2], [8, 1, 3], 1.6, 5);
  timber(S, [-6, 2, 2], [7, -3, 4.5], 1.4, 6);
  for (let i = 0; i < 5; i++) {
    const x = -7 + i * 3.5;
    const h = 8 + ((i * 5 + f * 3) % 6) + (2 - Math.abs(i - 2)) * 3;
    S.egg([x + (f ? 0.6 : -0.4), 0, 4 + h / 2], I3, [1.8, 1.4, h / 2], (_n, w) => {
      const t = (w[2] - 4) / h;
      return t > 0.75 ? EMBER[2] : t > 0.4 ? EMBER[3] : EMBER[4];
    }, SOFT_ID + 1);
  }
  // the pot on its crane, over the fire
  S.rod([-11, -4, 24], [-11, -4, 4], 0.8, 0.8, IRON, 7);
  S.rod([-11, -4, 22], [0, -1, 22], 0.8, 0.8, IRON, 7);
  S.rod([0, -1, 22], [0, -1, 18], 0.4, 0.4, IRON, 7);
  S.egg([0, -1, 14], I3, [4.6, 4.6, 4], (n, w) => (w[2] > 17 ? null : toneAt(n, IRON, -0.1)), 8);
  // the mantel and the jug on it
  slab(S, -23, 6, 23, 10, 28, 31, OAK, 9, 0.1);
  cylinder(S, 12, 8, (z) => 2.6 + Math.sin(((z - 31) / 9) * Math.PI) * 1.2, 31, 40, (n) => toneAt(n, POT, 0.05), 10, () => HOLE);
  return done(S, 55, 128, [{ at: [0, 4, 10], r: 40 + f * 4, color: EMBER[2], a: 0.5 }]);
}

/** A BED in a house: an oak frame with low posts, a straw mattress, a patched blanket thrown back as it was left in a hurry, a bolster. Its head to -y (`k` 0) or -x (1). 110 x 80 at (55, 52). */
function bed(k: number): Sprite {
  const S = turned(scene(110, 80, 55, 52), k);
  slab(S, -14, -24, 14, 24, 6, 11, OAK, 1, 0, planks(1));
  for (const x of [-14, 14]) for (const y of [-24, 24]) timber(S, [x, y, 0], [x, y, y < 0 ? 22 : 14], 1.4, 2);
  slab(S, -14, -25, 14, -23, 12, 21, OAK, 3, 0.05, planks(3));
  // the mattress, the bolster
  S.box([0, 0, 13.5], I3, [12.5, 22, 2.8], (f, u, v, n) => (f === 4 ? toneAt(n, STRAW_TICK, (hash(Math.floor(u * 9), Math.floor(v * 14), 161) - 0.5) * 0.25) : toneAt(n, STRAW_TICK, -0.2)), 4);
  S.egg([0, -17, 17.5], I3, [11, 3.8, 2.4], (n) => toneAt(n, CRM, 0.15), 5);
  // the blanket thrown back: patched squares in the dull dyes, folded over on itself at its top
  const patch = [OXB, BOT, CRM, SLB, OXB, CRM];
  S.quad([[-13, -6, 16.6], [13, -6, 16.6], [13, 23, 16.4], [-13, 23, 16.4]], (u, v) => {
    const R = patch[(Math.floor(u * 3) + Math.floor(v * 4) * 2) % patch.length];
    if (fr(u * 3) < 0.04 || fr(v * 4) < 0.04) return R[1];
    return R[3];
  }, 6);
  S.box([0, -6.5, 17.8], I3, [13, 2.2, 1.6], (f, _u, _v, n) => toneAt(n, OXB, f === 4 ? 0.2 : -0.1), 7);
  return done(S, 55, 52);
}
/** A straw tick's ticking: a faded stripe. */
const STRAW_TICK: Ramp = ['#3e3628', '#5a4e3a', '#7a6c52', '#988a6c', '#b2a484'];

/** A DRESSER against a house's wall: oak, shelves of plates and jugs above, doors below. Broken: tipped over on its face, the plates smashed out across the floor. Its front to +y (`k` 0) or +x (1). 100 x 150 at (50, 120). */
function dresser(broken: boolean, k: number): Sprite {
  // built at 0.75 of its measure, to stand under a room's ceiling
  const S = turned(scene(100, 150, 50, 120), k, 0.75);
  if (!broken) {
    slab(S, -18, -6, 18, 6, 0, 30, OAK, 1, 0, (f, u, v) => (f === 2 && Math.abs(v - 0.5) < 0.02 ? -0.6 : planks(1)(f, u, v)));
    slab(S, -19, -7, 19, 7, 30, 32, OAK, 2, 0.15);
    // the back and sides of the shelves, the shelves
    slab(S, -18, -6, 18, -4, 32, 76, OAK, 3, -0.25);
    for (const x of [-18, 16]) slab(S, x, -6, x + 2, 2, 32, 76, OAK, 4, 0);
    slab(S, -19, -7, 19, 3, 76, 79, OAK, 5, 0.15);
    for (const z of [46, 60]) slab(S, -16, -4, 16, 1, z, z + 1.5, OAK, 6, 0.1);
    // plates leaning on each shelf, jugs between
    for (const z of [32, 46.5, 61]) {
      for (let i = 0; i < 4; i++) {
        const x = -12 + i * 8;
        if (z === 46.5 && i === 2) {
          cylinder(S, x, -1, (zz) => 2.4 + Math.sin(((zz - z) / 9) * Math.PI) * 1.2, z + 1.5, z + 10.5, (n) => toneAt(n, POT, 0.05), 7, () => HOLE);
          continue;
        }
        S.egg([x, -3, z + 7], [[1, 0, 0], [0, 0.3, 0.95], [0, -0.95, 0.3]], [5, 5, 0.6], (n, w) => {
          const [xx, , zz] = local(S, w);
          const r = Math.hypot(xx - x, zz - z - 7);
          return r > 3.8 ? CRM[4] : Math.abs(r - 2.6) < 0.5 ? SLB[3] : toneAt(n, CRM, 0.1);
        }, 8 + i);
      }
    }
  } else {
    // on its face: its back up, planked
    S.box([0, 8, 7], I3, [19, 30, 7], (f, u, v, n) => (f === 4 ? toneAt(n, OAK, planks(5)(5, u, v) - 0.1) : toneAt(n, OAK, -0.15)), 1);
    // the plates' shards, and one whole, rolled clear
    for (let i = 0; i < 16; i++) {
      const a = hash(i, 1, 171) * Math.PI * 2;
      const d = 22 + hash(i, 2, 171) * 14;
      S.box([Math.cos(a) * d, 8 + Math.sin(a) * d * 0.7, 0.6], [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]], [2 + hash(i, 3, 171) * 1.6, 1.4, 0.5], (_f, _u, _v, n) => toneAt(n, CRM, 0.25), 10 + i);
    }
    S.egg([-26, 26, 4.6], [[0.7, 0.7, 0], [0, 0, 1], [0.7, -0.7, 0]], [5, 5, 0.6], (n) => toneAt(n, CRM, 0.1), 40);
  }
  return done(S, 50, 120);
}

// THE ORDER'S TRAP, ON EVERY FLOOR

/**
 * A JAR OF THE HUSH, left by the Order in the street: a clay jar sealed with black wax stamped with the blank
 * mask, grey wisps leaking from under its seal. As the hero comes near it cracks, the cult's fire in the cracks
 * (the warning); then it bursts: its shards flung, a dome of the Hush swelling out over two tiles, inside which
 * the hero's words go dark. Frames: sealed, cracking, the burst (two). 150 x 130 at (75, 86).
 */
function hushJar(f: number): Sprite {
  const S = scene(150, 130, 75, 86);
  const lights: { at: V3; r: number; color: string; a?: number }[] = [];
  if (f < 2) {
    cylinder(S, 0, 0, (z) => 6 + Math.sin((z / 22) * Math.PI) * 3.4 - (z > 18 ? (z - 18) * 0.9 : 0), 0, 22, (n, a, z) => {
      if (f === 1 && Math.abs(Math.sin(a * 3 + z * 0.4)) < 0.09 && n[0] + n[1] > -0.3) return FLAME[3];
      return fr(z / 5.5) < 0.1 ? toneAt(n, POT, -0.35) : toneAt(n, POT, 0.05);
    }, 1);
    // the seal: black wax over its mouth, the mask stamped in it
    cylinder(S, 0, 0, 4.4, 22, 24, (n) => toneAt(n, BLACK, 0.2), 2, (a, rr) => (rr < 0.55 && !(Math.abs(Math.abs(Math.cos(a) * rr) - 0.22) < 0.1 && Math.sin(a) * rr > 0.05) ? MASK[2] : BLACK[3]));
    // the wisps leaking out from under the seal
    for (let i = 0; i < 5; i++) {
      const t = (i + f * 2) / 7;
      S.ball([Math.sin(i * 2.1) * (4 + t * 6), Math.cos(i * 1.7) * 3, 25 + t * 18], 0.8 + t * 0.6, HUSH, SOFT_ID + 3);
    }
    if (f === 1) lights.push({ at: [0, 0, 12], r: 20, color: FLAME[2], a: 0.35 });
  } else {
    const p = f - 2;
    // its foot left standing, its shards flung
    cylinder(S, 0, 0, 7, 0, 5, (n) => toneAt(n, POT, 0), 1, () => HOLE);
    for (let i = 0; i < 9; i++) {
      const a = i * 0.7 + 0.2;
      const d = 14 + p * 10 + hash(i, 1, 181) * 8;
      S.box([Math.cos(a) * d, Math.sin(a) * d, 1.4], [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0.3], [0, -0.3, 1]], [2.4, 1.8, 0.8], (_f, _u, _v, n) => toneAt(n, POT, 0.15), 10 + i);
    }
    // the dome of the Hush: its rim on the ground, its shell in the air, half there
    const R = 50 + p * 22;
    S.quad([[-R - 2, -R - 2, 0.4], [R + 2, -R - 2, 0.4], [R + 2, R + 2, 0.4], [-R - 2, R + 2, 0.4]], (_u, _v, w) => {
      const d = Math.hypot(w[0], w[1]);
      if (Math.abs(d - R) < 1.4) return HUSH[3];
      if (d < R) return checker(S, w, 4) ? HUSH[2] : null;
      return null;
    }, SOFT_ID + 4);
    S.egg([0, 0, 0], I3, [R, R, R * 0.62], (n, w) => {
      // the shell: its edge (seen side-on) a line of dead grey; the rest the faintest checker
      const side = Math.abs(n[0] * 0.62 + n[1] * 0.62 + n[2] * 0.48);
      if (side < 0.22) return checker(S, w) ? HUSH[4] : HUSH[3];
      if (w[2] > R * 0.45 && checker(S, w, 4)) return HUSH[2];
      return null;
    }, SOFT_ID + 5);
    // the grey wisps rolling out in it
    for (let i = 0; i < 10; i++) {
      const a = i * 0.63 + p;
      const d = R * (0.3 + 0.6 * hash(i, 2, 182));
      S.ball([Math.cos(a) * d, Math.sin(a) * d, 4 + hash(i, 3, 182) * 20], 1 + hash(i, 4, 182), HUSH, SOFT_ID + 6);
    }
  }
  return done(S, 75, 86, lights);
}

// =================================================================================================

let made: Piece[] | null = null;
/** THE SET'S PIECES, for every floor from 11 to 15 (the first of them). */
export function hushSetPieces(): Piece[] {
  if (made) return made;
  const banner = orderBanner();
  made = [
    { name: 'street lamp', kind: 'obstacle', frames: [streetLamp(0), streetLamp(1)], shadow: 0.25 },
    { name: 'barrel', kind: 'breakable', frames: [barrel(false), barrel(true)], shadow: 0.22 },
    { name: 'crates', kind: 'breakable', frames: [crates(false), crates(true)], shadow: 0.3 },
    { name: 'a crate of stolen voices', kind: 'breakable', frames: [voiceJars(false, 0), voiceJars(false, 1), voiceJars(true, 0), voiceJars(true, 1)], shadow: 0.25 },
    { name: "the Silent Order's banner", kind: 'on the wall', left: [banner.left], right: [banner.right] },
    { name: 'chimney', kind: 'obstacle', frames: [chimney(22), chimney(34)] },
    { name: "a shard of the dome", kind: 'on the floor', frames: [domeShard(false, 0), domeShard(false, 1), domeShard(true, 0), domeShard(true, 1)], shadow: 0.2 },
    { name: 'rubble of the siege', kind: 'obstacle', frames: [rubble()], shadow: 0.6 },
    // (lit, two frames; put out)
    { name: 'wall lantern', kind: 'on the wall', ...framesOf([wallLantern(0), wallLantern(1), wallLantern(2)]) },
    { name: "the Order's hooded lantern", kind: 'obstacle', frames: [orderLantern(0), orderLantern(1)], shadow: 0.3 },
    { name: "the Order's rack of jars", kind: 'obstacle', frames: [jarRack(0), jarRack(1)], shadow: 0.6 },
    { name: "the carters' cart, the Order's", kind: 'obstacle', frames: [cartersCart(0, 0), cartersCart(1, 0), cartersCart(0, 1), cartersCart(1, 1)], shadow: 0.9 },
    { name: 'bundles of blank paper', kind: 'breakable', frames: [paperBundles(false), paperBundles(true)], shadow: 0.35 },
    { name: "the Order's ink bars", kind: 'floor tile', frames: [inkBars(0), inkBars(1), inkBars(2)] },
    { name: 'an ink spill', kind: 'on the floor', frames: [inkSpill()] },
    { name: 'blank proclamations, pasted', kind: 'on the wall', ...framesOf([pastedSheets()]) },
    { name: 'washing on a line', kind: 'on the wall', ...framesOf([washing()]) },
    { name: 'a drain grate', kind: 'floor tile', frames: [drainGrate(false), drainGrate(true)] },
    { name: "a cellar's hatch", kind: 'door', frames: [cellarHatch(false), cellarHatch(true)] },
    { name: "a house's door", kind: 'door', ...framesOf([houseDoor('shut'), houseDoor('open'), houseDoor('marked')]) },
    // the rooms' (each its two ways about: along +y, along +x)
    { name: 'a tavern table and benches', kind: 'obstacle', frames: [tavernTable(0), tavernTable(1)], shadow: 0.7 },
    { name: 'the hearth', kind: 'obstacle', frames: [hearth(0, 0), hearth(1, 0), hearth(0, 1), hearth(1, 1)], shadow: 0.5 },
    { name: 'a bed', kind: 'obstacle', frames: [bed(0), bed(1)], shadow: 0.6 },
    // (whole and broken, its front along +y; the same along +x)
    { name: 'a dresser', kind: 'breakable', frames: [dresser(false, 0), dresser(true, 0), dresser(false, 1), dresser(true, 1)], shadow: 0.45 },
    // (sealed, cracking, the burst two)
    { name: 'a jar of the Hush', kind: 'trap', frames: [0, 1, 2, 3].map(hushJar), shadow: 0.2 },
  ];
  return made;
}

function framesOf(ss: { left: Sprite; right: Sprite }[]): { left: Sprite[]; right: Sprite[] } {
  return { left: ss.map((x) => x.left), right: ss.map((x) => x.right) };
}

void Px;
