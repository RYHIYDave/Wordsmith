// FLOOR 10, THE SUNKEN FEN: ITS PIECES (a mock-up; nothing of the game imports it).
//
// The owner, 15 Oct 2026, to the fen's ground (art/fen.ts), asked “Is this the Sunken Fen's ground?”, by 15:22:
// “Yes, on to its pieces (Recommended)”, offered as: next its 25 pieces: boardwalks, dead trees, the obelisks and the
// rest. What they are follows the planning chat's Sunken Fen he said yes to on 13 Oct (“Yes, this is it
// (Recommended)”: dark water, mud islands with reeds and dead trees, boardwalks between, mist low over everything;
// the arena a sunken ruin, a ring of old paving round a deep pool, three of the quarry's obelisks on it, their runes
// burning pink, cultists chanting at them).
//
// THE FLOOR'S BOSS is the Drowned Eye, the eldritch thing in the ancient swamp that powers the cult's siege of the
// town (his words of 12 Oct, 17:01: “Let’s say the cult has put the town under siege with some magic that is being
// power by some eldritch being in this ancient swamp”); his rule for a set of floors from the second on (10 Oct):
// “Going forward, let's do 25 that are the theme of the 5 levels, then 25 for each boss.” So these are the old fen's,
// the drowned ruin's, the cult's at its work here, and the Eye's.
//
// THE RULES THEY KEEP: crisp pixels, two to a game pixel; light from the upper left; the indigo seam where one thing
// ends before another; at dusk in the fen, a step quieter than the figures and duller than any word; nothing of a
// place glows, nothing cyan, nothing pink or red, but the cult's own fire on what is the cult's (the obelisk's runes,
// burning, as the quarry's obelisk was to be lit “at the Fen”); the cult's violet only on what is the cult's, and the
// swamp's sickness a dull violet. Each thing's soft shadow the game's (a piece's `shadow`). Tall things (the dead
// trees, the column, the obelisk) are seen through while someone stands behind them, as his pick of 12 Oct has it.
// What stands in the water has the water's rings round its foot.
//
// Measures as floor 4's Scene: across the floor 40 units to a tile (x down the screen to the right, y down it to the
// left), heights in picture pixels; each picture anchored at the middle of its foot.

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { Scene, XYZ, facetOf, toneAt } from './floor4';
import type { V3 } from './floor4';
import { shriekAt } from './floor5';
import { IRON, ROPE, TIMBER, add, beamAxes, finish, fr, mul, norm, seenNormal, tileUV } from './floor6';
import { BONE, SACKING } from './floor7';
import { CLOTH, PAINT } from './act1_cult';
import { FLAME } from './mkit';
import type { Piece } from './floorkit';
import { GRAIN, compose, hash } from './kit';
import type { Ramp } from './kit';

// =================================================================================================
// The colours: the fen's, at dusk

/** DEAD WOOD of the swamp's trees: grey, silvered where the light takes it. */
export const DEADWOOD: Ramp = ['#24222a', '#363339', '#4a4648', '#605a58', '#787068'];
/** The grey-green moss hanging from them in strands. */
export const HANGMOSS: Ramp = ['#262c22', '#363e2e', '#4a523c', '#5e6650', '#747c64'];
/** Moss on wood and stone. */
const MOSS: Ramp = ['#222b1b', '#2e3a22', '#3c4b2b', '#4c5e35', '#5e7040'];
/** Peat, wet: black-brown. */
const PEAT: Ramp = ['#1c1712', '#272019', '#342a20', '#43372a', '#534634'];
/** Sedge, reeds and cattails' blades, and the cattails' heads. */
const SEDGE: Ramp = ['#2e3420', '#3e4628', '#525c32', '#68703e', '#7e8450'];
const CATTAIL: Ramp = ['#2a2018', '#3a2c22', '#4e3c2c', '#5e4a38', '#6e5a46'];
/** Lily pads, and their flower, a dull cream. */
const LILY: Ramp = ['#24301c', '#304024', '#3e522c', '#4e6436', '#5e7442'];
const PETAL: Ramp = ['#6a6656', '#8a846e', '#a8a088', '#c2baa0', '#d6ceb4'];
/** Pale toadstools of the fen, tan at dusk. */
const CAP: Ramp = ['#3e362e', '#564a3e', '#6e6250', '#867862', '#9c8e76'];
/** The ruin's old stone: grey with a cold violet in it. */
export const RUIN: Ramp = ['#29272e', '#3a3741', '#4e4a56', '#64606c', '#7c7884'];
/** Slime on what has lain long in the water. */
const SLIME: Ramp = ['#202a18', '#2c3820', '#3a4828', '#4a5a32', '#5a6a3c'];
/** Wet timber, gone dark. */
const WETWOOD: Ramp = ['#221c18', '#33281f', '#46372a', '#5a4836', '#6e5a44'];
/** The water's rings round what stands in it: a line of its light, and its dark. */
const RING = '#506252';
const RINGDARK = '#18211a';
/** THE SWAMP'S SICKNESS: a dull violet. */
export const SICKV: Ramp = ['#2a2034', '#3a2c48', '#4e3c5e', '#665078', '#7c6890'];
/** THE EYE'S SPAWN: a pale, veined flesh, at dusk. */
const SPAWN: Ramp = ['#3e3a32', '#555043', '#6d6654', '#857c66', '#9a9078'];
/** THE QUARRY'S STONE the cult's obelisks were cut from (floor 6's), weathered by the fen and at dusk. */
const OBSTONE: Ramp = ['#3c3644', '#504956', '#665e68', '#7c7378', '#90867f'];
/** The boardwalk's planks: old, grey-brown, weathered. */
const BOARD: Ramp = ['#29231e', '#3a3129', '#4e4437', '#625746', '#756956'];
/** Wicker, of the cult's cages. */
const WICKER: Ramp = ['#3a3024', '#52432f', '#6a573c', '#82704e', '#9a8662'];

/** What lies under a scene's things, on the water, not seamed round in ink (their rings). */
const UNDER = new WeakMap<Scene, Scene>();
/** Finish a scene of the fen's: its seams, the indigo seam round it, and its rings on the water under it. */
function done(S: Scene, ox: number, oy: number): Sprite {
  return finish(S, ox, oy, UNDER.get(S)?.p ?? null);
}
const cross3 = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** The water's rings round a foot standing in it: `n` rings, `r` the first's reach (units), on the scene's floor. */
function rings(S: Scene, c: V3, r: number, n: number, id: number): void {
  // (painted under the thing, not seamed round in ink: a line of the water's own light, and a quieter one)
  let U = UNDER.get(S);
  if (!U) {
    U = new Scene(new Px(S.p.w, S.p.h), S.ox, S.oy);
    UNDER.set(S, U);
  }
  for (let i = 0; i < n; i++) {
    const R = r + i * 6;
    U.egg([c[0], c[1], 0.15], XYZ, [R, R * 0.92, 0.2], (_n, w) => {
      const d = Math.hypot(w[0] - c[0], (w[1] - c[1]) / 0.92);
      const a = Math.atan2(w[1] - c[1], w[0] - c[0]);
      if (d < R - 1.4) return null;
      // broken rings, lit on the side toward the light
      if (hash(Math.floor((a + 4) * 3), i, 1301) < 0.3) return null;
      return a < -0.6 && a > -2.6 ? RING : RINGDARK;
    }, id + i);
  }
}

