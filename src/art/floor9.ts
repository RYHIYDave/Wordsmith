// FLOOR 9, THE PINEWOOD (THE HOLLOW WOOD): ITS PIECES (a mock-up; nothing of the game imports it).
//
// The owner, 15 Oct 2026, to the Pinewood's ground (art/pinewood.ts), asked “Is this the Pinewood's ground?”, by
// 11:04: “Yes, on to its pieces (Recommended)”, offered as: next, the pines, groves, footbridges, the hunter's
// cabin, the cult's camp, twisted trees toward the swamp. What they are follows the planning chat's Pinewood he
// said yes to on 13 Oct (“Yes, this is it (Recommended)”: big open meadows, the river with little bridges, the
// pines in groves and along the far edge, never a wall; a hunter's old cabin by the river; the cult's siege camp
// glimpsed through the trees, a patrol out of it; toward the swamp the trees dark and twisted, a violet sickness
// in the ground).
//
// THE FLOOR'S BOSS is the Hollow Stag, a stag hollowed out by the swamp, an eye in its ribs (his yes of 12 Oct,
// 18:07); his rule for a set of floors from the second on (10 Oct): “Going forward, let's do 25 that are the
// theme of the 5 levels, then 25 for each boss.” So these are the old pine wood's, its hunter's, the cult's camp
// in it, and the Stag's.
//
// THE RULES THEY KEEP: crisp pixels, two to a game pixel; light from the upper left; the indigo seam where one
// thing ends before another; in daylight in the wood, a step quieter than the figures and duller than any word;
// nothing of a place glows, nothing cyan, nothing pink or red (berries blue-black, toadstools pale, never the
// fly agaric's red); the cult's violet only on what is the cult's, and the swamp's sickness a dull violet. Each
// thing's soft shadow the game's (a piece's `shadow`). Tall things (the pines, the snag, the twisted pine) are
// seen through while someone stands behind them, as his pick of 12 Oct has it.
//
// Measures as floor 4's Scene: across the floor 40 units to a tile (x down the screen to the right, y down it
// to the left), heights in picture pixels; each picture anchored at the middle of its foot.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { Scene, XYZ, facetOf, toneAt } from './floor4';
import type { V3 } from './floor4';
import { IRON, ROPE, TIMBER, add, beamAxes, finish, fr, mul, rope, tileUV } from './floor6';
import { BONE, DRIFT, HIDE, SACKING } from './floor7';
import { CLOTH, PAINT } from './act1_cult';
import type { Piece } from './floorkit';
import { GRAIN, compose, hash } from './kit';
import type { Ramp } from './kit';

// =================================================================================================
// The colours: the old wood's, in daylight under its trees

/** AN OLD PINE'S NEEDLES: deep blue-green to sunlit (hue kept well off the friend's cyan). */
export const NEEDLES: Ramp = ['#13221c', '#1b3126', '#264433', '#335a40', '#467250'];
/** Its bark: plates of red-brown, the cracks between them dark. */
export const PBARK: Ramp = ['#2e2420', '#48362c', '#624a38', '#7c5e46', '#947456'];
/** The wood's grey granite. */
export const GRANITE: Ramp = ['#3c3e3c', '#545854', '#6e726c', '#8a8e86', '#a6a89e'];
/** Moss, on the stones and the logs. */
export const MOSS: Ramp = ['#26301f', '#34422a', '#465a34', '#5a7040', '#728a52'];
/** Ferns. */
export const FERN: Ramp = ['#22301f', '#2f4428', '#405c34', '#567842', '#6e9052'];
/** Bilberries, blue-black (never red). */
const BERRY: Ramp = ['#22223a', '#2e2e4a', '#3c3e5e', '#54587a', '#6e7294'];
/** Small leaves of a bush, dull green. */
const LEAF: Ramp = ['#24301e', '#33432a', '#465a36', '#5c7244', '#748a58'];
/** Toadstools: pale caps, tan and cream (never the fly agaric's red). */
const CAP: Ramp = ['#6a5a48', '#8e7a60', '#b29c7c', '#cebc9a', '#e2d4b6'];
/** Cattails: the reeds' olive, and their heads' dark brown. */
const REED: Ramp = ['#3a4228', '#4e5832', '#646e3e', '#7c864e', '#949c64'];
const CATTAIL: Ramp = ['#2a1e16', '#3c2c22', '#523d2e', '#6a503b', '#7e6047'];
/** River stones, wet: darker, a sheen on their tops. */
const WETSTONE: Ramp = ['#2e3232', '#404646', '#565c5a', '#727874', '#929892'];
/** THE SWAMP'S SICKNESS in what grows: a dull violet. */
export const SICKV: Ramp = ['#2a2034', '#3a2c48', '#4e3c5e', '#665078', '#7c6890'];
/** A sick tree's bark, gone grey and dead. */
const SICKBARK: Ramp = ['#24222a', '#363440', '#4a4854', '#5e5c68', '#74727c'];

// =================================================================================================
// A PINE, painted flat as a tree is seen (as floor 6's are): its trunk, and its crown in tiers

/**
 * A PINE OF THE OLD WOOD: a straight trunk of red-brown plated bark, bare a long way up (an old tree's), dead
 * stubs of its lowest boughs on it, its roots flaring into the needles at its foot; its crown in tiers that
 * droop and taper to a spire, each tier lit at its upper left, in shade to the right and under; needles catching
 * the sun at its edges. `H` its height, `bare` how much of it is bare trunk under the crown (a share of it), `seed`.
 */
