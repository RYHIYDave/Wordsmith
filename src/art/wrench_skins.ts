// SKINS FOR THE TINKERER'S WRENCH (14 Nov 2026): the game's four unique wrenches drawn in her hand, as the Mage's unique staves
// are in hers (art/staff_skins.ts) and the Ranger's bows in his (art/bow_skins.ts). His word, 14 Nov 2026, of the Mage's staves
// done: “then do it for the rest of the cast”; asked whether to start, his pick: “Start the rest of the cast (Recommended)”.
// PICTURES FIRST: nothing of the game draws these until he has seen them on her and said yes. Shown them
// (docs/mockups/wrench_skins/pictures/wrenches_moves.mp4), 14 Nov 2026: “Yes, all four (Recommended)”. In the game behind
// art/heroes.ts WRENCH_SKINS, ON at his yes to her holding them in play (by 21:25): “Yes, switch them on (Recommended)”.
//
// Her wrench is a skin laid on where it is (dev/sculpt_tinkerer.ts WrenchAt, WrenchSkin; her own wrench PLAIN_WRENCH, painted
// exactly as before). Each of these is drawn to its picture in the bag (art/items_unique.ts), the same wrench in the hand:
//   THE SECOND WHISTLE: her wrench, its grip wrapped red, two brass whistles hung from it on red cords.
//   TARWRENCH: its jaw clotted with green paste, a run of it down the shaft, a vial stuck fast in it.
//   THE FOREMAN'S WRENCH: its shaft striped yellow and black, a brass gear at its throat, a brass star on its jaw.
//   THE BORROWED SPANNER (the levelling unique of floor 13): an old tin-grey spanner, someone else's name tag tied on.
// Nothing glows. Each keeps its parts as `wrench` and a `jaw` (her ponytail swings clear of them).

import { hash } from './kit';
import type { Ramp } from './kit';
import { add, cross, mul, norm } from './skeleton';
import type { V3 } from './skeleton';
import type { Sculpt } from '../dev/sculpt';
import { PLAIN_WRENCH } from '../dev/sculpt_tinkerer';
import type { WrenchAt, WrenchSkin } from '../dev/sculpt_tinkerer';
import type { WrenchId } from './heroes';

/** Where a wrench's parts go: its head's middle, across its jaw, square to both. */
interface Laid {
  w1: V3;
  side: V3;
  flat: V3;
}

/** A wrench's shaft and jaw, as her own (the gap of the jaw carved out), in the materials given. */
function wrenchOf(sc: Sculpt, at: WrenchAt, shaft: number, jaw: number, thick = 1): Laid {
  const { c, d, way, len, k } = at;
  const w1 = add(c, mul(way, len));
  sc.cone(shaft, 'wrench', add(c, mul(way, -1.8 * k)), w1, 0.75 * k * thick, 0.85 * k * thick, 0.2, { tag: 'shaft' });
  const side = norm(cross(way, d));
  const flat = norm(cross(way, side));
  sc.box(jaw, 'wrench', add(w1, mul(way, 1.0 * k)), [mul(way, 1.35 * k), mul(side, 2.0 * k), mul(flat, 0.7 * k)], 0.4, 0.3, { tag: 'jaw' });
  sc.box(jaw, 'wrench', add(w1, mul(way, 1.9 * k)), [mul(way, 0.9 * k), mul(side, 0.7 * k), mul(flat, 1.0 * k)], 0.1, 0, { tag: 'gap', carve: true });
  return { w1, side, flat };
}
/** Straight down in the world. */
const DOWN: V3 = [0, 0, -1];

// ---------------------------------------------------------------------------------------------
// THE SECOND WHISTLE (game/uniques.ts `secondwhistle`: “One more Golem than she would have.”)

const BRASS_W: Ramp = ['#3a2410', '#5e4018', '#94702a', '#d0a84a', '#f6e08a'];
const CORD: Ramp = ['#3a0a0c', '#621418', '#962424', '#c43c34', '#e8705a'];