const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot3 = (a: readonly number[], b: readonly number[]): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * A ROUND THING BUILT ALONG A LINE (a column's shaft, a drum of it, a stump): thin slices of it from `a` to `b`, each
 * `r(t)` round; `shade(n, w, t, ang, end)` its colour where it faces `n` at `w`, `t` 0..1 along it, `ang` round it, `end`
 * true on its end faces; `keep(w, t, ang)` whether that point is there (a broken top, the water).
 */
function pillar(S: Scene, a: V3, b: V3, r: (t: number) => number, shade: (n: V3, w: V3, t: number, ang: number, end: boolean) => string | null, id: number, keep?: (w: V3, t: number, ang: number) => boolean): void {
  const [A, B, C] = beamAxes(a, b);
  const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const n = Math.max(2, Math.ceil(L / 1.1));
  const where = (w: V3): [number, number, V3] => {
    const q = sub3(w, a);
    const t = dot3(q, A) / L;
    const radial = sub3(q, mul(A, dot3(q, A)));
    return [t, Math.atan2(dot3(radial, C), dot3(radial, B)), norm(radial)];
  };
  for (let i = 0; i <= n; i++) {
    const t0 = i / n;
    const c = add(a, mul(sub3(b, a), t0));
    const R = r(t0);
    S.egg(c, [B, C, A], [R, R, (L / n) * 0.75], (nn, w) => {
      const [t, ang, radial] = where(w);
      const end = (i === 0 || i === n) && Math.abs(dot3(nn, A)) > 0.75;
      return shade(end ? nn : radial, w, t, ang, end);
    }, id, keep ? (w) => {
      const [t, ang] = where(w);
      return keep(w, t, ang);
    } : undefined);
  }
}

// =================================================================================================
// THE FEN'S OWN

/**
 * A DEAD SWAMP TREE: standing in the water on splayed roots like knees, its trunk grey and silvered, cracked, bent;
 * its few limbs bare and crooked, long strands of grey-green moss hanging from them; the water's rings at its foot.
 * Tall: see it through. `tall` 0 or 1.
 */
function deadTree(tall: number, seed: number): Sprite {
  const H = 120 + tall * 50;
  const S = new Scene(new Px(190, H + 60), 95, H + 40);
  const trunk = (t: number): V3 => [Math.sin(t * 2.6 + seed) * 6 - t * 4, Math.cos(t * 2 + seed) * 4 + t * 3, t * H];
  for (let k = 0; k < 10; k++) {
    S.rod(trunk(k / 10), trunk((k + 1) / 10), 6.2 - k * 0.48, 6.2 - (k + 1) * 0.48, DEADWOOD, 1, (w) => {
      // its broken top, jagged
      if (w[2] > H - 8) return w[2] < H - 8 + 8 * fr(Math.atan2(w[1], w[0]) * 0.8 + seed);
      return true;
    });
  }
  // its roots: splayed out from its foot like knees, arching into the water
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + seed * 0.7;
    const m: V3 = [Math.cos(a) * 9, Math.sin(a) * 9, 7];
    S.rod([Math.cos(a) * 3, Math.sin(a) * 3, 13], m, 3.4, 2.6, DEADWOOD, 1);
    S.rod(m, [Math.cos(a) * 16, Math.sin(a) * 16, -0.2], 2.6, 1.6, DEADWOOD, 1);
  }
  // its limbs, crooked, and the moss hanging from them in strands
  for (let i = 0; i < 5 + tall * 2; i++) {
    const t = 0.42 + 0.5 * (i / (5 + tall * 2));
    const s = trunk(t);
    const a = i * 2.4 + seed;
    const l = 26 - i * 1.6;
    const m = add(s, [Math.cos(a) * l * 0.5, Math.sin(a) * l * 0.5, 10]);
    const e = add(m, [Math.cos(a + 0.6) * l * 0.55, Math.sin(a + 0.6) * l * 0.55, 6]);
    S.rod(s, m, 2.2, 1.4, DEADWOOD, 3 + (i % 3));
    S.rod(m, e, 1.4, 0.6, DEADWOOD, 3 + (i % 3));
    for (const [q, n] of [[m, 3], [e, 2]] as [V3, number][]) {
      for (let j = 0; j < n; j++) {
        const top = add(q, [(hash(i, j, seed + 31) - 0.5) * 6, (hash(i, j, seed + 32) - 0.5) * 6, -1]);
        const long = 14 + 16 * hash(i, j, seed + 33);
        let prev = top;
        for (let k = 1; k <= 4; k++) {
          const p = add(top, [Math.sin(k + j) * 1.2, Math.cos(k * 1.3 + i) * 1.2, -long * (k / 4)]);
          S.rod(prev, p, 0.75 - k * 0.1, 0.65 - k * 0.1, HANGMOSS, 8);
          prev = p;
        }
      }
    }
  }
  rings(S, [0, 0, 0], 22, 2, 20);
  return done(S, 95, H + 40);
}

/** A DROWNED STUMP: the broken stump of a great tree standing in the water, its top splintered, slime at its waterline, moss on it; its roots arching out of the water round it; the water's rings. */
function drownedStump(): Sprite {
  const S = new Scene(new Px(96, 80), 48, 58);
  const top = (ang: number): number => 14 + 8 * fr((ang + 3.3) * 1.15) * (0.6 + 0.4 * hash(Math.floor((ang + 3.3) * 1.15), 1, 1312));
  pillar(S, [0, 0, -1], [0, 0, 24], (t) => 9.5 - 1.6 * t + 3.5 * (1 - t) ** 6, (n, w, _t, ang, end) => {
    // the broken wood inside it, splintered and pale where the top broke away
    if (end || w[2] > top(ang) - 1.2) return toneAt(n, DEADWOOD, 0.1);
    if (w[2] < 3.5) return toneAt(n, SLIME, 0);
    // its bark: cracked up and down, moss on its shaded side
    if (Math.abs(Math.sin(ang * 9 + Math.sin(w[2] * 0.3) * 0.8)) < 0.18) return DEADWOOD[0];
    if (ang > 0.4 && ang < 2.6 && hash(Math.floor(ang * 6), Math.floor(w[2] / 3), 1313) > 0.45) return toneAt(n, MOSS, 0);
    return toneAt(n, DEADWOOD, -0.15);
  }, 1, (w, _t, ang) => w[2] < top(ang));
  // its roots: a few, short, arching out of it into the water
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.6;
    const m: V3 = [Math.cos(a) * 13, Math.sin(a) * 13, 5];
    S.rod([Math.cos(a) * 8, Math.sin(a) * 8, 5], m, 2.8, 2.2, DEADWOOD, 1);
    S.rod(m, [Math.cos(a) * 18, Math.sin(a) * 18, -0.2], 2.2, 1.6, DEADWOOD, 1);
  }
  rings(S, [0, 0, 0], 15, 2, 10);
  return done(S, 48, 58);
}

/** ARCHING ROOTS: a tangle of a drowned tree's roots arching up out of the water and back into it, grey, slimed where the water laps them. */
function archingRoots(): Sprite {
  const S = new Scene(new Px(120, 80), 60, 56);
  for (let i = 0; i < 7; i++) {
    const a = hash(i, 1, 1321) * Math.PI;
    const c: V3 = [(hash(i, 2, 1321) - 0.5) * 50, (hash(i, 3, 1321) - 0.5) * 34, 0];
    const L = 14 + 12 * hash(i, 4, 1321);
    const tall = 10 + 12 * hash(i, 5, 1321);
    let prev: V3 = add(c, [-Math.cos(a) * L, -Math.sin(a) * L, 0]);
    for (let k = 1; k <= 8; k++) {
      const t = k / 8;
      const p: V3 = add(c, [Math.cos(a) * L * (2 * t - 1), Math.sin(a) * L * (2 * t - 1), tall * Math.sin(Math.PI * t)]);
      S.rod(prev, p, 2.2 - Math.abs(t - 0.5), 2.2 - Math.abs(t - 0.5), DEADWOOD, 1 + i, (w) => w[2] > -0.5);
      prev = p;
    }
  }
  rings(S, [-6, 0, 0], 24, 1, 20);
  return done(S, 60, 56);
}