function pineOf(H: number, bare: number, seed: number, sick = 0): Sprite {
  const wide = Math.round(H * 0.34);
  const W = 2 * Math.ceil(wide * 1.6) + 10;
  const cx = W / 2;
  const foot = H + 8;
  const p = new Px(W, H + 14);
  const tw = Math.max(2, Math.round(H / 46));
  // its trunk, all the way up (seen between the tiers), the plates of its bark lit at their left
  for (let y = 6; y <= foot; y++) {
    const k = (foot - y) / H;
    const half = tw * (1.15 - 0.6 * k) + (y > foot - 4 ? (y - (foot - 4)) * 0.9 : 0);
    for (let x = Math.floor(cx - half); x <= Math.ceil(cx + half - 1); x++) {
      const u = (x + 0.5 - (cx - half)) / (2 * half);
      const plate = hash(Math.floor(x / 2), Math.floor(y / 5 + (x % 3) * 0.3), seed + 3) < 0.25;
      let tone = u < 0.3 ? 3 : u < 0.7 ? 2 : 1;
      if (plate) tone = Math.max(0, tone - 2);
      if (u > 0.85) tone = 0;
      p.set(x, y, (sick ? SICKBARK : PBARK)[tone]);
    }
  }
  // dead stubs of its lowest boughs, below the crown
  const crownTop = 6;
  const crownFoot = Math.round(foot - H * bare);
  for (let s = 0; s < (foot - crownFoot > 30 ? 2 + Math.floor(H / 80) : 0); s++) {
    const y = crownFoot + 4 + Math.floor(hash(s, seed, 11) * (foot - crownFoot - 16));
    const side = hash(s, seed, 12) < 0.5 ? -1 : 1;
    const len = 3 + Math.floor(hash(s, seed, 13) * 5);
    for (let i = 0; i < len; i++) p.set(Math.round(cx + side * (tw + i)), y + Math.floor(i / 3), DRIFT[side < 0 ? 3 : 1]);
  }
  // its roots flaring at its foot
  for (const side of [-1, 1]) for (let i = 0; i < 4; i++) p.set(Math.round(cx + side * (tw + i + 1)), foot - 1 + (i > 1 ? 1 : 0), PBARK[side < 0 ? 2 : 0]);
  // the crown: from its lowest tier up, so that each tier lies over the one below it
  const tiers = 4 + Math.round(H / 34);
  const top = crownTop;
  const bottom = crownFoot;
  for (let t = tiers - 1; t >= 0; t--) {
    const k = (t + 1) / tiers;
    const ty = top + (bottom - top) * Math.pow(t / tiers, 1.1);
    const by = top + (bottom - top) * Math.pow(k, 1.1);
    const half = 4 + (wide - 4) * Math.pow(k, 0.85) * (0.8 + 0.4 * hash(t, seed, 14));
    // (an old tree's tiers lopsided, longer one side than the other)
    const lop = (hash(t, seed, 15) - 0.5) * 0.5;
    for (let y = Math.floor(ty); y <= Math.ceil(by) + 3; y++) {
      const f = Math.max(0, (y - ty) / (by - ty || 1));
      for (let x = Math.floor(cx - half - 3); x <= Math.ceil(cx + half + 3); x++) {
        const dx = x + 0.5 - cx;
        const ad = Math.abs(dx);
        // its sides: the boughs' tips in a ragged saw, pointing down and out
        const saw = fr((y - ty) / 3.4 + (dx < 0 ? 0.37 : 0) + seed * 0.13);
        const reach = half * (1 + (dx < 0 ? lop : -lop)) * Math.min(1, f * 1.1) * (0.8 + 0.2 * saw) * (0.9 + 0.1 * hash(Math.floor(y / 3), t, seed));
        if (ad > reach) continue;
        // its foot: the boughs hanging lowest at their tips, lifting between them toward the trunk
        const tip = 0.5 + 0.5 * Math.cos(dx * 0.5 + seed + t);
        const lowest = by + 3 * tip * (ad / (half + 1)) - (1 - ad / (half + 1)) * 2;
        if (y > lowest) continue;
        // (gaps between the boughs, where the trunk or the sky shows)
        if (ad > 3 && hash(x >> 1, y >> 1, seed + t) < 0.05) continue;
        const side = dx / (half + 1);
        const under = lowest - y;
        let tone = 2;
        if (side < -0.25) tone = 3;
        if (side > 0.35) tone = 1;
        if (under < 2 && side > -0.15) tone = Math.max(0, tone - 1);
        if (side < -0.45 && f < 0.7 && hash(x >> 1, y >> 1, seed) > 0.55) tone = 4;
        if (side > 0.6 && under < 3) tone = 0;
        // needle clumps: a little lighter or darker in tufts
        const tuft = hash(Math.floor(x / 3), Math.floor(y / 2), seed + 7);
        if (tuft > 0.86 && tone < 4) tone++;
        else if (tuft < 0.1 && tone > 0) tone--;
        // the swamp's sickness in it: clumps gone dull violet
        const ill = sick > 0 && hash(Math.floor(x / 4), Math.floor(y / 3), seed + 9) < sick * 0.5;
        p.set(x, y, (ill ? SICKV : NEEDLES)[tone]);
      }
    }
  }
  // its leader, a spire at the top
  for (let y = top - 3; y < top + 2; y++) p.set(Math.round(cx) - 1, y, NEEDLES[3]).set(Math.round(cx), y, NEEDLES[2]);
  return compose(null, [p], null).sprite(Math.round(cx), foot, GRAIN);
}

/** A TWISTED PINE, toward the swamp: its trunk bent and kinked, grey and dead in its bark, its needles thin and dark in drooping tufts, the swamp's dull violet through them. Tall: see it through. */
function twistedPine(seed: number): Sprite {
  const S = new Scene(new Px(130, 170), 65, 160);
  const trunk = (t: number): V3 => [Math.sin(t * 4.2 + seed) * 9 - t * 6, Math.cos(t * 3.1 + seed) * 6 + t * 8, t * 132];
  for (let k = 0; k < 12; k++) S.rod(trunk(k / 12), trunk((k + 1) / 12), 4.4 - k * 0.3, 4.2 - (k + 1) * 0.3, SICKBARK, 1);
  // limbs, bent down, and the tufts hanging off them
  for (let i = 0; i < 7; i++) {
    const t = 0.35 + 0.6 * (i / 7);
    const s = trunk(t);
    const a = i * 2.3 + seed;
    const l = 26 - i * 2;
    const m = add(s, [Math.cos(a) * l * 0.55, Math.sin(a) * l * 0.55, 4]);
    const e = add(m, [Math.cos(a) * l * 0.5, Math.sin(a) * l * 0.5, -8]);
    S.rod(s, m, 1.8, 1.2, SICKBARK, 2 + (i % 3));
    S.rod(m, e, 1.2, 0.6, SICKBARK, 2 + (i % 3));
    for (const q of [m, e]) {
      for (let j = 0; j < 4; j++) {
        const c = add(q, [(hash(i, j, seed + 31) - 0.5) * 8, (hash(i, j, seed + 32) - 0.5) * 8, -3 - j * 2]);
        const ill = hash(i, j, seed + 33) < 0.3;
        S.egg(c, beamAxes([0, 0, 0], [Math.cos(i * 2.3 + seed), Math.sin(i * 2.3 + seed), -0.5]), [5.5, 3, 1.8], (n, w) => {
          const tt = hash(Math.floor(w[0] / 2), Math.floor(w[1] / 2) + Math.floor(w[2] / 2) * 5, seed + i);
          return toneAt(n, ill ? SICKV : NEEDLES, tt > 0.75 ? 0.15 : tt < 0.2 ? -0.35 : -0.1);
        }, 6 + (j % 2));
      }
    }
  }
  // its roots, clawing at the ground
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + seed;
    S.rod([0, 0, 3], [Math.cos(a) * 13, Math.sin(a) * 13, 0.5], 2.6, 1.0, SICKBARK, 9);
  }
  return finish(S, 65, 160);
}

/** A PINE SNAG: an old pine long dead, its bark gone grey and sloughing, its top broken off jagged, the stubs of its limbs, holes the woodpeckers made. Tall: see it through. */
function snag(seed: number): Sprite {
  const S = new Scene(new Px(90, 190), 45, 180);
  const H = 158;
  const trunk = (t: number): V3 => [Math.sin(t * 2 + seed) * 2, Math.cos(t * 1.6) * 1.5, t * H];
  for (let k = 0; k < 10; k++) {
    S.rod(trunk(k / 10), trunk((k + 1) / 10), 5.4 - k * 0.32, 5.4 - (k + 1) * 0.32, DRIFT, 1, (w) => {
      // its broken top: jagged, higher on one side
      if (w[2] > H - 10) return w[2] < H - 10 + 10 * fr(Math.atan2(w[1], w[0]) * 0.9 + 0.3);
      return true;
    });
  }
  // the bark left on its foot, grey-brown, sloughing
  S.rod([0, 0, 0], [0.3, 0.2, 26], 6.2, 5.6, PBARK, 2, (w) => w[2] < 10 + 14 * fr(Math.atan2(w[1], w[0]) * 0.7));
  // stubs of its limbs, and holes
  for (let i = 0; i < 7; i++) {
    const t = 0.25 + 0.65 * hash(i, seed, 41);
    const s = trunk(t);
    const a = hash(i, seed, 42) * Math.PI * 2;
    const l = 5 + hash(i, seed, 43) * 12;
    S.rod(s, add(s, [Math.cos(a) * l, Math.sin(a) * l, l * 0.3]), 1.3, 0.6, DRIFT, 3 + (i % 2));
  }
  for (let i = 0; i < 4; i++) {
    const z = 40 + i * 17;
    const a = -0.9 + hash(i, seed, 44) * 0.8;
    S.egg(add(trunk(z / H), [Math.cos(a) * 4.6, Math.sin(a) * 4.6, 0]), XYZ, [1.4, 1.4, 1.6], () => '#16121c', 5);
  }
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.4;
    S.rod([0, 0, 2], [Math.cos(a) * 11, Math.sin(a) * 11, 0.4], 2.6, 1.1, DRIFT, 6);
  }
  return finish(S, 45, 180);
}

