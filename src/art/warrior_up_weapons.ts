// THE WARRIOR'S BATTLE AXE AND WARHAMMER, STEP 1: THEIR LOOKS (the art chat's helper, 9 Nov 2026;
// docs/mockups/warrior_weapons/README.md). A MOCK-UP BEHIND A SWITCH THAT IS OFF: `WARRIOR_WEAPONS`. Nothing of the game
// imports this file (tests/warrior_weapons.test.ts holds it); the pictures are made from it by tools/warrior_weapons_pics.ts.
//
// The owner, 7 Nov 2026, 21:11 (the main chat's board post of 8 Nov, 06:35): “Alright let’s figure out the warrior.  I want his
// skill tree to start with a three branch option to go to Battle Ax, Warhammer, or (insert two handed sword name).  Then he’ll
// need tap and holds, probably swipes for the three weapons.  These will change his current weapon drops as well.  Swords
// become hammers become axes.  I think, it seems crazy to have all three drop when he could only use one at any given time”.
//
// So, before any move is made: THREE TAKES ON EACH WEAPON (A, B, C), each an original design, two-handed and heavy, in his
// world's iron, wood and leather, for him to pick from. Each is SCULPTED in 3D as he is (dev/sculpt.ts) and laid into his own
// sculpture as one picture with his hands (`graft`), so that it is truly turned with him from his eight sides, hides and is
// hidden truly, and is inked where it meets him; what glows on it is the friend's cyan (an axe's honed edge, a hammer's marks),
// as his great sword's blade glows. Held in his rear guard (the dungeon) and on his back (town) as the great sword is, and at
// the top of the wind-up of each weapon's tap (the Cleave, the Smash). The drops (style A, four rarities) are painted beside
// the game's own item pictures: dev/warrior_weapons_items.ts.
//
// THE MOVES COME NEXT, on these very drawings: `paintArmed` paints him at any pose of his bones with any of the six in his
// hands (or on his back), so a move is only its keys.

import type { Light, Px } from '../engine/px';
import { BLADE, INK, hash } from './kit';
import type { Ramp } from './kit';
import { CANVAS3, stage } from './skin';
import type { Stage } from './skin';
import { add, cross, dot, len, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Build, Posed, Skeleton, V3 } from './skeleton';
import { Sculpt, draw, graft, primDist } from '../dev/sculpt';
import type { Hit, Prim } from '../dev/sculpt';
import { KNIGHT_BODY } from './moves3';
import { WU_PLUM, WU_RIM, WU_SPIN, paintWarriorUp, turnedStage } from './warrior_up';
import type { WuAround, WuFrame, WuSide } from './warrior_up';
import { WU_REST, WU_TOWN_REST, plantedFeet } from './warrior_up_moves';

/** THE SWITCH: OFF. Pictures first: nothing of this reaches the game until he has picked his looks and said yes. */
export const WARRIOR_WEAPONS = { on: false };

// ---------------------------------------------------------------------------------------------
// HIS WORLD'S IRON, WOOD AND LEATHER (five tones each, darkest to lightest; light from the upper left). The iron a forged,
// darker cousin of his armour's steel (art/warrior_up.ts WU_STEEL), so the cyan of an edge stands out of it; the haft a dark
// ash; the grip a brown leather, not his plum gloves', so the hands read on it.

export const WW_IRON: Ramp = ['#1a1834', '#2b2856', '#46427f', '#6f6bab', '#aaa6da'];
export const WW_WOOD: Ramp = ['#22130c', '#3a2214', '#5a3620', '#83552e', '#ab7a48'];
/** Blackened iron, for bands and straps that must read against the head. */
export const WW_DARK: Ramp = ['#0e0c20', '#1a1834', '#2a274e', '#423e74', '#6a66a2'];
export const WW_LEATHER: Ramp = ['#24120a', '#3e2214', '#623822', '#8a5632', '#b07a4c'];
/** The cyan of what glows on a friend (kit.ts BLADE: the great sword's own light). */
export const WW_GLOW: Ramp = BLADE;

// ---------------------------------------------------------------------------------------------
// THE SIX TAKES. Each is built in its own space: X along the haft from where his right hand holds it in his guard toward the
// head; Y out from the haft toward an axe's edge (a hammer's striking face); Z the thickness of the head. One unit is one
// picture pixel, as his own bones are (he stands 58 tall; his great sword is 45 from pommel to point).

export type TakeId = 'axeA' | 'axeB' | 'axeC' | 'hammerA' | 'hammerB' | 'hammerC';
export const TAKE_IDS: readonly TakeId[] = ['axeA', 'axeB', 'axeC', 'hammerA', 'hammerB', 'hammerC'];
export type P2 = readonly [number, number];

export interface WeaponTake {
  id: TakeId;
  kind: 'axe' | 'hammer';
  letter: 'A' | 'B' | 'C';
  /** What it is, in a few plain words (for the sheet). */
  name: string;
  /** Where the butt and the top of the haft are along it, and its radius. */
  butt: number;
  top: number;
  hr: number;
  /** Where the grip's leather runs (from, to). */
  grip: readonly [number, number];
  /** The point it turns about as it flies (its balance, toward the head). */
  heart: number;
  /** Lines that glow the friend's cyan, in (X, Y): an axe's cutting edge; a hammer's are its own (`glow`). */
  edges: readonly (readonly P2[])[];
  /** Its head's solids (the haft, its grip and butt are laid by `buildTake` for every take). */
  head(sm: Smith): void;
  /** Where on the head the cyan glows, beyond the edges (a hammer's face, its runes), in its own space. */
  glow?(w: V3, prim: Prim): number;
}

/** The solids of a take being laid, and its stuffs. */
export interface Smith {
  sc: Sculpt;
  iron: number;
  /** blackened iron: bands, straps, rivets */
  dark: number;
  wood: number;
  leather: number;
}

/**
 * A flat plate: a polygon in (X, Y) at height `z`, `t` either side of it, laid as three-cornered sheets. The first melts into
 * what of its stuff was laid before it (`blend`); the rest lie crisp against each other, so the plate is truly flat (melted,
 * each seam between two of them would stand up as a ridge). `bevel`: the plate thinned toward its edge, from `t` at `from`
 * (how far out from the haft, Y, on the side `side`) to `tEdge` at `to`, so it is a wedge that turns in the light.
 */
function plate(sm: Smith, mat: number, piece: string, pts: readonly P2[], t: number, z = 0, tag = 'plate', blend = 0.5, bevel?: { side: 1 | -1; from: number; to: number; tEdge: number }): void {
  let cuts: { n: V3; o: number }[] | undefined;
  if (bevel) {
    const k = (t - bevel.tEdge) / (bevel.to - bevel.from);
    const o = z + t + k * bevel.from;
    const n1: V3 = [0, k * bevel.side, 1];
    const n2: V3 = [0, k * bevel.side, -1];
    const l = len(n1);
    cuts = [{ n: mul(n1, 1 / l), o: o / l }, { n: mul(n2, 1 / l), o: (o - 2 * z) / l }];
  }
  triangulate(pts).forEach(([a, b, c], i) => {
    sm.sc.tri(mat, piece, [pts[a][0], pts[a][1], z], [pts[b][0], pts[b][1], z], [pts[c][0], pts[c][1], z], t, i === 0 ? blend : 0, { tag, cuts });
  });
}
/** A polygon mirrored across the haft (Y to -Y), its points in the same turn. */
const mirrorY = (pts: readonly P2[]): P2[] => pts.map(([x, y]) => [x, -y] as P2).reverse();