/** A SUNKEN LOG: a long log half under the water, its top above it, moss and slime along it, pale toadstools on it; the water's rings along it. */
function sunkenLog(): Sprite {
  const S = new Scene(new Px(190, 96), 95, 60);
  const a: V3 = [-50, -6, 1.5];
  const b: V3 = [46, 8, 2.5];
  for (let k = 0; k < 8; k++) {
    const p0 = add(a, mul([b[0] - a[0], b[1] - a[1], b[2] - a[2]], k / 8));
    const p1 = add(a, mul([b[0] - a[0], b[1] - a[1], b[2] - a[2]], (k + 1) / 8));
    S.rod(p0, p1, 8.6, 8.4, DEADWOOD, 1, (w) => w[2] > 0.3);
  }
  for (let i = 0; i < 8; i++) {
    const t = 0.06 + 0.88 * hash(i, 1, 1331);
    const c = add(add(a, mul([b[0] - a[0], b[1] - a[1], b[2] - a[2]], t)), [0, 0, 6.6]);
    S.egg(c, beamAxes(a, b), [5 + 3 * hash(i, 2, 1331), 3.4, 1.8], (n, w) => toneAt(n, hash(Math.floor(w[0] / 3), 0, 1332) > 0.6 ? SLIME : MOSS, 0), 2);
  }
  // pale toadstools on it, in a little row
  for (let i = 0; i < 4; i++) {
    const c = add(add(a, mul([b[0] - a[0], b[1] - a[1], b[2] - a[2]], 0.55 + i * 0.06)), [0, -2, 8]);
    S.rod(c, add(c, [0, 0, 2.5]), 0.6, 0.6, CAP, 3);
    S.egg(add(c, [0, 0, 3]), XYZ, [2 - i * 0.2, 2 - i * 0.2, 1], (n) => toneAt(n, CAP, 0.1), 4);
  }
  // the water's lines along it
  for (const s of [-1, 1]) S.rod(add(a, [0, s * 9, 0.2]), add(b, [0, s * 9, 0.2]), 0.5, 0.5, s < 0 ? [RING, RING, RING, RING, RING] : [RINGDARK, RINGDARK, RINGDARK, RINGDARK, RINGDARK], 5);
  return done(S, 95, 60);
}

/** CATTAILS AND REEDS standing in the water: tall blades, the cattails' brown heads on their stalks, a few broken and bent; the water's rings at their foot. */
function cattails(seed: number): Sprite {
  const S = new Scene(new Px(70, 84), 35, 70);
  for (let i = 0; i < 11; i++) {
    const c: V3 = [(hash(i, 1, seed) - 0.5) * 16, (hash(i, 2, seed) - 0.5) * 12, 0];
    const tall = 18 + 24 * hash(i, 3, seed);
    const lean: V3 = [(hash(i, 4, seed) - 0.5) * 7, (hash(i, 5, seed) - 0.5) * 7, 0];
    const top = add(add(c, lean), [0, 0, tall]);
    // (one clump: its blades one thing, no seams between them)
    if (i % 3 === 0) {
      S.rod(c, top, 0.42, 0.32, SEDGE, 1);
      S.egg(add(top, [0, 0, -2]), XYZ, [1.2, 1.2, 3.6], (n) => toneAt(n, CATTAIL, 0.1), 2);
      S.rod(top, add(top, [0, 0, 3.5]), 0.3, 0.25, SEDGE, 1);
    } else if (i % 4 === 1) {
      // a blade broken and bent over
      const mid = add(c, mul(sub3(top, c), 0.7));
      S.rod(c, mid, 0.45, 0.35, SEDGE, 1);
      S.rod(mid, add(mid, [lean[0] + 5, lean[1] - 2, -6]), 0.35, 0.25, SEDGE, 1);
    } else S.rod(c, top, 0.45, 0.25, SEDGE, 1);
  }
  rings(S, [0, 0, 0], 11, 1, 20);
  return done(S, 35, 70);
}

/** A SEDGE TUSSOCK: a hummock of peat thick with sedge, its blades fanning out and drooping, lit at their tips. */
function tussock(seed: number): Sprite {
  const S = new Scene(new Px(64, 48), 32, 36);
  S.egg([0, 0, 2], XYZ, [11, 10, 4], (n, w) => toneAt(n, hash(Math.floor(w[0] / 3), Math.floor(w[1] / 3), seed) > 0.5 ? PEAT : MOSS, 0), 1);
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + hash(i, 1, seed) * 0.4;
    const r0 = 3 + 4 * hash(i, 2, seed);
    const base: V3 = [Math.cos(a) * r0, Math.sin(a) * r0, 4];
    const L = 9 + 7 * hash(i, 3, seed);
    const mid = add(base, [Math.cos(a) * L * 0.4, Math.sin(a) * L * 0.4, L * 0.7]);
    const tip = add(mid, [Math.cos(a) * L * 0.5, Math.sin(a) * L * 0.5, -L * 0.2]);
    S.rod(base, mid, 0.45, 0.4, SEDGE, 2);
    S.rod(mid, tip, 0.4, 0.25, SEDGE, 2);
  }
  return done(S, 32, 36);
}

/** LILY PADS on the water: flat rounds of dull green, notched, lit along their upper left edge; one dull cream flower, half open. */
function lilyPads(seed: number): Sprite {
  const S = new Scene(new Px(80, 44), 40, 26);
  for (let i = 0; i < 7; i++) {
    const c: V3 = [(hash(i, 1, seed) - 0.5) * 36, (hash(i, 2, seed) - 0.5) * 26, 0.4];
    const r = 4 + 3 * hash(i, 3, seed);
    const notch = hash(i, 4, seed) * Math.PI * 2;
    S.egg(c, XYZ, [r, r, 0.4], (_n, w) => {
      const a = Math.atan2(w[1] - c[1], w[0] - c[0]);
      let dn = a - notch;
      dn = Math.atan2(Math.sin(dn), Math.cos(dn));
      if (Math.abs(dn) < 0.25) return null;
      const d = Math.hypot(w[0] - c[0], w[1] - c[1]) / r;
      if (d > 0.82) return a < -0.6 && a > -2.8 ? LILY[4] : LILY[1];
      return Math.abs(Math.sin(a * 4 + i)) < 0.08 ? LILY[1] : LILY[2 + (hash(i, 5, seed) < 0.5 ? 1 : 0)];
    }, 1 + i);
  }
  // the flower: pointed petals round a dull gold heart
  const f: V3 = [4, -3, 1.5];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    S.egg(add(f, [Math.cos(a) * 2.2, Math.sin(a) * 2.2, 1.2 + (k % 2)]), beamAxes([0, 0, 0], [Math.cos(a), Math.sin(a), 0.6]), [2.4, 1.1, 0.8], (n) => toneAt(n, PETAL, 0.1), 10);
  }
  S.egg(add(f, [0, 0, 2.4]), XYZ, [1.2, 1.2, 1], () => '#8a7c4e', 11);
  return done(S, 40, 26);
}

/** PALE TOADSTOOLS in the mud: a cluster on thin stems, their caps cream and tan, the gills dark under them. */
function toadstools(): Sprite {
  const S = new Scene(new Px(56, 44), 28, 32);
  const at: [number, number, number, number][] = [[-6, -5, 6.5, 3.4], [3, -7, 4, 2.4], [6, 3, 5.2, 3], [-3, 6, 2.6, 1.8]];
  at.forEach(([x, y, h, r], i) => {
    const c: V3 = [x, y, 0];
    S.rod(c, add(c, [0, 0, h]), 0.7, 0.55, CAP, 1 + i);
    // its cap: domed, its rim a shade darker, the gills dark under it
    S.egg(add(c, [0, 0, h + r * 0.1]), XYZ, [r, r, r * 0.55], (n, w) => {
      if (n[2] < -0.05) return CAP[0];
      if (Math.hypot(w[0] - x, w[1] - y) > r * 0.86) return toneAt(n, CAP, -0.3);
      return toneAt(n, CAP, 0.05);
    }, 1 + i);
  });
  return done(S, 28, 32);
}

/** A DROWNED BEAST'S RIBS: the great ribcage of something long dead, half sunk in the mud, its ribs arching up out of it, bleached, slime and moss on them, its spine along the mud. */
function drownedRibs(): Sprite {
  const S = new Scene(new Px(140, 90), 70, 62);
  // its spine along the mud, half buried
  const A: V3 = [-34, -3, 0.8];
  const B: V3 = [30, 3, 0.8];
  for (let k = 0; k < 12; k++) {
    const p0 = add(A, mul(sub3(B, A), k / 12));
    S.egg(add(p0, [0, 0, 0.6]), beamAxes(A, B), [2.4, 2.6, 2], (n) => toneAt(n, BONE, -0.05), 1);
  }
  // its ribs: rising out of the mud on either side and curving in over where its body was
  for (let i = 0; i < 8; i++) {
    const t = 0.08 + i * 0.115;
    const c = add(A, mul(sub3(B, A), t));
    const big = 1 - Math.abs(i - 3) / 5.5;
    const tall = 8 + 16 * big;
    const wide = 7 + 7 * big;
    for (const s of [-1, 1]) {
      // one of a pair broken off short, here and there
      const end = hash(i, s, 1351) < 0.25 ? 0.6 : 1;
      let prev: V3 = add(c, [0, s * wide, -0.5]);
      for (let k = 1; k <= 6; k++) {
        const u = (k / 6) * end;
        const p: V3 = add(c, [-2.5 * u, s * wide * (1 - 0.55 * u * u), tall * Math.sin((Math.PI / 2) * u)]);
        S.rod(prev, p, 1.5 - u * 0.5, 1.4 - u * 0.5, hash(i, k + s, 1352) > 0.75 ? SLIME : BONE, 2 + i * 2 + (s > 0 ? 1 : 0));
        prev = p;
      }
    }
  }
  // its skull, long, at the end, half in the mud, an eye socket dark
  S.egg(add(B, [9, 0, 2.5]), beamAxes(A, B), [9, 5.5, 4.5], (n, w) => (w[2] < 1.2 ? toneAt(n, SLIME, 0) : toneAt(n, BONE, 0)), 30);
  S.egg(add(B, [8, 3.8, 4]), XYZ, [1.8, 1.6, 1.4], () => '#16121c', 31);
  return done(S, 70, 62);
}

