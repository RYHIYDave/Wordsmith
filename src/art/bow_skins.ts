// SKINS FOR THE RANGER'S BOW (14 Nov 2026): the game's four unique bows drawn in his hand, as the Mage's unique staves are in
// hers (art/staff_skins.ts). His word, 14 Nov 2026, of the Mage's staves done: “then do it for the rest of the cast”; asked
// whether to start, his pick: “Start the rest of the cast (Recommended)”. PICTURES FIRST: nothing of the game draws these until
// he has seen them on him and said yes. Shown them (docs/mockups/bow_skins/pictures/bows_moves.mp4, bows_stills.png), 14 Nov 2026:
// “Yes, all four (Recommended)”. In the game by art/heroes.ts BOW_SKINS, ON at his yes to him holding them in play (by 20:06):
// “Yes, switch them on (Recommended)”.
//
// His bow is a skin laid on where it is (art/ranger_up.ts BowAt, BowSkin; his own bow PLAIN_BOW, painted exactly as before).
// Each of these is drawn to its picture in the bag (art/items_unique.ts), the same bow in the hand:
//   THE RAINWALKER: a storm-grey bow with a rain cloud caught on its tip, raining.
//   THREEFOLD (`fan`): pale wood bound in brass, three arrows on the string at once, spread.
//   THE POACHER'S BOW: a rough bow with a trap's teeth along it and a snare hung from its tip.
//   THE FLEDGLING (the levelling unique of floor 5): a young green bow, leaves still sprouting from its limbs.
// Nothing glows but what glowed already: his string the friend's cyan; the rain is rain.

import { BROWN, LEAF, hash } from './kit';
import type { Ramp } from './kit';
import { BOW_HALF } from './moves3';
import { PLAIN_BOW } from './ranger_up';
import type { BowAt, BowSkin } from './ranger_up';
import { add, cross, mul, norm } from './skeleton';
import type { V3 } from './skeleton';
import type { Sculpt } from '../dev/sculpt';
import type { BowId } from './heroes';
import { five } from './warrior_up';

/** A point on a quadratic curve from `a` through the pull of `c` to `b`. */
const bez = (a: V3, c: V3, b: V3, k: number): V3 => add(add(mul(a, (1 - k) * (1 - k)), mul(c, 2 * k * (1 - k))), mul(b, k * k));

/** Along one limb of a bow, from the grip (k 0) to its tip (k 1): where it is, and the way it runs there. */
interface LimbAt {
  at: (k: number) => V3;
  along: (k: number) => V3;
}

/**
 * THE LIMBS OF A BOW, as his own are laid (art/ranger_up.ts PLAIN_BOW): each from the grip through the pull of a point
 * forward along it to its tip, the tip curled forward, a nock on the curl; `thick` how thick at the grip and at the tip, `curl`
 * whether the tip is curled forward. Its nocks (the upper's first), and each limb, to lay things along.
 */
function limbs(sc: Sculpt, at: BowAt, mat: number, thick: [number, number] = [1.35, 0.73], curl = true): { nocks: V3[]; limb: LimbAt[] } {
  const { grip, p3, ac, tipOf } = at;
  const nocks: V3[] = [];
  const limb: LimbAt[] = [];
  for (const sgn of [1, -1] as const) {
    const ctl = add(grip, add(mul(ac, sgn * BOW_HALF * 0.72), mul(p3, 0.6)));
    const t = tipOf(sgn);
    const N = 7;
    let last: V3 = add(grip, mul(ac, sgn * 1.4));
    for (let i = 1; i <= N; i++) {
      const k = i / N;
      const pt = bez(grip, ctl, t, k);
      sc.cone(mat, 'bow', last, pt, thick[0] - (thick[0] - thick[1]) * ((i - 1) / N), thick[0] - (thick[0] - thick[1]) * k, 0.6, { tag: 'limb' });
      last = pt;
    }
    let nock = t;
    if (curl) {
      const c = add(t, add(mul(ac, sgn * 1.1), mul(p3, 1.5)));
      sc.cone(mat, 'bow', t, c, thick[1], thick[1] * 0.75, 0.5, { tag: 'limb' });
      nock = c;
    }
    sc.ell(mat, 'bow', nock, [mul(ac, 0.6), mul(p3, 0.6), mul(norm(cross(ac, p3)), 0.6)], 0.2, { tag: 'nock' });
    nocks.push(nock);
    limb.push({
      at: (k) => bez(grip, ctl, t, k),
      along: (k) => norm(add(mul(sub3(ctl, grip), 2 * (1 - k)), mul(sub3(t, ctl), 2 * k)), ac),
    });
  }
  return { nocks, limb };
}
const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