/** Cut a simple polygon into three-cornered pieces (ear clipping). */
export function triangulate(pts: readonly P2[]): [number, number, number][] {
  const n = pts.length;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    area += a[0] * b[1] - b[0] * a[1];
  }
  const idx = pts.map((_, i) => i);
  if (area < 0) idx.reverse();
  const cr = (a: P2, b: P2, c: P2): number => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const inTri = (p: P2, a: P2, b: P2, c: P2): boolean => cr(a, b, p) > 1e-9 && cr(b, c, p) > 1e-9 && cr(c, a, p) > 1e-9;
  const out: [number, number, number][] = [];
  let guard = 0;
  while (idx.length > 3 && guard++ < 4 * n) {
    let cut = false;
    for (let i = 0; i < idx.length; i++) {
      const a = idx[(i + idx.length - 1) % idx.length];
      const b = idx[i];
      const c = idx[(i + 1) % idx.length];
      if (cr(pts[a], pts[b], pts[c]) <= 1e-9) continue;
      if (idx.some((j) => j !== a && j !== b && j !== c && inTri(pts[j], pts[a], pts[b], pts[c]))) continue;
      out.push([a, b, c]);
      idx.splice(i, 1);
      cut = true;
      break;
    }
    if (!cut) break;
  }
  if (idx.length === 3) out.push([idx[0], idx[1], idx[2]]);
  return out;
}

/** The distance from a point to a line of points, in the plane. */
function lineDist(p: P2, line: readonly P2[]): number {
  let best = Infinity;
  for (let i = 0; i + 1 < line.length; i++) {
    const a = line[i];
    const b = line[i + 1];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l2 = dx * dx + dy * dy || 1e-9;
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2));
    best = Math.min(best, Math.hypot(p[0] - a[0] - dx * t, p[1] - a[1] - dy * t));
  }
  return best;
}

/** A ring round the haft (a collar, a band): `x` along it, `w` long, `r` round, its two sides cut flat. */
function collar(sm: Smith, x: number, w: number, r: number, piece = 'collar'): void {
  const cuts = [{ n: [1, 0, 0] as V3, o: x + w / 2 }, { n: [-1, 0, 0] as V3, o: -(x - w / 2) }];
  sm.sc.cone(sm.iron, piece, [x - w / 2 - r, 0, 0], [x + w / 2 + r, 0, 0], r, r, 0.25, { tag: 'collar', cuts });
}

// --- THE BATTLE AXES -------------------------------------------------------------------------------------------------

/** The thinning of an axe's blade toward its edge: `t` at the eye, a third of a pixel either side at the edge. */
const bev = (side: 1 | -1, to: number): { side: 1 | -1; from: number; to: number; tEdge: number } => ({ side, from: 2, to, tEdge: 0.3 });

/**
 * AXE A, THE BEARDED AXE: one broad blade, its edge long and swept, its beard hooked far down toward his hands with the
 * hollow under it open; a thick cheek round the eye thinning to the edge; a short squared poll behind.
 */
const AXE_A_EDGE: P2[] = [[34.6, 13.4], [33.0, 14.9], [30.0, 15.8], [26.0, 16.0], [22.0, 15.4], [18.2, 14.0], [14.8, 12.0], [11.6, 9.2]];
const AXE_A_BLADE: P2[] = [
  [23.6, 1.6], [30.8, 1.6], [31.0, 4.6], [31.8, 8.2], ...AXE_A_EDGE,
  [12.6, 7.6], [14.2, 6.4], [16.6, 5.8], [19.4, 5.6], [21.6, 4.6], [22.9, 2.8],
];
const AXE_A: WeaponTake = {
  id: 'axeA', kind: 'axe', letter: 'A', name: 'The bearded axe: one broad blade, its beard hooked down',
  butt: -12.5, top: 32.2, hr: 1.05, grip: [-11.6, 2.2], heart: 20, edges: [AXE_A_EDGE],
  head: (sm) => {
    plate(sm, sm.iron, 'head', AXE_A_BLADE, 1.05, 0, 'blade', 0.5, bev(1, 15.6));
    // the thick cheek round the eye, melting out into the blade
    plate(sm, sm.iron, 'head', [[23.2, 1.5], [31.0, 1.5], [31.5, 5.0], [29.4, 6.6], [24.2, 6.4], [22.2, 4.2]], 1.2, 0, 'cheek', 0.9);
    // the eye round the haft, and the squared poll behind it
    sm.sc.box(sm.iron, 'head', [27.2, 0, 0], [[3.6, 0, 0], [0, 2.2, 0], [0, 0, 1.85]], 0.75, 0.7, { tag: 'eye' });
    sm.sc.box(sm.iron, 'head', [27.4, -3.0, 0], [[2.8, 0, 0], [0, 1.4, 0], [0, 0, 1.6]], 0.55, 0.6, { tag: 'poll' });
    collar(sm, 21.8, 1.4, 1.6);
  },
};

/**
 * AXE B, THE WAR AXE, DOUBLE-BITTED: two flared bits, one each side of the haft, their edges swept out into horns, a narrow
 * waist at the eye, a four-edged spike standing on top.
 */
const AXE_B_EDGE: P2[] = [[36.4, 10.2], [35.2, 11.8], [32.0, 13.1], [27.0, 13.5], [22.0, 13.1], [18.8, 11.8], [17.6, 10.2]];
const AXE_B_BIT: P2[] = [[23.8, 1.6], [30.2, 1.6], [31.2, 3.8], [33.6, 7.2], ...AXE_B_EDGE, [20.4, 7.2], [22.8, 3.8]];
const AXE_B: WeaponTake = {
  id: 'axeB', kind: 'axe', letter: 'B', name: 'The war axe: two bits, one each side, a spike on top',
  butt: -12.5, top: 31.0, hr: 1.05, grip: [-11.6, 2.2], heart: 22, edges: [AXE_B_EDGE, mirrorY(AXE_B_EDGE)],
  head: (sm) => {
    plate(sm, sm.iron, 'head', AXE_B_BIT, 1.0, 0, 'blade', 0.5, bev(1, 13.3));
    plate(sm, sm.iron, 'head', mirrorY(AXE_B_BIT), 1.0, 0, 'blade', 0.5, bev(-1, 13.3));
    const cheek: P2[] = [[23.6, 1.5], [30.4, 1.5], [31.2, 4.8], [22.8, 4.8]];
    plate(sm, sm.iron, 'head', cheek, 1.15, 0, 'cheek', 0.9);
    plate(sm, sm.iron, 'head', mirrorY(cheek), 1.15, 0, 'cheek', 0.9);
    sm.sc.box(sm.iron, 'head', [27.0, 0, 0], [[3.4, 0, 0], [0, 2.1, 0], [0, 0, 1.9]], 0.75, 0.6, { tag: 'eye' });
    // the spike on top
    sm.sc.cone(sm.iron, 'head', [30.4, 0, 0], [38.0, 0, 0], 1.55, 0.2, 0.6, { tag: 'spike' });
    collar(sm, 22.4, 1.4, 1.55);
    collar(sm, 20.0, 0.9, 1.4);
  },
};