// =================================================================================================
// WHAT LIES ON THE WOOD'S FLOOR

/** A FALLEN PINE: a long trunk lying along x, its bark plated, moss and needles along its top, a broken limb or two, its broken end splintered toward the eye, its root end torn up out of the ground. */
function fallenLog(): Sprite {
  const S = new Scene(new Px(190, 96), 95, 62);
  const a: V3 = [-54, -8, 8];
  const b: V3 = [50, 8, 7];
  // the trunk, a thick round log, its bark in plates, moss along its top
  for (let k = 0; k < 8; k++) {
    const p0 = add(a, mul([b[0] - a[0], b[1] - a[1], b[2] - a[2]], k / 8));
    const p1 = add(a, mul([b[0] - a[0], b[1] - a[1], b[2] - a[2]], (k + 1) / 8));
    S.rod(p0, p1, 8.2 - k * 0.25, 8.2 - (k + 1) * 0.25, PBARK, 1);
  }
  for (let i = 0; i < 9; i++) {
    const t = 0.08 + 0.84 * hash(i, 1, 53);
    const c = add(add(a, mul([b[0] - a[0], b[1] - a[1], b[2] - a[2]], t)), [0, 0, 6.6]);
    S.egg(c, beamAxes(a, b), [4 + 3 * hash(i, 2, 53), 3.2, 2], (n, w) => toneAt(n, MOSS, hash(Math.floor(w[0] / 2), Math.floor(w[1] / 2), 54) > 0.7 ? 0.2 : 0), 2);
  }
  // its broken end toward the eye: pale splintered wood
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    S.rod(add(b, [0, Math.cos(ang) * 4, Math.sin(ang) * 4 + 1]), add(b, [5 + 3 * hash(i, 3, 53), Math.cos(ang) * 3, Math.sin(ang) * 3 + 1]), 1.6, 0.5, ['#5a4632', '#7c6248', '#a08262', '#bea07c', '#d2b894'], 3);
  }
  // its root end torn up: a plate of roots and earth on its edge
  S.egg(add(a, [-4, -2, 6]), beamAxes(a, b), [3, 12, 12], (n, w) => (hash(Math.floor(w[1] / 2), Math.floor(w[2] / 2), 56) > 0.6 ? toneAt(n, PBARK, -0.2) : toneAt(n, ['#2a2018', '#3a2c20', '#4e3c2c', '#62503c', '#766450'], 0)), 4);
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2 + 0.3;
    S.rod(add(a, [-6, Math.cos(ang) * 9, 6 + Math.sin(ang) * 9]), add(a, [-12, Math.cos(ang) * 16, 6 + Math.sin(ang) * 14]), 1.2, 0.4, PBARK, 5);
  }
  // a broken limb up off it; a stub
  S.rod([-10, -2, 14], [-18, -15, 32], 2.2, 1.2, PBARK, 6);
  S.rod([20, 4, 13], [28, 16, 19], 1.6, 0.9, DRIFT, 7);
  fernClump(S, [-30, 16, 0], 0.8, 5, 61);
  return finish(S, 95, 62);
}

/** A STUMP the hunter cut: its top level and pale, its rings, the axe's last cut a step across it; its roots into the ground, moss on its side. */
function stump(): Sprite {
  const S = new Scene(new Px(70, 56), 35, 40);
  // its body: rings of bark stacked up to its cut
  for (let z = 0; z < 10; z += 1.5) S.egg([0, 0, z + 0.75], XYZ, [9.2 - z * 0.05, 9.2 - z * 0.05, 0.9], (n, w) => {
    const plate = hash(Math.floor(Math.atan2(w[1], w[0]) * 4), Math.floor(w[2] / 3), 55) < 0.3;
    return toneAt(n, PBARK, plate ? -0.4 : 0);
  }, 1);
  // its cut top: pale wood, its rings, the step of the axe's last cut
  S.egg([0, 0, 10.6], XYZ, [8.9, 8.9, 0.5], (n, w) => {
    const r = Math.hypot(w[0], w[1]);
    if (n[2] < 0.5) return toneAt(n, PBARK, 0);
    if (r > 8) return '#7c5e46';
    if (Math.abs(w[0] - w[1] - 3) < 0.8) return '#6a5038';
    return fr(r / 1.7) < 0.24 ? '#a0805e' : r < 1.2 ? '#86684a' : '#c4a884';
  }, 2);
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + 0.5;
    S.rod([Math.cos(a) * 7, Math.sin(a) * 7, 2.5], [Math.cos(a) * 15, Math.sin(a) * 15, 0.5], 2.6, 1.2, PBARK, 3);
  }
  S.egg([6, 6.5, 4], XYZ, [3.4, 2.6, 3.2], (n) => toneAt(n, MOSS, 0), 4);
  return finish(S, 35, 40);
}

/** A MOSSY BOULDER of the wood's grey granite, rounded, moss thick over its top and down its shaded side, lichen pale on it. `size` 0 or 1. */
function mossyBoulder(size: number, seed: number): Sprite {
  const S = new Scene(new Px(88, 66), 44, 48);
  const r = 11 + size * 6;
  const facet = facetOf(GRANITE, 0.02);
  S.egg([0, 0, r * 0.6], beamAxes([0, 0, 0], [1, 0.3 + seed * 0.1, 0]), [r * 1.2, r * 0.95, r * 0.75], (n, w) => {
    const h = hash(Math.floor(w[0] / 3), Math.floor(w[1] / 3) + Math.floor(w[2] / 3) * 7, seed);
    if (n[2] > 0.35 + 0.25 * h) return toneAt(n, MOSS, h > 0.7 ? 0.15 : 0);
    if (h > 0.93) return '#b4b4a2'; // lichen
    return facet(n);
  }, 1);
  S.egg([r * 0.75, r * 0.6, r * 0.32], XYZ, [r * 0.55, r * 0.5, r * 0.4], facet, 2);
  return finish(S, 44, 48);
}

/** Fronds of a fern, arching out from its heart, each a line of leaflets lit at their upper left. */
function fernClump(S: Scene, c: V3, size: number, n: number, seed: number): void {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + hash(i, seed, 71) * 0.6;
    const L = (12 + 6 * hash(i, seed, 72)) * size;
    let prev: V3 = add(c, [0, 0, 1]);
    for (let k = 1; k <= 6; k++) {
      const t = k / 6;
      const p: V3 = add(c, [Math.cos(a) * L * t, Math.sin(a) * L * t, 1 + L * 0.9 * t * (1 - t) * 1.6]);
      S.rod(prev, p, 0.9 - t * 0.5, 0.9 - t * 0.5, FERN, 70 + i);
      // its leaflets either side
      if (k < 6) for (const sd of [1, -1]) S.rod(p, add(p, [-Math.sin(a) * sd * 3 * (1 - t), Math.cos(a) * sd * 3 * (1 - t), -1]), 0.6, 0.4, FERN, 70 + i);
      prev = p;
    }
  }
}
/** FERNS in a clump, knee-high, on the wood's floor. `size` 0 or 1. */
function ferns(size: number, seed: number): Sprite {
  const S = new Scene(new Px(80, 56), 40, 40);
  fernClump(S, [0, 0, 0], 0.8 + size * 0.35, 7 + size * 2, seed);
  return finish(S, 40, 40);
}