/** Her wrench, its grip wrapped red; two brass whistles hung from its shaft below the jaw on red cords. */
export const WHISTLE_WRENCH: WrenchSkin = {
  id: 'secondwhistle',
  name: 'The Second Whistle',
  sculpt(sc, at, { steel }) {
    const cord = sc.mat({ ramp: CORD, crease: 0.3 });
    const brass = sc.mat({ ramp: BRASS_W, crease: 0.25 });
    const { side } = wrenchOf(sc, at, steel, steel);
    const { c, way, len, k } = at;
    // (the grip: a red wrap round the shaft at her fist)
    sc.cone(cord, 'wrench', add(c, mul(way, -1.9 * k)), add(c, mul(way, 1.6 * k)), 0.98 * k, 1.02 * k, 0.15, { tag: 'grip' });
    // (two whistles, each on a cord tied round the shaft below the jaw, one either side, hung down beside it however she holds
    // it: a brass tube with a mouthpiece)
    for (const [along, out, drop] of [[0.78, 1, 2.0], [0.62, -1, 2.8]] as const) {
      const from = add(c, add(mul(way, len * along), mul(side, out * 0.8 * k)));
      const to = add(from, add(mul(DOWN, drop * k), mul(side, out * 1.0 * k)));
      sc.cone(cord, 'wrench', from, to, 0.24 * k, 0.24 * k, 0.1, { tag: 'cord' });
      const wy = norm(add(mul(side, out * 0.8), mul(DOWN, 0.6)), DOWN);
      sc.cone(brass, 'wrench', add(to, mul(wy, -0.4 * k)), add(to, mul(wy, 2.6 * k)), 0.85 * k, 0.75 * k, 0.2, { tag: 'whistle' });
      sc.box(brass, 'wrench', add(to, mul(wy, 3.1 * k)), [mul(wy, 0.6 * k), mul(norm(cross(wy, way), side), 0.45 * k), mul(way, 0.3 * k)], 0.1, 0.1, { tag: 'mouth' });
    }
  },
};

// ---------------------------------------------------------------------------------------------
// TARWRENCH (game/uniques.ts `stickywrench`: “Vials stick to what they hit and burst a moment later, twice as wide.”)

const PASTE: Ramp = ['#0c2a10', '#1a4a18', '#2e7a22', '#56b03a', '#9ee070'];
const GLASS_T: Ramp = ['#0a2a3a', '#124a5c', '#1e7488', '#4aa8b4', '#a6e2e2'];
const CORK: Ramp = ['#2a1808', '#4a2c12', '#7a4e24', '#a8784a', '#d0a878'];

/** Her wrench, its jaw clotted with green paste and a run of it down the shaft, a vial stuck fast in the paste. */
export const TAR_WRENCH: WrenchSkin = {
  id: 'stickywrench',
  name: 'Tarwrench',
  sculpt(sc, at, { steel }) {
    const paste = sc.mat({ ramp: PASTE, crease: 0.2, paint: (h) => (hash(h.x, h.y, 13) < 0.08 ? PASTE[4] : null) });
    const glass = sc.mat({ ramp: GLASS_T, crease: 0.2 });
    const cork = sc.mat({ ramp: CORK, crease: 0.3 });
    const { w1, side, flat } = wrenchOf(sc, at, steel, steel);
    const { way, len, k, c } = at;
    // (the paste: lumps over the jaw, both faces, and runs down the shaft)
    const lumps: [number, number, number, number][] = [[0.6, 0.9, 0.5, 1.1], [1.4, -1.0, 0.4, 1.0], [0.1, -0.3, -0.6, 0.9], [1.0, 1.6, -0.3, 0.8], [-0.6, 0.3, 0.4, 0.8]];
    for (const [a, b, f, r] of lumps) sc.ell(paste, 'wrench', add(w1, add(mul(way, a * k), add(mul(side, b * k), mul(flat, f * k)))), [mul(way, r * k), mul(side, r * 1.1 * k), mul(flat, r * 0.8 * k)], 0.6, { tag: 'paste' });
    for (const [along, r] of [[0.82, 0.75], [0.66, 0.6]] as const) sc.ell(paste, 'wrench', add(c, add(mul(way, len * along), mul(flat, 0.5 * k))), [mul(way, r * 1.6 * k), mul(side, r * k), mul(flat, r * k)], 0.5, { tag: 'paste' });
    // (the vial stuck in it, slanting out of the jaw, corked)
    const vy = norm(add(mul(way, 0.5), mul(side, 0.85)), side);
    const v0 = add(w1, add(mul(way, 0.9 * k), mul(side, 0.6 * k)));
    sc.cone(glass, 'wrench', v0, add(v0, mul(vy, 2.6 * k)), 0.75 * k, 0.65 * k, 0.3, { tag: 'vial' });
    sc.ell(cork, 'wrench', add(v0, mul(vy, 3.0 * k)), [mul(vy, 0.5 * k), mul(side, 0.55 * k), mul(flat, 0.55 * k)], 0.2, { tag: 'cork' });
  },
};

// ---------------------------------------------------------------------------------------------
// THE FOREMAN'S WRENCH (game/uniques.ts `foremanswrench`: “Whenever you toss a vial, each of your Golems lobs one as well.”)

const HAZARD_Y: Ramp = ['#3a2a06', '#6a4e0c', '#a8821a', '#e0b630', '#f8e070'];
const HAZARD_K: Ramp = ['#08080c', '#121218', '#1e1e28', '#2e2e3c', '#46465a'];