/**
 * AXE C, THE CRESCENT AXE, LONG-HAFTED: a great half-moon blade held off the haft by two sockets, the hollow between them
 * open, its horns reaching up past the haft's top and down toward his hands; the longest of the three.
 */
const AXE_C_EDGE: P2[] = [[46.6, 3.6], [44.4, 7.6], [40.8, 10.8], [36.2, 13.2], [31.0, 14.4], [25.8, 14.3], [20.8, 12.9], [17.0, 10.6], [14.4, 7.4]];
const AXE_C_BLADE: P2[] = [
  [24.2, 1.7], [25.8, 5.6], [29.4, 6.9], [33.0, 5.6], [34.6, 1.7], [38.8, 1.7], [41.6, 3.2], ...AXE_C_EDGE,
  [17.0, 5.6], [19.6, 3.6], [20.6, 1.7],
];
const AXE_C: WeaponTake = {
  id: 'axeC', kind: 'axe', letter: 'C', name: 'The crescent axe: a half-moon blade on two sockets, long-hafted',
  butt: -14.5, top: 41.6, hr: 1.0, grip: [-13.6, 2.2], heart: 25, edges: [AXE_C_EDGE],
  head: (sm) => {
    plate(sm, sm.iron, 'head', AXE_C_BLADE, 1.0, 0, 'blade', 0.5, bev(1, 14.2));
    // (the blade thicker at its back, where the sockets hold it)
    plate(sm, sm.iron, 'head', [[20.4, 1.6], [24.4, 1.6], [25.8, 5.0], [22.8, 6.8], [19.4, 5.8]], 1.1, 0, 'cheek', 0.8);
    plate(sm, sm.iron, 'head', [[34.4, 1.6], [39.0, 1.6], [40.8, 4.4], [37.0, 6.2], [33.2, 5.2]], 1.1, 0, 'cheek', 0.8);
    // the two sockets round the haft, and a cap on its top
    sm.sc.box(sm.iron, 'head', [22.5, 0, 0], [[2.0, 0, 0], [0, 1.9, 0], [0, 0, 1.7]], 0.6, 0.5, { tag: 'eye' });
    sm.sc.box(sm.iron, 'head', [36.7, 0, 0], [[2.1, 0, 0], [0, 1.9, 0], [0, 0, 1.7]], 0.6, 0.5, { tag: 'eye' });
    sm.sc.cone(sm.iron, 'head', [41.2, 0, 0], [43.8, 0, 0], 1.35, 0.5, 0.4, { tag: 'cap' });
    collar(sm, 19.4, 1.0, 1.45);
  },
};

// --- THE WARHAMMERS --------------------------------------------------------------------------------------------------

/**
 * HAMMER A, THE MAUL: a squared iron block, its striking face a broad plate standing proud of it with its rim honed bright, a
 * long spike behind; iron straps down the haft from the head.
 */
const HAMMER_A: WeaponTake = {
  id: 'hammerA', kind: 'hammer', letter: 'A', name: 'The maul: a squared iron block, a spike behind',
  butt: -12.5, top: 31.8, hr: 1.1, grip: [-11.6, 2.2], heart: 22, edges: [],
  head: (sm) => {
    sm.sc.box(sm.iron, 'head', [27.0, 0.8, 0], [[4.2, 0, 0], [0, 5.8, 0], [0, 0, 4.1]], 1.0, 0.5, { tag: 'block' });
    // the striking face, a plate a little broader than the block
    sm.sc.box(sm.iron, 'head', [27.0, 7.0, 0], [[4.7, 0, 0], [0, 0.95, 0], [0, 0, 4.6]], 0.5, 0.3, { tag: 'face' });
    // the spike behind, drawn out of the block
    sm.sc.cone(sm.iron, 'head', [27.0, -4.6, 0], [27.0, -13.4, 0], 2.7, 0.25, 0.9, { tag: 'spike' });
    // a cap on top, and the straps down the haft
    sm.sc.box(sm.iron, 'head', [31.6, 0.8, 0], [[0.6, 0, 0], [0, 2.8, 0], [0, 0, 2.6]], 0.4, 0.3, { tag: 'cap' });
    for (const z of [1, -1]) sm.sc.box(sm.dark, 'strap', [20.0, 0, z * 1.5], [[3.6, 0, 0], [0, 0.9, 0], [0, 0, 0.34]], 0.2, 0.2, { tag: 'strap' });
    collar(sm, 16.6, 1.0, 1.6);
  },
  // (the rim of its striking face honed bright)
  glow: (w, prim) => {
    if (prim.tag !== 'face' || w[1] < 6.4) return 0;
    return Math.max(Math.abs(w[0] - 27.0) / 4.7, Math.abs(w[2]) / 4.6) > 0.76 ? 2 : 0;
  },
};

/**
 * HAMMER B, THE BANDED HAMMER: a round iron drum with flat faces, bound in three raised bands of blackened iron (one round
 * each face's rim, one round its middle), a boss glowing in the middle of each face.
 */
const HB_FACE = 5.6;
const HAMMER_B: WeaponTake = {
  id: 'hammerB', kind: 'hammer', letter: 'B', name: 'The banded hammer: a round drum bound in bands',
  butt: -12.5, top: 31.4, hr: 1.1, grip: [-11.6, 2.2], heart: 22, edges: [],
  head: (sm) => {
    const flat = [{ n: [0, 1, 0] as V3, o: HB_FACE }, { n: [0, -1, 0] as V3, o: HB_FACE }];
    sm.sc.cone(sm.iron, 'head', [26.8, -HB_FACE - 2, 0], [26.8, HB_FACE + 2, 0], 4.2, 4.2, 0.4, { tag: 'drum', cuts: flat });
    // the bands: round each face's rim and round the middle
    for (const [y0, y1] of [[HB_FACE - 0.8, HB_FACE + 1], [-HB_FACE - 1, -HB_FACE + 0.8], [-0.5, 0.5]]) {
      // (a ring, its two sides cut flat: a rod's ends are round, and a round end as wide as the drum would swallow it)
      const sides = [{ n: [0, 1, 0] as V3, o: Math.min(y1, HB_FACE) }, { n: [0, -1, 0] as V3, o: -Math.max(y0, -HB_FACE) }];
      sm.sc.cone(sm.dark, 'band', [26.8, y0 - 5, 0], [26.8, y1 + 5, 0], 4.55, 4.55, 0, { tag: 'band', cuts: sides });
    }
    collar(sm, 21.4, 1.2, 1.7);
    collar(sm, 31.0, 1.0, 1.4);
  },
  // (a boss glowing in the middle of each face)
  glow: (w, prim) => {
    if (prim.tag !== 'drum' || Math.abs(w[1]) < HB_FACE - 0.25) return 0;
    const r = Math.hypot(w[0] - 26.8, w[2]);
    return r < 1.2 ? 2 : r < 2.0 ? 1 : 0;
  },
};

/** The runes cut into hammer C's face and sides: strokes in (X, Z) on its face, (X, Y) on its sides. His own marks, no
 * alphabet's: a diamond and its stroke on the face; chevrons and a stroke on each side. */