/** A SUNKEN ROWBOAT: an old flat-bottomed boat sunk to its gunwales, its planks rotted dark, one end lifting out of the water, an oar still in it; the water inside it and its rings round it. */
function rowboat(): Sprite {
  const S = new Scene(new Px(140, 80), 70, 54);
  // its hull: a long shallow shell, its rim above the water, its bow lifting
  const L = 40;
  const Wd = 13;
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const x = -L + 2 * L * t;
    const half = Wd * Math.sin(Math.PI * Math.min(1, 0.15 + t * 0.85));
    const z = 2 + (t > 0.7 ? (t - 0.7) * 22 : 0);
    for (const s of [-1, 1]) {
      const p0: V3 = [x, s * half, z];
      const p1: V3 = [x + (2 * L) / 16, s * Wd * Math.sin(Math.PI * Math.min(1, 0.15 + (t + 1 / 16) * 0.85)), 2 + (t + 1 / 16 > 0.7 ? (t + 1 / 16 - 0.7) * 22 : 0)];
      if (i < 16) S.rod(p0, p1, 1.4, 1.4, WETWOOD, 1);
    }
  }
  // the water in it, and its rotted thwarts
  S.egg([-6, 0, 1.2], XYZ, [L * 0.8, Wd * 0.85, 0.4], (_n, w) => (hash(Math.floor(w[0] / 4), Math.floor(w[1] / 4), 1361) > 0.8 ? '#33402f' : '#1c2a22'), 2);
  for (const x of [-18, 6]) S.box([x, 0, 3], XYZ, [2, Wd - 2, 0.8], (_f, _u, _v, n) => toneAt(n, WETWOOD, 0.1), 3);
  // the oar, lying across it
  S.rod([-30, -10, 4], [10, 16, 4.5], 0.8, 0.8, WETWOOD, 4);
  S.egg([12, 18, 4.5], beamAxes([-30, -10, 4], [10, 16, 4.5]), [5, 2.2, 0.6], (n) => toneAt(n, WETWOOD, 0.1), 4);
  rings(S, [0, 0, 0], 30, 1, 20);
  return done(S, 70, 54);
}

/** MOSSY STONES in the water: a few rounded stones, their tops above it, moss on them, the water's rings round each. */
function mossyStones(seed: number): Sprite {
  const S = new Scene(new Px(90, 50), 45, 32);
  const facet = facetOf(RUIN, 0.02);
  for (let i = 0; i < 4; i++) {
    const c: V3 = [(hash(i, 1, seed) - 0.5) * 50, (hash(i, 2, seed) - 0.5) * 30, 0];
    const r = 5 + 4 * hash(i, 3, seed);
    S.egg(add(c, [0, 0, r * 0.25]), XYZ, [r * 1.2, r, r * 0.6], (n, w) => (n[2] > 0.5 && hash(Math.floor(w[0] / 2), Math.floor(w[1] / 2), seed) > 0.3 ? toneAt(n, MOSS, 0.05) : facet(n)), 1 + i);
    rings(S, c, r * 1.4, 1, 10 + i * 2);
  }
  return done(S, 45, 32);
}

/** How a tile of the boardwalk lies: whole, along x or along y; or the half of a tile the game keeps where its way runs
 * across the screen (the upper half or the lower, cut along the tile's middle) or up and down it (the left half or the
 * right). */
export type WalkForm = 'x' | 'y' | 'upper' | 'lower' | 'left' | 'right';
export const WALK_FORMS: readonly WalkForm[] = ['x', 'y', 'upper', 'lower', 'left', 'right'];

/**
 * THE BOARDWALK, a floor tile: planks across two runners over the water, along x or along y; each
 * plank its own tone, a little crooked, gaps between them where the water shows dark; a plank missing here and there;
 * slime at their ends. One tile of it, laid end to end by the game. Where the level's way runs straight across the
 * screen or up and down it, the game keeps half tiles (as the fen's are laid): the halves' planks run across the way,
 * each its own of a few tones, the same where the next half takes it on, so that the halves laid together are one
 * walk. 64 x 34 at (32, 0).
 */
function boardwalk(form: WalkForm): Sprite {
  const p = new Px(64, 34);
  const alongY = form === 'y';
  for (let py = 0; py < 34; py++) {
    for (let px = 0; px < 64; px++) {
      const uv = tileUV(px, py);
      if (!uv) continue;
      if (form !== 'x' && form !== 'y') {
        const s = (uv[0] + uv[1]) / 64;
        const d = (uv[0] - uv[1]) / 64;
        const flat = form === 'upper' || form === 'lower';
        if (form === 'upper' && s >= 1) continue;
        if (form === 'lower' && s < 1) continue;
        if (form === 'left' && d >= 0) continue;
        if (form === 'right' && d < 0) continue;
        // across the way: 0 at its far side (its left, up and down the screen), 1 at its near side (its right)
        const w = flat ? (form === 'upper' ? s : s - 1) : form === 'left' ? d + 1 : d;
        if (w < 0.12 || w > 0.88) continue;
        // the planks: upright on the screen, six to half a tile, across a way along it; flat, four to a quarter of
        // a tile's height, across a way up and down it
        const t = flat ? (px * 3) / 16 : py / 4;
        const k = ((Math.floor(t) % (flat ? 6 : 4)) + (flat ? 6 : 4)) % (flat ? 6 : 4);
        const f = fr(t);
        if (f < (flat ? 3 / 16 : 0.25)) {
          // the gap between two planks: the dark water under, the runner showing across it near each side
          if (w < 0.24 || w > 0.74) p.set(px, py, WETWOOD[1]);
          continue;
        }
        const tone = hash(k, flat ? 3 : 4, 1376);
        // its near side in shade (the deck's thickness), its far side's plank ends lit
        const edge = w > 0.8 ? 0 : w < 0.2 ? 3 : f > 0.8 ? 1 : 2;
        let c = tone < 0.4 ? WETWOOD[Math.min(4, edge + 1)] : BOARD[Math.max(0, Math.min(4, edge + (tone > 0.75 ? 1 : 0)))];
        if (w > 0.8 && hash(px >> 1, k, 1377) < 0.5) c = SLIME[1];
        p.set(px, py, c);
        continue;
      }
      const along = alongY ? uv[1] : uv[0];
      const across = alongY ? uv[0] : uv[1];
      // the two runners under the planks' ends
      for (const c of [12, 52]) {
        const d = across - c;
        if (Math.abs(d) < 3 && along > 1 && along < 63) p.set(px, py, d < -1.5 ? WETWOOD[3] : d > 1.5 ? WETWOOD[0] : WETWOOD[2]);
      }
      // the planks across it
      const k = Math.floor((along - 1) / 7);
      if (hash(k, alongY ? 2 : 1, 1371) < 0.08) continue; // a plank gone
      const inPlank = fr((along - 1) / 7) < 0.82 && along > 1 && along < 63;
      const skew = (hash(k, 1, 1372) - 0.5) * 5;
      if (inPlank && across > 4 + skew && across < 60 + skew * 0.5) {
        const t = hash(k, 2, 1373);
        const f = fr((along - 1) / 7);
        const edge = f < 0.16 ? 3 : f > 0.68 ? 1 : 2;
        let c = BOARD[Math.max(0, Math.min(4, edge + (t > 0.7 ? 1 : t < 0.25 ? -1 : 0)))];
        if (t < 0.4) c = WETWOOD[Math.max(0, Math.min(4, edge + 1))];
        // slime at its ends, where the water reaches them
        if (across < 8 + skew || across > 55 + skew * 0.5) c = SLIME[edge];
        if (Math.abs(across - 12) < 1 && f > 0.3 && f < 0.5) c = IRON[1];
        if (Math.abs(across - 52) < 1 && f > 0.3 && f < 0.5) c = IRON[1];
        if (hash(px >> 1, py, 1374 + k) < 0.05) c = MOSS[2];
        p.set(px, py, c);
      }
    }
  }
  return p.sprite(32, 0, GRAIN);
}