/** The grip, wrapped: his own leather, or another. */
function gripOf(sc: Sculpt, at: BowAt, mat: number, r = 1.5): void {
  sc.cone(mat, 'bowgrip', add(at.grip, mul(at.ac, 2.0)), add(at.grip, mul(at.ac, -2.0)), r, r, 0.3, { tag: 'grip' });
}

// ---------------------------------------------------------------------------------------------
// THE RAINWALKER (game/uniques.ts `rainwalker`: “Volley no longer rains on a spot: it rains around you and moves with you.”)

const STORM: Ramp = ['#1a1e2c', '#2a3042', '#434c60', '#646e84', '#97a2b8'];
const CLOUD: Ramp = ['#2e3446', '#4a5266', '#6c768a', '#949eb2', '#c4ccda'];
const RAIN = ['#9cc0e4', '#dcecfa'] as const;

/**
 * A storm-grey bow, a band of darker grey at the grip, and on its upper tip A RAIN CLOUD caught there: a knot of grey cloud round
 * the nock, its underside dark, raining: drops falling from it all the time, whatever he does (in town, on his back, too).
 */
export const RAINWALKER_BOW: BowSkin = {
  id: 'rainwalker',
  name: 'The Rainwalker',
  sculpt(sc, at, { glove }) {
    const wood = sc.mat({ ramp: STORM, crease: 0.3, paint: (h) => (h.prim.tag === 'nock' ? STORM[Math.min(4, h.tone + 1)] : STORM[Math.max(0, Math.min(4, h.tone))]) });
    const cloud = sc.mat({ ramp: CLOUD, crease: 0.15, paint: (h) => (h.prim.tag === 'under' ? CLOUD[Math.max(0, Math.min(2, h.tone - 1))] : CLOUD[Math.max(1, Math.min(4, h.tone + 1))]) });
    const { nocks } = limbs(sc, at, wood);
    gripOf(sc, at, glove);
    // (the cloud: a knot of puffs round the upper nock, wide every way so it reads as a cloud from any side, its top lumpy, a
    // flat dark underside below; level whichever way the bow is held, as cloud is)
    const top = nocks[0];
    const up: V3 = [0, 0, 1];
    const side = norm(cross(up, at.p3), at.ac);
    const fwd = norm(cross(side, up), at.p3);
    const puffs: [number, number, number, number][] = [
      [0, 0, 1.9, 2.4], [2.6, 0.6, 1.2, 2.0], [-2.5, -0.5, 1.1, 1.9], [0.6, 2.6, 1.0, 1.9], [-0.4, -2.6, 1.0, 1.9],
      [1.9, -1.9, 0.6, 1.6], [-1.8, 1.9, 0.6, 1.6],
    ];
    for (const [a, b, u, r] of puffs) {
      const c = add(top, add(mul(side, a), add(mul(fwd, b), mul(up, u))));
      sc.ell(cloud, 'cloud', c, [mul(side, r), mul(fwd, r), mul(up, r * 0.85)], 0.9, { tag: 'cloud' });
    }
    // (its underside: flat and dark, where the rain falls from)
    sc.ell(cloud, 'cloud', add(top, mul(up, 0.1)), [mul(side, 3.6), mul(fwd, 3.6), mul(up, 0.9)], 0.6, { tag: 'under' });
    return { nocks, mats: [wood, cloud] };
  },
  extras(st, at, _lights, d) {
    // THE RAIN: a few drops always falling from under the cloud, straight down the screen, over 9 pixels, then again
    const [cx, cy] = st.at(d.nocks[0]);
    const layer = st.part(st.near(d.nocks[0]) + 0.6);
    const fall = 13;
    for (let i = 0; i < 7; i++) {
      const x = Math.round(cx - 4 + i * 1.35 + (hash(i, 3, 41) - 0.5));
      const k = (at.t * 1.4 + i * 0.29 + hash(i, 5, 43) * 0.5) % 1;
      const y = Math.round(cy + 3 + k * fall);
      layer.set(x, y, RAIN[1]).set(x, y + 1, RAIN[0]).set(x, y + 2, RAIN[0]);
    }
  },
};