/** A BILBERRY BUSH: a low mound of small dull-green leaves, its berries blue-black among them. */
function bilberries(seed: number): Sprite {
  const S = new Scene(new Px(64, 44), 32, 34);
  for (let i = 0; i < 22; i++) {
    const a = hash(i, seed, 81) * Math.PI * 2;
    const d = 11 * Math.sqrt(hash(i, seed, 82)) * 0.8;
    const r = 3 + hash(i, seed, 83) * 2.2;
    S.egg([Math.cos(a) * d, Math.sin(a) * d, r * 0.8 + (1 - d / 11) * 5], XYZ, [r, r, r * 0.8], (n, w) => {
      const t = hash(Math.floor(w[0] / 2), Math.floor(w[1] / 2) + Math.floor(w[2] / 2) * 5, seed + i);
      return toneAt(n, LEAF, t > 0.75 ? 0.3 : t < 0.2 ? -0.3 : 0);
    }, 1 + (i % 3));
  }
  for (let i = 0; i < 12; i++) {
    const a = hash(i, seed, 84) * Math.PI * 2;
    const d = 9 * Math.sqrt(hash(i, seed, 85));
    S.ball([Math.cos(a) * d, Math.sin(a) * d, 5 + (1 - d / 9) * 5], 1.2, BERRY, 5, undefined, 0.2);
  }
  return finish(S, 32, 34);
}

/** TOADSTOOLS in a ring on the wood's floor: pale caps on pale stems, a few toppled, a gill's shade under each cap. */
function toadstools(): Sprite {
  const S = new Scene(new Px(80, 50), 40, 34);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const R = 14;
    const c: V3 = [Math.cos(a) * R, Math.sin(a) * R * 0.9, 0];
    const h = 3 + hash(i, 0, 91) * 4;
    const cr = 2 + hash(i, 1, 91) * 1.8;
    S.rod(c, add(c, [0, 0, h]), 0.8, 0.7, BONE, 1 + i);
    S.egg(add(c, [0, 0, h]), XYZ, [cr, cr, cr * 0.65], (n) => (n[2] < -0.1 ? CAP[1] : toneAt(n, CAP, 0.1)), 20 + i);
  }
  return finish(S, 40, 34);
}

/** SHED ANTLERS AND A STAG'S SKULL in the grass: the long face, the dark eyes, two great branching antlers sweeping back. (The wood is the Hollow Stag's.) */
function stagSkull(): Sprite {
  const S = new Scene(new Px(96, 64), 48, 40);
  const F: V3 = [0.6, 0.7, -0.2];
  const c: V3 = [0, 0, 4];
  S.egg(add(c, [3, 3.5, -0.5]), beamAxes([0, 0, 0], F), [8, 4.2, 3.4], (n, w) => {
    const f = (w[0] - c[0]) * 0.6 + (w[1] - c[1]) * 0.7;
    if (f > -2 && f < 1 && n[2] > 0.3 && Math.abs((w[0] - c[0]) * 0.7 - (w[1] - c[1]) * 0.6) > 1.8 && Math.abs((w[0] - c[0]) * 0.7 - (w[1] - c[1]) * 0.6) < 3.6) return '#2a2420';
    return toneAt(n, BONE, 0.08);
  }, 1);
  S.ball(c, 4, BONE, 1, undefined, 0.05);
  // its antlers: a beam each, up and back, tines off its front
  for (const sg of [1, -1]) {
    const side: V3 = [0.7 * sg, -0.6 * sg, 0];
    let prev: V3 = add(c, mul(side, 3));
    for (let k = 1; k <= 7; k++) {
      const t = k / 7;
      const p: V3 = add(add(c, mul(side, 3 + t * 18)), [-t * 8, -t * 8, t * 16 - t * t * 6]);
      S.rod(prev, p, 1.6 - t * 0.7, 1.6 - (t + 1 / 7) * 0.7, BONE, 2);
      if (k === 2 || k === 4 || k === 6) S.rod(p, add(p, [4 - t * 2, 4 - t * 2, 7 - t * 2]), 1.0, 0.45, BONE, 3);
      prev = p;
    }
  }
  return finish(S, 48, 40);
}

/** CATTAILS at the river's bank: tall olive reeds, a few bent, their dark velvet heads. */
function cattails(seed: number): Sprite {
  const S = new Scene(new Px(56, 84), 28, 74);
  for (let i = 0; i < 14; i++) {
    const x = (hash(i, seed, 101) - 0.5) * 18;
    const y = (hash(i, seed, 102) - 0.5) * 12;
    const h = 26 + hash(i, seed, 103) * 30;
    const bend = (hash(i, seed, 104) - 0.5) * 10;
    const top: V3 = [x + bend, y - bend * 0.5, h];
    S.rod([x, y, 0], top, 0.75, 0.45, REED, 1 + (i % 2));
    if (i % 3 === 0) S.egg(add(top, [0, 0, -6]), beamAxes([x, y, 0], top), [3.4, 1.4, 1.4], (n) => toneAt(n, CATTAIL, 0.05), 3);
    // a leaf off it, arching
    if (i % 2 === 0) S.rod([x, y, h * 0.3], [x - 7, y + 3, h * 0.55], 0.6, 0.3, REED, 4);
  }
  return finish(S, 28, 74);
}

/** RIVER STONES: rounded and wet, standing out of the water in a line, their tops catching the light, moss at their waterline. */
function riverStones(seed: number): Sprite {
  const S = new Scene(new Px(96, 50), 48, 34);
  for (let i = 0; i < 4; i++) {
    const c: V3 = [-18 + i * 12 + (hash(i, seed, 111) - 0.5) * 4, -6 + i * 4, 2];
    const r = 4.5 + hash(i, seed, 112) * 3;
    S.egg(c, beamAxes([0, 0, 0], [1, hash(i, seed, 113) - 0.5, 0]), [r * 1.2, r, r * 0.6], (n, w) => {
      if (w[2] < 1.2) return toneAt(n, MOSS, -0.2);
      if (n[2] > 0.85) return WETSTONE[4];
      return toneAt(n, WETSTONE, 0);
    }, 1 + i);
  }
  return finish(S, 48, 34);
}

// =================================================================================================
// THE HUNTER'S: his cabin by the river, his woodpile, his rack, his snare, his journal; the footbridges

/** Shingles, weathered grey. */
const SHINGLE: Ramp = ['#3a383c', '#504c50', '#686260', '#827a72', '#9a9086'];
/** Earth, at a root plate, a cabin's foot. */
const EARTH: Ramp = ['#2a2018', '#3a2c20', '#4e3c2c', '#62503c', '#766450'];

/**
 * A FOOTBRIDGE over the river (a floor tile, walked on; the water runs on under it, painted by the ground): planks
 * across the way, each a little crooked, nailed to two logs along it, its ends on the banks. `alongY`: its way along y.
 */