/** Its shaft striped yellow and black as a foreman's gear is, its jaw dark; a brass gear at its throat, a brass star on its jaw. */
export const FOREMAN_WRENCH: WrenchSkin = {
  id: 'foremanswrench',
  name: "The Foreman's Wrench",
  sculpt(sc, at) {
    const { c, way, len, k } = at;
    const from = add(c, mul(way, -1.8 * k));
    const long = len + 1.8 * k;
    const stripes = sc.mat({ ramp: HAZARD_Y, crease: 0.25, paint: (h) => {
      // (the stripes: bands across the shaft, slanted, a band of yellow, a band of black)
      const t = (h.p[0] - from[0]) * way[0] + (h.p[1] - from[1]) * way[1] + (h.p[2] - from[2]) * way[2];
      const band = Math.floor((t / long) * 9 + h.p[2] * 0.12);
      return band % 2 === 0 ? null : HAZARD_K[Math.max(0, Math.min(4, h.tone))];
    } });
    const dark = sc.mat({ ramp: HAZARD_K, crease: 0.3 });
    const brass = sc.mat({ ramp: BRASS_W, crease: 0.25 });
    const { w1, side, flat } = wrenchOf(sc, at, stripes, dark);
    // (the gear at its throat: a brass ring of teeth round the shaft just below the jaw)
    const g = add(c, mul(way, len - 1.4 * k));
    sc.cone(brass, 'wrench', add(g, mul(way, -0.35 * k)), add(g, mul(way, 0.35 * k)), 1.35 * k, 1.35 * k, 0.15, { tag: 'gear' });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const out = add(mul(side, Math.cos(a)), mul(flat, Math.sin(a)));
      sc.box(brass, 'wrench', add(g, mul(out, 1.55 * k)), [mul(out, 0.35 * k), mul(norm(cross(out, way)), 0.3 * k), mul(way, 0.32 * k)], 0.05, 0.05, { tag: 'tooth' });
    }
    // (the star on its jaw: five points of brass on its face, out toward whoever looks)
    for (const fl of [1, -1]) {
      const s0 = add(w1, add(mul(way, 0.9 * k), mul(flat, fl * 0.75 * k)));
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + Math.PI / 2;
        const out = add(mul(way, Math.sin(a)), mul(side, Math.cos(a)));
        sc.cone(brass, 'wrench', s0, add(s0, mul(out, 1.15 * k)), 0.42 * k, 0.08 * k, 0.05, { tag: 'star' });
      }
    }
  },
};

// ---------------------------------------------------------------------------------------------
// THE BORROWED SPANNER (game/uniques.ts `borrowedspanner`, the levelling unique of floor 13: faster, nimbler)

const TIN: Ramp = ['#2a2e36', '#464c56', '#6c727c', '#9aa0a8', '#cdd2d8'];
const LINEN: Ramp = ['#4a4236', '#746a56', '#a49a80', '#d0c8ac', '#f2ecd6'];
const STRING: Ramp = ['#3a3024', '#5a4c38', '#7e6c52', '#a8946e', '#ccb88e'];

/** An old tin-grey spanner, a little thinner than hers, and someone else's name tag tied on near its head with string. */
export const BORROWED_WRENCH: WrenchSkin = {
  id: 'borrowedspanner',
  name: 'The Borrowed Spanner',
  sculpt(sc, at) {
    const tin = sc.mat({ ramp: TIN, crease: 0.3, paint: (h) => (hash(h.x, h.y, 19) < 0.07 ? TIN[Math.max(0, h.tone - 1)] : null) });
    const linen = sc.mat({ ramp: LINEN, crease: 0.2, paint: (h) => (h.prim.tag === 'tag' && h.y % 3 === 0 && hash(h.x, h.y, 7) < 0.6 ? LINEN[1] : null) });
    const string = sc.mat({ ramp: STRING, crease: 0.2 });
    const { side } = wrenchOf(sc, at, tin, tin, 0.85);
    const { c, way, len, k } = at;
    // (the tag: on a string from the shaft just below the jaw, hung down, a little card)
    const from = add(c, add(mul(way, len * 0.8), mul(side, 0.8 * k)));
    const to = add(from, add(mul(DOWN, 1.8 * k), mul(side, 1.2 * k)));
    sc.cone(string, 'wrench', from, to, 0.18 * k, 0.18 * k, 0.1, { tag: 'string' });
    const across = norm(side, [1, 0, 0]);
    sc.box(linen, 'wrench', add(to, mul(DOWN, 1.3 * k)), [mul(across, 1.6 * k), mul(DOWN, 1.15 * k), mul(norm(cross(across, DOWN), at.u), 0.2 * k)], 0.2, 0.15, { tag: 'tag' });
  },
};

/** Each unique wrench's skin, by the id of its place (art/heroes.ts WrenchId). */
export const WRENCH_SKIN_OF: Readonly<Record<WrenchId, WrenchSkin>> = { secondwhistle: WHISTLE_WRENCH, stickywrench: TAR_WRENCH, foremanswrench: FOREMAN_WRENCH, borrowedspanner: BORROWED_WRENCH };

/** The skins of her wrench, her own first. */
export const WRENCH_SKIN_LIST: readonly WrenchSkin[] = [PLAIN_WRENCH, WHISTLE_WRENCH, TAR_WRENCH, FOREMAN_WRENCH, BORROWED_WRENCH];