// ---------------------------------------------------------------------------------------------
// THREEFOLD (game/uniques.ts `fan`: “Each Shot looses three arrows in a fan.”)

const ASH: Ramp = ['#3a2a1e', '#5e4632', '#8a6c4e', '#b8966e', '#e2c69c'];
const BRASS: Ramp = ['#3e2a0c', '#6a4a16', '#a07a2a', '#d0aa4c', '#f4dc8c'];

/** Pale ash bound in brass: brass caps on its tips and a brass band either side of the grip; three arrows on the string, spread. */
export const THREEFOLD_BOW: BowSkin = {
  id: 'threefold',
  name: 'Threefold',
  fan: [0, -24, 24],
  sculpt(sc, at, { glove }) {
    const wood = sc.mat({ ramp: ASH, crease: 0.3, paint: (h) => ASH[Math.max(0, Math.min(4, h.tone))] });
    const brass = sc.mat({ ramp: BRASS, crease: 0.25 });
    const { nocks, limb } = limbs(sc, at, wood);
    gripOf(sc, at, glove);
    for (const sgn of [1, -1] as const) {
      const g = add(at.grip, mul(at.ac, sgn * 2.3));
      sc.cone(brass, 'bowgrip', g, add(g, mul(at.ac, sgn * 0.8)), 1.6, 1.5, 0.2, { tag: 'band' });
    }
    // (brass caps on the tips: the last of each limb and its nock)
    for (const l of limb) sc.cone(brass, 'bow', l.at(0.86), l.at(1.0), 0.95, 0.85, 0.3, { tag: 'cap' });
    for (const n of nocks) sc.ell(brass, 'bow', n, [mul(at.ac, 0.75), mul(at.p3, 0.75), mul(norm(cross(at.ac, at.p3)), 0.75)], 0.2, { tag: 'nock' });
    return { nocks, mats: [wood, brass] };
  },
};

// ---------------------------------------------------------------------------------------------
// THE POACHER'S BOW (game/uniques.ts `poachersbow`: “Where a Volley falls, it leaves one of your traps.”)

const ROUGH: Ramp = ['#1a120c', '#2c1e14', '#46301e', '#64462a', '#86643c'];
const TRAP: Ramp = ['#262836', '#3c4052', '#5e6478', '#9aa0b4', '#e4e8f2'];

/**
 * A rough bow of dark, knotted wood, no recurve, a trap's iron teeth set along the back of both limbs, and a SNARE hung from its
 * lower tip: a loop of cord on a short line, swinging a little as he moves.
 */