/** A MARKER POST of the boardwalk: a tall post sunk in the water, a crossbar, a coil of rope over it, an old lantern hanging from it, long dark and cold; the water's rings. */
function markerPost(): Sprite {
  const S = new Scene(new Px(60, 120), 30, 106);
  S.rod([0, 0, 0], [0, 0, 82], 2.2, 2, WETWOOD, 1);
  S.rod([0, 0, 0], [0, 0, 6], 2.4, 2.3, SLIME, 1);
  S.rod([-1, -10, 74], [-1, 10, 74], 1.2, 1.2, WETWOOD, 2);
  // the rope, coiled over the bar
  for (let k = 0; k < 3; k++) S.egg([0, -4 + k * 0.8, 70 - k], XYZ, [2.6, 0.6, 3.4], (n) => toneAt(n, ROPE, 0), 3 + k);
  // the lantern: an iron frame, its glass dark, hanging on a chain
  S.rod([-1, 9, 74], [-1, 9, 66], 0.4, 0.4, IRON, 6);
  S.box([-1, 9, 61], XYZ, [2.6, 2.6, 4.2], (_f, u, v, n) => (Math.abs(u - 0.5) > 0.38 || Math.abs(v - 0.5) > 0.4 ? toneAt(n, IRON, 0.1) : '#1e2420'), 7);
  S.egg([-1, 9, 66.5], XYZ, [2, 2, 1.2], (n) => toneAt(n, IRON, 0.1), 8);
  rings(S, [0, 0, 0], 6, 2, 10);
  return done(S, 30, 106);
}

// =================================================================================================
// THE DROWNED RUIN'S

/** A BROKEN COLUMN of the ruin: an old fluted column on its plinth sunk in the mud, leaning, its top broken off jagged, moss run down its shaded side, slime at its foot, a lump of its capital fallen by it. Tall: see it through. */
function brokenColumn(): Sprite {
  const S = new Scene(new Px(90, 160), 45, 140);
  const H = 100;
  const facet = facetOf(RUIN, 0.02);
  // its base: a square plinth, sunk to its top in the mud, slime on it
  S.box([0, 0, 2.5], XYZ, [12, 12, 3], (_f, _u, v, n) => (v < 0.5 ? toneAt(n, SLIME, 0) : facet(n)), 1);
  // its shaft, leaning, fluted, its top broken off jagged
  const foot: V3 = [0, 0, 5];
  const head: V3 = [9, -5, 5 + H];
  const broke = (ang: number): number => 0.78 + 0.16 * fr((ang + 3.3) * 0.9) + 0.05 * hash(Math.floor((ang + 3.3) * 2.2), 2, 1382);
  pillar(S, foot, head, (t) => 8.4 - t * 0.9, (n, _w, t, ang, end) => {
    if (end || t > broke(ang) - 0.025) return toneAt(n, RUIN, 0.25);
    // the flutes: sixteen hollows round it, each a shade darker, its arris lit
    const f = fr((ang / (Math.PI * 2)) * 16);
    const flute = f < 0.32;
    // moss streaming down its shaded side from the break, and slime at its foot
    const col = Math.floor((ang / (Math.PI * 2)) * 16);
    const run = 0.55 + 0.3 * hash(col, 1, 1383);
    if (ang > 0.3 && ang < 2.5 && t > run - 0.4 * hash(col, 2, 1383)) return toneAt(n, MOSS, flute ? -0.3 : 0);
    if (t < 0.06) return toneAt(n, SLIME, 0);
    return toneAt(n, RUIN, flute ? -0.35 : 0);
  }, 2, (_w, t, ang) => t < broke(ang));
  // a chunk of its capital, fallen at its foot
  S.box([-16, 14, 3.5], beamAxes([0, 0, 0], [1, 0.4, 0]), [7, 6, 4], (_f, _u, _v, n) => facet(n), 3);
  return done(S, 45, 140);
}

/** FALLEN COLUMN DRUMS: the drums of a column that fell, lying in a broken line, their ends round and fluted, moss on them. */
function columnDrums(): Sprite {
  const S = new Scene(new Px(190, 100), 95, 62);
  const drums: [V3, number][] = [[[-34, -10, 7.4], 0.35], [[-2, 5, 7], 0.15], [[30, 16, 8], 0.6]];
  drums.forEach(([c, a], i) => {
    const ax: V3 = [Math.cos(a), Math.sin(a), 0];
    pillar(S, add(c, mul(ax, -8)), add(c, mul(ax, 8)), () => 9.6, (n, _w, _t, ang, end) => {
      const f = fr((ang / (Math.PI * 2)) * 16);
      // its end: the round of the stone, the flutes notched round its rim
      if (end) return toneAt(n, RUIN, f < 0.3 ? -0.15 : 0.12);
      if (ang < -0.4 && ang > -2.6 && hash(Math.floor(ang * 5), i, 1384) > 0.4) return toneAt(n, MOSS, 0);
      return toneAt(n, RUIN, f < 0.32 ? -0.35 : 0);
    }, 1 + i, (w) => w[2] > 0.3);
    // the dowel hole in its end toward the eye
    const e = add(c, mul(ax, 8.7));
    S.egg(e, beamAxes(c, e), [0.4, 1.6, 1.6], () => '#18161e', 10 + i);
  });
  rings(S, [-2, 5, 0], 34, 1, 20);
  return done(S, 95, 62);
}

/** A SUNKEN STATUE'S HEAD: a great stone face of the people before the cult, toppled into the water and sunk to its cheeks, its face turned up, worn smooth, heavy-lidded, a crack across its brow, the bands of a headdress and moss on its crown, slime at the water. */
function statueHead(): Sprite {
  const S = new Scene(new Px(110, 100), 55, 70);
  // the head lies toppled, its face turned up to the dusk and toward the eye, sunk to its cheeks
  const F = norm([0.5, 0.5, 0.72]);
  const W = norm([1, -1, 0]);
  const U = norm(cross3(W, F));
  const c: V3 = [0, 0, 5];
  const R: V3 = [12, 13, 18];
  const local = (w: V3): [number, number, number] => {
    const q = sub3(w, c);
    return [dot3(q, F) / R[0], dot3(q, W) / R[1], dot3(q, U) / R[2]];
  };
  const facet = facetOf(RUIN, 0.03);
  S.egg(c, [F, W, U], R, (n, w) => {
    const [o, a, u] = local(w);
    if (w[2] < 2.2) return toneAt(n, SLIME, 0);
    // the headdress it wore: a band across its brow, pleats over its head, moss grown in them
    if (u > 0.42 && u < 0.52 && o > 0) return fr(a * 7) < 0.2 ? RUIN[1] : toneAt(n, RUIN, 0.3);
    if (u >= 0.52 || o < 0.05) {
      if (fr(a * 6 + u * 0.5) < 0.22) return toneAt(n, RUIN, -0.4);
      if (hash(Math.floor(a * 8), Math.floor(u * 7), 1391) > 0.5) return toneAt(n, MOSS, 0);
      return facet(n);
    }
    // a crack across its brow and down its cheek
    if (Math.abs(u - 0.3 + a * 0.5) < 0.03 && a > -0.2 && a < 0.62) return RUIN[0];
    // its eyes: open, blank, under a heavy lid
    for (const s of [-1, 1]) {
      const e = Math.hypot((a - s * 0.36) / 0.19, (u - 0.17) / 0.085);
      if (e < 1) return u > 0.2 ? RUIN[0] : toneAt(n, RUIN, 0.15);
    }
    // its brow, standing over them
    if (u > 0.27 && u < 0.36 && Math.abs(a) < 0.6) return toneAt(n, RUIN, 0.3);
    // its mouth, shut, its corners turned down
    if (Math.abs(u + 0.42 + 0.35 * a * a) < 0.03 && Math.abs(a) < 0.24) return RUIN[0];
    return facet(n);
  }, 1, (w) => w[2] > 0.3);
  // its nose, worn, and its ear
  S.egg(add(c, add(mul(F, R[0] * 0.92), mul(U, -0.1 * R[2]))), [F, W, U], [3.2, 2.6, 5.6], (n) => facetOf(RUIN, 0.08)(n), 1);
  S.egg(add(c, add(mul(W, R[1] * 0.92), mul(U, 0.08 * R[2]))), [W, F, U], [2, 1.8, 4.2], (n) => facetOf(RUIN, 0)(n), 1, (w) => w[2] > 0.3);
  rings(S, c, 20, 2, 10);
  return done(S, 55, 70);
}