function footbridge(alongY: boolean): Sprite {
  const p = new Px(64, 34);
  for (let py = 0; py < 34; py++) {
    for (let px = 0; px < 64; px++) {
      const uv = tileUV(px, py);
      if (!uv) continue;
      const along = alongY ? uv[1] : uv[0];
      const across = alongY ? uv[0] : uv[1];
      // the two logs along it, under the planks' ends, round: lit along their tops
      for (const c of [10, 54]) {
        const d = across - c;
        if (Math.abs(d) < 4 && along > 1 && along < 63) p.set(px, py, d < -2 ? PBARK[3] : d > 2 ? PBARK[0] : PBARK[2]);
      }
      // the planks across it, a gap between each, each a little crooked and its own tone
      const k = Math.floor((along - 2) / 6);
      const inPlank = fr((along - 2) / 6) < 0.8 && along > 2 && along < 62;
      const skew = (hash(k, 1, 121) - 0.5) * 4;
      if (inPlank && across > 6 + skew && across < 58 + skew * 0.5) {
        const t = hash(k, 2, 121);
        const edge = fr((along - 2) / 6) < 0.16 ? 3 : fr((along - 2) / 6) > 0.66 ? 1 : 2;
        let c = TIMBER[Math.max(0, Math.min(4, edge + (t > 0.7 ? 1 : t < 0.2 ? -1 : 0)))];
        if (Math.abs(across - 10) < 1 && fr((along - 2) / 6) > 0.3 && fr((along - 2) / 6) < 0.5) c = IRON[1]; // a nail
        if (Math.abs(across - 54) < 1 && fr((along - 2) / 6) > 0.3 && fr((along - 2) / 6) < 0.5) c = IRON[1];
        if (hash(px >> 1, py, 122 + k) < 0.04) c = MOSS[2];
        p.set(px, py, c);
      }
    }
  }
  return p.sprite(32, 0, GRAIN);
}

/**
 * THE HUNTER'S OLD CABIN by the river: walls of round logs notched at the corners, a roof of grey shingles grown
 * with moss, a chimney of the wood's grey stones up its end, its door of planks ajar, a shuttered window, a bench
 * and a pair of antlers nailed over the door. Long empty: the cult came through.
 */
function cabin(): Sprite {
  const S = new Scene(new Px(190, 170), 95, 120);
  const L = 34;
  const D = 26;
  const H = 34;
  // its walls: logs one on another, round, their ends past the corners
  for (let z = 3; z < H; z += 6) {
    for (const [a, b] of [[[-L, -D, z], [L, -D, z]], [[-L, D, z], [L, D, z]], [[-L, -D, z + 3], [-L, D, z + 3]], [[L, -D, z + 3], [L, D, z + 3]]] as [V3, V3][]) {
      const A = beamAxes(a, b);
      S.rod(add(a, mul(A[0], -4)), add(b, mul(A[0], 4)), 3.2, 3.2, z % 12 === 3 ? PBARK : TIMBER, 1);
    }
  }
  // its door, in the wall toward the eye (+x), ajar, dark within; antlers over it
  S.quad([[L + 3.4, -8, 0], [L + 3.4, 6, 0], [L + 3.4, 6, 26], [L + 3.4, -8, 26]], (u) => (u < 0.18 ? '#17121c' : fr(u * 4) < 0.1 ? TIMBER[0] : TIMBER[u < 0.5 ? 3 : 2]), 2);
  for (const sg of [1, -1]) {
    let prev: V3 = [L + 4, -1, 30];
    for (let k = 1; k <= 4; k++) {
      const pnt: V3 = [L + 4 + k * 0.4, -1 + sg * k * 3, 30 + k * 2.6];
      S.rod(prev, pnt, 0.9, 0.7, BONE, 3);
      if (k === 2) S.rod(pnt, add(pnt, [0.5, 0, 4]), 0.6, 0.4, BONE, 3);
      prev = pnt;
    }
  }
  // a shuttered window in its long wall that looks down the screen to the left (+y)
  S.quad([[-6, D + 3.4, 12], [10, D + 3.4, 12], [10, D + 3.4, 24], [-6, D + 3.4, 24]], (u, v) => (fr(u * 3) < 0.12 || v < 0.1 || v > 0.9 ? TIMBER[0] : TIMBER[2]), 4);
  // its roof: two pitches of shingles from a ridge along x, overhanging, moss on it
  const ridge = H + 22;
  for (const sy of [1, -1]) {
    const a: V3 = [-L - 7, 0, ridge];
    const b: V3 = [L + 7, 0, ridge];
    const c: V3 = [L + 7, sy * (D + 9), H - 2];
    const d: V3 = [-L - 7, sy * (D + 9), H - 2];
    S.quad([a, b, c, d], (u, v, w) => {
      const row = Math.floor(v * 9);
      const col = Math.floor(u * 22 + (row % 2) * 0.5);
      if (hash(Math.floor(w[0] / 5), Math.floor(w[1] / 4), 131) > 0.72) return MOSS[sy > 0 ? 3 : 1];
      if (fr(v * 9) < 0.18) return SHINGLE[0];
      return SHINGLE[(sy > 0 ? 3 : 1) + (hash(col, row, 132) > 0.7 ? -1 : 0)];
    }, 5 + (sy > 0 ? 0 : 1));
  }
  // the chimney of grey stones up its far end
  for (let z = 0; z < ridge + 10; z += 4) {
    S.egg([-L - 6, -4, z + 2], XYZ, [5.5, 6, 2.4], (n, w) => (hash(Math.floor(w[1] / 4) + Math.floor(z / 4), Math.floor(w[0] / 4), 133) > 0.8 ? toneAt(n, GRANITE, -0.4) : facetOf(GRANITE, 0)(n)), 7);
  }
  // a bench by the door
  S.box([L + 12, 14, 6], XYZ, [3, 9, 0.9], (_f, _u, _v, n) => toneAt(n, TIMBER, 0), 8);
  S.rod([L + 12, 7, 0], [L + 12, 7, 5], 0.8, 0.8, TIMBER, 8);
  S.rod([L + 12, 21, 0], [L + 12, 21, 5], 0.8, 0.8, TIMBER, 8);
  return finish(S, 95, 120);
}

/** THE HUNTER'S WOODPILE and his chopping block, the axe left in it; `split`: knocked down, the logs rolled about, the block on its side. A breakable. */
function woodpile(split: boolean): Sprite {
  const S = new Scene(new Px(110, 80), 55, 54);
  const logEnd = (n: V3, w: V3, c: V3, A: [V3, V3, V3]): string => {
    const q: V3 = [w[0] - c[0], w[1] - c[1], w[2] - c[2]];
    const along = q[0] * A[0][0] + q[1] * A[0][1] + q[2] * A[0][2];
    if (Math.abs(along) > 7) return fr(Math.hypot(q[0] * A[1][0] + q[1] * A[1][1], q[2]) / 1.4) < 0.25 ? '#8a6c4c' : '#bea07c';
    return toneAt(n, PBARK, 0);
  };
  if (!split) {
    // the stack: three rows of split logs along y
    for (let r = 0; r < 3; r++) {
      for (let i = 0; i < 4 - r; i++) {
        const c: V3 = [-10 + (hash(i, r, 141) - 0.5) * 2, -12 + i * 7 + r * 3.5, 3 + r * 5.6];
        const A = beamAxes([0, 0, 0], [1, 0.08, 0]);
        S.egg(c, A, [8.6, 3.2, 3], (n, w) => logEnd(n, w, c, A), 1 + r);
      }
    }
    // the chopping block, the axe in it
    S.rod([14, 10, 0], [14, 10, 9], 6, 5.6, PBARK, 5);
    S.egg([14, 10, 9.2], XYZ, [5.6, 5.6, 0.6], (n) => (n[2] > 0.5 ? '#bea07c' : toneAt(n, PBARK, 0)), 6);
    S.rod([14, 10, 10], [18, 15, 22], 0.8, 0.8, TIMBER, 7);
    S.box([13.6, 9.6, 10.5], beamAxes([0, 0, 0], [0.6, 0.6, 0.3]), [2.6, 0.6, 1.6], (_f, _u, _v, n) => toneAt(n, IRON, 0.1), 8);
  } else {
    // knocked down: the logs rolled about, the block on its side
    for (let i = 0; i < 8; i++) {
      const a = hash(i, 1, 142) * Math.PI * 2;
      const d = 6 + hash(i, 2, 142) * 20;
      const c: V3 = [Math.cos(a) * d, Math.sin(a) * d, 3];
      const A = beamAxes([0, 0, 0], [Math.cos(a * 1.7), Math.sin(a * 1.7), 0]);
      S.egg(c, A, [8.6, 3.2, 3], (n, w) => logEnd(n, w, c, A), 1 + (i % 4));
    }
    S.rod([16, 6, 6], [24, 12, 6], 6, 5.6, PBARK, 5);
  }
  return finish(S, 55, 54);
}