const RUNES_FACE: readonly (readonly P2[])[] = [
  [[27.0, -3.0], [29.6, 0], [27.0, 3.0], [24.4, 0], [27.0, -3.0]],
  [[27.0, -1.2], [27.0, 1.2]],
];
export const RUNES_SIDE: readonly (readonly P2[])[] = [
  [[24.0, 4.4], [25.6, 2.2], [24.0, 0]],
  [[30.0, 4.4], [28.4, 2.2], [30.0, 0]],
  [[27.0, 5.6], [27.0, -2.6]],
];
/**
 * HAMMER C, THE RUNE HAMMER: a head that flares out to a broad square face, runes cut deep into the face and its sides and
 * burning the friend's cyan, a blunt peen behind.
 */
const HAMMER_C: WeaponTake = {
  id: 'hammerC', kind: 'hammer', letter: 'C', name: 'The rune hammer: a flared head, runes cut in its face',
  butt: -12.5, top: 32.2, hr: 1.1, grip: [-11.6, 2.2], heart: 22, edges: [],
  head: (sm) => {
    // the head, flaring from a narrow peen behind (Y -6) to its broad face (Y 7): a block cut back on its four sides
    const C: V3 = [27.0, 0.5, 0];
    const HW = 5.0;
    const YF = 7.0;
    const flare = 0.22;
    const cuts = ([[1, 0], [-1, 0], [0, 1], [0, -1]] as const).map(([sx, sz]) => {
      const n = norm([sx, flare, sz]);
      const on: V3 = [C[0] + sx * HW, YF, sz * HW];
      return { n, o: dot(n, on) };
    });
    sm.sc.box(sm.iron, 'head', C, [[5.3, 0, 0], [0, 6.6, 0], [0, 0, 5.3]], 0.6, 0.4, { tag: 'flared', cuts });
    // the face, standing a little proud, and the blunt peen
    sm.sc.box(sm.iron, 'head', [27.0, 7.6, 0], [[5.0, 0, 0], [0, 0.6, 0], [0, 0, 5.0]], 0.5, 0.3, { tag: 'face' });
    sm.sc.cone(sm.iron, 'head', [27.0, -5.6, 0], [27.0, -8.4, 0], 2.7, 2.2, 0.5, { tag: 'peen' });
    sm.sc.cone(sm.iron, 'head', [32.0, 0, 0], [34.4, 0, 0], 1.4, 0.35, 0.4, { tag: 'cap' });
    collar(sm, 20.8, 1.4, 1.65);
    collar(sm, 18.6, 0.9, 1.45);
  },
  glow: (w, prim) => {
    const near = (p: P2, lines: readonly (readonly P2[])[]): number => Math.min(...lines.map((l) => lineDist(p, l)));
    if (prim.tag === 'face' && w[1] > 7.9) return near([w[0], w[2]], RUNES_FACE) < 0.6 ? 2 : 0;
    if ((prim.tag === 'flared' || prim.tag === 'face') && Math.abs(w[2]) > 2.8) return near([w[0], w[1]], RUNES_SIDE) < 0.55 ? 2 : 0;
    return 0;
  },
};

export const TAKES: Readonly<Record<TakeId, WeaponTake>> = { axeA: AXE_A, axeB: AXE_B, axeC: AXE_C, hammerA: HAMMER_A, hammerB: HAMMER_B, hammerC: HAMMER_C };

/** Each axe's blade in profile, in its own (X, Y): what its picture as an item is drawn from (dev/warrior_weapons_items.ts). */
export const AXE_PROFILES: Readonly<Record<'axeA' | 'axeB' | 'axeC', { blades: readonly (readonly P2[])[]; edges: readonly (readonly P2[])[] }>> = {
  axeA: { blades: [AXE_A_BLADE], edges: [AXE_A_EDGE] },
  axeB: { blades: [AXE_B_BIT, mirrorY(AXE_B_BIT)], edges: [AXE_B_EDGE, mirrorY(AXE_B_EDGE)] },
  axeC: { blades: [AXE_C_BLADE], edges: [AXE_C_EDGE] },
};

// ---------------------------------------------------------------------------------------------
// LAYING A TAKE: its own sculpture, in its own space, and then laid where it is (in his hands, on his back, in the air)

/** Where a take is: the point of it that is X 0 (his right hand's, in his guard), and its X, Y and Z ways, in the figure's space. */
export interface Placed {
  o: V3;
  x: V3;
  y: V3;
  z: V3;
}
/** A place for a take from the way it points and the way its edge faces (made square to each other). */
export function placedAlong(o: V3, point: V3, edge: V3): Placed {
  const x = norm(point, [1, 0, 0]);
  const y = norm(sub(edge, mul(x, dot(edge, x))), [0, 0, 1]);
  return { o, x, y, z: norm(cross(x, y)) };
}
/** A point of a take's own space where it is. */
export function onTake(pl: Placed, w: V3): V3 {
  return add(pl.o, add(mul(pl.x, w[0]), add(mul(pl.y, w[1]), mul(pl.z, w[2]))));
}
/** A point where it is, in the take's own space. */
export function inTake(pl: Placed, p: V3): V3 {
  const v = sub(p, pl.o);
  return [dot(v, pl.x), dot(v, pl.y), dot(v, pl.z)];
}

/**
 * A TAKE, SCULPTED: the haft (dark ash), its leather grip, an iron knob at its butt, then its head. Its iron is painted the
 * friend's cyan along its edges and wherever its `glow` says, told where each point is in its own space (`toW`).
 */
