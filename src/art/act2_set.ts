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
import type { V3 } from './floor4';
import { timber } from './floor6';
import type { Piece } from './floorkit';
import { hash, mix } from './kit';
import { FLAME } from './mkit';
import { EMBER } from './props';
import { BLACK, BRICK, CLAY, CHAR, DEAL, HOLE, IRON, MASK, OAK, STONE, cylinder, done, frontPiece, planks, scene, slab } from './act2_kit';

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
  ];
  return made;
}

void Px;
void mix;
void timber;