/** A BROKEN STAIR of the ruin: three wide steps going down into the water, cracked and sunk, slime on the lowest, moss in the joints, a stone of the top step tilted out of its bed. */
function brokenStair(): Sprite {
  const S = new Scene(new Px(130, 80), 65, 52);
  const facet = facetOf(RUIN, 0.02);
  for (let k = 0; k < 3; k++) {
    for (let j = 0; j < 4; j++) {
      const c: V3 = [-12 + k * 12, -21 + j * 14, 3 + (2 - k) * 6];
      const tilt = k === 0 && j === 2;
      S.box(c, tilt ? beamAxes([0, 0, 0], [1, 0.2, 0.3]) : XYZ, [5.6, 6.6, 3 + (2 - k) * 3], (f, _u, v, n) => {
        if (k === 2 && v < 0.6) return toneAt(n, SLIME, 0);
        if (f === 4 && hash(j, k, 1395) > 0.6) return toneAt(n, MOSS, 0);
        return facet(n);
      }, 1 + k * 4 + j);
    }
  }
  rings(S, [16, 0, 0], 30, 1, 30);
  return done(S, 65, 52);
}

// =================================================================================================
// THE CULT'S, AT ITS WORK

/**
 * THE CULT'S OBELISK: one of the three the cult cut in the quarry, stood upright here on a plinth on the ruin's
 * paving, its point to the dusk, its stone gone grey in the fen; down its face toward the eye three of the cult's
 * skulls cut in it and the channel joining them, as on the quarry's half-cut obelisk, lit here with its fire, pink
 * burning to gold, pulsing (4 frames); a mote of the fire at its point. It lights what is round it in its pink (the
 * enemy's glow). Tall: see it through.
 */
function cultObelisk(f: number): Sprite {
  const S = new Scene(new Px(90, 196), 45, 180);
  const H = 136;
  const W0 = 10;
  const W1 = 6.5;
  const pulse = [0, 1, 2, 1][f % 4];
  // its plinth of the ruin's stone, a step under it, slime round its foot
  S.box([0, 0, 3], XYZ, [15, 15, 3.4], (_f, _u, v, n) => (v < 0.35 ? toneAt(n, SLIME, 0) : facetOf(RUIN, 0.02)(n)), 1);
  const half = (z: number): number => W0 + (W1 - W0) * ((z - 6) / (H - 6));
  const q0: [V3, V3, V3, V3] = [[W0, -W0, 6], [W0, W0, 6], [W1, W1, H], [W1, -W1, H]];
  const q1: [V3, V3, V3, V3] = [[-W0, W0, 6], [W0, W0, 6], [W1, W1, H], [-W1, W1, H]];
  for (const [q, s] of [[q0, 1], [q1, -1]] as [[V3, V3, V3, V3], number][]) {
    const n = seenNormal(q);
    S.quad(q, (u, v) => {
      const z = 6 + v * (H - 6);
      const across = (u - 0.5) * 2 * half(z);
      if (s > 0) {
        // the cult's marks cut down its face toward the eye, three of its skulls, each burning in its hollows
        for (let k = 0; k < 3; k++) {
          const cz = H - 22 - k * 34;
          const m = shriekAt(across / (6.4 - k * 0.6), -(z - cz) / (7.2 - k * 0.6));
          if (m === 'dark') return FLAME[Math.min(4, 2 + pulse)];
          if (m === 'bone') return FLAME[1];
        }
        // the channel between them, burning, down its middle to its foot
        if (Math.abs(across) < 0.9 && z > 10 && z < H - 14) return FLAME[pulse > 1 ? 3 : 2];
      }
      // its edges worn, the stone streaked darker where the fen's water has run down it
      if (v > 0.985) return OBSTONE[4];
      if (z < 16 && hash(Math.floor(u * 9), 0, 1402) > 0.3) return toneAt(n, SLIME, 0);
      if (fr(u * 7 + hash(Math.floor(u * 7), 1, 1403) * 0.4) < 0.1 && v < 0.5 + 0.4 * hash(Math.floor(u * 7), 2, 1403)) return OBSTONE[s > 0 ? 1 : 0];
      return toneAt(n, OBSTONE, s > 0 ? 0 : -0.08);
    }, 2);
  }
  // its point: the pyramidion
  const T: V3 = [0, 0, H + 12];
  for (const q of [[[W1, -W1, H], [W1, W1, H], T, T], [[-W1, W1, H], [W1, W1, H], T, T]] as [V3, V3, V3, V3][]) S.quad(q, () => toneAt(seenNormal(q), OBSTONE, 0.1), 3);
  S.seams();
  const p = S.p;
  // the mote of fire at its point, where the cult's line of magic leaves it (the line is the game's)
  const [tx, ty] = S.at([0, 0, H + 15]);
  const X = Math.round(tx);
  const Y = Math.round(ty);
  const mote = pulse > 0 ? 2 : 1;
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (Math.abs(dx) + Math.abs(dy) <= mote) p.set(X + dx, Y + dy, Math.abs(dx) + Math.abs(dy) < mote ? FLAME[4] : FLAME[2]);
  const s = compose(null, [p], null).sprite(45, 180, GRAIN);
  const [rx, ry] = S.at([W0, 0, 60]);
  const lights: Light[] = [
    { x: rx / GRAIN, y: ry / GRAIN, r: 28 + pulse * 3, color: FLAME[2], a: 0.3 + pulse * 0.04 },
    { x: tx / GRAIN, y: ty / GRAIN, r: 12 + pulse * 2, color: FLAME[3], a: 0.45 },
  ];
  s.lights = lights;
  return s;
}

/** THE CULT'S RAFT: a raft of lashed logs moored at the boardwalk, sacks and a crate of its stores on it under a violet cloth, a pole lying across it; the water's rings. */
function cultRaft(): Sprite {
  const S = new Scene(new Px(130, 80), 65, 52);
  for (let i = 0; i < 5; i++) {
    const y = -16 + i * 8;
    S.rod([-30, y, 2], [30, y + 1, 2], 3.6, 3.6, WETWOOD, 1 + i);
  }
  for (const x of [-22, 22]) S.rod([x, -20, 5.4], [x + 1, 20, 5.4], 0.7, 0.7, ROPE, 6);
  // its stores under a violet cloth, a sack spilled
  S.box([-6, -4, 11], XYZ, [9, 8, 6], (_f, _u, _v, n) => toneAt(n, TIMBER, 0), 7);
  S.box([-6, -4, 11.5], XYZ, [10, 9, 5.8], (f, u, _v, n) => (f === 4 ? toneAt(n, CLOTH, 0.05) : fr(u * 4) < 0.2 ? toneAt(n, CLOTH, -0.45) : toneAt(n, CLOTH, -0.1)), 8);
  for (let i = 0; i < 3; i++) S.egg([10 + i * 6, 6 - i * 4, 9], XYZ, [5, 4, 4.4], (n) => toneAt(n, SACKING, 0), 9 + i);
  S.rod([-34, 14, 6.5], [26, -24, 7], 0.8, 0.8, TIMBER, 12);
  rings(S, [0, 0, 0], 34, 1, 20);
  return done(S, 65, 52);
}