export function buildTake(take: WeaponTake, toW: (p: V3) => V3 = (p) => p): Sculpt {
  const sc = new Sculpt();
  const edgeOf = (h: Hit): number => {
    if (h.prim.tag !== 'blade' && h.prim.tag !== 'cheek' && h.prim.tag !== 'rib') return Infinity;
    const w = toW(h.p);
    return Math.min(...take.edges.map((e) => lineDist([w[0], w[1]], e)));
  };
  const iron = sc.mat({ ramp: WW_IRON, crease: 0.38, paint: (h) => {
    const d = take.edges.length ? edgeOf(h) : Infinity;
    // THE HONED EDGE, glowing the friend's cyan: a bright line at the very edge, a band of the blade's light behind it
    if (d < 0.75) return h.tone >= 2 ? WW_GLOW[4] : WW_GLOW[3];
    if (d < 1.75) return h.tone >= 3 ? WW_GLOW[3] : WW_GLOW[2];
    if (take.glow) {
      const g = take.glow(toW(h.p), h.prim);
      if (g >= 2) return h.tone >= 2 ? WW_GLOW[4] : WW_GLOW[3];
      if (g >= 1) return h.tone >= 3 ? WW_GLOW[3] : WW_GLOW[2];
    }
    // (a band's or a collar's rolled edge, and a cap's crest: a lit line)
    if ((h.prim.tag === 'band' || h.prim.tag === 'collar') && h.tone >= 3) return WW_IRON[4];
    // (a round drum between dark bands lifted a tone, so it reads as bright iron bound in black)
    if (h.prim.tag === 'drum') return WW_IRON[Math.min(4, h.tone + 1)];
    return null;
  } });
  const wood = sc.mat({ ramp: WW_WOOD, crease: 0.3, paint: (h) => {
    // (the grain: a darker streak now and then along the haft)
    const w = toW(h.p);
    return hash(Math.round(w[0] * 0.7), Math.round(Math.atan2(w[2], w[1]) * 2), 11) < 0.12 ? WW_WOOD[Math.max(0, h.tone - 1)] : null;
  } });
  const leather = sc.mat({ ramp: WW_LEATHER, crease: 0.34, paint: (h) => {
    // THE GRIP WRAPPED: a dark line where each turn of the strap lies over the last, running round the haft at a slant
    const w = toW(h.p);
    const a = Math.atan2(w[2], w[1]) / (Math.PI * 2);
    const k = ((w[0] + a * 1.6) / 1.6) % 1;
    return (k < 0 ? k + 1 : k) < 0.24 ? WW_LEATHER[Math.max(0, h.tone - 2)] : null;
  } });
  const dark = sc.mat({ ramp: WW_DARK, crease: 0.3 });
  const sm: Smith = { sc, iron, wood, leather, dark };
  sc.cone(wood, 'haft', [take.butt + 0.6, 0, 0], [take.top, 0, 0], take.hr, take.hr * 0.92, 0.2, { tag: 'haft' });
  sc.cone(leather, 'grip', [take.grip[0], 0, 0], [take.grip[1], 0, 0], take.hr + 0.3, take.hr + 0.3, 0.2, { tag: 'grip' });
  // the butt: an iron knob, a little wider than the grip
  sc.ell(iron, 'butt', [take.butt + 0.2, 0, 0], [[1.25, 0, 0], [0, take.hr + 0.75, 0], [0, 0, take.hr + 0.75]], 0.3, { tag: 'knob' });
  take.head(sm);
  return sc;
}

/**
 * A take laid into another sculpture (his) where it is: its stuffs its own (none melts into his), each point of it moved from
 * its own space to `pl`. Returns how many of the stuffs and solids were his before (what is the take's comes after).
 */
export function layTake(into: Sculpt, take: WeaponTake, pl: Placed): { mats: number; prims: number } {
  const before = { mats: into.mats.length, prims: into.prims.length };
  const from = buildTake(take, (p) => inTake(pl, p));
  graft(into, from, (v) => add(mul(pl.x, v[0]), add(mul(pl.y, v[1]), mul(pl.z, v[2]))), pl.o);
  return before;
}

// ---------------------------------------------------------------------------------------------
// HOW HE HOLDS THEM. In his hands: the take runs through his right hand (X 0) along the way his bones point what is held
// (`s.point`), his left hand on it toward the butt (`lhIn` 3: `lhx` along it), its edge toward `s.across` turned by the pose's
// `wRoll`. On his back: as his great sword is (art/carried.ts), but slung ACROSS his back: the head out over his right shoulder
// blade and beyond, CLEAR OF HIS HELM, the haft down across his back to his left hip, flat against it, its edge out to his right. (Step 1 had
// the head up behind his right shoulder: from behind it stood before his helm, 0% to 9% of it seen, and he read as headless.
// Mended 11 Nov 2026: his helm is seen from every side in town too, as in every move.)

export type Hold = 'guard' | 'town' | 'cleave' | 'smash';

/** Where a take lies on his back, from his chest (forward, left, up) at the root of his neck: the head out past his right shoulder, clear of his helm. */
const BACK_LEAN = 54;
function onHisBack(take: WeaponTake, b: Build, s: Skeleton): Placed {
  const [cf, cl, cu] = s.chest;
  const along = (v: V3): V3 => add(mul(cf, v[0]), add(mul(cl, v[1]), mul(cu, v[2])));
  const a = (BACK_LEAN * Math.PI) / 180;
  const up: V3 = [0, -Math.sin(a), Math.cos(a)];
  const out: V3 = [0, -Math.cos(a), -Math.sin(a)];
  // (the head's heart out past his right shoulder, about the height of the root of his neck: from behind his helm stands clear
  // beside and above it, and from his front-left the head still shows past his shoulder; an axe's wide head a little lower than a
  // hammer's, or its upper bit comes before his helm as he leans into his run; clear of his back, his scarf's knot and the skirt
  // of his tabard; the haft leaning out from him a little toward its butt, as a weapon slung on a strap hangs from it)
  const head: V3 = [-(b.ribDeep + b.pad + 2.3), -b.shoulderHalf * 1.75, take.kind === 'axe' ? -4 : 2];
  const off = 25;
  const lean = 3 * (Math.PI / 180);
  const upL: V3 = norm([Math.sin(lean), up[1], up[2] * Math.cos(lean)]);
  const at: V3 = sub(head, mul(upL, off));
  return placedAlong(add(s.neck, along(at)), along(upL), along(out));
}
/**
 * Where a take is in his hands (`s.point`, `s.across` as his bones have them for the pose). HELD LOW (his guard), his right hand is
 * up the haft (its X 0) and his left at the butt. RAISED OVER HIM (a wind-up: the pose puts his left hand above his right on the
 * haft, `lhx` more than 0), his right hand is at the butt and his left above it: either way no arm has haft running on from its
 * fist the way its forearm comes, which would go up its sleeve.
 */
function inHisHands(take: WeaponTake, s: Skeleton, q: Posed, rightOn = rightHandOn(take, q)): Placed {
  return placedAlong(sub(s.handR, mul(s.point, rightOn)), s.point, s.across);
}
/** The way a take's cutting edge, or its striking face, points where it is (a unit, in the figure's space). */
export function edgeWay(pl: Placed): V3 {
  return pl.y;
}
/** Where his right hand holds a take, along it: up the haft when it is held low, at the butt when it is raised over him. */
export function rightHandOn(take: WeaponTake, q: Posed): number {
  return q.lhIn === 3 && q.lhx > 0 ? take.butt + FROM_BUTT : 0;
}
export function takePlace(take: WeaponTake, b: Build, s: Skeleton, q: Posed, rightOn?: number): Placed {
  return q.stow > 0.5 ? onHisBack(take, b, s) : inHisHands(take, s, q, rightOn);
}

/** How far above his right hand his left is on a haft raised over him: the two fists one above the other. */
export const RAISED_SPREAD = 6;

/**
 * HIS GUARD WITH A HEAVY WEAPON, his rear stance (his legs made true: art/warrior_up_moves.ts WU_REST), as he holds the great
 * sword: both hands at his right hip, the haft trailing back behind him. Raised by his shoulder, so that it is seen from every
 * one of his sides (held low, as the great sword is, it is hidden from down and to the left): the haft rises a little as it
 * trails back, its head at the height of his chest behind him. THE HEAD TURNED EDGE DOWN (his word, 9 Nov 2026: “Have the
 * blades and the hammers point down”; “All the hammers are pointing the wrong way”; his pick, “The edge and the hammer face
 * (Recommended)”): an axe's cutting edge, a hammer's striking face, hangs under the haft and points at the floor (`wRoll` 180:
 * as far down as a head on that haft can turn), never up at the sky or back at his own head; a hammer's spike or peen is up.
 */