/** THE HUNTER'S DRYING RACK: a frame of poles lashed together, hides stretched on it, a string of them drying, a deer's skull on its post. */
function dryingRack(): Sprite {
  const S = new Scene(new Px(110, 110), 55, 92);
  const posts: V3[] = [[-4, -20, 0], [-4, 20, 0]];
  for (const q of posts) S.rod(q, add(q, [0, 0, 46]), 1.4, 1.2, DRIFT, 1);
  S.rod([-4, -24, 44], [-4, 24, 44], 1.2, 1.2, DRIFT, 2);
  S.rod([-4, -22, 8], [-4, 22, 8], 1.0, 1.0, DRIFT, 2);
  // two hides stretched in it, lashed at their corners
  for (const [y0, y1] of [[-18, -2], [2, 18]] as const) {
    S.quad([[-3, y0, 40], [-3, y1, 40], [-3, y1 - 1, 12], [-3, y0 + 1, 12]], (u, v, w) => {
      const r = Math.hypot(u - 0.5, (v - 0.5) * 1.3);
      if (r > 0.52 + 0.06 * Math.sin(u * 12 + v * 9)) return null; // the hide's ragged edge
      return hash(Math.floor(w[1] / 3), Math.floor(w[2] / 3), 151) > 0.85 ? HIDE[2] : HIDE[r < 0.3 ? 4 : 3];
    }, 3);
    for (const [y, z] of [[y0, 40], [y1, 40], [y0 + 1, 12], [y1 - 1, 12]] as const) rope(S, [-4, y + (y < 0 ? -2 : 2), z + 2], [-3, y, z], 0, 4, 0.4);
  }
  S.ball([-4, -20, 50], 3, BONE, 5);
  return finish(S, 55, 92);
}

/**
 * THE HUNTER'S SNARE (the trap): a spring trap of iron jaws hidden under the needles. 0, hidden: needles and leaves
 * over it, a glint of iron; 1, seen: its jaws open, its pan, its chain to a stake; 2, it springs: the jaws snapping
 * up, needles thrown; 3, shut.
 */
function snareTile(f: number): Sprite {
  const p = new Px(64, 34);
  for (let py = 0; py < 34; py++) {
    for (let px = 0; px < 64; px++) {
      const uv = tileUV(px, py);
      if (!uv) continue;
      const du = (uv[0] - 32) / 32;
      const dv = (uv[1] - 32) / 32;
      const d = Math.hypot(du, dv);
      const n = hash(px >> 1, py, 161 + f);
      if (f === 0) {
        // needles and leaves over it, a glint of iron through them
        if (d < 0.55 && n > 0.45) p.set(px, py, n > 0.85 ? '#8c704d' : n > 0.65 ? '#70583e' : '#56432f');
        if (d < 0.42 && d > 0.36 && hash(px, py, 162) > 0.85) p.set(px, py, IRON[3]);
        continue;
      }
      // its chain to a stake
      if (Math.abs(dv - 0.55) < 0.04 && du > -0.1 && du < 0.5 && fr(du * 18) < 0.6) p.set(px, py, IRON[2]);
      if (Math.hypot(du - 0.55, dv - 0.55) < 0.07) p.set(px, py, TIMBER[3]);
      // its ring of jaws: open (a wide ring lying flat, teeth inward), snapping (risen, closing), shut (a bar)
      const open = f === 1 ? 1 : f === 2 ? 0.45 : 0;
      if (open > 0) {
        const R = 0.38 * (0.5 + 0.5 * open);
        const ring = Math.abs(d - R);
        if (ring < 0.05) p.set(px, py, du + dv < 0 ? IRON[4] : IRON[1]);
        else if (d < R && d > R - 0.12 && fr(Math.atan2(dv, du) * 3) < 0.4) p.set(px, py, IRON[3]); // teeth
        if (d < 0.12) p.set(px, py, d < 0.08 ? IRON[2] : IRON[0]); // the pan
      } else {
        if (Math.abs(dv - du * 0.2) < 0.07 && Math.abs(du) < 0.42) p.set(px, py, Math.abs(dv - du * 0.2) < 0.03 ? IRON[4] : IRON[1]);
      }
      if (f === 2 && d > 0.45 && d < 0.9 && n > 0.86) p.set(px, py, '#8c704d'); // needles thrown
    }
  }
  return p.sprite(32, 0, GRAIN);
}

/** THE HUNTER'S JOURNAL (the quest piece): his book of notes lying open in the grass, its pages ruled with his hand, a quill's feather in it, a sketch of a stag on the open leaf. */
function journal(): Sprite {
  const S = new Scene(new Px(48, 32), 24, 22);
  for (const side of [-1, 1]) {
    S.quad([[-8, side * 0.4, 1.2 + (side > 0 ? 0 : 0.3)], [8, side * 0.4, 1.2], [8, side * 10, 0.6], [-8, side * 10, 0.6]], (u, v) => {
      if (side > 0 && u > 0.2 && u < 0.8 && v > 0.25 && v < 0.8) {
        // the stag he drew, its antlers
        const x = (u - 0.5) * 2;
        const y = (v - 0.5) * 2;
        if (Math.abs(y - 0.2) < 0.12 && Math.abs(x) < 0.5) return '#3a3028';
        if (Math.abs(x + 0.2 * Math.sin(y * 6)) < 0.06 && y < 0.1 && y > -0.6) return '#3a3028';
      }
      if (side < 0 && fr(v * 8) < 0.2 && u > 0.12 && u < 0.88) return '#5a4e40';
      return v > 0.92 ? '#8a7a60' : '#d6ccb2';
    }, 1 + (side > 0 ? 0 : 1));
  }
  // its leather cover, showing past the pages
  S.box([0, 0, 0.3], XYZ, [9, 11, 0.3], (_f, _u, _v, n) => toneAt(n, HIDE, 0), 3);
  S.rod([2, -6, 1.6], [12, -14, 4], 0.5, 0.2, BONE, 4);
  return finish(S, 24, 22);
}

// =================================================================================================
// THE CULT'S CAMP IN THE WOOD: the siege is fed from here, its pines felled for ladders and a ram