export const POACHERS_BOW: BowSkin = {
  id: 'poachers',
  name: "The Poacher's Bow",
  sculpt(sc, at, { glove }) {
    const wood = sc.mat({ ramp: ROUGH, crease: 0.4, paint: (h) => {
      // (knots and rough bark here and there)
      if (h.prim.tag === 'limb' && hash(h.x, h.y, 17) < 0.12) return ROUGH[Math.max(0, h.tone - 1)];
      return ROUGH[Math.max(0, Math.min(4, h.tone))];
    } });
    const iron = sc.mat({ ramp: TRAP, crease: 0.3 });
    const { nocks, limb } = limbs(sc, at, wood, [1.45, 0.8], false);
    gripOf(sc, at, glove);
    // (the teeth: three to a limb, standing out from its back, the way the arrow points, each an iron point as a trap's jaw has)
    for (const l of limb) {
      for (const k of [0.36, 0.6, 0.84]) {
        const base = l.at(k);
        const out = norm(add(at.p3, mul(l.along(k), -0.2)), at.p3);
        sc.cone(iron, 'tooth', add(base, mul(out, 0.4)), add(base, mul(out, 4.2)), 1.15, 0.15, 0.15, { tag: 'tooth' });
      }
    }
    return { nocks, mats: [wood, iron] };
  },
  extras(st, at, _lights, d) {
    // THE SNARE: from the lower nock a short line hangs down the screen, and on it a loop of cord, tilted, swinging a little
    const [nx, ny] = st.at(d.nocks[1]);
    const layer = st.part(st.near(d.nocks[1]) + 0.5);
    const sway = Math.sin(at.t * 3.1) * 1.2;
    const cord = BROWN[3];
    const dark = BROWN[1];
    const drop = 4;
    for (let i = 1; i <= drop; i++) layer.set(Math.round(nx + (sway * i) / drop), Math.round(ny + i), cord);
    const cx = nx + sway;
    const cy = ny + drop + 3.2;
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      const x = Math.round(cx + Math.cos(a) * 2.6);
      const y = Math.round(cy + Math.sin(a) * 2.9);
      layer.set(x, y, Math.sin(a) > 0.3 ? dark : cord);
    }
  },
};

// ---------------------------------------------------------------------------------------------
// THE FLEDGLING (game/uniques.ts `fledgling`, the levelling unique of floor 5: faster shots, sharper)

const SAPLING: Ramp = ['#2a2a16', '#44441e', '#66642a', '#8e8a3c', '#c0ba62'];
const SPROUT: Ramp = five(LEAF);

/** A young bow of pale green-gold wood, a little thinner than his own, three bright leaves still sprouting from its limbs. */
export const FLEDGLING_BOW: BowSkin = {
  id: 'fledgling',
  name: 'The Fledgling',
  sculpt(sc, at, { glove }) {
    const wood = sc.mat({ ramp: SAPLING, crease: 0.3, paint: (h) => SAPLING[Math.max(0, Math.min(4, h.tone))] });
    const leaf = sc.mat({ ramp: SPROUT, crease: 0.2, paint: (h) => SPROUT[Math.max(1, Math.min(4, h.tone + 1))] });
    const { nocks, limb } = limbs(sc, at, wood, [1.2, 0.62]);
    gripOf(sc, at, glove);
    const flat = norm(cross(at.ac, at.p3), [0, 0, 1]);
    // (three leaves: two on the upper limb, one on the lower, each out from the back of the limb, tipped along it)
    const leaves: [number, number, number][] = [[0, 0.42, 1], [0, 0.72, -1], [1, 0.56, 1]];
    for (const [li, k, sgn] of leaves) {
      const l = limb[li];
      const base = l.at(k);
      const along = l.along(k);
      const out = norm(add(mul(at.p3, 0.8), mul(flat, 0.6 * sgn)), at.p3);
      const tip = add(base, mul(out, 1.3));
      sc.cone(wood, 'bow', base, tip, 0.35, 0.25, 0.2, { tag: 'stem' });
      const mid = add(tip, add(mul(out, 1.4), mul(along, 0.9)));
      sc.ell(leaf, 'leaf', mid, [mul(norm(add(out, mul(along, 0.6)), out), 1.8), mul(flat, 0.95), mul(norm(cross(out, flat), along), 0.35)], 0.3, { tag: 'leaf' });
    }
    return { nocks, mats: [wood, leaf] };
  },
};

// ---------------------------------------------------------------------------------------------
// TWELVE LEVELING WEAPONS (game/uniques.ts LEVEL3_DEFS; his words, 24 Nov 2026: “we should have 3-4 for each class”, and of a unique
// weapon, “needs a skin to go on the Warrior if he equips it”): each drawn in its hero's hands as its picture in the bag is.