export const GUARD_HEAVY: Partial<Bones> = {
  rhIn: 2, rhx: -6, rhy: -12.4, rhz: 33,
  lhIn: 3, lhx: -10.4, lhy: 0, lhz: 0,
  wAz: -162, wEl: 18, wRoll: 180, le: 12, re: 8,
};
/** In town, as the game has him: his arms folded, the weapon on his back (`stow`). */
export const TOWN_HEAVY: Partial<Bones> = { stow: 1 };

/**
 * THE CLEAVE AT THE TOP OF ITS WIND-UP (the axe's tap; held, by his Movement 9): the axe lifted right up over him, both hands
 * above his helm (his right at the butt, his left a fist above it), the haft tipped toward the mark so that ITS EDGE IS TURNED
 * TO WHERE THE BLOW WILL LAND, forward and down (his word, above): a blow about to fall. His body wound round away from the
 * mark, side-on to it, his weight back and sunk on his back leg, his back arched, his eyes on the mark.
 */
export const CLEAVE_TOP: Partial<Bones> = {
  ...plantedFeet(),
  px: -4.2, pz: -7.2, yaw: -46, pitch: -2, roll: 0, twist: -30, bend: -9, side: 4,
  faceTurn: 8, faceUp: -4, faceTilt: 4,
  rhIn: 1, rhx: 10, rhy: 0, rhz: 18,
  lhIn: 3, lhx: RAISED_SPREAD, lhy: 0, lhz: 0,
  wAz: -10, wEl: 52, wRoll: 180, le: 40, re: 30,
};
/**
 * THE SMASH AT THE TOP OF ITS WIND-UP (the hammer's tap; held): the hammer lifted right up over him, both hands above his helm
 * (his right at the butt, his left a fist above it), the haft tipped toward the spot so that ITS STRIKING FACE IS TURNED TO WHERE
 * IT WILL LAND, forward and down, its spike or peen up and back; up on his toes with his back arched, his eyes on the spot.
 */
export const SMASH_TOP: Partial<Bones> = {
  pz: 2.6, yaw: -10, twist: -4, pitch: -4, bend: -13, faceUp: -8,
  lfp: 28, lfz: 2.0, rfp: 28, rfz: 2.0,
  rhIn: 0, rhx: 2, rhy: 8.5, rhz: 21.5,
  lhIn: 3, lhx: RAISED_SPREAD, lhy: 0, lhz: 0,
  wAz: -5, wEl: 52, wRoll: 180, le: 46, re: 40,
};

/**
 * His bones in one of the holds with a take (each from his own stance: his guard's or his town stance's). In his guard HIS LEFT
 * HAND IS AT THE BUTT, the knob just out of his fist; raised for a wind-up his right is, his left a fist's width above it.
 */
export function holdPose(hold: Hold, take?: WeaponTake): Posed {
  const base = hold === 'town' ? WU_TOWN_REST : WU_REST;
  const more = hold === 'guard' ? GUARD_HEAVY : hold === 'town' ? TOWN_HEAVY : hold === 'cleave' ? CLEAVE_TOP : SMASH_TOP;
  const q = { ...base, ...more } as Posed;
  if (take && hold === 'guard') q.lhx = leftHandOn(take);
  return q;
}
/** Where his left hand holds a take in his guard, along it from his right hand: at the butt, its knob just out of his fist. */
export function leftHandOn(take: WeaponTake): number {
  return take.butt + FROM_BUTT;
}
/** How far up from the butt's end the fist that holds the butt is. */
const FROM_BUTT = 2.1;
/** The bones of a hold, solved on his build. */
export function holdBones(hold: Hold, take?: WeaponTake): { q: Posed; s: Skeleton } {
  const q = holdPose(hold, take);
  return { q, s: solve(KNIGHT_BODY, q) };
}

// ---------------------------------------------------------------------------------------------
// HIM, ARMED

/** A frame of him with a take: his frame (art/warrior_up.ts WuFrame), and where the take is and which stuffs are its. */
export interface ArmedFrame extends WuFrame {
  take: WeaponTake;
  placed: Placed;
  /** The stuffs (material numbers) and solids of the take begin here; his are before them. */
  firstMat: number;
  firstPrim: number;
  /** On his back (not in his hands). */
  stowed: boolean;
  /** Nothing of it in his hands or on him (thrown: it is in the air, the game's to draw). */
  empty: boolean;
  /** A second one, in his left hand (Twin Axes), where it is; its solids begin at `secondPrim`. */
  second: Placed | null;
  secondPrim: number;
}

/** What more a frame of him armed may be told (the moves': art/warrior_up_axe_moves.ts). */
export interface ArmedMore {
  /** Where on the haft his right hand is, along it (the take's X): as `rightHandOn` has it, if not given. */
  rightOn?: number;
  /** Nothing in his hands: it is thrown and in the air. */
  empty?: boolean;
  /** A second one, held in his left hand (Twin Axes): where it is. */
  second?: Placed | null;
  /** THE SMEAR OF A STRIKE (Movement 9): where it has just been, newest first (and the second one's, if it too is swung). */
  trail?: readonly Placed[];
  trail2?: readonly Placed[];
}

/**
 * HIM AT A POSE WITH A TAKE, from one of his eight sides: his own sculpted painter (art/warrior_up.ts paintWarriorUp), the take
 * laid into his sculpture where the pose holds it and drawn with him as one picture (his painter's `held`: his great sword left
 * out), with his scarf's roots, the strap of a weapon on his back, the take's cyan lights and, in a strike, its smear.
 */
export function paintArmed(take: WeaponTake, s: Skeleton, q: Posed, side: WuSide, B: Build = KNIGHT_BODY, around: WuAround = {}, rim: string | null = WU_RIM, more: ArmedMore = {}): ArmedFrame {
  const pl = takePlace(take, B, s, q, more.rightOn);
  const away = q.stow > 0.5;
  const empty = !!more.empty && !away;
  const second = more.second ?? null;
  let before = { mats: 0, prims: 0 };
  let secondPrim = -1;
  const [cf, cl] = s.chest;
  const held: NonNullable<WuAround['held']> = {
    lay: (sc) => {
      before = { mats: sc.mats.length, prims: sc.prims.length };
      if (!empty) layTake(sc, take, pl);
      secondPrim = sc.prims.length;
      if (second) layTake(sc, take, second);
    },
    extras: (st, lights) => {
      // (the strap a weapon on his back hangs from, across his chest from his right shoulder to his left hip)
      if (away && st.near(cf) > 0) {
        const a = add(s.shoulderR, add(mul(cf, B.ribDeep * 0.8 + 1.4), mul(cl, 3.4)));
        const b = add(s.waist, add(mul(s.hips[0], B.pelvisDeep * 0.9 + 1.4), mul(s.hips[1], B.pelvisHalf * 0.9)));
        const strap = st.part(lerp3(a, b, 0.5));
        const [x0, y0] = st.at(a);
        const [x1, y1] = st.at(b);
        const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
        for (let i = 0; i <= n; i++) {
          const x = Math.round(x0 + ((x1 - x0) * i) / n - 0.5);
          const y = Math.round(y0 + ((y1 - y0) * i) / n - 0.5);
          strap.set(x, y, WU_PLUM[1]);
          strap.set(x + 1, y, WU_PLUM[3]);
          strap.set(x + 1, y + 1, WU_PLUM[2]);
        }
      }
      // THE SMEAR of a strike, under the take's own light
      if (more.trail && !empty) smearOf(st, take, more.trail, lights, s.head);
      if (more.trail2 && second) smearOf(st, take, more.trail2, lights, s.head);
      // (the take's cyan light, where its edges and marks glow, as the great sword's blade lights what is near it)
      if (!(away && st.near(cf) > 0)) {
        for (const at of [empty ? null : pl, second]) {
          if (!at) continue;
          for (const p of glowPoints(take)) {
            const [x, y] = st.at(onTake(at, p));
            lights.push({ x, y, r: take.kind === 'axe' ? 11 : 9, color: WW_GLOW[3], a: take.kind === 'axe' ? 0.26 : 0.22 });
          }
        }
      }
    },
  };
  const f = paintWarriorUp(s, q, side, B, { ...around, held }, rim);
  return { ...f, take, placed: pl, firstMat: before.mats, firstPrim: before.prims, stowed: away, empty, second, secondPrim };
}