/** THE CULT'S SIEGE TENT: a great bell tent of its violet cloth on a centre pole, guyed out all round, the mark painted on its side in bone-pale, its door flap tied back, dark within. */
function siegeTent(): Sprite {
  const S = new Scene(new Px(150, 130), 75, 92);
  const R = 30;
  const H = 52;
  const N = 16;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2;
    const a1 = ((i + 1) / N) * Math.PI * 2;
    const q: [V3, V3, V3, V3] = [[Math.cos(a0) * R, Math.sin(a0) * R, 0], [Math.cos(a1) * R, Math.sin(a1) * R, 0], [Math.cos(a1) * 4, Math.sin(a1) * 4, H - 4], [Math.cos(a0) * 4, Math.sin(a0) * 4, H - 4]];
    const door = i === 1;
    S.quad(q, (u, v) => {
      if (door && u > 0.2 && u < 0.8 && v < 0.6 - Math.abs(u - 0.5) * 0.6) return '#17121f';
      // the mark, bone-pale, on the panels toward the eye
      if ((i === 0 || i === 15) && Math.abs(v - 0.4) < 0.05 && u > 0.3) return PAINT;
      if (i === 0 && Math.abs(u - 0.6) < 0.06 && v > 0.2 && v < 0.6) return PAINT;
      if (v > 0.94) return CLOTH[1];
      return CLOTH[i % 2 === 0 ? 3 : 2];
    }, 1 + (i % 2));
  }
  S.rod([0, 0, H - 6], [0, 0, H + 10], 1.2, 1.0, TIMBER, 3);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    rope(S, [Math.cos(a) * R * 0.85, Math.sin(a) * R * 0.85, 10], [Math.cos(a) * (R + 14), Math.sin(a) * (R + 14), 0], 0, 4, 0.4);
  }
  return finish(S, 75, 92);
}

/** SIEGE LADDERS the cult is making from the wood's pines: three long rough ladders stacked on trestles, rungs lashed with rope, one half finished, shavings under them. For the town's walls. */
function siegeLadders(): Sprite {
  const S = new Scene(new Px(200, 100), 100, 66);
  for (const x of [-34, 30]) {
    S.rod([x, -12, 0], [x, -12, 14], 1.0, 1.0, TIMBER, 1);
    S.rod([x, 12, 0], [x, 12, 14], 1.0, 1.0, TIMBER, 1);
    S.rod([x, -14, 14], [x, 14, 14], 1.2, 1.2, TIMBER, 1);
  }
  for (let l = 0; l < 3; l++) {
    const z = 16 + l * 3.4;
    const y0 = -9 + l * 2;
    S.rod([-62, y0, z], [60, y0, z], 1.6, 1.4, PBARK, 2 + l);
    S.rod([-62, y0 + 10, z], [60, y0 + 10, z], 1.6, 1.4, PBARK, 2 + l);
    for (let k = 0; k < (l === 2 ? 5 : 11); k++) {
      const x = -56 + k * 11;
      S.rod([x, y0, z + 0.6], [x, y0 + 10, z + 0.6], 0.9, 0.9, DRIFT, 5 + l);
      S.ball([x, y0, z + 1.2], 1.0, ROPE, 8, undefined, 0.1);
    }
  }
  for (let i = 0; i < 14; i++) S.egg([-40 + hash(i, 1, 171) * 80, -16 + hash(i, 2, 171) * 32, 0.6], XYZ, [1.6, 0.8, 0.5], () => '#c4a882', 9);
  return finish(S, 100, 66);
}

/** A BATTERING RAM, half built: a great pine trunk slung by ropes from a frame of timbers on four solid wheels, its head bound in iron, the cult's violet hung from its roof-beam. For the town's gate. */
function batteringRam(): Sprite {
  const S = new Scene(new Px(200, 130), 100, 92);
  // the frame: four posts, two beams along x, a roof-beam
  for (const x of [-34, 30]) for (const y of [-14, 14]) S.rod([x, y, 8], [x, y, 44], 1.6, 1.4, TIMBER, 1);
  for (const y of [-14, 14]) S.rod([-38, y, 44], [34, y, 44], 1.8, 1.8, TIMBER, 2);
  S.rod([-38, 0, 50], [34, 0, 50], 1.8, 1.8, TIMBER, 2);
  for (const x of [-34, 30]) S.rod([x, -14, 44], [x, 0, 50], 1.2, 1.2, TIMBER, 2);
  for (const x of [-34, 30]) S.rod([x, 14, 44], [x, 0, 50], 1.2, 1.2, TIMBER, 2);
  for (const x of [-34, 30]) for (const y of [-14, 14]) S.rod([x, y, 8], [x + (x < 0 ? 4 : -4), y, 8], 1.4, 1.4, TIMBER, 2);
  // its wheels: solid discs of planks
  for (const x of [-30, 26]) for (const y of [-17, 17]) {
    S.egg([x, y, 8], beamAxes([0, 0, 0], [0, 1, 0]), [1.6, 8, 8], (n, w) => (fr((w[0] - x) / 4) < 0.15 ? TIMBER[0] : toneAt(n, TIMBER, 0)), 3);
  }
  // the ram: a pine trunk slung from the roof-beam, its head iron-bound
  S.rod([-58, 0, 28], [52, 0, 28], 4.6, 4.2, PBARK, 4);
  S.egg([56, 0, 28], beamAxes([0, 0, 0], [1, 0, 0]), [6, 5.4, 5.4], (n) => toneAt(n, IRON, 0.1), 5);
  for (const x of [-20, 16]) rope(S, [x, 0, 50], [x, 0, 33], 0, 6, 0.6);
  // the cult's violet hung from the roof-beam
  S.quad([[-6, 0.5, 49], [10, 0.5, 49], [10, 0.5, 36], [-6, 0.5, 36]], (u, v) => (Math.abs(u - 0.5) < 0.06 && v > 0.3 && v < 0.8 ? PAINT : CLOTH[2]), 7);
  return finish(S, 100, 92);
}

/** BARRELS OF PITCH for the siege's fire-pots: three tarred barrels, one tipped with its pitch spilt black; `broken`: staves sprung, the pitch spread. A breakable. */
function pitchBarrels(broken: boolean): Sprite {
  const S = new Scene(new Px(90, 70), 45, 48);
  const TAR: Ramp = ['#141216', '#1e1b20', '#2a262c', '#3a3540', '#4e4856'];
  // a barrel: a cylinder of staves bellied a little, two iron hoops, its head black with pitch
  const barrel = (c: V3, up: V3, id: number): void => {
    const u = up;
    const base = add(c, mul(u, -7.5));
    for (let k = 0; k < 5; k++) {
      const t0 = k / 5;
      const t1 = (k + 1) / 5;
      const r0 = 5.6 + 0.9 * Math.sin(Math.PI * t0);
      const r1 = 5.6 + 0.9 * Math.sin(Math.PI * t1);
      S.rod(add(base, mul(u, 15 * t0)), add(base, mul(u, 15 * t1)), r0, r1, k === 1 || k === 3 ? IRON : TIMBER, id);
    }
    S.egg(add(base, mul(u, 15.2)), beamAxes([0, 0, 0], u), [0.5, 5.4, 5.4], (n) => toneAt(n, TAR, 0.3), id);
  };
  if (!broken) {
    barrel([-8, -6, 8], [0, 0, 1], 1);
    barrel([8, -12, 8], [0, 0, 1], 2);
    barrel([6, 10, 6.4], [0.37, 0.93, 0], 3);
    S.egg([12, 22, 0.4], XYZ, [9, 6, 0.4], () => '#1a171c', 4);
  } else {
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      S.rod([Math.cos(a) * 6, Math.sin(a) * 6, 0.8], [Math.cos(a) * 16, Math.sin(a) * 16, 2], 1.2, 1.2, TIMBER, 1);
    }
    S.egg([0, 0, 0.5], XYZ, [16, 13, 0.5], () => '#1a171c', 2);
    barrel([12, -12, 8], [0, 0, 1], 3);
  }
  return finish(S, 45, 48);
}