/** THE CULT'S SUPPLY CRATES by the boardwalk, its mark painted on them (whole); broken open, the crates split, their straw and the sacks of its stores spilled (broken). */
function supplyCrates(broken: boolean): Sprite {
  const S = new Scene(new Px(90, 80), 45, 58);
  const crate = (c: V3, r: V3, mark: boolean, id: number): void => S.box(c, XYZ, r, (face, u, v, n) => {
    const plank = fr(v * 4) < 0.12;
    if (mark && face === 1 && Math.hypot(u - 0.5, v - 0.5) < 0.22 && shriekAt((u - 0.5) * 4.4, (0.5 - v) * 4.4)) return PAINT;
    return toneAt(n, TIMBER, plank ? -0.6 : -0.2);
  }, id);
  if (!broken) {
    crate([-4, -6, 7], [9, 8, 7], true, 1);
    crate([8, 8, 6], [7, 7, 6], false, 2);
    crate([-2, -4, 19], [7, 6, 5], true, 3);
  } else {
    // split boards, straw, its jars spilled
    for (let i = 0; i < 7; i++) {
      const a = hash(i, 1, 1421) * Math.PI;
      const c: V3 = [(hash(i, 2, 1421) - 0.5) * 30, (hash(i, 3, 1421) - 0.5) * 26, 1.2];
      S.box(c, beamAxes([0, 0, 0], [Math.cos(a), Math.sin(a), 0]), [7, 1.6, 0.8], (_f, _u, _v, n) => toneAt(n, TIMBER, -0.2), 1 + i);
    }
    for (let i = 0; i < 14; i++) S.rod([(hash(i, 4, 1421) - 0.5) * 24, (hash(i, 5, 1421) - 0.5) * 20, 0.6], [(hash(i, 6, 1421) - 0.5) * 24, (hash(i, 7, 1421) - 0.5) * 20, 0.6], 0.4, 0.4, ROPE, 10);
    for (let i = 0; i < 3; i++) S.egg([-8 + i * 9, 10 - i * 7, 2.4], beamAxes([0, 0, 0], [1, 0.4 * i, 0]), [3.6, 2.4, 2.4], (n) => toneAt(n, SACKING, 0.1), 12 + i);
  }
  return done(S, 45, 58);
}

/** A CAGE OF OFFERINGS: a cage of wicker on a stake the cult set in the mud, bones and trinkets hung in it for the Eye (whole); smashed, its wicker torn open, what was in it fallen (broken). */
function offeringCage(broken: boolean): Sprite {
  const S = new Scene(new Px(70, 110), 35, 94);
  S.rod([0, 0, 0], [0, 0, broken ? 30 : 70], 1.6, 1.4, WETWOOD, 1);
  if (!broken) {
    // the cage: a round of wicker staves, bound top and bottom
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      S.rod([Math.cos(a) * 9, Math.sin(a) * 9, 40], [Math.cos(a) * 7, Math.sin(a) * 7, 68], 0.8, 0.7, WICKER, 2);
    }
    for (const z of [40, 54, 68]) S.egg([0, 0, z], XYZ, [9 - (z - 40) * 0.07, 9 - (z - 40) * 0.07, 0.8], (n, w) => (Math.hypot(w[0], w[1]) > 7.5 - (z - 40) * 0.07 ? toneAt(n, WICKER, 0.1) : null), 3);
    // in it: a skull, bones, a string of the cult's beads
    S.egg([0, 0, 47], XYZ, [3.6, 3.2, 3.6], (n) => toneAt(n, BONE, 0.05), 4);
    S.egg([1.4, -1.6, 47.4], XYZ, [0.9, 0.9, 1], () => '#16121c', 5);
    S.rod([-4, 3, 42], [4, -3, 44], 0.8, 0.8, BONE, 6);
    for (let k = 0; k < 6; k++) S.egg([-5 + k * 2, 4 - k * 0.4, 58 - Math.sin(k) * 2], XYZ, [0.8, 0.8, 0.8], (n) => toneAt(n, CLOTH, 0.2), 7);
  } else {
    // torn wicker on the mud, the skull and bones fallen
    for (let k = 0; k < 8; k++) {
      const a = hash(k, 1, 1431) * Math.PI;
      const c: V3 = [(hash(k, 2, 1431) - 0.5) * 30, (hash(k, 3, 1431) - 0.5) * 24, 0.8];
      S.rod(add(c, [-Math.cos(a) * 6, -Math.sin(a) * 6, 0]), add(c, [Math.cos(a) * 6, Math.sin(a) * 6, 2]), 0.7, 0.6, WICKER, 2 + k);
    }
    S.egg([8, 6, 3.4], XYZ, [3.6, 3.2, 3.4], (n) => toneAt(n, BONE, 0.05), 12);
    S.rod([-8, -4, 0.8], [0, -10, 0.8], 0.8, 0.8, BONE, 13);
  }
  return done(S, 35, 94);
}

// =================================================================================================
// THE EYE'S

/** EYESPAWN EGGS: a clutch of pale eggs laid in the mud, veined with the swamp's violet, the shadow of an eye curled in each (whole); burst, their shells split and sagging, slime run out over the mud (broken). */
function spawnEggs(broken: boolean): Sprite {
  const S = new Scene(new Px(90, 70), 45, 48);
  S.egg([0, 0, 0.8], XYZ, [20, 16, 1.2], (n, w) => toneAt(n, hash(Math.floor(w[0] / 3), Math.floor(w[1] / 3), 1441) > 0.5 ? SLIME : PEAT, 0), 1);
  const EYE: V3 = norm([0.7, 0.45, 0.4]);
  const at: [number, number, number][] = [[-8, -6, 7], [6, -7, 6], [0, 4, 7.5], [-11, 6, 5.5], [11, 5, 5]];
  at.forEach(([x, y, r], i) => {
    const c: V3 = [x, y, 0];
    if (!broken) {
      S.egg(add(c, [0, 0, r * 0.85]), XYZ, [r, r, r * 1.05], (n, w) => {
        // the eye curled in it, its shadow showing through its skin on the side toward the eye
        const d = Math.hypot(n[0] - EYE[0], n[1] - EYE[1], n[2] - EYE[2]);
        if (d < 0.5) return d < 0.2 ? '#231b18' : d < 0.34 ? '#5c4d33' : toneAt(n, SPAWN, -0.3);
        // the veins of the sickness up it
        const a = Math.atan2(w[1] - y, w[0] - x);
        if (Math.abs(Math.sin(a * 2.5 + w[2] * 0.45 + i * 1.7)) < 0.3) return SICKV[n[2] > 0.4 ? 3 : 2];
        return toneAt(n, SPAWN, 0);
      }, 2 + i);
    } else {
      // split, sagging shells: the lower half left, its rim torn, its slime in it
      S.egg(add(c, [0, 0, r * 0.4]), XYZ, [r, r, r * 0.5], (n, w) => (w[2] > r * 0.4 + r * 0.35 * fr(Math.atan2(w[1] - y, w[0] - x) * 1.3) ? null : n[2] > 0.6 ? '#262a1c' : toneAt(n, SPAWN, -0.1)), 2 + i);
    }
  });
  return done(S, 45, 48);
}

/** THE SUCKING BOG, a trap tile: a patch of mud gone soft (still, a bubble or two); bubbling as it wakes; sucking down in a slow whirl; and swallowing, its middle sunk dark. 4 frames. 64 x 34 at (32, 0). */
function suckingBog(f: number): Sprite {
  const p = new Px(64, 34);
  for (let py = 0; py < 34; py++) {
    for (let px = 0; px < 64; px++) {
      const uv = tileUV(px, py);
      if (!uv) continue;
      const du = (uv[0] - 32) / 32;
      const dv = (uv[1] - 32) / 32;
      const d = Math.hypot(du, dv);
      if (d > 0.82) continue;
      const a = Math.atan2(dv, du);
      const n = hash(px >> 1, py, 1451);
      let c: string | null = null;
      // the soft mud: wetter, darker, a sheen on it
      if (d < 0.78) c = n > 0.8 ? PEAT[3] : n > 0.4 ? PEAT[2] : PEAT[1];
      if (d > 0.72) c = n > 0.5 ? PEAT[1] : null;
      if (f === 0) {
        if (Math.hypot(du - 0.2, dv + 0.1) < 0.06) c = PEAT[4];
      } else if (f === 1) {
        // bubbles rising, a ring of each
        for (const [bx, by, r] of [[0.15, -0.1, 0.1], [-0.25, 0.2, 0.07], [0.3, 0.3, 0.06]] as const) {
          const e = Math.hypot(du - bx, dv - by);
          if (Math.abs(e - r) < 0.025) c = e < r && du < bx ? PEAT[5 - 1] : PEAT[4];
          else if (e < r) c = PEAT[0];
        }
      } else {
        // the whirl: arms of wet mud turning in, its middle sinking dark
        const spin = fr(a / (Math.PI * 2) * 3 + d * (f === 2 ? 3 : 4.5));
        if (spin < 0.18) c = PEAT[4];
        else if (spin < 0.3) c = PEAT[0];
        if (d < (f === 2 ? 0.14 : 0.26)) c = f === 3 && d < 0.18 ? '#0e0c0e' : PEAT[0];
      }
      if (c) p.set(px, py, c);
    }
  }
  return p.sprite(32, 0, GRAIN);
}