/** How far round the middle of his head no smear is painted (picture pixels: his helm and its snout). */
const HELM_CLEAR = 10.5;
/** Where a take's smear runs along its haft: from a little above his hands to the tip of what is furthest out. */
function smearSpan(take: WeaponTake): readonly [number, number] {
  let hi = take.top;
  for (const e of take.edges) for (const [x] of e) hi = Math.max(hi, x);
  return [2, hi + (take.id === 'axeB' ? 1.6 : 0)];
}

/**
 * THE SMEAR OF A STRIKE WITH A TAKE (his rulebook's Movement 9), MADE AS HIS GREAT SWORD'S IS (art/warrior_up.ts: the measure
 * for it): a crescent of its edge's light along the path its head has swept over the last two frames, widest and brightest
 * just behind the head, thinning and breaking up toward its oldest end, a lit line along its outer rim; and AFTER-IMAGES a third
 * and two thirds of the way back, each a slender copy of the take's own line in a fading copy of its light, laid ON the arc
 * (nothing of them off it). `trail`: where the take has been, newest first. Each stretch of the crescent is painted as near the
 * eye as the head was then, so that a sweep that goes round him is before him where it was before him and behind him where it
 * was behind; and none of it over his helm.
 */
function smearOf(st: Stage, take: WeaponTake, trail: readonly Placed[], lights: Light[], helm: V3): void {
  const n = trail.length;
  if (n < 2) return;
  const [lo, hi] = smearSpan(take);
  const ends = trail.map((pl) => [onTake(pl, [lo, 0, 0]), onTake(pl, [hi, 0, 0])] as const);
  const moved = len(sub(ends[0][1], ends[n - 1][1]));
  if (moved <= 8) return;
  // HIS HELM IS NEVER UNDER THE SMEAR (his rulebook's Animations 4, “The hero and every warning stay in sight”): what of it
  // would lie over his helm is not painted, so that a sweep that passes his head passes behind it
  const [hx, hy] = st.at(helm);
  const clearHelm = (fan: { w: number; h: number; has(x: number, y: number): boolean; erase(x: number, y: number): void }): void => {
    for (let y = Math.max(0, Math.floor(hy - HELM_CLEAR)); y <= Math.min(fan.h - 1, Math.ceil(hy + HELM_CLEAR)); y++) {
      for (let x = Math.max(0, Math.floor(hx - HELM_CLEAR)); x <= Math.min(fan.w - 1, Math.ceil(hx + HELM_CLEAR)); x++) {
        if (Math.hypot(x + 0.5 - hx, y + 0.5 - hy) <= HELM_CLEAR && fan.has(x, y)) fan.erase(x, y);
      }
    }
  };
  const inner = (e: readonly [V3, V3], age: number): V3 => lerp3(e[0], e[1], 0.35 + 0.6 * Math.pow(age, 0.7));
  const old = st.at(ends[n - 1][1]);
  const now = st.at(ends[0][1]);
  const far = Math.hypot(old[0] - now[0], old[1] - now[1]) || 1;
  const CHUNK = Math.max(1, Math.ceil((n - 1) / 4));
  for (let c0 = n - 1; c0 >= 1; c0 -= CHUNK) {
    const c1 = Math.max(1, c0 - CHUNK + 1);
    const fan = st.part(st.near(lerp3(ends[c0][0], ends[c1 - 1][1], 0.6)) - 0.4);
    for (let i = c0; i >= c1; i--) {
      const a = ends[i];
      const b = ends[i - 1];
      const age = (i - 0.5) / (n - 1);
      fan.poly([inner(a, i / (n - 1)), a[1], b[1], inner(b, (i - 1) / (n - 1))].map((p) => st.at(p)), age < 0.3 ? WW_GLOW[3] : age < 0.62 ? WW_GLOW[2] : WW_GLOW[1]);
    }
    for (let i = c1; i <= c0; i++) {
      const age = i / (n - 1);
      if (age > 0.7) break;
      const [x0, y0] = st.at(ends[i - 1][1]);
      const [x1, y1] = st.at(ends[i][1]);
      fan.line(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), age < 0.35 ? WW_GLOW[4] : WW_GLOW[3]);
    }
    // (breaking up toward its oldest end)
    for (let y = 0; y < fan.h; y++) for (let x = 0; x < fan.w; x++) {
      if (!fan.has(x, y)) continue;
      const k = 1 - Math.hypot(x - old[0], y - old[1]) / far;
      if (k > 0.45 && hash(x, y, 7) < (k - 0.45) * 1.6) fan.erase(x, y);
    }
    // THE AFTER-IMAGES that lie in this stretch: the take's own line, slender, from the arc's inner edge out to its tip
    for (const k of [0.34, 0.67]) {
      const i = Math.min(n - 1, Math.max(1, Math.round(k * (n - 1))));
      if (i < c1 || i > c0) continue;
      const age = i / (n - 1);
      const e = ends[i];
      const [x0, y0] = st.at(inner(e, age));
      const [x1, y1] = st.at(e[1]);
      const L = Math.hypot(x1 - x0, y1 - y0);
      if (L < 6) continue;
      const dx = (x1 - x0) / L;
      const dy = (y1 - y0) / L;
      const w = k < 0.5 ? 2.2 : 1.7;
      const tipBack = Math.min(L * 0.3, 4);
      fan.poly([
        [x0 - dy * w, y0 + dx * w],
        [x1 - dx * tipBack - dy * w, y1 - dy * tipBack + dx * w],
        [x1, y1],
        [x1 - dx * tipBack + dy * w, y1 - dy * tipBack - dx * w],
        [x0 + dy * w, y0 - dx * w],
      ], k < 0.5 ? WW_GLOW[3] : WW_GLOW[2]);
      fan.line(Math.round(x0 + dx), Math.round(y0 + dy), Math.round(x1 - dx * (tipBack + 1)), Math.round(y1 - dy * (tipBack + 1)), k < 0.5 ? WW_GLOW[4] : WW_GLOW[3]);
    }
    clearHelm(fan);
  }
  const [lx, ly] = st.at(lerp3(ends[1][0], ends[1][1], 0.8));
  lights.push({ x: lx, y: ly, r: 15, color: WW_GLOW[3], a: 0.34 });
}