/** FELLED PINES, stacked: trunks cut and limbed by the cult, piled three high against stakes, their cut ends pale toward the eye, an axe and a saw left on them. */
function felledPines(): Sprite {
  const S = new Scene(new Px(190, 90), 95, 60);
  const rows = [[0, -12, 5.4], [0, 0, 5.4], [0, 12, 5.4], [0, -6, 15], [0, 6, 15], [0, 0, 24.4]];
  rows.forEach(([x, y, z], i) => {
    S.rod([x - 56, y, z], [x + 52, y, z], 5.4, 5.2, PBARK, 1 + (i % 3));
    S.egg([x + 52.5, y, z], beamAxes([0, 0, 0], [1, 0, 0]), [0.6, 5.2, 5.2], (n, w) => (n[0] > 0.5 ? (fr(Math.hypot(w[1] - y, w[2] - z) / 1.4) < 0.25 ? '#9a7c5c' : '#c4a884') : toneAt(n, PBARK, 0)), 4 + (i % 2));
  });
  for (const x of [-40, 30]) for (const y of [-19, 19]) S.rod([x, y, 0], [x, y, 22], 1.2, 1.0, DRIFT, 7);
  S.rod([-20, 8, 30], [-6, 2, 32], 0.6, 0.6, TIMBER, 8);
  S.box([-21, 8.6, 30], beamAxes([0, 0, 0], [0.9, -0.4, 0]), [2.4, 0.5, 1.6], (_f, _u, _v, n) => toneAt(n, IRON, 0.1), 9);
  return finish(S, 95, 60);
}

/**
 * THE STAG'S SHRINE (the Hollow Stag's): where the cult bound the wood's old stag to the swamp. A post of dead pine
 * driven into the ground, a great stag's antlers lashed to its top with the cult's violet cloth, the cult's mark
 * daubed on it, a ring of the wood's stones round it, bones and a stag's skull at its foot, the swamp's dull violet
 * sickness spread in the grass round it.
 */
function stagShrine(): Sprite {
  const S = new Scene(new Px(130, 140), 65, 106);
  S.rod([0, 0, 0], [0.5, -0.4, 58], 4, 3.2, SICKBARK, 1);
  // the antlers at its top, branching wide
  for (const sg of [1, -1]) {
    let prev: V3 = [0.5, -0.4, 58];
    for (let k = 1; k <= 7; k++) {
      const t = k / 7;
      // (spread across the eye's view, to its left and its right, sweeping up and back)
      const pnt: V3 = [0.5 + sg * t * 19 - t * 5, -0.4 - sg * t * 19 - t * 5, 58 + t * 26 - t * t * 8];
      S.rod(prev, pnt, 2.2 - t * 1.1, 2.2 - (t + 1 / 7) * 1.1, BONE, 2);
      if (k % 2 === 0) S.rod(pnt, add(pnt, [2 + sg * 1.5, 2 - sg * 1.5, 9 - t * 3]), 1.1, 0.45, BONE, 2);
      prev = pnt;
    }
  }
  S.ball([1.5, -0.4, 58], 3.2, BONE, 3);
  // the cult's violet lashed round it under the antlers, the mark daubed on it
  S.rod([0.5, -0.4, 42], [0.5, -0.4, 54], 4.6, 4.2, CLOTH, 4);
  S.egg([4.4, 3.6, 48], XYZ, [0.8, 0.8, 3.4], () => PAINT, 5);
  S.quad([[3.5, 3.5, 44], [5, 5, 44], [7, 7, 28], [5, 5, 26]], (u, v) => (v > 0.85 && fr(u * 4) < 0.5 ? null : CLOTH[v > 0.5 ? 2 : 3]), 4);
  rope(S, [0.5, -3.8, 54], [6, -9, 40], 0.3, 6, 0.6);
  // a ring of stones round it, and bones, a skull
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    S.egg([Math.cos(a) * 18, Math.sin(a) * 15, 2.4], beamAxes([0, 0, 0], [Math.cos(a), Math.sin(a), 0]), [3.6, 3, 2.6], facetOf(GRANITE, 0), 7);
  }
  for (let i = 0; i < 5; i++) {
    const a = 1 + i * 1.3;
    S.rod([Math.cos(a) * 6, Math.sin(a) * 5, 0.8], [Math.cos(a) * 12, Math.sin(a) * 9, 1.2], 0.8, 0.7, BONE, 8);
  }
  S.ball([8, 4, 2.6], 2.6, BONE, 9);
  // the sickness in the grass round it: dull violet tufts
  for (let i = 0; i < 12; i++) {
    const a = hash(i, 1, 181) * Math.PI * 2;
    const d = 9 + hash(i, 2, 181) * 16;
    S.egg([Math.cos(a) * d, Math.sin(a) * d * 0.8, 1], XYZ, [2.4, 2.4, 1.6], (n) => toneAt(n, SICKV, 0), 10);
  }
  return finish(S, 65, 106);
}

// =================================================================================================

/** THE PINEWOOD'S PIECES: the wood's own; the hunter's; the cult's camp in it; the Stag's shrine. */
export function pinewoodPieces(): Piece[] {
  return [
    { name: 'old pine', kind: 'obstacle', frames: [pineOf(150, 0.2, 3), pineOf(186, 0.22, 7), pineOf(222, 0.24, 11)], shadow: 0.6 },
    { name: 'young pine', kind: 'obstacle', frames: [pineOf(64, 0.08, 5), pineOf(92, 0.1, 9)], shadow: 0.4 },
    { name: 'pine snag', kind: 'obstacle', frames: [snag(2)], shadow: 0.35 },
    { name: 'fallen pine', kind: 'obstacle', frames: [fallenLog()], shadow: 0.7 },
    { name: 'stump', kind: 'obstacle', frames: [stump()], shadow: 0.3 },
    { name: 'mossy boulder', kind: 'obstacle', frames: [mossyBoulder(0, 3), mossyBoulder(1, 7)], shadow: 0.42 },
    { name: 'ferns', kind: 'on the floor', frames: [ferns(0, 3), ferns(1, 8)] },
    { name: 'bilberries', kind: 'on the floor', frames: [bilberries(4)], shadow: 0.25 },
    { name: 'toadstools', kind: 'on the floor', frames: [toadstools()] },
    { name: "a stag's skull and antlers", kind: 'on the floor', frames: [stagSkull()] },
    { name: 'twisted pine', kind: 'obstacle', frames: [twistedPine(2), twistedPine(5)], shadow: 0.5 },
    { name: 'cattails', kind: 'on the floor', frames: [cattails(3)] },
    { name: 'river stones', kind: 'on the floor', frames: [riverStones(5)] },
    { name: 'footbridge', kind: 'floor tile', frames: [footbridge(false), footbridge(true)] },
    { name: "the hunter's cabin", kind: 'obstacle', frames: [cabin()], shadow: 1.2 },
    { name: "the hunter's woodpile", kind: 'breakable', frames: [woodpile(false), woodpile(true)], shadow: 0.35 },
    { name: "the hunter's drying rack", kind: 'obstacle', frames: [dryingRack()], shadow: 0.45 },
    { name: "the hunter's snare", kind: 'trap', frames: [0, 1, 2, 3].map(snareTile) },
    { name: "the hunter's journal", kind: 'quest', frames: [journal()] },
    { name: "the cult's siege tent", kind: 'obstacle', frames: [siegeTent()], shadow: 0.9 },
    { name: 'siege ladders', kind: 'obstacle', frames: [siegeLadders()], shadow: 0.9 },
    { name: 'a battering ram, half built', kind: 'obstacle', frames: [batteringRam()], shadow: 1.0 },
    { name: 'barrels of pitch', kind: 'breakable', frames: [pitchBarrels(false), pitchBarrels(true)], shadow: 0.3 },
    { name: 'felled pines, stacked', kind: 'obstacle', frames: [felledPines()], shadow: 0.9 },
    { name: "the Stag's shrine", kind: 'obstacle', frames: [stagShrine()], shadow: 0.5 },
  ];
}