/** THE DROWNED PILGRIM'S TABLET (the quest piece): a stone tablet half sunk in the mud and leaning, carved before the cult came with an eye over water and lines of an old script; moss on its top. */
function pilgrimTablet(): Sprite {
  const S = new Scene(new Px(64, 80), 32, 62);
  // a slab, its face to the eye, leaning a little back, sunk in the mud
  const A: [V3, V3, V3] = [norm([1, 1, 0.5]), norm([-1, 1, 0]), norm([-0.25, -0.25, 1])];
  S.box([0, 0, 13], A, [2.6, 11, 17], (f, u, v, n) => {
    if (f !== 0) return toneAt(n, RUIN, -0.1);
    if (v < 0.1) return toneAt(n, SLIME, 0);
    if (v > 0.9) return toneAt(n, MOSS, 0.05);
    // the eye carved on it, over the water's waves
    const ex = (u - 0.5) * 2;
    const ey = (v - 0.68) * 3.4;
    const e = Math.hypot(ex / 0.62, ey / 0.32);
    if (Math.abs(e - 1) < 0.16) return RUIN[0];
    if (Math.hypot(ex, ey) < 0.17) return RUIN[0];
    for (const wv of [0.44, 0.38]) if (Math.abs(Math.sin(u * 15) * 0.025 - (v - wv)) < 0.013 && u > 0.14 && u < 0.86) return RUIN[0];
    // lines of an old script under it
    if (v > 0.14 && v < 0.32 && fr(v * 25) < 0.32 && hash(Math.floor(u * 11), Math.floor(v * 25), 1461) < 0.7 && u > 0.12 && u < 0.88) return RUIN[1];
    return toneAt(n, RUIN, 0.1);
  }, 1);
  return done(S, 32, 62);
}

/** THE EYE'S REACH: pale cords of its flesh broken up out of the mud and knotted, veined with the swamp's violet, slime on them; where it has rooted itself far from its pool. */
function eyesReach(): Sprite {
  const S = new Scene(new Px(110, 80), 55, 56);
  for (let i = 0; i < 6; i++) {
    const a = hash(i, 1, 1471) * Math.PI * 2;
    const c: V3 = [(hash(i, 2, 1471) - 0.5) * 34, (hash(i, 3, 1471) - 0.5) * 24, 0];
    const L = 12 + 10 * hash(i, 4, 1471);
    const tall = 8 + 14 * hash(i, 5, 1471);
    let prev: V3 = add(c, [-Math.cos(a) * L, -Math.sin(a) * L, -1]);
    for (let k = 1; k <= 9; k++) {
      const t = k / 9;
      const wob = Math.sin(t * 9 + i) * 2.2;
      const p: V3 = add(c, [Math.cos(a) * L * (2 * t - 1) - Math.sin(a) * wob, Math.sin(a) * L * (2 * t - 1) + Math.cos(a) * wob, tall * Math.sin(Math.PI * t) - 1]);
      const r = 3.2 - Math.abs(t - 0.5) * 2.2;
      S.rod(prev, p, r, r, SPAWN, 1 + i, (w) => w[2] > -0.2);
      // a vein of the sickness winding along it, standing a little proud of its skin
      const turn = t * 5 + i;
      const off: V3 = [Math.cos(turn) * r * 0.85, Math.sin(turn) * r * 0.85, Math.abs(Math.sin(turn * 0.7)) * r * 0.7];
      const turn0 = (k - 1) / 9 * 5 + i;
      const off0: V3 = [Math.cos(turn0) * r * 0.85, Math.sin(turn0) * r * 0.85, Math.abs(Math.sin(turn0 * 0.7)) * r * 0.7];
      S.rod(add(prev, off0), add(p, off), 0.75, 0.75, SICKV, 1 + i, (w) => w[2] > -0.2);
      prev = p;
    }
  }
  // its veins: violet lines along the cords; and slime pooled at their roots
  S.egg([0, 0, 0.6], XYZ, [26, 18, 0.8], (n, w) => (hash(Math.floor(w[0] / 3), Math.floor(w[1] / 3), 1472) > 0.55 ? toneAt(n, SLIME, 0) : null), 0);
  const p = done(S, 55, 56);
  return p;
}

/** THE SUNKEN FEN'S 25 PIECES: the fen's own, the drowned ruin's, the cult's at its work, and the Eye's. */
export function fenPieces(): Piece[] {
  return [
    { name: 'dead swamp tree', kind: 'obstacle', frames: [deadTree(0, 3), deadTree(1, 7)], shadow: 0.5 },
    { name: 'drowned stump', kind: 'obstacle', frames: [drownedStump()], shadow: 0.35 },
    { name: 'arching roots', kind: 'obstacle', frames: [archingRoots()], shadow: 0.5 },
    { name: 'sunken log', kind: 'obstacle', frames: [sunkenLog()], shadow: 0.6 },
    { name: 'cattails', kind: 'on the floor', frames: [cattails(1481), cattails(1483)] },
    { name: 'sedge tussock', kind: 'on the floor', frames: [tussock(1485), tussock(1487)], shadow: 0.25 },
    { name: 'lily pads', kind: 'on the floor', frames: [lilyPads(1489)] },
    { name: 'pale toadstools', kind: 'on the floor', frames: [toadstools()] },
    { name: "a drowned beast's ribs", kind: 'obstacle', frames: [drownedRibs()], shadow: 0.6 },
    { name: 'a sunken rowboat', kind: 'obstacle', frames: [rowboat()], shadow: 0.7 },
    { name: 'mossy stones', kind: 'on the floor', frames: [mossyStones(1491)] },
    { name: 'the boardwalk', kind: 'floor tile', frames: WALK_FORMS.map(boardwalk) },
    { name: 'a marker post', kind: 'obstacle', frames: [markerPost()], shadow: 0.25 },
    { name: 'a broken column', kind: 'obstacle', frames: [brokenColumn()], shadow: 0.45 },
    { name: 'fallen column drums', kind: 'obstacle', frames: [columnDrums()], shadow: 0.8 },
    { name: "a sunken statue's head", kind: 'obstacle', frames: [statueHead()], shadow: 0.8 },
    { name: 'a broken stair', kind: 'obstacle', frames: [brokenStair()], shadow: 0.6 },
    { name: "the cult's obelisk", kind: 'obstacle', frames: [0, 1, 2, 3].map(cultObelisk), shadow: 0.6 },
    { name: "the cult's raft", kind: 'obstacle', frames: [cultRaft()], shadow: 0.8 },
    { name: "the cult's supply crates", kind: 'breakable', frames: [supplyCrates(false), supplyCrates(true)], shadow: 0.45 },
    { name: 'a cage of offerings', kind: 'breakable', frames: [offeringCage(false), offeringCage(true)], shadow: 0.25 },
    { name: 'eyespawn eggs', kind: 'breakable', frames: [spawnEggs(false), spawnEggs(true)], shadow: 0.3 },
    { name: 'the sucking bog', kind: 'trap', frames: [0, 1, 2, 3].map(suckingBog) },
    { name: "the drowned pilgrim's tablet", kind: 'quest', frames: [pilgrimTablet()], shadow: 0.3 },
    { name: "the Eye's reach", kind: 'obstacle', frames: [eyesReach()], shadow: 0.5 },
  ];
}