/** Where a take's light is (its own space): along its edges, or at the middle of its head. */
export function glowPoints(take: WeaponTake): V3[] {
  if (take.edges.length) return take.edges.map((e) => e[Math.floor(e.length / 2)]).map(([x, y]) => [x, y, 0] as V3);
  return [[take.heart + 4.4, 4, 0]];
}

/** Him in one of the holds with a take, from one of his sides. */
export function paintHold(take: WeaponTake, hold: Hold, side: WuSide, around: WuAround = {}): ArmedFrame {
  const { q, s } = holdBones(hold, take);
  return paintArmed(take, s, q, side, KNIGHT_BODY, around);
}

// ---------------------------------------------------------------------------------------------
// A TAKE ALONE: upright before the eye, its flat toward it (for a close look), or flying flat as it spins when thrown

/**
 * A take alone, drawn as the game's camera sees it: `stand` upright with its flat toward the eye, turned `turn` degrees about
 * its haft; `fly` lying flat in the air (as it spins when he throws it), turned `turn` degrees about its heart. Its floor point
 * at (`ax`, `ay`) of a canvas of `size`.
 */
export function paintAlone(take: WeaponTake, how: 'stand' | 'fly', turn: number, size: { w: number; h: number }, ax: number, ay: number): { px: Px; placed: Placed } {
  const st = stage('front', ax, ay, size);
  const e = st.eye;
  const flatToEye = norm([e[0], e[1], 0], [1, 0, 0]);
  const a = (turn * Math.PI) / 180;
  let pl: Placed;
  if (how === 'stand') {
    // (X up; its edge across the picture, turned about the haft by `turn`)
    const across = norm(cross(flatToEye, [0, 0, 1]));
    const y = add(mul(across, Math.cos(a)), mul(flatToEye, Math.sin(a)));
    const lean = 0.18;
    const x = norm([-across[0] * lean, -across[1] * lean, 1]);
    pl = placedAlong(sub([0, 0, 0], mul(x, take.butt - 2)), x, y);
  } else {
    // (lying flat, its heart 18 above the floor, turned about it: X and Y level, Z straight up)
    const x: V3 = [Math.cos(a), Math.sin(a), 0];
    const y: V3 = [-Math.sin(a), Math.cos(a), 0];
    pl = placedAlong(sub([0, 0, 18], mul(x, take.heart)), x, y);
  }
  const sc = new Sculpt();
  layTake(sc, take, pl);
  const drawn = draw(sc, 'front', ax, ay, size, undefined, null);
  return { px: drawn.px, placed: pl };
}

// ---------------------------------------------------------------------------------------------
// THE CHECKS (for the test and the pictures): nothing through anything, both hands on the haft, the take seen

/** The pieces of him the take may touch: his two fists and their cuffs, which hold it. */
const HOLDING = new Set(['handL', 'handR']);

/** Points inside a take's solids, each with how far its skin is from it there (for whether it passes through him). */
function coreOf(p: Prim): { q: V3; r: number }[] {
  const out: { q: V3; r: number }[] = [];
  if (p.k === 'cone') {
    const L = len(sub(p.b, p.a));
    const n = Math.max(2, Math.ceil(L / 0.5));
    for (let i = 0; i <= n; i++) out.push({ q: lerp3(p.a, p.b, i / n), r: p.ra + ((p.rb - p.ra) * i) / n });
  } else if (p.k === 'tri') {
    for (let i = 0; i <= 6; i++) for (let j = 0; j <= 6 - i; j++) {
      const u = i / 6;
      const v = j / 6;
      out.push({ q: add(p.a, add(mul(sub(p.b, p.a), u), mul(sub(p.c, p.a), v))), r: p.thick });
    }
  } else {
    // (a block or a ball: its middle and points part way out along its axes, each with the least of its half-lengths)
    const r = Math.min(len(p.axes[0]), len(p.axes[1]), len(p.axes[2]));
    out.push({ q: p.c, r });
    for (const ax of p.axes) for (const k of [-0.6, 0.6]) out.push({ q: add(p.c, mul(ax, k)), r: r * 0.5 });
  }
  return out;
}

/**
 * How far from the middle of each fist the haft goes inside his glove: through the fist and its flared cuff, which cover the
 * end of his vambrace. A point of the take as near his fist as this is in his hand; past it, his arm must be clear of it.
 */
export const GRIP_ZONE = 3.0;

/**
 * WHAT OF THE TAKE PASSES THROUGH HIM: every solid of it against every solid of him but the fists that hold it (and, inside
 * each fist's grip, `GRIP_ZONE`, what the glove covers), as deep as `deep` or deeper (picture pixels): each finding names his
 * piece and the take's.
 */
export function armedThrough(f: ArmedFrame, deep = 0.6): string[] {
  const out: string[] = [];
  const his = f.sc.prims.slice(0, f.firstPrim).filter((p) => !p.carve && !HOLDING.has(p.piece));
  const its = f.sc.prims.slice(f.firstPrim);
  const inHand = !f.stowed;
  for (const w of its) {
    let worst = 0;
    let whose = '';
    for (const c of coreOf(w)) {
      if (inHand && (len(sub(c.q, f.s.handL)) < GRIP_ZONE || len(sub(c.q, f.s.handR)) < GRIP_ZONE)) continue;
      for (const p of his) {
        const into = c.r - primDist(p, c.q);
        if (into > worst) {
          worst = into;
          whose = p.piece;
        }
      }
    }
    if (worst >= deep) out.push(`its ${w.piece} (${w.tag ?? w.k}) into his ${whose} by ${worst.toFixed(1)}`);
  }
  return out;
}

/** Whether both his hands are on the haft, within its grip and no further from its line than `near`; what is wrong if not. */
export function handsOnHaft(f: ArmedFrame, near = 1.6): string[] {
  const out: string[] = [];
  for (const [name, h] of [['right', f.s.handR], ['left', f.s.handL]] as const) {
    const w = inTake(f.placed, h);
    const off = Math.hypot(w[1], w[2]);
    if (off > near) out.push(`his ${name} hand ${off.toFixed(1)} off the haft`);
    if (w[0] < f.take.butt + 1 || w[0] > f.take.grip[1] + 1.5) out.push(`his ${name} hand not on the grip (${w[0].toFixed(1)} along it)`);
  }
  return out;
}

/** How many pixels of the take are seen (the picture's own: its stuffs win the pixel), its head's and all of it. */
export function takeSeen(f: ArmedFrame): { head: number; all: number } {
  const its = new Set<number>();
  for (let m = f.firstMat; m < f.sc.mats.length; m++) its.add(m);
  // (its iron is its first stuff, its blackened iron its fourth: the head, collars, bands and knob)
  const iron = f.firstMat;
  const dark = f.firstMat + 3;
  let head = 0;
  let all = 0;
  const st = f.drawn.stuff;
  for (let i = 0; i < st.length; i++) {
    if (!its.has(st[i])) continue;
    all++;
    if (st[i] === iron || st[i] === dark) head++;
  }
  return { head, all };
}

/** (the friend's colours, for the checks: what may glow on him) */
export const WW_FRIEND = [...WW_GLOW, WU_RIM, INK];