const DRIFT: Ramp = ['#3e362e', '#6a5e50', '#9a8c78', '#c8bca6', '#eee6d4'];
const BLUE_WRAP: Ramp = ['#0c1440', '#16286e', '#2446a8', '#4a74e0', '#9ab8ff'];
const WHITE_FEATHER: Ramp = ['#6a6278', '#a49cb0', '#dcd6e4', '#f2f0f8', '#ffffff'];

/** THE RUNNER'S BOW (level 2: movement speed, dodge). A light bow of pale wood, thinner than his own, a blue grip, a white feather tied at it. */
export const RUNNERS_BOW: BowSkin = {
  id: 'runnersbow',
  name: "The Runner's Bow",
  sculpt(sc, at) {
    const wood = sc.mat({ ramp: DRIFT, crease: 0.3 });
    const wrap = sc.mat({ ramp: BLUE_WRAP, crease: 0.2 });
    const feather = sc.mat({ ramp: WHITE_FEATHER, crease: 0.2, paint: (h) => WHITE_FEATHER[Math.max(2, Math.min(4, h.tone + 1))] });
    const { nocks } = limbs(sc, at, wood, [1.1, 0.55]);
    gripOf(sc, at, wrap, 1.35);
    const flat = norm(cross(at.ac, at.p3), [0, 0, 1]);
    // (the feather: from just under the grip, back and down, flat to the bow)
    const base = add(at.grip, mul(at.ac, -2.4));
    const mid = add(base, add(mul(at.ac, -2.2), mul(at.p3, -1.6)));
    sc.ell(feather, 'leaf', mid, [mul(norm(add(mul(at.ac, -1), mul(at.p3, -0.7)), at.ac), 2.6), mul(flat, 0.9), mul(norm(cross(at.ac, flat), at.p3), 0.3)], 0.3, { tag: 'feather' });
    return { nocks, mats: [wood, wrap, feather] };
  },
};

const EBONY_BOW: Ramp = ['#0c0810', '#1c141e', '#30242e', '#4a3842', '#6e5660'];
const BRASS_BOW: Ramp = ['#3a2410', '#6a4620', '#a07436', '#d0a656', '#f2d892'];

/** THE LONG SHOT (level 11: much more damage, slower). A heavy bow of black wood, thick-limbed and straight at its tips, a brass band on each limb. */
export const LONGSHOT_BOW: BowSkin = {
  id: 'longshot',
  name: 'The Long Shot',
  sculpt(sc, at, { glove }) {
    const wood = sc.mat({ ramp: EBONY_BOW, crease: 0.3 });
    const brass = sc.mat({ ramp: BRASS_BOW, crease: 0.2, paint: (h) => BRASS_BOW[Math.max(1, Math.min(4, h.tone + 1))] });
    const { nocks, limb } = limbs(sc, at, wood, [1.6, 0.9], false);
    gripOf(sc, at, glove, 1.7);
    for (const l of limb) for (const k of [0.34, 0.8]) {
      const c = l.at(k);
      const a = l.along(k);
      sc.cone(brass, 'bow', add(c, mul(a, -0.45)), add(c, mul(a, 0.45)), 1.75 - k * 0.6, 1.75 - k * 0.6, 0.15, { tag: 'band' });
    }
    return { nocks, mats: [wood, brass] };
  },
};

/** Each unique bow's skin, by the id of its place (art/heroes.ts BowId). */
export const BOW_SKIN_OF: Readonly<Record<BowId, BowSkin>> = { rainwalker: RAINWALKER_BOW, threefold: THREEFOLD_BOW, poachers: POACHERS_BOW, fledgling: FLEDGLING_BOW, runnersbow: RUNNERS_BOW, longshot: LONGSHOT_BOW };

/** The skins of his bow, his own first. */
export const BOW_SKIN_LIST: readonly BowSkin[] = [PLAIN_BOW, RAINWALKER_BOW, THREEFOLD_BOW, POACHERS_BOW, FLEDGLING_BOW, RUNNERS_BOW, LONGSHOT_BOW];
